"""ElevenLabs-Aufnahme aufbereiten: lange Pausen kürzen, Tempo leicht anheben, Stimme kräftiger (EQ + Kompressor)."""
import subprocess
import sys

import numpy as np

src, dst = sys.argv[1], sys.argv[2]
TEMPO = float(sys.argv[3]) if len(sys.argv) > 3 else 1.06
MAX_PAUSE = 0.6
SR = 44100

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.float32).copy()

# Stille finden (RMS in 20-ms-Fenstern)
win = int(0.02 * SR)
n = len(a) // win
rms = np.sqrt((a[: n * win].reshape(n, win) ** 2).mean(1))
silent = 20 * np.log10(rms + 1e-9) < -38
keep = np.ones(len(a), bool)
i = 0
while i < n:
    if silent[i]:
        j = i
        while j < n and silent[j]:
            j += 1
        dur = (j - i) * win / SR
        if dur > MAX_PAUSE + 0.1:
            cut = int((dur - MAX_PAUSE) * SR)
            mid = (i * win + j * win) // 2
            keep[mid - cut // 2: mid - cut // 2 + cut] = False
        i = j
    else:
        i += 1
b = a[keep]
print(f"{len(a)/SR:.2f}s -> {len(b)/SR:.2f}s (vor Tempo)")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                "-af", f"atempo={TEMPO},equalizer=f=110:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.2:g=1.5,"
                       "acompressor=threshold=-20dB:ratio=3:attack=8:release=160:makeup=2",
                "-ar", str(SR), dst], input=b.tobytes(), check=True)
