"""Ton für "Nicht jeder will, dass du es schaffst." – Effekte; Musik (tools/tension_music.py) mit tools/mix_music.py darunter."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
D = E["duration"]
tr = Track(D, 16)
x = tr.x(D)
tr.place(0, tr.lp(tr.noise(D), 400) * (0.7 + 0.3 * np.sin(x * 0.7)), 0.06)          # Nachtwind
tr.place(0.1, tr.pop(760), 0.25)
t = E["climb"][0]
while t < E["climb"][1]:                                                           # Kletter-Griffe
    tr.place(t, tr.crunch(0.08), 0.12, pan=0.4); t += 0.28
for k in range(10):
    tr.place(E["alert"] + k * 0.03, tr.tick(2400 + k * 60), 0.12, pan=-0.3)
    tr.place(E["alert2"] + k * 0.03, tr.tick(2400 + k * 60), 0.12, pan=-0.3)
for lvl in range(4):
    tr.place(E["stack"][0] + lvl * 0.25 + 0.5, tr.step(), 0.35, pan=0.1)
gx = tr.x(0.6)
tr.place(E["grab"][0], tr.bp(tr.noise(0.6), 300, 2000) * np.exp(-gx * 4), 0.2)
tr.place(E["fall"], tr.whoosh(0.5), 0.2)
for k in range(6):
    tr.place(E["fall"] + 0.45 + k * 0.06, tr.thump(80 + k * 10, 10), 0.3, pan=(k - 3) * 0.1)
tr.place(E["fall"] + 0.5, tr.lp(tr.noise(0.8), 800) * np.exp(-tr.x(0.8) * 4), 0.3)
tr.place(E["summit"] - 0.6, tr.glide(300, 900, 0.8), 0.06)
tr.place(E["summit"], tr.sparkle(1568), 0.15); tr.place(E["summit"], tr.bell(784, 2.0), 0.15)
tr.place(E["rope"], tr.whoosh(0.7), 0.2, pan=0.3)
for k in range(5):
    tr.place(E["pull"][0] + k * 0.26, tr.crunch(0.1), 0.1, pan=0.3)
tr.place(E["yank"], tr.whoosh(0.4), 0.3, pan=0.3)
for k in range(5):
    tr.place(E["yank"] + 0.5 + k * 0.07, tr.thump(90, 12), 0.25)
tr.place(E["yank"] + 0.7, tr.pop(500), 0.2)
tr.place(15.0, tr.sparkle(2093), 0.12)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", D)
