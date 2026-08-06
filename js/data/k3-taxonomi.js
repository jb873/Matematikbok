/* k3-taxonomi.js — ALGEBRA-taxonomin (maskinläsbar nodstruktur för kapitel 3, åk7).
   Organiserad efter bokens 7 DELKAPITEL (område → deldomän → lövnod), KARTA = BOK.
   Samma form, fältnamn och konventioner som k1-taxonomi.js och k2-taxonomi.js.

   Schema per nod (identiskt med k1/k2):
     { id, namn, parent, niva, arskursRelevans, roll, formaga, generator, begrepp, visning }
   Områden har dessutom { grupp, implemented }. Lövnoder med generator har ett visning-objekt
   (utbudslista); lövnoder utan generator har visning:null (synliga i kartan, ej i öva-väljaren).

   ── DEEPLINK-GATEN (viktigt): k3 har ÄNNU INGEN mastery-loggning eller ?ko=&formaga=-deeplink
      (verifierat: grep 0 träffar i ak7-k3-ram.html, ovamer-k3.js, blad-k3-*, ekvationer-balans.js).
      generator-fälten pekar därför FRAMÅT på verkliga öva-mer-motorer (samma princip som k2:s
      generator-refs) och granulariteten är vald så varje generator-nod motsvarar EN separat
      dispatch (ak7-k3-ram.html oppnaGrupp(omrId,gruppId)) — redo för per-nod-deeplink när
      MasteryK3 + wiring byggs i nästa order. Ingen per-nod-färg är aktiv förrän dess.

   ── generator satt ENDAST där inventeringen (INVENTERING-k3.md) belade en fungerande drill
      OCH dispatchen särskiljer noden:
        alg-tolka:begrepp      → tolkaEngine     (js/motor/ovamer/ovamer-k3.js:66;  grupp 'tolka')
        alg-skriva:kommunikation→ skrivaEngine   (js/motor/ovamer/ovamer-k3.js:723; grupp 'skriva')
        alg-berakna:rakna      → beraknaEngine   (js/motor/ovamer/ovamer-k3.js:258; grupp 'berakna')
        alg-samla:rakna        → forenklaEngine  (js/motor/ovamer/ovamer-k3.js:462; grupp 'forenkla')
      Balansmetoden (Del4, js/motor/ekvationer-balans/ekvationer-balans.js) är en verifierat
      fungerande drill MEN en bar sida utan callable engine eller deeplink → generator:null tills
      en montera-wrapper finns (nästa order). Noderna är strukturellt redo.

   ── Parenteser är fördjupning i Del3 OCH Del4 (bokens text; parsern avvisar 3(x+2) rent) →
      roll:'fordjupning', generator:null. Del6 Fördjupning: roll:'fordjupning' genomgående.

   ── Kategorierna inuti motorerna (tolka: bild/varde/skriv; forenkla: en/tva/omkrets/brak; skriva:
      text/figur/stracka) modelleras INTE som egna noder — de blir självskattnings-VARIANTER i
      modulen senare (samma mönster som k2:s mult-nod), en generator = en nod.

   Källor (lästa, EJ rörda): ak7-k3.html (delkapitel-tabellen), ak7-k3-ram.html (OMRADEN + oppnaGrupp),
   js/motor/ovamer/ovamer-k3.js (engine-namn), js/motor/ekvationer-balans/ekvationer-balans.js
   (ekvationstyper, läst), js/data/k2-taxonomi.js (fördjupnings-strandens koppling). Handskriven ren
   data — inga motorer/blad/mellanled rörda. Montera ingenting. */
