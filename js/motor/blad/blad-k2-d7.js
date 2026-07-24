/* ============================================================
   blad-k2-d7.js — ÖVA-BLADET för k2 Del 7 "Division med bråk" (FÖRDJUPNING åk7).

   EXAKT-FÖRFATTAT av Joachim ("Division med bråk.docx", 6 grupper × 3 uppgifter,
   ordagrant och i denna ordning). Statiskt blad — INGEN generator, inga slumpade
   tal. Divisionen skrivs som KOMPLEXA (staplade) bråk, precis som i docx:en:
   en bråkstreck med täljare/nämnare som själva är bråk eller heltal.

   Grupp 3 och 6 (bråk ÷ bråk) visar HELA mellanledet enligt B-uppgiftens mall
   (2/3 ÷ 4/5): komplext bråk → multiplicera täljare OCH nämnare med inverterade
   nämnaren (så nämnaren blir 1) → räkna produkterna → förkorta → svar. Detta är
   "visa metod"-vägen — den visar varför inverteringen fungerar.

   Bråken renderas via samma ovn-brak-komponent som resten av plattformen. Additivt
   skal: wire:ar val-raden (#tab-row) och låser upp testfliken. Rör inga motorer/
   mellanled. Laddas som klassiskt <script> sist i sidan.
   ============================================================ */
(function(){
  'use strict';

  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }

  // ── Byggstenar (samma stående-bråk-komponent som ovn-brak) ──
  function fr(t, n){
    return '<span class="ovn-brak"><span class="ovn-brak-taljare">' + t + '</span>'
         + '<span class="ovn-brak-strecket"></span>'
         + '<span class="ovn-brak-namnare">' + n + '</span></span>';
  }
  function intg(x){ return '<span class="dv-int">' + x + '</span>'; }
  // Komplext (staplat) bråk: täljare och nämnare är själva HTML (bråk eller heltal)
  function cfr(numHTML, denHTML){
    return '<span class="ovn-brak dv-cfr"><span class="ovn-brak-taljare">' + numHTML + '</span>'
         + '<span class="ovn-brak-strecket"></span>'
         + '<span class="ovn-brak-namnare">' + denHTML + '</span></span>';
  }
  function op(s){ return '<span class="dv-op">' + s + '</span>'; }
  var EQ = '<span class="dv-eq">=</span>';

  // ── Mellanledet för bråk ÷ bråk (a/b ÷ c/d), femstegskedjan enligt B-uppgiften ──
  //  (a/b)/(c/d) = [(a/b)·(d/c)] / [(c/d)·(d/c)] = (ad/bc)/(cd/dc) = (förkortat)/1 = svar
  function mellanled(a, b, c, d){
    var pt = a * d, pn = b * c;              // produkten i täljaren (oförkortad)
    var g = gcd(pt, pn), rt = pt / g, rn = pn / g;   // förkortat svar
    var s1 = cfr(fr(a, b), fr(c, d));
    var s2 = cfr(fr(a, b) + op('·') + fr(d, c), fr(c, d) + op('·') + fr(d, c));
    var s3 = cfr(fr(pt, pn), fr(c * d, d * c));
    var s4 = cfr(fr(rt, rn), intg(1));
    var s5 = fr(rt, rn);
    return '<div class="dv-mellan">' + s1 + EQ + s2 + EQ + s3 + EQ + s4 + EQ + s5 + '</div>';
  }

  // ── De sex grupperna, exakt och i ordning ──
  var LABELS = ['a)', 'b)', 'c)'];
  // Enkla uppgifter (bara problemet som komplext bråk) — student räknar själv
  function radBH(t, n, h){ return cfr(fr(t, n), intg(h)); }   // bråktal ÷ heltal
  function radHB(h, t, n){ return cfr(intg(h), fr(t, n)); }   // heltal ÷ bråktal

  var GRUPPER = [
    { rubrik: '1. Dividera bråktal med heltal', typ: 'enkel',
      rader: [ radBH(1,2,3), radBH(1,3,4), radBH(1,5,3) ] },
    { rubrik: '2. Dividera heltal med bråktal', typ: 'enkel',
      rader: [ radHB(2,1,3), radHB(4,1,2), radHB(5,1,4) ] },
    { rubrik: '3. Dividera bråktal med bråktal', typ: 'metod', metodNot: true,
      rader: [ mellanled(3,4,1,5), mellanled(2,3,4,5), mellanled(3,7,5,8) ] },
    { rubrik: '4. Dividera bråktal med heltal', typ: 'enkel',
      rader: [ radBH(1,3,6), radBH(1,7,2), radBH(1,6,4) ] },
    { rubrik: '5. Dividera heltal med bråktal', typ: 'enkel',
      rader: [ radHB(3,1,5), radHB(4,1,7), radHB(6,1,6) ] },
    { rubrik: '6. Dividera bråktal med bråktal', typ: 'metod', metodNot: true,
      rader: [ mellanled(3,5,6,7), mellanled(7,9,4,5), mellanled(9,11,2,7) ] }
  ];

  function render(){
    var mount = document.getElementById('sheet-division');
    if(!mount) return;
    var html = '<div class="ovn-sheet"><h2>Division med bråk</h2>'
      + '<p class="ovn-intro">Fördjupning i årskurs 7. Divisionen skrivs som ett stående (komplext) bråk. '
      + 'I grupp 3 och 6 visas hela metoden: multiplicera täljare och nämnare med det inverterade bråket så att nämnaren blir 1.</p>';
    GRUPPER.forEach(function(g){
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">' + g.rubrik + '</div>';
      if(g.metodNot) html += '<p class="dv-metod-not">Visa hela mellanledet på alla uppgifter.</p>';
      g.rader.forEach(function(radHTML, i){
        if(g.typ === 'metod'){
          html += '<div class="dv-mellan-wrap"><span class="dv-label">' + LABELS[i] + '</span>' + radHTML + '</div>';
        } else {
          html += '<div class="dv-rad"><span class="dv-label">' + LABELS[i] + '</span>' + radHTML + '</div>';
        }
      });
      html += '</div>';
    });
    html += '</div>';
    mount.innerHTML = html;
  }

  // ── Val-rad (#tab-row): Öva / Färdighetsträning / Visa vad du kan ──
  function wireTabs(){
    var tabRow = document.getElementById('tab-row');
    if(!tabRow) return;
    tabRow.querySelectorAll('.tab-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(btn.classList.contains('is-locked')) return;
        var id = btn.dataset.tab;
        tabRow.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.toggle('is-active', b === btn); });
        document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.toggle('is-active', p.dataset.panel === id); });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    var tb = tabRow.querySelector('.tab-btn[data-tab="test"]');
    if(tb) tb.classList.remove('is-locked');
  }

  render();
  wireTabs();
})();
