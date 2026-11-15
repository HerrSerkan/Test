"""Ton für "Wessen Stimme liest das gerade?" – Effekte (Musik über tools/mix_music.py)."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
tr = Track(E["duration"], 71)
tr.place(0, tr.room(E["duration"], 350), 0.04)
for t in np.arange(0.4, E["duration"] - 0.5, 2.6):                 # Seiten umblättern
    x = tr.x(0.25); tr.place(t, tr.bp(tr.noise(0.25), 1500, 6000) * np.sin(np.pi * x / 0.25) * 0.6, 0.12, pan=0.2)
tr.place(E["clouds"], tr.pop(520), 0.25); tr.place(E["clouds"] + 0.08, tr.pop(640), 0.25)
for t in (E["door"], E["hate"], E["psst2"]):
    tr.place(t, tr.pop(760), 0.28, pan=-0.4)
tr.place(E["past"], tr.thump(100, 14), 0.35, pan=-0.4); tr.place(E["past"], tr.pop(900), 0.3, pan=-0.4)
x = tr.x(0.5)
tr.place(E["psst"], tr.bp(tr.noise(0.5), 3000, 8000) * np.sin(np.pi * x / 0.5) * 0.8, 0.3, pan=-0.4)
tr.place(E["q"], tr.pop(620), 0.28, pan=0.4)
tr.place(E["fact"], tr.thump(), 0.6); tr.place(E["fact"] + 0.05, tr.sparkle(), 0.08)
tr.place(E["back"], tr.whoosh(0.4), 0.12)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", E["duration"])
