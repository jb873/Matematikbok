/* FAMILJ D · EKVATIONSMOTOR (balansmetod, egen parser) — ak7-k3-d4-ekvationer.html
   Byte-identiskt utbrutet (hela scriptet, logik orörd). Bespoke, delar inget med A/B/C.
   Test/Fördjupning-flikarna är innehålls-platshållare ("inte byggt än"), ej motorer. */
// ── Ekvationsparser ──
// Tolkar ett uttryck som "5x + 3" till {a: x-koefficient, b: konstant}
// Hanterar: tal, x med koefficient (5x, x, -x, 3x), +, -, mellanslag, enkel division (y/3 → men vi håller oss till x här)
function parseSida(str){
  str = String(str).replace(/\s+/g,'').replace(/\u2212/g,'-').replace(/·/g,'*').replace(/(\d),(\d)/g,'$1.$2');
  if(str==='') return null;
  // Hantera parentes-bråk från bråk-segment: (uttryck)/(uttryck)
  // Ersätt (A)/(B) med ett värde om båda är rena uttryck – men vi behöver behålla x.
  // Strategi: tolka hela strängen term för term, där en term kan vara (…)/(…).
  // Först: dela upp på toppnivå-+/- (utanför parenteser).
  var termer = delaTermer(str);
  if(!termer) return null;
  var a=0, b=0;
  for(var i=0;i<termer.length;i++){
    var res = tolkaTerm(termer[i]);
    if(!res) return null;
    a += res.a; b += res.b;
  }
  return {a:a, b:b};
}

// dela en sträng i termer på toppnivå (+/- utanför parenteser), varje term med tecken
function delaTermer(str){
  if(str[0]!=='+' && str[0]!=='-') str='+'+str;
  var termer=[], djup=0, start=0;
  for(var i=0;i<str.length;i++){
    var c=str[i];
    if(c==='(') djup++;
    else if(c===')') djup--;
    else if((c==='+'||c==='-') && djup===0 && i>0){
      termer.push(str.slice(start,i)); start=i;
    }
  }
  termer.push(str.slice(start));
  if(djup!==0) return null;
  return termer;
}

// tolka EN term (med ledande tecken) → {a, b}
function tolkaTerm(term){
  var tecken = term[0]==='-' ? -1 : 1;
  var kropp = term.replace(/^[+\-]/,'');
  if(kropp==='') return null;
  // division? hitta toppnivå-/
  var namnareStr=null, taljareStr=kropp, djup=0, slashPos=-1;
  for(var i=0;i<kropp.length;i++){
    if(kropp[i]==='(') djup++;
    else if(kropp[i]===')') djup--;
    else if(kropp[i]==='/' && djup===0){ slashPos=i; break; }
  }
  var namnare=1;
  if(slashPos>=0){
    taljareStr = kropp.slice(0,slashPos);
    namnareStr = kropp.slice(slashPos+1);
    // nämnaren måste vara ett rent tal (ev. inom parentes)
    var nStr = namnareStr.replace(/^\(|\)$/g,'');
    namnare = parseFloat(nStr);
    if(isNaN(namnare) || namnare===0) return null;
  }
  // täljaren kan vara (uttryck) eller enkelt – ta bort omslutande parentes
  var tStr = taljareStr.replace(/^\(|\)$/g,'');
  // täljaren kan själv innehålla +/- (t.ex. (5x+3)/5)
  var inreTermer = delaTermer(tStr);
  if(!inreTermer) return null;
  var a=0,b=0;
  for(var j=0;j<inreTermer.length;j++){
    var it = inreTermer[j];
    var itTecken = it[0]==='-' ? -1 : 1;
    var itKropp = it.replace(/^[+\-]/,'');
    if(itKropp.indexOf('x')>=0){
      var koef=itKropp.replace('x',''); if(koef==='')koef='1';
      var k=parseFloat(koef); if(isNaN(k))return null;
      a += itTecken*k;
    } else {
      var v=parseFloat(itKropp); if(isNaN(v))return null;
      b += itTecken*v;
    }
  }
  return {a: tecken*a/namnare, b: tecken*b/namnare};
}

