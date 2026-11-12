"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js (Tag 10: max. 2 Zeilen, * türkis, ! rot, ~ gelb; Block 1 ab Frame 1 komplett)"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
CHUNKS = ["12 GEBÄUDE. !15 SEKUNDEN.|4", "~LOS!|1", "*STADION!|1", "*MILITÄRBASIS|1", "MIT !JETS!|2", "*ZOO!|1", "*TIERHEIM!|1", "!BUREK-KANONE!|2", "*TOKEN-HAUS!|2",
  "UND SAMI&ZOE FRAGT:|5", "~WO BIN ICH?|3", "*HIER!|1", "DU BIST ~LEHRERIN!|3", "PLUS !5 EXTRAS:|3", "*STARTRAMPE,|2", "*ACHTERBAHN,|1", "*WASSERPARK,|1", "*LASERTURM,|1", "*KINO!|1",
  "~GESCHAFFT!|1", "!ALARM!|1", "ETWAS !KOMMT …|2", "EIN ~FOLLOW IST EIN PLATZ|5", "IN *RAKETE 4.|3", "WAS BAUEN WIR ALS *NÄCHSTES?|5", "DEIN ~KOMMENTAR WIRD *GEBAUT!|4"]
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
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars11/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
