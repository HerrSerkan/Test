"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js (Tag 6: max. 2 Zeilen, * türkis, ! rot, ~ gelb)"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
CHUNKS = ["!0% TREIBSTOFF.|3", "WIR STÜRZEN AUF !PLUTO 🪐|4", "IHR HABT PLUTO *GEWÄHLT.|4", "PLUTO IST NICHT MAL EIN !PLANET 😳|6",
  "!−230 GRAD.|3", "UND !KEIN EMPFANG.|3", "UND WIR SIND !NICHT ALLEIN.|5", "ALLE VERSTECKEN SICH.|3", "!FAST ALLE.|2",
  "DELON HAT ENDLICH SEINE *LASERPISTOLE.|5", "ABER ES WILL NICHT !KÄMPFEN.|5", "ES WILL … EINEN *DÖNER.|4",
  "TIM IST JETZT *DÖNERMANN.|4", "DAS WESEN IST *STAMMKUNDE.|4", "*ROTANIEN LEBT WEITER.|3", "~FOLG UNS UND ~ZIEH EIN.|5",
  "ABER OGNANI HAT EINEN *LICHTANTRIEB GEBAUT.|6", "DAMIT KÖNNEN WIR *WEITERFLIEGEN.|4",
  "ALSO: *BLEIBEN WIR AUF PLUTO?|5", "ODER SUCHEN WIR EINEN *BESSEREN PLANETEN?|6", "~STIMM IN DER ~UMFRAGE AB! 🗳|5"]
out, i = [], 0
for c in CHUNKS:
    txt, n = c.split("|"); n = int(n)
    disp = txt.split()
    ws = W[i:i + n]; i += n
    words = []
    for k, d in enumerate(disp):
        j = min(len(ws) - 1, round(k * len(ws) / len(disp)))
        col = 1 if d.startswith("*") else 2 if d.startswith("!") else 3 if d.startswith("~") else 0
        words.append([d.lstrip("*!~"), ws[j]["s"], col])
    out.append({"s": ws[0]["s"], "e": ws[-1]["e"], "w": words})
assert i == len(W), (i, len(W))
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars6/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
