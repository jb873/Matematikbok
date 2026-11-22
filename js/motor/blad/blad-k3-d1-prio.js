/* blad-k3-d1-prio.js — MOMENTET "PRIORITERINGSREGELN" (åk 7, k3 Del 1 Algebraiska uttryck, moment 2): blad 1A–2B.
   Källa: doc/innehall/k3-d1-prioriteringsregeln.md — Joachims klartext (2026-11-22, 1A/1B nr 3 och 2A/2B nr 1–2,
   kontrollräknad) och bladfilernas klartextdelar. Uppgifter, tal och facit ordagrant; förlagan [inom hakparentes]
   står bara här i kommentaren, aldrig för eleven.
   Bråk [täljare | nämnare] skrivs i datan som "(täljare)/(nämnare)" och ritas staplat, utan parenteser, av
   bladkärnans K-H (AK8_UI.mattextUt).
   Beräkna: eleven skriver av uttrycket (avskriftsrutan) och visar mellanled (flerled) — varje led rättas på FORM
   (jamforForm: termer och faktorer får byta ordning på varje nivå; bråk som "15/5" eller "15:5").
   Mastery: prio-prioritering:rakna i k1-storen — prioriteringsregelns hemvist (KONVENTIONER: en delad nod loggas i
   sin hemvist), samma nod som k1 d10:s och nians "Beräkna – visa mellanled".
   Ingen nätväg. */
