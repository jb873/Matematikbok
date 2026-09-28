/* exempel-svep.js — EXEMPLET SOM AVSLÖJAR SVARET (order 2026-09-28).

   Ett exempel, en grupprubrik eller en bild som innehåller svaret på en uppgift i SAMMA grupp gör
   uppgiften till avskrift. Eleven behöver inte tolka uttrycket — hon läser av bilden.

   Svepet läser bladens DATA (rubrik, intro, exempel, bild-markup, frågetext) och jämför med
   gruppens facit, och delar träffarna i tre kategorier:

     FACIT      exemplet innehåller uppgiftens svar, ord för ord eller som alla dess beståndsdelar
                → uppgiften är avskrift; rättas utan att fråga
     NÄRA       exemplet delar tal eller struktur med uppgiften men är inte dess svar
                → Joachim avgör
     OBEROENDE  ingen överlappning → inget att göra (redovisas som antal)

   Svepet är statiskt: det läser filerna, ingen webbläsare. Filerna ändras inte.

   KÖR:  node verktyg/exempel-svep.js [--fil <delsträng>]        alla blad-filer
   Exit 1 när en FACIT-träff finns kvar. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--fil'));

// Bladfiler med grupper: sjuans k1/k3-motorer och åttans d-blad.
const FILER = fs.readdirSync(path.join(ROOT, 'js/motor/blad'))
  .filter(f => /^blad-.*\.js$/.test(f))
  .concat(fs.readdirSync(path.join(ROOT, 'js/motor/problemlosning')).filter(f => /^prob-blad\d*\.js$/.test(f)).map(f => '../problemlosning/' + f));

function txt(s){
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')                       // markup bort: bilden räknas som text
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[\s ]+/g, ' ')
    .trim();
}
function ord(s){
  return txt(s).toLowerCase()
    .replace(/[.,;:!?()[\]{}·×/+=−–—-]/g, ' ')
    .split(/\s+/).filter(w => w.length > 1 || /[0-9]/.test(w)).map(stam).filter(Boolean);
}
// Räkneord = siffror: bilden skriver "3 glassar", facit säger "tre glassar".
const RAKNEORD = { en: '1', ett: '1', 'två': '2', tva: '2', tre: '3', fyra: '4', fem: '5', sex: '6',
                   sju: '7', 'åtta': '8', atta: '8', nio: '9', tio: '10', elva: '11', tolv: '12' };
// Pluraländelser av: glassar/glasses → glass, tröjor → tröj, munkar → munk.
function stam(w){
  if(RAKNEORD[w]) return RAKNEORD[w];
  return w.replace(/(arna|erna|orna|ar|er|or|na|n)$/, '');
}
const STOPP = new Set(['och', 'en', 'ett', 'som', 'det', 'den', 'med', 'har', 'för', 'per', 'kostar',
  'hur', 'mycket', 'vad', 'vilket', 'vilka', 'tal', 'skriv', 'beräkna', 'uttrycket', 'uttryck',
  'kronor', 'kr', 'betalade', 'köpt', 'om', 'är', 'du', 'din', 'ditt', 'sedan', 'först']);

// En grupps texter (det eleven SER före sitt svar) och dess facit.
function gruppTexter(g){
  const bitar = [g.rubrik, g.intro, g.exempel, g.hint];
  (g.rader || []).forEach(r => { bitar.push(r.svg, r.fraga, r.vansterText, r.text, r.bild); });
  return bitar.filter(Boolean).map(txt).join(' ');
}
function facitAv(r){
  const ut = [];
  if(r.svar !== undefined && r.svar !== null) ut.push(String(r.svar));
  if(Array.isArray(r.accept)) r.accept.forEach(a => ut.push(String(a)));
  return ut;
}

// FACIT-träff: svarets innehållsord finns ALLA i gruppens texter (ordningen spelar ingen roll).
function traff(gruppText, svar){
  const gt = ' ' + ord(gruppText).join(' ') + ' ';
  const sv = ord(svar).filter(w => !STOPP.has(w));
  if(!sv.length) return null;
  const finns = sv.filter(w => gt.indexOf(' ' + w + ' ') >= 0);
  // FACIT kräver ett ORDSVAR: ett uttryck eller tal måste innehålla frågans tal för att vara ett
  // svar på frågan — att 10 står i "10 cm längre" gör inte a + 10 till avskrift.
  if(finns.length === sv.length && sv.length >= 2 && sv.some(w => /[a-zåäö]{2,}/.test(w)))
    return { grad: 'FACIT', delar: sv.join(' ') };
  if(finns.length === sv.length) return { grad: 'NÄRA', delar: sv.join(' ') + ' (tal/uttryck)' };
  if(finns.length >= 2 && finns.length >= sv.length - 1) return { grad: 'NÄRA', delar: finns.join(' ') + ' av ' + sv.join(' ') };
  return null;
}
// Siffersvar: exakt talet i texten räknas bara som NÄRA (ett tal kan stå av andra skäl).
function talTraff(gruppText, svar){
  if(!/^-?\d+([.,]\d+)?$/.test(String(svar).trim())) return null;
  const t = txt(gruppText).replace(/[\s ]/g, '');
  return t.indexOf(String(svar).replace('.', ',')) >= 0 ? { grad: 'NÄRA', delar: 'talet ' + svar } : null;
}

// Grupper ur en bladfil: datan är objektliteraler, så filen läses som text och grupperna
// plockas ut med balanserade klamrar (ingen eval — filerna är browser-moduler).
function grupper(kalla){
  const ut = [];
  const re = /\{\s*rubrik\s*:/g; let m;
  while((m = re.exec(kalla)) !== null){
    let i = m.index, djup = 0, j = i;
    for(; j < kalla.length; j++){
      const c = kalla[j];
      if(c === '{') djup++;
      else if(c === '}'){ djup--; if(!djup){ j++; break; } }
    }
    ut.push(kalla.slice(i, j));
  }
  return ut;
}
// Ur en grupp-text: rubrik/exempel-delen och radernas svar/accept.
function las(blk){
  const g = { rubrik: (blk.match(/rubrik\s*:\s*'([^']*)'/) || [])[1],
              intro: (blk.match(/intro\s*:\s*'([^']*)'/) || [])[1],
              exempel: (blk.match(/exempel\s*:\s*'([^']*)'/) || [])[1],
              rader: [] };
  const re = /\{([^{}]|\{[^{}]*\})*\}/g; let m;
  while((m = re.exec(blk)) !== null){
    const r = m[0];
    if(!/svar\s*:|accept\s*:/.test(r)) continue;
    g.rader.push({
      svar: (r.match(/svar\s*:\s*'([^']*)'/) || r.match(/svar\s*:\s*([-\d.]+)/) || [])[1],
      accept: (r.match(/accept\s*:\s*\[([^\]]*)\]/) || [])[1],
      svg: (r.match(/svg\s*:\s*'([^']*)'/) || [])[1],
      fraga: (r.match(/fraga\s*:\s*'([^']*)'/) || [])[1],
      vansterText: (r.match(/vansterText\s*:\s*'([^']*)'/) || [])[1],
      text: (r.match(/text\s*:\s*'([^']*)'/) || [])[1]
    });
  }
  return g;
}

let facit = 0, nara = 0, oberoende = 0, filer = 0;
console.log('EXEMPEL-SVEP — exempel/rubrik/bild som avslöjar svaret i samma grupp\n');
FILER.forEach(f => {
  const P = path.join(ROOT, 'js/motor/blad', f);
  const rel = path.relative(ROOT, P).replace(/\\/g, '/');
  if(BARA && rel.indexOf(BARA) < 0) return;
  const kalla = fs.readFileSync(P, 'utf8');
  filer++;
  const rader = [];
  grupper(kalla).forEach(blk => {
    const g = las(blk);
    if(!g.rader.length) return;
    const gt = gruppTexter(g);
    g.rader.forEach(r => {
      const svarTexter = [r.svar, r.accept].filter(Boolean);
      let basta = null;
      svarTexter.forEach(sv => {
        const t = traff(gt, sv) || talTraff(gt, sv);
        if(t && (!basta || t.grad === 'FACIT')) basta = t;
      });
      if(!basta){ oberoende++; return; }
      if(basta.grad === 'FACIT') facit++; else nara++;
      rader.push({ grad: basta.grad, rubrik: (g.rubrik || '').slice(0, 44),
                   fraga: (r.fraga || r.vansterText || r.text || '').slice(0, 40),
                   svar: String(r.svar || '').slice(0, 30), delar: basta.delar.slice(0, 50) });
    });
  });
  if(!rader.length){ console.log('✓ ' + rel + ' — inga träffar'); return; }
  console.log((rader.some(r => r.grad === 'FACIT') ? '✗ ' : '~ ') + rel);
  rader.forEach(r => console.log('    [' + r.grad + '] ' + r.rubrik + ' → ' + r.fraga + ' · svar "' + r.svar + '" · ' + r.delar));
});
console.log('\n' + filer + ' filer · FACIT ' + facit + ' · NÄRA ' + nara + ' · oberoende ' + oberoende);
console.log(facit ? '✗ EXEMPEL-SVEP RÖTT — exemplet är facit på ' + facit + ' ställen' : '✓ EXEMPEL-SVEP GRÖNT');
process.exit(facit ? 1 : 0);
