/* spec-fuzz-akr9.js — GRIND för nians Åk9-spårets dk2-variantmotor (js/motor/ak9-k2-akr9-ova-variant.js).
   Syster till spec-fuzz-k2.js (E-spåret) men för MÅL-spåret + dess nya former (mgn, decbrak, kedja).
   Nians band ligger INLINE här (NIAN_BAND) — E-spårets spec-villkor-k2.js/spec-fuzz-k2.js rörs INTE
   (byte-identiska). Banden är härledda ur Joachims två dokument (golv OCH tak = öva-uppgifterna).

   Kör samplerna ≥30 000 gånger och verifierar OBEROENDE av villkor:
     (1) facit välformat (reducerat, rätt form; negativ täljare tillåten i 'brak' — nian).
     (2) spec-villkor 0 — visade tal inom nodens band (nämnare/täljare/heltal/multiplikator).
     (3) facit-diff 0 — levererade variant 0–3 har PARVIS OLIKA tal per uppgift (och olika facit
         för värde-former; tecken undantas — bunden teckenmängd).
     (4) larm om < 3 distinkta sampel (för få för fyra dokument).
   Nod-lös, ingen nätväg. Kör: node verktyg/spec-fuzz-akr9.js */
'use strict';
var path = require('path');
var ROOT = path.resolve(__dirname, '..');
var API = require(path.join(ROOT, 'js/motor/ak9-k2-akr9-ova-variant.js'));
var SPEC = require(path.join(ROOT, 'js/data/spec-villkor-k2.js'));
var gcd = API._intern.gcd, mkRng = API._intern.mkRng, seedOf = API._intern.seedOf, svarSig = API._intern.svarSig;
var SAMPLES_PER_UPPG = 1000;   // × ~51 variabla uppgifter ⇒ ≥ 30k
var DOKS = ['ova1', 'ova2'];

// ── NIANS BAND läses ur spec-villkor-k2.js (spar.nian) — inte längre inline (redigerbar data, en hemvist). ──
//   bandFor(logg, form) → tak {maxNamnare, maxTaljare, maxHeltal, maxMultiplikator, maxResultNamnare}.
//   Noder som spänner två former (add/sub, mult-rakna, div-inv) har nivaer; niva väljs ur formen (som E:s bandFor).
function nivaForForm(logg, form){
  if(logg === 'brak-add:rakna' || logg === 'brak-sub:rakna') return form === 'kedja' ? 2 : 1;
  if(logg === 'brak-mult-rakna:rakna') return form === 'multbrak' ? 2 : 1;
  if(logg === 'brak-div-inv:rakna') return form === 'kedja' ? 2 : 1;
  return 1;
}
function bandFor(logg, form){
  var P = SPEC.band(logg, 'nian'); if(!P) return null;
  if(!P.nivaer) return P.tak;
  var niva = nivaForForm(logg, form);
  for(var i = 0; i < P.nivaer.length; i++){ if(P.nivaer[i].niva === niva) return P.nivaer[i].tak; }
  return P.nivaer[0].tak;
}

// ── facit välformat ──
function brakOK(t, n, tillatOakta){ return Number.isInteger(t) && Number.isInteger(n) && n >= 2 && Math.abs(t) >= 1 && gcd(Math.abs(t), n) === 1 && (tillatOakta || Math.abs(t) < n); }
function svarWF(f){
  if(!f || typeof f !== 'object') return 'svar saknas';
  if(f.form === 'tal') return (Number.isInteger(f.v)) ? null : 'tal.v ej heltal';
  if(f.form === 'brak') return brakOK(f.t, f.n, false) ? null : 'brak ej reducerat/proper';   // proper, kan vara negativ
  if(f.form === 'blandad') return (Number.isInteger(f.hel) && f.hel >= 1 && brakOK(f.t, f.n, false) && f.t >= 1) ? null : 'blandad felform';
  return 'okänd svarform ' + f.form;
}
function finWF(fin){
  if(fin.k === 'dec') return Number.isInteger(fin.x) ? null : 'fin.dec ej heltal';
  if(fin.k === 'br') return brakOK(fin.t, fin.n, false) && fin.t >= 1 ? null : 'fin.br ej proper/reducerat';
  if(fin.k === 'mi') return (Number.isInteger(fin.h) && fin.h >= 1 && brakOK(fin.t, fin.n, false) && fin.t >= 1) ? null : 'fin.mi felform';
  return 'okänd fin.k ' + fin.k;
}
function facitWF(f){
  if(!f || typeof f !== 'object') return 'facit saknas';
  switch(f.form){
    case 'ordna': return (f.lista && f.lista.length === 5) ? null : 'ordna.lista ≠ 5';
    case 'tecken': return (['<', '>'].indexOf(f.ratt) >= 0) ? null : 'tecken.ratt ogiltig';
    case 'mgn': return (Number.isInteger(f.L) && f.L >= 2 && Number.isInteger(f.a[0] * f.L / f.a[1]) && Number.isInteger(f.b[0] * f.L / f.b[1])) ? null : 'mgn felform';
    case 'reciprok': return (f.facitT && f.facitN) ? null : 'reciprok tom';
    case 'kedja': return (isFinite(f.v) && f.fin) ? finWF(f.fin) : 'kedja.v/fin saknas';
    case 'addsub': case 'multheltal': case 'multbrak': case 'divbrak': case 'komplexdiv': case 'decbrak':
      return svarWF(f.svar);
    default: return 'okänd form ' + f.form;
  }
}

