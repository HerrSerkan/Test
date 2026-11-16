"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
# Blöcke wie im Original; * = Schlüsselwort (türkis), ! = rot. Wortanzahl je Block = Whisper-Wörter (OG-/Top- zählen doppelt)
CHUNKS = ["TAG 1:|2", "ICH HABE EINEN|3", "NEUEN *PLANETEN|2", "ENTDECKT UND|2", "GRÜNDE HIER MEIN|3", "EIGENES LAND!|2",
          "JEDER NEUE|2", "FOLLOWER WIRD|2", "EIN *ASTRONAUT|2", "UND FLIEGT MIT|3", "DER NÄCHSTEN|2", "*RAKETE HER!|2",
          "WILLKOMMEN IN|2", "*ROTANIEN!|1", "EINWOHNER:|1", "GENAU EINER.|2", "ICH.|1", "NEUE FOLLOWER|2", "BIS JETZT:|2", "!NULL.|1",
          "FOLG JETZT UND|3", "HOL DIR IN|3", "DEN *KOMMENTAREN|2", "DEINE|1", "*OG-BORDKARTE FÜR|3", "DIE ERSTE|2", "*RAKETE!|1",
          "UND JEDES LAND|3", "BRAUCHT *GESETZE.|2", "DER TOP-KOMMENTAR|3", "UNTER DIESEM|2", "VIDEO WIRD UNSER|3", "ERSTES *GESETZ.|2",
          "KEIN !MONTAG|2", "MEHR?|1", "ODER SCHREIB|2", "DEIN *GESETZ IN|3", "DIE *KOMMENTARE!|2"]
out, i = [], 0
for c in CHUNKS:
    txt, n = c.split("|"); n = int(n)
    disp = txt.split()
    ws = W[i:i + n]; i += n
    # Anzeige-Wörter gleichmäßig auf die gesprochenen Wörter legen
    words = []
    for k, d in enumerate(disp):
        j = min(len(ws) - 1, round(k * len(ws) / len(disp)))
        col = 1 if d.startswith("*") else 2 if d.startswith("!") else 0
        words.append([d.lstrip("*!"), ws[j]["s"], col])
    out.append({"s": ws[0]["s"], "e": ws[-1]["e"], "w": words})
assert i == len(W), (i, len(W))
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
