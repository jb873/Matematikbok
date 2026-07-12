/* ============================================================
   FAMILJ B · MOTOR: renderPrimtalProblem (primtal — problem (gåtor + PROBLEM_BANK))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

const PROBLEM_BANK = [
  {clues:['Jag är ett tvåsiffrigt jämnt tal.','Min siffersumma är 7.','Jag är en produkt av två olika primtal.'], answer:34, exp:'34 är jämnt och tvåsiffrigt. Siffersumman 3+4=7. Och 34 = 2·17, två olika primtal.'},
  {clues:['Jag är ett primtal mellan 20 och 40.','Min entalssiffra är udda.','Min siffersumma är 5.'], answer:23, exp:'23 är primtal, mellan 20 och 40, entalssiffran 3 är udda, siffersumman 2+3=5.'},
  {clues:['När jag delas upp i primfaktorer får jag tre lika faktorer.','Jag är mindre än 100.','Primtalsfaktorn är mindre än 5.'], answer:27, exp:'27 = 3·3·3, tre lika primfaktorer och primfaktorn 3 är mindre än 5.'},
  {clues:['Jag är ett tresiffrigt tal.','Jag är delbar med både 2, 3 och 5.','Jag är så litet som möjligt.'], answer:120, exp:'Minsta talet delbart med 2, 3 och 5 är 30. Minsta tresiffriga som är delbart är 120.'},
  {clues:['Jag är ett primtal.','Jag är större än 50 men mindre än 60.','Min entalssiffra är 3.'], answer:53, exp:'53 är ett primtal mellan 50 och 60 med entalssiffra 3.'},
  {clues:['Jag är ett tvåsiffrigt tal.','Min siffersumma är 9.','Jag är ett primtal.'], answer:null, exp:null,
   noteAfter:'Det här är en fälla! Alla tvåsiffriga tal med siffersumma 9 (18, 27, 36, 45, 54, 63, 72, 81, 90) är delbara med 3 – alltså sammansatta. Det finns INGET sådant primtal.', isImpossible:true}
];

function renderPrimtalProblem(body){
  let currentSet = shuffle(PROBLEM_BANK).slice(0,3);
  let answeredCount = 0;
  let rightCount = 0;

  function render(){
    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Problemlösning · vilket tal är jag?', 'Använd ledtrådarna för att hitta talet.', null)}
        ${currentSet.map((p,i)=>`
          <div class="prob-task" data-i="${i}">
            <div class="prob-text">Gåta ${i+1} av ${currentSet.length}: Vilket tal är jag?</div>
            <ul class="prob-clues">
              ${p.clues.map(c=>`<li>${c}</li>`).join('')}
            </ul>
            <div class="prob-input-row">
              <input type="text" class="prob-input" inputmode="numeric" maxlength="4" data-input="${i}" placeholder="${p.isImpossible?'ev. inget?':'?'}">
              <button class="btn primary" data-check="${i}">Kontrollera</button>
              ${p.isImpossible?`<button class="btn" data-impossible="${i}">Det finns inget sånt tal</button>`:''}
            </div>
            <div class="prob-feedback" id="prob-fb-${i}"></div>
          </div>
        `).join('')}
        <div id="prob-summary-anchor"></div>
      </div>
    `;
    document.querySelectorAll('[data-check]').forEach(b=>{
      b.addEventListener('click', ()=>{
        const i = parseInt(b.dataset.check);
        check(i, false);
      });
    });
    document.querySelectorAll('[data-impossible]').forEach(b=>{
      b.addEventListener('click', ()=>{
        const i = parseInt(b.dataset.impossible);
        check(i, true);
      });
    });
  }

  function check(i, claimedImpossible){
    const p = currentSet[i];
    const inp = document.querySelector(`[data-input="${i}"]`);
    const fb = document.getElementById(`prob-fb-${i}`);
    if(inp.disabled) return; // already answered

    fb.classList.remove('correct','wrong');
    fb.classList.add('show');
    inp.classList.remove('correct','wrong');
    const ts = getTutorScore('primtal','problem');
    ts.total++;

    let wasRight = false;

    if(p.isImpossible){
      if(claimedImpossible){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + p.noteAfter;
        ts.correct++;
        wasRight = true;
      } else {
        const val = parseInt(inp.value);
        if(val){
          inp.classList.add('wrong');
          fb.classList.add('wrong');
          fb.textContent = 'Inget tvåsiffrigt primtal har siffersumma 9. Tryck på "Det finns inget sånt tal".';
        } else {
          fb.classList.add('wrong');
          fb.textContent = 'Skriv ett tal, eller tryck på "Det finns inget sånt tal" om du tror det.';
        }
      }
    } else {
      const val = parseInt(inp.value);
      if(val === p.answer){
        inp.classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + p.exp;
        ts.correct++;
        wasRight = true;
      } else {
        inp.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Inte riktigt. Gå igenom ledtrådarna en gång till – vilket tal uppfyller alla?';
      }
    }

    // Disable this task
    inp.disabled = true;
    document.querySelector(`[data-check="${i}"]`).disabled = true;
    const imp = document.querySelector(`[data-impossible="${i}"]`);
    if(imp) imp.disabled = true;

    if(wasRight) rightCount++;
    answeredCount++;

    if(answeredCount >= currentSet.length){
      // Show summary
      setTimeout(()=> showSummary(), 600);
    }
  }

  function showSummary(){
    const right = rightCount;
    const total = currentSet.length;
    const anchor = document.getElementById('prob-summary-anchor');
    if(!anchor) return;
    anchor.innerHTML = `
      <div style="margin-top:20px;">
        ${renderSummaryCard({right, total, nextLabel:'Nya gåtor'})}
      </div>
    `;
    document.getElementById('summary-next-btn').onclick = ()=>{
      currentSet = shuffle(PROBLEM_BANK).slice(0,3);
      answeredCount = 0;
      rightCount = 0;
      render();
    };
    anchor.scrollIntoView({behavior:'smooth', block:'start'});
  }

  render();
}
