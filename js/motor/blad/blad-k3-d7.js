/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k3-d7-pluggtillprov.html
   Byte-identiskt utbrutet (hela scriptet, logik orörd). Egen generation. */
// ---- PLUGG-MENY (byggs nedan) ----

// ============================================================
// ÖVNINGSMOTOR – ligger i den delade kärnan blad-karna-b.js
// (heltals-släkten; laddas FÖRE denna fil). Här finns bara bladets
// egna generatorer och uppgiftsdata. Radtyper: se kärnan.
// ============================================================
// ============================================================
// UPPGIFTSDATA – stencilerna från Joachim
// ============================================================
// ============================================================
// PLUGG TILL PROV – meny och dokument
// ============================================================
// 14 dokument grupperade i kategorier + en självskattningsmatris.
// Varje dokument byggs med samma övningsmotor (bladHTML/bygg_blad).
// Dokument som ännu inte är byggda har 'klar:false' och visas som
// "byggs snart".

var PLUGG_GRUPPER = [
  {id:'tal-rakneregler', namn:'Tal och räkneregler', dok:[
    {nr:1, id:'prio',       namn:'Prioriteringsregeln',          klar:true},
    {nr:2, id:'negativa',   namn:'Negativa tal',                 klar:true},
    {nr:3, id:'multdiv',    namn:'Multiplikation och division',  klar:true}
  ]}
];

var PLUGG_DOKUMENT = {
  'prio': {
    titel:'Prioriteringsregeln',
    intro:'Räkna nedåt och visa mellanledet. Skriv det förenklade ledet i rutan före likhetstecknet – med alla delar under varandra – och svaret i rutan efter. Multiplikation och division först, sedan addition och subtraktion. Tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader:[
        {typ:'prio', vansterText:'3 · 6 + 8', steg:[{vlValue:26}], svar:26},
        {typ:'prio', vansterText:'7 + 3 · 7', steg:[{vlValue:28}], svar:28},
        {typ:'prio', vansterText:'3 · 6 + 3 · 8', steg:[{vlValue:42}], svar:42}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'prio', vansterText:'3 · (6 + 7)', steg:[{vlValue:39}], svar:39},
        {typ:'prio', vansterText:'9 · (8 − 5)', steg:[{vlValue:27}], svar:27},
        {typ:'prio', vansterText:'(7 − 4) · 8', steg:[{vlValue:24}], svar:24}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'prio', vansterText:'20/4 + 18/6', steg:[{vlValue:8}], svar:8},
        {typ:'prio', vansterText:'25 + 3 · 5 − 50/5', steg:[{vlValue:30}], svar:30},
        {typ:'prio', vansterText:'3 · (2 · 2 + 7)', steg:[{vlValue:33}], svar:33}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'prio', vansterText:'(25 + 7)/4', steg:[{vlValue:8}], svar:8},
        {typ:'prio', vansterText:'16/(17 − 9)', steg:[{vlValue:2}], svar:2},
        {typ:'prio', vansterText:'6 · (8 + 8/2)', steg:[{vlValue:72}], svar:72}
      ]}
    ]
  },
  'negativa': {
    titel:'Negativa tal',
    intro:'Räkna med negativa tal. På de sista uppgifterna ska du visa mellanledet – skriv först om subtraktion av ett negativt tal till addition, sedan svaret. Tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'7 − 11 =', svar:-4},
        {typ:'enkel', vansterText:'−12 + 5 =', svar:-7},
        {typ:'enkel', vansterText:'−3 − 4 =', svar:-7}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'8 + (−2) =', svar:6},
        {typ:'enkel', vansterText:'(−4) + (−2) =', svar:-6},
        {typ:'enkel', vansterText:'6 + (−13) =', svar:-7}
      ]},
      {rubrik:'Beräkna – visa mellanled', mellanled:'kravt', rader:[
        {typ:'overslag', vansterText:'3 − (−5)', mellan:'3+5', svar:8},
        {typ:'overslag', vansterText:'(−6) − (−2)', mellan:'-6+2', svar:-4},
        {typ:'overslag', vansterText:'−15 − (−11)', mellan:'-15+11', svar:-4}
      ]},
      {rubrik:'Beräkna – visa mellanled', mellanled:'kravt', rader:[
        {typ:'overslag', vansterText:'(−8) + (−2) + 5', mellan:'-8-2+5', svar:-5},
        {typ:'overslag', vansterText:'9 + (−6) − (−2)', mellan:'9-6+2', svar:5},
        {typ:'overslag', vansterText:'(−4) − 5 + (−1) − (−7)', mellan:'-4-5-1+7', svar:-3}
      ]}
    ]
  },
  'multdiv': {
    titel:'Multiplikation och division',
    intro:'Räkna ut talen. Tänk på hur decimaltecknet flyttar när du multiplicerar eller dividerar med 10, 100 och 1000. Skriv svaret med komma där det behövs. Tryck sedan på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'7,8 · 100 =', svar:780},
        {typ:'enkel', vansterText:'10 · 0,564 =', svar:5.64},
        {typ:'enkel', vansterText:'4,2 · 1000 =', svar:4200}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'83/10 =', svar:8.3},
        {typ:'enkel', vansterText:'56,7/10 =', svar:5.67},
        {typ:'enkel', vansterText:'41,9/1000 =', svar:0.0419}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'717/3 =', svar:239},
        {typ:'enkel', vansterText:'916/4 =', svar:229},
        {typ:'enkel', vansterText:'7005/5 =', svar:1401},
        {typ:'enkel', vansterText:'27,37/7 ≈', svar:3.91}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'450/300 =', svar:1.5},
        {typ:'enkel', vansterText:'1,2/0,3 =', svar:4},
        {typ:'enkel', vansterText:'0,08 · 0,3 =', svar:0.024},
        {typ:'enkel', vansterText:'400 · 0,6 =', svar:240}
      ]}
    ]
  }
};

