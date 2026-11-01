# Gleiche Kälte. Andere Hose. (eigenes Video im Stil von fruehaufsteher/ + mensa/)

Eigene Idee (Herbst/Halloween), Aufbau nach dem Skill kurzvideo-regeln. Ohne Sprecher, 13,3 s, 1080×1920, 60 fps, Musik + Effekte.
Bushaltestelle im Herbst, Kürbis auf der Bank. Die Temperatur fällt von 16 °C auf –1 °C.
SCHON WINTERJACKE friert schon bei 16 °C, ZWIEBELLOOK zieht mit jedem Grad eine Schicht mehr an, „???“ steht im T-Shirt.
Hook „JEDER KENNT DIESEN EINEN.“, Rehook „WARTE BIS MINUS 1 GRAD …“. Bei –1 °C fällt Schnee: „???“ = „IMMER KURZE HOSE“.
Titel „GLEICHE KÄLTE. / ANDERE HOSE.“, Sticker „WER BIST DU?“, Schleife.

    node tools/canvas_render.js kaelte --events
    python3 kaelte/audio.py
    python3 tools/synth_music.py kaelte/build/music.wav 34 98 cool 7       # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py kaelte/build/audio.wav kaelte/build/music.wav kaelte/build/mix.wav -17.5 -16 auto:9.0
    node tools/canvas_render.js kaelte --out kaelte/gleiche_kaelte.mp4 --audio kaelte/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
