/* k3-forfattad-kalla.js — RAMENS FÖRFATTADE KÄLLA (order 2026-11-19). Laddas SIST i ak7-k3-ram.html.

   ADDITIV: utan ?bank= i adressen gör filen INGENTING — ramens generatordrillar (?ko=&formaga=), översikten,
   provbyggaren och de färdiga testen går exakt som förut. Ingen rad i ovamer-k3.js ändras.

   VAD DEN GÖR: ett karta-löv kan deklarera en FÖRFATTAD BANK i stället för en generator
   (bank: '<källa>:<referens>', t.ex. 'prob-ak7:instruktion/1'). Kartan länkar då hit med ?bank=…, och
   drillen serverar ur banken:
     - banken per variant = de författade instanserna, en per blad (Blad A, B, C, D — samma position på
       bladet = samma variant). Ordningen är A → B → C → D.
     - "Nytt blad" = nästa bokstav (takregeln i författad form: samma band, nya tal).
     - EFTER D (order 2026-11-20): källan ger fler blad inom bandet (källans nasta(i); för problemlösningen
       gen-prob-ak7.js — exemplens meningar med nya tal, aldrig svårare). Ger källan inget blad till
       (variant som inte bär) visas knappen inte — inget dåligt blad serveras.
     - Horisonten: källan bär sin årskurs; över ramens årskurs serveras inget (översikten visas i stället).

   RENDERINGEN ÄR UPPGIFTSSIDANS: källan ritar med sin egen bladkomponent (för problemlösningen
   ProbBankAk7.rita → ProbBlad/ProbBlad2.render) och rättar med ProbRattare. Ingen ny problem-visare här.
   Källans filer laddas FÖRST NÄR en bank efterfrågas — ramen bär dem inte annars.

   En källa registreras i KALLOR nedan: vilka filer den behöver och hur instanserna hämtas. */
