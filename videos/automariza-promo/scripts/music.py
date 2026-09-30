"""
AUTOMARIZA promo — soundtrack composed in code (no samples, no licences).

120 BPM, A minor (Am – F – C – G, one chord per 2 s bar), 60 s, 48 kHz stereo.
Every hit is placed on the storyboard's clock, so cuts, typing, the dissolve and the
UI beats of each scene land exactly on picture.

    python3 scripts/music.py   ->  assets/audio/soundtrack.wav
"""

import shutil
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48_000
DUR = 60.0
N = int(SR * DUR)
BEAT = 0.5  # 120 BPM
BAR = 2.0
rng = np.random.default_rng(0xA17)

L = np.zeros(N)
R = np.zeros(N)
REV_L = np.zeros(N)  # reverb send
REV_R = np.zeros(N)
DUCK = np.ones(N)  # sidechain gain driven by the kick


# ── helpers ──────────────────────────────────────────────────────────
def t_arr(n):
    return np.arange(n) / SR


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def lp_sweep(x, f_open, f_closed, env):
    """Filter envelope approximated by crossfading an open and a closed low-pass."""
    return lp(x, f_open) * env + lp(x, f_closed) * (1 - env)


def env_adsr(n, a, d, s, r):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    e = np.full(n, s)
    if a:
        e[: min(a, n)] = np.linspace(0, 1, a)[: min(a, n)]
    if d and a < n:
        seg = np.linspace(1, s, d)[: max(0, min(d, n - a))]
        e[a : a + len(seg)] = seg
    if r:
        e[-min(r, n) :] *= np.linspace(1, 0, min(r, n))
    return e


def put(sig, at, gain=1.0, pan=0.0, send=0.0, duck=False):
    """Mix a mono (or (2, n) stereo) signal at time `at` seconds."""
    i = int(at * SR)
    if i >= N:
        return
    if sig.ndim == 1:
        l = sig * np.sqrt(0.5 * (1 - pan))
        r = sig * np.sqrt(0.5 * (1 + pan))
    else:
        l, r = sig
    n = min(len(l), N - i)
    g = gain * (DUCK[i : i + n] if duck else 1.0)
    L[i : i + n] += l[:n] * g
    R[i : i + n] += r[:n] * g
    if send:
        REV_L[i : i + n] += l[:n] * g * send
        REV_R[i : i + n] += r[:n] * g * send


def saw(f, n, phase=0.0):
    return 2 * ((t_arr(n) * f + phase) % 1.0) - 1


# ── instruments ──────────────────────────────────────────────────────
def kick(level=1.0):
    n = int(0.45 * SR)
    t = t_arr(n)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t * 160) * 0.25
    return (body + click) * level


def clap():
    n = int(0.35 * SR)
    t = t_arr(n)
    noise = bp(rng.standard_normal(n), 900, 2600)
    e = np.zeros(n)
    for k, off in enumerate((0.0, 0.011, 0.023)):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: n - i]) * (90 if k < 2 else 16))
    return noise * e * 0.55


def hat(open_=False):
    n = int((0.28 if open_ else 0.07) * SR)
    t = t_arr(n)
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * (9 if open_ else 70)) * 0.32


def tick():
    n = int(0.018 * SR)
    return bp(rng.standard_normal(n), 2500, 6000) * np.exp(-t_arr(n) * 300) * 0.5


def blip(midi, level=0.35):
    n = int(0.32 * SR)
    t = t_arr(n)
    f = hz(midi)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)
    return s * np.exp(-t * 14) * level


def whoosh(length=0.7, up=True, level=0.5):
    n = int(length * SR)
    t = t_arr(n)
    noise = rng.standard_normal(n)
    # sweep a band through the noise in blocks
    out = np.zeros(n)
    blocks = 24
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        p = b / (blocks - 1)
        fc = (400 + 5200 * p) if up else (5600 - 5200 * p)
        out[a:z] = bp(noise[a:z], fc * 0.7, min(fc * 1.4, 20000))
    shape = np.sin(np.pi * np.clip(t / length, 0, 1)) ** 1.5
    return out * shape * level


def riser(length, level=0.4):
    n = int(length * SR)
    t = t_arr(n)
    p = t / length
    noise = hp(rng.standard_normal(n), 1500) * p**2
    f = 200 + 1400 * p**2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * p**3 * 0.3
    return (noise * 0.6 + tone) * level


def impact(level=1.0):
    n = int(2.2 * SR)
    t = t_arr(n)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    crash = hp(rng.standard_normal(n), 3000) * np.exp(-t * 3.0) * 0.35
    return (boom + crash) * level


def pad_chord(notes, length, cutoff=1600, level=0.12):
    n = int(length * SR)
    outl = np.zeros(n)
    outr = np.zeros(n)
    for m in notes:
        f = hz(m)
        outl += saw(f * 0.997, n) + saw(f * 1.004, n, 0.3)
        outr += saw(f * 1.003, n, 0.6) + saw(f * 0.995, n, 0.1)
    e = env_adsr(n, 0.35, 0.3, 0.85, 0.5)
    return np.vstack([lp(outl, cutoff) * e, lp(outr, cutoff) * e]) * level


