"""Ton für "Gleiche Vorstellung." – Effekte; Musik wird mit tools/mix_music.py daruntergelegt."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
tr = Track(E["duration"], 12)
tr.place(0.15, tr.whoosh(0.3), 0.15)                                   # Karte kommt
for i, t in enumerate(E["clouds"]):
    tr.place(t, tr.puff(), 0.25, pan=(-0.5, 0, 0.5)[i])
    tr.place(t + 0.15, tr.pop(600 + i * 150), 0.22, pan=(-0.5, 0, 0.5)[i])
tr.place(1.0, tr.sparkle(2349), 0.08, pan=0.5)                          # großer Apfel glänzt
x = tr.x(1.9)
tr.place(E["strain"], tr.glide(220, 320, 1.9) * (0.6 + 0.4 * np.sin(x * 40)), 0.05)   # Anstrengen
for t in E["speech"]:
    tr.place(t, tr.pop(820), 0.2)
tr.place(E["drops"] + 0.05, tr.sparkle(2637), 0.12, pan=0.5)
for k in range(5):
    tr.place(E["spin"] + k * 0.49, tr.whoosh(0.28), 0.1, pan=0.5)
tr.place(E["big"], tr.thump(70, 8), 0.5)
tr.place(E["big"], tr.pop(500), 0.3)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", E["duration"])