// tolkar "VL = HL" → samlad form A·x = B (flytta allt till ena sidan)
// returnerar {A, B, losning} eller null vid ogiltigt
function parseEkvation(vl, hl){
  var L = parseSida(vl), H = parseSida(hl);
  if(!L || !H) return null;
  var A = L.a - H.a;     // x-koefficient samlad till vänster
  var B = H.b - L.b;     // konstant samlad till höger
  return {A:A, B:B};
}

// samma lösning? jämför A1·x=B1 mot A2·x=B2
// giltigt om båda har en unik lösning och den är samma, ELLER båda saknar/oändliga på samma sätt
function sammaLosning(e1, e2){
  if(!e1 || !e2) return false;
  var EPS=1e-9;
  var unik1 = Math.abs(e1.A)>EPS, unik2 = Math.abs(e2.A)>EPS;
  if(unik1 && unik2){
    return Math.abs(e1.B/e1.A - e2.B/e2.A) < EPS;
  }
  // om någon är 0=0 (alltid sann) eller 0=k (aldrig sann) – matcha bara om båda är samma typ
  if(!unik1 && !unik2){
    var sann1 = Math.abs(e1.B)<EPS, sann2 = Math.abs(e2.B)<EPS;
    return sann1===sann2;
  }
  return false;
}

function harUnikLosning(e){ return e && Math.abs(e.A)>1e-9; }
function losningAv(e){ return e.B/e.A; }
function snygg(tal){
  var r = Math.round(tal*1e6)/1e6;
  return String(r);
}

var NIVAER = [
  {
    id:'steg2', titel:'Grunderna',
    delar:[
      { id:'intro', rubrik:'Introduktion – lös en gång', genererar:false,
        info:'Repetition för att komma igång. Lös en gång, sedan är de avklarade.',
        uppg:[
          {vl:'5+x', hl:'8',  visaVL:'5 + <span class="x">x</span>', visaHL:'8'},
          {vl:'x-12', hl:'5', visaVL:'<span class="x">x</span> &minus; 12', visaHL:'5'},
          {vl:'4x', hl:'32',  visaVL:'4<span class="x">x</span>', visaHL:'32'},
          {vl:'5x', hl:'20',  visaVL:'5<span class="x">x</span>', visaHL:'20'},
          {vl:'(x)/(5)', hl:'3', visaVL:'BRAK:x:5', visaHL:'3'},
          {vl:'(x)/(4)', hl:'2', visaVL:'BRAK:x:4', visaHL:'2'}
        ]
      },
      { id:'grund', rubrik:'Lös ekvationerna med balansmetoden', genererar:true,
        info:'Nu finns flera steg innan x står ensamt. Ta gärna ett mellanled i taget.',
        uppg:[
          {vl:'5x+3', hl:'18', visaVL:'5<span class="x">x</span> + 3', visaHL:'18'},
          {vl:'6x-4', hl:'32', visaVL:'6<span class="x">x</span> &minus; 4', visaHL:'32'},
          {vl:'4x+9', hl:'37', visaVL:'4<span class="x">x</span> + 9', visaHL:'37'},
          {vl:'(x)/(2)+4', hl:'6', visaVL:'BRAK:x:2:+4', visaHL:'6'},
          {vl:'(x)/(3)-7', hl:'4', visaVL:'BRAK:x:3:-7', visaHL:'4'},
          {vl:'(x)/(6)-4', hl:'6', visaVL:'BRAK:x:6:-4', visaHL:'6'}
        ]
      },
      { id:'svar', rubrik:'Svårare uppgifter', genererar:true, laggTill:true,
        info:'Större tal, x kan stå till höger, och ibland decimaltal i svaret. Flytta så att x hamnar på vänster sida.',
        uppg:[
          {vl:'43', hl:'5x+18', visaVL:'43', visaHL:'5<span class="x">x</span> + 18'},
          {vl:'488', hl:'9x-43', visaVL:'488', visaHL:'9<span class="x">x</span> &minus; 43'},
          {vl:'(x)/(4)-3', hl:'18', visaVL:'BRAK:x:4:-3', visaHL:'18'},
          {vl:'29', hl:'(x)/(6)+8', visaVL:'29', visaHL:'BRAK:x:6:+8'},
          {vl:'10x-3,4', hl:'4,6', visaVL:'10<span class="x">x</span> &minus; 3,4', visaHL:'4,6'},
          {vl:'5,6+(x)/(6)', hl:'6', visaVL:'5,6 + BRAK:x:6', visaHL:'6'}
        ]
      }
    ]
  },
  {
    id:'steg3', titel:'Variabel i båda leden',
    delar:[
      { id:'grund', rubrik:'Lös ekvationerna med balansmetoden', genererar:true,
        info:'Nu står x på båda sidor. Samla x på den sida där det är störst, så slipper du minustal.',
        uppg:[
          {vl:'3x+5', hl:'x+11', visaVL:'3<span class="x">x</span> + 5', visaHL:'<span class="x">x</span> + 11'},
          {vl:'5x-3', hl:'3x+11', visaVL:'5<span class="x">x</span> &minus; 3', visaHL:'3<span class="x">x</span> + 11'},
          {vl:'7x+12', hl:'3x+24', visaVL:'7<span class="x">x</span> + 12', visaHL:'3<span class="x">x</span> + 24'},
          {vl:'7x-20', hl:'2x-10', visaVL:'7<span class="x">x</span> &minus; 20', visaHL:'2<span class="x">x</span> &minus; 10'}
        ]
      },
      { id:'svar', rubrik:'Svårare uppgifter', genererar:true, laggTill:true,
        info:'x på båda sidor med mer omflyttning. Samla x på vänster sida.',
        uppg:[
          {vl:'3x-4', hl:'7x-12', visaVL:'3<span class="x">x</span> &minus; 4', visaHL:'7<span class="x">x</span> &minus; 12'},
          {vl:'5+x', hl:'17-3x', visaVL:'5 + <span class="x">x</span>', visaHL:'17 &minus; 3<span class="x">x</span>'},
          {vl:'2x+7+3x', hl:'8+x+11', visaVL:'2<span class="x">x</span> + 7 + 3<span class="x">x</span>', visaHL:'8 + <span class="x">x</span> + 11'},
          {vl:'30-4x', hl:'15-x', visaVL:'30 &minus; 4<span class="x">x</span>', visaHL:'15 &minus; <span class="x">x</span>'}
        ]
      }
    ]
  }
];