def bass_note(midi, length, level=0.32):
    n = int(length * SR)
    t = t_arr(n)
    f = hz(midi)
    s = lp_sweep(saw(f, n), 1160, 260, np.exp(-t * 12)) + 0.6 * np.sin(2 * np.pi * f * t)
    return s * env_adsr(n, 0.005, 0.12, 0.7, 0.04) * level


def pluck(midi, level=0.13):
    n = int(0.5 * SR)
    t = t_arr(n)
    f = hz(midi)
    s = lp_sweep(saw(f, n) + 0.5 * saw(f * 2.005, n), 3000, 400, np.exp(-t * 4))
    return s * np.exp(-t * 7) * level


# ── harmony ──────────────────────────────────────────────────────────
# Am, F, C, G — pads voiced around A3, roots in the bass octave.
CHORDS = [
    ([57, 60, 64, 67], 45),  # Am7
    ([53, 57, 60, 64], 41),  # Fmaj7
    ([55, 60, 64, 67], 48),  # C (add G below)
    ([55, 59, 62, 67], 43),  # G
]


def chord_at(bar):
    return CHORDS[bar % 4]


# ── arrangement ──────────────────────────────────────────────────────
def section_pads():
    for bar in range(30):
        start = bar * BAR
        notes, _ = chord_at(bar)
        cutoff = 900 if start < 6 else 1400 if start < 14 else 2200 if start < 50 else 1200
        if 9.6 <= start < 12:
            cutoff = 700
        if start >= 58:
            put(pad_chord([57, 60, 64, 69], 4.0, 1600, 0.07), start, send=0.5)
            continue
        put(pad_chord(notes, BAR + 0.5, cutoff, 0.05 if start >= 6 else 0.07), start, send=0.45, duck=True)


def section_drums():
    for i in range(int(DUR / BEAT)):
        t = i * BEAT
        beat = i % 4
        # intro: no drums; problem: half-time kick + hats; dissolve: drop out
        if t < 6 or 9.6 <= t < 14 or t >= 58:
            continue
        breakdown = 50 <= t < 54
        if 6 <= t < 9.6:
            if beat in (0, 2):
                put(kick(0.8), t)
            put(hat(), t + 0.25, 0.8, pan=0.3)
            continue
        if breakdown:
            if beat == 0:
                put(kick(0.85), t)
            put(hat(), t + 0.25, 0.6, pan=0.3)
            continue
        put(kick(1.0), t)
        if beat in (1, 3):
            put(clap(), t, 0.9, pan=-0.05, send=0.25)
        for s in range(4):
            accent = 1.0 if s == 2 else 0.55
            put(hat(open_=(s == 2 and 44 <= t < 50)), t + s * BEAT / 4, 0.75 * accent, pan=0.35)
    # snare roll into the finale
    for k in range(16):
        tt = 53.0 + k * (1.0 / 16)
        put(clap(), tt, 0.25 + 0.6 * k / 15, send=0.2)


def section_bass():
    for bar in range(30):
        start = bar * BAR
        if start < 6 or 9.6 <= start < 14 or start >= 58:
            continue
        _, root = chord_at(bar)
        pattern = [0, 0, 12, 0, 0, 12, 0, 7] if start >= 14 else [0, 0, 0, 0, 0, 0, 0, 0]
        for k, off in enumerate(pattern):
            t = start + k * BEAT / 2
            if 50 <= start < 54 and k % 4:
                continue
            put(bass_note(root + off, BEAT / 2 * 0.9), t, duck=True)


def section_arp():
    for bar in range(30):
        start = bar * BAR
        if start < 14 or start >= 58:
            continue
        notes, _ = chord_at(bar)
        seq = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12, notes[3] + 12, notes[2] + 24]
        for k, m in enumerate(seq):
            t = start + k * BEAT / 2
            pan = -0.4 if k % 2 else 0.4
            level = 0.1 if 50 <= start < 54 else 0.12
            put(pluck(m, level), t, pan=pan, send=0.35)
            # dotted-eighth echo
            put(pluck(m, level * 0.35), t + 0.375, pan=-pan, send=0.3)


