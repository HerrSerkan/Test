"""Tonspur für "Die Intelligenzfalle": Musik + Effekte (alles synthetisch) + Stimme.

Liest build/timeline.json, build/events.json, build/voice.wav -> schreibt build/audio.wav (Stereo).
"""
import json
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
TL = json.load(open(os.path.join(B, "timeline.json")))
EV = json.load(open(os.path.join(B, "events.json")))
DUR = TL["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(3)
S = [s["start"] for s in TL["sentences"]]
E = [s["end"] for s in TL["sentences"]]


def read_wav(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(1)
    return a


def env_ar(n, a, r):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / r)


def place(buf, t0, sig, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    j = min(len(buf), i + len(sig))
    s = sig[: j - i] * gain
    buf[i:j, 0] += s * (1 - max(0, pan))
    buf[i:j, 1] += s * (1 + min(0, pan))


def lowpass(x, cutoff):
    """einfacher 1-Pol-Tiefpass"""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    # vektorisiert über scipy wäre schneller; hier blockweise mit lfilter-Ersatz
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x)


def hz(note):
    return 440.0 * 2 ** ((note - 69) / 12)


music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

# ---------------------------------------------------------------- Pad (Flächenklang)
# Am(add9) - Fmaj7 - C(add9) - G6, je ~6 s
CHORDS = [[45, 57, 60, 64, 71], [41, 57, 60, 64, 65], [48, 55, 60, 62, 64], [43, 55, 59, 62, 64]]
t = np.arange(N) / SR
pad = np.zeros(N, np.float32)
seg = 6.0
for ci in range(int(DUR / seg) + 2):
    chord = CHORDS[ci % 4]
    t0 = ci * seg - 1.0
    L = int((seg + 2.0) * SR)
    x = np.arange(L) / SR
    e = np.minimum(1, x / 1.5) * np.minimum(1, np.maximum(0, (seg + 2.0 - x)) / 1.5)
    sig = np.zeros(L, np.float32)
    for k, n in enumerate(chord):
        f = hz(n)
        for det in (-0.12, 0.0, 0.13):
            ph = rng.uniform(0, 6.28)
            sig += np.sin(2 * np.pi * f * (1 + det / 100) * x + ph) * (0.5 if k == 0 else 0.28)
            sig += 0.08 * np.sin(2 * np.pi * 2 * f * (1 + det / 100) * x + ph)
    sig *= e * (1 + 0.15 * np.sin(2 * np.pi * 0.2 * x))
    i = int(t0 * SR)
    a, b = max(0, i), min(N, i + L)
    if b > a:
        pad[a:b] += sig[a - i:b - i]
pad = lowpass(pad, 1400).astype(np.float32)

# Lautstärkeverlauf der Musik (dramaturgisch)
def curve(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys).astype(np.float32)

dyn = curve([(0, 0.5), (S[2], 0.45), (S[5], 0.6), (S[7], 0.75), (S[10], 0.55), (S[10] + 1.5, 0.3),
             (S[11], 0.45), (S[14], 0.8), (S[15], 0.9), (E[15], 0.75), (DUR - 1.5, 0.4), (DUR, 0)])
music[:, 0] += pad * dyn * 0.05
music[:, 1] += pad * dyn * 0.05

# Sub-Bass-Puls (langsam, wie Herzschlag) ab der Mitte
for k in np.arange(S[5], E[15] + 1, 60 / 66):
    L = int(0.5 * SR)
    x = np.arange(L) / SR
    s = np.sin(2 * np.pi * 48 * x) * np.exp(-x * 7)
    lvl = 0.12 if k < S[10] or k > S[13] else 0.05
    place(music, k, s, lvl)

# ---------------------------------------------------------------- Klavier-Töne
def pluck(f, L=2.4):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x * 3)
         + 0.12 * np.sin(2 * np.pi * 3 * f * x) * np.exp(-x * 5))
    return (s * env_ar(n, 0.004, 0.9)).astype(np.float32)

ARP = [[69, 72, 76, 79], [65, 69, 72, 76], [67, 72, 74, 76], [67, 71, 74, 79]]
step = 60 / 66
k = 0
tt = S[2]
while tt < E[15] + 1.0:
    chord = ARP[int(tt / seg) % 4]
    note = chord[[0, 2, 1, 3, 2, 1][k % 6]]
    lvl = 0.05 if tt < S[14] else 0.08
    if S[10] - 0.3 < tt < S[11]:
        lvl = 0.0                     # Stille bei der Falle
    place(music, tt, pluck(hz(note)), lvl, pan=0.3 * np.sin(k))
    k += 1
    tt += step

