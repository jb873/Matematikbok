/* ak8-fardiga-test.js — FÄRDIGA delkapitel-test för åk8 kapitel 1 (auto-assemblerade).
   Ett färdigt test = ett FÖRVALT urval av delkapitlets byggbara noder med storleks-cap och
   ev. split. INGEN egen test-mekanism: launchar provbyggarens PB.byggFardigt (= generateTest +
   samma take/rättning). Provbyggar-motorn och drillarna är orörda.

   Assembly (ren beräkning ur AK8_K1_BOK + BYGGBARA):
     • byggbara noder per delkapitel = delkapitlets blad-noder ∩ BYGGBARA (= AK8_GEN_NOD-värden).
     • cap 10–18 svarbara items/test (motorn räknar items rätt: 1.a,b,c = 3).
     • SPLIT (BREDD) vid ≥6 byggbara noder → två test, nod-mängden delad i två (test 1 / test 2 efter
       VAD som testas). Färre noder → ETT test. (DJUP-split kräver generatorer med läsbar nivå-opt;
       åk8-generatorerna randomiserar formen internt och exponerar ingen nivå → BREDD är axeln här.)

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
    'neg-rakna:addsub': 4, 'neg-rakna:multdiv': 2, 'neg-begrepp:begrepp': 2,
    // dk4/dk5 bråk: decimal→bråk + decimal→blandad (brak-blandad), min→dec (tid), bråk±dec (add)
    'brak-tid:rakna': 2, 'brak-add:rakna': 2,
    // dk8/dk10 potens: +decimalbas/bråkbas (evaluera), +avkoda (gp skriva), +x-i-nämnaren (gp losut)
    'pot-begrepp:evaluera': 3, 'gp-rakna:skriva': 2, 'gp-rakna:losut': 2
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

  var TYP_CAP = 5;   // max typer per test (≥6-typ-nod hamnar ändå ensam) → 10–20 items när alla seedas

  // COVERAGE-KOMPLETT SPLIT: packa noder i test så varje test ≤ TYP_CAP typer; testen TILLSAMMANS
  // täcker delkapitlets alla quiz-bara typer. Antal test drivet av typ-antalet (ej fast). Bredd-axeln.
  function tester(delNr){
    var noder = byggbaraNoder(delNr);
    if(!noder.length) return [];
    var tests = [], cur = [], curTyp = 0;
    noder.forEach(function(n){
      var tc = typCount(n);
      if(cur.length && curTyp + tc > TYP_CAP){ tests.push(cur); cur = []; curTyp = 0; }
      cur.push(n); curTyp += tc;
    });
    if(cur.length) tests.push(cur);
    return tests.map(function(ns, i){
      return { titel: tests.length > 1 ? 'Test ' + (i + 1) : 'Test', nodes: ns, antal: antalFor(ns) };
    });
  }

  // Rendera Test-flikens innehåll: färdig-test-knappar (länkar till ramens ?view=test-fardigt) +
  // "Skapa eget test →" bredvid. ramPath = relativ sökväg till ak8-k1-ram.html från sidan.
  function renderTestFlik(panelEl, delNr, ramPath){
    if(!panelEl) return;
    ramPath = ramPath || '../../ak8-k1-ram.html';
    var t = tester(delNr);
    var html = '<div style="max-width:920px;margin:24px auto;padding:28px;background:var(--paper-lt);border:1px solid var(--paper-dk);border-left:4px solid var(--gold);border-radius:6px;color:var(--ink-soft);">'
      + '<h3 style="font-family:var(--cinzel);font-size:20px;color:var(--ink);margin-bottom:8px;">Test</h3>';
    if(t.length){
      html += '<p style="font-size:14px;line-height:1.6;max-width:520px;margin:0 0 18px;">Ett färdigt test för det här delkapitlet – hopsatt åt dig ur momenten. Klicka och kör direkt.'
        + (t.length > 1 ? ' Det är uppdelat i två så att varje test håller lagom längd.' : '') + '</p>'
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
      t.forEach(function(test, i){
        var url = ramPath + '?view=test-fardigt&del=ak8d' + delNr + '&test=' + (i + 1);
        html += '<a href="' + url + '" style="display:inline-block;font-family:var(--cinzel);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--gold,#9a7228);padding:12px 24px;border-radius:6px;text-decoration:none;">'
          + test.titel + ' <span style="opacity:.7;">· ' + test.antal + ' uppgifter</span></a>';
      });
      html += '</div>';
    } else {
      html += '<p style="font-size:14px;line-height:1.6;max-width:480px;">Färdigt test byggs för det här delkapitlet – öva på bladen och färdigheterna så länge.</p>';
    }
    // Test-fliken = bara det färdiga testet. "Skapa eget test" görs i provbyggaren (annat ställe).
    html += '</div>';
    panelEl.innerHTML = html;
  }

  window.AK8_FARDIGA = { BYGGBARA: BYGGBARA, byggbaraNoder: byggbaraNoder, tester: tester, renderTestFlik: renderTestFlik };
})();
