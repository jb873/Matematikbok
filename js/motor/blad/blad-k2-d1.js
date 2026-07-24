/* ============================================================
   blad-k2-d1.js — ÖVA-BLADET för k2 Del 1 "Andel och antal" (BILDBASERAT).

   EXAKT-FÖRFATTAT av Joachim ("Antal och andel.docx", 17 uppgifter i ordning).
   Alla figurer GENERERAS som SVG/HTML i bokens palett — inga PNG ur läromedlet
   i repot. Eleven skriver svar per uppgift och trycker KONTROLLERA i slutet
   (självrättning + facit + sammanfattning + konfetti, som övriga blad).

   Fem figurtyper: delad figur · tallinje · klickbart rutnät · antalsfigur ·
   rutnäts-area. Andel godkänns värde-lika (2/8 = 1/4).

   ⚠️ Tallinjernas exakta markörlägen (uppg 2, 6, 15) är avlästa ur den lågupplösta
   skanningen och ska bekräftas mot originalet — de ligger samlade i TALLINJE-datan
   nedan så de är lätta att justera. Area-figurernas andelar (uppg 7 = 1/3, uppg 17
   = 2/9·4/9·3/9) är pixel-/ruträknade.

   Rör inga motorer/mellanled. Laddas som <script> sist i sidan.
   ============================================================ */
