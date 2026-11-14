"""Ton für „Rotanien – Tag 12“ (kein Sprecher): eigener Funk-/Phonk-Beat 130 BPM + Effekte -> build/mix.wav.
Musik ist selbst synthetisiert (lizenzfrei), damit das Beat-Raster exakt zu bt(n) in tag12.js passt.
Effekte: synthetisch + Mixkit-Sounds aus sfx/ (Mixkit SFX Free License, aus der video-shotcraft-Bibliothek).
Ablauf: Beat ab Frame 1 -> bricht bei Truhe 100 ab (Stille, Herzschlag, Riser) -> Drop beim Öffnen -> 1 Beat Stille -> Beat zurück."""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json"))); T = EV["T"]
SR = 44100; BT = 60 / 130; bt = lambda n: n * BT
N = int(EV["duration"] * SR)
rng = np.random.default_rng(12)


def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)
def lp(x, fc): b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)
def hp(x, fc): b, a = butter(2, fc / (SR / 2), btype="high"); return lfilter(b, a, x)
def env(n, a, d): x = np.arange(n) / SR; return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)
def place(buf, t0, sig, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i] * g
def mp3(name):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "sfx", name + ".mp3"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(r, np.float32).copy(); return x / (np.abs(x).max() + 1e-9)


# ------------------------------------------------------------ Musik: Funk/Phonk, 130 BPM, g-Moll
def kick():
    n = int(0.42 * SR); x = np.arange(n) / SR
    return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(46 + 110 * np.exp(-x * 28)) / SR) * env(n, 0.001, 0.2)) + bp(rng.normal(0, 1, n), 2000, 8000) * env(n, 0.0005, 0.004) * 0.5
def clap():
    n = int(0.25 * SR); s = np.zeros(n); nz = bp(rng.normal(0, 1, n), 900, 6000)
    for k, d in enumerate((0, 0.008, 0.017)): i = int(d * SR); s[i:] += nz[: n - i] * env(n - i, 0.0005, 0.012 if k < 2 else 0.07)
    return s * 0.8
def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR); return hp(rng.normal(0, 1, n), 7000) * env(n, 0.0005, 0.07 if open_ else 0.012) * 0.5
def cowbell(f):
    n = int(0.2 * SR); x = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * f * x)) + 0.8 * np.sign(np.sin(2 * np.pi * f * 1.48 * x))
    return bp(s, f * 0.8, f * 4) * env(n, 0.001, 0.07) * 0.5
def bass808(f, L):
    n = int(L * SR); x = np.arange(n) / SR
    return np.tanh(1.8 * np.sin(2 * np.pi * f * x)) * np.minimum(1, x / 0.005) * np.minimum(1, (L - x) / 0.03) * np.exp(-x * 1.2)
def crash():
    n = int(1.6 * SR); return hp(rng.normal(0, 1, n), 4000) * env(n, 0.001, 0.5) * 0.5

G4 = 392.0; NOTE = lambda semi: G4 * 2 ** (semi / 12)
MEL = [(0, 0), (2, 0), (3, 3), (5, 0), (7, -2), (8, 0), (10, 7), (13, 5)]          # Cowbell-Riff (16tel-Position, Halbton zu G)
ROOTS = [49.0, 49.0, 38.9, 43.65]                                                  # G1 G1 Es1 F1 je Takt
KICKS = [0, 3, 6, 8, 11, 14]                                                       # Tamborzão-artig 3-3-2
K, C, H, HO, CR = kick(), clap(), hat(), hat(True), crash()
CB = {s: cowbell(NOTE(s)) for _, s in MEL}
mus = np.zeros(N + SR * 2, np.float32); perc = np.zeros_like(mus)
BB = EV["beats"]; MB, CBt, OB, PB, EB = BB["mont"], BB["c100"], BB["open"], BB["pass"], BB["end"]   # Beats aus timeline12.py
def bar_on(b): # Pausen: Truhe 100 bis zum Öffnen, 1 Beat Stille nach dem Drop
    return b < CBt or OB <= b < OB + 2 or b >= PB
