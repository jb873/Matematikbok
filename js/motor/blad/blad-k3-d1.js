/* blad-k3-d1.js — UPPGIFTSDATA för åk7 · kapitel 3 · delkapitel 1 "Algebraiska uttryck".
   Ren data. Sidan monteras av DelkapitelSkal (js/motor/blad/delkapitel-skal.js): flikväxling,
   blad-nav och färdighetshubben ligger i skalet, föreläsningen i föreläsningsregistret
   (js/data/forelasningar.js). Den här filen kan därför laddas var som helst — ramen läser
   talbanken utan att rendera något (jfr blad-k2-d5.js).

   TALBANK: BLAD_K3_D1.talBank(nod) ger testets tal ur ÖVA-bladens data, samma metod som k2:
   ÖVA äger talen, testet hämtar dem. Radtyperna ligger i blad-karna-b.js (heltals-släkten). */
(function(){
'use strict';

// Noder (k3-taxonomin). Loggen sätts per grupp längst ned — varje blad matar sin nod.
var NOD_SKRIVA  = 'alg-skriva:kommunikation';
var NOD_TOLKA   = 'alg-tolka:begrepp';
var NOD_BERAKNA = 'alg-berakna:rakna';

var BLAD_SKRIVA = {
  titel:'Skriva uttryck',
  grupper:[
    {rubrik:'Nora har x stycken kapsyler. Välj det uttryck som visar hur många kapsyler Nora har om', rader:[
      {typ:'valruta', fraga:'hon får fyra nya kapsyler', alt:['x − 4','x + 4','4x'], ratt:['x+4']},
      {typ:'valruta', fraga:'hon ger bort tre kapsyler', alt:['x − 3','3x','x + 3'], ratt:['x-3']},
      {typ:'valruta', fraga:'hon får dubbelt så många till', alt:['2x','3x','x/2'], ratt:['2x']}
    ]},
    {rubrik:'Skriv ett uttryck för längden av den röda sträckan', rader:[
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'x+3', accept:['x+3','3+x'],
       svg:'<svg viewBox="0 0 320 70" width="320" height="70" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="22" x2="290" y2="22" stroke="#c0392b" stroke-width="3"/><line x1="30" y1="16" x2="30" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="290" y1="16" x2="290" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="30" y1="48" x2="180" y2="48" stroke="#333" stroke-width="2"/><line x1="180" y1="48" x2="290" y2="48" stroke="#333" stroke-width="2"/><line x1="30" y1="42" x2="30" y2="54" stroke="#333" stroke-width="2"/><line x1="180" y1="42" x2="180" y2="54" stroke="#333" stroke-width="2"/><line x1="290" y1="42" x2="290" y2="54" stroke="#333" stroke-width="2"/><text x="105" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="235" y="65" text-anchor="middle" font-size="14" font-style="italic">3</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'x+4', accept:['x+4','4+x'],
       svg:'<svg viewBox="0 0 320 70" width="320" height="70" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="22" x2="290" y2="22" stroke="#c0392b" stroke-width="3"/><line x1="30" y1="16" x2="30" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="290" y1="16" x2="290" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="30" y1="48" x2="110" y2="48" stroke="#333" stroke-width="2"/><line x1="110" y1="48" x2="290" y2="48" stroke="#333" stroke-width="2"/><line x1="30" y1="42" x2="30" y2="54" stroke="#333" stroke-width="2"/><line x1="110" y1="42" x2="110" y2="54" stroke="#333" stroke-width="2"/><line x1="290" y1="42" x2="290" y2="54" stroke="#333" stroke-width="2"/><text x="70" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="200" y="65" text-anchor="middle" font-size="14" font-style="italic">4</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Röda sträckan =', svar:'3x', accept:['3x','x+x+x'],
       svg:'<svg viewBox="0 0 320 70" width="320" height="70" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="22" x2="290" y2="22" stroke="#c0392b" stroke-width="3"/><line x1="30" y1="16" x2="30" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="290" y1="16" x2="290" y2="28" stroke="#c0392b" stroke-width="2"/><line x1="30" y1="48" x2="290" y2="48" stroke="#333" stroke-width="2"/><line x1="30" y1="42" x2="30" y2="54" stroke="#333" stroke-width="2"/><line x1="117" y1="42" x2="117" y2="54" stroke="#333" stroke-width="2"/><line x1="204" y1="42" x2="204" y2="54" stroke="#333" stroke-width="2"/><line x1="290" y1="42" x2="290" y2="54" stroke="#333" stroke-width="2"/><text x="73" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="160" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text><text x="247" y="65" text-anchor="middle" font-size="14" font-style="italic">x</text></svg>'}
    ]},
    {rubrik:'Tilde är a cm lång. Skriv ett uttryck för längden av en person som är', rader:[
      {typ:'uttryck', fraga:'10 cm längre än Tilde', svar:'a+10', accept:['a+10','10+a']},
      {typ:'uttryck', fraga:'18 cm kortare än Tilde', svar:'a−18', accept:['a-18']},
      {typ:'uttryck', fraga:'dubbelt så lång som Tilde', svar:'2a', accept:['2a','a·2','a+a']},
      {typ:'uttryck', fraga:'hälften så lång som Tilde', svar:'a/2', accept:['a/2']}
    ]},
    {rubrik:'Elsa är x år gammal', rader:[
      {typ:'uttryck', fraga:'Elsas bror är 2 år äldre än henne. Skriv ett uttryck för broderns ålder.', svar:'x+2', accept:['x+2','2+x']},
      {typ:'uttryck', fraga:'Elsas syster är dubbelt så gammal som Elsa. Skriv ett uttryck för systerns ålder.', svar:'2x', accept:['2x','x·2','x+x']},
      {typ:'uttryck', fraga:'Skriv ett uttryck för syskonens sammanlagda ålder (Elsa + bror + syster).', svar:'4x+2', accept:['4x+2','2+4x']}
    ]},
    {rubrik:'Vilket eller vilka uttryck beskriver kvadratens omkrets? (sidan är x)', rader:[
      {typ:'valruta', flera:true, fraga:'Välj alla som stämmer:', alt:['4x','4 · x','4 + x','x + x + x + x'], ratt:['4x','4·x','x+x+x+x']}
    ]},
    {rubrik:'Skriv ett uttryck för figurens omkrets och förenkla det', rader:[
      {typ:'bild', svarTyp:'uttryck', fraga:'Triangel:  omkrets =', svar:'12x', sidor:['3x','5x','4x'], vars:'x', accept:['12x','3x+5x+4x'],
       svg:'<svg viewBox="0 0 200 150" width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="40,120 40,40 150,120" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="26" y="82" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">3x</text><text x="105" y="74" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">5x</text><text x="95" y="138" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">4x</text></svg>'},
      {typ:'bild', svarTyp:'uttryck', fraga:'Rektangel:  omkrets =', svar:'8x', sidor:['3x','x','3x','x'], vars:'x', accept:['8x','3x+x+3x+x'],
       svg:'<svg viewBox="0 0 220 120" width="220" height="120" xmlns="http://www.w3.org/2000/svg"><rect x="45" y="35" width="130" height="52" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="110" y="28" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">3x</text><text x="110" y="104" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">3x</text><text x="33" y="65" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">x</text><text x="187" y="65" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">x</text></svg>'}
    ]},
    {rubrik:'Para ihop genom att skriva rätt uttryck', rader:[
      {typ:'uttryck', fraga:'5 mer än b', svar:'b+5', accept:['b+5','5+b']},
      {typ:'uttryck', fraga:'Hälften så mycket som b', svar:'b/2', accept:['b/2']},
      {typ:'uttryck', fraga:'Dubbelt så mycket som b', svar:'2b', accept:['2b','b·2','b+b']},
      {typ:'uttryck', fraga:'5 mindre än b', svar:'b−5', accept:['b-5']}
    ]},
    {rubrik:'En glass kostar x kr, en läsk kostar 5 kr mer än glassen och en smörgås kostar 10 kr mer än glassen', rader:[
      {typ:'uttryck', fraga:'Skriv ett uttryck för vad en glass, en läsk och en smörgås kostar sammanlagt (förenklat).', svar:'3x+15', accept:['3x+15','15+3x']},
      {typ:'enkel', vansterText:'Om allt tillsammans kostar 60 kr, vad kostar en glass? (kr)', svar:15}
    ]}
  ]
};

var BLAD_TOLKA = {
  titel:'Tolka uttryck',
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

var BLAD_BERAKNA = {
  titel:'Beräkna med uttryck',
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

// ── Evidens: varje grupp loggar till sitt bladnod i MasteryK3 (opt-in via data-logg i kärnan) ──
[[BLAD_SKRIVA, NOD_SKRIVA], [BLAD_TOLKA, NOD_TOLKA], [BLAD_BERAKNA, NOD_BERAKNA]].forEach(function(par){
  (par[0].grupper || []).forEach(function(g){ g.logg = g.logg || par[1]; g.loggStore = 'k3'; });
});

// ── TALBANK — testets tal ur ÖVA-bladens data (order 2026-09-23) ──────────────────────────────
// En post per uppgift, med det som testgeneratorn behöver: uppgiftstexten, facit och (för
// beräkna-bladet) mellanleden. Texten är öva-bladets egen — testet frågar samma sak.
var BANK = (function(){
  var b = {};
  function lagg(nod, post){ (b[nod] = b[nod] || []).push(post); }

  (BLAD_SKRIVA.grupper || []).forEach(function(g){
    (g.rader || []).forEach(function(r){
      if(r.typ === 'uttryck' && r.svar) lagg(NOD_SKRIVA, { slag: 'uttryck', stam: g.rubrik, fraga: r.fraga, svar: r.svar, accept: (r.accept || []).slice() });
      else if(r.typ === 'bild' && r.svarTyp === 'uttryck' && r.svar) lagg(NOD_SKRIVA, { slag: 'figur', stam: g.rubrik, fraga: r.fraga, svar: r.svar, accept: (r.accept || []).slice(), svg: r.svg || '' });
      else if(r.typ === 'enkel' && typeof r.svar === 'number') lagg(NOD_SKRIVA, { slag: 'varde', stam: g.rubrik, fraga: r.vansterText, svar: r.svar });
      else if(r.typ === 'valruta' && !r.flera && r.alt && r.ratt && r.ratt.length === 1) lagg(NOD_SKRIVA, { slag: 'val', stam: g.rubrik, fraga: r.fraga, alt: r.alt.slice(), ratt: r.ratt[0] });
      else if(r.typ === 'valruta' && r.flera && r.alt && r.ratt) lagg(NOD_SKRIVA, { slag: 'flera', stam: g.rubrik, fraga: r.fraga, alt: r.alt.slice(), ratt: r.ratt.slice() });
    });
  });

  // Räkneord för alternativen (samma ord som bladet använder).
  var ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta'];
  function ordFor(n){ return ORD[n] || String(n); }
  // "tre glassar och två läsk" → ['tre','glassar','två','läsk']
  function delaSvar(txt){
    var m = String(txt).match(/^(\S+)\s+(.+?)\s+och\s+(\S+)\s+(.+)$/);
    return m ? { n1: m[1], v1: m[2], n2: m[3], v2: m[4] } : null;
  }
  // Fel-alternativ ur bladets egen mening: kasten om antalen, och ett antal för mycket.
  function felAlternativ(txt, koef){
    var d = delaSvar(txt); if(!d) return [];
    var ut = [];
    if(d.n1 !== d.n2) ut.push(d.n2 + ' ' + d.v1 + ' och ' + d.n1 + ' ' + d.v2);
    if(koef && koef[0]) ut.push(ordFor(koef[0] + 1) + ' ' + d.v1 + ' och ' + d.n2 + ' ' + d.v2);
    return ut.filter(function(x, i, a){ return x !== txt && a.indexOf(x) === i; });
  }

  (BLAD_TOLKA.grupper || []).forEach(function(g){
    // Gruppens uttryck står i bild-radens fråga ("… om uttrycket 3a + 2b beskriver kostnaden?").
    var uttryck = null, koef = null;
    (g.rader || []).forEach(function(r){
      if(uttryck || !r.fraga) return;
      var m = String(r.fraga).match(/uttrycket\s+(\d+\s*[a-z]\s*\+\s*\d+\s*[a-z])/i);
      if(m){ uttryck = m[1].replace(/\s+/g, ' ').trim();
             var k = uttryck.match(/(\d+)\s*[a-z]\s*\+\s*(\d+)\s*[a-z]/); if(k) koef = [parseInt(k[1], 10), parseInt(k[2], 10)]; }
    });
    (g.rader || []).forEach(function(r){
      if(r.typ === 'enkel' && typeof r.svar === 'number') lagg(NOD_TOLKA, { slag: 'varde', stam: g.rubrik, fraga: r.vansterText, svar: r.svar, uttryck: uttryck });
      else if(r.typ === 'uttryck' && r.svar) lagg(NOD_TOLKA, { slag: 'uttryck', stam: g.rubrik, fraga: r.fraga, svar: r.svar, accept: (r.accept || []).slice() });
      else if(r.typ === 'bild' && r.svarTyp === 'text' && r.svar) lagg(NOD_TOLKA, { slag: 'ord', stam: g.rubrik, fraga: r.fraga, svar: r.svar, uttryck: uttryck, fel: felAlternativ(r.svar, koef) });
    });
  });

  (BLAD_BERAKNA.grupper || []).forEach(function(g){
    (g.rader || []).forEach(function(r){
      if(r.typ !== 'flerled' || !r.led || !r.led.length) return;
      var sista = r.led[r.led.length - 1];
      if(typeof sista.svar !== 'number') return;
      var mellan = r.led.slice(0, -1).map(function(L){ return (L.visa || (L.accept && L.accept[0]) || '').trim(); }).filter(Boolean);
      // vansterHtml bär bladets staplade bråk — testet behöver samma uttryck som text (x/2 + 5).
      var uttryck = (r.vansterText || '').trim();
      if(!uttryck && r.vansterHtml){
        uttryck = String(r.vansterHtml)
          .replace(/<span class="brak"><span class="taljare">([^<]*)<\/span><span class="namnare">([^<]*)<\/span><\/span>/g, '$1/$2')
          .replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      }
      lagg(NOD_BERAKNA, { slag: 'flerled', stam: g.rubrik, uttryck: uttryck, mellan: mellan, svar: sista.svar });
    });
  });
  return b;
})();

window.BLAD_K3_D1 = {
  skriva:  BLAD_SKRIVA,
  tolka:   BLAD_TOLKA,
  berakna: BLAD_BERAKNA,
  noder:   { skriva: NOD_SKRIVA, tolka: NOD_TOLKA, berakna: NOD_BERAKNA },
  talBank: function(nod){ return (BANK[String(nod)] || []).slice(); }
};
})();
