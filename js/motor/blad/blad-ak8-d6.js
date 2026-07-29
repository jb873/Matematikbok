/* blad-ak8-d6.js — Åk8 kapitel 1, delkapitel 5 (Räkna med bråk): Addition och subtraktion.
   Två Öva-blad, exakt-författade ur "Addition och subtraktion med bråk (1).docx"
   (läst strukturellt ur document.xml/m:f; alla facit oberoende omräknade, 0 fel). Ärver åk7 k2.
   Återanvänder ak8-blad-ui.js (keypad + BRÅK-BYGGARE, expr-celler, numrering, markera) + blad-karna (fracSpan).

   RÄTTNINGS-MODELL (per orderns beslut):
   · Kanoniska rader (liknämnig/förläng/blandad utan lån/heltal/decimal/flerterms): FASTA mellanled-rutor,
     varje rutas uttryck rättas mot det LÖPANDE VÄRDET (equality-kedja). Slutrutan dessutom mot enklaste form.
   · LÅNA-rader (multi-path): FRI inmatning — likhetstecken-rättning inbyggd här (ingen separat motor):
     varje led eleven skriver = radens värde, sista ledet = svaret i enklaste form. Godtar ALLA giltiga vägar.
   FÖRLÄNGNINGS-KNAPP (ogrindad): visar/döljer de toggle-bara förlängnings-leden utan att röra svaren.
   Mellanled/svar via bråk-byggaren → mixedEval tolkar blandade tal ("3 8/6 − 1 5/6"), bråk och decimaler. */
