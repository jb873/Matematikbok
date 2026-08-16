/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k1-d3-negativa-tal.html
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
  // Lägg in negativa tal-föreläsningarna här när YouTube-länkarna är klara,
  // t.ex. {id:'VIDEO_ID', titel:'Motsatta tal och tallinjen', tag:'Föreläsning'},
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
    + '<span>Föreläsningar om negativa tal läggs in här när länkarna är klara.</span>'
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
  var s = String(a).replace(/\s/g,'').replace(/\u2212/g,'-').replace(',', '.');
  if(s === '') return false;
  var n = parseFloat(s);
  if(isNaN(n)) return false;
  return Math.abs(n - b) < 1e-9;
}
// Visa ett tal med snyggt minustecken (− = U+2212) och decimalkomma
function visaTal(t){
  var s = String(t).replace('.', ',');
  return s.replace(/^-/, '\u2212');
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
      // Storleksordna: visa talmängden, eleven skriver i ordning i rutor
      if(rad.typ === 'ordna'){
        var sorterat = rad.tal.slice().sort(function(a,b){ return rad.fallande ? b-a : a-b; });
        html += '<div class="ovn-rad ovn-ordna-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-ordna-prompt">' + (rad.fraga || (rad.fallande ? 'Störst till minst:' : 'Minst till störst:')) + '</span>';
        html += '<span class="ovn-ordna-set">{ ' + rad.tal.map(function(t){ return visaTal(t); }).join(', ') + ' }</span>';
        html += '<span class="ovn-ordna-svar">';
        sorterat.forEach(function(v, k){
          if(k>0) html += '<span class="ovn-ordna-pil">' + (rad.fallande ? '>' : '<') + '</span>';
          html += '<input class="ovn-in ovn-ordna-in" data-svar="' + v + '" inputmode="text" autocomplete="off">';
        });
        html += '</span>';
        html += '</div>';
        return;
      }
      // Talföljd: vissa termer givna, andra (null) är ifyllnadsrutor
      if(rad.typ === 'talfoljd'){
        html += '<div class="ovn-rad ovn-foljd-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-foljd-led">';
        rad.termer.forEach(function(t, k){
          if(k>0) html += '<span class="ovn-foljd-komma">,</span>';
          if(t === null){
            html += '<input class="ovn-in ovn-foljd-in" data-svar="' + rad.facit[k] + '" inputmode="text" autocomplete="off">';
          } else {
            html += '<span class="ovn-text ovn-num ovn-foljd-tal">' + visaTal(t) + '</span>';
          }
        });
        html += '<span class="ovn-foljd-komma">, …</span>';
        html += '</span>';
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
  [',','/','·','\u2212','='].forEach(function(o){
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
// UPPGIFTSDATA – negativa tal
// ============================================================

// --- 1 · BEGREPP OCH FÖRSTÅELSE ---
var BLAD_BEGREPP = {
  titel:'Begrepp och förståelse',
  intro:'Motsatta tal, att storleksordna och talföljder. Skriv negativa tal med minustecken, t.ex. \u22125. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Skriv det motsatta talet', rader:[
      {typ:'lucka', text:'Motsatta talet till \u22125 \u00e4r __', svar:5},
      {typ:'lucka', text:'Motsatta talet till 8 \u00e4r __', svar:-8},
      {typ:'lucka', text:'Motsatta talet till \u221212 \u00e4r __', svar:12}
    ]},
    {rubrik:'Storleksordna talen från minst till störst', rader:[
      {typ:'ordna', tal:[-3, 5, -8, 1, -1]}
    ]},
    {rubrik:'Skriv de två tal som saknas i talföljden', rader:[
      {typ:'talfoljd', termer:[-8, -6, -4, null, null], facit:[-8,-6,-4,-2,0]},
      {typ:'talfoljd', termer:[5, 2, -1, null, null], facit:[5,2,-1,-4,-7]}
    ]},
    {rubrik:'Storleksordna talen från minst till störst', rader:[
      {typ:'ordna', tal:[2, -4, 0, -7, 3]}
    ]},
    {rubrik:'Skriv de två tal som saknas i talföljden', rader:[
      {typ:'talfoljd', termer:[-10, -7, -4, null, null], facit:[-10,-7,-4,-1,2]},
      {typ:'talfoljd', termer:[9, 5, 1, null, null], facit:[9,5,1,-3,-7]}
    ]}
  ]
};

// --- 2 · RÄKNA MED NEGATIVA TAL (bara + och − mellan termerna) ---
var BLAD_RAKNA1 = {
  titel:'Räkna med negativa tal',
  intro:'Addition och subtraktion med negativa tal. Tänk på tallinjen. Skriv svaret med minustecken om det är negativt.',
  grupper:[
    {rubrik:'Addition', rader:[
      {typ:'enkel', vansterText:'\u22123 + 5 =', svar:2},
      {typ:'enkel', vansterText:'\u22127 + 4 =', svar:-3},
      {typ:'enkel', vansterText:'\u22122 + 9 =', svar:7},
      {typ:'enkel', vansterText:'\u22125 + 5 =', svar:0}
    ]},
    {rubrik:'Subtraktion', rader:[
      {typ:'enkel', vansterText:'3 \u2212 8 =', svar:-5},
      {typ:'enkel', vansterText:'\u22124 \u2212 2 =', svar:-6},
      {typ:'enkel', vansterText:'6 \u2212 9 =', svar:-3},
      {typ:'enkel', vansterText:'\u22121 \u2212 7 =', svar:-8}
    ]},
    {rubrik:'Blandat', rader:[
      {typ:'enkel', vansterText:'\u22125 + 8 =', svar:3},
      {typ:'enkel', vansterText:'2 \u2212 6 =', svar:-4},
      {typ:'enkel', vansterText:'\u22129 + 3 =', svar:-6},
      {typ:'enkel', vansterText:'7 \u2212 10 =', svar:-3}
    ]},
    {rubrik:'Vilket tal saknas?', rader:[
      {typ:'lucka', text:'\u22123 + __ = 2', svar:5},
      {typ:'lucka', text:'__ \u2212 4 = \u22126', svar:-2},
      {typ:'lucka', text:'5 + __ = \u22121', svar:-6}
    ]}
  ]
};

// --- 3 · RÄKNA VIDARE (större tal + subtrahera/addera negativa: −(−), +(−)) ---
var BLAD_RAKNA2 = {
  titel:'Räkna vidare',
  intro:'Samma sak men med större tal, och nu blandas det in att addera och subtrahera negativa tal: + (\u2212) och \u2212 (\u2212). Kom ihåg: att subtrahera ett negativt tal är samma sak som att addera dess positiva värde.',
  grupper:[
    {rubrik:'Addition med negativa tal', rader:[
      {typ:'enkel', vansterText:'\u221212 + (\u22128) =', svar:-20},
      {typ:'enkel', vansterText:'15 + (\u22129) =', svar:6},
      {typ:'enkel', vansterText:'\u221220 + (\u22125) =', svar:-25},
      {typ:'enkel', vansterText:'\u221214 + 30 =', svar:16}
    ]},
    {rubrik:'Subtraktion med negativa tal', rader:[
      {typ:'enkel', vansterText:'8 \u2212 (\u22126) =', svar:14},
      {typ:'enkel', vansterText:'\u221210 \u2212 (\u22124) =', svar:-6},
      {typ:'enkel', vansterText:'12 \u2212 (\u221215) =', svar:27},
      {typ:'enkel', vansterText:'\u221220 \u2212 (\u221225) =', svar:5}
    ]},
    {rubrik:'Blandat med större tal', rader:[
      {typ:'enkel', vansterText:'\u221218 + (\u221214) =', svar:-32},
      {typ:'enkel', vansterText:'25 \u2212 (\u221213) =', svar:38},
      {typ:'enkel', vansterText:'\u221230 \u2212 (\u221212) =', svar:-18},
      {typ:'enkel', vansterText:'\u221216 + 40 =', svar:24}
    ]},
    {rubrik:'Vilket tal saknas?', rader:[
      {typ:'lucka', text:'13 + __ = 5', svar:-8},
      {typ:'lucka', text:'__ \u2212 (\u22126) = 10', svar:4},
      {typ:'lucka', text:'\u221215 \u2212 __ = \u221220', svar:5}
    ]}
  ]
};

// --- 4 · TEST (alla färdigheter) ---
var BLAD_TEST = {
  titel:'Test',
  intro:'Visa vad du kan. Här blandas begrepp, storleksordna, talföljder och räkning med negativa tal.',
  grupper:[
    {rubrik:'Begrepp', rader:[
      {typ:'lucka', text:'Motsatta talet till \u22129 \u00e4r __', svar:9},
      {typ:'ordna', tal:[-5, 2, -8, 0, 4]},
      {typ:'talfoljd', termer:[-7, -4, -1, null, null], facit:[-7,-4,-1,2,5]}
    ]},
    {rubrik:'Räkna', rader:[
      {typ:'enkel', vansterText:'\u22126 + 4 =', svar:-2},
      {typ:'enkel', vansterText:'5 \u2212 9 =', svar:-4},
      {typ:'enkel', vansterText:'\u22128 + (\u22127) =', svar:-15},
      {typ:'enkel', vansterText:'10 \u2212 (\u22125) =', svar:15}
    ]},
    {rubrik:'Räkna vidare', rader:[
      {typ:'enkel', vansterText:'\u221214 + (\u221216) =', svar:-30},
      {typ:'enkel', vansterText:'22 \u2212 (\u22128) =', svar:30},
      {typ:'enkel', vansterText:'\u221225 \u2212 (\u221225) =', svar:0}
    ]}
  ]
};

// --- 5 · FÖRDJUPNING (multiplikation och division – åk 8-stoff) ---
var BLAD_FORDJUPNING = {
  titel:'Fördjupning',
  intro:'Multiplikation och division med negativa tal. Det här är sådant ni möter mer i åttan \u2013 en utmaning för den som vill mer. Regeln: lika tecken ger plus, olika tecken ger minus.',
  grupper:[
    {rubrik:'Multiplikation', rader:[
      {typ:'enkel', vansterText:'\u22124 \u00b7 3 =', svar:-12},
      {typ:'enkel', vansterText:'6 \u00b7 (\u22125) =', svar:-30},
      {typ:'enkel', vansterText:'\u22127 \u00b7 (\u22122) =', svar:14},
      {typ:'enkel', vansterText:'\u22128 \u00b7 4 =', svar:-32}
    ]},
    {rubrik:'Division', rader:[
      {typ:'enkel', vansterText:'\u221212 / 3 =', svar:-4},
      {typ:'enkel', vansterText:'20 / (\u22124) =', svar:-5},
      {typ:'enkel', vansterText:'\u221218 / (\u22126) =', svar:3},
      {typ:'enkel', vansterText:'\u221224 / 8 =', svar:-3}
    ]},
    {rubrik:'Multiplikation och division blandat', rader:[
      {typ:'enkel', vansterText:'\u22125 \u00b7 4 =', svar:-20},
      {typ:'enkel', vansterText:'\u221230 / (\u22126) =', svar:5},
      {typ:'enkel', vansterText:'9 \u00b7 (\u22123) =', svar:-27},
      {typ:'enkel', vansterText:'\u221228 / 7 =', svar:-4}
    ]},
    {rubrik:'Använd prioriteringsregeln', rader:[
      {typ:'enkel', vansterText:'\u22123 + 4 \u00b7 (\u22122) =', svar:-11},
      {typ:'enkel', vansterText:'(\u22125) \u00b7 2 \u2212 6 =', svar:-16},
      {typ:'enkel', vansterText:'10 + (\u221212) / 3 =', svar:6},
      {typ:'enkel', vansterText:'\u221220 / (\u22124) \u2212 3 =', svar:2}
    ]},
    {rubrik:'Flera faktorer', rader:[
      {typ:'enkel', vansterText:'\u22122 \u00b7 3 \u00b7 (\u22124) =', svar:24},
      {typ:'enkel', vansterText:'\u22121 \u00b7 (\u22122) \u00b7 (\u22125) =', svar:-10},
      {typ:'enkel', vansterText:'2 \u00b7 (\u22123) \u00b7 (\u22121) \u00b7 4 =', svar:24},
      {typ:'enkel', vansterText:'(\u22121) \u00b7 (\u22121) \u00b7 (\u22121) \u00b7 (\u22121) =', svar:1}
    ]}
  ]
};

// ============================================================
// Bygg upp bladen
// ============================================================
bygg_blad(document.getElementById('sheet-begrepp'),     BLAD_BEGREPP);
bygg_blad(document.getElementById('sheet-rakna1'),      BLAD_RAKNA1);
bygg_blad(document.getElementById('sheet-rakna2'),      BLAD_RAKNA2);
bygg_blad(document.getElementById('sheet-test'),        BLAD_TEST);
bygg_blad(document.getElementById('sheet-fordjupning'), BLAD_FORDJUPNING);

