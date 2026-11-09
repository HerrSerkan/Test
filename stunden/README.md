# Gleiche 24 Stunden. Anderes Leben. (deutsche Version, eigene Zeichnung)

Idee: @strange.odds. Animation ohne Sprecher, 32 s, 1080×1920, 60 fps, Musik + Effekte.
Oben DISZIPLINIERT, unten FAUL, die Uhr spult von 05:30 bis 05:00 am nächsten Morgen.
Oben: aufstehen, Frühstück, zur Arbeit laufen, Büro (Diagramm wächst), Laufband, am Laptop programmieren, Hund ausführen,
Party mit Freunden, Heimweg, schlafen. Unten: schläft bis Mittag, Couch mit Fernseher und Chips, Müll wächst, wieder ins Bett.
Schluss: „Gleiche 24 Stunden.“ / „Anderes Leben.“

    node tools/canvas_render.js stunden --events
    python3 stunden/audio.py
    python3 tools/synth_music.py stunden/build/music.wav 50 108 verspielt 29      # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py stunden/build/audio.wav stunden/build/music.wav stunden/build/mix.wav -17 -15 0
    node tools/canvas_render.js stunden --out stunden/gleiche_24_stunden.mp4 --audio stunden/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
