/* FAMILJ C · k3 öva-mer algebra-motorer: tolka/berakna/forenkla/skriva + generatorer + pickers + keypad-hjälpare
   Byte-identiskt utbrutet ur ak7-k3-ram.html. Laddas via <script src>; delade delar inline i ram-C. */

var NAMN = ['Nadia','Hugo','Selma','Omar','Vera','Elliot','Saga','Noel','Tuva','Milo','Iris','Leon'];
var RAKNEORD = ['noll','en','två','tre','fyra','fem','sex','sju','åtta','nio','tio'];
function emojiRad(antal, emoji){ var s=''; for(var i=0;i<antal;i++) s+=emoji; return s; }

function genTolkaBild(level){
  var v = VAROR.slice().sort(function(){return Math.random()-0.5;});
  var v1=v[0], v2=v[1];
  var n1 = level===1? d3RandInt(2,4) : d3RandInt(2,6);
  var n2 = level===1? d3RandInt(2,3) : d3RandInt(2,5);
  var namn = randPick(NAMN);
  var uttryck = n1+'a + '+n2+'b';
  var svarText = RAKNEORD[n1]+' '+v1.flertal+' och '+RAKNEORD[n2]+' '+v2.flertal;
  var accept = [
    RAKNEORD[n1]+v1.flertal+'och'+RAKNEORD[n2]+v2.flertal,
    RAKNEORD[n1]+v1.flertal+RAKNEORD[n2]+v2.flertal,
    n1+v1.flertal+n2+v2.flertal,
    n1+v1.ental+n2+v2.ental,
    RAKNEORD[n1]+v1.flertal+RAKNEORD[n2]+v2.ental
  ];
  var svg = '<div class="emoji-bild">'
    + '<span class="emoji-grupp">'+emojiRad(n1,v1.emoji)+'<span class="emoji-text">'+n1+' '+v1.flertal+' · a kr</span></span>'
    + '<span class="emoji-grupp">'+emojiRad(n2,v2.emoji)+'<span class="emoji-text">'+n2+' '+v2.flertal+' · b kr</span></span>'
    + '</div>';
  return {
    intro:'En '+v1.ental+' kostar a kronor och en '+v2.ental+' kostar b kronor.',
    fraga:'Vad har '+namn+' köpt om uttrycket '+uttryck+' beskriver kostnaden?',
    svg:svg, svarTyp:'text', svar:svarText, accept:accept
  };
}
function genTolkaVarde(level){
  var v = VAROR.slice().sort(function(){return Math.random()-0.5;});
  var v1=v[0], v2=v[1];
  var n1 = level===1? d3RandInt(2,4) : d3RandInt(2,6);
  var n2 = level===1? d3RandInt(2,3) : d3RandInt(2,5);
  var a = level===1? d3RandInt(3,15) : d3RandInt(5,40);
  var b = level===1? d3RandInt(3,15) : d3RandInt(5,40);
  var namn = randPick(NAMN);
  return {
    intro:'En '+v1.ental+' kostar a kronor och en '+v2.ental+' kostar b kronor. '+namn+' köper '+n1+' '+v1.flertal+' och '+n2+' '+v2.flertal+'.',
    fraga:'Hur mycket betalar '+namn+' om a = '+a+' och b = '+b+'?',
    svarTyp:'tal', svar:n1*a + n2*b
  };
}
function genTolkaSkriv(level){
  var typ = randPick(level===1? ['ggr','plus'] : ['ggr','plus','minus']);
  var namn = randPick(NAMN);
  var v = randPick(VAROR);
  if(typ==='ggr'){
    var n = d3RandInt(3,6);
    return {fraga:'En '+v.ental+' kostar a kronor. Skriv ett uttryck för vad '+n+' '+v.flertal+' kostar.',
      svarTyp:'uttryck', svar:n+'a', accept:[n+'a','a·'+n,n+'·a']};
  }
  if(typ==='plus'){
    var k = d3RandInt(2,9);
    return {fraga:namn+' är x år. En kompis är '+k+' år äldre. Skriv ett uttryck för kompisens ålder.',
      svarTyp:'uttryck', svar:'x+'+k, accept:['x+'+k, k+'+x']};
  }
  var m = d3RandInt(2,9);
  return {fraga:namn+' är x år. En kompis är '+m+' år yngre. Skriv ett uttryck för kompisens ålder.',
    svarTyp:'uttryck', svar:'x−'+m, accept:['x-'+m]};
}

