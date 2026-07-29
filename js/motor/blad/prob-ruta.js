/* prob-ruta.js — Problemlösnings-ruta (window.PROB_RUTA). Lindar egen UI (fri beräknings-ruta,
   "skapa ruta under", svar + enhet) runt den DELADE likhetsrättaren (js/motor/blad/likhetsrattare.js).
   Ingen egen mattelogik/rättare — all likhets- och slutvärde-koll går via window.Likhetsrattare.
   Eleven bygger HELA uträkningen via keypaden (siffror, + − · /, bråk-byggaren, =). Fri väg.

   Validering per problem:
     1) Likhetsrattare.provaBerakning(rutorna, svarVärde) — varje ruta intern likhetskedja (ingen
        falsk likhet, t.ex. 6+2=8·3=24 → underkänt), sista rutan når svaret. Path-fritt inkl. · och /.
     2) svar-värdet = facit i enklaste form (finalCheck).
     3) enhet: konkret (km/kr/djur) krävs exakt; ANDEL (bråk) = beskrivande, bråkvärdet avgör; tal = ingen.
   KOMMUNIKATION: varje rättning loggas via MasteryK2.loggaForsok(nod, 'ratt'|'fel') — evidens nu,
   fot-/självskattnings-sektionen som konsumerar den byggs senare. GDPR: bara localStorage, inget nät. */
