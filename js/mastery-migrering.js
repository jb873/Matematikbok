/* mastery-migrering.js — ENGÅNGS-MIGRERINGAR av den lokala mastery-loggen (k1).
   ── INTEGRITETSGRÄNS: rör bara localStorage. Ingen fetch/XHR/WebSocket/sendBeacon. ──
   Additivt skal: laddas EFTER mastery.js. Rör inte loggning/masteryState (byte-identiska);
   flyttar bara historik mellan nod-nycklar när en nod delas. Varje migrering är IDEMPOTENT
   (skyddad av en version-flagga i egen nyckel) — säker att köra vid varje sidladdning. */
(function(){
  'use strict';
  var MATRIS_KEY = 'k1.taluppfattning.mastery.v1';         // { nodeId: [ { ts, resultat } ... ] }
  var FLAGG_KEY  = 'k1.taluppfattning.migrering.v1';        // { migreringsId: tidsstämpel }

  function las(k){ try { return JSON.parse(localStorage.getItem(k)) || {}; } catch(e){ return {}; } }
  function spar(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }

  // ── B0.3 · neg-rakna:rakna delades i add-sub + mult-div ──
  //  add-sub  ← kopia av all evidens från gamla noden (den mätte i praktiken add/sub-färdighet)
  //  mult-div ← INGEN evidens (aldrig mätt separat → skulle bli falskt grönt; börjar rött)
  //  Gamla nyckeln tas bort efter kopiering (noden finns inte längre → ingen orphan).
  function migreraNegRaknaDelning(){
    var flaggor = las(FLAGG_KEY);
    if(flaggor['neg-rakna-delning-v1']) return { id:'neg-rakna-delning-v1', korde:false };  // idempotent
    var m = las(MATRIS_KEY);
    var GAMMAL = 'neg-rakna:rakna', ADDSUB = 'neg-rakna:addsub';
    var antal = (m[GAMMAL] && m[GAMMAL].length) ? m[GAMMAL].length : 0;
    if(antal){
      if(!m[ADDSUB]) m[ADDSUB] = [];
      m[ADDSUB] = m[ADDSUB].concat(m[GAMMAL]);   // kopiera historik → add-sub
      delete m[GAMMAL];                           // ta bort gamla nyckeln (noden är delad)
      spar(MATRIS_KEY, m);
    }
    // mult-div: rör inte — börjar rött.
    flaggor['neg-rakna-delning-v1'] = Date.now();
    spar(FLAGG_KEY, flaggor);
    return { id:'neg-rakna-delning-v1', korde:true, flyttade:antal, fran:GAMMAL, till:ADDSUB, multDiv:'neg-rakna:multdiv (tom)' };
  }

  var resultat = [ migreraNegRaknaDelning() ];
  // Exponera för verifiering/rapport (ingen sidoeffekt utöver ovan).
  window.MasteryMigrering = { MATRIS_KEY: MATRIS_KEY, FLAGG_KEY: FLAGG_KEY, resultat: resultat, korOm: migreraNegRaknaDelning };
})();
