/* mastery-k2.js — elev-lokal mastery-loggning för kapitel 2 (bråk). TUNT SKAL över mastery-karna.js.
   ── INTEGRITETSGRÄNS: all elevdata bor i localStorage och lämnar ALDRIG enheten.
      Ingen fetch/XHR/WebSocket/sendBeacon finns i den här filen. ──
   Loggning/masteryState/tidsspärr/blekning är EN implementation (MasteryKarna.skapa) — förr en egen
   kopia som hade drivit isär: utan nivåbrygga (evidens utan niva → aldrig grönt i åttans karta) och
   utan har-varit-lärd-flagga (order 2026-09-18 FAS 2). Store-nyckeln för loggen är OFÖRÄNDRAD;
   lard-storen är ny och fylls framåt. Laddas EFTER mastery-karna.js.
   k2:s öva-mer-motor (korOvning) använder inte getTutorScore utan anropar window.k2Logga(ok) efter
   varje rättning; noden läses ur deeplinken (?ko=&formaga=). */
(function(){
  'use strict';

  var M = window.MasteryKarna.skapa({
    matrisKey: 'k2.brak.mastery.v1',   // { nodeId: [ { ts, resultat, niva? } ... ] } — samma nyckel som förr
    lardKey:   'k2.brak.lard.v1'       // { nodeId: true } — NY (förr saknades flaggan för k2)
  });

  // Anropas av korOvning efter varje rättning (ok = true/false). Loggar bara i deeplink-läge.
  window.k2Logga = function(ok){
    var nod = M.aktuellNodId();
    if(nod) M.loggaForsok(nod, ok ? 'ratt' : 'fel');
  };

  window.MasteryK2 = M;
})();
