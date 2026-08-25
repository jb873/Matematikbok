/* spec-villkor-k2.js — SPEC-VILLKOR för bråk-noderna (k2), PER SPÅR. Härlett ur öva-dokumenten.
   ─────────────────────────────────────────────────────────────────────────────────────────────
   Systerfil till js/data/spec-villkor.js (k1). Grindens andra ben: verktyg/spec-fuzz kör
   dk2-generatorerna (byggs i FAS 4) och kontrollerar varje uppgift mot nodens band här.

   BAND PER SPÅR, inte bara per årskurs (order dk2 FAS 2): E-spåret, nians och gy-fördjupningens
   sex/två/åtta dokument har OLIKA golv och tak inom SAMMA nod och delkapitel. Denna fil bär bara
   **E-bandet** (härlett ur E-spårets sex dokument, Öva 1–6). `spar.nian` / `spar.gy` fylls senare
   ur respektive dokument — de får INTE härledas ur E, och E får inte tvingas upp av dem.

   TAKREGELN: uppgifterna får aldrig bli svårare än öva-dokumentet. Öva definierar golv OCH tak.
   NIVÅ-STEG: härleds ur GRUPPSTRUKTUREN (samma mönster som nians prioritering). Där grupperna
   bildar en STEGE → nivaer[]. Där de är en TYPINDELNING (inte stigande svårighet) → _typindelning,
   noden lämnas enstegs och det RAPPORTERAS. Gissa aldrig en stege som inte finns.

   ── DATA. Ändra ett band utan att röra en generator. ──

   SCHEMA (per nod): kalla · spar:{ E: PROFIL }.  PROFIL (enstegs) eller PROFIL.nivaer:[STEG...].
   Bråk-fält i tak/kravs:
     maxNamnare/maxTaljare · form ('proper'|'oakta'|'blandad'|'valfri') · maxHeltal (blandad-del)
     mellanled (false | 'forlang' | 'produktbrak' | 'komplexbrak' | 'kompensation')
     svarform ('enklaste'|'blandad'|'decimal'|'brak'|'tecken'|'ordning')
     kravs: förkortbar(bool) · parvisOlika(n) · likhetsfall(bool) · terminerandeDecimal(bool)
     rattning ('canonical'|'equality')   // hela E-bandet = canonical (FAS 1)
*/
(function(){
  'use strict';

  var VILLKOR = {

    // ── Öva 1 · grunder ──────────────────────────────────────────────────────────────────────
    'bd-vaxla:rakna': {           // Öva 1 G1 — bråk → decimalform.  (① routing-beslut kvar: bd-* vs brak-blandad)
      kalla: 'Öva 1 grupp 1 (2/5, 3/4, 3/2, 1/5, 5/4)',
      spar: { E: {
        tak: { maxNamnare: 5, maxTaljare: 5, form: 'valfri', maxHeltal: 0, mellanled: false },
        kravs: { terminerandeDecimal: true },   // nämnare ∈ {2,4,5} → alltid avslutande decimal
        svarform: 'decimal', rattning: 'canonical' } }
    },
    'bd-tillbrak:rakna': {        // Öva 1 G5 — decimal → bråkform, enklaste form.
      kalla: 'Öva 1 grupp 5 (0,8 · 0,75 · 2,5 · 0,125 · 1,2)',
      spar: { E: {
        tak: { maxDecimaler: 3, maxVarde: 2.5, mellanled: false },   // 0,125 = 3 dec; 2,5/1,2 = >1
        kravs: {}, svarform: 'enklaste', rattning: 'canonical' },
      nian: {   // nian Åk9-spåret Öva 1 G5 — decimal + bråk i samma uttryck (byta form för att räkna)
        kalla: 'nian Öva 1 grupp 5 (0,2+2/3, 5/6+7, 1/9−0,6, 0,7−2/3)',
        tak: { maxNamnare: 12, maxTaljare: 11, maxHeltal: 9, mellanled: false },
        kravs: {}, svarform: 'enklaste', rattning: 'canonical' } }
    },
    'brak-forkorta:rakna': {      // Öva 1 G2 — förkorta till enklaste form.
      kalla: 'Öva 1 grupp 2 (8/12, 18/30, 24/32, 24/36)',
      spar: { E: {
        tak: { maxNamnare: 36, maxTaljare: 24, form: 'proper', maxHeltal: 0, mellanled: false },
        kravs: { forkortbar: true },   // MÅSTE gå att förkorta (aldrig redan enklaste form)
        svarform: 'enklaste', rattning: 'canonical' } }
    },
    'brak-forlanga:rakna': {      // Öva 1 G3 (förläng med 3) + G4 (förläng till nämnare 40).
      kalla: 'Öva 1 grupp 3 (7/9, 3/5, 8/13 · med 3) + grupp 4 (1/8, 2/5, 7/10 · till 40)',
      _typindelning: 'G3 = förläng med GIVEN FAKTOR, G4 = förläng till GIVEN NÄMNARE. Två uppgifts-' +
        'typer, inte stigande svårighet → ingen stege. Enstegs; båda formerna tillåtna i bandet.',
      spar: { E: {
        tak: { maxNamnare: 13, maxTaljare: 8, form: 'proper', maxHeltal: 0, mellanled: 'forlang' },
        kravs: { mellanled: true },   // stående (t·f)/(n·f)
        svarform: 'brak', rattning: 'canonical',
        varianter: ['medFaktor', 'tillNamnare'] } }   // två uppgiftstyper, ej nivåer
    },

    // ── Öva 2 · blandad form, jämförelse, ordning ────────────────────────────────────────────
    'brak-blandad:rakna': {       // Öva 2 G1 (blandat→oäkta) + G3 (oäkta→blandad).
      kalla: 'Öva 2 grupp 1 (6 3/5, 4 2/3, 1 5/7) + grupp 3 (11/3, 9/5, 17/4, 20/9)',
      _typindelning: 'G1 = blandat → oäkta, G3 = oäkta → blandat. Två RIKTNINGAR, inte stigande ' +
        'svårighet → ingen stege. Enstegs; båda riktningarna i bandet.',
      spar: { E: {
        tak: { maxNamnare: 9, maxTaljare: 20, maxHeltal: 6, form: 'valfri', mellanled: false },
        kravs: {}, svarform: 'valfri', rattning: 'canonical',
        varianter: ['blandatTillOakta', 'oaktaTillBlandat'] } }
    },
    'brak-jmf-lika:begrepp': {    // Öva 2 G2 (vilket störst) → G4 (tecken =,<,>). STEGE.
      kalla: 'Öva 2 grupp 2 (välj störst) + grupp 4 (tecken =,<,>, olika nämnare)',
      spar: { E: { nivaer: [
        { niva: 1, kalla: 'grupp 2', beskrivning: 'Välj det största av TVÅ bråk',
          tak: { maxNamnare: 9, form: 'proper', mellanled: false }, svarform: 'val', kravs: {}, rattning: 'canonical' },
        { niva: 2, kalla: 'grupp 4', beskrivning: 'Sätt rätt tecken =, <, > mellan två bråk (TRE-vägs)',
          tak: { maxNamnare: 30, form: 'proper', mellanled: false }, svarform: 'tecken',
          kravs: { likhetsfall: true },   // korr. 2: likheten (1/3 = 3/9) MÅSTE finnas + vara rättbar som RÄTT
          rattning: 'canonical' }
      ] },
      nian: {   // nian Åk9-spåret Öva 1 G2 — tecken TVÅvägs (> eller <), nära bråk (inga lika-par)
        kalla: 'nian Öva 1 grupp 2 (5/8·6/9, 7/13·6/12 …)',
        tak: { maxNamnare: 13, maxTaljare: 12, form: 'proper', mellanled: false },
        kravs: {}, svarform: 'tecken', rattning: 'canonical' } }
    },
    'brak-jmf-ordna:resonera': {  // Öva 2 G5 — storleksordna fyra bråk.
      kalla: 'Öva 2 grupp 5 (storleksordna 4 bråk, minsta först)',
      spar: { E: {
        tak: { antal: 4, maxNamnare: 13, form: 'valfri', mellanled: false },
        kravs: { parvisOlika: 4 },   // fyra parvis olika (aldrig lika stora eller trivialt sorterade)
        svarform: 'ordning', rattning: 'canonical' } }
    },

    // ── Öva 3 · addition och subtraktion ─────────────────────────────────────────────────────
    'brak-sub:heltal': {          // Öva 3 G1 — heltal − bråk, "se svaret" (metod-nod ④, ingen lån).
      kalla: 'Öva 3 grupp 1 (1 − 3/8, 4 − 5/6, 3 − 1 1/3)',
      spar: { E: {
        tak: { maxNamnare: 8, maxHeltal: 5, form: 'valfri', mellanled: false },   // heltal ELLER heltal−blandat
        kravs: {}, svarform: 'valfri', rattning: 'canonical' } }   // se svaret: INGET mellanled, ingen förlängning/lån
    },
    'brak-add:rakna': {           // Öva 3 G2 (oliknämnig, äkta) → Öva 4 G1 (blandad form). STEGE.
      kalla: 'Öva 3 grupp 2 (1/2+1/6 … äkta) + Öva 4 grupp 1 (4 3/8 + 1 1/4 … blandad)',
      spar: { E: { nivaer: [
        { niva: 1, kalla: 'Öva 3 G2', beskrivning: 'Oliknämnig addition, äkta bråk',
          tak: { maxNamnare: 12, form: 'proper', maxHeltal: 0, mellanled: 'forlang' },
          kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' },
        { niva: 2, kalla: 'Öva 4 G1', beskrivning: 'Addition i blandad form',
          tak: { maxNamnare: 6, form: 'blandad', maxHeltal: 5, mellanled: 'forlang' },
          kravs: { mellanled: true }, svarform: 'blandad', rattning: 'canonical' }
      ] },
      nian: { nivaer: [   // nian Åk9-spåret: G4 (oliknämnig, MINSTA gem. nämnare-mellanled) → G6 (blandad, fri kedja)
        { niva: 1, kalla: 'nian Öva 1 G4', beskrivning: 'Oliknämnig addition, mellanled = MINSTA gem. nämnare (ej förlängning); negativt svar tillåtet',
          tak: { maxNamnare: 36, maxTaljare: 11, maxHeltal: 0, maxResultNamnare: 99, form: 'proper', mellanled: 'produktbrak' },
          kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' },
        { niva: 2, kalla: 'nian Öva 1 G6', beskrivning: 'Blandade tal, addition — fri equality-kedja',
          tak: { maxNamnare: 22, maxTaljare: 22, maxHeltal: 8, maxResultNamnare: 40, form: 'blandad', mellanled: 'kedja' },
          kravs: {}, svarform: 'blandad', rattning: 'equality' }
      ] } }
    },
    'brak-sub:rakna': {           // Öva 3 G3 + Öva 4 G3 — oliknämnig subtraktion (samma nivå).
      kalla: 'Öva 3 grupp 3 (5/6−1/3 …) + Öva 4 grupp 3 (5/6−7/18, 5/4−7/6 …)',
      _typindelning: 'Båda grupperna = oliknämnig subtraktion. Samma svårighet, olika tal → ingen stege, enstegs.',
      _formNot: 'tak.form = OPERANDENS form (ej svarets — det styrs av separata svarform). Öva 4 G3 har en OÄKTA ' +
        'operand (5/4), så operanden får vara äkta ELLER oäkta ("valfri" + maxHeltal:0 ⇒ aldrig blandat). ' +
        'svarform ("enklaste") är OBERÖRD av denna ändring — 7/6 kan aldrig passera som svar där enklaste form gäller.',
      spar: { E: {
        tak: { maxNamnare: 18, maxTaljare: 7, form: 'valfri', maxHeltal: 0, mellanled: 'forlang' },   // form=operand: äkta/oäkta, ej blandat (maxHeltal 0)
        kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' },
      nian: { nivaer: [   // nian Åk9-spåret: G4 (oliknämnig, MINSTA gem. nämnare) → G6 (blandad, fri kedja)
        { niva: 1, kalla: 'nian Öva 1 G4', beskrivning: 'Oliknämnig subtraktion, mellanled = MINSTA gem. nämnare; negativt svar tillåtet',
          tak: { maxNamnare: 36, maxTaljare: 11, maxHeltal: 0, maxResultNamnare: 99, form: 'proper', mellanled: 'produktbrak' },
          kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' },
        { niva: 2, kalla: 'nian Öva 1 G6', beskrivning: 'Blandade tal, subtraktion — fri equality-kedja',
          tak: { maxNamnare: 22, maxTaljare: 22, maxHeltal: 8, maxResultNamnare: 40, form: 'blandad', mellanled: 'kedja' },
          kravs: {}, svarform: 'blandad', rattning: 'equality' }
      ] } }
    },

    // ── Öva 4/5 · multiplikation ─────────────────────────────────────────────────────────────
    'brak-mult-rakna:rakna': {    // Öva 4 G2 (heltal·bråk, MED mellanled) → Öva 5 G1/G3 (bråk·bråk, UTAN mellanled). STEGE.
      kalla: 'Öva 4 grupp 2 (5·4/5 …) + Öva 5 grupp 1/3 (2/3·2/7 …)',
      spar: { E: { nivaer: [
        { niva: 1, kalla: 'Öva 4 G2', beskrivning: 'Heltal · bråk — rubrik "visa mellanled" → mellanled = OFÖRKORTAD produkt (H·t)/n',
          tak: { maxNamnare: 9, maxHeltal: 8, form: 'proper', mellanled: 'produktbrak' },
          kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' },
        { niva: 2, kalla: 'Öva 5 G1/G3', beskrivning: 'Bråk · bråk — mellanled = OFÖRKORTAD produkt (15/24, korr. 1, Joachim-' +
            'bekräftad). EJ multiplikationssteget (5·3)/(6·4). Rubrikens "Behövs inget mellanled" syftar på steget, ej mellanledet.',
          tak: { maxNamnare: 9, maxTaljare: 8, form: 'proper', mellanled: 'produktbrak' },
          kravs: { mellanled: true, oforkortadProdukt: true },   // exakt oförkortad produkt, ej värde-rättning
          svarform: 'enklaste', rattning: 'canonical' }
      ] },
      nian: { nivaer: [   // nian Åk9-spåret: G1 (heltal·bråk) → G2 (bråk·bråk + blandade)
        { niva: 1, kalla: 'nian Öva 2 G1', beskrivning: 'Heltal · bråk, ett mellanled = OFÖRKORTAD produkt (H·t)/n',
          tak: { maxNamnare: 13, maxTaljare: 12, maxMultiplikator: 8, form: 'proper', mellanled: 'produktbrak' },
          kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' },
        { niva: 2, kalla: 'nian Öva 2 G2', beskrivning: 'Bråk · bråk (+ blandade tal via oäkta form), mellanled = OFÖRKORTAD produkt',
          tak: { maxNamnare: 9, maxTaljare: 8, maxHeltal: 5, maxResultNamnare: 45, form: 'valfri', mellanled: 'produktbrak' },
          kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' }
      ] } }
    },

    // ── Öva 5/6 · division (komplex-bråk) ────────────────────────────────────────────────────
    // ⑤/⑦: komplex-bråk-cell vs rak/produktbråk-cell är ett CELLVAL PER GRUPP (inställning), inte
    // en band-fråga. Bandet nedan säger bara att mellanled finns; cellformen sätts i bygget (FAS 3).
    'brak-div-hb:rakna': {        // Öva 5 G2 — heltal ÷ bråk (komplex-bråk).
      kalla: 'Öva 5 grupp 2 (5 ÷ 1/3, 7 ÷ 1/7, 6 ÷ 1/5)',
      spar: { E: {
        tak: { maxNamnare: 9, maxHeltal: 9, form: 'proper', mellanled: 'komplexbrak' },
        kravs: {}, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' },   // ⑤: nians dok visar komplex-bråk
      nian: {   // nian Åk9-spåret Öva 2 G6 — heltal ÷ bråk (komplex-bråk), direkt svar (inget mellanled)
        kalla: 'nian Öva 2 grupp 6 (4/(1/5), 7/(1/6), 2/(3/4), 12/(4/7))',
        tak: { maxNamnare: 9, maxTaljare: 8, maxMultiplikator: 12, maxResultNamnare: 72, form: 'proper', mellanled: false },
        kravs: {}, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' } }
    },
    'brak-div-bh:rakna': {        // Öva 5 G4 — bråk ÷ heltal (komplex-bråk).
      kalla: 'Öva 5 grupp 4 ((1/5) ÷ 4, (1/3) ÷ 7, (1/8) ÷ 3)',
      spar: { E: {
        tak: { maxNamnare: 8, maxHeltal: 7, form: 'proper', mellanled: 'komplexbrak' },
        kravs: {}, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' },
      nian: {   // nian Åk9-spåret Öva 2 G3 — bråk ÷ heltal (komplex-bråk), direkt svar (inget mellanled)
        kalla: 'nian Öva 2 grupp 3 ((1/5)/2, (1/7)/8, (2/7)/3, (7/9)/2)',
        tak: { maxNamnare: 9, maxTaljare: 8, maxMultiplikator: 8, maxResultNamnare: 72, form: 'proper', mellanled: false },
        kravs: {}, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' } }
    },
    'brak-div-bb:rakna': {        // Öva 6 G1 — bråk ÷ bråk via FÖRLÄNGNING (komplex-bråk + produktbråk).
      kalla: 'Öva 6 grupp 1 ((2/7)÷(3/5), (3/4)÷(5/6), (2/3)÷(5/8))',
      spar: { E: {
        tak: { maxNamnare: 8, maxTaljare: 5, form: 'proper', mellanled: 'komplexbrak' },
        kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' },
      nian: {   // nian Åk9-spåret Öva 2 G7 — bråk ÷ bråk via FÖRLÄNGNING (mellanled = produktbråk)
        kalla: 'nian Öva 2 grupp 7 ((4/5)/(2/3), (3/7)/(5/8))',
        tak: { maxNamnare: 8, maxTaljare: 5, maxResultNamnare: 40, form: 'proper', mellanled: 'produktbrak' },
        kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' } }
    },
    'brak-div-inv:rakna': {       // Öva 6 G3 — bråk ÷ bråk via INVERTERING.
      kalla: 'Öva 6 grupp 3 ((3/5)÷(1/4), (5/7)÷(2/3), (3/8)÷(5/9))',
      _cellNot: '⑦: åttans blad visar produktbråk här, nians dokument visar komplex-bråk. Cellval per ' +
        'grupp (inställning) — bandet kräver bara mellanled; cellformen (komplexbrak) sätts i FAS 3.',
      spar: { E: {
        tak: { maxNamnare: 9, maxTaljare: 5, form: 'proper', mellanled: 'produktbrak' },
        kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' },
      nian: { nivaer: [   // nian Åk9-spåret: G8 (bråk ÷ bråk via invertering) → G9 (invertering + förenkla, fri kedja)
        { niva: 1, kalla: 'nian Öva 2 G8', beskrivning: 'Bråk ÷ bråk via invertering (mellanled = produktbråk)',
          tak: { maxNamnare: 8, maxTaljare: 5, maxResultNamnare: 40, form: 'proper', mellanled: 'produktbrak' },
          kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' },
        { niva: 2, kalla: 'nian Öva 2 G9', beskrivning: 'Invertering + förenkla innan multiplikation — fri equality-kedja',
          tak: { maxNamnare: 22, maxTaljare: 22, maxHeltal: 8, maxResultNamnare: 40, form: 'valfri', mellanled: 'kedja' },
          kravs: {}, svarform: 'enklaste', rattning: 'equality' }
      ] } }
    },
    'brak-div-reciprok:rakna': {  // Öva 6 G2 — skriv inverterade talet (inkl algebraiskt 7x/2y).
      kalla: 'Öva 6 grupp 2 (3/5, 2/9, 7x/2y)',
      _cellNot: '⑥: den algebraiska varianten (7x/2y) får INGEN variant-generator (Joachim) — bladet ' +
        'klarar den (sträng-swap). Bandet gäller bara de numeriska.',
      spar: { E: {
        tak: { maxNamnare: 9, maxTaljare: 7, form: 'proper', mellanled: false },
        kravs: {}, svarform: 'brak', rattning: 'canonical' },
      nian: {   // nian Åk9-spåret Öva 2 G5 — invertera talet (numeriskt; algebraiska 5x/y, 2x/xy^3 är FASTA)
        kalla: 'nian Öva 2 grupp 5 (3/7 numeriskt; 5x/y, 2x/xy^3 fasta)',
        tak: { maxNamnare: 9, maxTaljare: 7, form: 'proper', mellanled: false },
        kravs: {}, svarform: 'brak', rattning: 'canonical' } }
    },

    // ── nian Åk9-spåret · noder utan E-motsvarighet (nian-only band) ──────────────────────────
    'brak-jmf-narmevarde:resonera': {   // nian Öva 1 G1 — storleksordna med närmevärde (avrundningsregel).
      kalla: 'nian Öva 1 grupp 1 (3/11, 2/9, 4/12, 9/31, 32/111)',
      spar: { nian: {
        tak: { antal: 5, maxNamnare: 120, maxTaljare: 120, form: 'proper', mellanled: false },
        kravs: { parvisOlika: 5, fonster: 0.12, fonsterMin: 0.075, minGap: 0.010 },   // fem NÄRA bråk: spridning 0,075–0,12
        // fonster (max 0,12): nära nog att exakt jämförelse är omständlig. fonsterMin (0,075) + minGap (0,010):
        // ej KLUSTRADE — klustrade bråk avrundas till samma närmevärde = SVÅRARE än orig (metoden slutar hjälpa).
        svarform: 'ordning', rattning: 'canonical' } }
    },
    'brak-mgn:rakna': {   // nian Öva 1 G3 — skriv båda bråken med MINSTA gemensamma nämnare.
      kalla: 'nian Öva 1 grupp 3 (11/18·7/24, 7/8·5/12, 5/27·11/36, 31/64·13/24)',
      spar: { nian: {
        tak: { maxNamnare: 64, maxTaljare: 63, maxResultNamnare: 192, form: 'proper', mellanled: false },
        kravs: { gemensamFaktor: true },   // nämnarna delar en gemensam faktor (minsta gem. nämnare < produkt); svarsnämnare ≤ 192
        svarform: 'mgn', rattning: 'canonical' } }   // två celler, båda bråken över MINSTA gem. nämnaren; ej-minsta underkänns
    },
    'brak-lana:rakna': {   // nian Öva 1 G6 sista — blandad subtraktion med LÅN (fri kedja).
      kalla: 'nian Öva 1 grupp 6 d (5 5/9 − 2 11/12)',
      spar: { nian: {
        tak: { maxNamnare: 22, maxTaljare: 22, maxHeltal: 8, maxResultNamnare: 40, form: 'blandad', mellanled: 'kedja' },
        kravs: { lan: true }, svarform: 'blandad', rattning: 'equality' } }
    },
    'brak-mult-forkorta:rakna': {   // nian Öva 2 G4 — förkorta innan multiplikation (fri kedja).
      kalla: 'nian Öva 2 grupp 4 (5/27·9/15 … 3 3/5·1 1/9·2 1/2)',
      spar: { nian: {
        tak: { maxNamnare: 22, maxTaljare: 22, maxHeltal: 8, maxResultNamnare: 40, form: 'valfri', mellanled: 'kedja' },
        kravs: { forkortbar: true }, svarform: 'enklaste', rattning: 'equality' } }
    }

  };

  var API = { VILLKOR: VILLKOR,
    // löser upp band för (nod, spar) → PROFIL eller { nivaer:[...] }
    band: function(nod, spar){ var n = VILLKOR[nod]; return n && n.spar ? n.spar[spar || 'E'] || null : null; }
  };
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
  if(typeof window !== 'undefined') window.SPEC_VILLKOR_K2 = API;
})();
