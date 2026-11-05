"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
# Blöcke wie im Original; * = Schlüsselwort (türkis), ! = rot. Wortanzahl je Block = Whisper-Wörter (OG-/Top- zählen doppelt)
CHUNKS = ["TAG 3:|2", "ROTANIEN HAT SCHON|3", "*630|1", "EINWOHNER!|1", "SEIT GESTERN SIND|3", "*611 NEUE|2", "ASTRONAUTEN GELANDET.|2",
          "UND ZUSAMMEN|2", "SIND WIR|2", "*UNAUFHALTSAM.|1", "EUER *TOP-KOMMENTAR|3", "KAM VON *LUCA:|3", "!KEINE STEUERN.|2", "ALSO GILT|2",
          "*GESETZ NUMMER 2:|3", "NIEMAND ZAHLT|2", "MEHR !STEUERN.|2", "*GABRIEL BEKOMMT|2", "EIN *LASERSCHWERT.|2", "*ELSTER EINEN|2",
          "!PINKEN ANZUG|1", "MIT *HUNDEOHREN.|2", "UND *NR. 410|3", "EINEN *ENTEN-FREUND.|2", "UND WEIL IHR|3", "SO OFT GEFRAGT HABT:|4",
          "ROTANIEN HAT|2", "JETZT EINEN|2", "*DÖNERLADEN!|1", "ABER HEUTE !NACHT|3", "KAM EIN *FUNKSPRUCH|3", "AUS DEM *ALL.|3",
          "DIESER PLANET|2", "GEHÖRT UNS.|2", "IHR HABT 24|3", "STUNDEN.|1", "DANN GREIFEN WIR AN.|4", "UNSERE *FAHNE?|2", "DIE HABEN DIE|3",
          "!ALIENS GEKLAUT.|2", "HINTER DEM *MOND|3", "WARTET IHRE|2", "GANZE !FLOTTE.|2", "ABER WIR SIND|3", "*630.|1", "UND WIR HALTEN|3",
          "*ZUSAMMEN.|1", "ALSO ENTSCHEIDET IHR:|3", "HAUEN WIR AB|3", "UND SUCHEN EINEN|3", "NEUEN *PLANETEN?|2", "ODER BLEIBEN WIR|3",
          "UND !KÄMPFEN?|2", "STIMM JETZT IN|3", "DER *UMFRAGE|2", "IN DEN *KOMMENTAREN AB!|4", "UND FOLG,|2", "DENN JEDER|2", "*ASTRONAUT ZÄHLT!|2"]
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
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars4/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
