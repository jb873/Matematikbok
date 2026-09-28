/* gen-ak8-alg1.js — ÅTTANS ALGEBRAUPPGIFTER UR BANDET (order 2026-09-28).

   Åttans delkapitel 1 är sjuans uppgifter med andra tal och andra figurer. Generatorn läser
   talområdet och reglerna ur js/data/band-ak8-alg1.js — den bär dem inte själv. Två prov körs på
   varje dragning:

     1. EGENSKAPEN på raden ska hålla efter bytet (decimal förblir decimal, nollsvar förblir noll).
     2. Uppgiften får inte bli identisk med sjuans (BAND.SJUANS_PAR).

   Håller den inte, dras talen om. Efter ett tak på försök behålls sista dragningen och raden
   märks — hellre en märkt rad än en tyst identisk.

   Seedad: samma seed ger samma blad, så facit och figurer inte glider isär mellan körningar. */
(function(){
'use strict';

var B = (typeof window !== 'undefined' && window.BAND_AK8_ALG1)
     || (typeof require === 'function' ? require('../../data/band-ak8-alg1.js') : null);

// ── seedad slump (samma blad varje gång) ──
function rng(seed){
  var s = seed >>> 0;
  return function(){ s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function ri(r, a, b){ return a + Math.floor(r() * (b - a + 1)); }
function val(r, lista){ return lista[Math.floor(r() * lista.length)]; }
function sanera(s){ return String(s).replace(/[\s ]/g, '').replace(/[−–—]/g, '-').replace(/[·×]/g, '·'); }

// ── termsträng: 4x, x, 12y, −3x ──
function term(k, v){
  if(k === 1) return v;
  if(k === -1) return '−' + v;
  return String(k).replace('.', ',') + v;
}
function led(k, v, forst){
  var t = term(Math.abs(k), v);
  if(forst) return (k < 0 ? '−' : '') + t;
  return (k < 0 ? ' − ' : ' + ') + t;
}
function konst(c, forst){
  if(forst) return String(c);
  return (c < 0 ? ' − ' : ' + ') + Math.abs(c);
}

// ── FLIK 4 · FÖRENKLA: a·v + b·v → (a+b)v, med varianter ──
function forenklaRad(r, variant, egenskap){
  var F = B.BAND.forenkla, v = val(r, ['x', 'y', 'a', 'b']);
  if(variant === 'summa'){
    var a = ri(r, F.koeff[0], F.koeff[1]), b = ri(r, F.koeff[0], F.koeff[1]);
    return { fraga: led(a, v, true) + led(b, v), svar: term(a + b, v) };
  }
  if(variant === 'differens'){
    var c = ri(r, 6, F.koeff[1] + 8), d = ri(r, F.koeff[0], c - 1);
    return { fraga: led(c, v, true) + led(-d, v), svar: term(c - d, v) };
  }
  if(variant === 'noll'){                       // EGENSKAP: svaret ska vara 0
    var e = ri(r, F.koeff[0], F.koeff[1]);
    return { fraga: led(e, v, true) + led(-e, v), svar: '0' };
  }
  if(variant === 'faktor'){
    var f = ri(r, 2, 9), g = ri(r, 2, 9);
    return { fraga: f + ' · ' + term(g, v), svar: term(f * g, v) };
  }
  if(variant === 'decimal'){                    // EGENSKAP: decimal · 10 flyttar decimaltecknet
    var tiondel = ri(r, 11, 49);
    while(tiondel % 10 === 0) tiondel = ri(r, 11, 49);   // aldrig ett helt tal: decimalen ÄR uppgiften
    return { fraga: String(tiondel / 10).replace('.', ',') + v + ' · 10', svar: term(tiondel, v) };
  }
  if(variant === 'tva'){
    // den första bokstaven i alfabetet står först i svaret — samma form eleven lärt sig i sjuan
    var par = (v === 'a' || v === 'b') ? ['a', 'b'] : ['x', 'y'];
    var v1 = par[0], v2 = par[1];
    var p = ri(r, 3, 9), q = ri(r, 2, p - 1), s1 = ri(r, 2, 8), s2 = ri(r, 2, 8);
    return { fraga: led(p, v1, true) + led(s1, v2) + led(-q, v1) + led(s2, v2),
             svar: term(p - q, v1) + led(s1 + s2, v2) };
  }
  // 'konstant': termer + konstanter
  var K = B.BAND.forenkla.konstant;
  var m1 = ri(r, 3, 9), m2 = ri(r, 2, m1 - 1);
  var k1 = ri(r, K[0] + 1, K[1]), k2 = ri(r, K[0], k1 - 1);   // k1 > k2, så konstanten aldrig tar ut sig
  return { fraga: led(m1, v, true) + konst(k1) + led(-m2, v) + konst(-k2),
           svar: term(m1 - m2, v) + konst(k1 - k2) };
}

// ── FLIK 3 · BERÄKNA: sätt in värdet ──
function beraknaRad(r, variant){
  var Bk = B.BAND.berakna, v = val(r, ['x', 'y', 'a', 'b']);
  var k = ri(r, Bk.koeff[0], Bk.koeff[1]), c = ri(r, Bk.konstant[0], Bk.konstant[1]);
  var x = ri(r, Bk.varde[0], Bk.varde[1]);
  if(variant === 'tva'){
    var v2 = v === 'x' ? 'y' : 'x', k2 = ri(r, 2, 9), y = ri(r, 1, 9);
    while(y === x) y = ri(r, 1, 9);            // olika värden, annars går de inte att skilja åt
    return { fraga: term(k, v) + led(k2, v2), varden: v + ' = ' + x + ', ' + v2 + ' = ' + y,
             svar: k * x + k2 * y };
  }
  if(variant === 'minus'){
    return { fraga: term(k, v) + konst(-c), varden: v + ' = ' + x, svar: k * x - c };
  }
  return { fraga: term(k, v) + konst(c), varden: v + ' = ' + x, svar: k * x + c };
}

// ── FLIK 2 · SKRIVA: text → uttryck ──
function skrivaRad(r, variant){
  var S = B.BAND.skriva, v = val(r, ['x', 'a', 'b', 'y']);
  var n = ri(r, S.tal[0], S.tal[1]), k = ri(r, S.koeff[0], S.koeff[1]);
  if(variant === 'langre') return { fraga: n + ' cm längre', svar: v + ' + ' + n, varibel: v };
  if(variant === 'kortare') return { fraga: n + ' cm kortare', svar: v + ' − ' + n, varibel: v };
  if(variant === 'ganger') return { fraga: k + ' gånger så lång', svar: term(k, v), varibel: v };
  if(variant === 'halften') return { fraga: 'hälften så lång', svar: v + '/2', varibel: v };
  return { fraga: n + ' mer än ' + v, svar: v + ' + ' + n, varibel: v };
}

// ── FLIK 1 · TOLKA: uttryck → ord, och värdet ──
function tolkaRad(r, varor){
  var T = B.BAND.tolka;
  // olika antal och olika pris: annars syns inte vilken bokstav som hör till vilken vara
  var a = ri(r, T.antal[0], T.antal[1]), b = ri(r, T.antal[0], T.antal[1]);
  while(b === a) b = ri(r, T.antal[0], T.antal[1]);
  var p1 = ri(r, T.pris[0], T.pris[1]), p2 = ri(r, T.pris[0], T.pris[1]);
  while(p2 === p1) p2 = ri(r, T.pris[0], T.pris[1]);
  var bok = [varor.b1, varor.b2];
  return { uttryck: term(a, bok[0]) + ' + ' + term(b, bok[1]),
           svar: varor.ord(a, b),
           varden: bok[0] + ' = ' + p1 + ', ' + bok[1] + ' = ' + p2,
           belopp: a * p1 + b * p2 };
}

// ── PROVEN: egenskapen och att uppgiften inte är sjuans ──
function haller(flik, rad, egenskap){
  var nyckel = sanera(rad.fraga || rad.uttryck || '');
  if(B.BAND.regler.ejSjuansTal && (B.SJUANS_PAR[flik] || []).some(function(p){ return sanera(p) === nyckel; })) return false;
  if(!egenskap) return true;
  var f = B.BAND.EGENSKAPER[egenskap];
  return !f || f(rad.fraga, rad.svar);
}
function dra(flik, fn, egenskap, r){
  for(var i = 0; i < 40; i++){
    var rad = fn(r);
    if(haller(flik, rad, egenskap)) return rad;
  }
  var sista = fn(r); sista.omarkt = true; return sista;
}

var API = { rng: rng, ri: ri, val: val, dra: dra, haller: haller,
            forenklaRad: forenklaRad, beraknaRad: beraknaRad, skrivaRad: skrivaRad, tolkaRad: tolkaRad,
            term: term, led: led, konst: konst };
if(typeof window !== 'undefined') window.GEN_AK8_ALG1 = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
