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

   ── DE ELVA GODKÄNDA FÖRSLAGEN (bokens bildfigurer ersatta — läs aldrig en bokfigur igen) ──

   Varje uppgift som var en inskannad bild i Joachims dokument har ersatts av ett förslag han
   godkänt. Talen nedan ÄR uppgiften. Nivå 1:s sju är byggda; nivå 2:s och 3:s fyra väntar.

   NIVÅ 1 (byggda, talen hämtade ur datan nedan)
     3 a  triangel 7 · 4x - 9 · 5                               facit  4x + 3
     3 b  rektangel 3x + 4 och x - 2                            facit  8x + 4
     5    rektangel 3x - 4 och x + 5, flerval                   facit  8x + 2
     7    rektangel 4x och 2x + 3                               facit  12x + 6
     8    triangel ABC, AB = 4x - 5, BC = 6x + 9, omkrets 14x   facit  4x - 4   (sidan AC)
     10   para ihop  9x ± (4x ± 2)                              fyra par
     13   Vilgot: smörgås x kr, banan 6 kr, konto 546 kr        facit  2x + 6 och 540 - 2x

   NIVÅ 2 OCH 3 (ej byggda — Joachims beslut 2026-10-04, facit kontrollräknade)
     2:14 a  sträcka, helhet 12, vänster del 2x + 1             facit  11 - 2x
     2:14 b  sträcka, helhet 40, vänster x + 3, höger 2x - 1    facit  38 - 3x
     2:3019  rektangel (4x + 2) × x mot liksidig triangel
             med sidan 2x + 3 — hur mycket större omkrets       facit  4x - 5
     3:3030  rektanglarna x × (x + 4) och (x - 12) × x
             — hur mycket större omkrets                        facit  32

   UTAN GODKÄNDA TAL ÄNNU (bilduppgifter vars siffror fortfarande är bokens):
     3:20    uttryckspyramiden — uttrycken i rutorna (FAS 2:s tal saknas i min anteckning)

   De tre ska ha egna tal innan de byggs, av samma skäl som de elva ovan.

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

   MAJA OCH NOA (nivå 2, bokens uppgift 57 — två personer som köper lök och potatis till olika
   kilopris). Tre deluppgifter: a) EN ruta (inget förenklas), b) sammanlagt och c) skillnaden får
   båda skriva + förenkla. c) får dessutom MELLANLED: en skillnad mellan två uttryck ger minus
   framför parentes, och då gäller regel 7.

   L-FIGUREN (nivå 3, bokens uppgift 15 — omkretsen av den färgade figuren): TVÅ rutor, skriva och
   förenkla, som omkretsuppgifterna i nivå 1. Figuren finns redan i SvgAlgebraFigur (lfigur).

   TRIANGELN AC (nivå 1, uppgift 8) står kvar som EN uppgift med tre rutor. Bokens a/b-indelning
   behövs inte: eleven skriver uttrycket själv, och det är hela poängen med uppdelningen.

   BERÄKNA-KEDJAN kräver MINST TVÅ LED efter avskriften av det förenklade uttrycket. Har eleven
   skrivit av uttrycket räcker "1 - 4 · 3 = -11"; fler led är tillåtna via "+ led". Mätt i sidan.

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
      { rubrik: 'Förenkla uttrycket – visa mellanled', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('9x + (2x + 6)',  '11x + 6'),
        p('7x + (5x - 7)',  '12x - 7'),
        p('5x - (x + 5)',   '4x - 5'),
        p('8x - (3x - 7)',  '5x + 7')
      ]},

      // 2 ──────────────────────────────────────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', mellanled:'kravt', logg: NOD_RAKNA, rader: [
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
      { rubrik: 'Förenkla uttrycket – visa mellanled – och beräkna värdet när x = 3', mellanled:'kravt', logg: NOD_RAKNA, rader: [
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
      { rubrik: 'Förenkla uttrycket – visa mellanled', mellanled:'kravt', logg: NOD_RAKNA, rader: [
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
      { rubrik: 'Förenkla uttrycket – visa mellanled – och beräkna värdet när x = 7', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('18x - (9 + 11x) - 7', '7x - 16', { varde: { etikett: 'Beräkna', x: 7, svar: 33 } })
      ]}
    ]
  };


  // ══════════════════════════ NIVÅ 2 ══════════════════════════
  // Parentes Nivå 2.docx (md5 a115a4ac…). Nytt mot nivå 1: negativa tal inuti parentesen,
  // decimaltal och bråk. Regel 7 gäller rakt av — kravet kommer ur uttrycket.
  var NIVA2 = {
    titel: 'Uttryck med minus eller plus framför parentes – nivå 2',
    grupper: [

      // 1 ── negativa tal inuti parentesen ────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('11x - (-5 - 9x)',            '20x + 5'),
        p('5y - (-8y - 9)',             '13y + 9',   { vars: 'y' }),
        p('(5x + 5) - (8 - 2x)',        '7x - 3'),
        p('(3x - 0,3y) - (0,4x - 0,1y)', '2,6x - 0,2y', { vars: 'xy' })
      ]},

      // 2 ── tre parenteser, flera variabler ──────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('7x - (4x + 11) + (2x + 7)',   '5x - 4'),
        p('6a - (3a + 2) - (5a + 7)',    '-2a - 9',  { vars: 'a' }),
        p('13x - (5x - 3y) + (2y - 3x)', '5x + 5y',  { vars: 'xy' }),
        p('(5a - 2b) - (3a - 3b) - (8b + 2a)', '-7b', { vars: 'ab' })
      ]},

      // 3 ── bråk i uttrycket ─────────────────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('(2 + 4b) + 5 - (3b + 6)',     'b + 1',    { vars: 'b' }),
        p('18x/3 - (3x - 6) + (4x + 2)', '7x + 8'),
        p('(4x - 4) - (3x + 9) - (2x + 3)', '-x - 16')
      ]},

      // 4 ── Linus (Joachims ordalydelse) ─────────────────────────────────────────────────
      // Uttrycket (13x + 3) - (4x - 5) står INTE i texten: uppställningen är uppgiften (R2).
      { rubrik: 'Linus har (13x + 3) hockeybilder. Han ger bort (4x − 5) bilder.',
        mellanled:'kravt', logg: NOD_PROBLEM, rader: [
        { typ: 'skrivforenkla', vars: 'x',
          fraga: 'Skriv ett uttryck för hur många bilder han har kvar och förenkla det.',
          skriv: '(13x + 3) - (4x - 5)', svar: '9x + 8' }
      ]},

      // 5 ── decimaler och bråk ───────────────────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('7x - (2x + 5) + 8',           '5x + 3'),
        p('0,32x - (11 - 0,25x) + 2,3',  '0,57x - 8,7'),
        // brak: svaret ÄR ett bråk — inget att räkna ut, så gradePoly får tillatBrak.
        p('4/3 - (6b/5 + 1/3) + 2b/5',   '1 - 4b/5', { vars: 'b', brak: true })
      ]},

      // 6 ── parenteser som tar ut varandra ───────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('(5x + 8) - (6x - 7) + 15x',   '14x + 15'),
        p('(8x + 3) + (8x - 3) - (8x - 3)', '8x + 3')
      ]},

      // 7 ── röda sträckan (Joachims tal) ─────────────────────────────────────────────────
      // a) 12 - (2x + 1) = 11 - 2x   b) 40 - (x + 3) - (2x - 1) = 38 - 3x
      { rubrik: 'Skriv ett uttryck för längden av den röda sträckan och förenkla det',
        mellanled:'kravt', logg: NOD_RAKNA, rader: [
        { typ: 'skrivforenkla', vars: 'x', fraga: 'Röda sträckan',
          svg: F ? F.strackfigur({ helhet: '12', delar: [{ text: '2x + 1' }, {}] }) : '',
          skriv: '12 - (2x + 1)', svar: '11 - 2x' },
        { typ: 'skrivforenkla', vars: 'x', fraga: 'Röda sträckan',
          svg: F ? F.strackfigur({ helhet: '40', delar: [{ text: 'x + 3' }, {}, { text: '2x - 1' }] }) : '',
          skriv: '40 - (x + 3) - (2x - 1)', svar: '38 - 3x' }
      ]},

      // 8 ── likbent triangel, öppen uppgift ──────────────────────────────────────────────
      // Många svar är riktiga: det som prövas är likheten 2 · ben + bas = 8x + 14, inte ett facit.
      { rubrik: 'Uttrycket för en likbent triangels omkrets är 8x + 14', logg: NOD_PROBLEM, rader: [
        { typ: 'likbent', vars: 'x', omkrets: '8x + 14',
          fraga: 'Ge exempel på hur långa sidorna kan vara',
          exempelBen: '2x + 4', exempelBas: '4x + 6' }
      ]},

      // 9 ── Maja och Noa (Joachims struktur, talen mitt förslag) ─────────────────────────
      // a) en ruta — inget förenklas. b) och c) skriva + förenkla; c) får mellanled, eftersom en
      // skillnad mellan två uttryck ger minus framför parentes (regel 7).
      { rubrik: 'Maja köper x kg äpplen och y kg päron. Noa köper y kg äpplen och x kg päron.',
        mellanled:'kravt', logg: NOD_PROBLEM, rader: [
        { typ: 'svgfigur', svg: F ? F.prislappar({ varor: [{ namn: 'Äpplen', pris: '18 kr/kg' },
                                                           { namn: 'Päron', pris: '24 kr/kg' }] }) : '' },
        { typ: 'forenkla', vars: 'xy', fraga: 'Skriv ett uttryck för hur mycket Maja ska betala.',
          svar: '18x + 24y', mellanled: 'nej' },   // inget att förenkla: uttrycket ÄR svaret
        { typ: 'skrivforenkla', vars: 'xy',
          fraga: 'Skriv ett uttryck för hur mycket Maja och Noa ska betala sammanlagt och förenkla det.',
          skriv: '(18x + 24y) + (24x + 18y)', svar: '42x + 42y' },
        { typ: 'skrivforenkla', vars: 'xy',
          fraga: 'Skriv ett uttryck för skillnaden mellan hur mycket Maja och Noa ska betala och förenkla det.',
          skriv: '(18x + 24y) - (24x + 18y)', svar: '6y - 6x' }
      ]},

      // 8 ── hur mycket större omkrets (Joachims tal) ─────────────────────────────────────
      // Rektangel (4x + 2) × x: omkrets 10x + 4. Liksidig triangel med sidan 2x + 3: 6x + 9.
      // Skillnad (10x + 4) - (6x + 9) = 4x - 5. Uppställningen visas inte (R2); båda skrivsätten
      // godtas — sidorna utskrivna eller omkretsarna uträknade först.
      { rubrik: 'Bilden visar en rektangel och en liksidig triangel',
        mellanled:'kravt', logg: NOD_PROBLEM, rader: [
        { typ: 'skrivforenkla', vars: 'x',
          fraga: 'Skriv ett uttryck för hur mycket större omkrets rektangeln har och förenkla det',
          svg: F ? ('<span style="display:inline-flex;gap:18px;flex-wrap:wrap;">'
            + F.rektangel({ bredd: '4x + 2', hojd: 'x', enhet: 'cm' })
            + F.triangel({ ben: '2x + 3', bas: '2x + 3', enhet: 'cm' }) + '</span>') : '',
          sidorA: ['4x + 2', 'x', '4x + 2', 'x'],
          sidorB: ['2x + 3', '2x + 3', '2x + 3'],
          svar: '4x - 5' }
      ]}
    ]
  };


  // ══════════════════════════ NIVÅ 3 ══════════════════════════
  // Parentes nivå 3.docx (md5 7aabd7a6…). Nytt mot nivå 2: ett uttryck som är ett BRÅK av två
  // parenteser, insättning av TVÅ variabler, och uppgifter där svaret är ett annat uttryck.
  var NIVA3 = {
    titel: 'Uttryck med minus eller plus framför parentes – nivå 3',
    grupper: [

      // 1 ── minus framför två parenteser, den andra med negativ term ─────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('2x - 9 - (3x + 6) - (-2x + 8)', 'x - 23'),
        // Joachims beslut: bråkuppgiften SKA ha mellanled, som de andra. Steget är parenteserna
        // borttagna i täljare och nämnare var för sig — två rutor, staplade.
        { typ: 'parentes', vars: 'x',
          uttryck: '((7x - 10) - (x - 10))/((x + 20) - (-2x + 20))',
          uttryckHtml: '<span class="ovn-brak"><span class="ovn-brak-taljare">(7x \u2212 10) \u2212 (x \u2212 10)</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare">(x + 20) \u2212 (\u22122x + 20)</span></span>',
          svar: '2' }
      ]},

      // 2 ── förenkla och sätt in två variabler ───────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled – och beräkna värdet när x = 4 och y = −2',
        mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('4y + (3 - y + x) - (y - 8 + 3x)', '2y - 2x + 11',
          { vars: 'xy', varde: { etikett: 'Beräkna', x: { x: 4, y: -2 }, svar: -1 } })
      ]},

      // 3 ── bråk och decimaler i samma grupp ─────────────────────────────────────────────
      { rubrik: 'Förenkla uttrycket – visa mellanled', mellanled:'kravt', logg: NOD_RAKNA, rader: [
        p('(x/3 + 9y + 3/4) - (9y + 1/2 - x)', '4x/3 + 1/4', { vars: 'xy', brak: true }),
        p('(5,9a - 3) + (-5 - 0,8a) - (0,06a + 0,4)', '5,04a - 8,4', { vars: 'a' })
      ]},

      // 4 ── summan av två uttryck ────────────────────────────────────────────────────────
      { rubrik: 'Summan av två uttryck är 5x − 3b + 14. Det ena uttrycket är 7x + 2b − 4.',
        mellanled:'kravt', logg: NOD_PROBLEM, rader: [
        { typ: 'skrivforenkla', vars: 'xb',
          fraga: 'Vilket är det andra uttrycket? Visa lösningen med ett uttryck och förenkla uttrycket.',
          skriv: '(5x - 3b + 14) - (7x + 2b - 4)', svar: '-2x - 5b + 18' }
      ]},

      // 5 ── summan av två uttryck, med bråk (Joachims ordalydelse, tre rutor) ────────────
      { rubrik: 'Summan av två uttryck är x + y. Det ena uttrycket är x/8 − y/6.',
        mellanled:'kravt', logg: NOD_PROBLEM, rader: [
        { typ: 'skrivforenkla', vars: 'xy', brak: true,
          fraga: 'Vilket är det andra uttrycket? Visa lösningen med ett uttryck och förenkla uttrycket.',
          skriv: '(x + y) - (x/8 - y/6)', svar: '7x/8 + 7y/6' }
      ]},

      // 6 ── L-figurens omkrets ───────────────────────────────────────────────────────────
      // JOACHIMS GODKÄNDA TAL: yttre bredd 2a + b, höjd a + 2b → omkrets 6a + 6b. Urtaget är a
      // brett och b högt. Sidorna i figurens egen ordning: topp, höger, urtag in, urtag ner,
      // botten, vänster. Omkretsen är den omslutande rektangelns: 2(2a + b) + 2(a + 2b) = 6a + 6b.
      { rubrik: 'Skriv ett uttryck för den färgade figurens omkrets och förenkla det',
        logg: NOD_RAKNA, rader: [
        { typ: 'skrivforenkla', vars: 'ab', fraga: 'Omkrets',
          svg: F ? F.lfigur({ sidor: ['2a + b', 'a + b', 'a', 'b', 'a + b', 'a + 2b'], enhet: 'cm' }) : '',
          sidor: ['2a + b', 'a + b', 'a', 'b', 'a + b', 'a + 2b'], svar: '6a + 6b' }
      ]},

      // 7 ── hur mycket större omkrets, två rektanglar (Joachims tal) ─────────────────────
      // Stor x × (x + 4): omkrets 4x + 8. Liten (x - 12) × x: omkrets 4x - 24. Skillnad 32.
      { rubrik: 'Figuren visar två rektanglar', mellanled:'kravt', logg: NOD_PROBLEM, rader: [
        { typ: 'skrivforenkla', vars: 'x',
          fraga: 'Skriv ett uttryck för hur mycket större omkrets den stora rektangeln har och förenkla det',
          svg: F ? ('<span style="display:inline-flex;gap:18px;flex-wrap:wrap;">'
            + F.rektangel({ bredd: 'x', hojd: 'x + 4', enhet: 'cm' })
            + F.rektangel({ bredd: 'x - 12', hojd: 'x', enhet: 'cm' }) + '</span>') : '',
          sidorA: ['x', 'x + 4', 'x', 'x + 4'],
          sidorB: ['x - 12', 'x', 'x - 12', 'x'],
          svar: '32' }
      ]}
    ]
  };

  window.AK8_PARENTES = { niva1: NIVA1, niva2: NIVA2, niva3: NIVA3 };
})();
