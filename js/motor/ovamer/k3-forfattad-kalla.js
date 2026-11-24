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
  var q; try { q = new URLSearchParams(location.search); } catch(e){ return; }
  var bank = q.get('bank');
  if(!bank) return;                                   // ← inget bank-läge: ramen är orörd

  var ELEVENS_AR = 7;                                 // ak7-k3-ram.html är sjuans kapitel 3-ram

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
      knappsats: function(){ return window.ProbBankAk7 && window.ProbBankAk7.knappsats(); }
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
      skript: ['js/mastery.js', 'js/motor/blad/blad-karna-b.js', 'js/motor/blad/blad-k3-d1-typer.js', 'js/motor/blad/blad-k3-d1-metod.js'],
      hamta: function(ref){ return window.BLAD_K3_D1_METOD && window.BLAD_K3_D1_METOD.drillKalla(ref); },
      knappsats: function(){ return document.getElementById('ovn-keypad-shared'); }
    }
  };

  // ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
  var TEXT = { nytt: { titel: 'Nytt blad' } };

  var CSS = ''
    + '.fk-drill .prob-kort{max-width:none;margin:0;padding:6px 28px 18px;}'
    + '.fk-nytt{display:flex;justify-content:flex-start;margin:4px 28px 24px;}';

  function nar(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function tillOversikt(){ if(typeof window.renderOversikt === 'function') window.renderOversikt(); }
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

  var p = bank.indexOf(':'), kallId = p > 0 ? bank.slice(0, p) : bank, ref = p > 0 ? bank.slice(p + 1) : '';
  var K = KALLOR[kallId];

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
