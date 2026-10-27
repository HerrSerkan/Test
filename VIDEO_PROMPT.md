# Prompt: TikTok-Video auf Deutsch nachbauen

Video(s) hochladen und diesen Text dazuschreiben:

```
Ich lade dir ein oder mehrere TikTok-Videos hoch. Bau jedes davon als deutsche Version nach – so nah wie möglich am Original.

Vorgehen pro Video:
1. Analysiere das Video genau: Einzelbilder (mind. 1 pro Sekunde) und Ton. Transkribiere die Sprache mit Wort-Zeitstempeln (faster-whisper).
2. Übernimm Ablauf, Szenen, Kamerafahrten, Timing, Farben, Schriftstil und Text-Animationen. Zeichne Figuren und Grafiken selbst nach (kein Abfilmen, keine Original-Bilder).
3. Sprechertext: Schreib ihn auf Deutsch Satz für Satz wie im Original, aber in eigenen Worten (keine wörtliche Übersetzung). Ungefähr gleiche Länge.
4. Stimme: ElevenLabs, Stimme „Thomas – Confidential & calm“ (voice_id CU0jw02q6zyti7Fzfgx5), Modell eleven_v4, ganzer Text am Stück. Danach lange Pausen auf ca. 0,6 s kürzen, Tempo bei Bedarf leicht anheben, etwas mehr Bass und Kompression (wie falle/voice_prep.py). Wortzeiten per Whisper bestimmen.
5. Text erscheint Wort für Wort genau zur Stimme. Er steht UNTER der Szene, im sicheren Bereich: nicht oben bei den TikTok-Tabs, nicht rechts bei den Buttons, nicht unten bei der Beschreibung.
6. Ton: WICHTIG – passende Hintergrundmusik (instrumental, ohne Gesang, mit ElevenLabs Music erzeugt), damit das Video nicht still wirkt. Musik leiser als Stimme und Effekte, beim Sprechen abgesenkt. Dazu passende Soundeffekte. Lautstärke gesamt auf -14 LUFS.
7. Format: 1080x1920, 30 fps, MP4, möglichst unter 60 MB.
8. Kein Logo, kein Account-Name und kein Outro des Originals.

Nutze als Vorlage den Code im Repo HerrSerkan/Test, Ordner falle/ (script.py, scene.js, render.js, audio.py, voice_prep.py).

Prüfe vor dem fertigen Rendern Standbilder auf Überlappungen und Lesbarkeit. Schick mir jedes fertige Video direkt hier im Chat, zusammen mit einer Beschreibung + Hashtags zum Kopieren und dem Account des Originals für ein „Idee: @…“. Speichere den Code im Repo und pushe ihn. Bei mehreren Videos: eins nach dem anderen fertig machen und jeweils sofort schicken.
```
