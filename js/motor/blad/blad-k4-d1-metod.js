/* blad-k4-d1-metod.js — METODTRÄNINGEN I PROCENT OCH BYTA FORM (åk 7, kapitel 4 Del 1, moment 1): grenen "Procent och
   byta form" med löven B1–B7 (Joachim 2026-11-26).
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

function bladAv(b, rad){
  var gr = Y.g(b.rubrik, [rad]); gr.logg = b.nod; gr.loggStore = 'k4';
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

/* TRÄDET (momentsidans Metodträning, ritat av KartaMotor i metodtrad.html): grenen "Procent och byta form", B1–B7. */
function trad(){
  return { rot: { id: 'nf-k4d1', namn: ROTNAMN }, arskursRelevans: { ak7: 'mal' }, arskurs: 'ak7',
    prefKey: 'k4.d1.nyformat.pref.v1', utfalld: ['nf-k4d1', 'nf-k4d1-byta'], rotNamn: ROTNAMN, orsakFramtid: 'åk 8',
    kategorier: [ { id: 'nf-k4d1-byta', namn: GREN, roll: 'karna', lov: ORDNING.map(function(id){
      return { id: 'nf-k4d1-' + id, namn: BANK[id].namn, nod: BANK[id].nod, formaga: 'RAKNA', roll: 'karna', bank: 'k4d1:' + id };
    }) } ] };
}

window.BLAD_K4_D1_METOD = { ORDNING: ORDNING, trad: trad, drillKalla: drillKalla,
  bank: function(id){ var b = BANK[id]; return b ? { id: id, namn: b.namn, nod: b.nod, mallar: b.mallar || null, uppg: uppgAv(b) } : null; },
  // För spec-fuzzen: talreglernas tabeller (fuzzen räknar själv; de här används bara för utskriften).
  REGEL: { B2_TAL: B2_TAL, B4_TAL: B4_TAL, B5_NAMN: B5_NAMN } };
})();
