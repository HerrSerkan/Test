"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js (Tag 8: max. 2 Zeilen, * türkis, ! rot, ~ gelb; Block 1 ab Frame 1 komplett)"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
CHUNKS = ["*67% SAGTEN: MITTEN !DURCH!|4", "UND DAS *MONSTER HAT GELENKT. 😳|5", "!BRUCHLANDUNG AUF EINEM NEUEN PLANETEN.|5",
  "*829 BEWOHNER.|2", "WIR FANGEN *NEU AN.|4", "JENS SCHREIBT:|2", "„ICH STELLE *DÖNER WIEDER HER.“|5", "GESAGT, *GETAN!|2",
  "MEHMET WILL EINEN *APPLE STORE.|5", "ER FRAGT SEIT TAG 3.|5", "*BITTE SCHÖN!|2", "UND ROADER:|2", "„MAN BITTE, MEIN *WURM!“|4",
  "HIER IST ER. MIT *HELM.|5", "SOGAR *FIRE.NICO IST JETZT GAMER-ASTRONAUT.|6", "JEDER WUNSCH *ZÄHLT.|3",
  "ABER: WIR SIND !NICHT DIE ERSTEN HIER.|7", "1 ~FOLLOW = 1 PLATZ IN *RAKETE 3.|7", "1 ~LIKE = 1 DÖNER FÜRS *MONSTER.|6",
  "UND GESETZ NR. 1 AUF DEM NEUEN PLANETEN?|8", "DER ~TOP-KOMMENTAR!|3"]
out, i = [], 0
for c in CHUNKS:
    txt, n = c.split("|"); n = int(n)
    disp = txt.split(); ws = W[i:i + n]; i += n
    words = []
    for k, d in enumerate(disp):
        j = min(len(ws) - 1, round(k * len(ws) / len(disp)))
        col = 1 if d.startswith("*") else 2 if d.startswith("!") else 3 if d.startswith("~") else 0
        words.append([d.lstrip("*!~"), ws[j]["s"], col])
    out.append({"s": ws[0]["s"], "e": ws[-1]["e"], "w": words})
out[0]["s"] = 0; out[0]["w"] = [[w, 0, c] for w, s, c in out[0]["w"]]
assert i == len(W), (i, len(W))
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars8/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
