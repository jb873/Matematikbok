/* blad-k3-d3-tillampning.js — FÖRENKLA UTTRYCK (åk 7, k3 d3), MOMENT 4 "Negativa termer och tillämpning": Blad 1A–4B.
   Källor (ordagrant, facit kontrollräknat; placeringen överst i varje fil):
     Blad 1–2 = steg 7 (doc/innehall/k3-d3-forenkla-steg7.md) negativa x-termer och decimaltal
     Blad 3–4 = steg 8 (k3-d3-forenkla-steg8.md) tillämpning: teckna, förenkla, beräkna
   Komponenterna: blad-k3-d3-typer.js. Lådor med vikt ritas som en lapp per låda (prislapparna); femhörningen är
   figurmodulens femhorning. Spärren (NivaRad, §3): Blad 1 och 2 alltid öppna, Blad 3 och 4 vid 80 % på bladet före.
   Ingen nätväg. */
(function(){
'use strict';
var T = window.K3D3_TYPER; if(!T) return;
var F = T.F, g = T.g, f = T.forenkla, val = T.val, flera = T.flera, omk = T.omkrets, skriv = T.skriv, utt = T.utt,
    berakna = T.berakna, fb = T.fb, figur = T.figur, lador = T.lador, nar = T.nar, R = T.R;
function rekt(b, h){ return F().rektangel({ bredd: b + ' cm', hojd: h + ' cm' }); }
var OMK = { fraga: 'Skriv ett uttryck för omkretsen och förenkla det:' }.fraga;
var BLAD = {};

/* ═══ STEG 7 → Blad 1 och 2 ═══ */
BLAD['1A'] = function(){ return { titel: 'Negativa x-termer', grupper: [
  // [kap 3.3 exempel b]
  g(R.forenkla, [ f('3x − 5x', '-2x'), f('4y − 9y', '-5y', 'y'), f('2a − 9a', '-7a', 'a') ]),
  // [H kap 8]
  g(R.forenkla, [ f('5 + 3x − 8x', '-5x + 5'), f('2x + 7 − 6x − 3', '-4x + 4'), f('9 − x − 4 − 2x', '-3x + 5') ]),
  // [C 79b, H kap 8 exempel 1–2]
  g(R.forenkla, [ f('2x + 5y − 6x', '-4x + 5y', 'xy'), f('12y − 5x − 2y − 4x', '-9x + 10y', 'xy'), f('x + 3y − 4x − y', '-3x + 2y', 'xy') ]),
  // [E 76]
  g(R.valj, [ val('4x − 7x:', ['3x', '−3x', '−11x'], '−3x'), val('6 − 2x − 3x:', ['x', '5x + 6', '−5x + 6'], '−5x + 6'), val('3y − 8y + 4:', ['−5y + 4', '5y + 4', '−y'], '−5y + 4') ]),
  // [E 79]
  g(nar('x = 2'), [ fb('3x + 10 - 7x', '-4x + 10', 2, 2), fb('5 - x - 2x', '-3x + 5', 2, -1) ])
] }; };
BLAD['1B'] = function(){ return { titel: 'Negativa x-termer', grupper: [
  g(R.forenkla, [ f('6x − 10x', '-4x'), f('y − 8y', '-7y', 'y'), f('5a − 5a − 3a', '-3a', 'a') ]),
  g(R.forenkla, [ f('8 + 2x − 9x − 3', '-7x + 5'), f('4x − 6 − 7x + 1', '-3x - 5'), f('10 − 3x + 2 − 3x', '-6x + 12') ]),
  g(R.forenkla, [ f('3x − 4y − 8x + 6y', '-5x + 2y', 'xy'), f('−2x + 7y + x − 9y', '-x - 2y', 'xy'), f('5y + 6 − 3x − 2y − 8', '-3x + 3y - 2', 'xy') ]),
  g(R.valj, [ val('2x − 9x + 4:', ['−7x + 4', '7x + 4', '−11x + 4'], '−7x + 4'), val('y − 5y − 3y:', ['−9y', '−7y', '7y'], '−7y'), val('4x + 2y − 6x − 2y:', ['−2x + 4y', '10x', '−2x'], '−2x') ]),
  g(nar('x = 3 och y = 4'), [ fb('2x + 3y - 5x', '-3x + 3y', { x: 3, y: 4 }, 3, 'xy'), fb('y - 4x + 2y - x', '-5x + 3y', { x: 3, y: 4 }, -3, 'xy') ])
] }; };
BLAD['2A'] = function(){ return { titel: 'Decimaltal', grupper: [
  // [E 76b]
  g(R.forenkla, [ f('0,5x + 0,3x', '0,8x'), f('1,5y + 2y', '3,5y', 'y'), f('2,4a − 0,4a', '2a', 'a') ]),
  // [E 76b, D 36d]
  g(R.forenkla, [ f('0,5x + 0,3x + 5y − y', '0,8x + 4y', 'xy'), f('3,5x + 8 − 2x + 0,5 − x', '0,5x + 8,5'), f('1,2a + 3 + 0,8a − 1,5', '2a + 1,5', 'a') ]),
  // [D 36d, A 2113]
  g(R.forenkla, [ f('4,5x − 1,5x + 2', '3x + 2'), f('0,7y + 2,3 + 0,3y − 1,3', 'y + 1', 'y'), f('2,5x + y − 0,5x + 0,5y', '2x + 1,5y', 'xy') ]),
  // [E 76b]
  g(R.valj, [ val('0,6x + 0,4x:', ['x', '0,10x', '10x'], 'x'), val('2,5y − 0,5y + 3:', ['3y + 3', '2y + 3', '5y'], '2y + 3'),
              val('1,5a + 2 + 0,5a + 1,5:', ['5,5a', '2,5a + 3', '2a + 3,5'], '2a + 3,5') ]),
  g(nar('x = 10'), [ fb('0,4x + 0,6x + 5', 'x + 5', 10, 15), fb('2,5x - 1,5x + 0,3x', '1,3x', 10, 13) ])
] }; };
BLAD['2B'] = function(){ return { titel: 'Decimaltal och negativa x-termer', grupper: [
  g(R.forenkla, [ f('0,3x − 0,8x', '-0,5x'), f('1,5y − 2,5y', '-y', 'y'), f('0,2a + 0,9a', '1,1a', 'a') ]),
  g(R.forenkla, [ f('2,5x + 4 − 3x − 1,5', '-0,5x + 2,5'), f('0,5x + 0,2y − 1,5x + 0,8y', '-x + y', 'xy'), f('3,2 + 1,4a − 0,4a − 1,2', 'a + 2', 'a') ]),
  g(R.forenkla, [ f('7,5x − 0,2y − 9 + 2,5x + 1,2y + 4', '10x + y - 5', 'xy'), f('0,5x − 2,5x + 3', '-2x + 3'), f('1,8y − 0,8y + 0,5x − x', '-0,5x + y', 'xy') ]),
  g(R.valj, [ val('0,4x − 1,4x:', ['−x', 'x', '−1,8x'], '−x'), val('2,5 + 0,5y − 1,5:', ['1,5y', '0,5y + 1', '0,5y + 4'], '0,5y + 1'),
              val('3x − 3,5x + 2:', ['0,5x + 2', '−6,5x + 2', '−0,5x + 2'], '−0,5x + 2') ]),
  g(nar('x = 4'), [ fb('1,5x - 2x + 6', '-0,5x + 6', 4, 4), fb('0,25x + 0,75x + 3', 'x + 3', 4, 7) ])
] }; };

/* ═══ STEG 8 → Blad 3 och 4 ═══ */
var HUR = { rubrik: 'Skriv och förenkla ett uttryck för hur mycket' }.rubrik;
var PRIS = { rubrik: 'Skriv och förenkla ett uttryck för priset för' }.rubrik;
var RINGA_VIKT = { fraga: 'Vilka uttryck visar hur mycket lådorna väger tillsammans? Ringa in alla som stämmer.' }.fraga;
var SUMMA = { fraga: 'Skriv och förenkla ett uttryck för summan av de tre talen:' }.fraga;
BLAD['3A'] = function(){ return { titel: 'Tillämpning', grupper: [
  // [C 60, rektangelns omkrets i teorin]
  g('', [ omk(rekt('x + 2', 'x'), ['x', 'x + 2', 'x', 'x + 2'], '4x + 4', 'x', OMK),
          berakna('Beräkna omkretsen när x = 5. Sätt in i det förenklade uttrycket.', '4x + 4', 5, 24, 'x', 'cm') ]),
  // [E 67]
  g(HUR, [ lador([['Blå låda', 'x kg'], ['Gul låda', '6x kg']]),
           skriv('de två lådorna väger tillsammans:', 'x + 6x', '7x'), skriv('tre gula lådor väger tillsammans:', '6x + 6x + 6x', '18x') ]),
  // [E 80]
  g(PRIS, [ figur(F().prislappar({ varor: [{ namn: 'Suddgummi', pris: 'x kr' }, { namn: 'Penna', pris: 'x + 12 kr' }, { namn: 'Linjal', pris: '27 kr' }] })),
            skriv('två suddgummin:', 'x + x', '2x'), skriv('ett suddgummi och en penna:', 'x + x + 12', '2x + 12'),
            skriv('tre suddgummin, en penna och en linjal:', 'x + x + x + x + 12 + 27', '4x + 39') ]),
  // [C 80b]
  g({ rubrik: 'Tre tal följer varandra. Det minsta talet är n.' }.rubrik, [
    skriv(SUMMA, 'n + n + 1 + n + 2', '3n + 3', 'n'), berakna('Beräkna summan när n = 10.', '3n + 3', 10, 33, 'n') ]),
  // [E 78a–b]
  g('', [ lador([['Låda', 'x kg'], ['Låda', '3x kg'], ['Låda', '10 kg'], ['Låda', '20 kg']]),
          flera(RINGA_VIKT, ['3x + 30', '4x + 30', '34x', '30 + 4x'], ['4x + 30', '30 + 4x']),
          berakna('Hur mycket väger lådorna tillsammans när x = 2?', '4x + 30', 2, 38, 'x', 'kg') ])
] }; };
BLAD['3B'] = function(){ return { titel: 'Tillämpning', grupper: [
  // [C 60, C 80]
  g('', [ omk(F().sidtriangel({ sidor: ['x cm', 'x + 3 cm', '2x cm'] }), ['x', 'x + 3', '2x'], '4x + 3', 'x', OMK),
          berakna('Beräkna omkretsen när x = 6. Sätt in i det förenklade uttrycket.', '4x + 3', 6, 27, 'x', 'cm') ]),
  // [A 2091]
  g('', [ omk(F().strackfigur({ delar: [{ text: 'x cm' }, { text: '2x cm' }, { text: '5 cm' }, { text: 'x cm' }] }), ['x', '2x', '5', 'x'], '4x + 5', 'x',
              { fraga: 'Skriv ett uttryck för hela sträckans längd och förenkla det:' }.fraga),
          berakna('Beräkna längden när x = 4.', '4x + 5', 4, 21, 'x', 'cm') ]),
  // [E 80]
  g({ rubrik: 'En bulle kostar b kr och en kaffe kostar (b + 8) kr. Skriv och förenkla ett uttryck för priset för' }.rubrik, [
    skriv('två bullar och en kaffe:', 'b + b + b + 8', '3b + 8', 'b'), skriv('en bulle och två kaffe:', 'b + b + 8 + b + 8', '3b + 16', 'b'),
    berakna('Beräkna priset i b) när b = 12.', '3b + 16', 12, 52, 'b', 'kr') ]),
  // [C 80b]
  g({ rubrik: 'Tre jämna tal följer varandra. Det minsta talet är n.' }.rubrik, [
    skriv(SUMMA, 'n + n + 2 + n + 4', '3n + 6', 'n'), berakna('Beräkna summan när n = 8.', '3n + 6', 8, 30, 'n') ]),
  // [E 78a, c]
  g('', [ lador([['Låda', '2x kg'], ['Låda', 'x kg'], ['Låda', '3x kg'], ['Låda', '15 kg']]),
          flera(RINGA_VIKT, ['6x + 15', '15 + 6x', '21x', '5x + 15'], ['6x + 15', '15 + 6x']),
          berakna('Hur mycket väger lådorna tillsammans när x = 0,5?', '6x + 15', '0,5', 18, 'x', 'kg') ])
] }; };
BLAD['4A'] = function(){ return { titel: 'Tillämpning', grupper: [
  // [kap 3.3 teori]
  g('', [ omk(rekt('x', 'y'), ['x', 'y', 'x', 'y'], '2x + 2y', 'xy', OMK),
          berakna('Beräkna omkretsen när x = 7 och y = 3.', '2x + 2y', { x: 7, y: 3 }, 20, 'xy', 'cm') ]),
  // [C 80]
  g('', [ omk(F().femhorning({ sidor: ['y cm', 'y cm', '2y cm', 'z cm', 'z cm'] }), ['y', 'y', '2y', 'z', 'z'], '4y + 2z', 'yz', OMK),
          berakna('Hur lång är omkretsen när y = 2 och z = 3?', '4y + 2z', { y: 2, z: 3 }, 14, 'yz', 'cm') ]),
  // [E 80]
  g({ rubrik: 'Ett äpple kostar a kr och en banan kostar b kr.' }.rubrik, [
    utt('Fyll i vad 3 äpplen och 2 bananer kostar:', '3a + 2b', 'ab'),
    skriv('Ella köper 2 äpplen och 1 banan. Omar köper 1 äpple och 3 bananer. Skriv och förenkla ett uttryck för vad de betalar tillsammans:',
          '2a + b + a + 3b', '3a + 4b', 'ab'),
    berakna('Beräkna vad de betalar tillsammans när a = 5 och b = 4.', '3a + 4b', { a: 5, b: 4 }, 31, 'ab', 'kr') ]),
  // [E 78]
  g('', [ lador([['Blå låda', 'x kg'], ['Blå låda', 'x kg'], ['Röd låda', 'y kg'], ['Röd låda', 'y kg'], ['Röd låda', 'y kg'], ['Låda', '8 kg']]),
          skriv({ fraga: 'Skriv och förenkla ett uttryck för hur mycket lådorna väger tillsammans:' }.fraga, 'x + x + y + y + y + 8', '2x + 3y + 8', 'xy'),
          berakna('Hur mycket väger lådorna när x = 4 och y = 6?', '2x + 3y + 8', { x: 4, y: 6 }, 34, 'xy', 'kg') ]),
  // [C 80]
  g('', [ omk(rekt('x + 4', 'y + 2'), ['x + 4', 'y + 2', 'x + 4', 'y + 2'], '2x + 2y + 12', 'xy', OMK),
          berakna('Förenkla först och beräkna sedan omkretsen när x = 5 och y = 3.', '2x + 2y + 12', { x: 5, y: 3 }, 28, 'xy', 'cm') ])
] }; };
BLAD['4B'] = function(){ return { titel: 'Tillämpning', grupper: [
  // [C 60, C 80]
  g('', [ omk(rekt('2x', 'y + 3'), ['2x', 'y + 3', '2x', 'y + 3'], '4x + 2y + 6', 'xy', OMK),
          berakna('Beräkna omkretsen när x = 4 och y = 2.', '4x + 2y + 6', { x: 4, y: 2 }, 26, 'xy', 'cm') ]),
  // [C 80]
  g('', [ omk(F().sidtriangel({ sidor: ['x + y cm', 'x cm', 'y + 5 cm'] }), ['x + y', 'x', 'y + 5'], '2x + 2y + 5', 'xy', OMK),
          berakna('Beräkna omkretsen när x = 6 och y = 4.', '2x + 2y + 5', { x: 6, y: 4 }, 25, 'xy', 'cm') ]),
  // [E 80]
  g({ rubrik: 'En vuxenbiljett kostar v kr och en barnbiljett b kr.' }.rubrik, [
    utt('Fyll i vad 2 vuxenbiljetter och 3 barnbiljetter kostar:', '2v + 3b', 'bv'),
    skriv('Familjen Ali köper 2 vuxenbiljetter och 3 barnbiljetter. Familjen Berg köper 1 vuxenbiljett och 2 barnbiljetter. Skriv och förenkla ett uttryck för vad familjerna betalar tillsammans:',
          '2v + 3b + v + 2b', '5b + 3v', 'bv'),
    berakna('Beräkna vad de betalar tillsammans när v = 120 och b = 80.', '3v + 5b', { v: 120, b: 80 }, 760, 'bv', 'kr') ]),
  // [E 78c]
  g('', [ lador([['Blå låda', '3x kg'], ['Blå låda', 'x kg'], ['Röd låda', 'y kg'], ['Röd låda', '2y kg'], ['Låda', '12 kg']]),
          skriv({ fraga: 'Skriv och förenkla ett uttryck för hur mycket lådorna väger tillsammans:' }.fraga, '3x + x + y + 2y + 12', '4x + 3y + 12', 'xy'),
          berakna('Hur mycket väger lådorna när x = 2,5 och y = 4?', '4x + 3y + 12', { x: '2,5', y: 4 }, 34, 'xy', 'kg') ]),
  // [E 80]
  g({ rubrik: 'En stol kostar s kr. Ett bord kostar (4s + 50) kr.' }.rubrik, [
    skriv('Skriv och förenkla ett uttryck för priset för ett bord och fyra stolar:', '4s + 50 + s + s + s + s', '8s + 50', 's'),
    berakna('Beräkna priset när s = 300.', '8s + 50', 300, 2450, 's', 'kr') ])
] }; };

var MOMENT = { titel: 'Negativa termer och tillämpning', varianter: ['A', 'B'],
  nivaPrefix: 'k3d3', nivaId: 'tillampning', nivaKrav: { andel: 0.8 },
  blad: [1, 2, 3, 4].map(function(n){ return { nr: n, titel: '' }; }) };

window.BLAD_K3_D3_TILLAMPNING = {
  MOMENT: MOMENT,
  blad: function(id){ var fn = BLAD[String(id || '').toUpperCase()]; return fn ? fn() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