for st in range((EB + 1) * 4):                         # 16tel-Schritte
    b = st / 4; t0 = bt(b)
    if not bar_on(int(b)): continue
    p = st % 16; bar = st // 16
    if p in KICKS: place(perc, t0, K, 0.7); place(mus, t0, bass808(ROOTS[bar % 4], BT * 0.7), 0.28)
    if p in (4, 12): place(perc, t0, C, 0.6)
    if p % 2 == 0 or MB <= b < CBt: place(perc, t0, HO if p == 14 else H, 0.35 if p % 2 == 0 else 0.22)
    for q, s in MEL:
        if p == q and not (CBt <= b < PB): place(mus, t0, CB[s], 0.6)
    if CBt - 2 <= b < CBt and p % 2 == 1: place(perc, t0, C, 0.25 * (b - CBt + 3))   # Snare-Roll vor Truhe 100
for b in (0, 16, 32, OB, PB): place(perc, bt(b), CR, 0.5)
music = (mus + perc)[:N]
music[int(bt(OB + 2) * SR):int(bt(PB) * SR)] = 0                                         # harter Schnitt auf Stille
music[int(bt(CBt) * SR):int(bt(CBt) * SR) + 64] *= np.linspace(1, 0, 64)

# ------------------------------------------------------------ Effekte
fx = np.zeros(N + SR * 2, np.float32)
def thud():
    n = int(0.5 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (50 + 70 * np.exp(-x * 18)) * x) * env(n, 0.002, 0.12) + lp(rng.normal(0, 1, n), 1200) * env(n, 0.001, 0.04) * 0.7
def knock():   # Holzkiste landet
    n = int(0.18 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 180 * x) + 0.6 * np.sin(2 * np.pi * 410 * x)) * env(n, 0.001, 0.03) + bp(rng.normal(0, 1, n), 600, 3000) * env(n, 0.001, 0.015)
def coin():
    n = int(0.35 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1976 * x) * (x < 0.07) + np.sin(2 * np.pi * 2637 * x) * (x >= 0.07)) * env(n, 0.001, 0.12)
def creak(L=0.25):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(np.sign(np.sin(2 * np.pi * np.cumsum(170 + 90 * np.sin(2 * np.pi * 7 * x)) / SR)) * (rng.random(n) > 0.35), 300, 2500) * np.sin(np.pi * x / L)
def pop(f=700):
    n = int(0.12 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * env(n, 0.002, 0.035)
def womp():
    n = int(0.8 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(260 - 170 * x / 0.8) / SR) * env(n, 0.02, 0.35) * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * x))
def roar(L):
    n = int(L * SR); x = np.arange(n) / SR
    return lp(rng.normal(0, 1, n), 700) * np.sin(np.pi * x / L) ** 1.5
def growl(L=0.6):
    n = int(L * SR); x = np.arange(n) / SR
    return (np.sign(np.sin(2 * np.pi * np.cumsum(95 + 30 * np.sin(np.pi * x / L)) / SR)) * 0.4 + lp(rng.normal(0, 1, n), 700)) * (1 + 0.5 * np.sin(2 * np.pi * 21 * x)) * np.sin(np.pi * x / L)
def riser(L):
    n = int(L * SR); x = np.arange(n) / SR
    return (bp(rng.normal(0, 1, n), 800, 7000) * 0.6 + np.sin(2 * np.pi * np.cumsum(180 + 1600 * (x / L) ** 2) / SR) * 0.4) * (x / L) ** 2
def drone(L):
    n = int(L * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 41 * x) + 0.5 * np.sin(2 * np.pi * 61.7 * x)) * np.minimum(1, x / 0.8) * np.minimum(1, (L - x) / 0.05)
