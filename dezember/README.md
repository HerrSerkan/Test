# Schließ die Augen. Wo ist Dezember? (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. TikTok-Vollbild, ohne Sprecher, 11,8 s, 1080×1920, 60 fps, Musik + Effekte.
Bühne, zwei Scheinwerfer. DIE MEISTEN denken „DEZEMBER?“, ZEIT-RAUM-SYNÄSTHESIE hat einen Ring aus Monatskarten um sich
und zeigt: „DA.“ – „… WO?“. Titel wechselt zu „BIS ZU 1 VON 5 MENSCHEN / SEHEN DAS JAHR ALS FORM.“, der Ring dreht sich.
Figuren: tools/figur_rig.js. Klänge: tools/sfx.py.

    node tools/canvas_render.js dezember --events
    python3 dezember/audio.py
    python3 tools/synth_music.py dezember/build/music.wav 34 92 cool 63
    python3 tools/mix_music.py dezember/build/audio.wav dezember/build/music.wav dezember/build/mix.wav -17 -15 auto:8.1
    node tools/canvas_render.js dezember --out dezember/wo_ist_dezember.mp4 --audio dezember/build/mix.wav --fps 60
