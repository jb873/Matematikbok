/* ============================================================
   FAMILJ B · MOTOR: addsub-grundmotorerna (begrepp-as + add + sub + räkneträning-AS (AI-fritt kluster; delade sub-renderare))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderBegreppASBegrepp(body){
  let level = 1;
  let omgang = [];
  let idx = 0;
  let omgangResults = [];

  function genOmgang(){
    return shuffle([...BEGREPP_AS_KORT]).slice(0, 6);
  }

  function render(){
    if(idx >= omgang.length){
      const right = omgangResults.filter(x=>x).length;
      const total = omgangResults.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = `<div class="exercise-card">${exerciseHeader('Begrepp · term, summa, differens', `Du klarade ${right} av ${total}.`, level)}${renderSummaryCard({right, total, level, levelChange: adj.change})}</div>`;
      document.getElementById('summary-next-btn').onclick = ()=>{ omgang=genOmgang(); idx=0; omgangResults=[]; render(); };
      return;
    }
    const k = omgang[idx];
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Begrepp · term, summa, differens', 'Välj rätt matematiskt begrepp.', level)}
        <div class="flashcard">
          <div class="flashcard-prompt" style="font-size:13px;margin-bottom:6px;">${k.fråga}</div>
          <div style="font-size:13px;color:var(--ink-soft);font-style:italic;margin-bottom:16px;">${k.definition}</div>
          <div class="flashcard-actions" id="fc-actions">
            ${shuffle(k.options).map(opt=>`<button class="fc-btn" data-val="${opt}">${opt}</button>`).join('')}
          </div>
          <div class="flashcard-explanation" id="fc-exp"></div>
          <div class="fc-progress">Fråga ${idx+1} av ${omgang.length}</div>
        </div>
      </div>
    `;
    document.querySelectorAll('#fc-actions .fc-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const correct = btn.dataset.val === k.svar;
        btn.classList.add(correct?'correct':'wrong');
        if(!correct) document.querySelector(`#fc-actions [data-val="${k.svar}"]`).classList.add('correct');
        document.getElementById('fc-exp').textContent = `${k.begrepp}: ${k.exempel}`;
        document.querySelectorAll('#fc-actions .fc-btn').forEach(b=>b.disabled=true);
        omgangResults.push(correct);
        const ts = getTutorScore('begrepp-as','begrepp'); ts.total++; if(correct) ts.correct++;
        setTimeout(()=>{ idx++; render(); }, 1500);
      });
    });
  }
  omgang = genOmgang();
  render();
}

// ============================================================
// BEGREPP-AS: RÄKNA (enkla snabbfrågor)
// ============================================================
function renderBegreppASRakna(body){
  let level = 1;
  let omgang = [];
  let idx = 0;
  let omgangResults = [];

  function genOmgang(){
    const seen = new Set();
    const items = [];
    let attempts = 0;
    while(items.length < 8 && attempts < 200){
      attempts++;
      const useAdd = Math.random() < 0.5;
      const task = useAdd ? genAddTask(level) : genSubTask(level);
      const key = `${task.a}${task.op}${task.b}`;
      if(!seen.has(key)){ seen.add(key); items.push(task); }
    }
    return items;
  }

  function render(){
    if(idx >= omgang.length){
      const right = omgangResults.filter(x=>x).length;
      const total = omgangResults.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = `<div class="exercise-card">${exerciseHeader('Räkna · addition och subtraktion', `Du klarade ${right} av ${total}.`, level)}${renderSummaryCard({right, total, level, levelChange: adj.change})}</div>`;
      document.getElementById('summary-next-btn').onclick = ()=>{ omgang=genOmgang(); idx=0; omgangResults=[]; render(); };
      return;
    }
    const task = omgang[idx];
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Räkna · addition och subtraktion', 'Räkna ut svaret.', level)}
        ${renderScoreBarSimple(omgangResults.filter(x=>x).length, omgangResults.filter(x=>!x).length, omgang.length, idx)}
        <div class="rakna-uppdela-task">
          <div class="rakna-uppdela-line" style="font-size:28px;gap:14px;padding:24px;">
            <span class="rakna-uppdela-target">${task.a}</span>
            <span style="color:var(--ink-soft);font-weight:600;">${task.op}</span>
            <span class="rakna-uppdela-target">${task.b}</span>
            <span style="color:var(--ink-soft);">=</span>
            <input type="text" class="rakna-factor-input" id="main-input" inputmode="numeric" maxlength="6" style="width:90px;" autofocus>
          </div>
          <div class="rakna-uppdela-feedback" id="fb"></div>
          <div style="margin-top:14px;text-align:center;">
            <button class="btn primary" id="check-btn">Kontrollera</button>
          </div>
        </div>
      </div>
    `;
    const inp = document.getElementById('main-input');
    const check = ()=>{
      const val = parseInt(inp.value.trim());
      const fb = document.getElementById('fb');
      fb.classList.add('show');
      inp.disabled = true;
      document.getElementById('check-btn').disabled = true;
      const ts = getTutorScore('begrepp-as','rakna'); ts.total++;
      if(val === task.answer){
        inp.classList.add('correct'); fb.classList.add('correct'); fb.textContent = `Rätt! ${task.a} ${task.op} ${task.b} = ${task.answer}`;
        ts.correct++; omgangResults.push(true);
      } else {
        inp.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent = `${task.a} ${task.op} ${task.b} = ${task.answer}`;
        omgangResults.push(false);
      }
      setTimeout(()=>{ idx++; render(); }, 1600);
    };
    document.getElementById('check-btn').onclick = check;
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){e.preventDefault();check();} });
    setTimeout(()=>inp.focus(), 50);
  }
  omgang = genOmgang();
  render();
}

// ============================================================
// ADDITION: RÄKNA
// ============================================================
function renderAddRakna(body){
  let level = 1;
  let omgang = [];
  let idx = 0;
  let omgangResults = [];

  function genOmgang(){
    const seen = new Set();
    const items = [];
    let attempts = 0;
    while(items.length < 8 && attempts < 200){
      attempts++;
      const task = genAddTask(level);
      const key = `${task.a}+${task.b}`;
      if(!seen.has(key)){ seen.add(key); items.push(task); }
    }
    return items;
  }

  function render(){
    if(idx >= omgang.length){
      const right = omgangResults.filter(x=>x).length;
      const total = omgangResults.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = `<div class="exercise-card">${exerciseHeader('Räkna · addition', `Du klarade ${right} av ${total}.`, level)}${renderSummaryCard({right, total, level, levelChange: adj.change})}</div>`;
      document.getElementById('summary-next-btn').onclick = ()=>{ omgang=genOmgang(); idx=0; omgangResults=[]; render(); };
      return;
    }
    const task = omgang[idx];
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Räkna · addition', 'Räkna ut summan.', level)}
        ${renderScoreBarSimple(omgangResults.filter(x=>x).length, omgangResults.filter(x=>!x).length, omgang.length, idx)}
        <div class="rakna-uppdela-task">
          <div class="rakna-uppdela-line" style="font-size:28px;gap:14px;padding:24px;">
            <span class="rakna-uppdela-target">${task.a}</span>
            <span style="color:var(--ink-soft);font-weight:600;">+</span>
            <span class="rakna-uppdela-target">${task.b}</span>
            <span style="color:var(--ink-soft);">=</span>
            <input type="text" class="rakna-factor-input" id="main-input" inputmode="numeric" maxlength="6" style="width:90px;">
          </div>
          <div class="rakna-uppdela-feedback" id="fb"></div>
          <div style="margin-top:14px;text-align:center;"><button class="btn primary" id="check-btn">Kontrollera</button></div>
        </div>
      </div>
    `;
    const inp = document.getElementById('main-input');
    const check = ()=>{
      const val = parseInt(inp.value.trim());
      const fb = document.getElementById('fb'); fb.classList.add('show');
      inp.disabled = true; document.getElementById('check-btn').disabled = true;
      const ts = getTutorScore('add','rakna'); ts.total++;
      if(val === task.answer){
        inp.classList.add('correct'); fb.classList.add('correct'); fb.textContent = `Rätt! ${task.a} + ${task.b} = ${task.answer}`;
        ts.correct++; omgangResults.push(true);
      } else {
        inp.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent = `${task.a} + ${task.b} = ${task.answer}`;
        omgangResults.push(false);
      }
      setTimeout(()=>{ idx++; render(); }, 1600);
    };
    document.getElementById('check-btn').onclick = check;
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){e.preventDefault();check();} });
    setTimeout(()=>inp.focus(), 50);
  }
  omgang = genOmgang();
  render();
}

// ============================================================
// ADDITION: METOD
// Tre metoder – varje metod presenteras steg för steg + övning
// ============================================================
function renderAddMetod(body){
  let currentMetod = null; // null = välj metod, 'uppstallning'|'talsorterna'|'flytta-over'

  const METODER = [
    {
      id:'uppstallning',
      namn:'Uppställning',
      icon:'📐',
      kortBeskrivning:'Lägg talen under varandra, räkna ental, tiotal, hundratal.',
      beskrivning:'Den klassiska metoden. Skriv talen under varandra och börja räkna från höger (entalen). Om summan är ≥ 10 skriver du ental och för över en minnessiffra till nästa position.',
    },
    {
      id:'talsorterna',
      namn:'Talsorterna var för sig',
      icon:'🔢',
      kortBeskrivning:'Dela upp i hundratal, tiotal och ental – addera separat.',
      beskrivning:'Dela upp båda talen i deras beståndsdelar. Addera varje talsort för sig, sedan summera ihop.',
    },
    {
      id:'flytta-over',
      namn:'Flytta över',
      icon:'⚖️',
      kortBeskrivning:'Flytta ett värde från ena talet till det andra – summan ändras inte.',
      beskrivning:'Flytta ett värde från det ena talet till det andra. Välj ett mellanled som gör uträkningen enklare. Exempel: 105 + 97 -> 102 + 100 = 202.',
    }
  ];

  function renderValjMetod(){
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Metod · addition', 'Välj en metod att öva på. Börja med uppställning om du är osäker.')}
        <div class="metod-val-grid" id="metod-grid">
          ${METODER.map(m=>`
            <button class="metod-val-card" data-metod="${m.id}">
              <div class="metod-val-icon">${m.icon}</div>
              <div class="metod-val-body">
                <div class="metod-val-namn">${m.namn}</div>
                <div class="metod-val-desc">${m.kortBeskrivning}</div>
              </div>
              <div style="color:var(--ink-faint);font-size:20px;">›</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    document.querySelectorAll('[data-metod]').forEach(btn=>{
      btn.onclick = ()=>{ currentMetod = btn.dataset.metod; renderMetodPage(currentMetod); };
    });
  }

  function renderMetodPage(metodId){
    const m = METODER.find(x=>x.id===metodId);
    if(metodId === 'uppstallning') renderUppstallningAdd(body, m, ()=> renderValjMetod());
    else if(metodId === 'talsorterna') renderTalsorternaAdd(body, m, ()=> renderValjMetod());
    else if(metodId === 'flytta-over') renderFlyttaOver(body, m, ()=> renderValjMetod());
  }

  renderValjMetod();
}

// --- METOD: UPPSTÄLLNING (addition) ---
function renderUppstallningAdd(body, metod, backFn){
  let level = 1, omgangResults = [], currentTask = null;
  const OMGANG = 5;
  function rnd(lo,hi){ return lo + Math.floor(Math.random()*(hi-lo+1)); }
  function fmt(n){ return String(Math.round(n*100)/100).replace('.', ','); }
  function lvlNamn(l){ return l===1 ? 'Tvåsiffriga tal' : l===2 ? 'Tresiffriga tal' : 'Decimaltal'; }

  // Kräver minst en övergång i lägsta kolumnen. Nivå 3 = decimaltal (aldrig avslutande 0).
  function genUppstAdd(lvl){
    const dec = lvl===3 ? (Math.random()<0.5?1:2) : 0, scale = Math.pow(10,dec);
    for(let i=0; i<400; i++){
      let a, b;
      if(lvl===1){ a=rnd(13,98); b=rnd(13,98); }
      else if(lvl===2){ a=rnd(115,989); b=rnd(115,989); }
      else { a=(dec===1?rnd(15,999):rnd(115,9999))/scale; b=(dec===1?rnd(15,999):rnd(115,9999))/scale; }
      const aI=Math.round(a*scale), bI=Math.round(b*scale);
      if((aI%10)+(bI%10) < 10) continue;             // garanterad minnessiffra i lägsta kolumnen
      return {a:a, b:b, answer:(aI+bI)/scale, dec:dec};
    }
    return dec===1 ? {a:7.4,b:5.7,answer:13.1,dec:1} : {a:74,b:57,answer:131,dec:0};
  }

  function showSummary(){
    const right = omgangResults.filter(x=>x).length, total = omgangResults.length;
    const adj = adjustLevel(level, right, total); level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · uppställning', 'Du klarade '+right+' av '+total+'.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '</div>';
    document.getElementById('summary-next-btn').onclick = ()=>{ omgangResults=[]; currentTask=genUppstAdd(level); renderPractice(); };
  }

  function renderExplain(){
    const a = 374, b = 286; // fast exempeltal
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Metod · uppställning', metod.beskrivning)}
        <div class="metod-explain-card">
          <h3 class="metod-step-title">Så här fungerar det</h3>
          <p class="metod-step-desc">Vi beräknar <strong>${a} + ${b}</strong> med uppställning.</p>
          <div class="uppstallning-demo" id="demo-container">
            ${renderUppstallningSteg(a, b, -1)}
          </div>
          <div class="metod-demo-nav">
            <button class="btn" id="prev-steg" disabled><- Föregående</button>
            <span id="steg-info" style="font-size:13px;color:var(--ink-soft)">Steg 1 av 4</span>
            <button class="btn primary" id="next-steg">Nästa steg -></button>
          </div>
        </div>
        <div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="btn primary" id="start-practice">Öva nu -></button>
          <button class="btn subtle" id="back-to-metoder">Tillbaka</button>
        </div>
      </div>
    `;
    document.getElementById('back-to-metoder').onclick = backFn;

    let currentSteg = 0;
    const maxSteg = 4;
    const updateSteg = ()=>{
      document.getElementById('demo-container').innerHTML = renderUppstallningSteg(a, b, currentSteg);
      document.getElementById('steg-info').textContent = `Steg ${currentSteg+1} av ${maxSteg}`;
      document.getElementById('prev-steg').disabled = currentSteg === 0;
      const nextBtn = document.getElementById('next-steg');
      nextBtn.textContent = currentSteg === maxSteg-1 ? 'Klar ✓' : 'Nästa steg ->';
      if(currentSteg === maxSteg-1){ nextBtn.onclick = ()=>renderPractice(); }
      else { nextBtn.onclick = ()=>{ currentSteg++; updateSteg(); }; }
    };
    document.getElementById('prev-steg').onclick = ()=>{ if(currentSteg>0){currentSteg--;updateSteg();} };
    document.getElementById('start-practice').onclick = renderPractice;
    updateSteg();   // visa steg 0 direkt och koppla Nästa-knappen rätt (annars hoppades steg 0 över)
  }

  function renderUppstallningSteg(a, b, steg){
    // steg: -1=bara talen, 0=ental klart, 1=tiotal klart, 2=hundratal klart, 3=svar
    const sum = a + b;
    const entalsCarry = (a%10 + b%10) >= 10 ? 1 : 0;
    const tioCarry = (Math.floor(a/10)%10 + Math.floor(b/10)%10 + entalsCarry) >= 10 ? 1 : 0;

    const stegTexts = [
      `Ental: ${a%10} + ${b%10} = ${a%10+b%10}. ${entalsCarry?'Skriv '+(a%10+b%10-10)+' i entalen och för minnessiffran 1 till tiotalet.':'Skriv '+((a+b)%10)+' i entalen.'}`,
      `Tiotal: ${Math.floor(a/10)%10} + ${Math.floor(b/10)%10}${entalsCarry?' + minnessiffran 1':''} = ${Math.floor(a/10)%10+Math.floor(b/10)%10+entalsCarry}. ${tioCarry?'Skriv '+(Math.floor(a/10)%10+Math.floor(b/10)%10+entalsCarry-10)+' och för minnessiffran 1 vidare.':'Skriv '+(Math.floor(a/10)%10+Math.floor(b/10)%10+entalsCarry)+'.'}`,
      `Hundratal: ${Math.floor(a/100)} + ${Math.floor(b/100)}${tioCarry?' + minnessiffran 1':''} = ${Math.floor(a/100)+Math.floor(b/100)+tioCarry}. Skriv ${Math.floor(sum/100)}.`,
      `Klart! ${a} + ${b} = ${sum}.`
    ];

    // Minnessiffra-rad: ¹ över tiotalet (steg≥1) och hundratalet (steg≥2)
    let carryRow = '';
    for(let pos=3; pos>=0; pos--){
      let m = '';
      if(pos===1 && entalsCarry && steg>=0) m = '¹';   // minnessiffran till tiotalet skrivs i ental-steget
      if(pos===2 && tioCarry && steg>=1) m = '¹';       // minnessiffran till hundratalet skrivs i tiotal-steget
      carryRow += '<span class="carry">' + m + '</span>';
    }

    // Svarsrad: fyll en siffra i taget (position 0..steg), inte allt på en gång
    let resultRow = '';
    const sStr = String(sum).padStart(4,' ');
    for(let i=0;i<4;i++){
      const c = sStr[i], pos = 3 - i;
      if(c === ' ') resultRow += '<span> </span>';
      else if(steg>=0 && steg>=pos) resultRow += '<span class="result-digit">' + c + '</span>';
      else resultRow += '<span></span>';
    }

    return `
      <div class="uppstallning-box">
        <div class="upp-carry-row">${carryRow}</div>
        <div class="upp-row a">${digitSpans(a, 4)}</div>
        <div class="upp-row b">${digitSpansOp(b, 4, '+')}</div>
        <div class="upp-line"></div>
        <div class="upp-row result">${resultRow}</div>
      </div>
      ${steg >= 0 ? `<div class="metod-steg-note">${stegTexts[steg]}</div>` : ''}
    `;
  }

  function digitSpans(n, width, highlight=false){
    const s = String(n).padStart(width, ' ');
    return s.split('').map((c,i)=>
      c === ' ' ? '<span> </span>' :
      `<span class="${highlight?'result-digit':''}">${c}</span>`
    ).join('');
  }

  // Som digitSpans men sätter operatorn (+) i kolumnen till vänster om första siffran
  function digitSpansOp(n, width, op){
    const nStr = String(n);
    const opIdx = Math.max(0, width - nStr.length - 1);
    const s = nStr.padStart(width, ' ');
    return s.split('').map((c,i)=>{
      if(i === opIdx) return `<span style="color:var(--c-metod);font-weight:700">${op}</span>`;
      return c === ' ' ? '<span> </span>' : `<span>${c}</span>`;
    }).join('');
  }

  function renderPractice(){
    currentTask = genUppstAdd(level);
    const {a, b, answer, dec} = currentTask;
    const scale = Math.pow(10, dec);
    const aI = Math.round(a*scale), bI = Math.round(b*scale), ansI = Math.round(answer*scale);

    // Hjälp: siffra på given (skalad) position
    const digit = (n, pos) => Math.floor(n / Math.pow(10, pos)) % 10;
    const hasDigit = (n, pos) => Math.floor(n / Math.pow(10, pos)) > 0 || pos === 0;

    const width = Math.max(String(aI).length, String(bI).length, String(ansI).length);
    // kolumner höger→vänster, decimalpunkt efter pos===dec
    const cols = [];
    for(let p=width-1; p>=0; p--){ cols.push({t:'d', p:p}); if(dec>0 && p===dec) cols.push({t:'dot'}); }
    const dotA = '<div class="upp-i-cell upp-dec-cell"><span class="upp-dec-pt">,</span></div>';
    const dotEmpty = '<div class="upp-i-cell upp-dec-cell"></div>';

    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Metod · uppställning', lvlNamn(level)+' · Uppgift '+(omgangResults.length+1)+' av '+OMGANG, level)}
        <div class="metod-explain-card">
          <p style="font-size:15px;margin:0 0 6px;color:var(--ink-soft);">Beräkna <strong style="font-family:var(--mono);color:var(--c-metod);">${fmt(a)} + ${fmt(b)}</strong>:</p>

          <div class="uppstallning-practice">
            <div class="uppstallning-interaktiv">

              <!-- Minnessiffre-rad: tomma platser, minnesrutor läggs till manuellt -->
              <div class="upp-i-row carry-row">
                <div class="upp-i-op-cell"></div>
                ${cols.map(c => c.t==='dot' ? dotEmpty : `<div class="upp-i-cell" data-carrycell="${c.p}"></div>`).join('')}
              </div>

              <!-- Rad A -->
              <div class="upp-i-row">
                <div class="upp-i-op-cell"></div>
                ${cols.map(c => c.t==='dot' ? dotA : `<div class="upp-i-cell"><span class="upp-i-digit ${!hasDigit(aI,c.p) && c.p>0 ? 'faint' : ''}">${hasDigit(aI,c.p) ? digit(aI,c.p) : ''}</span></div>`).join('')}
              </div>

              <!-- Rad B -->
              <div class="upp-i-row">
                <div class="upp-i-op-cell opp-sign">+</div>
                ${cols.map(c => c.t==='dot' ? dotA : `<div class="upp-i-cell"><span class="upp-i-digit ${!hasDigit(bI,c.p) && c.p>0 ? 'faint' : ''}">${hasDigit(bI,c.p) ? digit(bI,c.p) : ''}</span></div>`).join('')}
              </div>

              <!-- Linje -->
              <div class="upp-i-line"></div>

              <!-- Svarsrad -->
              <div class="upp-i-row answer-row">
                <div class="upp-i-op-cell"></div>
                ${cols.map(c => c.t==='dot' ? dotA : `<div class="upp-i-cell"><input type="text" class="ans-input" data-pos="${c.p}" inputmode="numeric" maxlength="1"></div>`).join('')}
              </div>

            </div>
          </div>

          <div style="text-align:center;margin:8px 0 2px;">
            <button class="btn subtle" id="minne-btn" style="font-size:13px;">↑ Lägg till minnessiffra</button>
          </div>
          <div class="rakna-uppdela-feedback" id="fb"></div>
          ${keypadHTML([])}
          <div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button class="btn primary" id="check-btn">Kontrollera</button>
            <button class="btn subtle" id="back-btn">Tillbaka till metoder</button>
          </div>
        </div>
      </div>
    `;

    const ansInputs = Array.from(document.querySelectorAll('.ans-input'))
      .sort((a,b) => parseInt(a.dataset.pos) - parseInt(b.dataset.pos)); // ental först (pos 0)

    ansInputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/[^0-9]/g,'');
        if(inp.value && i < ansInputs.length - 1) ansInputs[i+1].focus();   // auto-hopp höger→vänster
      });
      inp.addEventListener('keydown', e => {
        if(e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
          e.preventDefault();
          if(i < ansInputs.length - 1) ansInputs[i+1].focus();
          else check();
        }
      });
    });

    // Minnessiffra läggs till MANUELLT: första trycket ger en ruta över tiotalet (pos 1),
    // nästa över hundratalet (pos 2), osv. Aldrig över entalet (pos 0).
    let nastaMinne = 1;
    const minneBtn = document.getElementById('minne-btn');
    function laggTillMinne(){
      if(nastaMinne > width - 1) return;                     // inga fler kolumner att bära över till
      const pos = nastaMinne;
      const cell = body.querySelector('[data-carrycell="' + pos + '"]');
      if(!cell) return;
      cell.innerHTML = '<input type="text" class="carr-input" data-pos="' + pos + '" inputmode="numeric" maxlength="1" placeholder="">';
      const inp = cell.querySelector('.carr-input');
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/[^0-9]/g,'');
        // Minnessiffran ifylld → hoppa automatiskt ned till svarsrutan i samma kolumn
        if(inp.value){ const svar = body.querySelector('.ans-input[data-pos="' + pos + '"]'); if(svar) svar.focus(); }
      });
      inp.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); check(); } });
      nastaMinne++;
      if(nastaMinne > width - 1) minneBtn.disabled = true;
      inp.focus();
    }
    if(minneBtn){
      minneBtn.onclick = laggTillMinne;
      if(width - 1 < 1) minneBtn.disabled = true;            // ryms ingen minnessiffra alls
    }

    // Fokusera ental-svaret direkt + koppla sifferknappsats mot fokuserad ruta
    setTimeout(() => ansInputs[0] && ansInputs[0].focus(), 50);
    bindKeypad(body.querySelector('.exercise-card'));

    const check = () => {
      let correct = true;
      ansInputs.forEach(inp => {
        const pos = parseInt(inp.dataset.pos);
        const expected = digit(ansI, pos);
        const val = inp.value === '' ? 0 : parseInt(inp.value);
        const posExists = Math.floor(ansI / Math.pow(10, pos)) > 0 || pos === 0;
        inp.disabled = true;
        if(posExists && val === expected){ inp.classList.add('correct'); }
        else if(!posExists && (inp.value === '' || val === 0)){ /* ok tom */ }
        else { inp.classList.add('wrong'); correct = false; }
      });
      body.querySelectorAll('.carr-input').forEach(inp => inp.disabled = true);

      const fb = document.getElementById('fb'); fb.classList.add('show');
      document.getElementById('check-btn').disabled = true;
      const ts = getTutorScore('add','metod'); ts.total++;
      omgangResults.push(correct);

      if(correct){
        fb.classList.add('correct');
        fb.textContent = `Rätt! ${fmt(a)} + ${fmt(b)} = ${fmt(answer)} ✓`;
        ts.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = `Inte rätt – ${fmt(a)} + ${fmt(b)} = ${fmt(answer)}. Kontrollera kolumn för kolumn.`;
      }
      setTimeout(() => { if(omgangResults.length>=OMGANG) showSummary(); else { currentTask=genUppstAdd(level); renderPractice(); } }, correct?1800:2500);
    };

    document.getElementById('check-btn').onclick = check;
    document.getElementById('back-btn').onclick = backFn;
  }

  renderExplain();
}

