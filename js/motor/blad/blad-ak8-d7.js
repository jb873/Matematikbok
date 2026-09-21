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
  // fracSpan ur blad-karna (öva-sidan); i testramen (laddar d7 för talBank) finns den inte → lokal fallback (som d8)
  function fracSpanLokal(t, n){ return '<span class="ovn-brak"><span class="ovn-brak-taljare">' + t + '</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare">' + n + '</span></span>'; }
  function fr(t, n){ return (F.fracSpan || fracSpanLokal)(t, n); }
  function mx(h, t, n){ return h + '&nbsp;' + fr(t, n); }
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
  // HJÄLPTEXTER BORT (order 2026-09-21): inga instruktioner under rubrikerna i öva — färdighetsträningen visar hur, i öva tänker eleven själv.

  function G(rubrik, rader, hint, opts){ var sf = opts && opts.svarform; if(sf) rader.forEach(function(r){ r.svarform = sf; }); return { rubrik: rubrik, rader: rader, hint: hint, svarform: sf || 'enklaste' }; }
  var FRI = { fri: true };

  // ══════════════════════════ DATA — EN KÄLLA FÖR ÖVA OCH TEST (order 2026-09-21, FAS 3) ══════════════════════════
  // Talen som tupler; raderna nedan OCH testets banker (talBank(nod) → ak8-k1-ram) byggs ur dem — täckning per
  // konstruktion (som division, d8). Facit räknas ur tuplerna, formen ur värdet (heltal → decimal, oäkta → blandad,
  // äkta → bråk); grupp 1 kräver blandad form (svarform), övriga enklaste form.
  var DATA = {
    hb:      [[5, 3, 4], [3, 3, 7], [7, 5, 8]],                                              // B1 g1: h · t/n, svar i blandad form
    bb:      [[[2, 3], [2, 3]], [[3, 7], [2, 5]], [[5, 6], [4, 7]], [[5, 8], [7, 9]]],        // B1 g2: bråk · bråk
    produkt: [{ t: [11, 5], n: [10] }, { t: [20], n: [12, 3] }, { t: [20, 7], n: [15] }, { t: [5, 12], n: [18] }],   // B1 g3: förkorta produktbråk
    huvud:   [{ k: 'bh', b: [7, 9], h: 6 }, { k: 'bb', a: [4, 11], b: [5, 7] }, { k: 'ho', h: 4, b: [12, 7] }, { k: 'bb', a: [3, 8], b: [7, 4] }],   // B1 g4: i huvudet (fri)
    hm:      [[2, [1, 3, 8]], [4, [2, 4, 5]], [5, [3, 4, 7]]],                                // B1 g5: h · blandad
    forkorta:[[[33, 25], [10, 11]], [[21, 8], [16, 35]], [[28, 27], [18, 7]], [[5, 18], [63, 25]]],   // B1 g6: förkorta och beräkna
    mm:      [[[1, 1, 8], [1, 7, 9]], [[2, 1, 4], [1, 1, 3]], [[3, 1, 2], [4, 2, 7]]],        // B2 g1: blandad · blandad
    tre:     [[[4, 5], [10, 21], [7, 12]], [[11, 4], [9, 33], [16, 5]], [[15, 8], [2, 7], [14, 9]]],   // B2 g2: tre faktorer
    mm2:     [[[5, 2, 5], [6, 2, 3]], [[1, 3, 7], [4, 1, 5]], [[3, 2, 3], [7, 1, 8]]]         // B2 g3: blandad · blandad
  };
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function fin(T, N){ var g = gcd(T, N); T /= g; N /= g; return N === 1 ? DE(T) : T > N ? MI(Math.floor(T / N), T % N, N) : BR(T, N); }
  function oakta(m){ return [m[0] * m[2] + m[1], m[2]]; }
  function prod(arr){ return arr.reduce(function(p, x){ return p * x; }, 1); }
  function radHB(x){ var T = x[0] * x[1], N = x[2]; return EQ(x[0] + ' · ' + fr(x[1], x[2]), [T, N], fin(T, N)); }
  function radBB(p){ var T = p[0][0] * p[1][0], N = p[0][1] * p[1][1]; return EQ(fr(p[0][0], p[0][1]) + ' · ' + fr(p[1][0], p[1][1]), [T, N], fin(T, N)); }
  function radProdukt(x){ var T = prod(x.t), N = prod(x.n); return EQ(pf(x.t.join('·'), x.n.join('·')), [T, N], fin(T, N)); }
  function radHuvud(x){
    if(x.k === 'bh') return EQ(fr(x.b[0], x.b[1]) + ' · ' + x.h, [x.b[0] * x.h, x.b[1]], fin(x.b[0] * x.h, x.b[1]), FRI);
    if(x.k === 'ho') return EQ(x.h + ' · ' + fr(x.b[0], x.b[1]), [x.h * x.b[0], x.b[1]], fin(x.h * x.b[0], x.b[1]), FRI);
    return EQ(fr(x.a[0], x.a[1]) + ' · ' + fr(x.b[0], x.b[1]), [x.a[0] * x.b[0], x.a[1] * x.b[1]], fin(x.a[0] * x.b[0], x.a[1] * x.b[1]), FRI);
  }
  function radHM(x){ var o = oakta(x[1]), T = x[0] * o[0], N = o[1]; return EQ(x[0] + ' · ' + mx(x[1][0], x[1][1], x[1][2]), [T, N], fin(T, N)); }
  function radMM(p){ var a = oakta(p[0]), b = oakta(p[1]), T = a[0] * b[0], N = a[1] * b[1]; return EQ(mx(p[0][0], p[0][1], p[0][2]) + ' · ' + mx(p[1][0], p[1][1], p[1][2]), [T, N], fin(T, N)); }
  function radTre(p){ var T = p[0][0] * p[1][0] * p[2][0], N = p[0][1] * p[1][1] * p[2][1]; return EQ(fr(p[0][0], p[0][1]) + ' · ' + fr(p[1][0], p[1][1]) + ' · ' + fr(p[2][0], p[2][1]), [T, N], fin(T, N)); }

  // ══════════════════════════ BLAD 1 ══════════════════════════
  var BLAD1 = { key: 'B1', titel: 'Multiplikation med bråk', uppg: [
    G('Beräkna – visa ett mellanled, svara i blandad form', DATA.hb.map(radHB), null, { svarform: 'blandad' }),   // "svara i blandad form" — 15/4 ger 'form', inte rätt (Joachim 2026-09-15)
    G('Beräkna – visa mellanled och svara i enklaste form', DATA.bb.map(radBB)),
    G('Förkorta och beräkna', DATA.produkt.map(radProdukt)),
    G('Beräkna – ta bort ett mellanled, räkna i huvudet, svara i enklaste form', DATA.huvud.map(radHuvud)),
    G('Beräkna – svara i enklaste form', DATA.hm.map(radHM)),
    G('Förkorta och beräkna', DATA.forkorta.map(radBB))
  ] };

  // ══════════════════════════ BLAD 2 ══════════════════════════
  var BLAD2 = { key: 'B2', titel: 'Multiplikation med bråk – blad 2', uppg: [
    G('Beräkna – visa mellanled och förenkla innan beräkning, svara i enklaste form', DATA.mm.map(radMM)),
    G('Förkorta och beräkna', DATA.tre.map(radTre)),
    G('Beräkna – visa mellanled, förenkla innan beräkning, svara i enklaste form', DATA.mm2.map(radMM))
  ] };

  // talBank(nod) — TESTETS talkälla: samma tupler som raderna ovan.
  //   brak-mult-rakna:    {slag:'hb',h,t,n} · {slag:'bb',a,b} · {slag:'huvud',…} · {slag:'blandad',h,M} · {slag:'mm',A,B}
  //   brak-mult-forkorta: {slag:'produkt',t:[…],n:[…]} · {slag:'forkorta',a,b} · {slag:'tre',f:[a,b,c]}
  function talBank(nod){
    var k = String(nod).replace(/:rakna$/, '');
    if(k === 'brak-mult-rakna') return DATA.hb.map(function(x){ return { slag: 'hb', h: x[0], t: x[1], n: x[2] }; })
      .concat(DATA.bb.map(function(p){ return { slag: 'bb', a: p[0], b: p[1] }; }))
      .concat(DATA.huvud.map(function(x){ return x.k === 'bh' ? { slag: 'hb', h: x.h, t: x.b[0], n: x.b[1], ordning: 'bh' } : x.k === 'ho' ? { slag: 'hb', h: x.h, t: x.b[0], n: x.b[1] } : { slag: 'bb', a: x.a, b: x.b }; }))
      .concat(DATA.hm.map(function(x){ return { slag: 'blandad', h: x[0], M: x[1] }; }))
      .concat(DATA.mm.concat(DATA.mm2).map(function(p){ return { slag: 'mm', A: p[0], B: p[1] }; }));
    if(k === 'brak-mult-forkorta') return DATA.produkt.map(function(x){ return { slag: 'produkt', t: x.t, n: x.n }; })
      .concat(DATA.forkorta.map(function(p){ return { slag: 'forkorta', a: p[0], b: p[1] }; }))
      .concat(DATA.tre.map(function(p){ return { slag: 'tre', f: p }; }));
    return [];
  }

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

  window.BLAD_AK8_D7 = { BLAD1: BLAD1, BLAD2: BLAD2, DATA: DATA, talBank: talBank, renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, key === 'B2' ? BLAD2 : BLAD1); } };
})();
