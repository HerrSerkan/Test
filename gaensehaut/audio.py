"""Tonspur für "Bekommst du Gänsehaut bei Musik?": Hintergrundmusik + Soundeffekte, keine Stimme.

Musik: build/music.mp3 (ElevenLabs Music), sonst eine eigene Klavier-Musik, die beim Refrain anschwillt.
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


def whistle(f, L):
    n = int(L * SR)
    x = np.arange(n) / SR
    fr = f * (1 + 0.012 * np.sin(2 * np.pi * 6 * x))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) + band(rng.normal(0, 1, n), f * 0.8, f * 1.3) * 0.08
    return (s * np.minimum(1, x / 0.04) * np.clip((L - x) / 0.08, 0, 1)).astype(np.float32)


# ---------------------------------------------------------------- Effekte
ch = EV["chorus"]
place(ch - 0.6, whoosh(1.0, 300, 6000, rise=True), 0.12)
place(ch, bell(1568, 2.0), 0.04)
g0, g1 = EV["goose"]
n = int((g1 - g0) * SR)
x = np.arange(n) / SR
shimmer = band(rng.normal(0, 1, n), 5000, 12000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * x)) * np.minimum(1, x / 0.3) * np.clip((g1 - g0 - x) / 0.5, 0, 1)
place(g0, shimmer.astype(np.float32), 0.06, -0.3)
for k in range(8):
    place(g0 + 0.2 + k * 0.3, tone(2600 + k * 150, 3000 + k * 150, 0.06, 30, (1, 0.1)), 0.02, -0.3)
for k, ts in enumerate(EV["speech"]):
    place(ts, tone(700, 1100, 0.08, 30, (1, 0.2)), 0.09, [0.3, -0.3][k])
place(EV["switch"], bell(1318.5, 1.6), 0.05)
place(EV["switch"] + 0.1, bell(1975.5, 1.6), 0.035)


# ---------------------------------------------------------------- Musik: Klavier + Streicher, Anschwellen beim Refrain
def synth_music():
    T = np.arange(N) / SR
    m = np.zeros((N, 2), np.float32)
    hz = lambda nn: 440 * 2 ** ((nn - 69) / 12)
    chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]   # Am F C G
    beat = 60 / 76
    swell = np.interp(T, [0, ch - 1.5, ch, EV["switch"], EV["switch"] + 1.5, DUR], [0.25, 0.35, 1.0, 1.0, 0.35, 0.3])
    k = 0
    tt = 0.0
    while tt < DUR:
        c = chords[int(tt / (4 * beat)) % 4]
        for j, nn in enumerate([c[0] - 12] + c if k % 4 == 0 else [c[(k + 1) % 4] + 12]):
            L = 2.2
            nS = int(L * SR)
            x = np.arange(nS) / SR
            s = (np.sin(2 * np.pi * hz(nn) * x) + 0.3 * np.sin(4 * np.pi * hz(nn) * x) * np.exp(-x * 3)) * np.exp(-x * 1.6) * np.minimum(1, x / 0.005)
            i = int(tt * SR)
            jj = min(N, i + nS)
            m[i:jj, 0] += (s[: jj - i] * 0.08).astype(np.float32)
            m[i:jj, 1] += (s[: jj - i] * 0.07).astype(np.float32)
        k += 1
        tt += beat
    # Streicher-Fläche, schwillt beim Refrain an
    st = np.zeros(N)
    for ci in range(int(DUR / (4 * beat)) + 1):
        c = chords[ci % 4]
        t0 = ci * 4 * beat
        L = 4 * beat + 0.6
        nS = int(L * SR)
        x = np.arange(nS) / SR
        s = np.zeros(nS)
        for nn in c:
            for det in (-0.1, 0.1):
                s += np.sin(2 * np.pi * hz(nn) * (1 + det / 100) * x + nn)
        s *= np.minimum(1, x / 0.5) * np.clip((L - x) / 0.6, 0, 1)
        i = int(t0 * SR)
        jj = min(N, i + nS)
        st[i:jj] += s[: jj - i]
    st = low(st, 2200) * swell * 0.035
    m[:, 0] += st.astype(np.float32)
    m[:, 1] += st.astype(np.float32)
    for d, g in ((0.12, 0.3), (0.21, 0.2), (0.33, 0.12)):
        kk = int(d * SR)
        m[kk:] += m[:-kk] * g
    return m


t_ = np.arange(N) / SR
END_ENV = np.clip((DUR - t_) / 0.3, 0, 1).astype(np.float32) * np.minimum(1, t_ / 0.05).astype(np.float32)
MUSIC_ENV = np.ones(N, np.float32)
MUSIC_LUFS = -16.5
if not os.path.exists(os.path.join(B, "music.mp3")):
    import wave as _w
    _m = synth_music()
    _m /= np.abs(_m).max() + 1e-6
    with _w.open(os.path.join(B, "music_synth.wav"), "wb") as w_:
        w_.setnchannels(2); w_.setsampwidth(2); w_.setframerate(SR)
        w_.writeframes((np.clip(_m * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())

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
if not os.path.exists(MUSIC):
    MUSIC = os.path.join(B, "music_synth.wav")
music = np.zeros((N, 2), np.float32)
if os.path.exists(MUSIC):
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
