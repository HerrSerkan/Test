# Alle Nationalitäten erklärt: Kurden (deutsche Version)

Animation mit Sprecherstimme (85 s, Tempo +12 %), Hochformat 1080×1920, Stimme + Soundeffekte, keine Musik.
Alle Grafiken (Flaggen, Atlas, Karte, Klassenzimmer, Telefon, Sprachbaum, Brot, Döner,
Hochzeitstische, Trommel, Tanzkette) sind im Canvas gezeichnet.

    python3 kurden/script.py --text                                  # Sprechertext für ElevenLabs
    python3 kurden/voice_prep.py take.mp3 kurden/build/voice_el.wav 1.12# Pausen kürzen, Tempo, EQ, Kompressor
    python3 kurden/script.py --voice kurden/build/voice_el.wav       # Wortzeiten per Whisper
    node kurden/render.js --events && python3 kurden/audio.py && node kurden/render.js

Stimme: ElevenLabs „Thomas – Confidential & calm“ (CU0jw02q6zyti7Fzfgx5), Modell eleven_v4.
Schriften aus falle/fonts (Inter, Instrument Serif – SIL Open Font License).
