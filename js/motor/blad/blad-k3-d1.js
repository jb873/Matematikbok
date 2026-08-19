/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k3-d1-algebraiska-uttryck.html
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
// Jämför ett algebraiskt uttryck mot en lista godkända svar (normaliserat).
function jamforUttryck(a, godkanda){
  if(a == null) return false;
  function normTerm(t){
    var neg = false;
    if(t[0] === '+'){ t = t.slice(1); }
    else if(t[0] === '-'){ neg = true; t = t.slice(1); }
    var ch = t.split('').sort().join('');
    return (neg ? '-' : '') + ch;
  }
  function norm(x){
    var s = String(x).toLowerCase()
      .replace(/[·×*]/g, '')
      .replace(/\s/g, '')
      .replace(/\u2212/g, '-')
      .replace(/,/g, '.');
    var termer = s.replace(/-/g, '+-').split('+').filter(function(t){ return t !== ''; });
    return termer.map(normTerm).sort().join('+');
  }
  var na = norm(a);
  return godkanda.some(function(g){ return norm(g) === na; });
}
// Jämför fritext mot en lista godkända svar (gemener, utan mellanslag).
function jamforText(a, godkanda){
  if(a == null) return false;
  function norm(x){
    return String(x).toLowerCase().replace(/\s/g,'').replace(/[.,!?]/g,'');
  }
  var na = norm(a);
  if(na === '') return false;
  return godkanda.some(function(g){ return norm(g) === na; });
}
// Symbolisk förenkling av linjärt uttryck med EN variabel → kanonisk form.
function forenklaKanon(uttryck){
  if(uttryck == null) return null;
  var s = String(uttryck).toLowerCase()
    .replace(/\u2212/g, '-').replace(/[×]/g, '*').replace(/·/g, '*')
    .replace(/\s/g, '').replace(/,/g, '.');
  if(s === '') return null;
  var vm = s.match(/[a-z]/);
  var v = vm ? vm[0] : null;
  if(v && new RegExp('[a-z]').test(s.replace(new RegExp(v,'g'),''))) return null;
  s = s.replace(/(\d|\))(\()/g, '$1*$2')
       .replace(/(\))(\d|[a-z]|\()/g, '$1*$2')
       .replace(/(\d)([a-z])/g, '$1*$2')
       .replace(/([a-z])(\d)/g, '$1*$2');
  function evalAt(xval){
    var e = v ? s.replace(new RegExp(v,'g'), '('+xval+')') : s;
    if(!/^[-+*/().\d]+$/.test(e)) return null;
    try{ var r = Function('"use strict";return ('+e+')')(); return (typeof r==='number'&&isFinite(r))?r:null; }
    catch(err){ return null; }
  }
  if(!v){ var c0 = evalAt(0); return c0===null?null:'C'+(Math.round(c0*1e6)/1e6); }
  var f0 = evalAt(0), f1 = evalAt(1);
  if(f0===null||f1===null) return null;
  return (Math.round((f1-f0)*1e6)/1e6) + v + '+' + (Math.round(f0*1e6)/1e6);
}
function jamforForenkla(a, facit){
  var na = forenklaKanon(a);
  if(na === null) return false;
  return na === forenklaKanon(facit);
}
// Symbolisk förenkling med FLERA variabler (x,y,a,b). Expanderar parenteser,
// multiplikation och division, samlar koefficienter per variabel + konstant.
// Returnerar kanonisk sträng, eller null om uttrycket inte kan tolkas.
function forenklaFler(uttryck){
  if(uttryck == null) return null;
  var s = String(uttryck).toLowerCase()
    .replace(/\u2212/g,'-').replace(/[×]/g,'*').replace(/·/g,'*')
    .replace(/\s/g,'').replace(/,/g,'.');
  if(s === '') return null;
  // vilka variabler förekommer?
  var vars = [];
  (s.match(/[a-z]/g)||[]).forEach(function(c){ if(vars.indexOf(c)<0) vars.push(c); });
  // implicit multiplikation
  s = s.replace(/(\d|\))(\()/g,'$1*$2')
       .replace(/(\))(\d|[a-z]|\()/g,'$1*$2')
       .replace(/(\d)([a-z])/g,'$1*$2')
       .replace(/([a-z])(\d)/g,'$1*$2')
       .replace(/([a-z])([a-z])/g,'$1*$2');
  function evalAt(vals){
    var e = s;
    for(var k in vals){ e = e.replace(new RegExp(k,'g'), '('+vals[k]+')'); }
    if(!/^[-+*/().\d]+$/.test(e)) return null;
    try{ var r = Function('"use strict";return ('+e+')')(); return (typeof r==='number'&&isFinite(r))?r:null; }
    catch(err){ return null; }
  }
  // konstant = värde då alla variabler = 0
  var noll = {}; vars.forEach(function(v){ noll[v]=0; });
  var c = evalAt(noll);
  if(c === null) return null;
  // koefficient för varje variabel: värde då just den = 1 (övriga 0), minus konstant
  var koef = {};
  for(var i=0;i<vars.length;i++){
    var vv = {}; vars.forEach(function(v){ vv[v]=0; }); vv[vars[i]] = 1;
    var f1 = evalAt(vv);
    if(f1 === null) return null;
    koef[vars[i]] = Math.round((f1 - c)*1e6)/1e6;
  }
  // kanonisk: variabler i bokstavsordning + konstant
  var delar = vars.slice().sort().map(function(v){ return koef[v]+v; });
  delar.push('C'+(Math.round(c*1e6)/1e6));
  return delar.join('|');
}
function jamforFler(a, facit){
  var na = forenklaFler(a);
  if(na === null) return false;
  return na === forenklaFler(facit);
}
// Jämför ett led på FORM (rätt tal och tecken; godtar mellanslag, ·/x/*,
// omkastad faktorordning 3·5=5·3 och omkastad termordning 15+2=2+15).
function jamforForm(a, godkanda){
  if(a == null) return false;
  function normTerm(t){
    var neg=false;
    if(t[0]==='+'){t=t.slice(1);} else if(t[0]==='-'){neg=true;t=t.slice(1);}
    var faktorer=t.split('·').filter(function(f){return f!=='';}).sort();
    return (neg?'-':'') + faktorer.join('·');
  }
  function norm(x){
    var s=String(x).toLowerCase().replace(/[×*x]/g,'·').replace(/\s/g,'').replace(/\u2212/g,'-').replace(/,/g,'.');
    if(s==='') return '';
    var termer=s.replace(/-/g,'+-').split('+').filter(function(t){return t!=='';});
    return termer.map(normTerm).sort().join('+');
  }
  var na=norm(a);
  if(na==='') return false;
  return godkanda.some(function(g){return norm(g)===na;});
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
      } else if(rad.typ === 'uttryck'){
        // svaret är ett algebraiskt uttryck (rättas normaliserat)
        if(rad.likhet){
          html += '<span class="ovn-text ovn-num">' + rad.fraga + '</span>';
          html += '<span class="ovn-text" style="margin:0 4px;">=</span>';
        } else {
          html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        }
        var acceptU = (rad.accept || [rad.svar]).join('|');
        html += '<input class="ovn-in bred" data-uttryck="' + encodeURIComponent(acceptU)
          + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off" placeholder="' + (rad.placeholder||'uttryck') + '">';
      } else if(rad.typ === 'ordtext'){
        // fritext som tolkning (rättas mot lista av godkända formuleringar)
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        var acceptT = (rad.accept || [rad.svar]).join('|');
        html += '<input class="ovn-in bred" data-text="' + encodeURIComponent(acceptT)
          + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off" placeholder="' + (rad.placeholder||'svar med ord') + '">';
      } else if(rad.typ === 'bild'){
        // SVG-bild + uttrycks- eller numeriskt svar
        html += '<div style="display:flex;flex-direction:column;gap:10px;width:100%;">';
        html += '<div class="alg-bild">' + rad.svg + '</div>';
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
        html += '<span class="ovn-text">' + (rad.fraga||'') + '</span>';
        if(rad.svarTyp === 'uttryck'){
          var accB = (rad.accept || [rad.svar]).join('|');
          html += '<input class="ovn-in bred" data-uttryck="' + encodeURIComponent(accB)
            + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off" placeholder="' + (rad.placeholder||'uttryck') + '">';
        } else if(rad.svarTyp === 'text'){
          var accBt = (rad.accept || [rad.svar]).join('|');
          html += '<input class="ovn-in bred" data-text="' + encodeURIComponent(accBt)
            + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off" placeholder="' + (rad.placeholder||'svar med ord') + '">';
        } else {
          html += '<input class="ovn-in" data-svar="' + rad.svar + '" inputmode="decimal" autocomplete="off">';
        }
        html += '</div></div>';
      } else if(rad.typ === 'valruta'){
        // Välj rätt uttryck bland alternativ (kan ha flera rätta). Valfri SVG ovanför.
        html += '<div style="display:flex;flex-direction:column;gap:10px;width:100%;">';
        if(rad.svg) html += '<div class="alg-bild">' + rad.svg + '</div>';
        html += '<span class="ovn-text" style="min-width:160px;">' + (rad.fraga||'') + '</span>';
        var ratta = (rad.ratt || []).join('|');
        var flera = rad.flera ? '1' : '';
        html += '<div class="valruta-grid" data-ratt="' + encodeURIComponent(ratta) + '" data-flera="' + flera + '">';
        rad.alt.forEach(function(a){
          html += '<button type="button" class="valruta-btn" data-val="' + encodeURIComponent(a) + '">' + a + '</button>';
        });
        html += '</div></div>';
      } else if(rad.typ === 'flerled'){
        // Horisontell likhetskedja: uppgift = [insättning] = [förenkling] = [svar]
        // led-objekt: {accept:[...], visa:'...'} ; sista ledet {svar:tal}
        // Stöd för bråk i visat uttryck via rad.vansterHtml (annars rad.vansterText).
        html += '<span class="ovn-text ovn-num">' + (rad.vansterHtml || rad.vansterText) + '</span>';
        html += '<span class="ovn-text" style="margin:0 3px;">=</span>';
        rad.led.forEach(function(led, li){
          var arSvar = (li === rad.led.length - 1);
          if(arSvar){
            html += '<input class="ovn-in" data-svar="' + led.svar + '" inputmode="decimal" autocomplete="off" placeholder="svar" style="min-width:70px;">';
          } else {
            var acc = (led.accept || [led.visa]).join('|');
            html += '<input class="ovn-in bred" data-form="' + encodeURIComponent(acc)
              + '" data-visa="' + led.visa + '" inputmode="text" autocomplete="off" placeholder="led" style="min-width:96px;">';
            html += '<span class="ovn-text" style="margin:0 3px;">=</span>';
          }
        });
      } else if(rad.typ === 'text'){
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
      // Auto-mellanrum runt + och − i mellanled-fält (data-form)
      if(inp.dataset.form !== undefined){
        var pos = inp.selectionStart;
        var fore = inp.value.slice(0, pos);
        var ny = inp.value
          .replace(/\s*([+\u2212-])\s*/g, ' $1 ')   // mellanrum runt + och −
          .replace(/\s{2,}/g, ' ')                    // inga dubbla mellanrum
          .replace(/^\s+/, '');                        // inget inledande mellanrum
        if(ny !== inp.value){
          // justera markörposition efter inskjutna mellanrum
          var foreNy = fore.replace(/\s*([+\u2212-])\s*/g, ' $1 ').replace(/\s{2,}/g,' ').replace(/^\s+/,'');
          inp.value = ny;
          var nyPos = foreNy.length;
          try{ inp.setSelectionRange(nyPos, nyPos); }catch(e){}
        }
      }
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

  // Valruta-knappar: enkel- eller flerval
  rotEl.querySelectorAll('.valruta-grid').forEach(function(grid){
    var flera = grid.dataset.flera === '1';
    grid.querySelectorAll('.valruta-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(flera){
          btn.classList.toggle('is-vald');
        } else {
          grid.querySelectorAll('.valruta-btn').forEach(function(b){ b.classList.remove('is-vald','correct','wrong'); });
          btn.classList.add('is-vald');
        }
      });
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
      if(inp.dataset.uttryck !== undefined){
        var godk = decodeURIComponent(inp.dataset.uttryck).split('|');
        ok = jamforUttryck(inp.value, godk)
          || godk.some(function(g){ return jamforForenkla(inp.value, g); })
          || godk.some(function(g){ return jamforFler(inp.value, g); });
      } else if(inp.dataset.form !== undefined){
        ok = jamforForm(inp.value, decodeURIComponent(inp.dataset.form).split('|'));
      } else if(inp.dataset.text !== undefined){
        ok = jamforText(inp.value, decodeURIComponent(inp.dataset.text).split('|'));
      } else if(inp.dataset.mellan){
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
        if(inp.dataset.uttryck !== undefined) facit = inp.dataset.visa;
        else if(inp.dataset.form !== undefined) facit = inp.dataset.visa;
        else if(inp.dataset.text !== undefined) facit = inp.dataset.visa;
        else if(inp.dataset.mellan) facit = inp.dataset.mellan;
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

    // Rätta valruta-grids (välj rätt uttryck, ev. flera rätta)
    rotEl.querySelectorAll('.valruta-grid').forEach(function(grid){
      totalt++;
      var ratta = decodeURIComponent(grid.dataset.ratt).split('|');
      var flera = grid.dataset.flera === '1';
      var valda = [];
      grid.querySelectorAll('.valruta-btn').forEach(function(b){
        b.classList.remove('correct','wrong');
        var bv = decodeURIComponent(b.dataset.val);
        var arRatt = ratta.some(function(r){ return jamforUttryck(bv,[r]) || jamforFler(bv,r); });
        if(b.classList.contains('is-vald')){
          valda.push(bv);
          b.classList.add(arRatt ? 'correct' : 'wrong');
        } else if(arRatt){
          b.classList.add('correct'); // visa de rätta även om ej valda
        }
      });
      // rätt om: valt minst ett, och alla valda är rätta, och (om ej flera) exakt ett valt
      var allaValdaRatt = valda.length>0 && valda.every(function(v){ return ratta.some(function(r){ return jamforUttryck(v,[r])||jamforFler(v,r); }); });
      var antalRatta = ratta.length;
      var ok = allaValdaRatt && (flera ? valda.length===antalRatta : valda.length===1);
      if(ok) ratt++;
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
    rotEl.querySelectorAll('.valruta-btn').forEach(function(b){ b.classList.remove('is-vald','correct','wrong'); });
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
// ============================================================
// ÖVNINGSBLAD – Algebraiska uttryck (kapitel 3, del 1)
// ============================================================

// --- SKRIVA UTTRYCK (platshållare – byggs härnäst) ---
// --- SKRIVA UTTRYCK ---
var BLAD_SKRIVA = {
  titel:'Skriva uttryck',
  intro:'Skriv ett uttryck eller välj rätt alternativ. Använd x och de andra variablerna. Skriv · för gånger och / för delat. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'1. Nora har x stycken kapsyler. Välj det uttryck som visar hur många kapsyler Nora har om', rader:[
      {typ:'valruta', fraga:'hon får fyra nya kapsyler', alt:['x − 4','x + 4','4x'], ratt:['x+4']},
      {typ:'valruta', fraga:'hon ger bort tre kapsyler', alt:['x − 3','3x','x + 3'], ratt:['x-3']},
      {typ:'valruta', fraga:'hon får dubbelt så många till', alt:['2x','3x','x/2'], ratt:['2x']}
    ]},
    {rubrik:'2. Skriv ett uttryck för längden av den röda sträckan', rader:[
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'x+3', accept:['x+3','3+x'], placeholder:'uttryck',
       svg:'<svg viewBox="0 0 320 70" width="320" height="70" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="22" x2="290" y2="22" stroke="#c0392b" stroke-width="3"/><line x1="30" y1="16" x2="30" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="290" y1="16" x2="290" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="30" y1="48" x2="180" y2="48" stroke="#333" stroke-width="2"/><line x1="180" y1="48" x2="290" y2="48" stroke="#333" stroke-width="2"/><line x1="30" y1="42" x2="30" y2="54" stroke="#333" stroke-width="2"/><line x1="180" y1="42" x2="180" y2="54" stroke="#333" stroke-width="2"/><line x1="290" y1="42" x2="290" y2="54" stroke="#333" stroke-width="2"/><text x="105" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="235" y="65" text-anchor="middle" font-size="14" font-style="italic">3</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'x+4', accept:['x+4','4+x'], placeholder:'uttryck',
       svg:'<svg viewBox="0 0 320 70" width="320" height="70" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="22" x2="290" y2="22" stroke="#c0392b" stroke-width="3"/><line x1="30" y1="16" x2="30" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="290" y1="16" x2="290" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="30" y1="48" x2="110" y2="48" stroke="#333" stroke-width="2"/><line x1="110" y1="48" x2="290" y2="48" stroke="#333" stroke-width="2"/><line x1="30" y1="42" x2="30" y2="54" stroke="#333" stroke-width="2"/><line x1="110" y1="42" x2="110" y2="54" stroke="#333" stroke-width="2"/><line x1="290" y1="42" x2="290" y2="54" stroke="#333" stroke-width="2"/><text x="70" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="200" y="65" text-anchor="middle" font-size="14" font-style="italic">4</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'3x', accept:['3x','x+x+x'], placeholder:'uttryck',
       svg:'<svg viewBox="0 0 320 70" width="320" height="70" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="22" x2="290" y2="22" stroke="#c0392b" stroke-width="3"/><line x1="30" y1="16" x2="30" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="290" y1="16" x2="290" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="30" y1="48" x2="290" y2="48" stroke="#333" stroke-width="2"/><line x1="30" y1="42" x2="30" y2="54" stroke="#333" stroke-width="2"/><line x1="117" y1="42" x2="117" y2="54" stroke="#333" stroke-width="2"/><line x1="204" y1="42" x2="204" y2="54" stroke="#333" stroke-width="2"/><line x1="290" y1="42" x2="290" y2="54" stroke="#333" stroke-width="2"/><text x="73" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="160" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="247" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text></svg>'}
    ]},
    {rubrik:'3. Tilde är a cm lång. Skriv ett uttryck för längden av en person som är', rader:[
      {typ:'uttryck', fraga:'10 cm längre än Tilde', svar:'a+10', accept:['a+10','10+a']},
      {typ:'uttryck', fraga:'18 cm kortare än Tilde', svar:'a−18', accept:['a-18']},
      {typ:'uttryck', fraga:'dubbelt så lång som Tilde', svar:'2a', accept:['2a','a·2','a+a']},
      {typ:'uttryck', fraga:'hälften så lång som Tilde', svar:'a/2', accept:['a/2']}
    ]},
    {rubrik:'4. Elsa är x år gammal', rader:[
      {typ:'uttryck', fraga:'Elsas bror är 2 år äldre än henne. Skriv ett uttryck för broderns ålder.', svar:'x+2', accept:['x+2','2+x']},
      {typ:'uttryck', fraga:'Elsas syster är dubbelt så gammal som Elsa. Skriv ett uttryck för systerns ålder.', svar:'2x', accept:['2x','x·2','x+x']},
      {typ:'uttryck', fraga:'Skriv ett uttryck för syskonens sammanlagda ålder (Elsa + bror + syster).', svar:'4x+2', accept:['4x+2','2+4x']}
    ]},
    {rubrik:'5. Vilket eller vilka uttryck beskriver kvadratens omkrets? (sidan är z)', rader:[
      {typ:'valruta', flera:true, fraga:'Välj alla som stämmer:', alt:['4z','4 · z','4 + z','z + z + z + z'], ratt:['4z','4·z','z+z+z+z']}
    ]},
    {rubrik:'6. Skriv ett uttryck för figurens omkrets och förenkla det', rader:[
      {typ:'bild', svarTyp:'uttryck', fraga:'Triangel:  omkrets =', svar:'12x', accept:['12x','3x+5x+4x'], placeholder:'förenkla',
       svg:'<svg viewBox="0 0 200 150" width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="40,120 40,40 150,120" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="26" y="82" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">3x</text><text x="105" y="74" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">5x</text><text x="95" y="138" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">4x</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Rektangel:  omkrets =', svar:'8x', accept:['8x','3x+x+3x+x'], placeholder:'förenkla',
       svg:'<svg viewBox="0 0 220 120" width="220" height="120" xmlns="http://www.w3.org/2000/svg"><rect x="45" y="35" width="130" height="52" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="110" y="28" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">3x</text><text x="110" y="104" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">3x</text><text x="33" y="65" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">x</text><text x="187" y="65" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">x</text></svg>'}
    ]},
    {rubrik:'7. Para ihop genom att skriva rätt uttryck', rader:[
      {typ:'uttryck', fraga:'5 mer än b', svar:'b+5', accept:['b+5','5+b']},
      {typ:'uttryck', fraga:'Hälften så mycket som b', svar:'b/2', accept:['b/2']},
      {typ:'uttryck', fraga:'Dubbelt så mycket som b', svar:'2b', accept:['2b','b·2','b+b']},
      {typ:'uttryck', fraga:'5 mindre än b', svar:'b−5', accept:['b-5']}
    ]},
    {rubrik:'8. En glass kostar x kr, en läsk kostar 5 kr mer än glassen och en smörgås kostar 10 kr mer än glassen', rader:[
      {typ:'uttryck', fraga:'Skriv ett uttryck för vad en glass, en läsk och en smörgås kostar sammanlagt (förenklat).', svar:'3x+15', accept:['3x+15','15+3x']},
      {typ:'enkel', vansterText:'Om allt tillsammans kostar 60 kr, vad kostar en glass? (kr)', svar:15}
    ]}
  ]
};

