/* sidlist-grind.js — V9: en ny sida ska in i grindarnas listor samma dag den byggs.
 *
 *   KÖR:  node verktyg/sidlist-grind.js
 *
 * SKÄLET. Grindarnas sidlistor var handskrivna. Mönster-bladet mättes inte av nämnar- och
 * flerruts-grinden förrän någon mindes att lägga till det — 108 blad blev 110, och under tiden
 * var grinden GRÖN om en sida den aldrig öppnat. En grind som inte känner sidan säger ingenting
 * om den, men ser ut som ett godkännande. Det är det farligaste utfallet en grind kan ge.
 *
 * TRE BEN, alla mätta på EFFEKTEN och inte på källtexten:
 *
 *   TÄCKNING  — varje bladsida på disk ska finnas i varje registrerat verktygs EGEN sidmängd.
 *               Mängden läses genom att köra verktyget med --lista, så det är verktygets egen
 *               kod som svarar. Att läsa verktygets källtext hade mätt attributet: fyra av dem
 *               räknar inte upp sina sidor i koden, de letar upp dem.
 *   MOTORER   — upptäckaren får inte bli gammal. Varje motorfil ska laddas av minst en räknad
 *               sida (annars är den död kod, eller en motor vars sida glömt sitt skript), och
 *               varje namngivet undantag i EJ_MOTOR ska peka på en fil som finns. Ett undantag
 *               för en fil som bytt namn är ett tyst hål: sidan blir osynlig för hela grinden,
 *               och tystnaden ser ut som täckning.
 *   EGEN LISTA — inget verktyg får bära en handskriven sidsökväg. Mängderna bor i sidor.js.
 *               Det är benet som hindrar att nästa handskrivna array smyger in igen.
 *
 * UNDANTAG är rader med SKÄL, inte en tyst filtrering. Varje undantag skrivs ut vid varje
 * körning, så att en lista som växer syns. Mängden undantag får bara minska.
 */
'use strict';
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const Sidor = require('./sidor');
const ROOT = Sidor.ROOT;
const args = process.argv.slice(2);

// Verktygen som öppnar elevens sidor. Ett verktyg som tas bort härifrån ska ha ett skäl i koden.
const VERKTYG = [
  { fil: 'kontroll-svep.js',  vad: 'tom ruta rättas inte' },
  { fil: 'yt-kontrakt.js',    vad: 'keypad · tecken · grow · bredd' },
  { fil: 'smalruta-svep.js',  vad: 'måttet är ett golv' },
  { fil: 'namnare-grind.js',  vad: 'varje synlig ruta räknas och rättas' },
  { fil: 'flerruts-grind.js', vad: 'varje ruta i en rad markeras för sig' },
  { fil: 'tonad-svep.js',     vad: 'inget tonat som ska vara läsbart' },
  { fil: 'keypad-grind.js',   vad: 'keypaden är alltid helt upplåst' },
  { fil: 'mellanled-grind.js', vad: 'en uppgift som begär mellanled har plats för det' }
];

/* Nians fyra öva-sidor står utanför nämnar- och flerruts-grindens listor. Proberna läser
   sjuans och åttans radtyper; nians öva-sidor bygger sina blad på annat sätt, och proberna
   skulle hitta noll rutor och rapportera "tomt blad" — ett grönt svar på en fråga de inte
   ställt. Undantaget gäller tills proberna lärt sig markupen, som de fick lära sig
   k2-kopiornas radtyper 2026-09-23.

   VARJE RAD BÄR ETT BEVIS, och grinden prövar det i sidans källa — samma krav som EJ_MOTOR
   och V14:s skäl-lista. Det kravet kom till 2026-10-01 och avslöjade genast att mitt eget
   skäl var fel: raderna sade "AK9_OVA-radtyper", men strängen AK9_OVA står bara i EN av de
   fyra sidorna. Tre kör öva-sekvensen, och den fjärde är fördjupningssidan som bygger sin
   yta inline. Ett skäl utan bevis är en gissning med auktoritet. */
