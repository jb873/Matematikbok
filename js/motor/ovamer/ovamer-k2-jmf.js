/* ============================================================
   ovamer-k2-jmf.js — JÄMFÖRA-BRÅK-DRILLARNA för k2 Del 4 (fem färdigheter).
   NY fil — rör inte ovamer-k2.js/korOvning eller något befintligt mellanled.
   Laddas i ak7-k2-ram.html EFTER ovamer-k2.js och registreras i K2_DRILL.

   Jämförelse/omdöme autorättas inte som räkning → KLICK-, FLERVALS-, ORDNA- och
   VILLKORS-svar. Egna interaktions-loopar (korOvningKlick, korOvningOrdna) som
   speglar korOvnings omgång/nivå/scorebar/konfetti och loggar via k2Logga.
   Nivån adaptiv BARA UPPÅT. Bråk renderas stående via ram-frac.

   Fem noder:
     brak-jmf-lika       → klickaStorstEngine   (klicka störst)
     brak-jmf-riktmark   → markeraRiktmarkEngine (markera alla mot ½ och 1)
     brak-jmf-ordna      → storleksordnaEngine  (ordna, minst först)
     brak-jmf-summa      → summaMot1Engine       (binärt: större/mindre än 1)
     brak-jmf-konstr     → konstrueraEngine      (inmatning + VILLKORS-VALIDERING)

   Distraktor-DNA (ur Joachims blad): nära1 (n±1/n samt n/n=1) och nära½
   (udda m → (m±1)/2 ∕ m). Alla generatorer: äkta oberoende slump.
   ============================================================ */
