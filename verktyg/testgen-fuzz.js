/* testgen-fuzz.js — GRINDEN mot eviga generatorer i provbyggarens testgeneratorer (order 2026-09-21).
   Bakgrund: prio-potenser-paren hade `while(res>500){ e=2; … }` som blev evig för inner ≥ 23; montera() provkör
   VARJE generator vid sidladdning → ~17 % av alla laddningar av åttans testsidor frös. Ingen grind körde
   generatorerna många gånger, och delkapitel-grinden laddade sidan en gång (oseedat) — grön av tur.
   Här: ramen laddas i headless Chromium med en --pre som fångar config.generators ur ProvbyggarMotor.montera,
   sedan anropas varje generator N gånger med seedad slump. Före varje anrop loggas generatorns namn med
   console.log; cdp-kor skriver ut de sista loggraderna när sidan inte svarar → den hängande pekas ut.
   Kör:  node verktyg/testgen-fuzz.js [--ram ak8-k1-ram.html] [--n 400] [--fron 5]     (default: alla fyra ramar)
   Sidans tidsgräns är 90 s per ram; kolumnen "tyngst" visar ms/anrop (0,1 ms är normalt — en generator som
   närmar sig sekunder är en loop som nästan aldrig blir klar).
   Exit 0 = alla generatorer klara, inga JS-fel. Noll nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const N = parseInt(opt('--n', '400'), 10), FRON = parseInt(opt('--fron', '5'), 10);   // 400 × 5 ≈ 180 000 anrop per ram (~15 s); --n 2000 för att jaga sällsynta hängningar
const RAMAR = opt('--ram', null) ? [opt('--ram')] : ['ak7-k1-ram.html', 'ak7-k2-ram.html', 'ak7-k3-ram.html', 'ak8-k1-ram.html'];
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PRE = `(function(){
  var s = 0x51ED; var n = 0;
  Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__reseed = function(x){ s = x | 0; };
  window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  // fånga generatorerna när ramen monterar provbyggaren: setter-fälla på window.ProvbyggarMotor (montera körs synkront
  // i ramens inline-script, ett intervall hinner inte emellan)
  var Mv; Object.defineProperty(window, 'ProvbyggarMotor', { configurable: true, get: function(){ return Mv; },
    set: function(M){ Mv = M; if(M && M.montera && !M.__fangad){ M.__fangad = true; var m0 = M.montera; M.montera = function(cfg){ var G = cfg.generators; window.__GENS = G;
        // varje generator omsluts: namnet loggas FÖRE anropet — då pekas även monteringens egen provkörning ut om den hänger
        Object.keys(G).forEach(function(ko){ ['snabb', 'problem'].forEach(function(kind){ (G[ko][kind] || []).forEach(function(gen, gi){ var namn = ko + '/' + kind + '#' + gi; G[ko][kind][gi] = function(){ if(window.__sistGen !== namn){ window.__sistGen = namn; console.log('GEN ' + namn); } return gen.apply(this, arguments); }; }); }); });   // loggar bara vid BYTE av generator: 200 000 console-rader över CDP tog själva > 90 s och gav falska "HÄNGDE I"
        return m0.apply(this, arguments); }; } } });
})();`;
const PROBE = `(function(){
  var G = window.__GENS; if(!G) return { fel: 'inga generatorer fångade' };
  var N = ${N}, FRON = ${FRON}, antal = 0, tomma = [], kast = [], tid = [];
  Object.keys(G).forEach(function(ko){ ['snabb', 'problem'].forEach(function(kind){ (G[ko][kind] || []).forEach(function(gen, gi){
    var namn = ko + '/' + kind + '#' + gi; antal++;
    var noll = 0, t0 = Date.now();
    for(var f = 0; f < FRON; f++){ window.__reseed(0x51ED + f * 7919 + gi * 131);
      for(var i = 0; i < N; i++){ try { var r = gen(new Set()); if(!r) noll++; } catch(e){ kast.push(namn + ': ' + e.message); break; } } }
    if(noll === N * FRON) tomma.push(namn); tid.push([namn, Date.now() - t0]);
  }); }); });
  tid.sort(function(a, b){ return b[1] - a[1]; });
  return { generatorer: antal, anrop: antal * N * FRON, tomma: tomma, kast: kast, onerr: window.__onerr, langsamma: tid.slice(0, 3).map(function(x){ return x[0] + ' ' + (x[1] / (N * FRON)).toFixed(2) + ' ms/anrop'; }) };
})()`;

let fel = 0;
console.log('TESTGEN-FUZZ — ' + N + ' anrop × ' + FRON + ' frön per generator\n');
RAMAR.forEach(ram => {
  const tmp = path.join(os.tmpdir(), 'testgen-' + process.pid + '-' + ram + '.js'), pre = path.join(os.tmpdir(), 'testgen-pre-' + process.pid + '.js');
  fs.writeFileSync(tmp, PROBE); fs.writeFileSync(pre, PRE);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, ram)), tmp, '--pre', pre, '--wait', '2500', '--timeout', '90000', '--console'], { encoding: 'utf8', timeout: 150000 });
  const rad = (r.stdout || '').trim().split('\n').pop() || '';
  let ut = null; try { ut = JSON.parse(rad); } catch(e){}
  if(!ut){
    fel++; const alla = (r.stderr || '').match(/console: GEN [^\n]+/g) || [], sista = alla.pop();
    console.log('✗ ' + ram + ': sidan svarade inte — ' + (sista ? 'HÄNGDE I ' + sista.replace('console: ', '') + (alla.length <= 1 ? ' (redan vid montering — provkörningen av generatorerna)' : '') : (r.stderr || '').trim().split('\n').pop()));
    return;
  }
  const bad = (ut.fel ? 1 : 0) + (ut.kast || []).length + (ut.onerr || []).length;
  fel += bad;
  console.log((bad ? '✗ ' : '✓ ') + ram + ': ' + (ut.generatorer || 0) + ' generatorer · ' + (ut.anrop || 0) + ' anrop' + (ut.tomma && ut.tomma.length ? ' · alltid tomma: ' + ut.tomma.join(', ') : '') + (ut.kast && ut.kast.length ? ' · KASTADE: ' + ut.kast.join(' | ') : '') + (ut.onerr && ut.onerr.length ? ' · onerror: ' + ut.onerr.join(' | ') : '') + (ut.fel ? ' · ' + ut.fel : '') + ' · tyngst: ' + (ut.langsamma || []).join(', '));
  try { fs.unlinkSync(tmp); fs.unlinkSync(pre); } catch(e){}
});
console.log('\n' + (fel ? '✗ TESTGEN-FUZZ RÖD (' + fel + ')' : '✓ TESTGEN-FUZZ GRÖN'));
process.exit(fel ? 1 : 0);
