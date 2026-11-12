"""Ton für „Rotanien – Tag 10“: Stimme + Effekte -> build/audio.wav, Musik -> build/music.wav (danach tools/mix_music.py)."""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json"))); T = EV["T"]
WE = [w["e"] for w in json.load(open(os.path.join(HERE, "build", "words.json")))]   # Wortenden (Geräusche in die Pausen legen)
SR = 44100
N = int(EV["duration"] * SR)
fx = np.zeros(N, np.float32)
rng = np.random.default_rng(5)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def lp(x, fc):
    b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def place(t0, sig, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); fx[i:j] += sig[: j - i] * g


def pop(f=700):
    n = int(0.12 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * env(n, 0.002, 0.035)


def ding(f=1568):
    n = int(0.7 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 2.01 * x)) * env(n, 0.002, 0.18)


def whoosh(L=0.4):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 400, 3500) * np.sin(np.pi * x / L) ** 2


def thud():
    n = int(0.6 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (45 + 60 * np.exp(-x * 15)) * x) * env(n, 0.003, 0.18) + lp(rng.normal(0, 1, n), 900) * env(n, 0.002, 0.08) * 0.6


def roar(L):
    n = int(L * SR); x = np.arange(n) / SR
    return lp(rng.normal(0, 1, n), 600) * np.minimum(1, x / 0.3) * np.minimum(1, (L - x) / 0.4)


def tick(f):
    n = int(0.05 * SR)
    return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.001, 0.012)


def boom():
    n = int(1.0 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (38 + 70 * np.exp(-x * 14)) * x) * env(n, 0.002, 0.3) + lp(rng.normal(0, 1, n), 2500) * env(n, 0.001, 0.06) * 0.5
def cheer(L=1.6):
    n = int(L * SR); x = np.arange(n) / SR
    c = bp(rng.normal(0, 1, n), 400, 3500) * (1 + 0.5 * lp(rng.normal(0, 1, n), 6)) * np.minimum(1, x / 0.15) * np.minimum(1, (L - x) / 0.6)
    return c
def clank():
    n = int(0.5 * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * x) for f in (523, 1187, 2011)) / 3 * env(n, 0.001, 0.12) + bp(rng.normal(0, 1, n), 1000, 5000) * env(n, 0.001, 0.02)
def zap():
    n = int(0.35 * SR); x = np.arange(n) / SR
    f = 2200 * np.exp(-x * 9) + 200
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.15)
def siren(L):
    n = int(L * SR); x = np.arange(n) / SR
    f = 650 + 350 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * x))
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 * np.minimum(1, x / 0.1) * np.minimum(1, (L - x) / 0.3)
def cluck():
    n = int(0.12 * SR); x = np.arange(n) / SR
    return bp(np.sign(np.sin(2 * np.pi * (900 - 2000 * x) * x)), 700, 3000) * np.sin(np.pi * x / x[-1])
def boing():
    n = int(0.5 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (180 + 120 * np.sin(2 * np.pi * 9 * x) * np.exp(-x * 5)) * x) * env(n, 0.002, 0.2)
def zip_():
    n = int(0.4 * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 2000, 7000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 60 * x))) * np.sin(np.pi * x / x[-1])



# ------------------------------------------------------------ neue Effekte für Tag 5
def beep(f=1400, L=0.12):
    n = int(L * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.002, L * 0.45)
def crackle(L):  # Feuer-Knistern
    n = int(L * SR); c = np.zeros(n)
    for i in rng.integers(0, n - 400, int(L * 90)): c[i:i + 300] += rng.normal(0, 1, 300) * np.exp(-np.arange(300) / 40) * rng.uniform(0.2, 1)
    return bp(c, 800, 7000) + lp(rng.normal(0, 1, n), 300) * 0.25
def rewind(L=0.8):  # Zurückspulen: schnelles, steigendes Zwitschern
    n = int(L * SR); x = np.arange(n) / SR
    f = 300 + 2500 * (x / L) ** 1.5
    return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + bp(rng.normal(0, 1, n), 2000, 8000) * 0.5) * np.sin(np.pi * x / L) * (0.6 + 0.4 * np.sin(2 * np.pi * 25 * x))
