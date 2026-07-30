/* ak8-blad-ui.js — DELAT UI-lager för åk8 Öva-blad (d1–d4).
   Presentation/interaktion — INGEN mattelogik. Motorernas generatorer och checkar är orörda;
   varje motor lånar bara UI härifrån. Innehåll:
     · numrering (grupp "N." + rad a/b/c)
     · auto-växande rutor (grow)
     · uttrycks-celler med bråk-/potens-byggare (ansCell/cellRead/insertWidget)
     · keypad fast längst ned på skärmen (keypadHTML) + inmatning (bindSheet)
     · enter → nästa ruta, auto-fokus, ✓/✗-bock + puls, clear-on-edit, auto-mellanslag i mellanled
     · skriv-ut-knapp
   Exponeras som window.AK8_UI. Laddas FÖRE blad-ak8-dN.js.  CSS: ak8-blad-ui.css. */
(function(){
  'use strict';

  // ── numerik (samma normalisering som motorerna) ──
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(/−/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }
  // Aritmetik-utvärderare (byte-identisk med mellanleds-motorn): + − · / parenteser.
  function evalArith(s){
    s = String(s).replace(/[\s ]/g, '').replace(/−/g, '-').replace(/[·×x]/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
    if(!/^[-0-9.*/+()]*$/.test(s) || s === '') return NaN;
    var i = 0;
    function expr(){ var v = term(); while(s[i] === '+' || s[i] === '-'){ var o = s[i++], t = term(); v = o === '+' ? v + t : v - t; } return v; }
    function term(){ var v = factor(); while(s[i] === '*' || s[i] === '/'){ var o = s[i++], f = factor(); v = o === '*' ? v * f : v / f; } return v; }
    function factor(){ if(s[i] === '+'){ i++; return factor(); } if(s[i] === '-'){ i++; return -factor(); } if(s[i] === '('){ i++; var v = expr(); if(s[i] === ')') i++; return v; } var m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i)); if(!m) return NaN; i += m[0].length; return parseFloat(m[0]); }
    var r = expr(); return i === s.length ? r : NaN;
  }
  function inTal(sm){ return '<input class="ak8-in' + (sm ? ' ak8-in-sm' : '') + '" inputmode="text" autocomplete="off">'; }

  // ── NUMRERING ──
  function gruppRubrik(nr, rubrik, hint){ return '<div class="ovn-grupp-rubrik">' + nr + '. ' + rubrik + '</div>' + (hint ? '<div class="ak8-hint">' + hint + '</div>' : ''); }
  // Injicerar bokstavs-etikett (a,b,c…) först i en .ak8-rad; hoppar över icke-uppgiftsrader.
  function injLabel(html, bokIndex){
    return /^<div class="ak8-rad[^"]*">/.test(html)
      ? html.replace(/^(<div class="ak8-rad[^"]*">)/, '$1<span class="ovn-label">' + String.fromCharCode(97 + (bokIndex % 26)) + ')</span>')
      : html;
  }
  // Renderar en grupps rader med bokstavs-numrering (reset per grupp). renderRad: (rad)->html.
  function renderGrupp(grupp, nr, renderRad){
    var html = gruppRubrik(nr, grupp.rubrik, grupp.hint), bokN = 0;
    grupp.rader.forEach(function(r){ var h = renderRad(r); if(/^<div class="ak8-rad[^"]*">/.test(h)){ h = injLabel(h, bokN); bokN++; } html += h; });
    return html;
  }

  // ── FRI EQUALITY-KEDJA (DELAD): "uttryck = [led] = [led] … + led". Används av d6 (låna),
  //    d7 (förkorta/förenkla-innan) och division (två-varianter m.m.). EN ledruta = "=" + ansCell.
  //    kedjeCeller() ger led-cellernas expr i ordning (mata Likhetsrattare.provaKedja). "+ led"-knappen
  //    avslöjar nästa dolda extra-ruta (wiras i bindSheet). Ett enda "=" per del (inget efter uttrycket).
  function ledWrap(role, extra){ return '<span class="ak8-ledwrap' + (extra ? ' ' + extra : '') + '"><span class="ovn-text ak8-eq">=</span>' + ansCell(role) + '</span>'; }
  function kedjaRadHTML(idx, qHTML){
    var celler = '';
    for(var k = 0; k < 4; k++) celler += ledWrap('L' + k, k >= 2 ? 'ak8-extra' : '');
    return '<div class="ak8-rad ak8-rad-kedja ak8-lana" data-idx="' + idx + '"><span class="ak8-q">' + qHTML + '</span>' + celler
      + '<button type="button" class="ak8-mer" data-mer>+ led</button></div>';
  }
  function kedjaCeller(radEl){ return [].slice.call(radEl.querySelectorAll('.ak8-cell .ak8-expr')); }

  // ── AUTO-VÄXANDE RUTA ──
  function grow(inp){
    if(!inp) return;
    // Stående bråk-ruta (fr-ruta): KOMPAKT – storlek efter täljare/nämnare, INTE utdragen till textbredd.
    // Gäller BARA bråk byggda i en uttrycks-cell (.ak8-expr); förrenderade bråk-svar (d5/d7 kanoniska
    // bcell) ligger utanför .ak8-expr och behåller sin CSS-bredd.
    if(inp.classList.contains('fr-ruta')){
      if(!inp.closest('.ak8-expr')) return;
      inp.style.width = '1ch';
      inp.style.width = Math.max(18, Math.min(inp.scrollWidth + 2, 120)) + 'px';
      return;
    }
    var min = inp.classList.contains('ak8-exprtxt') ? 16 : (inp.classList.contains('ak8-in-sm') ? 34 : 74);
    if(inp.value === '' && inp.placeholder && inp.classList.contains('ak8-exprtxt')) min = Math.max(min, inp.placeholder.length * 9);
    inp.style.width = '1ch';
    inp.style.width = Math.max(min, Math.min(inp.scrollWidth + 6, 340)) + 'px';
  }

  // ── UTTRYCKS-CELL (text + inbäddade bråk/potenser; byggs via keypadens byggar-knappar) ──
  function txtHTML(ph){ return '<input class="ak8-in ak8-exprtxt" inputmode="text" autocomplete="off"' + (ph ? ' placeholder="' + ph + '"' : '') + '>'; }
  function fracHTML(){ return '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ak8-in fr-ruta ak8-frt" inputmode="text" autocomplete="off"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ak8-in fr-ruta ak8-frn" inputmode="text" autocomplete="off"></span></span>'; }
  function potHTML(){ return '<span class="pot ak8-pot"><input class="ak8-in ak8-in-sm ak8-pbase" inputmode="text" autocomplete="off"><sup><input class="ak8-in ak8-in-sm ak8-pexp" inputmode="text" autocomplete="off"></sup></span>'; }
  function ansCell(role, ph){ return '<span class="ak8-cell" data-r="' + role + '"><span class="ak8-expr">' + txtHTML(ph) + '</span></span>'; }
  function exprSerialize(expr){
    var s = '';
    Array.prototype.forEach.call(expr.children, function(ch){
      if(ch.classList.contains('ak8-exprtxt')) s += ch.value;
      else if(ch.classList.contains('ovn-brak')) s += '(' + ch.querySelector('.ak8-frt').value + '/' + ch.querySelector('.ak8-frn').value + ')';
      else if(ch.classList.contains('ak8-pot')){ var b = pNum(ch.querySelector('.ak8-pbase').value), e = evalArith(ch.querySelector('.ak8-pexp').value); s += '(' + ((isFinite(b) && isFinite(e)) ? Math.pow(b, e) : 'NaN') + ')'; }
    });
    return s;
  }
  function cellRead(scope, role){
    var expr = scope.querySelector('.ak8-cell[data-r="' + role + '"] .ak8-expr'); if(!expr) return { kind:'val', num:NaN };
    var fracs = expr.querySelectorAll('.ovn-brak'), pots = expr.querySelectorAll('.ak8-pot'), texts = expr.querySelectorAll('.ak8-exprtxt');
    var textFilled = false; Array.prototype.forEach.call(texts, function(t){ if(t.value.trim() !== '') textFilled = true; });
    if(fracs.length === 1 && pots.length === 0 && !textFilled){
      var t = pNum(fracs[0].querySelector('.ak8-frt').value), n = pNum(fracs[0].querySelector('.ak8-frn').value);
      return { kind:'frac', t:t, n:n, num:(isFinite(t) && isFinite(n) && n !== 0) ? t / n : NaN };
    }
    if(pots.length === 1 && fracs.length === 0 && !textFilled){
      var b = pNum(pots[0].querySelector('.ak8-pbase').value), e = evalArith(pots[0].querySelector('.ak8-pexp').value);
      return { kind:'pot', base:b, exp:e, num:Math.pow(b, e) };
    }
    return { kind:'val', num: evalArith(exprSerialize(expr)) };
  }
  function insertWidget(active, kind){
    var expr = active.closest('.ak8-expr'); if(!expr) return null;
    var slot = active; while(slot.parentNode && slot.parentNode !== expr) slot = slot.parentNode;
    if(slot.parentNode !== expr) return null;
    slot.insertAdjacentHTML('afterend', (kind === 'frac' ? fracHTML() : potHTML()) + txtHTML());
    return slot.nextElementSibling.querySelector('input');
  }
  function removeWidgetIfEmpty(active){
    if(active.value !== '' || !/ak8-(frt|frn|pbase|pexp)/.test(active.className)) return null;
    var expr = active.closest('.ak8-expr'); var w = active; while(w.parentNode !== expr) w = w.parentNode;
    var prev = w.previousElementSibling, next = w.nextElementSibling;
    if(next && next.classList.contains('ak8-exprtxt')) next.remove();
    w.remove();
    return prev ? (prev.tagName === 'INPUT' ? prev : prev.querySelector('input')) : expr.querySelector('input');
  }

  // ── AUTO-MELLANSLAG runt +/− i mellanled (markör bevaras) ──
  function autoSpace(inp){
    var v = inp.value, pos = inp.selectionStart == null ? v.length : inp.selectionStart;
    var raw = v.replace(/\s+/g, '');
    var out = raw.replace(/([+−-])/g, function(op, _p, i){ return i === 0 ? op : ' ' + op + ' '; });
    if(out === v) return;
    var before = v.slice(0, pos).replace(/\s+/g, '').length, np = 0, seen = 0;
    while(np < out.length && seen < before){ if(out[np] !== ' ') seen++; np++; }
    inp.value = out; try { inp.setSelectionRange(np, np); } catch(e){}
  }

  // ── KEYPAD ──  opts: { ops:[...], builders:bool }
  var FRAC_ICON = '<span class="kp-frac"><span class="kp-frac-t"></span><span class="kp-frac-l"></span><span class="kp-frac-n"></span></span>';
  var POT_ICON = '<span class="kp-pot"><span class="kp-pot-b"></span><span class="kp-pot-e"></span></span>';
  function keypadHTML(opts){
    opts = opts || {}; var ops = opts.ops || ['+', '−', '·', '/'];
    var digits = ['7','8','9','4','5','6','1','2','3'], html = '<div class="keypad"><div class="keypad-digits">';
    for(var i = 0; i < digits.length; i++) html += '<button type="button" class="kp-key" data-key="' + digits[i] + '">' + digits[i] + '</button>';
    html += '<button type="button" class="kp-key span2" data-key="0">0</button>';
    html += '<button type="button" class="kp-key util" data-key="back">⌫</button></div>';
    if(ops.length){ html += '<div class="keypad-ops">'; for(var j = 0; j < ops.length; j++) html += '<button type="button" class="kp-key op" data-key="' + ops[j] + '">' + ops[j] + '</button>'; html += '</div>'; }
    if(opts.builders){ html += '<div class="keypad-ops"><button type="button" class="kp-key op kp-fracbtn" data-key="frac" title="Bygg stående bråk">' + FRAC_ICON + '</button><button type="button" class="kp-key op kp-potbtn" data-key="pot" title="Bygg potens: bas och exponent">' + POT_ICON + '</button></div>'; }
    return html + '</div>';
  }
  function printKnappHTML(){ return '<button type="button" class="ovn-skriv-ut" data-print>↗ Skriv ut bladet</button>'; }

  // ── RESULTAT-MARKERING (✓/✗ + puls) + CLEAR-ON-EDIT ──
  function markera(rowEl, ok){
    var old = rowEl.querySelector('.ovn-mark'); if(old) old.remove();
    var m = document.createElement('span'); m.className = 'ovn-mark ' + (ok ? 'ok' : 'fel'); m.textContent = ok ? '✓' : '✗';
    rowEl.appendChild(m);
    rowEl.classList.remove('just-checked'); void rowEl.offsetWidth; rowEl.classList.add('just-checked');
    setTimeout(function(){ rowEl.classList.remove('just-checked'); }, 550);
  }
  function rensaRad(rowEl){
    rowEl.querySelectorAll('.ak8-in.ak8-ok, .ak8-in.ak8-fel').forEach(function(i){ i.classList.remove('ak8-ok', 'ak8-fel'); });
    var mk = rowEl.querySelector('.ovn-mark'); if(mk) mk.remove();
    var f = rowEl.querySelector('.ak8-fasit'); if(f) f.remove();
    var oram = rowEl.querySelector('.ak8-ok-ram, .ak8-fel-ram'); if(oram) oram.classList.remove('ak8-ok-ram', 'ak8-fel-ram');
  }

  // ── BIND (efter mount.innerHTML): keypad + grow + fokus + enter + clear-on-edit + skriv-ut ──
  function bindSheet(mount, opts){
    opts = opts || {};
    var active = mount.querySelector('input');
    mount.addEventListener('focusin', function(e){ if(e.target.tagName === 'INPUT') active = e.target; });
    // keypad
    mount.querySelectorAll('.kp-key').forEach(function(btn){
      btn.addEventListener('mousedown', function(e){
        e.preventDefault();
        if(!active || active.disabled){ var first = mount.querySelector('input:not([disabled])'); if(first) active = first; else return; }
        var k = btn.dataset.key;
        if(k === 'frac' || k === 'pot'){ var f = insertWidget(active, k); if(f){ active = f; f.focus(); var xp = f.closest('.ak8-expr'); if(xp) xp.querySelectorAll('.ak8-in').forEach(grow); } return; }
        if(k === 'back'){ var moved = removeWidgetIfEmpty(active); if(moved){ active = moved; moved.focus(); return; } active.value = active.value.slice(0, -1); }
        else { active.value += k; }
        active.dispatchEvent(new Event('input', { bubbles:true }));
        active.focus();
      });
    });
    // grow + clear-on-edit + auto-mellanslag
    mount.addEventListener('input', function(e){
      var t = e.target; if(!t.classList || !t.classList.contains('ak8-in')) return;
      if(t.classList.contains('ak8-mel')) autoSpace(t);
      grow(t);
      var rad = t.closest('.ak8-rad'); if(rad) rensaRad(rad);
    });
    // enter → nästa ruta
    mount.addEventListener('keydown', function(e){
      if(e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
      e.preventDefault();
      var ins = Array.prototype.slice.call(mount.querySelectorAll('input:not([disabled])')), i = ins.indexOf(e.target);
      if(i > -1 && ins[i + 1]) ins[i + 1].focus();
    });
    // clear-on-edit även för knapp-baserade svar (chips/ordna/valjflera) vid klick
    mount.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('.ak8-chip, .ak8-tal, .ak8-vf, .ak8-korval'); if(!b) return;
      var rad = b.closest('.ak8-rad'); if(rad) rensaRad(rad);
    }, true);
    // "+ led" i fri equality-kedja: avslöja nästa dolda extra-ruta (delad för alla kedje-blad)
    mount.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('[data-mer]'); if(!b) return;
      var d = b.parentNode.querySelector('.ak8-extra'); if(d){ d.classList.remove('ak8-extra'); grow(d.querySelector('input')); }
    });
    // initiala bredder + auto-fokus (utan att skrolla)
    mount.querySelectorAll('.ak8-in').forEach(grow);
    if(opts.focus !== false){ var f0 = mount.querySelector('.ak8-in:not([disabled])'); if(f0){ try { f0.focus({ preventScroll:true }); } catch(e){ f0.focus(); } } }
    // skriv ut
    var pr = mount.querySelector('[data-print]'); if(pr) pr.onclick = function(){ window.print(); };
  }

  window.AK8_UI = {
    pNum: pNum, evalArith: evalArith, inTal: inTal,
    gruppRubrik: gruppRubrik, injLabel: injLabel, renderGrupp: renderGrupp,
    grow: grow, ansCell: ansCell, cellRead: cellRead, exprSerialize: exprSerialize,
    ledWrap: ledWrap, kedjaRadHTML: kedjaRadHTML, kedjaCeller: kedjaCeller,
    keypadHTML: keypadHTML, printKnappHTML: printKnappHTML, bindSheet: bindSheet,
    markera: markera, rensaRad: rensaRad
  };
})();
