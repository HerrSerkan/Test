# Rotanien – Tag 3 (Fortsetzung, 1:1 nach dem Mond-Video „Tag 3“, angepasst auf Gedacht @einfach..wissen)

Animation mit Sprecher, 45,9 s, Hochformat 1080×1920. Stand der Zahlen: 04.11.2026 – 629 Follower (+611), 630 Einwohner, 3.858 Likes.
Gesetz Nr. 2 „Keine Steuern“ (Top-Kommentar von Luca), Wünsche aus den Kommentaren: Gabriel Emilijan (Laserschwert),
elster (pinker Anzug mit Hundeohren), Entenlover/Nr. 410 (Enten-Freund), Bonus: Dönerladen (meistgewünscht).
Dann Alien-Funkspruch mit unserer gestohlenen Fahne, Ultimatum 24 Stunden, Krater mit leerer Fahnenstange („Unsere Fahne? Die haben die Aliens geklaut.“), Flotte hinter dem Mond, Umfrage „Abhauen oder kämpfen?“.

Aufbau: base.js + helpers3.js + tag3.js -> scene.js

    cat mars3/base.js mars3/helpers3.js mars3/tag3.js > mars3/scene.js
    python3 mars3/voice_prep.py mars3/build/voice_raw.mp3 mars3/build/voice.wav 1.2 0.3
    python3 mars3/words.py && python3 mars3/make_lines.py
    # Musik wie im Original: Tag-Teil ~117 BPM C-Dur (Tag-1-Musik um einen Halbton tiefer, Tempo 1,042, heller),
    # Nacht-Teil 129 BPM G-Moll chromatisch mit viel Sub-Bass
    python3 -c "import librosa,soundfile as sf,numpy as np; y,sr=librosa.load('mars3/build/music_day.wav',sr=44100,mono=False); sf.write('mars3/build/music_day_c.wav',np.stack([librosa.effects.pitch_shift(c,sr=sr,n_steps=-1) for c in y]).T,sr)"
    ffmpeg -y -i mars3/build/music_day_c.wav -af "atempo=1.042,treble=g=4:f=4000,bass=g=1.5:f=90" mars3/build/music_day117.wav
    python3 tools/tension_music.py mars3/build/music_dark.wav 26 129 2
    python3 mars3/splice.py           # neue Sätze (build/piece.wav) einsetzen; danach words.py, „pinken“+„Anzug“ zu einem Token zusammenfassen
    node tools/canvas_render.js mars3 --events
    python3 mars3/audio.py            # Effekte, Alien-Stimme, Musikwechsel bei „heute Nacht“ -> build/audio.wav + build/music.wav
    python3 tools/mix_music.py mars3/build/audio.wav mars3/build/music.wav mars3/build/mix.wav -21 -15 0
    node tools/canvas_render.js mars3 --out mars3/rotanien_tag3.mp4 --audio mars3/build/mix.wav

Profilbilder (luca/gabriel/elster/ente.png) aus den Kommentar-Screenshots. Stimme: vidIQ „Liam“.
Schriften: Luckiest Guy (Apache 2.0), Inter (SIL OFL); Emoji: Noto Color Emoji.

Effekte: Kamera-Stöße bei Einschlägen, Blitz bei Schnitten, Raketen-Streifen, Geld-Regen, Funkeln bei erfüllten Wünschen,
Glitch/Scanlines beim Alien-TV, pulsierender Countdown; Ton passend dazu (Boom, Kasse, Hammer, Riser, Fanfare, Funk-Piepen, Ticken).
