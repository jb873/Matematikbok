/* elevtext-grind.js — ELEVTEXT-LÅSET. Grindens tredje ben (vid sidan av facit-diff och spec-villkor):
   ────────────────────────────────────────────────────────────────────────────────────────────────
   Facit-fuzzen säger att generatorn RÄKNAR rätt. Spec-villkoren säger att den STÄLLER rätt sorts fråga.
   Det här säger att INGEN elevtext har författats eller ändrats av maskinen utan godkännande.

   All text eleven läser — prompter, rubriker, frågor, ledtrådar — extraheras som MALLAR (de fasta
   bokstäverna; inflätade variabler blir {}) och jämförs mot ett godkänt register (js/data/elevtext-
   register.json). En mall som inte finns i registret är DRIFT: en ny eller ändrad formulering som
   ingen har godkänt. Grinden brister tills registret uppdateras — vilket är ett medvetet, granskat steg.

   Kör:  node verktyg/elevtext-grind.js                  (kontroll: exit 1 om någon mall saknas i registret)
         node verktyg/elevtext-grind.js --uppdatera      (godkänn ALLT: skriv om hela registret)
         node verktyg/elevtext-grind.js --uppdatera <x>  (godkänn bara filer/områden vars sökväg innehåller <x>
                                                          — betar av rött i omgångar; övriga poster orörda)

   VAD SOM FÅNGAS: tillagd/ändrad fast text i ett elevtext-fält (t.ex. "(t.ex. 500+60+7)" i en rubrik,
     "(skriv med komma)" i en fråga). Talvärden och andra variabler ignoreras (de blir {} i mallen).
   VAD SOM INTE FÅNGAS (rapporteras som gräns): text som byggs helt dynamiskt via hjälpfunktioner utan
     literal, samt facit-värden (dem bevakar facit-diffen). Se README-noten sist i filen.

   Noll nätväg. Ingen källfil ändras — bara register-JSON vid --uppdatera. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
// ELEVTEXT_REGISTER (miljövariabel) pekar om registret — för att prova --uppdatera mot en KOPIA utan att röra det riktiga.
const REGISTER = process.env.ELEVTEXT_REGISTER || path.join(ROOT, 'js/data/elevtext-register.json');

// Elevtext-fält: värdet av dessa är text som eleven läser. namn/etikett = taxonomins nodnamn och kart-
// etiketter (k1/k2/k3-taxonomi.js: "namn"/"etikett"/"titel") — eleven ser dem på kartan och i själv-
// skattningen; de döptes nyss om ("Term och summa", "Faktorträd", "Lästal") och ska inte kunna döpas om
// ogranskat igen. Nycklarna får vara citerade ("namn":) — JSON-stilen taxonomin använder (fångades inte förr).
const FALT = ['prompt', 'rubrik', 'fraga', 'title', 'titel', 'q', 'vansterText', 'sub', 'intro', 'placeholder', 'hint', 'exempel', 'varning', 'namn', 'etikett'];
const FALT_RE = new RegExp('(?:^|[\\s,{(\\[])["\']?(' + FALT.join('|') + ')["\']?\\s*:', 'g');
// KÄND BEGRÄNSNING (fältnamns-luckan, medvetet lämnad): regexen ser bara text i ett KÄNT fältnamn ovan.
// Elevtext i en annan nyckel ("label:" var ett sådant fall — nians chips använde det först) eller i ett
// funktionsargument (grupp('Repetition')) är osynlig för låset. Inverteringen av kallor() (2026-09-12)
// löste KATALOG-luckan (en ny mapp är automatiskt innanför) — inte den här. GRÖNT betyder därför: ingen ny
// elevtext har tillkommit i ett KÄNT FÄLT — INTE att ingen elevtext har tillkommit. Ny elevtext ska läggas
// i ett fält ur FALT (så gjordes i ak9-utbud.js: TEXT = { rubrik:…, intro:… }). Ingen fix planerad.

// Elevsynliga HTML-ATTRIBUT (utanför fält:-syntaxen, som FALT_RE inte ser). placeholder= = rutans
// ledtext eleven läser; den fångas nu i både fält- och attributform. title=/aria-label=/alt= kartlagda
// men EJ inlagda: dominerade av nav/UI-krom (aria-label "Brödsmulor", title "Färdighetsdrill"), interna
// flagg-noter (title "Precedenstvetydig…") och tomma/HTML-alt — inte pedagogisk elevtext (se rapport).
const ATTR = ['placeholder'];
const ATTR_RE = new RegExp('(?:^|[\\s"\'>;,({])(' + ATTR.join('|') + ')\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'g');
function attrMall(raw) {
  let v = String(raw).replace(/\$\{[^}]*\}/g, '{}');                         // template ${…} → {}
  if (/['"]\s*\+|\+\s*['"]/.test(v)) v = v.replace(/['"]\s*\+[\s\S]*?\+\s*['"]/g, '{}');   // JS-konkat 'lit'+kod+'lit' → {}
  return v.replace(/\s+/g, ' ').trim();
}

// KÄLLOR — INVERTERAT (2026-09-12): allt .js och .html i repot UTOM en uttrycklig uteslutningslista.
// Förr räknades katalogerna upp — och tre gånger hamnade en ny katalog utanför (ovamer, ak7/k2-HTML,
// kvrot + forelasningar.js): någon skapar en mapp och ingen minns uppräkningen. Nu är en ny katalog
// automatiskt INNANFÖR. Låset kan bara bli rödare, aldrig tystare. Antalet skannade filer skrivs ut vid
// varje körning (självrapport) — en ny katalog syns som en siffra som ökat, inte som tystnad.
const EXKLUDERA = ['Arkiv', '.claude', 'verktyg', 'fonts', 'node_modules', '.git'];   // toppnivå-kataloger
function kallor() {
  const list = [];
  (function ga(rel) {
    for (const f of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const r = rel ? rel + '/' + f.name : f.name;
      if (f.isDirectory()) { if (!rel && EXKLUDERA.includes(f.name)) continue; ga(r); }
      else if (/\.(js|html)$/.test(f.name)) list.push(r);
    }
  })('');
  return list.sort();
}
function sjalvrapport(list) {
  const js = list.filter(x => x.endsWith('.js')).length;
  console.log('elevtext-grind: skannar ' + list.length + ' filer (' + js + ' js, ' + (list.length - js) + ' html) — exkluderat: ' + EXKLUDERA.join(', '));
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
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(text))) {
    const mall = attrMall(m[3] !== undefined ? m[3] : m[4]);
    if (mall && /[a-zA-ZåäöÅÄÖ]/.test(mall) && !/</.test(mall)) set.add(m[1] + ' | ' + mall);   // ej ren "{}", ej HTML-markup
  }
  return [...set].sort();
}

function byggRegister() {
  const reg = {}, list = kallor();
  sjalvrapport(list);
  // Bara filer MED mallar får en post (registret hålls kompakt; en fil utan elevtext = ingen post).
  for (const rel of list) { try { const m = extrahera(rel); if (m.length) reg[rel] = m; } catch (e) { reg[rel] = ['__FEL__ ' + e.message]; } }
  return reg;
}

// ── Kör ──
const uppdatera = process.argv.includes('--uppdatera');
const uppArg = uppdatera ? process.argv[process.argv.indexOf('--uppdatera') + 1] : null;   // valfritt fil-/områdesfilter
const nu = byggRegister();

if (uppdatera) {
  // PARTIELLT godkännande (per fil eller område): `--uppdatera <delsträng-av-sökväg>` godkänner BARA de
  // register-poster vars filväg innehåller delsträngen; övriga lämnas orörda. Så kan en röd grind betas
  // av ett område i taget — den blir grönare för varje pass i stället för att ligga röd i veckor.
  if (uppArg && !uppArg.startsWith('--')) {
    const reg = fs.existsSync(REGISTER) ? JSON.parse(fs.readFileSync(REGISTER, 'utf8')) : {};
    const matchade = [...new Set([...Object.keys(reg), ...Object.keys(nu)])].filter(f => f.includes(uppArg)).sort();
    if (!matchade.length) { console.error('elevtext: inga käll-filer matchar "' + uppArg + '".'); process.exit(2); }
    for (const f of matchade) { if (nu[f] && nu[f].length) reg[f] = nu[f]; else delete reg[f]; }
    fs.writeFileSync(REGISTER, JSON.stringify(reg, null, 1) + '\n');
    console.log('elevtext-register: godkände ' + matchade.length + ' fil(er) som matchar "' + uppArg + '":');
    matchade.forEach(f => console.log('  ✓ ' + f));
    console.log('Övriga poster orörda. Kör grinden igen för att se återstående rött.');
    process.exit(0);
  }
  // FULLT godkännande: skriv om hela registret.
  fs.writeFileSync(REGISTER, JSON.stringify(nu, null, 1) + '\n');
  let tot = 0; for (const k in nu) tot += nu[k].length;
  console.log('elevtext-register uppdaterat (helt): ' + Object.keys(nu).length + ' filer, ' + tot + ' godkända mallar.');
  process.exit(0);
}

if (!fs.existsSync(REGISTER)) { console.error('elevtext-grind: register saknas — kör med --uppdatera först.'); process.exit(2); }
const reg = JSON.parse(fs.readFileSync(REGISTER, 'utf8'));

// ── --rapport: BACKLOGGEN per katalog, antal per fil, med PROVENIENS där sökvägen avgör den ──
//   J = Joachims text (öva-blad byggda ur hans docx/PDF; ak9-variantmotorer ur hans dokument; gy-dokumenten)
//   T = taxonomins nodnamn/etiketter (autogenererade, senast omdöpta av Joachim — granskas som hans)
//   M = maskinförfattad (drillar, generatorer, UI-text, register, ramar, delkapitel-HTML)
//   Betas av per fil/katalog: node verktyg/elevtext-grind.js --uppdatera <delsträng-av-sökväg>. Aldrig i klump.
function proveniens(f) {
  if (/taxonomi\.js$/.test(f)) return 'T';
  if (/^js\/motor\/blad\/blad-|^js\/motor\/ak9-|gy-alg|ova-variant/.test(f)) return 'J';
  return 'M';
}
if (process.argv.includes('--rapport')) {
  const perKat = {};
  for (const f of new Set([...Object.keys(reg), ...Object.keys(nu)])) {
    const g = new Set(reg[f] || []), nya = (nu[f] || []).filter(x => !g.has(x)).length; if (!nya) continue;
    const kat = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '(rot)';
    (perKat[kat] = perKat[kat] || []).push({ f: f.slice(kat === '(rot)' ? 0 : kat.length + 1), nya, p: proveniens(f) });
  }
  const summa = k => perKat[k].reduce((s, e) => s + e.nya, 0);
  let tot = 0; const perP = { J: 0, T: 0, M: 0 };
  console.log('\nBACKLOGG — nya mallar utan godkännande, per katalog  (J = Joachims text · T = taxonomi · M = maskinförfattad)');
  for (const k of Object.keys(perKat).sort((x, y) => summa(y) - summa(x))) {
    tot += summa(k);
    console.log('\n' + k + '   (' + summa(k) + ')');
    for (const r of perKat[k].sort((x, y) => y.nya - x.nya)) { perP[r.p] += r.nya; console.log('   ' + String(r.nya).padStart(4) + '   ' + r.p + '   ' + r.f); }
  }
  console.log('\nTOTALT ' + tot + '   —   J ' + perP.J + ' · T ' + perP.T + ' · M ' + perP.M);
  process.exit(0);
}

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
// KÄND BEGRÄNSNING (Väg 1, medvetet lämnad): ren borttagning fäller INTE grinden — bara tillägg gör det.
// Följd: en borttagen sträng ligger kvar i registret som fantom tills --uppdatera städar den (och en
// IDENTISK sträng som återinförs dessförinnan flaggas ej). Ofarligt: en fantom släpper aldrig igenom NY
// text. Att göra raderingar fällande skulle kräva omgodkännande vid varje städning → tjatig spärr → förbi-
// kopplad spärr, vilket är sämre än blindfläcken. GRÖNT betyder därför: ingen ny elevtext har tillkommit
// utan godkännande — INTE att registret är teckenidentiskt med källan.
process.exit(added > 0 ? 1 : 0);   // borttag ensamt (ren radering) fäller inte grinden; tillägg gör det