var BLAD_TOLKA = {
  titel:'Tolka uttryck',
  intro:'Tolka vad uttrycket betyder utifrån bilden, och räkna sedan ut vad det kostar. Skriv svaret och tryck på Kontrollera.',
  grupper:[
    {rubrik:'En glass kostar a kronor och en läsk kostar b kronor', rader:[
      {typ:'bild', svarTyp:'text',
       fraga:'Vad har Nadia köpt om uttrycket 3a + 2b beskriver kostnaden?',
       svar:'tre glassar och två läsk',
       accept:['treglassarochtvåläsk','3glass2läsk','treglassartvåläsk','3glassar2läsk','treglasstvåläsk'],
       svg:'<div class="emoji-bild"><span class="emoji-grupp">🍦🍦🍦<span class="emoji-text">3 glassar · a kr</span></span><span class="emoji-grupp">🥤🥤<span class="emoji-text">2 läsk · b kr</span></span></div>'},
      {typ:'enkel', vansterText:'Hur mycket betalade Nadia om a = 12 och b = 8?', svar:52}
    ]},
    {rubrik:'En munk kostar a kronor och en kaffe kostar b kronor', rader:[
      {typ:'bild', svarTyp:'text',
       fraga:'Vad har Elliot köpt om uttrycket 4a + 2b beskriver kostnaden?',
       svar:'fyra munkar och två kaffe',
       accept:['fyramunkarochtvåkaffe','4munk2kaffe','fyramunkartvåkaffe','4munkar2kaffe','fyramunkartvåkoppar'],
       svg:'<div class="emoji-bild"><span class="emoji-grupp">🍩🍩🍩🍩<span class="emoji-text">4 munkar · a kr</span></span><span class="emoji-grupp">☕☕<span class="emoji-text">2 kaffe · b kr</span></span></div>'},
      {typ:'enkel', vansterText:'Hur mycket betalade Elliot om a = 9 och b = 15?', svar:66}
    ]},
    {rubrik:'En tröja kostar a kronor och ett par strumpor kostar b kronor', rader:[
      {typ:'bild', svarTyp:'text',
       fraga:'Vad har Hugo köpt om uttrycket 2a + 5b beskriver kostnaden?',
       svar:'två tröjor och fem par strumpor',
       accept:['tvåtröjorochfemparstrumpor','2tröjor5strumpor','tvåtröjorfemparstrumpor','2tröjor5parstrumpor','tvåtröjorfemstrumpor'],
       svg:'<div class="emoji-bild"><span class="emoji-grupp">👕👕<span class="emoji-text">2 tröjor · a kr</span></span><span class="emoji-grupp">🧦🧦🧦🧦🧦<span class="emoji-text">5 par strumpor · b kr</span></span></div>'},
      {typ:'enkel', vansterText:'Hur mycket betalade Hugo om a = 20 och b = 6?', svar:70}
    ]},
    {rubrik:'En pizza kostar x kronor och en läsk kostar y kronor', rader:[
      {typ:'bild', svarTyp:'text',
       fraga:'Vad har Vera köpt om uttrycket 2x + 3y beskriver kostnaden?',
       svar:'två pizzor och tre läsk',
       accept:['tvåpizzorochtreläsk','2pizza3läsk','tvåpizzortreläsk','2pizzor3läsk','tvåpizzatreläsk'],
       svg:'<div class="emoji-bild"><span class="emoji-grupp">🍕🍕<span class="emoji-text">2 pizzor · x kr</span></span><span class="emoji-grupp">🥤🥤🥤<span class="emoji-text">3 läsk · y kr</span></span></div>'},
      {typ:'enkel', vansterText:'Hur mycket betalade Vera om x = 45 och y = 12?', svar:126}
    ]},
    {rubrik:'Ett äpple kostar x kronor och en banan kostar y kronor', rader:[
      {typ:'bild', svarTyp:'text',
       fraga:'Vad har Omar köpt om uttrycket 6x + 4y beskriver kostnaden?',
       svar:'sex äpplen och fyra bananer',
       accept:['sexäpplenochfyrabananer','6äpple4banan','sexäpplenfyrabananer','6äpplen4bananer','sexäpplefyrabananer'],
       svg:'<div class="emoji-bild"><span class="emoji-grupp">🍎🍎🍎🍎🍎🍎<span class="emoji-text">6 äpplen · x kr</span></span><span class="emoji-grupp">🍌🍌🍌🍌<span class="emoji-text">4 bananer · y kr</span></span></div>'},
      {typ:'enkel', vansterText:'Hur mycket betalade Omar om x = 3 och y = 5?', svar:38}
    ]},
    {rubrik:'Skriv ett eget uttryck', rader:[
      {typ:'uttryck', fraga:'En film kostar a kronor att hyra. Skriv ett uttryck för vad det kostar att hyra 4 filmer.',
       svar:'4a', accept:['4a','a·4','4·a']},
      {typ:'uttryck', fraga:'Saga är x år. Hennes lillasyster är 2 år yngre. Skriv ett uttryck för lillasysterns ålder.',
       svar:'x−2', accept:['x-2']},
      {typ:'uttryck', fraga:'En biljett kostar b kronor. Skriv ett uttryck för vad 3 biljetter kostar.',
       svar:'3b', accept:['3b','b·3','3·b']}
    ]}
  ]
};

