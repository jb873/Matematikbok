/* ============================================================
   FAMILJ B · MOTOR: prio-motorerna (prioritering: Samband/Berakning/Metod/Lagar + data (PRIO_TPL/LAG_GEN) + sub-renderare (AI-matris EXKLUDERAD))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderPrioSamband(body){
  var KATEGORIER = [
    {id:'addsub',  nr:1, namn:'Addition och subtraktion', desc:'Hitta det tal som saknas i rutan.'},
    {id:'multdiv', nr:2, namn:'Multiplikation och division', desc:'Hitta det tal som saknas – hela tal och decimaltal.'}
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
      + exerciseHeader('Samband mellan räknesätt', 'Välj vad du vill öva på. Nivån anpassar sig medan du räknar.')
      + '<div class="tabell-level-grid">' + cards + '</div>'
    + '</div>';
    body.querySelectorAll('[data-kat]').forEach(function(btn){
      btn.onclick = function(){ renderSambandEngine(body, btn.dataset.kat, renderPicker); };
    });
  }
  renderPicker();
}

function renderSambandEngine(body, mode, backFn){
  var level = 1, omgang = [], idx = 0, results = [], OMG = 6;
  var HEADER = mode === 'multdiv' ? 'Samband · multiplikation och division'
                                  : 'Samband · addition och subtraktion';

  function genAddSub(){
    var box, other, sum;
    if(level === 1){ box = d3RandInt(2, 18); other = d3RandInt(2, 18); }
    else if(level === 2){ box = d3RandInt(10, 95); other = d3RandInt(10, 95); }
    else {
      box = d3RandInt(15, 240); other = d3RandInt(15, 240);
      if(Math.random() < 0.5){ box = box / 10; other = other / 10; }
    }
    sum = box + other;
    var form = randPick(['a','b','c','d']);
    if(form === 'a') return {parts:[prioNum(other),' + ','□',' = ',prioNum(sum)], answer:box};
    if(form === 'b') return {parts:['□',' + ',prioNum(other),' = ',prioNum(sum)], answer:box};
    if(form === 'c') return {parts:[prioNum(sum),' − ','□',' = ',prioNum(other)], answer:box};
    return {parts:['□',' − ',prioNum(other),' = ',prioNum(box)], answer:sum};
  }
  function genMultDiv(){
    var box, other, prod;
    if(level === 1){ box = d3RandInt(2, 10); other = d3RandInt(2, 10); }
    else if(level === 2){ box = d3RandInt(3, 12); other = d3RandInt(11, 25); }
    else {
      box = d3RandInt(2, 9); other = randPick([0.5, 1.5, 2.5, 0.2, 0.4, 4, 6, 8]);
    }
    prod = Math.round(box * other * 100) / 100;
    var form = randPick(['a','b','c','d']);
    if(form === 'a') return {parts:[prioNum(other),' · ','□',' = ',prioNum(prod)], answer:box};
    if(form === 'b') return {parts:['□',' · ',prioNum(other),' = ',prioNum(prod)], answer:box};
    if(form === 'c') return {parts:[prioNum(prod),' / ','□',' = ',prioNum(other)], answer:box};
    return {parts:['□',' / ',prioNum(other),' = ',prioNum(box)], answer:prod};
  }
  function genTask(){ return mode === 'multdiv' ? genMultDiv() : genAddSub(); }
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
        + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="smb-back">Tillbaka till samband</button></div>'
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; results = []; render();
      };
      document.getElementById('smb-back').onclick = backFn;
      return;
    }
    var task = omgang[idx];
    var eqHTML = '';
    for(var i=0; i<task.parts.length; i++){
      if(task.parts[i] === '□'){
        eqHTML += '<input type="text" class="prio-box-input" id="smb-input" inputmode="text" maxlength="7" autocomplete="off">';
      } else {
        eqHTML += '<span class="prio-eq-part">' + task.parts[i] + '</span>';
      }
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(HEADER, 'Skriv talet som saknas i rutan.', level)
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="prio-eq-rad">' + eqHTML + '</div>'
      + '<div class="rakna-uppdela-feedback" id="smb-fb"></div>'
      + keypadHTML(mode === 'multdiv' ? [','] : [])
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="smb-check">Kontrollera</button>'
        + '<button class="btn subtle" id="smb-back">Tillbaka till samband</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var input = document.getElementById('smb-input');
    setTimeout(function(){ input.focus(); }, 50);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); check(); }
    });
    document.getElementById('smb-back').onclick = backFn;
    function check(){
      var fb = document.getElementById('smb-fb');
      fb.className = 'rakna-uppdela-feedback show';
      var stu = d3ParseNum(input.value);
      input.disabled = true;
      document.getElementById('smb-check').disabled = true;
      var ts = getTutorScore('prio-samband','rakna');
      var tsG = getTutorScore('prio-samband', mode);
      ts.total++; tsG.total++;
      var ok = stu !== null && Math.abs(stu - task.answer) < 1e-6;
      if(ok){
        input.classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! Talet i rutan är ' + prioNum(task.answer) + '.';
        ts.correct++; tsG.correct++;
      } else {
        input.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Inte rätt. Talet i rutan ska vara ' + prioNum(task.answer) + '.';
      }
      results.push(ok);
      setTimeout(function(){ idx++; render(); }, ok ? 1700 : 2900);
    }
    document.getElementById('smb-check').onclick = check;
  }
  omgang = genOmgang();
  render();
}

// ============================================================
// KO 2: PRIORITERINGSREGELN – delade uttrycksmallar
// ============================================================
// Varje mall returnerar {expr, answer, steps}.
// steg: lista av rader; varje rad = lista av segment {t:'fix'|'blank', v}.
// Sista raden = [{t:'blank', v:answer}].
// steg: lista av reduktionsrader (utan likhetstecken). Likhetstecknet ritas
// strukturellt av trappan; svaret (answer) blir högerledet på SISTA raden.
// Varje steg-rad = lista av celler. Cell = {t:'num',v:tal} eller {t:'op',v:tecken}.
// ALLA celler är elevinmatningar – eleven för själv ned varje tal och tecken.
// Nivå 1–2 har enkla tal och inga negativa tal; negativa tal först på nivå 3.
var PRIO_TPL = {
  1: [
    function(){ // a + b·c
      var a=d3RandInt(2,9), b=d3RandInt(2,6), c=d3RandInt(2,6);
      var bc=b*c, ans=a+bc;
      return {expr:a+' + '+b+' · '+c, answer:ans,
        steps:[[{t:'num',v:a},{t:'op',v:'+'},{t:'num',v:bc}]]};
    },
    function(){ // a·b + c
      var a=d3RandInt(2,6), b=d3RandInt(2,6), c=d3RandInt(2,9);
      var ab=a*b, ans=ab+c;
      return {expr:a+' · '+b+' + '+c, answer:ans,
        steps:[[{t:'num',v:ab},{t:'op',v:'+'},{t:'num',v:c}]]};
    },
    function(){ // a·b + c·d
      var a=d3RandInt(2,5), b=d3RandInt(2,5), c=d3RandInt(2,5), d=d3RandInt(2,5);
      var ab=a*b, cd=c*d, ans=ab+cd;
      return {expr:a+' · '+b+' + '+c+' · '+d, answer:ans,
        steps:[[{t:'num',v:ab},{t:'op',v:'+'},{t:'num',v:cd}]]};
    },
    function(){ // a·b − c  (ab > c, alltid positivt)
      var a=d3RandInt(2,6), b=d3RandInt(2,6), ab=a*b, c=d3RandInt(1,ab-1);
      var ans=ab-c;
      return {expr:a+' · '+b+' − '+c, answer:ans,
        steps:[[{t:'num',v:ab},{t:'op',v:'−'},{t:'num',v:c}]]};
    }
  ],
  2: [
    function(){ // (a−b) + (c+d)
      var b=d3RandInt(2,15), ab=d3RandInt(3,20), a=b+ab, c=d3RandInt(2,15), d=d3RandInt(2,15);
      var cd=c+d, ans=ab+cd;
      return {expr:'('+a+' − '+b+') + ('+c+' + '+d+')', answer:ans,
        steps:[[{t:'num',v:ab},{t:'op',v:'+'},{t:'num',v:cd}]]};
    },
    function(){ // a − b/c + d
      var c=d3RandInt(2,9), q=d3RandInt(2,9), b=c*q, a=d3RandInt(q+2,q+30), d=d3RandInt(2,15);
      var ans=a-q+d;
      return {expr:a+' − '+b+' / '+c+' + '+d, answer:ans,
        steps:[[{t:'num',v:a},{t:'op',v:'−'},{t:'num',v:q},{t:'op',v:'+'},{t:'num',v:d}]]};
    },
    function(){ // (a−b)/c + d
      var c=d3RandInt(2,9), q=d3RandInt(2,9), diff=c*q, b=d3RandInt(2,20), a=b+diff, d=d3RandInt(2,15);
      var ans=q+d;
      return {expr:'('+a+' − '+b+') / '+c+' + '+d, answer:ans,
        steps:[
          [{t:'num',v:diff},{t:'op',v:'/'},{t:'num',v:c},{t:'op',v:'+'},{t:'num',v:d}],
          [{t:'num',v:q},{t:'op',v:'+'},{t:'num',v:d}]
        ]};
    }
  ],
  3: [
    function(){ // a − b·c + d·e
      var a=d3RandInt(20,60), b=d3RandInt(3,12), c=d3RandInt(2,5), d=d3RandInt(2,9), e=d3RandInt(2,5);
      var bc=b*c, de=d*e, ans=a-bc+de;
      return {expr:a+' − '+b+' · '+c+' + '+d+' · '+e, answer:ans,
        steps:[[{t:'num',v:a},{t:'op',v:'−'},{t:'num',v:bc},{t:'op',v:'+'},{t:'num',v:de}]]};
    },
    function(){ // a + (−b)·c − d/(−e)  (negativa tal)
      var b=d3RandInt(2,9), c=d3RandInt(2,9), e=d3RandInt(2,9), q=d3RandInt(2,9), d=e*q, a=d3RandInt(2,20);
      var t1=-(b*c), t2=-q, ans=a+t1-t2;
      return {expr:a+' + (−'+b+') · '+c+' − '+d+' / (−'+e+')', answer:ans,
        steps:[[{t:'num',v:a},{t:'op',v:'+'},{t:'num',v:t1},{t:'op',v:'−'},{t:'num',v:t2}]]};
    },
    function(){ // a − b·(−c) + d  (negativa tal, stora tal)
      var a=d3RandInt(100,900), b=d3RandInt(2,9), c=d3RandInt(2,9), d=d3RandInt(50,300);
      var bc=b*(-c), ans=a-bc+d;
      return {expr:a+' − '+b+' · (−'+c+') + '+d, answer:ans,
        steps:[[{t:'num',v:a},{t:'op',v:'−'},{t:'num',v:bc},{t:'op',v:'+'},{t:'num',v:d}]]};
    }
  ]
};
var PRIO_NIVANAMN = {1:'enkla uttryck', 2:'parenteser och division', 3:'komplexare uttryck med negativa tal'};

// ---- KO 2, förmåga RÄKNA: beräkningar ----
function renderPrioBerakning(body){
  var level = 1, omgang = [], idx = 0, results = [], OMG = 5;
  function genOmgang(){
    var a = [];
    for(var i=0; i<OMG; i++) a.push(randPick(PRIO_TPL[level])());
    return a;
  }
  function render(){
    if(idx >= omgang.length){
      var right = results.filter(function(x){ return x; }).length;
      var total = results.length;
      var adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader('Beräkningar med prioriteringsregeln', 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; results = []; render();
      };
      return;
    }
    var task = omgang[idx];
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Beräkningar — nivå ' + level, 'Nivå ' + level + ': ' + PRIO_NIVANAMN[level]
          + '. Räkna ut hela uttrycket. Kom ihåg ordningen: parenteser, sedan · och /, sist + och −.', level)
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="prio-expr-stor">' + task.expr + ' <span class="prio-expr-eq">=</span></div>'
      + '<div class="rakna-svar-rad"><input type="text" class="rakna-svar-input" id="ber-input" inputmode="text" maxlength="9" autocomplete="off" placeholder="?"></div>'
      + '<div class="rakna-uppdela-feedback" id="ber-fb"></div>'
      + keypadHTML(['−'])
      + '<div style="margin-top:16px;text-align:center;">'
        + '<button class="btn primary" id="ber-check">Kontrollera</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var input = document.getElementById('ber-input');
    setTimeout(function(){ input.focus(); }, 50);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); check(); }
    });
    function check(){
      var fb = document.getElementById('ber-fb');
      fb.className = 'rakna-uppdela-feedback show';
      var stu = d3ParseNum(input.value);
      input.disabled = true;
      document.getElementById('ber-check').disabled = true;
      var ts = getTutorScore('prio-prioritering','rakna');
      ts.total++;
      var ok = stu !== null && Math.abs(stu - task.answer) < 1e-6;
      if(ok){
        input.classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + task.expr + ' = ' + prioNum(task.answer) + '.';
        ts.correct++;
      } else {
        input.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Inte rätt. ' + task.expr + ' = ' + prioNum(task.answer) + '.';
      }
      results.push(ok);
      setTimeout(function(){ idx++; render(); }, ok ? 1800 : 3000);
    }
    document.getElementById('ber-check').onclick = check;
  }
  omgang = genOmgang();
  render();
}

// ---- Gemensam trappa-rendering: likhetstecknen i en kolumn ----
// Rad = LHS | = | RHS. Varje cell (tal OCH tecken) är en elevinmatning –
// eleven för själv ned alla tal och tecken. RHS = svaret på sista raden.
function prioTrappaHTML(task){
  // Lodrät uppställning enligt kapitel 3-modellen:
  // uppgiftsrad överst, sedan en steg-rad per förenklingsvarv med en
  // vänsterled-ruta (rättas på värde) och, på sista raden, en svarsruta.
  // Varje steg-rads värde räknas ur cellerna i task.steps.
  function radVarde(line){
    var s = '';
    for(var i=0; i<line.length; i++){
      var c = line[i];
      if(c.t === 'op'){
        s += prioNormOp(c.v).replace('−','-').replace('·','*');
      } else {
        // negativa tal sätts i parentes så uttrycket blir giltigt (t.ex. 17 - (-5))
        var raw = String(c.v).replace('−','-');
        if(/^-/.test(raw)) raw = '(' + raw + ')';
        s += raw;
      }
    }
    return prioEval(s);
  }
  var html = '<div class="prio-metod-trappa">'
    + '<div class="prio-uppgift-rad"><span class="prio-uppgift-expr">' + task.expr + '</span><span class="prio-eq">=</span></div>';
  for(var s=0; s<task.steps.length; s++){
    var isLast = (s === task.steps.length - 1);
    var vlValue = radVarde(task.steps[s]);
    html += '<div class="prio-steg">'
      + '<input type="text" class="prio-step-input prio-vl" data-vl="' + vlValue + '" inputmode="text" autocomplete="off" placeholder="förenkla">'
      + '<span class="prio-eq">=</span>'
      + (isLast
          ? '<input type="text" class="prio-step-input prio-svar prio-step-answer" data-answer="' + task.answer + '" inputmode="text" autocomplete="off" placeholder="svar">'
          : '<span class="prio-tom"></span>')
    + '</div>';
  }
  return html + '</div>';
}
// ---- Räknelagar på EN rad: en horisontell likhetskedja, inte en trappa ----
function prioRadHTML(task){
  function cell(c, extra){
    var base = c.t === 'op' ? 'prio-step-input prio-step-op' : 'prio-step-input prio-step-num';
    if(extra) base += ' ' + extra;
    var ml = c.t === 'op' ? '1' : '6';
    return '<input type="text" class="' + base + '" data-expect="' + c.v
      + '" inputmode="text" maxlength="' + ml + '" autocomplete="off">';
  }
  var html = '<div class="prio-rad">'
    + '<span class="prio-rad-expr">' + task.expr + '</span>'
    + '<span class="prio-rad-eq">=</span>';
  for(var s=0; s<task.steps.length; s++){
    var line = task.steps[s];
    for(var i=0; i<line.length; i++) html += cell(line[i]);
    html += '<span class="prio-rad-eq">=</span>';
  }
  html += cell({t:'num', v:task.answer}, 'prio-step-answer');
  return html + '</div>';
}
// Normaliserar operatortecken så att t.ex. - och −, * och · jämställs.
function prioNormOp(c){
  return String(c == null ? '' : c).trim()
    .replace(/\*/g, '·').replace(/[xX]/g, '·').replace(/-/g, '−');
}
// Rättar den lodräta uppställningen: varje vänsterled på värde, svaret exakt.
// Returnerar true om allt är rätt.
function prioCheckStaircase(card){
  var correct = true;
  Array.from(card.querySelectorAll('.prio-vl')).forEach(function(inp){
    inp.disabled = true;
    var elevVarde = prioEval(inp.value);
    var mal = Number(inp.dataset.vl);
    var ok = elevVarde !== null && Math.abs(elevVarde - mal) < 1e-6;
    inp.classList.add(ok ? 'correct' : 'wrong');
    if(!ok) correct = false;
  });
  var ans = card.querySelector('.prio-svar');
  if(ans){
    ans.disabled = true;
    var sv = d3ParseNum(ans.value);
    var okA = sv !== null && Math.abs(sv - Number(ans.dataset.answer)) < 1e-6;
    ans.classList.add(okA ? 'correct' : 'wrong');
    if(!okA) correct = false;
  }
  return correct;
}

