# SAME SONG. – 3 different brains

1:1-Nachbau des Kurzvideos (Hochformat, 14 s): drei Figuren hören denselben Song –
MOST PEOPLE, GET CHILLS (Frisson), SEE COLORS (Chromesthesia).

- `scene.js` / `scene.html` – Canvas-Animation (Raster 576x1024, Ausgabe 1080x1920)
- `audio.py` – eigener synthetischer Track mit gleichem Aufbau (Plucks → Aufbau → Drop bei 7,35 s → ruhiges Ende)
- `same_song.mp4` – fertiges Video

Neu rendern:

    python3 samesong/audio.py
    node tools/canvas_render.js samesong --out same_song.mp4 --audio build/audio.wav
