/* niva-las-upp.js — DELAD PROV-SNUTT: lås upp bladets nivåsteg innan grinden mäter.
 *
 * SKÄLET. Nivå 3 och uppåt är villkorade (nivå 1 och 2 alltid öppna, lås först från 3), så med
 * tom lagring kommer en grind som bara klickar aldrig till steg 3 — och ett låst steg är ett
 * omätt blad. Grinden ska inte mäta med ?dev=1, för då mäter den inte elevens sida; den ska
 * STÄLLA IN omgivningen och sedan mäta den (V-regeln: mät aldrig något som beror på vem som kör).
 *
 * NYCKELN GISSAS INTE. Den är NivaRad:s egen, <prefix>_naddNiva<n>_<bladId>, och prefixet står på
 * bladet i data-niva-prefix — skrivet av kärnan när raden ritas. Ändras nyckelformen i nivarad.js
 * måste den här snutten följa med, annars dör mätningen tyst.
 *
 * RADEN LÄSER TILLSTÅNDET NÄR DEN RITAS, inte när nyckeln skrivs, så bladet byggs om med ett klick
 * på steg 1 efteråt.
 *
 * ANVÄNDS SÅ (i en grinds probe-sträng):
 *     const LAS_UPP = require('./niva-las-upp').snutt;
 *     const PROBE = `(function(){ ${LAS_UPP} ... })()`;
 *
 * Ingen nätväg. Inget skrivs utanför webbläsarens egen lagring i provet.
 */
'use strict';

const snutt = `
  document.querySelectorAll('[data-nivaer][data-niva-prefix]').forEach(function(ark){
    var antal = parseInt(ark.getAttribute('data-nivaer'), 10) || 1;
    var prefix = ark.getAttribute('data-niva-prefix');
    var vard = ark.closest('[id^="sheet-"]') || ark;
    var bid = String(vard.id || '').replace('sheet-', '');
    for(var _n = 2; _n <= antal; _n++){
      try { localStorage.setItem(prefix + '_naddNiva' + _n + '_' + bid, '1'); } catch(e){}
    }
    var _ett = ark.querySelector('.niva-rad .niva-btn');
    if(_ett) _ett.click();
  });
`;

module.exports = { snutt: snutt };
