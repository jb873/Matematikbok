/* uppst-mult-difffuzz.js — DIFFERENTIELL FUZZ: Metodträningens multiplikationsuppställning,
   gammal och ny version sida vid sida (order 2026-10-07 "Uppställningen i datorn, även i öva").

   PÅSTÅENDET. Ramens beteende är identiskt efter att uppställningens yta bröts ut till
   js/motor/metod/uppstallning-yta.js (+ uppstallning.css). Gröna svep visar bara att inget SYNS ha
   gått sönder; identitet visas genom att köra båda versionerna på samma indata och kräva samma
   utfall i varje steg.

   SIDAN hämtas ur sidlistan (verktyg/sidor.js, allaHtml) — den sida som laddar multiplikations-
   motorn. Ingen handskriven sökväg. Hittas noll eller flera körs varje träff, och noll är rött.

   DEN GAMLA VERSIONEN tas emot som argument: en sökväg till en export av repot (en mapp med samma
   struktur). Verktyget rör inte git. Exportera den version du vill jämföra mot, t.ex. med GitHub
   Desktop eller `git archive`, och peka hit.

   Per omgång och variant (ensiffrig · flersiffrig multiplikator), i headless Chrome:
     · generatorn byts mot en seedad kö (samma frö båda sidor): vanliga, decimala, korta, långa,
       nollor och kanter
     · sidans egen Math.random seedas lika (berömtexterna i sammanfattningen)
     · varje svarsruta fylls ur samma seedade mönster: rätt siffra, fel siffra, tom, rätt med
       mellanslag, bokstav; minnesrutorna fylls också (rättas inte, ska inte påverka)
     · Kontrollera trycks; kortets HTML + varje rutas värde/låsning/klass + beskedet fångas
     · motorns egna timers körs för hand (nästa uppgift / sammanfattning / ny omgång)
   Dessutom jämförs beräknad stil för uppställningens element och poängtillståndet (tutorScores).
   En omgång per sidladdning: i en enda laddning växer lagringen och varje steg blir långsammare.

   --filter utan|med: bara uppgifter UTAN respektive MED nolla före kommat (svar < 1). Nollan blev en
   egen svarsruta i ab3b44f (en felrättning) — det är den enda avsedda skillnaden mot en version
   före den: 'utan' ska vara grönt, 'med' ska avvika.

   KÖR:  node verktyg/prov/uppst-mult-difffuzz.js --gammal <export> [--n 2000] [--omgangar 8]
                                                 [--seed 20261007] [--filter utan|med] [--bara-rattning]
   Exit 1 vid avvikelse. Ingen nätväg, ingen fil i repot ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const Sidor = require('../sidor');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const GAMMAL = opt('--gammal'), N = parseInt(opt('--n', '2000'), 10), OMG = parseInt(opt('--omgangar', '8'), 10);
const SEED = parseInt(opt('--seed', '20261007'), 10), FILTER = opt('--filter', '');
/* --bara-rattning: jämför RÄTTNINGEN och den synliga texten, inte layouten. För en avsiktlig
   ändring av utseendet (kommat blev smalt 2026-10-08): varje rutas facit, värde, låsning och
   correct/wrong, beskedet, kortets text (textContent) och poängtillståndet ska vara lika — html
   och beräknad stil får skilja. */
const BARA_RATTNING = args.includes('--bara-rattning');
if(!GAMMAL){ console.error('--gammal <sökväg till en export av den gamla versionen> krävs'); process.exit(2); }
if(!fs.existsSync(GAMMAL)){ console.error('--gammal: ' + GAMMAL + ' finns inte'); process.exit(2); }

// SIDAN: den som laddar multiplikationsmotorn — mätt på innehållet, som sidor.js gör.
const SIDOR = Sidor.allaHtml().filter(s => /metod\/metod-mult\.js/.test(fs.readFileSync(path.join(ROOT, s), 'utf8')));
if(!SIDOR.length){ console.log('✗ ingen sida i sidlistan laddar metod-mult.js — inget att jämföra'); process.exit(1); }