// --- METOD: TALSORTERNA VAR FÖR SIG (addition) ---
function renderTalsorternaAdd(body, metod, backFn){
  let level = 1, omgangResults = [], uppgNr = 0;
  const OMGANG = 5;
  function rnd(lo,hi){ return lo + Math.floor(Math.random()*(hi-lo+1)); }
  function fmt(n){ return String(Math.round(n*100)/100).replace('.', ','); }
  function lvlNamn(l){ return l===1 ? 'Tresiffriga tal' : l===2 ? 'Fyrsiffriga tal' : 'Decimaltal'; }
  function newTask(lvl){
    if(lvl===1){ const a=rnd(112,989), b=rnd(112,989); return {a:a,b:b,answer:a+b,dec:0}; }
    if(lvl===2){ const a=rnd(1123,9899), b=rnd(1123,9899); return {a:a,b:b,answer:a+b,dec:0}; }
    const dec = Math.random()<0.5 ? 1 : 2, scale = Math.pow(10,dec);
    const aI = dec===1 ? rnd(15,999) : rnd(115,9999);
    const bI = dec===1 ? rnd(15,999) : rnd(115,9999);
    return {a:aI/scale, b:bI/scale, answer:(aI+bI)/scale, dec:dec};
  }
  let task = newTask(level);
  let terms = [''];  // state lever utanför render()

  function showSummary(){
    const right = omgangResults.filter(x=>x).length, total = omgangResults.length;
    const adj = adjustLevel(level, right, total); level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · talsorterna var för sig', 'Du klarade '+right+' av '+total+'.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults=[]; task=newTask(level); terms=['']; render(); };
  }

  function refreshInputs(){
    const row = document.getElementById('ts-inputs-row');
    if(!row) return;
    row.innerHTML = terms.map((val, i) =>
      (i > 0 ? '<span class="ts-op ts-plus-sep">+</span>' : '') +
      '<input type="text" class="ts-term-input" data-idx="' + i + '" inputmode="decimal" maxlength="7" value="' + val + '" placeholder="___">'
    ).join('');

    row.querySelectorAll('.ts-term-input').forEach((inp, i) => {
      inp.addEventListener('input', () => { terms[i] = inp.value; });
      inp.addEventListener('keydown', e => {
        if(e.key === '+') { e.preventDefault(); addTerm(); }
        else if(e.key === '=' || e.key === 'Enter') {
          e.preventDefault();
          const all = row.querySelectorAll('.ts-term-input');
          if(i === all.length - 1) jumpToFinal();
          else all[i+1].focus();
        }
      });
    });
    const last = row.querySelector('.ts-term-input:last-of-type');
    const finalEl = document.getElementById('ts-final-ans');
    if(last && finalEl && document.activeElement !== finalEl) last.focus();
  }

  function addTerm(){
    terms.push('');
    refreshInputs();
  }
  function removeTerm(){
    if(terms.length > 1){ terms.pop(); refreshInputs(); }
  }
  function jumpToFinal(){
    const el = document.getElementById('ts-final-ans');
    if(el) el.focus();
  }

  function render(){
    uppgNr++;
    const {a, b, answer, dec} = task;
    const scale = Math.pow(10, dec);
    const aI = Math.round(a*scale), bI = Math.round(b*scale);
    const maxLen = String(Math.max(aI,bI)).length;
    const delar = [];
    for(let p=maxLen-1; p>=0; p--){
      const s = (Math.floor(aI/Math.pow(10,p))%10 + Math.floor(bI/Math.pow(10,p))%10) * Math.pow(10,p);
      if(s>0) delar.push(s/scale);
    }
    const rattMellanled = delar.map(fmt).join(' + ');
    const visaTips = level===1 && uppgNr<=2;

    body.innerHTML = '<div class="exercise-card">' +
      exerciseHeader('Metod · talsorterna var för sig', lvlNamn(level)+' · Uppgift '+(omgangResults.length+1)+' av '+OMGANG, level) +
      '<div class="metod-explain-card">' +
      (visaTips ? '<div style="background:var(--bg-warm);padding:12px 14px;border-radius:var(--radius);margin-bottom:18px;font-size:13px;line-height:1.6;">' +
        '<strong>Idén:</strong> Dela upp talen i talsorter, addera varje talsort för sig och summera ihop.<br>' +
        '<span style="color:var(--ink-soft);">Exempel: ' + fmt(a) + ' + ' + fmt(b) + ' = ' + rattMellanled + ' = ' + fmt(answer) + '</span>' +
      '</div>' : '') +
      '<div class="ts-rad-container">' +
        '<div class="ts-rad-fast">' +
          '<span class="ts-num">' + fmt(a) + '</span>' +
          '<span class="ts-op">+</span>' +
          '<span class="ts-num">' + fmt(b) + '</span>' +
          '<span class="ts-op">=</span>' +
        '</div>' +
        '<div class="ts-rad-inputs" id="ts-inputs-row"></div>' +
        '<span class="ts-op ts-eq-final">=</span>' +
        '<input type="text" class="ts-ans-input" id="ts-final-ans" inputmode="decimal" maxlength="8" placeholder="?">' +
      '</div>' +
      '<div class="ts-snabbknappar">' +
        '<button class="ts-snabb-btn" id="ts-plus-btn">+ <span style="font-size:11px;opacity:.7">lägg till term</span></button>' +
        '<button class="ts-snabb-btn ts-snabb-eq" id="ts-eq-btn">= <span style="font-size:11px;opacity:.7">hoppa till svar</span></button>' +
        '<button class="ts-snabb-btn ts-snabb-del" id="ts-del-btn">✕ <span style="font-size:11px;opacity:.7">ta bort</span></button>' +
      '</div>' +
      '<div class="rakna-uppdela-feedback" id="fb-ts"></div>' +
      keypadHTML([',']) +
      '<div style="margin-top:14px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
        '<button class="btn primary" id="ts-check">Kontrollera</button>' +
        '<button class="btn subtle" id="ts-ny">Ny uppgift</button>' +
        '<button class="btn subtle" id="ts-back">Tillbaka</button>' +
      '</div></div></div>';

    document.getElementById('ts-plus-btn').onclick = addTerm;
    document.getElementById('ts-eq-btn').onclick = jumpToFinal;
    document.getElementById('ts-del-btn').onclick = removeTerm;
    document.getElementById('ts-back').onclick = backFn;
    document.getElementById('ts-ny').onclick = () => { task = newTask(level); terms = ['']; render(); };

    document.getElementById('ts-final-ans').addEventListener('keydown', e => {
      if(e.key === 'Enter'){ e.preventDefault(); check(); }
    });
    document.getElementById('ts-check').onclick = check;

    refreshInputs();
    bindKeypad(body.querySelector('.exercise-card'));

    function check(){
      const termInputs = document.querySelectorAll('.ts-term-input');
      const pf = v => parseFloat(String(v).replace(',','.'));
      const near = (x,y) => Math.abs(x-y) < 1e-9;
      const termVals = Array.from(termInputs).map(i => pf(i.value)).filter(v => !isNaN(v));
      const finalVal = pf(document.getElementById('ts-final-ans').value);
      const fb = document.getElementById('fb-ts');
      fb.classList.remove('correct','wrong'); fb.classList.add('show');
      document.getElementById('ts-check').disabled = true;
      termInputs.forEach(inp => inp.disabled = true);
      document.getElementById('ts-final-ans').disabled = true;
      const ts = getTutorScore('add','metod'); ts.total++;
      const termSum = termVals.reduce((x,y) => x+y, 0);
      const termsOK = termVals.length >= 2 && near(termSum, answer);   // måste dela upp, inte bara skriva svaret
      const finalOK = !isNaN(finalVal) && near(finalVal, answer);
      const nasta = ok => { omgangResults.push(ok); setTimeout(() => { if(omgangResults.length>=OMGANG) showSummary(); else { task=newTask(level); terms=['']; render(); } }, ok?2000:2700); };
      if(termsOK && finalOK){
        termInputs.forEach(i => i.classList.add('correct'));
        document.getElementById('ts-final-ans').classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + fmt(a) + ' + ' + fmt(b) + ' = ' + termVals.map(fmt).join(' + ') + ' = ' + fmt(answer) + ' ✓';
        ts.correct++; nasta(true);
      } else if(termsOK){
        termInputs.forEach(i => i.classList.add('correct'));
        document.getElementById('ts-final-ans').classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Termerna stämmer! Men slutsvaret är fel. Summan är ' + fmt(answer) + '.';
        nasta(false);
      } else {
        termInputs.forEach(i => i.classList.add('wrong'));
        fb.classList.add('wrong');
        fb.textContent = (termVals.length < 2 ? 'Dela upp i minst två talsorter. ' : 'Termerna summeras till ' + fmt(termSum) + ', men rätt svar är ' + fmt(answer) + '. ') + 'Rätt mellanled: ' + rattMellanled + '.';
        nasta(false);
      }
    }
  }

  render();
}


