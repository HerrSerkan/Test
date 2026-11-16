# Deine Arbeit baut ihren Berg. (deutsche Version, eigene Zeichnung)

Idee: @moneyinmono. TikTok-Vollbild, ohne Sprecher, 21 s, 1080×1920, 60 fps, Musik + Effekte.
ARBEITER kurbelt an einer Münzmaschine, die Münzen fliegen auf den wachsenden Goldberg des CHEFS, jede vierte fällt ins
Loch „KOSTEN“. „… und ich?“ – nichts. Dann behält er jede dritte Münze und baut einen eigenen kleinen Stapel.
Schlusstext: „DEINE ARBEIT BAUT IHREN BERG. / BEHALTE EINE MÜNZE. BAU DEINEN.“
Figuren: tools/figur_rig.js. Klänge: tools/sfx.py.

    node tools/canvas_render.js muenzen --events
    python3 muenzen/audio.py
    python3 tools/synth_music.py muenzen/build/music.wav 40 84 cool 89
    python3 tools/mix_music.py muenzen/build/audio.wav muenzen/build/music.wav muenzen/build/mix.wav -17 -15 auto:12
    node tools/canvas_render.js muenzen --out muenzen/ihr_berg.mp4 --audio muenzen/build/mix.wav --fps 60
