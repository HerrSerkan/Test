# Rotanien – Übergabe für neue Chats (Serie „Tag X auf dem Mars“)

Kanal: **Gedacht**, TikTok **@einfach..wissen** (zwei Punkte). Profilbild: `mars4/me.png`.
Jede Folge ist ein 1:1-Nachbau eines Mond-Videos („Orbitanien“, Account @jno.028), aber auf dem **Mars**, Land heißt **Rotanien**,
alle creatorbezogenen Stellen (Zahlen, Kommentare, Namen, Umfragen) sind auf diesen Kanal angepasst.

## Stand nach Tag 6 (07.11.2026)
| Tag | Ordner | Follower | Einwohner | Neu | Likes | Gesetz / Thema |
|---|---|---|---|---|---|---|
| 1 | `mars/`  | 0   | 1   | –    | 0     | Land gegründet, Top-Kommentar = Gesetz |
| 2 | `mars2/` | 18  | 19  | +18  | (214 geschätzt) | Gesetz 1 „Keine Schule“ (•°Romy☆), Fahne weg, Augen im Krater |
| 3 | `mars3/` | 629 | 630 | +611 | 3.858 | Gesetz 2 „Keine Steuern“ (Luca), Dönerladen, Alien-Ultimatum, Fahne von Aliens geklaut, Flotte „hinter dem Mond“ (nicht Phobos!), Umfrage Abhauen/Kämpfen |
| 4 | `mars4/` | 788 | 789 | +159 | 4.104 | Umfrage 96 % Kämpfen (127 Stimmen), Ausbau (Werft, Wachtürme, Funkturm, Schildzentrale), Schild, Alien-Angriff, „Letzte Chance. Gebt auf.“ – „Niemals!“, Ende: Top-Kommentar = **Schlachtplan** |
| 5 | `mars5/` | 822 | (über 800) | +34 | 4.202 | **Rotanien zerstört**: Umfrage „Hält unser Schild?“ 87 % (Zahl wie im Original), Mutterschiff, ein Schuss, alles weg, nur eine Rakete, der Mars zerbricht, Flucht ins All (Treibstoff 9 % → 8 %), Ende: „Wo landen wir?“ = Top-Kommentar/neuer Planet |
| 6 | `mars6/` | 824 | 824 | +2 | 4.256 | **Absturz auf Pluto** (eigene Folge, 31,8 s, 60 fps): 0 % Treibstoff, Pluto = Zwergplanet, Pluto-Wesen will Döner, Tim Dönermann, Rotanien 2.0, **Umfrage** „Bleiben oder weiterfliegen?“ (🥙 auf Pluto bleiben / 🚀 besseren Planeten suchen, Mehrheit entscheidet Tag 7!) |

Bereits erfüllte Wünsche (mit Namen gezeigt): Gabriel Emilijan Laserschwert, elster pinker Anzug + Hundeohren,
Entenlover/Nr. 410 Enten-Freund (Tag 3); Jakob Stein-Freund, Bz_Full Huhn auf dem Kopf, herobrine Minecraft-Rucksack (Tag 4).
Easter Eggs in Tag 4 (versteckt, ohne Namen, KEIN Hinweis „Hast du dein Easter Egg gefunden?“): Fußballschuhe (Michel), Lambo (Lolel),
Dino-Hut, Döner-Helm (sofia_cat), Katze (akirus), Hund (Amelie), Melone, Schleife, Cola (c_dirt), Gamer-Headset/Controller (Fire.Nico).
Tag 5 (ohne Kommentarkarten, nur sichtbar im Bild): Jakobs Schlachtplan (Schwerter + Bogenschützen), jeno Laserschwert + Döner,
Dönerladen „SAFUAN“ (kazeyaha), Jimmbos Burek-Launcher, Fans in der Rakete: elster, Gabriel, Bz_Full, herobrine, Jakob, Jimmbo.
Nach Tag 5 ist der Mars zerstört. Tag 6: Absturz auf Pluto. Erfüllt in Tag 6: Tim_16 Dönermann, Delon Laserpistole, Janic Präsident, Mehmet „Apple Store (bald)“,
Noam iPhone (kein Empfang), OGnani Lichtantrieb + Tablet „Zwergplanet“, Elias Pizza-Helm, keanu blauer Riese, Taylor_ Motorrad, Phillip orange Katze,
Alex Alien-Freund (das Wesen), Lolel Lambo-Aufkleber, TickTock Rolex + Brille.
**Tag 7 muss die Umfrage aus Tag 6 umsetzen** (🥙 auf Pluto bleiben oder 🚀 mit OGnanis Lichtantrieb einen besseren Planeten suchen) – Ergebnis-Screenshot vom Nutzer holen.
- Nutzer wünscht Umfragen (TikTok-Umfrage) statt „Kommentier X oder Y“, und die Frage soll sich aus der Geschichte ergeben (nicht „random“).
Noch offen aus den Kommentaren: Leonard „Goyo“-Astronaut, Balerz09 Brille + Barça-Trikot, Döner-Preis 2 € / 3 € (Globi, fan_emilia1), Laserkanone.