// --- METOD: FLYTTA ÖVER (addition) ---
function renderFlyttaOver(body, metod, backFn){
  let level = 1, omgangResults = [], uppgNr = 0;
  const OMGANG = 5;
  function rnd(lo,hi){ return lo + Math.floor(Math.random()*(hi-lo+1)); }
  function fmt(n){ return String(Math.round(n*1000)/1000).replace('.', ','); }
  function lvlNamn(l){ return l===1 ? 'Tvåsiffriga tal' : l===2 ? 'Tresiffriga tal' : 'Decimaltal'; }

  // Ett tal ligger 1–3 (tiondelar) under nästa hela steg; det andra ger bort gapet.
  // Ex: 28 + 34 → flytta 2 → 30 + 32.  Nivå 3 i tiondelar: 4,8 + 3,5 → 5,0 + 3,3.
  function newTask(lvl){
    const dec = lvl===3 ? 1 : 0, scale = dec===1 ? 10 : 1;
    for(let i=0; i<400; i++){
      let xI, yI;
      if(lvl===1){ xI = rnd(20,89);  yI = rnd(20,89); }
      else if(lvl===2){ xI = rnd(120,889); yI = rnd(120,889); }
      else { xI = rnd(21,89); yI = rnd(21,89); }          // tiondelar → 2,1–8,9
      const g = 10 - (xI % 10);                            // gap till nästa hela steg
      if(g < 1 || g > 3) continue;
      if(yI % 10 < g) continue;                            // y kan ge bort g
      if(yI % 10 === 0) continue;
      const foerst = Math.random() < 0.5;
      const aI = foerst ? xI : yI, bI = foerst ? yI : xI;
      return { a:aI/scale, b:bI/scale, answer:(xI+yI)/scale, nara:(foerst?'a':'b'), gap:g/scale, dec:dec };
    }
    return dec===1 ? {a:4.8,b:3.5,answer:8.3,nara:'a',gap:0.2,dec:1} : {a:28,b:34,answer:62,nara:'a',gap:2,dec:0};
  }

  let task = newTask(level);

  function showSummary(){
    const right = omgangResults.filter(x=>x).length, total = omgangResults.length;
    const adj = adjustLevel(level, right, total); level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · flytta över', 'Du klarade '+right+' av '+total+'.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '</div>';
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults=[]; task=newTask(level); render(); };
  }

  function render(){
    uppgNr++;
    const {a, b, answer, dec} = task;
    const visaTips = level===1 && uppgNr<=2;

    // Bygg HTML med string concat – inga nästlade template literals
    body.innerHTML =
      '<div class="exercise-card">'
      + exerciseHeader('Metod · flytta över', lvlNamn(level)+' · Uppgift '+(omgangResults.length+1)+' av '+OMGANG, level)
      + '<div class="metod-explain-card">'
        + (visaTips ? '<div style="background:var(--bg-warm);padding:12px 14px;border-radius:var(--radius);margin-bottom:18px;font-size:13px;line-height:1.6;">'
          + '<strong>Idén:</strong> Flytta ett värde från ett tal till det andra – summan ändras inte.<br>'
          + '<span style="color:var(--ink-soft);">Exempel: 47 + 35 &rarr; flytta 3 &rarr; 50 + 32 = 82</span>'
        + '</div>' : '')
        + '<div class="om-flytt-rad" style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:14px;font-size:14px;color:var(--ink-soft);">'
          + '<span>Flytta</span>'
          + '<input type="text" class="om-u-input" id="om-flytt" inputmode="decimal" maxlength="4" placeholder="?" style="width:56px;">'
          + '<span>från det ena talet till det andra.</span>'
        + '</div>'
        + '<div class="om-uttryck-rad" style="justify-content:center;">'
          + '<span class="om-u-num">' + fmt(a) + '</span>'
          + '<span class="om-u-op">+</span>'
          + '<span class="om-u-num">' + fmt(b) + '</span>'
          + '<span class="om-u-op">=</span>'
          + '<input type="text" class="om-u-input" id="ml-a" inputmode="decimal" maxlength="6" placeholder="___">'
          + '<span class="om-u-op">+</span>'
          + '<input type="text" class="om-u-input" id="ml-b" inputmode="decimal" maxlength="6" placeholder="___">'
          + '<span class="om-u-op">=</span>'
          + '<input type="text" class="om-u-input om-u-input-sum" id="ml-sum" inputmode="decimal" maxlength="7" placeholder="?">'
        + '</div>'
        + '<div class="rakna-uppdela-feedback" id="fb-fo"></div>'
        + keypadHTML([])
        + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="btn primary" id="fo-check">Kontrollera</button>'
          + '<button class="btn subtle" id="fo-ny">Ny uppgift</button>'
          + '<button class="btn subtle" id="fo-back">Tillbaka</button>'
        + '</div>'
      + '</div></div>';

    document.getElementById('fo-back').onclick = backFn;
    document.getElementById('fo-ny').onclick   = function(){ task=newTask(level); render(); };

    var mlA   = document.getElementById('ml-a');
    var mlB   = document.getElementById('ml-b');
    var mlSum = document.getElementById('ml-sum');
    var flEl  = document.getElementById('om-flytt');

    flEl.addEventListener('keydown', function(e){ if(e.key==='Enter'){e.preventDefault(); mlA.focus();} });
    mlA.addEventListener('keydown',  function(e){ if(e.key==='Enter'){e.preventDefault(); mlB.focus();} });
    mlB.addEventListener('keydown',  function(e){ if(e.key==='Enter'){e.preventDefault(); mlSum.focus();} });
    mlSum.addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault(); check();} });
    document.getElementById('fo-check').onclick = check;
    setTimeout(function(){ flEl.focus(); }, 50);
    bindKeypad(body.querySelector('.exercise-card'));

    function parse(v){ return parseFloat(String(v).replace(',','.')); }
    function near(x,y){ return Math.abs(x-y) < 1e-9; }
    function nasta(ok){
      omgangResults.push(ok);
      setTimeout(function(){ if(omgangResults.length>=OMGANG) showSummary(); else { task=newTask(level); render(); } }, ok?2100:2600);
    }
    function check(){
      var flytt = parse(flEl.value)||0, aVal = parse(mlA.value), bVal = parse(mlB.value), sumVal = parse(mlSum.value);
      var fb = document.getElementById('fb-fo');
      fb.classList.remove('correct','wrong'); fb.classList.add('show');
      [mlA,mlB,mlSum].forEach(function(i){ i.classList.remove('correct','wrong'); i.disabled=true; });
      flEl.disabled=true;
      document.getElementById('fo-check').disabled=true;

      var ts = getTutorScore('add','metod'); ts.total++;
      var flyttStammer = flytt>0 && ((near(aVal,a+flytt) && near(bVal,b-flytt)) || (near(aVal,a-flytt) && near(bVal,b+flytt)));
      var mellanledOK  = !isNaN(aVal) && !isNaN(bVal) && near(aVal+bVal, answer);
      var sumOK        = !isNaN(sumVal) && near(sumVal, answer);

      if(mellanledOK && sumOK){
        [mlA,mlB,mlSum].forEach(function(i){ i.classList.add('correct'); });
        fb.classList.add('correct');
        fb.textContent = (flyttStammer ? 'Rätt! Du flyttade '+fmt(flytt)+'. ' : 'Rätt! ')
          + fmt(a)+' + '+fmt(b)+' = '+fmt(aVal)+' + '+fmt(bVal)+' = '+fmt(answer)+' ✓';
        ts.correct++; nasta(true);
      } else if(mellanledOK && !sumOK){
        mlA.classList.add('correct'); mlB.classList.add('correct'); mlSum.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Mellanledet stämmer ('+fmt(aVal)+' + '+fmt(bVal)+' = '+fmt(answer)+'), men slutsvaret är fel.';
        nasta(false);
      } else {
        [mlA,mlB,mlSum].forEach(function(i){ i.classList.add('wrong'); });
        fb.classList.add('wrong');
        var nearVal  = task.nara === 'a' ? a : b;
        var otherVal = task.nara === 'a' ? b : a;
        var g = task.gap;
        fb.textContent = 'Mellanledet stämmer inte. Tips: flytta '+fmt(g)+' från '+fmt(otherVal)+' till '+fmt(nearVal)+': '+fmt(nearVal+g)+' + '+fmt(otherVal-g)+' = '+fmt(answer)+'.';
        [mlA,mlB,mlSum,flEl].forEach(function(i){ i.disabled=false; });
        document.getElementById('fo-check').disabled=false;
      }
    }
  }

  render();
}

