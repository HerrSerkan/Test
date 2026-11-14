"""Tag 12: Stimme ElevenLabs „Chris“ – jeder Satz einzeln (build/vo/<id>.mp3, wird nur erzeugt, wenn er fehlt),
damit jeder Satz genau auf einen Beat gelegt werden kann. Kein Schneiden in Wörtern: nur Stille am Anfang/Ende wird entfernt (mit Rand).
Ausgabe: build/phrases.json (Dauer + Whisper-Wortzeiten je Satz, nach Tempo)."""
import json, os, subprocess, sys
import numpy as np
import requests
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__)); VO = os.path.join(HERE, "build", "vo"); os.makedirs(VO, exist_ok=True)
SR, TEMPO = 44100, 1.18
VOICE = "iP95p4xoKVk53GoZ742B"   # Chris (wie Tag 10/11)
PH = json.load(open(os.path.join(HERE, "phrases_src.json")))

def tts(pid, text):
    p = os.path.join(VO, pid + ".mp3")
    if os.path.exists(p) and "--force" not in sys.argv: return p
    r = requests.post(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                      headers={"xi-api-key": "proxy-injected", "Content-Type": "application/json"},
                      json={"text": text, "model_id": "eleven_multilingual_v2", "language_code": "de",
                            "voice_settings": {"stability": 0.4, "similarity_boost": 0.75, "style": 0.35}}, timeout=120)
    r.raise_for_status(); open(p, "wb").write(r.content); print("erzeugt", pid, len(text), "Zeichen"); return p

def rd(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-af", f"atempo={TEMPO}", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).copy()

M = WhisperModel("small", device="cpu", compute_type="int8")
out = {}
for pid, text, *_ in PH:
    a = rd(tts(pid, text))
    w = int(0.01 * SR); n = len(a) // w; db = 20 * np.log10(np.sqrt((a[:n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)
    on = np.where(db > -45)[0]; s0 = max(0, on[0] * w - int(0.03 * SR)); s1 = min(len(a), (on[-1] + 1) * w + int(0.12 * SR))   # nur die Ränder
    a = a[s0:s1]; a[:int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))
    np.save(os.path.join(VO, pid + ".npy"), a)
    segs, _ = M.transcribe(a[np.arange(0, len(a), SR / 16000).astype(int)], language="de", word_timestamps=True)
    words = [[x.word.strip(), round(x.start, 3), round(x.end, 3)] for sg in segs for x in sg.words]
    out[pid] = {"dur": len(a) / SR, "words": words}
    print(f"{pid:5s} {len(a)/SR:5.2f}s  {' '.join(x[0] for x in words)}")
json.dump(out, open(os.path.join(HERE, "build", "phrases.json"), "w"), ensure_ascii=False, indent=1)