function tolkaEngine(kategori){
  var level=1, omgang=[], idx=0, results=[], OMG=6;
  var gen = kategori==='bild'? genTolkaBild : (kategori==='varde'? genTolkaVarde : genTolkaSkriv);
  var titel = kategori==='bild'? 'Tolka uttryck · vad har personen köpt?'
            : kategori==='varde'? 'Tolka uttryck · sätt in värdet'
            : 'Tolka uttryck · skriv ett eget uttryck';
  var sub = kategori==='bild'? 'Titta på bilden och skriv med ord vad personen köpt.'
          : kategori==='varde'? 'Sätt in värdena på a och b och räkna ut kostnaden.'
          : 'Skriv ett uttryck med variabeln. Använd · för gånger.';
  function nyOmgang(){ omgang=[]; for(var i=0;i<OMG;i++) omgang.push(gen(level)); idx=0; results=[]; }

  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length;
      var adj=adjustLevel(level,right,omgang.length); level=adj.level;
      app.innerHTML='<div class="view"><div class="exercise-card">'
        +'<div class="ex-header"><h2 class="ex-title">Klart!</h2>'
        +'<div class="ex-sub">Du klarade '+right+' av '+omgang.length+'.</div></div>'
        +'<div class="summary"><div class="summary-big">'+right+'/'+omgang.length+'</div>'
        +'<div class="summary-txt">'+(adj.change>0?'Bra jobbat – nästa omgång blir lite svårare.':adj.change<0?'Nästa omgång blir lite lättare.':'Fortsätt träna!')+'</div>'
        +'<div class="summary-level">Nivå '+level+'</div></div>'
        +'<div class="ex-actions"><button class="btn primary" id="next">Ny omgång</button>'
        +'<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
      document.getElementById('next').onclick=function(){ nyOmgang(); render(); };
      document.getElementById('back').onclick=function(){ renderTolkaUttryck(); };
      if(right>=omgang.length-1) konfetti();
      return;
    }
    var task=omgang[idx];
    var dots='';
    for(var i=0;i<omgang.length;i++){
      var cls = i<idx? (results[i]?'right':'wrong') : (i===idx?'current':'');
      dots+='<div class="score-dot '+cls+'"></div>';
    }
    var svarFalt;
    if(task.svarTyp==='tal'){
      svarFalt='<input class="ex-in" id="svar" inputmode="decimal" autocomplete="off"><span class="svar-fast">kr</span>';
    } else if(task.svarTyp==='uttryck'){
      svarFalt='<input class="ex-in bred" id="svar" inputmode="text" autocomplete="off" placeholder="uttryck">';
    } else {
      svarFalt='<input class="ex-in bred" id="svar" inputmode="text" autocomplete="off" placeholder="svar med ord" style="min-width:240px;">';
    }
    app.innerHTML='<div class="view"><div class="exercise-card">'
      +'<div class="ex-header"><h2 class="ex-title">'+titel+'</h2>'
      +'<div class="ex-sub">'+sub+'</div><span class="ex-level">Nivå '+level+'</span></div>'
      +'<div class="scorebar">'+dots+'</div>'
      +(task.intro?'<div class="ex-fraga">'+task.intro+'</div>':'')
      +(task.svg||'')
      +'<div class="ex-fraga" style="margin-top:10px;">'+task.fraga+'</div>'
      +'<div class="svar-rad">'+svarFalt+'</div>'
      +'<div class="ex-feedback" id="fb"></div>'
      +(task.svarTyp==='uttryck'?keypadHTML(['7','8','9','4','5','6','1','2','3','0','x','y','a','b','·','+','\u2212']):(task.svarTyp==='tal'?keypadHTML(['7','8','9','4','5','6','1','2','3','0']):''))
      +'<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button>'
      +'<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
    var inp=document.getElementById('svar');
    setTimeout(function(){ inp.focus(); },50);
    inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); check(); } });
    bindKeypad();
    document.getElementById('check').onclick=check;
    document.getElementById('back').onclick=function(){ renderTolkaUttryck(); };

    function check(){
      var fb=document.getElementById('fb'); fb.className='ex-feedback show';
      var ok;
      if(task.svarTyp==='tal') ok=jamforTal(inp.value, task.svar);
      else if(task.svarTyp==='uttryck') ok=jamforUttryck(inp.value, task.accept||[task.svar]);
      else ok=jamforText(inp.value, task.accept||[task.svar]);
      inp.disabled=true; document.getElementById('check').disabled=true;
      if(ok){ inp.classList.add('correct'); fb.classList.add('correct');
        fb.textContent='Rätt!' + (task.svarTyp==='tal'?' '+task.svar+' kr':''); }
      else { inp.classList.add('wrong'); fb.classList.add('wrong');
        fb.textContent='Rätt svar: '+(task.svarTyp==='tal'?task.svar+' kr':task.svar); }
      results.push(ok);
      var b=document.createElement('button'); b.className='btn primary'; b.textContent=(idx+1>=omgang.length?'Se resultat':'Nästa');
      b.onclick=function(){ idx++; render(); };
      document.getElementById('check').replaceWith(b);
    }
  }
  nyOmgang(); render();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderTolkaUttryck(){
  document.getElementById('hero').style.display='none';
  var kat=[
    {id:'bild',  namn:'Vad har personen köpt?', desc:'Tolka uttrycket utifrån bilden.'},
    {id:'varde', namn:'Sätt in värdet',         desc:'Räkna ut kostnaden när a och b är kända.'},
    {id:'skriv', namn:'Skriv ett eget uttryck', desc:'Skriv ett uttryck från en text.'}
  ];
  var html='<div class="view"><div class="exercise-card">'
    +'<div class="ex-header"><h2 class="ex-title">Tolka uttryck</h2>'
    +'<div class="ex-sub">Välj vad du vill träna på. Nivån anpassar sig medan du räknar.</div></div>'
    +'<div class="sub-grid" style="margin-top:6px;">';
  kat.forEach(function(k,i){
    html+='<button class="sub-card klar" data-kat="'+k.id+'">'
      +'<span class="sub-card-num">'+(i+1)+'</span>'
      +'<span class="sub-card-body"><span class="sub-card-namn">'+k.namn+'</span>'
      +'<span class="sub-card-status" style="color:var(--ink-faint);text-transform:none;letter-spacing:0;font-family:var(--sans);font-size:12px;">'+k.desc+'</span></span>'
      +'<span class="sub-card-arrow">›</span></button>';
  });
  html+='</div><div class="ex-actions"><button class="btn subtle" id="back">Till alla områden</button></div></div></div>';
  app.innerHTML=html;
  app.querySelectorAll('[data-kat]').forEach(function(btn){
    btn.onclick=function(){ tolkaEngine(btn.dataset.kat); };
  });
  document.getElementById('back').onclick=renderOversikt;
  window.scrollTo({top:0,behavior:'smooth'});
}

function keypadHTML(ops){
  if(!ops || !ops.length) return '';
  var h='<div class="keypad">';
  ops.forEach(function(op){ h+='<button type="button" class="kp-btn" data-op="'+op+'">'+op+'</button>'; });
  return h+'</div>';
}
function bindKeypad(){
  var inp=document.getElementById('svar'); if(!inp) return;
  document.querySelectorAll('.kp-btn').forEach(function(btn){
    btn.onclick=function(){ inp.value+=btn.dataset.op; inp.focus(); };
  });
}


// ============================================================
// ÖVNING: BERÄKNA MED UTTRYCK
// ============================================================
// Genererar insättningsuppgifter med mellanled (insättning → förenkling → svar),
// adaptivt nivå 1–3. Leden rättas på form, svaret på värde.

function genBerakna(level){
  function plus(n){ return (n<0 ? ' \u2212 ' + Math.abs(n) : ' + ' + n); }
  function plusForm(n){ return (n<0 ? '-' + Math.abs(n) : '+' + n); }

  if(level === 1){
    var variant = randPick(['produkt','plus','plus','minusFore','minusFore']);
    var v = randPick(['x','y','a']);
    var a = d3RandInt(2, 9);
    var val = d3RandInt(2, 9);
    if(variant==='produkt'){
      return { vansterText: a+v+',&nbsp;'+v+' = '+val,
        led: [ {accept:[a+'·'+val], visa:a+'·'+val}, {svar:a*val} ] };
    }
    if(variant==='minusFore'){
      // c − a·v, där c väljs så att svaret blir positivt: c > a·val
      var prodM = a*val;
      var c2 = prodM + d3RandInt(1, 12);   // garanterar positivt svar
      return { vansterText: c2+' \u2212 '+a+v+',&nbsp;'+v+' = '+val,
        led: [ {accept:[c2+'-'+a+'·'+val], visa:c2+' \u2212 '+a+'·'+val},
               {accept:[c2+'-'+prodM], visa:c2+' \u2212 '+prodM},
               {svar: c2 - prodM} ] };
    }
    var tecken = randPick([1,-1]), prod = a*val;
    var c;
    if(tecken < 0){ c = d3RandInt(1, Math.max(1, prod)); }  // a·v − c ≥ 0
    else { c = d3RandInt(1, 9); }
    var cc = tecken*c;
    return { vansterText: a+v+plus(cc)+',&nbsp;'+v+' = '+val,
      led: [ {accept:[a+'·'+val+plusForm(cc)], visa:a+'·'+val+plus(cc)},
             {accept:[prod+plusForm(cc)], visa:prod+plus(cc)}, {svar: prod + cc} ] };
  }

  if(level === 2){
    var tva = (Math.random() < 0.6);
    if(tva){
      var a2=d3RandInt(2,6), b2=d3RandInt(2,6), xv=d3RandInt(2,9), yv=d3RandInt(2,9);
      var prodA=a2*xv, prodB=b2*yv;
      return { vansterText:a2+'x + '+b2+'y,&nbsp;x = '+xv+' och y = '+yv,
        led:[ {accept:[a2+'·'+xv+'+'+b2+'·'+yv], visa:a2+'·'+xv+' + '+b2+'·'+yv},
              {accept:[prodA+'+'+prodB], visa:prodA+' + '+prodB}, {svar:prodA+prodB} ] };
    }
    var v3=randPick(['x','y','a','b']), a3=d3RandInt(3,9), val3=d3RandInt(5,12);
    var c3=d3RandInt(2,15), t3=randPick([1,-1]), cc3=t3*c3, prod3=a3*val3;
    return { vansterText:a3+v3+plus(cc3)+',&nbsp;'+v3+' = '+val3,
      led:[ {accept:[a3+'·'+val3+plusForm(cc3)], visa:a3+'·'+val3+plus(cc3)},
            {accept:[prod3+plusForm(cc3)], visa:prod3+plus(cc3)}, {svar:prod3+cc3} ] };
  }

  // level 3
  var medKonst = (Math.random() < 0.5);
  var a4=d3RandInt(3,8), b4=d3RandInt(2,6), xv4=d3RandInt(2,9), yv4=d3RandInt(2,9);
  var prodA4=a4*xv4, prodB4=b4*yv4;
  if(!medKonst){
    return { vansterText:a4+'x \u2212 '+b4+'y,&nbsp;x = '+xv4+' och y = '+yv4,
      led:[ {accept:[a4+'·'+xv4+'-'+b4+'·'+yv4], visa:a4+'·'+xv4+' \u2212 '+b4+'·'+yv4},
            {accept:[prodA4+'-'+prodB4], visa:prodA4+' \u2212 '+prodB4}, {svar:prodA4-prodB4} ] };
  }
  var c4=d3RandInt(2,9);
  return { vansterText:a4+'x + '+b4+'y \u2212 '+c4+',&nbsp;x = '+xv4+' och y = '+yv4,
    led:[ {accept:[a4+'·'+xv4+'+'+b4+'·'+yv4+'-'+c4], visa:a4+'·'+xv4+' + '+b4+'·'+yv4+' \u2212 '+c4},
          {accept:[prodA4+'+'+prodB4+'-'+c4], visa:prodA4+' + '+prodB4+' \u2212 '+c4}, {svar:prodA4+prodB4-c4} ] };
}

