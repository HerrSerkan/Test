# Aufschieber vs. Planer (1:1-Nachbau) (deutsche Version)

Animation ohne Sprecher, 13,4 s, Hochformat 1080×1920, Hintergrundmusik (ElevenLabs Music) + Soundeffekte.
Abreißkalender von 30 Tagen bis zur Abgabe, Fenster mit Tag/Nacht. Der Aufschieber hängt am Handy, die Gewitterwolke wächst,
Nachtschicht am letzten Tag. Der Planer arbeitet früh und lehnt sich zurück. Beide bekommen eine 1+, dann beginnt alles von vorn.

    node tools/canvas_render.js aufschieber_1zu1 --events          # Zeitpunkte für die Effekte
    python3 aufschieber_1zu1/audio.py                              # Effekte -> build/audio.wav
    python3 tools/mix_music.py aufschieber_1zu1/build/audio.wav aufschieber_1zu1/build/music.mp3 aufschieber_1zu1/build/mix.wav
    node tools/canvas_render.js aufschieber_1zu1 --out aufschieber_1zu1/aufschieber_planer.mp4 --audio aufschieber_1zu1/build/mix.wav

Musik: ElevenLabs eleven_music_v2_5, als build/music.mp3 ablegen (nicht im Repo).
Schrift: Silkscreen (SIL Open Font License).

