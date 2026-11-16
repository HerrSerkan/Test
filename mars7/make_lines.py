"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js (Tag 7: max. 2 Zeilen, * türkis, ! rot, ~ gelb; Block 1 steht ab Frame 1 komplett da)"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
CHUNKS = ["BLINDER PASSAGIER AN BORD 😳|4", "*72% VON EUCH SAGEN:|5", "WIR FLIEGEN *WEITER.|3", "UND DAS MONSTER FRISST UNSEREN !DÖNER-VORRAT.|6",
  "JENS MACHT ES ZUM *MASKOTTCHEN.|5", "LOHN: EIN *DÖNER PRO TAG.|5", "DANN: !ALARM!|2", "!ASTEROIDEN!|1",
  "UND DER ANTRIEB SCHAFFT|4", "NUR NOCH !EINEN SPRUNG.|4", "*830 SIND SCHON AN BORD.|5", "~FOLG UNS UND ~STEIG EIN!|5",
  "ALSO: MITTEN *DURCH?|3", "SCHNELL, ABER !GEFÄHRLICH.|3", "ODER *AUSSENRUM?|3", "SICHER, ABER DER !DÖNER REICHT NICHT.|6", "~STIMM IN DER ~UMFRAGE AB! 🗳|5"]
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
out[0]["s"] = 0; out[0]["w"] = [[w, 0, c] for w, s, c in out[0]["w"]]   # erste Zeile ab Frame 1 komplett
assert i == len(W), (i, len(W))
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars7/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
