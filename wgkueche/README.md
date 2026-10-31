# Gleiche Küche. Andere Ausrede. (eigenes Video im Stil von fruehaufsteher/ + mensa/)

Eigene Idee nach TYPEN_PROMPTS.md. Animation ohne Sprecher, 13,3 s, Hochformat 1080×1920, Musik + Soundeffekte.
WG-Küche, drei Typen: SPÜLT SOFORT (Gummihandschuhe), SPÜLT MORGEN (Kopfhörer, spült zweimal alles auf einmal) und „???“ (Mütze).
Der Zähler läuft von TAG 1 bis TAG 14, in der Spüle wächst der Berg, „muss noch einweichen.“ – Gestank, Fliegen, Pfeifen.
TAG 14 wird rot, „???“ wird zu „WEICHT NUR EIN“, ein Pilz wächst. Titel „GLEICHE KÜCHE. / ANDERE AUSREDE.“, Sticker, Schleife.

    node tools/canvas_render.js wgkueche --events
    python3 wgkueche/audio.py
    python3 tools/synth_music.py wgkueche/build/music.wav 34 112 verspielt 3     # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py wgkueche/build/audio.wav wgkueche/build/music.wav wgkueche/build/mix.wav -17.5 -16 auto:9.0
    node tools/canvas_render.js wgkueche --out wgkueche/gleiche_kueche.mp4 --audio wgkueche/build/mix.wav

Musik: vorerst synthetisch (tools/synth_music.py). Mit ElevenLabs Music (eleven_music_v2_5) als build/music.mp3 ersetzen.
Schrift: Inter (SIL Open Font License).
