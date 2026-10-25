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

   d3 "FÖRLÄNGA OCH FÖRKORTA" (nivå 1 och 2) — villkoren 'k2d3:forlanga' och 'k2d3:forkorta':
     (1) HELA POOLEN: varje förläng- och förkortpool — bråket i enklaste form med nämnare 3–10, och
         vid förkortning en faktor ur nivåns lista som är största gemensamma delaren.
     (2) ≥30 000 RADER ur bladets generatorer: mellanledsraderna, luckan (ett steg) och mgn-paren mot
         samma villkor, räknat oberoende ur radens tal; varje förläng- och förkortgrupp bär
         mellanled: 'kravt' i datan.
   --sabba d3   lägger [16,40] i poolen "Förläng med 3" → (1) och (2) ska fälla.

   KÖR:  node verktyg/spec-fuzz-k2-blad.js [--sabba d3]     Noll nätväg, ingen fil ändras. */
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

// ── d3 "Förlänga och förkorta" ──────────────────────────────────────────────────────────────────
const FL = SPEC.BLAD['k2d3:forlanga'], FK = SPEC.BLAD['k2d3:forkorta'];
if(!FL || !FK){ fel('spec-villkor-k2.js saknar BLAD[k2d3:forlanga] eller BLAD[k2d3:forkorta]'); }
else {
  const S3 = Object.assign({}, S); S3.window = S3;
  vm.createContext(S3);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/motor/blad/blad-k2-d3.js'), 'utf8'), S3, { filename: 'blad-k2-d3.js' });
  if(process.argv.includes('--sabba') && process.argv.includes('d3')){ vm.runInContext('FORL_MED3.push([16,40])', S3); console.log('\n  [SABBA d3: [16,40] i poolen "Förläng med 3"]'); }
  const inom = n => n >= FL.tak.minNamnare && n <= FL.tak.maxNamnare;
  // förläng: t/n är det givna bråket
  const forlang = (t, n, k, var_) => {
    if(gcd(t, n) !== 1) fel(var_ + ': ' + t + '/' + n + ' är inte i enklaste form');
    if(!inom(n)) fel(var_ + ': ' + t + '/' + n + ' har nämnaren ' + n + ' utanför ' + FL.tak.minNamnare + '–' + FL.tak.maxNamnare);
    if(k !== undefined && !(Number.isInteger(k) && k >= 2)) fel(var_ + ': ' + t + '/' + n + ' förlängs inte med EN heltalsfaktor (' + k + ')');
  };
  // förkorta: t/n är det förkortade bråkets tal före förkortning, f faktorn
  const forkort = (t, n, f, niva, var_) => {
    const g = gcd(t, n), N = n / g;
    if(f !== g) fel(var_ + ': ' + t + '/' + n + ' förkortas med ' + f + ', men största gemensamma delaren är ' + g + ' (ett led når inte enklaste form)');
    if(!inom(N)) fel(var_ + ': ' + t + '/' + n + ' = ' + (t / g) + '/' + N + ', nämnaren ' + N + ' utanför ' + FK.tak.minNamnare + '–' + FK.tak.maxNamnare);
    if(FK.faktorer[niva].indexOf(g) < 0) fel(var_ + ': ' + t + '/' + n + ' har faktorn ' + g + ', inte ur nivå ' + niva + ':s ' + FK.faktorer[niva].join(', '));
  };
  // (1) HELA POOLEN
  const P3 = { FORL_MED2: ['forlang', 2, 'Förläng med 2'], FORL_MED3: ['forlang', 3, 'Förläng med 3'], FORL_TILL: ['till', 0, 'Förläng till nämnaren som står'],
               FORL_TILL60: ['till60', 0, 'Förläng så att nämnaren blir 60'], FORL_LUCKA: ['till', 0, 'Vilket tal saknas?'], MGN_PAIRS: ['mgn', 0, 'Minsta gemensamma nämnare'],
               FORK_MED2: ['fk', 1, 'Förkorta med 2'], FORK_MED5: ['fk', 1, 'Förkorta med 5'], FORK_ENK1: ['fk', 1, 'Skriv i enklaste form'],
               FORK_LANG: ['fk', 2, 'Förkorta så långt som möjligt'], FORK_BLAND: ['fk', 2, 'Förkorta och skriv i blandad form'] };
  console.log('\nSPEC-FUZZ k2-BLAD — d3 "Förlänga och förkorta": enklaste form, nämnare ' + FL.tak.minNamnare + '–' + FL.tak.maxNamnare + ', en faktor\n');
  Object.keys(P3).forEach(function(p){
    const [slag, x, namn] = P3[p], pool = vm.runInContext(p, S3), fore = brott;
    pool.forEach(function(u){
      const v = 'POOL ' + namn;
      if(slag === 'forlang') forlang(u[0], u[1], x, v);
      else if(slag === 'till'){ forlang(u[0], u[1], u[2] / u[1], v); }
      else if(slag === 'till60') forlang(u[0], u[1], 60 / u[1], v);
      else if(slag === 'mgn'){ forlang(u[0], u[1], undefined, v); forlang(u[2], u[3], undefined, v); }
      else forkort(u[0], u[1], gcd(u[0], u[1]), x, v);
      if(slag === 'fk' && namn === 'Förkorta med 2' && gcd(u[0], u[1]) !== 2) fel(v + ': ' + u[0] + '/' + u[1] + ' förkortas inte med 2');
      if(slag === 'fk' && namn === 'Förkorta med 5' && gcd(u[0], u[1]) !== 5) fel(v + ': ' + u[0] + '/' + u[1] + ' förkortas inte med 5');
    });
    console.log('  ' + (brott === fore ? '✓' : '✗') + ' ' + namn.padEnd(40) + ' ' + String(pool.length).padStart(3) + ' uppgifter');
  });
  // (2) RADER ur generatorerna
  const GEN3 = [['GRUND_FORLANGA_N1', 1], ['GEN_FORLANGA_N1', 1], ['GRUND_FORLANGA_N2', 2], ['GEN_FORLANGA_N2', 2],
                ['GRUND_FORKORTA_N1', 1], ['GEN_FORKORTA_N1', 1], ['GRUND_FORKORTA_N2', 2], ['GEN_FORKORTA_N2', 2]];
  let rader3 = 0, mellan = 0;
  while(rader3 < 30000){
    GEN3.forEach(function([namn, niva]){
      const blad = vm.runInContext(namn + '()', S3);
      if(/nytt blad/.test(blad.titel)) fel(namn + ': titeln "' + blad.titel + '" bär "(nytt blad)"');
      blad.grupper.forEach(function(g){
        const v = namn + ' · ' + g.rubrik;
        const forlangGrupp = g.rader.some(function(r){ return r.typ === 'mellanled' || r.typ === 'mgn'; });
        if(forlangGrupp && g.mellanled !== 'kravt') fel(v + ': gruppen förlänger eller förkortar men kräver inte mellanledet i datan');
        g.rader.forEach(function(r){
          rader3++;
          if(r.typ === 'mellanled'){
            mellan++;
            if(r.slag === 'forlang') forlang(r.t, r.n, r.k, v);
            else forkort(r.t, r.n, r.k, niva, v);
          } else if(r.typ === 'mgn'){ forlang(r.a[0], r.a[1], undefined, v); forlang(r.b[0], r.b[1], undefined, v); }
          else if(r.typ === 'kedja'){
            if(r.led.length !== 2) fel(v + ': luckan har ' + r.led.length + ' led (en förlängning per uppgift)');
            const a = r.led[0], b = r.led[r.led.length - 1];
            forlang(a.t, a.n, b.n / a.n, v);
            if(b.t * a.n !== a.t * b.n) fel(v + ': ' + a.t + '/' + a.n + ' ≠ ' + b.t + '/' + b.n);
          }
        });
      });
    });
  }
  console.log('\n  ' + rader3 + ' rader ur ' + GEN3.map(function(x){ return x[0]; }).join(', ') + ' (' + mellan + ' mellanledsrader)');
}
console.log('\n' +(brott ? '✗ SPEC-FUZZ k2-BLAD RÖD (' + brott + ')' : '✓ SPEC-FUZZ k2-BLAD GRÖN'));
process.exit(brott ? 1 : 0);
