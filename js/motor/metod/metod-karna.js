/* ============================================================
   FAMILJ B · METOD-KÄRNA (delade beroenden)
   Utbrutet BYTE-IDENTISKT ur ak7-k1-ram.html, UTOM renderSummaryCard
   som parametriserats på currentKO (enda globala kopplingen; sanktionerat).
   OBS: navTo refererar övriga vy-renderare som bor kvar i ram-B tills
   familj B modulariseras vidare — anropas ej av faktorträdsmotorn.
   Laddas som klassiskt <script> FÖRE metod-faktortrad.js.
   ============================================================ */

// -- math helpers --
function isPrime(n){
  if(n<2)return false;
  if(n===2)return true;
  if(n%2===0)return false;
  for(let i=3;i*i<=n;i+=2)if(n%i===0)return false;
  return true;
}
function primeFactorize(n){
  const f=[];let x=n;
  for(let p=2;p*p<=x;p++){while(x%p===0){f.push(p);x/=p}}
  if(x>1)f.push(x);
  return f;
}
function sortAsc(a){return [...a].sort((x,y)=>x-y)}
function randPick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const PRIMES_50 = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47];
const PRIMES_100 = [...PRIMES_50,53,59,61,67,71,73,79,83,89,97];
function compositesUpTo(max){
  const out=[];
  for(let i=4;i<=max;i++) if(!isPrime(i)) out.push(i);
  return out;
}
const COMPOSITES_50 = compositesUpTo(50);
const COMPOSITES_100 = compositesUpTo(100);

// -- state --
const state = {
  currentDel: null,
  currentKO: null,
  currentFormaga: null,
  // Tutor's "verdict" per (ko, formaga)
  tutorScores: {}, // {ko: {formaga: {correct: n, total: m}}}
  // Self-assessment storage
  skattningar: {} // {ko: {key: 'kan'|'osaker'|'kanej', ...}}
};

// -- getTutorScore (repRegister valfri; saknas => returnerar raw) --
function getTutorScore(koId, formagaKey){
  if(!state.tutorScores[koId])state.tutorScores[koId]={};
  if(!state.tutorScores[koId][formagaKey])state.tutorScores[koId][formagaKey]={correct:0,total:0,score:0};
  var raw = state.tutorScores[koId][formagaKey];
  // Returnera en proxy som även för in repetitions-bokföring.
  // Befintliga övningar gör t.ex. "ts.total++; if(ok) ts.correct++;" – båda
  // sker i samma "turn". Vi skjuter upp registreringen till nästa mikrotask
  // så att vi hunnit se eventuell correct-ökning innan vi avgör rätt/fel.
  if(typeof repRegister !== 'function') return raw;
  if(raw.__proxied) return raw.__proxy;
  var lastTotal = raw.total, lastCorrect = raw.correct, pending = false;
  function flush(){
    pending = false;
    if(raw.total > lastTotal){
      var blevRatt = raw.correct > lastCorrect;
      lastTotal = raw.total; lastCorrect = raw.correct;
      try{ repRegister(koId, formagaKey, blevRatt); } catch(e){}
    }
  }
  var p = new Proxy(raw, {
    set: function(obj, prop, val){
      obj[prop] = val;
      if((prop === 'total' || prop === 'correct') && !pending){
        pending = true;
        Promise.resolve().then(flush);
      }
      return true;
    }
  });
  raw.__proxied = true;
  raw.__proxy = p;
  return p;
}

