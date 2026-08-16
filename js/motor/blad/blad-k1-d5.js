/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k1-d5-tiopotenser.html
   Byte-identiskt utbrutet (hela scriptet, logik orörd). Egen generation. */
// ---- FLIKVÄXLING ----
var tabRow = document.getElementById('tab-row');
tabRow.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    var id = btn.dataset.tab;
    tabRow.querySelectorAll('.tab-btn').forEach(function(b){
      b.classList.toggle('is-active', b === btn);
    });
    document.querySelectorAll('.tab-panel').forEach(function(p){
      p.classList.toggle('is-active', p.dataset.panel === id);
    });
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

// ---- FÖRELÄSNINGAR ----
// id = YouTube-videons id. Tumnagel hämtas automatiskt från YouTube.
var FORELASNINGAR = [
  {id:'EDaUvrAVXy4', titel:'Multiplikation med 10, 100 och 1000', tag:'Föreläsning'}
];

var lectureList = document.getElementById('lecture-list');
var player = document.getElementById('lecture-player');
var frame = document.getElementById('lecture-frame');
var ytLink = document.getElementById('lecture-yt-link');
var aktivKort = null;

FORELASNINGAR.forEach(function(f){
  var card = document.createElement('div');
  card.className = 'lecture-card';
  card.innerHTML =
      '<div class="lecture-thumb">'
        + '<div class="lecture-play"><span>▶</span></div>'
      + '</div>'
    + '<div class="lecture-meta">'
      + '<div class="lecture-title">' + f.titel + '</div>'
      + '<div class="lecture-tag">' + f.tag + '</div>'
    + '</div>'
    + '<div class="lecture-state" data-state>Spela film</div>';
  card.addEventListener('click', function(){
    if(aktivKort === card){
      // klick på samma kort igen -> stäng
      stopPlayer();
      return;
    }
    if(aktivKort){
      aktivKort.classList.remove('is-playing');
      aktivKort.querySelector('[data-state]').textContent = 'Spela film';
    }
    aktivKort = card;
    card.classList.add('is-playing');
    card.querySelector('[data-state]').textContent = 'Spelas nu';
    // origin/widget_referrer hjälper YouTube känna igen domänen och
    // undvika "fel 153". location.origin är tomt vid file://-visning –
    // då hoppar vi över parametern så inbäddningen inte bryts.
    var origin = (location.origin && location.origin.indexOf('http') === 0)
      ? '&origin=' + encodeURIComponent(location.origin)
        + '&widget_referrer=' + encodeURIComponent(location.origin)
      : '';
    frame.innerHTML = '<iframe src="https://www.youtube.com/embed/' + f.id
      + '?rel=0&playsinline=1&enablejsapi=1' + origin + '" title="' + f.titel
      + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    ytLink.href = 'https://youtu.be/' + f.id;
    player.classList.add('is-open');
    // flytta spelaren direkt under det klickade kortet
    card.insertAdjacentElement('afterend', player);
    player.scrollIntoView({behavior:'smooth', block:'center'});
  });
  lectureList.appendChild(card);
});

function stopPlayer(){
  if(aktivKort){
    aktivKort.classList.remove('is-playing');
    aktivKort.querySelector('[data-state]').textContent = 'Spela film';
    aktivKort = null;
  }
  player.classList.remove('is-open');
  frame.innerHTML = '';
}

// ============================================================
// ÖVNINGSMOTOR  – samma motor för alla fyra övningsblad
// ============================================================
//
// Varje övning beskrivs som ett "blad" med en lista av "rader".
// En rad är antingen:
//   - {typ:'enkel',  vansterText:'10 · 5 =',  svar:50}
//   - {typ:'lucka',  delar:['__ · 4,5 = 10'], luckPos:0, svar:???}
//                    (text med en lucka markerad som '__')
//   - {typ:'mellan', vansterText:'60 · 0,3 =', mellan:'6·3', svar:18}
//                    (eleven skriver först mellanled, sedan svar)
//
// 'exempel' (valfritt) visas som förinifyllt exempel ovanför rad-listan.
//
// Rad-lista grupperas av {grupp:'Beräkna', rader:[...]}.

function jamforTal(a, b){
  // tillåt komma eller punkt, ignorera mellanslag
  if(a == null) return false;
  var s = String(a).replace(/\s/g,'').replace(',', '.');
  if(s === '') return false;
  var n = parseFloat(s);
  if(isNaN(n)) return false;
  return Math.abs(n - b) < 1e-9;
}
function jamforMellan(a, b){
  // mellanled får skrivas med eller utan likhetstecken, mellanslag, ·/x/*
  if(a == null) return false;
  var s = String(a).toLowerCase()
    .replace(/[x×*]/g, '·')
    .replace(/[\s=]/g, '')
    .replace(',', '.');
  var bnorm = String(b).toLowerCase()
    .replace(/[x×*]/g, '·')
    .replace(/[\s=]/g, '')
    .replace(',', '.');
  return s === bnorm;
}
function jamforEnhet(a, b){
  // Enhet rättas flexibelt: utan mellanslag, gemener,
  // och med vanliga skrivvarianter (kr/sek osv. accepteras).
  if(a == null) return false;
  var alias = {
    'sek':'s', 'sekund':'s', 'sekunder':'s',
    'kr':'kr', 'kronor':'kr',
    'meter':'m', 'metrar':'m',
    'kilometer':'km',
    'centimeter':'cm'
  };
  function norm(x){
    var t = String(x).toLowerCase().replace(/\./g,'').replace(/\s/g,'');
    // ta bort eventuell punkt (m. -> m)
    return t;
  }
  var na = norm(a), nb = norm(b);
  if(na === nb) return true;
  // alias åt båda håll
  if(alias[na] === nb) return true;
  if(alias[nb] === na) return true;
  return false;
}

