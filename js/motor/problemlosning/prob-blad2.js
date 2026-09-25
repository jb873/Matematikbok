/* prob-blad2.js — PROBLEMLÖSNINGENS ÖVA-BLAD, VARIANT 2: personer eller delar (order 2026-09-24).

   FEMSTEGSFORMEN, första gången på ett blad. Metodens fem steg är bladets form, och steg 4 står
   BREDVID steg 1 — det är samma rader som fylls i, först med uttryck och sedan med värden:

       DELARNA                        SÄTT IN VÄRDET
       [Hugo ] : [x        ]          x       = [18]
       [Calle] : [x + 12   ]          x + 12  = [30]
       + Ny rad

       EKVATION        [2x + 12] = [48]
       BALANSMETODEN   [2x     ] = [36]
                       [x      ] = [18]        + Ny rad
       SVAR            Hugo  [18 år]
                       Calle [30 år]

   RADERNA I STEG 1 ÄR INTE FÖRTRYCKTA. Att se hur många delar uppgiften har är en av
   svårigheterna; är raderna givna är den borta. En knapp lägger till fler.

   NAMNEN RÄTTAS INTE — "Hugo", "H", "tal 1" är elevens egna etiketter. Det som prövas är
   uttrycken: ELEVEN väljer själv vilken del som är x, och rättaren prövar om relationerna blir
   identiteter med hennes val. Hugo = x ger x + 12 och 2x + 12 = 48; Calle = x ger x − 12 och
   2x − 12 = 48. Båda är rätt.

   Radernas ordning är elevens. Rättaren behöver veta vilken rad som är vilken del, så bladet
   provar ordningarna (högst fyra delar → högst 24) och använder den som håller.

   Kedjan i KORT läge (en rad per operation). Ingen rättning förrän Kontrollera; beskedet pekar ut
   FÖRSTA felet i metodordningen. Rättningen är ProbRattare — bladet bygger inga egna regler. */
