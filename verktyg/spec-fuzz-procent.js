/* spec-fuzz-procent.js — NYA TAL I PROCENTENS METODTRÄNING, prövade mot lövens talregler (doc/innehall/
   k4-d1-procent-metodtraning.md; Joachim 2026-11-26).

   Varje löv med nya tal (B2–B6) får N nya uppgifter (standard 2000) ur den delade mekanismen (NyaTal.medTalregel, via
   lövets mall i js/motor/blad/blad-k4-d1-metod.js). Varje uppgift prövas med egna mätningar, inte generatorns:
     TALREGEL  bråket eller procenttalet följer lövets talregel:
               B2 nämnaren 2, 3, 4, 5, 10 eller 100, äkta bråk, täljaren 1 / 1–2 / 1–3 / 1–4 / 1–9 / 1–99
               B3 bråket = enklaste form · k, enklaste formens nämnare 2, 4 eller 5, k 2–15, nämnaren högst 75
               B4 nämnaren 20, 25 eller 50, täljaren ur klartextens lista (går inte att förkorta)
               B5 nämnaren 200–900, 1100 eller 1200; täljaren = k · nämnaren/100; nivå 1 k 3–11 utom 10; nivå 2 k
                  tvåsiffrigt, tiotal 2–6 och ental 1–3 (1100, 1200: 2–3 och 1–2), entalsdelen högst 9 vid 200–900
               B6 hela procent 1–99, p/100 går att förkorta, enklaste formens nämnare 2, 4, 5, 10, 20, 25 eller 50
     FACIT     kedjans led har lövets former i rätt ordning, och varje led har uppgiftens värde i sin form (hundradelar
               = nämnaren 100, enklaste form = förkortat, decimalform, procentform); tredjedelar ≈ med två decimaler
     TIOTAL    varje tiotal nya uppgifter efter banken: B2 och B6 minst en 0,0x, B5 nivå 2 bara på plats 9 och 10
     NY        uppgiften är inte en av bankens och upprepar ingen av de tio föregående — utom de FASTA mallarna
               (1/2, 1/3, 2/3), som redovisas för sig och inte fäller
     MALL      varje mall väljs; tomma val (mallen gav inget nytt, nästa mall togs) redovisas
     BANKEN    (alla sju löv) bankens kedjor är Joachims facit i klartexten, uppgift för uppgift
   NEGATIV VERIFIERING: --sabba regel|facit|tiotal|bank förstör talregeln, facit, tiotalsregeln eller klartextens facit — fuzzen ska fälla med
   benets namn. KÖR: node verktyg/spec-fuzz-procent.js [--n 2000] [--lov B5] [--sabba …]   Exit 1 vid brott. Ingen nätväg. */
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), JS = p => path.join(ROOT, 'js', p);
const args = process.argv.slice(2), opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const N = parseInt(opt('--n') || '2000', 10), BARA = opt('--lov'), SABBA = opt('--sabba');
global.window = global;
['motor/figur/svg-andel.js', 'motor/figur/svg-tallinje.js', 'motor/ovamer/nya-tal.js', 'motor/blad/blad-k4-d1-procent.js',
 'motor/blad/blad-k4-d1-metod.js'].forEach(f => require(JS(f)));
const NT = window.NyaTal, MET = window.BLAD_K4_D1_METOD;
if(SABBA === 'regel') MET.REGEL.B4_TAL[20].push(5);          // 5/20 går att förkorta — TALREGEL ska fälla

const sgd = (a, b) => b ? sgd(b, a % b) : a;
const lika = (x, y) => Math.abs(x - y) < 1e-9;
const brak = s => { const m = /^(\d+)\/(\d+)$/.exec(String(s)); return m ? [+m[1], +m[2]] : null; };
let fel = 0; const brott = {};
function brot(ben, lov, i, t){ fel++; (brott[ben] = brott[ben] || []).push(lov + ' #' + i + ': ' + t); }

