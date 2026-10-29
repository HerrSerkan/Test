# Frühaufsteher / Nachteule / Immer müde (1:1-Nachbau, deutsche Version)

Animation ohne Sprecher, 12,2 s, Hochformat 1080×1920, Hintergrundmusik (ElevenLabs Music) + Soundeffekte.
Ein Haus mit drei Fenstern, die Uhr läuft von 05:00 bis 04:30. Der Frühaufsteher ist ab 5 Uhr wach und schläft um 21 Uhr,
die Nachteule öffnet erst mittags den Vorhang und feiert nachts. Der Dritte schläft nie richtig: um 03:00 wird aus „???“ „IMMER MÜDE“.

    node tools/canvas_render.js fruehaufsteher --events          # Zeitpunkte für die Effekte
    python3 fruehaufsteher/audio.py                              # Effekte -> build/audio.wav
    python3 tools/mix_music.py fruehaufsteher/build/audio.wav fruehaufsteher/build/music.mp3 fruehaufsteher/build/mix.wav -17.5 -17 auto:10.8
    node tools/canvas_render.js fruehaufsteher --out fruehaufsteher/fruehaufsteher_nachteule.mp4 --audio fruehaufsteher/build/mix.wav

Musik: ElevenLabs eleven_music_v2_5, als build/music.mp3 ablegen (nicht im Repo).
Schrift: Inter (SIL Open Font License).
