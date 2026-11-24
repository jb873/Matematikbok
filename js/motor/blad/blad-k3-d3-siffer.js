/* blad-k3-d3-siffer.js — FÖRENKLA UTTRYCK (åk 7, k3 d3), MOMENT 3 "Siffertermer och två variabler": Blad 1A–6B.
   Källor (ordagrant, facit kontrollräknat; placeringen överst i varje fil):
     Blad 1–2 = steg 4 (doc/innehall/k3-d3-forenkla-steg4.md) variabeltermer och siffertermer
     Blad 3–4 = steg 5 (k3-d3-forenkla-steg5.md) två variabler
     Blad 5–6 = steg 6 (k3-d3-forenkla-steg6.md) två variabler och siffertermer
   Komponenterna: blad-k3-d3-typer.js. Spärren (NivaRad, §3): Blad 1 och 2 alltid öppna, varje blad från Blad 3 vid
   80 % på bladet före. Förenklade svar: KONVENTIONER §3 (bokstavsordning, siffertermen sist). Ingen nätväg. */
(function(){
'use strict';
var T = window.K3D3_TYPER; if(!T) return;
var F = T.F, g = T.g, f = T.forenkla, val = T.val, ringa = T.ringa, omk = T.omkrets, fb = T.fb, nar = T.nar, R = T.R;
var RINGA = { rubrik: 'Ringa in alla variabeltermer.' }.rubrik;
var LAGG = { rubrik: 'Lägg ihop varje sorts variabel för sig.' }.rubrik;
var BOKST = { rubrik: 'Förenkla. Skriv svaret i bokstavsordning.' }.rubrik;
var XYS = { rubrik: 'Förenkla. Skriv svaret i ordningen x-term, y-term, sifferterm.' }.rubrik;
function rekt(b, h){ return F().rektangel({ bredd: b + ' cm', hojd: h + ' cm' }); }
var BLAD = {};

/* ═══ STEG 4 → Blad 1 och 2 ═══ */
BLAD['1A'] = function(){ return { titel: 'Variabeltermer och siffertermer', grupper: [
  // [E s. 140 teori]
  g(RINGA, [ ringa('7x + 12', ['7x', '12'], ['7x']), ringa('5 + 3y', ['5', '3y'], ['3y']), ringa('4a + 9 + 2a', ['4a', '9', '2a'], ['4a', '2a']) ]),
  // [2.4 teori, C 60]
  g(R.omkrets, [ omk(rekt('x', '3'), ['x', '3', 'x', '3'], '2x + 6'),
                 omk(F().triangel({ ben: 'x cm', bas: '5 cm' }), ['x', 'x', '5'], '2x + 5'),
                 omk(rekt('2x', '4'), ['2x', '4', '2x', '4'], '4x + 8') ]),
  // [C 58d, E 77a–b]
  g(R.forenkla, [ f('3a + 2a + 4', '5a + 4', 'a'), f('5x + 2x + 7 + 4', '7x + 11'), f('2y + 7 + 5y', '7y + 7', 'y') ]),
  // [E 76a]
  g(R.valj, [ val('3x + 2x + 5 + 1:', ['5x + 6', '11x', '6x + 5'], '5x + 6'), val('4y + 3 + y + 2:', ['9y', '5y + 5', '4y + 5'], '5y + 5'),
              val('6 + 2a + 3 + a:', ['11a', '9 + 2a', '3a + 9'], '3a + 9') ]),
  // [E 79]
  g(nar('x = 5'), [ fb('4x + 3 + 2x + 1', '6x + 4', 5, 34), fb('x + 8 + 3x', '4x + 8', 5, 28) ])
] }; };
BLAD['1B'] = function(){ return { titel: 'Variabeltermer och siffertermer', grupper: [
  g(RINGA, [ ringa('9 + 6z', ['9', '6z'], ['6z']), ringa('3x + 5 + x + 2', ['3x', '5', 'x', '2'], ['3x', 'x']), ringa('12 + 8b + 1', ['12', '8b', '1'], ['8b']) ]),
  g(R.omkrets, [ omk(rekt('x', '7'), ['x', '7', 'x', '7'], '2x + 14'),
                 omk(F().sidtriangel({ sidor: ['x cm', 'x + 2 cm', '6 cm'] }), ['x', 'x + 2', '6'], '2x + 8'),
                 omk(rekt('3a', '5'), ['3a', '5', '3a', '5'], '6a + 10', 'a') ]),
  g(R.forenkla, [ f('7x + 12 + 6x + 8', '13x + 20'), f('9 + 4y + 2 + y', '5y + 11', 'y'), f('3a + 6 + 2a + a + 1', '6a + 7', 'a') ]),
  g(R.valj, [ val('5x + 4 + 2x + 6:', ['17x', '7x + 10', '10x + 7'], '7x + 10'), val('8 + 3y + 2 + 2y:', ['5y + 10', '15y', '5 + 10y'], '5y + 10'),
              val('a + 9 + 4a + 1:', ['14a', '4a + 10', '5a + 10'], '5a + 10') ]),
  g(nar('y = 3'), [ fb('5y + 2 + 3y + 4', '8y + 6', 3, 30, 'y'), fb('2y + 9 + y + 1', '3y + 10', 3, 19, 'y') ])
] }; };
BLAD['2A'] = function(){ return { titel: 'Variabeltermer och siffertermer', grupper: [
  // [E 77c, C 68]
  g(R.forenkla, [ f('5x + 8 − 2x − 8', '3x'), f('6x + 3 + 2x − 9', '8x - 6'), f('4a − 5 + a + 2', '5a - 3', 'a') ]),
  // [C 68, 69]
  g(R.forenkla, [ f('7y + 2 − 3y − 6', '4y - 4', 'y'), f('10 + 3x − 15 + x', '4x - 5'), f('2a − 4 + 5a − 3', '7a - 7', 'a') ]),
  // [A 2093a, c, E 77d]
  g(R.forenkla, [ f('3y − y + 2', '2y + 2', 'y'), f('5a − a + 5', '4a + 5', 'a'), f('18 + 7x − 1 − 7x', '17') ]),
  // [E 76a]
  g(R.valj, [ val('6x − 4 + x + 1:', ['7x − 3', '7x + 3', '5x − 3'], '7x − 3'), val('9 + 4y − 12:', ['4y + 3', '4y − 3', 'y'], '4y − 3'),
              val('8a − 2 − 3a − 5:', ['5a + 3', '11a − 7', '5a − 7'], '5a − 7') ]),
  g(nar('x = 4'), [ fb('5x - 7 + 2x + 3', '7x - 4', 4, 24), fb('3x + 2 + x - 10', '4x - 8', 4, 8) ])
] }; };
BLAD['2B'] = function(){ return { titel: 'Variabeltermer och siffertermer', grupper: [
  g(R.forenkla, [ f('9x + 4 − 3x − 11', '6x - 7'), f('12 − 5 + 2y − 9', '2y - 2', 'y'), f('4a − 6 + 3a − 2 + 3', '7a - 5', 'a') ]),
  g(R.forenkla, [ f('8y − 1 + 2y − 9', '10y - 10', 'y'), f('15 + 6x − 21 − 2x', '4x - 6'), f('3a − 8 + a + 8', '4a', 'a') ]),
  g(R.forenkla, [ f('11x − 4 − 6x + 4', '5x'), f('7 + 2y − 7', '2y', 'y'), f('6x + 5 − 6x − 9', '-4') ]),
  g(R.valj, [ val('10x − 3 + 2x − 9:', ['12x − 12', '12x + 6', '8x − 12'], '12x − 12'), val('5 − 8 + 3y:', ['3y + 3', '3y − 13', '3y − 3'], '3y − 3'),
              val('4a + 7 − a − 10:', ['3a − 3', '5a − 3', '3a + 17'], '3a − 3') ]),
  g(nar('y = 6'), [ fb('4y - 9 + 2y + 1', '6y - 8', 6, 28, 'y'), fb('8 + 3y - 15', '3y - 7', 6, 11, 'y') ])
] }; };

/* ═══ STEG 5 → Blad 3 och 4 ═══ */
var XY32 = { x: 3, y: 2 }, AB45 = { a: 4, b: 5 }, XY52 = { x: 5, y: 2 }, AB64 = { a: 6, b: 4 };
BLAD['3A'] = function(){ return { titel: 'Två variabler', grupper: [
  // [E exempel b, kap 3.3 teori]
  g(LAGG, [ f('2x + 3y + 4x', '6x + 3y', 'xy'), f('5a + b + 2a + 3b', '7a + 4b', 'ab'), f('x + y + x + y', '2x + 2y', 'xy') ]),
  // [kap 3.3 teori, C 60]
  g(R.omkrets, [ omk(rekt('x', 'y'), ['x', 'y', 'x', 'y'], '2x + 2y', 'xy'), omk(rekt('2a', 'b'), ['2a', 'b', '2a', 'b'], '4a + 2b', 'ab'),
                 omk(F().triangel({ ben: 'x cm', bas: 'y cm' }), ['x', 'x', 'y'], '2x + y', 'xy') ]),
  // [C 63, 64, A exempel 11]
  g(BOKST, [ f('3x + 2y + x + 4y', '4x + 6y', 'xy'), f('6a + 5b + 2a + b', '8a + 6b', 'ab'), f('y + 7x + 3y + 2x', '9x + 4y', 'xy') ]),
  // [E 76]
  g(R.valj, [ val('4x + 3y + 2x + y:', ['10xy', '6x + 4y', '6x + 3y'], '6x + 4y'), val('5a + 2b + a:', ['6a + 2b', '8ab', '5a + 3b'], '6a + 2b'),
              val('2y + 3x + 4y:', ['9xy', '6x + 3y', '3x + 6y'], '3x + 6y') ]),
  g(nar('x = 3 och y = 2'), [ fb('2x + y + 3x + 4y', '5x + 5y', XY32, 25, 'xy'), fb('x + 3y + 2x', '3x + 3y', XY32, 15, 'xy') ])
] }; };
BLAD['3B'] = function(){ return { titel: 'Två variabler', grupper: [
  g(LAGG, [ f('3x + 5y + 2x', '5x + 5y', 'xy'), f('a + 4b + 6a + 2b', '7a + 6b', 'ab'), f('2x + y + x + 2y', '3x + 3y', 'xy') ]),
  g({ rubrik: 'Skriv ett uttryck för omkretsen eller längden och förenkla det.' }.rubrik, [
    omk(rekt('3x', 'y'), ['3x', 'y', '3x', 'y'], '6x + 2y', 'xy'),
    omk(F().sidtriangel({ sidor: ['x cm', 'y cm', '2x cm'] }), ['x', 'y', '2x'], '3x + y', 'xy'),
    omk(F().strackfigur({ delar: [{ text: 'a cm' }, { text: 'b cm' }, { text: 'a cm' }, { text: 'b cm' }, { text: 'a cm' }] }), ['a', 'b', 'a', 'b', 'a'], '3a + 2b', 'ab') ]),
  g(BOKST, [ f('5x + 3y + 4x + 2y', '9x + 5y', 'xy'), f('2b + 7a + 3b + a', '8a + 5b', 'ab'), f('6y + 2x + y + 5x + 3y', '7x + 10y', 'xy') ]),
  g(R.valj, [ val('6a + 2b + 3a + 4b:', ['15ab', '9a + 6b', '9a + 2b'], '9a + 6b'), val('x + y + x + y + x:', ['3x + 2y', '5xy', '2x + 3y'], '3x + 2y'),
              val('5y + 2x + 3y + x:', ['8x + 3y', '11xy', '3x + 8y'], '3x + 8y') ]),
  g(nar('a = 4 och b = 5'), [ fb('3a + 2b + a + b', '4a + 3b', AB45, 31, 'ab'), fb('2a + 4b + 3a', '5a + 4b', AB45, 40, 'ab') ])
] }; };
BLAD['4A'] = function(){ return { titel: 'Två variabler', grupper: [
  // [E exempel b, C 71]
  g(R.forenkla, [ f('2x + 3x + 4y − y', '5x + 3y', 'xy'), f('6x + 2y − x − 5y', '5x - 3y', 'xy'), f('4a − 2b + a − b', '5a - 3b', 'ab') ]),
  // [C 78a, C 74]
  g(R.forenkla, [ f('9x − x + y + 5y − 7x', 'x + 6y', 'xy'), f('7x + 3y − 2x − 3y', '5x', 'xy'), f('8a + b − 3a − 6b', '5a - 5b', 'ab') ]),
  // [C 79a, C 71]
  g(R.forenkla, [ f('10x − 3y + 5x − 4y', '15x - 7y', 'xy'), f('6x − 2y − 4x + y', '2x - y', 'xy'), f('3a + 5b − a − 8b', '2a - 3b', 'ab') ]),
  // [E 76]
  g(R.valj, [ val('5x + 2y − 3x − 6y:', ['2x − 4y', '2x + 4y', '8x − 4y'], '2x − 4y'), val('4a − b − a + 3b:', ['3a − 2b', '3a + 2b', '5a + 2b'], '3a + 2b'),
              val('x + 4y − 7y + 2x:', ['3x + 3y', '−3x + 3y', '3x − 3y'], '3x − 3y') ]),
  g(nar('x = 5 och y = 2'), [ fb('4x - 2y + x - y', '5x - 3y', XY52, 19, 'xy'), fb('3x + y - x - 4y', '2x - 3y', XY52, 4, 'xy') ])
] }; };
BLAD['4B'] = function(){ return { titel: 'Två variabler', grupper: [
  g(R.forenkla, [ f('8x − 3y + 2x + y', '10x - 2y', 'xy'), f('5a + 4b − 2a − 7b', '3a - 3b', 'ab'), f('x − y + 4x − 5y', '5x - 6y', 'xy') ]),
  g(R.forenkla, [ f('10x − 3y − x + 2y − 6x', '3x - y', 'xy'), f('12y + 5x − 2y + 4x', '9x + 10y', 'xy'), f('7a − 2b − 6a + 5b', 'a + 3b', 'ab') ]),
  g(R.forenkla, [ f('15x − 8y − 9x + 3y', '6x - 5y', 'xy'), f('4x + 2y − x − 6y + 2x', '5x - 4y', 'xy'), f('9a − 4b − 2a − 4b', '7a - 8b', 'ab') ]),
  g(R.valj, [ val('7x − 2y + x − 5y:', ['8x + 3y', '8x − 7y', '6x − 7y'], '8x − 7y'), val('3a + 6b − 2a − 9b:', ['a − 3b', 'a + 3b', '5a − 3b'], 'a − 3b'),
              val('2x − y + 4x − 2y:', ['6x + 3y', '6x − y', '6x − 3y'], '6x − 3y') ]),
  g(nar('a = 6 och b = 4'), [ fb('5a - 3b + a + b', '6a - 2b', AB64, 28, 'ab'), fb('2a + 4b - a - 5b', 'a - b', AB64, 2, 'ab') ])
] }; };

/* ═══ STEG 6 → Blad 5 och 6 ═══ */
var XY43 = { x: 4, y: 3 }, AB52 = { a: 5, b: 2 }, XY32b = { x: 3, y: 2 }, AB43 = { a: 4, b: 3 };
BLAD['5A'] = function(){ return { titel: 'Två variabler och siffertermer', grupper: [
  // [A exempel 11]
  g(XYS, [ f('2x + 3y + 4 + x', '3x + 3y + 4', 'xy'), f('5 + a + 2b + 3a', '4a + 2b + 5', 'ab'), f('x + 2 + y + x + 3', '2x + y + 5', 'xy') ]),
  // [C 60, C 80]
  g(R.omkrets, [ omk(rekt('x + 2', 'y'), ['x + 2', 'y', 'x + 2', 'y'], '2x + 2y + 4', 'xy'),
                 omk(F().sidtriangel({ sidor: ['x cm', 'y cm', '6 cm'] }), ['x', 'y', '6'], 'x + y + 6', 'xy'),
                 omk(rekt('2x', 'y + 1'), ['2x', 'y + 1', '2x', 'y + 1'], '4x + 2y + 2', 'xy') ]),
  // [C 63, 64, A 2099]
  g(R.forenkla, [ f('4x + 2y + 3 + x + y + 5', '5x + 3y + 8', 'xy'), f('6 + 3a + 2b + a + 4', '4a + 2b + 10', 'ab'), f('2y + 7 + 5x + 3y + 1', '5x + 5y + 8', 'xy') ]),
  // [E 76]
  g(R.valj, [ val('3x + 2y + 4 + x + 1:', ['10xy', '4x + 7y', '4x + 2y + 5'], '4x + 2y + 5'), val('2a + 5 + b + 3a + 2b:', ['5a + 3b + 5', '13ab', '5a + 8b'], '5a + 3b + 5'),
              val('y + 6 + 2x + 3y:', ['2x + 10y', '2x + 4y + 6', '12xy'], '2x + 4y + 6') ]),
  g(nar('x = 4 och y = 3'), [ fb('2x + y + 3 + x + 2y', '3x + 3y + 3', XY43, 24, 'xy'), fb('x + 4y + 5 + x', '2x + 4y + 5', XY43, 25, 'xy') ])
] }; };
BLAD['5B'] = function(){ return { titel: 'Två variabler och siffertermer', grupper: [
  g(XYS, [ f('3x + 5 + 2y + x', '4x + 2y + 5', 'xy'), f('a + 4 + 3b + 2a + 1', '3a + 3b + 5', 'ab'), f('2y + x + 6 + y', 'x + 3y + 6', 'xy') ]),
  // [C 60, C 80, E 78]
  g({ rubrik: 'Skriv ett uttryck och förenkla det.' }.rubrik, [
    omk(rekt('x + 3', '2y'), ['x + 3', '2y', 'x + 3', '2y'], '2x + 4y + 6', 'xy', { fraga: 'Omkretsen.' }.fraga),
    omk(F().sidtriangel({ sidor: ['x cm', 'y + 2 cm', 'x + 1 cm'] }), ['x', 'y + 2', 'x + 1'], '2x + y + 3', 'xy', { fraga: 'Omkretsen.' }.fraga),
    omk(F().prislappar({ varor: [{ namn: 'Låda', pris: 'x kg' }, { namn: 'Låda', pris: '3x kg' }, { namn: 'Låda', pris: 'y kg' }, { namn: 'Låda', pris: '10 kg' }] }),
        ['x', '3x', 'y', '10'], '4x + y + 10', 'xy', { fraga: 'Lådornas sammanlagda vikt.' }.fraga) ]),
  g(R.forenkla, [ f('6x + 3y + 2 + 2x + y + 7', '8x + 4y + 9', 'xy'), f('8 + 2a + 5b + a + 3b + 1', '3a + 8b + 9', 'ab'), f('5y + 6x + 8 + 3y + 3', '6x + 8y + 11', 'xy') ]),
  g(R.valj, [ val('4x + 3 + 2y + 3x + 5:', ['7x + 2y + 8', '7x + 10y', '17xy'], '7x + 2y + 8'), val('5 + 2a + 4b + 1 + a:', ['7a + 4b + 1', '3a + 4b + 6', '13ab'], '3a + 4b + 6'),
              val('x + y + 9 + x + y:', ['2x + 11y', '4xy + 9', '2x + 2y + 9'], '2x + 2y + 9') ]),
  g(nar('a = 5 och b = 2'), [ fb('3a + b + 4 + a + 2b', '4a + 3b + 4', AB52, 30, 'ab'), fb('2a + 5 + b + 1', '2a + b + 6', AB52, 18, 'ab') ])
] }; };
BLAD['6A'] = function(){ return { titel: 'Två variabler och siffertermer', grupper: [
  // [A exempel 11, C 71]
  g(R.forenkla, [ f('5y + 6x + 8 − 3y − 3', '6x + 2y + 5', 'xy'), f('5x − 2y + 5 + 6x − 4y − 7', '11x - 6y - 2', 'xy'), f('3a + 2b − 4 + a − 1', '4a + 2b - 5', 'ab') ]),
  // [C 74, A 2101]
  g(R.forenkla, [ f('7x + 3y − 9 − 2x + y + 2', '5x + 4y - 7', 'xy'), f('4x − y + 6 + x − 2y − 10', '5x - 3y - 4', 'xy'), f('2a + 5b + 3 + 4a − 5b − 3', '6a', 'ab') ]),
  // [C 78, H kap 8 exempel 1–2]
  g(R.forenkla, [ f('9x − 4y + 3 − 5x + y', '4x - 3y + 3', 'xy'), f('6 + 2x − 3y − 9 + x', '3x - 3y - 3', 'xy'), f('8a − b − 2 − 3a − 2b + 5', '5a - 3b + 3', 'ab') ]),
  // [E 76]
  g(R.valj, [ val('6x + 2y − 5 − x − 4y + 1:', ['5x + 2y − 4', '7x − 2y − 6', '5x − 2y − 4'], '5x − 2y − 4'),
              val('3a − 4 + 2b − a − 3b:', ['2a − b − 4', '2a + b − 4', '4a − b + 4'], '2a − b − 4'),
              val('x + 3y − 8 + 2x − 3y + 2:', ['3x + 6y − 6', '3x − 6', '3x − 10'], '3x − 6') ]),
  // [E 79, H kap 8 EC5–6]
  g(nar('x = 3 och y = 2'), [ fb('4x - 3y + 2 + x + y - 7', '5x - 2y - 5', XY32b, 6, 'xy'), fb('2x + y - 4 + x - 3y + 6', '3x - 2y + 2', XY32b, 7, 'xy') ])
] }; };
BLAD['6B'] = function(){ return { titel: 'Två variabler och siffertermer', grupper: [
  g(R.forenkla, [ f('8x + 3y − 2 + 2x − 5y − 6', '10x - 2y - 8', 'xy'), f('4a − b + 7 + 3a − 4b − 9', '7a - 5b - 2', 'ab'), f('x − 3y + 4 + 5x + y − 1', '6x - 2y + 3', 'xy') ]),
  g(R.forenkla, [ f('12x − 5y + 6 − 4x + 2y − 10', '8x - 3y - 4', 'xy'), f('3 + 7a − 2b − 8 + a + 2b', '8a - 5', 'ab'), f('6x + 4y − 7 − 5x − 6y + 7', 'x - 2y', 'xy') ]),
  g(R.forenkla, [ f('15x − 8y + 3 − 9x + 2y − 11', '6x - 6y - 8', 'xy'), f('5a + 2 − 3b − a − 4 − b', '4a - 4b - 2', 'ab'), f('2x + y − 1 + 3x − 4y − 5 + x', '6x - 3y - 6', 'xy') ]),
  g(R.valj, [ val('7x − 2y + 3 + x − 4y − 8:', ['8x − 6y − 5', '8x + 2y − 5', '6x − 6y + 11'], '8x − 6y − 5'),
              val('5a + 3b − 6 − 2a − 7b + 4:', ['3a + 4b − 2', '7a − 4b − 10', '3a − 4b − 2'], '3a − 4b − 2'),
              val('4x − y + 9 − x − 2y − 12:', ['3x + 3y − 3', '3x − 3y − 3', '5x − 3y + 21'], '3x − 3y − 3') ]),
  g(nar('a = 4 och b = 3'), [ fb('6a - 2b - 5 + a + b + 2', '7a - b - 3', AB43, 22, 'ab'), fb('3a + 4b - 8 - a - 5b + 6', '2a - b - 2', AB43, 3, 'ab') ])
] }; };

var MOMENT = { titel: 'Siffertermer och två variabler', varianter: ['A', 'B'],
  nivaPrefix: 'k3d3', nivaId: 'siffer', nivaKrav: { andel: 0.8 },
  blad: [1, 2, 3, 4, 5, 6].map(function(n){ return { nr: n, titel: '' }; }) };

window.BLAD_K3_D3_SIFFER = {
  MOMENT: MOMENT,
  blad: function(id){ var fn = BLAD[String(id || '').toUpperCase()]; return fn ? fn() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