def rattle(L):  # Truhe zittert
    n = int(L * SR); s = np.zeros(n); m = int(0.03 * SR)
    for i in range(0, n - m, int(0.045 * SR)): s[i:i + m] += bp(rng.normal(0, 1, m), 400, 2500) * env(m, 0.001, 0.008) * (0.2 + 0.8 * i / n)
    return s
def drumroll(L):
    n = int(L * SR); s = np.zeros(n); m = int(0.05 * SR)
    for i in range(0, n - m, int(0.035 * SR)): s[i:i + m] += lp(rng.normal(0, 1, m), 2500) * env(m, 0.001, 0.015) * (0.3 + 0.7 * i / n)
    return s

S = {k: mp3(k) for k in ["impact-cine-big", "bass-hit-short", "hit-fast-exciting", "gravel-fall-hit", "stomp-apocalyptic", "impact-epic-trailer", "sparkle-poof-hit",
                         "shimmer-sparkle-sweep", "light-aura", "heartbeat-single", "clock-tick-single", "air-whoosh-powerful", "whoosh-fast", "wind-woosh-throw", "ui-message-pop"]}
# Frame 1: Himmel reißt auf, Truhen schlagen ein
place(fx, 0, S["impact-cine-big"], 0.8); place(fx, 0, S["air-whoosh-powerful"], 0.35)
for k, tl in enumerate(EV["RAIN"]):
    if 0 <= tl < T["capt"]: place(fx, tl, knock(), 0.35); place(fx, tl + 0.005, thud(), 0.28 if k % 3 else 0.5)
# Enthüllung: die Augen aus Tag 11 = Piraten
place(fx, T["reveal"], S["whoosh-fast"], 0.4); place(fx, T["reveal"] + 0.05, S["bass-hit-short"], 0.5)
# Stadtkasse: Traktorstrahl
place(fx, T["kasse"], drone(1.4) * (1 + 0.5 * np.sin(2 * np.pi * 9 * np.arange(int(1.4 * SR)) / SR)), 0.3)
for j in range(6): place(fx, T["kasse"] + 0.2 + j * 0.18, coin(), 0.18)
# Kapitän: Knurr-„Arrr“, Token blitzt
place(fx, T["capt"] + 0.05, growl(0.55), 0.35); place(fx, T["capt"] + 0.25, S["sparkle-poof-hit"], 0.45)
for j in range(3): place(fx, T["capt"] + 0.3 + j * 0.08, coin(), 0.25)
# Jede Truhe: Knarzen vorher, Knall auf dem Beat, Glitzer
for k, tc in enumerate(EV["CH"]):
    place(fx, tc - 0.16, S["whoosh-fast"], 0.35); place(fx, tc - 0.12, creak(0.12), 0.25)
    place(fx, tc, S["hit-fast-exciting"] if k % 2 else S["bass-hit-short"], 0.8); place(fx, tc + 0.02, S["sparkle-poof-hit"], 0.4 if k else 0.15)
