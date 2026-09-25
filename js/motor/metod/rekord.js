/* rekord.js — REKORD PER DRILL OCH NIVÅ (window.Rekord), order 2026-09-25.

   Rekord som drivkraft är en MEKANISM, inte en egenskap hos tabellerna: samma sak kan gälla
   multiplikation med små tal, tiokompisar och varje annan drill där eleven gör samma sorts
   uppgift många gånger. Därför ligger den här, inte i två lokala lösningar.

   REGELN: rekordet är ALLA RÄTT, PÅ KORTAST TID. En omgång med fel kan aldrig skriva över ett
   rekord — tiden räknas bara när omgången är felfri.

   SLÅS PÅ PER DRILL: drillen anropar Rekord med sitt eget id. En drill som inte anropar den har
   inga rekord. Ingen central lista att hålla i takt.

     var best = Rekord.basta('mult-tabell', 1);            // ms eller null
     var r = Rekord.spara('mult-tabell', 1, 8100, true);   // { nytt:bool, tidigare:ms|null }
     Rekord.text('mult-tabell', 1)                         // "🏆 Rekord: 8,1 s" | "Inget rekord än"

   FYNDET som gav ordern: rekordet skrevs till ett fält på ramens state-objekt i minnet, och
   persistenslagret sparade bara repetition och tutorScores. Rekordet dog vid omladdning, och
   drillen laddas om varje gång eleven öppnar den — så "Inget rekord än" stod kvar för alltid.
   Därför äger den här modulen sin egen nyckel och läser den varje gång.

   Elev-lokalt (localStorage), ingen nätväg. Blockerad eller full lagring ska aldrig fälla en
   drill: allt är inslaget i try/catch och ett misslyckat sparande betyder bara att rekordet inte
   följer med till nästa besök. */
(function(){
'use strict';

var NYCKEL = 'matematik.rekord.v1';        // { "<drill>": { "<niva>": ms } }

function las(){
  try { return JSON.parse(localStorage.getItem(NYCKEL) || '{}') || {}; }
  catch(e){ return {}; }
}
function skriv(allt){
  try { localStorage.setItem(NYCKEL, JSON.stringify(allt)); return true; }
  catch(e){ return false; }
}

// Bästa tiden för en drill och nivå, eller null.
function basta(drill, niva){
  var allt = las(), d = allt[drill];
  var v = d && d[String(niva)];
  return (typeof v === 'number' && isFinite(v) && v > 0) ? v : null;
}

// Sparar bara om omgången var FELFRI och tiden är bättre än den gamla.
// Returnerar { nytt, tidigare } så att drillen kan säga rätt sak i summeringen.
function spara(drill, niva, ms, felfri){
  var tidigare = basta(drill, niva);
  if(!felfri) return { nytt: false, tidigare: tidigare };
  if(!(typeof ms === 'number' && isFinite(ms) && ms > 0)) return { nytt: false, tidigare: tidigare };
  if(tidigare !== null && ms >= tidigare) return { nytt: false, tidigare: tidigare };
  var allt = las();
  if(!allt[drill]) allt[drill] = {};
  allt[drill][String(niva)] = ms;
  skriv(allt);
  return { nytt: true, tidigare: tidigare };
}

// "8,1 s" · "1 min 04,2 s" — samma form som tabellernas egen tidvisning.
function formatTid(ms){
  var s = ms / 1000;
  if(s < 60) return s.toFixed(1).replace('.', ',') + ' s';
  var m = Math.floor(s / 60), r = s - m * 60;
  return m + ' min ' + (r < 10 ? '0' : '') + r.toFixed(1).replace('.', ',') + ' s';
}

function text(drill, niva){
  var b = basta(drill, niva);
  return b ? '🏆 Rekord: ' + formatTid(b) : 'Inget rekord än';
}

// Nollställer en drill (eller allt) — för prov och för en elev som vill börja om.
function rensa(drill){
  if(!drill) return skriv({});
  var allt = las();
  delete allt[drill];
  return skriv(allt);
}

var API = { basta: basta, spara: spara, text: text, formatTid: formatTid, rensa: rensa, NYCKEL: NYCKEL };
if(typeof window !== 'undefined') window.Rekord = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
