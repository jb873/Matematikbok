/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k1-d2-fyraraknesatt.html
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
  {id:'rG9H3F7CqH4', titel:'Addition – uppställning',               tag:'Föreläsning'},
  {id:'qsf2Cw-IGKk', titel:'Addition – talsorterna var för sig',     tag:'Föreläsning'},
  {id:'u7ERXjYMzKM', titel:'Addition – flytta över',                 tag:'Föreläsning'},
  {id:'miO9qToMH1c', titel:'Subtraktion – uppställning',             tag:'Föreläsning'},
  {id:'yw2V8DiskeA', titel:'Subtraktion – öka och minska lika',      tag:'Föreläsning'},
  {id:'DaK1pfgXxvo', titel:'Subtraktion – addition bakifrån',        tag:'Föreläsning'},
  {id:'SMIh6rSfEN0', titel:'Multiplikation – uppställning',          tag:'Föreläsning'},
  {id:'m0UE9P8Dd6o', titel:'Multiplikation – talsorterna var för sig',tag:'Föreläsning'},
  {id:'HxK0qilpKqw', titel:'Division – kort division',               tag:'Föreläsning'}
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
      } else if(rad.typ === 'text'){
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in bred" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off" placeholder="svar">';
      } else if(rad.typ === 'term'){
        // Dela upp ett tal i summa av termer – godtar alla korrekta uppdelningar
        html += '<span class="ovn-text" style="min-width:140px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in bred" data-term="' + rad.summa + '" data-antal="' + (rad.antal||2)
          + '" inputmode="text" autocomplete="off" placeholder="t.ex. 10+8">';
      } else if(rad.typ === 'tvatal'){
        // Två tal i valfri ordning
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in" data-tvatal="' + rad.tal.join(',') + '" data-pos="0" inputmode="decimal" autocomplete="off" style="width:80px;">';
        html += '<span class="ovn-text">och</span>';
        html += '<input class="ovn-in" data-tvatal="' + rad.tal.join(',') + '" data-pos="1" inputmode="decimal" autocomplete="off" style="width:80px;">';
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
      } else if(inp.dataset.term !== undefined){
        // dela upp i termer – godtar alla korrekta summor
        var malSumma = parseFloat(inp.dataset.term);
        var malAntal = parseInt(inp.dataset.antal, 10);
        var termer = String(inp.value).replace(/\u2212/g,'-').replace(/\s/g,'').split('+');
        var summa = 0, giltigt = true;
        if(termer.length !== malAntal) giltigt = false;
        termer.forEach(function(t){
          var v = parseFloat(t.replace(',','.'));
          if(isNaN(v)) giltigt = false; else summa += v;
        });
        ok = giltigt && Math.abs(summa - malSumma) < 1e-9;
      } else if(inp.dataset.tvatal !== undefined){
        // två tal i valfri ordning – båda fälten ska tillsammans matcha
        var malTal = inp.dataset.tvatal.split(',').map(function(x){ return parseFloat(x); });
        var v = parseFloat(String(inp.value).replace(',','.'));
        ok = !isNaN(v) && malTal.some(function(m){ return Math.abs(m-v)<1e-9; });
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
        else if(inp.dataset.term !== undefined) facit = 'summan ska bli ' + inp.dataset.term.replace('.', ',');
        else if(inp.dataset.tvatal !== undefined) facit = inp.dataset.tvatal.split(',').join(' och ');
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
// ADDITION OCH SUBTRAKTION
// ============================================================
var BLAD_ADDSUB = {
  titel:'Addition och subtraktion',
  intro:'Räkna ut talen. Räkna gärna på papper med rätt metod och skriv svaret här. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna', rader:[
      {typ:'text', fraga:'Differensen mellan 30 och 6', svar:24},
      {typ:'text', fraga:'Summan av 30 och 6', svar:36}
    ]},
    {rubrik:'Vilka tal?', rader:[
      {typ:'term', fraga:'Dela upp 18 i två termer', summa:18, antal:2},
      {typ:'tvatal', fraga:'Summan av två tal är 18 och differensen är 10. Vilka är talen?', tal:[14,4]}
    ]},
    {rubrik:'Beräkna med uppställning', rader:[
      {typ:'enkel', vansterText:'419 + 145 =', svar:564},
      {typ:'enkel', vansterText:'3 838 − 1 797 =', svar:2041},
      {typ:'enkel', vansterText:'45,4 + 184,19 =', svar:229.59},
      {typ:'enkel', vansterText:'6,7 − 3,62 =', svar:3.08}
    ]},
    {rubrik:'Beräkna med talsorterna var för sig', rader:[
      {typ:'enkel', vansterText:'245 + 378 =', svar:623},
      {typ:'enkel', vansterText:'568 + 79 =', svar:647},
      {typ:'enkel', vansterText:'14,5 + 3,9 =', svar:18.4}
    ]},
    {rubrik:'Beräkna med metoden flytta över', rader:[
      {typ:'enkel', vansterText:'59 + 35 =', svar:94},
      {typ:'enkel', vansterText:'198 + 467 =', svar:665},
      {typ:'enkel', vansterText:'14,5 + 3,9 =', svar:18.4}
    ]},
    {rubrik:'Beräkna med metoden addition bakifrån', rader:[
      {typ:'enkel', vansterText:'116 − 73 =', svar:43},
      {typ:'enkel', vansterText:'268 − 198 =', svar:70},
      {typ:'enkel', vansterText:'10,6 − 7,3 =', svar:3.3}
    ]},
    {rubrik:'Beräkna med metoden flytta över', rader:[
      {typ:'enkel', vansterText:'7,9 + 12,17 =', svar:20.07},
      {typ:'enkel', vansterText:'16,9 + 29,2 =', svar:46.1},
      {typ:'enkel', vansterText:'398 + 267 =', svar:665}
    ]},
    {rubrik:'Beräkna med metoden öka och minska lika', rader:[
      {typ:'enkel', vansterText:'638 − 396 =', svar:242},
      {typ:'enkel', vansterText:'704 − 488 =', svar:216},
      {typ:'enkel', vansterText:'99,2 − 10,8 =', svar:88.4}
    ]},
    {rubrik:'Vilket tal saknas?', rader:[
      {typ:'lucka', text:'77,3 − __ = 57,7', svar:19.6},
      {typ:'lucka', text:'__ − 66,5 = 57,9', svar:124.4},
      {typ:'lucka', text:'678,3 − __ = 59,7', svar:618.6},
      {typ:'lucka', text:'__ − 706,5 = 157,9', svar:864.4},
      {typ:'lucka', text:'407,8 + __ = 1 659,3', svar:1251.5},
      {typ:'lucka', text:'__ + 302,9 = 1 121,2', svar:818.3}
    ]}
  ]
};

