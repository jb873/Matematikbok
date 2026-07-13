/* ============================================================
   FAMILJ B · MOTOR: taluppfattnings-motorerna (siffror, utvecklad form, delbarhet, räkneträning (AI-fritt kluster))
   Byte-identiskt utbrutet ur ak7-k1-ram.html. Kräver delade hjälpare
   (metod-karna.js vid fristående körning; finns inline i ram-B vid omkoppling).
   ============================================================ */

function renderSiffrorBegrepp(body){
  var KAT=[
    {id:'uddajamn', nr:1, namn:'Udda eller jämnt', desc:'Svara 1 för udda, 0 för jämnt.'},
    {id:'antal',    nr:2, namn:'Hur många siffror?', desc:'Räkna siffrorna i talet.'},
    {id:'storstminst', nr:3, namn:'Störst och minst', desc:'Bygg största/minsta talet av givna siffror.'}
  ];
  negPicker(body,'Siffror och tal','Välj vad du vill öva på. Nivån anpassar sig medan du räknar.',KAT,function(katId,backFn){
    if(katId==='uddajamn'){
      var pickUJ=d1PlanPickare();   // balanserad, anti-klustrad udda/jämnt-följd
      tuKnappEngine(body,{title:'Udda eller jämnt',koId:'siffror',forKey:'begrepp',scoreKey:'uddajamn',
        sub:'Är talet udda eller jämnt? Tryck på rätt knapp.',OMG:8,
        gen:function(level){ var vill=pickUJ(['jamn','udda'],8);
          var lo=level===1?1:(level===2?100:1000), hi=level===1?99:(level===2?9999:99999);
          var n; do{ n=d3RandInt(lo,hi); }while((n%2===0?'jamn':'udda')!==vill);
          var ratt=vill;
          return {q:'Är talet <span class="neg-expr">'+n+'</span> udda eller jämnt?',
            alt:[{label:'Udda',val:'udda'},{label:'Jämnt',val:'jamn'}], ratt:ratt,
            rattLabel:(ratt==='udda'?'Udda':'Jämnt')}; },
        rattText:function(t){return 'Rätt! Talet är '+(t.ratt==='udda'?'udda':'jämnt')+'.';},
        felText:function(t){return 'Rätt svar: '+(t.ratt==='udda'?'Udda':'Jämnt')+'.';}
      },backFn);
    } else if(katId==='antal'){
      var pickA=d1PlanPickare();   // balanserad, anti-klustrad siffer-antalsföljd
      negCalcEngine(body,{title:'Hur många siffror?',koId:'siffror',forKey:'begrepp',scoreKey:'antal',
        sub:'Hur många siffror har talet?',keypadOps:[],OMG:6,
        gen:function(level){ var cats=level===1?[2,3,4,5]:(level===2?[3,4,5,6]:[4,5,6,7]); var langd=pickA(cats,6);
          var n=''; for(var i=0;i<langd;i++) n+=String(d3RandInt(i===0?1:0,9));
          return {q:'Hur många siffror har talet <span class="neg-expr">'+n+'</span>?', answer:n.length}; }
      },backFn);
    } else {
      var pickSM=d1PlanPickare();   // balanserad, ologisk störst/minst-följd
      negCalcEngine(body,{title:'Störst och minst',koId:'siffror',forKey:'begrepp',scoreKey:'storstminst',
        sub:'Bygg det största eller minsta talet av siffrorna.',keypadOps:[','],OMG:6,
        gen:function(level){
          var storst=pickSM(['storst','minst'],6)==='storst';
          var antal=d3RandInt(3,5);                                    // varierat antal siffror
          var siffror=shuffle([0,1,2,3,4,5,6,7,8,9]).slice(0,antal);   // distinkta siffror, kan innehålla 0
          if(Math.random()<0.4 && siffror.indexOf(0)<0) siffror[d3RandInt(0,antal-1)]=0;  // få in 0 ibland
          var decimaler=level===1?0:d3RandInt(1,Math.min(2,antal-1)); // nivå 1 = heltal, nivå 2 = decimaltal
          var facit=d1StorstMinstSvar(siffror,storst,decimaler);
          var decTxt=decimaler===0?'':(decimaler===1?' med en decimal':' med två decimaler');
          return {q:'Använd siffrorna <span class="neg-expr">'+siffror.join(', ')+'</span>.<br>'
            +'Skriv det <strong>'+(storst?'största':'minsta')+'</strong> talet'+decTxt+' du kan.', answer:facit.num}; }
      },backFn);
    }
  });
}

