"""Baut aus den Wort-Zeitmarken der Sprachaufnahme die Zeitachse (Szenen, Untertitel, Comic-Wörter).

  python3 muskeln/prep.py   -> muskeln/build/timeline.js
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
END = words[-1]["end"] + 1.6


def find(phrase, after):
    p = [norm(x) for x in phrase.split()]
    for i in range(after, len(N)):
        if N[i:i + len(p)] == p:
            return i
    raise SystemExit(f"nicht gefunden: {phrase!r} ab {after}")


# (Szene, Startphrase)
SHOTS = [
    ("flex", "Was wäre"), ("lift", "geboren wärst"), ("rings", "Schon als Baby"), ("midwife", "Die Hebamme"),
    ("berlin", "Das gibt es"), ("docs", "Die Ärzte"), ("ultra", "Im Ultraschall"), ("compare", "doppelt so viel Muskelmasse"),
    ("boy45", "Mit viereinhalb"), ("arms", "mit ausgestreckten"), ("myo", "Der Grund"), ("stopdoc", "Es ist die Bremse"),
    ("nobrake", "Bei dir fehlt"), ("ball", "Deine Muskeln wachsen"), ("kita", "In der Kita"), ("jars", "Die Erzieherinnen"),
    ("dad", "Papa will"), ("wrestle1", "Er verliert"), ("dadmad", "Er sagt"), ("wrestle2", "Eine Sekunde"),
    ("price", "Aber Kraft"), ("pencil", "Türklinken"), ("shake", "Du gibst"), ("sling", "Er schreibt"),
    ("hug", "und Oma"), ("careful", "ganz ganz"), ("bjs", "Bundesjugendspiele"), ("throw", "Dein Ball"),
    ("arc", "über den Zaun"), ("weite", "Er wurde nie"), ("urkunde", "ohne Weite keine Urkunde"), ("meadow", "Du bist übrigens"),
    ("cow", "Es gibt Rinder"), ("dogs", "und Windhunde"), ("photos", "Balu schaut"), ("baludown", "Dann schaut"),
    ("bmom", "Und woher"), ("dna", "dasselbe veränderte"), ("athlete", "Sie war früher"), ("fridge", "Du schaust zu Mama"),
    ("fridgesay", "Sie sagt"), ("kdad", "Papa fordert"), ("wrestle3", "Er hat ein gutes"), ("momwins", "Eine halbe"),
    ("research", "Forscher"), ("opa", "Menschen zu helfen"), ("train", "Und Papa"), ("balu", "jeden Abend"), ("score", "Es steht"),
]
shots, pos = [], 0
for sid, ph in SHOTS:
    i = find(ph, pos)
    shots.append({"id": sid, "w": i, "t0": round(max(0, words[i]["start"] - 0.08), 3)})
    pos = i + 1
shots[0]["t0"] = 0.0
for a, b in zip(shots, shots[1:] + [{"t0": END}]):
    a["t1"] = b["t0"]

# Comic-Wörter / Einblendungen, an einem Wort verankert
POPS = [("DOPPELTE MUSKELN", "doppelt", 0), ("DOKTOR!", "Arzt", 0), ("4,5 JAHRE", "viereinhalb", 0), ("2 x 3 KG", "ausgestreckten", 0),
        ("PLOPP", "Marmeladenglas", 0), ("ZACK!", "zwei Sekunden", 0), ("2 SEKUNDEN", "Sekunden", 0), ("ZACK!", "Eine Sekunde", 0),
        ("1 SEKUNDE", "Sekunde", 0), ("KRACKS", "Stifte", 0), ("ZISCH!", "fliegt", 0), ("HMPF.", "herunter", 0), ("ZACK!", "halbe", 0)]
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
