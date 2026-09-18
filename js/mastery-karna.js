/* mastery-karna.js — EN mastery-modul, tre stores. window.MasteryKarna.skapa({ matrisKey, lardKey, … }).
   ── INTEGRITETSGRÄNS: all elevdata bor i localStorage och lämnar ALDRIG enheten.
      Ingen fetch/XHR/WebSocket/sendBeacon finns i den här filen. ──

   Förr tre kopior (mastery.js k1 · mastery-k2.js · mastery-k3.js). k1 och k3 var identiska; k2 hade
   drivit isär — saknade NIVÅBRYGGAN (window.__aktuellNiva) och har-varit-lärd-flaggan (markeraLard) →
   bråkens evidens loggades utan nivå (kunde aldrig nå grönt i åttans karta, minNiva:3) och utan golv-
   flagga (glömskekurvan kunde inte välja orange-golv). Order 2026-09-18 FAS 2: ihopslaget, store-
   nyckeln är parameter. STORE-NYCKLARNA ÄR OFÖRÄNDRADE → befintlig elevdata läses som förr; k2 får
   dessutom en NY lard-store (k2.brak.lard.v1) som fylls framåt — för äldre loggar räcker s0≥1-fallbacken.

   Laddas FÖRE mastery.js / mastery-k2.js / mastery-k3.js, som är tunna skal: nycklar + sina egna
   tillägg (k1: fantomhinke-migrering, k2: window.k2Logga). Loggning/masteryState/tidsspärr/blekning/
   Proxy-hooken är EN implementation. */