// ============================================================
// KONFETTI – när eleven får alla rätt
// ============================================================
function visaKonfetti(){
  // Plocka bort eventuell gammal konfetti
  var gammal = document.querySelector('.konfetti-lager');
  if(gammal) gammal.remove();
  var lager = document.createElement('div');
  lager.className = 'konfetti-lager';
  document.body.appendChild(lager);
  var färger = ['#16a34a','#dc2626','#f59e0b','#3b82f6','#a855f7','#ec4899','#06b6d4'];
  var antal = 80;
  for(var i = 0; i < antal; i++){
    var b = document.createElement('span');
    b.className = 'konfetti';
    b.style.left = (Math.random() * 100) + 'vw';
    b.style.background = färger[Math.floor(Math.random() * färger.length)];
    var duration = 2.5 + Math.random() * 2; // 2,5–4,5 sek
    var delay = Math.random() * 0.8;        // upp till 0,8 sek försening
    b.style.animationDuration = duration + 's';
    b.style.animationDelay = delay + 's';
    b.style.width = (6 + Math.random() * 8) + 'px';
    b.style.height = (10 + Math.random() * 8) + 'px';
    lager.appendChild(b);
  }
  // Städa upp efter att allt fallit klart
  setTimeout(function(){ if(lager.parentNode) lager.remove(); }, 6000);
}

