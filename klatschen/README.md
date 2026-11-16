# Wenn du klatschst, weil das Flugzeug landet (deutsche Version, eigene Zeichnung)

Idee: @nkzwf1. Animation ohne Sprecher, 18,2 s, 1080×1920, 60 fps, Musik + Effekte.
Drei Sitze im Flieger: Nachbar, DU, Oma mit Dutt und Brille. Oben die Anzeige „PEINLICHKEIT“ (45 % … 150 %).
DU klatscht – „…irgendwer?“ – „*reibt Hände* Ziemlich kalt hier.“ – „Schätzchen … wir fliegen noch.“ – Durchsagen
„Das war nur eine Turbulenz.“ und „Noch 20 Minuten.“ – „*setzt sich auf die Hände*“ – „20 MIN SPÄTER“ – „… nur zu.“ –
„*ein winziger Klatscher*“ – „Bravo, Schätzchen.“ Die Vorderreihe dreht sich zweimal um.

    node tools/canvas_render.js klatschen --events
    python3 klatschen/audio.py
    python3 tools/synth_music.py klatschen/build/music.wav 40 100 verspielt 31    # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py klatschen/build/audio.wav klatschen/build/music.wav klatschen/build/mix.wav -16.5 -13.5 0
    node tools/canvas_render.js klatschen --out klatschen/klatschen.mp4 --audio klatschen/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