// ============================================================
// SUBTRAKTION: RÄKNA
// ============================================================
function renderSubRakna(body){
  let level = 1;
  let omgang = [];
  let idx = 0;
  let omgangResults = [];

  function genOmgang(){
    const seen = new Set();
    const items = [];
    let attempts = 0;
    while(items.length < 8 && attempts < 200){
      attempts++;
      const task = genSubTask(level);
      const key = `${task.a}-${task.b}`;
      if(!seen.has(key)){ seen.add(key); items.push(task); }
    }
    return items;
  }

  function render(){
    if(idx >= omgang.length){
      const right = omgangResults.filter(x=>x).length;
      const total = omgangResults.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = `<div class="exercise-card">${exerciseHeader('Räkna · subtraktion', `Du klarade ${right} av ${total}.`, level)}${renderSummaryCard({right, total, level, levelChange: adj.change})}</div>`;
      document.getElementById('summary-next-btn').onclick = ()=>{ omgang=genOmgang(); idx=0; omgangResults=[]; render(); };
      return;
    }
    const task = omgang[idx];
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Räkna · subtraktion', 'Räkna ut differensen.', level)}
        ${renderScoreBarSimple(omgangResults.filter(x=>x).length, omgangResults.filter(x=>!x).length, omgang.length, idx)}
        <div class="rakna-uppdela-task">
          <div class="rakna-uppdela-line" style="font-size:28px;gap:14px;padding:24px;">
            <span class="rakna-uppdela-target">${task.a}</span>
            <span style="color:var(--ink-soft);font-weight:600;">−</span>
            <span class="rakna-uppdela-target">${task.b}</span>
            <span style="color:var(--ink-soft);">=</span>
            <input type="text" class="rakna-factor-input" id="main-input" inputmode="numeric" maxlength="6" style="width:90px;">
          </div>
          <div class="rakna-uppdela-feedback" id="fb"></div>
          <div style="margin-top:14px;text-align:center;"><button class="btn primary" id="check-btn">Kontrollera</button></div>
        </div>
      </div>
    `;
    const inp = document.getElementById('main-input');
    const check = ()=>{
      const val = parseInt(inp.value.trim());
      const fb = document.getElementById('fb'); fb.classList.add('show');
      inp.disabled = true; document.getElementById('check-btn').disabled = true;
      const ts = getTutorScore('sub-rakna','rakna'); ts.total++;
      const tsGr = getTutorScore('sub-rakna','enkel'); tsGr.total++;
      if(val === task.answer){
        inp.classList.add('correct'); fb.classList.add('correct'); fb.textContent = `Rätt! ${task.a} − ${task.b} = ${task.answer}`;
        ts.correct++; tsGr.correct++; omgangResults.push(true);
      } else {
        inp.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent = `${task.a} − ${task.b} = ${task.answer}`;
        omgangResults.push(false);
      }
      setTimeout(()=>{ idx++; render(); }, 1600);
    };
    document.getElementById('check-btn').onclick = check;
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){e.preventDefault();check();} });
    setTimeout(()=>inp.focus(), 50);
  }
  omgang = genOmgang();
  render();
}

// ============================================================
// SUBTRAKTION: METOD
// Tre metoder: uppställning, öka-och-minska-lika, addition-bakifran
// ============================================================
function renderSubMetod(body){
  let currentMetod = null;

  const METODER = [
    {
      id:'uppstallning-sub',
      namn:'Uppställning',
      icon:'📐',
      kortBeskrivning:'Lägg talen under varandra och subtrahera position för position.',
      beskrivning:'Samma princip som addition med uppställning. Börja med entalen. Om det undre talet är större behöver du "låna" från nästa position.'
    },
    {
      id:'oka-minska',
      namn:'Öka och minska lika',
      icon:'⚖️',
      kortBeskrivning:'Lägg till samma tal på båda för att göra subtraktionen enklare.',
      beskrivning:'Om man ökar (eller minskar) båda talen i en subtraktion med samma värde, ändras inte differensen. Välj ett tillägg som gör det undre talet jämnt.'
    },
    {
      id:'addition-bakifran',
      namn:'Addition bakifrån',
      icon:'↩️',
      kortBeskrivning:'Räkna från det lilla till det stora – hur mycket saknas?',
      beskrivning:'Istället för att dra ifrån räknar du hur mycket du behöver lägga till för att komma från det lilla talet till det stora. Lägg ihop stegen.'
    }
  ];

  function renderValjMetod(){
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Metod · subtraktion', 'Välj en metod att öva på.')}
        <div class="metod-val-grid" id="metod-grid">
          ${METODER.map(m=>`
            <button class="metod-val-card" data-metod="${m.id}">
              <div class="metod-val-icon">${m.icon}</div>
              <div class="metod-val-body">
                <div class="metod-val-namn">${m.namn}</div>
                <div class="metod-val-desc">${m.kortBeskrivning}</div>
              </div>
              <div style="color:var(--ink-faint);font-size:20px;">›</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    document.querySelectorAll('[data-metod]').forEach(btn=>{
      btn.onclick = ()=>{ currentMetod = btn.dataset.metod; renderMetodPage(currentMetod); };
    });
  }

  function renderMetodPage(metodId){
    const m = METODER.find(x=>x.id===metodId);
    if(metodId === 'uppstallning-sub') renderUppstallningSubEnkel(body, m, ()=> renderValjMetod());
    else if(metodId === 'oka-minska') renderOkaMinska(body, m, ()=> renderValjMetod());
    else if(metodId === 'addition-bakifran') renderAdditionBakifran(body, m, ()=> renderValjMetod());
  }

  renderValjMetod();
}


