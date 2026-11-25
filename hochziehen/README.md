# Nicht jeder will, dass du es schaffst. (deutsche Version)

Idee: @rovo.animation. Animation ohne Sprecher, 16,5 s, 1080×1920, Spannungsmusik + Effekte, -14 LUFS.
Nachts in einer Schlucht: Der Freund ruft „DU SCHAFFST DAS!“, der Held klettert die Wand hoch, die Menge baut eine
Pyramide und will ihn runterziehen, stürzt ab. Oben angekommen lässt er ein Seil herunter und zieht den Freund hoch;
als die Menge das Seil packen will, zieht er es rechtzeitig ein („MIST!“). Titel-Wechsel: „ZIEH DEN HOCH, DER AN DICH GLAUBT.“
(Der derbe Schluss-Gag des Originals wurde durch das Seil-Einziehen ersetzt; kein Outro/Logo.)

    node tools/canvas_render.js hochziehen --events && python3 hochziehen/audio.py
    python3 tools/tension_music.py hochziehen/build/music_synth.wav 20 120 2
    python3 tools/mix_music.py hochziehen/build/audio.wav hochziehen/build/music_synth.wav hochziehen/build/mix.wav -16.5 -16 0
    node tools/canvas_render.js hochziehen --out hochziehen/build/video_silent.mp4   # dann mit ffmpeg zusammenführen
