/* mastery-k4.js — elev-lokal mastery-loggning för procent (kapitel 4, åk 7). TUNT SKAL över mastery-karna.js,
   som mastery-k3.js. Noderna: js/data/k4-taxonomi.js. Bladkärnan loggar hit när gruppen bär loggStore 'k4'
   (Joachim 2026-11-26).
   ── INTEGRITETSGRÄNS: all elevdata bor i localStorage och lämnar ALDRIG enheten.
      Ingen fetch/XHR/WebSocket/sendBeacon finns i den här filen. ──
   Laddas EFTER mastery-karna.js. */
(function(){
  'use strict';
  window.MasteryK4 = window.MasteryKarna.skapa({
    matrisKey:   'k4.procent.mastery.v1',
    lardKey:     'k4.procent.lard.v1',
    proxyFlagga: '__masteryK4Wrapped'
  });
})();
