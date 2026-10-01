/* blad-k3-d2.js — SJUANS DELKAPITEL 2: MÖNSTER, öva-bladen (order 2026-09-30).

   Uppgifterna är transkriberade ur Mönster.docx, Nivå 1 och Nivå 2, och ekade tillbaka för
   Joachims godkännande innan något byggdes. Rubrikerna är hans ord — plural-rättningarna och
   "med kulorna" är beslut han fattat, inte omskrivningar.

   FIGURERNA ritas ur mönstrets regel (js/motor/figur/svg-monster.js), inte som bilder. Figur n
   kan därför ritas för varje n, och antalet räknas ur det ritade.

   LOGGNING per grupp, efter vad gruppen tränar:
     alg-talfoljd:resonera             fortsätta en talföljd
     alg-monster-rakna:rakna           räkna antal i figur n, och hitta figurnumret
     alg-monster-uttryck:kommunikation välja uttryck och skriva en formel
   De två öppna uppgifterna loggar INTE — de är förståelseträning, och det står uttryckligen i
   datan (loggarEj) i stället för att synas som en frånvaro.

   ELEVTEXT som fält (elevtext-låset ser rubrik/fraga/vansterText). Joachim sätter ordalydelsen. */
(function(){
'use strict';

var NOD_FOLJD   = 'alg-talfoljd:resonera';
var NOD_RAKNA   = 'alg-monster-rakna:rakna';
var NOD_UTTRYCK = 'alg-monster-uttryck:kommunikation';
var STORE = 'k3';

// RUBRIKER OCH FRÅGOR STÅR SOM FÄLT, inte som argument till en hjälpare: elevtext-låset läser
// bara text i ett känt fält, och en sträng som skickas in i en funktion är osynlig för det.
function foljd(givna, facit){
  // termer: talen i ordning, null där eleven ska skriva. facit har samma längd.
  return { typ: 'talfoljd', termer: givna, facit: facit };
}
function figur(familj, alt){ return { typ: 'figur', familj: familj, alt: alt }; }

// ── NIVÅ 1 ─────────────────────────────────────────────────────────────────────────────────
function niva1(){
  return {
    titel: 'Mönster – nivå 1',
    grupper: [

      { rubrik: 'Skriv de tre nästa talen i talföljden', loggStore: STORE, rader: [
        foljd([4, 9, 14, null, null, null],  [null, null, null, 19, 24, 29]),
        foljd([29, 26, 23, null, null, null], [null, null, null, 20, 17, 14])
      ], logg: NOD_FOLJD },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('kulorRad', 'Figur 1 har en kula, figur 2 har tre, figur 3 har fem.'),
        { typ: 'enkel', vansterText: 'Hur många kulor har figur 7', svar: 13 },
        { typ: 'enkel', vansterText: 'Vilken figur har 17 kulor', svar: 9 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Skriv de tal som saknas i talföljden', loggStore: STORE, rader: [
        foljd([0.002, 0.02, null, 2, null],   [null, null, 0.2, null, 20]),
        foljd([3000, null, 30, null, null],   [null, 300, null, 3, 0.3])
      ], logg: NOD_FOLJD },

      { rubrik: 'Detta är de första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('kvadrater', 'Figur 1 är en kvadrat av fyra stickor, figur 2 två kvadrater, figur 3 tre.'),
        { typ: 'enkel', vansterText: 'Hur många stickor har figur 6', svar: 19 },
        { typ: 'enkel', vansterText: 'Vilken figur har 22 stickor', svar: 7 }
      ], logg: NOD_RAKNA },

      // FÖRSTÅELSETRÄNING — loggas inte (Joachims beslut 2026-09-30). Eleven SKAPAR en följd ur
      // en regel; det är inte samma färdighet som att fortsätta en given följd, och den mäts inte här.
      { rubrik: 'Gör en talföljd där mönstret ökar med tre, använd fyra tal', rader: [
        { typ: 'talfoljdOppen', rutor: 4, villkor: { typ: 'differens', d: 3 } }
      ], loggarEj: 'förståelseträning: eleven skapar en egen följd, färdigheten mäts inte här' },

      { rubrik: 'Gör en talföljd där mönstret är "Multiplicera med tre och lägg till ett"', rader: [
        { typ: 'talfoljdOppen', rutor: 4, villkor: { typ: 'rekursiv', k: 3, m: 1 } }
      ], loggarEj: 'förståelseträning: eleven skapar en egen följd, färdigheten mäts inte här' },

      { rubrik: 'Vilka tal saknas i mönstren', loggStore: STORE, rader: [
        foljd([1, 2, 4, 7, null, null, null],   [null, null, null, null, 11, 16, 22]),
        foljd([1, 4, 8, 13, null, null, null],  [null, null, null, null, 19, 26, 34]),
        foljd([1, 3, 7, 13, null, null, null],  [null, null, null, null, 21, 31, 43])
      ], logg: NOD_FOLJD },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('bollarTva', 'Figur 1 har fem bollar i två rader, figur 2 har åtta, figur 3 elva.')
      ], logg: NOD_RAKNA },

      { rubrik: 'Hur många bollar finns det i mönstret – fyll i tabellen', loggStore: STORE, rader: [
        { typ: 'tabell', etiketter: ['Figur nr', 'Antal bollar'],
          huvud: [1, 2, 3, 4, 5], varden: [5, 8, null, null, null], facit: [null, null, 11, 14, 17] }
      ], logg: NOD_RAKNA },

      { rubrik: 'Hur många bollar finns det i figur nio', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 29 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Välj det uttrycket som hör till mönstret', loggStore: STORE, rader: [
        { typ: 'val', svar: '3n + 2', alternativ: ['5n + 1', '3n + 2', '5n − 2', '3n + 1'] }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('prickarTriangel', 'Figur 1 har tre prickar, figur 2 fem, figur 3 sju.')
      ], logg: NOD_RAKNA },

      { rubrik: 'Skriv talföljden för antalet prickar i de fem första figurerna', loggStore: STORE, rader: [
        foljd([3, 5, null, null, null], [null, null, 7, 9, 11])
      ], logg: NOD_RAKNA },

      { rubrik: 'Vilket eller vilka av uttrycken visar antalet prickar', loggStore: STORE, rader: [
        { typ: 'flerval', tal: ['n + 2', '2n + 1', 'n + 3', 'n · 2 + 1'], ratt: ['2n + 1', 'n · 2 + 1'] }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Använd ett korrekt uttryck och beräkna antalet prickar i figur nummer 70', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 141 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('knappar4', 'Figur 1 har fem knappar som formar en fyra, figur 2 har nio, figur 3 tretton.')
      ], logg: NOD_RAKNA },

      // ⚠️ Dokumentet säger 'prickar' även här, fast figuren är knappar — samma sorts kvarleva
      // som tennisbollarna i Nivå 2. Joachims ord står kvar tills han sagt annat.
      { rubrik: 'Skriv talföljden för antalet prickar i de fem första figurerna', loggStore: STORE, rader: [
        foljd([5, 9, 13, null, null], [null, null, null, 17, 21])
      ], logg: NOD_RAKNA },

      { rubrik: 'Vilket eller vilka av uttrycken visar antalet prickar', loggStore: STORE, rader: [
        { typ: 'flerval', tal: ['n + 4', '4n', '4n + 1', 'n · 4 + 1'], ratt: ['4n + 1', 'n · 4 + 1'] }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Använd ett korrekt uttryck och beräkna antalet prickar i figur nummer 70', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 281 }
      ], logg: NOD_RAKNA }
    ]
  };
}

window.BLAD_K3_D2 = { niva1: niva1 };

// Bygg direkt om sidans mount-punkt finns (samma mönster som d1 och d3).
// Nivå 2 byggs efter Joachims granskning av piloten — mount-punkten finns inte än.
if(typeof bygg_blad === 'function'){
  var m;
  if((m = document.getElementById('sheet-n1'))) bygg_blad(m, niva1());
}
})();
