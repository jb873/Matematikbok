/* elevtext-grind.js — ELEVTEXT-LÅSET. Grindens tredje ben (vid sidan av facit-diff och spec-villkor):
   ────────────────────────────────────────────────────────────────────────────────────────────────
   Facit-fuzzen säger att generatorn RÄKNAR rätt. Spec-villkoren säger att den STÄLLER rätt sorts fråga.
   Det här säger att INGEN elevtext har författats eller ändrats av maskinen utan godkännande.

   All text eleven läser — prompter, rubriker, frågor, ledtrådar — extraheras som MALLAR (de fasta
   bokstäverna; inflätade variabler blir {}) och jämförs mot ett godkänt register (js/data/elevtext-
   register.json). En mall som inte finns i registret är DRIFT: en ny eller ändrad formulering som
   ingen har godkänt. Grinden brister tills registret uppdateras — vilket är ett medvetet, granskat steg.

   Kör:  node verktyg/elevtext-grind.js              (kontroll: exit 1 om någon mall saknas i registret)
         node verktyg/elevtext-grind.js --uppdatera  (godkänn nuläget: skriv om registret)

   VAD SOM FÅNGAS: tillagd/ändrad fast text i ett elevtext-fält (t.ex. "(t.ex. 500+60+7)" i en rubrik,
     "(skriv med komma)" i en fråga). Talvärden och andra variabler ignoreras (de blir {} i mallen).
   VAD SOM INTE FÅNGAS (rapporteras som gräns): text som byggs helt dynamiskt via hjälpfunktioner utan
     literal, samt facit-värden (dem bevakar facit-diffen). Se README-noten sist i filen.

   Noll nätväg. Ingen källfil ändras — bara register-JSON vid --uppdatera. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const REGISTER = path.join(ROOT, 'js/data/elevtext-register.json');

// Elevtext-fält: värdet av dessa är text som eleven läser.
const FALT = ['prompt', 'rubrik', 'fraga', 'title', 'titel', 'q', 'vansterText', 'sub', 'intro', 'placeholder', 'hint', 'exempel', 'varning'];
const FALT_RE = new RegExp('(?:^|[\\s,{(\\[])(' + FALT.join('|') + ')\\s*:', 'g');

// Källor: öva-blad, drillar, ak9-variantmotorer, och ramarnas inbäddade generatorer.
function kallor() {
  const list = [];
  const dirs = ['js/motor/blad', 'js/motor/metod'];
  for (const d of dirs) {
    const abs = path.join(ROOT, d);
    if (fs.existsSync(abs)) for (const f of fs.readdirSync(abs)) if (f.endsWith('.js')) list.push(d + '/' + f);
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'js/motor'))) if (/^ak9.*\.js$/.test(f)) list.push('js/motor/' + f);
  for (const r of ['ak7-k1-ram.html', 'ak7-k2-ram.html', 'ak7-k3-ram.html', 'ak8-k1-ram.html']) list.push(r);
  list.push('js/data/k1-fardiga-test.js');   // FAS 3: elevtext-varningen vid flikbyte under prov
  list.push('js/data/ak8-fardiga-test.js');  // åk8: samma flikbyte-varning (certifiering)
  return list;
}

// ── Extrahera en fält-mall: från positionen efter "fält:", läs värde-uttrycket och bygg mallen
//    (literaler sammanfogade; icke-literala luckor med faktiskt innehåll → {}). Stannar vid , eller
//    slut på objektet (}/]) på djup 0. ──
function extraheraMall(text, start) {
  let i = start, depth = 0;
  let mall = '', pendingCode = '';
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === "'" || c === '"') {                       // string-literal
      if (/[^\s+]/.test(pendingCode)) mall += '{}';     // fanns en variabel/call mellan literaler
      pendingCode = '';
      const q = c; let s = ''; i++;
      while (i < n && text[i] !== q) { if (text[i] === '\\') { s += text[i] + (text[i + 1] || ''); i += 2; } else { s += text[i]; i++; } }
      i++;                                              // hoppa stäng-citat
      mall += s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ');
      continue;
    }
    if (c === '`') {                                    // template-literal: ta literaldelen, ${} → {}
      const end = text.indexOf('`', i + 1); if (end < 0) break;
      const inner = text.slice(i + 1, end).replace(/\$\{[^}]*\}/g, '{}');
      if (/[^\s+]/.test(pendingCode)) mall += '{}';
      pendingCode = ''; mall += inner; i = end + 1; continue;
    }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') { if (depth === 0) break; depth--; }
    else if (c === ',' && depth === 0) break;           // nästa fält
    pendingCode += c; i++;
  }
  return mall.replace(/\s+/g, ' ').trim();
}

function extrahera(rel) {
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const set = new Set();
  let m;
  FALT_RE.lastIndex = 0;
  while ((m = FALT_RE.exec(text))) {
    const falt = m[1];
    const mall = extraheraMall(text, m.index + m[0].length);
    if (mall && /[a-zA-ZåäöÅÄÖ]/.test(mall)) set.add(falt + ' | ' + mall);   // kräver bokstäver (ej ren "{}")
  }
  return [...set].sort();
}

function byggRegister() {
  const reg = {};
  for (const rel of kallor()) { try { reg[rel] = extrahera(rel); } catch (e) { reg[rel] = ['__FEL__ ' + e.message]; } }
  return reg;
}

// ── Kör ──
const uppdatera = process.argv.includes('--uppdatera');
const nu = byggRegister();

if (uppdatera) {
  fs.writeFileSync(REGISTER, JSON.stringify(nu, null, 1) + '\n');
  let tot = 0; for (const k in nu) tot += nu[k].length;
  console.log('elevtext-register uppdaterat: ' + Object.keys(nu).length + ' filer, ' + tot + ' godkända mallar.');
  process.exit(0);
}

if (!fs.existsSync(REGISTER)) { console.error('elevtext-grind: register saknas — kör med --uppdatera först.'); process.exit(2); }
const reg = JSON.parse(fs.readFileSync(REGISTER, 'utf8'));

let added = 0, removed = 0;
const filer = [...new Set([...Object.keys(reg), ...Object.keys(nu)])].sort();
for (const f of filer) {
  const gammalt = new Set(reg[f] || []), nytt = new Set(nu[f] || []);
  const nya = [...nytt].filter(x => !gammalt.has(x));
  const borta = [...gammalt].filter(x => !nytt.has(x));
  if (nya.length || borta.length) {
    console.log('\n' + f);
    nya.forEach(x => { console.log('  + NY (ej godkänd):  ' + x); added++; });
    borta.forEach(x => { console.log('  - borttagen:        ' + x); removed++; });
  }
}

console.log('\n────────────────────────────────────────');
if (added === 0 && removed === 0) { console.log('Elevtext-låset: allt matchar registret. 0 drift.'); process.exit(0); }
console.log('Elevtext-låset: ' + added + ' ny(a) mall(ar) utan godkännande, ' + removed + ' borttagna.');
console.log('En NY mall = elevtext som lagts till/ändrats. Granska den — är den din, kör --uppdatera för att godkänna.');
process.exit(added > 0 ? 1 : 0);   // borttag ensamt (ren radering) fäller inte grinden; tillägg gör det
