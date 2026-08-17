/* ova-sekvens.js — DELAD elev-lokal sekvens-store för nians öva-varianter (dk1, dk2, … och senare
   nians/gy:s tio dokument). Bröts ut ur tal-och-berakna-ova.html + rakna-med-brak-ova.html — SAMMA
   pos/varv-logik, bara STORE_KEY och ANTAL_DOK skiljer. Samma skäl som när foten och likhetsrättaren
   bröts ut: en andra kopia blir dyr omedelbart.

   { ovaN: {pos, varv} } i localStorage — lämnar ALDRIG enheten (GDPR, ingen nätväg). pos 0..ANTAL_DOK-1;
   framflytta stegar pos och wrappar efter sista dokumentet (varv++). Dokumenträknaren är INTERN, döljs
   för eleven. Beteendet är byte-identiskt med den tidigare inline-koden.

   Bruk:  var seq = OvaSekvens('k1.taluppfattning.ovavariant.v1', 4);
          seq.posFor(dokId) → { pos, varv } · seq.framflytta(dokId) → nytt { pos, varv } */
(function(){
  'use strict';
  function OvaSekvens(storeKey, antalDok){
    function lasStore(){ try { return JSON.parse(localStorage.getItem(storeKey)) || {}; } catch(e){ return {}; } }
    function sparStore(s){ try { localStorage.setItem(storeKey, JSON.stringify(s)); } catch(e){} }
    function posFor(dokId){ var s = lasStore(); var d = s[dokId]; return d && typeof d.pos === 'number' ? d : { pos:0, varv:0 }; }
    function framflytta(dokId){
      var s = lasStore(); var d = s[dokId] || { pos:0, varv:0 };
      var np = d.pos + 1, nv = d.varv || 0;
      if(np >= antalDok){ np = 0; nv = nv + 1; }             // wrap efter sista dokumentet → varvet om, varv++
      s[dokId] = { pos:np, varv:nv }; sparStore(s); return s[dokId];
    }
    return { ANTAL_DOK: antalDok, lasStore: lasStore, sparStore: sparStore, posFor: posFor, framflytta: framflytta };
  }
  if(typeof window !== 'undefined') window.OvaSekvens = OvaSekvens;
  if(typeof module !== 'undefined' && module.exports) module.exports = OvaSekvens;
})();
