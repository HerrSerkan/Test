"""Tonspur für "Alphabet-Armee – Tag 1": Stimme + Hintergrundmusik + Soundeffekte.

Liest build/voice.wav (script.py), build/events.json (render.js --events) und die Musik:
build/music.mp3 (ElevenLabs Music), sonst build/music_synth.wav (tools/synth_music.py). -> build/audio.wav, -14 LUFS.
"""
import json
import os
import re
import subprocess
import wave

import numpy as np
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
EV = json.load(open(os.path.join(B, "events.json")))
DUR = EV["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(31)
sfx = np.zeros((N, 2), np.float32)


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band")
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


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x * d)


def tone(f0, f1, L, d=8, harm=(1, 0.2)):
    n = int(L * SR)
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    return (sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm)) * env(n, 0.003, d)).astype(np.float32)


def bell(f, L=1.6, d=2.6):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d * k) * g for m, k, g in [(1, 1, 0.6), (2.01, 1.6, 0.2), (3.0, 2.4, 0.1), (4.2, 3, 0.05)])
    return (s * np.minimum(1, x / 0.004)).astype(np.float32)


def whoosh(L, lo, hi):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.4).astype(np.float32)


def sweep(L, f0, f1):
    n = int(L * SR)
    x = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    for k in range(8):                       # Bandpass, der wandert
        a, b = k * n // 8, (k + 1) * n // 8
        fc = f0 * (f1 / f0) ** ((k + 0.5) / 8)
        out[a:b] = band(noise, fc * 0.7, fc * 1.4)[a:b]
    return (out * np.sin(np.pi * x / L) ** 2).astype(np.float32)


def thump(f=1.0, L=0.6):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum((45 + 70 * np.exp(-x * 14)) * f) / SR) * env(n, 0.002, 7)
    return s.astype(np.float32)


def click(f=3000):
    n = int(0.03 * SR)
    return (band(rng.normal(0, 1, n), f * 0.6, f * 1.6) * env(n, 0.0003, 220)).astype(np.float32)


def coin_clink(f=1.0):
    n = int(0.5 * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * fr * f * x) * np.exp(-x * d) * g for fr, d, g in [(2650, 9, 0.5), (4120, 13, 0.3), (5980, 18, 0.2)])
    return (s * np.minimum(1, x / 0.001)).astype(np.float32)


def pop():
    return tone(700, 1250, 0.09, 30, (1, 0.25))


def buzz():
    n = int(0.22 * SR)
    x = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * 110 * x)) * 0.5 + np.sin(2 * np.pi * 220 * x) * 0.3
    return (low(s, 1400) * env(n, 0.004, 9)).astype(np.float32)


# ---------------------------------------------------------------- Effekte
for ts in EV["cuts"]:
    place(ts - 0.15, whoosh(0.45, 700, 6000), 0.08, rng.uniform(-0.3, 0.3))
# Hook: Megafon-Rückkopplung kurz am Anfang, Fragezeichen
place(0.02, tone(1800, 2400, 0.35, 6, (1, 0.3)), 0.025)
place(EV["question"], pop(), 0.12)
# Buchstaben-Kacheln hüpfen (Welle)
for k in range(10):
    place(EV["tiles"] + k * 0.05, tone(500 + k * 60, 620 + k * 60, 0.09, 28, (1, 0.2)), 0.04, (k - 5) / 6)
place(EV["equal"], pop(), 0.1)
place(EV["card"], pop(), 0.12)
place(EV["card"] + 0.05, click(3200), 0.05)
# Soldat fällt auf E, +1
place(EV["plus"], whoosh(0.5, 800, 5000), 0.1, 0.2)
place(EV["drop"], thump(1.6, 0.4), 0.25, 0.2)
place(EV["plus"] + 0.05, bell(1318.5, 1.0, 3), 0.06, 0.2)
# Beispiel-Armee: viele kleine Landungen
a0, a1, n = EV["army"]
for k in range(70):
    tt = a0 + (a1 - a0) * (k / 70) + 0.33
    place(tt + rng.uniform(-0.02, 0.02), thump(rng.uniform(2.2, 3.2), 0.12), 0.06, rng.uniform(-0.5, 0.5))