var aktivNiva=0, aktivtFalt=null;
var card=document.getElementById('card');
var uppgifter=[];

// ── FLIKAR ──
// typ: 'forelasning' | 'ekvationer' (pekar på NIVAER-index via niva) | 'test' | 'fordjupning'
// grupp: 'grund' | 'fordjup' (för markering i flikraden)
var FLIKAR = [
  {id:'forel',  namn:'Föreläsningar', typ:'forelasning', grupp:'grund'},
  {id:'grund',  namn:'Grunderna', typ:'ekvationer', niva:0, grupp:'grund'},
  {id:'badaled',namn:'Variabel i båda leden', typ:'ekvationer', niva:1, grupp:'grund'},
  {id:'test1',  namn:'Test', typ:'test', grupp:'grund', las:true},
  {id:'ford1',  namn:'Tecken före parentes', typ:'fordjupning', grupp:'fordjup', las:true},
  {id:'ford2',  namn:'Siffra före parentes', typ:'fordjupning', grupp:'fordjup', las:true},
  {id:'test2',  namn:'Test', typ:'test', grupp:'fordjup', las:true}
];
var aktivFlik = 1; // starta på Grunderna

function renderFlikar(){
  var fr=document.getElementById('flikRad'); fr.innerHTML='';
  var forraGrupp=null;
  FLIKAR.forEach(function(f,i){
    if(forraGrupp==='grund' && f.grupp==='fordjup'){
      var avd=document.createElement('div'); avd.className='flik-avd'; avd.textContent='Fördjupning'; fr.appendChild(avd);
    }
    forraGrupp=f.grupp;
    var b=document.createElement('button');
    b.className='flik'+(i===aktivFlik?' aktiv':'')+(f.typ==='test'?' test-flik':'')+(f.grupp==='fordjup'?' fordjup':'')+(f.las?' last':'');
    b.innerHTML=f.namn + (f.las?'<span class="flik-las">🔒</span>':'');
    b.onclick=function(){ if(f.las){ return; } aktivFlik=i; renderFlikar(); visaFlik(); };
    fr.appendChild(b);
  });
}

