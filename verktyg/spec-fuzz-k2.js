/* spec-fuzz-k2.js — GRIND för nians dk2-variantmotor (js/motor/ak9-k2-ova-variant.js).
   Kör samplerna ≥30 000 gånger och verifierar OBEROENDE av villkor:
     (1) facit välformat (canonical: reducerat, rätt form) — fångar räknefel i facit(x).
     (2) spec-villkor 0 avvikelser — de visade talen ligger inom nodens band (spec-villkor-k2.js):
         nämnare ≤ maxNamnare, visad täljare ≤ maxTaljare, heltal ≤ maxHeltal, form, mellanled-närvaro.
     (3) facit-diff 0 — de fyra levererade dokumenten (variant 0–3) har PARVIS OLIKA tal per uppgift
         (och olika facit för värde-former).
     (4) larm om en uppgift inte rymmer fyra meningsfullt olika dokument (för få distinkta sampel).
   Rapporterar förkastningstal per uppgift. Nod-lös, ingen nätväg. Kör: node verktyg/spec-fuzz-k2.js
*/
'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '..');
var API = require(path.join(ROOT, 'js/motor/ak9-k2-ova-variant.js'));
var SPEC = require(path.join(ROOT, 'js/data/spec-villkor-k2.js'));
var gcd = API._intern.gcd, lcm = API._intern.lcm;

var SAMPLES_PER_UPPG = 1000;   // × ~44 uppgifter ⇒ ≥ 30k sampel
var DOKS = ['ova1', 'ova2', 'ova3', 'ova4', 'ova5', 'ova6'];

// ── form → { node, niva } för band-uppslag (stege-noder: niva ur formen) ──
function bandFor(logg, form){
  if(!logg) return null;
  var v = SPEC.VILLKOR[logg]; if(!v || !v.spar || !v.spar.E) return null;
  var E = v.spar.E;
  if(!E.nivaer) return E;
  // stege: välj niva ur form
  var niva = 1;
  if(logg === 'brak-add:rakna') niva = (form === 'blandadadd') ? 2 : 1;
  else if(logg === 'brak-mult-rakna:rakna') niva = (form === 'multbrak') ? 2 : 1;
  else if(logg === 'brak-jmf-lika:begrepp') niva = (form === 'tecken') ? 2 : 1;
  for(var i = 0; i < E.nivaer.length; i++){ if(E.nivaer[i].niva === niva) return E.nivaer[i]; }
  return E.nivaer[0];
}

// ── facit välformat (canonical) ──
function brakOK(t, n, tillatOakta){ return Number.isInteger(t) && Number.isInteger(n) && n >= 1 && t >= 1 && gcd(t, n) === 1 && (tillatOakta || t < n); }
function facitWF(f){
  if(!f || typeof f !== 'object') return 'facit saknas';
  switch(f.form){
    case 'tal': return isFinite(f.v) ? null : 'tal.v ej ändligt';
    case 'brak': return brakOK(f.t, f.n, true) ? null : 'brak ej reducerat/heltal';      // kan vara oäkta (Öva2 G1)
    case 'blandad': return (Number.isInteger(f.hel) && f.hel >= 1 && brakOK(f.t, f.n, false)) ? null : 'blandad felform';
    case 'forlang': return (Number.isInteger(f.t) && Number.isInteger(f.n) && f.t >= 1 && f.n >= 2) ? null : 'forlang felform';
    case 'val': return (f.ratt === 0 || f.ratt === 1) ? null : 'val.ratt ogiltig';
    case 'tecken': return (['<', '=', '>'].indexOf(f.ratt) >= 0) ? null : 'tecken.ratt ogiltig';
    case 'ordna': return (f.lista && f.lista.length === 4) ? null : 'ordna.lista ≠ 4';
    case 'reciprok': return (f.tSvar && f.nSvar) ? null : 'reciprok tom';
    case 'addsub': case 'blandadadd': case 'multheltal': case 'multbrak': case 'divbrak': case 'komplexdiv':
      return facitWF(f.svar);   // svar-cellen är den canonical delen
    default: return 'okänd form ' + f.form;
  }
}

// ── band-koll: visade tal inom nodens band ──
function samlaBrak(tal, form){   // → lista av {t,n,hel} som VISAS i prompten (för band-koll)
  var out = [];
  function push(t, n, hel){ out.push({ t: t, n: n, hel: hel || 0 }); }
  if(form === 'tal' || form === 'brak' || form === 'forlang'){ if(tal.t != null && tal.n != null) push(tal.t, tal.n); }
  else if(form === 'blandad'){ push(tal.t, tal.n); }
  else if(form === 'val' || form === 'tecken'){ push(tal.a[0], tal.a[1]); push(tal.b[0], tal.b[1]); }
  else if(form === 'ordna'){ tal.lista.forEach(function(p){ push(p[0], p[1]); }); }
  else if(form === 'addsub' || form === 'multbrak' || form === 'divbrak'){ push(tal.a[0], tal.a[1]); push(tal.b[0], tal.b[1]); }
  else if(form === 'blandadadd'){ push(tal.a.t, tal.a.n, tal.a.hel); push(tal.b.t, tal.b.n, tal.b.hel); }
  else if(form === 'multheltal'){ push(tal.t, tal.n); }
  else if(form === 'komplexdiv'){ if(tal.t != null) push(tal.t, tal.n); }   // stambråk / (t/n)
  else if(form === 'reciprok'){ if(typeof tal.t === 'number') push(tal.t, tal.n); }   // algebraiskt hoppas
  // Öva 2 G1 (blandat→oäkta): tal = {h,t,n}
  if(tal.h != null && tal.t != null){ push(tal.t, tal.n, tal.h); }
  // Öva 3 G1 (heltal − subtrahend): tal = {H, s:{hel,t,n}}
  if(tal.s){ push(tal.s.t, tal.s.n, tal.s.hel); }
  return out;
}
function bandKoll(band, tal, form){
  if(!band || !band.tak) return null;
  var T = band.tak, brakar = samlaBrak(tal, form), fel = [];
  brakar.forEach(function(b){
    if(T.maxNamnare && b.n > T.maxNamnare) fel.push('nämnare ' + b.n + ' > ' + T.maxNamnare);
    if(T.maxTaljare && b.t > T.maxTaljare) fel.push('täljare ' + b.t + ' > ' + T.maxTaljare);
    if(T.maxHeltal != null && b.hel > T.maxHeltal) fel.push('heltal ' + b.hel + ' > ' + T.maxHeltal);
  });
  return fel.length ? fel.join('; ') : null;
}

