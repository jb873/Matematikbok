/* ak9-k2-akr9-ova-variant.js — NIANS Åk9-spårets dk2 "Räkna med bråk", ÖVA (två dokument).
   Skilt från E-spårets sex (ak9-k2-ova-variant.js / AK9_K2_OVA) — detta är MÅL-spåret (svårare band).
   Joachims två docx: "Öva 1 – grunder, addition och subtraktion" + "Öva 2 – multiplikation och division".
   ─────────────────────────────────────────────────────────────────────────────────────────────────
   FAS 3: dokument 1 (Joachims exakta tal, orig).  FAS 4: varianter (sample/villkor per uppgift).
   variant 0 = orig; variant ≥1 samplas i bandet, med TAL- och FACIT-distinkthet mot lägre varianter
   (ingen slot upprepar tal/svar mellan de fyra dokumenten). FASTA slots (algebraisk reciprok,
   tre-områdes-uppgiften) har fixed:true och lämnas orig i alla varianter.
   Speglar E-spårets arkitektur: mallar per dokument, form-taggade facit; öva-sidan renderar + rättar.

   FORMER (öva-sidan renderar cell + rättar per .form):
     canonical: 'ordna' · 'tecken' (>/<) · 'multheltal' · 'multbrak' · 'komplexdiv' · 'divbrak' · 'reciprok'
     NYA i Åk9-spåret:
       'mgn'     — två celler, båda bråken med MINSTA gem. nämnare; "rätt men ej minsta" underkänns
       'addsub'  — mgn:true ⇒ mellanledet KRÄVER minsta gem. nämnare; negativt svar tillåtet
       'decbrak' — decimal + bråk i samma uttryck; loggas i K1-STORE (brak-byta lånar bd-tillbrak:rakna)
       'kedja'   — fri equality-kedja via Likhetsrattare.provaKedja (låna / förkorta / förenkla innan mult)

   Elev-lokalt/GDPR-neutralt; ingen nätväg, ingen taxonomi. */
