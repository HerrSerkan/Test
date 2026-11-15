"""Ton für "Probier's jetzt. Kannst du die Zunge rollen?" – Effekte (Musik über tools/mix_music.py)."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
tr = Track(E["duration"], 67)
tr.place(0, tr.room(E["duration"], 400), 0.04)
for t in (E["tryA"], E["twinRoll"], E["try2"]):
    tr.place(t, tr.pop(380), 0.3)
for t in (E["tryA"] + 0.3, E["try2"] + 0.3):
    tr.place(t, tr.glide(220, 160, 1.2) * 0.6, 0.12, pan=0.1)
for t in (E["gen"], E["aber"]):
    tr.place(t, tr.pop(760), 0.3, pan=0.1)
tr.place(E["twinIn"], tr.whoosh(0.5), 0.18, pan=0.6)
tr.place(E["q"], tr.pop(620), 0.3, pan=-0.4)
x = tr.x(0.35)
tr.place(E["cross"], tr.bp(tr.noise(0.35), 2500, 7000) * (0.5 + 0.5 * np.sin(x * 80)) * 0.8, 0.25)
tr.place(E["noe"], tr.thump(90, 12), 0.5)
tr.place(E["fact"], tr.thump(), 0.6); tr.place(E["fact"] + 0.05, tr.sparkle(), 0.08)
tr.place(E["back"], tr.whoosh(0.45), 0.15, pan=0.6)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", E["duration"])
