/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k1-d1-positionssystem.html
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
  {id:'QUrodq8ZHmM', titel:'Begreppskunskap', tag:'Föreläsning'},
  {id:'NsSyKd5ndAE', titel:'Positionssystemet', tag:'Föreläsning'},
  {id:'pq7sXrQpnPo', titel:'Delbarhetsregler', tag:'Föreläsning'},
  {id:'rNdzIREh0bc', titel:'Primtalsfaktorisera med faktorträd', tag:'Föreläsning'},
  {id:'sn23QGLVN2g', titel:'Talföljder', tag:'Föreläsning'},
  {id:'AVcsB9Tf7_k', titel:'Räkna i positionssystemet', tag:'Föreläsning'},
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

  if(blad.stegvis){
    html += '<div class="steg-nav" data-stegnav>'
      + '<button type="button" class="steg-btn" data-steg="prev" disabled>← Föregående</button>'
      + '<span class="steg-info" data-steg-info>Avsnitt 1 av ' + blad.grupper.length + '</span>'
      + '<button type="button" class="steg-btn" data-steg="next">Nästa avsnitt →</button>'
      + '</div>';
  }

  var radNummer = 0;
  blad.grupper.forEach(function(grupp, gi){
    html += '<div class="ovn-grupp" data-grupp-idx="' + gi + '">';
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
      // Tallinje: SVG med pilar A/B/C, eleven skriver vad varje pil pekar på
      if(rad.typ === 'tallinje'){
        html += '<div class="ovn-rad ovn-tallinje-rad" data-rad="' + radNummer + '" style="flex-direction:column;align-items:flex-start;gap:10px;">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        // bygg SVG
        var W=620, H=70, x0=30, x1=590, mn=rad.min, mx=rad.max;
        function px(v){ return x0 + (v-mn)/(mx-mn)*(x1-x0); }
        var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">';
        s+='<line x1="'+x0+'" y1="48" x2="'+x1+'" y2="48" stroke="#333" stroke-width="2"/>';
        s+='<polygon points="'+x1+',48 '+(x1-9)+',44 '+(x1-9)+',52" fill="#333"/>';
        // delstreck
        rad.streck.forEach(function(t){
          var x=px(t.v);
          s+='<line x1="'+x+'" y1="'+(t.lang?40:44)+'" x2="'+x+'" y2="'+(t.lang?56:52)+'" stroke="#333" stroke-width="'+(t.lang?2:1)+'"/>';
          if(t.etikett!==undefined) s+='<text x="'+x+'" y="68" text-anchor="middle" font-size="12" fill="#555">'+visaTal(t.etikett)+'</text>';
        });
        // pilar
        rad.pilar.forEach(function(p){
          var x=px(p.v);
          s+='<line x1="'+x+'" y1="14" x2="'+x+'" y2="40" stroke="#c0392b" stroke-width="2"/>';
          s+='<polygon points="'+x+',44 '+(x-4)+',37 '+(x+4)+',37" fill="#c0392b"/>';
          s+='<circle cx="'+x+'" cy="9" r="9" fill="#c0392b"/>';
          s+='<text x="'+x+'" y="13" text-anchor="middle" font-size="11" fill="#fff" font-weight="bold">'+p.namn+'</text>';
        });
        s+='</svg>';
        html += '<div class="alg-bild" style="width:100%;">' + s + '</div>';
        // svarsrutor: en per pil
        html += '<span class="ovn-tallinje-svar" style="display:flex;gap:14px;flex-wrap:wrap;">';
        rad.pilar.forEach(function(p){
          html += '<span style="display:inline-flex;align-items:center;gap:5px;"><span class="ovn-text ovn-num">'+p.namn+' =</span>'
            + '<input class="ovn-in" data-svar="' + p.v + '" inputmode="decimal" autocomplete="off" style="width:80px;"></span>';
        });
        html += '</span></div>';
        return;
      }
      // räkna om bokstav per grupp
      html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
      html += '<span class="ovn-label">' + bokstav + ')</span>';
      if(rad.typ === 'enkel'){
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      } else if(rad.typ === 'intervall'){
        // Skriv tal strikt mellan min och max. Två rutor som standard, en ruta om enkelt:true.
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in ovn-intervall" data-min="' + rad.min + '" data-max="' + rad.max
          + '" data-par="' + radNummer + '" inputmode="decimal" autocomplete="off" placeholder="ett tal">';
        if(!rad.enkelt){
          html += '<input class="ovn-in ovn-intervall" data-min="' + rad.min + '" data-max="' + rad.max
            + '" data-par="' + radNummer + '" inputmode="decimal" autocomplete="off" placeholder="ett till">';
        }
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
        html += '<input class="ovn-in bred" data-nokeypad data-text="' + encodeURIComponent(acceptT)
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
          html += '<input class="ovn-in bred" data-nokeypad data-text="' + encodeURIComponent(accBt)
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
  // EN delad keypad per sida (inte en per blad): monteras i document.body (utanför blad-mounts/
  // ev. transform), binds mot hela sidan → följer fokus över alla blad. Samma ops för sidans blad.
  if(window.AK8_UI && !document.getElementById('ovn-keypad-shared')){
    var _kw = document.createElement('div'); _kw.innerHTML = AK8_UI.keypadHTML({ ops:[',','/','·','\u2212','='] });
    var _kp = _kw.firstChild; if(_kp){ _kp.id = 'ovn-keypad-shared'; document.body.appendChild(_kp); AK8_UI.bindKeypad(document.body); }
  }

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
    // Vid stegvis läge: rätta bara det synliga avsnittet
    var aktivaInputs = blad.stegvis
      ? inputs.filter(function(inp){ var g = inp.closest('.ovn-grupp'); return g && !g.classList.contains('steg-dold'); })
      : inputs;
    aktivaInputs.forEach(function(inp){
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
      } else if(inp.dataset.min !== undefined){
        // intervall: talet ska ligga strikt mellan min och max, och de två fälten i paret ska skilja sig
        var lo = parseFloat(inp.dataset.min), hi = parseFloat(inp.dataset.max);
        var vi = parseFloat(String(inp.value).replace(',','.'));
        var inomIntervall = !isNaN(vi) && vi > lo && vi < hi;
        // hitta parets andra fält
        var par = rotEl.querySelectorAll('.ovn-intervall[data-par="' + inp.dataset.par + '"]');
        var olika = true;
        if(par.length === 2){
          var v0 = parseFloat(String(par[0].value).replace(',','.'));
          var v1 = parseFloat(String(par[1].value).replace(',','.'));
          if(!isNaN(v0) && !isNaN(v1) && Math.abs(v0 - v1) < 1e-9) olika = false;
        }
        ok = inomIntervall && olika;
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
        else if(inp.dataset.min !== undefined) facit = 'ett tal mellan ' + inp.dataset.min.replace('.', ',') + ' och ' + inp.dataset.max.replace('.', ',') + ' (två olika)';
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
      if(blad.stegvis){ var gg = grid.closest('.ovn-grupp'); if(gg && gg.classList.contains('steg-dold')) return; }
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

    // Valfri callback (används bl.a. för att låsa upp Stencil B)
    if(typeof blad.onResultat === 'function'){ blad.onResultat(ratt, totalt); }

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

  // Steg-navigering: visa ett avsnitt (en grupp) i taget
  if(blad.stegvis){
    var grupper = Array.from(rotEl.querySelectorAll('.ovn-grupp'));
    var stegInfo = rotEl.querySelector('[data-steg-info]');
    var prevBtn = rotEl.querySelector('[data-steg="prev"]');
    var nextBtn = rotEl.querySelector('[data-steg="next"]');
    var aktuellt = 0;
    function visaSteg(i){
      aktuellt = Math.max(0, Math.min(grupper.length-1, i));
      grupper.forEach(function(g, gi){ g.classList.toggle('steg-dold', gi !== aktuellt); });
      stegInfo.textContent = 'Avsnitt ' + (aktuellt+1) + ' av ' + grupper.length;
      prevBtn.disabled = (aktuellt === 0);
      nextBtn.disabled = (aktuellt === grupper.length-1);
      var nav = rotEl.querySelector('[data-stegnav]');
      if(nav) nav.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
    prevBtn.addEventListener('click', function(){ visaSteg(aktuellt-1); });
    nextBtn.addEventListener('click', function(){ visaSteg(aktuellt+1); });
    visaSteg(0);
  }

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
// ============================================================
// ÖVNINGSBLAD – Positionssystem och talförståelse (kapitel 1, del 1)
// ============================================================

// ---- TIOSYSTEMET: två varianter (Blad A / Blad B) ----
var TIO_A = {
  titel:'Tiosystemet – Blad A', stegvis:true,
  intro:'Träna på siffrans värde, att bygga tal, utvecklad form och decimaltal. Skriv decimaltal med komma. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Vilket platsvärde har sjuan i talet?', rader:[
      {typ:'ordtext', fraga:'74', svar:'tiotal', accept:['tiotal','tiotalet']},
      {typ:'ordtext', fraga:'67', svar:'ental', accept:['ental','entalet']},
      {typ:'ordtext', fraga:'17 523', svar:'tusental', accept:['tusental','tusentalet']},
      {typ:'ordtext', fraga:'73 508', svar:'tiotusental', accept:['tiotusental','tiotusentalet']}
    ]},
    {rubrik:'Skriv det tal som består av', rader:[
      {typ:'enkel', vansterText:'7 hundratal, 6 tiotal och 3 ental', svar:763},
      {typ:'enkel', vansterText:'5 tusental, 4 tiotal och 2 ental',  svar:5042},
      {typ:'enkel', vansterText:'4 tiotusental, 5 hundratal och 2 ental', svar:40502}
    ]},
    {rubrik:'Använd siffrorna 4, 5, 6 och 7 och skriv', rader:[
      {typ:'enkel', vansterText:'det största talet du kan',     svar:7654},
      {typ:'enkel', vansterText:'det minsta talet du kan',      svar:4567},
      {typ:'enkel', vansterText:'det tal som ligger närmast 6 000', svar:5764},
      {typ:'enkel', vansterText:'det största udda talet du kan', svar:7645}
    ]},
    {rubrik:'Skriv följande tal med siffror', rader:[
      {typ:'enkel', vansterText:'fyrahundra tjugofem',        svar:425},
      {typ:'enkel', vansterText:'sexhundrafem',               svar:605},
      {typ:'enkel', vansterText:'femtusen sjuhundra nittio',  svar:5790},
      {typ:'enkel', vansterText:'fjortontusen fem',           svar:14005}
    ]},
    {rubrik:'Skriv i utvecklad form', rader:[
      {typ:'uttryck', likhet:true, fraga:'567',  svar:'5·100+6·10+7·1', accept:['5·100+6·10+7·1']},
      {typ:'uttryck', likhet:true, fraga:'43',   svar:'4·10+3·1',       accept:['4·10+3·1']},
      {typ:'uttryck', likhet:true, fraga:'5608', svar:'5·1000+6·100+8·1', accept:['5·1000+6·100+8·1']}
    ]},
    {rubrik:'Vilket platsvärde har trean?', rader:[
      {typ:'ordtext', fraga:'703', svar:'ental', accept:['ental','entalet']},
      {typ:'ordtext', fraga:'12,03', svar:'hundradel', accept:['hundradel','hundradelar','hundradelen']},
      {typ:'ordtext', fraga:'14,36', svar:'tiondel', accept:['tiondel','tiondelar','tiondelen']},
      {typ:'ordtext', fraga:'348,12', svar:'hundratal', accept:['hundratal','hundratalet']},
      {typ:'ordtext', fraga:'1,003', svar:'tusendel', accept:['tusendel','tusendelar','tusendelen']}
    ]},
    {rubrik:'Skriv det tal som består av', rader:[
      {typ:'enkel', vansterText:'3 ental och 2 tiondelar',                 svar:3.2},
      {typ:'enkel', vansterText:'7 tiotal, 5 tiondelar och 8 hundradelar', svar:70.58},
      {typ:'enkel', vansterText:'2 tiondelar och 4 hundradelar',           svar:0.24},
      {typ:'enkel', vansterText:'6 ental, 9 tiondelar och 7 tusendelar',   svar:6.907}
    ]},
    {rubrik:'Vilket platsvärde har trean i talet?', rader:[
      {typ:'ordtext', fraga:'35,2', svar:'tiotal', accept:['tiotal','tiotalet']},
      {typ:'ordtext', fraga:'5,34', svar:'tiondel', accept:['tiondel','tiondelar','tiondelen']},
      {typ:'ordtext', fraga:'6,036', svar:'hundradel', accept:['hundradel','hundradelar','hundradelen']},
      {typ:'ordtext', fraga:'7,0837', svar:'tusendel', accept:['tusendel','tusendelar','tusendelen']}
    ]},
    {rubrik:'Skriv som tal', rader:[
      {typ:'enkel', vansterText:'17 tiotal',     svar:170},
      {typ:'enkel', vansterText:'19 hundradelar', svar:0.19},
      {typ:'enkel', vansterText:'23 tiondelar',  svar:2.3}
    ]},
    {rubrik:'Vilket tal ska stå i rutan?', rader:[
      {typ:'enkel', vansterText:'160 = ___ tiotal',        svar:16},
      {typ:'enkel', vansterText:'3 ental = ___ tiondelar', svar:30},
      {typ:'enkel', vansterText:'4 tiondelar = ___ tusendelar', svar:400},
      {typ:'enkel', vansterText:'1,9 = ___ hundradelar',   svar:190},
      {typ:'enkel', vansterText:'14,4 = ___ tiondelar',    svar:144}
    ]},
    {rubrik:'Skriv i utvecklad form', rader:[
      {typ:'uttryck', likhet:true, fraga:'63,9',   svar:'6·10+3·1+9·0,1',   accept:['6·10+3·1+9·0,1','6·10+3·1+9·0.1']},
      {typ:'uttryck', likhet:true, fraga:'7,63',   svar:'7·1+6·0,1+3·0,01', accept:['7·1+6·0,1+3·0,01','7·1+6·0.1+3·0.01']},
      {typ:'uttryck', likhet:true, fraga:'70,809', svar:'7·10+8·0,1+9·0,001', accept:['7·10+8·0,1+9·0,001','7·10+8·0.1+9·0.001']}
    ]}
  ]
};

var TIO_B = {
  titel:'Tiosystemet – Blad B', stegvis:true,
  intro:'Samma slags uppgifter som Blad A, men med andra tal. Skriv decimaltal med komma. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Vilket platsvärde har femman i talet?', rader:[
      {typ:'ordtext', fraga:'52', svar:'tiotal', accept:['tiotal','tiotalet']},
      {typ:'ordtext', fraga:'85', svar:'ental', accept:['ental','entalet']},
      {typ:'ordtext', fraga:'45 217', svar:'tusental', accept:['tusental','tusentalet']},
      {typ:'ordtext', fraga:'56 304', svar:'tiotusental', accept:['tiotusental','tiotusentalet']}
    ]},
    {rubrik:'Skriv det tal som består av', rader:[
      {typ:'enkel', vansterText:'8 hundratal, 3 tiotal och 9 ental', svar:839},
      {typ:'enkel', vansterText:'6 tusental, 7 tiotal och 1 ental',  svar:6071},
      {typ:'enkel', vansterText:'3 tiotusental, 8 hundratal och 4 ental', svar:30804}
    ]},
    {rubrik:'Använd siffrorna 2, 4, 6 och 7 och skriv', rader:[
      {typ:'enkel', vansterText:'det största talet du kan',     svar:7642},
      {typ:'enkel', vansterText:'det minsta talet du kan',      svar:2467},
      {typ:'enkel', vansterText:'det tal som ligger närmast 5 000', svar:4762},
      {typ:'enkel', vansterText:'det största udda talet du kan', svar:6427}
    ]},
    {rubrik:'Skriv följande tal med siffror', rader:[
      {typ:'enkel', vansterText:'trehundra sextio',          svar:360},
      {typ:'enkel', vansterText:'åttahundrasju',             svar:807},
      {typ:'enkel', vansterText:'sextusen fyrahundra tjugo', svar:6420},
      {typ:'enkel', vansterText:'tjugotusen nio',            svar:20009}
    ]},
    {rubrik:'Skriv i utvecklad form', rader:[
      {typ:'uttryck', likhet:true, fraga:'384',  svar:'3·100+8·10+4·1', accept:['3·100+8·10+4·1']},
      {typ:'uttryck', likhet:true, fraga:'72',   svar:'7·10+2·1',       accept:['7·10+2·1']},
      {typ:'uttryck', likhet:true, fraga:'4309', svar:'4·1000+3·100+9·1', accept:['4·1000+3·100+9·1']}
    ]},
    {rubrik:'Vilket platsvärde har sexan?', rader:[
      {typ:'ordtext', fraga:'608', svar:'hundratal', accept:['hundratal','hundratalet']},
      {typ:'ordtext', fraga:'23,06', svar:'hundradel', accept:['hundradel','hundradelar','hundradelen']},
      {typ:'ordtext', fraga:'17,68', svar:'tiondel', accept:['tiondel','tiondelar','tiondelen']},
      {typ:'ordtext', fraga:'651,29', svar:'hundratal', accept:['hundratal','hundratalet']},
      {typ:'ordtext', fraga:'2,006', svar:'tusendel', accept:['tusendel','tusendelar','tusendelen']}
    ]},
    {rubrik:'Skriv det tal som består av', rader:[
      {typ:'enkel', vansterText:'5 ental och 4 tiondelar',                 svar:5.4},
      {typ:'enkel', vansterText:'8 tiotal, 3 tiondelar och 6 hundradelar', svar:80.36},
      {typ:'enkel', vansterText:'3 tiondelar och 7 hundradelar',           svar:0.37},
      {typ:'enkel', vansterText:'4 ental, 2 tiondelar och 5 tusendelar',   svar:4.205}
    ]},
    {rubrik:'Vilket platsvärde har sexan i talet?', rader:[
      {typ:'ordtext', fraga:'6,42', svar:'ental', accept:['ental','entalet']},
      {typ:'ordtext', fraga:'902,6', svar:'tiondel', accept:['tiondel','tiondelar','tiondelen']},
      {typ:'ordtext', fraga:'8,062', svar:'hundradel', accept:['hundradel','hundradelar','hundradelen']},
      {typ:'ordtext', fraga:'3,0625', svar:'hundradel', accept:['hundradel','hundradelar','hundradelen']}
    ]},
    {rubrik:'Skriv som tal', rader:[
      {typ:'enkel', vansterText:'14 tiotal',      svar:140},
      {typ:'enkel', vansterText:'27 hundradelar', svar:0.27},
      {typ:'enkel', vansterText:'31 tiondelar',   svar:3.1}
    ]},
    {rubrik:'Vilket tal ska stå i rutan?', rader:[
      {typ:'enkel', vansterText:'240 = ___ tiotal',        svar:24},
      {typ:'enkel', vansterText:'5 ental = ___ tiondelar', svar:50},
      {typ:'enkel', vansterText:'7 tiondelar = ___ tusendelar', svar:700},
      {typ:'enkel', vansterText:'2,3 = ___ hundradelar',   svar:230},
      {typ:'enkel', vansterText:'18,6 = ___ tiondelar',    svar:186}
    ]},
    {rubrik:'Skriv i utvecklad form', rader:[
      {typ:'uttryck', likhet:true, fraga:'48,2',   svar:'4·10+8·1+2·0,1',   accept:['4·10+8·1+2·0,1','4·10+8·1+2·0.1']},
      {typ:'uttryck', likhet:true, fraga:'9,54',   svar:'9·1+5·0,1+4·0,01', accept:['9·1+5·0,1+4·0,01','9·1+5·0.1+4·0.01']},
      {typ:'uttryck', likhet:true, fraga:'50,607', svar:'5·10+6·0,1+7·0,001', accept:['5·10+6·0,1+7·0,001','5·10+6·0.1+7·0.001']}
    ]}
  ]
};

// platshållare för övriga tre flikar
function platshallare(namn){
  return {titel:namn, intro:'Det här avsnittet byggs härnäst.',
    grupper:[{rubrik:'Kommer snart', rader:[{typ:'ordtext', fraga:'Uppgifter läggs in här.', svar:'', accept:['']}]}]};
}
var EGEN_A = {
  titel:'Tals egenskaper – Blad A', stegvis:true,
  intro:'Träna på jämna och udda tal, delbarhet, primtal, sammansatta tal och faktorisering. Markera alla tal som stämmer, eller skriv svaret. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Vilka tal är jämna?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla jämna tal:', alt:['7','4','16','23','27'], ratt:['4','16']}
    ]},
    {rubrik:'Vilka tal är sammansatta tal?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla sammansatta tal:', alt:['3','9','11','17','25'], ratt:['9','25']}
    ]},
    {rubrik:'Vilka tal är jämnt delbara med …', rader:[
      {typ:'valruta', flera:true, fraga:'… 2', alt:['27','72','70','63','45','98','100','125','3','568','73','490'], ratt:['72','70','98','100','568','490']},
      {typ:'valruta', flera:true, fraga:'… 5', alt:['27','72','70','63','45','98','100','125','3','568','73','490'], ratt:['70','45','100','125','490']}
    ]},
    {rubrik:'Faktorisera talet i två faktorer (skriv t.ex. 3·5)', rader:[
      {typ:'uttryck', likhet:true, fraga:'15', svar:'3·5', accept:['3·5','5·3'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'27', svar:'3·9', accept:['3·9','9·3'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'36', svar:'6·6', accept:['6·6','4·9','9·4','3·12','12·3','2·18','18·2'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'12', svar:'3·4', accept:['3·4','4·3','2·6','6·2'], placeholder:'två faktorer'}
    ]},
    {rubrik:'Vilka primfaktorer saknas i faktoriseringen?', rader:[
      {typ:'uttryck', fraga:'28 = 2 · 2 · ___', svar:'7', accept:['7'], placeholder:'tal'},
      {typ:'uttryck', fraga:'60 = 2 · 2 · ___ · 5', svar:'3', accept:['3'], placeholder:'tal'},
      {typ:'uttryck', fraga:'45 = ___ · ___ · 5  (skriv båda, t.ex. 3·3)', svar:'3·3', accept:['3·3'], placeholder:'två tal'},
      {typ:'uttryck', fraga:'90 = 2 · ___ · ___ · 5  (skriv båda)', svar:'3·3', accept:['3·3'], placeholder:'två tal'}
    ]},
    {rubrik:'Vilket tal har faktoriserats?', rader:[
      {typ:'enkel', vansterText:'2 · 2 · 2 · 2', svar:16},
      {typ:'enkel', vansterText:'2 · 2 · 5 · 5', svar:100},
      {typ:'enkel', vansterText:'2 · 5 · 19',    svar:190}
    ]},
    {rubrik:'Vilka tal är jämnt delbara med 4 och 5?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla som är delbara med både 4 och 5:', alt:['35','40','12','120','32','87','80','400','6','115','97','528'], ratt:['40','120','80','400']}
    ]},
    {rubrik:'Vilka tal är primtal?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla primtal:', alt:['5','7','15','19','21','25','27','31'], ratt:['5','7','19','31']}
    ]},
    {rubrik:'Vilka tal är jämnt delbara med 3 och 5?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla som är delbara med både 3 och 5:', alt:['75','85','93','150','420','5','211'], ratt:['75','150','420']}
    ]},
    {rubrik:'Primtalsfaktorisera med faktorträd (skriv som produkt, t.ex. 2·2·3)', rader:[
      {typ:'uttryck', likhet:true, fraga:'18', svar:'2·3·3', accept:['2·3·3','3·2·3','3·3·2'], placeholder:'primfaktorer'},
      {typ:'uttryck', likhet:true, fraga:'32', svar:'2·2·2·2·2', accept:['2·2·2·2·2'], placeholder:'primfaktorer'},
      {typ:'uttryck', likhet:true, fraga:'56', svar:'2·2·2·7', accept:['2·2·2·7','7·2·2·2','2·7·2·2','2·2·7·2'], placeholder:'primfaktorer'}
    ]},
    {rubrik:'Skriv tre tal som är delbara med 2, 3, 4 och 5', rader:[
      {typ:'uttryck', fraga:'Tal 1 (delbart med 2, 3, 4 och 5):', svar:'60', accept:['60','120','180','240','300','360','420','480','540','600'], placeholder:'ett tal'},
      {typ:'uttryck', fraga:'Tal 2:', svar:'120', accept:['60','120','180','240','300','360','420','480','540','600'], placeholder:'ett tal'},
      {typ:'uttryck', fraga:'Tal 3:', svar:'180', accept:['60','120','180','240','300','360','420','480','540','600'], placeholder:'ett tal'}
    ]}
  ]
};