(function(){
  'use strict';
  var F = window, LR = window.Likhetsrattare;   // equality-rättaren (mixedEval/finalForm/finalCheck/provaKedja) bor i den delade modulen
  function fr(t, n){ return F.fracSpan(t, n); }
  function mx(h, t, n){ return h + '&nbsp;' + F.fracSpan(t, n); }

  // ── FABRIKER ──
  // R: kanonisk rad. q=display, v=[p,q] (svar exakt), forlang='toggle'|'fix'|null, mid=antal vanliga mellanled, fin=slutform
  function R(q, v, forlang, mid, fin){ return { q: q, v: v[0] / v[1], forlang: forlang, mid: mid, fin: fin, lana: false }; }
  function L(q, v, fin){ return { q: q, v: v[0] / v[1], lana: true, fin: fin }; }        // LÅNA-rad (fri equality-kedja)
  function MI(h, t, n){ return { k: 'mi', h: h, t: t, n: n }; }
  function BR(t, n){ return { k: 'br', t: t, n: n }; }
  function DE(x){ return { k: 'dec', x: x }; }
  function G(rubrik, rader, hint){ return { rubrik: rubrik, rader: rader, hint: hint }; }

  // ══════════════════════════ BLAD 1 ══════════════════════════
  var BLAD1 = { key: 'B1', titel: 'Addition och subtraktion med bråk', uppg: [
    G('Beräkna med decimaltal – gör om bråktalet till decimaltal', [
      R(fr(3,5) + ' − 0,2', [2,5], null, 1, DE(0.4)),
      R(fr(3,4) + ' + ' + fr(2,5), [23,20], null, 1, DE(1.15)),
      R(fr(7,10) + ' − 0,23', [47,100], null, 1, DE(0.47))
    ]),
    G('Beräkna med heltal', [
      R('1 − ' + fr(2,7), [5,7], null, 0, BR(5,7)),
      R('2 − ' + fr(4,9), [14,9], null, 0, MI(1,5,9)),
      R('5 − ' + mx(2,3,11), [30,11], null, 0, MI(2,8,11))
    ]),
    G('Beräkna – visa mellanled, svara i enklaste form', [
      R(fr(4,5) + ' + ' + fr(3,5), [7,5], null, 1, MI(1,2,5)),
      R(fr(6,7) + ' − ' + fr(2,7), [4,7], null, 0, BR(4,7)),
      R(fr(3,4) + ' + ' + fr(5,8), [11,8], 'fix', 1, MI(1,3,8)),
      R(fr(7,12) + ' − ' + fr(1,6), [5,12], 'fix', 0, BR(5,12))
    ]),
    G('Beräkna med bråktal – visa mellanled och svara i enklaste form', [
      R(fr(2,3) + ' + ' + fr(3,5), [19,15], 'toggle', 1, MI(1,4,15)),
      R(fr(3,4) + ' − ' + fr(1,6), [7,12], 'toggle', 0, BR(7,12)),
      R(fr(2,5) + ' + ' + fr(7,8), [51,40], 'toggle', 1, MI(1,11,40)),
      R(fr(3,5) + ' − ' + fr(1,4), [7,20], 'toggle', 0, BR(7,20))
    ], 'Tryck på "Visa förlängning" om du vill skriva ut steget där du förlänger till gemensam nämnare.'),
    G('Beräkna med blandad form – visa mellanled, svara i enklaste form', [
      R(mx(1,1,2) + ' + ' + mx(2,3,7), [55,14], 'toggle', 0, MI(3,13,14)),
      R(mx(2,3,4) + ' − ' + mx(1,5,8), [9,8], 'toggle', 0, MI(1,1,8)),
      R(mx(3,4,9) + ' + ' + mx(2,5,6), [113,18], 'toggle', 1, MI(6,5,18)),
      R(mx(4,3,5) + ' − ' + mx(1,2,7), [116,35], 'toggle', 0, MI(3,11,35))
    ]),
    G('Beräkna – låna i blandad form', [
      L(mx(4,1,3) + ' − ' + mx(1,5,6), [5,2], MI(2,1,2)),
      L(mx(3,3,4) + ' − ' + mx(2,6,7), [25,28], BR(25,28))
    ], 'Fri väg: skriv dina egna mellanled. Varje led måste vara lika med uttrycket, och sista ledet svaret i enklaste form. Alla giltiga vägar godtas (låna från heltalet, eller räkna via oäkta bråk).')
  ] };

  // ══════════════════════════ BLAD 2 ══════════════════════════
  var BLAD2 = { key: 'B2', titel: 'Addition och subtraktion med bråk – blad 2', uppg: [
    G('Beräkna – visa mellanled (behöver inte visa förlängning) och svara i enklaste form', [
      R(mx(2,4,5) + ' + ' + mx(3,1,4), [121,20], 'toggle', 1, MI(6,1,20)),
      L(mx(5,1,3) + ' − ' + mx(2,3,4), [31,12], MI(2,7,12)),
      R(mx(6,5,9) + ' + ' + mx(3,5,6), [187,18], 'toggle', 1, MI(10,7,18))
    ], 'Andra raden kräver att du lånar från heltalet – fri väg, skriv dina egna mellanled.'),
    G('Beräkna – visa mellanled och svara i enklaste form', [
      R(fr(1,2) + ' + ' + fr(1,3) + ' + ' + fr(1,4), [13,12], 'toggle', 1, MI(1,1,12)),
      R(fr(2,5) + ' + ' + fr(3,4) + ' + ' + fr(9,10), [41,20], 'toggle', 1, MI(2,1,20)),
      R(fr(6,8) + ' + ' + fr(3,5) + ' − ' + fr(17,20), [1,2], 'toggle', 1, BR(1,2))
    ]),
    G('Beräkna – visa mellanled (behöver inte visa förlängning) och svara i enklaste form', [
      R(mx(7,3,4) + ' + ' + mx(2,5,6) + ' + ' + mx(3,5,8), [341,24], 'toggle', 1, MI(14,5,24)),
      R(mx(4,1,5) + ' − ' + mx(6,2,3) + ' + ' + mx(3,1,2), [31,30], 'toggle', 0, MI(1,1,30)),
      R(mx(3,3,5) + ' − ' + mx(8,5,6) + ' + ' + mx(4,2,3), [-17,30], 'toggle', 1, BR(-17,30))
    ], 'Sista raden ger ett negativt svar – bygg kedjan med minustecken.'),
    G('Beräkna – visa mellanled (behöver inte visa förlängning) och svara i enklaste form', [
      L(mx(4,1,6) + ' − ' + mx(1,3,8), [67,24], MI(2,19,24)),
      L(mx(5,2,7) + ' − ' + mx(3,5,6), [61,42], MI(1,19,42))
    ], 'Låna från heltalet – fri väg, skriv dina egna mellanled. Alla giltiga vägar godtas.'),
    G('Beräkna – visa mellanled (behöver inte visa förlängning) och svara i enklaste form', [
      R(mx(6,3,4) + ' + ' + mx(1,7,15) + ' − ' + mx(4,2,3) + ' + ' + mx(3,5,6) + ' − ' + mx(2,11,12), [67,15], 'toggle', 1, MI(4,7,15)),
      R(mx(9,5,12) + ' − ' + mx(2,5,18) + ' + ' + mx(1,11,20) + ' − ' + mx(2,37,45), [88,15], 'toggle', 2, MI(5,13,15))
    ])
  ] };

  // ══════════════════════════ RENDER ══════════════════════════
  var CHECKS = [];
  var EQ = '<span class="ovn-text ak8-eq">=</span>';
  function ledWrap(role, forlangKlass){ return '<span class="ak8-ledwrap' + (forlangKlass ? ' ' + forlangKlass : '') + '">' + EQ + AK8_UI.ansCell(role) + '</span>'; }
  function exprOf(scope, role){ return scope.querySelector('.ak8-cell[data-r="' + role + '"] .ak8-expr'); }

  function finText(fin){ return fin.k === 'dec' ? String(fin.x).replace('.', ',') : fin.k === 'br' ? fin.t + '/' + fin.n : fin.h + ' ' + fin.t + '/' + fin.n; }

  function renderRad(r){
    var idx = CHECKS.length;
    if(r.lana){
      CHECKS.push(function(el){
        // FRI equality-kedja via delade rättaren: varje ifyllt led = radens värde, sista = svaret i enklaste form (path-fritt)
        var celler = [].slice.call(el.querySelectorAll('.ak8-cell')).map(function(c){ return exprOf(el, c.dataset.r); });
        var res = LR.provaKedja(celler, r.v, r.fin);
        return { ok: res.ok, facit: 'svar: ' + finText(r.fin) + (res.antal ? ' (varje led = uttrycket)' : '') };
      });
      // fri kedja: fyra led-rutor + "lägg till"
      var celler = '';
      for(var k = 0; k < 4; k++) celler += ledWrap('L' + k, k >= 2 ? 'ak8-extra' : '');
      return '<div class="ak8-rad ak8-rad-kedja ak8-lana" data-idx="' + idx + '"><span class="ak8-q">' + r.q + '</span>' + celler
        + '<button type="button" class="ak8-mer" data-mer>+ led</button></div>';
    }
    // kanonisk kedja
    var cells = [], roll = 0;
    if(r.forlang) cells.push({ role: 'c' + (roll++), fk: r.forlang === 'toggle' ? 'ak8-forlang' : '' });
    for(var i = 0; i < r.mid; i++) cells.push({ role: 'c' + (roll++), fk: '' });
    cells.push({ role: 'fin', fk: '', fin: true });
    CHECKS.push(function(el){
      var ok = true, sett = false;
      cells.forEach(function(c){
        var wrap = el.querySelector('.ak8-cell[data-r="' + c.role + '"]').closest('.ak8-ledwrap');
        if(wrap && wrap.classList.contains('ak8-forlang') && !el.closest('.ovn-sheet').classList.contains('visa-forlang')) return; // dolt förläng-led hoppas över
        var expr = exprOf(el, c.role);
        if(c.fin){ if(!LR.finalCheck(LR.finalForm(expr), r.fin)) ok = false; }
        else { if(!LR.likhet(LR.mixedEval(expr), r.v)) ok = false; }
        sett = true;
      });
      return { ok: ok && sett, facit: 'svar: ' + finText(r.fin) };
    });
    var html = '<div class="ak8-rad ak8-rad-kedja" data-idx="' + idx + '"><span class="ak8-q">' + r.q + '</span>';
    cells.forEach(function(c){ html += ledWrap(c.role, c.fk); });
    return html + '</div>';
  }

  function renderBlad(mount, blad){
    var html = '<div class="ovn-sheet"><h2>' + blad.titel + '</h2>';
    blad.uppg.forEach(function(g, gi){ html += '<div class="ovn-grupp">' + AK8_UI.renderGrupp(g, gi + 1, renderRad) + '</div>'; });
    html += '<div class="ovn-kontroll-rad"><button class="ovn-kontroll" data-kontroll>Kontrollera</button>'
      + '<button type="button" class="ovn-forlang-knapp" data-forlang>Visa förlängning</button>'
      + '<button class="ovn-aterstall" data-reset>Återställ</button>' + AK8_UI.printKnappHTML() + '</div>'
      + '<div class="ovn-sammanf" data-sammanf hidden></div></div>';
    html += AK8_UI.keypadHTML({ builders: true, ops: ['+', '−', '·', '/', ','] });
    mount.innerHTML = html;
    var sheet = mount.querySelector('.ovn-sheet');
    // LÅNA: "+ led" visar nästa dolda extra-ruta
    mount.querySelectorAll('[data-mer]').forEach(function(btn){
      btn.onclick = function(){ var d = btn.parentNode.querySelector('.ak8-extra'); if(d){ d.classList.remove('ak8-extra'); AK8_UI.grow(d.querySelector('input')); } };
    });
    mount.querySelector('[data-forlang]').onclick = function(){ sheet.classList.toggle('visa-forlang'); this.classList.toggle('is-on'); this.textContent = sheet.classList.contains('visa-forlang') ? 'Dölj förlängning' : 'Visa förlängning'; };
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount); };
    mount.querySelector('[data-reset]').onclick = function(){ CHECKS = []; renderBlad(mount, blad); };
    AK8_UI.bindSheet(mount);
  }

  function kontrollera(mount){
    var rader = mount.querySelectorAll('.ak8-rad[data-idx]'), tot = 0, ratt = 0;
    rader.forEach(function(el){
      var res = CHECKS[+el.dataset.idx](el);
      tot++;
      el.querySelectorAll('.ak8-in').forEach(function(i){ if(i.closest('.ak8-extra')) return; i.classList.add(res.ok ? 'ak8-ok' : 'ak8-fel'); });
      AK8_UI.markera(el, res.ok);
      if(res.ok){ ratt++; }
      else if(!el.querySelector('.ak8-fasit')){ var f = document.createElement('span'); f.className = 'ak8-fasit'; f.textContent = 'rätt ' + res.facit; el.appendChild(f); }
    });
    var s = mount.querySelector('[data-sammanf]'); s.hidden = false;
    if(ratt === tot && tot > 0){
      s.className = 'ovn-sammanf ok';
      s.innerHTML = '<span class="ovn-sammanf-icon">✓</span><span class="ovn-sammanf-titel">Allt rätt!</span>Snyggt räknat – ' + tot + ' av ' + tot + '.';
      if(window.visaAk8Konfetti) window.visaAk8Konfetti();
    } else { s.className = 'ovn-sammanf delvis'; s.textContent = ratt + ' av ' + tot + ' rätt. Se facit vid de röda och försök igen.'; }
  }

  window.BLAD_AK8_D6 = { BLAD1: BLAD1, BLAD2: BLAD2, renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, key === 'B2' ? BLAD2 : BLAD1); } };
})();
