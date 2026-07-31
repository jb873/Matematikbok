/* ============================================================
   ovamer-k2-likvtid.js — TVÅ compute-drillar för k2 (åttans uppskjutna generator-gap,
   byggs i sjuan). NY fil — rör inte ovamer-k2.js eller något befintligt mellanled.
   Laddas i ak7-k2-ram.html EFTER ovamer-k2.js och registreras i K2_DRILL.

   Två färdigheter, övningsbara separat (loggar till var sin nod via korOvning):
     • tidBrakEngine    — minuter → del av en timme i bråkform (enklaste)  → brak-tid
     • likformigEngine  — förläng ett bråk till given nämnare (ny täljare)  → brak-likformig

   Bägge SINGLE-STEP compute (inget mellanled): tid = m/60 förkortat; likformig = förläng
   täljare och nämnare med samma tal till en angiven nämnare. Speglar principen i
   forlangaEngine (ovamer-k2.js) utan att röra den. Rena generatorer exponeras för fuzz.
   ============================================================ */
(function(){
  'use strict';
  function _gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function _drawProper(maxN, rnd){                 // äkta förkortat bråk t/n (0<t<n)
    for(;;){
      var n = 2 + Math.floor(rnd() * (maxN - 1));
      var t = 1 + Math.floor(rnd() * (n - 1));
      if(_gcd(t, n) === 1) return [t, n];
    }
  }

  // ── Rena generatorer ─────────────────────────────────────────
  // Tid: minuter (multipel av 5, delar 60) → m/60 i enklaste form.
  var TID_POOL = {
    1: [15, 30, 45, 20, 40, 10, 50],
    2: [15, 30, 45, 20, 40, 10, 50, 12, 24, 36, 48, 6, 54],
    3: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 6, 12, 18, 24, 36, 42, 48, 54]
  };
  function genTid(level, rnd){
    rnd = rnd || Math.random;
    var pool = TID_POOL[Math.min(level || 1, 3)] || TID_POOL[1];
    var m = pool[Math.floor(rnd() * pool.length)];
    var g = _gcd(m, 60);
    return { min: m, t: m / g, n: 60 / g };
  }
  // Likformig: förläng t/n med k → ny täljare t·k över given nämnare n·k.
  function genLikformig(level, rnd){
    rnd = rnd || Math.random;
    var f = _drawProper(3 + (level || 1), rnd), t = f[0], n = f[1];
    var k = 2 + Math.floor(rnd() * (1 + (level || 1)));
    return { t: t, n: n, k: k, nt: t * k, nn: n * k };
  }

  if(typeof window !== 'undefined'){ window.genTid = genTid; window.genLikformig = genLikformig; }
  if(typeof module !== 'undefined' && module.exports) module.exports = { genTid: genTid, genLikformig: genLikformig, _gcd: _gcd };

  // ── Drill-engines (körs i ramen) ─────────────────────────────
  if(typeof window !== 'undefined' && typeof window.korOvning === 'function'){
    var frac = window.frac, fracBoxes = window.fracBoxes, valFor = window.valFor;
    function intg(x){ return '<span style="font-size:22px;padding:0 6px;font-feature-settings:\'tnum\';">' + x + '</span>'; }
    function heltalBox(cls){ return '<input class="brak-in ' + cls + '" inputmode="numeric" autocomplete="off" style="width:60px;height:44px;text-align:center;font-size:20px;">'; }
    var LIKA = '<span style="margin:0 8px;font-size:22px;">=</span>';
    function num(f, cls){ return (parseInt(valFor(cls), 10) === f); }
    // Staplat bråk med godtycklig HTML i täljare/nämnare (för likformig: [ruta] / given nämnare)
    function cfrac(topHTML, botHTML){
      return '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 7px;">'
           + '<span style="padding:3px 12px;display:flex;align-items:center;gap:4px;">' + topHTML + '</span>'
           + '<span style="height:2.5px;background:#12110f;align-self:stretch;min-width:56px;"></span>'
           + '<span style="padding:3px 12px;display:flex;align-items:center;gap:4px;">' + botHTML + '</span></span>';
    }

    // ── minuter → del av en timme i bråkform (bara svaret, enklaste form) ──
    window.tidBrakEngine = function(){
      window.korOvning({
        titel: 'Tid i bråkform', sub: 'Skriv antalet minuter som del av en timme. Svaret i enklaste form.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genTid(level);
          return {
            fragaHtml: '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">'
              + intg(u.min + ' min') + LIKA + fracBoxes('tid-s-t', 'tid-s-n') + intg('h') + '</div>',
            facitText: u.t + '/' + u.n + ' h',
            faltRatt: function(f){ return f.classList.contains('tid-s-t') ? num(u.t, 'tid-s-t') : num(u.n, 'tid-s-n'); },
            check: function(){ return num(u.t, 'tid-s-t') && num(u.n, 'tid-s-n'); }
          };
        }
      });
    };

    // ── förläng bråk till given nämnare (skriv den nya täljaren) ──
    window.likformigEngine = function(){
      window.korOvning({
        titel: 'Likformiga bråk', sub: 'Förläng bråket så att det får den angivna nämnaren. Skriv den nya täljaren.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genLikformig(level);
          return {
            fragaHtml: '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">'
              + frac(u.t, u.n) + LIKA + cfrac(heltalBox('lf-s'), intg(u.nn)) + '</div>',
            facitText: u.nt + '/' + u.nn,
            faltRatt: function(f){ return num(u.nt, 'lf-s'); },
            check: function(){ return num(u.nt, 'lf-s'); }
          };
        }
      });
    };
  }
})();
