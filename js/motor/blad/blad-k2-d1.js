/* ============================================================
   blad-k2-d1.js — ÖVA-BLADET för k2 Del 1 "Andel och antal" (BILDBASERAT).

   EXAKT-FÖRFATTAT av Joachim ("Antal och andel.docx", 17 uppgifter i ordning).
   Figurerna GENERERAS som SVG i bokens palett — inga PNG ur läromedlet i repot.

   Eleven SKRIVER svar per uppgift (stående bråk / flerval) och trycker
   KONTROLLERA i slutet — självrättning som de andra bladen (färg + facit +
   sammanfattning + konfetti). Andel godkänns värde-lika (2/8 = 1/4).

   PILOT-figurtyp "DELAD FIGUR" driver uppg 1, 3, 9. Övriga figurtyper
   (tallinje, klickbart rutnät, antalsfigur, rutnäts-area) visas som skelett
   tills de byggs. Rör inga motorer/mellanled. Laddas som <script> sist i sidan.
   ============================================================ */
(function(){
  'use strict';

  var C_LINE = '#3d3630', C_FILL = '#2f6ea0', C_PAPER = '#ffffff';
  function svg(inner, w, h){ return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" style="display:block;overflow:visible;">' + inner + '</svg>'; }
  function fyllOk(f, i){ return f.indexOf(i) > -1; }

  // ── FIGURTYP 1: DELAD FIGUR (SVG-generatorer) ──
  function delRuta(rows, cols, fyllda){
    var W = 120, H = 120, cw = W / cols, ch = H / rows, s = '';
    for(var r = 0; r < rows; r++) for(var c = 0; c < cols; c++){ var i = r * cols + c;
      s += '<rect x="' + (c * cw).toFixed(1) + '" y="' + (r * ch).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ch.toFixed(1) + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; }
    return svg(s, W, H);
  }
  function delKryss(fyllda){
    var tri = ['0,0 120,0 60,60', '120,0 120,120 60,60', '120,120 0,120 60,60', '0,120 0,0 60,60'], s = '';
    tri.forEach(function(p, i){ s += '<polygon points="' + p + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; });
    return svg(s, 120, 120);
  }
  function delAtta(fyllda){
    var b = [[60,0],[120,0],[120,60],[120,120],[60,120],[0,120],[0,60],[0,0]], s = '';
    for(var i = 0; i < 8; i++){ var p = b[i], q = b[(i + 1) % 8]; s += '<polygon points="60,60 ' + p[0] + ',' + p[1] + ' ' + q[0] + ',' + q[1] + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; }
    return svg(s, 120, 120);
  }
  function delCirkel(n, fyllda){
    var cx = 60, cy = 60, r = 56, s = '';
    for(var i = 0; i < n; i++){ var a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1), large = (a1 - a0) > Math.PI ? 1 : 0;
      s += '<path d="M' + cx + ',' + cy + ' L' + x0.toFixed(2) + ',' + y0.toFixed(2) + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' Z" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; }
    return svg(s, 120, 120);
  }
  function delTriangel4(fyllda){
    var A = [4,116], B = [116,116], C = [60,6], AB = [60,116], BC = [88,61], CA = [32,61];
    var tri = [[A,CA,AB],[B,AB,BC],[C,CA,BC],[CA,AB,BC]], s = '';
    tri.forEach(function(t, i){ s += '<polygon points="' + t.map(function(p){ return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; });
    return svg(s, 120, 122);
  }
  function delHexagon(fyllda){
    var cx = 60, cy = 60, r = 56, pts = [], s = '';
    for(var k = 0; k < 6; k++){ var a = -Math.PI / 2 + k * Math.PI / 3; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    for(var i = 0; i < 6; i++){ var p = pts[i], q = pts[(i + 1) % 6]; s += '<polygon points="' + cx + ',' + cy + ' ' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ' ' + q[0].toFixed(1) + ',' + q[1].toFixed(1) + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; }
    return svg(s, 120, 120);
  }
  function delStrip(n, fyllda){
    var W = 46 * n, s = '';
    for(var i = 0; i < n; i++){ s += '<rect x="' + (i * 46) + '" y="0" width="46" height="46" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; }
    return svg(s, W, 46);
  }

  function frac(t, n){ return '<span class="ovn-brak"><span class="ovn-brak-taljare">' + t + '</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare">' + n + '</span></span>'; }
  // Stående-bråk-INMATNING med facit (godkänns värde-lika)
  function svarBrak(t, n){
    return '<span class="d1-svar d1-svarbrak" data-typ="brak" data-t="' + t + '" data-n="' + n + '">'
      + '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ovn-in d1-in d1-in-t" inputmode="numeric" autocomplete="off"></span>'
      + '<span class="ovn-brak-strecket"></span>'
      + '<span class="ovn-brak-namnare"><input class="ovn-in d1-in d1-in-n" inputmode="numeric" autocomplete="off"></span></span></span>';
  }
  // Figurrad: figur + svarsruta under varje
  function figrad(items){
    return '<div class="d1-figrad">' + items.map(function(it){
      return '<div class="d1-fig"><span class="d1-fig-etikett">' + it.lbl + '</span>' + it.svg + svarBrak(it.t, it.n) + '</div>';
    }).join('') + '</div>';
  }

  // ── UPPGIFTERNA (exakt ordning) ──
  var UPPG = [
    { nr: 1, rubrik: 'Hur stor andel av figuren är färgad?', typ: 'delad',
      innehall: figrad([ { lbl: 'a)', svg: delRuta(2,2,[2]), t:1, n:4 }, { lbl: 'b)', svg: delKryss([2]), t:1, n:4 }, { lbl: 'c)', svg: delAtta([5]), t:1, n:8 } ]) },
    { nr: 2, rubrik: 'Vilket bråk pekar pilen på?', typ: 'skeleton', fig: 'tallinje (0–1, pil)' },
    { nr: 3, rubrik: 'Hur stor del av figuren är färgad?', typ: 'delad',
      innehall: figrad([ { lbl: 'a)', svg: delHexagon([0,2,4]), t:3, n:6 }, { lbl: 'b)', svg: delKryss([1,2]), t:1, n:2 }, { lbl: 'c)', svg: delStrip(3,[2]), t:1, n:3 } ]) },
    { nr: 4, rubrik: 'Skriv två hela i bråkform på tre olika sätt.', typ: 'villkor',
      innehall: '<div class="d1-svar d1-villkor" data-typ="villkor-hela" data-varde="2" data-antal="3">'
        + svarBrakRaw('vh0') + '<span class="d1-komma">,</span>' + svarBrakRaw('vh1') + '<span class="d1-komma">,</span>' + svarBrakRaw('vh2') + '</div>' },
    { nr: 5, rubrik: 'Vilka av påståendena är riktiga? Klicka de riktiga.', typ: 'flerval',
      innehall: flervalHtml([ ['a', frac(1,3) + ' &gt; ' + frac(1,4)], ['b', frac(2,3) + ' &gt; ' + frac(3,4)], ['c', frac(2,5) + ' + ' + frac(3,5) + ' = 1'], ['d', frac(2,5) + ' &gt; ' + frac(1,2)], ['e', frac(1,2) + ' = ' + frac(2,4) + ' = ' + frac(3,6)], ['f', frac(4,5) + ' &lt; ' + frac(5,6)] ], [0,2,4,5]) },
    { nr: 6, rubrik: 'Vilka är talen A och B på tallinjen?', typ: 'skeleton', fig: 'tallinje (A, B)' },
    { nr: 7, rubrik: 'Hur stor del av den färgade figuren utgör den röda triangeln?', typ: 'skeleton', fig: 'rutnäts-area (hus: röd triangel + blått)' },
    { nr: 8, rubrik: 'Markera rätt antal rutor så andelen stämmer.', typ: 'skeleton', fig: 'klickbart rutnät (4 strips à 12 rutor: 1/12, 1/6, 1/3, 1/4)' },
    { nr: 9, rubrik: 'Hur stor andel av figuren är färgad?', typ: 'delad',
      innehall: figrad([ { lbl: 'a)', svg: delCirkel(3,[1]), t:1, n:3 }, { lbl: 'b)', svg: delTriangel4([3]), t:1, n:4 }, { lbl: 'c)', svg: delAtta([5]), t:1, n:8 } ]) },
    { nr: 10, rubrik: 'Kulor', typ: 'rubrik' },
    { nr: 11, rubrik: 'Hur stor andel av Hugos kulor är blå?', typ: 'skeleton', fig: 'antalsfigur (3 blå, 1 röd)' },
    { nr: 12, rubrik: 'Hur stor andel av Hannas kulor är blå?', typ: 'skeleton', fig: 'antalsfigur (4 blå, 2 röda)' },
    { nr: 13, rubrik: 'Vem har flest blå kulor?', typ: 'skeleton', fig: 'besvaras när kul-figurerna (11–12) är byggda' },
    { nr: 14, rubrik: 'Vem har störst andel blåa kulor?', typ: 'skeleton', fig: 'besvaras när kul-figurerna (11–12) är byggda' },
    { nr: 15, rubrik: 'Vilka är talen A, B och C på tallinjen?', typ: 'skeleton', fig: 'tallinje ×3 (A, B, C)' },
    { nr: 16, rubrik: 'I en hage finns det 7 hästar och 15 kor. Hur stor andel av djuren är hästar?', typ: 'brak',
      innehall: '<div style="margin-top:10px;">' + svarBrak(7,22) + '</div>' },
    { nr: 17, rubrik: 'Hur stor andel av figurens omkrets är grön, blå respektive röd?', typ: 'skeleton', fig: 'rutnäts-area (L-figur, färgad omkrets)' }
  ];

  // hjälpare som behöver definieras före UPPG-användning kräver hoisting → funktionsdeklarationer:
  function svarBrakRaw(id){
    return '<span class="d1-svarbrak" data-slot="' + id + '"><span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ovn-in d1-in d1-in-t" inputmode="numeric" autocomplete="off"></span>'
      + '<span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ovn-in d1-in d1-in-n" inputmode="numeric" autocomplete="off"></span></span></span>';
  }
  function flervalHtml(rader, ratt){
    return '<div class="d1-svar d1-flerval" data-typ="flerval" data-ratt="' + ratt.join(',') + '">'
      + rader.map(function(r, i){ return '<button type="button" class="d1-chip" data-i="' + i + '"><span class="d1-chip-lbl">' + r[0] + ')</span> ' + r[1] + '</button>'; }).join('') + '</div>';
  }

  function visaKonfetti(){
    var gammal = document.querySelector('.konfetti-lager'); if(gammal) gammal.remove();
    var lager = document.createElement('div'); lager.className = 'konfetti-lager'; document.body.appendChild(lager);
    var farger = ['#16a34a','#dc2626','#f59e0b','#3b82f6','#a855f7','#ec4899','#06b6d4'];
    for(var i = 0; i < 80; i++){ var b = document.createElement('span'); b.className = 'konfetti';
      b.style.left = (Math.random() * 100) + 'vw'; b.style.background = farger[Math.floor(Math.random() * farger.length)];
      b.style.animationDuration = (2.5 + Math.random() * 2) + 's'; b.style.animationDelay = (Math.random() * 0.8) + 's';
      b.style.width = (6 + Math.random() * 8) + 'px'; b.style.height = (10 + Math.random() * 8) + 'px'; lager.appendChild(b); }
    setTimeout(function(){ if(lager) lager.remove(); }, 5000);
  }

  function ensureCSS(){
    if(document.getElementById('d1-css')) return;
    var s = document.createElement('style'); s.id = 'd1-css';
    s.textContent =
      '.d1-figrad{display:flex;flex-wrap:wrap;gap:34px;align-items:flex-start;margin:14px 0 6px;}'
    + '.d1-fig{display:flex;flex-direction:column;align-items:center;gap:10px;}'
    + '.d1-fig-etikett{font-family:var(--cinzel,"Cinzel");font-size:12px;color:var(--ink-faint,#7a6e65);align-self:flex-start;}'
    + '.d1-in{width:46px !important;height:34px !important;text-align:center;font-size:17px;padding:2px 0 !important;}'
    + '.d1-svarbrak .ovn-brak-strecket{min-width:46px;}'
    + '.d1-villkor{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;}'
    + '.d1-komma{font-size:20px;color:var(--ink-faint,#7a6e65);margin:0 4px;}'
    + '.d1-flerval{display:flex;flex-direction:column;gap:8px;margin-top:12px;align-items:flex-start;}'
    + '.d1-chip{display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-size:18px;background:#fff;border:1.5px solid var(--paper-dk,#ede6d6);border-radius:9px;padding:8px 16px;cursor:pointer;transition:all .12s;}'
    + '.d1-chip:hover{border-color:var(--gold-lt,#c49a40);}'
    + '.d1-chip .d1-chip-lbl{font-family:var(--cinzel,"Cinzel");font-size:12px;color:var(--ink-faint,#7a6e65);}'
    + '.d1-chip.sel{border-color:var(--navy,#0f1e2e);background:rgba(15,30,46,.05);}'
    + '.d1-chip.ratt{border-color:#2f7d4f;background:rgba(47,125,79,.12);} .d1-chip.fel{border-color:#c0392b;background:rgba(192,57,43,.10);}'
    + '.d1-chip.miss{border-style:dashed;border-color:#c49a40;}'
    + '.d1-svar.klar-fel{outline:2px solid rgba(192,57,43,.25);outline-offset:4px;border-radius:8px;}'
    + '.d1-fasit{display:block;margin-top:6px;font-size:12px;color:#c0392b;}'
    + '.d1-skelett{display:flex;align-items:center;gap:10px;margin:12px 0;padding:14px 16px;border:1px dashed var(--paper-dk,#ede6d6);border-radius:8px;color:var(--ink-faint,#7a6e65);font-size:14px;font-style:italic;}'
    + '.d1-skelett::before{content:"▨";font-size:18px;font-style:normal;color:var(--gold-lt,#c49a40);}'
    + '.d1-flagg{font-size:12.5px;color:var(--ink-faint,#7a6e65);font-style:italic;}';
    document.head.appendChild(s);
  }

  function render(){
    var mount = document.getElementById('sheet-andel');
    if(!mount) return;
    ensureCSS();
    var html = '<div class="ovn-sheet"><h2>Andel och antal</h2>'
      + '<p class="ovn-intro">Figurerna är ritade i bokens färger. Skriv ditt svar som bråk och tryck <strong>Kontrollera</strong> när du är klar.</p>';
    UPPG.forEach(function(u){
      if(u.typ === 'rubrik'){ html += '<h3 style="font-family:var(--serif);font-size:21px;margin:26px 0 2px;color:var(--ink);">' + u.rubrik + '</h3>'; return; }
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik"><span class="ovn-label" style="min-width:24px;">' + u.nr + '.</span>' + u.rubrik + '</div>';
      if(u.innehall) html += u.innehall;
      if(u.typ === 'skeleton') html += '<div class="d1-skelett">Figur: ' + u.fig + ' — byggs som SVG härnäst.</div>';
      html += '</div>';
    });
    html += '<div class="ovn-kontroll-rad">'
      + '<button type="button" class="ovn-kontroll" data-action="kontroll">Kontrollera</button>'
      + '<button type="button" class="ovn-aterstall" data-action="reset">Återställ</button></div>'
      + '<div class="ovn-sammanf" data-sammanf style="display:none;"></div>';
    html += '</div>';
    mount.innerHTML = html;

    // Flerval-chips: toggla markering
    mount.querySelectorAll('.d1-flerval .d1-chip').forEach(function(ch){
      ch.onclick = function(){ if(ch.classList.contains('ratt') || ch.classList.contains('fel') || ch.classList.contains('miss')) return; ch.classList.toggle('sel'); };
    });
    mount.querySelector('[data-action="kontroll"]').onclick = function(){ kontrollera(mount); };
    mount.querySelector('[data-action="reset"]').onclick = function(){ render(); };
  }

  // ── SJÄLVRÄTTNING (Kontrollera) ──
  function kontrollera(mount){
    var svar = Array.prototype.slice.call(mount.querySelectorAll('.d1-svar'));
    var totalt = 0, ratt = 0;
    svar.forEach(function(el){
      totalt++;
      var typ = el.dataset.typ, ok = false;
      // rensa gammal färgning
      el.querySelectorAll('.ovn-in').forEach(function(inp){ inp.classList.remove('correct', 'wrong'); });
      var old = el.parentNode.querySelector('.d1-fasit'); if(old) old.remove();
      if(typ === 'brak'){
        var t = parseInt(el.querySelector('.d1-in-t').value, 10), n = parseInt(el.querySelector('.d1-in-n').value, 10);
        var ft = +el.dataset.t, fn = +el.dataset.n;
        ok = isFinite(t) && isFinite(n) && n !== 0 && Math.abs(t / n - ft / fn) < 1e-9;
        el.querySelectorAll('.ovn-in').forEach(function(inp){ inp.classList.add(ok ? 'correct' : 'wrong'); });
        if(!ok){ var f = document.createElement('span'); f.className = 'd1-fasit'; f.innerHTML = 'rätt svar: ' + ft + '/' + fn; el.insertAdjacentElement('afterend', f); }
      } else if(typ === 'villkor-hela'){
        var varde = +el.dataset.varde, brak = [];
        el.querySelectorAll('.d1-svarbrak').forEach(function(sb){ brak.push({ t: parseInt(sb.querySelector('.d1-in-t').value, 10), n: parseInt(sb.querySelector('.d1-in-n').value, 10) }); });
        var giltiga = brak.every(function(b){ return isFinite(b.t) && isFinite(b.n) && b.n !== 0 && Math.abs(b.t / b.n - varde) < 1e-9; });
        var seen = {}, distinct = true; brak.forEach(function(b){ if(!isFinite(b.t) || !b.n) return; var key = Math.round(b.t / b.n * 1e6) + '_' + b.t + '/' + b.n; if(seen[key]) distinct = false; seen[key] = 1; });
        ok = giltiga && distinct;
        el.querySelectorAll('.ovn-in').forEach(function(inp){ inp.classList.add(ok ? 'correct' : 'wrong'); });
        if(!ok){ var f2 = document.createElement('span'); f2.className = 'd1-fasit'; f2.innerHTML = 'tre olika bråk som är lika med ' + varde + ' (t.ex. 2/1, 4/2, 6/3)'; el.insertAdjacentElement('afterend', f2); }
      } else if(typ === 'flerval'){
        var rattaIdx = el.dataset.ratt.split(',').map(Number), chips = Array.prototype.slice.call(el.querySelectorAll('.d1-chip'));
        ok = true;
        chips.forEach(function(ch, i){ var vald = ch.classList.contains('sel'), rk = rattaIdx.indexOf(i) > -1; ch.classList.remove('sel');
          if(rk && vald) ch.classList.add('ratt'); else if(!rk && vald){ ch.classList.add('fel'); ok = false; } else if(rk && !vald){ ch.classList.add('miss'); ok = false; } });
      }
      el.classList.toggle('klar-fel', !ok);
      if(ok) ratt++;
    });
    var sam = mount.querySelector('[data-sammanf]');
    if(ratt === totalt && totalt > 0){
      sam.className = 'ovn-sammanf ok'; sam.style.display = '';
      sam.innerHTML = '<div class="ovn-sammanf-icon">✓</div><span class="ovn-sammanf-titel">Allt rätt!</span>Du klarade alla ' + totalt + ' besvarade uppgifterna.';
      visaKonfetti();
    } else {
      sam.className = 'ovn-sammanf delvis'; sam.style.display = '';
      sam.innerHTML = 'Du har ' + ratt + ' av ' + totalt + ' rätt. Rätta de röda och tryck Kontrollera igen.';
    }
    sam.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function wireTabs(){
    var tabRow = document.getElementById('tab-row'); if(!tabRow) return;
    tabRow.querySelectorAll('.tab-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ var id = btn.dataset.tab;
        tabRow.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.toggle('is-active', b === btn); });
        document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.toggle('is-active', p.dataset.panel === id); });
        window.scrollTo({ top: 0, behavior: 'smooth' }); });
    });
    var tb = tabRow.querySelector('.tab-btn[data-tab="test"]'); if(tb) tb.classList.remove('is-locked');
  }

  render();
  wireTabs();
})();
