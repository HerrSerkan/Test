# Rotanien – Tag 6 „Absturz auf Pluto“ (eigene Folge nach BRIEFING_TAG6.md, Stil wie Tag 5)

Animation mit Sprecher, 31,8 s, 1080×1920, 60 fps. Stand 07.11.2026: 824 Follower, 4.256 Likes → „👥 BEWOHNER: 824“.
Ablauf: Cockpit mit ⛽ 1 % → 0 %, Absturz auf Pluto (helles Herz), Aufprall + 0,4 s Stille („🗳 EURE WAHL“),
OGnanis Tablet „PLUTO = ZWERGPLANET ❌“, −230 °C + Noams iPhone „KEIN EMPFANG“, Schatten mit zwei Augen,
Rehook: das Pluto-Wesen (Alex' Alien-Freund) – alle verstecken sich hinter der Rakete, nur Delon nicht (Laserpistole lädt),
Wendung: das Wesen schnuppert und will Tims Döner, Dönerhütte „🥙 DÖNER · CHEF: TIM“, Janic mit Schärpe „PRÄSIDENT“,
Schild „🍎 APPLE STORE (BALD)“ (Mehmet), CTA: Fahne „ROTANIEN 2.0“, Zähler, „1 FOLLOW = 1 BEWOHNER“,
OGnanis Lichtantrieb („Damit können wir weiterfliegen“), „Die wichtigste Frage: Bleiben oder weiterfliegen?“ – Splitscreen
„🥙 BLEIBEN / auf Pluto“ vs. „🚀 WEITER / besserer Planet“ (wird beim Sprechen hervorgehoben), dann **TikTok-Umfrage** „Bleiben oder weiterfliegen? 🪐“
(„🥙 Auf Pluto bleiben“ / „🚀 Besseren Planeten suchen“, Mehrheit entscheidet Tag 7), Loop: „⚠ ÜBERHITZT“ + roter Blitz.
Easter Eggs: Elias (Pizza auf dem Helm), keanu (riesiger blauer Astronaut im Hintergrund), Taylor_ (Motorrad), Phillip (orange Katze),
TickTock Notification (Brille + Rolex), Lolel (Lambo-Aufkleber auf der Rakete).
Sichere Zone: Text nur links der rechten 15 %, nicht in den unteren 20 % und nicht in den oberen 10 %.

Aufbau: base.js + helpers3.js + lib4.js + lib5.js + tag6.js -> scene.js

    cat mars6/base.js mars6/helpers3.js mars6/lib4.js mars6/lib5.js mars6/tag6.js > mars6/scene.js
    # Stimme: ElevenLabs „Liam“, Text in script.txt -> build/voice_raw.mp3
    python3 mars6/voice_prep.py mars6/build/voice_raw.mp3 mars6/build/voice.wav 1.2 0.3
    # Schluss ab „Damit können wir weiterfliegen“ separat erzeugt (previous_text) und angehängt; Pausen eingefügt (Aufprall 0,6 s, vor „Und wir sind nicht allein“, vor der Wendung, „Es will … einen Döner“, vor CTA und Entscheidung)
    python3 mars6/words.py   # danach Whisper-Halluzination am Ende abschneiden (89 Wörter)
    python3 mars6/make_lines.py
    node tools/canvas_render.js mars6 --events
    python3 mars6/audio.py   # Musik in build/music_cand/ (Link auf mars5/build/music_cand)
    python3 tools/mix_music.py mars6/build/audio.wav mars6/build/music.wav mars6/build/mix.wav -21 -15 0
    node tools/canvas_render.js mars6 --out mars6/rotanien_tag6.mp4 --audio mars6/build/mix.wav --fps 60

Musik (alle Kevin MacLeod, incompetech.com, CC BY 4.0 – Nennung in der Beschreibung):
„Volatile Reaction“ (Alarm), Stille, „Ossuary 6 – Air“ (unheimlich), „Fluffing a Duck“ (Wendung), „Hitman“ (Entscheidung).