c1, c14, c23, c31, c46, c58 = EV["CH"]
place(fx, c1 + 0.08, womp(), 0.55)                                                   # Socke: Fail
for j in range(12): place(fx, c14 + 0.08 + j * 0.06, coin(), 0.22)                   # Bank: Münzregen
place(fx, c23 + 0.35, roar(1.1), 0.3); place(fx, c23 + 0.35, S["wind-woosh-throw"], 0.3)  # Flugzeug startet
for j in range(6): place(fx, c31 + 0.3 + j * 0.06, pop(600 + 90 * j), 0.3)           # Klamotten fliegen
place(fx, c46 + 0.75, S["stomp-apocalyptic"], 0.6); place(fx, c46 + 0.8, S["gravel-fall-hit"], 0.45)   # Bunker gräbt sich ein
place(fx, c58 + 0.25, drumroll(0.6), 0.35); place(fx, c58 + 0.6, pop(500), 0.25)    # Soldaten
# Speed-Montage: Zähler rast, jede Niete ein Plopp
for k, td in enumerate(EV["DUDS"]): place(fx, td, pop(900 + 60 * k), 0.4); place(fx, td + 0.02, S["clock-tick-single"], 0.35)
k = T["mont"]
while k < T["c100"]: place(fx, k, S["clock-tick-single"], 0.18); k += BT / 4
# Truhe 100: Stille, Herzschlag, Zittern, Riser
place(fx, T["c100"], drone(T["open"] - T["c100"]), 0.14); place(fx, T["c100"], rattle(T["open"] - T["c100"]), 0.12)
for b in range(CBt, OB): place(fx, bt(b), S["heartbeat-single"], 0.28 + 0.06 * (b - CBt))
place(fx, bt(OB - 2), riser(bt(2)), 0.3)
# Öffnen: Drop
place(fx, T["open"], S["impact-epic-trailer"], 1.0); place(fx, T["open"] + 0.02, S["shimmer-sparkle-sweep"], 0.5); place(fx, T["open"] + 0.05, S["light-aura"], 0.4)
# Bordkarte + Aufruf
place(fx, T["pass"], S["air-whoosh-powerful"], 0.45); place(fx, T["pass"] + 0.2, pop(800), 0.3)
place(fx, T["cta"] + 0.15, S["ui-message-pop"], 0.5); place(fx, T["cta"] + 0.6, pop(950), 0.3); place(fx, T["tipp"], S["sparkle-poof-hit"], 0.3)
# Loop-Sekunde: Schiff rauscht heran (nahtlos zu Frame 1)
place(fx, T["loop"], S["whoosh-fast"], 0.3)
fx = fx[:N]; fx[int(bt(OB + 2) * SR):int(bt(PB) * SR)] *= np.linspace(1, 0, int(bt(PB) * SR) - int(bt(OB + 2) * SR)) ** 4   # Stille vor der Bordkarte

# ------------------------------------------------------------ Mix (Effekte über der Musik, ohne Stimme)
def rms(x): return np.sqrt((x ** 2).mean()) + 1e-9
music = music / rms(music[: int(bt(CBt) * SR)]) * 0.11
fx = fx / (np.abs(fx).max() + 1e-9) * 0.9
r = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "build", "voice.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.zeros(N, np.float32); vv = np.frombuffer(r, np.float32)[:N]; voice[:len(vv)] = vv
from scipy.ndimage import uniform_filter1d
mask = (uniform_filter1d(np.abs(voice), int(0.03 * SR)) > 0.02).astype(np.float32)
duck = np.zeros(N, np.float32); g = 0.0; att, rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.2 * SR))
for i in range(0, N, 64):
    tg = mask[i]; c = att if tg > g else rel; g = tg + (g - tg) * c ** 64; duck[i:i + 64] = g
duck = np.maximum(duck, np.roll(duck, -int(0.08 * SR)))          # Vorausschau
music *= 1 - 0.6 * duck; fx *= 1 - 0.72 * duck
vo = hp(voice, 90); vo = vo + 0.35 * bp(vo, 2500, 6000)           # Präsenz
vo = vo / (np.sqrt((vo[mask > 0] ** 2).mean()) + 1e-9) * 0.2      # Stimme klar über Musik
mix = hp(music + fx, 45)
mix = mix + 0.5 * bp(mix, 1500, 6000)   # mehr Präsenz für Handy-Lautsprecher
mix = mix + vo
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix[int((bt(OB + 2) + 0.04) * SR):int(bt(PB) * SR)] = 0   # echte Stille vor der Bordkarte
mix[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
with wave.open(os.path.join(HERE, "build", "mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.repeat(np.clip(mix, -1, 1)[:, None], 2, 1) * 32767).astype(np.int16).tobytes())
print("build/mix.wav", EV["duration"], "s")