def drone(L):  # Mutterschiff: tiefes Dröhnen
    n = int(L * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 38 * x) + 0.6 * np.sin(2 * np.pi * 57.3 * x) + 0.3 * np.sin(2 * np.pi * 76.1 * x)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * x)) * np.minimum(1, x / 1.2) + lp(rng.normal(0, 1, n), 150) * 0.6
def charge(L):  # Aufladen vor dem Schuss
    n = int(L * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(120 + 1600 * (x / L) ** 2) / SR) * (x / L) ** 1.5
def bigLaser():
    n = int(1.4 * SR); x = np.arange(n) / SR
    f = 900 * np.exp(-x * 2.5) + 90
    return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 0.5) / SR)) * env(n, 0.003, 0.5)
def glass(L=1.4):  # Glas zersplittert
    n = int(L * SR); x = np.arange(n) / SR
    s = bp(rng.normal(0, 1, n), 3000, 12000) * env(n, 0.001, 0.25)
    for k in range(40):
        i = int(rng.uniform(0, 0.9) * SR); m = int(0.15 * SR); f = rng.uniform(2500, 7000)
        if i + m < n: s[i:i + m] += np.sin(2 * np.pi * f * np.arange(m) / SR) * env(m, 0.0005, 0.03) * rng.uniform(0.2, 0.7)
    return s
def plop():
    n = int(0.15 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (300 + 600 * np.exp(-x * 30)) * x) * env(n, 0.002, 0.05)
def fump():  # Burek-Launcher
    n = int(0.5 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (60 + 120 * np.exp(-x * 20)) * x) * env(n, 0.002, 0.12) + lp(rng.normal(0, 1, n), 1500) * env(n, 0.001, 0.05)
def steps(L, rate=11):  # viele Laufschritte
    n = int(L * SR); s = np.zeros(n); m = int(0.06 * SR)
    for k in range(int(L * rate * 3)):
        i = int(rng.uniform(0, L - 0.07) * SR); s[i:i + m] += lp(rng.normal(0, 1, m), 900) * env(m, 0.001, 0.015) * rng.uniform(0.3, 1)
    return s
def hiss(L=0.5):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 2500, 9000) * np.exp(-x * 5) * np.minimum(1, x / 0.01)
def buzz(L=0.45):
    n = int(L * SR); x = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 110 * x)) * 0.5 * (np.sin(2 * np.pi * 8 * x) > 0) * np.minimum(1, (L - x) / 0.05)
def crack():  # Planet bricht
    n = int(2.5 * SR); x = np.arange(n) / SR
    return lp(rng.normal(0, 1, n), 200) * env(n, 0.005, 0.9) * 2 + np.concatenate([boom(), np.zeros(n - int(1.0 * SR))]) * 1.2
def whir(L):  # Alien-Schiff kommt näher
    n = int(L * SR); x = np.arange(n) / SR
    f = 200 + 500 * (x / L) ** 2
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.3 + 0.7 * (x / L)) * (0.7 + 0.3 * np.sin(2 * np.pi * 18 * x))


def heartbeat():
    n = int(0.5 * SR); x = np.arange(n) / SR
    b = np.sin(2 * np.pi * 55 * x) * env(n, 0.003, 0.06)
    return b + np.concatenate([np.zeros(int(0.18 * SR)), b[: n - int(0.18 * SR)]]) * 0.7
def sputter(L=1.2):  # Triebwerk stottert und geht aus
    n = int(L * SR); x = np.arange(n) / SR
    gate = (np.sin(2 * np.pi * (14 - 10 * x / L) * x) > 0).astype(float) * np.clip(1 - x / L, 0, 1)
    return lp(rng.normal(0, 1, n), 500) * gate * 1.5
def womp():
    n = int(0.9 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(220 - 140 * x / 0.9) / SR) * env(n, 0.02, 0.4) * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * x))
def chatter(L):  # Zähneklappern
    n = int(L * SR); s = np.zeros(n); m = int(0.012 * SR)
    for i in range(0, n - m, int(0.045 * SR)): s[i:i + m] += bp(rng.normal(0, 1, m), 2000, 6000) * rng.uniform(0.4, 1)
    return s
