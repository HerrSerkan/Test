# Jemand muss den ersten Schritt machen (deutsche Version)

Animation ohne Sprecher, 15,2 s, Hochformat 1080×1920, Hintergrundmusik (ElevenLabs Music) + Soundeffekte.
Oben: zwei Figuren warten auf eine Entschuldigung, die Tage zählen bis 30, die Lücke wird größer.
Unten: einer macht an Tag 3 den ersten Schritt, sie treffen sich, rotes Leuchten. Schluss: „SEI DU ES.“

    node tools/canvas_render.js schritt --events          # Zeitpunkte für die Effekte
    python3 schritt/audio.py                              # Effekte -> build/audio.wav
    python3 tools/mix_music.py schritt/build/audio.wav schritt/build/music.mp3 schritt/build/mix.wav
    node tools/canvas_render.js schritt --out schritt/erster_schritt.mp4 --audio schritt/build/mix.wav

Musik: ElevenLabs eleven_music_v2_5, als build/music.mp3 ablegen (nicht im Repo).
Schrift: Silkscreen (SIL Open Font License).
