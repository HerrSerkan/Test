# Prompts: eigene „Typen“-Videos (Stil Frühaufsteher / Gleicher Tisch)

Zwei Schritte:
1. **Ideen-Prompt** in einen normalen Chat (Claude, ChatGPT …) kopieren → du bekommst fertige Video-Ideen im festen Format.
2. **Video-Prompt** hier in Claude Code kopieren, unten eine der Ideen einfügen → du bekommst das fertige Video.

Vorlagen im Repo: `fruehaufsteher/` (Haus mit Fenstern, Uhr läuft) und `mensa/` (Szene mit Sprechblasen, Pointe als Titel).

---

## 1. Ideen-Prompt (für einen normalen Chat)

```
Du bist Ideen-Entwickler für einen deutschen TikTok-Kanal mit kurzen Animationsvideos ohne Sprecher (12–15 Sekunden, nur Musik + Soundeffekte).

So funktionieren die Videos:
- Ein fester Ort, frontal gezeigt wie ein Puppenhaus oder eine Bühne (z. B. Haus mit 3 Fenstern, Mensa-Tisch, Klassenzimmer, Bus, WG-Küche, Büro, Wartezimmer).
- 2 oder 3 Figuren mit Namensschild = „Typen“, die jeder kennt (z. B. FRÜHAUFSTEHER / NACHTEULE / ???). Ein Typ ist oft „???“ und wird erst am Höhepunkt enthüllt.
- Es gibt einen sichtbaren Zähler, der immer schneller läuft (Uhrzeit, Tage, Akku-Prozent, Nachrichten-Zähler, Kontostand …) – oder kurze Sprech- und Gedankenblasen, die sich stapeln.
- Alles passiert ohne Worte über Handlungen: Licht an/aus, Vorhang auf/zu, Handy, Kaffee, Party, Wegdrehen, Stolpern.
- Höhepunkt nach ca. 10 Sekunden: Zähler wird rot, Kamera ruckelt, das „???“-Schild wird enthüllt ODER ein zweizeiliger Titel erscheint („GLEICHER TISCH. / ANDERER GRUND.“ – das letzte Wort farbig).
- Ende springt nahtlos zum Anfang zurück (Endlosschleife).

Deine Aufgabe: Gib mir [ANZAHL, z. B. 5] neue Video-Ideen. Themen: [OPTIONAL: Bereich, z. B. Schule, Beziehung, Arbeit, Geld, Freundschaft, Social Media – oder leer lassen].

Anforderungen an jede Idee:
- Sofort wiedererkennbar: Jeder Zuschauer muss in 1 Sekunde denken „Das bin ich“ oder „Das ist mein Freund“.
- Starker Aha- oder Lach-Moment am Höhepunkt, kurze Pointe (max. 5 Wörter pro Zeile).
- Löst Kommentare aus: Die Leute sollen schreiben, welcher Typ sie sind, oder jemanden markieren.
- Nicht verletzend, keine echten Personen oder Marken.
- Alle Texte auf Deutsch, kurz, Großbuchstaben bei Schildern und Titel.

Gib jede Idee GENAU in diesem Format aus (damit ich sie direkt weiterkopieren kann):

=== VIDEO-IDEE ===
TITEL (Arbeitsname):
ORT:
FIGUREN (Schild – Farbe – Charakter in einem Satz):
ZÄHLER / TAKT (was läuft hoch und wie schnell):
ABLAUF (Sekunde für Sekunde, 0–14 s, je Zeile ein Moment):
SPRECH-/GEDANKENBLASEN (wer, wann, genauer Text):
HÖHEPUNKT (was passiert genau, welches Schild/Titel erscheint):
TITEL AM ENDE (2 Zeilen, Wort in Farbe markieren):
SCHLEIFE (wie es zum Anfang zurückspringt):
MUSIK (Stimmung, Instrumente):
SOUNDEFFEKTE:
BESCHREIBUNG FÜR TIKTOK (1–2 Sätze mit Frage an die Zuschauer):
HASHTAGS (8 Stück):
=== ENDE ===

Bewerte am Schluss jede Idee mit 1–10 für „Viral-Potenzial“ und sag in einem Satz, warum.
```

---

## 2. Video-Prompt (hier in Claude Code)

