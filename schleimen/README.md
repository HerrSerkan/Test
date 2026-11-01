# Kampf, Flucht, Erstarren – oder Schleimen. (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 11,4 s, 1080×1920, 60 fps, Musik + Effekte.
Halloween an der Spukhaus-Tür: vier Kinder in Kostümen, ein Gespenst ruft „BUH!“. FLUCHT rennt weg, ERSTARREN wird zum Eisblock,
KAMPF boxt das Gespenst („BONK!“), „???“ sagt „Tolles Kostüm!“ – das Gespenst wird rot und schüttet ihm Süßes in den Eimer.
Titel „KAMPF, FLUCHT, ERSTARREN / ODER …?“ wird zu „ODER SCHLEIMEN.“, Sticker, Schleife.

    node tools/canvas_render.js schleimen --events
    python3 schleimen/audio.py
    python3 tools/synth_music.py schleimen/build/music.wav 34 100 spuk 17     # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py schleimen/build/audio.wav schleimen/build/music.wav schleimen/build/mix.wav -17 -15 auto:6.4
    node tools/canvas_render.js schleimen --out schleimen/schleimen.mp4 --audio schleimen/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
