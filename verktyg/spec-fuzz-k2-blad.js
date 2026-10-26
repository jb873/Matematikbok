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
         Tecken och flerval: det givna bråket likadant, det andra ett sådant bråk eller en förlängning av
         ett; flervalet har exakt ett likvärdigt alternativ (det givna bråket förlängt).
     (2) ≥30 000 RADER ur bladets generatorer: mellanledsraderna, luckan (ett steg), mgn-paren, tecken
         och flerval mot samma villkor, räknat oberoende ur radens tal; varje förläng- och förkortgrupp
         bär mellanled: 'kravt' i datan.
   --sabba d3   lägger [16,40] i poolen "Förläng med 3" → (1) och (2) ska fälla.
   --sabba d3t  lägger 2/2 mot 4/4 i tecken och 1/2 i flervalet → (1) och (2) ska fälla.

   d5 'k2d5:forlang' (förläng en/båda nämnarna) och 'k2:addsub' (gemensam nämnare ≤ 42 i addition och
   subtraktion, alla flikar; rader i decimalform räknas upp men mäts inte). d6 'k2d6:korsvis' (två och tre
   bråk). Drillarnas talval (förkorta, förlänga, likformiga, addition/subtraktion) och ramens testgeneratorer
   (faktorled, andelens rutnät, decimaltal som bråk med frivilligt led, gemensam nämnare i add/sub), de
   senare i sidan via cdp-kor.
   --sabba d5 | addsub | d6 | d6t | drill | drill42 | test | test42   fäller var sitt ben.

   KÖR:  node verktyg/spec-fuzz-k2-blad.js [--sabba <ben>]     Noll nätväg, ingen fil ändras. */
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
  if(process.argv.includes('--sabba') && process.argv.includes('d3t')){
    vm.runInContext('FORL_TECKEN.push([2,2,4,4]); FORL_MC.push({mal:[1,2], alternativ:[[1,3],[2,4],[3,5],[1,4],[3,4]], ratt:1})', S3);
    console.log('\n  [SABBA d3t: 2/2 mot 4/4 i tecken, 1/2 i flervalet]');
  }
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
               FORK_MED2: ['fk', 1, 'Förkorta med 2'], FORK_MED5: ['fk', 1, 'Förkorta med 5'], FORK_ENK1: ['fk', 1, 'Förkorta till enklaste form'],
               FORK_LANG: ['fk', 2, 'Förkorta så långt som möjligt'], FORK_BLAND: ['fk', 2, 'Förkorta till blandad form'],
               FORL_TECKEN: ['tecken', 0, 'Vilket tecken ska stå mellan bråken?'], FORL_MC: ['mc', 0, 'Vilket bråk är likvärdigt?'] };
  // tecken och flerval (Joachim 2026-10-25): det givna bråket i enklaste form med nämnare 3–10; det andra
  // bråket är ett sådant eller en förlängning av ett. Flervalet har exakt ett likvärdigt alternativ, och det
  // är det givna bråket förlängt med en heltalsfaktor.
  const tecken = (a, b, var_) => {
    forlang(a[0], a[1], undefined, var_);
    const g = gcd(b[0], b[1]); forlang(b[0] / g, b[1] / g, undefined, var_ + ' (andra bråket förkortat)');
  };
  const mc = (o, var_) => {
    forlang(o.mal[0], o.mal[1], undefined, var_);
    const lika = o.alternativ.map(function(x, i){ return x[0] * o.mal[1] === o.mal[0] * x[1] ? i : -1; }).filter(function(i){ return i >= 0; });
    if(lika.length !== 1 || lika[0] !== o.ratt) fel(var_ + ': ' + o.mal.join('/') + ' har likvärdiga alternativ ' + JSON.stringify(lika) + ', rätt = ' + o.ratt);
    else { const r = o.alternativ[o.ratt]; if(r[1] % o.mal[1] || r[1] === o.mal[1]) fel(var_ + ': ' + r.join('/') + ' är inte ' + o.mal.join('/') + ' förlängt'); }
  };
  console.log('\nSPEC-FUZZ k2-BLAD — d3 "Förlänga och förkorta": enklaste form, nämnare ' + FL.tak.minNamnare + '–' + FL.tak.maxNamnare + ', en faktor\n');
  Object.keys(P3).forEach(function(p){
    const [slag, x, namn] = P3[p], pool = vm.runInContext(p, S3), fore = brott;
    pool.forEach(function(u){
      const v = 'POOL ' + namn;
      if(slag === 'forlang') forlang(u[0], u[1], x, v);
      else if(slag === 'till'){ forlang(u[0], u[1], u[2] / u[1], v); }
      else if(slag === 'till60') forlang(u[0], u[1], 60 / u[1], v);
      else if(slag === 'mgn'){ forlang(u[0], u[1], undefined, v); forlang(u[2], u[3], undefined, v); }
      else if(slag === 'tecken') tecken([u[0], u[1]], [u[2], u[3]], v);
      else if(slag === 'mc') mc(u, v);
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
          else if(r.typ === 'tecken') tecken(r.a, r.b, v);
          else if(r.typ === 'mc') mc(r, v);
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

const SABBA = v => process.argv.includes('--sabba') && process.argv.includes(v);
const inom = (B, n) => n >= B.tak.minNamnare && n <= B.tak.maxNamnare;
const sandlada = fil => { const C = Object.assign({}, S); C.window = C; vm.createContext(C); vm.runInContext(fs.readFileSync(path.join(ROOT, fil), 'utf8'), C, { filename: path.basename(fil) }); return C; };

// ── d5 "Förläng en nämnare" och "Förläng båda nämnarna" ─────────────────────────────────────────
const F5 = SPEC.BLAD['k2d5:forlang'];
if(!F5) fel('spec-villkor-k2.js saknar BLAD[k2d5:forlang]');
else {
  const S5 = sandlada('js/motor/blad/blad-k2-d5.js');
  if(SABBA('d5')){ vm.runInContext('FORLANG_EN.push([2,4])', S5); console.log('\n  [SABBA d5: [2,4] i poolen "Förläng en nämnare"]'); }
  console.log('\nSPEC-FUZZ k2-BLAD — d5 "Förläng en/båda nämnarna": varje bråk i enklaste form, nämnare ' + F5.tak.minNamnare + '–' + F5.tak.maxNamnare + ', en faktor per bråk, mellanled i datan\n');
  [['FORLANG_EN', 'Förläng en nämnare', true], ['PAR_FB', 'Förläng båda nämnarna, nivå 1', false], ['PAR_FB_S', 'Förläng båda nämnarna, nivå 2', false]].forEach(function([p, namn, delar]){
    const pool = vm.runInContext(p, S5), fore = brott;
    pool.forEach(function(par){
      par.forEach(function(n){ if(!inom(F5, n)) fel('POOL ' + namn + ': nämnaren ' + n + ' utanför ' + F5.tak.minNamnare + '–' + F5.tak.maxNamnare); });
      if(delar && (par[1] % par[0] || par[0] === par[1])) fel('POOL ' + namn + ': ' + par.join(' och ') + ' — den ena nämnaren delar inte den andra');
    });
    console.log('  ' + (brott === fore ? '✓' : '✗') + ' ' + namn.padEnd(40) + ' ' + String(pool.length).padStart(3) + ' nämnarpar');
  });
  const GEN5 = ['GRUND_FORLANG1', 'GEN_FORLANG1', 'GRUND_FORLANG2_N1', 'GEN_FORLANG2_N1', 'GRUND_FORLANG2_N2', 'GEN_FORLANG2_N2'];
  let rader5 = 0, steg5 = 0, varv5 = 0;
  while(rader5 < 30000 && varv5++ < 20000){
    GEN5.forEach(function(namn){
      const blad = vm.runInContext(namn + '()', S5);
      blad.grupper.forEach(function(g){
        const v = namn + ' · ' + g.rubrik, medSteg = g.rader.filter(function(r){ return r.steg; });
        if(medSteg.length && g.mellanled !== 'kravt') fel(v + ': gruppen förlänger men kräver inte mellanledet i datan');
        if(g.mellanled === 'kravt' && medSteg.length !== g.rader.length) fel(v + ': en rad i gruppen saknar förlängningsledet');
        g.rader.forEach(function(r){
          rader5++;
          if(!r.steg) return;
          steg5++;
          const L = r.steg.termer.reduce(function(a, x){ return lcm(a, x.n); }, 1);
          if(L !== r.steg.L) fel(v + ': radens L ' + r.steg.L + ' ≠ omräknad ' + L);
          r.steg.termer.forEach(function(x){
            if(gcd(x.t, x.n) !== 1) fel(v + ': ' + x.t + '/' + x.n + ' är inte i enklaste form');
            if(!inom(F5, x.n)) fel(v + ': ' + x.t + '/' + x.n + ' har nämnaren ' + x.n + ' utanför ' + F5.tak.minNamnare + '–' + F5.tak.maxNamnare);
            if(x.f !== L / x.n || x.nt !== x.t * x.f) fel(v + ': ' + x.t + '/' + x.n + ' förlängs inte med EN faktor till ' + L);
          });
        });
      });
    });
  }
  console.log('\n  ' + rader5 + ' rader ur ' + GEN5.join(', ') + ' (' + steg5 + ' med förlängningsled)');

  // Addition och subtraktion i d5 (alla flikar): gemensam nämnare högst 42 (k2:addsub). Radens nämnare ur
  // datan (steg, opnd eller namnare); rader som räknas i decimalform mäts inte och räknas upp för sig.
  const AS = SPEC.BLAD['k2:addsub'];
  if(SABBA('addsub')){ vm.runInContext('PAR_FB_S.push([9,10])', S5); console.log('\n  [SABBA addsub: [9,10] (90) i "Förläng båda nämnarna", nivå 2]'); }
  const GEN5B = GEN5.concat(['GRUND_BLANDAD_N1', 'GEN_BLANDAD_N1', 'GRUND_BLANDAD_N2', 'GEN_BLANDAD_N2']);
  let raderAS = 0, decimal = 0, storstAS = 0, varvAS = 0; const fAS = brott;
  while(raderAS < 30000 && varvAS++ < 20000){
    GEN5B.forEach(function(namn){
      vm.runInContext(namn + '()', S5).grupper.forEach(function(g){
        g.rader.forEach(function(r){
          if(r.typ === 'brakDecimal'){ decimal++; return; }
          const ns = r.steg ? r.steg.termer.map(function(x){ return x.n; }) : r.opnd ? [r.opnd.n1, r.opnd.n2] : r.namnare;
          if(!ns) return;
          raderAS++;
          const m = ns.reduce(lcm, 1); storstAS = Math.max(storstAS, m);
          if(m > AS.tak.maxGemNamnare) fel(namn + ' · ' + g.rubrik + ': nämnarna ' + ns.join(', ') + ' har gemensam nämnare ' + m + ' > ' + AS.tak.maxGemNamnare);
        });
      });
    });
  }
  console.log('  ' + (brott === fAS ? '✓' : '✗') + ' addition och subtraktion: ' + raderAS + ' rader ur alla flikar, största gemensamma nämnare ' + storstAS + ' (≤ ' + AS.tak.maxGemNamnare + ') · ' + decimal + ' rader i decimalform mäts inte');
}

// ── d6 "Förkorta korsvis" ─────────────────────────────────────────────────────────────────────────
const K6 = SPEC.BLAD['k2d6:korsvis'];
if(!K6) fel('spec-villkor-k2.js saknar BLAD[k2d6:korsvis]');
else {
  const S6 = sandlada('js/motor/blad/blad-k2-d6.js');
  if(SABBA('d6')){ vm.runInContext('gStoraRad = function(){ return radKors(26,45,9,13); }', S6); console.log('\n  [SABBA d6: 26/45 · 9/13 (faktorerna 13 och 9) i generatorn]'); }
  if(SABBA('d6t')){ vm.runInContext('gStoraTreRad = function(){ return radKorsTre(3,8,4,5,1,6); }', S6); console.log('\n  [SABBA d6t: 3/8 · 4/5 · 1/6 (= 1/20) i tre-bråksgeneratorn]'); }
  console.log('\nSPEC-FUZZ k2-BLAD — d6 "Förkorta korsvis": båda bråken i enklaste form, faktorer ur nivån, svaret i enklaste form med nämnare ' + K6.tak.minNamnare + '–' + K6.tak.maxNamnare + '\n');
  const GEN6 = ['GRUND_STORATAL_N1', 'GEN_STORATAL_N1', 'GRUND_STORATAL_N2', 'GEN_STORATAL_N2'];
  let rader6 = 0, varv6 = 0;
  while(rader6 < 30000 && varv6++ < 20000){
    GEN6.forEach(function(namn){
      const blad = vm.runInContext(namn + '()', S6);
      blad.grupper.forEach(function(g){
        const v = namn + ' · ' + g.rubrik;
        const kors = /korsvis|ta bort ett mellanled/.test(g.rubrik);
        if(kors && g.mellanled !== 'kravt') fel(v + ': gruppen förkortar korsvis men kräver inte mellanledet i datan');
        g.rader.forEach(function(r){
          if(!kors) return;
          rader6++;
          if(r.typ !== 'mulKors'){ fel(v + ': radtypen ' + r.typ + ' saknar förkortningsledet'); return; }
          if(r.br.length === 3){
            // tre bråk (blad 2): ledet med en faktor per tal, produkten uppe = produkten nere, enklaste form
            const u3 = r.br.map(function(f){ return f.join('/'); }).join(' · ');
            if(r.br.some(function(f){ return gcd(f[0], f[1]) !== 1; })) fel(v + ': ' + u3 + ' — ett bråk är inte i enklaste form');
            let fT = 1, fN = 1, kT = 1, kN = 1;
            r.br.forEach(function(f, i){
              if(f[0] % r.gT[i] || f[1] % r.gN[i]) fel(v + ': ' + u3 + ' — facitets faktor går inte jämnt upp');
              fT *= r.gT[i]; fN *= r.gN[i]; kT *= f[0] / r.gT[i]; kN *= f[1] / r.gN[i];
            });
            if(fT !== fN) fel(v + ': ' + u3 + ' — facitets faktorer uppe (' + fT + ') och nere (' + fN + ') är inte samma');
            if(gcd(kT, kN) !== 1) fel(v + ': ' + u3 + ' — ledet når inte enklaste form (' + kT + '/' + kN + ')');
            if(!inom(K6, kN)) fel(v + ': ' + u3 + ' = ' + kT + '/' + kN + ', nämnaren ' + kN + ' utanför ' + K6.tak.minNamnare + '–' + K6.tak.maxNamnare);
            if(r.gT.filter(function(x){ return x > 1; }).length < 2) fel(v + ': ' + u3 + ' — färre än två tal förkortas');
            return;
          }
          const u = r.t1 + '/' + r.n1 + ' · ' + r.t2 + '/' + r.n2;
          if(gcd(r.t1, r.n1) !== 1 || gcd(r.t2, r.n2) !== 1) fel(v + ': ' + u + ' — ett bråk är inte i enklaste form');
          const g1 = gcd(r.t1, r.n2), g2 = gcd(r.t2, r.n1), lista = K6.faktorer[g.niva || 1];
          if(g1 !== r.g1 || g2 !== r.g2) fel(v + ': ' + u + ' — radens faktorer ' + r.g1 + ', ' + r.g2 + ' ≠ omräknade ' + g1 + ', ' + g2);
          [g1, g2].forEach(function(f){ if(f > 1 && lista.indexOf(f) < 0) fel(v + ': ' + u + ' har faktorn ' + f + ', inte ur nivå ' + (g.niva || 1) + ':s ' + lista.join(', ')); });
          if(g1 === 1 && g2 === 1) fel(v + ': ' + u + ' förkortas inte alls');
          const T = (r.t1 / g1) * (r.t2 / g2), N = (r.n1 / g2) * (r.n2 / g1);
          if(gcd(T, N) !== 1) fel(v + ': ' + u + ' — ledet når inte enklaste form (' + T + '/' + N + ')');
          if(!inom(K6, N)) fel(v + ': ' + u + ' = ' + T + '/' + N + ', nämnaren ' + N + ' utanför ' + K6.tak.minNamnare + '–' + K6.tak.maxNamnare);
        });
      });
    });
  }
  console.log('  ' + rader6 + ' korsvisa rader ur ' + GEN6.join(', '));
}

// ── Drillarna (Öva mer): Förkorta, Förlänga och Likformiga bråk ──────────────────────────────────
{
  const SD = { Math: Math, console: S.console };
  SD.randPick = function(a){ return a[Math.floor(Math.random() * a.length)]; };
  SD.d3RandInt = function(lo, hi){ return lo + Math.floor(Math.random() * (hi - lo + 1)); };
  SD.window = SD; vm.createContext(SD);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/motor/ovamer/ovamer-k2.js'), 'utf8'), SD, { filename: 'ovamer-k2.js' });
  if(SABBA('drill')){ vm.runInContext('var _gfl = genForlangaTal; genForlangaTal = function(l){ var u = _gfl(l); u.bas = [1,2]; return u; }', SD); console.log('\n  [SABBA drill: 1/2 i "Förlänga bråk"]'); }
  const LF = require(path.join(ROOT, 'js/motor/ovamer/ovamer-k2-likvtid.js'));
  console.log('\nSPEC-FUZZ k2 — drillarna: bråket i enklaste form, nämnare ' + FL.tak.minNamnare + '–' + FL.tak.maxNamnare + ', en faktor (förkorta: ' + FK.faktorer[1].join(', ') + ' · sista nivån ' + FK.faktorer[2].join(', ') + ')\n');
  const fore = brott; let n = 0;
  [1, 2, 3].forEach(function(lv){
    for(let i = 0; i < 4000; i++){
      n += 3;
      const k = vm.runInContext('genForkortaTal(' + lv + ')', SD), lista = FK.faktorer[lv === 3 ? 2 : 1];
      if(gcd(k.bas[0], k.bas[1]) !== 1 || !inom(FK, k.bas[1])) fel('Förkorta bråk nivå ' + lv + ': ' + k.bas.join('/') + ' utanför bandet');
      if(lista.indexOf(k.f) < 0 || k.T !== k.bas[0] * k.f || k.N !== k.bas[1] * k.f) fel('Förkorta bråk nivå ' + lv + ': ' + k.T + '/' + k.N + ' med faktorn ' + k.f + ', inte ur ' + lista.join(', '));
      const l = vm.runInContext('genForlangaTal(' + lv + ')', SD);
      if(gcd(l.bas[0], l.bas[1]) !== 1 || !inom(FL, l.bas[1])) fel('Förlänga bråk nivå ' + lv + ': ' + l.bas.join('/') + ' utanför bandet');
      if(!(Number.isInteger(l.f) && l.f >= 2) || l.malN !== l.bas[1] * l.f) fel('Förlänga bråk nivå ' + lv + ': förlängs inte med EN heltalsfaktor (' + l.f + ')');
      const u = LF.genLikformig(lv);
      if(gcd(u.t, u.n) !== 1 || !inom(FL, u.n)) fel('Likformiga bråk nivå ' + lv + ': ' + u.t + '/' + u.n + ' utanför bandet');
      if(!(Number.isInteger(u.k) && u.k >= 2) || u.nn !== u.n * u.k || u.nt !== u.t * u.k) fel('Likformiga bråk nivå ' + lv + ': förlängs inte med EN faktor');
    }
  });
  console.log('  ' + (brott === fore ? '✓' : '✗') + ' ' + n + ' uppgifter ur genForkortaTal, genForlangaTal och genLikformig (nivå 1–3)');
  // Addition/subtraktion-drillen: gemensam nämnare högst 42 i varje par (k2:addsub).
  if(SABBA('drill42')){ vm.runInContext('RAKNA_POOL3.push([1,9,1,10])', SD); console.log('\n  [SABBA drill42: 1/9 + 1/10 (90) i addition/subtraktion-drillen]'); }
  const AS = SPEC.BLAD['k2:addsub'], fA = brott;
  if(!AS) fel('spec-villkor-k2.js saknar BLAD[k2:addsub]');
  else {
    const P2 = vm.runInContext('RAKNA_POOL2', SD), P3 = vm.runInContext('RAKNA_POOL3', SD), N1 = vm.runInContext('RAKNA_N1_NAMNARE', SD);
    P2.concat(P3).forEach(function(p){ const m = lcm(p[1], p[3]); if(m > AS.tak.maxGemNamnare) fel('Addition/subtraktion-drillen: ' + p[0] + '/' + p[1] + ' och ' + p[2] + '/' + p[3] + ' har gemensam nämnare ' + m + ' > ' + AS.tak.maxGemNamnare); });
    N1.forEach(function(n){ if(n > AS.tak.maxGemNamnare) fel('Addition/subtraktion-drillen nivå 1: nämnaren ' + n); });
    console.log('  ' + (brott === fA ? '✓' : '✗') + ' addition/subtraktion-drillen: ' + (P2.length + P3.length) + ' par och ' + N1.length + ' nämnare, gemensam nämnare ≤ ' + AS.tak.maxGemNamnare);
  }
  if(typeof SD.ledFaktor === 'function'){
    // Ledets rättning (delad av drillarna): rätt faktor, åt båda hållen, och genvägen.
    const P = [['forlang', '2·3', '9·3', 2, 9, 3], ['forlang', '3·2', '3·9', 2, 9, 3], ['forlang', '2·4', '9·3', 2, 9, null], ['forlang', '6', '27', 2, 9, null],
               ['forkort', '4/2', '14/2', 4, 14, 2], ['forkort', '4/1', '14/1', 4, 14, 1], ['forkort', '2', '7', 4, 14, null], ['forkort', '4/2', '14/7', 4, 14, null]];
    const f0 = brott;
    P.forEach(function(p){ const k = SD.ledFaktor(p[0], p[1], p[2], p[3], p[4]); if(k !== p[5]) fel('ledFaktor(' + p.slice(0, 5).join(', ') + ') = ' + k + ', väntat ' + p[5]); });
    console.log('  ' + (brott === f0 ? '✓' : '✗') + ' ledFaktor: rätt faktor, omvänd ordning, olika faktor uppe och nere, genvägen (' + P.length + ' prov)');
  }
}

// ── Testgeneratorerna (ak7-k2-ram.html) — i sidan, eftersom de bor i ramens boot ─────────────────
{
  const { spawnSync } = require('child_process'), os = require('os');
  const pre = path.join(os.tmpdir(), 'sfk2b-pre-' + process.pid + '.js'), probe = path.join(os.tmpdir(), 'sfk2b-probe-' + process.pid + '.js');
  fs.writeFileSync(pre, `(function(){
    window.__e = []; window.addEventListener('error', function(e){ window.__e.push(String(e.message)); });
    try { localStorage.clear(); } catch(e){}
    var riktig;
    Object.defineProperty(window, 'ProvbyggarMotor', { configurable: true,
      get: function(){ return riktig; },
      set: function(v){ riktig = v; if(v && v.montera && !v.__fangad){ var m = v.montera; v.montera = function(o){ window.__GEN = o && o.generators; return m.apply(this, arguments); }; v.__fangad = true; } } });
  })();`);
  fs.writeFileSync(probe, `new Promise(function(res){ setTimeout(function(){
    var G = window.__GEN || {}, ut = {};
    if(${SABBA('test')} && window.BLAD_K2_D3) window.BLAD_K2_D3.talBank = function(nod){ return /forlanga/.test(nod) ? [{ slag:'forlang', t:1, n:2, malN:4 }] : []; };
    if(${SABBA('test42')} && window.BLAD_K2_D5) window.BLAD_K2_D5.talBank = function(nod){ return /add/.test(nod) ? [{ slag:'brak', t1:1, n1:9, op:'+', t2:1, n2:10 }] : []; };
    ['brak-forlanga', 'brak-forkorta', 'brak-likformig', 'andel-brak', 'brak-add', 'brak-sub', 'brak-sub:blandad', 'losut-taljare', 'dec-brak'].forEach(function(k){
      var del = k.split(':'), gen = G[del[0]], fn = gen && gen.snabb && gen.snabb[0], opts = del[1] ? { variant: del[1] } : undefined, subs = [];
      for(var i = 0; fn && i < 700; i++){ var r = fn(new Set(), opts); if(r) r.subs.forEach(function(s){
        var f = s.figur ? { fyllda: (s.figur.match(/fill="#2f6ea0"/g) || []).length, alla: (s.figur.match(/<rect/g) || []).length } : null;
        subs.push({ type: s.type, prompt: s.prompt, led: s.led, slutTalj: s.slutTalj, slutNamn: s.slutNamn, svarform: s.svarform, talj: s.talj, namn: s.namn, figur: f, besked: !!s.forkortaBesked }); }); }
      ut[k] = subs;
    });
    res({ gen: ut, fel: window.__e });
  }, 1500); })`);
  const url = 'file:///' + path.join(ROOT, 'ak7-k2-ram.html').replace(/\\/g, '/') + '?view=test-config&del=k2d3';
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), url, probe, '--pre', pre, '--vanta-pa', 'laddad', '--timeout', '90000'], { encoding: 'utf8', timeout: 180000, maxBuffer: 1 << 28 });
  try { fs.unlinkSync(pre); fs.unlinkSync(probe); } catch(e){}
  let u = null; try { u = JSON.parse((r.stdout || '').trim().split('\n').filter(l => l.startsWith('{')).pop()); } catch(e){}
  if(SABBA('test')) console.log('\n  [SABBA test: bladets talbank ger 1/2 → 4 i "Förläng bråket"]');
  console.log('\nSPEC-FUZZ k2 — testgeneratorerna: faktorledet, bandet och andelens rutnät\n');
  if(!u){ fel('testgeneratorerna: inget svar från sidan ' + (r.stderr || '').slice(0, 200)); }
  else {
    if(u.fel && u.fel.length) fel('testgeneratorerna: JS-fel ' + u.fel.slice(0, 2).join(' | '));
    const forkLista = FK.faktorer[1].concat(FK.faktorer[2]);
    [['brak-forlanga', 'forlang'], ['brak-likformig', 'forlang'], ['brak-forkorta', 'forkort']].forEach(function([k, slag]){
      const subs = u.gen[k] || [], fore = brott;
      if(!subs.length) fel(k + ': inga deluppgifter');
      subs.forEach(function(s){
        const L = s.led && s.led[0], F = L && L.faktor, v = k + ' "' + String(s.prompt).slice(0, 50) + '"';
        if(s.type !== 'mellanled' || !F || s.led.length !== 1 || F.slag !== slag){ fel(v + ': inte ett faktorled (' + s.type + ')'); return; }
        if(slag === 'forlang'){
          if(gcd(F.t, F.n) !== 1 || !inom(FL, F.n)) fel(v + ': ' + F.t + '/' + F.n + ' utanför bandet');
          if(!(Number.isInteger(F.k) && F.k >= 2) || s.slutTalj !== F.t * F.k || s.slutNamn !== F.n * F.k || s.svarform !== 'exakt') fel(v + ': svaret är inte bråket förlängt med ' + F.k);
        } else {
          const g = gcd(F.t, F.n);
          if(F.k !== g) fel(v + ': faktorn ' + F.k + ' är inte största gemensamma delaren ' + g);
          if(!inom(FK, F.n / g) || forkLista.indexOf(g) < 0) fel(v + ': ' + F.t + '/' + F.n + ' = ' + (F.t / g) + '/' + (F.n / g) + ' utanför bandet (faktorn ' + g + ')');
          if(s.slutTalj !== F.t / g || s.slutNamn !== F.n / g || s.svarform !== 'enklaste') fel(v + ': svaret är inte enklaste formen');
        }
      });
      console.log('  ' + (brott === fore ? '✓' : '✗') + ' ' + k.padEnd(16) + ' ' + String(subs.length).padStart(5) + ' deluppgifter med faktorled');
    });
    const and = u.gen['andel-brak'] || [], fA = brott;
    if(!and.length) fel('andel-brak: inga deluppgifter');
    and.forEach(function(s){
      if(!s.figur || !s.figur.alla) { fel('andel-brak: ingen figur'); return; }
      if(s.figur.fyllda * s.namn !== s.talj * s.figur.alla) fel('andel-brak: figuren visar ' + s.figur.fyllda + '/' + s.figur.alla + ', facit ' + s.talj + '/' + s.namn);
      if(gcd(s.talj, s.namn) !== 1) fel('andel-brak: facit ' + s.talj + '/' + s.namn + ' inte i enklaste form');
      if(!s.besked) fel('andel-brak: saknar beskedet "förkorta svaret"');
      if(s.prompt !== 'Hur stor del av rutorna är färgad?') fel('andel-brak: frågan "' + s.prompt + '"');
    });
    console.log('  ' + (brott === fA ? '✓' : '✗') + ' andel-brak       ' + String(and.length).padStart(5) + ' deluppgifter: rutnätet ritat ur facits tal');
    // Decimaltal som bråk: ett FRIVILLIGT led (tiondels-/hundradelsbråket) med samma värde, svaret i enklaste form.
    const db = u.gen['dec-brak'] || [], fD = brott;
    if(!db.length) fel('dec-brak: inga deluppgifter');
    db.forEach(function(s){
      const L = s.led && s.led[0], m = String(L && L.facit || '').match(/^(\d+)\/(\d+)$/);
      if(s.type !== 'mellanled' || !L || !L.frivilligt || !m){ fel('dec-brak "' + s.prompt + '": inte ett frivilligt led'); return; }
      if(+m[1] * s.slutNamn !== +m[2] * s.slutTalj || gcd(s.slutTalj, s.slutNamn) !== 1 || s.svarform !== 'enklaste') fel('dec-brak "' + s.prompt + '": ledet och svaret stämmer inte');
    });
    console.log('  ' + (brott === fD ? '✓' : '✗') + ' dec-brak         ' + String(db.length).padStart(5) + ' deluppgifter med frivilligt led');
    // Addition och subtraktion: gemensam nämnare högst 42 (k2:addsub). Ledets facit är summan över den
    // gemensamma nämnaren (komb/L); luckan har samma nämnare i alla bråk (BRAK(▢)(n) + b/n).
    const AS = SPEC.BLAD['k2:addsub'];
    if(SABBA('test42')) console.log('\n  [SABBA test42: bladets talbank ger 1/9 + 1/10 (90) i "Addition med bråk"]');
    ['brak-add', 'brak-sub', 'brak-sub:blandad', 'losut-taljare'].forEach(function(k){
      const subs = u.gen[k] || [], fore = brott; let storst = 0;
      if(!subs.length) fel(k + ': inga deluppgifter');
      subs.forEach(function(s){
        let L = null;
        if(s.type === 'mellanled'){ const m = String(s.led && s.led[0] && s.led[0].facit || '').match(/\/(\d+)$/); L = m ? +m[1] : null; }
        else { const ns = (String(s.prompt).match(/\((\d+)\)|\/(\d+)/g) || []).map(function(x){ return +x.replace(/\D/g, ''); }); L = ns.reduce(lcm, 1); }
        if(!L){ fel(k + ' "' + s.prompt + '": hittar inte den gemensamma nämnaren'); return; }
        storst = Math.max(storst, L);
        if(L > AS.tak.maxGemNamnare) fel(k + ' "' + String(s.prompt).replace(/\s+/g, ' ').slice(0, 60) + '": gemensam nämnare ' + L + ' > ' + AS.tak.maxGemNamnare);
      });
      console.log('  ' + (brott === fore ? '✓' : '✗') + ' ' + k.padEnd(16) + ' ' + String(subs.length).padStart(5) + ' deluppgifter · största gemensamma nämnare ' + storst);
    });
  }
}

console.log('\n' +(brott ? '✗ SPEC-FUZZ k2-BLAD RÖD (' + brott + ')' : '✓ SPEC-FUZZ k2-BLAD GRÖN'));
process.exit(brott ? 1 : 0);
