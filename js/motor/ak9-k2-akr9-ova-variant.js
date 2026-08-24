/* ak9-k2-akr9-ova-variant.js — NIANS Åk9-spårets dk2 "Räkna med bråk", ÖVA (två dokument).
   Skilt från E-spårets sex (ak9-k2-ova-variant.js / AK9_K2_OVA) — detta är MÅL-spåret (svårare band).
   Joachims två docx: "Öva 1 – grunder, addition och subtraktion" + "Öva 2 – multiplikation och division".
   ─────────────────────────────────────────────────────────────────────────────────────────────────
   FAS 3: BARA dokument 1 (Joachims exakta tal, orig). sample/villkor (varianter) läggs till i FAS 4.
   Speglar E-spårets arkitektur: mallar per dokument, form-taggade facit; öva-sidan renderar + rättar.
   Bråk = BRAK(täljare)(nämnare) → stående bråk. Blandat = heltal + ' ' + BRAK(...). Komplex-bråk = nästlat.

   FORMER (öva-sidan renderar cell + rättar per .form):
     canonical (värde + enklaste form, delas med E-spåret):
       'ordna' · 'tecken' (>/<) · 'multheltal' · 'multbrak' · 'komplexdiv' · 'divbrak' · 'reciprok'
     NYA i Åk9-spåret:
       'mgn'     — två celler, båda bråken med MINSTA gem. nämnare; "rätt men ej minsta" underkänns
       'addsub'  — mgn:true ⇒ mellanledet KRÄVER minsta gem. nämnare (ej valfri gemensam, ej förläningen)
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
  function BR(t, n){ return 'BRAK(' + t + ')(' + n + ')'; }                 // stående bråk
  function BLAND(h, t, n){ return h + ' ' + BR(t, n); }                     // blandat tal
  // Reducera; härled form ur VÄRDET (per variant, ej ärvd). Klarar negativa (behåller tecknet i täljaren).
  function brakForm(t, n){
    var g = gcd(t, n), T = t / g, N = n / g;
    if(N === 1) return { form: 'tal', v: T };                             // heltal
    if(Math.abs(T) >= N){ var hel = (T < 0 ? -1 : 1) * Math.floor(Math.abs(T) / N), rest = Math.abs(T) - Math.abs(hel) * N; return { form: 'blandad', hel: hel, t: rest, n: N }; }
    return { form: 'brak', t: T, n: N };                                  // äkta (kan vara negativ täljare)
  }

  // ── FORM-KONSTRUKTORER (orig-only för FAS 3; sample/villkor tillkommer i FAS 4) ──
  function ordnaUppg(lista, logg){
    return { logg: logg, orig: { lista: lista }, prompt: function(){ return null; }, mellan: function(){ return null; },
      facit: function(x){ return { form: 'ordna', lista: x.lista }; } };
  }
  // tecken TVÅ-vägs (> eller <) — nians dokument har inga lika-par (skilt från E-spårets tre-vägs =,<,>).
  function teckenUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b }, prompt: function(){ return null; }, mellan: function(){ return null; },
      facit: function(x){ var av = x.a[0] / x.a[1], bv = x.b[0] / x.b[1]; return { form: 'tecken', a: x.a, b: x.b, ratt: av < bv ? '<' : '>' }; } };
  }
  // MGN: skriv BÅDA bråken med minsta gem. nämnare. Två celler; L = minsta (LCM). "rätt men ej minsta" underkänns.
  function mgnUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b }, prompt: function(){ return null; }, mellan: function(){ return null; },
      facit: function(x){ return { form: 'mgn', a: x.a, b: x.b, L: lcm(x.a[1], x.b[1]) }; } };
  }
  // add/sub oliknämnigt, MGN-mellanled (mgn:true ⇒ mellanledets nämnare MÅSTE vara minsta gem. nämnare).
  //   Positivt eller negativt svar (nian tillåter negativt: 3/8 − 5/9 = −13/72). Svar canonical.
  function addsubUppg(op, a, b, logg){
    return { logg: logg, orig: { op: op, a: a, b: b }, mellan: function(){ return null; },
      prompt: function(x){ return BR(x.a[0], x.a[1]) + ' ' + x.op + ' ' + BR(x.b[0], x.b[1]) + ' ='; },
      facit: function(x){
        var L = lcm(x.a[1], x.b[1]), t1 = x.a[0] * (L / x.a[1]), t2 = x.b[0] * (L / x.b[1]);
        var rt = (x.op === '+') ? t1 + t2 : t1 - t2;
        return { form: 'addsub', op: x.op, a: x.a, b: x.b, mgn: true, m: [[t1, L], [t2, L]], svar: brakForm(rt, L) };
      } };
  }
  // decimal + bråk i samma uttryck. prompt = BRAK-sträng med decimaler; direkt svar (form-styrd cell), inget mellanled.
  //   LOGG-STORE: 'k1' — brak-byta är ett K1-lån (bd-tillbrak:rakna). Loggas via Mastery, ej MasteryK2 (store-glappet).
  function decbrakUppg(promptStr, svarTal, svarNamn, logg){
    return { logg: logg, loggStore: 'k1', orig: {}, mellan: function(){ return null; },
      prompt: function(){ return promptStr; },
      facit: function(){ return { form: 'decbrak', svar: brakForm(svarTal, svarNamn) }; } };
  }
  // heltal · bråk: mellanled = OFÖRKORTAD produkt (H·t)/n, svar canonical. form 'multheltal'.
  function multheltalUppg(H, t, n, logg){
    return { logg: logg, orig: { H: H, t: t, n: n }, mellan: function(){ return null; },
      prompt: function(x){ return x.H + ' · ' + BR(x.t, x.n) + ' ='; },
      facit: function(x){ var pt = x.H * x.t; return { form: 'multheltal', H: x.H, t: x.t, n: x.n, m: { t: pt, n: x.n }, svar: brakForm(pt, x.n) }; } };
  }
  // bråk · bråk (operander äkta [t,n] ELLER blandade {h,t,n}): mellanled = OFÖRKORTAD produkt av OÄKTA formerna.
  //   2 3/4 · 1 1/5 = 11/4 · 6/5 → mellanled 66/20, svar 3 3/10. form 'multbrak' (mel = literala produkttal).
  function oakta(op){ return Array.isArray(op) ? { t: op[0], n: op[1] } : { t: op.h * op.n + op.t, n: op.n }; }
  function multbrakUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b }, mellan: function(){ return null; },
      prompt: function(x){ return brakPrompt(x.a) + ' · ' + brakPrompt(x.b) + ' ='; },
      facit: function(x){ var A = oakta(x.a), B = oakta(x.b), pt = A.t * B.t, pn = A.n * B.n;
        return { form: 'multbrak', a: x.a, b: x.b, m: { t: pt, n: pn }, svar: brakForm(pt, pn) }; } };
  }
  function brakPrompt(op){ return Array.isArray(op) ? BR(op[0], op[1]) : BLAND(op.h, op.t, op.n); }
  // komplex-bråk ÷: bråk÷heltal (BH: BRAK(BRAK(t)(n))(H)) resp. heltal÷bråk (HB: BRAK(H)(BRAK(t)(n))). Direkt svar.
  function komplexBHUppg(t, n, H, logg){   // (t/n) / H  — renderaren äger '=', ingen trailing i prompten
    return { logg: logg, orig: { t: t, n: n, H: H }, mellan: function(){ return null; },
      prompt: function(x){ return BR(BR(x.t, x.n), x.H); },
      facit: function(x){ return { form: 'komplexdiv', svar: brakForm(x.t, x.n * x.H) }; } };
  }
  function komplexHBUppg(H, t, n, logg){   // H / (t/n)
    return { logg: logg, orig: { H: H, t: t, n: n }, mellan: function(){ return null; },
      prompt: function(x){ return BR(x.H, BR(x.t, x.n)); },
      facit: function(x){ return { form: 'komplexdiv', svar: brakForm(x.H * x.n, x.t) }; } };
  }
  // bråk ÷ bråk (komplex-bråk-prompt): mellanled = produktbråk (a·d)/(b·c) VÄRDE-rättat, svar enklaste form.
  function divbrakUppg(a, b, logg){
    return { logg: logg, orig: { a: a, b: b }, mellan: function(){ return null; },
      prompt: function(x){ return BR(BR(x.a[0], x.a[1]), BR(x.b[0], x.b[1])); },
      facit: function(x){ var pt = x.a[0] * x.b[1], pn = x.a[1] * x.b[0];
        return { form: 'divbrak', a: x.a, b: x.b, m: { t: pt, n: pn }, svar: brakForm(pt, pn) }; } };
  }
  // inverterade talet (reciprok): svar = swap av täljare/nämnare (strängar; klarar algebraiskt 5x/y, 2x/xy^3).
  //   fixed=true ⇒ algebraiskt fast tal (ingen variant). Svar OÄKTA (3/7 → 7/3, ej 2 1/3) — inversionen ska synas.
  function reciprokUppg(t, n, logg, fixed){
    var o = { logg: logg, orig: { t: t, n: n }, mellan: function(){ return null; },
      prompt: function(x){ return BR(x.t, x.n); },
      facit: function(x){ return { form: 'reciprok', tSvar: '' + x.n, nSvar: '' + x.t }; } };
    if(fixed) o.fixed = true;
    return o;
  }
  // FRI equality-kedja (Likhetsrattare.provaKedja): q = uttryck, v = värdet varje led måste ha, fin = slutform.
  //   fin = {k:'br',t,n} | {k:'mi',h,t,n} | {k:'dec',x}. logg=null ⇒ ologgad (loggSkal i klartext).
  function kedjaUppg(qStr, v, fin, logg, loggSkal){
    var o = { logg: logg || null, orig: {}, mellan: function(){ return null; },
      prompt: function(){ return qStr; },
      facit: function(){ return { form: 'kedja', v: v, fin: fin }; } };
    if(loggSkal) o.loggSkal = loggSkal;
    return o;
  }

  // Ologgade tre-områdes-gruppens skäl i klartext (samma hantering som dk1:s förståelseträningsgrupper).
  var LOGG_SKAL_G10 = 'Loggas inte: uppgiften korsar tre områden (bråkräkning, negativa tal och prioriteringsregeln) ' +
    'och ingen enskild färdighetsnod äger den ensam. Byggd som färdighetsträning utan evidens.';

  // ── MALLAR — Joachims exakta tal (dokument 1). Grupp-ordning + rubriker låsta. ──
  var MALLAR = {

    ova1: { titel: 'Grunder, addition och subtraktion', grupper: [
      // G1 — storleksordna med närmevärde (avrundningsregel). Ny metod, egen nod.
      { rubrik: 'Ordna bråken i storleksordning, börja med det minsta – avrunda till närmevärde',
        logg: 'brak-jmf-narmevarde:resonera', uppgifter: [
          ordnaUppg([[3, 11], [2, 9], [4, 12], [9, 31], [32, 111]], 'brak-jmf-narmevarde:resonera') ] },

      // G2 — vilket tecken (> eller <). Tvåvägs (inga lika-par i dokumentet).
      { rubrik: 'Vilket tecken ska stå mellan bråken, > eller <', logg: 'brak-jmf-lika:begrepp', uppgifter:
        [[[5, 8], [6, 9]], [[7, 13], [6, 12]], [[7, 8], [8, 9]], [[3, 8], [2, 5]], [[5, 9], [7, 12]]]
          .map(function(p){ return teckenUppg(p[0], p[1], 'brak-jmf-lika:begrepp'); }) },

      // G3 — skriv bråken med MINSTA gemensamma nämnare (två celler; "rätt men ej minsta" underkänns).
      { rubrik: 'Skriv bråken med minsta gemensamma nämnare', logg: 'brak-mgn:rakna', uppgifter:
        [[[11, 18], [7, 24]], [[7, 8], [5, 12]], [[5, 27], [11, 36]], [[31, 64], [13, 24]]]
          .map(function(p){ return mgnUppg(p[0], p[1], 'brak-mgn:rakna'); }) },

      // G4 — beräkna: mellanled = MINSTA gem. nämnare (ej förläningen), svar i enklaste form. Nian tillåter negativt.
      { rubrik: 'Beräkna – visa mellanledet med minsta gemensamma nämnare (inte förlängningen), svara i enklaste form',
        logg: 'brak-add:rakna', uppgifter: [
          addsubUppg('+', [2, 7], [3, 4], 'brak-add:rakna'),
          addsubUppg('+', [2, 9], [10, 11], 'brak-add:rakna'),
          addsubUppg('−', [6, 12], [5, 36], 'brak-sub:rakna'),
          addsubUppg('−', [3, 8], [5, 9], 'brak-sub:rakna') ] },

      // G5 — beräkna genom att byta form (decimal + bråk). LOGG i K1-STORE (brak-byta ⇒ bd-tillbrak:rakna).
      //   KOPPLING: när växlingsfamilj-ordern gör brak-byta till förälder med barn per växling följer denna grupp med
      //   sitt lån (bd-tillbrak:rakna, decimal→bråk). Loggas därför via Mastery (k1), aldrig MasteryK2 — store-glappet.
      { rubrik: 'Beräkna genom att byta form – svara i enklaste form', logg: 'bd-tillbrak:rakna', loggStore: 'k1', uppgifter: [
          decbrakUppg('0,2 + ' + BR(2, 3), 13, 15, 'bd-tillbrak:rakna'),
          decbrakUppg(BR(5, 6) + ' + 7', 47, 6, 'bd-tillbrak:rakna'),          // 7 5/6 = 47/6 (blandad)
          decbrakUppg(BR(1, 9) + ' − 0,6', -22, 45, 'bd-tillbrak:rakna'),       // negativt
          decbrakUppg('0,7 − ' + BR(2, 3), 1, 30, 'bd-tillbrak:rakna') ] },

      // G6 — blandade tal, add/sub med låna. FRI equality-kedja (visa mellanled fritt, sista led = enklaste blandad form).
      { rubrik: 'Beräkna – visa mellanled, svara i enklaste form', logg: 'brak-add:rakna', uppgifter: [
          kedjaUppg(BLAND(5, 3, 7) + ' + ' + BLAND(8, 1, 3), 13 + 16 / 21, { k: 'mi', h: 13, t: 16, n: 21 }, 'brak-add:rakna'),
          kedjaUppg(BLAND(4, 3, 7) + ' − ' + BLAND(1, 1, 3), 3 + 2 / 21, { k: 'mi', h: 3, t: 2, n: 21 }, 'brak-sub:rakna'),
          kedjaUppg(BLAND(3, 7, 8) + ' − ' + BLAND(1, 13, 20), 2 + 9 / 40, { k: 'mi', h: 2, t: 9, n: 40 }, 'brak-sub:rakna'),
          kedjaUppg(BLAND(5, 5, 9) + ' − ' + BLAND(2, 11, 12), 2 + 23 / 36, { k: 'mi', h: 2, t: 23, n: 36 }, 'brak-lana:rakna') ] }
    ] },

    ova2: { titel: 'Multiplikation och division', grupper: [
      // G1 — heltal · bråk, ett mellanled (oförkortad produkt), svar enklaste form.
      { rubrik: 'Beräkna – svara i enklaste form – visa ett mellanled', logg: 'brak-mult-rakna:rakna', uppgifter: [
          multheltalUppg(3, 6, 7, 'brak-mult-rakna:rakna'),
          multheltalUppg(5, 7, 13, 'brak-mult-rakna:rakna'),
          multheltalUppg(6, 9, 11, 'brak-mult-rakna:rakna') ] },

      // G2 — bråk · bråk (äkta + blandade), mellanled = oförkortad produkt av oäkta formerna, svar enklaste form.
      { rubrik: 'Beräkna – svara i enklaste form – visa mellanled', logg: 'brak-mult-rakna:rakna', uppgifter: [
          multbrakUppg([2, 5], [3, 7], 'brak-mult-rakna:rakna'),
          multbrakUppg([2, 9], [4, 5], 'brak-mult-rakna:rakna'),
          multbrakUppg({ h: 2, t: 3, n: 4 }, { h: 1, t: 1, n: 5 }, 'brak-mult-rakna:rakna'),
          multbrakUppg({ h: 1, t: 3, n: 4 }, { h: 2, t: 2, n: 3 }, 'brak-mult-rakna:rakna') ] },

      // G3 — bråk ÷ heltal, komplex-bråk. Direkt svar (inget mellanled).
      { rubrik: 'Beräkna', logg: 'brak-div-bh:rakna', uppgifter: [
          komplexBHUppg(1, 5, 2, 'brak-div-bh:rakna'),
          komplexBHUppg(1, 7, 8, 'brak-div-bh:rakna'),
          komplexBHUppg(2, 7, 3, 'brak-div-bh:rakna'),
          komplexBHUppg(7, 9, 2, 'brak-div-bh:rakna') ] },

      // G4 — förkorta innan multiplikation. FRI equality-kedja (förkorta i mellanledet, sista led = enklaste form).
      { rubrik: 'Beräkna – förkorta innan multiplikation, visa mellanled, svara i enklaste form', logg: 'brak-mult-forkorta:rakna', uppgifter: [
          kedjaUppg(BR(5, 27) + ' · ' + BR(9, 15), 1 / 9, { k: 'br', t: 1, n: 9 }, 'brak-mult-forkorta:rakna'),
          kedjaUppg(BR(14, 17) + ' · ' + BR(34, 42), 2 / 3, { k: 'br', t: 2, n: 3 }, 'brak-mult-forkorta:rakna'),
          kedjaUppg(BLAND(2, 1, 5) + ' · ' + BLAND(1, 3, 22), 5 / 2, { k: 'mi', h: 2, t: 1, n: 2 }, 'brak-mult-forkorta:rakna'),
          kedjaUppg(BLAND(5, 5, 9) + ' · ' + BLAND(6, 3, 10), 35, { k: 'dec', x: 35 }, 'brak-mult-forkorta:rakna'),
          kedjaUppg(BR(3, 4) + ' · ' + BR(11, 7) + ' · ' + BR(21, 22), 9 / 8, { k: 'mi', h: 1, t: 1, n: 8 }, 'brak-mult-forkorta:rakna'),
          kedjaUppg(BLAND(3, 3, 5) + ' · ' + BLAND(1, 1, 9) + ' · ' + BLAND(2, 1, 2), 10, { k: 'dec', x: 10 }, 'brak-mult-forkorta:rakna') ] },

      // G5 — invertera talet. Svar OÄKTA (3/7 → 7/3). Algebraiska (5x/y, 2x/xy^3) FASTA — inversionen ska synas.
      { rubrik: 'Invertera talet', logg: 'brak-div-reciprok:rakna', uppgifter: [
          reciprokUppg(3, 7, 'brak-div-reciprok:rakna'),
          reciprokUppg('5x', 'y', 'brak-div-reciprok:rakna', true),
          reciprokUppg('2x', 'xy^3', 'brak-div-reciprok:rakna', true) ] },

      // G6 — heltal ÷ bråk, komplex-bråk. Direkt svar (inget mellanled).
      { rubrik: 'Beräkna', logg: 'brak-div-hb:rakna', uppgifter: [
          komplexHBUppg(4, 1, 5, 'brak-div-hb:rakna'),
          komplexHBUppg(7, 1, 6, 'brak-div-hb:rakna'),
          komplexHBUppg(2, 3, 4, 'brak-div-hb:rakna'),
          komplexHBUppg(12, 4, 7, 'brak-div-hb:rakna') ] },

      // G7 — bråk ÷ bråk via FÖRLÄNGNING. Mellanled = produktbråk (värde-rättat), svar enklaste form.
      { rubrik: 'Beräkna – visa mellanled med förlängning, svara i enklaste form', logg: 'brak-div-bb:rakna', uppgifter: [
          divbrakUppg([4, 5], [2, 3], 'brak-div-bb:rakna'),
          divbrakUppg([3, 7], [5, 8], 'brak-div-bb:rakna') ] },

      // G8 — bråk ÷ bråk via INVERTERING. Samma cellstruktur (produkten är lika oavsett metod); rubriken skiljer.
      { rubrik: 'Beräkna – visa mellanled med invertering, svara i enklaste form', logg: 'brak-div-inv:rakna', uppgifter: [
          divbrakUppg([6, 7], [3, 11], 'brak-div-inv:rakna'),
          divbrakUppg([7, 9], [8, 10], 'brak-div-inv:rakna') ] },

      // G9 — invertering + förenkla innan multiplikation. FRI equality-kedja.
      { rubrik: 'Beräkna – visa mellanled med invertering, förenkla innan multiplikation', logg: 'brak-div-inv:rakna', uppgifter: [
          kedjaUppg(BR(BR(5, 8), BR(25, 32)), 4 / 5, { k: 'br', t: 4, n: 5 }, 'brak-div-inv:rakna'),
          kedjaUppg(BR(BLAND(3, 3, 7), BLAND(2, 1, 4)), 32 / 21, { k: 'mi', h: 1, t: 11, n: 21 }, 'brak-div-inv:rakna'),
          kedjaUppg(BR(BLAND(2, 7, 12), BLAND(6, 1, 5)), 5 / 12, { k: 'br', t: 5, n: 12 }, 'brak-div-inv:rakna') ] },

      // G10 — tre områden i ett uttryck (bråkräkning + negativa tal + prioriteringsregeln). OLOGGAD.
      { rubrik: 'Beräkna – visa mellanled, svara i enklaste form', logg: null, uppgifter: [
          kedjaUppg(BR(2, 3) + ' + ' + BR(1, 2) + ' · (' + BR(5, 12) + ' + (−' + BR(3, 12) + '))',
            3 / 4, { k: 'br', t: 3, n: 4 }, null, LOGG_SKAL_G10),
          kedjaUppg(BR('(−' + BR(4, 7) + ' + ' + BR(3, 14) + ')', '(' + BR(12, -5) + ' + (−' + BR(4, 15) + '))'),
            15 / 112, { k: 'br', t: 15, n: 112 }, null, LOGG_SKAL_G10) ] }
    ] }
  };

  // ── GENERERING — variant 0 = orig (dok 1). FAS 4 lägger till sample/villkor + facit-distinkthet. ──
  function bygg(u, t){ return { prompt: u.prompt ? u.prompt(t) : null, mellan: u.mellan ? u.mellan(t) : null,
    facit: u.facit(t), logg: u.logg || null, loggStore: u.loggStore || 'k2', loggSkal: u.loggSkal || null, tal: t }; }
  function genUppgift(u, dokId, idx, variant){
    if(variant === 0 || u.fixed || !u.sample) return bygg(u, u.orig);   // FAS 3: alltid orig
    // FAS 4: sample-loopen (villkor + facit-distinkthet) monteras här.
    return bygg(u, u.orig);
  }
  function genereraDokument(dokId, variant){
    var mall = MALLAR[dokId]; if(!mall) return null;
    var idx = 0;
    return { dokId: dokId, variant: variant, titel: mall.titel, grupper: mall.grupper.map(function(g){
      return { rubrik: g.rubrik, logg: g.logg || null, uppgifter: g.uppgifter.map(function(u){ return genUppgift(u, dokId, idx++, variant); }) };
    }) };
  }

  var API = { MALLAR: MALLAR, genereraDokument: genereraDokument, genUppgift: genUppgift,
    _intern: { mkRng: mkRng, seedOf: seedOf, k: k, gcd: gcd, lcm: lcm, BR: BR, BLAND: BLAND, brakForm: brakForm, rund: rund } };
  if(typeof window !== 'undefined') window.AK9_K2_AKR9_OVA = API;
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
