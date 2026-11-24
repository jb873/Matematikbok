/* blad-k3-d1-rakna.js — MOMENTET "RÄKNA MED UTTRYCK" (åk 7, k3 Del 1 Algebraiska uttryck, moment 3): blad 1A–2B.
   Källa: doc/innehall/k3-d1-rakna-med-uttryck.md — Joachims klartext (2026-11-22, kontrollräknad). Uppgifter, tal
   och facit ordagrant, med ETT avsteg som Joachim beslutat (2026-11-24): meningarna "Börja med multiplikationen." och
   "Räkna först ut parentesen/parenteserna." står inte i rubrikerna — inga hjälptexter i öva.
   Bråk [täljare | nämnare] skrivs i datan som "(täljare)/(nämnare)" och ritas staplat av bladkärnans K-H.
   Insättning: prioriteringskedjan (prioKedja) med avskriften som tillägg, som prio-bladen — uttrycket med bokstaven
   står tryckt, eleven skriver av det med talet insatt (rättas på FORM mot facits avskrift) och räknar i kedjan (varje
   led på VÄRDE, genvägsregeln gäller). Rader med bara en räkneoperation (facit: avskrift = svar) har ett FRIVILLIGT
   första led (rad.ledFrivilligt, den befintliga regeln "frivilligt mellanled") — Joachim 2026-11-24.
   "Vilket värde på x …": valrutan, ett rätt alternativ.
   Mastery: alg-berakna:rakna (k3-storen, "Beräkna med uttryck"), samma nod som tolka-bladens beräkna-rader.
   Ingen nätväg. */
