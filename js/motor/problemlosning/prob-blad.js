/* prob-blad.js — PROBLEMLÖSNINGENS ÖVA-BLAD (order 2026-09-23, piloten: variant 1).

   Metoden ÄR bladets form. Varje uppgift har tre steg under varandra i ETT rutnät, så att
   likhetstecknen står i linje hela vägen ner och stegen ändå syns som tre skilda ting:

       Ekvation         [ 8x + 15 ] = [ 63 ]
       Balansmetoden    [ 8x      ] = [ 48 ]
                        [ x       ] = [ 6  ]        + Ny rad
       Svar             [ 6                 ]

   Variant 1 ("följa en instruktion") har inga delar att namnge och inget värde att sätta tillbaka:
   det okända talet ÄR x. Steg 1 i metoden (skriv uttryck för delarna) finns därför inte på det här
   bladet — rättaren får uttrycket { <del>: x } automatiskt.

   Kedjan går i KORT läge: en rad per operation (problemlösningen kapar mellanled, men aldrig under
   vad kommunikationen kräver). Raden är den delade komponenten (ekv-kedja.js) — samma rad som i
   ekvationskapitlet. Rättningen är ProbRattare: första felet i metodordningen pekas ut.

   Ingen rättning förrän Kontrollera. Inga hjälptexter, inga platshållare.

   NÄR NIVÅ 2 BYGGS (notering 2026-09-24): likheterna i dokumentet använder bokstaven s
   ("2s + 18 = 3s + 6"). BYT TILL x. Rättaren bär sex bokstäver — x, y, a, b, c, n — och en
   sjunde för en enda uppgift är inte värt det (Joachims beslut). Samma sak gäller varje
   kommande uppgift med en bokstav utanför de sex: byt bokstaven, inte rättaren. */
