/* ekv-parser.js — LINJÄR EKVATIONSPARSER (delad, utan DOM).

   Bruten ur ekvationer-balans.js (order 2026-09-23) så att både balansmetodens kedja (d4) och
   problemlösningens rättare kan använda samma parser — och så att den kan fuzzas i node.

   VAD DEN GÖR: tolkar ett uttryck som ETT LINJÄRT uttryck i en variabel → { a, b } med värdet
   a·v + b. Två sidor blir en ekvation i samlad form A·v = B, och två ekvationer med samma lösning
   är samma ekvation — det är så kedjans "varje rad följer ur den föregående" prövas.

   UTÖKNINGEN (samma order): PARENTESER och faktor framför parentes.
     2(x + 3) = 16 · 5(3a + 4) = 65 · 4(2x + 3) − 2(x − 1)
   Förr delades strängen i termer på toppnivå och varje term tolkades var för sig; en faktor framför
   en parentes fanns inte i den formen. Nu är det en riktig recursive descent-parser:
     uttryck := term (('+'|'-') term)*
     term    := faktor (('*'|'/') faktor | implicit faktor)*
     faktor  := ('+'|'-') faktor | tal | variabel | '(' uttryck ')'
   Implicit multiplikation gäller mellan tal/parentes och variabel/parentes: 2x, 2(x+3), 3·(x)(2).

   ICKE-LINJÄRT AVVISAS (null): x·x, (x+1)(x+2), 3/x — det är inte fel i parsern utan uppgifter som
   ligger utanför balansmetoden. Två olika bokstäver i samma uttryck avvisas också; uppgiften säger
   vilken variabel som gäller (elevens val är x, annars den bokstav som står i uppgiften).

   Ren funktion. Ingen DOM, ingen nätväg. */
