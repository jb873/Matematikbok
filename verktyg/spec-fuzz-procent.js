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
   GRENEN ANDELEN (A1–A7, 2026-11-27): A1–A3 prövas på samma sätt (TALREGEL, FACIT, NY, MALL — se blocket längre ned),
   A4–A7 bara mot klartextens facit (BANKEN).
   GRENEN DELEN (D1–D7, 2026-11-27): D1–D3 likadant med stegraden och bråkraden, D4–D7 mot klartextens facit (se
   blocket längst ned).
   NEGATIV VERIFIERING: --sabba regel|facit|tiotal|bank förstör talregeln, facit, tiotalsregeln eller klartextens facit — fuzzen ska fälla med
   benets namn. KÖR: node verktyg/spec-fuzz-procent.js [--n 2000] [--lov B5] [--sabba …]   Exit 1 vid brott. Ingen nätväg. */
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), JS = p => path.join(ROOT, 'js', p);
const args = process.argv.slice(2), opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const N = parseInt(opt('--n') || '2000', 10), BARA = opt('--lov'), SABBA = opt('--sabba');
global.window = global;
['motor/figur/svg-andel.js', 'motor/figur/svg-tallinje.js', 'motor/ovamer/nya-tal.js', 'motor/blad/blad-k4-d1-procent.js', 'motor/figur/svg-algebrafigur.js', 'motor/blad/blad-k4-d1-andelen.js', 'motor/blad/blad-k4-d1-delen.js',
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

console.log('SPEC-FUZZ PROCENT — ' + N + ' nya uppgifter per löv (B2–B6, A1–A3, D1–D3)' + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');
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
/* ═══ GRENEN ANDELEN (A1–A7, doc/innehall/k4-d1-procent-moment2-metodtraning.md; 2026-11-27) ═══════════════════
   Raden är Andelens fasta svarsrad: Andelen = delen/det hela (exakt) = mellanled = decimalform (valfri) = procent.
     TALREGEL  A1 y = 20, 25 eller 50, x ur klartextens lista, x < y, sgd(x, y) = 1
               A2 y = 200–900, 1100 eller 1200 (inte 1000), x = k · y/100, k 3–11 utom 10
               A3 x/y = enklaste form · k, enklaste formens nämnare 2, 4 eller 5, k 2–15, y högst 75, y inte 20, 25,
                  50 eller 100
     FACIT     första rutan = x/y, mellanledet har värdet x/y (A1, A2: i hundradelar; A3: enklaste form), decimalformen
               = x/y och är valfri, procenten = 100 · x/y; frågan "x av y?"
     NY, MALL  som B-löven
     BANKEN    (A1–A7) varje svarsrad = klartextens kedja (delen/det hela = mellanled [= decimalform] = procent, i
               ordning), och valrutans rätta alternativ = klartextens "Svar". */
function klartextFacitA(){
  const t = fs.readFileSync(path.join(ROOT, 'doc/innehall/k4-d1-procent-moment2-metodtraning.md'), 'utf8'), ut = {};
  t.split(/^## /m).slice(1).forEach(del => {
    const id = del.slice(0, 2), f = del.split('**Facit**')[1]; if(!f) return;
    ut[id] = f.split('\n').map(r => /^\d+\. (.+)$/.exec(r.trim())).filter(Boolean).map(m => {
      const rad = m[1].replace(/\s*\(även [^)]*\)/g, ''), kedjor = [], re = /(\d+\/\d+) = (\d+\/\d+)(?: = (\d+(?:,\d+)?))? = (\d+) %/g;
      let x; while((x = re.exec(rad))) kedjor.push([x[1], x[2], x[3] || null, x[4]]);
      const sv = /Svar: ([A-D])/.exec(rad);
      return { kedjor: kedjor, svar: sv ? sv[1] : null };
    });
  });
  return ut;
}
const decT = v => String(v).replace('.', ',');
function regelA(lov, x, y){
  const L = MET.REGEL;
  if(lov === 'A1'){
    if(!L.A1_TAL[y]) return 'nämnaren ' + y;
    if(L.A1_TAL[y].indexOf(x) < 0) return 'täljaren ' + x + ' inte i listan för ' + y;
    if(x >= y || sgd(x, y) !== 1) return x + '/' + y + ' går att förkorta';
    return null;
  }
  if(lov === 'A2'){
    if([200, 300, 400, 500, 600, 700, 800, 900, 1100, 1200].indexOf(y) < 0) return 'nämnaren ' + y;
    const k = x / (y / 100);
    if(k !== Math.round(k) || k < 3 || k > 11 || k === 10) return 'k ' + k + ' (' + x + '/' + y + ')';
    return null;
  }
  if(lov === 'A3'){
    const k = sgd(x, y), dn = y / k;
    if([2, 4, 5].indexOf(dn) < 0) return 'enklaste formens nämnare ' + dn;
    if(k < 2 || k > 15) return 'k ' + k + ' utanför 2–15';
    if(y > 75) return 'nämnaren ' + y + ' över 75';
    if([20, 25, 50, 100].indexOf(y) >= 0) return 'nämnaren ' + y + ' hör till A1/A2';
    if(x >= y) return 'oäkta bråk';
    return null;
  }
  return 'okänt löv';
}
function facitA(lov, rad){
  if(rad.typ !== 'flerled' || rad.vansterText !== 'Andelen') return 'raden är inte Andelens svarsrad';
  const fo = rad.led.map(l => l.form).join();
  if(fo !== 'exakt,brak,decimal,procent') return 'formerna ' + fo;
  const e = brak(rad.led[0].svar), m = brak(rad.led[1].svar); if(!e || !m) return 'bråken ' + rad.led[0].svar + ', ' + rad.led[1].svar;
  const v = e[0] / e[1];
  if(rad.etikett !== e[0] + ' av ' + e[1] + '?') return 'frågan "' + rad.etikett + '"';
  if(!lika(m[0] / m[1], v)) return 'mellanledet ' + rad.led[1].svar + ' har fel värde';
  if(lov !== 'A3' && m[1] !== 100) return 'mellanledet ' + rad.led[1].svar + ' står inte i hundradelar';
  if(lov === 'A3' && sgd(m[0], m[1]) !== 1) return 'mellanledet ' + rad.led[1].svar + ' är inte enklaste form';
  if(!rad.led[2].valfri) return 'decimalformen är inte valfri';
  if(!lika(rad.led[2].svar, v)) return 'decimalformen ' + rad.led[2].svar;
  if(!lika(rad.led[3].svar, 100 * v)) return 'procenten ' + rad.led[3].svar;
  return null;
}
const FACIT_A = klartextFacitA();
if(SABBA === 'bank') FACIT_A.A1[0].kedjor[0][3] = '96';     // klartexten säger annat än banken — BANKEN ska fälla
if(SABBA === 'regel') MET.REGEL.A1_TAL[20].push(5);         // 5/20 går att förkorta — TALREGEL ska fälla
(MET.ORDNING_A || []).forEach(lov => {
  if(BARA && lov !== BARA) return;
  const bank = MET.bank(lov);
  bank.uppg.forEach((u, i) => {
    const doc = FACIT_A[lov] && FACIT_A[lov][i];
    if(!doc){ brot('BANKEN', lov, i + 1, 'klartexten saknar facit'); return; }
    const rader = u.rader.filter(r => r.typ === 'flerled'), val = u.rader.filter(r => r.typ === 'valruta');
    if(rader.length !== doc.kedjor.length) brot('BANKEN', lov, i + 1, rader.length + ' svarsrader, klartexten ' + doc.kedjor.length);
    rader.forEach((r, j) => {
      const k = doc.kedjor[j]; if(!k) return;
      const egen = [r.led[0].svar, r.led[1].svar, decT(r.led[2].svar), String(r.led[3].svar)];
      if(egen[0] !== k[0] || egen[1] !== k[1] || egen[3] !== k[3] || (k[2] && egen[2] !== k[2]))
        brot('BANKEN', lov, i + 1, '"' + egen.join(' = ') + '" ≠ klartextens "' + k.filter(Boolean).join(' = ') + '"');
    });
    if((val.length ? 1 : 0) !== (doc.svar ? 1 : 0)) brot('BANKEN', lov, i + 1, 'valrutan ' + val.length + ', klartextens svar ' + doc.svar);
    val.forEach(r => { if(String(r.ratt[0])[0] !== doc.svar) brot('BANKEN', lov, i + 1, 'rätt alternativ "' + r.ratt[0] + '" ≠ klartextens ' + doc.svar); });
  });
  if(!bank.mallar){ console.log('  · ' + lov + ' — bara författade uppgifter (' + bank.uppg.length + '), banken prövad'); return; }
  const k = NT.medTalregel(MET.drillKalla(lov));
  const n = k.instanser.length, nycklar = new Set(bank.mallar.map(m => m.nyckel)), senaste = [];
  let ok = 0;
  for(let i = n; i < n + N; i++){
    const x = k.nasta(i);
    if(!x){ brot('SLUT', lov, i, 'nasta gav inget blad'); continue; }
    const rad = JSON.parse(JSON.stringify(x.blad.grupper[0].rader[0]));
    if(SABBA === 'facit' && i % 9 === 0) rad.led[2].svar += 0.01;
    const e = brak(rad.led[0].svar) || [0, 1], nyck = rad.led[0].svar;
    let lyckat = true; const b = (ben, t) => { lyckat = false; brot(ben, lov, i, t + '  [' + nyck + ' = ' + rad.led[1].svar + ' = ' + rad.led[3].svar + ' %]'); };
    const r = regelA(lov, e[0], e[1]); if(r) b('TALREGEL', r);
    const f = facitA(lov, rad); if(f) b('FACIT', f);
    if(x.blad.grupper[0].logg !== 'proc-andelen:rakna' || x.blad.grupper[0].loggStore !== 'k4') b('FACIT', 'loggar inte till lövet Andelen i k4');
    if(nycklar.has(nyck)) b('NY', 'uppgiften är bankens');
    if(senaste.indexOf(nyck) >= 0) b('NY', 'upprepning inom tio');
    senaste.push(nyck); if(senaste.length > 10) senaste.shift();
    if(lyckat) ok++;
  }
  const St = k.statistik;
  St.val.forEach((v2, j) => {
    if(!v2) brot('MALL', lov, j + 1, 'mallen "' + bank.mallar[j].nyckel + '" valdes aldrig');
    RAPPORT.push(lov + ' mall ' + String(j + 1).padStart(2) + ' ' + String(bank.mallar[j].nyckel).padEnd(9) + '      '
      + ' vald ' + String(v2).padStart(4) + ', tomma ' + St.tomma[j]);
  });
  console.log((ok === N ? '✓ ' : '✗ ') + lov + ' — ' + ok + '/' + N + ' nya uppgifter håller (bank ' + n + ', ' + bank.mallar.length + ' mallar)');
});
/* ═══ GRENEN DELEN (D1–D7, doc/innehall/k4-d1-procent-moment3-metodtraning.md; 2026-11-27) ═══════════════════════
   Raden är Delens stegrad (hela, procent, steg: 100 % = H | s % = H/d = v | p % = f · v = svar) eller bråkrad (D3).
     TALREGEL  D1 H = 200–1200 (hundratal, inte 1000), k = H/100; p 2–9 (k 2–12 utom 10) eller p 11–19 (k 2–5);
                  p aldrig 1, 10, 20, 25 eller 50; steget 1 %
               D2 p 20, 30, 40, 60, 70, 80 eller 90; H delbart med 10, t = H/10; t jämnt tiotal 20–120, eller t 3–25
                  (inte 10) och p högst 60; steget 10 %
               D3 p 25, 75, 20 eller 50 med bråket 1/4, 3/4, 1/5, 1/2; x delbart med nämnaren, q = x/nämnaren;
                  25 %, 75 %: q 10–300; 20 %: q 5–240; 50 %: x högst 1 200; q högst 50 eller ett jämnt tiotal
     FACIT     frågan "p % av H kr?" (tusental med mellanslag), enheten kr; stegraden: steget i listan, s · d = 100,
               H/d, p/s och svaret heltal; bråkraden: bråket = p/100 förkortat, (täljaren · x)/nämnaren heltal; loggar
               till lövet Delen i k4
     NY, MALL  som A- och B-löven
     BANKEN    (D1–D7) varje stegrad = klartextens kedja (H, steget, procenttalet och talen i kedjan), varje bråkrad =
               klartextens bråkkedja, varje valruta = klartextens svar (tecken eller bokstäver, flera vid ringa in). */
