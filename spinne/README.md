# Gleiche Spinne. 3 verschiedene Gehirne (deutsche Version)

Idee: @nkzwl1. Animation ohne Sprecher, 14 s, 1080×1920, Musik + Effekte, -14 LUFS.
Die meisten (Glas – *klack*, daneben) / rettet jede Spinne („Steve??“) / Panik (Arachnophobie, Hausschuh).
„…wo ist sie hin?“ – Spinne landet auf dem Kopf – „AAAAAA!!“ – gerettet – „WIE SOLL ICH JETZT SCHLAFEN?!“

    node tools/canvas_render.js spinne --events && python3 spinne/audio.py
    python3 tools/synth_music.py spinne/build/music_synth.wav 18 100 spuk 6
    python3 tools/mix_music.py spinne/build/audio.wav spinne/build/music_synth.wav spinne/build/mix.wav -17 -16 0
    node tools/canvas_render.js spinne --out spinne/build/video_silent.mp4   # dann mit ffmpeg zusammenführen
