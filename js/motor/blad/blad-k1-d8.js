/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k1-d8-avrundning.html
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
  // Föreläsningar läggs in när länkarna är klara.
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
        + '<img src="https://img.youtube.com/vi/' + f.id + '/mqdefault.jpg" alt="" loading="lazy">'
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

var BLAD_TOM = {
  titel:'Byggs snart',
  intro:'Uppgifterna läggs in när stencilen är klar.',
  grupper:[{rubrik:'Kommer snart', rader:[]}]
};

bygg_blad(document.getElementById('sheet-avrundning'), BLAD_TOM);
bygg_blad(document.getElementById('sheet-overslag'),   BLAD_TOM);
bygg_blad(document.getElementById('sheet-problem'),    BLAD_TOM);
bygg_blad(document.getElementById('sheet-test'),       BLAD_TOM);
