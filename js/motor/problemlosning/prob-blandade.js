/* prob-blandade.js — BLANDADE UPPGIFTER (order 2026-11-21): en ÅTERANVÄNDBAR post som serverar FÖRFATTADE
   blandade blad för en nivå. Inte sjuan-specifik: posten parametriseras på nivå + vilka källblad (typer) den
   speglar, och bladen är data. Nivå 2–4:s blandade blad slottas in med en ny konfiguration, utan nytt bygge.

   KONFIGURATIONEN (bor hos banken, t.ex. ProbBankAk7.blandade(1)):
     { id, niva, nr, titel, kallTyper: [typ-id …], antalPerBlad, antalBlad, blad: [{ id, uppgifter: [u …] }],
       vantar }   — vantar = skälet när bladen inte finns ännu (posten står då tonad, utan länk)
   Uppgifterna är bankens form (ProbModell: delar/relationer/villkor, facit per ruta). Inget blandas, inget
   genereras här — bladen är författade och visas i författad ordning.

   SERVERINGEN: ett blad i taget. Ett blad är GJORT när eleven har kontrollerat det eller gått vidare med
   "Nästa blad". Vid återkomst visas första ej gjorda bladet (ingen repris). När alla är gjorda stannar posten
   med en avslutningsrad. Kön sparas per post i webbläsarens lagring (try/catch: utan lagring börjar kön om).

   RITNINGEN är bladkomponentens egen (anroparen skickar rita, t.ex. ProbBlad2.render — samma som testet:
   femstegsformen, Följa instruktion i ekvationsformen per uppgift). Knappsats och rättare är sidans. */
(function(){
'use strict';

// ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
var TEXT = {
  nasta: { titel: 'Nästa blad' },
  klar:  { titel: 'Du har gjort alla blad med blandade uppgifter.' }
};
var NYCKEL = 'prob-blandade:v1:';

function bokstav(i){ return String.fromCharCode(65 + i); }

// Bladen i bladkomponentens form: { id, titel, nod, uppgifter }. Rubriken följer Arbetssidans bladnamn:
// postens nummer + bokstav per blad ("Blad 6A · Blandade uppgifter").
function bladen(cfg){
  return (cfg && cfg.blad || []).map(function(b, i){
    return { id: cfg.id + '-' + b.id, titel: 'Blad ' + cfg.nr + bokstav(i) + ' · ' + cfg.titel, nod: null, uppgifter: b.uppgifter };
  });
}
function harBlad(cfg){ return bladen(cfg).length > 0; }

// FORMEN: antal blad, antal uppgifter per blad, minst en uppgift ur varje källtyp, bara källtyper, unika id.
// Returnerar en lista med fel (tom = bladen håller formen).
function granska(cfg){
  var fel = [], b = bladen(cfg), ids = {};
  if(!b.length){ if(!cfg || !cfg.vantar) fel.push('inga blad och inget skäl (vantar)'); return fel; }
  if(cfg.antalBlad && b.length !== cfg.antalBlad) fel.push('ska ha ' + cfg.antalBlad + ' blad, har ' + b.length);
  b.forEach(function(x){
    if(ids[x.id]) fel.push(x.id + ': id finns två gånger'); ids[x.id] = 1;
    var u = x.uppgifter || [];
    if(cfg.antalPerBlad && u.length !== cfg.antalPerBlad) fel.push(x.id + ': ska ha ' + cfg.antalPerBlad + ' uppgifter, har ' + u.length);
    (cfg.kallTyper || []).forEach(function(t){
      if(!u.some(function(y){ return y && y.typ === t; })) fel.push(x.id + ': saknar en uppgift ur ' + t);
    });
    u.forEach(function(y, i){ if(!y || (cfg.kallTyper || []).indexOf(y.typ) < 0) fel.push(x.id + ' uppgift ' + (i + 1) + ': inte ur en källtyp'); });
  });
  return fel;
}

// ── KÖN ──
function lagring(opt){
  if(opt && opt.lagring) return opt.lagring;
  try { return window.localStorage; } catch(e){ return null; }
}
function lasGjorda(cfg, opt){
  try { var s = lagring(opt); var v = s && JSON.parse(s.getItem(NYCKEL + cfg.id) || '[]'); return Array.isArray(v) ? v : []; }
  catch(e){ return []; }
}
function markeraGjort(cfg, bladId, opt){
  var g = lasGjorda(cfg, opt); if(g.indexOf(bladId) >= 0) return g;
  g.push(bladId);
  try { var s = lagring(opt); if(s) s.setItem(NYCKEL + cfg.id, JSON.stringify(g)); } catch(e){}
  return g;
}
// Index för första ej gjorda bladet; -1 = alla gjorda.
function aktuellt(cfg, gjorda){
  var b = bladen(cfg);
  for(var i = 0; i < b.length; i++) if(gjorda.indexOf(b[i].id) < 0) return i;
  return -1;
}

// ── MONTERINGEN ──
// yta: där bladet ritas · opt: { rita(mount, blad), knappYta (där "Nästa blad" står), lagring }
// Returnerar { visa(i), index(), blad } — eller null när posten inte har några blad.
function montera(yta, cfg, opt){
  opt = opt || {};
  var b = bladen(cfg); if(!b.length || !yta || typeof opt.rita !== 'function') return null;
  var mount = document.createElement('div'); mount.className = 'ovn-wrap nf-mount pb-blandade'; yta.appendChild(mount);
  var kn = document.createElement('button'); kn.type = 'button'; kn.className = 'blad-nav-btn pb-nasta';
  kn.textContent = TEXT.nasta.titel;
  (opt.knappYta || yta).appendChild(kn);
  var nu = -1;

  function avslut(){
    mount.innerHTML = '';
    var kort = document.createElement('div'); kort.className = 'prob-kort'; kort.setAttribute('data-blandade-klar', '');
    var rub = document.createElement('div'); rub.className = 'niva-rubrik'; rub.textContent = cfg.titel;
    var rad = document.createElement('div'); rad.className = 'ovn-sammanf'; rad.textContent = TEXT.klar.titel;
    kort.appendChild(rub); kort.appendChild(rad); mount.appendChild(kort);
    kn.hidden = true; nu = -1;
  }
  function visa(i){
    if(i < 0 || i >= b.length){ avslut(); return; }
    nu = i; kn.hidden = false;
    opt.rita(mount, b[i]);
    mount.setAttribute('data-blad', b[i].id);
  }
  // Kontrollera på bladet = bladet är gjort (eleven stannar kvar på det tills hon väljer Nästa blad).
  mount.addEventListener('click', function(e){
    var t = e.target && e.target.closest && e.target.closest('[data-action="kontroll"]');
    if(t && nu >= 0) markeraGjort(cfg, b[nu].id, opt);
  });
  kn.addEventListener('click', function(){
    if(nu < 0) return;
    var g = markeraGjort(cfg, b[nu].id, opt);
    visa(aktuellt(cfg, g));
  });
  visa(aktuellt(cfg, lasGjorda(cfg, opt)));
  return { visa: visa, index: function(){ return nu; }, blad: b, knapp: kn, mount: mount };
}

var API = { TEXT: TEXT, bladen: bladen, harBlad: harBlad, granska: granska, aktuellt: aktuellt,
            lasGjorda: lasGjorda, markeraGjort: markeraGjort, montera: montera };
if(typeof window !== 'undefined') window.ProbBlandade = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
