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

  function render(){
    var mount = document.getElementById('sheet-jamfora');
    if(!mount) return;
    var html = '<div class="ovn-sheet"><h2>Jämföra bråk</h2>';
    UPPG.forEach(function(u){
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">'
            + '<span class="ovn-label" style="min-width:22px;">' + u.nr + '.</span>' + u.rubrik + '</div>';
      if(u.innehall) html += '<div class="jmf-innehall">' + u.innehall + '</div>';
      html += '</div>';
    });
    html += '</div>';
    mount.innerHTML = html;
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