function visaFlik(){
  var f=FLIKAR[aktivFlik];
  var actions=document.getElementById('actions'); actions.innerHTML='';
  document.getElementById('ghint').textContent=''; document.getElementById('ghint').className='global-hint';
  uppgifter=[]; aktivtFalt=null;
  if(f.typ==='ekvationer'){
    aktivNiva=f.niva;
    renderNiva();
    // bygg kontroll-knappar
    var kn=document.createElement('button'); kn.className='btn primary'; kn.textContent='Kontrollera alla'; kn.onclick=kontrolleraAlla;
    var rn=document.createElement('button'); rn.className='btn subtle'; rn.textContent='Börja om'; rn.onclick=function(){ var n=NIVAER[aktivNiva]; n.delar.forEach(function(d,di){ delete delStatus[n.id+'_'+di]; }); renderNiva(); };
    actions.appendChild(kn); actions.appendChild(rn);
  } else if(f.typ==='forelasning'){
    renderForelasning();
  } else if(f.typ==='test'){
    renderPlatshallare('Test', 'Här kommer ett test som sammanfattar avsnittet. Testuppgifterna är inte inlagda än.');
  } else if(f.typ==='fordjupning'){
    renderPlatshallare(f.namn, 'Den här fördjupningsdelen är inte byggd än – uppgifterna kommer senare.');
  }
}

function renderForelasning(){
  card.innerHTML='';
  var t=document.createElement('div'); t.className='niva-titel'; t.textContent='Föreläsningar'; card.appendChild(t);
  var r=document.createElement('div'); r.className='niva-rubrik'; r.textContent='Ekvationer med balansmetoden'; card.appendChild(r);
  var p=document.createElement('div'); p.className='niva-info';
  p.innerHTML='Här kommer föreläsningsfilmer och genomgångar om balansmetoden. Innehållet är inte inlagt än.';
  card.appendChild(p);
}
function renderPlatshallare(titel, text){
  card.innerHTML='';
  var t=document.createElement('div'); t.className='niva-titel'; t.textContent=titel; card.appendChild(t);
  var r=document.createElement('div'); r.className='niva-rubrik'; r.textContent=titel; card.appendChild(r);
  var p=document.createElement('div'); p.className='niva-info'; p.textContent=text; card.appendChild(p);
}

