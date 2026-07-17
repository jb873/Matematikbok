/* ============================================================
   FAMILJ B · MOTOR: mult-motorerna (multiplikation: Begrepp/Faktorisera/Tabell/Metoder/Rakna/Problem + data + sub-renderare (AI-matris EXKLUDERAD))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

const MULT_BEGREPP_KORT = [
  {begrepp:'Faktor', definition:'Faktorerna är talen som multipliceras med varandra.', exempel:'I 6 · 7 = 42 är 6 och 7 faktorer.', fråga:'I 6 · 7 = 42, vad heter talen 6 och 7?', svar:'Faktor', options:['Faktor','Produkt','Term','Summa']},
  {begrepp:'Produkt', definition:'Produkten är svaret på en multiplikation.', exempel:'I 6 · 7 = 42 är 42 produkten.', fråga:'I 6 · 7 = 42, vad heter talet 42?', svar:'Produkt', options:['Produkt','Faktor','Summa','Differens']},
  {begrepp:'Faktor', definition:'Talen som multipliceras kallas faktorer.', exempel:'I 8 · 9 = 72 är 8 och 9 faktorerna.', fråga:'Vad heter talen som multipliceras med varandra?', svar:'Faktor', options:['Term','Faktor','Produkt','Summa']},
  {begrepp:'Produkt', definition:'Svaret på en multiplikation kallas produkt.', exempel:'Produkten av 4 och 5 är 20.', fråga:'Vad heter svaret i en multiplikation?', svar:'Produkt', options:['Summa','Produkt','Differens','Faktor']},
  {begrepp:'Faktor', definition:'Talen som multipliceras kallas faktorer.', exempel:'I 12 · 5 = 60 är 12 och 5 faktorer.', fråga:'I 12 · 5 = 60, vad heter talen 12 och 5?', svar:'Faktor', options:['Faktor','Produkt','Term','Summa']},
  {begrepp:'Faktor', definition:'En multiplikation kan ha fler än två faktorer.', exempel:'3 · 3 · 4 = 36 har tre faktorer.', fråga:'I 3 · 3 · 4 = 36, vad heter talen 3, 3 och 4?', svar:'Faktor', options:['Faktor','Produkt','Term','Summa']},
  {begrepp:'Produkt', definition:'Produkten är resultatet av en multiplikation.', exempel:'I 9 · 4 = 36 är 36 produkten.', fråga:'I 9 · 4 = 36, vad heter talet 36?', svar:'Produkt', options:['Produkt','Term','Summa','Faktor']},
  {begrepp:'Primtal', definition:'Ett primtal har exakt två delare: 1 och talet självt.', exempel:'7 är ett primtal – delbart bara med 1 och 7.', fråga:'Vad heter ett tal som bara är delbart med 1 och sig självt?', svar:'Primtal', options:['Primtal','Sammansatt tal','Faktor','Produkt']},
  {begrepp:'Sammansatt tal', definition:'Ett sammansatt tal kan delas upp i mindre faktorer.', exempel:'12 = 2 · 2 · 3, alltså är 12 sammansatt.', fråga:'Vad heter ett tal som kan delas upp i mindre faktorer?', svar:'Sammansatt tal', options:['Primtal','Sammansatt tal','Faktor','Term']},
  {begrepp:'Primtal', definition:'13 är delbart bara med 1 och 13.', exempel:'Primtal: 2, 3, 5, 7, 11, 13 …', fråga:'Vilken sorts tal är 13?', svar:'Primtal', options:['Sammansatt tal','Primtal','Faktor','Produkt']},
  {begrepp:'Sammansatt tal', definition:'15 kan skrivas som 3 · 5.', exempel:'15 = 3 · 5, alltså sammansatt.', fråga:'Vilken sorts tal är 15?', svar:'Sammansatt tal', options:['Primtal','Sammansatt tal','Term','Summa']},
  {begrepp:'Sammansatt tal', definition:'21 kan skrivas som 3 · 7.', exempel:'21 = 3 · 7, alltså sammansatt.', fråga:'Vilken sorts tal är 21?', svar:'Sammansatt tal', options:['Primtal','Sammansatt tal','Faktor','Produkt']},
  {begrepp:'Primtal', definition:'23 är delbart bara med 1 och 23.', exempel:'23 går inte att dela upp i mindre faktorer.', fråga:'Vilken sorts tal är 23?', svar:'Primtal', options:['Sammansatt tal','Primtal','Faktor','Term']}
];

function renderMultBegrepp(body){
  // Ingen nivå-stege: bara ett övningsblad. Tycker man det är svårt → nytt blad.
  let omgang = [];
  let idx = 0;
  let omgangResults = [];

  function genOmgang(){
    return shuffle(MULT_BEGREPP_KORT.slice()).slice(0, 8);
  }

  function render(){
    if(idx >= omgang.length){
      const right = omgangResults.filter(x=>x).length;
      const total = omgangResults.length;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader('Begrepp · faktor, produkt, primtal', 'Du klarade ' + right + ' av ' + total + '.')
        + renderSummaryCard({right:right, total:total, nextLabel:'Nytt övningsblad'})
        + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; omgangResults = []; render();
      };
      return;
    }
    const k = omgang[idx];
    const optBtns = shuffle(k.options.slice()).map(function(opt){
      return '<button class="fc-btn" data-val="' + opt + '">' + opt + '</button>';
    }).join('');
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Begrepp · faktor, produkt, primtal', 'Välj rätt matematiskt begrepp.')
      + '<div class="flashcard">'
        + '<div class="flashcard-prompt" style="font-size:13px;margin-bottom:20px;">' + k.fråga + '</div>'
        + '<div class="flashcard-actions" id="fc-actions">' + optBtns + '</div>'
        + '<div class="flashcard-explanation" id="fc-exp"></div>'
        + '<div class="fc-progress">Fråga ' + (idx+1) + ' av ' + omgang.length + '</div>'
      + '</div>'
    + '</div>';
    const btns = document.querySelectorAll('#fc-actions .fc-btn');
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        const correct = btn.dataset.val === k.svar;
        btn.classList.add(correct ? 'correct' : 'wrong');
        if(!correct){
          const rightBtn = document.querySelector('#fc-actions [data-val="' + k.svar + '"]');
          if(rightBtn) rightBtn.classList.add('correct');
        }
        document.getElementById('fc-exp').textContent = k.begrepp + ': ' + k.exempel;
        btns.forEach(function(b){ b.disabled = true; });
        omgangResults.push(correct);
        const ts = getTutorScore('mult-begrepp','begrepp');
        ts.total++;
        if(correct) ts.correct++;
        setTimeout(function(){ idx++; render(); }, 1500);
      });
    });
  }
  omgang = genOmgang();
  render();
}

// ============================================================
// DEL 3 – RÄKNA: FAKTORISERA ETT TAL I 2 ELLER 3 FAKTORER
// ============================================================
function renderMultFaktorisera(body){
  let level = 1;
  let omgang = [];
  let idx = 0;
  let omgangResults = [];

  function pickAntal(){
    // Nivå 1: bara 2 faktorer. Nivå 2: jämn blandning av 2 och 3. Nivå 3: 3 faktorer.
    if(level === 1) return 2;
    if(level === 2) return randPick([2,2,3,3]);
    return 3;
  }

  function pickTarget(antal){
    // Talintervallet beror på både nivå och antal faktorer
    let lo, hi;
    if(level === 1){
      lo = 12; hi = 50;
    } else if(level === 2){
      if(antal === 2){ lo = 48; hi = 150; }   // svårare tvåfaktorstal
      else            { lo = 36; hi = 120; }   // trefaktorstal, mellansvårt
    } else {
      lo = 60; hi = 220;                        // stora trefaktorstal
    }
    const pool = [];
    for(let n=lo; n<=hi; n++){
      if(primeFactorize(n).length >= antal) pool.push(n);
    }
    return randPick(pool);
  }

  function genOmgang(){
    const items = [];
    const seen = new Set();
    let attempts = 0;
    while(items.length < 8 && attempts < 300){
      attempts++;
      const antal = pickAntal();
      const target = pickTarget(antal);
      const key = target + '-' + antal;
      if(!seen.has(key)){
        seen.add(key);
        items.push({target:target, antal:antal});
      }
    }
    return items;
  }

  function validate(task, values){
    if(values.length !== task.antal) return {ok:false, msg:'Fyll i alla ' + task.antal + ' rutor.'};
    if(values.some(function(v){ return isNaN(v); })) return {ok:false, msg:'Skriv heltal i alla rutor.'};
    if(values.some(function(v){ return v < 2; })) return {ok:false, msg:'Alla faktorer ska vara minst 2.'};
    const product = values.reduce(function(a,b){ return a*b; }, 1);
    if(product !== task.target) return {ok:false, msg:'Produkten blir ' + product + ', men den ska bli ' + task.target + '.'};
    return {ok:true};
  }

  function render(){
    if(idx >= omgang.length){
      const right = omgangResults.filter(x=>x).length;
      const total = omgangResults.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader('Räkna · faktorisera ett tal', 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
        + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; omgangResults = []; render();
      };
      return;
    }
    const task = omgang[idx];
    let inputs = '';
    for(let i=0; i<task.antal; i++){
      if(i > 0) inputs += '<span style="font-family:var(--mono);font-size:22px;color:var(--c-rakna);font-weight:600;">·</span>';
      inputs += '<input type="text" class="rakna-factor-input" data-i="' + i + '" inputmode="numeric" maxlength="3">';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Räkna · faktorisera ett tal', 'Dela upp talet i faktorer som multipliceras till talet.', level)
      + renderScoreBarSimple(omgangResults.filter(x=>x).length, omgangResults.filter(x=>!x).length, omgang.length, idx)
      + '<div class="rakna-uppdela-task">'
        + '<div class="rakna-uppdela-prompt">Dela upp ' + task.target + ' i ' + task.antal + ' faktorer. Alla faktorer ska vara minst 2.</div>'
        + '<div class="rakna-uppdela-line">'
          + '<span class="rakna-uppdela-target">' + task.target + '</span>'
          + '<span class="rakna-uppdela-equals">=</span>'
          + inputs
        + '</div>'
        + '<div class="rakna-uppdela-feedback" id="rakna-fb"></div>'
        + '<div style="margin-top:16px;text-align:center;"><button class="btn primary" id="rakna-check">Kontrollera</button></div>'
      + '</div>'
    + '</div>';

    const inputEls = document.querySelectorAll('.rakna-factor-input');
    inputEls.forEach(function(inp, i){
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
          e.preventDefault();
          if(i < inputEls.length - 1) inputEls[i+1].focus();
          else check();
        }
      });
    });
    setTimeout(function(){ if(inputEls[0]) inputEls[0].focus(); }, 50);

    function check(){
      const values = Array.from(inputEls).map(function(inp){ return parseInt(inp.value.trim()); });
      const result = validate(task, values);
      const fb = document.getElementById('rakna-fb');
      inputEls.forEach(function(i){ i.classList.remove('correct','wrong'); });
      fb.classList.remove('correct','wrong');
      fb.classList.add('show');
      const ts = getTutorScore('mult-begrepp','rakna');
      ts.total++;
      if(result.ok){
        inputEls.forEach(function(i){ i.classList.add('correct'); });
        fb.classList.add('correct');
        const sorted = values.slice().sort(function(a,b){ return a-b; });
        fb.textContent = 'Rätt! ' + task.target + ' = ' + sorted.join(' · ');
        ts.correct++;
        omgangResults.push(true);
      } else {
        inputEls.forEach(function(i){ i.classList.add('wrong'); });
        fb.classList.add('wrong');
        fb.textContent = result.msg;
        omgangResults.push(false);
      }
      inputEls.forEach(function(i){ i.disabled = true; });
      document.getElementById('rakna-check').disabled = true;
      setTimeout(function(){ idx++; render(); }, 1800);
    }
    document.getElementById('rakna-check').onclick = check;
  }
  omgang = genOmgang();
  render();
}

// ============================================================
// DEL 3 – DELADE HJÄLPARE: SKÄRMTANGENTBORD
// ============================================================
function d3RandInt(lo, hi){ return lo + Math.floor(Math.random() * (hi - lo + 1)); }

function d3FmtNum(n){
  const r = Math.round(n * 1e6) / 1e6;
  return String(r).replace('.', ',');
}

function keypadHTML(ops){
  ops = ops || [];
  const digits = ['7','8','9','4','5','6','1','2','3'];
  let html = '<div class="keypad">';
  html += '<div class="keypad-digits">';
  for(let i=0; i<digits.length; i++){
    html += '<button type="button" class="kp-key" data-key="' + digits[i] + '">' + digits[i] + '</button>';
  }
  html += '<button type="button" class="kp-key span2" data-key="0">0</button>';
  html += '<button type="button" class="kp-key util" data-key="back">\u232B</button>';
  html += '</div>';
  if(ops.length){
    const cls = ops.length > 5 ? 'keypad-ops wide2' : 'keypad-ops';
    html += '<div class="' + cls + '">';
    for(let j=0; j<ops.length; j++){
      html += '<button type="button" class="kp-key op" data-key="' + ops[j] + '">' + ops[j] + '</button>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function bindKeypad(cardEl){
  let active = cardEl.querySelector('input');
  cardEl.addEventListener('focusin', function(e){
    if(e.target.tagName === 'INPUT') active = e.target;
  });
  cardEl.querySelectorAll('.kp-key').forEach(function(btn){
    btn.addEventListener('mousedown', function(e){
      e.preventDefault();
      if(!active || active.disabled){
        const first = cardEl.querySelector('input:not([disabled])');
        if(first) active = first; else return;
      }
      const k = btn.dataset.key;
      if(k === 'back'){
        active.value = active.value.slice(0, -1);
      } else {
        const max = parseInt(active.getAttribute('maxlength'));
        if(max && active.value.length >= max){ active.focus(); return; }
        active.value += k;
      }
      active.dispatchEvent(new Event('input', {bubbles:true}));
      active.focus();
    });
  });
}

// Evaluerar ett uttryck: tillåter · , och implicit multiplikation (20-1)(30-1)
function d3EvalExpr(seg){
  let s = seg.replace(/\s/g,'').replace(/[·×]/g,'*').replace(/,/g,'.');
  s = s.replace(/\)\(/g,')*(').replace(/(\d)\(/g,'$1*(').replace(/\)(\d)/g,')*$1');
  if(s === '' || !/^[0-9+\-*/().]+$/.test(s)) return null;
  try {
    const v = Function('"use strict";return (' + s + ')')();
    return (typeof v === 'number' && isFinite(v)) ? v : null;
  } catch(e){ return null; }
}