const STEG_OK = [1, 2, 4, 5, 10, 20, 25, 50];
const tusenD = n => n >= 1000 ? String(n).replace(/\B(?=(\d{3})+$)/g, ' ') : String(n);
function klartextFacitD(){
  const t = fs.readFileSync(path.join(ROOT, 'doc/innehall/k4-d1-procent-moment3-metodtraning.md'), 'utf8'), ut = {};
  t.split(/^## /m).slice(1).forEach(del => {
    const id = del.slice(0, 2), f = del.split('**Facit**')[1]; if(!f) return;
    ut[id] = f.split(/^\d+\. /m).slice(1).map(blk => {
      const ren = blk.replace(/\(även [^)]*\)/g, ''), kedjor = [];
      const reS = /100 % = (\d+) [^|]*\| (\d+) % = (\d+)\/(\d+) = (\d+) [^|]*\| (\d+) % = (\d+) · (\d+) = (\d+)/g;
      const reB = /(\d+) % = (\d+\/\d+), \((\d+) · (\d+)\)\/(\d+) = (\d+) · (\d+) = (\d+)/g;
      let x;
      while((x = reS.exec(ren))) kedjor.push({ typ: 'stegrad', H: +x[1], s: +x[2], d: +x[4], v: +x[5], p: +x[6], f: +x[7], svar: +x[9] });
      while((x = reB.exec(ren))) kedjor.push({ typ: 'brakrad', p: +x[1], brak: x[2], x: +x[4], svar: +x[8] });
      const svar = (ren.replace(/\([^)]*\)/g, '').match(/[<=>]|\b[A-D]\b/g) || []);
      return { kedjor: kedjor, svar: svar };
    });
  });
  return ut;
}
function regelD(lov, r){
  const p = r.procent, H = r.hela;
  if(lov === 'D1'){
    if([200, 300, 400, 500, 600, 700, 800, 900, 1100, 1200].indexOf(H) < 0) return 'H ' + H;
    const k = H / 100;
    if(!((p >= 2 && p <= 9) || (p >= 11 && p <= 19 && k <= 5))) return 'p ' + p + ' vid k ' + k;
    if([1, 10, 20, 25, 50].indexOf(p) >= 0) return 'p ' + p;
    if(r.steg !== 1) return 'steget ' + r.steg;
    return null;
  }
  if(lov === 'D2'){
    if([20, 30, 40, 60, 70, 80, 90].indexOf(p) < 0) return 'p ' + p;
    if(H % 10) return 'H ' + H + ' inte delbart med 10';
    const t = H / 10, tiotal = t % 10 === 0 && t >= 20 && t <= 120;
    if(!tiotal && !(t >= 3 && t <= 25 && t !== 10 && p <= 60)) return '10 % = ' + t + ' med p ' + p;
    if(r.steg !== 10) return 'steget ' + r.steg;
    return null;
  }
  if(lov === 'D3'){
    const B = { 25: '1/4', 75: '3/4', 20: '1/5', 50: '1/2' }[p]; if(!B) return 'p ' + p;
    if(r.brak !== B) return 'bråket ' + r.brak;
    const n = +B.split('/')[1]; if(H % n) return 'x ' + H + ' inte delbart med ' + n;
    const q = H / n;
    if((p === 25 || p === 75) && (q < 10 || q > 300)) return 'x/4 = ' + q;
    if(p === 20 && (q < 5 || q > 240)) return 'x/5 = ' + q;
    if(p === 50 && H > 1200) return 'x ' + H + ' över 1 200';
    if(q > 50 && q % 10) return 'x/nämnaren = ' + q + ' (högst 50 eller ett jämnt tiotal)';
    return null;
  }
  return 'okänt löv';
}
function facitD(rad){
  const H = rad.hela, p = rad.procent;
  if(rad.fraga !== p + ' % av ' + tusenD(H) + ' kr?') return 'frågan "' + rad.fraga + '"';
  if(rad.enhet !== 'kr') return 'enheten ' + rad.enhet;
  if(rad.typ === 'stegrad'){
    const s = rad.steg; if(STEG_OK.indexOf(s) < 0) return 'steget ' + s + ' inte i listan';
    const d = 100 / s, v = H / d, f = p / s;
    if(v !== Math.round(v) || f !== Math.round(f) || (H * p / 100) !== Math.round(H * p / 100)) return 'leden går inte jämnt (' + H + ', ' + s + ' %, ' + p + ' %)';
    return null;
  }
  if(rad.typ === 'brakrad'){
    const b = brak(rad.brak); if(!b || sgd(b[0], b[1]) !== 1 || !lika(b[0] / b[1], p / 100)) return 'bråket ' + rad.brak;
    if((b[0] * H) % b[1]) return '(' + b[0] + ' · ' + H + ')/' + b[1] + ' går inte jämnt';
    return null;
  }
  return 'radtypen ' + rad.typ;
}
const FACIT_D = klartextFacitD();
if(SABBA === 'bank') FACIT_D.D1[0].kedjor[0].svar = 29;      // klartexten säger annat än banken — BANKEN ska fälla
if(SABBA === 'regel') MET.REGEL.D2_P.push(50);              // 50 % hör till D3 — TALREGEL ska fälla
(MET.ORDNING_D || []).forEach(lov => {
  if(BARA && lov !== BARA) return;
  const bank = MET.bank(lov);
  bank.uppg.forEach((u, i) => {
    const doc = FACIT_D[lov] && FACIT_D[lov][i];
    if(!doc){ brot('BANKEN', lov, i + 1, 'klartexten saknar facit'); return; }
    const rader = u.rader.filter(r => r.typ === 'stegrad' || r.typ === 'brakrad'), val = u.rader.filter(r => r.typ === 'valruta');
    if(rader.length !== doc.kedjor.length) brot('BANKEN', lov, i + 1, rader.length + ' rader, klartexten ' + doc.kedjor.length);
    rader.forEach((r, j) => {
      const k = doc.kedjor[j]; if(!k) return;
      if(r.typ !== k.typ){ brot('BANKEN', lov, i + 1, 'radtypen ' + r.typ + ' ≠ ' + k.typ); return; }
      if(r.typ === 'stegrad'){
        const egen = { H: r.hela, s: r.steg, d: 100 / r.steg, v: r.hela * r.steg / 100, p: r.procent, f: r.procent / r.steg, svar: r.hela * r.procent / 100 };
        const olika = Object.keys(egen).filter(n => egen[n] !== k[n]);
        if(olika.length) brot('BANKEN', lov, i + 1, 'stegraden ' + olika.map(n => n + ' ' + egen[n] + ' ≠ ' + k[n]).join(', '));
      } else {
        const b = brak(r.brak), sv = b[0] * r.hela / b[1];
        if(r.procent !== k.p || r.brak !== k.brak || r.hela !== k.x || sv !== k.svar) brot('BANKEN', lov, i + 1, 'bråkraden ' + r.procent + ' % = ' + r.brak + ' av ' + r.hela + ' ≠ klartexten');
      }
    });
    const ratt = [].concat.apply([], val.map(r => r.ratt.map(x => String(x)[0])));
    if(val.length && ratt.join() !== doc.svar.join()) brot('BANKEN', lov, i + 1, 'valrutans svar ' + ratt.join(',') + ' ≠ klartextens ' + doc.svar.join(','));
  });
  if(!bank.mallar){ console.log('  · ' + lov + ' — bara författade uppgifter (' + bank.uppg.length + '), banken prövad'); return; }
  const k = NT.medTalregel(MET.drillKalla(lov));
  const n = k.instanser.length, nycklar = new Set(bank.mallar.map(m => m.nyckel)), senaste = [];
  let ok = 0;
  for(let i = n; i < n + N; i++){
    const x = k.nasta(i);
    if(!x){ brot('SLUT', lov, i, 'nasta gav inget blad'); continue; }
    const gr = x.blad.grupper[0], rad = JSON.parse(JSON.stringify(gr.rader[0]));
    if(SABBA === 'facit' && i % 9 === 0){ if(rad.typ === 'stegrad') rad.steg = 3; else rad.brak = '2/8'; }
    const nyck = rad.procent + ' % av ' + rad.hela;
    let lyckat = true; const b = (ben, t) => { lyckat = false; brot(ben, lov, i, t + '  [' + rad.fraga + ']'); };
    const r = regelD(lov, rad); if(r) b('TALREGEL', r);
    const f = facitD(rad); if(f) b('FACIT', f);
    if(gr.logg !== 'proc-delen:rakna' || gr.loggStore !== 'k4') b('FACIT', 'loggar inte till lövet Delen i k4');
    if(nycklar.has(nyck)) b('NY', 'uppgiften är bankens');
    if(senaste.indexOf(nyck) >= 0) b('NY', 'upprepning inom tio');
    senaste.push(nyck); if(senaste.length > 10) senaste.shift();
    if(lyckat) ok++;
  }
  const St = k.statistik;
  St.val.forEach((v2, j) => {
    if(!v2) brot('MALL', lov, j + 1, 'mallen "' + bank.mallar[j].nyckel + '" valdes aldrig');
    RAPPORT.push(lov + ' mall ' + String(j + 1).padStart(2) + ' ' + String(bank.mallar[j].nyckel).padEnd(14) + ' vald ' + String(v2).padStart(4) + ', tomma ' + St.tomma[j]);
  });
  console.log((ok === N ? '✓ ' : '✗ ') + lov + ' — ' + ok + '/' + N + ' nya uppgifter håller (bank ' + n + ', ' + bank.mallar.length + ' mallar)');
});
if(args.includes('--mallar')){ console.log('\n  MALLARNA (valda, tomma val = mallen gav inget nytt och nästa mall togs):'); RAPPORT.forEach(t => console.log('      ' + t)); }
Object.keys(brott).forEach(ben => { console.log('\n  ✗ ' + ben + ' (' + brott[ben].length + ')'); brott[ben].slice(0, 4).forEach(t => console.log('      ' + t)); });
console.log('\n' + (fel ? '✗ SPEC-FUZZ PROCENT RÖD (' + fel + ')' : '✓ SPEC-FUZZ PROCENT GRÖN'));
process.exit(fel ? 1 : 0);
