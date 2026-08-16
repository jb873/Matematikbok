/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k1-d7-division.html
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
  {id:'_Vp4ALmm7AM', titel:'Division med stora tal', tag:'Föreläsning'},
  {id:'Tj8Z3GAw20k', titel:'Division med små tal',   tag:'Föreläsning'}
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

if(FORELASNINGAR.length === 0){
  lectureList.innerHTML = '<div class="placeholder-note" style="padding:24px;">'
    + '<span class="pn-icon">📽️</span>'
    + '<span>Föreläsningar för division läggs in här när länkarna är klara.</span>'
  + '</div>';
}

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
    'kr':'kr', 'kronor':'kr', 'krona':'kr',
    'meter':'m', 'metrar':'m',
    'kilometer':'km',
    'centimeter':'cm',
    'pase':'påsar', 'påse':'påsar', 'pasar':'påsar', 'påsarna':'påsar',
    'flaska':'flaskor', 'flaskorna':'flaskor'
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
      if(rad.typ === 'problemTid'){
        // Problem med tidssvar: timmar + minuter i två fält
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
        html += '<input class="ovn-in" data-svar="' + rad.timmar + '" '
          + 'inputmode="numeric" autocomplete="off" style="width:70px;">';
        html += '<span class="ovn-text" style="margin:0 2px;">h</span>';
        html += '<input class="ovn-in" data-svar="' + rad.minuter + '" '
          + 'inputmode="numeric" autocomplete="off" style="width:70px;">';
        html += '<span class="ovn-text" style="margin:0 2px;">min</span>';
        html += '</div>';
        html += '</div>';
        return;
      }
      if(rad.typ === 'problem'){
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
      // Bråk-uppgifter: täljare/nämnare visas som riktigt bråk
      if(rad.typ === 'brak' || rad.typ === 'brakLucka'){
        html += '<div class="ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        // Bråk-blocket
        html += '<span class="ovn-brak">';
        if(rad.typ === 'brakLucka' && rad.luckaPos === 'taljare'){
          // täljaren innehåller en lucka, t.ex. "706 · __"
          var tBitar = rad.taljare.split('__');
          html += '<span class="ovn-brak-taljare">' + tBitar[0]
            + '<input class="ovn-in lucka" data-svar="' + rad.svar
            + '" inputmode="decimal" autocomplete="off" style="width:64px;height:34px;font-size:17px;">'
            + (tBitar[1] !== undefined ? tBitar[1] : '') + '</span>';
          html += '<span class="ovn-brak-strecket"></span>';
          html += '<span class="ovn-brak-namnare">' + rad.namnare + '</span>';
        } else if(rad.typ === 'brakLucka' && rad.luckaPos === 'namnare'){
          html += '<span class="ovn-brak-taljare">' + rad.taljare + '</span>';
          html += '<span class="ovn-brak-strecket"></span>';
          var nBitar = rad.namnare.split('__');
          html += '<span class="ovn-brak-namnare">' + nBitar[0]
            + '<input class="ovn-in lucka" data-svar="' + rad.svar
            + '" inputmode="decimal" autocomplete="off" style="width:64px;height:34px;font-size:17px;">'
            + (nBitar[1] !== undefined ? nBitar[1] : '') + '</span>';
        } else {
          html += '<span class="ovn-brak-taljare">' + rad.taljare + '</span>';
          html += '<span class="ovn-brak-strecket"></span>';
          html += '<span class="ovn-brak-namnare">' + rad.namnare + '</span>';
        }
        html += '</span>';
        html += '<span class="ovn-text">=</span>';
        if(rad.typ === 'brakLucka'){
          // facit står efter likhetstecknet (eleven löser luckan i bråket)
          html += '<span class="ovn-text ovn-num">' + rad.hoger + '</span>';
        } else {
          html += '<input class="ovn-in" data-svar="' + rad.svar
            + '" inputmode="decimal" autocomplete="off">';
        }
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
  // Operator-kolumn: , / · =
  html += '<div class="ovn-keypad-ops">';
  [',','/','·','='].forEach(function(o){
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
      var rad = inp.closest('.ovn-rad, .ovn-brak-rad, .prob-rad') || inp.parentElement;
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
function gNum(n){
  var r = Math.round(n * 1e6) / 1e6;
  var s = String(r).replace('.', ',');
  if(Math.abs(r) >= 10000 && s.indexOf(',') === -1){
    var neg = s.charAt(0) === '−' || s.charAt(0) === '-';
    var bas = neg ? s.slice(1) : s;
    bas = bas.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    s = (neg ? '−' : '') + bas;
  }
  return s;
}

// ============================================================
// MÖNSTER för division
// ============================================================
// Division skrivs som "a / b" i radens vansterText. Vi använder "/" som
// divisionstecken i texten – elev läser det som "delat på".

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

// Små tal: heltal / decimaltal
function monsterDivSma_HeltalTiondel(){
  // 12/0,1, 7/0,5, 19,76/0,1, 34/0,5, 43/0,01
  var d = gPick([0.1, 0.5, 0.01, 0.25]);
  var taljare;
  if(d === 0.5) taljare = gRand(2, 99);                       // hela tal
  else if(d === 0.25) taljare = gPick([1,2,3,4,5,6,7,8,9,10]); // heltal som funkar fint
  else if(d === 0.1) taljare = gRand(2, 199);
  else taljare = gRand(2, 99); // 0,01
  return {typ:'enkel', vansterText: gNum(taljare) + ' / ' + gNum(d) + ' =',
          svar: Math.round((taljare/d) * 1e6) / 1e6};
}
function monsterDivSma_DecHel(){
  // 6/0,2, 4/0,25, 9/0,2, 7/0,25, 3/0,02
  var d = gPick([0.2, 0.25, 0.02]);
  var taljare = gRand(2, 49);
  return {typ:'enkel', vansterText: gNum(taljare) + ' / ' + gNum(d) + ' =',
          svar: Math.round((taljare/d) * 1e6) / 1e6};
}

// Stora tal: stora heltal / hundratal eller tusental
function monsterDivStora_HelaHundra(){
  // 90 000/300, 600 000/200, 120 000 000/40 000
  var typer = [
    function(){ return [gRand(2,9)*10000, gRand(2,9)*100]; },     // 90000/300
    function(){ return [gRand(2,9)*100000, gRand(2,9)*100]; },    // 600000/200
    function(){ return [gRand(12,90)*10000000, gRand(2,9)*10000]; } // 120 000 000/40 000
  ];
  var p = gPick(typer)();
  // Säkerställ att resultatet är ett "snällt" tal (heltal)
  // försök igen om kvoten inte är heltal
  for(var k=0; k<5 && p[0] % p[1] !== 0; k++){
    p = gPick(typer)();
  }
  if(p[0] % p[1] !== 0){
    // sista utvägen: justera täljaren
    p[0] = Math.floor(p[0]/p[1]) * p[1];
  }
  return {typ:'enkel', vansterText: gNum(p[0]) + ' / ' + gNum(p[1]) + ' =',
          svar: Math.round((p[0]/p[1]) * 1e6) / 1e6};
}
function monsterDivStora_Bland(){
  // 750 000/300, 72 000/900, 33 000 000/11 000, 1 208 000/200
  var basVal = gPick([100, 200, 300, 500, 900, 1000, 11000]);
  var kvot = gRand(40, 990);
  var taljare = basVal * kvot;
  return {typ:'enkel', vansterText: gNum(taljare) + ' / ' + gNum(basVal) + ' =', svar: kvot};
}

// ============================================================
// GENERATORER PER BLAD
// ============================================================
function generera_BLAD_TIOPOTENSER(variant){
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

function generera_BLAD_SMA(variant){
  var g1, g2;
  if(variant === 'B'){
    var alla = [monsterDivSma_HeltalTiondel, monsterDivSma_DecHel];
    g1 = []; for(var i=0;i<5;i++) g1.push(gPick(alla)());
    g2 = []; for(var j=0;j<5;j++) g2.push(gPick(alla)());
  } else {
    g1 = []; for(var i=0;i<5;i++) g1.push(monsterDivSma_HeltalTiondel());
    g2 = []; for(var j=0;j<5;j++) g2.push(monsterDivSma_DecHel());
  }
  return {
    titel:'Division med små tal',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader: g1},
      {rubrik:'Beräkna', rader: g2}
    ]
  };
}

function generera_BLAD_STORA(variant){
  var g1, g2;
  if(variant === 'B'){
    var alla = [monsterDivStora_HelaHundra, monsterDivStora_Bland];
    g1 = []; for(var i=0;i<3;i++) g1.push(gPick(alla)());
    g2 = []; for(var j=0;j<4;j++) g2.push(gPick(alla)());
  } else {
    g1 = []; for(var i=0;i<3;i++) g1.push(monsterDivStora_HelaHundra());
    g2 = []; for(var j=0;j<4;j++) g2.push(monsterDivStora_Bland());
  }
  return {
    titel:'Division med stora tal',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader: g1},
      {rubrik:'Beräkna', rader: g2}
    ]
  };
}

// ============================================================
// GRUNDBLAD – Joachims original
// ============================================================
var GRUND_BLAD_TIOPOTENSER = {
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

var GRUND_BLAD_SMA = {
  titel:'Division med små tal',
  intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'12 / 0,1 =',    svar:120},
      {typ:'enkel', vansterText:'7 / 0,5 =',     svar:14},
      {typ:'enkel', vansterText:'19,76 / 0,1 =', svar:197.6},
      {typ:'enkel', vansterText:'34 / 0,5 =',    svar:68},
      {typ:'enkel', vansterText:'43 / 0,01 =',   svar:4300}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'6 / 0,2 =',  svar:30},
      {typ:'enkel', vansterText:'4 / 0,25 =', svar:16},
      {typ:'enkel', vansterText:'9 / 0,2 =',  svar:45},
      {typ:'enkel', vansterText:'7 / 0,25 =', svar:28},
      {typ:'enkel', vansterText:'3 / 0,02 =', svar:150}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'7 / 0,2 =',    svar:35},
      {typ:'enkel', vansterText:'7,6 / 0,1 =',  svar:76},
      {typ:'enkel', vansterText:'0,6 / 0,1 =',  svar:6},
      {typ:'enkel', vansterText:'0,08 / 0,001 =', svar:80}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'1,5 / 50 =',        svar:0.03},
      {typ:'brak', taljare:'0,8 · 0,4', namnare:'0,2', svar:1.6},
      {typ:'brak', taljare:'0,8 · 0,3', namnare:'0,1', svar:2.4}
    ]}
  ]
};