(function(){
  'use strict';

  // ── Hjälpare (byte-troget ur ak9-k2-ova-variant.js — samma seed/format/brakForm) ──
  function mkRng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function seedOf(dok, idx, variant){ var s = 2166136261; var str = dok + ':' + idx + ':' + variant;
    for(var i = 0; i < str.length; i++){ s ^= str.charCodeAt(i); s = Math.imul(s, 16777619); } return s >>> 0; }
  function rund(x){ return Math.round(x * 1e9) / 1e9; }
  function k(x){ return ('' + rund(x)).replace('.', ',').replace('-', '−'); }
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function lcm(a, b){ return Math.abs(a) / gcd(a, b) * Math.abs(b); }
  function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }
  function rp(rng, arr){ return arr[Math.floor(rng() * arr.length)]; }
  function sampProper(rng, maxT, maxN){ var n = ri(rng, 2, maxN), t = ri(rng, 1, Math.min(maxT, n - 1)); return [t, n]; }
  function sampBland(rng, maxH, maxN){ var f = sampProper(rng, maxN - 1, maxN); return { h: ri(rng, 1, maxH), t: f[0], n: f[1] }; }
  function BR(t, n){ return 'BRAK(' + t + ')(' + n + ')'; }                 // stående bråk
  function BLAND(h, t, n){ return h + ' ' + BR(t, n); }                     // blandat tal
  // Reducera; härled form ur VÄRDET (per variant, ej ärvd). Klarar negativa (behåller tecknet i täljaren).
  function brakForm(t, n){
    var g = gcd(t, n), T = t / g, N = n / g;
    if(N === 1) return { form: 'tal', v: T };                             // heltal
    if(Math.abs(T) >= N){ var hel = (T < 0 ? -1 : 1) * Math.floor(Math.abs(T) / N), rest = Math.abs(T) - Math.abs(hel) * N; return { form: 'blandad', hel: hel, t: rest, n: N }; }
    return { form: 'brak', t: T, n: N };                                  // äkta (kan vara negativ täljare)
  }
  function oakta(op){ return Array.isArray(op) ? { t: op[0], n: op[1] } : { t: op.h * op.n + op.t, n: op.n }; }
  function brakPrompt(op){ return Array.isArray(op) ? BR(op[0], op[1]) : BLAND(op.h, op.t, op.n); }
  function properOK(p){ return p[0] >= 1 && p[0] < p[1] && p[1] >= 2 && gcd(p[0], p[1]) === 1; }
  function blandOK(o, maxH, maxN){ return o.h >= 1 && o.h <= maxH && o.t >= 1 && o.t < o.n && o.n >= 2 && o.n <= maxN && gcd(o.t, o.n) === 1; }
  function finOf(bf){ return bf.form === 'tal' ? { k: 'dec', x: bf.v } : bf.form === 'blandad' ? { k: 'mi', h: bf.hel, t: bf.t, n: bf.n } : { k: 'br', t: bf.t, n: bf.n }; }

  // ── FORM-KONSTRUKTORER (orig + sample/villkor). variant 0 = orig; ≥1 samplas i bandet. ──

  // G1 — storleksordna med närmevärde: fem PARVIS OLIKA, NÄRA bråk (kräver avrundning). Fönster ≤0,20.
  function ordnaUppg(lista, logg){
    return { logg: logg, orig: { lista: lista }, prompt: function(){ return null; }, mellan: function(){ return null; },
      sample: function(rng){
        var dens = [7, 8, 9, 11, 12, 13, 16, 19, 24, 31, 37, 41, 53, 111];
        for(var attempt = 0; attempt < 40; attempt++){
          var center = 0.22 + rng() * 0.42, out = [], seen = {};
          for(var g = 0; g < 80 && out.length < 5; g++){
            var n = rp(rng, dens), t = Math.round(center * n); if(t < 1) t = 1; if(t > n - 1) t = n - 1;
            var val = t / n, kv = Math.round(val * 1e6);
            if(Math.abs(val - center) <= 0.09 && !seen[kv] && !seen['n' + n]){ seen[kv] = 1; seen['n' + n] = 1; out.push([t, n]); }
          }
          if(out.length === 5) return { lista: out };
        }
        return { lista: lista };
      },
      villkor: function(x){
        if(!x.lista || x.lista.length !== 5) return false; var vs = [];
        for(var i = 0; i < 5; i++){ var p = x.lista[i]; if(p[1] < 5 || p[1] > 120 || p[0] < 1 || p[0] >= p[1]) return false; vs.push(p[0] / p[1]); }
        vs.sort(function(a, b){ return a - b; }); for(var j = 1; j < 5; j++){ if(vs[j] - vs[j - 1] < 1e-6) return false; }
        return (vs[4] - vs[0]) <= 0.20;
      },
      facit: function(x){ return { form: 'ordna', lista: x.lista }; } };
  }
  // G2 — tecken (> eller <). Två äkta bråk, NÄRA värde (skillnad < 0,12), n ≤ 13.
  function teckenUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b }, prompt: function(){ return null; }, mellan: function(){ return null; },
      sample: function(rng){ return { a: sampProper(rng, 12, 13), b: sampProper(rng, 12, 13) }; },
      villkor: function(x){ if(!properOK(x.a) || !properOK(x.b) || x.a[1] > 13 || x.b[1] > 13) return false;
        var d = Math.abs(x.a[0] / x.a[1] - x.b[0] / x.b[1]); return d > 1e-6 && d < 0.12; },
      facit: function(x){ var av = x.a[0] / x.a[1], bv = x.b[0] / x.b[1]; return { form: 'tecken', a: x.a, b: x.b, ratt: av < bv ? '<' : '>' }; } };
  }
  // G3 — minsta gemensamma nämnare. Två äkta bråk, nämnare delar en gemensam faktor (minsta < produkt).
  function mgnUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b }, prompt: function(){ return null; }, mellan: function(){ return null; },
      sample: function(rng){ var na = ri(rng, 4, 64), nb = ri(rng, 4, 64); return { a: [ri(rng, 1, na - 1), na], b: [ri(rng, 1, nb - 1), nb] }; },
      villkor: function(x){ if(!properOK(x.a) || !properOK(x.b) || x.a[1] > 64 || x.b[1] > 64) return false;
        if(x.a[1] === x.b[1]) return false; return gcd(x.a[1], x.b[1]) > 1 && lcm(x.a[1], x.b[1]) <= 200; },
      facit: function(x){ return { form: 'mgn', a: x.a, b: x.b, L: lcm(x.a[1], x.b[1]) }; } };
  }
  // G4 — add/sub oliknämnigt, mellanled = MINSTA gem. nämnare (mgn:true). Negativt svar tillåtet.
  function addsubUppg(op, a, b, logg){
    return { logg: logg, orig: { op: op, a: a, b: b }, mellan: function(){ return null; },
      sample: function(rng){ return { op: op, a: sampProper(rng, 11, 36), b: sampProper(rng, 11, 36) }; },
      villkor: function(x){ if(!properOK(x.a) || !properOK(x.b) || x.a[1] > 36 || x.b[1] > 36 || x.a[0] > 11 || x.b[0] > 11) return false;
        if(x.a[1] === x.b[1]) return false;
        var L = lcm(x.a[1], x.b[1]), rt = (x.op === '+') ? x.a[0] * (L / x.a[1]) + x.b[0] * (L / x.b[1]) : x.a[0] * (L / x.a[1]) - x.b[0] * (L / x.b[1]);
        return L <= 99 && rt !== 0 && (rt % L) !== 0; },   // tak: svaret aldrig svårare än orig (max-lcm 99)
      prompt: function(x){ return BR(x.a[0], x.a[1]) + ' ' + x.op + ' ' + BR(x.b[0], x.b[1]) + ' ='; },
      facit: function(x){
        var L = lcm(x.a[1], x.b[1]), t1 = x.a[0] * (L / x.a[1]), t2 = x.b[0] * (L / x.b[1]);
        var rt = (x.op === '+') ? t1 + t2 : t1 - t2;
        return { form: 'addsub', op: x.op, a: x.a, b: x.b, mgn: true, m: [[t1, L], [t2, L]], svar: brakForm(rt, L) };
      } };
  }
  // G5 — byta form (decimal + bråk). Formbevarande sampel per slot-shape. LOGG i K1-STORE (bd-tillbrak:rakna).
  //   KOPPLING: när växlingsfamilj-ordern gör brak-byta till förälder m. barn per växling följer gruppen med
  //   sitt lån. Loggas via Mastery (k1), aldrig MasteryK2 — store-glappet (unionen skriver annars över per nyckel).
  var DECS = [['0,2', 1, 5], ['0,4', 2, 5], ['0,6', 3, 5], ['0,8', 4, 5], ['0,25', 1, 4], ['0,75', 3, 4],
    ['0,5', 1, 2], ['0,3', 3, 10], ['0,7', 7, 10], ['0,9', 9, 10]];
  // Prompt-strängen byggs här (utanför prompt-fältet) så elevtext-grindens statiska extrahering inte
  // misstolkar shape-jämförelselitteralerna som elevtext. Verkliga prompten byggs ur data ("0,2 + [bråk]").
  function decPromptStr(shape, x){
    if(shape === 'dec+brak') return x.dec[0] + ' + ' + BR(x.brak[0], x.brak[1]);
    if(shape === 'brak+hel') return BR(x.brak[0], x.brak[1]) + ' + ' + x.hel;
    if(shape === 'brak-dec') return BR(x.brak[0], x.brak[1]) + ' − ' + x.dec[0];
    return x.dec[0] + ' − ' + BR(x.brak[0], x.brak[1]);   // dec-brak
  }
  function decbrakUppg(shape, dec, brak, hel, logg){
    // shape: 'dec+brak' | 'brak+hel' | 'brak-dec' | 'dec-brak'
    function combine(x){   // → {t,n} värde som oreducerat bråk (behåller tecken)
      var op = (shape.indexOf('-') >= 0) ? '−' : '+';
      var L, A, B;
      if(shape === 'dec+brak' || shape === 'dec-brak'){ A = { t: x.dec[1], n: x.dec[2] }; B = { t: x.brak[0], n: x.brak[1] }; }
      else if(shape === 'brak+hel'){ A = { t: x.brak[0], n: x.brak[1] }; B = { t: x.hel, n: 1 }; }
      else { A = { t: x.brak[0], n: x.brak[1] }; B = { t: x.dec[1], n: x.dec[2] }; }   // brak-dec
      L = lcm(A.n, B.n); var at = A.t * (L / A.n), bt = B.t * (L / B.n);
      return { t: (op === '+') ? at + bt : at - bt, n: L };
    }
    return { logg: logg, loggStore: 'k1', orig: { dec: dec, brak: brak, hel: hel },
      mellan: function(){ return null; },
      sample: function(rng){
        var d = rp(rng, DECS), b = sampProper(rng, 8, 12), h = ri(rng, 2, 9);
        return { dec: d, brak: b, hel: h };
      },
      villkor: function(x){
        var b = x.brak; if(!properOK(b) || b[1] > 12) return false;
        var c = combine(x); if(c.t === 0) return false;
        if(shape === 'dec+brak' || shape === 'dec-brak' || shape === 'brak-dec'){ if(!x.dec || x.dec.length !== 3) return false; }
        if(shape === 'brak+hel'){ if(!(x.hel >= 2 && x.hel <= 9)) return false; }
        // undvik att bråket och decimalen är lika (trivialt) i +/-:
        if(x.dec && Math.abs(b[0] / b[1] - x.dec[1] / x.dec[2]) < 1e-9) return false;
        return true;
      },
      prompt: function(x){ return decPromptStr(shape, x); },
      facit: function(x){ var c = combine(x); return { form: 'decbrak', shape: shape, svar: brakForm(c.t, c.n) }; } };
  }
  // G6 — blandade tal add/sub, FRI equality-kedja. lan:true ⇒ bråkdelssubtraktionen kräver lån.
  function blandKedjaUppg(op, a, b, logg, lan){
    function val(o){ return o.h + o.t / o.n; }
    return { logg: logg, orig: { op: op, a: a, b: b, lan: !!lan }, mellan: function(){ return null; },
      sample: function(rng){ return { op: op, a: sampBland(rng, 8, 20), b: sampBland(rng, 8, 20), lan: !!lan }; },
      villkor: function(x){
        if(!blandOK(x.a, 8, 20) || !blandOK(x.b, 8, 20)) return false;
        if(x.a.n === x.b.n) return false;   // oliknämnig bråkdel
        var av = val(x.a), bv = val(x.b);
        if(x.op === '−'){ if(av - bv <= 0) return false;
          var fa = x.a.t / x.a.n, fb = x.b.t / x.b.n;
          if(x.lan && !(fa < fb)) return false;         // lån ⇔ minuendens bråkdel mindre
          if(!x.lan && fa <= fb) return false;          // icke-lån ⇔ bråkdelen räcker
        }
        var v = (x.op === '+') ? av + bv : av - bv;
        return Math.abs(v - Math.round(v)) > 1e-9 && lcm(x.a.n, x.b.n) <= 40;   // svar ej heltal; tak: nämnare ≤ orig (40)
      },
      prompt: function(x){ return BLAND(x.a.h, x.a.t, x.a.n) + ' ' + x.op + ' ' + BLAND(x.b.h, x.b.t, x.b.n); },
      facit: function(x){ var v = (x.op === '+') ? val(x.a) + val(x.b) : val(x.a) - val(x.b);
        var L = lcm(x.a.n, x.b.n), num = Math.round(v * L);
        return { form: 'kedja', v: v, fin: finOf(brakForm(num, L)) }; } };
  }
  // heltal · bråk, mellanled = OFÖRKORTAD produkt (H·t)/n, svar canonical. form 'multheltal'.
  function multheltalUppg(H, t, n, logg){
    return { logg: logg, orig: { H: H, t: t, n: n }, mellan: function(){ return null; },
      sample: function(rng){ var f = sampProper(rng, 12, 13); return { H: ri(rng, 2, 8), t: f[0], n: f[1] }; },
      villkor: function(x){ return properOK([x.t, x.n]) && x.n <= 13 && x.t <= 12 && x.H >= 2 && x.H <= 8 && x.H * x.t >= x.n; },
      prompt: function(x){ return x.H + ' · ' + BR(x.t, x.n) + ' ='; },
      facit: function(x){ var pt = x.H * x.t; return { form: 'multheltal', H: x.H, t: x.t, n: x.n, m: { t: pt, n: x.n }, svar: brakForm(pt, x.n) }; } };
  }
  // bråk · bråk (äkta [t,n] ELLER blandad {h,t,n}): mellanled = OFÖRKORTAD produkt av OÄKTA formerna. form 'multbrak'.
  function multbrakUppg(a, b, logg){
    var bland = !Array.isArray(a);
    return { logg: logg, orig: { a: a, b: b }, mellan: function(){ return null; },
      sample: function(rng){ return bland
        ? { a: sampBland(rng, 5, 5), b: sampBland(rng, 5, 5) }
        : { a: sampProper(rng, 8, 9), b: sampProper(rng, 8, 9) }; },
      villkor: function(x){
        var okShape = bland ? (blandOK(x.a, 5, 5) && blandOK(x.b, 5, 5))
          : (properOK(x.a) && properOK(x.b) && x.a[1] <= 9 && x.b[1] <= 9 && x.a[0] <= 8 && x.b[0] <= 8);
        if(!okShape) return false;
        var A = oakta(x.a), B = oakta(x.b), pt = A.t * B.t, pn = A.n * B.n;
        return (pn / gcd(pt, pn)) <= 45;   // tak: svarets nämnare ≤ orig (45)
      },
      prompt: function(x){ return brakPrompt(x.a) + ' · ' + brakPrompt(x.b) + ' ='; },
      facit: function(x){ var A = oakta(x.a), B = oakta(x.b), pt = A.t * B.t, pn = A.n * B.n;
        return { form: 'multbrak', a: x.a, b: x.b, m: { t: pt, n: pn }, svar: brakForm(pt, pn) }; } };
  }
  // bråk ÷ heltal, komplex-bråk BRAK(BRAK(t)(n))(H). Direkt svar. form 'komplexdiv'.
  function komplexBHUppg(t, n, H, logg){
    return { logg: logg, orig: { t: t, n: n, H: H }, mellan: function(){ return null; },
      sample: function(rng){ var f = sampProper(rng, 8, 9); return { t: f[0], n: f[1], H: ri(rng, 2, 8) }; },
      villkor: function(x){ return properOK([x.t, x.n]) && x.n <= 9 && x.H >= 2 && x.H <= 8 && x.n * x.H <= 72; },   // tak: svarsnämnare ≤ orig
      prompt: function(x){ return BR(BR(x.t, x.n), x.H); },
      facit: function(x){ return { form: 'komplexdiv', svar: brakForm(x.t, x.n * x.H) }; } };
  }
  // heltal ÷ bråk, komplex-bråk BRAK(H)(BRAK(t)(n)). Direkt svar. form 'komplexdiv'.
  function komplexHBUppg(H, t, n, logg){
    return { logg: logg, orig: { H: H, t: t, n: n }, mellan: function(){ return null; },
      sample: function(rng){ var f = sampProper(rng, 8, 9); return { H: ri(rng, 2, 12), t: f[0], n: f[1] }; },
      villkor: function(x){ return properOK([x.t, x.n]) && x.n <= 9 && x.H >= 2 && x.H <= 12; },
      prompt: function(x){ return BR(x.H, BR(x.t, x.n)); },
      facit: function(x){ return { form: 'komplexdiv', svar: brakForm(x.H * x.n, x.t) }; } };
  }
  // bråk ÷ bråk (komplex-bråk-prompt): mellanled = produktbråk (a·d)/(b·c) VÄRDE-rättat, svar enklaste form.
  function divbrakUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b }, mellan: function(){ return null; },
      sample: function(rng){ return { a: sampProper(rng, 5, 8), b: sampProper(rng, 5, 8) }; },
      villkor: function(x){ if(!properOK(x.a) || !properOK(x.b) || x.a[1] > 8 || x.b[1] > 8 || x.a[0] > 5 || x.b[0] > 5) return false;
        var pt = x.a[0] * x.b[1], pn = x.a[1] * x.b[0]; return (pt % pn) !== 0 && (pn / gcd(pt, pn)) <= 40; },   // svar ≠ heltal; nämnare ≤ orig
      prompt: function(x){ return BR(BR(x.a[0], x.a[1]), BR(x.b[0], x.b[1])); },
      facit: function(x){ var pt = x.a[0] * x.b[1], pn = x.a[1] * x.b[0];
        return { form: 'divbrak', a: x.a, b: x.b, m: { t: pt, n: pn }, svar: brakForm(pt, pn) }; } };
  }
  // inverterade talet (reciprok): svar = swap. fixed=true ⇒ algebraiskt fast tal (5x/y, 2x/xy^3), ingen variant.
  function reciprokUppg(t, n, logg, fixed){
    var o = { logg: logg, orig: { t: t, n: n }, mellan: function(){ return null; },
      prompt: function(x){ return BR(x.t, x.n); },
      facit: function(x){ return { form: 'reciprok', tSvar: '' + x.n, nSvar: '' + x.t }; } };
    if(fixed){ o.fixed = true; }
    else {
      o.sample = function(rng){ var f = sampProper(rng, 7, 9); return { t: f[0], n: f[1] }; };
      o.villkor = function(x){ return properOK([x.t, x.n]) && x.n <= 9 && x.t <= 7; };
    }
    return o;
  }
  // FRI equality-kedja för mult: förkorta/förenkla innan multiplikation. faktorer = [op-array], produkt förkortbar.
  //   shape 'a' = äkta [t,n], 'b' = blandad {h,t,n}. logSkal på tre-områdes-gruppen (fixed) — ej här.
  function multKedjaUppg(shapes, faktorer, logg){
    function prod(fs){ var t = 1, n = 1; fs.forEach(function(f){ var o = oakta(f); t *= o.t; n *= o.n; }); return { t: t, n: n }; }
    function reducerbar(fs){ var p = prod(fs); return gcd(p.t, p.n) > 1; }
    function resDenom(fs){ var p = prod(fs); return p.n / gcd(p.t, p.n); }   // reducerad svarsnämnare
    return { logg: logg, orig: { faktorer: faktorer }, mellan: function(){ return null; },
      sample: function(rng){
        for(var attempt = 0; attempt < 80; attempt++){
          var fs = shapes.map(function(s){ return s === 'b' ? sampBland(rng, 6, 12) : sampProper(rng, 8, 12); });
          if(fs.every(function(f, i){ return shapes[i] === 'b' ? blandOK(f, 6, 12) : properOK(f); }) && reducerbar(fs) && resDenom(fs) <= 20) return { faktorer: fs };
        }
        return { faktorer: faktorer };
      },
      villkor: function(x){ if(!x.faktorer || x.faktorer.length !== shapes.length) return false;
        for(var i = 0; i < shapes.length; i++){ var f = x.faktorer[i];
          if(shapes[i] === 'b'){ if(!blandOK(f, 6, 12)) return false; } else { if(!properOK(f) || f[1] > 12) return false; } }
        return reducerbar(x.faktorer) && resDenom(x.faktorer) <= 20; },   // tak: svaret aldrig svårare än orig
      prompt: function(x){ return x.faktorer.map(brakPrompt).join(' · '); },
      facit: function(x){ var p = prod(x.faktorer); return { form: 'kedja', v: p.t / p.n, fin: finOf(brakForm(p.t, p.n)) }; } };
  }
  // FRI equality-kedja för division: invertera + förenkla. (a/b) ÷ (c/d), produkten efter invertering förkortbar.
  function divKedjaUppg(shapeA, shapeB, a, b, logg){
    function val(op){ var o = oakta(op); return o.t / o.n; }
    function prod(x){ var A = oakta(x.a), B = oakta(x.b); return { t: A.t * B.n, n: A.n * B.t }; }
    return { logg: logg, orig: { a: a, b: b }, mellan: function(){ return null; },
      sample: function(rng){
        for(var attempt = 0; attempt < 60; attempt++){
          var A = shapeA === 'b' ? sampBland(rng, 6, 12) : sampProper(rng, 8, 12);
          var B = shapeB === 'b' ? sampBland(rng, 6, 12) : sampProper(rng, 8, 12);
          var x = { a: A, b: B }, p = prod(x);
          var okA = shapeA === 'b' ? blandOK(A, 6, 12) : properOK(A), okB = shapeB === 'b' ? blandOK(B, 6, 12) : properOK(B);
          if(okA && okB && gcd(p.t, p.n) > 1 && (p.t % p.n) !== 0 && (p.n / gcd(p.t, p.n)) <= 24) return x;
        }
        return { a: a, b: b };
      },
      villkor: function(x){ var okA = shapeA === 'b' ? blandOK(x.a, 6, 12) : properOK(x.a), okB = shapeB === 'b' ? blandOK(x.b, 6, 12) : properOK(x.b);
        if(!okA || !okB) return false; var p = prod(x);
        return gcd(p.t, p.n) > 1 && (p.t % p.n) !== 0 && (p.n / gcd(p.t, p.n)) <= 24; },   // svar ≠ heltal; nämnare ≤ orig
      prompt: function(x){ return BR(brakPrompt(x.a), brakPrompt(x.b)); },
      facit: function(x){ var p = prod(x); return { form: 'kedja', v: p.t / p.n, fin: finOf(brakForm(p.t, p.n)) }; } };
  }
  // FASTA equality-kedja (tre-områden): fixed, ingen variant, logg:null + loggSkal.
  function fastaKedjaUppg(qStr, v, fin, loggSkal){
    return { logg: null, loggSkal: loggSkal, fixed: true, orig: {}, mellan: function(){ return null; },
      prompt: function(){ return qStr; }, facit: function(){ return { form: 'kedja', v: v, fin: fin }; } };
  }

  var LOGG_SKAL_G10 = 'Loggas inte: uppgiften korsar tre områden (bråkräkning, negativa tal och prioriteringsregeln) ' +
    'och ingen enskild färdighetsnod äger den ensam. Byggd som färdighetsträning utan evidens.';

  // ── MALLAR — Joachims exakta tal (dokument 1). Grupp-ordning + rubriker låsta. ──
  var MALLAR = {

    ova1: { titel: 'Grunder, addition och subtraktion', grupper: [
      { rubrik: 'Ordna bråken i storleksordning, börja med det minsta – avrunda till närmevärde',
        logg: 'brak-jmf-narmevarde:resonera', uppgifter: [
          ordnaUppg([[3, 11], [2, 9], [4, 12], [9, 31], [32, 111]], 'brak-jmf-narmevarde:resonera') ] },

      { rubrik: 'Vilket tecken ska stå mellan bråken, > eller <', logg: 'brak-jmf-lika:begrepp', uppgifter:
        [[[5, 8], [6, 9]], [[7, 13], [6, 12]], [[7, 8], [8, 9]], [[3, 8], [2, 5]], [[5, 9], [7, 12]]]
          .map(function(p){ return teckenUppg(p[0], p[1], 'brak-jmf-lika:begrepp'); }) },

      { rubrik: 'Skriv bråken med minsta gemensamma nämnare', logg: 'brak-mgn:rakna', uppgifter:
        [[[11, 18], [7, 24]], [[7, 8], [5, 12]], [[5, 27], [11, 36]], [[31, 64], [13, 24]]]
          .map(function(p){ return mgnUppg(p[0], p[1], 'brak-mgn:rakna'); }) },

      { rubrik: 'Beräkna – visa mellanledet med minsta gemensamma nämnare (inte förlängningen), svara i enklaste form',
        logg: 'brak-add:rakna', uppgifter: [
          addsubUppg('+', [2, 7], [3, 4], 'brak-add:rakna'),
          addsubUppg('+', [2, 9], [10, 11], 'brak-add:rakna'),
          addsubUppg('−', [6, 12], [5, 36], 'brak-sub:rakna'),
          addsubUppg('−', [3, 8], [5, 9], 'brak-sub:rakna') ] },

      { rubrik: 'Beräkna genom att byta form – svara i enklaste form', logg: 'bd-tillbrak:rakna', loggStore: 'k1', uppgifter: [
          decbrakUppg('dec+brak', ['0,2', 1, 5], [2, 3], 0, 'bd-tillbrak:rakna'),
          decbrakUppg('brak+hel', null, [5, 6], 7, 'bd-tillbrak:rakna'),
          decbrakUppg('brak-dec', ['0,6', 3, 5], [1, 9], 0, 'bd-tillbrak:rakna'),
          decbrakUppg('dec-brak', ['0,7', 7, 10], [2, 3], 0, 'bd-tillbrak:rakna') ] },

      { rubrik: 'Beräkna – visa mellanled, svara i enklaste form', logg: 'brak-add:rakna', uppgifter: [
          blandKedjaUppg('+', { h: 5, t: 3, n: 7 }, { h: 8, t: 1, n: 3 }, 'brak-add:rakna', false),
          blandKedjaUppg('−', { h: 4, t: 3, n: 7 }, { h: 1, t: 1, n: 3 }, 'brak-sub:rakna', false),
          blandKedjaUppg('−', { h: 3, t: 7, n: 8 }, { h: 1, t: 13, n: 20 }, 'brak-sub:rakna', false),
          blandKedjaUppg('−', { h: 5, t: 5, n: 9 }, { h: 2, t: 11, n: 12 }, 'brak-lana:rakna', true) ] }
    ] },

    ova2: { titel: 'Multiplikation och division', grupper: [
      { rubrik: 'Beräkna – svara i enklaste form – visa ett mellanled', logg: 'brak-mult-rakna:rakna', uppgifter: [
          multheltalUppg(3, 6, 7, 'brak-mult-rakna:rakna'),
          multheltalUppg(5, 7, 13, 'brak-mult-rakna:rakna'),
          multheltalUppg(6, 9, 11, 'brak-mult-rakna:rakna') ] },

      { rubrik: 'Beräkna – svara i enklaste form – visa mellanled', logg: 'brak-mult-rakna:rakna', uppgifter: [
          multbrakUppg([2, 5], [3, 7], 'brak-mult-rakna:rakna'),
          multbrakUppg([2, 9], [4, 5], 'brak-mult-rakna:rakna'),
          multbrakUppg({ h: 2, t: 3, n: 4 }, { h: 1, t: 1, n: 5 }, 'brak-mult-rakna:rakna'),
          multbrakUppg({ h: 1, t: 3, n: 4 }, { h: 2, t: 2, n: 3 }, 'brak-mult-rakna:rakna') ] },

      { rubrik: 'Beräkna', logg: 'brak-div-bh:rakna', uppgifter: [
          komplexBHUppg(1, 5, 2, 'brak-div-bh:rakna'),
          komplexBHUppg(1, 7, 8, 'brak-div-bh:rakna'),
          komplexBHUppg(2, 7, 3, 'brak-div-bh:rakna'),
          komplexBHUppg(7, 9, 2, 'brak-div-bh:rakna') ] },

      { rubrik: 'Beräkna – förkorta innan multiplikation, visa mellanled, svara i enklaste form', logg: 'brak-mult-forkorta:rakna', uppgifter: [
          multKedjaUppg(['a', 'a'], [[5, 27], [9, 15]], 'brak-mult-forkorta:rakna'),
          multKedjaUppg(['a', 'a'], [[14, 17], [34, 42]], 'brak-mult-forkorta:rakna'),
          multKedjaUppg(['b', 'b'], [{ h: 2, t: 1, n: 5 }, { h: 1, t: 3, n: 22 }], 'brak-mult-forkorta:rakna'),
          multKedjaUppg(['b', 'b'], [{ h: 5, t: 5, n: 9 }, { h: 6, t: 3, n: 10 }], 'brak-mult-forkorta:rakna'),
          multKedjaUppg(['a', 'a', 'a'], [[3, 4], [11, 7], [21, 22]], 'brak-mult-forkorta:rakna'),
          multKedjaUppg(['b', 'b', 'b'], [{ h: 3, t: 3, n: 5 }, { h: 1, t: 1, n: 9 }, { h: 2, t: 1, n: 2 }], 'brak-mult-forkorta:rakna') ] },

      { rubrik: 'Invertera talet', logg: 'brak-div-reciprok:rakna', uppgifter: [
          reciprokUppg(3, 7, 'brak-div-reciprok:rakna'),
          reciprokUppg('5x', 'y', 'brak-div-reciprok:rakna', true),
          reciprokUppg('2x', 'xy^3', 'brak-div-reciprok:rakna', true) ] },

      { rubrik: 'Beräkna', logg: 'brak-div-hb:rakna', uppgifter: [
          komplexHBUppg(4, 1, 5, 'brak-div-hb:rakna'),
          komplexHBUppg(7, 1, 6, 'brak-div-hb:rakna'),
          komplexHBUppg(2, 3, 4, 'brak-div-hb:rakna'),
          komplexHBUppg(12, 4, 7, 'brak-div-hb:rakna') ] },

      { rubrik: 'Beräkna – visa mellanled med förlängning, svara i enklaste form', logg: 'brak-div-bb:rakna', uppgifter: [
          divbrakUppg([4, 5], [2, 3], 'brak-div-bb:rakna'),
          divbrakUppg([3, 7], [5, 8], 'brak-div-bb:rakna') ] },

      { rubrik: 'Beräkna – visa mellanled med invertering, svara i enklaste form', logg: 'brak-div-inv:rakna', uppgifter: [
          divbrakUppg([6, 7], [3, 11], 'brak-div-inv:rakna'),
          divbrakUppg([7, 9], [8, 10], 'brak-div-inv:rakna') ] },

      { rubrik: 'Beräkna – visa mellanled med invertering, förenkla innan multiplikation', logg: 'brak-div-inv:rakna', uppgifter: [
          divKedjaUppg('a', 'a', [5, 8], [25, 32], 'brak-div-inv:rakna'),
          divKedjaUppg('b', 'b', { h: 3, t: 3, n: 7 }, { h: 2, t: 1, n: 4 }, 'brak-div-inv:rakna'),
          divKedjaUppg('b', 'b', { h: 2, t: 7, n: 12 }, { h: 6, t: 1, n: 5 }, 'brak-div-inv:rakna') ] },

      { rubrik: 'Beräkna – visa mellanled, svara i enklaste form', logg: null, uppgifter: [
          fastaKedjaUppg(BR(2, 3) + ' + ' + BR(1, 2) + ' · (' + BR(5, 12) + ' + (−' + BR(3, 12) + '))',
            3 / 4, { k: 'br', t: 3, n: 4 }, LOGG_SKAL_G10),
          fastaKedjaUppg(BR('(−' + BR(4, 7) + ' + ' + BR(3, 14) + ')', '(' + BR(12, -5) + ' + (−' + BR(4, 15) + '))'),
            15 / 112, { k: 'br', t: 15, n: 112 }, LOGG_SKAL_G10) ] }
    ] }
  };

  // ── svarSig — facit-signatur (för variant-distinkthet i genUppgift + fuzz). ──
  function finSig(f){ return f.k === 'dec' ? 'dec:' + f.x : f.k === 'br' ? 'br:' + f.t + '/' + f.n : 'mi:' + f.h + ';' + f.t + '/' + f.n; }
  function svarSig(f){
    switch(f.form){
      case 'tal': return 't:' + f.v;
      case 'brak': return 'b:' + f.t + '/' + f.n;
      case 'blandad': return 'bl:' + f.hel + ';' + f.t + '/' + f.n;
      case 'tecken': return 'tk:' + f.ratt;
      case 'ordna': return 'o:' + f.lista.map(function(p){ return p[0] / p[1]; }).sort(function(a, b){ return a - b; }).join(',');
      case 'mgn': return 'mgn:' + f.L + ':' + (f.a[0] * f.L / f.a[1]) + '/' + (f.b[0] * f.L / f.b[1]);
      case 'reciprok': return 're:' + f.tSvar + '/' + f.nSvar;
      case 'decbrak': case 'komplexdiv': return f.form + ':' + svarSig(f.svar);
      case 'kedja': return 'ke:' + finSig(f.fin);
      case 'addsub': case 'multheltal': case 'multbrak': case 'divbrak':
        return f.form + ':' + JSON.stringify(f.m) + '|' + svarSig(f.svar);
      default: return JSON.stringify(f);
    }
  }
  var FACIT_FRI = { tecken: 1 };   // former där facit får upprepas (bunden val-mängd)

  // ── GENERERING — variant 0 = orig; ≥1 samplas tills villkor håller OCH tal+facit skiljer sig från alla lägre
  //   varianter (och från grupp-syskon i samma variant, via undvik). ──
  function bygg(u, t, kastade){ return { prompt: u.prompt ? u.prompt(t) : null, mellan: u.mellan ? u.mellan(t) : null,
    facit: u.facit(t), logg: u.logg || null, loggStore: u.loggStore || 'k2', loggSkal: u.loggSkal || null, tal: t, _kastade: kastade || 0 }; }
  function talKey(t){ return JSON.stringify(t); }
  function genUppgift(u, dokId, idx, variant, undvik){
    if(variant === 0 || u.fixed || !u.sample) return bygg(u, u.orig, 0);
    var priorT = {}, priorF = {};
    priorT[talKey(u.orig)] = 1; priorF[svarSig(u.facit(u.orig))] = 1;
    for(var j = 1; j < variant; j++){ var g = genUppgift(u, dokId, idx, j); priorT[talKey(g.tal)] = 1; priorF[svarSig(g.facit)] = 1; }
    var rng = mkRng(seedOf(dokId, idx, variant) ^ 0x9E3779B9), kastade = 0, t = null;
    for(var i = 0; i < 600; i++){ var cand = u.sample(rng), key = talKey(cand);
      if(u.villkor(cand) && !priorT[key] && !(undvik && undvik[key])){
        var f = u.facit(cand);
        if(FACIT_FRI[f.form] || !priorF[svarSig(f)]){ t = cand; break; }
      }
      kastade++;
    }
    return bygg(u, t || u.orig, kastade);
  }
  function genereraDokument(dokId, variant){
    var mall = MALLAR[dokId]; if(!mall) return null;
    var idx = 0;
    return { dokId: dokId, variant: variant, titel: mall.titel, grupper: mall.grupper.map(function(g){
      var used = {};
      return { rubrik: g.rubrik, logg: g.logg || null, uppgifter: g.uppgifter.map(function(u){
        var gu = genUppgift(u, dokId, idx++, variant, used); used[talKey(gu.tal)] = 1; return gu;
      }) };
    }) };
  }

  var API = { MALLAR: MALLAR, genereraDokument: genereraDokument, genUppgift: genUppgift,
    _intern: { mkRng: mkRng, seedOf: seedOf, k: k, gcd: gcd, lcm: lcm, BR: BR, BLAND: BLAND, brakForm: brakForm, rund: rund, svarSig: svarSig, finSig: finSig } };
  if(typeof window !== 'undefined') window.AK9_K2_AKR9_OVA = API;
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
