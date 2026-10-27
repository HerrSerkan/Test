# Wartet auf Montag vs. fängt heute an (eigenes Video für @tb.flared)

Animation ohne Worte, 14 s, Hochformat 1080×1920, Hintergrundmusik (ElevenLabs Music) + Soundeffekte.
Links sitzt einer am Handy und legt nur montags einen Stein, rechts baut einer jeden Tag eine Stufe.
Ein neongrüner Kalender blättert die Tage durch; die fertige Treppe leuchtet grün, der Macher springt weiter.
Stil, Figuren und Code nach perfektionist/.

    node montag/render.js --events   # Zeitpunkte für die Effekte
    python3 montag/audio.py          # Effekte + build/music.mp3, -14 LUFS (EBU R128) -> build/audio.wav
    node montag/render.js            # Video -> montag/montag.mp4

Musik: ElevenLabs eleven_music_v2_5, als build/music.mp3 ablegen (nicht im Repo).
Schriften aus falle/fonts (Inter, SIL Open Font License).
