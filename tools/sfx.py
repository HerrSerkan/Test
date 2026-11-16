"""Kleine Klangbibliothek für die Effekt-Tonspuren (synthetisch, ohne Fremdmaterial).

    from sfx import Track
    tr = Track(dauer_s); tr.place(t, tr.pop(700), 0.3); tr.write("build/audio.wav")
"""
import wave
import numpy as np
from scipy.signal import butter, lfilter

SR = 44100


class Track:
    def __init__(self, dur, seed=1):
        self.dur = dur
        self.n = int(dur * SR)
        self.buf = np.zeros((self.n, 2), np.float32)
        self.rng = np.random.default_rng(seed)

    # -------- Werkzeuge
    def x(self, L):
        return np.arange(int(L * SR)) / SR

    def noise(self, L):
        return self.rng.normal(0, 1, int(L * SR))

    @staticmethod
    def lp(s, f):
        b, a = butter(2, f / (SR / 2)); return lfilter(b, a, s)

    @staticmethod
    def bp(s, lo, hi):
        b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, s)

    def place(self, t, sig, g=1.0, pan=0.0):
        i = int(t * SR)
        if i >= self.n or i < 0:
            return
        j = min(self.n, i + len(sig))
        s = np.asarray(sig[: j - i], np.float32) * g
        self.buf[i:j, 0] += s * (1 - max(0, pan))
        self.buf[i:j, 1] += s * (1 + min(0, pan))

    # -------- Klänge
    def pop(self, f=700):
        x = self.x(0.12)
        return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * np.minimum(1, x / 0.002) * np.exp(-x / 0.035)

    def puff(self):
        x = self.x(0.3)
        return self.lp(self.noise(0.3), 1200) * np.sin(np.pi * x / 0.3) ** 2 * 1.5

    def tick(self, f=2600):
        x = self.x(0.03)
        return np.sin(2 * np.pi * f * x) * np.exp(-x * 200)

    def bell(self, f, L=1.4):
        x = self.x(L)
        return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 2.2, 0.6), (2.76, 4, 0.2), (5.4, 6, 0.08)]) * np.minimum(1, x / 0.004)

    def whoosh(self, L=0.4):
        x = self.x(L)
        return self.lp(self.noise(L), 1200) * np.sin(np.pi * x / L) ** 2 * 1.6

    def thump(self, f=60, d=7):
        x = self.x(0.6)
        return np.sin(2 * np.pi * np.cumsum(f + 70 * np.exp(-x * 25)) / SR) * np.exp(-x * d)

    def sparkle(self, base=2093):
        out = np.zeros(int(1.2 * SR))
        for k, m in enumerate([1, 1.26, 1.5, 2, 1.5]):
            s = self.bell(base * m, 0.8) * 0.4; i = int(k * 0.08 * SR)
            out[i:i + len(s)] += s[: len(out) - i]
        return out

    def glide(self, f0, f1, L):
        x = self.x(L); f = np.linspace(f0, f1, len(x))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / L) ** 1.5

    def crunch(self, L=0.18):
        x = self.x(L)
        return self.bp(self.noise(L), 1500, 7000) * (self.rng.random(len(x)) > 0.6) * np.exp(-x * 12) * 2

    def coin(self):
        x = self.x(0.5)
        return sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) * g for f, d, g in [(2637, 7, 0.4), (3520, 9, 0.3), (5274, 14, 0.15)]) * np.minimum(1, x / 0.002)

    def step(self):
        x = self.x(0.12)
        return self.lp(self.noise(0.12), 500) * np.exp(-x * 45) * 1.6

    def room(self, L, f=300):
        return self.lp(self.noise(L), f) * 0.25

    # -------- Ausgabe
    def write(self, path, drive=1.15):
        peak = np.abs(self.buf).max() + 1e-6
        out = np.tanh(self.buf / peak * drive) * 0.9
        with wave.open(path, "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