(function(){
  'use strict';
  /* REGISTRET DELAS (Joachim 2026-11-24): metodträningens drill öppnas som en egen sida med uppgiftssidans upplägg
     (js/motor/arbetsyta/drill.html). Den sidan använder samma källor härifrån (window.ForfattadKalla) och sätter
     window.FK_EGEN_SIDA före laddningen, så att ramens bankläge nedan inte körs där. Sökvägarna är från sajtens rot.
     Per källa, för drillsidan: krav = filer ramen redan bär men en egen sida måste ladda; delkapitel = sidan
     Tillbaka och brödsmulan leder till; knapprader = bladkomponentens knapprad (Arbetsyta.placera); arbetsyta(b) =
     bladet i uppgiftssidans form. */
  var KALLOR = {
    // Problemlösning åk7 (js/motor/problemlosning/prob-bank-ak7.js): referens '<typ>/<variant>'
    'prob-ak7': {
      css: ['js/motor/keypad.css', 'js/motor/problemlosning/prob-blad.css'],
      skript: ['js/motor/ekvationer-balans/ekv-parser.js', 'js/motor/ekvationer-balans/ekv-kedja.js',
               'js/motor/problemlosning/prob-modell.js', 'js/motor/problemlosning/prob-rattare.js',
               'js/motor/problemlosning/gen-prob-ak7.js',   // behöver GEN_AK8_ALG1 (ramen laddar gen-ak8-alg1.js)
               'js/motor/problemlosning/prob-blad.js', 'js/motor/problemlosning/prob-blad2.js',
               'js/motor/problemlosning/prob-bank-ak7.js'],
      hamta: function(ref){ return window.ProbBankAk7 && window.ProbBankAk7.drillKalla(ref); },
      knappsats: function(){ return window.ProbBankAk7 && window.ProbBankAk7.knappsats(); },
      krav: ['js/motor/blad/ak8-blad-ui.js', 'js/motor/figur/svg-algebrafigur.js', 'js/data/band-ak8-alg1.js', 'js/motor/blad/gen-ak8-alg1.js'],
      delkapitel: { namn: 'Problemlösning', adress: 'ak7/k3/d5-problemlosning-nyformat/index.html', arskurs: 7, kapitel: 3 },
      knapprader: '.nf-yta .prob-kort .actions',
      // Uppgiftssidans form (som d5:s uppgift.html): "1." på frågans rad och arbetsytans rutor.
      arbetsyta: function(b){ var c = {}; Object.keys(b || {}).forEach(function(k){ c[k] = b[k]; }); c.numrering = 'tal'; c.arbetsyta = true; return c; }
    },
    /* Del 1 Algebraiska uttryck åk7, metodträningens banker (js/motor/blad/blad-k3-d1-metod.js, Joachim 2026-11-24):
       referens = lövet ('T1' … 'R6'). Ritas med bladkärnan (bygg_blad) — samma komponent och samma uppgiftstyper som
       bladen; kärnan monterar sin egen delade knappsats. Stilen är uppgiftssidans (kanon + kärnans typfiler) med
       uppgiftssidans färger, som ramen saknar; den laddas bara i det här bankläget. Mastery: k3-storen och, för
       prioriteringsregeln, k1-storen (mastery.js). */
    'k3d1': {
      css: ['js/motor/blad/ak7-delkapitel-kanon.css', 'js/motor/blad/ak7-k1blad-kanon.css', 'js/motor/blad/karna-b-grund.css',
            'js/motor/blad/karna-b-talfoljd.css', 'js/motor/blad/tecken.css', 'js/motor/keypad.css'],
      stil: ':root{--navy:#0f1e2e;--navy-mid:#1a3045;--blue:#1b4b8a;--blue-lt:#2560a8;--green:#2d6a4f;'
          + "--body:'Source Serif 4',Georgia,serif;--c-rakna:#16a34a;--rod:#b23b2e;--rod-lt:#c0392b;--las:#9a9388;}"
          + ".fk-drill{--mono:'Source Serif 4',Georgia,serif;}"
          + '.fk-drill .fk-d1-blad{max-width:900px;margin:18px auto 0;padding:0 28px;}',
      // nya-tal.js: räknelöven R1, R3–R5 har nya tal efter banken (kroken nedan; Joachim 2026-11-26).
      skript: ['js/mastery.js', 'js/motor/blad/blad-karna-b.js', 'js/motor/blad/blad-k3-d1-typer.js', 'js/motor/ovamer/nya-tal.js',
               'js/motor/blad/blad-k3-d1-metod.js'],
      hamta: function(ref){ return window.BLAD_K3_D1_METOD && window.BLAD_K3_D1_METOD.drillKalla(ref); },
      knappsats: function(){ return document.getElementById('ovn-keypad-shared'); },
      krav: ['js/motor/alg-brak.js', 'js/motor/blad/ak8-blad-ui.js', 'js/motor/figur/svg-algebrafigur.js'],
      delkapitel: { namn: 'Algebraiska uttryck', adress: 'ak7/k3/d1-algebraiska-uttryck-nyformat/index.html', arskurs: 7, kapitel: 3 },
      knapprader: '.nf-yta .ovn-kontroll-rad',
      montering: 'nf-mount'          // källans rita lägger själv bladet i en ny .ovn-wrap per blad
    },
    /* Del 3 Förenkla uttryck åk7, metodträningens banker (js/motor/blad/blad-k3-d3-metod.js, Joachim 2026-11-25): referens
       = lövet ('P1' … 'P7', och grenarna 1–4). Byggd som k3d1: banken i en fil, ritad med bladkärnan och d3:s uppgiftstyper
       (blad-k3-d3-typer.js, samma som bladen). Räknelöven har nya tal efter banken (nya-tal.js, se kroken nedan).
       Mastery: k3-storen och, för negativa tal, k1-storen (mastery.js). */
    'k3d3': {
      css: ['js/motor/blad/ak7-delkapitel-kanon.css', 'js/motor/blad/ak7-k1blad-kanon.css', 'js/motor/blad/karna-b-grund.css',
            'js/motor/blad/karna-b-talfoljd.css', 'js/motor/blad/tecken.css', 'js/motor/blad/ak8-blad-ui.css', 'js/motor/keypad.css'],
      stil: ':root{--navy:#0f1e2e;--navy-mid:#1a3045;--blue:#1b4b8a;--blue-lt:#2560a8;--green:#2d6a4f;'
          + "--body:'Source Serif 4',Georgia,serif;--c-rakna:#16a34a;--rod:#b23b2e;--rod-lt:#c0392b;--las:#9a9388;}"
          + ".fk-drill{--mono:'Source Serif 4',Georgia,serif;}"
          + '.fk-drill .fk-d1-blad{max-width:900px;margin:18px auto 0;padding:0 28px;}',
      skript: ['js/mastery.js', 'js/motor/blad/blad-karna-b.js', 'js/motor/mellanled-rattare.js', 'js/motor/figur/svg-tallinje.js',
               'js/motor/blad/blad-k3-d3-typer.js', 'js/motor/ovamer/nya-tal.js', 'js/motor/blad/blad-k3-d3-metod.js'],
      hamta: function(ref){ return window.BLAD_K3_D3_METOD && window.BLAD_K3_D3_METOD.drillKalla(ref); },
      knappsats: function(){ return document.getElementById('ovn-keypad-shared'); },
      krav: ['js/motor/alg-brak.js', 'js/motor/blad/ak8-blad-ui.js', 'js/motor/figur/svg-algebrafigur.js'],
      delkapitel: { namn: 'Förenkla uttryck', adress: 'ak7/k3/d3-forenkla-uttryck-nyformat/index.html', arskurs: 7, kapitel: 3 },
      knapprader: '.nf-yta .ovn-kontroll-rad',
      montering: 'nf-mount'
    },
    /* Kapitel 4 Procent, Del 1, metodträningens banker (js/motor/blad/blad-k4-d1-metod.js, Joachim 2026-11-26):
       referens = lövet ('B1' … 'B7', 'A1' … 'A7', 'D1' … 'D7', 'H1' … 'H7'; Andelens svarsrad ur blad-k4-d1-andelen.js, Delens stegrad ur blad-k4-d1-delen.js, Det helas spegelvända stegrad ur blad-k4-d1-hela.js). Ritas med bladkärnan och bladens byggstenar (blad-k4-d1-procent.js: formkedjan,
       figurerna). B2–B6, A1–A3, D1–D3 och H1–H3 har nya tal efter banken: mallen först, sedan lövets talregel (NyaTal.medTalregel, kroken nedan).
       Mastery: kapitel 4:s store (mastery-k4.js). */
    'k4d1': {
      css: ['js/motor/blad/ak7-delkapitel-kanon.css', 'js/motor/blad/ak7-k1blad-kanon.css', 'js/motor/blad/karna-b-grund.css',
            'js/motor/blad/ak8-blad-ui.css', 'js/motor/keypad.css'],
      stil: ':root{--navy:#0f1e2e;--navy-mid:#1a3045;--blue:#1b4b8a;--blue-lt:#2560a8;--green:#2d6a4f;'
          + "--body:'Source Serif 4',Georgia,serif;--c-rakna:#16a34a;--rod:#b23b2e;--rod-lt:#c0392b;--las:#9a9388;}"
          + ".fk-drill{--mono:'Source Serif 4',Georgia,serif;}"
          + '.fk-drill .fk-d1-blad{max-width:900px;margin:18px auto 0;padding:0 28px;}',
      skript: ['js/mastery.js', 'js/mastery-k4.js', 'js/motor/blad/blad-karna-b.js', 'js/motor/figur/svg-andel.js',
               'js/motor/figur/svg-tallinje.js', 'js/motor/ovamer/nya-tal.js', 'js/motor/blad/blad-k4-d1-procent.js',
               'js/motor/figur/svg-algebrafigur.js', 'js/motor/blad/blad-k4-d1-andelen.js', 'js/motor/blad/blad-k4-d1-delen.js',
               'js/motor/blad/blad-k4-d1-hela.js', 'js/motor/blad/blad-k4-d1-metod.js'],
      hamta: function(ref){ return window.BLAD_K4_D1_METOD && window.BLAD_K4_D1_METOD.drillKalla(ref); },
      knappsats: function(){ return document.getElementById('ovn-keypad-shared'); },
      krav: ['js/motor/alg-brak.js', 'js/motor/blad/ak8-blad-ui.js'],
      delkapitel: { namn: 'Procent', adress: 'ak7/k4/d1-procent/index.html', arskurs: 7, kapitel: 4 },
      knapprader: '.nf-yta .ovn-kontroll-rad',
      montering: 'nf-mount'
    }
  };
  /* NYA TAL EFTER BANKEN (KONVENTIONER, METODTRÄNING; Joachim 2026-11-25): ett löv som bär `mall` (mallarna, lövets
     talregler och hur ett blad byggs) får sin nasta(i) av den delade mekanismen i js/motor/ovamer/nya-tal.js — banken
     först, sedan samma form med nya tal. Källan anger bara data; ingen källa bygger en egen generator. Ett löv utan
     `mall` (valuppgifter, ringa in, tolka, teckna, tillämpning) serverar bara sina författade uppgifter. */
  Object.keys(KALLOR).forEach(function(id){
    var K = KALLOR[id], h = K.hamta;
    // Ett löv vars mall bär talregel (procent, kapitel 4) får samma mekanism med lövets talregel (NyaTal.medTalregel).
    K.hamta = function(ref){ var k = h(ref); return (k && k.mall && !k.nasta && window.NyaTal)
      ? (k.mall.talregel ? window.NyaTal.medTalregel(k) : window.NyaTal.medNasta(k)) : k; };
  });

  function laddaCss(href){ var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }
  function laddaSkript(lista, klar){
    var i = 0;
    (function nasta(){
      if(i >= lista.length) return klar(true);
      var s = document.createElement('script'); s.src = lista[i++];
      s.onload = nasta; s.onerror = function(){ klar(false); };
      document.body.appendChild(s);
    })();
  }
  // 'k3d1:T1' → { kallId: 'k3d1', ref: 'T1', K: källan }
  function delaBank(bank){
    var p = String(bank || '').indexOf(':');
    var kallId = p > 0 ? bank.slice(0, p) : bank, ref = p > 0 ? bank.slice(p + 1) : '';
    return { kallId: kallId, ref: ref, K: KALLOR[kallId] || null };
  }
  window.ForfattadKalla = { KALLOR: KALLOR, delaBank: delaBank, laddaCss: laddaCss, laddaSkript: laddaSkript };
  if(window.FK_EGEN_SIDA) return;                     // drillsidan: registret räcker

  var q; try { q = new URLSearchParams(location.search); } catch(e){ return; }
  var bank = q.get('bank');
  if(!bank) return;                                   // ← inget bank-läge: ramen är orörd

  var ELEVENS_AR = 7;                                 // ak7-k3-ram.html är sjuans kapitel 3-ram

  // ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
  var TEXT = { nytt: { titel: 'Nytt blad' } };

  var CSS = ''
    + '.fk-drill .prob-kort{max-width:none;margin:0;padding:6px 28px 18px;}'
    + '.fk-nytt{display:flex;justify-content:flex-start;margin:4px 28px 24px;}';

  function nar(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function tillOversikt(){ if(typeof window.renderOversikt === 'function') window.renderOversikt(); }
  var _b = delaBank(bank), ref = _b.ref, K = _b.K;

  nar(function(){
    if(!K){ tillOversikt(); return; }
    K.css.forEach(laddaCss);
    var st = document.createElement('style'); st.textContent = CSS + (K.stil || ''); document.head.appendChild(st);
    laddaSkript(K.skript, function(ok){
      var kalla = ok ? K.hamta(ref) : null;
      if(!kalla || !kalla.instanser || !kalla.instanser.length || kalla.arskurs > ELEVENS_AR){ tillOversikt(); return; }
      var hero = document.getElementById('hero'); if(hero) hero.style.display = 'none';
      var app = document.getElementById('app'); if(!app) return;

      var yta = document.createElement('div'); yta.className = 'fk-drill'; yta.setAttribute('data-bank', bank);
      var mount = document.createElement('div'); mount.className = 'fk-mount';
      var rad = document.createElement('div'); rad.className = 'fk-nytt';
      var nytt = document.createElement('button'); nytt.type = 'button'; nytt.className = 'btn primary'; nytt.textContent = TEXT.nytt.titel;
      nytt.setAttribute('data-action', 'nytt-blad');
      rad.appendChild(nytt); yta.appendChild(mount); yta.appendChild(rad); app.appendChild(yta);

      // Blad nr i: källans nasta(i) när den finns (fler blad efter D), annars bara de författade.
      function instans(i){ return kalla.nasta ? kalla.nasta(i) : (kalla.instanser[i] || null); }
      var start = 0, onskad = (q.get('blad') || '').toUpperCase();
      for(var s = 0; s < 60 && onskad; s++){ var x = instans(s); if(!x) break; if(x.bokstav === onskad){ start = s; break; } }
      var nu = start;
      function visa(i){
        nu = i;
        var inst = instans(i);
        kalla.rita(mount, inst.blad);
        yta.setAttribute('data-blad', inst.bokstav);
        rad.hidden = !instans(i + 1);                 // inget nästa blad → ingen knapp (inget dåligt blad)
        try { var u = new URLSearchParams(location.search); u.set('blad', inst.bokstav); history.replaceState(null, '', '?' + u.toString()); } catch(e){}
      }
      nytt.addEventListener('click', function(){ if(instans(nu + 1)){ visa(nu + 1); window.scrollTo(0, 0); } });
      visa(start);
      K.knappsats();
    });
  });
})();
