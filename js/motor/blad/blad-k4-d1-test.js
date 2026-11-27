/* blad-k4-d1-test.js — TESTET I PROCENT OCH BYTA FORM (åk 7, kapitel 4 Del 1, moment 1): Test 1.
   Källa: doc/innehall/k4-d1-procent-moment1-test1.md (Joachims test 2026-11-26, facit kontrollräknat). Uppgifter, tal och
   facit ordagrant; hakparentesen (vilket blad uppgiften liknar) står bara här i kommentarerna.
   Samma komponenter och samma rättning som bladen (blad-k4-d1-procent.js, TYPER): formkedjan, figurerna, svaret med
   enheten efter rutan. Uppgift 8 är flerval med valrutan (ett rätt alternativ per deluppgift).
   Mastery (kapitel 4:s store): uppgift 1–5 och 8 a, b, d, e "Från bråk och decimalform till procentform", uppgift 6–7 och
   8 c "Från procentform till bråk och decimalform". Öppnas på uppgiftssidan: uppgift.html?test=test1. Ingen nätväg. */
(function(){
'use strict';
var P = window.BLAD_K4_D1_PROCENT; if(!P) return;
var Y = P.TYPER, A = window.SvgAndel;
var g = Y.g, br = Y.br, dec = Y.dec, pro = Y.pro, ca = Y.ca, kedja = Y.kedja, upp = Y.upp, rest = Y.rest,
    dp = Y.dp, edp = Y.edp, hp = Y.hp, pk = Y.pk;
function gn(rubrik, nod, rader){ var gr = g(rubrik, rader); gr.logg = nod; gr.loggStore = 'k4'; return gr; }
// Flerval med valrutan: frågan (matematik) och alternativen "A. 60 %", ett rätt.
function val(fraga, alt, ratt, nod){ var r = { typ: 'valruta', matte: true, fraga: fraga, alt: alt, ratt: [ratt] }; if(nod){ r.logg = nod; r.loggStore = 'k4'; } return r; }
// Elevtext i fält (elevtext-låset). Rubrikerna ordagrant ur testet.
var RT = {
  n2: { rubrik: 'Skriv bråket i decimalform och sedan i procentform.' }.rubrik,
  n3: { rubrik: 'Skriv bråket i enklaste form. Skriv det sedan i decimalform och procentform.' }.rubrik,
  n4: { rubrik: 'Skriv bråket i hundradelar. Skriv det sedan i decimalform och procentform.' }.rubrik,
  n6: { rubrik: 'Skriv procenten i hundradelar, i enklaste form och i decimalform.' }.rubrik,
  n8: { rubrik: 'Välj rätt alternativ.' }.rubrik
};
/* TESTENS NAMN (Joachim 2026-11-27, gäller alla test i kapitel 4): "<momentet>, Test <n>" — listan på momentsidan
   förblir en lista. */
var TITEL = { titel: 'Procent och byta form, Test 1' }.titel, TITEL_ANDELEN = { titel: 'Andelen, Test 1' }.titel;
var TEST = {};
TEST.test1 = function(){ return { titel: TITEL, grupper: [
  // [Blad 1]
  gn(Y.R.b1n1, Y.TILL, [
    kedja(null, [br('3/5'), dec(0.6), pro(60)], { svg: A.delStrip(5, upp(3)) }),
    kedja(null, [br('19/100'), dec(0.19), pro(19)], { svg: A.delRuta(10, 10, upp(19)) }) ]),
  // [Blad 2]
  gn(RT.n2, Y.TILL, [ dp('3/4', 0.75, 75), dp('7/10', 0.7, 70), kedja('2/3', [ca(dec(0.67)), pro(67)]), dp('9/100', 0.09, 9) ]),
  // [Blad 3]
  gn(RT.n3, Y.TILL, [ edp('22/55', '2/5', 0.4, 40), edp('16/64', '1/4', 0.25, 25), edp('36/48', '3/4', 0.75, 75) ]),
  // [Blad 4, förlänga]
  gn(RT.n4, Y.TILL, [ hp('7/25', 28), hp('11/50', 22), hp('17/50', 34) ]),
  // [Blad 4, förkorta]
  gn(RT.n4, Y.TILL, [ hp('48/600', 8), hp('99/1100', 9), hp('189/900', 21) ]),
  // [Blad 5]
  gn(RT.n6, Y.FRAN, [ pk(65, '13/20'), pk(32, '8/25'), pk(70, '7/10') ]),
  // [Blad 5]
  gn(Y.R.hela, Y.FRAN, [
    rest({ fraga: '58 % av eleverna går till skolan. Hur många procent går inte till skolan?' }.fraga, 42),
    rest({ fraga: '2/5 av klassen spelar ett instrument. Hur många procent spelar inte ett instrument?' }.fraga, 60) ]),
  // [Blad 1, Blad 2, Blad 5 – vanliga fel]
  gn(RT.n8, Y.TILL, [
    val('0,6 =', ['A. 60 %', 'B. 6 %', 'C. 0,6 %'], 'A. 60 %'),
    val('1/4 =', ['A. 4 %', 'B. 14 %', 'C. 25 %'], 'C. 25 %'),
    val('5 % =', ['A. 0,5', 'B. 5,0', 'C. 0,05'], 'C. 0,05', Y.FRAN),
    val('3/5 =', ['A. 35 %', 'B. 60 %', 'C. 0,35'], 'B. 60 %'),
    val('0,08 =', ['A. 8 %', 'B. 80 %', 'C. 0,8 %'], 'A. 8 %') ])
] }; };

/* ANDELEN, TEST 1 (moment 2, Joachim 2026-11-27). Källa: doc/innehall/k4-d1-procent-moment2-test1.md (facit
   kontrollräknat), ordagrant; hakparentesen (bladet) står bara här i kommentarerna. Byggt som Test 1 i moment 1 med
   Andelens komponenter (blad-k4-d1-andelen.js, TYPER): den fasta svarsraden "Andelen = ▢ = ▢ = ▢ = ▢ %" (exakt,
   mellanled på värde, valfri decimalform, procent) och valrutan. Uppgift 6: två svarsrader och sedan valrutan;
   uppgift 8: flerval med valrutan. Mastery: lövet Andelen (proc-andelen:rakna) i kapitel 4:s store. Bladfilen laddas
   efter den här — svarsraden hämtas när testet byggs. */
var RA = {
  hur: { rubrik: 'Hur många procent är …' }.rubrik,
  n2: { rubrik: 'På en skola går 700 elever. 49 av dem spelar i skolans orkester. Hur många procent av eleverna spelar i orkestern?' }.rubrik,
  n3: { rubrik: 'I en klass finns 17 flickor och 8 pojkar. Hur många procent av eleverna är pojkar?' }.rubrik,
  n4: { rubrik: 'Ella har 600 kr. Hon köper skor för 376 kr och en mössa för 200 kr. Hur många procent av pengarna har hon kvar?' }.rubrik,
  n6: { rubrik: 'Alva gjorde mål på 15 av 20 straffar. Kim gjorde mål på 37 av 50 straffar.' }.rubrik,
  n7: { rubrik: 'Ett lag spelade 25 matcher. Laget vann 9 matcher och spelade oavgjort i 4. Hur många procent av matcherna vann laget eller spelade oavgjort?' }.rubrik,
  n8: { rubrik: 'I en grupp finns 10 pojkar och 15 flickor. Fyra elever räknade ut hur många procent av gruppen som är pojkar. Vem har räknat rätt?' }.rubrik
};
TEST.andelen1 = function(){
  var AN = window.BLAD_K4_D1_ANDELEN && window.BLAD_K4_D1_ANDELEN.TYPER; if(!AN) return null;
  var andel = AN.andel, val = AN.val;
  return Y.medNod(AN.ANDELEN, { titel: TITEL_ANDELEN, grupper: [
    // [Blad 1]
    g(RA.hur, [ andel({ etikett: '41 av 50?' }.etikett, 41, 50, '82/100'), andel({ etikett: '12 av 400?' }.etikett, 12, 400, '3/100'),
                andel({ etikett: '21 av 35?' }.etikett, 21, 35, '3/5') ]),
    // [Blad 2]
    g(RA.n2, [ andel(null, 49, 700, '7/100') ]),
    // [Blad 3]
    g(RA.n3, [ andel(null, 8, 25, '32/100') ]),
    // [Blad 4]
    g(RA.n4, [ andel(null, 24, 600, '4/100') ]),
    // [Blad 5]
    g(RA.hur, [ andel({ etikett: '24 minuter av en timme?' }.etikett, 24, 60, '2/5'), andel({ etikett: '9 dm av 5 m?' }.etikett, 9, 50, '18/100') ]),
    // [Blad 6]
    g(RA.n6, [ andel({ etikett: 'Alva:' }.etikett, 15, 20, '3/4'), andel({ etikett: 'Kim:' }.etikett, 37, 50, '74/100'),
               val(['A Alva', 'B Kim', 'C De var lika bra'], 'A Alva', { fraga: 'Vem var bäst?' }.fraga) ]),
    // [Blad 4]
    g(RA.n7, [ andel(null, 13, 25, '52/100') ]),
    // [Blad 6, Blad 3]
    g(RA.n8, [ val(['A Ida: Andelen = 10/15 = 2/3 ≈ 0,67 = 67 %', 'B Omar: Andelen = 10/25 = 10/100 = 10 %',
                    'C Sara: Andelen = 10/25 = 40/100 = 40 %', 'D Leo: Andelen = 10 %, eftersom det är 10 pojkar.'],
                   'C Sara: Andelen = 10/25 = 40/100 = 40 %') ])
  ] });
};

/* DELEN, TEST 1 (moment 3, Joachim 2026-11-27). Källa: doc/innehall/k4-d1-procent-moment3-test1.md (facit
   kontrollräknat), ordagrant; hakparentesen (bladet) står bara här. Byggt som Andelens test med Delens komponenter
   (blad-k4-d1-delen.js, TYPER): stegraden "100 % = ▢ · ▢ % = ▢/▢ = ▢ · ▢ % = ▢ · ▢ = ▢" (eleven väljer steget; tom
   tredje rad när steget redan är procenttalet), facit = klartextens enklaste väg. Uppgift 6: sträckan (strackfigur);
   uppgift 7: tecknet med valrutan; uppgift 8: flerval. Mastery: lövet Delen (proc-delen:rakna) i kapitel 4:s store. */
var TITEL_DELEN = { titel: 'Delen, Test 1' }.titel;
var RD = {
  hur: { rubrik: 'Hur mycket är …' }.rubrik,
  n2: { rubrik: 'På en skola går 900 elever. 4 % av eleverna spelar schack. Hur många elever spelar schack?' }.rubrik,
  n3: { rubrik: 'En bok har 360 sidor. Sara har läst 25 % av boken. Hur många sidor har hon kvar att läsa?' }.rubrik,
  n4: { rubrik: 'Ett päron väger 150 g. 84 % av päronet är vatten och 10 % är socker.' }.rubrik,
  n5: { rubrik: 'En mössa kostar 240 kr. Rabatten är 35 %. Hur många kronor är rabatten?' }.rubrik,
  n6: { rubrik: 'Hur lång är 65 % av sträckan?' }.rubrik,
  n7: { rubrik: 'Vilket tecken ska stå i rutan: <, = eller >?' }.rubrik,
  n8: { rubrik: 'Ett par skor kostar 400 kr. Rabatten är 20 %. Hur många kronor är rabatten?' }.rubrik
};
TEST.delen1 = function(){
  var D = window.BLAD_K4_D1_DELEN && window.BLAD_K4_D1_DELEN.TYPER, AF = window.SvgAlgebraFigur; if(!D) return null;
  var st = D.st, val = D.val, E = D.E;
  return Y.medNod(D.DELEN, { titel: TITEL_DELEN, grupper: [
    // [Blad 1]
    g(RD.hur, [ st({ fraga: '6 % av 700 kr?' }.fraga, 700, 6, 1, E.kr), st({ fraga: '80 % av 450 kr?' }.fraga, 450, 80, 10, E.kr),
                st({ fraga: '75 % av 280 kr?' }.fraga, 280, 75, 25, E.kr) ]),
    // [Blad 2]
    g(RD.n2, [ st(null, 900, 4, 1, E.elever) ]),
    // [Blad 3] Kvar: 100 % − 25 % = 75 %.
    g(RD.n3, [ st(null, 360, 75, 25, E.sidor) ]),
    // [Blad 4]
    g(RD.n4, [ st({ fraga: 'Hur många gram socker finns i päronet?' }.fraga, 150, 10, 10, E.g),
               st({ fraga: 'Hur många gram vatten finns i päronet?' }.fraga, 150, 84, 4, E.g) ]),
    // [Blad 5]
    g(RD.n5, [ st(null, 240, 35, 5, E.kr) ]),
    // [Blad 5] "(Figur: en sträcka som är 40 mm lång.)"
    g(RD.n6, [ { typ: 'svgfigur', svg: AF ? AF.strackfigur({ delar: [{ text: { etikett: '40 mm' }.etikett }], alt: 'En sträcka som är 40 mm lång' }) : '' },
               st(null, 40, 65, 5, E.mm) ]),
    // [Blad 6]
    g(RD.n7, [ val(['<', '=', '>'], '=', { fraga: '20 % av 90  □  30 % av 60' }.fraga) ]),
    // [Blad 6]
    g(RD.n8, [ val(['A 20 kr', 'B 24 kr', 'C 80 kr', 'D 320 kr'], 'C 80 kr') ])
  ] });
};

var TESTER = [ { id: 'test1', titel: TITEL }, { id: 'andelen1', titel: TITEL_ANDELEN }, { id: 'delen1', titel: TITEL_DELEN } ];
window.BLAD_K4_D1_TEST = {
  TESTER: TESTER,
  test: function(id){ var fn = TEST[String(id || '')]; return fn ? fn() : null; },
  idn: function(){ return Object.keys(TEST); }
};
})();
