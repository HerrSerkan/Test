# Falscher Freund / Echter Freund (1:1-Nachbau, deutsche Version)

Animation ohne Sprecher, 12,9 s, Hochformat 1080×1920, Musik (vidIQ, instrumental) + Soundeffekte.
Ein Auto spritzt einen Freund mit Schlamm voll. Der falsche Freund wischt ihm mit Grinsen das Gesicht ab.
Der echte Freund lacht, wirft sich selbst in die Pfütze und legt ihm den Arm um die Schulter.

    node tools/canvas_render.js freund --events
    python3 freund/audio.py
    python3 tools/mix_music.py freund/build/audio.wav freund/build/music.wav freund/build/mix.wav -17 -16.5 auto:9
    node tools/canvas_render.js freund --out freund/falscher_echter_freund.mp4 --audio freund/build/mix.wav

Musik: vidIQ generate_music (Lofi), als build/music.wav ablegen (nicht im Repo). Schrift: Silkscreen (SIL OFL).