// --- SUB METOD: UPPSTÄLLNING (subtraktion) ---
// 15 nivåer: heltal (1-10) + decimaltal (11-15)
// Blandade tal-storlekar, t.ex. 435 - 63
function renderUppstallningSubEnkel(body, metod, backFn){
  var level   = 1;
  var laan    = false;
  var borrows = new Set();
  var omgangResults = [];
  var currentTask   = null;
  var OMGANG  = 5;
  var MAX_LVL = 3;           // 1 två/tresiffrigt · 2 hundratal/tusental · 3 decimaltal
  var svarVal = {};          // pos -> ifyllt svar (bevaras när lån-knappen re-renderar)
  var sistFokusPos = null;   // senast fokuserade svarsruta (så markören inte hoppar till entalet)

  function rnd(lo,hi){ return lo + Math.floor(Math.random()*(hi-lo+1)); }

  function countBorrows(a,b){
    var n=0,carry=0,ta=a,tb=b;
    while(tb>0||carry>0){
      var ad=ta%10, bd=(tb%10)+carry;
      carry = (ad<bd) ? 1 : 0;
      if(carry) n++;
      ta=Math.floor(ta/10); tb=Math.floor(tb/10);
    }
    return n;
  }

  function hasZeroMiddle(n){
    var s=String(n);
    return s.length>=3 && s.slice(1,-1).indexOf('0')>=0;
  }

  function genTask(lvl){
    for(var i=0;i<600;i++){
      var aInt,bInt,dec=0;
      if(lvl===1){                          // heltal 2-3 siffror, 0-2 lån (blandat)
        aInt=rnd(100,999);
        bInt = Math.random()<0.5 ? rnd(23,99) : rnd(100,aInt-2);
      } else if(lvl===2){                    // hundratal och tusental (3-4 siffror), fler lån, ibland nolla
        if(Math.random()<0.35){              // garanterad nolla i mitten: X0YZ / XY0Z
          var h=rnd(1,9), e=rnd(1,9);
          aInt = h*1000 + (Math.random()<0.5?0:rnd(1,9))*100 + (Math.random()<0.5?0:rnd(1,9))*10 + e;
        } else {
          aInt = Math.random()<0.3 ? rnd(210,999) : rnd(1000,9999);
        }
        bInt = Math.random()<0.3 ? rnd(100,999) : rnd(1000,Math.max(1000,aInt-2));
        if(bInt>=aInt) bInt = rnd(100, aInt-2);
      } else {                               // decimaltal (1-2 decimaler)
        dec = Math.random()<0.5 ? 1 : 2;
        aInt = dec===1 ? (Math.random()<0.5 ? rnd(11,99) : rnd(101,999)) : rnd(101,999);
        bInt = Math.random()<0.4 ? rnd(11,99) : rnd(100,aInt-2);
      }

      if(aInt<=bInt) continue;
      var nb = countBorrows(aInt,bInt);
      var ok = lvl===1 ? (nb<=2) : lvl===2 ? (nb>=2) : (nb>=1);
      if(ok) return {aInt:aInt,bInt:bInt,ansInt:aInt-bInt,dec:dec};
    }
    return lvl===3 ? {aInt:834,bInt:276,ansInt:558,dec:1} : {aInt:1503,bInt:278,ansInt:1225,dec:0};
  }

  function displayNum(n,dec){
    if(dec===0) return String(n);
    var s=String(n).padStart(dec+1,'0');
    return s.slice(0,-dec)+'.'+s.slice(-dec);
  }

  // Bygger kolumn-struktur: [{type:'digit',pos:N}|{type:'decimal'}]
  function buildCols(task){
    var a=task.aInt, b=task.bInt, dec=task.dec;
    var maxInt = Math.max(a,b);
    var intPart = dec>0 ? Math.floor(maxInt/Math.pow(10,dec)) : maxInt;
    var intDigits = String(intPart).length;
    var totalDigits = intDigits + dec;
    var cols=[];
    for(var p=totalDigits-1; p>=0; p--){
      cols.push({type:'digit',pos:p});
      if(dec>0 && p===dec) cols.push({type:'decimal'});
    }
    return cols;
  }

  function dgt(n,p){ return Math.floor(n/Math.pow(10,p))%10; }
  function hasP(n,p){ return Math.floor(n/Math.pow(10,p))>0||p===0; }

  // Klättrar men sjunker aldrig (samma modell som övriga drillar).
  function adjustLvl(lvl,right,total){
    if(right>=total-1 && lvl<MAX_LVL) return {level:lvl+1,change:'up'};
    return {level:lvl,change:null};
  }

  function lvlName(l){
    return l===1 ? 'Två- och tresiffriga tal'
         : l===2 ? 'Hundratal och tusental'
         : 'Decimaltal';
  }

  function showSummary(){
    var right=omgangResults.filter(function(x){return x;}).length;
    var total=omgangResults.length;
    var adj=adjustLvl(level,right,total);
    level=adj.level;
    body.innerHTML='<div class="exercise-card">'
      +exerciseHeader('Metod · uppställning (subtraktion)','Du klarade '+right+' av '+total+' uppgifter.',level)
      +renderSummaryCard({right:right,total:total,level:level,levelChange:adj.change})
      +'</div>';
    document.getElementById('summary-next-btn').onclick=function(){
      omgangResults=[];borrows=new Set();laan=false;svarVal={};sistFokusPos=null;
      currentTask=genTask(level);render();
    };
  }

  function render(){
    if(!currentTask) currentTask=genTask(level);
    var task=currentTask;
    var cols=buildCols(task);
    var a=task.aInt,b=task.bInt,ans=task.ansInt,dec=task.dec;
    var aDisp=displayNum(a,dec), bDisp=displayNum(b,dec), ansDisp=displayNum(ans,dec);
    var done=omgangResults.length;

    // ── Rad: 10-annoteringar ──
    var tenRow='<div class="upp-i-op-cell"></div>';
    cols.forEach(function(col){
      if(col.type==='decimal'){
        tenRow+='<div class="upp-i-cell upp-dec-cell"></div>';
      } else {
        var hasTen=borrows.has(col.pos+1);
        tenRow+='<div class="upp-i-cell">'
          +(hasTen?'<div class="borrow-ten">10</div>':'')
        +'</div>';
      }
    });

    // ── Rad A ──
    var rowA='<div class="upp-i-op-cell"></div>';
    cols.forEach(function(col){
      if(col.type==='decimal'){
        rowA+='<div class="upp-i-cell upp-dec-cell"><span class="upp-dec-pt">.</span></div>';
      } else {
        var pos=col.pos;
        var d=hasP(a,pos)?dgt(a,pos):null;
        var struck=borrows.has(pos);
        var cc=(laan?' laan-target':'')+(struck?' is-struck':'');
        if(d===null){
          rowA+='<div class="upp-i-cell"><span class="upp-i-digit faint"></span></div>';
        } else {
          rowA+='<div class="upp-i-cell"><span class="upp-i-digit'+cc+'" data-bpos="'+pos+'">'
            +(struck?'<span class="struck-digit">'+d+'</span>':d)
          +'</span></div>';
        }
      }
    });

    // ── Rad B ──
    var rowB='<div class="upp-i-op-cell sub-sign">−</div>';
    cols.forEach(function(col){
      if(col.type==='decimal'){
        rowB+='<div class="upp-i-cell upp-dec-cell"><span class="upp-dec-pt">.</span></div>';
      } else {
        var pos=col.pos;
        var d=hasP(b,pos)?dgt(b,pos):null;
        rowB+='<div class="upp-i-cell"><span class="upp-i-digit'+(d===null?' faint':'')+'">'+
          (d!==null?d:'')+'</span></div>';
      }
    });

    // ── Svarsrad ──
    var rowAns='<div class="upp-i-op-cell"></div>';
    cols.forEach(function(col){
      if(col.type==='decimal'){
        rowAns+='<div class="upp-i-cell upp-dec-cell"><span class="upp-dec-pt ans-dec">.</span></div>';
      } else {
        rowAns+='<div class="upp-i-cell">'
          +'<input type="text" class="ans-input" data-pos="'+col.pos+'" inputmode="numeric" maxlength="1" value="'+(svarVal[col.pos]||'')+'">'
        +'</div>';
      }
    });

    body.innerHTML='<div class="exercise-card">'
      +exerciseHeader('Metod · uppställning (subtraktion)',lvlName(level)+' · Uppgift '+(done+1)+' av '+OMGANG,level)
      +'<div class="metod-explain-card">'

        +'<div class="upp-lan-row">'
          +'<button class="upp-lan-btn'+(laan?' is-active':'')+'" id="lan-btn">'
            +(laan?'✕ Avbryt':'↖ Lån')
          +'</button>'
          +'<span class="upp-lan-hint">'
            +(laan?'Klicka på siffran du lånar av':'Tryck och klicka sedan på siffran du lånar av')
          +'</span>'
          +(borrows.size>0?'<button class="upp-lan-clear" id="clear-borrows">Rensa lån</button>':'')
        +'</div>'

        +'<div class="uppstallning-practice">'
          +'<div class="uppstallning-interaktiv">'
            +'<div class="upp-i-row upp-ten-row">'+tenRow+'</div>'
            +'<div class="upp-i-row">'+rowA+'</div>'
            +'<div class="upp-i-row">'+rowB+'</div>'
            +'<div class="upp-i-line"></div>'
            +'<div class="upp-i-row answer-row">'+rowAns+'</div>'
          +'</div>'
        +'</div>'

      +'<div class="rakna-uppdela-feedback" id="fb"></div>'
      +keypadHTML([])
      +'<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        +'<button class="btn primary" id="check-btn">Kontrollera</button>'
        +'<button class="btn subtle" id="ny-btn">Ny uppgift</button>'
        +'<button class="btn subtle" id="back-btn">Tillbaka</button>'
      +'</div></div></div>';

    // Koppla knappar
    document.getElementById('lan-btn').onclick=function(){laan=!laan;render();};
    var cb=document.getElementById('clear-borrows');
    if(cb) cb.onclick=function(){borrows=new Set();laan=false;render();};
    document.getElementById('ny-btn').onclick=function(){
      borrows=new Set();laan=false;svarVal={};sistFokusPos=null;currentTask=genTask(level);render();
    };
    document.getElementById('back-btn').onclick=backFn;

    // Lån-klick på siffror
    document.querySelectorAll('[data-bpos]').forEach(function(el){
      el.addEventListener('click',function(){
        if(!laan) return;
        var pos=parseInt(el.dataset.bpos);
        if(borrows.has(pos)) borrows.delete(pos); else borrows.add(pos);
        laan=false; render();
      });
    });

    // Svars-inputs: focus höger→vänster (pos 0 = entalet = sist till höger = börja där)
    var ansInputs=Array.from(document.querySelectorAll('.ans-input'))
      .sort(function(x,y){return parseInt(x.dataset.pos)-parseInt(y.dataset.pos);});
    ansInputs.forEach(function(inp,i){
      inp.addEventListener('focus',function(){ sistFokusPos=parseInt(inp.dataset.pos); });
      inp.addEventListener('input',function(){
        inp.value = inp.value.replace(/[^0-9]/g,'');
        svarVal[parseInt(inp.dataset.pos)] = inp.value;                 // bevara svaret över re-render
        if(inp.value && i<ansInputs.length-1) ansInputs[i+1].focus();   // auto-hopp (keypad + tangentbord)
      });
      inp.addEventListener('keydown',function(e){
        if(e.key==='Enter'){e.preventDefault();
          if(i<ansInputs.length-1) ansInputs[i+1].focus(); else check();
        }
      });
    });
    // Behåll markören där eleven var (lån-knappen re-renderar) i stället för att hoppa till entalet
    setTimeout(function(){
      var mal = sistFokusPos!=null && ansInputs.filter(function(x){return parseInt(x.dataset.pos)===sistFokusPos;})[0];
      (mal || ansInputs[0]) && (mal || ansInputs[0]).focus();
    },50);
    bindKeypad(body.querySelector('.exercise-card'));
    document.getElementById('check-btn').onclick=check;

    function check(){
      var allRight=true;
      ansInputs.forEach(function(inp){
        var pos=parseInt(inp.dataset.pos);
        var expected=dgt(ans,pos);
        var val=inp.value===''?-1:parseInt(inp.value);
        var posExists=Math.floor(ans/Math.pow(10,pos))>0||pos===0;
        inp.disabled=true;
        inp.classList.remove('correct','wrong');
        if(!posExists&&(inp.value===''||val===0)){/*ok*/}
        else if(val===expected){inp.classList.add('correct');}
        else{inp.classList.add('wrong');allRight=false;}
      });
      var fb=document.getElementById('fb');
      fb.classList.add('show');
      document.getElementById('check-btn').disabled=true;
      var ts=getTutorScore('sub-metoder','metod');ts.total++;
      var tsGU=getTutorScore('sub-metoder','uppstallning');tsGU.total++;
      omgangResults.push(allRight);
      if(allRight){
        fb.classList.add('correct');
        fb.textContent='Rätt! '+aDisp+' − '+bDisp+' = '+ansDisp+' ✓';
        ts.correct++; tsGU.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent='Inte rätt. '+aDisp+' − '+bDisp+' = '+ansDisp+'. Räkna höger till vänster.';
      }
      setTimeout(function(){
        if(omgangResults.length>=OMGANG) showSummary();
        else{borrows=new Set();laan=false;svarVal={};sistFokusPos=null;currentTask=genTask(level);render();}
      },1900);
    }
  }

  render();
}