(function(){
  'use strict';

  // ── KONFIG · trösklar för spridnings-baserad mastery (Joachim finjusterar mot ~10-ggr/3-år) ──
  // Nyckeln: GRÖN kräver SPRIDNING över lång tid, inte bara antal. 5 rätt samma kväll ≠ grön.
  var CFG = {
    GUL:  { minRatt: 3, minDagar: 2 },                    // flera gånger, spritt över tid → gul
    GRON: { minRatt: 5, minDagar: 4, minSpannDagar: 21 }, // flera gånger, utspritt över LÅNG tid → grön
    // ── TIDSSPÄRR (önskvärd svårighet / spacing) ─────────────────────────────────────
    // Öva något och testa det direkt efteråt mäter arbetsminne, inte durabel kunskap. Därför
    // räknar RETENTION-nivåerna (gul/grön) bara rätt-event som är tillräckligt SPRIDDA i tid:
    // ett event inom fönsterTimmar av föregående RÄKNADE event för noden loggas + ger feedback,
    // men flyttar inte färgen. Röd→orange är ogated (default) — "rört färdigheten en gång" är
    // ärligt även på studs. fönsterTimmar=0 → av. Samma tids-medvetna familj som glömskekurvan
    // nedan: den ena hindrar för tät upprepning, den andra bleknar disuse.
    SPARR: { fonsterTimmar: 20, gateOrange: false },      // ~1 dygn; gateOrange gatar även röd→orange
    // ── GLÖMSKEKURVA (blekning) · tunbar mot spacing-schemat ──────────────────────────
    // Färgen bleknar utan aktivitet sedan SENASTE RÄTT. Kalibrerad så en sommars inaktivitet
    // (~10 v) tar grön → orange: grön håller hallVeckor, glider sedan ett steg per stegVeckor.
    //   grön(3): håller 4 v · → gul vid 4 v · → orange vid 4+6=10 v.  gul(2): → orange vid 4 v.
    // Golv-regeln: har-varit-lärd (nått ≥ orange, härlett ur den append-only loggen) bottnar i
    // ORANGE; aldrig-lärd (röd, inga försök) bleknar inte alls. Bara åk8/åk9-kartan skickar aktiv
    // blekning — åk7 + självskattning anropar utan den → oförändrat.
    BLEKNING: { hallVeckor: 4, stegVeckor: 6, golv: 1 }
  };

  function dagKey(ts){ var d = new Date(ts); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }

  // ── Färg (0–3) ur loggens tidsstämplar — spridning, inte bara antal. Ren funktion, delad av alla stores. ──
  // minNiva (valfri): grön kräver evidens på nivå ≥ minNiva för den årskursen (nivåbryggan; åk8 = 3).
  // Utan minNiva (åk7) räknas alla rätt.
  // blekning (valfri): { aktiv, nu } — bara åk8/åk9-kartan skickar den. Utan → ingen decay.
  // lard (valfri boolean): nodens persistenta har-varit-lärd-flagga, avläst av anroparen. Väljer
  //   golv (orange om lärd, annars rött). s0≥1 är fallback för loggar äldre än flagg-lagret.
  function masteryState(log, minNiva, blekning, lard){
    if(!log || !log.length) return 0;                                   // röd — inga försök (aldrig-lärd → bleknar ej)
    var rattAll = log.filter(function(a){ return a.resultat === 'ratt'; }); // delvis/fel drar inte mot grönt
    if(!rattAll.length) return 1;                                        // orange — försökt men inget rätt
    var ratt = minNiva ? rattAll.filter(function(a){ return (a.niva || 0) >= minNiva; }) : rattAll;
    if(!ratt.length) return 1;                                          // rätt finns men inte på kravnivån → orange
    ratt.sort(function(a, b){ return a.ts - b.ts; });

    // ── TIDSSPÄRR: bara rätt-event ≥ fönstret efter föregående RÄKNADE event räknas mot gul/grön —
    //    en cooldown som kollapsar en burst (öva+testa samma pass) till ETT räknat event. ──
    var sparrMs = ((CFG.SPARR && CFG.SPARR.fonsterTimmar) || 0) * 3600000;
    var rattSpridd = [], sist = null;
    for(var i = 0; i < ratt.length; i++){
      if(sist === null || (ratt[i].ts - sist) >= sparrMs){ rattSpridd.push(ratt[i]); sist = ratt[i].ts; }
    }
    if(CFG.SPARR && CFG.SPARR.gateOrange && !rattSpridd.length) return 1;

    var dagar = {}; rattSpridd.forEach(function(a){ dagar[dagKey(a.ts)] = 1; });
    var antalDagar = Object.keys(dagar).length;
    var spannDagar = rattSpridd.length ? (rattSpridd[rattSpridd.length - 1].ts - rattSpridd[0].ts) / 86400000 : 0;
    var s0 = (rattSpridd.length >= CFG.GRON.minRatt && antalDagar >= CFG.GRON.minDagar && spannDagar >= CFG.GRON.minSpannDagar) ? 3 // grön
           : (rattSpridd.length >= CFG.GUL.minRatt && antalDagar >= CFG.GUL.minDagar) ? 2                                          // gul
           : 1;                                                                                                              // orange (retention-golv)
    // ── Glömskekurva: blekna sedan SENASTE RÄTT. Bara grön/gul kan blekna. Utan aktiv blekning → oförändrat. ──
    if(!blekning || !blekning.aktiv || s0 <= 1) return s0;
    var veckor = (blekning.nu - ratt[ratt.length - 1].ts) / (7 * 86400000);
    if(veckor < CFG.BLEKNING.hallVeckor) return s0;                     // grön håller några veckor
    var steg = Math.floor((veckor - CFG.BLEKNING.hallVeckor) / CFG.BLEKNING.stegVeckor) + 1;
    // Golv-regeln: lärd → orange, aldrig-lärd → röd. (Här är s0≥2, så noden ÄR lärd.)
    var harVaritLard = (lard === true) || s0 >= 1;
    return Math.max(harVaritLard ? CFG.BLEKNING.golv : 0, s0 - steg);
  }

  // ── Aktuell nod ur deeplinken ?ko=&formaga= (lövnod-id = ko:formaga, samma som utbudslistor/karta) ──
  function aktuellNodId(){
    try {
      var q = new URLSearchParams(location.search), ko = q.get('ko'), f = q.get('formaga');
      return (ko && f) ? ko + ':' + f : null;
    } catch(e){ return null; }
  }

  // ── skapa(opts) → en store-bunden API. opts: { matrisKey, lardKey, proxyFlagga } ──
  //   matrisKey   localStorage-nyckel för loggen { nodeId: [ { ts, resultat, niva? } ... ] }
  //   lardKey     localStorage-nyckel för har-varit-lärd-flaggan { nodeId: true }
  //   proxyFlagga (valfri) namn på markör-flaggan för getTutorScore-Proxyn; utelämnad → ingen hook
  //               (k2:s drillar loggar via window.k2Logga i stället).
  function skapa(opts){
    var MATRIS_KEY = opts.matrisKey, LARD_KEY = opts.lardKey;

    function lasMatris(){ try { return JSON.parse(localStorage.getItem(MATRIS_KEY)) || {}; } catch(e){ return {}; } }
    function sparMatris(m){ try { localStorage.setItem(MATRIS_KEY, JSON.stringify(m)); } catch(e){} }

    // Persistent "har-varit-lärd"-flagga per nod (golv-regelns källa). Sätts FÖRSTA gången noden
    // loggas och nollställs ALDRIG. Egen store, skild från loggen → evidensen skrivs aldrig om.
    function lasLard(){ try { return JSON.parse(localStorage.getItem(LARD_KEY)) || {}; } catch(e){ return {}; } }
    function markeraLard(nodeId){ try { var f = lasLard(); if(!f[nodeId]){ f[nodeId] = true; localStorage.setItem(LARD_KEY, JSON.stringify(f)); } } catch(e){} }
    function harVaritLard(nodeId){ return !!lasLard()[nodeId]; }

    // Skriv ETT tidsstämplat försök till loggen (ackumulerar historik för spacing).
    function loggaForsok(nodeId, resultat){
      if(!nodeId || (resultat !== 'ratt' && resultat !== 'delvis' && resultat !== 'fel')) return;
      var m = lasMatris();
      if(!m[nodeId]) m[nodeId] = [];
      // NIVÅBRYGGA: aktuell drill-nivå exponeras av drill-runnern (window.__aktuellNiva).
      // Additivt — utan niva blir posten som förr (bakåtkompatibel).
      var niva = (typeof window !== 'undefined' && window.__aktuellNiva) ? window.__aktuellNiva : null;
      var post = { ts: Date.now(), resultat: resultat };
      if(niva) post.niva = niva;
      m[nodeId].push(post);
      sparMatris(m);
      markeraLard(nodeId);   // noden når/har nått över rött → sätt den persistenta har-varit-lärd-flaggan (en gång)
    }

    // ── OBSERVERANDE HOOK: wrappa getTutorScore transparent (bara där den finns, dvs i ramen) ──
    // Drillen gör `ts.total++` (alltid) och `ts.correct++` (om rätt). Proxyn läser av det och
    // loggar EN gång per slutförd uppgift för URL:ens nod. Transparent för läsning → byte-identiskt.
    // Timing-oberoende: `total++` öppnar en oavgjord uppgift (pending); `correct++` avgör den
    // som RÄTT; nästa `total++` eller en microtask avgör en kvarvarande som FEL.
    if(opts.proxyFlagga && typeof window.getTutorScore === 'function' && !window.getTutorScore[opts.proxyFlagga] && typeof Proxy === 'function'){
      var pending = null;
      var flushPending = function(res){ if(pending){ loggaForsok(pending.nod, res); pending = null; } };
      var koaMicro = window.queueMicrotask ? window.queueMicrotask.bind(window) : function(fn){ setTimeout(fn, 0); };
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
      window.getTutorScore[opts.proxyFlagga] = true;
    }

    return {
      CFG: CFG, MATRIS_KEY: MATRIS_KEY, LARD_KEY: LARD_KEY,
      lasMatris: lasMatris, sparMatris: sparMatris,
      loggaForsok: loggaForsok, masteryState: masteryState,
      lasLard: lasLard, markeraLard: markeraLard, harVaritLard: harVaritLard,
      aktuellNodId: aktuellNodId
    };
  }

  window.MasteryKarna = { CFG: CFG, masteryState: masteryState, aktuellNodId: aktuellNodId, skapa: skapa };
})();
