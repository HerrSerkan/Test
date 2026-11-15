"""Ton für "Schließ die Augen. Wo ist Dezember?" – Effekte (Musik über tools/mix_music.py)."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, "build", "events.json")))
tr = Track(E["duration"], 61)
tr.place(0, tr.room(E["duration"]), 0.04)
notes = [523.3, 587.3, 659.3, 698.5, 784.0, 880.0, 987.8, 1046.5, 1174.7, 1318.5, 1396.9, 1568.0]
for i, f in enumerate(notes):
    tr.place(E["months"] + i * 0.13, tr.bell(f, 0.6), 0.05, pan=0.4)
tr.place(E["think"], tr.pop(620), 0.3, pan=-0.4)
tr.place(E["da"], tr.pop(820), 0.3, pan=0.4); tr.place(E["da"] + 0.05, tr.bell(1760, 1.0), 0.06, pan=0.4)
tr.place(E["open"] - 0.1, tr.puff(), 0.15, pan=-0.4)
tr.place(E["wo"], tr.pop(560), 0.3, pan=-0.4)
tr.place(E["think2"], tr.pop(620), 0.3, pan=-0.4)
tr.place(E["shrug"], tr.whoosh(0.3), 0.15, pan=-0.4)
tr.place(E["fact"], tr.thump(), 0.6); tr.place(E["fact"] + 0.05, tr.sparkle(), 0.08)
tr.place(E["spin"], tr.whoosh(1.0), 0.15, pan=0.4)
for i, f in enumerate(notes):
    tr.place(E["spin"] + 0.1 + i * 0.15, tr.bell(f * 2, 0.4), 0.03, pan=0.4)
tr.place(E["back"], tr.whoosh(0.4), 0.12)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("audio.wav", E["duration"])
