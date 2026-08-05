/* provbyggar-motor.js — DELAD PROVBYGGARE.
   Extraherad BYTE-IDENTISKT ur ak7-k1-ram.html (samma sätt karta-motorn bröts ut). Ingen ny logik.
   Mekanism = UI (skill-väljare grupperad per bok-delkapitel + färg-filter + hopfällning), test-tagning,
   sub-typ-gradare (numeric/flerval/product/brak), resultat + logg-hook + spärr-läsning via mastery.
   Content (taxonomi, generators, GEN_NOD, bok-delkapitel, mastery/belief-nycklar, forelasningTips) kommer
   via config i montera(). Globaler skuggas med samma namn → flyttad kod är oförändrad utom window.* → config.
   ── Elev-lokalt: läser/skriver bara via config.mastery (localStorage). Ingen nätväg i den här filen. ── */
(function(){
  // OBS: medvetet INTE 'use strict' — den flyttade koden kördes i ramens sloppy mode (t.ex.
  // generateTest:s safetyCounter läcker till global mellan snabb-/problem-looparna). Byte-identiskt.

  // ── Hjälpare (självförsörjande kopior; ramarnas egna generator-hjälpare rörs ej) ──
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
function randPick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;} // för enklaste form (gcd=1)
function komma(x){return String(x).replace('.',',')}                    // 0.04 → "0,04" (svensk decimal)

  // ── Fabriker (bygg generators: ProvbyggarMotor.gen.numeric/flerval/product/brak) ──
function testNumericGen(genId, titel, omrade, makeItem){
  return function(seen){
    const subs = []; let tries = 0;
    while(subs.length < 4 && tries < 120){
      tries++;
      const it = makeItem();
      if(!it || seen.has(genId+'-'+it.key)) continue;
      seen.add(genId+'-'+it.key);
      subs.push({ label:String.fromCharCode(97+subs.length)+')', type:'numeric', prompt:it.prompt, answer:it.ans, explanation:it.expl||'' });
    }
    return subs.length ? { generator:genId, title:titel, omrade:omrade, subs:subs } : null;
  };
}
function testFlervalGen(genId, titel, omrade, makeItem){
  return function(seen){
    const subs = []; let tries = 0;
    while(subs.length < 3 && tries < 120){
      tries++;
      const it = makeItem();
      if(!it || seen.has(genId+'-'+it.key)) continue;
      seen.add(genId+'-'+it.key);
      subs.push({ label:String.fromCharCode(97+subs.length)+')', type:'binary', q:it.q||'', prompt:it.prompt, options:it.options, answer:it.answer, explanation:it.expl||'' });
    }
    return subs.length ? { generator:genId, title:titel, omrade:omrade, subs:subs } : null;
  };
}
function testProductGen(genId, titel, omrade, makeItem){
  return function(seen){
    const subs = []; let tries = 0;
    while(subs.length < 3 && tries < 120){
      tries++;
      const it = makeItem();
      if(!it || seen.has(genId+'-'+it.key)) continue;
      seen.add(genId+'-'+it.key);
      subs.push({ label:String.fromCharCode(97+subs.length)+')', type:'product', q:it.target+' = ___ · ___', target:it.target, operator:'·', antal:it.antal, answer:null });
    }
    return subs.length ? { generator:genId, title:titel, omrade:omrade, subs:subs } : null;
  };
}
// Bråk-svar: makeItem → {key, prompt, talj, namn} där (talj/namn) är MÅL-bråket i enklaste form.
// gradeSub rättar på värde + enklaste form (gcd=1), samma regel som övriga förkortnings-färdigheter.
function testBrakGen(genId, titel, omrade, makeItem){
  return function(seen){
    const subs = []; let tries = 0;
    while(subs.length < 4 && tries < 120){
      tries++;
      const it = makeItem();
      if(!it || seen.has(genId+'-'+it.key)) continue;
      seen.add(genId+'-'+it.key);
      subs.push({ label:String.fromCharCode(97+subs.length)+')', type:'brak', prompt:it.prompt, talj:it.talj, namn:it.namn, explanation:it.expl||'' });
    }
    return subs.length ? { generator:genId, title:titel, omrade:omrade, subs:subs } : null;
  };
}
// Flerstegs (mellanled): makeItem → {key, prompt, led:[{fraga, varde, facit?}], slutTalj, slutNamn, expl}.
// led = mellansteg (värde-rättade); slutTalj/slutNamn = slutsvar i enklaste form. Speglar drillens tresektion.
function testMellanledGen(genId, titel, omrade, makeItem){
  // opts.variant (valfritt): config-vald variant vidarebefordras till makeItem, som får producera bara den.
  return function(seen, opts){
    const subs = []; let tries = 0;
    while(subs.length < 4 && tries < 120){
      tries++;
      const it = makeItem(opts);
      if(!it || seen.has(genId+'-'+it.key)) continue;
      seen.add(genId+'-'+it.key);
      subs.push({ label:String.fromCharCode(97+subs.length)+')', type:'mellanled', prompt:it.prompt, led:it.led, slutTalj:it.slutTalj, slutNamn:it.slutNamn, explanation:it.expl||'' });
    }
    return subs.length ? { generator:genId, title:titel, omrade:omrade, subs:subs } : null;
  };
}
// Numerisk flerstegs (mellanled-num): makeItem → {key, prompt, led:[{fraga, varde, facit?}], slutVarde, slutHint?, expl}.
// EN talruta per led (värde-rättat) + slutled på värde. Additiv variant av testMellanledGen för numeriska
// färdigheter (potenser/tiopotenser/prioritering/stora tal). Bråk-mellanledet oförändrat.
function testMellanledNumGen(genId, titel, omrade, makeItem){
  return function(seen, opts){
    const subs = []; let tries = 0;
    while(subs.length < 4 && tries < 120){
      tries++;
      const it = makeItem(opts);
      if(!it || seen.has(genId+'-'+it.key)) continue;
      seen.add(genId+'-'+it.key);
      subs.push({ label:String.fromCharCode(97+subs.length)+')', type:'mellanled-num', prompt:it.prompt, led:it.led, slutVarde:it.slutVarde, slutHint:it.slutHint||'', explanation:it.expl||'' });
    }
    return subs.length ? { generator:genId, title:titel, omrade:omrade, subs:subs } : null;
  };
}
// Grundpotens (gp): makeItem → {key, prompt, led:[{fraga, varde, facit?}]?, slutKoeff, slutExp, expl}.
// Valfria numeriska led + slutsvar i grundpotensform ▢·10^▢ (form-medveten: koeff i [1,10)). Speglar drillens gp-svar.
function testGpGen(genId, titel, omrade, makeItem){
  return function(seen, opts){
    const subs = []; let tries = 0;
    while(subs.length < 4 && tries < 120){
      tries++;
      const it = makeItem(opts);
      if(!it || seen.has(genId+'-'+it.key)) continue;
      seen.add(genId+'-'+it.key);
      subs.push({ label:String.fromCharCode(97+subs.length)+')', type:'gp', prompt:it.prompt, led:it.led||[], slutKoeff:it.slutKoeff, slutExp:it.slutExp, explanation:it.expl||'' });
    }
    return subs.length ? { generator:genId, title:titel, omrade:omrade, subs:subs } : null;
  };
}

  // ── Färg-metadata + förmåge-etiketter (defaults; kan överskrivas via config) ──
const FARG_INFO = [
  {namn:'Röd',    bg:'#D14A40'},
  {namn:'Orange', bg:'#E08529'},
  {namn:'Gul',    bg:'#E4BC34'},
  {namn:'Grön',   bg:'#6BA544'}
];
const FORMAGA_NAMN = {begrepp:'Begrepp', rakna:'Räkna', metod:'Metod', kommunikation:'Kommunikation', resonera:'Resonera', problem:'Problem', addsub:'Plus och minus', multdiv:'Gånger och delat'};

  // ── Sub-typ-hanterare (config-oberoende: render/läs/återställ/gradera/facit) ──
function renderSubInput(qNum, subIdx, s){
  const idBase = `q${qNum}-s${subIdx}`;
  const label = s.label ? `<div class="test-sub-label">${s.label}</div>` : '';
  let inputHtml = '';

  if(s.type === 'binary'){
    inputHtml = `
      <div class="test-sub-q"><span class="num-inline">${s.prompt || s.q}</span></div>
      <div class="test-sub-binary-row" data-sub-id="${idBase}">
        ${s.options.map(opt => `
          <button class="test-sub-binary-btn" data-val="${opt}">${opt}</button>
        `).join('')}
      </div>
    `;
  } else if(s.type === 'sum' || s.type === 'product'){
    const op = s.operator;
    const inputs = Array.from({length:s.antal}).map((_,i) => `
      ${i>0 ? `<span class="test-sub-operator">${op}</span>` : ''}
      <input type="text" class="test-sub-input" inputmode="numeric" maxlength="3" data-sub-input="${idBase}-${i}">
    `).join('');
    inputHtml = `
      <div class="test-sub-q">Dela upp talet:</div>
      <div class="test-sub-input-row">
        <span class="test-sub-target">${s.target}</span>
        <span class="test-sub-eq">=</span>
        ${inputs}
      </div>
    `;
  } else if(s.type === 'primfakt'){
    inputHtml = `
      <div class="test-sub-q">Skriv talet <span class="num-inline">${s.target}</span> som produkt av enbart primtal:</div>
      <div class="test-sub-input-row">
        <span class="test-sub-target">${s.target}</span>
        <span class="test-sub-eq">=</span>
        <input type="text" class="test-sub-input" style="width:200px;text-align:left;padding:0 10px;" placeholder="t.ex. 2 · 2 · 3" data-sub-input="${idBase}-str">
      </div>
    `;
  } else if(s.type === 'gata'){
    inputHtml = `
      <div class="test-sub-q">${s.q}</div>
      <ul class="test-sub-clues">
        ${s.clues.map(c => `<li>${c}</li>`).join('')}
      </ul>
      <div class="test-sub-input-row">
        <span class="test-sub-eq">Talet är</span>
        <input type="text" class="test-sub-input" inputmode="numeric" maxlength="4" data-sub-input="${idBase}-val">
      </div>
    `;
  } else if(s.type === 'numeric'){
    inputHtml = `
      <div class="test-sub-q"><span class="num-inline">${s.prompt}</span></div>
      <div class="test-sub-input-row">
        <span class="test-sub-eq">Svar:</span>
        <input type="text" class="test-sub-input" inputmode="decimal" style="width:120px;" data-sub-input="${idBase}-num">
        ${s.enhet ? `<span class="test-sub-eq">${s.enhet}</span>` : ''}
      </div>
    `;
  } else if(s.type === 'brak'){
    inputHtml = `
      <div class="test-sub-q"><span class="num-inline">${s.prompt}</span></div>
      <div class="test-sub-input-row">
        <span class="test-sub-eq">Svar:</span>
        <span class="test-sub-brak">
          <input type="text" class="test-sub-input tsb-cell" inputmode="numeric" maxlength="4" data-sub-input="${idBase}-t" aria-label="täljare">
          <span class="tsb-streck"></span>
          <input type="text" class="test-sub-input tsb-cell" inputmode="numeric" maxlength="4" data-sub-input="${idBase}-n" aria-label="nämnare">
        </span>
      </div>
    `;
  } else if(s.type === 'mellanled'){
    // Flerstegs-bråk: ett led-fält per mellansteg (värde-rättat) + slutsvar (enklaste form).
    // Speglar drillens tresektions-rättning (mellanRatt/svarRatt) — drill-motorn orörd.
    const ledRows = (s.led || []).map((L, i) => `
      <div class="tsm-led">
        <span class="tsm-fraga"><span class="num-inline">${L.fraga}</span></span>
        <span class="test-sub-eq">=</span>
        <span class="test-sub-brak">
          <input type="text" class="test-sub-input tsb-cell" inputmode="numeric" maxlength="5" data-sub-input="${idBase}-L${i}-t" aria-label="mellanled täljare">
          <span class="tsb-streck"></span>
          <input type="text" class="test-sub-input tsb-cell" inputmode="numeric" maxlength="5" data-sub-input="${idBase}-L${i}-n" aria-label="mellanled nämnare">
        </span>
      </div>`).join('');
    inputHtml = `
      <div class="test-sub-q"><span class="num-inline">${s.prompt}</span></div>
      <div class="test-sub-mellan">
        ${ledRows}
        <div class="tsm-led tsm-slut">
          <span class="tsm-fraga">Svar</span>
          <span class="test-sub-eq">=</span>
          <span class="test-sub-brak">
            <input type="text" class="test-sub-input tsb-cell" inputmode="numeric" maxlength="4" data-sub-input="${idBase}-st" aria-label="slutsvar täljare">
            <span class="tsb-streck"></span>
            <input type="text" class="test-sub-input tsb-cell" inputmode="numeric" maxlength="4" data-sub-input="${idBase}-sn" aria-label="slutsvar nämnare">
          </span>
          <span class="tsm-hint">enklaste form</span>
        </div>
      </div>
    `;
  } else if(s.type === 'mellanled-num'){
    // Numerisk flerstegs: EN talruta per led (värde-rättat) + slutled. Additiv variant av 'mellanled'
    // för potenser/tiopotenser/prioritering/stora tal — bråk-mellanledet (täljare/nämnare) oförändrat.
    const ledRows = (s.led || []).map((L, i) => `
      <div class="tsm-led">
        <span class="tsm-fraga"><span class="num-inline">${L.fraga}</span></span>
        <span class="test-sub-eq">=</span>
        <input type="text" class="test-sub-input tsn-cell" inputmode="decimal" maxlength="10" data-sub-input="${idBase}-L${i}-num" aria-label="mellanled värde">
      </div>`).join('');
    inputHtml = `
      <div class="test-sub-q"><span class="num-inline">${s.prompt}</span></div>
      <div class="test-sub-mellan">
        ${ledRows}
        <div class="tsm-led tsm-slut">
          <span class="tsm-fraga">Svar</span>
          <span class="test-sub-eq">=</span>
          <input type="text" class="test-sub-input tsn-cell" inputmode="decimal" maxlength="10" data-sub-input="${idBase}-snum" aria-label="slutsvar värde">
          ${s.slutHint ? `<span class="tsm-hint">${s.slutHint}</span>` : ''}
        </div>
      </div>
    `;
  } else if(s.type === 'gp'){
    // Grundpotens: valfria numeriska led (värde-rättade) + slutsvar i grundpotensform ▢·10^▢.
    // Form-medveten rättning (koeff i [1,10) + rätt värde) speglar drillens gp-check. Bråk-mellanledet orört.
    const ledRows = (s.led || []).map((L, i) => `
      <div class="tsm-led">
        <span class="tsm-fraga"><span class="num-inline">${L.fraga}</span></span>
        <span class="test-sub-eq">=</span>
        <input type="text" class="test-sub-input tsn-cell" inputmode="decimal" maxlength="12" data-sub-input="${idBase}-L${i}-num" aria-label="mellanled värde">
      </div>`).join('');
    inputHtml = `
      <div class="test-sub-q"><span class="num-inline">${s.prompt}</span></div>
      <div class="test-sub-mellan">
        ${ledRows}
        <div class="tsm-led tsm-slut">
          <span class="tsm-fraga">Svar</span>
          <span class="test-sub-eq">=</span>
          <span class="tsg-svar">
            <input type="text" class="test-sub-input tsn-cell" inputmode="decimal" maxlength="6" data-sub-input="${idBase}-gk" aria-label="koefficient" placeholder="a">
            <span class="tsg-bas">· 10^</span>
            <input type="text" class="test-sub-input tsn-cell" inputmode="numeric" maxlength="3" data-sub-input="${idBase}-ge" aria-label="exponent" placeholder="n">
          </span>
          <span class="tsm-hint">a·10ⁿ, 1 ≤ a &lt; 10</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="test-sub-item">
      ${label}
      ${inputHtml}
    </div>
  `;
}

function readSubAnswer(qNum, subIdx, s){
  const idBase = `q${qNum}-s${subIdx}`;
  if(s.type === 'binary'){
    const sel = document.querySelector(`[data-sub-id="${idBase}"] .is-selected`);
    return sel ? sel.dataset.val : null;
  } else if(s.type === 'sum' || s.type === 'product'){
    const vals = [];
    for(let i=0;i<s.antal;i++){
      const inp = document.querySelector(`[data-sub-input="${idBase}-${i}"]`);
      if(inp && inp.value.trim()) vals.push(inp.value.trim());
    }
    return vals.length === 0 ? null : vals;
  } else if(s.type === 'primfakt'){
    const inp = document.querySelector(`[data-sub-input="${idBase}-str"]`);
    return inp && inp.value.trim() ? inp.value.trim() : null;
  } else if(s.type === 'gata'){
    const inp = document.querySelector(`[data-sub-input="${idBase}-val"]`);
    return inp && inp.value.trim() ? inp.value.trim() : null;
  } else if(s.type === 'numeric'){
    const inp = document.querySelector(`[data-sub-input="${idBase}-num"]`);
    return inp && inp.value.trim() ? inp.value.trim() : null;
  } else if(s.type === 'brak'){
    const t = document.querySelector(`[data-sub-input="${idBase}-t"]`);
    const n = document.querySelector(`[data-sub-input="${idBase}-n"]`);
    const tv = t && t.value.trim(), nv = n && n.value.trim();
    return (tv || nv) ? [tv || '', nv || ''] : null;
  } else if(s.type === 'mellanled'){
    const led = (s.led || []).map((L, i) => {
      const t = document.querySelector(`[data-sub-input="${idBase}-L${i}-t"]`);
      const n = document.querySelector(`[data-sub-input="${idBase}-L${i}-n"]`);
      return [(t && t.value.trim()) || '', (n && n.value.trim()) || ''];
    });
    const st = document.querySelector(`[data-sub-input="${idBase}-st"]`);
    const sn = document.querySelector(`[data-sub-input="${idBase}-sn"]`);
    const slut = [(st && st.value.trim()) || '', (sn && sn.value.trim()) || ''];
    const any = led.some(l => l[0] || l[1]) || slut[0] || slut[1];
    return any ? { led, slut } : null;
  } else if(s.type === 'mellanled-num'){
    const led = (s.led || []).map((L, i) => {
      const el = document.querySelector(`[data-sub-input="${idBase}-L${i}-num"]`);
      return (el && el.value.trim()) || '';
    });
    const sEl = document.querySelector(`[data-sub-input="${idBase}-snum"]`);
    const slut = (sEl && sEl.value.trim()) || '';
    const any = led.some(v => v) || slut;
    return any ? { led, slut } : null;
  } else if(s.type === 'gp'){
    const led = (s.led || []).map((L, i) => {
      const el = document.querySelector(`[data-sub-input="${idBase}-L${i}-num"]`);
      return (el && el.value.trim()) || '';
    });
    const gk = document.querySelector(`[data-sub-input="${idBase}-gk"]`);
    const ge = document.querySelector(`[data-sub-input="${idBase}-ge"]`);
    const koeff = (gk && gk.value.trim()) || '', exp = (ge && ge.value.trim()) || '';
    const any = led.some(v => v) || koeff || exp;
    return any ? { led, koeff, exp } : null;
  }
  return null;
}

function restoreSubAnswer(qNum, subIdx, s, val){
  if(val === null || val === undefined) return;
  const idBase = `q${qNum}-s${subIdx}`;
  if(s.type === 'binary'){
    const btn = document.querySelector(`[data-sub-id="${idBase}"] [data-val="${val}"]`);
    if(btn){
      btn.classList.add('is-selected');
      // Wire others to deselect
    }
  } else if(s.type === 'sum' || s.type === 'product'){
    if(Array.isArray(val)){
      val.forEach((v,i) => {
        const inp = document.querySelector(`[data-sub-input="${idBase}-${i}"]`);
        if(inp) inp.value = v;
      });
    }
  } else if(s.type === 'primfakt'){
    const inp = document.querySelector(`[data-sub-input="${idBase}-str"]`);
    if(inp) inp.value = val;
  } else if(s.type === 'gata'){
    const inp = document.querySelector(`[data-sub-input="${idBase}-val"]`);
    if(inp) inp.value = val;
  } else if(s.type === 'numeric'){
    const inp = document.querySelector(`[data-sub-input="${idBase}-num"]`);
    if(inp) inp.value = val;
  } else if(s.type === 'brak'){
    if(Array.isArray(val)){
      const t = document.querySelector(`[data-sub-input="${idBase}-t"]`); if(t) t.value = val[0] || '';
      const n = document.querySelector(`[data-sub-input="${idBase}-n"]`); if(n) n.value = val[1] || '';
    }
  } else if(s.type === 'mellanled'){
    if(val && val.led){
      val.led.forEach((l, i) => {
        const t = document.querySelector(`[data-sub-input="${idBase}-L${i}-t"]`); if(t) t.value = l[0] || '';
        const n = document.querySelector(`[data-sub-input="${idBase}-L${i}-n"]`); if(n) n.value = l[1] || '';
      });
      const st = document.querySelector(`[data-sub-input="${idBase}-st"]`); if(st) st.value = (val.slut && val.slut[0]) || '';
      const sn = document.querySelector(`[data-sub-input="${idBase}-sn"]`); if(sn) sn.value = (val.slut && val.slut[1]) || '';
    }
  } else if(s.type === 'mellanled-num'){
    if(val && val.led){
      val.led.forEach((v, i) => {
        const el = document.querySelector(`[data-sub-input="${idBase}-L${i}-num"]`); if(el) el.value = v || '';
      });
      const sEl = document.querySelector(`[data-sub-input="${idBase}-snum"]`); if(sEl) sEl.value = val.slut || '';
    }
  } else if(s.type === 'gp'){
    if(val){
      (val.led || []).forEach((v, i) => { const el = document.querySelector(`[data-sub-input="${idBase}-L${i}-num"]`); if(el) el.value = v || ''; });
      const gk = document.querySelector(`[data-sub-input="${idBase}-gk"]`); if(gk) gk.value = val.koeff || '';
      const ge = document.querySelector(`[data-sub-input="${idBase}-ge"]`); if(ge) ge.value = val.exp || '';
    }
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.test-sub-binary-btn');
  if(!btn) return;
  const row = btn.closest('.test-sub-binary-row');
  if(!row) return;
  row.querySelectorAll('.test-sub-binary-btn').forEach(b => b.classList.remove('is-selected'));
  btn.classList.add('is-selected');
});

function gradeSub(s, ans){
  if(ans === null || ans === undefined || ans === '') return {status:'skipped'};

  if(s.type === 'binary'){
    return {status: ans === s.answer ? 'correct' : 'wrong', given: ans};
  }
  if(s.type === 'sum'){
    if(!Array.isArray(ans)) return {status:'skipped'};
    const nums = ans.map(v => parseInt(v));
    if(nums.some(isNaN) || nums.length !== s.antal) return {status:'wrong', given: ans.join(' + ')};
    if(nums.some(n => n < 1)) return {status:'wrong', given: ans.join(' + ')};
    const sum = nums.reduce((a,b) => a+b, 0);
    return {status: sum === s.target ? 'correct' : 'wrong', given: ans.join(' + ')};
  }
  if(s.type === 'product'){
    if(!Array.isArray(ans)) return {status:'skipped'};
    const nums = ans.map(v => parseInt(v));
    if(nums.some(isNaN) || nums.length !== s.antal) return {status:'wrong', given: ans.join(' · ')};
    if(nums.some(n => n < 2)) return {status:'wrong', given: ans.join(' · ')};
    const prod = nums.reduce((a,b) => a*b, 1);
    return {status: prod === s.target ? 'correct' : 'wrong', given: ans.join(' · ')};
  }
  if(s.type === 'primfakt'){
    // Eleven skrev "2·2·3" eller "2 · 2 · 3" – parsa
    const cleaned = String(ans).replace(/\s/g,'').replace(/[·*x×]/g,',');
    const parts = cleaned.split(',').map(p => parseInt(p)).filter(n => !isNaN(n));
    if(parts.length === 0) return {status:'wrong', given: ans};
    if(parts.some(n => !isPrime(n))) return {status:'wrong', given: ans};
    const prod = parts.reduce((a,b) => a*b, 1);
    return {status: prod === s.target ? 'correct' : 'wrong', given: ans};
  }
  if(s.type === 'gata'){
    const num = parseInt(ans);
    if(isNaN(num)) return {status:'wrong', given: ans};
    if(num === s.answer || (s.alt && s.alt.includes(num))) return {status:'correct', given: String(num)};
    return {status:'wrong', given: String(num)};
  }
  if(s.type === 'numeric'){
    const v = parseFloat(String(ans).replace(',','.').replace(/[−–—]/g,'-').replace(/\s/g,''));
    if(isNaN(v)) return {status:'wrong', given: String(ans)};
    return {status: Math.abs(v - s.answer) < 1e-6 ? 'correct' : 'wrong', given: String(ans)};
  }
  if(s.type === 'brak'){
    if(!Array.isArray(ans)) return {status:'skipped'};
    const t = parseInt(ans[0]), n = parseInt(ans[1]);
    if(isNaN(t) || isNaN(n) || n === 0) return {status:'wrong', given: (ans[0]||'?')+'/'+(ans[1]||'?')};
    const vardeOk = (t * s.namn === n * s.talj);   // t/n === talj/namn (samma värde)
    const enklast = (gcd(t, n) === 1);             // enklaste form (gcd=1)
    return {status: (vardeOk && enklast) ? 'correct' : 'wrong', given: t+'/'+n};
  }
  if(s.type === 'mellanled'){
    if(!ans || !ans.led) return {status:'skipped'};
    // Varje LED rättas på VÄRDE (valfri giltig korsförkortning godtas) — speglat från drillens mellanRatt.
    const ledOk = (s.led || []).every((L, i) => {
      const t = parseInt(ans.led[i] && ans.led[i][0]), n = parseInt(ans.led[i] && ans.led[i][1]);
      if(isNaN(t) || isNaN(n) || n === 0) return false;
      return Math.abs(t / n - L.varde) < 1e-9;
    });
    // SLUTSVAR på värde + enklaste form — speglat från drillens svarRatt.
    const st = parseInt(ans.slut && ans.slut[0]), sn = parseInt(ans.slut && ans.slut[1]);
    const slutOk = !isNaN(st) && !isNaN(sn) && sn !== 0
      && (st * s.slutNamn === sn * s.slutTalj) && (gcd(st, sn) === 1);
    const given = (s.led || []).map((L, i) => (ans.led[i] ? ans.led[i].join('/') : '?'))
      .concat([ans.slut ? ans.slut.join('/') : '?']).join(' → ');
    return {status: (ledOk && slutOk) ? 'correct' : 'wrong', given: given};
  }
  if(s.type === 'mellanled-num'){
    if(!ans || !ans.led) return {status:'skipped'};
    const num = (x) => parseFloat(String(x).replace(',','.').replace(/[−–—]/g,'-').replace(/\s/g,''));
    // Varje LED rättas på VÄRDE (valfri giltig väg godtas) — samma princip som bråk-mellanledet.
    const ledOk = (s.led || []).every((L, i) => {
      const v = num(ans.led[i]);
      return !isNaN(v) && Math.abs(v - L.varde) < 1e-6;
    });
    const sv = num(ans.slut);
    const slutOk = !isNaN(sv) && Math.abs(sv - s.slutVarde) < 1e-6;
    const given = (s.led || []).map((L, i) => (ans.led[i] != null && ans.led[i] !== '' ? ans.led[i] : '?'))
      .concat([ans.slut != null && ans.slut !== '' ? ans.slut : '?']).join(' → ');
    return {status: (ledOk && slutOk) ? 'correct' : 'wrong', given: given};
  }
  if(s.type === 'gp'){
    if(!ans) return {status:'skipped'};
    const num = (x) => parseFloat(String(x).replace(',','.').replace(/[−–—]/g,'-').replace(/\s/g,''));
    const ledOk = (s.led || []).every((L, i) => { const v = num(ans.led && ans.led[i]); return !isNaN(v) && Math.abs(v - L.varde) < 1e-6; });
    const koeff = num(ans.koeff), exp = parseInt(ans.exp);
    // FORM-MEDVETEN (speglar drillens gp-check): koeff normaliserad [1,10) + rätt koeff/exponent (15·10¹⁷ underkänns → 1,5·10¹⁸).
    const slutOk = !isNaN(koeff) && koeff >= 1 && koeff < 10 && !isNaN(exp)
      && Math.abs(koeff - s.slutKoeff) < 1e-9 && exp === s.slutExp;
    const given = (s.led || []).map((L, i) => (ans.led && ans.led[i] != null && ans.led[i] !== '' ? ans.led[i] : '?'))
      .concat([(ans.koeff || '?') + '·10^' + (ans.exp || '?')]).join(' → ');
    return {status: (ledOk && slutOk) ? 'correct' : 'wrong', given: given};
  }
  return {status:'skipped'};
}

function renderReviewSub(sr){
  const {sub, result} = sr;
  const cls = result.status; // correct, wrong, skipped
  const icon = result.status === 'correct' ? '✓' : result.status === 'wrong' ? '✗' : '–';

  let questionText = '';
  let correctAnswerText = '';

  if(sub.type === 'binary'){
    questionText = sub.prompt || sub.q;
    correctAnswerText = sub.answer + (sub.explanation ? ` — ${sub.explanation}` : '');
  } else if(sub.type === 'sum'){
    questionText = `${sub.target} = ___ + ___ + ___`;
    correctAnswerText = `Det finns många lösningar, t.ex. ${exempelTermer(sub.target, sub.antal).join(' + ')}.`;
  } else if(sub.type === 'product'){
    questionText = `${sub.target} = ___ · ___ · ___`;
    correctAnswerText = `Det finns flera lösningar, t.ex. ${exempelFaktorer(sub.target, sub.antal).join(' · ')}.`;
  } else if(sub.type === 'primfakt'){
    questionText = `Primtalsfaktorisera ${sub.target}`;
    correctAnswerText = `${sub.target} = ${sub.answerStr}`;
  } else if(sub.type === 'gata'){
    questionText = `Gåta: ${sub.clues.join(' ')}`;
    correctAnswerText = `Talet är ${sub.answer}${sub.alt && sub.alt.length ? ` (eller ${sub.alt.join(', ')})` : ''}.`;
  } else if(sub.type === 'numeric'){
    questionText = sub.prompt;
    correctAnswerText = komma(sub.answer) + (sub.enhet ? ` ${sub.enhet}` : '') + (sub.explanation ? ` — ${sub.explanation}` : '');
  } else if(sub.type === 'brak'){
    questionText = sub.prompt;
    correctAnswerText = sub.talj + '/' + sub.namn + ' (enklaste form)' + (sub.explanation ? ` — ${sub.explanation}` : '');
  } else if(sub.type === 'mellanled'){
    questionText = sub.prompt;
    const ledFacit = (sub.led || []).map(L => L.facit || (L.varde)).join(' → ');
    correctAnswerText = (ledFacit ? ledFacit + ' → ' : '') + sub.slutTalj + '/' + sub.slutNamn + ' (enklaste form)' + (sub.explanation ? ` — ${sub.explanation}` : '');
  } else if(sub.type === 'mellanled-num'){
    questionText = sub.prompt;
    const ledFacit = (sub.led || []).map(L => L.facit != null ? L.facit : L.varde).join(' → ');
    correctAnswerText = (ledFacit ? ledFacit + ' → ' : '') + komma(sub.slutVarde) + (sub.slutHint ? ` (${sub.slutHint})` : '') + (sub.explanation ? ` — ${sub.explanation}` : '');
  } else if(sub.type === 'gp'){
    questionText = sub.prompt;
    const ledFacit = (sub.led || []).map(L => L.facit != null ? L.facit : L.varde).join(' → ');
    correctAnswerText = (ledFacit ? ledFacit + ' → ' : '') + komma(sub.slutKoeff) + '·10^' + sub.slutExp + ' (grundpotensform)' + (sub.explanation ? ` — ${sub.explanation}` : '');
  }

  return `
    <div class="test-review-sub ${cls}">
      <div class="test-review-sub-icon">${icon}</div>
      <div class="test-review-sub-body">
        ${sub.label ? `<div class="test-review-sub-label">${sub.label}</div>` : ''}
        <div class="test-review-sub-q">${questionText}</div>
        <div class="test-review-sub-ans">
          ${result.status === 'wrong' ? `Ditt svar: <span class="your">${result.given || '(tomt)'}</span> · ` : ''}
          ${result.status === 'skipped' ? '<span style="font-style:italic">Överhoppad. </span>' : ''}
          ${result.status !== 'correct' ? `Rätt svar: <span class="corr">${correctAnswerText}</span>` : `<span class="corr">${correctAnswerText.split('—')[0].trim() || 'Rätt!'}</span>`}
        </div>
      </div>
    </div>
  `;
}

function exempelTermer(target, antal){
  // Bara en exempel-uppdelning
  const result = [];
  let remaining = target;
  for(let i=0;i<antal-1;i++){
    const v = Math.max(1, Math.floor(remaining / (antal-i)));
    result.push(v);
    remaining -= v;
  }
  result.push(remaining);
  return result;
}

function exempelFaktorer(target, antal){
  const pf = primeFactorize(target);
  if(pf.length === antal) return pf;
  if(pf.length > antal){
    // Slå ihop några
    const result = pf.slice(0, antal-1);
    const rest = pf.slice(antal-1).reduce((a,b) => a*b, 1);
    result.push(rest);
    return result;
  }
  // pf.length < antal - kan inte alltid göra antal faktorer
  return pf;
}

  // ══════════════════════════════════════════════════════════════════════════════
  //  montera(config) — en instans av provbyggaren, bunden till ett kapitels content.
  //  config: { taxonomi, bokDelkapitel, generators, genNod, mastery, nav:{navTo,showView,
  //           updateTutorContext}, forelasningTips? , fargInfo?, formagaNamn? }
  // ══════════════════════════════════════════════════════════════════════════════
  function montera(config){
    function resolveTax(){ var t=config.taxonomi; return (typeof t==='function')?t():t; }
    function resolveMastery(){ var m=config.mastery; return (typeof m==='function')?m():m; }
    var TEST_GENERATORS = config.generators;        // content
    var GEN_NOD         = config.genNod;            // content
    var BOK_DELKAPITEL  = config.bokDelkapitel;     // bok-delkapitel-gruppering
    var FORELASNING_TIPS= config.forelasningTips || {};
    var FARG_INFO_C     = config.fargInfo || FARG_INFO;
    var FORMAGA_NAMN_C  = config.formagaNamn || FORMAGA_NAMN;
    var state = { testConfig:{ antal:6, typ:'snabb', del:null, nodes:null, fargFilter:[], collapsed:null, varianter:{}, _preselectDel:false }, test:null };
    function navTo(v,o){ return config.nav.navTo(v, o||{}); }
    function showView(v){ return config.nav.showView(v); }
    function updateTutorContext(){ if(config.nav.updateTutorContext) config.nav.updateTutorContext(); }

const NOD_GENS = {};
Object.keys(TEST_GENERATORS).forEach(function(ko){
  ['snabb','problem'].forEach(function(kind){
    (TEST_GENERATORS[ko][kind] || []).forEach(function(gen){
      let node = null;
      try { const probe = gen(new Set()); if(probe) node = GEN_NOD[probe.generator]; } catch(e){}
      if(node){ (NOD_GENS[node] = NOD_GENS[node] || []).push({ko:ko, gen:gen, kind:kind}); }
    });
  });
});

function nodFargState(node, matris){
  if(!(resolveMastery() && resolveMastery().masteryState)) return 0;
  return resolveMastery().masteryState((matris||{})[node], null, false, false);
}

function generateTest(config){
  const {antal, typ} = config;
  const nodes = config.nodes || [];
  let numProblem = 0, numSnabb = antal;
  if(typ === 'snabb-och-problem'){
    numProblem = Math.max(1, Math.round(antal * 0.3));
    numSnabb = antal - numProblem;
  }

  const seen = new Set();
  const questions = [];

  // Bygg snabbfrågor – plocka från generatorerna för de valda FÄRDIGHETERNA (noderna), slumpa
  const snabbGens = [];
  nodes.forEach(function(node){
    (NOD_GENS[node] || []).forEach(function(g){ if(g.kind === 'snabb') snabbGens.push({gen:g.gen, node:node}); });
  });
  const variantFor = (node) => ({ variant: (config.varianter || {})[node] });

  // antal = SVARBARA ITEMS (a–d-uppgifter), inte frågemallar. Räkna subs mot totalen och trunkera
  // sista frågan så att exakt `antal` items byggs ("6" → 6 saker att svara på).
  const snabbItems = () => questions.filter(q => q.kind === 'snabb').reduce((s,q) => s + q.subs.length, 0);
  // Slumpa men inte samma generator för många gånger i rad
  if(snabbGens.length){
    let gensShuffled = shuffle([...snabbGens]);
    let gIdx = 0;
    let safetyCounter = 0;
    while(snabbItems() < numSnabb && safetyCounter < 100){
      safetyCounter++;
      const {gen, node} = gensShuffled[gIdx % gensShuffled.length];
      gIdx++;
      const q = gen(seen, variantFor(node));
      if(q && q.subs && q.subs.length){
        q.kind = 'snabb';
        const kvar = numSnabb - snabbItems();
        if(q.subs.length > kvar) q.subs = q.subs.slice(0, kvar);   // trunkera sista frågan → exakt antalet
        if(q.subs.length) questions.push(q);
      }
      if(gIdx >= gensShuffled.length){
        gensShuffled = shuffle([...snabbGens]);
        gIdx = 0;
      }
    }
  }

  // Bygg problemfrågor – från de valda färdigheternas problem-generatorer
  const problemGens = [];
  nodes.forEach(function(node){
    (NOD_GENS[node] || []).forEach(function(g){ if(g.kind === 'problem') problemGens.push({gen:g.gen, node:node}); });
  });

  const problemItems = () => questions.filter(q => q.kind === 'problem').reduce((s,q) => s + q.subs.length, 0);
  safetyCounter = 0;
  while(problemItems() < numProblem && safetyCounter < 100){
    safetyCounter++;
    if(problemGens.length === 0) break;
    const {gen, node} = randPick(problemGens);
    const q = gen(seen, variantFor(node));
    if(q && q.subs && q.subs.length){
      q.kind = 'problem';
      const kvar = numProblem - problemItems();
      if(q.subs.length > kvar) q.subs = q.subs.slice(0, kvar);
      if(q.subs.length) questions.push(q);
    } else {
      // No more available
      break;
    }
  }

  // Numrera
  questions.forEach((q, i) => q.number = i + 1);
  return questions;
}

function renderTestConfig(){
  state.currentKO = null;
  state.currentFormaga = null;

  const cfg = state.testConfig;
  const numProblem = cfg.typ === 'snabb-och-problem' ? Math.max(1, Math.round(cfg.antal * 0.3)) : 0;
  const numSnabb = cfg.antal - numProblem;

  // TAXONOMI-DRIVEN: väljaren speglar BOKENS delkapitel (taxonomins visning.utbudslista d1–d8), precis
  // som kartan/delkapitel-sidorna — inte ram-modellens DELAR_KO. Byggbar = noden har en test-generator
  // (NOD_GENS, bunden till samma fina bok-nod som kartan färgar). Kapitelnivå primär; ?del= filtrerar
  // till ETT bok-delkapitel; färg-filtret verkar över det visade.
  const TAX = (resolveTax() && resolveTax().noder) || [];
  const matris = (resolveMastery() && resolveMastery().lasMatris) ? resolveMastery().lasMatris() : {};
  const delFilter = (cfg.del && BOK_DELKAPITEL.some(d => d.del === cfg.del)) ? cfg.del : null;
  const delNamn = delFilter ? BOK_DELKAPITEL.find(d => d.del === delFilter).titel : null;
  const bokNoder = TAX.filter(n => n.niva === 'lovnod' && n.visning && n.visning.utbudslista);

  function minGruppOrd(nodes, g){
    return Math.min.apply(null, nodes.filter(n => (n.visning.grupp || 'Övrigt') === g).map(n => n.visning.gruppordning || 0));
  }
  function radAv(n){
    const byggbar = !!NOD_GENS[n.id];
    return { node: n.id, etikett: (n.kartLabel || n.namn), formaga: (n.visning.etikett || ''),
             byggbar, farg: byggbar ? nodFargState(n.id, matris) : null };
  }
  const delkapitel = BOK_DELKAPITEL
    .filter(d => !delFilter || d.del === delFilter)
    .map(d => {
      const dn = bokNoder.filter(n => n.visning.utbudslista === d.del);
      const gnamn = [];
      dn.forEach(n => { const g = n.visning.grupp || 'Övrigt'; if(gnamn.indexOf(g) < 0) gnamn.push(g); });
      gnamn.sort((a, b) => minGruppOrd(dn, a) - minGruppOrd(dn, b));
      const undergrupper = gnamn.map(g => ({
        namn: g,
        rader: dn.filter(n => (n.visning.grupp || 'Övrigt') === g)
                 .sort((x, y) => (x.visning.radordning || 0) - (y.visning.radordning || 0))
                 .map(radAv)
      }));
      return { del: d.del, titel: d.titel, undergrupper };
    })
    .filter(d => d.undergrupper.length);

  const allaRader = [].concat.apply([], delkapitel.map(d => [].concat.apply([], d.undergrupper.map(u => u.rader))));
  const byggbara = allaRader.filter(r => r.byggbar);

  // Default-hopfällning: kollapsa delkapitel utan byggbara färdigheter (håller vyn överblickbar).
  if(cfg.collapsed === null){
    cfg.collapsed = delkapitel.filter(d => !d.undergrupper.some(u => u.rader.some(r => r.byggbar))).map(d => d.del);
  }

  // OPT-IN: inget förvalt från start (fargFilter tom). Färg-chip bulk-väljer; ?del= förväljer delkapitlet.
  function synkaFranFilter(){
    cfg.nodes = byggbara.filter(r => cfg.fargFilter.includes(r.farg)).map(r => r.node);
  }
  if(cfg.nodes === null){
    if(cfg._preselectDel && delFilter){ cfg.nodes = byggbara.map(r => r.node); cfg._preselectDel = false; }   // deeplink → förvälj delkapitlet
    else synkaFranFilter();
  }
  const valda = cfg.nodes || [];

  // Variant-väljare: en nod kan DEKLARERA varianter (config.varianter). Visas INLINE vid sin färdighet
  // i Färdigheter-listan när noden är vald (ej topp-panel). Valet lagras i cfg.varianter[nod].
  const varDekl = config.varianter || {};

  document.getElementById('test-config-body').innerHTML = `
    <div class="header-card">
      <div class="header-eyebrow">${config.eyebrow || 'Kapitel 1 · Taluppfattning'}</div>
      <h1 class="header-title">Skapa ditt eget test</h1>
      <p class="header-sub">Här ser du <strong>hela kapitlets</strong> färdigheter, grupperade efter <strong>bokens delkapitel</strong> – samma struktur som kartan. Fäll ihop det du inte vill se, filtrera på delkapitel eller mastery-färg för att fokusera (t.ex. alla dina orange färdigheter). Provet görs på skärmen; det rättas och färgar kartan.</p>
    </div>

    ${cfg.del ? `<div class="config-filter-note">Filtrerat till delkapitlet <strong>${delNamn}</strong>. <button class="cfn-clear" id="clear-del">Visa hela kapitlet</button></div>` : ''}

    <div class="test-config-card">
      <h3>Antal uppgifter</h3>
      <p class="config-desc">Så många uppgifter (a, b, c …) att svara på – de grupperas i frågor.</p>
      <div class="config-options" id="config-antal">
        ${[3,6,10,14].map(n => `
          <button class="config-option ${cfg.antal===n?'is-selected':''}" data-antal="${n}">
            ${n} uppgifter
          </button>
        `).join('')}
      </div>
    </div>

    <div class="test-config-card">
      <h3>Typ av frågor</h3>
      <p class="config-desc">Snabbfrågor är räkning och begrepp. Problemlösning kräver att man tänker längre.</p>
      <div class="config-options" id="config-typ">
        <button class="config-option ${cfg.typ==='snabb'?'is-selected':''}" data-typ="snabb">
          Bara snabbfrågor
        </button>
        <button class="config-option ${cfg.typ==='snabb-och-problem'?'is-selected':''}" data-typ="snabb-och-problem">
          Snabbfrågor + problem
        </button>
      </div>
    </div>

    <div class="test-config-card">
      <h3>Visa färger</h3>
      <p class="config-desc">Välj vilka mastery-färger som ska förväljas – som på kartan. T.ex. bara orange (halvlärt) eller allt utom grönt. Verkar över hela kapitlet.</p>
      <div class="config-options" id="config-farg">
        ${FARG_INFO.map((f,i) => `
          <button class="config-option ${cfg.fargFilter.includes(i)?'is-selected':''}" data-farg="${i}">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${f.bg};margin-right:7px;vertical-align:-1px;"></span>${f.namn}
          </button>
        `).join('')}
      </div>
    </div>

    <div class="test-config-card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <h3 style="margin:0;">Färdigheter</h3>
        <button class="cfn-clear" id="toggle-all-groups">${cfg.collapsed.length >= delkapitel.length ? 'Fäll ut alla' : 'Fäll ihop alla'}</button>
      </div>
      <p class="config-desc">Grupperat efter <strong>bokens delkapitel</strong> – samma struktur som kartan. Färgprickar visar hur långt du kommit; färdigheter utan test-generator är märkta "byggs".</p>
      <div id="config-grupper">
        ${delkapitel.map(d => {
          const dRader = [].concat.apply([], d.undergrupper.map(u => u.rader));
          const dByggbara = dRader.filter(r => r.byggbar);
          const dValda = dRader.filter(r => valda.includes(r.node));
          const collapsed = cfg.collapsed.includes(d.del);
          return `
            <div class="config-group ${collapsed?'is-collapsed':''}">
              <div class="config-group-head" data-del="${d.del}">
                <span class="cg-chev">${collapsed?'▸':'▾'}</span>
                <span class="cg-titel"><span class="cg-delnr">Del ${d.del.replace(/^.*?(\d+)$/, '$1')}</span> ${d.titel}</span>
                <span class="cg-meta">${dByggbara.length ? `${dValda.length}/${dByggbara.length} valda` : 'byggs'}</span>
              </div>
              <div class="config-group-body">
                ${d.undergrupper.map(u => `
                  <div class="cg-subhead">${u.namn}</div>
                  ${u.rader.map(f => {
                    const checked = valda.includes(f.node);
                    const dimmed = f.byggbar && !checked && cfg.fargFilter.length && !cfg.fargFilter.includes(f.farg);
                    const dot = f.byggbar
                      ? `<span class="cb-dot" style="background:${FARG_INFO[f.farg].bg};" title="${FARG_INFO[f.farg].namn}"></span>`
                      : `<span class="cb-dot" style="background:transparent;border-style:dashed;box-shadow:none;"></span>`;
                    const vdek = varDekl[f.node];
                    const variantInline = (vdek && checked && vdek.alternativ && vdek.alternativ.length) ? `
                      <div class="config-variant-inline">
                        <span class="cvi-label">${vdek.titel}</span>
                        <div class="config-options config-variant" data-node="${f.node}">
                          ${vdek.alternativ.map(a => `<button class="config-option ${(cfg.varianter[f.node]||vdek.alternativ[0].key)===a.key?'is-selected':''}" data-vkey="${a.key}">${a.label}</button>`).join('')}
                        </div>
                      </div>` : '';
                    return `
                      <div class="config-checkbox ${checked?'is-checked':''} ${!f.byggbar?'is-disabled':''} ${dimmed?'is-dimmed':''}" data-node="${f.node}" ${!f.byggbar?'title="Byggs – ingen test-generator ännu"':''}>
                        ${dot}
                        <div class="cb-text">${f.etikett}${f.formaga?`<span class="cb-sub">${f.formaga}</span>`:''}${!f.byggbar?'<span class="cb-stub">byggs</span>':''}</div>
                        <div class="cb-square">${checked?'✓':''}</div>
                      </div>
                      ${variantInline}
                    `;
                  }).join('')}
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="config-summary">
      Du får <strong>${cfg.antal} uppgifter</strong>${cfg.typ==='snabb-och-problem'?` (${numSnabb} snabb + ${numProblem} problem)`:''} från <strong>${valda.length}</strong> ${valda.length===1?'vald färdighet':'valda färdigheter'}${delNamn?` i ${delNamn.toLowerCase()}`:' i kapitlet'}.
    </div>

    <div style="text-align:center;margin-top:18px;">
      <button class="btn primary" id="generate-test-btn" ${valda.length===0?'disabled':''}>Skapa test -></button>
    </div>
  `;

  document.querySelectorAll('#config-antal .config-option').forEach(btn => {
    btn.onclick = () => { cfg.antal = parseInt(btn.dataset.antal); renderTestConfig(); };
  });
  document.querySelectorAll('#config-typ .config-option').forEach(btn => {
    btn.onclick = () => { cfg.typ = btn.dataset.typ; renderTestConfig(); };
  });
  // Färg-chip: toggla färgen och HÄRLED urvalet på nytt (nodes=null → synk vid nästa render).
  document.querySelectorAll('#config-farg .config-option').forEach(btn => {
    btn.onclick = () => {
      const i = parseInt(btn.dataset.farg);
      if(cfg.fargFilter.includes(i)) cfg.fargFilter = cfg.fargFilter.filter(x => x !== i);
      else cfg.fargFilter = cfg.fargFilter.concat(i);
      cfg.nodes = null; // härled om ur filtret
      renderTestConfig();
    };
  });
  // Variant-chip: lagra valet för noden (skickas till dess generator i generateTest).
  document.querySelectorAll('#test-config-body .config-variant .config-option').forEach(btn => {
    btn.onclick = () => {
      const wrap = btn.closest('.config-variant');
      cfg.varianter = Object.assign({}, cfg.varianter, { [wrap.dataset.node]: btn.dataset.vkey });
      renderTestConfig();
    };
  });
  // Gruppuvud: fäll ihop / ut delkapitlet.
  document.querySelectorAll('#config-grupper .config-group-head').forEach(head => {
    head.onclick = () => {
      const del = head.dataset.del;
      if(cfg.collapsed.includes(del)) cfg.collapsed = cfg.collapsed.filter(x => x !== del);
      else cfg.collapsed = cfg.collapsed.concat(del);
      renderTestConfig();
    };
  });
  const toggleAll = document.getElementById('toggle-all-groups');
  if(toggleAll) toggleAll.onclick = () => {
    cfg.collapsed = cfg.collapsed.length >= delkapitel.length ? [] : delkapitel.map(d => d.del);
    renderTestConfig();
  };
  const clearDel = document.getElementById('clear-del');
  if(clearDel) clearDel.onclick = () => { cfg.del = null; cfg.nodes = null; renderTestConfig(); };
  // Färdighet-checkbox: manuell finjustering (byggbar = klickbar), lämnar filtret orört.
  document.querySelectorAll('#config-grupper .config-checkbox').forEach(cb => {
    cb.onclick = () => {
      if(cb.classList.contains('is-disabled')) return;
      const node = cb.dataset.node;
      const cur = cfg.nodes || [];
      cfg.nodes = cur.includes(node) ? cur.filter(x => x !== node) : cur.concat(node);
      renderTestConfig();
    };
  });
  document.getElementById('generate-test-btn').onclick = () => {
    if((cfg.nodes || []).length === 0) return;
    const questions = generateTest(cfg);
    state.test = {
      questions,
      answers: {},
      currentIdx: -1, // -1 = översikt
      startedAt: Date.now()
    };
    navTo('test-take');
  };

  showView('test-config');
  updateTutorContext();
}

function renderTestTake(){
  if(!state.test) { navTo('test-config'); return; }
  const t = state.test;
  document.getElementById('test-take-back').onclick = (e) => {
    e.preventDefault();
    navTo('test-config');
  };

  const body = document.getElementById('test-take-body');

  // Visa översikt
  if(t.currentIdx === -1){
    body.innerHTML = `
      <div class="test-overview">
        <h2>Ditt test – ${t.questions.length} frågor</h2>
        <p class="ov-desc">Här är översikten. När du börjar tar du en fråga i taget. Du behöver inte svara på alla – det går bra att hoppa över.</p>
        <div class="test-question-list">
          ${t.questions.map(q => `
            <div class="test-ql-item">
              <div class="test-ql-num">${q.number}</div>
              <div class="test-ql-text">
                ${q.title}
                ${q.kind === 'problem' ? '<span class="tag problem">Problem</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
          <button class="btn primary" id="start-test">Börja testet -></button>
          <button class="btn" onclick="window.print()">Skriv ut</button>
          <button class="btn subtle" onclick="navTo('test-config')">Ändra inställningar</button>
        </div>
      </div>
    `;
    document.getElementById('start-test').onclick = () => {
      t.currentIdx = 0;
      renderTestTake();
    };
    showView('test-take');
    return;
  }

  // Visa fråga
  const q = t.questions[t.currentIdx];
  const progressPct = ((t.currentIdx) / t.questions.length) * 100;

  body.innerHTML = `
    <div class="test-progress-bar">
      <span class="tp-label">Fråga <span class="tp-num">${q.number}</span> av <span class="tp-num">${t.questions.length}</span></span>
      <div class="test-progress-fill"><div style="width:${progressPct}%"></div></div>
      <span class="tp-label">${Math.round(progressPct)}%</span>
    </div>

    <div class="test-take-question">
      <div class="test-take-num">Fråga ${q.number}${q.kind==='problem'?' · Problemlösning':''}</div>
      <h2 class="test-take-title">${q.title}</h2>
      <div class="test-sub-list">
        ${q.subs.map((s,i) => renderSubInput(q.number, i, s)).join('')}
      </div>
      <div class="test-take-actions">
        <div class="left-actions">
          <button class="btn subtle" id="prev-q" ${t.currentIdx===0?'disabled':''}><- Föregående</button>
        </div>
        <div class="right-actions">
          <button class="btn" id="skip-q">Hoppa över</button>
          <button class="btn primary" id="next-q">${t.currentIdx === t.questions.length-1 ? 'Klar – se resultat' : 'Nästa fråga ->'}</button>
        </div>
      </div>
    </div>
  `;

  // Restore tidigare svar om finns
  q.subs.forEach((s,i) => {
    const key = `q${q.number}-s${i}`;
    if(t.answers[key] !== undefined) restoreSubAnswer(q.number, i, s, t.answers[key]);
  });

  document.getElementById('prev-q').onclick = () => {
    saveCurrentAnswers();
    t.currentIdx--;
    renderTestTake();
  };
  document.getElementById('skip-q').onclick = () => {
    // skip = lämna svar tomma
    q.subs.forEach((s,i) => {
      const key = `q${q.number}-s${i}`;
      if(t.answers[key] === undefined) t.answers[key] = null; // explicit skipped
    });
    advance();
  };
  document.getElementById('next-q').onclick = () => {
    saveCurrentAnswers();
    advance();
  };

  function advance(){
    if(t.currentIdx === t.questions.length - 1){
      navTo('test-result');
    } else {
      t.currentIdx++;
      renderTestTake();
    }
  }

  function saveCurrentAnswers(){
    q.subs.forEach((s,i) => {
      const key = `q${q.number}-s${i}`;
      t.answers[key] = readSubAnswer(q.number, i, s);
    });
  }

  showView('test-take');
}

function renderTestResult(){
  if(!state.test) { navTo('test-config'); return; }
  const t = state.test;
  const body = document.getElementById('test-result-body');

  // Grade alla
  let correctCount = 0, wrongCount = 0, skippedCount = 0;
  const graded = t.questions.map(q => {
    const subResults = q.subs.map((s,i) => {
      const key = `q${q.number}-s${i}`;
      const result = gradeSub(s, t.answers[key]);
      if(result.status === 'correct') correctCount++;
      else if(result.status === 'wrong') wrongCount++;
      else skippedCount++;
      // LOGGA per nod → mastery-matrisen (SAMMA hook som drillarna via GEN_NOD) → färgar kartan.
      // En gång per prov (t.logged), bara försökta uppgifter (skippade loggas ej). Elev-lokalt, inget nät.
      if(!t.logged && result.status !== 'skipped' && GEN_NOD[q.generator] && resolveMastery() && resolveMastery().loggaForsok){
        resolveMastery().loggaForsok(GEN_NOD[q.generator], result.status === 'correct' ? 'ratt' : 'fel');
      }
      return {sub: s, result, key};
    });
    return {q, subResults};
  });
  t.logged = true;   // provet loggas en gång; om-rendering av resultatet dubbelloggar inte

  const totalSubs = correctCount + wrongCount + skippedCount;
  const pct = totalSubs > 0 ? Math.round(correctCount / totalSubs * 100) : 0;

  // Hitta vilka generatorer som hade fel/överhoppade för föreläsningstips
  const weakGens = new Set();
  graded.forEach(({q, subResults}) => {
    if(subResults.some(sr => sr.result.status !== 'correct')){
      weakGens.add(q.generator);
    }
  });

  let emoji, title, msg;
  if(totalSubs === 0){
    emoji = '🤷'; title = 'Inget besvarat'; msg = 'Du hoppade över alla frågor. Försök igen!';
  } else if(pct === 100){
    emoji = '🌟'; title = 'Alla rätt!'; msg = 'Helt felfritt – imponerande jobb!';
  } else if(pct >= 80){
    emoji = '🎉'; title = 'Riktigt bra!'; msg = `Du klarade ${correctCount} av ${totalSubs} deluppgifter. Nästan i mål.`;
  } else if(pct >= 60){
    emoji = '👍'; title = 'Bra jobbat!'; msg = `${correctCount} av ${totalSubs} rätt. Lite mer träning på det du missade.`;
  } else if(pct >= 40){
    emoji = '💪'; title = 'På väg!'; msg = `${correctCount} av ${totalSubs} rätt. Titta gärna på förklaringarna nedan.`;
  } else {
    emoji = '🌱'; title = 'Bra att du försökte'; msg = `${correctCount} av ${totalSubs} rätt. Det här är ett område att jobba lite mer på.`;
  }

  body.innerHTML = `
    <div class="test-result-header">
      <div class="test-result-emoji">${emoji}</div>
      <h2 class="test-result-title">${title}</h2>
      <div class="test-result-score">${correctCount} / ${totalSubs}</div>
      <p class="test-result-msg">${msg}</p>
    </div>

    ${graded.map(({q, subResults}) => {
      const hasWrong = subResults.some(sr => sr.result.status === 'wrong' || sr.result.status === 'skipped');
      const tip = hasWrong ? FORELASNING_TIPS[q.generator] : null;

      return `
        <div class="test-review-card">
          <div class="test-review-q-num">Fråga ${q.number}${q.kind==='problem'?' · Problem':''}</div>
          <h3 class="test-review-q-title">${q.title}</h3>
          ${subResults.map(sr => renderReviewSub(sr)).join('')}
          ${tip ? `
            <div class="test-review-suggestion">
              💡 Titta gärna på <a href="${tip.url}" target="_blank">${tip.titel}</a> för att repetera.
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}

    <div class="test-result-actions">
      <button class="btn primary" id="retry-test">Gör om samma test</button>
      <button class="btn" id="new-test">Nytt test</button>
      <button class="btn" onclick="window.print()">Skriv ut resultatet</button>
      <button class="btn subtle" onclick="navTo('kapitel')">Tillbaka till kapitlet</button>
    </div>
  `;

  document.getElementById('retry-test').onclick = () => {
    t.answers = {};
    t.currentIdx = -1;
    navTo('test-take');
  };
  document.getElementById('new-test').onclick = () => {
    state.test = null;
    navTo('test-config');
  };

  showView('test-result');
  updateTutorContext();
}

    return {
      render: { config: renderTestConfig, take: renderTestTake, result: renderTestResult },
      setDel: function(d){ state.testConfig.del = d; state.testConfig.nodes = null; state.testConfig.collapsed = null; state.testConfig._preselectDel = !!d; },
      state: state
    };
  }

  window.ProvbyggarMotor = {
    montera: montera,
    gen: { numeric: testNumericGen, flerval: testFlervalGen, product: testProductGen, brak: testBrakGen, mellanled: testMellanledGen, mellanledNum: testMellanledNumGen, gp: testGpGen }
  };
})();
