/* potens-drill.js — Åk8 potens-drillar (Färdighetsträning), GREENFIELD potens-motor.
   Laddas av ak7-k1-ram.html EFTER ramen → återanvänder ramens globala hjälpare
   (exerciseHeader, getTutorScore, adjustLevel, renderSummaryCard, d3ParseNum, keypadHTML,
   bindKeypad, renderScoreBarSimple, d3RandInt, randPick). Definierar INTE om dem.

   EN parametriserad harness renderPotDrill(body, cfg) + gen-funktioner per uppgiftstyp.
   Bas-strategin är en parameter (cfg.basFn) → tiopotenser (bas 10) och grundpotenser
   (fast bas) återanvänder EXAKT dessa gen-funktioner, bara med annan basFn. Två svarsstilar:
     'varde'    — svar = ett tal (evaluera/add-sub/lös-ut/resonemang/prio)
     'exp'      — svar = exponenten i bas^▢ (exponent-lagen mult/div, skriv som potens)
   Facit räknas ur uppgiften (korrekt per konstruktion); fuzz + runs-test verifierar. */
(function(){
  'use strict';
  function ri(a, b){ return (typeof d3RandInt === 'function') ? d3RandInt(a, b) : (a + Math.floor(Math.random() * (b - a + 1))); }
  function pick(arr){ return (typeof randPick === 'function') ? randPick(arr) : arr[Math.floor(Math.random() * arr.length)]; }
  function pot(b, e){ return '<span class="pot">' + b + '<sup>' + e + '</sup></span>'; }
  function dec(x){ return (Math.round(x * 1e9) / 1e9).toString().replace('.', ','); }

  // ── Bas-strategier (parametern som gör dk 9/10 gratis) ──
  function basFri(){ return ri(2, 9); }         // dk 8: godtycklig bas
  // (dk 9: () => 10 ; dk 10: () => FAST — anropas från framtida render-wrappers)

  // ══════════════════════════════════════════════════════════════════════════════════════
  // GENERATORER — var och en returnerar { display, bas?, answerNum, answerStr }
  // ══════════════════════════════════════════════════════════════════════════════════════

  // Evaluera potens (värde). Level skalar bas/exp; värde hålls ≤ ~1000.
  function genEvaluera(level, basFn){
    basFn = basFn || basFri;
    for(var i = 0; i < 40; i++){
      var b = basFn(), e = ri(2, 2 + Math.min(level, 2));   // exp 2–4
      if(level === 1 && Math.random() < 0.25) b = pick([0, 1]);
      var v = Math.pow(b, e);
      if(v <= 1000) return { display: pot(b, e), answerNum: v, answerStr: '' + v };
    }
    return { display: pot(2, 3), answerNum: 8, answerStr: '8' };
  }

  // Add/sub & blandat — EVALUERA-SEDAN-OPERERA. Värden ≤ ~125, resultat får bli negativt.
  function genAddsub(level, basFn){
    basFn = basFn || basFri;
    var b1 = basFn(), e1 = ri(2, 3), b2 = basFn(), e2 = ri(2, 3);
    while(Math.pow(b1, e1) > 130) e1 = ri(2, 3);
    while(Math.pow(b2, e2) > 130) e2 = ri(2, 3);
    var v1 = Math.pow(b1, e1), v2 = Math.pow(b2, e2), op = pick(['+', '−']);
    var ans = op === '+' ? v1 + v2 : v1 - v2;
    return { display: pot(b1, e1) + ' ' + op + ' ' + pot(b2, e2), answerNum: ans, answerStr: '' + ans };
  }

  // Mult/div samma bas — EXPONENT-LAG. Svar = resultatets exponent (bas^▢).
  function genMultdiv(level, basFn){
    basFn = basFn || basFri;
    var b = basFn(), typ = pick(['mult', 'div', 'blandat']), display, resExp;
    if(typ === 'mult'){
      var m = ri(2, 7), n = ri(2, 7); while(m + n > 12){ m = ri(2, 7); n = ri(2, 7); }
      display = pot(b, m) + ' · ' + pot(b, n); resExp = m + n;
    } else if(typ === 'div'){
      var mm = ri(5, 12), nn = ri(2, mm - 1); if(mm - nn > 9) nn = mm - ri(1, 9);
      display = pot(b, mm) + ' / ' + pot(b, nn); resExp = mm - nn;
    } else {
      var p = ri(2, 6), q = ri(2, 6), r = ri(2, Math.min(p + q - 1, 8));
      display = '(' + pot(b, p) + ' · ' + pot(b, q) + ') / ' + pot(b, r); resExp = p + q - r;
    }
    return { display: display, bas: b, answerNum: resExp, answerStr: b + '^' + resExp };
  }

  // Lös ut basen eller exponenten (värde).
  function genLosut(level, basFn){
    basFn = basFn || basFri;
    if(Math.random() < 0.5){
      var b = ri(2, 9), e = ri(2, 5); while(Math.pow(b, e) > 100000){ b = ri(2, 9); e = ri(2, 5); }
      return { display: pot('x', e) + ' = ' + Math.pow(b, e) + ',&nbsp; x', answerNum: b, answerStr: '' + b };
    }
    var bb = pick([2, 3, 4, 5, 10]), x = ri(0, 4);
    return { display: pot(bb, 'x') + ' = ' + Math.pow(bb, x) + ',&nbsp; x', answerNum: x, answerStr: '' + x };
  }

  // Resonemang (värde).
  function genResonera(level){
    if(Math.random() < 0.5){
      var b = pick([2, 3, 5, 10]), e = ri(2, 4);
      return { display: 'Hur många faktorer ' + b + ' för att få ' + Math.pow(b, e) + '?', answerNum: e, answerStr: '' + e };
    }
    var bb = pick([2, 3, 5, 7]), k = ri(2, 5);
    return { display: 'Hur många gånger större är ' + pot(bb, k + 1) + ' än ' + pot(bb, k) + '?', answerNum: bb, answerStr: '' + bb };
  }

  // Skriv som potens — svar = exponenten (basen given i multiplikationen).
  function genSkriva(level, basFn){
    basFn = basFn || basFri;
    var b = basFn(), e = ri(2, 6);
    var mult = []; for(var i = 0; i < e; i++) mult.push(b);
    return { display: mult.join(' · '), bas: b, answerNum: e, answerStr: b + '^' + e };
  }

  // Prioritering med potenser (värde, kan bli negativt) — knyter till negativa tal.
  function genPrio(level){
    var t = ri(0, 4);
    if(t === 0){ var a = ri(2, 5), b = ri(2, 4); return { display: '(' + a + ' · ' + b + ')<sup>2</sup>', answerNum: Math.pow(a * b, 2), answerStr: '' + Math.pow(a * b, 2) }; }
    if(t === 1){ var c = ri(2, 6), e = ri(2, 4); return { display: c + ' · ' + pot(2, e), answerNum: c * Math.pow(2, e), answerStr: '' + c * Math.pow(2, e) }; }
    if(t === 2){ var d = ri(3, 9), f = ri(2, 6), g = ri(2, 3); var v = d * 2 + Math.pow(f, g); return { display: d + ' · 2 + ' + pot(f, g), answerNum: v, answerStr: '' + v }; }
    if(t === 3){ var h = ri(15, 30), k = ri(3, 5); var v2 = h - Math.pow(k, 2); return { display: h + ' − ' + pot(k, 2), answerNum: v2, answerStr: '' + v2 }; }   // ofta negativt (som 25−6²)
    var m = ri(2, 6), n = ri(2, 4), p = (n === 2 ? ri(2, 3) : 2); var v3 = m + 4 * 2 - Math.pow(n, p); return { display: m + ' + 4 · 2 − ' + pot(n, p), answerNum: v3, answerStr: '' + v3 };   // potens ≤ 16 → resultat hålls rimligt
  }

  // ══════════════════════════════════════════════════════════════════════════════════════
  // HARNESS — kopierar renderRaknaSingle-mönstret (ramens globala hjälpare)
  // ══════════════════════════════════════════════════════════════════════════════════════
  function renderPotDrill(body, cfg){
    var level = 1, omgang = [], idx = 0, results = [], uppgNr = 0;
    function genOmgang(){ var o = []; for(var i = 0; i < 8; i++) o.push(cfg.gen(level, cfg.basFn)); return o; }
    function backFn(){ if(typeof navTo === 'function') navTo('kapitel'); }
    omgang = genOmgang();

    function render(){
      if(idx >= omgang.length){
        var right = results.filter(function(x){ return x; }).length, total = results.length;
        var adj = adjustLevel(level, right, total); level = adj.level;
        body.innerHTML = '<div class="exercise-card">'
          + exerciseHeader(cfg.header, 'Du klarade ' + right + ' av ' + total + '.', level)
          + renderSummaryCard({ right: right, total: total, level: level, levelChange: adj.change })
          + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="pot-back">Tillbaka</button></div>'
          + '</div>';
        document.getElementById('summary-next-btn').onclick = function(){ omgang = genOmgang(); idx = 0; results = []; render(); };
        document.getElementById('pot-back').onclick = backFn;
        return;
      }
      var task = omgang[idx]; uppgNr++;
      var svarHtml = cfg.svar === 'exp'
        ? '<span class="rakna-svar-fast">' + task.display + ' = <span class="pot">' + task.bas + '<sup><input type="text" class="rakna-svar-input" id="pot-input" inputmode="numeric" maxlength="4" style="width:2.6em;text-align:center;" autocomplete="off" placeholder="?"></sup></span></span>'
        : '<span class="rakna-svar-fast">' + task.display + ' =</span><input type="text" class="rakna-svar-input" id="pot-input" inputmode="text" maxlength="16" autocomplete="off" placeholder="?">';
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.header, cfg.sub, level)
        + renderScoreBarSimple(results.filter(function(x){ return x; }).length, results.filter(function(x){ return !x; }).length, omgang.length, idx)
        + '<div class="rakna-svar-rad">' + svarHtml + '</div>'
        + '<div class="rakna-uppdela-feedback" id="pot-fb"></div>'
        + keypadHTML(['−'])
        + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="btn primary" id="pot-check">Kontrollera</button>'
          + '<button class="btn subtle" id="pot-back2">Tillbaka</button>'
        + '</div></div>';
      var card = body.querySelector('.exercise-card');
      if(typeof bindKeypad === 'function') bindKeypad(card);
      var input = document.getElementById('pot-input');
      setTimeout(function(){ if(input) input.focus(); }, 50);
      input.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); check(); } });
      document.getElementById('pot-check').onclick = check;
      document.getElementById('pot-back2').onclick = backFn;

      function check(){
        var stu = d3ParseNum(input.value), fb = document.getElementById('pot-fb');
        fb.className = 'rakna-uppdela-feedback show'; input.disabled = true; document.getElementById('pot-check').disabled = true;
        var ts = getTutorScore(cfg.ko, cfg.formaga); ts.total++;
        var ok = false;
        if(stu === null){ fb.classList.add('wrong'); fb.textContent = 'Skriv ett tal.'; }
        else if(Math.abs(stu - task.answerNum) < 1e-6 * Math.max(1, Math.abs(task.answerNum))){
          ok = true; input.classList.add('correct'); fb.classList.add('correct'); fb.textContent = 'Rätt! Svar: ' + task.answerStr; ts.correct++;
        } else { input.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent = 'Inte rätt. Svar: ' + task.answerStr + '.'; }
        results.push(ok);
        setTimeout(function(){ idx++; render(); }, ok ? 1700 : 2600);
      }
    }
    render();
  }

  // ── Render-wrappers (dk 8: basFri). Wire:as i ramens OVNING_RENDERS. ──
  window.renderPotSkriva   = function(b){ renderPotDrill(b, { ko:'pot-begrepp', formaga:'skriva',   header:'Skriv som potens', sub:'Vilken exponent? Basen är given.', svar:'exp',   gen:genSkriva }); };
  window.renderPotEvaluera = function(b){ renderPotDrill(b, { ko:'pot-begrepp', formaga:'evaluera', header:'Beräkna potensens värde', sub:'Räkna ut värdet.', svar:'varde', gen:genEvaluera }); };
  window.renderPotAddsub   = function(b){ renderPotDrill(b, { ko:'pot-addsub',  formaga:'rakna',    header:'Addition och subtraktion', sub:'Räkna ut varje potens, operera sedan.', svar:'varde', gen:genAddsub }); };
  window.renderPotMultdiv  = function(b){ renderPotDrill(b, { ko:'pot-multdiv', formaga:'rakna',    header:'Multiplikation och division', sub:'Behåll basen, operera på exponenterna.', svar:'exp', gen:genMultdiv }); };
  window.renderPotLosut    = function(b){ renderPotDrill(b, { ko:'pot-multdiv', formaga:'losut',    header:'Lös ut basen eller exponenten', sub:'Vilket tal ska x vara?', svar:'varde', gen:genLosut }); };
  window.renderPotResonera = function(b){ renderPotDrill(b, { ko:'pot-multdiv', formaga:'resonera', header:'Resonemang om potenser', sub:'Tänk på vad potensen betyder.', svar:'varde', gen:genResonera }); };
  window.renderPotPrio     = function(b){ renderPotDrill(b, { ko:'prio-potenser', formaga:'rakna',  header:'Prioritering med potenser', sub:'Tänk på prioriteringsreglerna. Svaret kan bli negativt.', svar:'varde', gen:genPrio }); };

  // Exponera gen-funktionerna för fuzz/runs-test.
  window.__POT_GEN = { genEvaluera:genEvaluera, genAddsub:genAddsub, genMultdiv:genMultdiv, genLosut:genLosut, genResonera:genResonera, genSkriva:genSkriva, genPrio:genPrio };
})();
