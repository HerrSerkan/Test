"""Ton für "Deine Arbeit baut ihren Berg." – Effekte (Musik über tools/mix_music.py)."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
tr = Track(E["duration"], 83)
tr.place(0, tr.room(E["duration"], 220), 0.05)
t = 0.2
while t < E["sit"]:                                            # Kurbel klackert
    if not (E["ask"] < t < E["askEnd"]):
        tr.place(t, tr.tick(900), 0.12, pan=-0.3)
    t += 0.31
for s, d in E["coins"]:
    tr.place(s, tr.pop(500), 0.12, pan=-0.1)
    if d == "boss":
        tr.place(s + 0.7, tr.coin(), 0.08, pan=0.4)
    elif d == "kosten":
        tr.place(s + 0.7, tr.thump(50, 6), 0.3, pan=-0.6)
    else:
        tr.place(s + 0.7, tr.coin(), 0.14, pan=-0.5); tr.place(s + 0.72, tr.bell(1568, 0.8), 0.04, pan=-0.5)
tr.place(E["ask"], tr.pop(620), 0.3, pan=-0.3)
tr.place(E["keep"], tr.bell(1046.5, 1.4), 0.06, pan=-0.5)
for k, t0 in enumerate((E["text1"], E["text2"])):
    for i in range(24):
        tr.place(t0 + i * 0.042, tr.tick(1800 + (i % 3) * 300), 0.05)
tr.place(E["text2"] + 1.0, tr.sparkle(1568), 0.07)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", E["duration"])