# ---------------------------------------------------------------- Effekte
def boom(L=1.4):
    n = int(L * SR)
    x = np.arange(n) / SR
    f = 38 + 70 * np.exp(-x * 9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.6)
    s += lowpass(rng.normal(0, 1, n), 900) * np.exp(-x * 18) * 0.6
    return s.astype(np.float32)


def clank():
    n = int(0.9 * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) * g for f, d, g in
            [(523, 6, 0.5), (1312, 9, 0.35), (2210, 14, 0.25), (3170, 20, 0.15), (187, 5, 0.4)])
    s += rng.normal(0, 1, n) * np.exp(-x * 60) * 0.4
    return s.astype(np.float32)


def whoosh(L=1.0):
    n = int(L * SR)
    x = np.arange(n) / SR
    e = np.sin(np.pi * x / L) ** 2
    s = lowpass(rng.normal(0, 1, n), 700) * e
    return (s * 3).astype(np.float32)


def tick(f=2400):
    n = int(0.03 * SR)
    x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) * np.exp(-x * 200)).astype(np.float32)


def bell(f):
    n = int(3.5 * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 1.0, 0.6), (2.76, 2.0, 0.25), (5.4, 3.5, 0.12)])
    return (s * np.minimum(1, x / 0.005)).astype(np.float32)


def riser(L=1.2):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = lowpass(rng.normal(0, 1, n), 2500) * (x / L) ** 2.5
    return (s * 2).astype(np.float32)


# Schläge auf die fetten Wörter (erstes fettes Wort je Karte)
for c in TL["cards"]:
    for line in c["lines"]:
        heavy = [tok for tok in line if tok["style"] in ("heavy", "counter")]
        if heavy:
            place(sfx, heavy[0]["s"] - 0.02, boom(), 0.42)
            break

# Riser vor den großen Momenten
for tw in (EV["cageDrops"][1], EV["peakGlow"], EV["begin"]):
    place(sfx, tw - 1.2, riser(1.2), 0.18)

# Käfig fällt
for tc in EV["cageDrops"]:
    place(sfx, tc + 0.15, clank(), 0.22, pan=-0.3)
    place(sfx, tc + 0.32, clank(), 0.12, pan=-0.2)

# Kamerafahrten
cm = sorted(EV["cameraMoves"])
for a, b in zip(cm, cm[1:]):
    if b - a > 0.6:
        place(sfx, a, whoosh(b - a if b - a < 1.6 else 1.6), 0.035)

# Weg des Machers: Schritte und Fehlschläge
for j in EV["journey"]:
    if j["fail"]:
        place(sfx, j["t"], boom(0.7), 0.18, pan=0.2)
        place(sfx, j["t"], tick(900), 0.25, pan=0.2)
    else:
        place(sfx, j["t"], tick(1600), 0.12, pan=0.1)

# Zähler: 1 -> 100 und Tag 001 -> 365
c0 = EV["counter100"]
for i in range(26):
    u = i / 25
    place(sfx, c0 - 0.05 + 0.8 * (1 - (1 - u) ** 3), tick(2600), 0.12)
d0, d1 = EV["days"]
for i in range(30):
    u = i / 29
    place(sfx, d0 + 0.1 + (d1 - d0 - 0.2) * u ** 1.6, tick(3200), 0.06)

# Gipfel: Glocken
for f, dt in ((880, 0), (1108.7, 0.12), (1318.5, 0.24), (1760, 0.36)):
    place(sfx, EV["peakGlow"] + dt, bell(f), 0.06)
# Anfang: tiefer warmer Ton
place(sfx, EV["begin"], bell(220), 0.12)

# ---------------------------------------------------------------- Mischung
voice = read_wav(os.path.join(B, "voice.wav"))[:N]
voice = np.pad(voice, (0, N - len(voice)))
voice = voice / (np.abs(voice).max() + 1e-6) * 0.8
# Ducking: Musik leiser, wenn gesprochen wird
envv = lowpass(np.abs(voice), 4)
envv = envv / (envv.max() + 1e-6)
duck = (1 - 0.45 * np.clip(envv * 4, 0, 1)).astype(np.float32)

mix = music * duck[:, None] + sfx * 0.9 + voice[:, None] * 0.95
# Einfacher Hall für Musik/Effekte (Echos)
for d, g in ((0.083, 0.25), (0.137, 0.18), (0.211, 0.12)):
    k = int(d * SR)
    mix[k:] += (music[:-k] + sfx[:-k] * 0.5) * g * duck[k:, None]
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.1) * 0.89
fade = np.ones(N, np.float32)
fl = int(1.4 * SR)
fade[-fl:] = np.linspace(1, 0, fl)
mix *= fade[:, None]
with wave.open(os.path.join(B, "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", round(DUR, 2), "s")
