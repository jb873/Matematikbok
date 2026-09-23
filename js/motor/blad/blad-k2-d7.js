/* ============================================================
   blad-k2-d7.js — ÖVA-BLADET för k2 Del 7 "Division med bråk" (FÖRDJUPNING åk7).

   EXAKT-FÖRFATTAT av Joachim ("Division med bråk.docx", 6 grupper × 3 uppgifter,
   ordagrant och i denna ordning). Statiskt blad — INGEN generator, inga slumpade
   tal. Divisionen skrivs som KOMPLEXA (staplade) bråk, precis som i docx:en:
   en bråkstreck med täljare/nämnare som själva är bråk eller heltal.

   UPPGIFTER, inte visning (order 2026-09-23): bladet var en läsyta — sex grupper
   med färdiga tal och ingenstans att skriva. Nu räknar eleven själv:
     · Grupp 1, 2, 4, 5: multiplicera med det INVERTERADE talet (mellanled) och
       skriv svaret. Två svarsenheter per uppgift.
     · Grupp 3 och 6: femstegskedjan, där eleven fyller de TRE SISTA stegen
       (produkterna, det förkortade bråket över 1, svaret). Alla tre uppgifterna
       i gruppen är uppgifter — metoden står som ett EGET exempel överst med ett
       fjärde tal (1/2 ÷ 3/4), så att exemplet aldrig är en av uppgifterna.
   Svarsrutorna är k2:s egna (brak-svar-rad med facit på raden) → samma rättning,
   poängräkning och mätbarhet som övriga blad. Evidens till de tre divisionsnoderna
   via MasteryK2.

   Additivt skal: wire:ar val-raden (#tab-row) och låser upp testfliken. Laddas som
   klassiskt <script> sist i sidan.
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

  // ── SVARSENHETER: ett bråk att fylla i, facit på raden (k2:s markup) ──
  //    hel = 0 → äkta/oäkta bråk i två rutor; hel > 0 → heltalssvar i en ruta.
  function svarBrak(t, n){
    return '<span class="ovn-brak-rad brak-svar-rad dv-svar" data-hel="0" data-t="' + t + '" data-n="' + n + '" data-facit="' + t + '/' + n + '">'
      + '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ovn-in brak-cell brak-t" inputmode="numeric" autocomplete="off"></span>'
      + '<span class="ovn-brak-strecket"></span>'
      + '<span class="ovn-brak-namnare"><input class="ovn-in brak-cell brak-n" inputmode="numeric" autocomplete="off"></span></span></span>';
  }
  function svarTal(v){
    return '<span class="ovn-brak-rad brak-svar-rad dv-svar dv-svar-tal" data-hel="' + v + '" data-t="0" data-n="1" data-facit="' + v + '">'
      + '<input class="ovn-in brak-cell brak-hel" inputmode="numeric" autocomplete="off"></span>';
  }

  // ── Uppgiftsrader ─────────────────────────────────────────────────────────────────────────
  // Bråktal ÷ heltal:  (t/n) / h  =  t/n · [1/h]  =  [svar]
  function radBH(t, n, h){
    var st = t, sn = n * h, g = gcd(st, sn);
    return { nod: 'brak-div-bh:rakna',
      html: cfr(fr(t, n), intg(h)) + EQ + fr(t, n) + op('·') + svarBrak(1, h) + EQ + svarBrak(st / g, sn / g) };
  }
  // Heltal ÷ bråktal:  h / (t/n)  =  h · [n/t]  =  [svar]
  function radHB(h, t, n){
    var st = h * n, sn = t, g = gcd(st, sn), T = st / g, N = sn / g;
    return { nod: 'brak-div-hb:rakna',
      html: cfr(intg(h), fr(t, n)) + EQ + intg(h) + op('·') + svarBrak(n, t) + EQ + (N === 1 ? svarTal(T) : svarBrak(T, N)) };
  }
  // Bråk ÷ bråk, femstegskedjan. Steg 1–2 står, eleven fyller steg 3, 4 och 5.
  //   (a/b)/(c/d) = [(a/b)·(d/c)] / [(c/d)·(d/c)] = (ad/bc)/(cd/dc) = (förkortat)/1 = svar
  function radBB(a, b, c, d){
    var pt = a * d, pn = b * c, g = gcd(pt, pn), rt = pt / g, rn = pn / g;
    var s1 = cfr(fr(a, b), fr(c, d));
    var s2 = cfr(fr(a, b) + op('·') + fr(d, c), fr(c, d) + op('·') + fr(d, c));
    var s3 = cfr(svarBrak(pt, pn), svarBrak(c * d, d * c));     // produkterna
    var s4 = cfr(svarBrak(rt, rn), intg(1));                    // förkortat, nämnaren 1
    var s5 = svarBrak(rt, rn);                                  // svaret
    return { nod: 'brak-div-bb:rakna', metod: true,
      html: '<div class="dv-mellan">' + s1 + EQ + s2 + EQ + s3 + EQ + s4 + EQ + s5 + '</div>' };
  }
  // Metod-exemplet: ETT eget tal (1/2 ÷ 3/4) som INTE är någon av uppgifterna — färdigräknat.
  function metodExempel(){
    var a = 1, b = 2, c = 3, d = 4;
    var pt = a * d, pn = b * c, g = gcd(pt, pn), rt = pt / g, rn = pn / g;
    return '<div class="dv-exempel"><div class="dv-mellan">'
      + cfr(fr(a, b), fr(c, d)) + EQ + cfr(fr(a, b) + op('·') + fr(d, c), fr(c, d) + op('·') + fr(d, c))
      + EQ + cfr(fr(pt, pn), fr(c * d, d * c)) + EQ + cfr(fr(rt, rn), intg(1)) + EQ + fr(rt, rn)
      + '</div></div>';
  }

  // ── De sex grupperna, exakt och i ordning ──
  var LABELS = ['a)', 'b)', 'c)'];
  var GRUPPER = [
    { rubrik: '1. Dividera bråktal med heltal', rader: [ radBH(1,2,3), radBH(1,3,4), radBH(1,5,3) ] },
    { rubrik: '2. Dividera heltal med bråktal', rader: [ radHB(2,1,3), radHB(4,1,2), radHB(5,1,4) ] },
    { rubrik: '3. Dividera bråktal med bråktal', exempel: true,
      rader: [ radBB(3,4,1,5), radBB(2,3,4,5), radBB(3,7,5,8) ] },
    { rubrik: '4. Dividera bråktal med heltal', rader: [ radBH(1,3,6), radBH(1,7,2), radBH(1,6,4) ] },
    { rubrik: '5. Dividera heltal med bråktal', rader: [ radHB(3,1,5), radHB(4,1,7), radHB(6,1,6) ] },
    { rubrik: '6. Dividera bråktal med bråktal', exempel: true,
      rader: [ radBB(3,5,6,7), radBB(7,9,4,5), radBB(9,11,2,7) ] }
  ];

  // ── RÄTTNING: en svarsenhet = ett ifyllt bråk (eller tal). Markering per ruta, poäng per enhet,
  //    evidens per grupp till MasteryK2 (en gång per Kontrollera, bara besvarade enheter). ──
  function kontrollera(mount){
    var totalt = 0, ratt = 0;
    mount.querySelectorAll('.ovn-grupp').forEach(function(grupp){
      var nod = grupp.getAttribute('data-logg');
      grupp.querySelectorAll('.brak-svar-rad').forEach(function(rad){
        totalt++;
        var hel = rad.querySelector('.brak-hel'), t = rad.querySelector('.brak-t'), n = rad.querySelector('.brak-n');
        var rutor = [hel, t, n].filter(Boolean);
        var fyllt = rutor.some(function(el){ return el.value.trim() !== ''; });
        var ok = hel
          ? parseInt(hel.value, 10) === parseInt(rad.dataset.hel, 10)
          : (parseInt(t.value, 10) === parseInt(rad.dataset.t, 10) && parseInt(n.value, 10) === parseInt(rad.dataset.n, 10));
        rutor.forEach(function(el){ el.classList.remove('correct', 'wrong'); if(fyllt) el.classList.add(ok ? 'correct' : 'wrong'); });
        if(!fyllt) return;
        if(ok) ratt++;
        if(nod && window.MasteryK2 && MasteryK2.loggaForsok) MasteryK2.loggaForsok(nod, ok ? 'ratt' : 'fel');
      });
    });
    var sam = mount.querySelector('[data-sammanf]');
    sam.style.display = 'block';
    sam.className = 'ovn-sammanf ' + (ratt === totalt && totalt ? 'ok' : 'delvis');
    sam.innerHTML = (ratt === totalt && totalt)
      ? '<div class="ovn-sammanf-icon">✓</div><span class="ovn-sammanf-titel">Allt rätt!</span>' + ratt + ' av ' + totalt + ' — jättebra jobbat!'
      : 'Du fick ' + ratt + ' av ' + totalt + ' rätt. Titta på de rödmarkerade och försök igen.';
  }

  function render(){
    var mount = document.getElementById('sheet-division');
    if(!mount) return;
    var html = '<div class="ovn-sheet"><h2>Division med bråk</h2>';
    GRUPPER.forEach(function(g){
      html += '<div class="ovn-grupp" data-logg="' + (g.rader[0].nod || '') + '" data-logg-store="k2">'
            + '<div class="ovn-grupp-rubrik">' + g.rubrik + '</div>';
      if(g.exempel) html += metodExempel();
      g.rader.forEach(function(r, i){
        html += '<div class="' + (r.metod ? 'dv-mellan-wrap' : 'dv-rad') + '"><span class="dv-label">' + LABELS[i] + '</span>' + r.html + '</div>';
      });
      html += '</div>';
    });
    html += '<div class="ovn-kontroll-rad"><button type="button" class="ovn-kontroll" data-action="kontroll">Kontrollera</button>'
      + '<button type="button" class="ovn-aterstall" data-action="reset">Återställ</button></div>'
      + '<div class="ovn-sammanf" data-sammanf style="display:none;"></div>';
    html += '</div>';
    if(window.AK8_UI && AK8_UI.keypadHTML) html += AK8_UI.keypadHTML();
    mount.innerHTML = html;
    if(window.AK8_UI && AK8_UI.bindKeypad) AK8_UI.bindKeypad(mount);
    var kn = mount.querySelector('[data-action="kontroll"]'); if(kn) kn.onclick = function(){ kontrollera(mount); };
    var rn = mount.querySelector('[data-action="reset"]'); if(rn) rn.onclick = function(){ render(); };
    // clear-on-edit: rutans markering bort när eleven ändrar
    mount.querySelectorAll('.brak-cell').forEach(function(el){
      el.addEventListener('input', function(){ el.classList.remove('correct', 'wrong'); });
    });
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
