/* koppling-grind.js — KOPPLINGS-LÅSET. Grindens fjärde ben (vid sidan av facit-diff, spec-villkor,
   elevtext-låset). Två krav, åt varsitt håll:
   ────────────────────────────────────────────────────────────────────────────────────────────────
   FRAMÅT  — varje TEST-generator måste peka på en godkänd öva- eller drill-grupp (js/data/ova-
             koppling.js). En generator utan koppling faller bygget: den prövar något ingen övar.
   BAKÅT   — varje MASTERY-nyckel som en drill/övning skriver till måste motsvara en nod som finns i
             taxonomin. Loggas evidens till ett id utan kartcell (som fantomen begrepp-as) faller
             bygget: eleven övar och evidensen försvinner. Samma sorts kontroll som elevtext-registret,
             riktad mot LOGGNINGEN i stället för mot orden — den hade fångat begrepp-as innan någon letat.
   DEEPLINK — varje SURFAT färdighetskort (lövnod med visning) måste ha en drill-renderare för sitt
             id-PREFIX i rätt ram: k1 → OVNING_RENDERS[prefix][formåga], k2 → K2_DRILL[prefix]. OCH
             delkapitlens hub måste härleda ko ur id-prefixet, inte n.parent. Det var det som brast när
             25 noder plattades ut i Familj 4: korten skickade parent (del-nyckel) som ingen renderare
             har → tyst startsida. Den här kontrollen hade fångat alla 28 trasiga korten före ett klick.

   Kör:  node verktyg/koppling-grind.js            (alla tre kraven; exit 1 om något brister)
         node verktyg/koppling-grind.js --bakat    (bara bakåt: mastery-nycklar → taxonomi)
         node verktyg/koppling-grind.js --framat   (bara framåt: generator → öva/drill)
         node verktyg/koppling-grind.js --deeplink (bara deeplink: färdighetskort → drill-renderare)

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

// ── DEEPLINK: färdighetskort (surfad lövnod) → drill-renderare ───────────────────────────────────
// Balanserad brace-matchning (tål nästlade fn-kroppar), ä-säkra nycklar (rakneträning m.fl.).
function blockBody(text, header) {
  const i = text.search(header); if (i < 0) return null;
  const open = text.indexOf('{', i); if (open < 0) return null;
  let depth = 0;
  for (let j = open; j < text.length; j++) { const c = text[j]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) return text.slice(open + 1, j); } }
  return null;
}
// k1-ramens OVNING_RENDERS: { prefix: { formåga: fn, … }, … } → { prefix: Set(formågor) }
function k1Renderare(ram) {
  const body = blockBody(ram, /const\s+OVNING_RENDERS\s*=/); const res = {}; if (!body) return res;
  const re = /(?:^|\n)\s{2}(?:'([^']+)'|"([^"]+)"|([\wåäöÅÄÖ-]+))\s*:\s*\{/g; let m;
  while ((m = re.exec(body))) {
    const key = m[1] || m[2] || m[3], open = re.lastIndex - 1; let depth = 0, end = open;
    for (let j = open; j < body.length; j++) { const c = body[j]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { end = j; break; } } }
    const inner = body.slice(open + 1, end), fset = new Set();
    for (const f of inner.matchAll(/(?:^|[\n,{])\s*(?:'([^']+)'|([\wåäöÅÄÖ-]+))\s*:/g)) fset.add(f[1] || f[2]);
    res[key] = fset; re.lastIndex = end;
  }
  return res;
}
// k2-ramens K2_DRILL: { prefix: function(){…}, … } → Set(prefix). Grinden på ko enbart (formåga ignoreras där).
function k2Renderare(ram) {
  const body = blockBody(ram, /var\s+K2_DRILL\s*=/); const set = new Set(); if (!body) return set;
  for (const m of body.matchAll(/(?:^|\n)\s*'([^']+)'\s*:\s*function/g)) set.add(m[1]);
  return set;
}
// Surfade lövnoder (visning.utbudslista) ur taxonomin, med id-prefix + faktisk formåga (formagaKey||etikett).
function surfade() {
  const vm = require('vm'), out = [];
  for (const [f, key, area] of [['js/data/k1-taxonomi.js', 'K1_TAXONOMI', 'k1'], ['js/data/k2-taxonomi.js', 'K2_TAXONOMI', 'k2'], ['js/data/k3-taxonomi.js', 'K3_TAXONOMI', 'k3']]) {
    if (!exists(f)) continue;
    const w = {}, ctx = { window: w }; vm.createContext(ctx); vm.runInContext(read(f), ctx);
    for (const n of ((w[key] && w[key].noder) || [])) {
      if (n.niva === 'lovnod' && n.visning && n.visning.utbudslista)
        out.push({ id: n.id, prefix: String(n.id).split(':')[0], formaga: n.visning.formagaKey || n.visning.etikett, area, utbud: n.visning.utbudslista });
    }
  }
  return out;
}
function deeplink() {
  const k1r = k1Renderare(read('ak7-k1-ram.html')), k2r = k2Renderare(read('ak7-k2-ram.html'));
  const noder = surfade(), brott = [];
  for (const n of noder) {
    if (n.area === 'k1') {
      if (!k1r[n.prefix]) brott.push({ id: n.id, why: 'ingen OVNING_RENDERS[' + n.prefix + ']' });
      else if (!k1r[n.prefix].has(n.formaga)) brott.push({ id: n.id, why: 'OVNING_RENDERS[' + n.prefix + '] saknar formågan «' + n.formaga + '»' });
    } else if (n.area === 'k2') {
      if (!k2r.has(n.prefix)) brott.push({ id: n.id, why: 'ingen K2_DRILL[' + n.prefix + ']' });
    }
    // k3: inga delkapitel-hubbar idag; läggs till när k3 får en drill-dispatch.
  }
  // LINT: delkapitlens hub måste härleda ko ur id-prefixet, inte n.parent (Familj 4-buggens signatur).
  const lint = [];
  for (const area of ['ak7/k1', 'ak7/k2']) {
    const abs = path.join(ROOT, area); if (!fs.existsSync(abs)) continue;
    for (const d of fs.readdirSync(abs)) { const p = area + '/' + d + '/index.html'; if (exists(p) && /ko:\s*n\.parent\b/.test(read(p))) lint.push(p); }
  }
  // ÖVERFLÖD (info): renderare utan surfad k1/k2-nod (kan vara ak8/ak9/provbyggar-only → ej fatal).
  const surfPrefix = new Set(noder.map(n => n.prefix));
  const overflow = [...Object.keys(k1r), ...k2r].filter(k => !surfPrefix.has(k)).sort();
  return { brott, lint, overflow, antalKort: noder.length };
}

// ── Kör ─────────────────────────────────────────────────────────────────────────────────────────
const tax = taxonomi();
const bara = process.argv.find(a => a === '--bakat' || a === '--framat' || a === '--deeplink');
let fel = 0;

if (!bara || bara === '--bakat') {
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

if (!bara || bara === '--framat') {
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

if (!bara || bara === '--deeplink') {
  const r = deeplink();
  console.log('\n── DEEPLINK: färdighetskort → drill-renderare ──');
  if (!r.brott.length && !r.lint.length)
    console.log('  ✓ alla ' + r.antalKort + ' surfade kort har en drill-renderare för sitt id-prefix; alla hubbar härleder ko ur prefixet.');
  if (r.brott.length) {
    console.log('  ✗ surfade kort UTAN drill-renderare (öppnar startsida/översikt i st f drillen):');
    r.brott.forEach(b => console.log('      ' + b.id + '  — ' + b.why));
    fel += r.brott.length;
  }
  if (r.lint.length) {
    console.log('  ✗ delkapitel-hub härleder ko ur n.parent (bryter för utplattade noder — använd n.id.split(\':\')[0]):');
    r.lint.forEach(p => console.log('      ' + p));
    fel += r.lint.length;
  }
  if (r.overflow.length) console.log('  ⓘ renderare utan surfad k1/k2-nod (ej fatal — kan vara ak8/ak9/provbyggar-only): ' + r.overflow.join(', '));
}

console.log('\n────────────────────────────────────────');
if (fel === 0) { console.log('Kopplings-låset: grönt.'); process.exit(0); }
console.log('Kopplings-låset: ' + fel + ' brott.');
process.exit(1);
