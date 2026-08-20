/* k1-fardiga-test.js — FÄRDIGA delkapitel-test för åk7 kapitel 1 (taluppfattning).
   Samma mekanism som ak8-fardiga-test.js: coverage-komplett split (typ-antal-drivet) över
   delkapitlets byggbara noder; ramen bygger via PB.byggFardigt (coverage-seedning + färdigt-läge).
   Byggbara noder = k1:s GEN_NOD-målnoder (ak7-k1-ram.html), belief (primtal:problem/position:resonera)
   exkluderade. Delkapitel→nod via taxonomins visning.utbudslista (d1–d8). GDPR: ren data + DOM, inget nät. */
(function(){
  'use strict';

  // Byggbara noder — spegel av GEN_NOD-värdena i ak7-k1-ram.html (HÅLL I SYNK om generatorer läggs till).
  // Belief exkluderad (primtal:problem = gata/problem, position:resonera = jamfor-tal → självskattningen).
  var BYGGBARA = {};
  ['primtal:begrepp','primtal:rakna','primtal:kommunikation','delbarhet:rakna','delbarhet:begrepp',
   'siffror:begrepp','position:begrepp','position:rakna','utvecklad:metod','utvecklad:rakna','rakneträning:rakna',
   'add-begrepp:begrepp','add-rakna:rakna','add-metoder:uppstallning','sub-begrepp:begrepp','sub-rakna:rakna',
   'sub-metoder:uppstallning','mult-begrepp:begrepp','mult-tabell:rakna','mult-metoder:uppstallning',
   'div-begrepp:begrepp','div-tabell:rakna','div-metoder:kort','prio-samband:rakna','prio-prioritering:rakna',
   'prio-lagar:kommutativa','prio-lagar:associativa','prio-lagar:distributiva','neg-begrepp:begrepp',
   'neg-rakna:addsub','neg-rakna:multdiv','bd-vaxla:rakna','bd-tillbrak:rakna','bd-hundra:rakna','bd-forlang:rakna',
   'mult-rakna:pow10','div-rakna:pow10','mult-rakna:stora','div-rakna:stora'
   // avr-avrundning:begrepp + avr-overslag:rakna BORTTAGNA (spec-kontroll FAS 2.D): öva-bladet (d8)
   // är BLAD_TOM ("byggs snart") → inget härledbart tak → nod-kan ej testas säkert. Åter in när bladet finns.
  ].forEach(function(n){ BYGGBARA[n] = 1; });

  // Antal test-TYPER (snabb-generatorer) per nod — spegel av GEN_NOD. Styr coverage-splitten. Default 1.
  var TYP_PER_NOD = { 'primtal:rakna':2, 'sub-rakna:rakna':2,
    // sjuan-sweep tillägg:
    'add-rakna:rakna':4, 'neg-rakna:addsub':3, 'neg-begrepp:begrepp':2, 'position:rakna':3,
    'mult-rakna:stora':2, 'div-rakna:stora':2 };
  function typCount(n){ return TYP_PER_NOD[n] || 1; }

  // NIANS dk1 (Åk 9-spåret): explicit nod-scope. Öva 1–3:s ak9-noder spänner flera delkapitel
  // (d2/d5/d6) → ingen enskild utbudslista fångar dem, så listan anges direkt. KonceptTÄCKER öva-
  // bladen med ramens testbara noder: decimal-mult/div testas via mult-sma-dec/div-sma-dec, som i
  // ramens GEN_NOD mappar till :stora-noderna (öva/ak9 loggar samma koncept till :sma/:storasma —
  // ramen är kronjuvel/orörd, så testet loggar decimaler till :stora; båda noderna färgas, ingen
  // evidens tappas). Ren additiv gren — d1–d8 orörda, åk7/åk8-testen byte-identiska.
  // Nians noder mappar mot vad Öva 1–3 faktiskt tränar: Öva 1 tiopotens (pow10), Öva 2 decimal ×/÷
  // (sma/div:sma), stora + stora-och-små (stora/storasma), Öva 3 prioritering. div-rakna:stora UT
  // (ingen öva-motsvarighet — Öva 2:s division är decimal via förlängning, inte "division med stora tal").
  var AK9_DK1_NODER = ['mult-rakna:pow10', 'div-rakna:pow10', 'mult-rakna:sma', 'div-rakna:sma', 'mult-rakna:stora', 'mult-rakna:storasma', 'prio-prioritering:rakna'];
  // Feature-set per nod (nivå-parameter). Skickas som cfg.varianter → generatorns makeItem(features).
  // Talområde = första axeln; fler axlar (struktur) läggs till per färdighet efter hand. Noder utan
  // entry → ingen feature → generatorns default. Författad tabell, fylls på per generator.
  var AK9_DK1_VARIANTER = {
    'mult-rakna:pow10': { talomrade: 'nian' },   // decimaloperander + decimala tiopotenser (öva 1)
    'div-rakna:pow10':  { talomrade: 'nian' },
    'mult-rakna:stora': { talomrade: 'nian' },
    'mult-rakna:storasma': { talomrade: 'nian' },   // kompensations-mellanled
    'div-rakna:sma': { talomrade: 'nian' },          // förlängnings-mellanled
    'prio-prioritering:rakna': { struktur: ['parenteser','koefficient','brakstreck'], nivaer: [1,2,3] }  // nivåer = öva 3:s tre grupper (spridning)
  };

  // Byggbara noder i ett delkapitel: taxonomins noder med visning.utbudslista===del ∩ BYGGBARA (taxonomi-ordning).
  function byggbaraNoder(del){
    // Nians noder har EGNA ram-generatorer (decimal-mult/div, storasma) som medvetet INTE ligger i
    // delade BYGGBARA — annars skulle de hamna i åk7:s d6/d7-färdigtest. Därför ingen BYGGBARA-filter här.
    if(del === 'ak9-dk1') return AK9_DK1_NODER.slice();
    var tax = window.K1_TAXONOMI; if(!tax || !tax.noder) return [];
    var ut = [];
    tax.noder.forEach(function(n){
      if(n.visning && n.visning.utbudslista === del && BYGGBARA[n.id] && ut.indexOf(n.id) < 0) ut.push(n.id);
    });
    return ut;
  }

  function antalFor(ns){ var tot = ns.reduce(function(s, n){ return s + typCount(n); }, 0); return Math.min(20, Math.max(10, tot * 3)); }

  // INNEHÅLLS-SPLIT (spec-kontroll FAS 3): ETT test per innehålls-GRUPP (taxonomins visning.grupp),
  // inte TYP_CAP-packning. Färre noder per test, fler test, och testet heter det det gäller ("Multiplikation")
  // i st.f. "Test 1". Testen tillsammans täcker fortfarande hela delkapitlet.
  function gruppAv(id){
    var tax = window.K1_TAXONOMI;
    var n = tax && tax.noder && tax.noder.filter(function(x){ return x.id === id; })[0];
    return (n && n.visning && n.visning.grupp) || 'Övrigt';
  }
  function tester(del){
    var noder = byggbaraNoder(del); if(!noder.length) return [];
    var ordning = [], grupper = {};
    noder.forEach(function(n){ var g = gruppAv(n); if(!grupper[g]){ grupper[g] = []; ordning.push(g); } grupper[g].push(n); });
    var varianter = (del === 'ak9-dk1') ? AK9_DK1_VARIANTER : undefined;
    return ordning.map(function(g){ var ns = grupper[g]; return { titel: g, nodes: ns, antal: antalFor(ns), varianter: varianter }; });
  }

  // Rendera Test-flikens innehåll: färdig-test-knappar (deeplink → ramens ?view=test-fardigt&del=dN&test=M).
  // del = delkapitel-id ('d1'..'d8'). ramPath = relativ sökväg till ak7-k1-ram.html.
  // FAS 4: retur-suffix till test-deeplinken — var eleven ska tillbaka (denna delkapitel-sida) + etikett.
  // Motorns take-back pekar dit i st.f. att gömmas (färdigt test har inga inställningar att gå till).
  function returSuffix(){
    try {
      if(typeof location === 'undefined' || !location.href) return '';
      var titel = (typeof document !== 'undefined' && document.title) ? document.title.split(/[–—·|]/)[0].trim() : '';
      return '&retur=' + encodeURIComponent(location.href) + '&retur_txt=' + encodeURIComponent('← ' + (titel || 'Tillbaka'));
    } catch(e){ return ''; }
  }

  // FAS 3: elevtext — varning när eleven lämnar ett påbörjat prov med minst ett ifyllt svar.
  // Fält-form (varning:) → fångas av elevtext-låset (verktyg/elevtext-grind.js scannar denna fil).
  var FAS3_TEXT = { varning: 'Om du lämnar testet nu försvinner svaren du har fyllt i. Vill du lämna testet?' };

  // Har det inbäddade testet minst ETT ifyllt svar? (same-origin iframe → contentDocument).
  // Kollar test-take-vyns rutor: markerade val (.is-selected) eller ifyllda textrutor ([data-sub-input]).
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

  // FAS 3: bädda IN testet i Test-panelen (som färdighetsträningen) så flikraden ligger kvar.
  // Fast-höjd iframe med INTERN scroll → den fasta keypaden fungerar inuti testet; parent-sidans
  // pinnade topnav + flikrad står kvar ovanför. ramPath öppnas med &embed=1 (ramen döljer eget krom).
  function renderTestFlik(panelEl, del, ramPath){
    if(!panelEl) return;
    ramPath = ramPath || '../../../ak7-k1-ram.html';
    var t = tester(del);
    var retur = returSuffix();   // FAS 4: var eleven ska tillbaka (delkapitel-sidan)

    function stickyHojd(){
      var tn = document.querySelector('.topnav'), tr = document.getElementById('tab-row');
      return (tn ? tn.offsetHeight : 0) + (tr ? tr.offsetHeight : 0);
    }
    function ritaLista(){
      var html = '<div class="test-note" style="text-align:left;"><h3>Test</h3>';
      if(t.length){
        html += '<p style="margin:0 0 18px;">Färdiga test för det här delkapitlet – hopsatta ur momenten. Klicka och kör direkt.'
          + (t.length > 1 ? ' Uppdelat i ' + t.length + ' så att testen tillsammans täcker hela delkapitlet.' : '') + '</p>'
          + '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
        t.forEach(function(test, i){
          var deep = ramPath + '?view=test-fardigt&del=' + del + '&test=' + (i + 1) + '&embed=1' + retur;
          html += '<a href="#" class="test-lank" data-deep="' + encodeURIComponent(deep) + '">' + test.titel + ' <span style="opacity:.7;">· ' + test.antal + ' uppgifter</span></a>';
        });
        html += '</div>';
      } else {
        html += '<p>Färdigt test byggs för det här delkapitlet – öva på bladen och färdigheterna så länge.</p>';
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
        if(testHarIfyllt(panelEl) && !window.confirm(FAS3_TEXT.varning)) return;   // navigering bort från provet
        ritaLista();
      });
    }
    ritaLista();
  }

  // FAS 3: pinna flikraden (som embed-topnaven) + varna vid flikbyte bort från ett påbörjat prov.
  function initFlikrad(){
    var topnav = document.querySelector('.topnav'), tabRow = document.getElementById('tab-row');
    if(!tabRow) return;
    tabRow.style.position = 'sticky';
    tabRow.style.top = (topnav ? topnav.offsetHeight : 0) + 'px';
    tabRow.style.zIndex = '90';
    var bg = getComputedStyle(tabRow).backgroundColor;
    if(!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') tabRow.style.background = 'var(--paper, #f6f1e8)';
    // Capture → körs FÖRE bladets flik-handler. Lämnar man Test-fliken med ifyllt svar: varna, spara ej.
    tabRow.addEventListener('click', function(e){
      var btn = e.target.closest && e.target.closest('.tab-btn'); if(!btn) return;
      var testPanel = document.querySelector('.tab-panel[data-panel="test"]');
      if(!testPanel || !testPanel.classList.contains('is-active') || btn.dataset.tab === 'test') return;
      if(testHarIfyllt(testPanel) && !window.confirm(FAS3_TEXT.varning)){ e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  // FAS 2: nästa test i delkapitlets lista (samma ordning som renderTestFlik). nr = 1-baserat nummer
  // på testet som just kördes. Returnerar { titel, nr } för nästa, eller null om nr var det SISTA.
  function nastaTest(del, nr){
    var t = tester(del); var i = (nr | 0);   // nästa index (0-baserat) = nr, eftersom current är nr-1
    if(!t.length || i < 1 || i >= t.length) return null;   // sista test (eller okänt) → ingen nästa
    return { titel: t[i].titel, nr: i + 1, antal: t[i].antal };
  }

  window.K1_FARDIGA = { BYGGBARA: BYGGBARA, byggbaraNoder: byggbaraNoder, tester: tester, nastaTest: nastaTest, renderTestFlik: renderTestFlik };

  // Auto-init på delkapitel-sidor: finns en Test-flik-panel + del-id i URL → rendera Test-knapparna.
  // Ramen (ak7-k1-ram.html) saknar denna panel → hoppas; den wirar färdiga test via boot-deeplinken.
  try {
    if(typeof document !== 'undefined' && document.querySelector){
      var _tp = document.querySelector('.tab-panel[data-panel="test"]');
      var _m = (location.pathname || '').match(/\/(d\d+)-/);
      if(_tp && _m){ renderTestFlik(_tp, _m[1], '../../../ak7-k1-ram.html'); initFlikrad(); }
    }
  } catch(e){}
})();