function bladHTML(blad){
  var html = '<div class="ovn-sheet">'
    + '<h2>' + blad.titel + '</h2>'
    + (blad.intro ? '<p class="ovn-intro">' + blad.intro + '</p>' : '');

  if(blad.exempel){
    html += '<div class="ovn-exempel">' + blad.exempel + '</div>';
  }

  var radNummer = 0;
  blad.grupper.forEach(function(grupp, gi){
    html += '<div class="ovn-grupp">';
    html += '<div class="ovn-grupp-rubrik">' + (gi+1) + '. ' + grupp.rubrik + '</div>';
    grupp.rader.forEach(function(rad){
      radNummer++;
      var bokstav = String.fromCharCode(96 + ((radNummer - 1) % 26) + 1); // a, b, c...
      if(rad.typ === 'problem'){
        // Problem har egen layout: fråga + kladdruta + svar/enhet
        html += '<div class="prob-rad" data-rad="' + radNummer + '">';
        html += '<div class="prob-fraga">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span>' + rad.fraga + '</span>';
        html += '</div>';
        html += '<div class="prob-kladd-rubrik">Min uträkning</div>';
        html += '<textarea class="prob-kladd" rows="3" '
          + 'placeholder="Skriv din uträkning här (för din egen del — rättas inte)"></textarea>';
        html += '<div class="prob-svar-rad">';
        html += '<span class="prob-label">Svar:</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar + '" '
          + 'inputmode="decimal" autocomplete="off" placeholder="tal">';
        html += '<input class="ovn-in enhet" data-enhet="' + rad.enhet + '" '
          + 'inputmode="text" autocomplete="off" placeholder="enhet">';
        html += '</div>';
        html += '</div>';
        return;
      }
      // räkna om bokstav per grupp
      html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
      html += '<span class="ovn-label">' + bokstav + ')</span>';
      if(rad.typ === 'enkel'){
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      } else if(rad.typ === 'lucka'){
        // text innehåller '__' där luckan ska sitta
        var bitar = rad.text.split('__');
        html += '<span class="ovn-text ovn-num">' + bitar[0] + '</span>';
        html += '<input class="ovn-in lucka" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
        if(bitar[1] !== undefined) html += '<span class="ovn-text ovn-num">' + bitar[1] + '</span>';
      } else if(rad.typ === 'mellan'){
        // [Vänster]  = [mellanled-input]  = [svar-input]
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in bred" data-mellan="' + rad.mellan
          + '" inputmode="text" autocomplete="off" placeholder="mellanled">';
        html += '<span class="ovn-text">=</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      }
      html += '</div>';
    });
    html += '</div>';
    radNummer = 0; // bokstäver räknas om per grupp
  });

  // räkna om labels per grupp
  html += '</div>';

  // Knappsats – samma stil som öva-delen
  html += '<div class="ovn-wrap" style="padding-top:0;">';
  html += '<div class="ovn-keypad" data-keypad>';
  // Sifferblock 7-8-9 / 4-5-6 / 1-2-3 / 0(span2) backsteg
  html += '<div class="ovn-keypad-digits">';
  ['7','8','9','4','5','6','1','2','3'].forEach(function(d){
    html += '<button type="button" class="ovn-kp-key" data-key="' + d + '">' + d + '</button>';
  });
  html += '<button type="button" class="ovn-kp-key span2" data-key="0">0</button>';
  html += '<button type="button" class="ovn-kp-key util" data-key="back">\u232B</button>';
  html += '</div>';
  // Operator-kolumn: , · =
  html += '<div class="ovn-keypad-ops">';
  [',','·','='].forEach(function(o){
    html += '<button type="button" class="ovn-kp-key op" data-key="' + o + '">' + o + '</button>';
  });
  html += '</div>';
  html += '</div>';

  html += '<div class="ovn-kontroll-rad">'
    + '<button type="button" class="ovn-kontroll" data-action="kontroll">Kontrollera</button>'
    + '<button type="button" class="ovn-aterstall" data-action="reset">Återställ</button>'
    + (blad.kanGenerera ? '<button type="button" class="ovn-aterstall" data-action="nytt-blad">↻ Nytt blad med andra tal</button>' : '')
  + '</div>';

  html += '<div class="ovn-sammanf" data-sammanf style="display:none;"></div>';

  html += '<div class="ovn-skriv-ut"><button type="button" data-action="print">↗ Skriv ut bladet</button></div>';
  html += '</div>';
  return html;
}

function bygg_blad(rotEl, blad){
  rotEl.innerHTML = bladHTML(blad);

  // Räkna om radbokstäver så att varje grupp börjar om från 'a'
  rotEl.querySelectorAll('.ovn-grupp').forEach(function(g){
    var bok = 96;
    g.querySelectorAll('.ovn-label').forEach(function(lbl){
      bok++;
      lbl.textContent = String.fromCharCode(bok) + ')';
    });
  });

  var inputs = Array.from(rotEl.querySelectorAll('.ovn-in'));
  var fokus = 0;

  // Tab/Enter -> nästa input. Ångra rättning så fort man ändrar.
  inputs.forEach(function(inp, i){
    inp.addEventListener('focus', function(){ fokus = i; });
    inp.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === 'Tab' && !e.shiftKey){
        if(e.key === 'Enter'){
          e.preventDefault();
          if(i + 1 < inputs.length) inputs[i+1].focus();
        }
      }
    });
    inp.addEventListener('input', function(){
      inp.classList.remove('correct','wrong');
      var f = inp.parentElement.querySelector('.ovn-fasit');
      if(f) f.remove();
    });
  });

  // Knappsats
  rotEl.querySelectorAll('.ovn-kp-key').forEach(function(btn){
    btn.addEventListener('mousedown', function(e){
      e.preventDefault();
      var k = btn.dataset.key;
      var aktiv = document.activeElement;
      if(!aktiv || !aktiv.classList || !aktiv.classList.contains('ovn-in')){
        if(inputs.length === 0) return;
        aktiv = inputs[fokus] || inputs[0];
        aktiv.focus();
      }
      if(k === 'back'){
        aktiv.value = aktiv.value.slice(0, -1);
      } else {
        aktiv.value += k;
      }
      aktiv.dispatchEvent(new Event('input', {bubbles:true}));
      aktiv.focus();
    });
  });

  // Kontroll / Återställ / Skriv ut
  var forstaForsoket = true; // 0-1 fel på första försöket -> nytt blad
  rotEl.querySelector('[data-action="kontroll"]').addEventListener('click', function(){
    var ratt = 0, totalt = 0;
    inputs.forEach(function(inp){
      var rad = inp.parentElement;
      // Ta bort eventuella tidigare fasit-spans och markeringar
      rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
      inp.classList.remove('correct','wrong','just-checked');
      var ok;
      if(inp.dataset.mellan){
        ok = jamforMellan(inp.value, inp.dataset.mellan);
      } else if(inp.dataset.enhet){
        ok = jamforEnhet(inp.value, inp.dataset.enhet);
      } else {
        ok = jamforTal(inp.value, parseFloat(inp.dataset.svar));
      }
      totalt++;
      // Bocken/krysset – stor, syns tydligt
      var mark = document.createElement('span');
      mark.className = 'ovn-mark ' + (ok ? 'ok' : 'fel');
      mark.textContent = ok ? '✓' : '✗';
      if(ok){
        inp.classList.add('correct','just-checked');
        ratt++;
        inp.insertAdjacentElement('afterend', mark);
      } else {
        inp.classList.add('wrong','just-checked');
        var facit;
        if(inp.dataset.mellan) facit = inp.dataset.mellan;
        else if(inp.dataset.enhet) facit = inp.dataset.enhet;
        else facit = inp.dataset.svar.replace('.', ',');
        var f = document.createElement('span');
        f.className = 'ovn-fasit';
        f.textContent = 'rätt svar: ' + facit;
        inp.insertAdjacentElement('afterend', mark);
        mark.insertAdjacentElement('afterend', f);
      }
      // Ta bort blink-klassen efter animationen
      setTimeout(function(){ inp.classList.remove('just-checked'); }, 500);
    });
    var sam = rotEl.querySelector('[data-sammanf]');
    sam.style.display = 'block';
    sam.classList.remove('ok','delvis');
    if(ratt === totalt){
      sam.classList.add('ok');
      sam.innerHTML = '<div class="ovn-sammanf-icon">✓</div>'
        + '<span class="ovn-sammanf-titel">Allt rätt!</span>'
        + ratt + ' av ' + totalt + ' &mdash; jättebra jobbat!';
      // Konfetti regnar
      visaKonfetti();
    } else {
      sam.classList.add('delvis');
      sam.textContent = 'Du fick ' + ratt + ' av ' + totalt + ' rätt. Titta på de rödmarkerade rutorna.';
    }
    sam.scrollIntoView({behavior:'smooth', block:'center'});

    // Automatiskt nytt blad om eleven klarade 0-1 fel på FÖRSTA försöket
    // (slarvfel räcker inte för att låsa upp samma blad – men 2+ fel betyder
    //  att hen bör få rätta och försöka igen utan att bladet byts).
    var fel = totalt - ratt;
    if(forstaForsoket && fel <= 1 && blad.kanGenerera && blad.genId){
      // Visa en mjuk meddelandetext och byt blad efter en kort paus
      setTimeout(function(){
        var sam2 = rotEl.querySelector('[data-sammanf]');
        if(sam2){
          var info = document.createElement('div');
          info.style.cssText = 'margin-top:14px;font-size:14px;font-weight:normal;color:#15803d;';
          info.textContent = 'Nytt blad med andra tal kommer …';
          sam2.appendChild(info);
        }
      }, 1600);
      setTimeout(function(){
        // markera att vi börjat en ny "session" på bladet, så nytt blad genereras
        byggSheet(rotEl.id.replace('sheet-',''), 'A', false);
      }, 3200);
    }
    forstaForsoket = false;
  });

  rotEl.querySelector('[data-action="reset"]').addEventListener('click', function(){
    inputs.forEach(function(inp){
      inp.value = '';
      inp.classList.remove('correct','wrong','just-checked');
    });
    rotEl.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
    var sam = rotEl.querySelector('[data-sammanf]');
    sam.style.display = 'none';
    sam.textContent = '';
    forstaForsoket = true;
    if(inputs[0]) inputs[0].focus();
  });

  var nyttBtn = rotEl.querySelector('[data-action="nytt-blad"]');
  if(nyttBtn){
    nyttBtn.addEventListener('click', function(){
      byggSheet(rotEl.id.replace('sheet-',''), 'B', false);
    });
  }

  rotEl.querySelector('[data-action="print"]').addEventListener('click', function(){
    window.print();
  });

  if(inputs[0]) inputs[0].focus();
}

