/* nivarad.js — NIVÅRADEN, DELAD (order 2026-10-03, navigationsramens pilot).
 *
 * REGELN (doc/KONVENTIONER.md §3, spikad av Joachim):
 *   · Nivå 1 och 2 är ALLTID klickbara. Är det bara två nivåer är alltså ingen låst — en duktig
 *     elev hoppar fritt uppåt.
 *   · Nivå 3 och uppåt är villkorad: öppen om och endast om nivån under är gjord.
 *   · Max FYRA steg. Det fjärde heter Fördjupning, inte "Nivå 4".
 *
 * VARFÖR MODULEN FINNS. Nivåraden låg ordagrant i fem bladmotorer (blad-karna och
 * blad-k2-d2/d3/d5/d6) och saknades helt i den sjätte släkten (blad-karna-b, sjuans heltalsblad).
 * Fem kopior driver isär — det är A1 — och den sjätte kunde inte få nivåer utan en sjunde kopia.
 * Det som är en FUNKTION ärvs; det som är en kopia ärvs inte. Här är den en funktion.
 *
 * TILLSTÅNDET är elev-lokalt: `<prefix>_naddNiva<n>_<bladId>` i localStorage, skrivet när nivån
 * under klarats. Prefixet hör till motorfilen (brak2, brak3, brak5, brak6, k1d4, k1d1 …) så två
 * delkapitel aldrig delar framsteg. Nyckelformen är densamma som verktyg/flik-grind.js letar upp
 * ur källan och mäter — ändras den här måste grindens mönster följa med, annars dör mätningen
 * tyst och grinden blir grön utan att mäta.
 *
 * Ingen nätväg. Inget skrivs utanför enheten.
 */
(function(){
  'use strict';

  var MAX = 4;
  // Det fjärde steget har ett eget namn. Elevtext — ändra inte utan Joachims ord.
  var NAMN = { 1: 'Nivå 1', 2: 'Nivå 2', 3: 'Nivå 3', 4: 'Fördjupning' };
  // Under detta steg är ingenting låst. Nivå 1 och 2 är alltid öppna.
  var FRIA_TOM = 2;

  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }

  function nyckel(prefix, bladId, niva){ return prefix + '_naddNiva' + niva + '_' + bladId; }

  /* Utvecklarläge: ?dev=1 öppnar alla lås. Samma krok som motorerna redan har, så beteendet är
     oförändrat för den som bygger. Eleven besöker bara den vanliga URL:en. */
  function devLas(){
    try { return /[?&]dev=1\b/.test(location.search); } catch(e){ return false; }
  }

  /* Är steget nått? Nivå 1–2 alltid. Nivå n (>= 3) när nyckeln för n finns — den skrivs när
     nivån under klarats, så "nådd n" betyder i praktiken "gjort n-1". */
  function nadd(prefix, bladId, niva, aktuellNiva){
    if(niva <= FRIA_TOM) return true;
    if(devLas()) return true;
    if(aktuellNiva === niva) return true;        // står man på steget är det självklart nått
    return lsGet(nyckel(prefix, bladId, niva)) === '1';
  }

  /* Antalet steg kommer ur DATA (def.nivaer), inte ur kod. Ett tredje steg läggs till i datan och
     raden, nyckeln och knapptexten följer med. Taket är fyra; fler är en redaktionell fråga och
     kapas med en tydlig gräns i stället för att ritas. */
  function antal(def){
    if(!def || !def.nivaer) return 1;
    var n = Object.keys(def.nivaer).length;
    return Math.max(1, Math.min(MAX, n));
  }

  /* Raden som HTML. `blad.niva` är det aktiva steget. En rad med ETT steg ritas inte alls — en
     ensam knapp är ingen navigering, bara brus. */
  function html(opts){
    var n = opts.antal || 1;
    if(n < 2) return '';
    var ut = '<div class="niva-rad">';
    for(var nv = 1; nv <= n; nv++){
      var last = !nadd(opts.prefix, opts.bladId, nv, opts.niva);
      ut += '<button type="button" class="niva-btn' + (opts.niva === nv ? ' is-active' : '')
        + (last ? ' is-locked' : '') + '" data-niva="' + nv + '"' + (last ? ' disabled' : '')
        + '>' + (NAMN[nv] || ('Nivå ' + nv)) + (last ? ' 🔒' : '') + '</button>';
    }
    return ut + '</div>';
  }

  /* Klicken. En låst knapp gör ingenting — den är redan `disabled`, men klassen prövas också, för
     effekten ska gälla även om attributet skulle saknas. */
  function bind(rotEl, onVal){
    if(!rotEl) return;
    rotEl.querySelectorAll('.niva-btn').forEach(function(nb){
      nb.addEventListener('click', function(){
        if(nb.disabled || nb.classList.contains('is-locked')) return;
        onVal(parseInt(nb.dataset.niva, 10));
      });
    });
  }

  /* Klarade eleven steget? Då är NÄSTA steg nått. Anropas ur bladets resultat-hook. Returnerar
     numret på det som låstes upp, eller null — så anroparen kan ge besked utan att gissa. */
  function klarade(prefix, bladId, niva, antalSteg, ratt, totalt){
    if(!(totalt > 0)) return null;
    if(niva >= (antalSteg || 2)) return null;
    if((totalt - ratt) > 2) return null;          // samma krav som förr: högst två fel
    var nasta = niva + 1;
    lsSet(nyckel(prefix, bladId, nasta), '1');
    return nasta;
  }

  /* Nollställning, för grindar och för utvecklaren. Rör BARA den här modulens nycklar. */
  function glom(prefix, bladId){
    for(var n = 2; n <= MAX; n++){
      try { localStorage.removeItem(nyckel(prefix, bladId, n)); } catch(e){}
    }
  }

  window.NivaRad = {
    MAX: MAX, NAMN: NAMN, FRIA_TOM: FRIA_TOM,
    nyckel: nyckel, nadd: nadd, antal: antal,
    html: html, bind: bind, klarade: klarade, glom: glom
  };
})();