var EGEN_B = {
  titel:'Tals egenskaper – Blad B', stegvis:true,
  intro:'Samma slags uppgifter som Blad A, men med andra tal. Markera alla tal som stämmer, eller skriv svaret. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Vilka tal är jämna?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla jämna tal:', alt:['9','12','21','34','45'], ratt:['12','34']}
    ]},
    {rubrik:'Vilka tal är sammansatta tal?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla sammansatta tal:', alt:['5','8','13','21','29'], ratt:['8','21']}
    ]},
    {rubrik:'Vilka tal är jämnt delbara med …', rader:[
      {typ:'valruta', flera:true, fraga:'… 2', alt:['33','84','55','91','60','77','200','135','7','432','89','310'], ratt:['84','60','200','432','310']},
      {typ:'valruta', flera:true, fraga:'… 5', alt:['33','84','55','91','60','77','200','135','7','432','89','310'], ratt:['55','60','200','135','310']}
    ]},
    {rubrik:'Faktorisera talet i två faktorer (skriv t.ex. 3·7)', rader:[
      {typ:'uttryck', likhet:true, fraga:'21', svar:'3·7', accept:['3·7','7·3'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'32', svar:'4·8', accept:['4·8','8·4','2·16','16·2'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'24', svar:'4·6', accept:['4·6','6·4','3·8','8·3','2·12','12·2'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'18', svar:'2·9', accept:['2·9','9·2','3·6','6·3'], placeholder:'två faktorer'}
    ]},
    {rubrik:'Vilka primfaktorer saknas i faktoriseringen?', rader:[
      {typ:'uttryck', fraga:'20 = 2 · 2 · ___', svar:'5', accept:['5'], placeholder:'tal'},
      {typ:'uttryck', fraga:'84 = 2 · 2 · ___ · 7', svar:'3', accept:['3'], placeholder:'tal'},
      {typ:'uttryck', fraga:'63 = ___ · ___ · 7  (skriv båda)', svar:'3·3', accept:['3·3'], placeholder:'två tal'},
      {typ:'uttryck', fraga:'150 = 2 · 3 · ___ · ___  (skriv båda)', svar:'5·5', accept:['5·5'], placeholder:'två tal'}
    ]},
    {rubrik:'Vilket tal har faktoriserats?', rader:[
      {typ:'enkel', vansterText:'2 · 2 · 2 · 3', svar:24},
      {typ:'enkel', vansterText:'3 · 3 · 5 · 5', svar:225},
      {typ:'enkel', vansterText:'2 · 3 · 17',    svar:102}
    ]},
    {rubrik:'Vilka tal är jämnt delbara med 4 och 5?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla som är delbara med både 4 och 5:', alt:['45','60','18','160','28','99','140','300','8','135','83','640'], ratt:['60','160','140','300','640']}
    ]},
    {rubrik:'Vilka tal är primtal?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla primtal:', alt:['3','9','11','17','23','27','33','37'], ratt:['3','11','17','23','37']}
    ]},
    {rubrik:'Vilka tal är jämnt delbara med 3 och 5?', rader:[
      {typ:'valruta', flera:true, fraga:'Markera alla som är delbara med både 3 och 5:', alt:['60','95','81','180','330','5','127'], ratt:['60','180','330']}
    ]},
    {rubrik:'Primtalsfaktorisera med faktorträd (skriv som produkt, t.ex. 2·2·3)', rader:[
      {typ:'uttryck', likhet:true, fraga:'24', svar:'2·2·2·3', accept:['2·2·2·3','3·2·2·2','2·3·2·2','2·2·3·2'], placeholder:'primfaktorer'},
      {typ:'uttryck', likhet:true, fraga:'40', svar:'2·2·2·5', accept:['2·2·2·5','5·2·2·2','2·5·2·2','2·2·5·2'], placeholder:'primfaktorer'},
      {typ:'uttryck', likhet:true, fraga:'60', svar:'2·2·3·5', accept:['2·2·3·5','2·2·5·3','3·2·2·5','5·2·2·3','2·3·2·5','2·5·2·3'], placeholder:'primfaktorer'}
    ]},
    {rubrik:'Skriv tre tal som är delbara med 2, 3, 4 och 5', rader:[
      {typ:'uttryck', fraga:'Tal 1 (delbart med 2, 3, 4 och 5):', svar:'60', accept:['60','120','180','240','300','360','420','480','540','600'], placeholder:'ett tal'},
      {typ:'uttryck', fraga:'Tal 2:', svar:'120', accept:['60','120','180','240','300','360','420','480','540','600'], placeholder:'ett tal'},
      {typ:'uttryck', fraga:'Tal 3:', svar:'180', accept:['60','120','180','240','300','360','420','480','540','600'], placeholder:'ett tal'}
    ]}
  ]
};
var EGEN_VARIANTER = { A:EGEN_A, B:EGEN_B };
function byggEgenskaper(variant){ bygg_blad(document.getElementById('sheet-egenskaper'), EGEN_VARIANTER[variant] || EGEN_A); }
// ---- STORLEK OCH ORDNING: två stenciler (A lättare, B svårare, B låses upp efter A) ----
var STORLEK_A = {
  titel:'Storlek och ordning – Stencil A',
  intro:'Träna på tiohopp, tallinjer, tiondelar och talföljder. Skriv decimaltal med komma. Tryck sedan på Kontrollera. Klara minst 80 % för att låsa upp Stencil B.',
  grupper:[
    {rubrik:'Gör tre 10-hopp framåt för varje tal', rader:[
      {typ:'talfoljd', termer:[980, null, null, null],  facit:[null,990,1000,1010]},
      {typ:'talfoljd', termer:[4997, null, null, null], facit:[null,5007,5017,5027]}
    ]},
    {rubrik:'Gör tre 10-hopp bakåt för varje tal', rader:[
      {typ:'talfoljd', termer:[527, null, null, null],   facit:[null,517,507,497]},
      {typ:'talfoljd', termer:[10025, null, null, null], facit:[null,10015,10005,9995]}
    ]},
    {rubrik:'Vilka tal pekar pilarna på?', rader:[
      {typ:'tallinje', min:0, max:140,
        streck:[{v:0,lang:true,etikett:0},{v:20},{v:40},{v:60},{v:80},{v:100,lang:true,etikett:100},{v:120},{v:140}],
        pilar:[{namn:'A',v:20},{namn:'B',v:60},{namn:'C',v:120}]},
      {typ:'tallinje', min:0, max:160,
        streck:[{v:0,lang:true,etikett:0},{v:20},{v:40},{v:60},{v:80},{v:100,lang:true,etikett:100},{v:120},{v:140},{v:160}],
        pilar:[{namn:'A',v:40},{namn:'B',v:60},{namn:'C',v:120}]}
    ]},
    {rubrik:'Skriv det tal som är en tiondel större än', rader:[
      {typ:'enkel', vansterText:'46,7',  svar:46.8},
      {typ:'enkel', vansterText:'534',   svar:534.1},
      {typ:'enkel', vansterText:'12,93', svar:13.03}
    ]},
    {rubrik:'Gör tre 0,4-hopp framåt för varje tal', rader:[
      {typ:'talfoljd', termer:[0.35, null, null, null], facit:[null,0.75,1.15,1.55]},
      {typ:'talfoljd', termer:[4.57, null, null, null], facit:[null,4.97,5.37,5.77]}
    ]},
    {rubrik:'Vilka tal pekar pilarna på?', rader:[
      {typ:'tallinje', min:0, max:14,
        streck:[{v:0,lang:true,etikett:0},{v:2},{v:4},{v:6},{v:8},{v:10,lang:true,etikett:10},{v:12},{v:14}],
        pilar:[{namn:'A',v:2},{namn:'B',v:4},{namn:'C',v:13}]},
      {typ:'tallinje', min:0, max:1.4,
        streck:[{v:0,lang:true,etikett:0},{v:0.2},{v:0.4},{v:0.5,lang:true,etikett:'0,5'},{v:0.6},{v:0.8},{v:1,lang:true,etikett:1},{v:1.2},{v:1.4}],
        pilar:[{namn:'A',v:0.1},{namn:'B',v:0.7},{namn:'C',v:1.1}]}
    ]},
    {rubrik:'Gör tre 0,4-hopp bakåt för varje tal', rader:[
      {typ:'talfoljd', termer:[30.75, null, null, null], facit:[null,30.35,29.95,29.55]},
      {typ:'talfoljd', termer:[5.72, null, null, null],  facit:[null,5.32,4.92,4.52]}
    ]},
    {rubrik:'Skriv de två talen som kommer i talföljden', rader:[
      {typ:'talfoljd', termer:[0.4, 0.6, 0.8, null, null],  facit:[null,null,null,1.0,1.2]},
      {typ:'talfoljd', termer:[3.75, 3.50, 3.25, null, null], facit:[null,null,null,3.0,2.75]},
      {typ:'talfoljd', termer:[0.41, 0.44, 0.47, null, null], facit:[null,null,null,0.50,0.53]},
      {typ:'talfoljd', termer:[0.2, 0.5, 0.8, null, null],  facit:[null,null,null,1.1,1.4]}
    ]},
    {rubrik:'Skriv talen i storleksordning, börja med det minsta', rader:[
      {typ:'ordna', tal:[6.5, 6.168, 6.17, 6.105]}
    ]}
  ]
};

