# Walmart gegen Aldi

Sprecherstimme: ElevenLabs („George“, eleven_multilingual_v2), um 24 % beschleunigt.

    python3 aldi/prep.py
    python3 aldi/audio.py
    node tools/canvas_render.js aldi --out aldi/walmart_vs_aldi.mp4 --audio aldi/build/audio.wav
