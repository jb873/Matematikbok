/* ============================================================
   FAMILJ B · MOTOR: position-motorerna (position: Begrepp, Rakna, Resonera + renderPos-hjälpare (AI-fritt kluster))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderPositionBegrepp(body){
  var PLATSNAMN = [
    {namn:'tusental', faktor:1000}, {namn:'hundratal', faktor:100},
    {namn:'tiotal', faktor:10}, {namn:'ental', faktor:1},
    {namn:'tiondel', faktor:0.1}, {namn:'hundradel', faktor:0.01}, {namn:'tusendel', faktor:0.001}
  ];
  var PLATSVARDE = {
    header:'Platsvärde', formagaKey:'begrepp', koId:'position', scoreKey:'platsvarde',
    sub:'Vilket värde har den markerade siffran?', backLabel:'Tillbaka till kategorier', ops:[','],
    exempel:'<strong>Tänk så här:</strong> Varje plats har ett värde.<br>'
      +'<span class="ex-rad">I 4&nbsp;367 har 3:an värdet 300.</span><br>'
      +'<span class="ex-rad">I 9,28 har 8:an värdet 0,08.</span>',
    gen:function(level){
      var dec = level===1?0 : (level===2?2:3);
      var intSiffror = level===1? d3RandInt(3,4) : 2;
      var heltalDel='';
      for(var i=0;i<intSiffror;i++) heltalDel += String(d3RandInt(i===0?1:0,9));
      var decDel='';
      for(var j=0;j<dec;j++) decDel += String(d3RandInt(0,9));
      var talStr = dec? heltalDel+','+decDel : heltalDel;
      // välj en position som inte är 0
      var alla = (heltalDel+decDel).split('');
      var posIdx; var guard=0;
      do { posIdx = d3RandInt(0, alla.length-1); guard++; } while(alla[posIdx]==='0' && guard<20);
      var siffra = alla[posIdx];
      // räkna ut platsvärde: position relativt decimalkomma
      var heltalLen = heltalDel.length;
      var exponent = heltalLen - 1 - posIdx; // 0=ental
      var varde = parseInt(siffra,10) * Math.pow(10, exponent);
      varde = Math.round(varde*1e6)/1e6;
      // markera siffran i visning
      var visa='';
      var allaMedKomma = talStr.split('');
      var rawIdx=0;
      for(var k=0;k<allaMedKomma.length;k++){
        if(allaMedKomma[k]===','){ visa+=','; continue; }
        if(rawIdx===posIdx) visa+='<span class="pos-markerad">'+allaMedKomma[k]+'</span>';
        else visa+=allaMedKomma[k];
        rawIdx++;
      }
      return {display:'Vilket värde har '+visa+' ?', answerNum:varde, answerStr:posKomma(varde)};
    }
  };
  var SKRIVTAL = {
    header:'Skriv talet med siffror', formagaKey:'begrepp', koId:'position', scoreKey:'skrivtal',
    sub:'Sätt ihop talet från platsvärdena.', backLabel:'Tillbaka till kategorier', ops:[','],
    exempel:'<strong>Tänk så här:</strong> Lägg varje del på rätt plats.<br>'
      +'<span class="ex-rad">3 ental, 5 hundradelar och 7 tusendelar = 3,057</span><br>'
      +'<span class="ex-rad">19 tiondelar = 1,9</span>',
    gen:function(level){
      if(level>=2 && Math.random()<0.5){
        // "X tiondelar/hundradelar/tusendelar"
        var typ = randPick([{n:'tiondelar',f:0.1},{n:'hundradelar',f:0.01},{n:'tusendelar',f:0.001}]);
        var antal = d3RandInt(11, 49);
        var v = Math.round(antal*typ.f*1e6)/1e6;
        return {display:antal+' '+typ.n, answerNum:v, answerStr:posKomma(v)};
      }
      // kombination av platser
      var platser = level===1
        ? [{n:'ental',f:1},{n:'tiondelar',f:0.1},{n:'hundradelar',f:0.01}]
        : [{n:'tiotal',f:10},{n:'ental',f:1},{n:'hundradelar',f:0.01},{n:'tusendelar',f:0.001}];
      var antalDelar = level===1? d3RandInt(2,3) : d3RandInt(2,3);
      var valda = platser.slice().sort(function(){return Math.random()-0.5;}).slice(0,antalDelar);
      // sortera efter storlek (störst först) för läsbarhet
      valda.sort(function(a,b){return b.f-a.f;});
      var summa=0, delar=[];
      valda.forEach(function(p){
        var c = d3RandInt(1,9);
        summa += c*p.f;
        delar.push(c+' '+p.n);
      });
      summa=Math.round(summa*1e6)/1e6;
      return {display:delar.join(', '), answerNum:summa, answerStr:posKomma(summa)};
    }
  };
  function picker(){
    var kort=[
      {id:'platsvarde', nr:1, namn:'Platsvärde', desc:'Vilket värde har den markerade siffran?'},
      {id:'skrivtal', nr:2, namn:'Skriv talet med siffror', desc:'3 ental, 5 hundradelar … = 3,05'}
    ];
    body.innerHTML='<div class="exercise-card">'
      +exerciseHeader('Begrepp · Positionssystemet','Välj vad du vill träna på. Nivån anpassar sig medan du räknar.')
      +'<div class="tabell-level-grid">'+kort.map(function(k){
        return '<button class="tabell-card" data-kat="'+k.id+'"><div class="tabell-card-num">'+k.nr+'</div>'
          +'<div class="tabell-card-body"><div class="tabell-card-namn">'+k.namn+'</div>'
          +'<div class="tabell-card-desc">'+k.desc+'</div></div>'
          +'<div style="color:var(--ink-faint);font-size:20px;">›</div></button>';
      }).join('')+'</div></div>';
    body.querySelectorAll('[data-kat]').forEach(function(btn){
      btn.onclick=function(){ renderAddSingle(body, btn.dataset.kat==='platsvarde'?PLATSVARDE:SKRIVTAL, picker); };
    });
  }
  picker();
}

// ============================================================
// RÄKNA: tallinje + storleksordna + talföljd + öka/minska
// ============================================================
function renderPositionRakna(body){
  // -- Tallinje-data (genereras) --
  function genTallinjeAvlasning(level){
    // välj ett intervall och delstreck
    var spec;
    if(level===1){
      var start=d3RandInt(0,6); spec={start:start, slut:start+3, huvudsteg:1, delstreck:5};
    } else if(level===2){
      var b=d3RandInt(0,8)/10; b=Math.round(b*10)/10; spec={start:b, slut:Math.round((b+0.5)*10)/10, huvudsteg:0.1, delstreck:5};
    } else {
      var c=d3RandInt(0,8)/10; c=Math.round(c*10)/10; spec={start:c, slut:Math.round((c+0.1)*100)/100, huvudsteg:0.05, delstreck:5};
    }
    // placera 3 markeringar på delstreckspositioner
    var litet=spec.huvudsteg/spec.delstreck;
    var antal=Math.round((spec.slut-spec.start)/litet);
    var positioner=[];
    for(var i=1;i<antal;i++) positioner.push(i);
    positioner.sort(function(){return Math.random()-0.5;});
    var valda=positioner.slice(0,3).sort(function(a,b){return a-b;});
    var bok=['A','B','C'];
    var mark=valda.map(function(p,idx){
      var v=Math.round((spec.start+p*litet)*1e6)/1e6;
      return {bok:bok[idx], varde:v};
    });
    return {cfg:spec, mark:mark};
  }
  function renderTallinje(){
    var level=1, uppg=null;
    function ny(){ uppg=genTallinjeAvlasning(level); show(); }
    function show(){
      var cfg=Object.assign({}, uppg.cfg, {markeringar:uppg.mark, visaTal:true});
      body.innerHTML='<div class="exercise-card">'
        +exerciseHeader('Tallinjen','Vilka tal pekar pilarna på? Skriv talet vid varje bokstav.', level)
        +'<div style="margin:10px 0 6px;">'+posRitaTallinje(cfg)+'</div>'
        +'<div class="pos-tl-svarsrad">'+uppg.mark.map(function(m){
          return '<span class="pos-tl-svar"><span class="pos-tl-bok">'+m.bok+' =</span>'
            +'<input class="ovn-in pos-tl-in" data-svar="'+m.varde+'" inputmode="decimal" autocomplete="off" style="width:80px;"></span>';
        }).join('')+'</div>'
        +'<div class="rakna-uppdela-feedback" id="pos-tl-fb"></div>'
        +'<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        +'<button class="btn primary" id="pos-tl-check">Kontrollera</button>'
        +'<button class="btn subtle" id="pos-tl-back">Tillbaka till kategorier</button></div></div>';
      document.getElementById('pos-tl-back').onclick=picker;
      document.getElementById('pos-tl-check').onclick=check;
    }
    function check(){
      var rutor=body.querySelectorAll('.pos-tl-in'), allaRatt=true, n=0, r=0;
      var ts=getTutorScore('position','rakna'), tsG=getTutorScore('position','tallinje');
      rutor.forEach(function(inp){
        n++; inp.classList.remove('correct','wrong');
        inp.parentElement.querySelectorAll('.ovn-mark,.ovn-fasit').forEach(function(f){f.remove();});
        var ok=jamforTal(inp.value, parseFloat(inp.dataset.svar));
        var mark=document.createElement('span'); mark.className='ovn-mark '+(ok?'ok':'fel'); mark.textContent=ok?'✓':'✗';
        if(ok){ inp.classList.add('correct'); r++; inp.insertAdjacentElement('afterend',mark); }
        else { inp.classList.add('wrong'); allaRatt=false;
          var f=document.createElement('span'); f.className='ovn-fasit'; f.textContent=posKomma(parseFloat(inp.dataset.svar));
          inp.insertAdjacentElement('afterend',mark); mark.insertAdjacentElement('afterend',f); }
      });
      ts.total++; tsG.total++; if(allaRatt){ts.correct++;tsG.correct++;}
      var fb=document.getElementById('pos-tl-fb'); fb.className='rakna-uppdela-feedback show '+(allaRatt?'correct':'wrong');
      fb.textContent=allaRatt?('Rätt på alla! '+r+' av '+n):('Du fick '+r+' av '+n+' rätt. Titta på de röda.');
      if(allaRatt && r>=2) ovaKonfetti();
      document.getElementById('pos-tl-check').disabled=true;
      var b=document.createElement('button'); b.className='btn primary'; b.textContent='Ny tallinje'; b.style.marginLeft='8px';
      b.onclick=function(){ if(allaRatt){level=Math.min(3,level+1);} ny(); };
      document.getElementById('pos-tl-check').insertAdjacentElement('afterend', b);
    }
    ny();
  }

  // -- Storleksordna --
  var ORDNA = {
    header:'Storleksordna', formagaKey:'rakna', koId:'position', scoreKey:'ordna',
    sub:'Skriv talen i storleksordning, minst först. Svara med talen åtskilda av < .', backLabel:'Tillbaka till kategorier', ops:[',','<'],
    exempel:'<strong>Tänk så här:</strong> Jämför plats för plats.<br>'
      +'<span class="ex-rad">0,1 &lt; 0,4 &lt; 0,5 &lt; 2,5 &lt; 3,0</span>',
    gen:function(level){
      var n = level===1?4:(level===2?4:5);
      var dec = level===1?1:(level===2?2:3);
      var set=new Set(); var tal=[];
      var guard=0;
      while(tal.length<n && guard<200){
        guard++;
        var v = level===1? Math.round(d3RandInt(1,30)/10*10)/10
              : level===2? Math.round(d3RandInt(50,200)/100*100)/100
              : Math.round(d3RandInt(500,1400)/1000*1000)/1000;
        if(!set.has(v)){ set.add(v); tal.push(v); }
      }
      var sorterat=tal.slice().sort(function(a,b){return a-b;});
      var blandat=tal.slice().sort(function(){return Math.random()-0.5;});
      return {
        display: blandat.map(posKomma).join('&nbsp;&nbsp;&nbsp;'),
        leftText: blandat.map(posKomma).join('   ') + '  →',
        answerSeq: sorterat,
        answerStr: sorterat.map(posKomma).join(' < ')
      };
    }
  };

  // -- Talföljd --
  var FOLJD = {
    header:'Talföljder', formagaKey:'rakna', koId:'position', scoreKey:'foljd',
    sub:'Vilka tre tal följer i talföljden? Svara med talen åtskilda av komma.', backLabel:'Tillbaka till kategorier', ops:[','],
    exempel:'<strong>Tänk så här:</strong> Hitta steget mellan talen.<br>'
      +'<span class="ex-rad">9,2  9,4  9,6  →  9,8  10,0  10,2</span>',
    gen:function(level){
      var startH, stegH, decimaler;
      if(level===1){ decimaler=1; stegH=d3RandInt(1,3)*Math.pow(10,decimaler-1); startH=d3RandInt(10,90); }
      else if(level===2){ decimaler=2; stegH=d3RandInt(1,3)*Math.pow(10,0); startH=d3RandInt(100,900); }
      else { decimaler=3; stegH=d3RandInt(1,3)*Math.pow(10,0); startH=d3RandInt(1000,9000); }
      var f=Math.pow(10,decimaler);
      var t0=startH, t1=startH+stegH, t2=startH+2*stegH;
      var n3=startH+3*stegH, n4=startH+4*stegH, n5=startH+5*stegH;
      var show=[t0,t1,t2].map(function(x){return posKomma(Math.round(x/f*1e6)/1e6);}).join('   ');
      return {
        leftText: show + '  →',
        answerSeq:[n3,n4,n5].map(function(x){return Math.round(x/f*1e6)/1e6;}),
        answerStr:[n3,n4,n5].map(function(x){return posKomma(Math.round(x/f*1e6)/1e6);}).join(', ')
      };
    }
  };

  // -- Öka/minska med tiondel/hundradel + huvudräkning --
  var OKA = {
    header:'Öka och minska', formagaKey:'rakna', koId:'position', scoreKey:'oka',
    sub:'Räkna i huvudet. Tänk på vilken plats som ändras.', backLabel:'Tillbaka till kategorier', ops:[','],
    exempel:'<strong>Tänk så här:</strong> En tiondel = 0,1 och en hundradel = 0,01.<br>'
      +'<span class="ex-rad">En tiondel större än 4,58 = 4,68</span><br>'
      +'<span class="ex-rad">0,8 + 0,03 = 0,83</span>',
    gen:function(level){
      var typ;
      if(level===1) typ=randPick(['tiondel-plus','tiondel-minus','huvud']);
      else if(level===2) typ=randPick(['tiondel-plus','hundradel-plus','huvud']);
      else typ=randPick(['hundradel-plus','hundradel-minus','huvud']);
      if(typ==='huvud'){
        // 0,8 + 0,03 -typ
        var aH=d3RandInt(1,90), bH;
        if(level===1) bH=d3RandInt(1,9); else if(level===2) bH=d3RandInt(1,30); else bH=d3RandInt(1,200);
        var plus=Math.random()<0.5;
        if(!plus && bH>aH){ var t=aH; aH=bH; bH=t; }
        var ans=plus? aH+bH : aH-bH;
        return {display: posKomma(aH/100)+(plus?' + ':' − ')+posKomma(bH/100), answerNum:Math.round(ans)/100, answerStr:posKomma(Math.round(ans)/100)};
      }
      var steg = typ.indexOf('tiondel')===0?0.1:0.01;
      var plus2 = typ.indexOf('plus')>=0;
      var dec = steg===0.1?2:3;
      var tal = posRandTal(0, 9, dec);
      // undvik negativt
      if(!plus2 && tal<steg) tal=Math.round((tal+1)*1e6)/1e6;
      var ans2=Math.round((plus2?tal+steg:tal-steg)*1e6)/1e6;
      var ordnamn = steg===0.1?'tiondel':'hundradel';
      return {display:'En '+ordnamn+' '+(plus2?'större':'mindre')+' än '+posKomma(tal), answerNum:ans2, answerStr:posKomma(ans2)};
    }
  };

  function picker(){
    var kort=[
      {id:'tallinje', nr:1, namn:'Tallinjen', desc:'Vilka tal pekar pilarna på?'},
      {id:'ordna', nr:2, namn:'Storleksordna', desc:'0,1 < 0,4 < 0,5 < 2,5'},
      {id:'foljd', nr:3, namn:'Talföljder', desc:'9,2  9,4  9,6  →  ?'},
      {id:'oka', nr:4, namn:'Öka och minska', desc:'En tiondel större än 4,58'}
    ];
    body.innerHTML='<div class="exercise-card">'
      +exerciseHeader('Räkna · Positionssystemet','Välj vad du vill träna på. Nivån anpassar sig medan du räknar.')
      +'<div class="tabell-level-grid">'+kort.map(function(k){
        return '<button class="tabell-card" data-kat="'+k.id+'"><div class="tabell-card-num">'+k.nr+'</div>'
          +'<div class="tabell-card-body"><div class="tabell-card-namn">'+k.namn+'</div>'
          +'<div class="tabell-card-desc">'+k.desc+'</div></div>'
          +'<div style="color:var(--ink-faint);font-size:20px;">›</div></button>';
      }).join('')+'</div></div>';
    body.querySelectorAll('[data-kat]').forEach(function(btn){
      btn.onclick=function(){
        var k=btn.dataset.kat;
        if(k==='tallinje') renderTallinje();
        else if(k==='ordna') renderPosSeq(body, ORDNA, picker, '<');
        else if(k==='foljd') renderPosSeq(body, FOLJD, picker, ',');
        else renderAddSingle(body, OKA, picker);
      };
    });
  }
  picker();
}

// Motor: sekvenssvar (storleksordna / talföljd) – jämför en lista av tal
function renderPosSeq(body, cfg, backFn, sep){
  var level=1, omgang=[], idx=0, results=[];
  function genOmgang(){ var a=[]; for(var i=0;i<6;i++) a.push(cfg.gen(level)); return a; }
  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length, total=results.length;
      var adj=adjustLevel(level,right,total); level=adj.level;
      body.innerHTML='<div class="exercise-card">'+exerciseHeader(cfg.header,'Du klarade '+right+' av '+total+'.',level)
        +renderSummaryCard({right:right,total:total,level:level,levelChange:adj.change})
        +'<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="posseq-back">'+cfg.backLabel+'</button></div></div>';
      document.getElementById('summary-next-btn').onclick=function(){omgang=genOmgang();idx=0;results=[];render();};
      document.getElementById('posseq-back').onclick=backFn; return;
    }
    var task=omgang[idx];
    body.innerHTML='<div class="exercise-card">'+exerciseHeader(cfg.header,cfg.sub,level)
      +'<div class="rakna-kat-exempel">'+cfg.exempel+'</div>'
      +renderScoreBarSimple(results.filter(function(x){return x;}).length,results.filter(function(x){return !x;}).length,omgang.length,idx)
      +'<div class="mult-metod-uppg"><div class="rakna-svar-rad"><span class="rakna-svar-fast">'+task.leftText+'</span>'
        +'<input type="text" class="rakna-svar-input" id="posseq-input" autocomplete="off" placeholder="t.ex. '+(sep==='<'?'a < b < c':'a, b, c')+'"></div></div>'
      +'<div class="rakna-uppdela-feedback" id="posseq-fb"></div>'
      +keypadHTML(cfg.ops)
      +'<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
      +'<button class="btn primary" id="posseq-check">Kontrollera</button>'
      +'<button class="btn subtle" id="posseq-back">'+cfg.backLabel+'</button></div></div>';
    var card=body.querySelector('.exercise-card'); bindKeypad(card);
    var input=document.getElementById('posseq-input');
    setTimeout(function(){input.focus();},50);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();check();}});
    document.getElementById('posseq-check').onclick=check;
    document.getElementById('posseq-back').onclick=backFn;
    function check(){
      var raw=input.value.trim(), fb=document.getElementById('posseq-fb');
      fb.className='rakna-uppdela-feedback show';
      var ts=getTutorScore(cfg.koId,cfg.formagaKey), tsG=getTutorScore(cfg.koId,cfg.scoreKey);
      // dela upp på separator (eller komma)
      var delar=raw.replace(/\u2212/g,'-').split(sep==='<'?/[<]/:/[,]/).map(function(s){return s.trim();}).filter(function(s){return s!=='';});
      var tal=delar.map(function(s){return parseFloat(s.replace(',','.'));});
      var ok=true;
      if(tal.length!==task.answerSeq.length || tal.some(isNaN)) ok=false;
      else for(var i=0;i<tal.length;i++){ if(Math.abs(tal[i]-task.answerSeq[i])>1e-9){ ok=false; break; } }
      input.disabled=true; document.getElementById('posseq-check').disabled=true;
      ts.total++; tsG.total++;
      if(ok){ input.classList.add('correct'); fb.classList.add('correct'); fb.textContent='Rätt! '+task.answerStr; ts.correct++; tsG.correct++; }
      else { input.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent='Rätt svar: '+task.answerStr; }
      results.push(ok);
      setTimeout(function(){idx++;render();}, ok?1700:2600);
    }
  }
  omgang=genOmgang(); render();
}

// ============================================================
// RESONERA: jämföra tal + tal som ligger mellan
// ============================================================
function renderPositionResonera(body){
  var JAMFOR = {
    header:'Vilket tal är störst?', formagaKey:'resonera', koId:'position', scoreKey:'jamfor',
    sub:'Skriv tecknet < , = eller > mellan talen.', backLabel:'Tillbaka till kategorier', ops:['<','>','='],
    exempel:'<strong>Tänk så här:</strong> Jämför plats för plats, börja från vänster.<br>'
      +'<span class="ex-rad">9,1 &gt; 9,09  (en tiondel slår två hundradelar)</span>',
    gen:function(level){
      var a,b;
      function rnd(){ var dec=level===1?1:(level===2?2:3); return Math.round(d3RandInt(80,120)/Math.pow(10, dec>1?1:0)*Math.pow(10,dec))/Math.pow(10,dec); }
      // bygg par som ligger nära varandra
      if(level===1){ a=Math.round(d3RandInt(5,99)/10*10)/10; b=Math.round((a + randPick([-0.1,0.1,0.2,-0.2,0]))*10)/10; }
      else if(level===2){ a=Math.round(d3RandInt(50,1200)/100*100)/100; b=Math.round((a+randPick([-0.01,0.01,0.1,-0.1,0]))*100)/100; }
      else { a=Math.round(d3RandInt(500,12000)/1000*1000)/1000; b=Math.round((a+randPick([-0.001,0.001,0.01,-0.01,0.09]))*1000)/1000; }
      if(a<0) a=Math.abs(a); if(b<0) b=Math.abs(b);
      var svar = a<b?'<':(a>b?'>':'=');
      return {a:a, b:b, leftText:posKomma(a), rightText:posKomma(b), svar:svar};
    }
  };
  var MELLAN = {
    header:'Skriv ett tal som ligger mellan', formagaKey:'resonera', koId:'position', scoreKey:'mellan',
    sub:'Skriv vilket tal som helst som ligger mellan de två talen.', backLabel:'Tillbaka till kategorier', ops:[','],
    exempel:'<strong>Tänk så här:</strong> Det finns alltid tal mellan två tal.<br>'
      +'<span class="ex-rad">Mellan 9,9 och 10 kan du skriva 9,95.</span>',
    gen:function(level){
      var lo, hi;
      if(level===1){ lo=Math.round(d3RandInt(10,98)/10*10)/10; hi=Math.round((lo+0.1)*10)/10; }
      else if(level===2){ lo=Math.round(d3RandInt(90,200)/10*10)/10; hi=Math.round((lo+0.1)*10)/10; }
      else { lo=Math.round(d3RandInt(900,1099)/100*100)/100; hi=Math.round((lo+0.01)*100)/100; }
      return {lo:lo, hi:hi, leftText:posKomma(lo)+' och '+posKomma(hi)};
    }
  };
  function picker(){
    var kort=[
      {id:'jamfor', nr:1, namn:'Vilket tal är störst?', desc:'9,1  ?  9,09'},
      {id:'mellan', nr:2, namn:'Tal som ligger mellan', desc:'Mellan 9,9 och 10'}
    ];
    body.innerHTML='<div class="exercise-card">'
      +exerciseHeader('Resonera · Positionssystemet','Välj vad du vill träna på. Nivån anpassar sig medan du räknar.')
      +'<div class="tabell-level-grid">'+kort.map(function(k){
        return '<button class="tabell-card" data-kat="'+k.id+'"><div class="tabell-card-num">'+k.nr+'</div>'
          +'<div class="tabell-card-body"><div class="tabell-card-namn">'+k.namn+'</div>'
          +'<div class="tabell-card-desc">'+k.desc+'</div></div>'
          +'<div style="color:var(--ink-faint);font-size:20px;">›</div></button>';
      }).join('')+'</div></div>';
    body.querySelectorAll('[data-kat]').forEach(function(btn){
      btn.onclick=function(){ if(btn.dataset.kat==='jamfor') renderPosJamfor(body, JAMFOR, picker); else renderPosMellan(body, MELLAN, picker); };
    });
  }
  picker();
}

// Motor: jämför med tecken (< = >)
function renderPosJamfor(body, cfg, backFn){
  var level=1, omgang=[], idx=0, results=[];
  function genOmgang(){ var a=[]; for(var i=0;i<6;i++) a.push(cfg.gen(level)); return a; }
  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length, total=results.length;
      var adj=adjustLevel(level,right,total); level=adj.level;
      body.innerHTML='<div class="exercise-card">'+exerciseHeader(cfg.header,'Du klarade '+right+' av '+total+'.',level)
        +renderSummaryCard({right:right,total:total,level:level,levelChange:adj.change})
        +'<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="posj-back">'+cfg.backLabel+'</button></div></div>';
      document.getElementById('summary-next-btn').onclick=function(){omgang=genOmgang();idx=0;results=[];render();};
      document.getElementById('posj-back').onclick=backFn; return;
    }
    var task=omgang[idx];
    body.innerHTML='<div class="exercise-card">'+exerciseHeader(cfg.header,cfg.sub,level)
      +'<div class="rakna-kat-exempel">'+cfg.exempel+'</div>'
      +renderScoreBarSimple(results.filter(function(x){return x;}).length,results.filter(function(x){return !x;}).length,omgang.length,idx)
      +'<div class="pos-jamfor-rad"><span class="pos-jamfor-tal">'+task.leftText+'</span>'
        +'<span class="pos-jamfor-knappar">'
          +['&lt;','=','&gt;'].map(function(e){var v=e==='&lt;'?'<':(e==='&gt;'?'>':'=');return '<button type="button" class="pos-jamfor-btn" data-val="'+v+'">'+e+'</button>';}).join('')
        +'</span><span class="pos-jamfor-tal">'+task.rightText+'</span></div>'
      +'<div class="rakna-uppdela-feedback" id="posj-fb"></div>'
      +'<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
      +'<button class="btn primary" id="posj-check">Kontrollera</button>'
      +'<button class="btn subtle" id="posj-back">'+cfg.backLabel+'</button></div></div>';
    var valt=null;
    body.querySelectorAll('.pos-jamfor-btn').forEach(function(b){
      b.onclick=function(){ body.querySelectorAll('.pos-jamfor-btn').forEach(function(x){x.classList.remove('is-vald');}); b.classList.add('is-vald'); valt=b.dataset.val; };
    });
    document.getElementById('posj-back').onclick=backFn;
    document.getElementById('posj-check').onclick=function(){
      var fb=document.getElementById('posj-fb'); fb.className='rakna-uppdela-feedback show';
      var ts=getTutorScore(cfg.koId,cfg.formagaKey), tsG=getTutorScore(cfg.koId,cfg.scoreKey);
      ts.total++; tsG.total++;
      var ok = valt===task.svar;
      body.querySelectorAll('.pos-jamfor-btn').forEach(function(b){
        b.disabled=true;
        if(b.dataset.val===task.svar) b.classList.add('correct');
        else if(b.dataset.val===valt) b.classList.add('wrong');
      });
      document.getElementById('posj-check').disabled=true;
      if(ok){ fb.classList.add('correct'); fb.textContent='Rätt! '+task.leftText+' '+(task.svar==='<'?'<':(task.svar==='>'?'>':'='))+' '+task.rightText; ts.correct++; tsG.correct++; }
      else { fb.classList.add('wrong'); fb.textContent='Rätt svar: '+task.leftText+' '+(task.svar==='<'?'<':(task.svar==='>'?'>':'='))+' '+task.rightText; }
      results.push(ok);
      setTimeout(function(){idx++;render();}, ok?1500:2400);
    };
  }
  omgang=genOmgang(); render();
}

// Motor: skriv ett tal mellan (intervall)
function renderPosMellan(body, cfg, backFn){
  var level=1, omgang=[], idx=0, results=[];
  function genOmgang(){ var a=[]; for(var i=0;i<6;i++) a.push(cfg.gen(level)); return a; }
  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length, total=results.length;
      var adj=adjustLevel(level,right,total); level=adj.level;
      body.innerHTML='<div class="exercise-card">'+exerciseHeader(cfg.header,'Du klarade '+right+' av '+total+'.',level)
        +renderSummaryCard({right:right,total:total,level:level,levelChange:adj.change})
        +'<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="posm-back">'+cfg.backLabel+'</button></div></div>';
      document.getElementById('summary-next-btn').onclick=function(){omgang=genOmgang();idx=0;results=[];render();};
      document.getElementById('posm-back').onclick=backFn; return;
    }
    var task=omgang[idx];
    body.innerHTML='<div class="exercise-card">'+exerciseHeader(cfg.header,cfg.sub,level)
      +'<div class="rakna-kat-exempel">'+cfg.exempel+'</div>'
      +renderScoreBarSimple(results.filter(function(x){return x;}).length,results.filter(function(x){return !x;}).length,omgang.length,idx)
      +'<div class="mult-metod-uppg"><div class="rakna-svar-rad"><span class="rakna-svar-fast">Ett tal mellan '+task.leftText+'</span>'
        +'<input type="text" class="rakna-svar-input" id="posm-input" inputmode="decimal" autocomplete="off" placeholder="?"></div></div>'
      +'<div class="rakna-uppdela-feedback" id="posm-fb"></div>'
      +keypadHTML(cfg.ops)
      +'<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
      +'<button class="btn primary" id="posm-check">Kontrollera</button>'
      +'<button class="btn subtle" id="posm-back">'+cfg.backLabel+'</button></div></div>';
    var card=body.querySelector('.exercise-card'); bindKeypad(card);
    var input=document.getElementById('posm-input');
    setTimeout(function(){input.focus();},50);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();check();}});
    document.getElementById('posm-check').onclick=check;
    document.getElementById('posm-back').onclick=backFn;
    function check(){
      var v=parseFloat(String(input.value).replace(',','.')), fb=document.getElementById('posm-fb');
      fb.className='rakna-uppdela-feedback show';
      var ts=getTutorScore(cfg.koId,cfg.formagaKey), tsG=getTutorScore(cfg.koId,cfg.scoreKey);
      ts.total++; tsG.total++;
      var ok = !isNaN(v) && v>task.lo+1e-9 && v<task.hi-1e-9;
      input.disabled=true; document.getElementById('posm-check').disabled=true;
      if(ok){ input.classList.add('correct'); fb.classList.add('correct'); fb.textContent='Rätt! '+posKomma(v)+' ligger mellan '+task.leftText.replace(' och ',' och ')+'.'; ts.correct++; tsG.correct++; }
      else { input.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent='Skriv ett tal mellan '+posKomma(task.lo)+' och '+posKomma(task.hi)+'.'; }
      results.push(ok);
      setTimeout(function(){idx++;render();}, ok?1700:2600);
    }
  }
  omgang=genOmgang(); render();
}


// ============================================================
// TALUPPFATTNING – byggda kunskapsområden (siffror, utvecklad, delbarhet, räkneträning)
// ============================================================
function tuKomma(x){ return String(Math.round(x*1e6)/1e6).replace('.', ','); }

// Generell knappvals-motor: frågor med 2+ svarsalternativ (klickbara knappar).
// cfg.gen(level) → {q:HTML, alt:[{label,val}], ratt:val}
function tuKnappEngine(body, cfg, backFn){
  var level=1, omgang=[], idx=0, results=[], OMG=cfg.OMG||8;
  function genOmgang(){ var a=[]; for(var i=0;i<OMG;i++) a.push(cfg.gen(level)); return a; }
  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length, total=results.length;
      var adj=adjustLevel(level,right,total); level=adj.level;
      body.innerHTML='<div class="exercise-card">'+exerciseHeader(cfg.title,'Du klarade '+right+' av '+total+'.',level)
        +renderSummaryCard({right:right,total:total,level:level,levelChange:adj.change})
        +'<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="tuk-back">Tillbaka</button></div></div>';
      document.getElementById('summary-next-btn').onclick=function(){omgang=genOmgang();idx=0;results=[];render();};
      document.getElementById('tuk-back').onclick=backFn; return;
    }
    var task=omgang[idx];
    body.innerHTML='<div class="exercise-card">'+exerciseHeader(cfg.title+' — nivå '+level, cfg.sub, level)
      +(cfg.exempel?'<div class="rakna-kat-exempel">'+cfg.exempel+'</div>':'')
      +renderScoreBarSimple(results.filter(function(x){return x;}).length,results.filter(function(x){return !x;}).length,omgang.length,idx)
      +'<div class="neg-fraga">'+task.q+'</div>'
      +'<div class="tu-knapp-rad">'+task.alt.map(function(a){
        return '<button type="button" class="tu-knapp" data-val="'+String(a.val).replace(/"/g,'&quot;')+'">'+a.label+'</button>';
      }).join('')+'</div>'
      +'<div class="rakna-uppdela-feedback" id="tuk-fb"></div>'
      +'<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
      +'<button class="btn subtle" id="tuk-tillbaka">Tillbaka</button></div></div>';
    document.getElementById('tuk-tillbaka').onclick=backFn;
    var besvarad=false;
    body.querySelectorAll('.tu-knapp').forEach(function(btn){
      btn.onclick=function(){
        if(besvarad) return; besvarad=true;
        var fb=document.getElementById('tuk-fb'); fb.className='rakna-uppdela-feedback show';
        var ts=getTutorScore(cfg.koId,cfg.forKey), tsG=getTutorScore(cfg.koId,cfg.scoreKey);
        ts.total++; tsG.total++;
        var ok = String(btn.dataset.val)===String(task.ratt);
        body.querySelectorAll('.tu-knapp').forEach(function(b){
          b.disabled=true;
          if(String(b.dataset.val)===String(task.ratt)) b.classList.add('correct');
          else if(b===btn) b.classList.add('wrong');
        });
        if(ok){ fb.classList.add('correct'); fb.textContent=cfg.rattText?cfg.rattText(task):'Rätt!'; ts.correct++; tsG.correct++; }
        else { fb.classList.add('wrong'); fb.textContent=cfg.felText?cfg.felText(task):('Rätt svar: '+task.rattLabel); }
        results.push(ok);
        setTimeout(function(){idx++;render();}, ok?1400:2400);
      };
    });
  }
  omgang=genOmgang(); render();
}