var STORLEK_B = {
  titel:'Storlek och ordning – Stencil B',
  intro:'Lite svårare uppgifter: mindre steg, fler tal att ordna och tal nära varandra. Skriv decimaltal med komma.',
  grupper:[
    {rubrik:'Skriv talen i storleksordning, börja med det minsta', rader:[
      {typ:'ordna', tal:[0.46, 0.4, 0.09, 3.895]}
    ]},
    {rubrik:'Vilket tal är en hundradel mindre än', rader:[
      {typ:'enkel', vansterText:'7',     svar:6.99},
      {typ:'enkel', vansterText:'16,3',  svar:16.29},
      {typ:'enkel', vansterText:'9,206', svar:9.196}
    ]},
    {rubrik:'Ordna talen i storleksordning, börja med det minsta', rader:[
      {typ:'ordna', tal:[0.18, 0.1, 0.2, 1.7, 0.15, 2]}
    ]},
    {rubrik:'Vilket tal är en tusendel mindre än', rader:[
      {typ:'enkel', vansterText:'2',    svar:1.999},
      {typ:'enkel', vansterText:'2000', svar:1999.999},
      {typ:'enkel', vansterText:'0,57', svar:0.569}
    ]},
    {rubrik:'Vilka tal pekar pilarna på?', rader:[
      {typ:'tallinje', min:0, max:0.015,
        streck:[{v:0,lang:true,etikett:0},{v:0.0025},{v:0.005,lang:true,etikett:'0,005'},{v:0.0075},{v:0.01,lang:true,etikett:'0,01'},{v:0.0125},{v:0.015,lang:true,etikett:'0,015'}],
        pilar:[{namn:'A',v:0.001},{namn:'B',v:0.007},{namn:'C',v:0.013}]},
      {typ:'tallinje', min:0.01, max:0.026,
        streck:[{v:0.01,lang:true,etikett:'0,01'},{v:0.012},{v:0.014},{v:0.016},{v:0.018},{v:0.02,lang:true,etikett:'0,02'},{v:0.022},{v:0.024},{v:0.026}],
        pilar:[{namn:'A',v:0.012},{namn:'B',v:0.016},{namn:'C',v:0.022}]}
    ]},
    {rubrik:'Ordna talen i storleksordning, börja med det minsta', rader:[
      {typ:'ordna', tal:[1.05, 0.457, 0.9, 1.3, 0.10, 0.01]}
    ]},
    {rubrik:'Skriv ett tal som är', rader:[
      {typ:'intervall', enkelt:true, vansterText:'större än 9,9 men mindre än 10',    min:9.9, max:10},
      {typ:'intervall', enkelt:true, vansterText:'större än 10 men mindre än 10,01', min:10, max:10.01}
    ]}
  ]
};