// ---- 2 · UTVECKLAD FORM ----
function renderUtveckladMetod(body){
  // eleven skriver talet i utvecklad form: 176 = 1·100 + 7·10 + 6·1
  var level=1, omgang=[], idx=0, results=[];
  function gen(){
    var dec, intLen;
    if(level===1){ dec=0; intLen=3; }
    else if(level===2){ dec=1; intLen=d3RandInt(2,3); }
    else { dec=2; intLen=d3RandInt(2,3); }
    var heltal=''; for(var i=0;i<intLen;i++) heltal+=String(d3RandInt(i===0?1:0,9));
    var decDel=''; for(var j=0;j<dec;j++) decDel+=String(d3RandInt(0,9));
    var talStr=dec?heltal+','+decDel:heltal;
    var talNum=parseFloat(talStr.replace(',','.'));
    // bygg facit-termer (bara nollskilda)
    var alla=(heltal+decDel).split('');
    var termer=[];
    for(var k=0;k<alla.length;k++){
      var siffra=parseInt(alla[k],10); if(siffra===0) continue;
      var exp=heltal.length-1-k;
      var platsvarde=Math.pow(10,exp);
      termer.push({siffra:siffra, plats:platsvarde, varde:Math.round(siffra*platsvarde*1e6)/1e6});
    }
    return {talStr:talStr, talNum:talNum, termer:termer};
  }
  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length, total=results.length;
      var adj=adjustLevel(level,right,total); level=adj.level;
      body.innerHTML='<div class="exercise-card">'+exerciseHeader('Utvecklad form','Du klarade '+right+' av '+total+'.',level)
        +renderSummaryCard({right:right,total:total,level:level,levelChange:adj.change})
        +'<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="utv-back">Tillbaka till kategorier</button></div></div>';
      document.getElementById('summary-next-btn').onclick=function(){omgang=genOmgang();idx=0;results=[];render();};
      document.getElementById('utv-back').onclick=utvPicker; return;
    }
    var task=omgang[idx];
    body.innerHTML='<div class="exercise-card">'+exerciseHeader('Skriv i utvecklad form',
      'Dela upp talet i platsvärden, t.ex. 176 = 1·100 + 7·10 + 6·1.',level)
      +'<div class="rakna-kat-exempel"><strong>Tänk så här:</strong> Varje siffra · sitt platsvärde, ihopsummerat med +.<br>'
      +'<span class="ex-rad">54,2 = 5·10 + 4·1 + 2·0,1</span></div>'
      +renderScoreBarSimple(results.filter(function(x){return x;}).length,results.filter(function(x){return !x;}).length,omgang.length,idx)
      +'<div class="mult-metod-uppg"><div class="rakna-svar-rad"><span class="rakna-svar-fast">'+task.talStr.replace('.',',')+' =</span>'
        +'<input type="text" class="rakna-svar-input" id="utv-input" autocomplete="off" placeholder="t.ex. 1·100 + 7·10 + 6·1" style="min-width:240px;"></div></div>'
      +'<div class="rakna-uppdela-feedback" id="utv-fb"></div>'
      +keypadHTML(['·','+',','])
      +'<div class="kp-hint">Skriv summan av platsvärdena. Använd · för gånger och + mellan termerna.</div>'
      +'<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
      +'<button class="btn primary" id="utv-check">Kontrollera</button>'
      +'<button class="btn subtle" id="utv-back">Tillbaka till kategorier</button></div></div>';
    var card=body.querySelector('.exercise-card'); bindKeypad(card);
    var input=document.getElementById('utv-input');
    setTimeout(function(){input.focus();},50);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();check();}});
    document.getElementById('utv-check').onclick=check;
    document.getElementById('utv-back').onclick=utvPicker;
    function check(){
      var raw=input.value.trim(), fb=document.getElementById('utv-fb');
      fb.className='rakna-uppdela-feedback show';
      var ts=getTutorScore('utvecklad','metod'), tsG=getTutorScore('utvecklad','utvform');
      ts.total++; tsG.total++;
      // dela på + , utvärdera varje term, summera; kräv minst lika många termer som nollskilda siffror
      var termer=raw.replace(/\u00b7/g,'*').replace(/\u2212/g,'-').split('+').map(function(s){return s.trim();}).filter(function(s){return s!=='';});
      var ok=true, summa=0;
      if(termer.length < task.termer.length){ ok=false; }
      termer.forEach(function(t){
        var v=d3EvalExpr(t.replace(/\*/g,'*'));
        if(v===null){ ok=false; } else summa+=v;
      });
      if(ok && Math.abs(summa-task.talNum)>1e-6) ok=false;
      input.disabled=true; document.getElementById('utv-check').disabled=true;
      var facit=task.termer.map(function(t){return t.siffra+'·'+tuKomma(t.plats);}).join(' + ');
      if(ok){ input.classList.add('correct'); fb.classList.add('correct'); fb.textContent='Rätt! '+task.talStr.replace('.',',')+' = '+facit; ts.correct++; tsG.correct++; }
      else { input.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent='Rätt svar: '+facit; }
      results.push(ok);
      setTimeout(function(){idx++;render();}, ok?2000:3000);
    }
  }
  function genOmgang(){ var a=[]; for(var i=0;i<6;i++) a.push(gen()); return a; }
  omgang=genOmgang(); render();
}

