"""Synthesizes the SiteReel soundtrack: an original 128.57 BPM beat plus hook / transition SFX.

Everything is generated from scratch (no samples), so the result is royalty-free.
Timings mirror the SCENES list in src/SiteReel.tsx (30 fps, one beat = 14 frames).

Usage: python3 scripts/make_soundtrack.py  ->  public/audio/soundtrack.wav
"""
import os
import wave

import numpy as np

SR = 44100
FPS = 30
BEAT_FRAMES = 14
BEAT = BEAT_FRAMES / FPS  # seconds
TOTAL_FRAMES = 854

# Scene start frames (Hook, Phone, Drop, Split, Beirut, Reviews, Outro).
HOOK, PHONE, DROP, SPLIT, BEIRUT, REVIEWS, OUTRO = 0, 70, 252, 476, 574, 672, 742
CARD_PER = 28
N_CARDS = 7

rng = np.random.default_rng(7)


def t_of(n):
    return np.arange(int(n)) / SR


def frames(f):
    return f / FPS


def env_exp(n, decay):
    return np.exp(-t_of(n) / decay)


def noise(n):
    return rng.uniform(-1, 1, int(n))


def fft_filter(x, lo=0.0, hi=None):
    """Static band-pass via FFT with soft edges."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def sweep_filter(x, lo_curve, hi_curve, block=2048):
    """Time-varying band-pass using 50% overlap-add of FFT-filtered blocks."""
    hop = block // 2
    win = np.hanning(block)
    out = np.zeros(len(x) + block)
    xp = np.concatenate([x, np.zeros(block)])
    f = np.fft.rfftfreq(block, 1 / SR)
    for start in range(0, len(x), hop):
        k = min(start / max(len(x) - 1, 1), 1.0)
        lo, hi = lo_curve(k), hi_curve(k)
        m = (1 / (1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / (1 + (f / hi) ** 4))
        seg = np.fft.irfft(np.fft.rfft(xp[start:start + block] * win) * m, block)
        out[start:start + block] += seg
    return out[: len(x)]


def saw(freq, n, detune=0.0):
    ph = (t_of(n) * freq * (1 + detune)) % 1.0
    return 2 * ph - 1


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------- instruments ----------

def kick(level=1.0):
    n = int(0.42 * SR)
    t = t_of(n)
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(n, 0.16)
    click = fft_filter(noise(n), lo=2000) * env_exp(n, 0.004) * 0.5
    return np.tanh(1.6 * (body + click)) * level


def clap(level=1.0):
    n = int(0.25 * SR)
    e = np.zeros(n)
    for d in (0, 0.011, 0.022):
        i = int(d * SR)
        e[i:] += env_exp(n - i, 0.012 if d < 0.02 else 0.09)
    return fft_filter(noise(n), lo=900, hi=5000) * e * 0.9 * level


def hat(open_=False, level=1.0):
    n = int((0.18 if open_ else 0.05) * SR)
    return fft_filter(noise(n), lo=7000) * env_exp(n, 0.06 if open_ else 0.012) * 0.35 * level


def bass(midi, dur, level=1.0):
    n = int(dur * SR)
    f = note(midi)
    t = t_of(n)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.15 * saw(f, n)
    a = np.minimum(t / 0.005, 1) * np.exp(-t / (dur * 0.9))
    return np.tanh(1.4 * x * a) * 0.55 * level


def pluck(midis, dur, cutoff=2600, level=1.0):
    n = int(dur * SR)
    x = sum(saw(note(m), n, d) for m in midis for d in (-0.004, 0.004))
    x = fft_filter(x / (2 * len(midis)), hi=cutoff)
    return x * env_exp(n, 0.12) * 0.5 * level


def pad(midis, dur, level=1.0):
    n = int(dur * SR)
    x = sum(saw(note(m), n, d) for m in midis for d in (-0.006, 0.0, 0.006))
    x = fft_filter(x / (3 * len(midis)), hi=900)
    t = t_of(n)
    a = np.minimum(t / 0.4, 1) * np.minimum((dur - t) / 0.3, 1)
    return x * np.clip(a, 0, 1) * 0.45 * level


# ---------- sound effects ----------

def impact(level=1.0):
    n = int(2.0 * SR)
    t = t_of(n)
    f = 38 + 70 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.55)
    crack = fft_filter(noise(n), lo=300, hi=9000) * env_exp(n, 0.09)
    tail = fft_filter(noise(n), hi=1200) * env_exp(n, 0.6) * 0.25
    return np.tanh(1.8 * (boom + 0.7 * crack + tail)) * level


def whoosh(dur=0.45, level=1.0, up=True):
    n = int(dur * SR)
    x = noise(n)
    if up:
        y = sweep_filter(x, lambda k: 200 + 2500 * k, lambda k: 800 + 9000 * k)
    else:
        y = sweep_filter(x, lambda k: 2700 - 2500 * k, lambda k: 9800 - 9000 * k)
    t = np.linspace(0, 1, n)
    a = np.sin(np.pi * t ** (0.6 if up else 1.4)) ** 2
    return y * a * 1.3 * level


def pop(f0=500, f1=1300, level=1.0):
    n = int(0.09 * SR)
    t = t_of(n)
    f = f0 + (f1 - f0) * (1 - np.exp(-t / 0.015))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.03) * 0.8 * level


def slap(level=1.0):
    n = int(0.2 * SR)
    hit = fft_filter(noise(n), lo=600, hi=6000) * env_exp(n, 0.02)
    thump = np.sin(2 * np.pi * 120 * t_of(n)) * env_exp(n, 0.05)
    return (hit + 0.8 * thump) * 0.9 * level


def thud(level=1.0):
    n = int(0.5 * SR)
    t = t_of(n)
    f = 40 + 90 * np.exp(-t / 0.04)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.14)
    paper = fft_filter(noise(n), lo=1500, hi=7000) * env_exp(n, 0.03) * 0.5
    return np.tanh(2 * (body + paper)) * level


def bell(freqs, dur=0.7, level=1.0):
    n = int(dur * SR)
    t = t_of(n)
    x = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.08) for f in freqs)
    return x / len(freqs) * env_exp(n, dur / 3.5) * 0.6 * level


def cha_ching(level=1.0):
    n = int(0.9 * SR)
    out = np.zeros(n)
    rattle = fft_filter(noise(int(0.12 * SR)), lo=3000) * env_exp(int(0.12 * SR), 0.03) * 0.6
    out[: len(rattle)] += rattle
    b = bell([note(88), note(93)], 0.75)
    i = int(0.09 * SR)
    out[i:i + len(b)] += b[: n - i]
    return out * level


def whistle_drop(dur, level=1.0):
    n = int(dur * SR)
    t = t_of(n)
    f = 2200 * (600 / 2200) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(t / 0.03, 1) * 0.35 * level


def riser(dur, level=1.0):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    nz = sweep_filter(noise(n), lambda k: 300 + 4000 * k, lambda k: 1500 + 12000 * k)
    f = 200 * 8 ** t
    tone = saw(1, n) * 0
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (nz + tone) * t ** 2 * level


# ---------- arrangement ----------

N = int(TOTAL_FRAMES / FPS * SR) + SR
music = np.zeros(N)
sfx = np.zeros(N)


def put(buf, x, sec):
    i = int(round(sec * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i]


def put_end(buf, x, sec):
    """Place so the sound ends (peaks) at `sec`."""
    put(buf, x, sec - len(x) / SR)


def beat_sec(b):
    return b * BEAT


# A minor: Am - F - C - G, one chord per bar.
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
ROOTS = [33, 29, 36, 31]

total_beats = TOTAL_FRAMES // BEAT_FRAMES  # 61
sec = {k: v / BEAT_FRAMES for k, v in dict(PHONE=PHONE, DROP=DROP, SPLIT=SPLIT, BEIRUT=BEIRUT, REVIEWS=REVIEWS, OUTRO=OUTRO).items()}
breakdown = (sec['BEIRUT'], sec['OUTRO'])  # beats with no drums
duck = np.ones(N)

for b in range(total_beats + 1):
    s = beat_sec(b)
    bar = (b // 4) % 4
    in_break = breakdown[0] <= b < breakdown[1]
    heavy = sec['DROP'] <= b < sec['SPLIT'] or b >= sec['OUTRO']
    if not in_break and b < total_beats - 1:
        put(music, kick(1.0), s)
        # sidechain duck for bass/chords
        i = int(s * SR)
        d = 1 - 0.75 * np.exp(-t_of(int(0.3 * SR)) / 0.07)
        duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d[: max(0, min(len(d), N - i))])
        if b % 2 == 1:
            put(music, clap(0.9), s)
        for h in range(2):
            put(music, hat(open_=(h == 1), level=0.9 if heavy else 0.7), s + h * BEAT / 2)
        if heavy:
            put(music, hat(level=0.45), s + BEAT / 4)
            put(music, hat(level=0.45), s + 3 * BEAT / 4)
        # offbeat bass
        put(music, bass(ROOTS[bar], BEAT * 0.45), s + BEAT / 2)
        put(music, bass(ROOTS[bar], BEAT * 0.3, level=0.7), s)
        # pluck stabs on a syncopated pattern
        if b % 4 in (0, 1) or (b % 4 == 2 and heavy):
            put(music, pluck([m + 12 for m in CHORDS[bar]], BEAT * 0.5, cutoff=3200 if heavy else 2200), s + (BEAT / 2 if b % 4 == 1 else 0))
    if in_break and (b - int(breakdown[0])) % 4 == 0:
        put(music, pad(CHORDS[bar], BEAT * 4, level=2.2), s)
        put(music, bass(ROOTS[bar], BEAT * 3.5, level=0.8), s)
    if in_break:
        # keep a pulse going under the breakdown: soft hats, then a snare roll into the outro drop
        put(music, hat(level=0.5), s + BEAT / 2)
        if b >= sec['REVIEWS']:
            steps = 2 if b < sec['OUTRO'] - 2 else 4
            for k in range(steps):
                lvl = 0.35 + 0.65 * (b + k / steps - sec['REVIEWS']) / (sec['OUTRO'] - sec['REVIEWS'])
                put(music, clap(lvl), s + k * BEAT / steps)

# Riser across the breakdown into the outro drop.
rise_len = (OUTRO - BEIRUT) / FPS
put_end(music, riser(rise_len, 0.8), frames(OUTRO))

music *= duck[: len(music)]

# --- SFX ---
# Hook: big hit, logo whoosh, sticker slap.
put(sfx, impact(1.0), frames(HOOK))
put(sfx, whoosh(0.35, 0.7, up=False), frames(HOOK + 2))
put(sfx, slap(1.0), frames(HOOK + 21))
put(sfx, pop(700, 1600, 0.6), frames(HOOK + 21))

# Transition whooshes landing on every cut.
for cut in (PHONE, DROP, SPLIT, BEIRUT, REVIEWS):
    put_end(sfx, whoosh(0.4, 0.8), frames(cut) + 0.02)

# Phone: labels pop as the recording reaches Men / Women / New arrivals.
for f in (PHONE + 4, PHONE + 64, PHONE + 106):
    put(sfx, pop(500, 1200, 0.9), frames(f))

# Product drop: card slams + price ding.
for i in range(N_CARDS):
    start = DROP + i * CARD_PER
    put(sfx, thud(0.9), frames(start + 7))
    put(sfx, bell([note(84 + [0, 2, 4, 7, 9, 7, 12][i])], 0.45, 0.55), frames(start + 12))

# Split: two swipes and two slaps.
put(sfx, whoosh(0.3, 0.7, up=False), frames(SPLIT))
put(sfx, whoosh(0.3, 0.7, up=False), frames(SPLIT + 5))
put(sfx, slap(0.8), frames(SPLIT + 16))
put(sfx, slap(0.8), frames(SPLIT + 21))

# Beirut: pin whistles down and lands, sonar pings after.
put(sfx, whistle_drop(frames(10), 0.8), frames(BEIRUT + 12))
put(sfx, thud(0.9), frames(BEIRUT + 22))
for k in range(3):
    put(sfx, bell([note(81)], 0.5, 0.3), frames(BEIRUT + 22 + 30 * k))

# Reviews: five ascending star dings.
for i, m in enumerate((76, 79, 81, 84, 88)):
    put(sfx, bell([note(m)], 0.5, 0.5), frames(REVIEWS + 10 + 4 * i))

# Outro: drop hit, logo slam, cha-ching on the URL button.
put(sfx, impact(1.0), frames(OUTRO))
put(sfx, pop(400, 900, 0.7), frames(OUTRO + 16))
put(sfx, cha_ching(0.9), frames(OUTRO + 30))

# Mix, limit, fade out the last half second.
mix = 0.55 * music / (np.max(np.abs(music)) + 1e-9) + 0.6 * sfx / (np.max(np.abs(sfx)) + 1e-9)
mix = np.tanh(1.3 * mix) / np.tanh(1.3)
end = int(TOTAL_FRAMES / FPS * SR)
mix = mix[:end]
fade = int(0.6 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)
mix = mix / np.max(np.abs(mix)) * 0.92

stereo = np.stack([mix, mix], axis=1)
os.makedirs('public/audio', exist_ok=True)
with wave.open('public/audio/soundtrack.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print(f'wrote public/audio/soundtrack.wav ({end / SR:.2f}s)')
