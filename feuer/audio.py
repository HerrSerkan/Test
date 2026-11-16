"""Tonspur für "Homo Erectus vs. Homo Sapiens": Hintergrundmusik + Soundeffekte, keine Stimme.

Musik: build/music.mp3 (ElevenLabs Music), sonst eine synthetische Steinzeit-Musik (Rahmentrommel, Fläche, Holzflöte).
"""
import json
import os
import wave

import numpy as np
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
EV = json.load(open(os.path.join(B, "events.json")))
DUR = EV["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(4)
out = np.zeros((N, 2), np.float32)


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
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
    out[i:j, 0] += s * (1 - max(0, pan))
    out[i:j, 1] += s * (1 + min(0, pan))


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x * d)


def stone(f=1.0):
    """Ziegel wird abgesetzt: kurzes Klacken + dumpfer Körper"""
    n = int(0.25 * SR)
    x = np.arange(n) / SR
    s = band(rng.normal(0, 1, n), 700 * f, 3200 * f) * env(n, 0.0008, 70)
    s += np.sin(2 * np.pi * 140 * f * x) * env(n, 0.001, 32) * 0.7
    s += band(rng.normal(0, 1, n), 150, 600) * env(n, 0.001, 40) * 0.6
    return s.astype(np.float32)


def tap(f=4200):
    n = int(0.05 * SR)
    return (band(rng.normal(0, 1, n), f * 0.7, min(f * 1.4, 20000)) * env(n, 0.0005, 160)).astype(np.float32)


def thud(f=1.0, L=0.45):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum((50 + 80 * np.exp(-x * 18)) * f) / SR) * env(n, 0.002, 10)
    s += low(rng.normal(0, 1, n), 700) * env(n, 0.001, 35) * 0.5
    return s.astype(np.float32)


def rustle(L=0.35, lo=1200, hi=6000):
    n = int(L * SR)
    x = np.arange(n) / SR
    am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 13 * x + rng.uniform(0, 3)))
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * am).astype(np.float32)


def whoosh(L, lo, hi, rise=False):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2
    if rise:
        s = s * (x / L) ** 0.5 + band(rng.normal(0, 1, n), hi, min(hi * 2.5, 18000)) * (x / L) ** 2 * np.sin(np.pi * x / L) * 0.5
    return (s * 1.6).astype(np.float32)


def bell(f, L=1.8):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * gg for m, d, gg in
            [(1, 2.2, 0.6), (2.0, 3.5, 0.2), (3.01, 5, 0.12), (5.4, 7, 0.06)])
    return (s * np.minimum(1, x / 0.003)).astype(np.float32)


def breath(L=0.9):
    n = int(L * SR)
    x = np.arange(n) / SR
    e = np.sin(np.pi * x / L) ** 1.5 * np.exp(-x * 1.2)
    return (band(rng.normal(0, 1, n), 350, 2200) * e).astype(np.float32)



def tone(f0, f1, L, d=8, harm=(1, 0.2)):
    n = int(L * SR)
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    return (sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm)) * env(n, 0.003, d)).astype(np.float32)


def piece(t, pts):
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


T = np.arange(N) / SR

# ---------------------------------------------------------------- Effekte
# Lagerfeuer-Knistern, Lautstärke folgt dem Feuer (oben links, unten rechts im Stereobild)
def crackle(level, pan):
    n = N
    base = band(rng.normal(0, 1, n), 300, 2500) * 0.25
    pops = np.zeros(n)
    idx = rng.integers(0, n, int(DUR * 30))
    pops[idx] = rng.uniform(0.3, 1.0, len(idx)) * np.sign(rng.normal(0, 1, len(idx)))
    pops = band(pops, 1500, 9000) * 6
    s = (base + pops) * level
    out[:, 0] += (s * (1 - max(0, pan))).astype(np.float32)
    out[:, 1] += (s * (1 + min(0, pan))).astype(np.float32)


crackle(piece(T, EV["fireTop"]) * 0.10, -0.35)
crackle(piece(T, EV["fireBot"]) * 0.10, 0.35)
place(EV["fireOut"], whoosh(0.8, 200, 2500), 0.2)
place(EV["fireOut"] + 0.1, rustle(0.8, 2000, 8000), 0.1)
# Panik: hektische Wischer
tt = EV["panic"][0]
while tt < EV["panic"][1]:
    place(tt, rustle(0.18, 1500, 7000), 0.12, pan=rng.uniform(-0.6, 0.2))
    tt += 0.12
