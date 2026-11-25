# Mach den Ton aus. Hörst du es trotzdem? (deutsche Version)

Idee: @nkzwl1. Animation ohne Sprecher, 14 s, 1080×1920, Musik + Effekte, -14 LUFS.
Ein Würfel springt lautlos Seil auf der Kinoleinwand; „die meisten“ hören nichts, einer hört es (visuelles Hören / vEAR),
einer halb. Zeitlupe, Popcorn fällt, Leinwand reißt. Pointe: „1 VON 5 MENSCHEN HÖRT LAUTLOSE BEWEGUNG.“
Bewusst ohne Aufprall-Geräusch des Würfels.

    node tools/canvas_render.js lautlos --events && python3 lautlos/audio.py
    python3 tools/synth_music.py lautlos/build/music_synth.wav 18 96 cool 5
    python3 tools/mix_music.py lautlos/build/audio.wav lautlos/build/music_synth.wav lautlos/build/mix.wav -17.5 -16 0
    node tools/canvas_render.js lautlos --out lautlos/build/video_silent.mp4   # dann mit ffmpeg zusammenführen
