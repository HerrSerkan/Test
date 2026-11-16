# Gleiche Serie. 47 Minuten später. (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 13 s, 1080×1920, 60 fps, Musik + Effekte.
Zwei Sessel, über jedem ein Bildschirm (neutrale Vorschaubilder, keine echten Dienste). MAXIMIERER klickt sich durch
Vorschaubilder, Trailer und Bewertungen – „GECHECKT“ zählt bis 284, das Popcorn ist dabei leer. SATISFICER nimmt das Erste,
lacht, weint, sieht „ENDE“ und schläft ein. Erst dann: „DIE HIER!“ – bei ihm startet FOLGE 1.
Hook „DAFÜR GIBT ES SOGAR EIN WORT.“, Rehook „UND WER IST ZUERST FERTIG?“. Titel „GLEICHE SERIE. / 47 MINUTEN SPÄTER.“

    node tools/canvas_render.js serie --events
    python3 serie/audio.py
    python3 tools/synth_music.py serie/build/music.wav 34 96 cool 23          # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py serie/build/audio.wav serie/build/music.wav serie/build/mix.wav -17 -15 auto:9.9
    node tools/canvas_render.js serie --out serie/gleiche_serie.mp4 --audio serie/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
