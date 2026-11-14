// Tag 12: kein Sprecher (ElevenLabs-Kontingent leer) – Untertitel liegen auf dem Beat-Raster (130 BPM).
// Je Block: [Startbeat, Endbeat, "Text"]. "|" = neue Zeile, * türkis, ! rot, ~ gelb, "@12.5" = Wort erscheint auf Beat 12,5.
// Block 1 steht ab Frame 1 komplett, danach Wort für Wort.
(() => {
  const BT = 60 / 130;
  const SPEC = [
    [0, 3, "1 VON !100 TRUHEN|HAT DEN ~TOKEN 🪙", "all"],
    [3.25, 6.85, "WER IHN *FINDET,|KRIEGT ~ALLES ~GRATIS!"],
    [7, 8.85, "TRUHE 1:|!NIX."],
    [9, 11.85, "TRUHE 14:|*BANK ✅"],
    [12, 14.85, "*FLUGHAFEN ✅|PILOT: ~NOAM"],
    [15, 16.85, "*KLAMOTTENLADEN ✅"],
    [17, 18.85, "*BUNKER ✅"],
    [19, 22.85, "EINFACHSO SUCHT|!SOLDATEN 👇"],
    [23, 26.9, "60…@23 80…@24.5 !99…@26"],
    [27, 32.9, "TRUHE ~100@28 …@29"],
    [33, 35.95, "… UND DRIN@33.5 IST …@34"],
    [36, 41.85, "1 FOLLOW = 1 PLATZ|IN !RAKETE 4"],
    [42, 46.4, "WAS IST IN|TRUHE ~100? 🤔"],
    [46.5, 50.9, "RICHTIGER TIPP|KOMMT *INS VIDEO! 👇"],
  ];
  const chunks = [];
  for (const [b0, b1, txt, mode] of SPEC) {
    const s = b0 * BT, w = []; let k = 0;
    txt.split("|").forEach((line, li) => line.split(" ").forEach(tok => {
      let [word, at] = tok.split("@"); const col = word[0] === "*" ? 1 : word[0] === "!" ? 2 : word[0] === "~" ? 3 : 0;
      word = word.replace(/^[*!~]/, ""); const tt = mode === "all" ? -0.2 : at ? at * BT : s + k * 0.11; k++;
      w.push([word, tt, col, li]);
    }));
    chunks.push({ s: mode === "all" ? 0 : s, e: b1 * BT, w });
  }
  window.WORDS = [];
  window.CHUNKS = chunks;
})();
