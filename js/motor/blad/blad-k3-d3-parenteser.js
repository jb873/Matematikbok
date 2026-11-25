/* blad-k3-d3-parenteser.js — FÖRENKLA UTTRYCK (åk 7, k3 d3), MOMENT 5 "Parenteser" (fördjupning, märke F): Blad 1A–6B.
   Källa (ordagrant, facit kontrollräknat; ändringen och placeringen överst i filen):
     doc/innehall/k3-d3-fordjupning-parenteser.md — steg 1–6 = Blad 1–6, var och ett i A och B.
   SAMMA KOMPONENTER OCH RÄTTNING SOM ÅTTANS D3 (blad-ak8-parentes.js, blad-ak8-mult-parentes.js), ingen parallell variant:
     p     bladkärnans radtyp 'parentes': uttrycket = mellanled = svar. Mellanledet rättas av MellanledRattare (samma
           termer som uttrycket, utan parenteser, med rätt tecken, inte hopslagna, i valfri ordning); svaret av
           AlgBrak.gradePoly (värde, förenklad form, bokstavsordning med siffertermen sist — KONVENTIONER §3).
     fb    förenkla först och beräkna sedan: parentesraden + K-B-kedjan (varde), som d3:s fb men med mellanledet.
     sk    K-C "skriv ett uttryck och förenkla" (skrivforenkla) med figur (rektangel, lådor) eller text.
   MELLANLEDETS KRAV räknas ur uttrycket, aldrig ur rubriken (åttans linje): minus framför en parentes → krävt; plus
   framför eller en siffra framför → frivilligt; där ledet vore en kopia av svaret (3(x + 2) → 3x + 6) ritas ingen
   ledruta, som i åttan (MellanledRattare.kravAv). Klartextens regel: "Står det plus framför eller en siffra framför är
   mellanledet frivilligt."
   MASTERY (k3-storen, noderna för parenteser i k3-taxonomin): steg 1–3 alg-forenkla-parentes:rakna · steg 4–5
   alg-multiplicera-parentes:rakna · steg 6 alg-forenkla-parentes:problem.
   Spärren (NivaRad, §3): Blad 1 och 2 alltid öppna, därefter 80 % på bladet före. Inga hjälptexter. Ingen nätväg. */
