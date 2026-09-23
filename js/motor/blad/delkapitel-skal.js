/* delkapitel-skal.js — DELKAPITEL-SIDANS SKAL som anropbart kontrakt (order 2026-09-23).

   Syster till AK8_FARDIGA.renderTestFlik och AK8_FOREL.renderForelFlik: en funktion, inte ett
   mönster att kopiera. Sjuans k1/k2-sidor bär i dag var sin INLINE-KOPIA av samma tre stycken
   (flikväxling, blad-nav, färdighetshubb ur taxonomin) — det är precis den formen som glider isär
   (jfr åttans spårrader, keypaden). Nya sidor monterar mot den här i stället.

   ANROP:
     DelkapitelSkal.montera({
       ova:         [ { titel:'Skriva uttryck', mount:'skriva', data: BLAD_K3_D1.skriva }, … ],
       taxonomi:    function(){ return window.K3_TAXONOMI; },   // eller objektet direkt
       utbudslista: 'k3d1',                                     // visning.utbudslista på lövnoderna
       ram:         '../../../ak7-k3-ram.html',                 // färdighetsdrillarnas ram
       forel:       'ak7-k3-d1'                                 // nyckel i föreläsningsregistret (valfritt)
     });

   FÖRVÄNTAD MARKUP (samma som k1-sidorna):
     #tab-row > .tab-btn[data-tab]          ·  .tab-panel[data-panel]
     [data-panel="ova"]      > #blad-nav + #blad-<mount> > .ovn-wrap#sheet-<mount>
     [data-panel="fardighet"]> #fardighet-lista + #fard-scen > #fard-frame
     [data-panel="forelasningar"] (ägs helt av föreläsningsregistret)

   Ren DOM + data. Ingen nätväg. */
(function(){
'use strict';

// ── FLIKVÄXLING ──────────────────────────────────────────────────────────────────────────────
function flikar(){
  var tabRow = document.getElementById('tab-row');
  if(!tabRow) return;
  tabRow.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(btn.disabled) return;
      var id = btn.dataset.tab;
      tabRow.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.toggle('is-active', b === btn); });
      document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.toggle('is-active', p.dataset.panel === id); });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ── ÖVA: blad-nav (numrerad rad) + ett helt arbetsblad i taget ───────────────────────────────
// Bladet renderas MEDAN #sheet-X sitter i dokumentet; nav:en visar/döljer mounts (flyttar inget).
function ova(lista){
  var navEl = document.getElementById('blad-nav');
  if(!navEl || !lista || !lista.length) return;
  var mounts = [], knappar = [];
  function visa(i){
    lista.forEach(function(p, j){
      if(mounts[j]) mounts[j].hidden = (j !== i);
      if(knappar[j]){ var on = (j === i); knappar[j].classList.toggle('is-active', on); knappar[j].setAttribute('aria-selected', on ? 'true' : 'false'); }
    });
  }
  lista.forEach(function(p, i){
    var data = p.data || window[p.dataNamn], sheet = document.getElementById('sheet-' + p.mount);
    if(data && sheet && typeof window.bygg_blad === 'function'){
      window.bygg_blad(sheet, Object.assign({}, data, { stegvis: false, titel: p.titel, onResultat: function(){} }));
    }
    mounts[i] = document.getElementById('blad-' + p.mount);
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'blad-nav-btn'; btn.setAttribute('role', 'tab'); btn.title = p.titel;
    btn.innerHTML = '<span class="blad-nav-nr">' + (i + 1) + '</span>' + p.titel;
    btn.onclick = function(){ visa(i); };
    navEl.appendChild(btn); knappar[i] = btn;
  });
  visa(0);
}

// ── FÄRDIGHETSTRÄNING: grupper/rader ur taxonomin, drillen i iframen bredvid ──────────────────
// Lövnoder med visning.utbudslista === utbudslistaId grupperas på visning.grupp. En källa, alla vyer.
function fardighetUrTaxonomi(tax, utbudslistaId){
  var noder = (tax && tax.noder) || [];
  var rader = noder.filter(function(n){
    return n.niva === 'lovnod' && n.visning && n.visning.utbudslista === utbudslistaId;
  });
  var grupper = {};
  rader.forEach(function(n){
    var v = n.visning;
    if(!grupper[v.grupp]) grupper[v.grupp] = { rubrik: v.grupp, ordning: v.gruppordning, rader: [] };
    grupper[v.grupp].rader.push(n);
  });
  return Object.keys(grupper).map(function(k){ return grupper[k]; })
    .sort(function(a, b){ return (a.ordning || 0) - (b.ordning || 0); })
    .map(function(gr){
      gr.rader.sort(function(a, b){ return (a.visning.radordning || 0) - (b.visning.radordning || 0); });
      return { ko: gr.rubrik, drills: gr.rader.map(function(n){
        var v = n.visning;
        return { titel: (v.titel || n.namn), formaga: v.etikett, ko: n.id.split(':')[0],
                 formagaKey: v.formagaKey || n.id.split(':')[1], niva: v.niva || undefined, kommer: !!v.kommer };
      }) };
    });
}

function fardighet(tax, utbudslistaId, ram){
  var fardEl = document.getElementById('fardighet-lista');
  if(!fardEl || !ram) return;
  var frame = document.getElementById('fard-frame'), scen = document.getElementById('fard-scen');
  var knappar = [];
  function oppna(btn, p){
    knappar.forEach(function(b){ b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('is-active'); btn.setAttribute('aria-selected', 'true');
    var url = ram + '?ko=' + encodeURIComponent(p.ko) + '&formaga=' + encodeURIComponent(p.formagaKey || p.formaga) + '&embed=1';
    if(p.niva && p.niva < 3) url += '&maxniva=' + p.niva;
    if(frame) frame.src = url;
    if(scen) scen.classList.add('har-drill');
  }
  fardighetUrTaxonomi(tax, utbudslistaId).forEach(function(g){
    var gr = document.createElement('div'); gr.className = 'fard-grupp';
    var rub = document.createElement('div'); rub.className = 'fard-ko'; rub.textContent = g.ko; gr.appendChild(rub);
    g.drills.forEach(function(p){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fard-skill'; b.setAttribute('role', 'tab');
      if(p.kommer){ b.classList.add('is-kommer'); b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
      b.innerHTML = '<span class="fard-skill-titel">' + p.titel + '</span>'
                  + '<span class="fard-skill-formaga">' + p.formaga + '</span>';
      b.onclick = function(){ oppna(b, p); };
      gr.appendChild(b); knappar.push(b);
    });
    fardEl.appendChild(gr);
  });
}

// ── FÖRELÄSNING: registret äger panelen (ingen sida skriver egen text) ───────────────────────
function forelasning(nyckel){
  if(!nyckel || !window.FOREL || !window.FOREL.renderFlik) return;
  window.FOREL.renderFlik(document.querySelector('.tab-panel[data-panel="forelasningar"]'), nyckel);
}

function montera(cfg){
  cfg = cfg || {};
  var tax = (typeof cfg.taxonomi === 'function') ? cfg.taxonomi() : cfg.taxonomi;
  flikar();
  ova(cfg.ova);
  fardighet(tax, cfg.utbudslista, cfg.ram);
  forelasning(cfg.forel);
}

window.DelkapitelSkal = { montera: montera, fardighetUrTaxonomi: fardighetUrTaxonomi };
})();
