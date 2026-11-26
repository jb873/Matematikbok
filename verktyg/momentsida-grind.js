/* momentsida-grind.js — MOMENTSIDORNA I NYTT FORMAT (order 2026-11-24, KONVENTIONER "Arbetssidan": REFERENSSIDA,
   METODTRÄNING, TEST).

   Renderar varje momentsida i nytt format (ak*\/**\/*-nyformat/index.html) i en riktig webbläsare och FÄLLER om:
     TRÄD      Metodträningen saknas under något moment, eller ett träd visas (rubriken fällbar) som saknas, inte
               ritas eller har inga klickbara löv. Ett klickbart löv ska öppna en författad bank (?bank=…). En
               Metodträning som står med "Kommer senare" godtas — så står den när inget löv har en bank (Joachim
               2026-11-24).
     KLICK     Ett klick på ett löv laddar något i trädets ruta (Joachim 2026-11-24: drillen öppnas som en egen sida i
               hela fönstret). Klicket görs på riktigt; navigeringen fångas med webbläsarens Navigation API och stoppas,
               så att grinden ser VAR den skulle hamna: i rutan = brott; ingenstans i hela fönstret = brott.
     TEST      Test leder till något annat än författade test: varje länk i Test-vyn ska vara uppgift.html?test=<id>,
               och sidan den öppnar ska visa just det testet (rubriken = länkens titel — ingen tyst reserv).
               Test som "Kommer senare" (inga författade test) är tillåtet.
     GAMMAL    En länk på sidan (vänsterspalten, momenten, trädet, Test-vyn) går till en gammal sida: delkapitlets sida
               i gammalt format (<x>/ bredvid <x>-nyformat/), ramens generatordrillar eller färdiga test (?ko=, ?view=),
               eller provbyggaren.
     JS-FEL    konsolfel eller filer som inte laddas.

   NEGATIV VERIFIERING: --injicera <fel> lägger in felet i sidan (före sidans skript) och grinden ska då fälla:
     trad    Metodträningen saknas helt under momenten
     lov     ett träd visas fast inget löv har en bank (inga klickbara löv)
     test    Test-länkarna till ramens färdiga test
     gammal  en länk till delkapitlets gamla sida
     ruta    lövens länkar öppnas i trädets ruta (target tas bort — det gamla felet)
   KÖR:  node verktyg/momentsida-grind.js [--sida <delsträng>] [--injicera trad|lov|test|gammal|ruta]
   Exit 1 vid brott. Ingen nätväg, ingen fil i repot ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const BARA = opt('--sida'), INJ = opt('--injicera');
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

/* Momentsidorna i nytt format: varje <katalog>/index.html under ak7, ak8, ak9 som bygger på skalet (laddar
   js/motor/arbetsyta/momentsida.js) — funktionen, inte namnet. Förr bara kataloger med namnet <x>-nyformat; en
   momentsida utan gammal sida bredvid (ak7/k4/d1-procent, 2026-11-26) fick då inget mått (V9). */
function arMomentsida(fil){ try { return /js\/motor\/arbetsyta\/momentsida\.js/.test(fs.readFileSync(fil, 'utf8')); } catch(e){ return false; } }
function hitta(dir, ut){
  fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
    if(!d.isDirectory() || d.name === 'node_modules' || d.name.startsWith('.')) return;
    const p = path.join(dir, d.name);
    if(arMomentsida(path.join(p, 'index.html'))) ut.push(path.relative(ROOT, path.join(p, 'index.html')).replace(/\\/g, '/'));
    hitta(p, ut);
  });
  return ut;
}
const SIDOR = ['ak7', 'ak8', 'ak9'].filter(a => fs.existsSync(path.join(ROOT, a))).reduce((u, a) => hitta(path.join(ROOT, a), u), []).sort();

