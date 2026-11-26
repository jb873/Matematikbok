/* blad-k3-d3-metod.js — METODTRÄNINGENS BANKER I DEL 3 (åk 7, k3 Del 3 Förenkla uttryck). Byggd som d1:s
   (blad-k3-d1-metod.js): banken i en fil, ritad med bladkärnan (bygg_blad) och d3:s uppgiftstyper (blad-k3-d3-typer.js,
   samma som bladen). Källa 'k3d3' i js/motor/ovamer/k3-forfattad-kalla.js; varje bank är ett löv i metodträningens träd
   (momentsidan) med bank: 'k3d3:<löv>'. Drillen serverar en uppgift per blad i bankens ordning.
   Grenarna:
     P  Parenteser (fördjupning) P1–P7 — doc/innehall/k3-d3-fordjupning-metod-test.md (Joachims banker, facit
        kontrollräknat). Mellanledet rättas som på fördjupningsbladen (MellanledRattare: obligatoriskt vid minus,
        frivilligt vid plus och siffra). Mastery: alg-forenkla-parentes:rakna (P1–P3), alg-multiplicera-parentes:rakna
        (P4–P5), P6 efter uppgiftens typ (siffra framför en parentes → multiplicera), alg-forenkla-parentes:problem (P7).
   NYA TAL EFTER BANKEN (KONVENTIONER, METODTRÄNING): räknelövens uppgifter är mallar (`mall` nedan); den delade
   mekanismen (js/motor/ovamer/nya-tal.js, via källregistret) ger nya uppgifter med samma form inom lövets talregler
   och bankens band. Valuppgifter och P7 (tillämpning) har bara författade uppgifter. Ingen nätväg. */
