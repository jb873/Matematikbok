/* blad-ak8-parentes.js — ÅTTANS DELKAPITEL 3: "Uttryck med minus eller plus framför parentes".
   Order 2026-10-04. NIVÅ 1 (pilot). Nivå 2 och 3 byggs efter Joachims granskning.

   KÄLLA: Parentes nivå 1.docx, md5 56f8f7e32b4a03f83f0d64f2ed58a76d — fjorton uppgifter,
   transkriberade i dokumentets egen numrering. Uppgifterna är Joachims; talen i de uppgifter som
   var skannade bilder ("gör om" / "skapa liknande") är de förslag han godkände 2026-10-04.

   MELLANLEDET. Regel 7: står ett minustecken framför en parentes ska eleven skriva ett mellanled
   där parentesen är borttagen och tecknen bytta; står bara plus får hon men behöver inte. Kravet
   står som DATA på raden (mellanled: 'kravt' | 'frivilligt'), räknat ur uttrycket — rubriken är
   elevtext och styr ingenting. Rättas av MellanledRattare: samma termer, inga parenteser, ingen
   hopslagning. Slutsvaret rättas av AlgBrak.gradePoly på värde och form.

   FÖRSTÅELSETRÄNING loggas inte (Joachims linje från Mönster): uppgift 4 och 10, med skälet i
   datan. Uppgift 5 räknas som figur och loggas.

   FIGURERNA ritas ur den delade SvgAlgebraFigur med samma sidlista som facit — figuren och
   rättaren kan inte driva isär. Bokens inskannade bilder används inte.

   ── JOACHIMS BESLUT OM NIVÅ 2 OCH 3 (fattade 2026-10-04, innan nivåerna byggs) ──

   LINUS (nivå 2, dokumentets §18). Frågetexten är:
     "Skriv ett uttryck för hur många bilder han har kvar och förenkla det."
   Uppgiften ger (13x + 3) - (4x - 5): minus framför parentes, alltså mellanled (regel 7), och
   två rutor enligt K-C. Uttrycket skrivs INTE ut i uppgiftstexten (R2).

   SUMMA-UPPGIFTEN MED BRÅK (nivå 3, dokumentets §14). TRE rutor: skriva, ta bort parenteserna,
   förenkla. Frågetexten är:
     "Summan av två uttryck är x + y. Det ena uttrycket är x/8 - y/6. Vilket är det andra
      uttrycket? Visa lösningen med ett uttryck och förenkla uttrycket."
   (Bråken skrivs staplat i bladet, som allt annat i boken.)

   GENVÄGEN I SKRIVA-RUTAN är stängd: SKRIV_FORENKLAT = 'underkanns' i blad-karna-b. Eleven ska
   först skriva ett korrekt uttryck och sedan förenkla; ett redan förenklat uttryck i första
   rutan är fel, även om värdet stämmer. Ett annat RIKTIGT skrivsätt godtas fortfarande
   (mätt: "x + (x + 55) + 2x" godkänns i Svens uppgift). */
