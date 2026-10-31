# Wenn ihr Tschüss sagt und dann in dieselbe Richtung geht

Neues Meme-Video im Stil von ausweichen/ (gleiche Figuren, Nacht-Gehweg, Peinlichkeits-Balken), ohne Sprecher, 19,6 s, 1080×1920.
„DU“ und die mintgrüne Figur verabschieden sich, laufen dann aber in dieselbe Richtung: „Oh … du auch hier lang?“,
peinliches Nebeneinander-Herlaufen, beide bleiben gleichzeitig stehen, Zusammenstoß (97 %), zweites Tschüss.
Pointe: eine neue Figur – „Oh, hey! Du auch hier lang?“ – rosa Blitz, 150 %, „Jedes. Einzelne. Mal.“

    node tschuess/render.js --events   # Zeitpunkte für die Effekte
    python3 tschuess/audio.py          # Effekte + Musik (build/music.mp3), -14 LUFS -> build/audio.wav
    node tschuess/render.js            # Video -> tschuess/tschuess.mp4

Musik: ElevenLabs eleven_music_v2_5, als build/music.mp3 ablegen (nicht im Repo). Schriften aus falle/fonts.
