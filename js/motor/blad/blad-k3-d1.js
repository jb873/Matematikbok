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
// ÖVNINGSMOTOR – ligger i den delade kärnan blad-karna-b.js
// (heltals-släkten; laddas FÖRE denna fil). Här finns bara bladets
// egna generatorer och uppgiftsdata. Radtyper: se kärnan.
// ============================================================
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
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'x+3', accept:['x+3','3+x'],
       svg:'<svg viewBox="0 0 320 70" width="320" height="70" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="22" x2="290" y2="22" stroke="#c0392b" stroke-width="3"/><line x1="30" y1="16" x2="30" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="290" y1="16" x2="290" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="30" y1="48" x2="180" y2="48" stroke="#333" stroke-width="2"/><line x1="180" y1="48" x2="290" y2="48" stroke="#333" stroke-width="2"/><line x1="30" y1="42" x2="30" y2="54" stroke="#333" stroke-width="2"/><line x1="180" y1="42" x2="180" y2="54" stroke="#333" stroke-width="2"/><line x1="290" y1="42" x2="290" y2="54" stroke="#333" stroke-width="2"/><text x="105" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="235" y="65" text-anchor="middle" font-size="14" font-style="italic">3</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'x+4', accept:['x+4','4+x'],
       svg:'<svg viewBox="0 0 320 70" width="320" height="70" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="22" x2="290" y2="22" stroke="#c0392b" stroke-width="3"/><line x1="30" y1="16" x2="30" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="290" y1="16" x2="290" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="30" y1="48" x2="110" y2="48" stroke="#333" stroke-width="2"/><line x1="110" y1="48" x2="290" y2="48" stroke="#333" stroke-width="2"/><line x1="30" y1="42" x2="30" y2="54" stroke="#333" stroke-width="2"/><line x1="110" y1="42" x2="110" y2="54" stroke="#333" stroke-width="2"/><line x1="290" y1="42" x2="290" y2="54" stroke="#333" stroke-width="2"/><text x="70" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="200" y="65" text-anchor="middle" font-size="14" font-style="italic">4</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'3x', accept:['3x','x+x+x'],
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
      {typ:'bild', svarTyp:'uttryck', fraga:'Triangel:  omkrets =', svar:'12x', accept:['12x','3x+5x+4x'],
       svg:'<svg viewBox="0 0 200 150" width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="40,120 40,40 150,120" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="26" y="82" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">3x</text><text x="105" y="74" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">5x</text><text x="95" y="138" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">4x</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Rektangel:  omkrets =', svar:'8x', accept:['8x','3x+x+3x+x'],
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