// ============================================================
// UPPGIFTSDATA – stencilerna från Joachim
// ============================================================

// ============================================================
// HJÄLPARE FÖR GENERERING
// ============================================================
function gRand(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
function gPick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function gShuffle(arr){
  var a = arr.slice();
  for(var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
// Visa tal med svenskt format: komma, mellanslag som tusentalsavgränsare för stora.
function gNum(n){
  var r = Math.round(n * 1e6) / 1e6;
  var s = String(r).replace('.', ',');
  // tusentalsavgränsare för heltalsdelen om >= 10 000 och inga decimaler
  if(Math.abs(r) >= 10000 && s.indexOf(',') === -1){
    var neg = s.charAt(0) === '−' || s.charAt(0) === '-';
    var bas = neg ? s.slice(1) : s;
    bas = bas.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); // ej-brytande mellanslag
    s = (neg ? '−' : '') + bas;
  }
  return s;
}

// ============================================================
// MÖNSTER (typer av uppgifter)
// ============================================================
// Varje mönster är en funktion som returnerar en eller flera rader.
// Returnerar {typ, vansterText, svar} eller {typ:'lucka', text, svar} osv.

// Tiopotenser: tiopotens · decimaltal (variant A: behåll typ; B: blanda fritt)
function monsterTio_TpotMultDec(){
  // 10 · 5,75 / 100 · 4,32 / 1000 · 4,123
  var pot = gPick([10, 100, 1000]);
  // antal decimaler beror på pot
  var dec = pot === 10 ? gRand(1,2) : (pot === 100 ? gRand(1,2) : gRand(1,3));
  var heltal = gRand(2, 9);
  var decimaldel = gRand(1, Math.pow(10, dec) - 1);
  var t = parseFloat(heltal + '.' + String(decimaldel).padStart(dec, '0'));
  // slumpa ordningen: tiopotens först eller sist
  if(Math.random() < 0.5){
    return {typ:'enkel', vansterText: gNum(pot) + ' · ' + gNum(t) + ' =', svar: pot * t};
  } else {
    return {typ:'enkel', vansterText: gNum(t) + ' · ' + gNum(pot) + ' =', svar: pot * t};
  }
}
function monsterTio_HeltalMul(){
  // 10 · 6 / 100 · 7
  var pot = gPick([10, 100, 1000]);
  var n = gRand(2, 9);
  if(Math.random() < 0.5){
    return {typ:'enkel', vansterText: gNum(pot) + ' · ' + gNum(n) + ' =', svar: pot * n};
  } else {
    return {typ:'enkel', vansterText: gNum(n) + ' · ' + gNum(pot) + ' =', svar: pot * n};
  }
}
function monsterTio_Lucka(){
  // __ · 4,5 = 45  /  543 = __ · 54,3  /  23,5 · __ = 2350
  var pot = gPick([10, 100, 1000]);
  var heltal = gRand(2, 9);
  var dec = pot === 10 ? gRand(1,2) : gRand(2,3);
  var decimaldel = gRand(1, Math.pow(10, dec) - 1);
  var t = parseFloat(heltal + '.' + String(decimaldel).padStart(dec, '0'));
  var produkt = Math.round(pot * t * 1e6) / 1e6;
  var form = gPick(['a','b','c','d']);
  if(form === 'a') return {typ:'lucka', text: '__ · ' + gNum(t) + ' = ' + gNum(produkt), svar: pot};
  if(form === 'b') return {typ:'lucka', text: gNum(t) + ' · __ = ' + gNum(produkt), svar: pot};
  if(form === 'c') return {typ:'lucka', text: gNum(produkt) + ' = __ · ' + gNum(t), svar: pot};
  return            {typ:'lucka', text: gNum(produkt) + ' = ' + gNum(pot) + ' · __', svar: t};
}

// Stora tal
function monsterStora_HelaHundratusen(){
  // 800 · 6 / 23 · 2000 / 700 · 800 / 220 · 5000
  var typer = [
    function(){ var a = gRand(2,9) * 100; var b = gRand(2,9); return [a, b]; },
    function(){ var a = gRand(11,99); var b = gRand(2,9) * 1000; return [a, b]; },
    function(){ var a = gRand(2,9) * 100; var b = gRand(2,9) * 100; return [a, b]; },
    function(){ var a = gRand(11,29) * 10; var b = gRand(2,9) * 1000; return [a, b]; }
  ];
  var p = gPick(typer)();
  if(Math.random() < 0.5) p = [p[1], p[0]];
  return {typ:'enkel', vansterText: gNum(p[0]) + ' · ' + gNum(p[1]) + ' =', svar: p[0] * p[1]};
}
function monsterStora_BlandStora(){
  // 6000 · 900 / 4,5 · 20 000 / 3000 · 7,2
  var typer = [
    function(){ return [gRand(2,9) * 1000, gRand(2,9) * 100]; },
    function(){ var d = parseFloat((gRand(15,95)/10).toFixed(1)); return [d, gRand(2,9) * 10000]; },
    function(){ var d = parseFloat((gRand(15,95)/10).toFixed(1)); return [gRand(2,9) * 1000, d]; }
  ];
  var p = gPick(typer)();
  if(Math.random() < 0.5) p = [p[1], p[0]];
  return {typ:'enkel', vansterText: gNum(p[0]) + ' · ' + gNum(p[1]) + ' =', svar: p[0] * p[1]};
}
function monsterStora_Lucka(){
  // 200 · __ = 60 000  /  __ · 5000 = 150 000  /  4 000 000 = 800 · __
  var a = gPick([2,3,4,5,6,8,9]) * 100;
  var b = gRand(2,9) * 100;
  var produkt = a * b;
  var form = gPick(['a','b','c']);
  if(form === 'a') return {typ:'lucka', text: gNum(a) + ' · __ = ' + gNum(produkt), svar: b};
  if(form === 'b') return {typ:'lucka', text: '__ · ' + gNum(b) + ' = ' + gNum(produkt), svar: a};
  return            {typ:'lucka', text: gNum(produkt) + ' = ' + gNum(a) + ' · __', svar: b};
}

// Små tal
function monsterSma_TiondelHelt(){
  // 0,5 · 12 / 0,1 · 24 / 0,5 · 36 / 0,1 · 72 / 0,5 · 17
  var d = gPick([0.1, 0.2, 0.5]);
  var heltal = gRand(12, 99);
  if(Math.random() < 0.5){
    return {typ:'enkel', vansterText: gNum(d) + ' · ' + gNum(heltal) + ' =', svar: d * heltal};
  }
  return {typ:'enkel', vansterText: gNum(heltal) + ' · ' + gNum(d) + ' =', svar: d * heltal};
}
function monsterSma_DecimalDecimal(){
  // 0,2 · 0,7 / 0,3 · 0,4 / 0,4 · 0,02 / 6 · 0,007
  var typer = [
    function(){ var a = gRand(2,9)/10, b = gRand(2,9)/10; return [a, b]; },
    function(){ var a = gRand(2,9)/10, b = gRand(2,9)/100; return [a, b]; },
    function(){ var a = gRand(2,9), b = gRand(2,9)/1000; return [a, b]; }
  ];
  var p = gPick(typer)();
  // avrunda för att undvika flyttalsfel
  p[0] = Math.round(p[0]*1000)/1000;
  p[1] = Math.round(p[1]*1000)/1000;
  if(Math.random() < 0.5) p = [p[1], p[0]];
  var svar = Math.round(p[0] * p[1] * 1e6) / 1e6;
  return {typ:'enkel', vansterText: gNum(p[0]) + ' · ' + gNum(p[1]) + ' =', svar: svar};
}
function monsterSma_TreFaktorer(){
  // 0,3 · 2 · 0,6 / 7 · 0,4 · 0,2 / 0,3 · 0,5 · 0,4
  var heltal = gRand(2,9);
  var d1 = gRand(2,9)/10, d2 = gRand(2,9)/10;
  d1 = Math.round(d1*100)/100; d2 = Math.round(d2*100)/100;
  var p = gShuffle([gNum(heltal), gNum(d1), gNum(d2)]);
  var svar = Math.round(heltal * d1 * d2 * 1e6) / 1e6;
  return {typ:'enkel', vansterText: p.join(' · ') + ' =', svar: svar};
}

// ============================================================
// GENERATORER PER BLAD (variant A = lugn, B = bred)
// ============================================================
function generera_BLAD_TIOPOTENSER(variant){
  var g1, g2, g3;
  if(variant === 'B'){
    // bred: blanda mönster fritt
    var alla = [monsterTio_HeltalMul, monsterTio_TpotMultDec];
    g1 = []; for(var i=0;i<4;i++) g1.push(gPick(alla)());
    g2 = []; for(var j=0;j<3;j++) g2.push(gPick(alla)());
  } else {
    // lugn: behåll struktur från originalbladet
    g1 = [monsterTio_HeltalMul(), monsterTio_TpotMultDec(),
          monsterTio_TpotMultDec(), monsterTio_TpotMultDec()];
    g2 = [monsterTio_TpotMultDec(), monsterTio_TpotMultDec(),
          monsterTio_TpotMultDec()];
  }
  g3 = []; for(var k=0;k<4;k++) g3.push(monsterTio_Lucka());
  return {
    titel:'Multiplikation med 10, 100 och 1000',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader: g1},
      {rubrik:'Beräkna', rader: g2},
      {rubrik:'Beräkna – vilket tal saknas?', rader: g3}
    ]
  };
}
function generera_BLAD_STORA(variant){
  var g1, g2, g3;
  if(variant === 'B'){
    var alla = [monsterStora_HelaHundratusen, monsterStora_BlandStora];
    g1 = []; for(var i=0;i<4;i++) g1.push(gPick(alla)());
    g2 = []; for(var j=0;j<3;j++) g2.push(gPick(alla)());
  } else {
    g1 = []; for(var i=0;i<4;i++) g1.push(monsterStora_HelaHundratusen());
    g2 = []; for(var j=0;j<3;j++) g2.push(monsterStora_BlandStora());
  }
  g3 = []; for(var k=0;k<3;k++) g3.push(monsterStora_Lucka());
  return {
    titel:'Multiplikation med stora tal',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader: g1},
      {rubrik:'Beräkna', rader: g2},
      {rubrik:'Beräkna – vilket tal saknas?', rader: g3}
    ]
  };
}
function generera_BLAD_SMA(variant){
  var g1, g2, g3;
  if(variant === 'B'){
    var alla = [monsterSma_TiondelHelt, monsterSma_DecimalDecimal, monsterSma_TreFaktorer];
    g1 = []; for(var i=0;i<5;i++) g1.push(gPick(alla)());
    g2 = []; for(var j=0;j<4;j++) g2.push(gPick(alla)());
  } else {
    g1 = []; for(var i=0;i<5;i++) g1.push(monsterSma_TiondelHelt());
    g2 = []; for(var j=0;j<4;j++) g2.push(monsterSma_DecimalDecimal());
  }
  g3 = []; for(var k=0;k<3;k++) g3.push(monsterSma_TreFaktorer());
  return {
    titel:'Multiplikation med små tal',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader: g1},
      {rubrik:'Beräkna', rader: g2},
      {rubrik:'Beräkna', rader: g3}
    ]
  };
}

