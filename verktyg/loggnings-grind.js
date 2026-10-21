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
             Och OMVÄNT (2026-10-10): evidens till en nod som dokumentet INTE anger är ett brott. Så syns
             en loggarEj-grupp som ändå loggar (via en förälder med data-logg) — "loggar inte" ska betyda
             att storen inte får något. Varje loggarEj skrivs ut med sitt skäl: beslutet står i rapporten.

   KEDJAN (2026-10-21, Joachims beslut): balansmetodens kedjesidor loggar i k3-storen (window.MasteryK3),
   inte i k1-storen — och utan det här benet var deras loggning mätt bara med en engångsprob.
     · Sidorna HITTAS PÅ MOTORN: varje bladsida (verktyg/sidor.js) som laddar ekvationer-balans.js. Ingen
       sökväg skrivs för hand; nästa sida med kedjan mäts av sig själv.
     DATA    varje uppgift bär data-nod, och noden finns i k3-taxonomin.
     LIVE    varje uppgift fylls med en kedja som rättaren godtar och rättas. Varje nod ska få EXAKT ett
             nytt försök 'ratt' per löst uppgift med den noden — fler är dubbelloggning — ingen annan nod
             något, och ett andra Kontrollera inget nytt (första försöket räknas, inte varje tryck).
     --sabba tyst|dubbel|nod   negativ verifiering i proben: loggningen avslagen, varje försök loggat
             två gånger, eller en uppgifts nod bytt mot en som inte finns. Varje sabotage ska fälla.

   KÖR:  node verktyg/loggnings-grind.js [--sabba tyst|dubbel|nod]
   Omfång: OMFANG (Plugg till prov k1 d10) + kedjesidorna (hittas på motorn). Noll nätväg, ingen fil
   ändras (proben skriver bara till den tillfälliga webbläsarens localStorage). */
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
    const oangivna = Object.keys(l.nya).filter(n => NODER.has(n) && vantade.indexOf(n) < 0);
    if(saknas.length){ fel += saknas.length; console.log('✗ LIVE ' + l.dok + ': ingen evidens till ' + saknas.join(', ') + ' trots rättat dokument'); }
    if(okanda.length){ fel += okanda.length; console.log('✗ LIVE ' + l.dok + ': evidens till nod som inte finns: ' + okanda.join(', ')); }
    if(oangivna.length){ fel += oangivna.length; console.log('✗ LIVE ' + l.dok + ': evidens till nod som dokumentet inte anger (läcker en loggarEj-grupp?): ' + oangivna.map(n => n + ' +' + l.nya[n]).join(', ')); }
    if(!vantade.length && !Object.keys(l.nya).length) console.log('  ' + l.dok + ': inga räknegrupper (bara loggarEj)');
    else if(!saknas.length && !okanda.length && !oangivna.length) console.log('✓ ' + l.dok + ': ' + vantade.length + ' nod(er), ' + Object.keys(l.nya).map(n => n + ' +' + l.nya[n]).join(', '));
  });
  console.log('  ' + kort + ': ' + u.data.length + ' grupper i datan, ' + u.data.filter(g => g.loggarEj !== null).length + ' med loggarEj:');
  u.data.filter(g => g.loggarEj !== null).forEach(g => console.log('    · ' + g.dok + ' · ' + g.grupp + ' — "' + g.loggarEj + '"'));
});
try { fs.unlinkSync(TMP); } catch(e){}

