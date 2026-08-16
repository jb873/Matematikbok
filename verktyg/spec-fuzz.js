/* spec-fuzz.js — SPEC-GRINDEN. Kör ramens TEST-generatorer headless och kontrollerar varje
   uppgift mot nodens spec-villkor (js/data/spec-villkor.js), härlett ur öva-dokumenten.
   ────────────────────────────────────────────────────────────────────────────────────────
   Vid sidan av facit-diffen: facit-fuzzen säger att generatorn RÄKNAR rätt; den här säger att
   den STÄLLER rätt sorts fråga (talområde, struktur, mellanled) — inom öva-bandet, aldrig över.

   Kör:  node verktyg/spec-fuzz.js            (alla noder i villkoren)
         node verktyg/spec-fuzz.js <nod>      (en nod)
   Exit 0 = 0 avvikelser bland enforce:true-profiler. Exit 1 = grinden brister.
   enforce:false-profiler rapporteras som (dokumenterad), räknas EJ mot exit-koden.

   Ingen ram-fil ändras: generatorerna extraheras och körs i en vm-sandbox. Noll nätväg. */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const N = 60; // prov per generator/profil (täckningskrav behöver spann)

// ── 1. Extrahera + kör ramens generatorer (samma gränser som gen-harness) ──────────────────
const ramLines = fs.readFileSync(path.join(ROOT, 'ak7-k1-ram.html'), 'utf8').split(/\r?\n/);
// Marker-baserad extraktion (tål radförskjutning när generatorer redigeras):
const findIdx = (re, from) => { for (let i = from || 0; i < ramLines.length; i++) if (re.test(ramLines[i])) return i; return -1; };
const hStart = findIdx(/^function isPrime\(n\)\{/);
const hEnd   = findIdx(/^function avr\(x,d\)\{/, hStart);            // sista hjälparen i blocket
const tgStart = findIdx(/^const TEST_GENERATORS = \{/);
const gnStart = findIdx(/^const GEN_NOD = \{/);
let tgEnd = gnStart; while (tgEnd > tgStart && !/^\};/.test(ramLines[tgEnd])) tgEnd--;  // ^}; närmast före GEN_NOD
const gnEnd = findIdx(/^\};/, gnStart);
if ([hStart, hEnd, tgStart, gnStart, gnEnd].some(x => x < 0)) { console.error('spec-fuzz: hittade inte extraktions-markörer i ramen'); process.exit(2); }
const slice = (a, b) => ramLines.slice(a, b + 1).join('\n');       // 0-indexerat, inklusivt
const HELPERS = slice(hStart, hEnd), TESTGEN = slice(tgStart, tgEnd), GENNOD = slice(gnStart, gnEnd);
const noop = () => {};
const elStub = () => ({ addEventListener: noop, appendChild: noop, setAttribute: noop, querySelector: () => null, querySelectorAll: () => [], style: {}, classList: { add: noop, remove: noop, toggle: noop }, innerHTML: '', textContent: '' });
const documentStub = { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createElement: elStub, body: elStub() };
const sandbox = { window: {}, document: documentStub, Math, String, Array, Object, Number, console, JSON, Set, Map, parseInt, parseFloat, isNaN, RegExp };
sandbox.window.document = documentStub;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/provbyggare/provbyggar-motor.js'), 'utf8'), sandbox);
sandbox.ProvbyggarMotor = sandbox.window.ProvbyggarMotor;
vm.runInContext(HELPERS + '\n' + TESTGEN + '\n' + GENNOD +
  '\nwindow.__TG = TEST_GENERATORS; window.__GN = GEN_NOD;', sandbox);
const TG = sandbox.window.__TG, GN = sandbox.window.__GN;

// generator-id → {ko, idx}: kör varje snabb-fn med varje känd variant-form (opt-in-generatorer kräver rätt variant)
const SV0 = require(path.join(ROOT, 'js/data/spec-villkor.js'));
const PROBES = [undefined];
Object.keys(SV0.VILLKOR).forEach(nod => ['ak7', 'ak8', 'ak9'].forEach(ars => {
  const p = SV0.profil(nod, ars); if (p && p.variant) PROBES.push({ variant: p.variant });
}));
const ID_MAP = {};
Object.keys(TG).forEach(ko => (TG[ko].snabb || []).forEach((fn, idx) => {
  for (const opts of PROBES) {
    try { const r = fn(new Set(), opts); if (r && r.generator) { ID_MAP[r.generator] = { ko, idx }; break; } } catch (e) {}
  }
}));

// ── 2. Parsa en uppgift (talområde/struktur) ur sub.q ──────────────────────────────────────
function numsIn(s) {
  const out = [], re = /-?\d[\d\s ]*(?:[.,]\d+)?/g; let m;
  while ((m = re.exec(s)) !== null) {
    const t = m[0].replace(/[\s ]/g, '').replace(',', '.');
    if (t === '-' || t === '') continue;
    out.push(parseFloat(t));
  }
  return out;
}
function decimalsOf(s) { // flest decimaler bland operanderna i q-strängen
  let max = 0, re = /\d[.,](\d+)/g, m;
  while ((m = re.exec(s)) !== null) max = Math.max(max, m[1].length);
  return max;
}
function stripLabel(s) { return s.replace(/^[A-Za-zåäöÅÄÖ ]+:\s*/, ''); } // "Räkna ut: 62 · 1000" → "62 · 1000"
function analyze(sub) {
  const q = stripLabel(String(sub.q || sub.prompt || ''));
  const nums = numsIn(q);
  const ops = (q.match(/[·×*/÷+]/g) || []).length + (q.match(/−/g) || []).length +
              (q.match(/(?:\d|\))\s*-\s*(?:\d|\()/g) || []).length; // '-' bara som operator mellan tal
  // parentesdjup
  let depth = 0, maxDepth = 0;
  for (const c of q) { if (c === '(') { depth++; maxDepth = Math.max(maxDepth, depth); } else if (c === ')') depth--; }
  const brakstreck = !!(sub.brak || sub.brakstreck || /class="?(brak|frac)/i.test(String(sub.html || '')));
  const mellanled = !!(sub.led || sub.mellanled || sub.steps || (Array.isArray(sub.rows) && sub.rows.length > 1) || sub.typ === 'mellanled');
  return { q, nums, ops, parenteser: maxDepth, brakstreck, mellanled,
           magnitud: nums.length ? Math.max(...nums.map(Math.abs)) : 0,
           minMagnitud: nums.length ? Math.min(...nums.map(Math.abs).filter(x => x > 0).concat([Infinity])) : 0,
           decimaler: decimalsOf(q), harDecimal: /\d[.,]\d/.test(q) };
}

// ── 3. Kör en nod/profil, samla avvikelser ─────────────────────────────────────────────────
function checkProfil(nod, ars, prof) {
  const gens = Object.keys(GN).filter(id => GN[id] === nod);
  const dev = [];             // tak-brott (per uppgift)
  const cover = { faktor: new Set(), decimalOperand: false, mellanled: false, maxOps: 0, parenteser: false, brakstreck: false, minMag: Infinity, maxMag: 0 };
  let items = 0, sample = [];
  gens.forEach(id => {
    const loc = ID_MAP[id]; if (!loc) { dev.push({ typ: 'saknad-generator', txt: id + ' finns i GEN_NOD men kördes ej' }); return; }
    const fn = TG[loc.ko].snabb[loc.idx], seen = new Set();
    for (let i = 0; i < N; i++) {
      let r; try { r = fn(seen, prof.variant ? { variant: prof.variant } : undefined); } catch (e) { dev.push({ typ: 'krasch', txt: id + ': ' + e.message }); break; }
      if (r == null) { seen.clear(); continue; }
      (r.subs || []).forEach(sub => {
        const a = analyze(sub); items++;
        if (sample.length < 4) sample.push(a.q);
        // tak
        const t = prof.tak || {};
        if (t.maxOperationer != null && a.ops > t.maxOperationer) dev.push({ typ: 'tak:operationer', txt: a.q + ' (' + a.ops + '>' + t.maxOperationer + ')' });
        if (t.maxParenteser != null && a.parenteser > t.maxParenteser) dev.push({ typ: 'tak:parenteser', txt: a.q });
        if (t.brakstreck === false && a.brakstreck) dev.push({ typ: 'tak:brakstreck', txt: a.q });
        if (t.maxMagnitud != null && a.magnitud > t.maxMagnitud) dev.push({ typ: 'tak:magnitud', txt: a.q + ' (' + a.magnitud + '>' + t.maxMagnitud + ')' });
        if (t.maxDecimaler != null && a.decimaler > t.maxDecimaler) dev.push({ typ: 'tak:decimaler', txt: a.q + ' (' + a.decimaler + 'd)' });
        // täckning
        a.nums.forEach(x => cover.faktor.add(x));
        if (a.harDecimal) cover.decimalOperand = true;
        if (a.mellanled) cover.mellanled = true;
        cover.maxOps = Math.max(cover.maxOps, a.ops);
        if (a.parenteser > 0) cover.parenteser = true;
        if (a.brakstreck) cover.brakstreck = true;
        if (a.magnitud > cover.maxMag) cover.maxMag = a.magnitud;
        if (a.minMagnitud < cover.minMag) cover.minMag = a.minMagnitud;
      });
    }
  });
  // kravs (täckning)
  const k = prof.kravs || {};
  if (k.faktorSet) k.faktorSet.forEach(v => { if (![...cover.faktor].some(x => Math.abs(x - v) < 1e-9)) dev.push({ typ: 'krav:faktor', txt: 'saknar operand ' + v }); });
  if (k.decimalOperand && !cover.decimalOperand) dev.push({ typ: 'krav:decimalOperand', txt: 'ingen decimaloperand på ' + N + ' prov' });
  if (k.mellanled && !cover.mellanled) dev.push({ typ: 'krav:mellanled', txt: 'inget mellanled i utfallet' });
  if (k.minOperationer && cover.maxOps < k.minOperationer) dev.push({ typ: 'krav:operationer', txt: 'nådde max ' + cover.maxOps + ' op, kräver ' + k.minOperationer });
  if (k.parenteser && !cover.parenteser) dev.push({ typ: 'krav:parenteser', txt: 'ingen parentes i utfallet' });
  if (k.brakstreck && !cover.brakstreck) dev.push({ typ: 'krav:brakstreck', txt: 'inget bråkstreck i utfallet' });
  if (k.minMagnitud && cover.maxMag < k.minMagnitud) dev.push({ typ: 'krav:magnitud', txt: 'nådde max ' + cover.maxMag + ', kräver ' + k.minMagnitud });
  return { gens, items, dev, sample };
}

// ── 4. Kör ──────────────────────────────────────────────────────────────────────────────────
const SV = require(path.join(ROOT, 'js/data/spec-villkor.js'));
const onlyNod = process.argv[2];
const noder = onlyNod ? [onlyNod] : Object.keys(SV.VILLKOR);
let hardFail = 0, softFail = 0, ok = 0;
console.log('SPEC-FUZZ — ' + N + ' prov/profil · ' + noder.length + ' noder\n');
noder.forEach(nod => {
  const def = SV.VILLKOR[nod]; if (!def) { console.log('?? okänd nod: ' + nod); return; }
  console.log('▸ ' + nod + '   [' + def.kalla + ']');
  ['ak7', 'ak8', 'ak9'].forEach(ars => {
    const prof = SV.profil(nod, ars); if (!prof) return;
    if (ars === 'ak8' && def.profiler.ak8 === 'ak7') return; // undvik dubbelutskrift av ärvd
    const enforce = prof.enforce !== false;
    const r = checkProfil(nod, ars, prof);
    const tag = ars + (def.profiler.ak8 === ars ? '(=ak8)' : '');
    if (r.dev.length === 0) { console.log('   ✓ ' + tag + '  ' + r.items + ' uppg · gen[' + r.gens.join(',') + ']'); ok++; }
    else {
      const mark = enforce ? '✗' : '·';
      console.log('   ' + mark + ' ' + tag + (enforce ? '' : ' (dokumenterad, blockerar ej)') + '  ' + r.dev.length + ' avvik · ex: ' + (r.sample[0] || '—'));
      r.dev.slice(0, 6).forEach(d => console.log('       – ' + d.typ + ': ' + d.txt));
      if (enforce) hardFail += r.dev.length; else softFail += r.dev.length;
    }
  });
  console.log('');
});
console.log('── Summa: ' + ok + ' rena profiler · ' + hardFail + ' grind-avvikelser (enforce) · ' + softFail + ' dokumenterade (pending) ──');
process.exit(hardFail > 0 ? 1 : 0);
