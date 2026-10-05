"""
AUTOMARIZA promo — voice-over: generate (or take a recording), place it on picture, mix it.

Reads the table in SCRIPT.md (line, at, until, scene, text), makes one clip per line, fits
each clip inside its window, lowers the music under the voice and writes:

    assets/audio/vo/NN.wav       one clip per line (cached; --force to regenerate)
    assets/audio/voiceover.wav   the voice track alone
    assets/audio/soundtrack.wav  music + voice, -14 LUFS (what index.html plays)
    ../../public/video/automariza.es.vtt   captions of what is said

Sources (all free):
    python3 scripts/voice.py --edge                # Microsoft's neural voice «Álvaro» (pip install edge-tts)
    python3 scripts/voice.py --gemini              # Gemini TTS, key in $GEMINI_API_KEY
    python3 scripts/voice.py --recording mi-voz.m4a   # your own reading, 1 s pause between lines
    python3 scripts/voice.py --clips carpeta/        # one ready-made file per line, in order (e.g. alvaro-01.mp3…)

Run scripts/music.py first (it writes assets/audio/music.wav).
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'assets' / 'audio'
VO_DIR = AUDIO / 'vo'
VTT = ROOT.parent.parent / 'public' / 'video' / 'automariza.es.vtt'
SR = 48_000
DUR = 60.0

GEMINI_MODEL = 'gemini-2.5-flash-preview-tts'
GEMINI_VOICE = 'Algieba'  # male, smooth and warm
EDGE_VOICE = 'es-ES-AlvaroNeural'  # male, Spain; Microsoft Edge's read-aloud voice


# ── script ───────────────────────────────────────────────────────────
def read_script():
    text = (ROOT / 'SCRIPT.md').read_text(encoding='utf-8')
    style = re.search(r'^style:\s*"(.+)"\s*$', text, re.M).group(1)
    lines = []
    for m in re.finditer(r'^\|\s*(\d+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\w-]+)\s*\|\s*(.+?)\s*\|\s*$', text, re.M):
        lines.append({'n': int(m[1]), 'at': float(m[2]), 'until': float(m[3]), 'scene': m[4], 'text': m[5]})
    if not lines:
        sys.exit('SCRIPT.md: no lines found in the table')
    return style, lines


# ── audio helpers ────────────────────────────────────────────────────
def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *args], check=True)


def load(path):
    sr, x = wavfile.read(path)
    x = x.astype(np.float64)
    if x.dtype.kind != 'f':
        x /= 32768.0
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        raise ValueError(f'{path}: expected {SR} Hz, got {sr}')
    return x


def save(path, x, stereo=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    y = np.clip(x, -1, 1)
    if stereo and y.ndim == 1:
        y = np.vstack([y, y])
    data = (y.T if y.ndim > 1 else y) * 32767
    wavfile.write(path, SR, data.astype(np.int16))


def polish(src, dst, tempo=1.0):
    """Voice chain: trim silence, clean low rumble, gentle compression, optional speed fit."""
    chain = [
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05',
        'areverse',
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08',
        'areverse',
        'highpass=f=75',
        'afftdn=nf=-25',
        'acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2',
    ]
    if abs(tempo - 1) > 0.005:
        chain.append(f'atempo={tempo:.4f}')
    ffmpeg('-i', str(src), '-af', ','.join(chain), '-ac', '1', '-ar', str(SR), str(dst))


# ── sources ──────────────────────────────────────────────────────────
def gemini_clip(text, style, dst):
    key = os.environ.get('GEMINI_API_KEY')
    if not key:
        sys.exit('GEMINI_API_KEY is not set (create a free key in Google AI Studio, no billing needed).')
    body = {
        'contents': [{'parts': [{'text': f'{style}\n\n{text}'}]}],
        'generationConfig': {
            'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': GEMINI_VOICE}}},
        },
    }
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent'
    for attempt in range(6):
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                res = json.load(r)
            break
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < 5:
                wait = 20 * (attempt + 1)
                print(f'  free-tier limit or busy ({e.code}); waiting {wait}s')
                time.sleep(wait)
                continue
            sys.exit(f'Gemini TTS error {e.code}: {e.read().decode()[:400]}')
    part = res['candidates'][0]['content']['parts'][0]['inlineData']
    pcm = base64.b64decode(part['data'])
    raw = dst.with_suffix('.pcm')
    raw.write_bytes(pcm)
    rate = int(re.search(r'rate=(\d+)', part.get('mimeType', 'rate=24000')).group(1))
    ffmpeg('-f', 's16le', '-ar', str(rate), '-ac', '1', '-i', str(raw), '-ar', str(SR), str(dst))
    raw.unlink()


def edge_clip(text, dst, rate):
    try:
        import asyncio

        import edge_tts
    except ImportError:
        sys.exit('edge-tts is not installed: pip install edge-tts')
    mp3 = dst.with_suffix('.mp3')
    for attempt in range(4):
        try:
            asyncio.run(edge_tts.Communicate(text, EDGE_VOICE, rate=rate).save(str(mp3)))
            break
        except Exception as e:  # network hiccups: the service is free and sometimes busy
            if attempt == 3:
                sys.exit(f'Edge TTS error: {e}')
            time.sleep(5 * (attempt + 1))
    ffmpeg('-i', str(mp3), '-ac', '1', '-ar', str(SR), str(dst))
    mp3.unlink()


def split_recording(path, count):
    """Cut a single reading into `count` clips at its pauses."""
    wav = VO_DIR / 'recording.wav'
    VO_DIR.mkdir(parents=True, exist_ok=True)
    ffmpeg('-i', str(path), '-ac', '1', '-ar', str(SR), str(wav))
    x = load(wav)
    for noise, gap in ((-38, 0.55), (-34, 0.5), (-42, 0.6), (-30, 0.45), (-38, 0.8)):
        out = subprocess.run(['ffmpeg', '-i', str(wav), '-af', f'silencedetect=noise={noise}dB:d={gap}', '-f', 'null', '-'], capture_output=True, text=True).stderr
        starts = [float(v) for v in re.findall(r'silence_start: ([\d.]+)', out)]
        ends = [float(v) for v in re.findall(r'silence_end: ([\d.]+)', out)]
        # speech = gaps between silences
        edges = [0.0] + [v for pair in zip(starts, ends) for v in pair] + [len(x) / SR]
        segs = [(edges[i], edges[i + 1]) for i in range(0, len(edges) - 1, 2) if edges[i + 1] - edges[i] > 0.35]
        if len(segs) == count:
            break
    else:
        sys.exit(f'Found {len(segs)} spoken parts in the recording, expected {count}. Leave ~1 s of silence between lines.')
    clips = []
    for i, (a, b) in enumerate(segs):
        seg = x[max(0, int((a - 0.05) * SR)) : int((b + 0.1) * SR)]
        dst = VO_DIR / f'{i + 1:02d}.src.wav'
        save(dst, seg)
        clips.append(dst)
    return clips


# ── main ─────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument('--edge', action='store_true', help='generate with the free Microsoft voice «Álvaro» (edge-tts)')
    src.add_argument('--gemini', action='store_true', help='generate with Gemini TTS (free tier)')
    src.add_argument('--recording', type=Path, help='a single reading of all lines, 1 s pause between them')
    src.add_argument('--clips', type=Path, help='a folder with one audio file per line, sorted by name')
    ap.add_argument('--force', action='store_true', help='regenerate cached clips')
    ap.add_argument('--rate', default='-4%', help='speaking rate for --edge, e.g. -4%% (calmer) or +5%%')
    ap.add_argument('--duck', type=float, default=0.55, help='music reduction under the voice (0-1)')
    args = ap.parse_args()

    style, lines = read_script()
    VO_DIR.mkdir(parents=True, exist_ok=True)

    if args.recording:
        sources = split_recording(args.recording, len(lines))
    elif args.clips:
        files = sorted(f for f in args.clips.iterdir() if f.suffix.lower() in ('.mp3', '.wav', '.m4a', '.ogg', '.opus'))
        if len(files) != len(lines):
            sys.exit(f'{args.clips}: found {len(files)} audio files, expected {len(lines)} (one per line of SCRIPT.md)')
        sources = []
        for ln, f in zip(lines, files):
            dst = VO_DIR / f'{ln["n"]:02d}.clip.wav'
            ffmpeg('-i', str(f), '-ac', '1', '-ar', str(SR), str(dst))
            sources.append(dst)
    else:
        sources = []
        tag = 'edge' if args.edge else 'gemini'
        for ln in lines:
            dst = VO_DIR / f'{ln["n"]:02d}.{tag}.wav'
            if args.force or not dst.exists():
                print(f'  voice {ln["n"]:02d}: {ln["text"]}')
                if args.edge:
                    edge_clip(ln['text'], dst, args.rate)
                else:
                    gemini_clip(ln['text'], style, dst)
            sources.append(dst)

    voice = np.zeros(int(SR * DUR))
    for ln, src_path in zip(lines, sources):
        out = VO_DIR / f'{ln["n"]:02d}.wav'
        polish(src_path, out)
        length = len(load(out)) / SR
        slot = ln['until'] - ln['at']
        if length > slot:
            tempo = min(length / slot, 1.18)
            polish(src_path, out, tempo)
            length = len(load(out)) / SR
            note = f'  sped up ×{tempo:.2f}' + ('  ⚠ still long — shorten the line' if length > slot + 0.05 else '')
        else:
            note = ''
        clip = load(out)
        i = int(ln['at'] * SR)
        n = min(len(clip), len(voice) - i)
        voice[i : i + n] += clip[:n]
        print(f'  {ln["n"]:02d} {ln["at"]:5.1f}s  {length:4.1f}s / {slot:3.1f}s{note}')

    # Loudness of the voice alone, then the ducked mix.
    peak = np.max(np.abs(voice)) or 1
    voice = voice / peak * 0.9
    save(AUDIO / 'voiceover.wav', voice)

    music = wavfile.read(AUDIO / 'music.wav')[1].astype(np.float64) / 32768.0
    music = music.T if music.ndim > 1 else np.vstack([music, music])
    env = np.abs(voice)
    env = sosfilt(butter(1, 6, 'low', fs=SR, output='sos'), env)  # ~50 ms attack/release
    env = np.clip(env / (np.percentile(env[env > 1e-4], 90) if np.any(env > 1e-4) else 1), 0, 1)
    hold = sosfilt(butter(1, 1.5, 'low', fs=SR, output='sos'), (env > 0.08).astype(float))
    gain = 1 - args.duck * np.clip(hold * 1.4, 0, 1)
    mix = music[:, : len(voice)] * gain + np.vstack([voice, voice]) * 0.95
    tmp = AUDIO / 'soundtrack.pre.wav'
    save(tmp, mix / (np.max(np.abs(mix)) or 1) * 0.9, stereo=True)
    ffmpeg('-i', str(tmp), '-af', 'loudnorm=I=-14:TP=-1.2:LRA=9', '-ar', str(SR), str(AUDIO / 'soundtrack.wav'))
    tmp.unlink()

    # Captions of what is said.
    def ts(t):
        return f'{int(t // 60):02d}:{t % 60:06.3f}'

    cues = ['WEBVTT', '', f'{ts(0)} --> {ts(lines[0]["at"])}', '[música electrónica]', '']
    for ln in lines:
        cues += [f'{ts(ln["at"])} --> {ts(ln["until"])}', ln['text'], '']
    VTT.write_text('\n'.join(cues), encoding='utf-8')
    print(f'→ {AUDIO / "soundtrack.wav"}  ·  captions → {VTT.relative_to(ROOT.parent.parent)}')


if __name__ == '__main__':
    main()
