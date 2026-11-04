# Rotanien – Tag 3 (Fortsetzung, 1:1 nach dem Mond-Video „Tag 3“, angepasst auf Gedacht @einfach..wissen)

Animation mit Sprecher, 45,9 s, Hochformat 1080×1920. Stand der Zahlen: 04.11.2026 – 629 Follower (+611), 630 Einwohner, 3.858 Likes.
Gesetz Nr. 2 „Keine Steuern“ (Top-Kommentar von Luca), Wünsche aus den Kommentaren: Gabriel Emilijan (Laserschwert),
elster (pinker Anzug mit Hundeohren), Entenlover/Nr. 410 (Enten-Freund), Bonus: Dönerladen (meistgewünscht).
Dann Alien-Funkspruch mit unserer gestohlenen Fahne, Ultimatum 24 Stunden, Flotte hinter Phobos, Umfrage „Abhauen oder kämpfen?“.

Aufbau: base.js + helpers3.js + tag3.js -> scene.js

    cat mars3/base.js mars3/helpers3.js mars3/tag3.js > mars3/scene.js
    python3 mars3/voice_prep.py mars3/build/voice_raw.mp3 mars3/build/voice.wav 1.2 0.3
    python3 mars3/words.py && python3 mars3/make_lines.py
    python3 tools/synth_music.py mars3/build/music_dark.wav 40 100 spuk 3      # music_day.wav = Musik aus Tag 1/2
    node tools/canvas_render.js mars3 --events
    python3 mars3/audio.py            # Effekte, Alien-Stimme, Musikwechsel bei „heute Nacht“ -> build/audio.wav + build/music.wav
    python3 tools/mix_music.py mars3/build/audio.wav mars3/build/music.wav mars3/build/mix.wav -22 -15 0
    node tools/canvas_render.js mars3 --out mars3/rotanien_tag3.mp4 --audio mars3/build/mix.wav

Profilbilder (luca/gabriel/elster/ente.png) aus den Kommentar-Screenshots. Stimme: vidIQ „Liam“.
Schriften: Luckiest Guy (Apache 2.0), Inter (SIL OFL); Emoji: Noto Color Emoji.
