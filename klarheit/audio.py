"""Tonspur für "Wartet auf Klarheit vs. geht einfach los": nur Soundeffekte (synthetisch), keine Stimme, keine Musik.

Liest build/timeline.json, build/events.json -> schreibt build/audio.wav (Stereo, -14 LUFS). Klänge aus aufschieber/audio.py.
"""
import json
import os
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
TL = json.load(open(os.path.join(B, "timeline.json")))
EV = json.load(open(os.path.join(B, "events.json")))
DUR = TL["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(4)


def read_wav(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(1)
    return a


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    return lfilter(b, a, x)


def lowp(x, f):
    b, a = butter(2, f / (SR / 2))
    return lfilter(b, a, x)


def place(buf, t0, sig, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(len(buf), i + len(sig))
    s = sig[: j - i] * gain
    buf[i:j, 0] += s * (1 - max(0, pan))
    buf[i:j, 1] += s * (1 + min(0, pan))


def x_(L):
    return np.arange(int(L * SR)) / SR


def noise(L):
    return rng.normal(0, 1, int(L * SR))


# ---------------------------------------------------------------- Klänge
def tear():
    x = x_(0.32)
    s = band(noise(0.32), 1500, 7000) * (np.abs(np.sin(x * 140)) ** 0.5) * np.exp(-x * 8)
    return s.astype(np.float32)


def whoosh(L=0.7):
    x = x_(L)
    return (lowp(noise(L), 900) * np.sin(np.pi * x / L) ** 2 * 2.5).astype(np.float32)


def thump(f=70, d=10):
    x = x_(0.5)
    fr = f + 60 * np.exp(-x * 30)
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * d)
    return s.astype(np.float32)


def tap():
    x = x_(0.04)
    return (band(noise(0.04), 2000, 6000) * np.exp(-x * 160)).astype(np.float32)


def scribble(L, speed):
    x = x_(L)
    s = band(noise(L), 2500, 9000)
    mod = 0.55 + 0.45 * np.sin(2 * np.pi * speed * x + 2 * np.sin(2 * np.pi * speed * 0.37 * x))
    e = np.minimum(1, x / 0.05) * np.minimum(1, (L - x) / 0.05)
    return (s * mod * e).astype(np.float32)


def tick(f=3000):
    x = x_(0.03)
    return (np.sin(2 * np.pi * f * x) * np.exp(-x * 220)).astype(np.float32)


def clink():
    x = x_(0.6)
    s = sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) * g for f, d, g in [(2100, 9, 0.5), (3400, 13, 0.3), (5200, 18, 0.2)])
    return (s + band(noise(0.6), 3000, 8000) * np.exp(-x * 90) * 0.4).astype(np.float32)


def bell(f, L=2.2):
    x = x_(L)
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 1.6, 0.6), (2.76, 3, 0.22), (5.4, 5, 0.1)])
    return (s * np.minimum(1, x / 0.004)).astype(np.float32)


def thunder(L=3.0):
    x = x_(L)
    s = lowp(noise(L), 160) * (np.exp(-x * 1.3) * (0.6 + 0.4 * np.abs(np.sin(x * 5)))) * np.minimum(1, x / 0.15)
    return (s * 4).astype(np.float32)


def rain_loop(L):
    x = x_(L)
    s = band(noise(L), 1200, 8000) * 0.5
    drops = np.zeros(len(x))
    for k in rng.integers(0, len(x) - 500, int(L * 25)):
        drops[k:k + 400] += np.exp(-np.arange(400) / 40) * rng.uniform(0.3, 1)
    s += band(drops * rng.normal(0, 1, len(x)), 2000, 7000)
    return s.astype(np.float32)


def alarm():
    out = np.zeros(int(1.0 * SR), np.float32)
    for k in range(4):
        x = x_(0.12)
        s = np.sign(np.sin(2 * np.pi * 1760 * x)) * 0.3 * np.minimum(1, (0.12 - x) / 0.01)
        i = int(k * 0.2 * SR)
        out[i:i + len(s)] += lowp(s, 4000).astype(np.float32)
    return out



