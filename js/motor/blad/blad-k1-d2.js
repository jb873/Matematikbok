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
// ÖVNINGSMOTOR – ligger i den delade kärnan blad-karna-b.js
// (heltals-släkten; laddas FÖRE denna fil). Här finns bara bladets
// egna generatorer och uppgiftsdata. Radtyper: se kärnan.
// ============================================================
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