def wind(L):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 300, 1500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * x)) * np.minimum(1, x / 0.4) * np.minimum(1, (L - x) / 0.4)
def growl(L=1.6):  # Brüllen
    n = int(L * SR); x = np.arange(n) / SR
    f = 70 + 40 * np.sin(np.pi * x / L)
    return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + lp(rng.normal(0, 1, n), 600)) * (1 + 0.5 * np.sin(2 * np.pi * 23 * x)) * np.sin(np.pi * x / L)
def sniffs():
    s = np.zeros(int(1.0 * SR)); m = int(0.12 * SR)
    for k in range(4): i = int(k * 0.2 * SR); s[i:i + m] += bp(rng.normal(0, 1, m), 1500, 5000) * np.sin(np.pi * np.arange(m) / m)
    return s
def sizzle(L):
    n = int(L * SR); return bp(rng.normal(0, 1, n), 3000, 9000) * (0.7 + 0.3 * lp(rng.normal(0, 1, n), 8)) * np.minimum(1, np.arange(n) / SR / 0.2)
def grunt():
    n = int(0.35 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (110 - 40 * x / 0.35) * x) * (1 + 0.6 * np.sin(2 * np.pi * 30 * x)) * np.sin(np.pi * x / 0.35)
def flapping(L):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 200, 2000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 4 * x))) * np.minimum(1, x / 0.2)
def hum(L):  # Maschinen-Surren
    n = int(L * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 180 * x) + 0.5 * np.sin(2 * np.pi * 361 * x) + 0.3 * np.sin(2 * np.pi * 541 * x)) * np.minimum(1, x / 0.3) * 0.5


def crunch(L, rate=6):  # Schritte im Schnee
    n = int(L * SR); s = np.zeros(n); m = int(0.09 * SR)
    for k in range(int(L * rate)):
        i = int((k / rate + rng.uniform(0, 0.05)) * SR)
        if i + m < n: s[i:i + m] += bp(rng.normal(0, 1, m), 1500, 6000) * env(m, 0.003, 0.03) * rng.uniform(0.5, 1)
    return s
def stomp():
    n = int(0.6 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (35 + 40 * np.exp(-x * 12)) * x) * env(n, 0.004, 0.2) + lp(rng.normal(0, 1, n), 400) * env(n, 0.002, 0.05)
def munch(L):
    n = int(L * SR); s = np.zeros(n); m = int(0.08 * SR)
    for i in range(0, n - m, int(0.28 * SR)): s[i:i + m] += lp(rng.normal(0, 1, m), 900) * env(m, 0.004, 0.025)
    return s
def blip(f=1200):
    n = int(0.1 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 600 * x / 0.1) * x) * env(n, 0.002, 0.04)
def crackleE(L):  # Stromknistern
    n = int(L * SR); s = np.zeros(n)
    for i in rng.integers(0, max(1, n - 600), int(L * 25)): s[i:i + 500] += bp(rng.normal(0, 1, 500), 2000, 9000) * np.exp(-np.arange(500) / 80)
    return s


def creak(L=0.6):  # Kiste knarzt
    n = int(L * SR); x = np.arange(n) / SR
    return bp(np.sign(np.sin(2 * np.pi * np.cumsum(140 + 60 * np.sin(2 * np.pi * 3 * x)) / SR)) * (rng.random(n) > 0.3), 300, 2500) * np.sin(np.pi * x / L)
def bell():
    n = int(1.0 * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * x) * a for f, a in ((2637, 1), (3951, 0.5), (5274, 0.25))) * env(n, 0.001, 0.25)
def burp():
    n = int(0.9 * SR); x = np.arange(n) / SR
    f = 95 - 25 * x / 0.9
    return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.6 + lp(rng.normal(0, 1, n), 500)) * (1 + 0.8 * np.sin(2 * np.pi * 31 * x)) * np.minimum(1, x / 0.03) * np.exp(-np.maximum(0, x - 0.5) * 6)
def riser(L):
    n = int(L * SR); x = np.arange(n) / SR
    return (bp(rng.normal(0, 1, n), 800, 6000) * 0.6 + np.sin(2 * np.pi * np.cumsum(200 + 1800 * (x / L) ** 2) / SR) * 0.4) * (x / L) ** 2


