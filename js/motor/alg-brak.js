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
  var VARS = ['x', 'y', 'a', 'b', 'p'];   // 'p' tillagd 2026-09-22 (åk7 k3 d3: magiska kvadrater)
  var NOLLKEY = VARS.map(function(){ return 0; }).join(',');   // nyckel-ariteten följer VARS (förr hårdkodad '0,0,0,0')

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
  function pConst(r){ var p = {}; if(!rIsZero(r)) p[NOLLKEY] = r; return p; }
  function pIsZero(p){ for(var k in p) return false; return true; }
  function pIsConst(p){ for(var k in p){ if(k !== NOLLKEY) return false; } return true; }
  function pEval(p, vals){ var s = 0; for(var k in p){ var e = keyExps(k), t = p[k].n / p[k].d; for(var i = 0; i < VARS.length; i++) t *= Math.pow(vals[VARS[i]] || 0, e[i]); s += t; } return s; }
  function pTotDeg(p){ var d = 0; for(var k in p){ var e = keyExps(k), s = 0; for(var i = 0; i < e.length; i++) s += e[i]; if(s > d) d = s; } return d; }
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
    var s = ('' + str).replace(/[−–—]/g, '-').replace(/·/g, '*').replace(/×/g, '*').replace(/,(\d)/g, '.$1').replace(/\s+/g, '');   // FAS1: även en-/em-dash
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
      if(/[a-z]/.test(c)){ var vi = VARS.indexOf(c); if(vi < 0) throw new Error('okänd variabel: ' + c); i++; var e = VARS.map(function(){ return 0; }); e[vi] = 1; var p = {}; p[mkKey(e)] = R(1); return rf(p); }
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
    var vs = {}; [a, b].forEach(function(x){ [x.num, x.den].forEach(function(p){ for(var k in p){ var e = keyExps(k); for(var i = 0; i < VARS.length; i++) if(e[i] > 0) vs[VARS[i]] = 1; } }); });
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
    var dc = x.den[NOLLKEY]; if(!(dc && dc.n === 1 && dc.d === 1)) return false;
    for(var k in x.num){ if(x.num[k].d !== 1) return false; }
    return true;
  }
  function fraktionsfacit(fN){ var d = fN.num; return !pIsConst(d) || !(d[NOLLKEY] && d[NOLLKEY].n === 1 && d[NOLLKEY].d === 1); }

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


  // ══════════════════════════════════════════════════════════════════════════════════════════
  // POLYNOM-FORM — "förenkla uttryck" (åk7 k3 d3). grade() ovan jämför VÄRDET efter parsning och
  // ser därför inte skillnad på "7x" och "4x + 3x". Förenklings-uppgiften kräver att den SKRIVNA
  // formen granskas: uttrycket ska vara en summa av termer där inga två termer har samma
  // variabeldel, varje terms sifferfaktorer redan är hopmultiplicerade och inga nolltermer står
  // kvar. Analysen läser elevens sträng (inte polynomet) — därför en egen liten läsning här.
  //   FORMREGLER (Joachim 2026-09-22): koefficienten 1 skrivs som x, inte 1x.  Termernas ordning
  //   är fri. Decimalkoefficienter tillåtna (12,5x). Parentes behövs aldrig i ett förenklat svar.
  function polyForm(str, opts){
    opts = opts || {};
    var s = ('' + str).replace(/[\u2212\u2013\u2014]/g, '-').replace(/[·\u00d7]/g, '*').replace(/,(\d)/g, '.$1').replace(/\s+/g, '');
    if(s === '') return { fel: 'tom' };
    if(/[()]/.test(s)) return { fel: 'parentes' };
    // dela i toppnivåtermer (tecknet hör till termen)
    var termer = [], cur = '', i;
    for(i = 0; i < s.length; i++){
      var c = s[i];
      if((c === '+' || c === '-') && i > 0 && !/[*\/^]/.test(s[i - 1])){ if(cur) termer.push(cur); cur = (c === '-' ? '-' : ''); }
      else if((c === '+' || c === '-') && i === 0){ cur = (c === '-' ? '-' : ''); }
      else cur += c;
    }
    if(cur) termer.push(cur);
    var analys = [], fel = null;
    termer.forEach(function(t){
      var neg = t[0] === '-'; if(neg || t[0] === '+') t = t.slice(1);
      var siffror = [], bokstaver = [], division = false, ettor = false, j = 0;
      while(j < t.length){
        var ch = t[j];
        if(ch === '*'){ j++; continue; }
        if(ch === '/'){ division = true; j++; continue; }
        if(/[0-9.]/.test(ch)){ var num = ''; while(j < t.length && /[0-9.]/.test(t[j])) num += t[j++]; siffror.push(num); continue; }
        if(/[a-z]/.test(ch)){ bokstaver.push(ch); j++; continue; }
        fel = fel || 'tecken'; j++;
      }
      if(siffror.length > 1 && !division) fel = fel || 'ejMultiplicerad';   // 2·3x
      if(division && !opts.tillatBrak) fel = fel || 'division';             // 28x/2
      if(bokstaver.length && siffror.length === 1 && parseFloat(siffror[0]) === 1) ettor = true;   // 1x
      if(bokstaver.length && siffror.length && parseFloat(siffror[0]) === 0) fel = fel || 'nollterm';   // 0x
      if(ettor && !opts.tillatEtta) fel = fel || 'koefficient1';
      analys.push({ nyckel: bokstaver.slice().sort().join(''), konstant: !bokstaver.length, nollTerm: !bokstaver.length && siffror.length === 1 && parseFloat(siffror[0]) === 0 });
    });
    if(!fel){
      var sedda = {};
      analys.forEach(function(a){ if(sedda[a.nyckel]) fel = fel || 'likaTermer'; sedda[a.nyckel] = 1; });   // 4x+3x, 6x+10-3
      if(analys.length > 1 && analys.some(function(a){ return a.nollTerm; })) fel = fel || 'nollterm';       // 7x+0
    }
    return { fel: fel, termer: analys.length };
  }
  function termAntal(str){ var f = polyForm(str, { tillatBrak: true, tillatEtta: true }); return f.fel === 'tom' ? 0 : f.termer; }

  var OMKRETSBESKED = {
    utanUppstallning: 'Skriv först figurens sidor adderade, och förenkla sedan: sida + sida + … = svaret.',
    uppstallningFel:  'Det första ledet ska vara figurens sidor adderade.',
    kedjebrott:       'Alla led ska vara lika mycket värda.',
    tom:              'Skriv uppställningen och förenklingen.'
  };
  var FORMBESKED = {
    likaTermer:      'Rätt värde – men två termer hör ihop. Slå ihop dem.',
    ejMultiplicerad: 'Rätt värde – men räkna ut multiplikationen i termen.',
    division:        'Rätt värde – men räkna ut divisionen.',
    nollterm:        'Rätt värde – men en term är noll och ska strykas.',
    koefficient1:    'Rätt värde – men koefficienten 1 skrivs inte ut: skriv x, inte 1x.',
    parentes:        'Rätt värde – men ett förenklat uttryck skrivs utan parentes.',
    tecken:          'Kunde inte tolka svaret.'
  };

  // Gradera ETT förenklat uttryck (en ruta) mot ett facit-uttryck.
  //   → { status:'ratt'|'form'|'fel', form:<kod>, besked:<text> }.  Samma två lägen som bråkrättningen.
  function gradePoly(elev, facit, opts){
    opts = opts || {};
    if(elev == null || ('' + elev).trim() === '') return { status: 'fel', tom: true };
    var e, f;
    try { e = parse(elev); } catch(err){ return { status: 'fel', parsefel: true, besked: 'Kunde inte tolka svaret.' }; }
    try { f = parse(facit); } catch(err){ return { status: 'fel', internfel: true, besked: '' + err.message }; }
    if(!pointEqual(e, f)) return { status: 'fel' };
    var form = polyForm(elev, opts);
    if(form.fel) return { status: 'form', form: form.fel, besked: FORMBESKED[form.fel] || FORMBESKED.tecken };
    return { status: 'ratt' };
  }
  // Öppet svar: uttrycket ska ha EXAKT n termer och förenklas till målet (C2). Formen granskas INTE —
  // hela poängen är att uttrycket är oförenklat.
  function gradeOppet(elev, mal, n){
    if(elev == null || ('' + elev).trim() === '') return { status: 'fel', tom: true };
    var e, m;
    try { e = parse(elev); } catch(err){ return { status: 'fel', parsefel: true, besked: 'Kunde inte tolka uttrycket.' }; }
    try { m = parse(mal); } catch(err){ return { status: 'fel', internfel: true }; }
    var antal = termAntal(elev);
    if(!pointEqual(e, m)) return { status: 'fel', besked: 'Uttrycket förenklas inte till ' + mal + '.' };
    if(antal !== n) return { status: 'form', form: 'antalTermer', besked: 'Uttrycket förenklas rätt, men har ' + antal + ' termer – det ska vara ' + n + '.' };
    return { status: 'ratt' };
  }

  // OMKRETS SOM KEDJA (order 2026-09-24): "x + 3x + x + 3x = 8x" i EN ruta.
  //   · första ledet   = figurens sidor adderade, i valfri ordning
  //   · sista ledet    = förenklat och rätt värde
  //   · led däremellan = tillåtna, så länge alla led är lika mycket värda
  // Bara slutsvaret (utan uppställning) är inte fel VÄRDE — det saknar uppställningen, och beskedet
  // säger just det.
  function termerAv(uttryck){
    var s = String(uttryck).replace(/\s+/g, '').replace(/[\u2212\u2013\u2014]/g, '-').replace(/[·*]/g, '');
    if(s === '') return [];
    if(s[0] !== '+' && s[0] !== '-') s = '+' + s;
    var ut = [], nu = '';
    for(var i = 0; i < s.length; i++){
      if((s[i] === '+' || s[i] === '-') && i > 0){ ut.push(nu); nu = s[i] === '-' ? '-' : ''; }
      else if(i === 0){ nu = s[i] === '-' ? '-' : ''; }
      else nu += s[i];
    }
    ut.push(nu);
    return ut.filter(function(t){ return t !== '' && t !== '-'; }).map(function(t){ return t.toLowerCase(); });
  }
  function sammaTermer(uttryck, sidor){
    var a = termerAv(uttryck).sort();
    var b = (sidor || []).map(function(x){ return String(x).replace(/\s+/g, '').replace(/[·*]/g, '').toLowerCase(); }).sort();
    if(a.length !== b.length) return false;
    for(var i = 0; i < a.length; i++) if(a[i] !== b[i]) return false;
    return true;
  }
  function gradeOmkrets(elev, sidor, facit){
    if(elev == null || ('' + elev).trim() === '') return { status: 'fel', tom: true, besked: OMKRETSBESKED.tom };
    var led = String(elev).split('=').map(function(d){ return d.trim(); }).filter(function(d){ return d !== ''; });
    if(led.length < 2) return { status: 'utanUppstallning', besked: OMKRETSBESKED.utanUppstallning };
    var forsta;
    try { forsta = parse(led[0]); } catch(err){ return { status: 'fel', parsefel: true, besked: 'Kunde inte tolka uttrycket.' }; }
    for(var i = 1; i < led.length; i++){
      var p;
      try { p = parse(led[i]); } catch(err){ return { status: 'fel', parsefel: true, besked: 'Kunde inte tolka uttrycket.' }; }
      if(!pointEqual(forsta, p)) return { status: 'kedjebrott', ledNr: i + 1, besked: OMKRETSBESKED.kedjebrott };
    }
    if(!sammaTermer(led[0], sidor)) return { status: 'uppstallningFel', besked: OMKRETSBESKED.uppstallningFel };
    var sista = gradePoly(led[led.length - 1], facit);
    if(sista.status === 'ratt') return { status: 'ratt' };
    if(sista.status === 'form') return { status: 'form', besked: sista.besked };
    return { status: 'fel', besked: sista.besked };
  }

  // Två sidor i en rektangel (öppen uppgift): sidorna a och b ska tillsammans ge HALVA omkretsen.
  // Många svar är rätt; en sida får inte vara 0 (då är det ingen rektangel).
  function gradeSidor(sidaA, sidaB, halvaOmkretsen){
    if(sidaA == null || ('' + sidaA).trim() === '' || sidaB == null || ('' + sidaB).trim() === '') return { status: 'fel', tom: true };
    var a, b, h;
    try { a = parse(sidaA); b = parse(sidaB); } catch(e){ return { status: 'fel', parsefel: true, besked: 'Kunde inte tolka sidorna.' }; }
    try { h = parse(halvaOmkretsen); } catch(e){ return { status: 'fel', internfel: true }; }
    var noll = rf(pConst(R(0)));
    if(pointEqual(a, noll) || pointEqual(b, noll)) return { status: 'fel', besked: 'En sida kan inte vara 0.' };
    if(!pointEqual(rfAdd(a, b), h)) return { status: 'fel', besked: 'De två sidorna ska tillsammans bli halva omkretsen.' };
    return { status: 'ratt' };
  }

  var API = { gradeOmkrets: gradeOmkrets, OMKRETSBESKED: OMKRETSBESKED, termerAv: termerAv, sammaTermer: sammaTermer,
              parse: parse, pointEqual: pointEqual, grade: grade, gradePoly: gradePoly, gradeSidor: gradeSidor, gradeOppet: gradeOppet, polyForm: polyForm, termAntal: termAntal, _rf: { rf: rf, rfDiv: rfDiv, pEval: pEval, pIsConst: pIsConst }, VARS: VARS };
  if(typeof window !== 'undefined') window.AlgBrak = API;
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
