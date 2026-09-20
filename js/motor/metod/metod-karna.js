/* ============================================================
   FAMILJ B · METOD-KÄRNA (delade beroenden för drill-ramen + metod-modulerna)
   ─────────────────────────────────────────────────────────────
   EN KÄLLA (PASS 3, 2026-09-12): ak7-k1-ram.html laddar den här filen som <script src>
   omedelbart FÖRE sitt stora inline-skript, och bär INGA egna kopior av funktionerna nedan.
   Historik: filen bröts ut 2026-07-12 ("ram-B omkopplad") men kopplades aldrig in i
   ak7-k1-ram.html — ramen behöll originalen, och adjustLevel/exerciseHeader/renderSummaryCard
   utvecklades vidare i ramen medan kärnfilen stod stilla (kärnans renderSummaryCard läste
   opts.currentKO som ingen drill skickar → "Tillbaka" hade gått till ko 'undefined').
   Nu är kärnan = ramens kod, byte-troget, och ramen tömd på dubbletterna.

   Fria variabler (definieras i ramen, används vid ANROP, inte vid laddning): state, repRegister,
   RAM_MAXNIVA, renderKapitel/renderDel/renderKo/renderOvning m.fl. (via navTo), ovaKonfetti.
   Kräver <body> (body-click-lyssnaren) → laddas i body, inte i head.
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
// distinktOmgang — N DISTINKTA uppgifter ur en generator (FAS 3, kontrakt för drillarnas omgångsbygge).
// Mönstret från metod-mult (Set + försökstak PER OMGÅNG) med avrundningens OVILLKORLIGA fyllnad:
// omgången är alltid full — hellre en dublett i nödfall än en kort omgång. Distinktheten är "best effort".
//   gen()      → en uppgift (anropas utan argument; bind level etc. i en closure)
//   n          → antal uppgifter i omgången
//   keyFn(t)   → nyckel som avgör "samma uppgift" (t.ex. t.display); utelämnas → JSON.stringify(t)
//   maxTries   → försökstak per omgång (default 300)
// Ingen drill ska rulla egen for(i<8) o.push(gen()) — det var defekten som potens-drill bar vidare till kvrot.
function distinktOmgang(gen, n, keyFn, maxTries){
  keyFn = keyFn || function(t){ return JSON.stringify(t); };
  maxTries = maxTries || 300;
  const ut = [], seen = new Set(); let tries = 0;
  while(ut.length < n && tries < maxTries){
    tries++;
    const t = gen(); if(t == null) continue;
    const k = keyFn(t);
    if(seen.has(k)) continue;
    seen.add(k); ut.push(t);
  }
  while(ut.length < n){ const t = gen(); if(t != null) ut.push(t); else break; }   // ovillkorlig fyllnad
  return ut;
}
// ── EXEMPELVAKTEN (order 2026-09-20) ────────────────────────────────────────────────────────────────
// Det räknade exemplet i förklaringen får aldrig dyka upp som uppgift. Vakten sitter i OMGÅNGSBYGGET: en
// dragen uppgift som är lika med ett exempel dras om. "Lika" = samma räknesätt och samma operander
// (374 + 286 är 286 + 374 — kommutativt för + och ·, ordnat för − och /), inte samma sträng. Exemplen
// läses ur cfg.exempel (ex-rad-spann eller löptext "a op b"), uppgiften ur display / leftText+rightText /
// {a,b} {m,d} {N,n}. En uppgift med tom ruta (▢) identifieras av hela likheten ("6 · ▢ = 42").
// Förkastningarna räknas per drill i ExempelVakt.stat[id] = {dragna, forkastade, slappta, okandForm}:
// ett mätbart förkastningstal säger "byt exemplet", inte "vakta hårdare".
var ExempelVakt = (function(){
  var stat = {};
  function txt(html){
    return String(html == null ? '' : html)
      .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ' ')
      .replace(/&minus;|&#8722;|−|–/g, '-').replace(/&middot;|&times;|×|∙/g, '·').replace(/&nbsp;/g, ' ')
      .replace(/&rarr;|->|→/g, '→').replace(/&#9633;|&#x25A1;|_{2,}/g, '▢');
  }
  // Identitet ur ett uttryck: "374 + 286 [= 660]" → "+|286,374" · "6 · ▢ = 42" → "·|6,▢|=42" · "42 / (−6)" → "/|42,-6"
  function nyckel(uttryck){
    var delar = txt(uttryck).replace(/[()]/g, ' ').split(/=|→/); var vl = delar[0];
    if(!/[▢\d]/.test(vl)) return null;
    vl = vl.replace(/(\d) (?=\d{3}(?!\d))/g, '$1')                    // tusentalsmellanrum: "40 000" → 40000
           .replace(/(\d|▢)\s*-\s*(?=[\d▢])/g, '$1 - ');               // binärt minus mellan tal → operator, inte tecken
    vl = vl.replace(/(\d)\s*:\s*(?=\d)/g, '$1 / ');                          // kolon är division bara mellan tal ("Exempel:" är prosa)
    var tok = vl.match(/-?\d+(?:[.,]\d+)?|▢|[+\-·/]/g); if(!tok) return null;
    var ops = [], opnd = [];
    tok.forEach(function(t){ if(/^[+\-·/]$/.test(t)) ops.push(t); else opnd.push(t === '▢' ? '▢' : String(parseFloat(t.replace(',', '.')))); });
    if(!ops.length || opnd.length < 2) return null;
    var op = ops[0]; if(ops.some(function(o){ return o !== op; })) op = ops.join('');
    if(op === '+' || op === '·') opnd = opnd.slice().sort();
    var k = op + '|' + opnd.join(',');
    if(opnd.indexOf('▢') >= 0 && delar.length > 1){ var sv = (delar[1].match(/-?\d+(?:[.,]\d+)?/) || [])[0]; if(sv != null) k += '|=' + String(parseFloat(sv.replace(',', '.'))); }
    return k;
  }
  // Alla uttryck i en exempeltext → nycklar (varje ex-rad/mening/pil-led för sig)
  function urExempel(html){
    var ut = [];
    txt(html).split(/\n|→|;|\.\s|\.$/).forEach(function(frag){ var k = nyckel(frag); if(k) ut.push(k); });
    return ut;
  }
  function uttryckAv(t, op){
    if(t == null) return null; if(typeof t === 'string') return t;
    if(t.display != null) return String(t.display);
    if(t.leftText != null || t.rightText != null) return (t.leftText || '') + ' ▢ ' + (t.rightText || '');
    if(t.a != null && t.b != null) return t.a + ' ' + (op || '+') + ' ' + t.b;
    if(t.m != null && t.d != null) return t.m + ' · ' + t.d;
    if(t.N != null && t.n != null) return t.N + ' / ' + t.n;
    return null;
  }
  // skapa(id, exempel, {op}) — exempel: sträng eller lista av strängar (html tillåtet); op = räknesätt för {a,b}-uppgifter
  function skapa(id, exempel, opts){
    opts = opts || {}; var nycklar = {};
    [].concat(exempel || []).forEach(function(e){ urExempel(e).forEach(function(k){ nycklar[k] = true; }); });
    var st = stat[id] = stat[id] || { dragna:0, forkastade:0, slappta:0, okandForm:0 };
    st.exempel = Object.keys(nycklar);
    function ar(t){ var u = uttryckAv(t, opts.op); if(u == null){ st.okandForm++; return false; } var k = nyckel(u); return k != null && nycklar[k] === true; }
    return {
      id:id, ar:ar, stat:st,
      nyckelAv:function(t){ var u = uttryckAv(t, opts.op); return u == null ? null : nyckel(u); },
      // generator-omslag: dras om (max 25 ggr) när dragningen är exemplet; sista dragningen släpps och räknas som slappt
      gen:function(fn){ return function(){ var t; for(var i = 0; i < 25; i++){ t = fn.apply(this, arguments); st.dragna++; if(t == null || !ar(t)) return t; st.forkastade++; } st.slappta++; return t; }; },
      // fast lista (buildOmgang): en plats som är exemplet byggs om — samma plats ur en ny lista (samma fördelning)
      lista:function(bygg){ var l = bygg(); l.forEach(function(t, i){ st.dragna++; for(var k = 0; k < 25 && ar(l[i]); k++){ st.forkastade++; l[i] = bygg()[i]; st.dragna++; } if(ar(l[i])) st.slappta++; }); return l; }
    };
  }
  // forCfg(cfg) — id ur cfg.koId:scoreKey (som getTutorScore), exempel ur cfg.exempel
  function forCfg(cfg, opts){ return skapa((cfg.koId || '?') + ':' + (cfg.scoreKey || cfg.formagaKey || '?'), cfg.exempel, opts); }
  function rapport(){ return Object.keys(stat).map(function(id){ var s = stat[id]; return id + '  dragna ' + s.dragna + ' · förkastade ' + s.forkastade + ' · släppta ' + s.slappta + ' · okänd form ' + s.okandForm + ' · exempel [' + s.exempel.join(' ; ') + ']'; }).join('\n'); }
  return { skapa:skapa, forCfg:forCfg, nyckel:nyckel, urExempel:urExempel, uttryckAv:uttryckAv, stat:stat, rapport:rapport };
})();
if(typeof window !== 'undefined') window.ExempelVakt = ExempelVakt;
function compositesUpTo(max){
  const out=[];
  for(let i=4;i<=max;i++) if(!isPrime(i)) out.push(i);
  return out;
}

// -- tutor score (repetitions-bokföring via proxy) --
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

// -- sammanfattning --
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
function renderSummaryCard(opts){
  const {right, total, level, levelChange, nextLabel='Ny omgång'} = opts;
  const summary = getSummaryCopy(right, total);
  // Alla rätt → konfettiregn (fyras när sammanfattningen målats).
  if(total > 0 && right === total && typeof ovaKonfetti === 'function') setTimeout(ovaKonfetti, 150);
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
        <button class="btn" onclick="navTo('ko',{koId:'${state.currentKO}'})">Tillbaka</button>
      </div>
    </div>
  `;
}

// -- nivå-modell: TVÅ lägen, styrda av DATA (taxonominodens nivamodell) --
//   'befast'  befäst grundkunskap från mellanstadiet: klättrar men sjunker ALDRIG. Nuvarande nivå = golv;
//             på en miss får man fler uppgifter på samma nivå tills det sitter.
//   'nytt'    nytt stoff: klättrar vid ≥ 80 % rätt, sjunker vid < 40 % (k2/k3-ramarnas gamla modell).
//   Modellen är en pedagogisk bedömning per FÄRDIGHET (Joachim 2026-09-18), inte per ram: förr fick allt i
//   ak7-k1-ram "faller aldrig" — även kvadratrötter och potenser, som är nytt stoff i åttan. Nod utan fält
//   → ramens default (RAM_NIVAMODELL; k1-ramen 'befast', k2/k3-ramarna 'nytt') = exakt det gamla beteendet.
//   Taket = färdighetens nivå-antal (RAM_MAXNIVA, ?maxniva=N; default 3).
// Nivåtak: per drill när drillen säger det (bandets nivåantal, order 2026-09-19 — tre nivåer är inget naturligt
// tak), annars ramens ?maxniva= (1–3), annars 3.
function ramMaxNiva(maxNiva){
  if(typeof maxNiva === 'number' && maxNiva >= 1) return maxNiva;
  return (typeof RAM_MAXNIVA === 'number' && RAM_MAXNIVA >= 1) ? RAM_MAXNIVA : 3;
}
function nivamodellFor(nodId){
  if(!nodId) return null;
  var taxar = [window.K1_TAXONOMI, window.K2_TAXONOMI, window.K3_TAXONOMI];
  for(var i = 0; i < taxar.length; i++){
    var noder = taxar[i] && taxar[i].noder; if(!noder) continue;
    for(var j = 0; j < noder.length; j++){ if(noder[j].id === nodId) return noder[j].nivamodell || null; }
  }
  return null;
}
function aktuellNivamodell(){
  var nod = null;
  try { var q = new URLSearchParams(location.search), ko = q.get('ko'), f = q.get('formaga'); nod = (ko && f) ? ko + ':' + f : null; } catch(e){}
  return nivamodellFor(nod) || (typeof RAM_NIVAMODELL === 'string' ? RAM_NIVAMODELL : 'befast');
}
// adjustLevel(level, right, total[, modell]) → { level, change:'up'|'down'|null, delta:1|-1|0 }
function adjustLevel(level, right, total, modell, maxNiva){   // maxNiva: drillens eget tak (valfritt)
  modell = modell || aktuellNivamodell();
  if(modell === 'nytt'){
    if(total > 0){
      var kvot = right / total;
      if(kvot >= 0.8 && level < ramMaxNiva(maxNiva)) return {level: level+1, change: 'up', delta: 1};
      if(kvot < 0.4 && level > 1) return {level: level-1, change: 'down', delta: -1};
    }
    return {level, change: null, delta: 0};
  }
  if(right >= total - 1 && level < ramMaxNiva(maxNiva)) return {level: level+1, change: 'up', delta: 1};
  return {level, change: null, delta: 0};
}

// -- vy-navigering --
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
  else if(view==='test-config') PB.render.config();
  else if(view==='test-take') PB.render.take();
  else if(view==='test-result') PB.render.result();
}
// Navigations-delegeringen (ramens [data-nav]) binds när body finns. k3-ramen laddar den här filen i <head>
// → document.body var null → TypeError vid laddning på varje k3-drill (fångad av onerror-hooken 2026-09-20;
// __jsfel hookas senare och missade den). Funktionerna ovan är hoisted, så drillarna gick ändå.
(function bindNav(){
  if(!document.body){ document.addEventListener('DOMContentLoaded', bindNav); return; }
  document.body.addEventListener('click', e=>{
  const navTarget = e.target.closest('[data-nav]');
  if(navTarget){
    e.preventDefault();
    navTo(navTarget.dataset.nav);
  }
});
})();

// -- övningshuvud (nivå-stege) --
function exerciseHeader(title, sub, level, maxNiva){   // maxNiva: drillens eget tak (valfritt)
  const MAXNIVA = ramMaxNiva(maxNiva);
  // Klättrande stege visas bara för flernivå-färdigheter (max ≥ 2). En enkel-nivå-
  // färdighet (max 1) visar ingen segment-stege – bara drillen.
  const visaStege = level && MAXNIVA >= 2;
  const niva = Math.min(level || 1, MAXNIVA);
  // NIVÅBRYGGA (B3): exponera aktuell drill-nivå så mastery-hooken kan logga den. Additivt.
  if(typeof window !== 'undefined') window.__aktuellNiva = visaStege ? niva : null;
  const levelLabel = visaStege ? `Nivå ${niva} av ${MAXNIVA}` : '';
  const dots = visaStege ? Array.from({length:MAXNIVA}).map((_,i)=>`<i class="${i<niva?'filled':''}${i===niva-1?' aktuell':''}"></i>`).join('') : '';
  return `
    <div class="exercise-header">
      <div>
        <h2 class="exercise-title">${title}</h2>
        <p class="exercise-sub">${sub}</p>
      </div>
      ${visaStege?`<div class="difficulty-badge">${levelLabel} <span class="dots stege">${dots}</span></div>`:''}
    </div>
  `;
}

