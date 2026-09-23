/* k3-balans-wiring.js — OBSERVERANDE loggning + deeplink för balansmetoden (k3/d4).

   ADDITIV: ekvationer-balans.js loggar ingenting själv. Den sätter `.uppg-klar` → `.show` exakt när
   en ekvation är löst (per EKVATION, inte per rad), och varje uppgiftsblock bär `data-nod`. Det här
   omslaget observerar den signalen (MutationObserver) och loggar ett försök till MasteryK3 för
   uppgiftens egen nod. Per-rad-signalen ignoreras — den skulle överräkna grovt.

   Efter omskrivningen (order 2026-09-23) finns inga flikindex att härleda noden ur: noden står på
   uppgiften. Steg 1 och 2 loggar till alg-ekv-ensidig:rakna, steg 3 till alg-ekv-badaled:rakna.

   DEEPLINK: ?ko=&formaga= öppnar rätt öva-blad (skalet äger bladnavigeringen; vi klickar knappen).
   Parentes-noden wiras aldrig — parenteserna är författade som fördjupning och saknar uppgifter.

   GDPR: bara MasteryK3 (localStorage), inget nät. */
(function(){
  'use strict';

  // Nod → bladets ordningsnummer i blad-nav (deeplink). Loggningen går via data-nod, inte via detta.
  var BLAD_FOR_NOD = { 'alg-ekv-ensidig:rakna': 0, 'alg-ekv-badaled:rakna': 2 };

  function aktuellNod(){
    try {
      var q = new URLSearchParams(location.search), ko = q.get('ko'), f = q.get('formaga');
      return (ko && f) ? ko + ':' + f : null;
    } catch(e){ return null; }
  }

  // ── 1. Deeplink: öppna rätt blad ──
  function route(){
    var nod = aktuellNod(); if(!nod || BLAD_FOR_NOD[nod] == null) return;
    var knappar = document.querySelectorAll('#blad-nav .blad-nav-btn');
    var k = knappar[BLAD_FOR_NOD[nod]]; if(k) k.click();
  }

  // ── 2. En löst ekvation = ett event, till uppgiftens egen nod ──
  var loggade = (typeof WeakSet === 'function') ? new WeakSet() : null;
  function hantera(el){
    if(!window.MasteryK3 || !el || !el.classList || !el.classList.contains('uppg-klar')) return;
    if(!el.classList.contains('show')) return;
    var block = el.closest && el.closest('[data-nod]'); if(!block) return;
    var nod = block.getAttribute('data-nod'); if(!nod) return;
    if(loggade){ if(loggade.has(el)) return; loggade.add(el); }
    window.MasteryK3.loggaForsok(nod, 'ratt');
  }
  function startObs(){
    var root = document.querySelector('.tab-panel[data-panel="ova"]') || document.body;
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
