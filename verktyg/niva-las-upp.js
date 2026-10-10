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

/* NIVÅVARVET (2026-10-10, arbetsorder v2 k2 "Räkna med former"): upplåsningen ovan gör stegen NÅBARA,
 * men en grind som bara klickar flikarna mäter ändå bara det aktiva steget. Fem grindar (brytning,
 * keypad, kontroll-svep, flerruts, yt-kontrakt) mätte därför nivå 1 och aldrig nivå 2 och 3 på blad med
 * egen nivårad (sjuans k2-kopior ritar raden själva, utan data-nivaer). EN stegning för alla:
 *
 *     const STEG = require('./niva-las-upp').stegSnutt;
 *     ... ${STEG} ... mat(namn); nivaVarv(mount, function(niva){ mat(namn + ' nivå ' + niva); });
 *
 * Knapparna frågas om per varv (bladet byggs om vid klick, en hållen knapp är ett löst element). Låsta
 * steg hoppas över — upplåsningen ovan ska ha öppnat dem; ett steg som ändå är låst syns som ett omätt
 * steg i grindens räkning. Efteråt klickas steg 1, så nästa flik börjar där eleven börjar. */
const stegSnutt = `
  function nivaVarv(mount, fn){
    var antal = (mount && mount.querySelectorAll('.niva-rad .niva-btn').length) || 0;
    for(var _s = 1; _s < antal; _s++){
      var _nb = mount.querySelectorAll('.niva-rad .niva-btn')[_s];
      if(!_nb || _nb.disabled || _nb.classList.contains('is-locked')) continue;
      _nb.click(); fn(_s + 1);
    }
    var _forsta = antal > 1 && mount.querySelector('.niva-rad .niva-btn');
    if(_forsta) _forsta.click();
  }
`;

module.exports = { snutt: snutt, stegSnutt: stegSnutt };
