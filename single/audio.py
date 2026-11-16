"""Ton für „Manche Menschen bleiben jahrelang Single“: Stimme + dezente Effekte -> build/audio.wav
(Musik kommt danach über tools/mix_music.py darunter)."""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
N = int(EV["duration"] * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(7)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def place(t0, sig, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); out[i:j, 0] += sig[: j - i] * g; out[i:j, 1] += sig[: j - i] * g


def whoosh(L=0.45):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 300, 2500) * np.sin(np.pi * x / L) ** 2


def chime(f):
    n = int(1.2 * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * k * x) / k for k in (1, 2, 3)) * env(n, 0.003, 0.35) * 0.5


raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "build", "voice.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, np.float32)
voice = voice / (np.abs(voice).max() + 1e-9)
fx = np.zeros((N, 2), np.float32)
for s in EV["starts"][1:]:
    place(s - 0.25, whoosh(), 0.06)
for t in EV["hearts"]:
    place(t, chime(1318), 0.08)
place(EV["shield"], chime(880), 0.07)
place(EV["sparkle"], chime(1760), 0.08)
out[: len(voice), 0] += voice[:N] * 0.8
out[: len(voice), 1] += voice[:N] * 0.8
out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", EV["duration"], "s")
