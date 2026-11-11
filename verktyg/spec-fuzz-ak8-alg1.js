/* spec-fuzz-ak8-alg1.js — SPEC-GRINDEN för åttans algebraiska uttryck (åk8 k2 d1), bladens egna uppgifter.

   Bladen byggs i en sandlåda ur samma filer som sidan laddar (band-ak8-alg1.js, gen-ak8-alg1.js,
   blad-ak8-alg1.js), med det första fröet och 300 Nytt blad (fröet + 1000 · k, som knappen gör). Varje
   uppgift prövas mot sitt villkor i js/data/spec-villkor.js (BLAD).

   VARUPAREN (typ 'varupar', Joachim 2026-11-11) — biljett/popcorn, smörgås/juice, bok/penna, kaka/te:
     antalet ur uttrycket som eleven ser (3a + 2b), priserna ur frågan (a = 100, b = 40), mot villkorets
     antal och prislistor; beloppet = antal · pris, räknat oberoende; facitOrd (popcorn: "bägare popcorn")
     täckning: färre av den andra varan (andraFarre) och lika antal (lika) ska förekomma
   'ak8k2d1:person-langd' — Skriva blad 1, grupp 2: svaret med rubrikens bokstav (a), bara längre/kortare
   'ak8k2d1:valruta-ganger' — Skriva blad 1, valrutan: "hon får 3 gånger så många", inget "till"
   --sabba pris    lägger 109 kr bland biljettpriserna i bandet → ska fälla
   --sabba antal   tar bort "popcorn högst lika många" i bandet → ska fälla
   --sabba lika    alltid 2 biljetter (aldrig färre popcorn) → täckningen ska fälla
   --sabba smorgas 37 kr bland smörgåspriserna → ska fälla
   --sabba bok     upp till 8 pennor → ska fälla
   --sabba kaka    te inte längre högst lika många som kakorna → ska fälla
   --sabba olika   lika antal förbjudet igen → täckningen ska fälla
   --sabba facit   "två popcorn" i facit igen → ska fälla
   --sabba person  personens längd utan rubrikens bokstav → ska fälla
   --sabba till    "… så många till" tillbaka i valrutan → ska fälla

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
if(SABBA('lika')){ S.BAND_AK8_ALG1.BAND.VAROR[1].antal = [2, 2]; console.log('[SABBA lika: alltid 2 biljetter → aldrig färre popcorn]\n'); }
if(SABBA('smorgas')){ S.BAND_AK8_ALG1.BAND.VAROR[0].prisVal[0].push(37); console.log('[SABBA smorgas: 37 kr bland smörgåspriserna]\n'); }
if(SABBA('bok')){ S.BAND_AK8_ALG1.BAND.VAROR[2].antal2 = [2, 8]; console.log('[SABBA bok: upp till 8 pennor]\n'); }
if(SABBA('kaka')){ S.BAND_AK8_ALG1.BAND.VAROR[4].antalHogstForsta = false; console.log('[SABBA kaka: te inte längre högst lika många som kakorna]\n'); }
if(SABBA('olika')){ const _t = S.GEN_AK8_ALG1.tolkaRad; S.GEN_AK8_ALG1.tolkaRad = function(r, v){ let x; do { x = _t(r, v); } while(/^(\d*)[a-z] \+ \1[a-z]$/.test(x.uttryck)); return x; }; console.log('[SABBA olika: lika antal förbjudet igen]\n'); }
if(SABBA('facit')){ S.BAND_AK8_ALG1.BAND.VAROR[1].flertal[1] = 'popcorn'; console.log('[SABBA facit: "två popcorn" i facit igen]\n'); }
const G0 = S.GEN_AK8_ALG1, skrivaOrig = G0.skrivaRad;
if(SABBA('person')){ G0.skrivaRad = function(r, v){ return skrivaOrig(r, v); }; console.log('[SABBA person: personens längd utan rubrikens bokstav]\n'); }
if(SABBA('till')){ G0.skrivaRad = function(r, v, b){ const x = skrivaOrig(r, v, b); if(v === 'valruta' && /så många$/.test(x.fraga)) x.fraga += ' till'; return x; }; console.log('[SABBA till: "… så många till" tillbaka]\n'); }

let brott = 0;
const fel = m => { brott++; if(brott <= 20) console.log('  ✗ ' + m); };
console.log('SPEC-FUZZ ÅK8 ALG1 — åttans algebraiska uttryck, bladens egna uppgifter (första fröet + ' + NYTT + ' Nytt blad)\n');

// VARUPAREN (typ 'varupar'): antal ur uttrycket eleven ser, priser ur frågan, beloppet räknat oberoende.
const VARUPAR = Object.keys(SPEC.BLAD || {}).filter(function(n){ return SPEC.BLAD[n].typ === 'varupar'; });
if(VARUPAR.indexOf('ak8k2d1:biljett-popcorn') < 0) fel('spec-villkor.js saknar BLAD[ak8k2d1:biljett-popcorn]');
VARUPAR.forEach(function(namn){
  const V = SPEC.BLAD[namn], fore = brott, sett = { antal: {}, pris: {} }, plats = (V.blad.indexOf('tolka') === 0 ? 'Tolka uttryck blad ' : V.blad + ' ') + V.blad.slice(-1) + ', uppgift ' + V.grupp;
  let uppg = 0;
  for(let k = 0; k <= NYTT; k++){
    const b = A.BLAD[V.blad](A.FRON[V.blad] + 1000 * k), g = b.grupper[V.grupp - 1], vad = plats + ', ' + (k ? 'Nytt blad ' + k : 'första bladet');
    if(!g || g.rubrik.indexOf(V.rubrikOrd) < 0){ fel(vad + ': uppgiften är inte "' + V.rubrikOrd + '" ("' + (g && g.rubrik) + '")'); continue; }
    const m1 = /uttrycket\s+(\d*)([a-z])\s*\+\s*(\d*)([a-z])\b/.exec(g.rader[0].fraga || ''), m2 = /([a-z]) = (\d+), ([a-z]) = (\d+)/.exec(g.rader[1].vansterText || '');
    if(!m1 || !m2){ fel(vad + ': kan inte läsa uppgiften ("' + (g.rader[0].fraga || '') + '" / "' + (g.rader[1].vansterText || '') + '")'); continue; }
    uppg++;
    const na = +(m1[1] || 1), nb = +(m1[3] || 1), pa = +m2[2], pb = +m2[4];
    sett.antal[na + '+' + nb] = 1; sett.pris[pa + '/' + pb] = 1;
    const tx = vad + ': ' + m1[0].replace('uttrycket ', '') + ', ' + m2[0];
    if(na < V.antal.forsta[0] || na > V.antal.forsta[1]) fel(tx + ' — ' + na + ' av den första varan (ska vara ' + V.antal.forsta.join('–') + ')');
    if(V.antal.andraHogstForsta && nb > na) fel(tx + ' — ' + nb + ' av den andra varan till ' + na + ' (högst lika många)');
    if(V.antal.andra && (nb < V.antal.andra[0] || nb > V.antal.andra[1])) fel(tx + ' — ' + nb + ' av den andra varan (ska vara ' + V.antal.andra.join('–') + ')');
    if(V.pris.forsta.indexOf(pa) < 0) fel(tx + ' — priset ' + pa + ' kr (ska vara ' + V.pris.forsta.join('/') + ')');
    if(V.pris.andra.indexOf(pb) < 0) fel(tx + ' — priset ' + pb + ' kr (ska vara ' + V.pris.andra.join('/') + ')');
    if(g.rader[1].svar !== na * pa + nb * pb) fel(tx + ' — beloppet ' + g.rader[1].svar + ' ≠ ' + (na * pa + nb * pb));
    if(V.facitOrd && String(g.rader[0].svar).indexOf(V.facitOrd) < 0) fel(tx + ' — facit "' + g.rader[0].svar + '" saknar "' + V.facitOrd + '"');
  }
  const par = Object.keys(sett.antal).map(function(k){ return k.split('+').map(Number); });
  if(V.tackning && V.tackning.andraFarre && !par.some(function(p){ return p[1] < p[0]; })) fel(plats + ': inget blad har färre av den andra varan (' + Object.keys(sett.antal).sort().join(' ') + ')');
  if(V.tackning && V.tackning.lika && !par.some(function(p){ return p[1] === p[0]; })) fel(plats + ': inget blad har lika antal (' + Object.keys(sett.antal).sort().join(' ') + ')');
  console.log('  ' + (brott === fore ? '✓' : '✗') + ' ' + plats + ' (' + V.rubrikOrd + '): ' + uppg + ' uppgifter · antal '
    + Object.keys(sett.antal).sort().join(' ') + ' · priser ' + Object.keys(sett.pris).length + ' par');
});

// 'ak8k2d1:person-langd' — "En person är a cm lång …": svaret med rubrikens bokstav, bara längre/kortare
const P = SPEC.BLAD && SPEC.BLAD['ak8k2d1:person-langd'];
if(!P){ fel('spec-villkor.js saknar BLAD[ak8k2d1:person-langd]'); }
else {
  const fore = brott; let rader = 0;
  for(let k = 0; k <= NYTT; k++){
    const g = A.BLAD[P.blad](A.FRON[P.blad] + 1000 * k).grupper[P.grupp - 1], vad = k ? 'Nytt blad ' + k : 'första bladet';
    if(!g || g.rubrik.indexOf('En person är ' + P.bokstav + ' cm lång') !== 0){ fel(vad + ': grupp ' + P.grupp + ' är inte personens längd ("' + (g && g.rubrik) + '")'); continue; }
    g.rader.forEach(function(r){
      rader++;
      if(!P.fragor.some(function(f){ return String(r.fraga).slice(-f.length) === f; })) fel(vad + ': "' + r.fraga + '" (bara ' + P.fragor.join(' / ') + ')');
      const bokst = (String(r.svar).match(/[a-z]/g) || []).filter(function(c, i, a){ return a.indexOf(c) === i; });
      if(bokst.length !== 1 || bokst[0] !== P.bokstav) fel(vad + ': "' + r.fraga + ' → ' + r.svar + '" (bokstaven ska vara ' + P.bokstav + ')');
    });
  }
  console.log('  ' + (brott === fore ? '✓' : '✗') + ' Skriva uttryck blad 1, grupp 2 (personens längd): ' + rader + ' rader, bokstaven ' + P.bokstav + ', bara ' + P.fragor.join(' / '));
}

// 'ak8k2d1:valruta-ganger' — valrutan: "hon får 3 gånger så många", inte "… till"
const VR = SPEC.BLAD && SPEC.BLAD['ak8k2d1:valruta-ganger'];
if(!VR){ fel('spec-villkor.js saknar BLAD[ak8k2d1:valruta-ganger]'); }
else {
  const fore = brott; let rader = 0, ganger = 0;
  for(let k = 0; k <= NYTT; k++){
    const g = A.BLAD[VR.blad](A.FRON[VR.blad] + 1000 * k).grupper[VR.grupp - 1], vad = k ? 'Nytt blad ' + k : 'första bladet';
    g.rader.forEach(function(r){
      rader++;
      if(/gånger|dubbelt/.test(r.fraga)) ganger++;
      if(new RegExp('\\b' + VR.ejOrd + '\\b').test(r.fraga)) fel(vad + ': "' + r.fraga + '" (ordet "' + VR.ejOrd + '" ska bort)');
    });
  }
  console.log('  ' + (brott === fore ? '✓' : '✗') + ' Skriva uttryck blad 1, valrutan: ' + rader + ' rader, varav ' + ganger + ' "gånger/dubbelt så många" — inget "' + VR.ejOrd + '"');
}

console.log('\n' + (brott ? '✗ SPEC-FUZZ ÅK8 ALG1 RÖD (' + brott + ')' : '✓ SPEC-FUZZ ÅK8 ALG1 GRÖN'));
process.exit(brott ? 1 : 0);