function renderUtveckladRakna(body){
  // tolka utvecklad form -> tal: "5·10 + 4·0,1" = 50,4
  negCalcEngine(body,{title:'Vilket tal står på utvecklad form?',koId:'utvecklad',forKey:'rakna',scoreKey:'tolka',
    sub:'Räkna ut vilket tal som menas.',keypadOps:[','],OMG:6,
    gen:function(level){
      var platser;
      if(level===1) platser=[{f:100,s:'100'},{f:10,s:'10'},{f:1,s:'1'}];
      else if(level===2) platser=[{f:10,s:'10'},{f:1,s:'1'},{f:0.1,s:'0,1'}];
      else platser=[{f:100,s:'100'},{f:1,s:'1'},{f:0.1,s:'0,1'},{f:0.01,s:'0,01'}];
      var antal=level===1?d3RandInt(2,3):(level===2?d3RandInt(2,3):d3RandInt(2,4));
      var valda=platser.slice().sort(function(){return Math.random()-0.5;}).slice(0,antal).sort(function(a,b){return b.f-a.f;});
      var termer=[], summa=0;
      valda.forEach(function(p){ var c=d3RandInt(1,9); termer.push(c+'·'+p.s); summa+=c*p.f; });
      summa=Math.round(summa*1e6)/1e6;
      return {q:'Vilket tal är <span class="neg-expr">'+termer.join(' + ')+'</span>?', answer:summa};
    }
  },body.__back||function(){renderUtveckladPicker(body);});
}
function utvPicker(){ renderUtveckladPicker(document.getElementById('ovning-body')); }
function renderUtveckladPicker(body){
  var KAT=[
    {id:'metod', nr:1, namn:'Skriv i utvecklad form', desc:'176 = 1·100 + 7·10 + 6·1'},
    {id:'tolka', nr:2, namn:'Vilket tal står på utvecklad form?', desc:'5·10 + 4·0,1 = 50,4'}
  ];
  negPicker(body,'Utvecklad form','Välj vad du vill öva på. Nivån anpassar sig medan du räknar.',KAT,function(katId,backFn){
    if(katId==='metod') renderUtveckladMetod(body);
    else renderUtveckladRakna(body);
  });
}

