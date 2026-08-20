/* ak8-fardiga-test.js — FÄRDIGA delkapitel-test för åk8 kapitel 1 (auto-assemblerade).
   Ett färdigt test = ett FÖRVALT urval av delkapitlets byggbara noder med storleks-cap och
   ev. split. INGEN egen test-mekanism: launchar provbyggarens PB.byggFardigt (= generateTest +
   samma take/rättning). Provbyggar-motorn och drillarna är orörda.

   Assembly (ren beräkning ur AK8_K1_BOK + BYGGBARA):
     • byggbara noder per delkapitel = delkapitlets blad-noder ∩ BYGGBARA (= AK8_GEN_NOD-värden).
     • cap 10–18 svarbara items/test (motorn räknar items rätt: 1.a,b,c = 3).
     • SPLIT per innehålls-grupp: ETT test per blad/grupp (tester() nedan) → testen tillsammans
       täcker hela delkapitlet. Antal test = antal grupper (varierar per delkapitel, ej alltid två).

   BYGGBARA speglar AK8_GEN_NOD-värdena i ak8-k1-ram.html (håll i synk om noder läggs till där).
   Laddas av ak8-k1-ram.html (för ?view=test-fardigt → PB.byggFardigt) OCH av delkapitel-sidorna
   (för att rendera Test-flikens färdig-test-knappar). GDPR: ingen nätväg; ren data + DOM. */
