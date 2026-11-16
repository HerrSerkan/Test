"""Ton für "Gleicher Film." – Effekte (Musik über tools/mix_music.py)."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
tr = Track(E["duration"], 79)
x = tr.x(E["duration"])
tr.place(0, tr.lp(tr.noise(E["duration"]), 200) * 0.4 + np.sin(2 * np.pi * 55 * x) * 0.03, 0.08)   # Kinosaal-Rauschen
for i, t in enumerate(E["crunch"]):
    tr.place(t, tr.crunch(0.2), 0.25 + i * 0.05, pan=-0.3)
    tr.place(t + 0.05, tr.crunch(0.15), 0.18 + i * 0.04, pan=-0.3)
tr.place(E["crunch"][0], tr.glide(180, 420, E["big"] - E["crunch"][0]) * 0.5, 0.06, pan=0.4)      # Wut steigt
tr.place(E["offer"], tr.pop(760), 0.3, pan=-0.3)
tr.place(E["nein"], tr.pop(820), 0.3, pan=0.4)
tr.place(E["big"], tr.crunch(0.35), 0.6, pan=-0.2); tr.place(E["big"], tr.thump(70, 9), 0.5)
tr.place(E["fact"], tr.thump(), 0.5); tr.place(E["fact"] + 0.05, tr.sparkle(), 0.07)
xr = tr.x(0.4)
tr.place(E["rip"], tr.bp(tr.noise(0.4), 1500, 8000) * (0.5 + 0.5 * np.abs(np.sin(xr * 120))) * np.exp(-xr * 3), 0.4, pan=-0.3)
tr.place(E["back"], tr.whoosh(0.4), 0.12)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", E["duration"])
