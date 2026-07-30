/* blad-ak8-d8.js — Åk8 kapitel 1, delkapitel 7 (Räkna med bråk): Division. SISTA bråk-bladet.
   Två Öva-blad, exakt-författade ur "Division med bråk.docx" (läst strukturellt ur document.xml/m:f;
   alla facit oberoende omräknade, Joachim-justerade celler medtagna: 4 5/7=33/7, (4/7)÷6=2/21).

   Rättnings-modeller:
   · INVERTERA (skriva reciprok): fast cell, byt plats på täljare/nämnare (även algebraiskt 2x/y→y/2x) — sträng-swap.
   · CANONICAL (fasta rutor): heltal÷stambråk (heltals-svar), stambråk÷heltal (bråk-svar), bråk÷heltal,
     förlänga-/invertera-metoden (produktbråk-mellanled (a·d)/(b·c) via AK8_UI.evalArith, som mult).
   · EQUALITY via delade AK8_UI.kedjaRadHTML + Likhetsrattare (path-fritt): två-varianter (godtar båda metoder),
     förkorta-innan, blandad÷blandad, blandade räknesätt (mult/div/+/− blandat).
   Div visas med ÷; bråk stående. De 7 problemen byggs i FAS 3-fliken (PROB_RUTA). */
(function(){
  'use strict';
  var F = window, LR = window.Likhetsrattare;
  function evalA(s){ return AK8_UI.evalArith(s); }
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function likhet(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  function fr(t, n){ return F.fracSpan(t, n); }
  function mx(h, t, n){ return h + '&nbsp;' + F.fracSpan(t, n); }
  function pfDisp(tj, nm){ return '<span class="ovn-brak"><span class="ovn-brak-taljare ovn-num">' + tj + '</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare ovn-num">' + nm + '</span></span>'; }

  // ── motor-lokala CANONICAL-celler (produktbråk via evalArith; blandad; INVERTERA-reciprok som strängar) ──
  function fracInner(cls){ return '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ak8-in fr-ruta ' + cls + 't" inputmode="text" autocomplete="off"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ak8-in fr-ruta ' + cls + 'n" inputmode="text" autocomplete="off"></span></span>'; }
  function bcell(role, mixed){ return '<span class="ak8-bc' + (mixed ? ' ak8-mcx' : '') + '" data-r="' + role + '">' + (mixed ? '<input class="ak8-in ak8-mh" inputmode="text" autocomplete="off">' : '') + fracInner('ak8-b') + '</span>'; }
  function bread(scope, role){
    var c = scope.querySelector('.ak8-bc[data-r="' + role + '"]'); if(!c) return { num: NaN };
    var t = evalA(c.querySelector('.ak8-bt').value), n = evalA(c.querySelector('.ak8-bn').value);
    var mh = c.querySelector('.ak8-mh'), hasHel = !!(mh && mh.value.trim() !== ''), h = hasHel ? evalA(mh.value) : 0;
    return { hel: h, t: t, n: n, hasHel: hasHel, num: (isFinite(t) && isFinite(n) && n !== 0 && isFinite(h)) ? h + t / n : NaN };
  }
  function bstr(scope, role){ var c = scope.querySelector('.ak8-bc[data-r="' + role + '"]'); return { t: c.querySelector('.ak8-bt').value.replace(/\s/g, ''), n: c.querySelector('.ak8-bn').value.replace(/\s/g, '') }; }
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
  function INV(tj, nm){ return { typ: 'inv', tj: String(tj), nm: String(nm) }; }        // skriva reciprok (byt plats)
  function KAN(q, v, cells){ return { typ: 'kan', q: q, v: v[0] / v[1], cells: cells }; }  // cells: [{t:'p'|'b'|'m'|'i', fin?}]
  function EQ(q, v, fin){ return { typ: 'eq', q: q, v: v[0] / v[1], fin: fin }; }
  function G(rubrik, rader, hint){ return { rubrik: rubrik, rader: rader, hint: hint }; }

  // ══════════════════════════ BLAD 1 ══════════════════════════
  var BLAD1 = { key: 'B1', titel: 'Division med bråk', uppg: [
    G('Invertera följande tal (skriv det inverterade talet)', [
      INV('4', '7'), INV('6', '13'), INV('2x', 'y')
    ], 'Byt plats på täljare och nämnare. Algebraiskt: 2x/y blir y/2x.'),
    G('Beräkna', [
      KAN('4 ÷ ' + fr(1,3), [12,1], [{ t:'i', fin: DE(12) }]),
      KAN('7 ÷ ' + fr(1,5), [35,1], [{ t:'i', fin: DE(35) }]),
      KAN('3 ÷ ' + fr(1,9), [27,1], [{ t:'i', fin: DE(27) }])
    ]),
    G('Beräkna', [
      KAN(fr(1,3) + ' ÷ 4', [1,12], [{ t:'b', fin: BR(1,12) }]),
      KAN(fr(1,5) + ' ÷ 6', [1,30], [{ t:'b', fin: BR(1,30) }]),
      KAN(fr(1,7) + ' ÷ 8', [1,56], [{ t:'b', fin: BR(1,56) }])
    ]),
    G('Beräkna med metoden förlänga – visa mellanled, svara i enklaste form', [
      KAN(fr(4,5) + ' ÷ ' + fr(2,3), [6,5], [{ t:'p' }, { t:'m', fin: MI(1,1,5) }]),
      KAN(fr(3,4) + ' ÷ ' + fr(5,6), [9,10], [{ t:'p' }, { t:'b', fin: BR(9,10) }]),
      KAN(fr(3,5) + ' ÷ ' + fr(2,7), [21,10], [{ t:'p' }, { t:'m', fin: MI(2,1,10) }])
    ], 'Förläng så nämnaren blir 1 → täljaren blir (täljare·inverterade nämnaren). Skriv produkten i mellanledet.'),
    G('Beräkna med metoden invertera – visa mellanled, svara i enklaste form', [
      KAN(fr(3,5) + ' ÷ ' + fr(6,7), [7,10], [{ t:'p' }, { t:'b', fin: BR(7,10) }]),
      KAN(fr(5,6) + ' ÷ ' + fr(3,8), [20,9], [{ t:'p' }, { t:'m', fin: MI(2,2,9) }]),
      KAN(fr(7,3) + ' ÷ ' + fr(5,7), [49,15], [{ t:'p' }, { t:'m', fin: MI(3,4,15) }])
    ], 'Invertera nämnaren och multiplicera: (täljare·täljare)/(nämnare·nämnare) i mellanledet.')
  ] };

  // ══════════════════════════ BLAD 2 ══════════════════════════
  var BLAD2 = { key: 'B2', titel: 'Division med bråk – blad 2', uppg: [
    G('Beräkna – visa mellanled (två varianter går bra)', [
      EQ('4 ÷ ' + fr(2,3), [6,1], DE(6)),
      EQ('5 ÷ ' + fr(2,7), [35,2], MI(17,1,2)),
      EQ('6 ÷ ' + fr(3,8), [16,1], DE(16))
    ], 'Två giltiga vägar: som facit, ELLER gör heltalet till bråk (4 = 4/1) och räkna som i femman. Båda godtas.'),
    G('Beräkna', [
      KAN(fr(3,4) + ' ÷ 2', [3,8], [{ t:'b', fin: BR(3,8) }]),
      KAN(fr(4,7) + ' ÷ 6', [2,21], [{ t:'b', fin: BR(2,21) }]),
      KAN(fr(3,8) + ' ÷ 4', [3,32], [{ t:'b', fin: BR(3,32) }])
    ]),
    G('Beräkna – visa mellanled, förkorta innan beräkning', [
      EQ(fr(11,18) + ' ÷ ' + fr(44,27), [3,8], BR(3,8)),
      EQ(fr(7,13) + ' ÷ ' + fr(49,26), [2,7], BR(2,7))
    ], 'Invertera, korsförkorta innan du multiplicerar (fri väg).'),
    G('Beräkna – visa mellanled, svara i enklaste form', [
      EQ(mx(1,5,9) + ' ÷ ' + mx(1,1,6), [4,3], MI(1,1,3)),
      EQ(mx(2,3,4) + ' ÷ ' + mx(4,5,7), [7,12], BR(7,12)),
      EQ(mx(4,1,5) + ' ÷ ' + mx(3,3,8), [56,45], MI(1,11,45))
    ], 'Gör om till oäkta bråk, invertera och multiplicera (fri väg).'),
    G('Beräkna – blandade räknesätt', [
      EQ(mx(10,2,5) + ' · ' + mx(5,5,8) + ' − ' + fr(5,6) + ' ÷ ' + mx(1,2,3), [58,1], DE(58)),
      EQ(mx(4,3,5) + ' ÷ (' + mx(5,1,2) + ' + ' + mx(1,2,5) + ')', [2,3], BR(2,3))
    ], 'Tänk på räkneordningen: multiplikation och division före addition och subtraktion. Fri väg.')
  ] };

  // ══════════════════════════ RENDER ══════════════════════════
  var CHECKS = [];
  var EQS = '<span class="ovn-text ak8-eq">=</span>';
  function exprOf(scope, role){ return scope.querySelector('.ak8-cell[data-r="' + role + '"] .ak8-expr'); }

  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'inv'){
      CHECKS.push(function(el){
        var s = bstr(el, 'iv');
        return { ok: s.t === r.nm && s.n === r.tj, facit: 'svar: ' + r.nm + '/' + r.tj };
      });
      return '<div class="ak8-rad ak8-rad-kedja" data-idx="' + idx + '"><span class="ak8-q">' + pfDisp(r.tj, r.nm) + '</span>' + EQS + bcell('iv', false) + '</div>';
    }
    if(r.typ === 'kan'){
      CHECKS.push(function(el){
        var ok = true;
        r.cells.forEach(function(c, i){
          if(c.t === 'i'){ if(!LR.finalCheck(LR.finalForm(exprOf(el, 'k' + i)), c.fin)) ok = false; }
          else { var rd = bread(el, 'k' + i); if(!likhet(rd.num, r.v)) ok = false; if(c.fin && !finOk(rd, c.fin)) ok = false; }
        });
        return { ok: ok, facit: 'svar: ' + finText(r.cells[r.cells.length - 1].fin) };
      });
      var html = '<div class="ak8-rad ak8-rad-kedja" data-idx="' + idx + '"><span class="ak8-q">' + r.q + '</span>';
      r.cells.forEach(function(c, i){ html += EQS + (c.t === 'i' ? AK8_UI.ansCell('k' + i) : bcell('k' + i, c.t === 'm')); });
      return html + '</div>';
    }
    // equality — delad kedje-helper
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

  window.BLAD_AK8_D8 = { BLAD1: BLAD1, BLAD2: BLAD2, renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, key === 'B2' ? BLAD2 : BLAD1); } };
})();
