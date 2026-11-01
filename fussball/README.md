# Gleiches Spiel. Anderes Timing. (eigenes Video im Stil von fruehaufsteher/ + mensa/)

Eigene Idee (Fußball), Aufbau nach dem Skill kurzvideo-regeln. Ohne Sprecher, 13,3 s, 1080×1920, 60 fps, Musik + Effekte.
Fußballabend auf dem Sofa, die Spielminute läuft von 1 bis 90.+3 (neutrale Mannschaften, keine echten Vereine).
BRÜLLT DEN SCHIRI AN, ERKLÄRT ABSEITS und „???“ im Trikot. In der 89. Minute: „hol nur kurz Chips!“ – dann TOR! 1:0.
Hook „JEDER HAT DIESEN EINEN KUMPEL.“, Rehook „WARTE AUF DIE 90. MINUTE …“. „???“ = „VERPASST JEDES TOR“,
kommt mit voller Schale zurück: „WAS HAB ICH VERPASST?“. Titel „GLEICHES SPIEL. / ANDERES TIMING.“, Sticker, Schleife.

    node tools/canvas_render.js fussball --events
    python3 fussball/audio.py
    python3 tools/synth_music.py fussball/build/music.wav 34 118 verspielt 11     # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py fussball/build/audio.wav fussball/build/music.wav fussball/build/mix.wav -18 -17 auto:9.0
    node tools/canvas_render.js fussball --out fussball/gleiches_spiel.mp4 --audio fussball/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
