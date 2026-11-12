# Rotanien – Tag 11: „12 Gebäude in 15 Sekunden“ (Bau-Speedrun)

Animation mit Sprecher, 26,0 s, 1080×1920, 60 fps. Stand 12.11.2026: 837 Follower, 4.443 Likes (= „Taler“).
Vorgabe aus der Auswertung von Tag 10 (62 % weg in Sekunde 1, zu lang, zu ruhig): schnell, laut, kurz, Action ab Frame 1.

## Ablauf
Timer läuft ab Frame 1, Stadion kracht vom Himmel („12 Gebäude. 15 Sekunden. Los!“) → 7 echte Wünsche aus den Kommentaren unter Tag 10
(voltron_e Stadion, einfachso Militärbasis mit Jets, Mehmet_brb Zoo, Aulara44 Tierheim, Jimmbo Burek-Kanone, DerRaul Token-Haus,
sami&zoe „Wo bin ich“ → Schule, sie ist Lehrerin) → + 5 Extras (Startrampe, Achterbahn, Wasserpark, Schutzkuppel mit Laserturm, Kino)
→ „Geschafft!“ → Alarm-Cliffhanger („Etwas kommt …“, muss in Tag 12 aufgelöst werden) → Bordkarte Rakete 4 (1 Follow = 1 Platz)
→ Aufruf „Was bauen wir als Nächstes?“ (Bauschild „Bauplatz frei“).

## Technik
- `tag11.js`: Seitenansicht-Bühne (`stage`), 12 Gebäude + Höhle (`bld(k, …)`), Einschlag mit Staub/Wackler/Blitz, Timer-HUD, Weitwinkel (`wide`).
- `scene.js` = `base.js helpers3.js tag11.js`. Untertitel: `make_lines.py` (~ gelb jetzt auch in `base.js` umgesetzt).
- Stimme: ElevenLabs „Chris“ (stability 0.35, style 0.5), `voice_prep.py … 1.14 0.25`, danach Pausen zwischen den Gebäuden eingefügt (nur an Wortlücken).
- Ton: `audio.py` (Ducking 0.86 mit 80 ms Vorausschau, Stimme im Median 12,7 dB über Musik/Effekten), `mix_music.py … -20 -15 0` → −14 LUFS.
- Musik: „EDM Detection Mode“, „Volatile Reaction“ – Kevin MacLeod (incompetech.com), CC BY 4.0.
