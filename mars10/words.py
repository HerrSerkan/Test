"""Wortzeiten der Stimme per faster-whisper -> build/words.json"""
import json, os, wave
import numpy as np
from faster_whisper import WhisperModel
HERE = os.path.dirname(os.path.abspath(__file__))
w = wave.open(os.path.join(HERE, "build", "voice.wav"))
sr = w.getframerate(); ch = w.getnchannels()
a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
if ch > 1: a = a.reshape(-1, ch).mean(1)
idx = np.arange(0, len(a), sr / 16000).astype(int); a = a[idx]
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a, language="de", word_timestamps=True)
words = [{"w": x.word.strip(), "s": round(x.start, 3), "e": round(x.end, 3)} for s in segs for x in s.words]
json.dump(words, open(os.path.join(HERE, "build", "words.json"), "w"), ensure_ascii=False, indent=0)
print(len(words), "Wörter"); print(" ".join(f"{x['w']}@{x['s']}" for x in words))
