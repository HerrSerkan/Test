"""Ton für das Adrenalin-Video: Sprecherstimme + leise eigene Musik + Effekte."""
import json
import os
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
from sfx import Track, SR  # noqa: E402

s = open(os.path.join(B, "timeline.js")).read()
TL = json.loads(s[s.index("{"): s.rindex("}") + 1])
DUR = TL["duration"]

vf = os.path.join(B, "voice_fast.wav")
if not os.path.exists(vf):   # Stimme (ElevenLabs) um 25 % beschleunigt = Länge des Originals
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(HERE, "voice", "voice.mp3"), "-af", "atempo=1.13", "-ar", str(SR), vf], check=True)
subprocess.run([sys.executable, os.path.join(HERE, "..", "tools", "synth_music.py"), os.path.join(B, "music.wav"), str(DUR + 1), "112", "cool", "11"], check=True)


def read(p):
    w = wave.open(p)
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    x = x.reshape(-1, w.getnchannels())
    if x.shape[1] == 1:
        x = np.repeat(x, 2, 1)
    assert w.getframerate() == SR
    return x


n = int(DUR * SR)
voice = read(os.path.join(B, "voice_fast.wav"))[:n]
music = read(os.path.join(B, "music.wav"))[:n]
out = np.zeros((n, 2), np.float32)
out[: len(voice)] += voice * 1.0
# Musik leise darunter, unter der Stimme etwas abgesenkt
env = np.convolve(np.abs(voice[:, 0]), np.ones(4410) / 4410, "same") if len(voice) else np.zeros(n)
duck = np.ones(n, np.float32); duck[: len(env)] = 1 - 0.45 * np.clip(env / 0.05, 0, 1)
fade = np.minimum(1, np.arange(n) / SR / 0.5) * np.clip((DUR - np.arange(n) / SR) / 1.2, 0, 1)
out[: len(music)] += music * 0.10 * (duck * fade)[: len(music), None]

tr = Track(DUR, seed=2)
S = {x["id"]: x for x in TL["shots"]}
t0 = S["bed"]["t0"]
for k in range(10):                                    # Wecker
    tr.place(t0 + 0.1 + k * 0.12, tr.bell(2600, 0.1), 0.25)
tr.place(S["wardrobe"]["t0"], tr.whoosh(0.4), 0.5)
tr.place(S["awake"]["t0"], tr.pop(400), 0.4)
for name, rate, n_ in [("pump", 1.6, 3), ("always", 1.8, 3), ("shakebed", 2.3, 4), ("gauge", 3.0, 6), ("max", 3.3, 7), ("chase", 2.4, 4), ("curb", 2.0, 4)]:
    for k in range(n_):                               # Herzschlag
        tt = S[name]["t0"] + 0.2 + k / rate
        tr.place(tt, tr.thump(55, 12), 0.45); tr.place(tt + 0.12, tr.thump(50, 14), 0.3)
tr.place(S["catch"]["t0"], tr.whoosh(0.6), 0.6)
L = 1.6; x = tr.x(L)
tr.place(S["scooter"]["t0"] + 0.3, tr.lp(tr.noise(L), 500) * np.sin(np.pi * x / L) * 0.8, 0.3)
tr.place(S["crash"]["t0"], tr.thump(45, 4), 0.9); tr.place(S["crash"]["t0"], tr.crunch(0.5), 0.8)
tr.place(TL["pops"][0]["t"], tr.bp(tr.noise(0.5), 600, 5000) * np.exp(-tr.x(0.5) * 5) * 1.5, 0.6)
tr.place(S["driver"]["t0"] + 0.2, tr.whoosh(0.5), 0.4)
for sh in TL["shots"][1:]:
    tr.place(sh["t0"], tr.whoosh(0.18), 0.05)
out += tr.buf[:n] * 0.5

out /= max(1e-6, np.abs(out).max()) / 0.95
with wave.open(os.path.join(B, "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok", DUR)