(function(){
'use strict';
var T = window.K3D3_TYPER;
if(!T) return;
var F = T.F, val = T.val, berakna = T.berakna, lador = T.lador, PT = T.parentes;
var NOD_RAKNA = 'alg-forenkla-parentes:rakna', NOD_MULT = 'alg-multiplicera-parentes:rakna', NOD_PROBLEM = 'alg-forenkla-parentes:problem';

// Rubrikerna i fält (elevtext-låset ser fältnamnen). Ordagrant ur klartexten.
var R = {
  forenkla: { rubrik: 'Förenkla.' }.rubrik,
  berakna: { rubrik: 'Beräkna.' }.rubrik,
  valj: { rubrik: 'Välj det förenklade uttrycket.' }.rubrik
};
var NAR = { rubrik: 'Förenkla uttrycket och beräkna sedan värdet när ' }.rubrik;
// "x = 4" eller "a = 3 och b = 2" — variablerna i uttryckets ordning.
function narText(uttryck, x){
  if(typeof x !== 'object') return (String(uttryck).match(/[a-z]/) || ['x'])[0] + ' = ' + x;
  return Object.keys(x).map(function(k){ return k + ' = ' + String(x[k]).replace('.', ','); }).join(' och ');
}
// Siffra framför en parentes → multiplicera in; annars plus/minus framför parentes.
function nodFor(uttryck){ return /\d\s*\(/.test(uttryck) ? NOD_MULT : NOD_RAKNA; }

/* En uppgift: rubrik, rader, ev. mall (räkneuppgifterna). */
function rakna(uttryck, svar, rubrik){
  var rb = rubrik || R.forenkla;
  return { rubrik: rb, rader: [PT.p(uttryck, svar)], mall: { uttryck: uttryck, rubrik: rb } };
}
function berakn(uttryck, svar){ return rakna(uttryck, svar, R.berakna); }
function valj(fraga, alt, ratt){ return { rubrik: R.valj, rader: [val(fraga, alt, ratt)] }; }
// nod: lövets nod (grenarna 1–4); utan nod väljs den efter uppgiftens typ (P6).
function fbm(uttryck, forenklat, x, svar, nod){
  return { rubrik: NAR + narText(uttryck, x) + '.', nod: nod || nodFor(uttryck), rader: [PT.fb('', uttryck, forenklat, x, svar)],
           mall: { uttryck: uttryck, x: x, typ: 'fb', nod: nod } };
}
// Bladet för en ny uppgift ur en mall (samma uppgiftstyp och rubrik som mallen).
function byggNy(nod){
  return function(ny, m){
    if(m.typ === 'fb') return { rubrik: NAR + narText(ny.uttryck, ny.x) + '.', nod: m.nod || nodFor(ny.uttryck),
                                rader: [PT.fb('', ny.uttryck, ny.svar, ny.x, ny.vardeSvar)] };
    if(m.typ === 'f') return { rubrik: m.rubrik, nod: nod, rader: [T.forenkla(ny.uttryck, ny.svar, PT.vars(ny.uttryck + ' ' + ny.svar))] };
    var tal = parseFloat(String(ny.svar).replace(',', '.'));
    if(m.typ === 'ruta') return { rubrik: m.rubrik, nod: nod, rader: [{ typ: 'lucka', text: ny.uttryck + ' = __', svar: tal }] };
    if(m.typ === 'led') return { rubrik: m.rubrik, nod: nod, rader: [prio(ny.uttryck, (m.satt === 'byt' ? ledByt : ledVanster)(ny.uttryck), tal)] };
    if(m.typ === 'saknas') return { rubrik: m.rubrik, nod: nod, rader: [saknasRad(ny.uttryck, m.plats)] };
    return { rubrik: m.rubrik, nod: nod, rader: [PT.p(ny.uttryck, ny.svar)] };
  };
}
function rekt(b, h){ return F().rektangel({ bredd: b + ' cm', hojd: h + ' cm' }); }
function lada(vikt, antal){ var ut = []; for(var i = 0; i < antal; i++) ut.push(['Låda', vikt]); return ut; }

/* BANKERNA. kat = trädets gren; nod = mastery; regler = lövets talregler (nya tal efter banken); uppg() byggs när de
   hämtas (figurerna behöver SvgAlgebraFigur). */
var KAT = [ { id: 'F', namn: 'Samma variabel' }, { id: 'N', namn: 'Negativa tal' }, { id: 'S', namn: 'Siffertermer och två variabler' },
            { id: 'M', namn: 'Negativa termer och tillämpning' }, { id: 'P', namn: 'Parenteser', roll: 'fordjupning' } ];
var BANK = {};
function tu(rubrik, rader){ return { rubrik: rubrik, rader: rader }; }

/* ═════════ GRENARNA 1–4 — doc/innehall/k3-d3-metodtraning.md (Joachims banker, facit kontrollräknat; ordagrant).
   Bråk [täljare | nämnare] skrivs "6x/2" och "(−15)/5" och ritas staplat (K-H), som på bladen. Svarsrutan "___"/"□"
   är bladens "__". Mastery: moment 1, 3 och 4 alg-samla:rakna (k3); moment 2 neg-rakna:addsub och neg-rakna:multdiv
   (k1, som bladen i moment 2). Mallar (nya tal efter banken): räkneuppgifterna — inte valuppgifter, ringa in, M3 och
   M4, och inte en uppgift utan tal (x + x + x: upprepad addition har inga tal att byta). ═════════ */
var SAMLA = 'alg-samla:rakna', ADDSUB = 'neg-rakna:addsub', MULTDIV = 'neg-rakna:multdiv';
var R2 = {
  summan: { rubrik: 'Skriv summan som ett kortare uttryck.' }.rubrik,
  samma4a: { rubrik: 'Välj det uttryck som betyder samma sak som 4a.' }.rubrik,
  valjRatt: { rubrik: 'Välj rätt svar.' }.rubrik,
  rutan: { rubrik: 'Vilket tal ska stå i rutan?' }.rubrik,
  ringa: { rubrik: 'Ringa in alla variabeltermer.' }.rubrik
};
function minus(s){ return String(s).replace(/-/g, '−'); }
function talUtK(v){ return String(Math.round(v * 1e9) / 1e9).replace('.', ','); }
function talText(v){ return v < 0 ? '−' + talUtK(-v) : talUtK(v); }
// Förenkla-rutan (bladens komponent); mall om uttrycket har tal.
function fo(uttryck, svar, rubrik){
  var rb = rubrik || R.forenkla, x = { rubrik: rb, rader: [T.forenkla(uttryck, svar, PT.vars(uttryck + ' ' + svar))] };
  if(/\d/.test(uttryck)) x.mall = { uttryck: uttryck, rubrik: rb, typ: 'f' };
  return x;
}
function valjR(fraga, alt, ratt){ return { rubrik: R2.valjRatt, rader: [val(fraga, alt, ratt)] }; }
// Talrutan: "4 − 9 = ▢" (moment 2, som bladen).
function ruta(uttryck, svar){ return { rubrik: R.berakna, rader: [{ typ: 'lucka', text: uttryck + ' = __', svar: svar }],
                                       mall: { uttryck: uttryck, typ: 'ruta', rubrik: R.berakna } }; }
// prioKedjan med avskrift (bladens "Visa mellanled"): leden rättas på värde.
function prio(uttryck, led, svar){ return { typ: 'prioKedja', vansterText: uttryck, avskrift: { visa: uttryck }, led: led[0], facitLed: led, svar: svar }; }
function kedja(uttryck, led, svar, satt){ return { rubrik: R.berakna, rader: [prio(uttryck, led, svar)],
                                                   mall: { uttryck: uttryck, typ: 'led', satt: satt || 'vanster', rubrik: R.berakna } }; }
/* LEDEN för en ny uppgift, på samma sätt som bankens facit:
     vanster  från vänster, ett led per steg: 8 − 11 + 2 → −3 + 2;  6 − 10 + 2 − 5 → −4 + 2 − 5 → −2 − 5
     byt      tecknen byts: 6 − (−2) → 6 + 2;  7 + (−4) → 7 − 4 */
function ledVanster(u){
  var m = minus(u).match(/^(−?\d+)((?: [+−] \d+)+)$/); if(!m) return null;
  var acc = parseInt(m[1].replace('−', '-'), 10), par = [], led = [];
  m[2].replace(/ ([+−]) (\d+)/g, function(_, op, n){ par.push([op, parseInt(n, 10)]); });
  for(var k = 0; k < par.length - 1; k++){
    acc += par[k][0] === '+' ? par[k][1] : -par[k][1];
    led.push(talText(acc) + par.slice(k + 1).map(function(p){ return ' ' + p[0] + ' ' + p[1]; }).join(''));
  }
  return led;
}
function ledByt(u){ return [minus(u).replace(/− \(−(\d+)\)/g, '+ $1').replace(/\+ \(−(\d+)\)/g, '− $1')]; }
/* SAKNAT TAL: "5 − __ = −3" med svaret 8. Mallen är uträkningen med talet ifyllt ("5 − 8") och rutans plats. */
function saknasRad(uttryck, plats){
  var m = minus(uttryck).match(/^(−?\d+) ([+−]) (\d+)$/), a = parseInt(m[1].replace('−', '-'), 10), b = parseInt(m[3], 10);
  var r = m[2] === '+' ? a + b : a - b;
  return { typ: 'lucka', text: (plats === 0 ? '__' : m[1]) + ' ' + m[2] + ' ' + (plats === 1 ? '__' : m[3]) + ' = ' + talText(r), svar: plats === 0 ? a : b };
}
function saknas(text, svar){
  var plats = text.indexOf('__') === 0 ? 0 : 1, uttryck = text.split(' = ')[0].replace('__', talText(svar));
  return { rubrik: R2.rutan, rader: [{ typ: 'lucka', text: text, svar: svar }], mall: { uttryck: uttryck, typ: 'saknas', plats: plats, rubrik: R2.rutan } };
}
function ringaIn(uttryck, termer, ratt){ return { rubrik: R2.ringa, rader: [T.ringa(uttryck, termer, ratt)] }; }
// De tecknade talen: ett minus tätt intill talet hör till talet (−5 + 11; 6 − (−2)).
function tecknade(u){ return (minus(u).match(/−?\d+(?:,\d+)?/g) || []).map(function(t){ return parseFloat(t.replace('−', '-').replace(',', '.')); }); }
function heltalSvar(ny){ return !/,/.test(ny.svar); }

/* ═════════ MOMENT 1 – SAMMA VARIABEL ═════════ */
BANK.F1 = { kat: 'F', namn: 'Addera termer av samma sort', nod: SAMLA, regler: { koef: [1, 30] }, uppg: function(){ return [
  fo('x + x + x + x + x', '5x', R2.summan), fo('b + b + b', '3b', R2.summan), fo('y + y + y + y + y + y + y', '7y', R2.summan),
  { rubrik: R2.samma4a, rader: [val('', ['a + 4', '4 + 4 + 4 + 4', 'a + a + a + a'], 'a + a + a + a')] },
  fo('6x + 2x', '8x'), fo('3y + y', '4y'), fo('30y + 20y', '50y'), fo('b + 9b', '10b'),
  valj('7x + 2x:', ['14x', '9x', '9 + x'], '9x'), valj('3a + a:', ['4a', '3a', '4'], '4a')
]; } };
BANK.F2 = { kat: 'F', namn: 'Subtrahera termer av samma sort', nod: SAMLA, regler: { koef: [1, 50] }, uppg: function(){ return [
  fo('8x − 5x', '3x'), fo('12y − y', '11y'), fo('9z − 3z', '6z'), fo('14x − 6x', '8x'), fo('30a − a', '29a'), fo('50z − 15z', '35z'),
  fo('7b − 7b', '0'), fo('18y − 9y', '9y'),
  valj('15a − 5a:', ['10', '20a', '10a'], '10a'), valj('8y − y:', ['7y', '8', '7'], '7y')
]; } };
BANK.F3 = { kat: 'F', namn: 'Tre eller fler termer', nod: SAMLA, regler: { koef: [1, 12] }, uppg: function(){ return [
  fo('4x + x + 2x', '7x'), fo('7y − 3y + y', '5y'), fo('5x + 2x − 4x', '3x'), fo('9y − 4y − 5y', '0'), fo('8b − 3b + b', '6b'),
  fo('3x + 6x − 2x', '7x'), fo('4y + y + y − 3y', '3y'), fo('12a − 5a − 2a', '5a'),
  valj('3y + 6y − 4y:', ['13y', '5', '5y'], '5y'), valj('5x − 2x − x:', ['2x', '3x', '2'], '2x')
]; } };
BANK.F4 = { kat: 'F', namn: 'Multiplicera en term', nod: SAMLA, regler: { konst: [2, 10], koef: [2, 9] }, uppg: function(){ return [
  fo('3 · 4y', '12y'), fo('5 · 2x', '10x'), fo('6y · 2', '12y'), fo('3x · 4', '12x'), fo('7 · 3x', '21x'), fo('8y · 5', '40y'),
  fo('10 · 4y', '40y'), fo('6x · 6', '36x'),
  valj('2 · 6x:', ['8x', '12x', '26x'], '12x'), valj('4y · 5:', ['9y', '45y', '20y'], '20y')
]; } };
BANK.F5 = { kat: 'F', namn: 'Dividera en term', nod: SAMLA, regler: { konst: [2, 9] }, extra: heltalSvar, uppg: function(){ return [
  fo('6x/2', '3x'), fo('15y/3', '5y'), fo('30x/6', '5x'), fo('5y/5', 'y'), fo('9x/9', 'x'), fo('21a/3', '7a'), fo('24y/4', '6y'), fo('7b/7', 'b'),
  valj('8y/2:', ['4y', '6y', '4'], '4y'), valj('3x/3:', ['3', '0', 'x'], 'x')
]; } };
BANK.F6 = { kat: 'F', namn: 'Förenkla först och beräkna sedan', nod: SAMLA, regler: { varde: [2, 8] }, extra: heltalSvar, uppg: function(){ return [
  fbm('3x + 4x', '7x', 5, 35, SAMLA), fbm('10x - 4x', '6x', 3, 18, SAMLA), fbm('5y + 3y - 2y', '6y', 4, 24, SAMLA),
  fbm('11y - 6y', '5y', 6, 30, SAMLA), fbm('3 · 2x', '6x', 5, 30, SAMLA), fbm('12x/3', '4x', 2, 8, SAMLA), fbm('2 · 7y', '14y', 3, 42, SAMLA),
  fbm('20y/5', '4y', 7, 28, SAMLA), fbm('x + x + x + x', '4x', 8, 32, SAMLA), fbm('9a - 2a - a', '6a', 4, 24, SAMLA)
]; } };

/* ═════════ MOMENT 2 – NEGATIVA TAL (k1-storen, som bladen) ═════════ */
BANK.N1 = { kat: 'N', namn: 'Addition och subtraktion med negativt svar', nod: ADDSUB, store: 'k1', regler: { konst: [1, 25] },
  extra: function(ny){ return tecknade(ny.uttryck).every(function(v){ return v >= -15 && v <= 25; }); }, uppg: function(){ return [
  ruta('4 − 9', -5), ruta('7 − 12', -5), ruta('6 − 13', -7), ruta('−5 + 11', 6), ruta('−9 + 4', -5), ruta('−11 + 2', -9), ruta('−2 − 9', -11),
  ruta('16 − 25', -9),
  valjR('2 − 6:', ['4', '−4', '−8'], '−4'), valjR('−4 − 2:', ['−6', '−2', '6'], '−6')
]; } };
BANK.N2 = { kat: 'N', namn: 'Tre eller fyra tal i följd', nod: ADDSUB, store: 'k1', regler: { konst: [1, 20] }, uppg: function(){ return [
  kedja('8 − 11 + 2', ['−3 + 2'], -1), kedja('−5 + 9 − 7', ['4 − 7'], -3), kedja('7 − 2 − 9', ['5 − 9'], -4), kedja('6 − 10 + 3', ['−4 + 3'], -1),
  kedja('−7 + 10 − 6', ['3 − 6'], -3), kedja('12 − 5 − 10', ['7 − 10'], -3), kedja('14 − 20 + 3', ['−6 + 3'], -3), kedja('−9 + 4 − 6', ['−5 − 6'], -11),
  kedja('6 − 10 + 2 − 5', ['−4 + 2 − 5', '−2 − 5'], -7), kedja('8 − 13 + 3 − 4', ['−5 + 3 − 4', '−2 − 4'], -6)
]; } };
BANK.N3 = { kat: 'N', namn: 'Saknat tal', nod: ADDSUB, store: 'k1', regler: {},
  extra: function(ny, m){ var t = tecknade(ny.uttryck)[m.plats]; return t >= -10 && t <= 15; }, uppg: function(){ return [
  saknas('5 − __ = −3', 8), saknas('__ + 4 = 1', -3), saknas('−2 − __ = −9', 7), saknas('8 − __ = −5', 13), saknas('__ + 9 = 4', -5),
  saknas('−4 − __ = −12', 8), saknas('3 − __ = −6', 9), saknas('__ + 11 = 5', -6), saknas('−7 − __ = −10', 3), saknas('__ + 5 = −2', -7)
]; } };
BANK.N4 = { kat: 'N', namn: 'Addera och subtrahera ett negativt tal', nod: ADDSUB, store: 'k1', regler: { konst: [1, 15] }, uppg: function(){ return [
  kedja('6 − (−2)', ['6 + 2'], 8, 'byt'), kedja('−5 − (−8)', ['−5 + 8'], 3, 'byt'), kedja('−9 − (−4)', ['−9 + 4'], -5, 'byt'),
  kedja('−3 − (−3)', ['−3 + 3'], 0, 'byt'), kedja('7 + (−4)', ['7 − 4'], 3, 'byt'), kedja('−2 + (−6)', ['−2 − 6'], -8, 'byt'),
  kedja('5 + (−8)', ['5 − 8'], -3, 'byt'), kedja('12 + (−15)', ['12 − 15'], -3, 'byt'),
  valjR('4 − (−3):', ['1', '−7', '7'], '7'), valjR('−6 − (−6):', ['−12', '0', '12'], '0')
]; } };
/* N5: faktorerna 2–9; vid division nämnaren och kvoten 2–9 (divisionen går jämnt). */
function n5(ny){
  var t = tecknade(ny.uttryck).map(Math.abs), inom = function(v){ return v >= 2 && v <= 9; };
  if(/\//.test(ny.uttryck)) return inom(t[1]) && t[0] % t[1] === 0 && inom(t[0] / t[1]);
  return t.every(inom);
}
BANK.N5 = { kat: 'N', namn: 'Multiplicera och dividera med negativa tal', nod: MULTDIV, store: 'k1', regler: {}, extra: n5, uppg: function(){ return [
  ruta('3 · (−4)', -12), ruta('(−6) · (−2)', 12), ruta('(−15)/5', -3), ruta('(−8) · 3', -24), ruta('(−5) · (−4)', 20), ruta('(−28)/(−7)', 4),
  ruta('(−32)/8', -4), ruta('21/(−3)', -7),
  valjR('(−7) · 2:', ['14', '−14', '−5'], '−14'), valjR('(−18)/(−6):', ['3', '−3', '12'], '3')
]; } };

/* ═════════ MOMENT 3 – SIFFERTERMER OCH TVÅ VARIABLER ═════════ */
BANK.S1 = { kat: 'S', namn: 'Skilja variabeltermer från siffertermer', nod: SAMLA, uppg: function(){ return [
  ringaIn('8x + 15', ['8x', '15'], ['8x']), ringaIn('6 + 4y', ['6', '4y'], ['4y']), ringaIn('5a + 7 + 3a', ['5a', '7', '3a'], ['5a', '3a']),
  ringaIn('11 + 2z', ['11', '2z'], ['2z']), ringaIn('4x + 3 + x + 6', ['4x', '3', 'x', '6'], ['4x', 'x']), ringaIn('10 + 9b + 2', ['10', '9b', '2'], ['9b']),
  ringaIn('7x + 4 + x', ['7x', '4', 'x'], ['7x', 'x']), ringaIn('5 + 6y − 3', ['5', '6y', '−3'], ['6y'])
]; } };
BANK.S2 = { kat: 'S', namn: 'Variabeltermer och siffertermer, positiva', nod: SAMLA, regler: { koef: [1, 8], konst: [1, 11] }, uppg: function(){ return [
  fo('4a + 3a + 5', '7a + 5'), fo('6x + x + 3 + 8', '7x + 11'), fo('3y + 9 + 4y', '7y + 9'), fo('8x + 11 + 5x + 6', '13x + 17'),
  fo('7 + 2y + 4 + 3y', '5y + 11'), fo('2a + 5 + 4a + a + 3', '7a + 8'), fo('5x + 4 + 2x + 7', '7x + 11'), fo('x + 9 + 5x', '6x + 9'),
  valj('2x + 4x + 3 + 2:', ['6x + 5', '11x', '5x + 6'], '6x + 5'), valj('5y + 1 + y + 6:', ['12y', '6y + 7', '5y + 7'], '6y + 7')
]; } };
BANK.S3 = { kat: 'S', namn: 'Negativa siffertermer', nod: SAMLA, regler: {}, uppg: function(){ return [
  fo('6x + 7 − 3x − 7', '3x'), fo('6a − 7 + a + 3', '7a - 4'), fo('8y + 3 − 2y − 8', '6y - 5'), fo('12 + 4x − 17 + x', '5x - 5'),
  fo('3a − 5 + 4a − 2', '7a - 7'), fo('15 + 6x − 2 − 6x', '13'), fo('8x + 5 − 2x − 12', '6x - 7'), fo('4a − 9 + a + 9', '5a'),
  valj('7 + 5y − 11:', ['5y + 4', '5y − 4', 'y'], '5y − 4'), valj('9a − 3 − 4a − 6:', ['5a + 3', '13a − 9', '5a − 9'], '5a − 9')
]; } };
BANK.S4 = { kat: 'S', namn: 'Två variabler, positiva', nod: SAMLA, regler: { koef: [1, 7] }, uppg: function(){ return [
  fo('3x + 4y + 2x', '5x + 4y'), fo('6a + 2b + a + 4b', '7a + 6b'), fo('a + b + a + b + a + b', '3a + 3b'), fo('4x + y + 2x + 3y', '6x + 4y'),
  fo('2y + 6x + y + 3x', '9x + 3y'), fo('7x + 2y + x + 5y', '8x + 7y'), fo('3b + 4a + 2b + 2a', '6a + 5b'), fo('4y + 3x + 2y + x + y', '4x + 7y'),
  valj('5x + 2y + x + 3y:', ['11xy', '6x + 5y', '6x + 2y'], '6x + 5y'), valj('3y + 2x + 5y:', ['10xy', '8x + 2y', '2x + 8y'], '2x + 8y')
]; } };
BANK.S5 = { kat: 'S', namn: 'Två variabler där y-termen blir negativ', nod: SAMLA, regler: {}, uppg: function(){ return [
  fo('7x + 3y − 2x − 6y', '5x - 3y'), fo('5a − 3b + a − 2b', '6a - 5b'), fo('8x − 2x + y + 4y − 5x', 'x + 5y'), fo('6x + 4y − x − 4y', '5x'),
  fo('7x − 3y − 5x + 2y', '2x - y'), fo('4a + 6b − 2a − 9b', '2a - 3b'), fo('2x − y + 5x − 3y', '7x - 4y'), fo('13x − 7y − 8x + 2y', '5x - 5y'),
  valj('6x + 3y − 2x − 7y:', ['4x − 4y', '4x + 4y', '8x − 4y'], '4x − 4y'), valj('2x + 5y − 8y + x:', ['3x + 3y', '−3x + 3y', '3x − 3y'], '3x − 3y')
]; } };
BANK.S6 = { kat: 'S', namn: 'Två variabler och siffertermer', nod: SAMLA, regler: {}, uppg: function(){ return [
  fo('5x + 3y + 2 + 2x + y + 6', '7x + 4y + 8'), fo('7 + 2a + 4b + a + 3', '3a + 4b + 10'), fo('4y + 5x + 9 − 2y − 4', '5x + 2y + 5'),
  fo('6x − 3y + 4 + 5x − 2y − 6', '11x - 5y - 2'), fo('8x + 2y − 7 − 3x + y + 1', '5x + 3y - 6'), fo('5x − 2y + 8 + x − y − 12', '6x - 3y - 4'),
  fo('9a − 2b − 3 − 4a − b + 6', '5a - 3b + 3'), fo('3x + 2y − 2 + 2x − 5y − 4 + x', '6x - 3y - 6'),
  valj('7x + 3y − 6 − 2x − 5y + 2:', ['5x + 3y − 4', '9x − 2y − 8', '5x − 2y − 4'], '5x − 2y − 4'),
  valj('4a − 3 + 3b − a − 4b:', ['3a − b − 3', '3a + b − 3', '5a − b + 3'], '3a − b − 3')
]; } };

/* ═════════ MOMENT 4 – NEGATIVA TERMER OCH TILLÄMPNING ═════════ */
BANK.M1 = { kat: 'M', namn: 'Negativa x-termer', nod: SAMLA, regler: {}, uppg: function(){ return [
  fo('2x − 6x', '-4x'), fo('5y − 8y', '-3y'), fo('3a − 10a', '-7a'), fo('4 + 2x − 9x', '-7x + 4'), fo('3x + 8 − 7x − 2', '-4x + 6'),
  fo('3x + 4y − 7x', '-4x + 4y'), fo('10y − 6x − 3y − 2x', '-8x + 7y'), fo('4y + 3 − 5x − y − 6', '-5x + 3y - 3'),
  valj('3x − 8x:', ['5x', '−5x', '−11x'], '−5x'), valj('7 − 3x − 4x:', ['x', '7x + 7', '−7x + 7'], '−7x + 7')
]; } };
BANK.M2 = { kat: 'M', namn: 'Decimaltal som koefficienter', nod: SAMLA, regler: { koef: [0.2, 5.5], konst: [0.2, 5.5] }, uppg: function(){ return [
  fo('0,4x + 0,5x', '0,9x'), fo('3,6a − 0,6a', '3a'), fo('0,3x + 0,4x + 6y − 2y', '0,7x + 4y'), fo('4,5x + 6 − 3x + 0,5 − x', '0,5x + 6,5'),
  fo('1,4a + 2 − 0,6a − 0,5', '0,8a + 1,5'), fo('5,5x − 2,5x + 3', '3x + 3'), fo('1,5x + y − 0,5x + 0,5y', 'x + 1,5y'), fo('0,2x − 0,7x', '-0,5x'),
  valj('0,7x + 0,3x:', ['x', '0,10x', '10x'], 'x'), valj('3,5y − 1,5y + 2:', ['5y + 2', '2y + 2', '5y'], '2y + 2')
]; } };
var OMK3 = { fraga: 'Skriv ett uttryck för omkretsen och förenkla det:' }.fraga;
function omkU(svg, sidor, svar, vars){ return T.omkrets(svg, sidor, svar, vars, OMK3); }
BANK.M3 = { kat: 'M', namn: 'Teckna och förenkla en omkrets', nod: SAMLA, uppg: function(){ return [
  tu('', [ omkU(rekt('x', '4'), ['x', '4', 'x', '4'], '2x + 8', 'x') ]),
  tu('', [ omkU(F().triangel({ ben: 'x cm', bas: '7 cm' }), ['x', 'x', '7'], '2x + 7', 'x') ]),
  tu('', [ omkU(rekt('3x', '2'), ['3x', '2', '3x', '2'], '6x + 4', 'x') ]),
  tu('', [ omkU(F().rektangel({ bredd: '3a cm', hojd: '3a cm', kvadrat: true }), ['3a', '3a', '3a', '3a'], '12a', 'a') ]),
  tu('', [ omkU(rekt('x', 'x + 3'), ['x', 'x + 3', 'x', 'x + 3'], '4x + 6', 'x'), berakna('Beräkna omkretsen när x = 4.', '4x + 6', 4, 22, 'x', 'cm') ]),
  tu('', [ omkU(F().sidtriangel({ sidor: ['x cm', 'x + 2 cm', '3x cm'] }), ['x', 'x + 2', '3x'], '5x + 2', 'x'),
           berakna('Beräkna omkretsen när x = 5.', '5x + 2', 5, 27, 'x', 'cm') ]),
  tu('', [ omkU(rekt('x', 'y'), ['x', 'y', 'x', 'y'], '2x + 2y', 'xy'), berakna('Beräkna omkretsen när x = 6 och y = 4.', '2x + 2y', { x: 6, y: 4 }, 20, 'xy', 'cm') ]),
  tu('', [ omkU(rekt('x + 5', 'y'), ['x + 5', 'y', 'x + 5', 'y'], '2x + 2y + 10', 'xy') ]),
  tu('', [ omkU(F().femhorning({ sidor: ['y cm', 'y cm', '2y cm', 'z cm', 'z cm'] }), ['y', 'y', '2y', 'z', 'z'], '4y + 2z', 'yz'),
           berakna('Beräkna omkretsen när y = 3 och z = 2.', '4y + 2z', { y: 3, z: 2 }, 16, 'yz', 'cm') ]),
  tu('', [ omkU(rekt('2x', 'y + 4'), ['2x', 'y + 4', '2x', 'y + 4'], '4x + 2y + 8', 'xy'),
           berakna('Beräkna omkretsen när x = 3 och y = 2.', '4x + 2y + 8', { x: 3, y: 2 }, 24, 'xy', 'cm') ]),
  tu('', [ omkU(F().sidtriangel({ sidor: ['x + y cm', 'x cm', 'y + 6 cm'] }), ['x + y', 'x', 'y + 6'], '2x + 2y + 6', 'xy') ])
]; } };
var VIKT4 = { fraga: 'Skriv och förenkla ett uttryck för hur mycket lådorna väger tillsammans.' }.fraga;
var BETALAR = { fraga: 'Skriv och förenkla ett uttryck för vad de betalar tillsammans.' }.fraga;
var SUMMA3 = { fraga: 'Skriv och förenkla ett uttryck för summan av de tre talen.' }.fraga;
BANK.M4 = { kat: 'M', namn: 'Teckna och förenkla vikt och pris', nod: SAMLA, uppg: function(){ return [
  tu('', [ lador([['Blå låda', 'x kg'], ['Gul låda', '5x kg']]), T.skriv(VIKT4, 'x + 5x', '6x') ]),
  tu('', [ lador([['Låda', 'x kg'], ['Låda', '2x kg'], ['Låda', '15 kg'], ['Låda', '25 kg']]), T.skriv(VIKT4, 'x + 2x + 15 + 25', '3x + 40'),
           berakna('Hur mycket väger lådorna när x = 3?', '3x + 40', 3, 49, 'x', 'kg') ]),
  tu('', [ lador([['Låda', '3x kg'], ['Låda', 'x kg'], ['Låda', '2x kg'], ['Låda', '12 kg']]), T.skriv(VIKT4, '3x + x + 2x + 12', '6x + 12'),
           berakna('Hur mycket väger lådorna när x = 0,5?', '6x + 12', '0,5', 15, 'x', 'kg') ]),
  tu('', [ T.figur(F().prislappar({ varor: [{ namn: 'Suddgummi', pris: 'x kr' }, { namn: 'Penna', pris: 'x + 10 kr' }, { namn: 'Linjal', pris: '24 kr' }] })),
           T.skriv({ fraga: 'Skriv och förenkla ett uttryck för priset för två suddgummin, en penna och en linjal.' }.fraga, 'x + x + x + 10 + 24', '3x + 34') ]),
  tu({ rubrik: 'En bulle kostar b kr och en kaffe kostar (b + 6) kr.' }.rubrik, [
    T.skriv({ fraga: 'Skriv och förenkla ett uttryck för priset för två bullar och en kaffe.' }.fraga, 'b + b + b + 6', '3b + 6', 'b'),
    berakna('Beräkna priset när b = 10.', '3b + 6', 10, 36, 'b', 'kr') ]),
  tu({ rubrik: 'Tre tal följer varandra. Det minsta talet är n.' }.rubrik, [
    T.skriv(SUMMA3, 'n + n + 1 + n + 2', '3n + 3', 'n'), berakna('Beräkna summan när n = 12.', '3n + 3', 12, 39, 'n') ]),
  tu({ rubrik: 'Tre jämna tal följer varandra. Det minsta talet är n.' }.rubrik, [
    T.skriv(SUMMA3, 'n + n + 2 + n + 4', '3n + 6', 'n'), berakna('Beräkna summan när n = 6.', '3n + 6', 6, 24, 'n') ]),
  tu({ rubrik: 'Ett äpple kostar a kr och en banan b kr. Ella köper 3 äpplen och 1 banan. Omar köper 1 äpple och 2 bananer.' }.rubrik, [
    T.skriv(BETALAR, '3a + b + a + 2b', '4a + 3b', 'ab'), berakna('Beräkna vad de betalar när a = 6 och b = 5.', '4a + 3b', { a: 6, b: 5 }, 39, 'ab', 'kr') ]),
  tu('', [ lador([['Blå låda', 'x kg'], ['Blå låda', 'x kg'], ['Röd låda', 'y kg'], ['Röd låda', 'y kg'], ['Låda', '10 kg']]),
           T.skriv(VIKT4, 'x + x + y + y + 10', '2x + 2y + 10', 'xy'),
           berakna('Hur mycket väger lådorna när x = 5 och y = 7?', '2x + 2y + 10', { x: 5, y: 7 }, 34, 'xy', 'kg') ]),
  tu({ rubrik: 'En vuxenbiljett kostar v kr och en barnbiljett b kr. Familjen Ek köper 3 vuxenbiljetter och 2 barnbiljetter. Familjen Lind köper 1 vuxenbiljett och 1 barnbiljett.' }.rubrik, [
    T.skriv({ fraga: 'Skriv och förenkla ett uttryck för vad familjerna betalar tillsammans.' }.fraga, '3v + 2b + v + b', '3b + 4v', 'bv'),
    berakna('Beräkna vad de betalar när v = 100 och b = 60.', '3b + 4v', { v: 100, b: 60 }, 580, 'bv', 'kr') ]),
  tu({ rubrik: 'En stol kostar s kr och ett bord kostar (3s + 80) kr.' }.rubrik, [
    T.skriv({ fraga: 'Skriv och förenkla ett uttryck för priset för ett bord och tre stolar.' }.fraga, '3s + 80 + s + s + s', '6s + 80', 's'),
    berakna('Beräkna priset när s = 250.', '6s + 80', 250, 1580, 's', 'kr') ])
]; } };
BANK.M5 = { kat: 'M', namn: 'Förenkla först och beräkna sedan', nod: SAMLA, regler: { varde: [2, 10] }, uppg: function(){ return [
  fbm('4x + 3y - 5 + x - 2y', '5x + y - 5', { x: 3, y: 2 }, 12, SAMLA), fbm('6x - 2y + 1 + x + y - 4', '7x - y - 3', { x: 2, y: 5 }, 6, SAMLA),
  fbm('5a - 3b - 2 + a + b + 4', '6a - 2b + 2', { a: 5, b: 3 }, 26, SAMLA), fbm('2x + 9 - 6x', '-4x + 9', 2, 1, SAMLA),
  fbm('8 - x - 3x', '-4x + 8', 2, 0, SAMLA), fbm('4x + 2y - 7x', '-3x + 2y', { x: 2, y: 5 }, 4, SAMLA), fbm('2,5x - 3x + 5', '-0,5x + 5', 4, 3, SAMLA),
  fbm('0,35x + 0,65x + 2', 'x + 2', 6, 8, SAMLA), fbm('1,5y - 0,5y + 2', 'y + 2', 7, 9, SAMLA), fbm('3,5x - 2,5x + 0,5x', '1,5x', 10, 15, SAMLA)
]; } };

/* ═════════ PARENTESER (fördjupning) ═════════ */
BANK.P1 = { kat: 'P', namn: 'Plus framför parentes', nod: NOD_RAKNA, regler: { koef: [1, 9], konst: [1, 10] }, uppg: function(){ return [
  rakna('x + (3x + 2)', '4x + 2'), rakna('4a + (a + 6)', '5a + 6'), rakna('(2y + 5) + 3', '2y + 8'), rakna('5x + (2x - 4)', '7x - 4'),
  rakna('(3a - 1) + 2a', '5a - 1'), rakna('3x + (x + 2y)', '4x + 2y'), rakna('(2a + 3b) + 4b', '2a + 7b'), rakna('7x + (2y - 3x) + 1', '4x + 2y + 1'),
  valj('2x + (5x − 1):', ['7x + 1', '7x − 1', '3x − 1'], '7x − 1'),
  valj('(4a + 2b) + a − b:', ['5a + b', '5a + 3b', '3a + b'], '5a + b')
]; } };
BANK.P2 = { kat: 'P', namn: 'Minus framför parentes', nod: NOD_RAKNA, regler: { koef: [1, 12], konst: [1, 30] }, uppg: function(){ return [
  berakn('25 - (9 + 6)', '10'), berakn('17 - (8 - 3)', '12'), rakna('7x - (3x + 2)', '4x - 2'), rakna('10a - (4a - 3)', '6a + 3'),
  rakna('6y - (y + 5)', '5y - 5'), rakna('9x + 3 - (4x + 1)', '5x + 2'), rakna('8a - (2a - 5b)', '6a + 5b'),
  rakna('5x + 2y - (x - 3y + 4)', '4x + 5y - 4'),
  valj('6x − (2x − 3):', ['4x − 3', '8x + 3', '4x + 3'], '4x + 3'),
  valj('11 − (3y + 4):', ['−3y + 7', '−3y + 15', '3y + 7'], '−3y + 7')
]; } };
BANK.P3 = { kat: 'P', namn: 'Flera parenteser med plus och minus', nod: NOD_RAKNA, regler: { koef: [1, 9] }, uppg: function(){ return [
  rakna('(4x + 1) + (2x + 3)', '6x + 4'), rakna('(7a + 2) - (3a + 5)', '4a - 3'), rakna('9y - (2y - 1)', '7y + 1'),
  rakna('(3x + 4) - (x - 2) + (2x - 5)', '4x + 1'), rakna('12 - (3a + 2) + (4a - 1)', 'a + 9'), rakna('(5x + 2y) - (2x - y)', '3x + 3y'),
  rakna('(6a - b + 3) - (2a + 2b - 1)', '4a - 3b + 4'), rakna('(x + 3) - (4x - 2) + (2x + 1)', '-x + 6'),
  valj('(6x + 1) − (2x − 3):', ['4x − 2', '4x + 4', '8x + 4'], '4x + 4'),
  valj('(a + 4) + (3a − 4) − (2a + 1):', ['2a − 1', '2a + 9', '4a − 1'], '2a − 1')
]; } };
BANK.P4 = { kat: 'P', namn: 'Siffra framför parentes', nod: NOD_MULT, regler: { faktor: [2, 7] }, uppg: function(){ return [
  berakn('4(5 + 3)', '32'), berakn('2(9 - 4)', '10'), rakna('5(x + 2)', '5x + 10'), rakna('3(2a - 4)', '6a - 12'),
  rakna('6(y + 1) + y', '7y + 6'), rakna('2(4x - 3) + 7', '8x + 1'), rakna('4(a + 2b) - 3b', '4a + 5b'), rakna('3(2x - y + 1) + x', '7x - 3y + 3'),
  valj('4(x + 3):', ['4x + 3', '4x + 12', 'x + 12'], '4x + 12'),
  valj('3(2a − 5):', ['6a − 15', '6a − 5', '5a − 15'], '6a − 15')
]; } };
BANK.P5 = { kat: 'P', namn: 'Flera parenteser med siffra framför, blandat', nod: NOD_MULT, regler: { faktor: [2, 5] }, uppg: function(){ return [
  rakna('2(x + 4) + (3x - 2) + 1', '5x + 7'), rakna('3(a + 2) + 2a - (a + 4)', '4a + 2'), rakna('4(y - 2) + 3(y + 1) - y', '6y - 5'),
  rakna('5x + 2(x - 1) - (3x + 2) + 6', '4x + 2'), rakna('2(2a + b) + 3(a - b) - (a - 2b)', '6a + b'),
  rakna('3(x + 2y) - (x + y) + 2(x - y) + 4', '4x + 3y + 4'), rakna('10 + 2(3y - 4) - (y + 5)', '5y - 3'), rakna('x + 4(x + 1) - (2x - 3)', '3x + 7'),
  valj('2(x + 5) − (x + 3) + 2:', ['x + 9', 'x + 4', '3x + 9'], 'x + 9'),
  valj('3(a − 2) + (2a − 1) − a:', ['4a − 3', '6a − 7', '4a − 7'], '4a − 7')
]; } };
BANK.P6 = { kat: 'P', namn: 'Förenkla först och beräkna sedan', nod: NOD_RAKNA, regler: { varde: [2, 7] }, uppg: function(){ return [
  fbm('(5x + 3) - (2x - 1)', '3x + 4', 4, 16), fbm('3(x + 2) + x', '4x + 6', 6, 30), fbm('2(x + 3) - (x - 4)', 'x + 10', 5, 15),
  fbm('(4a + b) - (a - 2b)', '3a + 3b', { a: 3, b: 2 }, 15), fbm('4(y + 1) + (2y - 3)', '6y + 1', 2, 13),
  fbm('3(2x + y) - (x + y)', '5x + 2y', { x: 2, y: 5 }, 20), fbm('2(a + 4) + 3(a - 1) - (a + 2)', '4a + 3', 4, 19),
  fbm('(3x + 8) - (x + 8)', '2x', 7, 14), fbm('5(x - 1) + (x + 9)', '6x + 4', 3, 22), fbm('2(x + 2y) + (3x - y)', '5x + 3y', { x: 4, y: 3 }, 29)
]; } };
var KVAR = { fraga: 'Skriv ett uttryck för hur mycket han har kvar och förenkla det.' }.fraga;
var KVAR2 = { fraga: 'Skriv ett uttryck för hur mycket hon har kvar och förenkla det.' }.fraga;
var OMK = { fraga: 'Skriv ett uttryck för omkretsen med parentes och förenkla det.' }.fraga;
var OMK2 = { fraga: 'Skriv ett uttryck för omkretsen med parenteser och förenkla det.' }.fraga;
var VIKT = { fraga: 'Skriv ett uttryck för hur mycket lådorna väger tillsammans och förenkla det.' }.fraga;
BANK.P7 = { kat: 'P', namn: 'Tillämpning: teckna med parentes', nod: NOD_PROBLEM, formaga: 'PROBLEM', uppg: function(){ return [
  tu('', [ PT.sk(OMK, '2(x + 2) + 2 · 4', '2x + 12', rekt('x + 2', '4')), berakna('Beräkna omkretsen när x = 5.', '2x + 12', 5, 22, 'x', 'cm') ]),
  tu({ rubrik: 'Ett paket kostar (x + 8) kr. Ali köper 5 paket.' }.rubrik, [
    PT.sk('Skriv ett uttryck för vad han betalar och förenkla det.', '5(x + 8)', '5x + 40'), berakna('Beräkna priset när x = 12.', '5x + 40', 12, 100, 'x', 'kr') ]),
  tu({ rubrik: 'En tröja kostar (t + 50) kr och en mössa 90 kr. Lisa köper 2 tröjor och en mössa.' }.rubrik, [
    PT.sk('Skriv ett uttryck för vad hon betalar och förenkla det.', '2(t + 50) + 90', '2t + 190'), berakna('Beräkna priset när t = 200.', '2t + 190', 200, 590, 't', 'kr') ]),
  tu('', [ lador(lada('x + 3 kg', 4)), PT.sk(VIKT, '4(x + 3)', '4x + 12'), berakna('Hur mycket väger lådorna när x = 2,5?', '4x + 12', '2,5', 22, 'x', 'kg') ]),
  tu({ rubrik: 'Sam har (x + 40) kr. Han köper en bok för (x − 15) kr.' }.rubrik, [ PT.sk(KVAR, '(x + 40) - (x - 15)', '55') ]),
  tu('', [ PT.sk(OMK2, '2(3x + 2) + 2(x + 1)', '8x + 6', rekt('3x + 2', 'x + 1')), berakna('Beräkna omkretsen när x = 3.', '8x + 6', 3, 30, 'x', 'cm') ]),
  tu('', [ PT.sk(OMK, '2(x + 4) + (2x - 1)', '4x + 7', F().triangel({ ben: 'x + 4 cm', bas: '2x - 1 cm' })),
           berakna('Beräkna omkretsen när x = 6.', '4x + 7', 6, 31, 'x', 'cm') ]),
  tu({ rubrik: 'Familjen Ek köper 4 biljetter för (v + 15) kr styck. Familjen Lind köper 3 biljetter för (v − 10) kr styck.' }.rubrik, [
    PT.sk('Skriv ett uttryck för vad familjerna betalar tillsammans och förenkla det.', '4(v + 15) + 3(v - 10)', '7v + 30'),
    berakna('Beräkna vad de betalar när v = 100.', '7v + 30', 100, 730, 'v', 'kr') ]),
  tu('', [ lador(lada('x + 5 kg', 2).concat(lada('y + 2 kg', 3))), PT.sk(VIKT, '2(x + 5) + 3(y + 2)', '2x + 3y + 16'),
           berakna('Hur mycket väger lådorna när x = 4 och y = 3?', '2x + 3y + 16', { x: 4, y: 3 }, 33, 'xy', 'kg') ]),
  tu({ rubrik: 'Mira har (4x + 30) kr. Hon köper en bok för (x + 20) kr.' }.rubrik, [
    PT.sk(KVAR2, '(4x + 30) - (x + 20)', '3x + 10'), berakna('Beräkna hur mycket hon har kvar när x = 50.', '3x + 10', 50, 160, 'x', 'kr') ]),
  tu({ rubrik: 'Ett gymkort kostar (m + 100) kr per månad. Dessutom betalar man en startavgift på 200 kr. Nora har gymkort i 3 månader.' }.rubrik, [
    PT.sk('Skriv ett uttryck för vad hon betalar och förenkla det.', '3(m + 100) + 200', '3m + 500'),
    berakna('Beräkna vad hon betalar när m = 250.', '3m + 500', 250, 1250, 'm', 'kr') ])
]; } };

var ORDNING = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'N1', 'N2', 'N3', 'N4', 'N5', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6',
               'M1', 'M2', 'M3', 'M4', 'M5', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];

/* TRÄDET för momentsidan (Momentsida.metodtraning): rot → grenarna → löven med bankernas id. En gren med roll bär den
   till sina löv (kartans märke för fördjupning). */
function trad(){
  return { rot: { id: 'nf-d3', namn: 'Förenkla uttryck' }, arskursRelevans: { ak7: 'mal' }, arskurs: 'ak7',
    prefKey: 'k3.d3.nyformat.pref.v1', utfalld: ['nf-d3'], rotNamn: 'Algebra', orsakFramtid: 'åk 8',
    kategorier: KAT.map(function(k){
      return { id: 'nf-d3-' + k.id, namn: k.namn, roll: k.roll, lov: ORDNING.filter(function(id){ return BANK[id].kat === k.id; }).map(function(id){
        return { id: 'nf-d3-' + id, namn: BANK[id].namn, nod: BANK[id].nod, formaga: BANK[id].formaga || 'RAKNA', roll: k.roll, bank: 'k3d3:' + id };
      }) };
    }) };
}

/* DRILLENS KÄLLA (källan 'k3d3', referens = lövets id): en uppgift per blad, i bankens ordning, sedan nya tal ur
   mallarna (räknelöven). */
function bladBokstav(i){ return i < 26 ? String.fromCharCode(65 + i) : String(i + 1); }
// Moment 2 loggar i k1-storen (negativa tal har sin hemvist i k1, som bladen); övriga i k3.
function blad(b, x){
  var gr = PT.g(x.rubrik, x.nod || b.nod, x.rader);
  if(b.store === 'k1') delete gr.loggStore;
  return { titel: b.namn, grupper: [gr] };
}
function drillKalla(ref){
  var id = String(ref || ''), b = BANK[id]; if(!b) return null;
  var uppg = b.uppg();
  var kalla = { arskurs: 7, titel: b.namn,
    instanser: uppg.map(function(x, i){ return { bokstav: bladBokstav(i), blad: blad(b, x) }; }),
    rita: function(mount, bl){
      mount.innerHTML = ''; var m = document.createElement('div'); m.className = 'ovn-wrap fk-d1-blad'; mount.appendChild(m);
      window.bygg_blad(m, bl);
      var kp = document.getElementById('ovn-keypad-shared');
      if(kp && window.AK8_UI && AK8_UI.keypadBokstaver && window.bladBokstaver) AK8_UI.keypadBokstaver(kp, window.bladBokstaver(bl));
    } };
  var mallar = uppg.filter(function(x){ return x.mall; }).map(function(x){ return x.mall; });
  if(b.regler && mallar.length) kalla.mall = { ref: 'k3d3:' + id, mallar: mallar, regler: b.regler, extra: b.extra,
    bygg: function(ny, m){ return blad(b, byggNy(b.nod)(ny, m)); } };
  return kalla;
}

window.BLAD_K3_D3_METOD = { ORDNING: ORDNING, trad: trad, drillKalla: drillKalla,
  bank: function(id){ var b = BANK[id]; return b ? { id: id, kat: b.kat, namn: b.namn, nod: b.nod, regler: b.regler, uppg: b.uppg() } : null; } };
})();
