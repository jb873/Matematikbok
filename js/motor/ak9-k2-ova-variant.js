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
  // ── SAMPLERS (variantmotor) — bråk-generatorer inom spec-villkor-k2-band ──────────────────────
  function sampProper(rng, maxT, maxN){                     // äkta bråk t/n (2≤n≤maxN, 1≤t<n, t≤maxT)
    var n = ri(rng, 2, maxN), t = ri(rng, 1, Math.min(maxT, n - 1)); return [t, n];
  }
  function sampOakta(rng, maxT, maxN){                      // oäkta bråk t/n (t>n), t≤maxT, 2≤n≤maxN
    var n = ri(rng, 2, maxN), t = ri(rng, n + 1, maxT); return [t, n];      // kräver maxT>n
  }
  function sampFrac(rng, maxT, maxN){ return [ri(rng, 1, maxT), ri(rng, 2, maxN)]; }   // valfritt bråk (kan bli oäkta)
  function delareUnder(m, hi){ var d = []; for(var i = 2; i <= hi; i++){ if(m % i === 0) d.push(i); } return d; }  // delare till m, ≤hi
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
      // G1 — bråk → decimalform. OLOGGAD (① routing kvar). Nämnare ∈{2,4,5} (avslutande decimal), täljare 1..5.
      { rubrik: 'Byt form – skriv i decimalform', logg: null, uppgifter:
        [[2,5],[3,4],[3,2],[1,5],[5,4]].map(function(p){ return {
          logg: null, orig: { t: p[0], n: p[1] },
          sample: function(rng){ return { t: ri(rng, 1, 5), n: rp(rng, [2, 4, 5]) }; },
          villkor: function(x){ return [2, 4, 5].indexOf(x.n) >= 0 && x.t >= 1 && x.t <= 5 && x.t % x.n !== 0 && gcd(x.t, x.n) === 1; },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return { form: 'tal', v: rund(x.t / x.n) }; } }; }) },

      // G2 — förkorta till enklaste form. logg brak-forkorta:rakna. Äkta + förkortbar (gcd>1), maxT 24, maxN 36.
      { rubrik: 'Skriv i enklaste form', logg: 'brak-forkorta:rakna', uppgifter:
        [[8,12],[18,30],[24,32],[24,36]].map(function(p){ return {
          logg: 'brak-forkorta:rakna', orig: { t: p[0], n: p[1] },
          sample: function(rng){ var g = ri(rng, 2, 6), a = ri(rng, 1, Math.floor(24 / g)), b = ri(rng, a + 1, Math.floor(36 / g)); return { t: a * g, n: b * g }; },
          villkor: function(x){ return x.t < x.n && x.t <= 24 && x.n <= 36 && gcd(x.t, x.n) > 1; },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return brakForm(x.t, x.n); } }; }) },   // alla äkta här → {form:'brak'}

      // G3 — förläng med 3, visa mellanled. logg brak-forlanga:rakna. Äkta, maxT 8, maxN 13. mellan = (t·3)/(n·3).
      { rubrik: 'Förläng följande bråk med 3 – visa mellanled', logg: 'brak-forlanga:rakna', uppgifter:
        [[7,9],[3,5],[8,13]].map(function(p){ return {
          logg: 'brak-forlanga:rakna', orig: { t: p[0], n: p[1], f: 3 },
          sample: function(rng){ var f = sampProper(rng, 8, 13); return { t: f[0], n: f[1], f: 3 }; },
          villkor: function(x){ return x.t < x.n && x.t <= 8 && x.n <= 13 && x.f === 3 && gcd(x.t, x.n) === 1; },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; },
          mellan: function(x){ return BR(x.t + ' · ' + x.f, x.n + ' · ' + x.f); },
          facit: function(x){ return { form: 'forlang', t: x.t * x.f, n: x.n * x.f }; } }; }) },

      // G4 — förläng så att nämnaren blir 40, visa mellanled. Nämnare delar 40 & ≤13 ({2,4,5,8,10}), täljare<n, ≤8.
      { rubrik: 'Förläng följande bråk så att nämnaren blir 40 – visa mellanled', logg: 'brak-forlanga:rakna', uppgifter:
        [[1,8],[2,5],[7,10]].map(function(p){ return {
          logg: 'brak-forlanga:rakna', orig: { t: p[0], n: p[1], mål: 40 },
          sample: function(rng){ var n = rp(rng, [2, 4, 5, 8, 10]); return { t: ri(rng, 1, Math.min(8, n - 1)), n: n, mål: 40 }; },
          villkor: function(x){ return x.mål === 40 && 40 % x.n === 0 && x.n <= 13 && x.t < x.n && x.t <= 8 && gcd(x.t, x.n) === 1; },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; },
          mellan: function(x){ var f = x.mål / x.n; return BR(x.t + ' · ' + f, x.n + ' · ' + f); },
          facit: function(x){ var f = x.mål / x.n; return { form: 'forlang', t: x.t * f, n: x.mål }; } }; }) },

      // G5 — decimal → bråkform, enklaste form. OLOGGAD (① routing kvar). ≤3 decimaler, värde ≤2,5, ej heltal.
      { rubrik: 'Byta form – skriv i bråkform, i enklaste form', logg: null, uppgifter:
        [0.8, 0.75, 2.5, 0.125, 1.2].map(function(d){
          var dec = ('' + d).split('.')[1] || ''; var pot = Math.pow(10, dec.length);
          return { logg: null, orig: { d: d, t: Math.round(d * pot), n: pot },
            sample: function(rng){ var dp = ri(rng, 1, 3), po = Math.pow(10, dp), kk = ri(rng, 1, Math.floor(2.5 * po)); var dd = rund(kk / po); return { d: dd, t: Math.round(dd * po), n: po }; },
            villkor: function(x){ var s = ('' + x.d).split('.')[1] || ''; return s.length <= 3 && x.d > 0 && x.d <= 2.5 && x.t % x.n !== 0 && (x.n / gcd(x.t, x.n)) <= 10; },   // förkortad nämnare ≤10 ⇒ "snygga" tal (0,8=4/5, ej 0,62=31/50)
            prompt: function(x){ return k(x.d) + ' ='; }, mellan: function(){ return null; },
            facit: function(x){ return brakForm(x.t, x.n); } }; }) }   // 2,5→2 ½, 1,2→1 ⅕ blir {form:'blandad'}
    ] },

    ova2: { titel: 'Grunder i bråk – jämförelse och ordning', grupper: [
      // G1 — blandat tal → OÄKTA bråk (formen FORCAS 'brak'). logg brak-blandad. h 1..6, äkta t/n n≤9, oäkta-täljare ≤40.
      { rubrik: 'Skriv i bråkform', logg: 'brak-blandad:rakna', uppgifter:
        [[6,3,5],[4,2,3],[1,5,7]].map(function(p){ return {
          logg: 'brak-blandad:rakna', orig: { h: p[0], t: p[1], n: p[2] },
          sample: function(rng){ var f = sampProper(rng, 8, 9); return { h: ri(rng, 1, 6), t: f[0], n: f[1] }; },
          villkor: function(x){ return x.h >= 1 && x.h <= 6 && x.t < x.n && x.n <= 9 && gcd(x.t, x.n) === 1 && x.h * x.n + x.t <= 40; },
          prompt: function(x){ return BLAND(x.h, x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return { form: 'brak', t: x.h * x.n + x.t, n: x.n }; } }; }) },

      // G2 — vilket bråk är störst (VAL mellan två). Två äkta bråk n≤9, olika värde. logg brak-jmf-lika:begrepp.
      { rubrik: 'Vilket bråk är störst', logg: 'brak-jmf-lika:begrepp', uppgifter:
        [[[1,2],[4,7]],[[3,7],[4,9]]].map(function(p){ return {
          logg: 'brak-jmf-lika:begrepp', orig: { a: p[0], b: p[1] },
          sample: function(rng){ return { a: sampProper(rng, 8, 9), b: sampProper(rng, 8, 9) }; },
          villkor: function(x){ return x.a[0] < x.a[1] && x.b[0] < x.b[1] && x.a[1] <= 9 && x.b[1] <= 9 && gcd(x.a[0], x.a[1]) === 1 && gcd(x.b[0], x.b[1]) === 1 && Math.abs(x.a[0] / x.a[1] - x.b[0] / x.b[1]) > 1e-9; },
          prompt: function(x){ return BR(x.a[0], x.a[1]) + '  eller  ' + BR(x.b[0], x.b[1]); }, mellan: function(){ return null; },
          facit: function(x){ return { form: 'val', a: x.a, b: x.b, ratt: (x.a[0] / x.a[1] >= x.b[0] / x.b[1]) ? 0 : 1 }; } }; }) },

      // G3 — oäkta bråk → BLANDAD form. Oäkta t/n (t>n), n≤9, t≤20, ej heltal (t%n≠0). logg brak-blandad.
      { rubrik: 'Skriv i blandad form', logg: 'brak-blandad:rakna', uppgifter:
        [[11,3],[9,5],[17,4],[20,9]].map(function(p){ return {
          logg: 'brak-blandad:rakna', orig: { t: p[0], n: p[1] },
          sample: function(rng){ var n = ri(rng, 2, 9); return { t: ri(rng, n + 1, 20), n: n }; },
          villkor: function(x){ return x.t > x.n && x.t <= 20 && x.n <= 9 && x.n >= 2 && x.t % x.n !== 0 && gcd(x.t, x.n) === 1; },
          prompt: function(x){ return BR(x.t, x.n) + ' ='; }, mellan: function(){ return null; },
          facit: function(x){ return brakForm(x.t, x.n); } }; }) },

      // G4 — skriv rätt tecken =, <, > (TRE-vägs). Slot där origparet är LIKA behåller likhet (③ likhetsfall);
      //   övriga slots = olika värde (</>).  Band maxNamnare 30. logg brak-jmf-lika:begrepp.
      { rubrik: 'Skriv rätt tecken mellan talen, välj mellan =, < och >', logg: 'brak-jmf-lika:begrepp', uppgifter:
        [[[3,4],[10,12]],[[2,3],[8,15]],[[7,30],[1,6]],[[1,3],[3,9]]].map(function(p){
          var eq = Math.abs(p[0][0] / p[0][1] - p[1][0] / p[1][1]) < 1e-9;
          return {
          logg: 'brak-jmf-lika:begrepp', orig: { a: p[0], b: p[1] },
          sample: eq
            ? function(rng){ var f = sampProper(rng, 8, 10), kk = ri(rng, 2, 3); return { a: f, b: [f[0] * kk, f[1] * kk] }; }   // lika: förläng
            : function(rng){ return { a: sampProper(rng, 12, 20), b: sampProper(rng, 12, 20) }; },
          villkor: eq
            ? function(x){ return x.a[0] < x.a[1] && gcd(x.a[0], x.a[1]) === 1 && x.b[1] <= 30 && x.b[0] < x.b[1] && Math.abs(x.a[0] / x.a[1] - x.b[0] / x.b[1]) < 1e-9; }   // a enklaste, b = a förlängd (avsiktligt oförkortad)
            : function(x){ return x.a[0] < x.a[1] && x.b[0] < x.b[1] && x.a[1] <= 30 && x.b[1] <= 30 && gcd(x.a[0], x.a[1]) === 1 && gcd(x.b[0], x.b[1]) === 1 && Math.abs(x.a[0] / x.a[1] - x.b[0] / x.b[1]) > 1e-9; },
          prompt: function(x){ return BR(x.a[0], x.a[1]) + '  ▢  ' + BR(x.b[0], x.b[1]); }, mellan: function(){ return null; },
          facit: function(x){ var av = x.a[0] / x.a[1], bv = x.b[0] / x.b[1]; return { form: 'tecken', ratt: Math.abs(av - bv) < 1e-9 ? '=' : (av < bv ? '<' : '>') }; } }; }) },

      // G5 — storleksordna fyra bråk, minsta först (ORDNA). Fyra parvis OLIKA bråk (kan vara oäkta som 7/6), n≤13.
      { rubrik: 'Storleksordna bråk, börja med det minsta', logg: 'brak-jmf-ordna:resonera', uppgifter:
        [[[1,2],[2,3],[3,5],[3,4]],[[4,5],[4,7],[5,6],[7,6]]].map(function(lista){ return {
          logg: 'brak-jmf-ordna:resonera', orig: { lista: lista },
          sample: function(rng){ var out = [], seen = {}, guard = 0;
            while(out.length < 4 && guard++ < 300){ var f = sampFrac(rng, 8, 8), key = Math.round(f[0] / f[1] * 1e6); if(!seen[key]){ seen[key] = 1; out.push(f); } }
            return { lista: out }; },
          villkor: function(x){ if(!x.lista || x.lista.length !== 4) return false; var vs = x.lista.map(function(p){ return p[0] / p[1]; });
            for(var i = 0; i < 4; i++){ if(x.lista[i][1] > 13 || x.lista[i][0] < 1 || gcd(x.lista[i][0], x.lista[i][1]) !== 1) return false; for(var j = i + 1; j < 4; j++){ if(Math.abs(vs[i] - vs[j]) < 1e-9) return false; } } return true; },
          prompt: function(){ return null; }, mellan: function(){ return null; },
          facit: function(x){ return { form: 'ordna', lista: x.lista }; } }; }) }
    ] },

    ova3: { titel: 'Addition och subtraktion', grupper: [
      // G1 — heltal − bråk/blandat tal, "se svaret utan lån" (④). DIREKT, inget mellanled. logg brak-sub:heltal.
      //   Formen härleds ur svaret: 1−3/8=5/8 (brak), 4−5/6=3 1/6 (blandad), 3−1⅓=1 2/3 (blandad).
      { rubrik: 'Beräkna', logg: 'brak-sub:heltal', uppgifter:
        [{ H:1, s:{ hel:0, t:3, n:8 } }, { H:4, s:{ hel:0, t:5, n:6 } }, { H:3, s:{ hel:1, t:1, n:3 } }].map(function(o){ return {
          logg: 'brak-sub:heltal', orig: o,
          sample: function(rng){ var H = ri(rng, 1, 5), blandat = rng() < 0.35 && H >= 2, f = sampProper(rng, 7, 8);
            return { H: H, s: { hel: blandat ? ri(rng, 1, H - 1) : 0, t: f[0], n: f[1] } }; },
          villkor: function(x){ var s = x.s; return x.H >= 1 && x.H <= 5 && s.t >= 1 && s.t < s.n && s.n <= 8 && gcd(s.t, s.n) === 1 && s.hel >= 0 && s.hel < x.H; },
          prompt: function(x){ var sub = x.s.hel > 0 ? BLAND(x.s.hel, x.s.t, x.s.n) : BR(x.s.t, x.s.n); return x.H + ' − ' + sub + ' ='; },
          mellan: function(){ return null; },
          facit: function(x){ var sn = x.s.n, st = x.s.hel * sn + x.s.t; return brakForm(x.H * sn - st, sn); } }; }) },

      // G2 — oliknämnig ADDITION. Mellanled = förläng till gemensam nämnare (värde-rättat, valfri gem. nämnare),
      //   svar canonical i enklaste form (form följer varje variants facit). logg brak-add:rakna.
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-add:rakna', uppgifter:
        [[[1,2],[1,6]],[[2,3],[1,2]],[[1,3],[5,12]],[[5,7],[3,4]]].map(function(p){ return addSubUppg('+', p[0], p[1], 'brak-add:rakna', { maxN: 12 }); }) },

      // G3 — oliknämnig SUBTRAKTION. Samma mellanled-metod. logg brak-sub:rakna (oliknämniga algoritmen).
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-sub:rakna', uppgifter:
        [[[5,6],[1,3]],[[3,4],[2,7]],[[2,5],[1,6]],[[6,7],[3,5]]].map(function(p){ return addSubUppg('−', p[0], p[1], 'brak-sub:rakna', { maxN: 18, maxT: 7 }); }) }
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
        [[[5,6],[7,18]],[[5,4],[7,6]],[[3,5],[4,7]]].map(function(p){ return addSubUppg('−', p[0], p[1], 'brak-sub:rakna', { maxN: 18, maxT: 7, oakta: true }); }) },

      // G4 — heltal · bråk (fler tal). Samma metod som G2. logg brak-mult-rakna:rakna.
      { rubrik: 'Beräkna – visa mellanled och svara i enklaste form', logg: 'brak-mult-rakna:rakna', uppgifter:
        [[6,3,4],[4,5,6],[8,2,9]].map(function(p){ return multHeltalUppg(p[0], p[1], p[2], 'brak-mult-rakna:rakna'); }) }
    ] },

    ova5: { titel: 'Multiplikation och division med heltal', grupper: [
      // G1 — bråk · bråk. Mellanled = OFÖRKORTAD produkt (a·c)/(b·d), svar förkortat (korr. 1). form 'multbrak'.
      //   (INSTR-exemplet 5/6·3/4=15/24=5/8 renderas ALDRIG — författar-exempel, se plan.)
      { rubrik: 'Beräkna med multiplikation – förkorta svaret', logg: 'brak-mult-rakna:rakna', uppgifter:
        [[[2,3],[2,7]],[[4,5],[5,6]]].map(function(p){ return multBrakUppg(p[0], p[1], 'brak-mult-rakna:rakna'); }) },

      // G2 — heltal ÷ bråk, VISAS som komplex-bråk (⑤ nians cellval). Direkt svar, inget mellanled. logg brak-div-hb.
      { rubrik: 'Beräkna', logg: 'brak-div-hb:rakna', uppgifter:
        [[5,1,3],[7,1,7],[6,1,5]].map(function(p){ return komplexHBUppg(p[0], p[1], p[2], 'brak-div-hb:rakna'); }) },

      // G3 — bråk · bråk (fler tal). Samma metod som G1. logg brak-mult-rakna:rakna.
      { rubrik: 'Beräkna med multiplikation – förkorta svaret', logg: 'brak-mult-rakna:rakna', uppgifter:
        [[[3,7],[6,5]],[[3,8],[2,5]],[[5,9],[3,4]]].map(function(p){ return multBrakUppg(p[0], p[1], 'brak-mult-rakna:rakna'); }) },

      // G4 — bråk ÷ heltal, VISAS som komplex-bråk. Direkt svar, inget mellanled. logg brak-div-bh.
      { rubrik: 'Beräkna', logg: 'brak-div-bh:rakna', uppgifter:
        [[1,5,4],[1,3,7],[1,8,3]].map(function(p){ return komplexBHUppg(p[0], p[1], p[2], 'brak-div-bh:rakna'); }) }
    ] },

    ova6: { titel: 'Division', grupper: [
      // G1 — bråk ÷ bråk via FÖRLÄNGNING. Prompt = komplex-bråk (a/b)/(c/d), mellanled = produktbråk
      //   (a·d)/(b·c) VÄRDE-rättat (godtar oäkta 16/15), svar enklaste form. logg brak-div-bb. form 'divbrak'.
      { rubrik: 'Beräkna – visa med förlängning, visa mellanled, svara i enklaste form', logg: 'brak-div-bb:rakna', uppgifter:
        [[[2,7],[3,5]],[[3,4],[5,6]],[[2,3],[5,8]]].map(function(p){ return divBrakUppg(p[0], p[1], 'brak-div-bb:rakna'); }) },

      // G2 — skriv det inverterade talet (reciprok). Sträng-swap (även algebraiskt 7x/2y ⑥). logg brak-div-reciprok.
      { rubrik: 'Vilket är det inverterade talet till…', logg: 'brak-div-reciprok:rakna', uppgifter:
        [[3,5],[2,9],['7x','2y']].map(function(p){ return reciprokUppg(p[0], p[1], 'brak-div-reciprok:rakna', typeof p[0] === 'string'); }) },

      // G3 — bråk ÷ bråk via INVERTERING. Samma cellstruktur som G1 (produkten (a·d)/(b·c) är lika oavsett
      //   metod); rubriken skiljer metoden. logg brak-div-inv. form 'divbrak'.
      { rubrik: 'Beräkna med inverterat tal, visa mellanled, svara i enklaste form', logg: 'brak-div-inv:rakna', uppgifter:
        [[[3,5],[1,4]],[[5,7],[2,3]],[[3,8],[5,9]]].map(function(p){ return divBrakUppg(p[0], p[1], 'brak-div-inv:rakna'); }) }
    ] }

  };

  // ── bråk ÷ bråk, VISAS som komplex-bråk. Mellanled = produktbråk (a·d)/(b·c) VÄRDE-rättat. form 'divbrak'. ──
  //   Band brak-div-bb/inv: äkta operander, maxNamnare 8, maxTaljare 5. Svar ≠ heltal (form brak/blandad).
  function divBrakUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b },
      sample: function(rng){ return { a: sampProper(rng, 5, 8), b: sampProper(rng, 5, 8) }; },
      villkor: function(x){ var pt = x.a[0] * x.b[1], pn = x.a[1] * x.b[0];
        return x.a[0] < x.a[1] && x.b[0] < x.b[1] && x.a[1] <= 8 && x.b[1] <= 8 && x.a[0] <= 5 && x.b[0] <= 5
          && gcd(x.a[0], x.a[1]) === 1 && gcd(x.b[0], x.b[1]) === 1 && pt % pn !== 0; },   // operander i enklaste form
      prompt: function(x){ return BR(BR(x.a[0], x.a[1]), BR(x.b[0], x.b[1])) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){ var pt = x.a[0] * x.b[1], pn = x.a[1] * x.b[0]; return { form: 'divbrak', a:x.a, b:x.b, m: { t:pt, n:pn }, svar: brakForm(pt, pn) }; } };
  }
  // ── inverterade talet (reciprok): svaret = swap av täljare/nämnare (strängar; klarar 7x/2y). form 'reciprok'. ──
  //   fixed=true ⇒ algebraiskt tal (7x/2y), ingen variant (⑥). Annars äkta bråk, maxNamnare 9, maxTaljare 7.
  function reciprokUppg(t, n, logg, fixed){
    var o = { logg: logg, orig: { t: t, n: n },
      prompt: function(x){ return BR(x.t, x.n) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){ return { form: 'reciprok', tSvar: '' + x.n, nSvar: '' + x.t }; } };
    if(fixed){ o.fixed = true; }
    else {
      o.sample = function(rng){ var f = sampProper(rng, 7, 9); return { t: f[0], n: f[1] }; };
      o.villkor = function(x){ return x.t >= 1 && x.t < x.n && x.n <= 9 && x.t <= 7 && gcd(x.t, x.n) === 1; };
    }
    return o;
  }

  // ── bråk · bråk: "förkorta svaret", INGET mellanled (Öva 5 G1/G3 saknar "visa mellanled", parentesen
  //   "Behövs inget mellanled" = builder-instruktion, se meta-svep). Svar = produkten i enklaste form. form 'multbrak'.
  //   Band brak-mult niva2: äkta operander, maxNamnare 9, maxTaljare 8. Produkt av två äkta bråk ⇒ alltid äkta. ──
  function multBrakUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b },
      sample: function(rng){ return { a: sampProper(rng, 8, 9), b: sampProper(rng, 8, 9) }; },
      villkor: function(x){ return x.a[0] < x.a[1] && x.b[0] < x.b[1] && x.a[1] <= 9 && x.b[1] <= 9 && x.a[0] <= 8 && x.b[0] <= 8
        && gcd(x.a[0], x.a[1]) === 1 && gcd(x.b[0], x.b[1]) === 1; },   // operander i enklaste form
      prompt: function(x){ return BR(x.a[0], x.a[1]) + ' · ' + BR(x.b[0], x.b[1]) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){ return { form: 'multbrak', a:x.a, b:x.b, svar: brakForm(x.a[0] * x.b[0], x.a[1] * x.b[1]) }; } };
  }
  // ── heltal ÷ bråk, VISAS som komplex-bråk BRAK(H)(BRAK(1)(n)). Direkt svar (heltal). form 'komplexdiv'.
  //   Stambråk (t=1); band brak-div-hb: maxHeltal 9, maxNamnare 9. Facit = H·n. ──
  function komplexHBUppg(H, t, n, logg){
    return { logg: logg, orig: { H: H, t: t, n: n },
      sample: function(rng){ return { H: ri(rng, 2, 9), t: 1, n: ri(rng, 2, 9) }; },
      villkor: function(x){ return x.t === 1 && x.H >= 2 && x.H <= 9 && x.n >= 2 && x.n <= 9; },
      prompt: function(x){ return BR(x.H, BR(x.t, x.n)) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){ return { form: 'komplexdiv', svar: brakForm(x.H * x.n, x.t) }; } };
  }
  // ── bråk ÷ heltal, VISAS som komplex-bråk BRAK(BRAK(1)(n))(H). Direkt svar (bråk). form 'komplexdiv'.
  //   Stambråk; band brak-div-bh: maxNamnare 8, maxHeltal 7. Facit = 1/(n·H). ──
  function komplexBHUppg(t, n, H, logg){
    return { logg: logg, orig: { t: t, n: n, H: H },
      sample: function(rng){ return { t: 1, n: ri(rng, 2, 8), H: ri(rng, 2, 7) }; },
      villkor: function(x){ return x.t === 1 && x.n >= 2 && x.n <= 8 && x.H >= 2 && x.H <= 7; },
      prompt: function(x){ return BR(BR(x.t, x.n), x.H) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){ return { form: 'komplexdiv', svar: brakForm(x.t, x.n * x.H) }; } };
  }

  // ── blandad addition: mellanled = blandade tal med gemensam nämnare (förläng bråkdelen). form 'blandadadd'.
  //   Band brak-add niva2: blandade tal, äkta bråkdel, OLIKNÄMNIG, maxNamnare 6, maxHeltal 5. Svar blandad (frac≠0). ──
  function blandAddUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b },
      sample: function(rng){ var an = ri(rng, 2, 6), bn = ri(rng, 2, 6);
        return { a: { hel: ri(rng, 1, 5), t: ri(rng, 1, an - 1), n: an }, b: { hel: ri(rng, 1, 5), t: ri(rng, 1, bn - 1), n: bn } }; },
      villkor: function(x){
        if(!(x.a.t < x.a.n && x.b.t < x.b.n && x.a.n <= 6 && x.b.n <= 6 && x.a.hel <= 5 && x.b.hel <= 5 && x.a.hel >= 1 && x.b.hel >= 1)) return false;
        if(gcd(x.a.t, x.a.n) !== 1 || gcd(x.b.t, x.b.n) !== 1) return false; // bråkdelar i enklaste form
        if(x.a.n === x.b.n) return false;                                   // oliknämnig (förläng-mellanled krävs)
        var L = lcm(x.a.n, x.b.n), tot = x.a.t * (L / x.a.n) + x.b.t * (L / x.b.n);
        return tot % L !== 0;                                              // bråkdelen bär över till ≠0 ⇒ svar blandad
      },
      prompt: function(x){ return BLAND(x.a.hel, x.a.t, x.a.n) + ' + ' + BLAND(x.b.hel, x.b.t, x.b.n) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){
        var L = lcm(x.a.n, x.b.n), at = x.a.t * (L / x.a.n), bt = x.b.t * (L / x.b.n);
        var totT = (x.a.hel + x.b.hel) * L + at + bt;   // hela summan som oäkta över L
        return { form: 'blandadadd', a: x.a, b: x.b, m: [{ hel:x.a.hel, t:at, n:L }, { hel:x.b.hel, t:bt, n:L }], svar: brakForm(totT, L) };
      } };
  }
  // ── heltal · bråk: mellanled = oförkortad produkt (H·t)/n, svar canonical. form 'multheltal'.
  //   Band brak-mult niva1: H 2..8, äkta bråk maxNamnare 9. Resultat ≥ 1 (som dok: tal/blandad). ──
  function multHeltalUppg(H, t, n, logg){
    return { logg: logg, orig: { H: H, t: t, n: n },
      sample: function(rng){ var f = sampProper(rng, 8, 9); return { H: ri(rng, 2, 8), t: f[0], n: f[1] }; },
      villkor: function(x){ return x.t < x.n && x.n <= 9 && x.t <= 8 && x.H >= 2 && x.H <= 8 && gcd(x.t, x.n) === 1 && x.H * x.t >= x.n; },
      prompt: function(x){ return x.H + ' · ' + BR(x.t, x.n) + ' ='; },
      mellan: function(){ return null; },
      facit: function(x){ var pt = x.H * x.t; return { form: 'multheltal', H:x.H, t:x.t, n:x.n, m: { t:pt, n:x.n }, svar: brakForm(pt, x.n) }; } };
  }

  // ── addSub-uppgift: gemensam nämnare-mellanled + canonical svar. form 'addsub'. opts { maxN, maxT, oakta }.
  //   OLIKNÄMNIG (förläng krävs), positivt svar, svar ≠ heltal. Andra operanden alltid äkta; oakta ⇒ första får vara oäkta. ──
  function addSubUppg(op, a, b, logg, opts){
    opts = opts || {}; var maxN = opts.maxN || 12, maxT = opts.maxT || (maxN - 1), tillatOakta = !!opts.oakta;
    return { logg: logg, orig: { op: op, a: a, b: b },
      sample: function(rng){
        var A = (tillatOakta && rng() < 0.4) ? sampOakta(rng, maxT, maxN) : sampProper(rng, Math.min(maxT, maxN - 1), maxN);
        var B = sampProper(rng, Math.min(maxT, maxN - 1), maxN);
        return { op: op, a: A, b: B };
      },
      villkor: function(x){
        if(x.a[1] === x.b[1]) return false;                                // oliknämnig
        if(x.a[0] > maxT || x.b[0] > maxT || x.a[1] > maxN || x.b[1] > maxN) return false;
        if(gcd(x.a[0], x.a[1]) !== 1 || gcd(x.b[0], x.b[1]) !== 1) return false;   // operander i enklaste form
        if(x.b[0] >= x.b[1]) return false;                                 // andra operanden alltid äkta
        if(!tillatOakta && x.a[0] >= x.a[1]) return false;                 // första äkta om oäkta ej tillåtet
        var av = x.a[0] / x.a[1], bv = x.b[0] / x.b[1];
        if(op === '−' && av - bv <= 0) return false;                       // positivt svar
        var L = lcm(x.a[1], x.b[1]), rt = op === '+' ? x.a[0] * (L / x.a[1]) + x.b[0] * (L / x.b[1]) : x.a[0] * (L / x.a[1]) - x.b[0] * (L / x.b[1]);
        return rt % L !== 0;                                               // svar ≠ heltal (form brak/blandad)
      },
      prompt: function(x){ return BR(x.a[0], x.a[1]) + ' ' + x.op + ' ' + BR(x.b[0], x.b[1]) + ' ='; },
      mellan: function(){ return null; },   // mellanledet skrivs i egna celler; facit bär mellanled-talen
      facit: function(x){
        var L = lcm(x.a[1], x.b[1]);
        var t1 = x.a[0] * (L / x.a[1]), t2 = x.b[0] * (L / x.b[1]);
        var rt = (x.op === '+') ? t1 + t2 : t1 - t2;
        return { form: 'addsub', op: x.op, a: x.a, b: x.b, m: [[t1, L], [t2, L]], svar: brakForm(rt, L) };
      } };
  }

  // ── GENERERING: en uppgift → {prompt, mellan, facit, logg}. variant 0 = orig (dok 1); ≥1 = sampla tills
  //   villkor håller OCH talet skiljer sig från alla lägre varianter (ingen slot upprepar värde mellan dok). ──
  function talKey(t){ return JSON.stringify(t); }
  function bygg(u, t, kastade){ return { prompt: u.prompt(t), mellan: u.mellan ? u.mellan(t) : null, facit: u.facit(t), logg: u.logg || null, tal: t, _kastade: kastade || 0 }; }
  //  undvik = tal-nycklar som (även) ska undvikas — grupp-syskon i SAMMA variant (ingen upprepning inom dok).
  function genUppgift(u, dokId, idx, variant, undvik){
    if(variant === 0 || u.fixed || !u.sample) return bygg(u, u.orig, 0);   // orig / algebraiskt fast tal (7x/2y)
    var prior = {}; prior[talKey(u.orig)] = 1;
    for(var j = 1; j < variant; j++){ prior[talKey(genUppgift(u, dokId, idx, j).tal)] = 1; }   // slotens lägre varianter
    var rng = mkRng(seedOf(dokId, idx, variant) ^ 0x9E3779B9), kastade = 0, t = null;
    for(var i = 0; i < 400; i++){ var cand = u.sample(rng), key = talKey(cand);
      if(u.villkor(cand) && !prior[key] && !(undvik && undvik[key])){ t = cand; break; } kastade++; }
    return bygg(u, t || u.orig, kastade);   // fallback orig (ska nästan aldrig hända — larmas i fuzz)
  }
  function genereraDokument(dokId, variant){
    var mall = MALLAR[dokId]; if(!mall) return null;
    var idx = 0;
    return { dokId: dokId, variant: variant, titel: mall.titel, grupper: mall.grupper.map(function(g){
      var used = {};   // grupp-lokala tal-nycklar (denna variant) ⇒ inga upprepade värden inom en grupp
      return { rubrik: g.rubrik, logg: g.logg || null, uppgifter: g.uppgifter.map(function(u){
        var gu = genUppgift(u, dokId, idx++, variant, used); used[talKey(gu.tal)] = 1; return gu;
      }) };
    }) };
  }

  var API = { MALLAR: MALLAR, genereraDokument: genereraDokument, genUppgift: genUppgift,
    _intern: { mkRng: mkRng, seedOf: seedOf, k: k, gcd: gcd, lcm: lcm, BR: BR, brakForm: brakForm, rund: rund } };
  if(typeof window !== 'undefined') window.AK9_K2_OVA = API;
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