(function(){
  'use strict';
  function _gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function _shuffle(arr, rnd){ for(var i = arr.length - 1; i > 0; i--){ var j = Math.floor(rnd() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  // ── GENERATOR 2: markera alla (mot ½ och 1) ─────────────────
  function genMarkeraAlla(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    var maxN = 6 + level * 2;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    function oddM(){ return 2 * ri(4, 5 + level * 2) + 1; }
    var gens = {
      eq1:     function(){ var n = ri(3, maxN); return [n, n]; },
      over1s:  function(){ var n = ri(4, maxN); return [n + 1, n]; },
      under1s: function(){ var n = ri(5, maxN); return [n - 1, n]; },
      overHs:  function(){ var m = oddM(); return [(m + 1) / 2, m]; },
      underHs: function(){ var m = oddM(); return [(m - 1) / 2, m]; },
      overHk:  function(){ var a = [[2,3],[3,5],[5,7],[5,8],[4,7],[7,9]]; return a[ri(0, a.length - 1)]; },
      underHk: function(){ var a = [[1,4],[2,7],[1,3],[3,8],[2,9],[3,10]]; return a[ri(0, a.length - 1)]; },
      over1k:  function(){ var a = [[3,2],[5,3],[7,4],[7,5],[9,5],[11,6]]; return a[ri(0, a.length - 1)]; }
    };
    var V = {
      gt1:     { text: 'större än 1',                    ok: function(v){ return v > 1; },            sat: ['over1s','over1k'],                    fail: ['eq1','under1s','overHk','underHk','underHs'], hard: ['eq1','under1s'] },
      lt1:     { text: 'mindre än 1',                    ok: function(v){ return v < 1; },            sat: ['under1s','overHk','underHk','overHs','underHs'], fail: ['eq1','over1s','over1k'],         hard: ['eq1','over1s'] },
      lthalf:  { text: 'mindre än en halv',              ok: function(v){ return v < 0.5; },          sat: ['underHs','underHk'],                  fail: ['overHs','overHk','over1s','eq1'],             hard: ['overHs'] },
      between: { text: 'större än en halv men mindre än 1', ok: function(v){ return v > 0.5 && v < 1; }, sat: ['overHs','overHk','under1s'],        fail: ['underHs','underHk','over1s','eq1'],           hard: ['underHs','over1s','eq1'] }
    };
    var vkeys = Object.keys(V), vk = vkeys[ri(0, vkeys.length - 1)], v = V[vk];
    var k = ri(1, 3), chosen = [], seen = {};
    function val(f){ return f[0] / f[1]; }
    function add(f){ var key = f[0] + '/' + f[1]; if(seen[key]) return false; seen[key] = 1; chosen.push(f); return true; }
    var t;
    t = 0; while(chosen.length < k && t++ < 300){ var g = v.sat[ri(0, v.sat.length - 1)], f = gens[g](); if(v.ok(val(f))) add(f); }
    t = 0; var hard = false; while(!hard && t++ < 300){ var gh = v.hard[ri(0, v.hard.length - 1)], fh = gens[gh](); if(!v.ok(val(fh))) hard = add(fh); }
    t = 0; while(chosen.length < 5 && t++ < 600){ var gf = v.fail[ri(0, v.fail.length - 1)], ff = gens[gf](); if(!v.ok(val(ff))) add(ff); }
    _shuffle(chosen, rnd);
    return { villkor: vk, villkorText: v.text, brak: chosen, ratt: chosen.map(function(f){ return v.ok(val(f)); }) };
  }

  // ── GENERATOR 1: klicka störst (samma täljare/nämnare) ──────
  function genKlickaStorst(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    var maxN = 6 + level * 2, antal = level >= 2 ? 3 : 2;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    function sampleDistinct(lo, hi, k){
      var pool = []; for(var x = lo; x <= hi; x++) pool.push(x);
      _shuffle(pool, rnd); return pool.slice(0, k);
    }
    var brak = [], storstIdx;
    if(rnd() < 0.5){                                   // SAMMA NÄMNARE: störst täljare vinner
      var n = ri(4, maxN), ts = sampleDistinct(1, n - 1, antal);
      brak = ts.map(function(tj){ return [tj, n]; });
      storstIdx = ts.indexOf(Math.max.apply(null, ts));
    } else {                                           // SAMMA TÄLJARE: minst nämnare vinner ("större tal lurar")
      var tj2 = ri(1, 4), ns = sampleDistinct(tj2 + 1, maxN + 2, antal);
      brak = ns.map(function(nn){ return [tj2, nn]; });
      storstIdx = ns.indexOf(Math.min.apply(null, ns));
    }
    return { brak: brak, ratt: brak.map(function(f, i){ return i === storstIdx; }) };
  }

  // ── GENERATOR 3: storleksordna (minst först) ────────────────
  function genStorleksordna(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    var maxN = 6 + level * 2, antal = level >= 2 ? 4 : 3;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    function sampleDistinct(lo, hi, k){ var p = []; for(var x = lo; x <= hi; x++) p.push(x); _shuffle(p, rnd); return p.slice(0, k); }
    var mode = ['talj', 'namn', 'blandat', 'kluster'][ri(0, 3)], brak = [], seen = {};
    function push(f){ var key = f[0] + '/' + f[1], v = f[0] / f[1]; if(seen['v' + Math.round(v * 1e6)]) return false; seen['v' + Math.round(v * 1e6)] = 1; brak.push(f); return true; }
    if(mode === 'talj'){                               // samma täljare
      var tj = ri(1, 3), ns = sampleDistinct(tj + 1, maxN, antal);
      ns.forEach(function(nn){ push([tj, nn]); });
    } else if(mode === 'namn'){                        // samma nämnare
      var n = ri(5, maxN), ts = sampleDistinct(1, n - 1, antal);
      ts.forEach(function(tj2){ push([tj2, n]); });
    } else if(mode === 'kluster'){                     // tätt kluster k/(k+1)
      var start = ri(2, 4);
      for(var i = 0; i < antal; i++){ push([start + i, start + i + 1]); }
    } else {                                           // blandat, med en oäkta (>1)
      var tries = 0;
      while(brak.length < antal - 1 && tries++ < 200){ var n2 = ri(3, maxN), t2 = ri(1, n2 - 1); if(_gcd(t2, n2) === 1) push([t2, n2]); }
      var no = ri(3, maxN); push([no + 1, no]);        // en oäkta (strax över 1)
    }
    // fyll upp om dedupe svalt
    var tries2 = 0;
    while(brak.length < antal && tries2++ < 300){ var n3 = ri(3, maxN), t3 = ri(1, n3 + 1); if(_gcd(t3, n3) === 1) push([t3, n3]); }
    _shuffle(brak, rnd);
    // korrekt ordning: index sorterade stigande på värde
    var idx = brak.map(function(f, i){ return i; }).sort(function(a, b){ return (brak[a][0] / brak[a][1]) - (brak[b][0] / brak[b][1]); });
    return { brak: brak, ordning: idx };
  }

  // ── GENERATOR 4: summa mot 1 (binärt) ───────────────────────
  function genSummaMot1(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    var maxN = 5 + level * 2;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    function draw(){ for(;;){ var n = ri(3, maxN), t = ri(1, n - 1); if(_gcd(t, n) === 1) return [t, n]; } }
    function nearHalf(){ var m = 2 * ri(3, 4 + level) + 1; return (rnd() < 0.5) ? [(m - 1) / 2, m] : [(m + 1) / 2, m]; }
    for(var tries = 0; tries < 400; tries++){
      var A = (rnd() < 0.6) ? nearHalf() : draw();
      var B = (rnd() < 0.6) ? nearHalf() : draw();
      var sum = A[0] / A[1] + B[0] / B[1];
      if(Math.abs(sum - 1) < 1e-9) continue;           // aldrig exakt 1
      if(Math.abs(sum - 1) > 0.45 + level * 0.1) continue; // håll det bedömnings-värt
      return { a: A[0], b: A[1], c: B[0], d: B[1], sum: sum, storre: sum > 1 };
    }
    return { a: 1, b: 2, c: 4, d: 7, sum: 1 / 2 + 4 / 7, storre: true }; // fallback (0.5+0.571>1)
  }

  // ── GENERATOR 5: konstruera bråk med villkor ────────────────
  function genKonstruera(level, rnd){
    rnd = rnd || Math.random;
    var typ = ['taljare', 'namnare', 'summa'][Math.floor(rnd() * 3)];
    if(typ === 'taljare'){
      var T = 3 + Math.floor(rnd() * 7);               // 3..9
      return { typ: typ, antal: 1, distinkt: false, param: T,
        test: function(t, n){ return t === T && n > 0 && t / n > 0.5 && t / n < 1; },
        facitEx: [[T, T + 1]] };                        // T/(T+1) ∈ (½,1)
    }
    if(typ === 'namnare'){
      var N = 5 + Math.floor(rnd() * 8);               // 5..12
      var tEx = Math.floor(N / 2) + 1;
      return { typ: typ, antal: 1, distinkt: false, param: N,
        test: function(t, n){ return n === N && t / n > 0.5 && t / n < 1; },
        facitEx: [[tEx, N]] };
    }
    return { typ: 'summa', antal: 3, distinkt: true, param: null,   // 2/3 + x < 1  →  x < 1/3
      test: function(t, n){ return t > 0 && n > 0 && t / n < 1 / 3; },
      facitEx: [[1, 4], [1, 5], [2, 7]] };
  }

  // ── VILLKORS-VALIDERING (generell, återanvändbar rättnings-typ) ──
  //  villkor: { test(t,n)->bool, antal:int, distinkt:bool }
  //  svar: [{t,n}, ...]  → { ok, perSvar:[bool] }
  function validera(villkor, svar){
    var perSvar = svar.map(function(s){
      return !!(s && isFinite(s.t) && isFinite(s.n) && s.n > 0 && villkor.test(s.t, s.n));
    });
    var distinctOk = true;
    if(villkor.distinkt){
      var seen = {};
      for(var i = 0; i < svar.length; i++){
        var s = svar[i]; if(!s || !isFinite(s.t) || !isFinite(s.n) || s.n === 0) continue;
        var key = Math.round((s.t / s.n) * 1e6);
        if(seen[key]){ distinctOk = false; break; } seen[key] = 1;
      }
    }
    var nog = perSvar.length >= villkor.antal;
    var allaGiltiga = perSvar.slice(0, villkor.antal).every(function(x){ return x; });
    return { ok: nog && allaGiltiga && distinctOk, perSvar: perSvar, distinctOk: distinctOk };
  }

  if(typeof window !== 'undefined'){
    window.genMarkeraAlla = genMarkeraAlla; window.genKlickaStorst = genKlickaStorst;
    window.genStorleksordna = genStorleksordna; window.genSummaMot1 = genSummaMot1;
    window.genKonstruera = genKonstruera; window.validera = validera;
  }
  if(typeof module !== 'undefined' && module.exports) module.exports = {
    genMarkeraAlla: genMarkeraAlla, genKlickaStorst: genKlickaStorst, genStorleksordna: genStorleksordna,
    genSummaMot1: genSummaMot1, genKonstruera: genKonstruera, validera: validera, _gcd: _gcd
  };

  // ── HARNESS + ENGINES (körs i ramen) ────────────────────────
  if(typeof window !== 'undefined' && typeof window.frac === 'function'){
    var frac = window.frac, fracBoxes = window.fracBoxes, valFor = window.valFor;
    function ensureCSS(){
      if(document.getElementById('jmf-css')) return;
      var s = document.createElement('style'); s.id = 'jmf-css';
      s.textContent =
        '.jmf-kortrad{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0 6px;}'
      + '.jmf-kort{position:relative;display:inline-flex;align-items:center;justify-content:center;min-width:78px;padding:14px 18px;'
      + 'border:2px solid #e2d9c6;border-radius:12px;background:#fff;cursor:pointer;font-size:22px;transition:all .12s;}'
      + '.jmf-kort:hover{border-color:#c49a40;}'
      + '.jmf-kort.sel{border-color:#0f1e2e;background:#0f1e2e;}'
      + '.jmf-kort.sel .brak{color:#fff;}'
      + '.jmf-kort.ratt{border-color:#2f7d4f;background:rgba(47,125,79,.12);}'
      + '.jmf-kort.fel{border-color:#c0392b;background:rgba(192,57,43,.12);}'
      + '.jmf-kort.miss{border-style:dashed;border-color:#c49a40;}'
      + '.jmf-ordnr{position:absolute;top:-9px;left:-9px;width:24px;height:24px;border-radius:50%;background:#0f1e2e;color:#fff;'
      + 'font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;}'
      + '.jmf-villkor{font-size:19px;margin:6px 0 2px;} .jmf-villkor .brak{margin:0 3px;}'
      + '.jmf-txtkort{font-size:17px;font-family:inherit;}';
      document.head.appendChild(s);
    }
    function scorebar(idx, results, OMG){ var d = ''; for(var i = 0; i < OMG; i++){ var c = i < idx ? (results[i] ? 'right' : 'wrong') : (i === idx ? 'current' : ''); d += '<div class="score-dot ' + c + '"></div>'; } return d; }
    function klart(app, right, OMG, level, back, nyOmgang, render){
      app.innerHTML = '<div class="view"><div class="exercise-card">'
        + '<div class="ex-header"><h2 class="ex-title">Klart!</h2><div class="ex-sub">Du klarade ' + right + ' av ' + OMG + '.</div></div>'
        + '<div class="summary"><div class="summary-big">' + right + '/' + OMG + '</div>'
        + '<div class="summary-txt">' + (right >= OMG - 1 ? 'Starkt! Nästa omgång kan bli svårare.' : 'Fortsätt träna!') + '</div>'
        + '<div class="summary-level">Nivå ' + level + '</div></div>'
        + '<div class="ex-actions"><button class="btn primary" id="next">Ny omgång</button>'
        + '<button class="btn subtle" id="back">Till alla områden</button></div></div></div>';
      document.getElementById('next').onclick = function(){ nyOmgang(); render(); };
      document.getElementById('back').onclick = back;
      if(right >= OMG - 1 && window.konfetti) window.konfetti();
    }

    // ── Klick-loop (markera alla / enkelval) ──
    window.korOvningKlick = function korOvningKlick(opts){
      ensureCSS();
      var app = window.app || document.getElementById('app');
      var hero = document.getElementById('hero'); if(hero) hero.style.display = 'none';
      var level = 1, omgang = [], idx = 0, results = [], OMG = 6;
      function nyOmgang(){ omgang = []; for(var i = 0; i < OMG; i++) omgang.push(opts.gen(level)); idx = 0; results = []; }
      function render(){
        if(idx >= omgang.length){ var right = results.filter(Boolean).length; if(right >= Math.ceil(OMG * 0.8) && level < 3) level++; klart(app, right, OMG, level, opts.back, nyOmgang, render); return; }
        var task = omgang[idx];
        var kortHtml = task.kort.map(function(k, ki){ return '<button class="jmf-kort' + (k.txt ? ' jmf-txtkort' : '') + '" data-i="' + ki + '">' + k.html + '</button>'; }).join('');
        app.innerHTML = '<div class="view"><div class="exercise-card">'
          + '<div class="ex-header"><h2 class="ex-title">' + opts.titel + '</h2><div class="ex-sub">' + opts.sub + '</div><span class="ex-level">Nivå ' + level + '</span></div>'
          + '<div class="scorebar">' + scorebar(idx, results, OMG) + '</div>'
          + '<div class="jmf-villkor">' + task.fragaHtml + '</div>'
          + '<div class="jmf-kortrad">' + kortHtml + '</div>'
          + '<div class="ex-feedback" id="fb"></div>'
          + '<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button>'
          + '<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
        var kort = Array.prototype.slice.call(app.querySelectorAll('.jmf-kort'));
        kort.forEach(function(el){ el.onclick = function(){ if(el.className.indexOf('ratt') > -1 || el.className.indexOf('fel') > -1 || el.className.indexOf('miss') > -1) return; if(opts.enkelval) kort.forEach(function(o){ if(o !== el) o.classList.remove('sel'); }); el.classList.toggle('sel'); }; });
        document.getElementById('back').onclick = opts.back;
        document.getElementById('check').onclick = function(){
          var fb = document.getElementById('fb'); fb.className = 'ex-feedback show'; var ok = true;
          kort.forEach(function(el, ki){
            var vald = el.classList.contains('sel'), ratt = task.kort[ki].ratt; el.classList.remove('sel'); el.style.pointerEvents = 'none';
            if(ratt && vald) el.classList.add('ratt'); else if(!ratt && vald){ el.classList.add('fel'); ok = false; } else if(ratt && !vald){ el.classList.add('miss'); ok = false; }
          });
          if(ok){ fb.classList.add('correct'); fb.textContent = 'Rätt!'; } else { fb.classList.add('wrong'); fb.innerHTML = task.facitText; }
          results.push(ok); if(window.k2Logga) window.k2Logga(ok);
          var b = document.createElement('button'); b.className = 'btn primary'; b.textContent = (idx + 1 >= OMG ? 'Se resultat' : 'Nästa'); b.onclick = function(){ idx++; render(); }; document.getElementById('check').replaceWith(b);
        };
      }
      nyOmgang(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Ordna-loop (klicka i ordning, minst först) ──
    window.korOvningOrdna = function korOvningOrdna(opts){
      ensureCSS();
      var app = window.app || document.getElementById('app');
      var hero = document.getElementById('hero'); if(hero) hero.style.display = 'none';
      var level = 1, omgang = [], idx = 0, results = [], OMG = 6;
      function nyOmgang(){ omgang = []; for(var i = 0; i < OMG; i++) omgang.push(opts.gen(level)); idx = 0; results = []; }
      function render(){
        if(idx >= omgang.length){ var right = results.filter(Boolean).length; if(right >= Math.ceil(OMG * 0.8) && level < 3) level++; klart(app, right, OMG, level, opts.back, nyOmgang, render); return; }
        var task = omgang[idx], vald = [];
        var kortHtml = task.kort.map(function(k, ki){ return '<button class="jmf-kort" data-i="' + ki + '">' + k.html + '</button>'; }).join('');
        app.innerHTML = '<div class="view"><div class="exercise-card">'
          + '<div class="ex-header"><h2 class="ex-title">' + opts.titel + '</h2><div class="ex-sub">' + opts.sub + '</div><span class="ex-level">Nivå ' + level + '</span></div>'
          + '<div class="scorebar">' + scorebar(idx, results, OMG) + '</div>'
          + '<div class="jmf-villkor">Klicka bråken i storleksordning, <strong>minst först</strong>.</div>'
          + '<div class="jmf-kortrad">' + kortHtml + '</div>'
          + '<div class="ex-feedback" id="fb"></div>'
          + '<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button>'
          + '<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
        var kort = Array.prototype.slice.call(app.querySelectorAll('.jmf-kort'));
        function rita(){ kort.forEach(function(el, ki){ var pos = vald.indexOf(ki); var old = el.querySelector('.jmf-ordnr'); if(old) old.remove(); el.classList.toggle('sel', pos > -1); if(pos > -1){ var b = document.createElement('span'); b.className = 'jmf-ordnr'; b.textContent = (pos + 1); el.appendChild(b); } }); }
        kort.forEach(function(el, ki){ el.onclick = function(){ if(el.style.pointerEvents === 'none') return; var p = vald.indexOf(ki); if(p > -1) vald.splice(p, 1); else vald.push(ki); rita(); }; });
        document.getElementById('back').onclick = opts.back;
        document.getElementById('check').onclick = function(){
          var fb = document.getElementById('fb'); fb.className = 'ex-feedback show';
          var ok = vald.length === kort.length && vald.every(function(ki, pos){ return ki === task.ordning[pos]; });
          kort.forEach(function(el){ el.style.pointerEvents = 'none'; });
          kort.forEach(function(el, ki){ var rattPos = task.ordning.indexOf(ki); var gav = vald.indexOf(ki); el.classList.add(gav === rattPos ? 'ratt' : 'fel'); });
          if(ok){ fb.classList.add('correct'); fb.textContent = 'Rätt!'; } else { fb.classList.add('wrong'); fb.innerHTML = 'Rätt ordning: ' + task.ordning.map(function(i){ return frac(task.kort[i].t, task.kort[i].n); }).join(' &lt; '); }
          results.push(ok); if(window.k2Logga) window.k2Logga(ok);
          var b = document.createElement('button'); b.className = 'btn primary'; b.textContent = (idx + 1 >= OMG ? 'Se resultat' : 'Nästa'); b.onclick = function(){ idx++; render(); }; document.getElementById('check').replaceWith(b);
        };
      }
      nyOmgang(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── ENGINES ──
    window.markeraRiktmarkEngine = function(){
      window.korOvningKlick({ titel: 'Jämföra mot en halv och en hel', sub: 'Markera alla bråk som uppfyller villkoret.', back: window.renderOversikt,
        gen: function(level){ var u = genMarkeraAlla(level); var facit = u.brak.filter(function(f, i){ return u.ratt[i]; }).map(function(f){ return frac(f[0], f[1]); });
          return { fragaHtml: 'Markera alla bråk som är <strong>' + u.villkorText + '</strong>.', kort: u.brak.map(function(f, i){ return { html: frac(f[0], f[1]), ratt: u.ratt[i] }; }), facitText: 'Rätt: ' + (facit.length ? facit.join(' &nbsp; ') : '(inga)') }; } });
    };
    window.klickaStorstEngine = function(){
      window.korOvningKlick({ titel: 'Vilket bråk är störst?', sub: 'Klicka på det största bråket.', back: window.renderOversikt, enkelval: true,
        gen: function(level){ var u = genKlickaStorst(level); var fi = u.ratt.indexOf(true);
          return { fragaHtml: 'Klicka på det <strong>största</strong> bråket.', kort: u.brak.map(function(f, i){ return { html: frac(f[0], f[1]), ratt: u.ratt[i] }; }), facitText: 'Störst: ' + frac(u.brak[fi][0], u.brak[fi][1]) }; } });
    };
    window.storleksordnaEngine = function(){
      window.korOvningOrdna({ titel: 'Storleksordna bråken', sub: 'Klicka bråken i storleksordning, minst först.', back: window.renderOversikt,
        gen: function(level){ var u = genStorleksordna(level); return { kort: u.brak.map(function(f){ return { html: frac(f[0], f[1]), t: f[0], n: f[1] }; }), ordning: u.ordning }; } });
    };
    window.summaMot1Engine = function(){
      window.korOvningKlick({ titel: 'Större eller mindre än 1?', sub: 'Uppskatta summan – utan att räkna exakt.', back: window.renderOversikt, enkelval: true,
        gen: function(level){ var u = genSummaMot1(level);
          return { fragaHtml: 'Är summan större eller mindre än 1?<div style="font-size:24px;margin-top:10px;">' + frac(u.a, u.b) + '<span style="margin:0 6px;">+</span>' + frac(u.c, u.d) + '</div>',
            kort: [ { html: 'Större än 1', txt: true, ratt: u.storre }, { html: 'Mindre än 1', txt: true, ratt: !u.storre } ], facitText: 'Summan är ' + (u.storre ? 'större' : 'mindre') + ' än 1.' }; } });
    };
    window.konstrueraEngine = function(){
      window.korOvning({ titel: 'Skriv ett bråk som passar', sub: 'Flera svar är rätt – ditt bråk godkänns om det uppfyller villkoret.', back: window.renderOversikt,
        gen: function(level){
          var u = genKonstruera(level), boxes = '';
          for(var i = 0; i < u.antal; i++){ boxes += (i > 0 ? '<span style="margin:0 8px;">,</span>' : '') + fracBoxes('kn-t' + i, 'kn-n' + i); }
          var text;
          if(u.typ === 'taljare') text = 'Skriv ett bråk större än en halv men mindre än 1, där <strong>täljaren är ' + u.param + '</strong>.';
          else if(u.typ === 'namnare') text = 'Skriv ett bråk större än en halv men mindre än 1, där <strong>nämnaren är ' + u.param + '</strong>.';
          else text = 'Skriv <strong>tre olika</strong> bråk som var för sig gör att ' + frac(2, 3) + ' + ditt bråk blir mindre än 1.';
          function las(){ var s = []; for(var i = 0; i < u.antal; i++){ s.push({ t: parseInt(valFor('kn-t' + i), 10), n: parseInt(valFor('kn-n' + i), 10) }); } return s; }
          var facit = u.facitEx.map(function(f){ return frac(f[0], f[1]); }).join(' &nbsp; ');
          return {
            fragaHtml: text + '<div style="margin-top:12px;">' + boxes + '</div>',
            facitText: 'T.ex. ' + facit,
            faltRatt: function(f){ for(var i = 0; i < u.antal; i++){ if(f.classList.contains('kn-t' + i) || f.classList.contains('kn-n' + i)){ var t = parseInt(valFor('kn-t' + i), 10), n = parseInt(valFor('kn-n' + i), 10); return !!(isFinite(t) && isFinite(n) && n > 0 && u.test(t, n)); } } return false; },
            check: function(){ return validera(u, las()).ok; }
          };
        } });
    };
  }
})();
