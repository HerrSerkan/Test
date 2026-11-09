# Manche Menschen bleiben jahrelang Single (1:1-Nachbau, deutsche Version)

Animation mit Sprecher, 47,5 s, Hochformat 1080×1920. Schwarze Bühne, Lichtkegel, weiße Strichfigur,
17 Szenen (eine pro Satz). Der Text steht oben und leuchtet Wort für Wort zur Stimme auf, ein Schlüsselwort pro Satz in Rot.

Stimme: vidIQ voiceover (ElevenLabs-Stimme „Brian“), Musik: vidIQ generate_music (Piano, instrumental).

    python3 falle/voice_prep.py single/build/voice_raw.mp3 single/build/voice.wav 1.0
    python3 single/words.py           # Wortzeiten -> build/words.json
    python3 single/make_lines.py      # Skript + Zeiten -> lines.js
    node tools/canvas_render.js single --events
    python3 single/audio.py
    python3 tools/mix_music.py single/build/audio.wav single/build/music.wav single/build/mix.wav -24 -15 0
    node tools/canvas_render.js single --out single/jahrelang_single.mp4 --audio single/build/mix.wav

Stimme und Musik als build/voice_raw.mp3 und build/music.wav ablegen (nicht im Repo). Schrift: Silkscreen (SIL OFL), Emoji: Noto Color Emoji.
