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
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "blandadEngine",
      "begrepp": "Skriv oäkta bråk i blandad form och blandad form som oäkta bråk.",
      "visning": { "utbudslista": "k2d2", "grupp": "Byta form", "gruppordning": 0, "radordning": 3, "titel": "Blandad form", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
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
      "visning": { "utbudslista": "k2d3", "grupp": "Förlänga och förkorta", "gruppordning": 0, "radordning": 0, "titel": "Förlänga bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
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
      "visning": { "utbudslista": "k2d3", "grupp": "Förlänga och förkorta", "gruppordning": 0, "radordning": 1, "titel": "Förkorta bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },

    /* ─────────────── Del 4 · Jämföra bråk (öppen; Öva = exakt-författat blad) ───────────────
       Öva-bladet (blad-k2-d4.js) är EXAKT det Joachim författat i "Jämföra bråk.docx"
       (13 uppgifter, ordagrant). Ingen generator ännu — lövnoderna beskriver färdigheterna
       bladet tränar. Färdighetstränings-drillar (generator/visning) byggs i ett senare steg;
       formåga BEGREPP/RESONERA är förslag som finjusteras i finputsen. */
    {
      "id": "brak-jamf", "namn": "Jämföra bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Jämföra och storleksordna bråk – samma täljare/nämnare, mot riktmärkena 1/2 och 1, samt uppskatta summor.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-jmf-lika", "namn": "Jämföra med samma täljare eller nämnare", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Samma nämnare: störst täljare är störst. Samma täljare: minst nämnare är störst.",
      "visning": null
    },
    {
      "id": "brak-jmf-lika:begrepp", "namn": "Jämföra bråk med samma täljare eller nämnare", "parent": "brak-jmf-lika", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "BEGREPP", "generator": null,
      "begrepp": "Avgör vilket bråk som är störst när täljarna eller nämnarna är lika.",
      "visning": null
    },
    {
      "id": "brak-jmf-riktmark", "namn": "Jämföra mot 1/2 och 1", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Använd riktmärkena 1/2 och 1: större/mindre än 1, större/mindre än 1/2.",
      "visning": null
    },
    {
      "id": "brak-jmf-riktmark:begrepp", "namn": "Jämföra bråk mot riktmärken", "parent": "brak-jmf-riktmark", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "BEGREPP", "generator": null,
      "begrepp": "Bedöm om ett bråk är större/mindre än 1 eller 1/2; välj rätt tecken mot 1.",
      "visning": null
    },
    {
      "id": "brak-jmf-ordna", "namn": "Storleksordna bråk", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Ordna flera bråk i storleksordning, med samma täljare/nämnare och blandat.",
      "visning": null
    },
    {
      "id": "brak-jmf-ordna:resonera", "namn": "Storleksordna bråk", "parent": "brak-jmf-ordna", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RESONERA", "generator": null,
      "begrepp": "Storleksordna en uppsättning bråk, börja med det minsta.",
      "visning": null
    },
    {
      "id": "brak-jmf-summa", "namn": "Uppskatta summa mot 1", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Avgör om en summa av bråk är större eller mindre än 1 utan att räkna exakt.",
      "visning": null
    },
    {
      "id": "brak-jmf-summa:resonera", "namn": "Uppskatta summa mot 1", "parent": "brak-jmf-summa", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RESONERA", "generator": null,
      "begrepp": "Bedöm summans storlek mot 1; hitta bråk som gör summan mindre än 1.",
      "visning": null
    },
    {
      "id": "brak-jmf-konstr", "namn": "Konstruera bråk med villkor", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Skriv ett bråk som uppfyller ett villkor, t.ex. mellan 1/2 och 1 med given täljare/nämnare.",
      "visning": null
    },
    {
      "id": "brak-jmf-konstr:resonera", "namn": "Konstruera bråk med villkor", "parent": "brak-jmf-konstr", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RESONERA", "generator": null,
      "begrepp": "Ge exempel på bråk i ett givet intervall eller med en given täljare/nämnare.",
      "visning": null
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
      "visning": { "utbudslista": "k2d5", "grupp": "Addition och subtraktion", "gruppordning": 0, "radordning": 0, "titel": "Addition med bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
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
      "visning": { "utbudslista": "k2d5", "grupp": "Addition och subtraktion", "gruppordning": 0, "radordning": 1, "titel": "Subtraktion med bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
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

    /* ─────────────── Del 7 · Division med bråk (öppen; FÖRDJUPNING i åk7) ───────────────
       Hela Del 7 är fördjupning i sjuan (roll: fordjupning) och promoteras till mål i åttan.
       Öva-bladet (blad-k2-d7.js) är EXAKT det Joachim författat i "Division med bråk.docx"
       (6 grupper × 3 uppgifter, komplexa/staplade bråk). Grupp 3 och 6 visar hela femstegs-
       mellanledet (multiplicera täljare och nämnare med inverterade bråket → nämnaren blir 1).
       Tre lövnoder = tre färdigheter som övas separat i Färdighetsträningen. */
    {
      "id": "brak-div", "namn": "Division med bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Dividera bråktal med heltal, heltal med bråktal och bråktal med bråktal (visa metod).",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-div-bh", "namn": "Dividera bråktal med heltal", "parent": "brak-div", "niva": "deldoman",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Ett bråk delat med ett heltal – multiplicera nämnaren med heltalet.",
      "visning": null
    },
    {
      "id": "brak-div-bh:rakna", "namn": "Dividera bråktal med heltal", "parent": "brak-div-bh", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": "RAKNA", "generator": "divBrakHeltal",
      "begrepp": "Räkna ut kvoten av ett bråk och ett heltal, svar i enklaste form.",
      "visning": { "utbudslista": "k2d7", "grupp": "Division med bråk", "gruppordning": 0, "radordning": 0, "titel": "Bråktal ÷ heltal", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-div-hb", "namn": "Dividera heltal med bråktal", "parent": "brak-div", "niva": "deldoman",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Ett heltal delat med ett bråk – multiplicera heltalet med det inverterade bråket.",
      "visning": null
    },
    {
      "id": "brak-div-hb:rakna", "namn": "Dividera heltal med bråktal", "parent": "brak-div-hb", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": "RAKNA", "generator": "divHeltalBrak",
      "begrepp": "Räkna ut kvoten av ett heltal och ett bråk, svar i enklaste form.",
      "visning": { "utbudslista": "k2d7", "grupp": "Division med bråk", "gruppordning": 0, "radordning": 1, "titel": "Heltal ÷ bråktal", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-div-bb", "namn": "Dividera bråktal med bråktal (visa metod)", "parent": "brak-div", "niva": "deldoman",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Bråk delat med bråk med utskrivet mellanled: multiplicera täljare och nämnare med inverterade nämnaren så att nämnaren blir 1.",
      "visning": null
    },
    {
      "id": "brak-div-bb:rakna", "namn": "Dividera bråktal med bråktal (visa metod)", "parent": "brak-div-bb", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": "RAKNA", "generator": "divBrakBrak",
      "begrepp": "Visa hela metoden (komplext bråk → × inverterade nämnaren → förkorta → svar) för bråk delat med bråk.",
      "visning": { "utbudslista": "k2d7", "grupp": "Division med bråk", "gruppordning": 0, "radordning": 2, "titel": "Bråktal ÷ bråktal (visa metod)", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
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
