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

      // Dokumentet sa "prickar" även här — en kvarleva från uppgiften före, av samma slag som
      // tennisbollarna. Joachim rättade ordet i hela uppgiften 2026-10-01.
      { rubrik: 'Skriv talföljden för antalet knappar i de fem första figurerna', loggStore: STORE, rader: [
        foljd([5, 9, 13, null, null], [null, null, null, 17, 21])
      ], logg: NOD_RAKNA },

      { rubrik: 'Vilket eller vilka av uttrycken visar antalet knappar', loggStore: STORE, rader: [
        { typ: 'flerval', tal: ['n + 4', '4n', '4n + 1', 'n · 4 + 1'], ratt: ['4n + 1', 'n · 4 + 1'] }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Använd ett korrekt uttryck och beräkna antalet knappar i figur nummer 70', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 281 }
      ], logg: NOD_RAKNA }
    ]
  };
}


// ── NIVÅ 2 ─────────────────────────────────────────────────────────────────────────────────
function niva2(){
  return {
    titel: 'Mönster – nivå 2',
    grupper: [

      { rubrik: 'Gör färdigt mönstren', loggStore: STORE, rader: [
        foljd([5, 8, 11, null, null, null],    [null, null, null, 14, 17, 20]),
        foljd([6, 10, 14, null, null, null],   [null, null, null, 18, 22, 26]),
        foljd([4.1, 3.7, 3.3, null, null, null], [null, null, null, 2.9, 2.5, 2.1])
      ], logg: NOD_FOLJD },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('kulorBlock', 'Figur 1 har fyra kulor i ett block, figur 2 åtta i två block, figur 3 tolv i tre.')
      ], logg: NOD_RAKNA },

      { rubrik: 'Hur många kulor finns det i mönstret – fyll i tabellen', loggStore: STORE, rader: [
        { typ: 'tabell', etiketter: ['Figur nr', 'Antal kulor'],
          huvud: [1, 2, 3, 4, 5], varden: [4, 8, null, null, null], facit: [null, null, 12, 16, 20] }
      ], logg: NOD_RAKNA },

      { rubrik: 'Beskriv mönstret med kulorna med en formel', loggStore: STORE, rader: [
        { typ: 'forenkla', fraga: '', svar: '4n', vars: 'n' }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Hur många kulor har figur 30', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 120 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('trianglar', 'Figur 1 är en triangel av tre stickor, figur 2 två trianglar av fem, figur 3 tre av sju.'),
        { typ: 'enkel', vansterText: 'Hur många stickor har figur 7', svar: 15 },
        { typ: 'enkel', vansterText: 'Vilken figur har 43 stickor', svar: 21 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Beskriv mönstret med en formel', loggStore: STORE, rader: [
        { typ: 'forenkla', fraga: '', svar: '2n + 1', vars: 'n' }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('sexhorningar', 'Figur 1 är en sexhörning av sex stickor, figur 2 två sexhörningar av elva, figur 3 tre av sexton.')
      ], logg: NOD_RAKNA },

      { rubrik: 'Hur många stickor finns det i mönstret – fyll i tabellen', loggStore: STORE, rader: [
        { typ: 'tabell', etiketter: ['Figur nr', 'Antal stickor'],
          huvud: [1, 2, 3, 4, 5], varden: [6, 11, null, null, null], facit: [null, null, 16, 21, 26] }
      ], logg: NOD_RAKNA },

      { rubrik: 'Hur många stickor har figur 6', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 31 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Beskriv mönstret med stickorna med en formel', loggStore: STORE, rader: [
        { typ: 'forenkla', fraga: '', svar: '5n + 1', vars: 'n' }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Hur många stickor har figur 100', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 501 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Gör färdigt talföljderna', loggStore: STORE, rader: [
        foljd([9.235, 9.233, 9.231, null, null, null], [null, null, null, 9.229, 9.227, 9.225]),
        foljd([0.303, 0.606, null, 1.212, null, null], [null, null, 0.909, null, 1.515, 1.818])
      ], logg: NOD_FOLJD },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('langaSexhorningar', 'Figur 1 är en avlång sexhörning av sex stickor, figur 2 två av elva, figur 3 tre av sexton.'),
        { typ: 'enkel', vansterText: 'Hur många stickor har figur 8', svar: 41 },
        { typ: 'enkel', vansterText: 'Vilken figur har 76 stickor', svar: 15 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Beskriv mönstret med en formel', loggStore: STORE, rader: [
        { typ: 'forenkla', fraga: '', svar: '5n + 1', vars: 'n' }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Detta är de tre första figurerna i ett mönster', loggStore: STORE, rader: [
        figur('blaRoda', 'Figur 1 har fyra blå kulor och en röd, figur 2 åtta blå och tre röda, figur 3 tolv blå och fem röda.')
      ], logg: NOD_RAKNA },

      { rubrik: 'Hur många kulor finns det i figur nio', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 53 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Beskriv mönstret med de blå kulorna med en formel', loggStore: STORE, rader: [
        { typ: 'forenkla', fraga: '', svar: '4n', vars: 'n' }
      ], logg: NOD_UTTRYCK },

      { rubrik: 'Hur många blå kulor har figur 10', loggStore: STORE, rader: [
        { typ: 'enkel', vansterText: '', svar: 40 }
      ], logg: NOD_RAKNA },

      { rubrik: 'Skriv de tre nästa talen i talföljden', loggStore: STORE, rader: [
        foljd([15, 11, 7, null, null, null],    [null, null, null, 3, -1, -5]),
        foljd([3.7, 2.8, 1.9, null, null, null], [null, null, null, 1.0, 0.1, -0.8])
      ], logg: NOD_FOLJD }
    ]
  };
}

window.BLAD_K3_D2 = { niva1: niva1, niva2: niva2 };

// Bygg direkt om sidans mount-punkter finns (samma mönster som d1 och d3).
if(typeof bygg_blad === 'function'){
  var m;
  if((m = document.getElementById('sheet-n1'))) bygg_blad(m, niva1());
  if((m = document.getElementById('sheet-n2'))) bygg_blad(m, niva2());
}
})();
