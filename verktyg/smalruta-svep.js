/* smalruta-svep.js — RUTOR MED ETT FAST MÅTT OCH INGEN KOPPLING TILL INNEHÅLLET (order 2026-09-29).

   En smal ruta är avsiktlig: exponenten ska SE ut som en exponent, inte som ett andra likadant
   fält. Men ett mått är en FORM, inte ett tak — exponentens mellanled bär ett uttryck: 3⁴ · 3⁵
   skrivs med 4 + 5 i exponenten.

   Svepet mäter tre tal för varje ruta:
     • CSS-måttet  — rutans egen bredd innan någon inline-bredd satts (det formgivaren valde)
     • efter grow  — bredden när rutan är ifylld
     • behovet     — textens bredd, mätt med canvas i rutans EGET typsnitt
   och delar in ruttyperna i fyra utfall:
     växer       måttet är ett golv, bredden följer innehållet
     FAST        bredden rör sig inte alls (CSS !important, eller ingen grow)
     KRYMPER     grow sätter en bredd UNDER rutans CSS-mått (ett generiskt golv slår formgivningen)
     KLIPPER     texten får inte plats i den bredd rutan faktiskt har

   Textbredden mäts med canvas, inte med scrollWidth: en <input> rapporterar samma scrollWidth som
   clientWidth så fort texten scrollats, och döljer därmed precis det svepet letar efter.

   KÖR:  node verktyg/smalruta-svep.js [--sida <delsträng>]
   Exit 1 när en ruta klipper. Ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const args = process.argv.slice(2);
if(Sidor.lista(args, sidor())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var ut = { onerr: window.__onerr || null, typer: {} };
  function synlig(el){ return !!el.offsetParent; }
  function textbredd(inp, txt){
    var cs = getComputedStyle(inp);
    var c = document.createElement('canvas').getContext('2d');
    c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    return Math.ceil(c.measureText(txt).width);
  }
  function inreBredd(inp){
    var cs = getComputedStyle(inp);
    return Math.round(inp.getBoundingClientRect().width
         - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0)
         - parseFloat(cs.borderLeftWidth || 0) - parseFloat(cs.borderRightWidth || 0));
  }
  // Rutans EGNA mått: bredden utan inline-bredd. Måste läsas medan rutan är synlig.
  function cssMatt(inp){
    var inline = inp.style.width;
    inp.style.width = '';
    var w = Math.round(inp.getBoundingClientRect().width);
    inp.style.width = inline;
    return w;
  }
  // Provsträngen ska vara innehåll rutan RIMLIGEN kan behöva bära — inte ett extremfall.
  function provtext(inp){
    if(inp.matches('.ak8-pexp,.ak8-gpe')) return '12 + 15';
    if(inp.matches('.ak8-pbase,.ak8-gpb,.ak8-gpk')) return '3,74';
    if(inp.matches('.fr-ruta,.ak8-frt,.ak8-frn,.ak8-bt,.ak8-bn')) return '144';
    if(inp.matches('.ak8-sign')) return '−';
    if(inp.matches('.ak8-in-sm')) return '1234';
    // En uttrycksruta bär ett uttryck; en talruta bär ett tal. Att prova "3 + 4 · 2 − 8" i varje
    // svarsruta fäller varje ruta som är formgiven för ett tal — orimligt innehåll ger orimliga
    // brott, och rapporten blir oläslig. Samma lärdom som de tjugosex falska brotten i ytkontraktet.
    var uttryck = inp.closest('.ak8-expr')
      || inp.matches('.ak8-mel,.ak8-exprtxt,.ak8-in-oms,.ak8-mh,[data-vars],[data-mellan],[data-oms],[data-term]');
    return uttryck ? '12 + 15' : '1234';
  }
  function matType(inp){
    var k = (inp.className || '').split(/\\s+/).filter(function(c){ return c && c !== 'ak8-in' && c !== 'ovn-in'; });
    return k.length ? k.join('.') : (inp.className || 'okand');
  }

  function mat(root){
    var rutor = Array.prototype.filter.call(root.querySelectorAll('input.ak8-in, input.ovn-in'), synlig);
    rutor.forEach(function(inp){
      if(inp.disabled || inp.readOnly) return;
      var typ = matType(inp), gammalt = inp.value;
      var css = cssMatt(inp);
      // FORMGIVET MÅTT: rutan har en egen CSS-regel skriven för sitt innehåll. Listan läses ur
      // AK8_UI, inte ur svepet — annars vore det ett undantag i grinden i stället för ett kontrakt.
      var formgivet = !!(window.AK8_UI && AK8_UI.EGET_MATT && inp.matches(AK8_UI.EGET_MATT));
      inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
      var tom = Math.round(inp.getBoundingClientRect().width);
      var txt = provtext(inp);
      txt.split('').forEach(function(c){ inp.value += c; inp.dispatchEvent(new Event('input', { bubbles: true })); });
      var bredd = Math.round(inp.getBoundingClientRect().width);
      var inre = inreBredd(inp), behovs = textbredd(inp, inp.value);
      var tomInre = inre - (bredd - tom);        // inre bredd som tom ruta hade
      var post = ut.typer[typ] || (ut.typer[typ] = { provade:0, css:css, tom:tom, bredd:bredd,
                                                     klipper:0, krymper:0, vaxer:0, kravde:0,
                                                     formgivet:formgivet, exempel:[] });
      post.provade++;
      if(behovs > tomInre) post.kravde++;        // texten rymdes inte i tomma måttet → växt KRÄVDES
      if(bredd > tom) post.vaxer++;
      if(tom < css) post.krymper++;
      if(behovs > inre + 1){
        post.klipper++;
        if(post.exempel.length < 3) post.exempel.push('"' + inp.value + '" behover ' + behovs + ' px, rutan ger ' + inre);
      } else if(post.exempel.length < 1){
        post.exempel.push('"' + inp.value + '" ' + tom + ' -> ' + bredd + ' px (css ' + css + ')');
      }
      inp.value = gammalt; inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
  if(nav.length){
    nav.forEach(function(k){
      if(k.disabled) return;
      k.click();
      var m = Array.prototype.filter.call(document.querySelectorAll('.blad-mount'), function(e){ return !e.hidden && e.offsetParent; })[0]
           || document.querySelector('[id^="sheet-"]') || document.body;
      mat(m);
    });
  } else {
    mat(document.body);
  }
  ut.onerr = window.__onerr || null;
  return ut;
})()`;

// Sidmängden bor i verktyg/sidor.js — EN upptäckare för alla svep (V9). Här låg förut en
// ordagrann kopia av samma readdir-funktion; fyra verktyg bar var sin.
function sidor(){ return Sidor.blad(); }

const TMP = path.join(os.tmpdir(), 'smalruta-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);
let fel = 0, typer = {}, sidorMatta = 0;
console.log('SMALRUTE-SVEP — måttet ska vara ett golv, inte ett tak\n');
sidor().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
                               '--vanta-pa', 'blad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  sidorMatta++;
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + u.onerr.join(' | ')); }
  Object.keys(u.typer || {}).forEach(typ => {
    const t = u.typer[typ];
    if(!typer[typ]) typer[typ] = { provade:0, klipper:0, krymper:0, vaxer:0, kravde:0, css:t.css, tom:t.tom,
                                   bredd:t.bredd, formgivet:t.formgivet, exempel:[], sidor:[], krympsidor:[] };
    const T = typer[typ];
    T.provade += t.provade; T.klipper += t.klipper; T.krymper += t.krymper; T.vaxer += t.vaxer;
    T.kravde += t.kravde;
    t.exempel.forEach(e => { if(T.exempel.length < 3) T.exempel.push(e); });
    if(t.klipper && T.sidor.indexOf(sida) < 0) T.sidor.push(sida);
    if(t.krymper && T.krympsidor.indexOf(sida) < 0) T.krympsidor.push(sida);
  });
});
try { fs.unlinkSync(TMP); } catch(e){}

// En ruta som inte växte kan vara två helt olika saker: den rymde texten ändå (bra), eller den
// kunde inte växa fast den behövde (ett fast mått som klipper vid nästa tecken). Skilj dem åt —
// annars döljer ordet FAST både det harmlösa och det som ska rättas.
function utfall(t){
  if(t.klipper) return 'KLIPPER ' + t.klipper;
  if(t.krymper) return (t.formgivet ? 'KRYMPER ' : 'krymper ') + t.krymper;
  if(!t.kravde) return 'ryms';
  if(t.vaxer)   return 'växer';
  return 'FAST ' + t.kravde;
}
Object.keys(typer).sort().forEach(typ => {
  const t = typer[typ], u = utfall(t);
  const fastBrist = t.kravde && !t.vaxer && !t.klipper;          // behövde växa, kunde inte
  const krymptBort = t.krymper && t.formgivet;                   // formgivet mått överskrivet av grow
  const ok = !t.klipper && !krymptBort && !fastBrist;
  if(t.klipper) fel += t.klipper;
  if(krymptBort) fel += t.krymper;
  if(fastBrist) fel += t.kravde;
  console.log((ok ? '✓ ' : '✗ ') + typ.padEnd(24) + ' ' + u.padEnd(12)
    + ' css ' + String(t.css).padStart(3) + ' px · tom ' + String(t.tom).padStart(3)
    + ' px · ' + t.provade + ' provade'
    + (t.exempel.length ? '\n     ' + t.exempel.join('\n     ') : '')
    + (t.sidor.length ? '\n     klipper på: ' + t.sidor.slice(0, 3).join(', ') : '')
    + (t.krympsidor.length ? '\n     krymper på: ' + t.krympsidor.slice(0, 3).join(', ') : ''));
});
console.log('\n' + (fel ? '✗ SMALRUTE-SVEP RÖTT (' + fel + ')' : '✓ SMALRUTE-SVEP GRÖNT')
  + ' · ' + Object.keys(typer).length + ' ruttyper på ' + sidorMatta + ' sidor');
process.exit(fel ? 1 : 0);
