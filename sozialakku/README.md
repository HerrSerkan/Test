# Gleicher Akku. Drei Ladegeräte. (deutsche Version)

Animation ohne Sprecher, 13,7 s, Hochformat 1080×1920, nur Soundeffekte.
Introvertiert, ambivertiert und extrovertiert auf einer Party und danach zu Hause –
die Akkus zeigen, wer wo Energie verliert oder tankt.

    node sozialakku/render.js --events   # Zeitpunkte für die Effekte
    python3 sozialakku/audio.py          # Effekte -> build/audio.wav
    node sozialakku/render.js            # Video -> sozialakku/sozialakku.mp4 (-14 LUFS)

Vorschaubilder: `node sozialakku/render.js --preview 3.6 9.9`
Schriften aus falle/fonts (Inter, SIL Open Font License).
