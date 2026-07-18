/* ============================================================
   FAMILJ B · Del 4 (Bråkform och decimalform) — FÄRSK GENERATOR
   Form-växling bråk ↔ decimal. Fristående generatorstandard:
   kanoniska nämnare (endast faktorer 2 och 5 → exakt/terminerande
   decimal), täljare oberoende likformig bland de som ger enklaste
   form (gcd=1). Äkta oberoende slump — inga konstlade "inga
   dubbletter". Exakt decimalsträng via förlängning till 10^k.
   Node-testbar (module.exports) och browser-global (window.BrakDecimalGen).
   ============================================================ */
(function(root){
  'use strict';

  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a; }
  function exp(n, p){ var e = 0; while(n % p === 0){ n /= p; e++; } return e; }

  // Nämnare per nivå — endast 2 och 5 som primfaktorer (ger exakt decimal).
  // Nivå 1: tiondelar/enkla · Nivå 2: + åttondelar/tjugondelar/tjugofemtedelar · Nivå 3: hundradelar m.m.
  var NAMNARE = {
    1: [2, 4, 5, 10],
    2: [2, 4, 5, 8, 10, 20, 25],
    3: [8, 16, 20, 25, 40, 50, 100]
  };

  // Exakt decimalsträng av a/b (b | 10^k). Förläng till 10^k, k = max(2-exp, 5-exp).
  function decStr(a, b){
    var x = exp(b, 2), y = exp(b, 5), k = Math.max(x, y);
    var scaled = a * Math.pow(2, k - x) * Math.pow(5, k - y);   // = a·10^k / b, heltal
    if(k === 0) return String(scaled);
    var s = String(scaled);
    while(s.length <= k) s = '0' + s;
    var whole = s.slice(0, s.length - k);
    var frac = s.slice(s.length - k).replace(/0+$/, '');
    return frac === '' ? whole : whole + ',' + frac;
  }

  // De coprima täljarna för en given nämnare (kanonisk mängd, enklaste form).
  function taljarePool(b){
    var out = [];
    for(var a = 1; a < b; a++) if(gcd(a, b) === 1) out.push(a);
    return out;
  }

  // Oberoende likformig dragning: nämnare ur nivåns pool, sedan täljare ur dess coprima mängd.
  function gen(level, rnd){
    rnd = rnd || Math.random;
    var pool = NAMNARE[level] || NAMNARE[1];
    var b = pool[Math.floor(rnd() * pool.length)];
    var ts = taljarePool(b);
    var a = ts[Math.floor(rnd() * ts.length)];
    return { t: a, n: b, svar: a / b, svarStr: decStr(a, b) };
  }

  var API = { gcd: gcd, decStr: decStr, taljarePool: taljarePool, gen: gen, NAMNARE: NAMNARE };
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.BrakDecimalGen = API;
})(typeof window !== 'undefined' ? window : this);
