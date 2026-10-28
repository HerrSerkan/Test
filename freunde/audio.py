"""Tonspur für "Wer geblieben ist": Stimme + Soundeffekte (alles synthetisch), keine Musik.

Liest build/timeline.json, build/events.json, build/voice.wav -> schreibt build/audio.wav (Stereo, -14 LUFS).
Klänge und Mischung wie aufschieber/audio.py.
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
rng = np.random.default_rng(9)


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


def x_(L):
    return np.arange(int(L * SR)) / SR


def noise(L):
    return rng.normal(0, 1, int(L * SR))


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


def clink(f0=2100):
    x = x_(0.8)
    s = sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) * g for f, d, g in [(f0, 6, 0.5), (f0 * 1.62, 9, 0.3), (f0 * 2.48, 13, 0.2)])
    return (s + band(noise(0.8), 3000, 8000) * np.exp(-x * 90) * 0.3).astype(np.float32)


def chair_scrape():
    L = 0.35
    x = x_(L)
    fr = 180 + 80 * np.sin(x * 30)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * 0.3 + band(noise(L), 300, 1500) * 0.6
    return (lowp(s, 1800) * np.sin(np.pi * x / L) ** 1.5).astype(np.float32)


def step():
    x = x_(0.12)
    return (lowp(noise(0.12), 500) * np.exp(-x * 45) * 1.6).astype(np.float32)


def tick(f=2800):
    x = x_(0.03)
    return (np.sin(2 * np.pi * f * x) * np.exp(-x * 220)).astype(np.float32)


def bell(f, L=3.0):
    x = x_(L)
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 1.0, 0.6), (2.0, 1.8, 0.2), (3.0, 3, 0.08)])
    return (s * np.minimum(1, x / 0.01)).astype(np.float32)


def warm_pad(L, freqs):
    x = x_(L)
    s = sum(np.sin(2 * np.pi * f * x + rng.uniform(0, 6)) for f in freqs)
    e = np.minimum(1, x / 1.2) * np.minimum(1, (L - x) / 1.5)
    return (lowp(s, 1200) * e * 0.3).astype(np.float32)


def room_tone(L):
    return (lowp(noise(L), 300) * 0.25).astype(np.float32)


sfx = np.zeros((N, 2), np.float32)

# leises Raumrauschen + Kerze, wird mit den Abgängen leiser
rt = room_tone(DUR)
lvl = np.interp(np.arange(N) / SR, [0, EV["leave"][0]["t"], EV["d30"], DUR], [1, 1, 0.35, 0.35])
place(sfx, 0, rt * lvl[: len(rt)], 0.05)

# Anstoßen
for k in range(6):
    place(sfx, EV["toast"] + 0.25 + k * 0.05 + rng.uniform(0, 0.03), clink(1900 + rng.uniform(-300, 400)), 0.07,
          pan=rng.uniform(-0.6, 0.6))

# Abgänge: Stuhl rücken, Schritte
for lv in EV["leave"]:
    pan = (lv["x"] - 540) / 600
    place(sfx, lv["t"], chair_scrape(), 0.12, pan=pan)
    for k in range(4):
        place(sfx, lv["t"] + 0.8 + k * 0.33, step(), 0.12 * (1 - k * 0.2), pan=pan * 1.2)

# Alterszähler
for t in EV["ageFlips"]:
    place(sfx, t, tick(), 0.07)

# Rückkehr: Schritte von rechts, Stuhl
for k in range(5):
    place(sfx, EV["back"] + 0.1 + k * 0.3, step(), 0.08 + 0.02 * k, pan=0.6 - k * 0.1)
place(sfx, EV["sit"] - 0.15, chair_scrape(), 0.1, pan=0.1)

# Er bleibt: warmer Klang
place(sfx, EV["bleibt"] - 0.1, warm_pad(DUR - EV["bleibt"], [130.8, 196.0, 261.6, 329.6]), 0.06)
place(sfx, EV["bleibt"], bell(523.25), 0.05)
place(sfx, EV["geblieben"], bell(392.0), 0.06)
place(sfx, EV["geblieben"] + 0.12, bell(587.3), 0.04)

# ---------------------------------------------------------------- Mischung
voice = read_wav(os.path.join(B, "voice.wav"))[:N]
voice = np.pad(voice, (0, N - len(voice)))
voice = voice / (np.abs(voice).max() + 1e-6) * 0.8
mix = sfx * 0.9 + voice[:, None]
for d, g in ((0.083, 0.2), (0.149, 0.13)):
    k = int(d * SR)
    mix[k:] += sfx[:-k] * g
mix = np.tanh(mix / (np.abs(mix).max() + 1e-6) * 1.05) * 0.9
fl = int(1.4 * SR)
mix[-fl:] *= np.linspace(1, 0, fl)[:, None]
raw = os.path.join(B, "audio_raw.wav")
with wave.open(raw, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())

r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True)
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr).group(0))
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af, "-ar", str(SR), os.path.join(B, "audio.wav")], check=True)
print("audio.wav geschrieben:", round(DUR, 2), "s")