(function(){
'use strict';
var PRIO = 'prio-prioritering:rakna';
function g(rubrik, rader){ return { rubrik: rubrik, logg: PRIO, rader: rader }; }
// Beräkna: uttrycket står tryckt, eleven skriver av det och räknar led för led; sista ledet är svaret.
function berakna(uttryck, led, svar){
  return { typ: 'flerled', vansterText: uttryck, avskrift: { visa: uttryck },
           led: led.map(function(l){ return { visa: l }; }).concat([{ svar: svar }]) };
}
// "Vilket tal ska stå i rutan": luckan står där rutan står i likheten.
function lucka(text, svar){ return { typ: 'lucka', text: text, svar: svar }; }
function utt(fraga, svar){ return { typ: 'uttryck', fraga: fraga, svar: svar }; }
function dok(blad, roll, tak){
  return { del: 'Del 1 Algebraiska uttryck', moment: 'Prioriteringsregeln', blad: blad, arskurs: 7, roll: roll,
           metod: 'Prioriteringsregeln', takregel: tak + ' (golv = blad 1, tak = blad 2).',
           kalla: 'doc/innehall/k3-d1-prioriteringsregeln.md' };
}
var TITEL = 'Prioriteringsregeln';
var BLAD = {};

/* ── BLAD 1A ── "Skriv av uttrycket och visa ett mellanled i varje uppgift." */
BLAD['1A'] = function(){ return { titel: TITEL, dokument: dok('1A', 'kärna', 'golv'), grupper: [
  // [Grundkurs 1, 2.2 2031]
  g('Beräkna.', [ berakna('4 + 3 · 6', ['4 + 18'], 22), berakna('5 · 7 + 2', ['35 + 2'], 37), berakna('(6 + 2) · 3', ['8 · 3'], 24) ]),
  // [Grundkurs 2, 2.2 2032]
  g('Beräkna.', [ berakna('20 − 3 · 4', ['20 − 12'], 8), berakna('6 · 5 − 7', ['30 − 7'], 23), berakna('(11 − 4) · 3', ['7 · 3'], 21) ]),
  // [2.2 2034, Grundkurs 3] — Joachims klartext
  g('Beräkna.', [ berakna('12/3 + 5', ['4 + 5'], 9), berakna('7 + 18/6', ['7 + 3'], 10), berakna('(9 + 6)/5', ['15/5'], 3) ]),
  // [gröna boken 88–90]
  g('Vilket tal ska stå i rutan för att likheten ska stämma?', [ lucka('__ + 3 · 4 = 20', 8), lucka('5 · __ − 6 = 14', 4), lucka('__ · (2 + 3) = 35', 7) ])
] }; };

/* ── BLAD 1B ── */
BLAD['1B'] = function(){ return { titel: TITEL, dokument: dok('1B', 'kärna', 'golv'), grupper: [
  // [Grundkurs 1, 2.2 2031]
  g('Beräkna.', [ berakna('5 + 4 · 7', ['5 + 28'], 33), berakna('8 · 3 + 6', ['24 + 6'], 30), berakna('(7 + 3) · 4', ['10 · 4'], 40) ]),
  // [Grundkurs 2, 2.2 2032]
  g('Beräkna.', [ berakna('25 − 4 · 5', ['25 − 20'], 5), berakna('7 · 4 − 9', ['28 − 9'], 19), berakna('(13 − 5) · 2', ['8 · 2'], 16) ]),
  // [2.2 2034, Grundkurs 3] — Joachims klartext
  g('Beräkna.', [ berakna('24/4 + 7', ['6 + 7'], 13), berakna('9 + 21/7', ['9 + 3'], 12), berakna('(8 + 12)/4', ['20/4'], 5) ]),
  // [gröna boken 88–90]
  g('Vilket tal ska stå i rutan för att likheten ska stämma?', [ lucka('__ + 4 · 5 = 26', 6), lucka('6 · __ − 8 = 22', 5), lucka('__ · (1 + 4) = 45', 9) ])
] }; };

/* Uppgift 3 på blad 2 ("Gör så att likheten stämmer"): a och b — sätt in +, − eller · i rutorna — har ingen
   komponent i bladkärnan (teckenrutan finns bara i åttans motorer). PROVISORISKT, i väntan på Joachims beslut: en
   uttrycksruta där eleven skriver uttrycket med tecknen insatta. c — sätt ut en parentes — är en uttrycksruta. */
var GOR_LIKHET = 'Gör så att likheten stämmer. I a och b sätter du in +, − eller · i rutorna. I c sätter du ut en parentes.';

/* ── BLAD 2A ── "Skriv av uttrycket och visa mellanled i varje beräkning." */
BLAD['2A'] = function(){ return { titel: TITEL, dokument: dok('2A', 'kärna', 'tak'), grupper: [
  // [2.2 exempel 4, Grundkurs exempel 2] — Joachims klartext
  g('Beräkna.', [
    berakna('5 · (3 + 4) + 12/3', ['5 · 7 + 4', '35 + 4'], 39),
    berakna('2 · (6 + 3) + 20/4 − 7', ['2 · 9 + 5 − 7', '18 + 5 − 7'], 16),
    berakna('40 − 3 · (8 − 2) + 9/3', ['40 − 3 · 6 + 3', '40 − 18 + 3'], 25) ]),
  // [2.2 2042–2043] — Joachims klartext
  g('Beräkna.', [
    berakna('18/(11 − 5)', ['18/6'], 3),
    berakna('(50 − 14)/(3 + 6)', ['36/9'], 4),
    berakna('(4 · 15)/6 + (6 · 10)/12', ['60/6 + 60/12', '10 + 5'], 15) ]),
  // [2.2 2044, 2057]
  g(GOR_LIKHET, [ utt('4 □ 5 □ 3 = 17', '4 · 5 − 3'), utt('4 □ 5 □ 3 = 19', '4 + 5 · 3'), utt('2 + 4 · 5 − 1 = 29', '(2 + 4) · 5 − 1') ]),
  // [gamla boken 1053–1058]
  g('Beräkna.', [
    berakna('12,5 − 2 · 3,5', ['12,5 − 7'], 5.5),
    berakna('5 · 1,2 + 2,4 · 10', ['6 + 24'], 30),
    berakna('8 · 7 − 4,5 + 10 · 0,25', ['56 − 4,5 + 2,5'], 54) ])
] }; };

/* ── BLAD 2B ── */
BLAD['2B'] = function(){ return { titel: TITEL, dokument: dok('2B', 'kärna', 'tak'), grupper: [
  // [2.2 exempel 4, Grundkurs exempel 2] — Joachims klartext
  g('Beräkna.', [
    berakna('4 · (2 + 5) + 15/3', ['4 · 7 + 5', '28 + 5'], 33),
    berakna('3 · (4 + 6) + 18/3 − 9', ['3 · 10 + 6 − 9', '30 + 6 − 9'], 27),
    berakna('50 − 4 · (9 − 3) + 12/4', ['50 − 4 · 6 + 3', '50 − 24 + 3'], 29) ]),
  // [2.2 2042–2043] — Joachims klartext
  g('Beräkna.', [
    berakna('24/(10 − 6)', ['24/4'], 6),
    berakna('(45 − 9)/(5 + 7)', ['36/12'], 3),
    berakna('(3 · 16)/8 + (5 · 12)/10', ['48/8 + 60/10', '6 + 6'], 12) ]),
  // [2.2 2044, 2057]
  g(GOR_LIKHET, [ utt('6 □ 2 □ 4 = 16', '6 · 2 + 4'), utt('6 □ 2 □ 4 = 14', '6 + 2 · 4'), utt('3 + 5 · 4 − 2 = 30', '(3 + 5) · 4 − 2') ]),
  // [gamla boken 1053–1058]
  g('Beräkna.', [
    berakna('14,5 − 3 · 2,5', ['14,5 − 7,5'], 7),
    berakna('4 · 1,5 + 3,6 · 10', ['6 + 36'], 42),
    berakna('9 · 6 − 3,5 + 10 · 0,15', ['54 − 3,5 + 1,5'], 52) ])
] }; };

/* MOMENTET: två blad med varianterna A och B. Två nivåer → ingen spärr (§3: nivå 1 och 2 alltid öppna).
   Bladen saknar egna namn i dokumentet — momentsidan visar "Blad 1", "Blad 2".
   Blad 2 står som "Kommer senare" på momentsidan tills uppgift 3 a–b (teckenrutorna) är beslutad; det nås för
   granskning med direktlänk (uppgift.html?moment=prio&blad=2A). */
var MOMENT = { titel: 'Prioriteringsregeln', varianter: ['A', 'B'],
  blad: [ { nr: 1, titel: '' }, { nr: 2, titel: '', kommer: true } ] };

window.BLAD_K3_D1_PRIO = {
  MOMENT: MOMENT,
  blad: function(id){ var f = BLAD[String(id || '').toUpperCase()]; return f ? f() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