// ============================================================
// DEL 3 – MULTIPLIKATIONSTABELLEN
// ============================================================
function renderMultTabell(body){
  const TABELL_NIVAER = [
    {nr:1, namn:'Tal upp till 5', desc:'Ena talet 0–5, andra talet 2–5.', ra:[0,5], rb:[2,5]},
    {nr:2, namn:'Tal 5 till 10',  desc:'Båda talen är mellan 5 och 10.',  ra:[5,10], rb:[5,10]},
    {nr:3, namn:'Tal 6 till 12',  desc:'Båda talen är mellan 6 och 12.',  ra:[6,12], rb:[6,12]}
  ];
  let nivå = null;
  let omgang = [];
  let idx = 0;
  let results = [];
  let startTime = 0;
  let timerInterval = null;

  if(!state.tabellBest) state.tabellBest = {};

  function stopTimer(){
    if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
  }
  function formatTid(ms){
    const s = ms / 1000;
    if(s < 60) return s.toFixed(1).replace('.', ',') + ' s';
    const m = Math.floor(s / 60);
    const rest = Math.round(s - m * 60);
    return m + ' min ' + (rest < 10 ? '0' : '') + rest + ' s';
  }

  function buildOmgang(lv){
    const pool = [];
    for(let a=lv.ra[0]; a<=lv.ra[1]; a++){
      for(let b=lv.rb[0]; b<=lv.rb[1]; b++){
        pool.push({a:a, b:b});
      }
    }
    return shuffle(pool).slice(0, Math.min(25, pool.length));
  }

  function startaOmgang(){
    omgang = buildOmgang(nivå);
    idx = 0;
    results = [];
    startTime = Date.now();
    renderFraga();
  }

  function renderValjNiva(){
    stopTimer();
    let cards = '';
    for(let i=0; i<TABELL_NIVAER.length; i++){
      const lv = TABELL_NIVAER[i];
      const best = state.tabellBest[lv.nr];
      const bestTxt = best ? '🏆 Rekord: ' + formatTid(best) : 'Inget rekord än';
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
      + exerciseHeader('Multiplikationstabellen', 'Välj en nivå. Tiden startar direkt – försök slå rekordet!')
      + '<div class="tabell-level-grid">' + cards + '</div>'
    + '</div>';
    body.querySelectorAll('[data-niva]').forEach(function(btn){
      btn.onclick = function(){
        nivå = TABELL_NIVAER[parseInt(btn.dataset.niva)];
        startaOmgang();
      };
    });
  }

  function renderSummary(){
    stopTimer();
    const elapsed = Date.now() - startTime;
    const right = results.filter(function(x){ return x; }).length;
    const total = results.length;
    const alltRatt = right === total && total > 0;
    const snitt = total > 0 ? elapsed / total : 0;

    // Rekord: bara helt felfria omgångar räknas
    const tidigare = state.tabellBest[nivå.nr];
    let nyttRekord = false;
    if(alltRatt && (!tidigare || elapsed < tidigare)){
      state.tabellBest[nivå.nr] = elapsed;
      nyttRekord = true;
    }
    let rekordHTML = '';
    if(nyttRekord){
      rekordHTML = '<div class="tabell-rekord nytt">🏆 Nytt rekord på nivå ' + nivå.nr + '!</div>';
    } else if(alltRatt && tidigare){
      const diff = elapsed - tidigare;
      rekordHTML = '<div class="tabell-rekord gammalt">Rekordet är ' + formatTid(tidigare)
        + ' – du var ' + formatTid(diff) + ' långsammare</div>';
    } else if(!alltRatt){
      rekordHTML = '<div class="tabell-rekord gammalt">Alla rätt krävs för att sätta rekord</div>';
    }

    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Multiplikationstabellen · nivå ' + nivå.nr, 'Du klarade ' + right + ' av ' + total + ' tal.')
      + '<div class="tabell-tidkort">'
        + '<div class="tabell-tid-stor">' + formatTid(elapsed) + '</div>'
        + '<div class="tabell-tid-rad">' + total + ' tal · ' + formatTid(snitt) + ' per tal · ' + right + ' rätt</div>'
        + rekordHTML
      + '</div>'
      + renderSummaryCard({right:right, total:total, level:nivå.nr, levelChange:null, nextLabel:'Kör igen – ta tid'})
      + '<div style="margin-top:-8px;text-align:center;">'
        + '<button class="btn subtle" id="tabell-byt">Välj en annan nivå</button>'
      + '</div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = startaOmgang;
    document.getElementById('tabell-byt').onclick = renderValjNiva;
  }

  function renderFraga(){
    if(idx >= omgang.length){ renderSummary(); return; }
    const t = omgang[idx];
    const facit = String(t.a * t.b);
    const right = results.filter(function(x){ return x; }).length;
    const pct = Math.round((idx / omgang.length) * 100);

    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Multiplikationstabellen · nivå ' + nivå.nr, 'Skriv produkten. Rätt svar → nästa tal direkt.')
      + '<div class="tabell-timer" id="tabell-timer"><span class="tt-ikon">⏱</span> <span id="tabell-timer-val">0,0 s</span></div>'
      + '<div class="tabell-fraga">' + t.a + ' · ' + t.b + ' <span class="tabell-eq">=</span></div>'
      + '<input type="text" class="tabell-svar-input" id="tabell-input" inputmode="numeric" maxlength="3" autocomplete="off">'
      + '<div class="tabell-feedback" id="tabell-fb"></div>'
      + keypadHTML([])
      + '<div class="tabell-progress">Tal ' + (idx+1) + ' av ' + omgang.length + ' · ' + right + ' rätt'
        + '<div class="tabell-progress-bar"><div class="tabell-progress-fill" style="width:' + pct + '%"></div></div>'
      + '</div>'
      + '<div style="margin-top:14px;text-align:center;">'
        + '<button class="btn primary" id="tabell-svara">Svara</button>'
        + '<button class="btn subtle" id="tabell-back">Avbryt</button>'
      + '</div>'
    + '</div>';

    // Live-tidtagning
    stopTimer();
    const timerVal = document.getElementById('tabell-timer-val');
    function tick(){
      const s = (Date.now() - startTime) / 1000;
      timerVal.textContent = s.toFixed(1).replace('.', ',') + ' s';
    }
    tick();
    timerInterval = setInterval(tick, 100);

    const card = body.querySelector('.exercise-card');
    bindKeypad(card);
    const input = document.getElementById('tabell-input');
    setTimeout(function(){ input.focus(); }, 50);
    let done = false;

    function advance(correct){
      if(done) return;
      done = true;
      results.push(correct);
      const ts = getTutorScore('mult-tabell','rakna');
      ts.total++;
      if(correct) ts.correct++;
      const fb = document.getElementById('tabell-fb');
      input.disabled = true;
      document.getElementById('tabell-svara').disabled = true;
      if(correct){
        input.classList.add('correct');
        fb.className = 'tabell-feedback correct';
        fb.textContent = 'Rätt!';
        setTimeout(function(){ idx++; renderFraga(); }, 350);
      } else {
        input.classList.add('wrong');
        fb.className = 'tabell-feedback wrong';
        fb.textContent = t.a + ' · ' + t.b + ' = ' + facit;
        setTimeout(function(){ idx++; renderFraga(); }, 200);
      }
    }

    // Rätt svar → byt direkt
    input.addEventListener('input', function(){
      if(input.value.trim() === facit) advance(true);
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        if(input.value.trim() !== '') advance(input.value.trim() === facit);
      }
    });
    document.getElementById('tabell-svara').onclick = function(){
      if(input.value.trim() !== '') advance(input.value.trim() === facit);
    };
    document.getElementById('tabell-back').onclick = renderValjNiva;
  }

  renderValjNiva();
}

