# Wie viele Stunden noch? (eigene Geschichte, eigene Zeichnung)

Grundidee inspiriert von @kopfkino.du (Zahl über jedem Kopf), Geschichte, Personen und Sprechertext neu geschrieben.
Animation mit Sprecherstimme (Edge TTS, de-DE-ConradNeural), 84,8 s, 1080×1920, Musik + Effekte.
Stil: Figuren-Rig mit Gelenken, Kleidung, Blinzeln und Atmen (auch als tools/figur_rig.js), Szenenwechsel als Kameraschwenk.
Über jedem Kopf steht, wie viele Stunden ihr noch zusammen habt: Kollegin 3.400, der pfeifende Typ im Aufzug 90,
der weggedrückte Bruder 260, die beste Freundin in Hamburg 140, Opa mit seiner Fahrradwerkstatt nur 23.
Im Zug wird aus „einmal im Jahr eine Stunde“ ein einziges Wochenende. Am Samstag flickst du mit Opa einen Reifen,
der gar nicht platt war – und seine Zahl steigt auf 31. Plus 4, plus 12 … und vor der Werkstatt stehen zwei Fahrräder.

    python3 opa/script.py               # Stimme (Edge TTS, über den Proxy) + Zeitplan -> build/
    node opa/render.js --events
    python3 opa/audio.py                # Stimme + Effekte -> build/audio.wav
    python3 tools/synth_music.py opa/build/music.wav 100 84 cool 61          # leise Musik (Ersatz, solange ElevenLabs fehlt)
    python3 tools/mix_music.py opa/build/audio.wav opa/build/music.wav opa/build/mix.wav -22 -14.5 0
    cp opa/build/mix.wav opa/build/audio_final.wav
    node opa/render.js                  # Video -> opa/wie_viele_stunden.mp4

Schriften aus falle/fonts und mensa/fonts (Inter, Instrument Serif, SIL Open Font License).