// ---- KO 2, förmåga METOD: räkna nedåt steg för steg ----
function renderPrioMetod(body){
  var level = 1, omgangResults = [], OMG = 4;
  function renderTask(){
    var task = randPick(PRIO_TPL[level])();
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Visa metoden — nivå ' + level, 'Nivå ' + level + ': ' + PRIO_NIVANAMN[level]
          + '. Räkna nedåt. Skriv det förenklade ledet i rutan före likhetstecknet och svaret i rutan efter.', level)
      + prioTrappaHTML(task)
      + '<div class="rakna-uppdela-feedback" id="met-fb"></div>'
      + keypadHTML(['+','−','·','/'])
      + '<div style="margin-top:16px;text-align:center;">'
        + '<button class="btn primary" id="met-check">Kontrollera</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var allInputs = Array.from(card.querySelectorAll('.prio-step-input'));
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
      var correct = prioCheckStaircase(card);
      var fb = document.getElementById('met-fb');
      fb.className = 'rakna-uppdela-feedback show';
      document.getElementById('met-check').disabled = true;
      var ts = getTutorScore('prio-prioritering','metod');
      ts.total++;
      omgangResults.push(correct);
      if(correct){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! Du följde prioriteringsregeln hela vägen ned. ' + task.expr + ' = ' + prioNum(task.answer) + '.';
        ts.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = 'Något steg blev fel. Rätt svar: ' + task.expr + ' = ' + prioNum(task.answer)
          + '. Kontrollera raderna uppifrån och ned.';
      }
      if(omgangResults.length >= OMG) setTimeout(showSummary, correct ? 2000 : 3400);
      else setTimeout(renderTask, correct ? 2000 : 3400);
    }
    document.getElementById('met-check').onclick = check;
  }
  function showSummary(){
    var right = omgangResults.filter(function(x){ return x; }).length;
    var total = omgangResults.length;
    var adj = adjustLevel(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Visa metoden för prioriteringsregeln', 'Du klarade ' + right + ' av ' + total + ' uträkningar.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){
      omgangResults = []; renderTask();
    };
  }
  renderTask();
}