// ============================================================
// DEL 3 – METODER FÖR MULTIPLIKATION
// ============================================================
// Sätter ett mellanrum runt + - = · i ett uttryck (för läsbarhet medan eleven skriver)
function d3SpaceExpr(s){
  let t = s.replace(/\s+/g,'');
  t = t.replace(/([+\-=·])/g, ' $1 ');
  t = t.replace(/\s+/g,' ').trim();
  if(/[+\-=·]$/.test(s.replace(/\s+/g,''))) t += ' ';
  return t;
}

function renderMultMetoder(body){
  const METODER = [
    {id:'uppstallning',  namn:'Uppställning', icon:'📐',
     kort:'Ställ upp talen under varandra och räkna kolumn för kolumn.'},
    {id:'uppstallning-fler', namn:'Uppställning · flersiffrig multiplikator', icon:'📐',
     kort:'Multiplikatorn har flera siffror – två delprodukter och en summa.'},
    {id:'talsorterna',   namn:'Talsorterna var för sig', icon:'🔢',
     kort:'Dela upp talet i talsorter, multiplicera var för sig och summera.'},
    {id:'dubbla',        namn:'Dubbla och halvera', icon:'✌️',
     kort:'Dubbla ena talet och halvera det andra – båda blir lättare.'},
    {id:'kompensation',  namn:'Kompensationsmetoden', icon:'⚖️',
     kort:'Räkna med ett runt tal och kompensera för skillnaden.'},
    {id:'dubbelparentes',namn:'Multiplicera med dubbelparentes', icon:'🔗',
     kort:'Skriv båda talen som parenteser nära runda tal och multiplicera ut.'}
  ];

  function renderValjMetod(){
    let cards = '';
    for(let i=0; i<METODER.length; i++){
      const m = METODER[i];
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
      + exerciseHeader('Metoder för multiplikation', 'Välj en metod att öva på. Varje metod har ett räknat exempel.')
      + '<div class="metod-val-grid">' + cards + '</div>'
    + '</div>';
    body.querySelectorAll('[data-metod]').forEach(function(btn){
      btn.onclick = function(){ openMetod(btn.dataset.metod); };
    });
  }

  function openMetod(id){
    const back = function(){ renderValjMetod(); };
    if(id === 'uppstallning'){ renderUppstallningMult(body, back); return; }
    if(id === 'uppstallning-fler'){ renderUppstallningMult(body, back, {variant:'fler'}); return; }
    const cfg = ENRADS[id];
    cfg.scoreKey = id;
    renderEnradsMetod(body, cfg, back);
  }

  // --- Konfiguration för enradsmetoderna ---
  // --- Konfiguration för enradsmetoderna ---
  const ENRADS = {
    talsorterna:{
      header:'Metod · talsorterna var för sig',
      sub:'Dela upp talet i talsorter, multiplicera var för sig och addera ihop.',
      instr:'Skriv mellanledet och svaret på raden, åtskilda med =.',
      placeholder:'t.ex. 180 + 42 = 222',
      ops:['+','='],
      exempel:'<strong>Så funkar det:</strong> Dela upp det större talet i talsorter och multiplicera varje del.<br>'
        + '<span class="ex-rad">37 · 6 = 180 + 42 = 222</span><br>'
        + '<span class="ex-rad">234 · 7 = 1400 + 210 + 28 = 1638</span>',
      buildOmgang:function(){
        return [
          mkTask(d3RandInt(31,55), d3RandInt(3,9)),
          mkTask(d3RandInt(42,75), d3RandInt(3,9)),
          mkTask(d3RandInt(58,99), d3RandInt(3,9)),
          mkTask(d3RandInt(112,449), d3RandInt(3,8)),
          mkTask(d3RandInt(238,899), d3RandInt(3,8))
        ];
      }
    },
    dubbla:{
      header:'Metod · dubbla och halvera',
      sub:'Dubbla ena talet och halvera det andra. Båda nya talen blir lättare – antingen blir ena 10, eller så blir båda ental.',
      instr:'Skriv mellanledet (dubblat och halverat) och svaret. T.ex. 7 · 10 = 70 eller 6 · 9 = 54.',
      placeholder:'t.ex. 6 · 9 = 54',
      ops:['·','='],
      exempel:'<strong>Så funkar det:</strong> Båda talen blir lättare efter dubbla-och-halvera. Antingen blir ena 10 (när 5 dubblas), eller så blir båda ental.<br>'
        + '<span class="ex-rad">14 · 5 = 7 · 10 = 70</span><br>'
        + '<span class="ex-rad">38 · 5 = 19 · 10 = 190</span><br>'
        + '<span class="ex-rad">3 · 18 = 6 · 9 = 54</span><br>'
        + '<span class="ex-rad">4 · 16 = 8 · 8 = 64</span>',
      buildOmgang:function(){
        // Två varianter blandade:
        //   A) "tiotal": 5 dubblas till 10, andra faktorn jämn (12 och uppåt)
        //   B) "tabell": båda blir ental – jämn 12-18 halveras, 3 eller 4 dubblas
        function tiotal(jamntMin, jamntMax){
          const jamn = 2 * d3RandInt(Math.ceil(jamntMin/2), Math.floor(jamntMax/2));
          if(Math.random() < 0.5) return mkTask(jamn, 5);
          return mkTask(5, jamn);
        }
        function tabell(){
          // Jämna talet: 12, 14, 16 eller 18 (halveras till 6, 7, 8, 9)
          const jamn = 2 * d3RandInt(6, 9);
          // Lilla talet: 3 eller 4 (dubblas till 6 eller 8)
          const litet = d3RandInt(3, 4);
          if(Math.random() < 0.5) return mkTask(jamn, litet);
          return mkTask(litet, jamn);
        }
        const tasks = [];
        // 3 stycken tabellvarianter
        tasks.push(tabell());
        tasks.push(tabell());
        tasks.push(tabell());
        // 2 stycken tiotalsvarianter med mindre jämna tal (12-18)
        tasks.push(tiotal(12, 18));
        tasks.push(tiotal(12, 18));
        // 1 stycken tiotalsvariant med större jämna tal (20-80)
        tasks.push(tiotal(20, 80));
        // Blanda ordningen
        for(let i=tasks.length-1; i>0; i--){
          const j = Math.floor(Math.random()*(i+1));
          const t = tasks[i]; tasks[i] = tasks[j]; tasks[j] = t;
        }
        return tasks;
      }
    },
    kompensation:{
      header:'Metod · kompensationsmetoden',
      sub:'Räkna med ett runt tal och justera sedan för skillnaden.',
      instr:'Skriv hela uträkningen på raden, t.ex. 20 · 6 - 1 · 6 = 120 - 6 = 114.',
      placeholder:'t.ex. 20 · 6 - 1 · 6 = 120 - 6 = 114',
      ops:['·','+','-','='],
      exempel:'<strong>Så funkar det:</strong> Ett tal nära ett tiotal byts mot det runda talet – sedan kompenserar du.<br>'
        + '<span class="ex-rad">19 · 6 = 20 · 6 − 1 · 6 = 120 − 6 = 114</span><br>'
        + '<span class="ex-rad">21 · 7 = 20 · 7 + 1 · 7 = 140 + 7 = 147</span>',
      buildOmgang:function(){
        function near(basLo, basHi, maxOffset, bLo, bHi){
          const bas = 10 * d3RandInt(basLo, basHi);
          const a = bas + (Math.random() < 0.5 ? -1 : 1) * d3RandInt(1, maxOffset);
          return mkTask(a, d3RandInt(bLo, bHi));
        }
        return [
          near(2, 5, 1, 3, 6),   // enklare: nära ett tiotal, ±1, litet andra tal
          near(2, 8, 2, 3, 8),   // medel
          near(3, 9, 2, 4, 9)    // svårare
        ];
      }
    },
    dubbelparentes:{
      header:'Metod · dubbelparentes',
      sub:'Skriv båda talen som parenteser nära runda tal och multiplicera ut allt.',
      instr:'Skriv hela uträkningen på raden, t.ex. (20-1)(30-1) = 600-20-30+1 = 551.',
      placeholder:'t.ex. (20-1)(30-1) = 600-20-30+1 = 551',
      ops:['(',')','·','+','-','='],
      exempel:'<strong>Så funkar det:</strong> Båda talen skrivs nära ett runt tal. Multiplicera ihop alla delar.<br>'
        + '<span class="ex-rad">19 · 29 = (20−1)(30−1) = 600−20−30+1 = 551</span><br>'
        + '<span class="ex-rad">32 · 39 = (30+2)(40−1) = 1200−30+80−2 = 1248</span>',
      buildOmgang:function(){
        function near(basLo, basHi, maxOffset){
          const bas = 10 * d3RandInt(basLo, basHi);
          return bas + (Math.random() < 0.5 ? -1 : 1) * d3RandInt(1, maxOffset);
        }
        return [
          mkTask(near(2,3,1), near(2,4,1)),   // enklare: båda nära ett tiotal, ±1
          mkTask(near(2,4,2), near(2,5,2)),   // medel
          mkTask(near(2,5,2), near(2,5,2))    // svårare
        ];
      }
    }
  };

  function mkTask(a, b){ return {a:a, b:b, answer:a * b}; }

  function renderEnradsMetod(host, cfg, backFn){
    let omgang = cfg.buildOmgang();
    let idx = 0;
    let results = [];
    let uppgNr = 0;   // tips (Så funkar det + instruktion) bara på de två första uppgifterna

    function render(){
      if(idx >= omgang.length){
        const right = results.filter(function(x){ return x; }).length;
        const total = results.length;
        host.innerHTML = '<div class="exercise-card">'
          + exerciseHeader(cfg.header, 'Du klarade ' + right + ' av ' + total + '.')
          + renderSummaryCard({right:right, total:total, nextLabel:'Ny omgång'})
          + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="metod-tillmetoder">Tillbaka till metoder</button></div>'
        + '</div>';
        document.getElementById('summary-next-btn').onclick = function(){
          omgang = cfg.buildOmgang(); idx = 0; results = []; render();
        };
        document.getElementById('metod-tillmetoder').onclick = backFn;
        return;
      }
      const task = omgang[idx];
      uppgNr++;
      host.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.header, cfg.sub)
        + (uppgNr<=2 ? '<div class="mult-exempel">' + cfg.exempel + '</div>' : '')
        + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
        + '<div class="mult-metod-uppg">'
          + (uppgNr<=2 ? '<div class="mult-metod-instr">' + cfg.instr + '</div>' : '')
          + '<div class="mult-rad-wrap">'
            + '<span class="mult-rad-fast">' + task.a + ' · ' + task.b + ' =</span>'
            + '<input type="text" class="mult-rad-input" id="metod-rad" autocomplete="off" placeholder="' + cfg.placeholder + '">'
          + '</div>'
        + '</div>'
        + '<div class="rakna-uppdela-feedback" id="metod-fb"></div>'
        + keypadHTML(cfg.ops)
        + '<div class="kp-hint">Skriv hela uträkningen på en rad. Använd tangentbordet eller knapparna.</div>'
        + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="btn primary" id="metod-check">Kontrollera</button>'
          + '<button class="btn subtle" id="metod-back">Tillbaka till metoder</button>'
        + '</div>'
      + '</div>';

      const card = host.querySelector('.exercise-card');
      bindKeypad(card);
      const input = document.getElementById('metod-rad');
      // OBS: ingen live-omformatering av mellanslag – den nollställde markören så man
      // inte kunde rätta mitt i talet. Kontrollen (d3EvalExpr) struntar i mellanslag ändå.
      setTimeout(function(){ input.focus(); }, 50);
      input.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); check(); }
      });
      document.getElementById('metod-check').onclick = check;
      document.getElementById('metod-back').onclick = backFn;

      function check(){
        const raw = input.value.trim();
        const fb = document.getElementById('metod-fb');
        fb.className = 'rakna-uppdela-feedback show';
        const ts = getTutorScore('mult-metoder','metod');
        const tsG = getTutorScore('mult-metoder', cfg.scoreKey);

        const segs = raw.split('=').map(function(s){ return s.trim(); })
                        .filter(function(s){ return s !== ''; });
        let res;
        if(!raw){
          res = {ok:false, msg:'Skriv din uträkning på raden.'};
        } else if(segs.length < 2){
          res = {ok:false, msg:'Visa metoden – skriv minst ett mellanled och svaret, åtskilda med =.'};
        } else {
          res = {ok:true};
          for(let i=0; i<segs.length; i++){
            const v = d3EvalExpr(segs[i]);
            if(v === null){
              res = {ok:false, msg:'Kunde inte tolka "' + segs[i] + '". Använd siffror och räknetecken.'};
              break;
            }
            if(Math.abs(v - task.answer) > 1e-6){
              res = {ok:false, msg:'Det stämmer inte. "' + segs[i] + '" blir ' + d3FmtNum(v)
                + ', men ' + task.a + ' · ' + task.b + ' = ' + d3FmtNum(task.answer) + '.'};
              break;
            }
          }
        }

        input.disabled = true;
        document.getElementById('metod-check').disabled = true;
        ts.total++; tsG.total++;
        if(res.ok){
          input.classList.add('correct');
          fb.classList.add('correct');
          fb.textContent = 'Rätt! ' + task.a + ' · ' + task.b + ' = ' + raw + '  ✓';
          ts.correct++; tsG.correct++;
        } else {
          input.classList.add('wrong');
          fb.classList.add('wrong');
          fb.textContent = res.msg;
        }
        results.push(res.ok);
        setTimeout(function(){ idx++; render(); }, res.ok ? 1900 : 2800);
      }
    }
    render();
  }

  renderValjMetod();
}

