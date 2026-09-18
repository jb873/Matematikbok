/* mastery.js — elev-lokal mastery-loggning för begreppskartan (k1 taluppfattning). TUNT SKAL över mastery-karna.js.
   ── INTEGRITETSGRÄNS: all elevdata bor i localStorage och lämnar ALDRIG enheten.
      Ingen fetch/XHR/WebSocket/sendBeacon finns i den här filen. ──
   Loggning/masteryState/tidsspärr/glömskekurva/Proxy-hooken är EN implementation (MasteryKarna.skapa),
   delad med k2 och k3 sedan order 2026-09-18 FAS 2 (förr tre kopior, k2 hade drivit isär).
   Store-nycklarna är OFÖRÄNDRADE. Laddas EFTER mastery-karna.js. Kvar här: k1:s engångs-migrering
   av fantomhinkar (rör bara k1-nycklarna). */
(function(){
  'use strict';
  var M = window.MasteryKarna.skapa({
    matrisKey:   'k1.taluppfattning.mastery.v1',   // { nodeId: [ { ts, resultat, niva? } ... ] }
    lardKey:     'k1.taluppfattning.lard.v1',      // { nodeId: true }
    proxyFlagga: '__masteryWrapped'
  });
  var LARD_KEY = M.LARD_KEY;
  var lasMatris = M.lasMatris, sparMatris = M.sparMatris, lasLard = M.lasLard;

  // ── ENGÅNGS-MIGRERING: rädda evidens ur fantomhinkar → riktiga taxonominoder ──────────────────
  // Tidigare loggade repetitions-/drill-ingångar till id:n UTAN kartcell (begrepp-as:*, add:*,
  // sub-rakna:enkel, m.fl.). Elevens försök hamnade i hinkar som varken karta eller självskattning
  // läser → osynligt arbete. Routingen dirigeras nu om till riktiga noder (se ak7-k1-ram/metod-
  // addsub); den HÄR rutinen flyttar det som redan ligger i hinkarna INNAN de försvinner. Körs vid
  // varje load men är idempotent: fantomnyckeln raderas efter flytt, så andra varvet är no-op. Att
  // flytta FÖRE omdirigeringen (rutinen körs vid modul-load, drillar loggar först vid interaktion)
  // garanterar att inget skrivs bort. Delade (kombinerade) hinkar dubbleras till båda målnoderna —
  // eleven tränade bägge begreppen/räknesätten i samma drill.
  var FANTOM_MIGRATION = {
    'begrepp-as:begrepp':      ['add-begrepp:begrepp', 'sub-begrepp:begrepp'], // term/summa/differens (+/−)
    'begrepp-as:rakna':        ['add-rakna:rakna', 'sub-rakna:rakna'],         // +/−-räkning
    'add:rakna':               ['add-rakna:rakna'],
    'add:metod':               ['add-metoder:metod'],
    'sub-rakna:enkel':         ['sub-rakna:rakna'],                            // "enkla tal"-subnod → föräldernod
    'raknetraning-as:rakna':   ['rakneträning:rakna'],                         // död ingång, försäkring
    'positionssystem:begrepp': ['position:begrepp'],                          // död länk, försäkring
    'mult-uppstall:metod':     ['mult-metoder:uppstallning'],                 // död länk, försäkring
    'mult-faktorisera:metod':  ['mult-begrepp:rakna'],                        // död länk, försäkring
    'mult-tabell:metod':       ['mult-tabell:rakna']                          // död länk, försäkring
  };
  var SCORE_KEY_MIGR = 'kapitel1_tutorScores_v1';   // { koId: { formaga: { total, correct } } }
  function migreraFantomhinkar(){
    try {
      var m = lasMatris(), lard = lasLard(), mChg = false, lChg = false;
      var tutRaw = localStorage.getItem(SCORE_KEY_MIGR), tut = tutRaw ? (JSON.parse(tutRaw) || {}) : {}, tChg = false;
      Object.keys(FANTOM_MIGRATION).forEach(function(fantom){
        var mal = FANTOM_MIGRATION[fantom];
        // MATRIS: flytta de tidsstämplade försöken (spacing-historiken som färgar kartan)
        if(m[fantom] && m[fantom].length){
          mal.forEach(function(t){ m[t] = (m[t] || []).concat(m[fantom]); });
          delete m[fantom]; mChg = true;
        }
        // LÄRD: för har-varit-lärd-golvet vidare till målnoderna
        if(lard[fantom]){ mal.forEach(function(t){ lard[t] = true; }); delete lard[fantom]; lChg = true; }
        // TUTORSCORES: flytta drillräknarna (fantom 'ko:formaga' → tut[ko][formaga])
        var fp = fantom.split(':'), fko = fp[0], ff = fp[1];
        if(tut[fko] && tut[fko][ff] && (tut[fko][ff].total || tut[fko][ff].correct)){
          var src = tut[fko][ff];
          mal.forEach(function(t){ var tp = t.split(':'); tut[tp[0]] = tut[tp[0]] || {}; var d = tut[tp[0]][tp[1]] = tut[tp[0]][tp[1]] || { total:0, correct:0 }; d.total = (d.total || 0) + src.total; d.correct = (d.correct || 0) + src.correct; });
          delete tut[fko][ff]; if(Object.keys(tut[fko]).length === 0) delete tut[fko]; tChg = true;
        }
      });
      if(mChg) sparMatris(m);
      if(lChg) localStorage.setItem(LARD_KEY, JSON.stringify(lard));
      if(tChg) localStorage.setItem(SCORE_KEY_MIGR, JSON.stringify(tut));
    } catch(e){}
  }
  migreraFantomhinkar();

  window.Mastery = Object.assign(M, { migreraFantomhinkar: migreraFantomhinkar, FANTOM_MIGRATION: FANTOM_MIGRATION });
})();