var BLAD_MULT = {
  titel:'Multiplikation',
  intro:'Räkna med angiven metod på papper och skriv svaret. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna med uppställning', rader:[
      {typ:'enkel', vansterText:'321 · 4 =', svar:1284},
      {typ:'enkel', vansterText:'6,24 · 2 =', svar:12.48},
      {typ:'enkel', vansterText:'1,91 · 7 =', svar:13.37},
      {typ:'enkel', vansterText:'0,283 · 3 =', svar:0.849}
    ]},
    {rubrik:'Beräkna med uppställning', rader:[
      {typ:'enkel', vansterText:'67 · 23 =', svar:1541},
      {typ:'enkel', vansterText:'36 · 62 =', svar:2232},
      {typ:'enkel', vansterText:'348 · 52 =', svar:18096},
      {typ:'enkel', vansterText:'582 · 28 =', svar:16296}
    ]},
    {rubrik:'Beräkna med talsorterna var för sig', rader:[
      {typ:'enkel', vansterText:'67 · 5 =', svar:335},
      {typ:'enkel', vansterText:'346 · 4 =', svar:1384},
      {typ:'enkel', vansterText:'872 · 3 =', svar:2616},
      {typ:'enkel', vansterText:'2 842 · 6 =', svar:17052}
    ]},
    {rubrik:'Beräkna med dubbla och halvera', rader:[
      {typ:'mellan', vansterText:'3 · 16 =', mellan:'6·8', svar:48},
      {typ:'mellan', vansterText:'5 · 28 =', mellan:'10·14', svar:140},
      {typ:'mellan', vansterText:'4 · 18 =', mellan:'8·9', svar:72},
      {typ:'mellan', vansterText:'6,8 · 5 =', mellan:'3,4·10', svar:34},
      {typ:'mellan', vansterText:'4,28 · 5 =', mellan:'2,14·10', svar:21.4}
    ]}
  ]
};