function pre(fler, seed){ return `(function(){
  var fro = ${seed} + ${fler ? 1 : 0};
  function slump(){ fro = (fro * 1103515245 + 12345) & 0x7fffffff; return fro / 0x7fffffff; }
  function hel(a, b){ return a + Math.floor(slump() * (b - a + 1)); }
  window.__slump = slump; window.__hel = hel;
  var fro2 = ${seed} + 7; Math.random = function(){ fro2 = (fro2 * 1103515245 + 12345) & 0x7fffffff; return fro2 / 0x7fffffff; };
  var Q = [];
  for(var i = 0; i < ${N} + 50; i++){
    var t;
    if(${fler}){
      var m = [hel(10, 99), hel(100, 999), hel(1000, 9999), hel(12, 99)][hel(0, 3)];
      var d = hel(10, 99), dec = slump() < 0.3 ? hel(1, 2) : 0, dDec = slump() < 0.15 ? 1 : 0;
      if(slump() < 0.05) d = [10, 11, 20, 99][hel(0, 3)];
      t = { m: m, d: d, answer: m * d, dec: dec, dDec: dDec };
    } else {
      var m2 = [hel(10, 99), hel(100, 999), hel(1000, 9999), hel(10000, 99999), hel(1, 9)][hel(0, 4)];
      var d2 = hel(2, 9), dec2 = slump() < 0.4 ? hel(1, 3) : 0;
      if(slump() < 0.05) m2 = [283, 5, 50, 105, 1000][hel(0, 4)];
      t = { m: m2, d: d2, answer: m2 * d2, dec: dec2, dDec: 0 };
    }
    t.display = t.m + ' · ' + t.d; t.profil = 0;
    var nolla = !${fler} && t.dec > 0 && String(t.answer).length <= t.dec;
    if(${JSON.stringify(FILTER)} === 'utan' && nolla){ i--; continue; }
    if(${JSON.stringify(FILTER)} === 'med' && !nolla){ i--; continue; }
    Q.push(t);
  }
  window.__Q = Q;
  var real;
  Object.defineProperty(window, 'UppstBand', { configurable: true, get: function(){ return real; }, set: function(v){ real = v;
    v.omgang = function(r, niva, n){ return window.__Q.splice(0, n); }; } });
})();`; }

const PROBE = `(async function(){
  var BARA = ${BARA_RATTNING};
  var ko = []; window.setTimeout = function(fn){ ko.push(fn); return ko.length; };
  var fel = [], steg = [], prov = [], stilar = null;
  function tomKo(){ var n = 0; while(ko.length && n < 50){ var f = ko.shift(); try { f(); } catch(e){ fel.push(String(e)); } n++; } }
  function h(s){ var x = 2166136261; for(var i = 0; i < s.length; i++){ x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(36); }
  function kort(){ return document.querySelector('.exercise-card'); }
  function stilAv(rot){
    var P = ['width','height','font-size','font-weight','font-family','color','background-color','border-top-color','border-top-width','padding-left','margin-top','display','gap'];
    return Array.prototype.map.call(rot.querySelectorAll('*'), function(e){ var c = getComputedStyle(e); return e.className + ':' + P.map(function(p){ return c.getPropertyValue(p); }).join('|'); }).join(';');
  }
  var s = document.getElementById('start-practice'); if(s) s.click();
  for(var i = 0; i < ${N}; i++){
    var k = kort(); if(!k){ fel.push('inget kort vid ' + i); break; }
    var fore = BARA ? k.textContent : k.innerHTML;
    var rutor = Array.prototype.slice.call(k.querySelectorAll('.mult-upp-ans'));
    if(!rutor.length){ var nb = document.getElementById('summary-next-btn'); if(nb){ steg.push(h('S' + fore)); nb.click(); tomKo(); i--; continue; } fel.push('inga rutor vid ' + i); break; }
    rutor.forEach(function(r){
      var e = r.getAttribute('data-expect'), u = __slump();
      r.value = u < 0.62 ? e : u < 0.74 ? String((+e + __hel(1, 9)) % 10) : u < 0.86 ? '' : u < 0.94 ? ' ' + e : 'x';
    });
    k.querySelectorAll('.mult-minne-ruta').forEach(function(r){ if(__slump() < 0.5) r.value = String(__hel(0, 9)); });
    if(i === 40 || i === 41) stilar = (stilar || '') + stilAv(k.querySelector('.mult-upp-box'));
    document.getElementById('upp-check').click();
    var efter = kort();
    var rut = Array.prototype.map.call(efter.querySelectorAll('input'), function(r){
      var kl = BARA ? (r.classList.contains('correct') ? 'R' : '') + (r.classList.contains('wrong') ? 'F' : '') + (r.getAttribute('data-expect') || '') : r.className;
      return kl + '=' + JSON.stringify(r.value) + (r.disabled ? 'L' : ''); }).join(',');
    var fb = (document.getElementById('upp-fb') || {}).textContent;
    steg.push(h(fore) + h((BARA ? efter.textContent : efter.innerHTML) + rut + fb));
    if(i < 2) prov.push({ i: i, fb: fb, rutor: rutor.length });
    if(i === 40) stilar += '#AFTER' + stilAv(efter.querySelector('.mult-upp-box'));
    tomKo();
  }
  // Poängtillståndet: mastery-proxyn (__proxy) är cirkulär och hoppas över. Kastar serialiseringen
  // är det ett FEL i fuzzen, inte ett lika — annars blir felmeddelandet "lika" på båda sidor.
  var ts = null; try { ts = JSON.stringify(state.tutorScores, function(k, v){ return k === '__proxy' ? undefined : v; }); } catch(e){ fel.push('tutorScores: ' + e); }
  if(ts === '{}' || ts == null) fel.push('tutorScores tomt — jämförelsen skulle inte mäta något');
  return { steg: steg, fel: fel, prov: prov, stilHash: h(stilar || ''), tutor: h(ts || ''), onerr: window.__onerr || null };
})()`;