(function(){
'use strict';

var K = (typeof window !== 'undefined' && window.EkvKedja) || null;
var R = (typeof window !== 'undefined' && window.ProbRattare) || null;
var M = (typeof window !== 'undefined' && window.ProbModell) || null;

// ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
var TEXT = {
  delarna:   { etikett: 'Delarna' },
  insatt:    { etikett: 'Sätt in värdet' },
  ekvation:  { etikett: 'Ekvation' },
  balans:    { etikett: 'Balansmetoden' },
  svar:      { etikett: 'Svar' },
  nyDel:     { titel: '+ Ny rad' },
  nyRad:     { titel: '+ Ny rad' },
  kontroll:  { titel: 'Kontrollera' },
  omstart:   { titel: 'Börja om' },
  klar:      { titel: '✓ Löst!' },
  allaRatt:  { hint: 'Alla uppgifter lösta.' },
  pagang:    { hint: 'Läs beskedet vid uppgiften och gå vidare.' },
  obedomt:   { hint: 'Där steg 1 inte stämmer är resten inte rättad.' },
  forFaDelar:{ hint: 'Alla delar i uppgiften ska ha en rad.' },
  forManga:  { hint: 'Uppgiften har färre delar än så.' }
};

// ── UPPGIFTERNA: variant 2 ur dokumentet. Texterna ber om ALLA delar (Joachims beslut). ───────
var BLAD = {
  id: 'delar', titel: 'Personer eller delar', nod: 'alg-prob-delar:problem',
  uppgifter: [
    { id: 'n1-delar-a', nod: 'alg-prob-delar:problem', niva: 1, variabel: 'x',
      fraga: 'Hugo och Calle är tillsammans 48 år. Calle är 12 år äldre än Hugo. Hur gamla är Hugo och Calle?',
      delar: [{ nyckel: 'H', namn: 'Hugo' }, { nyckel: 'C', namn: 'Calle' }],
      relationer: ['C = H + 12'], villkor: ['H + C = 48'], enhet: 'år', svarDelar: ['H', 'C'] },

    { id: 'n1-delar-b', nod: 'alg-prob-delar:problem', niva: 1, variabel: 'x',
      fraga: 'Anna och Krister har tillsammans 56 kr. Anna har 17 kr mer än Krister. Hur mycket har Anna och Krister var för sig?',
      delar: [{ nyckel: 'A', namn: 'Anna' }, { nyckel: 'K', namn: 'Krister' }],
      relationer: ['A = K + 17'], villkor: ['A + K = 56'], enhet: 'kr', svarDelar: ['A', 'K'] },

    { id: 'n1-delar-c', nod: 'alg-prob-delar:problem', niva: 1, variabel: 'x',
      fraga: 'Jorma har tre gånger så många t-tröjor som Mika. Tillsammans har de 76 stycken. Hur många t-tröjor har Jorma och Mika var för sig?',
      delar: [{ nyckel: 'J', namn: 'Jorma' }, { nyckel: 'M', namn: 'Mika' }],
      relationer: ['J = 3·M'], villkor: ['J + M = 76'], enhet: 'tröjor', svarDelar: ['J', 'M'] },

    { id: 'n1-delar-d', nod: 'alg-prob-delar:problem', niva: 1, variabel: 'x',
      fraga: 'Max är 5 år äldre än Amer. Elin är 3 år yngre än Amer. Tillsammans är de 32 år. Hur gamla är Max, Amer och Elin?',
      delar: [{ nyckel: 'M', namn: 'Max' }, { nyckel: 'A', namn: 'Amer' }, { nyckel: 'E', namn: 'Elin' }],
      relationer: ['M = A + 5', 'E = A - 3'], villkor: ['M + A + E = 32'], enhet: 'år', svarDelar: ['M', 'A', 'E'] },

    { id: 'n1-delar-e', nod: 'alg-prob-delar:problem', niva: 1, variabel: 'x',
      fraga: 'Anna väger 10 kg mer än Åsa. Johan väger 12 kg mindre än Åsa. Tillsammans väger de 163 kg. Hur mycket väger Anna, Åsa och Johan?',
      delar: [{ nyckel: 'A', namn: 'Anna' }, { nyckel: 'S', namn: 'Åsa' }, { nyckel: 'J', namn: 'Johan' }],
      relationer: ['A = S + 10', 'J = S - 12'], villkor: ['A + S + J = 163'], enhet: 'kg', svarDelar: ['A', 'S', 'J'] },

    { id: 'n1-delar-f', nod: 'alg-prob-delar:problem', niva: 1, variabel: 'x',
      fraga: 'En chokladask väger 25 g tom. Asken fylls med praliner som väger 4 g styck. Den fulla asken väger 85 g. Hur många praliner innehåller asken?',
      delar: [{ nyckel: 'P', namn: 'antal praliner' }],
      relationer: [], villkor: ['25 + 4·P = 85'], enhet: 'praliner', svarDelar: ['P'] }
  ]
};

// ── ORDNINGEN: vilken rad är vilken del? Elevens rader är oordnade, så ordningarna provas. ────
function permutationer(lista){
  if(lista.length <= 1) return [lista.slice()];
  var ut = [];
  lista.forEach(function(x, i){
    var rest = lista.slice(0, i).concat(lista.slice(i + 1));
    permutationer(rest).forEach(function(p){ ut.push([x].concat(p)); });
  });
  return ut;
}
// Returnerar { ordning:[nyckel per rad], uttryck:{nyckel→uttryck} } eller { fel: <ProbRattare-fel> }
function ordnaDelar(u, radUttryck){
  var nycklar = M.nycklarAv(u);
  if(radUttryck.length < nycklar.length) return { fel: { steg: 'uttryck', besked: TEXT.forFaDelar.hint } };
  if(radUttryck.length > nycklar.length) return { fel: { steg: 'uttryck', besked: TEXT.forManga.hint } };
  var grenar = M.grenarAv(u), forsta = null;
  var perm = permutationer(nycklar);
  for(var g = 0; g < grenar.length; g++){
    for(var p = 0; p < perm.length; p++){
      var uttryck = {};
      perm[p].forEach(function(nyckel, i){ uttryck[nyckel] = radUttryck[i]; });
      var fel = R.provaUttryck(u, grenar[g], uttryck);
      if(!fel) return { ordning: perm[p], uttryck: uttryck, gren: grenar[g] };
      if(!forsta) forsta = fel;
    }
  }
  return { fel: forsta || { steg: 'uttryck', besked: '' } };
}

// ── RENDERING ─────────────────────────────────────────────────────────────────────────────────
function render(mount, blad){
  mount.innerHTML = '';
  var kort = document.createElement('div'); kort.className = 'prob-kort';
  kort.setAttribute('data-blad', blad.id);
  var rub = document.createElement('div'); rub.className = 'niva-rubrik'; rub.textContent = blad.titel;
  kort.appendChild(rub);

  var state = [];
  blad.uppgifter.forEach(function(u, idx){
    state.push(renderUppgift(kort, u, idx));
  });

  var actions = document.createElement('div'); actions.className = 'actions';
  var kn = document.createElement('button'); kn.type = 'button'; kn.className = 'btn primary'; kn.textContent = TEXT.kontroll.titel;
  kn.setAttribute('data-action', 'kontroll');
  var rn = document.createElement('button'); rn.type = 'button'; rn.className = 'btn subtle'; rn.textContent = TEXT.omstart.titel;
  var hint = document.createElement('div'); hint.className = 'global-hint';
  var sammanf = document.createElement('div'); sammanf.className = 'ovn-sammanf'; sammanf.setAttribute('data-sammanf', '');
  kn.onclick = function(){ kontrollera(state, hint, sammanf); };
  rn.onclick = function(){ render(mount, blad); };
  actions.appendChild(kn); actions.appendChild(rn);
  kort.appendChild(actions); kort.appendChild(sammanf); kort.appendChild(hint);
  mount.appendChild(kort);
  return state;
}

function steghuvud(el, text){
  var d = document.createElement('div'); d.className = 'prob-steg-rub'; d.textContent = text;
  el.appendChild(d); return d;
}

function renderUppgift(kort, u, idx){
  var vars = u.variabel || 'x';
  var block = document.createElement('div'); block.className = 'prob-uppg'; block.setAttribute('data-nod', u.nod);
  var et = document.createElement('div'); et.className = 'uppg-etikett'; et.textContent = String.fromCharCode(97 + idx) + ')';
  block.appendChild(et);
  var fraga = document.createElement('p'); fraga.className = 'prob-fraga'; fraga.textContent = u.fraga;
  block.appendChild(fraga);

  // FIGUREN ur data: ett ändrat tal ändrar figur och facit tillsammans.
  if(u.fig && window.SvgAlgebraFigur && SvgAlgebraFigur[u.fig.typ]){
    var figEl = document.createElement('div'); figEl.className = 'prob-figur';
    figEl.innerHTML = SvgAlgebraFigur[u.fig.typ](u.fig);
    block.appendChild(figEl);
  }

  // ── STEG 1 + 4: delarna till vänster, insättningen bredvid ──
  var tva = document.createElement('div'); tva.className = 'prob-tvakol';
  var vk = document.createElement('div'), hk = document.createElement('div');
  steghuvud(vk, TEXT.delarna.etikett); steghuvud(hk, TEXT.insatt.etikett);
  var delListaEl = document.createElement('div'); delListaEl.className = 'prob-delar'; vk.appendChild(delListaEl);
  var insattListaEl = document.createElement('div'); insattListaEl.className = 'prob-insatt'; hk.appendChild(insattListaEl);
  tva.appendChild(vk); tva.appendChild(hk); block.appendChild(tva);

  var delRader = [];
  function nyDelRad(){
    var rad = document.createElement('div'); rad.className = 'prob-delrad';
    var namn = document.createElement('input');
    namn.type = 'text'; namn.className = 'prob-namn'; namn.setAttribute('data-nokeypad', '');
    namn.setAttribute('aria-label', 'delens namn');
    var kolon = document.createElement('span'); kolon.className = 'prob-kolon'; kolon.textContent = ':';
    var uttryckYta = document.createElement('div'); uttryckYta.className = 'prob-uttryck sida';
    uttryckYta.appendChild(K.textSeg({ vars: vars, etikett: 'uttryck för delen' }));
    rad.appendChild(namn); rad.appendChild(kolon); rad.appendChild(uttryckYta);
    delListaEl.appendChild(rad);

    // motsvarande rad i steg 4: uttrycket ekas, värdet fylls i
    var irad = document.createElement('div'); irad.className = 'prob-insattrad';
    var eko = document.createElement('span'); eko.className = 'prob-eko';
    var lika = document.createElement('span'); lika.className = 'prob-lika'; lika.textContent = '=';
    var vardeYta = document.createElement('div'); vardeYta.className = 'prob-varde sida';
    vardeYta.appendChild(K.textSeg({ vars: '', etikett: 'värdet' }));
    irad.appendChild(eko); irad.appendChild(lika); irad.appendChild(vardeYta);
    insattListaEl.appendChild(irad);

    // ── STEG 5: ett svarsfält per del, med elevens eget namn framför ──
    var srad = document.createElement('div'); srad.className = 'prob-svarrad2';
    var snamn = document.createElement('span'); snamn.className = 'prob-eko';
    var svarYta = document.createElement('div'); svarYta.className = 'prob-svar sida';
    svarYta.appendChild(K.textSeg({ vars: '', etikett: 'svar med enhet' }));
    var sstatus = document.createElement('span'); sstatus.className = 'prob-svar-status';
    srad.appendChild(snamn); srad.appendChild(svarYta); srad.appendChild(sstatus);
    svarListaEl.appendChild(srad);

    function speglaUttryck(){ eko.textContent = K.las(uttryckYta) || '—'; }
    function speglaNamn(){ snamn.textContent = namn.value.trim() || ('rad ' + (delRader.indexOf(post) + 1)); }
    uttryckYta.addEventListener('input', speglaUttryck);
    namn.addEventListener('input', speglaNamn);

    var post = { namn: namn, uttryckYta: uttryckYta, vardeYta: vardeYta, svarYta: svarYta,
                 svarStatus: sstatus, eko: eko, rad: rad, irad: irad, srad: srad };
    delRader.push(post);
    speglaUttryck(); speglaNamn();
    var f = uttryckYta.querySelector('.seg-text'); if(f) f.focus();
    return post;
  }

  // ── STEG 2 + 3: ekvationen och balansmetoden i ett rutnät ──
  var grid = document.createElement('div'); grid.className = 'eq-grid prob-grid';
  block.appendChild(grid);
  steghuvudGrid(grid, TEXT.ekvation.etikett);
  var ekvRad = K.rad(grid, { vars: vars, etikett: TEXT.ekvation.etikett });
  steghuvudGrid(grid, TEXT.balans.etikett);
  var kedja = [];
  function nyKedjeRad(){ var r = K.rad(grid, { vars: vars, etikett: TEXT.balans.etikett }); kedja.push(r); return r; }
  nyKedjeRad(); nyKedjeRad();
  var knappRad = K.helRad(grid, 'prob-knapprad');
  var nyRadB = document.createElement('button'); nyRadB.type = 'button'; nyRadB.className = 'mini-btn'; nyRadB.textContent = TEXT.nyRad.titel;
  nyRadB.onclick = function(){ var r = nyKedjeRad(); grid.appendChild(knappRad); r.fokus(); };
  knappRad.appendChild(nyRadB);

  // ── FÖLJDFRÅGAN: en egen rad mellan balansmetoden och svaret (arean är en multiplikation) ──
  var foljdYta = null, foljdStatus = null;
  if(u.foljdfraga){
    var frad = document.createElement('div'); frad.className = 'prob-foljdrad';
    var fet = document.createElement('span'); fet.className = 'prob-foljd-etikett'; fet.textContent = u.foljdfraga.etikett;
    foljdYta = document.createElement('div'); foljdYta.className = 'prob-foljd sida';
    foljdYta.appendChild(K.textSeg({ vars: '', etikett: u.foljdfraga.etikett }));
    foljdStatus = document.createElement('span'); foljdStatus.className = 'prob-svar-status';
    frad.appendChild(fet); frad.appendChild(foljdYta); frad.appendChild(foljdStatus);
    block.appendChild(frad);
  }

  // ── STEG 5-ytan (fylls av nyDelRad) ──
  var svarHuvud = document.createElement('div'); svarHuvud.className = 'prob-steg-rub'; svarHuvud.textContent = TEXT.svar.etikett;
  var svarListaEl = document.createElement('div'); svarListaEl.className = 'prob-svarlista';
  block.appendChild(svarHuvud); block.appendChild(svarListaEl);

  // knappen som lägger till delrader (raderna är INTE förtryckta)
  var delKnapp = document.createElement('button'); delKnapp.type = 'button'; delKnapp.className = 'mini-btn prob-nydel';
  delKnapp.textContent = TEXT.nyDel.titel;
  delKnapp.onclick = function(){ nyDelRad(); };
  vk.appendChild(delKnapp);

  var klar = document.createElement('div'); klar.className = 'uppg-klar'; klar.textContent = TEXT.klar.titel;
  block.appendChild(klar);
  var besked = document.createElement('div'); besked.className = 'uppg-besked'; block.appendChild(besked);

  kort.appendChild(block);
  nyDelRad();                       // EN rad att börja i; resten lägger eleven till
  return { u: u, delRader: delRader, ekvRad: ekvRad, kedja: kedja, klarEl: klar, beskedEl: besked, block: block,
           foljdYta: foljdYta, foljdStatus: foljdStatus };
}

function steghuvudGrid(grid, text){
  var d = K.helRad(grid, 'prob-steg-rub'); d.textContent = text; return d;
}

// ── RÄTTNING ──────────────────────────────────────────────────────────────────────────────────
function radUttryckAv(s){ return s.delRader.map(function(d){ return K.las(d.uttryckYta); }); }
function besvarad(s){
  if(radUttryckAv(s).some(function(t){ return t.trim() !== ''; })) return true;
  var p = K.radPar(s.ekvRad); if(p.vl !== '' || p.hl !== '') return true;
  return s.kedja.some(function(r){ return !K.tomRad(r); });
}
function rensaUppgift(s){
  K.rensa(s.ekvRad); s.kedja.forEach(K.rensa);
  s.delRader.forEach(function(d){
    d.uttryckYta.classList.remove('ratt', 'fel');
    d.vardeYta.classList.remove('ratt', 'fel');
    d.svarYta.classList.remove('ratt', 'fel');
    d.svarStatus.textContent = '';
  });
  if(s.foljdYta){ s.foljdYta.classList.remove('ratt', 'fel'); s.foljdStatus.textContent = ''; }
  s.beskedEl.textContent = ''; s.klarEl.classList.remove('show');
}

// Svarsenheterna i EN uppgift: uttryck + insättning + svar per delrad, ekvationsraden och varje
// IFYLLD kedjerad. En tom extra kedjerad är en erbjuden rad, inte en svarsenhet.
// En enhet är BEDÖMD när den bär ett omdöme. Det som inte prövats räknas varken upp eller ned.
function ytaOmdome(el){ return el.classList.contains('ratt') ? 1 : el.classList.contains('fel') ? 0 : null; }
function radOmdome(r){ return r.vlWrap.classList.contains('rad-ok') ? 1 : r.vlWrap.classList.contains('rad-fel') ? 0 : null; }
function las_summa(delar){
  var tot = 0, ratt = 0, obedomt = 0;
  delar.forEach(function(v){ if(v === null) obedomt++; else { tot++; ratt += v; } });
  return { tot: tot, ratt: ratt, obedomt: obedomt };
}
function summaAv(s){
  var v = [];
  s.delRader.forEach(function(d){ v.push(ytaOmdome(d.uttryckYta), ytaOmdome(d.vardeYta), ytaOmdome(d.svarYta)); });
  if(s.foljdYta) v.push(ytaOmdome(s.foljdYta));
  v.push(radOmdome(s.ekvRad));
  s.kedja.forEach(function(r){ if(!K.tomRad(r)) v.push(radOmdome(r)); });
  return las_summa(v);
}
function kontrollera(state, hintEl, sammanfEl){
  var klara = 0, besvarade = 0;
  state.forEach(function(s){
    rensaUppgift(s);
    if(!besvarad(s)) return;
    besvarade++;

    var uttryckTexter = radUttryckAv(s);
    var ord = ordnaDelar(s.u, uttryckTexter);
    if(ord.fel){
      s.delRader.forEach(function(d){ d.uttryckYta.classList.add('fel'); });
      s.beskedEl.textContent = ord.fel.besked || '';
      logga(s.u.nod, 'fel');
      return;
    }

    // elevens svar i rättarens form: nycklarna kommer ur ordningen som höll
    var rader = [K.radPar(s.ekvRad)].concat(s.kedja.map(K.radPar))
                  .filter(function(p){ return p.vl !== '' || p.hl !== ''; });
    var insattning = {}, svar = {};
    ord.ordning.forEach(function(nyckel, i){
      insattning[nyckel] = K.las(s.delRader[i].vardeYta);
      svar[nyckel] = K.las(s.delRader[i].svarYta);
    });
    var harInsattning = ord.ordning.some(function(n){ return insattning[n].trim() !== ''; });
    var res = R.ratta(s.u, { uttryck: ord.uttryck, rader: rader,
                             insattning: harInsattning ? insattning : null, svar: svar,
                             foljd: s.foljdYta ? K.las(s.foljdYta) : undefined });
    var radFor = {};
    ord.ordning.forEach(function(nyckel, i){ radFor[nyckel] = s.delRader[i]; });

    if(res.status === 'ratt'){
      s.delRader.forEach(function(d){ d.uttryckYta.classList.add('ratt'); d.vardeYta.classList.add('ratt');
                                      d.svarYta.classList.add('ratt'); d.svarStatus.textContent = '✓'; });
      if(s.foljdYta){ s.foljdYta.classList.add('ratt'); s.foljdStatus.textContent = '✓'; }
      K.markera(s.ekvRad, true);
      s.kedja.forEach(function(r){ if(!K.tomRad(r)) K.markera(r, true); });
      s.klarEl.classList.add('show');
      klara++; logga(s.u.nod, 'ratt');
      return;
    }

    // markera DÄR felet är — första felet i metodordningen
    if(res.steg === 'uttryck'){
      if(res.del && radFor[res.del]) radFor[res.del].uttryckYta.classList.add('fel');
      else s.delRader.forEach(function(d){ d.uttryckYta.classList.add('fel'); });
    } else if(res.steg === 'ekvation'){
      s.delRader.forEach(function(d){ d.uttryckYta.classList.add('ratt'); });
      K.markera(s.ekvRad, false);
    } else if(res.steg === 'balans'){
      s.delRader.forEach(function(d){ d.uttryckYta.classList.add('ratt'); });
      var ifyllda = [s.ekvRad].concat(s.kedja.filter(function(r){ return !K.tomRad(r); }));
      var i = Math.max(1, (res.rad || ifyllda.length)) - 1;
      for(var j = 0; j < i && j < ifyllda.length; j++) K.markera(ifyllda[j], true);
      if(ifyllda[i]) K.markera(ifyllda[i], false);
    } else if(res.steg === 'foljd'){
      s.delRader.forEach(function(d){ d.uttryckYta.classList.add('ratt'); d.vardeYta.classList.add('ratt'); });
      K.markera(s.ekvRad, true);
      s.kedja.forEach(function(r){ if(!K.tomRad(r)) K.markera(r, true); });
      if(s.foljdYta){ s.foljdYta.classList.add('fel'); s.foljdStatus.textContent = '✗'; }
    } else if(res.steg === 'insattning' || res.steg === 'svar'){
      s.delRader.forEach(function(d){ d.uttryckYta.classList.add('ratt'); });
      K.markera(s.ekvRad, true);
      s.kedja.forEach(function(r){ if(!K.tomRad(r)) K.markera(r, true); });
      if(s.foljdYta && res.per && res.per.foljd) { s.foljdYta.classList.add('ratt'); s.foljdStatus.textContent = '✓'; }
      // varje ruta i steget bär sitt eget omdöme — inte bara den första felaktiga
      var per = res.per || { insattning: {}, svar: {} };
      ord.ordning.forEach(function(nyckel, i){
        var d3 = s.delRader[i]; if(!d3) return;
        if(per.insattning[nyckel] === true) d3.vardeYta.classList.add('ratt');
        else if(per.insattning[nyckel] === false) d3.vardeYta.classList.add('fel');
        if(per.svar[nyckel] === true){ d3.svarYta.classList.add('ratt'); d3.svarStatus.textContent = '✓'; }
        else if(per.svar[nyckel] === false){ d3.svarYta.classList.add('fel'); d3.svarStatus.textContent = '✗'; }
      });

    }
    s.beskedEl.textContent = res.besked || '';
    logga(s.u.nod, 'fel');
  });

  if(sammanfEl){
    var tot = 0, ratt = 0, obedomt = 0;
    state.forEach(function(s){ if(!besvarad(s)) return; var v = summaAv(s); tot += v.tot; ratt += v.ratt; obedomt += v.obedomt; });
    sammanfEl.textContent = 'Du fick ' + ratt + ' av ' + tot + ' rätt.'
                          + (obedomt ? ' ' + TEXT.obedomt.hint : '');
  }
  if(!besvarade){ hintEl.className = 'global-hint'; hintEl.textContent = ''; return; }
  if(klara === state.length){ hintEl.className = 'global-hint ok'; hintEl.textContent = TEXT.allaRatt.hint; }
  else { hintEl.className = 'global-hint'; hintEl.textContent = TEXT.pagang.hint; }
}

function logga(nod, utfall){
  if(window.MasteryK3 && window.MasteryK3.loggaForsok) window.MasteryK3.loggaForsok(nod, utfall);
}

// ── MONTERING ─────────────────────────────────────────────────────────────────────────────────
(function(){
  var mount = document.getElementById('sheet-delar');
  if(mount && K && R && M) render(mount, BLAD);
})();

if(typeof window !== 'undefined') window.ProbBlad2 = { BLAD: BLAD, render: render, ordnaDelar: ordnaDelar };
})();
