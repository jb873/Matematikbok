/* blad-ak8-d8.js — Åk8 kapitel 1, delkapitel 7 (Räkna med bråk): Division. SISTA bråk-bladet.
   Två Öva-blad, exakt-författade ur "Division med bråk.docx" (läst strukturellt ur document.xml/m:f;
   alla facit oberoende omräknade, Joachim-justerade celler medtagna: 4 5/7=33/7, (4/7)÷6=2/21).

   Rättnings-modeller:
   · INVERTERA (skriva reciprok): fast cell, byt plats på täljare/nämnare (även algebraiskt 2x/y→y/2x) — sträng-swap.
   · CANONICAL (fasta rutor): heltal÷stambråk (heltals-svar), stambråk÷heltal (bråk-svar), bråk÷heltal,
     förlänga-metoden (komplex-bråk-cell som mellanled, medvetet fast).
   · EQUALITY via delade AK8_UI.kedjaRadHTML + Likhetsrattare (path-fritt): invertera-metoden (blad 1 G5 —
     förr fast produktbråk-cell som inte rymde 3/5 · 7/6, det steg hinten ber om; Joachim 2026-09-15),
     två-varianter (godtar båda metoder), förkorta-innan, blandad÷blandad, blandade räknesätt.
     Minst ett ifyllt mellanled före svaret (antal ≥ 2), som d6/d7.
   Div visas som STAPLAT bråk (dv), aldrig ÷ (order 2026-09-21); bråk stående. De 7 problemen byggs i FAS 3-fliken (PROB_RUTA). */
