/* ============================================================
   FAMILJ B · MOTOR: addsub-metoddrillarna (add-metoder + sub-metoder; delade sub-renderare)
   (De gamla kombinerade begrepp-as/add/räkneträning-AS-drillarna är retirerade — de loggade
    fantomnoder utan kartcell; ersatta av per-räknesätt-KO:na i ak7-k1-ram.html.)
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

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
  // Talområdet är DATA: js/data/spec-villkor.js UPPST_BAND.add (Joachims band, order 2026-09-19).
  // Generatorn (UppstBand) bygger hela omgången distinkt; nivå 3 blandar två storleksprofiler per omgång.
  const BAND = UppstBand.band('add');
  const MAXN = UppstBand.maxNiva('add');   // fyra nivåer (decimaltal = nivå 4)
  const OMGANG = BAND.omgang || 5;
  function fmt(n){ return String(Math.round(n*100)/100).replace('.', ','); }
  function lvlNamn(l){ return BAND.namn[l] || ('Nivå ' + l); }

  // Ny omgång = ny kö ur bandet (vid omgångens första uppgift). Förr en lokal rnd()-generator med egna
  // intervall och decimaltal på nivå 3 — nu bär bandet talområdet, drillen bara layouten (dec alltid 0).
  let ko = [];
  // EXEMPELVAKT (order 2026-09-20): exemplet i förklaringen dras om i omgångsbygget (ExempelVakt i metod-karna).
  const EXEMPEL_ADD = { a:374, b:286 };   // det fasta exempeltalet i renderExplain
  const vakt = ExempelVakt.skapa('add-metoder:uppstallning', [EXEMPEL_ADD.a + ' + ' + EXEMPEL_ADD.b, metod && metod.beskrivning]);
  function genUppstAdd(lvl){
    if(!ko.length || ko.lvl !== lvl){ ko = UppstBand.omgang('add', lvl, OMGANG, vakt); ko.lvl = lvl; }   // tom eller nivåbyte — inte varje anrop före första svaret
    const t = ko.shift();
    const sc = Math.pow(10, t.dec || 0);
    return {a:t.a / sc, b:t.b / sc, answer:t.answer / sc, dec:t.dec || 0};   // nivå 4: mantissor/10^dec
  }

  function showSummary(){
    const right = omgangResults.filter(x=>x).length, total = omgangResults.length;
    const adj = adjustLevel(level, right, total, null, MAXN); level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · uppställning', 'Du klarade '+right+' av '+total+'.', level, MAXN)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '</div>';
    document.getElementById('summary-next-btn').onclick = ()=>{ omgangResults=[]; ko=[]; renderPractice(); };   // ny omgång = ny kö; renderPractice drar uppgiften (förr drogs den två gånger)
  }

  function renderExplain(){
    const a = EXEMPEL_ADD.a, b = EXEMPEL_ADD.b; // fast exempeltal (vaktat i omgångsbygget)
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
        ${exerciseHeader('Metod · uppställning', lvlNamn(level)+' · Uppgift '+(omgangResults.length+1)+' av '+OMGANG, level, MAXN)}
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

    // Ingen ruta förvald (order 2026-09-20): var eleven börjar — höger eller vänster — hör till förståelsen av metoden.
    // (Förr: fokus på entalet efter 50 ms.) Keypaden binds mot den ruta eleven själv väljer.
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
      const ts = getTutorScore('add-metoder','metod'); ts.total++;
      // Nodens egen nyckel: mastery-proxyn loggar bara ko:formaga som matchar URL:en (add-metoder:uppstallning).
      // Saknades här — bara den pensionerade ram-kopian loggade den (order 2026-09-19).
      const tsG = getTutorScore('add-metoder','uppstallning'); tsG.total++;
      omgangResults.push(correct);

      if(correct){
        fb.classList.add('correct');
        fb.textContent = `Rätt! ${fmt(a)} + ${fmt(b)} = ${fmt(answer)} ✓`;
        ts.correct++; tsG.correct++;
      } else {
        fb.classList.add('wrong');
        fb.textContent = `Inte rätt – ${fmt(a)} + ${fmt(b)} = ${fmt(answer)}. Kontrollera kolumn för kolumn.`;
      }
      setTimeout(() => { if(omgangResults.length>=OMGANG) showSummary(); else { renderPractice(); } }, correct?1800:2500);
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
  function gen(lvl){
    if(lvl===1){ const a=rnd(112,989), b=rnd(112,989); return {a:a,b:b,answer:a+b,dec:0}; }
    if(lvl===2){ const a=rnd(1123,9899), b=rnd(1123,9899); return {a:a,b:b,answer:a+b,dec:0}; }
    const dec = Math.random()<0.5 ? 1 : 2, scale = Math.pow(10,dec);
    const aI = dec===1 ? rnd(15,999) : rnd(115,9999);
    const bI = dec===1 ? rnd(15,999) : rnd(115,9999);
    return {a:aI/scale, b:bI/scale, answer:(aI+bI)/scale, dec:dec};
  }
  // Omgången byggs distinkt i förväg, och EXEMPLET är ett eget tal som inte förekommer i någon av de fem
  // uppgifterna (order 2026-09-20: förr visades "Exempel: a + b = …" med uppgiftens egna tal — exemplet var facit).
  const nyckel = t => t.a + '+' + t.b;
  let ko = [], exempel = null;
  function genExempel(lvl, omg){
    const upptagna = new Set(omg.map(nyckel)), tal = new Set(omg.flatMap(t => [t.a, t.b]));
    for(let i = 0; i < 200; i++){ const e = gen(lvl); if(!upptagna.has(nyckel(e)) && !tal.has(e.a) && !tal.has(e.b)) return e; }   // varken samma par eller samma term
    return gen(lvl);
  }
  function newTask(lvl){
    if(!ko.length || ko.lvl !== lvl){ ko = distinktOmgang(() => gen(lvl), OMGANG, nyckel); ko.lvl = lvl; exempel = genExempel(lvl, ko); }   // "Ny uppgift" byter inte omgång (och inte exempel)
    return ko.shift();
  }
  // Mellanledet (talsorterna var för sig) för ett tal-par — används av exemplet och rättningen
  function mellanledFor(t){
    const sc = Math.pow(10, t.dec), aI = Math.round(t.a*sc), bI = Math.round(t.b*sc), maxLen = String(Math.max(aI,bI)).length, d = [];
    for(let p=maxLen-1; p>=0; p--){ const sum = (Math.floor(aI/Math.pow(10,p))%10 + Math.floor(bI/Math.pow(10,p))%10) * Math.pow(10,p); if(sum>0) d.push(sum/sc); }
    return d;
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
    document.getElementById('summary-next-btn').onclick = function(){ omgangResults=[]; ko=[]; task=newTask(level); terms=['']; render(); };
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
        '<span style="color:var(--ink-soft);">Exempel: ' + fmt(exempel.a) + ' + ' + fmt(exempel.b) + ' = ' + mellanledFor(exempel).map(fmt).join(' + ') + ' = ' + fmt(exempel.answer) + '</span>' +
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
      const ts = getTutorScore('add-metoder','metod'); ts.total++;
      const tsG = getTutorScore('add-metoder','talsorterna'); tsG.total++;   // nodens nyckel (add-metoder:talsorterna) — saknades: proxyn loggade aldrig noden (svep 2026-09-19)
      const termSum = termVals.reduce((x,y) => x+y, 0);
      const termsOK = termVals.length >= 2 && near(termSum, answer);   // måste dela upp, inte bara skriva svaret
      const finalOK = !isNaN(finalVal) && near(finalVal, answer);
      const nasta = ok => { omgangResults.push(ok); setTimeout(() => { if(omgangResults.length>=OMGANG) showSummary(); else { task=newTask(level); terms=['']; render(); } }, ok?2000:2700); };
      if(termsOK && finalOK){
        termInputs.forEach(i => i.classList.add('correct'));
        document.getElementById('ts-final-ans').classList.add('correct');
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + fmt(a) + ' + ' + fmt(b) + ' = ' + termVals.map(fmt).join(' + ') + ' = ' + fmt(answer) + ' ✓';
        ts.correct++; tsG.correct++; nasta(true);
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
  // EXEMPELVAKT (order 2026-09-20): exemplet i förklaringen dras om i omgångsbygget (ExempelVakt i metod-karna).
  const EXEMPEL_FO = '47 + 35 &rarr; flytta 3 &rarr; 50 + 32 = 82';
  const vakt = ExempelVakt.skapa('add-metoder:flytta-over', [EXEMPEL_FO, metod && metod.beskrivning], { op:'+' });
  const newTask = vakt.gen(dragTask);
  function dragTask(lvl){
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
          + '<span style="color:var(--ink-soft);">Exempel: ' + EXEMPEL_FO + '</span>'
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

      var ts = getTutorScore('add-metoder','metod'); ts.total++;
      var tsG = getTutorScore('add-metoder','flytta-over'); tsG.total++;   // nodens nyckel (add-metoder:flytta-over) — mastery-proxyn loggar bara URL:ens ko:formaga
      var flyttStammer = flytt>0 && ((near(aVal,a+flytt) && near(bVal,b-flytt)) || (near(aVal,a-flytt) && near(bVal,b+flytt)));
      var mellanledOK  = !isNaN(aVal) && !isNaN(bVal) && near(aVal+bVal, answer);
      var sumOK        = !isNaN(sumVal) && near(sumVal, answer);

      if(mellanledOK && sumOK){
        [mlA,mlB,mlSum].forEach(function(i){ i.classList.add('correct'); });
        fb.classList.add('correct');
        fb.textContent = (flyttStammer ? 'Rätt! Du flyttade '+fmt(flytt)+'. ' : 'Rätt! ')
          + fmt(a)+' + '+fmt(b)+' = '+fmt(aVal)+' + '+fmt(bVal)+' = '+fmt(answer)+' ✓';
        ts.correct++; tsG.correct++; nasta(true);
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
  // Talområdet är DATA: js/data/spec-villkor.js UPPST_BAND.sub (Joachims band, order 2026-09-19).
  var BAND    = UppstBand.band('sub');
  var OMGANG  = BAND.omgang || 5;
  var MAX_LVL = UppstBand.maxNiva('sub');   // fyra nivåer i bandet (nivå 4 = decimaltal)
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

  // Ny omgång = ny kö ur bandet (vid omgångens första uppgift). Förr lokala rnd()-intervall med decimaltal
  // på nivå 3 — nu bär bandet talområdet, drillen bara layouten (dec alltid 0). Växlingskravet ligger i
  // generatorn (struktur:vaxling) så metoden alltid behövs.
  var ko = [];
  // EXEMPELVAKT (order 2026-09-20): exemplet i förklaringen dras om i omgångsbygget (ExempelVakt i metod-karna).
  var vakt = ExempelVakt.skapa('sub-metoder:uppstallning', metod && metod.beskrivning);   // metod är null via deeplinken
  function genTask(lvl){
    if(!ko.length || ko.lvl !== lvl){ ko = UppstBand.omgang('sub', lvl, OMGANG, vakt); ko.lvl = lvl; }
    var t = ko.shift();
    return {aInt:t.a, bInt:t.b, ansInt:t.answer, dec:t.dec || 0};   // nivå 4: mantissor + dec
  }

  function displayNum(n,dec){
    if(dec===0) return String(n);
    var s=String(n).padStart(dec+1,'0');
    return s.slice(0,-dec)+','+s.slice(-dec);   // decimalKOMMA (förr punkt — syntes i feedbacktexten)
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

  // Nivåjustering: DELAD adjustLevel (metod-karna) — modellen ur nodens nivamodell-fält, annars ramens default.
  // (Förr en lokal kopia av klättra-aldrig-sjunk; MAX_LVL = 3 = ramens tak.)

  function lvlName(l){ return BAND.namn[l] || ('Nivå ' + l); }

  function showSummary(){
    var right=omgangResults.filter(function(x){return x;}).length;
    var total=omgangResults.length;
    var adj=adjustLevel(level,right,total,null,MAX_LVL);
    level=adj.level;
    body.innerHTML='<div class="exercise-card">'
      +exerciseHeader('Metod · uppställning (subtraktion)','Du klarade '+right+' av '+total+' uppgifter.',level, MAX_LVL)
      +renderSummaryCard({right:right,total:total,level:level,levelChange:adj.change})
      +'</div>';
    document.getElementById('summary-next-btn').onclick=function(){
      omgangResults=[];ko=[];borrows=new Set();laan=false;svarVal={};sistFokusPos=null;
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
        rowA+='<div class="upp-i-cell upp-dec-cell"><span class="upp-dec-pt">,</span></div>';
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
        rowB+='<div class="upp-i-cell upp-dec-cell"><span class="upp-dec-pt">,</span></div>';
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
      +exerciseHeader('Metod · uppställning (subtraktion)',lvlName(level)+' · Uppgift '+(done+1)+' av '+OMGANG,level, MAX_LVL)
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
    // Ingen ruta förvald (order 2026-09-20): var eleven börjar — höger eller vänster — hör till förståelsen av metoden.
    // Bara ÅTERSTÄLLNING av den ruta eleven redan stod i (lån-knappen ritar om bladet) — aldrig ett förval.
    setTimeout(function(){
      var mal = sistFokusPos!=null && ansInputs.filter(function(x){return parseInt(x.dataset.pos)===sistFokusPos;})[0];
      if(mal) mal.focus();
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
  // Talområdet är DATA: js/data/spec-villkor.js UPPST_BAND['oka-minska'] (Joachims band, order 2026-09-20): subtrahendens
  // flyttsiffra ≥ 6, växling krävs, 16–19-profil, nivå 2 tresiffrigt + tusental, nivå 3 tiondelar + hundradelar. Förr lokala
  // intervall utan villkor mellan entalen (48 − 38) och flytt åt båda hållen. Uppgiften är mantissor + dec: a/b/answer/flytt
  // i heltal, dec skalar dem — rättningen räknar i mantissa så 0,3 + 0,3 aldrig blir ett flyttalsfel.
  const BAND = UppstBand.band('oka-minska'), MAXN = UppstBand.maxNiva('oka-minska');
  const OMGANG = BAND.omgang || 6;
  const vakt = ExempelVakt.skapa('sub-metoder:okaminska', metod && metod.beskrivning);   // exempelvakten (inget räknat exempel i dag)
  let ko = [];
  function newTask(){
    if(!ko.length || ko.lvl !== level){ ko = UppstBand.omgang('oka-minska', level, OMGANG, vakt); ko.lvl = level; }   // distinkt omgång ur bandet
    return ko.shift();
  }

  let task = newTask();
  let uppgNr = 0;   // tips bara på de två första uppgifterna

  function render(){
    uppgNr++;
    const {a, b, answer, dec, flytt} = task;
    const sc = Math.pow(10, dec || 0), F = m => UppstBand.decStr(m, dec || 0);   // mantissa → elevformat (enhetligt antal decimaler)
    const lvlSub = BAND.namn[level] || ('Nivå ' + level);

    body.innerHTML =
      '<div class="exercise-card">'
      + exerciseHeader('Metod · öka och minska lika', lvlSub + ' · Uppgift '+(omgangResults.length+1)+' av '+OMGANG, level, MAXN)
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
            + '<span class="om-sub-num">' + F(a) + '</span>'
            + '<span class="om-sub-op">−</span>'
            + '<span class="om-sub-num">' + F(b) + '</span>'
            + '<span class="om-sub-op om-sub-eq">=</span>'
            + '<input type="text" class="om-sub-input" id="om-new-a" inputmode="decimal" maxlength="7" placeholder="___">'
            + '<span class="om-sub-op">−</span>'
            + '<input type="text" class="om-sub-input" id="om-new-b" inputmode="decimal" maxlength="7" placeholder="___">'
            + '<span class="om-sub-op om-sub-eq">=</span>'
            + '<input type="text" class="om-sub-input om-sub-ans" id="om-final" inputmode="decimal" maxlength="7" placeholder="?">'

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
      // Allt i MANTISSA: "0,3" → 3 på tiondelsnivå, "54" → 54 på heltalsnivå
      const toM = v => { const t = String(v).trim().replace(',', '.'); if(t === '') return NaN; const x = parseFloat(t); return isNaN(x) ? NaN : Math.round(x * sc); };
      const raw    = annotInp.value.trim();
      const aVal   = toM(newAInp.value);
      const bVal   = toM(newBInp.value);
      const finVal = toM(finalInp.value);

      const fb = document.getElementById('fb-om');
      fb.classList.remove('correct','wrong'); fb.classList.add('show');
      allInps.forEach(i => { i.classList.remove('correct','wrong'); i.disabled=true; });
      document.getElementById('om-check').disabled = true;

      const ts = getTutorScore('sub-metoder','metod'); ts.total++;
      const tsGOM = getTutorScore('sub-metoder','okaminska'); tsGOM.total++;

      // Parsa annotering: "+1", "-2", "1" etc.
      const delta    = toM(raw.replace('+',''));
      const deltaOK  = !isNaN(delta) && delta !== 0 && aVal===a+delta && bVal===b+delta;
      const midledOK = !isNaN(aVal) && !isNaN(bVal) && (aVal - bVal === answer);
      const finalOK  = !isNaN(finVal) && finVal === answer;

      if(midledOK && finalOK){
        allInps.forEach(i => i.classList.add('correct'));
        fb.classList.add('correct');
        fb.textContent = (deltaOK?'Rätt! ':'Rätt svar! ')
          + F(a) + ' − ' + F(b) + ' = ' + F(aVal) + ' − ' + F(bVal) + ' = ' + F(answer) + ' ✓';
        ts.correct++; tsGOM.correct++;
        omgangResults.push(true);
      } else if(midledOK && !finalOK){
        newAInp.classList.add('correct'); newBInp.classList.add('correct');
        finalInp.classList.add('wrong');
        fb.classList.add('wrong');
        fb.textContent = 'Mellanledet stämmer! Men ' + F(aVal) + ' − ' + F(bVal) + ' = ' + F(answer) + ', inte ' + (isNaN(finVal) ? '(tomt)' : F(finVal)) + '.';
        omgangResults.push(false);
      } else {
        [newAInp,newBInp,finalInp].forEach(i => i.classList.add('wrong'));
        // bandet gör alltid flytten UPPÅT till nästa runda tal (flytt = 10 − subtrahendens flyttsiffra)
        const hint = 'Lägg till ' + F(flytt) + ' på båda: ' + F(a + flytt) + ' − ' + F(b + flytt);
        fb.classList.add('wrong');
        fb.textContent = 'Mellanledet stämmer inte. Tips: ' + hint + ' = ' + F(answer) + '.';
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
    const adj   = adjustLevel(level, right, total, null, MAXN);
    level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · öka och minska lika','Du klarade '+right+' av '+total+'.',level, MAXN)
      + renderSummaryCard({right, total, level, levelChange:adj.change})
      + '</div>';
    document.getElementById('summary-next-btn').onclick = () => {
      omgangResults=[]; ko=[]; task=newTask(); render();   // ny omgång = ny kö ur bandet
    };
  }

  render();
}

// --- SUB METOD: ADDITION BAKIFRÅN ---
function renderAdditionBakifran(body, metod, backFn){
  let level = 1, omgangResults = [], uppgNr = 0;   // uppgNr: totalt i sessionen – Idén-rutan visas bara de 2 första
  // Talområdet är DATA: js/data/spec-villkor.js UPPST_BAND.bakifran (Joachims band, order 2026-09-20): växling krävs, första
  // hoppet ≥ 3, minuenden slutar inte på 0, inget tak på resten (fri stegindelning), nivå 2 tresiffrigt + tusental, nivå 3
  // tiondelar + hundradelar med differens ≥ 2 hela enheter. Förr lokala intervall utan villkor mellan entalen, bara tiondelar.
  const BAND = UppstBand.band('bakifran'), MAXN = UppstBand.maxNiva('bakifran');
  const OMGANG = BAND.omgang || 5;
  const vakt = ExempelVakt.skapa('sub-metoder:bakifran', metod && metod.beskrivning);   // exempelvakten (inget räknat exempel i dag)
  let ko = [], task = null;
  // Elevformat med uppgiftens antal decimaler — enhetligt: 11,0 − 7,9, inte 11 − 7,9
  function fmt(n){ const d = task ? task.dec : 0; return UppstBand.decStr(Math.round(n * Math.pow(10, d)), d); }
  function lvlNamn(l){ return BAND.namn[l] || ('Nivå ' + l); }
  function newTask(lvl){
    if(!ko.length || ko.lvl !== lvl){ ko = UppstBand.omgang('bakifran', lvl, OMGANG, vakt); ko.lvl = lvl; }   // distinkt omgång ur bandet
    const t = ko.shift(), sc = Math.pow(10, t.dec || 0);
    return { a:t.a / sc, b:t.b / sc, answer:t.answer / sc, dec:t.dec || 0,
             nextTio:t.nextTio / sc, steg1:t.flytt / sc, steg2:(t.a - t.nextTio) / sc };   // exempelvägen i tipset (eleven väljer sina egna hopp)
  }
  task = newTask(level);

  function showSummary(){
    const right = omgangResults.filter(x=>x).length, total = omgangResults.length;
    const adj = adjustLevel(level, right, total, null, MAXN); level = adj.level;
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader('Metod · addition bakifrån', 'Du klarade '+right+' av '+total+'.', level, MAXN)
      + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
      + '</div>';
    document.getElementById('summary-next-btn').onclick = ()=>{ omgangResults=[]; ko=[]; task=newTask(level); render(); };   // ny omgång = ny kö ur bandet
  }

  // FRI STEGINDELNING (order 2026-09-20): eleven väljer själv antalet hopp — minst två — och rättningen godtar VARJE
  // uppdelning vars delar är positiva och summerar till differensen: 26 + 900 + 2017 är lika rätt som
  // 26 + 900 + 2000 + 17 eller 926 + 2017. Förr: fasta fält (steg1 = nästa tiotal − b, steg2 = a − nästa tiotal),
  // rättade fält för fält mot just den vägen. Generatorns nextTio/steg1/steg2 är nu bara tipsets exempelväg.
  const MIN_STEG = 2, MAX_STEG = 6;
  let steg = ['', ''];
  const parse = v => { const t = String(v).trim().replace(',', '.'); return t === '' ? NaN : parseFloat(t); };
  const nara = (x, y) => Math.abs(x - y) < 1e-9;

  function render(){
    uppgNr++;
    steg = ['', ''];
    const {a, b, answer, nextTio, steg1, steg2} = task;
    const visaIde = uppgNr <= 2;

    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Metod · addition bakifrån', lvlNamn(level)+' · Uppgift '+(omgangResults.length+1)+' av '+OMGANG, level, MAXN)}
        <div class="metod-explain-card">
          ${visaIde ? `<div style="background:var(--bg-warm);padding:14px;border-radius:var(--radius);margin-bottom:16px;font-size:13px;">
            <strong>Idén:</strong> Istället för att subtrahera räknar vi hur mycket vi måste lägga till för att komma från <strong>${fmt(b)}</strong> till <strong>${fmt(a)}</strong>.
            Differensen är summan av hoppen. Du väljer själv hur många hopp du tar — lägg till eller ta bort steg.
          </div>` : ''}

          <p style="font-size:15px;margin:0 0 18px;">Beräkna <strong style="font-family:var(--mono);font-size:18px;">${fmt(a)} − ${fmt(b)}</strong>.</p>

          <div class="abakifran-grid">
            <div class="abakifran-tallinje" id="ab-tallinje"></div>
            <div class="om-uttryck-rad" id="ab-kedja" style="margin-top:8px;justify-content:center;flex-wrap:wrap;row-gap:10px;"></div>
            <div style="display:flex;gap:8px;justify-content:center;">
              <button class="btn subtle" id="ab-plus" type="button">+ steg</button>
              <button class="btn subtle" id="ab-minus" type="button">− steg</button>
            </div>
          </div>

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

    const card = body.querySelector('.exercise-card');
    let last = false;   // efter rättning: kedjan låst

    // Kedjan: a − b = [steg] + [steg] … = [svar]. Byggs om vid + steg / − steg med elevens värden bevarade.
    function ritaKedja(fokusIx){
      const k = document.getElementById('ab-kedja');
      const sumEl = document.getElementById('ab-sum'); const sumVal = sumEl ? sumEl.value : '';
      k.innerHTML = '<span class="om-u-num">' + fmt(a) + '</span><span class="om-u-op">−</span><span class="om-u-num">' + fmt(b) + '</span><span class="om-u-op">=</span>'
        + steg.map((v, i) => (i ? '<span class="om-u-op">+</span>' : '') + '<input type="text" class="om-u-input ab-steg" data-ix="' + i + '" inputmode="decimal" maxlength="7" placeholder="___" value="' + v.replace(/"/g, '') + '">').join('')
        + '<span class="om-u-op">=</span><input type="text" class="om-u-input om-u-input-sum" id="ab-sum" inputmode="decimal" maxlength="8" placeholder="?" value="' + sumVal.replace(/"/g, '') + '">';
      const inputs = Array.from(k.querySelectorAll('input'));
      inputs.forEach((inp, i) => {
        inp.addEventListener('input', () => {
          if(inp.classList.contains('ab-steg')){
            const ix = parseInt(inp.dataset.ix);
            // Backspace/⌫ i ett REDAN tomt sista steg tar bort steget (radera ångrar ett tillagt steg) — aldrig under minimum
            if(inp.value === '' && inp.dataset.tom === '1' && ix === steg.length - 1 && steg.length > MIN_STEG){ steg.pop(); ritaKedja(steg.length - 1); return; }
            inp.dataset.tom = inp.value === '' ? '1' : '0';
            steg[ix] = inp.value;
          }
          ritaTallinje();
        });
        inp.addEventListener('keydown', e => {
          if(e.key === 'Enter'){ e.preventDefault(); if(i < inputs.length - 1) inputs[i + 1].focus(); else check(); }
          if(e.key === 'Backspace' && inp.value === '' && inp.classList.contains('ab-steg')){ const ix = parseInt(inp.dataset.ix); if(ix === steg.length - 1 && steg.length > MIN_STEG){ e.preventDefault(); steg.pop(); ritaKedja(steg.length - 1); } }   // tangentbordets Backspace i tomt sista steg (keypadens ⌫ går via input-händelsen)
        });
        if(inp.classList.contains('ab-steg')) inp.dataset.tom = inp.value === '' ? '1' : '0';
      });
      document.getElementById('ab-plus').disabled = last || steg.length >= MAX_STEG;
      document.getElementById('ab-minus').disabled = last || steg.length <= MIN_STEG;
      if(fokusIx != null && inputs[fokusIx]) inputs[fokusIx].focus();
      ritaTallinje();
    }

    // Tallinjen följer elevens hopp: b … (b + hopp₁) … (b + hopp₁ + hopp₂) … a
    function ritaTallinje(){
      const t = document.getElementById('ab-tallinje'); if(!t) return;
      const pts = [{ pos:0, lbl:fmt(b) }];
      let cum = 0;
      for(const v of steg){ const x = parse(v); if(!(x > 0)) break; cum += x; if(cum >= answer - 1e-9) break; pts.push({ pos:(cum / answer) * 100, lbl:fmt(Math.round((b + cum) * 100) / 100) }); }
      pts.push({ pos:100, lbl:fmt(a) });
      t.innerHTML = pts.map(p => '<div class="ab-punkt" style="left:' + Math.max(0, Math.min(100, p.pos)) + '%"><div class="ab-label">' + p.lbl + '</div><div class="ab-dot"></div></div>').join('') + '<div class="ab-linje"></div>';
    }

    document.getElementById('ab-plus').onclick = () => { if(steg.length < MAX_STEG){ steg.push(''); ritaKedja(steg.length - 1); } };
    document.getElementById('ab-minus').onclick = () => { if(steg.length > MIN_STEG){ steg.pop(); ritaKedja(steg.length - 1); } };

    // Rättning: varje del > 0, delarna summerar till differensen (hoppen går uppåt från b ända till a), svaret = differensen.
    function check(){
      if(last) return; last = true;
      const inputs = Array.from(card.querySelectorAll('#ab-kedja input'));
      const delar = steg.map(parse), sumVal = parse(document.getElementById('ab-sum').value);
      const delarOK = delar.every(x => x > 0) && nara(delar.reduce((p, q) => p + q, 0), answer);
      const svarOK = nara(sumVal, answer);
      inputs.forEach(inp => { inp.disabled = true; });
      inputs.forEach(inp => inp.classList.add(inp.id === 'ab-sum' ? (svarOK ? 'correct' : 'wrong') : (delarOK ? 'correct' : 'wrong')));
      document.getElementById('ab-plus').disabled = true; document.getElementById('ab-minus').disabled = true; document.getElementById('ab-check').disabled = true;
      const fb = document.getElementById('fb-ab'); fb.classList.add('show');
      const ts = getTutorScore('sub-metoder','metod'); ts.total++;
      const tsGB = getTutorScore('sub-metoder','bakifran'); tsGB.total++;
      const allRight = delarOK && svarOK;
      omgangResults.push(allRight);
      if(allRight){
        fb.classList.add('correct');
        fb.textContent = 'Rätt! ' + fmt(b) + ' + ' + delar.map(fmt).join(' + ') + ' = ' + fmt(a) + ', alltså ' + fmt(a) + ' − ' + fmt(b) + ' = ' + fmt(answer);
        ts.correct++; tsGB.correct++;
      } else {
        fb.classList.add('wrong');
        const varfor = !delar.every(x => x > 0) ? 'Varje hopp ska vara ett tal större än 0. '
          : !delarOK ? 'Hoppen ' + delar.map(fmt).join(' + ') + ' = ' + fmt(Math.round(delar.reduce((p, q) => p + q, 0) * 100) / 100) + ' når inte fram till ' + fmt(a) + ' från ' + fmt(b) + '. '
          : 'Hoppen stämmer, men svaret är summan av dem. ';
        fb.textContent = varfor + 'En väg: ' + fmt(b) + ' + ' + fmt(steg1) + ' = ' + fmt(nextTio) + (steg2 > 0 ? ', ' + fmt(nextTio) + ' + ' + fmt(steg2) + ' = ' + fmt(a) : '') + '. Differensen är ' + fmt(answer) + '.';
      }
      setTimeout(()=>{
        if(omgangResults.length >= OMGANG) showSummary();
        else { task=newTask(level); render(); }
      }, allRight ? 2000 : 3200);
    }
    document.getElementById('ab-check').onclick = check;
    document.getElementById('ab-ny').onclick = ()=>{ task=newTask(level); render(); };
    document.getElementById('ab-back').onclick = backFn;
    ritaKedja();
    setTimeout(()=>{ const first = card.querySelector('.ab-steg'); if(first) first.focus(); }, 50);   // stegordningen är given: första hoppet
    bindKeypad(card);
  }
  render();
}
