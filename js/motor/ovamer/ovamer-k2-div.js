/* ============================================================
   ovamer-k2-div.js — DIVISION-DRILLARNA för k2 Del 7 (fördjupning åk7).
   NY fil — rör inte ovamer-k2.js eller något befintligt mellanled. Laddas i
   ak7-k2-ram.html EFTER ovamer-k2.js och registreras i K2_DRILL.

   Tre färdigheter (byggs stegvis): bråktal ÷ heltal, heltal ÷ bråktal,
   bråktal ÷ bråktal (visa metod). Denna fil innehåller PILOTEN:
   divBrakBrakEngine (visa metod) + dess generator.

   VISA METOD (inte bara invertera-och-multiplicera): drillen scaffoldar hela
   kedjan enligt Joachims B-uppgift — multiplicera med inverterade nämnaren så
   att nämnaren blir 1, räkna produkten, förkorta. Tresektions-rättning:
   (1) inverterade bråket, (2) produkten i täljaren, (3) förkortat svar.

   Generatorstandard: äkta oberoende slump (draw() drar täljare/nämnare var för
   sig), facit = (a·d)/(b·c) i enklaste form. Ren generator (genDivBB) exponeras
   för fuzz/runs-test i node.
   ============================================================ */
(function(){
  'use strict';
  function _gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }

  // ── Ren generator: bråktal ÷ bråktal, båda äkta & förkortade, oberoende slump ──
  //  Returnerar {a,b,c,d, ad,bc, cd, st,sn}. Facit: (a/b)÷(c/d) = (a·d)/(b·c) förkortat.
  function genDivBB(level, rnd){
    rnd = rnd || Math.random;
    var maxN = 4 + (level || 1) * 2;            // nämnar-tak växer med nivån
    function draw(){                            // äkta förkortat bråk t/n (0<t<n)
      for(;;){
        var n = 2 + Math.floor(rnd() * (maxN - 1));   // n i [2..maxN]
        var t = 1 + Math.floor(rnd() * (n - 1));      // t i [1..n-1]
        if(_gcd(t, n) === 1) return [t, n];
      }
    }
    var A = draw(), C = draw();                 // två OBEROENDE dragningar
    var a = A[0], b = A[1], c = C[0], d = C[1];
    var ad = a * d, bc = b * c, g = _gcd(ad, bc);
    return { a: a, b: b, c: c, d: d, ad: ad, bc: bc, cd: c * d, st: ad / g, sn: bc / g };
  }
  // exponera för test (node) och ev. återanvändning
  if(typeof window !== 'undefined') window.genDivBB = genDivBB;
  if(typeof module !== 'undefined' && module.exports) module.exports = { genDivBB: genDivBB, _gcd: _gcd };

  // ── Drill-engine (körs i ramen; kräver korOvning/frac/fracBoxes/valFor/gcd) ──
  if(typeof window !== 'undefined' && typeof window.korOvning === 'function'){
    var frac = window.frac, fracBoxes = window.fracBoxes, valFor = window.valFor;

    window.divBrakBrakEngine = function divBrakBrakEngine(){
      window.korOvning({
        titel: 'Dividera bråktal med bråktal',
        sub: 'Visa metoden: multiplicera täljare och nämnare med det inverterade bråket så att nämnaren blir 1.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genDivBB(level);
          var pil = '<span style="margin:0 8px;color:#7a6e65;">÷</span>';
          var lika = '<span style="margin:0 8px;">=</span>';
          var gng  = '<span style="margin:0 6px;color:#7a6e65;">·</span>';
          // Rad 1: given. Rad 2: × inverterade nämnaren (student fyller d/c).
          // Rad 3: produkten i täljaren, nämnaren = 1 (visas). Rad 4: förkortat svar.
          var html =
              '<div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start;">'
            +   '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">' + frac(u.a, u.b) + pil + frac(u.c, u.d) + '</div>'
            +   '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">' + lika + frac(u.a, u.b) + gng + fracBoxes('dv-r-t', 'dv-r-n')
            +     '<span style="margin-left:10px;font-size:13px;color:#7a6e65;">inverterade nämnaren</span></div>'
            +   '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">' + lika + fracBoxes('dv-p-t', 'dv-p-n')
            +     '<span style="margin-left:10px;font-size:13px;color:#7a6e65;">räkna täljare · täljare, nämnare · nämnare</span></div>'
            +   '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">' + lika + fracBoxes('dv-s-t', 'dv-s-n')
            +     '<span style="margin-left:10px;font-size:13px;color:#7a6e65;">förkorta till enklaste form</span></div>'
            + '</div>';
          return {
            fragaHtml: html,
            facitText: u.st + '/' + u.sn + '  (' + u.a + '/' + u.b + ' · ' + u.d + '/' + u.c + ' = ' + u.ad + '/' + u.bc + ')',
            // Tresektions-facit per fält (för färgning)
            faltRatt: function(f){
              if(f.classList.contains('dv-r-t')) return parseInt(f.value, 10) === u.d;
              if(f.classList.contains('dv-r-n')) return parseInt(f.value, 10) === u.c;
              if(f.classList.contains('dv-p-t')) return parseInt(f.value, 10) === u.ad;
              if(f.classList.contains('dv-p-n')) return parseInt(f.value, 10) === u.bc;
              if(f.classList.contains('dv-s-t')) return parseInt(f.value, 10) === u.st;
              if(f.classList.contains('dv-s-n')) return parseInt(f.value, 10) === u.sn;
              return false;
            },
            check: function(){
              var rt = parseInt(valFor('dv-r-t'), 10), rn = parseInt(valFor('dv-r-n'), 10);
              var pt = parseInt(valFor('dv-p-t'), 10), pn = parseInt(valFor('dv-p-n'), 10);
              var st = parseInt(valFor('dv-s-t'), 10), sn = parseInt(valFor('dv-s-n'), 10);
              return rt === u.d && rn === u.c && pt === u.ad && pn === u.bc && st === u.st && sn === u.sn;
            }
          };
        }
      });
    };
  }
})();
