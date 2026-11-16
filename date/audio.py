"""Tonspur für "Ängstlich + Vermeidend beim ersten Date": nur Soundeffekte (synthetisch), keine Stimme, keine Musik.

Liest build/timeline.json, build/events.json -> schreibt build/audio.wav (Stereo, -14 LUFS). Klänge wie gruppenchat/audio.py.
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



def pop(f=880):
    x = x_(0.18)
    fr = f * (1 + 0.6 * np.exp(-x * 40))
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * 22)).astype(np.float32)


def blip(f):
    x = x_(0.06)
    return (np.sin(2 * np.pi * f * x) * np.exp(-x * 50)).astype(np.float32)


def key():
    x = x_(0.05)
    return (band(noise(0.05), 1500, 6000) * np.exp(-x * 140) + np.sin(2 * np.pi * 180 * x) * np.exp(-x * 80) * 0.5).astype(np.float32)


def swell(L, freqs):
    x = x_(L)
    s = sum(np.sin(2 * np.pi * f * x + rng.uniform(0, 6)) for f in freqs)
    e = np.minimum(1, x / 0.6) * np.minimum(1, (L - x) / 1.2)
    return (lowp(s, 1500) * e * 0.3).astype(np.float32)


def room(L):
    return (lowp(noise(L), 250) * 0.25).astype(np.float32)



def glide(f0, f1, L):
    x = x_(L)
    fr = np.linspace(f0, f1, len(x))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * (1 + 0.3 * np.sin(2 * np.pi * 6 * x))
    return (s * np.sin(np.pi * x / L) ** 1.5).astype(np.float32)



def murmur(L):
    """leises Restaurant-Gemurmel + Besteck"""
    s = band(noise(L), 200, 900) * 0.5
    x = x_(L)
    s *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.4 * x) * np.sin(2 * np.pi * 0.17 * x + 1)
    return s.astype(np.float32)


sfx = np.zeros((N, 2), np.float32)
place(sfx, 0, murmur(DUR), 0.035)
for k in range(5):
    place(sfx, 0.6 + k * 2.6 + rng.uniform(0, 0.8), bell(2600 + rng.uniform(-300, 300), 0.4), 0.012, pan=rng.uniform(-0.7, 0.7))

place(sfx, EV["nice"], pop(780), 0.1, pan=0.3)
place(sfx, EV["dream"], glide(500, 900, 0.5), 0.05, pan=-0.3)
for k, f in (("ring", 1318.5), ("house", 1568.0), ("kids", 1760.0), ("dog", 2093.0)):
    place(sfx, EV[k], bell(f, 1.2), 0.05, pan=-0.3)
place(sfx, EV["ask"], pop(700), 0.12, pan=-0.3)
place(sfx, EV["sweat"], glide(900, 500, 0.4), 0.04, pan=0.3)
# Ausgang: Warnpiepen
for j in range(3):
    place(sfx, EV["exit"] + 0.15 + j * 0.3, blip(1800), 0.06, pan=0.3)
# Flucht: Rauschen, Puff, Fenster
place(sfx, EV["flee"] - 0.05, whoosh(0.7), 0.25, pan=0.4)
place(sfx, EV["flee"] + 0.05, thump(110, 16), 0.2, pan=0.3)
place(sfx, EV["gone"] - 0.1, glide(1200, 300, 0.35), 0.05, pan=0.7)
# traurig: tiefer Ton
place(sfx, EV["gone"] + 0.2, glide(330, 220, 1.4), 0.05, pan=-0.3)
place(sfx, EV["story"], thump(55, 7), 0.3)
place(sfx, EV["secure1"], pop(900), 0.06)
place(sfx, EV["secure2"] + 1.05, pop(1100), 0.06)
place(sfx, EV["which"], bell(659.3, 1.6), 0.04)
# zurück: Rauschen + "hey" + Herzen
place(sfx, EV["back"], whoosh(0.6), 0.18, pan=0.6)
place(sfx, EV["hey"], pop(820), 0.12, pan=0.3)
for j in range(5):
    place(sfx, EV["hearts"] + j * 0.12, bell(1046.5 * (1 + j * 0.125), 1.0), 0.035, pan=-0.3)

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
