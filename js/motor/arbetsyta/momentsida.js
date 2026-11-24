/* momentsida.js — MOMENTSIDANS SKAL (doc/KONVENTIONER.md "Arbetssidan — moment-sida, horisont och uppgiftssida"),
   delat av delkapitlens momentsidor i det nya formatet. Utbrutet ur ak7/k3/d5-problemlosning-nyformat/index.html
   (Joachim 2026-11-21: "bara en flytt" — problemlösningen ser ut och fungerar som förut). Formgivningen:
   momentsida.css. Ramen (vänsterspalt, flikarna "Arbeta med området" / "Mina kunskaper") är NavRam (navram.js).

   Skalet äger det som är lika på varje momentsida: horisont-märket, de fällbara sektionerna, bladlistan och
   monteringen i ramen (momenten, UNDER dem Dagens träning + Test). Sidan äger VAD som visas: momenten, bladen,
   testen, och vad varje sektion innehåller.

   API:
     Momentsida.horisont(m, taxonomi, elevensAr)     märket för ett moment: m.ff → FF; m.blad → härleds ur bladens
                                                     noder (lägsta årskurs; kärna om någon nod är kärna); annars
                                                     m.ar + m.roll.
     Momentsida.sektion(scen, rubrik, vidForstaOppning)   en fällbar sektion sist i scenen → { body, satt(öppen) }.
     Momentsida.sektionKommer(scen, rubrik)          en sektion som inte finns än: rubriken + "Kommer senare", inte klickbar.
     Momentsida.el(tagg, klass, text)                ett element.
     Momentsida.montera({ vard, rubrik, moment, test, mina })
                                                     ramen: moment = [{ titel (html), kommer, valj }], test = valj
                                                     för Test, mina = ramens Mina kunskaper-vyer. Ger { scen, ram }.
   Ingen nätväg. */
(function(){
'use strict';

// Taxonomin bär ingen årskurs per nod, bara arskursRelevans {ak7:'mal', …}. Årskursen = första år med 'mal'.
function nod(tax, id){ return (tax || []).filter(function(n){ return n.id === id; })[0] || null; }
function arUrNod(n){
  var r = (n && n.arskursRelevans) || {};
  for(var a = 7; a <= 9; a++) if(r['ak' + a] === 'mal') return a;
  for(var b = 7; b <= 9; b++) if(r['ak' + b]) return b;
  return null;
}
function horisont(m, tax, elevensAr){
  if(m.ff) return '<span class="hz hz-ff">FF</span>';
  var ar = m.ar, roll = m.roll;
  if(m.blad){   // härleds: lägsta årskurs bland bladens noder; kärna om någon nod är kärna
    var noder = m.blad.map(function(b){ return nod(tax, b.nod); }).filter(Boolean);
    ar = Math.min.apply(null, noder.map(arUrNod).filter(function(x){ return x; }));
    roll = noder.some(function(n){ return n.roll === 'karna'; }) ? 'karna' : (noder[0] && noder[0].roll);
  }
  return badge(ar, roll, elevensAr);
}
/* HORISONT-BADGEN (KONVENTIONER, nov 2026): doc-år = elevens + kärna → 7/8/9 (Nu); doc-år = elevens +
   fördjupning → F; doc-år > elevens → FF; doc-år < elevens → R. */
function badge(ar, roll, elevensAr){
  if(!ar) return '';
  if(ar > elevensAr) return '<span class="hz hz-ff">FF</span>';
  if(ar < elevensAr) return '<span class="hz hz-r">R</span>';
  if(roll === 'fordjupning') return '<span class="hz hz-f">F</span>';
  return '<span class="hz hz-nu">' + ar + '</span>';
}

function el(tagg, klass, text){ var e = document.createElement(tagg); if(klass) e.className = klass; if(text != null) e.textContent = text; return e; }

/* FÄLLBAR SEKTION (order 2026-11-21): rubriken fäller ut/in sektionens innehåll. Läget sparas INTE — vid
   inträde gäller öppen-värdet sidan sätter med satt(). vidForstaOppning körs första gången sektionen öppnas. */
function sektion(scen, rubrik, vidForstaOppning){
  var s = el('section', 'nf-sek'), h = el('h2', 'nf-sek-h'), kn = el('button', 'nf-fall');
  kn.type = 'button';
  var chev = el('span', 'nr-chev'); chev.setAttribute('aria-hidden', 'true');
  kn.appendChild(chev); kn.appendChild(document.createTextNode(rubrik)); h.appendChild(kn); s.appendChild(h);
  var body = el('div', 'nf-sek-body'); s.appendChild(body);
  var oppnad = false;
  function satt(o){
    kn.setAttribute('aria-expanded', o ? 'true' : 'false'); chev.textContent = o ? '▾' : '▸';
    body.hidden = !o; s.classList.toggle('is-stangd', !o);
    if(o && !oppnad){ oppnad = true; if(vidForstaOppning) vidForstaOppning(body); }
  }
  kn.addEventListener('click', function(){ satt(kn.getAttribute('aria-expanded') !== 'true'); });
  scen.appendChild(s);
  return { body: body, satt: satt };
}

/* SEKTION SOM INTE FINNS ÄN (Joachim 2026-11-21): rubriken med märket "Kommer senare" — ingen knapp, inget
   innehåll, inte klickbar. Samma märke som Dagens träning i ramen. */
function sektionKommer(scen, rubrik){
  var s = el('section', 'nf-sek is-stangd is-kommer'), h = el('h2', 'nf-sek-h');
  h.appendChild(el('span', null, rubrik)); h.appendChild(el('span', 'nf-chip soon', 'Kommer senare'));
  s.appendChild(h); scen.appendChild(s);
  return s;
}

/* VÄNSTERSPALTEN, moment-först: momenten, och UNDER dem Dagens träning + Test. Dagens träning är inte byggd
   för något delkapitel ännu — den står utan länk, med "Kommer senare". Vyerna byggs i #scener och flyttas in i
   ramens ytor (samma mönster som piloten ak7/k1/d1). */
function montera(o){
  var scen = document.getElementById('scen-moment');
  var ram = window.NavRam && window.NavRam.montera({
    vard: o.vard,
    arbeta: [ { rubrik: o.rubrik, grupper: [
      { rubrik: null, varianter: o.moment },
      /* Test utan o.test (Joachim 2026-11-24, d1: "visa Kommer senare tills mina sex test är byggda"): samma rad
         som Dagens träning — märket, ingen länk. Med o.test som förut. */
      { rubrik: null, varianter: [ { titel: 'Dagens träning<span class="nf-chip soon">Kommer senare</span>', kommer: true },
                                   o.test ? { titel: 'Test', valj: o.test }
                                          : { titel: 'Test<span class="nf-chip soon">Kommer senare</span>', kommer: true } ] }
    ] } ],
    mina: o.mina,
    niva: null
  });
  if(ram){
    scen.classList.add('is-on'); ram.ytaArbeta.appendChild(scen);
    (o.mina || []).forEach(function(v){ var e = document.getElementById(v.vy); if(e) ram.ytaMina.appendChild(e); });
    var hall = document.getElementById('scener'); if(hall) hall.remove();
  }
  return { scen: scen, ram: ram };
}

window.Momentsida = { horisont: horisont, badge: badge, sektion: sektion, sektionKommer: sektionKommer, el: el, montera: montera };
})();