window.K3_TAXONOMI = {
  "noder": [

    /* ═══════════════ Del 1 · Algebraiska uttryck (öppet) ═══════════════
       Tolka, skriva och beräkna med uttryck. Öva-mer-motorerna tolkaEngine/skrivaEngine/
       beraknaEngine är byggda (adaptiv nivå 1-3). Öva-bladet (blad-k3-d1.js) är exakt-författat. */
    {
      "id": "alg-uttryck", "namn": "Algebraiska uttryck", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Tolka och skriva uttryck med variabler, och räkna med uttryck.",
      "grupp": "algebra", "implemented": true
    },
    {
      "id": "alg-tolka", "namn": "Tolka uttryck", "parent": "alg-uttryck", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Läsa och förstå vad ett algebraiskt uttryck betyder – ur bild, situation och värde.",
      "visning": null
    },
    {
      "id": "alg-tolka:begrepp", "namn": "Tolka uttryck", "parent": "alg-tolka", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "BEGREPP", "generator": "tolkaEngine",
      "begrepp": "Tolka vad ett uttryck står för och koppla uttryck till bild och situation.",
      "visning": { "utbudslista": "k3d1", "grupp": "Algebraiska uttryck", "gruppordning": 0, "radordning": 0, "titel": "Tolka uttryck", "etikett": "begrepp", "formagaKey": "begrepp", "niva": null }
    },
    {
      "id": "alg-skriva", "namn": "Skriva uttryck", "parent": "alg-uttryck", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Översätta en situation, en text eller en figur till ett algebraiskt uttryck.",
      "visning": null
    },
    {
      "id": "alg-skriva:kommunikation", "namn": "Skriva uttryck", "parent": "alg-skriva", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "KOMMUNIKATION", "generator": "skrivaEngine",
      "begrepp": "Skriv ett uttryck som beskriver en text, figur eller sträcka med variabler.",
      "visning": { "utbudslista": "k3d1", "grupp": "Algebraiska uttryck", "gruppordning": 0, "radordning": 1, "titel": "Skriva uttryck", "etikett": "kommunikation", "formagaKey": "kommunikation", "niva": null }
    },
    {
      "id": "alg-berakna", "namn": "Beräkna med uttryck", "parent": "alg-uttryck", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Sätta in ett värde på variabeln och räkna ut uttryckets värde.",
      "visning": null
    },
    {
      "id": "alg-berakna:rakna", "namn": "Beräkna med uttryck", "parent": "alg-berakna", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "beraknaEngine",
      "begrepp": "Sätt in variabelns värde och beräkna uttryckets värde (med mellanled).",
      "visning": { "utbudslista": "k3d1", "grupp": "Algebraiska uttryck", "gruppordning": 0, "radordning": 2, "titel": "Beräkna med uttryck", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },

    /* ═══════════════ Del 2 · Mönster (kommer senare) ═══════════════
       Öva-mer-området 'monster' finns men alla grupper implemented:false (ak7-k3-ram.html:216-224).
       En oanvänd talföljds-renderare finns i blad-k3-d7.js:209 (utan data). Alla generator:null. */
    {
      "id": "alg-monster", "namn": "Mönster", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Fortsätta talföljder, välja och skapa uttryck för mönster, och räkna med dem.",
      "grupp": "algebra", "implemented": false
    },
    {
      "id": "alg-talfoljd", "namn": "Fortsätta talföljd", "parent": "alg-monster", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Se mönstret i en talföljd och fortsätta den.",
      "visning": null
    },
    {
      "id": "alg-talfoljd:resonera", "namn": "Fortsätta talföljd", "parent": "alg-talfoljd", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RESONERA", "generator": null,
      "begrepp": "Hitta mönstret och skriv de tre nästa talen i följden.",
      "visning": null
    },
    {
      "id": "alg-monster-uttryck", "namn": "Välja och skapa uttryck", "parent": "alg-monster", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Välja rätt uttryck för ett mönster och skapa ett eget uttryck som beskriver det.",
      "visning": null
    },
    {
      "id": "alg-monster-uttryck:kommunikation", "namn": "Välja och skapa uttryck", "parent": "alg-monster-uttryck", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "KOMMUNIKATION", "generator": null,
      "begrepp": "Beskriv ett mönster med ett uttryck – välj rätt eller skapa eget.",
      "visning": null
    },
    {
      "id": "alg-monster-rakna", "namn": "Räkna med uttryck ur mönster", "parent": "alg-monster", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Använda mönstrets uttryck för att räkna ut t.ex. den n:te termen.",
      "visning": null
    },
    {
      "id": "alg-monster-rakna:rakna", "namn": "Räkna med uttryck ur mönster", "parent": "alg-monster-rakna", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Räkna ut en term längre fram med mönstrets uttryck.",
      "visning": null
    },

    /* ═══════════════ Del 3 · Förenkla uttryck (sida kommer; MOTOR finns) ═══════════════
       Läs-delkapitlet saknas (ak7-k3.html:434, status soon) men forenklaEngine är FULLT byggt
       (ovamer-k3.js:462, grupp 'forenkla') → kärnnoden får generator ändå. Parenteser = fördjupning. */
    {
      "id": "alg-forenkla", "namn": "Förenkla uttryck", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Förenkla uttryck med en eller flera variabler. Parenteser som fördjupning.",
      "grupp": "algebra", "implemented": false
    },
    {
      "id": "alg-samla", "namn": "Samla lika termer", "parent": "alg-forenkla", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Förenkla uttryck genom att samla lika termer (en och flera variabler, omkrets, bråk).",
      "visning": null
    },
    {
      "id": "alg-samla:rakna", "namn": "Förenkla uttryck", "parent": "alg-samla", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": "forenklaEngine",
      "begrepp": "Samla lika termer och skriv uttrycket i enklaste form.",
      "visning": { "utbudslista": "k3d3", "grupp": "Förenkla uttryck", "gruppordning": 0, "radordning": 0, "titel": "Förenkla uttryck", "etikett": "räkna", "formagaKey": "rakna", "niva": null }
    },
    {
      "id": "alg-forenkla-parentes", "namn": "Förenkla med parentes", "parent": "alg-forenkla", "niva": "deldoman",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Multiplicera in i parentes och förenkla (tecken och siffra före parentes). Fördjupning.",
      "visning": null
    },
    {
      "id": "alg-forenkla-parentes:resonera", "namn": "Förenkla med parentes", "parent": "alg-forenkla-parentes", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": "RESONERA", "generator": null,
      "begrepp": "Lös upp parentes (tecken/siffra före) och förenkla. Fördjupning – ingen drill ännu.",
      "visning": null
    },

    /* ═══════════════ Del 4 · Ekvationer (öppet) ═══════════════
       Balansmetoden (ekvationer-balans.js) — verifierat fungerande likhetskedja, per-steg-rättning.
       Bar sida utan callable engine/deeplink → generator:null tills montera-wrapper byggs.
       Parsern klarar (verifierat): ensidig, variabel i båda led, bråk-koeff, decimal, negativa,
       uttryck i täljare. Klarar EJ 3(x+2) → parentes = fördjupning. Progression via låsta
       sektioner, INTE nivåparameter → taxonomin modellerar ekvationstyper, inte nivåer. */
    {
      "id": "alg-ekvationer", "namn": "Ekvationer", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Lösa ekvationer med balansmetoden, variabel på båda sidor, parenteser som fördjupning.",
      "grupp": "algebra", "implemented": true
    },
    {
      "id": "alg-ekv-ensidig", "namn": "Lösa ekvationer (balansmetoden)", "parent": "alg-ekvationer", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Lösa ekvationer steg för steg med balansmetoden – gör samma sak på båda sidor.",
      "visning": null
    },
    {
      "id": "alg-ekv-ensidig:rakna", "namn": "Lösa ekvationer (balansmetoden)", "parent": "alg-ekv-ensidig", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Lös ekvationer med en obekant på ena sidan (även bråk-koefficient och decimaler) med balansmetoden.",
      "visning": null
    },
    {
      "id": "alg-ekv-badaled", "namn": "Variabel på båda sidor", "parent": "alg-ekvationer", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Lösa ekvationer där variabeln står i båda leden – samla x på en sida.",
      "visning": null
    },
    {
      "id": "alg-ekv-badaled:rakna", "namn": "Variabel på båda sidor", "parent": "alg-ekv-badaled", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Lös ekvationer med variabel i båda leden genom att samla x på en sida.",
      "visning": null
    },
    {
      "id": "alg-ekv-parentes", "namn": "Parentes i ekvation", "parent": "alg-ekvationer", "niva": "deldoman",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Lösa ekvationer med parentes (tecken före parentes, siffra före parentes). Fördjupning.",
      "visning": null
    },
    {
      "id": "alg-ekv-parentes:resonera", "namn": "Parentes i ekvation", "parent": "alg-ekv-parentes", "niva": "lovnod",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": "RESONERA", "generator": null,
      "begrepp": "Lös upp parentes och lös ekvationen. Fördjupning – parsern avvisar 3(x+2), ingen drill ännu.",
      "visning": null
    },

    /* ═══════════════ Del 5 · Problemlösning (kommer senare) ═══════════════
       Öva-mer-området 'problem' finns men alla 7 grupper implemented:false (ak7-k3-ram.html:236-247).
       Alla generator:null. Formåga: PROBLEM. */
    {
      "id": "alg-problem", "namn": "Problemlösning", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Skapa ekvation från text och lösa problem med tal, vinklar och geometri.",
      "grupp": "algebra", "implemented": false
    },
    {
      "id": "alg-prob-text", "namn": "Skapa ekvation från text", "parent": "alg-problem", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Översätta en problemtext till en ekvation och lösa den.",
      "visning": null
    },
    {
      "id": "alg-prob-text:problem", "namn": "Skapa ekvation från text", "parent": "alg-prob-text", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "PROBLEM", "generator": null,
      "begrepp": "Ställ upp en ekvation ur en text (tal, olika saker, olika tal) och lös den.",
      "visning": null
    },
    {
      "id": "alg-prob-geometri", "namn": "Problem med vinklar och geometri", "parent": "alg-problem", "niva": "deldoman",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Lösa problem med vinklar och geometriska figurer (omkrets, area) med hjälp av ekvationer.",
      "visning": null
    },
    {
      "id": "alg-prob-geometri:problem", "namn": "Problem med vinklar och geometri", "parent": "alg-prob-geometri", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": "PROBLEM", "generator": null,
      "begrepp": "Ställ upp och lös ekvationer ur vinkel- och geometriproblem (omkrets, area).",
      "visning": null
    },

    /* ═══════════════ Del 6 · Fördjupning (kommer senare) ═══════════════
       roll:'fordjupning' genomgående. Kopplar mot k2:s fördjupnings-strand (brak-fordjup:
       bråk med variabler, faktorisera/bryta ut, konjugatregeln) — se rapportens delatMed-förslag.
       Bind INTE i denna order. */
    {
      "id": "alg-fordjup", "namn": "Fördjupning", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "fordjupning" }, "roll": "fordjupning", "formaga": null, "generator": null,
      "begrepp": "Utmaningar och fördjupande uppgifter – bl.a. faktorisera, bryta ut och konjugatregeln (knyter till k2:s fördjupnings-strand).",
      "grupp": "algebra", "implemented": false
    },

    /* ═══════════════ Del 7 · Plugg till prov (öppet; repetition) ═══════════════
       d7-bladet finns (blad-k3-d7.js), men innehållet är k1-repetition (prioritering, negativa
       tal, mult/div – 'stencilerna från Joachim'), inte algebra-drillar → generator:null.
       Egen omrade-nod som k2:s brak-prov. Se rapportens delatMed-förslag mot k1. */
    {
      "id": "alg-prov", "namn": "Plugg till prov", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Repetition inför provet – blandade uppgifter på hela kapitlet.",
      "grupp": "avslutning", "implemented": true
    }
  ]
};
