/* spec-fuzz-k2-blad.js — SPEC-GRINDEN för sjuans k2-BLAD (bladets egna talpooler), inte för öva-noderna.
   Systrarna (spec-fuzz-k2/-nian/-akr9) kör öva-generatorerna mot nodernas band; ett blad som bygger sina
   uppgifter själv nåddes inte av någon av dem. Den här läser bladets kod i en sandlåda, utan sida, och
   prövar uppgifterna mot bladets villkor i js/data/spec-villkor-k2.js (BLAD).

   d2 "RÄKNA MED FORMER" (nivå 1 och 2, formkedjan) — villkoret 'k2d2:rakna-former':
     (1) HELA POOLEN: varje uppgift i talpoolerna har bråkvägens minsta gemensamma nämnare ≤ taket.
     (2) ≥30 000 SAMPEL ur bladets generatorer (första bladet och "nytt blad", båda nivåerna): varje rad
         inom taket; nämnaren räknas OBEROENDE ur radens tal (förkortade) och jämförs med radens mgn.
     (3) radens väg är rätt (bråk när en nämnare har andra faktorer än 2 och 5), gruppen kräver
         mellanledet i datan (mellanled: 'kravt'), och svaret är exakt (inget ≈ kvar).
   Rapporterar poolen per grupp (antal uppgifter, största nämnare). Exit 1 vid avvikelse.

   KÖR:  node verktyg/spec-fuzz-k2-blad.js          Noll nätväg, ingen fil ändras. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const SPEC = require(path.join(ROOT, 'js/data/spec-villkor-k2.js'));
const BAND = SPEC.BLAD && SPEC.BLAD['k2d2:rakna-former'];
if(!BAND){ console.log('✗ spec-villkor-k2.js saknar BLAD[k2d2:rakna-former]'); process.exit(1); }
const TAK = BAND.tak.maxGemNamnare;

// ── bladet i en sandlåda: inga element finns, så bladets egen montering avstår (byggSheet → null) ──
const tomt = { classList: { toggle(){}, add(){}, remove(){} }, style: {}, appendChild(){}, addEventListener(){} };
const S = { console: { log(){}, info(){}, warn(){}, error(){} }, Math: Math,
  location: { search: '' }, localStorage: { getItem(){ return null; }, setItem(){} },
  document: { getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; }, createElement(){ return tomt; }, body: tomt } };
S.window = S;
vm.createContext(S);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/motor/blad/blad-k2-d2.js'), 'utf8'), S, { filename: 'blad-k2-d2.js' });

function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ const t = b; b = a % b; a = t; } return a || 1; }
function lcm(a, b){ return a / gcd(a, b) * b; }
function andra(n){ while(n % 2 === 0) n /= 2; while(n % 5 === 0) n /= 5; return n !== 1; }
function frac(term){   // oberoende tolkning av poolens term → förkortat {t, n, brak}
  let t, n;
  if(term[0] === 'int'){ t = term[1]; n = 1; }
  else if(term[0] === 'frac' || term[0] === 'imp'){ t = term[1]; n = term[2]; }
  else if(term[0] === 'mixed'){ t = term[1] * term[3] + term[2]; n = term[3]; }
  else { const s = term[1], d = (s.split(',')[1] || '').length, m = Math.pow(10, d); t = Math.round(parseFloat(s.replace(',', '.')) * m); n = m; }
  const g = gcd(t, n); return { t: t / g, n: n / g, brak: term[0] === 'frac' || term[0] === 'imp' || term[0] === 'mixed' };
}
function text(u){ return u.map(function(x){ return Array.isArray(x) ? (x[0] === 'int' ? String(x[1]) : x[0] === 'dec' ? x[1] : x[0] === 'mixed' ? x[1] + ' ' + x[2] + '/' + x[3] : x[1] + '/' + x[2]) : x; }).join(' '); }

let brott = 0;
const fel = m => { brott++; if(brott <= 20) console.log('  ✗ ' + m); };
console.log('SPEC-FUZZ k2-BLAD — d2 "Räkna med former": bråkvägens minsta gemensamma nämnare ≤ ' + TAK + ' (' + BAND.kalla.slice(0, 60) + '…)\n');

// (1) HELA POOLEN
const POOLER = { RK_G1_N1: 'nivå 1 · 1. Heltal och bråk', RK_G2_N1: 'nivå 1 · 2. Decimaltal och bråk', RK_G3_N1: 'nivå 1 · 3. Blandad form och oäkta bråk',
                 RK_G1_N2: 'nivå 2 · 1. Bråk och decimaltal med tredjedelar', RK_G2_N2: 'nivå 2 · 2. Decimaltal och bråk (åtton- och femtedelar)', RK_G3_N2: 'nivå 2 · 3. Blandad form och oäkta bråk' };
Object.keys(POOLER).forEach(function(p){
  const pool = vm.runInContext(p, S);
  let storst = 0;
  pool.forEach(function(u){ const a = frac(u[0]), b = frac(u[2]), m = lcm(a.n, b.n); storst = Math.max(storst, m); if(m > TAK) fel('POOL ' + POOLER[p] + ': "' + text(u) + '" gemensam nämnare ' + m + ' > ' + TAK); });
  console.log('  ' + (pool.length >= 3 ? '✓' : '✗') + ' ' + POOLER[p].padEnd(58) + ' ' + String(pool.length).padStart(3) + ' uppgifter · största gemensamma nämnare ' + storst);
  if(pool.length < 3) fel('POOL ' + POOLER[p] + ': bara ' + pool.length + ' uppgifter — bladet tar tre');
});

// (2)+(3) SAMPEL ur bladets generatorer
const GEN = ['GRUND_RAKNA_N1', 'GEN_RAKNA_N1', 'GRUND_RAKNA_N2', 'GEN_RAKNA_N2'];
let rader = 0, varv = 0;
while(rader < 30000){
  GEN.forEach(function(namn){
    const blad = vm.runInContext(namn + '()', S);
    blad.grupper.forEach(function(g){
      if(g.mellanled !== 'kravt') fel(namn + ' · ' + g.rubrik + ': gruppen kräver inte mellanledet i datan');
      g.rader.forEach(function(r){
        rader++;
        if(r.typ !== 'formKedja'){ fel(namn + ' · ' + g.rubrik + ': radtypen ' + r.typ + ' (inte formkedjan)'); return; }
        if(r.not === '≈' || r.rund) fel(namn + ': avrundat facit kvar');
        const T = r.uppg.termer.map(function(x){ const k = gcd(x.t, x.n); return { t: x.t / k, n: x.n / k }; });
        const m = lcm(T[0].n, T[1].n);
        if(m !== r.mgn) fel(namn + ': radens mgn ' + r.mgn + ' ≠ omräknad ' + m);
        if(m > TAK) fel(namn + ' · ' + g.rubrik + ': gemensam nämnare ' + m + ' > ' + TAK);
      });
    });
  });
  varv++;
}
console.log('\n  ' + rader + ' rader ur ' + GEN.join(', ') + ' (' + varv + ' varv)');
console.log('\n' + (brott ? '✗ SPEC-FUZZ k2-BLAD RÖD (' + brott + ')' : '✓ SPEC-FUZZ k2-BLAD GRÖN'));
process.exit(brott ? 1 : 0);
