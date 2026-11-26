/* spec-fuzz-nya-tal.js — NYA TAL EFTER BANKEN, prövat mot lövens talregler (KONVENTIONER, METODTRÄNING; Joachim 2026-11-25).

   Varje RÄKNELÖV (ett löv vars källa bär `mall`) får N nya uppgifter (standard 300) ur den delade mekanismen
   (js/motor/ovamer/nya-tal.js, via källregistrets krok). Varje uppgift prövas — med egna mätningar, inte generatorns:
     TALREGEL  varje tal i uppgiften ligger inom lövets talregel för sin roll (faktor framför parentes, koefficient
               framför bokstav, övriga tal, insättningsvärde)
     BAND      … och mellan bankens minsta och största för rollen
     FORM      uppgiften är en mall med andra tal (texten lika när talen byts mot #), och svaret har samma termer med
               samma tecken som mallens svar (samma svarsform)
     FACIT     svaret är uttrycket förenklat (AlgBrak.pointEqual) och godkänns av rättaren (gradePoly: förenklat, i
               bokstavsordning med siffertermen sist, §3); insättningens värde stämmer
     SVÅRARE   inget tal i svaret och inget beräknat värde är större (till beloppet) än bankens största
     MELLANLED kravet följer regeln (minus framför en parentes → obligatoriskt, annars frivilligt eller inget); facits
               led godkänns, och ett HOPSLAGET led (svaret i ledrutan) underkänns där ledet är obligatoriskt
     LED       prioKedjan (moment 2): facits led räknas om här (från vänster ett steg i taget, eller tecknen byts vid
               − (−a) och + (−a)) och har uttryckets värde
     EGEN      lövets egna talregler ur klartexten (k3-d3-metodtraning.md): N1 talen −15–25; N3 talet i rutan
               −10–15; N5 faktorerna 2–9, vid division nämnaren och kvoten 2–9; F5/F6 divisionen går jämnt;
               M5 värdet 0 eller positivt
     d1 (k3d1: R1 tal, R3–R5 insättning; Joachim 2026-11-26):
     AVSKRIFT  avskriften är uttrycket med talen insatta (räknat här: 4x → 4 · 5) och har svarets värde; rubriken bär
               uttrycket ("Beräkna 4x + 3 när x = 5.")
     LED       lika många led som mallen, varje led har svarets värde och ett räknesteg mindre, sista ledet ett steg
     EGEN      inget gånger eller delat med 1; svaret har högst mallens decimaler (divisionen går jämnt)
     BANKEN    bankens egna avskrifter och led följer av samma räkning som de nya uppgifternas
     NY        uppgiften (uttrycket och insättningsvärdet) är inte en av bankens och upprepar inte någon av de tio
               föregående
     SLUT      drillen tar inte slut: varje nasta(i) ger ett blad
     MALLAR    (rapport, inte brott) en mall som ibland inte ger någon giltig uppgift efter 20 000 dragningar — mallen
               väljs först med lika stor chans (nya-tal.js), och drillen tar då nästa mall
   Raderna mäts efter typ: parentesraden (uttryck), förenkla-rutan (fraga), talrutan ("4 − 9 = __"), saknat tal
   ("5 − __ = −3": uträkningen med svaret insatt), prioKedjan (vansterText och facitLed).
   NEGATIV VERIFIERING (V2, V12 — samma läge som körningen): --sabba band|ordning|mellanled|form|led|egen|avskrift förstör de
   nya uppgifterna efter mekanismen, och fuzzen ska då fälla med benets namn.
   KÖR:  node verktyg/spec-fuzz-nya-tal.js [--n 300] [--lov P2] [--sabba …]     Exit 1 vid brott. Ingen nätväg. */
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..'), JS = p => path.join(ROOT, 'js', p);
const args = process.argv.slice(2), opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const N = parseInt(opt('--n') || '300', 10), BARA = opt('--lov'), SABBA = opt('--sabba');

