/* ============================================================
   FAMILJ B · MOTOR: faktorträd (metod)
   renderPrimtalMetod + makeTreeNode + _treeIdCounter + FAKTOR_L1.
   Byte-identiskt ur ak7-k1-ram.html UTOM ett anropsställe som nu
   skickar currentKO: koId till den parametriserade renderSummaryCard.
   Kräver metod-karna.js laddad först.
   ============================================================ */

let _treeIdCounter = 0;
function makeTreeNode(value, parent=null){
  return {id:'n'+(_treeIdCounter++), value, children:null, parent, isPrime: isPrime(value), errorMsg:null};
}

// Ritar två grenar (V) från varje förälders nedkant till respektive barns överkant.
// Render-tidsgeometri (barnens lägen varierar med underträdens bredd) -> SVG, inte CSS.
function drawTradGrenar(){
  if(typeof document === 'undefined' || !document.createElementNS) return;
  const container = document.getElementById('tree-container');
  if(!container || !container.getBoundingClientRect) return;
  container.style.position = 'relative';
  container.style.zIndex = '0';
  const gammal = container.querySelector('.tnode-svg');
  if(gammal) gammal.remove();
  const NS = 'http://www.w3.org/2000/svg';
  const crect = container.getBoundingClientRect();
  const sl = container.scrollLeft || 0, st = container.scrollTop || 0;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'tnode-svg');
  svg.style.cssText = 'position:absolute;left:0;top:0;width:' + (container.scrollWidth || container.clientWidth || 0)
    + 'px;height:' + (container.scrollHeight || container.clientHeight || 0)
    + 'px;overflow:visible;pointer-events:none;z-index:-1;';
  container.querySelectorAll('.tnode').forEach(function(tn){
    const kids = tn.querySelector(':scope > .tnode-children');
    const pLabel = tn.querySelector(':scope > .tnode-label');
    if(!kids || !pLabel) return;
    const pr = pLabel.getBoundingClientRect();
    const px = pr.left + pr.width/2 - crect.left + sl;
    const py = pr.bottom - crect.top + st;
    kids.querySelectorAll(':scope > .tnode').forEach(function(kid){
      const kl = kid.querySelector(':scope > .tnode-label');
      if(!kl) return;
      const kr = kl.getBoundingClientRect();
      const kx = kr.left + kr.width/2 - crect.left + sl;
      const ky = kr.top - crect.top + st;
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', px); line.setAttribute('y1', py);
      line.setAttribute('x2', kx); line.setAttribute('y2', ky);
      line.setAttribute('stroke', 'var(--ink-faint)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
    });
  });
  container.insertBefore(svg, container.firstChild);
}

