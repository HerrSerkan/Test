# 1760 vs. 2026 (deutsche Version, eigene Zeichnung)

Idee: @neuronvisuals. TikTok-Vollbild, ohne Text außer der Jahreszahl, 17 s, 1080×1920, 60 fps, Musik + Effekte.
1760: Mann mit Schlafmütze pustet die Kerze aus, schläft durch, wacht bei Sonnenaufgang frisch auf und streckt sich.
Die Jahreszahl rollt auf 2026: gleiches Bett, aber Handy-Leuchten, Benachrichtigungen, Wecker – müdes Aufwachen.
Zum Schluss fährt die Kamera auf das Bild an der Wand: der zufriedene Schläfer von 1760.
Figuren: tools/figur_rig.js. Klänge: tools/sfx.py.

    node tools/canvas_render.js schlaf --events
    python3 schlaf/audio.py
    python3 tools/synth_music.py schlaf/build/music.wav 40 80 cool 97
    python3 tools/mix_music.py schlaf/build/audio.wav schlaf/build/music.wav schlaf/build/mix.wav -18 -15 0
    node tools/canvas_render.js schlaf --out schlaf/1760_vs_2026.mp4 --audio schlaf/build/mix.wav --fps 60