(function(){
  'use strict';
  var F = window.SvgAlgebraFigur;
  var NOD_RAKNA   = 'alg-forenkla-parentes:rakna';
  var NOD_PROBLEM = 'alg-forenkla-parentes:problem';

  // Kortform: en parentes-rad. Kravet räknas ur uttrycket om det inte anges.
  function p(uttryck, svar, extra){
    var r = { typ: 'parentes', uttryck: uttryck, svar: svar, vars: 'xy' };
    if(extra) Object.keys(extra).forEach(function(k){ r[k] = extra[k]; });
    return r;
  }

  var NIVA1 = {
    titel: 'Uttryck med minus eller plus framför parentes – nivå 1',
    grupper: [

      // 1 ──────────────────────────────────────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', logg: NOD_RAKNA, rader: [
        p('9x + (2x + 6)',  '11x + 6'),
        p('7x + (5x - 7)',  '12x - 7'),
        p('5x - (x + 5)',   '4x - 5'),
        p('8x - (3x - 7)',  '5x + 7')
      ]},

      // 2 ──────────────────────────────────────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', logg: NOD_RAKNA, rader: [
        p('7x + 9 + (5x + 6)',   '12x + 15'),
        p('7x - (4x - 5y) + 2y', '3x + 7y'),
        p('(15y + 4) - (6y + 7)','9y - 3'),
        p('(7y + 4) - (7 - 2x)', '2x + 7y - 3')
      ]},

      // 3 ── figur: triangel och rektangel. Sidorna är datan; facit är deras summa. ─────────
      { rubrik: 'Skriv ett uttryck för figurens omkrets och förenkla det', logg: NOD_RAKNA, rader: [
        /* TVÅ RUTOR: uppställningen i den första, förenklingen i den andra. Förr låg båda i samma
           ruta, och då syntes inte vilket av stegen som brast — dessutom klipptes raden i en smal
           vy, eftersom fyra sidor adderade blir 326 px text i en ruta som får 275 px. */
        { typ: 'skrivforenkla', fraga: 'Omkrets',
          svg: F ? F.sidtriangel({ sidor: ['7', '4x - 9', '5'], enhet: 'cm' }) : '',
          sidor: ['7', '4x - 9', '5'], svar: '4x + 3', vars: 'x' },
        { typ: 'skrivforenkla', fraga: 'Omkrets',
          svg: F ? F.rektangel({ bredd: '3x + 4', hojd: 'x - 2', enhet: 'cm' }) : '',
          sidor: ['3x + 4', 'x - 2', '3x + 4', 'x - 2'], svar: '8x + 4', vars: 'x' }
      ]},

      // 4 ── förståelseträning: eleven väljer, räknar inte. Loggas inte. ───────────────────
      { rubrik: 'Utgå från det förenklade uttrycket 3x − 2y. Vilket eller vilka av uttrycken stämmer?',
        loggarEj: 'förståelseträning: eleven väljer mellan givna uttryck i stället för att räkna, färdigheten mäts inte här',
        rader: [
          { typ: 'val', fraga: 'Vilket uttryck stämmer?',
            alternativ: ['(5x − y) − (7y − 2y)', '(4x − 2y) − (7y − x)',
                         '(5x − 2x) − (3y − y)', '(5x − y) + (3y − 2x)'],
            svar: '(5x − 2x) − (3y − y)' }
        ]},

      // 5 ── figur, flerval. Räknas som figur och loggas (Joachims besked). ────────────────
      { rubrik: 'Vilket uttryck stämmer för rektangelns omkrets?', logg: NOD_RAKNA, rader: [
        { typ: 'svgfigur', svg: F ? F.rektangel({ bredd: '3x - 4', hojd: 'x + 5', enhet: 'cm' }) : '' },
        { typ: 'val', fraga: 'Rektangelns omkrets är',
          alternativ: ['8x − 2', '8x + 2', '6x + 2', '4x + 1'], svar: '8x + 2' }
      ]},

      // 6 ── förenkla och sätt in x = 3 ────────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled – och beräkna värdet när x = 3', logg: NOD_RAKNA, rader: [
        p('6x + (3x + 7)',    '9x + 7', { varde: { etikett: 'Beräkna', x: 3, svar: 34 } }),
        p('9 - (4x + 8)',     '1 - 4x', { varde: { etikett: 'Beräkna', x: 3, svar: -11 } }),
        p('(5x + 6) - (2x - 3)', '3x + 9', { varde: { etikett: 'Beräkna', x: 3, svar: 18 } })
      ]},

      // 7 ── rektangelns omkrets, Joachims tal ─────────────────────────────────────────────
      { rubrik: 'Skriv ett uttryck för rektangelns omkrets och förenkla det', logg: NOD_RAKNA, rader: [
        { typ: 'skrivforenkla', fraga: 'Omkrets',
          svg: F ? F.rektangel({ bredd: '4x', hojd: '2x + 3', enhet: 'cm' }) : '',
          sidor: ['4x', '2x + 3', '4x', '2x + 3'], svar: '12x + 6', vars: 'x' }
      ]},

      // 8 ── triangelns tredje sida ur omkretsen ───────────────────────────────────────────
      { rubrik: 'Triangelns omkrets är 14x', logg: NOD_RAKNA, rader: [
        /* R2: uttrycket "14x - (4x - 5) - (6x + 9)" stod förr i uppgiftstexten — det ÄR
           uppställningen, alltså svaret på det eleven ska göra. Nu skriver hon det själv, och
           mellanledsrutan kommer emellan eftersom det står minus framför parentesen.
           HÖRNEN A, B, C är utsatta: uppgiften talar om sidan AC, och utan hörn går den inte att
           peka ut. Sidorna ligger i ordningen A→B (botten), B→C (höger), C→A (vänster) — och den
           sista är omärkt med flit, för den är uppgiften. */
        { typ: 'skrivforenkla', vars: 'x',
          fraga: 'Skriv ett uttryck för sidan AC och förenkla det',
          svg: F ? F.sidtriangel({ sidor: ['4x - 5', '6x + 9', ''], horn: ['A', 'B', 'C'],
            enhet: 'cm' }) : '',
          skriv: '14x - (4x - 5) - (6x + 9)', svar: '4x - 4' }
      ]},

      // 9 ──────────────────────────────────────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', logg: NOD_RAKNA, rader: [
        p('8x - (6x + 12)',          '2x - 12'),
        p('5x - (4 - 3x)',           '8x - 4'),
        p('2x + (3x + 4) - (x + 3)', '4x + 1'),
        p('5y - (2y - 4) + (y + 3)', '4y + 7')
      ]},

      // 10 ── förståelseträning: para ihop. Loggas inte. ───────────────────────────────────
      { rubrik: 'Para ihop uttrycket med samma uttryck utan parentes',
        loggarEj: 'förståelseträning: eleven matchar givna uttryck i stället för att räkna, färdigheten mäts inte här',
        rader: [
          { typ: 'val', fraga: '9x + (4x − 2)',
            alternativ: ['9x + 4x + 2', '9x − 4x + 2', '9x − 4x − 2', '9x + 4x − 2'], svar: '9x + 4x − 2' },
          { typ: 'val', fraga: '9x − (4x + 2)',
            alternativ: ['9x + 4x + 2', '9x − 4x + 2', '9x − 4x − 2', '9x + 4x − 2'], svar: '9x − 4x − 2' },
          { typ: 'val', fraga: '9x − (4x − 2)',
            alternativ: ['9x + 4x + 2', '9x − 4x + 2', '9x − 4x − 2', '9x + 4x − 2'], svar: '9x − 4x + 2' },
          { typ: 'val', fraga: '9x + (4x + 2)',
            alternativ: ['9x + 4x + 2', '9x − 4x + 2', '9x − 4x − 2', '9x + 4x − 2'], svar: '9x + 4x + 2' }
        ]},

      // 11 ── vad saknas i parentesen ──────────────────────────────────────────────────────
      { rubrik: 'Vad saknas för att likheten ska gälla?', logg: NOD_RAKNA, rader: [
        { typ: 'lucka', text: '5 − (x + __ ) = 2 − x', svar: 3 },
        { typ: 'lucka', text: '6 − (2x − __ ) = 11 − 2x', svar: 5 }
      ]},

      // 12 ── problem ──────────────────────────────────────────────────────────────────────
      { rubrik: 'Skriv ett uttryck och förenkla det', logg: NOD_PROBLEM, rader: [
        /* EN deluppgift — ingen "a)". Uppställningen rättas på värde: "x + x + 55 + 2x" och
           "x + (x + 55) + 2x" är lika riktiga sätt att skriva samma sak. */
        { typ: 'skrivforenkla', vars: 'x',
          fraga: 'Sven har x kronor. Anna har 55 kr mer än Sven. Harald har dubbelt så mycket som Sven. Skriv ett uttryck för hur mycket pengar de har tillsammans och förenkla sedan uttrycket.',
          skriv: 'x + x + 55 + 2x', svar: '4x + 55' }
      ]},

      // 13 ── Vilgot, med prislappar i stället för bokens foto ─────────────────────────────
      { rubrik: 'Vilgot köper två smörgåsar och en banan. På sitt konto har han 546 kr.',
        logg: NOD_PROBLEM, rader: [
          { typ: 'svgfigur', svg: F ? F.prislappar({ varor: [{ namn: 'Smörgås', pris: 'x kr' },
                                                         { namn: 'Banan', pris: '6 kr' }] }) : '' },
          /* En ruta: ingenting ska förenklas, uttrycket ÄR svaret. */
          { typ: 'forenkla', vars: 'x', fraga: 'Skriv ett uttryck för hur mycket Vilgot ska betala.',
            svar: '2x + 6' },
          /* Uttrycket står INTE i texten längre: förr skrevs "546 - (2x + 6)" ut, och då var
             svaret på a) redan givet. Eleven skriver det själv i första rutan, och
             mellanledsrutan kommer emellan av sig själv — det står minus framför parentesen. */
          { typ: 'skrivforenkla', vars: 'x',
            fraga: 'Skriv ett uttryck för hur mycket han har kvar när han har betalat, förenkla uttrycket.',
            skriv: '546 - (2x + 6)', svar: '540 - 2x' }
        ]},

      // 14 ── förenkla och sätt in x = 7 ───────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled – och beräkna värdet när x = 7', logg: NOD_RAKNA, rader: [
        p('18x - (9 + 11x) - 7', '7x - 16', { varde: { etikett: 'Beräkna', x: 7, svar: 33 } })
      ]}
    ]
  };

  window.AK8_PARENTES = { niva1: NIVA1 };
})();
