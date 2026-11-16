# Rotanien – Tag 4 (1:1 nach dem Mond-Video „Tag 4“, angepasst auf Gedacht @einfach..wissen)

Animation mit Sprecher, 57,9 s, Hochformat 1080×1920. Stand 05.11.2026: 788 Follower (+159), 789 Einwohner, 4.104 Likes,
Umfrage „Was machen wir“: 96 % Kämpfen, 127 Stimmen.
Ablauf wie im Original: Umfrage, Zähler +159, Profilkarte, „Wir halten zusammen“, Ausbau (Häuser, Raketenwerft, Wachtürme,
Funkturm, Schildzentrale), Wünsche (Jakob: Stein-Freund, Bz_Full: Huhn auf dem Kopf, herobrine: Rucksack mit Foto),
Schutzschild an, Rede am Pult („Unser Planet. Zusammen.“), Alarm nach 24 Stunden, Alien-Flotte, Laser auf den Schild (100 → 68 → 63 %),
Funkspruch „Letzte Chance. Gebt auf.“, „Niemals!“, Top-Kommentar = Schlachtplan.
Easter Eggs (versteckt, ohne Namen): Fußballschuhe, Lambo, Dino-Hut, Döner-Helm, Katze, Hund, Melone, Schleife, Cola, Gamer-Headset/Controller.

Aufbau: base.js + helpers3.js + lib4.js + tag4.js -> scene.js

    cat mars4/base.js mars4/helpers3.js mars4/lib4.js mars4/tag4.js > mars4/scene.js
    # Stimme: ElevenLabs „Liam“ (eleven_multilingual_v2), Text in script.txt -> build/voice_raw.mp3
    python3 mars4/voice_prep.py mars4/build/voice_raw.mp3 mars4/build/voice.wav 1.2 0.3
    python3 mars4/words.py && python3 mars4/make_lines.py
    node tools/canvas_render.js mars4 --events
    python3 mars4/audio.py
    python3 tools/mix_music.py mars4/build/audio.wav mars4/build/music.wav mars4/build/mix.wav -21 -15 0
    node tools/canvas_render.js mars4 --out mars4/rotanien_tag4.mp4 --audio mars4/build/mix.wav

Musik: Teil 1 wie Tag 3 (build/music_day117.wav), ab „Am Abend schalten wir den Schild ein“:
„Heroic Age“ von Kevin MacLeod (incompetech.com), lizenziert unter CC BY 4.0 – Nennung in der Videobeschreibung nötig.
Schriften: Luckiest Guy (Apache 2.0), Inter (SIL OFL); Emoji: Noto Color Emoji.