function renderPrimtalMetod(body, koId){
  koId = koId || 'primtal';
  let level = 1;
  let treeRoot = null;
  let pendingInputs = {};
  let omgangResults = []; // {success: boolean per träd}
  let currentHadError = false; // har eleven gjort fel på detta träd?
  const OMGANG_SIZE = 3;

  // Nivå 1: enkla tal som ändå kräver minst två led (t.ex. 18, 32, 42).
  const FAKTOR_L1 = [12,16,18,20,24,27,28,30,32,36,40,42,45,48];
  function generateTarget(){
    if(level===1) return randPick(FAKTOR_L1);
    const pool = [];
    for(let n=8;n<=100;n++){
      if(FAKTOR_L1.indexOf(n)!==-1) continue;
      const len = primeFactorize(n).length;
      if(level===2 && len===3) pool.push(n);
      else if(level===3 && len>=4) pool.push(n);
    }
    return randPick(pool);
  }

  function startNew(){
    _treeIdCounter = 0;
    const target = generateTarget();
    treeRoot = makeTreeNode(target);
    treeRoot.isRoot = true;
    pendingInputs = {};
    currentHadError = false;
    render();
  }

  function isComplete(node){
    if(node.children){
      return node.children.every(isComplete);
    }
    return node.isPrime;
  }

  function getAllPrimeLeaves(node){
    if(node.children) return node.children.flatMap(getAllPrimeLeaves);
    return [node.value];
  }

  function renderNode(node){
    let html = `<div class="tnode" data-id="${node.id}">`;

    let labelClass = 'tnode-label';
    if(node.isRoot) labelClass += ' root';
    else if(node.isPrime) labelClass += ' prime';
    else if(node.children) labelClass += ' composite';
    else labelClass += ' composite';
    html += `<div class="${labelClass}">${node.value}</div>`;

    if(node.children){
      html += `<div class="tnode-children">`;
      html += node.children.map(renderNode).join('');
      html += `</div>`;
    } else if(!node.isPrime){
      const pi = pendingInputs[node.id] || {left:'',right:''};
      const errClass = node.errorMsg ? 'error' : '';
      html += `
        <div class="tnode-input-row">
          <span class="tnode-target">${node.value}</span>
          <span class="tnode-eq">=</span>
          <input class="tnode-input ${errClass}" type="text" inputmode="numeric" data-pi="${node.id}-left" value="${pi.left}" maxlength="3">
          <span class="tnode-mult">·</span>
          <input class="tnode-input ${errClass}" type="text" inputmode="numeric" data-pi="${node.id}-right" value="${pi.right}" maxlength="3">
          <button class="tnode-expand-btn" data-expand="${node.id}">Dela</button>
        </div>
        ${node.errorMsg?`<div style="font-size:12px;color:var(--error);margin-top:6px;text-align:center;">${node.errorMsg}</div>`:''}
      `;
    }

    html += `</div>`;
    return html;
  }

  function findNode(node, id){
    if(node.id===id) return node;
    if(node.children) for(const c of node.children){ const r=findNode(c,id); if(r) return r; }
    return null;
  }

  function expandNode(nodeId){
    const node = findNode(treeRoot, nodeId);
    if(!node) return;
    const pi = pendingInputs[nodeId];
    const a = parseInt(pi.left), b = parseInt(pi.right);
    node.errorMsg = null;
    if(!a || !b || a<2 || b<2){
      node.errorMsg = 'Båda faktorerna ska vara minst 2.';
      currentHadError = true;
    } else if(a*b !== node.value){
      node.errorMsg = `${a} · ${b} = ${a*b}, men vi vill ha ${node.value}.`;
      currentHadError = true;
    } else {
      node.children = [makeTreeNode(a, node), makeTreeNode(b, node)];
      delete pendingInputs[nodeId];
      const ts = getTutorScore(koId,'metod');
      ts.total++; ts.correct++;
    }
    render();
  }

  function showOmgangSummary(){
    const right = omgangResults.filter(x=>x).length;
    const total = omgangResults.length;
    const adj = adjustLevel(level, right, total);
    level = adj.level;

    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Metod · faktorträd', `Du klarade ${right} av ${total} träd utan misstag.`, level)}
        ${renderSummaryCard({right, total, level, levelChange: adj.change, currentKO: koId})}
      </div>
    `;
    document.getElementById('summary-next-btn').onclick = ()=>{
      omgangResults = [];
      startNew();
    };
  }

  function render(){
    const complete = isComplete(treeRoot);
    const primes = complete ? sortAsc(getAllPrimeLeaves(treeRoot)) : null;

    body.innerHTML = `
      <div class="exercise-card">
        ${exerciseHeader('Metod · faktorträd', `Träd ${omgangResults.length + 1} av ${OMGANG_SIZE} · skriv två faktorer och tryck Dela. Fortsätt tills bladnoderna är primtal (gröna).`, level)}
        <div class="tree-task">
          <div class="tree-prompt">Faktorisera <strong>${treeRoot.value}</strong> till primfaktorer</div>
          <div class="tree-instructions">Det finns flera vägar fram. Välj själv vilka faktorer du delar i.</div>
          <div class="tree-container" id="tree-container">
            ${renderNode(treeRoot)}
          </div>
          <div class="tree-result ${complete?'show correct':''}">
            ${complete?`🎉 Klart! ${treeRoot.value} = ${primes.join(' · ')}`:''}
          </div>
          <div class="tree-actions">
            ${complete ? `<button class="btn primary" id="next-task">${omgangResults.length + 1 >= OMGANG_SIZE ? 'Se resultat' : 'Nästa träd'}</button>` : `<button class="btn subtle" id="restart-task">Börja om</button>`}
            <button class="btn subtle" onclick="navTo('ko',{koId:'${koId}'})">Tillbaka</button>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.tnode-input').forEach(inp=>{
      inp.addEventListener('input', e=>{
        const realId = inp.dataset.pi.replace(/-(left|right)$/,'');
        const realSide = inp.dataset.pi.match(/-(left|right)$/)[1];
        if(!pendingInputs[realId]) pendingInputs[realId]={left:'',right:''};
        pendingInputs[realId][realSide] = inp.value;
      });
      inp.addEventListener('keydown', e=>{
        if(e.key==='Enter'){
          const nid = inp.dataset.pi.replace(/-(left|right)$/,'');
          if(inp.dataset.pi.endsWith('-left')){
            const rightInp = document.querySelector(`[data-pi="${nid}-right"]`);
            if(rightInp) rightInp.focus();
          } else {
            expandNode(nid);
          }
        }
      });
    });
    document.querySelectorAll('[data-expand]').forEach(b=>{
      b.addEventListener('click', ()=> expandNode(b.dataset.expand));
    });

    if(complete){
      // Träd klart - lägg till resultat
      omgangResults.push(!currentHadError);
      const nextBtn = document.getElementById('next-task');
      if(nextBtn) nextBtn.onclick = ()=>{
        if(omgangResults.length >= OMGANG_SIZE){
          showOmgangSummary();
        } else {
          startNew();
        }
      };
    } else {
      const restartBtn = document.getElementById('restart-task');
      if(restartBtn) restartBtn.onclick = ()=>{
        treeRoot.children = null;
        pendingInputs = {};
        currentHadError = true; // räknas som "med fel" om man startar om
        render();
      };
    }

    drawTradGrenar();
  }

  startNew();
}

// Rita om grenarna vid fönsterändring (geometrin ändras med layouten).
if(typeof window !== 'undefined' && window.addEventListener){
  window.addEventListener('resize', drawTradGrenar);
}
