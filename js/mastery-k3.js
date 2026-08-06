/* mastery-k3.js — elev-lokal mastery-loggning för algebra-kartan (kapitel 3).
   ── INTEGRITETSGRÄNS: all elevdata bor i localStorage och lämnar ALDRIG enheten.
      Ingen fetch/XHR/WebSocket/sendBeacon finns i den här filen. ──
   Additivt & observerande: wrappar den delade getTutorScore() transparent (Proxy) och
   loggar ETT tidsstämplat försök per slutförd färdighet. Drillarnas steg-logik,
   generatorer och facit rörs INTE — beräkningen är byte-identisk med/utan filen.

   BYGGD EXAKT som js/mastery.js (k1) — samma trösklar, samma tidsspärr, samma Proxy,
   samma masteryState. Enda skillnad: k3-scopade localStorage-nycklar + window.MasteryK3.
   k3:s öva-mer-motorer använder ännu INTE getTutorScore och k3 har inga ?ko=&formaga=-
   deeplinks → detta lager är förberett men inte anslutet (se deeplink-specen i rapporten). */
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
    // ärligt även på studs. fönsterTimmar=0 → av (byte-identiskt med förr). Samma tids-medvetna
    // familj som glömskekurvan nedan: den ena hindrar för tät upprepning, den andra bleknar disuse.
    SPARR: { fonsterTimmar: 20, gateOrange: false },      // ~1 dygn; gateOrange gatar även röd→orange
    // ── GLÖMSKEKURVA (blekning) · tunbar mot spacing-schemat ──────────────────────────
    // Färgen bleknar utan aktivitet sedan SENASTE RÄTT. Kalibrerad så en sommars inaktivitet
    // (~10 v) tar grön → orange: grön håller hallVeckor, glider sedan ett steg per stegVeckor.
    //   grön(3): håller 4 v · → gul vid 4 v · → orange vid 4+6=10 v.  gul(2): → orange vid 4 v.
    // Golv-regeln: har-varit-lärd (nått ≥ orange, härlett ur den append-only loggen) bottnar i
    // ORANGE; aldrig-lärd (röd, inga försök) bleknar inte alls. Bara åk8-kartan skickar aktiv
    // blekning — åk7 + självskattning anropar utan den → oförändrat.
    BLEKNING: { hallVeckor: 4, stegVeckor: 6, golv: 1 }
  };

  var MATRIS_KEY = 'k3.algebra.mastery.v1';   // { nodeId: [ { ts, resultat } ... ] }

  function lasMatris(){ try { return JSON.parse(localStorage.getItem(MATRIS_KEY)) || {}; } catch(e){ return {}; } }
  function sparMatris(m){ try { localStorage.setItem(MATRIS_KEY, JSON.stringify(m)); } catch(e){} }

  // ── Persistent "har-varit-lärd"-flagga per nod (golv-regelns källa) ──
  // Sätts FÖRSTA gången noden loggas (når över rött) och nollställs ALDRIG. Egen store, skild
  // från loggen → evidensen skrivs aldrig om. Blekningen läser flaggan för att välja golv:
  // röd om aldrig lärd, orange om lärd. (För loggar äldre än flagg-lagret räcker s0≥1 som
  // fallback — för en append-only-logg sammanfaller flagga och s0≥1 alltid.)
  var LARD_KEY = 'k3.algebra.lard.v1';   // { nodeId: true }
  function lasLard(){ try { return JSON.parse(localStorage.getItem(LARD_KEY)) || {}; } catch(e){ return {}; } }
  function markeraLard(nodeId){ try { var f = lasLard(); if(!f[nodeId]){ f[nodeId] = true; localStorage.setItem(LARD_KEY, JSON.stringify(f)); } } catch(e){} }
  function harVaritLard(nodeId){ return !!lasLard()[nodeId]; }

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
    markeraLard(nodeId);   // noden når/har nått över rött → sätt den persistenta har-varit-lärd-flaggan (en gång)
  }

  // ── Färg (0–3) ur loggens tidsstämplar — spridning, inte bara antal ──
  function dagKey(ts){ var d = new Date(ts); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  // minNiva (valfri): grön kräver evidens på nivå ≥ minNiva för den årskursen (B3-nivåbryggan).
  // Utan minNiva (åk7) räknas alla rätt — byte-identiskt beteende.
  // blekning (valfri): { aktiv, nu } — bara åk8-kartan skickar den. Utan → oförändrat (ingen decay).
  // lard (valfri boolean): nodens persistenta har-varit-lärd-flagga, avläst av anroparen. Väljer
  //   golv (orange om lärd, annars rött). s0≥1 är fallback för loggar äldre än flagg-lagret.
  function masteryState(log, minNiva, blekning, lard){
    if(!log || !log.length) return 0;                                   // röd — inga försök (aldrig-lärd → bleknar ej)
    var rattAll = log.filter(function(a){ return a.resultat === 'ratt'; }); // delvis/fel drar inte mot grönt
    if(!rattAll.length) return 1;                                        // orange — försökt men inget rätt
    var ratt = minNiva ? rattAll.filter(function(a){ return (a.niva || 0) >= minNiva; }) : rattAll;
    if(!ratt.length) return 1;                                          // rätt finns men inte på kravnivån → orange
    ratt.sort(function(a, b){ return a.ts - b.ts; });

    // ── TIDSSPÄRR: filtrera fram de rätt-event som RÄKNAS mot retention (gul/grön). Ett event
    //    räknas bara om det ligger ≥ fönstret efter föregående RÄKNADE event för noden — en
    //    cooldown som kollapsar en burst (öva+testa samma pass) till ETT räknat event. Loggen
    //    och feedbacken rörs inte; bara uppflyttningen gatas. fönsterTimmar=0 → alla räknas. ──
    var sparrMs = ((CFG.SPARR && CFG.SPARR.fonsterTimmar) || 0) * 3600000;
    var rattSpridd = [], sist = null;
    for(var i = 0; i < ratt.length; i++){
      if(sist === null || (ratt[i].ts - sist) >= sparrMs){ rattSpridd.push(ratt[i]); sist = ratt[i].ts; }
    }
    // Röd→orange: ogated (default) — nått ratt räcker. gateOrange gatar även hit, men första
    // eventet saknar föregångare och räknas alltid, så orange nås ändå vid första rätt.
    if(CFG.SPARR && CFG.SPARR.gateOrange && !rattSpridd.length) return 1;

    var dagar = {}; rattSpridd.forEach(function(a){ dagar[dagKey(a.ts)] = 1; });
    var antalDagar = Object.keys(dagar).length;
    var spannDagar = rattSpridd.length ? (rattSpridd[rattSpridd.length - 1].ts - rattSpridd[0].ts) / 86400000 : 0;
    var s0 = (rattSpridd.length >= CFG.GRON.minRatt && antalDagar >= CFG.GRON.minDagar && spannDagar >= CFG.GRON.minSpannDagar) ? 3 // grön
           : (rattSpridd.length >= CFG.GUL.minRatt && antalDagar >= CFG.GUL.minDagar) ? 2                                          // gul
           : 1;                                                                                                              // orange (retention-golv)
    // ── Glömskekurva: blekna sedan SENASTE RÄTT. Bara grön/gul kan blekna; röd (s0≤1 → 0/1)
    //    returneras oförändrat. Utan aktiv blekning → oförändrat. ──
    if(!blekning || !blekning.aktiv || s0 <= 1) return s0;
    var veckor = (blekning.nu - ratt[ratt.length - 1].ts) / (7 * 86400000);
    if(veckor < CFG.BLEKNING.hallVeckor) return s0;                     // grön håller några veckor
    var steg = Math.floor((veckor - CFG.BLEKNING.hallVeckor) / CFG.BLEKNING.stegVeckor) + 1;
    // Golv-regeln läser har-varit-lärd-flaggan: lärd → orange, aldrig-lärd → röd. (Här är s0≥2,
    // så noden ÄR lärd; flaggan/fallbacken ger orange-golv och blekningen når aldrig röd igen.)
    var harVaritLard = (lard === true) || s0 >= 1;
    return Math.max(harVaritLard ? CFG.BLEKNING.golv : 0, s0 - steg);
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
  if(typeof window.getTutorScore === 'function' && !window.getTutorScore.__masteryK3Wrapped && typeof Proxy === 'function'){
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
    window.getTutorScore.__masteryK3Wrapped = true;
  }

  window.MasteryK3 = {
    CFG: CFG, MATRIS_KEY: MATRIS_KEY,
    lasMatris: lasMatris, sparMatris: sparMatris,
    loggaForsok: loggaForsok, masteryState: masteryState,
    lasLard: lasLard, markeraLard: markeraLard, harVaritLard: harVaritLard
  };
})();