/* TALREGELN, räknad här. Ger { ok, smal (0,0x), niva } eller ett felmeddelande. */
function regel(lov, v){
  if(lov === 'B6'){
    const p = +/^(\d+) %$/.exec(v)[1], d = 100 / sgd(p, 100);
    if(!(p >= 1 && p <= 99)) return 'p ' + p + ' utanför 1–99';
    if([2, 4, 5, 10, 20, 25, 50].indexOf(d) < 0) return p + '/100 har enklaste nämnaren ' + d;
    return { smal: p <= 9 };
  }
  const [a, d] = brak(v);
  if(lov === 'B2'){
    const R = { 2: [1, 1], 3: [1, 2], 4: [1, 3], 5: [1, 4], 10: [1, 9], 100: [1, 99] }[d];
    if(!R) return 'nämnaren ' + d;
    if(a < R[0] || a > R[1]) return 'täljaren ' + a + ' utanför ' + R.join('–') + ' för nämnaren ' + d;
    return { smal: d === 100 && a <= 9, fast: d === 2 || d === 3 };
  }
  if(lov === 'B3'){
    const k = sgd(a, d), dn = d / k;
    if([2, 4, 5].indexOf(dn) < 0) return 'enklaste formens nämnare ' + dn;
    if(k < 2 || k > 15) return 'k ' + k + ' utanför 2–15';
    if(d > 75) return 'nämnaren ' + d + ' över 75';
    if(a >= d) return 'oäkta bråk';
    return {};
  }
  if(lov === 'B4'){
    const L = { 20: [3, 7, 9, 11, 13, 17, 19], 25: [2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 19, 21, 22, 23],
                50: [3, 7, 9, 11, 13, 17, 19, 21, 23, 31, 33, 41, 43] }[d];
    if(!L) return 'nämnaren ' + d;
    if(L.indexOf(a) < 0 || sgd(a, d) !== 1) return 'täljaren ' + a + ' inte tillåten för ' + d;
    return {};
  }
  if(lov === 'B5'){
    if([200, 300, 400, 500, 600, 700, 800, 900, 1100, 1200].indexOf(d) < 0) return 'nämnaren ' + d;
    const k = a / (d / 100);
    if(k !== Math.round(k)) return 'täljaren ' + a + ' är inte k · ' + (d / 100);
    if(k < 20){ if(k < 3 || k > 11 || k === 10) return 'nivå 1: k ' + k; return { niva: 1 }; }
    const t = Math.floor(k / 10), o = k % 10, stor = d >= 1100;
    if(k > 99 || t < 2 || t > (stor ? 3 : 6) || o < 1 || o > (stor ? 2 : 3)) return 'nivå 2: k ' + k + ' vid ' + d;
    if(!stor && o * d / 100 > 9) return 'nivå 2: entalsdelen ' + (o * d / 100) + ' över 9 (' + v + ')';
    return { niva: 2 };
  }
  return 'okänt löv';
}
const FORMER = { B2: ['decimal', 'procent'], B3: ['enklaste', 'decimal', 'procent'], B4: ['hundradelar', 'decimal', 'procent'],
                 B5: ['hundradelar', 'decimal', 'procent'], B6: ['hundradelar', 'enklaste', 'decimal'] };
/* FACIT, räknat här: ledens former och värden. */
function facit(lov, rad){
  const v = rad.vansterText, varde = lov === 'B6' ? +/^(\d+) %$/.exec(v)[1] / 100 : brak(v)[0] / brak(v)[1];
  const former = rad.led.map(l => l.form);
  if(former.join() !== FORMER[lov].join()) return 'formerna ' + former.join(',') + ' ≠ ' + FORMER[lov].join(',');
  const tredje = lov === 'B2' && brak(v)[1] === 3;
  for(const l of rad.led){
    if(l.form === 'decimal'){
      const ratt = tredje ? Math.round(varde * 100) / 100 : varde;
      if(!lika(l.svar, ratt)) return 'decimalformen ' + l.svar + ' ≠ ' + ratt;
      if(tredje !== (l.tecken === '≈')) return 'tecknet ' + (l.tecken || '=') + ' före decimalformen';
    } else if(l.form === 'procent'){
      const ratt = tredje ? Math.round(varde * 100) : varde * 100;
      if(!lika(l.svar, ratt)) return 'procentformen ' + l.svar + ' ≠ ' + ratt;
    } else {
      const b = brak(l.svar); if(!b) return l.form + ' "' + l.svar + '" är inget bråk';
      if(!lika(b[0] / b[1], varde)) return l.form + ' ' + l.svar + ' har fel värde';
      if(l.form === 'hundradelar' && b[1] !== 100) return 'hundradelar ' + l.svar;
      if(l.form === 'enklaste' && sgd(b[0], b[1]) !== 1) return 'enklaste form ' + l.svar + ' går att förkorta';
    }
  }
  return null;
}
/* KLARTEXTENS FACIT per löv: "1. 9/10 = 0,9 = 90 %" → raden ur banken skriven på samma sätt. */
function klartextFacit(){
  const t = fs.readFileSync(path.join(ROOT, 'doc/innehall/k4-d1-procent-metodtraning.md'), 'utf8'), ut = {};
  t.split(/^## /m).slice(1).forEach(del => {
    const id = del.slice(0, 2), f = del.split('**Facit**')[1]; if(!f) return;
    ut[id] = f.split('\n').map(r => /^\d+\. (.+)$/.exec(r.trim())).filter(Boolean).map(m => m[1].replace(/\s*\(även [^)]*\)/, '').trim());
  });
  return ut;
}
function skriv(l){ return l.text != null ? l.text : l.form === 'decimal' ? String(l.svar).replace('.', ',') : l.form === 'procent' ? l.svar + ' %' : l.svar; }
function kedjaText(rad){
  if(rad.typ !== 'flerled') return rad.svar + ' %';
  let s = rad.vansterText != null ? rad.vansterText : '';
  rad.led.forEach((l, k) => { s += (s ? ' ' + (l.tecken || '=') + ' ' : '') + skriv(l); });
  return s;
}

