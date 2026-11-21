"""Ton für das Muskel-Video: Sprecherstimme + leise eigene Musik + Effekte an den Comic-Wörtern."""
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
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(HERE, "voice", "voice.mp3"), "-af", "atempo=1.25", "-ar", str(SR), vf], check=True)
subprocess.run([sys.executable, os.path.join(HERE, "..", "tools", "synth_music.py"), os.path.join(B, "music.wav"), str(DUR + 1), "108", "verspielt", "4"], check=True)


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
for p in TL["pops"]:
    t = p["t"]
    if p["text"] in ("ZACK!", "KRACKS"):
        tr.place(t, tr.thump(80, 10), 0.5); tr.place(t, tr.crunch(), 0.4)
    elif p["text"] == "ZISCH!":
        tr.place(t, tr.whoosh(0.6), 0.6)
    elif p["text"] == "PLOPP":
        tr.place(t, tr.pop(500), 0.6)
    else:
        tr.place(t, tr.pop(800), 0.35)
for sh in TL["shots"][1:]:
    tr.place(sh["t0"], tr.whoosh(0.18), 0.06)
out += tr.buf[:n] * 0.5

out /= max(1e-6, np.abs(out).max()) / 0.95
with wave.open(os.path.join(B, "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok", DUR)
