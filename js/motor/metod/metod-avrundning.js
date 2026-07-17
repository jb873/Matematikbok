/* ============================================================
   FAMILJ B · MOTOR: avr-motorerna (avrundning: Avrundning/Overslag + sub-renderare (Narmevarde/Helatal/Decimaltal) (AI-matris EXKLUDERAD))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderAvrAvrundning(body){
  var KAT = [
    {id:'narmevarde', nr:1, namn:'Begreppet närmevärde', desc:'Vilket tal är ett rimligt närmevärde till uträkningen?'},
    {id:'helatal',    nr:2, namn:'Avrunda hela tal',     desc:'Avrunda till tiotal, hundratal och tusental.'},
    {id:'decimaltal', nr:3, namn:'Avrunda decimaltal',   desc:'Avrunda till ental, tiondel och hundradel.'}
  ];
  avrPicker(body, 'Avrundning', 'Välj vad du vill öva på. Nivån anpassar sig medan du räknar.',
    KAT, function(katId, backFn){
      if(katId === 'narmevarde'){
        renderAvrNarmevarde(body, backFn);
      } else if(katId === 'helatal'){
        renderAvrHelatal(body, backFn);
      } else {
        renderAvrDecimaltal(body, backFn);
      }
    });
}

// ---- KO 1: BEGREPPET NÄRMEVÄRDE (flervalsövning) ----
function renderAvrNarmevarde(body, backFn){
  var level = 1, omgangResults = [], OMG = 6;
  function genTask(){
    // skapa en uträkning, ett korrekt närmevärde + fyra distraktorer
    var op, a, b, exact, label;
    if(level === 1){
      op = randPick(['+','−']);
      a = d3RandInt(120, 880); b = d3RandInt(110, 480);
      if(op === '−'){
        if(a < b){ var tmp=a; a=b; b=tmp; }
        exact = a - b;
      } else {
        exact = a + b;
      }
      label = a + ' ' + op + ' ' + b;
    } else if(level === 2){
      op = '·';
      a = d3RandInt(18, 79); b = d3RandInt(12, 69);
      exact = a * b;
      label = a + ' · ' + b;
    } else {
      op = randPick(['·','+']);
      if(op === '·'){
        a = d3RandInt(210, 690); b = d3RandInt(11, 49);
        exact = a * b; label = a + ' · ' + b;
      } else {
        a = d3RandInt(1100, 8800); b = d3RandInt(900, 4800);
        exact = a + b; label = a + ' + ' + b;
      }
    }
    // rätt närmevärde: avrunda till en lämplig storleksordning
    var mag = Math.pow(10, Math.max(1, String(Math.round(exact)).length - 2));
    var correct = avrAvrunda(exact, mag);
    // distraktorer
    var set = {}; set[correct] = true;
    var opts = [correct];
    var guard = 0;
    while(opts.length < 5 && guard < 200){
      guard++;
      var typ = randPick(['fel-mag','grannvärde','exakt-fel','sifferomkast']);
      var cand;
      if(typ === 'fel-mag') cand = avrAvrunda(exact, mag * 10);
      else if(typ === 'grannvärde') cand = correct + mag * randPick([-2,-1,1,2]);
      else if(typ === 'exakt-fel') cand = avrAvrunda(exact * randPick([0.8,1.2,1.5]), mag);
      else cand = avrAvrunda(exact + d3RandInt(3,9) * mag, mag);
      if(cand > 0 && !set[cand]){ set[cand] = true; opts.push(cand); }
    }
    return {label:label, correct:correct, options:shuffle(opts)};
  }
  function render(task){
    var opts = task.options.map(function(v){
      return '<button class="avr-opt" data-v="' + v + '">' + avrNum(v) + '</button>';
    }).join('');
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Begreppet närmevärde',
          'Vilket tal är ett bra närmevärde till uträkningen? Välj det som ligger närmast.', level)
      + '<div class="avr-fraga"><span class="avr-expr">' + task.label + '</span></div>'
      + '<div class="avr-opt-grid">' + opts + '</div>'
      + '<div class="rakna-uppdela-feedback" id="narm-fb"></div>'
      + '<div style="margin-top:16px;text-align:center;">'
        + '<button class="btn subtle" id="narm-back">Tillbaka till avrundning</button>'
      + '</div>'
    + '</div>';
    document.getElementById('narm-back').onclick = backFn;
    var answered = false;
    body.querySelectorAll('.avr-opt').forEach(function(btn){
      btn.onclick = function(){
        if(answered) return;
        answered = true;
        var val = parseFloat(btn.dataset.v);
        var ok = Math.abs(val - task.correct) < 1e-6;
        body.querySelectorAll('.avr-opt').forEach(function(b){
          b.disabled = true;
          var bv = parseFloat(b.dataset.v);
          if(Math.abs(bv - task.correct) < 1e-6) b.classList.add('is-correct');
          else if(b === btn) b.classList.add('is-wrong');
        });
        var fb = document.getElementById('narm-fb');
        fb.className = 'rakna-uppdela-feedback show ' + (ok ? 'correct' : 'wrong');
        fb.textContent = ok
          ? 'Rätt! ' + task.label + ' ligger nära ' + avrNum(task.correct) + '.'
          : 'Inte riktigt. Bästa närmevärdet är ' + avrNum(task.correct) + '.';
        var ts = getTutorScore('avr-avrundning','begrepp');
        var tsG = getTutorScore('avr-avrundning','narmevarde');
        ts.total++; tsG.total++;
        if(ok){ ts.correct++; tsG.correct++; }
        omgangResults.push(ok);
        if(omgangResults.length >= OMG) setTimeout(showSummary, ok ? 1700 : 2900);
        else setTimeout(function(){ render(genTask()); }, ok ? 1700 : 2900);
      };
    });
  }
  function showSummary(){
    var right = omgangResults.filter(function(x){ return x; }).length;
    var total = omgangResults.length;
    var adj = adjustLevel(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Begreppet närmevärde', 'Du klarade ' + right + ' av ' + total + '.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="narm-tillbaka">Tillbaka till avrundning</button></div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults = []; render(genTask()); };
    document.getElementById('narm-tillbaka').onclick = backFn;
  }
  render(genTask());
}

// ---- Gemensam avrundningsmotor: "avrunda detta tal till X" ----
// cfg: {title, sub, koId, forKey, scoreKey, OMG, gen}
// gen(level) -> {n, step, posNamn, answer, ansText}
function avrRoundEngine(body, cfg, backFn){
  var level = 1, omgang = [], idx = 0, results = [], OMG = cfg.OMG || 6;
  function genOmgang(){
    var a = [], guard = 0;
    while(a.length < OMG && guard < 600){
      guard++;
      var task = cfg.gen(level);
      // Hoppa över tal som redan är avrundade till det aktuella platsvärdet
      // (då skulle uppgiften inte träna någon avrundning alls).
      var rest = task.n / task.step;
      if(Math.abs(rest - Math.round(rest)) < 1e-9) continue;
      // Undvik två snarlika tal i rad – kräv tydlig skillnad mot förra talet.
      if(a.length > 0){
        var prev = a[a.length - 1].n;
        var minGap = task.step * (task.step >= 1 ? 8 : 4);
        if(Math.abs(task.n - prev) < minGap) continue;
      }
      a.push(task);
    }
    // Fallback om filtret inte hann fylla omgången
    while(a.length < OMG) a.push(cfg.gen(level));
    return a;
  }
  function render(){
    if(idx >= omgang.length){
      var right = results.filter(function(x){ return x; }).length;
      var total = results.length;
      var adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.title, 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
        + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="avr-back">Tillbaka till avrundning</button></div>'
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; results = []; render();
      };
      document.getElementById('avr-back').onclick = backFn;
      return;
    }
    var task = omgang[idx];
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(cfg.title, cfg.sub, level)
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="avr-fraga">Avrunda <span class="avr-expr">' + avrNum(task.n) + '</span>'
        + ' till närmaste <strong>' + task.posNamn + '</strong>.</div>'
      + '<div class="rakna-svar-rad"><input type="text" class="rakna-svar-input" id="avr-input" inputmode="text" maxlength="12" autocomplete="off" placeholder="?"></div>'
      + '<div class="rakna-uppdela-feedback" id="avr-fb"></div>'
      + keypadHTML([','])
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="avr-check">Kontrollera</button>'
        + '<button class="btn subtle" id="avr-tillbaka">Tillbaka till avrundning</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var input = document.getElementById('avr-input');
    setTimeout(function(){ input.focus(); }, 50);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); check(); }
    });
    document.getElementById('avr-tillbaka').onclick = backFn;
    function check(){
      var fb = document.getElementById('avr-fb');
      fb.className = 'rakna-uppdela-feedback show';
      var stu = d3ParseNum(input.value);
      input.disabled = true;
      document.getElementById('avr-check').disabled = true;
      var ts = getTutorScore(cfg.koId, cfg.forKey);
      var tsG = getTutorScore(cfg.koId, cfg.scoreKey);
      ts.total++; tsG.total++;
      var ok = stu !== null && Math.abs(stu - task.answer) < 1e-6;
      if(ok){
        input.classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + avrNum(task.n) + ' avrundat blir ' + task.ansText + '.';
        ts.correct++; tsG.correct++;
      } else {
        input.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Inte rätt. ' + avrNum(task.n) + ' avrundat till ' + task.posNamn
          + ' blir ' + task.ansText + '.';
      }
      results.push(ok);
      setTimeout(function(){ idx++; render(); }, ok ? 1700 : 3000);
    }
    document.getElementById('avr-check').onclick = check;
  }
  omgang = genOmgang();
  render();
}

// ---- KO 1: AVRUNDA HELA TAL ----
function renderAvrHelatal(body, backFn){
  avrRoundEngine(body, {
    title:'Avrunda hela tal', koId:'avr-avrundning', forKey:'begrepp', scoreKey:'helatal',
    sub:'Titta på siffran efter platsvärdet: 5 eller mer rundar uppåt, mindre rundar nedåt.',
    OMG:6,
    gen:function(level){
      var step, posNamn, n;
      if(level === 1){ step = 10;   posNamn = 'tiotal';    n = d3RandInt(23, 989); }
      else if(level === 2){ step = 100;  posNamn = 'hundratal'; n = d3RandInt(212, 9849); }
      else { step = 1000; posNamn = 'tusental';  n = d3RandInt(2456, 89789); }
      var ans = avrAvrunda(n, step);
      return {n:n, step:step, posNamn:posNamn, answer:ans, ansText:avrNum(ans)};
    }
  }, backFn);
}

// ---- KO 1: AVRUNDA DECIMALTAL ----
function renderAvrDecimaltal(body, backFn){
  avrRoundEngine(body, {
    title:'Avrunda decimaltal', koId:'avr-avrundning', forKey:'begrepp', scoreKey:'decimaltal',
    sub:'Titta på siffran direkt efter den decimal du avrundar till.',
    OMG:6,
    gen:function(level){
      var n, step, posNamn, dec;
      if(level === 1){
        n = d3RandInt(11, 989) / 10; step = 1; posNamn = 'ental'; dec = 0;
      } else if(level === 2){
        n = d3RandInt(105, 9899) / 100; step = 0.1; posNamn = 'tiondel'; dec = 1;
      } else {
        n = d3RandInt(1015, 98999) / 1000; step = 0.01; posNamn = 'hundradel'; dec = 2;
      }
      var ans = avrAvrunda(n, step);
      return {n:n, step:step, posNamn:posNamn, answer:ans, ansText:avrFixed(ans, dec)};
    }
  }, backFn);
}

// ============================================================
// KO 2: ÖVERSLAGSRÄKNING  (byggs senare – platshållare)
// ============================================================
function renderAvrOverslag(body){
  body.innerHTML = '<div class="stub-card">'
    + '<h2>Överslagsräkning</h2>'
    + '<p>Den här övningen byggs inom kort. Då får du träna på att göra överslagsberäkningar '
    + 'i addition, subtraktion, multiplikation och division – genom att avrunda talen först '
    + 'och räkna med de enkla talen i huvudet.</p>'
    + '<div style="margin-top:18px;">'
      + '<button class="btn" onclick="navTo(\'del\',{delId:\'avrundning\'})">Tillbaka till delen</button>'
    + '</div>'
  + '</div>';
}

// ============================================================
// SJÄLVSKATTNINGSMATRIS – AVRUNDNING OCH ÖVERSLAGSRÄKNING
// ============================================================

