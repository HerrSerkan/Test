"""Ton für "Wenn du klatschst, weil das Flugzeug landet": Effekte (Musik kommt über tools/mix_music.py dazu)."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(43)


def lp(x, fc):
    b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def noise(L):
    return rng.normal(0, 1, int(L * SR))


def place(t0, sig, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    out[i:j, 0] += sig[: j - i] * g * (1 - max(0, pan))
    out[i:j, 1] += sig[: j - i] * g * (1 + min(0, pan))


def tick(f=2600):
    x = np.arange(int(0.03 * SR)) / SR
    return np.sin(2 * np.pi * f * x) * np.exp(-x * 200)


def whoosh(L=0.4):
    x = np.arange(int(L * SR)) / SR
    return lp(noise(L), 1200) * np.sin(np.pi * x / L) ** 2 * 1.6


def key():
    x = np.arange(int(0.04 * SR)) / SR
    return bp(noise(0.04), 1500, 6000) * np.exp(-x * 150)


def alarm(L=1.2):
    s = np.zeros(int(L * SR))
    for k in range(6):
        x = np.arange(int(0.09 * SR)) / SR; i = int(k * 0.2 * SR)
        s[i:i + len(x)] += np.sign(np.sin(2 * np.pi * 2000 * x)) * 0.3
    return lp(s, 5000)


def bark():
    x = np.arange(int(0.18 * SR)) / SR
    f = 500 * np.exp(-x * 6)
    return bp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + noise(0.18) * 0.3, 300, 3000) * np.exp(-x * 12) * 0.6


def kick():
    x = np.arange(int(0.25 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-x * 30)) / SR) * np.exp(-x * 10)


def snore(L=1.3):
    x = np.arange(int(L * SR)) / SR
    return lp(noise(L), 300) * np.sin(np.pi * x / L) ** 2 * 1.4


def bell(f, L=1.6):
    x = np.arange(int(L * SR)) / SR
    return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 2.0, 0.6), (2.76, 3.5, 0.22)])


def thump():
    x = np.arange(int(0.5 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-x * 25)) / SR) * np.exp(-x * 9)



def clap(g=1.0):
    x = np.arange(int(0.12 * SR)) / SR
    return bp(noise(0.12), 900, 5000) * np.exp(-x * 45) * g


def rub(L):
    x = np.arange(int(L * SR)) / SR
    return bp(noise(L), 1500, 6000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 3.5 * x))) * 0.6


def chime():
    a = bell(659.3, 1.2) * 0.6
    b = np.pad(bell(523.3, 1.2) * 0.6, (int(0.35 * SR), 0))[: len(a)]
    return a + b


def rumble(L=0.9):
    x = np.arange(int(L * SR)) / SR
    return lp(noise(L), 120) * np.sin(np.pi * x / L) * 4


def rise(f0, f1, L=0.3):
    x = np.arange(int(L * SR)) / SR
    f = np.linspace(f0, f1, len(x))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / L) * 0.4


def cricket(L):
    x = np.arange(int(L * SR)) / SR
    return np.sin(2 * np.pi * 4300 * x) * (np.sin(2 * np.pi * 30 * x) > 0.4) * (np.sin(2 * np.pi * 1.1 * x) > 0) * 0.2


# Triebwerk
L = DUR
x = np.arange(int(L * SR)) / SR
place(0, lp(noise(L), 220) * 0.6 + np.sin(2 * np.pi * 110 * x) * 0.05, 0.12)
# Klatschen im Takt der Hände
a, b = EV["clap"]
t = a + np.pi / 32
while t < b:
    place(t, clap(), 0.35, pan=0.0); t += np.pi / 16
place(EV["anyone"] + 0.1, cricket(1.2), 0.08, pan=0.3)
place(EV["rub"], rub(1.2), 0.25)
for t in (EV["turb"], EV["more"]):
    place(t - 0.05, chime(), 0.08)
place(EV["turb"] - 0.15, rumble(), 0.4)
place(EV["hands"], whoosh(0.3), 0.12)
place(EV["later"] - 0.1, whoosh(0.6), 0.2)
place(EV["tiny"] + 0.17, clap(0.6), 0.3)
place(EV["tiny"] + 0.2, cricket(1.5), 0.07, pan=-0.3)
for k, t in enumerate(EV["meterUp"]):
    place(t, rise(500 + k * 80, 900 + k * 120), 0.18)
place(EV["bravo"], bell(1046.5, 1.8), 0.06); place(EV["bravo"] + 0.15, bell(1318.5, 1.8), 0.05)

peak = np.abs(out).max() + 1e-6
out = np.tanh(out / peak * 1.2) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", DUR, "s")