(function(){
'use strict';

var K   = (typeof window !== 'undefined' && window.EkvKedja) || null;
var EP  = (typeof window !== 'undefined' && window.EkvParser) || null;
var R   = (typeof window !== 'undefined' && window.ProbRattare) || null;

// ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
var TEXT = {
  ekvation:   { etikett: 'Ekvation' },
  balans:     { etikett: 'Balansmetoden' },
  svar:       { etikett: 'Svar' },
  nyRad:      { titel: '+ Ny rad' },
  kontroll:   { titel: 'Kontrollera' },
  omstart:    { titel: 'Börja om' },
  klar:       { titel: '✓ Löst!' },
  allaRatt:   { hint: 'Alla uppgifter lösta.' },
  pagang:     { hint: 'Läs beskedet vid uppgiften och gå vidare.' },
  obedomt:    { hint: 'Där steg 1 inte stämmer är resten inte rättad.' }
};

// ── UPPGIFTERNA: variant 1 ur dokumentet (Problemlösning Nivå 1) ──────────────────────────────
// Modellen: en del (det okända talet), inga relationer, ett villkor. Facit räknas ut ur villkoret.
var BLAD = {
  id: 'instruktion', titel: 'Följa en instruktion', nod: 'alg-prob-instruktion:problem',
  uppgifter: [
    { id: 'n1-instr-a', nod: 'alg-prob-instruktion:problem', niva: 1, variabel: 'x',
      fraga: 'Ett tal multipliceras med 8, sedan adderar man 15 till produkten och får då 63 som svar. Vilket tal börjar man med?',
      delar: [{ nyckel: 'T', namn: 'talet' }], relationer: [], villkor: ['8·T + 15 = 63'],
      enhet: null, svarDelar: ['T'] },
    { id: 'n1-instr-b', nod: 'alg-prob-instruktion:problem', niva: 1, variabel: 'x',
      fraga: 'Ett tal divideras med 7, sedan subtraherar man 3 till kvoten och får då som svar 5. Vilket tal utgår man ifrån?',
      delar: [{ nyckel: 'T', namn: 'talet' }], relationer: [], villkor: ['T/7 - 3 = 5'],
      enhet: null, svarDelar: ['T'] },
    { id: 'n1-instr-c', nod: 'alg-prob-instruktion:problem', niva: 1, variabel: 'x',
      fraga: 'Tarek tänker på ett tal. Han multiplicerar talet med 5 och adderar sedan produkten med 12 och får som resultat 32. Vilket tal tänker Tarek på?',
      delar: [{ nyckel: 'T', namn: 'talet' }], relationer: [], villkor: ['5·T + 12 = 32'],
      enhet: null, svarDelar: ['T'] },
    { id: 'n1-instr-d', nod: 'alg-prob-instruktion:problem', niva: 1, variabel: 'x',
      fraga: 'Mia tänker på ett tal. Hon dividerar talet med 4 och subtraherar sedan kvoten med 3 och får som resultat 6. Vilket tal tänker Mia på?',
      delar: [{ nyckel: 'T', namn: 'talet' }], relationer: [], villkor: ['T/4 - 3 = 6'],
      enhet: null, svarDelar: ['T'] }
  ]
};

var START_KEDJERADER = 2;   // ekvationen + två rader = minimikravet i de här uppgifterna; fler via knappen

function render(mount, blad){
  mount.innerHTML = '';
  var kort = document.createElement('div'); kort.className = 'prob-kort';
  kort.setAttribute('data-blad', blad.id);
  var rub = document.createElement('div'); rub.className = 'niva-rubrik'; rub.textContent = blad.titel;
  kort.appendChild(rub);

  var state = [];

  blad.uppgifter.forEach(function(u, idx){
    var block = document.createElement('div'); block.className = 'prob-uppg';
    block.setAttribute('data-nod', u.nod);

    var et = document.createElement('div'); et.className = 'uppg-etikett';
    et.textContent = String.fromCharCode(97 + idx) + ')';
    block.appendChild(et);
    var fraga = document.createElement('p'); fraga.className = 'prob-fraga'; fraga.textContent = u.fraga;
    block.appendChild(fraga);

    var grid = document.createElement('div'); grid.className = 'eq-grid prob-grid'; block.appendChild(grid);
    var vars = u.variabel || 'x';

    // STEG 1 — ekvationen
    K.helRad(grid, 'prob-steg-rub').textContent = TEXT.ekvation.etikett;
    var ekvRad = K.rad(grid, { vars: vars, etikett: TEXT.ekvation.etikett });

    // STEG 2 — balansmetoden
    K.helRad(grid, 'prob-steg-rub').textContent = TEXT.balans.etikett;
    var kedja = [];
    function laggRad(){ var r = K.rad(grid, { vars: vars, etikett: TEXT.balans.etikett }); kedja.push(r); return r; }
    for(var i = 0; i < START_KEDJERADER; i++) laggRad();
    var knappRad = K.helRad(grid, 'prob-knapprad');
    var nyB = document.createElement('button'); nyB.type = 'button'; nyB.className = 'mini-btn';
    nyB.textContent = TEXT.nyRad.titel;
    nyB.onclick = function(){ var r = laggRad(); flyttaSist(); r.fokus(); };   // knapp + svar hålls sist i rutnätet
    knappRad.appendChild(nyB);
    // håll knappraden och svarsdelen sist i rutnätet när en rad läggs till
    function flyttaSist(){ [knappRad, svarRub, svarRad].forEach(function(el){ if(el) grid.appendChild(el); }); }

    // STEG 3 — svaret
    var svarRub = K.helRad(grid, 'prob-steg-rub'); svarRub.textContent = TEXT.svar.etikett;
    var svarRad = K.helRad(grid, 'prob-svarrad');
    // Svarsrutan är en segment-yta: texten skrivs i ett fält, och bråkknappen kan bygga ett
    // staplat bråk här precis som i kedjans rutor (svaret kan vara ett bråk).
    var svarIn = document.createElement('div'); svarIn.className = 'prob-svar sida';
    svarIn.appendChild(K.textSeg({ vars: '', etikett: TEXT.svar.etikett }));
    var svarStatus = document.createElement('span'); svarStatus.className = 'prob-svar-status';
    svarRad.appendChild(svarIn); svarRad.appendChild(svarStatus);

    var klar = document.createElement('div'); klar.className = 'uppg-klar'; klar.textContent = TEXT.klar.titel;
    block.appendChild(klar);
    var besked = document.createElement('div'); besked.className = 'uppg-besked'; block.appendChild(besked);

    kort.appendChild(block);
    state.push({ u: u, ekvRad: ekvRad, kedja: kedja, svarIn: svarIn, svarStatus: svarStatus,
                 klarEl: klar, beskedEl: besked, delNyckel: u.delar[0].nyckel });
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

// ── RÄTTNING: ingen förrän Kontrollera. Första felet i metodordningen pekas ut. ────────────────
function svarPaUppgift(s){
  var rader = [K.radPar(s.ekvRad)].concat(s.kedja.map(K.radPar))
                .filter(function(p){ return p.vl !== '' || p.hl !== ''; });
  var uttryck = {}; uttryck[s.delNyckel] = (s.u.variabel || 'x');   // det okända talet ÄR x
  var svar = {}; svar[s.delNyckel] = K.las(s.svarIn);
  return { uttryck: uttryck, rader: rader, svar: svar };
}
function besvarad(s){
  if(K.las(s.svarIn).trim() !== '') return true;
  var p = K.radPar(s.ekvRad); if(p.vl !== '' || p.hl !== '') return true;
  return s.kedja.some(function(r){ return !K.tomRad(r); });
}

// Svarsenheterna i EN uppgift: ekvationsraden + ifyllda kedjerader + svarsrutan.
// En enhet är BEDÖMD när den bär ett omdöme. Det som inte prövats räknas varken upp eller ned.
function ytaOmdome(el){ return el.classList.contains('ratt') ? 1 : el.classList.contains('fel') ? 0 : null; }
function radOmdome(r){ return r.vlWrap.classList.contains('rad-ok') ? 1 : r.vlWrap.classList.contains('rad-fel') ? 0 : null; }
function las_summa(delar){
  var tot = 0, ratt = 0, obedomt = 0;
  delar.forEach(function(v){ if(v === null) obedomt++; else { tot++; ratt += v; } });
  return { tot: tot, ratt: ratt, obedomt: obedomt };
}
function summaAv(s){
  var v = [radOmdome(s.ekvRad)];
  s.kedja.forEach(function(r){ if(!K.tomRad(r)) v.push(radOmdome(r)); });
  v.push(ytaOmdome(s.svarIn));
  return las_summa(v);
}
function kontrollera(state, hintEl, sammanfEl){
  var klara = 0, besvarade = 0;
  state.forEach(function(s){
    // rensa förra rättningen
    K.rensa(s.ekvRad); s.kedja.forEach(K.rensa);
    s.svarStatus.textContent = ''; s.svarIn.classList.remove('ratt', 'fel');
    s.beskedEl.textContent = ''; s.klarEl.classList.remove('show');
    if(!besvarad(s)) return;
    besvarade++;

    var res = R.ratta(s.u, svarPaUppgift(s));
    if(res.status === 'ratt'){
      K.markera(s.ekvRad, true);
      s.kedja.forEach(function(r){ if(!K.tomRad(r)) K.markera(r, true); });
      s.svarIn.classList.add('ratt'); s.svarStatus.textContent = '✓';   // klassen sitter på ytan
      s.klarEl.classList.add('show');
      klara++;
      logga(s.u.nod, 'ratt');
      return;
    }
    // markera DÄR felet är, inte överallt
    if(res.steg === 'ekvation' || res.steg === 'uttryck'){
      K.markera(s.ekvRad, false);
    } else if(res.steg === 'balans'){
      var ifyllda = [s.ekvRad].concat(s.kedja.filter(function(r){ return !K.tomRad(r); }));
      var i = Math.max(1, (res.rad || ifyllda.length)) - 1;
      // raderna före felet stämmer
      for(var j = 0; j < i && j < ifyllda.length; j++) K.markera(ifyllda[j], true);
      if(ifyllda[i]) K.markera(ifyllda[i], false);
    } else if(res.steg === 'svar' || res.steg === 'foljd' || res.steg === 'insattning'){
      K.markera(s.ekvRad, true);
      s.kedja.forEach(function(r){ if(!K.tomRad(r)) K.markera(r, true); });
      s.svarIn.classList.add('fel'); s.svarStatus.textContent = '✗';
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
  var mount = document.getElementById('sheet-instruktion');
  if(mount && K && EP && R) render(mount, BLAD);
})();

if(typeof window !== 'undefined') window.ProbBlad = { BLAD: BLAD, render: render };
})();