// --- METOD: UPPSTÄLLNING (multiplikation) ---
// Nivå 1: tvåsiffrigt · ensiffrigt   Nivå 2: tresiffrigt · ensiffrigt
// Nivå 3: decimaltal · ensiffrigt    Nivå 4: tvåsiffrigt · tvåsiffrigt
function renderUppstallningMult(body, backFn, cfg){
  cfg = cfg || {};
  const FLER = cfg.variant === 'fler';   // flersiffrig multiplikator (två delprodukter)
  let level = 1;
  let omgangResults = [];
  let uppgNr = 0;              // tipset under minnesrutorna visas bara de 2 första uppgifterna
  const OMG = FLER ? 5 : 3;
  const TITEL = FLER ? 'Metod · uppställning · flersiffrig' : 'Metod · uppställning';

  const LEVELNAMN = FLER ? {
    1:'tvåsiffrigt · tvåsiffrigt',
    2:'tresiffrigt · tvåsiffrigt',
    3:'decimaltal · tvåsiffrigt'
  } : {
    1:'tvåsiffrigt tal · ensiffrigt',
    2:'tresiffrigt tal · ensiffrigt',
    3:'decimaltal · ensiffrigt',
    4:'tvåsiffrigt · tvåsiffrigt'
  };

  function adjustUpp(lv, right, total){
    if(right >= total-1 && lv < 3) return {level:lv+1, change:'up'};
    if(right <= Math.floor(total/3) && lv > 1) return {level:lv-1, change:'down'};
    return {level:lv, change:null};
  }

  // Flersiffrig multiplikator (23–99, ental 3–9). Två delprodukter + summa.
  function genTaskFler(taskIdx){
    const dU = d3RandInt(3,9), dT = d3RandInt(2,9), dScaled = dT*10 + dU;   // 23–99, ental 3–9
    const ones = dScaled % 10, tens = Math.floor(dScaled/10);
    function build(mScaled, mDec, dDec){
      const p1 = mScaled * ones, p2 = mScaled * tens;
      const prod = mScaled * dScaled, totalDec = mDec + dDec;
      return {kind:'tva',
        mDisplay: d3DecStr(mScaled, mDec), dDisplay: d3DecStr(dScaled, dDec),
        d: dScaled, ones: ones, tens: tens, p1: p1, p2: p2,
        answer: prod, answerDisplay: d3DecStr(prod, totalDec),
        answerValue: prod / Math.pow(10, totalDec)};
    }
    if(level === 1) return build(d3RandInt(2,9)*10 + d3RandInt(3,9), 0, 0);                       // m 23–99
    if(level === 2) return build(d3RandInt(1,9)*100 + d3RandInt(0,9)*10 + d3RandInt(3,9), 0, 0);  // m 123–999
    // nivå 3: m alltid decimal (sista siffran 3–9); d decimal först fr.o.m. tredje uppgiften
    return build(d3RandInt(10,99)*10 + d3RandInt(3,9), 1, taskIdx >= 2 ? 1 : 0);
  }

  function genTask(){
    if(FLER) return genTaskFler(omgangResults.length);
    if(level === 1){
      // tiotal × ental: tvåsiffrigt tal slutar ej på 0/1/2, entalet 3–9
      const units = d3RandInt(3,9), tens = d3RandInt(1,9);
      const m = tens*10 + units;
      const d = d3RandInt(3,9);
      return {kind:'enkel', mDisplay:String(m), d:d, answer:m*d};
    }
    if(level === 2){
      // hundratal × ental: tresiffrigt tal slutar ej på 0/1/2/3, entalet 4–9
      const units = d3RandInt(4,9), tens = d3RandInt(0,9), huns = d3RandInt(1,9);
      const m = huns*100 + tens*10 + units;
      const d = d3RandInt(4,9);
      return {kind:'enkel', mDisplay:String(m), d:d, answer:m*d};
    }
    // nivå 3: decimaltal × ental. Hela delen tiotal eller hundratal, 1 eller 2
    // decimaler, sista decimalsiffran ej 0/1/2/3, entalet 4–9.
    const dec = d3RandInt(1,2);
    const whole = (Math.random() < 0.5) ? d3RandInt(10,99) : d3RandInt(100,999);
    const fracLast = d3RandInt(4,9);
    const fracStr = dec === 1 ? String(fracLast) : String(d3RandInt(0,9)) + String(fracLast);
    const mScaled = whole * Math.pow(10, dec) + parseInt(fracStr, 10);
    const d = d3RandInt(4,9);
    return {kind:'decimal', mDisplay:String(whole)+','+fracStr, dec:dec,
            d:d, answerIntStr:String(mScaled*d), answerValue:(mScaled/Math.pow(10,dec))*d};
  }

  // En cell: digit (fast), comma (fast), input (svar), eller empty
  function cellHTML(c){
    if(c.t === 'fixed')  return '<div class="cell">' + c.v + '</div>';
    if(c.t === 'comma')  return '<div class="cell" style="color:var(--c-metod);font-weight:700;">,</div>';
    if(c.t === 'op')     return '<div class="cell opcell">' + c.v + '</div>';
    if(c.t === 'input')  return '<div class="cell"><input type="text" class="mult-upp-ans" data-expect="' + c.v + '" inputmode="numeric" maxlength="1" autocomplete="off"></div>';
    return '<div class="cell"></div>'; // empty
  }
  function rowHTML(opCell, cells, W){
    let pad = [];
    for(let i=0; i<W-cells.length; i++) pad.push({t:'empty'});
    const all = pad.concat(cells);
    let h = '<div class="mult-upp-row">' + cellHTML(opCell);
    for(let i=0; i<all.length; i++) h += cellHTML(all[i]);
    return h + '</div>';
  }
  // gör cellrad av en sträng: siffror -> input, komma -> comma
  function strToInputCells(str){
    return str.split('').map(function(ch){
      return ch === ',' ? {t:'comma'} : {t:'input', v:ch};
    });
  }
  function strToFixedCells(str){
    return str.split('').map(function(ch){
      return ch === ',' ? {t:'comma'} : {t:'fixed', v:ch};
    });
  }

  function minnesPanel(antal, visaTips){
    antal = antal || 2;
    let h = '<div class="mult-minne-panel"><div class="mult-minne-rubrik">minnessiffror</div><div class="mult-minne-rutor">';
    for(let i=0; i<antal; i++){
      h += '<input type="text" class="mult-minne-ruta" inputmode="numeric" maxlength="1" autocomplete="off">';
    }
    h += '</div>' + (visaTips ? '<div class="mult-minne-tips">Klicka på en siffra för att stryka den när den är använd.</div>' : '') + '</div>';
    return h;
  }
  function bindMinne(card){
    card.querySelectorAll('.mult-minne-ruta').forEach(function(inp){
      inp.addEventListener('click', function(){
        if(inp.value.trim() !== '' && document.activeElement !== inp){
          inp.classList.toggle('struck');
        }
      });
      inp.addEventListener('dblclick', function(){ inp.classList.toggle('struck'); });
    });
  }

  // ---------- FÖRKLARING / DEMO ----------
  function renderExplain(){
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · uppställning', 'Multiplicera kolumn för kolumn. Minnessiffran skrivs till höger om talet och stryks när den använts.')
      + '<div class="metod-explain-card">'
        + '<h3 class="metod-step-title">Så här fungerar det</h3>'
        + '<p class="metod-step-desc">Vi beräknar <strong>67 · 4</strong>. Klicka dig genom stegen.</p>'
        + '<div style="display:flex;justify-content:center;"><div class="mult-upp-box" id="demo-box"></div></div>'
        + '<div class="mult-demo-steg" id="demo-text"></div>'
        + '<div class="metod-demo-nav">'
          + '<button class="btn" id="demo-prev" disabled>← Föregående</button>'
          + '<span id="demo-info" style="font-size:13px;color:var(--ink-soft)">Steg 1 av 3</span>'
          + '<button class="btn primary" id="demo-next">Nästa steg →</button>'
        + '</div>'
      + '</div>'
      + '<div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="start-practice">Öva nu →</button>'
        + '<button class="btn subtle" id="explain-back">Tillbaka till metoder</button>'
      + '</div>'
    + '</div>';

    // demo: 67 · 4. minnessiffra '2' till höger, struken i steg 2.
    const steps = [
      {minne:'', minneStruck:false, ans:['','',''],
       text:'Vi räknar 67 · 4. Börja längst till höger: 4 · 7 = 28. Skriv 8 i entalen och för minnessiffran 2 till höger om talet.'},
      {minne:'2', minneStruck:false, ans:['','','8'],
       text:'Nästa kolumn: 4 · 6 = 24. Lägg till minnessiffran 2 → 26. Skriv 6 i tiotalen och stryk minnessiffran eftersom den nu är använd.'},
      {minne:'2', minneStruck:true, ans:['2','6','8'],
       text:'Skriv den sista 2:an i hundratalen. Svaret är 268.'}
    ];
    let s = 0;
    function draw(){
      const st = steps[s];
      const minneCell = st.minne === ''
        ? '<span class="mult-minne-demo"></span>'
        : '<span class="mult-minne-demo' + (st.minneStruck?' struck':'') + '">' + st.minne + '</span>';
      let h = '<div class="mult-upp-rows">';
      h += '<div class="mult-upp-row"><div class="cell opcell"></div><div class="cell"></div><div class="cell">6</div><div class="cell">7</div></div>';
      h += '<div class="mult-upp-row"><div class="cell opcell">·</div><div class="cell"></div><div class="cell"></div><div class="cell">4</div></div>';
      h += '<div class="mult-upp-line"></div>';
      h += '<div class="mult-upp-row"><div class="cell opcell"></div>'
         + '<div class="cell" style="color:var(--success);font-weight:700;">' + st.ans[0] + '</div>'
         + '<div class="cell" style="color:var(--success);font-weight:700;">' + st.ans[1] + '</div>'
         + '<div class="cell" style="color:var(--success);font-weight:700;">' + st.ans[2] + '</div></div>';
      h += '</div>';
      // minnessiffra till höger om talet
      h = '<div class="mult-upp-flex"><div class="mult-upp-rows-wrap">' + h + '</div>'
        + '<div class="mult-minne-demo-col">' + minneCell + '</div></div>';
      document.getElementById('demo-box').innerHTML = h;
      document.getElementById('demo-text').textContent = st.text;
      document.getElementById('demo-info').textContent = 'Steg ' + (s+1) + ' av ' + steps.length;
      document.getElementById('demo-prev').disabled = s === 0;
      document.getElementById('demo-next').textContent = s === steps.length-1 ? 'Klar ✓' : 'Nästa steg →';
    }
    document.getElementById('demo-prev').onclick = function(){ if(s>0){ s--; draw(); } };
    document.getElementById('demo-next').onclick = function(){
      if(s < steps.length-1){ s++; draw(); } else renderPractice();
    };
    document.getElementById('start-practice').onclick = renderPractice;
    document.getElementById('explain-back').onclick = backFn;
    draw();
  }

  // ---------- ÖVNING ----------
  function renderPractice(){
    uppgNr++;
    const task = genTask();
    const visaTips = uppgNr <= 2;
    let boxHTML, infoHTML;

    if(task.kind === 'enkel' || task.kind === 'decimal'){
      const ansStr = task.kind === 'enkel' ? String(task.answer)
        : (function(){
            const s = task.answerIntStr;
            return s.slice(0, s.length-task.dec) + ',' + s.slice(s.length-task.dec);
          })();
      const ansCells = strToInputCells(ansStr);
      const mCells = strToFixedCells(task.mDisplay);
      const W = ansCells.length;
      let rows = '';
      rows += rowHTML({t:'op',v:''}, mCells, W);
      rows += rowHTML({t:'op',v:'·'}, [{t:'fixed',v:String(task.d)}], W);
      rows += '<div class="mult-upp-line"></div>';
      rows += rowHTML({t:'op',v:''}, ansCells, W);
      var minneN = String(task.mDisplay).replace(/[^0-9]/g,'').length;   // en ruta per talsiffra
      boxHTML = '<div class="mult-upp-box"><div class="mult-upp-flex">'
        + '<div class="mult-upp-rows-wrap"><div class="mult-upp-rows">' + rows + '</div></div>'
        + minnesPanel(minneN, visaTips)
      + "</div></div>";
      infoHTML = task.kind === 'decimal'
        ? 'Räkna som vanligt med siffrorna. <strong>Decimalkommat förs rakt ner</strong> i svaret – det står redan på plats.'
        : 'Multiplicera kolumn för kolumn från höger. Använd minnesrutorna till höger som stöd.';
    } else {
      // tvåsiffrig multiplikator: två delprodukter + summa
      const sumStr = task.answerDisplay || String(task.answer);
      const W = sumStr.length;
      const p1Cells = strToInputCells(String(task.p1));
      // delprodukt 2 skiftas ett steg vänster: en tom cell längst till höger
      const p2Cells = strToInputCells(String(task.p2)).concat([{t:'empty'}]);
      const sumCells = strToInputCells(sumStr);
      const mCells = strToFixedCells(task.mDisplay);
      const dCells = strToFixedCells(task.dDisplay || String(task.d));
      let rows = '';
      rows += rowHTML({t:'op',v:''}, mCells, W);
      rows += rowHTML({t:'op',v:'·'}, dCells, W);
      rows += '<div class="mult-upp-line"></div>';
      rows += rowHTML({t:'op',v:''}, p1Cells, W);
      rows += rowHTML({t:'op',v:'+'}, p2Cells, W);
      rows += '<div class="mult-upp-line"></div>';
      rows += rowHTML({t:'op',v:''}, sumCells, W);
      boxHTML = '<div class="mult-upp-box"><div class="mult-upp-flex">'
        + '<div class="mult-upp-rows-wrap"><div class="mult-upp-rows">' + rows + '</div></div>'
        + minnesPanel(3, visaTips)
      + "</div></div>";
      const mDigits = task.mDisplay.replace(',', '');
      const harKomma = /,/.test(task.mDisplay) || /,/.test(task.dDisplay || '');
      infoHTML = 'Räkna <strong>' + mDigits + ' · ' + task.ones + '</strong> på första raden och '
        + '<strong>' + mDigits + ' · ' + task.tens + '</strong> på andra raden (ett steg åt vänster). '
        + 'Addera ihop raderna'
        + (harKomma ? ' och <strong>för ner kommat i svaret</strong> – lika många decimaler som i faktorerna tillsammans.' : '.');
    }

    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(TITEL, LEVELNAMN[level] + '.', level)
      + '<div class="metod-explain-card">'
        + '<p style="font-size:15px;margin:0 0 4px;color:var(--ink-soft);">Beräkna <strong style="font-family:var(--mono);color:var(--c-metod);">' + task.mDisplay + ' · ' + (task.dDisplay || task.d) + '</strong></p>'
        + '<p style="font-size:13px;margin:0 0 12px;color:var(--ink-soft);">' + infoHTML + '</p>'
        + '<div style="display:flex;justify-content:center;">' + boxHTML + '</div>'
        + '<div class="rakna-uppdela-feedback" id="upp-fb"></div>'
        + keypadHTML([])
        + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="btn primary" id="upp-check">Kontrollera</button>'
          + '<button class="btn subtle" id="upp-back">Tillbaka till metoder</button>'
        + '</div>'
      + '</div>'
    + '</div>';

    const card = body.querySelector('.exercise-card');
    bindKeypad(card);
    bindMinne(card);
    const ansInputs = Array.from(card.querySelectorAll('.mult-upp-ans'));
    setTimeout(function(){ if(ansInputs.length) ansInputs[ansInputs.length-1].focus(); }, 50);
    ansInputs.forEach(function(inp, i){
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
          e.preventDefault();
          if(i > 0) ansInputs[i-1].focus();   // höger → vänster
          else check();
        }
      });
    });

    function check(){
      let correct = true;
      ansInputs.forEach(function(inp){
        const exp = inp.dataset.expect;
        inp.disabled = true;
        if(inp.value.trim() === exp){
          inp.classList.add('correct');
        } else {
          inp.classList.add('wrong');
          correct = false;
        }
      });
      const fb = document.getElementById('upp-fb');
      fb.className = 'rakna-uppdela-feedback show';
      document.getElementById('upp-check').disabled = true;
      const ts = getTutorScore('mult-metoder','metod');
      const tsG = getTutorScore('mult-metoder','uppstallning');
      ts.total++; tsG.total++;
      omgangResults.push(correct);
      const dTxt = task.dDisplay || task.d;
      const ansTxt = task.answerDisplay || (task.kind === 'decimal' ? d3FmtNum(task.answerValue) : task.answer);
      if(correct){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + task.mDisplay + ' · ' + dTxt + ' = ' + ansTxt + '  ✓';
        ts.correct++; tsG.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = 'Inte rätt – ' + task.mDisplay + ' · ' + dTxt + ' = ' + ansTxt
          + '. Kontrollera kolumn för kolumn.';
      }
      if(omgangResults.length >= OMG) setTimeout(showSummary, correct ? 1700 : 2700);
      else setTimeout(renderPractice, correct ? 1700 : 2700);
    }
    document.getElementById('upp-check').onclick = check;
    document.getElementById('upp-back').onclick = backFn;
  }

  function showSummary(){
    const right = omgangResults.filter(function(x){ return x; }).length;
    const total = omgangResults.length;
    const adj = adjustUpp(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(TITEL, 'Du klarade ' + right + ' av ' + total + '.')
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change, nextLabel:'Ny omgång'})
      + '<div style="margin-top:-8px;text-align:center;">'
        + '<button class="btn subtle" id="upp-tillmetoder">Tillbaka till metoder</button>'
      + '</div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){
      omgangResults = []; renderPractice();
    };
    document.getElementById('upp-tillmetoder').onclick = backFn;
  }

  if(FLER) renderPractice(); else renderExplain();
}

