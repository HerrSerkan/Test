# Homo Erectus vs. Homo Sapiens (deutsche Version)

Animation ohne Worte, 16,8 s, Hochformat 1080×1920, Hintergrundmusik + Soundeffekte.
Geteiltes Bild: oben Homo Erectus (blaue Köpfe) – Feuer geht aus, Panik, Frieren, Blitz,
Fackel holen, leichter Schlaf. Unten Homo Sapiens (grüne Köpfe) – Feuerstein, Feuer brennt
wieder, Tiefschlaf mit Wache. Schluss: „BEWAHRT FEUER“ / „MACHT FEUER“. Alles im Canvas gezeichnet.

    node feuer/render.js --events   # Zeitpunkte für die Effekte
    python3 feuer/audio.py          # Effekte + Musik, -14 LUFS (EBU R128) -> build/audio.wav
    node feuer/render.js            # Video -> feuer/feuer.mp4

Musik: build/music.mp3 (ElevenLabs Music), falls vorhanden; sonst erzeugt audio.py eine
Steinzeit-Musik selbst (Rahmentrommel, Fläche, Holzflöte). Schriften aus falle/fonts.