function beraknaEngine(){
  document.getElementById('hero').style.display='none';
  var level=1, omgang=[], idx=0, results=[], OMG=6;
  function nyOmgang(){ omgang=[]; for(var i=0;i<OMG;i++) omgang.push(genBerakna(level)); idx=0; results=[]; }

  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length;
      var adj=adjustLevel(level,right,omgang.length); level=adj.level;
      app.innerHTML='<div class="view"><div class="exercise-card">'
        +'<div class="ex-header"><h2 class="ex-title">Klart!</h2>'
        +'<div class="ex-sub">Du klarade '+right+' av '+omgang.length+'.</div></div>'
        +'<div class="summary"><div class="summary-big">'+right+'/'+omgang.length+'</div>'
        +'<div class="summary-txt">'+(adj.change>0?'Bra jobbat – nästa omgång blir lite svårare.':adj.change<0?'Nästa omgång blir lite lättare.':'Fortsätt träna!')+'</div>'
        +'<div class="summary-level">Nivå '+level+'</div></div>'
        +'<div class="ex-actions"><button class="btn primary" id="next">Ny omgång</button>'
        +'<button class="btn subtle" id="back">Till alla områden</button></div></div></div>';
      document.getElementById('next').onclick=function(){ nyOmgang(); render(); };
      document.getElementById('back').onclick=renderOversikt;
      if(right>=omgang.length-1) konfetti();
      return;
    }
    var task=omgang[idx];
    var dots='';
    for(var i=0;i<omgang.length;i++){
      var cls = i<idx? (results[i]?'right':'wrong') : (i===idx?'current':'');
      dots+='<div class="score-dot '+cls+'"></div>';
    }
    var ledHtml='<span class="svar-fast">'+task.vansterText+'</span><span class="svar-fast" style="margin:0 2px;">=</span>';
    task.led.forEach(function(led, li){
      var arSvar=(li===task.led.length-1);
      if(arSvar){
        ledHtml+='<input class="ex-in" data-svar="'+led.svar+'" inputmode="decimal" autocomplete="off" placeholder="svar" style="min-width:74px;">';
      } else {
        ledHtml+='<input class="ex-in bred berakna-led" data-form="'+encodeURIComponent((led.accept||[led.visa]).join('|'))
          +'" data-visa="'+led.visa+'" inputmode="text" autocomplete="off" placeholder="led" style="min-width:104px;">';
        ledHtml+='<span class="svar-fast" style="margin:0 2px;">=</span>';
      }
    });
    app.innerHTML='<div class="view"><div class="exercise-card">'
      +'<div class="ex-header"><h2 class="ex-title">Beräkna med uttryck</h2>'
      +'<div class="ex-sub">Sätt in värdet och visa mellanleden. Skriv insättningen, förenklingen och svaret.</div>'
      +'<span class="ex-level">Nivå '+level+'</span></div>'
      +'<div class="scorebar">'+dots+'</div>'
      +'<div class="svar-rad" style="font-size:18px;">'+ledHtml+'</div>'
      +'<div class="ex-feedback" id="fb"></div>'
      +keypadHTML(['7','8','9','4','5','6','1','2','3','0','·','+','\u2212'])
      +'<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button>'
      +'<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
    var ledFalt=Array.prototype.slice.call(app.querySelectorAll('.ex-in'));
    setTimeout(function(){ if(ledFalt[0]) ledFalt[0].focus(); },50);
    ledFalt.forEach(function(inp, fi){
      inp.addEventListener('keydown',function(e){
        if(e.key==='Enter'){ e.preventDefault(); if(fi+1<ledFalt.length) ledFalt[fi+1].focus(); else check(); }
      });
      if(inp.classList.contains('berakna-led')){
        inp.addEventListener('input',function(){
          var pos=inp.selectionStart, fore=inp.value.slice(0,pos);
          function ff(s){return s.replace(/\s*([+\u2212-])\s*/g,' $1 ').replace(/\s{2,}/g,' ').replace(/^\s+/,'');}
          var ny=ff(inp.value);
          if(ny!==inp.value){ var fp=ff(fore).length; inp.value=ny; try{inp.setSelectionRange(fp,fp);}catch(e){} }
        });
      }
    });
    bindKeypadMulti(ledFalt);
    document.getElementById('check').onclick=check;
    document.getElementById('back').onclick=function(){ renderOversikt(); };

    function check(){
      var fb=document.getElementById('fb'); fb.className='ex-feedback show';
      var alltRatt=true;
      ledFalt.forEach(function(inp){
        inp.disabled=true;
        var ok;
        if(inp.dataset.form!==undefined) ok=jamforForm(inp.value, decodeURIComponent(inp.dataset.form).split('|'));
        else ok=jamforTal(inp.value, parseFloat(inp.dataset.svar));
        inp.classList.add(ok?'correct':'wrong');
        if(!ok) alltRatt=false;
      });
      document.getElementById('check').disabled=true;
      if(alltRatt){ fb.classList.add('correct'); fb.textContent='Rätt – snyggt uppställt!'; }
      else { fb.classList.add('wrong');
        fb.innerHTML='Rätt: '+task.led.map(function(l){return l.svar!==undefined?l.svar:l.visa;}).join(' = '); }
      results.push(alltRatt);
      var b=document.createElement('button'); b.className='btn primary'; b.textContent=(idx+1>=omgang.length?'Se resultat':'Nästa');
      b.onclick=function(){ idx++; render(); };
      document.getElementById('check').replaceWith(b);
    }
  }
  nyOmgang(); render();
  window.scrollTo({top:0,behavior:'smooth'});
}

function bindKeypadMulti(falt){
  var sist=falt[0];
  falt.forEach(function(f){ f.addEventListener('focus',function(){ sist=f; }); });
  document.querySelectorAll('.kp-btn').forEach(function(btn){
    btn.onclick=function(){
      if(sist && !sist.disabled){ sist.value+=btn.dataset.op; sist.focus();
        var cl=sist.classList;
        if(cl.contains('berakna-led')||cl.contains('forenkla-led')||cl.contains('skriva-led')){
          var ev=document.createEvent('Event'); ev.initEvent('input',true,true); sist.dispatchEvent(ev); } }
    };
  });
}

