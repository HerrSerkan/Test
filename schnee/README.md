# Guter Freund / Bester Freund (1:1-Nachbau, deutsche Version, eigene Zeichnung)

Idee: @akteungeloest0. Animation ohne Sprecher, 16,6 s, 1080×1920, 60 fps, Musik + Effekte.
Winterabend vor einem Fachwerkhaus: Er bricht einen Eiszapfen ab, eine Schneeplatte rutscht vom Dach und begräbt ihn.
GUTER FREUND gräbt ihn aus und klopft ihm den Schnee vom Kopf. Zurückspulen. BESTER FREUND lacht sich kaputt,
läuft dann selbst unter die nächste Platte – am Ende stecken beide im Schnee und lachen zusammen.

    node tools/canvas_render.js schnee --events
    python3 schnee/audio.py
    python3 tools/mix_music.py schnee/build/audio.wav schnee/build/music.wav schnee/build/mix.wav -18 -15 auto:2
    node tools/canvas_render.js schnee --out schnee/guter_bester_freund.mp4 --audio schnee/build/mix.wav --fps 60

Musik: vidIQ generate_music (Winter-Glockenspiel, instrumental), als build/music.wav ablegen (nicht im Repo). Schrift: Inter (SIL OFL).
