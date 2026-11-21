/* arbetsyta.js — UPPGIFTSSIDANS SKAL (doc/KONVENTIONER.md "Uppgiftssidan (arbetsytan)"), delat av alla
   uppgiftssidor i det nya formatet. Utbrutet ur ak7/k3/d5-problemlosning-nyformat/uppgift.html (Joachim
   2026-11-21: "bara en flytt" — problemlösningen ser ut och fungerar som förut). Formgivningen: arbetsyta.css.

   Skalet äger det som är lika på varje uppgiftssida: Tillbaka-knappens retur-adress, monteringarna i ytan,
   växeln mellan bladets varianter, Föreläsning-knappen med filmen, och placeringen av knappsatsen och
   knappraden till höger. Sidan äger VAD som ritas (vilken bank, vilket blad, vilken bladkomponent) och
   anropar skalet med det. Markupen (navbar, brödsmula, #nf-tillbaka, #nf-yta, #nf-verktyg, #nf-bladnav,
   #nf-genomgang, #nf-film) står i sidan.

   API:
     Arbetsyta.retur()                         Tillbaka → ?retur= (en relativ adress), annars sidans egen href.
                                               Ger URLSearchParams för sidans val.
     Arbetsyta.montering(yta, id)              en tom montering (.ovn-wrap.nf-mount) sist i ytan.
     Arbetsyta.vaxel({ nav, yta, varianter, rita, start, etikett, vidVisa })
                                               en montering och en flik per variant; visar en i taget, så det
                                               eleven skrivit på A finns kvar efter B. Ger visa(variant).
     Arbetsyta.film({ knapp, yta, video })     Föreläsning: knappen syns bara när en film finns.
     Arbetsyta.placera({ keypad, knapprader }) knappsatsen och knappraderna till höger; mäts om vid ändring.
   Ingen nätväg. */