// ============================================================
// ÖVNING: FÖRENKLA UTTRYCK
// ============================================================
// Picker med fem kategorier; adaptiva generatorer nivå 1–3.
// Svar rättas symboliskt (en/två variabler, bråk), så olika ordning godtas.

function teckenStr(n, forst){
  // visning av en term med tecken, t.ex. " + 3x" / " − 2y". forst=true → utan inledande +
  if(forst) return (n<0?'\u2212':'') + Math.abs(n);
  return (n<0?' \u2212 ':' + ') + Math.abs(n);
}
function termStr(koef, v, forst){
  var k = Math.abs(koef);
  var ks = (k===1? '' : k) + v;
  if(forst) return (koef<0?'\u2212':'') + ks;
  return (koef<0?' \u2212 ':' + ') + ks;
}

// Generator: förenkla med EN variabel (ax + b efter hopslagning)
function genForenklaEn(level){
  var v = randPick(['x','y','a']);
  if(level===1){
    // x + x + x  eller  2x + 3x  → ren variabel
    var t1=d3RandInt(1,4), t2=d3RandInt(1,4), t3=(Math.random()<0.5?d3RandInt(1,3):0);
    var delar=[t1,t2]; if(t3) delar.push(t3);
    var fraga=delar.map(function(k,i){return termStr(k,v,i===0);}).join('');
    var summa=delar.reduce(function(a,b){return a+b;},0);
    return {fraga:fraga, svar:summa+v, accept:[summa+v]};
  }
  // ax + c ± dx ± e
  var a1=d3RandInt(2,6), c1=d3RandInt(1,9), a2=d3RandInt(1,5), c2=d3RandInt(1,9);
  var s2=randPick([1,-1]), s3=randPick([1,-1]);
  var fraga=a1+v+' + '+c1+termStr(s2*a2,v,false).replace(/^ /,' ')+teckenStr(s3*c2,false);
  // bygg tydligt: a1v + c1 ± a2v ± c2
  fraga = a1+v+' + '+c1 + (s2<0?' \u2212 ':' + ')+a2+v + (s3<0?' \u2212 ':' + ')+c2;
  var koefV=a1+s2*a2, konst=c1+s3*c2;
  var svar;
  if(konst===0) svar=koefV+v;
  else svar=(koefV+v)+(konst<0?'\u2212':'+')+Math.abs(konst);
  return {fraga:fraga, svar:svar.replace('\u2212','-'), accept:[koefV+v+(konst<0?'-':'+')+Math.abs(konst)], _facit:koefV+v+(konst<0?'-':'+')+Math.abs(konst)};
}

// Generator: förenkla med TVÅ variabler
function genForenklaTva(level){
  var ax=d3RandInt(2,7), bx=d3RandInt(1,5), ay=d3RandInt(2,6), by=d3RandInt(1,5);
  var sx=randPick([1,-1]), sy=randPick([1,-1]);
  var koefX=ax+sx*bx, koefY=ay+sy*by;
  // se till att x-koefficienten blir positiv och ej noll
  if(koefX<=0){ ax+=3; koefX=ax+sx*bx; }
  if(koefY===0){ ay+=1; koefY=ay+sy*by; }
  var fraga=ax+'x + '+ay+'y'+(sx<0?' \u2212 ':' + ')+bx+'x'+(sy<0?' \u2212 ':' + ')+by+'y';
  var facit=koefX+'x'+(koefY<0?'-':'+')+Math.abs(koefY)+'y';
  var visa=koefX+'x'+(koefY<0?' \u2212 ':' + ')+Math.abs(koefY)+'y';
  return {fraga:fraga, svar:visa, accept:[facit]};
}

// Generator: omkrets (figur med SVG)
var FORENKLA_FIGURER = [
  function(){ // rektangel ax × c
    var a=d3RandInt(2,5), c=d3RandInt(3,9);
    var svg='<svg viewBox="0 0 220 120" width="220" height="120" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="33" width="130" height="54" fill="#f59e42" stroke="#b05a00" stroke-width="2.5"/><text x="105" y="26" text-anchor="middle" font-size="14" font-style="italic" fill="#7a3d00">'+a+'x</text><text x="105" y="105" text-anchor="middle" font-size="14" font-style="italic" fill="#7a3d00">'+a+'x</text><text x="183" y="64" text-anchor="middle" font-size="14" font-style="italic" fill="#7a3d00">'+c+'</text><text x="28" y="64" text-anchor="middle" font-size="14" font-style="italic" fill="#7a3d00">'+c+'</text></svg>';
    return {svg:svg, uppstallning:a+'x + '+c+' + '+a+'x + '+c, facit:(2*a)+'x+'+(2*c), visa:(2*a)+'x + '+(2*c)};
  },
  function(){ // likbent triangel 2 sidor my, bas c
    var m=d3RandInt(2,4), c=d3RandInt(3,8);
    var svg='<svg viewBox="0 0 200 140" width="200" height="140" xmlns="http://www.w3.org/2000/svg"><polygon points="100,30 60,110 140,110" fill="#fde047" stroke="#b08900" stroke-width="2.5"/><text x="66" y="72" text-anchor="middle" font-size="14" font-style="italic" fill="#7a5d00">'+m+'y</text><text x="134" y="72" text-anchor="middle" font-size="14" font-style="italic" fill="#7a5d00">'+m+'y</text><text x="100" y="128" text-anchor="middle" font-size="14" font-style="italic" fill="#7a5d00">'+c+'</text></svg>';
    return {svg:svg, uppstallning:m+'y + '+m+'y + '+c, facit:(2*m)+'y+'+c, visa:(2*m)+'y + '+c};
  },
  function(){ // triangel olika: c1, ax, c2, bx (fyrhörning enkel)
    var a=d3RandInt(2,4), b=d3RandInt(1,3), c1=d3RandInt(10,25), c2=d3RandInt(10,25);
    var svg='<svg viewBox="0 0 220 130" width="220" height="130" xmlns="http://www.w3.org/2000/svg"><polygon points="35,95 35,45 120,30 150,95" fill="#fde68a" stroke="#b08900" stroke-width="2.5"/><text x="78" y="28" text-anchor="middle" font-size="13" font-style="italic" fill="#7a5d00">'+c1+'</text><text x="150" y="60" text-anchor="middle" font-size="13" font-style="italic" fill="#7a5d00">'+a+'x</text><text x="92" y="112" text-anchor="middle" font-size="13" font-style="italic" fill="#7a5d00">'+c2+'</text><text x="20" y="72" text-anchor="middle" font-size="13" font-style="italic" fill="#7a5d00">'+b+'x</text></svg>';
    return {svg:svg, uppstallning:c1+' + '+a+'x + '+c2+' + '+b+'x', facit:(a+b)+'x+'+(c1+c2), visa:(a+b)+'x + '+(c1+c2)};
  }
];
function genForenklaOmkrets(level){
  var f = (level===1? FORENKLA_FIGURER[Math.random()<0.5?0:1] : randPick(FORENKLA_FIGURER))();
  return {svg:f.svg, uppstallning:f.uppstallning, svar:f.visa, accept:[f.facit], placeholder:f.uppstallning};
}