(function(){
'use strict';

var EPS = 1e-9;

function normalisera(str){
  return String(str == null ? '' : str)
    .replace(/\s+/g, '')
    .replace(/[−–—]/g, '-')      // minustecken → bindestreck
    .replace(/[·×]/g, '*')
    .replace(/(\d),(\d)/g, '$1.$2');            // svensk decimalkomma
}

// Vilken bokstav är variabeln? Uppgiften kan säga det (opts.variabel); annars den enda som står i
// uttrycket. Fler än en bokstav → uttrycket hör inte hemma i den här parsern.
function hittaVariabel(s){
  var m = s.match(/[a-zåäö]/gi);
  if(!m) return null;
  var unika = [];
  m.forEach(function(c){ c = c.toLowerCase(); if(unika.indexOf(c) < 0) unika.push(c); });
  return unika.length === 1 ? unika[0] : false;   // false = flera bokstäver
}

// ── Linjära former: värdet är a·v + b ──
function konst(b){ return { a: 0, b: b }; }
function addL(p, q){ return { a: p.a + q.a, b: p.b + q.b }; }
function subL(p, q){ return { a: p.a - q.a, b: p.b - q.b }; }
function multL(p, q){
  if(Math.abs(p.a) < EPS) return { a: q.a * p.b, b: q.b * p.b };
  if(Math.abs(q.a) < EPS) return { a: p.a * q.b, b: p.b * q.b };
  return null;                                   // variabel · variabel = icke-linjärt
}
function divL(p, q){
  if(Math.abs(q.a) > EPS || Math.abs(q.b) < EPS) return null;   // nämnaren måste vara ett tal ≠ 0
  return { a: p.a / q.b, b: p.b / q.b };
}

// ── Parsern ──
// Returnerar { a, b } eller null (ogiltigt/icke-linjärt). opts.variabel = deklarerad bokstav.
function parseSida(str, opts){
  opts = opts || {};
  var s = normalisera(str);
  if(s === '') return null;
  var v = opts.variabel ? String(opts.variabel).toLowerCase() : hittaVariabel(s);
  if(v === false) return null;                   // flera bokstäver
  if(!/^[-+*/().0-9a-zåäö]*$/i.test(s)) return null;
  // med deklarerad variabel: alla ANDRA bokstäver är ogiltiga
  if(v){ var andra = s.toLowerCase().replace(new RegExp(v, 'g'), '').match(/[a-zåäö]/i); if(andra) return null; }

  var i = 0, trasig = false;
  function tecken(){ return s[i]; }

  function primar(){
    var c = tecken();
    if(c === '('){
      i++;
      var inre = uttryck();
      if(tecken() !== ')'){ trasig = true; return konst(0); }
      i++;
      return inre;
    }
    if(c && /[0-9.]/.test(c)){
      var start = i;
      while(i < s.length && /[0-9.]/.test(s[i])) i++;
      var tal = parseFloat(s.slice(start, i));
      if(isNaN(tal)){ trasig = true; return konst(0); }
      return konst(tal);
    }
    if(c && v && c.toLowerCase() === v){ i++; return { a: 1, b: 0 }; }
    trasig = true; return konst(0);
  }

  function faktor(){
    var c = tecken();
    if(c === '+'){ i++; return faktor(); }
    if(c === '-'){ i++; var f = faktor(); return { a: -f.a, b: -f.b }; }
    return primar();
  }

  // implicit multiplikation: 2x, 2(x+3), (x+1)3, x(2)
  function arImplicit(){
    var c = tecken();
    if(!c) return false;
    if(c === '(') return true;
    if(v && c.toLowerCase() === v) return true;
    return /[0-9.]/.test(c) && !/[0-9.]/.test(s[i - 1] || '');
  }

  function term(){
    var p = faktor();
    for(;;){
      var c = tecken();
      if(c === '*' || c === '/'){
        i++;
        var q = faktor();
        var r = (c === '*') ? multL(p, q) : divL(p, q);
        if(!r){ trasig = true; return konst(0); }
        p = r;
      } else if(arImplicit()){
        var q2 = faktor();
        var r2 = multL(p, q2);
        if(!r2){ trasig = true; return konst(0); }
        p = r2;
      } else return p;
    }
  }

  function uttryck(){
    var p = term();
    for(;;){
      var c = tecken();
      if(c === '+'){ i++; p = addL(p, term()); }
      else if(c === '-'){ i++; p = subL(p, term()); }
      else return p;
    }
  }

  var res = uttryck();
  if(trasig || i !== s.length) return null;
  return { a: res.a, b: res.b };
}

// "VL = HL" → samlad form A·v = B (variabeln till vänster, konstanten till höger)
function parseEkvation(vl, hl, opts){
  var L = parseSida(vl, opts), H = parseSida(hl, opts);
  if(!L || !H) return null;
  return { A: L.a - H.a, B: H.b - L.b };
}

// Samma lösning? (A1·v = B1 mot A2·v = B2). Två rader i kedjan ska vara samma ekvation.
function sammaLosning(e1, e2){
  if(!e1 || !e2) return false;
  var unik1 = Math.abs(e1.A) > EPS, unik2 = Math.abs(e2.A) > EPS;
  if(unik1 && unik2) return Math.abs(e1.B / e1.A - e2.B / e2.A) < EPS;
  if(!unik1 && !unik2) return (Math.abs(e1.B) < EPS) === (Math.abs(e2.B) < EPS);
  return false;
}
function harUnikLosning(e){ return !!e && Math.abs(e.A) > EPS; }
function losningAv(e){ return e.B / e.A; }

// Slutraden: variabeln ENSAM i vänsterledet, ett tal till höger.
function arLost(vl, hl, opts){
  var L = parseSida(vl, opts), H = parseSida(hl, opts);
  if(!L || !H) return false;
  return Math.abs(L.a - 1) < EPS && Math.abs(L.b) < EPS && Math.abs(H.a) < EPS;
}

// Värdet av ett linjärt uttryck när variabeln är x.
function varde(uttryck, x, opts){
  var p = parseSida(uttryck, opts);
  return p ? p.a * x + p.b : null;
}

// Hur många operationer krävs för att lösa ekvationen som den är skriven? (Joachims regel:
// en rad för ekvationen plus en rad per operation.)
//   · konstant i vänsterledet som ska bort            → 1
//   · variabel i högerledet som ska flyttas           → 1
//   · koefficient ≠ 1 som ska divideras bort          → 1
//   · parentes som ska lösas upp                      → 1
function operationer(vl, hl, opts){
  var L = parseSida(vl, opts), H = parseSida(hl, opts);
  if(!L || !H) return null;
  var n = 0;
  if(Math.abs(L.b) > EPS) n++;
  if(Math.abs(H.a) > EPS) n++;
  if(Math.abs(Math.abs(L.a - H.a) - 1) > EPS) n++;
  if(/\(/.test(String(vl)) || /\(/.test(String(hl))) n++;
  return n;
}
function minstaAntalRader(vl, hl, opts){
  var n = operationer(vl, hl, opts);
  return n == null ? null : 1 + n;
}

var API = { parseSida: parseSida, parseEkvation: parseEkvation, sammaLosning: sammaLosning,
            harUnikLosning: harUnikLosning, losningAv: losningAv, arLost: arLost,
            varde: varde, operationer: operationer, minstaAntalRader: minstaAntalRader };
if(typeof window !== 'undefined') window.EkvParser = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
