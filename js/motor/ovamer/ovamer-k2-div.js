/* ============================================================
   ovamer-k2-div.js — DIVISION-DRILLARNA för k2 Del 7 (fördjupning åk7).
   NY fil — rör inte ovamer-k2.js eller något befintligt mellanled. Laddas i
   ak7-k2-ram.html EFTER ovamer-k2.js och registreras i K2_DRILL.

   Tre färdigheter, övningsbara separat (loggar till var sin nod via korOvning):
     • divBrakHeltalEngine  — bråktal ÷ heltal      (bara svaret)      → brak-div-bh
     • divHeltalBrakEngine  — heltal ÷ bråktal      (bara svaret)      → brak-div-hb
     • divBrakBrakEngine    — bråktal ÷ bråktal      (VISA METOD)       → brak-div-bb

   VISA METOD (bråk÷bråk): eleven fyller HELA komplexbråks-kedjan enligt Joachims
   B-uppgift — multiplicera täljare OCH nämnare med inverterade nämnaren så att
   nämnaren blir 1, räkna produkterna, förkorta. Tresektions-rättning.

   Generatorstandard: äkta oberoende slump (draw() drar täljare/nämnare var för
   sig), facit i enklaste form. Rena generatorer exponeras för fuzz/runs-test.
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
  // bråktal ÷ heltal:  (a/b) ÷ h = a/(b·h) förkortat
  function genDivBH(level, rnd){
    rnd = rnd || Math.random; var maxN = 4 + (level || 1) * 2;
    var f = _drawProper(maxN, rnd), a = f[0], b = f[1];
    var h = 2 + Math.floor(rnd() * (2 + (level || 1)));   // heltal 2..
    var g = _gcd(a, b * h);
    return { a: a, b: b, h: h, st: a / g, sn: b * h / g };
  }
  // heltal ÷ bråktal (enhetsbråk, som docx grupp 2/5):  h ÷ (1/d) = h·d
  function genDivHB(level, rnd){
    rnd = rnd || Math.random; var maxN = 4 + (level || 1) * 2;
    var d = 2 + Math.floor(rnd() * (maxN - 1));           // nämnare 2..maxN
    var h = 2 + Math.floor(rnd() * (2 + (level || 1)));   // heltal 2..
    return { h: h, c: 1, d: d, svar: h * d };             // heltalssvar
  }
  // bråktal ÷ bråktal:  (a/b)÷(c/d) = (a·d)/(b·c) förkortat
  function genDivBB(level, rnd){
    rnd = rnd || Math.random; var maxN = 4 + (level || 1) * 2;
    var A = _drawProper(maxN, rnd), C = _drawProper(maxN, rnd);
    var a = A[0], b = A[1], c = C[0], d = C[1];
    var ad = a * d, bc = b * c, g = _gcd(ad, bc);
    return { a: a, b: b, c: c, d: d, ad: ad, bc: bc, cd: c * d, st: ad / g, sn: bc / g };
  }

  if(typeof window !== 'undefined'){ window.genDivBH = genDivBH; window.genDivHB = genDivHB; window.genDivBB = genDivBB; }
  if(typeof module !== 'undefined' && module.exports) module.exports = { genDivBH: genDivBH, genDivHB: genDivHB, genDivBB: genDivBB, _gcd: _gcd };

  // ── Drill-engines (körs i ramen) ─────────────────────────────
  if(typeof window !== 'undefined' && typeof window.korOvning === 'function'){
    var frac = window.frac, fracBoxes = window.fracBoxes, valFor = window.valFor;
    function intg(x){ return '<span style="font-size:22px;padding:0 6px;font-feature-settings:\'tnum\';">' + x + '</span>'; }
    function heltalBox(cls){ return '<input class="brak-in ' + cls + '" inputmode="numeric" autocomplete="off" style="width:60px;height:44px;text-align:center;font-size:20px;">'; }
    var LIKA = '<span style="margin:0 8px;font-size:22px;">=</span>';
    var GNG  = '<span style="margin:0 6px;color:#7a6e65;">·</span>';
    // Komplext (staplat) bråk med godtycklig HTML i täljare/nämnare
    function cfrac(topHTML, botHTML){
      return '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 7px;">'
           + '<span style="padding:3px 12px;display:flex;align-items:center;gap:4px;">' + topHTML + '</span>'
           + '<span style="height:2.5px;background:#12110f;align-self:stretch;min-width:70px;"></span>'
           + '<span style="padding:3px 12px;display:flex;align-items:center;gap:4px;">' + botHTML + '</span></span>';
    }
    function hint(txt){ return '<span style="margin-left:12px;font-size:13px;color:#7a6e65;">' + txt + '</span>'; }
    function num(f, cls){ return (parseInt(valFor(cls), 10) === f); }

    // ── bråktal ÷ heltal (bara svaret) ──
    window.divBrakHeltalEngine = function(){
      window.korOvning({
        titel: 'Dividera bråktal med heltal', sub: 'Räkna ut kvoten. Skriv svaret i enklaste form.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genDivBH(level);
          return {
            fragaHtml: '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">'
              + cfrac(frac(u.a, u.b), intg(u.h)) + LIKA + fracBoxes('dh-s-t', 'dh-s-n') + '</div>',
            facitText: u.st + '/' + u.sn,
            faltRatt: function(f){ return f.classList.contains('dh-s-t') ? num(u.st, 'dh-s-t') : num(u.sn, 'dh-s-n'); },
            check: function(){ return num(u.st, 'dh-s-t') && num(u.sn, 'dh-s-n'); }
          };
        }
      });
    };

    // ── heltal ÷ bråktal (bara svaret; enhetsbråk → heltalssvar) ──
    window.divHeltalBrakEngine = function(){
      window.korOvning({
        titel: 'Dividera heltal med bråktal', sub: 'Räkna ut kvoten. Svaret blir ett heltal.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genDivHB(level);
          return {
            fragaHtml: '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">'
              + cfrac(intg(u.h), frac(u.c, u.d)) + LIKA + heltalBox('hb-s') + '</div>',
            facitText: '' + u.svar,
            faltRatt: function(f){ return num(u.svar, 'hb-s'); },
            check: function(){ return num(u.svar, 'hb-s'); }
          };
        }
      });
    };

    // ── bråktal ÷ bråktal (VISA METOD, full komplexbråks-kedja, tresektion) ──
    window.divBrakBrakEngine = function(){
      window.korOvning({
        titel: 'Dividera bråktal med bråktal',
        sub: 'Visa metoden: multiplicera täljare och nämnare med det inverterade bråket så att nämnaren blir 1.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genDivBB(level);
          // 1) inverterade nämnaren (d/c)  2) produkterna: täljare ad/bc över nämnare cd/dc
          // 3) förkorta: nämnaren blir 1 → svar
          var s1 = cfrac(frac(u.a, u.b) + GNG + fracBoxes('bb-r-t', 'bb-r-n'),
                         frac(u.c, u.d) + GNG + fracBoxes('bb-r2t', 'bb-r2n'));
          var s2 = cfrac(fracBoxes('bb-pt-t', 'bb-pt-n'), fracBoxes('bb-pb-t', 'bb-pb-n'));
          var s3 = cfrac(fracBoxes('bb-s-t', 'bb-s-n'), intg(1));
          var html = '<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;">'
            + '<div style="display:flex;align-items:center;flex-wrap:wrap;">' + cfrac(frac(u.a, u.b), frac(u.c, u.d)) + '</div>'
            + '<div style="display:flex;align-items:center;flex-wrap:wrap;">' + LIKA + s1 + hint('multiplicera med inverterade nämnaren') + '</div>'
            + '<div style="display:flex;align-items:center;flex-wrap:wrap;">' + LIKA + s2 + hint('räkna produkterna (nämnaren blir 1)') + '</div>'
            + '<div style="display:flex;align-items:center;flex-wrap:wrap;">' + LIKA + s3 + hint('förkorta täljaren') + '</div>'
            + '</div>';
          return {
            fragaHtml: html,
            facitText: u.st + '/' + u.sn + '  (' + u.a + '/' + u.b + ' · ' + u.d + '/' + u.c + ' = ' + u.ad + '/' + u.bc + ')',
            faltRatt: function(f){
              if(f.classList.contains('bb-r-t') || f.classList.contains('bb-r2t')) return parseInt(f.value, 10) === u.d;
              if(f.classList.contains('bb-r-n') || f.classList.contains('bb-r2n')) return parseInt(f.value, 10) === u.c;
              if(f.classList.contains('bb-pt-t')) return parseInt(f.value, 10) === u.ad;
              if(f.classList.contains('bb-pt-n')) return parseInt(f.value, 10) === u.bc;
              if(f.classList.contains('bb-pb-t')) return parseInt(f.value, 10) === u.cd;
              if(f.classList.contains('bb-pb-n')) return parseInt(f.value, 10) === u.cd;
              if(f.classList.contains('bb-s-t')) return parseInt(f.value, 10) === u.st;
              if(f.classList.contains('bb-s-n')) return parseInt(f.value, 10) === u.sn;
              return false;
            },
            check: function(){
              return num(u.d, 'bb-r-t') && num(u.c, 'bb-r-n') && num(u.d, 'bb-r2t') && num(u.c, 'bb-r2n')
                && num(u.ad, 'bb-pt-t') && num(u.bc, 'bb-pt-n') && num(u.cd, 'bb-pb-t') && num(u.cd, 'bb-pb-n')
                && num(u.st, 'bb-s-t') && num(u.sn, 'bb-s-n');
            }
          };
        }
      });
    };
  }
})();
