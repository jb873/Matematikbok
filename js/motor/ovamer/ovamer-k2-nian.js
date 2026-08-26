/* ovamer-k2-nian.js — NIANS Åk9-spårets dk2-drillar (band-drivna, EJ level-mönstret).
   Två generatorer födda i den nya modellen: svårigheten bor i DATA (spec-villkor-k2.js spar.nian),
   inte i kod. Fuzzen kan påstå att bandet hålls (spec-fuzz-nian.js). De gamla level-drillarna
   (ovamer-k2-*.js, genX(level)) ligger kvar tills de konverteras medvetet — de rörs INTE här.

     • narmevardeOrdnaEngine → brak-jmf-narmevarde:resonera  (storleksordna med närmevärde)
     • mgnEngine             → brak-mgn:rakna                (minsta gemensamma nämnare, två celler)

   Interaktion återanvänder de DELADE korOvningOrdna/korOvning (bekräftelsesteg + k2Logga inbyggt).
   Talgenereringen läser bandet ur spec-villkor-k2.js spar.nian. Node + browser; ingen nätväg. */
(function(){
  'use strict';

  var SPEC_NODE = (typeof module !== 'undefined' && module.exports) ? require('../../data/spec-villkor-k2.js') : null;
  function spec(){ return SPEC_NODE || (typeof window !== 'undefined' ? window.SPEC_VILLKOR_K2 : null); }   // lat: oberoende av laddordning
  function bandTak(nod){ var s = spec(), b = s && s.band && s.band(nod, 'nian'); return (b && b.tak) || {}; }
  function bandKravs(nod){ var s = spec(), b = s && s.band && s.band(nod, 'nian'); return (b && b.kravs) || {}; }

  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function lcm(a, b){ return Math.abs(a) / gcd(a, b) * Math.abs(b); }
  function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }
  function rp(rng, arr){ return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(arr, rng){ for(var i = arr.length - 1; i > 0; i--){ var j = Math.floor(rng() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function properReducerad(t, n){ return t >= 1 && t < n && n >= 2 && gcd(t, n) === 1; }

  // ── genMgn: två äkta reducerade bråk vars nämnare delar en gemensam faktor (minsta gem. nämnare < produkt),
  //   inom bandet (maxNamnare, maxTaljare, minsta gem. nämnare ≤ maxResultNamnare). → { a:[t,n], b:[t,n], L } ──
  function genMgn(rng){
    var T = bandTak('brak-mgn:rakna');
    var maxN = T.maxNamnare || 64, maxT = T.maxTaljare || 63, maxL = T.maxResultNamnare || 192;
    for(var i = 0; i < 400; i++){
      var na = ri(rng, 4, maxN), nb = ri(rng, 4, maxN);
      if(na === nb || gcd(na, nb) === 1) continue;               // olika nämnare, gemensam faktor
      if(na % nb === 0 || nb % na === 0) continue;               // ingen nämnare delar den andra → BÅDA måste förlängas (som orig)
      var ta = ri(rng, 1, Math.min(maxT, na - 1)), tb = ri(rng, 1, Math.min(maxT, nb - 1));
      if(!properReducerad(ta, na) || !properReducerad(tb, nb)) continue;
      var L = lcm(na, nb);
      if(L <= maxL) return { a: [ta, na], b: [tb, nb], L: L };
    }
    return { a: [11, 18], b: [7, 24], L: 72 };                    // fallback = orig
  }

  // ── genNarmevardeOrdna: fem parvis olika bråk, jämnt spridda över ett värdefönster (bredd fonsterMin..fonster)
  //   med min-gap, så avrundning skiljer dem (klustrat = svårare än orig). → { lista:[[t,n]..], ordning:[idx..] } ──
  function genNarmevardeOrdna(rng){
    var T = bandTak('brak-jmf-narmevarde:resonera'), K = bandKravs('brak-jmf-narmevarde:resonera');
    var antal = T.antal || 5, maxN = T.maxNamnare || 120;
    var fonster = K.fonster || 0.12, fonsterMin = K.fonsterMin || 0.075, minGap = K.minGap || 0.010;
    var dens = [7, 8, 9, 11, 12, 13, 14, 16, 17, 19, 23, 24, 29, 31, 37, 41, 53, 111].filter(function(d){ return d <= maxN; });
    for(var attempt = 0; attempt < 60; attempt++){
      var width = fonsterMin + rng() * (fonster - fonsterMin), lo = 0.15 + rng() * (0.60 - width);
      var out = [], seenN = {}, vals = [], ok = true;
      for(var i = 0; i < antal; i++){
        var target = lo + (i / (antal - 1)) * width, best = null, bestErr = 1;
        for(var tr = 0; tr < 50; tr++){
          var n = rp(rng, dens); if(seenN[n]) continue;
          var t = Math.round(target * n); if(t < 1) t = 1; if(t > n - 1) t = n - 1;
          if(gcd(t, n) !== 1) continue;   // reducerade bråk (rent talurval; band tillåter äkta, men drillen håller det städat)
          var v0 = t / n, e = Math.abs(v0 - target);
          if(e < bestErr && vals.every(function(x){ return Math.abs(x - v0) > minGap; })){ best = [t, n]; bestErr = e; }
        }
        if(!best){ ok = false; break; }
        seenN[best[1]] = 1; vals.push(best[0] / best[1]); out.push(best);
      }
      if(ok && out.length === antal){
        // Självkontroll mot bandet: bråken landar NÄRA målen, så faktisk spann kan drifta ut ur [min,max].
        var sv = out.map(function(f){ return f[0] / f[1]; }).sort(function(x, y){ return x - y; });
        var spann = sv[antal - 1] - sv[0], gapsOk = true;
        for(var q = 1; q < antal; q++){ if(sv[q] - sv[q - 1] < minGap) gapsOk = false; }
        if(spann >= fonsterMin && spann <= fonster && gapsOk){
          shuffle(out, rng);   // annars renderas korten i värdeordning → trivialt (klicka vänster→höger)
          var ordning = out.map(function(f, ix){ return { ix: ix, v: f[0] / f[1] }; })
            .sort(function(a, b){ return a.v - b.v; }).map(function(x){ return x.ix; });
          return { lista: out, ordning: ordning };
        }
      }
    }
    return { lista: [[3, 11], [2, 9], [4, 12], [9, 31], [32, 111]], ordning: [1, 0, 4, 3, 2] };   // fallback = orig
  }

  // Exponera talgeneratorerna på window så ramens provbyggar-testgeneratorer (K2_TEST_GENERATORS) kan
  // återanvända dem — testet koncept-testar samma tal, i provbyggarens format (numeriskt / flerval).
  if(typeof window !== 'undefined'){ window.genMgn = genMgn; window.genNarmevardeOrdna = genNarmevardeOrdna; }

  // ── ENGINES (browser: kräver de delade korOvning*-looparna + frac/fracBoxes/valFor ur ramen) ──
  if(typeof window !== 'undefined' && typeof window.korOvningOrdna === 'function'){
    window.narmevardeOrdnaEngine = function(){
      window.korOvningOrdna({
        titel: 'Storleksordna med närmevärde',
        sub: 'Avrunda till närmevärde – klicka bråken i storleksordning, minst först.',
        back: window.renderOversikt,
        gen: function(){ var u = genNarmevardeOrdna(Math.random);
          return { kort: u.lista.map(function(f){ return { html: window.frac(f[0], f[1]), t: f[0], n: f[1] }; }), ordning: u.ordning }; }
      });
    };
  }
  if(typeof window !== 'undefined' && typeof window.korOvning === 'function'){
    window.mgnEngine = function(){
      window.korOvning({
        titel: 'Minsta gemensamma nämnare',
        sub: 'Skriv båda bråken med deras MINSTA gemensamma nämnare.',
        back: window.renderOversikt,
        gen: function(){
          var u = genMgn(Math.random), L = u.L;
          function cellOk(pre, fr){ var t = parseInt(window.valFor(pre + '-t'), 10), n = parseInt(window.valFor(pre + '-n'), 10);
            return isFinite(t) && isFinite(n) && n === L && t === fr[0] * L / fr[1]; }   // exakt över MINSTA L
          return {
            fragaHtml: window.frac(u.a[0], u.a[1]) + '<span style="margin:0 6px;">=</span>' + window.fracBoxes('mga-t', 'mga-n')
              + '<span style="margin:0 14px;">och</span>' + window.frac(u.b[0], u.b[1]) + '<span style="margin:0 6px;">=</span>' + window.fracBoxes('mgb-t', 'mgb-n'),
            facitText: (u.a[0] * L / u.a[1]) + '/' + L + ' och ' + (u.b[0] * L / u.b[1]) + '/' + L,
            faltRatt: function(f){ return (f.classList.contains('mga-t') || f.classList.contains('mga-n')) ? cellOk('mga', u.a) : cellOk('mgb', u.b); },
            check: function(){ return cellOk('mga', u.a) && cellOk('mgb', u.b); }
          };
        }
      });
    };
  }

  if(typeof module !== 'undefined' && module.exports){
    module.exports = { genMgn: genMgn, genNarmevardeOrdna: genNarmevardeOrdna, _gcd: gcd, _lcm: lcm };
  }
})();
