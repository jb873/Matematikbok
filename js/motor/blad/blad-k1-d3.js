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
// ÖVNINGSMOTOR – ligger i den delade kärnan blad-karna-b.js
// (heltals-släkten; laddas FÖRE denna fil). Här finns bara bladets
// egna generatorer och uppgiftsdata. Radtyper: se kärnan.
// ============================================================
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

// --- 6 · FÖRDJUPNING II (Joachims blad: mult/div, stående bråk + decimaltal) ---
// Ligger VID SIDAN AV blad 5 i Fördjupning-panelen (egen flik i fordj-nav).
// Division skrivs som STÅENDE BRÅK (typ:'brak') – docx:ns m:f, aldrig platt '/'.
// Talen är Joachims exakta uppgifter ur Negativa tal.docx (oförändrade).
// Loggning: grupp 1–3 → neg-rakna:multdiv (åk7+åk8 mål). Grupp 4 (decimaler) → ingen
//   logg (loggSkal nedan) – fördjupning inom fördjupningen, ska ej mata mastery.
var BLAD_NEG_MULTDIV = {
  titel:'Multiplikation och division – stående bråk och decimaltal',
  intro:'Multiplikation och division med negativa tal. Division skrivs som stående bråk. Regeln: lika tecken ger plus, olika tecken ger minus. Skriv svaret med minustecken om det är negativt. Sista gruppen tar även med decimaltal – för dig som vill mer.',
  grupper:[
    {rubrik:'Multiplikation', logg:'neg-rakna:multdiv', rader:[
      {typ:'enkel', vansterText:'5 · (−8) =',     svar:-40},
      {typ:'enkel', vansterText:'4 · (−6) =',     svar:-24},
      {typ:'enkel', vansterText:'(−9) · (−3) =', svar:27},
      {typ:'enkel', vansterText:'(−2) · 12 =',    svar:-24},
      {typ:'enkel', vansterText:'(−7) · (−11) =', svar:77}
    ]},
    {rubrik:'Division', logg:'neg-rakna:multdiv', rader:[
      {typ:'brak', taljare:'36',        namnare:'−4', svar:-9},
      {typ:'brak', taljare:'−18',  namnare:'3',       svar:-6},
      {typ:'brak', taljare:'−24',  namnare:'−4', svar:6},
      {typ:'brak', taljare:'48',        namnare:'−8', svar:-6},
      {typ:'brak', taljare:'−81',  namnare:'−9', svar:9}
    ]},
    {rubrik:'Multiplikation och division blandat', logg:'neg-rakna:multdiv', rader:[
      {typ:'enkel', vansterText:'6 · (−3) =',      svar:-18},
      {typ:'brak', taljare:'72',        namnare:'−9',  svar:-8},
      {typ:'enkel', vansterText:'(−11) · (−5) =', svar:55},
      {typ:'brak', taljare:'−45',  namnare:'−5',  svar:9}
    ]},
    // Grupp 4: ingen logg (fördjupning inom fördjupningen).
    {rubrik:'Med decimaltal', logg:null,
      loggSkal:'Fördjupning inom fördjupningen – decimaler i multiplikation och division, för dem som vill mer. Ska inte mata mastery.',
      rader:[
      {typ:'enkel', vansterText:'(−0,2) · (−9) =', svar:1.8},
      {typ:'brak', taljare:'7',         namnare:'−2',   svar:-3.5},
      {typ:'enkel', vansterText:'0,3 · (−8) =',    svar:-2.4},
      {typ:'brak', taljare:'−12',  namnare:'−0,5', svar:24}
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
var _nmd = document.getElementById('sheet-negmultdiv');
if(_nmd) bygg_blad(_nmd, BLAD_NEG_MULTDIV);

