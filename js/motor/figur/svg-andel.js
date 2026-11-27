/* ============================================================
   svg-andel.js — DELAD SVG-figurmodul för k2 Del 1 "Andel och antal".
   Genererar figurerna i bokens palett (inga PNG ur läromedlet). Används av
   BÅDE Öva-bladet (blad-k2-d1.js) OCH Färdighetstränings-drillarna
   (ovamer-k2-andel.js) — en källa, "flytta och dela".

   window.SvgAndel = { färger, svg(), delRuta, delKryss, delAtta, delCirkel,
   delTriangel4, delHexagon, delStrip, hackKvadrat, olikStrip, ratTriKvart,
   diagKvadratAtta, tallinje, antalsfigur, husFigur, LFigur }.
   Laddas som klassiskt <script> FÖRE blad-/ovamer-filerna.
   ============================================================ */
(function(){
  'use strict';
  var C_LINE = '#3d3630', C_FILL = '#2f6ea0', C_RED = '#c0392b', C_GREEN = '#2f7d4f', C_PAPER = '#ffffff', C_MARK = '#5f7183';
  function svg(inner, w, h){ return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" style="display:block;overflow:visible;">' + inner + '</svg>'; }
  function fyllOk(f, i){ return f.indexOf(i) > -1; }

  // ── DELAD FIGUR ──
  /* FÄRGGRUPPER (Joachim 2026-11-26, procent åk7 Blad 1 nr 2): fyllda får också vara en lista med grupper,
     [{ antal: 1, farg: 'bla' }, { antal: 9, farg: 'rod' }, { antal: 40, farg: 'gron' }] — grupperna fylls i ordning,
     rad för rad, och resten blir vit. Färgerna är modulens egna (ingen ny färg). En lista med index ritas som förut. */
  var FARG = { bla: C_FILL, rod: C_RED, gron: C_GREEN };
  function fargAv(fyllda, i){
    if(!fyllda.length || typeof fyllda[0] !== 'object') return fyllOk(fyllda, i) ? C_FILL : C_PAPER;
    for(var g = 0, n = 0; g < fyllda.length; g++){ n += fyllda[g].antal; if(i < n) return FARG[fyllda[g].farg] || C_PAPER; }
    return C_PAPER;
  }
  /* KVADRATISKA RUTOR (Joachim 2026-11-26, procent metodträning B1): opt.kvadrat ger lika stora kvadratiska celler
     (24 px) oavsett antal — 4 × 5 = 120 × 96, 5 × 5 = 120 × 120, 5 × 10 = 240 × 120. Utan opt ritas rutnätet som förut
     (alltid 120 × 120). */
  function delRuta(rows, cols, fyllda, opt){ var kv=opt&&opt.kvadrat,W=kv?cols*24:120,H=kv?rows*24:120,cw=W/cols,ch=H/rows,s='',sw=2; for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var i=r*cols+c; s+='<rect x="'+(c*cw).toFixed(1)+'" y="'+(r*ch).toFixed(1)+'" width="'+cw.toFixed(1)+'" height="'+ch.toFixed(1)+'" fill="'+fargAv(fyllda,i)+'" stroke="'+C_LINE+'" stroke-width="'+sw+'"/>';} return svg(s,W,H); }
  function delKryss(fyllda){ var tri=['0,0 120,0 60,60','120,0 120,120 60,60','120,120 0,120 60,60','0,120 0,0 60,60'],s=''; tri.forEach(function(p,i){s+='<polygon points="'+p+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';}); return svg(s,120,120); }
  function delAtta(fyllda){ var b=[[60,0],[120,0],[120,60],[120,120],[60,120],[0,120],[0,60],[0,0]],s=''; for(var i=0;i<8;i++){var p=b[i],q=b[(i+1)%8]; s+='<polygon points="60,60 '+p[0]+','+p[1]+' '+q[0]+','+q[1]+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,120,120); }
  function delCirkel(n, fyllda){ var cx=60,cy=60,r=56,s=''; for(var i=0;i<n;i++){var a0=-Math.PI/2+i*2*Math.PI/n,a1=-Math.PI/2+(i+1)*2*Math.PI/n,x0=cx+r*Math.cos(a0),y0=cy+r*Math.sin(a0),x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),L=(a1-a0)>Math.PI?1:0; s+='<path d="M'+cx+','+cy+' L'+x0.toFixed(2)+','+y0.toFixed(2)+' A'+r+','+r+' 0 '+L+' 1 '+x1.toFixed(2)+','+y1.toFixed(2)+' Z" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,120,120); }
  function delTriangel4(fyllda){ var A=[4,116],B=[116,116],C=[60,6],AB=[60,116],BC=[88,61],CA=[32,61],tri=[[A,CA,AB],[B,AB,BC],[C,CA,BC],[CA,AB,BC]],s=''; tri.forEach(function(t,i){s+='<polygon points="'+t.map(function(p){return p[0]+','+p[1];}).join(' ')+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';}); return svg(s,120,122); }
  function delHexagon(fyllda){ var cx=60,cy=60,r=56,pts=[],s=''; for(var k=0;k<6;k++){var a=-Math.PI/2+k*Math.PI/3;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);} for(var i=0;i<6;i++){var p=pts[i],q=pts[(i+1)%6];s+='<polygon points="'+cx+','+cy+' '+p[0].toFixed(1)+','+p[1].toFixed(1)+' '+q[0].toFixed(1)+','+q[1].toFixed(1)+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,120,120); }
  /* SMALARE DELAR (Joachim 2026-11-26, procent metodträning B7): opt.bredd ger delarnas bredd (20 delar à 23 px = 460 px).
     Utan opt som förut (46 px). */
  /* STAPEL MED TEXT (Joachim 2026-11-27, procent moment 4 Blad 5 och 6). Tre val; utan dem ritas stapeln som förut.
     opt.hel = procenttalet: en odelad stapel (n · bredd lång) där den färgade delen är procenttalets bredd.
     opt.text: texten ovanför den färgade delen ("24 cm"). opt.skala: "0 %" och "100 %" under ändarna och procenttalet
     under den färgade delens slut. Färgerna och textstilen är modulens egna (ingen ny färg). */
  function delStrip(n, fyllda, opt){ var b=(opt&&opt.bredd)||46,W=b*n,s='';
    if(opt && (opt.hel != null || opt.text || opt.skala)) return stapelMedText(n, fyllda, opt, b, W);
    for(var i=0;i<n;i++){s+='<rect x="'+(i*b)+'" y="0" width="'+b+'" height="46" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';} return svg(s,W,46); }
  function stapelMedText(n, fyllda, opt, b, W){
    var y = opt.text ? 26 : 0, H = 46, s = '', slut, pr, i;
    function txt(x, ty, t, ank){ return '<text x="'+x.toFixed(1)+'" y="'+ty+'" text-anchor="'+ank+'" font-size="15" fill="'+C_LINE+'">'+t+'</text>'; }
    if(opt.hel != null){
      pr = opt.hel; slut = W * pr / 100;
      s += '<rect x="0" y="'+y+'" width="'+W+'" height="'+H+'" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/>'
        +  '<rect x="0" y="'+y+'" width="'+slut.toFixed(1)+'" height="'+H+'" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="2"/>';
    } else {
      for(i=0;i<n;i++){s+='<rect x="'+(i*b)+'" y="'+y+'" width="'+b+'" height="'+H+'" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>';}
      slut = b * (Math.max.apply(null, fyllda.concat([-1])) + 1); pr = Math.round(100 * slut / W);
    }
    // Texten står mitt över den färgade delen; är den bredare än delen (uppskattat 7,5 px per tecken) börjar den vid 0.
    if(opt.text) s += opt.text.length * 7.5 / 2 > slut / 2 ? txt(0, y - 8, opt.text, 'start') : txt(slut / 2, y - 8, opt.text, 'middle');
    if(opt.skala){
      var yt = y + H + 20;
      // Mittstrecket och procenttalet bara när den färgade delen slutar inne i stapeln: är hela stapeln färgad (hel: 100,
      // "hela stapeln är 320 cm", procent moment 3 D6) eller ingen del, står bara 0 % och 100 % (Joachim 2026-11-27).
      var mitt = slut > 0 && slut < W;
      (mitt ? [0, slut, W] : [0, W]).forEach(function(x){ s += '<line x1="'+x.toFixed(1)+'" y1="'+(y+H)+'" x2="'+x.toFixed(1)+'" y2="'+(y+H+6)+'" stroke="'+C_LINE+'" stroke-width="2"/>'; });
      s += txt(0, yt, '0 %', 'start') + (mitt ? txt(slut, yt, pr + ' %', 'middle') : '') + txt(W, yt, '100 %', 'end');
    }
    return svg(s, W, y + H + (opt.skala ? 26 : 0));
  }
  // Delad figur med OLIKA STORA delar
  function hackKvadrat(){ return svg('<rect x="0" y="0" width="120" height="120" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="2"/><polygon points="0,0 0,120 60,60" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/>',120,120); }
  function olikStrip(){ return svg('<rect x="0" y="0" width="60" height="60" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/><rect x="60" y="0" width="60" height="60" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/><rect x="120" y="0" width="120" height="60" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="2"/>',240,60); }
  function ratTriKvart(){ return svg('<polygon points="0,0 0,120 120,120" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/><line x1="0" y1="0" x2="120" y2="120" stroke="'+C_LINE+'" stroke-width="2"/><line x1="0" y1="60" x2="60" y2="60" stroke="'+C_LINE+'" stroke-width="1.5"/><line x1="60" y1="60" x2="60" y2="120" stroke="'+C_LINE+'" stroke-width="1.5"/><polygon points="0,60 60,60 60,120" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="1.5"/>',120,122); }
  function diagKvadratAtta(){ return svg('<rect x="0" y="0" width="120" height="120" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/><line x1="0" y1="120" x2="120" y2="0" stroke="'+C_LINE+'" stroke-width="2"/><line x1="60" y1="0" x2="60" y2="60" stroke="'+C_LINE+'" stroke-width="1.5"/><line x1="0" y1="60" x2="60" y2="60" stroke="'+C_LINE+'" stroke-width="1.5"/><polygon points="0,120 60,120 60,60" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="1.5"/>',120,120); }
  // Parametrerad hack-kvadrat: vit triangel-hack = fT/fN av kvadraten → färgad = resten
  function hackVar(fT, fN){ var hx = 240 * fT / fN; return svg('<rect x="0" y="0" width="120" height="120" fill="'+C_FILL+'" stroke="'+C_LINE+'" stroke-width="2"/><polygon points="0,0 0,120 '+hx.toFixed(0)+',60" fill="'+C_PAPER+'" stroke="'+C_LINE+'" stroke-width="2"/>',120,120); }
  // Parametrerad strip med OLIKA breda celler (cells = relativa bredder), fyllda = index
  function olikVar(cells, fyllda){ var U = 46, tot = 0, i; for(i = 0; i < cells.length; i++) tot += cells[i]; var W = tot * U, s = '', x = 0;
    for(i = 0; i < cells.length; i++){ s += '<rect x="'+(x*U)+'" y="0" width="'+(cells[i]*U)+'" height="46" fill="'+(fyllOk(fyllda,i)?C_FILL:C_PAPER)+'" stroke="'+C_LINE+'" stroke-width="2"/>'; x += cells[i]; }
    return svg(s, W, 46); }

  // ── TALLINJE ──
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

  // ── ANTALSFIGUR ──
  function antalsfigur(farger){
    var r=17, gap=12, perRow=Math.min(farger.length, 4), rows=Math.ceil(farger.length/perRow);
    var W=perRow*(2*r+gap)+gap, H=rows*(2*r+gap)+gap, s='';
    farger.forEach(function(f,i){ var col=i%perRow, row=Math.floor(i/perRow), cx=gap+r+col*(2*r+gap), cy=gap+r+row*(2*r+gap);
      var fill=f==='bla'?C_FILL:C_RED; s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" stroke="'+C_LINE+'" stroke-width="1.5"/>'
        + '<ellipse cx="'+(cx-r*0.32)+'" cy="'+(cy-r*0.34)+'" rx="'+(r*0.30)+'" ry="'+(r*0.20)+'" fill="rgba(255,255,255,.55)"/>'; });
    return svg(s, W, H);
  }

  // ── RUTNÄTS-AREA ──
  function husFigur(){ var U=30,W=8*U,H=6*U,s='';
    s+='<rect x="0" y="'+(3*U)+'" width="'+(8*U)+'" height="'+(3*U)+'" fill="'+C_FILL+'"/>';
    s+='<polygon points="0,'+(3*U)+' '+(8*U)+','+(3*U)+' '+(4*U)+',0" fill="'+C_RED+'"/>';
    for(var c=0;c<=8;c++) s+='<line x1="'+(c*U)+'" y1="0" x2="'+(c*U)+'" y2="'+H+'" stroke="'+C_LINE+'" stroke-width="1" opacity=".55"/>';
    for(var r=0;r<=6;r++) s+='<line x1="0" y1="'+(r*U)+'" x2="'+W+'" y2="'+(r*U)+'" stroke="'+C_LINE+'" stroke-width="1" opacity=".55"/>';
    s+='<polygon points="0,'+(3*U)+' '+(8*U)+','+(3*U)+' '+(4*U)+',0" fill="none" stroke="'+C_LINE+'" stroke-width="2"/>';
    s+='<rect x="0" y="'+(3*U)+'" width="'+(8*U)+'" height="'+(3*U)+'" fill="none" stroke="'+C_LINE+'" stroke-width="2"/>';
    return svg(s, W, H);
  }
  function LFigur(){ var U=34,W=7*U,H=5*U,ox=U*0.6,oy=U*0.6;
    function P(x,y){ return (ox+x*U).toFixed(0)+','+(oy+y*U).toFixed(0); }
    var grid='';
    for(var c=0;c<=6;c++) grid+='<line x1="'+(ox+c*U)+'" y1="'+oy+'" x2="'+(ox+c*U)+'" y2="'+(oy+3*U)+'" stroke="#cfe0ec" stroke-width="1"/>';
    for(var r=0;r<=3;r++) grid+='<line x1="'+ox+'" y1="'+(oy+r*U)+'" x2="'+(ox+6*U)+'" y2="'+(oy+r*U)+'" stroke="#cfe0ec" stroke-width="1"/>';
    var seg = '<polyline points="'+P(0,0)+' '+P(4,0)+'" fill="none" stroke="'+C_RED+'" stroke-width="3.5"/>'
      + '<polyline points="'+P(4,0)+' '+P(4,2)+' '+P(6,2)+' '+P(6,3)+'" fill="none" stroke="'+C_FILL+'" stroke-width="3.5"/>'
      + '<polyline points="'+P(0,3)+' '+P(0,0)+'" fill="none" stroke="'+C_FILL+'" stroke-width="3.5"/>'
      + '<polyline points="'+P(6,3)+' '+P(0,3)+'" fill="none" stroke="'+C_GREEN+'" stroke-width="3.5"/>';
    return svg(grid + seg, W, H);
  }

  window.SvgAndel = {
    C_LINE:C_LINE, C_FILL:C_FILL, C_RED:C_RED, C_GREEN:C_GREEN, C_PAPER:C_PAPER, C_MARK:C_MARK, svg:svg,
    delRuta:delRuta, delKryss:delKryss, delAtta:delAtta, delCirkel:delCirkel, delTriangel4:delTriangel4,
    delHexagon:delHexagon, delStrip:delStrip, hackKvadrat:hackKvadrat, olikStrip:olikStrip,
    ratTriKvart:ratTriKvart, diagKvadratAtta:diagKvadratAtta, hackVar:hackVar, olikVar:olikVar,
    tallinje:tallinje, antalsfigur:antalsfigur, husFigur:husFigur, LFigur:LFigur
  };
})();
