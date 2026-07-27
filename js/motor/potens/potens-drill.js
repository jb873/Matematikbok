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

  // Potenssvar med NEGATIV-exponent-kapacitet: a^(−k) = 1/a^k (stående bråk).
  // Motorn KAN detta; talurvalet avgör om det används (potenser/tiopotenser: nej; negativa-potenser: ja).
  function potSvarStr(bas, exp){ return exp >= 0 ? bas + '^' + exp : '1/' + bas + '^' + (-exp); }
  function potSvarHtml(bas, exp){ return exp >= 0 ? pot(bas, exp) : (typeof window.fracSpan === 'function' ? window.fracSpan(1, pot(bas, -exp)) : '1/' + pot(bas, -exp)); }

  // ── Bas-strategier (parametern som gör dk 9/10 gratis) ──
  function basFri(){ return ri(2, 9); }         // dk 8: godtycklig bas
  function basTio(){ return 10; }               // dk 9: tiopotenser

  // ── DELAD EXPONENTKÄRNA (dk 8/9/10): mult → m+n, div → m−n. Anropas av genMultdiv
  //    (potens/tiopotens) OCH grundpotens-generatorerna → återanvänd, inte kopierad. ──
  function expLag(m, n, op){ return op === 'div' ? m - n : m + n; }

  // ── GRUNDPOTENS-LAGER (dk 10, a·10ⁿ): koefficient-dimension + normalisering ovanpå kärnan ──
  function gpRound(x){ return Math.round(x * 1e9) / 1e9; }
  // Normalisering: flytta koeff till [1,10), justera exponent. normaliserad = om något flyttades.
  function normalisera(koeff, exp){
    var flyttar = 0;
    while(koeff >= 10){ koeff = gpRound(koeff / 10); exp++; flyttar++; }
    while(koeff > 0 && koeff < 1){ koeff = gpRound(koeff * 10); exp--; flyttar++; }
    return { koeff: koeff, exp: exp, normaliserad: flyttar > 0 };
  }
  function gpKoeff(){ return pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 1.5, 2.5, 3.5, 4.5, 7.5]); }
  function gp(k, e){ return dec(k) + '·' + pot(10, e); }   // rendera a·10ⁿ (koeff vänsterställt, tiopotens upphöjt)

  // ══════════════════════════════════════════════════════════════════════════════════════
  // GENERATORER — var och en returnerar { display, bas?, answerNum, answerStr }
  // ══════════════════════════════════════════════════════════════════════════════════════

  // Evaluera potens (värde). Level skalar bas/exp; värde hålls ≤ valMax. opts styr bas-10-vidd.
  function genEvaluera(level, basFn, opts){
    basFn = basFn || basFri; opts = opts || {};
    var eMin = opts.expMin != null ? opts.expMin : 2, eMax = opts.expMax || (2 + Math.min(level, 2)), vMax = opts.valMax || 1000;
    for(var i = 0; i < 40; i++){
      var b = basFn(), e = ri(eMin, eMax);
      if(level === 1 && opts.expMin == null && Math.random() < 0.25) b = pick([0, 1]);
      var v = Math.pow(b, e);
      if(v <= vMax) return { display: pot(b, e), answerNum: v, answerStr: '' + v };
    }
    return { display: pot(2, 3), answerNum: 8, answerStr: '8' };
  }

  // Add/sub & blandat — EVALUERA-SEDAN-OPERERA. Resultat får bli negativt. opts vidgar bas-10-range.
  function genAddsub(level, basFn, opts){
    basFn = basFn || basFri; opts = opts || {};
    var eMax = opts.expMax || 3, vMax = opts.valMax || 130;
    var b1 = basFn(), e1 = ri(2, eMax), b2 = basFn(), e2 = ri(2, eMax);
    while(Math.pow(b1, e1) > vMax) e1 = ri(2, eMax);
    while(Math.pow(b2, e2) > vMax) e2 = ri(2, eMax);
    var v1 = Math.pow(b1, e1), v2 = Math.pow(b2, e2), op = pick(['+', '−']);
    var ans = op === '+' ? v1 + v2 : v1 - v2;
    return { display: pot(b1, e1) + ' ' + op + ' ' + pot(b2, e2), answerNum: ans, answerStr: '' + ans };
  }

  // Mult/div samma bas — EXPONENT-LAG. Svar = resultatets exponent (bas^▢).
  // opts.neg: FÖRDJUPNING — tillåt div med m<n → negativ exponent (1/a^k). Spärrat i talurvalet
  // för potenser/tiopotenser (motorn kan, ombeds inte); negativa-potenser lättar bara villkoret.
  function genMultdiv(level, basFn, opts){
    basFn = basFn || basFri; opts = opts || {};
    var b = basFn(), typ = pick(['mult', 'div', 'blandat']), display, resExp;
    if(typ === 'mult'){
      var m = ri(2, 7), n = ri(2, 7); while(m + n > 12){ m = ri(2, 7); n = ri(2, 7); }
      display = pot(b, m) + ' · ' + pot(b, n); resExp = expLag(m, n, 'mult');
    } else if(typ === 'div'){
      var mm, nn;
      if(opts.neg){ mm = ri(2, 9); nn = ri(2, 9); }                                   // fördjupning: m<n tillåtet
      else { mm = ri(5, 12); nn = ri(2, mm - 1); if(mm - nn > 9) nn = mm - ri(1, 9); } // TALURVAL: m>n (positiv)
      display = pot(b, mm) + ' / ' + pot(b, nn); resExp = expLag(mm, nn, 'div');
    } else {
      var p = ri(2, 6), q = ri(2, 6), r = ri(2, Math.min(p + q - 1, 8));
      display = '(' + pot(b, p) + ' · ' + pot(b, q) + ') / ' + pot(b, r); resExp = expLag(expLag(p, q, 'mult'), r, 'div');
    }
    return { display: display, bas: b, answerNum: resExp, answerStr: potSvarStr(b, resExp), svarHtml: potSvarHtml(b, resExp) };
  }

  // Lös ut basen eller exponenten (värde). opts.baraExp → bara b^x=V med bas ur basFn (tiopotenser).
  function genLosut(level, basFn, opts){
    basFn = basFn || basFri; opts = opts || {};
    if(!opts.baraExp && Math.random() < 0.5){
      var b = ri(2, 9), e = ri(2, 5); while(Math.pow(b, e) > 100000){ b = ri(2, 9); e = ri(2, 5); }
      return { display: pot('x', e) + ' = ' + Math.pow(b, e) + ',&nbsp; x', answerNum: b, answerStr: '' + b };
    }
    var bb = opts.baraExp ? basFn() : pick([2, 3, 4, 5, 10]), x = ri(0, opts.baraExp ? 8 : 4);
    while(Math.pow(bb, x) > 1e9) x = ri(0, 6);
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
  // GRUNDPOTENS-GENERATORER (dk 10, a·10ⁿ) — exponentkärnan (expLag) återanvänd; koeff +
  // normalisering nytt. Svar-form 'gp' = paret (koeff, exp); add/sub → 'varde'.
  // ══════════════════════════════════════════════════════════════════════════════════════
  function frac(t, n){ return (typeof window.fracSpan === 'function') ? window.fracSpan(t, n) : '(' + t + ') / (' + n + ')'; }
  function gpVal(k, e){ return k * Math.pow(10, e); }

  // Mult: (a·10^m)·(b·10^n) = (a·b)·10^(m+n), normalisera.
  function genGpMult(level){
    var a = ri(1, 9), b = ri(1, 9), m = ri(2, 9), n = ri(2, 9); while(m + n > 18){ m = ri(2, 9); n = ri(2, 9); }
    var norm = normalisera(a * b, expLag(m, n, 'mult'));
    return { display: gp(a, m) + ' · ' + gp(b, n), koeff: norm.koeff, exp: norm.exp, normaliserad: norm.normaliserad, answerNum: gpVal(norm.koeff, norm.exp), answerStr: dec(norm.koeff) + '·10^' + norm.exp };
  }
  // Div: (a·10^m)/(b·10^n) = (a/b)·10^(m−n). Talurval: rent a/b (resultatet valt först).
  function genGpDiv(level){
    var rk = ri(1, 9), b = pick([2, 3, 5, 1.5, 2.5]), a = gpRound(rk * b), m = ri(6, 13), n = ri(2, m - 2);
    var norm = normalisera(rk, expLag(m, n, 'div'));
    return { display: frac(gp(a, m), gp(b, n)), koeff: norm.koeff, exp: norm.exp, normaliserad: norm.normaliserad, answerNum: gpVal(norm.koeff, norm.exp), answerStr: dec(norm.koeff) + '·10^' + norm.exp };
  }
  // Add/sub: kan ej exp-lag (olika 10-potenser) → EVALUERA båda till vanligt tal, operera.
  function genGpAddsub(level){
    var a = gpKoeff(), b = gpKoeff(), m = ri(3, 7), n = ri(2, m - 1), op = pick(['+', '−']);
    var A = gpVal(a, m), B = gpVal(b, n), ans = op === '+' ? A + B : A - B;
    return { display: gp(a, m) + ' ' + op + ' ' + gp(b, n), answerNum: ans, answerStr: dec(ans) };
  }
  // Skriva: vanligt tal → grundpotensform (svar 'gp'). Koeff normaliserad per konstruktion.
  function genGpSkriva(level){
    var a = gpKoeff(), n = ri(3, 8), v = gpVal(a, n);
    return { display: dec(v), koeff: a, exp: n, answerNum: v, answerStr: dec(a) + '·10^' + n };
  }
  // Lös ut x (mult): a·10^m · x = c·10^p → x = (c/a)·10^(p−m). x normaliserad.
  function genGpLosut(level){
    var ak = pick([2, 3, 4, 5]), xk = pick([2, 3, 4, 6]), am = ri(2, 5), xe = ri(3, 7);
    var cn = normalisera(ak * xk, expLag(am, xe, 'mult'));
    return { display: gp(ak, am) + ' · x = ' + gp(cn.koeff, cn.exp) + ',&nbsp; x', koeff: xk, exp: xe, answerNum: gpVal(xk, xe), answerStr: dec(xk) + '·10^' + xe };
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
        : cfg.svar === 'gp'
        ? '<span class="rakna-svar-fast">' + task.display + ' = <input type="text" class="rakna-svar-input" id="pot-koeff" inputmode="text" maxlength="6" style="width:3.2em;text-align:center;" autocomplete="off" placeholder="koeff">·<span class="pot">10<sup><input type="text" class="rakna-svar-input" id="pot-input" inputmode="numeric" maxlength="3" style="width:2.4em;text-align:center;" autocomplete="off" placeholder="?"></sup></span></span>'
        : '<span class="rakna-svar-fast">' + task.display + ' =</span><input type="text" class="rakna-svar-input" id="pot-input" inputmode="text" maxlength="16" autocomplete="off" placeholder="?">';
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.header, cfg.sub, level)
        + renderScoreBarSimple(results.filter(function(x){ return x; }).length, results.filter(function(x){ return !x; }).length, omgang.length, idx)
        + '<div class="rakna-svar-rad">' + svarHtml + '</div>'
        + '<div class="rakna-uppdela-feedback" id="pot-fb"></div>'
        + keypadHTML(cfg.keypadOps || ['−'])
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
        var stu = d3ParseNum(input.value), fb = document.getElementById('pot-fb'), koeffEl = document.getElementById('pot-koeff');
        fb.className = 'rakna-uppdela-feedback show'; input.disabled = true; if(koeffEl) koeffEl.disabled = true; document.getElementById('pot-check').disabled = true;
        var ts = getTutorScore(cfg.ko, cfg.formaga); ts.total++;
        var ok = false;
        if(cfg.svar === 'gp'){
          // FORM-MEDVETEN: koeff i [1,10) OCH koeff·10^exp = målvärdet (15·10¹⁷ underkänns → 1,5·10¹⁸)
          var koeff = d3ParseNum(koeffEl.value), exp = stu;
          if(koeff === null || exp === null){ fb.classList.add('wrong'); fb.textContent = 'Fyll i koefficient och exponent.'; }
          else if(koeff < 1 || koeff >= 10){ fb.classList.add('wrong'); fb.textContent = 'Koefficienten ska vara i grundpotensform (1–10). Svar: ' + task.answerStr + '.'; }
          else if(Math.abs(koeff * Math.pow(10, exp) - task.answerNum) < 1e-3 * Math.max(1, Math.abs(task.answerNum))){
            ok = true; input.classList.add('correct'); if(koeffEl) koeffEl.classList.add('correct'); fb.classList.add('correct'); fb.textContent = 'Rätt! Svar: ' + task.answerStr; ts.correct++;
          } else { input.classList.add('wrong'); if(koeffEl) koeffEl.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent = 'Inte rätt. Svar: ' + task.answerStr + '.'; }
        }
        else if(stu === null){ fb.classList.add('wrong'); fb.textContent = 'Skriv ett tal.'; }
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

  // ── TIOPOTENSER (dk 9): SAMMA motor, bara basFn:basTio (parametrisering, ingen kopierad motor). ──
  window.renderTioSkriva   = function(b){ renderPotDrill(b, { ko:'tio-rakna', formaga:'skriva',   header:'Skriv som tiopotens', sub:'Vilken exponent? Basen är 10.', svar:'exp',   gen:genSkriva,   basFn:basTio }); };
  window.renderTioEvaluera = function(b){ renderPotDrill(b, { ko:'tio-rakna', formaga:'evaluera', header:'Skriv som vanligt tal', sub:'Räkna ut värdet.', svar:'varde', gen:function(l, bf){ return genEvaluera(l, bf, { expMin:0, expMax:8, valMax:1e8 }); }, basFn:basTio }); };
  window.renderTioMultdiv  = function(b){ renderPotDrill(b, { ko:'tio-rakna', formaga:'rakna',    header:'Multiplikation och division', sub:'Behåll basen 10, operera på exponenterna.', svar:'exp', gen:genMultdiv, basFn:basTio }); };
  window.renderTioAddsub   = function(b){ renderPotDrill(b, { ko:'tio-rakna', formaga:'addsub',   header:'Addition och subtraktion', sub:'Räkna ut varje tiopotens, operera sedan.', svar:'varde', gen:function(l, bf){ return genAddsub(l, bf, { expMax:6, valMax:1e6 }); }, basFn:basTio }); };
  window.renderTioLosut    = function(b){ renderPotDrill(b, { ko:'tio-rakna', formaga:'losut',    header:'Lös ut exponenten', sub:'Vilket tal ska x vara?', svar:'varde', gen:function(l, bf){ return genLosut(l, bf, { baraExp:true }); }, basFn:basTio }); };

  // ── GRUNDPOTENSER (dk 10): SAMMA harness + exponentkärna (expLag), nytt koeff/normaliserings-lager.
  //    svar:'gp' = form-medveten (koeff·10^exp); keypad har ',' för decimalkoefficienter. ──
  window.renderGpSkriva  = function(b){ renderPotDrill(b, { ko:'gp-rakna', formaga:'skriva',   header:'Skriv i grundpotensform', sub:'Skriv talet som a·10ⁿ (1 ≤ a < 10).', svar:'gp', keypadOps:['−', ','], gen:genGpSkriva }); };
  window.renderGpMultdiv = function(b){ renderPotDrill(b, { ko:'gp-rakna', formaga:'multdiv',  header:'Multiplikation och division', sub:'Koeff × ; exponent + / −. Normalisera svaret.', svar:'gp', keypadOps:['−', ','], gen:function(l){ return Math.random() < 0.5 ? genGpMult(l) : genGpDiv(l); } }); };
  window.renderGpAddsub  = function(b){ renderPotDrill(b, { ko:'gp-rakna', formaga:'addsub',   header:'Addition och subtraktion', sub:'Räkna ut varje tal, operera sedan.', svar:'varde', keypadOps:['−', ','], gen:genGpAddsub }); };
  window.renderGpLosut   = function(b){ renderPotDrill(b, { ko:'gp-rakna', formaga:'losut',    header:'Vilket tal ska x vara?', sub:'Svara i grundpotensform.', svar:'gp', keypadOps:['−', ','], gen:genGpLosut }); };

  // Exponera gen-funktionerna + hjälparna för fuzz/runs-test.
  window.__POT_GEN = { genEvaluera:genEvaluera, genAddsub:genAddsub, genMultdiv:genMultdiv, genLosut:genLosut, genResonera:genResonera, genSkriva:genSkriva, genPrio:genPrio, basTio:basTio, potSvarStr:potSvarStr, potSvarHtml:potSvarHtml,
    expLag:expLag, normalisera:normalisera, genGpMult:genGpMult, genGpDiv:genGpDiv, genGpAddsub:genGpAddsub, genGpSkriva:genGpSkriva, genGpLosut:genGpLosut, gpVal:gpVal };
})();
