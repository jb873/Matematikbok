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
    /* ─────────────── Del 1 · Andel och antal (öppen; BILDBASERAT) ───────────────
       Nästan helt visuellt: figurerna (delad figur, tallinje, rutnät, antalsfigur,
       rutnäts-area) genereras som SVG i bokens palett — inga PNG ur läromedlet i
       repot. Öva-bladet (blad-k2-d1.js) är Joachims uppgifter, exakt. Kärnan är
       "andel kontra antal" (vem har flest blå vs störst andel blå). Färdighetstränings-
       drillar byggs när figurgeneratorerna är klara (delad figur = pilot). */
    {
      "id": "brak-andel", "namn": "Andel och antal", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Tolka och skriva andel ur figurer, tallinjer och antal – och skilja andel från antal.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "andel-figur", "namn": "Andel av en figur", "parent": "brak-andel", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Hur stor andel av en delad figur som är färgad (kvadrat, cirkel, rektangel, hexagon).",
      "visning": null
    },
    {
      "id": "andel-figur:rakna", "namn": "Andel av en figur", "parent": "andel-figur", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "andelFigurEngine",
      "begrepp": "Skriv andelen färgad del av figuren som bråk.",
      "visning": { "utbudslista": "k2d1", "grupp": "Andel och antal", "gruppordning": 0, "radordning": 0, "titel": "Andel av en figur", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "andel-tallinje", "namn": "Bråk på tallinje", "parent": "brak-andel", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Avläsa vilket bråk (eller tal) en markör pekar på en tallinje.",
      "visning": null
    },
    {
      "id": "andel-tallinje:begrepp", "namn": "Bråk på tallinje", "parent": "andel-tallinje", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "BEGREPP", "generator": "tallinjeEngine",
      "begrepp": "Läs av bråket som pilen/punkten pekar på.",
      "visning": { "utbudslista": "k2d1", "grupp": "Andel och antal", "gruppordning": 0, "radordning": 1, "titel": "Bråk på tallinje", "etikett": "begrepp", "formagaKey": "begrepp", "niva": null }
    },
    {
      "id": "andel-antal", "namn": "Andel av ett antal", "parent": "brak-andel", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Andel av en mängd objekt (kulor, djur) – hur stor del som har en viss egenskap.",
      "visning": null
    },
    {
      "id": "andel-antal:rakna", "namn": "Andel av ett antal", "parent": "andel-antal", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "antalEngine",
      "begrepp": "Skriv andelen (t.ex. blå kulor av alla) som bråk.",
      "visning": { "utbudslista": "k2d1", "grupp": "Andel och antal", "gruppordning": 0, "radordning": 2, "titel": "Andel av ett antal", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "andel-hela", "namn": "Skriva hela tal i bråkform", "parent": "brak-andel", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Skriva ett helt tal som bråk på flera sätt (2 = 2/1 = 4/2 = 6/3 …).",
      "visning": null
    },
    {
      "id": "andel-hela:resonera", "namn": "Skriva hela tal i bråkform", "parent": "andel-hela", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RESONERA", "generator": "helaEngine",
      "begrepp": "Ge flera bråk som är lika med ett givet helt tal (villkors-validering).",
      "visning": { "utbudslista": "k2d1", "grupp": "Andel och antal", "gruppordning": 0, "radordning": 3, "titel": "Skriva hela i bråkform", "etikett": "resonera", "formagaKey": "resonera", "niva": null }
    },
    {
      "id": "andel-kontra", "namn": "Andel kontra antal", "parent": "brak-andel", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Delkapitlets kärna: skilja 'flest' (antal) från 'störst andel' (proportion).",
      "visning": null
    },
    {
      "id": "andel-kontra:resonera", "namn": "Andel kontra antal", "parent": "andel-kontra", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RESONERA", "generator": "kontraEngine",
      "begrepp": "Avgör vem som har flest respektive störst andel – och varför de kan skilja sig.",
      "visning": { "utbudslista": "k2d1", "grupp": "Andel och antal", "gruppordning": 0, "radordning": 4, "titel": "Andel kontra antal", "etikett": "resonera", "formagaKey": "resonera", "niva": null }
    },

    /* ─────────────── Del 2 · Byta form (öppen) ─────────────── */
    {
      "id": "brak-byta", "namn": "Byta form", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
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
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Växla mellan oäkta bråk och blandad form (5/2 ↔ 2 1/2). Det k2-Del2 lägger till utöver bråk↔decimal.",
      "visning": null
    },
    {
      "id": "brak-blandad:rakna", "namn": "Oäkta bråk ↔ blandad form", "parent": "brak-blandad", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "blandadEngine",
      "begrepp": "Skriv oäkta bråk i blandad form och blandad form som oäkta bråk.",
      "visning": { "utbudslista": "k2d2", "grupp": "Byta form", "gruppordning": 0, "radordning": 3, "titel": "Blandad form", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-tid", "namn": "Tid i bråk- och decimalform", "parent": "brak-byta", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Skriva minuter som del av en timme i bråkform (45 min = 3/4 h) och decimalform (15 min = 0,25 h).",
      "visning": null
    },
    {
      "id": "brak-tid:rakna", "namn": "Tid i bråk- och decimalform", "parent": "brak-tid", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "tidBrakEngine",
      "begrepp": "Växla mellan minuter/timmar och bråk- eller decimalform av en timme.",
      "visning": { "utbudslista": "k2d2", "grupp": "Byta form", "gruppordning": 0, "radordning": 4, "titel": "Tid i bråkform", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },

    /* ─────────────── Del 3 · Förlänga och förkorta (öppen) ─────────────── */
    {
      "id": "brak-likv", "namn": "Förlänga och förkorta", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Förlänga och förkorta bråk till given nämnare och enklaste form.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-forlanga", "namn": "Förlänga bråk", "parent": "brak-likv", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Förläng bråket till en given nämnare.",
      "visning": null
    },
    {
      "id": "brak-forlanga:rakna", "namn": "Förlänga bråk", "parent": "brak-forlanga", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "forlangaEngine",
      "begrepp": "Förläng täljare och nämnare med samma tal till given nämnare.",
      "visning": { "utbudslista": "k2d3", "grupp": "Förlänga och förkorta", "gruppordning": 0, "radordning": 0, "titel": "Förlänga bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-forkorta", "namn": "Förkorta bråk", "parent": "brak-likv", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Förkorta bråket till enklaste form.",
      "visning": null
    },
    {
      "id": "brak-forkorta:rakna", "namn": "Förkorta bråk", "parent": "brak-forkorta", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "forkortaEngine",
      "begrepp": "Dela täljare och nämnare med samma tal till enklaste form.",
      "visning": { "utbudslista": "k2d3", "grupp": "Förlänga och förkorta", "gruppordning": 0, "radordning": 1, "titel": "Förkorta bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-likformig", "namn": "Likformiga bråk", "parent": "brak-likv", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Skriva likformiga (ekvivalenta) bråk – samma värde men förlängda täljare och nämnare.",
      "visning": null
    },
    {
      "id": "brak-likformig:rakna", "namn": "Likformiga bråk", "parent": "brak-likformig", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "likformigEngine",
      "begrepp": "Ge flera bråk som är lika med ett givet bråk genom förlängning (villkors-validering).",
      "visning": { "utbudslista": "k2d3", "grupp": "Förlänga och förkorta", "gruppordning": 0, "radordning": 2, "titel": "Likformiga bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },

    /* ─────────────── Del 4 · Jämföra bråk (öppen; Öva = exakt-författat blad) ───────────────
       Öva-bladet (blad-k2-d4.js) är EXAKT det Joachim författat i "Jämföra bråk.docx"
       (13 uppgifter, ordagrant). Ingen generator ännu — lövnoderna beskriver färdigheterna
       bladet tränar. Färdighetstränings-drillar (generator/visning) byggs i ett senare steg;
       formåga BEGREPP/RESONERA är förslag som finjusteras i finputsen. */
    {
      "id": "brak-jamf", "namn": "Jämföra bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Jämföra och storleksordna bråk – samma täljare/nämnare, mot riktmärkena 1/2 och 1, samt uppskatta summor.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-jmf-lika", "namn": "Jämföra med samma täljare eller nämnare", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Samma nämnare: störst täljare är störst. Samma täljare: minst nämnare är störst.",
      "visning": null
    },
    {
      "id": "brak-jmf-lika:begrepp", "namn": "Jämföra bråk med samma täljare eller nämnare", "parent": "brak-jmf-lika", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "BEGREPP", "generator": "klickaStorstEngine",
      "begrepp": "Avgör vilket bråk som är störst när täljarna eller nämnarna är lika.",
      "visning": { "utbudslista": "k2d4", "grupp": "Jämföra bråk", "gruppordning": 0, "radordning": 0, "titel": "Vilket är störst?", "etikett": "begrepp", "formagaKey": "begrepp", "niva": null }
    },
    {
      "id": "brak-jmf-riktmark", "namn": "Jämföra mot 1/2 och 1", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Använd riktmärkena 1/2 och 1: större/mindre än 1, större/mindre än 1/2.",
      "visning": null
    },
    {
      "id": "brak-jmf-riktmark:begrepp", "namn": "Jämföra bråk mot riktmärken", "parent": "brak-jmf-riktmark", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "BEGREPP", "generator": "markeraRiktmarkEngine",
      "begrepp": "Bedöm om ett bråk är större/mindre än 1 eller 1/2; välj rätt tecken mot 1.",
      "visning": { "utbudslista": "k2d4", "grupp": "Jämföra bråk", "gruppordning": 0, "radordning": 1, "titel": "Mot ½ och 1", "etikett": "begrepp", "formagaKey": "begrepp", "niva": null }
    },
    {
      "id": "brak-jmf-ordna", "namn": "Storleksordna bråk", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Ordna flera bråk i storleksordning, med samma täljare/nämnare och blandat.",
      "visning": null
    },
    {
      "id": "brak-jmf-ordna:resonera", "namn": "Storleksordna bråk", "parent": "brak-jmf-ordna", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RESONERA", "generator": "storleksordnaEngine",
      "begrepp": "Storleksordna en uppsättning bråk, börja med det minsta.",
      "visning": { "utbudslista": "k2d4", "grupp": "Jämföra bråk", "gruppordning": 0, "radordning": 2, "titel": "Storleksordna", "etikett": "resonera", "formagaKey": "resonera", "niva": null }
    },
    {
      "id": "brak-jmf-summa", "namn": "Uppskatta summa mot 1", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Avgör om en summa av bråk är större eller mindre än 1 utan att räkna exakt.",
      "visning": null
    },
    {
      "id": "brak-jmf-summa:resonera", "namn": "Uppskatta summa mot 1", "parent": "brak-jmf-summa", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RESONERA", "generator": "summaMot1Engine",
      "begrepp": "Bedöm summans storlek mot 1; hitta bråk som gör summan mindre än 1.",
      "visning": { "utbudslista": "k2d4", "grupp": "Jämföra bråk", "gruppordning": 0, "radordning": 3, "titel": "Summa mot 1", "etikett": "resonera", "formagaKey": "resonera", "niva": null }
    },
    {
      "id": "brak-jmf-konstr", "namn": "Konstruera bråk med villkor", "parent": "brak-jamf", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Skriv ett bråk som uppfyller ett villkor, t.ex. mellan 1/2 och 1 med given täljare/nämnare.",
      "visning": null
    },
    {
      "id": "brak-jmf-konstr:resonera", "namn": "Konstruera bråk med villkor", "parent": "brak-jmf-konstr", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RESONERA", "generator": "konstrueraEngine",
      "begrepp": "Ge exempel på bråk i ett givet intervall eller med en given täljare/nämnare.",
      "visning": { "utbudslista": "k2d4", "grupp": "Jämföra bråk", "gruppordning": 0, "radordning": 4, "titel": "Konstruera bråk", "etikett": "resonera", "formagaKey": "resonera", "niva": null }
    },

    /* ─────────────── Del 5 · Addition och subtraktion med bråk (öppen) ─────────────── */
    {
      "id": "brak-as", "namn": "Addition och subtraktion med bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Addera och subtrahera bråk – samma och olika nämnare, blandad form och negativa svar.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-add", "namn": "Addition med bråk", "parent": "brak-as", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Addera bråk med samma och olika nämnare (mellanled: förläng till gemensam nämnare).",
      "visning": null
    },
    {
      "id": "brak-add:rakna", "namn": "Addition med bråk", "parent": "brak-add", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "raknaEngine",
      "begrepp": "Räkna ut summan; visa mellanledet (förläng till gemensam nämnare).",
      "visning": { "utbudslista": "k2d5", "grupp": "Addition och subtraktion", "gruppordning": 0, "radordning": 0, "titel": "Addition med bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-sub", "namn": "Subtraktion med bråk", "parent": "brak-as", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Subtrahera bråk med samma och olika nämnare.",
      "visning": null
    },
    {
      "id": "brak-sub:rakna", "namn": "Subtraktion med bråk", "parent": "brak-sub", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "raknaEngine",
      "begrepp": "Räkna ut differensen; visa mellanledet (förläng till gemensam nämnare).",
      "visning": { "utbudslista": "k2d5", "grupp": "Addition och subtraktion", "gruppordning": 0, "radordning": 1, "titel": "Subtraktion med bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-lana", "namn": "Låna i blandad form", "parent": "brak-as", "niva": "deldoman",
      "arskursRelevans": { "ak8": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Subtraktion i blandad form där täljaren i minuenden är för liten – låna från heltalet så bråkdelen blir oäkta. Nytt mål i åttan.",
      "visning": null
    },
    {
      "id": "brak-lana:rakna", "namn": "Låna i blandad form", "parent": "brak-lana", "niva": "lovnod",
      "arskursRelevans": { "ak8": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "lanaEngine",
      "begrepp": "Räkna ut differensen i blandad form med lån från heltalet; flera giltiga vägar (låna eller via oäkta bråk). Öva-bladet rättar equality-baserat.",
      "visning": null
    },

    /* ─────────────── Del 6 · Multiplikation med bråk (öppen; ram-drill byggs i wiring) ─────────────── */
    {
      "id": "brak-mult", "namn": "Multiplikation med bråk", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Multiplicera bråktal med bråktal, heltal och blandad form.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "brak-mult-rakna", "namn": "Multiplikation med bråk", "parent": "brak-mult", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Multiplicera bråk · bråk, bråk · heltal och blandad form.",
      "visning": null
    },
    {
      "id": "brak-mult-rakna:rakna", "namn": "Multiplikation med bråk", "parent": "brak-mult-rakna", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal", "ak8": "repetition" }, "roll": "karna", "formaga": "RAKNA", "generator": "multBrakEngine",
      "begrepp": "Multiplicera bråk · bråk, heltal · bråk och blandad form; svar i enklaste/blandad form. Stora tal med förkortnings-mellanled.",
      "visning": { "utbudslista": "k2d6", "grupp": "Multiplikation med bråk", "gruppordning": 0, "radordning": 0, "titel": "Multiplikation med bråk", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-mult-forkorta", "namn": "Förkorta innan multiplikation", "parent": "brak-mult", "niva": "deldoman",
      "arskursRelevans": { "ak8": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "När produkten är för stor för huvudräkning: förkorta (korsförkorta) täljare mot nämnare INNAN man multiplicerar. Nytt mål i åttan (höjt talområde).",
      "visning": null
    },
    {
      "id": "brak-mult-forkorta:rakna", "namn": "Förkorta innan multiplikation", "parent": "brak-mult-forkorta", "niva": "lovnod",
      "arskursRelevans": { "ak8": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "multForkortaEngine",
      "begrepp": "Korsförkorta täljare och nämnare (i valfri ordning) innan multiplikation; svar i enklaste/blandad form. Öva-bladet rättar equality-baserat (flera giltiga vägar).",
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
    /* SYSTER-NOD (täckningsrapport, godkänd): invertera direkt — den kortare vägen utan
       femstegskedjan, för elever som förstått VARFÖR inverteringen fungerar. Egen nod →
       egen logg (deeplink ?ko=brak-div-inv&formaga=rakna). roll fordjupning, ak7 endast. */
    {
      "id": "brak-div-inv", "namn": "Dividera bråktal med bråktal (invertera)", "parent": "brak-div", "niva": "deldoman",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Den kortare vägen: invertera nämnaren och multiplicera direkt – utan den utskrivna femstegskedjan. Kortare kommunikation som tecken på djupare förståelse, inte genväg.",
      "visning": null
    },
    {
      "id": "brak-div-inv:rakna", "namn": "Dividera bråktal med bråktal (invertera)", "parent": "brak-div-inv", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning", "ak8": "mal" }, "roll": "fordjupning", "formaga": "RAKNA", "generator": "divBrakBrak",
      "begrepp": "Invertera nämnaren och multiplicera direkt; svar i enklaste form. Ingen utskriven femstegskedja krävs.",
      "visning": { "utbudslista": "k2d7", "grupp": "Division med bråk", "gruppordning": 0, "radordning": 3, "titel": "Bråktal ÷ bråktal (invertera)", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "brak-div-reciprok", "namn": "Skriva reciprok (invertera ett tal)", "parent": "brak-div", "niva": "deldoman",
      "arskursRelevans": { "ak8": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Skriva det inverterade (reciproka) talet: byt plats på täljare och nämnare (4/7 → 7/4). Egen färdighet, skild från själva divisionen; den algebraiska varianten (2x/y → y/2x) knyter till algebra-kapitlet. Nytt mål i åttan.",
      "visning": null
    },
    {
      "id": "brak-div-reciprok:rakna", "namn": "Skriva reciprok", "parent": "brak-div-reciprok", "niva": "lovnod",
      "arskursRelevans": { "ak8": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "reciprokEngine",
      "begrepp": "Skriv reciproken till ett bråk eller algebraiskt uttryck genom att byta plats på täljare och nämnare.",
      "visning": null
    },

    /* ─────────────── Fördjupnings-strand · bråk och variabler (åk7-fördjupning) ───────────────
       Avsiktlig sträckning för de bästa eleverna redan i sjuan (täckningsrapport punkt 2).
       Syns i självskattningen/kartan som fördjupning (★), scopas in för den som väljer "allt",
       grå på godkänt-vägen. generator:null → ännu ej drillbara (concept-rader); belief kan ändå
       självskattas, evidens tom. Byggs som drillar när metod-medveten rättning mognat. */
    {
      "id": "brak-fordjup", "namn": "Fördjupning: bråk och variabler", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Faktorisera och bryta ut i bråkmiljö, och räkna med bråk som innehåller variabler – en strand för den som vill sträcka sig.",
      "grupp": "brak", "implemented": true
    },
    {
      "id": "fordjup-variabler", "namn": "Bråk med variabler", "parent": "brak-fordjup", "niva": "deldoman",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Förenkla och dividera bråk som innehåller variabler.", "visning": null
    },
    {
      "id": "fordjup-variabler:rakna", "namn": "Dividera och förenkla bråk med variabler", "parent": "fordjup-variabler", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": "RAKNA", "generator": null,
      "begrepp": "Dividera bråk med variabler och förenkla uttryck i bråkform.", "visning": null
    },
    {
      "id": "fordjup-brytut", "namn": "Faktorisera och bryta ut", "parent": "brak-fordjup", "niva": "deldoman",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Bryta ut gemensamma faktorer (även med variabler, potensform och nämnare) och använda konjugat-/kvadreringsregeln.", "visning": null
    },
    {
      "id": "fordjup-brytut:resonera", "namn": "Bryta ut gemensamma faktorer", "parent": "fordjup-brytut", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": "RESONERA", "generator": null,
      "begrepp": "Bryt ut gemensam faktor ur uttryck – med variabler, potensform och nämnare.", "visning": null
    },
    {
      "id": "fordjup-brytut:konjugat", "namn": "Konjugat- och kvadreringsregeln", "parent": "fordjup-brytut", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": "RESONERA", "generator": null,
      "begrepp": "Återskapa parenteser med konjugatregeln och kvadreringsreglerna.", "visning": null
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
