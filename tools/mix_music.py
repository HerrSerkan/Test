"""Effekt-Tonspur + Hintergrundmusik mischen (wie in perfektionist/audio.py).

  python3 tools/mix_music.py <effekte.wav> <musik.mp3> <ausgabe.wav> [musik_lufs=-17.5] [effekte_lufs=-16]

Effekte auf -16 LUFS, Musik auf -17.5 LUFS darunter, gesamt -14 LUFS (EBU R128), Spitzen begrenzt.
Musik wird am Anfang kurz eingeblendet und in den letzten 0,6 s ausgeblendet.
"""
import os
import re
import subprocess
import sys
import wave

import numpy as np
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import lfilter

SR = 44100
sfx_path, music_path, out_path = sys.argv[1:4]
MUSIC_LUFS = float(sys.argv[4]) if len(sys.argv) > 4 else -17.5
SFX_LUFS = float(sys.argv[5]) if len(sys.argv) > 5 else -16.0
TMP = out_path + ".tmp.wav"


def read(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def write(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def lufs(x):
    write(TMP, x)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", TMP, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


def limit(x, ceil=0.8):
    pk = maximum_filter1d(np.abs(x).max(1), int(0.006 * SR))
    g = minimum_filter1d(np.minimum(1, ceil / (pk + 1e-9)), int(0.006 * SR))
    g = lfilter([0.004], [1, -0.996], g - 1) + 1
    return x * np.minimum(g, np.minimum(1, ceil / (pk + 1e-9)))[:, None]


def to_lufs(x, target, lim=True):
    gdb = 0.0
    for _ in range(4):
        y = x * 10 ** (gdb / 20)
        gdb += target - lufs(limit(y) if lim else y)
    y = x * 10 ** (gdb / 20)
    return limit(y) if lim else y


sfx = read(sfx_path)
N = len(sfx)
music = np.zeros_like(sfx)
m = read(music_path)[:N]
music[: len(m)] = m
t = np.arange(N) / SR
env = np.minimum(1, t / 0.3) * np.clip((t[-1] - t) / 0.6, 0, 1)
music *= env[:, None].astype(np.float32)

mix = to_lufs(sfx, SFX_LUFS) + to_lufs(music, MUSIC_LUFS, lim=False)
mix = to_lufs(mix, -14.0)
os.remove(TMP)
write(out_path, mix)
print("gemischt:", out_path, round(N / SR, 2), "s")