// ============================================================
// DEL 3 – BERÄKNINGAR (mult-rakna)
// ============================================================
function d3DecStr(intVal, dec){
  const neg = intVal < 0;
  let s = String(Math.abs(intVal));
  if(dec === 0) return (neg ? '-' : '') + s;
  while(s.length <= dec) s = '0' + s;
  const whole = s.slice(0, s.length - dec);
  const frac = s.slice(s.length - dec).replace(/0+$/, '');
  return (neg ? '-' : '') + (frac === '' ? whole : whole + ',' + frac);
}
function d3ParseNum(str){
  const s = str.trim().replace(/\s/g,'').replace('−','-').replace(',', '.');
  if(s === '' || !/^-?[0-9]*\.?[0-9]+$/.test(s)) return null;
  return Number(s);
}

function renderMultRakna(body){
  const KATEGORIER = [
    {id:'pow10',    nr:1, namn:'Med 10, 100 och 1000', desc:'Multiplicera med tiotal, hundratal och tusental.'},
    {id:'stora',    nr:2, namn:'Stora tal',            desc:'Tal med många nollor.'},
    {id:'sma',      nr:3, namn:'Små tal',              desc:'Decimaltal som är mindre än 1.'},
    {id:'storasma', nr:4, namn:'Stora och små tal',    desc:'Visa ett mellanled som förenklar uträkningen.'},
    {id:'negativa', nr:5, namn:'Negativa tal',         desc:'Plus och minus – håll koll på tecknet.'}
  ];

  // ---- Konfiguration per kategori ----
  const CFG = {
    pow10:{
      mode:'pow10',
      header:'Beräkningar · med 10, 100 och 1000',
      sub:'Träna positionssystemet. Talen blir svårare efter hand.',
      ops:[','],
      exempel:'<strong>Positionssystemet:</strong> När du multiplicerar med 10, 100 eller 1000 flyttas varje siffra ett, två eller tre steg. Nollor inne i talet måste hänga med.<br>'
        + '<span class="ex-rad">10 · 43 = 430</span><br>'
        + '<span class="ex-rad">100 · 6,7 = 670</span><br>'
        + '<span class="ex-rad">100 · 12,04 = 1204</span>'
    },
    stora:{
      mode:'single',
      header:'Beräkningar · stora tal',
      sub:'Räkna med de första siffrorna och lägg på nollorna efteråt.',
      ops:[],
      exempel:'<strong>Tänk så här:</strong> Multiplicera de första siffrorna och lägg sedan på alla nollor.<br>'
        + '<span class="ex-rad">200 · 3000 → 2 · 3 = 6 → 600 000</span><br>'
        + '<span class="ex-rad">1200 · 40000 = 48 000 000</span>',
      gen:function(level){
        let a, b;
        if(level === 1){
          a = d3RandInt(2,9) * randPick([100,1000]);
          b = d3RandInt(2,9) * randPick([100,1000]);
        } else if(level === 2){
          a = d3RandInt(11,99) * randPick([100,1000]);
          b = d3RandInt(2,9) * randPick([1000,10000]);
        } else {
          a = d3RandInt(11,999) * 1000;
          b = d3RandInt(2,99) * 100000;
        }
        const prod = a * b;
        return {display: a + ' · ' + b, answerNum: prod, answerStr: String(prod)};
      }
    },
    sma:{
      mode:'single',
      header:'Beräkningar · små tal',
      sub:'Räkna som med heltal och placera decimalkommat sist.',
      ops:[','],
      exempel:'<strong>Tänk så här:</strong> Räkna med siffrorna som heltal. Antalet decimaler i svaret är lika många som i båda talen tillsammans.<br>'
        + '<span class="ex-rad">6 · 0,5 = 3</span><br>'
        + '<span class="ex-rad">0,6 · 0,7 = 0,42</span><br>'
        + '<span class="ex-rad">0,08 · 0,4 = 0,032</span>',
      gen:function(level){
        let aInt, aDec, bInt, bDec;
        if(level === 1){ aInt = d3RandInt(2,9); aDec = 0; bInt = d3RandInt(1,9); bDec = 1; }
        else if(level === 2){ aInt = d3RandInt(1,9); aDec = 1; bInt = d3RandInt(2,9); bDec = 1; }
        else { aInt = d3RandInt(1,9); aDec = 2; bInt = d3RandInt(2,9); bDec = 1; }
        const prodInt = aInt * bInt, prodDec = aDec + bDec;
        return {display: d3DecStr(aInt,aDec) + ' · ' + d3DecStr(bInt,bDec),
                answerNum: prodInt / Math.pow(10,prodDec),
                answerStr: d3DecStr(prodInt,prodDec)};
      }
    },
    storasma:{
      mode:'enrad',
      header:'Beräkningar · stora och små tal',
      sub:'Flytta nollor mellan talen så uträkningen blir enkel – visa mellanledet.',
      instr:'Skriv ditt mellanled och svaret på raden, åtskilda med =.',
      placeholder:'t.ex. 9·2=18',
      ops:['·','='],
      exempel:'<strong>Tänk så här:</strong> Flytta tiopotenser mellan talen så att det ena blir litet och det andra runt. Visa mellanledet.<br>'
        + '<span class="ex-rad">900 · 0,02 = 9 · 2 = 18</span><br>'
        + '<span class="ex-rad">7000 · 0,3 = 700 · 3 = 2100</span>',
      gen:function(level){
        const X = d3RandInt(2,9), Y = d3RandInt(2,9);
        let p, q;
        if(level === 1){ q = d3RandInt(1,2); p = q + d3RandInt(0,1); }
        else if(level === 2){ q = d3RandInt(1,2); p = q + d3RandInt(1,2); }
        else { q = d3RandInt(2,3); p = q + d3RandInt(0,2); }
        const aVal = X * Math.pow(10,p);
        const prod = X * Y * Math.pow(10, p - q);
        return {leftText: aVal + ' · ' + d3DecStr(Y,q) + ' =', answerNum: prod};
      }
    },
    negativa:{
      mode:'single',
      header:'Beräkningar · negativa tal',
      sub:'Plus gånger minus blir minus. Minus gånger minus blir plus.',
      ops:['-',','],
      exempel:'<strong>Teckenregler:</strong> plus · minus = minus &nbsp;·&nbsp; minus · minus = plus.<br>'
        + '<span class="ex-rad">7 · (−6) = −42</span><br>'
        + '<span class="ex-rad">(−8) · 4 = −32</span><br>'
        + '<span class="ex-rad">(−12) · (−4) = 48</span>',
      gen:function(level){
        let aInt, aDec, bInt, bDec;
        if(level === 1){ aInt = d3RandInt(2,12); aDec = 0; bInt = d3RandInt(2,12); bDec = 0; }
        else if(level === 2){
          if(Math.random() < 0.5){ aInt = d3RandInt(2,9); aDec = 0; bInt = d3RandInt(1,9); bDec = 1; }
          else { aInt = d3RandInt(1,9); aDec = 1; bInt = d3RandInt(2,9); bDec = 0; }
        } else {
          aInt = d3RandInt(1,9); aDec = 1; bInt = d3RandInt(1,9); bDec = 1;
        }
        let sA = Math.random() < 0.5 ? -1 : 1;
        let sB = Math.random() < 0.5 ? -1 : 1;
        if(sA === 1 && sB === 1){ if(Math.random() < 0.5) sA = -1; else sB = -1; }
        function disp(int, dec, sign){
          const base = d3DecStr(int,dec);
          return sign < 0 ? '(−' + base + ')' : base;
        }
        const prodInt = aInt * bInt, prodDec = aDec + bDec, prodSign = sA * sB;
        return {display: disp(aInt,aDec,sA) + ' · ' + disp(bInt,bDec,sB),
                answerNum: prodSign * prodInt / Math.pow(10,prodDec),
                answerStr: d3DecStr(prodSign * prodInt, prodDec)};
      }
    }
  };

  function renderPicker(){
    let cards = '';
    for(let i=0; i<KATEGORIER.length; i++){
      const k = KATEGORIER[i];
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
        const cfg = CFG[btn.dataset.kat];
        cfg.scoreKey = btn.dataset.kat;
        if(cfg.mode === 'enrad') renderRaknaEnrad(body, cfg, renderPicker);
        else if(cfg.mode === 'pow10') renderRaknaPow10(body, cfg, renderPicker);
        else renderRaknaSingle(body, cfg, renderPicker);
      };
    });
  }

  renderPicker();
}

