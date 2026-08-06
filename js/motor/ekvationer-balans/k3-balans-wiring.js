/* k3-balans-wiring.js — DEEPLINK-ROUTER + OBSERVERANDE loggning för balansmetoden (Del4).
   ── KRONJUVEL: ekvationer-balans.js ÄNDRAS INTE EN RAD. Den är ett bar-script vars funktioner
      och variabler blir globaler (aktivFlik, FLIKAR, renderFlikar, visaFlik, uppgifter). Detta
      omslag griper de globalerna utifrån — logiken, parsern och per-rad-rättningen är orörda. ──
   Laddas SIST på d4-ekvationer-sidan (efter ekvationer-balans.js + mastery-k3.js). Två jobb:

   1. ROUTER: ?ko=&formaga= → rätt sektion. Noderna särskiljs av ?ko= (båda har formaga=rakna).
      Sätter globalen aktivFlik + kallar visaFlik() — samma väg som fliken själv.

   2. LOGGNING: EN LÖST EKVATION = ETT EVENT. Balansmetoden sätter .uppg-klar → .show EXAKT när
      en ekvation är löst (kontrolleraUppg, ekvationer-balans.js:429) — per EKVATION, inte per rad.
      Vi observerar den signalen (MutationObserver på #card) och loggar 'ratt' en gång per löst
      ekvation till MasteryK3. Per-rad-signalen (rad-ok) IGNORERAS — den skulle överräkna grovt
      (samma fel som gjorde jamforTal obrukbar som observationsyta). Ingen motorrad ändras.

   Parentes-noden (alg-ekv-parentes) wiras ALDRIG här: parsern avvisar 3(x+2) rent och parenteser
   är författade som fördjupning → den noden står som "kommer" (generator:null). GDPR: bara
   MasteryK3 (localStorage), inget nät. Loggar bara i deeplink-läge för en wirad nod. */
(function(){
  'use strict';
  // FLIKAR-index → Del4-nod (belägg: FLIKAR, ekvationer-balans.js:190-198). Loggningen härleds ur
  // den AKTIVA sektionen (aktivFlik) — inte ur ?ko= — så balansmetoden loggar oavsett hur d4-sidan
  // nås (kapitelkort ELLER karta-deeplink). Endast de två live-sektionerna; övriga flikar = ingen logg.
  var FLIK_NOD = {
    1: 'alg-ekv-ensidig:rakna',    // FLIKAR[1] = "Grunderna" (niva 0, ensidig)
    2: 'alg-ekv-badaled:rakna'     // FLIKAR[2] = "Variabel i båda leden" (niva 1)
  };
  // Inverterad karta för ?ko=-routern (deeplink → sektion).
  var SEKTION = {}; Object.keys(FLIK_NOD).forEach(function(i){ SEKTION[FLIK_NOD[i]] = +i; });

  function aktuellNod(){
    try { var q = new URLSearchParams(location.search), ko = q.get('ko'), f = q.get('formaga');
      return (ko && f) ? ko + ':' + f : null; } catch(e){ return null; }
  }
  var deepNod = aktuellNod();

  // ── 1. Router: ?ko= pre-väljer sektionen (griper globalen aktivFlik + visaFlik; logiken orörd) ──
  function route(){
    if(deepNod == null || SEKTION[deepNod] == null) return;
    if(typeof aktivFlik === 'undefined' || typeof visaFlik !== 'function') return;
    if(aktivFlik !== SEKTION[deepNod]){
      aktivFlik = SEKTION[deepNod];
      if(typeof renderFlikar === 'function') renderFlikar();
      visaFlik();
    }
  }

  // ── 2. Observerande loggning: en löst ekvation (.uppg-klar.show) = ett event, till AKTIV sektions nod ──
  function nodForFlik(){ return (typeof aktivFlik !== 'undefined') ? FLIK_NOD[aktivFlik] : null; }
  var loggade = (typeof WeakSet === 'function') ? new WeakSet() : null;   // en .uppg-klar loggas en gång
  function hantera(el){
    if(!window.MasteryK3 || !el || !el.classList || !el.classList.contains('uppg-klar')) return;
    if(!el.classList.contains('show')) return;                            // bara när ekvationen är LÖST
    var node = nodForFlik(); if(!node) return;                            // bara de två live-sektionerna
    if(loggade){ if(loggade.has(el)) return; loggade.add(el); }
    window.MasteryK3.loggaForsok(node, 'ratt');                           // en löst ekvation = ett event
  }
  function startObs(){
    var root = document.getElementById('card') || document.body;
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        if(m.type === 'attributes'){ hantera(m.target); }
        else if(m.addedNodes){ [].forEach.call(m.addedNodes, function(n){
          if(n.nodeType !== 1) return;
          if(n.classList && n.classList.contains('uppg-klar')) hantera(n);
          if(n.querySelectorAll){ [].forEach.call(n.querySelectorAll('.uppg-klar.show'), hantera); }
        }); }
      });
    }).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  }

  function boot(){ startObs(); route(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
