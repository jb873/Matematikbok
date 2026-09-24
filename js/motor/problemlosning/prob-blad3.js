/* prob-blad3.js — PROBLEMLÖSNINGENS ÖVA-BLAD, VARIANT 3: tal som följer på varandra (order 2026-09-24).

   FORMEN ÄR VARIANT 2:s. Den här filen är DATA — uppgifterna — och monterar dem med
   ProbBlad2.render. Det som är en funktion ärvs; en kopia av bladmotorn ärver ingenting och
   driver i väg vid första rättelsen.

   SKILLNADEN mot variant 2: delarna är tal i följd, och inget namn är givet. Uppgiften säger
   hur många tal det är — antalet rader i steg 1 är elevens ansvar, och det är här det syns
   tydligast av alla varianterna.

   ELEVEN VÄLJER SJÄLV VILKET TAL SOM ÄR x. Relationerna i modellen är identiteter, inte facit:

       x, x + 1, x + 2      (det första talet är x)
       x − 1, x, x + 1      (det mittersta talet är x)
       x − 2, x − 1, x      (det sista talet är x)

   Alla tre ger identiteter och alla tre godkänns. Ekvationen blir 3x + 3 = 168, 3x = 168
   respektive 3x − 3 = 168 — olika ekvationer, samma uppgift. Rättaren prövar elevens egen
   ekvation mot villkoret, inte mot en förskriven rad.

   JÄMNA TAL följer varandra med 2: x, x + 2, x + 4. Skriver eleven x + 1 håller inte
   relationen, och det fälls på steg 1 — inte på svaret.

   Namnen rättas inte: "tal 1", "T1", "a" är elevens egna etiketter. Bladet provar radernas
   ordningar och använder den som håller (samma ordnaDelar som variant 2).

   Loggar till alg-prob-foljd:problem. */
(function(){
'use strict';

var B2 = (typeof window !== 'undefined' && window.ProbBlad2) || null;
var NOD = 'alg-prob-foljd:problem';

// Delarna byggs ur antalet tal och steget mellan dem; frågan står i uppgiftens eget fält.
function foljd(u){
  var delar = [], relationer = [], summa = [];
  for(var i = 0; i < u.antal; i++){
    var nyckel = String.fromCharCode(65 + i);
    delar.push({ nyckel: nyckel, namn: 'Tal ' + (i + 1) });
    if(i) relationer.push(nyckel + ' = A + ' + (i * u.steg));
    summa.push(nyckel);
  }
  return { id: u.id, nod: NOD, niva: 1, variabel: 'x', fraga: u.fraga,
           delar: delar, relationer: relationer, villkor: [summa.join(' + ') + ' = ' + u.summa] };
}

// ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
// Texterna ber om ALLA delar, som i variant 2.
var BLAD = {
  id: 'foljd', titel: 'Tal som följer på varandra', nod: NOD,
  uppgifter: [
    foljd({ id: 'n1-foljd-a', antal: 3, steg: 1, summa: 168,
            fraga: 'Tre tal som följer på varandra har summan 168. Vilka är talen?' }),
    foljd({ id: 'n1-foljd-b', antal: 3, steg: 1, summa: 234,
            fraga: 'Tre tal som följer på varandra har summan 234. Vilka är talen?' }),
    foljd({ id: 'n1-foljd-c', antal: 4, steg: 1, summa: 174,
            fraga: 'Fyra tal som följer på varandra har summan 174. Vilka är talen?' }),
    foljd({ id: 'n1-foljd-d', antal: 4, steg: 2, summa: 180,
            fraga: 'Fyra jämna tal som följer på varandra har summan 180. Vilka är talen?' }),
    foljd({ id: 'n1-foljd-e', antal: 3, steg: 2, summa: 216,
            fraga: 'Tre jämna tal som följer på varandra har summan 216. Vilka är talen?' })
  ]
};

// ── MONTERING ─────────────────────────────────────────────────────────────────────────────────
(function(){
  if(typeof document === 'undefined') return;
  var mount = document.getElementById('sheet-foljd');
  if(mount && B2 && B2.render) B2.render(mount, BLAD);
})();

if(typeof window !== 'undefined') window.ProbBlad3 = { BLAD: BLAD };
if(typeof module !== 'undefined' && module.exports) module.exports = { BLAD: BLAD };
})();
