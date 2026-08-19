/* koppling-grind.js — KOPPLINGS-LÅSET. Grindens fjärde ben (vid sidan av facit-diff, spec-villkor,
   elevtext-låset). Två krav, åt varsitt håll:
   ────────────────────────────────────────────────────────────────────────────────────────────────
   FRAMÅT  — varje TEST-generator måste peka på en godkänd öva- eller drill-grupp (js/data/ova-
             koppling.js). En generator utan koppling faller bygget: den prövar något ingen övar.
   BAKÅT   — varje MASTERY-nyckel som en drill/övning skriver till måste motsvara en nod som finns i
             taxonomin. Loggas evidens till ett id utan kartcell (som fantomen begrepp-as) faller
             bygget: eleven övar och evidensen försvinner. Samma sorts kontroll som elevtext-registret,
             riktad mot LOGGNINGEN i stället för mot orden — den hade fångat begrepp-as innan någon letat.

   Kör:  node verktyg/koppling-grind.js            (båda kraven; exit 1 om något brister)
         node verktyg/koppling-grind.js --bakat    (bara bakåt: mastery-nycklar → taxonomi)
         node verktyg/koppling-grind.js --framat   (bara framåt: generator → öva/drill)

   Noll nätväg. Ingen källfil ändras. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = p => fs.existsSync(path.join(ROOT, p));

// ── Taxonomins verkliga noder + koId:n ─────────────────────────────────────────────────────────
function taxonomi() {
  const noder = new Set(), koIds = new Set();
  for (const f of ['js/data/k1-taxonomi.js', 'js/data/k2-taxonomi.js', 'js/data/k3-taxonomi.js']) {
    (read(f).match(/"id":\s*"([^"]+)"/g) || []).forEach(m => {
      const id = m.match(/"id":\s*"([^"]+)"/)[1];
      noder.add(id); koIds.add(id.split(':')[0]);
    });
  }
  return { noder, koIds };
}

// ── Alla filer där drillar/övningar/generatorer loggar ──────────────────────────────────────────
function loggFiler() {
  const list = [];
  for (const d of ['js/motor/metod', 'js/motor/blad', 'js/motor/potens', 'js/motor/ovamer']) {
    const abs = path.join(ROOT, d);
    if (fs.existsSync(abs)) for (const f of fs.readdirSync(abs)) if (f.endsWith('.js')) list.push(d + '/' + f);
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'js/motor'))) if (/^ak9.*\.js$/.test(f)) list.push('js/motor/' + f);
  for (const r of ['ak7-k1-ram.html', 'ak7-k2-ram.html', 'ak7-k3-ram.html', 'ak8-k1-ram.html']) list.push(r);
  return list;
}

// ── BAKÅT: mastery-nycklar → taxonomi ───────────────────────────────────────────────────────────
function bakat(tax) {
  const brott = [];
  for (const f of loggFiler()) {
    const t = read(f);
    // 1. getTutorScore('koId', 'formaga') — koId måste vara en verklig nod-koId
    let m; const re1 = /getTutorScore\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;
    while ((m = re1.exec(t))) { if (!tax.koIds.has(m[1])) brott.push({ f, typ: 'getTutorScore', id: m[1] + ':' + m[2], koId: m[1] }); }
    // 2. Färdighetsträningens item-lista {ko:'X', f:'Y'} — X:Y måste vara en verklig nod
    const re2 = /\{\s*ko:\s*'([^']+)'\s*,\s*f:\s*'([^']+)'\s*\}/g;
    while ((m = re2.exec(t))) { const nod = m[1] + ':' + m[2]; if (!tax.noder.has(nod)) brott.push({ f, typ: 'övningsitem', id: nod, koId: m[1] }); }
    // 3. loggaForsok('nodeId', ...) — nodeId måste vara en verklig nod
    const re3 = /loggaForsok\(\s*'([^']+)'/g;
    while ((m = re3.exec(t))) { if (!tax.noder.has(m[1]) && m[1].indexOf(':') >= 0) brott.push({ f, typ: 'loggaForsok', id: m[1], koId: m[1].split(':')[0] }); }
    // 4. GEN_NOD-värden — provbyggaren loggar testevidens via loggaForsok(GEN_NOD[gen]); varje värde måste vara en nod
    const gn = t.match(/GEN_NOD\s*=\s*\{([\s\S]*?)\n\s*\};/);
    if (gn) { const re4 = /'([^']+)'\s*:\s*'([^']+)'/g; let g; while ((g = re4.exec(gn[1]))) { if (!tax.noder.has(g[2])) brott.push({ f, typ: 'GEN_NOD', id: g[2], koId: g[2].split(':')[0] }); } }
  }
  // unika fantom-koId:n
  const fantomKo = [...new Set(brott.map(b => b.koId).filter(k => !tax.koIds.has(k)))];
  return { brott, fantomKo };
}

// ── Noder som redan tränas av en DRILL (Färdighetsträningens item-lista + OVNING_RENDERS) ────────
function drillTackta(tax, ramText) {
  const set = new Set();
  for (const m of ramText.matchAll(/\{\s*ko:\s*'([^']+)'\s*,\s*f:\s*'([^']+)'\s*\}/g)) {
    const nod = m[1] + ':' + m[2]; if (tax.noder.has(nod)) set.add(nod);
  }
  const ovn = ramText.match(/OVNING_RENDERS\s*=\s*\{([\s\S]*?)\n\s*\};/);
  if (ovn) for (const m of ovn[1].matchAll(/'([^']+)'\s*:\s*\{([^}]*)\}/g)) {
    for (const fm of m[2].matchAll(/([\w-]+)\s*:/g)) { const nod = m[1] + ':' + fm[1]; if (tax.noder.has(nod)) set.add(nod); }
  }
  return set;
}

// ── FRAMÅT: varje generator prövar bara det som övas (blad eller drill) ──────────────────────────
// Omfång nu: sjuans k1 (delkapitel inventerat). Övriga rams läggs till när de inventeras.
function framat(tax) {
  const regPath = 'js/data/ova-koppling.js';
  if (!exists(regPath)) return { saknasReg: true, saknar: [], doda: [] };
  const KOPP = (function () { const w = {}; const vm = require('vm'); const ctx = { window: w }; vm.createContext(ctx); vm.runInContext(read(regPath), ctx); return w.OVA_KOPPLING || {}; })();
  const ram = read('ak7-k1-ram.html');
  const drill = drillTackta(tax, ram);
  // generator → nod ur GEN_NOD
  const gn = ram.match(/GEN_NOD\s*=\s*\{([\s\S]*?)\n\s*\};/);
  const genNod = {};
  if (gn) for (const m of gn[1].matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) genNod[m[1]] = m[2];
  const saknar = [];
  Object.keys(genNod).forEach(g => {
    const nod = genNod[g];
    if (drill.has(nod)) return;            // tränas av en drill → kopplad, ingen rad behövs
    if (KOPP[g]) return;                   // deklarerad blad-koppling (existens kollas nedan)
    saknar.push(g + ' → ' + nod);
  });
  // döda blad-kopplingar: bladfilen finns inte
  const doda = [];
  Object.keys(KOPP).forEach(g => {
    const ref = String(KOPP[g] || ''); const del = ref.split(':');
    if (del[0] === 'blad' && del[1] && !exists('js/motor/blad/' + del[1] + '.js')) doda.push({ g, ref, why: 'bladfil saknas' });
  });
  return { saknar: saknar.sort(), doda, antalGen: Object.keys(genNod).length, drillTackta: drill.size, bladKopplade: Object.keys(KOPP).length };
}

// ── Kör ─────────────────────────────────────────────────────────────────────────────────────────
const tax = taxonomi();
const bara = process.argv.find(a => a === '--bakat' || a === '--framat');
let fel = 0;

if (bara !== '--framat') {
  const { brott, fantomKo } = bakat(tax);
  console.log('── BAKÅT: mastery-nycklar → taxonomi ──');
  if (!brott.length) console.log('  ✓ alla loggnycklar motsvarar noder i taxonomin.');
  else {
    // helfantom = koId finns inte alls; formåge-miss = koId finns men fel formåga
    const helfantom = fantomKo, formaga = [...new Set(brott.map(b => b.id).filter(id => tax.koIds.has(id.split(':')[0])))];
    helfantom.forEach(ko => console.log('  ✗ HELFANTOM (ingen koId i taxonomin): ' + ko));
    formaga.forEach(id => console.log('  ✗ FORMÅGE-MISS (koId finns, formågan saknar nod): ' + id));
    console.log('  — loggplatser —');
    const perId = {}; brott.forEach(b => { (perId[b.id] = perId[b.id] || []).push(b); });
    Object.keys(perId).sort().forEach(id => console.log('    ' + id + '  ← ' + [...new Set(perId[id].map(b => b.typ + ' i ' + b.f.split('/').pop()))].join(', ')));
    console.log('  ' + brott.length + ' loggplats(er) skriver till id utan kartcell → evidens försvinner.');
    fel += brott.length;
  }
}

if (bara !== '--bakat') {
  const r = framat(tax);
  console.log('\n── FRAMÅT: generator → öva/drill-koppling (åk7 k1) ──');
  if (r.saknasReg) { console.log('  ⓘ js/data/ova-koppling.js saknas ännu — framåt-kravet ej aktivt.'); }
  else {
    if (!r.saknar.length && !r.doda.length)
      console.log('  ✓ alla ' + r.antalGen + ' generatorer kopplade (' + r.drillTackta + ' noder drill-täckta, ' + r.bladKopplade + ' blad-deklarerade).');
    if (r.saknar.length) { console.log('  ✗ generatorer UTAN öva/drill-koppling (prövar något ingen övar):'); r.saknar.forEach(s => console.log('      ' + s)); fel += r.saknar.length; }
    r.doda.forEach(d => { console.log('  ✗ död koppling: ' + d.g + ' → ' + d.ref + ' (' + d.why + ')'); fel++; });
  }
}

console.log('\n────────────────────────────────────────');
if (fel === 0) { console.log('Kopplings-låset: grönt.'); process.exit(0); }
console.log('Kopplings-låset: ' + fel + ' brott.');
process.exit(1);
