"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
# Blöcke wie im Original; * = Schlüsselwort (türkis), ! = rot. Wortanzahl je Block = Whisper-Wörter (OG-/Top- zählen doppelt)
CHUNKS = ["TAG 2:|2", "GESTERN WAR ICH|3", "HIER NOCH GANZ|3", "ALLEIN.|1", "HEUTE LANDEN|2", "*18 NEUE|2", "*ASTRONAUTEN!|1",
          "!PROBLEM:|1", "WIR HATTEN NUR|3", "EINE *RAKETE.|2", "ALSO KAMEN GLEICH|3", "*DREI.|1", "EUER|1", "*TOP-KOMMENTAR|2",
          "KAM VON *ROMY:|3", "!KEINE SCHULE.|2", "ALSO GILT AB|3", "HEUTE *GESETZ|2", "NUMMER 1:|2", "IN *ROTANIEN|2", "GIBT ES !KEINE|3",
          "SCHULE.|1", "WIR HATTEN ZWAR|3", "NIE EINE.|2", "ABER SICHER IST|3", "SICHER.|1", "ICH HAB EINE|3", "GEBAUT UND SIE|3",
          "DIREKT INS *ALL|3", "GESCHOSSEN.|1", "ASTRONAUT *NR. 7|3", "WOLLTE EINEN|2", "*HUT.|1", "BITTE SCHÖN.|2", "UND *NR. 12|3",
          "BEKOMMT EINE|2", "!PINKE HANDTASCHE.|2", "ABER HEUTE|2", "MORGEN WAR|2", "UNSERE *FAHNE|2", "WEG.|1", "NUR NOCH !SPUREN.|3",
          "UND DIE FÜHREN|3", "DIREKT ZUM|2", "*KRATER.|1", "FOLG JETZT UND|3", "HOL DIR DEINE|3", "*OG-BORDKARTE FÜR|4", "DIE NÄCHSTE|2",
          "*RAKETE.|1", "*GESETZ NUMMER 2|3", "BESTIMMT WIEDER|2", "DER *TOP-KOMMENTAR.|3"]
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
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars2/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
