# Ängstlich + Vermeidend beim ersten Date (deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 13,6 s, Hochformat 1080×1920, keine Musik – nur Soundeffekte.
Restaurant, runder Tisch mit Kerze. Sie (ÄNGSTLICH) träumt schon von Ring, Haus, Kindern, Hund und fragt
„Also … was sind wir jetzt?“ – er (VERMEIDEND) sieht nur noch „AUSGANG“ und flieht durchs Fenster.
Das Paar im Hintergrund (SICHER) verabredet sich ruhig. Titel wird zu „EINE LIEBESGESCHICHTE.“ – er kommt zurück: „…hey.“

    echo '{"duration": 13.6}' > date/build/timeline.json
    node date/render.js --events   # Zeitpunkte für die Effekte
    python3 date/audio.py          # Effekte, -14 LUFS -> build/audio.wav
    node date/render.js            # Video -> date/date.mp4

Schriften aus falle/fonts (Inter, SIL Open Font License).
