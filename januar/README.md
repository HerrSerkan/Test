# Gleiches Gym. Anderer Vorsatz. (eigenes Video im Stil von fruehaufsteher/ + mensa/)

Eigene Idee (Winter/Januar, Fitnessstudio), Aufbau nach dem Skill kurzvideo-regeln. Ohne Sprecher, 13,3 s, 1080×1920, 60 fps, Musik + Effekte.
Fitnessstudio, der Kalender läuft vom 1. bis 31. Januar. KOMMT JEDEN TAG macht durchgehend Curls,
NEUJAHRSVORSATZ (neues Outfit mit Preisschild) rennt los, wird langsamer und geht am 14. „ab morgen wieder!“.
„???“ sitzt den ganzen Monat mit dem Handy auf der Hantelbank. Hook „JEDES GYM HAT DIESEN EINEN.“, Rehook „WARTE BIS ENDE JANUAR …“.
31. Januar: „???“ = „SITZT NUR AM HANDY“ – „SEIT 31 TAGEN?!“. Titel „GLEICHES GYM. / ANDERER VORSATZ.“, Sticker, Schleife.

    node tools/canvas_render.js januar --events
    python3 januar/audio.py
    python3 tools/synth_music.py januar/build/music.wav 34 124 verspielt 9     # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py januar/build/audio.wav januar/build/music.wav januar/build/mix.wav -17.5 -16 auto:9.0
    node tools/canvas_render.js januar --out januar/gleiches_gym.mp4 --audio januar/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