// ============================================================
// MENY-LOGIK
// ============================================================
var pluggGruppRad = document.getElementById('plugg-grupprad');
var pluggDoklista = document.getElementById('plugg-doklista');
var pluggAktivt   = document.getElementById('plugg-aktivt');
var pluggValdGrupp = PLUGG_GRUPPER[0].id;

function renderGruppRad(){
  pluggGruppRad.innerHTML = '<div class="plugg-grupprad-rubrik">Välj område att öva på</div>'
    + '<div class="plugg-grupprad-knappar">'
    + PLUGG_GRUPPER.map(function(g){
        return '<button class="plugg-gruppbtn' + (g.id === pluggValdGrupp ? ' is-active' : '')
          + '" data-grupp="' + g.id + '">' + g.namn + '</button>';
      }).join('')
    + '</div>';
  pluggGruppRad.querySelectorAll('[data-grupp]').forEach(function(btn){
    btn.onclick = function(){
      pluggValdGrupp = btn.dataset.grupp;
      renderGruppRad();
      renderDoklista();
      pluggAktivt.innerHTML = '';
    };
  });
}

function renderDoklista(){
  var grupp = PLUGG_GRUPPER.find(function(g){ return g.id === pluggValdGrupp; });
  pluggDoklista.innerHTML = '<div class="plugg-doklista-rubrik">' + grupp.namn
    + ' &mdash; välj ett dokument</div>'
    + grupp.dok.map(function(d){
    // `blad-subnav-btn` = plattformens klass för en underflik, så sidan mäts som alla andra
    // (V14). Samma ändring som i blad-k1-d10.js, och mätt på samma sätt: klassen är inert.
    return '<button class="plugg-dok blad-subnav-btn" data-dok="' + d.id + '"'
      + (d.klar ? '' : ' style="opacity:.55;"') + '>'
      + '<span class="plugg-dok-nr">' + d.nr + '</span>'
      + '<span class="plugg-dok-namn">' + d.namn + '</span>'
      + '<span class="plugg-dok-pil">' + (d.klar ? '›' : '◌') + '</span>'
    + '</button>';
  }).join('');
  pluggDoklista.querySelectorAll('[data-dok]').forEach(function(btn){
    btn.onclick = function(){
      var dokId = btn.dataset.dok;
      pluggDoklista.querySelectorAll('.plugg-dok').forEach(function(b){
        b.classList.toggle('is-active', b === btn);
      });
      oppnaDokument(dokId);
    };
  });
}


