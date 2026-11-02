# Wartet auf Klarheit vs. geht einfach los (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 13,5 s, Hochformat 1080×1920, keine Musik – nur Soundeffekte.
Oben wartet einer im Dunkeln (schaut sich um, Uhr, Schulterzucken, setzt sich). Unten geht einer einfach los,
mit jedem Schritt geht über ihm ein Licht an. Dann zieht das untere Bild auf: „ERST DER SCHRITT. DANN KOMMT DAS LICHT.“

    echo '{"duration": 13.5}' > klarheit/build/timeline.json
    node klarheit/render.js --events   # Zeitpunkte für die Effekte
    python3 klarheit/audio.py          # Effekte, -14 LUFS -> build/audio.wav
    node klarheit/render.js            # Video -> klarheit/klarheit.mp4

Schriften aus falle/fonts (Inter, SIL Open Font License).
