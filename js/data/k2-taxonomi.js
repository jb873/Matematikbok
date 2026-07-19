/* k2-taxonomi.js — BRÅK-taxonomin (maskinläsbar nodstruktur för kapitel 2).
   Organiserad efter bokens 9 DELKAPITEL (område → deldomän → lövnod). Detta är
   grunden som både k2:s vyer och årskurs 8:s bråk läser ur.

   Schema per nod (samma som k1-taxonomi.js):
     { id, namn, parent, niva, arskursRelevans, roll, formaga, generator, begrepp, visning }
   Områden har dessutom { grupp, implemented }.

   VIKTIGT — räknesätten är UTBRUTNA per delkapitel: k2-ramens OMRADEN samlar
   add/sub/mult/division under ett "Räkna med bråk"-område, men boken har dem som
   Del 5 (add/sub), Del 6 (mult) och Del 7 (division). Här är de egna områden, så
   karta = bok (samma lärdom som k1:s mult/div).

   DELAT MED k1-Del4 (single-source, dubblas ej): Del 2 "Byta form" överlappar
   k1-Del4 "Bråkform och decimalform" på bråk↔decimal. De noderna ÅTERANVÄNDS ur
   k1-taxonomin (se brak-byta.delatMed) — de byggs inte om här. Det k2-Del2 lägger
   till är blandad form (oäkta↔blandad), en egen nod. Poolerna POOL_BD/POOL_HD +
   generatorerna genFracDec/genDecFrac bor kvar i js/motor/metod/metod-brak-decimal.js.

   Källor (lästa, ej rörda): ak7-k2-ram.html (OMRADEN), ak7-k2.html (delkapitel-
   texter), ovamer-k2.js (engine-namn). Generator-refs pekar på öva-mer-motorerna.
   Handskriven ren data — inga motorer/blad/mellanled rörda. */
window.K2_TAXONOMI = {
  "noder": [
    /* ─────────────── Del 1 · Andel och antal (kommer senare) ─────────────── */
    {
      "id": "brak-andel", "namn": "Andel och antal", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Skriva bråk från text och tolka bråk i figurer.",
      "grupp": "brak", "implemented": false
    },

    /* ─────────────── Del 2 · Byta form (öppen) ─────────────── */
    {
      "id": "brak-byta", "namn": "Byta form", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Bråk till decimaltal, blandad form till bråk och decimaltal.",
      "grupp": "brak", "implemented": true,
      "delatMed": {
        "kalla": "k1-taxonomi",
        "beskrivning": "Bråk↔decimal återanvänds rakt av ur k1-Del4 (single-source, dubblas ej).",
        "noder": ["bd-vaxla:rakna", "bd-tillbrak:rakna", "bd-hundra:rakna"]
      }
    },
    {
      "id": "brak-blandad", "namn": "Blandad form", "parent": "brak-byta", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Växla mellan oäkta bråk och blandad form (5/2 ↔ 2 1/2). Det k2-Del2 lägger till utöver bråk↔decimal.",
      "visning": null
    },
    {
      "id": "brak-blandad:rakna", "namn": "Oäkta bråk ↔ blandad form", "parent": "brak-blandad", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "bytaFormEngine",
      "begrepp": "Skriv oäkta bråk i blandad form och blandad form som oäkta bråk.",
      "visning": null
    },

    /* ─────────────── Del 3 · Förlänga och förkorta (öppen) ─────────────── */
    {
      "id": "brak-likv", "namn": "Förlänga och förkorta", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Förlänga och förkorta bråk till given nämnare och enklaste form.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-forlanga", "namn": "Förlänga bråk", "parent": "brak-likv", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Förläng bråket till en given nämnare.",
      "visning": null
    },
    {
      "id": "brak-forlanga:rakna", "namn": "Förlänga bråk", "parent": "brak-forlanga", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "forlangaEngine",
      "begrepp": "Förläng täljare och nämnare med samma tal till given nämnare.",
      "visning": null
    },
    {
      "id": "brak-forkorta", "namn": "Förkorta bråk", "parent": "brak-likv", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Förkorta bråket till enklaste form.",
      "visning": null
    },
    {
      "id": "brak-forkorta:rakna", "namn": "Förkorta bråk", "parent": "brak-forkorta", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "forkortaEngine",
      "begrepp": "Dela täljare och nämnare med samma tal till enklaste form.",
      "visning": null
    },

    /* ─────────────── Del 4 · Jämföra bråk (kommer senare) ─────────────── */
    {
      "id": "brak-jamf", "namn": "Jämföra bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Storleksordna och jämföra bråk med olika nämnare.",
      "grupp": "brak", "implemented": false
    },

    /* ─────────────── Del 5 · Addition och subtraktion med bråk (öppen) ─────────────── */
    {
      "id": "brak-as", "namn": "Addition och subtraktion med bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Addera och subtrahera bråk – samma och olika nämnare, blandad form och negativa svar.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-add", "namn": "Addition med bråk", "parent": "brak-as", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Addera bråk med samma och olika nämnare (mellanled: förläng till gemensam nämnare).",
      "visning": null
    },
    {
      "id": "brak-add:rakna", "namn": "Addition med bråk", "parent": "brak-add", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "raknaEngine",
      "begrepp": "Räkna ut summan; visa mellanledet (förläng till gemensam nämnare).",
      "visning": null
    },
    {
      "id": "brak-sub", "namn": "Subtraktion med bråk", "parent": "brak-as", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Subtrahera bråk med samma och olika nämnare.",
      "visning": null
    },
    {
      "id": "brak-sub:rakna", "namn": "Subtraktion med bråk", "parent": "brak-sub", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "raknaEngine",
      "begrepp": "Räkna ut differensen; visa mellanledet (förläng till gemensam nämnare).",
      "visning": null
    },

    /* ─────────────── Del 6 · Multiplikation med bråk (öppen; ram-drill byggs i wiring) ─────────────── */
    {
      "id": "brak-mult", "namn": "Multiplikation med bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Multiplicera bråktal med bråktal, heltal och blandad form.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-mult-rakna", "namn": "Multiplikation med bråk", "parent": "brak-mult", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Multiplicera bråk · bråk, bråk · heltal och blandad form.",
      "visning": null
    },
    {
      "id": "brak-mult-rakna:rakna", "namn": "Multiplikation med bråk", "parent": "brak-mult-rakna", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Öva-bladet finns (blad-k2-d6.js); Färdighetstränings-drillen byggs i wiring-steget.",
      "visning": null
    },

    /* ─────────────── Del 7 · Division med bråk (kommer senare) ─────────────── */
    {
      "id": "brak-div", "namn": "Division med bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Dividera heltal, bråktal och blandad form.",
      "grupp": "brak", "implemented": false
    },

    /* ─────────────── Del 8 · Problemlösning (kommer senare) ─────────────── */
    {
      "id": "brak-prob", "namn": "Problemlösning", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Lästal och problemuppgifter med bråk.",
      "grupp": "brak", "implemented": false
    },

    /* ─────────────── Del 9 · Plugg till prov (kommer senare) ─────────────── */
    {
      "id": "brak-prov", "namn": "Plugg till prov", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Repetition inför provet – blandade uppgifter på hela kapitlet.",
      "grupp": "avslutning", "implemented": false
    }
  ]
};
