/* blad-k3-d3-test.js — TESTEN I FÖRENKLA UTTRYCK (åk 7, k3 d3): test 1–6.
   Källa: doc/innehall/k3-d3-test.md (Joachims test 2026-11-25, facit kontrollräknat; test 6 nr 8a "5b + 3v" i
   bokstavsordning). Uppgifter, tal och facit ordagrant; hakparentesen (vilket steg uppgiften liknar) står bara här.
   Samma komponenter som bladen uppgiften liknar (blad-k3-d3-typer.js och moment 2:s): förenkla-rutan med ordningsregeln
   (KONVENTIONER §3), valrutan, ringa in, talrutor, rutan för saknat tal, prioKedjan för "Beräkna" med flera tal, K-C och
   K-B; figurerna rektangel, liksidig triangel, kvadrat, likbent triangel, prislappar och lådor.
   Mastery: samma noder som bladen — förenkla alg-samla:rakna (k3), negativa tal neg-rakna:addsub / neg-rakna:multdiv
   (k1, hemvisten). Öppnas på uppgiftssidan: uppgift.html?test=test1 … test6. Ingen nätväg. */
(function(){
'use strict';
var T = window.K3D3_TYPER; if(!T) return;
var F = T.F, g = T.g, f = T.forenkla, val = T.val, ringa = T.ringa, omk = T.omkrets, skriv = T.skriv,
    berakna = T.berakna, fb = T.fb, figur = T.figur, lador = T.lador, R = T.R;
var ADDSUB = 'neg-rakna:addsub', MULTDIV = 'neg-rakna:multdiv';
// Negativa tal: k1-noden (som moment 2), utan k3-store.
function gn(rubrik, rader, nod){ return { rubrik: rubrik, logg: nod || ADDSUB, rader: rader }; }
function ruta(uttryck, svar){ return { typ: 'lucka', text: uttryck + ' = __', svar: svar }; }
function lucka(text, svar){ return { typ: 'lucka', text: text, svar: svar }; }
function kedja(uttryck, led, svar){ return { typ: 'prioKedja', vansterText: uttryck, avskrift: { visa: uttryck }, led: led[0], facitLed: led, svar: svar }; }
function valn(fraga, alt, ratt, nod){ var r = val(fraga, alt, ratt); if(nod) r.logg = nod; return r; }
// "Förenkla uttrycket och beräkna sedan värdet. a) 4x + 3x när x = 5": frågan på raden, sedan förenkling och K-B.
function fbn(fraga, uttryck, forenklat, x, svar, vars){ var r = fb(uttryck, forenklat, x, svar, vars); r.fraga = fraga; return r; }
function rekt(b, h){ return F().rektangel({ bredd: b + ' cm', hojd: h + ' cm' }); }
var RR = {
  summan: { rubrik: 'Skriv summan som ett kortare uttryck.' }.rubrik,
  sammaSak: { rubrik: 'Välj det uttryck som betyder samma sak.' }.rubrik,
  berakna: { rubrik: 'Beräkna.' }.rubrik,
  rutan: { rubrik: 'Vilket tal ska stå i rutan?' }.rubrik,
  rattSvar: { rubrik: 'Välj rätt svar.' }.rubrik,
  ringa: { rubrik: 'Ringa in alla variabeltermer.' }.rubrik,
  fbv: { rubrik: 'Förenkla uttrycket och beräkna sedan värdet.' }.rubrik
};
var OMK = { fraga: 'Skriv ett uttryck för omkretsen och förenkla det:' }.fraga;
function nar(text){ return { rubrik: 'Förenkla uttrycket och beräkna sedan värdet när ' + text + '.' }.rubrik; }
var TEST = {};

/* ── TEST 1 – Samma variabel ── */
TEST.test1 = function(){ return { titel: 'Test 1', grupper: [
  // [S1 nr 1]
  g(RR.summan, [ f('x + x + x + x', '4x'), f('y + y', '2y', 'y'), f('a + a + a + a + a', '5a', 'a') ]),
  // [S1 nr 2]
  g(RR.sammaSak, [ val('3x:', ['3 + x', 'x + x + x', '3 + 3 + 3'], 'x + x + x'), val('2y + y:', ['3y', '2y', '3 + y'], '3y'),
                   val('5a:', ['a + 5', '5 + 5 + 5 + 5 + 5', 'a + a + a + a + a'], 'a + a + a + a + a') ]),
  // [S2 blad 1]
  g(R.forenkla, [ f('6x + 2x', '8x'), f('9y − 5y', '4y', 'y'), f('7a − a', '6a', 'a') ]),
  // [S2 blad 1 nr 3]
  g(R.forenkla, [ f('2x + 4x + x', '7x'), f('10y − 3y − 2y', '5y', 'y'), f('4a − 4a', '0', 'a') ]),
  // [S2 blad 2]
  g(R.forenkla, [ f('3 · 4x', '12x'), f('6y · 3', '18y', 'y'), f('15a/3', '5a', 'a') ]),
  // [S2 blad 1–2 nr 4]
  g(R.valj, [ val('5 · 2x:', ['7x', '52x', '10x'], '10x'), val('12y/4:', ['3y', '8y', '3'], '3y'), val('2a + 3a:', ['6a', '5a', '5 + a'], '5a') ]),
  // [S1 nr 4]
  g(R.omkrets, [ omk(F().triangel({ ben: 'a cm', bas: 'a cm', liksidig: true }), ['a', 'a', 'a'], '3a', 'a'),
                 omk(F().rektangel({ bredd: '2x cm', hojd: '2x cm', kvadrat: true }), ['2x', '2x', '2x', '2x'], '8x', 'x') ]),
  // [S2 nr 5]
  g(RR.fbv, [ fbn('4x + 3x när x = 5', '4x + 3x', '7x', 5, 35, 'x'), fbn('10y/2 när y = 6', '10y/2', '5y', 6, 30, 'y') ])
] }; };

/* ── TEST 2 – Negativa tal ── */
TEST.test2 = function(){ return { titel: 'Test 2', grupper: [
  // [S3 blad 1 nr 2]
  gn(RR.berakna, [ ruta('3 − 8', -5), ruta('6 − 10', -4), ruta('1 − 7', -6) ]),
  // [S3 blad 1 nr 3]
  gn(RR.berakna, [ ruta('−4 + 9', 5), ruta('−10 + 3', -7), ruta('−2 − 6', -8) ]),
  // [S3 blad 1–2]
  gn(RR.berakna, [ kedja('5 − 9 + 3', ['−4 + 3'], -1), kedja('−6 + 8 − 7', ['2 − 7'], -5), kedja('10 − 4 − 8', ['6 − 8'], -2) ]),
  // [S3 blad 2 nr 3]
  gn(RR.rutan, [ lucka('7 − __ = −3', 10), lucka('__ + 6 = 2', -4), lucka('−5 − __ = −9', 4) ]),
  // [S3 blad 3 nr 1–2]
  gn(RR.berakna, [ kedja('4 − (−5)', ['4 + 5'], 9), kedja('−7 − (−2)', ['−7 + 2'], -5), kedja('3 + (−9)', ['3 − 9'], -6) ]),
  // [S3 blad 3 nr 3]
  gn(RR.berakna, [ ruta('5 · (−4)', -20), ruta('(−3) · (−6)', 18), ruta('(−24)/6', -4) ], MULTDIV),
  // [S3 blad 2–3 nr 4]
  gn(RR.rattSvar, [ valn('2 − 9:', ['7', '−11', '−7'], '−7'), valn('(−4) · 5:', ['−20', '20', '1'], '−20', MULTDIV), valn('−3 − (−3):', ['−6', '0', '6'], '0') ]),
  // [S2 nr 5, från moment 1]
  g(RR.fbv, [ fbn('5x − 2x när x = 4', '5x - 2x', '3x', 4, 12, 'x'), fbn('2 · 4y när y = 3', '2 · 4y', '8y', 3, 24, 'y') ])
] }; };

/* ── TEST 3 – Siffertermer och två variabler ── */
TEST.test3 = function(){ return { titel: 'Test 3', grupper: [
  // [S4 blad 1 nr 1]
  g(RR.ringa, [ ringa('6x + 9 + 2x', ['6x', '9', '2x'], ['6x', '2x']), ringa('4 + 7y − 2', ['4', '7y', '−2'], ['7y']),
                ringa('3a + 5 + a + 1', ['3a', '5', 'a', '1'], ['3a', 'a']) ]),
  // [S4 blad 1–2]
  g(R.forenkla, [ f('4x + 6 + 3x + 2', '7x + 8'), f('5a + 7 + a − 10', '6a - 3', 'a'), f('9 + 2y − 14 + 4y', '6y - 5', 'y') ]),
  // [S5 blad 1–2]
  g(R.forenkla, [ f('3x + 4y + 2x + y', '5x + 5y', 'xy'), f('7a − 2b + a − 3b', '8a - 5b', 'ab'), f('y + 6x + 4y − 2y', '6x + 3y', 'xy') ]),
  // [S6 blad 2]
  g(R.forenkla, [ f('2x + 3y + 5 + 4x − y − 8', '6x + 2y - 3', 'xy'), f('6 + 5a − 2b − a − 9', '4a - 2b - 3', 'ab'), f('8x − 3y − 2 − 5x + y + 7', '3x - 2y + 5', 'xy') ]),
  // [S4–S6 nr 4]
  g(R.valj, [ val('4x + 2y + 3x + 5y:', ['14xy', '7x + 7y', '7x + 3y'], '7x + 7y'), val('3a + 8 − 2a − 10:', ['a − 2', 'a + 18', '5a − 2'], 'a − 2'),
              val('5x − 2y + 1 + x − 4y − 6:', ['6x + 6y − 5', '6x − 2y − 5', '6x − 6y − 5'], '6x − 6y − 5') ]),
  // [S6 blad 1 nr 2]
  g('', [ omk(rekt('x + 4', 'y'), ['x + 4', 'y', 'x + 4', 'y'], '2x + 2y + 8', 'xy', OMK) ]),
  // [S6 blad 1 nr 2]
  g('', [ omk(F().triangel({ ben: '2a cm', bas: 'b + 3 cm' }), ['2a', '2a', 'b + 3'], '4a + b + 3', 'ab', OMK) ]),
  // [S4–S6 nr 5]
  g(nar('x = 3 och y = 2'), [ fb('5x + 2y - 4 + x - 3y', '6x - y - 4', { x: 3, y: 2 }, 12, 'xy'), fb('3x + 7 + 2x - 9', '5x - 2', { x: 3, y: 2 }, 13, 'xy') ])
] }; };

/* ── TEST 4 – Negativa termer och tillämpning ── */
TEST.test4 = function(){ return { titel: 'Test 4', grupper: [
  // [S7 blad 1 nr 1]
  g(R.forenkla, [ f('4x − 9x', '-5x'), f('2y − 3y − 6y', '-7y', 'y'), f('a − 9a + 2a', '-6a', 'a') ]),
  // [S7 blad 1 nr 2–3]
  g(R.forenkla, [ f('3 + 2x − 7x', '-5x + 3'), f('6x − 2 − 8x − 5', '-2x - 7'), f('4x + 5y − 9x − 2y', '-5x + 3y', 'xy') ]),
  // [S7 blad 2]
  g(R.forenkla, [ f('0,4x + 0,9x', '1,3x'), f('2,5y + 3 − 1,5y + 0,5', 'y + 3,5', 'y'), f('1,2x − 2,2x + 4', '-x + 4') ]),
  // [S7 nr 4]
  g(R.valj, [ val('5x − 8x + 2:', ['3x + 2', '−3x + 2', '−13x + 2'], '−3x + 2'), val('0,5a + 1,5a − 3:', ['2a + 3', '1,5a − 3', '2a − 3'], '2a − 3'),
              val('2y − 7y + 3x:', ['3x − 5y', '3x + 5y', '5x − 3y'], '3x − 5y') ]),
  // [S8 blad 1 nr 1]
  g('', [ omk(rekt('x + 5', 'x'), ['x', 'x + 5', 'x', 'x + 5'], '4x + 10', 'x', OMK),
          berakna('Beräkna omkretsen när x = 3,5.', '4x + 10', '3,5', 24, 'x', 'cm') ]),
  // [S8 blad 1 nr 3]
  g('', [ figur(F().prislappar({ varor: [{ namn: 'Suddgummi', pris: 'x kr' }, { namn: 'Penna', pris: 'x + 9 kr' }, { namn: 'Linjal', pris: '18 kr' }] })),
          skriv('Skriv och förenkla ett uttryck för priset för två suddgummin, en penna och en linjal:', 'x + x + x + 9 + 18', '3x + 27'),
          berakna('Beräkna priset när x = 6.', '3x + 27', 6, 45, 'x', 'kr') ]),
  // [S8 blad 2 nr 4]
  g('', [ lador([['Blå låda', 'x kg'], ['Blå låda', 'x kg'], ['Röd låda', 'y kg'], ['Röd låda', '2y kg'], ['Låda', '7 kg']]),
          skriv({ fraga: 'Skriv och förenkla ett uttryck för hur mycket lådorna väger tillsammans:' }.fraga, 'x + x + y + 2y + 7', '2x + 3y + 7', 'xy'),
          berakna('Hur mycket väger lådorna när x = 1,5 och y = 4?', '2x + 3y + 7', { x: '1,5', y: 4 }, 22, 'xy', 'kg') ]),
  // [S7 nr 5]
  g(nar('x = 4'), [ fb('6 - 2x - 3x', '-5x + 6', 4, -14), fb('1,5x + 2 - 0,5x', 'x + 2', 4, 6) ])
] }; };

/* ── TEST 5 – Hela avsnittet, grund ── */
TEST.test5 = function(){ return { titel: 'Test 5', grupper: [
  // [S1 nr 1]
  g(RR.summan, [ f('y + y + y', '3y', 'y'), f('x + x + x + x + x + x', '6x'), f('b + b', '2b', 'b') ]),
  // [S2]
  g(R.forenkla, [ f('8x + 3x', '11x'), f('12y − 7y', '5y', 'y'), f('4 · 3a', '12a', 'a') ]),
  // [S3 blad 1]
  gn(RR.berakna, [ ruta('4 − 10', -6), ruta('−3 + 8', 5), ruta('−5 − 4', -9) ]),
  // [S4]
  g(R.forenkla, [ f('2x + 5 + 3x + 1', '5x + 6'), f('6y + 2 − 2y − 7', '4y - 5', 'y'), f('4a + 9 − a', '3a + 9', 'a') ]),
  // [S5–S6]
  g(R.forenkla, [ f('2x + 4y + 3x + y', '5x + 5y', 'xy'), f('3a + 2b + 4 + a + b + 1', '4a + 3b + 5', 'ab'), f('6x + 3y − 2x − y', '4x + 2y', 'xy') ]),
  // [S5, S4, S7 nr 4]
  g(R.valj, [ val('3x + 2y + x:', ['6xy', '4x + 2y', '3x + 3y'], '4x + 2y'), val('5 + 2a + 3 + a:', ['3a + 8', '11a', '2a + 8'], '3a + 8'),
              val('7y − 9y:', ['2y', '−16y', '−2y'], '−2y') ]),
  // [S8 blad 1 nr 1]
  g('', [ omk(rekt('x', '6'), ['x', '6', 'x', '6'], '2x + 12', 'x', OMK), berakna('Beräkna omkretsen när x = 4.', '2x + 12', 4, 20, 'x', 'cm') ]),
  // [S2, S4 nr 5]
  g(nar('x = 5'), [ fb('3x + 4 + x', '4x + 4', 5, 24), fb('12x/3', '4x', 5, 20) ])
] }; };

/* ── TEST 6 – Hela avsnittet, svår ── */
TEST.test6 = function(){ return { titel: 'Test 6', grupper: [
  // [S2 blad 1–2]
  g(R.forenkla, [ f('24x/8', '3x'), f('7y · 6', '42y', 'y'), f('3a + 4a − 7a', '0', 'a') ]),
  // [S3 blad 2–3]
  gn(RR.berakna, [ kedja('12 − 19 + 4 − 6', ['−7 + 4 − 6', '−3 − 6'], -9), kedja('−8 − (−11)', ['−8 + 11'], 3),
                   (function(){ var r = ruta('(−36)/(−4)', 9); r.logg = MULTDIV; return r; })() ]),
  // [S4 blad 2]
  g(R.forenkla, [ f('7x − 4 − 2x + 9 − 5', '5x'), f('9 + 3y − 14 + y', '4y - 5', 'y'), f('6a − 3 + 2a − 8 + 1', '8a - 10', 'a') ]),
  // [S6 blad 2, S7 blad 1 nr 3]
  g(R.forenkla, [ f('5x − 2y + 7 + 6x − 4y − 9', '11x - 6y - 2', 'xy'), f('3a + 6b − 8 − a − 9b + 2', '2a - 3b - 6', 'ab'),
                  f('12y − 5x − 2y − 4x', '-9x + 10y', 'xy') ]),
  // [S7 blad 1–2]
  g(R.forenkla, [ f('0,6x − 1,8x + 2,5', '-1,2x + 2,5'), f('3,5x + 8 − 2x + 0,5 − x', '0,5x + 8,5'), f('2x − 7y + 3 − 5x + 4y', '-3x - 3y + 3', 'xy') ]),
  // [S6–S7 nr 4]
  g(R.valj, [ val('4x − y − 9x + 3y:', ['−5x + 2y', '5x + 2y', '−5x − 4y'], '−5x + 2y'), val('0,5a − 2 + 1,5a − 3:', ['2a − 1', '2,5a − 5', '2a − 5'], '2a − 5'),
              val('2y − 4 + 3x − 2y + 1:', ['3x + 4y − 3', '3x − 3', '3x − 5'], '3x − 3') ]),
  // [S8 blad 2 nr 1, 5]
  g('', [ omk(rekt('2x + 3', 'y + 2'), ['2x + 3', 'y + 2', '2x + 3', 'y + 2'], '4x + 2y + 10', 'xy', OMK),
          berakna('Beräkna omkretsen när x = 2,5 och y = 4.', '4x + 2y + 10', { x: '2,5', y: 4 }, 28, 'xy', 'cm') ]),
  // [S8 blad 2B nr 3]
  g({ rubrik: 'En vuxenbiljett kostar v kr och en barnbiljett b kr. Familjen Ek köper 2 vuxenbiljetter och 4 barnbiljetter. Familjen Lind köper 1 vuxenbiljett och 1 barnbiljett.' }.rubrik, [
    skriv('Skriv och förenkla ett uttryck för vad familjerna betalar tillsammans:', '2v + 4b + v + b', '5b + 3v', 'bv'),
    berakna('Beräkna vad de betalar tillsammans när v = 110 och b = 70.', '5b + 3v', { v: 110, b: 70 }, 680, 'bv', 'kr') ])
] }; };

var TESTER = [1, 2, 3, 4, 5, 6].map(function(n){ return { id: 'test' + n, titel: 'Test ' + n }; });

window.BLAD_K3_D3_TEST = {
  TESTER: TESTER,
  test: function(id){ var fn = TEST[String(id || '')]; return fn ? fn() : null; },
  idn: function(){ return Object.keys(TEST); }
};
})();
