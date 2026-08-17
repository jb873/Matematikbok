/* gy-alg-brak.js — AUTOGENERERAD (scratchpad/gy/gen.js) ur Joachims åtta docx. Rör ej för hand.
   Rationella uttryck (algebraiska bråk). p = prompt (BRAK), t/n = facit täljare/nämnare (enklaste form).
   Facit punktverifierade mot originaluttrycket; graderas av window.AlgBrak (värde + form). */
(function(){ 'use strict';
  var GY = {
 "ova1": {
  "titel": "Öva 1 – Bryt ut och förkorta",
  "sub": "bryt ut och förkorta",
  "uppgifter": [
   {
    "p": "BRAK(2x + 6)(2x)",
    "t": "x + 3",
    "n": "x"
   },
   {
    "p": "BRAK(4x - 16)(8)",
    "t": "x - 4",
    "n": "2"
   },
   {
    "p": "BRAK(2 + 2x^2)(4)",
    "t": "x^2 + 1",
    "n": "2"
   },
   {
    "p": "BRAK(3 - 27x)(9)",
    "t": "1 - 9x",
    "n": "3"
   },
   {
    "p": "BRAK(15x - 20)(5)",
    "t": "3x - 4",
    "n": "1"
   },
   {
    "p": "BRAK(4)(4x - 4)",
    "t": "1",
    "n": "(x - 1)"
   },
   {
    "p": "BRAK(x^2 + 2x)(x)",
    "t": "x + 2",
    "n": "1"
   },
   {
    "p": "BRAK(2x + x^3)(2x)",
    "t": "x^2 + 2",
    "n": "2"
   },
   {
    "p": "BRAK(4x^2 - x)(2x)",
    "t": "4x - 1",
    "n": "2"
   },
   {
    "p": "BRAK(2x - 4x^2)(2x)",
    "t": "1 - 2x",
    "n": "1"
   },
   {
    "p": "BRAK(6x^3 - 9x)(3x)",
    "t": "2x^2 - 3",
    "n": "1"
   },
   {
    "p": "BRAK(3x^2 - 9x^3)(6x)",
    "t": "x - 3x^2",
    "n": "2"
   },
   {
    "p": "BRAK(20x^2 - 4)(8)",
    "t": "5x^2 - 1",
    "n": "2"
   },
   {
    "p": "BRAK(x^4 - x^2)(x^2)",
    "t": "x^2 - 1",
    "n": "1"
   },
   {
    "p": "BRAK(14x^2 + 21x^3)(7x^2)",
    "t": "3x + 2",
    "n": "1"
   },
   {
    "p": "BRAK(2x^2 + 4x + 8)(2)",
    "t": "x^2 + 2x + 4",
    "n": "1"
   },
   {
    "p": "BRAK(4x^3 + 3x^2 - 8)(x)",
    "t": "4x^3 + 3x^2 - 8",
    "n": "x"
   },
   {
    "p": "BRAK(9x^3 - 6x^2 + 3x)(3x)",
    "t": "3x^2 - 2x + 1",
    "n": "1"
   }
  ]
 },
 "ova2": {
  "titel": "Öva 2 – Addition av bråk",
  "sub": "liknämnigt, talnämnare",
  "uppgifter": [
   {
    "p": "BRAK(3x)(7) + BRAK(5x)(7)",
    "t": "8x",
    "n": "7"
   },
   {
    "p": "BRAK(5x)(3) + BRAK(4x)(3)",
    "t": "3x",
    "n": "1"
   },
   {
    "p": "BRAK(3x)(5) + BRAK(7x)(5)",
    "t": "2x",
    "n": "1"
   },
   {
    "p": "BRAK(3x)(4) + BRAK(3x)(4)",
    "t": "3x",
    "n": "2"
   },
   {
    "p": "BRAK(x)(3) + BRAK(2x - 1)(3)",
    "t": "3x - 1",
    "n": "3"
   },
   {
    "p": "BRAK(5x)(4) + BRAK(3x + 1)(4)",
    "t": "8x + 1",
    "n": "4"
   },
   {
    "p": "BRAK(3x + 1)(6) + BRAK(5 - 2x)(6)",
    "t": "x + 6",
    "n": "6"
   },
   {
    "p": "BRAK(8x + 5)(3) + BRAK(6x - 5)(3)",
    "t": "14x",
    "n": "3"
   },
   {
    "p": "BRAK(x + 8)(9) + BRAK(9x + 8)(9)",
    "t": "10x + 16",
    "n": "9"
   },
   {
    "p": "BRAK(2x - 1)(2) + BRAK(2x + 1)(2)",
    "t": "2x",
    "n": "1"
   },
   {
    "p": "BRAK(4 - x)(3) + BRAK(2 + 7x)(3)",
    "t": "2x + 2",
    "n": "1"
   },
   {
    "p": "BRAK(8 + 2x)(4) + BRAK(2x)(4)",
    "t": "x + 2",
    "n": "1"
   },
   {
    "p": "BRAK(x)(2) + BRAK(3x + 1)(2) + BRAK(8 - x)(2)",
    "t": "3x + 9",
    "n": "2"
   },
   {
    "p": "BRAK(9)(4) + BRAK(3x - 1)(4) + BRAK(8x + 4)(4)",
    "t": "11x + 12",
    "n": "4"
   },
   {
    "p": "BRAK(4x - 1)(3) + BRAK(3 - 2x)(3) + BRAK(8x)(3)",
    "t": "10x + 2",
    "n": "3"
   },
   {
    "p": "BRAK(7x)(5) + BRAK(8x - 1)(5) + BRAK(1 - 5x)(5)",
    "t": "2x",
    "n": "1"
   }
  ]
 },
 "ova3": {
  "titel": "Öva 3 – Beräkna och förkorta",
  "sub": "oliknämnigt, talnämnare",
  "uppgifter": [
   {
    "p": "BRAK(x)(2) + BRAK(x)(3)",
    "t": "5x",
    "n": "6"
   },
   {
    "p": "BRAK(8x)(3) + BRAK(x)(6)",
    "t": "17x",
    "n": "6"
   },
   {
    "p": "BRAK(4x)(7) + BRAK(x)(3)",
    "t": "19x",
    "n": "21"
   },
   {
    "p": "BRAK(x + 1)(2) + BRAK(x + 1)(3)",
    "t": "5x + 5",
    "n": "6"
   },
   {
    "p": "BRAK(x - 1)(3) + BRAK(2x + 1)(2)",
    "t": "8x + 1",
    "n": "6"
   },
   {
    "p": "BRAK(x)(4) + BRAK(4x + 1)(5)",
    "t": "21x + 4",
    "n": "20"
   },
   {
    "p": "BRAK(3x - 2)(3) + BRAK(x )(6)",
    "t": "7x - 4",
    "n": "6"
   },
   {
    "p": "BRAK(6x + 2)(3) + BRAK(1 - 4x)(4)",
    "t": "12x + 11",
    "n": "12"
   },
   {
    "p": "BRAK(3x + 4)(7) + BRAK(6 - 2x)(3)",
    "t": "54 - 5x",
    "n": "21"
   },
   {
    "p": "BRAK(4x + 5)(4) + BRAK(5x + 4)(5)",
    "t": "40x + 41",
    "n": "20"
   },
   {
    "p": "BRAK(2x + 3)(4) + BRAK(x)(8) + BRAK(3 - x)(2)",
    "t": "x + 18",
    "n": "8"
   },
   {
    "p": "BRAK(x)(2) + BRAK(3x - 1)(3) + BRAK(2x + 1)(4)",
    "t": "24x - 1",
    "n": "12"
   }
  ]
 },
 "ova4": {
  "titel": "Öva 4 – Skriv som ett bråk",
  "sub": "heltalsterm + bråk",
  "uppgifter": [
   {
    "p": "0,3x + BRAK(x)(2)",
    "t": "4x",
    "n": "5"
   },
   {
    "p": "BRAK(x)(3) + x",
    "t": "4x",
    "n": "3"
   },
   {
    "p": "BRAK(x)(3) + 1,5x",
    "t": "11x",
    "n": "6"
   },
   {
    "p": "x + BRAK(x)(4)",
    "t": "5x",
    "n": "4"
   },
   {
    "p": "0,5 x + BRAK(x)(7)",
    "t": "9x",
    "n": "14"
   },
   {
    "p": "0,7x + BRAK(2x)(7)",
    "t": "69x",
    "n": "70"
   },
   {
    "p": "x + BRAK(x - 1)(3)",
    "t": "4x - 1",
    "n": "3"
   },
   {
    "p": "BRAK(x - 1)(3) + 3x",
    "t": "10x - 1",
    "n": "3"
   },
   {
    "p": "4x + BRAK(1 - x)(3)",
    "t": "11x + 1",
    "n": "3"
   }
  ]
 },
 "ova5": {
  "titel": "Öva 5 – Nämnare med olika variabler",
  "sub": "variabel i nämnaren",
  "uppgifter": [
   {
    "p": "BRAK(3)(x) + BRAK(4)(x)",
    "t": "7",
    "n": "x"
   },
   {
    "p": "BRAK(3)(2x) + BRAK(5)(2x)",
    "t": "4",
    "n": "x"
   },
   {
    "p": "BRAK(6)(3x) + BRAK(3)(3x)",
    "t": "3",
    "n": "x"
   },
   {
    "p": "BRAK(9 - x)(x) + BRAK(6 + x)(x)",
    "t": "15",
    "n": "x"
   },
   {
    "p": "BRAK(8x + 1)(x) + BRAK(3 - x)(x)",
    "t": "7x + 4",
    "n": "x"
   },
   {
    "p": "BRAK(5x - 1)(x) + BRAK(4x + 1)(x)",
    "t": "9",
    "n": "1"
   },
   {
    "p": "BRAK(2x + 1)(4x) + BRAK(x - 4)(4x)",
    "t": "3x - 3",
    "n": "4·x"
   },
   {
    "p": "BRAK(2)(3x) + BRAK(8x - 2)(3x)",
    "t": "8",
    "n": "3"
   },
   {
    "p": "BRAK(2x + 3)(4x) + BRAK(x - 7)(4x)",
    "t": "3x - 4",
    "n": "4·x"
   },
   {
    "p": "BRAK(x)(x - 1) + BRAK(2x)(x - 1)",
    "t": "3x",
    "n": "(x - 1)"
   },
   {
    "p": "BRAK(4x - 1)(x + 2) + BRAK(3x - 2)(x + 2)",
    "t": "7x - 3",
    "n": "(x + 2)"
   },
   {
    "p": "BRAK(3x )(x + 5) + BRAK(1 - 2x)(x + 5)",
    "t": "x + 1",
    "n": "(x + 5)"
   },
   {
    "p": "BRAK(4)(2x + 1) + BRAK(2x)(2x + 1) + BRAK(x - 5)(2x + 1)",
    "t": "3x - 1",
    "n": "(2x + 1)"
   },
   {
    "p": "BRAK(3x + 2)(1 - x) + BRAK(1 - 4x)(1 - x) + BRAK(2 - 3x)(1 - x)",
    "t": "5 - 4x",
    "n": "(1 - x)"
   }
  ]
 },
 "ova6": {
  "titel": "Öva 6 – Skriv som ett bråk",
  "sub": "oliknämnig variabelnämnare",
  "uppgifter": [
   {
    "p": "BRAK(1)(2x) + BRAK(3)(x)",
    "t": "7",
    "n": "2·x"
   },
   {
    "p": "BRAK(5)(x) + BRAK(1)(4x)",
    "t": "21",
    "n": "4·x"
   },
   {
    "p": "BRAK(3)(x) + BRAK(1)(3x)",
    "t": "10",
    "n": "3·x"
   },
   {
    "p": "BRAK(2)(5x) + BRAK(3)(2x)",
    "t": "19",
    "n": "10·x"
   },
   {
    "p": "BRAK(1)(3x) + BRAK(5)(2x)",
    "t": "17",
    "n": "6·x"
   },
   {
    "p": "BRAK(3)(7x) + BRAK(5)(3x)",
    "t": "44",
    "n": "21·x"
   },
   {
    "p": "BRAK(5)(x) + BRAK(3)(y)",
    "t": "3x + 5y",
    "n": "x·y"
   },
   {
    "p": "BRAK(1)(a) + BRAK(1)(b)",
    "t": "a + b",
    "n": "a·b"
   },
   {
    "p": "BRAK(2)(x) + BRAK(3)(2y)",
    "t": "3x + 4y",
    "n": "2·x·y"
   }
  ]
 },
 "ova7": {
  "titel": "Öva 7 – Skriv som ett bråk",
  "sub": "binom i nämnaren",
  "uppgifter": [
   {
    "p": "BRAK(2)(y) + BRAK(5)(x - y)",
    "t": "2x + 3y",
    "n": "y·(x - y)"
   },
   {
    "p": "BRAK(3)(x) + BRAK(5)(x + y)",
    "t": "8x + 3y",
    "n": "x·(x + y)"
   },
   {
    "p": "BRAK(5)(x + y) + BRAK(6)(x - y)",
    "t": "11x + y",
    "n": "(x + y)·(x - y)"
   },
   {
    "p": "BRAK(x)(x - 1) + BRAK(2)(x + 1)",
    "t": "x^2 + 3x - 2",
    "n": "(x - 1)·(x + 1)"
   },
   {
    "p": "BRAK(3)(x + 1) + BRAK(2x)(x + 2)",
    "t": "2x^2 + 5x + 6",
    "n": "(x + 1)·(x + 2)"
   },
   {
    "p": "BRAK(x)(1 - x) + BRAK(2x)(1 + x)",
    "t": "3x - x^2",
    "n": "(1 - x)·(x + 1)"
   },
   {
    "p": "BRAK(x + 1)(x - 1) + BRAK(x)(x + 1)",
    "t": "2x^2 + x + 1",
    "n": "(x - 1)·(x + 1)"
   },
   {
    "p": "BRAK(2x)(x + 2) + BRAK(3x + 1)(x + 3)",
    "t": "5x^2 + 13x + 2",
    "n": "(x + 2)·(x + 3)"
   },
   {
    "p": "BRAK(2x - 1)(x + 2) + BRAK(x - 3)(x + 1)",
    "t": "3x^2 - 7",
    "n": "(x + 2)·(x + 1)"
   },
   {
    "p": "BRAK(4x )(x + 4) + BRAK(3x - 5)(x - 4)",
    "t": "7x^2 - 9x - 20",
    "n": "(x + 4)·(x - 4)"
   },
   {
    "p": "BRAK(1 - 2x)(x - 1) + BRAK(2x + 3)(x + 2)",
    "t": "-2x - 1",
    "n": "(x - 1)·(x + 2)"
   },
   {
    "p": "BRAK(4x + 5)(2x + 1) + BRAK(3x - 3)(2x - 1)",
    "t": "14x^2 + 3x - 8",
    "n": "(2x + 1)·(2x - 1)"
   }
  ]
 },
 "ova8": {
  "titel": "Öva 8 – Subtraktion av bråk",
  "sub": "subtraktion",
  "uppgifter": [
   {
    "p": "BRAK(15x)(3) - BRAK(11x)(3)",
    "t": "4x",
    "n": "3"
   },
   {
    "p": "BRAK(2x)(5) - BRAK(x - 5)(5)",
    "t": "x + 5",
    "n": "5"
   },
   {
    "p": "BRAK(4 + x)(2) - BRAK(x - 4)(2)",
    "t": "4",
    "n": "1"
   },
   {
    "p": "BRAK(3x + 2)(3) - BRAK(2x - 3)(3)",
    "t": "x + 5",
    "n": "3"
   },
   {
    "p": "BRAK(x)(6) - BRAK(x)(7)",
    "t": "x",
    "n": "42"
   },
   {
    "p": "BRAK(x)(2) - BRAK(3x + 1)(5)",
    "t": "-x - 2",
    "n": "10"
   },
   {
    "p": "BRAK(4x - 1)(4) - BRAK(3x - 1)(8)",
    "t": "5x - 1",
    "n": "8"
   },
   {
    "p": "BRAK(6x + 1)(3) - BRAK(8x + 4)(2)",
    "t": "-6x - 5",
    "n": "3"
   },
   {
    "p": "7,5x - BRAK(x)(3)",
    "t": "43x",
    "n": "6"
   },
   {
    "p": "0,5x - BRAK(x)(7)",
    "t": "5x",
    "n": "14"
   },
   {
    "p": "BRAK(2x)(9) - 0,7x",
    "t": "-43x",
    "n": "90"
   },
   {
    "p": "5x - BRAK(1 - 2x)(3)",
    "t": "17x - 1",
    "n": "3"
   },
   {
    "p": "BRAK(4)(3x) - BRAK(3)(4x)",
    "t": "7",
    "n": "12·x"
   },
   {
    "p": "BRAK(2x + 3)(x) - BRAK(3 - 2x)(x)",
    "t": "4",
    "n": "1"
   },
   {
    "p": "BRAK(4x + 1)(5x) - BRAK(1 - 4x)(5x)",
    "t": "8",
    "n": "5"
   },
   {
    "p": "BRAK(4x + 3)(2x - 1) - BRAK(3x - 3)(2x - 1)",
    "t": "x + 6",
    "n": "(2x - 1)"
   },
   {
    "p": "BRAK(2)(3x) - BRAK(1)(x)",
    "t": "-1",
    "n": "3·x"
   },
   {
    "p": "BRAK(3)(7x) - BRAK(1)(3x)",
    "t": "2",
    "n": "21·x"
   },
   {
    "p": "BRAK(3)(x) - BRAK(2)(y)",
    "t": "3y - 2x",
    "n": "x·y"
   },
   {
    "p": "BRAK(2)(x) - BRAK(7)(y)",
    "t": "2y - 7x",
    "n": "x·y"
   },
   {
    "p": "BRAK(4)(y) - BRAK(2)(y + x)",
    "t": "4x + 2y",
    "n": "y·(x + y)"
   },
   {
    "p": "BRAK(6)(x + y) - BRAK(5)(x - y)",
    "t": "x - 11y",
    "n": "(x + y)·(x - y)"
   },
   {
    "p": "BRAK(3x)(x + 1) - BRAK(2x - 1)(x + 2)",
    "t": "x^2 + 5x + 1",
    "n": "(x + 1)·(x + 2)"
   },
   {
    "p": "BRAK(5x)(x - 5) - BRAK(4x - 5)(x + 5)",
    "t": "x^2 + 50x - 25",
    "n": "(x - 5)·(x + 5)"
   }
  ]
 }
};
  if(typeof window !== 'undefined') window.GY_ALG = GY;
  if(typeof module !== 'undefined' && module.exports) module.exports = GY;
})();