def section_sfx():
    # Hook typing: command then the three headline lines (schedule mirrors hook.html)
    for i in range(len('./construir --con-ia')):
        put(tick(), 0.3 + i * 0.034, 0.45 + 0.2 * rng.random(), pan=rng.uniform(-0.2, 0.2))
    t0 = 1.2
    for word in ('CONSTRUYO', 'SISTEMAS', 'QUE PIENSAN.'):
        for i in range(len(word)):
            put(tick(), t0 + i * 0.055, 0.7 + 0.3 * rng.random(), pan=rng.uniform(-0.25, 0.25))
            put(blip(81 + (i % 3) * 2, 0.05), t0 + i * 0.055)
        t0 += len(word) * 0.055 + 0.12
    g0 = t0 + 0.2  # SISTEMAS rift glitch
    for k in range(6):
        put(hp(rng.standard_normal(int(0.04 * SR)), 1200) * 0.35, g0 + k * 0.05, pan=(-1) ** k * 0.5)
    put(blip(69, 0.4), g0 + 0.3, send=0.4)
    put(blip(76, 0.3), 4.15, send=0.5)
    put(riser(1.6, 0.55), 4.4)
    put(impact(0.9), 6.0, send=0.35)

    # Problem: cards land, the line hits, tension, dust
    for i in range(5):
        put(whoosh(0.35, True, 0.25), 6.25 + i * 0.3, pan=-0.3 + i * 0.15)
        put(kick(0.35), 6.45 + i * 0.3)
    put(impact(0.55), 8.2, send=0.3)
    put(riser(0.9, 0.35), 8.8)
    n = int(2.6 * SR)  # the dissolve: granular hiss drifting right
    t = t_arr(n)
    grains = hp(rng.standard_normal(n), 4000) * (rng.random(n) > 0.985) * 3.0
    hiss = bp(rng.standard_normal(n), 2000, 9000) * 0.25
    shape = np.sin(np.pi * np.clip(t / 2.6, 0, 1))
    pan = np.linspace(-0.7, 0.8, n)
    dust = (grains + hiss) * shape * 0.5
    put(np.vstack([dust * np.sqrt(0.5 * (1 - pan)), dust * np.sqrt(0.5 * (1 + pan))]), 9.65, send=0.5)
    put(blip(64, 0.3), 11.5, send=0.6)
    put(riser(2.2, 0.5), 11.8)
    put(impact(1.0), 14.0, send=0.4)

    # System scenes: a transition whoosh into each cut and a blip on every step
    scenes = [(14, [1.0, 2.3, 3.6]), (20, [0.9, 2.0, 3.6]), (26, [0.8, 2.0, 3.3]), (32, [0.8, 2.2, 3.7]), (38, [0.8, 2.4, 3.7])]
    for start, steps in scenes:
        if start > 14:
            put(whoosh(0.6, False, 0.35), start - 0.35, pan=0.2)
        for k, s in enumerate(steps):
            put(blip([76, 79, 83][k], 0.22), start + s, pan=-0.2 + 0.2 * k, send=0.35)
    put(blip(88, 0.15), 17.6)  # CCTV alert
    put(blip(91, 0.12), 17.72)
    put(whoosh(0.6, False, 0.4), 43.65)
    for i in range(6):  # deck of captures
        put(whoosh(0.4, True, 0.2), 44.3 + i * 0.72, pan=0.5 - 0.15 * i)
    put(whoosh(0.5, False, 0.3), 49.7)
    for i in range(4):  # how I work
        put(blip([69, 72, 76, 81][i], 0.3), 50.4 + i * 0.55 + 0.4, send=0.4)
    put(riser(1.0, 0.45), 53.0)
    put(impact(1.0), 54.0, send=0.45)
    put(blip(81, 0.25), 55.2, send=0.5)  # WhatsApp button


# Sidechain envelope: pads and bass dip after every four-on-the-floor kick
for i in range(int(DUR / BEAT)):
    t = i * BEAT
    if 14 <= t < 50 or 54 <= t < 58:
        a = int(t * SR)
        n = int(0.28 * SR)
        z = min(a + n, N)
        DUCK[a:z] = np.minimum(DUCK[a:z], 1 - 0.55 * np.exp(-t_arr(z - a) * 14))


section_pads()
section_bass()
section_arp()
section_drums()
section_sfx()

# Reverb: exponential noise tail
ir_n = int(2.2 * SR)
ir_t = t_arr(ir_n)
ir_l = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.6)
ir_r = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.6)
ir_l, ir_r = lp(ir_l, 6000), lp(ir_r, 6000)
wet_l = fftconvolve(REV_L, ir_l)[:N] * 0.018
wet_r = fftconvolve(REV_R, ir_r)[:N] * 0.018

mix_l = L + wet_l
mix_r = R + wet_r

# Fade in/out and master
fade_in = np.clip(t_arr(N) / 0.3, 0, 1)
fade_out = np.clip((DUR - t_arr(N)) / 1.6, 0, 1)
master = np.vstack([mix_l, mix_r]) * fade_in * fade_out
master = hp(master, 28)
master = np.tanh(master * 1.25) / np.tanh(1.25)
master *= 0.89 / np.max(np.abs(master))

out = Path(__file__).resolve().parent.parent / 'assets' / 'audio' / 'soundtrack.wav'
out.parent.mkdir(parents=True, exist_ok=True)
wavfile.write(out, SR, (master.T * 32767).astype(np.int16))
# Loudness for the web: -14 LUFS integrated, -1.2 dBTP (EBU R128 via FFmpeg, when available)
if shutil.which('ffmpeg'):
    tmp = out.with_suffix('.norm.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(out), '-af', 'loudnorm=I=-14:TP=-1.2:LRA=9', '-ar', str(SR), str(tmp)], check=True)
    tmp.replace(out)
print(f'{out}  ·  {DUR:.0f}s  ·  -14 LUFS')
