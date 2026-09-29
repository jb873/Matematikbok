/* kapitel-lista.js — KAPITELSIDANS DELKAPITELLISTA (window.KapitelLista), order 2026-09-25.

   Samma kort som navigationssidorna redan ritar (stripe · nummer · titel · beskrivning · badge),
   men som en anropbar funktion i stället för ett skript per sida. Åttans kapitel 2 är den första
   sidan som använder den; ak7-k3.html och ak8/k1/index.html rullar fortfarande sina egna och kan
   migreras hit senare.

   REGELN SOM BÄR PLATSERNA: ett delkapitel utan innehåll får kortet 'is-soon' — tonat, utan pil,
   och utan <a>. Ett kort får aldrig leda in i tomrum.

   STATUSEN HÄRLEDS UR FILEN, sätts aldrig för hand. Förr krävdes status:'open' tillsammans med en
   fil — och fältet drev isär från verkligheten: åttans elva delkapitel stod som BYGGER fast alla
   elva var byggda och i bruk, nians sju tomma skelett var klickbara. Nu är filen hela signalen.
   Ett status-fält i datan läses inte längre; kapitel-grinden fäller det som ligger kvar.

   NODERNA PER PLATS: en plats kan peka ut en utbudslista (visning.utbudslista i taxonomin). Då
   listas lövnodernas namn under beskrivningen, så att platsen visar vad den ska hålla innan den
   är byggd. utbudslista är en sträng ELLER en lista — samma lövnod kan höra hemma i sjuans
   kapitel och i åttans, med olika band. Den läsningen är DelkapitelSkal.iUtbud, och den delas.

   BAND PER KAPITEL: visning.niva är taket på drillens nivå. Den får vara ett tal (samma tak
   överallt) eller ett objekt med utbudslistans id som nyckel — { "k3d5": 1, "prob1": 3 } — så att
   samma nod kan ligga på olika band i sjuans och åttans kapitel. Se DelkapitelSkal.bandFor.

   Ingen nätväg. Stilen ligger i js/kapitel/navsida.css. */
(function(){
'use strict';

function iUtbud(visning, id){
  if(window.DelkapitelSkal && window.DelkapitelSkal.iUtbud) return window.DelkapitelSkal.iUtbud(visning, id);
  var u = visning && visning.utbudslista;
  return Array.isArray(u) ? u.indexOf(id) >= 0 : u === id;
}

// Lövnodernas namn för en utbudslista, i gruppernas och radernas ordning.
function noderFor(tax, id){
  var noder = (tax && tax.noder) || [];
  return noder.filter(function(n){ return n.niva === 'lovnod' && n.visning && iUtbud(n.visning, id); })
    .sort(function(a, b){
      var g = (a.visning.gruppordning || 0) - (b.visning.gruppordning || 0);
      return g || ((a.visning.radordning || 0) - (b.visning.radordning || 0));
    })
    .map(function(n){ return n.visning.titel || n.namn; });
}

function kort(d, tax){
  var arFordjupning = d.typ === 'fordjupning' || /fördjupning/i.test(d.titel || '');
  // Kantfärgen säger vad kortet ÄR (prov, fördjupning, vanligt delkapitel) — inte vilken sida det
  // ligger på. Blå överallt är Joachims beslut 2026-09-29; förr var k1 blå och k2/k3 gröna.
  var stripe = d.typ === 'prov' ? 'var(--gold)' : (arFordjupning ? '#7c6a9c' : 'var(--blue)');
  var badge = d.fil
    ? '<div class="card-badge open">Öppet</div><div class="card-arrow">›</div>'
    : '<div class="card-badge ' + (d.typ === 'prov' ? 'prov' : 'soon') + '">'
        + (d.typ === 'prov' ? 'Prov' : 'Kommer senare') + '</div>';
  var namn = d.utbud ? noderFor(tax, d.utbud) : [];
  var rad = namn.length ? '<div class="card-noder">' + namn.join(' · ') + '</div>' : '';
  var inner =
      '<div class="card-stripe" style="background:' + stripe + ';"></div>'
    + '<div class="card-body">'
      + '<div class="card-num">Del ' + d.nr + '</div>'
      + '<div class="card-main">'
        + '<div class="card-title">' + (d.titel || '') + '</div>'
        + '<div class="card-desc">' + (d.sub || d.desc || '') + '</div>'
        + rad
      + '</div>'
      + badge
    + '</div>';

  var el;
  if(d.fil){
    el = document.createElement('a'); el.className = 'nav-card'; el.href = d.fil;
  } else {
    // platsen syns, är tonad och går inte att klicka på
    el = document.createElement('div'); el.className = 'nav-card is-soon';
    el.setAttribute('aria-disabled', 'true');
  }
  if(arFordjupning) el.className += ' is-fordjupning';
  el.innerHTML = inner;
  return el;
}

function montera(cfg){
  cfg = cfg || {};
  var grid = document.getElementById(cfg.mount || 'delkapitel-grid');
  if(!grid) return;
  var tax = (typeof cfg.taxonomi === 'function') ? cfg.taxonomi() : cfg.taxonomi;
  (cfg.delkapitel || []).forEach(function(d){ grid.appendChild(kort(d, tax)); });
}

window.KapitelLista = { montera: montera, noderFor: noderFor };
})();