var GRUND_BLAD_STORA = {
  titel:'Division med stora tal',
  intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'90 000 / 300 =',        svar:300},
      {typ:'enkel', vansterText:'600 000 / 200 =',       svar:3000},
      {typ:'enkel', vansterText:'120 000 000 / 40 000 =', svar:3000}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'enkel', vansterText:'750 000 / 300 =',         svar:2500},
      {typ:'enkel', vansterText:'72 000 / 900 =',          svar:80},
      {typ:'enkel', vansterText:'33 000 000 / 11 000 =',   svar:3000},
      {typ:'enkel', vansterText:'1 208 000 / 200 =',       svar:6040}
    ]},
    {rubrik:'Beräkna', rader:[
      {typ:'brak', taljare:'0,5 · 8', namnare:'0,25', svar:16},
      {typ:'brak', taljare:'300 · 100', namnare:'0,5', svar:60000},
      {typ:'brak', taljare:'90 000 · 0,05', namnare:'45', svar:100},
      {typ:'brak', taljare:'30 · 1000', namnare:'20', svar:1500}
    ]}
  ]
};

// Småtal med förlängning och Lästal är ännu inte byggda
var GRUND_BLAD_SMAFORL = {
  titel:'Division med små tal – med förlängning',
  intro:'Skriv mellanled och svar. Exemplet visar metoden – förläng både täljare och nämnare så nämnaren blir 1.',
  exempel:'<strong>Exempel:</strong> 21 / 0,2 = (21 · 5) / (0,2 · 5) = 105 / 1 = 105.  '
    + 'Vi förlänger med ett tal som gör nämnaren till 1.',
  grupper:[
    {rubrik:'Lägg in övningar här när texten är bekräftad', rader:[]}
  ]
};

