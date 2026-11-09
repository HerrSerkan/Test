# Rotanien – Tag 5 „Rotanien zerstört“ (1:1 nach dem Mond-Video „Tag 5“, angepasst auf Gedacht @einfach..wissen)

Animation mit Sprecher, 58,2 s, Hochformat 1080×1920. Stand 06.11.2026: 822 Follower, 4.202 Likes → „über 800 Astronauten“.
Ablauf wie im Original (alle Sätze und Szenen in derselben Reihenfolge):
Hook „TAG 5 / ROTANIEN 💥 ZERSTÖRT“ (Kolonie brennt), Zurückspulen „⏪ HEUTE NACHT“, Creator-Umfrage „Hält unser Schild? 🛡️“ 87 % / 13 %
(Zahl wie im Original, vom Nutzer so gewünscht), Schild hält die ganze Nacht, Feier („GEWONNEN?“), „04:00 UHR“, Mutterschiff,
Stille, ein Schuss (Schild 100 → 51 → 0 %), Kuppel zerspringt, Montage: Raketenwerft · Funkturm · Wachtürme · Dönerladen · Häuser je „Weg!“,
über 800 Astronauten rennen, letzte Rakete / nicht genug Platz, Luke (3-2-1), Start, Schildzentrale explodiert, der Mars bricht auseinander,
„4 TAGE. / 1 MINUTE.“, Reihe der Überlebenden, Treibstoff 9 % / verfolgt, „Neuer Planet gesucht“, „Wo landen wir?“ + eigener Kommentar.
Alle Astronauten rennen in die letzte Rakete – nach dem Start steht niemand mehr auf dem Mars (Wunsch des Nutzers).
Ende: Treibstoff 8 %, Alien-Schiff füllt das Bild, roter Blitz → passt auf den roten Blitz in Frame 1 (Loop).

Easter Eggs / Fans (ohne Kommentarkarten):
- Schlachtplan von Jakob (Kommentar unter Tag 4): Schwertkämpfer vorne, Bogenschützen dahinter („🏹 JAKOBS PLAN“)
- jeno: Laserschwert + Döner bei der Feier
- Dönerladen-Schild „SAFUAN“ (kazeyaha), Dönerspieß fliegt durchs Bild, Gesetzestafel („Keine Schule“, „Keine Steuern“) fliegt durchs Bild
- Jimmbos Burek-Launcher feuert ein letztes Mal
- In die Rakete gezogen (mit Namensschild): elster (pinker Anzug + Hundeohren), Gabriel (Laserschwert), Bz_Full (Huhn), herobrine (Rucksack),
  Jakob (Stein-Freund), Jimmbo (Burek-Launcher); Sticker „💬 KOMMENTIER = DU FLIEGST MIT“

Aufbau: base.js + helpers3.js + lib4.js + lib5.js + tag5.js -> scene.js

    cat mars5/base.js mars5/helpers3.js mars5/lib4.js mars5/lib5.js mars5/tag5.js > mars5/scene.js
    # Stimme: ElevenLabs „Liam“ (eleven_multilingual_v2), Text in script.txt -> build/voice_raw.mp3
    python3 mars5/voice_prep.py mars5/build/voice_raw.mp3 mars5/build/voice.wav 1.2 0.3
    # danach Pausen eingefügt: 1,0 s vor „Ein einziger Schuss“, 0,6 s vor „Vier Tage“, 0,25 s nach „Uns“
    python3 mars5/words.py && python3 mars5/make_lines.py
    node tools/canvas_render.js mars5 --events
    python3 mars5/audio.py          # Musik-Dateien in build/music_cand/ (incompetech.com)
    python3 tools/mix_music.py mars5/build/audio.wav mars5/build/music.wav mars5/build/mix.wav -21 -15 0
    node tools/canvas_render.js mars5 --out mars5/rotanien_tag5.mp4 --audio mars5/build/mix.wav

Musik (alle Kevin MacLeod, incompetech.com, CC BY 4.0 – Nennung in der Videobeschreibung nötig):
„Heroic Age“ (Aufbau bis zur Stille), 1 s komplette Stille vor dem Schuss, „Volatile Reaction“ (Chaos, ab 28 s),
„Lightless Dawn“ (leises Klavier bei „4 Tage“, ab 2 s), „Hitman“ (Spannung am Ende, ab 12 s).
Schriften: Luckiest Guy (Apache 2.0), Inter (SIL OFL); Emoji: Noto Color Emoji.
