# Rotanien – Tag 7 „Blinder Passagier“ (nach BRIEFING_TAG7.md, Stil wie Tag 6)

Animation mit Sprecher, 23,3 s, 1080×1920, 60 fps. Stand 08.11.2026: 830 Follower, 4.317 Likes.
Echte Umfrage unter Tag 6 („Was machen wir“, 60 Stimmen): 72 % „Besseren Planeten suchen“, 28 % „Auf Pluto bleiben“
→ wir fliegen weiter, das Monster fliegt als Maskottchen mit (Jens' Idee). Die echte Umfragekarte (umfrage_tag6.jpg, Screenshot des Nutzers) wird bei „72 Prozent“ gezeigt.

Ablauf: Frame 1 hell, Monster mit vollen Backen in der Kiste „🥙 DÖNER-VORRAT“, erste Zeile „BLINDER PASSAGIER AN BORD 😳“ steht sofort komplett da;
Lichtsprung + Umfragekarte + „🚀 72 % – WEITER!“; Döner-Zähler 12 → 3, Tim (Mütze „DÖNER-CHEF“) rauft sich die Haare;
Jens: Halsband „MASKOTTCHEN“ + Plakat „1 DÖNER PRO TAG“; Rehook ~9 s: „🚨 ALARM“ + Asteroidenfeld;
Cockpit: „⚡ NUR NOCH 1 SPRUNG“; „👥 830 AN BORD“ + „1 FOLLOW = 1 PLATZ AN BORD“;
Entscheidung „DURCH ODER AUSSENRUM?“ (links ⚡ schnell, aber gefährlich – Einschlag 💥; rechts 🐢 sicher, aber 🥙 reicht nicht – Monster grummelt),
Umfragekarte „Durch oder außenrum?“ (⚡ Mitten durch / 🐢 Außenrum) + „+ schreib, was du an Bord mitnimmst 👇“;
Loop: Asteroid füllt das Fenster, Monster rülpst „BÖÖRP!“, Licht flackert, Schnitt → passt auf die Kiste in Frame 1.
Easter Eggs: TickTock (Winterjacke + Rolex), Balerz09 (Barça-Trikot + Sonnenbrille), Michel (Fußballschuhe), jaroslav (Polizeimütze am Steuer),
roader (Regenwurm mit Helm), Leonard („👋 Bin noch drin!“), Noam (Handy „Empfang: 1 Balken“), Mehmet (Aufkleber „🍎 Apple Store kommt“),
Mr. Apfel (kleiner Astronaut mit Hamster), Jens (Maskottchen-Idee), Tim (Döner-Chef).

Aufbau: base.js + helpers3.js + lib4.js + lib5.js + lib6.js (Monster/Döner/Antrieb aus Tag 6) + tag7.js -> scene.js

    cat mars7/base.js mars7/helpers3.js mars7/lib4.js mars7/lib5.js mars7/lib6.js mars7/tag7.js > mars7/scene.js
    python3 mars7/voice_prep.py mars7/build/voice_raw.mp3 mars7/build/voice.wav 1.2 0.3   # Stimme „Liam“, Text in script.txt, keine Schnitte
    python3 mars7/words.py && python3 mars7/make_lines.py
    node tools/canvas_render.js mars7 --events
    python3 mars7/audio.py      # Effekte + Ducking + Musik (build/music_cand -> mars5/build/music_cand)
    python3 tools/mix_music.py mars7/build/audio.wav mars7/build/music.wav mars7/build/mix.wav -22 -15 0
    node tools/canvas_render.js mars7 --out mars7/rotanien_tag7.mp4 --audio mars7/build/mix.wav --fps 60

Musik (Kevin MacLeod, incompetech.com, CC BY 4.0): „Monkeys Spinning Monkeys“, „Volatile Reaction“, „Hitman“.
Ton: −14 LUFS, Stimme im Mittel ~11 dB über dem Hintergrund (Ducking).