// ============================================================
// KO 3: RÄKNELAGAR
// ============================================================
function renderPrioLagar(body){
  var KATEGORIER = [
    {id:'kommutativa', nr:1, namn:'Kommutativa lagen', desc:'Termernas eller faktorernas ordning spelar ingen roll.'},
    {id:'associativa', nr:2, namn:'Associativa lagen', desc:'Gruppera om så att ett tal blir lätt att räkna först.'},
    {id:'distributiva', nr:3, namn:'Distributiva lagen', desc:'Multiplicera in talet i parentesen, term för term.'}
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
      + exerciseHeader('Räknelagar', 'Välj en lag att öva på. Nivån anpassar sig medan du räknar.')
      + '<div class="tabell-level-grid">' + cards + '</div>'
    + '</div>';
    body.querySelectorAll('[data-kat]').forEach(function(btn){
      btn.onclick = function(){ renderLagOvning(body, btn.dataset.kat, renderPicker); };
    });
  }
  renderPicker();
}

// Generatorer – var och en returnerar {expr, answer, steps, sub}
var LAG_GEN = {
  kommutativa: function(level){
    var op = randPick(['+','·']);
    var a, b;
    if(op === '+'){
      if(level === 1){ a=d3RandInt(3,20); b=d3RandInt(3,20); }
      else if(level === 2){ a=d3RandInt(12,90); b=d3RandInt(12,90); }
      else { a=d3RandInt(40,400); b=d3RandInt(40,400); }
      var s=a+b;
      return {expr:a+' + '+b, answer:s,
        sub:'Kommutativa lagen: a + b = b + a. Skriv samma summa med termerna i omvänd ordning.',
        steps:[[{t:'num',v:b},{t:'op',v:'+'},{t:'num',v:a}]]};
    } else {
      if(level === 1){ a=d3RandInt(2,10); b=d3RandInt(2,10); }
      else if(level === 2){ a=d3RandInt(3,12); b=d3RandInt(4,20); }
      else { a=d3RandInt(3,12); b=d3RandInt(12,40); }
      var p=a*b;
      return {expr:a+' · '+b, answer:p,
        sub:'Kommutativa lagen: a · b = b · a. Skriv samma produkt med faktorerna i omvänd ordning.',
        steps:[[{t:'num',v:b},{t:'op',v:'·'},{t:'num',v:a}]]};
    }
  },
  associativa: function(level){
    var op = randPick(['+','·']);
    if(op === '·'){
      var parL = {1:[[5,2],[2,5],[4,5],[5,4]],
                  2:[[5,2],[2,5],[4,5],[5,4],[5,6],[6,5],[5,8],[8,5]],
                  3:[[25,4],[4,25],[5,20],[20,5],[5,8],[8,5],[2,50],[50,2]]};
      var pr = randPick(parL[level]);
      var p=pr[0], r=pr[1], comb=p*r;
      var m = level===1 ? d3RandInt(2,9) : (level===2 ? d3RandInt(3,15) : d3RandInt(4,20));
      var ans=comb*m;
      return {expr:p+' · '+m+' · '+r, answer:ans,
        sub:'Associativa lagen: gruppera om så att du först multiplicerar de två tal som ger ett enkelt tal.',
        steps:[[{t:'num',v:comb},{t:'op',v:'·'},{t:'num',v:m}]]};
    } else {
      var parA = {1:[[2,8],[8,2],[3,7],[7,3],[4,6],[6,4],[1,9],[9,1]],
                  2:[[2,8],[8,2],[3,7],[7,3],[15,5],[5,15],[12,8],[8,12]],
                  3:[[15,5],[5,15],[12,8],[8,12],[25,5],[5,25],[35,15],[15,35]]};
      var pa = randPick(parA[level]);
      var pp=pa[0], rr=pa[1], cb=pp+rr;
      var mm = level===1 ? d3RandInt(3,30) : (level===2 ? d3RandInt(10,90) : d3RandInt(20,200));
      var an=cb+mm;
      return {expr:pp+' + '+mm+' + '+rr, answer:an,
        sub:'Associativa lagen: gruppera om så att du först adderar de två tal som ger ett jämnt tal.',
        steps:[[{t:'num',v:cb},{t:'op',v:'+'},{t:'num',v:mm}]]};
    }
  },
  distributiva: function(level){
    var a, b, c;
    if(level === 1){ a=d3RandInt(2,5); b=d3RandInt(2,9); c=d3RandInt(2,9); }
    else if(level === 2){ a=d3RandInt(3,9); b=d3RandInt(3,12); c=d3RandInt(3,12); }
    else { a=d3RandInt(4,12); b=d3RandInt(5,19); c=d3RandInt(5,19); }
    var ab=a*b, ac=a*c, ans=ab+ac;
    return {expr:a+' · ('+b+' + '+c+')', answer:ans,
      sub:'Distributiva lagen: a · (b + c) = a · b + a · c. Multiplicera in talet i parentesen, term för term.',
      steps:[
        [{t:'num',v:a},{t:'op',v:'·'},{t:'num',v:b},{t:'op',v:'+'},{t:'num',v:a},{t:'op',v:'·'},{t:'num',v:c}],
        [{t:'num',v:ab},{t:'op',v:'+'},{t:'num',v:ac}]
      ]};
  }
};
var LAG_NAMN = {kommutativa:'Kommutativa lagen', associativa:'Associativa lagen', distributiva:'Distributiva lagen'};
var LAG_OMG  = {kommutativa:6, associativa:5, distributiva:4};

