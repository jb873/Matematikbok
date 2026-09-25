/* prob-blad4.js — PROBLEMLÖSNINGENS ÖVA-BLAD, VARIANT 4: vinklar (order 2026-09-24).

   FORMEN ÄR VARIANT 2:s — filen är data och monterar med ProbBlad2.render.

   DET UPPGIFTEN PRÖVAR är vinkelsumman 180°. Den står ingenstans i uppgiftstexten; eleven ska
   veta att den finns och använda den som villkor. Därför är vinklar en egen nod.

   FIGURERNA ritas ur data med samma modul som Förenkla uttryck (SvgAlgebraFigur). Figuren visar
   FORMEN och de KÄNDA talen — de okända vinklarna lämnas omärkta, eftersom att namnge dem är
   steg 1. Figurerna är schematiska, inte skalenliga: en triangel ritad efter facit låter eleven
   mäta sig till svaret. Eleven ritar ändå själv i sitt block; den uppmaningen hör till
   föreläsningen, inte till varje uppgift.

   DEN LIKBENTA TRIANGELN har TVÅ giltiga lösningar: 50° som toppvinkel ger 65° och 65°, 50° som
   basvinkel ger 50° och 80°. Båda godkänns — det är så uppgiften står i böcker och på prov, och
   att se de två fallen är en del av poängen. Den uppgiften får INGEN figur: en ritad triangel
   skulle välja fall åt eleven.

   Uppgift 4 e i dokumentet handlar om sidor, inte vinklar, och ligger i omkretsbladet.

   Loggar till alg-prob-vinklar:problem. */
(function(){
'use strict';

var B2 = (typeof window !== 'undefined' && window.ProbBlad2) || null;
var NOD = 'alg-prob-vinklar:problem';

function triangel(u){
  return { id: u.id, nod: NOD, niva: 1, variabel: 'x', fraga: u.fraga,
           delar: [{ nyckel: 'A', namn: 'vinkel A' }, { nyckel: 'B', namn: 'vinkel B' }, { nyckel: 'C', namn: 'vinkel C' }],
           relationer: u.relationer, villkor: ['A + B + C = 180'],
           enhet: 'grader', svarDelar: ['A', 'B', 'C'],
           fig: u.fig || { typ: 'vinkeltriangel', horn: ['A', 'B', 'C'], vinklar: u.vinklar || ['', '', ''] } };
}

// ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
// Texterna ber om ALLA vinklar, eftersom alla delar besvaras i steg 5.
var BLAD = {
  id: 'vinklar', titel: 'Vinklar', nod: NOD,
  uppgifter: [
    triangel({ id: 'n1-vinkel-a', relationer: ['A = 60', 'B = 2·C'], vinklar: ['60°', '', ''],
               fraga: 'I en triangel är vinkel A 60 grader. Vinkel B är dubbelt så stor som vinkel C. Hur stora är triangelns vinklar?' }),
    triangel({ id: 'n1-vinkel-b', relationer: ['A = 40', 'B = 3·C'], vinklar: ['40°', '', ''],
               fraga: 'I en triangel är vinkel A 40 grader. Vinkel B är tre gånger så stor som vinkel C. Hur stora är triangelns vinklar?' }),
    triangel({ id: 'n1-vinkel-c', relationer: ['B = 2·A', 'C = B + 10'],
               fraga: 'I triangeln ABC är vinkel B dubbelt så stor som vinkel A. Vinkel C är 10 grader större än vinkel B. Hur stora är triangelns vinklar?' }),
    // Dokumentets formulering ("dubbelt så stor så när som på 20 grader") kan läsas åt två håll.
    // Joachims beslut: B = 2C − 20, och texten skrivs så att den inte kan missförstås.
    triangel({ id: 'n1-vinkel-d', relationer: ['A = 35', 'B = 2·C - 20'], vinklar: ['35°', '', ''],
               fraga: 'I en triangel är vinkel A 35 grader. Vinkel B är 20 grader mindre än dubbla vinkel C. Hur stora är triangelns vinklar?' }),
    { id: 'n1-vinkel-e', nod: NOD, niva: 1, variabel: 'x',
      fraga: 'I en likbent triangel är en vinkel 50 grader. Hur stora är triangelns tre vinklar?',
      delar: [{ nyckel: 'A', namn: 'den givna vinkeln' }, { nyckel: 'B', namn: 'vinkel B' }, { nyckel: 'C', namn: 'vinkel C' }],
      enhet: 'grader', svarDelar: ['A', 'B', 'C'],
      grenar: [
        { id: 'topp', relationer: ['A = 50', 'B = C'],  villkor: ['A + B + C = 180'] },
        { id: 'bas',  relationer: ['A = 50', 'B = 50'], villkor: ['A + B + C = 180'] }
      ] }
  ]
};

// ── MONTERING ─────────────────────────────────────────────────────────────────────────────────
(function(){
  if(typeof document === 'undefined') return;
  var mount = document.getElementById('sheet-vinklar');
  if(mount && B2 && B2.render) B2.render(mount, BLAD);
})();

if(typeof window !== 'undefined') window.ProbBlad4 = { BLAD: BLAD };
if(typeof module !== 'undefined' && module.exports) module.exports = { BLAD: BLAD };
})();