// --- SUB METOD: ÖKA OCH MINSKA LIKA ---
function renderOkaMinska(body, metod, backFn){
  let level = 1;
  let omgangResults = [];
  const OMGANG = 6;

  function newTask(){
    const ranges = [
      { aLo:30, aHi:99,  bLo:9,  bHi:49  },
      { aLo:100,aHi:399, bLo:19, bHi:199 },
      { aLo:200,aHi:999, bLo:49, bHi:499 }
    ];
    const r = ranges[Math.min(level-1, 2)];
    for(let i=0; i<300; i++){
      const a = r.aLo + Math.floor(Math.random()*(r.aHi-r.aLo+1));
      const b = r.bLo + Math.floor(Math.random()*(Math.min(r.bHi,a-5)-r.bLo+1));
      if(b >= a) continue;
      const bMod = b % 10;
      if(a - b < 8) continue;
      if(bMod >= 7 || (bMod >= 1 && bMod <= 3)) return {a, b, answer: a-b};
    }
    return [{a:62,b:29,answer:33},{a:156,b:79,answer:77},{a:534,b:298,answer:236}][Math.min(level-1,2)];
  }

  let task = newTask();
  let uppgNr = 0;   // tips bara på de två första uppgifterna

  function render(){
    uppgNr++;
    const {a, b, answer} = task;
    const lvlSub = level===1 ? 'Tvåsiffriga tal' : level===2 ? 'Tresiffriga tal' : 'Blandade tal';

    body.innerHTML =
      '<div class="exercise-card">'
      + exerciseHeader('Metod · öka och minska lika', lvlSub + ' · Uppgift '+(omgangResults.length+1)+' av '+OMGANG, level)
      + '<div class="metod-explain-card">'
        + (uppgNr<=2 ? '<div style="background:var(--bg-warm);padding:12px 14px;border-radius:var(--radius);margin-bottom:20px;font-size:13px;line-height:1.6;">'
          + 'Skriv ett mellanled på raden. Visa <strong>vad du gör</strong> genom att skriva t.ex. <strong>+1</strong> eller <strong>−2</strong> i rutan ovanför det första uttrycket.'
        + '</div>' : '')

        + '<div class="om-sub-card">'
          // CSS grid: 9 kolumner – annot spänner kol 1-3 (a, −, b)
          + '<div class="om-sub-grid" id="om-sub-grid">'

            // Rad 1: annot ovanför a−b, sedan tomt
            + '<div class="om-sub-annot-cell">'
              + '<input type="text" class="om-annot-input" id="om-annot" placeholder="+?" maxlength="4" autocomplete="off">'
            + '</div>'
            + '<div style="grid-column:4/10"></div>'

            // Rad 2: hela uttrycket
            + '<span class="om-sub-num">' + a + '</span>'
            + '<span class="om-sub-op">−</span>'
            + '<span class="om-sub-num">' + b + '</span>'
            + '<span class="om-sub-op om-sub-eq">=</span>'
            + '<input type="text" class="om-sub-input" id="om-new-a" inputmode="numeric" maxlength="6" placeholder="___">'
            + '<span class="om-sub-op">−</span>'
            + '<input type="text" class="om-sub-input" id="om-new-b" inputmode="numeric" maxlength="6" placeholder="___">'
            + '<span class="om-sub-op om-sub-eq">=</span>'
            + '<input type="text" class="om-sub-input om-sub-ans" id="om-final" inputmode="numeric" maxlength="6" placeholder="?">'

          + '</div>'
        + '</div>'

        + '<div class="rakna-uppdela-feedback" id="fb-om"></div>'
        + keypadHTML(['+','-'])
        + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="btn primary" id="om-check">Kontrollera</button>'
          + '<button class="btn subtle" id="om-ny">Ny uppgift</button>'
          + '<button class="btn subtle" id="om-back">Tillbaka</button>'
        + '</div>'
      + '</div></div>';

    const annotInp = document.getElementById('om-annot');
    const newAInp  = document.getElementById('om-new-a');
    const newBInp  = document.getElementById('om-new-b');
    const finalInp = document.getElementById('om-final');
    const allInps  = [annotInp, newAInp, newBInp, finalInp];

    allInps.forEach((inp, i) => {
      inp.addEventListener('keydown', e => {
        if(e.key === 'Enter') { e.preventDefault();
          if(i < allInps.length-1) allInps[i+1].focus(); else check();
        }
      });
    });
    setTimeout(() => annotInp.focus(), 50);
    bindKeypad(body.querySelector('.exercise-card'));

    document.getElementById('om-check').onclick = check;
    document.getElementById('om-ny').onclick    = () => { task=newTask(); render(); };
    document.getElementById('om-back').onclick  = backFn;

    function check(){
      const raw    = annotInp.value.trim();
      const aVal   = parseInt(newAInp.value);
      const bVal   = parseInt(newBInp.value);
      const finVal = parseInt(finalInp.value);

      const fb = document.getElementById('fb-om');
      fb.classList.remove('correct','wrong'); fb.classList.add('show');
      allInps.forEach(i => { i.classList.remove('correct','wrong'); i.disabled=true; });
      document.getElementById('om-check').disabled = true;

      const ts = getTutorScore('sub-metoder','metod'); ts.total++;
      const tsGOM = getTutorScore('sub-metoder','okaminska'); tsGOM.total++;

      // Parsa annotering: "+1", "-2", "1" etc.
      const delta    = parseInt(raw.replace('+',''));
      const deltaOK  = !isNaN(delta) && delta !== 0 && aVal===a+delta && bVal===b+delta;
      const midledOK = !isNaN(aVal) && !isNaN(bVal) && (aVal - bVal === answer);
      const finalOK  = !isNaN(finVal) && finVal === answer;

      if(midledOK && finalOK){
        allInps.forEach(i => i.classList.add('correct'));
        fb.classList.add('correct');
        fb.textContent = (deltaOK?'Rätt! ':'Rätt svar! ')
          + a + ' − ' + b + ' = ' + aVal + ' − ' + bVal + ' = ' + answer + ' ✓';
        ts.correct++; tsGOM.correct++;
        omgangResults.push(true);
      } else if(midledOK && !finalOK){
        newAInp.classList.add('correct'); newBInp.classList.add('correct');
        finalInp.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Mellanledet stämmer! Men ' + aVal + ' − ' + bVal + ' = ' + answer + ', inte ' + finVal + '.';
        omgangResults.push(false);
      } else {
        [newAInp,newBInp,finalInp].forEach(i => i.classList.add('wrong'));
        const bMod = b % 10;
        const hint = bMod >= 7
          ? 'Lägg till '+(10-bMod)+' på båda: '+(a+(10-bMod))+' − '+(b+(10-bMod))
          : 'Ta bort '+bMod+' från båda: '+(a-bMod)+' − '+(b-bMod);
        fb.classList.add('wrong');
        fb.textContent = 'Mellanledet stämmer inte. Tips: ' + hint + ' = ' + answer + '.';
        omgangResults.push(false);
      }

      setTimeout(() => {
        if(omgangResults.length >= OMGANG) showSummary();
        else { task=newTask(); render(); }
      }, omgangResults[omgangResults.length-1] ? 2000 : 2700);
    }
  }

  function showSummary(){
    const right = omgangResults.filter(x=>x).length;
    const total = omgangResults.length;
    const adj   = adjustLevel(level, right, total);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · öka och minska lika','Du klarade '+right+' av '+total+'.',level)
      + renderSummaryCard({right, total, level, levelChange:adj.change})
      + '</div>';
    document.getElementById('summary-next-btn').onclick = () => {
      omgangResults=[]; task=newTask(); render();
    };
  }

  render();
}

