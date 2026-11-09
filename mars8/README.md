# Rotanien – Tag 8 „Neuer Planet, neues Land“ (nach BRIEFING_TAG8.md, Aufbau wie Tag 2)

Animation mit Sprecher, 32,8 s, 1080×1920, 60 fps. Stand 09.11.2026: 829 Follower (−1 → kein „+NEU“-Badge), 4.352 Likes.
Echte Umfrage unter Tag 7 („Durch oder Vorbei“, 27 Stimmen): 67 % „Mitten durch“, 33 % „Außen vorbei“ (Screenshot: umfrage_tag7.jpg).
→ Einstieg: „67 % sagten: Mitten durch! Und das Monster hat gelenkt.“ (statt „Keiner hat abgestimmt“ aus dem Briefing – das stimmte nicht).

Ablauf: Frame 1 „TAG 8“ + Flug durchs Asteroidenfeld, das Monster lenkt im Cockpitfenster („HUP! HUP!“, „🕹 MONSTER AM STEUER“ (Stimme: „Und das Monster saß am Steuer“ – „gelenkt“ klang wie „geleckt“)), Streifschüsse mit Funken;
bei „Bruchlandung“ taucht der pinke Planet auf, Sturzflug mit Feuer- und Rauchschweif („⚠ ABSTURZ!“), Einschlag mit Blitz, Sandexplosion,
Schockwelle und Trümmern (0,6 s Pause in der Stimme), Rakete steckt schief im Sand, Astronauten taumeln benommen (Sternchen); Profilkarte „Gedacht“ mit 829 (rot umrandet) + Bio „1 Follow = 1 Bewohner 🚀 · Top-Kommentar = neues Gesetz 📜“;
alle strömen aus der Rakete, Fahne „ROTANIEN 2.0“; 3 echte Kommentarkarten à ~3 s:
Jens „ich Stelle döner wieder her“ (⭐ ERSTE AMTSHANDLUNG, Jens hämmert, Dönerladen entsteht, Tim mit Döner-Chef-Mütze),
Mehmet „Apple Store auf dem nächsten Planeten 😂?“ (📅 FRAGT SEIT TAG 3, Tür mit Apfel-Logo geht auf, ✓ ERFÜLLT),
roader „man bitteeeee mein wurm“ (großer Wurm mit Helm, Schild „🪱 ROADERS WURM“, ✓ ERFÜLLT);
Fire.Nico als Gamer-Astronaut + Easter Eggs (elster, Bz_Full, Elias, Balerz, jaroslav, TickTock, Jakob, Phillip); „💬 JEDER WUNSCH ZÄHLT“;
Cliffhanger: Monster schnüffelt, riesige Fußspuren führen in eine Höhle, zwei rote Augen;
**Follow-CTA**: Bordkarte „RAKETE 3 · Ziel: ROTANIEN 2.0“ + „1 FOLLOW = 1 PLATZ“;
**Like-CTA**: TikTok-Herz wird angetippt, Döner fliegen zum Monster („1 LIKE = 1 DÖNER“);
**Kommentar-CTA**: „📜 GESETZ NR. 1“ + leere Kommentarkarte „dein Gesetz? 🤔“ + Tafel „GESETZ NR. 1 | ?“ + „+ dein Wunsch kommt vielleicht ins nächste Video 👇“;
Loop: zurück in den Asteroidenflug, Monster hupt → passt auf Frame 1.

Aufbau: base.js + helpers3.js + lib4.js + lib5.js + lib6.js + lib7.js (Bausteine aus Tag 6/7) + tag8.js -> scene.js
Musik (Kevin MacLeod, incompetech.com, CC BY 4.0), auf Wunsch durchgehend spannend: „Volatile Reaction“ (Flug + Absturz), „Five Armies“ (neuer Planet), „Ossuary 6 – Air“ (Höhle), „Hitman“ (CTAs).
Ton: −14 LUFS, Stimme im Mittel ~12 dB über dem Hintergrund (Ducking).
**Tag 9:** Der Kommentar mit den meisten Likes unter Tag 8 MUSS Gesetz Nr. 1 werden (echte Kommentarkarte, wie Tag 2).

Reihenfolge der Aufrufe (auf Wunsch): **Follow früh** direkt nach „829 Bewohner“ („Neue Mitbewohner? 1 Follow = 1 Platz in Rakete 3“ + Bordkarte),
am Ende zuerst **Gesetz/Top-Kommentar** (du hältst das aufgeschlagene Gesetzbuch „GESETZ NR. 1 – ?“, darüber Kommentarkarte „dein Gesetz? 🤔“),
danach **Like** („Und jedes Like: ein Döner fürs Monster“).