/* TALLINJE: fanns här som en ordagrann kopia av d10:s rutin, men utan dokument som kunde nå
   den. Kopian bar samma två fel som rättades i d10 2026-10-02 — facit på tom ruta, och rätt
   alternativ markerat utan val — och hade återuppstått i samma stund någon lade till ett
   dokument med id 'tallinjer'. Borttagen 2026-10-02. Behövs en tallinje här igen ska den delas
   som modul, inte kopieras: en fix i kärnan når aldrig en kopia. */
function oppnaDokument(dokId){
  if(dokId === 'faktorisera'){
    renderFaktoriseraDok();
    return;
  }
  var blad = PLUGG_DOKUMENT[dokId];
  if(blad){
    pluggAktivt.innerHTML = '<div class="ovn-wrap" id="plugg-sheet"></div>';
    bygg_blad(document.getElementById('plugg-sheet'), blad);
    pluggAktivt.scrollIntoView({behavior:'smooth', block:'start'});
  } else {
    pluggAktivt.innerHTML = '<div class="ovn-wrap"><div class="content-card">'
      + '<div class="placeholder-note"><span class="pn-icon">📄</span>'
      + '<span>Det här dokumentet byggs snart.</span></div>'
    + '</div></div>';
    pluggAktivt.scrollIntoView({behavior:'smooth', block:'start'});
  }
}

// ============================================================
// FAKTORTRÄD – fristående interaktiv komponent (dok 9)
// ============================================================
function isPrime(n){
  if(n<2) return false;
  if(n===2) return true;
  if(n%2===0) return false;
  for(var i=3;i*i<=n;i+=2) if(n%i===0) return false;
  return true;
}
var _ftId = 0;
function ftMakeNode(value, isRoot){
  return {id:'ft'+(_ftId++), value:value, children:null, isPrime:isPrime(value), isRoot:!!isRoot, errorMsg:null};
}
function ftBygg(container, startTal){
  _ftId = 0;
  var root = ftMakeNode(startTal, true);
  var pending = {};

  function isKlar(node){
    if(node.children) return node.children.every(isKlar);
    return node.isPrime;
  }
  function findNode(node, id){
    if(node.id === id) return node;
    if(node.children){ for(var i=0;i<node.children.length;i++){ var r=findNode(node.children[i],id); if(r) return r; } }
    return null;
  }
  function renderNode(node){
    var html = '<div class="tnode" data-id="'+node.id+'">';
    var cls = 'tnode-label';
    if(node.isRoot) cls += ' root';
    else if(node.isPrime) cls += ' prime';
    else cls += ' composite';
    html += '<div class="'+cls+'">'+node.value+'</div>';
    if(node.children){
      html += '<div class="tnode-connector"></div>';
      html += '<div class="tnode-children">'+node.children.map(renderNode).join('')+'</div>';
    } else if(!node.isPrime){
      var pi = pending[node.id] || {left:'',right:''};
      var errCls = node.errorMsg ? 'error' : '';
      html += '<div class="tnode-input-row">'
        + '<span class="tnode-target">'+node.value+'</span>'
        + '<span class="tnode-eq">=</span>'
        + '<input class="tnode-input '+errCls+'" type="text" inputmode="numeric" data-pi="'+node.id+'-left" value="'+pi.left+'" maxlength="3">'
        + '<span class="tnode-mult">·</span>'
        + '<input class="tnode-input '+errCls+'" type="text" inputmode="numeric" data-pi="'+node.id+'-right" value="'+pi.right+'" maxlength="3">'
        + '<button class="tnode-expand-btn" data-expand="'+node.id+'">Dela</button>'
        + '</div>'
        + (node.errorMsg ? '<div style="font-size:12px;color:var(--error);margin-top:6px;text-align:center;">'+node.errorMsg+'</div>' : '');
    }
    html += '</div>';
    return html;
  }
  function expandNode(id){
    var node = findNode(root, id);
    if(!node) return;
    var pi = pending[id] || {left:'',right:''};
    var a = parseInt(pi.left,10), b = parseInt(pi.right,10);
    node.errorMsg = null;
    if(!a || !b || a<2 || b<2){
      node.errorMsg = 'Båda faktorerna ska vara minst 2.';
    } else if(a*b !== node.value){
      node.errorMsg = a+' · '+b+' = '+(a*b)+', men vi vill ha '+node.value+'.';
    } else {
      node.children = [ftMakeNode(a), ftMakeNode(b)];
      delete pending[id];
    }
    render();
  }
  function render(){
    container.innerHTML = '<div class="ftrad-canvas">'+renderNode(root)+'</div>'
      + '<div class="ftrad-klar'+(isKlar(root)?' show':'')+'">'
        + '✓ Klart! Alla bladnoder är primtal: '+ftPrimLeaves(root).sort(function(x,y){return x-y;}).join(' · ')
      + '</div>'
      + '<button type="button" class="ftrad-omstart">Börja om</button>';
    container.querySelectorAll('.tnode-input').forEach(function(inp){
      inp.addEventListener('input', function(){
        var parts = inp.dataset.pi.split('-');
        var nid = parts[0], sida = parts[1];
        if(!pending[nid]) pending[nid] = {left:'',right:''};
        pending[nid][sida] = inp.value;
        var node = findNode(root, nid);
        if(node) node.errorMsg = null;
      });
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
          e.preventDefault();
          var nid = inp.dataset.pi.split('-')[0];
          expandNode(nid);
        }
      });
    });
    container.querySelectorAll('[data-expand]').forEach(function(btn){
      btn.addEventListener('click', function(){ expandNode(btn.dataset.expand); });
    });
    container.querySelector('.ftrad-omstart').addEventListener('click', function(){
      root = ftMakeNode(startTal, true);
      pending = {};
      render();
    });
  }
  function ftPrimLeaves(node){
    if(node.children) return node.children.reduce(function(acc,c){ return acc.concat(ftPrimLeaves(c)); }, []);
    return [node.value];
  }
  render();
}