def horn(L=0.22):
    n = int(L * SR); x = np.arange(n) / SR
    return (np.sign(np.sin(2 * np.pi * 330 * x)) * 0.5 + np.sign(np.sin(2 * np.pi * 415 * x)) * 0.4) * np.minimum(1, x / 0.01) * np.minimum(1, (L - x) / 0.03)
def hammer():
    n = int(0.25 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 900 * x) * 0.5 + bp(rng.normal(0, 1, n), 1500, 6000)) * env(n, 0.001, 0.04)
def slither(L):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 300, 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * x)) * np.minimum(1, x / 0.2) * np.minimum(1, (L - x) / 0.2)


def meow():
    n = int(0.45 * SR); x = np.arange(n) / SR
    f = 700 + 500 * np.sin(np.pi * x / 0.45) ** 0.7
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR)) * np.sin(np.pi * x / 0.45) ** 0.6
def fanfare():
    out = np.zeros(int(0.9 * SR))
    for i, f in enumerate((523, 659, 784, 1047)):
        n = int(0.35 * SR); x = np.arange(n) / SR; s = (np.sign(np.sin(2 * np.pi * f * x)) * 0.3 + np.sin(2 * np.pi * f * x)) * env(n, 0.005, 0.12)
        i0 = int(i * 0.13 * SR); out[i0:i0 + n] += s[: len(out) - i0]
    return out
def jingle():
    out = np.zeros(int(0.6 * SR))
    for i in range(5):
        n = int(0.2 * SR); x = np.arange(n) / SR; i0 = int(i * 0.07 * SR); out[i0:i0 + n] += np.sin(2 * np.pi * (3000 + 500 * (i % 3)) * x) * env(n, 0.001, 0.04)
    return out
def paper():
    n = int(0.25 * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 2000, 8000) * np.sin(np.pi * x / 0.25) ** 2


def drumroll(L):
    n = int(L * SR); s = np.zeros(n); m = int(0.05 * SR)
    for i in range(0, n - m, int(0.035 * SR)): s[i:i + m] += lp(rng.normal(0, 1, m), 2500) * env(m, 0.001, 0.015) * (0.3 + 0.7 * i / n)
    return s
def coin():
    n = int(0.35 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1976 * x) * (x < 0.07) + np.sin(2 * np.pi * 2637 * x) * (x >= 0.07)) * env(n, 0.001, 0.12)


# ------------------------------------------------------------ Effekte platzieren
B = T["b"]
k = 0.0
while k < T["done"]:                                                    # Timer tickt durch bis 0:00 (zum Ende hin schneller)
    place(k, tick(1500 if k < T["done"] - 4 else 1900), 0.16); k += 0.5 if k < T["done"] - 4 else 0.25
for i, t0 in enumerate(B):                                              # jedes Gebäude: Whoosh + Einschlag
    place(max(0, t0 - 0.2), whoosh(0.22), 0.4); place(t0, boom(), 0.8); place(t0 + 0.02, thud(), 0.6); place(t0 + 0.16, ding(1568 + 90 * i), 0.22)
