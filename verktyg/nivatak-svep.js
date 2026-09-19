/* nivatak-svep.js — SVEPET: drillens nivåtak mot nodens band, för varje deeplink i k1/k2/k3.
   ─────────────────────────────────────────────────────────────────────────────────────────
   Per lövnod med kort (visning.utbudslista) i K1/K2/K3_TAXONOMI: slå upp deeplinkens render-funktion
   (k1: OVNING_RENDERS i ak7-k1-ram · k2: K2_DRILL i ak7-k2-ram · k3: ovamer-k3/balans-wiring),
   läs funktionskroppen STATISKT och rapportera:
     tak        = adjustLevel-taket: explicit (MAXN/MAX_LVL ur band) · 'ram' (ramMaxNiva → 3, eller hub:ens
                  ?maxniva= ur visning.niva) · 1 (ingen adjustLevel = ingen klättring)
     nivåer     = vilka nivåer generatorn faktiskt SÄRSKILJER (största nivåliteral: level===N, lvl>=N, LEVELNAMN)
     band       = nodens band: UPPST_BAND (maxNiva) om noden har ett, annars visning.niva (null → 3)
     evidens    = loggar drillen nodens egen nyckel getTutorScore(ko, formaga)? (mastery-proxyn matchar URL:ens
                  ko:formaga — annars når ingen evidens noden)
   Flaggor: TAK<BAND (evidens når aldrig bandets topp) · TAK>BAND (loggar nivåer bandet inte känner) ·
            NIVÅER<TAK (klättrar till nivåer utan eget innehåll) · EVIDENS? (nodens nyckel loggas ej) ·
            DUBBEL (två render-funktioner för samma nod).
   Statiskt = heuristik: en generator som tar level som parameter till en annan funktion syns inte här; sådana
   rader märks '?' och listas sist. Kör: node verktyg/nivatak-svep.js [--alla]  (--alla: även rena rader) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const ALLA = process.argv.includes('--alla');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ── källor: ram + metod-/ovamer-filer ─────────────────────────────────────────────────────
const KALLOR = {
  k1: ['ak7-k1-ram.html', 'js/motor/metod/metod-addsub.js', 'js/motor/metod/metod-mult.js', 'js/motor/metod/metod-div.js', 'js/motor/metod/metod-negativa.js', 'js/motor/metod/metod-position.js', 'js/motor/metod/metod-primtal-begrepp.js', 'js/motor/metod/metod-primtal-komm.js', 'js/motor/metod/metod-primtal-problem.js', 'js/motor/metod/metod-primtal-rakna.js', 'js/motor/metod/metod-prioritering.js', 'js/motor/metod/metod-taluppfattning.js', 'js/motor/metod/metod-avrundning.js', 'js/motor/metod/metod-brak-decimal.js', 'js/motor/metod/metod-d1-tillagg.js', 'js/motor/metod/metod-faktortrad.js', 'js/motor/metod/metod-karna.js', 'js/motor/kvrot/kvrot-drill.js', 'js/motor/potens/potens-drill.js', 'js/motor/potens/tio-prefix-drill.js'],
  k2: ['ak7-k2-ram.html', 'js/motor/ovamer/ovamer-k2.js', 'js/motor/ovamer/ovamer-k2-andel.js', 'js/motor/ovamer/ovamer-k2-div.js', 'js/motor/ovamer/ovamer-k2-jmf.js', 'js/motor/ovamer/ovamer-k2-likvtid.js', 'js/motor/ovamer/ovamer-k2-luckor.js', 'js/motor/ovamer/ovamer-k2-mult.js', 'js/motor/ovamer/ovamer-k2-nian.js'],
  k3: ['ak7-k3-ram.html', 'js/motor/ovamer/ovamer-k3.js', 'js/motor/ekvationer-balans/k3-balans-wiring.js'],
};
const TEXT = {}; Object.keys(KALLOR).forEach(k => { TEXT[k] = KALLOR[k].filter(f => fs.existsSync(path.join(ROOT, f))).map(f => rd(f)).join('\n'); });

// funktionskropp (function NAME( … ) med balanserade klamrar) ur en textmassa
function fnBody(text, name) {
  const nm = name.replace(/[$]/g, '\\$');
  const re = new RegExp('(^|\\n)[ \\t]*(?:async\\s+)?function\\s+' + nm + '\\s*\\(|(?:window\\.)?' + nm + '\\s*=\\s*function\\s*(?:' + nm + '\\s*)?\\(');   // även window.NAME = function [NAME](
  const m = re.exec(text); if (!m) return null;
  let i = text.indexOf('{', m.index + m[0].length), d = 0, k = i;
  for (; k < text.length; k++) { if (text[k] === '{') d++; else if (text[k] === '}') { d--; if (!d) break; } }
  return text.slice(m.index, k + 1);
}
// största nivåliteral som generatorn särskiljer
function nivaerI(body) {
  let max = 0;
  const pats = [/\b(?:level|lvl|niva|nivå|L)\s*(?:===?|>=|>|<=|<)\s*(\d)\b/g, /\b(?:LEVELNAMN|NIVANAMN|LVL_NAMN|NAMN)\s*=\s*\{[^}]*?\b(\d)\s*:/g, /\bcase\s+(\d)\s*:/g, /\b(?:level|lvl)\s*===?\s*(\d)\s*\?/g];
  pats.forEach(p => { let m; while ((m = p.exec(body))) max = Math.max(max, +m[1]); });
  // LEVELNAMN = {1:…,2:…,3:…} → högsta nyckel
  const ln = /\b(?:LEVELNAMN|NIVANAMN)\s*=\s*(?:FLER\s*\?\s*)?\{([^}]*)\}/g; let m2;
  while ((m2 = ln.exec(body))) { const keys = [...m2[1].matchAll(/\b(\d)\s*:/g)].map(x => +x[1]); if (keys.length) max = Math.max(max, ...keys); }
  return max;
}
function takI(body, vis) {
  if (!/adjustLevel\s*\(/.test(body)) {
    // egen nivålogik utan adjustLevel (level++ / level = … / nedgång(ok)) → taket = största nivåliteral, annars 3
    if (/\b(?:level|lvl)\s*(?:\+\+|\+=|=\s*(?:Math\.min|Math\.max|level|lvl|adj))/.test(body)) { const mm = /Math\.min\(\s*(\d)\s*,\s*(?:level|lvl)/.exec(body); return { tak: mm ? +mm[1] : 3, kalla: mm ? 'egen nivålogik Math.min' : 'egen nivålogik (3?)' }; }
    return { tak: 1, kalla: 'ingen adjustLevel' };
  }
  const m = /adjustLevel\s*\([^;]*?,\s*null\s*,\s*([A-Za-z_]+)\s*\)/.exec(body);
  if (m) { const v = m[1]; const b = new RegExp('(?:const|var|let)\\s+' + v + '\\s*=\\s*([^;\\n]+)').exec(body);
    const def = b ? b[1].trim() : '?';
    const ub = /UppstBand\.maxNiva\(\s*(?:FLER\s*\?\s*)?'([\w-]+)'/.exec(def);
    if (ub) return { tak: bandMax(ub[1]), kalla: 'band ' + ub[1] + (def.includes('FLER') ? '|mult' : '') };
    if (/^\d+$/.test(def)) return { tak: +def, kalla: 'literal ' + v };
    return { tak: null, kalla: v + ' = ' + def.slice(0, 30) }; }
  const hub = vis && vis.niva != null && vis.niva < 3 ? vis.niva : 3;
  return { tak: hub, kalla: hub === 3 ? 'ram (3)' : 'hub ?maxniva=' + hub };
}
// ── band ──
const SV = require(path.join(ROOT, 'js/data/spec-villkor.js'));
function bandMax(r) { return SV.UPPST_BAND[r] ? Object.keys(SV.UPPST_BAND[r].nivaer).length : null; }
const NOD_BAND = { 'add-metoder:uppstallning': 'add', 'sub-metoder:uppstallning': 'sub', 'mult-metoder:uppstallning': 'mult', 'mult-metoder:uppstallning-stora': 'mult-fler', 'div-metoder:kort': 'div', 'div-metoder:lang': 'div' };

// ── deeplinkar per kapitel ──
function k1Deeplinks() {
  const s = rd('ak7-k1-ram.html'); const a = s.indexOf('const OVNING_RENDERS = {'); const b = s.indexOf('\n};', a);
  const src = s.slice(a + 'const OVNING_RENDERS = '.length, b + 2);
  const sb = {}; vm.createContext(sb);
  const proxy = new Proxy({}, { has: () => true, get: (t, n) => typeof n === 'string' ? function () { return { fn: n, args: [...arguments].slice(1).map(x => (x && x.__namn) || (typeof x === 'object' ? JSON.stringify(x) : String(x))) }; } : undefined });
  // identifierare som argument (NEGATIVA, cfg-objekt) → namn via proxy-get returnerar en funktion; vi vill namnet
  const proxy2 = new Proxy({}, { has: () => true, get: (t, n) => { if (typeof n !== 'string') return undefined; const f = function () { return { fn: n, args: [...arguments].slice(1).map(x => x && x.__namn ? x.__namn : (typeof x === 'function' ? '(fn)' : (typeof x === 'object' ? JSON.stringify(x) : String(x)))) }; }; f.__namn = n; return f; } });
  const table = vm.runInContext('with(P){ (' + src + ') }', Object.assign(vm.createContext({ P: proxy2 })));
  const out = [];
  Object.keys(table).forEach(ko => Object.keys(table[ko]).forEach(f => { let r; try { r = table[ko][f]({}); } catch (e) { r = { fn: '?', args: [e.message] }; } out.push({ kap: 'k1', nod: ko + ':' + f, fn: r && r.fn, args: r && r.args }); }));
  return out;
}
function k2Deeplinks() {
  const s = rd('ak7-k2-ram.html'); const a = s.indexOf('var K2_DRILL = {'); const b = s.indexOf('\n  };', a);
  const out = []; const re = /'([\w-]+)':\s*function\(\)\{\s*([A-Za-z_][A-Za-z0-9_]*)\(([^)]*)\)/g; let m;   // summaMot1Engine har en siffra
  const blk = s.slice(a, b);
  while ((m = re.exec(blk))) out.push({ kap: 'k2', ko: m[1], fn: m[2], args: m[3] ? [m[3].replace(/'/g, '')] : [] });   // k2-routern nycklar på ko ENBART
  return out;
}
function k3Deeplinks() {
  // k3-mastery-wiring: 'ko:formaga': ['omrade','grupp'] → engine = <grupp>Engine (kommentaren i wiringen)
  const out = [];
  const w = rd('js/motor/ovamer/k3-mastery-wiring.js');
  const re = /'([\w-]+):([\w-]+)':\s*\['(\w+)',\s*'(\w+)'\]/g; let m;
  while ((m = re.exec(w))) out.push({ kap: 'k3', nod: m[1] + ':' + m[2], fn: m[4] + 'Engine', args: [] });
  const b = rd('js/motor/ekvationer-balans/k3-balans-wiring.js');
  const re2 = /'([\w-]+):([\w-]+)'\s*:\s*'([\w-]+)'/g;
  while ((m = re2.exec(b))) out.push({ kap: 'k3', nod: m[1] + ':' + m[2], fn: 'balans:' + m[3], args: [] });
  return out;
}

// ── taxonomi: vilka noder har kort ──
function taxNoder(kap) {
  const sbx = { window: {} }; vm.createContext(sbx); vm.runInContext(rd('js/data/' + kap + '-taxonomi.js'), sbx);
  const T = sbx.window[kap.toUpperCase() + '_TAXONOMI']; const list = Array.isArray(T) ? T : (T.noder || T.nodes || []);
  const ut = {}; list.forEach(n => { if (n.niva === 'lovnod' && n.visning && n.visning.utbudslista) { const ko = n.id.split(':')[0]; const f = n.visning.formagaKey || n.id.split(':')[1]; ut[ko + ':' + f] = { id: n.id, vis: n.visning }; } });
  return ut;
}

// ── analys ──
const rows = [], saknade = [];
[['k1', k1Deeplinks()], ['k2', k2Deeplinks()], ['k3', k3Deeplinks()]].forEach(([kap, links]) => {
  const noder = taxNoder(kap); const text = TEXT[kap];
  const perNod = {}; links.forEach(l => { const k = l.nod || l.ko; (perNod[k] = perNod[k] || []).push(l); });
  Object.keys(noder).forEach(nod => {
    const ls = perNod[nod] || perNod[nod.split(':')[0]]; const vis = noder[nod].vis;   // k2: ko-nyckel
    if (!ls) { saknade.push(kap + ' ' + nod + ' (kort utan deeplink-post)'); return; }
    ls.forEach(l => {
      let body = l.fn.startsWith('balans:') ? null : fnBody(text, l.fn);
      let via = null;
      if (body) {   // delegering EN nivå: wrapper/picker → alla anropade toppnivåfunktioner (utom delad infrastruktur) läses med
        const INFRA = /^(exerciseHeader|adjustLevel|renderSummaryCard|keypadHTML|bindKeypad|getTutorScore|distinktOmgang|navTo|renderScoreBarSimple|d3RandInt|d3DecStr|randPick|konfetti|korOvning)$/;
        const called = [...new Set([...body.matchAll(/\b([a-z][A-Za-z0-9_]+)\s*\(/g)].map(x => x[1]))].filter(n => n !== l.fn && !INFRA.test(n));
        const drillar = called.filter(c => { const cb = fnBody(text, c); return cb && /adjustLevel\s*\(|getTutorScore\(/.test(cb); });
        const dispatchPaArg = (l.args || []).some(a => typeof a === 'string' && /^[a-z0-9-]+$/i.test(a) && !/^(null|undefined|true|false)$/.test(a)) && /===\s*['"][\w-]+['"]/.test(body) && drillar.length + [...body.matchAll(/\bfunction\s+[a-z]\w+\s*\(/g)].length > 1;
        if (dispatchPaArg) { via = 'DISPATCH(arg ' + (l.args || []).join(',') + ')'; body = null; }   // väljer inre drill på sitt argument (renderMultMetoder(id) …) → statiskt oavgörbart
        else if (!/adjustLevel\s*\(/.test(body)) {
          const medNiva = drillar.filter(c => /adjustLevel\s*\(/.test(fnBody(text, c)));
          if (medNiva.length === 1) { body += '\n' + fnBody(text, medNiva[0]); via = medNiva[0]; }        // ren wrapper/körare → följ (tak + nyckel läses ur båda)
          else if (drillar.length > 1) { via = 'DISPATCH(' + drillar.join('|') + ')'; body = null; }       // väljer drill på argument → statiskt oavgörbart
          else if (drillar.length === 1) { body += '\n' + fnBody(text, drillar[0]); via = drillar[0]; }
        }
      }
      const [ko, f] = nod.split(':');
      const bandR = NOD_BAND[noder[nod].id]; const band = bandR ? bandMax(bandR) : (vis.niva != null ? vis.niva : 3);
      let tak = { tak: null, kalla: 'ej läsbar' }, nivaer = null, evidens = null;
      if (body) {
        tak = takI(body, vis); nivaer = nivaerI(body);
        // korOvning-familjen (k2/k3): adjustLevel sitter i korOvning, generatorn i gen(level)
        if (!/adjustLevel/.test(body) && /korOvning\s*\(|kor\(|startOvning\(/.test(body)) tak = { tak: 3, kalla: 'korOvning (3)' };
        const key = new RegExp("getTutorScore\\(\\s*'" + ko + "'\\s*,\\s*'" + f + "'\\s*\\)");
        // cfg-driven nyckel (getTutorScore(cfg.koId, cfg.scoreKey)): trolig bara om formaga-literalen förekommer i kroppen
        const anrop = [...body.matchAll(/getTutorScore\(\s*([^,()]+?)\s*,\s*([^()]+?)\s*\)/g)].map(x => [x[1].trim(), x[2].trim()]);
        const variabel = anrop.some(a => !/^['"]/.test(a[0]) || !/^['"]/.test(a[1]));                       // nyckel via variabel/cfg → statiskt oavgörbart
        const cfgKey = variabel && new RegExp("['\"]" + f + "['\"]").test(body);
        evidens = key.test(body) ? 'ja'
          : cfgKey ? 'trolig (cfg)'
          : variabel ? 'via variabel (ej avgjort)'
          : anrop.length ? 'NEJ (annan nyckel: ' + anrop.map(a => a[0] + ':' + a[1]).join(' ').replace(/['"]/g, '') + ')'   // bara literaler och ingen matchar → FEL
          : (kap === 'k1' ? (vis.kommer ? 'kommer' : 'NEJ (ingen getTutorScore)') : 'k2/k3-hook');
      }
      const flaggor = [];
      // visning.niva === 1 ⇔ drillen saknar klättring (order 2026-09-19: minNiva gäller bara noder med nivåer).
      // Båda hållen: deklarerad 1 med en drill som klättrar = fel; deklarerad >1/null med en drill som loggar
      // utan nivå = fel ("drill som glömmer nivån" ska förbli ett grindfel). Statiskt oavgjorda (dispatch) undantas.
      const deklarerad = vis.niva != null ? vis.niva : null;
      if (body && tak.tak != null) {
        if (deklarerad === 1 && tak.tak > 1) flaggor.push('NIVA1-MEN-KLÄTTRAR');
        if (deklarerad !== 1 && tak.tak === 1 && !bandR && !vis.kommer) flaggor.push('ENNIVÅ');   // loggar niva null men noden deklarerar nivåer → aldrig grön i åttan
      }
      if (deklarerad !== 1 && tak.tak != null && band != null && tak.tak > 1 && tak.tak < band) flaggor.push('TAK<BAND');
      if (tak.tak != null && band != null && tak.tak > band) flaggor.push('TAK>BAND');
      // nivåer-kolumnen är INFO, ingen flagga: `level===1 ? … : level===2 ? … : …` har tre grenar men bara literalerna 1 och 2
      if (evidens && /^NEJ/.test(evidens)) flaggor.push('EVIDENS?');
      if (ls.length > 1) flaggor.push('DUBBEL');
      if (!body) flaggor.push('?');
      rows.push({ kap, nod: noder[nod].id, deklarerad, fn: l.fn + (l.args && l.args.length ? '(' + l.args.join(',') + ')' : '') + (via ? ' → ' + via : ''), tak: tak.tak, takKalla: tak.kalla, nivaer, band, bandKalla: bandR ? 'UPPST_BAND.' + bandR : (vis.niva != null ? 'visning.niva' : 'default'), evidens, flaggor });
    });
  });
});
module.exports = { rows, saknade };
if (require.main === module) {
const fel = rows.filter(r => r.flaggor.length);
console.log('NIVÅTAK-SVEP — ' + rows.length + ' deeplinkar (k1/k2/k3) · ' + fel.length + ' med flaggor\n');
console.log('kap  nod                                 render                              tak  (källa)            nivåer  band (källa)         evidens         flaggor');
(ALLA ? rows : fel).forEach(r => console.log(r.kap.padEnd(4) + ' ' + r.nod.padEnd(35) + ' ' + r.fn.slice(0, 35).padEnd(35) + ' ' + String(r.tak == null ? '?' : r.tak).padEnd(4) + ' ' + ('(' + r.takKalla + ')').padEnd(20) + ' ' + String(r.nivaer == null ? '?' : r.nivaer).padEnd(7) + ' ' + (r.band + ' (' + r.bandKalla + ')').padEnd(20) + ' ' + String(r.evidens).padEnd(15) + ' ' + r.flaggor.join(' ')));
if (saknade.length) { console.log('\nKort utan deeplink-post i rammen (' + saknade.length + '):'); saknade.forEach(x => console.log('  ' + x)); }
console.log('\nSumma: ' + rows.length + ' rader · flaggor: ' + ['TAK<BAND', 'TAK>BAND', 'ENNIVÅ', 'NIVA1-MEN-KLÄTTRAR', 'EVIDENS?', 'DUBBEL', '?'].map(f => f + ' ' + rows.filter(r => r.flaggor.includes(f)).length).join(' · '));
}