function brakHTML(taljare, namnare){
  return '<span class="seg-brak" style="font-size:19px;"><span style="font-style:italic;">'+taljare+'</span><span class="brak-streck" style="min-width:20px;"></span><span>'+namnare+'</span></span>';
}
function visaSida(spec){
  if(!spec) return spec;
  // Ren BRAK:t:n[:tillägg]
  if(spec.indexOf('BRAK:')===0 && spec.indexOf(' ')===-1){
    var d=spec.split(':');
    var html=brakHTML(d[1], d[2]);
    if(d[3]) html+='<span style="margin-left:5px;">'+d[3].replace('+',' + ').replace('-',' &minus; ')+'</span>';
    return html;
  }
  // Blandat: ersätt varje "BRAK:t:n" inuti texten
  return spec.replace(/BRAK:([^:\s]+):([^:\s]+)/g, function(m,t,n){ return brakHTML(t,n); });
}
function renderNiva(){
  var n=NIVAER[aktivNiva]; card.innerHTML=''; uppgifter=[]; aktivtFalt=null;
  var t=document.createElement('div'); t.className='niva-titel'; t.textContent=n.titel; card.appendChild(t);

  n.delar.forEach(function(del, di){
    var sekt=document.createElement('div'); sekt.className='del-sekt'; sekt.dataset.del=di;
    // rubrik för delen
    var r=document.createElement('div'); r.className='niva-rubrik'; r.textContent=del.rubrik; sekt.appendChild(r);
    if(del.info){ var inf=document.createElement('div'); inf.className='niva-info'; inf.textContent=del.info; sekt.appendChild(inf); }

    // är delen låst? (svår-delen låses tills föregående del är klar)
    var last = di>0 && !delKlar(n, di-1);
    if(last){
      sekt.classList.add('del-last');
      var l=document.createElement('div'); l.className='del-laskt'; l.innerHTML='🔒 Lås upp genom att lösa uppgifterna ovan.';
      sekt.appendChild(l);
      card.appendChild(sekt);
      return;
    }

    del.uppg.forEach(function(u,idx){
      var bokstav=String.fromCharCode(97+idx);
      var block=document.createElement('div'); block.className='uppgift';
      var et=document.createElement('div'); et.className='uppg-etikett'; et.textContent=bokstav+')'; block.appendChild(et);
      var grid=document.createElement('div'); grid.className='eq-grid'; block.appendChild(grid);
      var uvl=document.createElement('div'); uvl.className='eq-uppg-vl'; uvl.innerHTML=visaSida(u.visaVL);
      var ueq=document.createElement('div'); ueq.className='eq-uppg-eq'; ueq.textContent='=';
      var uhl=document.createElement('div'); uhl.className='eq-uppg-hl'; uhl.innerHTML=visaSida(u.visaHL);
      var usp=document.createElement('div');
      grid.appendChild(uvl); grid.appendChild(ueq); grid.appendChild(uhl); grid.appendChild(usp);
      var upp={grid:grid, startEkv:parseEkvation(u.vl,u.hl), rader:[], klarEl:null, del:di};
      uppgifter.push(upp);
      var vt=document.createElement('div'); vt.className='uppg-verktyg';
      var nyB=document.createElement('button'); nyB.className='mini-btn'; nyB.innerHTML='+ Ny rad'; nyB.onclick=function(){ nyRad(upp); };
      var gangB=document.createElement('button'); gangB.className='mini-btn'; gangB.innerHTML='<span style="font-size:18px;font-weight:700;line-height:1;">·</span> Gånger'; gangB.onclick=function(){ infogaTecken(upp,'·'); };
      var brB=document.createElement('button'); brB.className='mini-btn'; brB.innerHTML='<span class="mini-brak"><span>▢</span><span class="mini-streck"></span><span>▢</span></span> Bråk'; brB.onclick=function(){ infogaBrakI(upp); };
      vt.appendChild(nyB); vt.appendChild(gangB); vt.appendChild(brB); block.appendChild(vt);
      var klar=document.createElement('div'); klar.className='uppg-klar'; klar.textContent='✓ Löst!'; upp.klarEl=klar; block.appendChild(klar);
      sekt.appendChild(block);
      nyRad(upp);
    });
    card.appendChild(sekt);
  });

  document.getElementById('ghint').textContent=''; document.getElementById('ghint').className='global-hint';
}
// är alla uppgifter i del di lösta? (sparas i delStatus)
var delStatus={}; // nyckel: nivåid_delindex → true
function delKlar(n, di){ return !!delStatus[n.id+'_'+di]; }
function autoStorlek(inp){ var len=(inp.value||inp.placeholder||'').length; inp.setAttribute('size',Math.max(1,len)); }
function skapaTextSeg(ph){
  var inp=document.createElement('input'); inp.type='text'; inp.className='seg-text'; inp.placeholder=ph||''; inp.setAttribute('inputmode','text'); autoStorlek(inp);
  inp.addEventListener('focus',function(){ aktivtFalt=inp; });
  inp.addEventListener('input',function(){ autoStorlek(inp); });
  inp.addEventListener('keydown',function(e){ tangent(e,inp); });
  return inp;
}
function skapaBrakSeg(){
  var w=document.createElement('span'); w.className='seg-brak';
  var t=document.createElement('input'); t.type='text'; t.className='brak-tal'; t.placeholder='täljare'; t.setAttribute('inputmode','text');
  var s=document.createElement('span'); s.className='brak-streck';
  var nn=document.createElement('input'); nn.type='text'; nn.className='brak-tal'; nn.placeholder='nämnare'; nn.setAttribute('inputmode','text');
  w.appendChild(t); w.appendChild(s); w.appendChild(nn);
  [t,nn].forEach(function(inp){ autoStorlek(inp);
    inp.addEventListener('focus',function(){ aktivtFalt=inp; });
    inp.addEventListener('input',function(){ autoStorlek(inp); });
    inp.addEventListener('keydown',function(e){ tangent(e,inp); });
  });
  w._tIn=t; w._nIn=nn; return w;
}
function tangent(e,inp){
  if(e.key==='Enter'){ e.preventDefault(); var u0=uppFor(inp); if(u0) nyRad(u0); return; }
  if(e.key==='Tab' && !e.shiftKey){
    var sida=inp.closest('.sida'); if(!sida||!sida.classList.contains('sida-hl')) return;
    var u=uppFor(inp); if(!u) return;
    var sr=u.rader[u.rader.length-1]; var falt=sida.querySelectorAll('input');
    // bara agera om vi är i sista fältet på HL-sidan på sista raden
    if(!(sr && sr.hlSida===sida && inp===falt[falt.length-1])) return;
    e.preventDefault();
    // är uppgiften löst (x = tal)?
    var vl=lasSida(sr.vlSida), hl=lasSida(sr.hlSida);
    if(vl!=='' && hl!=='' && arLost(vl,hl)){
      var ix=uppgifter.indexOf(u);
      if(ix < uppgifter.length-1){
        // hoppa till nästa uppgift
        var nasta=uppgifter[ix+1];
        var f=nasta.rader[0].vlSida.querySelector('.seg-text');
        if(f){ f.focus(); aktivtFalt=f; }
      } else {
        // sista uppgiften → kontrollera alla
        kontrolleraAlla();
      }
    } else {
      nyRad(u); // inte löst än → ny rad som vanligt
    }
  }
}
function uppFor(inp){ var g=inp.closest('.eq-grid'); for(var i=0;i<uppgifter.length;i++){ if(uppgifter[i].grid===g) return uppgifter[i]; } return null; }
function nyRad(upp){
  var grid=upp.grid;
  var vlWrap=document.createElement('div'); vlWrap.className='eq-vl';
  var vlSida=document.createElement('div'); vlSida.className='sida sida-vl'; vlSida.appendChild(skapaTextSeg('VL')); vlWrap.appendChild(vlSida);
  var eqWrap=document.createElement('div'); eqWrap.className='eq-eq'; eqWrap.textContent='=';
  var hlWrap=document.createElement('div'); hlWrap.className='eq-hl';
  var hlSida=document.createElement('div'); hlSida.className='sida sida-hl'; hlSida.appendChild(skapaTextSeg('HL')); hlWrap.appendChild(hlSida);
  var status=document.createElement('div'); status.className='eq-status';
  grid.appendChild(vlWrap); grid.appendChild(eqWrap); grid.appendChild(hlWrap); grid.appendChild(status);
  var rad={vlSida:vlSida, hlSida:hlSida, status:status, vlWrap:vlWrap, hlWrap:hlWrap};
  upp.rader.push(rad);
  [vlSida,hlSida].forEach(function(s){ s.addEventListener('input',function(){ rensaFarg(rad); }); });
  var f=vlSida.querySelector('.seg-text'); if(f){ f.focus(); aktivtFalt=f; }
  return rad;
}
function rensaFarg(rad){ rad.vlWrap.classList.remove('rad-ok','rad-fel'); rad.hlWrap.classList.remove('rad-ok','rad-fel'); rad.status.textContent=''; rad.status.style.color=''; }
function infogaTecken(upp, tecken){
  if(!aktivtFalt || aktivtFalt.closest('.eq-grid')!==upp.grid){ var sr=upp.rader[upp.rader.length-1]; aktivtFalt=sr.vlSida.querySelector('.seg-text'); }
  if(!aktivtFalt) return;
  var inp=aktivtFalt;
  var start=inp.selectionStart, end=inp.selectionEnd;
  if(typeof start==='number'){
    inp.value = inp.value.slice(0,start) + tecken + inp.value.slice(end);
    inp.selectionStart = inp.selectionEnd = start + tecken.length;
  } else {
    inp.value += tecken;
  }
  autoStorlek(inp); inp.focus();
}
function infogaBrakI(upp){
  if(!aktivtFalt || aktivtFalt.closest('.eq-grid')!==upp.grid){ var sr=upp.rader[upp.rader.length-1]; aktivtFalt=sr.vlSida.querySelector('.seg-text'); }
  infogaBrak();
}
function infogaBrak(){
  if(!aktivtFalt) return;
  var sida=aktivtFalt.closest('.sida'); if(!sida) return;
  if(aktivtFalt.value.trim()===''){ aktivtFalt.placeholder=''; autoStorlek(aktivtFalt); }
  var brak=skapaBrakSeg(); var nyText=skapaTextSeg('');
  if(aktivtFalt.nextSibling){ sida.insertBefore(brak, aktivtFalt.nextSibling); sida.insertBefore(nyText, brak.nextSibling); }
  else { sida.appendChild(brak); sida.appendChild(nyText); }
  brak._tIn.focus(); aktivtFalt=brak._tIn;
}
function lasSida(sidaEl){
  var bitar=[];
  Array.prototype.forEach.call(sidaEl.childNodes,function(node){
    if(node.classList && node.classList.contains('seg-text')){ if(node.value.trim()!=='') bitar.push(node.value.trim()); }
    else if(node.classList && node.classList.contains('seg-brak')){ var t=node._tIn.value.trim(), n=node._nIn.value.trim(); if(t!==''||n!=='') bitar.push('('+(t||'0')+')/('+(n||'1')+')'); }
  });
  return bitar.join('');
}
function arLost(vl,hl){ var L=parseSida(vl),H=parseSida(hl); if(!L||!H) return false;
  // Slutsvaret måste vara x = tal (x ensamt på VÄNSTER sida, tal på höger)
  return (Math.abs(L.a-1)<1e-9 && Math.abs(L.b)<1e-9 && Math.abs(H.a)<1e-9); }
