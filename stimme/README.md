# Wessen Stimme liest das gerade? (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. TikTok-Vollbild, ohne Sprecher, 11,8 s, 1080×1920, 60 fps, Musik + Effekte.
Zwei lesen im Sessel. Bei DIE MEISTEN redet eine kleine innere Stimme in der Gedankenwolke dazwischen („Hab ich die Tür
abgeschlossen?“, „Was, wenn die mich hassen?“, „WEISST DU NOCH, 2016?!“ – „PSST!“), bei KEINE INNERE STIMME ist nur ein
ruhiger See zu sehen. Titel: „BIS ZU 1 VON 10 MENSCHEN / HABEN KEINE INNERE STIMME.“
Figuren: tools/figur_rig.js. Klänge: tools/sfx.py.

    node tools/canvas_render.js stimme --events
    python3 stimme/audio.py
    python3 tools/synth_music.py stimme/build/music.wav 34 88 cool 73
    python3 tools/mix_music.py stimme/build/audio.wav stimme/build/music.wav stimme/build/mix.wav -17 -15 auto:8.1
    node tools/canvas_render.js stimme --out stimme/innere_stimme.mp4 --audio stimme/build/mix.wav --fps 60