// Generator: bråk-uttryck
function genForenklaBrak(level){
  var v = randPick(['x','y','a']);
  var mult=d3RandInt(2,4), namnare=randPick([2,3]);
  var taljkoef=mult*namnare; // så taljkoef/namnare = mult (heltal)
  var b=d3RandInt(2,6), s=randPick([1,-1]);
  // (taljkoef·v)/namnare + b·v  → (mult + s·b? ) nej: vi gör (tk v)/n ± c
  var c=d3RandInt(2,9), sc=randPick([1,-1]);
  var koef = mult; // efter division
  var fraga='<span class="brak"><span class="taljare">'+taljkoef+v+'</span><span class="namnare">'+namnare+'</span></span>'
    + (sc<0?' \u2212 ':' + ') + c + 'v'.replace('v','');
  // enklare: (tk v)/n + b·v ± c   → (mult+b)v ± c
  fraga='<span class="brak"><span class="taljare">'+taljkoef+v+'</span><span class="namnare">'+namnare+'</span></span> + '+b+v+(sc<0?' \u2212 ':' + ')+c;
  var koefV=mult+b, konst=sc*c;
  var facit=koefV+v+(konst<0?'-':'+')+Math.abs(konst);
  var visa=koefV+v+(konst<0?' \u2212 ':' + ')+Math.abs(konst);
  return {fragaHtml:fraga, svar:visa, accept:[facit], rawUttryck:'('+taljkoef+v+')/'+namnare+'+'+b+v+(sc<0?'-':'+')+c};
}

function forenklaEngine(kategori){
  document.getElementById('hero').style.display='none';
  var level=1, omgang=[], idx=0, results=[], OMG=6;
  var gen = {en:genForenklaEn, tva:genForenklaTva, omkrets:genForenklaOmkrets, brak:genForenklaBrak}[kategori];
  var titel = {en:'Förenkla · en variabel', tva:'Förenkla · två variabler', omkrets:'Förenkla · omkrets', brak:'Förenkla · med division'}[kategori];
  var sub = kategori==='omkrets'? 'Skriv uppställningen och det förenklade uttrycket.'
          : 'Lägg ihop termer av samma sort. Skriv det förenklade uttrycket.';
  function nyOmgang(){ omgang=[]; for(var i=0;i<OMG;i++) omgang.push(gen(level)); idx=0; results=[]; }

  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length;
      var adj=adjustLevel(level,right,omgang.length); level=adj.level;
      app.innerHTML='<div class="view"><div class="exercise-card">'
        +'<div class="ex-header"><h2 class="ex-title">Klart!</h2><div class="ex-sub">Du klarade '+right+' av '+omgang.length+'.</div></div>'
        +'<div class="summary"><div class="summary-big">'+right+'/'+omgang.length+'</div>'
        +'<div class="summary-txt">'+(adj.change>0?'Bra jobbat – nästa omgång blir lite svårare.':adj.change<0?'Nästa omgång blir lite lättare.':'Fortsätt träna!')+'</div>'
        +'<div class="summary-level">Nivå '+level+'</div></div>'
        +'<div class="ex-actions"><button class="btn primary" id="next">Ny omgång</button>'
        +'<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
      document.getElementById('next').onclick=function(){ nyOmgang(); render(); };
      document.getElementById('back').onclick=function(){ renderForenkla(); };
      if(right>=omgang.length-1) konfetti();
      return;
    }
    var task=omgang[idx], dots='';
    for(var i=0;i<omgang.length;i++){
      var cls=i<idx?(results[i]?'right':'wrong'):(i===idx?'current':'');
      dots+='<div class="score-dot '+cls+'"></div>';
    }
    var kropp;
    if(kategori==='omkrets'){
      kropp='<div class="emoji-bild" style="padding:14px;">'+task.svg+'</div>'
        +'<div class="svar-rad"><span class="svar-fast">Omkrets =</span>'
        +'<input class="ex-in bred forenkla-led" id="mellan" data-form="'+encodeURIComponent(task.accept.join('|'))+'" inputmode="text" autocomplete="off" placeholder="uppställning" style="min-width:170px;">'
        +'<span class="svar-fast">=</span>'
        +'<input class="ex-in bred" id="svar" inputmode="text" autocomplete="off" placeholder="förenkla" style="min-width:120px;"></div>';
    } else {
      var fr = task.fragaHtml || task.fraga;
      kropp='<div class="ex-fraga ex-num" style="font-size:21px;">'+fr+'</div>'
        +'<div class="svar-rad"><span class="svar-fast">=</span>'
        +'<input class="ex-in bred" id="svar" inputmode="text" autocomplete="off" placeholder="förenkla" style="min-width:150px;"></div>';
    }
    app.innerHTML='<div class="view"><div class="exercise-card">'
      +'<div class="ex-header"><h2 class="ex-title">'+titel+'</h2><div class="ex-sub">'+sub+'</div><span class="ex-level">Nivå '+level+'</span></div>'
      +'<div class="scorebar">'+dots+'</div>'+kropp
      +'<div class="ex-feedback" id="fb"></div>'+keypadHTML(['7','8','9','4','5','6','1','2','3','0','x','y','a','b','·','+','\u2212'])
      +'<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button>'
      +'<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
    var falt=Array.prototype.slice.call(app.querySelectorAll('.ex-in'));
    setTimeout(function(){ if(falt[0]) falt[0].focus(); },50);
    falt.forEach(function(inp,fi){
      inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault(); if(fi+1<falt.length) falt[fi+1].focus(); else check();} });
      if(inp.classList.contains('forenkla-led')){
        inp.addEventListener('input',function(){
          var pos=inp.selectionStart, fore=inp.value.slice(0,pos);
          function ff(s){return s.replace(/\s*([+\u2212-])\s*/g,' $1 ').replace(/\s{2,}/g,' ').replace(/^\s+/,'');}
          var ny=ff(inp.value); if(ny!==inp.value){var fp=ff(fore).length;inp.value=ny;try{inp.setSelectionRange(fp,fp);}catch(e){}}
        });
      }
    });
    bindKeypadMulti(falt);
    document.getElementById('check').onclick=check;
    document.getElementById('back').onclick=function(){ renderForenkla(); };

    function check(){
      var fb=document.getElementById('fb'); fb.className='ex-feedback show';
      var svarInp=document.getElementById('svar');
      var alltRatt=true;
      if(kategori==='omkrets'){
        var mInp=document.getElementById('mellan');
        mInp.disabled=true;
        var mOk=jamforForm(mInp.value, decodeURIComponent(mInp.dataset.form).split('|')) || jamforFler(mInp.value, task.accept[0]);
        mInp.classList.add(mOk?'correct':'wrong'); if(!mOk) alltRatt=false;
      }
      svarInp.disabled=true;
      var sOk = jamforUttryck(svarInp.value, task.accept) || jamforFler(svarInp.value, task.accept[0]);
      svarInp.classList.add(sOk?'correct':'wrong'); if(!sOk) alltRatt=false;
      document.getElementById('check').disabled=true;
      if(alltRatt){ fb.classList.add('correct'); fb.textContent='Rätt!'; }
      else { fb.classList.add('wrong'); fb.textContent='Rätt svar: '+task.svar; }
      results.push(alltRatt);
      var b=document.createElement('button'); b.className='btn primary'; b.textContent=(idx+1>=omgang.length?'Se resultat':'Nästa');
      b.onclick=function(){ idx++; render(); };
      document.getElementById('check').replaceWith(b);
    }
  }
  nyOmgang(); render();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderForenkla(){
  document.getElementById('hero').style.display='none';
  var kat=[
    {id:'en',      namn:'En variabel',     desc:'T.ex. 2x + 5 + 3x + 7.'},
    {id:'tva',     namn:'Två variabler',   desc:'T.ex. 6x + 2y − 3x + 4y.'},
    {id:'omkrets', namn:'Figurens omkrets',desc:'Skriv uppställning och förenkla.'},
    {id:'brak',    namn:'Med division',    desc:'T.ex. 9x/3 + 2x.'}
  ];
  var html='<div class="view"><div class="exercise-card">'
    +'<div class="ex-header"><h2 class="ex-title">Förenkla uttryck</h2>'
    +'<div class="ex-sub">Välj vad du vill träna på. Nivån anpassar sig medan du räknar.</div></div>'
    +'<div class="sub-grid" style="margin-top:6px;">';
  kat.forEach(function(k,i){
    html+='<button class="sub-card klar" data-kat="'+k.id+'"><span class="sub-card-num">'+(i+1)+'</span>'
      +'<span class="sub-card-body"><span class="sub-card-namn">'+k.namn+'</span>'
      +'<span class="sub-card-status" style="color:var(--ink-faint);text-transform:none;letter-spacing:0;font-family:var(--sans);font-size:12px;">'+k.desc+'</span></span>'
      +'<span class="sub-card-arrow">›</span></button>';
  });
  html+='</div><div class="ex-actions"><button class="btn subtle" id="back">Till alla områden</button></div></div></div>';
  app.innerHTML=html;
  app.querySelectorAll('[data-kat]').forEach(function(btn){ btn.onclick=function(){ forenklaEngine(btn.dataset.kat); }; });
  document.getElementById('back').onclick=renderOversikt;
  window.scrollTo({top:0,behavior:'smooth'});
}