// Stencil-låsning: B låses upp när A klarats till minst 80 %
var STORLEK_LAST_UPP = false;
STORLEK_A.onResultat = function(ratt, totalt){
  if(!STORLEK_LAST_UPP && totalt>0 && (ratt/totalt) >= 0.8){
    STORLEK_LAST_UPP = true;
    var bB = document.getElementById('stencil-btn-B');
    bB.disabled = false; bB.classList.remove('is-locked'); bB.textContent = 'Stencil B';
    var info = document.getElementById('stencil-info');
    info.textContent = 'Bra jobbat! Stencil B är upplåst.';
    info.classList.add('klar');
  }
};
function byggStorlek(stencil){
  bygg_blad(document.getElementById('sheet-storlek'), stencil==='B' ? STORLEK_B : STORLEK_A);
}
var POSRAK_A = {
  titel:'Räkna i positionssystemet – Blad A', stegvis:true,
  intro:'Träna på huvudräkning med tiondelar och hundradelar, platsövergångar och tal som ligger mittemellan. Skriv decimaltal med komma. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Skriv två tal inom varje intervall', rader:[
      {typ:'intervall', vansterText:'mellan 2,5 och 2,7', min:2.5, max:2.7},
      {typ:'intervall', vansterText:'mellan 99 och 100',  min:99,  max:100},
      {typ:'intervall', vansterText:'mellan 0,28 och 0,29', min:0.28, max:0.29}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'0,8 + 0,3',  svar:1.1},
      {typ:'enkel', vansterText:'0,1 + 3,9',  svar:4},
      {typ:'enkel', vansterText:'0,1 + 6,98', svar:7.08}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'16,835 − 0,1', svar:16.735},
      {typ:'enkel', vansterText:'1,13 − 0,1',   svar:1.03},
      {typ:'enkel', vansterText:'1,06 − 0,1',   svar:0.96}
    ]},
    {rubrik:'Vilket tal ska stå i rutan?', rader:[
      {typ:'enkel', vansterText:'345 − ___ = 340',   svar:5},
      {typ:'enkel', vansterText:'5678 − ___ = 678',  svar:5000},
      {typ:'enkel', vansterText:'2354 − ___ = 2304', svar:50}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'5,235 − 0,01',  svar:5.225},
      {typ:'enkel', vansterText:'0,01 + 3,99',   svar:4},
      {typ:'enkel', vansterText:'0,01 + 6998',   svar:6998.01}
    ]},
    {rubrik:'Vilket tal är 7 tiondelar större än …', rader:[
      {typ:'enkel', vansterText:'11,6', svar:12.3},
      {typ:'enkel', vansterText:'9,57', svar:10.27}
    ]},
    {rubrik:'Vilket tal ska stå i rutan?', rader:[
      {typ:'enkel', vansterText:'5891 − ___ = 5741', svar:150},
      {typ:'enkel', vansterText:'9389 − ___ = 8989', svar:400},
      {typ:'enkel', vansterText:'8576 − ___ = 1200', svar:7376}
    ]},
    {rubrik:'Vilket tal ligger mittemellan …', rader:[
      {typ:'enkel', vansterText:'5,7 och 5,8',   svar:5.75},
      {typ:'enkel', vansterText:'0,13 och 0,14', svar:0.135},
      {typ:'enkel', vansterText:'245 och 246',   svar:245.5}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'15,835 − 0,01', svar:15.825},
      {typ:'enkel', vansterText:'13 − 0,01',     svar:12.99},
      {typ:'enkel', vansterText:'1,006 − 0,01',  svar:0.996}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'0,6 + 0,55',  svar:1.15},
      {typ:'enkel', vansterText:'1 − 0,2',     svar:0.8},
      {typ:'enkel', vansterText:'3 − 1,7',     svar:1.3},
      {typ:'enkel', vansterText:'0,86 + 1,05', svar:1.91},
      {typ:'enkel', vansterText:'2,75 − 1,3',  svar:1.45}
    ]},
    {rubrik:'Vilket tal ligger mittemellan …', rader:[
      {typ:'enkel', vansterText:'1,45 och 1,4', svar:1.425},
      {typ:'enkel', vansterText:'0,69 och 0,8', svar:0.745}
    ]}
  ]
};

