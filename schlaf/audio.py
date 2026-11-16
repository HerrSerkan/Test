"""Ton für "1760 vs. 2026" – Effekte (Musik über tools/mix_music.py)."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
tr = Track(E["duration"], 89)
tr.place(0, tr.room(E["modern"], 260), 0.05)
x = tr.x(0.4)
tr.place(E["blow"] - 0.2, tr.bp(tr.noise(0.4), 300, 2000) * np.sin(np.pi * x / 0.4), 0.3, pan=-0.5)    # Auspusten
for t in np.arange(E["blow"] + 0.6, E["wake"] - 0.3, 1.6):
    tr.place(t, tr.lp(tr.noise(1.0), 280) * np.sin(np.pi * tr.x(1.0) / 1.0) ** 2, 0.15)                # ruhiges Schnarchen
tr.place(E["dawn"] + 0.3, tr.glide(700, 1400, 0.25) * 0.5, 0.08, pan=0.5)                               # Hahn (angedeutet)
tr.place(E["dawn"] + 0.6, tr.glide(900, 1700, 0.5) * 0.5, 0.08, pan=0.5)
for k in range(4):
    tr.place(E["wake"] + k * 0.3, tr.glide(3000, 4200, 0.12), 0.05, pan=0.4)                            # Vögel
tr.place(E["wake"], tr.bell(1046.5, 1.2), 0.05)
tr.place(E["roll"], tr.whoosh(0.8), 0.25)
for i in range(10):
    tr.place(E["roll"] + i * 0.07, tr.tick(2000 + i * 120), 0.07)
tr.place(E["modern"], tr.room(E["duration"] - E["modern"], 180), 0.05)
for t in np.arange(E["modern"] + 0.2, E["put"], 0.5):
    tr.place(t, tr.tick(4200), 0.04)                                                                    # Scrollen
def buzz(L=0.5):
    xx = tr.x(L); return np.sign(np.sin(2 * np.pi * 150 * xx)) * 0.3 * (np.sin(2 * np.pi * 8 * xx) > 0)
for t in (E["buzz1"], E["buzz2"]):
    tr.place(t, tr.lp(buzz(), 800), 0.25, pan=-0.5)
for k in range(5):
    xx = tr.x(0.09); tr.place(E["alarm"] + k * 0.18, np.sign(np.sin(2 * np.pi * 2000 * xx)) * 0.3, 0.12, pan=-0.5)
tr.place(E["painting"], tr.whoosh(0.5), 0.15); tr.place(E["painting"] + 0.3, tr.sparkle(1318), 0.06)
tr.place(E["facepalm"] + 0.15, tr.thump(140, 18), 0.4)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", E["duration"])
