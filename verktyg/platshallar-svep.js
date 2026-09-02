#!/usr/bin/env node
/* ============================================================
   platshallar-svep.js — hittar BYGGAR-RIKTADE platshållar-läckor i elevrenderad text.

   REGELN som skiljer läcka från panel (skriven in här så nästa genomgång inte
   flaggar tjugo legitima paneler och därmed blir ignorerad):

     Det avgörande är INTE om texten säger att något byggs — det är VEM den talar till.
       • "Det här delkapitlet byggs"      → talar till ELEVEN, ärlig märkning  → PANEL (ignoreras)
       • "Skicka problemuppgifterna"      → talar till BYGGAREN/Joachim         → LÄCKA (flaggas)

   En LÄCKA = text som är riktad till byggaren men renderas i elevens vy. Kännetecken:
   imperativ till byggaren ("skicka", "specificera"), namnet Joachim, TODO/FIXME/XXX,
   eller interna oklarhetsnoteringar ("villkor saknas", "väntar på villkor").

   Byggar-noteringar i KOMMENTARER renderas inte för eleven och hoppas därför över:
   JS-radkommentar, JS-blockkommentar och HTML-kommentar. (Flytta en byggar-notering
   in i en kommentar = rätt sätt att behålla den utan att publicera den till elev.)

   Ytor som skannas = de som faktiskt renderas för elev: delkapitel-HTML (ak7/ak8/ak9)
   och öva-bladens JS-strängar (js/motor/blad). Taxonomins begrepp-fält skannas INTE —
   de renderas inte i karta/självskattning (verifierat), så en notering där är kod, ej elevtext.

   Körning:  node verktyg/platshallar-svep.js            → läckor + panel-räkning
             node verktyg/platshallar-svep.js --paneler  → lista även de ignorerade panelerna
   Utgångskod 1 om någon läcka hittas (grind), annars 0.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const visaPaneler = process.argv.indexOf('--paneler') > -1;

// Kontext: en rad är en platshållar-KANDIDAT bara om den nämner bygge/väntan/notering.
const KONTEXT = /byggs|kommer snart|väntar|platsh[åa]llare|skicka|specificera|\bTODO\b|\bFIXME\b|\bXXX\b|ännu ej|inte klar/i;
// Avsändare = BYGGAREN → läcka. (Namnet, imperativ till byggaren, interna oklarhetsnoteringar.)
const BYGGAR_MARKORER = [
  /\bskicka\b/i, /specificera/i, /\bJoachim\b/, /\bTODO\b/, /\bFIXME\b/, /\bXXX\b/,
  /villkor saknas/i, /väntar på villkor/i, /SVG byggs/i
];

function filer() {
  const list = [];
  for (const d of ['ak7', 'ak8', 'ak9']) walk(path.join(ROOT, d), '.html', list);
  walk(path.join(ROOT, 'js/motor/blad'), '.js', list);
  return list;
}
function walk(abs, ext, list) {
  if (!fs.existsSync(abs)) return;
  for (const namn of fs.readdirSync(abs)) {
    const p = path.join(abs, namn);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, ext, list);
    else if (namn.endsWith(ext)) list.push(path.relative(ROOT, p).replace(/\\/g, '/'));
  }
}

// Maskera kommenterade delar rad för rad (spårar block-kommentarer över radgräns) så att
// byggar-noteringar i kommentarer inte flaggas. Returnerar synlig text per rad (samma radnr).
function synligaRader(text, typ) {
  const rader = text.split(/\r?\n/);
  const ut = [];
  let iBlock = false; // JS /* */ eller HTML <!-- -->
  for (let r of rader) {
    let synlig = '';
    let i = 0;
    while (i < r.length) {
      if (iBlock) {
        const slut = typ === 'html' ? r.indexOf('-->', i) : r.indexOf('*/', i);
        if (slut === -1) { i = r.length; } else { iBlock = false; i = slut + (typ === 'html' ? 3 : 2); }
        continue;
      }
      if (typ === 'html') {
        const start = r.indexOf('<!--', i);
        if (start === -1) { synlig += r.slice(i); break; }
        synlig += r.slice(i, start); iBlock = true; i = start + 4;
      } else {
        const block = r.indexOf('/*', i);
        const rad = r.indexOf('//', i);
        if (rad > -1 && (block === -1 || rad < block)) { synlig += r.slice(i, rad); break; } // // till radslut
        if (block > -1) { synlig += r.slice(i, block); iBlock = true; i = block + 2; continue; }
        synlig += r.slice(i); break;
      }
    }
    ut.push(synlig);
  }
  return ut;
}

const lackor = [], paneler = [];
for (const f of filer()) {
  const typ = f.endsWith('.html') ? 'html' : 'js';
  const rader = synligaRader(fs.readFileSync(path.join(ROOT, f), 'utf8'), typ);
  rader.forEach((rad, i) => {
    if (!KONTEXT.test(rad)) return;
    const text = rad.replace(/\s+/g, ' ').trim();
    const post = { fil: f, rad: i + 1, text: text.length > 120 ? text.slice(0, 117) + '…' : text };
    if (BYGGAR_MARKORER.some(m => m.test(rad))) lackor.push(post);
    else paneler.push(post);
  });
}

const S = '────────────────────────────────────────';
console.log('\nPLATSHÅLLAR-SVEP · avsändar-regeln (läcka = talar till byggaren, renderas för elev)\n' + S);
if (lackor.length) {
  console.log('LÄCKOR (byggar-riktad text i elevens vy — åtgärda):');
  for (const l of lackor) console.log('  ✗ ' + l.fil + ':' + l.rad + '  | ' + l.text);
} else {
  console.log('LÄCKOR: 0 — ingen byggar-riktad text renderas för elev. ✓');
}
console.log(S);
console.log('PANELER (elev-riktad "byggs"-märkning — legitima, ignoreras): ' + paneler.length + ' st');
if (visaPaneler) for (const p of paneler) console.log('  · ' + p.fil + ':' + p.rad + '  | ' + p.text);
else console.log('  (kör med --paneler för att lista dem)');
console.log(S);
process.exit(lackor.length ? 1 : 0);
