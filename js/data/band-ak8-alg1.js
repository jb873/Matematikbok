/* band-ak8-alg1.js — TALOMRÅDET FÖR ÅTTANS ALGEBRAISKA UTTRYCK (order 2026-09-28).

   Åttans delkapitel 1 är REPETITION av sjuans: samma kunskaper, samma talområde, samma uppgifter
   med andra siffror och andra figurer. Villkoren för talbytet står här som DATA — generatorn läser
   dem, den bär dem inte. Samma princip som nians variantband och uppställningsbanden.

   DEN VIKTIGASTE REGELN är behallEgenskap: 'per rad'. Ett tal som bär uppgiftens poäng måste bytas
   mot ett tal med SAMMA egenskap, inte mot vilket tal som helst:
     · 1,3x · 10  — decimalen ÄR uppgiften (multiplikation med 10 flyttar decimaltecknet)
     · x − x = 0  — nollsvaret ÄR uppgiften
     · 4x + 3x    — samma variabel i båda termerna, annars går de inte att samla
   Egenskapen står på raden (egenskap:), och generatorn förkastar ett byte som bryter den.

   ejSjuansTal: inget uppgiftspar får bli identiskt med förlagans. Generatorn jämför mot
   SJUANS_PAR och drar om.

   Bandet höjer ingenting: koefficienter och konstanter ligger i samma spann som sjuans blad.
   Det här är repetition, inte nästa nivå. */
(function(){
'use strict';

var BAND = {
  // ── Talområden per flik (samma som sjuans förlagor) ──
  tolka: {
    bokstaver: ['a', 'b', 'x', 'y'],
    antal:     [2, 6],        // hur många av varje vara uttrycket beskriver
    pris:      [4, 30]        // värdet en bokstav får i följdfrågan
  },
  skriva: {
    tal:       [2, 20],       // "10 cm längre", "3 år äldre"
    koeff:     [2, 9],        // "dubbelt så", "tre gånger så"
    sidor:     [2, 9]         // figurernas sidor (x, 3x, 4 …)
  },
  berakna: {
    varde:     [0, 12],       // värdet variabeln får
    koeff:     [2, 9],
    konstant:  [1, 20]
  },
  forenkla: {
    koeff:     [2, 12],
    termer:    [2, 4],
    konstant:  [1, 15]
  },

  // ── Regler som gäller alla fyra flikarna ──
  regler: {
    ejSjuansTal:     true,     // inget uppgiftspar identiskt med förlagan
    behallEgenskap:  'per rad',// raden säger vad bytet måste bevara (se EGENSKAPER)
    behallSvarsform: 'per grupp',
    figurEgnaVarden: true      // figuren ritas ur data — ett ändrat tal ändrar figur och facit ihop
  },

  // ── Egenskaper en rad kan kräva att bytet bevarar ──
  // Generatorn kör provet mot det nya talparet och drar om tills det håller.
  EGENSKAPER: {
    // Provet läser TECKNET i uppgiftstexten — den är en sträng, och "2y · 10" % 1 blir NaN,
    // vilket inte är noll och därför förr slank igenom som "decimal".
    decimal:     function(v){ return String(v).indexOf(',') > -1; },
    heltal:      function(v){ return v % 1 === 0; },
    nollsvar:    function(_, svar){ return Number(svar) === 0; },
    kvadrattal:  function(v){ var r = Math.sqrt(Math.abs(v)); return r === Math.round(r); },
    jamnt:       function(v){ return v % 2 === 0; },
    negativtSvar:function(_, svar){ return Number(svar) < 0; }
  }
};

// Sjuans talpar per flik — generatorn får inte återskapa något av dem.
// (Listan hålls som rena strängar: uppgiftens vänsterled, saneradt från mellanrum.)
var SJUANS_PAR = {
  tolka:   ['3a+2b', '4a+2b', '2a+5b', '2x+3y', '6x+4y'],
  skriva:  ['x+3', 'x+4', '3x', 'a+10', 'a-18', '2a', 'a/2', 'x+2', '2x', '4x+2', 'b+5', '12x', '8x'],
  berakna: ['5y-3', '4a+5', '4x+y', '6x-3y', '7a+4b-3'],
  forenkla:['4x+3x', '7x+2x', '3x+x+2x', 'y+y', 'y+5y+7y', '12x-5x', '42x-8x', '10y-3y+2y', 'x-x',
            '9y+2y-5y', '5·3x', '4y·7', '1,3x·10', '6·5y+3y', '3x+4·6x',
            '6x+2y-3x+4y', '7x+4y-3x+2y', '5x-6y-2x+8y', '8x-5y+3x+2y',
            '3y+5-y', '8a+6-3a-4', '7y-3-6y+7', '9a-2+6a-3', '4y+2x-y+5x+3']
};

var API = { BAND: BAND, SJUANS_PAR: SJUANS_PAR };
if(typeof window !== 'undefined') window.BAND_AK8_ALG1 = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
