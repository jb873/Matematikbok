/* mellanled-fuzz.js — MELLANLEDSRÄTTAREN PRÖVAD I WEBBLÄSAREN (order 2026-10-04).
 *
 * Rättaren avgör om elevens mellanled har samma termer som uttrycket med parenteserna borttagna
 * och tecknen bytta. Fem påståenden prövas på slumpade uttryck, och alla fem måste hålla i varje
 * dragning:
 *
 *   1  det mekaniskt byggda facitet godkänns              → ratt
 *   2  samma termer i omkastad ordning godkänns            → ratt   (multimängd, Joachims beslut)
 *   3  det hopslagna svaret underkänns                     → fel/hopslaget
 *      (det är hela poängen: ett värdeprov hade godkänt slutsvaret i mellanledsraden)
 *   4  ett bytt tecken underkänns med teckenbeskedet       → fel/tecken
 *   5  kravAv stämmer med en OBEROENDE kontroll av om det står minus framför en parentes
 *
 * KÖRS I HEADLESS CHROMIUM, inte bara i node: rättaren lever i elevens webbläsare, och ett prov i
 * en annan motor bevisar inte att den gör rätt där.
 *
 * KÖR:  node verktyg/mellanled-fuzz.js [--antal 30000] [--sabba]
 *       --sabba bryter facitbygget (ingen teckenväxling) → provet MÅSTE falla
 * Exit 1 vid avvikelse. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const ANTAL = (i => i >= 0 ? parseInt(args[i + 1], 10) : 30000)(args.indexOf('--antal')) || 30000;
const SABBA = args.includes('--sabba');
const SIDA = 'ak8/k2/d3-parentes/index.html';   // sidan som laddar mellanled-rattare.js
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var M = window.MellanledRattare, A = window.AlgBrak;
  if(!M || !A) return { saknas: true };
  var N = ${ANTAL}, SABBA = ${SABBA};

  var fro = 20261004;
  function slump(){ fro = (fro * 1103515245 + 12345) & 0x7fffffff; return fro / 0x7fffffff; }
  function heltal(a, b){ return a + Math.floor(slump() * (b - a + 1)); }
  var VAR = ['x', 'y', 'a', 'b'];

  function term(){
    var r = slump();
    if(r < 0.2) return String(heltal(1, 20));
    var k = heltal(1, 15), v = VAR[heltal(0, VAR.length - 1)];
    return (k === 1 ? '' : String(k)) + v;
  }
  function tecknadTerm(forst){
    var t = term();
    if(forst) return (slump() < 0.2 ? '-' : '') + t;
    return (slump() < 0.5 ? ' - ' : ' + ') + t;
  }
  function parentesInnehall(){
    var n = heltal(2, 3), s = tecknadTerm(true);
    for(var i = 1; i < n; i++) s += tecknadTerm(false);
    return s;
  }
  function uttryck(){
    var delar = [], n = heltal(1, 3);
    if(slump() < 0.5) delar.push(tecknadTerm(true));
    for(var i = 0; i < n; i++){
      var tkn = slump() < 0.65 ? '-' : '+';              // minus oftare: det är uppgiften
      var s = '(' + parentesInnehall() + ')';
      delar.push((delar.length === 0 ? (tkn === '-' ? '-' : '') : ' ' + tkn + ' ') + s);
    }
    return delar.join('');
  }

  // Facitets mellanled som TEXT, byggt ur modulens egen termlista.
  function facitText(u, sabba){
    var t = sabba
      ? A.termerAv(u.replace(/[()]/g, ''))        // SABBA: parenteser bara bortstrukna, inga tecken bytta
      : M.facitTermer(u);
    return t.map(function(x, k){
      return k === 0 ? x : (String(x)[0] === '-' ? ' - ' + String(x).slice(1) : ' + ' + x);
    }).join('');
  }
  function blanda(lista){
    var a = lista.slice();
    for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(slump() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  var fel = { facit: 0, ordning: 0, hopslaget: 0, tecken: 0, krav: 0 }, exempel = [];
  function notera(vad, u, extra){
    fel[vad]++;
    if(exempel.length < 6) exempel.push({ vad: vad, uttryck: u, extra: extra });
  }

  for(var i = 0; i < N; i++){
    var u = uttryck();

    // 1 — facitet godkänns
    var f = facitText(u, SABBA);
    var r1 = M.grade(f, u, 'kravt');
    if(r1.status !== 'ratt') notera('facit', u, f + ' → ' + r1.status + '/' + (r1.fall || ''));

    // 2 — omkastad ordning godkänns
    var t = M.facitTermer(u);
    if(t.length > 1){
      var b = blanda(t);
      var bt = b.map(function(x, k){ return k === 0 ? x : (String(x)[0] === '-' ? ' - ' + String(x).slice(1) : ' + ' + x); }).join('');
      var r2 = M.grade(bt, u, 'kravt');
      if(r2.status !== 'ratt') notera('ordning', u, bt + ' → ' + r2.status);
    }

    // 3 — det hopslagna svaret underkänns som hopslaget
    if(t.length > 2){
      var poly = null;
      try { poly = A.polyForm(t.join('+').replace(/\\+-/g, '-')); } catch(e){ poly = null; }
      if(poly && poly.text && poly.text !== f.replace(/\\s/g, '')){
        var r3 = M.grade(poly.text, u, 'kravt');
        if(!(r3.status === 'fel' && r3.fall === 'hopslaget'))
          notera('hopslaget', u, poly.text + ' → ' + r3.status + '/' + (r3.fall || ''));
      }
    }

    // 4 — ett bytt tecken ger teckenbeskedet
    if(t.length > 1){
      var k = heltal(0, t.length - 1), v = t.slice();
      v[k] = String(v[k])[0] === '-' ? String(v[k]).slice(1) : '-' + v[k];
      var vt = v.map(function(x, j){ return j === 0 ? x : (String(x)[0] === '-' ? ' - ' + String(x).slice(1) : ' + ' + x); }).join('');
      var r4 = M.grade(vt, u, 'kravt');
      if(!(r4.status === 'fel' && r4.fall === 'tecken'))
        notera('tecken', u, vt + ' → ' + r4.status + '/' + (r4.fall || ''));
    }

    // 5 — kravAv mot en oberoende kontroll: finns '-(' eller '- (' i uttrycket?
    var vantat = /-\\s*\\(/.test(u) ? 'kravt' : (/\\(/.test(u) ? 'frivilligt' : null);
    if(M.kravAv(u) !== vantat) notera('krav', u, M.kravAv(u) + ' vs ' + vantat);
  }

  return { onerr: window.__onerr || null, dragningar: N, fel: fel, exempel: exempel };
})()`;

const TMP = path.join(os.tmpdir(), 'mellanledfuzz-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);
console.log('MELLANLED-FUZZ — ' + ANTAL + ' dragningar i headless Chromium'
  + (SABBA ? '  [SABBA: facit utan teckenväxling]' : '') + '\n');

const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, SIDA)), TMP,
  '--vanta-pa', 'laddad', '--timeout', '300000'], { encoding: 'utf8', timeout: 360000 });
try { fs.unlinkSync(TMP); } catch(e){}

let u = null;
try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
if(!u){ console.log('✗ inget svar från sidan'); process.exit(1); }
if(u.saknas){ console.log('✗ MellanledRattare eller AlgBrak saknas på sidan'); process.exit(1); }

const summa = Object.keys(u.fel).reduce((a, k) => a + u.fel[k], 0);
console.log('  facitet godkänns      : ' + (u.fel.facit ? '✗ ' + u.fel.facit : '✓'));
console.log('  omkastad ordning      : ' + (u.fel.ordning ? '✗ ' + u.fel.ordning : '✓'));
console.log('  hopslaget underkänns  : ' + (u.fel.hopslaget ? '✗ ' + u.fel.hopslaget : '✓'));
console.log('  bytt tecken → tecken  : ' + (u.fel.tecken ? '✗ ' + u.fel.tecken : '✓'));
console.log('  kravAv mot oberoende  : ' + (u.fel.krav ? '✗ ' + u.fel.krav : '✓'));
u.exempel.forEach(e => console.log('   ' + e.vad + ': ' + e.uttryck + '  |  ' + e.extra));
if(u.onerr) console.log('  JS-fel: ' + JSON.stringify(u.onerr).slice(0, 120));

console.log('\n' + (summa ? '✗ MELLANLED-FUZZ RÖD (' + summa + ' avvikelser)' : '✓ MELLANLED-FUZZ GRÖN')
  + ' · ' + u.dragningar + ' dragningar');
process.exit(summa ? 1 : 0);
