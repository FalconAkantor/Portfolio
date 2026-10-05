"""
A calm music bed for the explainer videos, synthesised from scratch (no samples, no licences):
soft pads over Am–F–C–G, a gentle plucked arpeggio and a slow pulse. 4 minutes, loops cleanly.

    python3 scripts/bed.py        → cache/bed.wav (48 kHz stereo)
"""
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48_000
BPM = 84
BEAT = 60 / BPM
BAR = 4 * BEAT
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'cache' / 'bed.wav'

CHORDS = [  # midi notes
    [57, 60, 64, 69],  # Am
    [53, 57, 60, 65],  # F
    [48, 55, 60, 64],  # C
    [55, 59, 62, 67],  # G
]


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def env(n, a, r):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * np.minimum(1, (n / SR - t) / r)
    return np.clip(e, 0, 1)


def pad(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * freq * d * t + p) for d, p in ((1, 0), (1.003, 1.1), (0.997, 2.3), (2.001, 0.4)))
    return x * env(n, 1.4, 1.6) * 0.18


def pluck(freq, dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t)
    return x * np.exp(-t * 4.5) * env(n, 0.004, 0.2) * 0.22


def main():
    bars = int(240 / BAR) // 4 * 4
    total = int(bars * BAR * SR) + SR * 2
    left = np.zeros(total)
    right = np.zeros(total)
    rng = np.random.default_rng(7)
    for b in range(bars):
        chord = CHORDS[b % 4]
        start = int(b * BAR * SR)
        for i, m in enumerate(chord):
            p = pad(hz(m), BAR + 1.6)
            pan = 0.35 + 0.1 * i
            end = min(total, start + len(p))
            left[start:end] += p[: end - start] * (1 - pan)
            right[start:end] += p[: end - start] * pan
        # arpeggio on eighths, a little sparse so it never competes with the voice
        for k in range(8):
            if rng.random() < 0.3:
                continue
            m = chord[[0, 2, 1, 3, 2, 3, 1, 2][k]] + 12
            p = pluck(hz(m))
            s = start + int(k * BEAT / 2 * SR)
            end = min(total, s + len(p))
            pan = 0.3 + 0.4 * (k % 2)
            left[s:end] += p[: end - s] * (1 - pan)
            right[s:end] += p[: end - s] * pan
        # soft low pulse on beats 1 and 3
        for k in (0, 2):
            n = int(0.5 * SR)
            t = np.arange(n) / SR
            kick = np.sin(2 * np.pi * (hz(chord[0] - 12)) * t) * np.exp(-t * 7) * 0.25
            s = start + int(k * BEAT * SR)
            left[s : s + n] += kick
            right[s : s + n] += kick
    sos = butter(2, 5200, 'low', fs=SR, output='sos')
    mix = np.vstack([sosfilt(sos, left), sosfilt(sos, right)])
    mix /= np.max(np.abs(mix)) or 1
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUT, SR, (mix.T * 0.8 * 32767).astype(np.int16))
    print(f'→ {OUT} ({mix.shape[1] / SR:.0f} s)')


if __name__ == '__main__':
    main()
