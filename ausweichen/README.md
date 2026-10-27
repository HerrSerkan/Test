# Wenn ihr beide in dieselbe Richtung ausweicht (deutsche Version)

Animation ohne Sprecher, 18,2 s, Hochformat 1080×1920, nur Soundeffekte (keine Musik).
Nacht-Gehweg: „Du“ und ein Passant weichen sich immer wieder gleich aus, der
Peinlichkeits-Balken steigt bis 97 %, dann geht er vorbei – und der Nächste kommt (150 %).
Figuren, Gesichter, Skyline und Laternen sind im Canvas gezeichnet. Titel unter der Szene.

    node ausweichen/render.js --events   # Zeitpunkte für die Effekte
    python3 ausweichen/audio.py          # Effekte, Limiter, -14 LUFS (EBU R128) -> build/audio.wav
    node ausweichen/render.js            # Video -> ausweichen/ausweichen.mp4

Vorschaubilder: `node ausweichen/render.js --preview 3 10.7`
Aufbau nach falle/ bzw. gymangst/. Schriften aus falle/fonts (Inter, SIL Open Font License).