# Kälte: Wind in der Nacht
a, b = EV["cold"]
n = int((b - a + 1.5) * SR)
x = np.arange(n) / SR
wind = band(rng.normal(0, 1, n), 250, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * x)) * np.minimum(1, x / 0.8) * np.clip((b - a + 1.5 - x) / 0.8, 0, 1)
place(a, wind.astype(np.float32), 0.35, pan=-0.2)
# Blitz und Donner, Baum fängt Feuer
place(EV["lightning"], whoosh(0.12, 3000, 12000), 0.5, pan=0.5)
place(EV["lightning"] + 0.03, thud(0.6, 1.6), 0.55, pan=0.3)
n = int(2.2 * SR)
x = np.arange(n) / SR
rumble = low(rng.normal(0, 1, n), 180) * np.exp(-x * 1.4) * 3
place(EV["lightning"] + 0.08, rumble.astype(np.float32), 0.45)
place(EV["treeFire"], whoosh(0.6, 150, 1500), 0.25, pan=0.6)
# Laufen, Fackel greifen, Feuer neu entfachen
for r0, r1 in EV["run"]:
    tt = r0
    while tt < r1:
        place(tt, thud(2.4, 0.12), 0.18, pan=0.3)
        tt += 0.14
place(EV["grab"], whoosh(0.4, 600, 4000), 0.2, pan=0.6)
for tr in (EV["relightTop"], EV["relightBot"]):
    place(tr, whoosh(0.7, 120, 1400), 0.35)
    place(tr + 0.05, thud(1.2, 0.5), 0.2)
place(EV["cheer"], bell(784, 1.4), 0.06)
place(EV["cheer"] + 0.08, bell(1175, 1.4), 0.05)
# Feuerstein: harte Klicks
for s in EV["strikes"]:
    place(s, tap(4200), 0.35, pan=0.2)
    place(s + 0.005, stone(1.6), 0.12, pan=0.2)
place(EV["spearAim"], whoosh(0.35, 1000, 6000), 0.15, pan=0.5)
for tl in EV["lieDown"]:
    place(tl, rustle(0.35), 0.08, pan=0.2)
for ti in EV["icons"]:
    place(ti, tone(700, 1100, 0.08, 30, (1, 0.2)), 0.08, pan=0.1)
# Leichter Schlaf: Ast knackt, alle schrecken hoch
for tj in EV["jolts"]:
    place(tj - 0.1, tap(2200), 0.25, pan=0.7)
    place(tj, rustle(0.3), 0.12, pan=-0.3)
place(EV["alarm"] - 0.1, tap(1800), 0.35, pan=0.8)
place(EV["alarm"] - 0.08, tap(2600), 0.25, pan=0.8)
place(EV["alarm"], thud(0.8, 0.8), 0.3)
place(EV["alarm"] + 0.05, rustle(0.5, 1200, 6000), 0.15)
# Morgen: Vögel
for k in range(10):
    f0 = rng.uniform(2800, 4200)
    place(EV["dawn"] + 0.4 + k * rng.uniform(0.18, 0.35), tone(f0, f0 * 1.35, 0.07, 30, (1, 0.1)), 0.035, pan=rng.uniform(-0.7, 0.7))
# Schluss-Text
place(EV["final"], thud(0.7, 1.0), 0.4)
place(EV["final"], whoosh(0.5, 300, 4000), 0.15)


