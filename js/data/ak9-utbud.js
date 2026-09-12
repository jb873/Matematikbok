/* ak9-utbud.js — DELAD MONTERARE för nians delkapitelsidor: AK9_UTBUD.render(mount, dk).
   ─────────────────────────────────────────────────────────────────────────────────────────────
   Kontrakt, inte kopia (jfr AK8_FARDIGA.renderTestFlik, AK8_FOREL.renderForelFlik): länkarna är DATA i
   js/data/ak9-k1-bok.js (delkapitel[].utbud), sidorna är tomma skal. Förr bar nio sidor var sin inline
   SPAR-array, renderare och CSS — och hade redan börjat driva isär (en sida hade live-länk, sju var gråa).

   TVÅ RADER, samma form (beslut 2026-09-12, "två spår i stället för tre"):
     1  ÅRSKURS 9   — delkapitlets eget material: Föreläsning · Öva · Färdighetsträning · Test
                      (+ ev. Fördjupning, t.ex. "Fördjupning · Algebraiska bråk"). Nians spår först.
     2  REPETITION  — en HÄNVISNING till kunskapsläget i åk 8 och åk 7 (kartan visar var eleven är röd —
                      hon vet sällan vilket delkapitel), Joachims NP-öva-dokument när de finns (np),
                      och ev. direktlänkar som komplement (repetition). Inte tre stora kort.
   Gymnasiespåret finns inte längre (eleverna arbetar i Ma1c/Ma2c). Inget spårsystem → inga spårnamn.

   dk.utbud = {
     nian:        [ {titel, href} | 'titel' ]   sträng = "kommer" (ärligt märkt, grå). titel = elevtext-fält (låset ser det)
     fordjupning: [ {titel, href} ]             valfri; renderas sist på rad 1
     np:          [ {titel, href} ]             valfri; Joachims NP-dokument (Öva/Test) på rad 2
     repetition:  [ {ar, titel, sub?, href} ]   valfri; direktlänkar till annan årskurs, med årskurs-badge
   }
   Saknar rad 1 live-länkar → ärlig byggnotis ovanför. CSS injiceras av modulen (sidan bär ingen).
   Noll nätväg. */
