/* mastery.js — elev-lokal mastery-loggning för begreppskartan (k1 taluppfattning).
   ── INTEGRITETSGRÄNS: all elevdata bor i localStorage och lämnar ALDRIG enheten.
      Ingen fetch/XHR/WebSocket/sendBeacon finns i den här filen. ──
   Additivt & observerande: wrappar den delade getTutorScore() transparent (Proxy) och
   loggar ETT tidsstämplat försök per slutförd färdighet. Drillarnas steg-logik,
   generatorer och facit rörs INTE — beräkningen är byte-identisk med/utan filen. */
(function(){
  'use strict';

  // ── KONFIG · trösklar för spridnings-baserad mastery (Joachim finjusterar mot ~10-ggr/3-år) ──
  // Nyckeln: GRÖN kräver SPRIDNING över lång tid, inte bara antal. 5 rätt samma kväll ≠ grön.
  var CFG = {
    GUL:  { minRatt: 3, minDagar: 2 },                    // flera gånger, spritt över tid → gul
    GRON: { minRatt: 5, minDagar: 4, minSpannDagar: 21 }  // flera gånger, utspritt över LÅNG tid → grön
  };

  var MATRIS_KEY = 'k1.taluppfattning.mastery.v1';   // { nodeId: [ { ts, resultat } ... ] }

  function lasMatris(){ try { return JSON.parse(localStorage.getItem(MATRIS_KEY)) || {}; } catch(e){ return {}; } }
  function sparMatris(m){ try { localStorage.setItem(MATRIS_KEY, JSON.stringify(m)); } catch(e){} }

  // ── Skriv ETT tidsstämplat försök till loggen (ackumulerar historik för spacing) ──
  function loggaForsok(nodeId, resultat){
    if(!nodeId || (resultat !== 'ratt' && resultat !== 'delvis' && resultat !== 'fel')) return;
    var m = lasMatris();
    if(!m[nodeId]) m[nodeId] = [];
    // NIVÅBRYGGA: aktuell drill-nivå exponeras av exerciseHeader (window.__aktuellNiva).
    // Additivt — utan niva blir posten som förr (bakåtkompatibel).
    var niva = (typeof window !== 'undefined' && window.__aktuellNiva) ? window.__aktuellNiva : null;
    var post = { ts: Date.now(), resultat: resultat };
    if(niva) post.niva = niva;
    m[nodeId].push(post);
    sparMatris(m);
  }

  // ── Färg (0–3) ur loggens tidsstämplar — spridning, inte bara antal ──
  function dagKey(ts){ var d = new Date(ts); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  // minNiva (valfri): grön kräver evidens på nivå ≥ minNiva för den årskursen (B3-nivåbryggan).
  // Utan minNiva (åk7) räknas alla rätt — byte-identiskt beteende.
  function masteryState(log, minNiva){
    if(!log || !log.length) return 0;                                   // röd — inga försök
    var rattAll = log.filter(function(a){ return a.resultat === 'ratt'; }); // delvis/fel drar inte mot grönt
    if(!rattAll.length) return 1;                                        // orange — försökt men inget rätt
    var ratt = minNiva ? rattAll.filter(function(a){ return (a.niva || 0) >= minNiva; }) : rattAll;
    if(!ratt.length) return 1;                                          // rätt finns men inte på kravnivån → orange
    ratt.sort(function(a, b){ return a.ts - b.ts; });
    var dagar = {}; ratt.forEach(function(a){ dagar[dagKey(a.ts)] = 1; });
    var antalDagar = Object.keys(dagar).length;
    var spannDagar = (ratt[ratt.length - 1].ts - ratt[0].ts) / 86400000;
    if(ratt.length >= CFG.GRON.minRatt && antalDagar >= CFG.GRON.minDagar && spannDagar >= CFG.GRON.minSpannDagar) return 3; // grön
    if(ratt.length >= CFG.GUL.minRatt && antalDagar >= CFG.GUL.minDagar) return 2;                                          // gul
    return 1;                                                                                                                // orange
  }

  // ── Aktuell nod ur deeplinken ?ko=&formaga= (samma som utbudslistorna/kartan använder) ──
  function aktuellNodId(){
    try {
      var q = new URLSearchParams(location.search), ko = q.get('ko'), f = q.get('formaga');
      return (ko && f) ? ko + ':' + f : null;
    } catch(e){ return null; }
  }

  // ── OBSERVERANDE HOOK: wrappa getTutorScore transparent (bara där den finns, dvs i ramen) ──
  // Drillen gör `ts.total++` (alltid) och `ts.correct++` (om rätt). Proxyn läser av det och
  // loggar EN gång per slutförd uppgift för URL:ens nod. Transparent för läsning → byte-identiskt.
  // Timing-oberoende: `total++` öppnar en oavgjord uppgift (pending); `correct++` avgör den
  // som RÄTT; nästa `total++` eller en microtask avgör en kvarvarande som FEL. Fungerar även om
  // flera checks råkar köras i samma tick (identitets-token skyddar mot fel-loggning).
  var pending = null;
  function flushPending(res){ if(pending){ loggaForsok(pending.nod, res); pending = null; } }
  var koaMicro = window.queueMicrotask ? window.queueMicrotask.bind(window) : function(fn){ setTimeout(fn, 0); };
  if(typeof window.getTutorScore === 'function' && !window.getTutorScore.__masteryWrapped && typeof Proxy === 'function'){
    var orig = window.getTutorScore;
    window.getTutorScore = function(koId, formagaKey){
      var real = orig(koId, formagaKey);
      var nod = aktuellNodId();
      if(!nod || (koId + ':' + formagaKey) !== nod) return real;   // logga bara URL:ens färdighet (ej sub-scoreKey)
      return new Proxy(real, {
        set: function(t, k, v){
          if(k === 'total' && typeof v === 'number' && v > t.total){
            flushPending('fel');                                   // föregående oavgjorda uppgift fick aldrig rätt
            var tok = { nod: nod }; pending = tok;
            koaMicro(function(){ if(pending === tok) flushPending('fel'); });
          } else if(k === 'correct' && typeof v === 'number' && v > t.correct){
            flushPending('ratt');                                 // denna uppgift var rätt
          }
          t[k] = v; return true;
        }
      });
    };
    window.getTutorScore.__masteryWrapped = true;
  }

  window.Mastery = {
    CFG: CFG, MATRIS_KEY: MATRIS_KEY,
    lasMatris: lasMatris, sparMatris: sparMatris,
    loggaForsok: loggaForsok, masteryState: masteryState
  };
})();