var BLAD_DIV = {
  titel:'Division',
  intro:'Beräkna med kort division. Räkna på papper och skriv svaret. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Kort division', rader:[
      {typ:'brak', taljare:'84,6', namnare:'3', svar:28.2},
      {typ:'brak', taljare:'96', namnare:'2', svar:48},
      {typ:'brak', taljare:'8,72', namnare:'4', svar:2.18},
      {typ:'brak', taljare:'935', namnare:'5', svar:187}
    ]},
    {rubrik:'Kort division', rader:[
      {typ:'brak', taljare:'24,5', namnare:'5', svar:4.9},
      {typ:'brak', taljare:'13,2', namnare:'6', svar:2.2},
      {typ:'brak', taljare:'4 096', namnare:'8', svar:512},
      {typ:'brak', taljare:'4,212', namnare:'9', svar:0.468}
    ]},
    {rubrik:'Kort division', rader:[
      {typ:'brak', taljare:'348', namnare:'4', svar:87},
      {typ:'brak', taljare:'348,8', namnare:'8', svar:43.6},
      {typ:'brak', taljare:'1 926', namnare:'5', svar:385.2},
      {typ:'brak', taljare:'152,4', namnare:'8', svar:19.05}
    ]},
    {rubrik:'Beräkna med kort division', rader:[
      {typ:'brak', taljare:'2,7', namnare:'5', svar:0.54},
      {typ:'brak', taljare:'3', namnare:'8', svar:0.375},
      {typ:'brak', taljare:'0,4', namnare:'5', svar:0.08},
      {typ:'brak', taljare:'0,6', namnare:'4', svar:0.15}
    ]},
    {rubrik:'Beräkna med kort division', rader:[
      {typ:'brak', taljare:'775,2', namnare:'4', svar:193.8},
      {typ:'brak', taljare:'1,85', namnare:'4', svar:0.4625},
      {typ:'brak', taljare:'169', namnare:'13', svar:13},
      {typ:'brak', taljare:'4 536', namnare:'14', svar:324}
    ]}
  ]
};

var BLAD_PRIO = {
  titel:'Prioriteringsregeln',
  intro:'Visa mellanled och skriv svaret. Parenteser först, sedan · och /, sist + och −. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna – visa mellanled', rader:[
      {typ:'mellan', vansterText:'2 + 5 · 6 =',          mellan:'2+30',   svar:32},
      {typ:'mellan', vansterText:'(12 + 8) · 4 − 3 =',   mellan:'80-3',   svar:77},
      {typ:'mellan', vansterText:'7 · 3 + 4 · 2 =',      mellan:'21+8',   svar:29},
      {typ:'mellan', vansterText:'27 / 3 − 3 · 2 =',     mellan:'9-6',    svar:3}
    ]},
    {rubrik:'Beräkna – visa mellanled', rader:[
      {typ:'mellan', vansterText:'12 − 2 · 3 + 8 / 2 =', mellan:'12-6+4', svar:10},
      {typ:'mellan', vansterText:'(32 − 8) / (4 + 6) =', mellan:'24/10',  svar:2.4},
      {typ:'mellan', vansterText:'32 − 8 / 4 + 6 =',     mellan:'32-2+6', svar:36},
      {typ:'mellan', vansterText:'(9 − 4) / 2 + 7 =',    mellan:'2,5+7',  svar:9.5}
    ]},
    {rubrik:'Beräkna – visa mellanled', rader:[
      {typ:'mellan', vansterText:'20 + 8,3 · 100 =',      mellan:'20+830',   svar:850},
      {typ:'mellan', vansterText:'100 − 270 / 9 =',       mellan:'100-30',   svar:70},
      {typ:'mellan', vansterText:'5 · 8 + 10 · 2,1 =',   mellan:'40+21',    svar:61},
      {typ:'mellan', vansterText:'4 + 4 · 25 − 5 =',     mellan:'4+100-5',  svar:99}
    ]}
  ]
};

var GRUND_BLAD_TOM = {
  titel:'Byggs snart',
  intro:'Det här avsnittet läggs in när stencilen är klar.',
  grupper:[{rubrik:'Kommer snart', rader:[]}]
};

// ============================================================
// Bygg upp bladen
// ============================================================
bygg_blad(document.getElementById('sheet-addsub'), BLAD_ADDSUB);
bygg_blad(document.getElementById('sheet-mult'),    BLAD_MULT);
bygg_blad(document.getElementById('sheet-div'),     BLAD_DIV);
bygg_blad(document.getElementById('sheet-prio'),    BLAD_PRIO);
bygg_blad(document.getElementById('sheet-problem'), GRUND_BLAD_TOM);