function renderFaktoriseraDok(){
  // Del 1: vanliga uppgifter via bladmotorn. Del 2: faktorträd.
  var html = '<div class="ovn-wrap"><div class="ovn-sheet">';
  html += '<h2>Faktorisera</h2>';
  html += '<p class="ovn-intro">Arbeta med faktorer och primtal. Längst ned bygger du faktorträd – rita gärna på papper också.</p>';
  html += '</div></div>';
  html += '<div class="ovn-wrap" id="faktorisera-blad"></div>';
  // Faktorträd-sektioner
  html += '<div class="ovn-wrap">';
  html += '<div class="ftrad-uppg"><div class="ftrad-uppg-rubrik">6. Primtalsfaktorisera med faktorträd</div>'
    + '<div class="ftrad-uppg-instr">Skriv två faktorer och tryck Dela. Fortsätt tills alla bladnoder är gröna primtal.</div>';
  html += '<div style="display:flex;gap:40px;flex-wrap:wrap;justify-content:center;">';
  ['ft15','ft21','ft25'].forEach(function(id){ html += '<div id="'+id+'"></div>'; });
  html += '</div></div>';
  html += '<div class="ftrad-uppg"><div class="ftrad-uppg-rubrik">7. Primtalsfaktorisera med faktorträd</div>'
    + '<div class="ftrad-uppg-instr">Skriv två faktorer och tryck Dela. Fortsätt tills alla bladnoder är gröna primtal.</div>';
  html += '<div style="display:flex;gap:40px;flex-wrap:wrap;justify-content:center;">';
  ['ft18','ft48','ft60'].forEach(function(id){ html += '<div id="'+id+'"></div>'; });
  html += '</div></div>';
  html += '</div>';

  pluggAktivt.innerHTML = html;
  // Bygg de vanliga uppgifterna
  bygg_blad(document.getElementById('faktorisera-blad'), PLUGG_FAKTORISERA);
  // Bygg faktorträden
  ftBygg(document.getElementById('ft15'), 15);
  ftBygg(document.getElementById('ft21'), 21);
  ftBygg(document.getElementById('ft25'), 25);
  ftBygg(document.getElementById('ft18'), 18);
  ftBygg(document.getElementById('ft48'), 48);
  ftBygg(document.getElementById('ft60'), 60);
  pluggAktivt.scrollIntoView({behavior:'smooth', block:'start'});
}


renderGruppRad();
renderDoklista();
