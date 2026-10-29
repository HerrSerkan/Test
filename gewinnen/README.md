# Ich muss gewinnen / Ich will gewinnen (1:1-Nachbau, deutsche Version)

Animation ohne Sprecher, 12 s, Hochformat 1080×1920, Hintergrundmusik (ElevenLabs Music) + Soundeffekte.
Nachts im Regen: Der graue Läufer jubelt schon vor der Ziellinie, der weiße hechtet sich ins Ziel und gewinnt.
Pseudo-3D-Kamera (Bahn, Tribüne mit Regenschirmen, Regen, Spritzer), Strichmännchen werden projiziert.

    node tools/canvas_render.js gewinnen --events
    python3 gewinnen/audio.py
    python3 tools/mix_music.py gewinnen/build/audio.wav gewinnen/build/music.mp3 gewinnen/build/mix.wav -16.5 -17.5 auto:6.2
    node tools/canvas_render.js gewinnen --out gewinnen/ich_will_gewinnen.mp4 --audio gewinnen/build/mix.wav

Musik: ElevenLabs eleven_music_v2_5, als build/music.mp3 ablegen (nicht im Repo).
Schriften: Silkscreen, Inter (SIL Open Font License).
