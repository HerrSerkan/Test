# Gleicher Film. (Misophonie, deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. TikTok-Vollbild, ohne Sprecher, 11,8 s, 1080×1920, 60 fps, Musik + Effekte.
Kino: DIE MEISTEN knuspern Chips, bei MISOPHONIE steigt mit jedem „CRUNCH!“ die Wut, bis er rot ist und dampft.
„Willst du was?“ – „Nein danke :)“ – „CRUNCH!!!“. Titel: „FAST 1 VON 5 MENSCHEN / HABEN MISOPHONIE.“
(britische Studie 2023: rund 18 %). Am Ende reißt eine neue Tüte auf: „RIIIPP!“
Figuren: tools/figur_rig.js. Klänge: tools/sfx.py.

    node tools/canvas_render.js misophonie --events
    python3 misophonie/audio.py
    python3 tools/synth_music.py misophonie/build/music.wav 34 96 cool 83
    python3 tools/mix_music.py misophonie/build/audio.wav misophonie/build/music.wav misophonie/build/mix.wav -17 -15 auto:7.6
    node tools/canvas_render.js misophonie --out misophonie/gleicher_film.mp4 --audio misophonie/build/mix.wav --fps 60
