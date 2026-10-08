/* test-tacker-ova.js — VAKTEN: färdiga test SPEGLAR träningen (öva-bladen), åk7 k1 (order 2026-10-08).
   ────────────────────────────────────────────────────────────────────────────────────────────────
   REGEL 1 — ALLT MED. Varje uppgiftstyp (grupp) i delkapitlets öva-blad ska finnas i något test.
     a) Bladen läses ur den RIKTIGA delkapitel-sidan (headless): rubrikerna i bladens ordning jämförs
        med K1_FARDIGA.TRANING[del]. En grupp i öva som saknas/flyttats i listan → ✗.
     b) Testen byggs via ramens riktiga deeplink (?view=test-fardigt&del=dN&test=M) och sedan ×N via
        resultatvyns "Nytt test"-väg (byggFardigt(fardigt)). Varje kopplad generator måste ge en
        fråga i varje bygge → annars ✗ (tappat moment).
     Grupper utan testgenerator är DEKLARERADE i listan ([rubrik, null, 'skäl']) och skrivs ut som
     LUCKA — de faller inte tyst. 'TOM' = bladets platshållare ("Kommer snart"), ingen uppgift.
   REGEL 2 — TRÄNINGENS ORDNING. Varje frågas generator har ett index = dess första plats i öva
     (blad för blad, grupp för grupp). I ett test ska indexen vara strikt stigande, och test M+1 ska
     börja efter där test M slutar. En fråga före en lättare (tidigare) → ✗. Fråga vars generator inte
     finns i träningen → ✗ (testet ska spegla träningen, inget utanför).
   Kör:  node verktyg/test-tacker-ova.js [--del d3] [--n 20]
   Exit 0 = båda reglerna hålls för alla delkapitel. Noll nätväg, ingen källfil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const N = parseInt(opt('--n', '20'), 10);
const DEL_DIR = { d1: 'd1-positionssystem', d2: 'd2-fyraraknesatt', d3: 'd3-negativa-tal', d4: 'd4-brak-decimal',
  d5: 'd5-tiopotenser', d6: 'd6-multiplikation', d7: 'd7-division', d8: 'd8-avrundning' };
const DELAR = opt('--del', null) ? [opt('--del')] : Object.keys(DEL_DIR);
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
const norm = s => String(s || '').replace(/\s+/g, ' ').trim();

function kor(url, probe, extra) {
  const tmp = path.join(os.tmpdir(), 'tto-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.js');
  fs.writeFileSync(tmp, probe);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), url, tmp].concat(extra || []), { encoding: 'utf8', timeout: 150000 });
  try { fs.unlinkSync(tmp); } catch (e) {}
  const rad = (r.stdout || '').trim().split('\n').pop() || '';
  try { return JSON.parse(rad); } catch (e) { return { fel: 'sidan svarade inte: ' + ((r.stderr || '').trim().split('\n').pop() || rad) }; }
}

// ── Öva-bladen ur delkapitel-sidan. d1: stencil-register (BLAD-listans reg:'…'), övriga: renderade blad.
function ovaProbe(regs) {
  return `(function(){
  var REGS = ${JSON.stringify(regs)}, blad = [];
  if(REGS.length){
    if(!window.STORLEK_VARIANTER && window.STORLEK_A) window.STORLEK_VARIANTER = { A: STORLEK_A, B: STORLEK_B };
    REGS.forEach(function(r){ var reg = window[r] || {}; Object.keys(reg).forEach(function(k){
      blad.push({ titel: reg[k].titel, grupper: (reg[k].grupper || []).map(function(g){ return g.rubrik; }) }); }); });
  } else {
    var p = document.querySelector('.tab-panel[data-panel="ova"]');
    [].forEach.call(p ? p.querySelectorAll('.blad-mount .ovn-sheet') : [], function(s){
      var t = s.querySelector('.ovn-title, h2, h3');
      blad.push({ titel: t ? t.textContent : '', grupper: [].map.call(s.querySelectorAll('.ovn-grupp-rubrik'), function(r){ return r.textContent.replace(/^\\s*\\d+\\.\\s*/, ''); }) });
    });
  }
  return { blad: blad, traning: (window.K1_FARDIGA && K1_FARDIGA.TRANING) || null,
           tester: window.K1_FARDIGA ? K1_FARDIGA.tester(${JSON.stringify('__DEL__')}) : [] };
})()`;
}

// ── Ett test byggt via ramens deeplink + N "Nytt test"-byggen (samma väg som resultatvyns knapp).
const TEST_PROBE = `(function(){
  var seq = function(){ return PB.state.test.questions.map(function(q){ return q.generator; }); };
  var ut = [seq()], f = PB.state.test.fardigt;
  for(var i = 1; i < ${N}; i++){ PB.byggFardigt(f); ut.push(seq()); f = PB.state.test.fardigt; }
  return { byggen: ut, onerr: window.__onerr || [] };
})()`;
const PRE = `(function(){ var s = 0x7E57; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message); }); })();`;
const preFil = path.join(os.tmpdir(), 'tto-pre-' + process.pid + '.js'); fs.writeFileSync(preFil, PRE);

let fel = 0, luckorTot = 0;
const visade = new Set();   // samma brott i flera byggen skrivs en gång (räknas varje gång)
const brott = (s) => { fel++; const k = s.replace(/bygge \d+/, 'bygge *'); if (!visade.has(k)) { visade.add(k); console.log('  ✗ ' + s); } };
console.log('TEST-TÄCKER-ÖVA — åk7 k1: allt i träningen med, i träningens ordning (' + N + ' byggen per test)\n');

for (const del of DELAR) {
  const sida = path.join(ROOT, 'ak7/k1', DEL_DIR[del], 'index.html');
  const html = fs.readFileSync(sida, 'utf8');
  const regs = [...html.matchAll(/reg:\s*'([A-Z_]+_VARIANTER)'/g)].map(m => m[1]);
  const ova = kor(fileUrl(sida), ovaProbe(regs).replace('"__DEL__"', JSON.stringify(del)), ['--wait', '2500']);
  console.log('── ' + del + ' (' + DEL_DIR[del] + ') ──');
  if (ova.fel || !ova.traning) { brott(ova.fel || 'K1_FARDIGA.TRANING saknas på sidan'); continue; }
  const lista = ova.traning[del];
  if (!lista) { brott('ingen TRANING-lista för ' + del); continue; }

  // REGEL 1a — varje öva-grupp har en rad i listan, i samma ordning.
  const nBlad = Math.max(ova.blad.length, lista.length);
  let grupperTot = 0; const luckor = [];
  for (let b = 0; b < nBlad; b++) {
    const sb = ova.blad[b], lb = lista[b];
    if (!sb) { brott('listan har blad «' + lb.blad + '» som inte finns i öva'); continue; }
    if (!lb) { brott('öva-bladet «' + norm(sb.titel) + '» saknas i TRANING (' + sb.grupper.length + ' grupper otestade)'); continue; }
    if (norm(sb.titel) !== norm(lb.blad)) brott('blad ' + (b + 1) + ': öva «' + norm(sb.titel) + '» ≠ listans «' + lb.blad + '»');
    const nG = Math.max(sb.grupper.length, lb.grupper.length);
    for (let g = 0; g < nG; g++) {
      const sr = sb.grupper[g], lr = lb.grupper[g];
      if (sr == null) { brott('«' + lb.blad + '» grupp ' + (g + 1) + ' «' + lr[0] + '» finns i listan men inte i öva'); continue; }
      grupperTot++;
      if (!lr) { brott('«' + norm(sb.titel) + '» grupp ' + (g + 1) + ' «' + norm(sr) + '» saknar testkoppling'); continue; }
      if (norm(sr) !== norm(lr[0])) brott('«' + lb.blad + '» grupp ' + (g + 1) + ': öva «' + norm(sr) + '» ≠ listans «' + lr[0] + '»');
      if (!lr[1] && lr[2] !== 'TOM') luckor.push(lb.blad + ' › ' + lr[0] + ' — ' + (lr[2] || 'inget skäl angivet'));
      if (!lr[1] && !lr[2]) brott('«' + lb.blad + '» grupp ' + (g + 1) + ': null utan skäl');
    }
  }
  // Träningsindex per generator = ordningstal för dess första förekomst (två generatorer i samma grupp
  // får grupp-ordningen i listan); plats = öva-gruppens löpnummer, för utskriften.
  const idx = {}, plats = {}; let i = 0, gnr = 0;
  lista.forEach(b => b.grupper.forEach(g => { gnr++; [].concat(g[1] || []).forEach(n => { if (!(n in idx)) { idx[n] = i++; plats[n] = gnr; } }); }));
  const kopplade = Object.keys(idx);

  // REGEL 1b + 2 — bygg varje test via ramen.
  const tester = ova.tester || [];
  if (kopplade.length && !tester.length) brott('inga test byggs för ' + del + ' trots ' + kopplade.length + ' kopplade generatorer');
  const sett = new Set(); let forraSlut = -1;
  tester.forEach((t, ti) => {
    const url = fileUrl(path.join(ROOT, 'ak7-k1-ram.html')) + '?view=test-fardigt&del=' + del + '&test=' + (ti + 1) + '&seed=' + (11 + ti);
    const r = kor(url, TEST_PROBE, ['--pre', preFil, '--vanta-pa', "typeof PB!=='undefined' && PB.state.test && PB.state.test.questions && PB.state.test.questions.length", '--timeout', '90000']);
    if (r.fel) { brott('test ' + (ti + 1) + ' «' + t.titel + '»: ' + r.fel); return; }
    (r.onerr || []).forEach(e => brott('test ' + (ti + 1) + ': JS-fel ' + e));
    let forsta = null, sista = null;
    r.byggen.forEach((seq, bi) => {
      // varje generator i testets lista måste ge en fråga i VARJE bygge
      t.gens.forEach(g => { if (seq.indexOf(g) < 0) brott('test ' + (ti + 1) + ' «' + t.titel + '» bygge ' + (bi + 1) + ': momentet ' + g + ' saknas'); });
      let prev = -1, prevG = null;
      seq.forEach((g, qi) => {
        sett.add(g);
        if (!(g in idx)) { brott('test ' + (ti + 1) + ' fråga ' + (qi + 1) + ': ' + g + ' finns inte i träningen'); return; }
        if (idx[g] <= prev) brott('test ' + (ti + 1) + ' «' + t.titel + '» bygge ' + (bi + 1) + ': fråga ' + (qi + 1) + ' (' + g + ', öva-grupp ' + plats[g] + ') står efter ' + prevG + ' (öva-grupp ' + plats[prevG] + ') — bruten ordning: ' + seq.join(' → '));
        if (idx[g] > prev) { prev = idx[g]; prevG = g; }
      });
      if (bi === 0 && seq.length) { forsta = idx[seq[0]]; sista = prev; }
    });
    if (forsta != null && forsta <= forraSlut) brott('test ' + (ti + 1) + ' börjar på en tidigare öva-uppgift än där test ' + ti + ' slutade');
    if (sista != null) forraSlut = sista;
    console.log('  ' + (ti + 1) + '. ' + t.titel + ': ' + (r.byggen[0] || []).join(' → ') + '  (' + r.byggen.length + ' byggen)');
  });
  const saknas = kopplade.filter(g => !sett.has(g));
  if (saknas.length) brott('träningsmoment som inget test tar med: ' + saknas.join(', '));
  const testade = kopplade.length - saknas.length;
  console.log('  öva: ' + ova.blad.length + ' blad, ' + grupperTot + ' grupper · ' + kopplade.length + ' testgeneratorer kopplade, ' + testade + ' med i testen'
    + (luckor.length ? ' · ' + luckor.length + ' LUCKA (ingen testgenerator):' : ''));
  luckor.forEach(l => console.log('    ⚠ LUCKA ' + l));
  luckorTot += luckor.length;
}
try { fs.unlinkSync(preFil); } catch (e) {}
console.log('\n' + (fel ? '✗ TEST-TÄCKER-ÖVA RÖD (' + fel + ' brott)' : '✓ TEST-TÄCKER-ÖVA GRÖN') + (luckorTot ? ' · ' + luckorTot + ' deklarerade luckor (grupper utan testgenerator)' : ''));
process.exit(fel ? 1 : 0);
