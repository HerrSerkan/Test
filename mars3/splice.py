"""Ersetzt in build/voice.wav die Sätze ab Wort 83 bis vor Wort 97 durch build/piece.wav (neu gesprochene Sätze)."""
import json, os, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(HERE, "build"); SR = 44100
def read(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32)
v = read(os.path.join(B, "voice_v1.wav")); pc = read(os.path.join(B, "piece.wav"))
W = json.load(open(os.path.join(B, "words_old.json")))
a = int((W[83]["s"] - 0.03) * SR); gap = W[97]["s"] - W[96]["e"]; b = int((W[97]["s"] - 0.03) * SR)
# Stille am Rand des neuen Stücks abschneiden
lv = np.abs(pc) > 0.02 * np.abs(pc).max(); i0 = np.argmax(lv); i1 = len(pc) - np.argmax(lv[::-1])
pc = pc[max(0, i0 - int(0.02 * SR)): i1 + int(0.03 * SR)]
pc = pc / (np.abs(pc).max() + 1e-9) * np.abs(v).max()
out = np.concatenate([v[:a], pc, np.zeros(int(max(0.2, gap - 0.03) * SR), np.float32), v[b:]])
with wave.open(os.path.join(B, "voice.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("neu:", round(len(out) / SR, 2), "s (vorher", round(len(v) / SR, 2), ")")
