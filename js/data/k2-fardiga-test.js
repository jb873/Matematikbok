/* k2-fardiga-test.js — FÄRDIGA delkapitel-test för åk7 kapitel 2 (bråk).
   Samma mekanism som ak8/k1: coverage-komplett split (typ-antal-drivet) över delkapitlets byggbara
   noder; ramen bygger via PB.byggFardigt (coverage-seedning + färdigt-läge). Byggbara noder = k2:s
   K2_GEN_NOD-målnoder (ak7-k2-ram.html); visuella andel-noder är obundna → redan uteslutna.
   Delkapitel→nod via taxonomins visning.utbudslista (k2d1–k2d7). GDPR: ren data + DOM, inget nät. */
(function(){
  'use strict';

  // Byggbara noder — spegel av K2_GEN_NOD-värdena i ak7-k2-ram.html (HÅLL I SYNK om generatorer läggs till).
  var BYGGBARA = {};
  ['andel-antal:rakna','brak-blandad:rakna','brak-tid:rakna','brak-forlanga:rakna','brak-forkorta:rakna',
   'brak-likformig:rakna','brak-jmf-lika:begrepp','brak-jmf-riktmark:begrepp','brak-add:rakna','brak-sub:rakna',
   'brak-mult-rakna:rakna','brak-div-bh:rakna','brak-div-hb:rakna','brak-div-bb:rakna','brak-div-inv:rakna'
  ].forEach(function(n){ BYGGBARA[n] = 1; });

  // Antal test-TYPER (snabb-generatorer) per nod — spegel av K2_GEN_NOD. Default 1 (varje nod = en generator).
  var TYP_PER_NOD = {
    // sjuan k2-sweep: noder som fick fler generatorer
    'andel-antal:rakna': 2, 'brak-blandad:rakna': 4, 'brak-forlanga:rakna': 2,
    'brak-jmf-lika:begrepp': 2, 'brak-add:rakna': 3, 'brak-mult-rakna:rakna': 2
  };
  function typCount(n){ return TYP_PER_NOD[n] || 1; }

  // Byggbara noder i ett delkapitel: taxonomins noder med visning.utbudslista===del ∩ BYGGBARA (taxonomi-ordning).
  function byggbaraNoder(del){
    var tax = window.K2_TAXONOMI; if(!tax || !tax.noder) return [];
    var ut = [];
    tax.noder.forEach(function(n){
      if(n.visning && n.visning.utbudslista === del && BYGGBARA[n.id] && ut.indexOf(n.id) < 0) ut.push(n.id);
    });
    return ut;
  }

  function antalFor(ns){ var tot = ns.reduce(function(s, n){ return s + typCount(n); }, 0); return Math.min(20, Math.max(10, tot * 3)); }

  var TYP_CAP = 5;
  function tester(del){
    var noder = byggbaraNoder(del); if(!noder.length) return [];
    var tests = [], cur = [], curTyp = 0;
    noder.forEach(function(n){
      var tc = typCount(n);
      if(cur.length && curTyp + tc > TYP_CAP){ tests.push(cur); cur = []; curTyp = 0; }
      cur.push(n); curTyp += tc;
    });
    if(cur.length) tests.push(cur);
    return tests.map(function(ns, i){ return { titel: tests.length > 1 ? 'Test ' + (i + 1) : 'Test', nodes: ns, antal: antalFor(ns) }; });
  }

  // Rendera Test-flikens innehåll: färdig-test-knappar (deeplink → ramens ?view=test-fardigt&del=k2dN&test=M).
  function renderTestFlik(panelEl, del, ramPath){
    if(!panelEl) return;
    ramPath = ramPath || '../../../ak7-k2-ram.html';
    var t = tester(del);
    var html = '<div class="test-note" style="text-align:left;"><h3>Test</h3>';
    if(t.length){
      html += '<p style="margin:0 0 18px;">Färdiga test för det här delkapitlet – hopsatta ur momenten. Klicka och kör direkt.'
        + (t.length > 1 ? ' Uppdelat i ' + t.length + ' så att testen tillsammans täcker hela delkapitlet.' : '') + '</p>'
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
      t.forEach(function(test, i){
        var url = ramPath + '?view=test-fardigt&del=' + del + '&test=' + (i + 1);
        html += '<a href="' + url + '">' + test.titel + ' <span style="opacity:.7;">· ' + test.antal + ' uppgifter</span></a>';
      });
      html += '</div>';
    } else {
      html += '<p>Färdigt test byggs för det här delkapitlet – öva på bladen och färdigheterna så länge.</p>';
    }
    html += '</div>';
    panelEl.innerHTML = html;
  }

  window.K2_FARDIGA = { BYGGBARA: BYGGBARA, byggbaraNoder: byggbaraNoder, tester: tester, renderTestFlik: renderTestFlik };

  // Auto-init på delkapitel-sidor: Test-flik-panel + mapp d1–d7 → del-id 'k2dN' → rendera Test-knapparna.
  // Ramen (ak7-k2-ram.html) saknar panelen → hoppas; den wirar via boot-deeplinken.
  try {
    if(typeof document !== 'undefined' && document.querySelector){
      var _tp = document.querySelector('.tab-panel[data-panel="test"]');
      var _m = (location.pathname || '').match(/\/(d\d+)-/);
      if(_tp && _m) renderTestFlik(_tp, 'k2' + _m[1], '../../../ak7-k2-ram.html');
    }
  } catch(e){}
})();
