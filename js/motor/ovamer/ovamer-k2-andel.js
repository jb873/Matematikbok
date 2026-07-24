/* ============================================================
   ovamer-k2-andel.js — FÄRDIGHETSTRÄNINGS-DRILLAR för k2 Del 1 "Andel och antal".
   NY fil — rör inte ovamer-k2.js/korOvning. Laddas i ak7-k2-ram.html EFTER
   svg-andel.js (figurmodulen) och ovamer-k2.js, registreras i K2_DRILL.

   Figurerna genereras ur window.SvgAndel (samma modul som Öva-bladet — en källa).
   PILOT: andelFigurEngine (nod andel-figur) — slumpad delad figur, eleven skriver
   andelen färgad som bråk (godkänns värde-lika). De andra fyra lövnoderna
   (tallinje, antal, skriva hela, andel-kontra) byggs efter OK på piloten.

   Generatorstandard: äkta oberoende slump, facit = k/n värde-verifierat.
   Ren generator (genAndelFigur) exponeras för fuzz i node (med SvgAndel-shim).
   ============================================================ */
(function(){
  'use strict';

  // ── Ren generator: slumpad delad figur, andel = k/n ──
  function genAndelFigur(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    var F = (typeof window !== 'undefined' && window.SvgAndel) ? window.SvgAndel : null;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    function sample(n, k){ var pool = []; for(var i = 0; i < n; i++) pool.push(i);
      for(var j = n - 1; j > 0; j--){ var m = Math.floor(rnd() * (j + 1)), t = pool[j]; pool[j] = pool[m]; pool[m] = t; }
      return pool.slice(0, k).sort(function(a, b){ return a - b; }); }
    var shapes = level >= 2 ? ['ruta', 'cirkel', 'strip', 'kryss', 'atta'] : ['ruta', 'cirkel', 'strip'];
    var shape = shapes[ri(0, shapes.length - 1)], n, k, svg = '';
    if(shape === 'ruta'){
      var conf = [[2,2],[2,3],[3,3],[2,4],[3,4]], rc = conf[ri(0, level >= 2 ? 4 : 2)], rows = rc[0], cols = rc[1];
      n = rows * cols; k = ri(1, n - 1); if(F) svg = F.delRuta(rows, cols, sample(n, k));
    } else if(shape === 'cirkel'){ n = ri(2, level >= 2 ? 8 : 4); k = ri(1, n - 1); if(F) svg = F.delCirkel(n, sample(n, k)); }
    else if(shape === 'strip'){ n = ri(2, level >= 2 ? 8 : 5); k = ri(1, n - 1); if(F) svg = F.delStrip(n, sample(n, k)); }
    else if(shape === 'kryss'){ n = 4; k = ri(1, 3); if(F) svg = F.delKryss(sample(4, k)); }
    else { n = 8; k = ri(1, 7); if(F) svg = F.delAtta(sample(8, k)); }
    return { svg: svg, t: k, n: n, shape: shape };
  }
  if(typeof window !== 'undefined') window.genAndelFigur = genAndelFigur;
  if(typeof module !== 'undefined' && module.exports) module.exports = { genAndelFigur: genAndelFigur };

  // ── Drill-engine (körs i ramen) ──
  if(typeof window !== 'undefined' && typeof window.korOvning === 'function'){
    var fracBoxes = window.fracBoxes, valFor = window.valFor;
    function las(){ return { t: parseInt(valFor('af-t'), 10), n: parseInt(valFor('af-n'), 10) }; }
    function ratt(u){ var s = las(); return isFinite(s.t) && isFinite(s.n) && s.n !== 0 && Math.abs(s.t / s.n - u.t / u.n) < 1e-9; }

    window.andelFigurEngine = function(){
      var prev = null;   // undvik samma sorts figur (form + andel) två gånger på raken
      window.korOvning({
        titel: 'Hur stor andel är färgad?',
        sub: 'Skriv andelen färgad del som bråk (du får förkorta).',
        back: window.renderOversikt,
        gen: function(level){
          var u, tries = 0;
          do { u = genAndelFigur(level); tries++; }
          while(prev && tries < 25 && (u.shape === prev.shape || (u.t === prev.t && u.n === prev.n)));
          prev = u;
          return {
            fragaHtml: '<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;">'
              + '<div>' + u.svg + '</div>'
              + '<div style="display:flex;align-items:center;gap:10px;font-size:18px;">Andel färgad =' + fracBoxes('af-t', 'af-n') + '</div></div>',
            facitText: u.t + '/' + u.n + ' (går att förkorta)',
            faltRatt: function(f){ return ratt(u); },
            check: function(){ return ratt(u); }
          };
        }
      });
    };
  }
})();
