"""Tonspur für "Kurden": Stimme + Soundeffekte (synthetisch), keine Musik.

Liest build/voice.wav, build/events.json (node render.js --events) -> schreibt build/audio.wav (Stereo).
"""
import json
import os
import wave

import numpy as np
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
EV = json.load(open(os.path.join(B, "events.json")))
DUR = EV["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(12)
sfx = np.zeros((N, 2), np.float32)


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    return lfilter(b, a, x)


def low(x, f):
    b, a = butter(2, f / (SR / 2))
    return lfilter(b, a, x)


def place(t0, sig, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * gain
    sfx[i:j, 0] += s * (1 - max(0, pan))
    sfx[i:j, 1] += s * (1 + min(0, pan))


def tone(f0, f1, L, decay, harm=(1, 0.3)):
    n = int(L * SR)
    x = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    s = sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm))
    return (s * np.minimum(1, x / 0.004) * np.exp(-x * decay)).astype(np.float32)


def whoosh(L=0.5, lo=300, hi=3000):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.5).astype(np.float32)


def pop():
    n = int(0.12 * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(900 * np.exp(-x * 30) + 300) / SR) * np.exp(-x * 40)
    return (s + band(rng.normal(0, 1, n), 1500, 5000) * np.exp(-x * 120) * 0.3).astype(np.float32)


def click(f=2000):
    n = int(0.04 * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), f * 0.6, min(f * 2.5, 20000)) * np.exp(-x * 180)).astype(np.float32)


def thud(f=1.0, L=0.5):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum((45 + 90 * np.exp(-x * 16)) * f) / SR) * np.exp(-x * 8)
    return s.astype(np.float32)


def davul():
    n = int(0.7 * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-x * 25)) / SR) * np.exp(-x * 6)
    s += low(rng.normal(0, 1, n), 1500) * np.exp(-x * 40) * 0.5
    return s.astype(np.float32)


def chime(f):
    return tone(f, f, 1.2, 4, (1, 0.2, 0.1))


# Szenenwechsel
for ts in EV["scenes"]:
    place(ts - 0.1, whoosh(0.5, 250, 2500), 0.14)
# Karten im Raster
for k, tc in enumerate(EV["cards"]):
    place(tc, pop(), 0.25, [-0.3, 0.3, -0.3, 0.3][k])
place(EV["flagZoom"] - 0.1, whoosh(0.6, 400, 5000), 0.2)
place(EV["flagZoom"] + 0.3, thud(0.9), 0.35)
# Tippen in der Suche, "0 Treffer"
for tt in EV["typing"]:
    place(tt, click(2500 + rng.uniform(-400, 400)), 0.3, 0.1)
place(EV["noHits"], tone(330, 260, 0.35, 6, (1, 0.5, 0.3)), 0.18)
place(EV["noHits"] + 0.18, tone(260, 200, 0.4, 6, (1, 0.5, 0.3)), 0.18)
# Pins, Tags
for tp in EV["pins"]:
    place(tp, tone(880, 1320, 0.18, 14), 0.18)
    place(tp, pop(), 0.2)
for tt in EV["tags"]:
    place(tt, pop(), 0.18)
place(EV["glowRegion"], whoosh(1.2, 150, 1200), 0.2)
place(EV["glowRegion"] + 0.2, chime(523), 0.08)
# Radiergummi wandert
place(EV["eraserMove"] - 0.3, whoosh(0.5, 800, 4000), 0.15)
place(EV["eraserMove"] + 0.3, click(900), 0.4)
# Anruf: Freiton, Sprechblase
place(EV["call"] - 0.1, tone(425, 425, 0.4, 2, (1,)), 0.07)
place(EV["call"] + 0.6, tone(425, 425, 0.4, 2, (1,)), 0.05)
place(EV["bubble"], pop(), 0.3)
# Sprachbaum
for tt in EV["tree"]:
    place(tt, tone(660, 990, 0.25, 10), 0.13)
place(EV["noLink"], tone(220, 180, 0.4, 7, (1, 0.6, 0.3)), 0.16)
# Wörter (Nan, =, Ekmek, 1 Wort)
for k, tw in enumerate(EV["words"]):
    place(tw, pop(), 0.28)
    place(tw + 0.02, tone([784, 784, 1047, 392, 660][k], [784, 784, 1047, 392, 660][k], 0.3, 10), 0.08)
# Döner, Sicherheit
place(EV["doner"] - 0.25, whoosh(0.4, 400, 4000), 0.2)
place(EV["doner"], thud(1.0), 0.45)
s0, s1 = EV["sure"]
n = int((s1 + 0.3 - s0) * SR)
x = np.arange(n) / SR
place(s0, (np.sin(2 * np.pi * np.cumsum(np.linspace(300, 1200, n)) / SR) * 0.3 * np.minimum(1, x / 0.1)).astype(np.float32), 0.08)
place(s1 + 0.3, chime(1318), 0.12)
# Einladung, Gäste, du
place(EV["invite"], whoosh(0.4, 1500, 7000), 0.15)
g0, g1 = EV["guests"]
for k in range(40):
    u = k / 39
    place(g0 - 0.2 + (g1 + 0.3 - g0) * u ** 0.7, click(3000 + 1500 * u), 0.08, rng.uniform(-0.5, 0.5))
for k in range(5):
    place(EV["known"] + k * 0.07, tone(1046 + k * 120, 1046 + k * 120, 0.2, 14, (1,)), 0.06)
place(EV["du"], thud(1.4, 0.3), 0.3)
place(EV["du"], chime(880), 0.1)
# Trommel: Davul-Schläge im Takt
tb = EV["drum"]
k = 0
while tb + k * 0.55 < EV["drumEnd"]:
    place(tb + k * 0.55, davul(), 0.55 if k % 2 == 0 else 0.4)
    k += 1
# Kette bildet sich: leises Klirren
c0, c1 = EV["chain"]
for tt in np.arange(c0, c1 + 0.4, 0.09):
    place(tt, tone(3200 + rng.uniform(-300, 300), 3200, 0.08, 40, (1, 0.5)), 0.03, rng.uniform(-0.6, 0.6))
place(EV["cloth"], whoosh(0.8, 500, 3000), 0.15)
# Timer
for tt in EV["timer"]:
    place(tt, tone(1500, 1500, 0.1, 30, (1,)), 0.15)
    place(tt + 0.12, tone(1500, 1500, 0.1, 30, (1,)), 0.12)
place(EV["letgo"], whoosh(0.6, 200, 2000), 0.12)
# Kreis schließt sich, durchgestrichen, Finale
place(EV["circle"], whoosh(1.2, 200, 3000), 0.2)
place(EV["strike"], whoosh(0.2, 2000, 8000), 0.15)
for kk, f in enumerate((523, 659, 784, 1047)):
    place(EV["finale"] + kk * 0.07, chime(f), 0.09)
place(EV["finale"], thud(0.8, 0.8), 0.45)

# ---------------------------------------------------------------- Mischung
with wave.open(os.path.join(B, "voice.wav")) as w:
    voice = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
voice = np.pad(voice[:N], (0, max(0, N - len(voice))))
voice = voice / (np.abs(voice).max() + 1e-6) * 0.9
mix = sfx / (np.abs(sfx).max() + 1e-6) * 0.45 + voice[:, None]
mix = np.tanh(mix * 1.05) * 0.92
fade = np.ones(N, np.float32)
fl = int(0.8 * SR)
fade[-fl:] = np.linspace(1, 0, fl)
mix *= fade[:, None]
with wave.open(os.path.join(B, "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", round(DUR, 2), "s")
