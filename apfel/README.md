# Gleiche Vorstellung. 3 verschiedene Köpfe (deutsche Version)

Idee: @nkzwl1. Animation ohne Sprecher, 14 s, 1080×1920, Musik + Effekte, -14 LUFS.
„Stell dir einen roten Apfel vor.“ – normales Kopfkino (kleiner Apfel), Aphantasie (leere Wolke),
Hyperphantasie (riesiger Apfel mit Wassertropfen, der sich dreht). Pointe: „MOMENT… DU SIEHST ECHT BILDER IM KOPF?!“
Musik: tools/synth_music.py (ElevenLabs-Guthaben war aufgebraucht).

    node tools/canvas_render.js apfel --events && python3 apfel/audio.py
    python3 tools/synth_music.py apfel/build/music_synth.wav 18 104 verspielt 3
    python3 tools/mix_music.py apfel/build/audio.wav apfel/build/music_synth.wav apfel/build/mix.wav -17 -16 0
    node tools/canvas_render.js apfel --out apfel/build/video_silent.mp4
    ffmpeg -i apfel/build/video_silent.mp4 -i apfel/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest apfel/apfel.mp4
