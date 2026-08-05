/* ============================================================
   ovamer-k2-luckor.js — Färdighetsträning-drillar för de tre bråk-LUCKORNA
   (åk8:mål-noder som var provbara men saknade nöt-drill). NY fil — rör inte
   ovamer-k2.js/korOvning eller något befintligt mellanled. Laddas i
   ak7-k2-ram.html EFTER ovamer-k2.js och registreras i K2_DRILL.

   Tre färdigheter, övningsbara separat (loggar till var sin nod via korOvning):
     • lanaEngine          — låna i blandad form (subtraktion)     → brak-lana
     • multForkortaEngine  — förkorta innan multiplikation         → brak-mult-forkorta
     • reciprokEngine      — skriva reciprok (omvända talet)        → brak-div-reciprok

   MULTI-PATH: drillen frågar efter SLUTSVARET och rättar på VÄRDE (+ enklaste
   form) — ingen kanonisk mellanled-kedja krävs, så valfri giltig väg (låna
   eller via oäkta bråk / korsförkorta i valfri ordning) godtas. Facit = Öva-
   bladen + provbyggarens test-generatorer. Rena generatorer exponeras för fuzz.
   ============================================================ */
(function(){
  'use strict';
  function _gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function _kanonisk(t, n){ if(n < 0){ t = -t; n = -n; } var g = _gcd(t, n); t /= g; n /= g; var hel = Math.floor(t / n), rem = t - hel * n; if(rem === 0) return { hel: hel, t: 0, n: 1 }; return { hel: hel, t: rem, n: n }; }
  function ri(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  function rp(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Rena generatorer (facit = provbyggarens) ─────────────────
  // Låna: m1 h1/d − m2 h2/d, h1<h2 (kräver lån), m1>m2 (positivt). Svar = differensen (kanonisk blandad).
  function genLana(level){
    var d = rp(level <= 1 ? [3, 4, 5, 6] : [3, 4, 5, 6, 8, 10]);
    var h1 = ri(1, d - 2), h2 = ri(h1 + 1, d - 1);              // h1 < h2 → bråkdelen mindre → lån
    var m2 = ri(1, 2 + level), m1 = ri(m2 + 1, m2 + 2 + level); // m1 > m2 → differensen positiv
    var diff = (m1 * d + h1) - (m2 * d + h2);
    return { m1: m1, h1: h1, m2: m2, h2: h2, d: d, ans: _kanonisk(diff, d), V: diff / d };
  }
  // Förkorta innan mult: t1/n1 · t2/n2 där produkten går att förkorta (gcd>1). Svar = produkten enklaste.
  function genMultForkorta(level){
    for(var i = 0; i < 60; i++){
      var t1 = ri(1, 5), n1 = ri(t1 + 1, 8), t2 = ri(1, 5), n2 = ri(t2 + 1, 8);
      var num = t1 * t2, den = n1 * n2;
      if(_gcd(num, den) > 1) return { t1: t1, n1: n1, t2: t2, n2: n2, num: num, den: den, ans: _kanonisk(num, den), V: num / den };
    }
    return { t1: 2, n1: 4, t2: 3, n2: 6, num: 6, den: 24, ans: _kanonisk(6, 24), V: 6 / 24 };
  }
  // Reciprok: t/n (förkortat, t<n) → n/t. Svar = inversen (kanonisk, oäkta → blandad).
  function genReciprok(level){
    var n = rp(level <= 1 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 7, 8, 9]), t;
    do { t = ri(1, n - 1); } while(_gcd(t, n) !== 1);
    return { t: t, n: n, ans: _kanonisk(n, t), V: n / t };
  }

  if(typeof window !== 'undefined'){ window.genLana = genLana; window.genMultForkorta = genMultForkorta; window.genReciprok = genReciprok; }
  if(typeof module !== 'undefined' && module.exports) module.exports = { genLana: genLana, genMultForkorta: genMultForkorta, genReciprok: genReciprok, _gcd: _gcd, _kanonisk: _kanonisk };

  // ── Drill-engines (körs i ramen) ─────────────────────────────
  if(typeof window !== 'undefined' && typeof window.korOvning === 'function'){
    var frac = window.frac, fracBoxes = window.fracBoxes, valFor = window.valFor, mixed = window.mixed;
    function intg(x){ return '<span style="font-size:22px;padding:0 4px;">' + x + '</span>'; }
    function heltalBox(cls){ return '<input class="brak-in ' + cls + '" inputmode="numeric" autocomplete="off" style="width:46px;height:44px;text-align:center;font-size:20px;">'; }
    function blandFaktor(m, t, n){ return intg(m) + frac(t, n); }
    function blandInput(pre){ return heltalBox(pre + '-hel') + '<span style="margin:0 4px;"></span>' + fracBoxes(pre + '-t', pre + '-n'); }
    var LIKA = '<span style="margin:0 8px;font-size:22px;">=</span>';
    var GNG = '<span style="margin:0 7px;color:#7a6e65;">·</span>';
    // Kanonisk blandad-rättning (ALLTID enklaste; helt tal → tom bråkdel). Speglar mult-drillens svarRatt.
    function blandRatt(pre, ans){
      var hh = parseInt(valFor(pre + '-hel'), 10); if(isNaN(hh)) hh = 0;
      var tt = parseInt(valFor(pre + '-t'), 10), nn = parseInt(valFor(pre + '-n'), 10);
      if(isNaN(tt) && isNaN(nn)) return ans.t === 0 && hh === ans.hel;
      if(isNaN(tt) || isNaN(nn) || nn === 0) return false;
      if(_gcd(tt, nn) !== 1 || tt >= nn) return false;
      return hh === ans.hel && tt === ans.t && nn === ans.n;
    }
    // Bråk-rättning på VÄRDE + enklaste (accepterar oäkta). Speglar provbyggarens brak-subtyp.
    function fracRatt(pre, targetT, targetN){
      var t = parseInt(valFor(pre + '-t'), 10), n = parseInt(valFor(pre + '-n'), 10);
      if(isNaN(t) || isNaN(n) || n === 0) return false;
      return t * targetN === n * targetT && _gcd(t, n) === 1;
    }
    function facitBland(ans){ return (ans.t === 0) ? ('' + ans.hel) : (ans.hel ? mixed(ans.hel, ans.t, ans.n) : frac(ans.t, ans.n)); }

    // ── Låna i blandad form (subtraktion; svar i blandad enklaste form) ──
    window.lanaEngine = function(){
      window.korOvning({
        titel: 'Låna i blandad form', sub: 'Räkna ut differensen. Skriv svaret i blandad form, enklaste form. (Du får låna från heltalet eller räkna via oäkta bråk – valfri väg.)',
        back: window.renderOversikt,
        gen: function(level){
          var u = genLana(level);
          return {
            fragaHtml: '<div style="display:flex;align-items:center;flex-wrap:wrap;font-size:22px;">'
              + blandFaktor(u.m1, u.h1, u.d) + '<span style="margin:0 8px;font-size:22px;">−</span>' + blandFaktor(u.m2, u.h2, u.d) + LIKA + blandInput('l') + '</div>',
            facitText: facitBland(u.ans),
            faltRatt: function(f){ return blandRatt('l', u.ans); },
            check: function(){ return blandRatt('l', u.ans); }
          };
        }
      });
    };

    // ── Förkorta innan multiplikation (svar i enklaste form, valfri korsförkortnings-ordning) ──
    window.multForkortaEngine = function(){
      window.korOvning({
        titel: 'Förkorta innan multiplikation', sub: 'Korsförkorta täljare mot nämnare (i valfri ordning) innan du multiplicerar. Skriv svaret i enklaste form.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genMultForkorta(level);
          return {
            fragaHtml: '<div style="display:flex;align-items:center;flex-wrap:wrap;font-size:22px;">'
              + frac(u.t1, u.n1) + GNG + frac(u.t2, u.n2) + LIKA + fracBoxes('mf-t', 'mf-n') + '</div>',
            facitText: (u.ans.hel && u.ans.t === 0) ? ('' + u.ans.hel) : frac(u.num / _gcd(u.num, u.den), u.den / _gcd(u.num, u.den)),
            faltRatt: function(f){ return fracRatt('mf', u.num, u.den); },
            check: function(){ return fracRatt('mf', u.num, u.den); }
          };
        }
      });
    };

    // ── Skriva reciprok (omvända talet): t/n → n/t ──
    window.reciprokEngine = function(){
      window.korOvning({
        titel: 'Skriva reciprok', sub: 'Skriv reciproken (omvända talet) – byt plats på täljare och nämnare. Enklaste form.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genReciprok(level);
          return {
            fragaHtml: '<div style="display:flex;align-items:center;flex-wrap:wrap;font-size:22px;">'
              + '<span style="margin-right:10px;">reciproken av</span>' + frac(u.t, u.n) + LIKA + fracBoxes('rc-t', 'rc-n') + '</div>',
            facitText: frac(u.n, u.t),
            faltRatt: function(f){ return fracRatt('rc', u.n, u.t); },
            check: function(){ return fracRatt('rc', u.n, u.t); }
          };
        }
      });
    };
  }
})();