// ── band-koll: visade tal inom nodens band ──
function pushOp(op, F){ if(Array.isArray(op)){ F.fracs.push({ t: op[0], n: op[1] }); } else { F.fracs.push({ t: op.t, n: op.n }); F.hels.push(op.h); } }
function samla(form, tal){
  var F = { fracs: [], hels: [], muls: [] };
  if(form === 'ordna'){ tal.lista.forEach(function(p){ F.fracs.push({ t: p[0], n: p[1] }); }); }
  else if(form === 'tecken' || form === 'mgn' || form === 'addsub' || form === 'divbrak'){ pushOp(tal.a, F); pushOp(tal.b, F); }
  else if(form === 'decbrak'){ F.fracs.push({ t: tal.brak[0], n: tal.brak[1] }); if(tal.hel) F.hels.push(tal.hel); }
  else if(form === 'multheltal'){ F.fracs.push({ t: tal.t, n: tal.n }); F.muls.push(tal.H); }
  else if(form === 'multbrak'){ pushOp(tal.a, F); pushOp(tal.b, F); }
  else if(form === 'komplexdiv'){ F.fracs.push({ t: tal.t, n: tal.n }); F.muls.push(tal.H); }
  else if(form === 'reciprok'){ if(typeof tal.t === 'number'){ F.fracs.push({ t: tal.t, n: tal.n }); } }   // algebraiskt hoppas
  else if(form === 'kedja'){ if(tal.faktorer){ tal.faktorer.forEach(function(op){ pushOp(op, F); }); } else if(tal.a && tal.b){ pushOp(tal.a, F); pushOp(tal.b, F); } }
  return F;
}
function bandKoll(logg, form, tal){
  var T = bandFor(logg, form); if(!T) return 'inget nian-band för ' + logg + '/' + form;
  var F = samla(form, tal), fel = [];
  F.fracs.forEach(function(f){ if(f.n > T.maxNamnare) fel.push('nämnare ' + f.n + ' > ' + T.maxNamnare); if(Math.abs(f.t) > T.maxTaljare) fel.push('täljare ' + f.t + ' > ' + T.maxTaljare); });
  F.hels.forEach(function(h){ if(h > (T.maxHeltal || 0)) fel.push('heltal ' + h + ' > ' + (T.maxHeltal || 0)); });
  F.muls.forEach(function(m){ if(m > (T.maxMultiplikator || 0)) fel.push('multiplikator ' + m + ' > ' + (T.maxMultiplikator || 0)); });
  return fel.length ? fel.join('; ') : null;
}
// SVARETS nämnare aldrig svårare än orig — taket (maxResultNamnare) läses ur nodens nian-band.
function resultN(f){ var s = f.svar || f.fin; if(!s) return 1;
  if(s.form === 'blandad' || s.form === 'brak') return s.n; if(s.k === 'br' || s.k === 'mi') return s.n; return 1; }
function resultKoll(logg, f){ var T = bandFor(logg, f.form); var cap = T && T.maxResultNamnare; if(!cap) return null;
  var n = resultN(f); return n > cap ? 'svarsnämnare ' + n + ' > ' + cap : null; }

// ── walk MALLAR (idx per DOKUMENT, som genereraDokument) ──
function uppgifter(){
  var lista = [];
  DOKS.forEach(function(dok){
    var idx = 0;
    API.MALLAR[dok].grupper.forEach(function(g, gi){
      g.uppgifter.forEach(function(u, ui){ lista.push({ dok: dok, gi: gi, ui: ui, idx: idx++, u: u, logg: u.logg || g.logg || null }); });
    });
  });
  return lista;
}