(function(){
'use strict';
var BERAKNA = 'alg-berakna:rakna';
function g(rubrik, rader){ return { rubrik: rubrik, logg: BERAKNA, loggStore: 'k3', rader: rader }; }
// Insättning: uttryck = det tryckta (med bokstaven), avskrift = facits avskrift med insatt tal, led = facits mellanled.
function sattIn(uttryck, avskrift, led, svar){
  return { typ: 'prioKedja', vansterText: uttryck, avskrift: { visa: avskrift }, led: led[0], facitLed: led, svar: svar };
}
// En räkneoperation: facit är avskrift = svar. Ledet är frivilligt; facits exempelled är avskriften själv.
function enOp(uttryck, avskrift, svar){
  return { typ: 'prioKedja', vansterText: uttryck, avskrift: { visa: avskrift }, led: avskrift, facitLed: [],
           ledFrivilligt: true, svar: svar };
}
function valj(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: [ratt] }; }
function dok(blad, roll, tak){
  return { del: 'Del 1 Algebraiska uttryck', moment: 'Räkna med uttryck', blad: blad, arskurs: 7, roll: roll,
           metod: 'Insättning', takregel: tak + ' (golv = blad 1, tak = blad 2).',
           kalla: 'doc/innehall/k3-d1-rakna-med-uttryck.md' };
}
var TITEL = 'Räkna med uttryck';
/* Elevtext i fält (elevtext-låset läser bara kända fält). Godkända av Joachim 2026-11-24, ordagrant ur klartexten
   utan hjälpmeningarna. */
var INTRO_1 = { intro: 'Skriv av uttrycket, sätt in talet och räkna i flera led.' }.intro;
var INTRO_2 = { intro: 'Skriv av uttrycket, sätt in talen och räkna i flera led.' }.intro;
var R = {
  x4:  { rubrik: 'Beräkna uttryckets värde när x = 4.' }.rubrik,
  x6:  { rubrik: 'Beräkna uttryckets värde när x = 6.' }.rubrik,
  y8:  { rubrik: 'Beräkna uttryckets värde när y = 8.' }.rubrik,
  a2:  { rubrik: 'Beräkna uttrycket 2a + 7 när' }.rubrik,
  x3:  { rubrik: 'Beräkna uttryckets värde när x = 3.' }.rubrik,
  x5:  { rubrik: 'Beräkna uttryckets värde när x = 5.' }.rubrik,
  x7:  { rubrik: 'Beräkna uttryckets värde när x = 7.' }.rubrik,
  y12: { rubrik: 'Beräkna uttryckets värde när y = 12.' }.rubrik,
  b4:  { rubrik: 'Beräkna uttrycket 4b − 3 när' }.rubrik,
  ab43:{ rubrik: 'Beräkna uttryckets värde när a = 4 och b = 3.' }.rubrik,
  x25: { rubrik: 'Beräkna uttryckets värde när x = 2,5.' }.rubrik,
  x9:  { rubrik: 'Beräkna uttryckets värde när x = 9.' }.rubrik,
  xy52:{ rubrik: 'Beräkna uttryckets värde när x = 5 och y = 2.' }.rubrik,
  ab64:{ rubrik: 'Beräkna uttryckets värde när a = 6 och b = 4.' }.rubrik,
  x15: { rubrik: 'Beräkna uttryckets värde när x = 1,5.' }.rubrik,
  x8:  { rubrik: 'Beräkna uttryckets värde när x = 8.' }.rubrik,
  xy63:{ rubrik: 'Beräkna uttryckets värde när x = 6 och y = 3.' }.rubrik,
  VALJ:{ rubrik: 'Vilket värde på x ger uttrycket rätt värde? Välj.' }.rubrik
};
var BLAD = {};

/* ── BLAD 1A ── */
BLAD['1A'] = function(){ return { titel: TITEL, intro: INTRO_1, dokument: dok('1A', 'kärna', 'golv'), grupper: [
  g(R.x4, [ enOp('x + 9', '4 + 9', 13), enOp('5x', '5 · 4', 20), enOp('12 − x', '12 − 4', 8) ]),
  g(R.x6, [ sattIn('3x + 5', '3 · 6 + 5', ['18 + 5'], 23), sattIn('4x − 7', '4 · 6 − 7', ['24 − 7'], 17),
            sattIn('25 − 2x', '25 − 2 · 6', ['25 − 12'], 13) ]),
  g(R.y8, [ sattIn('y/2 + 3', '8/2 + 3', ['4 + 3'], 7), sattIn('30 − y/4', '30 − 8/4', ['30 − 2'], 28),
            sattIn('5 · (y − 3)', '5 · (8 − 3)', ['5 · 5'], 25) ]),
  g(R.a2, [ sattIn('a = 3', '2 · 3 + 7', ['6 + 7'], 13), sattIn('a = 10', '2 · 10 + 7', ['20 + 7'], 27),
            sattIn('a = 0', '2 · 0 + 7', ['0 + 7'], 7) ]),
  g(R.x3, [ sattIn('6 + (2x + 5)', '6 + (2 · 3 + 5)', ['6 + (6 + 5)', '6 + 11'], 17),
            sattIn('(4x − 2) + 10', '(4 · 3 − 2) + 10', ['(12 − 2) + 10', '10 + 10'], 20),
            sattIn('20 − (x + 4)', '20 − (3 + 4)', ['20 − 7'], 13) ])
] }; };

/* ── BLAD 1B ── */
BLAD['1B'] = function(){ return { titel: TITEL, intro: INTRO_1, dokument: dok('1B', 'kärna', 'golv'), grupper: [
  g(R.x5, [ enOp('x + 8', '5 + 8', 13), enOp('7x', '7 · 5', 35), enOp('15 − x', '15 − 5', 10) ]),
  g(R.x7, [ sattIn('3x + 5', '3 · 7 + 5', ['21 + 5'], 26), sattIn('6x − 9', '6 · 7 − 9', ['42 − 9'], 33),
            sattIn('40 − 4x', '40 − 4 · 7', ['40 − 28'], 12) ]),
  g(R.y12, [ sattIn('y/3 + 6', '12/3 + 6', ['4 + 6'], 10), sattIn('20 − y/4', '20 − 12/4', ['20 − 3'], 17),
             sattIn('2 · (y − 5)', '2 · (12 − 5)', ['2 · 7'], 14) ]),
  g(R.b4, [ sattIn('b = 2', '4 · 2 − 3', ['8 − 3'], 5), sattIn('b = 5', '4 · 5 − 3', ['20 − 3'], 17),
            sattIn('b = 10', '4 · 10 − 3', ['40 − 3'], 37) ]),
  g(R.x4, [ sattIn('9 + (3x + 2)', '9 + (3 · 4 + 2)', ['9 + (12 + 2)', '9 + 14'], 23),
            sattIn('(5x − 6) + 8', '(5 · 4 − 6) + 8', ['(20 − 6) + 8', '14 + 8'], 22),
            sattIn('30 − (2x + 1)', '30 − (2 · 4 + 1)', ['30 − (8 + 1)', '30 − 9'], 21) ])
] }; };

/* ── BLAD 2A ── */
BLAD['2A'] = function(){ return { titel: TITEL, intro: INTRO_2, dokument: dok('2A', 'kärna', 'tak'), grupper: [
  g(R.ab43, [ enOp('a + b', '4 + 3', 7), sattIn('2a + b', '2 · 4 + 3', ['8 + 3'], 11),
              sattIn('5a − 2b', '5 · 4 − 2 · 3', ['20 − 6'], 14) ]),
  g(R.x25, [ enOp('4x', '4 · 2,5', 10), sattIn('2x + 3', '2 · 2,5 + 3', ['5 + 3'], 8),
             sattIn('10 − 2x', '10 − 2 · 2,5', ['10 − 5'], 5) ]),
  g(R.x9, [ sattIn('x/3 + 2x', '9/3 + 2 · 9', ['3 + 18'], 21),
            sattIn('3 · (x + 1) − 5', '3 · (9 + 1) − 5', ['3 · 10 − 5', '30 − 5'], 25),
            sattIn('(x + 6)/5 + x', '(9 + 6)/5 + 9', ['15/5 + 9', '3 + 9'], 12) ]),
  g(R.VALJ, [ valj({ fraga: '3x + 4 har värdet 19.' }.fraga, ['4', '5', '6'], '5'), valj({ fraga: '20 − x har värdet 12.' }.fraga, ['6', '8', '10'], '8'),
              valj({ fraga: '2x − 3 har värdet 11.' }.fraga, ['5', '7', '9'], '7') ]),
  g(R.xy52, [ sattIn('(3x + 2) − (4y − 6)', '(3 · 5 + 2) − (4 · 2 − 6)', ['(15 + 2) − (8 − 6)', '17 − 2'], 15),
              sattIn('(2x + 7) + (3y − 1)', '(2 · 5 + 7) + (3 · 2 − 1)', ['(10 + 7) + (6 − 1)', '17 + 5'], 22),
              sattIn('40 − (x + 3y)', '40 − (5 + 3 · 2)', ['40 − (5 + 6)', '40 − 11'], 29) ])
] }; };

/* ── BLAD 2B ── */
BLAD['2B'] = function(){ return { titel: TITEL, intro: INTRO_2, dokument: dok('2B', 'kärna', 'tak'), grupper: [
  g(R.ab64, [ enOp('a − b', '6 − 4', 2), sattIn('3a + 2b', '3 · 6 + 2 · 4', ['18 + 8'], 26),
              sattIn('4a − 3b', '4 · 6 − 3 · 4', ['24 − 12'], 12) ]),
  g(R.x15, [ enOp('6x', '6 · 1,5', 9), sattIn('4x + 2', '4 · 1,5 + 2', ['6 + 2'], 8),
             sattIn('12 − 3x', '12 − 3 · 1,5', ['12 − 4,5'], 7.5) ]),
  g(R.x8, [ sattIn('x/4 + 3x', '8/4 + 3 · 8', ['2 + 24'], 26),
            sattIn('2 · (x − 3) + 7', '2 · (8 − 3) + 7', ['2 · 5 + 7', '10 + 7'], 17),
            sattIn('(x + 12)/4 − 2', '(8 + 12)/4 − 2', ['20/4 − 2', '5 − 2'], 3) ]),
  g(R.VALJ, [ valj({ fraga: '4x + 3 har värdet 27.' }.fraga, ['5', '6', '7'], '6'), valj({ fraga: '30 − 2x har värdet 20.' }.fraga, ['5', '10', '25'], '5'),
              valj({ fraga: 'x/2 + 4 har värdet 9.' }.fraga, ['5', '10', '13'], '10') ]),
  g(R.xy63, [ sattIn('(4x − 5) − (2y + 1)', '(4 · 6 − 5) − (2 · 3 + 1)', ['(24 − 5) − (6 + 1)', '19 − 7'], 12),
              sattIn('(x + 8) + (5y − 4)', '(6 + 8) + (5 · 3 − 4)', ['14 + (15 − 4)', '14 + 11'], 25),
              sattIn('50 − (3x − y)', '50 − (3 · 6 − 3)', ['50 − (18 − 3)', '50 − 15'], 35) ])
] }; };

/* MOMENTET: två blad med varianterna A och B. Ingen spärr (Joachim 2026-11-24: §3 står kvar, Blad 1 och 2 alltid
   öppna, som i prioriteringsregeln). Bladen saknar egna namn — momentsidan visar "Blad 1", "Blad 2". */
var MOMENT = { titel: 'Räkna med uttryck', varianter: ['A', 'B'],
  blad: [ { nr: 1, titel: '' }, { nr: 2, titel: '' } ] };

window.BLAD_K3_D1_RAKNA = {
  MOMENT: MOMENT,
  blad: function(id){ var f = BLAD[String(id || '').toUpperCase()]; return f ? f() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
