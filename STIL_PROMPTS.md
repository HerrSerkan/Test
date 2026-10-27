# Prompts: eigene Videos im Stil der drei Nachbauten

Jeweils das Thema in die eckigen Klammern schreiben und den ganzen Block abschicken.
Vorlagen im Repo: `geld/` (Erklärvideo mit Sprecher), `ausweichen/` (Meme mit Sprechblasen), `perfektionist/` (Vergleich ohne Worte).

---

## 1. Erklärvideo mit Sprecher (Stil „Warum Geld sich bewegt“)

```
Erstelle ein neues deutsches Erklärvideo im Stil von geld/ im Repo HerrSerkan/Test. Nutze geld/ als Code-Vorlage (script.py, scene.js, render.js, audio.py, voice_prep.py).

THEMA: [dein Thema, z. B. „Warum Zinseszins dich langfristig reich macht“]

Grundaufbau (bitte beibehalten):
- 65–80 Sekunden, 15–17 kurze Sätze, „du“-Ansprache, ruhiger, sachlicher Ton.
- Satz 1: Hook mit einer überraschenden These. Dann: der typische Denkfehler der meisten → was wirklich dahintersteckt → 2–4 konkrete Beispiele (eins pro Satz) → eine überraschende Wendung („Und das Spannende daran: …“) → warum das ein Vorteil ist → Schluss: „X heißt nicht …, sondern …“ und ein letzter Satz, der beim Zuschauer endet.
- Schreib den Sprechertext selbst, einfach und klar, ohne Fremdwörter.

Optik:
- Schwarzer Hintergrund, feine weiße Linien mit leichtem Glühen, kleine gesperrte Großbuchstaben-Labels, weiße Pillen-Badges mit schwarzer Schrift, Spielfiguren-Icons, €-Münzen, einfache Icons.
- Pro Satz eine eigene Szene mit einem schlichten Sinnbild (Zähler, Balken, Waage, Kreise, Netz aus Knoten, Eisberg, Gebäude …), das sich genau zu den gesprochenen Schlüsselwörtern aufbaut. Weiche Überblendungen.
- Alles selbst im Canvas zeichnen, keine fremden Bilder, kein Logo, kein Account-Name.

Text:
- Erscheint Wort für Wort genau zur Stimme, UNTER der Szene. Inter halbfett, Schlüsselwörter kursiv (Instrument Serif) oder fett (Inter Black).
- Szene und Text zusammen vertikal mittig: gleich viel Rand oben und unten, Hintergrund ohne Kante. Nichts oben bei den TikTok-Tabs, nichts rechts bei den Buttons, nichts unten bei der Beschreibung.

Ton:
- ElevenLabs, Stimme „Thomas – Confidential & calm“ (voice_id CU0jw02q6zyti7Fzfgx5), Modell eleven_v4, ganzer Text am Stück.
- Mit voice_prep.py Pausen auf 0,6 s kürzen, Tempo leicht anheben (meist 1,10–1,12), etwas mehr Bass und Kompression. Wortzeiten per Whisper (script.py).
- Keine Musik. Nur Stimme + dezente Effekte (Whoosh beim Szenenwechsel, Klicks, Plopps, Münzklimpern, Glöckchen). Lautheit -14 LUFS (EBU-R128-Messung in audio.py).

Format: 1080×1920, 30 fps, MP4, unter 60 MB.

Prüfe vor dem fertigen Rendern Standbilder auf Überlappungen und Lesbarkeit. Speichere den Code in einem neuen Ordner im Repo und pushe ihn. Schick mir das Video hier im Chat, dazu eine Beschreibung + Hashtags zum Kopieren.
```

---

## 2. Meme mit Sprechblasen, ohne Sprecher (Stil „Wenn ihr beide in dieselbe Richtung ausweicht“)

