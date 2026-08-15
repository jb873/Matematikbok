/* ak9-k1-ova-variant.js — VARIANTMOTOR för nians dk1 tre öva-dokument (Öva 1/2/3).
   Modellen: Dokument 1 = Joachims EXAKTA original (variantIndex 0). Dokument 2–4 = variant-kopior
   (variantIndex 1–3): samma uppgiftsordning, samma typer, samma svårighet — bara talen byts, inom
   varje uppgifts VILLKOR (FAS 1-tabellen). Nivå-parametern används INTE.

   Per uppgift: sample(rng)→tal · villkor(tal)→bool · facit(tal)→sant värde · prompt/mellan(tal)→text.
   Mellanled-metoderna hålls isär: division = skala BÅDA leden; multiplikation = kompensation. Öva 3 =
   prioritering med bråkstreck som grupperingssymbol (konverteras aldrig till/från parenteser).

   Determinism: variant N av en uppgift seedas av (dokId, uppgiftsindex, N) → samma tal varje gång
   (stabilt för en elev som varvar runt). Elev-lokalt/GDPR-neutralt; ingen nätväg, ingen taxonomi. */
(function(){
  'use strict';

  // ── RNG (mulberry32, seedbar → determinism) ──
  function mkRng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }
  function rp(rng, arr){ return arr[Math.floor(rng() * arr.length)]; }
  function seedOf(dok, idx, variant){ var s = 2166136261; var str = dok + ':' + idx + ':' + variant;
    for(var i = 0; i < str.length; i++){ s ^= str.charCodeAt(i); s = Math.imul(s, 16777619); } return s >>> 0; }

  // ── Talformat: rensa flyttalsbrus, svensk decimal, minustecken U+2212 ──
  function rund(x){ return Math.round(x * 1e9) / 1e9; }
  function k(x){ var r = rund(x); var s = ('' + r).replace('.', ',').replace('-', '−'); return s; }
  function decimaler(x){ var s = ('' + rund(Math.abs(x))); var i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }

  var TIOPOT = [1000, 100, 10, 0.1, 0.01, 0.001];   // multiplikatorer/divisorer (ej 1)

  // ══════════════════════════════════════════════════════════════════════════════════════
  //  TYP-FABRIKER (delade uppgiftsmönster) — var och en ger {orig, sample, villkor, facit, prompt, mellan}
  // ══════════════════════════════════════════════════════════════════════════════════════

  // Öva 1: tiopotens FAST, operand FRI med samma antal decimaler (svårighet oförändrad).
  //  opFirst=true → operanden skrivs FÖRE tiopotensen (som i Joachims doc rad "602,04 · 1000").
  function tpMult(tp, dec, loInt, hiInt, orig, opFirst){
    return { orig: Object.assign({ tp: tp }, orig),
      sample: function(rng){ var m = ri(rng, loInt, hiInt) / Math.pow(10, dec); return { tp: tp, op: rund(m) }; },
      villkor: function(t){ return decimaler(t.op) === dec; },
      facit: function(t){ return rund(t.op * t.tp); },
      prompt: function(t){ return opFirst ? (k(t.op) + ' · ' + k(t.tp)) : (k(t.tp) + ' · ' + k(t.op)); },
      mellan: function(){ return null; } };
  }
  function tpDiv(tp, dec, loInt, hiInt, orig){
    return { orig: Object.assign({ tp: tp }, orig),
      sample: function(rng){ var m = ri(rng, loInt, hiInt) / Math.pow(10, dec); return { tp: tp, tal: rund(m) }; },
      villkor: function(t){ return decimaler(t.tal) === dec; },
      facit: function(t){ return rund(t.tal / t.tp); },
      prompt: function(t){ return 'BRAK(' + k(t.tal) + ')(' + k(t.tp) + ')'; },   // BRAK() → stående bråk vid rendering
      mellan: function(){ return null; } };
  }

  // Öva 1: "vilket tal ska stå i rutan". ▢ = REN TIOPOTENS (villkoret på relationen). Rutans position fast.
  // form 'faktor-vanster': ▢ · a = a·▢ ;  'faktor-hoger': a · ▢ = ...  (ruta som faktor)
  // form 'namnare': a/▢ = a/tp  (ruta i nämnaren)
  function rutaFaktor(boxFirst, dec, loInt, hiInt, orig){
    return { orig: orig,
      sample: function(rng){ var a = rund(ri(rng, loInt, hiInt) / Math.pow(10, dec)); var box = rp(rng, TIOPOT); return { a: a, box: box }; },
      villkor: function(t){ return decimaler(t.a) === dec && TIOPOT.indexOf(t.box) >= 0; },
      facit: function(t){ return t.box; },                                  // sökt tal = rutan (tiopotensen)
      prompt: function(t){ var rhs = k(rund(t.a * t.box));
        return boxFirst ? ('▢ · ' + k(t.a) + ' = ' + rhs) : (k(t.a) + ' · ▢ = ' + rhs); },
      mellan: function(){ return null; } };
  }
  function rutaNamnare(dec, loInt, hiInt, orig){
    return { orig: orig,
      sample: function(rng){ var a = rund(ri(rng, loInt, hiInt) / Math.pow(10, dec)); var box = rp(rng, TIOPOT); return { a: a, box: box }; },
      villkor: function(t){ return decimaler(t.a) === dec && TIOPOT.indexOf(t.box) >= 0; },
      facit: function(t){ return t.box; },
      prompt: function(t){ var rhs = k(rund(t.a / t.box)); return 'BRAK(' + k(t.a) + ')(▢) = ' + rhs; },
      mellan: function(){ return null; } };
  }
  // Öva 1 grupp 5: identitet där ▢ balanserar tiopotens-operationerna på SAMMA operand a.
  //  A: a/tp = a·▢   → ▢ = 1/tp ;  B: tp·a = a/▢  → ▢ = 1/tp ;  C: a/▢ = a·tp → ▢ = 1/tp ; D: a·▢ = a/tp → ▢ = 1/tp
  function rutaRelation(form, dec, loInt, hiInt, orig){
    return { orig: orig,
      sample: function(rng){ var a = rund(ri(rng, loInt, hiInt) / Math.pow(10, dec)); var tp = rp(rng, TIOPOT); return { a: a, tp: tp }; },
      villkor: function(t){ return decimaler(t.a) === dec && TIOPOT.indexOf(t.tp) >= 0; },
      facit: function(t){ return rund(1 / t.tp); },                          // ▢ = reciprok tiopotens
      prompt: function(t){ var a = k(t.a), tp = k(t.tp);
        if(form === 'A') return 'BRAK(' + a + ')(' + tp + ') = ' + a + ' · ▢';
        if(form === 'B') return tp + ' · ' + a + ' = BRAK(' + a + ')(▢)';
        if(form === 'C') return 'BRAK(' + a + ')(▢) = ' + a + ' · ' + tp;
        return a + ' · ▢ = BRAK(' + a + ')(' + tp + ')'; },                  // D
      mellan: function(){ return null; } };
  }

  // Öva 2 grupp 1/3: ren decimal-multiplikation (endast svar). Decimalstruktur per faktor bevaras.
  function multDec(decA, loA, hiA, decB, loB, hiB, orig){
    return { orig: orig,
      sample: function(rng){ return { a: rund(ri(rng, loA, hiA) / Math.pow(10, decA)), b: rund(ri(rng, loB, hiB) / Math.pow(10, decB)) }; },
      villkor: function(t){ return decimaler(t.a) === decA && decimaler(t.b) === decB; },
      facit: function(t){ return rund(t.a * t.b); },
      prompt: function(t){ return k(t.a) + ' · ' + k(t.b); },
      mellan: function(){ return null; } };
  }

  // Öva 2 grupp 2/4: division med mellanled = SKALA BÅDA LEDEN (×samma faktor → nämnaren blir helt tal).
  //  Skalfaktorn ges av divisorns decimaler. Villkor: skalad division går JÄMNT UT (avslutande decimal).
  function divSkala(divisorSet, dec, loInt, hiInt, orig){
    return { orig: orig,
      sample: function(rng){ var d = rp(rng, divisorSet); var t = rund(ri(rng, loInt, hiInt) / Math.pow(10, dec)); return { tal: t, d: d }; },
      villkor: function(t){
        if(decimaler(t.tal) !== dec) return false;
        var dd = decimaler(t.d), f = Math.pow(10, dd);                        // skalfaktor gör divisorn till heltal
        var dSk = Math.round(t.d * f), tSk = rund(t.tal * f);                 // skalade led
        if(dSk === 0) return false;
        var kv = tSk / dSk;                                                    // avslutande decimal? (jämnt ut)
        return decimaler(kv) <= 6 && Math.abs(kv * dSk - tSk) < 1e-9 && rund(kv) === rund(kv);
      },
      facit: function(t){ return rund(t.tal / t.d); },
      prompt: function(t){ return 'BRAK(' + k(t.tal) + ')(' + k(t.d) + ')'; },
      mellan: function(t){ var f = Math.pow(10, decimaler(t.d)); var dSk = Math.round(t.d * f), tSk = rund(t.tal * f);
        return 'BRAK(' + k(t.tal) + ' · ' + f + ')(' + k(t.d) + ' · ' + f + ') = BRAK(' + k(tSk) + ')(' + dSk + ')'; } };
  }

  // Öva 2 grupp 5 a,b: stor heltalsmultiplikation (endast svar).
  function multStor(loA, hiA, stegA, loB, hiB, stegB, orig){
    return { orig: orig,
      sample: function(rng){ return { a: ri(rng, loA, hiA) * stegA, b: ri(rng, loB, hiB) * stegB }; },
      villkor: function(t){ return Number.isInteger(t.a) && Number.isInteger(t.b) && t.a > 0 && t.b > 0; },
      facit: function(t){ return t.a * t.b; },
      prompt: function(t){ return k(t.a) + ' · ' + k(t.b); },
      mellan: function(){ return null; } };
  }
  // Öva 2 grupp 5 c,d: multiplikation med KOMPENSATION (÷10^p på a, ×10^p på b → båda HELA TAL).
  function multKomp(heltalLo, heltalHi, decB, orig){
    return { orig: orig,
      sample: function(rng){
        var p = decB;                                                          // kompensations-exponent = b:s decimaler
        var aBas = ri(rng, heltalLo, heltalHi);                                // → a = aBas·10^p (delbart), b = bBas·10^-p
        var a = aBas * Math.pow(10, p);
        var bBas = ri(rng, 1, 9);                                              // b = bBas·10^-p (t.ex. 0,4 ; 0,03)
        var b = rund(bBas / Math.pow(10, p));
        return { a: a, b: b, p: p, aKomp: aBas, bKomp: bBas };
      },
      villkor: function(t){ return Number.isInteger(t.a) && Number.isInteger(t.aKomp) && Number.isInteger(t.bKomp) && decimaler(t.b) === t.p; },
      facit: function(t){ return rund(t.a * t.b); },
      prompt: function(t){ return k(t.a) + ' · ' + k(t.b); },
      mellan: function(t){ return k(t.aKomp) + ' · ' + t.bKomp; } };
  }

  // ── Öva 3: prioritering. Varje uppgift = fast struktur, fria tal, VILLKOR: positivt heltalssvar
  //    (alla del- och slutresultat ≥ 0). Bråkstreck = gruppering (BRAK(täljare)(nämnare)). ──
  //  Byggs som en lista av {sample, villkor(→ värden + heltal/positivt), facit, prompt, mellan}.
  //  Hjälp: heltal-krav kollas i villkor; facit = sant värde.

  function P(spec){ return spec; }   // identitets-wrapper för läsbarhet

  // ══════════════════════════════════════════════════════════════════════════════════════
  //  MALLAR — låst uppgiftsordning + grupper/rubriker. orig = Joachims exakta tal (Dokument 1).
  // ══════════════════════════════════════════════════════════════════════════════════════
  var MALLAR = {
    ova1: { titel: 'Beräkna med tiopotenser', grupper: [
      { rubrik: 'Beräkna med 10, 100, 1000 och 0,1, 0,01 och 0,001 (Endast svar)', uppgifter: [
        tpMult(100, 1, 11, 98, {op:5.3}), tpMult(0.1, 0, 101, 989, {op:563}),
        tpMult(10, 2, 1011, 9899, {op:47.78}), tpMult(0.01, 1, 111, 989, {op:76.9}) ] },
      { rubrik: 'Beräkna med 10, 100, 1000 och 0,1, 0,01 och 0,001 (Endast svar)', uppgifter: [
        tpDiv(10, 1, 11, 98, {tal:5.4}), tpDiv(0.1, 1, 111, 989, {tal:32.5}),
        tpDiv(0.01, 1, 11, 98, {tal:2.8}), tpDiv(100, 1, 1011, 9899, {tal:507.4}) ] },
      { rubrik: 'Beräkna med 10, 100, 1000 och 0,1, 0,01 och 0,001 (Endast svar)', uppgifter: [
        tpMult(1000, 2, 10011, 98999, {op:602.04}, true), tpDiv(0.001, 0, 11, 98, {tal:66}),
        tpMult(0.001, 1, 111, 989, {op:89.9}, true), tpDiv(0.001, 2, 111, 989, {tal:7.89}) ] },
      { rubrik: 'Vilket tal ska stå i rutan', uppgifter: [
        rutaFaktor(false, 0, 11, 98, {a:75, box:0.1}), rutaNamnare(0, 2, 9, {a:3, box:100}),
        rutaFaktor(true, 2, 111, 989, {a:5.03, box:100}), rutaNamnare(1, 11, 98, {a:5.3, box:0.1}) ] },
      { rubrik: 'Vilket tal ska stå i rutan', uppgifter: [
        rutaRelation('A', 0, 11, 98, {a:20, tp:0.1}), rutaRelation('B', 0, 2, 9, {a:7, tp:100}),
        rutaRelation('C', 1, 11, 98, {a:4.5, tp:0.1}), rutaRelation('D', 2, 11, 98, {a:0.25, tp:0.01}) ] }
    ] },
    ova2: { titel: 'Multiplikation och division med decimaltal', grupper: [
      { rubrik: 'Beräkna', uppgifter: [
        multDec(1, 1, 9, 0, 2, 9, {a:0.6, b:7}), multDec(1, 1, 9, 1, 1, 9, {a:0.4, b:0.9}),
        multDec(0, 11, 99, 1, 1, 9, {a:11, b:0.4}), multDec(1, 1, 9, 1, 1, 9, {a:0.8, b:0.9}) ] },
      { rubrik: 'Beräkna – visa ett mellanled', uppgifter: [
        divSkala([0.01], 0, 11, 98, {tal:23, d:0.01}), divSkala([0.2], 0, 11, 98, {tal:13, d:0.2}),
        divSkala([0.5], 0, 11, 98, {tal:53, d:0.5}) ] },
      { rubrik: 'Beräkna', uppgifter: [
        multDec(1, 1, 9, 1, 1, 9, {a:0.6, b:0.3}), multDec(1, 1, 9, 2, 1, 9, {a:0.8, b:0.02}),
        multDec(2, 1, 9, 2, 1, 9, {a:0.01, b:0.06}) ] },
      { rubrik: 'Beräkna – visa mellanled', uppgifter: [
        divSkala([0.03], 0, 11, 98, {tal:78, d:0.03}), divSkala([0.04], 1, 111, 989, {tal:34.8, d:0.04}),
        divSkala([0.6], 2, 1011, 9899, {tal:78.42, d:0.6}) ] },
      { rubrik: 'Beräkna – visa mellanled på c och d', uppgifter: [
        multStor(1, 9, 10000, 1, 9, 1000, {a:50000, b:2000}), multStor(11, 49, 10000, 1, 9, 10000, {a:220000, b:30000}),
        multKomp(1, 9, 1, {a:7000, b:0.4, p:1, aKomp:700, bKomp:4}), multKomp(1, 9, 2, {a:33000, b:0.03, p:2, aKomp:330, bKomp:3}) ] }
    ] },
    ova3: { titel: 'Prioriteringsregeln', grupper: [
      { rubrik: 'Beräkna – visa mellanled', uppgifter: [
        // a − b·c
        P({ orig:{a:29,b:9,c:3}, sample:function(r){return{a:ri(r,15,40),b:ri(r,3,9),c:ri(r,2,6)};},
          villkor:function(t){return t.a-t.b*t.c>=0;}, facit:function(t){return t.a-t.b*t.c;},
          prompt:function(t){return t.a+' − '+t.b+' · '+t.c;}, mellan:function(t){return t.a+' − '+(t.b*t.c);} }),
        // a + b·c − d
        P({ orig:{a:16,b:4,c:10,d:7}, sample:function(r){return{a:ri(r,10,25),b:ri(r,2,7),c:ri(r,3,12),d:ri(r,2,9)};},
          villkor:function(t){return t.a+t.b*t.c-t.d>=0;}, facit:function(t){return t.a+t.b*t.c-t.d;},
          prompt:function(t){return t.a+' + '+t.b+' · '+t.c+' − '+t.d;}, mellan:function(t){return t.a+' + '+(t.b*t.c)+' − '+t.d;} }),
        // (a−b)·c + d
        P({ orig:{a:43,b:3,c:8,d:5}, sample:function(r){return{a:ri(r,20,50),b:ri(r,2,15),c:ri(r,3,9),d:ri(r,2,9)};},
          villkor:function(t){return t.a-t.b>=0;}, facit:function(t){return (t.a-t.b)*t.c+t.d;},
          prompt:function(t){return '('+t.a+' − '+t.b+') · '+t.c+' + '+t.d;}, mellan:function(t){return (t.a-t.b)+' · '+t.c+' + '+t.d;} }),
        // a + b·(c−d)
        P({ orig:{a:12,b:2,c:8,d:5}, sample:function(r){return{a:ri(r,5,20),b:ri(r,2,6),c:ri(r,4,12),d:ri(r,1,8)};},
          villkor:function(t){return t.c-t.d>=0;}, facit:function(t){return t.a+t.b*(t.c-t.d);},
          prompt:function(t){return t.a+' + '+t.b+' · ('+t.c+' − '+t.d+')';}, mellan:function(t){return t.a+' + '+t.b+' · '+(t.c-t.d);} })
      ] },
      { rubrik: 'Beräkna – visa mellanled', uppgifter: [
        // a·b·c − d
        P({ orig:{a:2,b:3,c:6,d:5}, sample:function(r){return{a:ri(r,2,5),b:ri(r,2,6),c:ri(r,2,7),d:ri(r,2,9)};},
          villkor:function(t){return t.a*t.b*t.c-t.d>=0;}, facit:function(t){return t.a*t.b*t.c-t.d;},
          prompt:function(t){return t.a+' · '+t.b+' · '+t.c+' − '+t.d;}, mellan:function(t){return (t.a*t.b*t.c)+' − '+t.d;} }),
        // a·(b·c − d)
        P({ orig:{a:2,b:3,c:6,d:5}, sample:function(r){return{a:ri(r,2,5),b:ri(r,2,6),c:ri(r,2,7),d:ri(r,1,9)};},
          villkor:function(t){return t.b*t.c-t.d>=0;}, facit:function(t){return t.a*(t.b*t.c-t.d);},
          prompt:function(t){return t.a+' · ('+t.b+' · '+t.c+' − '+t.d+')';}, mellan:function(t){return t.a+' · '+(t.b*t.c-t.d);} }),
        // (a+b)·(c−d)
        P({ orig:{a:12,b:2,c:9,d:3}, sample:function(r){return{a:ri(r,5,15),b:ri(r,1,9),c:ri(r,4,12),d:ri(r,1,8)};},
          villkor:function(t){return t.c-t.d>=0;}, facit:function(t){return (t.a+t.b)*(t.c-t.d);},
          prompt:function(t){return '('+t.a+' + '+t.b+') · ('+t.c+' − '+t.d+')';}, mellan:function(t){return (t.a+t.b)+' · '+(t.c-t.d);} }),
        // a·(b − c·d) + e
        P({ orig:{a:19,b:7,c:2,d:3,e:18}, sample:function(r){return{a:ri(r,10,25),b:ri(r,5,12),c:ri(r,2,4),d:ri(r,2,4),e:ri(r,5,25)};},
          villkor:function(t){return t.b-t.c*t.d>=0;}, facit:function(t){return t.a*(t.b-t.c*t.d)+t.e;},
          prompt:function(t){return t.a+' · ('+t.b+' − '+t.c+' · '+t.d+') + '+t.e;}, mellan:function(t){return t.a+' · '+(t.b-t.c*t.d)+' + '+t.e;} })
      ] },
      { rubrik: 'Beräkna – visa mellanled', uppgifter: [
        // (a·b − c)/d   — bråkstreck grupperar
        P({ orig:{a:3,b:7,c:6,d:5}, sample:function(r){return{a:ri(r,2,9),b:ri(r,2,9),c:ri(r,1,20),d:ri(r,2,9)};},
          villkor:function(t){var n=t.a*t.b-t.c;return n>=0 && n%t.d===0;}, facit:function(t){return (t.a*t.b-t.c)/t.d;},
          prompt:function(t){return 'BRAK('+t.a+' · '+t.b+' − '+t.c+')('+t.d+')';}, mellan:function(t){return 'BRAK('+(t.a*t.b-t.c)+')('+t.d+')';} }),
        // (a+b)/(c+d)
        P({ orig:{a:22,b:13,c:2,d:3}, sample:function(r){return{a:ri(r,5,30),b:ri(r,5,30),c:ri(r,1,6),d:ri(r,1,6)};},
          villkor:function(t){var n=t.a+t.b,m=t.c+t.d;return m>0 && n%m===0;}, facit:function(t){return (t.a+t.b)/(t.c+t.d);},
          prompt:function(t){return 'BRAK('+t.a+' + '+t.b+')('+t.c+' + '+t.d+')';}, mellan:function(t){return 'BRAK('+(t.a+t.b)+')('+(t.c+t.d)+')';} }),
        // (a·b·c)/(d·e)
        P({ orig:{a:3,b:4,c:5,d:2,e:6}, sample:function(r){return{a:ri(r,2,6),b:ri(r,2,6),c:ri(r,2,6),d:ri(r,2,6),e:ri(r,2,6)};},
          villkor:function(t){var n=t.a*t.b*t.c,m=t.d*t.e;return m>0 && n%m===0;}, facit:function(t){return (t.a*t.b*t.c)/(t.d*t.e);},
          prompt:function(t){return 'BRAK('+t.a+' · '+t.b+' · '+t.c+')('+t.d+' · '+t.e+')';}, mellan:function(t){return 'BRAK('+(t.a*t.b*t.c)+')('+(t.d*t.e)+')';} }),
        // a/b + c/d  (två bråk, varje term heltal)
        P({ orig:{b:4,q1:4,d:6,q2:2}, sample:function(r){return{b:ri(r,2,9),q1:ri(r,2,9),d:ri(r,2,9),q2:ri(r,2,9)};},
          villkor:function(t){return t.b>0 && t.d>0;}, facit:function(t){return t.q1+t.q2;},
          prompt:function(t){return 'BRAK('+(t.b*t.q1)+')('+t.b+') + BRAK('+(t.d*t.q2)+')('+t.d+')';}, mellan:function(t){return t.q1+' + '+t.q2;} }),
        // (a−b)/c + d
        P({ orig:{c:3,q:2,b:2,d:2}, sample:function(r){return{c:ri(r,2,9),q:ri(r,1,8),b:ri(r,1,20),d:ri(r,1,9)};},
          villkor:function(t){return true;}, facit:function(t){return t.q+t.d;},
          prompt:function(t){var a=t.c*t.q+t.b;return 'BRAK('+a+' − '+t.b+')('+t.c+') + '+t.d;}, mellan:function(t){return t.q+' + '+t.d;} }),
        // a·b + c/(d·e)
        P({ orig:{a:2,b:4,d:3,e:5,q:3}, sample:function(r){return{a:ri(r,2,9),b:ri(r,2,9),d:ri(r,2,6),e:ri(r,2,6),q:ri(r,2,9)};},
          villkor:function(t){return true;}, facit:function(t){return t.a*t.b+t.q;},
          prompt:function(t){var c=t.d*t.e*t.q;return t.a+' · '+t.b+' + BRAK('+c+')('+t.d+' · '+t.e+')';}, mellan:function(t){return (t.a*t.b)+' + '+t.q;} })
      ] }
    ] }
  };

  // ── GENERERING: en uppgift → {prompt, mellan, facit}. variantIndex 0 = orig; ≥1 = sampla tills villkor håller. ──
  function genUppgift(u, dokId, idx, variant){
    if(variant === 0 && u.orig){ var t0 = u.orig; return { prompt: u.prompt(t0), mellan: u.mellan(t0), facit: u.facit(t0), tal: t0, _kastade: 0 }; }
    var rng = mkRng(seedOf(dokId, idx, variant) ^ 0x9E3779B9), kastade = 0, t;
    for(var i = 0; i < 400; i++){ t = u.sample(rng); if(u.villkor(t)){ break; } kastade++; t = null; }
    if(!t){ t = u.orig; }   // fallback: originalet (ska nästan aldrig hända)
    return { prompt: u.prompt(t), mellan: u.mellan(t), facit: u.facit(t), tal: t, _kastade: kastade };
  }

  function genereraDokument(dokId, variant){
    var mall = MALLAR[dokId]; if(!mall) return null;
    var idx = 0;
    return { dokId: dokId, variant: variant, titel: mall.titel, grupper: mall.grupper.map(function(g){
      return { rubrik: g.rubrik, uppgifter: g.uppgifter.map(function(u){ return genUppgift(u, dokId, idx++, variant); }) };
    }) };
  }

  var API = { MALLAR: MALLAR, genereraDokument: genereraDokument, genUppgift: genUppgift, _intern: { mkRng: mkRng, seedOf: seedOf, k: k, decimaler: decimaler } };
  if(typeof window !== 'undefined') window.AK9_OVA = API;
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
