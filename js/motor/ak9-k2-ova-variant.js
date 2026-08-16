/* ak9-k2-ova-variant.js — NIANS dk2 "Räkna med bråk", E-spårets öva-dokument. Variant-motor (dk1-modell:
   författa-först — dokument 1 = Joachims exakta tal (orig), varianterna samplas runt det i FAS 4).
   ─────────────────────────────────────────────────────────────────────────────────────────────────
   FAS 3: bara dokument 1 (orig + prompt/mellan/facit + logg). sample/villkor läggs till i FAS 4.
   Rättning = canonical (värde + enklaste form) — hela E-bandet, se js/data/spec-villkor-k2.js.
   Bråk skrivs BRAK(täljare)(nämnare) → stående bråk vid rendering (öva-sidans uttryckHTML).
   Blandat tal = heltal + mellanslag + BRAK(...)(...). Facit för bråk = {t, n} i enklaste form.
   Elev-lokalt/GDPR-neutralt; ingen nätväg, ingen taxonomi. */
(function(){
  'use strict';

  // ── Hjälpare (byte-troget ur ak9-k1-ova-variant.js — samma seed/format) ──
  function mkRng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }
  function rp(rng, arr){ return arr[Math.floor(rng() * arr.length)]; }
  function seedOf(dok, idx, variant){ var s = 2166136261; var str = dok + ':' + idx + ':' + variant;
    for(var i = 0; i < str.length; i++){ s ^= str.charCodeAt(i); s = Math.imul(s, 16777619); } return s >>> 0; }
  function rund(x){ return Math.round(x * 1e9) / 1e9; }
  function k(x){ return ('' + rund(x)).replace('.', ',').replace('-', '−'); }
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function BR(t, n){ return 'BRAK(' + t + ')(' + n + ')'; }                 // stående bråk
  function BLAND(h, t, n){ return h + ' ' + BR(t, n); }                     // blandat tal
  function forkortaFacit(t, n){ var g = gcd(t, n); return { t: t / g, n: n / g }; }

  // ── MALLAR — låst uppgiftsordning + grupper/rubriker. orig = Joachims exakta tal (dokument 1). ──
  //  Varje uppgift: { logg, prompt(t), mellan(t)|null, facit(t), orig }. Öva 1:s VÄXLINGS-grupper
  //  (bråk→decimal, decimal→bråk) byggs OLOGGADE (logg:null) tills växlingsfamiljen landar (①).
  var MALLAR = {

    ova1: { titel: 'Grunder i bråk', grupper: [
      // G1 — bråk → decimalform. OLOGGAD (① routing kvar). facit = decimalvärdet.
      { rubrik: 'Byt form – skriv i decimalform', logg: null, uppgifter:
        [[2,5],[3,4],[3,2],[1,5],[5,4]].map(function(p){ return {
          logg: null, orig: { t: p[0], n: p[1] },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return rund(x.t / x.n); } }; }) },   // NUMBER → öva-sidan rättar som decimal (typ 'tal')

      // G2 — förkorta till enklaste form. logg brak-forkorta:rakna. facit = enklaste-form-bråket.
      { rubrik: 'Skriv i enklaste form', logg: 'brak-forkorta:rakna', uppgifter:
        [[8,12],[18,30],[24,32],[24,36]].map(function(p){ return {
          logg: 'brak-forkorta:rakna', orig: { t: p[0], n: p[1] },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return forkortaFacit(x.t, x.n); } }; }) },

      // G3 — förläng med 3, visa mellanled. logg brak-forlanga:rakna. mellan = (t·3)/(n·3).
      { rubrik: 'Förläng följande bråk med 3 – visa mellanled', logg: 'brak-forlanga:rakna', uppgifter:
        [[7,9],[3,5],[8,13]].map(function(p){ return {
          logg: 'brak-forlanga:rakna', orig: { t: p[0], n: p[1], f: 3 },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; },
          mellan: function(x){ return BR(x.t + ' · ' + x.f, x.n + ' · ' + x.f); },
          facit: function(x){ return { t: x.t * x.f, n: x.n * x.f }; } }; }) },

      // G4 — förläng så att nämnaren blir 40, visa mellanled. logg brak-forlanga:rakna.
      { rubrik: 'Förläng följande bråk så att nämnaren blir 40 – visa mellanled', logg: 'brak-forlanga:rakna', uppgifter:
        [[1,8],[2,5],[7,10]].map(function(p){ return {
          logg: 'brak-forlanga:rakna', orig: { t: p[0], n: p[1], mål: 40 },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; },
          mellan: function(x){ var f = x.mål / x.n; return BR(x.t + ' · ' + f, x.n + ' · ' + f); },
          facit: function(x){ var f = x.mål / x.n; return { t: x.t * f, n: x.mål }; } }; }) },

      // G5 — decimal → bråkform, enklaste form. OLOGGAD (① routing kvar). facit = enklaste-form-bråket.
      { rubrik: 'Byta form – skriv i bråkform, i enklaste form', logg: null, uppgifter:
        [0.8, 0.75, 2.5, 0.125, 1.2].map(function(d){
          var dec = ('' + d).split('.')[1] || ''; var pot = Math.pow(10, dec.length);
          return { logg: null, orig: { d: d, t: Math.round(d * pot), n: pot },
            prompt: function(x){ return k(x.d) + ' ='; }, mellan: function(){ return null; },
            facit: function(x){ return forkortaFacit(x.t, x.n); } }; }) }
    ] }

    // ova2–ova6 byggs i följd (samma mönster), verifieras mot transkriptionen per dokument.
  };

  // ── GENERERING: en uppgift → {prompt, mellan, facit, logg}. variant 0 = orig (dokument 1). ──
  function genUppgift(u, dokId, idx, variant){
    var t = u.orig;   // FAS 3: bara dokument 1. FAS 4: variant ≥ 1 samplar u.sample/u.villkor.
    return { prompt: u.prompt(t), mellan: u.mellan ? u.mellan(t) : null, facit: u.facit(t), logg: u.logg || null, tal: t };
  }
  function genereraDokument(dokId, variant){
    var mall = MALLAR[dokId]; if(!mall) return null;
    var idx = 0;
    return { dokId: dokId, variant: variant, titel: mall.titel, grupper: mall.grupper.map(function(g){
      return { rubrik: g.rubrik, logg: g.logg || null, uppgifter: g.uppgifter.map(function(u){ return genUppgift(u, dokId, idx++, variant); }) };
    }) };
  }

  var API = { MALLAR: MALLAR, genereraDokument: genereraDokument, genUppgift: genUppgift, _intern: { mkRng: mkRng, seedOf: seedOf, k: k, gcd: gcd, BR: BR } };
  if(typeof window !== 'undefined') window.AK9_K2_OVA = API;
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