// ============================================================
// ÖVNING: SKRIVA UTTRYCK
// ============================================================
// Tre delar: 1) textuppgifter  2) geometriska figurer  3) sträckor.
// Adaptiva generatorer nivå 1–3. Uttryckssvar rättas symboliskt.

// ---- 1. TEXTUPPGIFTER ----
function genSkrivText(level){
  var namn = randPick(NAMN);
  var v = randPick(['x','a','y']);
  var typer;
  if(level===1) typer=['fler','farre','ggr'];
  else if(level===2) typer=['fler','farre','ggr','halften','aldre'];
  else typer=['ggr','halften','summa','aldre','dubbeltplus'];
  var typ = randPick(typer);
  var sak = randPick(['kulor','kort','kronor','poäng','klistermärken','snäckor','pärlor']);
  if(typ==='fler'){
    var k=d3RandInt(2,12);
    return {fraga:namn+' har '+v+' '+sak+'. '+namn+' får '+k+' till. Skriv ett uttryck för hur många '+sak+' '+namn+' har nu.',
      svar:v+'+'+k, accept:[v+'+'+k, k+'+'+v]};
  }
  if(typ==='farre'){
    var k2=d3RandInt(2,9);
    return {fraga:namn+' har '+v+' '+sak+'. '+namn+' ger bort '+k2+'. Skriv ett uttryck för hur många '+sak+' '+namn+' har kvar.',
      svar:v+'\u2212'+k2, accept:[v+'-'+k2]};
  }
  if(typ==='ggr'){
    var k3=d3RandInt(2,6);
    return {fraga:namn+' har '+v+' '+sak+'. En kompis har '+k3+' gånger så många. Skriv ett uttryck för kompisens antal.',
      svar:k3+v, accept:[k3+v, v+'·'+k3, k3+'·'+v]};
  }
  if(typ==='halften'){
    return {fraga:namn+' har '+v+' '+sak+'. En kompis har hälften så många. Skriv ett uttryck för kompisens antal.',
      svar:v+'/2', accept:[v+'/2']};
  }
  if(typ==='aldre'){
    var k4=d3RandInt(2,9);
    return {fraga:namn+' är '+v+' år. Ett syskon är '+k4+' år äldre. Skriv ett uttryck för syskonets ålder.',
      svar:v+'+'+k4, accept:[v+'+'+k4, k4+'+'+v]};
  }
  if(typ==='dubbeltplus'){
    var k5=d3RandInt(2,8);
    return {fraga:namn+' är '+v+' år. Ett syskon är dubbelt så gammalt plus '+k5+' år. Skriv ett uttryck för syskonets ålder.',
      svar:'2'+v+'+'+k5, accept:['2'+v+'+'+k5, k5+'+2'+v]};
  }
  // summa: tre saker uttryckta i v
  var k6=d3RandInt(2,6);
  return {fraga:namn+' har '+v+' '+sak+'. Ett syskon har '+k6+' fler. Skriv ett uttryck för hur många de har tillsammans (förenklat).',
    svar:'2'+v+'+'+k6, accept:['2'+v+'+'+k6, k6+'+2'+v]};
}

// ---- 2. GEOMETRISKA FIGURER (omkrets) ----
function genSkrivFigur(level){
  var v = randPick(['x','y','a']);
  var typ;
  if(level===1) typ=randPick(['kvadrat','rektangel']);
  else if(level===2) typ=randPick(['rektangel','triangel-lik','triangel-olik']);
  else typ=randPick(['triangel-olik','rektangel2','femhorning']);

  if(typ==='kvadrat'){
    var svg='<svg viewBox="0 0 150 150" width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="35" width="75" height="75" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="77" y="28" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+v+'</text><text x="77" y="126" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+v+'</text><text x="30" y="78" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+v+'</text><text x="124" y="78" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+v+'</text></svg>';
    return {svg:svg, figurTyp:'kvadrat', uppstallning:v+' + '+v+' + '+v+' + '+v, svar:'4'+v, accept:['4'+v]};
  }
  if(typ==='rektangel'){
    var k=d3RandInt(2,9);
    var svg='<svg viewBox="0 0 220 120" width="220" height="120" xmlns="http://www.w3.org/2000/svg"><rect x="45" y="33" width="130" height="54" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="110" y="26" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+v+'</text><text x="110" y="104" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+v+'</text><text x="33" y="64" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+k+'</text><text x="187" y="64" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+k+'</text></svg>';
    return {svg:svg, figurTyp:'rektangel', uppstallning:v+' + '+k+' + '+v+' + '+k, svar:'2'+v+'+'+(2*k), accept:['2'+v+'+'+(2*k),(2*k)+'+2'+v]};
  }
  if(typ==='rektangel2'){
    var a=d3RandInt(2,4), b=d3RandInt(1,3);
    var svg='<svg viewBox="0 0 220 120" width="220" height="120" xmlns="http://www.w3.org/2000/svg"><rect x="45" y="33" width="130" height="54" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="110" y="26" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+a+v+'</text><text x="110" y="104" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+a+v+'</text><text x="33" y="64" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+b+v+'</text><text x="187" y="64" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+b+v+'</text></svg>';
    return {svg:svg, figurTyp:'rektangel2', uppstallning:a+v+' + '+b+v+' + '+a+v+' + '+b+v, svar:(2*a+2*b)+v, accept:[(2*a+2*b)+v]};
  }
  if(typ==='triangel-lik'){
    var m=d3RandInt(2,4), bas=d3RandInt(3,8);
    var svg='<svg viewBox="0 0 200 150" width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="100,30 60,110 140,110" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="66" y="72" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+m+v+'</text><text x="134" y="72" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+m+v+'</text><text x="100" y="128" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+bas+'</text></svg>';
    return {svg:svg, figurTyp:'triangel-lik', uppstallning:m+v+' + '+m+v+' + '+bas, svar:(2*m)+v+'+'+bas, accept:[(2*m)+v+'+'+bas,bas+'+'+(2*m)+v]};
  }
  if(typ==='triangel-olik'){
    var s1=d3RandInt(2,4), s2=d3RandInt(2,5), s3=d3RandInt(2,4);
    var svg='<svg viewBox="0 0 200 150" width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="40,120 40,40 150,120" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="26" y="82" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+s1+v+'</text><text x="105" y="74" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+s2+v+'</text><text x="95" y="138" text-anchor="middle" font-size="14" font-style="italic" fill="#27365a">'+s3+v+'</text></svg>';
    return {svg:svg, figurTyp:'triangel-olik', uppstallning:s1+v+' + '+s2+v+' + '+s3+v, svar:(s1+s2+s3)+v, accept:[(s1+s2+s3)+v]};
  }
  // femhörning med konstanter
  var p=d3RandInt(2,3), c1=d3RandInt(2,6), c2=d3RandInt(2,6);
  var svg='<svg viewBox="0 0 200 150" width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="100,25 165,70 140,130 60,130 35,70" fill="#b8c4e0" stroke="#3a4a72" stroke-width="2.5"/><text x="125" y="40" text-anchor="middle" font-size="13" font-style="italic" fill="#27365a">'+p+v+'</text><text x="160" y="105" text-anchor="middle" font-size="13" font-style="italic" fill="#27365a">'+c1+'</text><text x="100" y="145" text-anchor="middle" font-size="13" font-style="italic" fill="#27365a">'+p+v+'</text><text x="40" y="105" text-anchor="middle" font-size="13" font-style="italic" fill="#27365a">'+c2+'</text><text x="62" y="40" text-anchor="middle" font-size="13" font-style="italic" fill="#27365a">'+p+v+'</text></svg>';
  return {svg:svg, figurTyp:'femhorning', uppstallning:p+v+' + '+c1+' + '+p+v+' + '+c2+' + '+p+v, svar:(3*p)+v+'+'+(c1+c2), accept:[(3*p)+v+'+'+(c1+c2),(c1+c2)+'+'+(3*p)+v]};
}

