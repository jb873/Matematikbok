/* ============================================================
   Del 4 (Bråkform och decimalform) — DELAD KÄLLA för talen.
   Poolerna används av BÅDE Öva-bladen (blad-k1d4.js) och
   Färdighetsträningens drillar (i ramen), så eleven övar på exakt
   samma frågor. Endast exakta (terminerande) bråk; decimal→bråk-
   uppgifter är sådana som verkligen FÖRKORTAS (0,05 = 1/20), aldrig
   meningslösa 29/100. Node-testbar + browser-global (BrakDecimalGen).
   ============================================================ */
(function(root){
  'use strict';

  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a; }

  // ── Talpooler [täljare, nämnare, decimalsträng] ──
  // Bråk ↔ decimal: halva, fjärdedel, femtedel, ÅTTONDEL, tiondel
  var POOL_BD = [
    [1,2,'0,5'], [1,4,'0,25'], [3,4,'0,75'],
    [1,5,'0,2'], [2,5,'0,4'], [3,5,'0,6'], [4,5,'0,8'],
    [1,8,'0,125'], [3,8,'0,375'], [5,8,'0,625'], [7,8,'0,875'],
    [1,10,'0,1'], [3,10,'0,3'], [7,10,'0,7'], [9,10,'0,9']
  ];
  // Tiondelar & hundradelar → bråk i enklaste form (kräver förkortning)
  var POOL_HD = [
    [1,2,'0,5'], [1,5,'0,2'], [3,10,'0,3'], [2,5,'0,4'], [7,10,'0,7'], [4,5,'0,8'],
    [1,20,'0,05'], [3,20,'0,15'], [7,20,'0,35'], [9,20,'0,45'],
    [1,25,'0,04'], [3,25,'0,12'], [2,25,'0,08'], [4,25,'0,16'], [6,25,'0,24'],
    [3,50,'0,06'], [7,50,'0,14'], [1,4,'0,25']
  ];
  // Bråk som förlängs till hundradelar (nämnaren delar 100)
  var POOL_FORL = [
    [1,2], [1,4], [3,4], [1,5], [2,5], [3,5], [4,5], [1,10], [3,10], [7,10], [9,10],
    [1,20], [3,20], [7,20], [9,20], [1,25], [3,25], [7,25], [1,50], [3,50], [7,50]
  ];

  function pick(arr, rnd){ return arr[Math.floor((rnd || Math.random)() * arr.length)]; }

  // Bråk → decimal: visa t/n, svara decimaltalet
  function genFracDec(rnd){ var p = pick(POOL_BD, rnd); return { t:p[0], n:p[1], svar:p[0]/p[1], svarStr:p[2] }; }
  // Decimal → bråk (enklaste form): visa decimalen, svara t/n. pool = POOL_BD eller POOL_HD.
  function genDecFrac(pool, rnd){ var p = pick(pool, rnd); return { dec:p[2], svar:p[0]/p[1], t:p[0], n:p[1] }; }
  // Förläng till hundradelar: t/n = [hundra]/100 = [dec]
  function genForlang(rnd){ var p = pick(POOL_FORL, rnd); return { t:p[0], n:p[1], hundra:p[0]*100/p[1], dec:p[0]/p[1] }; }

  var API = {
    gcd: gcd,
    POOL_BD: POOL_BD, POOL_HD: POOL_HD, POOL_FORL: POOL_FORL,
    genFracDec: genFracDec, genDecFrac: genDecFrac, genForlang: genForlang
  };
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.BrakDecimalGen = API;
})(typeof window !== 'undefined' ? window : this);
