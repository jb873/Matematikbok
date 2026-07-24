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
  // ── Bråk på tallinje: pil vid k/n ──
  function genTallinje(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    var n = level >= 2 ? ri(3, 10) : ri(2, 6), k = ri(1, n - 1);
    var F = (typeof window !== 'undefined' && window.SvgAndel) ? window.SvgAndel : null;
    return { svg: F ? F.tallinje(0, 1.25, n, [{ v: k / n, typ: 'pil' }]) : '', t: k, n: n };
  }
  // ── Andel av ett antal: k blå av m ──
  function genAntal(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    var m = level >= 2 ? ri(4, 8) : ri(3, 6), k = ri(1, m - 1), farger = [];
    for(var i = 0; i < m; i++) farger.push(i < k ? 'bla' : 'rod');
    for(var j = m - 1; j > 0; j--){ var q = Math.floor(rnd() * (j + 1)), t = farger[j]; farger[j] = farger[q]; farger[q] = t; }
    var F = (typeof window !== 'undefined' && window.SvgAndel) ? window.SvgAndel : null;
    return { svg: F ? F.antalsfigur(farger) : '', farger: farger, t: k, n: m };
  }
  // ── Skriva hela tal i bråkform (villkors-validering) ──
  function genHela(level, rnd){
    rnd = rnd || Math.random;
    return { varde: 2 + Math.floor(rnd() * (level >= 2 ? 4 : 2)) };   // 2–3 (nivå 1), 2–5 (nivå 2+)
  }
  // ── Andel kontra antal: två högar; flest ≠ störst andel ibland ──
  function genKontra(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    var A, B;
    if(rnd() < 0.5){
      // DIVERGENT par: en hög har fler blå MEN lägre andel (poängen: antal ≠ andel)
      var bTot = ri(3, 4), bBla = bTot - 1;                 // få blå, hög andel
      var aBla = bBla + ri(1, 2), aTot = aBla + ri(2, 3);   // fler blå
      while(aBla / aTot >= bBla / bTot) aTot++;             // säkra lägre andel
      A = { bla: aBla, tot: aTot }; B = { bla: bBla, tot: bTot };
      if(rnd() < 0.5){ var tmp = A; A = B; B = tmp; }
    } else {
      var halv = function(){ var tot = ri(3, level >= 2 ? 7 : 5), bla = ri(1, tot - 1); return { bla: bla, tot: tot }; };
      var tries = 0; do { A = halv(); B = halv(); tries++; } while(tries < 60 && (A.bla === B.bla || A.bla / A.tot === B.bla / B.tot));
    }
    var typ = rnd() < 0.5 ? 'flest' : 'andel';
    var svar = (typ === 'flest') ? (A.bla > B.bla ? 0 : 1) : (A.bla / A.tot > B.bla / B.tot ? 0 : 1);
    return { A: A, B: B, typ: typ, svar: svar };
  }

  if(typeof window !== 'undefined'){ window.genAndelFigur = genAndelFigur; window.genTallinje = genTallinje; window.genAntal = genAntal; window.genHela = genHela; window.genKontra = genKontra; }
  if(typeof module !== 'undefined' && module.exports) module.exports = { genAndelFigur: genAndelFigur, genTallinje: genTallinje, genAntal: genAntal, genHela: genHela, genKontra: genKontra };

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

    // ── Bråk på tallinje ──
    function ratt2(cls, u){ var t = parseInt(valFor(cls + '-t'), 10), n = parseInt(valFor(cls + '-n'), 10); return isFinite(t) && isFinite(n) && n !== 0 && Math.abs(t / n - u.t / u.n) < 1e-9; }
    window.tallinjeEngine = function(){
      window.korOvning({ titel: 'Vilket bråk pekar pilen på?', sub: 'Läs av tallinjen och skriv bråket.', back: window.renderOversikt,
        gen: function(level){ var u = genTallinje(level);
          return { fragaHtml: '<div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start;"><div>' + u.svg + '</div><div style="display:flex;align-items:center;gap:10px;font-size:18px;">Pilen =' + fracBoxes('tl-t', 'tl-n') + '</div></div>',
            facitText: u.t + '/' + u.n, faltRatt: function(f){ return ratt2('tl', u); }, check: function(){ return ratt2('tl', u); } }; } });
    };
    // ── Andel av ett antal ──
    window.antalEngine = function(){
      window.korOvning({ titel: 'Hur stor andel är blå?', sub: 'Skriv andelen blå kulor som bråk (du får förkorta).', back: window.renderOversikt,
        gen: function(level){ var u = genAntal(level);
          return { fragaHtml: '<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;"><div>' + u.svg + '</div><div style="display:flex;align-items:center;gap:10px;font-size:18px;">Andel blå =' + fracBoxes('an-t', 'an-n') + '</div></div>',
            facitText: u.t + '/' + u.n + ' (går att förkorta)', faltRatt: function(f){ return ratt2('an', u); }, check: function(){ return ratt2('an', u); } }; } });
    };
    // ── Skriva hela tal i bråkform (villkors-validering) ──
    window.helaEngine = function(){
      window.korOvning({ titel: 'Skriv talet i bråkform', sub: 'Flera svar är rätt — bråket ska vara lika med talet.', back: window.renderOversikt,
        gen: function(level){ var u = genHela(level);
          var villkor = { antal: 3, distinkt: true, test: function(t, n){ return n > 0 && Math.abs(t / n - u.varde) < 1e-9; } };
          function las3(){ var s = []; for(var i = 0; i < 3; i++) s.push({ t: parseInt(valFor('he' + i + '-t'), 10), n: parseInt(valFor('he' + i + '-n'), 10) }); return s; }
          function okFalt(i){ var t = parseInt(valFor('he' + i + '-t'), 10), n = parseInt(valFor('he' + i + '-n'), 10); return villkor.test(t, n); }
          return {
            fragaHtml: '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:18px;">Skriv <strong style="margin:0 4px;">' + u.varde + '</strong> som tre olika bråk: '
              + fracBoxes('he0-t', 'he0-n') + '<span style="margin:0 4px;">,</span>' + fracBoxes('he1-t', 'he1-n') + '<span style="margin:0 4px;">,</span>' + fracBoxes('he2-t', 'he2-n') + '</div>',
            facitText: 't.ex. ' + u.varde + '/1, ' + (u.varde * 2) + '/2, ' + (u.varde * 3) + '/3',
            faltRatt: function(f){ for(var i = 0; i < 3; i++){ if(f.classList.contains('he' + i + '-t') || f.classList.contains('he' + i + '-n')) return okFalt(i); } return false; },
            check: function(){ var v = window.validera ? window.validera(villkor, las3()) : { ok: false }; return v.ok; }
          };
        } });
    };
    // ── Andel kontra antal (val: A eller B) ──
    window.kontraEngine = function(){
      var S = window.SvgAndel;
      function hog(h){ var f = []; for(var i = 0; i < h.tot; i++) f.push(i < h.bla ? 'bla' : 'rod'); return S ? S.antalsfigur(f) : ''; }
      window.korOvningKlick({ titel: 'Flest eller störst andel?', sub: 'Blå kulor. Tänk på skillnaden mellan antal och andel.', back: window.renderOversikt, enkelval: true,
        gen: function(level){ var u = genKontra(level);
          var fraga = u.typ === 'flest' ? 'Vem har <strong>flest</strong> blå kulor?' : 'Vem har <strong>störst andel</strong> blå kulor?';
          return {
            fragaHtml: fraga + '<div style="display:flex;gap:40px;margin-top:14px;align-items:flex-start;">'
              + '<div style="text-align:center;"><div style="font-weight:700;margin-bottom:6px;">A</div>' + hog(u.A) + '</div>'
              + '<div style="text-align:center;"><div style="font-weight:700;margin-bottom:6px;">B</div>' + hog(u.B) + '</div></div>',
            kort: [ { html: 'A', txt: true, ratt: u.svar === 0 }, { html: 'B', txt: true, ratt: u.svar === 1 } ],
            facitText: 'A: ' + u.A.bla + ' av ' + u.A.tot + ', B: ' + u.B.bla + ' av ' + u.B.tot + '. Rätt: ' + (u.svar === 0 ? 'A' : 'B') + '.'
          };
        } });
    };
  }
})();
