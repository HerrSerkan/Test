# Gleiche Nachricht. Andere Nacht. (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 12,6 s, 1080×1920, 60 fps, Musik + Effekte.
23:12, der Chef schreibt: „Hey, können wir morgen kurz reden?“. ENTSPANNT antwortet „ok“ und schläft.
OVERTHINKER grübelt die ganze Nacht (eigene Gedanken: „Bin ich gefeuert?“ … „Alpaka-Farm?“ … „Neuer Name??“), der Wecker läuft bis 07:00.
Morgens: „…wollte nur sagen: super Arbeit! :)“ – ENTSPANNT steht frisch auf, OVERTHINKER schläft genau jetzt ein.
Hook „WENN DER CHEF UM 23 UHR SCHREIBT …“, Rehook „WARTE AUF 7 UHR …“. Titel „GLEICHE NACHRICHT. / ANDERE NACHT.“

    node tools/canvas_render.js nacht --events
    python3 nacht/audio.py
    python3 tools/synth_music.py nacht/build/music.wav 34 90 cool 19          # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py nacht/build/audio.wav nacht/build/music.wav nacht/build/mix.wav -17 -15 auto:6.6
    node tools/canvas_render.js nacht --out nacht/gleiche_nachricht.mp4 --audio nacht/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
