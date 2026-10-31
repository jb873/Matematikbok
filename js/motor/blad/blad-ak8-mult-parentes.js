/* blad-ak8-mult-parentes.js — ÅTTANS DELKAPITEL 3, DEL 2: "Multiplikation med parentes".
   Order v3 2026-10-26: nivå 1 som pilot. Order 2026-10-31: nivå 2, 3 och Fördjupning, efter att
   eleverna prövat nivå 1.

   KÄLLA: Multiplikation med parentes.docx, 923 773 byte, md5 d940806229c9616123050f6d1d5fe110.
   Ordern angav 923 769 byte och md5 e51976a7f8e9…; Joachim bekräftade filen 2026-10-26. Nivå 1, 2, 3
   och Fördjupning, tolv bilder. Uppgifterna och rubrikerna är Joachims, ordagrant. Meta-texten
   ("(ett mellanled ska finnas här)", "Skapa två uppgifter utifrån bilden" …) är instruktion och
   står inte här.

   MELLANLEDET (Joachim 2026-10-26): parenteserna borttagna, varje produkt uträknad, inget
   hopslaget — 7 + 2(3x + 5) → 7 + 6x + 10 → 6x + 17. Ledet krävs bara där det SKILJER SIG från
   svaret, och FLAGGAN RÄKNAS UR UTTRYCKET med MellanledRattare.kravAv, här i datan och aldrig ur
   rubriken. 6(x + 7) → 6x + 42 får därför inget led: det hade varit en kopia av svaret.

   FÖRSTÅELSETRÄNING loggas inte (para ihop), med skälet i datan, som i del 1.

   ── DE GODKÄNDA TALEN (bokens bilder ersatta — läs aldrig en bokfigur igen) ──────────────────
   NIVÅ 1 (godkända 2026-10-26)
     B1     rektanglarna 7 × (x + 4) och 12 × (3x + 2)               facit  7x + 28 · 36x + 24
     lucka  ▢ (2x − 5) = 6x − 15                                     facit  3
            10x + 12 = ▢ (2x + 3) + 2x                               facit  4   (Joachim ändrade den
                                                                     andra så att svaren skiljer sig)
     B2·1   prislappar: suddgummi x kr, anteckningsbok (x + 12) kr
            tre suddgummin och två anteckningsböcker                 3x + 2(x + 12) → 3x + 2x + 24 → 5x + 24
     B2·2   Lina handlar för 4(x + 12) + 2x kr                       a) 2 suddgummin och 4 anteckningsböcker
                                                                     b) 4(8 + 12) + 2 · 8 = 96 kr
     B3     para ihop 6a(b + 3) · 6a(b − 3) · 6a(3b + 3)
            mot 18ab + 18a · 6ab + 18a · 6ab − 18a                   facit  6ab + 18a · 6ab − 18a · 18ab + 18a
   NIVÅ 2 (godkända 2026-10-26)
     B4     delad rektangel x · (x + 5): A) x² + 5x B) 5x + 25 C) x² + 5 D) 2x + 5     facit  A
            delad rektangel x · (x + 3): A) 4x² + 6 B) x² + 3x C) 4x + 6 D) 4x²        facit  C
     B5a    nedre 2x + y, ▢, ▢ · mitten 3(x + y), ▢ · toppen 4(2x + y)   facit  x + 2y · 4x − y · 5x + y
     B5b    nedre 6x, ▢, 3(x + 1), ▢ · rad 2: 2(4x − 1), ▢, 5x · rad 3: ▢, ▢ · toppen ▢
                                                         facit  2x − 2 · 2x − 3 · 5x + 1 · 13x − 1 · 10x + 1 · 23x
     B6     omkretsen 2a + 2b + 8: A) a(b + 4) B) 2(a + b) C) b(4 + a)  facit  A och C (Joachim bytte B)
   NIVÅ 3 (godkända 2026-10-26)
     B7     A: botten 5x, höger 3x, urtaget x brett och 2x djupt        facit  20x · 13x²
            B: topp 3c, vänster 7c, botten 9c, höger 2c                 facit  32c · 33c²
            C: botten 6a, sida 2a, sned sida 3,2a (Joachim: duger)      facit  16,4a · 9a²
     B8     a) x + 4, 3x + 1, −(x + 5)   b) x − 3, 2x − 5, −(x − 4)   c) 4x − 5, x − 2, −(3x − 1)
            d) x, x + 5, ▢ med 3x + 2 i mittenraden
                         facit  a) 4x + 5 · 2x − 4 · 6x + 1  b) 3x − 8 · x − 1 · 4x − 9
                                c) 5x − 7 · −2x − 1 · 3x − 8  d) 2x − 3 · 2x + 5 · 5x + 7
     B9     yttre (2a + b) × a, hålet (a − b) × 2b              facit  2ab − 2b² · 2a² − ab + 2b²
     B10    yttre (a + 3b) × b, hålet 2b × (b − a)              facit  3ab + b²
   FÖRDJUPNING (godkända 2026-10-26)
     B11    delad i fyra, höjderna x och 3, bredderna x och 5   facit  x² + 8x + 15
     B12    yttre kvadrat (x + 5), hålet (x − 3)                facit  16x + 16

   NIVÅANTALET kommer ur bandet (band-ak8-alg3.js, multiplicera.nivaer: tre steg), begränsat till de
   nivåer som är BYGGDA — ett steg utan uppgifter vore en knapp in i tomhet. Fördjupningen är ett
   eget blad (bandets avsnitt fordjupning, en nivå) och får ingen nivårad. */
