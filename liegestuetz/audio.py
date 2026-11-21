"""Ton für die Liegestütze: eigene Musik (ruhiger Start, Beat ab 1,3 s) + dumpfer Aufprall, wenn eine Figur aufgibt."""
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

EV = json.load(open(os.path.join(B, "events.json")))
DUR = EV["duration"]
subprocess.run([sys.executable, os.path.join(HERE, "..", "tools", "synth_music.py"), os.path.join(B, "music.wav"), str(DUR + 1), "96", "cool", "7"], check=True)
w = wave.open(os.path.join(B, "music.wav"))
m = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, w.getnchannels()) / 32768
n = int(DUR * SR)
m = m[:n]
t = np.arange(len(m)) / SR
env = np.where(t < 1.3, 0.25, 1.0) * np.clip((DUR - 0.9 - t) / 1.2, 0, 1)
m = m * env[:, None]

tr = Track(DUR, seed=4)
# leises Atmen/Anstrengen bei jeder Wiederholung (nur Ego und Obsession, gegen Ende)
for i, reps in enumerate(EV["reps"]):
    for r in reps:
        tr.place(r, tr.lp(tr.noise(0.18), 900) * np.sin(np.pi * tr.x(0.18) / 0.18) ** 2, 0.04 + 0.02 * (i >= 2), pan=-0.4 if i % 2 == 0 else 0.4)
for i, tl in enumerate(EV["lie"]):
    if tl:
        tr.place(tl + 0.25, tr.thump(55, 8), 0.7, pan=-0.4 if i % 2 == 0 else 0.4)
        tr.place(tl + 0.25, tr.step(), 0.5)
out = np.zeros((n, 2), np.float32)
out[: len(m)] += m * 0.8
out += tr.buf[:n] * 0.6
out /= max(1e-6, np.abs(out).max()) / 0.93
with wave.open(os.path.join(B, "audio.wav"), "wb") as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok")
