/* blad-ak8-d7.js — Åk8 kapitel 1, delkapitel 6 (Räkna med bråk): Multiplikation.
   Två Öva-blad, exakt-författade ur "Multiplikation med bråk.docx" (läst strukturellt ur
   document.xml/m:f; alla facit oberoende omräknade, 0 fel). Ärver åk7 k2.

   EN rättnings-modell (Joachim 2026-09-15, samma som d6): ALLA rader är en FRI KEDJA via delade
   AK8_UI.kedjaRadHTML + Likhetsrattare.provaKedja — path-fritt, korsförkorta i valfri ordning.
   Startläge ett mellanled + svar, "+ led" ger fler. Minst ett ifyllt mellanled före svaret (antal ≥ 2),
   utom där uppgiften uttryckligen säger att man får hoppa över det (G4, fri:true).
   Förr hade G1/G2/G5 FASTA produktbråk-celler (en stående bråkcell per led): eleven kunde inte skriva
   2 · 11/8 som första steg för 2 · 1 3/8, och G2 rad c hade tre celler mot syskonens två — det var fel.
   Bråk som stående bråk (bråk-byggaren). De 2 ordproblemen (Nils/får) byggs EJ här (problemlösning). */
(function(){
  'use strict';
  var F = window, LR = window.Likhetsrattare;
  function fr(t, n){ return F.fracSpan(t, n); }
  function mx(h, t, n){ return h + '&nbsp;' + F.fracSpan(t, n); }
  // produktbråk-DISPLAY (täljare/nämnare kan vara uttryck som "11·5")
  function pf(num, den){ return '<span class="ovn-brak"><span class="ovn-brak-taljare ovn-num">' + num + '</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare ovn-num">' + den + '</span></span>'; }

  // ── slutform-fabriker (delade LR-formatet) ──
  function MI(h, t, n){ return { k: 'mi', h: h, t: t, n: n }; }
  function BR(t, n){ return { k: 'br', t: t, n: n }; }
  function DE(x){ return { k: 'dec', x: x }; }
  function finText(fin){ return fin.k === 'dec' ? String(fin.x).replace('.', ',') : fin.k === 'br' ? fin.t + '/' + fin.n : fin.h + ' ' + fin.t + '/' + fin.n; }
  // rad-fabrik: fri kedja. min = minsta antal ifyllda led (2 = ett mellanled + svar); {fri:true} → 1 (får hoppa över).
  function EQ(q, v, fin, opts){ return { typ: 'eq', q: q, v: v[0] / v[1], fin: fin, min: (opts && opts.fri) ? 1 : 2 }; }
  // opts.svarform = SVARSFORMEN gruppen kräver ('blandad'|'brak'|'decimal'); utelämnad = 'enklaste' (båda formerna).
  // Kravet bor i DATAN (gruppen), inte i rubriktexten — rättaren läser inte rubriker. (Order 2026-09-15.)
  function G(rubrik, rader, hint, opts){ var sf = opts && opts.svarform; if(sf) rader.forEach(function(r){ r.svarform = sf; }); return { rubrik: rubrik, rader: rader, hint: hint, svarform: sf || 'enklaste' }; }
  var FRI = { fri: true };

  // ══════════════════════════ BLAD 1 ══════════════════════════
  var BLAD1 = { key: 'B1', titel: 'Multiplikation med bråk', uppg: [
    G('Beräkna – visa ett mellanled, svara i blandad form', [
      EQ('5 · ' + fr(3,4), [15,4], MI(3,3,4)),
      EQ('3 · ' + fr(3,7), [9,7], MI(1,2,7)),
      EQ('7 · ' + fr(5,8), [35,8], MI(4,3,8))
    ], null, { svarform: 'blandad' }),   // "svara i blandad form" — 15/4 ger 'form', inte rätt (Joachim 2026-09-15)
    G('Beräkna – visa mellanled och svara i enklaste form', [
      EQ(fr(2,3) + ' · ' + fr(2,3), [4,9], BR(4,9)),
      EQ(fr(3,7) + ' · ' + fr(2,5), [6,35], BR(6,35)),
      EQ(fr(5,6) + ' · ' + fr(4,7), [10,21], BR(10,21)),
      EQ(fr(5,8) + ' · ' + fr(7,9), [35,72], BR(35,72))
    ], 'Skriv mellanledet som (täljare·täljare)/(nämnare·nämnare) – du får skriva produkten i rutorna.'),
    G('Förkorta och beräkna', [
      EQ(pf('11·5','10'), [11,2], MI(5,1,2)),
      EQ(pf('20','12·3'), [5,9], BR(5,9)),
      EQ(pf('20·7','15'), [28,3], MI(9,1,3)),
      EQ(pf('5·12','18'), [10,3], MI(3,1,3))
    ], 'Fri väg: förkorta (korsförkorta) innan du multiplicerar, i valfri ordning. Varje led måste vara lika med uttrycket, sista ledet svaret i enklaste form.'),
    G('Beräkna – ta bort ett mellanled, räkna i huvudet, svara i enklaste form', [
      EQ(fr(7,9) + ' · 6', [14,3], MI(4,2,3), FRI),
      EQ(fr(4,11) + ' · ' + fr(5,7), [20,77], BR(20,77), FRI),
      EQ('4 · ' + fr(12,7), [48,7], MI(6,6,7), FRI),
      EQ(fr(3,8) + ' · ' + fr(7,4), [21,32], BR(21,32), FRI)
    ], 'Räkna i huvudet – du får hoppa över mellanled. Skriv så många (eller få) led du vill, sista i enklaste form.'),
    G('Beräkna – svara i enklaste form', [
      EQ('2 · ' + mx(1,3,8), [11,4], MI(2,3,4)),
      EQ('4 · ' + mx(2,4,5), [56,5], MI(11,1,5)),
      EQ('5 · ' + mx(3,4,7), [125,7], MI(17,6,7))
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
  var TEXT = { mellanled: { hint: '— visa ett mellanled före svaret' }, led: { hint: ' (varje led = uttrycket)' } };   // elevtext som fält (samma som d6)
  var CHECKS = [];

  function renderRad(r){
    var idx = CHECKS.length;
    // FRI kedja (DELAD kedje-helper, samma som d6 + division): varje ifyllt led = radens värde, sista = svaret i rätt form.
    CHECKS.push(function(el){
      var res = LR.provaKedja(AK8_UI.kedjaCeller(el), r.v, r.fin, r.svarform);
      var ok = res.ok && res.antal >= r.min;
      var facit = 'svar: ' + finText(r.fin) + (res.ok && res.antal < r.min ? ' ' + TEXT.mellanled.hint : (res.antal ? TEXT.led.hint : ''));
      return { ok: ok, facit: facit, besked: res.status === 'form' ? LR.besked(res.orsak) : '' };   // rätt värde, fel form → eget besked
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
      tot++;
      if(!AK8_UI.besvarad(el)) return;   // tom ruta = obesvarad: räknad i nämnaren men ej markerad/rättad/ratt (full pott kräver att ALLA rutor är besvarade + rätta)
      el.querySelectorAll('.ak8-in').forEach(function(i){ if(i.closest('.ak8-extra')) return; i.classList.add(res.ok ? 'ak8-ok' : 'ak8-fel'); });
      AK8_UI.markera(el, res.ok);
      if(res.ok){ ratt++; }
      else if(!el.querySelector('.ak8-fasit')){ var f = document.createElement('span'); f.className = 'ak8-fasit'; f.textContent = (res.besked ? res.besked + ' ' : '') + 'rätt ' + res.facit; el.appendChild(f); }
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