// ---- 3 · DELBARHETSREGLER ----
function renderDelbarhetBegrepp(body){
  // siffersumma + delbarhet ja/nej (svara 1=ja, 0=nej)
  negCalcEngine(body,{title:'Siffersumma',koId:'delbarhet',forKey:'begrepp',scoreKey:'siffersumma',
    sub:'Räkna ut talets siffersumma (lägg ihop alla siffror).',keypadOps:[],OMG:6,
    gen:function(level){ var langd=level===1?d3RandInt(2,3):(level===2?d3RandInt(3,4):d3RandInt(4,5));
      var n=''; var summa=0; for(var i=0;i<langd;i++){ var s=d3RandInt(i===0?1:0,9); n+=String(s); summa+=s; }
      return {q:'Vad är siffersumman av <span class="neg-expr">'+n+'</span>?', answer:summa}; }
  },function(){renderDelbarhetPicker(body);});
}
function renderDelbarhetRakna(body){
  var pickD=d1PlanPickare();   // balanserad, anti-klustrad ja/nej-följd (annars mest "nej" för stora delare)
  tuKnappEngine(body,{title:'Är talet delbart?',koId:'delbarhet',forKey:'rakna',scoreKey:'delbar',
    sub:'Är talet delbart med det angivna talet? Tryck Ja eller Nej.',OMG:8,
    gen:function(level){
      var delare=level===1?randPick([2,5,10]):(level===2?randPick([2,3,5,10]):randPick([2,3,4,5,6,9,10]));
      var vill=pickD(['ja','nej'],8);
      var loN=level===1?10:(level===2?20:100), hiN=level===1?99:(level===2?300:999);
      var n, tries=0;
      do{ n=d3RandInt(loN,hiN); tries++; }while(((n%delare===0)?'ja':'nej')!==vill && tries<100);
      var delbar=(n%delare===0)?'ja':'nej';
      return {q:'Är <span class="neg-expr">'+n+'</span> delbart med <strong>'+delare+'</strong>?',
        alt:[{label:'Ja',val:'ja'},{label:'Nej',val:'nej'}], ratt:delbar,
        rattLabel:(delbar==='ja'?'Ja':'Nej'), _n:n, _d:delare}; },
    rattText:function(t){return t.ratt==='ja'?('Rätt! '+t._n+' är delbart med '+t._d+'.'):('Rätt! '+t._n+' är inte delbart med '+t._d+'.');},
    felText:function(t){return 'Rätt svar: '+(t.ratt==='ja'?'Ja':'Nej')+'.';}
  },function(){renderDelbarhetPicker(body);});
}
function renderDelbarhetPicker(body){
  var KAT=[
    {id:'siffersumma', nr:1, namn:'Siffersumma', desc:'Lägg ihop talets siffror.'},
    {id:'delbar',      nr:2, namn:'Är talet delbart?', desc:'Avgör delbarhet med 2, 3, 5, 10 …'}
  ];
  negPicker(body,'Delbarhetsregler','Välj vad du vill öva på. Nivån anpassar sig medan du räknar.',KAT,function(katId,backFn){
    if(katId==='siffersumma') renderDelbarhetBegrepp(body);
    else renderDelbarhetRakna(body);
  });
}

// ---- 4 · RÄKNETRÄNING – ÖKA OCH MINSKA ----
function renderRaknetraningRakna(body){
  negCalcEngine(body,{title:'Öka och minska',koId:'rakneträning',forKey:'rakna',scoreKey:'okaminska',
    sub:'Räkna i huvudet. Tänk på vilken plats som ändras.',keypadOps:[','],OMG:8,
    gen:function(level){
      var steg, plus;
      if(level===1){ steg=0.1; }
      else if(level===2){ steg=randPick([0.1,0.01]); }
      else { steg=randPick([0.1,0.01,0.001]); }
      plus=Math.random()<0.5;
      var dec=steg===0.1?2:(steg===0.01?3:3);
      var tal=Math.round((d3RandInt(1,90)+d3RandInt(0,Math.pow(10,dec)-1)/Math.pow(10,dec))*Math.pow(10,dec))/Math.pow(10,dec);
      if(!plus && tal<steg) tal=Math.round((tal+1)*1e6)/1e6;
      var ans=Math.round((plus?tal+steg:tal-steg)*1e6)/1e6;
      var namn=steg===0.1?'tiondel':(steg===0.01?'hundradel':'tusendel');
      return {q:'En <strong>'+namn+'</strong> '+(plus?'större':'mindre')+' än <span class="neg-expr">'+tuKomma(tal)+'</span>', answer:ans}; }
  },function(){ navTo('ko',{koId:'rakneträning', delId: (typeof state!=='undefined'&&state.currentDel)||undefined}); });
}


// DISPATCH-TABELL (OVNING_RENDERS fylls i efter primtal-funktioner)
// ============================================================
// Definiera OVNING_RENDERS här – inkluderar alla renders

