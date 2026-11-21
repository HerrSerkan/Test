"""Zeitachse für das Aldi-Video (Szenen, Untertitel) aus den Wort-Zeitmarken.

  python3 aldi/prep.py   -> muskeln/build/timeline.js
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
os.makedirs(B, exist_ok=True)
words = [w for w in json.load(open(os.path.join(HERE, "voice", "stt_voice.json")))["words"] if w["type"] == "word"]
for w in words:
    w["text"] = w["text"].replace("W-was", "Was")
norm = lambda s: re.sub(r"[^\wäöüß]", "", s.lower())
N = [norm(w["text"]) for w in words]
END = words[-1]["end"] + 1.8


def find(phrase, after):
    p = [norm(x) for x in phrase.split()]
    for i in range(after, len(N)):
        if N[i:i + len(p)] == p:
            return i
    raise SystemExit(f"nicht gefunden: {phrase!r} ab {after}")


# (Szene, Startphrase)
SHOTS = [
    ("invade", "Walmart wollte"), ("fled", "Es verlor"), ("aldius", "Das deutsche Aldi"), ("grow", "Heute ist es"),
    ("globe", "Supermarktriesen"), ("globe18", "Aldi ist in achtzehn"), ("aldibig", "und es ist nicht mal"), ("two", "Es sind zwei"),
    ("how", "Wie gewinnt"), ("wmshelf", "Geh in einen Walmart"), ("aldishelf", "Geh in einen Aldi"), ("ketchup", "Ein Ketchup"),
    ("cart", "Den Einkaufswagen"), ("fewer", "Weniger Produkte"), ("cheap", "billigeres Essen"), ("copy", "Warum kopieren"),
    ("trapped", "Würden sie gern"), ("rival", "Wenn ein Konkurrent"), ("parent", "wechselt jedes"), ("dilemma", "Ökonomen nennen"),
    ("everything", "Also führen"), ("noplay", "Aldi spielt"), ("secret", "Aber das echte"), ("rent", "Die meisten Supermärkte"),
    ("share", "Aktionäre wollen"), ("cents", "Walmart behält"), ("interest", "Miete und Zinsen"), ("noshare", "Aldi hat keine"),
    ("owns", "und die meisten Läden"), ("bill", "Das ist ein Cent"), ("who", "Wem gehört"), ("brothers", "Zwei Brüder"),
    ("cig", "über den Verkauf"), ("split", "Also teilten"), ("map", "Einer nahm"), ("equator", "Die Deutschen nennen"),
    ("neither", "Keiner durfte"), ("leave", "Um zu wachsen"), ("fly", "Die eine Hälfte"), ("tj", "Die andere Hälfte"),
    ("winn", "Und ohne Aktionäre"), ("row", "eine ganze amerikanische"), ("convert", "und machte aus"), ("end", "Was passiert also"),
]
shots, pos = [], 0
for sid, ph in SHOTS:
    i = find(ph, pos)
    shots.append({"id": sid, "w": i, "t0": round(max(0, words[i]["start"] - 0.08), 3)})
    pos = i + 1
shots[0]["t0"] = 0.0
for a, b in zip(shots, shots[1:] + [{"t0": END}]):
    a["t1"] = b["t0"]

# Comic-Wörter
POPS = []
pops, pos = [], 0
for txt, ph, _ in POPS:
    i = find(ph, pos)
    pops.append({"text": txt, "t": words[i]["start"]})
    pos = i

# Untertitel: 2-3 Wörter, Umbruch nach Satzzeichen, längstes Wort gelb
caps, cur = [], []
for i, w in enumerate(words):
    cur.append(i)
    punct = re.search(r"[.,!?:;“\"]$", w["text"])
    if punct or len(cur) == 3 or (len(cur) == 2 and len(w["text"]) > 9):
        caps.append(cur); cur = []
if cur:
    caps.append(cur)
CAPS = []
for c in caps:
    toks = [re.sub(r"[„“\"]", "", words[i]["text"]).rstrip(",;:").upper() for i in c]
    toks = [t[:-1] if t.endswith(".") and not t.endswith("..") else t for t in toks]
    hl = max(range(len(c)), key=lambda k: len(re.sub(r"\W", "", toks[k])))
    if len(re.sub(r"\W", "", toks[hl])) <= 3:
        hl = -1
    CAPS.append({"t0": words[c[0]]["start"], "t1": words[c[-1]]["end"], "w": toks, "hl": hl})
for a, b in zip(CAPS, CAPS[1:]):
    a["t1"] = max(a["t1"], min(b["t0"], a["t1"] + 0.6))

tl = {"duration": round(END, 2), "shots": shots, "pops": pops, "caps": CAPS}
open(os.path.join(B, "timeline.js"), "w").write("window.TL = " + json.dumps(tl, ensure_ascii=False) + ";\n")
print(len(shots), "Szenen,", len(CAPS), "Untertitel, Dauer", END)
for s in shots:
    print(f"{s['t0']:7.2f}-{s['t1']:7.2f}  {s['id']}")
