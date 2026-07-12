/* ============================================================
   FAMILJ B · MOTOR: renderPrimtalRakna (primtal — räkna (dela upp i termer/faktorer))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderPrimtalRakna(body){
  let level = 1; // 1: 2 stycken, små tal | 2: 3 stycken | 3: 4 stycken
  let omgang = [];
  let idx = 0;
  let omgangResults = [];

  function pickTask(){
    // Slumpa: termer eller faktorer
    const isTermer = Math.random() < 0.5;
    // Antal: beror på nivå (men slumpa lite)
    let antal;
    if(level === 1) antal = randPick([2, 2, 3]); // mest 2
    else if(level === 2) antal = randPick([2, 3, 3, 4]); // mest 3
    else antal = randPick([3, 4, 4]); // mest 4

    // Hitta lämpligt mål-tal
    let target;
    if(isTermer){
      // För termer behöver target >= antal (för att alla termer ska kunna vara minst 1)
      const min = level===1 ? Math.max(antal, 10) : level===2 ? 20 : 30;
      const max = level===1 ? 30 : level===2 ? 60 : 100;
      target = min + Math.floor(Math.random() * (max - min + 1));
    } else {
      // För faktorer >1 behöver target ha minst `antal` primfaktorer (med multiplicitet)
      const pool = [];
      const min = level===1 ? 6 : level===2 ? 12 : 24;
      const max = level===1 ? 40 : level===2 ? 80 : 200;
      for(let n=min; n<=max; n++){
        if(primeFactorize(n).length >= antal) pool.push(n);
      }
      target = randPick(pool);
    }

    return {type: isTermer ? 'termer' : 'faktorer', antal, target};
  }

  function generateOmgang(){
    const items = [];
    const seenKeys = new Set();
    let attempts = 0;
    while(items.length < 8 && attempts < 200){
      const task = pickTask();
      const key = `${task.target}-${task.antal}-${task.type}`;
      if(!seenKeys.has(key)){
        seenKeys.add(key);
        items.push(task);
      }
      attempts++;
    }
    return items;
  }

  function validate(task, values){
    // values is an array of numbers
    if(values.length !== task.antal) return {ok:false, msg:`Fyll i alla ${task.antal} rutor.`};
    if(values.some(v => isNaN(v))) return {ok:false, msg:'Skriv heltal i alla rutor.'};

    if(task.type === 'termer'){
      if(values.some(v => v < 1)) return {ok:false, msg:'Termerna måste vara minst 1.'};
      const sum = values.reduce((a,b)=>a+b, 0);
      if(sum !== task.target) return {ok:false, msg:`Summan blir ${sum}, men det skulle vara ${task.target}.`};
      return {ok:true};
    } else {
      if(values.some(v => v < 2)) return {ok:false, msg:'Faktorerna måste vara minst 2.'};
      const product = values.reduce((a,b)=>a*b, 1);
      if(product !== task.target) return {ok:false, msg:`Produkten blir ${product}, men det skulle vara ${task.target}.`};
      return {ok:true};
    }
  }

  function renderScoreBar(){
    const right = omgangResults.filter(x=>x).length;
    const wrong = omgangResults.filter(x=>!x).length;
    const total = omgang.length;
    return `
      <div class="fc-scorebar">
        <div class="fc-scorebar-left">
          <div class="fc-score-item right">
            <span class="check">✓</span>
            <span class="fc-score-num">${right}</span>
            <span>rätt</span>
          </div>
          <div class="fc-score-item wrong">
            <span class="check">✗</span>
            <span class="fc-score-num">${wrong}</span>
            <span>fel</span>
          </div>
          <div class="fc-score-item total">
            <span class="fc-score-num" style="color:var(--ink-faint);">${idx}/${total}</span>
          </div>
        </div>
      </div>
    `;
  }

  function render(){
    if(idx >= omgang.length){
      const right = omgangResults.filter(x=>x).length;
      const total = omgangResults.length;
      const adj = adjustLevel(level, right, total);
      level = adj.level;

      body.innerHTML = `
        <div class="exercise-card">
          ${exerciseHeader('Räkna · dela upp i termer eller faktorer', `Du klarade ${right} av ${total} uppgifter.`, level)}
          ${renderSummaryCard({right, total, level, levelChange: adj.change})}
        </div>
      `;
      document.getElementById('summary-next-btn').onclick = ()=>{
        omgang = generateOmgang();
        idx = 0;
        omgangResults = [];
        render();
      };
      return;
    }

    const task = omgang[idx];
    const operator = task.type === 'termer' ? '+' : '·';
    const verb = task.type === 'termer' ? 'termer' : 'faktorer';
    const intro = task.type === 'termer'
      ? `Dela upp ${task.target} i ${task.antal} termer. Skriv heltal som summeras till ${task.target}.`
      : `Dela upp ${task.target} i ${task.antal} faktorer. Alla faktorer ska vara minst 2.`;

    const inputs = Array.from({length: task.antal}).map((_,i)=>`
      ${i>0 ? `<span style="font-family:var(--mono);font-size:22px;color:var(--c-rakna);font-weight:600;">${operator}</span>` : ''}
      <input type="text" class="rakna-factor-input" data-i="${i}" inputmode="numeric" maxlength="3">
    `).join('');

    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Räkna · dela upp i termer eller faktorer', 'Dela upp talet på ett giltigt sätt.', level)}
        ${renderScoreBar()}
        <div class="rakna-uppdela-task">
          <div class="rakna-uppdela-prompt">${intro}</div>
          <div class="rakna-uppdela-line">
            <span class="rakna-uppdela-target">${task.target}</span>
            <span class="rakna-uppdela-equals">=</span>
            ${inputs}
          </div>
          <div class="rakna-uppdela-feedback" id="rakna-fb"></div>
          <div style="margin-top:16px;text-align:center;">
            <button class="btn primary" id="rakna-check">Kontrollera</button>
          </div>
        </div>
      </div>
    `;

    const inputEls = document.querySelectorAll('.rakna-factor-input');
    inputEls.forEach((inp,i)=>{
      inp.addEventListener('keydown', e=>{
        if(e.key === 'Enter'){
          e.preventDefault();
          if(i < inputEls.length - 1) inputEls[i+1].focus();
          else check();
        }
      });
    });
    setTimeout(()=> inputEls[0].focus(), 50);

    function check(){
      const values = Array.from(inputEls).map(inp => parseInt(inp.value.trim()));
      const result = validate(task, values);
      const fb = document.getElementById('rakna-fb');

      inputEls.forEach(i => i.classList.remove('correct','wrong'));
      fb.classList.remove('correct','wrong');
      fb.classList.add('show');

      const ts = getTutorScore('primtal','rakna');
      ts.total++;

      if(result.ok){
        inputEls.forEach(i => i.classList.add('correct'));
        fb.classList.add('correct');
        const sorted = [...values].sort((a,b)=>a-b);
        fb.textContent = `Rätt! ${task.target} = ${sorted.join(' ' + operator + ' ')}`;
        ts.correct++;
        omgangResults.push(true);
      } else {
        inputEls.forEach(i => i.classList.add('wrong'));
        fb.classList.add('wrong');
        fb.textContent = result.msg;
        omgangResults.push(false);
      }

      inputEls.forEach(i => i.disabled = true);
      document.getElementById('rakna-check').disabled = true;
      setTimeout(()=>{ idx++; render(); }, 1800);
    }

    document.getElementById('rakna-check').onclick = check;
  }

  omgang = generateOmgang();
  render();
}