(function(){
  'use strict';
  var F = window.SvgAlgebraFigur, ML = window.MellanledRattare, BAND = window.BAND_AK8_ALG3;
  var NOD_MULT    = 'alg-multiplicera-parentes:rakna';
  var NOD_TVA     = 'alg-multiplicera-tva-parenteser:rakna';
  var NOD_RAKNA   = 'alg-forenkla-parentes:rakna';      // del 1:s nod — B8:s pyramider är minus framför parentes
  var NOD_PROBLEM = 'alg-forenkla-parentes:problem';

  // Kravet ur uttrycket: 'kravt' där ledet skiljer sig från svaret, annars 'nej' (ingen ledruta).
  function krav(u){ return (ML && ML.kravAv(u)) || 'nej'; }
  /* MINUS FRAMFÖR EN PRODUKT AV TVÅ PARENTESER: ett led räcker, och "+ led" ger fler (Joachim
     2026-10-26). Räknat ur uttrycket, som kravet: "… − (3x − 4)(2x − 4)". */
  function minusForeProdukt(u){ return /[-−]\s*\([^()]*\)\s*\(/.test(u); }
  function p(uttryck, svar, vars, extra){
    var r = { typ: 'parentes', uttryck: uttryck, svar: svar, vars: vars || 'x', mellanled: krav(uttryck) };
    if(minusForeProdukt(uttryck)) r.extraLed = true;
    if(extra) Object.keys(extra).forEach(function(k){ r[k] = extra[k]; });
    return r;
  }
  // Skriv + förenkla med uppställningen i datan (R1, två rutor; ledet där det skiljer sig).
  function sf(skriv, svar, vars, extra){
    var r = { typ: 'skrivforenkla', vars: vars, skriv: skriv, svar: svar, mellanled: krav(skriv) };
    if(minusForeProdukt(skriv)) r.extraLed = true;
    if(extra) Object.keys(extra).forEach(function(k){ r[k] = extra[k]; });
    return r;
  }
  // Pyramidens rubrik är del 1:s godkända, utan exempelmeningen (Joachim 2026-10-26).
  var PYRAMID = 'Fyll i de tomma rutorna. Varje ruta är summan av de två rutorna under.';
  // Gruppens flagga ur raderna — den som mellanledsvakten läser (data-mellanled på gruppen).
  function grupp(g){
    if(g.rader.some(function(r){ return r.mellanled === 'kravt'; })) g.mellanled = 'kravt';
    return g;
  }
  var PRISER = [{ namn: 'Suddgummi', pris: 'x kr' }, { namn: 'Anteckningsbok', pris: '(x + 12) kr' }];
  var PAR = ['18ab + 18a', '6ab + 18a', '6ab − 18a'];

  var NIVA1 = {
    titel: 'Multiplikation med parentes – nivå 1',
    grupper: [

      // 1 ── led = svar överallt: ingen ledruta ─────────────────────────────────────────────
      grupp({ rubrik: 'Multiplicera in i parentesen', logg: NOD_MULT, rader: [
        p('6(x + 7)',  '6x + 42'),
        p('4(x - 8)',  '4x - 32'),
        p('5(3x + 3)', '15x + 15'),
        p('9(4x - 7)', '36x - 63')
      ]}),

      // 2 ── ledet skiljer sig från svaret: krävt ───────────────────────────────────────────
      grupp({ rubrik: 'Multiplicera in i parentesen och förenkla uttrycket', logg: NOD_MULT, rader: [
        p('7 + 2(3x + 5)',          '6x + 17'),
        p('6(3x - 6) - (5x + 4)',   '13x - 40'),
        p('4x + 5(2x - 9) + 13',    '14x - 32'),
        p('6x + 2(8 - 2x) + 3x - 5','5x + 11')
      ]}),

      // 3 ── B1: rektanglarnas area. Uppställningen visas aldrig (R2); två rutor (R1). ───────
      grupp({ rubrik: 'Skriv ett uttryck för rektanglarnas area och förenkla det', logg: NOD_MULT, rader: [
        { typ: 'skrivforenkla', vars: 'x', svg: F ? F.rektangel({ bredd: '7', hojd: 'x + 4' }) : '',
          skriv: '7(x + 4)', svar: '7x + 28', mellanled: krav('7(x + 4)') },
        { typ: 'skrivforenkla', vars: 'x', svg: F ? F.rektangel({ bredd: '12', hojd: '3x + 2' }) : '',
          skriv: '12(3x + 2)', svar: '36x + 24', mellanled: krav('12(3x + 2)') }
      ]}),

      // 4 ── luckan (Joachims tal: svaren skiljer sig) ──────────────────────────────────────
      grupp({ rubrik: 'Vad ska stå i rutan för att likheten ska gälla?', logg: NOD_MULT, rader: [
        { typ: 'lucka', text: '__ (2x − 5) = 6x − 15', svar: 3 },
        { typ: 'lucka', text: '10x + 12 = __ (2x + 3) + 2x', svar: 4 }
      ]}),

      // 5 ── B2·1: prislapparna. Uttrycket skrivs av eleven (R2), ledet krävs. ──────────────
      grupp({ rubrik: 'Skriv ett uttryck för vad tre suddgummin och två anteckningsböcker kostar sammanlagt och förenkla det.',
        logg: NOD_PROBLEM, rader: [
        // Prislapparna på SAMMA rad som rutorna: rubriken ber om skriv + förenkla, och en egen
        // figurrad utan rutor läses som en uppgift utan svar (uppgift-grind K-C).
        { typ: 'skrivforenkla', vars: 'x', svg: F ? F.prislappar({ varor: PRISER }) : '',
          skriv: '3x + 2(x + 12)', svar: '5x + 24', mellanled: krav('3x + 2(x + 12)') }
      ]}),

      // 6 ── B2·2: Lina. Uttrycket står i uppgiften — det är att TOLKA det som prövas. ───────
      // Uttrycket i rubriken hålls ihop med hårda mellanslag: vid 1366 bröts det mellan "4(x" och
      // "+ 12)", och då läses det som två uttryck.
      grupp({ rubrik: 'Lina köper suddgummin och anteckningsböcker för sammanlagt 4(x + 12) + 2x kr.',
        logg: NOD_PROBLEM, rader: [
        { typ: 'svgfigur', svg: F ? F.prislappar({ varor: PRISER }) : '' },
        { typ: 'lucka', fraga: 'Hur många suddgummin och hur många anteckningsböcker köper Lina?',
          text: '__ suddgummin och __ anteckningsböcker', svar: [2, 4] },
        // Beräkna-kedjan på det givna uttrycket: ersätt x med 8, räkna, svara.
        { typ: 'berakna', vars: 'x', fraga: 'Beräkna hur mycket hon ska betala om ett suddgummi kostar 8 kr.',
          uttryck: '4(x + 12) + 2x', x: 8, svar: 96, enhet: 'kr' }
      ]}),

      // 7 ── B3: förståelseträning, para ihop. Loggas inte. ─────────────────────────────────
      { rubrik: 'Para ihop uttrycken med rätt alternativ',
        loggarEj: 'förståelseträning: eleven matchar givna uttryck i stället för att räkna, färdigheten mäts inte här',
        rader: [
          { typ: 'val', fraga: '6a(b + 3)',  alternativ: PAR, svar: '6ab + 18a' },
          { typ: 'val', fraga: '6a(b − 3)',  alternativ: PAR, svar: '6ab − 18a' },
          { typ: 'val', fraga: '6a(3b + 3)', alternativ: PAR, svar: '18ab + 18a' }
        ]}
    ]
  };

  // ══════════════════════════ NIVÅ 2 ══════════════════════════
  // Negativ faktor framför, två parenteser i rad, bråk i parentesen, flerval, pyramid.
  var NIVA2 = {
    titel: 'Multiplikation med parentes – nivå 2',
    grupper: [

      // 1 ── dokumentets ordalydelse ("uttrycken") ──────────────────────────────────────────
      grupp({ rubrik: 'Förenkla uttrycken', logg: NOD_MULT, rader: [
        p('15x + 5(2x - 5) - 4x',  '21x - 25'),
        p('6x - 3(4x + 3)',        '-6x - 9'),
        p('8y - 3(2 - 2y)',        '14y - 6', 'y'),
        p('8(3x - 5) + 2(2x + 4)', '28x - 32')
      ]}),

      // 2–3 ── B4: delad rektangel, flerval. Räknas som figur och loggas (som del 1 uppgift 5). ─
      { rubrik: 'Vilket av uttrycken representerar rektangelns area?', logg: NOD_MULT, rader: [
        { typ: 'valruta', svg: F ? F.deladRektangel({ hojder: ['x'], bredder: ['x', '5'] }) : '',
          alt: ['x² + 5x', '5x + 25', 'x² + 5', '2x + 5'], ratt: ['x² + 5x'] }
      ]},
      { rubrik: 'Vilket av uttrycken representerar rektangelns omkrets?', logg: NOD_MULT, rader: [
        { typ: 'valruta', svg: F ? F.deladRektangel({ hojder: ['x'], bredder: ['x', '3'] }) : '',
          alt: ['4x² + 6', 'x² + 3x', '4x + 6', '4x²'], ratt: ['4x + 6'] }
      ]},

      // 4 ── två parenteser i rad, negativ faktor ───────────────────────────────────────────
      grupp({ rubrik: 'Förenkla uttrycket', logg: NOD_MULT, rader: [
        p('6(8x + 9) - 4(2x + 9)',  '40x + 18'),
        p('-8(4x + 7) - 3(4x - 7)', '-44x - 35')
      ]}),

      // 5 ── B5: pyramider med parentes. Inga led (Joachim). Kontrollräknat ruta för ruta:
      //   a)  3(x + y) = (2x + y) + ? → x + 2y · 4(2x + y) = 3(x + y) + ? → 5x + y · (x + 2y) + ? = 5x + y → 4x − y
      //   b)  2(4x − 1) = 6x + ? → 2x − 2 · ? = (2x − 2) + 3(x + 1) → 5x + 1 · 5x = 3(x + 1) + ? → 2x − 3
      //       2(4x − 1) + (5x + 1) = 13x − 1 · (5x + 1) + 5x = 10x + 1 · toppen 23x
      { rubrik: PYRAMID, logg: NOD_MULT, rader: [
        { typ: 'pyramid', vars: 'xy', rader: [
          [{ fast: '4(2x + y)' }],
          [{ fast: '3(x + y)' }, { svar: '5x + y' }],
          [{ fast: '2x + y' }, { svar: 'x + 2y' }, { svar: '4x - y' }]
        ] },
        { typ: 'pyramid', vars: 'x', rader: [
          [{ svar: '23x' }],
          [{ svar: '13x - 1' }, { svar: '10x + 1' }],
          [{ fast: '2(4x - 1)' }, { svar: '5x + 1' }, { fast: '5x' }],
          [{ fast: '6x' }, { svar: '2x - 2' }, { fast: '3(x + 1)' }, { svar: '2x - 3' }]
        ] }
      ]},

      // 6 ── B6: förståelseträning, flerval. Valet rättas; motiveringen är borttagen (Joachim).
      // B) är 2(a + b) (Joachim): 4(a + b) hade sidor som också ger omkretsen. Facit A och C.
      { rubrik: 'Omkretsen av en rektangel kan skrivas 2a + 2b + 8. Vilket eller vilka av uttrycken kan vara rektangelns area?',
        loggarEj: 'förståelseträning: eleven väljer mellan givna uttryck i stället för att räkna, färdigheten mäts inte här',
        rader: [
          { typ: 'valruta', flera: true, alt: ['a(b + 4)', '2(a + b)', 'b(4 + a)'], ratt: ['a(b + 4)', 'b(4 + a)'] }
        ]},

      // 7 ── bråk i parentesen: a) ledet = svaret → ingen ledruta, b) ledet krävs ─────────────
      grupp({ rubrik: 'Multiplicera in i parentesen och förenkla uttrycket', logg: NOD_MULT, rader: [
        p('8(x/3 - 2)',       '8x/3 - 16',  'x', { brak: true }),
        p('7(x/4 + 1) - 3x',  '-5x/4 + 7',  'x', { brak: true })
      ]})
    ]
  };

  // ══════════════════════════ NIVÅ 3 ══════════════════════════
  // Variabel framför parentesen, kvadrattermer, tre parenteser, figur, pyramid med −(…), hålfigur.
  var NIVA3 = {
    titel: 'Multiplikation med parentes – nivå 3',
    grupper: [

      // 1 ── tre parenteser ────────────────────────────────────────────────────────────────
      grupp({ rubrik: 'Förenkla uttrycket', logg: NOD_MULT, rader: [
        p('5(3 + 4x) - 7x - 2(6 - 2x)', '17x + 3'),
        p('5(2y + 8) - 6(2y - 3) - 3y', '-5y + 58', 'y')
      ]}),

      // 2–4 ── B7: figurerna A, B och C med egna mått. "Skriv ett förenklat uttryck" = två rutor
      // (Joachim): uppställningen och förenklingen. Sidorna är delvis omärkta i figurerna — eleven
      // räknar ut dem — så uppställningen rättas på VÄRDE, inte mot en sidlista (sammaTermer hade
      // krävt att eleven gissar de omärkta sidornas längder var för sig).
      //   A  botten 5x, höger 3x, urtaget x brett och 2x djupt: omkrets 20x, area 5x · 3x − x · 2x = 13x²
      //   B  topp 3c, vänster 7c, botten 9c, höger 2c: omkrets 32c, area 3c · 7c + 6c · 2c = 33c²
      //   C  botten 6a, sida 2a, sned sida 3,2a: omkrets 16,4a, area 6a · 2a − 6a · a/2 = 9a²
      { rubrik: 'Skriv ett förenklat uttryck för figurens omkrets och area', logg: NOD_MULT, rader: [
        sf('5x + 3x + 2x + 2x + x + 2x + 2x + 3x', '20x', 'x',
          { fraga: 'Omkrets', svg: F ? F.ufigur({ sidor: ['', '', 'x', '2x', '', '3x', '5x', ''] }) : '' }),
        sf('5x · 3x - x · 2x', '13x²', 'x', { fraga: 'Area' })
      ]},
      { rubrik: 'Skriv ett förenklat uttryck för figurens omkrets och area', logg: NOD_MULT, rader: [
        sf('3c + 5c + 6c + 2c + 9c + 7c', '32c', 'c',
          { fraga: 'Omkrets', svg: F ? F.lfigur({ sidor: ['3c', '', '', '2c', '9c', '7c'], urtag: 'uppe' }) : '' }),
        sf('3c · 7c + 6c · 2c', '33c²', 'c', { fraga: 'Area' })
      ]},
      { rubrik: 'Skriv ett förenklat uttryck för figurens omkrets och area', logg: NOD_MULT, rader: [
        sf('3,2a + 3,2a + 2a + 6a + 2a', '16,4a', 'a',
          { fraga: 'Omkrets', svg: F ? F.triangelurtag({ sidor: ['', '3,2a', '2a', '6a', ''] }) : '' }),
        sf('6a · 2a - 6a · a/2', '9a²', 'a', { fraga: 'Area' })
      ]},

      // 5 ── variabel framför parentesen ───────────────────────────────────────────────────
      grupp({ rubrik: 'Förenkla uttrycket', logg: NOD_MULT, rader: [
        p('3b(5a + 7) - 3b(a - 1)',  '12ab + 24b', 'ab'),
        p('5(3y + 7xy) - y(7x + 12)', '28xy + 3y', 'xy')
      ]}),

      // 6 ── B8: fyra pyramider med −(…) i nedre raden. Del 1:s nod: det är minus framför
      // parentes som prövas. Kontrollräknat:
      //   a) (x + 4) + (3x + 1) = 4x + 5 · (3x + 1) − (x + 5) = 2x − 4 · toppen 6x + 1
      //   b) (x − 3) + (2x − 5) = 3x − 8 · (2x − 5) − (x − 4) = x − 1 · toppen 4x − 9
      //   c) (4x − 5) + (x − 2) = 5x − 7 · (x − 2) − (3x − 1) = −2x − 1 · toppen 3x − 8
      //   d) x + (x + 5) = 2x + 5 · 3x + 2 = (x + 5) + ? → 2x − 3 · toppen 5x + 7
      { rubrik: PYRAMID, logg: NOD_RAKNA, rader: [
        { typ: 'pyramid', vars: 'x', rader: [
          [{ svar: '6x + 1' }], [{ svar: '4x + 5' }, { svar: '2x - 4' }],
          [{ fast: 'x + 4' }, { fast: '3x + 1' }, { fast: '-(x + 5)' }] ] },
        { typ: 'pyramid', vars: 'x', rader: [
          [{ svar: '4x - 9' }], [{ svar: '3x - 8' }, { svar: 'x - 1' }],
          [{ fast: 'x - 3' }, { fast: '2x - 5' }, { fast: '-(x - 4)' }] ] },
        { typ: 'pyramid', vars: 'x', rader: [
          [{ svar: '3x - 8' }], [{ svar: '5x - 7' }, { svar: '-2x - 1' }],
          [{ fast: '4x - 5' }, { fast: 'x - 2' }, { fast: '-(3x - 1)' }] ] },
        { typ: 'pyramid', vars: 'x', rader: [
          [{ svar: '5x + 7' }], [{ svar: '2x + 5' }, { fast: '3x + 2' }],
          [{ fast: 'x' }, { fast: 'x + 5' }, { svar: '2x - 3' }] ] }
      ]},

      // 7 ── kvadrattermer ─────────────────────────────────────────────────────────────────
      grupp({ rubrik: 'Förenkla uttrycket', logg: NOD_MULT, rader: [
        p('2y(5 + 7y) - 3y(5x - 3) - 11xy',      '14y² - 26xy + 19y', 'xy'),
        p('5a(3b - 4) - 4b(7 - 2a) + b(5a + 7)', '28ab - 20a - 21b',  'ab')
      ]}),

      // 8 ── B9: rektangel med hål, yttre (2a + b) × a, hålet (a − b) × 2b ─────────────────
      //   a) 2b(a − b) = 2ab − 2b² (ledet = svaret → två rutor)
      //   b) a(2a + b) − 2b(a − b) = 2a² + ab − 2ab + 2b² = 2a² − ab + 2b²
      grupp({ rubrik: 'Skriv ett förenklat uttryck för arean av', logg: NOD_MULT, rader: [
        sf('2b(a - b)', '2ab - 2b²', 'ab', { fraga: 'den lilla rektangeln',
          svg: F ? F.halrektangel({ bredd: '2a + b', hojd: 'a', halBredd: 'a - b', halHojd: '2b' }) : '' }),
        sf('a(2a + b) - 2b(a - b)', '2a² - ab + 2b²', 'ab', { fraga: 'det färgade området' })
      ]}),

      // 9 ── B10: yttre (a + 3b) × b, hålet 2b × (b − a): b(a + 3b) − 2b(b − a) = 3ab + b² ──
      grupp({ rubrik: 'Skriv ett förenklat uttryck för arean av det färgade området', logg: NOD_MULT, rader: [
        sf('b(a + 3b) - 2b(b - a)', '3ab + b²', 'ab',
          { svg: F ? F.halrektangel({ bredd: 'a + 3b', hojd: 'b', halBredd: '2b', halHojd: 'b - a' }) : '' })
      ]})
    ]
  };

  // ══════════════════════════ FÖRDJUPNING ══════════════════════════
  // Parentes gånger parentes — en ny metod, därför ett eget blad och inte en fjärde nivå.
  var FORDJ = {
    titel: 'Multiplikation med parentes – fördjupning',
    grupper: [
      grupp({ rubrik: 'Förenkla uttrycket – visa mellanled', logg: NOD_TVA, rader: [
        p('(x + 2)(x + 3)', 'x² + 5x + 6'),
        p('(x - 3)(x + 4)', 'x² + x - 12'),
        p('(x + 5)(x - 6)', 'x² - x - 30'),
        p('(x - 7)(x - 3)', 'x² - 10x + 21')
      ]}),
      grupp({ rubrik: 'Förenkla uttrycket – visa mellanled', logg: NOD_TVA, rader: [
        p('(2y - 5)(3y + 5)', '6y² - 5y - 25', 'y'),
        p('(3x - 7)(4x - 8)', '12x² - 52x + 56'),
        p('(8 - 2x)(6x + 7)', '-12x² + 34x + 56'),
        p('(4x + 6)(8 - 7x)', '-28x² - 10x + 48')
      ]}),

      // B11: fyra delar, höjderna x och 3, bredderna x och 5 (Joachim: "och förenkla det") ────
      grupp({ rubrik: 'Skriv ett uttryck för figurens area och förenkla det', logg: NOD_TVA, rader: [
        sf('(x + 3)(x + 5)', 'x² + 8x + 15', 'x',
          { svg: F ? F.deladRektangel({ hojder: ['x', '3'], bredder: ['x', '5'], enhet: 'cm' }) : '' })
      ]}),

      // c) minus framför en produkt av två parenteser: ett led, och "+ led" ger fler ───────────
      grupp({ rubrik: 'Förenkla uttrycket – visa mellanled', logg: NOD_TVA, rader: [
        p('(6x - 4)(2x + 4) - 13x',               '12x² + 3x - 16'),
        p('2(x + 2) + (2x + 2)(3x - 1)',          '6x² + 6x + 2'),
        p('(4x - 3)(9 - 2x) - (3x - 4)(2x - 4)',  '-14x² + 62x - 43')
      ]}),

      // B12: yttre kvadrat (x + 5), hålet (x − 3): (x + 5)(x + 5) − (x − 3)(x − 3) = 16x + 16 ──
      grupp({ rubrik: 'Skriv ett uttryck för det färgade områdets area och förenkla det', logg: NOD_TVA, rader: [
        sf('(x + 5)(x + 5) - (x - 3)(x - 3)', '16x + 16', 'x',
          { svg: F ? F.halrektangel({ bredd: 'x + 5', hojd: 'x + 5', halBredd: 'x - 3', halHojd: 'x - 3',
                                      kvadrat: true, enhet: 'cm' }) : '' })
      ]})
    ]
  };

  // Nivåerna ur bandet, de byggda.
  var BYGGDA = { 1: NIVA1, 2: NIVA2, 3: NIVA3 };
  var nivaer = {};
  Object.keys(BAND && BAND.multiplicera ? BAND.multiplicera.nivaer : BYGGDA).forEach(function(n){
    if(BYGGDA[n]) nivaer[n] = BYGGDA[n];
  });

  window.AK8_MULT_PARENTES = { titel: 'Multiplikation med parentes', nivaPrefix: 'ak8k2d3', nivaer: nivaer };
  // Fördjupningen: bandets avsnitt har EN nivå, och ett ensamt steg ritar ingen nivårad.
  window.AK8_MULT_FORDJUPNING = FORDJ;
})();
