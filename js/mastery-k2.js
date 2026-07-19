/* mastery-k2.js — elev-lokal mastery-loggning för kapitel 2 (bråk).
   ── INTEGRITETSGRÄNS: all elevdata bor i localStorage och lämnar ALDRIG enheten.
      Ingen fetch/XHR/WebSocket/sendBeacon finns i den här filen. ──
   Samma mönster som js/mastery.js men för k2:s öva-mer-motor (korOvning), som inte
   använder getTutorScore. korOvning anropar window.k2Logga(ok) efter varje rättning;
   noden läses ur deeplinken (?ko=&formaga=). Additivt – rör inte beräkningen/facit. */
(function(){
  'use strict';

  // Samma spridnings-trösklar som k1 (Mastery.CFG) – grön kräver spridning över tid.
  var CFG = {
    GUL:  { minRatt: 3, minDagar: 2 },
    GRON: { minRatt: 5, minDagar: 4, minSpannDagar: 21 }
  };
  var MATRIS_KEY = 'k2.brak.mastery.v1';   // { nodeId: [ { ts, resultat } ... ] }

  function lasMatris(){ try { return JSON.parse(localStorage.getItem(MATRIS_KEY)) || {}; } catch(e){ return {}; } }
  function sparMatris(m){ try { localStorage.setItem(MATRIS_KEY, JSON.stringify(m)); } catch(e){} }

  function loggaForsok(nodeId, resultat){
    if(!nodeId || (resultat !== 'ratt' && resultat !== 'delvis' && resultat !== 'fel')) return;
    var m = lasMatris();
    if(!m[nodeId]) m[nodeId] = [];
    m[nodeId].push({ ts: Date.now(), resultat: resultat });
    sparMatris(m);
  }

  // Färg (0–3) ur loggens tidsstämplar – spridning, inte bara antal (identisk med k1).
  function dagKey(ts){ var d = new Date(ts); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function masteryState(log){
    if(!log || !log.length) return 0;
    var ratt = log.filter(function(a){ return a.resultat === 'ratt'; });
    if(!ratt.length) return 1;
    ratt.sort(function(a, b){ return a.ts - b.ts; });
    var dagar = {}; ratt.forEach(function(a){ dagar[dagKey(a.ts)] = 1; });
    var antalDagar = Object.keys(dagar).length;
    var spannDagar = (ratt[ratt.length - 1].ts - ratt[0].ts) / 86400000;
    if(ratt.length >= CFG.GRON.minRatt && antalDagar >= CFG.GRON.minDagar && spannDagar >= CFG.GRON.minSpannDagar) return 3;
    if(ratt.length >= CFG.GUL.minRatt && antalDagar >= CFG.GUL.minDagar) return 2;
    return 1;
  }

  // Aktuell nod ur deeplinken ?ko=&formaga= (lövnod-id = ko:formaga, samma som k1).
  function aktuellNodId(){
    try {
      var q = new URLSearchParams(location.search), ko = q.get('ko'), f = q.get('formaga');
      return (ko && f) ? ko + ':' + f : null;
    } catch(e){ return null; }
  }

  // Anropas av korOvning efter varje rättning (ok = true/false). Loggar bara i deeplink-läge.
  window.k2Logga = function(ok){
    var nod = aktuellNodId();
    if(nod) loggaForsok(nod, ok ? 'ratt' : 'fel');
  };

  window.MasteryK2 = {
    CFG: CFG, MATRIS_KEY: MATRIS_KEY,
    lasMatris: lasMatris, sparMatris: sparMatris,
    loggaForsok: loggaForsok, masteryState: masteryState
  };
})();
