# Doppelte Muskeln (Myostatin)

Nachbau der Erklär-Geschichte „Was wäre, wenn du mit doppelt so vielen Muskeln geboren wärst?“ (ca. 103 s, Hochformat).
Sprecherstimme: ElevenLabs (Stimme „George“, eleven_multilingual_v2), um 25 % beschleunigt. Figuren aus `tools/figur_rig.js`.

    python3 muskeln/prep.py      # Zeitachse aus voice/stt_voice.json -> build/timeline.js
    python3 muskeln/audio.py     # Stimme + Musik + Effekte -> build/audio.wav
    node tools/canvas_render.js muskeln --out muskeln/doppelte_muskeln.mp4 --audio muskeln/build/audio.wav