(function(){
  'use strict';
  var F = window;
  var LR = window.Likhetsrattare;
  function fr(t, n){ return F.fracSpan(t, n); }
  function mx(h, t, n){ return h + '&nbsp;' + F.fracSpan(t, n); }

  // ── slutform-fabriker (samma form som d6) ──
  function MI(h, t, n){ return { k: 'mi', h: h, t: t, n: n }; }
  function BR(t, n){ return { k: 'br', t: t, n: n }; }
  function DE(x){ return { k: 'dec', x: x }; }
  function finText(fin){ return fin.k === 'dec' ? String(fin.x).replace('.', ',') : fin.k === 'br' ? fin.t + '/' + fin.n : fin.h + ' ' + fin.t + '/' + fin.n; }

  // ── PROBLEM-INNEHÅLL — exakt-författat ur add/sub-docx (6) + mult blad 1-docx (2, ordproblem hitflyttade).
  //    Alla facit oberoende omräknade. varde = [p,q] (svarets exakta värde för beräknings-kollen). ──
  var PROBLEM = [
    { text: 'Summan av två tal är ' + mx(5, 1, 2) + '. Det ena talet är ' + mx(3, 2, 3) + ', vilket är det andra?',
      varde: [11, 6], svar: MI(1, 5, 6), enhet: { typ: 'tal' } },
    { text: 'I en klass med 29 elever finns det 17 pojkar. Hur stor del av klassen är flickor?',
      varde: [12, 29], svar: BR(12, 29), enhet: { typ: 'andel', label: 'av klassen' } },
    { text: 'Differensen av två tal är ' + mx(3, 3, 4) + '. Det mindre talet är ' + mx(2, 5, 8) + '. Vilket är det större talet?',
      varde: [51, 8], svar: MI(6, 3, 8), enhet: { typ: 'tal' } },
    { text: 'Av Stinas lön går ' + fr(1, 3) + ' till skatt. Av resten av lönen betalar hon ' + fr(2, 5) + ' i hyra. Hur stor del av lönen finns kvar efter dessa utgifter?',
      varde: [2, 5], svar: BR(2, 5), enhet: { typ: 'andel', label: 'av lönen' } },
    { text: 'En åker har formen av en rektangel. Den ena sidan är ' + mx(1, 2, 7) + ' km och den andra sidan är ' + fr(2, 3) + ' km. Vilken omkrets har åkern? Svara i enklaste form.',
      varde: [82, 21], svar: MI(3, 19, 21), enhet: { typ: 'konkret', text: 'km' } },
    { text: 'Sixten bjuder på kladdkaka. Caesar får ' + fr(1, 6) + ', Anna får ' + fr(1, 4) + ' medan Johan får ' + fr(3, 8) + '. Hur mycket får Sixten av kladdkakan?',
      varde: [5, 24], svar: BR(5, 24), enhet: { typ: 'andel', label: 'av kakan' } },
    { text: 'Anna och Nils vann 20 000 kr. Nils skulle ha ' + fr(3, 5) + ' av vinsten. Hur mycket skulle Nils få av vinsten?',
      varde: [12000, 1], svar: DE(12000), enhet: { typ: 'konkret', text: 'kr' } },
    { text: 'I en hage fanns det 1800 får. Ägaren skickade ' + fr(5, 9) + ' på slakt. Hur många av djuren slaktades?',
      varde: [1000, 1], svar: DE(1000), enhet: { typ: 'konkret', text: 'djur' } }
  ];

  // ── RENDER ──
  function boxHtml(n){ return '<div class="prob-box">' + AK8_UI.ansCell('b' + n, 'skriv uträkningen …') + '</div>'; }
  function enhetHtml(e){
    if(e.typ === 'konkret') return '<input class="ak8-in prob-enhet" inputmode="text" autocomplete="off" placeholder="enhet">';
    if(e.typ === 'andel') return '<span class="prob-enhet-label">' + e.label + '</span>';
    return '';
  }

  function enhetOk(card, e){
    if(e.typ !== 'konkret') return true;   // andel/tal: bråkvärdet avgör, ingen enhets-koll
    var inp = card.querySelector('.prob-enhet');
    return !!inp && inp.value.trim().toLowerCase().replace('.', '') === e.text.toLowerCase();
  }

  function render(mount, config){
    var probs = (config && config.problem) || PROBLEM, nod = (config && config.nod) || 'formaga:likhetstecken';
    var html = '<div class="prob-wrap"><h2 class="prob-rubrik">Problemlösning</h2>'
      + '<p class="prob-intro">Skriv hela uträkningen själv i beräknings-rutan – siffror, <b>+ − · /</b>, bråk-byggaren och likhetstecken <b>=</b>. '
      + 'Behöver du flera steg: tryck <em>skapa ruta under</em>. Alla korrekta vägar godtas.</p>';
    probs.forEach(function(p, pi){
      html += '<div class="prob-kort" data-pi="' + pi + '">'
        + '<div class="prob-text"><span class="prob-nr">' + (pi + 1) + '.</span> ' + p.text + '</div>'
        + '<div class="prob-berakning"><span class="prob-label">Beräkning:</span>'
        +   '<div class="prob-boxar" data-boxar>' + boxHtml(0) + '</div>'
        +   '<button type="button" class="prob-mer" data-mer>+ skapa ruta under</button>'
        + '</div>'
        + '<div class="prob-svarrad"><span class="prob-label">Svar:</span>' + AK8_UI.ansCell('sv') + enhetHtml(p.enhet) + '</div>'
        + '<div class="prob-fasit" data-fasit hidden></div>'
        + '</div>';
    });
    html += '<div class="ovn-kontroll-rad"><button class="ovn-kontroll" data-kontroll>Kontrollera</button>'
      + '<button class="ovn-aterstall" data-reset>Rensa</button>' + AK8_UI.printKnappHTML() + '</div>'
      + '<div class="ovn-sammanf" data-sammanf hidden></div></div>';
    html += AK8_UI.keypadHTML({ builders: true, ops: ['+', '−', '·', '/', '=', ','] });
    mount.innerHTML = html;
    // "skapa ruta under"
    mount.querySelectorAll('[data-mer]').forEach(function(btn){
      btn.onclick = function(){ var boxar = btn.parentNode.querySelector('[data-boxar]'); var n = boxar.querySelectorAll('.prob-box').length;
        boxar.insertAdjacentHTML('beforeend', boxHtml(n)); var inp = boxar.lastElementChild.querySelector('input'); if(inp){ AK8_UI.grow(inp); inp.focus(); } };
    });
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount, probs, nod); };
    mount.querySelector('[data-reset]').onclick = function(){ render(mount, config); };
    AK8_UI.bindSheet(mount);
  }

  function exprOf(cellScope){ var c = cellScope && cellScope.querySelector('.ak8-cell .ak8-expr'); return c; }
  function kontrollera(mount, probs, nod){
    var tot = 0, ratt = 0;
    probs.forEach(function(p, pi){
      var card = mount.querySelector('.prob-kort[data-pi="' + pi + '"]');
      var boxExprs = [].slice.call(card.querySelector('[data-boxar]').querySelectorAll('.ak8-cell .ak8-expr'));
      var svarExpr = card.querySelector('.prob-svarrad .ak8-expr');
      var berRes = LR.provaBerakning(boxExprs);
      var svarOk = LR.finalCheck(LR.finalForm(svarExpr), p.svar);
      var enOk = enhetOk(card, p.enhet);
      var ok = berRes.ok && svarOk && enOk;
      tot++; if(ok) ratt++;
      // markering
      card.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.remove('ak8-ok', 'ak8-fel'); i.classList.add(ok ? 'ak8-ok' : 'ak8-fel'); });
      AK8_UI.markera(card.querySelector('.prob-text'), ok);
      var fas = card.querySelector('[data-fasit]');
      if(ok){ fas.hidden = true; }
      else {
        var msg = !berRes.ok
          ? (berRes.reason === 'tom' ? 'Visa din uträkning i beräknings-rutan.'
            : berRes.reason === 'likhet' ? 'Leden kring ett likhetstecken är inte lika – kontrollera uträkningen.'
            : 'Uträkningen går inte att tolka.')
          : !svarOk ? 'Svaret stämmer inte, eller är inte i enklaste form.'
          : 'Fel eller saknad enhet i svaret.';
        fas.hidden = false; fas.innerHTML = msg + ' <span class="prob-facit-svar">Rätt svar: ' + finText(p.svar) + (p.enhet.typ === 'konkret' ? ' ' + p.enhet.text : '') + '</span>';
      }
      // KOMMUNIKATION-evidens (likhetstecknet) – localStorage, konsumeras av självskattningen senare
      if(window.MasteryK2 && window.MasteryK2.loggaForsok) window.MasteryK2.loggaForsok(nod, ok ? 'ratt' : 'fel');
    });
    var s = mount.querySelector('[data-sammanf]'); s.hidden = false;
    if(ratt === tot && tot > 0){
      s.className = 'ovn-sammanf ok';
      s.innerHTML = '<span class="ovn-sammanf-icon">✓</span><span class="ovn-sammanf-titel">Alla lösta!</span>Snyggt problemlöst – ' + tot + ' av ' + tot + '.';
      if(window.visaAk8Konfetti) window.visaAk8Konfetti();
    } else { s.className = 'ovn-sammanf delvis'; s.textContent = ratt + ' av ' + tot + ' lösta. Se meddelandet vid de röda och försök igen.'; }
  }

  window.PROB_RUTA = { PROBLEM: PROBLEM, render: render };
})();
