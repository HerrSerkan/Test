"""Ton für "Gleicher Freund." – Effekte (Musik über tools/mix_music.py)."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
tr = Track(E["duration"], 73)
tr.place(0, tr.room(E["duration"], 500), 0.05)
t = E["walkIn"]
while t < E["arrive"]:
    tr.place(t, tr.step(), 0.18, pan=0.6); t += 0.22
tr.place(E["hey"], tr.pop(820), 0.3, pan=0.5)
for t in (E["okL"], E["ok"], E["capOn"] + 0.2):
    tr.place(t, tr.bell(1318.5, 0.8), 0.06)
tr.place(E["face"], tr.pop(600), 0.25)
tr.place(E["x"], tr.glide(400, 220, 0.3), 0.12)
tr.place(E["du"], tr.pop(900), 0.3); tr.place(E["du"] + 0.1, tr.pop(1000), 0.25)
x = tr.x(0.3)
for t in (E["capOff"], E["capOn"] - 0.1):
    tr.place(t, tr.bp(tr.noise(0.3), 800, 4000) * np.sin(np.pi * x / 0.3), 0.18, pan=0.5)
for t in (E["q"], E["fq"]):
    tr.place(t, tr.pop(620), 0.28)
tr.place(E["meet"], tr.pop(760), 0.3)
tr.place(E["fact"], tr.thump(), 0.6); tr.place(E["fact"] + 0.05, tr.sparkle(), 0.08)
tr.place(E["ah"], tr.pop(900), 0.3)
tr.place(E["back"], tr.whoosh(0.4), 0.12)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", E["duration"])