(function(){
  'use strict';

  var C_LINE = '#3d3630', C_FILL = '#2f6ea0', C_RED = '#c0392b', C_GREEN = '#2f7d4f', C_PAPER = '#ffffff', C_MARK = '#5f7183';
  function svg(inner, w, h){ return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" style="display:block;overflow:visible;">' + inner + '</svg>'; }
  function fyllOk(f, i){ return f.indexOf(i) > -1; }

  // ── FIGURTYP 1: DELAD FIGUR ──
  function delRuta(rows, cols, fyllda){ var W=120,H=120,cw=W/cols,ch=H/rows,s=''; for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var i=r*cols+c; s+='<rect x="'+(c*cw).toFixed(1)+'" y="'+(r*ch).toFixed(1)+'" width="'+cw.toFixed(1)+'" height="'+ch.toFixed(1)+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,W,H); }
  function delKryss(fyllda){ var tri=['0,0 120,0 60,60','120,0 120,120 60,60','120,120 0,120 60,60','0,120 0,0 60,60'],s=''; tri.forEach(function(p,i){s+='<polygon points="'+p+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';}); return svg(s,120,120); }
  function delAtta(fyllda){ var b=[[60,0],[120,0],[120,60],[120,120],[60,120],[0,120],[0,60],[0,0]],s=''; for(var i=0;i<8;i++){var p=b[i],q=b[(i+1)%8]; s+='<polygon points="60,60 '+p[0]+','+p[1]+' '+q[0]+','+q[1]+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,120,120); }
  function delCirkel(n, fyllda){ var cx=60,cy=60,r=56,s=''; for(var i=0;i<n;i++){var a0=-Math.PI/2+i*2*Math.PI/n,a1=-Math.PI/2+(i+1)*2*Math.PI/n,x0=cx+r*Math.cos(a0),y0=cy+r*Math.sin(a0),x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),L=(a1-a0)>Math.PI?1:0; s+='<path d="M'+cx+','+cy+' L'+x0.toFixed(2)+','+y0.toFixed(2)+' A'+r+','+r+' 0 '+L+' 1 '+x1.toFixed(2)+','+y1.toFixed(2)+' Z" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,120,120); }
  function delTriangel4(fyllda){ var A=[4,116],B=[116,116],C=[60,6],AB=[60,116],BC=[88,61],CA=[32,61],tri=[[A,CA,AB],[B,AB,BC],[C,CA,BC],[CA,AB,BC]],s=''; tri.forEach(function(t,i){s+='<polygon points="'+t.map(function(p){return p[0]+','+p[1];}).join(' ')+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';}); return svg(s,120,122); }
  function delHexagon(fyllda){ var cx=60,cy=60,r=56,pts=[],s=''; for(var k=0;k<6;k++){var a=-Math.PI/2+k*Math.PI/3;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);} for(var i=0;i<6;i++){var p=pts[i],q=pts[(i+1)%6];s+='<polygon points="'+cx+','+cy+' '+p[0].toFixed(1)+','+p[1].toFixed(1)+' '+q[0].toFixed(1)+','+q[1].toFixed(1)+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,120,120); }
  function delStrip(n, fyllda){ var W=46*n,s=''; for(var i=0;i<n;i++){s+='<rect x="'+(i*46)+'" y="0" width="46" height="46" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,W,46); }
  // ── DELAD FIGUR med OLIKA STORA delar (svårare — matchar originalen) ──
  // 3b: kvadrat med vit triangel-hack (vit = 1/4) → färgad 3/4
  function hackKvadrat(){ return svg('<rect x="0" y="0" width="120" height="120" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="2"/><polygon points="0,0 0,120 60,60" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/>',120,120); }
  // 3c: rektangel i 2 små + 1 dubbelbred (olika stora) → färgad 1/2
  function olikStrip(){ return svg('<rect x="0" y="0" width="60" height="60" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/><rect x="60" y="0" width="60" height="60" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/><rect x="120" y="0" width="120" height="60" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="2"/>',240,60); }
  // 9b: rätvinklig triangel, mittre (medial) triangeln färgad → 1/4
  function ratTriKvart(){ return svg('<polygon points="0,0 0,120 120,120" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/><line x1="0" y1="0" x2="120" y2="120" stroke="'+C_LINE+'" stroke-width="2"/><line x1="0" y1="60" x2="60" y2="60" stroke="'+C_LINE+'" stroke-width="1.5"/><line x1="60" y1="60" x2="60" y2="120" stroke="'+C_LINE+'" stroke-width="1.5"/><polygon points="0,60 60,60 60,120" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="1.5"/>',120,122); }
  // 9c: kvadrat med diagonal + kvadrant, liten hörntriangel färgad → 1/8
  function diagKvadratAtta(){ return svg('<rect x="0" y="0" width="120" height="120" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/><line x1="0" y1="120" x2="120" y2="0" stroke="'+C_LINE+'" stroke-width="2"/><line x1="60" y1="0" x2="60" y2="60" stroke="'+C_LINE+'" stroke-width="1.5"/><line x1="0" y1="60" x2="60" y2="60" stroke="'+C_LINE+'" stroke-width="1.5"/><polygon points="0,120 60,120 60,60" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="1.5"/>',120,120); }

  // ── FIGURTYP 2: TALLINJE (markörer: pil eller punkt A/B/C) ──
  function tallinje(start, end, steg, markorer){
    var W=560,pad=34,y=42,x0=pad,x1=W-pad,span=end-start;
    function X(v){ return x0 + (v-start)/span*(x1-x0); }
    var s='<line x1="'+x0+'" y1="'+y+'" x2="'+x1+'" y2="'+y+'" stroke="'+C_LINE+'" stroke-width="2"/>'
      + '<polygon points="'+x1+','+y+' '+(x1-11)+','+(y-5)+' '+(x1-11)+','+(y+5)+'" fill="'+C_LINE+'"/>';
    var nsub=Math.round(span*steg);
    for(var i=0;i<=nsub;i++){ var v=start+i/steg, isInt=Math.abs(v-Math.round(v))<1e-9, tx=X(v), th=isInt?9:6;
      if(X(v)>x1-12 && i===nsub) continue;
      s+='<line x1="'+tx.toFixed(1)+'" y1="'+(y-th)+'" x2="'+tx.toFixed(1)+'" y2="'+(y+th)+'" stroke="'+C_LINE+'" stroke-width="'+(isInt?2:1.3)+'"/>';
      if(isInt) s+='<text x="'+tx.toFixed(1)+'" y="'+(y+25)+'" text-anchor="middle" font-size="13" fill="'+C_LINE+'">'+Math.round(v)+'</text>';
    }
    markorer.forEach(function(m){ var mx=X(m.v);
      if(m.typ==='pil'){ s+='<polygon points="'+mx.toFixed(1)+','+(y+3)+' '+(mx-5).toFixed(1)+','+(y+15)+' '+(mx+5).toFixed(1)+','+(y+15)+'" fill="'+C_RED+'"/><line x1="'+mx.toFixed(1)+'" y1="'+(y+13)+'" x2="'+mx.toFixed(1)+'" y2="'+(y+26)+'" stroke="'+C_RED+'" stroke-width="2.5"/>'; }
      else { s+='<circle cx="'+mx.toFixed(1)+'" cy="'+y+'" r="6.5" fill="'+C_MARK+'" stroke="'+C_LINE+'" stroke-width="1.3"/><text x="'+mx.toFixed(1)+'" y="'+(y-13)+'" text-anchor="middle" font-size="14" font-weight="700" fill="'+C_LINE+'">'+m.lbl+'</text>'; }
    });
    return svg(s, W, 74);
  }

  // ── FIGURTYP 4: ANTALSFIGUR (kulor i två färger) ──
  function antalsfigur(farger){
    var r=17, gap=12, perRow=Math.min(farger.length, 4), rows=Math.ceil(farger.length/perRow);
    var W=perRow*(2*r+gap)+gap, H=rows*(2*r+gap)+gap, s='';
    farger.forEach(function(f,i){ var col=i%perRow, row=Math.floor(i/perRow), cx=gap+r+col*(2*r+gap), cy=gap+r+row*(2*r+gap);
      var fill=f==='bla'?C_FILL:C_RED; s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" stroke="'+C_LINE+'" stroke-width="1.5"/>'
        + '<ellipse cx="'+(cx-r*0.32)+'" cy="'+(cy-r*0.34)+'" rx="'+(r*0.30)+'" ry="'+(r*0.20)+'" fill="rgba(255,255,255,.55)"/>'; });
    return svg(s, W, H);
  }

  // ── FIGURTYP 5: RUTNÄTS-AREA (uppg 7 hus, uppg 17 L-omkrets) ──
  function husFigur(){ // rutnät 8×6: blå rektangel (botten 3 rader) + röd triangel (topp), U=30
    var U=30, W=8*U, H=6*U, s='';
    s+='<rect x="0" y="'+(3*U)+'" width="'+(8*U)+'" height="'+(3*U)+'" fill="'+C_FILL+'"/>';              // blått
    s+='<polygon points="0,'+(3*U)+' '+(8*U)+','+(3*U)+' '+(4*U)+',0" fill="'+C_RED+'"/>';                 // röd triangel
    for(var c=0;c<=8;c++) s+='<line x1="'+(c*U)+'" y1="0" x2="'+(c*U)+'" y2="'+H+'" stroke="'+C_LINE+'" stroke-width="1" opacity=".55"/>';
    for(var r=0;r<=6;r++) s+='<line x1="0" y1="'+(r*U)+'" x2="'+W+'" y2="'+(r*U)+'" stroke="'+C_LINE+'" stroke-width="1" opacity=".55"/>';
    s+='<polygon points="0,'+(3*U)+' '+(8*U)+','+(3*U)+' '+(4*U)+',0" fill="none" stroke="'+C_LINE+'" stroke-width="2"/>';
    s+='<rect x="0" y="'+(3*U)+'" width="'+(8*U)+'" height="'+(3*U)+'" fill="none" stroke="'+C_LINE+'" stroke-width="2"/>';
    return svg(s, W, H);
  }
  function LFigur(){ // L-figur, omkrets färgad. Enheter: bredd 6, höjd 3; steg vid x=4. U=34
    var U=34, W=7*U, H=5*U, ox=U*0.6, oy=U*0.6;
    function P(x,y){ return (ox+x*U).toFixed(0)+','+(oy+y*U).toFixed(0); }
    var grid='';
    for(var c=0;c<=6;c++) grid+='<line x1="'+(ox+c*U)+'" y1="'+oy+'" x2="'+(ox+c*U)+'" y2="'+(oy+3*U)+'" stroke="#cfe0ec" stroke-width="1"/>';
    for(var r=0;r<=3;r++) grid+='<line x1="'+ox+'" y1="'+(oy+r*U)+'" x2="'+(ox+6*U)+'" y2="'+(oy+r*U)+'" stroke="#cfe0ec" stroke-width="1"/>';
    // segment: röd topp (0,0)->(4,0); blå ned (4,0)->(4,2), höger (4,2)->(6,2), ned (6,2)->(6,3), vänster upp (0,3)->(0,0); grön botten (6,3)->(0,3)
    var seg = ''
      + '<polyline points="'+P(0,0)+' '+P(4,0)+'" fill="none" stroke="'+C_RED+'" stroke-width="3.5"/>'
      + '<polyline points="'+P(4,0)+' '+P(4,2)+' '+P(6,2)+' '+P(6,3)+'" fill="none" stroke="'+C_FILL+'" stroke-width="3.5"/>'
      + '<polyline points="'+P(0,3)+' '+P(0,0)+'" fill="none" stroke="'+C_FILL+'" stroke-width="3.5"/>'
      + '<polyline points="'+P(6,3)+' '+P(0,3)+'" fill="none" stroke="'+C_GREEN+'" stroke-width="3.5"/>';
    return svg(grid + seg, W, H);
  }

  function frac(t, n){ return '<span class="ovn-brak"><span class="ovn-brak-taljare">'+t+'</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare">'+n+'</span></span>'; }
  // Stående-bråk-INMATNING med facit (godkänns värde-lika)
  function svarBrak(t, n){ return '<span class="d1-svar d1-svarbrak" data-typ="brak" data-t="'+t+'" data-n="'+n+'"><span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ovn-in d1-in d1-in-t" inputmode="numeric" autocomplete="off"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ovn-in d1-in d1-in-n" inputmode="numeric" autocomplete="off"></span></span></span>'; }
  function svarBrakRaw(){ return '<span class="d1-svarbrak"><span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ovn-in d1-in d1-in-t" inputmode="numeric" autocomplete="off"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ovn-in d1-in d1-in-n" inputmode="numeric" autocomplete="off"></span></span></span>'; }
  function figrad(items){ return '<div class="d1-figrad">'+items.map(function(it){ return '<div class="d1-fig"><span class="d1-fig-etikett">'+it.lbl+'</span>'+it.svg+(it.svar?svarBrak(it.t,it.n):'')+'</div>'; }).join('')+'</div>'; }
  // Rad: tallinje-svg + märk-svar (A =, B =, …)
  function markSvar(mark){ return '<span class="d1-marksvar"><span class="d1-mark-lbl">'+mark.lbl+' =</span>'+svarBrak(mark.t,mark.n)+'</span>'; }
  function tallinjeRad(delfrag){ return '<div class="d1-tl-rad"><span class="d1-fig-etikett">'+delfrag.lbl+'</span>'+delfrag.svg+'<div class="d1-marsvar-rad">'+delfrag.marker.map(markSvar).join('')+'</div></div>'; }
  // Klickbart rutnät (n rutor, markera facitAntal)
  function klickRutnat(id, celler, facitAntal, etikett){
    var rutor=''; for(var i=0;i<celler;i++) rutor+='<span class="d1-rut" data-i="'+i+'"></span>';
    return '<div class="d1-rutrad"><span class="d1-rut-etikett">'+etikett+'</span><span class="d1-svar d1-rutnat" data-typ="rutnat" data-facit="'+facitAntal+'" data-id="'+id+'">'+rutor+'</span></div>';
  }
  // Val (två alternativ), facit-index
  function valSvar(alt, ratt){ return '<div class="d1-svar d1-val" data-typ="val" data-ratt="'+ratt+'">'+alt.map(function(a,i){return '<button type="button" class="d1-chip" data-i="'+i+'">'+a+'</button>';}).join('')+'</div>'; }
  function flervalHtml(rader, ratt){ return '<div class="d1-svar d1-flerval" data-typ="flerval" data-ratt="'+ratt.join(',')+'">'+rader.map(function(r,i){return '<button type="button" class="d1-chip" data-i="'+i+'"><span class="d1-chip-lbl">'+r[0]+')</span> '+r[1]+'</button>';}).join('')+'</div>'; }

  // ── UPPGIFTERNA (exakt ordning). ⚠️ tallinje-värden = bästa avläsning, bekräftas. ──
  var UPPG = [
    { nr:1, rubrik:'Hur stor andel av figuren är färgad?', innehall:figrad([{lbl:'a)',svg:delRuta(2,2,[2]),svar:1,t:1,n:4},{lbl:'b)',svg:delKryss([2]),svar:1,t:1,n:4},{lbl:'c)',svg:delAtta([5]),svar:1,t:1,n:8}]) },
    { nr:2, rubrik:'Vilket bråk pekar pilen på?', flagg:'⚠️ pil-lägen bekräftas', innehall:
      tallinjeRad({lbl:'a)', svg:tallinje(0,1.3,5,[{v:3/5,typ:'pil'}]), marker:[{lbl:'pilen',t:3,n:5}]})
      + tallinjeRad({lbl:'b)', svg:tallinje(0,1.25,8,[{v:3/8,typ:'pil'}]), marker:[{lbl:'pilen',t:3,n:8}]}) },
    { nr:3, rubrik:'Hur stor del av figuren är färgad?', flagg:'⚠️ andelar bekräftas', innehall:figrad([{lbl:'a)',svg:delHexagon([0,2,4]),svar:1,t:3,n:6},{lbl:'b)',svg:hackKvadrat(),svar:1,t:3,n:4},{lbl:'c)',svg:olikStrip(),svar:1,t:1,n:2}]) },
    { nr:4, rubrik:'Skriv två hela i bråkform på tre olika sätt.', innehall:'<div class="d1-svar d1-villkor" data-typ="villkor-hela" data-varde="2" data-antal="3">'+svarBrakRaw()+'<span class="d1-komma">,</span>'+svarBrakRaw()+'<span class="d1-komma">,</span>'+svarBrakRaw()+'</div>' },
    { nr:5, rubrik:'Vilka av påståendena är riktiga? Klicka de riktiga.', innehall:flervalHtml([['a',frac(1,3)+' &gt; '+frac(1,4)],['b',frac(2,3)+' &gt; '+frac(3,4)],['c',frac(2,5)+' + '+frac(3,5)+' = 1'],['d',frac(2,5)+' &gt; '+frac(1,2)],['e',frac(1,2)+' = '+frac(2,4)+' = '+frac(3,6)],['f',frac(4,5)+' &lt; '+frac(5,6)]],[0,2,4,5]) },
    { nr:6, rubrik:'Vilka är talen A och B på tallinjen?', flagg:'⚠️ lägen bekräftas', innehall:
      tallinjeRad({lbl:'a)', svg:tallinje(0,1.5,4,[{v:0.25,lbl:'A',typ:'punkt'},{v:0.5,lbl:'B',typ:'punkt'}]), marker:[{lbl:'A',t:1,n:4},{lbl:'B',t:1,n:2}]})
      + tallinjeRad({lbl:'b)', svg:tallinje(0,1.4,5,[{v:0.2,lbl:'A',typ:'punkt'},{v:0.8,lbl:'B',typ:'punkt'}]), marker:[{lbl:'A',t:1,n:5},{lbl:'B',t:4,n:5}]}) },
    { nr:7, rubrik:'Hur stor del av den färgade figuren utgör den röda triangeln?', innehall:'<div class="d1-figrad">'+husFigur()+'</div><div style="margin-top:6px;">'+svarBrak(1,3)+'</div>' },
    { nr:8, rubrik:'Markera rätt antal rutor så andelen stämmer.', innehall:'<div class="d1-rutnat-grupp">'
      + klickRutnat('r12',12,1, 'a) '+frac(1,12)) + klickRutnat('r6',12,2, 'b) '+frac(1,6))
      + klickRutnat('r3',12,4, 'c) '+frac(1,3)) + klickRutnat('r4',12,3, 'd) '+frac(1,4)) + '</div>' },
    { nr:9, rubrik:'Hur stor andel av figuren är färgad?', flagg:'⚠️ andelar bekräftas', innehall:figrad([{lbl:'a)',svg:delCirkel(3,[1]),svar:1,t:1,n:3},{lbl:'b)',svg:ratTriKvart(),svar:1,t:1,n:4},{lbl:'c)',svg:diagKvadratAtta(),svar:1,t:1,n:8}]) },
    { nr:10, rubrik:'Kulor', typ:'rubrik' },
    { nr:11, rubrik:'Hur stor andel av Hugos kulor är blå?', innehall:'<div class="d1-figrad">'+antalsfigur(['bla','bla','bla','rod'])+'</div><div style="margin-top:6px;">'+svarBrak(3,4)+'</div>' },
    { nr:12, rubrik:'Hur stor andel av Hannas kulor är blå?', innehall:'<div class="d1-figrad">'+antalsfigur(['rod','bla','bla','rod','bla','bla'])+'</div><div style="margin-top:6px;">'+svarBrak(4,6)+'</div>' },
    { nr:13, rubrik:'Vem har flest blå kulor?', innehall:valSvar(['Hugo','Hanna'],1) },
    { nr:14, rubrik:'Vem har störst andel blåa kulor?', innehall:valSvar(['Hugo','Hanna'],0) },
    { nr:15, rubrik:'Vilka är talen A, B och C på tallinjen?', flagg:'⚠️ lägen bekräftas', innehall:
      tallinjeRad({lbl:'a)', svg:tallinje(0,2.6,5,[{v:4/5,lbl:'A',typ:'punkt'},{v:6/5,lbl:'B',typ:'punkt'},{v:12/5,lbl:'C',typ:'punkt'}]), marker:[{lbl:'A',t:4,n:5},{lbl:'B',t:6,n:5},{lbl:'C',t:12,n:5}]})
      + tallinjeRad({lbl:'b)', svg:tallinje(0,2.3,10,[{v:0.9,lbl:'A',typ:'punkt'},{v:1.5,lbl:'B',typ:'punkt'},{v:1.9,lbl:'C',typ:'punkt'}]), marker:[{lbl:'A',t:9,n:10},{lbl:'B',t:3,n:2},{lbl:'C',t:19,n:10}]})
      + tallinjeRad({lbl:'c)', svg:tallinje(10,12.3,5,[{v:10.2,lbl:'A',typ:'punkt'},{v:10.6,lbl:'B',typ:'punkt'},{v:11.6,lbl:'C',typ:'punkt'}]), marker:[{lbl:'A',t:51,n:5},{lbl:'B',t:53,n:5},{lbl:'C',t:58,n:5}]}) },
    { nr:16, rubrik:'I en hage finns det 7 hästar och 15 kor. Hur stor andel av djuren är hästar?', innehall:'<div style="margin-top:10px;">'+svarBrak(7,22)+'</div>' },
    { nr:17, rubrik:'Hur stor andel av figurens omkrets är grön, blå respektive röd?', innehall:'<div class="d1-figrad">'+LFigur()+'</div>'
      + '<div class="d1-marsvar-rad" style="margin-top:8px;"><span class="d1-marksvar"><span class="d1-mark-lbl" style="color:'+C_GREEN+';">Grön =</span>'+svarBrak(1,3)+'</span>'
      + '<span class="d1-marksvar"><span class="d1-mark-lbl" style="color:'+C_FILL+';">Blå =</span>'+svarBrak(4,9)+'</span>'
      + '<span class="d1-marksvar"><span class="d1-mark-lbl" style="color:'+C_RED+';">Röd =</span>'+svarBrak(2,9)+'</span></div>' }
  ];

  function visaKonfetti(){ var g=document.querySelector('.konfetti-lager'); if(g)g.remove(); var lager=document.createElement('div'); lager.className='konfetti-lager'; document.body.appendChild(lager); var farger=['#16a34a','#dc2626','#f59e0b','#3b82f6','#a855f7','#ec4899','#06b6d4']; for(var i=0;i<80;i++){var b=document.createElement('span');b.className='konfetti';b.style.left=(Math.random()*100)+'vw';b.style.background=farger[Math.floor(Math.random()*farger.length)];b.style.animationDuration=(2.5+Math.random()*2)+'s';b.style.animationDelay=(Math.random()*0.8)+'s';b.style.width=(6+Math.random()*8)+'px';b.style.height=(10+Math.random()*8)+'px';lager.appendChild(b);} setTimeout(function(){if(lager)lager.remove();},5000); }

  function ensureCSS(){
    if(document.getElementById('d1-css')) return;
    var s=document.createElement('style'); s.id='d1-css';
    s.textContent=
      '.d1-figrad{display:flex;flex-wrap:wrap;gap:34px;align-items:flex-start;margin:14px 0 6px;}'
    + '.d1-fig{display:flex;flex-direction:column;align-items:center;gap:10px;}'
    + '.d1-fig-etikett{font-family:var(--cinzel,"Cinzel");font-size:12px;color:var(--ink-faint,#7a6e65);align-self:flex-start;}'
    + '.d1-in{width:46px !important;height:34px !important;text-align:center;font-size:17px;padding:2px 0 !important;}'
    + '.d1-svarbrak .ovn-brak-strecket{min-width:46px;}'
    + '.d1-villkor{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;}'
    + '.d1-komma{font-size:20px;color:var(--ink-faint,#7a6e65);margin:0 4px;}'
    + '.d1-tl-rad{margin:14px 0;} .d1-marsvar-rad{display:flex;flex-wrap:wrap;gap:20px;margin-top:8px;}'
    + '.d1-marksvar{display:inline-flex;align-items:center;gap:8px;} .d1-mark-lbl{font-family:var(--serif,"Source Serif 4");font-size:17px;font-weight:600;}'
    + '.d1-flerval{display:flex;flex-direction:column;gap:8px;margin-top:12px;align-items:flex-start;}'
    + '.d1-val{display:flex;gap:12px;margin-top:12px;}'
    + '.d1-chip{display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-size:18px;background:#fff;border:1.5px solid var(--paper-dk,#ede6d6);border-radius:9px;padding:8px 18px;cursor:pointer;transition:all .12s;}'
    + '.d1-chip:hover{border-color:var(--gold-lt,#c49a40);} .d1-chip .d1-chip-lbl{font-family:var(--cinzel,"Cinzel");font-size:12px;color:var(--ink-faint,#7a6e65);}'
    + '.d1-chip.sel{border-color:var(--navy,#0f1e2e);background:rgba(15,30,46,.05);}'
    + '.d1-chip.ratt{border-color:#2f7d4f;background:rgba(47,125,79,.12);} .d1-chip.fel{border-color:#c0392b;background:rgba(192,57,43,.10);} .d1-chip.miss{border-style:dashed;border-color:#c49a40;}'
    + '.d1-rutnat-grupp{display:flex;flex-direction:column;gap:12px;margin-top:12px;}'
    + '.d1-rutrad{display:flex;align-items:center;gap:14px;} .d1-rut-etikett{min-width:60px;font-size:17px;}'
    + '.d1-rutnat{display:inline-flex;}'
    + '.d1-rut{width:30px;height:30px;border:1.5px solid '+C_LINE+';margin-left:-1.5px;cursor:pointer;background:#fff;transition:background .1s;}'
    + '.d1-rut.fylld{background:'+C_FILL+';} .d1-rut.ratt{outline:2px solid #2f7d4f;outline-offset:-3px;} .d1-rut.fel{outline:2px solid #c0392b;outline-offset:-3px;}'
    + '.d1-svar.klar-fel{outline:2px solid rgba(192,57,43,.22);outline-offset:5px;border-radius:8px;}'
    + '.d1-fasit{display:block;margin-top:6px;font-size:12px;color:#c0392b;} .d1-flagg{font-size:12px;color:var(--gold,#9a7228);font-style:italic;margin-left:8px;}';
    document.head.appendChild(s);
  }

  function render(){
    var mount=document.getElementById('sheet-andel'); if(!mount) return; ensureCSS();
    var html='<div class="ovn-sheet"><h2>Andel och antal</h2><p class="ovn-intro">Figurerna är ritade i bokens färger. Skriv ditt svar som bråk (eller klicka) och tryck <strong>Kontrollera</strong> när du är klar.</p>';
    UPPG.forEach(function(u){
      if(u.typ==='rubrik'){ html+='<h3 style="font-family:var(--serif);font-size:21px;margin:26px 0 2px;color:var(--ink);">'+u.rubrik+'</h3>'; return; }
      html+='<div class="ovn-grupp"><div class="ovn-grupp-rubrik"><span class="ovn-label" style="min-width:24px;">'+u.nr+'.</span>'+u.rubrik+(u.flagg?'<span class="d1-flagg">'+u.flagg+'</span>':'')+'</div>';
      if(u.innehall) html+=u.innehall;
      html+='</div>';
    });
    html+='<div class="ovn-kontroll-rad"><button type="button" class="ovn-kontroll" data-action="kontroll">Kontrollera</button><button type="button" class="ovn-aterstall" data-action="reset">Återställ</button></div><div class="ovn-sammanf" data-sammanf style="display:none;"></div></div>';
    mount.innerHTML=html;
    mount.querySelectorAll('.d1-flerval .d1-chip, .d1-val .d1-chip').forEach(function(ch){ ch.onclick=function(){ if(ch.className.indexOf('ratt')>-1||ch.className.indexOf('fel')>-1||ch.className.indexOf('miss')>-1)return; if(ch.parentNode.classList.contains('d1-val')) ch.parentNode.querySelectorAll('.d1-chip').forEach(function(o){if(o!==ch)o.classList.remove('sel');}); ch.classList.toggle('sel'); }; });
    mount.querySelectorAll('.d1-rut').forEach(function(rt){ rt.onclick=function(){ if(rt.className.indexOf('ratt')>-1||rt.className.indexOf('fel')>-1)return; rt.classList.toggle('fylld'); }; });
    mount.querySelector('[data-action="kontroll"]').onclick=function(){ kontrollera(mount); };
    mount.querySelector('[data-action="reset"]').onclick=function(){ render(); };
  }

  function kontrollera(mount){
    var svar=Array.prototype.slice.call(mount.querySelectorAll('.d1-svar')), totalt=0, ratt=0;
    svar.forEach(function(el){
      totalt++; var typ=el.dataset.typ, ok=false;
      el.querySelectorAll('.ovn-in').forEach(function(inp){ inp.classList.remove('correct','wrong'); });
      var old=el.parentNode.querySelector('.d1-fasit'); if(old) old.remove();
      if(typ==='brak'){
        var t=parseInt(el.querySelector('.d1-in-t').value,10),n=parseInt(el.querySelector('.d1-in-n').value,10),ft=+el.dataset.t,fn=+el.dataset.n;
        ok=isFinite(t)&&isFinite(n)&&n!==0&&Math.abs(t/n-ft/fn)<1e-9;
        el.querySelectorAll('.ovn-in').forEach(function(inp){inp.classList.add(ok?'correct':'wrong');});
        if(!ok){var f=document.createElement('span');f.className='d1-fasit';f.innerHTML='rätt svar: '+ft+'/'+fn;el.insertAdjacentElement('afterend',f);}
      } else if(typ==='villkor-hela'){
        var varde=+el.dataset.varde,brak=[]; el.querySelectorAll('.d1-svarbrak').forEach(function(sb){brak.push({t:parseInt(sb.querySelector('.d1-in-t').value,10),n:parseInt(sb.querySelector('.d1-in-n').value,10)});});
        var giltiga=brak.every(function(b){return isFinite(b.t)&&isFinite(b.n)&&b.n!==0&&Math.abs(b.t/b.n-varde)<1e-9;});
        var seen={},dist=true; brak.forEach(function(b){if(!isFinite(b.t)||!b.n)return;var k=b.t+'/'+b.n;if(seen[k])dist=false;seen[k]=1;});
        ok=giltiga&&dist; el.querySelectorAll('.ovn-in').forEach(function(inp){inp.classList.add(ok?'correct':'wrong');});
        if(!ok){var f2=document.createElement('span');f2.className='d1-fasit';f2.innerHTML='tre olika bråk lika med '+varde+' (t.ex. 2/1, 4/2, 6/3)';el.insertAdjacentElement('afterend',f2);}
      } else if(typ==='flerval'){
        var ri=el.dataset.ratt.split(',').map(Number),chips=Array.prototype.slice.call(el.querySelectorAll('.d1-chip')); ok=true;
        chips.forEach(function(ch,i){var vald=ch.classList.contains('sel'),rk=ri.indexOf(i)>-1;ch.classList.remove('sel');if(rk&&vald)ch.classList.add('ratt');else if(!rk&&vald){ch.classList.add('fel');ok=false;}else if(rk&&!vald){ch.classList.add('miss');ok=false;}});
      } else if(typ==='val'){
        var rr=+el.dataset.ratt,chips2=Array.prototype.slice.call(el.querySelectorAll('.d1-chip')); ok=true; var nagon=false;
        chips2.forEach(function(ch,i){var vald=ch.classList.contains('sel');ch.classList.remove('sel');if(vald)nagon=true;if(i===rr&&vald)ch.classList.add('ratt');else if(i!==rr&&vald){ch.classList.add('fel');ok=false;}else if(i===rr&&!vald&&nagon)ch.classList.add('miss');});
        if(!nagon) ok=false;
      } else if(typ==='rutnat'){
        var facit=+el.dataset.facit,rutor=Array.prototype.slice.call(el.querySelectorAll('.d1-rut')),fyllt=rutor.filter(function(r){return r.classList.contains('fylld');}).length;
        ok=fyllt===facit; rutor.forEach(function(r){if(r.classList.contains('fylld'))r.classList.add(ok?'ratt':'fel');});
        if(!ok){var f3=document.createElement('span');f3.className='d1-fasit';f3.innerHTML='du markerade '+fyllt+', ska vara '+facit;el.insertAdjacentElement('afterend',f3);}
      }
      el.classList.toggle('klar-fel',!ok); if(ok) ratt++;
    });
    var sam=mount.querySelector('[data-sammanf]');
    if(ratt===totalt&&totalt>0){ sam.className='ovn-sammanf ok'; sam.style.display=''; sam.innerHTML='<div class="ovn-sammanf-icon">✓</div><span class="ovn-sammanf-titel">Allt rätt!</span>Du klarade alla '+totalt+' uppgifterna.'; visaKonfetti(); }
    else { sam.className='ovn-sammanf delvis'; sam.style.display=''; sam.innerHTML='Du har '+ratt+' av '+totalt+' rätt. Rätta de röda och tryck Kontrollera igen.'; }
    sam.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function wireTabs(){ var tabRow=document.getElementById('tab-row'); if(!tabRow)return; tabRow.querySelectorAll('.tab-btn').forEach(function(btn){btn.addEventListener('click',function(){var id=btn.dataset.tab;tabRow.querySelectorAll('.tab-btn').forEach(function(b){b.classList.toggle('is-active',b===btn);});document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.toggle('is-active',p.dataset.panel===id);});window.scrollTo({top:0,behavior:'smooth'});});}); var tb=tabRow.querySelector('.tab-btn[data-tab="test"]'); if(tb)tb.classList.remove('is-locked'); }

  render();
  wireTabs();
})();
