# Die Intelligenzfalle (deutsche Version)

Animation mit Sprecherstimme, 71,8 s, Hochformat 1080×1920.

    python3 falle/script.py        # Stimme (Edge TTS) + Zeitplan -> falle/build/
    node falle/render.js --events  # Zeitpunkte für die Tonspur
    python3 falle/audio.py         # Musik, Effekte, Mischung
    node falle/render.js           # Video -> falle/intelligenzfalle.mp4

Mit ElevenLabs-Stimme (aktuelle Version: Stimme „Thomas – Confidential & calm“, Modell eleven_v4):

    python3 falle/voice_prep.py take.mp3 falle/build/voice_el.wav   # Pausen kürzen, Tempo +6 %, EQ
    python3 falle/script.py --voice falle/build/voice_el.wav        # Wortzeiten per Whisper
    node falle/render.js --events && python3 falle/audio.py && node falle/render.js

Benötigt: Python mit numpy, scipy, edge-tts, faster-whisper; Node mit Playwright/Chromium; ffmpeg.
Schriften: Inter, Instrument Serif (beide SIL Open Font License).
