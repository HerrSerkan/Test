# Die Intelligenzfalle (deutsche Version)

Animation mit Sprecherstimme, 71,8 s, Hochformat 1080×1920.

    python3 falle/script.py        # Stimme (Edge TTS) + Zeitplan -> falle/build/
    node falle/render.js --events  # Zeitpunkte für die Tonspur
    python3 falle/audio.py         # Musik, Effekte, Mischung
    node falle/render.js           # Video -> falle/intelligenzfalle.mp4

Benötigt: Python mit numpy, scipy, edge-tts; Node mit Playwright/Chromium; ffmpeg.
Schriften: Inter, Instrument Serif (beide SIL Open Font License).
