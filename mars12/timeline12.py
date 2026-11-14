"""Tag 12: Sätze auf das 130-BPM-Raster legen -> timeline.js (Szenenzeiten), lines.js (Untertitel), build/voice.wav, build/timeline.json.
Bei Truhen-Sätzen landet das Schlüsselwort („Bank“, „Flughafen“ …) genau auf dem Beat, auf dem die Truhe aufspringt."""
import json, math, os, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(HERE, "build")
SR = 44100; BT = 60 / 130
SRC = {p[0]: p for p in json.load(open(os.path.join(HERE, "phrases_src.json")))}
PH = json.load(open(os.path.join(B, "phrases.json")))
GAP = 0.12
MINB = {"p1": 4, "p2": 4, "p3": 4, "p4": 4, "c1": 2, "c14": 2, "c23": 3, "c31": 2, "c46": 3, "c58": 4}
place = {}            # pid -> Startzeit der Stimme (s)
beat = {}             # Szenen-Startbeats
vend = 0.0; cur = 0   # Ende der letzten Stimme, frühester nächster Beat

def key_off(pid): return PH[pid]["words"][SRC[pid][3]][1]
for pid in ["p1", "p2", "p3", "p4", "c1", "c14", "c23", "c31", "c46", "c58"]:
    ko = key_off(pid); kb = max(cur, math.ceil((vend + GAP + ko) / BT - 1e-6))
    if pid == "p1": kb = 0; ko = 0
    place[pid] = kb * BT - ko; beat[pid] = kb; vend = place[pid] + PH[pid]["dur"]; cur = kb + MINB[pid]
# Speed-Montage
mb = max(cur, math.ceil((vend + GAP) / BT)); place["mont"] = mb * BT + 0.05; vend = place["mont"] + PH["mont"]["dur"]
mlen = max(4, math.ceil(PH["mont"]["dur"] / BT + 0.2)); beat["mont"] = mb
# Truhe 100: Satz, Herzschlag, dann „… und drin ist …“, Deckel auf dem Beat nach „ist“
cb = mb + mlen; beat["c100"] = cb; place["c100"] = cb * BT + 0.25
ob = max(cb + 5, math.ceil((place["c100"] + PH["c100"]["dur"] + 0.8 + PH["open"]["dur"]) / BT))
place["open"] = ob * BT - PH["open"]["dur"] + 0.05; beat["open"] = ob
pb = ob + 3; beat["pass"] = pb; place["pass"] = pb * BT + 0.08
ab = max(pb + 4, math.ceil((place["pass"] + PH["pass"]["dur"] + 0.3) / BT)); beat["cta"] = ab; place["cta"] = ab * BT + 0.05
eb = max(ab + 7, math.ceil((place["cta"] + PH["cta"]["dur"] + 0.6) / BT) + 1); beat["end"] = eb

bt = lambda n: n * BT
DUDB = [mb + k * mlen / 8 for k in range(8)]
T = {"reveal": bt(beat["p2"]), "capt": bt(beat["p3"]), "kasse": bt(beat["p4"]), "mont": bt(mb), "c100": bt(cb), "open": bt(ob), "black": bt(ob + 2),
     "pass": bt(pb), "cta": bt(ab), "tipp": place["cta"] + PH["cta"]["words"][5][1], "loop": bt(eb - 1), "end": bt(eb)}
CHK = [("c1", 1, "socke"), ("c14", 14, "bank"), ("c23", 23, "flughafen"), ("c31", 31, "laden"), ("c46", 46, "bunker"), ("c58", 58, "soldaten")]
CH = [{"n": n, "k": k, "t": bt(beat[p]), "s": min(bt(beat[p]) - 0.16, place[p] - 0.06), "e": bt(beat[CHK[i + 1][0]]) if i + 1 < len(CHK) else bt(mb)} for i, (p, n, k) in enumerate(CHK)]
for i in range(len(CH) - 1): CH[i]["e"] = CH[i + 1]["s"]
TL = {"BT": BT, "T": T, "CH": CH, "DUDS": [bt(b) for b in DUDB], "beats": beat, "place": place}

# ------------------------------------------------------------ Untertitel
order = list(place.keys()); order.sort(key=lambda p: place[p])
seg_end = {p: (place[order[i + 1]] if i + 1 < len(order) else T["loop"]) - 0.06 for i, p in enumerate(order)}
seg_end["c100"] = place["open"] - 0.05; seg_end["open"] = T["pass"] - 0.02; seg_end["cta"] = T["loop"] - 0.05
chunks = []
for p in order:
    ws = PH[p]["words"]; disp = SRC[p][2]; s0 = place[p]
    counts = [len(c.replace("|", " ").split()) for c in disp]; tot = sum(counts); acc = 0
    for ci, c in enumerate(disp):
        lo = round(acc * len(ws) / tot); hi = max(lo + 1, round((acc + counts[ci]) * len(ws) / tot)); sub = ws[lo:hi]; acc += counts[ci]
        w, k = [], 0; toks = [(tok, li) for li, line in enumerate(c.split("|")) for tok in line.split()]
        for tok, li in toks:
            col = 1 if tok[0] == "*" else 2 if tok[0] == "!" else 3 if tok[0] == "~" else 0
            j = min(len(sub) - 1, round(k * len(sub) / len(toks))); tt = -0.2 if p == "p1" else s0 + sub[j][1]; k += 1
            w.append([tok.lstrip("*!~"), round(tt, 3), col, li])
        chunks.append({"s": 0 if p == "p1" else round(s0 + sub[0][1], 3), "e": None, "w": w})
    chunks[-1]["e"] = round(seg_end[p], 3)
for i, c in enumerate(chunks):
    if c["e"] is None: c["e"] = round(chunks[i + 1]["s"] - 0.03, 3)
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars12/timeline12.py) – Untertitel aus den Whisper-Wortzeiten, Block 1 ab Frame 1 komplett\nwindow.WORDS = [];\nwindow.CHUNKS = " + json.dumps(chunks, ensure_ascii=False) + ";\n")
open(os.path.join(HERE, "timeline.js"), "w").write("// automatisch erzeugt (mars12/timeline12.py)\nwindow.TL = " + json.dumps(TL, ensure_ascii=False) + ";\n")
json.dump(TL, open(os.path.join(B, "timeline.json"), "w"), indent=1)

# ------------------------------------------------------------ Stimme zusammensetzen (keine Schnitte in Wörtern)
N = int(T["end"] * SR); v = np.zeros(N + SR, np.float32)
for p, s in place.items():
    a = np.load(os.path.join(B, "vo", p + ".npy")); i = int(s * SR); v[i:i + len(a)] += a[: len(v) - i]
v = v[:N]; v = v / (np.abs(v).max() + 1e-9) * 0.95
with wave.open(os.path.join(B, "voice.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((v * 32767).astype(np.int16).tobytes())
for p in order: print(f"{p:5s} Beat {beat.get(p, '-')!s:>4}  Stimme {place[p]:6.2f}–{place[p] + PH[p]['dur']:6.2f}")
print("Ende", round(T["end"], 2), "s =", eb, "Beats")
