# Tag 1 auf dem Mars: „Rotanien“ (1:1-Nachbau des Mond-Videos, nur auf dem Mars)

Animation mit Sprecher, 24,4 s, Hochformat 1080×1920. Gleicher Ablauf und Text wie das Original („Orbitanien“ auf dem Mond),
nur auf dem Mars und mit dem Landesnamen „Rotanien“: Landung, „1 FOLLOW = 1 ASTRONAUT“, Flagge, Einwohnerzähler, Profilkarte,
Geister-Astronauten mit OG-Bordkarte, Gesetzbuch, Top-Kommentar, Kalender „KEIN MONTAG MEHR?“, „GESETZ NR. 1: ???“.

Stimme: vidIQ voiceover (Stimme „Liam“), Pausen gekürzt und Tempo 1,2. Musik: vidIQ generate_music (instrumental).

    python3 mars/voice_prep.py mars/build/voice_raw.mp3 mars/build/voice.wav 1.2 0.32
    python3 mars/words.py && python3 mars/make_lines.py
    node tools/canvas_render.js mars --events
    python3 mars/audio.py
    python3 tools/mix_music.py mars/build/audio.wav mars/build/music.wav mars/build/mix.wav -22 -15 0
    node tools/canvas_render.js mars --out mars/rotanien.mp4 --audio mars/build/mix.wav

Stimme und Musik als build/voice_raw.mp3 und build/music.wav ablegen (nicht im Repo). Schrift: Inter (SIL OFL), Emoji: Noto Color Emoji.
