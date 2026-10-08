/* uppstallning-yta.js — UPPSTÄLLNINGENS YTA: en uppgift ritad och rättad, delad mellan
   Metodträningen (ak7-k1-ram.html) och öva-bladen (order 2026-10-07 "Uppställningen i datorn,
   även i öva").

   SKÄLET. Ytan låg inne i renderUppstallningMult (metod-mult.js) och nådde därför bara ramen.
   Öva-bladen bad eleven räkna på papper fast motorn fanns — funktionen fanns, kopplingen saknades.
   Den är FLYTTAD hit, inte kopierad: ramen ritar och rättar genom samma funktioner som bladet.
   Beviset att ramen inte ändrats är en differentiell fuzz (gammal och ny ram, samma tal, samma
   utfall i varje ruta och varje besked).

   Ytan vet inget om kortet runt omkring: inga id:n, ingen keypad, ingen nivå, ingen loggning,
   ingen Kontrollera-knapp. Det hör till anroparen — ramens kort eller bladets rad. Därför kan
   många ytor stå på samma sida.

   KONTRAKT (metod 'mult')
     UppstYta.mult.html(task, {tips})   → uppställningens html (.mult-upp-box), en svarsruta per siffra
     UppstYta.mult.bindMinne(rot)       → minnesrutorna i rot går att stryka
     UppstYta.mult.ratta(rot, {las})    → varje svarsruta i rot markeras correct/wrong och låses
                                          (las:false = låses inte); returnerar {ratt, rutor, fel}
   task = {kind:'enkel'|'decimal'|'tva', mDisplay, d, …} — samma form som ramens genTask ger.
   Minnessiffrorna rättas inte (beslut 2026-10-07). */
(function(){
  'use strict';

  // En cell: digit (fast), comma (fast), input (svar), eller empty
  function cellHTML(c){
    if(c.t === 'fixed')  return '<div class="cell">' + c.v + '</div>';
    if(c.t === 'comma')  return '<div class="cell" style="color:var(--c-metod);font-weight:700;">,</div>';
    if(c.t === 'op')     return '<div class="cell opcell">' + c.v + '</div>';
    if(c.t === 'input')  return '<div class="cell"><input type="text" class="mult-upp-ans" data-expect="' + c.v + '" inputmode="numeric" maxlength="1" autocomplete="off"></div>';
    return '<div class="cell"></div>'; // empty
  }
  function rowHTML(opCell, cells, W){
    let pad = [];
    for(let i=0; i<W-cells.length; i++) pad.push({t:'empty'});
    const all = pad.concat(cells);
    let h = '<div class="mult-upp-row">' + cellHTML(opCell);
    for(let i=0; i<all.length; i++) h += cellHTML(all[i]);
    return h + '</div>';
  }
  // gör cellrad av en sträng: siffror -> input, komma -> comma
  function strToInputCells(str){
    return str.split('').map(function(ch){
      return ch === ',' ? {t:'comma'} : {t:'input', v:ch};
    });
  }
  function strToFixedCells(str){
    return str.split('').map(function(ch){
      return ch === ',' ? {t:'comma'} : {t:'fixed', v:ch};
    });
  }

  function minnesPanel(antal, visaTips){
    antal = antal || 2;
    let h = '<div class="mult-minne-panel"><div class="mult-minne-rubrik">minnessiffror</div><div class="mult-minne-rutor">';
    for(let i=0; i<antal; i++){
      h += '<input type="text" class="mult-minne-ruta" inputmode="numeric" maxlength="1" autocomplete="off">';
    }
    h += '</div>' + (visaTips ? '<div class="mult-minne-tips">Klicka på en siffra för att stryka den när den är använd.</div>' : '') + '</div>';
    return h;
  }
  function bindMinne(card){
    card.querySelectorAll('.mult-minne-ruta').forEach(function(inp){
      inp.addEventListener('click', function(){
        if(inp.value.trim() !== '' && document.activeElement !== inp){
          inp.classList.toggle('struck');
        }
      });
      inp.addEventListener('dblclick', function(){ inp.classList.toggle('struck'); });
    });
  }

  function multHTML(task, opts){
    const visaTips = !!(opts && opts.tips);
    if(task.kind === 'enkel' || task.kind === 'decimal'){
      const ansStr = task.kind === 'enkel' ? String(task.answer)
        : (function(){
            const s = task.answerIntStr;
            return s.slice(0, s.length-task.dec) + ',' + s.slice(s.length-task.dec);
          })();
      const ansCells = strToInputCells(ansStr);
      const mCells = strToFixedCells(task.mDisplay);
      const W = ansCells.length;
      let rows = '';
      rows += rowHTML({t:'op',v:''}, mCells, W);
      rows += rowHTML({t:'op',v:'·'}, [{t:'fixed',v:String(task.d)}], W);
      rows += '<div class="mult-upp-line"></div>';
      rows += rowHTML({t:'op',v:''}, ansCells, W);
      var minneN = String(task.mDisplay).replace(/[^0-9]/g,'').length;   // en ruta per talsiffra
      return '<div class="mult-upp-box"><div class="mult-upp-flex">'
        + '<div class="mult-upp-rows-wrap"><div class="mult-upp-rows">' + rows + '</div></div>'
        + minnesPanel(minneN, visaTips)
      + "</div></div>";
    }
    // tvåsiffrig multiplikator: två delprodukter + summa
    const sumStr = task.answerDisplay || String(task.answer);
    const W = sumStr.length;
    const p1Cells = strToInputCells(String(task.p1));
    // delprodukt 2 skiftas ett steg vänster: en tom cell längst till höger
    const p2Cells = strToInputCells(String(task.p2)).concat([{t:'empty'}]);
    const sumCells = strToInputCells(sumStr);
    const mCells = strToFixedCells(task.mDisplay);
    const dCells = strToFixedCells(task.dDisplay || String(task.d));
    let rows = '';
    rows += rowHTML({t:'op',v:''}, mCells, W);
    rows += rowHTML({t:'op',v:'·'}, dCells, W);
    rows += '<div class="mult-upp-line"></div>';
    rows += rowHTML({t:'op',v:''}, p1Cells, W);
    rows += rowHTML({t:'op',v:'+'}, p2Cells, W);
    rows += '<div class="mult-upp-line"></div>';
    rows += rowHTML({t:'op',v:''}, sumCells, W);
    return '<div class="mult-upp-box"><div class="mult-upp-flex">'
      + '<div class="mult-upp-rows-wrap"><div class="mult-upp-rows">' + rows + '</div></div>'
      + minnesPanel(3, visaTips)
    + "</div></div>";
  }

  function multRatta(rot, opts){
    const las = !(opts && opts.las === false);
    let correct = true, fel = 0;
    const ansInputs = Array.from(rot.querySelectorAll('.mult-upp-ans'));
    ansInputs.forEach(function(inp){
      const exp = inp.dataset.expect;
      if(las) inp.disabled = true;
      if(inp.value.trim() === exp){
        inp.classList.add('correct');
      } else {
        inp.classList.add('wrong');
        correct = false; fel++;
      }
    });
    return { ratt: correct, rutor: ansInputs.length, fel: fel };
  }

  var API = { mult: { html: multHTML, bindMinne: bindMinne, ratta: multRatta } };
  if(typeof window !== 'undefined') window.UppstYta = API;
})();