var GRUND_BLAD_LASTAL = {
  titel:'Lästal – division',
  intro:'Läs uppgiften och visa din beräkning i rutan. Skriv sedan svaret med rätt enhet. När du är klar, tryck på Kontrollera.',
  grupper:[
    {rubrik:'Lös problemet', rader:[
      {typ:'problemTid',
       fraga:'Hur lång tid tar det att fylla en pool på 35 000 liter om den fylls med 100 liter per minut? '
         + '<em>Svara i timmar och minuter.</em>',
       timmar:5, minuter:50},
      {typ:'problem',
       fraga:'Algot har plockat 9 liter lingon. Han vill lägga bären i påsar som rymmer 0,5 liter. '
         + 'Hur många påsar behöver Algot? <em>Svara i antal påsar.</em>',
       svar:18, enhet:'påsar'},
      {typ:'problem',
       fraga:'Josefine ska hälla upp 18 liter saft i flaskor som rymmer 0,3 liter. '
         + 'Hur många flaskor behöver hon? <em>Svara i antal flaskor.</em>',
       svar:60, enhet:'flaskor'},
      {typ:'problem',
       fraga:'Kristoffer fyller år. Han köper 10 chokladbitar för 6,50 kr/st och 100 kolor för 1,50 kr/st. '
         + 'Hur mycket ska han betala? <em>Svara i kronor (kr).</em>',
       svar:215, enhet:'kr'},
      {typ:'problem',
       fraga:'Du cyklar fram och tillbaka till en sjö som ligger 6,4 km från ditt hem. '
         + 'Under en månad besöker du sjön 10 gånger. Hur långt cyklar du totalt? <em>Svara i kilometer (km).</em>',
       svar:128, enhet:'km'},
      {typ:'problem',
       fraga:'Ett kort på gymmet kostar 570 kronor i månaden. Under två månader tränar du 30 gånger. '
         + 'Vad blir kostnaden per träningspass? <em>Svara i kronor (kr).</em>',
       svar:38, enhet:'kr'}
    ]}
  ]
};

