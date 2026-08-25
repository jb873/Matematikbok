/* spec-fuzz-nian.js — GRIND för nians två band-drivna dk2-drillgeneratorer (ovamer-k2-nian.js).
   Kör genMgn + genNarmevardeOrdna ≥30 000 gånger och verifierar OBEROENDE:
     (1) facit korrekt (facit-diff 0) — genererat facit = oberoende omräkning (L = lcm; ordning = sort).
     (2) spec-villkor 0 — de visade talen ligger inom nodens band (spec-villkor-k2.js spar.nian).
     (3) distinkthet — tillräckligt många olika uppgifter (en drill ska inte upprepa sig).
   Bandet är facit för när generatorn är klar. Nod-lös, ingen nätväg. Kör: node verktyg/spec-fuzz-nian.js */
'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '..');
var G = require(path.join(ROOT, 'js/motor/ovamer/ovamer-k2-nian.js'));
var SPEC = require(path.join(ROOT, 'js/data/spec-villkor-k2.js'));
var gcd = G._gcd, lcm = G._lcm;
var N = 15000;   // × 2 generatorer ⇒ ≥ 30k

function mkRng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = (a + 0x6D2B79F5) | 0;
  var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function proper(t, n){ return Number.isInteger(t) && Number.isInteger(n) && t >= 1 && t < n && n >= 2 && gcd(t, n) === 1; }   // reducerad (mgn-operander)
function akta(t, n){ return Number.isInteger(t) && Number.isInteger(n) && t >= 1 && t < n && n >= 2; }   // äkta (band 'proper' för närmevärde-ordna; orig 4/12)

// ── genMgn ──
var mgnTak = SPEC.band('brak-mgn:rakna', 'nian').tak;
var mFacit = [], mSpec = [], mDist = {};
for(var i = 0; i < N; i++){
  var u = G.genMgn(mkRng((i * 2654435761) >>> 0));
  var a = u.a, b = u.b;
  // facit: L = lcm(na,nb)?
  if(u.L !== lcm(a[1], b[1])) mFacit.push('L ' + u.L + ' ≠ lcm(' + a[1] + ',' + b[1] + ')=' + lcm(a[1], b[1]));
  // band: proper reducerade, gemensam faktor, ingen delar den andra, nämnare/täljare/L inom tak
  var fel = [];
  if(!proper(a[0], a[1]) || !proper(b[0], b[1])) fel.push('ej proper/reducerad');
  if(gcd(a[1], b[1]) === 1) fel.push('nämnare saknar gemensam faktor');
  if(a[1] % b[1] === 0 || b[1] % a[1] === 0) fel.push('en nämnare delar den andra (ej båda-förläng)');
  if(a[1] > mgnTak.maxNamnare || b[1] > mgnTak.maxNamnare) fel.push('nämnare > ' + mgnTak.maxNamnare);
  if(a[0] > mgnTak.maxTaljare || b[0] > mgnTak.maxTaljare) fel.push('täljare > ' + mgnTak.maxTaljare);
  if(u.L > mgnTak.maxResultNamnare) fel.push('minsta gem. nämnare ' + u.L + ' > ' + mgnTak.maxResultNamnare);
  if(fel.length) mSpec.push(JSON.stringify(u) + ' — ' + fel.join('; '));
  mDist[a[0] + '/' + a[1] + '·' + b[0] + '/' + b[1]] = 1;
}

// ── genNarmevardeOrdna ──
var nTak = SPEC.band('brak-jmf-narmevarde:resonera', 'nian').tak, nKravs = SPEC.band('brak-jmf-narmevarde:resonera', 'nian').kravs;
var nFacit = [], nSpec = [], nDist = {};
for(var j = 0; j < N; j++){
  var w = G.genNarmevardeOrdna(mkRng((j * 40503 + 7) >>> 0));
  var lista = w.lista, vs = lista.map(function(p){ return p[0] / p[1]; });
  // facit: ordning = oberoende sort?
  var idealt = lista.map(function(p, ix){ return { ix: ix, v: p[0] / p[1] }; }).sort(function(x, y){ return x.v - y.v; }).map(function(o){ return o.ix; });
  if(JSON.stringify(w.ordning) !== JSON.stringify(idealt)) nFacit.push('ordning ' + JSON.stringify(w.ordning) + ' ≠ ' + JSON.stringify(idealt));
  // band: antal, proper, nämnare ≤ tak, spann ∈ [fonsterMin, fonster], min-gap
  var fel2 = [];
  if(lista.length !== nTak.antal) fel2.push('antal ' + lista.length + ' ≠ ' + nTak.antal);
  lista.forEach(function(p){ if(!akta(p[0], p[1])) fel2.push('ej äkta ' + p[0] + '/' + p[1]); if(p[1] > nTak.maxNamnare) fel2.push('nämnare ' + p[1] + ' > ' + nTak.maxNamnare); });
  var sorted = vs.slice().sort(function(x, y){ return x - y; });
  for(var g = 1; g < sorted.length; g++){ if(sorted[g] - sorted[g - 1] < nKravs.minGap - 1e-9) fel2.push('min-gap ' + (sorted[g] - sorted[g - 1]).toFixed(4) + ' < ' + nKravs.minGap); }
  var spann = sorted[sorted.length - 1] - sorted[0];
  if(spann > nKravs.fonster + 1e-9) fel2.push('spann ' + spann.toFixed(4) + ' > ' + nKravs.fonster);
  if(spann < nKravs.fonsterMin - 1e-9) fel2.push('spann ' + spann.toFixed(4) + ' < ' + nKravs.fonsterMin);
  if(fel2.length) nSpec.push(JSON.stringify(lista) + ' — ' + fel2.join('; '));
  nDist[lista.map(function(p){ return p[0] + '/' + p[1]; }).sort().join(',')] = 1;
}

function head(s){ return '\n══ ' + s + ' ══'; }
console.log('SPEC-FUZZ-NIAN — två band-drivna dk2-drillgeneratorer · ' + (2 * N) + ' sampel (mål ≥30 000)');
console.log(head('genMgn (brak-mgn:rakna)'));
console.log('  facit-diff (L ≠ lcm)      : ' + mFacit.length); mFacit.slice(0, 10).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  spec-villkor-avvikelser   : ' + mSpec.length);  mSpec.slice(0, 10).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  distinkta uppgifter       : ' + Object.keys(mDist).length);
console.log(head('genNarmevardeOrdna (brak-jmf-narmevarde:resonera)'));
console.log('  facit-diff (ordning fel)  : ' + nFacit.length); nFacit.slice(0, 10).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  spec-villkor-avvikelser   : ' + nSpec.length);  nSpec.slice(0, 10).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  distinkta uppgifter       : ' + Object.keys(nDist).length);

var ok = !mFacit.length && !mSpec.length && !nFacit.length && !nSpec.length
  && Object.keys(mDist).length >= 50 && Object.keys(nDist).length >= 50;
console.log('\n' + (ok ? '✓ GRIND GRÖN — facit-diff 0, spec-villkor 0, fuzz ≥30k' : '✗ GRIND RÖD — se avvikelser'));
process.exit(ok ? 0 : 1);
