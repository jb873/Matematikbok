/* blad-k3-d1-typer.js — UPPGIFTSTYPERNA I DEL 1 (åk 7, k3 Del 1 Algebraiska uttryck), delade av testen
   (blad-k3-d1-test.js) och metodträningens banker (blad-k3-d1-metod.js). Joachim 2026-11-24: "byggda med befintliga
   komponenter". Varje hjälpare ger en rad i bladkärnans befintliga form (blad-karna-b.js) — samma former som bladen:
     val / flera / flerval        välj, ringa in en eller flera (valrutan, flervalet)
     paraIhop                     para ihop, svara med bokstav (paraihop)
     utt / talfoljd / tallinje    fyll i uttryck (uttrycksrutan, talföljden, tallinjen med rutor)
     berakna                      tolka-bladens beräkning: avskrift med talet insatt + led på form (flerled)
     prio                         prioriteringsregelns kedja: avskrift + led på värde (prioKedja)
     sattIn / enOp                Räkna med uttryck: avskrift med talet insatt + kedjan; enOp med frivilligt led
     lucka / tecken               rutan för saknat tal, teckenrutan
     figur / remsa                figurmotorn (svg-algebrafigur.js), prislisteraden (blad.remsa)
   Mastery: samma noder som bladen — tolka/teckna/beräkna i k3-storen, prioriteringsregeln i k1-storen (hemvisten).
   Ingen nätväg. */
(function(){
'use strict';
var TOLKA = 'alg-tolka:begrepp', TECKNA = 'alg-skriva:kommunikation', BERAKNA = 'alg-berakna:rakna', PRIO = 'prio-prioritering:rakna';
function F(){ return window.SvgAlgebraFigur; }
// En grupp = en uppgift. k3-noderna loggas i k3-storen; prioriteringsregelns nod i k1-storen (som prio-bladen).
function g(rubrik, nod, rader){ var x = { rubrik: rubrik, logg: nod, rader: rader }; if(nod !== PRIO) x.loggStore = 'k3'; return x; }
function val(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: [].concat(ratt) }; }
function flera(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: ratt, flera: true }; }
function flerval(tal, ratt){ return { typ: 'flerval', tal: tal, ratt: ratt }; }
function utt(fraga, svar, vars, efter){ var r = { typ: 'uttryck', fraga: fraga, svar: svar }; if(vars) r.vars = vars; if(efter !== undefined) r.efter = efter; return r; }
function talfoljd(fraga, termer, facit, vars){
  var r = { typ: 'talfoljd', termer: termer, facit: facit, uttryckSvar: true, fortsatt: false, vars: vars };
  if(fraga) r.fraga = fraga;
  return r;
}
function streck(n){ var s = []; for(var i = 0; i <= n; i++) s.push({ v: i }); return s; }
// Tallinjen: x på streck nr x, x + steg på nästa; rutor = [[streck, facit], …].
function tallinje(n, x, steg, rutor){
  var s = streck(n); s[x].etikett = 'x'; s[x + 1].etikett = 'x + ' + steg;
  return { typ: 'tallinje', min: -0.5, max: n + 0.5, streck: s, vars: 'x',
           rutor: rutor.map(function(r){ return { v: r[0], svar: r[1] }; }) };
}
var ABCD = ['A', 'B', 'C', 'D'];
function paraIhop(fraga, meningar, par){
  return { typ: 'paraihop', fraga: fraga, meningar: meningar, alt: ABCD, par: par.map(function(x){ return { fraga: x[0], ratt: x[1] }; }) };
}
// Tolka-bladens beräkning (flerled med avskrift; b-delen loggar till beräkna).
function berakna(fraga, avskrift, led, svar, enhet){
  return { typ: 'flerled', logg: BERAKNA, fraga: fraga, avskrift: { visa: avskrift },
           led: led.map(function(l){ return { visa: l }; }).concat([{ svar: svar }]), enhet: enhet };
}
// Prioriteringsregelns beräkning: uttrycket står tryckt, eleven skriver av det och räknar i kedjan.
function prio(uttryck, led, svar){
  return { typ: 'prioKedja', vansterText: uttryck, avskrift: { visa: uttryck }, led: led[0], facitLed: led, svar: svar };
}
// Räkna med uttryck: uttrycket med bokstaven står tryckt, avskriften har talet insatt.
function sattIn(uttryck, avskrift, led, svar){
  return { typ: 'prioKedja', vansterText: uttryck, avskrift: { visa: avskrift }, led: led[0], facitLed: led, svar: svar };
}
function enOp(uttryck, avskrift, svar){
  return { typ: 'prioKedja', vansterText: uttryck, avskrift: { visa: avskrift }, led: avskrift, facitLed: [],
           ledFrivilligt: true, svar: svar };
}
function lucka(text, svar, fraga){ var r = { typ: 'lucka', text: text, svar: svar }; if(fraga) r.fraga = fraga; return r; }
var TECKEN = ['+', '−', '·'];
function tecken(text, ratt){ return { typ: 'tecken', text: text, alt: TECKEN, ratt: ratt }; }
function figur(svg){ return { typ: 'svgfigur', svg: svg }; }
function remsa(varor, tom, text){ var r = { varor: varor, tom: tom || 1 }; if(text) r.text = text; return r; }

window.K3D1_TYPER = {
  TOLKA: TOLKA, TECKNA: TECKNA, BERAKNA: BERAKNA, PRIO: PRIO, F: F,
  g: g, val: val, flera: flera, flerval: flerval, utt: utt, talfoljd: talfoljd, tallinje: tallinje, paraIhop: paraIhop,
  berakna: berakna, prio: prio, sattIn: sattIn, enOp: enOp, lucka: lucka, tecken: tecken, figur: figur, remsa: remsa
};
})();
