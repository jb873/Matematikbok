/* FAMILJ C · k2 öva-mer bråk-motorer: forkorta/forlanga/bytaForm/rakna (korOvning + hjälpare stannar inline)
   Byte-identiskt utbrutet ur ak7-k2-ram.html. Laddas via <script src>; delade delar inline i ram-C. */

function forkortaEngine(){
  korOvning({
    titel:'Förkorta bråk',
    sub:'Förkorta bråket så långt det går. Skriv täljare och nämnare i enklaste form.',
    back:renderOversikt,
    gen:function(level){
      // välj enklaste bråk t/n, förläng med faktor f → uppgift (t·f)/(n·f), svar t/n
      var bas;
      if(level===1) bas=randPick([[1,2],[1,3],[2,3],[1,4],[3,4]]);
      else if(level===2) bas=randPick([[2,5],[3,5],[1,6],[5,6],[3,8],[5,8]]);
      else bas=randPick([[3,7],[4,9],[5,12],[7,10],[5,9],[7,12]]);
      var f=(level===1)?d3RandInt(2,4):(level===2?d3RandInt(2,6):d3RandInt(3,8));
      var T=bas[0]*f, N=bas[1]*f;
      var svarT=bas[0], svarN=bas[1];
      return {
        fragaHtml: frac(T,N)+'<span style="margin:0 6px;">=</span>'+fracBoxes('fk-t','fk-n'),
        facitText: frac(svarT,svarN),
        check:function(){
          var t=parseInt(valFor('fk-t'),10), n=parseInt(valFor('fk-n'),10);
          if(isNaN(t)||isNaN(n)||n===0) return false;
          // rätt värde och enklaste form
          return (t*N===T*n) && gcd(t,n)===1;
        }
      };
    }
  });
}

// ============================================================
// ÖVNING: FÖRLÄNGA BRÅK
// ============================================================
function forlangaEngine(){
  korOvning({
    titel:'Förlänga bråk',
    sub:'Förläng bråket genom att multiplicera täljare och nämnare med samma tal.',
    back:renderOversikt,
    gen:function(level){
      var bas;
      if(level===1) bas=randPick([[1,2],[1,3],[2,3],[1,4],[3,4],[2,5]]);
      else if(level===2) bas=randPick([[2,5],[3,5],[1,6],[5,6],[3,8],[3,7],[4,9]]);
      else bas=randPick([[3,7],[4,9],[5,12],[7,10],[5,9],[7,12],[5,8]]);
      var t0=bas[0], n0=bas[1];
      if(level===1){
        // förläng med ett givet tal: t0/n0 · (f/f) = ?
        var f=d3RandInt(2,5);
        return {
          fragaHtml: frac(t0,n0)+'<span style="margin:0 6px;">förläng med '+f+'  =</span>'+fracBoxes('fl-t','fl-n'),
          facitText: frac(t0*f, n0*f),
          check:function(){
            var t=parseInt(valFor('fl-t'),10), n=parseInt(valFor('fl-n'),10);
            if(isNaN(t)||isNaN(n)||n===0) return false;
            return t===t0*f && n===n0*f;
          }
        };
      }
      // nivå 2-3: förläng till en given nämnare
      var f2=(level===2)?d3RandInt(2,6):d3RandInt(3,9);
      var malN=n0*f2;
      return {
        fragaHtml: frac(t0,n0)+'<span style="margin:0 6px;">=</span>'+fracBoxes('fl-t','fl-n')
          +'<span style="margin-left:8px;font-size:14px;color:var(--ink-faint);">(nämnaren ska bli '+malN+')</span>',
        facitText: frac(t0*f2, malN),
        check:function(){
          var t=parseInt(valFor('fl-t'),10), n=parseInt(valFor('fl-n'),10);
          if(isNaN(t)||isNaN(n)||n===0) return false;
          // rätt värde OCH rätt nämnare
          return n===malN && t*n0===t0*n;
        }
      };
    }
  });
}

