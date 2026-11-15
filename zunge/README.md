# Probier's jetzt. Kannst du die Zunge rollen? (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. TikTok-Vollbild, ohne Sprecher, 11,8 s, 1080×1920, 60 fps, Musik + Effekte.
Klassenzimmer, an der Tafel „ZUNGE ROLLEN = GENETISCH“. DIE MEISTEN rollen locker, KANN'S NICHT strengt sich an:
„ist halt genetisch.“ – der EINEIIGE ZWILLING kommt dazu und rollt: „aber mein Zwilling kann's.“ – „GENETISCH“ wird
durchgestrichen, „NÖ.“ Titel: „1 VON 4 KANN'S NICHT. / UND ES IST KEIN EINFACHES GEN.“
Figuren: tools/figur_rig.js. Klänge: tools/sfx.py.

    node tools/canvas_render.js zunge --events
    python3 zunge/audio.py
    python3 tools/synth_music.py zunge/build/music.wav 34 104 verspielt 69
    python3 tools/mix_music.py zunge/build/audio.wav zunge/build/music.wav zunge/build/mix.wav -17 -15 auto:8.0
    node tools/canvas_render.js zunge --out zunge/zunge_rollen.mp4 --audio zunge/build/mix.wav --fps 60
