/* uppst-band-fuzz.js — GRINDEN för uppställningsdrillarnas band (js/data/spec-villkor.js UPPST_BAND).
   Kör generatorn (js/motor/metod/uppstallning-band.js) per räknesätt × nivå i många omgångar och påstår:
     · facit-diff 0        — answer räknas om oberoende
     · spec-villkor 0      — varje uppgift håller bandet (UppstBand.kontrollera, oberoende av dragningen)
     · distinkt            — ingen uppgift två gånger i samma omgång
     · fördelning          — nivå 3: varje omgång innehåller alla profiler (perOmgang:'alla')
     · spridning           — varje omgång håller bandets spridning (UppstBand.kontrolleraOmgang: operander/förstaSteg/differens)
     · ombyggen            — hela omgången byggd om (fördelning + spridning), per omgång
     · förkastningstal     — dragningar per godkänd uppgift, per räknesätt/nivå och orsak (band vs struktur)
   Kör:  node verktyg/uppst-band-fuzz.js [--omgangar N] [--exempel]     (--exempel: tio uppgifter per räknesätt/nivå)
   Exit 0 = 0 avvikelser. Noll nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), vm = require('vm'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const OMG = (() => { const i = args.indexOf('--omgangar'); return i >= 0 ? parseInt(args[i + 1], 10) : 400; })();
const EXEMPEL = args.includes('--exempel');

// metod-karna (distinktOmgang) + band-modulen i en sandbox så samma kod körs som i browsern
const noop = () => {};
const elStub = { addEventListener: noop, appendChild: noop, querySelector: () => null, querySelectorAll: () => [], style: {}, classList: { add: noop, remove: noop, toggle: noop } };
const documentStub = { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createElement: () => elStub, body: elStub };
const sandbox = { window: { scrollTo: noop, addEventListener: noop, document: documentStub }, document: documentStub, console, Math, JSON, Object, Array, String, Number, Set, Map, parseInt, parseFloat, isNaN, require };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data/spec-villkor.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/motor/metod/metod-karna.js'), 'utf8').replace(/^\s*window\.[A-Za-z]+ = [^;]+;\s*$/gm, ''), sandbox);
sandbox.SPEC_VILLKOR = sandbox.window.SPEC_VILLKOR;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/motor/metod/uppstallning-band.js'), 'utf8'), sandbox);
const UB = sandbox.window.UppstBand, SV = sandbox.window.SPEC_VILLKOR;
if (typeof sandbox.distinktOmgang !== 'function') { console.error('distinktOmgang saknas i sandboxen'); process.exit(2); }

const RAKNE = Object.keys(SV.UPPST_BAND);
let fel = 0;
console.log('UPPST-BAND-FUZZ — ' + OMG + ' omgångar per räknesätt/nivå\n');
console.log('räknesätt   nivå  uppg   facit  band  dubbl  fördeln   drag/uppg  avslag (band | struktur | spridning:operand = A\' omdragen uppgift) · spridn = omgångar som bryter · ombyggen/omg   [fördeln = nivå 3/4: alla profiler i varje omgång; stegvis-krav räknas i band]');
RAKNE.forEach(rakne => {
  const band = SV.UPPST_BAND[rakne];
  Object.keys(band.nivaer).map(Number).forEach(niva => {   // alla nivåer i bandet (fyra där decimaltal finns)
    const v = SV.uppstBand(rakne, niva), n = band.omgang || 5;
    let uppg = 0, facitFel = 0, bandFel = 0, dubbl = 0, fordelnFel = 0, spridFel = 0, ex = [];
    for (let o = 0; o < OMG; o++) {
      const omg = UB.omgang(rakne, niva, n);
      if (omg.length !== n) { bandFel++; console.log('   ! kort omgång ' + rakne + '/' + niva + ': ' + omg.length); }
      const keys = new Set(), profiler = new Set();
      omg.forEach(t => {
        uppg++;
        const facit = rakne === 'add' ? t.a + t.b : (rakne === 'sub' || rakne === 'oka-minska' || rakne === 'bakifran') ? t.a - t.b : rakne === 'div' ? t.N / t.n : t.m * t.d;
        if (facit !== t.answer) facitFel++;
        const brott = UB.kontrollera(rakne, niva, t); if (brott.length) { bandFel++; if (bandFel <= 3) console.log('   ✗ ' + rakne + '/' + niva + ': ' + brott.join(' · ')); }
        if (keys.has(t.display)) dubbl++; keys.add(t.display); profiler.add(t.profil);
        if (ex.length < 10 && o < 2) ex.push(t.display + ' = ' + (t.dec != null && (t.answerDec || t.dec) ? UB.decStr(t.answer, t.answerDec != null ? t.answerDec : t.dec) : t.answer));
      });
      if (v.profiler > 1 && v.perOmgang === 'alla' && profiler.size < v.profiler) fordelnFel++;
      const sb = UB.kontrolleraOmgang(rakne, niva, omg); if (sb.length) { spridFel++; if (spridFel <= 3) console.log('   ✗ spridning ' + rakne + '/' + niva + ': ' + sb[0].slice(0, 160)); }
      // stegvis (mult-fler nivå 4): lilla faktorn heltal före `fran`, decimal från och med
      if (v.stegvis) omg.forEach((t, i) => { const ska = i + 1 >= v.stegvis.fran ? v.stegvis.litenDecimaler : 0; if ((t.dDec || 0) !== ska) { bandFel++; if (bandFel <= 3) console.log('   ✗ stegvis ' + rakne + '/' + niva + ' plats ' + (i + 1) + ': ' + t.display); } });
    }
    const s = UB.stat[rakne][niva];
    const avsl = Object.keys(s.avslag).map(k => k + ' ' + s.avslag[k]).join(', ') || '—';
    const drag = (s.dragningar / Math.max(1, s.godkanda)).toFixed(2);
    fel += facitFel + bandFel + dubbl + fordelnFel + spridFel;
    const omb = Object.keys(s.ombyggen || {}).map(k => k.replace('spridning:', '') + ' ' + (s.ombyggen[k] / OMG).toFixed(2)).join(', ') || '—';
    console.log(rakne.padEnd(11) + ' ' + String(niva).padEnd(5) + String(uppg).padEnd(6) + ' ' + String(facitFel).padEnd(6) + ' ' + String(bandFel).padEnd(5) + ' ' + String(dubbl).padEnd(6) + ' ' + String(fordelnFel).padEnd(9) + ' ' + drag.padEnd(10) + ' ' + avsl + '   spridn ' + String(spridFel).padEnd(4) + ' ombyggen/omg: ' + omb);
    if (EXEMPEL) console.log('      ex: ' + ex.join('   '));
  });
});
console.log('\n── ' + (fel === 0 ? 'GRIND GRÖN' : 'GRIND RÖD: ' + fel + ' avvikelser') + ' ──');
process.exit(fel > 0 ? 1 : 0);
