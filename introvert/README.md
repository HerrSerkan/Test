# 4 Typen von Introvertierten – welcher bist du? (deutsche Version)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 11,8 s, 1080×1920, Musik + Effekte.
Vier Figuren (Sozial, Nachdenklich, Ängstlich, Zurückhaltend) bekommen „PARTY HEUTE ABEND? / SO 40 LEUTE!“
und reagieren je auf ihre Art. Pointe: „VIELE INTROVERTIERTE SIND EINE MISCHUNG.“ – die Buchstaben fliegen zu einer Kugel.
Figuren, Blasen und Titel aus tools/nobody_figur.js (gemeinsam mit gaensehaut/ und dejavu/).

    node introvert/render.js --events
    python3 tools/synth_music.py introvert/build/music_synth.wav 14 84 cool 31   # nur ohne build/music.mp3
    python3 introvert/audio.py && node introvert/render.js