// FÖRE sidans skript: konsolfel samlas; ev. injicerat fel. Lagringen töms bara i toppfönstret.
const PRE = `(function(){
  window.__fel = [];
  window.addEventListener('error', function(e){ var t = e.target; if(t && t !== window && (t.src || t.href)) window.__fel.push('LADDNING: ' + (t.src || t.href).split('/').slice(-2).join('/')); else window.__fel.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); }, true);
  window.addEventListener('unhandledrejection', function(e){ window.__fel.push('PROMISE: ' + (e.reason && e.reason.message || e.reason)); });
  var oe = console.error; console.error = function(){ try { window.__fel.push('console.error: ' + [].map.call(arguments, String).join(' ').slice(0, 200)); } catch(x){} return oe.apply(console, arguments); };
  if(window === window.top){ try { localStorage.clear(); } catch(e){} }
  var INJ = ${JSON.stringify(INJ || '')};
  if(INJ === 'ruta' && window !== window.top){   // i trädets ruta: lövens target tas bort, så att de öppnas i rutan
    var tabort = function(){ Array.prototype.forEach.call(document.querySelectorAll('a[target]'), function(a){ a.removeAttribute('target'); }); };
    new MutationObserver(tabort).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['target'] });
    return;
  }
  if(!INJ || window !== window.top) return;
  var M;
  Object.defineProperty(window, 'Momentsida', { configurable: true, get: function(){ return M; }, set: function(v){
    M = v;
    if(INJ === 'trad'){ v.metodtraning = function(){ return null; }; }
    if(INJ === 'lov'){
      // Trädet ritas ändå (förbi skalets "Kommer senare"): samma iframe och samma trädsida, men inga banker.
      var sida = [].map.call(document.querySelectorAll('script[src]'), function(x){ return x.src; }).filter(function(x){ return /momentsida\.js/.test(x); })[0];
      v.metodtraning = function(scen, d){ var k = JSON.parse(JSON.stringify(d || { kategorier: [] })); (k.kategorier || []).forEach(function(c){ (c.lov || []).forEach(function(l){ delete l.bank; }); });
        return v.sektion(scen, 'Metodträning', function(body){ var fr = document.createElement('iframe'); fr.className = 'nf-trad'; fr.__metod = k; fr.src = (sida || '').replace(/momentsida\.js.*$/, 'metodtrad.html'); body.appendChild(fr); }); };
    }
    if(INJ === 'test' || INJ === 'gammal'){ var mo = v.montera; v.montera = function(o){
      if(INJ === 'test') o.testAdress = '../../../ak7-k3-ram.html?view=test-fardigt&del=';
      var r = mo(o);
      if(INJ === 'gammal'){ var a = document.createElement('a'); a.href = location.pathname.replace('-nyformat/', '/'); a.textContent = 'Gamla sidan'; (r.scen || document.body).appendChild(a); }
      return r; }; }
  } });
})();`;