var POSRAK_B = {
  titel:'Räkna i positionssystemet – Blad B', stegvis:true,
  intro:'Samma slags uppgifter som Blad A, men med andra tal. Skriv decimaltal med komma. Tryck sedan på Kontrollera.',
  grupper:[
    {rubrik:'Skriv två tal inom varje intervall', rader:[
      {typ:'intervall', vansterText:'mellan 3,4 och 3,6', min:3.4, max:3.6},
      {typ:'intervall', vansterText:'mellan 49 och 50',   min:49,  max:50},
      {typ:'intervall', vansterText:'mellan 0,71 och 0,72', min:0.71, max:0.72}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'0,7 + 0,5',  svar:1.2},
      {typ:'enkel', vansterText:'0,1 + 2,9',  svar:3},
      {typ:'enkel', vansterText:'0,1 + 5,97', svar:6.07}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'24,617 − 0,1', svar:24.517},
      {typ:'enkel', vansterText:'1,28 − 0,1',   svar:1.18},
      {typ:'enkel', vansterText:'1,04 − 0,1',   svar:0.94}
    ]},
    {rubrik:'Vilket tal ska stå i rutan?', rader:[
      {typ:'enkel', vansterText:'672 − ___ = 670',   svar:2},
      {typ:'enkel', vansterText:'4583 − ___ = 583',  svar:4000},
      {typ:'enkel', vansterText:'3471 − ___ = 3421', svar:50}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'7,142 − 0,01',  svar:7.132},
      {typ:'enkel', vansterText:'0,01 + 2,99',   svar:3},
      {typ:'enkel', vansterText:'0,01 + 4997',   svar:4997.01}
    ]},
    {rubrik:'Vilket tal är 7 tiondelar större än …', rader:[
      {typ:'enkel', vansterText:'14,8', svar:15.5},
      {typ:'enkel', vansterText:'8,46', svar:9.16}
    ]},
    {rubrik:'Vilket tal ska stå i rutan?', rader:[
      {typ:'enkel', vansterText:'6742 − ___ = 6532', svar:210},
      {typ:'enkel', vansterText:'8265 − ___ = 7865', svar:400},
      {typ:'enkel', vansterText:'9341 − ___ = 1500', svar:7841}
    ]},
    {rubrik:'Vilket tal ligger mittemellan …', rader:[
      {typ:'enkel', vansterText:'6,3 och 6,4',   svar:6.35},
      {typ:'enkel', vansterText:'0,21 och 0,22', svar:0.215},
      {typ:'enkel', vansterText:'381 och 382',   svar:381.5}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'23,914 − 0,01', svar:23.904},
      {typ:'enkel', vansterText:'17 − 0,01',     svar:16.99},
      {typ:'enkel', vansterText:'1,004 − 0,01',  svar:0.994}
    ]},
    {rubrik:'Räkna med huvudräkning', rader:[
      {typ:'enkel', vansterText:'0,7 + 0,45',  svar:1.15},
      {typ:'enkel', vansterText:'1 − 0,4',     svar:0.6},
      {typ:'enkel', vansterText:'4 − 2,6',     svar:1.4},
      {typ:'enkel', vansterText:'0,78 + 1,04', svar:1.82},
      {typ:'enkel', vansterText:'3,65 − 1,2',  svar:2.45}
    ]},
    {rubrik:'Vilket tal ligger mittemellan …', rader:[
      {typ:'enkel', vansterText:'2,35 och 2,3', svar:2.325},
      {typ:'enkel', vansterText:'0,58 och 0,7', svar:0.64}
    ]}
  ]
};
var POSRAK_VARIANTER = { A:POSRAK_A, B:POSRAK_B };
function byggPosrak(variant){ bygg_blad(document.getElementById('sheet-positionsrakning'), POSRAK_VARIANTER[variant] || POSRAK_A); }

