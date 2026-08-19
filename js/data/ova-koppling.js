/* ova-koppling.js — KOPPLINGSREGISTRET (framåt-benet i koppling-låset).
   ────────────────────────────────────────────────────────────────────────────────────────────────
   Regeln: en test-generator får bara pröva det som övas någonstans — ett öva-blad ELLER en drill.
   En generator vars nod redan tränas av en DRILL (Färdighetsträningens item-lista eller
   OVNING_RENDERS) behöver ingen rad här — koppling-grind.js härleder den täckningen automatiskt ur
   taxonomin. Bara generatorer som tränas av ett ÖVA-BLAD deklareras här, för den kopplingen går inte
   att läsa maskinellt ur bladet.

   Värdet är 'blad:<bladfil-utan-.js>:<öva-rubrik>'. Grinden verifierar att bladfilen finns.

   Omfång just nu: sjuans k1 (ak7-k1-ram.html), delkapitel 1 (positionssystemet + delbarhet +
   utvecklad form). Övriga delkapitel/årskurser läggs till när de inventeras (FAS 0 per delkapitel). */
window.OVA_KOPPLING = {
  // ── åk7 k1, del 1 — tränas av blad-k1-d1.js (drillfria noder) ──
  'delbar-binary':  'blad:blad-k1-d1:Delbarhetsregler',        // delbarhet:rakna
  'siffersumma':    'blad:blad-k1-d1:Delbarhetsregler',        // delbarhet:begrepp
  'platsvarde':     'blad:blad-k1-d1:Positionssystemet',       // position:begrepp
  'talfoljd':       'blad:blad-k1-d1:Talföljder',              // position:rakna
  'jamfor-tal':     'blad:blad-k1-d1:Räkna i positionssystemet', // position:resonera
  'utvform-valj':   'blad:blad-k1-d1:Positionssystemet',       // utvecklad:metod
  'utvform-lasut':  'blad:blad-k1-d1:Positionssystemet',       // utvecklad:rakna
  'mittemellan':    'blad:blad-k1-d1:Räkna i positionssystemet', // position:rakna
  'pos-intervall':  'blad:blad-k1-d1:Räkna i positionssystemet', // position:rakna
};
