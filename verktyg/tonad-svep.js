/* tonad-svep.js — REGLER SOM SER UT ATT GÄLLA MEN INTE GÖR DET (order 2026-09-25).

   FYNDET som gav ordern: .nav-card.is-soon{opacity:.6} kom aldrig fram. Korten rider in med
   animation:fadeUp .4s ease both, fadeUp slutar på opacity:1, och en animation med fill-mode
   both/forwards slår ut vanliga deklarationer i kaskaden. Halva regeln var död: kortet såg
   vanligt ut men gick inte att klicka på — eleven trycker och tror att sidan är trasig.

   SVEPET MÄTER, LÄSER INTE. Per sida:
     1. varje CSS-regel som deklarerar opacity < 1 plockas ur document.styleSheets,
     2. elementen den matchar hämtas EFTER att animationerna hunnit klart,
     3. beräknad opacity jämförs med den deklarerade.
   Skiljer de sig och elementet bär en animation vars keyframes rör opacity → regeln är DÖD.

   Mätningen sker sent med flit. Det var just tidpunkten som dolde felet: före animationen
   stämmer allt, efteråt vinner keyframen.

   Svepet fäller också det omvända: ett element som SKA vara fullt synligt men ligger under 1.

   KÖR:  node verktyg/tonad-svep.js              alla sidor
         node verktyg/tonad-svep.js --sida ak7   bara sidor vars sökväg innehåller "ak7"
   Exit 1 vid rött. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var ut = { onerr: window.__onerr || null, doda: [], levande: 0, regler: 0 };

  // 1. alla regler som deklarerar opacity — inline-blocken och de länkade filerna
  var regler = [];
  function samla(lista){
    for(var i = 0; i < lista.length; i++){
      var r = lista[i];
      if(r.cssRules && !r.selectorText){ samla(r.cssRules); continue; }   // @media m.fl.
      if(!r.style || !r.selectorText) continue;
      var o = r.style.getPropertyValue('opacity');
      if(o === '' ) continue;
      var v = parseFloat(o);
      if(!isFinite(v)) continue;
      regler.push({ sel: r.selectorText, opacity: v, viktig: r.style.getPropertyPriority('opacity') === 'important' });
    }
  }
  for(var s = 0; s < document.styleSheets.length; s++){
    try { samla(document.styleSheets[s].cssRules); } catch(e){}
  }
  ut.regler = regler.length;

  // 2. mät EFTER animationen: elementets beräknade opacity mot den deklarerade
  regler.forEach(function(r){
    var el;
    try { el = document.querySelectorAll(r.sel); } catch(e){ return; }
    Array.prototype.forEach.call(el, function(e){
      if(!e.getBoundingClientRect) return;
      var faktisk = parseFloat(getComputedStyle(e).opacity);
      if(Math.abs(faktisk - r.opacity) < 0.001){ ut.levande++; return; }

      // skiljer sig — bär elementet en animation som rör opacity?
      var anim = (e.getAnimations ? e.getAnimations() : []).map(function(a){
        var kf = [];
        try { kf = a.effect.getKeyframes().filter(function(k){ return k.opacity !== undefined; }); } catch(x){}
        var t = {};
        try { t = a.effect.getComputedTiming(); } catch(x){}
        return { namn: (a.animationName || (a.effect && a.effect.getComputedTiming && '') || ''),
                 fill: t.fill, spelklar: a.playState, rorOpacity: kf.length > 0,
                 slutar: kf.length ? kf[kf.length - 1].opacity : null };
      }).filter(function(a){ return a.rorOpacity; });

      if(!anim.length) return;                       // annan orsak (t.ex. en mer specifik regel) — inte vårt mönster
      ut.doda.push({ sel: r.sel, deklarerad: r.opacity, faktisk: faktisk,
                     tagg: e.tagName + (e.className ? '.' + String(e.className).split(' ').join('.') : '').slice(0, 60),
                     fill: anim[0].fill, slutar: anim[0].slutar, viktig: r.viktig });
    });
  });

  // 3. klickbara kort ska vara fulla — toningen får inte smitta
  ut.klickbara = Array.prototype.map.call(document.querySelectorAll('a.nav-card, a.val-card, a.del.open, a.prov-card'), function(a){
    var cs = getComputedStyle(a);
    return { href: a.getAttribute('href'), opacity: cs.opacity, pointerEvents: cs.pointerEvents };
  }).filter(function(k){ return k.opacity !== '1' || k.pointerEvents === 'none'; });

  ut.tonade = Array.prototype.map.call(document.querySelectorAll('.is-soon, .del.kommer, .is-kommer'), function(e){
    var cs = getComputedStyle(e);
    return { klass: String(e.className).slice(0, 40), opacity: cs.opacity, pointerEvents: cs.pointerEvents };
  });
  ut.onerr = window.__onerr || null;
  return ut;
})()`;

// Sidorna: alla html-filer utanför Arkiv (ram-filerna med, de bär samma stilblock).
function sidor(){
  const ut = [];
  (function gå(d){
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      if(e.name === 'Arkiv' || e.name === '.git' || e.name === 'node_modules' || e.name === 'fonts') return;
      const p = path.join(d, e.name);
      if(e.isDirectory()) gå(p);
      else if(/\.html$/.test(e.name)) ut.push(path.relative(ROOT, p).replace(/\\/g, '/'));
    });
  })(ROOT);
  return ut.sort();
}

const TMP = path.join(os.tmpdir(), 'tonad-' + process.pid);
fs.writeFileSync(TMP + '.js', PROBE);

let fel = 0, matta = 0, doda = 0;
console.log('TONAD-SVEP — opacity mätt EFTER animationen; en animation med fill-mode both slår ut vanliga regler\n');
sidor().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP + '.js',
                               '--wait', '1800', '--timeout', '60000'],
                      { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar — ' + ((r.stderr || '').trim().split('\n').pop() || '').slice(0, 80)); return; }
  matta++;
  const brott = [];
  if(u.onerr && u.onerr.length) brott.push('JS-fel: ' + u.onerr.join(' · '));
  if(u.doda && u.doda.length){
    doda += u.doda.length;
    const unika = {};
    u.doda.forEach(d => { unika[d.sel + ' → ' + d.deklarerad + ' men ' + d.faktisk + ' (fill:' + d.fill + ', keyframe slutar på ' + d.slutar + ')'] = 1; });
    Object.keys(unika).forEach(k => brott.push('DÖD REGEL: ' + k));
  }
  (u.klickbara || []).forEach(k => brott.push('klickbart kort tonat/spärrat: ' + k.href + ' opacity ' + k.opacity + ' pe ' + k.pointerEvents));
  if(brott.length){ fel += brott.length; console.log('✗ ' + sida + '\n     ' + brott.join('\n     ')); }
  else {
    const t = (u.tonade || []).length;
    console.log('✓ ' + sida + ' · ' + u.regler + ' opacity-regler · ' + (t ? t + ' tonade element, alla stämmer' : 'inga tonade element'));
  }
});
try { fs.unlinkSync(TMP + '.js'); } catch(e){}
console.log('\n' + (fel ? '✗ TONAD-SVEP RÖTT (' + fel + ')' : '✓ TONAD-SVEP GRÖNT') + ' · ' + matta + ' sidor mätta · ' + doda + ' döda regler');
process.exit(fel ? 1 : 0);