console.log('SPEC-FUZZ PROCENT — ' + N + ' nya uppgifter per löv (B2–B6)' + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');
const FACIT = klartextFacit(), RAPPORT = [];
if(SABBA === 'bank') FACIT.B4[0] = '9/20 = 45/100 = 0,45 = 46 %';   // klartexten säger annat än banken — BANKEN ska fälla
MET.ORDNING.forEach(lov => {
  if(BARA && lov !== BARA) return;
  // BANKEN: bankens kedjor = klartextens facit (B2 utan bråket, som klartexten).
  const bank = MET.bank(lov);
  bank.uppg.forEach((rad, i) => {
    const egen = kedjaText(rad), doc = FACIT[lov] && FACIT[lov][i];
    const jfr = lov === 'B2' ? egen.replace(/^\d+\/\d+ [=≈] /, '') : egen;
    if(jfr !== doc) brot('BANKEN', lov, i + 1, '"' + jfr + '" ≠ klartextens "' + doc + '"');
  });
  if(!bank.mallar){ console.log('  · ' + lov + ' — bara författade uppgifter (' + bank.uppg.length + '), banken prövad'); return; }
  let k = MET.drillKalla(lov);
  if(SABBA === 'tiotal') k.mall.valbara = null;              // tiotalsregeln borta — TIOTAL ska fälla
  k = NT.medTalregel(k);
  const n = k.instanser.length, nycklar = new Set(bank.uppg.map(r => r.vansterText)), senaste = [];
  let ok = 0, fasta = 0, tiotal = [];
  for(let i = n; i < n + N; i++){
    const x = k.nasta(i);
    if(!x){ brot('SLUT', lov, i, 'nasta gav inget blad'); continue; }
    const rad = JSON.parse(JSON.stringify(x.blad.grupper[0].rader[0]));
    if(SABBA === 'facit' && i % 9 === 0){ const d = rad.led.find(l => l.form === 'decimal'); if(d) d.svar += 0.01; }
    const v = rad.vansterText, r = regel(lov, v);
    let lyckat = true; const b = (ben, t) => { lyckat = false; brot(ben, lov, i, t + '  [' + kedjaText(rad) + ']'); };
    if(typeof r === 'string') b('TALREGEL', r);
    const f = facit(lov, rad); if(f) b('FACIT', f);
    const ar = typeof r === 'object' ? r : {};
    if(ar.fast) fasta++;
    else {
      if(nycklar.has(v)) b('NY', 'uppgiften är bankens');
      if(senaste.indexOf(v) >= 0) b('NY', 'upprepning inom tio');
    }
    senaste.push(v); if(senaste.length > 10) senaste.shift();
    tiotal.push(ar);
    if(tiotal.length === 10){
      if((lov === 'B2' || lov === 'B6') && !tiotal.some(t => t.smal)) b('TIOTAL', 'tiotalet ' + (i - 9) + '–' + i + ' saknar 0,0x');
      if(lov === 'B5'){ const pl = tiotal.map((t, q) => t.niva === 2 ? q + 1 : 0).filter(Boolean);
        if(pl.some(q => q < 9)) b('TIOTAL', 'nivå 2 på plats ' + pl.join(', ') + ' i tiotalet ' + (i - 9) + '–' + i); }
      tiotal = [];
    }
    if(lyckat) ok++;
  }
  const St = k.statistik;
  St.val.forEach((v2, j) => {
    if(!v2) brot('MALL', lov, j + 1, 'mallen "' + bank.mallar[j].nyckel + '" valdes aldrig');
    RAPPORT.push(lov + ' mall ' + String(j + 1).padStart(2) + ' ' + String(bank.mallar[j].nyckel).padEnd(9) + (St.fast[j] ? ' fast ' : '      ')
      + ' vald ' + String(v2).padStart(4) + ', tomma ' + St.tomma[j]);
  });
  console.log((ok === N ? '✓ ' : '✗ ') + lov + ' — ' + ok + '/' + N + ' nya uppgifter håller (bank ' + n + ', ' + bank.mallar.length + ' mallar'
    + (fasta ? ', ' + fasta + ' från de fasta mallarna' : '') + ')');
});
if(args.includes('--mallar')){ console.log('\n  MALLARNA (valda, tomma val = mallen gav inget nytt och nästa mall togs):'); RAPPORT.forEach(t => console.log('      ' + t)); }
Object.keys(brott).forEach(ben => { console.log('\n  ✗ ' + ben + ' (' + brott[ben].length + ')'); brott[ben].slice(0, 4).forEach(t => console.log('      ' + t)); });
console.log('\n' + (fel ? '✗ SPEC-FUZZ PROCENT RÖD (' + fel + ')' : '✓ SPEC-FUZZ PROCENT GRÖN'));
process.exit(fel ? 1 : 0);
