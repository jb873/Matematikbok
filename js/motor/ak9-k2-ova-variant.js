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
  function lcm(a, b){ return Math.abs(a) / gcd(a, b) * Math.abs(b); }
  function BR(t, n){ return 'BRAK(' + t + ')(' + n + ')'; }                 // stående bråk
  function BLAND(h, t, n){ return h + ' ' + BR(t, n); }                     // blandat tal
  // Facit-former (öva-sidan renderar cell + rättar efter .form):
  //   {form:'tal', v}  ·  {form:'brak', t, n}  ·  {form:'blandad', hel, t, n}  ·  {form:'forlang', t, n}
  function brakForm(t, n){                                   // reducera; HÄRLED form ur VÄRDET (per variant, ej ärvd)
    var g = gcd(t, n), T = t / g, N = n / g;
    if(N === 1) return { form: 'tal', v: T };                             // heltal (t.ex. 5·4/5=4, 5÷⅓=15) → tal-ruta
    if(Math.abs(T) >= N){ var hel = Math.trunc(T / N), rest = Math.abs(T) - Math.abs(hel) * N; return { form: 'blandad', hel: hel, t: rest, n: N }; }  // oäkta → blandad
    return { form: 'brak', t: T, n: N };                                  // äkta → tvåfält
  }

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
          facit: function(x){ return { form: 'tal', v: rund(x.t / x.n) }; } }; }) },

      // G2 — förkorta till enklaste form. logg brak-forkorta:rakna. facit = enklaste-form-bråket.
      { rubrik: 'Skriv i enklaste form', logg: 'brak-forkorta:rakna', uppgifter:
        [[8,12],[18,30],[24,32],[24,36]].map(function(p){ return {
          logg: 'brak-forkorta:rakna', orig: { t: p[0], n: p[1] },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return brakForm(x.t, x.n); } }; }) },   // alla äkta här → {form:'brak'}

      // G3 — förläng med 3, visa mellanled. logg brak-forlanga:rakna. mellan = (t·3)/(n·3).
      { rubrik: 'Förläng följande bråk med 3 – visa mellanled', logg: 'brak-forlanga:rakna', uppgifter:
        [[7,9],[3,5],[8,13]].map(function(p){ return {
          logg: 'brak-forlanga:rakna', orig: { t: p[0], n: p[1], f: 3 },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; },
          mellan: function(x){ return BR(x.t + ' · ' + x.f, x.n + ' · ' + x.f); },
          facit: function(x){ return { form: 'forlang', t: x.t * x.f, n: x.n * x.f }; } }; }) },

      // G4 — förläng så att nämnaren blir 40, visa mellanled. logg brak-forlanga:rakna.
      { rubrik: 'Förläng följande bråk så att nämnaren blir 40 – visa mellanled', logg: 'brak-forlanga:rakna', uppgifter:
        [[1,8],[2,5],[7,10]].map(function(p){ return {
          logg: 'brak-forlanga:rakna', orig: { t: p[0], n: p[1], mål: 40 },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; },
          mellan: function(x){ var f = x.mål / x.n; return BR(x.t + ' · ' + f, x.n + ' · ' + f); },
          facit: function(x){ var f = x.mål / x.n; return { form: 'forlang', t: x.t * f, n: x.mål }; } }; }) },

      // G5 — decimal → bråkform, enklaste form. OLOGGAD (① routing kvar). facit = enklaste-form-bråket.
      { rubrik: 'Byta form – skriv i bråkform, i enklaste form', logg: null, uppgifter:
        [0.8, 0.75, 2.5, 0.125, 1.2].map(function(d){
          var dec = ('' + d).split('.')[1] || ''; var pot = Math.pow(10, dec.length);
          return { logg: null, orig: { d: d, t: Math.round(d * pot), n: pot },
            prompt: function(x){ return k(x.d) + ' ='; }, mellan: function(){ return null; },
            facit: function(x){ return brakForm(x.t, x.n); } }; }) }   // 2,5→2 ½, 1,2→1 ⅕ blir {form:'blandad'}
    ] },

    ova2: { titel: 'Grunder i bråk – jämförelse och ordning', grupper: [
      // G1 — blandat tal → OÄKTA bråk (formen FORCAS 'brak'; brakForm hade gett blandad). logg brak-blandad.
      { rubrik: 'Skriv i bråkform', logg: 'brak-blandad:rakna', uppgifter:
        [[6,3,5],[4,2,3],[1,5,7]].map(function(p){ return {
          logg: 'brak-blandad:rakna', orig: { h: p[0], t: p[1], n: p[2] },
          prompt: function(x){ return BLAND(x.h, x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return { form: 'brak', t: x.h * x.n + x.t, n: x.n }; } }; }) },

      // G2 — vilket bråk är störst (VAL mellan två). logg brak-jmf-lika:begrepp.
      { rubrik: 'Vilket bråk är störst', logg: 'brak-jmf-lika:begrepp', uppgifter:
        [[[1,2],[4,7]],[[3,7],[4,9]]].map(function(p){ return {
          logg: 'brak-jmf-lika:begrepp', orig: { a: p[0], b: p[1] },
          prompt: function(x){ return BR(x.a[0], x.a[1]) + '  eller  ' + BR(x.b[0], x.b[1]); }, mellan: function(){ return null; },
          facit: function(x){ return { form: 'val', a: x.a, b: x.b, ratt: (x.a[0] / x.a[1] >= x.b[0] / x.b[1]) ? 0 : 1 }; } }; }) },

      // G3 — oäkta bråk → BLANDAD form. brakForm ger blandad. logg brak-blandad.
      { rubrik: 'Skriv i blandad form', logg: 'brak-blandad:rakna', uppgifter:
        [[11,3],[9,5],[17,4],[20,9]].map(function(p){ return {
          logg: 'brak-blandad:rakna', orig: { t: p[0], n: p[1] },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return brakForm(x.t, x.n); } }; }) },

      // G4 — skriv rätt tecken =, <, > (TRE-vägs, likhetsfallet 1/3 = 3/9 ingår). ③. logg brak-jmf-lika.
      { rubrik: 'Skriv rätt tecken mellan talen, välj mellan =, < och >', logg: 'brak-jmf-lika:begrepp', uppgifter:
        [[[3,4],[10,12]],[[2,3],[8,15]],[[7,30],[1,6]],[[1,3],[3,9]]].map(function(p){ return {
          logg: 'brak-jmf-lika:begrepp', orig: { a: p[0], b: p[1] },
          prompt: function(x){ return BR(x.a[0], x.a[1]) + '  ▢  ' + BR(x.b[0], x.b[1]); }, mellan: function(){ return null; },
          facit: function(x){ var av = x.a[0] / x.a[1], bv = x.b[0] / x.b[1]; return { form: 'tecken', ratt: Math.abs(av - bv) < 1e-9 ? '=' : (av < bv ? '<' : '>') }; } }; }) },

      // G5 — storleksordna fyra bråk, minsta först (ORDNA). logg brak-jmf-ordna:resonera.
      { rubrik: 'Storleksordna bråk, börja med det minsta', logg: 'brak-jmf-ordna:resonera', uppgifter:
        [[[1,2],[2,3],[3,5],[3,4]],[[4,5],[4,7],[5,6],[7,6]]].map(function(lista){ return {
          logg: 'brak-jmf-ordna:resonera', orig: { lista: lista },
          prompt: function(){ return null; }, mellan: function(){ return null; },
          facit: function(x){ return { form: 'ordna', lista: x.lista }; } }; }) }
    ] },

    ova3: { titel: 'Addition och subtraktion', grupper: [
      // G1 — heltal − bråk/blandat tal, "se svaret utan lån" (④). DIREKT, inget mellanled. logg brak-sub:heltal.
      //   Formen härleds ur svaret: 1−3/8=5/8 (brak), 4−5/6=3 1/6 (blandad), 3−1⅓=1 2/3 (blandad).
      { rubrik: 'Beräkna', logg: 'brak-sub:heltal', uppgifter:
        [{ H:1, s:{ hel:0, t:3, n:8 } }, { H:4, s:{ hel:0, t:5, n:6 } }, { H:3, s:{ hel:1, t:1, n:3 } }].map(function(o){ return {
          logg: 'brak-sub:heltal', orig: o,
          prompt: function(x){ var sub = x.s.hel > 0 ? BLAND(x.s.hel, x.s.t, x.s.n) : BR(x.s.t, x.s.n); return x.H + ' − ' + sub + ' ='; },
          mellan: function(){ return null; },
          facit: function(x){ var sn = x.s.n, st = x.s.hel * sn + x.s.t; return brakForm(x.H * sn - st, sn); } }; }) },

      // G2 — oliknämnig ADDITION. Mellanled = förläng till gemensam nämnare (värde-rättat, valfri gem. nämnare),
      //   svar canonical i enklaste form (form följer varje variants facit). logg brak-add:rakna.
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-add:rakna', uppgifter:
        [[[1,2],[1,6]],[[2,3],[1,2]],[[1,3],[5,12]],[[5,7],[3,4]]].map(function(p){ return addSubUppg('+', p[0], p[1], 'brak-add:rakna'); }) },

      // G3 — oliknämnig SUBTRAKTION. Samma mellanled-metod. logg brak-sub:rakna (oliknämniga algoritmen).
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-sub:rakna', uppgifter:
        [[[5,6],[1,3]],[[3,4],[2,7]],[[2,5],[1,6]],[[6,7],[3,5]]].map(function(p){ return addSubUppg('−', p[0], p[1], 'brak-sub:rakna'); }) }
    ] },

    ova4: { titel: 'Blandad form och multiplikation', grupper: [
      // G1 — addition i BLANDAD form. Mellanled = förläng bråkdelarna till gemensam nämnare (blandade tal),
      //   svar blandad i enklaste form. logg brak-add:rakna (stege niva 2). form 'blandadadd'.
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-add:rakna', uppgifter:
        [[{ hel:4, t:3, n:8 }, { hel:1, t:1, n:4 }], [{ hel:3, t:2, n:3 }, { hel:2, t:3, n:4 }], [{ hel:1, t:3, n:5 }, { hel:5, t:5, n:6 }]]
          .map(function(p){ return blandAddUppg(p[0], p[1], 'brak-add:rakna'); }) },

      // G2 — heltal · bråk. Mellanled = OFÖRKORTAD produkt (H·t)/n, svar enklaste form. logg brak-mult-rakna:rakna.
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-mult-rakna:rakna', uppgifter:
        [[5,4,5],[7,2,3],[3,4,7]].map(function(p){ return multHeltalUppg(p[0], p[1], p[2], 'brak-mult-rakna:rakna'); }) },

      // G3 — oliknämnig subtraktion (äkta + en oäkta operand 5/4). Samma addsub-mellanled. logg brak-sub:rakna.
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-sub:rakna', uppgifter:
        [[[5,6],[7,18]],[[5,4],[7,6]],[[3,5],[4,7]]].map(function(p){ return addSubUppg('−', p[0], p[1], 'brak-sub:rakna'); }) },

      // G4 — heltal · bråk (fler tal). Samma metod som G2. logg brak-mult-rakna:rakna.
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-mult-rakna:rakna', uppgifter:
        [[6,3,4],[4,5,6],[8,2,9]].map(function(p){ return multHeltalUppg(p[0], p[1], p[2], 'brak-mult-rakna:rakna'); }) }
    ] }

    // ova5–ova6 byggs i följd (samma mönster), verifieras mot transkriptionen per dokument.
  };

  // ── blandad addition: mellanled = blandade tal med gemensam nämnare (förläng bråkdelen). form 'blandadadd'. ──
  function blandAddUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b },
      prompt: function(x){ return BLAND(x.a.hel, x.a.t, x.a.n) + ' + ' + BLAND(x.b.hel, x.b.t, x.b.n) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){
        var L = lcm(x.a.n, x.b.n), at = x.a.t * (L / x.a.n), bt = x.b.t * (L / x.b.n);
        var totT = (x.a.hel + x.b.hel) * L + at + bt;   // hela summan som oäkta över L
        return { form: 'blandadadd', a: x.a, b: x.b, m: [{ hel:x.a.hel, t:at, n:L }, { hel:x.b.hel, t:bt, n:L }], svar: brakForm(totT, L) };
      } };
  }
  // ── heltal · bråk: mellanled = oförkortad produkt (H·t)/n, svar canonical. form 'multheltal'. ──
  function multHeltalUppg(H, t, n, logg){
    return { logg: logg, orig: { H: H, t: t, n: n },
      prompt: function(x){ return x.H + ' · ' + BR(x.t, x.n) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){ var pt = x.H * x.t; return { form: 'multheltal', H:x.H, t:x.t, n:x.n, m: { t:pt, n:x.n }, svar: brakForm(pt, x.n) }; } };
  }

  // ── addSub-uppgift: gemensam nämnare-mellanled + canonical svar. form 'addsub'. ──
  function addSubUppg(op, a, b, logg){
    return { logg: logg, orig: { op: op, a: a, b: b },
      prompt: function(x){ return BR(x.a[0], x.a[1]) + ' ' + x.op + ' ' + BR(x.b[0], x.b[1]) + ' ='; },
      mellan: function(){ return null; },   // mellanledet skrivs i egna celler; facit bär mellanled-talen
      facit: function(x){
        var L = lcm(x.a[1], x.b[1]);
        var t1 = x.a[0] * (L / x.a[1]), t2 = x.b[0] * (L / x.b[1]);
        var rt = (x.op === '+') ? t1 + t2 : t1 - t2;
        return { form: 'addsub', op: x.op, a: x.a, b: x.b, m: [[t1, L], [t2, L]], svar: brakForm(rt, L) };
      } };
  }

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
