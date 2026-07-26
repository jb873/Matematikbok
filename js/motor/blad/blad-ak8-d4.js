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
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }
  function fmt(x){ var r = Math.round(x * 1e9) / 1e9, s = String(r).replace('.', ','); return s; }
  function likhetOk(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  function inTal(sm){ return '<input class="ak8-in' + (sm ? ' ak8-in-sm' : '') + '" inputmode="text" autocomplete="off">'; }
  // en faktor ur "3/4", "0,6", "7", "x"
  function pFaktor(s){ s = String(s).trim().replace(',', '.'); var m = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+)$/); if(m) return parseFloat(m[1]) / parseFloat(m[2]); return parseFloat(s); }

  // ── Potens-notation (upphöjt) + stående bråk ──
  function pot(b, e){ return '<span class="pot">' + b + '<sup>' + e + '</sup></span>'; }
  function fr(t, n){ return F.fracSpan(t, n); }

  // ── Uppgifts-fabriker ──
  function MALL(html){ return { typ:'mall', html:html }; }                                     // statiskt räknat exempel (visas, rättas ej)
  function T(fraga, facit){ return { typ:'tal', fraga:fraga, facit:facit }; }                   // talsvar (värde)
  function BR(fraga, ft, fn){ return { typ:'brak', fraga:fraga, ft:ft, fn:fn }; }               // bråksvar (stående)
  function POTSVAR(fraga, bas, exp){ return { typ:'potsvar', fraga:fraga, bas:bas, exp:exp }; } // exp-lag-svar: fraga = bas^□
  function SKRIVPOT(fraga, bas, exp){ return { typ:'skrivpot', fraga:fraga, bas:bas, exp:exp }; } // skriv som potens: □^□
  function SKRIVMULT(fraga, bas, exp){ return { typ:'skrivmult', fraga:fraga, bas:bas, exp:exp }; } // skriv som multiplikation (text)
  function KORVAL(fraga, alt, ratt){ return { typ:'korval', fraga:fraga, alt:alt, ratt:ratt }; } // klicka rätt (korOvningKlick)
  function FIGUR(sida, bas, exp){ return { typ:'figur', sida:sida, bas:bas, exp:exp }; }         // rita kvadrat → area i potensform
  function TAB(potenser, varden, input){ return { typ:'tabell', potenser:potenser, varden:varden, input:input }; } // input:'varde'|'potens'
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
      SKRIVMULT(pot('(' + fr(3, 4) + ')', 3), '3/4', 3), SKRIVMULT(pot('0,6', 4), '0,6', 4)
    ]),
    G('Fyll i värdet', [
      TAB([pot(2, 4), pot(2, 3), pot(2, 2), pot(2, 1), pot(2, 0)], [16, 8, 4, 2, 1], 'varde')
    ]),
    G('Beräkna med mellanled — räkna ut varje potens, operera sedan', [
      MALL(pot(3, 3) + ' − ' + pot(2, 3) + ' = 27 − 8 = <b>19</b>'),
      T(pot(6, 2) + ' + ' + pot(5, 2) + ' =', 61), T(pot(5, 3) + ' − ' + pot(10, 2) + ' =', 25), T(pot(2, 5) + ' + ' + pot(7, 2) + ' =', 81)
    ]),
    G('Beräkna med mellanled — parentes/potens först', [
      MALL('(12 − 5)' + '<sup>2</sup> = ' + pot(7, 2) + ' = <b>49</b>'),
      MALL('(' + fr(3, 4) + ')<sup>2</sup> = ' + fr(3, 4) + ' · ' + fr(3, 4) + ' = ' + fr(9, 16)),
      T('(7 + 4)<sup>2</sup> =', 121), BR('(' + fr(2, 3) + ')<sup>3</sup> =', 8, 27)
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
      MALL('15 − ' + pot(2, 3) + ' = 15 − 8 = <b>7</b>'),
      MALL('3 · ' + pot(7, 2) + ' = 3 · 49 = <b>147</b>'),
      MALL('6 + ' + fr(pot(3, 3), 9) + ' = 6 + ' + fr(27, 9) + ' = 6 + 3 = <b>9</b>')
    ])
  ] };

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD 2 — Potenser: multiplikation och division
  // ══════════════════════════════════════════════════════════════════════════════════════
  var MULTDIV = { nr:2, titel:'Potenser: multiplikation och division', nod:'pot-multdiv:rakna', uppg:[
    G('Multiplikation, samma bas — behåll basen, addera exponenterna', [
      MALL(pot(3, 4) + ' · ' + pot(3, 5) + ' = ' + pot(3, '4+5') + ' = ' + pot(3, 9)),
      POTSVAR(pot(2, 5) + ' · ' + pot(2, 6) + ' =', 2, 11), POTSVAR(pot(5, 2) + ' · ' + pot(5, 7) + ' =', 5, 9)
    ]),
    G('Division, samma bas — behåll basen, subtrahera exponenterna', [
      MALL(fr(pot(6, 5), pot(6, 2)) + ' = ' + pot(6, '5−2') + ' = ' + pot(6, 3)),
      POTSVAR(fr(pot(3, 8), pot(3, 3)) + ' =', 3, 5), POTSVAR(fr(pot(7, 12), pot(7, 4)) + ' =', 7, 8)
    ]),
    G('Lös ut basen — vilket tal ska x vara?', [
      T(pot('x', 2) + ' = 49,&nbsp; x =', 7), T(pot('x', 3) + ' = 27,&nbsp; x =', 3), T(pot('x', 3) + ' = 125,&nbsp; x =', 5), T(pot('x', 5) + ' = 32,&nbsp; x =', 2)
    ]),
    G('Beräkna med mellanled — räkna ut varje potens, operera sedan', [
      MALL(pot(2, 3) + ' + ' + pot(4, 2) + ' = 8 + 16 = <b>24</b>'),
      T(pot(8, 2) + ' − ' + pot(2, 3) + ' =', 56), T(pot(2, 3) + ' · ' + pot(5, 2) + ' + ' + pot(3, 3) + ' =', 227), T(pot(2, 5) + ' · ' + pot(3, 2) + ' − ' + pot(4, 2) + ' =', 272)
    ]),
    G('Resonemang', [
      T('Hur många faktorer 3 för att få 9?', 2), T('Hur många faktorer 3 för att få 81?', 4), T('Hur många faktorer 3 för att få 27?', 3),
      T('Hur mycket är ' + pot(3, 6) + ' om ' + pot(3, 5) + ' är 243?', 729)
    ]),
    G('Multiplikation och division blandat, samma bas', [
      POTSVAR(fr(pot(3, 4) + ' · ' + pot(3, 7), pot(3, 5)) + ' =', 3, 6), POTSVAR(fr(pot(17, 6) + ' · ' + pot(17, 2), pot(17, 4)) + ' =', 17, 4),
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
      T('(4 · 2)<sup>2</sup> =', 64), T('5 · ' + pot(2, 4) + ' =', 80), T('5 · 2 + ' + pot(3, 3) + ' =', 37), T('25 − ' + pot(6, 2) + ' =', -11)
    ], 'Tänk på prioriteringsreglerna. Ett svar blir negativt.'),
    G('Beräkna', [
      T('(0,2 · 3)<sup>2</sup> =', 0.36), T('3 · (2 − 1,9)<sup>2</sup> =', 0.03), BR('4 · (' + fr(3, 4) + ')<sup>2</sup> =', 9, 4)
    ]),
    G('Beräkna', [
      T('3 + 4 · 2 − ' + pot(2, 3) + ' =', 3), T('(36 − 3 · ' + pot(2, 2) + ') + ' + pot(3, 2) + ' =', 33), BR('(' + fr(5, 3) + ')<sup>2</sup> − 12 · (' + fr(1, 2) + ')<sup>2</sup> =', -2, 9)
    ])
  ] };

  // ── RENDER ──
  var CHECKS = [];
  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'mall'){
      return '<div class="ak8-rad ak8-mall"><span class="ak8-q">' + r.html + '</span></div>';
    }
    if(r.typ === 'tal'){
      CHECKS.push(function(el){ return { ok: likhetOk(pNum(el.querySelector('.ak8-in').value), r.facit), facit: fmt(r.facit) }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + inTal() + '</span></div>';
    }
    if(r.typ === 'brak'){
      CHECKS.push(function(el){
        var t = pNum(el.querySelector('.ak8-bt').value), n = pNum(el.querySelector('.ak8-bn').value);
        return { ok: isFinite(t) && isFinite(n) && n !== 0 && Math.abs(t / n - r.ft / r.fn) < 1e-9, facit: (r.ft < 0 ? '−' : '') + Math.abs(r.ft) + '/' + r.fn };
      });
      var bruta = '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ak8-in ak8-bt fr-ruta"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ak8-in ak8-bn fr-ruta"></span></span>';
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + bruta + '</span></div>';
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
    blad.uppg.forEach(function(g){
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">' + g.rubrik + '</div>'
        + (g.hint ? '<div class="ak8-hint">' + g.hint + '</div>' : '');
      g.rader.forEach(function(r){ html += renderRad(r); });
      html += '</div>';
    });
    html += '<div class="ovn-kontroll-rad"><button class="ovn-kontroll" data-kontroll>Kontrollera</button>'
      + '<button class="ovn-aterstall" data-reset>Återställ</button></div>'
      + '<div class="ovn-sammanf" data-sammanf hidden></div></div>';
    mount.innerHTML = html;
    mount.querySelectorAll('.ak8-korval').forEach(function(btn){
      btn.onclick = function(){ var grid = btn.closest('.ak8-ordna'); grid.querySelectorAll('.ak8-korval').forEach(function(b){ b.classList.toggle('sel', b === btn); }); };
    });
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount); };
    mount.querySelector('[data-reset]').onclick = function(){ CHECKS = []; renderBlad(mount, blad); };
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
    GRUND: GRUND, MULTDIV: MULTDIV, PRIO: PRIO,
    renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, ({ GRUND:GRUND, MULTDIV:MULTDIV, PRIO:PRIO })[key]); }
  };
})();
