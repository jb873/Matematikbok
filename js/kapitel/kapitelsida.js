/* kapitelsida.js — KAPITELSIDAN SOM KONTRAKT (window.Kapitelsida), order 2026-09-29.

   Syster till renderTestFlik och föreläsningsregistret: DATA PER KAPITEL IN, SIDA UT. Ett nytt
   kapitel skapas genom att lägga till data — inte genom att kopiera en sida. Det som är en
   funktion ärvs; det som är en kopia ärvs inte.

   FÖRLAGAN är sjuans kapitel 1. Renderaren ritar exakt den sidan: kicker med linjer på båda
   sidor, rubrik i Cormorant med en del i guld kursiv, ingress, "← Alla kapitel", etiketten
   DELKAPITEL, och korten med blå vänsterkant, DEL N, beskrivning, statuschip och pil.

   STATUSEN HÄRLEDS, SÄTTS ALDRIG FÖR HAND. Ett delkapitel med innehåll har en fil och är öppet;
   ett utan fil är "kommer" — synligt, ärligt märkt, oklickbart. Ett fält status: i datan är ett
   brott mot kontraktet, inte ett sätt att styra sidan: renderaren läser det inte.
   (Bakgrunden: åttans elva delkapitel stod som BYGGER fast alla elva var byggda och i bruk, och
   nians sju tomma skelett var klickbara. Ett handsatt fält driver isär från verkligheten.)

   RUBRIKEN bär sin egen markering: 'Positionssystem och {fyra räknesätt}' — klammern blir guld
   kursiv. Formen ligger i texten, inte i två fält som kan komma isär.

   CSS: js/kapitel/navsida.css (delad). Ingen kapitelsidestil får ligga inline.
   Korten ritas av js/kapitel/kapitel-lista.js. Foten av js/fot/kapitel-fot.js.
   Ingen nätväg. */
(function(){
'use strict';

// ELEVTEXT som fält (elevtext-låset ser fältnamnen). Ordagrant sjuans k1 — Joachim sätter
// ordalydelsen, renderaren flyttar bara texten från tio kopior till ett ställe.
var TEXT = {
  hem:        { titel: 'Matematikbok' },
  arskurs:    { titel: 'Årskurs {n}' },
  kapitel:    { titel: 'Kapitel {n}' },
  kort:       { titel: 'Åk {n}' },
  tillbaka:   { titel: '← Alla kapitel' },
  delkapitel: { rubrik: 'Delkapitel' },
  fot:        { titel: 'Digitalt läromedel i matematik' }
};
function txt(mall, n){ return String(mall).replace('{n}', n); }

function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// Rubrikens guld kursiva del markeras med klammer i texten: 'Bråk och {räkna med bråk}'.
function rubrikHTML(titel){
  var ut = '', rest = String(titel || '');
  while(true){
    var i = rest.indexOf('{');
    if(i < 0) break;
    var j = rest.indexOf('}', i);
    if(j < 0) break;
    ut += esc(rest.slice(0, i)) + '<em>' + esc(rest.slice(i + 1, j)) + '</em>';
    rest = rest.slice(j + 1);
  }
  return ut + esc(rest);
}

function montera(cfg){
  cfg = cfg || {};
  var ar = cfg.arskurs, kap = cfg.kapitel;
  var bas = cfg.bas || '';                    // prefix till rotens filer: '' eller '../../'
  var arSida = cfg.arskursSida || (bas + 'ak' + ar + '.html');

  var html =
      '<nav class="topnav">'
    +   '<div class="nav-brand">Matematik<span class="nav-sep">·</span><span>'
    +     esc(txt(TEXT.kort.titel, ar)) + '</span></div>'
    +   '<div class="nav-crumbs">'
    +     '<a href="' + esc(bas + 'index.html') + '">' + esc(TEXT.hem.titel) + '</a>'
    +     '<span class="crumb-sep">›</span>'
    +     '<a href="' + esc(arSida) + '">' + esc(txt(TEXT.arskurs.titel, ar)) + '</a>'
    +     '<span class="crumb-sep">›</span>'
    +     '<span class="crumb-current">' + esc(txt(TEXT.kapitel.titel, kap)) + '</span>'
    +   '</div>'
    + '</nav>'
    + '<header class="hero">'
    +   '<div class="hero-eyebrow">' + esc(txt(TEXT.kapitel.titel, kap)) + ' · '
    +     esc(txt(TEXT.arskurs.titel, ar)) + '</div>'
    +   '<h1 class="hero-title">' + rubrikHTML(cfg.titel) + '</h1>'
    +   '<p class="hero-desc">' + esc(cfg.ingress) + '</p>'
    +   '<a class="hero-back" href="' + esc(arSida) + '">' + esc(TEXT.tillbaka.titel) + '</a>'
    + '</header>'
    + '<div class="section-label">' + esc(TEXT.delkapitel.rubrik) + '</div>'
    + '<main class="card-grid" id="delkapitel-grid"></main>'
    // Monteringspunkten för kapitel-foten ritas bara när kapitlet HAR en fot. En tom div på en
    // sida utan fot är död markup, och död markup blir förr eller senare någons felsökning.
    + (cfg.fot ? '<div id="kapitel-fot"></div>' : '')
    + '<footer><div>' + esc(TEXT.fot.titel) + '</div><span>'
    +   esc(txt(TEXT.kapitel.titel, kap)) + '</span></footer>';

  var vard = document.createElement('div');
  vard.innerHTML = html;
  // Sidans body innehåller bara skript. Renderarens DOM läggs FÖRE dem, så dokumentordningen
  // blir densamma som när markupen stod skriven i sidan.
  var forsta = document.body.querySelector('script');
  while(vard.firstChild) document.body.insertBefore(vard.firstChild, forsta);

  if(window.KapitelLista){
    window.KapitelLista.montera({
      mount: 'delkapitel-grid',
      taxonomi: cfg.taxonomi || null,
      delkapitel: cfg.delkapitel || []
    });
  }
  if(cfg.fot && window.KapitelFot) window.KapitelFot.montera(cfg.fot);
}

window.Kapitelsida = { montera: montera, rubrikHTML: rubrikHTML, TEXT: TEXT };
})();
