"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js (Tag 9: max. 2 Zeilen, * türkis, ! rot, ~ gelb; Block 1 ab Frame 1 komplett)"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
CHUNKS = ["GESTERN: !BRUCHLANDUNG.|2", "HEUTE: EINE *STADT!|3", "*834 BEWOHNER.|2", "IHR WOLLTET KEIN !GESETZ.|4", "IHR WOLLTET *JOBS!|3",
  "ALSO, GESETZ NR. 1:|4", "JEDER BEKOMMT EINEN *JOB.|4", "WIR HABEN JETZT EINEN *PRÄSIDENTEN.|5", "UND *JANIC IST VIZE.|4",
  "*LUK IST POLIZEI.|3", "*EINFACHSO IST SECURITY.|4", "UND *MEO FILMT JETZT ALLES.|5", "PHILLIP FRAGT ZUM !VIERTEN MAL.|5",
  "HIER IST SIE:|3", "DEINE *ORANGE KATZE! 🐱|2", "PIZZAOFEN.|1", "IPHONES.|1", "WOHNUNG.|1", "GOYO.|1", "*ERLEDIGT!|1",
  "ABER IN DER HÖHLE WARTET !JEMAND,|6", "DER AUSSIEHT WIE UNSER *MONSTER.|5", "1 ~FOLLOW = 1 PLATZ IN *RAKETE 4.|7",
  "UND DAS MONSTER BRAUCHT EINEN *NAMEN.|6", "DER ~TOP-KOMMENTAR GEWINNT!|4"]
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
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars9/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
