/* ============================================================
   FAMILJ B · MOTOR: renderPrimtalKomm (primtal — kommunikation (fyll i faktorer))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderPrimtalKomm(body){
  let level = 1;
  let target = null;
  let numFactorBoxes = 4;
  let omgangResults = [];
  let currentAnswered = false;
  let currentWasCorrect = false;
  const OMGANG_SIZE = 5;

  function pickTarget(){
    const lvl = level;
    const pool = [];
    for(let n=8;n<=200;n++){
      const len = primeFactorize(n).length;
      if(lvl===1 && len>=2 && len<=3 && n<=50) pool.push(n);
      else if(lvl===2 && len>=3 && len<=4 && n<=100) pool.push(n);
      else if(lvl===3 && len>=4 && n<=200) pool.push(n);
    }
    return randPick(pool);
  }

  function start(){
    target = pickTarget();
    const factors = primeFactorize(target);
    numFactorBoxes = Math.max(3, factors.length);
    currentAnswered = false;
    currentWasCorrect = false;
    render();
  }

  function checkAnswer(){
    const inputs = document.querySelectorAll('.komm-factor-input');
    const values = [];
    inputs.forEach(i=>{
      const v = i.value.trim();
      if(v) values.push({val: parseInt(v), input: i});
    });

    inputs.forEach(i=>i.classList.remove('correct','wrong'));

    if(values.length===0){
      showKommFeedback('wrong','Fyll i faktorerna i rutorna.');
      return;
    }

    const factors = values.map(v=>v.val);
    if(factors.some(f=>isNaN(f) || f<2)){
      showKommFeedback('wrong','Alla faktorer ska vara heltal större än 1.');
      values.forEach(v=>{if(isNaN(v.val)||v.val<2) v.input.classList.add('wrong')});
      currentAnswered = true;
      currentWasCorrect = false;
      return;
    }

    const product = factors.reduce((a,b)=>a*b,1);
    if(product !== target){
      showKommFeedback('wrong',`Produkten av dina faktorer är ${product}, men det skulle vara ${target}.`);
      values.forEach(v=>v.input.classList.add('wrong'));
      currentAnswered = true;
      currentWasCorrect = false;
      return;
    }

    const nonprimes = values.filter(v=>!isPrime(v.val));
    if(nonprimes.length>0){
      showKommFeedback('partial', `Produkten stämmer, men ${nonprimes.map(v=>v.val).join(', ')} är inte primtal. Dela upp ${nonprimes.length===1?'det talet':'dem'} vidare.`);
      nonprimes.forEach(v=>v.input.classList.add('wrong'));
      values.filter(v=>isPrime(v.val)).forEach(v=>v.input.classList.add('correct'));
      const ts = getTutorScore('primtal','kommunikation');
      ts.total++;
      ts.correct += 0.5;
      currentAnswered = true;
      currentWasCorrect = false;
      return;
    }

    // All correct
    const sorted = sortAsc(factors);
    showKommFeedback('correct', `Helt rätt! ${target} = ${sorted.join(' · ')}`);
    values.forEach(v=>v.input.classList.add('correct'));
    const ts = getTutorScore('primtal','kommunikation');
    ts.total++; ts.correct++;
    currentAnswered = true;
    currentWasCorrect = true;

    document.getElementById('komm-next-btn').style.display='inline-flex';
  }

  function showKommFeedback(type, msg){
    const fb = document.getElementById('komm-fb');
    fb.classList.remove('correct','wrong','partial');
    fb.classList.add('show', type);
    fb.textContent = msg;
  }

  function addFactorBox(){
    numFactorBoxes++;
    render(true);
  }
  function removeFactorBox(){
    if(numFactorBoxes>2){ numFactorBoxes--; render(true); }
  }

  function nextOrSummary(){
    omgangResults.push(currentWasCorrect);
    if(omgangResults.length >= OMGANG_SIZE){
      showOmgangSummary();
    } else {
      if(level<3 && Math.random()<0.5) level++;
      start();
    }
  }

  function showOmgangSummary(){
    const right = omgangResults.filter(x=>x).length;
    const total = omgangResults.length;
    const adj = adjustLevel(level, right, total);
    level = adj.level;
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Kommunikation · faktorisering', `Du klarade ${right} av ${total} uppgifter.`, level)}
        ${renderSummaryCard({right, total, level, levelChange: adj.change})}
      </div>
    `;
    document.getElementById('summary-next-btn').onclick = ()=>{
      omgangResults = [];
      start();
    };
  }

  function render(preserveValues=false){
    const oldValues = preserveValues ? Array.from(document.querySelectorAll('.komm-factor-input')).map(i=>i.value) : [];

    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Kommunikation · skriv hela faktoriseringen', `Uppgift ${omgangResults.length + 1} av ${OMGANG_SIZE} · alla faktorer ska vara primtal.`, level)}
        <div class="komm-task">
          <div class="komm-question">Primtalsfaktorisera talet <span class="target">${target}</span>.</div>
          <div class="komm-instructions">Skriv en faktor i varje ruta. Lägg till fler rutor om du behöver, eller ta bort.</div>

          <div class="komm-input-line" id="komm-line">
            <span class="komm-target-label">${target}</span>
            <span class="komm-equals">=</span>
            ${Array.from({length:numFactorBoxes}).map((_,i)=>`
              ${i>0?'<span class="komm-dot">·</span>':''}
              <input type="text" class="komm-factor-input" inputmode="numeric" maxlength="3" value="${oldValues[i]||''}">
            `).join('')}
            <button class="komm-remove-btn" id="komm-remove" ${numFactorBoxes<=2?'disabled':''}>−</button>
            <button class="komm-add-btn" id="komm-add">+ ruta</button>
          </div>

          <div class="komm-feedback" id="komm-fb"></div>
          <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn primary" id="komm-check">Kontrollera</button>
            <button class="btn" id="komm-next-btn" style="display:none;">${omgangResults.length + 1 >= OMGANG_SIZE ? 'Se resultat' : 'Nästa uppgift'}</button>
            <button class="btn subtle" onclick="navTo('ko',{koId:'primtal'})">Tillbaka</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('komm-check').onclick = checkAnswer;
    document.getElementById('komm-add').onclick = addFactorBox;
    document.getElementById('komm-remove').onclick = removeFactorBox;
    document.getElementById('komm-next-btn').onclick = nextOrSummary;

    document.querySelectorAll('.komm-factor-input').forEach((inp,i)=>{
      inp.addEventListener('keydown', e=>{
        if(e.key==='Enter'){
          e.preventDefault();
          const inputs = document.querySelectorAll('.komm-factor-input');
          if(i < inputs.length-1) inputs[i+1].focus();
          else checkAnswer();
        }
      });
    });

    setTimeout(()=>{
      const first = document.querySelector('.komm-factor-input:not([value]), .komm-factor-input[value=""]');
      if(first) first.focus();
    }, 100);
  }

  start();
}