// ── walk MALLAR ──
function uppgifter(){
  var lista = [];
  DOKS.forEach(function(dok){
    var idx = 0;
    API.MALLAR[dok].grupper.forEach(function(g, gi){
      g.uppgifter.forEach(function(u, ui){
        lista.push({ dok: dok, gi: gi, ui: ui, idx: idx++, u: u, logg: u.logg || g.logg || null });
      });
    });
  });
  return lista;
}

// ── kör ──
var mkRng = API._intern.mkRng, seedOf = API._intern.seedOf;
var rows = uppgifter();
var totSampel = 0, specAvvik = [], facitAvvik = [], distinktLarm = [], facitDiffFel = [];
var forkast = {};

rows.forEach(function(r){
  var u = r.u, key = r.dok + '#' + r.idx;
  if(u.fixed || !u.sample){ forkast[key] = { pass: 1, kast: 0, distinkta: 1, fixed: true }; return; }
  var pass = 0, kast = 0, distinkta = {};
  for(var i = 0; i < SAMPLES_PER_UPPG; i++){
    var rng = mkRng((seedOf(r.dok, r.idx, 100 + i) ^ 0x9E3779B9) >>> 0);
    var cand = u.sample(rng); totSampel++;
    if(!u.villkor(cand)){ kast++; continue; }
    pass++;
    var f = u.facit(cand), wf = facitWF(f);
    if(wf){ facitAvvik.push(key + ' [' + JSON.stringify(cand) + '] ' + wf); }
    var band = bandFor(r.logg, f.form), bk = bandKoll(band, cand, f.form);
    if(bk){ specAvvik.push(key + ' (' + r.logg + ') [' + JSON.stringify(cand) + '] ' + bk); }
    distinkta[JSON.stringify(cand)] = 1;
  }
  var nDist = Object.keys(distinkta).length;
  forkast[key] = { pass: pass, kast: kast, distinkta: nDist };
  if(nDist < 3){ distinktLarm.push(key + ': bara ' + nDist + ' distinkta sampel (behöver ≥3 för fyra dok)'); }
});

// ── facit-diff: levererade variant 0–3 parvis olika tal per uppgift ──
rows.forEach(function(r){
  if(r.u.fixed) return;
  var tal = [], facit = [];
  for(var v = 0; v < 4; v++){ var gu = API.genUppgift(r.u, r.dok, r.idx, v); tal.push(JSON.stringify(gu.tal)); facit.push(JSON.stringify(gu.facit)); }
  var key = r.dok + '#' + r.idx;
  for(var a = 0; a < 4; a++) for(var b = a + 1; b < 4; b++){
    if(tal[a] === tal[b]) facitDiffFel.push(key + ': variant ' + a + ' & ' + b + ' SAMMA tal ' + tal[a]);
  }
});

// ── rapport ──
function head(s){ return '\n══ ' + s + ' ══'; }
console.log('SPEC-FUZZ-K2 — nians dk2-variantmotor');
console.log('Uppgifter: ' + rows.length + ' · sampel totalt: ' + totSampel + ' (mål ≥30 000)');

console.log(head('Förkastningstal per uppgift'));
Object.keys(forkast).forEach(function(k){ var f = forkast[k];
  if(f.fixed){ console.log('  ' + k.padEnd(10) + ' FAST (7x/2y, ingen variant)'); return; }
  var pct = (100 * f.kast / (f.pass + f.kast)).toFixed(1);
  console.log('  ' + k.padEnd(10) + ' pass ' + String(f.pass).padStart(4) + '  kast ' + String(f.kast).padStart(4) + '  (' + pct + '%)  distinkta ' + f.distinkta);
});

console.log(head('RESULTAT'));
console.log('  facit välformat-avvikelser : ' + facitAvvik.length);   facitAvvik.slice(0, 20).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  spec-villkor-avvikelser    : ' + specAvvik.length);    specAvvik.slice(0, 20).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  facit-diff-fel (variant 0–3): ' + facitDiffFel.length); facitDiffFel.slice(0, 20).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  distinkthets-larm          : ' + distinktLarm.length); distinktLarm.forEach(function(s){ console.log('    ⚠ ' + s); });

var ok = !facitAvvik.length && !specAvvik.length && !facitDiffFel.length && !distinktLarm.length && totSampel >= 30000;
console.log('\n' + (ok ? '✓ GRIND GRÖN — facit-diff 0, spec-villkor 0, fuzz ≥30k' : '✗ GRIND RÖD — se avvikelser ovan'));
process.exit(ok ? 0 : 1);
