# Rotanien – Tag 12: „1 von 100 Truhen“ (Token-Jagd)

Animation mit Sprecher (ElevenLabs „Chris“, neuer Account), 29,5 s, 1080×1920, 60 fps, −14 LUFS. Stand 14.11.2026: 835 Follower, 4.474 Likes (= „Taler“).
Vorgabe: `BRIEFING_TAG12.md` (Trend #token/#piratetoken, Frame 1 = Situation, kein Follow-Aufruf am Anfang, Schnitt alle 0,9–1,4 s).

## Ablauf (alles auf dem 130-BPM-Raster, `bt(n)` = Beat n)
0,0 s Himmel reißt auf, Piratenschiff (die gelben Augen aus Tag 11 = Bugfenster) kippt Truhen auf Rotanien, „1 von 100 Truhen hat den Token“ ab Frame 1
→ 1,5 s Alien-Piratenkapitän hält den Rotanien-Token hoch („Wer ihn findet, kriegt alles gratis!“)
→ Truhe 1: Socke → 14: Bank (berat_bulut) → 23: Flughafen + Flugzeug „PILOT: NOAM“ → 31: Klamottenladen „NEW ROTANIER“ (sami&zoe, kein echter Markenname)
→ 46: Bunker gräbt sich ein (Minimaus) → 58: leere Soldatenhelme, einfachso + Schild „SOLDATEN GESUCHT 0/10“
→ 10,6 s Speed-Montage 60 → 99 (Nieten je halber Beat) → 12,5 s Truhe 100: Musik bricht ab, Herzschlag, Monster + Kapitän + Astronauten im Kreis
→ 15,2 s Deckel fliegt, goldener Blitz („… und drin ist …“), 16,15 s Schnitt auf Schwarz/Stille → 16,6 s Bordkarte Rakete 4
→ 19,4 s Aufruf „Was ist in Truhe 100?“ + leere Kommentarkarte „In Truhe 100 ist … 🤔“ + „dein Bauwunsch“ → 23,5 s Zähler 0/100, Schiff wie in Frame 1 (Loop).

## Technik
- `scene.js` = `build.sh` (base.js, helpers3.js, lib6c.js = Monster aus Tag 7, pre12.js = Konstanten, lib11.js = Bausteine aus Tag 11, tag12.js).
- `lines.js`: Untertitel direkt auf Beats (kein Whisper nötig, da keine Stimme), 2 Zeilen, Block 1 ab Frame 1 komplett.
- `audio12.py`: eigener Funk/Phonk-Beat (Tamborzão-Kicks 3-3-2, Clap, Cowbell-Riff g-Moll, 808) – lizenzfrei, synthetisiert → exakt auf dem Raster.
  Effekte synthetisch + Mixkit-Sounds in `sfx/` (Mixkit SFX Free License, aus der video-shotcraft-Bibliothek). Ergebnis `build/mix.wav`.
- Render: `node ../tools/canvas_render.js . --out rotanien_tag12.mp4 --audio build/mix.wav --fps 60` (vorher `--events`), danach Ton mit
  `loudnorm … ,volume=1.9dB,alimiter=limit=0.84` auf −14 LUFS gebracht (Prüfung mit video-cleanup `analyze.py`). Öffnungen liegen 22–50 ms nach dem Beat (≤ 3 Frames).
- Kein Sprecher, weil das ElevenLabs-Kontingent leer ist (9.959/10.000, Reset ca. 4.12.2026).

## Story-Version (Nutzerwunsch: passend zur Serie, nicht random)
- Die gelben Augen aus Tag 11 = Bugfenster eines Weltraumpiraten-Schiffs (👀-Pfeil + Ringe + Piratenflagge).
- Deal der Piraten: Token gefunden = alles gratis, sonst nehmen sie die **Stadtkasse** (Taler-Chip blinkt rot, Sack „STADTKASSE 4.474“ im Traktorstrahl).
- Truhen = Piratenbeute → Wünsche aus Tag 11. einfachso (Security seit Tag 9, Chef der Militärbasis seit Tag 11) sucht Soldaten **gegen die Piraten**.
- Aufruf: DerRauls Token-Haus aus Tag 11 steht leer daneben.

## Pipeline mit Stimme
1. `phrases_src.json` (Satz, Untertitel-Blöcke, Index des Schlüsselworts) → `python3 -I voice12.py` (je Satz eine TTS-Datei in build/vo, nur fehlende werden erzeugt; Tempo 1,18; nur Randstille entfernt)
2. `python3 -I timeline12.py` → Schlüsselwort jedes Truhen-Satzes liegt auf dem Beat der Öffnung; schreibt `timeline.js`, `lines.js`, `build/voice.wav`
3. `./build.sh`, `node ../tools/canvas_render.js . --events`, `python3 -I audio12.py` (Ducking: Musik −60 %, Effekte −72 % unter der Stimme), Render, dann `volume=0.5dB` → −14 LUFS
4. Whisper-Prüfung des fertigen Videos: alle Wörter da, letztes Wort „Video“ bei 28,0 s nicht abgeschnitten.