// ============================================================
// ÖVNING: BYTA FORM (bråk ↔ decimal, oäkta ↔ blandad)
// ============================================================
function bytaFormEngine(){
  korOvning({
    titel:'Byta form',
    sub:'Växla mellan bråkform, decimalform och blandad form.',
    back:renderOversikt,
    gen:function(level){
      var typ=randPick(level===1?['dec','blandad']:['dec','blandad','dec2']);
      if(typ==='dec'){
        // bråk → decimal
        var p=randPick(level===1?[[1,2],[1,5],[3,10],[1,4],[7,10]]:[[1,4],[3,4],[3,5],[1,8],[3,8],[9,20]]);
        var val=Math.round(p[0]/p[1]*1e6)/1e6;
        return {
          fragaHtml: frac(p[0],p[1])+'<span style="margin:0 6px;">=</span><input class="brak-in bf-d" inputmode="decimal" autocomplete="off" style="width:90px;text-align:center;"><span style="font-size:14px;color:var(--ink-faint);margin-left:6px;">(decimalform)</span>',
          facitText: decShow(val),
          check:function(){ var v=parseFloat(valFor('bf-d').replace(',','.')); return isFinite(v)&&Math.abs(v-val)<1e-6; }
        };
      }
      if(typ==='dec2'){
        // decimal → bråk (enklaste form)
        var p2=randPick([[1,4],[3,4],[1,5],[2,5],[3,5],[1,2],[7,10],[3,10]]);
        var val2=Math.round(p2[0]/p2[1]*1e6)/1e6;
        return {
          fragaHtml: '<span>'+decShow(val2)+'</span><span style="margin:0 6px;">=</span>'+fracBoxes('bf-t','bf-n'),
          facitText: frac(p2[0],p2[1]),
          check:function(){ var t=parseInt(valFor('bf-t'),10),n=parseInt(valFor('bf-n'),10); if(isNaN(t)||isNaN(n)||n===0)return false; return Math.abs(t/n-val2)<1e-6 && gcd(t,n)===1; }
        };
      }
      // oäkta bråk → blandad form
      var oa=randPick(level===1?[[3,2],[5,2],[4,3],[5,4],[7,3]]:[[7,2],[11,4],[9,5],[13,6],[11,3],[17,5]]);
      var T=oa[0],N=oa[1]; var hel=Math.floor(T/N), rest=T-hel*N;
      return {
        fragaHtml: frac(T,N)+'<span style="margin:0 6px;">=</span><input class="brak-in bf-hel" inputmode="numeric" autocomplete="off" style="width:42px;text-align:center;">'+fracBoxes('bf-bt','bf-bn'),
        facitText: mixed(hel,rest,N),
        check:function(){
          var hh=parseInt(valFor('bf-hel'),10), tt=parseInt(valFor('bf-bt'),10), nn=parseInt(valFor('bf-bn'),10);
          if(isNaN(hh)||isNaN(tt)||isNaN(nn)||nn===0) return false;
          return Math.abs(hh+tt/nn - T/N)<1e-6 && tt<nn && gcd(tt,nn)===1;
        }
      };
    }
  });
}

