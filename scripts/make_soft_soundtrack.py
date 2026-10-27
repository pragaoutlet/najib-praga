"""Synthesizes the calm SiteFilm soundtrack: a slow, warm electric-piano groove (100 BPM)
with soft drums, sub bass, pad and a little reverb. No samples, so it is royalty-free.

Total length mirrors siteFilmDuration in src/SiteFilm.tsx (884 frames at 30 fps).

Usage: python3 scripts/make_soft_soundtrack.py [frames] [out.wav]
       defaults: 884 frames -> public/audio/soft.wav
"""
import os
import sys
import wave

import numpy as np

SR = 44100
FPS = 30
TOTAL_FRAMES = int(sys.argv[1]) if len(sys.argv) > 1 else 884
OUT = sys.argv[2] if len(sys.argv) > 2 else 'public/audio/soft.wav'
BPM = 100
BEAT = 60 / BPM
DRUMS_IN = 4 * 2  # beats: drums enter after two bars of keys and pad
OUTRO = (744 if TOTAL_FRAMES == 884 else TOTAL_FRAMES - 120) / FPS  # drums drop out, keys ring for the last 4s

rng = np.random.default_rng(3)
N = int(TOTAL_FRAMES / FPS * SR) + 3 * SR


def t_of(n):
    return np.arange(int(n)) / SR


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, hi, lo=0.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (f / hi) ** 4)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * m, len(x))


def put(buf, x, sec):
    i = int(round(sec * SR))
    j = min(len(buf), i + len(x))
    if i < len(buf):
        buf[i:j] += x[: j - i]


def epiano(midis, dur, vel=1.0):
    n = int(dur * SR)
    t = t_of(n)
    x = np.zeros(n)
    for m in midis:
        f = note(m)
        x += np.sin(2 * np.pi * f * t) * np.exp(-t / 1.6)
        x += 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.5)
        x += 0.12 * np.sin(2 * np.pi * f * 7 * t) * np.exp(-t / 0.03)  # tine attack
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    a = np.minimum(t / 0.004, 1) * np.minimum((dur - t) / 0.08, 1)
    return x / len(midis) * trem * np.clip(a, 0, 1) * 0.5 * vel


def pad(midis, dur):
    n = int(dur * SR)
    t = t_of(n)
    x = sum(np.sin(2 * np.pi * note(m) * (1 + d) * t) for m in midis for d in (-0.003, 0, 0.003))
    x += 0.3 * sum(((t * note(m)) % 1 * 2 - 1) for m in midis)
    x = lowpass(x / (4 * len(midis)), 1200)
    a = np.minimum(t / 1.2, 1) * np.minimum((dur - t) / 1.2, 1)
    return x * np.clip(a, 0, 1) * 0.35


def sub(m, dur):
    n = int(dur * SR)
    t = t_of(n)
    a = np.minimum(t / 0.01, 1) * np.minimum((dur - t) / 0.05, 1) * np.exp(-t / 1.2)
    return np.sin(2 * np.pi * note(m) * t) * np.clip(a, 0, 1) * 0.5


def kick():
    n = int(0.35 * SR)
    t = t_of(n)
    f = 48 + 60 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13) * 0.55


def rim():
    n = int(0.08 * SR)
    return lowpass(rng.uniform(-1, 1, n), 4500, 1500) * np.exp(-t_of(n) / 0.012) * 0.22


def shaker(vel):
    n = int(0.07 * SR)
    t = t_of(n)
    a = np.minimum(t / 0.01, 1) * np.exp(-t / 0.025)
    return lowpass(rng.uniform(-1, 1, n), 14000, 6000) * a * 0.12 * vel


def swell(dur):
    n = int(dur * SR)
    x = lowpass(rng.uniform(-1, 1, n), 5000, 400)
    return x * np.linspace(0, 1, n) ** 3 * 0.25


def shimmer():
    out = np.zeros(int(2.5 * SR))
    for i, m in enumerate((81, 84, 88, 91, 93)):
        n = int(1.8 * SR)
        t = t_of(n)
        b = (np.sin(2 * np.pi * note(m) * t) + 0.2 * np.sin(2 * np.pi * note(m) * 2.76 * t) * np.exp(-t / 0.1)) * np.exp(-t / 0.6) * 0.12
        put(out, b, i * 0.09)
    return out


def reverb(x, secs=2.2, mix=0.28):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-t_of(n) / (secs / 5))
    ir = lowpass(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n
    size = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - mix) * x + mix * wet * 0.5


# Am9 - Fmaj7 - Cmaj7 - G6, one chord per bar, voiced around middle C.
CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 55, 59, 64], [55, 59, 62, 64]]
ROOTS = [33, 29, 36, 31]

keys = np.zeros(N)
drums = np.zeros(N)
bassb = np.zeros(N)
sfx = np.zeros(N)

total_beats = int(TOTAL_FRAMES / FPS / BEAT) + 2
for b in range(total_beats):
    s = b * BEAT
    bar = (b // 4) % 4
    pos = b % 4
    chord = CHORDS[bar]
    if pos == 0:
        keys_dur = 1.5 * BEAT
        put(keys, epiano(chord, keys_dur, 0.9), s)
        put(keys, pad(chord, 4 * BEAT + 1.0), s)
        put(bassb, sub(ROOTS[bar], 1.4 * BEAT), s)
    if pos == 1:
        put(keys, epiano(chord[1:], 0.9 * BEAT, 0.55), s + 0.5 * BEAT)
    if pos == 2:
        put(bassb, sub(ROOTS[bar] + 7, 0.6 * BEAT), s + 0.5 * BEAT)
    if pos == 3:
        put(keys, epiano(chord[-2:], 0.8 * BEAT, 0.45), s + 0.5 * BEAT)
    if DRUMS_IN <= b and s < OUTRO:
        if pos in (0, 2):
            put(drums, kick(), s)
        if pos in (1, 3):
            put(drums, rim(), s)
        for k in range(4):
            swing = 0.06 * BEAT if k % 2 else 0
            put(drums, shaker(0.9 if k % 2 == 0 else 0.6), s + k * BEAT / 4 + swing)

# Final ringing chord on the outro.
put(keys, epiano(CHORDS[0], 4.0, 1.0), OUTRO)
put(keys, pad(CHORDS[0], 4.5), OUTRO)
put(bassb, sub(ROOTS[0], 3.0), OUTRO)

put(sfx, swell(2.0), 0.0)
put(sfx, shimmer(), OUTRO + 0.3)

mix = reverb(keys + 0.6 * sfx) + 0.8 * bassb + reverb(drums, 1.2, 0.15)
mix = np.tanh(1.2 * mix / np.max(np.abs(mix)))
end = int(TOTAL_FRAMES / FPS * SR)
mix = mix[:end]
fin = int(0.4 * SR)
mix[:fin] *= np.linspace(0, 1, fin)
fout = int(2.0 * SR)
mix[-fout:] *= np.linspace(1, 0, fout) ** 1.5
mix = mix / np.max(np.abs(mix)) * 0.9

os.makedirs('public/audio', exist_ok=True)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.stack([mix, mix], axis=1) * 32767).astype('<i2').tobytes())
print(f'wrote {OUT} ({end / SR:.2f}s)')
