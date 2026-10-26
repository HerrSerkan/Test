# Referat-Angst (eigene Idee im Stil von "Gym-Angst")

Animation ohne Sprecher, 12,9 s, Hochformat 1080×1920, nur Soundeffekte.
"In seinem Kopf": Klasse dreht sich um, starrt, hält Schulnoten hoch, beim ersten "äh" geht der
Alarm los, die Karteikarten fliegen – Zurückspulen – "In Wirklichkeit": Handy, Schlafen, Kritzeln,
Kaffee. Schlusssatz unter der Szene.

    node referat/render.js --events   # Zeitpunkte für die Effekte
    python3 referat/audio.py          # Effekte -> build/audio.wav
    node referat/render.js            # Video -> referat/referat.mp4 (-14 LUFS)

Aufbau, Farben, Schrift und Zurückspul-Effekt wie gymangst/. Schriften aus falle/fonts.