place(B[0] + 0.4, cheer(1.0), 0.35)                                      # Stadion: Jubel
place(T["jets"] - 0.05, whoosh(0.9), 0.75); place(T["jets"] + 0.25, boom(), 0.9); place(T["jets"] + 0.3, roar(0.6), 0.4)   # Jets + Überschallknall
place(B[2] + 0.3, growl(0.5), 0.3)                                       # Zoo
place(B[3] + 0.3, grunt(), 0.4); place(B[3] + 0.48, grunt(), 0.4)        # Tierheim: wuff wuff
place(B[4] + 0.32, fump(), 0.8); place(B[4] + 0.4, whoosh(0.35), 0.5); place(B[4] + 0.75, boom(), 1.0); place(B[4] + 0.78, glass(0.6), 0.3)   # Burek-Kanone trifft die Kamera
for j in range(7): place(B[5] + 0.15 + j * 0.09, coin(), 0.3)            # Token-Haus
place(T["sami"], pop(700), 0.35); place(T["wo"] + 0.3, womp(), 0.45)     # „Wo bin ich?“ -> Stille
place(B[6] + 0.1, cheer(1.2), 0.5); place(B[6] + 0.05, fanfare(), 0.35); place(T["lehr"] + 0.1, bell(), 0.3)
place(T["plus"], riser(B[7] - T["plus"]), 0.3)
place(T["done"], boom(), 0.9); place(T["done"] + 0.05, fanfare(), 0.6); place(T["done"] + 0.1, cheer(1.0), 0.5)
for j in range(4): place(T["done"] + 0.2 + j * 0.18, zap(), 0.25)
place(T["alarm"], siren(T["follow"] - T["alarm"]), 0.5); place(T["alarm"] + 0.3, whoosh(0.8), 0.45)
place(T["kommt"], drone(T["follow"] - T["kommt"]), 0.8); place(T["kommt"] + 0.45, growl(1.0), 0.6); place(T["kommt"] + 0.1, stomp(), 0.6); place(T["kommt"] + 0.7, stomp(), 0.6)
place(T["follow"], whoosh(0.4), 0.45); place(T["follow"] + 0.15, pop(800), 0.35); place(T["rakete"], ding(1976), 0.3)
place(T["was"], thud(), 0.5); place(T["was"] + 0.15, pop(750), 0.35); place(T["dein"], pop(900), 0.35); place(T["dein"] + 0.2, ding(2093), 0.3)

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "build", "voice.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, np.float32).copy(); voice = voice / (np.abs(voice).max() + 1e-9)
fx = fx / (np.abs(fx).max() + 1e-9) * 0.34
from scipy.ndimage import uniform_filter1d
venv = uniform_filter1d(np.abs(np.pad(voice, (0, max(0, N - len(voice))))[:N]), int(0.03 * SR))
mask = (venv > 0.03).astype(np.float32)
duck = np.zeros(N, np.float32); g = 0.0; att, rel = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.25 * SR))
for i in range(0, N, 64):
    tgt = mask[i]; c = att if tgt > g else rel; g = tgt + (g - tgt) * c ** 64; duck[i:i + 64] = g
duck = np.maximum(duck, np.roll(duck, -int(0.08 * SR)))   # Vorausschau: schon kurz vor dem Wort leiser
fx *= (1 - 0.86 * duck)
mixd = fx.copy(); mixd[: min(N, len(voice))] += voice[:N]
mixd = mixd / (np.abs(mixd).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.repeat(mixd[:, None], 2, 1) * 32767).astype(np.int16).tobytes())


# ------------------------------------------------------------ Musik (Kevin MacLeod, incompetech.com, CC BY 4.0)
def read(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2)
def norm(x): return x / (np.sqrt((x ** 2).mean()) + 1e-9) * 0.12
MC = os.path.join(HERE, "build", "music_cand")
parts = [
    ("EDM_Detection_Mode.mp3", 15.0, 0.0, T["wo"] + 0.3, 1.0),                    # Speedrun: treibender Beat ab dem Drop
    ("EDM_Detection_Mode.mp3", 30.0, T["hier"] - 0.04, T["alarm"], 1.1),           # nach der Stille: Drop
    ("Volatile_Reaction.mp3", 32.0, T["alarm"], T["follow"], 0.8),                # Alarm
    ("EDM_Detection_Mode.mp3", 45.0, T["follow"], EV["duration"], 0.95),           # Bordkarte + Aufruf
]
m = np.zeros((N, 2), np.float32); xf = int(0.04 * SR)
for f, off, a, b, g in parts:
    src = norm(read(os.path.join(MC, f))[int(off * SR):]) * g
    i0, i1 = int(a * SR), min(N, int(b * SR)); seg = src[: i1 - i0].copy()
    rin = np.clip(np.arange(len(seg)) / xf, 0, 1); rout = np.clip((len(seg) - np.arange(len(seg))) / xf, 0, 1)
    m[i0:i0 + len(seg)] += seg * (rin * rout)[:, None]
m *= (1 - 0.86 * duck)[:, None]
end = N - int(0.25 * SR); m[end:] *= np.linspace(1, 0, N - end)[:, None]
with wave.open(os.path.join(HERE, "build", "music.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m / (np.abs(m).max() + 1e-9) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav + music.wav", EV["duration"], "s")