const UNDANTAG = [
  { verktyg: 'namnare-grind.js',  sida: 'ak9/k1/rakna-med-brak-akr9-ova.html',    bevis: 'ova-sekvens',       skal: 'nians öva-sekvens — proben läser sjuans/åttans radtyper' },
  { verktyg: 'namnare-grind.js',  sida: 'ak9/k1/rakna-med-brak-ova.html',         bevis: 'ova-sekvens',       skal: 'nians öva-sekvens — proben läser sjuans/åttans radtyper' },
  { verktyg: 'namnare-grind.js',  sida: 'ak9/k1/tal-och-berakna-ova.html',        bevis: 'ova-sekvens',       skal: 'nians öva-sekvens — proben läser sjuans/åttans radtyper' },
  { verktyg: 'namnare-grind.js',  sida: 'ak9/k1/rakna-med-brak-fordjupning.html', bevis: 'AK8_UI.keypadHTML', skal: 'fördjupningssidan bygger sin bladyta inline, utan egen motorfil' },
  { verktyg: 'flerruts-grind.js', sida: 'ak9/k1/rakna-med-brak-akr9-ova.html',    bevis: 'ova-sekvens',       skal: 'nians öva-sekvens — proben läser sjuans/åttans radtyper' },
  { verktyg: 'flerruts-grind.js', sida: 'ak9/k1/rakna-med-brak-ova.html',         bevis: 'ova-sekvens',       skal: 'nians öva-sekvens — proben läser sjuans/åttans radtyper' },
  { verktyg: 'flerruts-grind.js', sida: 'ak9/k1/tal-och-berakna-ova.html',        bevis: 'ova-sekvens',       skal: 'nians öva-sekvens — proben läser sjuans/åttans radtyper' },
  { verktyg: 'flerruts-grind.js', sida: 'ak9/k1/rakna-med-brak-fordjupning.html', bevis: 'AK8_UI.keypadHTML', skal: 'fördjupningssidan bygger sin bladyta inline, utan egen motorfil' }
];

// sidor.js äger mängderna; cdp-kor.js är körare, inte svep.
const FRITAGNA_FILER = new Set(['sidor.js', 'sidlist-grind.js', 'cdp-kor.js', 'browser-verify.js']);

let fel = 0;
const F = m => { console.log('  ✗ ' + m); fel++; };
console.log('SIDLIST-GRIND — V9: ingen sida växer utanför mätningen\n');

// ── BEN 1: TÄCKNING ───────────────────────────────────────────────────────────────────────
const alla = Sidor.alla();
console.log('BLADSIDOR PÅ DISK: ' + alla.length + '\n');
console.log('TÄCKNING');

VERKTYG.forEach(v => {
  const r = spawnSync('node', [path.join(__dirname, v.fil), '--lista'], { encoding: 'utf8', timeout: 60000 });
  if(r.status !== 0 || !r.stdout){
    F(v.fil + ': svarar inte på --lista (status ' + r.status + '). Utan den kan mängden inte läsas ur verktygets egen kod.');
    return;
  }
  const egen = new Set(r.stdout.trim().split('\n').map(s => s.trim()).filter(Boolean));
  const undan = new Set(UNDANTAG.filter(u => u.verktyg === v.fil).map(u => u.sida));

  const saknas = alla.filter(s => !egen.has(s) && !undan.has(s));
  const dottUndantag = [...undan].filter(s => egen.has(s));

  if(saknas.length){
    F(v.fil + ': ' + saknas.length + ' bladsida(or) utanför mätningen — ' + v.vad);
    saknas.forEach(s => console.log('      ' + s));
  } else {
    console.log('  ✓ ' + v.fil.replace('.js', '').padEnd(16) + ' ' + egen.size + ' sidor · täcker alla ' +
      (alla.length - undan.size) + (undan.size ? ' (' + undan.size + ' undantagna)' : ''));
  }
  // Ett undantag som inte längre behövs ska bort, annars döljer det nästa riktiga lucka.
  dottUndantag.forEach(s => F(v.fil + ': undantaget för ' + s + ' behövs inte längre — ta bort raden ur UNDANTAG'));
  // Och skälet ska vara SANT, inte bara skrivet: beviset måste stå i sidans källa.
  UNDANTAG.filter(u => u.verktyg === v.fil).forEach(function(u){
    const abs = path.join(ROOT, u.sida);
    const kalla = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
    if(!kalla) F(v.fil + ': undantaget pekar på ' + u.sida + ' som inte finns');
    else if(kalla.indexOf(u.bevis) < 0) F(v.fil + ': skälet för ' + u.sida + ' säger "' + u.skal + '" men beviset ' + u.bevis + ' finns inte i sidan');
  });
});

