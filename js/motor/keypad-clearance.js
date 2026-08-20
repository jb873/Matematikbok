/* keypad-clearance.js — EN mekanism för bottenutrymme mot den fasta knappsatsen.
   ────────────────────────────────────────────────────────────────────────────────────────────────
   PROBLEMET: knappsatsen (.keypad ELLER .ovn-keypad) är position:fixed;bottom:0 och täcker sidans
   SISTA element — t.ex. Kontrollera — om sidan saknar utrymme nedtill. Det finns TRE keypad-system
   (AK8_UI-binder, drillarnas egna binder, öva-bladens .ovn-keypad) → en fix per binder missar alltid
   någon. Därför en KLASS-baserad vakt i stället: den bryr sig inte om vem som ritade knappsatsen.

   SÅ HÄR RÄKNAS UTRYMMET FRAM (svar på orderns fråga):
     clearance = FAKTISKA höjden (getBoundingClientRect) på den högsta SYNLIGA, position:fixed
     knappsatsen på sidan  +  BUFFER px luft.  Sätts som padding-bottom på <body> (allt innehåll
     scrollar på body — ingen nästlad scroll-container finns). 0 när ingen fast keypad syns.
     Aldrig ett gissat värde. Ommätt vid VARJE storleks-/synlighetsändring:
       • ResizeObserver på varje keypad  → fångar radbrytning vid smal skärm + lägesbyte
         (numerisk / bråkbyggare / trefält ger olika höjd) + dölj/visa (keypad-hidden).
       • MutationObserver på body         → fångar keypads som drillar/vyer lägger till i efterhand.
       • window.resize + media-query      → fångar brytpunkter (.ovn-keypad blir fixed först i mobil).
   Så länge den här filen laddas på en keypad-yta kan nästa keypad-ändring inte återinföra felet:
   utrymmet följer den renderade höjden automatiskt.  Guard → körs en gång även om två filer drar in den.
   Ingen nätväg, ingen elevdata. */
(function(){
  'use strict';
  if(window.__keypadClearance) return; window.__keypadClearance = true;
  var BUFFER = 28;   // luft ovanför keypaden så sista elementet inte klistras mot dess överkant

  function synligFast(el){
    if(!el || (el.classList && el.classList.contains('keypad-hidden'))) return false;
    var cs = window.getComputedStyle(el);
    return cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetHeight > 0;
  }
  function matHojd(){
    var els = document.querySelectorAll('.keypad, .ovn-keypad'), h = 0;
    for(var i = 0; i < els.length; i++){ if(synligFast(els[i])){ var r = els[i].getBoundingClientRect(); if(r.height > h) h = r.height; } }
    return h;
  }
  var sist = -1;
  function synk(){
    var v = matHojd(); v = v ? (Math.ceil(v) + BUFFER) : 0;
    if(v === sist) return; sist = v;
    document.body.style.paddingBottom = v ? (v + 'px') : '';
  }

  var ro = window.ResizeObserver ? new ResizeObserver(synk) : null;
  var sedda = (typeof WeakSet === 'function') ? new WeakSet() : null;
  function observera(){
    if(!ro) return;
    var els = document.querySelectorAll('.keypad, .ovn-keypad');
    for(var i = 0; i < els.length; i++){ if(!sedda || !sedda.has(els[i])){ try { ro.observe(els[i]); } catch(e){} if(sedda) sedda.add(els[i]); } }
  }
  var pending = false;
  function schemalagd(){ if(pending) return; pending = true; (window.requestAnimationFrame || function(f){ setTimeout(f, 16); })(function(){ pending = false; observera(); synk(); }); }

  function boot(){
    observera(); synk();
    if(window.MutationObserver){ try { new MutationObserver(schemalagd).observe(document.body, { childList:true, subtree:true }); } catch(e){} }
    window.addEventListener('resize', synk);
    if(window.matchMedia){
      try { var mq = window.matchMedia('(max-width: 900px)'); mq.addEventListener ? mq.addEventListener('change', synk) : mq.addListener(synk); } catch(e){}
    }
    // print: knappsatsen döljs av @media print → mät om (och nolla säkert runt utskrift)
    window.addEventListener('beforeprint', function(){ document.body.style.paddingBottom = ''; sist = 0; });
    window.addEventListener('afterprint', function(){ sist = -1; synk(); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
