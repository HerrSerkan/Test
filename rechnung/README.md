# Gleiche Rechnung. Andere Strategie. (eigenes Video im Stil von fruehaufsteher/ + mensa/)

Eigene Idee nach TYPEN_PROMPTS.md, Aufbau nach dem Skill kurzvideo-regeln (Hook, Rehook, Wort-für-Wort-Text, Loop).
Animation ohne Sprecher, 13,3 s, 1080×1920, 60 fps, Musik + Soundeffekte.
Restaurant, drei Typen: ZAHLT ALLES (Goldkette), ZÄHLT JEDEN CENT (Brille, Taschenrechner) und „???“ (Cap).
Hook „JEDER HAT DIESEN EINEN FREUND.“ – die Rechnung zählt oben mit, „???“ bestellt Cocktail um Cocktail.
Rehook „WARTE, BIS DIE RECHNUNG KOMMT …“. Rechnung kommt, Zähler wird rot, „???“ rennt los: „IST AUFS KLO“.
Titel „GLEICHE RECHNUNG. / ANDERE STRATEGIE.“, Sticker „WER BIST DU?“, Schleife.

    node tools/canvas_render.js rechnung --events
    python3 rechnung/audio.py
    python3 tools/synth_music.py rechnung/build/music.wav 34 104 cool 5     # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py rechnung/build/audio.wav rechnung/build/music.wav rechnung/build/mix.wav -17.5 -16 auto:9.0
    node tools/canvas_render.js rechnung --out rechnung/gleiche_rechnung.mp4 --audio rechnung/build/mix.wav --fps 60

Musik: vorerst synthetisch (tools/synth_music.py). Mit ElevenLabs Music (eleven_music_v2_5) als build/music.mp3 ersetzen.
Schrift: Inter (SIL Open Font License).