function kontrolleraUppg(upp){
  var forra=upp.startEkv, allaOk=true, nadde=false, hade=false;
  for(var i=0;i<upp.rader.length;i++){
    var rad=upp.rader[i]; var vl=lasSida(rad.vlSida), hl=lasSida(rad.hlSida); rensaFarg(rad);
    if(vl==='' && hl===''){ continue; } hade=true;
    var e=parseEkvation(vl,hl);
    if(!e || !sammaLosning(forra,e)){ rad.vlWrap.classList.add('rad-fel'); rad.hlWrap.classList.add('rad-fel'); rad.status.textContent='✗'; rad.status.style.color='var(--red)'; allaOk=false; break; }
    rad.vlWrap.classList.add('rad-ok'); rad.hlWrap.classList.add('rad-ok'); rad.status.textContent='✓'; rad.status.style.color='var(--green)'; forra=e;
    if(harUnikLosning(e) && arLost(vl,hl)) nadde=true;
  }
  upp.klarEl.classList.toggle('show', allaOk && nadde);
  return {ok:allaOk, klar:(allaOk&&nadde), hade:hade};
}
function kontrolleraAlla(){
  var g=document.getElementById('ghint'); var klar=0, fel=0;
  var n=NIVAER[aktivNiva];
  // räkna klara per del
  var perDel={}; // di → {tot, klar}
  uppgifter.forEach(function(upp){
    var r=kontrolleraUppg(upp);
    if(r.klar) klar++; else if(!r.ok) fel++;
    if(!perDel[upp.del]) perDel[upp.del]={tot:0,klar:0};
    perDel[upp.del].tot++; if(r.klar) perDel[upp.del].klar++;
  });
  // markera delar som klara, lås upp nästa
  var nyUpplast=false;
  Object.keys(perDel).forEach(function(di){
    if(perDel[di].klar===perDel[di].tot){
      if(!delStatus[n.id+'_'+di]){ delStatus[n.id+'_'+di]=true; nyUpplast=true; }
    }
  });
  if(fel>0){ g.className='global-hint fel'; g.textContent='Några rader har inte samma värde på båda sidor – de är rödmarkerade. Kontrollera att du gjort samma sak på båda sidor. Kom ihåg: x ska stå på vänster sida i svaret.'; }
  else if(klar===uppgifter.length){ g.className='global-hint ok'; g.textContent='✓ Alla uppgifter lösta och korrekt uppställda. Snyggt!'; }
  else { g.className='global-hint ok'; g.textContent='Bra så långt! De ifyllda raderna stämmer. Fortsätt tills x står ensamt på vänster sida i varje uppgift.'; }

  if(nyUpplast){
    // bevara svaren? – enklast: rendera om så nästa del låses upp (de lösta delarna markeras klara)
    setTimeout(function(){ renderNiva(); var gg=document.getElementById('ghint'); gg.className='global-hint ok'; gg.textContent='✓ Bra jobbat! Nästa del är upplåst.'; }, 800);
  }
}
renderFlikar(); visaFlik();