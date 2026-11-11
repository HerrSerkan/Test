"""Wortzeiten (build/words.json) + Untertitel-Blöcke -> lines.js (Tag 10: max. 2 Zeilen, * türkis, ! rot, ~ gelb; Block 1 ab Frame 1 komplett)"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "build", "words.json")))
CHUNKS = ["HEUTE BAUEN WIR UNSERE *STADT AUF!|6", "IHR WOLLTET EINEN *DÖNERLADEN?|5", "GLEICH !DREIMAL!|3", "*24 WÜNSCHE.|2", "UND WIR HABEN ALLE *GEBAUT.|5",
  "VON DER *VILLA BIS ZUM *EDEKA|6", "IST ALLES DABEI.|3", "ABER EINER DAVON IST KOMPLETT !VERRÜCKT.|6", "HALT DAS VIDEO AN UND ~RATE,|6", "WAS DAS IST.|3",
  "SCHREIB DEINEN ~TIPP IN DIE KOMMENTARE.|6", "DIE *AUFLÖSUNG KOMMT AM ENDE.|5", "ALLE *HÄUSER SIEHST DU HIER UNTEN.|6",
  "SUCH DEINS UND ~SPEICHER DIR DAS VIDEO.|7", "DANN FINDEST DU DEIN HAUS *JEDERZEIT WIEDER.|7", "UND OBEN DIE !VERRÜCKTESTEN:|4",
  "EIN *EDEKA,|2", "EINE *SCHWERTSCHMIEDE,|2", "EINE *SCHULE,|2", "EIN *KATZENCAFÉ,|2", "EINE *GAMING-HALLE,|2", "EIN *WURMHAUS|2",
  "UND SOGAR EINE *VILLA FÜR ALLE.|6", "DAS IST JETZT ~GESETZ NR. 2!|6", "UND JETZT DIE *AUFLÖSUNG.|4", "DER VERRÜCKTESTE !WUNSCH?|3",
  "EIN *RIESENHAUS|2", "FÜR EINEN RIESIGEN BLAUEN *ASTRONAUTEN.|5", "MIT EIGENER *RAKETE!|3", "HATTEST DU ~RECHT?|3", "DAS IST UNSERE *STADT.|4",
  "HIER IST ALLES *MÖGLICH.|4", "WIE SOLL SIE *WEITERWACHSEN?|4", "SCHREIB'S IN DIE ~KOMMENTARE!|4", "UND DENK DRAN:|3",
  "JEDES ~LIKE BRINGT *TALER IN DIE STADTKASSE.|7", "~FOLG MIR,|2", "UND DEIN *WUNSCH KOMMT INS NÄCHSTE VIDEO.|7"]
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
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch erzeugt (mars10/make_lines.py)\nwindow.WORDS = " + json.dumps([[w["w"], w["s"]] for w in W], ensure_ascii=False) + ";\nwindow.CHUNKS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "Blöcke")
