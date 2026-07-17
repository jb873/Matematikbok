/* ============================================================
   FAMILJ B · MOTOR: div-motorerna (division: Begrepp/BegreppRakna/Tabell/Metoder/Rakna/Problem + data + sub-renderare (AI-matris EXKLUDERAD))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

var DIV_BEGREPP_KORT = [
  {begrepp:'Täljare', exempel:'Täljaren är talet som ska delas. I 12 / 4 = 3 är 12 täljaren.',
   fraga:'I 12 / 4 = 3, vad heter talet 12?', svar:'Täljare', options:['Täljare','Nämnare','Kvot','Produkt']},
  {begrepp:'Nämnare', exempel:'Nämnaren är talet som man delar med. I 12 / 4 = 3 är 4 nämnaren.',
   fraga:'I 12 / 4 = 3, vad heter talet 4?', svar:'Nämnare', options:['Nämnare','Täljare','Kvot','Term']},
  {begrepp:'Kvot', exempel:'Kvoten är svaret på en division. I 12 / 4 = 3 är 3 kvoten.',
   fraga:'I 12 / 4 = 3, vad heter talet 3?', svar:'Kvot', options:['Kvot','Täljare','Nämnare','Summa']},
  {begrepp:'Täljare', exempel:'Talet som står överst i ett bråk, det som ska delas, kallas täljare.',
   fraga:'Vad heter talet som ska delas i en division?', svar:'Täljare', options:['Täljare','Nämnare','Kvot','Faktor']},
  {begrepp:'Nämnare', exempel:'Talet du delar med kallas nämnare.',
   fraga:'Vad heter talet som du delar med?', svar:'Nämnare', options:['Nämnare','Täljare','Kvot','Differens']},
  {begrepp:'Kvot', exempel:'Svaret på en division kallas kvot.',
   fraga:'Vad heter svaret på en division?', svar:'Kvot', options:['Kvot','Summa','Produkt','Differens']},
  {begrepp:'Täljare', exempel:'I bråket 30/6 är 30 täljaren – den står överst.',
   fraga:'I bråket 30/6, vad heter talet 30?', svar:'Täljare', options:['Täljare','Nämnare','Kvot','Term']},
  {begrepp:'Nämnare', exempel:'I bråket 30/6 är 6 nämnaren – den står underst.',
   fraga:'I bråket 30/6, vad heter talet 6?', svar:'Nämnare', options:['Nämnare','Täljare','Kvot','Faktor']},
  {begrepp:'Kvot', exempel:'"Täljare delat med nämnare är lika med kvot."',
   fraga:'"Täljare delat med nämnare är lika med ___." Vilket ord saknas?', svar:'Kvot', options:['Kvot','Term','Summa','Produkt']},
  {begrepp:'Nämnare', exempel:'Om nämnaren är 0 går divisionen inte att göra – man kan inte dela med noll.',
   fraga:'Vilket tal får aldrig vara 0 i en division?', svar:'Nämnare', options:['Nämnare','Täljare','Kvot','Inget av dem']},
  {begrepp:'Kvot', exempel:'45 / 9 = 5. Här är 5 kvoten.',
   fraga:'I 45 / 9 = 5, vad heter talet 5?', svar:'Kvot', options:['Kvot','Nämnare','Täljare','Summa']},
  {begrepp:'Täljare', exempel:'56 / 8 = 7. Här är 56 täljaren.',
   fraga:'I 56 / 8 = 7, vad heter talet 56?', svar:'Täljare', options:['Täljare','Nämnare','Kvot','Produkt']}
];

function renderDivBegrepp(body){
  // Ingen nivå-stege: bara ett övningsblad. Tycker man det är svårt → nytt blad.
  var omgang = [], idx = 0, omgangResults = [];
  function genOmgang(){ return shuffle(DIV_BEGREPP_KORT.slice()).slice(0, 8); }
  function render(){
    if(idx >= omgang.length){
      var right = omgangResults.filter(function(x){ return x; }).length;
      var total = omgangResults.length;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader('Begrepp · täljare, nämnare, kvot', 'Du klarade ' + right + ' av ' + total + '.')
        + renderSummaryCard({right:right, total:total, nextLabel:'Nytt övningsblad'})
        + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; omgangResults = []; render();
      };
      return;
    }
    var k = omgang[idx];
    var optBtns = shuffle(k.options.slice()).map(function(opt){
      return '<button class="fc-btn" data-val="' + opt + '">' + opt + '</button>';
    }).join('');
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Begrepp · täljare, nämnare, kvot', 'Välj rätt matematiskt begrepp.')
      + '<div class="flashcard">'
        + '<div class="flashcard-prompt" style="font-size:13px;margin-bottom:20px;">' + k.fraga + '</div>'
        + '<div class="flashcard-actions" id="fc-actions">' + optBtns + '</div>'
        + '<div class="flashcard-explanation" id="fc-exp"></div>'
        + '<div class="fc-progress">Fråga ' + (idx+1) + ' av ' + omgang.length + '</div>'
      + '</div>'
    + '</div>';
    var btns = document.querySelectorAll('#fc-actions .fc-btn');
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var correct = btn.dataset.val === k.svar;
        btn.classList.add(correct ? 'correct' : 'wrong');
        if(!correct){
          var rightBtn = document.querySelector('#fc-actions [data-val="' + k.svar + '"]');
          if(rightBtn) rightBtn.classList.add('correct');
        }
        document.getElementById('fc-exp').textContent = k.begrepp + ': ' + k.exempel;
        btns.forEach(function(b){ b.disabled = true; });
        omgangResults.push(correct);
        var ts = getTutorScore('div-begrepp','begrepp');
        ts.total++;
        if(correct) ts.correct++;
        setTimeout(function(){ idx++; render(); }, 1500);
      });
    });
  }
  omgang = genOmgang();
  render();
}

// ---- KO 1: RÄKNA (delbarhetsregler + talgåtor) ----
var DIV_REGLER = {
  '2':  {namn:'2',  test:function(n){ return n % 2 === 0; }},
  '3':  {namn:'3',  test:function(n){ return divDigSum(n) % 3 === 0; }},
  '5':  {namn:'5',  test:function(n){ return n % 5 === 0; }},
  '10': {namn:'10', test:function(n){ return n % 10 === 0; }},
  '4':  {namn:'4',  test:function(n){ return n % 4 === 0; }},
  '9':  {namn:'9',  test:function(n){ return divDigSum(n) % 9 === 0; }}
};

function renderDivBegreppRakna(body){
  var KATEGORIER = [
    {id:'del2510', nr:1, namn:'Delbarhet med 2, 3, 5 och 10', desc:'Hitta talen som följer delbarhetsreglerna.'},
    {id:'del49',   nr:2, namn:'Delbarhet med 4 och 9',        desc:'De lite klurigare delbarhetsreglerna.'},
    {id:'gata',    nr:3, namn:'Talgåtor',                     desc:'Vilket är talet? Lös gåtan med ledtrådar.'}
  ];
  function renderPicker(){
    var cards = '';
    for(var i=0; i<KATEGORIER.length; i++){
      var k = KATEGORIER[i];
      cards += '<button class="tabell-card" data-kat="' + k.id + '">'
        + '<div class="tabell-card-num">' + k.nr + '</div>'
        + '<div class="tabell-card-body">'
          + '<div class="tabell-card-namn">' + k.namn + '</div>'
          + '<div class="tabell-card-desc">' + k.desc + '</div>'
        + '</div>'
        + '<div style="color:var(--ink-faint);font-size:20px;">›</div>'
      + '</button>';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Delbarhet och talgåtor', 'Välj vad du vill öva på. Nivån anpassar sig medan du räknar.')
      + '<div class="tabell-level-grid">' + cards + '</div>'
    + '</div>';
    body.querySelectorAll('[data-kat]').forEach(function(btn){
      btn.onclick = function(){
        if(btn.dataset.kat === 'gata') renderDivGata(body, renderPicker);
        else renderDivDelbarhet(body, btn.dataset.kat, renderPicker);
      };
    });
  }
  renderPicker();
}

function renderDivDelbarhet(body, katId, backFn){
  var level = 1, omgang = [], idx = 0, results = [], OMG = 6;
  var REGLER_KAT = katId === 'del49' ? ['4','9'] : ['2','3','5','10'];
  var HEADER = katId === 'del49' ? 'Delbarhet med 4 och 9' : 'Delbarhet med 2, 3, 5 och 10';
  function genTal(lo, hi, predikat, antalSann){
    var sanna = [], falska = [], guard = 0;
    while((sanna.length < antalSann || falska.length < (6 - antalSann)) && guard < 4000){
      guard++;
      var n = d3RandInt(lo, hi);
      if(predikat(n)){
        if(sanna.length < antalSann && sanna.indexOf(n) === -1) sanna.push(n);
      } else {
        if(falska.length < (6 - antalSann) && falska.indexOf(n) === -1) falska.push(n);
      }
    }
    return shuffle(sanna.concat(falska));
  }
  function genTask(){
    var lo, hi;
    if(level === 1){ lo = 10; hi = 99; } else { lo = 100; hi = 999; }
    var typ;
    if(level === 1) typ = 'enkel';
    else if(level === 2) typ = randPick(['enkel','enkel','kombo']);
    else typ = randPick(['kombo','inte','enkel']);
    var r1 = randPick(REGLER_KAT), predikat, prompt, facittext;
    if(typ === 'kombo' && REGLER_KAT.length > 1){
      var r2 = r1;
      while(r2 === r1) r2 = randPick(REGLER_KAT);
      predikat = function(n){ return DIV_REGLER[r1].test(n) && DIV_REGLER[r2].test(n); };
      prompt = 'Vilka tal är delbara med både ' + DIV_REGLER[r1].namn + ' och ' + DIV_REGLER[r2].namn + '?';
      facittext = 'delbara med både ' + DIV_REGLER[r1].namn + ' och ' + DIV_REGLER[r2].namn;
    } else if(typ === 'inte'){
      predikat = function(n){ return !DIV_REGLER[r1].test(n); };
      prompt = 'Vilka tal är INTE delbara med ' + DIV_REGLER[r1].namn + '?';
      facittext = 'inte delbara med ' + DIV_REGLER[r1].namn;
    } else {
      predikat = function(n){ return DIV_REGLER[r1].test(n); };
      prompt = 'Vilka av talen är delbara med ' + DIV_REGLER[r1].namn + '?';
      facittext = 'delbara med ' + DIV_REGLER[r1].namn;
    }
    var antalSann = d3RandInt(2, 4);
    var tal = genTal(lo, hi, predikat, antalSann);
    return {tal:tal, predikat:predikat, prompt:prompt, facittext:facittext, ratta:tal.filter(predikat)};
  }
  function genOmgang(){ var a = []; for(var i=0; i<OMG; i++) a.push(genTask()); return a; }
  function render(){
    if(idx >= omgang.length){
      var right = results.filter(function(x){ return x; }).length;
      var total = results.length;
      var adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(HEADER, 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
        + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="del-back">Tillbaka till delbarhet</button></div>'
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; results = []; render();
      };
      document.getElementById('del-back').onclick = backFn;
      return;
    }
    var task = omgang[idx];
    var picked = {};
    var taggar = task.tal.map(function(n, i){
      return '<button type="button" class="div-tal-tagg" data-i="' + i + '" data-n="' + n + '">' + n + '</button>';
    }).join('');
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(HEADER, 'Markera alla tal som passar. Klicka igen för att avmarkera.', level)
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="div-delbar-prompt">' + task.prompt + '</div>'
      + '<div class="div-tal-grid">' + taggar + '</div>'
      + '<div class="rakna-uppdela-feedback" id="del-fb"></div>'
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="del-check">Kontrollera</button>'
        + '<button class="btn subtle" id="del-back">Tillbaka till delbarhet</button>'
      + '</div>'
    + '</div>';
    body.querySelectorAll('.div-tal-tagg').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(btn.disabled) return;
        var i = btn.dataset.i;
        if(picked[i]){ delete picked[i]; btn.classList.remove('is-picked'); }
        else { picked[i] = true; btn.classList.add('is-picked'); }
      });
    });
    document.getElementById('del-back').onclick = backFn;
    function check(){
      var fb = document.getElementById('del-fb');
      fb.className = 'rakna-uppdela-feedback show';
      var allRatt = true;
      body.querySelectorAll('.div-tal-tagg').forEach(function(btn){
        var i = btn.dataset.i;
        var n = parseInt(btn.dataset.n, 10);
        var borde = task.predikat(n);
        var valde = !!picked[i];
        btn.disabled = true;
        if(borde && valde){ btn.classList.add('tagg-correct'); }
        else if(borde && !valde){ btn.classList.add('tagg-missad'); allRatt = false; }
        else if(!borde && valde){ btn.classList.add('tagg-wrong'); allRatt = false; }
      });
      document.getElementById('del-check').disabled = true;
      var ts = getTutorScore('div-begrepp','rakna');
      var tsG = getTutorScore('div-begrepp', katId);
      ts.total++; tsG.total++;
      if(allRatt){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! Du hittade alla tal som är ' + task.facittext + '.';
        ts.correct++; tsG.correct++;
        results.push(true);
      } else {
        fb.classList.add('wrong');
        var facit = task.ratta.length
          ? 'Rätt svar: ' + task.ratta.join(', ') + ' är ' + task.facittext + '.'
          : 'Inget av talen var ' + task.facittext + '.';
        fb.textContent = 'Inte riktigt. ' + facit + ' Grönt = rätt, gult = missat, rött = fel markering.';
        results.push(false);
      }
      setTimeout(function(){ idx++; render(); }, allRatt ? 2000 : 3200);
    }
    document.getElementById('del-check').onclick = check;
  }
  omgang = genOmgang();
  render();
}

function renderDivGata(body, backFn){
  var level = 1, omgang = [], idx = 0, results = [], OMG = 5;
  function genTask(){
    var guard = 0;
    while(guard < 600){
      guard++;
      var tiotal = d3RandInt(2, 8);
      var lo = tiotal * 10, hi = lo + 10;
      var target = d3RandInt(lo + 1, hi - 1);
      var tio = Math.floor(target / 10), ent = target % 10;
      var ledtradar = ['Talet är större än ' + lo + ' men mindre än ' + hi + '.'];
      var villkor = [function(n){ return n > lo && n < hi; }];
      ledtradar.push(target % 2 === 0 ? 'Talet är jämnt.' : 'Talet är udda.');
      villkor.push(target % 2 === 0
        ? function(n){ return n % 2 === 0; }
        : function(n){ return n % 2 !== 0; });
      var deltal = shuffle(['3','5']).filter(function(d){ return target % parseInt(d,10) === 0; });
      if(level >= 2 && target % 6 === 0 && Math.random() < 0.6){
        ledtradar.push('Talet är delbart med både 2 och 3.');
        villkor.push(function(n){ return n % 6 === 0; });
      } else if(deltal.length){
        var d = parseInt(deltal[0], 10);
        ledtradar.push('Talet är delbart med ' + d + '.');
        villkor.push((function(dd){ return function(n){ return n % dd === 0; }; })(d));
      } else if(ent !== tio){
        if(ent > tio){
          ledtradar.push('Entalssiffran är större än tiotalssiffran.');
          villkor.push(function(n){ return (n % 10) > Math.floor(n / 10) % 10; });
        } else {
          ledtradar.push('Entalssiffran är mindre än tiotalssiffran.');
          villkor.push(function(n){ return (n % 10) < Math.floor(n / 10) % 10; });
        }
      } else { continue; }
      var losningar = [];
      for(var n = lo + 1; n < hi; n++){
        var ok = true;
        for(var v = 0; v < villkor.length; v++){ if(!villkor[v](n)){ ok = false; break; } }
        if(ok) losningar.push(n);
      }
      if(losningar.length >= 1){
        return {target:target, ledtradar:ledtradar, villkor:villkor, losningar:losningar};
      }
    }
    return {target:48,
            ledtradar:['Talet är större än 40 men mindre än 50.','Entalssiffran är större än tiotalssiffran.','Talet är delbart med både 2 och 3.'],
            villkor:[function(n){return n>40&&n<50;},function(n){return (n%10)>Math.floor(n/10)%10;},function(n){return n%6===0;}],
            losningar:[48]};
  }
  function genOmgang(){ var a = []; for(var i=0; i<OMG; i++) a.push(genTask()); return a; }
  function render(){
    if(idx >= omgang.length){
      var right = results.filter(function(x){ return x; }).length;
      var total = results.length;
      var adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader('Talgåtor', 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
        + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="gata-back">Tillbaka till delbarhet</button></div>'
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; results = []; render();
      };
      document.getElementById('gata-back').onclick = backFn;
      return;
    }
    var task = omgang[idx];
    var ledHTML = task.ledtradar.map(function(t){ return '<li>' + t + '</li>'; }).join('');
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Talgåta · vilket är talet?', 'Läs ledtrådarna och skriv talet de beskriver.', level)
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="div-gata-card">'
        + '<div class="div-gata-rubrik">Ledtrådar</div>'
        + '<ul class="div-gata-lista">' + ledHTML + '</ul>'
      + '</div>'
      + '<div class="rakna-svar-rad"><input type="text" class="rakna-svar-input" id="gata-input" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="?"></div>'
      + '<div class="rakna-uppdela-feedback" id="gata-fb"></div>'
      + keypadHTML([])
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="gata-check">Kontrollera</button>'
        + '<button class="btn subtle" id="gata-back">Tillbaka till delbarhet</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var input = document.getElementById('gata-input');
    setTimeout(function(){ input.focus(); }, 50);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); check(); }
    });
    document.getElementById('gata-back').onclick = backFn;
    function check(){
      var fb = document.getElementById('gata-fb');
      fb.className = 'rakna-uppdela-feedback show';
      var stu = parseInt(input.value.trim(), 10);
      input.disabled = true;
      document.getElementById('gata-check').disabled = true;
      var ts = getTutorScore('div-begrepp','rakna');
      var tsG = getTutorScore('div-begrepp','gata');
      ts.total++; tsG.total++;
      var ok = false;
      if(isNaN(stu)){
        fb.classList.add('wrong');
        fb.textContent = 'Skriv ett tal som svar.';
      } else {
        ok = true;
        for(var v = 0; v < task.villkor.length; v++){ if(!task.villkor[v](stu)){ ok = false; break; } }
        if(ok){
          input.classList.add('correct');
          fb.classList.add('correct');
          fb.textContent = 'Rätt! ' + stu + ' passar alla ledtrådar.';
          ts.correct++; tsG.correct++;
        } else {
          input.classList.add('wrong');
          fb.classList.add('wrong');
          fb.textContent = 'Inte rätt. Ett tal som passar är ' + task.losningar[0] + '.';
        }
      }
      results.push(ok);
      setTimeout(function(){ idx++; render(); }, ok ? 1900 : 3000);
    }
    document.getElementById('gata-check').onclick = check;
  }
  omgang = genOmgang();
  render();
}

// ---- KO 2: DIVISIONSTABELLEN ----
function renderDivTabell(body){
  var TABELL_NIVAER = [
    {nr:1, namn:'Nämnare 5 till 7',  desc:'Nämnaren är 5–7.',  nLo:5, nHi:7},
    {nr:2, namn:'Nämnare 6 till 9',  desc:'Nämnaren är 6–9.',  nLo:6, nHi:9},
    {nr:3, namn:'Nämnare 8 till 12', desc:'Nämnaren är 8–12.', nLo:8, nHi:12}
  ];
  var niva = null, omgang = [], idx = 0, results = [], startTime = 0, timerInterval = null;
  if(!state.divTabellBest) state.divTabellBest = {};
  function stopTimer(){ if(timerInterval){ clearInterval(timerInterval); timerInterval = null; } }
  function formatTid(ms){
    var s = ms / 1000;
    if(s < 60) return s.toFixed(1).replace('.', ',') + ' s';
    var m = Math.floor(s / 60);
    var rest = Math.round(s - m * 60);
    return m + ' min ' + (rest < 10 ? '0' : '') + rest + ' s';
  }
  function buildOmgang(lv){
    var pool = [];
    for(var n = lv.nLo; n <= lv.nHi; n++){
      for(var q = 5; q <= 10; q++){
        if(lv.nr === 3 && n === 10 && Math.random() < 0.6) continue;
        pool.push({n:n, q:q, taljare:n * q});
      }
    }
    return shuffle(pool).slice(0, Math.min(25, pool.length));
  }
  function startaOmgang(){
    omgang = buildOmgang(niva); idx = 0; results = []; startTime = Date.now(); renderFraga();
  }
  function renderValjNiva(){
    stopTimer();
    var cards = '';
    for(var i=0; i<TABELL_NIVAER.length; i++){
      var lv = TABELL_NIVAER[i];
      var best = state.divTabellBest[lv.nr];
      var bestTxt = best ? '🏆 Rekord: ' + formatTid(best) : 'Inget rekord än';
      cards += '<button class="tabell-card" data-niva="' + i + '">'
        + '<div class="tabell-card-num">' + lv.nr + '</div>'
        + '<div class="tabell-card-body">'
          + '<div class="tabell-card-namn">Nivå ' + lv.nr + ' · ' + lv.namn + '</div>'
          + '<div class="tabell-card-desc">' + lv.desc + ' &nbsp;·&nbsp; ' + bestTxt + '</div>'
        + '</div>'
        + '<div style="color:var(--ink-faint);font-size:20px;">›</div>'
      + '</button>';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Divisionstabellen', 'Välj en nivå. Tiden startar direkt – försök slå rekordet!')
      + '<div class="tabell-level-grid">' + cards + '</div>'
    + '</div>';
    body.querySelectorAll('[data-niva]').forEach(function(btn){
      btn.onclick = function(){
        niva = TABELL_NIVAER[parseInt(btn.dataset.niva, 10)];
        startaOmgang();
      };
    });
  }
  function renderSummary(){
    stopTimer();
    var elapsed = Date.now() - startTime;
    var right = results.filter(function(x){ return x; }).length;
    var total = results.length;
    var alltRatt = right === total && total > 0;
    var snitt = total > 0 ? elapsed / total : 0;
    var tidigare = state.divTabellBest[niva.nr];
    var nyttRekord = false;
    if(alltRatt && (!tidigare || elapsed < tidigare)){
      state.divTabellBest[niva.nr] = elapsed; nyttRekord = true;
    }
    var rekordHTML = '';
    if(nyttRekord){
      rekordHTML = '<div class="tabell-rekord nytt">🏆 Nytt rekord på nivå ' + niva.nr + '!</div>';
    } else if(alltRatt && tidigare){
      rekordHTML = '<div class="tabell-rekord gammalt">Rekordet är ' + formatTid(tidigare)
        + ' – du var ' + formatTid(elapsed - tidigare) + ' långsammare</div>';
    } else if(!alltRatt){
      rekordHTML = '<div class="tabell-rekord gammalt">Alla rätt krävs för att sätta rekord</div>';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Divisionstabellen · nivå ' + niva.nr, 'Du klarade ' + right + ' av ' + total + ' tal.')
      + '<div class="tabell-tidkort">'
        + '<div class="tabell-tid-stor">' + formatTid(elapsed) + '</div>'
        + '<div class="tabell-tid-rad">' + total + ' tal · ' + formatTid(snitt) + ' per tal · ' + right + ' rätt</div>'
        + rekordHTML
      + '</div>'
      + renderSummaryCard({right:right, total:total, level:niva.nr, levelChange:null, nextLabel:'Kör igen – ta tid'})
      + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="divtab-byt">Välj en annan nivå</button></div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = startaOmgang;
    document.getElementById('divtab-byt').onclick = renderValjNiva;
  }
  function renderFraga(){
    if(idx >= omgang.length){ renderSummary(); return; }
    var t = omgang[idx];
    var facit = String(t.q);
    var right = results.filter(function(x){ return x; }).length;
    var pct = Math.round((idx / omgang.length) * 100);
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Divisionstabellen · nivå ' + niva.nr, 'Skriv kvoten. Rätt svar → nästa tal direkt.')
      + '<div class="tabell-timer" id="divtab-timer"><span class="tt-ikon">⏱</span> <span id="divtab-timer-val">0,0 s</span></div>'
      + '<div class="tabell-fraga">' + t.taljare + ' / ' + t.n + ' <span class="tabell-eq">=</span></div>'
      + '<input type="text" class="tabell-svar-input" id="divtab-input" inputmode="numeric" maxlength="3" autocomplete="off">'
      + '<div class="tabell-feedback" id="divtab-fb"></div>'
      + keypadHTML([])
      + '<div class="tabell-progress">Tal ' + (idx+1) + ' av ' + omgang.length + ' · ' + right + ' rätt'
        + '<div class="tabell-progress-bar"><div class="tabell-progress-fill" style="width:' + pct + '%"></div></div>'
      + '</div>'
      + '<div style="margin-top:14px;text-align:center;">'
        + '<button class="btn primary" id="divtab-svara">Svara</button>'
        + '<button class="btn subtle" id="divtab-back">Avbryt</button>'
      + '</div>'
    + '</div>';
    stopTimer();
    var timerVal = document.getElementById('divtab-timer-val');
    function tick(){
      var s = (Date.now() - startTime) / 1000;
      timerVal.textContent = s.toFixed(1).replace('.', ',') + ' s';
    }
    tick();
    timerInterval = setInterval(tick, 100);
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var input = document.getElementById('divtab-input');
    setTimeout(function(){ input.focus(); }, 50);
    var done = false;
    function advance(correct){
      if(done) return;
      done = true;
      results.push(correct);
      var ts = getTutorScore('div-tabell','rakna');
      ts.total++;
      if(correct) ts.correct++;
      var fb = document.getElementById('divtab-fb');
      input.disabled = true;
      document.getElementById('divtab-svara').disabled = true;
      if(correct){
        input.classList.add('correct');
        fb.className = 'tabell-feedback correct';
        fb.textContent = 'Rätt!';
        setTimeout(function(){ idx++; renderFraga(); }, 350);
      } else {
        input.classList.add('wrong');
        fb.className = 'tabell-feedback wrong';
        fb.textContent = t.taljare + ' / ' + t.n + ' = ' + facit;
        setTimeout(function(){ idx++; renderFraga(); }, 200);
      }
    }
    input.addEventListener('input', function(){
      if(input.value.trim() === facit) advance(true);
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        if(input.value.trim() !== '') advance(input.value.trim() === facit);
      }
    });
    document.getElementById('divtab-svara').onclick = function(){
      if(input.value.trim() !== '') advance(input.value.trim() === facit);
    };
    document.getElementById('divtab-back').onclick = renderValjNiva;
  }
  renderValjNiva();
}

// ---- KO 3: METODER (kort + lång division) ----
function renderDivMetoder(body){
  var METODER = [
    {id:'kort', namn:'Kort division', icon:'➗',
     kort:'Dela siffra för siffra och skriv minnessiffran framför nästa siffra.'},
    {id:'lang', namn:'Lång division (liggande stolen)', icon:'📐',
     kort:'Dividera, multiplicera, subtrahera och flytta ner – steg för steg.'}
  ];
  function renderValjMetod(){
    var cards = '';
    for(var i=0; i<METODER.length; i++){
      var m = METODER[i];
      cards += '<button class="metod-val-card" data-metod="' + m.id + '">'
        + '<div class="metod-val-icon">' + m.icon + '</div>'
        + '<div class="metod-val-body">'
          + '<div class="metod-val-namn">' + m.namn + '</div>'
          + '<div class="metod-val-desc">' + m.kort + '</div>'
        + '</div>'
        + '<div style="color:var(--ink-faint);font-size:20px;">›</div>'
      + '</button>';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metoder för division', 'Välj en metod att öva på. Varje metod har en genomgång först.')
      + '<div class="metod-val-grid">' + cards + '</div>'
    + '</div>';
    body.querySelectorAll('[data-metod]').forEach(function(btn){
      btn.onclick = function(){
        if(btn.dataset.metod === 'kort') renderDivKort(body, renderValjMetod);
        else renderDivLang(body, renderValjMetod);
      };
    });
  }
  renderValjMetod();
}

function renderDivKort(body, backFn){
  var level = 1, omgangResults = [], OMG = 5;
  var LEVELNAMN = {1:'tresiffrig täljare · nämnare 2–5', 2:'tresiffrig täljare · nämnare 3–9', 3:'fyrsiffrig täljare · nämnare 4–9'};
  function adjustK(lv, right, total){
    if(right >= total-1 && lv < 3) return {level:lv+1, change:'up'};
    if(right <= Math.floor(total/3) && lv > 1) return {level:lv-1, change:'down'};
    return {level:lv, change:null};
  }
  function genTask(){
    var k = level === 3 ? 4 : 3;
    var nLo = level === 1 ? 2 : (level === 2 ? 3 : 4);
    var nHi = level === 1 ? 5 : 9;
    for(var tries=0; tries<800; tries++){
      var n = d3RandInt(nLo, nHi);
      var Q = d3RandInt(Math.pow(10, k-1), Math.pow(10, k) - 1);
      var N = Q * n;
      var ns = String(N);
      if(ns.length !== k) continue;
      var digs = ns.split('').map(Number);
      if(digs[0] < n) continue;
      var carry = 0, carryInto = [0], q = [];
      for(var i=0; i<k; i++){
        var val = carry * 10 + digs[i];
        var qi = Math.floor(val / n);
        carry = val - qi * n;
        q.push(qi);
        if(i < k-1) carryInto.push(carry);
      }
      if(carry !== 0) continue;
      var hasCarry = carryInto.slice(1).some(function(c){ return c > 0; });
      if(level > 1 && !hasCarry) continue;
      return {n:n, digs:digs, carryInto:carryInto, q:q, N:N, k:k};
    }
    return {n:6, digs:[8,5,2], carryInto:[0,2,1], q:[1,4,2], N:852, k:3};
  }
  function fixedCell(v){ return '<div class="cell">' + v + '</div>'; }
  function carrySlot(i, task, demo){
    // minnessiffran för siffra i (i >= 1): liten ruta nedanför-vänster om siffran
    if(demo){
      return task.carryInto[i] === 0 ? ''
        : '<span class="div-kort-carry-demo">' + task.carryInto[i] + '</span>';
    }
    // Övning: tom klickbar plats – eleven trycker själv för att skapa minnesrutan
    return '<button type="button" class="div-kort-carry-slot" data-expect="' + task.carryInto[i]
      + '" title="Lägg till minnessiffra">+</button>';
  }
  function buildBox(task, demo){
    var k = task.k;
    var fracW = (k * 40 + (k - 1) * 2);
    var taljRow = '<div class="mult-upp-row">';
    for(var j=0; j<k; j++){
      var carry = j >= 1 ? carrySlot(j, task, demo) : '';
      taljRow += '<div class="cell div-kort-digcell">' + carry + '<span>' + task.digs[j] + '</span></div>';
    }
    taljRow += '</div>';
    var lineRow = '<div class="div-frac-line" style="width:' + fracW + 'px;"></div>';
    var namnRow = '<div class="mult-upp-row" style="justify-content:center;width:' + fracW + 'px;">' + fixedCell(task.n) + '</div>';
    var kvotRow = '<div class="mult-upp-row">';
    for(var m=0; m<k; m++){
      kvotRow += demo
        ? fixedCell('<span style="color:var(--success);font-weight:700;">' + task.q[m] + '</span>')
        : '<div class="cell"><input type="text" class="mult-upp-ans div-kort-q" data-expect="' + task.q[m] + '" inputmode="numeric" maxlength="1" autocomplete="off"></div>';
    }
    kvotRow += '</div>';
    return '<div class="div-kort-box">'
      + '<div class="div-kort-frac">' + taljRow + lineRow + namnRow + '</div>'
      + '<div class="div-kort-eq">=</div>'
      + '<div>' + kvotRow + '</div>'
    + '</div>';
  }
  function renderExplain(){
    var demoTask = {n:6, digs:[8,5,2], carryInto:[0,2,1], q:[1,4,2], N:852, k:3};
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · kort division', 'Dela siffra för siffra. Minnessiffran skrivs framför nästa siffra i täljaren.')
      + '<div class="metod-explain-card">'
        + '<h3 class="metod-step-title">Så här fungerar det</h3>'
        + '<p class="metod-step-desc">Vi beräknar <strong>852 / 6</strong>.</p>'
        + '<div style="display:flex;justify-content:center;">' + buildBox(demoTask, true) + '</div>'
        + '<ol class="div-metod-steg">'
          + '<li><strong>8 / 6</strong> = 1, rest 2. Skriv <strong>1</strong> i kvoten och minnessiffran <strong>2</strong> framför nästa siffra.</li>'
          + '<li>Minnessiffran framför nästa siffra ger <strong>25</strong>. <strong>25 / 6</strong> = 4, rest 1. Skriv <strong>4</strong>, minnessiffra <strong>1</strong>.</li>'
          + '<li>Sista siffran med minnessiffra blir <strong>12</strong>. <strong>12 / 6</strong> = 2, rest 0. Skriv <strong>2</strong>. Kvoten är <strong>142</strong>.</li>'
        + '</ol>'
      + '</div>'
      + '<div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="kort-start">Öva nu →</button>'
        + '<button class="btn subtle" id="kort-back">Tillbaka till metoder</button>'
      + '</div>'
    + '</div>';
    document.getElementById('kort-start').onclick = function(){ omgangResults = []; renderPractice(); };
    document.getElementById('kort-back').onclick = backFn;
  }
  function renderPractice(){
    var task = genTask();
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · kort division', LEVELNAMN[level] + '.', level)
      + '<div class="metod-explain-card">'
        + '<p style="font-size:15px;margin:0 0 4px;color:var(--ink-soft);">Beräkna <strong style="font-family:var(--mono);color:var(--c-metod);">' + task.N + ' / ' + task.n + '</strong></p>'
        + '<p style="font-size:13px;margin:0 0 14px;color:var(--ink-soft);">Skriv kvoten i de gröna rutorna. Tryck på <strong>+</strong> för att lägga till en minnessiffra framför nästa siffra.</p>'
        + '<div style="display:flex;justify-content:center;">' + buildBox(task, false) + '</div>'
        + '<div class="rakna-uppdela-feedback" id="kort-fb"></div>'
        + keypadHTML([])
        + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="btn primary" id="kort-check">Kontrollera</button>'
          + '<button class="btn subtle" id="kort-tillbaka">Tillbaka till metoder</button>'
        + '</div>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    // Ordning: kvotsiffra, sedan minnessiffran in i nästa kolumn, osv.
    // Markören startar därför på första kvotrutan – inte på en minnessiffra.
    var qs = Array.from(card.querySelectorAll('.div-kort-q'));   // kvotsiffror (fokus + nav)
    // Klickbar minnesplats: skapa själv rutan när eleven trycker på +
    card.querySelectorAll('.div-kort-carry-slot').forEach(function(slot){
      slot.addEventListener('click', function(){
        var inp = document.createElement('input');
        inp.type='text'; inp.className='div-kort-carry'; inp.setAttribute('inputmode','numeric');
        inp.maxLength=1; inp.autocomplete='off'; inp.dataset.expect=slot.dataset.expect;
        inp.addEventListener('input', function(){ inp.value=inp.value.replace(/[^0-9]/g,''); });
        slot.replaceWith(inp); inp.focus();
      });
    });
    setTimeout(function(){ if(qs.length) qs[0].focus(); }, 50);
    qs.forEach(function(inp, i){
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); if(i < qs.length - 1) qs[i+1].focus(); else check(); }
      });
    });
    function check(){
      var correct = true;
      card.querySelectorAll('.div-kort-carry-slot').forEach(function(s){ s.disabled = true; });
      Array.from(card.querySelectorAll('.div-kort-q, .div-kort-carry')).forEach(function(inp){
        var exp = inp.dataset.expect;
        var got = inp.value.trim();
        if(inp.classList.contains('div-kort-carry') && got === '') got = '0';
        inp.disabled = true;
        if(got === exp){ inp.classList.add('correct'); }
        else { inp.classList.add('wrong'); correct = false; }
      });
      var fb = document.getElementById('kort-fb');
      fb.className = 'rakna-uppdela-feedback show';
      document.getElementById('kort-check').disabled = true;
      var ts = getTutorScore('div-metoder','metod');
      var tsG = getTutorScore('div-metoder','kort');
      ts.total++; tsG.total++;
      omgangResults.push(correct);
      if(correct){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + task.N + ' / ' + task.n + ' = ' + task.q.join('') + '  ✓';
        ts.correct++; tsG.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = 'Inte rätt – ' + task.N + ' / ' + task.n + ' = ' + task.q.join('') + '. Kontrollera siffra för siffra.';
      }
      if(omgangResults.length >= OMG) setTimeout(showSummary, correct ? 1800 : 2800);
      else setTimeout(renderPractice, correct ? 1800 : 2800);
    }
    document.getElementById('kort-check').onclick = check;
    document.getElementById('kort-tillbaka').onclick = backFn;
  }
  function showSummary(){
    var right = omgangResults.filter(function(x){ return x; }).length;
    var total = omgangResults.length;
    var adj = adjustK(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · kort division', 'Du klarade ' + right + ' av ' + total + '.')
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change, nextLabel:'Ny omgång'})
      + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="kort-tillmetoder">Tillbaka till metoder</button></div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults = []; renderPractice(); };
    document.getElementById('kort-tillmetoder').onclick = backFn;
  }
  renderExplain();
}

function renderDivLang(body, backFn){
  var level = 1, omgangResults = [], OMG = 4;
  var LEVELNAMN = {1:'tresiffrig täljare · nämnare 2–5', 2:'tresiffrig täljare · nämnare 3–9', 3:'tresiffrig täljare · nämnare 6–9'};
  function adjustL(lv, right, total){
    if(right >= total-1 && lv < 3) return {level:lv+1, change:'up'};
    if(right <= Math.floor(total/3) && lv > 1) return {level:lv-1, change:'down'};
    return {level:lv, change:null};
  }
  function bygg(D, digs){
    var carry = 0, steps = [];
    for(var i=0; i<digs.length; i++){
      var cur = carry * 10 + digs[i];
      var qi = Math.floor(cur / D), sub = qi * D, rem = cur - sub;
      steps.push({cur:cur, qi:qi, sub:sub, rem:rem, broughtDigit:(i < digs.length-1 ? digs[i+1] : null)});
      carry = rem;
    }
    return {D:D, digs:digs, steps:steps, slutRest:carry, k:digs.length};
  }
  function genTask(){
    var nLo = level === 1 ? 2 : (level === 2 ? 3 : 6);
    var nHi = level === 1 ? 5 : 9;
    for(var tries=0; tries<800; tries++){
      var D = d3RandInt(nLo, nHi);
      var Q = d3RandInt(100, 999);
      var N = Q * D;
      var ns = String(N);
      if(ns.length !== 3) continue;
      var digs = ns.split('').map(Number);
      if(digs[0] < D) continue;
      var t = bygg(D, digs);
      if(t.slutRest !== 0) continue;
      t.N = N; t.Q = Q;
      return t;
    }
    var fb = bygg(4, [7,8,4]); fb.N = 784; fb.Q = 196; return fb;
  }
  function fixedCell(v, cls){ return '<div class="cell ' + (cls||'') + '">' + v + '</div>'; }
  function emptyCell(){ return '<div class="cell"></div>'; }
  function inputCell(expect, cls){
    return '<div class="cell"><input type="text" class="mult-upp-ans ' + cls + '" data-expect="' + expect + '" inputmode="numeric" maxlength="1" autocomplete="off"></div>';
  }
  function opCell(v){ return '<div class="cell opcell">' + (v||'') + '</div>'; }
  function rowFromCells(opV, cellHtmls){
    return '<div class="mult-upp-row">' + opCell(opV) + cellHtmls.join('') + '</div>';
  }
  function buildBox(task, demo){
    var k = task.k;
    var fracW = (k * 40 + (k - 1) * 2);
    var rows = '';
    var kvotCells = [];
    for(var i=0; i<k; i++){
      kvotCells.push(demo
        ? fixedCell('<span style="color:var(--success);font-weight:700;">' + task.steps[i].qi + '</span>')
        : inputCell(task.steps[i].qi, 'div-lang-q'));
    }
    // Efterföljande tomma cell = samma bredd som täljarradens vägg+nämnare-cell,
    // så alla rader högerjusteras lika och kolumnerna hamnar rakt under varandra.
    kvotCells.push(emptyCell());
    rows += rowFromCells('', kvotCells);
    // Täljarsiffrorna i en box med ETT sammanhängande vågrätt streck (border-top).
    // Nämnaren har border-left (lodrätt streck) → möter det vågräta i hörnet = liggande stol.
    var taljCells = [];
    for(var t=0; t<k; t++) taljCells.push(fixedCell(task.digs[t]));
    rows += '<div class="mult-upp-row">' + opCell('')
      + '<div class="dl-stol">'
        + '<div class="dl-tal">' + taljCells.join('') + '</div>'
        + '<div class="dl-namn-box">' + task.D + '</div>'
      + '</div></div>';
    for(var s=0; s<k; s++){
      var st = task.steps[s];
      var subStr = String(st.sub);
      var subLen = subStr.length;
      var subCells = [];
      for(var c=0; c<k; c++){
        if(c > s - subLen && c <= s){
          var subDig = subStr[c - (s - subLen + 1)];
          subCells.push(demo
            ? fixedCell('<span style="color:var(--error);">' + subDig + '</span>')
            : inputCell(subDig, 'div-lang-sub'));
        } else { subCells.push(emptyCell()); }
      }
      subCells.push(emptyCell());
      rows += rowFromCells('−', subCells);
      rows += '<div class="mult-upp-row"><div class="cell opcell"></div><div class="div-step-line" style="width:' + fracW + 'px;"></div>' + emptyCell() + '</div>';
      var diffCells = [];
      for(var d=0; d<k; d++){
        if(d === s){
          diffCells.push(demo
            ? fixedCell('<span style="color:var(--success);font-weight:700;">' + st.rem + '</span>')
            : inputCell(st.rem, 'div-lang-rem'));
        } else if(d === s + 1 && st.broughtDigit !== null){
          diffCells.push(demo
            ? fixedCell('<span style="color:var(--c-metod);font-weight:700;">' + st.broughtDigit + '</span>', 'div-lang-brought')
            : inputCell(st.broughtDigit, 'div-lang-brought'));
        } else { diffCells.push(emptyCell()); }
      }
      diffCells.push(emptyCell());
      rows += rowFromCells('', diffCells);
    }
    return '<div class="mult-upp-box"><div class="mult-upp-rows">' + rows + '</div></div>';
  }
  function renderExplain(){
    var demoTask = bygg(4, [7,8,4]); demoTask.N = 784; demoTask.Q = 196;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · lång division', 'Liggande stolen: dividera, multiplicera, subtrahera och flytta ner.')
      + '<div class="metod-explain-card">'
        + '<h3 class="metod-step-title">Så här fungerar det</h3>'
        + '<p class="metod-step-desc">Vi beräknar <strong>784 / 4</strong>.</p>'
        + '<div style="display:flex;justify-content:center;">' + buildBox(demoTask, true) + '</div>'
        + '<ol class="div-metod-steg">'
          + '<li><strong>Dividera:</strong> 7 / 4 = 1. Skriv 1 i kvoten.</li>'
          + '<li><strong>Multiplicera:</strong> 1 · 4 = 4. Skriv 4 under 7.</li>'
          + '<li><strong>Subtrahera:</strong> 7 − 4 = 3.</li>'
          + '<li><strong>Flytta ner:</strong> ta ner 8 → 38. 38 / 4 = 9, 9 · 4 = 36, 38 − 36 = 2.</li>'
          + '<li>Flytta ner 4 → 24. 24 / 4 = 6, 6 · 4 = 24, 24 − 24 = 0. Kvoten är <strong>196</strong>.</li>'
        + '</ol>'
      + '</div>'
      + '<div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="lang-start">Öva nu →</button>'
        + '<button class="btn subtle" id="lang-back">Tillbaka till metoder</button>'
      + '</div>'
    + '</div>';
    document.getElementById('lang-start').onclick = function(){ omgangResults = []; renderPractice(); };
    document.getElementById('lang-back').onclick = backFn;
  }
  function renderPractice(){
    var task = genTask();
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · lång division', LEVELNAMN[level] + '.', level)
      + '<div class="metod-explain-card">'
        + '<p style="font-size:15px;margin:0 0 4px;color:var(--ink-soft);">Beräkna <strong style="font-family:var(--mono);color:var(--c-metod);">' + task.N + ' / ' + task.D + '</strong> med liggande stolen.</p>'
        + '<p style="font-size:13px;margin:0 0 14px;color:var(--ink-soft);">Fyll i <strong>allt själv</strong>: kvoten överst, talen du subtraherar och differenserna. Räkna steg för steg.</p>'
        + '<div style="display:flex;justify-content:center;">' + buildBox(task, false) + '</div>'
        + '<div class="rakna-uppdela-feedback" id="lang-fb"></div>'
        + keypadHTML([])
        + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="btn primary" id="lang-check">Kontrollera</button>'
          + '<button class="btn subtle" id="lang-tillbaka">Tillbaka till metoder</button>'
        + '</div>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var allInputs = Array.from(card.querySelectorAll('.div-lang-q, .div-lang-sub, .div-lang-brought, .div-lang-rem'));
    setTimeout(function(){ if(allInputs.length) allInputs[0].focus(); }, 50);
    allInputs.forEach(function(inp, i){
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
          e.preventDefault();
          if(i < allInputs.length - 1) allInputs[i+1].focus();
          else check();
        }
      });
    });
    function check(){
      var correct = true;
      allInputs.forEach(function(inp){
        inp.disabled = true;
        if(inp.value.trim() === inp.dataset.expect){ inp.classList.add('correct'); }
        else { inp.classList.add('wrong'); correct = false; }
      });
      var fb = document.getElementById('lang-fb');
      fb.className = 'rakna-uppdela-feedback show';
      document.getElementById('lang-check').disabled = true;
      var ts = getTutorScore('div-metoder','metod');
      var tsG = getTutorScore('div-metoder','lang');
      ts.total++; tsG.total++;
      omgangResults.push(correct);
      if(correct){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + task.N + ' / ' + task.D + ' = ' + task.Q + '  ✓';
        ts.correct++; tsG.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = 'Inte rätt – ' + task.N + ' / ' + task.D + ' = ' + task.Q + '. Kontrollera kvoten och differenserna.';
      }
      if(omgangResults.length >= OMG) setTimeout(showSummary, correct ? 1900 : 3000);
      else setTimeout(renderPractice, correct ? 1900 : 3000);
    }
    document.getElementById('lang-check').onclick = check;
    document.getElementById('lang-tillbaka').onclick = backFn;
  }
  function showSummary(){
    var right = omgangResults.filter(function(x){ return x; }).length;
    var total = omgangResults.length;
    var adj = adjustL(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · lång division', 'Du klarade ' + right + ' av ' + total + '.')
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change, nextLabel:'Ny omgång'})
      + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="lang-tillmetoder">Tillbaka till metoder</button></div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults = []; renderPractice(); };
    document.getElementById('lang-tillmetoder').onclick = backFn;
  }
  renderExplain();
}

// ---- KO 4: BERÄKNINGAR ----
function renderDivRakna(body){
  var KATEGORIER = [
    {id:'pow10',    nr:1, namn:'Med 10, 100 och 1000', desc:'Dividera med tiotal, hundratal och tusental.'},
    {id:'stora',    nr:2, namn:'Stora tal',            desc:'Tal med många nollor.'},
    {id:'storasma', nr:3, namn:'Stora och små tal',    desc:'Stora tal delade med små decimaltal.'},
    {id:'sma',      nr:4, namn:'Små tal – förlängning',desc:'Förläng nämnaren till 1 eller ett heltal.'},
    {id:'negativa', nr:5, namn:'Negativa tal',         desc:'Håll koll på tecknet – plus och minus.'}
  ];
  var SMA_POOL = {
    1:[{s:'0,5',num:1,den:2},{s:'0,2',num:1,den:5},{s:'0,25',num:1,den:4},{s:'0,1',num:1,den:10}],
    2:[{s:'0,5',num:1,den:2},{s:'0,2',num:1,den:5},{s:'0,25',num:1,den:4},{s:'0,1',num:1,den:10},{s:'0,4',num:2,den:5}],
    3:[{s:'0,2',num:1,den:5},{s:'0,25',num:1,den:4},{s:'0,4',num:2,den:5},{s:'0,3',num:3,den:10},{s:'0,6',num:3,den:5},{s:'0,7',num:7,den:10},{s:'0,8',num:4,den:5},{s:'0,9',num:9,den:10}]
  };
  var STORASMA_POOL = [{s:'0,5',f:2},{s:'0,2',f:5},{s:'0,1',f:10},{s:'0,25',f:4},{s:'0,4',f:2.5}];

  var CFG = {
    pow10:{
      header:'Beräkningar · med 10, 100 och 1000',
      sub:'Dividera med 10, 100 eller 1000. Talen blir svårare efter hand.',
      ops:[','],
      exempel:'<strong>Positionssystemet:</strong> När du dividerar med 10, 100 eller 1000 flyttas varje siffra ett, två eller tre steg åt höger.<br>'
        + '<span class="ex-rad">450 / 10 = 45</span><br>'
        + '<span class="ex-rad">45 / 10 = 4,5</span><br>'
        + '<span class="ex-rad">65 / 1000 = 0,065</span>',
      gen:function(level){
        // Balanserad fördelning av nämnaren per omgång (8 tal). Tak: 10/100/1000 max 3 ggr.
        // Nivå 1 (bara 10 & 100): 4,4. Nivå 2–3 (10,100,1000): 3,3,2.
        if(!this._bag || !this._bag.length){
          this._bag = shuffle(level === 1 ? [1,1,1,1,2,2,2,2] : [1,1,1,2,2,2,3,3]);
        }
        var p = this._bag.pop();
        var ddec, N;
        if(level === 1){ ddec = 0; N = d3RandInt(11,999); }
        else if(level === 2){ ddec = 0; N = d3RandInt(101,99999); }
        else { ddec = randPick([1,2]); N = d3RandInt(101,99999); }
        var divisor = Math.pow(10, p);
        return {display:d3DecStr(N, ddec) + ' / ' + divisor,
                answerNum:N / Math.pow(10, ddec + p),
                answerStr:d3DecStr(N, ddec + p)};
      }
    },
    stora:{
      header:'Beräkningar · stora tal',
      sub:'Stryk lika många nollor i täljaren och nämnaren – räkna sedan med de små talen.',
      ops:[],
      exempel:'<strong>Tänk så här:</strong> Förkorta bort lika många nollor uppe och nere.<br>'
        + '<span class="ex-rad">6000 / 30 = 600 / 3 = 200</span><br>'
        + '<span class="ex-rad">90000 / 450 = 9000 / 45 = 200</span>',
      gen:function(level){
        var ansBase, ansZ, divBase, divZ;
        if(level === 1){ ansBase = d3RandInt(2,9); ansZ = d3RandInt(1,2); divBase = d3RandInt(2,9); divZ = d3RandInt(2,3); }
        else if(level === 2){ ansBase = d3RandInt(2,9); ansZ = d3RandInt(2,3); divBase = d3RandInt(11,49); divZ = d3RandInt(2,3); }
        else { ansBase = d3RandInt(11,99); ansZ = d3RandInt(2,3); divBase = d3RandInt(11,99); divZ = d3RandInt(3,4); }
        var answer = ansBase * Math.pow(10, ansZ);
        var divisor = divBase * Math.pow(10, divZ);
        return {display:(answer * divisor) + ' / ' + divisor, answerNum:answer, answerStr:String(answer)};
      }
    },
    storasma:{
      header:'Beräkningar · stora och små tal',
      sub:'Ett stort tal delat med ett litet decimaltal. Att dela med 0,5 är samma som att gånga med 2.',
      ops:[],
      exempel:'<strong>Tänk så här:</strong> Att dividera med ett tal mindre än 1 ger en större kvot.<br>'
        + '<span class="ex-rad">4000 / 0,5 = 4000 · 2 = 8000</span><br>'
        + '<span class="ex-rad">600 / 0,2 = 600 · 5 = 3000</span>',
      gen:function(level){
        var dd = randPick(STORASMA_POOL);
        var base, z;
        if(level === 1){ base = d3RandInt(2,9); z = 2; }
        else if(level === 2){ base = d3RandInt(2,9); z = d3RandInt(2,3); }
        else { base = d3RandInt(11,49); z = d3RandInt(2,3); }
        var dividend = base * Math.pow(10, z);
        var answer = Math.round(dividend * dd.f);
        return {display:dividend + ' / ' + dd.s, answerNum:answer, answerStr:String(answer)};
      }
    },
    sma:{
      header:'Beräkningar · små tal genom förlängning',
      sub:'Förläng täljare och nämnare med samma tal så att nämnaren blir ett heltal – räkna sedan ut svaret.',
      ops:[],
      forlang:true,
      exempel:'<strong>Tänk så här:</strong> Förläng (gångra) både täljare och nämnare med samma tal.<br>'
        + '<span class="ex-rad">12 / 0,2 = (12·5) / (0,2·5) = 60 / 1 = 60</span><br>'
        + '<span class="ex-rad">8 / 0,4 = (8·5) / (0,4·5) = 40 / 2 = 20</span>',
      gen:function(level){
        var pool = SMA_POOL[Math.min(level, 3)];
        var d = randPick(pool);
        var j = d3RandInt(2, level === 3 ? 12 : 9);
        var taljare = d.num * j;
        var answer = d.den * j;
        return {display:taljare + ' / ' + d.s, answerNum:answer, answerStr:String(answer),
                taljare:taljare, namnStr:d.s, namnVal:d.num / d.den,
                facitFt:taljare * d.den, facitFn:d.num};
      }
    },
    negativa:{
      header:'Beräkningar · negativa tal',
      sub:'Plus delat med minus blir minus. Minus delat med minus blir plus.',
      ops:['-'],
      exempel:'<strong>Teckenregler:</strong> plus / minus = minus &nbsp;·&nbsp; minus / minus = plus.<br>'
        + '<span class="ex-rad">−42 / 7 = −6</span><br>'
        + '<span class="ex-rad">42 / (−6) = −7</span><br>'
        + '<span class="ex-rad">(−42) / (−6) = 7</span>',
      gen:function(level){
        var qMag, dMag;
        if(level === 1){ dMag = d3RandInt(2,9); qMag = d3RandInt(2,9); }
        else if(level === 2){ dMag = d3RandInt(2,12); qMag = d3RandInt(2,12); }
        else { dMag = d3RandInt(3,12); qMag = d3RandInt(4,19); }
        var dividendMag = qMag * dMag;
        var sQ = Math.random() < 0.5 ? -1 : 1;
        var sD = Math.random() < 0.5 ? -1 : 1;
        if(sQ === 1 && sD === 1){ if(Math.random() < 0.5) sQ = -1; else sD = -1; }
        var divSign = sD, divdSign = sQ * sD;
        var answer = sQ * qMag;
        function disp(mag, sign){ return sign < 0 ? '(−' + mag + ')' : String(mag); }
        return {display:disp(dividendMag, divdSign) + ' / ' + disp(dMag, divSign),
                answerNum:answer,
                answerStr:(answer < 0 ? '−' : '') + Math.abs(answer)};
      }
    }
  };

  function renderPicker(){
    var cards = '';
    for(var i=0; i<KATEGORIER.length; i++){
      var k = KATEGORIER[i];
      cards += '<button class="tabell-card" data-kat="' + k.id + '">'
        + '<div class="tabell-card-num">' + k.nr + '</div>'
        + '<div class="tabell-card-body">'
          + '<div class="tabell-card-namn">' + k.namn + '</div>'
          + '<div class="tabell-card-desc">' + k.desc + '</div>'
        + '</div>'
        + '<div style="color:var(--ink-faint);font-size:20px;">›</div>'
      + '</button>';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Beräkningar', 'Välj en sorts beräkning att öva på. Nivån anpassar sig medan du räknar.')
      + '<div class="tabell-level-grid">' + cards + '</div>'
    + '</div>';
    body.querySelectorAll('[data-kat]').forEach(function(btn){
      btn.onclick = function(){
        var cfg = CFG[btn.dataset.kat];
        cfg.koId = 'div-rakna';
        cfg.formagaKey = 'rakna';
        cfg.scoreKey = btn.dataset.kat;
        cfg.backLabel = 'Tillbaka till kategorier';
        if(cfg.forlang) renderDivForlang(body, cfg, renderPicker);
        else renderAddSingle(body, cfg, renderPicker);
      };
    });
  }
  renderPicker();
}

// Beräkningar – små tal genom förlängning (två mellanled-rutor: förlängd täljare/nämnare + svar)
function renderDivForlang(body, cfg, backFn){
  var level = 1, omgang = [], idx = 0, results = [], uppgNr = 0;
  function genOmgang(){
    var a = [];
    for(var i=0; i<8; i++) a.push(cfg.gen(level));
    return a;
  }
  function render(){
    if(idx >= omgang.length){
      var right = results.filter(function(x){ return x; }).length;
      var total = results.length;
      var adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.header, 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
        + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="dfl-back">' + cfg.backLabel + '</button></div>'
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; results = []; render();
      };
      document.getElementById('dfl-back').onclick = backFn;
      return;
    }
    var task = omgang[idx];
    uppgNr++;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(cfg.header, cfg.sub, level)
      + ((cfg.exempel && level === 1 && uppgNr <= 2) ? '<div class="rakna-kat-exempel">' + cfg.exempel + '</div>' : '')
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="div-forlang-rad">'
        + '<span class="rakna-svar-fast">' + task.display + '</span>'
        + '<span class="div-forlang-lika">=</span>'
        + '<span class="div-forlang-brak">'
          + '<input type="text" class="rakna-svar-input div-forlang-in" id="dfl-ft" inputmode="text" maxlength="10" autocomplete="off" placeholder="?">'
          + '<span class="div-forlang-streck"></span>'
          + '<input type="text" class="rakna-svar-input div-forlang-in" id="dfl-fn" inputmode="text" maxlength="10" autocomplete="off" placeholder="?">'
        + '</span>'
        + '<span class="div-forlang-lika">=</span>'
        + '<input type="text" class="rakna-svar-input div-forlang-svar" id="dfl-sv" inputmode="text" maxlength="12" autocomplete="off" placeholder="?">'
      + '</div>'
      + '<div class="rakna-uppdela-feedback" id="dfl-fb"></div>'
      + keypadHTML(cfg.ops)
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="dfl-check">Kontrollera</button>'
        + '<button class="btn subtle" id="dfl-back">' + cfg.backLabel + '</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var ft = document.getElementById('dfl-ft');
    var fn = document.getElementById('dfl-fn');
    var sv = document.getElementById('dfl-sv');
    setTimeout(function(){ ft.focus(); }, 50);
    [ft, fn, sv].forEach(function(inp){
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); check(); }
      });
    });
    document.getElementById('dfl-check').onclick = check;
    document.getElementById('dfl-back').onclick = backFn;

    function check(){
      var vFt = d3ParseNum(ft.value.replace(/−/g,'-'));
      var vFn = d3ParseNum(fn.value.replace(/−/g,'-'));
      var vSv = d3ParseNum(sv.value.replace(/−/g,'-'));
      var fb = document.getElementById('dfl-fb');
      fb.className = 'rakna-uppdela-feedback show';
      var facit = task.display + ' = ' + task.facitFt + ' / ' + task.facitFn + ' = ' + task.answerStr;
      if(vFt === null || vFn === null || vSv === null){
        fb.classList.add('wrong');
        fb.textContent = 'Fyll i alla tre rutorna med tal.';
        return;
      }
      ft.disabled = true; fn.disabled = true; sv.disabled = true;
      document.getElementById('dfl-check').disabled = true;
      var ts = getTutorScore(cfg.koId, cfg.formagaKey); ts.total++;
      var tsG = getTutorScore(cfg.koId, cfg.scoreKey); tsG.total++;
      var namnHeltal = Math.abs(vFn - Math.round(vFn)) < 1e-9 && vFn >= 1;
      // äkta förlängning: förlängd täljare/nämnare = original täljare/nämnare (samma faktor)
      var sammaFaktor = Math.abs(vFt * task.namnVal - vFn * task.taljare) < 1e-6 * Math.max(1, Math.abs(vFn * task.taljare));
      var svarRatt = Math.abs(vSv - task.answerNum) < 1e-6 * Math.max(1, Math.abs(task.answerNum));
      var ok = false;
      if(!namnHeltal){
        fb.classList.add('wrong');
        fb.textContent = 'Nämnaren måste bli ett heltal. ' + facit;
      } else if(!sammaFaktor){
        fb.classList.add('wrong');
        fb.textContent = 'Förläng täljare och nämnare med samma tal. ' + facit;
      } else if(!svarRatt){
        fb.classList.add('wrong');
        fb.textContent = 'Rätt förlängning, men fel svar. ' + facit;
      } else {
        ok = true;
        ft.classList.add('correct'); fn.classList.add('correct'); sv.classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + facit;
        ts.correct++; tsG.correct++;
      }
      results.push(ok);
      setTimeout(function(){ idx++; render(); }, ok ? 1700 : 2800);
    }
  }
  omgang = genOmgang();
  render();
}

// ---- KO 5: PROBLEMLÖSNING MED LÄSTAL ----
var DIV_LASTAL = [
  {level:1, text:'24 äpplen ska delas lika i 4 påsar. Hur många äpplen blir det i varje påse?', answer:6, enhet:'äpplen', exp:'24 / 4 = 6 äpplen.'},
  {level:1, text:'En buss har 56 platser fördelade på 8 rader. Hur många platser är det per rad?', answer:7, enhet:'platser', exp:'56 / 8 = 7 platser.'},
  {level:1, text:'En klass på 30 elever delas in i 5 lika stora grupper. Hur många elever är det i varje grupp?', answer:6, enhet:'elever', exp:'30 / 5 = 6 elever.'},
  {level:1, text:'En pizza på 12 bitar delas lika mellan 4 kompisar. Hur många bitar får var och en?', answer:3, enhet:'bitar', exp:'12 / 4 = 3 bitar.'},
  {level:1, text:'81 kr ska delas lika mellan 9 personer. Hur mycket får var och en?', answer:9, enhet:'kr', exp:'81 / 9 = 9 kr.'},
  {level:1, text:'En kartong rymmer 6 flaskor. Hur många kartonger behövs för 48 flaskor?', answer:8, enhet:'kartonger', exp:'48 / 6 = 8 kartonger.'},
  {level:1, text:'72 pärlor trärs på 8 lika långa armband. Hur många pärlor per armband?', answer:9, enhet:'pärlor', exp:'72 / 8 = 9 pärlor.'},

  {level:2, text:'En förening samlar in 1 750 kr som ska delas lika mellan 5 lag. Hur mycket får varje lag?', answer:350, enhet:'kr', exp:'1750 / 5 = 350 kr.'},
  {level:2, text:'En låda väger 936 kg och innehåller 8 lika tunga delar. Hur mycket väger en del?', answer:117, enhet:'kg', exp:'936 / 8 = 117 kg.'},
  {level:2, text:'En sträcka på 252 km körs på 6 timmar med jämn fart. Hur många km per timme?', answer:42, enhet:'km/h', exp:'252 / 6 = 42 km/h.'},
  {level:2, text:'En affär delar 1 480 kr i dricks lika mellan 4 anställda. Hur mycket får var och en?', answer:370, enhet:'kr', exp:'1480 / 4 = 370 kr.'},
  {level:2, text:'En skola har 855 elever fördelade på 9 årskurser lika. Hur många elever per årskurs?', answer:95, enhet:'elever', exp:'855 / 9 = 95 elever.'},
  {level:2, text:'En rulle tyg på 144 meter klipps i bitar på 6 meter. Hur många bitar blir det?', answer:24, enhet:'bitar', exp:'144 / 6 = 24 bitar.'},
  {level:2, text:'En tävling delar ut 2 100 kr lika på de 7 bästa. Hur mycket får var och en?', answer:300, enhet:'kr', exp:'2100 / 7 = 300 kr.'},

  {level:3, text:'En lastbil kör 5 600 km på en vecka med lika många km varje dag. Hur långt kör den per dag?', answer:800, enhet:'km', exp:'5600 / 7 = 800 km.'},
  {level:3, text:'En fabrik gör 36 000 muggar som packas 8 per kartong. Hur många kartonger behövs?', answer:4500, enhet:'kartonger', exp:'36000 / 8 = 4500 kartonger.'},
  {level:3, text:'2 304 elever ska åka på utflykt i bussar med 48 platser. Hur många bussar behövs?', answer:48, enhet:'bussar', exp:'2304 / 48 = 48 bussar.'},
  {level:3, text:'En odlare skördar 9 750 kg potatis som säljs i 25-kg-säckar. Hur många säckar blir det?', answer:390, enhet:'säckar', exp:'9750 / 25 = 390 säckar.'},
  {level:3, text:'En förening hyr en lokal för 18 000 kr per år. Hur mycket är det per månad?', answer:1500, enhet:'kr', exp:'18000 / 12 = 1500 kr.'},
  {level:3, text:'En vattentank på 4 500 liter töms jämnt på 15 minuter. Hur många liter töms per minut?', answer:300, enhet:'liter', exp:'4500 / 15 = 300 liter.'},
  {level:3, text:'126 000 kr ska delas lika mellan 36 delägare. Hur mycket får var och en?', answer:3500, enhet:'kr', exp:'126000 / 36 = 3500 kr.'}
];

function renderDivProblem(body){
  var level = 1, currentSet = [], answered = 0, rightCount = 0;
  function pickSet(){
    var pool = DIV_LASTAL.filter(function(p){ return p.level === level; });
    return shuffle(pool.slice()).slice(0, 3);
  }
  function start(){ currentSet = pickSet(); answered = 0; rightCount = 0; render(); }
  function render(){
    var tasks = '';
    for(var i=0; i<currentSet.length; i++){
      var p = currentSet[i];
      tasks += '<div class="prob-task" data-i="' + i + '">'
        + '<div class="prob-text">Lästal ' + (i+1) + ' av ' + currentSet.length + '</div>'
        + '<div style="font-size:15px;line-height:1.6;color:var(--ink);margin-bottom:12px;">' + p.text + '</div>'
        + '<div class="prob-svar-rad">'
          + '<span style="font-size:14px;color:var(--ink-soft);">Svar:</span>'
          + '<input type="text" class="prob-input" inputmode="text" maxlength="10" data-input="' + i + '" autocomplete="off" placeholder="?">'
          + '<span class="prob-enhet">' + p.enhet + '</span>'
          + '<button class="btn primary" data-check="' + i + '">Kontrollera</button>'
        + '</div>'
        + '<div class="prob-notes"><div class="prob-notes-rubrik">Räkna här</div>'
          + '<textarea class="prob-notes-area" rows="4" placeholder="Ställ upp och räkna här"></textarea></div>'
        + '<div class="prob-feedback" id="div-prob-fb-' + i + '"></div>'
      + '</div>';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Problemlösning med lästal', 'Lös de tre lästalen. Räkna i anteckningsblocket och skriv svaret.', level)
      + tasks
      + '<div id="div-prob-summary-anchor"></div>'
    + '</div>';
    body.querySelectorAll('[data-check]').forEach(function(b){
      b.addEventListener('click', function(){ check(parseInt(b.dataset.check, 10)); });
    });
    body.querySelectorAll('[data-foto]').forEach(function(b){
      var i = b.dataset.foto;
      var fileInput = body.querySelector('[data-fotoinput="' + i + '"]');
      b.addEventListener('click', function(){ fileInput.click(); });
      fileInput.addEventListener('change', function(e){
        var f = e.target.files && e.target.files[0];
        if(!f) return;
        var reader = new FileReader();
        reader.onload = function(ev){
          var prev = document.getElementById('div-prob-foto-' + i);
          prev.innerHTML = '<div class="prob-foto-cap">Din fotograferade lösning</div>'
            + '<img src="' + ev.target.result + '" alt="Fotograferad lösning">'
            + '<div><button type="button" class="prob-foto-remove" data-rmfoto="' + i + '">Ta bort bild</button></div>';
          prev.querySelector('[data-rmfoto]').addEventListener('click', function(){
            prev.innerHTML = '';
            fileInput.value = '';
          });
        };
        reader.readAsDataURL(f);
      });
    });
  }
  function check(i){
    var p = currentSet[i];
    var inp = body.querySelector('[data-input="' + i + '"]');
    var fb = document.getElementById('div-prob-fb-' + i);
    if(inp.disabled) return;
    fb.classList.remove('correct','wrong');
    fb.classList.add('show');
    inp.classList.remove('correct','wrong');
    var ts = getTutorScore('div-problem','problem');
    ts.total++;
    var stu = d3ParseNum(inp.value);
    var wasRight = false;
    if(stu === null){
      fb.classList.add('wrong');
      fb.textContent = 'Skriv ett tal som svar.';
      ts.total--;
      return;
    }
    if(Math.abs(stu - p.answer) < 1e-6 * Math.max(1, Math.abs(p.answer))){
      inp.classList.add('correct');
      fb.classList.add('correct');
      fb.textContent = 'Rätt! ' + p.exp;
      ts.correct++;
      wasRight = true;
    } else {
      inp.classList.add('wrong');
      fb.classList.add('wrong');
      fb.textContent = 'Inte rätt. Rätt svar: ' + d3FmtNum(p.answer) + ' ' + p.enhet + '. ' + p.exp;
    }
    inp.disabled = true;
    body.querySelector('[data-check="' + i + '"]').disabled = true;
    if(wasRight) rightCount++;
    answered++;
    if(answered >= currentSet.length){ setTimeout(showSummary, 700); }
  }
  function showSummary(){
    var anchor = document.getElementById('div-prob-summary-anchor');
    if(!anchor) return;
    var nivaKnappar = '<div class="prob-niva-val">';
    if(level < 3) nivaKnappar += '<button class="btn primary" id="div-prob-svarare">Öka svårighetsgrad →</button>';
    nivaKnappar += '<button class="btn" id="div-prob-samma">Samma nivå igen</button>';
    if(level > 1) nivaKnappar += '<button class="btn subtle" id="div-prob-lattare">← Lättare nivå</button>';
    nivaKnappar += '</div>';
    anchor.innerHTML = '<div style="margin-top:20px;">'
      + renderSummaryCard({right:rightCount, total:currentSet.length, nextLabel:'Nya lästal'})
      + nivaKnappar
    + '</div>';
    document.getElementById('summary-next-btn').onclick = start;
    var svarare = document.getElementById('div-prob-svarare');
    if(svarare) svarare.onclick = function(){ level = Math.min(3, level+1); start(); };
    var lattare = document.getElementById('div-prob-lattare');
    if(lattare) lattare.onclick = function(){ level = Math.max(1, level-1); start(); };
    document.getElementById('div-prob-samma').onclick = start;
    anchor.scrollIntoView({behavior:'smooth', block:'start'});
  }
  start();
}

// ---- SJÄLVSKATTNINGSMATRIS – DIVISION ----

