/* spec-fuzz-ak8-alg1.js — SPEC-GRINDEN för åttans algebraiska uttryck (åk8 k2 d1), bladens egna uppgifter.

   Bladen byggs i en sandlåda ur samma filer som sidan laddar (band-ak8-alg1.js, gen-ak8-alg1.js,
   blad-ak8-alg1.js), med det första fröet och 300 Nytt blad (fröet + 1000 · k, som knappen gör). Varje
   uppgift prövas mot sitt villkor i js/data/spec-villkor.js (BLAD).

   'ak8k2d1:biljett-popcorn' (Joachim 2026-11-11) — Tolka uttryck blad 1, uppgift 2:
     antalet ur uttrycket som eleven ser (3a + 2b): 2–4 biljetter, popcorn högst lika många
     priserna ur frågan (a = 100, b = 40): biljett 90/100/110/120 kr, popcorn 30/40/50 kr
     beloppet = antal · pris, räknat oberoende
   --sabba pris    lägger 109 kr bland biljettpriserna i bandet → ska fälla
   --sabba antal   tar bort "popcorn högst lika många" i bandet → ska fälla

   KÖR:  node verktyg/spec-fuzz-ak8-alg1.js [--sabba pris|antal]     Exit 1 vid avvikelse. Noll nätväg. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const SPEC = require(path.join(ROOT, 'js/data/spec-villkor.js'));
const args = process.argv.slice(2), SABBA = v => args.includes('--sabba') && args.includes(v);
const NYTT = 300;

const S = { console: { log(){}, info(){}, warn(){}, error(){} }, Math: Math };
S.window = S; vm.createContext(S);
['js/data/band-ak8-alg1.js', 'js/motor/blad/gen-ak8-alg1.js', 'js/motor/blad/blad-ak8-alg1.js'].forEach(function(f){
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), S, { filename: path.basename(f) });
});
const A = S.BLAD_AK8_ALG1;
if(!A){ console.log('✗ blad-ak8-alg1.js gav inget BLAD_AK8_ALG1'); process.exit(1); }
if(SABBA('pris')){ S.BAND_AK8_ALG1.BAND.VAROR[1].prisVal[0].push(109); console.log('[SABBA pris: 109 kr bland biljettpriserna]\n'); }
if(SABBA('antal')){ S.BAND_AK8_ALG1.BAND.VAROR[1].antalHogstForsta = false; S.BAND_AK8_ALG1.BAND.VAROR[1].antal = undefined; console.log('[SABBA antal: popcorn inte längre högst lika många]\n'); }

let brott = 0;
const fel = m => { brott++; if(brott <= 20) console.log('  ✗ ' + m); };
console.log('SPEC-FUZZ ÅK8 ALG1 — åttans algebraiska uttryck, bladens egna uppgifter (första fröet + ' + NYTT + ' Nytt blad)\n');

const V = SPEC.BLAD && SPEC.BLAD['ak8k2d1:biljett-popcorn'];
if(!V){ fel('spec-villkor.js saknar BLAD[ak8k2d1:biljett-popcorn]'); }
else {
  const fore = brott, sett = { antal: {}, pris: {} };
  let uppg = 0;
  for(let k = 0; k <= NYTT; k++){
    const b = A.BLAD[V.blad](A.FRON[V.blad] + 1000 * k), g = b.grupper[V.grupp - 1], vad = k ? 'Nytt blad ' + k : 'första bladet';
    if(!g || !/biljett/.test(g.rubrik)){ fel(vad + ': uppgift ' + V.grupp + ' är inte biljett och popcorn ("' + (g && g.rubrik) + '")'); continue; }
    const m1 = /uttrycket\s+(\d*)a\s*\+\s*(\d*)b\b/.exec(g.rader[0].fraga || ''), m2 = /a = (\d+), b = (\d+)/.exec(g.rader[1].vansterText || '');
    if(!m1 || !m2){ fel(vad + ': kan inte läsa uppgiften ("' + (g.rader[0].fraga || '') + '" / "' + (g.rader[1].vansterText || '') + '")'); continue; }
    uppg++;
    const na = +(m1[1] || 1), nb = +(m1[2] || 1), pa = +m2[1], pb = +m2[2];
    sett.antal[na + '+' + nb] = 1; sett.pris[pa + '/' + pb] = 1;
    const tx = vad + ': ' + m1[0].replace('uttrycket ', '') + ', a = ' + pa + ', b = ' + pb;
    if(na < V.antal.forsta[0] || na > V.antal.forsta[1]) fel(tx + ' — ' + na + ' biljetter (ska vara ' + V.antal.forsta.join('–') + ')');
    if(V.antal.andraHogstForsta && nb > na) fel(tx + ' — ' + nb + ' popcorn till ' + na + ' biljetter (högst lika många)');
    if(V.pris.forsta.indexOf(pa) < 0) fel(tx + ' — biljettpriset ' + pa + ' kr (ska vara ' + V.pris.forsta.join('/') + ')');
    if(V.pris.andra.indexOf(pb) < 0) fel(tx + ' — popcornpriset ' + pb + ' kr (ska vara ' + V.pris.andra.join('/') + ')');
    if(g.rader[1].svar !== na * pa + nb * pb) fel(tx + ' — beloppet ' + g.rader[1].svar + ' ≠ ' + (na * pa + nb * pb));
  }
  console.log('  ' + (brott === fore ? '✓' : '✗') + ' Tolka uttryck blad 1, uppgift 2 (biljett och popcorn): ' + uppg + ' uppgifter · antal '
    + Object.keys(sett.antal).sort().join(' ') + ' · priser ' + Object.keys(sett.pris).length + ' par');
}

console.log('\n' + (brott ? '✗ SPEC-FUZZ ÅK8 ALG1 RÖD (' + brott + ')' : '✓ SPEC-FUZZ ÅK8 ALG1 GRÖN'));
process.exit(brott ? 1 : 0);