global.window = global;
require(JS('motor/alg-brak.js')); require(JS('motor/mellanled-rattare.js'));
window.SvgAlgebraFigur = new Proxy({}, { get: () => () => '<svg></svg>' });
require(JS('motor/ovamer/nya-tal.js'));
const AB = window.AlgBrak, ML = window.MellanledRattare, NT = window.NyaTal;
// Bokstäverna som bankerna använder (som knappsatsen gör i webbläsaren: AlgBrak.bokstaver).
AB.bokstaver('abnstvxyz');
/* KÄLLORNA med räknelöv: modulen och hur den hämtar ett löv. En ny källa (t.ex. d1:s) läggs till här. */
const KALLOR = [
  { id: 'k3d3', filer: ['motor/blad/blad-k3-d3-typer.js', 'motor/blad/blad-k3-d3-metod.js'], mod: () => window.BLAD_K3_D3_METOD },
  { id: 'k3d1', filer: ['motor/blad/blad-k3-d1-typer.js', 'motor/blad/blad-k3-d1-metod.js'], mod: () => window.BLAD_K3_D1_METOD }
];

const m = s => String(s).replace(/−/g, '-');
function tal(s){ return parseFloat(String(s).replace(',', '.')); }
// Talen och deras roller — mätt här, oberoende av generatorn.
function roller(s){
  const ut = []; const re = /\d+(?:,\d+)?/g; let x;
  while((x = re.exec(s))){
    const efter = s.slice(x.index + x[0].length).replace(/^\s+/, '')[0] || '';
    ut.push({ v: tal(x[0]), roll: efter === '(' ? 'faktor' : /[a-z]/i.test(efter) ? 'koef' : 'konst' });
  }
  return ut;
}
const signatur = s => m(s).replace(/\d+(?:,\d+)?/g, '#').replace(/\s+/g, '');
// Svarets termer och tecken ur texten: "−2x + 5y" → "x-,y+".
function svarsform(s){
  return (m(s).replace(/\s+/g, '').match(/[+-]?[^+-]+/g) || []).map(t => {
    const neg = t[0] === '-', k = t.replace(/^[+-]/, '').replace(/^[\d,]+/, '');
    return k + (neg ? '-' : '+');
  }).sort().join(',');
}
const talIText = s => (m(s).match(/\d+(?:,\d+)?/g) || []).map(tal);
function insatt(u, x){
  const vals = typeof x === 'object' ? x : null;
  const t = m(u).replace(/(\d)\s*([a-z(])/gi, '$1*$2').replace(/\)\s*\(/g, ')*(').replace(/·/g, '*').replace(/,/g, '.')
    .replace(/[a-z]/gi, c => '(' + (vals ? tal(vals[c]) : tal(x)) + ')');
  return Function('return ' + t)();
}
// Talen med sitt tecken: ett minus tätt intill talet hör till talet.
const tecknade = s => (String(s).match(/[−-]?\d+(?:,\d+)?/g) || []).map(t => tal(t.replace('−', '-')));
const tUt = v => (v < 0 ? '−' : '') + String(Math.abs(v)).replace('.', ',');
// Leden räknade här: från vänster ett steg i taget, eller teckenbytet.
function egnaLed(u){
  const s = String(u).replace(/-/g, '−');
  if(/\(−/.test(s)) return [s.replace(/− \(−(\d+)\)/g, '+ $1').replace(/\+ \(−(\d+)\)/g, '− $1')];
  const t = s.match(/^(−?\d+)((?: [+−] \d+)+)$/); if(!t) return null;
  const par = [...t[2].matchAll(/ ([+−]) (\d+)/g)].map(x => [x[1], +x[2]]); let acc = tal(t[1].replace('−', '-')); const ut = [];
  for(let k = 0; k < par.length - 1; k++){ acc += par[k][0] === '+' ? par[k][1] : -par[k][1]; ut.push(tUt(acc) + par.slice(k + 1).map(q => ' ' + q[0] + ' ' + q[1]).join('')); }
  return ut;
}
const evalTal = u => Function('return ' + m(u).replace(/·/g, '*').replace(/,/g, '.').replace(/(\d)\s*\(/g, '$1*(').replace(/\)\s*\(/g, ')*('))();
/* RADEN mätt efter typ → { U: uttrycket, S: svaret, x, vardeSvar, ruta: talet i rutan (saknat tal) }. */
/* d1:s insättning: värdet står i rubriken ("Beräkna 4x + 3 när x = 5.", "… när a = 6 och b = 9."). */
function xUrRubrik(r){
  const t = /när ((?:[a-z] = \d+(?:,\d+)?(?: och )?)+)\./.exec(r || ''); if(!t) return null;
  const par = t[1].split(' och ').map(p => p.split(' = '));
  return par.length === 1 ? tal(par[0][1]) : par.reduce((o, p) => (o[p[0]] = tal(p[1]), o), {});
}
function las(rad, g, kalla){
  if(rad.typ === 'parentes') return { U: rad.uttryck, S: rad.svar, x: rad.varde && rad.varde.x, vardeSvar: rad.varde && rad.varde.svar };
  if(rad.typ === 'forenkla') return { U: rad.fraga, S: rad.svar };
  // d1:s räkning (R1 tal, R3–R5 insättning): avskriften och leden efter prioriteringsregeln.
  if(rad.typ === 'prioKedja' && kalla === 'k3d1'){
    const L = { U: rad.vansterText, S: tUt(rad.svar), led: rad.facitLed, avskrift: rad.avskrift && rad.avskrift.visa, d1: true };
    if(/[a-z]/i.test(rad.vansterText)){ L.x = xUrRubrik(g.rubrik); L.vardeSvar = rad.svar; L.rubrik = g.rubrik; }
    return L;
  }
  if(rad.typ === 'prioKedja') return { U: rad.vansterText, S: tUt(rad.svar), led: rad.facitLed };
  if(rad.typ === 'lucka'){
    if(/ = __$/.test(rad.text)) return { U: rad.text.replace(/ = __$/, ''), S: tUt(rad.svar) };
    const [v, h] = rad.text.split(' = '); return { U: v.replace('__', tUt(rad.svar)), S: h, ruta: rad.svar };
  }
  return null;
}
const EGEN = {
  N1: L => tecknade(L.U).every(v => v >= -15 && v <= 25) || 'ett tal utanför −15–25',
  N3: L => (L.ruta >= -10 && L.ruta <= 15) || 'talet i rutan ' + L.ruta + ' utanför −10–15',
  N5: L => { const t = tecknade(L.U).map(Math.abs), i = v => v >= 2 && v <= 9;
    return (/\//.test(L.U) ? i(t[1]) && t[0] % t[1] === 0 && i(t[0] / t[1]) : t.every(i)) || 'faktor, nämnare eller kvot utanför 2–9'; },
  F5: L => !/,/.test(L.S) || 'divisionen går inte jämnt',
  F6: L => !/,/.test(L.S) || 'divisionen går inte jämnt',
  M5: L => L.vardeSvar >= 0 || 'värdet ' + L.vardeSvar + ' är negativt'
};
/* d1:s räknelöv (k3-d1-metodtraning.md har inga talregler per löv): som i banken — inget gånger eller delat med 1, och
   svaret har högst så många decimaler som mallens tal (divisionen går jämnt). */
const D1_EGEN = L => {
  const ett = [L.avskrift].concat(L.led || []).find(t => /(^|[^\d,])1 ·|· 1(?![\d,])|\/1(?![\d,])|(^|[^\d,])1\//.test(t));
  if(ett) return 'gånger eller delat med 1 i "' + ett + '"';
  const aa = [L.avskrift].concat(L.led || []).find(t => (t.match(/\d+(?:,\d+)?\/\d+(?:,\d+)?/g) || []).some(q => q.split('/')[0] === q.split('/')[1]));
  if(aa) return 'bråket a/a i "' + aa + '"';
  const dec = (String(L.S).split(',')[1] || '').length;
  return dec <= (L.D || 0) || 'svaret ' + L.S + ' har fler decimaler än mallens (' + (L.D || 0) + ')';
};
['R1', 'R3', 'R4', 'R5'].forEach(id => { EGEN[id] = D1_EGEN; });
function ledText(u){ return ML.facitTermer(u).join(' + ').replace(/\+ -/g, '- '); }
function minusForeParentes(u){ return ML.grupper(u).some(g => g.parentes && g.tecken === '-'); }

let fel = 0, prov = 0;
const MALLAR = [];
const brott = {};
function brot(ben, lov, i, text){ fel++; (brott[ben] = brott[ben] || []).push(lov + ' #' + i + ': ' + text); }

console.log('SPEC-FUZZ NYA TAL — ' + N + ' nya uppgifter per räknelöv' + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');
KALLOR.forEach(K => {
  K.filer.forEach(f => require(JS(f)));
  const MOD = K.mod();
  MOD.ORDNING.forEach(id => {
    if(BARA && id !== BARA) return;
    let k = MOD.drillKalla(id);
    if(!k || !k.mall){ console.log('  · ' + K.id + ':' + id + ' — bara författade uppgifter (ingen mall)'); return; }
    k = NT.medNasta(k);
    const M = k.mall, R = M.regler || {}, n = k.instanser.length;
    /* BANKEN (d1): bankens egna avskrifter och led följer av samma räkning som de nya uppgifterna får — annars bygger
       mekanismen leden på ett annat sätt än Joachims facit. */
    if(MOD.rakna){
      MOD.bank(id).uppg.forEach((x, i) => {
        const rad = x.rader[0], mm = MOD.rakna.mallAv(id, x);
        if(!mm){ brot('BANKEN', id, i + 1, 'ingen mall ur uppgiften'); return; }
        const av = mm.typ === 'prio' ? mm.uttryck : MOD.rakna.avskriftAv(mm.uttryck, mm.x), r = MOD.rakna.ledAv(av);
        if(av !== rad.avskrift.visa) brot('BANKEN', id, i + 1, 'avskriften ' + av + ' ≠ bankens ' + rad.avskrift.visa);
        if(JSON.stringify(r.led) !== JSON.stringify(rad.facitLed) || Math.abs(r.svar - rad.svar) > 1e-9)
          brot('BANKEN', id, i + 1, 'leden ' + JSON.stringify(r.led) + ' = ' + r.svar + ' ≠ bankens ' + JSON.stringify(rad.facitLed) + ' = ' + rad.svar);
      });
    }
    // Bankens band och största svar — mätt ur mallarna.
    const bandB = {}; let maxSvar = 0, maxVarde = 0;
    M.mallar.forEach(mm => {
      roller(mm.uttryck).forEach(t => { const b = bandB[t.roll] || (bandB[t.roll] = [Infinity, -Infinity]); b[0] = Math.min(b[0], t.v); b[1] = Math.max(b[1], t.v); });
      if(mm.x != null){ const vs = typeof mm.x === 'object' ? Object.values(mm.x).map(tal) : [tal(mm.x)];
        const b = bandB.varde || (bandB.varde = [Infinity, -Infinity]); vs.forEach(v => { b[0] = Math.min(b[0], v); b[1] = Math.max(b[1], v); });
        maxVarde = Math.max(maxVarde, Math.abs(insatt(mm.uttryck, mm.x))); }
      talIText(NT.svarAv(NT.poly(mm.uttryck))).forEach(v => { maxSvar = Math.max(maxSvar, v); });
    });
    const nyck = (u, x) => signatur(u) + '|' + m(u).replace(/\s+/g, '') + (x != null ? '|' + JSON.stringify(x) : '');
    const bank = new Set(M.mallar.map(mm => nyck(mm.uttryck, mm.x)));
    const bankNoll = M.mallar.some(mm => mm.x != null && Math.abs(insatt(mm.uttryck, mm.x)) < 1e-9);
    const sigs = M.mallar.map(mm => signatur(mm.uttryck));
    const senaste = [];
    let ok = 0;
    for(let i = n; i < n + N; i++){
      prov++;
      let inst = k.nasta(i);
      if(!inst){ brot('SLUT', id, i, 'nasta gav inget blad'); continue; }
      inst = JSON.parse(JSON.stringify(inst));
      const g = inst.blad.grupper[0], rad = g.rader[0], L = las(rad, g, K.id);
      if(!L){ brot('FORM', id, i, 'okänd radtyp ' + rad.typ); continue; }
      const x = L.x;
      // ── SABOTAGE (efter mekanismen) ──
      if(SABBA === 'band' && i % 7 === 0){ L.U = L.U.replace(/\d+/, '97'); }
      if(SABBA === 'ordning' && i % 7 === 0 && /[a-z].*[+-].*\d|[a-z].*[+-].*[a-z]/.test(L.S)){ const t = m(L.S).match(/[+-]?[^+-]+/g); L.S = (t.reverse().join(' + ')).replace(/\+\s*-/g, '- ').replace(/^\s*\+\s*/, '').replace(/\s+/g, ' ').trim(); }
      if(SABBA === 'mellanled' && rad.mellanled === 'kravt') rad.mellanled = 'frivilligt';
      if(SABBA === 'form' && i % 7 === 0) L.U = L.U.replace(/\+/, '-');
      if(SABBA === 'led' && L.led) L.led = [L.S];
      if(SABBA === 'egen' && EGEN[id]){ if(id === 'N3') L.ruta = 17; else if(id === 'M5') L.vardeSvar = -1; else if(/^F/.test(id)) L.S = L.S + ',5'; else if(L.d1) L.S = tUt(tal(m(L.S)) + 0.037); else L.U = L.U.replace(/\d+/, '41'); }
      if(SABBA === 'avskrift' && L.d1) L.avskrift = L.avskrift.replace(/\d+/, d => String(+d + 1));
      const U = L.U, S = L.S, vardeSvar = L.vardeSvar;
      let lyckat = true; const b = (ben, t) => { lyckat = false; brot(ben, id, i, t + '  [' + U + ' = ' + S + ']'); };
      // TALREGEL och BAND
      roller(U).forEach(t => {
        if(R[t.roll] && (t.v < R[t.roll][0] || t.v > R[t.roll][1])) b('TALREGEL', t.roll + ' ' + t.v + ' utanför ' + R[t.roll].join('–'));
        const bb = bandB[t.roll];
        if(!bb || t.v < bb[0] || t.v > bb[1]) b('BAND', t.roll + ' ' + t.v + ' utanför bankens ' + (bb ? bb.join('–') : '—'));
      });
      if(x != null){ (typeof x === 'object' ? Object.values(x) : [x]).map(tal).forEach(v => {
        if(R.varde && (v < R.varde[0] || v > R.varde[1])) b('TALREGEL', 'värde ' + v);
        if(!bandB.varde || v < bandB.varde[0] || v > bandB.varde[1]) b('BAND', 'värde ' + v); }); }
      // FORM
      // Flera mallar kan ha samma form (−5 + 11 och −9 + 4): svarsformen ska vara någon av deras.
      const sig = signatur(U), mis = sigs.map((x, j) => x === sig ? j : -1).filter(j => j >= 0);
      if(!mis.length) b('FORM', 'ingen mall har formen ' + sig);
      else if(L.d1 && x != null){
        // Insättningen: svaret är ett tal — samma tecken som mallens värde, och ett heltal om mallens är ett heltal.
        const vm = mis.map(j => insatt(M.mallar[j].uttryck, M.mallar[j].x));
        if(!vm.some(v => (v > 0) === (vardeSvar > 0) && (v !== Math.round(v) || vardeSvar === Math.round(vardeSvar)))) b('FORM', 'värdets form ' + vardeSvar + ' ≠ mallarnas ' + vm.join('/'));
      }
      else if(!mis.some(j => svarsform(S) === svarsform(NT.svarAv(NT.poly(M.mallar[j].uttryck))))) b('FORM', 'svarsformen ' + svarsform(S) + ' ≠ mallarnas');
      // AVSKRIFT (d1): uttrycket med talen insatta, räknat här, och med svarets värde
      if(L.d1){
        const egen = x == null ? U : m(U).replace(/(\d)\s*([a-z])/gi, (_, d, k) => d + ' · ' + tUt(typeof x === 'object' ? x[k] : x))
          .replace(/[a-z]/gi, k => tUt(typeof x === 'object' ? x[k] : x)).replace(/-/g, '−');
        if(L.avskrift !== egen) b('AVSKRIFT', 'avskriften "' + L.avskrift + '" ≠ "' + egen + '"');
        let va = NaN; try { va = evalTal(L.avskrift); } catch(e){}
        if(!(Math.abs(va - tal(m(S))) < 1e-9)) b('AVSKRIFT', 'avskriften har värdet ' + va + ', svaret ' + S);
        if(x != null && L.rubrik.indexOf('Beräkna ' + U + ' när ') !== 0) b('FORM', 'rubriken bär inte uttrycket: ' + L.rubrik);
      }
      // FACIT (rena tal: värdet räknat här; uttryck: AlgBrak och rättaren)
      if(L.d1){ /* insättningen prövas nedan (x) och i AVSKRIFT; R1 är rena tal */ if(!/[a-z]/i.test(U)){ let v; try { v = evalTal(U); } catch(e){ b('FACIT', 'otolkbart: ' + e.message); }
        if(v !== undefined && Math.abs(v - tal(m(S))) > 1e-9) b('FACIT', 'värdet ' + v + ' ≠ svaret ' + S); } }
      else if(!/[a-z]/i.test(U)){
        let v; try { v = evalTal(U); } catch(e){ b('FACIT', 'otolkbart: ' + e.message); }
        if(v !== undefined && Math.abs(v - tal(m(S))) > 1e-9) b('FACIT', 'värdet ' + v + ' ≠ svaret ' + S);
      } else {
        try { if(!AB.pointEqual(AB.parse(m(U).replace(/·/g, '*')), AB.parse(m(S)))) b('FACIT', 'svaret är inte uttrycket förenklat'); } catch(e){ b('FACIT', 'otolkbart: ' + e.message); }
        const gp = AB.gradePoly(m(S), m(S), { tillatEtta: true });
        if(gp.status !== 'ratt') b('FACIT', 'rättaren godkänner inte svaret (' + (gp.form || gp.status) + ')');
      }
      /* ORDNINGEN mäts här, inte med rättaren: gradePoly(svar, svar) prövar inte ordningen när facit självt bryter
         regeln (mätt med --sabba ordning). §3: bokstavsordning, siffertermen sist; är den första variabeltermen
         negativ får svaret börja med en positiv term. */
      const termer = (m(S).replace(/\s+/g, '').match(/[+-]?[^+-]+/g) || []).map(t => ({ neg: t[0] === '-', k: t.replace(/^[+-]/, '').replace(/^[\d,]+/, '') }));
      const vantad = termer.map(t => t.k).filter(Boolean).sort().concat(termer.some(t => !t.k) ? [''] : []);
      if(termer.map(t => t.k).join('|') !== vantad.join('|')){
        const forstaVar = termer.find(t => t.k === vantad[0]);
        if(!(forstaVar && forstaVar.neg && !termer[0].neg)) b('FACIT', 'svaret står inte i bokstavsordning med siffertermen sist');
      }
      if(x != null && Math.abs(insatt(U, x) - vardeSvar) > 1e-9) b('FACIT', 'insättningen ' + insatt(U, x) + ' ≠ ' + vardeSvar);
      // SVÅRARE
      // (d1:s insättning: svaret är värdet, och det prövas mot bankens största värde nedan.)
      if(!(L.d1 && x != null)) talIText(S).forEach(v => { if(v > maxSvar) b('SVÅRARE', 'talet ' + v + ' i svaret > bankens ' + maxSvar); });
      if(x != null && (vardeSvar < 0 || (vardeSvar === 0 && !bankNoll) || vardeSvar > maxVarde)) b('SVÅRARE', 'värdet ' + vardeSvar + ' (bankens största ' + maxVarde + ', ska vara positivt)');
      // LED (d1): lika många led som mallen, varje led har värdet, varje led ett räknesteg kortare, sista ledet ett steg
      if(L.d1){
        const ops = t => (String(t).match(/[·\/]| [+−] /g) || []).length;
        const antal = mis.length ? M.mallar[mis[0]].antalLed : null, kedja = [L.avskrift].concat(L.led || []);
        if((L.led || []).length !== antal) b('LED', (L.led || []).length + ' led, mallen har ' + antal);
        (L.led || []).forEach(l => { let v = NaN; try { v = evalTal(l); } catch(e){} if(!(Math.abs(v - tal(m(S))) < 1e-9)) b('LED', 'ledet ' + l + ' har inte svarets värde'); });
        for(let q = 1; q < kedja.length; q++) if(!(ops(kedja[q]) < ops(kedja[q - 1]))) b('LED', 'ledet ' + kedja[q] + ' räknar inget');
        // Sista ledet räknas i ETT steg: ingen parentes, och bara en prioritetsnivå kvar ("50 − 28 + 3", "12 · 5").
        const sista = kedja[kedja.length - 1];
        if(antal > 0 && (/[()]/.test(sista) || (/[·\/]/.test(sista) && / [+−] /.test(sista)))) b('LED', 'sista ledet ' + sista + ' räknas inte i ett steg');
        // D och heltal: mallarna med samma form (flera kan ha den: 40 − 6 · 5 och 20,5 − 3 · 4,5) — EGEN och FORM
        const decAv = mm => Math.max(0, ...(mm.uttryck.match(/\d+(?:,\d+)?/g) || []).map(t => (t.split(',')[1] || '').length),
          ...(mm.x == null ? [] : (typeof mm.x === 'object' ? Object.values(mm.x) : [mm.x])).map(v => (String(v).split('.')[1] || '').length));
        const sv = tal(m(S)), passar = mis.filter(j => { const mm = M.mallar[j], vm = x == null ? evalTal(mm.uttryck) : insatt(mm.uttryck, mm.x);
          return vm !== Math.round(vm) || sv === Math.round(sv); });
        if(mis.length && !passar.length) b('FORM', 'svaret ' + S + ' är inte ett heltal fast mallens är det');
        L.D = Math.max(0, ...(passar.length ? passar : mis).map(j => decAv(M.mallar[j])));
      }
      // LED (prioKedjan)
      else if(rad.typ === 'prioKedja'){
        const egna = egnaLed(U);
        if(!egna || JSON.stringify(egna) !== JSON.stringify(L.led)) b('LED', 'facits led ' + JSON.stringify(L.led) + ' ≠ ' + JSON.stringify(egna));
        (L.led || []).forEach(l => { let v = NaN; try { v = evalTal(l); } catch(e){} if(!(Math.abs(v - evalTal(U)) < 1e-9)) b('LED', 'ledet ' + l + ' har inte uttryckets värde'); });
      }
      // EGEN (lövets egna talregler)
      if(EGEN[id]){ const r = EGEN[id](Object.assign({}, L, { U: U, S: S, vardeSvar: vardeSvar })); if(r !== true) b('EGEN', r); }
      // MELLANLED
      if(rad.typ === 'parentes'){
        const forv = minusForeParentes(U) ? 'kravt' : (ML.kravAv(U) ? 'frivilligt' : 'nej');
        if(rad.mellanled !== forv) b('MELLANLED', 'kravet ' + rad.mellanled + ', regeln ger ' + forv);
        if(forv !== 'nej'){
          if(ML.grade(ledText(U), U, forv).status !== 'ratt') b('MELLANLED', 'facits led underkänns');
          if(forv === 'kravt' && ML.grade(S, U, 'kravt').status === 'ratt') b('MELLANLED', 'ett hopslaget led godkänns');
        }
      }
      // NY
      const nyckel = nyck(U, x);
      if(bank.has(nyckel)) b('NY', 'uppgiften är bankens');
      if(senaste.indexOf(nyckel) >= 0) b('NY', 'upprepning inom tio');
      senaste.push(nyckel); if(senaste.length > 10) senaste.shift();
      if(lyckat) ok++;
    }
    console.log((ok === N ? '✓ ' : '✗ ') + K.id + ':' + id + ' — ' + ok + '/' + N + ' nya uppgifter håller (bank ' + n + ', ' + M.mallar.length + ' mallar; band '
      + Object.keys(bandB).map(r => r + ' ' + bandB[r].join('–')).join(', ') + ')');
    /* MALLAR UTAN UPPGIFT (Joachim 2026-11-26): mekanismen väljer mallen först, med lika stor chans; en mall som inte
       ger någon giltig uppgift efter många dragningar rapporteras här (statistik.tomma i nya-tal.js). Rapport, inte
       brott: mallen är Joachims, och bandet är bankens. */
    const St = k.statistik;
    if(St) St.tomma.forEach((t, j) => { if(t > 0) MALLAR.push(K.id + ':' + id + ' mall ' + (j + 1) + ' "' + M.mallar[j].uttryck + '": vald ' + St.val[j]
      + ' gånger, ' + t + ' av dem utan giltig uppgift efter 20 000 dragningar'); });
  });
});
if(MALLAR.length){ console.log('\n  ⚠ MALLAR SOM INTE ALLTID GER EN UPPGIFT (' + MALLAR.length + ') — drillen tar då nästa mall:'); MALLAR.forEach(t => console.log('      ' + t)); }
Object.keys(brott).forEach(ben => { console.log('\n  ✗ ' + ben + ' (' + brott[ben].length + ')'); brott[ben].slice(0, 4).forEach(t => console.log('      ' + t)); });
console.log('\n' + (fel ? '✗ SPEC-FUZZ NYA TAL RÖD (' + fel + ')' : '✓ SPEC-FUZZ NYA TAL GRÖN') + ' · ' + prov + ' nya uppgifter prövade');
process.exit(fel ? 1 : 0);