(function(){
  'use strict';

  // Byggbara noder = värdena i ak8-k1-ram.htmls AK8_GEN_NOD (noder som har en test-generator).
  var BYGGBARA = {};
  [
    'brak-blandad:rakna','brak-tid:rakna','brak-forlanga:rakna','brak-forkorta:rakna','brak-likformig:rakna',
    'brak-jmf-lika:begrepp','brak-add:rakna','brak-sub:rakna','brak-mult-rakna:rakna','brak-div-bh:rakna',
    'brak-div-hb:rakna','brak-div-bb:rakna','brak-div-inv:rakna','pot-begrepp:skriva','pot-begrepp:evaluera',
    'pot-multdiv:rakna','pot-addsub:rakna','pot-multdiv:losut','prio-potenser','tio-rakna:skriva',
    'tio-rakna:evaluera','tio-rakna:rakna','tio-rakna:addsub','tio-rakna:losut','tio-rakna:prefix',
    'gp-rakna:skriva','gp-rakna:multdiv','gp-rakna:addsub','gp-rakna:losut','mult-rakna:pow10',
    'mult-rakna:stora','div-rakna:pow10','div-rakna:stora','neg-begrepp:begrepp','neg-rakna:addsub',
    'neg-rakna:multdiv','primtal:begrepp','primtal:rakna','delbarhet:rakna','position:begrepp',
    'position:rakna','mult-rakna:sma','div-rakna:sma','mult-rakna:storasma','div-rakna:storasma',
    'brak-lana:rakna','brak-mult-forkorta:rakna','brak-div-reciprok:rakna',
    'pot-begrepp:tabell'   // FAS1-breddning: potenstabell (numeric) blir quiz-bar; pot-begrepp:figur lämnas (visuell → självskattning)
  ].forEach(function(n){ BYGGBARA[n] = 1; });

  // Antal test-TYPER (snabb-generatorer) per nod — speglar AK8_GEN_NOD i ak8-k1-ram.html (håll i synk
  // när generatorer läggs till). Styr coverage-kompletta splitten: noder packas i test så varje test
  // täcker ALLA sina typer och testen TILLSAMMANS täcker delkapitlets alla quiz-bara typer. Default 1.
  var TYP_PER_NOD = {
    'position:rakna': 6, 'position:begrepp': 2, 'primtal:rakna': 3, 'delbarhet:rakna': 2,
    'pot-begrepp:skriva': 2, 'brak-blandad:rakna': 4, 'brak-jmf-lika:begrepp': 2,
    // dk2 Beräkningar: division med decimaltal + decimal×decimal
    'div-rakna:sma': 2, 'div-rakna:storasma': 2, 'mult-rakna:sma': 2,
    // dk3 Negativa: +lös-ut (addsub/multdiv), +dubbeltecken (addsub), +jämför (begrepp)
    'neg-rakna:addsub': 4, 'neg-begrepp:begrepp': 2,
    // dk4/dk5 bråk: decimal→bråk + decimal→blandad (brak-blandad), min→dec (tid), bråk±dec (add)
    'brak-tid:rakna': 2, 'brak-add:rakna': 2,
    // dk8/dk10 potens: +decimalbas/bråkbas (evaluera), +avkoda (gp skriva), +x-i-nämnaren (gp losut)
    'pot-begrepp:evaluera': 3, 'gp-rakna:skriva': 2, 'gp-rakna:losut': 2,
    // prioritering: +parentesⁿ (prio-potenser), +prio-med-negativa (neg-rakna:multdiv), +räkneordning-bråk (div-bb)
    'prio-potenser': 2, 'neg-rakna:multdiv': 3, 'brak-div-bb:rakna': 2
  };
  function typCount(n){ return TYP_PER_NOD[n] || 1; }

  function delkapitelFor(delNr){
    var bok = window.AK8_K1_BOK || { delkapitel: [] };
    return (bok.delkapitel || []).filter(function(d){ return d.nr === delNr; })[0] || null;
  }

  // Byggbara noder i ett delkapitel (unik, i bok-ordning).
  function byggbaraNoder(delNr){
    var dk = delkapitelFor(delNr); if(!dk) return [];
    var ut = [];
    (dk.blad || []).forEach(function(b){ (b.noder || []).forEach(function(n){
      if(BYGGBARA[n] && ut.indexOf(n) < 0) ut.push(n);
    }); });
    return ut;
  }

  // items ≈ 3 per typ, klämt till 10–20 (matchar generateTest:s coverage-seedning i ramen).
  function antalFor(ns){ var tot = ns.reduce(function(s, n){ return s + typCount(n); }, 0); return Math.min(20, Math.max(10, tot * 3)); }

  // INNEHÅLLS-SPLIT (spec-kontroll FAS 3): ETT test per BLAD (bokens naturliga innehålls-grupp), namngivet
  // efter bladet ("Multiplikation med stora tal") i st.f. "Test 1". Färre noder/test, fler test; testen
  // täcker tillsammans hela delkapitlet. Bara byggbara noder tas med; tomma blad hoppas.
  function tester(delNr){
    var dk = delkapitelFor(delNr); if(!dk) return [];
    var seen = {};   // en nod hamnar i sitt FÖRSTA blad (undvik dubbeltest när samma nod ligger i flera blad)
    return (dk.blad || []).map(function(b){
      var ns = (b.noder || []).filter(function(n){ return BYGGBARA[n] && !seen[n]; });
      ns.forEach(function(n){ seen[n] = 1; });
      return ns.length ? { titel: b.titel, nodes: ns, antal: antalFor(ns) } : null;
    }).filter(Boolean);
  }

  // Rendera Test-flikens innehåll: färdig-test-knappar (länkar till ramens ?view=test-fardigt) +
  // "Skapa eget test →" bredvid. ramPath = relativ sökväg till ak8-k1-ram.html från sidan.
  // FAS 4: retur-suffix till test-deeplinken (var eleven ska tillbaka + etikett). Se k1-fardiga-test.js.
  function returSuffix(){
    try {
      if(typeof location === 'undefined' || !location.href) return '';
      var titel = (typeof document !== 'undefined' && document.title) ? document.title.split(/[–—·|]/)[0].trim() : '';
      return '&retur=' + encodeURIComponent(location.href) + '&retur_txt=' + encodeURIComponent('← ' + (titel || 'Tillbaka'));
    } catch(e){ return ''; }
  }

  // FAS 2: nästa test i delkapitlet (samma ordning som renderTestFlik). nr = 1-baserat nummer.
  function nastaTest(delNr, nr){
    var t = tester(delNr); var i = (nr | 0);
    if(!t.length || i < 1 || i >= t.length) return null;   // sista test → ingen nästa
    return { titel: t[i].titel, nr: i + 1, antal: t[i].antal };
  }

  // FAS 3: elevtext — varning när eleven lämnar ett påbörjat prov med minst ett ifyllt svar.
  // Fält-form (varning:) → fångas av elevtext-låset. Samma text som sjuan.
  var FAS3_TEXT = { varning: 'Om du lämnar testet nu försvinner svaren du har fyllt i. Vill du lämna testet?' };

  // Har det inbäddade testet minst ETT ifyllt svar? (same-origin iframe → contentDocument).
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

  // FAS 3: bädda IN testet i Test-panelen (som färdighetsträningen) → flikraden ligger kvar.
  // Fast-höjd iframe med intern scroll (fast keypad fungerar i testet), parent-sidans pinnade
  // flikrad ovanför. Ramen öppnas med &embed=1. renderTestFlik kallar även initFlikrad (sidorna orörda).
  function renderTestFlik(panelEl, delNr, ramPath){
    if(!panelEl) return;
    ramPath = ramPath || '../../ak8-k1-ram.html';
    var t = tester(delNr);
    var retur = returSuffix();   // FAS 4
    function stickyHojd(){
      var tn = document.querySelector('.topnav'), tr = document.getElementById('tab-row');
      return (tn ? tn.offsetHeight : 0) + (tr ? tr.offsetHeight : 0);
    }
    function ritaLista(){
      var html = '<div style="max-width:920px;margin:24px auto;padding:28px;background:var(--paper-lt);border:1px solid var(--paper-dk);border-left:4px solid var(--gold);border-radius:6px;color:var(--ink-soft);">'
        + '<h3 style="font-family:var(--cinzel);font-size:20px;color:var(--ink);margin-bottom:8px;">Test</h3>';
      if(t.length){
        html += '<p style="font-size:14px;line-height:1.6;max-width:520px;margin:0 0 18px;">Ett färdigt test för det här delkapitlet – hopsatt åt dig ur momenten. Klicka och kör direkt.'
          + (t.length > 1 ? ' Uppdelat i ' + t.length + ' så att testen tillsammans täcker hela delkapitlet.' : '') + '</p>'
          + '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
        t.forEach(function(test, i){
          var deep = ramPath + '?view=test-fardigt&del=ak8d' + delNr + '&test=' + (i + 1) + '&embed=1' + retur;
          html += '<a href="#" class="test-lank" data-deep="' + encodeURIComponent(deep) + '" style="display:inline-block;font-family:var(--cinzel);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--gold,#9a7228);padding:12px 24px;border-radius:6px;text-decoration:none;">'
            + test.titel + ' <span style="opacity:.7;">· ' + test.antal + ' uppgifter</span></a>';
        });
        html += '</div>';
      } else {
        html += '<p style="font-size:14px;line-height:1.6;max-width:480px;">Färdigt test byggs för det här delkapitlet – öva på bladen och färdigheterna så länge.</p>';
      }
      html += '</div>';
      panelEl.innerHTML = html;
      panelEl.querySelectorAll('.test-lank').forEach(function(a){
        a.addEventListener('click', function(e){ e.preventDefault(); oppnaTest(decodeURIComponent(a.getAttribute('data-deep'))); });
      });
    }
    function oppnaTest(src){
      var h = stickyHojd() + 40;
      panelEl.innerHTML = '<div style="max-width:920px;margin:16px auto 0;padding:0 24px;">'
        + '<button type="button" class="test-tillbaka" style="font-family:var(--cinzel);font-size:12px;letter-spacing:.06em;color:var(--gold);background:none;border:1px solid var(--paper-dk);border-radius:6px;padding:8px 16px;cursor:pointer;margin-bottom:12px;">← Testlista</button>'
        + '<iframe class="test-embed-frame" title="Test" src="' + src + '" style="width:100%;border:0;display:block;background:#fff;border-radius:8px;height:calc(100vh - ' + h + 'px);min-height:440px;"></iframe></div>';
      panelEl.querySelector('.test-tillbaka').addEventListener('click', function(){
        if(testHarIfyllt(panelEl) && !window.confirm(FAS3_TEXT.varning)) return;
        ritaLista();
      });
    }
    ritaLista();
    initFlikrad();
  }

  // FAS 3: pinna flikraden + varna vid flikbyte bort från ett påbörjat prov.
  function initFlikrad(){
    var topnav = document.querySelector('.topnav'), tabRow = document.getElementById('tab-row');
    if(!tabRow || tabRow.__fas3) return; tabRow.__fas3 = true;
    tabRow.style.position = 'sticky';
    tabRow.style.top = (topnav ? topnav.offsetHeight : 0) + 'px';
    tabRow.style.zIndex = '90';
    var bg = getComputedStyle(tabRow).backgroundColor;
    if(!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') tabRow.style.background = 'var(--paper, #f6f1e8)';
    tabRow.addEventListener('click', function(e){
      var btn = e.target.closest && e.target.closest('.tab-btn'); if(!btn) return;
      var testPanel = document.querySelector('.tab-panel[data-panel="test"]');
      if(!testPanel || !testPanel.classList.contains('is-active') || btn.dataset.tab === 'test') return;
      if(testHarIfyllt(testPanel) && !window.confirm(FAS3_TEXT.varning)){ e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  window.AK8_FARDIGA = { BYGGBARA: BYGGBARA, byggbaraNoder: byggbaraNoder, tester: tester, nastaTest: nastaTest, renderTestFlik: renderTestFlik };
})();