// ============================================================
// ÖVNING: ADDITION / SUBTRAKTION MED BRÅK
// ============================================================
function raknaEngine(op){
  var aro = (op==='addition');
  document.getElementById('hero').style.display='none';
  var level=1, streak=0;
  var KRAV=4, MAXNIVA=3;
  var titel = aro?'Addition med bråk':'Subtraktion med bråk';
  var sub = aro?'Addera bråken. Skriv svaret i enklaste form.':'Subtrahera bråken. Skriv svaret i enklaste form.';
  var tecken = aro?'+':'\u2212';

  function nyUppgift(){
    var par;
    if(level===1){ // samma nämnare
      var n=randPick([4,5,6,8,10]); var a=d3RandInt(1,n-2), b=d3RandInt(1,n-1-a);
      if(!aro){ if(a<b){var t=a;a=b;b=t;} }
      par=[a,n,b,n];
    } else if(level===2){ // ena nämnaren delar den andra
      var pool=[[1,2,1,4],[1,3,1,6],[1,2,1,6],[1,4,3,8],[2,3,1,6],[1,5,3,10],[3,4,1,8],[1,2,3,8]];
      par=randPick(pool).slice();
      if(!aro && par[0]/par[1] < par[2]/par[3]){ var x=par[0],y=par[1]; par[0]=par[2];par[1]=par[3];par[2]=x;par[3]=y; }
    } else { // förläng båda
      var pool3=[[1,2,1,3],[1,3,1,4],[2,3,1,4],[1,2,2,5],[3,4,1,3],[2,5,1,3],[3,5,1,2],[2,3,1,5]];
      par=randPick(pool3).slice();
      if(!aro && par[0]/par[1] < par[2]/par[3]){ var x3=par[0],y3=par[1]; par[0]=par[2];par[1]=par[3];par[2]=x3;par[3]=y3; }
    }
    var t1=par[0],n1=par[1],t2=par[2],n2=par[3];
    var L=lcm(n1,n2), f1=L/n1, f2=L/n2, nt1=t1*f1, nt2=t2*f2;
    var komb = aro ? (nt1+nt2) : (nt1-nt2);
    var g=gcd(Math.abs(komb),L)||1; var svarT=komb/g, svarN=L/g;
    var hel=0, restT=svarT;
    if(svarN!==0 && Math.abs(svarT)>=svarN){ hel=Math.floor(svarT/svarN); restT=svarT-hel*svarN; }
    var olika = (n1!==n2);
    var kanForkorta = (g>1);   // det ihopräknade svaret går att förkorta
    return {t1:t1,n1:n1,t2:t2,n2:n2,L:L,f1:f1,f2:f2,nt1:nt1,nt2:nt2,komb:komb,
            svarT:svarT,svarN:svarN,hel:hel,restT:restT,olika:olika,kanForkorta:kanForkorta};
  }

  function facitText(u){
    if(u.hel>0) return u.restT>0 ? mixed(u.hel,u.restT,u.svarN) : String(u.hel);
    return frac(u.svarT,u.svarN);
  }

  function render(){
    var u = nyUppgift();
    var prickar='';
    for(var i=0;i<KRAV;i++){ prickar+='<span class="streak-prick '+(i<streak?'fylld':'')+'"></span>'; }

    // bygg uppgiftsraden
    var rad='';
    if(!u.olika){
      // Nivå 1: samma nämnare → svarsruta (+ förkortning om det behövs)
      if(u.kanForkorta){
        rad = '<div class="femled"><span class="grp">'+frac(u.t1,u.n1)+'<span class="mt">'+tecken+'</span>'+frac(u.t2,u.n2)+'</span>'
            + '<span class="eq">=</span>'
            + '<span class="grp">'+forkortBox()+'</span>'   // oförkortat svar
            + '<span class="eq">=</span>'
            + '<span class="grp">'+svarBox()+'</span></div>'; // enklaste form
      } else {
        rad = '<div class="femled"><span class="grp">'+frac(u.t1,u.n1)+'<span class="mt">'+tecken+'</span>'+frac(u.t2,u.n2)+'</span>'
            + '<span class="eq">=</span>'
            + '<span class="grp">'+svarBox()+'</span></div>';
      }
    } else {
      // Nivå 2-3: full femledad uppställning
      var slutLed = u.kanForkorta
        ? ('<span class="grp">'+forkortBox()+'</span><span class="eq">=</span><span class="grp">'+svarBox()+'</span>')
        : ('<span class="grp">'+svarBox()+'</span>');
      rad = '<div class="femled">'
          + '<span class="grp">'+frac(u.t1,u.n1)+'<span class="mt">'+tecken+'</span>'+frac(u.t2,u.n2)+'</span>'
          + '<span class="eq">=</span>'
          // förläng (produktbråk)
          + '<span class="grp">'+prodBox()+'<span class="mt">'+tecken+'</span>'+prodBox(2)+'</span>'
          + '<span class="eq">=</span>'
          // samma nämnare
          + '<span class="grp">'+stegBox()+'<span class="mt">'+tecken+'</span>'+stegBox()+'</span>'
          + '<span class="eq">=</span>'
          // lägg ihop → (ev. förkortning) → svar
          + slutLed
          + '</div>';
    }

    app.innerHTML='<div class="view"><div class="exercise-card">'
      +'<div class="ex-header"><h2 class="ex-title">'+titel+'</h2><div class="ex-sub">'+sub+'</div></div>'
      +'<div class="streak-rad"><span class="niva-pille">Nivå '+level+' av '+MAXNIVA+'</span>'
      +'<span class="streak-prickar">'+prickar+'</span>'
      +'<span class="streak-text">'+streak+' / '+KRAV+' rätt i rad'+(level<MAXNIVA?' till nästa nivå':' (högsta nivån)')+'</span></div>'
      +'<div style="margin:14px 0;">'+rad+'</div>'
      +'<div class="ex-feedback" id="fb"></div>'
      +keypadHTML(['7','8','9','4','5','6','1','2','3','0'])
      +'<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button>'
      +'<button class="btn subtle" id="back">Till alla områden</button></div></div></div>';

    var falt=Array.prototype.slice.call(app.querySelectorAll('.brak-in'));
    setTimeout(function(){ if(falt[0]) falt[0].focus(); },50);
    falt.forEach(function(f, fi){
      f.addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault(); if(fi+1<falt.length) falt[fi+1].focus(); else check();} });
    });
    bindKeypadMulti(falt);
    document.getElementById('back').onclick=renderOversikt;
    document.getElementById('check').onclick=check;   // additiv: Kontrollera-knappen (check hoistad)

    function check(){
      var fb=document.getElementById('fb'); fb.className='ex-feedback show';
      falt.forEach(function(f){ f.disabled=true; });
      document.getElementById('check').disabled=true;

      // rätta slutsvaret (avgör streaken)
      var svT=parseInt(valSel('.sv-t'),10), svN=parseInt(valSel('.sv-n'),10);
      var svHel=valSel('.sv-hel'); svHel = svHel===''?0:parseInt(svHel,10);
      var slutOk;
      if(u.hel>0){
        // blandad form: hel + rest/svarN, eller oäkta bråk som motsvarar samma värde
        var heltalOk = (svHel===u.hel) && (svN===u.svarN) && (svT===u.restT) && gcd(svT||1,svN||1)===1;
        var oaktaOk = !isNaN(svT)&&!isNaN(svN)&&svN!==0 && Math.abs(svT/svN-u.svarT/u.svarN)<1e-9 && gcd(svT,svN)===1 && (svHel===0||isNaN(svHel));
        slutOk = heltalOk || oaktaOk;
      } else {
        slutOk = !isNaN(svT)&&!isNaN(svN)&&svN!==0 && Math.abs(svT/svN-u.svarT/u.svarN)<1e-9 && gcd(svT,svN)===1;
      }

      // färglägg mellanled (vägledning, påverkar ej streaken)
      faltFarg('.st-t', u.olika?[u.nt1,u.nt2]:null);

      // rätta förkortningsboxen (oförkortade svaret komb/L) om den finns
      if(u.kanForkorta){
        var fkT=parseInt(valSel('.fk-t'),10), fkN=parseInt(valSel('.fk-n'),10);
        var fkOk = !isNaN(fkT)&&!isNaN(fkN)&&fkN!==0 && Math.abs(fkT/fkN - u.komb/u.L)<1e-9;
        app.querySelectorAll('.fk-t,.fk-n').forEach(function(f){ f.classList.add(fkOk?'correct':'wrong'); });
      }

      // färglägg svarsrutorna
      app.querySelectorAll('.sv-t,.sv-n,.sv-hel').forEach(function(f){ f.classList.add(slutOk?'correct':'wrong'); });

      if(slutOk){
        fb.classList.add('correct'); fb.textContent='Rätt!';
        streak++;
        if(streak>=KRAV && level<MAXNIVA){ level++; streak=0; fb.innerHTML='Rätt! Du går vidare till nivå '+level+'.'; }
      } else {
        fb.classList.add('wrong'); fb.innerHTML='Rätt svar: '+facitText(u)+'. Streaken börjar om.';
        streak=0;
      }
      if(window.k2Logga) window.k2Logga(slutOk);   // additiv mastery-logg (rör ej beräkningen/mellanledet)

      var b=document.createElement('button'); b.className='btn primary'; b.textContent='Nästa';
      b.onclick=function(){ render(); };
      document.getElementById('check').replaceWith(b);
    }
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // ---- hjälpare för boxar (definieras per render via slutna värden) ----
  function svarBox(){
    return '<span style="display:inline-flex;align-items:center;gap:4px;">'
      + '<input class="svar-cell sv-hel" inputmode="numeric" placeholder="hel" style="width:42px;" title="heltal (om svaret är större än 1)">'
      + '<span class="brak"><span class="taljare"><input class="svar-cell sv-t" inputmode="numeric"></span><span class="namnare"><input class="svar-cell sv-n" inputmode="numeric"></span></span></span>';
  }
  function stegBox(){ return '<span class="brak"><span class="taljare"><input class="brak-in steg-cell st-t" inputmode="numeric"></span><span class="namnare"><input class="brak-in steg-cell st-n" inputmode="numeric"></span></span>'; }
  function forkortBox(){ return '<span class="brak"><span class="taljare"><input class="brak-in steg-cell fk-t" inputmode="numeric"></span><span class="namnare"><input class="brak-in steg-cell fk-n" inputmode="numeric"></span></span>'; }
  function prodBox(which){ return '<span class="brak"><span class="taljare"><input class="brak-in steg-cell smal st-t" inputmode="numeric"><span class="mt" style="font-size:13px;">·</span><input class="brak-in steg-cell smal" inputmode="numeric"></span><span class="namnare"><input class="brak-in steg-cell smal" inputmode="numeric"><span class="mt" style="font-size:13px;">·</span><input class="brak-in steg-cell smal" inputmode="numeric"></span></span>'; }
  function valSel(sel){ var el=app.querySelector(sel); return el?el.value.trim():''; }
  function faltFarg(){ /* mellanled lämnas neutrala – slutsvaret styr */ }

  render();
}
