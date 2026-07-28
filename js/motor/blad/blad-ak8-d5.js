/* blad-ak8-d5.js — Åk8 kapitel 1, delkapitel 4 (Räkna med bråk): Öva-blad.
   Ärver åk7 k2 (bråk). Exakt-författat ur TRANSKRIPTION-ak8-grunder-i-brak.md (facit verifierade).
   Återanvänder: ak8-blad-ui.js (keypad/grow/numrering/bindSheet/markera), blad-karna.js (fracSpan),
   svg-andel.js (andel-figurer, olikVar), svg-tallinje.js (tallinje). Bråk = STÅENDE bråk överallt.
   Svar-typer: BR (stående bråk, ev enklaste/exakt), MI (blandad form), FL (förläng-kedja),
   LK (likformiga — villkors-validering mot ekvivalens), OR (storleksordna/klicka-i-ordning),
   JM (jämföra >/< via korval), TL (tallinje A/B/C), AN (andel av figur), T (värde/decimal). */
(function(){
  'use strict';
  var F = window;                          // fracSpan ur blad-karna.js
  var A = window.SvgAndel, TLj = window.SvgTallinje;
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(/−/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }
  function ev(s){ return AK8_UI.evalArith(s); }
  function likhet(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function frac(t, n){ return F.fracSpan(t, n); }
  function mix(h, t, n){ return h + '&nbsp;' + F.fracSpan(t, n); }
  function dec(x){ return String(Math.round(x * 1e9) / 1e9).replace('.', ','); }

  // ── Stående bråk-svar (täljar/nämnar-rutor; uttryck tillåtna via evalArith) ──
  function bcellHTML(role){ return '<span class="ovn-brak ak8-bc" data-r="' + role + '"><span class="ovn-brak-taljare"><input class="ak8-in fr-ruta ak8-bt" inputmode="text" autocomplete="off"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ak8-in fr-ruta ak8-bn" inputmode="text" autocomplete="off"></span></span>'; }
  function bread(scope, role){ var c = scope.querySelector('.ak8-bc[data-r="' + role + '"]'); if(!c) return { num:NaN }; var t = ev(c.querySelector('.ak8-bt').value), n = ev(c.querySelector('.ak8-bn').value); return { t:t, n:n, num:(isFinite(t) && isFinite(n) && n !== 0) ? t / n : NaN }; }
  // Blandad form: hel-ruta + stående bråk
  function mcellHTML(){ return '<span class="ak8-mc"><input class="ak8-in ak8-mh" inputmode="text" autocomplete="off">' + bcellHTML('__m') + '</span>'; }
  function mread(scope){ var mh = pNum(scope.querySelector('.ak8-mh').value), b = bread(scope, '__m'); var h = isFinite(mh) ? mh : 0; return { hel:h, t:b.t, n:b.n, num:(isFinite(b.num)) ? h + b.num : NaN }; }

  // ── Fabriker ──
  function BR(fraga, t, n, opts){ return { typ:'br', fraga:fraga, t:t, n:n, opts:opts || {} }; }        // stående bråk-svar
  function MI(fraga, hel, t, n){ return { typ:'mi', fraga:fraga, hel:hel, t:t, n:n }; }                   // blandad form
  function FL(t0, n0, faktor, st, sn){ return { typ:'fl', t0:t0, n0:n0, faktor:faktor, st:st, sn:sn }; }  // förläng-kedja
  function LK(t0, n0){ return { typ:'lk', t0:t0, n0:n0 }; }                                               // två likformiga (ekvivalens)
  function OR(lista){ return { typ:'or', lista:lista }; }                                                 // storleksordna, klicka-i-ordning
  function JM(a, b){ return { typ:'jm', a:a, b:b }; }                                                     // jämföra > / <
  function TL(cfg, punkter){ return { typ:'tl', cfg:cfg, punkter:punkter }; }                            // tallinje A/B/C
  function AN(svg, t, n){ return { typ:'an', svg:svg, t:t, n:n }; }                                        // andel av figur
  function T(fraga, facit, suffix){ return { typ:'tal', fraga:fraga, facit:facit, suffix:suffix }; }       // värde/decimal
  function G(rubrik, rader, hint){ return { rubrik:rubrik, rader:rader, hint:hint }; }

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD — Räkna med bråk (grunder)
  // ══════════════════════════════════════════════════════════════════════════════════════
  var RAKNA = { nr:1, titel:'Räkna med bråk', nod:'brak-blandad', uppg:[
    G('Skriv som bråktal', [
      BR('2 med nämnaren 3', 6, 3, { exakt:true }), BR('5 med nämnaren 2', 10, 2, { exakt:true }), BR('3 med nämnaren 7', 21, 7, { exakt:true })
    ]),
    G('Skriv i bråkform, enklaste form', [
      BR('0,75', 3, 4, { enklast:true }), BR(mix(2, 4, 5), 14, 5, { enklast:true }), BR('0,6', 3, 5, { enklast:true }), BR(mix(7, 2, 3), 23, 3, { enklast:true }), BR('1,25', 5, 4, { enklast:true })
    ]),
    G('Skriv i blandad form, enklaste form', [
      MI(frac(9, 4), 2, 1, 4), MI('1,6', 1, 3, 5), MI(frac(22, 3), 7, 1, 3), MI('2,75', 2, 3, 4), MI(frac(19, 5), 3, 4, 5)
    ]),
    G('Skriv två likformiga bråk (samma värde, men förlängda)', [
      LK(1, 3), LK(4, 5), LK(2, 9)
    ], 'Likformiga = samma värde. Förläng täljare och nämnare med samma tal. Två olika räknas rätt om båda är lika med bråket.'),
    G('Skriv som timmar i bråkform, enklaste form', [
      BR('45 min =', 3, 4, { enklast:true, suffix:'h' }), BR('20 min =', 1, 3, { enklast:true, suffix:'h' }), BR('24 min =', 2, 5, { enklast:true, suffix:'h' })
    ]),
    G('Förkorta till enklaste form', [
      BR(frac(16, 24) + ' =', 2, 3, { enklast:true }), BR(frac(21, 36) + ' =', 7, 12, { enklast:true }), BR(frac(15, 35) + ' =', 3, 7, { enklast:true }), BR(frac(24, 42) + ' =', 4, 7, { enklast:true })
    ]),
    G('Förläng — visa mellanled', [
      FL(4, 5, 3, 12, 15), FL(3, 8, 5, 15, 40), FL(5, 3, 9, 45, 27), FL(7, 9, 6, 42, 54)
    ], 'Förläng med talet i parentesen: skriv (täljare·tal)/(nämnare·tal) i mellanledet, räkna ut svaret sist.'),
    G('Skriv som timmar i decimalform', [
      T('15 min =', 0.25, 'h'), T('3 h 12 min =', 3.2, 'h'), T('1 h 45 min =', 1.75, 'h'), T('4 h 6 min =', 4.1, 'h')
    ]),
    G('Storleksordna — klicka i ordning, börja med det minsta', [
      OR([[7, 13], [3, 8], [5, 7], [6, 12]]), OR([[4, 5], [3, 4], [2, 3], [5, 6]]), OR([[6, 5], [5, 4], [8, 7], [12, 11]])
    ]),
    G('Vilket bråk är störst? Klicka på rätt tecken', [
      JM([5, 8], [3, 4]), JM([11, 23], [17, 35]), JM([16, 21], [5, 7])
    ]),
    G('Tallinje — vilka bråk är A, B och C? (enklaste form)', [
      TL({ min:0, max:2, gridN:8 }, [{ namn:'A', t:5, n:8 }, { namn:'B', t:9, n:8 }, { namn:'C', t:15, n:8 }]),
      TL({ min:0, max:1, gridN:12 }, [{ namn:'A', t:1, n:6 }, { namn:'B', t:3, n:4 }, { namn:'C', t:5, n:6 }]),
      TL({ min:0, max:3, gridN:3 }, [{ namn:'A', t:2, n:3 }, { namn:'B', t:5, n:3 }, { namn:'C', t:8, n:3 }])
    ]),
    G('Hur stor andel av figuren är färgad? (enklaste form)', [
      AN(A.olikVar([1, 3], [1]), 3, 4), AN(A.olikVar([1, 1, 2, 2], [2]), 1, 3), AN(A.olikVar([1, 2, 1, 1], [1]), 2, 5)
    ], 'Delarna är olika stora — tänk på hur stor varje del är, räkna inte bara antalet delar.')
  ] };

  // ══════════════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════════════
  var CHECKS = [];
  function rad(inner, cls){ return '<div class="ak8-rad' + (cls ? ' ' + cls : '') + '">' + inner + '</div>'; }
  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'br'){
      CHECKS.push(function(el){
        var b = bread(el, 'sv'), mal = r.t / r.n, ok = likhet(b.num, mal);
        if(r.opts.exakt) ok = ok && likhet(b.t, r.t) && likhet(b.n, r.n);
        if(r.opts.enklast) ok = ok && isFinite(b.t) && isFinite(b.n) && gcd(Math.round(b.t), Math.round(b.n)) === 1;
        return { ok: ok, facit: r.t + '/' + r.n };
      });
      return rad('<span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + bcellHTML('sv') + (r.opts.suffix ? '<span class="ovn-text">&nbsp;' + r.opts.suffix + '</span>' : '') + '</span>');
    }
    if(r.typ === 'mi'){
      CHECKS.push(function(el){
        var m = mread(el.querySelector('.ak8-mc-wrap')), mal = r.hel + r.t / r.n;
        var ok = likhet(m.num, mal) && likhet(m.hel, r.hel) && isFinite(m.t) && isFinite(m.n) && m.t < m.n && m.t > 0;
        return { ok: ok, facit: r.hel + ' ' + r.t + '/' + r.n };
      });
      return rad('<span class="ak8-q">' + r.fraga + ' =</span><span class="ak8-svar" data-idx="' + idx + '"><span class="ak8-mc-wrap">' + mcellHTML() + '</span></span>');
    }
    if(r.typ === 'fl'){
      CHECKS.push(function(el){
        var mel = bread(el, 'mel'), sv = bread(el, 'sv'), mal = r.t0 / r.n0;
        var ok = likhet(mel.num, mal) && likhet(sv.t, r.st) && likhet(sv.n, r.sn);
        return { ok: ok, facit: r.t0 + '/' + r.n0 + ' = (' + r.t0 + '·' + r.faktor + ')/(' + r.n0 + '·' + r.faktor + ') = ' + r.st + '/' + r.sn };
      });
      var eq = '<span class="ovn-text ak8-eq">=</span>';
      return rad('<span class="ak8-q">' + frac(r.t0, r.n0) + '&nbsp;(förläng med ' + r.faktor + ')</span><span class="ak8-svar" data-idx="' + idx + '">' + eq + bcellHTML('mel') + eq + bcellHTML('sv') + '</span>', 'ak8-rad-kedja');
    }
    if(r.typ === 'lk'){
      CHECKS.push(function(el){
        var b1 = bread(el, 'l1'), b2 = bread(el, 'l2'), mal = r.t0 / r.n0;
        // villkors-validering: båda lika med bråket, förlängda (nämnare ≠ originalet) och olika sinsemellan
        var ok = likhet(b1.num, mal) && likhet(b2.num, mal) && b1.n !== r.n0 && b2.n !== r.n0 && !(likhet(b1.t, b2.t) && likhet(b1.n, b2.n));
        return { ok: ok, facit: '(t.ex. ' + (r.t0 * 2) + '/' + (r.n0 * 2) + ' och ' + (r.t0 * 3) + '/' + (r.n0 * 3) + ')' };
      });
      var eq = '<span class="ovn-text ak8-eq">=</span>';
      return rad('<span class="ak8-q">' + frac(r.t0, r.n0) + '</span><span class="ak8-svar" data-idx="' + idx + '">' + eq + bcellHTML('l1') + eq + bcellHTML('l2') + '</span>', 'ak8-rad-kedja');
    }
    if(r.typ === 'or'){
      var ideal = r.lista.map(function(p, i){ return { i:i, v:p[0] / p[1] }; }).sort(function(a, b){ return a.v - b.v; }).map(function(x){ return x.i; });
      CHECKS.push(function(el){
        var valda = [].slice.call(el.querySelectorAll('.ak8-tal.sel')).sort(function(a, b){ return (+a.querySelector('.ak8-ordnr').textContent) - (+b.querySelector('.ak8-ordnr').textContent); });
        if(valda.length !== r.lista.length) return { ok:false, facit: ideal.map(function(i){ return r.lista[i][0] + '/' + r.lista[i][1]; }).join(' < '), ordna:true };
        var ok = valda.every(function(b, k){ return (+b.dataset.i) === ideal[k]; });
        return { ok: ok, facit: ideal.map(function(i){ return r.lista[i][0] + '/' + r.lista[i][1]; }).join(' < '), ordna:true };
      });
      var knappar = r.lista.map(function(p, i){ return '<button type="button" class="ak8-tal" data-i="' + i + '">' + frac(p[0], p[1]) + '<span class="ak8-ordnr"></span></button>'; }).join('');
      return rad('<span class="ak8-svar" data-idx="' + idx + '"><span class="ak8-ordna">' + knappar + '</span></span>');
    }
    if(r.typ === 'jm'){
      var ratt = (r.a[0] / r.a[1] < r.b[0] / r.b[1]) ? 0 : 1;   // 0 = '<', 1 = '>'
      CHECKS.push(function(el){ var s = el.querySelector('.ak8-korval.sel'); return { ok: !!s && (+s.dataset.i) === ratt, facit: ratt === 0 ? '<' : '>', korval:true }; });
      var knappar = ['<', '>'].map(function(a, i){ return '<button type="button" class="ak8-tal ak8-korval" data-i="' + i + '">' + a + '</button>'; }).join('');
      return rad('<span class="ak8-q">' + frac(r.a[0], r.a[1]) + '</span><span class="ak8-svar" data-idx="' + idx + '"><span class="ak8-ordna">' + knappar + '</span></span><span class="ak8-q">' + frac(r.b[0], r.b[1]) + '</span>');
    }
    if(r.typ === 'tl'){
      CHECKS.push(function(el){
        var ok = true; r.punkter.forEach(function(p){ var b = bread(el, p.namn); if(!likhet(b.num, p.t / p.n) || gcd(Math.round(b.t), Math.round(b.n)) !== 1) ok = false; });
        return { ok: ok, facit: r.punkter.map(function(p){ return p.namn + '=' + p.t + '/' + p.n; }).join(' · ') };
      });
      var etik = []; for(var v = r.cfg.min; v <= r.cfg.max; v++) etik.push(v);
      var svg = TLj.linje({ min:r.cfg.min, max:r.cfg.max, steg:1 / r.cfg.gridN, etiketter:etik, punkter:r.punkter.map(function(p){ return { v:p.t / p.n, namn:p.namn }; }) });
      var rutor = r.punkter.map(function(p){ return '<span class="ak8-tl-svar"><b>' + p.namn + '</b> = ' + bcellHTML(p.namn) + '</span>'; }).join('');
      return rad('<span class="ak8-svar" data-idx="' + idx + '"><div class="ak8-tallinje">' + svg + '</div><div class="ak8-tl-rad">' + rutor + '</div></span>', 'ak8-rad-fig');
    }
    if(r.typ === 'an'){
      CHECKS.push(function(el){
        var b = bread(el, 'sv'), ok = likhet(b.num, r.t / r.n) && gcd(Math.round(b.t), Math.round(b.n)) === 1;
        return { ok: ok, facit: r.t + '/' + r.n };
      });
      return rad('<span class="ak8-svar" data-idx="' + idx + '"><span class="ak8-andel-fig">' + r.svg + '</span><span class="ak8-andel-svar">Andel = ' + bcellHTML('sv') + '</span></span>', 'ak8-rad-fig');
    }
    if(r.typ === 'tal'){
      CHECKS.push(function(el){ return { ok: likhet(pNum(el.querySelector('.ak8-in').value), r.facit), facit: dec(r.facit) + (r.suffix ? ' ' + r.suffix : '') }; });
      return rad('<span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '"><input class="ak8-in" inputmode="text" autocomplete="off">' + (r.suffix ? '<span class="ovn-text">&nbsp;' + r.suffix + '</span>' : '') + '</span>');
    }
    return '';
  }

  function renderBlad(mount, blad){
    var html = '<div class="ovn-sheet"><h2>' + blad.titel + '</h2>';
    blad.uppg.forEach(function(g, gi){ html += '<div class="ovn-grupp">' + AK8_UI.renderGrupp(g, gi + 1, renderRad) + '</div>'; });
    html += '<div class="ovn-kontroll-rad"><button class="ovn-kontroll" data-kontroll>Kontrollera</button>'
      + '<button class="ovn-aterstall" data-reset>Återställ</button>' + AK8_UI.printKnappHTML() + '</div>'
      + '<div class="ovn-sammanf" data-sammanf hidden></div></div>';
    html += AK8_UI.keypadHTML({ builders:false, ops:['+', '−', '·', '/', ','] });
    mount.innerHTML = html;
    // ordna: klicka-i-ordning (stämpla sekvensnummer). korval: enkelval.
    mount.querySelectorAll('.ak8-ordna').forEach(function(grid){
      grid.querySelectorAll('.ak8-tal:not(.ak8-korval)').forEach(function(btn){
        btn.onclick = function(){
          if(btn.classList.contains('sel')){ btn.classList.remove('sel'); btn.querySelector('.ak8-ordnr').textContent = '';
            [].slice.call(grid.querySelectorAll('.ak8-tal.sel')).sort(function(a, b){ return (+a.querySelector('.ak8-ordnr').textContent) - (+b.querySelector('.ak8-ordnr').textContent); }).forEach(function(t, i){ t.querySelector('.ak8-ordnr').textContent = (i + 1); });
          } else { btn.classList.add('sel'); btn.querySelector('.ak8-ordnr').textContent = grid.querySelectorAll('.ak8-tal.sel').length; }
        };
      });
      grid.querySelectorAll('.ak8-korval').forEach(function(btn){ btn.onclick = function(){ grid.querySelectorAll('.ak8-korval').forEach(function(b){ b.classList.toggle('sel', b === btn); }); }; });
    });
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount); };
    mount.querySelector('[data-reset]').onclick = function(){ CHECKS = []; renderBlad(mount, blad); };
    AK8_UI.bindSheet(mount);
  }

  function kontrollera(mount){
    var svar = mount.querySelectorAll('.ak8-svar[data-idx]'), tot = 0, ratt = 0;
    svar.forEach(function(el){
      var res = CHECKS[+el.dataset.idx](el);
      tot++;
      if(res.korval){ var s = el.querySelector('.ak8-korval.sel'); if(s) s.classList.add(res.ok ? 'ratt' : 'fel'); }
      else if(res.ordna){ el.querySelector('.ak8-ordna').classList.add(res.ok ? 'ak8-ok-ram' : 'ak8-fel-ram'); }
      else { el.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.add(res.ok ? 'ak8-ok' : 'ak8-fel'); }); }
      AK8_UI.markera(el.closest('.ak8-rad') || el, res.ok);
      if(res.ok){ ratt++; }
      else if(!el.querySelector('.ak8-fasit')){ var f = document.createElement('span'); f.className = 'ak8-fasit'; f.innerHTML = 'rätt: ' + res.facit; (el.closest('.ak8-rad') || el).appendChild(f); }
    });
    var s = mount.querySelector('[data-sammanf]'); s.hidden = false;
    if(ratt === tot && tot > 0){
      s.className = 'ovn-sammanf ok';
      s.innerHTML = '<span class="ovn-sammanf-icon">✓</span><span class="ovn-sammanf-titel">Allt rätt!</span>Snyggt räknat – ' + tot + ' av ' + tot + '.';
      if(window.visaAk8Konfetti) window.visaAk8Konfetti();
    } else { s.className = 'ovn-sammanf delvis'; s.textContent = ratt + ' av ' + tot + ' rätt. Se facit vid de röda och försök igen.'; }
  }

  window.BLAD_AK8_D5 = { RAKNA: RAKNA, renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, ({ RAKNA:RAKNA })[key || 'RAKNA']); } };
})();