// --- Motor: 10/100/1000 – fast stegring, auto-byte, ingen tid ---
function renderRaknaPow10(body, cfg, backFn){
  let level = 1, omgang = [], idx = 0, results = [], uppgNr = 0;
  const OMG = 8;
  const LVLNAMN = {1:'heltal', 2:'decimaltal', 3:'decimaltal med nollor'};

  function nzDigits(n){
    let v = 0;
    for(let i=0; i<n; i++) v = v*10 + d3RandInt(1,9);
    return v;
  }

  // Nivå 1 heltal · 2 decimaltal (svaret ibland heltal, ibland inte) · 3 decimaltal med nolla (aldrig heltalssvar)
  function genTask(lvl){
    for(let tries=0; tries<200; tries++){
      let mult = randPick([10,100,1000]);
      let dec, opInt;
      if(lvl === 1){
        dec = 0; opInt = d3RandInt(12,999);
      } else if(lvl === 2){
        // ~50/50: ibland blir svaret heltal, ibland decimaltal
        if(Math.random() < 0.5){
          dec = randPick([1,2]);
          mult = dec === 1 ? randPick([10,100,1000]) : randPick([100,1000]);   // mult ≥ 10^dec → heltalssvar
          opInt = dec === 1 ? (nzDigits(randPick([1,2]))*10 + d3RandInt(1,9))
                            : (nzDigits(2)*100 + d3RandInt(1,9)*10 + d3RandInt(1,9));
        } else {
          dec = randPick([2,3]);
          mult = dec === 2 ? 10 : randPick([10,100]);                          // mult < 10^dec → decimalsvar
          opInt = dec === 2 ? (nzDigits(2)*100 + d3RandInt(1,9)*10 + d3RandInt(1,9))
                            : (nzDigits(2)*1000 + d3RandInt(1,9)*100 + d3RandInt(1,9)*10 + d3RandInt(1,9));
        }
      } else {
        dec = 2;
        opInt = Math.random() < 0.6 ? (d3RandInt(11,99)*100 + d3RandInt(1,9))               // X,0Z
                                    : ((d3RandInt(1,9)*10)*100 + d3RandInt(1,9)*10 + d3RandInt(1,9)); // X0,YZ
      }
      const prodInt = opInt * mult;
      const svarHeltal = (prodInt % Math.pow(10,dec)) === 0;
      if(lvl === 3 && svarHeltal) continue;                // nivå 3: inget svar blir heltal
      return {display: mult + ' · ' + d3DecStr(opInt,dec),
              facit: d3DecStr(prodInt,dec),
              answerNum: prodInt / Math.pow(10,dec)};
    }
    return {display:'10 · 6,07', facit:'60,7', answerNum:60.7};
  }

  function genOmgang(){ const a=[]; for(let i=0;i<OMG;i++) a.push(genTask(level)); return a; }

  function renderSummary(){
    const right = results.filter(function(x){ return x; }).length;
    const total = results.length;
    const adj = adjustLevel(level, right, total); level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(cfg.header, 'Du klarade ' + right + ' av ' + total + '.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change, nextLabel:'Kör igen'})
      + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="rakna-kat-back">Tillbaka till kategorier</button></div>'
    + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){
      omgang = genOmgang(); idx = 0; results = []; renderFraga();
    };
    document.getElementById('rakna-kat-back').onclick = backFn;
  }

  function renderFraga(){
    if(idx >= omgang.length){ renderSummary(); return; }
    uppgNr++;
    const t = omgang[idx];
    const right = results.filter(function(x){ return x; }).length;
    const pct = Math.round((idx / omgang.length) * 100);
    const visaTips = uppgNr <= 2;                          // tips bara på de två första talen (nivå 1)

    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(cfg.header, 'Nivå ' + level + ': ' + LVLNAMN[level] + '.', level)
      + (visaTips ? '<div class="rakna-kat-exempel">' + cfg.exempel + '</div>' : '')
      + '<div class="rakna-svar-rad"><span class="rakna-svar-fast">' + t.display + ' =</span>'
        + '<input type="text" class="rakna-svar-input" id="pow-input" inputmode="text" maxlength="14" autocomplete="off" placeholder="?"></div>'
      + '<div class="tabell-feedback" id="pow-fb"></div>'
      + keypadHTML([','])
      + '<div class="tabell-progress">Tal ' + (idx+1) + ' av ' + omgang.length + ' · ' + right + ' rätt'
        + '<div class="tabell-progress-bar"><div class="tabell-progress-fill" style="width:' + pct + '%"></div></div>'
      + '</div>'
      + '<div style="margin-top:14px;text-align:center;">'
        + '<button class="btn primary" id="pow-svara">Svara</button>'
        + '<button class="btn subtle" id="pow-back">Tillbaka till kategorier</button>'
      + '</div>'
    + '</div>';

    const card = body.querySelector('.exercise-card');
    bindKeypad(card);
    const input = document.getElementById('pow-input');
    setTimeout(function(){ input.focus(); }, 50);
    let done = false;

    function matches(){
      const v = d3ParseNum(input.value);
      return v !== null && Math.abs(v - t.answerNum) < 1e-6 * Math.max(1, Math.abs(t.answerNum));
    }
    function advance(correct){
      if(done) return;
      done = true;
      results.push(correct);
      const ts = getTutorScore('mult-rakna','rakna');
      const tsG = getTutorScore('mult-rakna', cfg.scoreKey);
      ts.total++; tsG.total++;
      if(correct){ ts.correct++; tsG.correct++; }
      const fb = document.getElementById('pow-fb');
      input.disabled = true;
      document.getElementById('pow-svara').disabled = true;
      if(correct){
        input.classList.add('correct');
        fb.className = 'tabell-feedback correct';
        fb.textContent = 'Rätt!';
        setTimeout(function(){ idx++; renderFraga(); }, 400);
      } else {
        input.classList.add('wrong');
        fb.className = 'tabell-feedback wrong';
        fb.textContent = t.display + ' = ' + t.facit;
        setTimeout(function(){ idx++; renderFraga(); }, 1200);
      }
    }

    // Rätt svar → byt direkt
    input.addEventListener('input', function(){ if(matches()) advance(true); });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        if(input.value.trim() !== '') advance(matches());
      }
    });
    document.getElementById('pow-svara').onclick = function(){
      if(input.value.trim() !== '') advance(matches());
    };
    document.getElementById('pow-back').onclick = backFn;
  }

  omgang = genOmgang();
  renderFraga();
}

