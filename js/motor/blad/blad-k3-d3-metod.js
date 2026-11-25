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
function fbm(uttryck, forenklat, x, svar){
  return { rubrik: NAR + narText(uttryck, x) + '.', nod: nodFor(uttryck), rader: [PT.fb('', uttryck, forenklat, x, svar)],
           mall: { uttryck: uttryck, x: x, typ: 'fb' } };
}
// Bladet för en ny uppgift ur en mall (samma uppgiftstyp och rubrik som mallen).
function byggNy(nod){
  return function(ny, m){
    if(m.typ === 'fb') return { rubrik: NAR + narText(ny.uttryck, ny.x) + '.', nod: nodFor(ny.uttryck),
                                rader: [PT.fb('', ny.uttryck, ny.svar, ny.x, ny.vardeSvar)] };
    return { rubrik: m.rubrik, nod: nod, rader: [PT.p(ny.uttryck, ny.svar)] };
  };
}
function rekt(b, h){ return F().rektangel({ bredd: b + ' cm', hojd: h + ' cm' }); }
function lada(vikt, antal){ var ut = []; for(var i = 0; i < antal; i++) ut.push(['Låda', vikt]); return ut; }

/* BANKERNA. kat = trädets gren; nod = mastery; regler = lövets talregler (nya tal efter banken); uppg() byggs när de
   hämtas (figurerna behöver SvgAlgebraFigur). */
var KAT = [ { id: 'P', namn: 'Parenteser', roll: 'fordjupning' } ];
var BANK = {};

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
function tu(rubrik, rader){ return { rubrik: rubrik, rader: rader }; }
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

var ORDNING = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];

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
function blad(b, x){ return { titel: b.namn, grupper: [PT.g(x.rubrik, x.nod || b.nod, x.rader)] }; }
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
  if(b.regler && mallar.length) kalla.mall = { ref: 'k3d3:' + id, mallar: mallar, regler: b.regler,
    bygg: function(ny, m){ return blad(b, byggNy(b.nod)(ny, m)); } };
  return kalla;
}

window.BLAD_K3_D3_METOD = { ORDNING: ORDNING, trad: trad, drillKalla: drillKalla,
  bank: function(id){ var b = BANK[id]; return b ? { id: id, kat: b.kat, namn: b.namn, nod: b.nod, regler: b.regler, uppg: b.uppg() } : null; } };
})();