// ============================================================
// Mellanleds-blad (Stora och små tal)
// ============================================================
function monsterStorasma_Mellan(){
  // typ: tal i tiopotens · decimal med 1 värde-siffra
  // ex: 60 · 0,3 = 6 · 3 = 18 ; 7000 · 0,3 = 7 · 3 = 2100
  var basA = gRand(2, 9);
  var nollor = gPick([1, 2, 3, 4]); // 10, 100, 1000, 10000
  var stort = basA * Math.pow(10, nollor);
  var basB = gRand(2, 9);
  var decNollor = gPick([1, 2, 3]); // 0,X / 0,0X / 0,00X
  var litet = basB * Math.pow(10, -decNollor);
  litet = Math.round(litet * 1e6) / 1e6;
  var mellan = basA + '·' + basB; // mellanled utan komma
  var svar = Math.round(stort * litet * 1e6) / 1e6;
  // slumpa ordningen — stort först eller decimaltal först
  if(Math.random() < 0.5){
    return {typ:'mellan', vansterText: gNum(stort) + ' · ' + gNum(litet) + ' =',
            mellan: mellan, svar: svar};
  } else {
    var mellanFlipp = basB + '·' + basA;
    return {typ:'mellan', vansterText: gNum(litet) + ' · ' + gNum(stort) + ' =',
            mellan: mellanFlipp, svar: svar};
  }
}
function generera_BLAD_STORASMA(variant){
  // variant A och B blir nu samma – samma mönster i båda gruppen
  var g1 = []; for(var i=0;i<4;i++) g1.push(monsterStorasma_Mellan());
  var g2 = []; for(var j=0;j<3;j++) g2.push(monsterStorasma_Mellan());
  return {
    titel:'Multiplikation med stora och små tal',
    intro:'Skriv först ett mellanled (utan kommatecken) och sedan svaret. Exemplet visar hur det ser ut.',
    exempel:'<strong>Exempel:</strong> 60 · 0,3 = 6 · 3 = 18.  '
      + 'Knepet: flytta kommat ur 0,3 så det blir 3, och kompensera genom att flytta ett nolla i 60. Räkna sedan 6 · 3 = 18.',
    grupper:[
      {rubrik:'Beräkna med mellanled', rader: g1},
      {rubrik:'Beräkna med mellanled', rader: g2}
    ]
  };
}

