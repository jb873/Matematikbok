/* ak8-ekv1.js — ÅTTANS EKVATIONER STEG 1 (åk8 kapitel 2, delkapitel 5). Order 2026-10-21.

   KÄLLA: Ekvationer steg 1.docx, 7 885 byte, md5 1ff72ec318240462ed71efc36a012eff (Joachims rättade
   version: nivå 3 grupp 2 b slutar "− 9/10"). 31 uppgifter, transkriberade ORDAGRANT ur document.xml —
   formlerna (m:oMath) som staplade bråk. Dokumentets grupper är bladets grupper.

   SKRIVSÄTTET: 'VL = HL', staplade bråk som [täljare|nämnare], minus som −. Rendering och parser läser
   samma sträng, så det som visas och det som rättas kan inte driva isär.

   FACIT står i en godkänd svarsform (Joachim 2026-10-21): exakt, i decimalform eller blandad form;
   äkta bråk godtas. Värdet är kontrollräknat mot ett exakt orakel och mot Joachims kontrollfacit av
   verktyg/ekv-parser-fuzz.js (benet FACIT). Facit visas inte för eleven — kedjan rättar varje rad.

   NIVÅERNA (Joachim 2026-10-21): nivå 1 skriver varje operation på båda sidor ('utskriven'), nivå 2–3
   en rad per operation ('kort'). Läget står här, i datan, som mellanledsflaggan i d3 — inte i koden.
   Radkravet räknas av EkvParser.minstaAntalRaderUtokad med sidans regler; tabellen över kravet per
   uppgift är godkänd i FAS 2 och prövas av benet RADKRAV.

   NODERNA per uppgift (FAS 2): bråk och decimaltal är band — sjuans noder ärvs. x i nämnaren är en ny
   metod (multiplicera båda leden med x) och har en egen nod. */
(function(){
'use strict';

var ENSIDIG = 'alg-ekv-ensidig:rakna', BADA = 'alg-ekv-badaled:rakna', NAMNARE = 'alg-ekv-namnare:rakna';
// ELEVTEXT som fält, så att elevtext-låset ser den: dokumentets egen rubrik, samma i alla grupper.
var TEXT = { rubrik: 'Lös med balansmetoden' };
var RUBRIK = TEXT.rubrik;

var AK8_EKV1 = {
  // Kedjans regler på den här sidan. Var och en är en flagga i den delade rättaren (ekv-rattare.js).
  regler: { namnare: true, spegling: true, samla: true, sistaRaden: true, svarsform: true, blandad: true },

  nivaer: {
    1: { lage: 'utskriven', grupper: [
      { rubrik: RUBRIK, uppgifter: [
        { id: '1·1a', uppg: '6x + 10 = 64',     facit: '9',    nod: ENSIDIG },
        { id: '1·1b', uppg: '5x − 32 = 88',     facit: '24',   nod: ENSIDIG },
        { id: '1·1c', uppg: '95 = 4x − 7',      facit: '25,5', nod: ENSIDIG } ] },
      { rubrik: RUBRIK, uppgifter: [
        { id: '1·2a', uppg: '[x|7] + 4 = 9',    facit: '35',   nod: ENSIDIG },
        { id: '1·2b', uppg: '[x|4] − 6 = 9',    facit: '60',   nod: ENSIDIG },
        { id: '1·2c', uppg: '32 = [x|6] + 14',  facit: '108',  nod: ENSIDIG } ] },
      { rubrik: RUBRIK, uppgifter: [
        { id: '1·3a', uppg: '7x + 8 = 5x + 14', facit: '3',    nod: BADA },
        { id: '1·3b', uppg: '10x − 8 = 7x + 4', facit: '4',    nod: BADA },
        { id: '1·3c', uppg: '3x + 4 = 5x + 8',  facit: '−2',   nod: BADA } ] }
    ] },

    2: { lage: 'kort', grupper: [
      { rubrik: RUBRIK, uppgifter: [
        { id: '2·1a', uppg: '[2x|3] − 5 = 7',      facit: '18',  nod: ENSIDIG },
        { id: '2·1b', uppg: '[12x|5] − 4 = 14',    facit: '7,5', nod: ENSIDIG },
        { id: '2·1c', uppg: '22 = 4 + [3x|4]',     facit: '24',  nod: ENSIDIG } ] },
      { rubrik: RUBRIK, uppgifter: [
        { id: '2·2a', uppg: '2x + 10 = 38 − 5x',   facit: '4',   nod: BADA },
        { id: '2·2b', uppg: '15 − 4x = 2x − 3',    facit: '3',   nod: BADA },
        { id: '2·2c', uppg: '2x − 8 = 17 − 3x',    facit: '5',   nod: BADA } ] },
      { rubrik: RUBRIK, uppgifter: [
        { id: '2·3a', uppg: '10 − [4x|3] = 18',    facit: '−6',  nod: ENSIDIG },
        { id: '2·3b', uppg: '0,2x + 5 = 25 − 0,3x', facit: '40', nod: BADA },
        { id: '2·3c', uppg: '20 − 13y = 50 − 11y', facit: '−15', nod: BADA, variabel: 'y' } ] }
    ] },

    3: { lage: 'kort', grupper: [
      { rubrik: RUBRIK, uppgifter: [
        { id: '3·1a', uppg: '[x|3] = 5 + [x|4]',        facit: '60',        nod: BADA },
        { id: '3·1b', uppg: '[3x|2] + [5|4] = x',       facit: '−2 [1|2]',  nod: BADA },
        { id: '3·1c', uppg: 'x − [x|6] = [5|3]',        facit: '2',         nod: ENSIDIG } ] },
      { rubrik: RUBRIK, uppgifter: [
        { id: '3·2a', uppg: '[2x|5] − [x|6] = 7',       facit: '30',        nod: ENSIDIG },
        { id: '3·2b', uppg: '[3x|2] = [7x|5] − [9|10]', facit: '−9',        nod: BADA } ] },
      { rubrik: RUBRIK, uppgifter: [
        { id: '3·3a', uppg: '[3|4] = [12|x]',           facit: '16',        nod: NAMNARE },
        { id: '3·3b', uppg: '[20|x] = [2|7]',           facit: '70',        nod: NAMNARE },
        { id: '3·3c', uppg: '[1|2x] = 5',               facit: '[1|10]',    nod: NAMNARE },
        { id: '3·3d', uppg: '[8|5x] = 0,16',            facit: '10',        nod: NAMNARE } ] },
      { rubrik: RUBRIK, uppgifter: [
        { id: '3·4a', uppg: '[1|x] = [1|3] − [1|5]',    facit: '7 [1|2]',   nod: NAMNARE },
        { id: '3·4b', uppg: '[1|x] + [3|2x] = 2',       facit: '1 [1|4]',   nod: NAMNARE },
        { id: '3·4c', uppg: '[1|2x] − [1|3x] = [1|6]',  facit: '1',         nod: NAMNARE },
        { id: '3·4d', uppg: '[1|2x] − [1|3] = [2|x]',   facit: '−4 [1|2]',  nod: NAMNARE } ] }
    ] }
  }
};

if(typeof window !== 'undefined') window.AK8_EKV1 = AK8_EKV1;
if(typeof module !== 'undefined' && module.exports) module.exports = AK8_EKV1;
})();
