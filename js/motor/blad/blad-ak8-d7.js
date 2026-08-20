/* blad-ak8-d7.js — Åk8 kapitel 1, delkapitel 6 (Räkna med bråk): Multiplikation.
   Två Öva-blad, exakt-författade ur "Multiplikation med bråk.docx" (läst strukturellt ur
   document.xml/m:f; alla facit oberoende omräknade, 0 fel). Ärver åk7 k2.

   Två rättnings-modeller (per order):
   · CANONICAL (visa ett/mellanled, blandad/enklaste form): FASTA mellanled-rutor mot löpande värde.
     Mellanledet är ett PRODUKTBRÅK ((2·2)/(3·3)) → motor-lokal cell där täljare/nämnare tolkas med
     AK8_UI.evalArith. Slutrutan även mot enklaste form.
   · EQUALITY (förkorta-innan, ta-bort-mellanled, förenkla-innan): FRI kedja via delade Likhetsrattare
     (provaKedja) — path-fritt, korsförkorta i valfri ordning / kortare kedja. Modulen är OFÖRÄNDRAD.
   Bråk som stående bråk (bråk-byggaren). De 2 ordproblemen (Nils/får) byggs EJ här (problemlösning). */
(function(){
  'use strict';
  var F = window, LR = window.Likhetsrattare;
  function evalA(s){ return AK8_UI.evalArith(s); }
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function likhet(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  function fr(t, n){ return F.fracSpan(t, n); }
  function mx(h, t, n){ return h + '&nbsp;' + F.fracSpan(t, n); }
  // produktbråk-DISPLAY (täljare/nämnare kan vara uttryck som "11·5")
  function pf(num, den){ return '<span class="ovn-brak"><span class="ovn-brak-taljare ovn-num">' + num + '</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare ovn-num">' + den + '</span></span>'; }

  // ── motor-lokal CANONICAL-cell: stående bråk (+ ev. hel) med UTTRYCK i täljare/nämnare (evalArith) ──
  function fracInner(){ return '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ak8-in fr-ruta ak8-bt" inputmode="text" autocomplete="off"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ak8-in fr-ruta ak8-bn" inputmode="text" autocomplete="off"></span></span>'; }
  function bcell(role, mixed){ return '<span class="ak8-bc' + (mixed ? ' ak8-mcx' : '') + '" data-r="' + role + '">' + (mixed ? '<input class="ak8-in ak8-mh" inputmode="text" autocomplete="off">' : '') + fracInner() + '</span>'; }
  function bread(scope, role){
    var c = scope.querySelector('.ak8-bc[data-r="' + role + '"]'); if(!c) return { num: NaN };
    var t = evalA(c.querySelector('.ak8-bt').value), n = evalA(c.querySelector('.ak8-bn').value);
    var mh = c.querySelector('.ak8-mh'), hasHel = !!(mh && mh.value.trim() !== ''), h = hasHel ? evalA(mh.value) : 0;
    return { hel: h, t: t, n: n, hasHel: hasHel, num: (isFinite(t) && isFinite(n) && n !== 0 && isFinite(h)) ? h + t / n : NaN };
  }
  function finOk(r, fin){
    var proper = isFinite(r.t) && isFinite(r.n) && Math.abs(r.t) < Math.abs(r.n) && gcd(r.t, r.n) === 1;
    if(fin.k === 'mi') return r.hasHel && proper;
    if(fin.k === 'br') return !r.hasHel && proper;
    return false;
  }

  // ── slutform-fabriker (delade LR-formatet) ──
  function MI(h, t, n){ return { k: 'mi', h: h, t: t, n: n }; }
  function BR(t, n){ return { k: 'br', t: t, n: n }; }
  function DE(x){ return { k: 'dec', x: x }; }
  function finText(fin){ return fin.k === 'dec' ? String(fin.x).replace('.', ',') : fin.k === 'br' ? fin.t + '/' + fin.n : fin.h + ' ' + fin.t + '/' + fin.n; }
  // rad-fabriker
  function KAN(q, v, cells){ return { typ: 'kan', q: q, v: v[0] / v[1], cells: cells }; }   // cells: [{m:bool}...]; sista = fin (fin-obj)
  function EQ(q, v, fin){ return { typ: 'eq', q: q, v: v[0] / v[1], fin: fin }; }
  function G(rubrik, rader, hint){ return { rubrik: rubrik, rader: rader, hint: hint }; }

  // ══════════════════════════ BLAD 1 ══════════════════════════
  var BLAD1 = { key: 'B1', titel: 'Multiplikation med bråk', uppg: [
    G('Beräkna – visa ett mellanled, svara i blandad form', [
      KAN('5 · ' + fr(3,4), [15,4], [{}, { m:true, fin: MI(3,3,4) }]),
      KAN('3 · ' + fr(3,7), [9,7], [{}, { m:true, fin: MI(1,2,7) }]),
      KAN('7 · ' + fr(5,8), [35,8], [{}, { m:true, fin: MI(4,3,8) }])
    ]),
    G('Beräkna – visa mellanled och svara i enklaste form', [
      KAN(fr(2,3) + ' · ' + fr(2,3), [4,9], [{}, { fin: BR(4,9) }]),
      KAN(fr(3,7) + ' · ' + fr(2,5), [6,35], [{}, { fin: BR(6,35) }]),
      KAN(fr(5,6) + ' · ' + fr(4,7), [10,21], [{}, {}, { fin: BR(10,21) }]),
      KAN(fr(5,8) + ' · ' + fr(7,9), [35,72], [{}, { fin: BR(35,72) }])
    ], 'Skriv mellanledet som (täljare·täljare)/(nämnare·nämnare) – du får skriva produkten i rutorna.'),
    G('Förkorta och beräkna', [
      EQ(pf('11·5','10'), [11,2], MI(5,1,2)),
      EQ(pf('20','12·3'), [5,9], BR(5,9)),
      EQ(pf('20·7','15'), [28,3], MI(9,1,3)),
      EQ(pf('5·12','18'), [10,3], MI(3,1,3))
    ], 'Fri väg: förkorta (korsförkorta) innan du multiplicerar, i valfri ordning. Varje led måste vara lika med uttrycket, sista ledet svaret i enklaste form.'),
    G('Beräkna – ta bort ett mellanled, räkna i huvudet, svara i enklaste form', [
      EQ(fr(7,9) + ' · 6', [14,3], MI(4,2,3)),
      EQ(fr(4,11) + ' · ' + fr(5,7), [20,77], BR(20,77)),
      EQ('4 · ' + fr(12,7), [48,7], MI(6,6,7)),
      EQ(fr(3,8) + ' · ' + fr(7,4), [21,32], BR(21,32))
    ], 'Räkna i huvudet – du får hoppa över mellanled. Skriv så många (eller få) led du vill, sista i enklaste form.'),
    G('Beräkna – svara i enklaste form', [
      KAN('2 · ' + mx(1,3,8), [11,4], [{ m:true }, { m:true, fin: MI(2,3,4) }]),
      KAN('4 · ' + mx(2,4,5), [56,5], [{ m:true }, { m:true, fin: MI(11,1,5) }]),
      KAN('5 · ' + mx(3,4,7), [125,7], [{ m:true }, { m:true, fin: MI(17,6,7) }])
    ]),
    G('Förkorta och beräkna', [
      EQ(fr(33,25) + ' · ' + fr(10,11), [6,5], MI(1,1,5)),
      EQ(fr(21,8) + ' · ' + fr(16,35), [6,5], MI(1,1,5)),
      EQ(fr(28,27) + ' · ' + fr(18,7), [8,3], MI(2,2,3)),
      EQ(fr(5,18) + ' · ' + fr(63,25), [7,10], BR(7,10))
    ], 'Korsförkorta i valfri ordning innan du multiplicerar. Fri väg – varje led lika med uttrycket, svaret i enklaste form.')
  ] };

  // ══════════════════════════ BLAD 2 ══════════════════════════
  var BLAD2 = { key: 'B2', titel: 'Multiplikation med bråk – blad 2', uppg: [
    G('Beräkna – visa mellanled och förenkla innan beräkning, svara i enklaste form', [
      EQ(mx(1,1,8) + ' · ' + mx(1,7,9), [2,1], DE(2)),
      EQ(mx(2,1,4) + ' · ' + mx(1,1,3), [3,1], DE(3)),
      EQ(mx(3,1,2) + ' · ' + mx(4,2,7), [15,1], DE(15))
    ], 'Gör om till oäkta bråk, förenkla (korsförkorta) innan du multiplicerar. Fri väg.'),
    G('Förkorta och beräkna', [
      EQ(fr(4,5) + ' · ' + fr(10,21) + ' · ' + fr(7,12), [2,9], BR(2,9)),
      EQ(fr(11,4) + ' · ' + fr(9,33) + ' · ' + fr(16,5), [12,5], MI(2,2,5)),
      EQ(fr(15,8) + ' · ' + fr(2,7) + ' · ' + fr(14,9), [5,6], BR(5,6))
    ], 'Tre faktorer – korsförkorta över alla täljare och nämnare innan du multiplicerar.'),
    G('Beräkna – visa mellanled, förenkla innan beräkning, svara i enklaste form', [
      EQ(mx(5,2,5) + ' · ' + mx(6,2,3), [36,1], DE(36)),
      EQ(mx(1,3,7) + ' · ' + mx(4,1,5), [6,1], DE(6)),
      EQ(mx(3,2,3) + ' · ' + mx(7,1,8), [209,8], MI(26,1,8))
    ], 'Gör om till oäkta bråk, förenkla innan du multiplicerar. Fri väg.')
  ] };

  // ══════════════════════════ RENDER ══════════════════════════
  var CHECKS = [];
  var EQS = '<span class="ovn-text ak8-eq">=</span>';   // canonical använder EQS + bcell direkt; equality-kedjan använder AK8_UI.kedjaRadHTML
  function exprOf(scope, role){ return scope.querySelector('.ak8-cell[data-r="' + role + '"] .ak8-expr'); }

  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'kan'){
      CHECKS.push(function(el){
        var ok = true;
        r.cells.forEach(function(c, i){ var rd = bread(el, 'k' + i); if(!likhet(rd.num, r.v)) ok = false; if(c.fin && !finOk(rd, c.fin)) ok = false; });
        return { ok: ok, facit: 'svar: ' + finText(r.cells[r.cells.length - 1].fin) };
      });
      var html = '<div class="ak8-rad ak8-rad-kedja" data-idx="' + idx + '"><span class="ak8-q">' + r.q + '</span>';
      r.cells.forEach(function(c, i){ html += EQS + bcell('k' + i, !!c.m); });
      return html + '</div>';
    }
    // equality — DELAD kedje-helper (samma som d6 låna + division)
    CHECKS.push(function(el){
      var res = LR.provaKedja(AK8_UI.kedjaCeller(el), r.v, r.fin);
      return { ok: res.ok, facit: 'svar: ' + finText(r.fin) + ' (varje led = uttrycket)' };
    });
    return AK8_UI.kedjaRadHTML(idx, r.q);
  }

  function renderBlad(mount, blad){
    var html = '<div class="ovn-sheet"><h2>' + blad.titel + '</h2>';
    blad.uppg.forEach(function(g, gi){ html += '<div class="ovn-grupp">' + AK8_UI.renderGrupp(g, gi + 1, renderRad) + '</div>'; });
    html += '<div class="ovn-kontroll-rad"><button class="ovn-kontroll" data-kontroll>Kontrollera</button>'
      + '<button class="ovn-aterstall" data-reset>Återställ</button>' + AK8_UI.printKnappHTML() + '</div>'
      + '<div class="ovn-sammanf" data-sammanf hidden></div></div>';
    html += AK8_UI.keypadHTML({ builders: true, ops: ['+', '−', '·', '/', ','] });
    mount.innerHTML = html;
    // "+ led" (fri kedja) wiras i AK8_UI.bindSheet — ingen lokal wiring behövs.
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount); };
    mount.querySelector('[data-reset]').onclick = function(){ CHECKS = []; renderBlad(mount, blad); };
    AK8_UI.bindSheet(mount);
  }

  function kontrollera(mount){
    var rader = mount.querySelectorAll('.ak8-rad[data-idx]'), tot = 0, ratt = 0;
    rader.forEach(function(el){
      var res = CHECKS[+el.dataset.idx](el);
      if(!AK8_UI.besvarad(el)) return;   // obesvarad ruta räknas ej
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

  window.BLAD_AK8_D7 = { BLAD1: BLAD1, BLAD2: BLAD2, renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, key === 'B2' ? BLAD2 : BLAD1); } };
})();
