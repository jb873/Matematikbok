/* blad-k4-d1-metod.js — METODTRÄNINGEN I PROCENT (åk 7, kapitel 4 Del 1): grenen "Procent och byta form" (moment 1)
   med löven B1–B7 (Joachim 2026-11-26), och grenen "Andelen" (moment 2) med löven A1–A7 (2026-11-27, se GRENEN
   "ANDELEN" nedan).
   Källa: doc/innehall/k4-d1-procent-metodtraning.md — Joachims klartext (facit kontrollräknat), ordagrant: talreglerna
   överst i varje löv och 10 uppgifter som mallar. Hakparenteser finns inte i filen.
   Bladen ritas med bladkärnan och bladens byggstenar (blad-k4-d1-procent.js, TYPER: formkedjan, figurerna, svaret med
   enheten efter rutan) — samma komponenter och samma rättning som Blad 1–5. En uppgift per blad i drillen (som k3).
   Rubrikerna är bladens godkända rubriker för samma uppgiftstyp.
   B1 och B7 har bara författade uppgifter. B2–B6 får NYA TAL EFTER BANKEN: den delade mekanismen (NyaTal.medTalregel i
   js/motor/ovamer/nya-tal.js) väljer MALLEN FÖRST, med lika stor chans, och lövets TALREGEL nedan drar talen. Mallen
   bestämmer formen och nämnarens slag (B2: nämnaren, B3: enklaste formens nämnare, B4: nämnaren, B5: nivån, B6: enklaste
   formens nämnare); talen dras inom lövets talregler.
   FASTA MALLAR (Joachim 2026-11-26): 1/2, 1/3 och 2/3 (B2) är standardbråk eleven ska kunna utantill — de återkommer
   med samma tal efter banken; regeln om nya tal gäller de mallar som kan variera.
   PER TIOTAL (Joachim 2026-11-26: "per blad" gäller varje tiotal nya uppgifter efter banken): B2 och B6 har minst en
   0,0x-uppgift per tiotal (på plats 10 tvingas en om ingen kommit), B5 har nivå 2 bara på plats 9 och 10 (högst två).
   Mastery (kapitel 4:s store): B1–B5 "Från bråk och decimalform till procentform", B6–B7 "Från procentform till bråk
   och decimalform". Spec-fuzzen: verktyg/spec-fuzz-procent.js. Ingen nätväg. */
