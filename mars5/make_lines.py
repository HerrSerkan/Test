"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
# Blöcke wie im Original; * = Schlüsselwort (türkis), ! = rot. Wortanzahl je Block = Whisper-Wörter (OG-/Top- zählen doppelt)
CHUNKS = ["TAG 5:|2", "*ROTANIEN GIBT|2", "ES !NICHT !MEHR!|3", "UND SO IST|3", "ES PASSIERT.|2",
  "*87 PROZENT|2", "VON EUCH HABEN|3", "GESAGT:|1", "DER *SCHILD HÄLT.|3", "UND ER HAT|3", "*GEHALTEN.|1", "DIE GANZE NACHT.|3",
  "WIR HABEN|2", "*GEFEIERT.|1", "WIR DACHTEN,|2", "WIR HABEN|2", "*GEWONNEN.|1", "ABER UM !4|3", "UHR MORGENS KAM|3",
  "DAS !MUTTERSCHIFF.|2", "GRÖSSER ALS|2", "GANZ *ROTANIEN.|2", "AUF EINMAL WAR|3", "ALLES !STILL.|2", "KEINER HAT SICH|3",
  "!BEWEGT.|1", "EIN EINZIGER|2", "!SCHUSS.|1", "DER *SCHILD|2", "ZERSPRINGT WIE|2", "!GLAS.|1", "DIE RAKETENWERFT:|3",
  "!WEG!|1", "DER FUNKTURM:|2", "!WEG!|1", "DIE WACHTÜRME:|2", "!WEG!|1", "DER DÖNERLADEN:|2", "!WEG!|1",
  "UNSERE HÄUSER:|2", "ALLE !WEG!|2", "ÜBER *800|2", "ASTRONAUTEN|1", "RENNEN ZU DEN|3", "*RAKETEN.|1",
  "ABER NUR EINE|3", "*EINZIGE FLIEGT|2", "NOCH.|1", "UND DA PASSEN|3", "!NICHT !ALLE REIN.|3", "ICH STEHE IN|3",
  "DER *LUKE UND|3", "ZIEHE JEDEN REIN,|3", "DEN ICH|2", "ERREICHEN KANN.|2", "DANN *HEBEN WIR|3", "*AB.|1",
  "HINTER UNS|2", "!EXPLODIERT DIE|2", "*SCHILDZENTRALE.|1", "UND UNTER UNS|3", "!BRICHT DER|2", "*MARS|1",
  "!AUSEINANDER.|1", "VIER TAGE HABEN|3", "WIR *ZUSAMMEN|2", "AUFGEBAUT.|1", "UND IN EINER|3", "!MINUTE WAR|2",
  "ALLES WEG.|2", "ABER EINS|2", "HABEN SIE UNS|3", "!NICHT GENOMMEN:|2", "*UNS.|1", "JEDER ASTRONAUT|2",
  "IN DIESER RAKETE|3", "IST ALLES,|2", "WAS VON *ROTANIEN|3", "*ÜBRIG IST.|2", "WIR HABEN KAUM|3", "!TREIBSTOFF.|1",
  "DIE !ALIENS SIND|3", "DIREKT HINTER UNS.|3", "UND WIR WISSEN|3", "NICHT, WOHIN.|2", "WIR BRAUCHEN EINEN|3",
  "*NEUEN PLANETEN.|2", "SCHREIB IN DIE|3", "*KOMMENTARE:|1", "WO *LANDEN WIR|3", "ALS NÄCHSTES?|2"]
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
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars5/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
