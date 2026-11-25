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
     NY        uppgiften är inte en av bankens och upprepar inte någon av de tio föregående
     SLUT      drillen tar inte slut: varje nasta(i) ger ett blad
   NEGATIV VERIFIERING (V2, V12 — samma läge som körningen): --sabba band|ordning|mellanled|form förstör de nya
   uppgifterna efter mekanismen, och fuzzen ska då fälla med benets namn.
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
/* KÄLLORNA med räknelöv: modulen och hur den hämtar ett löv. En ny källa (t.ex. d1:s) läggs till här. */
const KALLOR = [
  { id: 'k3d3', filer: ['motor/blad/blad-k3-d3-typer.js', 'motor/blad/blad-k3-d3-metod.js'], mod: () => window.BLAD_K3_D3_METOD }
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
function ledText(u){ return ML.facitTermer(u).join(' + ').replace(/\+ -/g, '- '); }
function minusForeParentes(u){ return ML.grupper(u).some(g => g.parentes && g.tecken === '-'); }

let fel = 0, prov = 0;
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
    // Bankens band och största svar — mätt ur mallarna.
    const bandB = {}; let maxSvar = 0, maxVarde = 0;
    M.mallar.forEach(mm => {
      roller(mm.uttryck).forEach(t => { const b = bandB[t.roll] || (bandB[t.roll] = [Infinity, -Infinity]); b[0] = Math.min(b[0], t.v); b[1] = Math.max(b[1], t.v); });
      if(mm.x != null){ const vs = typeof mm.x === 'object' ? Object.values(mm.x).map(tal) : [tal(mm.x)];
        const b = bandB.varde || (bandB.varde = [Infinity, -Infinity]); vs.forEach(v => { b[0] = Math.min(b[0], v); b[1] = Math.max(b[1], v); });
        maxVarde = Math.max(maxVarde, Math.abs(insatt(mm.uttryck, mm.x))); }
      talIText(NT.svarAv(NT.poly(mm.uttryck))).forEach(v => { maxSvar = Math.max(maxSvar, v); });
    });
    const bank = new Set(M.mallar.map(mm => signatur(mm.uttryck) + '|' + m(mm.uttryck).replace(/\s+/g, '')));
    const sigs = M.mallar.map(mm => signatur(mm.uttryck));
    const senaste = [];
    let ok = 0;
    for(let i = n; i < n + N; i++){
      prov++;
      let inst = k.nasta(i);
      if(!inst){ brot('SLUT', id, i, 'nasta gav inget blad'); continue; }
      inst = JSON.parse(JSON.stringify(inst));
      const g = inst.blad.grupper[0], rad = g.rader[0];
      const u = rad.uttryck, svar = rad.svar, x = rad.varde && rad.varde.x, vardeSvar = rad.varde && rad.varde.svar;
      // ── SABOTAGE (efter mekanismen) ──
      if(SABBA === 'band' && i % 7 === 0){ rad.uttryck = u.replace(/\d+/, '97'); }
      if(SABBA === 'ordning' && i % 7 === 0 && /[a-z].*[+-].*\d|[a-z].*[+-].*[a-z]/.test(svar)){ const t = m(svar).match(/[+-]?[^+-]+/g); rad.svar = (t.reverse().join(' + ')).replace(/\+\s*-/g, '- ').replace(/^\s*\+\s*/, '').replace(/\s+/g, ' ').trim(); }
      if(SABBA === 'mellanled' && rad.mellanled === 'kravt') rad.mellanled = 'frivilligt';
      if(SABBA === 'form' && i % 7 === 0) rad.uttryck = u.replace(/\+/, '-');
      const U = rad.uttryck, S = rad.svar;
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
      const sig = signatur(U), mi = sigs.indexOf(sig);
      if(mi < 0) b('FORM', 'ingen mall har formen ' + sig);
      else if(svarsform(S) !== svarsform(NT.svarAv(NT.poly(M.mallar[mi].uttryck)))) b('FORM', 'svarsformen ' + svarsform(S) + ' ≠ mallens');
      // FACIT
      try { if(!AB.pointEqual(AB.parse(m(U).replace(/·/g, '*')), AB.parse(m(S)))) b('FACIT', 'svaret är inte uttrycket förenklat'); } catch(e){ b('FACIT', 'otolkbart: ' + e.message); }
      const gp = AB.gradePoly(m(S), m(S), { tillatEtta: true });
      if(gp.status !== 'ratt') b('FACIT', 'rättaren godkänner inte svaret (' + (gp.form || gp.status) + ')');
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
      talIText(S).forEach(v => { if(v > maxSvar) b('SVÅRARE', 'talet ' + v + ' i svaret > bankens ' + maxSvar); });
      if(x != null && (vardeSvar <= 0 || vardeSvar > maxVarde)) b('SVÅRARE', 'värdet ' + vardeSvar + ' (bankens största ' + maxVarde + ', ska vara positivt)');
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
      const nyckel = sig + '|' + m(U).replace(/\s+/g, '');
      if(bank.has(nyckel)) b('NY', 'uppgiften är bankens');
      if(senaste.indexOf(nyckel) >= 0) b('NY', 'upprepning inom tio');
      senaste.push(nyckel); if(senaste.length > 10) senaste.shift();
      if(lyckat) ok++;
    }
    console.log((ok === N ? '✓ ' : '✗ ') + K.id + ':' + id + ' — ' + ok + '/' + N + ' nya uppgifter håller (bank ' + n + ', ' + M.mallar.length + ' mallar; band '
      + Object.keys(bandB).map(r => r + ' ' + bandB[r].join('–')).join(', ') + ')');
  });
});
Object.keys(brott).forEach(ben => { console.log('\n  ✗ ' + ben + ' (' + brott[ben].length + ')'); brott[ben].slice(0, 4).forEach(t => console.log('      ' + t)); });
console.log('\n' + (fel ? '✗ SPEC-FUZZ NYA TAL RÖD (' + fel + ')' : '✓ SPEC-FUZZ NYA TAL GRÖN') + ' · ' + prov + ' nya uppgifter prövade');
process.exit(fel ? 1 : 0);
