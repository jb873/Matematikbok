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
    {rubrik:'Faktorisera talet i två faktorer', rader:[
      {typ:'uttryck', likhet:true, fraga:'15', svar:'3·5', accept:['3·5','5·3'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'27', svar:'3·9', accept:['3·9','9·3'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'36', svar:'6·6', accept:['6·6','4·9','9·4','3·12','12·3','2·18','18·2'], placeholder:'två faktorer'},
      {typ:'uttryck', likhet:true, fraga:'12', svar:'3·4', accept:['3·4','4·3','2·6','6·2'], placeholder:'två faktorer'}
    ]},
    {rubrik:'Vilka primfaktorer saknas i faktoriseringen?', rader:[
      {typ:'uttryck', fraga:'28 = 2 · 2 · ___', svar:'7', accept:['7'], placeholder:'tal'},
      {typ:'uttryck', fraga:'60 = 2 · 2 · ___ · 5', svar:'3', accept:['3'], placeholder:'tal'},
      {typ:'uttryck', fraga:'45 = ___ · ___ · 5  (skriv båda)', svar:'3·3', accept:['3·3'], placeholder:'två tal'},
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
    {rubrik:'Faktorisera talet i två faktorer', rader:[
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

