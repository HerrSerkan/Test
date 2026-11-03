"""Ton für "Gleicher Supermarkt.": Effekte (Musik kommt über tools/mix_music.py dazu). Hilfen aus strand/audio.py."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
T = EV["T"]
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(8)


def lp(x, fc):
    b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def place(t0, sig, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    out[i:j, 0] += sig[: j - i] * g * (1 - max(0, pan))
    out[i:j, 1] += sig[: j - i] * g * (1 + min(0, pan))


def ts(L):
    return np.arange(int(L * SR)) / SR


def noise(L):
    return rng.normal(0, 1, int(L * SR))


def bell(f, L=1.0):
    x = ts(L)
    return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 3, 0.6), (2.76, 5, 0.2), (5.4, 8, 0.1)]) * np.minimum(1, x / 0.004)


def pop(f=700):
    x = ts(0.12)
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * np.exp(-x * 28)


def whoosh(L=0.3, lo=600, hi=4000):
    x = ts(L)
    return bp(noise(L), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.4


def sparkle(t0, g=0.04, base=2093):
    for k, f in enumerate([1, 1.26, 1.5, 2.0, 1.5]):
        place(t0 + k * 0.06, bell(base * f, 0.7), g)



def thump(f=55, d=6):
    x = ts(0.7)
    return np.sin(2 * np.pi * np.cumsum(f + 80 * np.exp(-x * 25)) / SR) * np.exp(-x * d)


def hum(L):                     # flackernde Neonröhre
    x = ts(L)
    s = np.sign(np.sin(2 * np.pi * 100 * x)) * 0.15 + np.sin(2 * np.pi * 200 * x) * 0.2
    gate = np.repeat(rng.random(int(L * 14) + 1) > 0.45, SR // 14 + 1)[: len(x)] * 0.8 + 0.2
    crackle = bp(noise(L), 3000, 8000) * (rng.random(len(x)) > 0.997) * 4
    return lp(s, 2500) * gate + crackle


def dingdong():
    s = np.zeros(int(1.4 * SR))
    for k, f in enumerate([659, 523]):
        b = bell(f, 1.0); i = int(k * 0.38 * SR); s[i:i + len(b)] += b
    return s


def chatter(L):                 # Stimmengewirr
    x = ts(L)
    s = sum(bp(noise(L), f, f * 1.6) * (0.5 + 0.5 * np.sin(2 * np.pi * r * x + f)) for f, r in [(300, 3.1), (500, 4.3), (800, 2.7)])
    return s * np.minimum(1, x / 0.1) * np.minimum(1, (L - x) / 0.1)


def step():
    x = ts(0.08)
    return lp(noise(0.08), 900) * np.exp(-x * 50) * 1.5


def blabla(n, f0):               # Plapper-Silben
    s = np.zeros(int((n * 0.075 + 0.1) * SR))
    for k in range(n):
        x = ts(0.06); f = f0 * (1 + 0.25 * np.sin(k * 1.9))
        v = np.tanh(3 * np.sin(2 * np.pi * f * x)) * np.sin(np.pi * x / 0.06)
        i = int(k * 0.075 * SR); s[i:i + len(v)] += bp(v, 300, 3500)
    return s * 0.7


def sigh(L=0.9):
    x = ts(L)
    return bp(noise(L), 500, 2500) * np.sin(np.pi * x / L) ** 2 * 0.8


def sad(L=0.8):
    x = ts(L)
    f = 220 * (1 - 0.15 * x / L)
    return lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3, 900) * np.minimum(1, x / 0.03) * np.exp(-x * 2.5)


place(T["flick"], hum(T["walk"] - T["flick"]), 0.12, pan=0.3)
place(T["ding1"], dingdong(), 0.22); place(T["ding2"], dingdong(), 0.22)
place(T["ding1"], pop(500), 0.2, pan=0.3)
place(T["ding2"], chatter(T["walk"] - T["ding2"] + 0.2), 0.12, pan=0.3)
t = T["walk"] + 0.05
while t < T["inFreezer"]:
    place(t, step(), 0.25, pan=0.6); t += 0.13
place(T["inFreezer"], whoosh(0.4, 1500, 7000), 0.2, pan=0.7)
place(T["ahh"], sigh(), 0.3, pan=0.7); sparkle(T["ahh"] + 0.1, 0.03, 2637)
place(T["pink"], pop(650), 0.25, pan=-0.6)
for k, t0 in enumerate(EV["talk"]):
    place(t0, blabla(6 + k % 3, 520 + 40 * (k % 2)), 0.22, pan=-0.4)
place(T["grey"] + 0.3, sad(), 0.18, pan=-0.2)
place(T["punch"], thump(), 0.55); sparkle(T["punch"] + 0.05, 0.05)
place(T["bye"], blabla(4, 640), 0.25, pan=-0.5)
place(T["pinkOut"], whoosh(0.3), 0.15, pan=-0.7)
t = T["back"] + 0.05
while t < T["home"]:
    place(t, step(), 0.2, pan=0.4); t += 0.13
place(T["t5"] - 0.08, whoosh(0.3), 0.18)

peak = np.abs(out).max() + 1e-6
out = np.tanh(out / peak * 1.2) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", DUR, "s")
