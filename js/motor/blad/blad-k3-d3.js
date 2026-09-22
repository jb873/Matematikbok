/* blad-k3-d3.js — Åk7 kapitel 3, delkapitel 3 (Förenkla uttryck): Öva-bladen A, B och C.
   Data ur Joachims dokument "1. Förenkla uttryck.docx" (läst strukturellt ur word/document.xml —
   bråken står som riktiga bråk i XML:en och byggs som stående bråk här). Talen är hans, ORD FÖR ORD,
   med tre undantag som han beslutat (2026-09-22):
     · C4c står som "6 • 0,2x + 1,7 − 1,3x − 2,4" (dokumentets "6 • 0,2" saknade variabel).
     · C5 är öppen: eleven skriver TVÅ sidor som ger omkretsen 18x + 6 (figuren saknade mått).
     · Likhetstecken tillagda i C4c, C6a och C6b (saknades i dokumentet).
   ALLA FIGURER ÄR EGNA EXEMPEL (order 2026-09-22): bokens figurer ritas inte av. Samma sorts figur,
   nya värden, ritade ur data via window.SvgAlgebraFigur → figur och facit kan inte glida isär.
   Pyramidernas och de magiska kvadraternas lösningar är ENTYDIGA (kontrollerat vid konstruktionen:
   varje ruta följer ur de givna via additionsregeln resp. rad/kolumn/diagonal = 3 · mittrutan).

   Rättning: window.AlgBrak.gradePoly (värde + skriven form) via kärnans radtyper 'forenkla',
   'omkrets', 'oppet', 'pyramid', 'magisk' (blad-karna-b.js). Loggar till MasteryK3 (grupp.loggStore).
   Inga hjälptexter under rubrikerna. Ingen nätväg. */
