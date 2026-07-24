/* ============================================================
   blad-k2-d4.js — ÖVA-BLADET för k2 Del 4 "Jämföra bråk".

   EXAKT-FÖRFATTAT av Joachim ("Jämföra bråk.docx", 13 uppgifter, ordagrant och
   i denna ordning). Statiskt blad — INGEN generator, inga slumpade tal, inget
   facit. Bråken renderas som riktiga STÅENDE bråk via samma ovn-brak-komponent
   som resten av plattformen (täljare över streck över nämnare).

   Uppgift 6 & 8: "Täljaren/Nämnaren ska vara en 8:a" (= siffran 8) enligt Joachims
   förtydligande. Typon i docx:en städade enligt hans OK (bråken → bråken, "om om"
   → "om", frågetecken på 7/11/12). Distraktorerna (17/17=1, 13/12>1, 19/20<1,
   7/7=1) ligger kvar precis som författat — de är poängen.

   Additivt skal: wire:ar val-raden (#tab-row) och låser upp testfliken (som k1).
   Rör inga motorer/mellanled. Laddas som klassiskt <script> sist i sidan.
   ============================================================ */
(function(){
  'use strict';

  // ── Stående bråk (samma markup/komponent som ovn-brak i övriga blad) ──
  function frac(t, n){
    return '<span class="ovn-brak"><span class="ovn-brak-taljare">' + t + '</span>'
         + '<span class="ovn-brak-strecket"></span>'
         + '<span class="ovn-brak-namnare">' + n + '</span></span>';
  }
  function tal(x){ return '<span class="ovn-text ovn-num">' + x + '</span>'; }
  function op(s){ return '<span class="ovn-text jmf-op">' + s + '</span>'; }
  var RUTA = '<span class="jmf-ruta" aria-hidden="true"></span>';
  var SEP  = '<span class="ovn-text jmf-sep">·</span>';

  // Lista av stående bråk separerade med punkt. par = [[t,n], ...]
  function lista(par){ return par.map(function(p){ return frac(p[0], p[1]); }).join(SEP); }
  // En rad (dotted-avgränsad) i innehållet, ev. med a)/b)-etikett
  function rad(label, innehall){
    return '<div class="jmf-rad">' + (label ? '<span class="ovn-label">' + label + '</span>' : '') + innehall + '</div>';
  }

  // ── De 13 uppgifterna, exakt och i ordning ──
  var HALV = frac(1, 2);   // "en halv" som stående bråk inline i frågetexten
  var UPPG = [
    { nr: 1, rubrik: 'Vilket bråk är störst?',
      innehall: rad('a)', frac(5,8) + op('eller') + frac(7,8)) + rad('b)', frac(3,4) + op('eller') + frac(3,5)) },
    { nr: 2, rubrik: 'Vilka av bråken är större än 1?',
      innehall: rad(null, lista([[6,7],[7,6],[23,17],[19,20],[17,17]])) },
    { nr: 3, rubrik: 'Vilka av bråken är mindre än ' + HALV + '?',
      innehall: rad(null, lista([[4,9],[7,13],[8,15],[6,13],[11,19]])) },
    { nr: 4, rubrik: 'Vilka av bråken är större än ' + HALV + ' men mindre än 1?',
      innehall: rad(null, lista([[13,12],[5,11],[7,15],[10,19],[7,6]])) },
    { nr: 5, rubrik: 'Skriv bråken i storleksordning, börja med det minsta',
      innehall: rad('a)', lista([[1,5],[1,7],[1,3],[1,9]])) + rad('b)', lista([[3,7],[3,5],[3,8],[3,4]])) },
    { nr: 6, rubrik: 'Skriv ett bråk som är större än ' + HALV + ', men mindre än 1. Täljaren ska vara en 8:a',
      innehall: '' },
    { nr: 7, rubrik: 'Vilket tecken ska stå i rutan, &lt; &gt; eller =?',
      innehall: rad(null,
        frac(5,6) + RUTA + tal(1) + SEP + frac(7,7) + RUTA + tal(1) + SEP + tal(1) + RUTA + frac(7,8) + SEP + tal(1) + RUTA + frac(9,8)) },
    { nr: 8, rubrik: 'Skriv ett bråk som är större än ' + HALV + ', men mindre än 1. Nämnaren ska vara en 8:a',
      innehall: '' },
    { nr: 9, rubrik: 'Skriv bråken i storleksordning, börja med det minsta',
      innehall: rad(null, lista([[1,3],[5,4],[3,4],[1,5]])) },
    { nr: 10, rubrik: 'Avgör om summan är större än eller mindre än 1',
      innehall: rad('a)', frac(5,10) + op('+') + frac(4,7)) + rad('b)', frac(2,5) + op('+') + frac(1,3))
              + rad('c)', frac(9,20) + op('+') + frac(2,5)) + rad('d)', frac(5,9) + op('+') + frac(2,3)) },
    { nr: 11, rubrik: 'Vilket bråk är störst?',
      innehall: rad(null, lista([[3,4],[4,5],[5,6]])) },
    { nr: 12, rubrik: 'Vilket bråk är störst?',
      innehall: rad(null, lista([[4,3],[5,4],[6,5]])) },
    { nr: 13, rubrik: 'Vilket bråk kan stå i rutan så att summan blir mindre än 1? Ge tre förslag.',
      innehall: rad(null, frac(2,3) + op('+') + RUTA + op('&lt;') + tal(1)) }
  ];

  // ── FACIT (tillagt; rör inte frågorna/ordningen/bråken ovan) ──
  // Slutna uppgifter: facit som avslöjas. Öppna (6, 8, 13): villkors-validering.
  var FACIT = {
    1:  'a) ' + frac(7,8) + ' är störst &nbsp;&nbsp; b) ' + frac(3,4) + ' är störst (samma täljare → minst nämnare störst)',
    2:  'Större än 1: ' + frac(7,6) + SEP + frac(23,17) + '. &nbsp;' + frac(17,17) + ' är exakt 1; ' + frac(6,7) + ' och ' + frac(19,20) + ' är under 1.',
    3:  'Mindre än ' + frac(1,2) + ': ' + frac(4,9) + SEP + frac(6,13) + '.',
    4:  'Endast ' + frac(10,19) + '. &nbsp;(' + frac(13,12) + ' och ' + frac(7,6) + ' är &gt; 1; ' + frac(5,11) + ' och ' + frac(7,15) + ' är &lt; ' + frac(1,2) + '.)',
    5:  'a) ' + lista([[1,9],[1,7],[1,5],[1,3]]) + ' &nbsp;&nbsp; b) ' + lista([[3,8],[3,7],[3,5],[3,4]]),
    7:  frac(5,6) + ' &lt; 1 &nbsp;&nbsp; ' + frac(7,7) + ' = 1 &nbsp;&nbsp; 1 &gt; ' + frac(7,8) + ' &nbsp;&nbsp; 1 &lt; ' + frac(9,8),
    9:  lista([[1,5],[1,3],[3,4],[5,4]]),
    10: 'a) större &nbsp;&nbsp; b) mindre &nbsp;&nbsp; c) mindre &nbsp;&nbsp; d) större &nbsp;(än 1)',
    11: frac(5,6) + ' är störst',
    12: frac(4,3) + ' är störst'
  };
  // Öppna uppgifter — villkors-validering (många rätta svar; jämför INTE mot facit)
  var KONSTR = {
    6:  { antal: 1, test: function(t, n){ return t === 8 && t / n > 0.5 && t / n < 1; }, ex: 'T.ex. ' + frac(8,9) + ', ' + frac(8,13) + ', ' + frac(8,15) },
    8:  { antal: 1, test: function(t, n){ return n === 8 && t / n > 0.5 && t / n < 1; }, ex: 'T.ex. ' + frac(5,8) + ', ' + frac(6,8) + ', ' + frac(7,8) },
    13: { antal: 3, distinkt: true, test: function(t, n){ return t > 0 && n > 0 && t / n < 1 / 3; }, ex: 'T.ex. ' + frac(1,4) + ', ' + frac(1,5) + ', ' + frac(2,7) }
  };
  function konstrBrakInput(id){
    return '<span class="ovn-brak" style="vertical-align:middle;"><span class="ovn-brak-taljare"><input class="d4-in" id="' + id + '-t" inputmode="numeric" autocomplete="off"></span>'
         + '<span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="d4-in" id="' + id + '-n" inputmode="numeric" autocomplete="off"></span></span>';
  }
  function konstrHtml(nr){
    var k = KONSTR[nr], inputs = '';
    for(var i = 0; i < k.antal; i++){ inputs += (i > 0 ? '<span style="margin:0 6px;color:var(--ink-faint);">,</span>' : '') + konstrBrakInput('d4k-' + nr + '-' + i); }
    return '<div class="d4-konstr">' + inputs
      + '<button class="d4-kontr-btn" data-nr="' + nr + '">Kontrollera</button>'
      + '<span class="d4-kontr-res" id="d4kres-' + nr + '"></span></div>';
  }
  function valideraKonstr(k, svar){
    var giltiga = svar.slice(0, k.antal).every(function(s){ return isFinite(s.t) && isFinite(s.n) && s.n > 0 && k.test(s.t, s.n); });
    var distinct = true;
    if(k.distinkt){ var seen = {}; svar.forEach(function(s){ if(!isFinite(s.t) || !isFinite(s.n) || !s.n) return; var key = Math.round(s.t / s.n * 1e6); if(seen[key]) distinct = false; seen[key] = 1; }); }
    return giltiga && distinct;
  }
  function ensureFacitCSS(){
    if(document.getElementById('d4-facit-css')) return;
    var s = document.createElement('style'); s.id = 'd4-facit-css';
    s.textContent =
      '.d4-facit-btn,.d4-kontr-btn{font-family:var(--cinzel,"Cinzel");font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--gold,#9a7228);background:none;border:1px solid var(--paper-dk,#ede6d6);border-radius:6px;padding:5px 12px;margin-top:10px;cursor:pointer;}'
    + '.d4-facit-btn:hover,.d4-kontr-btn:hover{border-color:var(--gold-lt,#c49a40);color:var(--ink,#12110f);}'
    + '.d4-facit{margin-top:8px;padding:10px 14px;background:rgba(154,114,40,.06);border-left:3px solid var(--gold,#9a7228);border-radius:4px;font-size:18px;line-height:1.8;}'
    + '.d4-konstr{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;}'
    + '.d4-in{font-family:"Source Serif 4",Georgia,serif;font-size:18px;width:46px;text-align:center;border:1px solid var(--paper-dk,#ede6d6);border-radius:4px;padding:3px 0;}'
    + '.d4-kontr-btn{margin-top:0;} .d4-kontr-res{font-size:14px;font-weight:600;}'
    + '.d4-kontr-res.ratt{color:#2f7d4f;} .d4-kontr-res.fel{color:#c0392b;}';
    document.head.appendChild(s);
  }

  function render(){
    var mount = document.getElementById('sheet-jamfora');
    if(!mount) return;
    ensureFacitCSS();
    var html = '<div class="ovn-sheet"><h2>Jämföra bråk</h2>';
    UPPG.forEach(function(u){
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">'
            + '<span class="ovn-label" style="min-width:22px;">' + u.nr + '.</span>' + u.rubrik + '</div>';
      if(u.innehall) html += '<div class="jmf-innehall">' + u.innehall + '</div>';
      if(KONSTR[u.nr]) html += konstrHtml(u.nr);
      if(FACIT[u.nr]) html += '<button class="d4-facit-btn" data-nr="' + u.nr + '">Visa facit</button>'
        + '<div class="d4-facit" id="d4-facit-' + u.nr + '" hidden>' + FACIT[u.nr] + '</div>';
      html += '</div>';
    });
    html += '</div>';
    mount.innerHTML = html;
    // Facit-avslöjning
    mount.querySelectorAll('.d4-facit-btn').forEach(function(b){
      b.onclick = function(){ var f = document.getElementById('d4-facit-' + b.dataset.nr); if(f.hasAttribute('hidden')){ f.removeAttribute('hidden'); b.textContent = 'Dölj facit'; } else { f.setAttribute('hidden', ''); b.textContent = 'Visa facit'; } };
    });
    // Villkors-validering (öppna uppgifter)
    mount.querySelectorAll('.d4-kontr-btn').forEach(function(b){
      b.onclick = function(){
        var nr = +b.dataset.nr, k = KONSTR[nr], res = document.getElementById('d4kres-' + nr), svar = [];
        for(var i = 0; i < k.antal; i++){ svar.push({ t: parseInt((document.getElementById('d4k-' + nr + '-' + i + '-t') || {}).value, 10), n: parseInt((document.getElementById('d4k-' + nr + '-' + i + '-n') || {}).value, 10) }); }
        var ok = valideraKonstr(k, svar);
        res.className = 'd4-kontr-res ' + (ok ? 'ratt' : 'fel');
        res.innerHTML = ok ? '✓ Rätt – uppfyller villkoret!' : '✗ Uppfyller inte villkoret. ' + k.ex;
      };
    });
  }

  // ── Val-rad (#tab-row): flikväxling Öva / Visa vad du kan ──
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
    // Testfliken öppen från start (som k1) — inget lås på detta delkapitel ännu.
    var tb = tabRow.querySelector('.tab-btn[data-tab="test"]');
    if(tb) tb.classList.remove('is-locked');
  }

  render();
  wireTabs();
})();
