/* uppgiftssidor.js — UPPGIFTSSIDORNA I NYTT FORMAT, delade av uppgift-grind.js och keypad-grind.js (Joachim 2026-11-27).

   Sidan hittas på SKALET, inte på namnet (som momentsida-grind.js sedan cfc1c0d): varje uppgift.html under ak7, ak8 och
   ak9 som laddar js/motor/arbetsyta/arbetsyta.js. Förr bara …-nyformat/uppgift.html — ak7/k4/d1-procent/uppgift.html
   (ingen gammal sida bredvid) mättes då inte alls, och grindarna blev gröna med "0 sidor".

   Ur sidans egna datafiler: varje moment, blad och variant (?moment=…&blad=…, MOMENTEN-kartan) och varje författat
   test (?test=…, BLAD_*_TEST.TESTER) — ett nytt blad eller test mäts utan att listan här ändras.
   preLas(forst): pre-skriptet — grindens egen rad (forst), sedan NivaRad:s nyckel <prefix>_naddNiva<n>_<id> för varje moment på sidan, satt innan sidans spärr läser den.
   Ingen nätväg, ingen fil ändras (utom pre-skriptet i os.tmpdir()). */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');

function arSkal(fil){ try { return /js\/motor\/arbetsyta\/arbetsyta\.js/.test(fs.readFileSync(fil, 'utf8')); } catch(e){ return false; } }
function sidfiler(){
  const hitta = d => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).reduce((u, e) => {
    const r = d + '/' + e.name;
    if(e.isDirectory() && e.name !== 'Arkiv' && !e.name.startsWith('.')) return u.concat(hitta(r));
    if(e.name === 'uppgift.html' && arSkal(path.join(ROOT, r))) u.push(r);
    return u; }, []);
  return ['ak7', 'ak8', 'ak9'].filter(a => fs.existsSync(path.join(ROOT, a))).reduce((u, a) => u.concat(hitta(a)), []).sort();
}
function sidor(){
  const ut = [];
  sidfiler().forEach(sida => {
    const html = fs.readFileSync(path.join(ROOT, sida), 'utf8');
    const karta = /MOMENTEN\s*=\s*\{([^}]*)\}/.exec(html);
    const test = /window\.(BLAD_\w+_TEST)\b/.exec(html);
    if(!karta && !test) return;
    const ctx = {}; ctx.window = ctx; ctx.document = {}; vm.createContext(ctx);
    (html.match(/<script src="[^"]*js\/motor\/blad\/blad-[^"]+\.js"/g) || []).forEach(t => {
      const fil = path.resolve(path.dirname(path.join(ROOT, sida)), /src="([^"]+)"/.exec(t)[1]);
      try { vm.runInContext(fs.readFileSync(fil, 'utf8'), ctx, { filename: fil }); } catch(e){}
    });
    (karta ? karta[1].match(/(\w+)\s*:\s*window\.(\w+)/g) || [] : []).forEach(par => {
      const m = /(\w+)\s*:\s*window\.(\w+)/.exec(par), M = ctx[m[2]] && ctx[m[2]].MOMENT;
      if(!M) return;
      M.blad.filter(b => !b.kommer).forEach(b => (M.varianter || ['']).forEach(v =>
        ut.push(sida + '?moment=' + m[1] + '&blad=' + b.nr + v)));
    });
    if(test && ctx[test[1]]) (ctx[test[1]].TESTER || []).forEach(t => ut.push(sida + '?test=' + t.id));
  });
  return ut;
}
function preLas(forst){
  const fil = path.join(os.tmpdir(), 'uppgiftssidor-pre-' + process.pid + '.js');
  fs.writeFileSync(fil, (forst || '') + "(function(){ var v; Object.defineProperty(window, 'NivaRad', { configurable: true,"
    + " get: function(){ return v; }, set: function(x){ v = x; Object.keys(window).forEach(function(k){"
    + " var M = /^BLAD_/.test(k) && window[k] && window[k].MOMENT; if(!M || !M.nivaPrefix) return;"
    + " for(var n = 2; n <= M.blad.length; n++) try { localStorage.setItem(M.nivaPrefix + '_naddNiva' + n + '_' + M.nivaId, '1'); } catch(e){} }); } }); })();");
  return fil;
}
module.exports = { sidfiler, sidor, preLas };
