/* k1-sjalvskattning.js — SJÄLVSKATTNINGENS RADER för åk7 kapitel 1, per delkapitel d1–d8 (order 2026-10-08).
   Källa: Joachims Classroom-dokument "Åk 7 Taluppfattning" (Kan / Osäker / Kan ej). Radtexterna är hans,
   med stavfel rättade. Ändringar mot dokumentet: negativa tal i de fyra räknesätten struken (skattas i d3),
   temarubrikerna ersatta av delkapitlen, dubbletten "byta form bråk ↔ decimal" borttagen.
   Princip: en rad står i det delkapitel där eleven tränar den (öva, färdighetsträning eller huvudbokens
   förståelsemål) — speglar hela lärandet, inte bara öva (det är testets regel).
   Fält: id = belief-nyckel (stabil — byt aldrig, då tappar eleven sin skattning) · text · nod = evidensnod
   i K1_TAXONOMI (lista → svagaste) · delad:true = noden är grövre än raden (delad-evidens, ingen falsk
   bekräftelse) · utan nod = ren skattning · fordjupning:true = ★ · bygg = byggbehov (visas inte för eleven).
   Läses av js/karta/sjalvskattning.js (config.rader). GDPR: ren data, inget nät. */
window.K1_SJALVSKATTNING = {
  delkapitel: [
    { del: 'd1', titel: 'Positionssystem och talförståelse', rader: [
      { id: 'sj-d1-siffra-tal',     text: 'Kan skillnaden på begreppen siffra och tal', nod: 'siffror:begrepp', delad: true, bygg: 'förståelsemål — föreläsning/öva senare' },
      { id: 'sj-d1-udda-jamn',      text: 'Kan betydelsen av begreppen udda och jämna tal', nod: 'siffror:begrepp', delad: true },
      { id: 'sj-d1-ord-siffror',    text: 'Kan skriva ett tal från bokstäver till siffror', nod: 'siffror:namn' },
      { id: 'sj-d1-platsvarde',     text: 'Kan ange en siffras platsvärde', nod: 'position:begrepp', delad: true },
      { id: 'sj-d1-utvecklad',      text: 'Kan skriva ett tal i utvecklad form', nod: 'utvecklad:metod' },
      { id: 'sj-d1-tallinje',       text: 'Kan skriva ett tals värde utifrån en tallinje', nod: 'position:rakna', delad: true },
      { id: 'sj-d1-storleksordna',  text: 'Kan storleksordna tal', nod: 'position:rakna', delad: true },
      { id: 'sj-d1-oka-tiondel',    text: 'Kan öka ett tals värde med t.ex. en tiondel, så att platsvärdet ökar', nod: 'rakneträning:rakna' },
      { id: 'sj-d1-jamfor-tecken',  text: 'Kan jämföra tals storlek med tecknen > och <', nod: 'position:resonera', delad: true },
      { id: 'sj-d1-primtal',        text: 'Kan betydelsen av begreppen sammansatta tal och primtal', nod: 'primtal:begrepp' },
      { id: 'sj-d1-faktor-produkt', text: 'Kan betydelsen av begreppen faktor och produkt', nod: 'mult-begrepp:begrepp', delad: true, bygg: 'förståelsemål — föreläsning/öva senare' },
      { id: 'sj-d1-faktorisera',    text: 'Kan faktorisera en produkt', nod: 'primtal:rakna' },
      { id: 'sj-d1-faktortrad',     text: 'Kan primtalsfaktorisera med hjälp av ett faktorträd', nod: 'primtal:metod' },
      { id: 'sj-d1-delbar-2-3-5-10', text: 'Kan delbarhetsreglerna för talen 2, 3, 5 och 10', nod: 'delbarhet:rakna', delad: true },
      { id: 'sj-d1-delbar-4-9',     text: 'Kan delbarhetsreglerna för talen 4 och 9', nod: 'delbarhet:rakna', delad: true }
    ] },
    // d2: dragspel per räknesätt (ett öppet i taget). Faktor/primtal/delbarhet → d1, 10/100/1000 → d5,
    // stora/små tal → d6/d7, kompensationsmetoden → d6, negativa tal → d3.
    { del: 'd2', titel: 'De fyra räknesätten', grupper: [
      { titel: 'Addition', rader: [
        { id: 'sj-d2-term-summa',     text: 'Kan begreppen term och summa', nod: 'add-begrepp:begrepp' },
        { id: 'sj-d2-dela-termer',    text: 'Kan dela upp ett tal i flera termer', nod: 'add-begrepp:rakna', delad: true },
        { id: 'sj-d2-tiokompisar',    text: 'Kan göra enkla beräkningar med tiokompisar', nod: 'add-begrepp:rakna', delad: true },
        { id: 'sj-d2-add-decimal',    text: 'Kan göra enkla beräkningar med decimaltal', nod: 'add-rakna:rakna', delad: true },
        { id: 'sj-d2-add-uppst',      text: 'Kan göra beräkningar med uppställning i addition', nod: 'add-metoder:uppstallning' },
        { id: 'sj-d2-add-talsorter',  text: 'Kan metoden räkna talsorterna var för sig', nod: 'add-metoder:talsorterna' },
        { id: 'sj-d2-flytta-over',    text: 'Kan metoden flytta över', nod: 'add-metoder:flytta-over' }
      ] },
      { titel: 'Subtraktion', rader: [
        { id: 'sj-d2-term-differens', text: 'Kan begreppen term och differens', nod: 'sub-begrepp:begrepp' },
        { id: 'sj-d2-dela-differens', text: 'Kan dela differensen i olika termer', nod: 'sub-begrepp:rakna' },
        { id: 'sj-d2-sub-enkla',      text: 'Kan göra enkla beräkningar med subtraktion', nod: 'sub-rakna:rakna', delad: true },
        { id: 'sj-d2-sub-decimal',    text: 'Kan göra enkla beräkningar med decimaltal', nod: 'sub-rakna:rakna', delad: true },
        { id: 'sj-d2-sub-uppst',      text: 'Kan göra beräkningar med uppställning i subtraktion', nod: 'sub-metoder:uppstallning' },
        { id: 'sj-d2-oka-minska',     text: 'Kan metoden öka och minska lika', nod: 'sub-metoder:okaminska' },
        { id: 'sj-d2-bakifran',       text: 'Kan metoden addition bakifrån', nod: 'sub-metoder:bakifran' }
      ] },
      { titel: 'Multiplikation', rader: [
        { id: 'sj-d2-multtabell',     text: 'Kan multiplikationstabellen', nod: 'mult-tabell:rakna' },
        { id: 'sj-d2-mult-uppst-ental', text: 'Kan metoden uppställning med ett ental som minsta tal', nod: 'mult-metoder:uppstallning' },
        { id: 'sj-d2-mult-uppst-stora', text: 'Kan metoden uppställning med två tal som är större än 10', nod: 'mult-metoder:uppstallning-stora' },
        { id: 'sj-d2-mult-talsorter', text: 'Kan metoden talsorterna var för sig', nod: 'mult-metoder:talsorterna' },
        { id: 'sj-d2-dubbla-halvera', text: 'Kan metoden dubbla och halvera', nod: 'mult-metoder:dubbla' },
        { id: 'sj-d2-dubbelparentes', text: 'Kan metoden att dela upp i faktorer, skapa dubbelparentes', nod: ['mult-metoder:faktorer', 'mult-metoder:termer'] }
      ] },
      { titel: 'Division', rader: [
        { id: 'sj-d2-taljare-kvot',   text: 'Kan begreppen täljare, nämnare och kvot', nod: 'div-begrepp:begrepp' },
        { id: 'sj-d2-kort-division',  text: 'Kan divisionsmetoden kort division', nod: 'div-metoder:kort' },
        { id: 'sj-d2-lang-division',  text: 'Kan divisionsmetoden lång division (liggande stolen)', nod: 'div-metoder:lang' }
      ] },
      { titel: 'Prioriteringsregeln och strategier', rader: [
        { id: 'sj-d2-samband-addsub', text: 'Kan hur addition och subtraktion hänger ihop', nod: 'prio-samband:rakna', delad: true, bygg: 'förståelsemål — föreläsning/öva senare' },
        { id: 'sj-d2-samband-multdiv', text: 'Kan hur multiplikation och division hänger ihop', nod: 'prio-samband:rakna', delad: true, bygg: 'förståelsemål — föreläsning/öva senare' },
        { id: 'sj-d2-prio',           text: 'Kan göra beräkningar med prioriteringsregeln', nod: 'prio-prioritering:rakna' },
        { id: 'sj-d2-prio-visa',      text: 'Kan visa metoden för prioriteringsregeln med tydlig kommunikation', nod: 'prio-prioritering:metod' },
        { id: 'sj-d2-kommutativa',    text: 'Kan den kommutativa lagen', nod: 'prio-lagar:kommutativa' },
        { id: 'sj-d2-associativa',    text: 'Kan den associativa lagen', nod: 'prio-lagar:associativa' },
        { id: 'sj-d2-distributiva',   text: 'Kan den distributiva lagen', nod: 'prio-lagar:distributiva' }
      ] }
    ] },
    // d3: dokumentets Negativa tal-block = delkapitlet (negativa tal skattas här, inte i räknesätten).
    // Mult/div + flera faktorer tränas i d3:s Fördjupning-flik → ★.
    { del: 'd3', titel: 'Negativa tal', rader: [
      { id: 'sj-d3-motsatta',       text: 'Kan talens motsatta tal', nod: 'neg-begrepp:begrepp', delad: true },
      { id: 'sj-d3-storleksordna',  text: 'Kan storleksordna tal som är både positiva och negativa', nod: 'neg-begrepp:begrepp', delad: true },
      { id: 'sj-d3-addsub',         text: 'Kan beräkna med negativa tal i addition och subtraktion', nod: 'neg-rakna:addsub' },
      { id: 'sj-d3-multdiv',        text: 'Kan beräkna med negativa tal i multiplikation och division', nod: 'neg-rakna:multdiv', fordjupning: true },
      { id: 'sj-d3-tre-faktorer',   text: 'Kan beräkna med negativa tal med tre eller fler faktorer', nod: 'neg-rakna:multdiv', delad: true, fordjupning: true }
    ] },
    // d4: Positionssystemets bråk/decimal-rader + hela "Andel och bråk" som förståelse (inget bråk skärs).
    // Figur, blandad ↔ bråk, likvärdiga och jämföra tränas i k2 → ingen k1-evidens, ren skattning.
    // "Byta form mellan bråkform och decimalform" borttagen (dubblett av de två första raderna).
    { del: 'd4', titel: 'Bråkform och decimalform', rader: [
      { id: 'sj-d4-brak-decimal',   text: 'Kan skriva ett bråktal i decimalform', nod: 'bd-vaxla:rakna' },
      { id: 'sj-d4-blandad-decimal', text: 'Kan skriva ett tal i blandad form i decimalform', nod: 'bd-vaxla:rakna', delad: true, bygg: 'förståelse — blandad form saknas i k1:s öva' },
      { id: 'sj-d4-decimal-brak',   text: 'Kan skriva ett decimaltal som ett bråktal', nod: 'bd-tillbrak:rakna' },
      { id: 'sj-d4-figur',          text: 'Kan skriva ett bråk utifrån en figur', bygg: 'förståelse — tränas i k2 (andel och antal)' },
      { id: 'sj-d4-blandad-brak',   text: 'Kan byta form mellan blandad form och bråkform', bygg: 'förståelse — tränas i k2 (byta form)' },
      { id: 'sj-d4-forkorta',       text: 'Kan förkorta ett bråktal till enklaste form', nod: 'bd-tillbrak:rakna', delad: true },
      { id: 'sj-d4-forlanga',       text: 'Kan förlänga ett bråktal', nod: 'bd-forlang:rakna', delad: true },
      { id: 'sj-d4-likvardiga',     text: 'Kan skriva flera likvärdiga bråk', bygg: 'förståelse — tränas i k2 (förlänga och förkorta)' },
      { id: 'sj-d4-jamfora-brak',   text: 'Kan jämföra bråks storlek och storleksordna bråk', bygg: 'förståelse — tränas i k2 (jämföra bråk)' },
      { id: 'sj-d4-former-berakna', text: 'Kan göra enkla beräkningar med tal som är i bråkform, blandad form och decimalform', bygg: 'förståelse — ingen k1-träning' }
    ] },
    { del: 'd5', titel: 'Multiplikation och division med 10, 100 och 1000', rader: [
      { id: 'sj-d5-mult',           text: 'Kan göra beräkningar i multiplikation med 10, 100 och 1000', nod: 'mult-rakna:pow10' },
      { id: 'sj-d5-div',            text: 'Kan göra beräkningar i division med 10, 100 och 1000', nod: 'div-rakna:pow10' }
    ] },
    // d6: kompensationsmetoden hit (öva-gruppen "Beräkna med mellanled", 60 · 0,3).
    { del: 'd6', titel: 'Multiplikation med stora och små tal', rader: [
      { id: 'sj-d6-stora',          text: 'Kan göra beräkningar med stora tal', nod: 'mult-rakna:stora' },
      { id: 'sj-d6-sma',            text: 'Kan göra beräkningar med små tal', nod: 'mult-rakna:sma' },
      { id: 'sj-d6-stora-sma',      text: 'Kan göra beräkningar med små och stora tal', nod: 'mult-rakna:storasma' },
      { id: 'sj-d6-kompensation',   text: 'Kan kompensationsmetoden', nod: 'mult-rakna:storasma', delad: true }
    ] },
    { del: 'd7', titel: 'Division med stora och små tal', rader: [
      { id: 'sj-d7-stora',          text: 'Kan göra beräkningar i division med stora tal', nod: 'div-rakna:stora' },
      { id: 'sj-d7-stora-sma',      text: 'Kan göra beräkningar i division med stora och små tal', nod: 'div-rakna:storasma' },
      { id: 'sj-d7-forlanga',       text: 'Kan göra beräkningar i division med små tal genom att förlänga nämnaren till 1 eller till ett heltal', nod: 'div-rakna:sma' }
    ] },
    { del: 'd8', titel: 'Avrundning och överslagsräkning', rader: [
      { id: 'sj-d8-avrunda',        text: 'Kan avrunda tal till ett bestämt platsvärde', nod: 'avr-avrundning:begrepp' },
      { id: 'sj-d8-overslag-addsub', text: 'Kan göra överslagsberäkningar i addition och subtraktion', nod: 'avr-overslag:rakna', delad: true },
      { id: 'sj-d8-overslag-multdiv', text: 'Kan göra överslagsberäkningar i multiplikation och division', nod: 'avr-overslag:rakna', delad: true },
      { id: 'sj-d8-narmevarde',     text: 'Kan begreppet närmevärde', nod: 'avr-avrundning:begrepp', delad: true },
      { id: 'sj-d8-avrundningsregler', text: 'Kan avrundningsreglerna för närmevärde', nod: 'avr-avrundning:begrepp', delad: true }
    ] }
  ],
  // Tvärgående: dokumentets "Lästal och kommunikation" — förmågor som gäller alla delkapitel, inget eget.
  // Lästalen tränas i d2, d6 och d7; enkla lästal visar svagaste av räknesättens lästals-noder.
  // formaga:likhetstecken = samma id som modulens gamla belief-rad → elevens tidigare skattning finns kvar.
  tvargaende: { titel: 'Kommunikation och problemlösning', rader: [
    { id: 'sj-tv-lastal-enkla',   text: 'Kan lösa enkla lästal', nod: ['add-problem:problem', 'sub-problem:problem', 'mult-problem:problem', 'div-problem:problem'], delad: true },
    { id: 'sj-tv-lastal-avancerade', text: 'Kan lösa mer avancerade lästal' },
    { id: 'formaga:likhetstecken', text: 'Kan kommunicera med en korrekt användning av likhetstecknet' },
    { id: 'sj-tv-kommunicera',    text: 'Kan kommunicera lösningar på ett tydligt sätt' }
  ] }
};
