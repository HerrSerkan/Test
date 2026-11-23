"""Tonspur für "Wie groß wirst du?": Stimme + Hintergrundmusik + Soundeffekte.

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
    place(ts - 0.15, whoosh(0.45, 500, 5000), 0.07, rng.uniform(-0.3, 0.3))
for k, th in enumerate(EV["heights"]):
    place(th, tone(660 + k * 110, 660 + k * 110, 0.25, 10, (1, 0.3)), 0.06, (k - 1) * 0.4)
place(EV["half"], pop(), 0.1)
place(EV["plus13"], tone(400, 800, 0.5, 5, (1, 0.3)), 0.07, -0.3)
place(EV["avg"], whoosh(0.5, 800, 5000), 0.07)
place(EV["result"], bell(1318.5, 1.4), 0.06)
place(EV["range"], whoosh(0.5, 300, 3000), 0.08)
place(EV["zoom"], whoosh(0.6, 200, 2000), 0.08)
place(EV["graph"], sweep(1.4, 300, 3000), 0.05)
place(EV["deep"], bell(880, 1.6, 2.0), 0.05)
place(EV["cut"], thump(1.4, 0.4), 0.18)
place(EV["protein"], whoosh(0.8, 1500, 8000), 0.06)
for k in range(6):
    place(EV["protein"] + 0.2 + k * 0.15, click(4000 + k * 300), 0.03, rng.uniform(-0.4, 0.4))
r0, r1 = EV["run"]
tt = r0 + 0.1
while tt < r1 + 0.3:
    place(tt, thump(2.6, 0.1), 0.08, 0.1)
    tt += 0.26
place(EV["cross"], buzz(), 0.07)
place(EV["dense"], tone(200, 400, 1.2, 2.5, (1, 0.4, 0.2)), 0.06)
for k in range(8):
    place(EV["discs"] + k * 0.05, click(3000 + k * 150), 0.03)
place(EV["cushion"], whoosh(0.6, 300, 3000), 0.08)
place(EV["squash"] + 0.2, tone(300, 150, 1.6, 1.5, (1, 0.3)), 0.06)
place(EV["shorter"], tone(500, 300, 0.4, 6, (1, 0.3)), 0.07)
place(EV["night"], bell(659.3, 2.0, 1.6), 0.05)
p0, p1 = EV["plates"]
for k in range(18):
    place(p0 + (p1 - p0) * k / 18, click(2500), 0.03)
place(EV["fest"], thump(0.8, 0.9), 0.25)
place(EV["fest"], bell(523.3, 1.8, 1.6), 0.05)
place(EV["final"], bell(1046.5, 2.0, 1.4), 0.05)
place(EV["final"] + 0.1, bell(1568, 2.0, 1.6), 0.04)

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