// I SIDAN: varje moment → Metodträningen (fäll ut, trädet i iframen, alla grenar öppna) → länkarna; sedan Test.
async function PROBE(){
  var v = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  await v(2200);
  function txt(e){ return (e && e.textContent || '').replace(/\s+/g, ' ').trim(); }
  function abs(a){ try { return new URL(a.getAttribute('href'), a.ownerDocument.location.href).href; } catch(e){ return a.getAttribute('href'); } }
  var ut = { moment: [], lankar: [], test: null, fel: [] };
  var rader = [].slice.call(document.querySelectorAll('.nr-rad'));
  var momentRader = rader.filter(function(b){ return !b.disabled && !/^(Dagens träning|Test)/.test(txt(b)); });
  ut.lankar = [].map.call(document.querySelectorAll('a[href]'), function(a){ return { var: 'sidan', text: txt(a).slice(0, 40), href: abs(a) }; });
  for(var i = 0; i < momentRader.length; i++){
    momentRader[i].click(); await v(300);
    var scen = document.getElementById('scen-moment'), m = { namn: txt(momentRader[i]), trad: null, lov: 0, lovLankar: [] };
    [].forEach.call(scen.querySelectorAll('a[href]'), function(a){ ut.lankar.push({ var: m.namn, text: txt(a).slice(0, 40), href: abs(a) }); });
    var sek = [].filter.call(scen.querySelectorAll('.nf-sek'), function(s){ return /Metodträning/.test(txt(s.querySelector('.nf-sek-h'))); })[0];
    if(!sek){ m.trad = 'ingen Metodträning-rubrik'; ut.moment.push(m); continue; }
    var kn = sek.querySelector('button.nf-fall');
    if(!kn && sek.classList.contains('is-kommer') && /Kommer senare/.test(txt(sek.querySelector('.nf-sek-h')))){ m.trad = 'kommer'; ut.moment.push(m); continue; }
    if(!kn){ m.trad = 'rubriken är inte fällbar (' + txt(sek.querySelector('.nf-sek-h')) + ')'; ut.moment.push(m); continue; }
    if(kn.getAttribute('aria-expanded') !== 'true') kn.click();
    await v(1800);
    var fr = sek.querySelector('iframe');
    if(!fr){ m.trad = 'ingen iframe med trädet'; ut.moment.push(m); continue; }
    var d = null; try { d = fr.contentDocument; } catch(e){}
    if(!d || !d.querySelector('[data-nodid]')){ m.trad = 'trädet ritades inte'; ut.moment.push(m); continue; }
    for(var k = 0; k < 40; k++){
      var st = [].filter.call(d.querySelectorAll('.node.gren'), function(b){ return /^▸/.test(txt(b)); })[0];
      if(!st) break; st.click(); await v(150);
    }
    var lov = [].slice.call(d.querySelectorAll('a.lov-lank[href]'));
    m.trad = 'ok'; m.lov = lov.length;
    lov.forEach(function(a){ var h = abs(a); m.lovLankar.push(h); ut.lankar.push({ var: m.namn + ' / trädet', text: txt(a).slice(0, 40), href: h }); });
    // KLICK PÅ ETT LÖV: var hamnar det? Navigeringen fångas (Navigation API) och stoppas — i rutan och i hela fönstret.
    if(lov[0]){
      var fang = { ruta: null, topp: null }, av = [];
      [[fr.contentWindow, 'ruta'], [window, 'topp']].forEach(function(p){
        try { if(p[0].navigation){ var h = function(e){ fang[p[1]] = e.destination.url; if(e.cancelable) e.preventDefault(); }; p[0].navigation.addEventListener('navigate', h); av.push(function(){ p[0].navigation.removeEventListener('navigate', h); }); } } catch(e){}
      });
      var fore = ''; try { fore = fr.contentWindow.location.href; } catch(e){}
      lov[0].click(); await v(900);
      av.forEach(function(f){ f(); });
      var efter = ''; try { efter = fr.contentWindow.location.href; } catch(e){ efter = '(okänd)'; }
      m.klick = { lov: txt(lov[0]).slice(0, 40), ruta: fang.ruta, topp: fang.topp, rutanBytt: efter !== fore, navApi: !!window.navigation };
    }
    try { (fr.contentWindow.__fel || []).forEach(function(f){ ut.fel.push('trädet: ' + f); }); } catch(e){}
    ut.moment.push(m);
  }
  var t = rader.filter(function(b){ return /^Test/.test(txt(b)); })[0];
  if(t && !t.disabled){
    t.click(); await v(400);
    var sc = document.getElementById('scen-moment');
    // Testets NAMN jämförs med testsidans titel — horisont-märket framför namnet (F för fördjupningstesten, Joachim
    // 2026-11-25) hör inte till namnet.
    ut.test = [].map.call(sc.querySelectorAll('a[href]'), function(a){
      var c = a.cloneNode(true); [].forEach.call(c.querySelectorAll('.hz'), function(h){ h.remove(); });
      var hz = a.querySelector('.hz');
      return { text: txt(c), marke: hz ? txt(hz) : '', href: abs(a) }; });
    ut.test.forEach(function(x){ ut.lankar.push({ var: 'Test', text: x.text, href: x.href }); });
  } else ut.test = 'kommer';
  ut.fel = ut.fel.concat(window.__fel || []);
  return ut;
}

// PÅ TESTSIDAN: rubriken på det test som faktiskt ritas.
async function TESTSIDA(){
  await new Promise(function(r){ setTimeout(r, 2500); });
  return { titel: document.title, sheet: !!document.querySelector('.ovn-sheet, .prob-kort'), fel: window.__fel || [] };
}

