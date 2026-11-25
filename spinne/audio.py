"""Ton für "Gleiche Spinne." – Effekte; Musik (spukig-verspielt) mit tools/mix_music.py darunter."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
D = E["duration"]
tr = Track(D, 15)
tr.place(0, tr.room(D, 200), 0.2)
tr.place(0.0, tr.glide(1400, 500, 1.4) * 0.5, 0.06)                 # Spinne seilt sich ab
for t in E["speech"]:
    tr.place(t, tr.pop(800), 0.18)
tr.place(E["clack"], tr.tick(2200), 0.5, pan=-0.5); tr.place(E["clack"], tr.thump(140, 18), 0.4, pan=-0.5)
tr.place(E["where"], tr.whoosh(0.5), 0.12)
tr.place(E["head"], tr.glide(1200, 400, 0.3), 0.08, pan=0.5); tr.place(E["head"] + 0.3, tr.pop(300), 0.2, pan=0.5)
x = tr.x(0.7)
tr.place(E["scream"], tr.bp(tr.noise(0.7), 1500, 5000) * np.sin(np.pi * x / 0.7) * 0.8, 0.35, pan=0.4)
tr.place(E["scream"], tr.glide(900, 1400, 0.7) * 0.6, 0.12, pan=0.4)
tr.place(E["save"], tr.sparkle(1760), 0.1)
tr.place(E["big"], tr.thump(70, 8), 0.45); tr.place(E["big"], tr.pop(520), 0.25)
tr.place(E["again"], tr.glide(1400, 600, 1.2) * 0.5, 0.06, pan=0.5)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", D)
