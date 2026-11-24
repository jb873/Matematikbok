/* blad-k3-d3-negativa.js — FÖRENKLA UTTRYCK (åk 7, k3 d3), MOMENT 2 "Negativa tal" = steg 3, repetition: Blad 1A–3B.
   Källa: doc/innehall/k3-d3-forenkla-steg3.md (Joachims klartext 2026-11-24, facit kontrollräknat). Uppgifter, tal och
   facit ordagrant, utom "Använd tallinjen." (inga hjälptexter; ändringsraden står i innehållsdokumentet).
   Befintliga komponenter (blad-karna-b.js):
     talrutan        uttrycket och "= ▢" (lucka; rättas på talet, "8" för "−8" underkänns)
     tallinjen       figuren −10 till 10 (SvgTallinje, js/motor/figur/svg-tallinje.js)
     Visa mellanled  prioKedjan med avskrift: avskriften på form, leden på VÄRDE — teckenbytet 5 − (−3) = 5 + 3 är ett led
     rutan för saknat tal, valrutan
   Bråk [täljare | nämnare] skrivs "(−12)/4" och ritas staplat med minustecken (K-H).
   Spärren: Blad 1 och 2 alltid öppna, Blad 3 vid 80 % på Blad 2A eller 2B (NivaRad, k3d3_naddNiva3_negativa).
   Mastery: negativa tal har sin hemvist i k1 (som prioriteringsregeln) — neg-rakna:addsub för addition och
   subtraktion, neg-rakna:multdiv för multiplikation och division; k1-storen (mastery.js). Ingen nätväg. */