const TMP = path.join(os.tmpdir(), 'momentsida-grind-' + process.pid);
fs.writeFileSync(TMP + '-pre.js', PRE);
fs.writeFileSync(TMP + '-probe.js', '(' + PROBE.toString() + ')()');
fs.writeFileSync(TMP + '-test.js', '(' + TESTSIDA.toString() + ')()');
function kor(url, probe){
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), url, probe, '--pre', TMP + '-pre.js', '--viewport', '1366x768', '--timeout', '120000'],
                      { encoding: 'utf8', timeout: 180000 });
  try { return JSON.parse((r.stdout || '').trim().split('\n').filter(l => /^[{"]/.test(l)).pop()); } catch(e){ return null; }
}

// GAMLA SIDOR: för varje <x>-nyformat finns <x>/ i gammalt format. Plus ramens generatordrillar, färdiga test och
// provbyggaren (allt i ramen utan ?bank=), och de färdiga testens egna sidor.
// (Bara för <x>-nyformat — en momentsida utan gammal sida bredvid, som ak7/k4/d1-procent, har ingen.)
const GAMLA = SIDOR.filter(s => /-nyformat\/index\.html$/.test(s)).map(s => path.posix.dirname(s).replace(/-nyformat$/, '') + '/');
function arGammal(href){
  let u; try { u = new URL(href); } catch(e){ return null; }
  const p = decodeURIComponent(u.pathname).replace(/\\/g, '/');
  const g = GAMLA.filter(x => p.indexOf('/' + x) >= 0)[0];
  if(g) return 'delkapitlets gamla sida (' + g + ')';
  if(/ak\d-k\d-ram\.html$/.test(p) && !u.searchParams.get('bank')) return 'ramen utan författad bank (' + u.search + ')';
  if(/provbyggar/i.test(p)) return 'provbyggaren';
  return null;
}

console.log('MOMENTSIDE-GRIND — trädet, Test och inga gamla sidor' + (INJ ? '   [INJICERAT FEL: ' + INJ + ']' : '') + '\n');
let fel = 0, matta = 0;
SIDOR.forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  const u = kor(fileUrl(path.join(ROOT, sida)), TMP + '-probe.js');
  if(!u){ fel++; console.log('✗ ' + sida + ': inget svar från sidan'); return; }
  matta++;
  const brott = [];
  if(!u.moment.length) brott.push('TRÄD: inga moment att öppna');
  u.moment.forEach(m => {
    if(m.trad === 'kommer') return;                       // "Kommer senare": inget träd att mäta (godtas)
    if(m.trad !== 'ok') brott.push('TRÄD: ' + m.namn + ' — ' + m.trad);
    else if(!m.lov) brott.push('TRÄD: ' + m.namn + ' — inga klickbara löv');
    m.lovLankar.forEach(h => { let q; try { q = new URL(h).searchParams.get('bank'); } catch(e){} if(!q) brott.push('TRÄD: ' + m.namn + ' — ett löv öppnar inte en författad bank: ' + h); });
    if(m.klick){
      if(!m.klick.navApi) brott.push('KLICK: webbläsaren saknar Navigation API — klicket kan inte mätas');
      else if(m.klick.ruta || m.klick.rutanBytt) brott.push('KLICK: ' + m.namn + ' — "' + m.klick.lov + '" laddar något i trädets ruta (' + (m.klick.ruta || 'rutan bytte sida') + ')');
      else if(!m.klick.topp) brott.push('KLICK: ' + m.namn + ' — "' + m.klick.lov + '" öppnar ingenting i hela fönstret');
    } else if(m.trad === 'ok' && m.lov) brott.push('KLICK: ' + m.namn + ' — klicket på ett löv kunde inte göras');
  });
  if(Array.isArray(u.test)){
    if(!u.test.length) brott.push('TEST: Test-vyn har inga test (inga författade test → "Kommer senare")');
    u.test.forEach(x => {
      let ok = false; try { const t = new URL(x.href); ok = /\/uppgift\.html$/.test(t.pathname) && !!t.searchParams.get('test') && [...t.searchParams.keys()].length === 1; } catch(e){}
      if(!ok){ brott.push('TEST: "' + x.text + '" leder inte till ett författat test: ' + x.href); return; }
      const s = kor(x.href, TMP + '-test.js');
      if(!s || !s.sheet) brott.push('TEST: "' + x.text + '" ritar inget test (' + x.href + ')');
      else if(s.titel.indexOf(x.text) < 0) brott.push('TEST: "' + x.text + '" öppnar "' + s.titel + '" (inte det testet)');
      if(s && s.fel && s.fel.length) brott.push('JS-FEL på ' + x.text + ': ' + s.fel.join(' | '));
    });
  }
  const sedda = {};
  u.lankar.forEach(l => { const g = arGammal(l.href); const n = l.href + '|' + g; if(g && !sedda[n]){ sedda[n] = 1; brott.push('GAMMAL: ' + l.var + ' — "' + l.text + '" → ' + g); } });
  if(u.fel && u.fel.length) brott.push('JS-FEL: ' + u.fel.join(' | '));
  const lovSum = u.moment.map(m => m.namn.replace(/^\S*\d(?=\D)/, '') + ' ' + (m.trad === 'kommer' ? 'Metodträning: Kommer senare' : m.lov + ' löv')).join(', ');
  const testSum = Array.isArray(u.test) ? u.test.length + ' test' : 'Test: Kommer senare';
  if(brott.length){ fel++; console.log('✗ ' + sida + '  (' + lovSum + '; ' + testSum + ')'); brott.forEach(b => console.log('    ' + b)); }
  else console.log('✓ ' + sida + '  (' + lovSum + '; ' + testSum + ')');
});
['-pre.js', '-probe.js', '-test.js'].forEach(s => { try { fs.unlinkSync(TMP + s); } catch(e){} });
console.log('\n' + matta + ' momentsidor mätta, ' + fel + ' med brott.');
process.exit(fel || !matta ? 1 : 0);
