"""Tonspur für "Gleicher Akku": nur Soundeffekte (alles synthetisch), keine Musik, keine Stimme.

Liest build/events.json (node render.js --events) -> schreibt build/audio.wav (Stereo).
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
rng = np.random.default_rng(5)
t = np.arange(N) / SR
out = np.zeros((N, 2), np.float32)


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
    out[i:j, 0] += s * (1 - max(0, pan))
    out[i:j, 1] += s * (1 + min(0, pan))


def tone(f0, f1, L, decay, harm=(1, 0.3)):
    n = int(L * SR)
    x = np.arange(n) / SR
    f = np.linspace(f0, f1, n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm))
    return (s * np.minimum(1, x / 0.004) * np.exp(-x * decay)).astype(np.float32)


def pop():
    n = int(0.12 * SR)
    x = np.arange(n) / SR
    f = 900 * np.exp(-x * 30) + 300
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 40)
    return (s + band(rng.normal(0, 1, n), 1500, 5000) * np.exp(-x * 120) * 0.3).astype(np.float32)


def whoosh(L=0.6, lo=300, hi=3000):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.5).astype(np.float32)


def thud():
    n = int(0.6 * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-x * 14)) / SR) * np.exp(-x * 7)
    return s.astype(np.float32)


def click():
    n = int(0.05 * SR)
    x = np.arange(n) / SR
    s = band(rng.normal(0, 1, n), 1500, 7000) * np.exp(-x * 160) + np.sin(2 * np.pi * 180 * x) * np.exp(-x * 90)
    return s.astype(np.float32)


# ---------------------------------------------------------------- Party-Geräusche (Stimmengewirr)
party = np.clip(np.interp(t, [0, EV["dim"], EV["dim"] + 0.7, EV["party2"], EV["party2"] + 0.6, DUR],
                          [1, 1, 0, 0, 1, 1]), 0, 1)
chat = np.zeros(N)
for k in range(6):                     # mehrere "Stimmen": gefiltertes Rauschen mit Silben-Rhythmus
    v = band(rng.normal(0, 1, N), 250 + 90 * k, 1300 + 220 * k)
    syl = 0.5 + 0.5 * np.sin(2 * np.pi * (3.2 + 0.7 * k) * t + rng.uniform(0, 6)) ** 2
    slow = 0.6 + 0.4 * np.sin(2 * np.pi * (0.23 + 0.05 * k) * t + k)
    chat += v * syl * slow
chat = chat / np.abs(chat).max()
out[:, 0] += (chat * party * 0.16).astype(np.float32)
out[:, 1] += (np.roll(chat, 900) * party * 0.16).astype(np.float32)
# gedämpfte Partybässe aus dem Nebenraum sind weggelassen (keine Musik)
# Jubelrufe
for tc, pan in ((0.15, 0.4), (2.5, 0.5), (EV["party2"] + 0.1, 0.2), (EV["party2"] + 0.6, -0.3)):
    n = int(1.1 * SR)
    x = np.arange(n) / SR
    s = band(rng.normal(0, 1, n), 600, 3200) * np.sin(np.pi * x / 1.1) ** 1.5
    s *= 1 + 0.5 * np.sin(2 * np.pi * 7 * x)
    place(tc, s.astype(np.float32), 0.35, pan)
# Partytröte
for tc in (0.4, EV["party2"] + 0.3):
    n = int(0.55 * SR)
    x = np.arange(n) / SR
    f = 420 + 60 * np.sin(2 * np.pi * 9 * x)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.minimum(1, x / 0.03) * np.minimum(1, (0.55 - x) / 0.1)
    place(tc, low(s, 2500).astype(np.float32), 0.06, 0.5)

# Zuhause: leises Raumrauschen + Lampenbrummen
home = np.clip(np.interp(t, [0, EV["home"] - 0.1, EV["home"] + 0.3, EV["door"], EV["door"] + 0.4, DUR],
                         [0, 0, 1, 1, 0.3, 0.3]), 0, 1)
room = low(rng.normal(0, 1, N), 400) * 0.03 + np.sin(2 * np.pi * 100 * t) * 0.006
out += (room * home)[:, None].astype(np.float32)
# Spielkonsole: kleine Klick-Töne
for k in np.arange(EV["home"] + 0.3, EV["door"] - 0.2, 0.37):
    if rng.random() < 0.55:
        place(k, tone(1400 + rng.integers(0, 4) * 200, 1400, 0.06, 60, (1,)), 0.05, -0.4)

# ---------------------------------------------------------------- Ereignisse
PAN = [-0.45, 0.0, 0.45]
for e in EV["up"]:                     # Akku lädt: steigender Doppelton
    place(e["t"], tone(660, 990, 0.18, 14), 0.22, PAN[e["who"]])
    place(e["t"] + 0.07, tone(990, 1320, 0.2, 14), 0.16, PAN[e["who"]])
for e in EV["down"]:                   # Akku sinkt: fallender Ton
    place(e["t"], tone(520, 300, 0.32, 8, (1, 0.5, 0.2)), 0.2, PAN[e["who"]])
for tf in EV["full"]:                  # voll: Glitzern
    for k, f in enumerate((1568, 1976, 2349, 3136)):
        place(tf + k * 0.06, tone(f, f, 0.7, 6, (1,)), 0.07)
for b in EV["bubbles"]:
    place(b["t"], pop(), 0.35, PAN[b["who"]])
    place(b["end"], pop()[::-1][: int(0.05 * SR)] * 0.6, 0.15, PAN[b["who"]])
# Licht aus / Abschied von der Party
place(EV["dim"] + 0.05, click(), 0.6, -0.2)
place(EV["dim"] + 0.1, whoosh(0.9, 200, 1500), 0.12)
# Szenenwechsel
place(EV["home"] - 0.25, whoosh(0.5, 300, 2500), 0.15)
place(EV["door"] - 0.2, whoosh(0.45, 300, 2500), 0.15)
# Telefon am Ohr: kurzer Freiton
place(EV["call"] - 0.05, tone(425, 425, 0.35, 3, (1,)), 0.06, 0.0)
# Titel
t1, t2, tout = EV["title"]
place(t1 - 0.3, whoosh(0.45, 500, 5000), 0.18)
place(t1 + 0.05, thud(), 0.45)
place(t2 - 0.25, whoosh(0.4, 500, 5000), 0.15)
place(t2 + 0.05, thud(), 0.5)
place(tout, whoosh(0.4, 400, 3000), 0.08)
# Nachricht: Doppel-Ding + Glocke
place(EV["note"], tone(1318, 1318, 0.5, 9, (1, 0.25)), 0.25, 0.3)
place(EV["note"] + 0.13, tone(1760, 1760, 0.6, 8, (1, 0.25)), 0.22, 0.3)
for k in range(8):
    place(EV["note"] + 0.25 + k * 0.05, tone(2600, 2600, 0.08, 40, (1, 0.4)), 0.05, 0.45)
# Tür auf: Knarzen + Rumms
n = int(0.5 * SR)
x = np.arange(n) / SR
creak = np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(2 * np.pi * 3 * x) + 30 * rng.normal(0, 1, n)) / SR)
place(EV["door"] - 0.05, (band(creak, 200, 2000) * np.sin(np.pi * x / 0.5)).astype(np.float32), 0.12, 0.0)
place(EV["door"] + 0.35, thud(), 0.25)

# ---------------------------------------------------------------- Mischung
fade = np.ones(N, np.float32)
fl = int(0.45 * SR)
fade[-fl:] = np.linspace(1, 0, fl)
out *= fade[:, None]
out = np.tanh(out / (np.abs(out).max() + 1e-6) * 1.1) * 0.89
with wave.open(os.path.join(B, "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", round(DUR, 2), "s")
