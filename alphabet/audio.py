"""Ton für "Alphabet-Armee – Tag 1": Stimme (build/voice.wav) + Effekte -> build/audio.wav. Musik über tools/mix_music.py."""
import json, os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track, SR
HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
E = json.load(open(os.path.join(B, "events.json")))
tr = Track(E["duration"], 97)
def snare():
    x = tr.x(0.12); return tr.bp(tr.noise(0.12), 1200, 6000) * np.exp(-x * 30) + np.sin(2 * np.pi * 190 * x) * np.exp(-x * 40) * 0.4
for i in range(16):                                            # Trommelwirbel zum Start
    tr.place(0.05 + i * 0.05, snare(), 0.05 + i * 0.008)
t = E["scenes"][1]
while t < E["duration"] - 1.2:                                 # leiser Marsch-Takt
    tr.place(t, snare(), 0.05); t += 0.5
for t in E["scenes"][1:]:
    tr.place(t - 0.15, tr.whoosh(0.3), 0.08)
for t in (E["armee"], E["tag"], E["x"]):
    tr.place(t, tr.thump(), 0.4); tr.place(t, tr.pop(700), 0.2)
tr.place(E["soldat"], tr.bell(1318.5, 1.0), 0.07); tr.place(E["soldat"] - 0.6, tr.step(), 0.15); tr.place(E["soldat"] - 0.3, tr.step(), 0.15)
for i in range(26):
    tr.place(E["rank"] + i * 0.03, tr.tick(2200 + (i % 4) * 200), 0.04)
for k in range(3):
    xx = tr.x(0.12); tr.place(E["letzte"] + k * 0.25, np.sign(np.sin(2 * np.pi * 880 * xx)) * 0.25, 0.07)
for t in E["buttons"]:
    tr.place(t, tr.pop(900), 0.25)
for t in E["end"]:
    tr.place(t, tr.pop(800), 0.25)
tr.place(E["end"][1] + 0.3, tr.sparkle(1568), 0.06)
with wave.open(os.path.join(B, "voice.wav")) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if w.getnchannels() == 2: v = v.reshape(-1, 2).mean(1)
v = np.pad(v[: tr.n], (0, max(0, tr.n - len(v)))); v = v / (np.abs(v).max() + 1e-6) * 0.85
tr.buf = tr.buf * 0.9 + v[:, None] / 0.9                       # Stimme vorn, Effekte darunter
tr.write(os.path.join(B, "audio.wav"), drive=1.05)
print("audio.wav (Stimme + Effekte):", E["duration"])