// ============================================================
// Bygg upp bladen
// ============================================================
var TIO_VARIANTER = { A:TIO_A, B:TIO_B };
function byggTiosystemet(variant){
  bygg_blad(document.getElementById('sheet-tiosystemet'), TIO_VARIANTER[variant] || TIO_A);
}
byggTiosystemet('A');
byggEgenskaper('A');
byggStorlek('A');
byggPosrak('A');

// variantväxling
// Stencil-knappar (A/B med lås)
document.querySelectorAll('[data-stencil]').forEach(function(btn){
  btn.addEventListener('click', function(){
    if(btn.disabled) return;
    document.querySelectorAll('[data-stencil]').forEach(function(b){ b.classList.remove('is-active'); });
    btn.classList.add('is-active');
    byggStorlek(btn.dataset.stencil);
  });
});
document.querySelectorAll('.variant-btn[data-sheet]').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.variant-btn[data-sheet="'+btn.dataset.sheet+'"]').forEach(function(b){ b.classList.remove('is-active'); });
    btn.classList.add('is-active');
    if(btn.dataset.sheet==='tiosystemet') byggTiosystemet(btn.dataset.variant);
    if(btn.dataset.sheet==='egenskaper') byggEgenskaper(btn.dataset.variant);
    if(btn.dataset.sheet==='positionsrakning') byggPosrak(btn.dataset.variant);
  });
});

