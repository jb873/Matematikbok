/* kvrot-drill.js — Åk8 kvadrat/rot-drillar (Färdighetsträning), delkapitel 11.
   Laddas av ak7-k1-ram.html EFTER ramen → återanvänder ramens globala hjälpare
   (exerciseHeader, getTutorScore, adjustLevel, renderSummaryCard, d3ParseNum, keypadHTML,
   bindKeypad, renderScoreBarSimple, d3RandInt, randPick). Definierar INTE om dem.

   EN parametriserad harness renderKvrotDrill(body, cfg) + gen-funktioner per färdighet.
   Två svarsstilar:
     'varde'  — svar = ett tal (area, kvadrera, skala, sida, beräkna rot, decimal, närmevärde)
     'tva'    — svar = två heltal (mellan vilka heltal roten ligger)
   Facit räknas ur uppgiften (korrekt per konstruktion; fuzz verifierar). Talurvalet speglar
   Joachims öva-dokument och går aldrig svårare (takregeln). ko/formaga = taxonomi-nod (ko:rakna),
   samma nod åk8+åk9 → evidens följer eleven (beslut a). */
(function(){
  'use strict';
  function ri(a, b){ return (typeof d3RandInt === 'function') ? d3RandInt(a, b) : (a + Math.floor(Math.random() * (b - a + 1))); }
  function pick(arr){ return (typeof randPick === 'function') ? randPick(arr) : arr[Math.floor(Math.random() * arr.length)]; }
  function komma(x){ return (Math.round(x * 1e9) / 1e9).toString().replace('.', ','); }
  function avr(x, d){ var p = Math.pow(10, d); return Math.round(x * p) / p; }
  function perfekt(x){ var r = Math.round(Math.sqrt(x)); return r * r === x; }
  // Radikal med vinculum (streck ÖVER radikanden) — inline-stil så den funkar utan delkapitlets CSS.
  function rot(x){ return '√<span style="border-top:1.6px solid currentColor;padding:1px 3px 0;">' + x + '</span>'; }
  function sup2(x){ return x + '<sup>2</sup>'; }
  // Nivå-styrd pool: L1 = t1, L2 = t1+t2, L3+ = t1+t2+t3 (fler/svårare tal högre upp, aldrig över taket).
  function byLevel(level, t1, t2, t3){ var a = t1.slice(); if(level >= 2) a = a.concat(t2); if(level >= 3) a = a.concat(t3); return a; }

  // ══════════════════════════════════════════════════════════════════════════════════════
  // GENERATORER — var och en returnerar { display, answerNum, answerStr } (+ lo/hi för 'tva')
  // ══════════════════════════════════════════════════════════════════════════════════════

  // 1) Area från sidan (med enhet). answer = sida².
  function genArea(level){
    var bank = byLevel(level,
      [[2,'dm'],[3,'dm'],[4,'dm'],[5,'dm'],[6,'dm'],[7,'dm'],[8,'dm'],[9,'dm']],
      [[20,'cm'],[30,'cm'],[40,'cm'],[50,'cm'],[60,'dm'],[70,'dm'],[80,'dm'],[90,'dm']],
      [[0.2,'m'],[0.3,'m'],[0.4,'m'],[0.5,'m'],[200,'cm'],[300,'cm'],[400,'cm'],[500,'cm']]);   // ≥8 distinkta per nivå (distinkt omgång kräver det)
    var b = pick(bank), s = b[0], u = b[1], v = avr(s * s, 4);
    return { display: 'En kvadrat har sidan ' + komma(s) + ' ' + u + '. Arean (' + u + '²) =', answerNum: v, answerStr: komma(v) + ' ' + u + '²' };
  }
  // 2) Kvadrera talet. answer = n².
  function genKvadrera(level){
    var bank = byLevel(level,
      [2,3,4,5,6,7,8,9,10,11,12],
      [13,14,15,20,30,40,50],
      [0.1,0.2,0.3,0.5,0.9]);
    var n = pick(bank), v = avr(n * n, 2);
    return { display: sup2(komma(n)) + ' =', answerNum: v, answerStr: komma(v) };
  }
  // 3) Skala ett känt kvadrattal. answer = (skalad bas)².
  function genSkala(level){
    var N = pick(byLevel(level, [11, 12, 13, 14, 15], [], [16, 17, 18, 19, 20])), sq = N * N;
    var vlist = byLevel(level, [N / 10, N * 10], [N / 100], []);   // L1: 5 N × 2 = 10 distinkta
    var v = pick(vlist), ans = avr(v * v, 6);
    return { display: 'Du vet att ' + sup2(N) + ' = ' + sq + '. Beräkna ' + sup2(komma(v)) + ' =', answerNum: ans, answerStr: komma(ans) };
  }
  // 4) Sidan från arean (med enhet). answer = √area.
  function genSida(level){
    var bank = byLevel(level,
      [[4,'cm'],[9,'cm'],[16,'cm'],[25,'cm'],[36,'cm'],[49,'cm'],[64,'cm'],[81,'cm']],
      [[100,'cm'],[121,'cm'],[144,'cm'],[400,'cm'],[900,'dm'],[2500,'cm']],
      [[0.81,'m'],[0.25,'m'],[0.49,'m'],[1.44,'m']]);
    var b = pick(bank), a = b[0], u = b[1], v = avr(Math.sqrt(a), 2);
    return { display: 'En kvadrat har arean ' + komma(a) + ' ' + u + '². Sidan (' + u + ') =', answerNum: v, answerStr: komma(v) + ' ' + u };
  }
  // 5) Beräkna kvadratrot (perfekt kvadrat). answer = √n.
  function genBerakna(level){
    var bank = byLevel(level,
      [1,4,9,16,25,36,49,64,81,100],
      [121,144,169,196,225],
      [256,400,625,900]);
    var n = pick(bank), v = Math.sqrt(n);
    return { display: rot(n) + ' =', answerNum: v, answerStr: '' + v };
  }
  // 6) Mellan vilka heltal (icke-perfekt). svar:'tva'. lo = ⌊√n⌋, hi = lo+1.
  function genUppskatta(level){
    var max = level >= 3 ? 99 : (level >= 2 ? 50 : 15), n, t = 0;
    do { n = ri(2, max); t++; } while(perfekt(n) && t < 60);
    var lo = Math.floor(Math.sqrt(n));
    return { display: rot(n) + ' ligger mellan', lo: lo, hi: lo + 1, answerNum: null, answerStr: lo + ' och ' + (lo + 1) };
  }
  // 7) Kvadratrot ur decimaltal (perfekt). answer = √rad.
  function genDecimal(level){
    var bank = byLevel(level,
      [[0.04,0.2],[0.09,0.3],[0.16,0.4],[0.25,0.5],[0.36,0.6],[0.49,0.7],[0.64,0.8],[0.81,0.9]],
      [[0.01,0.1],[1.44,1.2],[1.21,1.1],[1.69,1.3],[1600,40],[900,30]],
      [[2.25,1.5],[0.0004,0.02],[0.0009,0.03],[6400,80]]);
    var b = pick(bank);
    return { display: rot(komma(b[0])) + ' =', answerNum: b[1], answerStr: komma(b[1]) };
  }
  // 8) Närmevärde med räknare, 2 decimaler (icke-perfekt). answer = avr(√n, 2).
  function genNarmevarde(level){
    var bank = byLevel(level,
      [2,5,6,7,8,10,11,12],   // PASS 2: samma golv som öva/test — inget under 5 utom √2 (8 distinkta för omgången)
      [13,14,15,17,18,19,20,21,22,23,24],
      [26,27,28,29,30,33,35,37,40,41,42,43,44,45,46,47,48,50,51,52,53,55,60,71,83,90]);
    var n, t = 0;
    do { n = pick(bank); t++; } while(perfekt(n) && t < 60);
    var v = avr(Math.sqrt(n), 2);
    return { display: rot(n) + ' ≈', answerNum: v, answerStr: komma(v) };
  }

  // ══════════════════════════════════════════════════════════════════════════════════════
  // HARNESS — samma mönster som potens-drillens renderPotDrill (ramens globala hjälpare)
  // ══════════════════════════════════════════════════════════════════════════════════════
  function renderKvrotDrill(body, cfg){
    var level = 1, omgang = [], idx = 0, results = [], uppgNr = 0;
    // FAS 3: ingen uppgift upprepas inom omgången — distinktOmgang (ramens kontrakt), nyckel = display.
    function genOmgang(){ return distinktOmgang(function(){ return cfg.gen(level); }, 8, function(t){ return t.display; }); }
    function backFn(){ if(typeof navTo === 'function') navTo('kapitel'); }
    omgang = genOmgang();

    function render(){
      if(idx >= omgang.length){
        var right = results.filter(function(x){ return x; }).length, total = results.length;
        var adj = adjustLevel(level, right, total); level = adj.level;
        body.innerHTML = '<div class="exercise-card">'
          + exerciseHeader(cfg.header, 'Du klarade ' + right + ' av ' + total + '.', level)
          + renderSummaryCard({ right: right, total: total, level: level, levelChange: adj.change })
          + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="kv-back">Tillbaka</button></div>'
          + '</div>';
        document.getElementById('summary-next-btn').onclick = function(){ omgang = genOmgang(); idx = 0; results = []; render(); };
        document.getElementById('kv-back').onclick = backFn;
        return;
      }
      var task = omgang[idx]; uppgNr++;
      var svarHtml = cfg.svar === 'tva'
        ? '<span class="rakna-svar-fast">' + task.display + ' </span>'
          + '<input type="text" class="rakna-svar-input" id="kv-lo" inputmode="numeric" maxlength="4" style="width:3em;text-align:center;" autocomplete="off" placeholder="?">'
          + '<span style="margin:0 8px;">och</span>'
          + '<input type="text" class="rakna-svar-input" id="kv-hi" inputmode="numeric" maxlength="4" style="width:3em;text-align:center;" autocomplete="off" placeholder="?">'
        : '<span class="rakna-svar-fast">' + task.display + ' </span><input type="text" class="rakna-svar-input" id="kv-input" inputmode="text" maxlength="16" autocomplete="off" placeholder="?">';
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.header, cfg.sub, level)
        + renderScoreBarSimple(results.filter(function(x){ return x; }).length, results.filter(function(x){ return !x; }).length, omgang.length, idx)
        + '<div class="rakna-svar-rad">' + svarHtml + '</div>'
        + '<div class="rakna-uppdela-feedback" id="kv-fb"></div>'
        + keypadHTML(cfg.keypadOps || [','])
        + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="btn primary" id="kv-check">Kontrollera</button>'
          + '<button class="btn subtle" id="kv-back2">Tillbaka</button>'
        + '</div></div>';
      var card = body.querySelector('.exercise-card');
      if(typeof bindKeypad === 'function') bindKeypad(card);
      var input = document.getElementById(cfg.svar === 'tva' ? 'kv-lo' : 'kv-input');
      setTimeout(function(){ if(input) input.focus(); }, 50);
      input.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); check(); } });
      document.getElementById('kv-check').onclick = check;
      document.getElementById('kv-back2').onclick = backFn;

      function check(){
        var fb = document.getElementById('kv-fb');
        fb.className = 'rakna-uppdela-feedback show';
        document.getElementById('kv-check').disabled = true;
        var ts = getTutorScore(cfg.ko, cfg.formaga); ts.total++;
        var ok = false;
        if(cfg.svar === 'tva'){
          var loEl = document.getElementById('kv-lo'), hiEl = document.getElementById('kv-hi');
          var lo = d3ParseNum(loEl.value), hi = d3ParseNum(hiEl.value);
          loEl.disabled = true; hiEl.disabled = true;
          if(lo === null || hi === null){ fb.classList.add('wrong'); fb.textContent = 'Fyll i båda heltalen.'; }
          else if(lo === task.lo && hi === task.hi){ ok = true; loEl.classList.add('correct'); hiEl.classList.add('correct'); fb.classList.add('correct'); fb.innerHTML = 'Rätt! Svar: ' + task.answerStr; ts.correct++; }
          else { loEl.classList.add('wrong'); hiEl.classList.add('wrong'); fb.classList.add('wrong'); fb.innerHTML = 'Inte rätt. Svar: ' + task.answerStr + '.'; }
        } else {
          var stu = d3ParseNum(input.value); input.disabled = true;
          if(stu === null){ fb.classList.add('wrong'); fb.textContent = 'Skriv ett tal.'; }
          else if(Math.abs(stu - task.answerNum) < 1e-6 * Math.max(1, Math.abs(task.answerNum))){ ok = true; input.classList.add('correct'); fb.classList.add('correct'); fb.innerHTML = 'Rätt! Svar: ' + task.answerStr; ts.correct++; }
          else { input.classList.add('wrong'); fb.classList.add('wrong'); fb.innerHTML = 'Inte rätt. Svar: ' + task.answerStr + '.'; }
        }
        results.push(ok);
        setTimeout(function(){ idx++; render(); }, ok ? 1700 : 2600);
      }
    }
    render();
  }

  // ── Render-wrappers (wire:as i ramens OVNING_RENDERS). ko = taxonomi-ko, formaga = 'rakna'. ──
  window.renderKvArea       = function(b){ renderKvrotDrill(b, { ko:'kvadrat-area',  formaga:'rakna', header:'Area från sidan',        sub:'Sidan i kvadrat ger arean.',                svar:'varde', gen:genArea }); };
  window.renderKvKvadrera   = function(b){ renderKvrotDrill(b, { ko:'kvadrat-rakna', formaga:'rakna', header:'Kvadrera talet',         sub:'Multiplicera talet med sig självt.',        svar:'varde', gen:genKvadrera }); };
  window.renderKvSkala      = function(b){ renderKvrotDrill(b, { ko:'kvadrat-skala', formaga:'rakna', header:'Skala ett kvadrattal',   sub:'Använd det kända kvadrattalet.',            svar:'varde', gen:genSkala }); };
  window.renderKvSida       = function(b){ renderKvrotDrill(b, { ko:'rot-sida',      formaga:'rakna', header:'Sidan från arean',       sub:'Sidan är kvadratroten ur arean.',           svar:'varde', gen:genSida }); };
  window.renderKvBerakna    = function(b){ renderKvrotDrill(b, { ko:'rot-berakna',   formaga:'rakna', header:'Beräkna kvadratroten',   sub:'Vilket tal gånger sig självt ger radikanden?', svar:'varde', gen:genBerakna }); };
  window.renderKvUppskatta  = function(b){ renderKvrotDrill(b, { ko:'rot-uppskatta', formaga:'rakna', header:'Mellan vilka heltal',    sub:'Mellan vilka två närliggande heltal ligger roten?', svar:'tva', keypadOps:[], gen:genUppskatta }); };
  window.renderKvDecimal    = function(b){ renderKvrotDrill(b, { ko:'rot-decimal',   formaga:'rakna', header:'Kvadratrot ur decimaltal', sub:'Tänk på hur många decimaler svaret får.',   svar:'varde', gen:genDecimal }); };
  window.renderKvNarmevarde = function(b){ renderKvrotDrill(b, { ko:'rot-narmevarde', formaga:'rakna', header:'Närmevärde med räknare',  sub:'Använd räknare. Avrunda till två decimaler.', svar:'varde', gen:genNarmevarde }); };

  // Exponera gen-funktionerna för fuzz/verifiering.
  window.__KVROT_GEN = { genArea:genArea, genKvadrera:genKvadrera, genSkala:genSkala, genSida:genSida, genBerakna:genBerakna, genUppskatta:genUppskatta, genDecimal:genDecimal, genNarmevarde:genNarmevarde, perfekt:perfekt, avr:avr };
})();