(function(){
'use strict';
var ADDSUB = 'neg-rakna:addsub', MULTDIV = 'neg-rakna:multdiv';
function g(rubrik, rader, nod){ return { rubrik: rubrik, logg: nod || ADDSUB, rader: rader }; }
function ruta(uttryck, svar){ return { typ: 'lucka', text: uttryck + ' = __', svar: svar }; }
function lucka(text, svar){ return { typ: 'lucka', text: text, svar: svar }; }
function mellanled(uttryck, led, svar){
  return { typ: 'prioKedja', vansterText: uttryck, avskrift: { visa: uttryck }, led: led[0], facitLed: led, svar: svar };
}
function val(fraga, alt, ratt, nod){ var r = { typ: 'valruta', fraga: fraga, alt: alt, ratt: [ratt] }; if(nod) r.logg = nod; return r; }
function tallinje(){
  var et = []; for(var v = -10; v <= 10; v++) et.push(v);
  return { typ: 'svgfigur', svg: window.SvgTallinje ? window.SvgTallinje.linje({ min: -10, max: 10, steg: 1, etiketter: et }) : '' };
}
var R = {
  berakna: { rubrik: 'Beräkna.' }.rubrik,
  mellanled: { rubrik: 'Beräkna. Visa mellanled.' }.rubrik,
  rutan: { rubrik: 'Vilket tal ska stå i rutan?' }.rubrik,
  valj: { rubrik: 'Välj rätt svar.' }.rubrik
};
var BLAD = {};

/* ── BLAD 1A ── */
BLAD['1A'] = function(){ return { titel: 'Negativa tal', grupper: [
  g('', [ tallinje(), ruta('3 − 5', -2), ruta('−2 + 6', 4), ruta('−1 − 4', -5) ]),
  g(R.berakna, [ ruta('4 − 9', -5), ruta('7 − 10', -3), ruta('2 − 8', -6) ]),
  g(R.berakna, [ ruta('−5 + 8', 3), ruta('−9 + 4', -5), ruta('−3 − 6', -9) ]),
  g(R.mellanled, [ mellanled('6 − 9 + 2', ['−3 + 2'], -1), mellanled('−4 + 7 − 5', ['3 − 5'], -2), mellanled('9 − 3 − 10', ['6 − 10'], -4) ])
] }; };

/* ── BLAD 1B ── */
BLAD['1B'] = function(){ return { titel: 'Negativa tal', grupper: [
  g('', [ tallinje(), ruta('2 − 7', -5), ruta('−6 + 9', 3), ruta('−3 − 5', -8) ]),
  g(R.berakna, [ ruta('5 − 12', -7), ruta('11 − 15', -4), ruta('3 − 9', -6) ]),
  g(R.berakna, [ ruta('−7 + 10', 3), ruta('−8 + 2', -6), ruta('−4 − 7', -11) ]),
  g(R.mellanled, [ mellanled('7 − 11 + 3', ['−4 + 3'], -1), mellanled('−6 + 9 − 8', ['3 − 8'], -5), mellanled('10 − 4 − 9', ['6 − 9'], -3) ])
] }; };

/* ── BLAD 2A ── */
BLAD['2A'] = function(){ return { titel: 'Negativa tal', grupper: [
  g(R.berakna, [ ruta('15 − 23', -8), ruta('−12 + 20', 8), ruta('−14 − 9', -23) ]),
  g(R.mellanled, [ mellanled('12 − 18 + 4', ['−6 + 4'], -2), mellanled('−10 + 6 − 5', ['−4 − 5'], -9),
                   mellanled('5 − 9 + 3 − 6', ['−4 + 3 − 6', '−1 − 6'], -7) ]),
  g(R.rutan, [ lucka('6 − __ = −2', 8), lucka('__ + 5 = 1', -4), lucka('−3 − __ = −10', 7) ]),
  g(R.valj, [ val('3 − 7:', ['4', '−4', '−10'], '−4'), val('−5 − 3:', ['−8', '−2', '8'], '−8'), val('−6 + 6:', ['−12', '12', '0'], '0') ])
] }; };

/* ── BLAD 2B ── */
BLAD['2B'] = function(){ return { titel: 'Negativa tal', grupper: [
  g(R.berakna, [ ruta('18 − 30', -12), ruta('−25 + 11', -14), ruta('−16 − 14', -30) ]),
  g(R.mellanled, [ mellanled('14 − 20 + 3', ['−6 + 3'], -3), mellanled('−8 + 5 − 9', ['−3 − 9'], -12),
                   mellanled('7 − 12 + 4 − 5', ['−5 + 4 − 5', '−1 − 5'], -6) ]),
  g(R.rutan, [ lucka('9 − __ = −4', 13), lucka('__ + 8 = 3', -5), lucka('−6 − __ = −15', 9) ]),
  g(R.valj, [ val('8 − 15:', ['7', '−7', '−23'], '−7'), val('−9 + 4:', ['−13', '5', '−5'], '−5'), val('−2 − 2:', ['−4', '0', '4'], '−4') ])
] }; };

/* ── BLAD 3A ── */
BLAD['3A'] = function(){ return { titel: 'Negativa tal', grupper: [
  g(R.mellanled, [ mellanled('5 − (−3)', ['5 + 3'], 8), mellanled('−4 − (−6)', ['−4 + 6'], 2), mellanled('2 − (−7)', ['2 + 7'], 9) ]),
  g(R.mellanled, [ mellanled('8 + (−5)', ['8 − 5'], 3), mellanled('−3 + (−4)', ['−3 − 4'], -7), mellanled('6 + (−9)', ['6 − 9'], -3) ]),
  g(R.berakna, [ ruta('4 · (−3)', -12), ruta('(−5) · (−2)', 10), ruta('(−12)/4', -3) ], MULTDIV),
  g(R.valj, [ val('(−6) · 3:', ['18', '−18', '−3'], '−18', MULTDIV), val('(−20)/(−5):', ['4', '−4', '15'], '4', MULTDIV),
              val('7 − (−2):', ['5', '−9', '9'], '9') ])
] }; };

/* ── BLAD 3B ── */
BLAD['3B'] = function(){ return { titel: 'Negativa tal', grupper: [
  g(R.mellanled, [ mellanled('9 − (−4)', ['9 + 4'], 13), mellanled('−8 − (−3)', ['−8 + 3'], -5), mellanled('−2 − (−2)', ['−2 + 2'], 0) ]),
  g(R.mellanled, [ mellanled('10 + (−13)', ['10 − 13'], -3), mellanled('−5 + (−6)', ['−5 − 6'], -11),
                   mellanled('−7 + (−1) − (−4)', ['−7 − 1 + 4'], -4) ]),
  g(R.berakna, [ ruta('(−7) · 3', -21), ruta('(−4) · (−6)', 24), ruta('(−30)/(−6)', 5) ], MULTDIV),
  g(R.valj, [ val('(−8) · (−2):', ['16', '−16', '−10'], '16', MULTDIV), val('18/(−3):', ['6', '15', '−6'], '−6', MULTDIV),
              val('−5 − (−5):', ['−10', '0', '10'], '0') ])
] }; };

/* MOMENTET: Blad 1–3 med varianterna A och B. Spärren (NivaRad, §3): Blad 3 vid 80 % på Blad 2A eller 2B. */
var MOMENT = { titel: 'Negativa tal', varianter: ['A', 'B'],
  nivaPrefix: 'k3d3', nivaId: 'negativa', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: '' }, { nr: 2, titel: '' }, { nr: 3, titel: '' } ] };

window.BLAD_K3_D3_NEGATIVA = {
  MOMENT: MOMENT,
  blad: function(id){ var f = BLAD[String(id || '').toUpperCase()]; return f ? f() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
