/* ============================================================
   FAMILJ B · MOTOR: neg-motorerna (negativa tal: Begrepp/Rakna + sub-renderare (Talfoljd/Storleksordna) (AI-matris EXKLUDERAD))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderNegBegrepp(body){
  var KAT = [
    {id:'motsatta',      nr:1, namn:'Motsatta talet',  desc:'Talet som ligger lika långt från noll åt andra hållet.'},
    {id:'storleksordna', nr:2, namn:'Storleksordna',   desc:'Ordna positiva och negativa tal från minst till störst.'},
    {id:'talfoljd',      nr:3, namn:'Talföljder',      desc:'Vilka tre tal kommer härnäst i mönstret?'}
  ];
  negPicker(body, 'Begrepp och förståelse', 'Välj vad du vill öva på. Nivån anpassar sig medan du räknar.',
    KAT, function(katId, backFn){
      if(katId === 'motsatta'){
        negCalcEngine(body, {
          title:'Motsatta talet', koId:'neg-begrepp', forKey:'begrepp', scoreKey:'motsatta',
          sub:'Skriv det motsatta talet – samma avstånd från noll, men andra sidan.',
          keypadOps:['−',','], OMG:6, gen:negMotsattaGen
        }, backFn);
      } else if(katId === 'storleksordna'){
        renderNegStorleksordna(body, backFn);
      } else {
        renderNegTalfoljd(body, backFn);
      }
    });
}

function negMotsattaGen(level){
  var n;
  if(level === 1){ n = d3RandInt(1,15); }
  else if(level === 2){ n = d3RandInt(10,99); }
  else { n = d3RandInt(11,199) / 10; }
  if(Math.random() < 0.5) n = -n;
  return {
    q: 'Vilket är det motsatta talet till <span class="neg-expr">' + prioNum(n) + '</span>?',
    answer: -n
  };
}

// ---- KO 1: TALFÖLJDER ----
function renderNegTalfoljd(body, backFn){
  var level = 1, omgangResults = [], OMG = 5;
  function genSeq(){
    var step, start;
    if(level === 1){ step = d3RandInt(1,4); start = -d3RandInt(3,12); }
    else if(level === 2){ step = d3RandInt(1,5)/10; start = -d3RandInt(8,40)/10; }
    else { step = d3RandInt(2,9)/10; start = -d3RandInt(15,55)/10; }
    if(Math.random() < 0.4) step = -step;
    var terms = [];
    for(var i=0; i<6; i++) terms.push(Math.round((start + i*step)*100)/100);
    return {given: terms.slice(0,3), answers: terms.slice(3)};
  }
  function render(task){
    var cells = '';
    task.given.forEach(function(t){
      cells += '<span class="neg-seq-term">' + prioNum(t) + '</span>';
    });
    for(var i=0; i<3; i++){
      cells += '<input type="text" class="neg-seq-input" data-i="' + i + '" inputmode="text" maxlength="7" autocomplete="off">';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Talföljder — nivå ' + level, 'Vilka tre tal kommer härnäst? Hitta mönstret och fyll i.', level)
      + '<div class="neg-seq">' + cells + '</div>'
      + '<div class="rakna-uppdela-feedback" id="seq-fb"></div>'
      + keypadHTML(['−',','])
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="seq-check">Kontrollera</button>'
        + '<button class="btn subtle" id="seq-back">Tillbaka till begrepp</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    bindKeypad(card);
    var inputs = Array.from(card.querySelectorAll('.neg-seq-input'));
    setTimeout(function(){ if(inputs.length) inputs[0].focus(); }, 50);
    inputs.forEach(function(inp, i){
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
          e.preventDefault();
          if(i < inputs.length - 1) inputs[i+1].focus(); else check();
        }
      });
    });
    document.getElementById('seq-back').onclick = backFn;
    function check(){
      var correct = true;
      inputs.forEach(function(inp, i){
        var stu = d3ParseNum(inp.value);
        inp.disabled = true;
        if(stu !== null && Math.abs(stu - task.answers[i]) < 1e-6){ inp.classList.add('correct'); }
        else { inp.classList.add('wrong'); correct = false; }
      });
      var fb = document.getElementById('seq-fb');
      fb.className = 'rakna-uppdela-feedback show';
      document.getElementById('seq-check').disabled = true;
      var ts = getTutorScore('neg-begrepp','begrepp');
      var tsG = getTutorScore('neg-begrepp','talfoljd');
      ts.total++; tsG.total++;
      omgangResults.push(correct);
      if(correct){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! Mönstret fortsätter ' + task.answers.map(prioNum).join(', ') + '.';
        ts.correct++; tsG.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = 'Inte riktigt. Talföljden fortsätter ' + task.answers.map(prioNum).join(', ') + '.';
      }
      if(omgangResults.length >= OMG) setTimeout(showSummary, correct ? 1900 : 3100);
      else setTimeout(function(){ render(genSeq()); }, correct ? 1900 : 3100);
    }
    document.getElementById('seq-check').onclick = check;
  }
  function showSummary(){
    var right = omgangResults.filter(function(x){ return x; }).length;
    var total = omgangResults.length;
    var adj = adjustLevel(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Talföljder', 'Du klarade ' + right + ' av ' + total + '.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="seq-tillbaka">Tillbaka till begrepp</button></div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults = []; render(genSeq()); };
    document.getElementById('seq-tillbaka').onclick = backFn;
  }
  render(genSeq());
}

// ---- KO 1: STORLEKSORDNA ----
function renderNegStorleksordna(body, backFn){
  var level = 1, omgangResults = [], OMG = 5;
  var nums = [], shuffledNums = [], placed = [], checked = false;
  function genNums(){
    var pool = [], seen = {};
    function add(v){ var k = String(v); if(!seen[k]){ seen[k] = 1; pool.push(v); } }
    var guard = 0;
    while(pool.length < 5 && guard < 500){
      guard++;
      if(level === 1) add(d3RandInt(-20,20));
      else if(level === 2) add(d3RandInt(-45,45));
      else add(Math.random() < 0.5 ? d3RandInt(-90,90)/10 : d3RandInt(-900,900)/100);
    }
    return pool;
  }
  function newRound(){
    nums = genNums();
    shuffledNums = shuffle(nums);
    placed = [];
    checked = false;
    render();
  }
  function sorted(){
    return nums.slice().sort(function(a,b){ return a-b; });
  }
  function render(){
    var srt = sorted();
    var chips = shuffledNums.map(function(v){
      var isPlaced = placed.indexOf(v) >= 0;
      return '<button class="neg-chip' + (isPlaced ? ' is-placed' : '') + '" data-v="' + v + '"'
        + (isPlaced || checked ? ' disabled' : '') + '>' + prioNum(v) + '</button>';
    }).join('');
    var slots = '';
    for(var i=0; i<nums.length; i++){
      if(i < placed.length){
        var cls = 'neg-slot is-filled';
        if(checked) cls += (Math.abs(placed[i] - srt[i]) < 1e-9) ? ' is-right' : ' is-wrong';
        slots += '<button class="' + cls + '" data-i="' + i + '"' + (checked ? ' disabled' : '') + '>'
          + '<span class="neg-slot-badge">' + (i+1) + '</span>' + prioNum(placed[i]) + '</button>';
      } else {
        slots += '<div class="neg-slot is-empty"><span class="neg-slot-badge">' + (i+1) + '</span></div>';
      }
    }
    var done = placed.length === nums.length;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Storleksordna — nivå ' + level, 'Klicka på talen i ordning från minst till störst. Klicka i din ordning för att ångra.', level)
      + '<p class="neg-hint">Tal att ordna</p>'
      + '<div class="neg-chip-row">' + chips + '</div>'
      + '<p class="neg-hint">Din ordning — minst först</p>'
      + '<div class="neg-order-row">' + slots + '</div>'
      + '<div class="rakna-uppdela-feedback" id="stor-fb"></div>'
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="stor-check"' + (done && !checked ? '' : ' disabled') + '>Kontrollera</button>'
        + '<button class="btn subtle" id="stor-back">Tillbaka till begrepp</button>'
      + '</div>'
    + '</div>';
    body.querySelectorAll('.neg-chip:not([disabled])').forEach(function(btn){
      btn.onclick = function(){ placed.push(parseFloat(btn.dataset.v)); render(); };
    });
    body.querySelectorAll('.neg-slot.is-filled:not([disabled])').forEach(function(btn){
      btn.onclick = function(){ placed.splice(parseInt(btn.dataset.i,10), 1); render(); };
    });
    document.getElementById('stor-back').onclick = backFn;
    var checkBtn = document.getElementById('stor-check');
    if(checkBtn && done && !checked) checkBtn.onclick = check;
  }
  function check(){
    checked = true;
    var srt = sorted();
    var correct = placed.every(function(v,i){ return Math.abs(v - srt[i]) < 1e-9; });
    render();
    var fb = document.getElementById('stor-fb');
    fb.className = 'rakna-uppdela-feedback show ' + (correct ? 'correct' : 'wrong');
    fb.textContent = correct
      ? 'Rätt ordning!'
      : 'Inte riktigt. Rätt ordning: ' + srt.map(prioNum).join('  <  ') + '.';
    var ts = getTutorScore('neg-begrepp','begrepp');
    var tsG = getTutorScore('neg-begrepp','storleksordna');
    ts.total++; tsG.total++;
    if(correct){ ts.correct++; tsG.correct++; }
    omgangResults.push(correct);
    if(omgangResults.length >= OMG) setTimeout(showSummary, correct ? 2000 : 3400);
    else setTimeout(newRound, correct ? 2000 : 3400);
  }
  function showSummary(){
    var right = omgangResults.filter(function(x){ return x; }).length;
    var total = omgangResults.length;
    var adj = adjustLevel(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Storleksordna', 'Du klarade ' + right + ' av ' + total + '.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="stor-tillbaka">Tillbaka till begrepp</button></div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults = []; newRound(); };
    document.getElementById('stor-tillbaka').onclick = backFn;
  }
  newRound();
}

// ============================================================
// KO 2: RÄKNA MED NEGATIVA TAL
// ============================================================
function negExpr(s, ans){ return {q:'<span class="neg-expr">' + s + ' =</span>', answer:ans}; }

function negAddSubGen(level){
  var a, b, c;
  if(level === 1){
    a = d3RandInt(1,20); b = d3RandInt(1,20);
    var t1 = randPick([1,2,3]);
    if(t1 === 1) return negExpr(prioNum(a) + ' − ' + prioNum(b), a - b);
    if(t1 === 2) return negExpr(prioNum(a) + ' + ' + prioParen(-b), a - b);
    return negExpr(prioParen(-a) + ' + ' + prioParen(-b), -a - b);
  }
  if(level === 2){
    a = d3RandInt(1,20); b = d3RandInt(1,20);
    var t2 = randPick([1,2,3]);
    if(t2 === 1) return negExpr(prioNum(a) + ' − ' + prioParen(-b), a + b);
    if(t2 === 2) return negExpr(prioParen(-a) + ' − ' + prioNum(b), -a - b);
    return negExpr(prioParen(-a) + ' − ' + prioParen(-b), -a + b);
  }
  var t3 = randPick([1,2,3]);
  if(t3 === 1){
    var x = d3RandInt(11,99)/10, y = d3RandInt(11,99)/10;
    return negExpr(prioNum(x) + ' + ' + prioParen(-y), Math.round((x - y)*100)/100);
  }
  if(t3 === 2){
    var x2 = d3RandInt(11,99)/10, y2 = d3RandInt(11,99)/10;
    return negExpr(prioParen(-x2) + ' + ' + prioParen(-y2), Math.round((-x2 - y2)*100)/100);
  }
  a = d3RandInt(1,20); b = d3RandInt(1,25); c = d3RandInt(1,20);
  return negExpr(prioNum(a) + ' + ' + prioParen(-b) + ' + ' + prioNum(c), a - b + c);
}

function negMultDivGen(level){
  if(level === 1){
    var a = d3RandInt(2,9), b = d3RandInt(2,9), t = randPick([1,2,3]);
    if(t === 1) return negExpr(prioNum(a) + ' · ' + prioParen(-b), -a*b);
    if(t === 2) return negExpr(prioParen(-a) + ' · ' + prioNum(b), -a*b);
    return negExpr(prioParen(-a) + ' · ' + prioParen(-b), a*b);
  }
  if(level === 2){
    var q = d3RandInt(2,9), d = d3RandInt(2,9), D = q*d, t2 = randPick([1,2,3]);
    if(t2 === 1) return negExpr(prioParen(-D) + ' / ' + prioNum(d), -q);
    if(t2 === 2) return negExpr(prioNum(D) + ' / ' + prioParen(-d), -q);
    return negExpr(prioParen(-D) + ' / ' + prioParen(-d), q);
  }
  if(Math.random() < 0.5){
    var a3 = d3RandInt(6,12), b3 = d3RandInt(6,12), s = randPick([1,2,3]);
    if(s === 1) return negExpr(prioNum(a3) + ' · ' + prioParen(-b3), -a3*b3);
    if(s === 2) return negExpr(prioParen(-a3) + ' · ' + prioParen(-b3), a3*b3);
    return negExpr(prioParen(-a3) + ' · ' + prioNum(b3), -a3*b3);
  }
  var q3 = d3RandInt(3,12), d3v = d3RandInt(3,9), D3 = q3*d3v, s2 = randPick([1,2]);
  if(s2 === 1) return negExpr(prioParen(-D3) + ' / ' + prioNum(d3v), -q3);
  return negExpr(prioParen(-D3) + ' / ' + prioParen(-d3v), q3);
}

function negFaktorerGen(level){
  var count = level === 1 ? 3 : (level === 2 ? randPick([3,4]) : 4);
  var maxMag = level === 3 ? 7 : 6;
  var factors = [], guard = 0;
  while(guard < 200){
    guard++;
    factors = [];
    for(var i=0; i<count; i++){
      var sign = Math.random() < 0.55 ? -1 : 1;
      factors.push(d3RandInt(2,maxMag) * sign);
    }
    if(factors.filter(function(v){ return v < 0; }).length >= 2) break;
  }
  var ans = factors.reduce(function(p,v){ return p*v; }, 1);
  return negExpr(factors.map(prioParen).join(' · '), ans);
}

function renderNegRakna(body){
  var KAT = [
    {id:'addsub',   nr:1, namn:'Addition och subtraktion',   desc:'Räkna plus och minus med negativa tal.'},
    {id:'multdiv',  nr:2, namn:'Multiplikation och division', desc:'Teckenreglerna för gånger och delat.'},
    {id:'faktorer', nr:3, namn:'Flera faktorer',              desc:'Tre eller fler faktorer – håll koll på tecknen.'}
  ];
  negPicker(body, 'Räkna med negativa tal', 'Välj vad du vill öva på. Nivån anpassar sig medan du räknar.',
    KAT, function(katId, backFn){
      if(katId === 'addsub'){
        negCalcEngine(body, {
          title:'Addition och subtraktion', koId:'neg-rakna', forKey:'rakna', scoreKey:'addsub',
          sub:'Räkna ut uttrycket. Tänk på att minus framför en parentes byter tecken.',
          keypadOps:['−',','], OMG:6, gen:negAddSubGen
        }, backFn);
      } else if(katId === 'multdiv'){
        negCalcEngine(body, {
          title:'Multiplikation och division', koId:'neg-rakna', forKey:'rakna', scoreKey:'multdiv',
          sub:'Lika tecken ger plus, olika tecken ger minus.',
          keypadOps:['−'], OMG:6, gen:negMultDivGen
        }, backFn);
      } else {
        negCalcEngine(body, {
          title:'Flera faktorer', koId:'neg-rakna', forKey:'rakna', scoreKey:'faktorer',
          sub:'Räkna antalet minustecken: jämnt antal ger plus, udda antal ger minus.',
          keypadOps:['−'], OMG:5, gen:negFaktorerGen
        }, backFn);
      }
    });
}

// ============================================================
// SJÄLVSKATTNINGSMATRIS – NEGATIVA TAL
// ============================================================

