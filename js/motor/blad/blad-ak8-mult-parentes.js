/* blad-ak8-mult-parentes.js — ÅTTANS DELKAPITEL 3, DEL 2: "Multiplikation med parentes".
   Order v3 2026-10-26. Nivå 1 är piloten; nivå 2, 3 och Fördjupning byggs efter granskningen.

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

   NIVÅANTALET kommer ur bandet (band-ak8-alg3.js, multiplicera.nivaer: tre steg), begränsat till de
   nivåer som är BYGGDA — ett steg utan uppgifter vore en knapp in i tomhet. I piloten finns nivå 1,
   och NivaRad ritar ingen rad för ett ensamt steg; raden kommer av sig själv när nivå 2 läggs in. */
(function(){
  'use strict';
  var F = window.SvgAlgebraFigur, ML = window.MellanledRattare, BAND = window.BAND_AK8_ALG3;
  var NOD_MULT    = 'alg-multiplicera-parentes:rakna';
  var NOD_PROBLEM = 'alg-forenkla-parentes:problem';

  // Kravet ur uttrycket: 'kravt' där ledet skiljer sig från svaret, annars 'nej' (ingen ledruta).
  function krav(u){ return (ML && ML.kravAv(u)) || 'nej'; }
  function p(uttryck, svar, vars){
    return { typ: 'parentes', uttryck: uttryck, svar: svar, vars: vars || 'x', mellanled: krav(uttryck) };
  }
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

  // Nivåerna ur bandet, de byggda.
  var BYGGDA = { 1: NIVA1 };
  var nivaer = {};
  Object.keys(BAND && BAND.multiplicera ? BAND.multiplicera.nivaer : BYGGDA).forEach(function(n){
    if(BYGGDA[n]) nivaer[n] = BYGGDA[n];
  });

  window.AK8_MULT_PARENTES = { titel: 'Multiplikation med parentes', nivaPrefix: 'ak8k2d3', nivaer: nivaer };
})();
