# Wenn die Lehrerin sagt: „Sucht euch einen Partner!“ (deutsche Version)

Idee: @nkzwl1. Animation ohne Sprecher, 14 s, 1080×1920, Musik + Effekte, -14 LUFS.
Introvertiert / Omnivertiert / Extrovertiert mit sozialem Akku vor der Tafel; fünf Phasen
(Gruppenarbeit, alle haben schon Partner, Vorstellen, Präsentation, „Nächste Woche gleiche Partner!“).

    node tools/canvas_render.js partner --events && python3 partner/audio.py
    python3 tools/synth_music.py partner/build/music_synth.wav 18 112 verspielt 8
    python3 tools/mix_music.py partner/build/audio.wav partner/build/music_synth.wav partner/build/mix.wav -17 -16 0
    node tools/canvas_render.js partner --out partner/build/video_silent.mp4   # dann mit ffmpeg zusammenführen
