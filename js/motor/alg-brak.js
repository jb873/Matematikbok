/* alg-brak.js — DELAD algebra-motor för gy-fördjupningens rationella uttryck (window.AlgBrak).
   Parsar elevens svar (täljare/nämnare-fält), jämför mot facit i TVÅ steg:
     (1) VÄRDE — punktjämförelse i ≥20 slumpade värden per variabel (hoppar nollnämnare).
     (2) FORM  — strukturell: fältet ska vara ETT bråk (täljare & nämnare polynom var för sig),
                 i enklaste form (ingen oförkortad gemensam faktor, ingen term-uppdelning).
   Ger de två beskeden ÅTSKILT: 'fel' (värde), 'form' (rätt värde men ej enklast), 'ratt'.
   Ingen generell förenklare — reduktions-KONTROLLEN görs via grad + numeriskt innehåll (ej symbolisk gcd).
   Node + browser. Ingen nätväg. */
(function(){
  'use strict';
  var VARS = ['x', 'y', 'a', 'b'];

  // ── Rational ──
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function R(n, d){ d = d === undefined ? 1 : d; if(d < 0){ n = -n; d = -d; } var g = gcd(Math.round(n), Math.round(d)); return { n: Math.round(n) / g, d: Math.round(d) / g }; }
  function rAdd(a, b){ return R(a.n * b.d + b.n * a.d, a.d * b.d); }
  function rMul(a, b){ return R(a.n * b.n, a.d * b.d); }
  function rIsZero(a){ return a.n === 0; }

  // ── Poly: monoKey "ex,ey,ea,eb" -> Rational ──
  function keyExps(k){ return k.split(',').map(Number); }
  function mkKey(e){ return e.join(','); }
  function pTerm(p, key, r){ if(rIsZero(r)) return; var c = p[key] || R(0), s = rAdd(c, r); if(rIsZero(s)) delete p[key]; else p[key] = s; }
  function pAdd(a, b){ var p = {}; for(var k in a) p[k] = a[k]; for(var k2 in b) pTerm(p, k2, b[k2]); return p; }
  function pScale(a, r){ var p = {}; for(var k in a){ var s = rMul(a[k], r); if(!rIsZero(s)) p[k] = s; } return p; }
  function pSub(a, b){ return pAdd(a, pScale(b, R(-1))); }
  function pMul(a, b){ var p = {}; for(var ka in a) for(var kb in b){ var ea = keyExps(ka), eb = keyExps(kb); pTerm(p, mkKey(ea.map(function(v, i){ return v + eb[i]; })), rMul(a[ka], b[kb])); } return p; }
  function pConst(r){ var p = {}; if(!rIsZero(r)) p['0,0,0,0'] = r; return p; }
  function pIsZero(p){ for(var k in p) return false; return true; }
  function pIsConst(p){ for(var k in p){ if(k !== '0,0,0,0') return false; } return true; }
  function pEval(p, vals){ var s = 0; for(var k in p){ var e = keyExps(k), t = p[k].n / p[k].d; for(var i = 0; i < 4; i++) t *= Math.pow(vals[VARS[i]] || 0, e[i]); s += t; } return s; }
  function pTotDeg(p){ var d = 0; for(var k in p){ var e = keyExps(k), s = e[0] + e[1] + e[2] + e[3]; if(s > d) d = s; } return d; }
  function pContent(p){ var g = 0, D = 1; for(var k in p) D = D / gcd(D, p[k].d) * p[k].d; for(var k2 in p) g = gcd(g, p[k2].n * (D / p[k2].d)); return { g: g || 1, D: D }; }   // heltals-innehåll efter clearing

  // ── RatFunc {num:Poly, den:Poly} ──
  function rf(num, den){ return { num: num, den: den || pConst(R(1)) }; }
  function rfAdd(a, b){ return rf(pAdd(pMul(a.num, b.den), pMul(b.num, a.den)), pMul(a.den, b.den)); }
  function rfSub(a, b){ return rf(pSub(pMul(a.num, b.den), pMul(b.num, a.den)), pMul(a.den, b.den)); }
  function rfMul(a, b){ return rf(pMul(a.num, b.num), pMul(a.den, b.den)); }
  function rfDiv(a, b){ return rf(pMul(a.num, b.den), pMul(a.den, b.num)); }
  function rfPow(a, n){ var r = rf(pConst(R(1))); for(var i = 0; i < n; i++) r = rfMul(r, a); return r; }

  // ── Parser (rekursiv nedstigning) → RatFunc. Klarar +−·/ ^ parenteser, variabler, decimaler,
  //    implicit multiplikation (2x, 3(x+1), xy, (x-1)(x+1)) och BRAK(a)(b). ──
  function parse(str){
    var s = ('' + str).replace(/−/g, '-').replace(/·/g, '*').replace(/×/g, '*').replace(/,(\d)/g, '.$1').replace(/\s+/g, '');
    var i = 0;
    function peek(){ return s[i]; }
    function eof(){ return i >= s.length; }
    function parseExpr(){
      var v = parseTerm();
      while(!eof() && (peek() === '+' || peek() === '-')){ var op = s[i++]; var t = parseTerm(); v = op === '+' ? rfAdd(v, t) : rfSub(v, t); }
      return v;
    }
    function parseTerm(){
      var v = parseFactor();
      while(!eof()){
        var c = peek();
        if(c === '*' || c === '/'){ i++; var f = parseFactor(); v = c === '*' ? rfMul(v, f) : rfDiv(v, f); }
        else if(c === '(' || /[a-z]/.test(c) || /[0-9.]/.test(c) || c === 'B'){ v = rfMul(v, parseFactor()); }   // implicit mult
        else break;
      }
      return v;
    }
    function parseFactor(){
      var neg = false; while(peek() === '+' || peek() === '-'){ if(s[i] === '-') neg = !neg; i++; }
      var b = parseBase();
      if(peek() === '^'){ i++; var e = ''; while(/[0-9]/.test(peek())) e += s[i++]; b = rfPow(b, parseInt(e, 10)); }
      return neg ? rf(pScale(b.num, R(-1)), b.den) : b;
    }
    function parseBase(){
      var c = peek();
      if(c === '('){ i++; var v = parseExpr(); if(peek() === ')') i++; else throw new Error('saknad )'); return v; }
      if(s.substr(i, 5) === 'BRAK('){ i += 4; i++; var num = parseExpr(); if(peek() === ')') i++; if(peek() === '(') i++; var den = parseExpr(); if(peek() === ')') i++; return rfDiv(num, den); }
      if(/[0-9.]/.test(c)){ var num = ''; while(/[0-9.]/.test(peek())) num += s[i++]; var dec = (num.split('.')[1] || '').length, pot = Math.pow(10, dec); return rf(pConst(R(Math.round(parseFloat(num) * pot), pot))); }
      if(/[a-z]/.test(c)){ var vi = VARS.indexOf(c); if(vi < 0) throw new Error('okänd variabel: ' + c); i++; var e = [0, 0, 0, 0]; e[vi] = 1; var p = {}; p[mkKey(e)] = R(1); return rf(p); }
      throw new Error('oväntat tecken: "' + (c || 'slut') + '" i "' + s + '"');
    }
    var res = parseExpr();
    if(!eof()) throw new Error('kunde ej tolka hela uttrycket: "' + s + '" (rest vid ' + i + ')');
    return res;
  }

  // ── VÄRDE: punktjämförelse i N slumpade värden (deterministisk seed), hoppar nollnämnare ──
  function pointEqual(a, b, seed){
    var S = seed || 987654321;
    function rnd(){ S = (S * 1103515245 + 12345) & 0x7fffffff; return S / 0x7fffffff; }
    var vs = {}; [a, b].forEach(function(x){ [x.num, x.den].forEach(function(p){ for(var k in p){ var e = keyExps(k); for(var i = 0; i < 4; i++) if(e[i] > 0) vs[VARS[i]] = 1; } }); });
    var vars = Object.keys(vs), ok = 0, tries = 0;
    while(ok < 25 && tries < 500){ tries++;
      var vals = {}; vars.forEach(function(v){ vals[v] = (Math.floor(rnd() * 23) - 11) + (rnd() < 0.5 ? 0.5 : 0); });
      var da = pEval(a.den, vals), db = pEval(b.den, vals);
      if(Math.abs(da) < 1e-9 || Math.abs(db) < 1e-9) continue;
      var va = pEval(a.num, vals) / da, vb = pEval(b.num, vals) / db;
      if(Math.abs(va - vb) > 1e-6 * (1 + Math.abs(va))) return false;
      ok++;
    }
    return ok >= 20;
  }

  function isHeltalspolynom(x){   // RatFunc som är ett polynom med HELTALSkoefficienter (den ≡ 1, alla koeff heltal)
    if(!pIsConst(x.den)) return false;
    var dc = x.den['0,0,0,0']; if(!(dc && dc.n === 1 && dc.d === 1)) return false;
    for(var k in x.num){ if(x.num[k].d !== 1) return false; }
    return true;
  }
  function fraktionsfacit(fN){ var d = fN.num; return !pIsConst(d) || !(d['0,0,0,0'] && d['0,0,0,0'].n === 1 && d['0,0,0,0'].d === 1); }

  // ── GRADERING: elevsvar (täljar-fält, nämnar-fält) mot facit (samma fältform) ──
  //   → { status:'ratt'|'form'|'fel', form:'termdela'|'oforkortat' }.  De två stegen ger ÅTSKILDA besked.
  function grade(elevT, elevN, facitT, facitN){
    var eT, eN, fT, fN;
    try { eT = parse((elevT && ('' + elevT).trim() !== '') ? elevT : '0'); eN = parse((elevN && ('' + elevN).trim() !== '') ? elevN : '1'); }
    catch(e){ return { status: 'fel', parsefel: true, meddelande: 'Kunde inte tolka svaret.' }; }
    try { fT = parse(facitT); fN = parse((facitN && ('' + facitN).trim() !== '') ? facitN : '1'); } catch(e){ return { status: 'fel', internfel: true, meddelande: '' + e.message }; }
    var elev = rfDiv(eT, eN), facit = rfDiv(fT, fN);
    // (1) VÄRDE — punktjämförelse
    if(!pointEqual(elev, facit)) return { status: 'fel' };
    // (2) FORM
    // 2a. varje fält = HELTALSpolynom (annars term-uppdelat / bråk-i-fält, t.ex. "x/2 − 2" el. "0,8x")
    if(!isHeltalspolynom(eT) || !isHeltalspolynom(eN)) return { status: 'form', form: 'termdela' };
    var eNum = eT.num, eDen = eN.num, fNum = fT.num, fDen = fN.num;
    var cn = pContent(eNum), cd = pContent(eDen);
    if(fraktionsfacit(fN)){
      // enklaste form: samma grad på täljare & nämnare som facit + koprimt numeriskt innehåll
      if(pTotDeg(eNum) !== pTotDeg(fNum) || pTotDeg(eDen) !== pTotDeg(fDen)) return { status: 'form', form: 'oforkortat' };
      if(gcd(cn.g, cd.g) > 1) return { status: 'form', form: 'oforkortat' };
      return { status: 'ratt' };
    }
    // facit = polynom: nämnaren ska vara konstant (elev skrev polynom, ej oförkortat bråk)
    if(!pIsConst(eDen)) return { status: 'form', form: 'oforkortat' };
    if(gcd(cn.g, cd.g) > 1) return { status: 'form', form: 'oforkortat' };
    return { status: 'ratt' };
  }

  var API = { parse: parse, pointEqual: pointEqual, grade: grade, _rf: { rf: rf, rfDiv: rfDiv, pEval: pEval, pIsConst: pIsConst }, VARS: VARS };
  if(typeof window !== 'undefined') window.AlgBrak = API;
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
