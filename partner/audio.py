"""Ton für "Sucht euch einen Partner!" – Effekte; Musik mit tools/mix_music.py darunter."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
D = E["duration"]
tr = Track(D, 13)
x = tr.x(D)
tr.place(0, tr.bp(tr.noise(D), 300, 2500) * (0.6 + 0.4 * np.sin(x * 3.1)) * 0.5, 0.05)     # Klassenzimmer-Gemurmel
for k, t in enumerate(E["phases"]):
    tr.place(t, tr.whoosh(0.3), 0.12)
    for i in range(3):
        tr.place(t + 0.1 + i * 0.12, tr.pop(700 + i * 120), 0.18, pan=(-0.5, 0, 0.5)[i])
for t in E["low"]:                                   # Akku sackt ab
    tr.place(t - 0.6, tr.glide(700, 260, 0.6), 0.12, pan=-0.5)
tr.place(E["low"][-1], tr.tick(1800), 0.25, pan=-0.5); tr.place(E["low"][-1] + 0.25, tr.tick(1800), 0.25, pan=-0.5)
t = E["phases"][2]                                   # Herzklopfen ab der Präsentation
while t < D - 0.2:
    tr.place(t, tr.thump(55, 14), 0.22, pan=-0.4); tr.place(t + 0.16, tr.thump(50, 16), 0.15, pan=-0.4)
    t += 0.9
for t in (0.3, 5.6, 11.1):                           # Jubel des Extrovertierten
    tr.place(t, tr.sparkle(1760), 0.07, pan=0.5)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", D)
