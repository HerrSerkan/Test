"""Ton für "Mach den Ton aus." – bewusst ohne Aufprall-Geräusch des Würfels (das ist ja der Witz);
nur Kino-Raum, Blasen, Zeitlupe, Popcorn, Riss. Musik mit tools/mix_music.py darunter."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
D = E["duration"]
tr = Track(D, 14)
tr.place(0, tr.room(D, 250), 0.25)
for t in E["speech"]:
    tr.place(t, tr.pop(780), 0.2)
a, b = E["slow"]
tr.place(a, tr.glide(900, 180, 0.7), 0.12); tr.place(a, tr.whoosh(0.6), 0.15)
tr.place(b, tr.glide(180, 700, 0.4), 0.08)
tr.place(E["now"], tr.crunch(0.3), 0.4, pan=-0.5); tr.place(E["now"] + 0.4, tr.crunch(0.25), 0.3, pan=-0.5)
tr.place(E["now"] + 0.45, tr.thump(110, 14), 0.25, pan=-0.5)
x = tr.x(0.5)
tr.place(E["crack"], tr.bp(tr.noise(0.5), 2000, 9000) * np.exp(-x * 9) * (tr.rng.random(len(x)) > 0.4), 0.5)
tr.place(E["crack"], tr.tick(3200), 0.3)
tr.place(E["fact"], tr.thump(65, 8), 0.45); tr.place(E["fact"] + 0.05, tr.sparkle(2093), 0.09)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", D)
