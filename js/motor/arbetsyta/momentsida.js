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
     Momentsida.metodtraning(scen, data)             Metodträningens sektion med trädet (data: rot, kategorier, löv
                                                     med bankernas id). Utan löv: rubriken med "Kommer senare".
     Momentsida.montera({ vard, rubrik, moment, tester, testAdress, mina })
                                                     ramen: moment = [{ titel (html), kommer, valj }], tester =
                                                     [{ id, titel }] (författade; Test listar dem, inga → "Kommer
                                                     senare"), mina = ramens Mina kunskaper-vyer. Ger { scen, ram }.
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
   innehåll, inte klickbar. Samma märke som Dagens träning i ramen. SAMMA RUBRIK som de fällbara (Joachim 2026-11-24):
   samma utseende och samma linje — pilens plats står kvar (osynlig), och rubriken är bara inte klickbar. */
function sektionKommer(scen, rubrik){
  var s = el('section', 'nf-sek is-stangd is-kommer'), h = el('h2', 'nf-sek-h'), f = el('span', 'nf-fall is-av');
  var chev = el('span', 'nr-chev', '▸'); chev.setAttribute('aria-hidden', 'true');
  f.appendChild(chev); f.appendChild(document.createTextNode(rubrik)); f.appendChild(el('span', 'nf-chip soon', 'Kommer senare'));
  h.appendChild(f); s.appendChild(h); scen.appendChild(s);
  return s;
}

/* METODTRÄNING (KONVENTIONER "Arbetssidan", METODTRÄNING — Joachim 2026-11-24; flyttad ur d5:s momentsida och
   metodtraning.html). Rubriken fäller ut trädet: kartans komponent (KartaMotor) i en iframe med den delade sidan
   metodtrad.html bredvid den här filen. Sidan lämnar bara datan: { rot, kategorier: [{ id, namn, lov: [{ id, namn,
   bank, nod }] }], prefKey, … }. Ett löv med bank är klickbart och öppnar drillen som en EGEN SIDA (drill.html, hela
   fönstret, uppgiftssidans upplägg; Tillbaka = returAdress(): momentsidan med samma moment och Metodträning utfälld);
   ett löv utan bank står utan länk. Trädet visas i full höjd utan egen scroll: metodtrad.html sätter ramens höjd
   efter innehållet (Joachim 2026-11-24). Utan ett enda löv står rubriken med "Kommer senare". Ger sektionen eller null. */
var TRAD_SIDA = (function(){
  var s = document.currentScript && document.currentScript.src;
  return s ? s.replace(/momentsida\.js(\?[^#]*)?(#.*)?$/, 'metodtrad.html') : 'metodtrad.html';
})();
var AKTUELLT = null, METOD_SEK = null;   // momentet som visas och dess Metodträning-sektion
function metodtraning(scen, data){
  var harLov = !!(data && (data.kategorier || []).some(function(k){ return (k.lov || []).length > 0; }));
  if(!harLov){ sektionKommer(scen, 'Metodträning'); METOD_SEK = null; return null; }
  var sek = sektion(scen, 'Metodträning', function(body){
    var trad = el('iframe', 'nf-trad'); trad.title = 'Metodträning';
    trad.setAttribute('scrolling', 'no');   // ingen egen scroll: höjden följer trädet (metodtrad.html)
    trad.__metod = data;            // läses av metodtrad.html (frameElement.__metod), också efter en retur
    trad.src = TRAD_SIDA; body.appendChild(trad);
  });
  METOD_SEK = sek;
  return sek;
}
/* TILLBAKA FRÅN DRILLEN: momentsidan med samma moment (?moment=<id>) och Metodträning utfälld (?metod=1); sidans
   egen ?retur= (vart momentsidans Tillbaka leder) följer med. Läses av metodtrad.html när ett löv öppnas. */
function returAdress(){
  var u = new URL(location.href), p = new URLSearchParams(), r = u.searchParams.get('retur');
  if(AKTUELLT) p.set('moment', AKTUELLT);
  p.set('metod', '1');
  if(r) p.set('retur', r);
  u.hash = ''; u.search = '?' + p.toString();
  return u.href;
}

/* TEST (KONVENTIONER "Arbetssidan", TEST — Joachim 2026-11-24; flyttad ur d5:s momentsida). Joachims författade
   test, listade här och öppnade på uppgiftssidan (?test=<id>). Aldrig länkar till gamla test eller provbyggaren.
   tester = [{ id, titel }]. */
function visaTester(scen, tester, adress){
  scen.innerHTML = '';
  var s = el('section', 'nf-sek'); s.appendChild(el('h2', 'nf-sek-h', 'Test'));
  var l = el('div', 'nf-lista');
  tester.forEach(function(t){
    var a = el('a', 'nf-blad'); a.href = (adress || 'uppgift.html?test=') + encodeURIComponent(t.id);
    a.appendChild(el('span', null, t.titel)); l.appendChild(a);
  });
  s.appendChild(l); scen.appendChild(s);
}

/* VÄNSTERSPALTEN, moment-först: momenten, och UNDER dem Dagens träning + Test. Dagens träning är inte byggd
   för något delkapitel ännu — den står utan länk, med "Kommer senare". Vyerna byggs i #scener och flyttas in i
   ramens ytor (samma mönster som piloten ak7/k1/d1). */
function montera(o){
  var scen = document.getElementById('scen-moment');
  // TEST: sidans författade test (o.tester), listade av skalet. Inga test → "Kommer senare".
  var tester = (o.tester || []).filter(function(t){ return t && t.id; });
  var visaTest = tester.length ? function(){ AKTUELLT = null; METOD_SEK = null; visaTester(scen, tester, o.testAdress); } : null;
  // MOMENTEN: skalet minns vilket som visas (m.id, annars m<nr>) — för ?moment= och drillens Tillbaka.
  var momentId = (o.moment || []).map(function(m, i){ return m.id || ('m' + (i + 1)); });
  var varianter = (o.moment || []).map(function(m, i){
    var c = {}; Object.keys(m).forEach(function(k){ c[k] = m[k]; });
    if(m.valj) c.valj = function(){ AKTUELLT = momentId[i]; METOD_SEK = null; return m.valj.apply(this, arguments); };
    return c;
  });
  var ram = window.NavRam && window.NavRam.montera({
    vard: o.vard,
    arbeta: [ { rubrik: o.rubrik, grupper: [
      { rubrik: null, varianter: varianter },
      /* Test utan författade test (Joachim 2026-11-24): samma rad som Dagens träning — märket, ingen länk. */
      { rubrik: null, varianter: [ { titel: 'Dagens träning<span class="nf-chip soon">Kommer senare</span>', kommer: true },
                                   visaTest ? { titel: 'Test', valj: visaTest }
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
  /* ?moment=<id> öppnar det momentet (uppgiftssidans och drillens Tillbaka leder dit); ?metod=1 fäller ut dess
     Metodträning och visar den. Utan parametrarna som förut. */
  try {
    var q = new URLSearchParams(location.search), mid = q.get('moment'), ix = momentId.indexOf(mid);
    if(ix >= 0 && o.moment[ix].valj && !o.moment[ix].kommer && AKTUELLT !== mid){
      var rader = document.querySelectorAll('.nr-rad'); if(rader[ix] && !rader[ix].disabled) rader[ix].click();
    }
    if(q.get('metod') === '1' && METOD_SEK){
      METOD_SEK.satt(true);
      var sekEl = METOD_SEK.body.parentNode;
      setTimeout(function(){ var r = document.documentElement, sb = r.style.scrollBehavior; r.style.scrollBehavior = 'auto';
        sekEl.scrollIntoView({ block: 'start' }); r.style.scrollBehavior = sb; }, 0);
    }
  } catch(e){}
  return { scen: scen, ram: ram };
}

window.Momentsida = { horisont: horisont, badge: badge, sektion: sektion, sektionKommer: sektionKommer, el: el, montera: montera,
                      metodtraning: metodtraning, returAdress: returAdress };
})();