// ── BEN 2: MOTORER ────────────────────────────────────────────────────────────────────────
// Upptäckaren får inte bli gammal. Två påståenden prövas:
//   · varje motorfil laddas av minst en sida som räknas — annars är den antingen död kod eller
//     en motor vars sida glömt att ladda den ("byggt men onåbart"-mönstret);
//   · varje rad i EJ_MOTOR pekar på en fil som finns, och säger varför den inte är en motor.
//     Ett undantag för en fil som bytt namn är ett tyst hål: allt den filen bär blir oräknat.
console.log('\nMOTORER');
const sidtext = alla.map(p => fs.readFileSync(path.join(ROOT, p), 'utf8'));
const oladdade = Sidor.motorfiler().filter(m => !sidtext.some(s => s.indexOf('/' + m.fil) >= 0));
if(oladdade.length){
  F(oladdade.length + ' motorfil(er) laddas av ingen räknad bladsida — död kod, eller en sida som glömt sitt skript');
  oladdade.forEach(m => console.log('      ' + m.mapp + '/' + m.fil));
} else {
  console.log('  ✓ varje motorfil i ' + Sidor.MOTORMAPP.join(' och ') + ' laddas av minst en räknad sida');
}

const dodaUndantag = Object.keys(Sidor.EJ_MOTOR).filter(f =>
  !Sidor.MOTORMAPP.some(d => fs.existsSync(path.join(ROOT, d, f))));
if(dodaUndantag.length){
  dodaUndantag.forEach(f => F('EJ_MOTOR undantar ' + f + ' som inte finns — bytt namn? Då räknas den nya filen som motor, eller inte alls.'));
} else {
  console.log('  ✓ EJ_MOTOR: ' + Object.keys(Sidor.EJ_MOTOR).length + ' undantagna filer finns och har skäl');
  Object.keys(Sidor.EJ_MOTOR).forEach(f => console.log('      ' + f + ' — ' + Sidor.EJ_MOTOR[f]));
}

// ── BEN 3: EGEN LISTA ─────────────────────────────────────────────────────────────────────
console.log('\nEGEN LISTA');
const HANDSKRIVEN = /['"]ak[789]\/k\d[^'"]*['"]/g;
let lint = 0;
fs.readdirSync(path.join(ROOT, 'verktyg')).filter(f => /\.js$/.test(f) && !FRITAGNA_FILER.has(f)).forEach(f => {
  const s = fs.readFileSync(path.join(ROOT, 'verktyg', f), 'utf8');
  // En enstaka sökväg är ett enskilt prov (d5 har en egen probe); fyra eller fler är en lista.
  const traff = (s.match(HANDSKRIVEN) || []).filter(t => /\/(index\.html|[a-z0-9\-]+\.html)['"]$/.test(t));
  if(traff.length >= 4){
    F(f + ': ' + traff.length + ' handskrivna sidsökvägar — mängden hör i verktyg/sidor.js');
    console.log('      ' + traff.slice(0, 4).join(' ') + (traff.length > 4 ? ' …' : ''));
    lint++;
  }
});
if(!lint) console.log('  ✓ inget verktyg bär en handskriven sidlista');

// ── UNDANTAGEN SKRIVS ALLTID UT ───────────────────────────────────────────────────────────
if(UNDANTAG.length){
  console.log('\nUNDANTAG (' + UNDANTAG.length + ') — varje rad är en skuld, inte ett godkännande');
  const per = {};
  UNDANTAG.forEach(u => { (per[u.skal] = per[u.skal] || []).push(u.verktyg.replace('.js', '') + ' · ' + u.sida); });
  Object.keys(per).forEach(skal => {
    console.log('  ' + skal);
    per[skal].forEach(r => console.log('      ' + r));
  });
}

console.log('\n' + (fel ? '✗ ' + fel + ' brott' : '✓ GRÖN — varje bladsida ligger i varje verktygs mätning'));
process.exit(fel ? 1 : 0);