def step():
    x = x_(0.14)
    return (lowp(noise(0.14), 450) * np.exp(-x * 40) * 1.8 + band(noise(0.14), 1500, 4000) * np.exp(-x * 120) * 0.3).astype(np.float32)


def click():
    x = x_(0.08)
    return (band(noise(0.08), 1200, 5000) * np.exp(-x * 90) + np.sin(2 * np.pi * 900 * x) * np.exp(-x * 60) * 0.4).astype(np.float32)


def hum(L):
    x = x_(L)
    s = (np.sin(2 * np.pi * 100 * x) * 0.5 + np.sin(2 * np.pi * 200 * x) * 0.25) * np.minimum(1, x / 0.2) * np.exp(-x * 1.5)
    return s.astype(np.float32)


def swell(L, freqs):
    x = x_(L)
    s = sum(np.sin(2 * np.pi * f * x + rng.uniform(0, 6)) for f in freqs)
    e = np.minimum(1, x / 0.6) * np.minimum(1, (L - x) / 1.2)
    return (lowp(s, 1800) * e * 0.3).astype(np.float32)


sfx = np.zeros((N, 2), np.float32)

# oben: Uhr tickt die ganze Zeit (links, leise), bis zum Ende
t = 0.3
k = 0
while t < EV["end"] - 0.8:
    place(sfx, t, tick(2600 if k % 2 else 3100), 0.05, pan=-0.2)
    t += 0.5
    k += 1
place(sfx, EV["watch"] + 0.25, tick(4200), 0.06, pan=-0.2)
place(sfx, EV["sit"] + 0.4, thump(70, 12), 0.18, pan=-0.2)

# unten: Schritte + Lampen
for s in EV["steps"]:
    place(sfx, s + 0.05, step(), 0.22, pan=0.15)
    place(sfx, s + EV["stepDur"] - 0.05, step(), 0.18, pan=0.15)
for i, lt in enumerate(EV["lamps"]):
    place(sfx, lt, click(), 0.2, pan=-0.5 + i * 0.14)
    place(sfx, lt, hum(1.2), 0.035, pan=-0.5 + i * 0.14)

# Aufziehen: Rauschen + Kaskade aus Klicks
place(sfx, EV["expand"] - 0.1, whoosh(0.8), 0.14)
for j in range(9):
    place(sfx, EV["expand"] + 0.25 + j * 0.07, click(), 0.12, pan=-0.8 + j * 0.2)
# Spruch: warmer Klang
place(sfx, EV["slogan"][0] - 0.05, thump(60, 6), 0.3)
place(sfx, EV["slogan"][0], swell(3.2, [196.0, 293.7, 392.0, 493.9]), 0.07)
place(sfx, EV["slogan"][1], bell(1174.7, 2.0), 0.05)
place(sfx, EV["slogan"][1] + 0.1, bell(1568, 2.0), 0.035)
# zurück zur Teilung, er läuft weiter
place(sfx, EV["back"], whoosh(0.6), 0.1)
t = EV["walkOn"]
while t < EV["end"] - 0.6:
    place(sfx, t, step(), 0.15, pan=0.3)
    t += 0.28

# ---------------------------------------------------------------- Mischung
mix = sfx
for d, g in ((0.071, 0.2), (0.127, 0.13)):
    k = int(d * SR)
    mix[k:] += sfx[:-k] * g
mix = np.tanh(mix / (np.abs(mix).max() + 1e-6) * 1.05) * 0.9
fl = int(1.2 * SR)
mix[-fl:] *= np.linspace(1, 0, fl)[:, None]
raw = os.path.join(B, "audio_raw.wav")
with wave.open(raw, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())

# Lautheit -14 LUFS (EBU R128, zwei Durchgänge)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True)
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr).group(0))
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af, "-ar", str(SR), os.path.join(B, "audio.wav")], check=True)
print("audio.wav geschrieben:", round(DUR, 2), "s")
