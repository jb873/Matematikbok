/* mastery-k3.js — elev-lokal mastery-loggning för algebra-kartan (kapitel 3). TUNT SKAL över mastery-karna.js.
   ── INTEGRITETSGRÄNS: all elevdata bor i localStorage och lämnar ALDRIG enheten.
      Ingen fetch/XHR/WebSocket/sendBeacon finns i den här filen. ──
   Var förr en byte-identisk kopia av mastery.js med k3-nycklar; nu delad implementation
   (order 2026-09-18 FAS 2). Store-nycklarna är OFÖRÄNDRADE. Laddas EFTER mastery-karna.js.
   Proxy-hooken på getTutorScore kopplas bara där den finns (ak7-k3-ram). */
(function(){
  'use strict';
  window.MasteryK3 = window.MasteryKarna.skapa({
    matrisKey:   'k3.algebra.mastery.v1',
    lardKey:     'k3.algebra.lard.v1',
    proxyFlagga: '__masteryK3Wrapped'
  });
})();
