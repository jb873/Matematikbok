/* ============================================================
   blad-k2-d1.js — ÖVA-BLADET för k2 Del 1 "Andel och antal" (BILDBASERAT).

   EXAKT-FÖRFATTAT av Joachim ("Antal och andel.docx", 17 uppgifter i ordning).
   Delkapitlet är nästan helt visuellt. Figurerna GENERERAS som SVG i bokens
   palett — inga PNG ur läromedlet i repot. Bråk renderas som stående bråk.

   PILOT (denna omgång): figurtypen "DELAD FIGUR" (kvadrat/cirkel/rektangel/hexagon
   delad i n, k färgade) — driver uppg 1, 3, 9 + framtida "andel färgad"-drill.
   Övriga figurtyper (tallinje, klickbart rutnät, antalsfigur, rutnäts-area) byggs
   efter OK på den visuella stilen; deras uppgifter visas som skelett så länge.

   Additivt skal: wire:ar val-raden (#tab-row) och låser upp testfliken.
   Rör inga motorer/mellanled. Laddas som klassiskt <script> sist i sidan.
   ============================================================ */
(function(){
  'use strict';

  // ── Palett (bokens färger, inte originalets) ──
  var C_LINE = '#3d3630';    // ink-soft (kontur)
  var C_FILL = '#2f6ea0';    // blå (färgad andel)
  var C_PAPER = '#ffffff';   // ofärgad

  function svg(inner, w, h){
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" '
      + 'style="display:block;overflow:visible;">' + inner + '</svg>';
  }
  function fyllOk(fyllda, i){ return fyllda.indexOf(i) > -1; }

  // ── FIGURTYP 1: DELAD FIGUR (pilot) ─────────────────────────
  // Kvadrat/rektangel delad i rows×cols rutor, fyllda = index (radvis)
  function delRuta(rows, cols, fyllda){
    var W = 120, H = 120, cw = W / cols, ch = H / rows, s = '';
    for(var r = 0; r < rows; r++) for(var c = 0; c < cols; c++){
      var i = r * cols + c;
      s += '<rect x="' + (c * cw).toFixed(1) + '" y="' + (r * ch).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ch.toFixed(1)
        + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>';
    }
    return svg(s, W, H);
  }
  // Kvadrat med båda diagonalerna → 4 trianglar (0=topp,1=höger,2=botten,3=vänster)
  function delKryss(fyllda){
    var tri = ['0,0 120,0 60,60', '120,0 120,120 60,60', '120,120 0,120 60,60', '0,120 0,0 60,60'], s = '';
    tri.forEach(function(p, i){ s += '<polygon points="' + p + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; });
    return svg(s, 120, 120);
  }
  // Kvadrat i 8 trianglar (diagonaler + mittlinjer)
  function delAtta(fyllda){
    var b = [[60,0],[120,0],[120,60],[120,120],[60,120],[0,120],[0,60],[0,0]], s = '';
    for(var i = 0; i < 8; i++){ var p = b[i], q = b[(i + 1) % 8]; s += '<polygon points="60,60 ' + p[0] + ',' + p[1] + ' ' + q[0] + ',' + q[1] + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; }
    return svg(s, 120, 120);
  }
  // Cirkel i n sektorer (start rakt upp, medurs), fyllda = index
  function delCirkel(n, fyllda){
    var cx = 60, cy = 60, r = 56, s = '';
    for(var i = 0; i < n; i++){
      var a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var large = (a1 - a0) > Math.PI ? 1 : 0;
      s += '<path d="M' + cx + ',' + cy + ' L' + x0.toFixed(2) + ',' + y0.toFixed(2) + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' Z" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>';
    }
    return svg(s, 120, 120);
  }
  // Triangel delad i 4 (mittpunkter): 0=vänster hörn,1=höger hörn,2=topp,3=mitten
  function delTriangel4(fyllda){
    var A = [4,116], B = [116,116], C = [60,6], AB = [60,116], BC = [88,61], CA = [32,61];
    var tri = [[A,CA,AB],[B,AB,BC],[C,CA,BC],[CA,AB,BC]], s = '';
    tri.forEach(function(t, i){ s += '<polygon points="' + t.map(function(p){ return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; });
    return svg(s, 120, 122);
  }
  // Hexagon i 6 trianglar från centrum
  function delHexagon(fyllda){
    var cx = 60, cy = 60, r = 56, pts = [], s = '';
    for(var k = 0; k < 6; k++){ var a = -Math.PI / 2 + k * Math.PI / 3; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    for(var i = 0; i < 6; i++){ var p = pts[i], q = pts[(i + 1) % 6]; s += '<polygon points="' + cx + ',' + cy + ' ' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ' ' + q[0].toFixed(1) + ',' + q[1].toFixed(1) + '" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; }
    return svg(s, 120, 120);
  }
  // Rektangel-strip 1×n
  function delStrip(n, fyllda){
    var W = 46 * n, H = 46, s = '';
    for(var i = 0; i < n; i++){ s += '<rect x="' + (i * 46) + '" y="0" width="46" height="46" fill="' + (fyllOk(fyllda, i) ? C_FILL : C_PAPER) + '" stroke="' + C_LINE + '" stroke-width="2"/>'; }
    return svg(s, W, H);
  }

  // ── Stående bråk (för facit) ──
  function frac(t, n){
    return '<span class="ovn-brak"><span class="ovn-brak-taljare">' + t + '</span>'
         + '<span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare">' + n + '</span></span>';
  }
  // Rad av a/b/c-figurer med etikett
  function figrad(items){
    return '<div class="d1-figrad">' + items.map(function(it){
      return '<div class="d1-fig"><span class="d1-fig-etikett">' + it.lbl + '</span>' + it.svg + '</div>';
    }).join('') + '</div>';
  }

  // ── UPPGIFTERNA (exakt ordning). typ: 'delad' = pilot-figurer; 'skeleton' = figur byggs ──
  var UPPG = [
    { nr: 1, rubrik: 'Hur stor andel av figuren är färgad?', typ: 'delad',
      innehall: figrad([ { lbl: 'a)', svg: delRuta(2,2,[2]) }, { lbl: 'b)', svg: delKryss([2]) }, { lbl: 'c)', svg: delAtta([5]) } ]),
      facit: 'a) ' + frac(1,4) + ' &nbsp;&nbsp; b) ' + frac(1,4) + ' &nbsp;&nbsp; c) ' + frac(1,8) },
    { nr: 2, rubrik: 'Vilket bråk pekar pilen på?', typ: 'skeleton', fig: 'tallinje (0–1, pil)' },
    { nr: 3, rubrik: 'Hur stor del av figuren är färgad?', typ: 'delad',
      innehall: figrad([ { lbl: 'a)', svg: delHexagon([0,2,4]) }, { lbl: 'b)', svg: delKryss([1,2]) }, { lbl: 'c)', svg: delStrip(3,[2]) } ]),
      facit: 'a) ' + frac(3,6) + ' &nbsp;&nbsp; b) ' + frac(1,2) + ' &nbsp;&nbsp; c) ' + frac(1,3) + ' &nbsp;<span class="d1-flagg">(exakta andelar 3a/3b bekräftas mot figuren)</span>' },
    { nr: 4, rubrik: 'Skriv två hela i bråkform på tre olika sätt.', typ: 'text',
      facit: 'T.ex. ' + frac(2,1) + ' = ' + frac(4,2) + ' = ' + frac(6,3) + ' &nbsp;<span class="d1-flagg">(villkors-validering i drillen: valfritt bråk = 2)</span>' },
    { nr: 5, rubrik: 'Vilka av påståendena är riktiga?', typ: 'text',
      innehall: '<div class="d1-pastaenden">'
        + 'a) ' + frac(1,3) + ' &gt; ' + frac(1,4) + ' &nbsp;&nbsp; b) ' + frac(2,3) + ' &gt; ' + frac(3,4) + ' &nbsp;&nbsp; c) ' + frac(2,5) + ' + ' + frac(3,5) + ' = 1<br>'
        + 'd) ' + frac(2,5) + ' &gt; ' + frac(1,2) + ' &nbsp;&nbsp; e) ' + frac(1,2) + ' = ' + frac(2,4) + ' = ' + frac(3,6) + ' &nbsp;&nbsp; f) ' + frac(4,5) + ' &lt; ' + frac(5,6) + '</div>',
      facit: 'Riktiga: <strong>a, c, e, f</strong>. (b: ' + frac(2,3) + ' &lt; ' + frac(3,4) + '; d: ' + frac(2,5) + ' &lt; ' + frac(1,2) + ')' },
    { nr: 6, rubrik: 'Vilka är talen A och B på tallinjen?', typ: 'skeleton', fig: 'tallinje (A, B)' },
    { nr: 7, rubrik: 'Hur stor del av den färgade figuren utgör den röda triangeln?', typ: 'skeleton', fig: 'rutnäts-area (hus: röd triangel + blått)' },
    { nr: 8, rubrik: 'Markera rätt antal rutor så andelen stämmer.', typ: 'skeleton', fig: 'klickbart rutnät (4 strips à 12 rutor: 1/12, 1/6, 1/3, 1/4)' },
    { nr: 9, rubrik: 'Hur stor andel av figuren är färgad?', typ: 'delad',
      innehall: figrad([ { lbl: 'a)', svg: delCirkel(3,[1]) }, { lbl: 'b)', svg: delTriangel4([3]) }, { lbl: 'c)', svg: delAtta([5]) } ]),
      facit: 'a) ' + frac(1,3) + ' &nbsp;&nbsp; b) ' + frac(1,4) + ' &nbsp;&nbsp; c) ' + frac(1,8) },
    { nr: 10, rubrik: 'Kulor', typ: 'rubrik' },
    { nr: 11, rubrik: 'Hur stor andel av Hugos kulor är blå?', typ: 'skeleton', fig: 'antalsfigur (3 blå, 1 röd)' },
    { nr: 12, rubrik: 'Hur stor andel av Hannas kulor är blå?', typ: 'skeleton', fig: 'antalsfigur (4 blå, 2 röda)' },
    { nr: 13, rubrik: 'Vem har flest blå kulor?', typ: 'text', facit: '<strong>Hanna</strong> (4 blå &gt; Hugos 3).' },
    { nr: 14, rubrik: 'Vem har störst andel blåa kulor?', typ: 'text', facit: '<strong>Hugo</strong> (' + frac(3,4) + ' &gt; ' + frac(2,3) + '). &nbsp;<span class="d1-flagg">Kärnan: flest ≠ störst andel.</span>' },
    { nr: 15, rubrik: 'Vilka är talen A, B och C på tallinjen?', typ: 'skeleton', fig: 'tallinje ×3 (A, B, C)' },
    { nr: 16, rubrik: 'I en hage finns det 7 hästar och 15 kor. Hur stor andel av djuren är hästar?', typ: 'text', facit: frac(7,22) },
    { nr: 17, rubrik: 'Hur stor andel av figurens omkrets är grön, blå respektive röd?', typ: 'skeleton', fig: 'rutnäts-area (L-figur, färgad omkrets)' }
  ];

  function ensureCSS(){
    if(document.getElementById('d1-css')) return;
    var s = document.createElement('style'); s.id = 'd1-css';
    s.textContent =
      '.d1-figrad{display:flex;flex-wrap:wrap;gap:34px;align-items:flex-end;margin:14px 0 6px;}'
    + '.d1-fig{display:flex;flex-direction:column;align-items:center;gap:8px;}'
    + '.d1-fig-etikett{font-family:var(--cinzel,"Cinzel");font-size:12px;color:var(--ink-faint,#7a6e65);align-self:flex-start;}'
    + '.d1-pastaenden{font-size:19px;line-height:2.2;margin:10px 0;}'
    + '.d1-skelett{display:flex;align-items:center;gap:10px;margin:12px 0;padding:14px 16px;border:1px dashed var(--paper-dk,#ede6d6);border-radius:8px;color:var(--ink-faint,#7a6e65);font-size:14px;font-style:italic;}'
    + '.d1-skelett::before{content:"▨";font-size:18px;font-style:normal;color:var(--gold-lt,#c49a40);}'
    + '.d1-flagg{font-size:12.5px;color:var(--ink-faint,#7a6e65);font-style:italic;}'
    + '.d1-facit-btn{font-family:var(--cinzel,"Cinzel");font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--gold,#9a7228);background:none;border:1px solid var(--paper-dk,#ede6d6);border-radius:6px;padding:5px 12px;margin-top:10px;cursor:pointer;}'
    + '.d1-facit-btn:hover{border-color:var(--gold-lt,#c49a40);color:var(--ink,#12110f);}'
    + '.d1-facit{margin-top:8px;padding:10px 14px;background:rgba(154,114,40,.06);border-left:3px solid var(--gold,#9a7228);border-radius:4px;font-size:18px;line-height:1.9;}';
    document.head.appendChild(s);
  }

  function render(){
    var mount = document.getElementById('sheet-andel');
    if(!mount) return;
    ensureCSS();
    var html = '<div class="ovn-sheet"><h2>Andel och antal</h2>'
      + '<p class="ovn-intro">Figurerna är ritade i bokens färger. Läs av andelen och skriv den som bråk.</p>';
    UPPG.forEach(function(u){
      if(u.typ === 'rubrik'){ html += '<h3 style="font-family:var(--serif);font-size:21px;margin:26px 0 2px;color:var(--ink);">' + u.rubrik + '</h3>'; return; }
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">'
            + '<span class="ovn-label" style="min-width:24px;">' + u.nr + '.</span>' + u.rubrik + '</div>';
      if(u.innehall) html += u.innehall;
      if(u.typ === 'skeleton') html += '<div class="d1-skelett">Figur: ' + u.fig + ' — byggs som SVG efter pilot-OK.</div>';
      if(u.facit) html += '<button class="d1-facit-btn" data-nr="' + u.nr + '">Visa facit</button>'
        + '<div class="d1-facit" id="d1-facit-' + u.nr + '" hidden>' + u.facit + '</div>';
      html += '</div>';
    });
    html += '</div>';
    mount.innerHTML = html;
    mount.querySelectorAll('.d1-facit-btn').forEach(function(b){
      b.onclick = function(){ var f = document.getElementById('d1-facit-' + b.dataset.nr); if(f.hasAttribute('hidden')){ f.removeAttribute('hidden'); b.textContent = 'Dölj facit'; } else { f.setAttribute('hidden', ''); b.textContent = 'Visa facit'; } };
    });
  }

  function wireTabs(){
    var tabRow = document.getElementById('tab-row');
    if(!tabRow) return;
    tabRow.querySelectorAll('.tab-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.dataset.tab;
        tabRow.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.toggle('is-active', b === btn); });
        document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.toggle('is-active', p.dataset.panel === id); });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    var tb = tabRow.querySelector('.tab-btn[data-tab="test"]'); if(tb) tb.classList.remove('is-locked');
  }

  render();
  wireTabs();
})();