(function(){
'use strict';

function retur(){
  var q = new URLSearchParams(location.search);
  var r = q.get('retur');
  if(r && !/^[a-z][a-z0-9+.\-]*:|^\/|^\\/i.test(r.replace(/[\u0000- ]/g, ''))) document.getElementById('nf-tillbaka').href = r;
  return q;
}

function montering(yta, id){ var m = document.createElement('div'); m.className = 'ovn-wrap nf-mount'; m.id = id; yta.appendChild(m); return m; }

// VÄXELN: kanonens bladnavigering (.blad-nav-btn), nedtonad i arbetsyta.css. o.rita(m, variant) ritar bladet
// i sin montering; o.vidVisa(variant) låter sidan sätta det som hör till den (NF_BLAD, adressen).
function vaxel(o){
  var mounts = {}, knappar = {};
  var etikett = o.etikett || function(b){ return 'Blad ' + b; };
  o.varianter.forEach(function(b){
    var m = montering(o.yta, o.id(b)); m.setAttribute('data-blad', b);
    o.rita(m, b);
    mounts[b] = m;
    var kn = document.createElement('button'); kn.type = 'button'; kn.className = 'blad-nav-btn'; kn.setAttribute('role', 'tab');
    kn.innerHTML = '<span class="blad-nav-nr">' + b + '</span>' + etikett(b);   // växeln: "Blad A", "Blad B"
    kn.addEventListener('click', function(){ visa(b); });
    o.nav.appendChild(kn); knappar[b] = kn;
  });
  function visa(b){
    Object.keys(mounts).forEach(function(k){
      mounts[k].hidden = (k !== b);
      knappar[k].classList.toggle('is-active', k === b); knappar[k].setAttribute('aria-selected', k === b ? 'true' : 'false');
    });
    if(o.vidVisa) o.vidVisa(b);
  }
  visa(mounts[o.start] ? o.start : o.varianter[0]);
  return visa;
}

// FÖRELÄSNING (knappen hette "Visa genomgång" till 2026-11-22): filmen ur föreläsningsregistret, i
// föreläsningsmodulens egen yta — YouTube laddas först när eleven klickar play (noll nätväg tills dess).
// Utan film förblir knappen dold.
function film(o){
  var F = window.FOREL, gk = o.knapp, yta = o.yta, f = o.video;
  if(!(f && F && F.renderFilmer)) return;
  gk.hidden = false;
  gk.addEventListener('click', function(){
    var oppen = gk.getAttribute('aria-expanded') === 'true';
    if(!oppen && !yta.firstChild) F.renderFilmer(yta, [f]);
    yta.hidden = oppen; gk.setAttribute('aria-expanded', oppen ? 'false' : 'true'); gk.classList.toggle('is-active', !oppen);
  });
}

/* KALKYLATORN TILL HÖGER, KNAPPRADEN UNDER (KONVENTIONER, arbetsytan). Nederst i högerkanten: EN rad med
   bladets egen knapprad (Kontrollera, Börja om) och Tipsa (elevfeedback.js, som står kvar på sin egen plats
   — knappraden ställs till vänster om den, mitt för den i höjd). Knappsatsen står ovanför raden, högerkant mot
   Tipsas högerkant. Bladet lämnar en kolumn fri för båda (--nf-hoger). Allt mäts mot de renderade rutorna
   (knappsatsen behåller sin plats också när en namnruta döljer den). Komponenterna är oförändrade.
   o.keypad = sidans knappsats, o.knapprader = väljaren för bladets knapprader. */
function placera(o){
  var kp = o.keypad, SEL = o.knapprader;
  var LUFT = 10, KANT = 20;
  function placera(){
    var akt = document.querySelectorAll(SEL);
    if(innerWidth <= 640){            // telefon: knappsatsen över hela bredden, knappraden i flödet (CSS:en)
      kp.style.bottom = ''; kp.style.right = ''; Array.prototype.forEach.call(akt, function(a){ a.style.right = ''; a.style.bottom = ''; });
      document.documentElement.style.removeProperty('--nf-hoger'); return;
    }
    var fb = document.querySelector('.feedback-knapp'), fr = fb ? fb.getBoundingClientRect() : null;
    var hoger = fr ? (innerWidth - fr.right) : KANT;                       // radens och knappsatsens högerkant
    var radH = fr ? fr.height : 0, radBotten = fr ? (innerHeight - fr.bottom) : KANT;
    var radTopp = innerHeight - radBotten - radH, radVanster = fr ? fr.left : innerWidth - KANT;
    Array.prototype.forEach.call(akt, function(a){
      var h = a.offsetHeight, w = a.offsetWidth;
      if(!h) return;                                    // bladet som inte visas (växeln): ingen ruta att mäta
      var hgr = fr ? (innerWidth - fr.left + LUFT) : KANT;
      var btn = fr ? Math.round(radBotten + (radH - h) / 2) : KANT;
      a.style.right = Math.round(hgr) + 'px'; a.style.bottom = btn + 'px';
      if(!fr){ radH = h; radTopp = innerHeight - KANT - h; }
      radTopp = Math.min(radTopp, innerHeight - btn - h);
      radVanster = Math.min(radVanster, innerWidth - hgr - w);
    });
    kp.style.right = Math.round(hoger) + 'px';
    kp.style.bottom = Math.round(innerHeight - radTopp + LUFT) + 'px';
    var kr = kp.getBoundingClientRect();
    document.documentElement.style.setProperty('--nf-hoger', Math.round(innerWidth - Math.min(kr.left, radVanster) + 8) + 'px');
  }
  placera(); window.addEventListener('resize', placera);
  if(window.ResizeObserver) new ResizeObserver(placera).observe(kp);
  // nya blad (Börja om, blandade) och växeln mellan varianterna (hidden på monteringen) → mät om
  new MutationObserver(placera).observe(document.getElementById('nf-yta'), { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  // Tipsa-knappen (elevfeedback.js, defer) kommer efter: mät om när den finns.
  window.addEventListener('load', function(){ setTimeout(placera, 0); });
  return placera;
}

window.Arbetsyta = { retur: retur, montering: montering, vaxel: vaxel, film: film, placera: placera };
})();