// --- BERÄKNA MED UTTRYCK ---
var BLAD_BERAKNA = {
  titel:'Beräkna med uttryck',
  intro:'Sätt in värdet på variabeln och visa mellanleden på raden. Skriv insättningen, förenklingen och svaret i fälten. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Beräkna värdet för 5y − 3', rader:[
      {typ:'flerled', vansterText:'5y − 3, &nbsp;y = 2', led:[
        {accept:['5·2-3'], visa:'5·2 − 3'}, {accept:['10-3'], visa:'10 − 3'}, {svar:7}
      ]},
      {typ:'flerled', vansterText:'5y − 3, &nbsp;y = 6', led:[
        {accept:['5·6-3'], visa:'5·6 − 3'}, {accept:['30-3'], visa:'30 − 3'}, {svar:27}
      ]}
    ]},
    {rubrik:'Beräkna värdet om x = 4', rader:[
      {typ:'flerled', vansterText:'5 + x', led:[
        {accept:['5+4'], visa:'5 + 4'}, {svar:9}
      ]},
      {typ:'flerled', vansterText:'4x', led:[
        {accept:['4·4'], visa:'4·4'}, {svar:16}
      ]},
      {typ:'flerled',
       vansterHtml:'<span class="brak"><span class="taljare">x</span><span class="namnare">2</span></span> + 5',
       led:[
        {accept:['4/2+5'], visa:'4/2 + 5'}, {accept:['2+5'], visa:'2 + 5'}, {svar:7}
      ]}
    ]},
    {rubrik:'Beräkna värdet för 4a + 5', rader:[
      {typ:'flerled', vansterText:'4a + 5, &nbsp;a = 2', led:[
        {accept:['4·2+5'], visa:'4·2 + 5'}, {accept:['8+5'], visa:'8 + 5'}, {svar:13}
      ]},
      {typ:'flerled', vansterText:'4a + 5, &nbsp;a = 0', led:[
        {accept:['4·0+5'], visa:'4·0 + 5'}, {accept:['0+5'], visa:'0 + 5'}, {svar:5}
      ]},
      {typ:'flerled', vansterText:'4a + 5, &nbsp;a = 6', led:[
        {accept:['4·6+5'], visa:'4·6 + 5'}, {accept:['24+5'], visa:'24 + 5'}, {svar:29}
      ]}
    ]},
    {rubrik:'Beräkna värdet för 4x + y', rader:[
      {typ:'flerled', vansterText:'4x + y, &nbsp;x = 3 och y = 7', led:[
        {accept:['4·3+7'], visa:'4·3 + 7'}, {accept:['12+7'], visa:'12 + 7'}, {svar:19}
      ]},
      {typ:'flerled', vansterText:'4x + y, &nbsp;x = 5 och y = 2', led:[
        {accept:['4·5+2'], visa:'4·5 + 2'}, {accept:['20+2'], visa:'20 + 2'}, {svar:22}
      ]}
    ]},
    {rubrik:'Beräkna värdet för 6x − 3y', rader:[
      {typ:'flerled', vansterText:'6x − 3y, &nbsp;x = 6 och y = 3', led:[
        {accept:['6·6-3·3'], visa:'6·6 − 3·3'}, {accept:['36-9'], visa:'36 − 9'}, {svar:27}
      ]}
    ]},
    {rubrik:'Beräkna värdet för 7a + 4b − 3', rader:[
      {typ:'flerled', vansterText:'7a + 4b − 3, &nbsp;a = 6 och b = 3', led:[
        {accept:['7·6+4·3-3'], visa:'7·6 + 4·3 − 3'}, {accept:['42+12-3'], visa:'42 + 12 − 3'}, {svar:51}
      ]},
      {typ:'flerled', vansterText:'7a + 4b − 3, &nbsp;a = 7 och b = 2', led:[
        {accept:['7·7+4·2-3'], visa:'7·7 + 4·2 − 3'}, {accept:['49+8-3'], visa:'49 + 8 − 3'}, {svar:54}
      ]}
    ]}
  ]
};

var BLAD_TEST = {
  titel:'Test',
  intro:'Det här avsnittet byggs senare.',
  grupper:[
    {rubrik:'Kommer snart', rader:[
      {typ:'ordtext', fraga:'Testuppgifter läggs in här.', svar:'', accept:['']}
    ]}
  ]
};

// ============================================================
// Bygg upp bladen
// ============================================================
bygg_blad(document.getElementById('sheet-skriva'),  BLAD_SKRIVA);
bygg_blad(document.getElementById('sheet-tolka'),   BLAD_TOLKA);
bygg_blad(document.getElementById('sheet-berakna'), BLAD_BERAKNA);
bygg_blad(document.getElementById('sheet-test'),    BLAD_TEST);

