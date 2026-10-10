/* loggnings-grind.js — REGEL 20: VARJE RÄKNEGRUPP LOGGAR TILL RÄTT NOD (order 2026-10-09, k1 d10 FAS 2).

   SKÄLET. Plugg till prov loggade ingenting — ingen grupp hade logg eller loggarEj — och ingen grind
   märkte det. koppling-grind prövar bara att de nycklar som FINNS pekar på riktiga noder; en grupp
   utan nyckel är osynlig för den.

   TVÅ BEN:
     DATA    varje grupp bär logg (en nod som finns i taxonomin) ELLER loggarEj med ett skäl. En rad
             får bära egen logg (kärnan söker närmaste data-logg). Tomt skäl = ett beslut ingen skrivit.
     LIVE    varje dokument fylls med rätta svar och rättas; varje nod dokumentet anger ska få minst
             ett nytt försök i k1-storen (window.Mastery). Tallinjen och ett faktorträd provas också —
             de loggar i egen kod, utanför kärnan.

   KÖR:  node verktyg/loggnings-grind.js
   Omfång: OMFANG (Plugg till prov k1 d10). Ny sida → en rad. Noll nätväg, ingen fil ändras
   (proben skriver bara till den tillfälliga webbläsarens localStorage). */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), vm = require('vm'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const OMFANG = ['ak7/k1/d10-pluggtillprov/index.html'];
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
const w = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/data/k1-taxonomi.js'), 'utf8'), { window: w });
const NODER = new Set(w.K1_TAXONOMI.noder.map(n => n.id));

const PROBE = `new Promise(function(res){
  var vanta = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  var satt = function(i, v){ i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); };
  var ut = { data: [], live: [] };
  var D = window.PLUGG_DOKUMENT || {}, alla = {};
  Object.keys(D).forEach(function(id){ alla[id] = D[id]; });
  if(window.PLUGG_FAKTORISERA) alla.faktorisera = window.PLUGG_FAKTORISERA;
  // ── DATA ──
  Object.keys(alla).forEach(function(id){ alla[id].grupper.forEach(function(g, gi){
    var rader = (g.rader || []).map(function(r){ return r.logg || null; });
    ut.data.push({ dok: id, grupp: (gi + 1) + '. ' + g.rubrik, logg: g.logg || null, loggarEj: g.loggarEj === undefined ? null : String(g.loggarEj), radLogg: rader.filter(Boolean) });
  }); });
  function matris(){ try { var m = Mastery.lasMatris() || {}, n = {}; Object.keys(m).forEach(function(k){ n[k] = (m[k] && m[k].length) || 0; }); return n; } catch(e){ return null; } }
  function fyll(m){
    [].forEach.call(m.querySelectorAll('input'), function(i){ if(i.hidden || i.closest('[hidden]')) return; var d = i.dataset, v = null;
      if(d.svar !== undefined) v = String(d.svar).replace('.', ','); else if(d.expect !== undefined) v = d.expect; else if(d.tlsvar !== undefined) v = String(d.tlsvar).replace('.', ',');
      else if(d.ordna !== undefined) v = String(d.ordna).replace('.', ','); else if(d.brakdel !== undefined) v = String(d.visa).split('/')[d.brakdel === 't' ? 0 : 1];
      else if(d.prioled !== undefined) v = d.visa; else if(d.mellan !== undefined) v = String(d.mellan).split('|')[0]; else if(d.enhet !== undefined) v = d.enhet;
      else if(d.uttryck !== undefined) v = decodeURIComponent(d.uttryck).split('|')[0]; else if(d.fritext !== undefined) v = decodeURIComponent(d.fritext).split('|')[0];
      else if(d.intmin !== undefined) v = String((parseFloat(d.intmin) + parseFloat(d.intmax)) / 2).replace('.', ',');
      else if(d.faktor !== undefined){ var n = +d.faktor, a = +d.antal, f = [], x = n; for(var p = 2; f.length < a - 1 && p <= x; p++){ if(x % p === 0 && x / p > 1){ f.push(p); x /= p; p = 1; } } f.push(x); v = f.join('\\u00b7'); }
      if(v != null) satt(i, v); });
    [].forEach.call(m.querySelectorAll('.ovn-flerval-grid'), function(g){ var r = g.dataset.ratt.split(','); [].forEach.call(g.querySelectorAll('button'), function(b){ if(r.indexOf(b.dataset.tal) >= 0) b.click(); }); });
    [].forEach.call(m.querySelectorAll('.ovn-val-grid'), function(g){ var b = g.querySelector('[data-val="' + g.dataset.valsvar + '"]'); if(b) b.click(); });
  }
  (async function(){
    if(!window.Mastery){ ut.ingenStore = true; return res(ut); }
    var ids = ['tio', 'tallinjer', 'jobbatal', 'metoder', 'tiopotens', 'storasma', 'prio', 'delbarhet', 'faktorisera', 'brak', 'negativa', 'avrundning', 'overslag', 'lastal'];
    for(const id of ids){
      var fore = matris(); oppnaDokument(id); await vanta(500);
      var m = document.getElementById('plugg-aktivt'); fyll(m);
      if(id === 'faktorisera'){ var t = document.getElementById('ft15'); if(t){ var ins = t.querySelectorAll('input'); if(ins.length >= 2){ satt(ins[0], '3'); satt(ins[1], '5'); } var dela = [].filter.call(t.querySelectorAll('button'), function(b){ return /Dela/.test(b.textContent); })[0]; if(dela) dela.click(); } }
      [].forEach.call(m.querySelectorAll('[data-action="kontroll"]'), function(k){ k.click(); }); await vanta(400);
      var efter = matris(), nya = {};
      Object.keys(efter || {}).forEach(function(k){ var d = efter[k] - ((fore || {})[k] || 0); if(d > 0) nya[k] = d; });
      ut.live.push({ dok: id, nya: nya });
    }
    res(ut);
  })().catch(function(e){ res({ FEL: e.message }); });
})`;
// Noder som dokumenten loggar i EGEN kod (utanför data-logg): måste också synas i storen.
const KOD_LOGG = { tallinjer: ['position:rakna'], faktorisera: ['primtal:metod'] };

const TMP = path.join(os.tmpdir(), 'loggningsgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);
let fel = 0;
console.log('LOGGNINGS-GRIND — varje räknegrupp loggar till en nod som finns (regel 20)\n');
OMFANG.forEach(sida => {
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP, '--vanta-pa', 'laddad', '--timeout', '120000'], { encoding: 'utf8', timeout: 180000 });
  let u = null; try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  const kort = sida.replace(/\/index\.html$/, '');
  if(!u || u.FEL){ fel++; console.log('✗ ' + kort + ': ' + (u ? u.FEL : 'inget svar')); return; }
  if(u.ingenStore){ fel++; console.log('✗ ' + kort + ': sidan laddar ingen k1-store (window.Mastery) — ingenting kan loggas'); return; }
  // DATA
  const perDok = {};
  u.data.forEach(g => {
    const noder = [g.logg].concat(g.radLogg).filter(Boolean);
    (perDok[g.dok] = perDok[g.dok] || new Set()); noder.forEach(n => perDok[g.dok].add(n));
    if(!g.logg && g.loggarEj === null && !g.radLogg.length){ fel++; console.log('✗ DATA ' + g.dok + ' · ' + g.grupp + ': varken logg eller loggarEj'); return; }
    if(g.loggarEj !== null && !g.loggarEj.trim()){ fel++; console.log('✗ DATA ' + g.dok + ' · ' + g.grupp + ': loggarEj utan skäl'); }
    noder.forEach(n => { if(!NODER.has(n)){ fel++; console.log('✗ DATA ' + g.dok + ' · ' + g.grupp + ': noden "' + n + '" finns inte i taxonomin'); } });
  });
  Object.keys(KOD_LOGG).forEach(d => { (perDok[d] = perDok[d] || new Set()); KOD_LOGG[d].forEach(n => perDok[d].add(n)); });
  // LIVE
  u.live.forEach(l => {
    const vantade = [...(perDok[l.dok] || [])];
    const saknas = vantade.filter(n => !l.nya[n]);
    const okanda = Object.keys(l.nya).filter(n => !NODER.has(n));
    if(saknas.length){ fel += saknas.length; console.log('✗ LIVE ' + l.dok + ': ingen evidens till ' + saknas.join(', ') + ' trots rättat dokument'); }
    if(okanda.length){ fel += okanda.length; console.log('✗ LIVE ' + l.dok + ': evidens till nod som inte finns: ' + okanda.join(', ')); }
    if(!vantade.length && !Object.keys(l.nya).length) console.log('  ' + l.dok + ': inga räknegrupper (bara loggarEj)');
    else if(!saknas.length && !okanda.length) console.log('✓ ' + l.dok + ': ' + vantade.length + ' nod(er), ' + Object.keys(l.nya).map(n => n + ' +' + l.nya[n]).join(', '));
  });
  console.log('  ' + kort + ': ' + u.data.length + ' grupper i datan, ' + u.data.filter(g => g.loggarEj !== null).length + ' med loggarEj');
});
try { fs.unlinkSync(TMP); } catch(e){}
console.log('\n' + (fel ? '✗ LOGGNINGS-GRIND RÖD (' + fel + ')' : '✓ LOGGNINGS-GRIND GRÖN'));
process.exit(fel ? 1 : 0);
