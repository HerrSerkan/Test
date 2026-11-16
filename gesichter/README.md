# Gleicher Freund. (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. TikTok-Vollbild, ohne Sprecher, 11,8 s, 1080×1920, 60 fps, Musik + Effekte.
Vor einem Café kommt ein Freund mit gelber Mütze: „HEY!!“. DIE MEISTEN erkennen ihn sofort. GESICHTSBLIND denkt Gesicht → X → Haken
(an der Mütze) – „HEYYY … DU!!“. Ohne Mütze: „?“ – „Freut mich!“. Mütze wieder auf: „Ah, DU!“
Titel: „BIS ZU 1 VON 33 MENSCHEN / SIND GESICHTSBLIND.“ (Schätzung einer Studie von 2023, Harvard/Boston VA).
Figuren: tools/figur_rig.js. Klänge: tools/sfx.py.

    node tools/canvas_render.js gesichter --events
    python3 gesichter/audio.py
    python3 tools/synth_music.py gesichter/build/music.wav 34 100 verspielt 79
    python3 tools/mix_music.py gesichter/build/audio.wav gesichter/build/music.wav gesichter/build/mix.wav -17 -15 auto:8.3
    node tools/canvas_render.js gesichter --out gesichter/gleicher_freund.mp4 --audio gesichter/build/mix.wav --fps 60