// ============================================================
// "GRUNDBLADET" – det första bladet Joachim skapat
// ============================================================
// Eleven ser detta vid första besöket. Vid återbesök bytas det mot
// en slumpad variant A. Knappen "Nytt blad" ger variant B.
var GRUND_BLAD_TIOPOTENSER = {
  titel:'Multiplikation med 10, 100 och 1000',
  intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'10 · 5 =',     svar:50},
      {typ:'enkel', vansterText:'10 · 6,75 =',  svar:67.5},
      {typ:'enkel', vansterText:'100 · 4,5 =',  svar:450},
      {typ:'enkel', vansterText:'100 · 7,75 =', svar:775}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'4,05 · 1000 =',  svar:4050},
      {typ:'enkel', vansterText:'5,75 · 10 =',    svar:57.5},
      {typ:'enkel', vansterText:'1000 · 45,123 =', svar:45123}
    ]},
    {rubrik:'Beräkna – vilket tal saknas?', rader:[
      {typ:'lucka', text:'__ · 4,5 = 45',        svar:10},
      {typ:'lucka', text:'23,5 · __ = 2350',     svar:100},
      {typ:'lucka', text:'543 = __ · 54,3',      svar:10},
      {typ:'lucka', text:'1023 = 100 · __',      svar:10.23}
    ]}
  ]
};

var GRUND_BLAD_STORA = {
  titel:'Multiplikation med stora tal',
  intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'800 · 6 =',     svar:4800},
      {typ:'enkel', vansterText:'23 · 2000 =',   svar:46000},
      {typ:'enkel', vansterText:'700 · 800 =',   svar:560000},
      {typ:'enkel', vansterText:'220 · 5000 =',  svar:1100000}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'6000 · 900 =',    svar:5400000},
      {typ:'enkel', vansterText:'4,5 · 20 000 =',  svar:90000},
      {typ:'enkel', vansterText:'3000 · 7,2 =',    svar:21600}
    ]},
    {rubrik:'Beräkna – vilket tal saknas?', rader:[
      {typ:'lucka', text:'200 · __ = 60 000',       svar:300},
      {typ:'lucka', text:'__ · 5000 = 150 000',     svar:30},
      {typ:'lucka', text:'4 000 000 = 800 · __',    svar:5000}
    ]}
  ]
};

var GRUND_BLAD_SMA = {
  titel:'Multiplikation med små tal',
  intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'0,5 · 12 =',  svar:6},
      {typ:'enkel', vansterText:'0,1 · 24 =',  svar:2.4},
      {typ:'enkel', vansterText:'0,5 · 36 =',  svar:18},
      {typ:'enkel', vansterText:'0,1 · 72 =',  svar:7.2},
      {typ:'enkel', vansterText:'0,5 · 17 =',  svar:8.5}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'0,2 · 0,7 =',   svar:0.14},
      {typ:'enkel', vansterText:'0,3 · 0,4 =',   svar:0.12},
      {typ:'enkel', vansterText:'0,4 · 0,02 =',  svar:0.008},
      {typ:'enkel', vansterText:'6 · 0,007 =',   svar:0.042}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'0,3 · 2 · 0,6 =',  svar:0.36},
      {typ:'enkel', vansterText:'7 · 0,4 · 0,2 =',  svar:0.56},
      {typ:'enkel', vansterText:'0,3 · 0,5 · 0,4 =', svar:0.06}
    ]}
  ]
};

