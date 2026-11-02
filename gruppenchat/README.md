# Jeder Gruppenchat hat diese 5 Leute (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 13,4 s, Hochformat 1080×1920, keine Musik – nur Soundeffekte.
Oben der Chat „Die Clique“, unten fünf eigene Figuren: Planer, Sprachi, Daumen, Geist, Lol.
Jeder wird mit Nummer und Spruch vorgestellt, der Chat zeigt dazu Umfrage, Sprachnachrichten, Daumen, „lol“.
Schluss: „UND DER PLAN FINDET NIE STATT. Welcher bist du?“

    echo '{"duration": 13.4}' > gruppenchat/build/timeline.json
    node gruppenchat/render.js --events   # Zeitpunkte für die Effekte
    python3 gruppenchat/audio.py          # Effekte, -14 LUFS -> build/audio.wav
    node gruppenchat/render.js            # Video -> gruppenchat/gruppenchat.mp4

Schriften aus falle/fonts (Inter, SIL Open Font License).