var rows = uppgifter();
var totSampel = 0, facitAvvik = [], specAvvik = [], distinktLarm = [], facitDiffFel = [], forkast = {};

rows.forEach(function(r){
  var u = r.u, key = r.dok + '#' + r.idx + ' G' + (r.gi + 1) + String.fromCharCode(97 + r.ui);
  if(u.fixed || !u.sample){ forkast[key] = { fixed: true }; return; }
  var pass = 0, kast = 0, distinkta = {};
  for(var i = 0; i < SAMPLES_PER_UPPG; i++){
    var rng = mkRng((seedOf(r.dok, r.idx, 500 + i) ^ 0x9E3779B9) >>> 0);
    var cand = u.sample(rng); totSampel++;
    if(!u.villkor(cand)){ kast++; continue; }
    pass++;
    var f = u.facit(cand), wf = facitWF(f);
    if(wf) facitAvvik.push(key + ' ' + wf + ' [' + JSON.stringify(cand) + ']');
    var bk = bandKoll(r.logg, f.form, cand) || resultKoll(r.logg, f);
    if(bk) specAvvik.push(key + ' (' + r.logg + ') ' + bk + ' [' + JSON.stringify(cand) + ']');
    distinkta[JSON.stringify(cand)] = 1;
  }
  var nDist = Object.keys(distinkta).length;
  forkast[key] = { pass: pass, kast: kast, distinkta: nDist };
  if(nDist < 3) distinktLarm.push(key + ': bara ' + nDist + ' distinkta sampel');
});

// ── facit-diff: levererade variant 0–3 parvis olika tal + facit ──
var FACIT_FRI = { tecken: 1 };
rows.forEach(function(r){
  if(r.u.fixed) return;
  var tal = [], sig = [], form = null;
  for(var v = 0; v < 4; v++){ var gu = API.genUppgift(r.u, r.dok, r.idx, v); tal.push(JSON.stringify(gu.tal)); sig.push(svarSig(gu.facit)); form = gu.facit.form; }
  var key = r.dok + '#' + r.idx + ' G' + (r.gi + 1) + String.fromCharCode(97 + r.ui);
  for(var a = 0; a < 4; a++) for(var b = a + 1; b < 4; b++){
    if(tal[a] === tal[b]) facitDiffFel.push(key + ': variant ' + a + ' & ' + b + ' SAMMA tal');
    else if(sig[a] === sig[b] && !FACIT_FRI[form]) facitDiffFel.push(key + ' (' + form + '): variant ' + a + ' & ' + b + ' SAMMA facit ' + sig[a]);
  }
});

// ── rapport ──
function head(s){ return '\n══ ' + s + ' ══'; }
console.log('SPEC-FUZZ-AKR9 — nians Åk9-spårets dk2-variantmotor');
console.log('Uppgifter: ' + rows.length + ' · sampel totalt: ' + totSampel + ' (mål ≥30 000)');
console.log(head('Förkastningstal per uppgift'));
Object.keys(forkast).forEach(function(kk){ var f = forkast[kk];
  if(f.fixed){ console.log('  ' + kk.padEnd(18) + ' FAST'); return; }
  var pct = (100 * f.kast / (f.pass + f.kast)).toFixed(1);
  console.log('  ' + kk.padEnd(18) + ' pass ' + String(f.pass).padStart(4) + '  kast ' + String(f.kast).padStart(4) + '  (' + pct + '%)  distinkta ' + f.distinkta);
});
console.log(head('RESULTAT'));
console.log('  facit-välformat-avvikelser : ' + facitAvvik.length); facitAvvik.slice(0, 20).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  spec-villkor-avvikelser    : ' + specAvvik.length);  specAvvik.slice(0, 20).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  facit-diff-fel (variant 0–3): ' + facitDiffFel.length); facitDiffFel.slice(0, 20).forEach(function(s){ console.log('    ✗ ' + s); });
console.log('  distinkthets-larm          : ' + distinktLarm.length); distinktLarm.forEach(function(s){ console.log('    ⚠ ' + s); });
var ok = !facitAvvik.length && !specAvvik.length && !facitDiffFel.length && !distinktLarm.length && totSampel >= 30000;
console.log('\n' + (ok ? '✓ GRIND GRÖN — facit-diff 0, spec-villkor 0, fuzz ≥30k' : '✗ GRIND RÖD — se avvikelser'));
process.exit(ok ? 0 : 1);
