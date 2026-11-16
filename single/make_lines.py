"""Skript-Text + Wortzeiten (build/words.json) -> lines.js (Wort, Start, Ende, Schlüsselwort)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
S = ["Manche Menschen bleiben jahrelang Single.", "Nicht, weil niemand sie will.", "Sie geben sich einfach nicht mehr mit weniger zufrieden.",
     "Sie haben die falsche Art von Liebe schon erlebt.", "Deshalb schützen sie jetzt ihren Frieden.", "Sie besetzen keinen Platz, nur weil er frei ist.",
     "Allein zu sein macht ihnen keine Angst.", "Sich neben jemandem allein zu fühlen schon.", "Also bauen sie sich ein Leben, das sich schon voll anfühlt.",
     "Darum beeindrucken große Gesten sie nicht.", "Nicht, weil ihre Ansprüche zu hoch sind.", "Sondern weil sie wissen, was ein falsches Ja kostet.",
     "Single sein ist nicht immer Weglaufen.", "Manchmal ist es Selbstachtung.", "Und wenn sich einer von ihnen je für dich entscheidet,",
     "dann nicht, weil er jemanden gebraucht hat.", "Sondern weil du es warst."]
KEY = ["Single.", "niemand", "zufrieden.", "falsche", "Frieden.", "frei", "Angst.", "allein", "voll", "große Gesten", "hoch", "kostet.",
       "Weglaufen.", "Selbstachtung.", "dich", "gebraucht", "du"]
W = json.load(open(os.path.join(HERE, "build", "words.json")))
out, i = [], 0
for s, k in zip(S, KEY):
    line = []
    for t in s.split():
        line.append([t, W[i]["s"], W[i]["e"], 1 if t in k.split() else 0]); i += 1
    out.append(line)
open(os.path.join(HERE, "lines.js"), "w").write("// automatisch aus build/words.json + Skript (single/make_lines.py)\nwindow.LINES = " + json.dumps(out, ensure_ascii=False) + ";\n")
