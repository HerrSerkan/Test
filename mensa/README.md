# Gleicher Tisch. Anderer Grund. (1:1-Nachbau, deutsche Version)

Animation ohne Sprecher, 13,35 s, Hochformat 1080×1920, Hintergrundmusik (ElevenLabs Music) + Soundeffekte.
In der Mensa übt „Schüchtern“ im Kopf, wie er sich dazusetzt. „Introvertiert“ lehnt die Einladung entspannt ab,
„Schüchtern“ platzt mit „SEI GEGRÜSST, MENSCH.“ heraus, alle lachen, und er darf sich dazusetzen. Pausengong, Schleife.

    node tools/canvas_render.js mensa --events
    python3 mensa/audio.py
    python3 tools/mix_music.py mensa/build/audio.wav mensa/build/music.mp3 mensa/build/mix.wav -17.5 -17 auto:9.2
    node tools/canvas_render.js mensa --out mensa/gleicher_tisch.mp4 --audio mensa/build/mix.wav

Musik: ElevenLabs eleven_music_v2_5, als build/music.mp3 ablegen (nicht im Repo).
Schrift: Inter (SIL Open Font License).
