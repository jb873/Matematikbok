/* prob-blad5.js — PROBLEMLÖSNINGENS ÖVA-BLAD, VARIANT 5: omkrets (order 2026-09-24).

   FORMEN ÄR VARIANT 2:s — filen är data och monterar med ProbBlad2.render.

   DET UPPGIFTEN PRÖVAR är att figuren har fyra sidor och inte två: omkretsen av en rektangel är
   2a + 2b, inte a + b. Det är skälet till att omkrets är skild från vinklar.

   FIGURERNA ritas ur data (SvgAlgebraFigur), visar formen och omkretsen — de okända sidorna är
   omärkta, för att namnge dem är steg 1. Schematiska, inte skalenliga: en rektangel ritad 16:24
   låter eleven gissa svaret med ögat.

   AREAN (uppgift b) är ingen ekvationsrad utan en multiplikation av de två sidorna. Den får en
   egen rad mellan balansmetoden och svaret, med etiketten Area: framför rutan (Joachims beslut).

   Sista uppgiften är dokumentets 4 e, som handlar om sidor och inte vinklar. Versionen med
   29 cm är den som gäller; den med 28 utgår.

   Loggar till alg-prob-omkrets:problem. */
(function(){
'use strict';

var B2 = (typeof window !== 'undefined' && window.ProbBlad2) || null;
var NOD = 'alg-prob-omkrets:problem';

function rektangel(u){
  return { id: u.id, nod: NOD, niva: 1, variabel: 'x', fraga: u.fraga,
           delar: [{ nyckel: 'A', namn: 'den ena sidan' }, { nyckel: 'B', namn: 'den andra sidan' }],
           relationer: u.relationer, villkor: ['2·A + 2·B = ' + u.omkrets],
           enhet: u.enhet, svarDelar: ['A', 'B'],
           foljdfraga: u.foljdfraga,
           fig: { typ: 'rektangel', bredd: '', hojd: '', alt: 'Rektangel med omkretsen ' + u.omkrets + ' ' + u.enhet,
                  under: 'Omkrets ' + u.omkrets + ' ' + u.enhet } };
}

// ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
// Texterna ber om ALLA delar, eftersom alla delar besvaras i steg 5.
var BLAD = {
  id: 'omkrets', titel: 'Omkrets', nod: NOD,
  uppgifter: [
    rektangel({ id: 'n1-omkrets-a', relationer: ['B = A + 8'], omkrets: 80, enhet: 'm',
                fraga: 'I en rektangel är den ena sidan 8 meter längre än den andra. Omkretsen är 80 meter. Hur långa är rektangelns sidor?' }),
    rektangel({ id: 'n1-omkrets-b', relationer: ['B = A + 4'], omkrets: 28, enhet: 'cm',
                foljdfraga: { etikett: 'Area:', uttryck: 'A·B', enhet: 'cm²' },
                fraga: 'I en rektangel är omkretsen 28 cm. Den ena sidan är 4 cm längre än den andra. Hur långa är sidorna, och hur stor är rektangelns area?' }),
    rektangel({ id: 'n1-omkrets-c', relationer: ['B = 2·A'], omkrets: 30, enhet: 'cm',
                fraga: 'I en rektangel är omkretsen 30 cm. Den ena sidan är dubbelt så lång som den andra. Hur långa är rektangelns sidor?' }),
    { id: 'n1-omkrets-d', nod: NOD, niva: 1, variabel: 'x',
      fraga: 'I en triangel är sida a dubbelt så lång som sida b, och sida c är 5 cm längre än sida b. Omkretsen är 29 cm. Hur långa är de tre sidorna?',
      delar: [{ nyckel: 'A', namn: 'sida a' }, { nyckel: 'B', namn: 'sida b' }, { nyckel: 'C', namn: 'sida c' }],
      relationer: ['A = 2·B', 'C = B + 5'], villkor: ['A + B + C = 29'],
      enhet: 'cm', svarDelar: ['A', 'B', 'C'],
      fig: { typ: 'sidtriangel', sidor: ['a', 'c', 'b'], under: 'Omkrets 29 cm' } }
  ]
};

// ── MONTERING ─────────────────────────────────────────────────────────────────────────────────
(function(){
  if(typeof document === 'undefined') return;
  var mount = document.getElementById('sheet-omkrets');
  if(mount && B2 && B2.render) B2.render(mount, BLAD);
})();

if(typeof window !== 'undefined') window.ProbBlad5 = { BLAD: BLAD };
if(typeof module !== 'undefined' && module.exports) module.exports = { BLAD: BLAD };
})();