const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
const TMP = path.join(os.tmpdir(), 'uppst-difffuzz-' + process.pid);
function kor(rot, sida, formaga, fler, seed){
  fs.writeFileSync(TMP + '-pre.js', pre(fler, seed)); fs.writeFileSync(TMP + '-probe.js', PROBE);
  const url = fileUrl(path.join(rot, sida)) + '?ko=mult-metoder&formaga=' + formaga + '&embed=1';
  const r = spawnSync('node', [path.join(__dirname, '..', 'cdp-kor.js'), url, TMP + '-probe.js', '--pre', TMP + '-pre.js',
    '--vanta-pa', 'laddad', '--timeout', '300000', '--viewport', '900x1100'], { encoding: 'utf8', timeout: 400000, cwd: ROOT, maxBuffer: 1 << 28 });
  let u = null; try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  return u;
}

console.log('UPPST-MULT-DIFFFUZZ — gammal (' + GAMMAL + ') mot ny (arbetskatalogen) · ' + OMG + ' × ' + N
  + ' per variant' + (FILTER ? ' · filter ' + FILTER : '') + (BARA_RATTNING ? ' · BARA RÄTTNINGEN (layouten får skilja)' : '') + '\n');
let brott = 0, uppgifter = 0;
SIDOR.forEach(sida => {
  if(!fs.existsSync(path.join(GAMMAL, sida))){ brott++; console.log('✗ ' + sida + ' finns inte i den gamla exporten'); return; }
  for(let o = 0; o < OMG; o++){
    const seed = SEED + o * 1000;
    for(const [formaga, fler] of [['uppstallning', false], ['uppstallning-stora', true]]){
      if(FILTER === 'med' && fler) continue;   // nolla före kommat finns bara i den ensiffriga varianten
      const g = kor(GAMMAL, sida, formaga, fler, seed), n = kor(ROOT, sida, formaga, fler, seed);
      const namn = sida + ' · ' + formaga + ' · omgång ' + (o + 1) + ' (frö ' + seed + ')';
      if(!g || !n){ brott++; console.log('✗ ' + namn + ': inget svar från ' + (!g ? 'gammal' : 'ny')); continue; }
      const L = Math.min(g.steg.length, n.steg.length);
      let forsta = -1; for(let i = 0; i < L; i++) if(g.steg[i] !== n.steg[i]){ forsta = i; break; }
      const ok = forsta < 0 && g.steg.length === n.steg.length && (BARA_RATTNING || g.stilHash === n.stilHash) && g.tutor === n.tutor
        && !g.fel.length && !n.fel.length;
      uppgifter += N;
      if(!ok) brott++;
      console.log((ok ? '✓ ' : '✗ ') + namn + ': ' + L + ' steg'
        + (forsta >= 0 ? ' · FÖRSTA AVVIKELSE i steg ' + forsta : '')
        + (g.steg.length !== n.steg.length ? ' · olika antal steg ' + g.steg.length + '/' + n.steg.length : '')
        + ' · stil ' + (g.stilHash === n.stilHash ? 'lika' : 'OLIKA') + ' · tutorScores ' + (g.tutor === n.tutor ? 'lika' : 'OLIKA')
        + (g.fel.length || n.fel.length ? ' · fel: ' + g.fel.concat(n.fel).slice(0, 3).join(' | ') : ''));
    }
  }
});
try { fs.unlinkSync(TMP + '-pre.js'); fs.unlinkSync(TMP + '-probe.js'); } catch(e){}
console.log('\n' + (brott ? '✗ DIFFFUZZ RÖD (' + brott + ')' : '✓ DIFFFUZZ GRÖN') + ' · ' + uppgifter + ' uppgifter på ' + SIDOR.length + ' sida');
process.exit(brott ? 1 : 0);
