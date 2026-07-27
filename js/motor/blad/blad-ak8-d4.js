/* blad-ak8-d4.js — Åk8 kapitel 1, delkapitel 8 (Potenser): Öva-blad.
   Bygg-id: d4 (motorer = bygg-id). GREENFIELD potens-familj, pilot för dk 8/9/10.
   EXAKT-FÖRFATTAT ur TRANSKRIPTION-ak8-potenser.md (aldrig docx — exponenter låg som
   text-vertAlign, plain-text plattar). Tre blad: Grund · Mult/Div · Prioritering.
   Två mellanleds-stilar visas som statiska MALL-kedjor (evaluera-sedan-operera resp
   exponent-lag). Exponenter = äkta upphöjd notation, stående bråk, vänsterställt. */
(function(){
  'use strict';
  var F = window;   // fracSpan/fracRuta ur blad-karna.js

  // ── Facit-numerik ──
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(/−/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }
  function fmt(x){ var r = Math.round(x * 1e9) / 1e9, s = String(r).replace('.', ','); return s; }
  function likhetOk(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  function inTal(sm){ return '<input class="ak8-in' + (sm ? ' ak8-in-sm' : '') + '" inputmode="text" autocomplete="off">'; }
  // en faktor ur "3/4", "0,6", "7", "x"
  function pFaktor(s){ s = String(s).trim().replace(',', '.'); var m = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+)$/); if(m) return parseFloat(m[1]) / parseFloat(m[2]); return parseFloat(s); }

  // Aritmetik-utvärderare för mellanledet (byte-identisk ur mellanleds-motorn i blad-ak8-d1.js;
  // ingen eval): + − · / parenteser. Värde-rättar elevens mellanled i likhetskedjan.
  function evalArith(s){
    s = String(s).replace(/[\s ]/g, '').replace(/−/g, '-').replace(/[·×x]/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
    if(!/^[-0-9.*/+()]*$/.test(s) || s === '') return NaN;
    var i = 0;
    function expr(){ var v = term(); while(s[i] === '+' || s[i] === '-'){ var o = s[i++], t = term(); v = o === '+' ? v + t : v - t; } return v; }
    function term(){ var v = factor(); while(s[i] === '*' || s[i] === '/'){ var o = s[i++], f = factor(); v = o === '*' ? v * f : v / f; } return v; }
    function factor(){ if(s[i] === '+'){ i++; return factor(); } if(s[i] === '-'){ i++; return -factor(); } if(s[i] === '('){ i++; var v = expr(); if(s[i] === ')') i++; return v; } var m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i)); if(!m) return NaN; i += m[0].length; return parseFloat(m[0]); }
    var r = expr(); return i === s.length ? r : NaN;
  }

  // ── Potens-notation (upphöjt) + stående bråk ──
  function pot(b, e){ return '<span class="pot">' + b + '<sup>' + e + '</sup></span>'; }
  function fr(t, n){ return F.fracSpan(t, n); }
  // Potens med sammansatt bas (parentes/bråk): exponenten i SAMMA .pot-superscript som
  // heltals-/decimalbaser → konsekvent storlek/baslinje. Bråk-bas märks (.pot-frac) för
  // att lägga exponenten uppe till höger om den stängande parentesen.
  function potP(inner, e){ var frac = String(inner).indexOf('ovn-brak') !== -1; return '<span class="pot' + (frac ? ' pot-frac' : '') + '">(' + inner + ')<sup>' + e + '</sup></span>'; }

  // ── Uppgifts-fabriker ──
  function T(fraga, facit){ return { typ:'tal', fraga:fraga, facit:facit }; }                   // talsvar (värde)
  function BR(fraga, ft, fn){ return { typ:'brak', fraga:fraga, ft:ft, fn:fn }; }               // bråksvar (stående)
  function POTSVAR(fraga, bas, exp){ return { typ:'potsvar', fraga:fraga, bas:bas, exp:exp }; } // exp-lag-svar: fraga = bas^□
  function SKRIVPOT(fraga, bas, exp){ return { typ:'skrivpot', fraga:fraga, bas:bas, exp:exp }; } // skriv som potens: □^□
  function SKRIVMULT(fraga, bas, exp){ return { typ:'skrivmult', fraga:fraga, bas:bas, exp:exp }; } // skriv som multiplikation (text)
  function KORVAL(fraga, alt, ratt){ return { typ:'korval', fraga:fraga, alt:alt, ratt:ratt }; } // klicka rätt (korOvningKlick)
  function FIGUR(sida, bas, exp){ return { typ:'figur', sida:sida, bas:bas, exp:exp }; }         // rita kvadrat → area i potensform
  function TAB(potenser, varden, input){ return { typ:'tabell', potenser:potenser, varden:varden, input:input }; } // input:'varde'|'potens'
  // ── Mellanleds-kedja (visa mellanled) — VARJE uppgift = full likhetskedja med fillbara led.
  //    Återanvänder mellanleds-motorns mönster (evalArith värde-rättar mellanledet); facit =
  //    full kedja (visas vid Kontrollera). Ingen avtagande scaffolding — fullt led överallt. ──
  function KEV(vanster, svar, facit){ return { typ:'kedja', stil:'ev', vanster:vanster, svar:svar, facit:facit }; }        // evaluera: v = [mel] = [svar]
  function KBR(vanster, ft, fn, facit){ return { typ:'kedja', stil:'br', vanster:vanster, ft:ft, fn:fn, facit:facit }; }   // expandera → stående bråk: v = [mel] = [bråk]
  function KPAR(vanster, exp, basval, svar, facit){ return { typ:'kedja', stil:'par', vanster:vanster, exp:exp, basval:basval, svar:svar, facit:facit }; } // parentes: v = [bas]^exp = [svar]
  function KEXP(vanster, bas, svarExp, facit){ return { typ:'kedja', stil:'exp', vanster:vanster, bas:bas, svarExp:svarExp, facit:facit }; } // exp-lag: v = bas^[mel-uttryck] = bas^[svar-exp]
  function G(rubrik, rader, hint){ return { rubrik:rubrik, rader:rader, hint:hint }; }

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD 1 — Potenser grund
  // ══════════════════════════════════════════════════════════════════════════════════════
  var GRUND = { nr:1, titel:'Potenser grund', nod:'pot-begrepp:skriva', uppg:[
    G('Skriv som en potens', [
      SKRIVPOT('5·5·5·5', 5, 4), SKRIVPOT('3·3·3·3·3·3·3', 3, 7), SKRIVPOT('x·x·x', 'x', 3)
    ]),
    G('Skriv som en potens', [
      SKRIVPOT('fyra upphöjt till sju', 4, 7), SKRIVPOT('sex upphöjt till fem', 6, 5),
      SKRIVPOT('exponent 5, bas 4', 4, 5), SKRIVPOT('bas 8, exponent 3', 8, 3)
    ]),
    G('Skriv som en multiplikation', [
      SKRIVMULT(pot(7, 3), 7, 3), SKRIVMULT(pot(2, 5), 2, 5),
      SKRIVMULT(potP(fr(3, 4), 3), '3/4', 3), SKRIVMULT(pot('0,6', 4), '0,6', 4)
    ]),
    G('Fyll i värdet', [
      TAB([pot(2, 4), pot(2, 3), pot(2, 2), pot(2, 1), pot(2, 0)], [16, 8, 4, 2, 1], 'varde')
    ]),
    G('Beräkna med mellanled — räkna ut varje potens, operera sedan', [
      KEV(pot(3, 3) + ' − ' + pot(2, 3), 19, '3³ − 2³ = 27 − 8 = 19'),
      KEV(pot(6, 2) + ' + ' + pot(5, 2), 61, '6² + 5² = 36 + 25 = 61'),
      KEV(pot(5, 3) + ' − ' + pot(10, 2), 25, '5³ − 10² = 125 − 100 = 25'),
      KEV(pot(2, 5) + ' + ' + pot(7, 2), 81, '2⁵ + 7² = 32 + 49 = 81')
    ]),
    G('Beräkna med mellanled — parentes/potens först', [
      KPAR(potP('12 − 5', 2), 2, 7, 49, '(12 − 5)² = 7² = 49'),
      KBR(potP(fr(3, 4), 2), 9, 16, '(3/4)² = 3/4 · 3/4 = 9/16'),
      KPAR(potP('7 + 4', 2), 2, 11, 121, '(7 + 4)² = 11² = 121'),
      KBR(potP(fr(2, 3), 3), 8, 27, '(2/3)³ = 2/3 · 2/3 · 2/3 = 8/27')
    ]),
    G('Fyll i potensen som matchar värdet', [
      TAB([pot(3, 4), pot(3, 2), pot(3, 0), pot(3, 3), pot(3, 1)], [81, 9, 1, 27, 3], 'potens')
    ]),
    G('Beräkna', [
      T(pot(2, 2) + ' =', 4), T(pot(1, 3) + ' =', 1), T(pot(5, 3) + ' =', 125), T(pot(2, 4) + ' =', 16), T(pot(0, 6) + ' =', 0)
    ]),
    G('Beräkna (decimaltal)', [
      T(pot('0,3', 2) + ' =', 0.09), T(pot('0,2', 3) + ' =', 0.008), T(pot('0,5', 2) + ' =', 0.25), T(pot('0,1', 3) + ' =', 0.001)
    ]),
    G('Rita en kvadrat och skriv ett uttryck i potensform för arean', [
      FIGUR(5, 5, 2), FIGUR('2,8', '2,8', 2), FIGUR('x', 'x', 2)
    ]),
    G('Beräkna med mellanled (blandat)', [
      KEV('15 − ' + pot(2, 3), 7, '15 − 2³ = 15 − 8 = 7'),
      KEV('3 · ' + pot(7, 2), 147, '3 · 7² = 3 · 49 = 147'),
      KEV('6 + ' + fr(pot(3, 3), 9), 9, '6 + 3³/9 = 6 + 27/9 = 6 + 3 = 9')
    ])
  ] };

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD 2 — Potenser: multiplikation och division
  // ══════════════════════════════════════════════════════════════════════════════════════
  var MULTDIV = { nr:2, titel:'Potenser: multiplikation och division', nod:'pot-multdiv:rakna', uppg:[
    G('Multiplikation, samma bas — behåll basen, addera exponenterna', [
      KEXP(pot(3, 4) + ' · ' + pot(3, 5), 3, 9, '3⁴ · 3⁵ = 3^(4+5) = 3⁹'),
      KEXP(pot(2, 5) + ' · ' + pot(2, 6), 2, 11, '2⁵ · 2⁶ = 2^(5+6) = 2¹¹'),
      KEXP(pot(5, 2) + ' · ' + pot(5, 7), 5, 9, '5² · 5⁷ = 5^(2+7) = 5⁹')
    ]),
    G('Division, samma bas — behåll basen, subtrahera exponenterna', [
      KEXP(fr(pot(6, 5), pot(6, 2)), 6, 3, '6⁵ / 6² = 6^(5−2) = 6³'),
      KEXP(fr(pot(3, 8), pot(3, 3)), 3, 5, '3⁸ / 3³ = 3^(8−3) = 3⁵'),
      KEXP(fr(pot(7, 12), pot(7, 4)), 7, 8, '7¹² / 7⁴ = 7^(12−4) = 7⁸')
    ]),
    G('Lös ut basen — vilket tal ska x vara?', [
      T(pot('x', 2) + ' = 49,&nbsp; x =', 7), T(pot('x', 3) + ' = 27,&nbsp; x =', 3), T(pot('x', 3) + ' = 125,&nbsp; x =', 5), T(pot('x', 5) + ' = 32,&nbsp; x =', 2)
    ]),
    G('Beräkna med mellanled — räkna ut varje potens, operera sedan', [
      KEV(pot(2, 3) + ' + ' + pot(4, 2), 24, '2³ + 4² = 8 + 16 = 24'),
      KEV(pot(8, 2) + ' − ' + pot(2, 3), 56, '8² − 2³ = 64 − 8 = 56'),
      KEV(pot(2, 3) + ' · ' + pot(5, 2) + ' + ' + pot(3, 3), 227, '2³ · 5² + 3³ = 8 · 25 + 27 = 227'),
      KEV(pot(2, 5) + ' · ' + pot(3, 2) + ' − ' + pot(4, 2), 272, '2⁵ · 3² − 4² = 32 · 9 − 16 = 272')
    ]),
    G('Resonemang', [
      T('Hur många faktorer 3 för att få 9?', 2), T('Hur många faktorer 3 för att få 81?', 4), T('Hur många faktorer 3 för att få 27?', 3),
      T('Hur mycket är ' + pot(3, 6) + ' om ' + pot(3, 5) + ' är 243?', 729)
    ]),
    G('Multiplikation och division blandat, samma bas', [
      KEXP(fr(pot(3, 4) + ' · ' + pot(3, 7), pot(3, 5)), 3, 6, '(3⁴ · 3⁷) / 3⁵ = 3^(4+7−5) = 3⁶'),
      KEXP(fr(pot(17, 6) + ' · ' + pot(17, 2), pot(17, 4)), 17, 4, '(17⁶ · 17²) / 17⁴ = 17^(6+2−4) = 17⁴'),
      T('Hur många gånger större är ' + pot(5, 7) + ' än ' + pot(5, 6) + '?', 5)
    ]),
    G('Lös ut exponenten — vilket tal ska x vara?', [
      T(pot(4, 'x') + ' = 1,&nbsp; x =', 0), T(pot(10, 'x') + ' + ' + pot(5, 2) + ' − ' + pot(4, 2) + ' = 1009,&nbsp; x =', 3), T(pot(10, 'x') + ' − ' + pot(2, 5) + ' + ' + pot(5, 3) + ' = 193,&nbsp; x =', 2)
    ]),
    G('Hur mycket är en fjärdedel av ' + pot(4, 16) + '? Klicka på rätt svar', [
      KORVAL('', [pot(4, 4), pot(1, 16), pot(3, 16), pot(4, 15), pot(3, 4)], 3)   // rätt = index 3 (4^15)
    ])
  ] };

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD 3 — Prioriteringsregeln med potenser
  // ══════════════════════════════════════════════════════════════════════════════════════
  var PRIO = { nr:3, titel:'Prioriteringsregeln med potenser', nod:'prio-potenser', uppg:[
    G('Beräkna', [
      T(potP('4 · 2', 2) + ' =', 64), T('5 · ' + pot(2, 4) + ' =', 80), T('5 · 2 + ' + pot(3, 3) + ' =', 37), T('25 − ' + pot(6, 2) + ' =', -11)
    ], 'Tänk på prioriteringsreglerna. Ett svar blir negativt.'),
    G('Beräkna', [
      T(potP('0,2 · 3', 2) + ' =', 0.36), T('3 · ' + potP('2 − 1,9', 2) + ' =', 0.03), BR('4 · ' + potP(fr(3, 4), 2) + ' =', 9, 4)
    ]),
    G('Beräkna', [
      T('3 + 4 · 2 − ' + pot(2, 3) + ' =', 3), T('(36 − 3 · ' + pot(2, 2) + ') + ' + pot(3, 2) + ' =', 33), BR(potP(fr(5, 3), 2) + ' − 12 · ' + potP(fr(1, 2), 2) + ' =', -2, 9)
    ])
  ] };

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD: Tiopotenser (delkapitel 9) — via samma potens-mekanismer, bas 10. "Skrivb"→"Skriv".
  // ══════════════════════════════════════════════════════════════════════════════════════
  var TIOPOTENSER = { nr:1, titel:'Tiopotenser', nod:'tio-rakna', uppg:[
    G('Skriv som tiopotens', [
      POTSVAR('1 000', 10, 3), POTSVAR('100 000', 10, 5), POTSVAR('100 000 000', 10, 8)
    ]),
    G('Skriv som tiopotens', [
      POTSVAR('En miljard (en etta följd av nio nollor)', 10, 9)
    ]),
    G('Skriv som vanligt tal', [
      T(pot(10, 2) + ' =', 100), T(pot(10, 6) + ' =', 1000000), T(pot(10, 0) + ' =', 1)
    ]),
    G('Räkna med tiopotenser — behåll basen, addera exponenterna', [
      KEXP(pot(10, 4) + ' · ' + pot(10, 5), 10, 9, '10⁴ · 10⁵ = 10^(4+5) = 10⁹'),
      KEXP(pot(10, 7) + ' · ' + pot(10, 6), 10, 13, '10⁷ · 10⁶ = 10^(7+6) = 10¹³'),
      KEXP(pot(10, 0) + ' · ' + pot(10, 8), 10, 8, '10⁰ · 10⁸ = 10^(0+8) = 10⁸')
    ]),
    G('Räkna med tiopotenser — behåll basen, subtrahera exponenterna', [
      KEXP(fr(pot(10, 7), pot(10, 3)), 10, 4, '10⁷ / 10³ = 10^(7−3) = 10⁴'),
      KEXP(fr(pot(10, 11), pot(10, 5)), 10, 6, '10¹¹ / 10⁵ = 10^(11−5) = 10⁶'),
      KEXP(fr(pot(10, 12), pot(10, 0)), 10, 12, '10¹² / 10⁰ = 10^(12−0) = 10¹²')
    ]),
    G('Skriv som vanligt tal', [
      T(pot(10, 2) + ' =', 100), T(pot(10, 8) + ' =', 100000000)
    ]),
    G('Beräkna — räkna ut varje tiopotens, operera sedan', [
      KEV(pot(10, 3) + ' + ' + pot(10, 4), 11000, '10³ + 10⁴ = 1000 + 10000 = 11000'),
      KEV(pot(10, 6) + ' + ' + pot(10, 2), 1000100, '10⁶ + 10² = 1000000 + 100 = 1000100'),
      KEV(pot(10, 5) + ' − ' + pot(10, 4), 90000, '10⁵ − 10⁴ = 100000 − 10000 = 90000'),
      KEV(pot(10, 4) + ' − ' + pot(10, 3), 9000, '10⁴ − 10³ = 10000 − 1000 = 9000')
    ]),
    G('Vad ska stå istället för x?', [
      T(pot(10, 'x') + ' · ' + pot(10, 3) + ' = ' + pot(10, 11) + ',&nbsp; x =', 8),
      T(pot(10, 6) + ' · ' + pot(10, 'x') + ' = ' + pot(10, 14) + ',&nbsp; x =', 8),
      T(fr(pot(10, 'x'), pot(10, 2)) + ' = ' + pot(10, 7) + ',&nbsp; x =', 9),
      T(fr(pot(10, 9), pot(10, 'x')) + ' = ' + pot(10, 3) + ',&nbsp; x =', 6)
    ]),
    G('Beräkna (blandat — se upp: exponent-lagen gäller bara samma bas)', [
      KEV(pot(10, 5) + ' + ' + pot(10, 3) + ' − ' + pot(10, 4), 91000, '10⁵ + 10³ − 10⁴ = 100000 + 1000 − 10000 = 91000'),
      KEV(pot(10, 6) + ' − ' + pot(10, 5) + ' + ' + pot(10, 2), 900100, '10⁶ − 10⁵ + 10² = 1000000 − 100000 + 100 = 900100'),
      KEV(pot(10, 3) + ' − ' + pot(5, 3) + ' + ' + pot(10, 4), 10875, '10³ − 5³ + 10⁴ = 1000 − 125 + 10000 = 10875'),
      KEV(pot(2, 6) + ' − ' + pot(10, 0) + ' + ' + pot(10, 3), 1063, '2⁶ − 10⁰ + 10³ = 64 − 1 + 1000 = 1063')
    ]),
    G('Vilket prefix betyder samma sak? Klicka på rätt', [
      KORVAL(pot(10, 3), ['kilo', 'mega', 'giga', 'tera'], 0),
      KORVAL(pot(10, 6), ['kilo', 'mega', 'giga', 'tera'], 1),
      KORVAL(pot(10, 9), ['kilo', 'mega', 'giga', 'tera'], 2),
      KORVAL(pot(10, 12), ['kilo', 'mega', 'giga', 'tera'], 3)
    ])
  ] };

  // ── Svars-cell: börjar som EN ruta. Keypadens byggar-knappar gör den till ett stående bråk
  //    (▤ täljare/nämnare) eller en potens (▢ⁿ bas + exponentruta) — eleven bygger allt själv. ──
  function ansCell(role, ph){ return '<span class="ak8-cell" data-r="' + role + '"><input class="ak8-in ak8-cellin" inputmode="text" autocomplete="off"' + (ph ? ' placeholder="' + ph + '"' : '') + '></span>'; }
  // Läser en cell: stående bråk → {frac, num}; potens → {pot, base, exp, num}; annars uttryck → {val, num}.
  function cellRead(scope, role){
    var c = scope.querySelector('.ak8-cell[data-r="' + role + '"]'); if(!c) return { kind:'val', num:NaN };
    var br = c.querySelector('.ovn-brak');
    if(br){ var t = pNum(br.querySelector('.ak8-frt').value), n = pNum(br.querySelector('.ak8-frn').value); return { kind:'frac', t:t, n:n, num:(isFinite(t) && isFinite(n) && n !== 0) ? t / n : NaN }; }
    var p = c.querySelector('.ak8-pot');
    if(p){ var b = pNum(p.querySelector('.ak8-pbase').value), e = evalArith(p.querySelector('.ak8-pexp').value); return { kind:'pot', base:b, exp:e, num:Math.pow(b, e) }; }
    return { kind:'val', num: evalArith(c.querySelector('input').value) };
  }
  function esc(v){ return String(v).replace(/"/g, ''); }
  // Byggarna bevarar det redan skrivna som första fältet (täljare resp bas) och flyttar fokus dit näst.
  function buildFrac(c, cur){
    c.innerHTML = '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ak8-in fr-ruta ak8-frt" value="' + esc(cur) + '" inputmode="text" autocomplete="off"></span>'
      + '<span class="ovn-brak-strecket"></span>'
      + '<span class="ovn-brak-namnare"><input class="ak8-in fr-ruta ak8-frn" inputmode="text" autocomplete="off"></span></span>';
  }
  function buildPot(c, cur){
    c.innerHTML = '<span class="pot ak8-pot"><input class="ak8-in ak8-in-sm ak8-pbase" value="' + esc(cur) + '" inputmode="text" autocomplete="off"><sup><input class="ak8-in ak8-in-sm ak8-pexp" inputmode="text" autocomplete="off"></sup></span>';
  }
  // Auto-växande ruta: bredden följer innehållet så början aldrig döljs vid långt mellanled.
  function grow(inp){
    if(!inp || inp.classList.contains('fr-ruta')) return;
    var min = inp.classList.contains('ak8-in-sm') ? 34 : 74;
    inp.style.width = '1ch';
    inp.style.width = Math.max(min, Math.min(inp.scrollWidth + 6, 340)) + 'px';
  }

  // ── Keypad: keypadHTML byte-identisk ur drill-keypaden (metod-mult.js). bindKeypad utökad
  //    med två byggar-knappar (bråk, potens) som omvandlar den fokuserade cellen. ──
  function keypadHTML(ops){
    ops = ops || [];
    var digits = ['7','8','9','4','5','6','1','2','3'];
    var html = '<div class="keypad">';
    html += '<div class="keypad-digits">';
    for(var i=0; i<digits.length; i++){
      html += '<button type="button" class="kp-key" data-key="' + digits[i] + '">' + digits[i] + '</button>';
    }
    html += '<button type="button" class="kp-key span2" data-key="0">0</button>';
    html += '<button type="button" class="kp-key util" data-key="back">⌫</button>';
    html += '</div>';
    if(ops.length){
      var cls = ops.length > 5 ? 'keypad-ops wide2' : 'keypad-ops';
      html += '<div class="' + cls + '">';
      for(var j=0; j<ops.length; j++){
        html += '<button type="button" class="kp-key op" data-key="' + ops[j] + '">' + ops[j] + '</button>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
  var FRAC_ICON = '<span class="kp-frac"><span class="kp-frac-t"></span><span class="kp-frac-l"></span><span class="kp-frac-n"></span></span>';
  var POT_ICON = '<span class="kp-pot"><span class="kp-pot-b"></span><span class="kp-pot-e"></span></span>';
  // Öva-bladets keypad: siffror + · − + / och de två byggar-knapparna (bråk, potens).
  function bladKeypadHTML(){
    var kp = keypadHTML(['+','−','·','/']);
    var byggare = '<div class="keypad-ops">'
      + '<button type="button" class="kp-key op kp-fracbtn" data-key="frac" title="Bygg stående bråk">' + FRAC_ICON + '</button>'
      + '<button type="button" class="kp-key op kp-potbtn" data-key="pot" title="Bygg potens: bas och exponent">' + POT_ICON + '</button>'
      + '</div>';
    return kp.slice(0, kp.lastIndexOf('</div>')) + byggare + '</div>';
  }
  function bindKeypad(sheet){
    var active = sheet.querySelector('input');
    sheet.addEventListener('focusin', function(e){ if(e.target.tagName === 'INPUT') active = e.target; });
    sheet.addEventListener('input', function(e){ if(e.target.classList && e.target.classList.contains('ak8-in')) grow(e.target); });
    sheet.querySelectorAll('.kp-key').forEach(function(btn){
      btn.addEventListener('mousedown', function(e){
        e.preventDefault();
        if(!active || active.disabled){ var first = sheet.querySelector('input:not([disabled])'); if(first) active = first; else return; }
        var k = btn.dataset.key;
        if(k === 'frac' || k === 'pot'){
          var c = active.closest('.ak8-cell');
          if(c && !c.querySelector('.ovn-brak') && !c.querySelector('.ak8-pot')){
            var cur = (c.querySelector('input') || {}).value || '';
            if(k === 'frac'){ buildFrac(c, cur); active = c.querySelector('.ak8-frn'); grow(c.querySelector('.ak8-frt')); }
            else { buildPot(c, cur); active = c.querySelector('.ak8-pexp'); grow(c.querySelector('.ak8-pbase')); }
            if(active) active.focus();
          }
          return;
        }
        if(k === 'back'){ active.value = active.value.slice(0, -1); }
        else { active.value += k; }
        active.dispatchEvent(new Event('input', { bubbles:true }));
        active.focus();
      });
    });
  }

  // ── RENDER ──
  var CHECKS = [];
  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'tal'){
      CHECKS.push(function(el){ return { ok: likhetOk(cellRead(el, 'sv').num, r.facit), facit: fmt(r.facit) }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + ansCell('sv') + '</span></div>';
    }
    if(r.typ === 'brak'){
      // Bråk-svar: eleven bygger stående bråk via keypadens bråk-knapp (cellen börjar som en ruta).
      CHECKS.push(function(el){ return { ok: likhetOk(cellRead(el, 'sv').num, r.ft / r.fn), facit: (r.ft < 0 ? '−' : '') + Math.abs(r.ft) + '/' + r.fn }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + ansCell('sv') + '</span></div>';
    }
    if(r.typ === 'kedja'){
      // Full likhetskedja: vänster = [mellanled] = [svar], bägge fillbara celler. Eleven bygger
      // själv bråk/potens via keypaden (ingen förtryckt bas). Facit = full kedja vid Kontrollera.
      var eq = '<span class="ovn-text ak8-eq">=</span>', svarHtml;
      if(r.stil === 'br'){
        CHECKS.push(function(el){
          var mel = cellRead(el, 'mel').num, sv = cellRead(el, 'sv').num, mal = r.ft / r.fn;
          return { ok: likhetOk(mel, mal) && likhetOk(sv, mal), facit: r.facit };
        });
        svarHtml = ansCell('mel', 'mellanled') + eq + ansCell('sv', 'svar');
      } else if(r.stil === 'par'){
        // Parentes: mellanledet är en potens (eleven bygger bas^exp), svaret ett värde.
        CHECKS.push(function(el){
          var mel = cellRead(el, 'mel'), sv = cellRead(el, 'sv').num;
          return { ok: mel.kind === 'pot' && likhetOk(mel.base, r.basval) && likhetOk(mel.exp, r.exp) && likhetOk(sv, r.svar), facit: r.facit };
        });
        svarHtml = ansCell('mel', 'bas^exp') + eq + ansCell('sv', 'svar');
      } else if(r.stil === 'exp'){
        // Exp-lag: eleven bygger bas^exp i BÅDA leden (potens-knappen). Mellanledet = bas^(exp-uttryck),
        // svaret = bas^(uträknad exponent). Basen skrivs av eleven, ingen förtryckt bas.
        CHECKS.push(function(el){
          var mel = cellRead(el, 'mel'), sv = cellRead(el, 'sv');
          return { ok: mel.kind === 'pot' && likhetOk(mel.base, r.bas) && likhetOk(mel.exp, r.svarExp)
                    && sv.kind === 'pot' && likhetOk(sv.base, r.bas) && likhetOk(sv.exp, r.svarExp), facit: r.facit };
        });
        svarHtml = ansCell('mel', 'bas^exp') + eq + ansCell('sv', 'bas^exp');
      } else {   // 'ev'
        CHECKS.push(function(el){
          var mel = cellRead(el, 'mel').num, sv = cellRead(el, 'sv').num;
          return { ok: likhetOk(mel, r.svar) && likhetOk(sv, r.svar), facit: r.facit };
        });
        svarHtml = ansCell('mel', 'mellanled') + eq + ansCell('sv', 'svar');
      }
      return '<div class="ak8-rad ak8-rad-kedja"><span class="ak8-q">' + r.vanster + '</span><span class="ak8-svar" data-idx="' + idx + '">' + eq + svarHtml + '</span></div>';
    }
    if(r.typ === 'potsvar'){
      CHECKS.push(function(el){ return { ok: likhetOk(pNum(el.querySelector('.ak8-in').value), r.exp), facit: r.bas + '^' + r.exp }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '"><span class="pot">' + r.bas + '<sup>' + inTal(true) + '</sup></span></span></div>';
    }
    if(r.typ === 'skrivpot'){
      CHECKS.push(function(el){
        var ins = el.querySelectorAll('.ak8-in'), b = ins[0].value.trim().replace(',', '.'), e = pNum(ins[1].value);
        var bok = ('' + r.bas).replace(',', '.'), okB = isNaN(pFaktor(bok)) ? b.toLowerCase() === bok.toLowerCase() : likhetOk(pFaktor(b), pFaktor(bok));
        return { ok: okB && likhetOk(e, r.exp), facit: r.bas + '^' + r.exp };
      });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '"><span class="pot">' + inTal(true) + '<sup>' + inTal(true) + '</sup></span></span></div>';
    }
    if(r.typ === 'skrivmult'){
      CHECKS.push(function(el){
        var s = el.querySelector('.ak8-in').value.replace(/[x×*]/g, '·'), delar = s.split('·').map(function(d){ return d.trim(); }).filter(function(d){ return d !== ''; });
        var basv = pFaktor(('' + r.bas)), ok = delar.length === r.exp && delar.every(function(d){ return likhetOk(pFaktor(d), basv); });
        var facit = []; for(var i = 0; i < r.exp; i++) facit.push('' + r.bas); return { ok: ok, facit: facit.join(' · ') };
      });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + ' =</span><span class="ak8-svar" data-idx="' + idx + '">' + inTal() + '</span></div>';
    }
    if(r.typ === 'korval'){
      CHECKS.push(function(el){ var s = el.querySelector('.ak8-tal.sel'); return { ok: !!s && (+s.dataset.i) === r.ratt, facit: r.alt[r.ratt], ordna:true, korval:true }; });
      var knappar = r.alt.map(function(a, i){ return '<button type="button" class="ak8-tal ak8-korval" data-i="' + i + '">' + a + '</button>'; }).join('');
      return '<div class="ak8-rad">' + (r.fraga ? '<span class="ak8-q">' + r.fraga + '</span>' : '') + '<span class="ak8-svar" data-idx="' + idx + '"><span class="ak8-ordna">' + knappar + '</span></span></div>';
    }
    if(r.typ === 'figur'){
      CHECKS.push(function(el){
        var ins = el.querySelectorAll('.ak8-in'), b = ins[0].value.trim().replace(',', '.'), e = pNum(ins[1].value);
        var bok = ('' + r.bas).replace(',', '.'), okB = isNaN(pFaktor(bok)) ? b.toLowerCase() === bok.toLowerCase() : likhetOk(pFaktor(b), pFaktor(bok));
        return { ok: okB && likhetOk(e, r.exp), facit: r.bas + '^' + r.exp };
      });
      var svg = '<svg viewBox="0 0 120 120" width="96" height="96" class="ak8-kvadrat"><rect x="18" y="18" width="84" height="84" fill="none" stroke="#0f1e2e" stroke-width="2"/><text x="60" y="14" text-anchor="middle" font-size="13" fill="#3d3630">' + r.sida + '</text><text x="10" y="64" text-anchor="middle" font-size="13" fill="#3d3630">' + r.sida + '</text></svg>';
      return '<div class="ak8-rad ak8-rad-fig"><span class="ak8-svar" data-idx="' + idx + '">' + svg + '<span class="ak8-figsvar">Area = <span class="pot">' + inTal(true) + '<sup>' + inTal(true) + '</sup></span></span></span></div>';
    }
    if(r.typ === 'tabell'){
      var celler = r.varden.map(function(v, i){
        if(r.input === 'varde'){ if(i === 0) return { given:true }; return { in:'tal', facit:v }; }
        // input 'potens': värde givet, eleven skriver potensen. i=0 given (första potensen).
        return i === 0 ? { given:true } : { in:'pot', facit:v };
      });
      CHECKS.push(function(el){
        var svarrutor = el.querySelectorAll('.tab-cell[data-c]'), ok = true;
        svarrutor.forEach(function(cell){
          var c = celler[+cell.dataset.c];
          if(c.in === 'tal'){ if(!likhetOk(pNum(cell.querySelector('.ak8-in').value), c.facit)) ok = false; }
          else { var ins = cell.querySelectorAll('.ak8-in'), b = pNum(ins[0].value), e = pNum(ins[1].value); if(!(likhetOk(Math.pow(b, e), c.facit))) ok = false; }
        });
        return { ok: ok, facit: 'se raden', tabell:true };
      });
      var top = r.potenser.map(function(p){ return '<td>' + p + '</td>'; }).join('');
      var bot = celler.map(function(c, i){
        if(c.given) return '<td>' + (r.input === 'varde' ? r.varden[0] : r.potenser[0]) + '</td>';
        if(c.in === 'tal') return '<td class="tab-cell" data-c="' + i + '">' + inTal(true) + '</td>';
        return '<td class="tab-cell" data-c="' + i + '"><span class="pot">' + inTal(true) + '<sup>' + inTal(true) + '</sup></span></td>';
      }).join('');
      // rad 1 = potenser (om fyll värde) el. värden (om fyll potens); rad 2 = svarsrutorna
      var rad1 = r.input === 'varde' ? top : r.varden.map(function(v){ return '<td>' + fmt(v) + '</td>'; }).join('');
      return '<div class="ak8-rad ak8-rad-fig"><span class="ak8-svar" data-idx="' + idx + '"><table class="ak8-tabell"><tr class="tab-huvud"><th>' + (r.input === 'varde' ? 'Potens' : 'Värde') + '</th>' + rad1 + '</tr><tr><th>' + (r.input === 'varde' ? 'Värde' : 'Potens') + '</th>' + bot + '</tr></table></span></div>';
    }
    return '';
  }

  function renderBlad(mount, blad){
    var html = '<div class="ovn-sheet"><h2>' + blad.titel + '</h2>';
    // Numrering: grupp = numrerat tal (1., 2., …), rad = bokstav (a, b, c…) som ÅTERSTÄLLS per
    // grupp → stabila referenser som "tal 4 b". Bokstaven injiceras först i varje .ak8-rad.
    blad.uppg.forEach(function(g, gi){
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">' + (gi + 1) + '. ' + g.rubrik + '</div>'
        + (g.hint ? '<div class="ak8-hint">' + g.hint + '</div>' : '');
      var bokN = 0;
      g.rader.forEach(function(r){
        var h = renderRad(r);
        if(/^<div class="ak8-rad[^"]*">/.test(h)){   // bara riktiga uppgiftsrader får bokstav
          h = h.replace(/^(<div class="ak8-rad[^"]*">)/, '$1<span class="ovn-label">' + String.fromCharCode(97 + (bokN % 26)) + ')</span>');
          bokN++;
        }
        html += h;
      });
      html += '</div>';
    });
    html += '<div class="ovn-kontroll-rad"><button class="ovn-kontroll" data-kontroll>Kontrollera</button>'
      + '<button class="ovn-aterstall" data-reset>Återställ</button></div>'
      + '<div class="ovn-sammanf" data-sammanf hidden></div></div>';
    html += bladKeypadHTML();   // fast keypad längst ned (fixed); fyller det fokuserade fältet
    mount.innerHTML = html;
    mount.querySelectorAll('.ak8-korval').forEach(function(btn){
      btn.onclick = function(){ var grid = btn.closest('.ak8-ordna'); grid.querySelectorAll('.ak8-korval').forEach(function(b){ b.classList.toggle('sel', b === btn); }); };
    });
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount); };
    mount.querySelector('[data-reset]').onclick = function(){ CHECKS = []; renderBlad(mount, blad); };
    bindKeypad(mount);
  }

  function kontrollera(mount){
    var svar = mount.querySelectorAll('.ak8-svar[data-idx]'), tot = 0, ratt = 0;
    svar.forEach(function(el){
      var res = CHECKS[+el.dataset.idx](el);
      if(res.flagg) return;
      tot++;
      el.querySelectorAll('.ak8-in').forEach(function(i){ i.disabled = true; });
      if(res.korval){ var s = el.querySelector('.ak8-korval.sel'); if(s) s.classList.add(res.ok ? 'ratt' : 'fel'); }
      else { el.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.add(res.ok ? 'ak8-ok' : 'ak8-fel'); }); }
      if(res.ok){ ratt++; }
      else if(!res.tabell && !el.querySelector('.ak8-fasit')){
        var f = document.createElement('span'); f.className = 'ak8-fasit'; f.textContent = 'rätt: ' + res.facit; el.appendChild(f);
      }
    });
    var s = mount.querySelector('[data-sammanf]'); s.hidden = false;
    if(ratt === tot && tot > 0){
      s.className = 'ovn-sammanf ok';
      s.innerHTML = '<span class="ovn-sammanf-icon">✓</span><span class="ovn-sammanf-titel">Allt rätt!</span>Snyggt räknat – ' + tot + ' av ' + tot + '.';
      if(window.visaAk8Konfetti) window.visaAk8Konfetti();
    } else {
      s.className = 'ovn-sammanf delvis';
      s.textContent = ratt + ' av ' + tot + ' rätt. Se facit vid de röda och försök igen.';
    }
  }

  window.BLAD_AK8_D4 = {
    GRUND: GRUND, MULTDIV: MULTDIV, PRIO: PRIO, TIOPOTENSER: TIOPOTENSER,
    renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, ({ GRUND:GRUND, MULTDIV:MULTDIV, PRIO:PRIO, TIOPOTENSER:TIOPOTENSER })[key]); }
  };
})();
