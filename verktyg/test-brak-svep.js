/* test-brak-svep.js — TESTVYN: varje bråk i frågetexten är staplat, med synligt streck (order 2026-10-25).

   SKÄLET. Alla bråk i k2-testen visades platta — "Skriv 113 i blandad form" för 11/3 — därför att
   ak7-k2-ram.html saknade CSS för .ovn-brak. Ingen grind öppnade testvyn (?view=test-fardigt), så
   felet låg i över 800 bråk utan att något blev rött.

   HUR TESTEN HITTAS. Som eleven hittar dem: varje sida i repot som laddar en fil med färdiga test
   (*-fardiga-test.js) öppnas, och länkarna till testvyn samlas. Ett nytt test, en ny ram eller ett nytt
   delkapitel kommer med av sig självt.

   VAD SOM MÄTS, i varje deluppgifts fråga och svarsalternativ (aldrig i svarsrutor eller facit):
     STAPLAT   varje .ovn-brak har täljaren ovanför nämnaren
     STRECK    bråkstrecket syns: höjd > 0 och en färg som inte är genomskinlig
     SNEDSTRECK ett bråk skrivet som text ("t/n", "▢/n", "___/n") fäller — bråk staplas.
               UNDANTAG: förkortningens mellanled skrivs med snedstreck inne i täljare och nämnare
               (Joachim 2026-10-25), alltså text som står INNE I ett staplat bråks täljare eller nämnare.
   Slumpen seedas (samma tal varje körning), så att före och efter går att jämföra.

     node verktyg/test-brak-svep.js [--sida <delsträng>] [--sabba utan-css|platt]
       --sabba utan-css  bråkreglerna i provbyggar-motor.css stängs av → varje bråk ska fälla
       --sabba platt     ett "3/4" läggs in som text i första frågan → SNEDSTRECK ska fälla
   Noll nätväg (bara localhost-CDP). Ingen källfil ändras. Exit 1 vid brott. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const Sidor = require('./sidor');
const ROOT = Sidor.ROOT;
const args = process.argv.slice(2);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PRE = `(function(){ var s = 0x51A7E5; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); }); try { localStorage.clear(); } catch(e){} })();`;

// Steg 1: sidans testlänkar — vanliga länkar (k2, nian) och inbäddade (.test-lank med data-deep: k1, k3, åttan).
const LANKAR = `new Promise(function(res){ setTimeout(function(){
  var ut = Array.prototype.map.call(document.querySelectorAll('a[href*="view=test-fardigt"]'), function(a){ return a.href; });
  Array.prototype.forEach.call(document.querySelectorAll('.test-lank[data-deep]'), function(a){
    try { ut.push(new URL(decodeURIComponent(a.getAttribute('data-deep')), location.href).href); } catch(e){}
  });
  res({ lankar: ut, onerr: window.__onerr || [] });
}, 900); })`;

// Steg 2: ett test.
const PROBE = String.raw`new Promise(function(res){
  var SABBA = ${JSON.stringify(SABBA)};
  setTimeout(function(){
    if(SABBA === 'utan-css'){
      Array.prototype.forEach.call(document.styleSheets, function(ss){
        if(!/provbyggar-motor\.css/.test(ss.href || '')) return;
        try { for(var i = ss.cssRules.length - 1; i >= 0; i--) if(/\.ovn-brak/.test(ss.cssRules[i].selectorText || '')) ss.deleteRule(i); } catch(e){}
      });
    }
    // En deluppgift är .test-sub-item (alla ramar); frågan kan stå i .test-sub-q eller direkt i raden (k1).
    var fragor = Array.prototype.slice.call(document.querySelectorAll('.test-sub-item'));
    if(!fragor.length) fragor = Array.prototype.slice.call(document.querySelectorAll('.test-sub-q'));
    function syns(e){ return !!(e && e.getClientRects().length); }
    if(SABBA === 'platt' && fragor[0]) fragor[0].appendChild(document.createTextNode(' 3/4'));
    var ut = { subs: 0, brak: 0, brott: [], onerr: window.__onerr || [] };
    function kort(t){ return String(t).replace(/\s+/g, ' ').trim().slice(0, 60); }
    fragor.forEach(function(q){
      ut.subs++;
      Array.prototype.forEach.call(q.querySelectorAll('.ovn-brak'), function(b){
        if(!syns(b) || b.querySelector('input')) return;   // dolt facit, eller ett svarsbråk med rutor
        ut.brak++;
        var t = b.querySelector(':scope > .ovn-brak-taljare'), n = b.querySelector(':scope > .ovn-brak-namnare'), s = b.querySelector(':scope > .ovn-brak-strecket');
        if(!t || !n || !s){ ut.brott.push('OFULLSTÄNDIGT BRÅK i "' + kort(q.textContent) + '"'); return; }
        var tr = t.getBoundingClientRect(), nr = n.getBoundingClientRect(), sr = s.getBoundingClientRect(), cs = getComputedStyle(s);
        if(!(tr.bottom <= nr.top + 3)) ut.brott.push('EJ STAPLAT: ' + kort(t.textContent) + '|' + kort(n.textContent) + ' i "' + kort(q.textContent) + '"');
        else if(!(sr.height > 0 && sr.width > 0 && !/rgba\([^)]*,\s*0\)|transparent/.test(cs.backgroundColor)))
          ut.brott.push('STRECKET SYNS INTE: ' + kort(t.textContent) + '|' + kort(n.textContent) + ' i "' + kort(q.textContent) + '"');
      });
      // Snedstreck i texten — men inte inne i ett staplat bråks täljare eller nämnare (förkortningens mellanled).
      var g = document.createTreeWalker(q, NodeFilter.SHOW_TEXT, null), nod;
      while((nod = g.nextNode())){
        var mor = nod.parentElement;
        if(!mor || !syns(mor) || mor.closest('input, .ovn-brak-taljare, .ovn-brak-namnare')) continue;
        var m = String(nod.nodeValue).match(/(\d|▢|_)\s*\/\s*(\d|▢|_)/);
        if(m) ut.brott.push('SNEDSTRECK: "' + kort(nod.nodeValue) + '"');
      }
    });
    res(ut);
  }, 1200);
})`;

function kor(url, probe){
  const tmp = path.join(os.tmpdir(), 'testbrak-' + process.pid + '.js'), pre = path.join(os.tmpdir(), 'testbrak-pre-' + process.pid + '.js');
  fs.writeFileSync(tmp, probe); fs.writeFileSync(pre, PRE);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), url, tmp, '--pre', pre, '--vanta-pa', 'laddad', '--viewport', '1366x768', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  try { return JSON.parse((r.stdout || '').trim().split('\n').filter(l => l.startsWith('{')).pop()); } catch(e){ return { FEL: (r.stderr || '').trim().split('\n').pop() }; }
}

// Sidorna som kan visa test: de som laddar en fil med färdiga test.
const sidor = Sidor.allaHtml().filter(s => /-fardiga-test\.js/.test(fs.readFileSync(path.join(ROOT, s), 'utf8')) && !/-ram\.html$/.test(s));
const tester = new Map();   // normaliserad testadress → första sidan som länkar dit
let fel = 0;
sidor.forEach(s => {
  const u = kor(fileUrl(path.join(ROOT, s)), LANKAR);
  if(!u || u.FEL){ fel++; console.log('✗ ' + s + ': inget svar — ' + (u && u.FEL)); return; }
  (u.lankar || []).forEach(h => {
    const m = h.match(/^(.*?\?)(.*)$/); if(!m) return;
    const q = new URLSearchParams(m[2]); ['retur', 'retur_txt'].forEach(k => q.delete(k));
    const nyckel = m[1] + q.toString();
    if(!tester.has(nyckel)) tester.set(nyckel, s);
  });
});
console.log('TEST-BRÅK-SVEP — varje bråk i testets frågetext staplat med synligt streck' + (SABBA ? '  [SABBA: ' + SABBA + ']' : ''));
console.log('  ' + sidor.length + ' sidor med färdiga test · ' + tester.size + ' test hittade\n');
let antalTest = 0, antalBrak = 0, antalSubs = 0;
[...tester.keys()].sort().forEach(url => {
  const kortUrl = url.replace(/^file:\/\/\/.*?Matematikbok\//, '').replace('view=test-fardigt&', '');
  if(BARA && kortUrl.indexOf(BARA) < 0) return;
  const u = kor(url, PROBE);
  if(!u || u.FEL){ fel++; console.log('✗ ' + kortUrl + ': inget svar — ' + (u && u.FEL)); return; }
  antalTest++; antalBrak += u.brak; antalSubs += u.subs;
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + kortUrl + ': JS-fel ' + u.onerr.join(' | ')); }
  if(!u.subs){ fel++; console.log('✗ ' + kortUrl + ': inga frågor ritades — testet mäts inte'); return; }
  fel += u.brott.length;
  console.log((u.brott.length ? '✗ ' : '✓ ') + kortUrl + ': ' + u.subs + ' frågor, ' + u.brak + ' bråk'
    + (u.brott.length ? ' · ' + u.brott.length + ' brott\n     ' + [...new Set(u.brott.map(b => b.replace(/\d+/g, 'N')))].slice(0, 5).join('\n     ') : ''));
});
if(!antalTest){ fel++; console.log('✗ inga test mättes'); }
console.log('\n' + (fel ? '✗ TEST-BRÅK-SVEP RÖTT (' + fel + ')' : '✓ TEST-BRÅK-SVEP GRÖNT') + ' · ' + antalTest + ' test, ' + antalSubs + ' frågor, ' + antalBrak + ' bråk');
process.exit(fel ? 1 : 0);