// ---- 3. STRÄCKOR ----
function strackaSVG(segments, helText){
  // segments: array av {label, frac} som tillsammans = hela röda sträckan
  var W=300, x0=20, y1=22, y2=48, total=segments.reduce(function(a,s){return a+s.frac;},0);
  var svg='<svg viewBox="0 0 340 70" width="340" height="70" xmlns="http://www.w3.org/2000/svg">';
  // röd hel sträcka
  svg+='<line x1="'+x0+'" y1="'+y1+'" x2="'+(x0+W)+'" y2="'+y1+'" stroke="#c0392b" stroke-width="3"/>';
  svg+='<line x1="'+x0+'" y1="'+(y1-6)+'" x2="'+x0+'" y2="'+(y1+6)+'" stroke="#c0392b" stroke-width="2"/>';
  svg+='<line x1="'+(x0+W)+'" y1="'+(y1-6)+'" x2="'+(x0+W)+'" y2="'+(y1+6)+'" stroke="#c0392b" stroke-width="2"/>';
  // svarta segment
  var cx=x0;
  segments.forEach(function(s){
    var w=W*s.frac/total;
    svg+='<line x1="'+cx+'" y1="'+y2+'" x2="'+(cx+w)+'" y2="'+y2+'" stroke="#333" stroke-width="2"/>';
    svg+='<line x1="'+cx+'" y1="'+(y2-6)+'" x2="'+cx+'" y2="'+(y2+6)+'" stroke="#333" stroke-width="2"/>';
    svg+='<text x="'+(cx+w/2)+'" y="'+(y2+18)+'" text-anchor="middle" font-size="13" font-style="italic">'+s.label+'</text>';
    cx+=w;
  });
  svg+='<line x1="'+(x0+W)+'" y1="'+(y2-6)+'" x2="'+(x0+W)+'" y2="'+(y2+6)+'" stroke="#333" stroke-width="2"/>';
  svg+='</svg>';
  return svg;
}
function genSkrivStracka(level){
  var v=randPick(['x','a']);
  var typ;
  if(level===1) typ=randPick(['v-plus-tal','tal-plus-v']);
  else if(level===2) typ=randPick(['v-plus-tal','tre-v','v-tal-v']);
  else typ=randPick(['tre-v','v-tal-v-tal','tal-minus-v']);

  if(typ==='v-plus-tal'){
    var k=d3RandInt(2,9);
    return {svg:strackaSVG([{label:v,frac:2},{label:k,frac:1.4}]), svar:v+'+'+k, accept:[v+'+'+k,k+'+'+v]};
  }
  if(typ==='tal-plus-v'){
    var k2=d3RandInt(2,9);
    return {svg:strackaSVG([{label:k2,frac:1.6},{label:v,frac:2}]), svar:v+'+'+k2, accept:[v+'+'+k2,k2+'+'+v]};
  }
  if(typ==='tre-v'){
    return {svg:strackaSVG([{label:v,frac:1},{label:v,frac:1},{label:v,frac:1}]), svar:'3'+v, accept:['3'+v,v+'+'+v+'+'+v]};
  }
  if(typ==='v-tal-v'){
    var k3=d3RandInt(2,6);
    return {svg:strackaSVG([{label:v,frac:1.6},{label:k3,frac:1},{label:v,frac:1.6}]), svar:'2'+v+'+'+k3, accept:['2'+v+'+'+k3,k3+'+2'+v]};
  }
  if(typ==='v-tal-v-tal'){
    var k4=d3RandInt(2,5), k5=d3RandInt(2,5);
    return {svg:strackaSVG([{label:v,frac:1.4},{label:k4,frac:1},{label:v,frac:1.4},{label:k5,frac:1}]), svar:'2'+v+'+'+(k4+k5), accept:['2'+v+'+'+(k4+k5),(k4+k5)+'+2'+v]};
  }
  // tal-minus-v: hela = tal, en del = v, röda (resten) = tal − v
  var helt=d3RandInt(10,24);
  return {svg:strackaSVG([{label:helt+' (hela)',frac:3}]).replace('</svg>','')
      + '<line x1="200" y1="48" x2="320" y2="48" stroke="#c0392b" stroke-width="3"/><text x="260" y="66" text-anchor="middle" font-size="13" font-style="italic">'+v+'</text></svg>',
    svar:helt+'\u2212'+v, accept:[helt+'-'+v], _enkel:true};
}