// --- SUB METOD: ADDITION BAKIFRÅN ---
function renderAdditionBakifran(body, metod, backFn){
  let level = 1;                 // 1: tvåsiffrigt · 2: hundra/tusental · 3: decimaltal
  let omgangResults = [];
  let uppgNr = 0;                // totalt i sessionen – Idén-rutan visas bara de 2 första
  const OMGANG = 5;
  function rnd(lo,hi){ return lo + Math.floor(Math.random()*(hi-lo+1)); }
  function fmt(n){ return String(n).replace('.', ','); }
  function lvlNamn(l){ return l===1 ? 'Tvåsiffriga tal' : l===2 ? 'Hundratal och tusental' : 'Decimaltal'; }

  // b måste ha ett ental/tiondel att kliva från (b%10≠0) och det ska finnas rum för två steg.
  function newTask(lvl){
    const dec = lvl===3 ? 1 : 0, scale = dec===1 ? 10 : 1;
    for(let i=0;i<400;i++){
      let aS, bS;
      if(lvl===1){ aS = rnd(23,99);    bS = rnd(11, aS-6); }
      else if(lvl===2){ aS = rnd(220,9989); bS = rnd(101, aS-31); }
      else { aS = rnd(41,400); bS = rnd(13, aS-6); }        // i tiondelar → 4,1–40,0
      if(bS % 10 === 0) continue;
      const nextS = Math.ceil(bS/10)*10;
      if(nextS >= aS) continue;
      if(aS - bS < (lvl===2 ? 40 : 5)) continue;
      return { a:aS/scale, b:bS/scale, answer:(aS-bS)/scale, dec:dec,
               nextTio:nextS/scale, steg1:(nextS-bS)/scale, steg2:(aS-nextS)/scale };
    }
    return dec===1 ? { a:8.3,b:2.6,answer:5.7,dec:1,nextTio:3,steg1:0.4,steg2:5.3 }
                   : { a:43,b:17,answer:26,dec:0,nextTio:20,steg1:3,steg2:23 };
  }
  let task = newTask(level);

  function showSummary(){
    const right = omgangResults.filter(x=>x).length, total = omgangResults.length;
    const adj = adjustLevel(level, right, total); level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · addition bakifrån', 'Du klarade '+right+' av '+total+'.', level)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '</div>';
    document.getElementById('summary-next-btn').onclick = ()=>{ omgangResults=[]; task=newTask(level); render(); };
  }

  function render(){
    uppgNr++;
    const {a, b, answer, nextTio, steg1, steg2} = task;
    const useTwoSteps = steg2 > 0;
    const visaIde = uppgNr <= 2;                                   // Idén-rutan bara på de 2 första
    const posPct = Math.max(6, Math.min(94, (steg1/answer)*100));

    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Metod · addition bakifrån', lvlNamn(level)+' · Uppgift '+(omgangResults.length+1)+' av '+OMGANG, level)}
        <div class="metod-explain-card">
          ${visaIde ? `<div style="background:var(--bg-warm);padding:14px;border-radius:var(--radius);margin-bottom:16px;font-size:13px;">
            <strong>Idén:</strong> Istället för att subtrahera räknar vi hur mycket vi måste lägga till för att komma från <strong>${fmt(b)}</strong> till <strong>${fmt(a)}</strong>.
            Resultatet (differensen) är summan av stegen.
          </div>` : ''}

          <p style="font-size:15px;margin:0 0 18px;">Beräkna <strong style="font-family:var(--mono);font-size:18px;">${fmt(a)} − ${fmt(b)}</strong>.</p>

          <div class="abakifran-grid">
            <div class="abakifran-tallinje">
              <div class="ab-punkt" style="left:0%">
                <div class="ab-label">${fmt(b)}</div>
                <div class="ab-dot"></div>
              </div>
              <div class="ab-punkt" style="left:${posPct}%">
                <div class="ab-label">${fmt(nextTio)}</div>
                <div class="ab-dot"></div>
              </div>
              <div class="ab-punkt" style="left:100%">
                <div class="ab-label">${fmt(a)}</div>
                <div class="ab-dot"></div>
              </div>
              <div class="ab-linje"></div>
            </div>

            <div class="om-uttryck-rad" style="margin-top:8px;justify-content:center;">
              <span class="om-u-num">${fmt(a)}</span>
              <span class="om-u-op">−</span>
              <span class="om-u-num">${fmt(b)}</span>
              <span class="om-u-op">=</span>
              <input type="text" class="om-u-input" id="ab-s1" inputmode="decimal" maxlength="6" data-ans="${steg1}" placeholder="___">
              ${useTwoSteps ? `<span class="om-u-op">+</span>
              <input type="text" class="om-u-input" id="ab-s2" inputmode="decimal" maxlength="6" data-ans="${steg2}" placeholder="___">` : ''}
              <span class="om-u-op">=</span>
              <input type="text" class="om-u-input om-u-input-sum" id="ab-sum" inputmode="decimal" maxlength="7" data-ans="${answer}" placeholder="?">
            </div>
          </div>

          ${visaIde ? `<p style="font-size:12px;color:var(--ink-soft);text-align:center;margin:10px 0 0;">Mellanledet visar stegen: från ${fmt(b)} upp till ${fmt(nextTio)}${useTwoSteps?` och vidare till ${fmt(a)}`:''}.</p>` : ''}

          <div class="rakna-uppdela-feedback" id="fb-ab"></div>
          ${keypadHTML([])}
          <div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button class="btn primary" id="ab-check">Kontrollera</button>
            <button class="btn subtle" id="ab-ny">Ny uppgift</button>
            <button class="btn subtle" id="ab-back">Tillbaka</button>
          </div>
        </div>
      </div>
    `;

    const allInputs = [
      document.getElementById('ab-s1'),
      useTwoSteps ? document.getElementById('ab-s2') : null,
      document.getElementById('ab-sum')
    ].filter(Boolean);

    const parse = v => parseFloat(String(v).replace(',','.'));
    const check = ()=>{
      let allRight = true;
      allInputs.forEach(inp=>{
        inp.disabled = true;
        const correct = Math.abs(parse(inp.value) - parseFloat(inp.dataset.ans)) < 1e-9;
        inp.classList.add(correct?'correct':'wrong');
        if(!correct) allRight = false;
      });
      const fb = document.getElementById('fb-ab'); fb.classList.add('show');
      const ts = getTutorScore('sub-metoder','metod'); ts.total++;
      const tsGB = getTutorScore('sub-metoder','bakifran'); tsGB.total++;
      omgangResults.push(allRight);
      if(allRight){
        fb.classList.add('correct');
        fb.textContent = `Rätt! ${fmt(b)} + ${fmt(steg1)}${useTwoSteps?' + '+fmt(steg2):''} = ${fmt(a)}, alltså ${fmt(a)} − ${fmt(b)} = ${fmt(answer)}`;
        ts.correct++; tsGB.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = `${fmt(b)} + ${fmt(steg1)} = ${fmt(nextTio)}${useTwoSteps?', ' + fmt(nextTio) + ' + ' + fmt(steg2) + ' = ' + fmt(a) : ''}. Differensen är ${fmt(answer)}.`;
      }
      setTimeout(()=>{
        if(omgangResults.length >= OMGANG) showSummary();
        else { task=newTask(level); render(); }
      }, allRight ? 2000 : 2800);
    };
    document.getElementById('ab-check').onclick = check;
    document.getElementById('ab-ny').onclick = ()=>{ task=newTask(level); render(); };
    document.getElementById('ab-back').onclick = backFn;
    allInputs.forEach((inp,i)=>{
      inp.addEventListener('keydown', e=>{
        if(e.key==='Enter'){ e.preventDefault();
          if(i<allInputs.length-1) allInputs[i+1].focus(); else check();
        }
      });
    });
    setTimeout(()=>allInputs[0].focus(), 50);
    bindKeypad(body.querySelector('.exercise-card'));
  }
  render();
}

// ============================================================
// RÄKNETRÄNING ADD/SUB (blandat, adaptiv)
// ============================================================
function renderRaknetraningAS(body){
  let level = 1;
  let omgang = [];
  let idx = 0;
  let omgangResults = [];

  function genOmgang(){
    const seen = new Set();
    const items = [];
    let attempts = 0;
    while(items.length < 10 && attempts < 300){
      attempts++;
      const useAdd = Math.random() < 0.5;
      const task = useAdd ? genAddTask(level) : genSubTask(level);
      const key = `${task.a}${task.op}${task.b}`;
      if(!seen.has(key)){ seen.add(key); items.push(task); }
    }
    return items;
  }

  function render(){
    if(idx >= omgang.length){
      const right = omgangResults.filter(x=>x).length;
      const total = omgangResults.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;
      body.innerHTML = `<div class="exercise-card">${exerciseHeader('Räkneträning · add & sub', `Du klarade ${right} av ${total}.`, level)}${renderSummaryCard({right, total, level, levelChange: adj.change})}</div>`;
      document.getElementById('summary-next-btn').onclick = ()=>{ omgang=genOmgang(); idx=0; omgangResults=[]; render(); };
      return;
    }
    const task = omgang[idx];
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Räkneträning · addition och subtraktion', 'Välj valfri metod.', level)}
        ${renderScoreBarSimple(omgangResults.filter(x=>x).length, omgangResults.filter(x=>!x).length, omgang.length, idx)}
        <div class="rakna-uppdela-task">
          <div class="rakna-uppdela-line" style="font-size:28px;gap:14px;padding:24px;">
            <span class="rakna-uppdela-target">${task.a}</span>
            <span style="color:var(--ink-soft);font-weight:600;">${task.op}</span>
            <span class="rakna-uppdela-target">${task.b}</span>
            <span style="color:var(--ink-soft);">=</span>
            <input type="text" class="rakna-factor-input" id="main-input" inputmode="numeric" maxlength="6" style="width:90px;">
          </div>
          <div class="rakna-uppdela-feedback" id="fb"></div>
          <div style="margin-top:14px;text-align:center;"><button class="btn primary" id="check-btn">Kontrollera</button></div>
        </div>
      </div>
    `;
    const inp = document.getElementById('main-input');
    const check = ()=>{
      const val = parseInt(inp.value.trim());
      const fb = document.getElementById('fb'); fb.classList.add('show');
      inp.disabled = true; document.getElementById('check-btn').disabled = true;
      const ts = getTutorScore('raknetraning-as','rakna'); ts.total++;
      if(val === task.answer){
        inp.classList.add('correct'); fb.classList.add('correct'); fb.textContent = `Rätt! ${task.a} ${task.op} ${task.b} = ${task.answer}`;
        ts.correct++; omgangResults.push(true);
      } else {
        inp.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent = `${task.a} ${task.op} ${task.b} = ${task.answer}`;
        omgangResults.push(false);
      }
      setTimeout(()=>{ idx++; render(); }, 1600);
    };
    document.getElementById('check-btn').onclick = check;
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){e.preventDefault();check();} });
    setTimeout(()=>inp.focus(), 50);
  }
  omgang = genOmgang();
  render();
}


// ============================================================
// DEL 3 – ÖVNINGAR: BEGREPP FÖR MULTIPLIKATION
// ============================================================

