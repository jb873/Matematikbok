/* ============================================================
   FAMILJ B · MOTOR: renderPrimtalBegrepp (primtal — begrepp (primtal/sammansatt-flashcards))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderPrimtalBegrepp(body){
  let level = 1; // 1=easy(≤30), 2=med(≤50), 3=hard(≤100)
  let streak = 0;
  let omgang = []; // current set
  let idx = 0;
  let omgangResults = []; // for adaptive feedback

  function generateOmgang(){
    const max = level===1?30 : level===2?50 : 100;
    const primesPool = (level===1?PRIMES_50.filter(p=>p<=30):level===2?PRIMES_50:PRIMES_100);
    const compPool = compositesUpTo(max);
    const items = [];
    const seen = new Set();
    let attempts = 0;
    while(items.length < 8 && attempts < 200){
      const isPrim = Math.random()<0.5;
      const num = isPrim ? randPick(primesPool) : randPick(compPool);
      if(!seen.has(num)){
        seen.add(num);
        items.push({num, ans: isPrim?'primtal':'sammansatt'});
      }
      attempts++;
    }
    return items;
  }

  function makeExplanation(num, isPrim){
    if(isPrim) return `${num} är ett primtal – delbart bara med 1 och ${num}`;
    const factors = primeFactorize(num);
    return `${num} = ${factors.join(' · ')}`;
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
        <div class="fc-scorebar-right">
          ${streak >= 3 ? `<span class="fire">🔥</span>${streak} i rad` : ''}
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
          ${exerciseHeader('Begrepp · primtal eller sammansatt?', `Du klarade ${right} av ${total} frågor.`, level)}
          ${renderSummaryCard({right, total, level, levelChange: adj.change})}
        </div>
      `;
      document.getElementById('summary-next-btn').onclick = ()=>{
        omgang = generateOmgang();
        idx = 0;
        omgangResults = [];
        streak = 0;
        render();
      };
      return;
    }

    const card = omgang[idx];
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Begrepp · primtal eller sammansatt?', 'Avgör om talet är ett primtal eller ett sammansatt tal.', level)}
        ${renderScoreBar()}
        <div class="flashcard">
          <div class="flashcard-prompt">Är talet ett primtal eller sammansatt?</div>
          <div class="flashcard-number">${card.num}</div>
          <div class="flashcard-explanation" id="fc-exp"></div>
          <div class="flashcard-actions" id="fc-actions">
            <button class="fc-btn" data-ans="primtal">Primtal</button>
            <button class="fc-btn" data-ans="sammansatt">Sammansatt</button>
          </div>
          <div class="fc-progress">Fråga ${idx+1} av ${omgang.length}</div>
        </div>
      </div>
    `;
    document.querySelectorAll('#fc-actions .fc-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const correct = btn.dataset.ans === card.ans;
        const ts = getTutorScore('primtal','begrepp');
        ts.total++;
        if(correct){ ts.correct++; streak++; btn.classList.add('correct'); }
        else{
          streak = 0;
          btn.classList.add('wrong');
          document.querySelector(`#fc-actions [data-ans="${card.ans}"]`).classList.add('correct');
        }
        omgangResults.push(correct);
        document.getElementById('fc-exp').textContent = makeExplanation(card.num, card.ans==='primtal');
        document.querySelectorAll('#fc-actions .fc-btn').forEach(b=>b.disabled=true);
        setTimeout(()=>{ idx++; render(); }, 1500);
      });
    });
  }

  omgang = generateOmgang();
  render();
}