(function(){
  'use strict';
  var F = window.SvgAlgebraFigur;
  function brak(t, n){ return '<span class="brak"><span class="taljare">' + t + '</span><span class="namnare">' + n + '</span></span>'; }
  var NOD = 'alg-samla:rakna';        // Del 3:s enda lövnod i k3-taxonomin (generator forenklaEngine)
  var NOD_VARDE = 'alg-berakna:rakna';// "Beräkna värdet av uttrycket" hör till Del 1:s nod
  var NOD_FAKTOR = 'alg-samla-faktor:rakna';   // tal · term och term / tal — egen färdighet (Joachim 2026-09-22)
  function G(rubrik, rader, logg){ return { rubrik: rubrik, rader: rader, logg: logg || NOD, loggStore: 'k3' }; }
  function f(fraga, svar, vars){ return { typ: 'forenkla', fraga: fraga, svar: svar, vars: vars || 'xy' }; }
  function fh(fragaHtml, svar, vars){ return { typ: 'forenkla', fraga: '', fragaHtml: fragaHtml, svar: svar, vars: vars || 'xy' }; }
  function tal(uttryck, svar){ return { typ: 'enkel', vansterText: uttryck + ' =', svar: svar }; }

  // ══════════════════════════════════════════════════════════════════════════════════════════
  // BLAD A — grunderna: en variabel, addition/subtraktion, tal · term, term / tal
  // ══════════════════════════════════════════════════════════════════════════════════════════
  var BLAD_A = {
    titel: 'Förenkla uttryck A',
    grupper: [
      G('Förenkla uttryck', [
        f('4x + 3x', '7x'), f('7x + 2x', '9x'), f('3x + x + 2x', '6x'), f('y + y', '2y'), f('y + 5y + 7y', '13y')
      ]),
      G('Förenkla uttryck', [
        f('12x − 5x', '7x'), f('42x − 8x', '34x'), f('10y − 3y + 2y', '9y'), f('x − x', '0'), f('9y + 2y − 5y', '6y')
      ]),
      G('Förenkla uttryck', [
        f('5 · 3x', '15x'), f('4y · 7', '28y'), f('1,3x · 10', '13x'), f('6 · 5y + 3y', '33y'), f('3x + 4 · 6x', '27x')
      ], NOD_FAKTOR),
      G('Förenkla uttryck', [
        fh(brak('28x', '2'), '14x'), fh(brak('15y', '3'), '5y'),
        fh(brak('5x', '5') + ' + 7x', '8x'), fh('8y + ' + brak('6y', '2'), '11y')
      ], NOD_FAKTOR)
    ]
  };

  // ══════════════════════════════════════════════════════════════════════════════════════════
  // BLAD B — två variabler, uttryck med tal, omkrets ur figur, beräkna värdet
  // ══════════════════════════════════════════════════════════════════════════════════════════
  var BLAD_B = {
    titel: 'Förenkla uttryck B',
    grupper: [
      G('Förenkla uttryck', [
        f('6x + 2y − 3x + 4y', '3x + 6y'), f('7x + 4y − 3x + 2y', '4x + 6y'),
        f('5x − 6y − 2x + 8y', '3x + 2y'), f('8x − 5y + 3x + 2y', '11x − 3y')
      ]),
      G('Skriv ett uttryck för figurens omkrets och förenkla det så långt som möjligt', [
        { typ: 'omkrets', svg: F.rektangel({ bredd: '4x', hojd: '3' }), svar: '8x + 6', vars: 'x' }
      ]),
      G('Förenkla uttryck', [
        f('3y + 5 − y', '2y + 5'), f('8a + 6 − 3a − 4', '5a + 2', 'ab'),
        f('7y − 3 − 6y + 7', 'y + 4'), f('9a − 2 + 6a − 3', '15a − 5', 'ab')
      ]),
      G('Skriv ett uttryck för figurens omkrets och förenkla det så långt som möjligt', [
        { typ: 'omkrets', svg: F.fyrhorning({ sidor: ['18', '5x', '12', '3x'], enhet: 'cm' }), svar: '8x + 30', vars: 'x' }
      ]),
      G('Beräkna värdet av uttrycket när x = 4 och y = 2', [
        tal('3x + 4y', 20), tal('6x + 2 − 3y', 20), tal('8x − 5 + 6y − 10', 29)
      ], NOD_VARDE),
      G('Förenkla uttrycket', [
        f('4y + 2x − y + 5x + 3', '7x + 3y + 3'), f('4x + y − x − 9 + 3y', '3x + 4y − 9'),
        f('5a + 4b + 9 − 2b − 8', '5a + 2b + 1', 'ab'), f('4y + 2x + 8 − 3y − 5', '2x + y + 3')
      ]),
      G('Skriv ett uttryck för figurens omkrets och förenkla det så långt som möjligt', [
        { typ: 'omkrets', svg: F.triangel({ ben: '3y', bas: '4' }), svar: '6y + 4', vars: 'y' },
        { typ: 'omkrets', svg: F.femhorning({ sidor: ['5', '2b', '4', '6a', '3a'] }), svar: '9a + 2b + 9', vars: 'ab' }
      ]),
      G('Beräkna värdet av 13 − 6x när x = 1,1', [ tal('13 − 6x', 6.4) ], NOD_VARDE)
    ]
  };

  // ══════════════════════════════════════════════════════════════════════════════════════════
  // BLAD C — bråk i uttrycket, eget uttryck, pyramider, decimaltal, magiska kvadrater
  // ══════════════════════════════════════════════════════════════════════════════════════════
  var BLAD_C = {
    titel: 'Förenkla uttryck C',
    grupper: [
      G('Förenkla uttrycket', [
        fh('5x + 5y − ' + brak('9x', '3') + ' − 2y', '2x + 3y'),
        fh(brak('8a', '2') + ' − a + 4b − 2b', '3a + 2b', 'ab'),
        fh(brak('15x', '3') + ' + 12y + 7x − 2 · 2y', '12x + 8y'),
        fh(brak('21x', '3') + ' + 3y − 5x + ' + brak('24y', '3'), '2x + 11y')
      ]),
      G('Skriv ett uttryck som innehåller fyra termer och förenklas till', [
        { typ: 'oppet', fraga: '6x + 10', mal: '6x + 10', termer: 4, vars: 'x' },
        { typ: 'oppet', fraga: '3x − 12', mal: '3x − 12', termer: 4, vars: 'x' }
      ]),
      G('Fyll i de tomma rutorna. Varje ruta är summan av de två rutorna under.', [
        { typ: 'pyramid', vars: 'ab', rader: [
          [{ svar: '11a + 5b' }],
          [{ svar: '5a + 3b' }, { svar: '6a + 2b' }],
          [{ fast: '3a' }, { fast: '2a + 3b' }, { fast: '4a − b' }]
        ] },
        { typ: 'pyramid', vars: 'x', rader: [
          [{ fast: '12x + 9' }],
          [{ fast: '7x + 5' }, { svar: '5x + 4' }],
          [{ svar: '5x + 2' }, { svar: '2x + 3' }, { fast: '3x + 1' }]
        ] },
        { typ: 'pyramid', vars: 'ay', rader: [
          [{ fast: '3a + 7y' }],
          [{ fast: '2a + 5y' }, { svar: 'a + 2y' }],
          [{ svar: '2a + 3y' }, { svar: '2y' }, { fast: 'a' }]
        ] }
      ]),
      G('Förenkla uttrycket', [
        fh('3 · 5x + ' + brak('18', '3') + ' + 7x − 4', '22x + 2'),
        fh(brak('27y', '3') + ' + 6 − 3y − ' + brak('42', '7'), '6y'),
        f('6 · 0,2x + 1,7 − 1,3x − 2,4', '−0,1x − 0,7'),
        f('(−4x) + 3y + 4 − x + 7y − 9', '−5x + 10y − 5')
      ]),
      G('Omkretsen av rektangeln är 18x + 6. Skriv två sidor som ger den omkretsen.', [
        { typ: 'sidor', svg: F.rektangel({ bredd: '?', hojd: '?' }), halva: '9x+3', visa: '18x + 6', vars: 'x' }
      ]),
      G('Förenkla uttrycket', [
        fh(brak('21x', '3') + ' + ' + brak('32y', '4') + ' − 5 + 5x − 3 − 5y', '12x + 3y − 8'),
        fh(brak('15x', '3') + ' + ' + brak('18y', '2') + ' + 3 + 7,5x − 0,4y − 9', '12,5x + 8,6y − 6')
      ]),
      G('Fyll i de tomma rutorna så att summan blir lika stor lodrätt, vågrätt och diagonalt.', [
        { typ: 'magisk', vars: 'p', summa: '3p + 12', rutor: [
          { fast: 'p + 1' }, { svar: '2p + 5' }, { fast: '6' },
          { svar: '9' },     { fast: 'p + 4' },  { svar: '2p − 1' },
          { svar: '2p + 2' }, { svar: '3' },     { svar: 'p + 7' }
        ] },
        { typ: 'magisk', vars: 'y', summa: '3y + 9', rutor: [
          { svar: 'y + 2' },  { svar: '6' },     { svar: '2y + 1' },
          { svar: '2y + 2' }, { fast: 'y + 3' }, { fast: '4' },
          { fast: '5' },      { svar: '2y' },    { svar: 'y + 4' }
        ] }
      ])
    ]
  };

  window.BLAD_K3_D3 = { A: BLAD_A, B: BLAD_B, C: BLAD_C };
  // Bygg direkt om sidans mount-punkter finns (samma mönster som blad-k3-d1.js).
  if(typeof bygg_blad === 'function'){
    var m;
    if((m = document.getElementById('sheet-a'))) bygg_blad(m, BLAD_A);
    if((m = document.getElementById('sheet-b'))) bygg_blad(m, BLAD_B);
    if((m = document.getElementById('sheet-c'))) bygg_blad(m, BLAD_C);
  }
})();