(function(){
'use strict';
var P = window.BLAD_K4_D1_PROCENT; if(!P) return;
var Y = P.TYPER, A = window.SvgAndel;
var br = Y.br, enk = Y.enk, hun = Y.hun, dec = Y.dec, pro = Y.pro, ca = Y.ca, kedja = Y.kedja, upp = Y.upp, rest = Y.rest;
function sgd(a, b){ return b ? sgd(b, a % b) : a; }
function rund(v){ return Math.round(v * 1e6) / 1e6; }
function hel(rnd, lo, hi){ return lo + Math.floor(rnd() * (hi - lo + 1)); }
function ur(rnd, lista){ return lista[Math.floor(rnd() * lista.length)]; }
// Elevtext i fält (elevtext-låset). Lövens namn ur klartexten; rubrikerna är bladens.
var RM = { b6: { rubrik: 'Skriv procenten i hundradelar, i enklaste form och i decimalform.' }.rubrik };
var NAMN = {
  B1: { namn: 'Figur till tre former' }.namn,
  B2: { namn: 'Standardbråk till decimal och procent' }.namn,
  B3: { namn: 'Förenkla till enklaste form, sedan decimal och procent' }.namn,
  B4: { namn: 'Förlänga till hundradelar (20-, 25-, 50-delar)' }.namn,
  B5: { namn: 'Förkorta till hundradelar (200- till 1200-delar)' }.namn,
  B6: { namn: 'Från procent till hundradelar, enklaste form och decimal' }.namn,
  B7: { namn: 'Det hela är 100 %' }.namn
};
var GREN = { namn: 'Procent och byta form' }.namn, ROTNAMN = { namn: 'Procent' }.namn;

/* ── KEDJORNA ur talen (bankens och de nya uppgifternas — samma räkning) ── */
// B2: a/d = decimal = procent; tredjedelar ≈ med två decimaler.
function radB2(x){
  if(x.d === 3) return kedja(x.a + '/3', [ca(dec(x.a === 1 ? 0.33 : 0.67)), pro(x.a === 1 ? 33 : 67)]);
  return kedja(x.a + '/' + x.d, [dec(rund(x.a / x.d)), pro(rund(100 * x.a / x.d))]);
}
// B3: (a·k)/(d·k) = a/d = decimal = procent.
function radB3(x){ return kedja((x.a * x.k) + '/' + (x.d * x.k), [enk(x.a + '/' + x.d), dec(rund(x.a / x.d)), pro(rund(100 * x.a / x.d))]); }
// B4, B5: a/d = p/100 = decimal = procent.
function radHun(a, d){ var p = rund(100 * a / d); return kedja(a + '/' + d, [hun(p + '/100'), dec(rund(p / 100)), pro(p)]); }
function radB4(x){ return radHun(x.a, x.d); }
function radB5(x){ return radHun(x.k * x.d / 100, x.d); }
// B6: p % = p/100 = enklaste form = decimal.
function radB6(x){ var s = sgd(x.p, 100); return kedja(x.p + ' %', [hun(x.p + '/100'), enk((x.p / s) + '/' + (100 / s)), dec(rund(x.p / 100))]); }

/* ── TALREGLERNA (klartextens, överst i varje löv) ── */
// B2: nämnaren 2, 3, 4, 5, 10 eller 100, äkta bråk; täljare 1 / 1–2 / 1–3 / 1–4 / 1–9 / 1–99. Nämnaren 2 och 3: fasta.
var B2_TAL = { 4: [1, 3], 5: [1, 4], 10: [1, 9], 100: [1, 99] };
function draB2(m){ return function(rnd, ctx){
  if(m.fast) return { a: m.a, d: m.d, nyckel: m.a + '/' + m.d };
  var r = B2_TAL[m.d], a = ctx.krav === 'smal' ? hel(rnd, 1, 9) : hel(rnd, r[0], r[1]);
  return { a: a, d: m.d, nyckel: a + '/' + m.d };
}; }
// Minst en 0,0x (nämnaren 100, täljare 1–9) per tiotal: på plats 10 tvingas en om ingen kommit.
function smalB2(x){ return x.d === 100 && x.a <= 9; }
// B3: enklaste formen har nämnaren 2, 4 eller 5; bråket = enklaste · k, k 2–15; nämnaren högst 75.
function draB3(m){ return function(rnd){
  var tal = []; for(var a = 1; a < m.d; a++) if(sgd(a, m.d) === 1) tal.push(a);
  var a2 = ur(rnd, tal), kmax = Math.min(15, Math.floor(75 / m.d)), k = hel(rnd, 2, kmax);
  return { a: a2, d: m.d, k: k, nyckel: (a2 * k) + '/' + (m.d * k) };
}; }
// B4: nämnaren 20, 25 eller 50; täljaren ur listan (bråket går inte att förkorta).
var B4_TAL = { 20: [3, 7, 9, 11, 13, 17, 19], 25: [2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 19, 21, 22, 23],
               50: [3, 7, 9, 11, 13, 17, 19, 21, 23, 31, 33, 41, 43] };
function draB4(m){ return function(rnd){ var a = ur(rnd, B4_TAL[m.d]); return { a: a, d: m.d, nyckel: a + '/' + m.d }; }; }
// B5: nämnare 200–900, 1100, 1200 (inte 1000); täljaren = k · nämnaren/100. Nivå 1: k = 3–11 utom 10. Nivå 2: k
// tvåsiffrigt, tiotal 2–6 och ental 1–3 (1100 och 1200: tiotal 2–3, ental 1–2); vid 200–900 är entalsdelen
// (ental · nämnaren/100) högst 9.
var B5_NAMN = [200, 300, 400, 500, 600, 700, 800, 900, 1100, 1200];
function draB5(m){ return function(rnd){
  var d = ur(rnd, B5_NAMN), k;
  if(m.niva === 1){ k = ur(rnd, [3, 4, 5, 6, 7, 8, 9, 11]); }
  else {
    var stor = d >= 1100, t = hel(rnd, 2, stor ? 3 : 6), o = hel(rnd, 1, stor ? 2 : 3);
    if(!stor && o * d / 100 > 9) return null;   // entalsdelen syns inte i siffrorna (477/900)
    k = 10 * t + o;
  }
  return { k: k, d: d, niva: m.niva, nyckel: (k * d / 100) + '/' + d };
}; }
// B6: hela procent 1–99; p/100 går att förkorta, och enklaste formen har nämnaren 2, 4, 5, 10, 20, 25 eller 50.
// Mallen bestämmer enklaste formens nämnare.
function klass(p){ return 100 / sgd(p, 100); }
function draB6(m){ return function(rnd, ctx){
  var tal = []; for(var p = 1; p <= (ctx.krav === 'smal' ? 9 : 99); p++) if(klass(p) === m.c) tal.push(p);
  if(!tal.length) return null;
  var p2 = ur(rnd, tal); return { p: p2, nyckel: p2 + ' %' };
}; }
function smalB6(x){ return x.p <= 9; }

/* ── LÖVEN: banken (10 uppgifter, klartextens ordning) och mallarnas data ── */
var TILL = Y.TILL, FRAN = Y.FRAN;
function fig(svg, led){ return kedja(null, led, { svg: svg }); }
var BANK = {
  B1: { namn: NAMN.B1, nod: TILL, rubrik: Y.R.b1n1, uppg: function(){ return [
    fig(A.delStrip(10, upp(9)), [br('9/10'), dec(0.9), pro(90)]),
    fig(A.delCirkel(2, [0]), [br('1/2'), dec(0.5), pro(50)]),
    fig(A.delStrip(5, upp(3)), [br('3/5'), dec(0.6), pro(60)]),
    fig(A.delCirkel(4, [0, 1, 2]), [br('3/4'), dec(0.75), pro(75)]),
    fig(A.delStrip(5, upp(1)), [br('1/5'), dec(0.2), pro(20)]),
    fig(A.delRuta(10, 10, upp(81)), [br('81/100'), dec(0.81), pro(81)]),
    fig(A.delRuta(10, 10, upp(4)), [br('4/100'), dec(0.04), pro(4)]),
    fig(A.delRuta(4, 5, upp(9), { kvadrat: true }), [br('9/20'), hun('45/100'), dec(0.45), pro(45)]),
    fig(A.delRuta(5, 5, upp(7), { kvadrat: true }), [br('7/25'), hun('28/100'), dec(0.28), pro(28)]),
    fig(A.delRuta(5, 10, upp(13), { kvadrat: true }), [br('13/50'), hun('26/100'), dec(0.26), pro(26)])
  ]; } },
  B2: { namn: NAMN.B2, nod: TILL, rubrik: Y.I.b2, rad: radB2, dra: draB2, smal: smalB2,
    mallar: [ { a: 1, d: 2, fast: true }, { a: 1, d: 4 }, { a: 3, d: 4 }, { a: 1, d: 5 }, { a: 3, d: 5 },
              { a: 1, d: 3, fast: true }, { a: 2, d: 3, fast: true }, { a: 7, d: 10 }, { a: 23, d: 100 }, { a: 4, d: 100 } ] },
  B3: { namn: NAMN.B3, nod: TILL, rubrik: Y.I.b3, rad: radB3, dra: draB3,
    mallar: [ { a: 1, d: 2, k: 8 }, { a: 1, d: 4, k: 6 }, { a: 3, d: 5, k: 3 }, { a: 2, d: 5, k: 5 }, { a: 3, d: 4, k: 8 },
              { a: 2, d: 5, k: 6 }, { a: 3, d: 4, k: 10 }, { a: 1, d: 4, k: 11 }, { a: 4, d: 5, k: 7 }, { a: 3, d: 5, k: 9 } ] },
  B4: { namn: NAMN.B4, nod: TILL, rubrik: Y.I.b4, rad: radB4, dra: draB4,
    mallar: [ { a: 9, d: 20 }, { a: 3, d: 20 }, { a: 4, d: 25 }, { a: 11, d: 25 }, { a: 16, d: 25 },
              { a: 12, d: 25 }, { a: 3, d: 50 }, { a: 19, d: 50 }, { a: 31, d: 50 }, { a: 41, d: 50 } ] },
  B5: { namn: NAMN.B5, nod: TILL, rubrik: Y.I.b4, rad: radB5, dra: draB5,
    mallar: [ { k: 6, d: 200, niva: 1 }, { k: 8, d: 300, niva: 1 }, { k: 11, d: 400, niva: 1 }, { k: 7, d: 500, niva: 1 },
              { k: 5, d: 600, niva: 1 }, { k: 4, d: 700, niva: 1 }, { k: 9, d: 900, niva: 1 }, { k: 3, d: 1100, niva: 1 },
              { k: 43, d: 300, niva: 2 }, { k: 21, d: 500, niva: 2 } ] },
  B6: { namn: NAMN.B6, nod: FRAN, rubrik: RM.b6, rad: radB6, dra: draB6, smal: smalB6,
    mallar: [ { p: 10 }, { p: 90 }, { p: 25 }, { p: 60 }, { p: 5 }, { p: 55 }, { p: 16 }, { p: 24 }, { p: 6 }, { p: 85 } ] },
  B7: { namn: NAMN.B7, nod: FRAN, rubrik: Y.R.hela, uppg: function(){ return [
    rest({ fraga: '72 % av eleverna har mobilen med sig. Hur många procent har inte mobilen med sig?' }.fraga, 28),
    { typ: 'bild', svg: A.delRuta(10, 10, upp(63)), fraga: { fraga: 'Hur många procent är inte färgade?' }.fraga, svar: 37, enhet: ' %' },
    rest({ fraga: '1/2 av klassen åker buss till skolan. Hur många procent åker inte buss?' }.fraga, 50),
    rest({ fraga: '3/4 av vägen är asfalterad. Resten är grus. Hur många procent är grus?' }.fraga, 25),
    rest({ fraga: 'Saga har sparat 2/5 av pengarna hon behöver. Hur många procent har hon kvar att spara?' }.fraga, 60),
    rest({ fraga: 'En mobil är laddad till 64 %. Hur många procent saknas till fullt batteri?' }.fraga, 36),
    rest({ fraga: 'En saft består av 20 % koncentrat. Resten är vatten. Hur många procent är vatten?' }.fraga, 80),
    rest({ fraga: 'Ett lag vann 55 % av matcherna och spelade oavgjort i 15 %. Resten förlorade de. Hur många procent av matcherna förlorade de?' }.fraga, 30),
    rest({ fraga: 'I en klass har 12 % inga syskon och 47 % ett syskon. Resten har fler syskon. Hur många procent har fler än ett syskon?' }.fraga, 41),
    { typ: 'bild', svg: A.delStrip(20, upp(7), { bredd: 23 }), fraga: { fraga: 'Hur många procent är inte färgade?' }.fraga, svar: 65, enhet: ' %' }
  ]; } }
};
// Mallarnas nycklar och klass (B6) ur datan.
BANK.B2.mallar.forEach(function(m){ m.nyckel = m.a + '/' + m.d; });
BANK.B3.mallar.forEach(function(m){ m.nyckel = (m.a * m.k) + '/' + (m.d * m.k); });
BANK.B4.mallar.forEach(function(m){ m.nyckel = m.a + '/' + m.d; });
BANK.B5.mallar.forEach(function(m){ m.nyckel = (m.k * m.d / 100) + '/' + m.d; });
BANK.B6.mallar.forEach(function(m){ m.nyckel = m.p + ' %'; m.c = klass(m.p); });
var ORDNING = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'];

/* ═══ GRENEN "ANDELEN" (moment 2, Joachim 2026-11-27): löven A1–A7 ═══════════════════════════════════════════════
   Källa: doc/innehall/k4-d1-procent-moment2-metodtraning.md (facit kontrollräknat), ordagrant; hakparenteserna
   (förlagan) står inte här. Svarsraden är bladens fasta rad (blad-k4-d1-andelen.js, TYPER.andel): Andelen = delen /
   det hela (exakt) = mellanled (på värde) = decimalform (valfri) = procent. En uppgift per blad i drillen.
   A1–A3 får NYA TAL EFTER BANKEN (NyaTal.medTalregel): mallen först, med lika stor chans; mallen bestämmer nämnaren
   (A1, A2) eller enklaste formen (A3), och lövets talregel nedan drar talen. A4–A7 har bara författade uppgifter.
   Mastery: alla sju löv loggar till lövet Andelen (proc-andelen:rakna) i kapitel 4:s store. */
var NAMN_A = {
  A1: { namn: 'Förlänga till hundradelar' }.namn,
  A2: { namn: 'Förkorta till hundradelar' }.namn,
  A3: { namn: 'Förenkla till enklaste form, sedan procent' }.namn,
  A4: { namn: 'Det hela räknas ut först' }.namn,
  A5: { namn: 'Delen läggs ihop eller är det som är kvar' }.namn,
  A6: { namn: 'Byta enhet och tid' }.namn,
  A7: { namn: 'Jämföra två andelar' }.namn
};
var GREN_A = { namn: 'Andelen' }.namn, ANDELEN = 'proc-andelen:rakna';
var RA = { hur: { rubrik: 'Hur många procent är …' }.rubrik };
// Svarsraden och valrutan ur Andelens bladfil (laddas före den här på momentsidan och i drillen).
function AN(){ return window.BLAD_K4_D1_ANDELEN.TYPER; }
function andel(fraga, del, hela, mellan){ return AN().andel(fraga, del, hela, mellan); }
function valA(alt, ratt, fraga){ return AN().val(alt, ratt, fraga); }
function uA(rubrik, rader){ return { rubrik: rubrik, rader: rader }; }
// "x av y?" under "Hur många procent är …".
function avRad(del, hela, mellan){ return uA(RA.hur, [ andel({ etikett: del + ' av ' + hela + '?' }.etikett, del, hela, mellan) ]); }

/* ── TALREGLERNA (klartextens, överst i varje löv) ── */
// A1: "Hur många procent är x av y?", y = 20, 25 eller 50; x < y utan gemensam faktor med y (går inte att förkorta,
// står inte redan i hundradelar). Tillåtna x ur klartexten. Svar: x · (100/y) %.
var A1_TAL = { 20: [3, 7, 9, 11, 13, 17, 19], 25: [2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 19, 21, 22, 23],
               50: [3, 7, 9, 11, 13, 17, 19, 21, 23, 27, 29, 31, 33, 37, 39, 41, 43, 47, 49] };
function radA1(x){ return avRad(x.a, x.d, rund(x.a * 100 / x.d) + '/100'); }
function draA1(m){ return function(rnd){ var a = ur(rnd, A1_TAL[m.d]); return { a: a, d: m.d, nyckel: a + '/' + m.d }; }; }
// A2: y = 200, 300, …, 900, 1100 eller 1200 (inte 1000); x = k · (y/100), k = 3–11 utom 10. Svaret är k %. Mallen
// bestämmer nämnaren.
var A2_K = [3, 4, 5, 6, 7, 8, 9, 11], A2_NAMN = [200, 300, 400, 500, 600, 700, 800, 900, 1100, 1200];
function radA2(x){ return avRad(x.k * x.d / 100, x.d, x.k + '/100'); }
function draA2(m){ return function(rnd){ var k = ur(rnd, A2_K); return { k: k, d: m.d, nyckel: (k * m.d / 100) + '/' + m.d }; }; }
// A3: x/y = enklaste form · k; enklaste formens nämnare 2, 4 eller 5, k = 2–15; y högst 75 och aldrig 20, 25, 50
// eller 100 (de hör till A1 och A2); k = 1 förekommer inte. Mallen bestämmer enklaste formens nämnare.
var A3_INTE = [20, 25, 50, 100];
function radA3(x){ return avRad(x.a * x.k, x.d * x.k, x.a + '/' + x.d); }
function draA3(m){ return function(rnd){
  var tal = []; for(var a = 1; a < m.d; a++) if(sgd(a, m.d) === 1) tal.push(a);
  var ks = []; for(var k = 2; k <= 15; k++) if(m.d * k <= 75 && A3_INTE.indexOf(m.d * k) < 0) ks.push(k);
  var a2 = ur(rnd, tal), k2 = ur(rnd, ks);
  return { a: a2, d: m.d, k: k2, nyckel: (a2 * k2) + '/' + (m.d * k2) };
}; }

/* ── A4–A7: Joachims uppgifter (rubriken är uppgiftens text) ── */
var BANK_A = {
  A1: { namn: NAMN_A.A1, nod: ANDELEN, rad: radA1, dra: draA1,
    mallar: [ { a: 19, d: 20 }, { a: 3, d: 25 }, { a: 14, d: 25 }, { a: 16, d: 25 }, { a: 23, d: 25 },
              { a: 19, d: 25 }, { a: 21, d: 50 }, { a: 31, d: 50 }, { a: 43, d: 50 }, { a: 9, d: 50 } ] },
  A2: { namn: NAMN_A.A2, nod: ANDELEN, rad: radA2, dra: draA2,
    mallar: [ { k: 8, d: 200 }, { k: 8, d: 300 }, { k: 11, d: 400 }, { k: 3, d: 500 }, { k: 11, d: 600 },
              { k: 5, d: 700 }, { k: 7, d: 800 }, { k: 9, d: 900 }, { k: 6, d: 1100 }, { k: 9, d: 1200 } ] },
  A3: { namn: NAMN_A.A3, nod: ANDELEN, rad: radA3, dra: draA3,
    mallar: [ { a: 3, d: 4, k: 3 }, { a: 2, d: 5, k: 7 }, { a: 1, d: 4, k: 6 }, { a: 3, d: 4, k: 7 }, { a: 2, d: 5, k: 8 },
              { a: 3, d: 4, k: 8 }, { a: 1, d: 4, k: 8 }, { a: 3, d: 5, k: 9 }, { a: 3, d: 4, k: 12 }, { a: 1, d: 2, k: 22 } ] },
  A4: { namn: NAMN_A.A4, nod: ANDELEN, uppg: function(){ return [
    uA({ rubrik: 'I en grupp finns 14 flickor och 6 pojkar. Hur många procent av gruppen är pojkar?' }.rubrik, [ andel(null, 6, 20, '30/100') ]),
    uA({ rubrik: 'Ett lag spelade en säsong och vann 23 matcher, spelade oavgjort i 11 och förlorade 16. Hur många procent av matcherna vann laget?' }.rubrik, [ andel(null, 23, 50, '46/100') ]),
    uA({ rubrik: 'På en teater var 276 vuxna och 24 barn. Hur många procent av besökarna var barn?' }.rubrik, [ andel(null, 24, 300, '8/100') ]),
    uA({ rubrik: 'I en påse finns 6 röda, 5 gröna, 5 gula och 4 blå godisbitar. Hur många procent av godisbitarna är blå?' }.rubrik, [ andel(null, 4, 20, '1/5') ]),
    // Tabellen (befintlig tabellkomponent, som Blad 3A nr 5): klartextens "Antal husdjur 0 – 6 elever. 1 – 13 elever.
    // 2 – 4 elever. 3 eller fler – 2 elever."
    uA({ rubrik: 'Hur många procent av eleverna har ett husdjur?' }.rubrik, [
      { typ: 'tabell', huvud: 'kolumn', matris: [
        [{ etikett: 'Antal husdjur' }.etikett, '0', '1', '2', { etikett: '3 eller fler' }.etikett],
        ['', { etikett: '6 elever' }.etikett, { etikett: '13 elever' }.etikett, { etikett: '4 elever' }.etikett, { etikett: '2 elever' }.etikett] ] },
      andel(null, 13, 25, '52/100') ]),
    uA({ rubrik: 'På en skola finns 455 elever och 45 vuxna. Hur många procent av alla på skolan är vuxna?' }.rubrik, [ andel(null, 45, 500, '9/100') ]),
    uA({ rubrik: 'I en klubb finns 18 pojkar och 12 flickor. Hur många procent av medlemmarna är pojkar?' }.rubrik, [ andel(null, 18, 30, '3/5') ]),
    uA({ rubrik: 'Under en säsong gjorde laget 15 mål och motståndarna 5 mål. Hur många procent av alla mål gjorde laget?' }.rubrik, [ andel(null, 15, 20, '3/4') ])
  ]; } },
  A5: { namn: NAMN_A.A5, nod: ANDELEN, uppg: function(){ return [
    uA({ rubrik: 'I en klass med 25 elever har 5 elever en hund och 3 elever en katt. Ingen har både hund och katt. Hur många procent av eleverna har en hund eller en katt?' }.rubrik, [ andel(null, 8, 25, '32/100') ]),
    uA({ rubrik: 'Liam har 900 kr. Han köper en jacka för 600 kr och en mössa för 237 kr. Hur många procent av pengarna har han kvar?' }.rubrik, [ andel(null, 63, 900, '7/100') ]),
    uA({ rubrik: 'Ett lag spelade 50 matcher. De vann 21 och spelade oavgjort i 12. Resten förlorade de. Hur många procent av matcherna förlorade laget?' }.rubrik, [ andel(null, 17, 50, '34/100') ]),
    uA({ rubrik: 'I en påse finns 20 kulor. 5 är röda, 9 är blå och resten är gula. Hur många procent av kulorna är röda eller blå?' }.rubrik, [ andel(null, 14, 20, '70/100') ]),
    uA({ rubrik: 'En hylla har plats för 32 böcker. Där står 10 deckare och 14 fantasyböcker. Hur många procent av platserna är fyllda?' }.rubrik, [ andel(null, 24, 32, '3/4') ]),
    uA({ rubrik: 'Ett bibliotek har 1 100 böcker i en hylla. 40 är serieböcker och 37 är ljudböcker. Hur många procent av böckerna är serieböcker eller ljudböcker?' }.rubrik, [ andel(null, 77, 1100, '7/100') ]),
    uA({ rubrik: 'Ida har 800 kr. Hon köper en tröja för 300 kr och skor för 452 kr. Hur många procent av pengarna har hon kvar?' }.rubrik, [ andel(null, 48, 800, '6/100') ]),
    uA({ rubrik: 'I en grupp med 16 elever spelar 6 fotboll och 2 innebandy. Resten simmar. Hur många procent av eleverna simmar?' }.rubrik, [ andel(null, 8, 16, '1/2') ])
  ]; } },
  A6: { namn: NAMN_A.A6, nod: ANDELEN, uppg: function(){
    function en(t, del, hela, mellan){ return uA(RA.hur, [ andel(t, del, hela, mellan) ]); }
    return [
    en({ etikett: '36 minuter av en timme?' }.etikett, 36, 60, '3/5'),
    en({ etikett: '48 minuter av en timme?' }.etikett, 48, 60, '4/5'),
    en({ etikett: '90 minuter av 2 timmar?' }.etikett, 90, 120, '3/4'),
    en({ etikett: '6 minuter av en halvtimme?' }.etikett, 6, 30, '1/5'),
    en({ etikett: '11 dm av 5 m?' }.etikett, 11, 50, '22/100'),
    en({ etikett: '3 dl av 5 liter?' }.etikett, 3, 50, '6/100'),
    en({ etikett: '6 dl av 2,5 liter?' }.etikett, 6, 25, '24/100'),
    en({ etikett: '27 cm av 9 m?' }.etikett, 27, 900, '3/100'),
    en({ etikett: '66 cm av 6 m?' }.etikett, 66, 600, '11/100')
  ]; } },
  // A7: två eller tre svarsrader och sedan valrutan.
  A7: { namn: NAMN_A.A7, nod: ANDELEN, uppg: function(){ return [
    uA({ rubrik: 'Saga gjorde mål på 19 av 25 straffar. Omar gjorde mål på 15 av 20 straffar.' }.rubrik, [
      andel({ etikett: 'Saga:' }.etikett, 19, 25, '76/100'), andel({ etikett: 'Omar:' }.etikett, 15, 20, '3/4'),
      valA(['A Saga', 'B Omar', 'C De var lika bra'], 'A Saga', { fraga: 'Vem var bäst?' }.fraga) ]),
    uA({ rubrik: 'I klass 7C äter 29 av 50 elever frukost hemma. I klass 7D äter 14 av 25 elever frukost hemma.' }.rubrik, [
      andel({ etikett: '7C:' }.etikett, 29, 50, '58/100'), andel({ etikett: '7D:' }.etikett, 14, 25, '56/100'),
      valA(['A 7C', 'B 7D', 'C Andelen är lika stor'], 'A 7C', { fraga: 'I vilken klass är andelen störst?' }.fraga) ]),
    uA({ rubrik: 'Kim fick 42 av 50 poäng på ett prov och 168 av 200 poäng på ett annat.' }.rubrik, [
      andel({ etikett: 'Prov 1:' }.etikett, 42, 50, '84/100'), andel({ etikett: 'Prov 2:' }.etikett, 168, 200, '84/100'),
      valA(['A Prov 1', 'B Prov 2', 'C Lika bra på båda'], 'C Lika bra på båda', { fraga: 'På vilket prov lyckades Kim bäst?' }.fraga) ]),
    uA({ rubrik: 'Vilken andel är störst?' }.rubrik, [
      andel({ etikett: 'A: 30 av 200' }.etikett, 30, 200, '15/100'), andel({ etikett: 'B: 4 av 25' }.etikett, 4, 25, '16/100'),
      andel({ etikett: 'C: 42 av 300' }.etikett, 42, 300, '14/100'),
      valA(['A', 'B', 'C'], 'B', { fraga: 'Svar:' }.fraga) ]),
    uA({ rubrik: 'På skola 1 cyklar 24 av 400 elever. På skola 2 cyklar 40 av 500 elever.' }.rubrik, [
      andel({ etikett: 'Skola 1:' }.etikett, 24, 400, '6/100'), andel({ etikett: 'Skola 2:' }.etikett, 40, 500, '8/100'),
      valA(['A Skola 1', 'B Skola 2', 'C Andelen är lika stor'], 'B Skola 2', { fraga: 'Var är andelen som cyklar störst?' }.fraga) ]),
    uA({ rubrik: 'Lag A vann 9 av 12 matcher. Lag B vann 19 av 25 matcher.' }.rubrik, [
      andel({ etikett: 'Lag A:' }.etikett, 9, 12, '3/4'), andel({ etikett: 'Lag B:' }.etikett, 19, 25, '76/100'),
      valA(['A Lag A', 'B Lag B', 'C Lika stor andel'], 'B Lag B', { fraga: 'Vilket lag vann störst andel av matcherna?' }.fraga) ]),
    uA({ rubrik: 'Vilken andel är minst?' }.rubrik, [
      andel({ etikett: 'A: 21 av 28' }.etikett, 21, 28, '3/4'), andel({ etikett: 'B: 37 av 50' }.etikett, 37, 50, '74/100'),
      andel({ etikett: 'C: 19 av 25' }.etikett, 19, 25, '76/100'),
      valA(['A', 'B', 'C'], 'B', { fraga: 'Svar:' }.fraga) ]),
    uA({ rubrik: 'Mira svarade rätt på 24 av 32 frågor. Leo svarade rätt på 15 av 20 frågor.' }.rubrik, [
      andel({ etikett: 'Mira:' }.etikett, 24, 32, '3/4'), andel({ etikett: 'Leo:' }.etikett, 15, 20, '3/4'),
      valA(['A Mira', 'B Leo', 'C Lika stor andel'], 'C Lika stor andel', { fraga: 'Vem svarade rätt på störst andel?' }.fraga) ])
  ]; } }
};
BANK_A.A1.mallar.forEach(function(m){ m.nyckel = m.a + '/' + m.d; });
BANK_A.A2.mallar.forEach(function(m){ m.nyckel = (m.k * m.d / 100) + '/' + m.d; });
BANK_A.A3.mallar.forEach(function(m){ m.nyckel = (m.a * m.k) + '/' + (m.d * m.k); });
var ORDNING_A = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'];
Object.keys(BANK_A).forEach(function(id){ BANK[id] = BANK_A[id]; });

/* Ett blad i drillen: en uppgift. B-löven ger en rad (lövets rubrik); A-löven ger { rubrik, rader }. */
function bladAv(b, u){
  var gr = u && u.rader ? Y.g(u.rubrik, u.rader) : Y.g(b.rubrik, [u]); gr.logg = b.nod; gr.loggStore = 'k4';
  return { titel: b.namn, grupper: [gr] };
}
function bladBokstav(i){ return i < 26 ? String.fromCharCode(65 + i) : String(i + 1); }
function uppgAv(b){ return b.uppg ? b.uppg() : b.mallar.map(function(m){ return b.rad(m); }); }

/* TIOTALEN: B2 och B6 — minst en 0,0x; B5 — nivå 2 bara på plats 9 och 10. */
function valbaraAv(id, b){
  if(id === 'B5') return function(ctx){
    if(ctx.pos >= 8) return null;
    return b.mallar.map(function(m, i){ return m.niva === 1 ? i : -1; }).filter(function(i){ return i >= 0; });
  };
  if(b.smal) return function(ctx){
    if(ctx.pos !== 9 || ctx.tiotal.some(b.smal)) return null;
    ctx.krav = 'smal';
    return b.mallar.map(function(m, i){
      var kan = id === 'B2' ? m.d === 100 : [20, 25, 50].indexOf(m.c) >= 0;   // B6: bara de klasserna har p 1–9
      return kan ? i : -1; }).filter(function(i){ return i >= 0; });
  };
  return null;
}

/* DRILLENS KÄLLA (källan 'k4d1', referens = lövet): en uppgift per blad, banken i ordning, sedan nya tal (B2–B6). */
function drillKalla(ref){
  var id = String(ref || ''), b = BANK[id]; if(!b) return null;
  var kalla = { arskurs: 7, titel: b.namn,
    instanser: uppgAv(b).map(function(r, i){ return { bokstav: bladBokstav(i), blad: bladAv(b, r) }; }),
    rita: function(mount, bl){
      mount.innerHTML = ''; var m = document.createElement('div'); m.className = 'ovn-wrap fk-d1-blad'; mount.appendChild(m);
      window.bygg_blad(m, bl);
      var kp = document.getElementById('ovn-keypad-shared');
      if(kp && window.AK8_UI && AK8_UI.keypadBokstaver && window.bladBokstaver) AK8_UI.keypadBokstaver(kp, window.bladBokstaver(bl));
    } };
  if(b.mallar) kalla.mall = { ref: 'k4d1:' + id, talregel: true,
    mallar: b.mallar.map(function(m){ var c = {}; Object.keys(m).forEach(function(k){ c[k] = m[k]; }); c.dra = b.dra(m); return c; }),
    valbara: valbaraAv(id, b),
    bygg: function(ny){ return bladAv(b, b.rad(ny)); } };
  return kalla;
}

/* TRÄDET (momentsidans Metodträning, ritat av KartaMotor i metodtrad.html): grenen "Procent och byta form", B1–B7,
   och bredvid den grenen "Andelen", A1–A7 (2026-11-27). */
function lovAv(id){ return { id: 'nf-k4d1-' + id, namn: BANK[id].namn, nod: BANK[id].nod, formaga: 'RAKNA', roll: 'karna', bank: 'k4d1:' + id }; }
function trad(){
  return { rot: { id: 'nf-k4d1', namn: ROTNAMN }, arskursRelevans: { ak7: 'mal' }, arskurs: 'ak7',
    prefKey: 'k4.d1.nyformat.pref.v1', utfalld: ['nf-k4d1', 'nf-k4d1-byta', 'nf-k4d1-andelen'], rotNamn: ROTNAMN, orsakFramtid: 'åk 8',
    kategorier: [ { id: 'nf-k4d1-byta', namn: GREN, roll: 'karna', lov: ORDNING.map(lovAv) },
                  { id: 'nf-k4d1-andelen', namn: GREN_A, roll: 'karna', lov: ORDNING_A.map(lovAv) } ] };
}

window.BLAD_K4_D1_METOD = { ORDNING: ORDNING, ORDNING_A: ORDNING_A, trad: trad, drillKalla: drillKalla,
  bank: function(id){ var b = BANK[id]; return b ? { id: id, namn: b.namn, nod: b.nod, mallar: b.mallar || null, uppg: uppgAv(b) } : null; },
  // För spec-fuzzen: talreglernas tabeller (fuzzen räknar själv; de här används bara för utskriften).
  REGEL: { B2_TAL: B2_TAL, B4_TAL: B4_TAL, B5_NAMN: B5_NAMN, A1_TAL: A1_TAL, A2_K: A2_K, A2_NAMN: A2_NAMN } };
})();