// ============================================================
// ORKESTRERING
// ============================================================
var GENERATORER = {
  sma:         { gen: generera_BLAD_SMA,         grund: GRUND_BLAD_SMA },
  stora:       { gen: generera_BLAD_STORA,       grund: GRUND_BLAD_STORA }
};

function harBesokt(sheetId){
  try{ return sessionStorage.getItem('besokt_div_' + sheetId) === '1'; }
  catch(e){ return false; }
}
function markeraBesokt(sheetId){
  try{ sessionStorage.setItem('besokt_div_' + sheetId, '1'); } catch(e){}
}

function byggSheet(sheetId, variant, kanVaraGrundblad){
  var rotEl = document.getElementById('sheet-' + sheetId);
  if(!rotEl) return;
  var def = GENERATORER[sheetId];
  var blad;
  if(def){
    if(kanVaraGrundblad && !harBesokt(sheetId)){
      blad = Object.assign({}, def.grund, {kanGenerera:true, genId:sheetId});
      markeraBesokt(sheetId);
    } else {
      blad = def.gen(variant || 'A');
      blad.kanGenerera = true;
      blad.genId = sheetId;
    }
  } else if(sheetId === 'smaforl'){
    blad = GRUND_BLAD_SMAFORL;
  } else if(sheetId === 'lastal'){
    blad = GRUND_BLAD_LASTAL;
  }
  if(blad) bygg_blad(rotEl, blad);
}

byggSheet('sma',         'A', true);
byggSheet('stora',       'A', true);
bygg_blad(document.getElementById('sheet-smaforl'), GRUND_BLAD_SMAFORL);
bygg_blad(document.getElementById('sheet-lastal'),  GRUND_BLAD_LASTAL);