# ---------------------------------------------------------------- Musik (synthetisch, falls keine music.mp3 da ist)
def synth_music():
    m = np.zeros((N, 2), np.float32)
    hz = lambda n: 440 * 2 ** ((n - 69) / 12)
    # Fläche: d-dorisch, Akkorde wechseln alle 4 s
    chords = [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 60]]
    dark = np.interp(T, [0, 2, 3.5, 13.5, 15, DUR], [0.8, 0.8, 0.55, 0.55, 1.0, 1.0])
    for ci in range(int(DUR / 4) + 1):
        t0 = ci * 4 - 0.5
        n = int(5 * SR)
        x = np.arange(n) / SR
        e = np.minimum(1, x / 1.2) * np.clip((5 - x) / 1.2, 0, 1)
        s = np.zeros(n)
        for k, note in enumerate(chords[ci % 4]):
            for det in (-0.08, 0.08):
                s += np.sin(2 * np.pi * hz(note) * (1 + det / 100) * x + k) * (0.5 if k == 0 else 0.3)
        s = low(s * e, 1200)
        i = int(t0 * SR)
        a, b = max(0, i), min(N, i + n)
        if b > a:
            m[a:b, 0] += s[a - i:b - i] * 0.12
            m[a:b, 1] += s[a - i:b - i] * 0.12
    m *= dark[:, None]
    # Rahmentrommel: tiefer Puls, nachts leiser und langsamer
    beat = 60 / 80
    k = 0
    tt = 0.0
    while tt < DUR - 0.5:
        night = 3.0 < tt < 13.8
        if not night or k % 2 == 0:
            n = int(0.6 * SR)
            x = np.arange(n) / SR
            dr = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-x * 20)) / SR) * np.exp(-x * 7)
            dr += band(rng.normal(0, 1, n), 200, 900) * np.exp(-x * 30) * 0.3
            g = (0.35 if k % 4 == 0 else 0.2) * (0.6 if night else 1.0)
            i = int(tt * SR)
            j = min(N, i + n)
            m[i:j, 0] += (dr[: j - i] * g).astype(np.float32)
            m[i:j, 1] += (dr[: j - i] * g).astype(np.float32)
        k += 1
        tt += beat / 2 if (tt > 13.8) else beat
    # Holzflöte: einfache Melodie mit Vibrato und Atem
    melody = [(0.4, 74, 1.2), (1.8, 72, 0.6), (2.5, 69, 1.6), (6.8, 67, 1.0), (8.0, 69, 0.8), (8.9, 72, 1.4),
              (14.3, 74, 0.9), (15.3, 77, 0.6), (16.0, 76, 0.8)]
    for t0, note, L in melody:
        n = int(L * SR)
        x = np.arange(n) / SR
        f = hz(note) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * x) * np.minimum(1, x / 0.3))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.15 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        s += band(rng.normal(0, 1, n), 1500, 5000) * 0.15
        s *= np.minimum(1, x / 0.08) * np.clip((L - x) / 0.25, 0, 1)
        i = int(t0 * SR)
        j = min(N, i + n)
        m[i:j, 0] += (s[: j - i] * 0.08).astype(np.float32)
        m[i:j, 1] += (s[: j - i] * 0.06).astype(np.float32)
    # Hall
    for d, g in ((0.11, 0.3), (0.19, 0.2), (0.31, 0.12)):
        k = int(d * SR)
        m[k:] += m[:-k] * g
    return m


t_ = T
END_ENV = np.clip((DUR - t_) / 0.5, 0, 1).astype(np.float32)
MUSIC_ENV = np.minimum(1, t_ / 0.15).astype(np.float32)
MUSIC_LUFS = -17.5
if not os.path.exists(os.path.join(B, "music.mp3")):
    SYNTH = synth_music()
else:
    SYNTH = None

# ---------------------------------------------------------------- Ausgabe: Effekte + Hintergrundmusik
import re
import subprocess
from scipy.ndimage import maximum_filter1d, minimum_filter1d

t = np.arange(N) / SR
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


def to_lufs(x, target, lim=True):
    gdb = 0.0
    for _ in range(4):
        y = x * 10 ** (gdb / 20)
        gdb += target - lufs(limit(y) if lim else y)
    y = x * 10 ** (gdb / 20)
    return limit(y) if lim else y


# Effekte allein auf -16 LUFS
sfx = out / (np.abs(out).max() + 1e-6)
sfx = to_lufs(sfx, -16.0)
# Hintergrundmusik (ElevenLabs Music, build/music.mp3) etwas leiser darunter
MUSIC = os.path.join(B, "music.mp3")
music = np.zeros((N, 2), np.float32)
if SYNTH is not None:
    music = to_lufs(SYNTH * MUSIC_ENV[:, None], MUSIC_LUFS, lim=False)
elif os.path.exists(MUSIC):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", MUSIC, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    m = np.frombuffer(raw, np.float32).reshape(-1, 2)[:N]
    music[: len(m)] = m
    music *= MUSIC_ENV[:, None]
    music = to_lufs(music, MUSIC_LUFS, lim=False)
mix = sfx + music
mix *= END_ENV[:, None]
mix = to_lufs(mix, -14.0)                  # gesamt exakt -14 LUFS (EBU R128), Spitzen unter -2 dBFS
os.remove(TMP)
write(os.path.join(B, "audio.wav"), mix)
print("audio.wav geschrieben:", DUR, "s")