(function(){
'use strict';
var T = window.K3D3_TYPER; if(!T) return;
var F = T.F, val = T.val, berakna = T.berakna, lador = T.lador;
/* Parentesradernas hjälpfunktioner bor i blad-k3-d3-typer.js (T.parentes) — samma för bladen och metodträningens drill.
   Mellanledets krav: T.parentes.krav (se där). */
var PT = T.parentes, g = PT.g, p = PT.p, fb = PT.fb, sk = PT.sk;
var NOD_RAKNA = 'alg-forenkla-parentes:rakna', NOD_MULT = 'alg-multiplicera-parentes:rakna',
    NOD_PROBLEM = 'alg-forenkla-parentes:problem';
function rekt(b, h){ return F().rektangel({ bredd: b + ' cm', hojd: h + ' cm' }); }
function lada(vikt, antal){ var ut = []; for(var i = 0; i < antal; i++) ut.push(['Låda', vikt]); return ut; }

// Rubrikerna och frågorna i fält (elevtext-låset). Ordagrant ur klartexten.
var R = {
  forenkla: { rubrik: 'Förenkla.' }.rubrik,
  berakna: { rubrik: 'Beräkna.' }.rubrik,
  valj: { rubrik: 'Välj det förenklade uttrycket.' }.rubrik,
  fb: { rubrik: 'Förenkla uttrycket och beräkna sedan värdet.' }.rubrik
};
var OMK = { fraga: 'Skriv ett uttryck för omkretsen med parentes och förenkla det.' }.fraga;
var OMK2 = { fraga: 'Skriv ett uttryck för omkretsen med parenteser och förenkla det.' }.fraga;
var VIKT = { fraga: 'Skriv ett uttryck för hur mycket lådorna väger tillsammans och förenkla det.' }.fraga;
var KVAR = { fraga: 'Skriv ett uttryck för hur mycket hon har kvar och förenkla det.' }.fraga;
var TITEL = {
  1: { titel: 'Plus framför parentes' }.titel,
  2: { titel: 'Minus framför parentes' }.titel,
  3: { titel: 'Flera parenteser med plus och minus framför' }.titel,
  4: { titel: 'Siffra framför parentes' }.titel,
  5: { titel: 'Flera parenteser med siffra framför, blandat' }.titel,
  6: { titel: 'Tillämpning' }.titel
};
var BLAD = {};

/* ═══ STEG 1 → Blad 1: plus framför parentes ═══ */
BLAD['1A'] = function(){ return { titel: TITEL[1], grupper: [
  g(R.forenkla, NOD_RAKNA, [ p('x + (x + 4)', '2x + 4'), p('3a + (2a + 5)', '5a + 5'), p('(4y + 1) + 6', '4y + 7') ]),
  g(R.forenkla, NOD_RAKNA, [ p('2x + (3x - 5)', '5x - 5'), p('(5a - 2) + a', '6a - 2'), p('7 + (2y - 3)', '2y + 4') ]),
  g(R.forenkla, NOD_RAKNA, [ p('6x + (2x + 3) - 4', '8x - 1'), p('5 + (4a - 2) + a', '5a + 3'), p('2y + (y - 6) + 8', '3y + 2') ]),
  g(R.valj, NOD_RAKNA, [ val('4x + (2x − 3):', ['6x − 3', '6x + 3', '2x − 3'], '6x − 3'),
                         val('(5a + 2) + 3a:', ['10a', '8a + 2', '5a + 5'], '8a + 2'),
                         val('y + (4y − 1) + 5:', ['5y − 6', '4y + 4', '5y + 4'], '5y + 4') ]),
  g(R.fb, NOD_RAKNA, [ fb('när x = 4', 'x + (2x + 5)', '3x + 5', 4, 17), fb('när a = 5', '3a + (a - 2)', '4a - 2', 5, 18) ])
] }; };
BLAD['1B'] = function(){ return { titel: TITEL[1], grupper: [
  g(R.forenkla, NOD_RAKNA, [ p('2x + (x + 3y)', '3x + 3y'), p('(4a + b) + 2b', '4a + 3b'), p('5y + (x + 2y)', 'x + 7y') ]),
  g(R.forenkla, NOD_RAKNA, [ p('3x + (2y - x)', '2x + 2y'), p('(6a - 2b) + a', '7a - 2b'), p('4x + (3x - y) + 2y', '7x + y') ]),
  g(R.forenkla, NOD_RAKNA, [ p('2x + (5y - 3) + 4', '2x + 5y + 1'), p('(3a + 2b - 1) + a + 5', '4a + 2b + 4'), p('x + (4x - 2y + 3) - 1', '5x - 2y + 2') ]),
  g(R.valj, NOD_RAKNA, [ val('3x + (x − 2y):', ['4x + 2y', '4x − 2y', '2xy'], '4x − 2y'),
                         val('(5a + 3b) + 2a − b:', ['7a + 2b', '7a + 4b', '9ab'], '7a + 2b'),
                         val('2y + (3x − y) + 1:', ['3x − y + 1', '3x + 3y + 1', '3x + y + 1'], '3x + y + 1') ]),
  g(R.fb, NOD_RAKNA, [ fb('när x = 3 och y = 2', '2x + (x + 3y)', '3x + 3y', { x: 3, y: 2 }, 15),
                       fb('när a = 2 och b = 5', '(4a - b) + a + 2b', '5a + b', { a: 2, b: 5 }, 15) ])
] }; };

/* ═══ STEG 2 → Blad 2: minus framför parentes ═══ */
BLAD['2A'] = function(){ return { titel: TITEL[2], grupper: [
  g(R.berakna, NOD_RAKNA, [ p('20 - (8 + 5)', '7'), p('15 - (9 - 4)', '10'), p('30 - (12 + 6)', '12') ]),
  g(R.forenkla, NOD_RAKNA, [ p('5x - (2x + 3)', '3x - 3'), p('9a - (4a + 1)', '5a - 1'), p('8y - (3y + 2)', '5y - 2') ]),
  g(R.forenkla, NOD_RAKNA, [ p('6x - (2x - 4)', '4x + 4'), p('10a - (3a - 5)', '7a + 5'), p('7y - (y - 3)', '6y + 3') ]),
  g(R.valj, NOD_RAKNA, [ val('5x − (x + 2):', ['4x + 2', '4x − 2', '6x − 2'], '4x − 2'),
                         val('8a − (3a − 4):', ['5a + 4', '5a − 4', '11a + 4'], '5a + 4'),
                         val('12 − (2y + 5):', ['10y − 5', '−2y + 17', '−2y + 7'], '−2y + 7') ]),
  g(R.fb, NOD_RAKNA, [ fb('när x = 5', '6x - (2x + 3)', '4x - 3', 5, 17), fb('när x = 4', '9x - (4x - 2)', '5x + 2', 4, 22) ])
] }; };
BLAD['2B'] = function(){ return { titel: TITEL[2], grupper: [
  g(R.berakna, NOD_RAKNA, [ p('40 - (15 - 7)', '32'), p('25 - (10 + 3)', '12'), p('18 - (20 - 6)', '4') ]),
  g(R.forenkla, NOD_RAKNA, [ p('7x - (2x + 3y)', '5x - 3y'), p('5a - (a - 2b)', '4a + 2b'), p('6y - (2x + y)', '-2x + 5y') ]),
  g(R.forenkla, NOD_RAKNA, [ p('8x + 4 - (3x + 1)', '5x + 3'), p('9a - (2a - 3b) + b', '7a + 4b'), p('3x + 5y - (x - 2y + 4)', '2x + 7y - 4') ]),
  g(R.valj, NOD_RAKNA, [ val('6x − (2x − y):', ['4x − y', '4x + y', '8x + y'], '4x + y'),
                         val('10a − (4a + 3b):', ['6a − 3b', '6a + 3b', '14a − 3b'], '6a − 3b'),
                         val('4x + 2 − (x − 5):', ['3x − 3', '5x + 7', '3x + 7'], '3x + 7') ]),
  g(R.fb, NOD_RAKNA, [ fb('när x = 2 och y = 5', '7x - (3x - 2y)', '4x + 2y', { x: 2, y: 5 }, 18),
                       fb('när a = 6', '5a + 8 - (2a + 3)', '3a + 5', 6, 23) ])
] }; };

/* ═══ STEG 3 → Blad 3: flera parenteser med plus och minus framför ═══ */
BLAD['3A'] = function(){ return { titel: TITEL[3], grupper: [
  g(R.forenkla, NOD_RAKNA, [ p('(3x + 2) + (x + 5)', '4x + 7'), p('8x - (3x + 4)', '5x - 4'), p('5y + (2y - 4)', '7y - 4') ]),
  g(R.forenkla, NOD_RAKNA, [ p('(6x + 4) - (2x + 1)', '4x + 3'), p('9a - (4a - 3)', '5a + 3'), p('(5y - 3) - (y + 4)', '4y - 7') ]),
  g(R.forenkla, NOD_RAKNA, [ p('(2x + 3) + (x - 1) - (x + 4)', '2x - 2'), p('(4a + 5) - (a + 2) + (3a - 1)', '6a + 2'),
                             p('10 - (2y + 3) + (5y - 1)', '3y + 6') ]),
  g(R.valj, NOD_RAKNA, [ val('(5x + 2) − (3x − 4):', ['2x − 2', '2x + 6', '8x − 2'], '2x + 6'),
                         val('(7a − 1) − (2a + 3):', ['5a − 4', '5a + 2', '9a + 2'], '5a − 4'),
                         val('(y + 6) + (2y − 6) − (y − 3):', ['2y − 3', '4y + 3', '2y + 3'], '2y + 3') ]),
  g(R.fb, NOD_RAKNA, [ fb('när x = 5', '(4x + 3) - (x - 2)', '3x + 5', 5, 20),
                       fb('när x = 6', '(2x + 7) + (x - 4) - (2x + 1)', 'x + 2', 6, 8) ])
] }; };
BLAD['3B'] = function(){ return { titel: TITEL[3], grupper: [
  g(R.forenkla, NOD_RAKNA, [ p('(2x + 3y) + (x - y)', '3x + 2y'), p('6x - (x + 2y)', '5x - 2y'), p('(x + 4) + (2x - 7) + 3', '3x') ]),
  g(R.forenkla, NOD_RAKNA, [ p('(6x + 5y) - (2x + 3y)', '4x + 2y'), p('10a - (3a + b)', '7a - b'), p('(7y + 2) - (3y - 5) - 4', '4y + 3') ]),
  g(R.forenkla, NOD_RAKNA, [ p('(3x + 2y - 1) - (x - y + 4)', '2x + 3y - 5'), p('(2a + 5) + (a - 3b) - (a - 2b + 1)', '2a - b + 4'),
                             p('(8x - 3) - (2x + 5) - (x - 9)', '5x + 1') ]),
  g(R.valj, NOD_RAKNA, [ val('(4x − 3y) − (x − 2y):', ['3x − 5y', '3x − y', '5x − y'], '3x − y'),
                         val('(6a + 2) − (2a − b + 2):', ['4a − b + 4', '8a + b', '4a + b'], '4a + b'),
                         val('(x + 5) − (3x + 1):', ['−2x + 4', '2x + 4', '−2x + 6'], '−2x + 4') ]),
  g(R.fb, NOD_RAKNA, [ fb('när x = 3 och y = 2', '(5x + 2y) - (2x - y)', '3x + 3y', { x: 3, y: 2 }, 15),
                       fb('när x = 4', '(6x - 4) - (2x - 5) - (x + 3)', '3x - 2', 4, 10) ])
] }; };

/* ═══ STEG 4 → Blad 4: siffra framför parentes ═══ */
BLAD['4A'] = function(){ return { titel: TITEL[4], grupper: [
  g(R.berakna, NOD_MULT, [ p('3(4 + 2)', '18'), p('5(10 - 3)', '35'), p('4(6 + 1)', '28') ]),
  g(R.forenkla, NOD_MULT, [ p('3(x + 2)', '3x + 6'), p('4(2a - 1)', '8a - 4'), p('5(y + 3)', '5y + 15') ]),
  g(R.forenkla, NOD_MULT, [ p('2(3x + 4) + x', '7x + 8'), p('3(a - 2) + 5', '3a - 1'), p('4(2y + 1) + 3y - 2', '11y + 2') ]),
  g(R.valj, NOD_MULT, [ val('3(x + 4):', ['3x + 4', '3x + 12', 'x + 12'], '3x + 12'),
                        val('2(5a − 3):', ['10a − 6', '10a − 3', '7a − 5'], '10a − 6'),
                        val('4(2y + 3) + y:', ['8y + 3 + y', '12y + 12', '9y + 12'], '9y + 12') ]),
  g(R.fb, NOD_MULT, [ fb('när x = 5', '3(x + 2) + x', '4x + 6', 5, 26), fb('när x = 3', '2(4x - 1)', '8x - 2', 3, 22) ])
] }; };
BLAD['4B'] = function(){ return { titel: TITEL[4], grupper: [
  g(R.berakna, NOD_MULT, [ p('6(7 + 3)', '60'), p('3(20 - 4)', '48'), p('8(5 + 2)', '56') ]),
  g(R.forenkla, NOD_MULT, [ p('2(x + y)', '2x + 2y'), p('3(2a + b)', '6a + 3b'), p('5(x - 2y)', '5x - 10y') ]),
  g(R.forenkla, NOD_MULT, [ p('3(x + 2y) + 2x', '5x + 6y'), p('4(a - b) + 3b + 2', '4a - b + 2'), p('2(3x + y - 1) + x', '7x + 2y - 2') ]),
  g(R.valj, NOD_MULT, [ val('2(x + 3y):', ['2x + 3y', '2x + 6y', '2x + 5y'], '2x + 6y'),
                        val('5(2a − b):', ['10a − 5b', '10a − b', '7a − 5b'], '10a − 5b'),
                        val('3(x + y) + 2y:', ['3x + 3y', '3x + 2y + 3', '3x + 5y'], '3x + 5y') ]),
  g(R.fb, NOD_MULT, [ fb('när x = 4 och y = 2', '2(x + 3y) + x', '3x + 6y', { x: 4, y: 2 }, 24),
                      fb('när a = 3 och b = 5', '4(a + b) - b', '4a + 3b', { a: 3, b: 5 }, 27) ])
] }; };

/* ═══ STEG 5 → Blad 5: flera parenteser med siffra framför, blandat ═══ */
BLAD['5A'] = function(){ return { titel: TITEL[5], grupper: [
  g(R.forenkla, NOD_MULT, [ p('3(x + 2) + (2x - 1) + 4', '5x + 9'), p('2(a + 4) + 3a + 3(a - 2)', '8a + 2'),
                            p('4(y - 1) + 5y + 7 + (y - 2)', '10y + 1') ]),
  g(R.forenkla, NOD_MULT, [ p('5x + 2(x - 3) - (x + 1)', '6x - 7'), p('4(2a + 1) - (3a - 2) + a', '6a + 6'),
                            p('10 + 3(y - 2) - (2y + 1)', 'y + 3') ]),
  g(R.forenkla, NOD_MULT, [ p('2(3x + 1) - (x - 4) + 3(x + 2) - 5', '8x + 7'), p('a + 3(a - 2) + 2(2a + 5) - (a + 1)', '7a + 3'),
                            p('4(2y + 3) + 2(y - 1) - (3y + 5) + 2', '7y + 7') ]),
  g(R.valj, NOD_MULT, [ val('3(x + 4) − (2x + 5) + 1:', ['x + 18', 'x + 8', '5x + 8'], 'x + 8'),
                        val('2(x − 3) + x − (x − 6):', ['2x − 12', '4x', '2x'], '2x'),
                        val('2(a + 5) − (a + 5) + 3:', ['a + 8', 'a + 18', '3a + 8'], 'a + 8') ]),
  g(R.fb, NOD_MULT, [ fb('när x = 4', '2(x + 3) + 3(x - 1) - x', '4x + 3', 4, 19), fb('när x = 3', '4(x + 2) - (x + 5) + 2x', '5x + 3', 3, 18) ])
] }; };
BLAD['5B'] = function(){ return { titel: TITEL[5], grupper: [
  g(R.forenkla, NOD_MULT, [ p('2(x + y) + 3(x - y) + 4', '5x - y + 4'), p('4(a + 2b) - (a + 3b) + 2a - 1', '5a + 5b - 1'),
                            p('3(2x - 1) + 2(x + 4) + y - (x + 2y)', '7x - y + 5') ]),
  g(R.forenkla, NOD_MULT, [ p('7x + 2(2x - 3) - (x - y) + 5', '10x + y - 1'), p('5(a + 2) + 3(a - 4) - (2a - b)', '6a + b - 2'),
                            p('3(2y + 1) - (4y - 8) + x + 2(x - y)', '3x + 11') ]),
  g(R.forenkla, NOD_MULT, [ p('2(3x + 2y) - (x - y) + 3(x - y) + 4', '8x + 2y + 4'), p('4(a - b + 2) + 2(a + b) - 3b - (a + 5)', '5a - 5b + 3'),
                            p('6 - (x - 4) + 3(2x - 5) + 2(y + 1) - y', '5x + y - 3') ]),
  g(R.valj, NOD_MULT, [ val('5x + 3(x − 2) − (2x − 4):', ['6x − 10', '6x − 2', '10x − 2'], '6x − 2'),
                        val('2(a − 3) + 4(a − 1) − (a + b):', ['5a − b − 10', '5a + b − 10', '7a − b − 10'], '5a − b − 10'),
                        val('3(x + 2y) − (x + y) + 2:', ['2x + 7y + 2', '4x + 5y + 2', '2x + 5y + 2'], '2x + 5y + 2') ]),
  g(R.fb, NOD_MULT, [ fb('när x = 4 och y = 3', '3(x + 2y) - (2x - y) + 4', 'x + 7y + 4', { x: 4, y: 3 }, 29),
                      fb('när x = 5 och y = 2', '2(3x - 1) - (2x - 5) + 3(x - 2) + y', '7x + y - 3', { x: 5, y: 2 }, 34) ])
] }; };

/* ═══ STEG 6 → Blad 6: tillämpning (K-C med figur och text; K-B) ═══ */
BLAD['6A'] = function(){ return { titel: TITEL[6], grupper: [
  g('', NOD_PROBLEM, [ sk(OMK, '2(x + 5) + 2 · 3', '2x + 16', rekt('x + 5', '3')),
                       berakna('Beräkna omkretsen när x = 4.', '2x + 16', 4, 24, 'x', 'cm') ]),
  g({ rubrik: 'Ett paket kostar (x + 6) kr. Lisa köper 3 paket.' }.rubrik, NOD_PROBLEM, [
    sk('Skriv ett uttryck för vad hon betalar och förenkla det.', '3(x + 6)', '3x + 18'),
    berakna('Beräkna priset när x = 10.', '3x + 18', 10, 48, 'x', 'kr') ]),
  g({ rubrik: 'En biljett kostar (b + 20) kr. Familjen köper 4 biljetter och en karta för 15 kr.' }.rubrik, NOD_PROBLEM, [
    sk('Skriv ett uttryck för vad familjen betalar och förenkla det.', '4(b + 20) + 15', '4b + 95'),
    berakna('Beräkna priset när b = 80.', '4b + 95', 80, 415, 'b', 'kr') ]),
  g('', NOD_PROBLEM, [ lador(lada('x + 2 kg', 3).concat(lada('x kg', 1))),
                       sk(VIKT, '3(x + 2) + x', '4x + 6'),
                       berakna('Hur mycket väger lådorna när x = 5?', '4x + 6', 5, 26, 'x', 'kg') ]),
  g({ rubrik: 'Ella har (x + 30) kr. Hon köper en bok för (x − 10) kr.' }.rubrik, NOD_PROBLEM, [
    sk(KVAR, '(x + 30) - (x - 10)', '40') ])
] }; };
BLAD['6B'] = function(){ return { titel: TITEL[6], grupper: [
  g('', NOD_PROBLEM, [ sk(OMK2, '2(2x + 1) + 2(x + 3)', '6x + 8', rekt('2x + 1', 'x + 3')),
                       berakna('Beräkna omkretsen när x = 4.', '6x + 8', 4, 32, 'x', 'cm') ]),
  g({ rubrik: 'Ett paket kostar (2x + 5) kr. Omar köper 4 paket och en påse för 8 kr.' }.rubrik, NOD_PROBLEM, [
    sk('Skriv ett uttryck för vad han betalar och förenkla det.', '4(2x + 5) + 8', '8x + 28'),
    berakna('Beräkna priset när x = 6.', '8x + 28', 6, 76, 'x', 'kr') ]),
  g({ rubrik: 'Familjen Ek köper 3 biljetter för (v + 10) kr styck. Familjen Lind köper 2 biljetter för (v − 5) kr styck.' }.rubrik, NOD_PROBLEM, [
    sk('Skriv ett uttryck för vad familjerna betalar tillsammans och förenkla det.', '3(v + 10) + 2(v - 5)', '5v + 20'),
    berakna('Beräkna vad de betalar när v = 90.', '5v + 20', 90, 470, 'v', 'kr') ]),
  g('', NOD_PROBLEM, [ lador(lada('x + 4 kg', 2).concat(lada('y + 1 kg', 3))),
                       sk(VIKT, '2(x + 4) + 3(y + 1)', '2x + 3y + 11'),
                       berakna('Hur mycket väger lådorna när x = 5 och y = 2?', '2x + 3y + 11', { x: 5, y: 2 }, 27, 'xy', 'kg') ]),
  g({ rubrik: 'Mira har (3x + 20) kr. Hon köper en tröja för (2x + 5) kr.' }.rubrik, NOD_PROBLEM, [
    sk(KVAR, '(3x + 20) - (2x + 5)', 'x + 15'),
    berakna('Beräkna hur mycket hon har kvar när x = 100.', 'x + 15', 100, 115, 'x', 'kr') ])
] }; };

var MOMENT = { titel: 'Parenteser', varianter: ['A', 'B'],
  nivaPrefix: 'k3d3', nivaId: 'parenteser', nivaKrav: { andel: 0.8 },
  blad: [1, 2, 3, 4, 5, 6].map(function(n){ return { nr: n, titel: '' }; }) };

window.BLAD_K3_D3_PARENTESER = {
  MOMENT: MOMENT,
  blad: function(id){ var fn = BLAD[String(id || '').toUpperCase()]; return fn ? fn() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