```
Erstelle ein neues deutsches Meme-Video im Stil von ausweichen/ im Repo HerrSerkan/Test. Nutze ausweichen/ als Code-Vorlage (scene.js, render.js, audio.py).

SITUATION: [deine Alltagssituation, z. B. „Wenn du jemandem zurückwinkst, der gar nicht dich gemeint hat“]
BALKEN: [was steigt, z. B. „PEINLICHKEIT“, „STRESS“, „FREMDSCHAM“]

Grundaufbau (bitte beibehalten), ca. 18 Sekunden:
1. Start: „DU“ (lila Figur) steht da, die andere Figur (mintgrau) kommt dazu. Balken bei ca. 15 %.
2. Begegnung: Kamera zoomt rein, beide erschrecken, Balken springt auf ca. 40 %.
3. 3–4 kurze Sprechblasen-Runden hin und her (je 1–2 s), dazwischen passende Bewegungen. Balken steigt bei jeder Runde.
4. Innerer Gedanke von „DU“ in kursiver Blase (z. B. „Ganz ruhig. Einfach …“). Balken bleibt kurz stehen.
5. Beide sagen „…“, dann reden beide gleichzeitig. Höhepunkt: kleiner Zusammenstoß mit Sternchen, Balken 97 % und blinkt.
6. Auflösung: die andere Figur löst es und geht weg, Kamera zoomt raus, Balken fällt auf 5 %, „DU“ denkt erleichtert: „Nie wieder.“
7. Pointe: eine neue Figur (pfirsichfarben) kommt – rosa Blitz, Balken schießt auf 150 % und läuft über, Schlussblase „Jedes. Einzelne. Mal.“ (oder passend zum Thema).

Optik:
- Nacht-Szene mit dunkelblau-lila Himmel, Skyline mit gelben Fenstern, Laternen mit warmem Lichtschein, Gehweg (oder ein anderer Ort, der zur Situation passt, aber in denselben Farben).
- Runde Ei-Figuren mit einfachen Gesichtern (Augen, Mund, Augenbrauen wechseln je nach Gefühl), Namensschild „DU“ unter der eigenen Figur.
- Oben: Batterie-Symbol, Balken-Label, Balken (gelb → orange → rot) und Prozentzahl.
- Titel „WENN …“ in fetten weißen Großbuchstaben UNTER der Szene. Sprechblasen dunkel mit weißer Schrift, Gedanken kursiv.
- Alles vertikal mittig, gleich viel Rand oben und unten, Hintergrund ohne Kante. Nichts oben bei den TikTok-Tabs, nichts rechts bei den Buttons, nichts unten bei der Beschreibung.

Ton: kein Sprecher, keine Musik. Nur Effekte: Schritte, Wisch-Geräusche, Turnschuh-Quietschen, Plopp + kleines Geplapper bei Sprechblasen, Pieptöne beim Balken, „Bonk“ beim Zusammenstoß, dramatischer Schlag beim rosa Blitz. Lautheit -14 LUFS (EBU-R128-Messung in audio.py).

Format: 1080×1920, 30 fps, MP4, unter 60 MB.

Prüfe vor dem fertigen Rendern Standbilder auf Überlappungen und Lesbarkeit. Speichere den Code in einem neuen Ordner im Repo und pushe ihn. Schick mir das Video hier im Chat, dazu eine Beschreibung + Hashtags zum Kopieren.
```

---

## 3. Vergleich zweier Typen ohne Worte (Stil „Perfektionist vs. Macher“)

```
Erstelle ein neues deutsches Vergleichs-Video im Stil von perfektionist/ im Repo HerrSerkan/Test. Nutze perfektionist/ als Code-Vorlage (scene.js, render.js, audio.py).

THEMA: [zwei gegensätzliche Typen, z. B. „DER GRÜBLER vs. DER AUSPROBIERER“ oder „DER SPARER vs. DER INVESTOR“]
TÄTIGKEIT: [woran beide arbeiten, z. B. „Mauer bauen“, „Treppe bauen“, „Berg besteigen“, „Turm stapeln“]

Grundaufbau (bitte beibehalten), ca. 14 Sekunden:
1. Links Typ A, rechts Typ B, beide fangen gleichzeitig mit derselben Tätigkeit an. Über jedem ein kleines Label in gesperrten weißen Großbuchstaben.
2. Typ A bleibt in seiner Gewohnheit hängen (prüft, zögert, plant …) und kommt kaum voran. Dafür ein Werkzeug in Neongrün (wie die Wasserwaage).
3. Typ B arbeitet einfach durch, sein Ergebnis wächst schnell (Zeitraffer).
4. Typ B wird fertig: sein Ergebnis leuchtet grün auf (mit Glöckchen-Effekt).
5. Typ B setzt sich drauf, wartet, wird ungeduldig, steht auf und springt weiter zum nächsten Ziel aus dem Bild.
6. Typ A schaut kurz auf, macht dann aber weiter wie vorher. Abblenden.

Optik:
- Schwarzer Hintergrund mit weichem Licht auf dem Boden und Spiegelung im glänzenden Boden.
- Weiße Gliederpuppen-Figuren (dünne Konturen, ferne Arme/Beine grau), hellgraue Bausteine, ein einziger Akzent in Neongrün.
- Nur die zwei Labels als Text, kein Sprecher.
- Alles vertikal mittig, gleich viel Rand oben und unten, Hintergrund ohne Kante. Nichts oben bei den TikTok-Tabs, nichts rechts bei den Buttons, nichts unten bei der Beschreibung.

Ton: keine Musik, kein Sprecher. Nur Effekte: Klacken beim Bauen, kleine Klicks beim Zögern/Prüfen, Rascheln bei Bewegungen, Glöckchen beim grünen Aufleuchten, Whoosh beim Sprung, dumpfe Landung außerhalb des Bildes. Lautheit -14 LUFS (EBU-R128-Messung in audio.py).

Format: 1080×1920, 30 fps, MP4, unter 60 MB.

Prüfe vor dem fertigen Rendern Standbilder auf Überlappungen und Lesbarkeit. Speichere den Code in einem neuen Ordner im Repo und pushe ihn. Schick mir das Video hier im Chat, dazu eine Beschreibung + Hashtags zum Kopieren.
```
