/* ============================================================
   blad-ak8-d1.js — ÖVA-BLADEN för åk8 k1 delkapitel 1 "Repetition:
   positionssystem och fyra räknesätt", fyra av åtta blad (mult/div).
   EXAKT-FÖRFATTAT ur transkriptionen (fyra .docx, lästa ur document.xml, m:f
   strukturellt). Repetition för alla — {ak8: repetition} på sjuans noder.

   Fyra blad: 1 ×÷ med 10/100/1000 · 2 små tal · 3 stora tal · 4 stora och små.
   Tal vänsterställda, bråk STÅENDE (fracSpan). Mellanled som LIKHETSKEDJA
   (kedja-typ som speglar k1:s flerled: uppgift = [mellanled] = [svar]).

   Rör inga motorer/mellanled/generatorer. Statiskt, ingen generator.
   ── FLAGGAT (bekräftat med Joachim): blad 4 grupp 4:1 källan visar 0,8·0,6 men
      kedjan/svaret (0,048 → 0,16) kräver 0,08·0,6 — byggd som 0,08·0,6 = 0,16.
   ============================================================ */
(function(){
  'use strict';
  var F = { fracSpan: window.fracSpan };
  function frac(t, n){ return F.fracSpan(t, n); }
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }
  function fmt(x){ var r = Math.round(x * 1e9) / 1e9, s = String(r).replace('.', ','); return s; }
  function likhetOk(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }

  // Liten aritmetik-utvärderare för mellanledet (ingen eval): + − · / parenteser.
  function evalArith(s){
    s = String(s).replace(/[\s ]/g, '').replace(/−/g, '-').replace(/[·×x]/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
    if(!/^[-0-9.*/+()]*$/.test(s) || s === '') return NaN;
    var i = 0;
    function expr(){ var v = term(); while(s[i] === '+' || s[i] === '-'){ var o = s[i++], t = term(); v = o === '+' ? v + t : v - t; } return v; }
    function term(){ var v = factor(); while(s[i] === '*' || s[i] === '/'){ var o = s[i++], f = factor(); v = o === '*' ? v * f : v / f; } return v; }
    function factor(){ if(s[i] === '+'){ i++; return factor(); } if(s[i] === '-'){ i++; return -factor(); } if(s[i] === '('){ i++; var v = expr(); if(s[i] === ')') i++; return v; } var m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i)); if(!m) return NaN; i += m[0].length; return parseFloat(m[0]); }
    var r = expr(); return i === s.length ? r : NaN;
  }

  // ── Byggstenar ──
  // Tal-svar: ett textfält, facit = värde.
  function T(fraga, facit){ return { typ:'tal', fraga:fraga, facit:facit }; }
  // Likhetskedja (visa mellanled): vänster = [mellanled] = [svar]. Mellanledet
  // värde-rättas (godtar valfritt uttryck lika med värdet), svaret värde-rättas.
  // facit = full kedja ur transkriptionen (visas vid Kontrollera).
  function K(vanster, svar, facit){ return { typ:'kedja', vanster:vanster, svar:svar, facit:facit }; }
  function G(rubrik, rader){ return { rubrik:rubrik, rader:rader }; }

  // ─────────── BLAD 1 · ×÷ med 10, 100 och 1000 ───────────
  var BLAD_1 = { nr:1, titel:'Multiplikation och division med 10, 100 och 1000', nod:'mult-rakna:pow10', uppg:[
    G('Beräkna', [ T('10 · 57 =', 570), T('100 · 307 =', 30700), T('1000 · 96 =', 96000), T('100 · 38,6 =', 3860) ]),
    G('Beräkna', [ T(frac(87,10) + ' =', 8.7), T(frac(907,100) + ' =', 9.07), T(frac('97,6',10) + ' =', 9.76), T(frac(9801,1000) + ' =', 9.801) ]),
    G('Beräkna', [ T('65,03 · 10 =', 650.3), T('100 · 1,09 =', 109), T('1000 · 50,9 =', 50900), T('76,894 · 100 =', 7689.4) ]),
    G('Beräkna', [ T(frac('71,3',100) + ' =', 0.713), T(frac('103,3',10) + ' =', 10.33), T(frac('90,1',1000) + ' =', 0.0901), T(frac('0,82',1000) + ' =', 0.00082) ])
  ] };

  // ─────────── BLAD 2 · Små tal ───────────
  var BLAD_2 = { nr:2, titel:'Multiplicera och dividera med små tal', nod:'div-rakna:sma', uppg:[
    G('Beräkna', [ T('6 · 0,5 =', 3), T('12 · 0,25 =', 3), T('5 · 0,2 =', 1), T('11 · 0,2 =', 2.2) ]),
    G('Beräkna – visa mellanled', [
      K(frac(8,'0,1'), 80, '8/0,1 = 8·10 / 0,1·10 = 80/1 = 80'),
      K(frac(6,'0,5'), 12, '6/0,5 = 6·2 / 0,5·2 = 12/1 = 12'),
      K(frac(7,'0,2'), 35, '7/0,2 = 7·5 / 0,2·5 = 35/1 = 35'),
      K(frac(5,'0,25'), 20, '5/0,25 = 5·4 / 0,25·4 = 20/1 = 20') ]),
    G('Beräkna', [ T('0,4 · 0,3 =', 0.12), T('0,7 · 0,7 =', 0.49), T('0,05 · 0,9 =', 0.045), T('0,04 · 0,08 =', 0.0032) ]),
    G('Beräkna – visa mellanled', [
      K(frac(32,'0,4'), 80, '32/0,4 = 32·10 / 0,4·10 = 320/4 = 80'),
      K(frac('5,4','0,3'), 18, '5,4/0,3 = 5,4·10 / 0,3·10 = 54/3 = 18'),
      K(frac(93,'0,03'), 3100, '93/0,03 = 93·100 / 0,03·100 = 9300/3 = 3100'),
      K(frac('56,7','0,07'), 810, '56,7/0,07 = 56,7·100 / 0,07·100 = 5670/7 = 810') ])
  ] };

  // ─────────── BLAD 3 · Stora tal ───────────
  var BLAD_3 = { nr:3, titel:'Multiplicera och dividera med stora tal', nod:'mult-rakna:stora', uppg:[
    G('Beräkna', [ T('200 · 3000 =', 600000), T('7000 · 20000 =', 140000000), T('70000 · 8000 =', 560000000) ]),
    G('Beräkna', [ T(frac(60000,300) + ' =', 200), T(frac(450000,5000) + ' =', 90), T(frac(9300000,3000) + ' =', 3100) ]),
    G('Beräkna', [ T('12000 · 400 =', 4800000), T('150000 · 5000 =', 750000000), T('231000 · 30000 =', 6930000000) ]),
    G('Beräkna', [ T(frac(360000,120) + ' =', 3000), T(frac('120000 · 2000',80000) + ' =', 3000), T(frac('90000 · 4000000','600000') + ' =', 600000) ])
  ] };

  // ─────────── BLAD 4 · Stora och små tal ───────────
  var BLAD_4 = { nr:4, titel:'Multiplicera och dividera med stora och små tal', nod:'div-rakna:storasma', uppg:[
    G('Beräkna – visa mellanled', [
      K('900 · 0,2', 180, '900·0,2 = 90·2 = 180'),
      K('30000 · 0,04', 1200, '30000·0,04 = 300·4 = 1200'),
      K('4000000 · 0,007', 28000, '4000000·0,007 = 4000·7 = 28000') ]),
    G('Beräkna – visa mellanled', [
      K(frac(132,300), 0.44, '132/300 = 132 / 3·100 = 1,32/3 = 0,44'),
      K(frac(78,200), 0.39, '78/200 = 78 / 2·100 = 0,78/2 = 0,39'),
      K(frac(12000000,'0,003'), 4000000000, '12000000/0,003 = 12000000·1000 / 0,003·1000 = 12000000000/3 = 4000000000') ]),
    G('Beräkna – visa mellanled', [
      K('1200000 · 0,06', 72000, '1200000·0,06 = 12000·6 = 72000'),
      K('14000 · 0,003', 42, '14000·0,003 = 14·3 = 42'),
      K('22000000 · 0,0006', 13200, '22000000·0,0006 = 2200·6 = 13200') ]),
    G('Beräkna – visa mellanled', [
      K(frac('0,08 · 0,6','0,3'), 0.16, '(0,08·0,6)/0,3 = 0,048/0,3 = 0,48/3 = 0,16'),
      K(frac('40000 · 0,08','0,04 · 5'), 16000, '(40000·0,08)/(0,04·5) = 3200/0,2 = 32000/2 = 16000'),
      K(frac('50 · 0,3','0,05'), 300, '(50·0,3)/0,05 = (5·3)/0,05 = 1500/5 = 300') ])
  ] };

  // ═══════════════ RENDER + SJÄLVRÄTTNING ═══════════════
  var CHECKS = [];
  function inTal(ph){ return '<input class="ak8-in" inputmode="text" autocomplete="off"' + (ph ? ' placeholder="' + ph + '"' : '') + '>'; }

  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'tal'){
      CHECKS.push(function(el){ return { ok: likhetOk(pNum(el.querySelector('.ak8-in').value), r.facit), facit: fmt(r.facit) }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + inTal() + '</span></div>';
    }
    // kedja: vänster = [mellanled] = [svar]
    CHECKS.push(function(el){
      var mel = evalArith(el.querySelector('.ak8-mel').value);
      var sv = pNum(el.querySelector('.ak8-sv').value);
      var ok = likhetOk(mel, r.svar) && likhetOk(sv, r.svar);
      return { ok: ok, facit: r.facit };
    });
    return '<div class="ak8-rad"><span class="ak8-q">' + r.vanster + '</span>'
      + '<span class="ak8-svar" data-idx="' + idx + '">'
      + '<span class="ovn-text" style="margin:0 6px;">=</span><input class="ak8-in ak8-mel" inputmode="text" autocomplete="off" placeholder="mellanled">'
      + '<span class="ovn-text" style="margin:0 6px;">=</span><input class="ak8-in ak8-sv" inputmode="text" autocomplete="off" placeholder="svar">'
      + '</span></div>';
  }

  function renderBlad(mount, blad){
    var html = '<div class="ovn-sheet"><h2>' + blad.titel + '</h2>'
      + '<p class="ak8-intro">Tal vänsterställda. Visa mellanledet i den vänstra rutan (förlängning eller balansera decimalerna), och svaret i den högra.</p>';
    blad.uppg.forEach(function(g, gi){
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">' + (gi + 1) + '. ' + g.rubrik + '</div>';
      var bokN = 0;
      g.rader.forEach(function(r){
        var h = renderRad(r);
        if(/^<div class="ak8-rad[^"]*">/.test(h)){ h = h.replace(/^(<div class="ak8-rad[^"]*">)/, '$1<span class="ovn-label">' + String.fromCharCode(97 + (bokN % 26)) + ')</span>'); bokN++; }
        html += h;
      });
      html += '</div>';
    });
    html += '<div class="ovn-kontroll-rad"><button type="button" class="ovn-kontroll" data-kontroll>Kontrollera</button><button type="button" class="ovn-aterstall" data-reset>Återställ</button></div><div class="ovn-sammanf" data-sammanf style="display:none;"></div></div>';
    mount.innerHTML = html;
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount); };
    mount.querySelector('[data-reset]').onclick = function(){ CHECKS = []; renderBlad(mount, blad); };
  }

  function kontrollera(mount){
    var svar = mount.querySelectorAll('.ak8-svar[data-idx]'), tot = 0, ratt = 0;
    svar.forEach(function(el){
      var res = CHECKS[+el.dataset.idx](el);
      tot++;
      el.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.remove('ak8-ok', 'ak8-fel'); i.classList.add(res.ok ? 'ak8-ok' : 'ak8-fel'); i.disabled = true; });
      var rad = el.closest('.ak8-rad'), old = rad && rad.querySelector('.ak8-fasit'); if(old) old.remove();
      if(res.ok) ratt++;
      else if(res.facit && rad){ var f = document.createElement('span'); f.className = 'ak8-fasit'; f.innerHTML = 'rätt: ' + res.facit; rad.appendChild(f); }
    });
    var sam = mount.querySelector('[data-sammanf]');
    if(ratt === tot && tot > 0){ sam.className = 'ovn-sammanf ok'; sam.style.display = ''; sam.innerHTML = '<div class="ovn-sammanf-icon">✓</div><span class="ovn-sammanf-titel">Allt rätt!</span>Du klarade alla ' + tot + '.'; if(window.visaAk8Konfetti) window.visaAk8Konfetti(); }
    else { sam.className = 'ovn-sammanf delvis'; sam.style.display = ''; sam.innerHTML = 'Du har ' + ratt + ' av ' + tot + ' rätt. Rätta de röda och tryck Kontrollera igen.'; }
    sam.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  window.BLAD_AK8_D1 = { 1:BLAD_1, 2:BLAD_2, 3:BLAD_3, 4:BLAD_4,
    renderBlad: function(mount, nr){ CHECKS = []; renderBlad(mount, ({ 1:BLAD_1, 2:BLAD_2, 3:BLAD_3, 4:BLAD_4 })[nr]); },
    helpers:{ pNum:pNum, fmt:fmt, evalArith:evalArith } };
})();
