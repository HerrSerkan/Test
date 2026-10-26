# Gym-Angst (deutsche Version)

Animation ohne Sprecher, 12,9 s, Hochformat 1080×1920, nur Soundeffekte.
"In seinem Kopf": dunkles Studio, alle starren, Wertungstafeln, Alarm, Ohnmacht –
Zurückspulen – "In Wirklichkeit": keiner schaut hin. Schlusssatz unter der Szene.

    node gymangst/render.js --events   # Zeitpunkte für die Effekte
    python3 gymangst/audio.py          # Effekte -> build/audio.wav
    node gymangst/render.js            # Video -> gymangst/gymangst.mp4 (-14 LUFS, zwei Durchgänge)

Vorschaubilder: `node gymangst/render.js --preview 4.8 11`
Schriften aus falle/fonts (Inter, SIL Open Font License).
