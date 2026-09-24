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
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(/[−–—]/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }   // FAS1: även en-/em-dash, ej bara U+2212
  // Aritmetik-utvärderare (byte-identisk med mellanleds-motorn): + − · / parenteser.
  function evalArith(s){
    s = String(s).replace(/[\s ]/g, '').replace(/[−–—]/g, '-').replace(/[·×x]/g, '*').replace(/÷/g, '/').replace(/,/g, '.');   // sanering: en-/em-dash, ej bara U+2212
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
  // EN ETIKETTKÄLLA (order 2026-09-21): en rad som bär egna deluppgifts-etiketter (.ak8-linje-nr — flera tallinjer i
  // samma rad, d2/d3) får INGEN radetikett; de inre etiketterna numreras i stället i gruppens löpande bokstavsföljd
  // (a, b … c). Förr satte bladmotorn a) på raden OCH tallinjen a) på första linjen → "a) a)".
  function injLabelN(html, bokIndex){
    if(!/^<div class="ak8-rad[^"]*">/.test(html)) return { html: html, antal: 0 };
    var n = 0, h = html.replace(/(class="ak8-linje-nr"[^>]*>)[a-z]\)/g, function(m, p){ return p + String.fromCharCode(97 + ((bokIndex + n++) % 26)) + ')'; });
    if(n) return { html: h, antal: n };
    return { html: html.replace(/^(<div class="ak8-rad[^"]*">)/, '$1<span class="ovn-label">' + String.fromCharCode(97 + (bokIndex % 26)) + ')</span>'), antal: 1 };
  }
  function injLabel(html, bokIndex){ return injLabelN(html, bokIndex).html; }
  // Renderar en grupps rader med bokstavs-numrering (reset per grupp). renderRad: (rad)->html.
  function renderGrupp(grupp, nr, renderRad){
    var html = gruppRubrik(nr, grupp.rubrik, grupp.hint), bokN = 0;
    grupp.rader.forEach(function(r){ var h = renderRad(r); var lb = injLabelN(h, bokN); html += lb.html; bokN += lb.antal; });
    return html;
  }
  // ── PER-RUTA-MARKERING (order 2026-09-21): i en rad med flera rutor visar VARJE ruta sin egen status
  //    (res.per = [bool …] i rutornas ordning); raden är rätt (✓) bara om alla rutor är rätt (res.ok). Saknar
  //    checken per (envärdes-rader, val-rader) markeras alla rutor med res.ok som förr. ──
  //    res.perCell = { roll: bool } markerar per svarscell ([data-r]) när en cell rymmer flera rutor (uttrycks-/bråkceller).
  function markeraRutor(el, res){
    var ins = el.querySelectorAll('.ak8-in'), per = res && res.per, perCell = res && res.perCell;
    var perOk = per && per.length === ins.length;
    Array.prototype.forEach.call(ins, function(i, k){
      if(i.closest('.ak8-extra')) return;
      var ok = res.ok;
      if(perOk) ok = per[k];
      else if(perCell){ var c = i.closest('[data-r]'); if(c && c.dataset.r in perCell) ok = perCell[c.dataset.r]; }
      i.classList.add(ok ? 'ak8-ok' : 'ak8-fel');
    });
  }

  // ── FRI EQUALITY-KEDJA (DELAD): "uttryck = [led] = [led] … + led". Används av d6 (låna),
  //    d7 (förkorta/förenkla-innan) och division (två-varianter m.m.). EN ledruta = "=" + ansCell.
  //    kedjeCeller() ger led-cellernas expr i ordning (mata Likhetsrattare.provaKedja). "+ led"-knappen
  //    avslöjar nästa dolda extra-ruta (wiras i bindSheet). Ett enda "=" per del (inget efter uttrycket).
  function ledWrap(role, extra){ return '<span class="ak8-ledwrap' + (extra ? ' ' + extra : '') + '"><span class="ovn-text ak8-eq">=</span>' + ansCell(role) + '</span>'; }
  // FRI KEDJA (Joachims modell, 2026-09-15): startläge = ETT mellanled + svarsruta (L0, L1 synliga) —
  // minimikravet som påminner om att vägen ska visas. "+ led" avslöjar nästa dolda led (L2, L3) för den
  // som räknar i flera steg; "− led" tar bort det senast tillagda igen (töms + göms). Antalet är
  // elevens val, inte uppgiftens. Rättas på värde per led (provaKedja); formkravet ("förlängningen med
  // räknesättet kvar") uttrycks i uppgiften + kravet på minst ett ifyllt mellanled, inte av rättaren.
  var LED_TEXT = { mer: { titel: '+ led' }, mindre: { titel: '− led' } };   // elevtext som fält (låset ser titel:)
  function kedjaRadHTML(idx, qHTML){
    var celler = '';
    for(var k = 0; k < 4; k++) celler += ledWrap('L' + k, k >= 2 ? 'ak8-extra' : '');
    return '<div class="ak8-rad ak8-rad-kedja ak8-lana" data-idx="' + idx + '"><span class="ak8-q">' + qHTML + '</span>' + celler
      + '<button type="button" class="ak8-mer" data-mer>' + LED_TEXT.mer.titel + '</button><button type="button" class="ak8-mer ak8-mindre" data-mindre hidden>' + LED_TEXT.mindre.titel + '</button></div>';
  }
  // Tillagt led: avslöja nästa dolda / göm+töm det senast avslöjade. Knapparna följer läget.
  function ledAvsloja(rad){
    var d = rad.querySelector('.ak8-extra'); if(!d) return null;
    d.classList.remove('ak8-extra'); grow(d.querySelector('input')); ledKnappar(rad); return d;
  }
  function ledGom(rad, wrap){
    var synliga = [].filter.call(rad.querySelectorAll('.ak8-ledwrap'), function(w){ return !w.classList.contains('ak8-extra'); });
    var w = wrap || synliga[synliga.length - 1];
    if(!w || synliga.length <= 2) return null;                       // minimum (mellanled + svar) rörs aldrig
    w.querySelectorAll('.ak8-in').forEach(function(i){ i.value = ''; });
    // töm även byggda widgets (bråk/potens) så ledet är rent nästa gång det avslöjas
    var expr = w.querySelector('.ak8-expr'); if(expr) expr.innerHTML = txtHTML();
    w.classList.add('ak8-extra'); ledKnappar(rad);
    var kvar = [].filter.call(rad.querySelectorAll('.ak8-ledwrap'), function(x){ return !x.classList.contains('ak8-extra'); });
    return kvar[kvar.length - 1];
  }
  function ledKnappar(rad){
    var extra = rad.querySelectorAll('.ak8-extra').length, tot = rad.querySelectorAll('.ak8-ledwrap').length;
    var mer = rad.querySelector('[data-mer]'), mindre = rad.querySelector('[data-mindre]');
    if(mer) mer.hidden = extra === 0;
    if(mindre) mindre.hidden = (tot - extra) <= 2;
  }
  function kedjaCeller(radEl){ return [].slice.call(radEl.querySelectorAll('.ak8-cell .ak8-expr')); }

  // ── AUTO-VÄXANDE RUTA ──
  // opts.min = golv i pixlar (rutans egen bredd). Utan opts: åttans egna minimum per roll.
  function grow(inp, opts){
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
    var min = (opts && opts.min) || (inp.classList.contains('ak8-exprtxt') ? 16 : (inp.classList.contains('ak8-pexp') ? 26 : inp.classList.contains('ak8-in-sm') ? 34 : 74));
    if(inp.value === '' && inp.classList.contains('ak8-exprtxt')){
      var ex = inp.closest('.ak8-expr');   // tom OCH ensam i cellen (inget bråk/potens byggt) → full svarsbredd
      if(ex && !ex.querySelector('.ovn-brak, .ak8-pot') && ex.querySelectorAll('.ak8-exprtxt').length === 1) min = 74;
    }
    inp.style.width = '1ch';
    inp.style.width = Math.max(min, Math.min(inp.scrollWidth + 6, 340)) + 'px';
  }

  // ── UTTRYCKS-CELL (text + inbäddade bråk/potenser; byggs via keypadens byggar-knappar) ──
  function txtHTML(ph){ return '<input class="ak8-in ak8-exprtxt" inputmode="text" autocomplete="off"' + (ph ? '' : '') + '>'; }
  function fracHTML(){ return '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ak8-in fr-ruta ak8-frt" inputmode="text" autocomplete="off"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ak8-in fr-ruta ak8-frn" inputmode="text" autocomplete="off"></span></span>'; }
  function potHTML(){ return '<span class="pot ak8-pot"><input class="ak8-in ak8-in-sm ak8-pbase" inputmode="text" autocomplete="off"><sup><input class="ak8-in ak8-in-sm ak8-pexp" inputmode="text" autocomplete="off"></sup></span>'; }
  function ansCell(role, ph){ return '<span class="ak8-cell" data-r="' + role + '"><span class="ak8-expr">' + txtHTML(ph) + '</span></span>'; }
  // FAS4: förrenderad TVÅFÄLTS-potenscell — bas-fält + upphöjt exponent-fält, var sitt platshållarord, så
  // eleven ser direkt att det är två fält (bas resp. exponent) i stället för en avklippt "bas^exp"-ruta som
  // krävde potens-knappen. cellRead läser den som kind:'pot' (en .ak8-pot, ingen ifylld exprtext). expWide =
  // bredare exp-fält för mellanledets OBERÄKNADE uttryck (t.ex. 4+5); .ak8-pexp ger uttrycks-läge (+ aktiv).
  function potAnsCell(role, basePh, expPh){
    // Fältbredden styrs av grow() ur platshållar-längden (ak8-in-sm-grenen) → "uttryck" (mellanled) blir
    // bredare än "tal"/"n" (svar) av sig självt; ingen inline-bredd behövs.
    return '<span class="ak8-cell" data-r="' + role + '"><span class="ak8-expr">'
      + '<span class="pot ak8-pot"><input class="ak8-in ak8-in-sm ak8-pbase" inputmode="text" autocomplete="off"' + (basePh ? '' : '') + '>'
      + '<sup><input class="ak8-in ak8-in-sm ak8-pexp" inputmode="text" autocomplete="off"' + (expPh ? '' : '') + '></sup></span>'
      + '</span></span>';
  }
  // ── STAPLAT KOMPLEX-BRÅK (DELAD byggsten) — ett bråk vars täljare OCH nämnare själva är
  //    uttrycks-celler (nästlade .ak8-expr). Låter förlänga-metoden VISA att nämnaren blir 1.
  //    Återanvänds i algebrans division av rationella uttryck + nian. Additivt: befintliga
  //    .ovn-brak-celler orörda. Serialisering/tokenisering rekurserar in i de nästlade cellerna. ──
  function kbSubExpr(){ return '<span class="ak8-expr ak8-kbsub">' + fracHTML() + txtHTML() + '</span>'; }
  function komplexBrakHTML(){
    return '<span class="ovn-kbrak">'
      + '<span class="ovn-kbrak-topp">' + kbSubExpr() + '</span>'
      + '<span class="ovn-kbrak-streck"></span>'
      + '<span class="ovn-kbrak-botten">' + kbSubExpr() + '</span>'
      + '</span>';
  }
  // En hel svarscell (data-r) vars uttryck ÄR ett komplex-bråk (för mellanled i förlänga-metoden).
  function komplexBrakCell(role){ return '<span class="ak8-cell" data-r="' + role + '"><span class="ak8-expr ak8-kbwrap">' + komplexBrakHTML() + '</span></span>'; }
  function exprSerialize(expr){
    var s = '';
    Array.prototype.forEach.call(expr.children, function(ch){
      if(ch.classList.contains('ak8-exprtxt')) s += ch.value;
      else if(ch.classList.contains('ovn-brak')) s += '(' + ch.querySelector('.ak8-frt').value + '/' + ch.querySelector('.ak8-frn').value + ')';
      else if(ch.classList.contains('ak8-pot')){ var b = pNum(ch.querySelector('.ak8-pbase').value), e = evalArith(ch.querySelector('.ak8-pexp').value); s += '(' + ((isFinite(b) && isFinite(e)) ? Math.pow(b, e) : 'NaN') + ')'; }
      else if(ch.classList.contains('ovn-kbrak')){ var top = ch.querySelector('.ovn-kbrak-topp .ak8-expr'), bot = ch.querySelector('.ovn-kbrak-botten .ak8-expr'); s += '((' + (top ? exprSerialize(top) : '') + ')/(' + (bot ? exprSerialize(bot) : '') + '))'; }
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
  // ── EN BRÅKKNAPP (order 2026-09-21): står markören i en täljare eller nämnare skapas bråket DÄR — det stående bråket
  //    blir ett staplat komplexbråk (.ovn-kbrak) vars sida med markören får ett inre bråk, den andra sidan behåller sitt
  //    innehåll som vanlig ruta (får sitt inre bråk när eleven trycker där). Eleven bygger komplexbråket steg för steg,
  //    som på papper. Fungerar på alla djup, eftersom kbrakets sidor är .ak8-expr.
  function brakDar(active){
    var fr = active.closest('.ovn-brak'); if(!fr) return null;
    var frt = fr.querySelector('.ak8-frt'), frn = fr.querySelector('.ak8-frn'); if(!frt || !frn) return null;
    var oExpr = fr.parentNode; if(!oExpr || !oExpr.classList.contains('ak8-expr')) return null;
    var iTopp = active === frt, tVal = frt.value, nVal = frn.value;
    function sida(medBrak){ return '<span class="ak8-expr ak8-kbsub">' + (medBrak ? fracHTML() + txtHTML() : txtHTML()) + '</span>'; }
    var tmp = document.createElement('span');
    tmp.innerHTML = '<span class="ovn-kbrak" data-byggd="1"><span class="ovn-kbrak-topp">' + sida(iTopp) + '</span><span class="ovn-kbrak-streck"></span><span class="ovn-kbrak-botten">' + sida(!iTopp) + '</span></span>';
    var kb = tmp.firstChild;
    var inre = kb.querySelector('.ovn-brak'); inre.setAttribute('data-byggd', '1');
    // den andra sidan behåller sitt tal; sidan med markören: det som stod där hamnar i inre täljaren
    var andraTxt = kb.querySelector(iTopp ? '.ovn-kbrak-botten .ak8-exprtxt' : '.ovn-kbrak-topp .ak8-exprtxt'); andraTxt.value = iTopp ? nVal : tVal;
    inre.querySelector('.ak8-frt').value = iTopp ? tVal : nVal;
    if(!fr.hasAttribute('data-byggd')) kb.setAttribute('data-form', '1');   // förrenderat bråk (svarscell): ihopfällning återställer formen
    oExpr.replaceChild(kb, fr);
    return inre.querySelector('.ak8-frt');
  }
  // Ångra ett inre bråk: tomt, elevbyggt inre bråk i ett kbrak tas bort; är båda sidorna utan inre bråk fälls
  // komplexbråket ihop till det vanliga bråk det var (texterna blir täljare/nämnare igen).
  function inreBrakBort(active){
    if(!/ak8-(frt|frn)/.test(active.className)) return null;
    var fr = active.closest('.ovn-brak'); if(!fr || !fr.hasAttribute('data-byggd')) return null;
    var sub = fr.parentNode; if(!sub || !sub.classList.contains('ak8-kbsub')) return null;
    var kb = sub.closest('.ovn-kbrak'); if(!kb) return null;
    var tom = Array.prototype.every.call(fr.querySelectorAll('.ak8-in'), function(i){ return i.value === ''; }); if(!tom) return null;
    var next = fr.nextElementSibling; var kvar = (next && next.classList.contains('ak8-exprtxt')) ? next.value : '';
    if(next && next.classList.contains('ak8-exprtxt')) next.remove();
    fr.remove();
    var txt = sub.querySelector('.ak8-exprtxt'); if(!txt){ sub.insertAdjacentHTML('beforeend', txtHTML()); txt = sub.querySelector('.ak8-exprtxt'); }
    if(kvar && !txt.value) txt.value = kvar;
    if(!kb.querySelector('.ovn-brak') && kb.hasAttribute('data-byggd')){
      // fäll ihop till vanligt bråk
      var tT = kb.querySelector('.ovn-kbrak-topp .ak8-exprtxt'), tB = kb.querySelector('.ovn-kbrak-botten .ak8-exprtxt');
      var tmp = document.createElement('span'); tmp.innerHTML = fracHTML(); var plain = tmp.firstChild;
      if(!kb.hasAttribute('data-form')) plain.setAttribute('data-byggd', '1');
      plain.querySelector('.ak8-frt').value = tT ? tT.value : ''; plain.querySelector('.ak8-frn').value = tB ? tB.value : '';
      var iTopp = sub.classList.contains('ak8-kbsub') && sub.parentNode.classList.contains('ovn-kbrak-topp');
      kb.parentNode.replaceChild(plain, kb);
      return plain.querySelector(iTopp ? '.ak8-frt' : '.ak8-frn');
    }
    return txt;
  }
  function insertWidget(active, kind){
    if(kind === 'frac' && /ak8-(frt|frn)/.test(active.className)){ var d = brakDar(active); if(d) return d; }
    var expr = active.closest('.ak8-expr'); if(!expr) return null;
    var slot = active; while(slot.parentNode && slot.parentNode !== expr) slot = slot.parentNode;
    if(slot.parentNode !== expr) return null;
    var widget = kind === 'frac' ? fracHTML() : potHTML();
    slot.insertAdjacentHTML('afterend', widget + txtHTML());
    slot.nextElementSibling.setAttribute('data-byggd', '1');   // ELEVEN byggde den → får raderas bort (förrenderade widgets är cellens form och stannar)
    return slot.nextElementSibling.querySelector('input');   // kbrak → första nästlade rutan (topp-bråkets täljare)
  }
  function removeWidgetIfEmpty(active){
    if(active.value !== '') return null;
    var inre = inreBrakBort(active); if(inre) return inre;   // ångra ett inre bråk (EN bråkknapp) före kbrak-regeln nedan
    // Komplex-bråk (kbrak): markören i en tom cell inuti ett .ovn-kbrak → ta bort HELA komplex-bråket
    // om det är helt tomt (annars strandar scaffoldet — regexen nedan når bara det inre bråket). Är
    // något ifyllt lämnas det (undvik dataförlust). Det yttre uttrycket är kbrakets närmaste .ak8-expr.
    var kbrak = active.closest('.ovn-kbrak');
    if(kbrak && kbrak.hasAttribute('data-byggd')){
      var allTom = Array.prototype.every.call(kbrak.querySelectorAll('.ak8-in'), function(i){ return i.value === ''; });
      if(!allTom) return null;
      var oExpr = kbrak.closest('.ak8-expr'); if(!oExpr) return null;
      var kw = kbrak; while(kw.parentNode && kw.parentNode !== oExpr) kw = kw.parentNode;
      if(kw.parentNode !== oExpr) return null;
      var kprev = kw.previousElementSibling, knext = kw.nextElementSibling;
      if(knext && knext.classList.contains('ak8-exprtxt')) knext.remove();
      kw.remove();
      return kprev ? (kprev.tagName === 'INPUT' ? kprev : kprev.querySelector('input')) : oExpr.querySelector('input');
    }
    if(!/ak8-(frt|frn|pbase|pexp)/.test(active.className)) return null;
    var expr = active.closest('.ak8-expr'); if(!expr) return null; var w = active; while(w.parentNode && w.parentNode !== expr) w = w.parentNode;
    if(w.parentNode !== expr || !w.hasAttribute('data-byggd')) return null;   // förrenderad (potAnsCell, kanonisk bcell) → stannar
    var prev = w.previousElementSibling, next = w.nextElementSibling;
    if(next && next.classList.contains('ak8-exprtxt')) next.remove();
    w.remove();
    return prev ? (prev.tagName === 'INPUT' ? prev : prev.querySelector('input')) : expr.querySelector('input');
  }

  // ── RADERA = ÅNGRA DET SENASTE (2026-09-15, gäller alla celltyper: keypadens ⌫ och fysiskt Backspace) ──
  // Regel: radera tar bort det senaste eleven gjorde, oavsett vad — en siffra, en bråkruta, en operator,
  // ett helt tillagt mellanled. Förr togs en widget bara bort när markören stod i ett av DESS tomma fält;
  // i den tomma texten EFTER bråket hände ingenting → eleven var fast (samma fel som i potenskapitlet).
  //   1 fältet har tecken            → sista tecknet bort
  //   2 tomt widget-fält, syskonfält ifyllt → hoppa till det (nästa radering äter dess tecken)
  //   3 tom widget helt               → ta bort widgeten, markör i föregående ruta
  //   4 tom text, widget före         → hoppa in i widgetens sista fält (steg 2–3 tar sedan bort den)
  //   5 tom text, inget före, tillagt led → göm ledet igen, markör i föregående led
  // Returnerar rutan som ska ha fokus (eller null om inget mer att ångra).
  function widgetAv(inp){ var expr = inp.closest('.ak8-expr'); if(!expr) return null; var w = inp; while(w.parentNode && w.parentNode !== expr) w = w.parentNode; return w.parentNode === expr ? w : null; }
  function sistaRuta(el){ var ins = el.querySelectorAll('.ak8-in'); return ins.length ? ins[ins.length - 1] : null; }
  function radera(active){
    if(active.value !== ''){ active.value = active.value.slice(0, -1); return active; }
    // 2: tomt widget-fält med ifyllt syskon → dit
    var wi = /ak8-(frt|frn|pbase|pexp)/.test(active.className) ? widgetAv(active) : null;
    if(wi){
      var syskon = [].filter.call(wi.querySelectorAll('.ak8-in'), function(i){ return i !== active && i.value !== ''; });
      if(syskon.length) return syskon[syskon.length - 1];
    }
    // 3 (+ kbrak): helt tom widget bort
    var moved = removeWidgetIfEmpty(active); if(moved) return moved;
    // 3b: inne i ett KOMPLEX-bråk med innehåll kvar i den andra delen (täljare-/nämnar-uttrycket) → dit
    //     (närmast föregående ifyllda ruta, annars sista ifyllda) — annars fastnade raderingen i en tömd del.
    var kb = active.closest('.ovn-kbrak');
    if(kb){
      var alla = [].slice.call(kb.querySelectorAll('.ak8-in')), i = alla.indexOf(active), j;
      for(j = i - 1; j >= 0; j--) if(alla[j].value !== '') return alla[j];
      for(j = alla.length - 1; j > i; j--) if(alla[j].value !== '') return alla[j];
    }
    // 4: tom text med widget före → in i widgetens sista fält
    if(active.classList.contains('ak8-exprtxt')){
      var prev = active.previousElementSibling;
      if(prev && !prev.classList.contains('ak8-exprtxt')){ var s = sistaRuta(prev); if(s) return s; }
      // 5: första rutan i ett TILLAGT led som är tomt → göm ledet
      var wrap = active.closest('.ak8-ledwrap'), rad = active.closest('.ak8-rad');
      if(wrap && rad && !prev && !besvarad(wrap)){
        var synliga = [].filter.call(rad.querySelectorAll('.ak8-ledwrap'), function(w){ return !w.classList.contains('ak8-extra'); });
        if(synliga.length > 2 && synliga[synliga.length - 1] === wrap){ var till = ledGom(rad, wrap); return till ? sistaRuta(till) : null; }
      }
    }
    return null;
  }
  // ── OPERATOR-HOPP (FAS 1): ett räknesätt skrivet med markören i ett bråk-/potensfält hör inte hemma DÄR
  //    ("15+" i nämnaren) utan i texten EFTER widgeten — så uttrycket blir bråk + bråk. ──
  //    UNDANTAG · (mult/div-bladen, 2026-09-15): produkten HÖR hemma i täljare/nämnare — (5·4)/(6·7) är
  //    multiplikationens mellanled och hinten ber om den. Hoppade · ut kunde formen inte skrivas alls.
  //    Vill eleven ha · MELLAN två bråk (3/5 · 7/6) skriver hon det i texten efter bråket (Enter/tryck).
  var OPER = { '+':1, '−':1, '-':1, '/':1, '(':1, ')':1 };
  function operatorMal(active, key){
    if(!OPER[key] || !/ak8-(frt|frn|pbase|pexp)/.test(active.className)) return active;
    var w = widgetAv(active); if(!w) return active;
    var next = w.nextElementSibling;
    if(!next || !next.classList.contains('ak8-exprtxt')){ w.insertAdjacentHTML('afterend', txtHTML()); next = w.nextElementSibling; }
    return next;
  }

  // ── AUTO-MELLANSLAG + RIKTIGA TECKEN i uttrycks-rutor (markören bevaras) ──
  // Uppgiften står "15 − 2³" — då ska elevens rad se likadan ut, inte "15-8". Tre steg, i den här ordningen:
  //   1) riktiga tecken: bindestreck/en-dash/em-dash → − (U+2212), * och × → ·
  //   2) ETT mellanrum på var sida om ett räknetecken som står MELLAN två delar (inledande tecken står tätt: −5)
  //   3) markören flyttas till samma plats i den nya texten (räknat i tecken som inte är mellanslag)
  // Mellanrum som eleven skrivit själv INUTI ett tal (tusental: 4 800 000) lämnas i fred.
  // Rättningen påverkas inte: pNum och evalArith saneras bort både mellanrum och teckenvarianter.
  var UTTRYCKSRUTOR = '.ak8-mel,.ak8-exprtxt,.ak8-in-oms,.ak8-pexp,.ak8-gpe';
  function autoSpace(inp){
    var v = inp.value, pos = inp.selectionStart == null ? v.length : inp.selectionStart;
    var out = v.replace(/[-\u2013\u2014]/g, '\u2212').replace(/[*\u00d7]/g, '\u00b7');
    out = out.replace(/\s*([+\u2212\u00b7\/])\s*/g, function(m, op, i){ return i === 0 ? op : ' ' + op + ' '; });
    if(!/[+\u2212\u00b7\/]\s*$/.test(out)) out = out.replace(/\s+$/, '');   // mellanrummet efter ett tecken står kvar tills nästa del skrivits
    if(out === v) return;
    var before = v.slice(0, pos).replace(/\s+/g, '').length, np = 0, seen = 0;
    while(np < out.length && seen < before){ if(out[np] !== ' ') seen++; np++; }
    inp.value = out; try { inp.setSelectionRange(np, np); } catch(e){}
  }

  // ── FOKUS-BETEENDE (delat av bindSheet + bindKeypad) ──
  // Ordsvars-ruta (platsvärde: ental/tiondel …) ska INTE ha sifferknappsats → keypaden döljs när en
  // sådan ruta har fokus. Markören är data-nokeypad (opts.hideFor kan byta selektor).
  function arOrdruta(inp, sel){ return !!(inp && inp.matches && sel && inp.matches(sel)); }
  // Den fokuserade rutan får aldrig hamna bakom den fasta keypaden: hamnar den under keypadens
  // överkant (eller ovanför vyn) scrollas den fram. Körs bara vid FOKUS-BYTE, ej vid varje tangenttryck.
  function skrollaFram(kp, inp){
    if(!inp || !kp || kp.classList.contains('keypad-hidden')) return;
    var kr = kp.getBoundingClientRect(), ir = inp.getBoundingClientRect();
    if(ir.bottom > kr.top - 12 || ir.top < 8){
      try { inp.scrollIntoView({ block:'center', behavior:'smooth' }); } catch(e){ inp.scrollIntoView(); }
    }
  }

  // ── FAS 2: KONTEXT-GRÅNING ──  Fast layout, men bara de tecken RÄTTAREN accepterar för den
  // fokuserade rutan är aktiva; resten blir grå (.kp-inactive). Läget härleds ur rutans RÄTTAR-TYP
  // via dess befintliga markör-klasser — INGEN separat tillåtenhetslista (samma källa som rättningen):
  //   • plain pNum-ruta (default)        → siffror, komma, minus, radera
  //   • uttrycks-cell (evalArith): .ak8-mel/.ak8-pexp/.ak8-gpe/.ak8-in-oms/.ak8-exprtxt,
  //       [data-mellan]/[data-term], eller inuti .ak8-expr → även + · / ( )
  //   • builder-cell (inuti .ak8-expr)   → även bråk/potens (frac/pot/kbrak)
  //   • √ och π accepteras av ingen rättare ännu → ALLTID grå (plats reserverad).
  //   • data-kp på rutan överstyr ('tal' | 'uttryck' | 'bygg' | 'fri'=allt aktivt).
  var KP_BAS = ['0','1','2','3','4','5','6','7','8','9',',','−','back'];
  function tillatnaTecken(inp){
    var till = {}; for(var i = 0; i < KP_BAS.length; i++) till[KP_BAS[i]] = 1;
    var m = inp && inp.dataset && inp.dataset.kp, uttryck, bygg;
    // 'fri' = opt-out: alla normala tecken aktiva (√/π förblir grå — ingen rättare).
    if(m){ uttryck = m === 'fri' || /uttryck|term/.test(m); bygg = m === 'fri' || /bygg/.test(m); }
    else {
      var expr = !!(inp && inp.closest && inp.closest('.ak8-expr'));
      uttryck = expr || !!(inp && inp.matches && inp.matches('.ak8-mel,.ak8-pexp,.ak8-gpe,.ak8-in-oms,.ak8-exprtxt,[data-mellan],[data-term]'));
      bygg = expr;
    }
    if(uttryck){ till['+'] = 1; till['·'] = 1; till['/'] = 1; till['('] = 1; till[')'] = 1; }
    var vars = inp && inp.dataset && inp.dataset.vars;   // data-vars="xy" → just de variablerna aktiva (algebra); saknas → alla grå
    if(vars) ('' + vars).split('').forEach(function(v){ if(VARIABLER.indexOf(v) > -1) till[v] = 1; });
    if(bygg){ till['frac'] = 1; till['pot'] = 1; }   // EN bråkknapp (order 2026-09-21): komplexbråket byggs med samma knapp inne i täljare/nämnare
    // data-bygg="frac" (eller "frac pot"): rutan säger VILKA byggare den kan bära. Utan attributet
    // gäller kontexten ovan. En ruta som bara kan bära bråk ska inte tända potensknappen.
    var byggLista = inp && inp.dataset && inp.dataset.bygg;
    if(byggLista != null){
      delete till['frac']; delete till['pot'];
      ('' + byggLista).split(/[\s,]+/).forEach(function(b){ if(b === 'frac' || b === 'pot') till[b] = 1; });
    }
    return till;
  }
  function graderaKeypad(kp, inp){
    if(!kp) return;
    var till = tillatnaTecken(inp);
    kp.querySelectorAll('.kp-key').forEach(function(b){
      var inaktiv = !till[b.dataset.key];
      b.classList.toggle('kp-inactive', inaktiv);
      if(inaktiv){ b.setAttribute('aria-disabled', 'true'); b.setAttribute('tabindex', '-1'); }
      else { b.removeAttribute('aria-disabled'); b.removeAttribute('tabindex'); }
    });
  }

  // ── KEYPAD ──  opts: { ops:[...], builders:bool }
  var VARIABLER = ['x', 'y', 'a', 'b', 'p'];   // samma uppsättning som algebra-rättaren (alg-brak.js VARS)
  var FRAC_ICON = '<span class="kp-frac"><span class="kp-frac-t"></span><span class="kp-frac-l"></span><span class="kp-frac-n"></span></span>';
  var POT_ICON = '<span class="kp-pot"><span class="kp-pot-b"></span><span class="kp-pot-e"></span></span>';
  // Staplat komplex-bråk: två små bråk-glyfer kring ett tjockt streck (delad byggsten).
  var KBRAK_ICON = '<span class="kp-kbrak"><span class="kp-kbrak-f"></span><span class="kp-kbrak-l"></span><span class="kp-kbrak-f"></span></span>';
  // FAST LAYOUT (Joachim): keypaden ser ALLTID likadan ut, oavsett kapitel/uppgiftstyp. Knappar som
  // inte gäller renderas grå + inaktiva (.kp-inactive → pointer-events:none). Tre block:
  //   siffror (3 kol, ⌫ ensam bredvid 0 på 0-raden, avskild från tecknen) · operatorer (2 kol:
  //   + − · / ( ) √ π) · byggare (1 smal kol: bråk över potens). Inget = (står i uppgiften).
  // FAS 1: nya knapparna ( ) √ π är grå (ingen rättare accepterar dem ännu — parenteser bara i
  //   evalArith-celler, √/π ingenstans). Bråk/potens grå tills builder-kontext. Operatorerna är
  //   aktiva som förr; den kontext-styrda gråningen (ur rättar-typ + band) är FAS 2, ej inkopplad här.
  function keypadHTML(opts){
    opts = opts || {};
    function k(key, label, cls){ return '<button type="button" class="kp-key' + (cls ? ' ' + cls : '') + '" data-key="' + key + '"' + (cls && cls.indexOf('kp-inactive') > -1 ? ' aria-disabled="true" tabindex="-1"' : '') + '>' + label + '</button>'; }
    var html = '<div class="keypad"><div class="keypad-digits">';
    ['7','8','9','4','5','6','1','2','3'].forEach(function(d){ html += k(d, d); });
    // 0-raden: komma · 0 · radera (⌫ ensam bredvid 0, avskild från operatorerna i nästa block)
    html += k(',', ',') + k('0', '0') + k('back', '⌫', 'util') + '</div>';
    // Operatorer (2 kol). Parenteser + √ + π är NYA → grå tills rättare/band aktiverar dem (FAS 2).
    html += '<div class="keypad-ops">';
    ['+', '−', '·', '/'].forEach(function(o){ html += k(o, o, 'op'); });
    html += k('(', '(', 'op kp-inactive') + k(')', ')', 'op kp-inactive');
    html += k('√', '√', 'op kp-inactive') + k('π', 'π', 'op kp-inactive');
    html += '</div>';
    // Variabler (2 kol × 3 rader — lägre än sifferblocket → keypadens HÖJD oförändrad). Algebra kräver
    // bokstäver; en elev på surfplatta kunde annars inte skriva ett algebraiskt svar alls. Grå tills rutan
    // säger vilka som gäller (data-vars), samma princip som ( ) √ π.
    var aktivaVars = ('' + (opts.vars || '')).split('');
    html += '<div class="keypad-vars">';
    VARIABLER.forEach(function(v){ html += k(v, v, 'varkey' + (aktivaVars.indexOf(v) > -1 ? '' : ' kp-inactive')); });
    html += '</div>';
    // Byggare (1 smal kol): bråk ÖVER potens. Grå tills builder-kontext (opts.builders).
    var bi = opts.builders ? '' : ' kp-inactive';
    html += '<div class="keypad-build">'
      + '<button type="button" class="kp-key op kp-fracbtn' + bi + '" data-key="frac" title="Bygg stående bråk"' + (bi ? ' aria-disabled="true" tabindex="-1"' : '') + '>' + FRAC_ICON + '</button>'
      + '<button type="button" class="kp-key op kp-potbtn' + bi + '" data-key="pot" title="Bygg potens: bas och exponent"' + (bi ? ' aria-disabled="true" tabindex="-1"' : '') + '>' + POT_ICON + '</button>'
      // (komplexbråks-knappen borttagen 2026-09-21 — Joachim: en knapp som gör rätt sak där markören står; opts.komplex ignoreras)
      + '</div>';
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
  // Är svars-elementet BESVARAT? (minst en ifylld ruta eller ett markerat val). Kontrollera ska
  // bara rätta det som är ifyllt → "X av Y" räknar besvarade, inte alla (obesvarade hoppas över).
  function besvarad(el){
    if(!el) return false;
    if(el.querySelector('.sel')) return true;   // markerat val (korval/chip/tal/vf/ordna)
    var ins = el.querySelectorAll('.ak8-in');
    for(var i = 0; i < ins.length; i++){ if(ins[i].value && ins[i].value.trim()) return true; }
    return false;
  }

  // ── BIND (efter mount.innerHTML): keypad + grow + fokus + enter + clear-on-edit + skriv-ut ──
  function bindSheet(mount, opts){
    opts = opts || {};
    // Åter-bind (Återställ → renderBlad → bindSheet på SAMMA mount): ta bort förra bindningens mount-lyssnare
    // först. Förr staplades de → efter tre återställningar avslöjade ett "+ led"-klick flera led, och
    // focusin/keydown kördes flera gånger. Keypad-knapparna är nya element per render och binds om ändå.
    if(mount.__ak8lyss){ mount.__ak8lyss.forEach(function(l){ mount.removeEventListener(l[0], l[1], l[2]); }); }
    var lyss = mount.__ak8lyss = [];
    function pa(typ, fn, capture){ mount.addEventListener(typ, fn, !!capture); lyss.push([typ, fn, !!capture]); }
    var active = mount.querySelector('input');
    var kpEl = mount.querySelector('.keypad'), sisteFram = null, doljSel = opts.hideFor || '[data-nokeypad]';
    pa('focusin', function(e){
      if(e.target.tagName !== 'INPUT') return;
      active = e.target;
      var dolj = arOrdruta(active, doljSel); if(kpEl) kpEl.classList.toggle('keypad-hidden', dolj);
      if(kpEl && !dolj) graderaKeypad(kpEl, active);   // FAS 2: gråa knappar rättaren ej accepterar
      if(!dolj && active !== sisteFram) skrollaFram(kpEl, active);
      sisteFram = active;
    });
    // keypad
    mount.querySelectorAll('.kp-key').forEach(function(btn){
      btn.addEventListener('mousedown', function(e){
        if(btn.classList.contains('kp-inactive')) return;   // FAS 2: grå knapp = inaktiv (utöver pointer-events)
        e.preventDefault();
        if(!active || active.disabled){ var first = mount.querySelector('input:not([disabled])'); if(first) active = first; else return; }
        var k = btn.dataset.key;
        if(k === 'frac' || k === 'pot'){ var f = insertWidget(active, k); if(f){ active = f; f.focus(); var xp = f.closest('.ak8-expr'); if(xp) xp.querySelectorAll('.ak8-in').forEach(grow); } return; }
        if(k === 'back'){
          var rad0 = active.closest('.ak8-rad');
          var till = radera(active);                          // ångra det senaste (tecken/widget/led) — alla celltyper
          if(till){ active = till; till.focus(); till.dispatchEvent(new Event('input', { bubbles:true })); }
          else if(rad0) rensaRad(rad0);
          return;
        }
        var mal = operatorMal(active, k);                     // räknesätt i bråkfält → texten efter widgeten
        if(mal !== active){ active = mal; grow(active); }
        active.value += k;
        active.dispatchEvent(new Event('input', { bubbles:true }));
        active.focus();
      });
    });
    if(kpEl && !arOrdruta(active, doljSel)) graderaKeypad(kpEl, active);   // FAS 2: initialt läge före första fokus
    // grow + clear-on-edit + auto-mellanslag
    pa('input', function(e){
      var t = e.target; if(!t.classList || !t.classList.contains('ak8-in')) return;
      if(t.matches && t.matches(UTTRYCKSRUTOR)) autoSpace(t);   // mellanrum + riktiga tecken i uttrycks-rutor
      grow(t);
      var rad = t.closest('.ak8-rad'); if(rad) rensaRad(rad);
    });
    // enter → nästa ruta; fysiskt Backspace i tom byggcell → ta bort strukturen (samma som keypadens ⌫,
    // som förr var enda vägen ut → en felklickad bråk-/potenscell gick ej att ångra med tangentbordet).
    pa('keydown', function(e){
      if(e.target.tagName !== 'INPUT') return;
      if(e.key === 'Backspace' && e.target.value === ''){
        // tom ruta: samma regel som keypadens ⌫ — hoppa in i widgeten före, ta bort tom widget, göm tillagt led
        var till = radera(e.target);
        if(till){ e.preventDefault(); till.focus(); till.dispatchEvent(new Event('input', { bubbles:true })); }
        return;
      }
      // räknesätt skrivet i ett bråk-/potensfält → hoppar till texten efter widgeten (FAS 1)
      if(OPER[e.key] && /ak8-(frt|frn|pbase|pexp)/.test(e.target.className) && e.target.closest('.ak8-expr')){
        var mal = operatorMal(e.target, e.key);
        if(mal !== e.target){ e.preventDefault(); mal.value += (e.key === '-' ? '−' : e.key === '*' ? '·' : e.key); grow(mal); mal.focus(); mal.dispatchEvent(new Event('input', { bubbles:true })); }
        return;
      }
      if(e.key !== 'Enter') return;
      e.preventDefault();
      var ins = Array.prototype.slice.call(mount.querySelectorAll('input:not([disabled])')), i = ins.indexOf(e.target);
      if(i > -1 && ins[i + 1]) ins[i + 1].focus();
    });
    // clear-on-edit även för knapp-baserade svar (chips/ordna/valjflera) vid klick
    pa('click', function(e){
      var b = e.target.closest && e.target.closest('.ak8-chip, .ak8-tal, .ak8-vf, .ak8-korval'); if(!b) return;
      var rad = b.closest('.ak8-rad'); if(rad) rensaRad(rad);
    }, true);
    // "+ led" / "− led" i fri kedja: avslöja nästa dolda led resp. göm det senast tillagda (delad för alla kedje-blad)
    pa('click', function(e){
      var b = e.target.closest && e.target.closest('[data-mer],[data-mindre]'); if(!b) return;
      var rad = b.closest('.ak8-rad'); if(!rad) return;
      if(b.hasAttribute('data-mer')){ var d = ledAvsloja(rad); if(d){ var i0 = d.querySelector('input'); if(i0){ i0.focus(); active = i0; } } }
      else { var till = ledGom(rad); if(till){ var s = sistaRuta(till); if(s){ s.focus(); active = s; } } rensaRad(rad); }
    });
    mount.querySelectorAll('.ak8-rad-kedja').forEach(ledKnappar);   // knapparnas startläge (− led gömd tills ett led lagts till)
    // initiala bredder + auto-fokus (utan att skrolla)
    mount.querySelectorAll('.ak8-in').forEach(grow);
    if(opts.focus !== false){ var f0 = mount.querySelector('.ak8-in:not([disabled])'); if(f0){ try { f0.focus({ preventScroll:true }); } catch(e){ f0.focus(); } } }
    // skriv ut
    var pr = mount.querySelector('[data-print]'); if(pr) pr.onclick = function(){ window.print(); };
  }

  // ── UNIVERSELL KEYPAD-BINDNING ──  för ytor UTAN ak8-widgets (öva-blad, prov, drillar, ovamer).
  // keypadHTML(...) monteras i mount; denna binder EN keypad som följer fokus, döljer sig för
  // ordsvars-rutor (data-nokeypad) och scrollar fram den aktiva rutan så den aldrig hamnar bakom
  // keypaden. Ingen egen keypad ska skrivas — alla ytor mäter mot den här. opts: { hideFor, ops }.
  function bindKeypad(mount, opts){
    opts = opts || {};
    var doljSel = opts.hideFor || '[data-nokeypad]';
    var kp = mount.querySelector('.keypad') || document.querySelector('.keypad');
    var active = mount.querySelector('input:not([disabled])'), sisteFram = null;
    mount.addEventListener('focusin', function(e){
      if(e.target.tagName !== 'INPUT') return;
      active = e.target;
      var dolj = arOrdruta(active, doljSel); if(kp) kp.classList.toggle('keypad-hidden', dolj);
      if(kp && !dolj) graderaKeypad(kp, active);   // FAS 2: gråa knappar rättaren ej accepterar
      if(!dolj && active !== sisteFram) skrollaFram(kp, active);
      sisteFram = active;
    });
    if(kp) kp.querySelectorAll('.kp-key').forEach(function(btn){
      btn.addEventListener('mousedown', function(e){
        if(btn.classList.contains('kp-inactive')) return;   // FAS 2: grå knapp = inaktiv
        e.preventDefault();
        if(!active || active.disabled){ var f = mount.querySelector('input:not([disabled])'); if(f) active = f; else return; }
        var k = btn.dataset.key, ml = parseInt(active.getAttribute('maxlength') || '0', 10);
        // Byggartangenterna kan ägas av monteringen (kedjans rutor bygger sitt eget bråk-segment).
        // Utan hook, eller när den returnerar false, görs som förut.
        if(opts.byggare && (k === 'frac' || k === 'pot' || k === 'back')){
          if(opts.byggare(k, active) === true){ active.dispatchEvent(new Event('input', { bubbles: true })); return; }
        }
        if(k === 'back'){ active.value = active.value.slice(0, -1); }
        else if(!ml || active.value.length < ml){ active.value += k; }
        active.dispatchEvent(new Event('input', { bubbles:true }));
        active.focus({ preventScroll:true });
      });
    });
    if(kp && !arOrdruta(active, doljSel)) graderaKeypad(kp, active);   // FAS 2: initialt läge
    mount.addEventListener('keydown', function(e){
      if(e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
      e.preventDefault();
      var ins = Array.prototype.slice.call(mount.querySelectorAll('input:not([disabled])')), i = ins.indexOf(e.target);
      if(i > -1 && ins[i + 1]) ins[i + 1].focus();
    });
    // Keypaden är SYNLIG som standard; döljs först när en ordsvars-ruta FAKTISKT har fokus (ej bara
    // för att sidans första ruta råkar vara ett ordsvar). Kolla document.activeElement, inte första input.
    var _af = document.activeElement;
    if(kp) kp.classList.toggle('keypad-hidden', !!(_af && _af.tagName === 'INPUT' && arOrdruta(_af, doljSel)));
  }

  // ── renderSheet — HELA bladets omslag som ETT kontrakt (FAS 2). ──
  // Emitterar exakt den form varje åk8-blad har: .ovn-sheet + h2 + .ovn-grupp×N (renderGrupp: numrering
  // N. + a/b/c) + kontrollrad (Kontrollera / Återställ / ev. extra knappar / Skriv ut) + .ovn-sammanf + keypad,
  // och kör bindSheet. Ett blad som monteras här KAN inte utelämna omslaget eller rubriken — det var luckan i
  // dk11 (html började med '' i st f '<div class="ovn-sheet"><h2>…'). Utseendet kommer ur ak8-blad-kanon.css.
  //   grupper[i]: { rubrik, rader, logg? }   logg → data-logg på .ovn-grupp (mastery per grupp)
  //   opts: { kontrollera(mount), reset(mount), resetLabel?, knappar?:[{attr,text,onclick(mount)}], keypad?:opts|false, print?:bool }
  function renderSheet(mount, titel, grupper, renderRad, opts){
    opts = opts || {};
    var html = '<div class="ovn-sheet"><h2>' + titel + '</h2>';
    grupper.forEach(function(g, gi){
      html += '<div class="ovn-grupp"' + (g.logg ? ' data-logg="' + g.logg + '"' : '') + '>' + renderGrupp(g, gi + 1, renderRad) + '</div>';
    });
    html += '<div class="ovn-kontroll-rad"><button type="button" class="ovn-kontroll" data-kontroll>Kontrollera</button>'
      + '<button type="button" class="ovn-aterstall" data-reset>' + (opts.resetLabel || 'Återställ') + '</button>';
    (opts.knappar || []).forEach(function(k){ html += '<button type="button" class="ovn-aterstall" ' + k.attr + '>' + k.text + '</button>'; });
    if(opts.print !== false) html += printKnappHTML();
    html += '</div><div class="ovn-sammanf" data-sammanf hidden></div></div>';
    if(opts.keypad !== false) html += keypadHTML(opts.keypad || undefined);
    mount.innerHTML = html;
    var k1 = mount.querySelector('[data-kontroll]'); if(k1 && opts.kontrollera) k1.onclick = function(){ opts.kontrollera(mount); };
    var k2 = mount.querySelector('[data-reset]');    if(k2 && opts.reset)       k2.onclick = function(){ opts.reset(mount); };
    (opts.knappar || []).forEach(function(k){ var b = mount.querySelector('[' + k.attr + ']'); if(b && k.onclick) b.onclick = function(){ k.onclick(mount); }; });
    bindSheet(mount);
    return mount;
  }

  window.AK8_UI = {
    pNum: pNum, evalArith: evalArith, inTal: inTal, bindKeypad: bindKeypad,
    gruppRubrik: gruppRubrik, injLabel: injLabel, injLabelN: injLabelN, renderGrupp: renderGrupp, renderSheet: renderSheet, markeraRutor: markeraRutor,
    grow: grow, ansCell: ansCell, potAnsCell: potAnsCell, cellRead: cellRead, exprSerialize: exprSerialize,
    komplexBrakHTML: komplexBrakHTML, komplexBrakCell: komplexBrakCell,
    ledWrap: ledWrap, kedjaRadHTML: kedjaRadHTML, kedjaCeller: kedjaCeller,
    keypadHTML: keypadHTML, printKnappHTML: printKnappHTML, bindSheet: bindSheet,
    markera: markera, rensaRad: rensaRad, besvarad: besvarad
  };
})();