function renderLagOvning(body, katId, backFn){
  var level = 1, omgangResults = [], OMG = LAG_OMG[katId];
  function renderTask(){
    var task = LAG_GEN[katId](level);
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(LAG_NAMN[katId] + ' — nivå ' + level, task.sub, level)
      + prioRadHTML(task)
      + '<div class="rakna-uppdela-feedback" id="lag-fb"></div>'
      + keypadHTML(['+','·'])
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="lag-check">Kontrollera</button>'
        + '<button class="btn subtle" id="lag-back">Tillbaka till räknelagar</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var allInputs = Array.from(card.querySelectorAll('.prio-step-input'));
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
    document.getElementById('lag-back').onclick = backFn;
    function check(){
      var correct = prioCheckStaircase(card);
      var fb = document.getElementById('lag-fb');
      fb.className = 'rakna-uppdela-feedback show';
      document.getElementById('lag-check').disabled = true;
      var ts = getTutorScore('prio-lagar','rakna');
      var tsG = getTutorScore('prio-lagar', katId);
      ts.total++; tsG.total++;
      omgangResults.push(correct);
      if(correct){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + task.expr + ' = ' + prioNum(task.answer) + '.';
        ts.correct++; tsG.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = 'Inte rätt. ' + task.expr + ' = ' + prioNum(task.answer) + '. Kontrollera mellanleden.';
      }
      if(omgangResults.length >= OMG) setTimeout(showSummary, correct ? 1900 : 3200);
      else setTimeout(renderTask, correct ? 1900 : 3200);
    }
    document.getElementById('lag-check').onclick = check;
  }
  function showSummary(){
    var right = omgangResults.filter(function(x){ return x; }).length;
    var total = omgangResults.length;
    var adj = adjustLevel(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(LAG_NAMN[katId], 'Du klarade ' + right + ' av ' + total + '.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="lag-tillbaka">Tillbaka till räknelagar</button></div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults = []; renderTask(); };
    document.getElementById('lag-tillbaka').onclick = backFn;
  }
  renderTask();
}

// ============================================================
// SJÄLVSKATTNINGSMATRIS – PRIORITERINGSREGELN OCH LAGAR
// ============================================================

