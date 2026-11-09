# Rotanien – Tag 2 (Fortsetzung von mars/, 1:1 nach dem Mond-Video „Tag 2“, angepasst auf @einfach..wissen)

Animation mit Sprecher, 37,6 s, Hochformat 1080×1920. Gleicher Ablauf wie das Original, mit den echten Zahlen des Kanals:
18 neue Astronauten (Einwohner 19), drei Raketen statt Flotte, Top-Kommentar von •°Romy☆ („Es gibt keine schule“) wird Gesetz Nr. 1,
die Schule wird gebaut und ins All geschossen, Astronaut Nr. 7 bekommt einen Hut, Nr. 12 eine pinke Handtasche (Platzhalter-Wünsche),
Fahne weg, Pfotenspuren zum Krater mit leuchtenden Augen, OG-Bordkarte Rakete 2, Gesetz Nr. 2 = nächster Top-Kommentar.

Aufbau: base.js (gemeinsame Teile aus mars/scene.js) + tag2.js (Ablauf Tag 2) -> scene.js

    cat mars2/base.js mars2/tag2.js > mars2/scene.js
    python3 mars2/voice_prep.py mars2/build/voice_raw.mp3 mars2/build/voice.wav 1.1 0.36
    python3 mars2/words.py && python3 mars2/make_lines.py
    node tools/canvas_render.js mars2 --events
    python3 mars2/audio.py
    python3 tools/mix_music.py mars2/build/audio.wav mars2/build/music.wav mars2/build/mix.wav -22 -15 0
    node tools/canvas_render.js mars2 --out mars2/rotanien_tag2.mp4 --audio mars2/build/mix.wav

Stimme: vidIQ (Stimme „Liam“), Musik: dieselbe wie Tag 1 (build/music.wav, nicht im Repo). romy.png: Profilbild aus dem Kommentar-Screenshot.
Schriften: Luckiest Guy (Apache 2.0), Inter (SIL OFL); Emoji: Noto Color Emoji.