var GRUND_BLAD_STORASMA = {
  titel:'Multiplikation med stora och små tal',
  intro:'Skriv först ett mellanled (utan kommatecken) och sedan svaret. Exemplet visar hur det ser ut.',
  exempel:'<strong>Exempel:</strong> 60 · 0,3 = 6 · 3 = 18.  '
    + 'Knepet: flytta kommat ur 0,3 så det blir 3, och kompensera genom att flytta ett nolla i 60. Räkna sedan 6 · 3 = 18.',
  grupper:[
    {rubrik:'Beräkna med mellanled', rader:[
      {typ:'mellan', vansterText:'60 · 0,3 =',    mellan:'6·3',     svar:18},
      {typ:'mellan', vansterText:'300 · 0,02 =',  mellan:'3·2',     svar:6},
      {typ:'mellan', vansterText:'500 · 0,07 =',  mellan:'5·7',     svar:35},
      {typ:'mellan', vansterText:'7000 · 0,3 =',  mellan:'7·3',     svar:2100}
    ]},
    {rubrik:'Beräkna med mellanled', rader:[
      {typ:'mellan', vansterText:'11 000 · 0,07 =',    mellan:'11·7',  svar:770},
      {typ:'mellan', vansterText:'9 000 000 · 0,006 =', mellan:'9·6',  svar:54000},
      {typ:'mellan', vansterText:'17 000 · 0,02 =',    mellan:'17·2',  svar:340}
    ]}
  ]
};

var GRUND_BLAD_PROBLEM = {
  titel:'Problemuppgifter',
  intro:'Läs uppgiften, skriv din uträkning i rutan, och fyll sedan i svaret med rätt enhet. När du är klar, tryck på Kontrollera.',
  grupper:[
    {rubrik:'Lös problemet', rader:[
      {typ:'problem',
       fraga:'Hur många sekunder är 200 minuter? <em>Svara i sekunder (s).</em>',
       svar:12000, enhet:'s'},
      {typ:'problem',
       fraga:'Ett kilo potatis kostar 15,95 kr. På en skola gör man av med 30 kg potatis under en vecka. '
         + 'Hur mycket betalar man för potatisen under 10 veckor? <em>Svara i kronor (kr).</em>',
       svar:4785, enhet:'kr'},
      {typ:'problem',
       fraga:'Ett rockband har gjort en hit. Deras låt har spelats 800 miljoner gånger. '
         + 'Bandet tjänar 0,06 kr per gång som låten spelats. '
         + 'Hur mycket pengar tjänar bandet på låten? <em>Svara i kronor (kr).</em>',
       svar:48000000, enhet:'kr'},
      {typ:'problem',
       fraga:'Per gillar att springa. Han springer med en steglängd på 129 cm. '
         + 'Han springer ett löppass med 8000 steg. Hur långt springer han? '
         + '<em>Svara i meter (m).</em>',
       svar:10320, enhet:'m'}
    ]}
  ]
};

// ============================================================
// ORKESTRERING – vilket blad ska visas?
// ============================================================
// Vid första besöket per blad (= sessionen): grundbladet.
// Vid alla besök därefter: slumpat blad (variant A "lugn").
// Knappen "Nytt blad" tvingar fram variant B "bred".
//
// "Besök" sparas i sessionStorage så att det är NY öppning av sidan
// (ny flik / efter stängning), oavsett tid. Inom samma session
// stannar bladet kvar även om eleven växlar flik.