// --- Motor: ett svar per uppgift ---
function renderRaknaSingle(body, cfg, backFn){
  let level = 1, omgang = [], idx = 0, results = [], uppgNr = 0;
  function genOmgang(){
    const a = [];
    for(let i=0; i<8; i++) a.push(cfg.gen(level));
    return a;
  }
  function render(){
    if(idx >= omgang.length){
      const right = results.filter(function(x){ return x; }).length;
      const total = results.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.header, 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
        + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="rakna-kat-back">Tillbaka till kategorier</button></div>'
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; results = []; render();
      };
      document.getElementById('rakna-kat-back').onclick = backFn;
      return;
    }
    const task = omgang[idx];
    uppgNr++;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(cfg.header, cfg.sub, level)
      + (uppgNr<=2 ? '<div class="rakna-kat-exempel">' + cfg.exempel + '</div>' : '')
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="rakna-svar-rad"><span class="rakna-svar-fast">' + task.display + ' =</span>'
        + '<input type="text" class="rakna-svar-input" id="rakna-input" inputmode="text" maxlength="16" autocomplete="off" placeholder="?"></div>'
      + '<div class="rakna-uppdela-feedback" id="rakna-fb"></div>'
      + keypadHTML(cfg.ops)
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="rakna-check">Kontrollera</button>'
        + '<button class="btn subtle" id="rakna-back">Tillbaka till kategorier</button>'
      + '</div>'
    + '</div>';
    const card = body.querySelector('.exercise-card');
    bindKeypad(card);
    const input = document.getElementById('rakna-input');
    setTimeout(function(){ input.focus(); }, 50);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); check(); }
    });
    document.getElementById('rakna-check').onclick = check;
    document.getElementById('rakna-back').onclick = backFn;

    function check(){
      const stu = d3ParseNum(input.value);
      const fb = document.getElementById('rakna-fb');
      fb.className = 'rakna-uppdela-feedback show';
      input.disabled = true;
      document.getElementById('rakna-check').disabled = true;
      const ts = getTutorScore('mult-rakna','rakna'); ts.total++;
      const tsG = getTutorScore('mult-rakna', cfg.scoreKey); tsG.total++;
      let ok = false;
      if(stu === null){
        fb.classList.add('wrong');
        fb.textContent = 'Skriv ett tal. Använd komma för decimaler.';
      } else if(Math.abs(stu - task.answerNum) < 1e-6 * Math.max(1, Math.abs(task.answerNum))){
        ok = true;
        input.classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + task.display + ' = ' + task.answerStr;
        ts.correct++; tsG.correct++;
      } else {
        input.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Inte rätt. ' + task.display + ' = ' + task.answerStr + '.';
      }
      results.push(ok);
      setTimeout(function(){ idx++; render(); }, ok ? 1700 : 2600);
    }
  }
  omgang = genOmgang();
  render();
}