```
Erstelle ein neues deutsches Animationsvideo im Stil von fruehaufsteher/ und mensa/ im Repo HerrSerkan/Test. Nutze diese beiden Ordner als Code-Vorlage (scene.js, scene.html, audio.py, README.md) sowie tools/canvas_render.js und tools/mix_music.py.

Die Video-Idee steht ganz unten. Setz sie genau so um; wenn etwas fehlt oder nicht passt, entscheide selbst im Sinne der Idee.

AUFBAU (wie bei den Vorlagen, bitte beibehalten):
- 12–15 Sekunden, kein Sprecher, schneller Schnitt: jede 0,3–0,6 s passiert etwas (Zähler springt, Licht, Blase, Bewegung, Gesichtsausdruck).
- Ein fester Ort, frontal wie eine Bühne, gezeichnet im Raster 576×1024 und auf 1080×1920 hochskaliert.
- Figuren mit dunklen, abgerundeten Namensschildern (Pillen) in Großbuchstaben, gesperrt.
- Zähler (Uhr, Tage, Prozent …) groß und fett über der Szene, läuft immer schneller; kurz vor dem Höhepunkt Minute für Minute bzw. Schritt für Schritt langsamer (Spannung), dann springt er auf den Höhepunkt.
- Sprechblasen hell mit dunkler Schrift und Spitze, Gedankenblasen als Wolke mit Pünktchen; sie ploppen federnd auf und zerplatzen als Wölkchen.
- Höhepunkt: Zähler oder Wort wird rot und „ploppt“, Kamera zoomt leicht ran und ruckelt kurz, „???“-Schild wird enthüllt ODER zweizeiliger Titel in fetten Großbuchstaben (Inter Black) erscheint oben im dunklen Bereich, letztes Wort orange.
- Ende: nahtlose Schleife zurück zum ersten Bild.

EIGENER STIL (etwas anders als die Originale, damit es unverwechselbar ist):
- Figuren: Bohnen-/Ei-Körper mit rundem Kopf wie in den Vorlagen, aber jede Figur hat eine eigene kräftige Akzentfarbe (Pastell mit etwas mehr Sättigung) und ein kleines Erkennungsmerkmal (z. B. Mütze, Brille, Kopfhörer, Schal), das zum Typ passt.
- Leichte Papier-Körnung über dem ganzen Bild (sehr dezent) und weiche Schatten unter Figuren und Möbeln.
- Ganz am Ende 0,8 s ein kleiner runder Sticker unten in der Szene mit der Frage aus der Beschreibung (z. B. „WELCHER BIST DU?“), der aufploppt und vor der Schleife wieder verschwindet.
- Gleiche Schriften wie in den Vorlagen (Inter Bold/Black).

SICHERER BEREICH:
- Nichts Wichtiges oben bei den TikTok-Tabs (obere ~250 px), rechts bei den Buttons oder unten bei der Beschreibung (untere ~350 px). Zähler und Titel liegen unter den Tabs, Szene in der Mitte.

TON:
- WICHTIG: passende Hintergrundmusik, instrumental ohne Gesang, mit ElevenLabs Music (eleven_music_v2_5, 1 Variante) erzeugen, Stimmung laut Idee, kräftiger Groove ab der ersten Sekunde. Mit tools/mix_music.py mischen (Ausschnitt mit auto:<Höhepunkt-Sekunde>).
- Soundeffekte genau zu den Ereignissen (über exportEvents in scene.js): Ticken beim Zähler, Plopp bei Blasen, Puff beim Zerplatzen, Klicks bei Licht, Wisch bei Vorhang/Bewegung, Schritte, dumpfer Schlag am Höhepunkt, Glöckchen bei schönen Momenten. Effekte gut hörbar über der Musik. Gesamt -14 LUFS.

FORMAT: 1080×1920, 30 fps, MP4, unter 60 MB.

Ablauf für dich:
1. Erst Standbilder an 6–8 Stellen rendern und auf Überlappungen, Lesbarkeit und sicheren Bereich prüfen, dann korrigieren.
2. Dann Ton erzeugen, mischen und das Video rendern, Kontaktbogen (2 Bilder/s) prüfen.
3. Code in einem neuen Ordner im Repo speichern (mit README.md wie in den Vorlagen), committen und pushen.
4. Schick mir das Video hier im Chat, dazu Beschreibung + Hashtags zum Kopieren.

=== HIER DIE VIDEO-IDEE EINFÜGEN ===

```