(function(){
  'use strict';
  var F = window, LR = window.Likhetsrattare;
  function evalA(s){ return AK8_UI.evalArith(s); }
  function likhet(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  // fracSpan kommer ur blad-karna (öva-sidan). I testramen (ak8-k1-ram laddar d8 för talBank) finns den inte → samma
  // fyrradiga markup lokalt, så modulen kan laddas där utan blad-karna (vars avr/visaKonfetti kolliderar med ramens).
  function fracSpanLokal(t, n){ return '<span class="ovn-brak"><span class="ovn-brak-taljare">' + t + '</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare">' + n + '</span></span>'; }
  function fr(t, n){ return (F.fracSpan || fracSpanLokal)(t, n); }
  function mx(h, t, n){ return h + '&nbsp;' + fr(t, n); }
  // DIVISION SOM STAPLAT BRÅK (order 2026-09-21, Joachim: aldrig ÷ på ett enda ställe): täljaruttrycket över nämnaruttrycket,
  // även 4 över 1/3. Samma markup som färdighetsträningens komplexbråk (.ovn-kbrak), visningsvariant utan rutor.
  function dv(a, b){ return '<span class="ovn-kbrak ovn-kbrak-visa"><span class="ovn-kbrak-topp">' + a + '</span><span class="ovn-kbrak-streck"></span><span class="ovn-kbrak-botten">' + b + '</span></span>'; }
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

  // ── slutform-fabriker (delade LR-formatet) ──
  function MI(h, t, n){ return { k: 'mi', h: h, t: t, n: n }; }
  function BR(t, n){ return { k: 'br', t: t, n: n }; }
  function DE(x){ return { k: 'dec', x: x }; }
  function finText(fin){ return fin.k === 'dec' ? String(fin.x).replace('.', ',') : fin.k === 'br' ? fin.t + '/' + fin.n : fin.h + ' ' + fin.t + '/' + fin.n; }
  // rad-fabriker
  function INV(tj, nm){ return { typ: 'inv', tj: String(tj), nm: String(nm) }; }        // skriva reciprok (byt plats)
  function KAN(q, v, cells){ return { typ: 'kan', q: q, v: v[0] / v[1], cells: cells }; }  // cells: [{t:'b'|'m'|'i'|'e'|'kb', fin?}]  'e' = tom uttryckscell, värde-rättad (förlänga-metoden: eleven bygger komplexbråket själv med EN bråkknapp, order 2026-09-21; 'kb' = förrenderad fyrfälts-cell, kvar som form men oanvänd i d8)  ('p' produktbråk-cell utgått → EQ)
  // fri kedja. min = minsta antal ifyllda led (2 = ett mellanled + svar); {fri:true} → 1 (får hoppa över).
  function EQ(q, v, fin, opts){ return { typ: 'eq', q: q, v: v[0] / v[1], fin: fin, min: (opts && opts.fri) ? 1 : 2 }; }
  // opts.svarform = SVARSFORMEN gruppen kräver ('blandad'|'brak'|'decimal'); utelämnad = 'enklaste' (båda formerna).
  // Kravet bor i DATAN (gruppen), inte i rubriktexten — rättaren läser inte rubriker. (Order 2026-09-15.)
  // HJÄLPTEXTER BORT (order 2026-09-21): inga instruktioner under rubrikerna i öva — färdighetsträningen visar hur, i öva tänker eleven själv.

  function G(rubrik, rader, hint, opts){ var sf = opts && opts.svarform; if(sf) rader.forEach(function(r){ r.svarform = sf; }); return { rubrik: rubrik, rader: rader, hint: hint, svarform: sf || 'enklaste' }; }

  // ══════════════════════════ DATA — EN KÄLLA FÖR ÖVA OCH TEST (order 2026-09-21, FAS 5) ══════════════════════════
  // Talen som tupler. Raderna nedan OCH testets banker (talBank(nod) → ak8-k1-ram) byggs ur samma tupler, så
  // "inga tal i testet utan täckning i öva" är sant per konstruktion (som kvadratrötterna, FAS 4b). Facit räknas
  // ur tuplerna (h·n/t, t/(n·h), a·d/(b·c) …) och formen ur värdet: heltal → decimal, oäkta → blandad, äkta → bråk.
  var DATA = {
    reciprok:  [[4, 7], [6, 13], ['2x', 'y']],                                   // B1 g1 (algebra-raden bara i öva)
    hbStam:    [[4, 1, 3], [7, 1, 5], [3, 1, 9]],                                 // B1 g2: h över t/n (stambråk) → heltal
    bhStam:    [[1, 3, 4], [1, 5, 6], [1, 7, 8]],                                 // B1 g3: t/n över h → stambråk
    forlanga:  [[[4, 5], [2, 3]], [[3, 4], [5, 6]], [[3, 5], [2, 7]]],            // B1 g4: förlänga-metoden (komplexbråk byggt av eleven)
    invertera: [[[3, 5], [6, 7]], [[5, 6], [3, 8]], [[7, 3], [5, 7]]],            // B1 g5: invertera-metoden (fri kedja)
    hb:        [[4, 2, 3], [5, 2, 7], [6, 3, 8]],                                 // B2 g1: h över t/n (två varianter går bra)
    bh:        [[3, 4, 2], [4, 7, 6], [3, 8, 4]],                                 // B2 g2: t/n över h
    forkorta:  [[[11, 18], [44, 27]], [[7, 13], [49, 26]]],                       // B2 g3: förkorta innan beräkning
    blandad:   [[[1, 5, 9], [1, 1, 6]], [[2, 3, 4], [4, 5, 7]], [[4, 1, 5], [3, 3, 8]]],   // B2 g4: blandad över blandad
    prio:      [ { typ: 'mult-sub', A: [10, 2, 5], B: [5, 5, 8], C: [5, 6], D: [1, 2, 3] },   // B2 g5: A·B − C över D
                 { typ: 'div-sum',  A: [4, 3, 5],  B: [5, 1, 2], C: [1, 2, 5] } ]             //        A över (B + C)
  };
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  // slutform ur värdet t/n: förkortat; heltal → decimal, oäkta → blandad, äkta → bråk
  function fin(t, n){ var g = gcd(t, n); t /= g; n /= g; return n === 1 ? DE(t) : t > n ? MI(Math.floor(t / n), t % n, n) : BR(t, n); }
  function oakta(m){ return [m[0] * m[2] + m[1], m[2]]; }                      // [h,t,n] → [T,N]
  // rader ur tuplerna
  function radHB(x, typ){ var h = x[0], t = x[1], n = x[2], T = h * n, N = t, ff = fin(T, N);   // h ÷ t/n = h·n/t
    return typ === 'kan' ? KAN(dv(String(h), fr(t, n)), [T, N], [{ t: 'i', fin: ff }]) : EQ(dv(String(h), fr(t, n)), [T, N], ff); }
  function radBH(x){ var t = x[0], n = x[1], h = x[2]; return KAN(dv(fr(t, n), String(h)), [t, n * h], [{ t: 'b', fin: fin(t, n * h) }]); }   // t/n ÷ h = t/(n·h)
  function radBB(p, typ){ var a = p[0], b = p[1], T = a[0] * b[1], N = a[1] * b[0], ff = fin(T, N);   // a/b ÷ c/d = a·d/(b·c)
    return typ === 'forlanga' ? KAN(dv(fr(a[0], a[1]), fr(b[0], b[1])), [T, N], [{ t: 'e' }, { t: ff.k === 'mi' ? 'm' : 'b', fin: ff }]) : EQ(dv(fr(a[0], a[1]), fr(b[0], b[1])), [T, N], ff); }
  function radBlandad(p){ var A = oakta(p[0]), Bq = oakta(p[1]), T = A[0] * Bq[1], N = A[1] * Bq[0]; return EQ(dv(mx(p[0][0], p[0][1], p[0][2]), mx(p[1][0], p[1][1], p[1][2])), [T, N], fin(T, N)); }
  function prioVarde(x){   // exakt bråkräkning
    if(x.typ === 'mult-sub'){ var A = oakta(x.A), Bq = oakta(x.B), D = oakta(x.D); var P = [A[0] * Bq[0], A[1] * Bq[1]], Q = [x.C[0] * D[1], x.C[1] * D[0]]; return [P[0] * Q[1] - Q[0] * P[1], P[1] * Q[1]]; }
    var A2 = oakta(x.A), B2 = oakta(x.B), C2 = oakta(x.C); var S = [B2[0] * C2[1] + C2[0] * B2[1], B2[1] * C2[1]]; return [A2[0] * S[1], A2[1] * S[0]];
  }
  function radPrio(x){ var v = prioVarde(x), ff = fin(v[0], v[1]);
    var q = x.typ === 'mult-sub' ? mx(x.A[0], x.A[1], x.A[2]) + ' · ' + mx(x.B[0], x.B[1], x.B[2]) + ' − ' + dv(fr(x.C[0], x.C[1]), mx(x.D[0], x.D[1], x.D[2]))
                                 : dv(mx(x.A[0], x.A[1], x.A[2]), mx(x.B[0], x.B[1], x.B[2]) + ' + ' + mx(x.C[0], x.C[1], x.C[2]));
    return EQ(q, v, ff); }

  // ══════════════════════════ BLAD 1 ══════════════════════════
  var BLAD1 = { key: 'B1', titel: 'Division med bråk', uppg: [
    G('Invertera följande tal (skriv det inverterade talet)', DATA.reciprok.map(function(x){ return INV(x[0], x[1]); })),
    G('Beräkna', DATA.hbStam.map(function(x){ return radHB(x, 'kan'); })),
    G('Beräkna', DATA.bhStam.map(radBH)),
    G('Beräkna med metoden förlänga – visa mellanledet som staplat bråk, svara i enklaste form', DATA.forlanga.map(function(p){ return radBB(p, 'forlanga'); })),
    G('Beräkna med metoden invertera – visa mellanled, svara i enklaste form', DATA.invertera.map(function(p){ return radBB(p, 'eq'); }))
  ] };

  // ══════════════════════════ BLAD 2 ══════════════════════════
  var BLAD2 = { key: 'B2', titel: 'Division med bråk – blad 2', uppg: [
    G('Beräkna – visa mellanled (två varianter går bra)', DATA.hb.map(function(x){ return radHB(x, 'eq'); })),
    G('Beräkna', DATA.bh.map(radBH)),
    G('Beräkna – visa mellanled, förkorta innan beräkning', DATA.forkorta.map(function(p){ return radBB(p, 'eq'); })),
    G('Beräkna – visa mellanled, svara i enklaste form', DATA.blandad.map(radBlandad)),
    G('Beräkna – blandade räknesätt', DATA.prio.map(radPrio))
  ] };

  // talBank(nod) — TESTETS talkälla: samma tupler som raderna ovan (öva-täckning per konstruktion).
  //   brak-div-hb: [h,t,n] · brak-div-bh: [t,n,h] · brak-div-bb: {a,b} (+ blandad {A,B}, forkorta {a,b}) ·
  //   brak-div-reciprok / brak-div-inv: [t,n] (numeriska) · brak-div-bb:prio: prio-objekten med värde
  function talBank(nod){
    var k = String(nod).replace(/:rakna$/, '');
    if(k === 'brak-div-hb') return DATA.hbStam.concat(DATA.hb).map(function(x){ return { h: x[0], t: x[1], n: x[2] }; });
    if(k === 'brak-div-bh') return DATA.bhStam.concat(DATA.bh).map(function(x){ return { t: x[0], n: x[1], h: x[2] }; });
    if(k === 'brak-div-bb') return DATA.forlanga.concat(DATA.invertera).map(function(p){ return { a: p[0], b: p[1], slag: 'bb' }; })
      .concat(DATA.forkorta.map(function(p){ return { a: p[0], b: p[1], slag: 'forkorta' }; }))
      .concat(DATA.blandad.map(function(p){ return { A: p[0], B: p[1], a: oakta(p[0]), b: oakta(p[1]), slag: 'blandad' }; }));
    if(k === 'brak-div-reciprok' || k === 'brak-div-inv') return DATA.reciprok.filter(function(x){ return typeof x[0] === 'number'; }).map(function(x){ return { t: x[0], n: x[1] }; });
    if(k === 'brak-div-bb:prio') return DATA.prio.map(function(x){ var v = prioVarde(x), g = gcd(v[0], v[1]); return { typ: x.typ, A: x.A, B: x.B, C: x.C, D: x.D, T: v[0] / g, N: v[1] / g }; });
    return [];
  }

  // ══════════════════════════ RENDER ══════════════════════════
  var TEXT = { mellanled: { hint: '— visa ett mellanled före svaret' }, led: { hint: ' (varje led = uttrycket)' } };   // elevtext som fält (samma som d6/d7)
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
        var ok = true, besked = '';
        // Svarscellen rättas med den DELADE tre-läges-regeln (finalStatus + gruppens svarform) — förr en lokal
        // finOk som krävde blandad där resten av bladet godtog båda (två rättare på samma blad; Joachim 2026-09-15).
        function slut(ff, fin){ var st = LR.finalStatus(ff, fin, r.svarform); if(st.status !== 'ratt') ok = false; if(st.status === 'form') besked = LR.besked(st.orsak); }
        r.cells.forEach(function(c, i){
          if(c.t === 'i'){ slut(LR.finalForm(exprOf(el, 'k' + i)), c.fin); }
          else if(c.t === 'kb' || c.t === 'e'){ if(!likhet(LR.mixedEval(exprOf(el, 'k' + i)), r.v)) ok = false; }  // komplex-bråk / fritt uttryck = ett led, rättas på VÄRDE
          else { var rd = bread(el, 'k' + i); if(c.fin) slut(LR.ffAv(rd.hasHel ? rd.hel : null, rd.t, rd.n), c.fin); else if(!likhet(rd.num, r.v)) ok = false; }
        });
        return { ok: ok, facit: 'svar: ' + finText(r.cells[r.cells.length - 1].fin), besked: besked };
      });
      var html = '<div class="ak8-rad ak8-rad-kedja" data-idx="' + idx + '"><span class="ak8-q">' + r.q + '</span>';
      r.cells.forEach(function(c, i){ html += EQS + ((c.t === 'i' || c.t === 'e') ? AK8_UI.ansCell('k' + i) : c.t === 'kb' ? AK8_UI.komplexBrakCell('k' + i) : bcell('k' + i, c.t === 'm')); });
      return html + '</div>';
    }
    // equality — delad kedje-helper; minst r.min ifyllda led (mellanled + svar)
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
    html += AK8_UI.keypadHTML({ builders: true, komplex: true, ops: ['+', '−', '·', '/', ','] });
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

  window.BLAD_AK8_D8 = { BLAD1: BLAD1, BLAD2: BLAD2, DATA: DATA, talBank: talBank, renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, key === 'B2' ? BLAD2 : BLAD1); } };
})();