function skrivaEngine(kategori){
  document.getElementById('hero').style.display='none';
  var level=1, omgang=[], idx=0, results=[], OMG=6;
  var gen = {text:genSkrivText, figur:genSkrivFigur, stracka:genSkrivStracka}[kategori];
  var titel = {text:'Skriva uttryck · textuppgifter', figur:'Skriva uttryck · geometriska figurer', stracka:'Skriva uttryck · sträckor'}[kategori];
  var sub = kategori==='text'? 'Läs texten och skriv ett uttryck. Använd · för gånger och / för delat.'
          : kategori==='figur'? 'Skriv först ett uttryck för omkretsen, förenkla det sedan.'
          : 'Skriv ett uttryck för längden av den röda sträckan.';
  function nyOmgang(){
    omgang=[]; idx=0; results=[];
    if(kategori==='figur'){
      var sista=null;
      for(var i=0;i<OMG;i++){
        var t, forsok=0;
        do { t=gen(level); forsok++; } while(t.figurTyp===sista && forsok<12);
        sista=t.figurTyp; omgang.push(t);
      }
    } else {
      for(var j=0;j<OMG;j++) omgang.push(gen(level));
    }
  }

  function render(){
    if(idx>=omgang.length){
      var right=results.filter(function(x){return x;}).length;
      var adj=adjustLevel(level,right,omgang.length); level=adj.level;
      app.innerHTML='<div class="view"><div class="exercise-card">'
        +'<div class="ex-header"><h2 class="ex-title">Klart!</h2><div class="ex-sub">Du klarade '+right+' av '+omgang.length+'.</div></div>'
        +'<div class="summary"><div class="summary-big">'+right+'/'+omgang.length+'</div>'
        +'<div class="summary-txt">'+(adj.change>0?'Bra jobbat – nästa omgång blir lite svårare.':adj.change<0?'Nästa omgång blir lite lättare.':'Fortsätt träna!')+'</div>'
        +'<div class="summary-level">Nivå '+level+'</div></div>'
        +'<div class="ex-actions"><button class="btn primary" id="next">Ny omgång</button>'
        +'<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
      document.getElementById('next').onclick=function(){ nyOmgang(); render(); };
      document.getElementById('back').onclick=function(){ renderSkriva(); };
      if(right>=omgang.length-1) konfetti();
      return;
    }
    var task=omgang[idx], dots='';
    for(var i=0;i<omgang.length;i++){ var cls=i<idx?(results[i]?'right':'wrong'):(i===idx?'current':''); dots+='<div class="score-dot '+cls+'"></div>'; }
    var kropp;
    if(kategori==='text'){
      kropp='<div class="ex-fraga">'+task.fraga+'</div>'
        +'<div class="svar-rad"><input class="ex-in bred skriva-led" id="svar" inputmode="text" autocomplete="off" placeholder="skriv ett uttryck" style="min-width:160px;"></div>';
    } else if(kategori==='figur'){
      kropp='<div class="emoji-bild" style="padding:14px;">'+task.svg+'</div>'
        +'<div class="svar-rad"><span class="svar-fast">Omkrets =</span>'
        +'<input class="ex-in bred skriva-led" id="mellan" inputmode="text" autocomplete="off" placeholder="skriv ett uttryck" style="min-width:150px;">'
        +'<span class="svar-fast">=</span>'
        +'<input class="ex-in bred skriva-led" id="svar" inputmode="text" autocomplete="off" placeholder="förenkla" style="min-width:120px;"></div>';
    } else {
      kropp='<div class="emoji-bild" style="padding:14px;">'+task.svg+'</div>'
        +'<div class="svar-rad"><span class="svar-fast">Röda sträckan =</span>'
        +'<input class="ex-in bred skriva-led" id="svar" inputmode="text" autocomplete="off" placeholder="skriv ett uttryck" style="min-width:140px;"></div>';
    }
    app.innerHTML='<div class="view"><div class="exercise-card">'
      +'<div class="ex-header"><h2 class="ex-title">'+titel+'</h2><div class="ex-sub">'+sub+'</div><span class="ex-level">Nivå '+level+'</span></div>'
      +'<div class="scorebar">'+dots+'</div>'+kropp
      +'<div class="ex-feedback" id="fb"></div>'+keypadHTML(['7','8','9','4','5','6','1','2','3','0','x','y','a','·','/','+','\u2212'])
      +'<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button>'
      +'<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
    var falt=Array.prototype.slice.call(app.querySelectorAll('.ex-in'));
    var inp=document.getElementById('svar');
    setTimeout(function(){ if(falt[0]) falt[0].focus(); },50);
    falt.forEach(function(f, fi){
      f.addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault(); if(fi+1<falt.length) falt[fi+1].focus(); else check();} });
      f.addEventListener('input',function(){
        var pos=f.selectionStart, fore=f.value.slice(0,pos);
        function ff(s){return s.replace(/\s*([+\u2212-])\s*/g,' $1 ').replace(/\s{2,}/g,' ').replace(/^\s+/,'');}
        var ny=ff(f.value);
        if(ny!==f.value){ var fp=ff(fore).length; f.value=ny; try{f.setSelectionRange(fp,fp);}catch(e){} }
      });
    });
    bindKeypadMulti(falt);
    document.getElementById('check').onclick=check;
    document.getElementById('back').onclick=function(){ renderSkriva(); };

    function check(){
      var fb=document.getElementById('fb'); fb.className='ex-feedback show';
      document.getElementById('check').disabled=true;
      var ok=true;
      if(kategori==='figur'){
        var mInp=document.getElementById('mellan');
        mInp.disabled=true;
        // mellanledet (uppställningen) ska förenklas till samma som svaret
        var mOk = jamforFler(mInp.value, task.svar) || jamforUttryck(mInp.value, task.accept);
        mInp.classList.add(mOk?'correct':'wrong'); if(!mOk) ok=false;
      }
      inp.disabled=true;
      var sOk=jamforUttryck(inp.value, task.accept) || jamforFler(inp.value, task.accept[0]);
      inp.classList.add(sOk?'correct':'wrong'); if(!sOk) ok=false;
      if(ok){ fb.classList.add('correct'); fb.textContent='Rätt!'; }
      else { fb.classList.add('wrong'); fb.textContent='Rätt svar: '+(kategori==='figur'?(task.uppstallning+' = '+task.svar):task.svar); }
      results.push(ok);
      var b=document.createElement('button'); b.className='btn primary'; b.textContent=(idx+1>=omgang.length?'Se resultat':'Nästa');
      b.onclick=function(){ idx++; render(); };
      document.getElementById('check').replaceWith(b);
    }
  }
  nyOmgang(); render();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderSkriva(){
  document.getElementById('hero').style.display='none';
  var kat=[
    {id:'text',    namn:'Textuppgifter',       desc:'Skriv uttryck från en text.'},
    {id:'figur',   namn:'Geometriska figurer', desc:'Skriv figurens omkrets.'},
    {id:'stracka', namn:'Sträckor',            desc:'Skriv längden av den röda sträckan.'}
  ];
  var html='<div class="view"><div class="exercise-card">'
    +'<div class="ex-header"><h2 class="ex-title">Skriva uttryck</h2>'
    +'<div class="ex-sub">Välj vad du vill träna på. Nivån anpassar sig medan du räknar.</div></div>'
    +'<div class="sub-grid" style="margin-top:6px;">';
  kat.forEach(function(k,i){
    html+='<button class="sub-card klar" data-kat="'+k.id+'"><span class="sub-card-num">'+(i+1)+'</span>'
      +'<span class="sub-card-body"><span class="sub-card-namn">'+k.namn+'</span>'
      +'<span class="sub-card-status" style="color:var(--ink-faint);text-transform:none;letter-spacing:0;font-family:var(--sans);font-size:12px;">'+k.desc+'</span></span>'
      +'<span class="sub-card-arrow">›</span></button>';
  });
  html+='</div><div class="ex-actions"><button class="btn subtle" id="back">Till alla områden</button></div></div></div>';
  app.innerHTML=html;
  app.querySelectorAll('[data-kat]').forEach(function(btn){ btn.onclick=function(){ skrivaEngine(btn.dataset.kat); }; });
  document.getElementById('back').onclick=renderOversikt;
  window.scrollTo({top:0,behavior:'smooth'});
}