// --- Motor: enradsuppgift med mellanled ---
function renderRaknaEnrad(body, cfg, backFn){
  let level = 1, omgang = [], idx = 0, results = [], uppgNr = 0;
  function genOmgang(){
    const a = [];
    for(let i=0; i<8; i++) a.push(cfg.gen(level));
    return a;
  }
  function render(){
    if(idx >= omgang.length){
      const right = results.filter(function(x){ return x; }).length;
      const total = results.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.header, 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
        + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="rakna-kat-back">Tillbaka till kategorier</button></div>'
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){
        omgang = genOmgang(); idx = 0; results = []; render();
      };
      document.getElementById('rakna-kat-back').onclick = backFn;
      return;
    }
    const task = omgang[idx];
    uppgNr++;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(cfg.header, cfg.sub, level)
      + (uppgNr<=2 ? '<div class="rakna-kat-exempel">' + cfg.exempel + '</div>' : '')
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="mult-metod-uppg">'
        + (uppgNr<=2 ? '<div class="mult-metod-instr">' + cfg.instr + '</div>' : '')
        + '<div class="rakna-svar-rad">'
          + '<span class="rakna-svar-fast">' + task.leftText + '</span>'
          + '<input type="text" class="rakna-svar-input rakna-svar-bred" id="rakna-input" autocomplete="off" placeholder="' + cfg.placeholder + '">'
        + '</div>'
      + '</div>'
      + '<div class="rakna-uppdela-feedback" id="rakna-fb"></div>'
      + keypadHTML(cfg.ops)
      + '<div class="kp-hint">Skriv hela uträkningen på raden. Använd tangentbordet eller knapparna.</div>'
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="rakna-check">Kontrollera</button>'
        + '<button class="btn subtle" id="rakna-back">Tillbaka till kategorier</button>'
      + '</div>'
    + '</div>';
    const card = body.querySelector('.exercise-card');
    bindKeypad(card);
    const input = document.getElementById('rakna-input');
    setTimeout(function(){ input.focus(); }, 50);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); check(); }
    });
    document.getElementById('rakna-check').onclick = check;
    document.getElementById('rakna-back').onclick = backFn;

    function check(){
      const raw = input.value.trim();
      const fb = document.getElementById('rakna-fb');
      fb.className = 'rakna-uppdela-feedback show';
      const ts = getTutorScore('mult-rakna','rakna');
      const tsG = getTutorScore('mult-rakna', cfg.scoreKey);
      const segs = raw.split('=').map(function(s){ return s.trim(); })
                      .filter(function(s){ return s !== ''; });
      let res;
      if(!raw){
        res = {ok:false, msg:'Skriv din uträkning på raden.'};
      } else if(segs.length < 2){
        res = {ok:false, msg:'Visa mellanledet – skriv mellanled och svar, åtskilda med =.'};
      } else {
        res = {ok:true};
        for(let i=0; i<segs.length; i++){
          const v = d3EvalExpr(segs[i]);
          if(v === null){
            res = {ok:false, msg:'Kunde inte tolka "' + segs[i] + '". Använd siffror och räknetecken.'};
            break;
          }
          if(Math.abs(v - task.answerNum) > 1e-6 * Math.max(1, Math.abs(task.answerNum))){
            res = {ok:false, msg:'Det stämmer inte. "' + segs[i] + '" blir ' + d3FmtNum(v)
              + ', men svaret ska bli ' + d3FmtNum(task.answerNum) + '.'};
            break;
          }
        }
      }
      input.disabled = true;
      document.getElementById('rakna-check').disabled = true;
      ts.total++; tsG.total++;
      if(res.ok){
        input.classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + task.leftText + ' ' + raw + '  ✓';
        ts.correct++; tsG.correct++;
      } else {
        input.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = res.msg;
      }
      results.push(res.ok);
      setTimeout(function(){ idx++; render(); }, res.ok ? 1900 : 2800);
    }
  }
  omgang = genOmgang();
  render();
}

// ============================================================
// DEL 3 – PROBLEMLÖSNING MED LÄSTAL (mult-problem)
// ============================================================
const MULT_LASTAL = [
  // --- Nivå 1: enkla heltal, en uträkning ---
  {level:1, text:'En biobiljett kostar 95 kr. Hur mycket kostar 4 biljetter?', answer:380, enhet:'kr', exp:'4 · 95 = 380 kr.'},
  {level:1, text:'En klass har 6 rader med 8 stolar i varje rad. Hur många stolar finns det totalt?', answer:48, enhet:'stolar', exp:'6 · 8 = 48 stolar.'},
  {level:1, text:'Ett paket innehåller 12 kakor. Hur många kakor finns det i 7 paket?', answer:84, enhet:'kakor', exp:'7 · 12 = 84 kakor.'},
  {level:1, text:'En cyklist åker 15 km varje dag. Hur långt åker hon på 9 dagar?', answer:135, enhet:'km', exp:'9 · 15 = 135 km.'},
  {level:1, text:'Det får plats 24 flaskor i en back. Hur många flaskor ryms i 5 backar?', answer:120, enhet:'flaskor', exp:'5 · 24 = 120 flaskor.'},
  {level:1, text:'En målare målar 13 m² per timme. Hur stor yta hinner han måla på 6 timmar?', answer:78, enhet:'m²', exp:'6 · 13 = 78 m².'},
  {level:1, text:'En bok har 23 sidor och varje sida har 9 rader text. Hur många rader text har boken?', answer:207, enhet:'rader', exp:'23 · 9 = 207 rader.'},

  // --- Nivå 2: större tal, pengar och decimaler ---
  {level:2, text:'En tröja kostar 249 kr. Hur mycket kostar 8 likadana tröjor?', answer:1992, enhet:'kr', exp:'8 · 249 = 1992 kr.'},
  {level:2, text:'En lastbil väger 3500 kg. Hur mycket väger 6 likadana lastbilar tillsammans?', answer:21000, enhet:'kg', exp:'6 · 3500 = 21 000 kg.'},
  {level:2, text:'Ett rum är 4,5 m långt och 3 m brett. Hur stor är golvytan?', answer:13.5, enhet:'m²', exp:'4,5 · 3 = 13,5 m².'},
  {level:2, text:'En liter bensin kostar 18,90 kr. Vad kostar 20 liter?', answer:378, enhet:'kr', exp:'20 · 18,90 = 378 kr.'},
  {level:2, text:'En skola har 32 klasser med 27 elever i varje klass. Hur många elever går på skolan?', answer:864, enhet:'elever', exp:'32 · 27 = 864 elever.'},
  {level:2, text:'En löpare springer 7,5 km per träningspass. Hur långt springer hon på 12 pass?', answer:90, enhet:'km', exp:'12 · 7,5 = 90 km.'},
  {level:2, text:'En maskin tillverkar 1250 skruvar i timmen. Hur många skruvar blir det på 8 timmar?', answer:10000, enhet:'skruvar', exp:'8 · 1250 = 10 000 skruvar.'},

  // --- Nivå 3: svårare, flera steg eller stora tal ---
  {level:3, text:'En glasskiosk säljer 145 glassar per dag. Hur många glassar säljer kiosken på 4 veckor (28 dagar)?', answer:4060, enhet:'glassar', exp:'28 · 145 = 4060 glassar.'},
  {level:3, text:'En bil drar 0,6 liter bensin per mil. Hur många liter går det åt på en resa på 350 mil?', answer:210, enhet:'liter', exp:'350 · 0,6 = 210 liter.'},
  {level:3, text:'Ett flak rymmer 24 lådor. Varje låda väger 12,5 kg. Hur mycket väger ett fullastat flak?', answer:300, enhet:'kg', exp:'24 · 12,5 = 300 kg.'},
  {level:3, text:'En biograf har 18 salonger med 220 platser i varje salong. Hur många platser har biografen totalt?', answer:3960, enhet:'platser', exp:'18 · 220 = 3960 platser.'},
  {level:3, text:'En odlare planterar 36 rader med 125 plantor i varje rad. Hur många plantor planterar hon?', answer:4500, enhet:'plantor', exp:'36 · 125 = 4500 plantor.'},
  {level:3, text:'En fabrik tillverkar 2400 muggar varje dag. Hur många muggar tillverkas på 15 dagar?', answer:36000, enhet:'muggar', exp:'15 · 2400 = 36 000 muggar.'},
  {level:3, text:'Ett godståg har 45 vagnar. Varje vagn kan lasta 2800 kg. Hur mycket last kan hela tåget ta?', answer:126000, enhet:'kg', exp:'45 · 2800 = 126 000 kg.'}
];

function renderMultProblem(body){
  let level = 1;
  let currentSet = [];
  let answered = 0;
  let rightCount = 0;

  function pickSet(){
    const pool = MULT_LASTAL.filter(function(p){ return p.level === level; });
    return shuffle(pool.slice()).slice(0, 3);
  }

  function start(){
    currentSet = pickSet();
    answered = 0;
    rightCount = 0;
    render();
  }

  function render(){
    let tasks = '';
    for(let i=0; i<currentSet.length; i++){
      const p = currentSet[i];
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
        + '<div class="prob-feedback" id="prob-fb-' + i + '"></div>'
      + '</div>';
    }
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Problemlösning med lästal', 'Lös de tre lästalen. Räkna i anteckningsblocket och skriv svaret.', level)
      + tasks
      + '<div id="prob-summary-anchor"></div>'
    + '</div>';

    body.querySelectorAll('[data-check]').forEach(function(b){
      b.addEventListener('click', function(){ check(parseInt(b.dataset.check)); });
    });
    // Foto-knappar
    body.querySelectorAll('[data-foto]').forEach(function(b){
      const i = b.dataset.foto;
      const fileInput = body.querySelector('[data-fotoinput="' + i + '"]');
      b.addEventListener('click', function(){ fileInput.click(); });
      fileInput.addEventListener('change', function(e){
        const f = e.target.files && e.target.files[0];
        if(!f) return;
        const reader = new FileReader();
        reader.onload = function(ev){
          const prev = document.getElementById('prob-foto-' + i);
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
    const p = currentSet[i];
    const inp = body.querySelector('[data-input="' + i + '"]');
    const fb = document.getElementById('prob-fb-' + i);
    if(inp.disabled) return;

    fb.classList.remove('correct','wrong');
    fb.classList.add('show');
    inp.classList.remove('correct','wrong');
    const ts = getTutorScore('mult-problem','problem');
    ts.total++;

    const stu = d3ParseNum(inp.value);
    let wasRight = false;
    if(stu === null){
      fb.classList.add('wrong');
      fb.textContent = 'Skriv ett tal som svar.';
      return; // låt eleven försöka igen
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
    if(answered >= currentSet.length){
      setTimeout(showSummary, 700);
    }
  }

  function showSummary(){
    const anchor = document.getElementById('prob-summary-anchor');
    if(!anchor) return;
    let nivaKnappar = '<div class="prob-niva-val">';
    if(level < 3) nivaKnappar += '<button class="btn primary" id="prob-svarare">Öka svårighetsgrad →</button>';
    nivaKnappar += '<button class="btn" id="prob-samma">Samma nivå igen</button>';
    if(level > 1) nivaKnappar += '<button class="btn subtle" id="prob-lattare">← Lättare nivå</button>';
    nivaKnappar += '</div>';

    anchor.innerHTML = '<div style="margin-top:20px;">'
      + renderSummaryCard({right:rightCount, total:currentSet.length, nextLabel:'Nya lästal'})
      + nivaKnappar
    + '</div>';
    document.getElementById('summary-next-btn').onclick = start;
    const svarare = document.getElementById('prob-svarare');
    if(svarare) svarare.onclick = function(){ level = Math.min(3, level+1); start(); };
    const lattare = document.getElementById('prob-lattare');
    if(lattare) lattare.onclick = function(){ level = Math.max(1, level-1); start(); };
    document.getElementById('prob-samma').onclick = start;
    anchor.scrollIntoView({behavior:'smooth', block:'start'});
  }

  start();
}

// ============================================================
// SJÄLVSKATTNINGSMATRIS – MULTIPLIKATION
// ============================================================
// Varje rad: elevens påstående + (ko, key) som tutorn bedömer från.

