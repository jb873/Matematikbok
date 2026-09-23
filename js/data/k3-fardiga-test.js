/* k3-fardiga-test.js — FÄRDIGA delkapitel-test för åk7 kapitel 3 (algebra).
   Samma mekanism som k1/k2-fardiga-test.js: coverage-komplett split över delkapitlets byggbara
   noder; ramen (ak7-k3-ram.html) bygger via PB.byggFardigt (coverage-seedning + färdigt-läge).
   Byggbara noder = k3:s K3_GEN_NOD-målnoder. Delkapitel→nod via taxonomins visning.utbudslista
   (k3d1, k3d3). GDPR: ren data + DOM, inget nät. */
(function(){
  'use strict';

  // Byggbara noder — spegel av K3_GEN_NOD-värdena i ak7-k3-ram.html (HÅLL I SYNK).
  var BYGGBARA = {};
  ['alg-tolka:begrepp', 'alg-skriva:kommunikation', 'alg-berakna:rakna'
  ].forEach(function(n){ BYGGBARA[n] = 1; });

  // Antal test-TYPER (snabb-generatorer) per nod — spegel av K3_GEN_NOD. Default 1.
  var TYP_PER_NOD = { 'alg-tolka:begrepp': 3, 'alg-skriva:kommunikation': 4, 'alg-berakna:rakna': 2 };
  function typCount(n){ return TYP_PER_NOD[n] || 1; }

  function byggbaraNoder(del){
    var tax = window.K3_TAXONOMI; if(!tax || !tax.noder) return [];
    var ut = [];
    tax.noder.forEach(function(n){
      if(n.visning && n.visning.utbudslista === del && BYGGBARA[n.id] && ut.indexOf(n.id) < 0) ut.push(n.id);
    });
    return ut;
  }

  function antalFor(ns){ var tot = ns.reduce(function(s, n){ return s + typCount(n); }, 0); return Math.min(20, Math.max(10, tot * 2)); }

  // Ett test per innehålls-GRUPP (taxonomins visning.grupp), namngivet efter innehållet.
  function gruppAv(id){
    var tax = window.K3_TAXONOMI;
    var n = tax && tax.noder && tax.noder.filter(function(x){ return x.id === id; })[0];
    return (n && n.visning && n.visning.grupp) || 'Övrigt';
  }
  function tester(del){
    var noder = byggbaraNoder(del); if(!noder.length) return [];
    var ordning = [], grupper = {};
    noder.forEach(function(n){ var g = gruppAv(n); if(!grupper[g]){ grupper[g] = []; ordning.push(g); } grupper[g].push(n); });
    return ordning.map(function(g){ var ns = grupper[g]; return { titel: g, nodes: ns, antal: antalFor(ns) }; });
  }

  function returSuffix(){
    try {
      if(typeof location === 'undefined' || !location.href) return '';
      var titel = (typeof document !== 'undefined' && document.title) ? document.title.split(/[–—·|]/)[0].trim() : '';
      return '&retur=' + encodeURIComponent(location.href) + '&retur_txt=' + encodeURIComponent('← ' + (titel || 'Tillbaka'));
    } catch(e){ return ''; }
  }

  // ELEVTEXT som fält (elevtext-låset ser fältnamn, inte strängar i DOM-bygget).
  var TEXT = {
    varning: { intro: 'Om du lämnar testet nu försvinner svaren du har fyllt i. Vill du lämna testet?' },
    tom:     { intro: 'Färdigt test byggs för det här delkapitlet – öva på bladen och färdigheterna så länge.' },
    lista:   { intro: 'Färdiga test för det här delkapitlet – hopsatta ur momenten. Klicka och kör direkt.' }
  };

  function testHarIfyllt(panelEl){
    var f = panelEl && panelEl.querySelector('iframe.test-embed-frame');
    if(!f) return false;
    try {
      var doc = f.contentDocument; if(!doc) return false;
      var body = doc.getElementById('test-take-body') || doc.body; if(!body) return false;
      if(body.querySelector('.is-selected')) return true;
      var ins = body.querySelectorAll('[data-sub-input]');
      for(var i = 0; i < ins.length; i++){ if(ins[i].value && ins[i].value.trim()) return true; }
    } catch(e){}
    return false;
  }

  // Testet bäddas IN i Test-panelen (som färdighetsträningen) så flikraden ligger kvar ovanför.
  function renderTestFlik(panelEl, del, ramPath){
    if(!panelEl) return;
    ramPath = ramPath || '../../../ak7-k3-ram.html';
    var t = tester(del);
    var retur = returSuffix();

    function stickyHojd(){
      var tn = document.querySelector('.topnav'), tr = document.getElementById('tab-row');
      return (tn ? tn.offsetHeight : 0) + (tr ? tr.offsetHeight : 0);
    }
    function ritaLista(){
      var html = '<div class="test-note" style="text-align:left;"><h3>Test</h3>';
      if(t.length){
        html += '<p style="margin:0 0 18px;">' + TEXT.lista.intro + '</p>'
          + '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
        t.forEach(function(test, i){
          var deep = ramPath + '?view=test-fardigt&del=' + del + '&test=' + (i + 1) + '&embed=1' + retur;
          html += '<a href="#" class="test-lank" data-deep="' + encodeURIComponent(deep) + '">' + test.titel
               + ' <span style="opacity:.7;">· täcker ' + test.nodes.length + (test.nodes.length === 1 ? ' färdighet' : ' färdigheter') + '</span></a>';
        });
        html += '</div>';
      } else {
        html += '<p>' + TEXT.tom.intro + '</p>';
      }
      html += '</div>';
      panelEl.innerHTML = html;
      panelEl.querySelectorAll('.test-lank').forEach(function(a){
        a.addEventListener('click', function(e){ e.preventDefault(); oppnaTest(decodeURIComponent(a.getAttribute('data-deep'))); });
      });
    }
    function oppnaTest(src){
      var h = stickyHojd() + 40;
      panelEl.innerHTML = '<div class="test-embed-topp" style="margin:0 0 12px;">'
        + '<button type="button" class="test-tillbaka">← Testlista</button></div>'
        + '<iframe class="test-embed-frame" title="Test" src="' + src + '" '
        + 'style="width:100%;border:0;display:block;background:#fff;border-radius:10px;height:calc(100vh - ' + h + 'px);min-height:440px;"></iframe>';
      panelEl.querySelector('.test-tillbaka').addEventListener('click', function(){
        if(testHarIfyllt(panelEl) && !window.confirm(TEXT.varning.intro)) return;
        ritaLista();
      });
    }
    ritaLista();
  }

  // Pinna flikraden + varna vid flikbyte bort från ett påbörjat prov (som k1).
  function initFlikrad(){
    var topnav = document.querySelector('.topnav'), tabRow = document.getElementById('tab-row');
    if(!tabRow) return;
    tabRow.style.position = 'sticky';
    tabRow.style.top = (topnav ? topnav.offsetHeight : 0) + 'px';
    tabRow.style.zIndex = '90';
    var bg = getComputedStyle(tabRow).backgroundColor;
    if(!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') tabRow.style.background = 'var(--paper, #f6f1e8)';
    tabRow.addEventListener('click', function(e){
      var btn = e.target.closest && e.target.closest('.tab-btn'); if(!btn) return;
      var testPanel = document.querySelector('.tab-panel[data-panel="test"]');
      if(!testPanel || !testPanel.classList.contains('is-active') || btn.dataset.tab === 'test') return;
      if(testHarIfyllt(testPanel) && !window.confirm(TEXT.varning.intro)){ e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  function nastaTest(del, nr){
    var t = tester(del); var i = (nr | 0);
    if(!t.length || i < 1 || i >= t.length) return null;
    return { titel: t[i].titel, nr: i + 1, antal: t[i].antal };
  }

  window.K3_FARDIGA = { BYGGBARA: BYGGBARA, byggbaraNoder: byggbaraNoder, tester: tester, nastaTest: nastaTest, renderTestFlik: renderTestFlik };

  // Auto-init på delkapitel-sidor: Test-panel + mapp dN → del-id 'k3dN'. Ramen saknar panelen → hoppas.
  try {
    if(typeof document !== 'undefined' && document.querySelector){
      var _tp = document.querySelector('.tab-panel[data-panel="test"]');
      var _m = (location.pathname || '').match(/\/(d\d+)-/);
      if(_tp && _m){ renderTestFlik(_tp, 'k3' + _m[1], '../../../ak7-k3-ram.html'); initFlikrad(); }
    }
  } catch(e){}
})();
