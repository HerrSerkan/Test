"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
# Blöcke wie im Original; * = Schlüsselwort (türkis), ! = rot. Wortanzahl je Block = Whisper-Wörter (OG-/Top- zählen doppelt)
CHUNKS = ["TAG 4:|2", "IHR HABT|2", "ENTSCHIEDEN!|1", "*96 PROZENT|2", "SAGEN: WIR|2", "*KÄMPFEN!|1", "UND SEIT GESTERN|3",
  "SIND *159 NEUE|3", "*ASTRONAUTEN|1", "DAZUGEKOMMEN.|1", "JETZT SIND WIR|3", "*789!|1", "KEINER HAUT AB!|3", "WIR HALTEN|2",
  "*ZUSAMMEN!|1", "ALSO BAUEN WIR|3", "*ROTANIEN AUS.|2", "UND ZWAR !SCHNELL!|3", "EINE *RAKETENWERFT|3", "FÜR NEUE SCHIFFE.|3",
  "*WACHTÜRME AN|2", "JEDEM KRATER.|2", "EIN RIESIGER|2", "*FUNKTURM,|1", "DAMIT WIR DIE|3", "ALIENS KOMMEN|2", "SEHEN.|1",
  "UND IN DER MITTE|4", "DIE *SCHILDZENTRALE.|2", "JEDER EINZELNE|2", "*ASTRONAUT PACKT|2", "MIT AN.|2", "*JAKOB BEKOMMT|2",
  "SEINEN *STEIN-FREUND.|2", "*BZ_FULL|2", "EIN *HUHN|2", "AUF DEM KOPF.|3", "UND *HEROBRINE|2", "DARF SEINEN|2",
  "*RUCKSACK MITNEHMEN.|2", "AM ABEND SCHALTEN|3", "WIR DEN *SCHILD EIN.|4", "EINE RIESIGE|2", "*KUPPEL ÜBER DER|3",
  "GANZEN STADT.|2", "UND ICH HABE|3", "GESAGT:|1", "DAS IST UNSER|3", "*PLANET.|1", "WIR HABEN IHN|3", "ZUSAMMEN *AUFGEBAUT.|2",
  "UND WIR VERTEIDIGEN|3", "IHN *ZUSAMMEN.|2", "DANN, GENAU|2", "NACH !24 STUNDEN:|3", "!ALARM!|1", "DIE *ALIENFLOTTE|2",
  "IST DA!|2", "!HUNDERTE|1", "RAUMSCHIFFE!|1", "DIREKT ÜBER UNS!|3", "DER ERSTE LASER|3", "TRIFFT UNSEREN|2", "*SCHILD.|1",
  "ALLES !BEBT.|2", "DER SCHILD|2", "!FLACKERT.|1", "ABER ER HÄLT|3", "NOCH.|1", "UND DANN KOMMT|3", "WIEDER EIN|2",
  "*FUNKSPRUCH.|1", "LETZTE CHANCE.|2", "GEBT AUF.|2", "!NIEMALS!|1", "ABER WIR BRAUCHEN|3", "EINEN *PLAN.|2", "SCHREIB IN DIE|3",
  "*KOMMENTARE,|1", "WIE WIR DIE|3", "ALIENS *BESIEGEN.|2", "DER *TOP-KOMMENTAR|3", "WIRD UNSER|2", "*SCHLACHTPLAN.|1"]
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