## Ablauf, den der Nutzer erwartet
1. Original-Video analysieren (Kontaktbogen, faster-whisper mit Wortzeiten, Musik mit librosa: Tempo/Tonart/Wechselstellen).
2. **Zuerst fragen, welche Screenshots nötig sind** (aktuelles Profil, Umfrage-Ergebnis, Top-Kommentar, Wunsch-Kommentare mit Namen+Bild),
   erst danach bauen. Unklare Anpassungen kurz mit AskUserQuestion klären.
3. Neuen Ordner `mars7/` usw. anlegen; Vorlage ist der Vorgänger-Ordner (`base.js` + `helpers3.js` + `lib4.js` + `lib5.js` + `tagN.js` → `scene.js`).
4. Standbilder prüfen (Überlappungen, Lesbarkeit, sicherer Bereich), dann Ton, Mix, Render, Kontaktbogen prüfen, committen, pushen,
   Video mit SendUserFile schicken + Beschreibung/Hashtags zum Kopieren (+ Musik-Nennung, falls CC BY).

## Stil-Regeln (vom Nutzer gewünscht)
- Optik wie Tag 4: Comic-Umrisse (compositeOutline), Schrift Luckiest Guy (`fonts/LuckiestGuy-Regular.ttf`, Familie „Comic“) für Titel/Untertitel,
  Inter für Karten, nahe Kamera, große Erde am Himmel, Felsbrocken, Staub, Vignette.
- **Schnell und effektreich**: Blitz bei Kamera-Schnitten, Kamera-Stöße bei großen Momenten, Funkeln bei erfüllten Wünschen, Konfetti,
  Glitch beim Alien-TV, passende Soundeffekte zu jedem Ereignis.
- **Profilkarte lang genug** einblenden (~2,5–3 s), echte Zahlen, Profilbild `me.png`, Stempel „+N NEUE“, Name „Gedacht“.
- Kommentare im dunklen TikTok-Stil (`tkComment` in `helpers3.js`, Karte wächst mit dem Text) mit echtem Profilbild aus dem Screenshot.
- Untertitel Wort für Wort, Schlüsselwörter türkis (*) oder rot (!) – Blöcke in `make_lines.py` (Wortanzahl muss zu `build/words.json` passen).
- Alien-Funk: verzerrte Stimme (Ringmodulation in `audio.py`) + grüne Untertitel-Box.
- Lautheit gesamt −14 LUFS (tools/mix_music.py), 1080×1920, 30 fps, < 60 MB.

## Ton
- **Stimme: ElevenLabs „Liam“** (voice_id `TX3LPaxmHKxFdv7VOQHJ`, Modell `eleven_multilingual_v2`, language_code `de`,
  stability 0.45, similarity 0.8, style 0.25). Der API-Schlüssel ist als Network-Secret der Umgebung „Standard“ für `api.elevenlabs.io`
  hinterlegt (Header `xi-api-key`, im Code Platzhalter `proxy-injected`). Kostenloser Plan: 10.000 Zeichen/Monat.
  Danach `voice_prep.py <raw> <wav> 1.2 0.3` (Pausen kürzen, Tempo), `words.py` für Wortzeiten.
  Zahlen im Skript ausschreiben (z. B. „hundertneunundfünfzig“). Für einzelne Satz-Korrekturen: nur den Satz neu erzeugen und mit `mars3/splice.py` einsetzen.
- vidIQ-Credits fast leer (Reset 16.11.2026), ElevenLabs-MCP nicht verbunden.
- Musik wie im Original nachempfinden: Tag-Teil = `mars4/build/music_day117.wav` (aus Tag 1 abgeleitet, ~117 BPM, C-Dur; nicht im Repo,
  neu erzeugen siehe `mars3/README.md`), Spannungsteil z. B. `tools/tension_music.py` (129 BPM G-Moll) oder lizenzfreie Musik von
  incompetech.com (Kevin MacLeod, CC BY 4.0 → Nennung in der Beschreibung). Tag 4 nutzte „Heroic Age“ ab Sekunde 44; Tag 5: Heroic Age → Stille → Volatile Reaction → Lightless Dawn → Hitman (siehe `mars5/README.md`).
- Ab Tag 6 (Briefing des Nutzers): ca. 30 s, 60 fps, Text in der sicheren Zone, kein Fantasiename in der ersten Zeile, Umfrage als CTA.
- Länge Tag 5: Nutzer wollte 50–60 s und alle Beats des Originals; das Wichtigste ist, nah am Original zu bleiben.
- `build/` ist nicht im Repo (Musik/Stimme ggf. neu erzeugen bzw. herunterladen).

## Werkzeuge
`tools/canvas_render.js <ordner> --preview t1 t2 … | --events | --out x.mp4 --audio mix.wav`,
`tools/mix_music.py <fx+stimme.wav> <musik.wav> <out.wav> -21 -15 0`, `tools/tension_music.py`, `tools/synth_music.py`.
Benötigt: `pip install faster-whisper scipy librosa` (falls im neuen Container nicht vorhanden).