place(a1 + 0.3, bell(1046.5, 1.4, 2.4), 0.05)
place(EV["poof"], whoosh(0.5, 1500, 9000), 0.1)
# Rangliste Tag 1, alle null
place(EV["board"], whoosh(0.4, 400, 3000), 0.08)
for k in range(26):
    place(EV["board"] + 0.1 + k * 0.02, click(4200), 0.025, (k % 2) * 0.6 - 0.3)
place(EV["zero"], tone(330, 220, 0.4, 5, (1, 0.4)), 0.06)
# Letzter Platz fliegt raus: Alarm
a, b = EV["alarm"]
tt = a + 0.15
while tt < b - 0.1:
    place(tt, tone(880, 660, 0.18, 10, (1, 0.5, 0.2)), 0.04, 0.3)
    tt += 0.36
place(EV["raus"], thump(0.7, 0.9), 0.3, 0.3)
# Folgen / Liken / Speichern
i0, i1 = EV["icons"]
for k, tt in enumerate([i0, (i0 + i1) / 2, i1]):
    place(tt, pop(), 0.11, (k - 1) * 0.4)
place(EV["names"], whoosh(0.4, 400, 3000), 0.08)
place(EV["share"], pop(), 0.12)
for k in range(4):
    place(EV["vanish"] + k * 0.09, click(2600), 0.06, 0.3)
place(EV["vanish"], whoosh(0.6, 300, 4000), 0.1, 0.3)

# ---------------------------------------------------------------- Mischung
with wave.open(os.path.join(B, "voice.wav")) as wv:
    voice = np.frombuffer(wv.readframes(wv.getnframes()), np.int16).astype(np.float32) / 32768
voice = np.pad(voice[:N], (0, max(0, N - len(voice))))
voice = voice / (np.abs(voice).max() + 1e-6) * 0.8
envv = low(np.abs(voice), 5)
envv = np.clip(envv / (envv.max() + 1e-6) * 5, 0, 1)
duck = (1 - 0.35 * envv).astype(np.float32)
# Hintergrundmusik
music = np.zeros((N, 2), np.float32)
for name in ("music.mp3", "music_synth.wav"):
    mp = os.path.join(B, name)
    if os.path.exists(mp):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        m = np.frombuffer(raw, np.float32).reshape(-1, 2)[:N]
        music[: len(m)] = m
        break
music = music / (np.sqrt((music ** 2).mean()) + 1e-6) * 0.09          # Musik leise unter der Stimme
mduck = (1 - 0.5 * envv).astype(np.float32)
mix = sfx * duck[:, None] * 1.6 + voice[:, None] * 0.9 + music * mduck[:, None]
t = np.arange(N) / SR
mix *= np.clip((DUR - 0.15 - t) / 1.0, 0, 1)[:, None]
mix /= np.abs(mix).max() + 1e-6

TMP = os.path.join(B, "audio_tmp.wav")


def write(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def lufs(x):
    write(TMP, x)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", TMP, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


def limit(x, ceil=0.8):
    pk = maximum_filter1d(np.abs(x).max(1), int(0.006 * SR))
    g = minimum_filter1d(np.minimum(1, ceil / (pk + 1e-9)), int(0.006 * SR))
    g = lfilter([0.004], [1, -0.996], g - 1) + 1
    return x * np.minimum(g, np.minimum(1, ceil / (pk + 1e-9)))[:, None]


# Lautheit exakt auf -14 LUFS (EBU R128), Spitzen per Limiter unter -2 dBFS
boost = 0.0
for _ in range(4):
    boost += -14.0 - lufs(limit(mix * 10 ** (boost / 20)))
mix = limit(mix * 10 ** (boost / 20))
os.remove(TMP)
write(os.path.join(B, "audio.wav"), mix)
print("audio.wav geschrieben:", DUR, "s")