// -- getSummaryCopy --
function getSummaryCopy(right, total){
  if(right === total){
    const msgs = [
      'Helt galet bra – alla rätt! Du har full koll på det här.',
      'Imponerande! Inte ett enda fel.',
      'Fullt hus! Du behärskar verkligen det här.',
      'Felfritt! Du har stenkoll.',
      'Wow, alla rätt! Snyggt jobbat.'
    ];
    return {emoji:'🌟', title:'Alla rätt!', message: randPick(msgs), celebration:true};
  }
  if(right >= total - 1){
    return {emoji:'🎉', title:'Riktigt bra jobbat!', message:'Nästan alla rätt – bara ett misstag. Du är på god väg!', celebration:true};
  }
  if(right >= Math.ceil(total * 0.75)){
    return {emoji:'👍', title:'Bra jobbat!', message:'De flesta rätt. Med lite mer träning sitter det.', celebration:false};
  }
  if(right >= Math.ceil(total * 0.5)){
    return {emoji:'💪', title:'Bra ansträngning!', message:'Du har koll på en del. Träna lite till så blir det säkrare.', celebration:false};
  }
  return {emoji:'🌱', title:'Bra att du försöker!', message:'Här finns lite att jobba på. Titta på förklaringarna och försök igen – det här kommer!', celebration:false};
}

// -- renderSummaryCard (PARAMETRISERAD: currentKO in) --
function renderSummaryCard(opts){
  const {right, total, level, levelChange, nextLabel='Ny omgång', currentKO} = opts;
  const summary = getSummaryCopy(right, total);
  let levelMsg = '';
  if(levelChange === 'up') levelMsg = `↑ Nivå upp till ${level} – nu blir det svårare!`;
  else if(levelChange === 'down') levelMsg = `↓ Nivå ner till ${level} – vi tar det lite lugnare.`;
  return `
    <div class="summary-card ${summary.celebration?'celebration':''}">
      <div class="summary-emoji bounce">${summary.emoji}</div>
      <h3 class="summary-title ${summary.celebration?'celebration':''}">${summary.title}</h3>
      <div class="summary-score">${right} / ${total}</div>
      <p class="summary-message">${summary.message}</p>
      ${levelMsg ? `<div class="summary-level-change ${levelChange==='down'?'down':''}">${levelMsg}</div>` : ''}
      <div class="summary-actions">
        <button class="btn primary" id="summary-next-btn">${nextLabel}</button>
        <button class="btn" onclick="navTo('ko',{koId:'${currentKO}'})">Tillbaka</button>
      </div>
    </div>
  `;
}

// -- adjustLevel --
function adjustLevel(level, right, total){
  if(right >= total - 1 && level < 3) return {level: level+1, change: 'up'};
  if(right <= Math.floor(total/3) && level > 1) return {level: level-1, change: 'down'};
  return {level, change: null};
}

// -- router: showView / navTo / global nav-klick --
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('is-active'));
  document.querySelector(`[data-view="${name}"]`).classList.add('is-active');
  window.scrollTo(0,0);
}

function navTo(view, opts={}){
  if(view==='kapitel') renderKapitel();
  else if(view==='del') renderDel(opts.delId);
  else if(view==='ko') renderKO(opts.koId, opts.delId);
  else if(view==='ovning') renderOvning(opts.koId, opts.formaga);
  else if(view==='skattning') renderSkattning();
  else if(view==='test-config') renderTestConfig();
  else if(view==='test-take') renderTestTake();
  else if(view==='test-result') renderTestResult();
}

document.body.addEventListener('click', e=>{
  const navTarget = e.target.closest('[data-nav]');
  if(navTarget){
    e.preventDefault();
    navTo(navTarget.dataset.nav);
  }
});

// -- exerciseHeader --
function exerciseHeader(title, sub, level){
  const levelLabel = level ? `Nivå ${level}` : '';
  const dots = level ? Array.from({length:3}).map((_,i)=>`<i class="${i<level?'filled':''}"></i>`).join('') : '';
  return `
    <div class="exercise-header">
      <div>
        <h2 class="exercise-title">${title}</h2>
        <p class="exercise-sub">${sub}</p>
      </div>
      ${level?`<div class="difficulty-badge">${levelLabel} <span class="dots">${dots}</span></div>`:''}
    </div>
  `;
}
