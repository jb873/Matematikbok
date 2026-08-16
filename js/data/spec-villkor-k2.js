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
      ] } }
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
      ] } }
    },
    'brak-sub:rakna': {           // Öva 3 G3 + Öva 4 G3 — oliknämnig subtraktion, äkta (samma nivå).
      kalla: 'Öva 3 grupp 3 (5/6−1/3 …) + Öva 4 grupp 3 (5/6−7/18 …)',
      _typindelning: 'Båda grupperna = oliknämnig subtraktion med äkta bråk. Samma svårighet, olika ' +
        'tal → ingen stege, enstegs.',
      spar: { E: {
        tak: { maxNamnare: 18, form: 'proper', maxHeltal: 0, mellanled: 'forlang' },
        kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' } }
    },

    // ── Öva 4/5 · multiplikation ─────────────────────────────────────────────────────────────
    'brak-mult-rakna:rakna': {    // Öva 4 G2 (heltal·bråk) → Öva 5 G1/G3 (bråk·bråk). STEGE.
      kalla: 'Öva 4 grupp 2 (5·4/5 …) + Öva 5 grupp 1/3 (2/3·2/7 …)',
      spar: { E: { nivaer: [
        { niva: 1, kalla: 'Öva 4 G2', beskrivning: 'Heltal · bråk',
          tak: { maxNamnare: 9, maxHeltal: 8, form: 'proper', mellanled: 'produktbrak' },
          kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical' },
        { niva: 2, kalla: 'Öva 5 G1/G3', beskrivning: 'Bråk · bråk — mellanled = OFÖRKORTAD produkt (korr. 1)',
          tak: { maxNamnare: 9, maxTaljare: 8, form: 'proper', mellanled: 'produktbrak' },
          kravs: { mellanled: true, oforkortadProdukt: true },   // korr. 1: mellanledet är den OFÖRKORTADE produkten (15/24), EJ (a·c)/(b·d)-steget
          svarform: 'enklaste', rattning: 'canonical' }
      ] } }
    },

    // ── Öva 5/6 · division (komplex-bråk) ────────────────────────────────────────────────────
    // ⑤/⑦: komplex-bråk-cell vs rak/produktbråk-cell är ett CELLVAL PER GRUPP (inställning), inte
    // en band-fråga. Bandet nedan säger bara att mellanled finns; cellformen sätts i bygget (FAS 3).
    'brak-div-hb:rakna': {        // Öva 5 G2 — heltal ÷ bråk (komplex-bråk).
      kalla: 'Öva 5 grupp 2 (5 ÷ 1/3, 7 ÷ 1/7, 6 ÷ 1/5)',
      spar: { E: {
        tak: { maxNamnare: 9, maxHeltal: 9, form: 'proper', mellanled: 'komplexbrak' },
        kravs: {}, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' } }   // ⑤: nians dok visar komplex-bråk
    },
    'brak-div-bh:rakna': {        // Öva 5 G4 — bråk ÷ heltal (komplex-bråk).
      kalla: 'Öva 5 grupp 4 ((1/5) ÷ 4, (1/3) ÷ 7, (1/8) ÷ 3)',
      spar: { E: {
        tak: { maxNamnare: 8, maxHeltal: 7, form: 'proper', mellanled: 'komplexbrak' },
        kravs: {}, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' } }
    },
    'brak-div-bb:rakna': {        // Öva 6 G1 — bråk ÷ bråk via FÖRLÄNGNING (komplex-bråk + produktbråk).
      kalla: 'Öva 6 grupp 1 ((2/7)÷(3/5), (3/4)÷(5/6), (2/3)÷(5/8))',
      spar: { E: {
        tak: { maxNamnare: 8, maxTaljare: 5, form: 'proper', mellanled: 'komplexbrak' },
        kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' } }
    },
    'brak-div-inv:rakna': {       // Öva 6 G3 — bråk ÷ bråk via INVERTERING.
      kalla: 'Öva 6 grupp 3 ((3/5)÷(1/4), (5/7)÷(2/3), (3/8)÷(5/9))',
      _cellNot: '⑦: åttans blad visar produktbråk här, nians dokument visar komplex-bråk. Cellval per ' +
        'grupp (inställning) — bandet kräver bara mellanled; cellformen (komplexbrak) sätts i FAS 3.',
      spar: { E: {
        tak: { maxNamnare: 9, maxTaljare: 5, form: 'proper', mellanled: 'produktbrak' },
        kravs: { mellanled: true }, svarform: 'enklaste', rattning: 'canonical', cellval: 'komplexbrak' } }
    },
    'brak-div-reciprok:rakna': {  // Öva 6 G2 — skriv inverterade talet (inkl algebraiskt 7x/2y).
      kalla: 'Öva 6 grupp 2 (3/5, 2/9, 7x/2y)',
      _cellNot: '⑥: den algebraiska varianten (7x/2y) får INGEN variant-generator (Joachim) — bladet ' +
        'klarar den (sträng-swap). Bandet gäller bara de numeriska.',
      spar: { E: {
        tak: { maxNamnare: 9, maxTaljare: 7, form: 'proper', mellanled: false },
        kravs: {}, svarform: 'brak', rattning: 'canonical' } }
    }

  };

  var API = { VILLKOR: VILLKOR,
    // löser upp band för (nod, spar) → PROFIL eller { nivaer:[...] }
    band: function(nod, spar){ var n = VILLKOR[nod]; return n && n.spar ? n.spar[spar || 'E'] || null : null; }
  };
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
  if(typeof window !== 'undefined') window.SPEC_VILLKOR_K2 = API;
})();
