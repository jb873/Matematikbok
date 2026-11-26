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
var TITEL = { titel: 'Test 1' }.titel;
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

var TESTER = [ { id: 'test1', titel: TITEL } ];
window.BLAD_K4_D1_TEST = {
  TESTER: TESTER,
  test: function(id){ var fn = TEST[String(id || '')]; return fn ? fn() : null; },
  idn: function(){ return Object.keys(TEST); }
};
})();