// ══ KEDJAN: balansmetodens sidor, k3-storen ══════════════════════════════════════════════════════
const Sidor = require('./sidor');
const MOTOR = 'ekvationer-balans/ekvationer-balans.js';
const SABBA = (i => i >= 0 ? process.argv[i + 1] : null)(process.argv.indexOf('--sabba'));
const w3 = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/data/k3-taxonomi.js'), 'utf8'), { window: w3 });
const NODER3 = new Set(w3.K3_TAXONOMI.noder.map(n => n.id));
const KEDJESIDOR = Sidor.alla().filter(s => fs.readFileSync(path.join(ROOT, s), 'utf8').indexOf(MOTOR) >= 0);
const PROBE3 = String.raw`new Promise(function(res){
  var vanta = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  (async function(){
    for(var t = 0; t < 50 && !(window.EkvBlad && window.EkvParser && window.EkvKedja); t++) await vanta(100);
    if(!window.MasteryK3) return res({ ingenStore: true });
    var SABBA = window.__SABBA || null;
    if(SABBA === 'tyst') MasteryK3.loggaForsok = function(){};
    if(SABBA === 'dubbel'){ var o = MasteryK3.loggaForsok; MasteryK3.loggaForsok = function(){ o.apply(this, arguments); o.apply(this, arguments); }; }
    if(SABBA === 'nod'){ var b0 = document.querySelector('.uppgift[data-nod]'); if(b0) b0.setAttribute('data-nod', 'finns-inte:rakna'); }
    function rakna(){ var m = MasteryK3.lasMatris() || {}, n = {}; Object.keys(m).forEach(function(k){ (m[k] || []).forEach(function(p){ var x = k + '|' + p.resultat; n[x] = (n[x] || 0) + 1; }); }); return n; }
    function skillnad(a, b){ var d = {}; Object.keys(b).forEach(function(k){ var x = b[k] - (a[k] || 0); if(x) d[k] = x; }); return d; }
    // Tal i kedjans skrivsätt: decimaltal när det är exakt, annars blandad form [t|n].
    function sgd(a, b){ return b ? sgd(b, a % b) : a; }
    function tal(q){
      var s = q < 0 ? '−' : '', a = Math.abs(q);
      if(Math.abs(a * 1e6 - Math.round(a * 1e6)) < 1e-6) return s + String(Math.round(a * 1e6) / 1e6).replace('.', ',');
      for(var n = 2; n <= 1000; n++){ var t = Math.round(a * n); if(Math.abs(t / n - a) < 1e-9){ var g = sgd(t, n), hel = Math.floor(t / n), r = (t - hel * n) / g; return s + (hel ? hel + ' ' : '') + '[' + r + '|' + (n / g) + ']'; } }
      return s + String(a).replace('.', ',');
    }
    var BRAK = /\[([^\[\]|]*)\|([^\[\]|]*)\]/;
    function inp(el, v){ el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
    function fyllSida(sida, str){
      var cur = sida.querySelector('.seg-text'), rest = str.trim(), m;
      while((m = rest.match(BRAK))){ inp(cur, rest.slice(0, m.index).trim()); var b = EkvKedja.brakVid(cur, {}); inp(b._tIn, m[1]); inp(b._nIn, m[2]); cur = b.nextSibling; rest = rest.slice(m.index + m[0].length).trim(); }
      inp(cur, rest);
    }
    // En kedja som rättaren godtar: k·v = k·s för k = 2, 3, … tills radkravet nås, sist v = s.
    function kedja(upp){
      var v = upp.vars || 'x', R = upp.regler, s, krav;
      if(R && R.namnare){ var mng = EkvParser.losningsmangd(upp.vl, upp.hl, { variabel: v }); s = mng && mng.x; }
      else { var e = EkvParser.parseEkvation(upp.vl, upp.hl, { variabel: v }); s = e.B / e.A; }
      krav = R ? EkvParser.minstaAntalRaderUtokad(upp.vl, upp.hl, { variabel: v, lage: upp.lage, spegling: R.spegling, samla: R.samla, namnare: R.namnare })
               : EkvParser.minstaAntalRader(upp.vl, upp.hl, { lage: upp.lage || EkvBlad.lage() });
      // En faktor vars rad upprepar raden före (2x = 5 ur uppgiften 2x = 5) hoppas över — den fälls, med rätta.
      var rader = [], fore = { vl: upp.vl, hl: upp.hl };
      for(var k = 2; rader.length < krav - 2; k++){
        var rad = { vl: k + v, hl: tal(k * s) };
        if(EkvParser.upprepar(fore, { vl: rad.vl, hl: rad.hl.replace(/−/g, '-').replace(',', '.') })) continue;
        rader.push(rad.vl + ' = ' + rad.hl); fore = rad;
      }
      rader.push(v + ' = ' + tal(s));
      return rader;
    }
    var ut = { data: [], live: [] }, UPP = EkvBlad.uppgifter();
    var blad = Array.prototype.filter.call(document.querySelectorAll('[id^="sheet-"]'), function(s){ return s.querySelector('.uppgift'); });
    for(var bi = 0; bi < blad.length; bi++){
      var sheet = blad[bi], block = sheet.querySelectorAll('.uppgift'), uppg = [];
      Array.prototype.forEach.call(block, function(b, i){
        var upp = UPP.filter(function(u){ return u.grid === b.querySelector('.eq-grid'); })[0];
        ut.data.push({ blad: sheet.id, uppgift: i + 1, nod: b.getAttribute('data-nod') });
        if(!upp) return;
        var grid = upp.grid, nyB = b.querySelector('.uppg-verktyg .mini-btn');
        kedja(upp).forEach(function(r, ri){
          if(ri > 0) nyB.click();
          var vl = grid.querySelectorAll('.sida-vl'), hl = grid.querySelectorAll('.sida-hl'), d = r.split('=');
          fyllSida(vl[vl.length - 1], d[0]); fyllSida(hl[hl.length - 1], d[1]);
        });
        uppg.push({ block: b, nod: b.getAttribute('data-nod') });
      });
      var fore = rakna(), kn = sheet.querySelector('.actions .btn.primary');
      kn.click(); await vanta(300);
      var efter1 = rakna(); kn.click(); await vanta(300); var efter2 = rakna();
      ut.live.push({ blad: sheet.id, uppgifter: uppg.map(function(u){ return { nod: u.nod, klar: u.block.querySelector('.uppg-klar').classList.contains('show') }; }),
                     nya: skillnad(fore, efter1), andraTrycket: skillnad(efter1, efter2) });
    }
    res(Object.assign(ut, { jsFel: window.__e || [] }));
  })().catch(function(e){ res({ FEL: e.message }); });
})`;
const TMP3 = path.join(os.tmpdir(), 'loggningsgrind-kedja-' + process.pid + '.js'), PRE3 = TMP3.replace(/\.js$/, '-pre.js');
fs.writeFileSync(TMP3, PROBE3);
fs.writeFileSync(PRE3, "window.__e=[]; window.addEventListener('error', function(e){ window.__e.push(String(e.message)); });" + (SABBA ? ' window.__SABBA=' + JSON.stringify(SABBA) + ';' : ''));
console.log('\nKEDJAN — balansmetodens sidor loggar i k3-storen (hittade på motorn: ' + KEDJESIDOR.length + ' sidor)' + (SABBA ? ' · SABOTAGE: ' + SABBA : ''));
if(!KEDJESIDOR.length){ fel++; console.log('✗ inga kedjesidor hittades — benet mäter ingenting'); }
KEDJESIDOR.forEach(sida => {
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP3, '--pre', PRE3, '--vanta-pa', 'laddad', '--timeout', '120000'], { encoding: 'utf8', timeout: 180000 });
  let u = null; try { u = JSON.parse((r.stdout || '').trim().split('\n').filter(l => l.trim().startsWith('{')).pop()); } catch(e){}
  const kort = sida.replace(/\/index\.html$/, '');
  if(!u || u.FEL){ fel++; console.log('✗ ' + kort + ': ' + (u ? u.FEL : 'inget svar')); return; }
  if(u.ingenStore){ fel++; console.log('✗ ' + kort + ': sidan laddar ingen k3-store (window.MasteryK3) — ingenting kan loggas'); return; }
  if(u.jsFel && u.jsFel.length){ fel++; console.log('✗ ' + kort + ': JS-fel: ' + u.jsFel.slice(0, 3).join(' | ')); }
  // DATA
  u.data.forEach(d => {
    if(!d.nod){ fel++; console.log('✗ DATA ' + kort + ' · ' + d.blad + ' uppgift ' + d.uppgift + ': ingen data-nod'); }
    else if(!NODER3.has(d.nod)){ fel++; console.log('✗ DATA ' + kort + ' · ' + d.blad + ' uppgift ' + d.uppgift + ': noden "' + d.nod + '" finns inte i k3-taxonomin'); }
  });
  // LIVE
  let uppgifter = 0;
  u.live.forEach(l => {
    const vant = {};
    l.uppgifter.forEach(x => { uppgifter++; if(!x.klar){ fel++; console.log('✗ LIVE ' + kort + ' · ' + l.blad + ': en uppgift (' + x.nod + ') blev inte löst av en godtagbar kedja — grinden kan inte mäta loggningen'); } vant[x.nod + '|ratt'] = (vant[x.nod + '|ratt'] || 0) + 1; });
    const nycklar = new Set(Object.keys(vant).concat(Object.keys(l.nya)));
    const avv = [...nycklar].filter(k => (l.nya[k] || 0) !== (vant[k] || 0));
    avv.forEach(k => { fel++; console.log('✗ LIVE ' + kort + ' · ' + l.blad + ': ' + k.replace('|', ' ') + ' fick ' + (l.nya[k] || 0) + ' nya försök, väntat ' + (vant[k] || 0)); });
    Object.keys(l.andraTrycket).forEach(k => { fel++; console.log('✗ LIVE ' + kort + ' · ' + l.blad + ': ett andra Kontrollera loggade ' + l.andraTrycket[k] + ' till ' + k.replace('|', ' ') + ' (första försöket ska räknas, inte varje tryck)'); });
    if(!avv.length && !Object.keys(l.andraTrycket).length) console.log('✓ ' + kort + ' · ' + l.blad + ': ' + l.uppgifter.length + ' uppgifter → ' + Object.keys(l.nya).map(k => k.replace('|ratt', '') + ' +' + l.nya[k]).join(', '));
  });
  console.log('  ' + kort + ': ' + u.live.length + ' blad, ' + uppgifter + ' uppgifter, ' + u.data.length + ' noder i datan');
});
try { fs.unlinkSync(TMP3); fs.unlinkSync(PRE3); } catch(e){}

console.log('\n' + (fel ? '✗ LOGGNINGS-GRIND RÖD (' + fel + ')' : '✓ LOGGNINGS-GRIND GRÖN'));
process.exit(fel ? 1 : 0);