// ===== DIVISION MED 10,100,1000 (flyttat från delkapitel 7) =====
function monsterDivTio_HelaPoten(){
  // 40/10, 750/100, 83/100 -> heltal / tiopotens
  var pot = gPick([10, 100, 1000]);
  // Välj täljare så att resultatet blir antingen heltal eller decimaltal med
  // 1-3 decimaler – aldrig orimligt
  var taljare;
  if(pot === 10) taljare = gRand(20, 99) + (Math.random() < 0.4 ? 0 : gRand(1,9)/10);
  else if(pot === 100) taljare = gRand(50, 990);
  else taljare = gRand(60, 9900);
  taljare = Math.round(taljare * 10) / 10;
  return {typ:'enkel', vansterText: gNum(taljare) + ' / ' + gNum(pot) + ' =',
          svar: Math.round((taljare/pot) * 1e6) / 1e6};
}
function monsterDivTio_DecimalPoten(){
  // 0,5/10, 5,5/100, 703,8/1000, 67/1000
  var pot = gPick([10, 100, 1000]);
  // täljare är decimaltal
  var heltal = gRand(0, 999);
  var dec = gRand(1, 99);
  var taljare = parseFloat(heltal + '.' + (dec < 10 ? '0'+dec : dec));
  taljare = Math.round(taljare * 100) / 100;
  return {typ:'enkel', vansterText: gNum(taljare) + ' / ' + gNum(pot) + ' =',
          svar: Math.round((taljare/pot) * 1e6) / 1e6};
}
function monsterDivTio_Lucka(){
  // 450/__ = 45  /  __ /10 = 55  /  25/__ = 0,25  /  ___ /100 = 2,5
  // Form: täljare/pot = svar – välj vilken som saknas
  var pot = gPick([10, 100, 1000]);
  var svar = gRand(2, 99);
  if(Math.random() < 0.4) svar = svar / 10; // decimalsvar ibland
  svar = Math.round(svar * 100) / 100;
  var taljare = Math.round(svar * pot * 100) / 100;
  var form = gPick(['taljare','namnare']);
  if(form === 'taljare'){
    // täljaren saknas
    return {typ:'lucka', text: '__ / ' + gNum(pot) + ' = ' + gNum(svar), svar: taljare};
  } else {
    // nämnaren saknas
    return {typ:'lucka', text: gNum(taljare) + ' / __ = ' + gNum(svar), svar: pot};
  }
}
function generera_BLAD_DIV10(variant){
  var g1, g2, g3;
  if(variant === 'B'){
    var alla = [monsterDivTio_HelaPoten, monsterDivTio_DecimalPoten];
    g1 = []; for(var i=0;i<4;i++) g1.push(gPick(alla)());
    g2 = []; for(var j=0;j<4;j++) g2.push(gPick(alla)());
  } else {
    g1 = [monsterDivTio_HelaPoten(), monsterDivTio_HelaPoten(),
          monsterDivTio_HelaPoten(), monsterDivTio_HelaPoten()];
    g2 = [monsterDivTio_DecimalPoten(), monsterDivTio_DecimalPoten(),
          monsterDivTio_DecimalPoten(), monsterDivTio_DecimalPoten()];
  }
  g3 = []; for(var k=0;k<4;k++) g3.push(monsterDivTio_Lucka());
  return {
    titel:'Division med 10, 100 och 1000',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader: g1},
      {rubrik:'Beräkna', rader: g2},
      {rubrik:'Beräkna – vilket tal saknas?', rader: g3}
    ]
  };
}
var GRUND_BLAD_DIV10 = {
  titel:'Division med 10, 100 och 1000',
  intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'40 / 10 =',  svar:4},
      {typ:'enkel', vansterText:'45 / 10 =',  svar:4.5},
      {typ:'enkel', vansterText:'750 / 100 =', svar:7.5},
      {typ:'enkel', vansterText:'83 / 100 =',  svar:0.83}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'0,5 / 10 =',     svar:0.05},
      {typ:'enkel', vansterText:'5,5 / 100 =',    svar:0.055},
      {typ:'enkel', vansterText:'703,8 / 1000 =', svar:0.7038},
      {typ:'enkel', vansterText:'67 / 1000 =',    svar:0.067}
    ]},
    {rubrik:'Beräkna – vilket tal saknas?', rader:[
      {typ:'lucka', text:'450 / __ = 45',    svar:10},
      {typ:'lucka', text:'550 / __ = 55',    svar:10},
      {typ:'lucka', text:'25 / __ = 0,25',   svar:100},
      {typ:'lucka', text:'250 / __ = 2,5',   svar:100}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'brak', taljare:'2,7 · 10', namnare:'1000', svar:0.027},
      {typ:'brak', taljare:'0,607 · 100', namnare:'10', svar:6.07},
      {typ:'brakLucka', taljare:'706 · __', namnare:'100 000', luckaPos:'taljare', hoger:'0,0706', svar:10},
      {typ:'brakLucka', taljare:'78 · 100', namnare:'__', luckaPos:'namnare', hoger:'7,8', svar:1000}
    ]}
  ]
};

// ===== TEST – blandat mult och div med 10, 100, 1000 =====
var GRUND_BLAD_TEST = {
  titel:'Test',
  intro:'Visa vad du kan. Här blandas multiplikation och division med 10, 100 och 1000.',
  grupper:[
    {rubrik:'Multiplikation', rader:[
      {typ:'enkel', vansterText:'100 · 4,5 =',  svar:450},
      {typ:'enkel', vansterText:'7,2 · 1000 =', svar:7200},
      {typ:'enkel', vansterText:'10 · 6,38 =',  svar:63.8},
      {typ:'enkel', vansterText:'0,25 · 100 =', svar:25}
    ]},
    {rubrik:'Division', rader:[
      {typ:'enkel', vansterText:'450 / 10 =',   svar:45},
      {typ:'enkel', vansterText:'6,7 / 100 =',  svar:0.067},
      {typ:'enkel', vansterText:'1200 / 1000 =',svar:1.2},
      {typ:'enkel', vansterText:'83 / 100 =',   svar:0.83}
    ]},
    {rubrik:'Vilket tal saknas?', rader:[
      {typ:'lucka', text:'__ · 3,4 = 340',  svar:100},
      {typ:'lucka', text:'56 / __ = 0,56',  svar:100},
      {typ:'lucka', text:'8,1 · __ = 8100', svar:1000},
      {typ:'lucka', text:'250 / __ = 25',   svar:10}
    ]}
  ]
};


var GENERATORER = {
  mult10: { gen: generera_BLAD_TIOPOTENSER, grund: GRUND_BLAD_TIOPOTENSER },
  div10:  { gen: generera_BLAD_DIV10,       grund: GRUND_BLAD_DIV10 }
};

function harBesokt(sheetId){
  try{ return sessionStorage.getItem('besokt_' + sheetId) === '1'; }
  catch(e){ return false; }
}
function markeraBesokt(sheetId){
  try{ sessionStorage.setItem('besokt_' + sheetId, '1'); } catch(e){}
}

function byggSheet(sheetId, variant, kanVaraGrundblad){
  var rotEl = document.getElementById('sheet-' + sheetId);
  if(!rotEl) return;
  var def = GENERATORER[sheetId];
  var blad;
  if(def){
    if(kanVaraGrundblad && !harBesokt(sheetId)){
      // Första besöket: visa Joachims original
      blad = Object.assign({}, def.grund, {kanGenerera:true, genId:sheetId});
      markeraBesokt(sheetId);
    } else {
      // Återbesök eller manuellt "Nytt blad"
      blad = def.gen(variant || 'A');
      blad.kanGenerera = true;
      blad.genId = sheetId;
    }
  } else {
    // Problembladet – inget genererat ännu, kör grundet rakt av
    blad = GRUND_BLAD_PROBLEM;
  }
  bygg_blad(rotEl, blad);
}

byggSheet('mult10', 'A', true);
byggSheet('div10',  'A', true);
bygg_blad(document.getElementById('sheet-test'), GRUND_BLAD_TEST);