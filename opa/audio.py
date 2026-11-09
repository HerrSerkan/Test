"""Ton für "Wie viele Stunden noch?": Stimme (build/voice.wav) + Effekte -> build/audio.wav. Musik kommt über tools/mix_music.py leise dazu."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
EV = json.load(open(os.path.join(B, "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
sfx = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(59)


def lp(x, f):
    b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def noise(L):
    return rng.normal(0, 1, int(L * SR))


def place(t0, sig, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    sfx[i:j, 0] += sig[: j - i] * g * (1 - max(0, pan))
    sfx[i:j, 1] += sig[: j - i] * g * (1 + min(0, pan))


def bell(f, L=1.4):
    x = np.arange(int(L * SR)) / SR
    return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 2.2, 0.6), (2.76, 4, 0.2)]) * np.minimum(1, x / 0.004)


def whoosh(L=0.35):
    x = np.arange(int(L * SR)) / SR
    return lp(noise(L), 1100) * np.sin(np.pi * x / L) ** 2 * 1.5


def ring(L=1.4):
    x = np.arange(int(L * SR)) / SR
    return np.sin(2 * np.pi * 1400 * x) * (np.sin(2 * np.pi * 20 * x) > 0) * (np.sin(2 * np.pi * 1.4 * x) > -0.2) * 0.25


def tick(f=2600):
    x = np.arange(int(0.03 * SR)) / SR
    return np.sin(2 * np.pi * f * x) * np.exp(-x * 200)


def clink():
    x = np.arange(int(0.5 * SR)) / SR
    return sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) * g for f, d, g in [(1800, 9, 0.5), (2900, 14, 0.3)])


def whistle(L):
    x = np.arange(int(L * SR)) / SR
    mel = [1319, 1568, 1319, 1175, 1319, 1568, 1760, 1568]
    f = np.array([mel[int(k / 0.25) % len(mel)] for k in x])
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.006 * np.sin(2 * np.pi * 6 * x))) / SR) * 0.3 * np.minimum(1, x / 0.05) * np.minimum(1, (L - x) / 0.2)


for t in EV["scenes"][1:]:
    place(t - 0.2, whoosh(), 0.08)
for k, t in enumerate(EV["badges"]):
    place(t, bell(1046.5 if k != 5 else 523.3), 0.07)
a, b = EV["ring"]
place(a + 0.1, ring(min(1.6, b - a)), 0.12, pan=0.2)
place(b, whoosh(0.25), 0.15, pan=0.2)
for a, b in EV["whistle"]:
    place(a + 0.5, whistle(b - a - 0.7), 0.06, pan=-0.2)
for k in range(23):
    place(EV["scenes"][10] + 1.5 + k * 0.12, tick(2400 + (k % 2) * 400), 0.06)
place(EV["wochenende"], bell(659.3, 2.0), 0.08)
place(EV["wrench"], clink(), 0.12)
for t in EV["plus"]:
    place(t, bell(1568), 0.08); place(t + 0.1, bell(2093), 0.05)
place(EV["badges"][6], bell(1318.5, 2.0), 0.08)

with wave.open(os.path.join(B, "voice.wav")) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if w.getnchannels() == 2:
        v = v.reshape(-1, 2).mean(1)
v = np.pad(v[:N], (0, max(0, N - len(v))))
v = v / (np.abs(v).max() + 1e-6) * 0.85
mix = sfx * 0.9 + v[:, None]
mix = np.tanh(mix / (np.abs(mix).max() + 1e-6) * 1.1) * 0.9
with wave.open(os.path.join(B, "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav (Stimme + Effekte):", round(DUR, 2), "s")