(function(){
  'use strict';

  // ELEVTEXT — som fält (rubrik/intro/titel) så elevtext-låset ser dem; text i funktionsargument fångas inte.
  var TEXT = {
    rad1: { rubrik: 'Årskurs 9' },
    rad2: { rubrik: 'Repetition', intro: 'Behöver du repetera? Kunskapsläget visar var du har luckor – börja där det är rött.' },
    bygg: { rubrik: 'Det här delkapitlet byggs.', intro: 'Innehållet kopplas in när det är författat. Under tiden kan du repetera – se nedan.' },
    oppna: { titel: 'Öppna →' }, kommer: { titel: 'kommer' }
  };
  var KARTA = [
    { ar: 'Åk 8', titel: 'Kunskapsläge åk 8', href: '../../ak8/k1/karta/index.html' },
    { ar: 'Åk 7', titel: 'Kunskapsläge åk 7', href: '../../ak7/k1/kunskapslage/index.html' }
  ];

  var CSS = ''
    + '.utbud{max-width:900px;margin:0 auto;padding:30px 28px 56px;}'
    + '.utbud-grupp{margin-top:30px;}.utbud-grupp:first-of-type{margin-top:8px;}'
    + '.utbud-rubrik{font-family:var(--cinzel);font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);display:flex;align-items:center;gap:12px;margin-bottom:12px;}'
    + '.utbud-rubrik::after{content:"";flex:1;height:1px;background:var(--paper-dk);}'
    + '.utbud-text{font-size:14px;line-height:1.6;color:var(--ink-soft);margin:0 0 12px;max-width:62ch;}'
    + '.val-rad{display:flex;flex-wrap:wrap;gap:10px;}'
    + '.val-chip{display:inline-flex;align-items:center;gap:8px;font-family:var(--serif);font-size:15px;color:var(--ink-soft);background:var(--paper-lt);border:1px solid var(--paper-dk);border-radius:8px;padding:11px 17px;opacity:.62;cursor:default;}'
    + '.val-chip .kommer{font-family:var(--cinzel);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint);background:var(--paper-dk);border-radius:3px;padding:2px 7px;}'
    + 'a.val-chip{opacity:1;cursor:pointer;color:var(--ink);border-left:3px solid var(--gold);text-decoration:none;transition:box-shadow .15s,border-color .15s;}'
    + 'a.val-chip:hover{box-shadow:0 2px 10px rgba(15,30,46,.09);border-color:var(--gold-lt);}'
    + 'a.val-chip .oppna{font-family:var(--cinzel);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);}'
    + 'a.val-chip .val-ar{font-family:var(--cinzel);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:var(--gold);border-radius:3px;padding:2px 7px;}'
    + '.bygg-note{max-width:900px;margin:26px auto 0;padding:0 28px;}'
    + '.bygg-note-inner{display:flex;gap:14px;align-items:flex-start;background:var(--paper-lt);border:1px solid var(--paper-dk);border-left:4px solid var(--gold);border-radius:8px;padding:16px 20px;color:var(--ink-soft);font-size:14px;line-height:1.6;}'
    + '.bygg-note-inner .ikon{font-size:20px;flex-shrink:0;}';
  function injiceraCss(){ if(document.getElementById('ak9-utbud-css')) return; var s = document.createElement('style'); s.id = 'ak9-utbud-css'; s.textContent = CSS; document.head.appendChild(s); }

  function chipLank(label, href, ar){
    var a = document.createElement('a'); a.className = 'val-chip'; a.href = href;
    if(ar){ var b = document.createElement('span'); b.className = 'val-ar'; b.textContent = ar; a.appendChild(b); }
    a.appendChild(document.createTextNode(label));
    var o = document.createElement('span'); o.className = 'oppna'; o.textContent = TEXT.oppna.titel; a.appendChild(o);
    return a;
  }
  function chipKommer(label){
    var c = document.createElement('span'); c.className = 'val-chip';
    c.appendChild(document.createTextNode(label));
    var k = document.createElement('span'); k.className = 'kommer'; k.textContent = TEXT.kommer.titel; c.appendChild(k);
    return c;
  }
  function grupp(rubrik, text){
    var g = document.createElement('div'); g.className = 'utbud-grupp';
    var r = document.createElement('div'); r.className = 'utbud-rubrik'; r.textContent = rubrik; g.appendChild(r);
    if(text){ var p = document.createElement('p'); p.className = 'utbud-text'; p.textContent = text; g.appendChild(p); }
    var rad = document.createElement('div'); rad.className = 'val-rad'; g.appendChild(rad);
    return { el: g, rad: rad };
  }

  function render(mount, dk){
    if(!mount) return;
    injiceraCss();
    var u = (dk && dk.utbud) || {};
    var nian = u.nian || ['Föreläsning', 'Öva', 'Färdighetsträning', 'Test'];
    var harLive = nian.some(function(v){ return v && v.href; });
    mount.innerHTML = '';

    // Ärlig byggnotis när delkapitlets eget material inte finns än (ersätter "de tre spåren"-texten).
    if(!harLive){
      var n = document.createElement('div'); n.className = 'bygg-note';
      n.innerHTML = '<div class="bygg-note-inner"><span class="ikon">🚧</span><div><strong>' + TEXT.bygg.rubrik + '</strong> ' + TEXT.bygg.intro + '</div></div>';
      mount.appendChild(n);
    }

    // 1 · ÅRSKURS 9 — nians eget material först
    var g1 = grupp(TEXT.rad1.rubrik);
    nian.forEach(function(v){ g1.rad.appendChild(v && v.href ? chipLank(v.titel, v.href) : chipKommer(String(v))); });
    (u.fordjupning || []).forEach(function(v){ g1.rad.appendChild(chipLank(v.titel, v.href)); });
    mount.appendChild(g1.el);

    // 2 · REPETITION — hänvisning till kunskapsläget (inte tre stora kort)
    var g2 = grupp(TEXT.rad2.rubrik, TEXT.rad2.intro);
    KARTA.forEach(function(k){ g2.rad.appendChild(chipLank(k.titel, k.href, k.ar)); });
    (u.np || []).forEach(function(v){ g2.rad.appendChild(chipLank(v.titel, v.href)); });
    (u.repetition || []).forEach(function(v){ g2.rad.appendChild(chipLank(v.titel, v.href, v.ar)); });
    mount.appendChild(g2.el);
  }

  window.AK9_UTBUD = { render: render, KARTA: KARTA };
})();
