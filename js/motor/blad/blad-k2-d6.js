/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k2-d6-multiplikation-brak.html
   Byte-identiskt utbrutet (hela scriptet, logik orörd). Egen generation. */
// ============================================================
//  HJÄLPARE
// ============================================================
function gRand(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
function gPick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }

// Kanonisk (enklaste) blandad form av värdet t/n, n>0, t>=0.
// Returnerar {hel, t, n}. Heltal -> {hel:H, t:0, n:1}. Äkta bråk -> {hel:0, t, n}.
function kanonisk(t, n){
  if(n < 0){ t = -t; n = -n; }
  var g = gcd(t, n); t = t / g; n = n / g;
  var hel = Math.floor(t / n);
  var rem = t - hel * n;
  if(rem === 0) return {hel: hel, t: 0, n: 1};
  return {hel: hel, t: rem, n: n};
}

// ── Visning ──
function fracSpan(t, n){
  return '<span class="ovn-brak"><span class="ovn-brak-taljare">' + t + '</span>'
       + '<span class="ovn-brak-strecket"></span>'
       + '<span class="ovn-brak-namnare">' + n + '</span></span>';
}
function opSpan(op){ return '<span class="ovn-text" style="margin:0 6px;">' + op + '</span>'; }
function mixedSpan(o){
  if(o.t === 0) return '<span class="ovn-text ovn-num">' + o.hel + '</span>';
  var fore = o.hel ? '<span class="ovn-text ovn-num" style="margin-right:6px;">' + o.hel + '</span>' : '';
  return fore + fracSpan(o.t, o.n);
}
function mixedText(o){
  if(o.t === 0) return '' + o.hel;
  return (o.hel ? o.hel + ' ' : '') + o.t + '/' + o.n;
}

// ── Radbyggare ──
// ── Blandad form: heltal + bråk ──
function blandSpan(h, t, n){
  if(t === 0) return '<span class="ovn-text ovn-num">' + h + '</span>';
  var fore = h ? '<span class="ovn-text ovn-num" style="margin-right:5px;">' + h + '</span>' : '';
  return fore + fracSpan(t, n);
}

// ── Multiplikation med bråk ──
// heltal × bråk:  h × t/n  med mellanled: (h·t)/n = (ht)/n = svar
function radHeltalGanger(h, t, n){
  return {typ:'mulHeltal', h:h, t:t, n:n,
    prodT:h*t,            // täljarprodukt
    tal:['h'+h, 'f'+t+'/'+n],   // signatur: heltalet och bråket
    svar: kanonisk(h * t, n)};
}
// andel av antal:  t/n av N  med mellanled: (t·N)/n = (tN)/n = svar (heltal)
function radAndel(t, n, N){
  return {typ:'mulAndel', t:t, n:n, N:N,
    taljProd: t*N,        // t·N
    tal:['f'+t+'/'+n, 'N'+N],   // signatur: bråket och antalet
    svar: (t * N) / n};
}
// bråk × bråk:  t1/n1 × t2/n2
function radBrakGanger(t1, n1, t2, n2){
  return {typ:'brakSvar',
    vanster: fracSpan(t1, n1) + '<span class="ovn-text mult-tecken" style="margin:0 7px;">·</span>' + fracSpan(t2, n2),
    tal:['f'+t1+'/'+n1, 'f'+t2+'/'+n2],   // signatur: båda bråken
    opnd: {slag:'bb', t1:t1, n1:n1, t2:t2, n2:n2},
    likhet:true, svar: kanonisk(t1 * t2, n1 * n2)};
}
// blandad form × blandad form:  h1 t1/n1 × h2 t2/n2
function radBlandGanger(h1, t1, n1, h2, t2, n2){
  var T1 = h1 * n1 + t1, T2 = h2 * n2 + t2;
  return {typ:'brakSvar',
    vanster: blandSpan(h1, t1, n1) + '<span class="ovn-text mult-tecken" style="margin:0 7px;">·</span>' + blandSpan(h2, t2, n2),
    tal:['m'+h1+'_'+t1+'/'+n1, 'm'+h2+'_'+t2+'/'+n2],
    opnd: {slag:'mm', h1:h1, t1:t1, n1:n1, h2:h2, t2:t2, n2:n2},
    likhet:true, svar: kanonisk(T1 * T2, n1 * n2)};
}
// bråk × bråk MED mellanled:  t1/n1 · t2/n2 = (t1·t2)/(n1·n2) = (..)/(..) = svar
function radBrakMellan(t1, n1, t2, n2){
  return {typ:'mulBrak', t1:t1, n1:n1, t2:t2, n2:n2,
    prodT:t1*t2, prodN:n1*n2,
    tal:['f'+t1+'/'+n1, 'f'+t2+'/'+n2],
    svar: kanonisk(t1 * t2, n1 * n2)};
}
// bråk av bråk (andel):  t1/n1 av t2/n2 — samma uträkning som produkt, visas med "av"
function radAndelBrak(t1, n1, t2, n2){
  return {typ:'mulBrak', t1:t1, n1:n1, t2:t2, n2:n2, ord:'av',
    prodT:t1*t2, prodN:n1*n2,
    tal:['f'+t1+'/'+n1, 'f'+t2+'/'+n2],
    svar: kanonisk(t1 * t2, n1 * n2)};
}
/* FÖRKORTA KORSVIS MED MELLANLED (Joachim 2026-10-25), samma led som d3:s förkortning:
     6/20 · 10/12 = (6/6 · 10/10)/(20/10 · 12/6) = 1/4
   Eleven skriver varje tal i ledet, delat med faktorn det förkortas med (4/2), eller talet ensamt när det
   inte förkortas. Rättas som EN enhet: varje ruta börjar med sitt givna tal, samma faktorer står i täljaren
   som i nämnaren, och ledet når enklaste form; svaret i enklaste form. Ett ensamt förkortat tal (genvägen)
   fälls. Talen: båda bråken i enklaste form, så förkortningen sker korsvis — g1 = sgd(t1, n2), g2 = sgd(t2, n1). */
function radKors(t1, n1, t2, n2){
  var g1 = gcd(t1, n2), g2 = gcd(t2, n1);
  return {typ:'mulKors', t1:t1, n1:n1, t2:t2, n2:n2, g1:g1, g2:g2,
    tal:['f'+t1+'/'+n1, 'f'+t2+'/'+n2],
    svar: kanonisk(t1 * t2, n1 * n2)};
}
// Ledets facit för en ruta: talet delat med faktorn, eller talet ensamt (faktorn 1).
function korsLed(tal, g){ return g > 1 ? tal + '/' + g : String(tal); }
// x-ekvation:  (t/n) · x = (ht hela/bråk)  → svar för x. Om vänster är heltal: anvand h-attribut.
// form: vänsterText (HTML) · x = högerText (HTML); svar = kanonisk(svT, svN)
function radEkvation(vansterHTML, hogerHTML, svT, svN, talSig){
  return {typ:'mulEkvation', vansterHTML:vansterHTML, hogerHTML:hogerHTML,
    tal: talSig ? [talSig] : null,
    svar: kanonisk(svT, svN)};
}
// tre bråk med flexibelt mellanled: t1/n1 · t2/n2 · t3/n3
// Mellanledet: en täljarprodukt och en nämnarprodukt (tre rutor var). Rättas på VÄRDE:
// täljarprodukten ska gånger ihop till rätt täljarvärde, nämnarprodukten till rätt nämnarvärde
// (valfri giltig korsvis förkortning godtas). Slutsvaret rättas mot enklaste form.
function radTreBrak(t1, n1, t2, n2, t3, n3){
  var prodT = t1*t2*t3, prodN = n1*n2*n3;
  return {typ:'mulTre', t1:t1,n1:n1,t2:t2,n2:n2,t3:t3,n3:n3,
    prodT:prodT, prodN:prodN,
    tal:['f'+t1+'/'+n1, 'f'+t2+'/'+n2, 'f'+t3+'/'+n3],
    svar: kanonisk(prodT, prodN)};
}


// ============================================================
//  KONFETTI  (oförändrad från motorn)
// ============================================================
function visaKonfetti(){
  var gammal = document.querySelector('.konfetti-lager');
  if(gammal) gammal.remove();
  var lager = document.createElement('div');
  lager.className = 'konfetti-lager';
  document.body.appendChild(lager);
  var farger = ['#16a34a','#dc2626','#f59e0b','#3b82f6','#a855f7','#ec4899','#06b6d4'];
  for(var i = 0; i < 80; i++){
    var b = document.createElement('span');
    b.className = 'konfetti';
    b.style.left = (Math.random() * 100) + 'vw';
    b.style.background = farger[Math.floor(Math.random() * farger.length)];
    b.style.animationDuration = (2.5 + Math.random() * 2) + 's';
    b.style.animationDelay = (Math.random() * 0.8) + 's';
    b.style.width = (6 + Math.random() * 8) + 'px';
    b.style.height = (10 + Math.random() * 8) + 'px';
    lager.appendChild(b);
  }
  setTimeout(function(){ if(lager.parentNode) lager.remove(); }, 6000);
}

function jamforTal(a, b){
  if(a == null) return false;
  var n = AK8_UI.pNum(a);   // DELAD parser (ak8-blad-ui): mellanslag/NBSP, alla minusvarianter (U+2212, –, —), komma → punkt.
                            // Förr lokal: 10 av 15 kopior tog inte keypadens '−' → negativt svar = NaN = fel (order 2026-09-18 FAS 1).
  if(isNaN(n)) return false;
  return Math.abs(n - b) < 1e-9;
}

// MELLANLED = UTTRYCK (order 2026-09-23): rutor som bär ett mellanled rättas på VÄRDE med den delade
// evalArith (samma som åttan) — "1·4", "8/2" och "4" är alla rätt. Övriga rutor rättas som förr.
var MELLANLEDSRUTOR = 'mellan-fin,forlang-in,kedje-in,brak-steg-cell,stam-cell';
function arMellanled(inp){
  var kl = MELLANLEDSRUTOR.split(',');
  for(var i = 0; i < kl.length; i++) if(inp.classList.contains(kl[i])) return true;
  return false;
}
function jamforLed(inp, facit){
  if(!arMellanled(inp)) return jamforTal(inp.value, facit);
  var v = window.AK8_UI && AK8_UI.evalArith ? AK8_UI.evalArith(inp.value) : NaN;
  return isFinite(v) && Math.abs(v - facit) < 1e-9;
}


// ============================================================
//  RENDERING AV BLAD
// ============================================================
function svarBrakHTML(svar){
  // Helt tal (utan bråkdel): bara en ruta för heltalet
  if(svar && svar.t === 0){
    return '<span class="brak-svar">'
      + '<input class="ovn-in brak-cell brak-hel brak-heltal" inputmode="numeric" autocomplete="off"></span>';
  }
  // Heltalsrutan visas BARA när svaret är i blandad form (heltalsdel > 0)
  var helBox = (svar && svar.hel > 0)
    ? '<input class="ovn-in brak-cell brak-hel" inputmode="numeric" autocomplete="off">'
    : '';
  return '<span class="brak-svar">'
    + helBox
    + '<span class="ovn-brak brak-svar-frak">'
      + '<input class="ovn-in brak-cell brak-t" inputmode="numeric" autocomplete="off">'
      + '<span class="ovn-brak-strecket"></span>'
      + '<input class="ovn-in brak-cell brak-n" inputmode="numeric" autocomplete="off">'
    + '</span></span>';
}

function bladHTML(blad){
  var html = '<div class="ovn-sheet">'
    + '<h2>' + blad.titel + '</h2>'
    ;   // ingen intro-rad i öva (order 2026-09-23)

  if(blad.tvaNivaer){
    /* REGEL (Joachim 2026-10-03): är det bara TVÅ nivåer är ingen låst — nivå 1 och 2 är
       alltid klickbara, och en duktig elev hoppar fritt uppåt. Låset hör till ett TREDJE steg
       och uppåt. Antalet nivåer kommer ur bladets data, så ett tredje steg är data, inte kod. */
    var nivaAntal = blad.nivaAntal || 2;
    html += '<div class="niva-rad">';
    for(var nv = 1; nv <= nivaAntal; nv++){
      var nvLast = (nv >= 3) && !blad['niva' + nv + 'Upplast'];
      html += '<button type="button" class="niva-btn' + (blad.niva === nv ? ' is-active' : '')
        + (nvLast ? ' is-locked' : '') + '" data-niva="' + nv + '"' + (nvLast ? ' disabled' : '')
        + '>Nivå ' + nv + (nvLast ? ' \ud83d\udd12' : '') + '</button>';
    }
    html += '</div>';
  }

  // .brak-hint borttagen (order 2026-09-23): inga hjälptexter i öva

  blad.grupper.forEach(function(grupp, gi){
    // Mellanledskravet står i DATAN (grupp.mellanled) — mellanled-grind läser flaggan.
    html += '<div class="ovn-grupp"' + (grupp.mellanled ? ' data-mellanled="' + grupp.mellanled + '"' : '') + '>';
    html += '<div class="ovn-grupp-rubrik">' + (gi+1) + '. ' + grupp.rubrik + '</div>';
    var radNummer = 0;
    grupp.rader.forEach(function(rad){
      radNummer++;
      var bokstav = String.fromCharCode(96 + radNummer);

      if(rad.typ === 'brakSvar'){
        // Hjälpare: rättad bråk-cell (täljare/nämnare) med facit i data-svar
        function gFrac(facitT, facitN){
          return '<span class="ovn-brak brak-stegfrak">'
            + '<span class="ovn-brak-taljare"><input class="ovn-in brak-steg-cell" data-svar="' + facitT + '" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare"><input class="ovn-in brak-steg-cell" data-svar="' + facitN + '" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }
        // Produkt-bråk i förlängningssteget: (t·f)/(n·f) — eleven skriver de fyra talen
        function gProd(t, f, n){
          return '<span class="ovn-brak brak-stegfrak brak-prodfrak">'
            + '<span class="ovn-brak-taljare"><input class="ovn-in brak-steg-cell smal" data-svar="' + t + '" inputmode="numeric" autocomplete="off">'
            + '<span class="prod-gng">·</span>'
            + '<input class="ovn-in brak-steg-cell smal" data-svar="' + f + '" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare"><input class="ovn-in brak-steg-cell smal" data-svar="' + n + '" inputmode="numeric" autocomplete="off">'
            + '<span class="prod-gng">·</span>'
            + '<input class="ovn-in brak-steg-cell smal" data-svar="' + f + '" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }

        if(rad.steg && blad.mellanled){
          var s = rad.steg;
          // svaret: heltal + ev. bråkdel
          var svarBox = svarBrakHTML(rad.svar);
          html += '<div class="ovn-brak-rad brak-svar-rad brak-femled" data-rad="' + radNummer + '">';
          html += '<span class="ovn-label">' + bokstav + ')</span>';
          // 1. uppgift
          html += '<span class="femled-grp">' + fracSpan(s.t1,s.n1) + opSpan(s.op) + fracSpan(s.t2,s.n2) + '</span>';
          html += '<span class="ovn-text femled-eq">=</span>';
          // 2. förläng: (t1·f1)/(n1·f1) op (t2·f2)/(n2·f2)
          html += '<span class="femled-grp">' + gProd(s.t1,s.f1,s.n1) + opSpan(s.op) + gProd(s.t2,s.f2,s.n2) + '</span>';
          html += '<span class="ovn-text femled-eq">=</span>';
          // 3. samma nämnare: nt1/L op nt2/L
          html += '<span class="femled-grp">' + gFrac(s.nt1,s.L) + opSpan(s.op) + gFrac(s.nt2,s.L) + '</span>';
          html += '<span class="ovn-text femled-eq">=</span>';
          // 4. lägg ihop: kombT/kombN
          html += '<span class="femled-grp">' + gFrac(s.kombT,s.kombN) + '</span>';
          html += '<span class="ovn-text femled-eq">=</span>';
          // 5. svar
          html += '<span class="femled-grp">' + svarBox + '</span>';
          html += '</div>';
          return;
        }

        // Samma nämnare (eller mellanled av): bara svarsrutan
        if(rad.fraga){
          html += '<div class="brak-fragerad" data-rad="' + radNummer + '">';
          html += '<span class="ovn-label">' + bokstav + ')</span>';
          html += '<span class="brak-fragetext">' + rad.vanster + '</span>';
          html += '<span class="brak-svarlabel">Svar:</span>';
          html += svarBrakHTML(rad.svar);
          html += '</div>';
        } else {
          html += '<div class="ovn-brak-rad brak-svar-rad" data-rad="' + radNummer + '">';
          html += '<span class="ovn-label">' + bokstav + ')</span>';
          html += rad.vanster;
          html += '<span class="ovn-text" style="margin:0 4px;">=</span>';
          html += svarBrakHTML(rad.svar);
          html += '</div>';
        }
        return;
      }

      if(rad.typ === 'mulHeltal'){
        // heltal × bråk med mellanled:  h × t/n = (h·t)/n = (ht)/n = svar
        function cellFrac(ft, fn){
          return '<span class="ovn-brak brak-stegfrak">'
            + '<span class="ovn-brak-taljare"><input class="ovn-in brak-steg-cell" data-svar="' + ft + '" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare"><input class="ovn-in brak-steg-cell" data-svar="' + fn + '" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }
        function cellProd(a, b, fn){ // (a·b)/fn — eleven skriver a, b och nämnaren
          return '<span class="ovn-brak brak-stegfrak brak-prodfrak">'
            + '<span class="ovn-brak-taljare"><input class="ovn-in brak-steg-cell smal" data-svar="' + a + '" inputmode="numeric" autocomplete="off">'
            + '<span class="prod-gng">·</span>'
            + '<input class="ovn-in brak-steg-cell smal" data-svar="' + b + '" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare"><input class="ovn-in brak-steg-cell smal" data-svar="' + fn + '" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }
        html += '<div class="ovn-brak-rad brak-svar-rad brak-femled" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        // uppgift: h × t/n
        html += '<span class="femled-grp"><span class="ovn-text ovn-num">' + rad.h + '</span><span class="ovn-text mult-tecken" style="margin:0 6px;">·</span>' + fracSpan(rad.t, rad.n) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        // produktbråk (h·t)/n
        html += '<span class="femled-grp">' + cellProd(rad.h, rad.t, rad.n) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        // ihopräknat (ht)/n
        html += '<span class="femled-grp">' + cellFrac(rad.prodT, rad.n) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        // svar (blandad form)
        html += '<span class="femled-grp">' + svarBrakHTML(rad.svar) + '</span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'mulAndel'){
        // t/n av N med mellanled:  t/n av N = (t·N)/n = (tN)/n = svar
        function cellFracA(ft, fn){
          return '<span class="ovn-brak brak-stegfrak">'
            + '<span class="ovn-brak-taljare"><input class="ovn-in brak-steg-cell" data-svar="' + ft + '" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare"><input class="ovn-in brak-steg-cell" data-svar="' + fn + '" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }
        function cellProdA(a, b, fn){
          return '<span class="ovn-brak brak-stegfrak brak-prodfrak">'
            + '<span class="ovn-brak-taljare"><input class="ovn-in brak-steg-cell smal" data-svar="' + a + '" inputmode="numeric" autocomplete="off">'
            + '<span class="prod-gng">·</span>'
            + '<input class="ovn-in brak-steg-cell smal" data-svar="' + b + '" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare"><input class="ovn-in brak-steg-cell smal" data-svar="' + fn + '" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }
        html += '<div class="ovn-brak-rad brak-femled brak-andel-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="femled-grp">' + fracSpan(rad.t, rad.n) + '<span class="ovn-text" style="margin:0 5px;">av ' + rad.N + '</span></span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp">' + cellProdA(rad.t, rad.N, rad.n) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp">' + cellFracA(rad.taljProd, rad.n) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        // svaret är ett heltal
        html += '<span class="femled-grp"><input class="ovn-in" data-svar="' + rad.svar + '" inputmode="numeric" autocomplete="off" style="width:80px;border-color:var(--green);"></span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'mulTre'){
        // tre bråk: t1/n1 · t2/n2 · t3/n3 = (_·_·_)/(_·_·_) = svar
        // mellanledet har tre täljarrutor och tre nämnarrutor (flexibel rättning på produkt)
        function treProdBox(){
          return '<span class="ovn-brak brak-stegfrak brak-trefrak">'
            + '<span class="ovn-brak-taljare">'
            + '<input class="ovn-in brak-tre-cell smal tre-t" inputmode="numeric" autocomplete="off"><span class="prod-gng">·</span>'
            + '<input class="ovn-in brak-tre-cell smal tre-t" inputmode="numeric" autocomplete="off"><span class="prod-gng">·</span>'
            + '<input class="ovn-in brak-tre-cell smal tre-t" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare">'
            + '<input class="ovn-in brak-tre-cell smal tre-n" inputmode="numeric" autocomplete="off"><span class="prod-gng">·</span>'
            + '<input class="ovn-in brak-tre-cell smal tre-n" inputmode="numeric" autocomplete="off"><span class="prod-gng">·</span>'
            + '<input class="ovn-in brak-tre-cell smal tre-n" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }
        html += '<div class="ovn-brak-rad brak-svar-rad brak-femled brak-tre-rad" data-rad="' + radNummer + '" data-prodt="' + rad.prodT + '" data-prodn="' + rad.prodN + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="femled-grp">' + fracSpan(rad.t1, rad.n1) + '<span class="ovn-text mult-tecken" style="margin:0 6px;">·</span>' + fracSpan(rad.t2, rad.n2) + '<span class="ovn-text mult-tecken" style="margin:0 6px;">·</span>' + fracSpan(rad.t3, rad.n3) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp">' + treProdBox() + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp">' + svarBrakHTML(rad.svar) + '</span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'mulKors'){
        // t1/n1 · t2/n2 = (t1/g1 · t2/g2)/(n1/g2 · n2/g1) = svar. Rutorna bär data-tal (det givna talet)
        // och data-mellan (ledets facit, repots konvention).
        var korsCell = function(tal, g, aria){
          return '<input class="ovn-in ml-cell kors-cell" data-tal="' + tal + '" data-mellan="' + korsLed(tal, g) + '" inputmode="text" autocomplete="off" aria-label="' + aria + '">';
        };
        html += '<div class="ovn-brak-rad brak-femled kors-rad" data-rad="' + radNummer + '" data-t1="' + rad.t1 + '" data-n1="' + rad.n1
          + '" data-t2="' + rad.t2 + '" data-n2="' + rad.n2 + '" data-hel="' + rad.svar.hel + '" data-t="' + rad.svar.t + '" data-n="' + rad.svar.n + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="femled-grp">' + fracSpan(rad.t1, rad.n1) + '<span class="ovn-text mult-tecken" style="margin:0 7px;">·</span>' + fracSpan(rad.t2, rad.n2) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp"><span class="ovn-brak kedje-brak ml-led kors-led">'
          + '<span class="ovn-brak-taljare">' + korsCell(rad.t1, rad.g1, 'första täljaren') + '<span class="prod-gng">·</span>' + korsCell(rad.t2, rad.g2, 'andra täljaren') + '</span>'
          + '<span class="ovn-brak-strecket"></span>'
          + '<span class="ovn-brak-namnare">' + korsCell(rad.n1, rad.g2, 'första nämnaren') + '<span class="prod-gng">·</span>' + korsCell(rad.n2, rad.g1, 'andra nämnaren') + '</span>'
          + '</span></span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp">' + svarBrakHTML(rad.svar) + '</span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'mulBrak'){
        // bråk × bråk (eller "av") med mellanled: t1/n1 · t2/n2 = (t1·t2)/(n1·n2) = (..)/(..) = svar
        function cellF(ft, fn){
          return '<span class="ovn-brak brak-stegfrak">'
            + '<span class="ovn-brak-taljare"><input class="ovn-in brak-steg-cell" data-svar="' + ft + '" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare"><input class="ovn-in brak-steg-cell" data-svar="' + fn + '" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }
        function cellP(a, b, c, d){ // (a·b)/(c·d)
          return '<span class="ovn-brak brak-stegfrak brak-prodfrak">'
            + '<span class="ovn-brak-taljare"><input class="ovn-in brak-steg-cell smal" data-svar="' + a + '" inputmode="numeric" autocomplete="off"><span class="prod-gng">·</span><input class="ovn-in brak-steg-cell smal" data-svar="' + b + '" inputmode="numeric" autocomplete="off"></span>'
            + '<span class="ovn-brak-strecket"></span>'
            + '<span class="ovn-brak-namnare"><input class="ovn-in brak-steg-cell smal" data-svar="' + c + '" inputmode="numeric" autocomplete="off"><span class="prod-gng">·</span><input class="ovn-in brak-steg-cell smal" data-svar="' + d + '" inputmode="numeric" autocomplete="off"></span>'
            + '</span>';
        }
        var tecken = rad.ord === 'av'
          ? '<span class="ovn-text" style="margin:0 6px;">av</span>'
          : '<span class="ovn-text mult-tecken" style="margin:0 7px;">·</span>';
        html += '<div class="ovn-brak-rad brak-svar-rad brak-femled" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="femled-grp">' + fracSpan(rad.t1, rad.n1) + tecken + fracSpan(rad.t2, rad.n2) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp">' + cellP(rad.t1, rad.t2, rad.n1, rad.n2) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp">' + cellF(rad.prodT, rad.prodN) + '</span>';
        html += '<span class="ovn-text femled-eq">=</span>';
        html += '<span class="femled-grp">' + svarBrakHTML(rad.svar) + '</span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'mulEkvation'){
        // vänster · x = höger, eleven skriver x (i svarBrakHTML-form)
        html += '<div class="ovn-brak-rad brak-svar-rad brak-ekv-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="femled-grp">' + rad.vansterHTML + '</span>';
        html += '<span class="ovn-text" style="margin:0 5px;">=</span>';
        html += '<span class="femled-grp">' + rad.hogerHTML + '</span>';
        html += '<span class="ovn-text femled-eq" style="margin:0 10px;">⟶ x =</span>';
        html += '<span class="femled-grp">' + svarBrakHTML(rad.svar) + '</span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'valruta'){
        // Markera vilka alternativ som stämmer (flerval). alt: [{html, ratt:true/false}]
        html += '<div class="ovn-valruta-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<div class="valruta-grid" data-flera="1">';
        rad.alt.forEach(function(a, ai){
          html += '<button type="button" class="valruta-btn" data-ratt="' + (a.ratt ? '1' : '0') + '">' + a.html + '</button>';
        });
        html += '</div></div>';
        return;
      }

      if(rad.typ === 'brakDecimal'){
        // Blandad form via decimalform – eleven svarar med ett decimaltal
        html += '<div class="ovn-brak-rad brak-dec-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += rad.vanster;
        html += '<span class="ovn-text" style="margin:0 4px;">=</span>';
        html += '<input class="ovn-in brak-dec-in" data-svar="' + rad.svarDec + '" inputmode="decimal" autocomplete="off" style="width:110px;">';
        html += '</div>';
        return;
      }

      if(rad.typ === 'brakSaknad'){
        html += '<div class="ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        var inp = '<input class="ovn-in lucka" data-svar="' + rad.svar
          + '" inputmode="numeric" autocomplete="off" style="width:56px;height:34px;font-size:17px;">';
        html += rad.html.replace('@IN@', inp);
        html += '</div>';
        return;
      }

      if(rad.typ === 'problem'){
        html += '<div class="prob-rad" data-rad="' + radNummer + '">';
        html += '<div class="prob-fraga"><span class="ovn-label">' + bokstav + ')</span><span>' + rad.fraga + '</span></div>';
        html += '<div class="prob-kladd-rubrik">Min uträkning</div>';
        html += '<textarea class="prob-kladd" rows="3"></textarea>';
        html += '<div class="prob-svar-rad"><span class="prob-label">Svar:</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar + '" inputmode="decimal" autocomplete="off">';
        if(rad.enhet) html += '<input class="ovn-in enhet" data-enhet="' + rad.enhet + '" inputmode="text" autocomplete="off">';
        html += '</div></div>';
        return;
      }

      // enkla rader (reserv)
      html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
      html += '<span class="ovn-label">' + bokstav + ')</span>';
      if(rad.typ === 'enkel'){
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar + '" inputmode="decimal" autocomplete="off">';
      } else if(rad.typ === 'lucka'){
        var bitar = rad.text.split('__');
        html += '<span class="ovn-text ovn-num">' + bitar[0] + '</span>';
        html += '<input class="ovn-in lucka" data-svar="' + rad.svar + '" inputmode="decimal" autocomplete="off">';
        if(bitar[1] !== undefined) html += '<span class="ovn-text ovn-num">' + bitar[1] + '</span>';
      }
      html += '</div>';
    });
    html += '</div>';
  });

  // Knappsats: siffror + radera. (Bråk skrivs ruta för ruta, inga operatorer behövs.)
  html += '<div class="ovn-wrap" style="padding-top:0;">';
  html += '<div class="ovn-kontroll-rad">'
    + '<button type="button" class="ovn-kontroll" data-action="kontroll">Kontrollera</button>'
    + '<button type="button" class="ovn-aterstall" data-action="reset">Återställ</button>'
    + (blad.kanGenerera ? '<button type="button" class="ovn-aterstall" data-action="nytt-blad">↻ Nytt blad med andra tal</button>' : '')
    + '</div>';

  // DELAD AK8_UI-keypad (fast layout + kontext-gråning). Migrerad från egen .ovn-keypad.
  html += AK8_UI.keypadHTML();

  html += '<div class="ovn-sammanf" data-sammanf style="display:none;"></div>';
  html += '<div class="ovn-skriv-ut"><button type="button" data-action="print">↗ Skriv ut bladet</button></div>';
  html += '</div>';

  html += '</div>';
  return html;
}

// ============================================================
//  BYGG + RÄTTA
// ============================================================
function bygg_blad(rotEl, blad){
  rotEl.innerHTML = bladHTML(blad);

  // bokstäver om per grupp
  rotEl.querySelectorAll('.ovn-grupp').forEach(function(g){
    var bok = 96;
    g.querySelectorAll('.ovn-label').forEach(function(lbl){ bok++; lbl.textContent = String.fromCharCode(bok) + ')'; });
  });

  var inputs = Array.from(rotEl.querySelectorAll('.ovn-in'));
  var fokus = 0;

  inputs.forEach(function(inp, i){
    inp.addEventListener('focus', function(){ fokus = i; });
    inp.addEventListener('input', function(){
      // Rutan följer talet: måttet är formen (34 px bråkcell, 26 px stegruta), inte ett tak.
      if(window.AK8_UI && AK8_UI.vaxMedGolv) AK8_UI.vaxMedGolv(inp);
      inp.classList.remove('correct','wrong');
      if(inp.classList.contains('brak-cell')){
        var rad = inp.closest('.brak-svar-rad, .brak-fragerad');
        if(rad) rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
        if(rad) rad.querySelectorAll('.brak-cell').forEach(function(c){ c.classList.remove('correct','wrong'); });
      } else {
        var f = inp.parentElement.querySelector('.ovn-fasit');
        if(f) f.remove();
      }
    });
  });

  // Knappsats
  // Knappsats – delad AK8_UI-bindning (fokus-följning, kontext-gråning, ⌫, Enter→nästa ruta).
  if(window.AK8_UI && AK8_UI.bindKeypad) AK8_UI.bindKeypad(rotEl);

  function marker(ok){
    var m = document.createElement('span');
    m.className = 'ovn-mark ' + (ok ? 'ok' : 'fel');
    m.textContent = ok ? '✓' : '✗';
    return m;
  }

  rotEl.querySelector('[data-action="kontroll"]').addEventListener('click', function(){
    var ratt = 0, totalt = 0;

    // 1) Vanliga enstaka svar (hoppa över bråkcellerna)
    inputs.forEach(function(inp){
      if(inp.classList.contains('brak-cell') || inp.classList.contains('brak-kladd') || inp.classList.contains('brak-kladd-cell')) return;
      if(inp.classList.contains('kors-cell')) return;   // korsvisa ledet rättas med sin rad (steg 5)
      // Tre-bråk-ledets rutor rättas med sin rad (steg 4). Förr räknades de också här, utan facit, och
      // "Stora tal – blad 2" kunde aldrig ge full pott (8 av 32 med allt rätt, mätt vid HEAD 2026-10-25).
      if(inp.classList.contains('brak-tre-cell')) return;
      // Steg-celler (femledad uppställning): rätta och färglägg, men utan inline-markörer
      if(inp.classList.contains('brak-steg-cell')){
        inp.classList.remove('correct','wrong','just-checked');
        // Obesvarad steg-cell rättas inte — räknas, men färgläggs inte. Uppställningens tomma
        // rutor är de eleven inte hunnit till, inte fel hon gjort.
        if(String(inp.value).trim() === ''){ totalt++; return; }
        var okS = jamforLed(inp, parseFloat(inp.dataset.svar));
        totalt++;
        if(okS){ ratt++; inp.classList.add('correct','just-checked'); }
        else { inp.classList.add('wrong','just-checked'); }
        setTimeout(function(){ inp.classList.remove('just-checked'); }, 500);
        return;
      }
      var rad = inp.closest('.ovn-rad, .ovn-brak-rad, .prob-rad') || inp.parentElement;
      rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
      inp.classList.remove('correct','wrong','just-checked');
      // OBESVARAD RUTA RÄTTAS INTE: räknas i nämnaren, men får varken markering eller facit.
      if(String(inp.value).trim() === ''){ totalt++; return; }
      var ok;
      if(inp.dataset.enhet) ok = (String(inp.value).toLowerCase().replace(/[\s.]/g,'') === String(inp.dataset.enhet).toLowerCase().replace(/[\s.]/g,''));
      else ok = jamforLed(inp, parseFloat(inp.dataset.svar));
      totalt++;
      var mk = marker(ok);
      if(ok){ inp.classList.add('correct','just-checked'); ratt++; inp.insertAdjacentElement('afterend', mk); }
      else {
        inp.classList.add('wrong','just-checked');
        var facit = inp.dataset.enhet ? inp.dataset.enhet : String(inp.dataset.svar).replace('.', ',');
        var f = document.createElement('span'); f.className = 'ovn-fasit'; f.textContent = 'rätt svar: ' + facit;
        inp.insertAdjacentElement('afterend', mk); mk.insertAdjacentElement('afterend', f);
      }
      setTimeout(function(){ inp.classList.remove('just-checked'); }, 500);
    });

    // 2) Bråksvar – rättas som helhet, kräver enklaste form. Rutorna varierar med svarets form.
    rotEl.querySelectorAll('.brak-svar-rad, .brak-fragerad').forEach(function(row){
      var helIn = row.querySelector('.brak-hel');
      var tIn = row.querySelector('.brak-t');
      var nIn = row.querySelector('.brak-n');
      var boxar = [helIn, tIn, nIn].filter(Boolean);
      if(boxar.length === 0) return;
      totalt++;
      row.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
      boxar.forEach(function(b){ b.classList.remove('correct','wrong','just-checked'); });
      // Bråksvaret är EN enhet. Är hela raden tom är den obesvarad — inte fel.
      if(boxar.every(function(b){ return String(b.value).trim() === ''; })) return;

      var cH = parseInt(row.dataset.hel, 10);
      var cT = parseInt(row.dataset.t, 10);
      var cN = parseInt(row.dataset.n, 10);
      var fyll = function(el){ return el ? (el.value || '').trim() : ''; };
      var lika = function(el, v){ return el && fyll(el) !== '' && AK8_UI.pInt(el.value) === v; };
      var ok;
      if(cT === 0){
        // helt tal: bara heltalsrutan finns
        ok = lika(helIn, cH);
      } else if(cH === 0){
        // äkta bråk: ingen heltalsruta
        ok = lika(tIn, cT) && lika(nIn, cN);
      } else {
        // blandad form: heltal + bråk
        ok = lika(helIn, cH) && lika(tIn, cT) && lika(nIn, cN);
      }
      var mk = marker(ok);
      var ankare = row.querySelector('.brak-svar');
      if(ok){
        ratt++;
        boxar.forEach(function(b){ if(String(b.value).trim()==='') return; b.classList.add('correct','just-checked'); });
        ankare.insertAdjacentElement('afterend', mk);
      } else {
        boxar.forEach(function(b){ if(String(b.value).trim()==='') return; b.classList.add('wrong','just-checked'); });
        ankare.insertAdjacentElement('afterend', mk);
        var f = document.createElement('span'); f.className = 'ovn-fasit';
        f.textContent = 'rätt svar: ' + row.dataset.facit;
        mk.insertAdjacentElement('afterend', f);
      }
      setTimeout(function(){ boxar.forEach(function(b){ b.classList.remove('just-checked'); }); }, 500);
    });

    // 3) Valruta-rader (markera alla rätta produkter)
    rotEl.querySelectorAll('.valruta-grid').forEach(function(grid){
      totalt++;
      var alla = Array.from(grid.querySelectorAll('.valruta-btn'));
      var alltRatt = alla.every(function(b){
        var skaVara = b.dataset.ratt === '1';
        var ärVald = b.classList.contains('vald');
        return skaVara === ärVald;
      });
      alla.forEach(function(b){
        b.classList.remove('ruta-ok','ruta-fel');
        var skaVara = b.dataset.ratt === '1';
        var ärVald = b.classList.contains('vald');
        if(skaVara) b.classList.add(ärVald ? 'ruta-ok' : 'ruta-fel');
        else if(ärVald) b.classList.add('ruta-fel');
      });
      if(alltRatt) ratt++;
    });

    // 4) Tre-bråk-rader (mulTre): flexibelt mellanled – täljarprodukt/nämnarprodukt ska ge rätt värde
    rotEl.querySelectorAll('.brak-tre-rad').forEach(function(row){
      var prodT = parseInt(row.dataset.prodt, 10), prodN = parseInt(row.dataset.prodn, 10);
      var tCells = Array.from(row.querySelectorAll('.tre-t'));
      var nCells = Array.from(row.querySelectorAll('.tre-n'));
      totalt++;
      // läs in elevens produkter
      var tVals = tCells.map(function(c){ return AK8_UI.pInt(c.value); });
      var nVals = nCells.map(function(c){ return AK8_UI.pInt(c.value); });
      var tFyllda = tVals.every(function(v){ return !isNaN(v) && v > 0; });
      var nFyllda = nVals.every(function(v){ return !isNaN(v) && v > 0; });
      var mtT = tVals.reduce(function(a,b){ return a*b; }, 1);
      var mnN = nVals.reduce(function(a,b){ return a*b; }, 1);
      // flexibel: produkten av mellanledet ska ha samma värde som facit (valfri giltig förkortning)
      var mellanOk = tFyllda && nFyllda && mnN !== 0 && Math.abs(mtT / mnN - prodT / prodN) < 1e-9;
      tCells.concat(nCells).forEach(function(c){ c.classList.remove('correct','wrong'); c.classList.add(mellanOk ? 'correct' : 'wrong'); });
      if(mellanOk) ratt++;
    });

    // 5) Korsvis förkortning (mulKors) — raden är EN enhet: ledet och svaret.
    //    Ledet: varje ruta är sitt givna tal, ensamt eller delat med en faktor som går jämnt upp (4/2).
    //    Faktorerna i täljaren ska vara samma som i nämnaren (samma faktor uppe och nere), och de
    //    förkortade talen ska ge enklaste form. Ett ensamt förkortat tal (1 i stället för 6/6) fälls.
    rotEl.querySelectorAll('.kors-rad').forEach(function(row){
      totalt++;
      row.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
      var celler = Array.prototype.slice.call(row.querySelectorAll('.kors-cell'));
      var svarRutor = Array.prototype.slice.call(row.querySelectorAll('.brak-cell'));
      celler.concat(svarRutor).forEach(function(c){ c.classList.remove('correct','wrong','just-checked'); });
      if(celler.concat(svarRutor).every(function(c){ return String(c.value).trim() === ''; })) return;   // obesvarad
      function del(el){   // → {kvot, faktor} eller null
        var s = AK8_UI.avTusental(String(el.value)).replace(/\s+/g, '');
        var tal = +el.dataset.tal, m = s.match(/^(\d+)(?:[\/:÷](\d+))?$/);
        if(!m || +m[1] !== tal) return null;
        var g = m[2] === undefined ? 1 : +m[2];
        if(g < 1 || tal % g !== 0) return null;
        return {kvot: tal / g, faktor: g};
      }
      var d = celler.map(del);
      var ledOk = d.every(Boolean);
      if(ledOk){
        var uppe = [d[0].faktor, d[1].faktor].filter(function(g){ return g > 1; }).sort(),
            nere = [d[2].faktor, d[3].faktor].filter(function(g){ return g > 1; }).sort();
        ledOk = uppe.join(',') === nere.join(',') && gcd(d[0].kvot * d[1].kvot, d[2].kvot * d[3].kvot) === 1;
      }
      var cH = +row.dataset.hel, cT = +row.dataset.t, cN = +row.dataset.n;
      var helIn = row.querySelector('.brak-hel'), tIn = row.querySelector('.brak-t'), nIn = row.querySelector('.brak-n');
      var lika = function(el, v){ return el && String(el.value).trim() !== '' && AK8_UI.pInt(el.value) === v; };
      var svarOk = cT === 0 ? lika(helIn, cH) : (cH === 0 ? lika(tIn, cT) && lika(nIn, cN) : lika(helIn, cH) && lika(tIn, cT) && lika(nIn, cN));
      celler.forEach(function(c){ if(String(c.value).trim() !== '') c.classList.add(ledOk ? 'correct' : 'wrong'); });
      svarRutor.forEach(function(c){ if(String(c.value).trim() !== '') c.classList.add(svarOk ? 'correct' : 'wrong'); });
      var ok = ledOk && svarOk, mk = marker(ok);
      row.appendChild(mk);
      if(ok) ratt++;
      else {
        // Facit staplat så som eleven skriver det (6/6 · 10/10 över 20/10 · 12/6 = 1/4)
        var gng = '<span class="prod-gng">·</span>';
        var fx = document.createElement('span'); fx.className = 'ovn-fasit';
        fx.innerHTML = 'rätt svar: <span class="ml-facit">'
          + fracSpan(celler[0].dataset.mellan + gng + celler[1].dataset.mellan, celler[2].dataset.mellan + gng + celler[3].dataset.mellan)
          + opSpan('=') + mixedSpan({hel: cH, t: cT, n: cN}) + '</span>';
        row.appendChild(fx);
      }
    });

    var sam = rotEl.querySelector('[data-sammanf]');
    sam.style.display = 'block';
    sam.classList.remove('ok','delvis');
    if(ratt === totalt && totalt > 0){
      sam.classList.add('ok');
      sam.innerHTML = '<div class="ovn-sammanf-icon">✓</div>'
        + '<span class="ovn-sammanf-titel">Allt rätt!</span>'
        + ratt + ' av ' + totalt + ' — jättebra jobbat!';
      visaKonfetti();
      if(blad.tabId && !blad.isTest && (blad.niva === undefined || blad.niva === 1)) markeraKlar(blad.tabId);
      if(blad.isTest) godkannTest();
    } else {
      sam.classList.add('delvis');
      sam.textContent = 'Du fick ' + ratt + ' av ' + totalt + ' rätt. Titta på de rödmarkerade rutorna och försök igen.';
    }

    // Nivå 1 -> nivå 2 låses upp vid högst 2 fel
    /* Nästa steg låses upp vid högst två fel. Generaliserat från "nivå 1 → nivå 2" till
       "niva → niva+1": för ett tvånivåblad blir nyckeln exakt naddNiva2 som förr, och en
       framtida nivå 3 får sin nyckel skriven i stället för att vara permanent låst. */
    if(blad.tvaNivaer && blad.niva < (blad.nivaAntal || 2) && (totalt - ratt) <= 2 && totalt > 0){
      var nastaNiva = blad.niva + 1;
      lsSet('brak6_naddNiva' + nastaNiva + '_' + blad.tabId, '1');
      var rad2 = document.createElement('div'); rad2.className = 'niva-vidare';
      var knapp2 = document.createElement('button');
      knapp2.type = 'button'; knapp2.className = 'ovn-kontroll';
      // Ordalydelsen oförändrad; bara siffran följer nivån, som i nivåknapparnas etiketter.
      knapp2.textContent = (ratt === totalt) ? 'Snyggt! Gå vidare till nivå ' + nastaNiva + ' →' : 'Bra jobbat — du får gå vidare till nivå ' + nastaNiva + ' →';
      knapp2.addEventListener('click', function(){ byggNiva(blad.tabId, nastaNiva); });
      rad2.appendChild(knapp2);
      sam.appendChild(rad2);
    }
    sam.scrollIntoView({behavior:'smooth', block:'center'});
  });

  rotEl.querySelector('[data-action="reset"]').addEventListener('click', function(){
    inputs.forEach(function(inp){ inp.value = ''; inp.classList.remove('correct','wrong','just-checked'); });
    rotEl.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
    var sam = rotEl.querySelector('[data-sammanf]'); sam.style.display = 'none'; sam.textContent = '';
    if(inputs[0]) inputs[0].focus();
  });

  var nyttBtn = rotEl.querySelector('[data-action="nytt-blad"]');
  if(nyttBtn) nyttBtn.addEventListener('click', function(){ byggSheet(rotEl.id.replace('sheet-',''), false); });

  rotEl.querySelectorAll('.niva-btn').forEach(function(nb){
    nb.addEventListener('click', function(){
      if(nb.classList.contains('is-locked')) return;
      byggNiva(blad.tabId, parseInt(nb.dataset.niva, 10));
    });
  });

  rotEl.querySelector('[data-action="print"]').addEventListener('click', function(){ window.print(); });

  // Valruta: klicka för att markera/avmarkera
  rotEl.querySelectorAll('.valruta-btn').forEach(function(b){
    b.addEventListener('click', function(){
      b.classList.toggle('vald');
      b.classList.remove('ruta-ok','ruta-fel');
    });
  });

  if(inputs[0]) inputs[0].focus();
}

// fyll varje bråksvarsrad med facit-data efter rendering
function fyllFacitData(rotEl, blad){
  var rader = rotEl.querySelectorAll('.brak-svar-rad, .brak-fragerad');
  var fasitLista = [];
  blad.grupper.forEach(function(g){ g.rader.forEach(function(r){ if(r.typ === 'brakSvar' || r.typ === 'mulHeltal' || r.typ === 'mulBrak' || r.typ === 'mulEkvation' || r.typ === 'mulTre') fasitLista.push(r.svar); }); });
  rader.forEach(function(row, i){
    var s = fasitLista[i];
    if(!s) return;
    row.dataset.hel = s.hel; row.dataset.t = s.t; row.dataset.n = s.n;
    row.dataset.facit = mixedText(s);
  });
}

// Generera flera uppgifter men undvik att samma svar upprepas för ofta.
// genFn() -> rad med rad.svar = {hel,t,n}. maxLika = hur många gånger ett svar får återkomma.
function unika(genFn, antal, maxLika){
  maxLika = maxLika || 1;
  var rader = [], rakning = {}, anvandaTal = {}, forsok = 0;
  while(rader.length < antal && forsok < 600){
    forsok++;
    var r = genFn();
    var nyckel = r.svar ? mixedText(r.svar) : ('r' + rader.length);
    if((rakning[nyckel] || 0) >= maxLika) continue;
    // Avvisa om uppgiftens egna tal är identiska (t.ex. samma bråk två gånger)
    if(r.tal && new Set(r.tal).size < r.tal.length) continue;
    // Avvisa om något tal (heltal/bråk) redan använts i en tidigare uppgift på bladet
    if(r.tal && r.tal.some(function(x){ return anvandaTal[x]; })) continue;
    rakning[nyckel] = (rakning[nyckel] || 0) + 1;
    if(r.tal) r.tal.forEach(function(x){ anvandaTal[x] = true; });
    rader.push(r);
  }
  // Säkerhetsnät: om vi inte fyllt kvoten, fortsätt men kräv åtminstone att talen är nya
  var nodforsok = 0;
  while(rader.length < antal && nodforsok < 2000){
    nodforsok++;
    var r2 = genFn();
    if(r2.tal && new Set(r2.tal).size < r2.tal.length) continue;
    if(r2.tal && r2.tal.some(function(x){ return anvandaTal[x]; })) continue;
    if(r2.tal) r2.tal.forEach(function(x){ anvandaTal[x] = true; });
    rader.push(r2);
  }
  // Allra sista utväg (ska sällan behövas): fyll upp utan krav
  while(rader.length < antal) rader.push(genFn());
  return rader;
}
// ============================================================
//  MULTIPLIKATION MED BRÅK – blad per flik (nivå 1 + nivå 2)
// ============================================================
// B. Heltal × bråk OCH andel av ett antal
// Hjälpare för uppgift 3: visa en produkt (heltal×bråk eller bråk×heltal) som alternativ
function altHB(h, t, n){ return {html:'<span class="ovn-num">'+h+'</span> <span class="mult-tecken">·</span> '+fracSpan(t,n), ratt:(h*t/n)>1}; }
function altBH(t, n, h){ return {html:fracSpan(t,n)+' <span class="mult-tecken">·</span> <span class="ovn-num">'+h+'</span>', ratt:(t*h/n)>1}; }
function altHBmellan(h, t, n){ var v=h*t/n; return {html:'<span class="ovn-num">'+h+'</span> <span class="mult-tecken">·</span> '+fracSpan(t,n), ratt:(v>0.5 && v<1)}; }
function altBHmellan(t, n, h){ var v=t*h/n; return {html:fracSpan(t,n)+' <span class="mult-tecken">·</span> <span class="ovn-num">'+h+'</span>', ratt:(v>0.5 && v<1)}; }

function GRUND_HELTAL_N1(){
  return { titel:'Heltal × bråk och andel av ett antal – blad 1', tabId:'heltal', keypadOps:['/','='], mellanled:true,
    grupper:[
      {rubrik:'Beräkna', rader:[
        radHeltalGanger(6,4,11), radHeltalGanger(5,3,4), radHeltalGanger(3,7,8), radHeltalGanger(3,5,9)
      ]},
      {rubrik:'Beräkna andelen av antalet', rader:[
        radAndel(3,4,80), radAndel(2,3,24), radAndel(4,5,200), radAndel(2,7,210)
      ]},
      {rubrik:'Vilka av produkterna är större än 1? Markera alla som stämmer.', rader:[
        {typ:'valruta', alt:[ altBH(2,3,2), altBH(3,17,5), altHB(7,1,8), altHB(5,2,9), altBH(9,20,2), altBH(5,36,7) ]}
      ]}
    ]};
}
function GRUND_HELTAL_N2(){
  return { titel:'Heltal × bråk och andel – blad 2 (svårare)', tabId:'heltal', keypadOps:['/','='], mellanled:true,
    grupper:[
      {rubrik:'Beräkna', rader:[
        radHeltalGanger(9,5,7), radHeltalGanger(6,5,11), radHeltalGanger(12,4,5)
      ]},
      {rubrik:'Beräkna andelen av antalet', rader:[
        radAndel(5,7,560), radAndel(7,9,8118), radAndel(5,12,480)
      ]},
      {rubrik:'Vilka av produkterna är mellan 0,5 och 1? Markera alla som stämmer.', rader:[
        {typ:'valruta', alt:[ altBHmellan(2,7,2), altBHmellan(3,13,2), altBHmellan(5,33,7), altHBmellan(9,5,91), altHBmellan(12,5,121) ]}
      ]}
    ]};
}
function gHeltalRad(){ return radHeltalGanger(gRand(2,9), gRand(1,7), gPick([3,4,5,6,7,8,9])); }
function gAndelRad(){ var n=gPick([3,4,5,6,8]); var t=gRand(1,n-1); var bas=gPick([60,80,100,120,150,200,240,300,360,400,560]); var N=Math.round(bas/n)*n; return radAndel(t,n,N); }
function GEN_HELTAL_N1(){
  return { titel:'Heltal × bråk och andel – nytt blad', tabId:'heltal', keypadOps:['/','='], mellanled:true,
    grupper:[
      {rubrik:'Beräkna', rader: unika(gHeltalRad, 4, 1)},
      {rubrik:'Beräkna andelen av antalet', rader: unika(gAndelRad, 3, 1)}
    ]};
}
function GEN_HELTAL_N2(){ return GEN_HELTAL_N1(); }

// C. Bråk × bråk  (med mellanled, två blad + x-ekvationer på blad 2)
function altBB(t1,n1,t2,n2,jmfT,jmfN){ var F=t1*t2, N=n1*n2; var stor=F*jmfN > jmfT*N; return {html:fracSpan(t1,n1)+' <span class="mult-tecken">·</span> '+fracSpan(t2,n2), ratt:stor}; }
function GRUND_BRAKBRAK_N1(){
  return { titel:'Bråk × bråk – blad 1', tabId:'brakbrak', keypadOps:['/','='], mellanled:true,
    grupper:[
      {rubrik:'Beräkna', rader:[
        radBrakMellan(1,6,2,3), radBrakMellan(3,5,2,5), radBrakMellan(6,7,1,4), radBrakMellan(3,4,3,7)
      ]},
      {rubrik:'Hur mycket är', rader:[
        radAndelBrak(1,2,1,2), radAndelBrak(1,3,1,2), radAndelBrak(1,3,1,4)
      ]},
      {rubrik:'Vilka av produkterna är större än 3/5? Markera alla som stämmer.', rader:[
        {typ:'valruta', alt:[ altBB(1,4,3,5,3,5), altBB(8,9,3,5,3,5), altBB(9,4,3,5,3,5), altBB(3,5,6,5,3,5), altBB(3,5,9,10,3,5), altBB(5,5,3,5,3,5) ]}
      ]}
    ]};
}
function GRUND_BRAKBRAK_N2(){
  return { titel:'Bråk × bråk – blad 2 (svårare)', tabId:'brakbrak', keypadOps:['/','='], mellanled:true,
    grupper:[
      {rubrik:'Beräkna', rader:[
        radBrakMellan(6,7,11,7), radBrakMellan(7,9,10,11), radBrakMellan(5,3,7,9), radBrakMellan(7,2,9,17)
      ]},
      {rubrik:'Hur mycket är', rader:[
        radAndelBrak(3,5,1,4), radAndelBrak(2,9,3,4), radAndelBrak(3,8,2,5)
      ]},
      {rubrik:'Vilket tal ska stå istället för x?', rader:[
        radEkvation(fracSpan(6,7)+' <span class="mult-tecken">·</span> x', '<span class="ovn-num">1</span>', 7,6, 'e6/7'),
        radEkvation(fracSpan(5,3)+' <span class="mult-tecken">·</span> x', '<span class="ovn-num">5</span>', 3,1, 'e5/3'),
        radEkvation(fracSpan(4,9)+' <span class="mult-tecken">·</span> x', '<span class="ovn-num">1</span>', 9,4, 'e4/9'),
        radEkvation(fracSpan(3,16)+' <span class="mult-tecken">·</span> x', fracSpan(3,8), 2,1, 'e3/16'),
        radEkvation(fracSpan(3,25)+' <span class="mult-tecken">·</span> x', fracSpan(3,5), 5,1, 'e3/25'),
        radEkvation('x <span class="mult-tecken">·</span> <span class="ovn-num">8</span>', '<span class="ovn-num">2</span>', 1,4, 'ex8')
      ]}
    ]};
}
function gBrakBrakRad(){ return radBrakMellan(gRand(1,6), gPick([2,3,4,5,7]), gRand(1,6), gPick([2,3,5,6,8])); }
function GEN_BRAKBRAK_N1(){ return { titel:'Bråk × bråk – nytt blad', tabId:'brakbrak', keypadOps:['/','='], mellanled:true,
  grupper:[{rubrik:'Beräkna', rader: unika(gBrakBrakRad, 5, 1)}] }; }
function GEN_BRAKBRAK_N2(){ return GEN_BRAKBRAK_N1(); }

// D. Stora tal (förkorta korsvis innan beräkning)
/* Talen (Joachim 2026-10-25, som d3:s förkortning): båda bråken i enklaste form, och svaret i enklaste form
   med nämnare 3–10. Faktorerna 2–6; i den svårare gruppen 4, 6, 8, 9 eller 12. Förr 1/2 · 2/5 (nämnaren 2),
   5/18 · 6/15 (6/15 inte i enklaste form), 21/32 · 8/7 och 26/45 · 9/13 (faktorerna 7 och 13). */
function GRUND_STORATAL_N1(){
  return { titel:'Stora tal – blad 1', tabId:'storatal', keypadOps:['/','='], mellanled:true,
    grupper:[
      {rubrik:'Beräkna – förkorta korsvis innan beräkning', mellanled:'kravt', niva:1, rader:[
        radKors(3,4,2,9), radKors(3,5,1,6), radKors(2,3,9,10)
      ]},
      {rubrik:'Beräkna – förkorta korsvis innan beräkning (svårare)', mellanled:'kravt', niva:2, rader:[
        radKors(8,45,9,16), radKors(20,9,9,28), radKors(7,12,12,5)
      ]}
    ]};
}
function GRUND_STORATAL_N2(){
  return { titel:'Stora tal – blad 2 (tre bråk)', tabId:'storatal', keypadOps:['/','='], mellanled:true,
    grupper:[
      {rubrik:'Beräkna – ta bort ett mellanled', rader:[
        radTreBrak(3,8,4,5,1,6), radTreBrak(5,18,6,7,14,25), radTreBrak(11,4,9,33,16,5), radTreBrak(15,8,2,3,14,9)
      ]}
    ]};
}
// Generator blad 1: två bråk i enklaste form som förkortas korsvis. t1 = a·g1 mot n2 = d·g1, t2 = b·g2 mot
// n1 = c·g2; svaret (a·b)/(c·d) i enklaste form med nämnare 3–10, faktorerna 2–6 (g1 får vara 1).
function gStoraRad(){
  for(var i=0;i<400;i++){
    var g1=gPick([1,2,3,4,5,6]), g2=gPick([2,3,4,5,6]), a=gRand(1,5), b=gRand(1,5), c=gRand(1,10), d=gRand(1,10);
    if(c*d < 3 || c*d > 10) continue;
    var t1=a*g1, n1=c*g2, t2=b*g2, n2=d*g1;
    if(gcd(t1,n1)!==1 || gcd(t2,n2)!==1 || gcd(t1,n2)!==g1 || gcd(t2,n1)!==g2 || gcd(a*b,c*d)!==1) continue;
    if(t1+'/'+n1 === t2+'/'+n2) continue;
    return radKors(t1, n1, t2, n2);
  }
  return radKors(3,4,2,9);   // reserv
}
// Generator blad 2: tre bråk där faktorer återkommer korsvis (förkortning lönar sig)
function gStoraTreRad(){
  for(var i=0;i<80;i++){
    var a=gPick([2,3,4,5]), b=gPick([2,3,5,7]), c=gPick([2,3,4,5]), d=gPick([3,5,7]);
    var t1=gPick([1,2,3,4])*b, n1=a*c;
    var t2=a*gPick([1,2,3]), n2=b*d;
    var t3=d*gPick([1,2]), n3=c*gPick([2,3,4]);
    var fr=[t1+'/'+n1, t2+'/'+n2, t3+'/'+n3];
    // alla tre bråk i raden ska vara olika
    if(fr[0]!==fr[1] && fr[1]!==fr[2] && fr[0]!==fr[2]) return radTreBrak(t1,n1,t2,n2,t3,n3);
  }
  return radTreBrak(3,8,4,5,1,6);
}
function GEN_STORATAL_N1(){ return { titel:'Stora tal – nytt blad', tabId:'storatal', keypadOps:['/','='], mellanled:true,
  grupper:[{rubrik:'Beräkna – förkorta korsvis innan beräkning', mellanled:'kravt', niva:1, rader: unika(gStoraRad, 4, 1)}] }; }
function GEN_STORATAL_N2(){ return { titel:'Stora tal – nytt blad (tre bråk)', tabId:'storatal', keypadOps:['/','='], mellanled:true,
  grupper:[{rubrik:'Beräkna – ta bort ett mellanled', rader: unika(gStoraTreRad, 4, 1)}] }; }

// E. Blandad form × blandad form
function GRUND_MBLANDAD_N1(){
  return { titel:'Multiplikation med blandad form', tabId:'blandad', keypadOps:['/','='],
    grupper:[
      {rubrik:'Multiplicera tal i blandad form', rader:[
        radBlandGanger(3,4,7,2,4,5), radBlandGanger(1,1,2,2,1,3), radBlandGanger(2,1,4,1,2,3), radBlandGanger(1,3,5,3,1,2)
      ]}
    ]};
}
function GRUND_MBLANDAD_N2(){
  return { titel:'Multiplikation med blandad form – svårare', tabId:'blandad', keypadOps:['/','='],
    grupper:[
      {rubrik:'Multiplicera tal i blandad form', rader:[
        radBlandGanger(2,5,6,3,3,4), radBlandGanger(4,1,3,2,2,5), radBlandGanger(3,2,7,1,3,4), radBlandGanger(2,3,8,4,1,2)
      ]}
    ]};
}
function gMBlandRad(){ return radBlandGanger(gRand(1,4), gRand(1,5), gPick([2,3,4,5,6,7]), gRand(1,3), gRand(1,4), gPick([2,3,4,5])); }
function GEN_MBLANDAD_N1(){ return { titel:'Blandad form × blandad form – nytt blad', tabId:'blandad', keypadOps:['/','='],
  grupper:[{rubrik:'Multiplicera tal i blandad form', rader: unika(gMBlandRad, 4, 1)}] }; }
function GEN_MBLANDAD_N2(){ return GEN_MBLANDAD_N1(); }

// ============================================================
//  GRINDAR / LÅS  (sparas i localStorage)
// ============================================================
var PRAKTIKFLIKAR = ['heltal','brakbrak','storatal','blandad'];
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

function markeraKlar(tabId){ lsSet('brak6_klar_' + tabId, '1'); uppdateraLas(); }
function godkannTest(){ lsSet('brak6_test_godkand', '1'); uppdateraLas(); }

function setLas(tabId, locked){
  var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  if(btn) btn.classList.toggle('is-locked', locked);
  var lasBox = document.getElementById('las-' + tabId);
  var innehall = document.getElementById(tabId + '-innehall');
  if(lasBox) lasBox.style.display = locked ? '' : 'none';
  if(innehall) innehall.style.display = locked ? 'none' : '';
}
function uppdateraLas(){
  var allaKlara = PRAKTIKFLIKAR.every(function(id){ return lsGet('brak6_klar_' + id) === '1'; });
  setLas('test', !allaKlara);
}

// ============================================================
//  ORKESTRERING
// ============================================================
var GENERATORER = {
  heltal:   { nivaer: { 1: { grund: GRUND_HELTAL_N1,   gen: GEN_HELTAL_N1 },   2: { grund: GRUND_HELTAL_N2,   gen: GEN_HELTAL_N2 } } },
  brakbrak: { nivaer: { 1: { grund: GRUND_BRAKBRAK_N1, gen: GEN_BRAKBRAK_N1 }, 2: { grund: GRUND_BRAKBRAK_N2, gen: GEN_BRAKBRAK_N2 } } },
  storatal: { nivaer: { 1: { grund: GRUND_STORATAL_N1, gen: GEN_STORATAL_N1 }, 2: { grund: GRUND_STORATAL_N2, gen: GEN_STORATAL_N2 } } },
  blandad:  { nivaer: { 1: { grund: GRUND_MBLANDAD_N1, gen: GEN_MBLANDAD_N1 }, 2: { grund: GRUND_MBLANDAD_N2, gen: GEN_MBLANDAD_N2 } } }
};
function harBesokt(id){ return lsGet('brak6_besokt_' + id) === '1'; }
function markeraBesokt(id){ lsSet('brak6_besokt_' + id, '1'); }
function aktuellNiva(tabId){ return lsGet('brak6_niva_' + tabId) === '2' ? 2 : 1; }
function byggNiva(tabId, niva){ lsSet('brak6_niva_' + tabId, String(niva)); byggSheet(tabId, true, niva); }

function byggSheet(sheetId, forstaBesoket, niva){
  var rotEl = document.getElementById('sheet-' + sheetId);
  if(!rotEl) return;
  var def = GENERATORER[sheetId];
  if(!def) return;
  var blad;
  if(def.nivaer){
    var n = niva || aktuellNiva(sheetId);
    var ld = def.nivaer[n];
    // forstaBesoket = true  →  alltid Joachims grundblad för den nivån
    // forstaBesoket = false →  slumpat blad ("nytt blad med andra tal")
    if(forstaBesoket){ blad = ld.grund(); }
    else { blad = ld.gen(); }
    blad.niva = n;
    blad.tvaNivaer = true;
    blad.nivaAntal = Object.keys(def.nivaer).length;   // antalet steg är DATA, inte två hårdkodade knappar
    blad.niva2Upplast = (lsGet('brak6_naddNiva2_' + sheetId) === '1') || (n === 2);
  } else {
    if(forstaBesoket){ blad = def.grund(); }
    else { blad = def.gen(); }
  }
  blad.tabId = sheetId;
  blad.kanGenerera = true;
  bygg_blad(rotEl, blad);
  fyllFacitData(rotEl, blad);
}

// Flikväxling (låsta flikar reagerar inte)
var tabRow = document.getElementById('tab-row');
// Modulen laddas även i testramen (talbanken) där flikraden inte finns → vakt i stället för krasch.
if(tabRow) tabRow.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    if(btn.classList.contains('is-locked')) return;
    var id = btn.dataset.tab;
    tabRow.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.toggle('is-active', b === btn); });
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.toggle('is-active', p.dataset.panel === id); });
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

uppdateraLas();
byggSheet('heltal', true);
byggSheet('brakbrak', true);
byggSheet('storatal', true);
byggSheet('blandad', true);

// ══ TALBANK — se blad-k2-d5.js. Multiplikationens öva-tal blir testets tal. ════════════════════
window.BLAD_K2_D6 = (function(){
  var bank = {};
  function lagg(nod, post){ (bank[nod] = bank[nod] || []).push(post); }
  [GRUND_HELTAL_N1, GRUND_HELTAL_N2, GRUND_BRAKBRAK_N1, GRUND_BRAKBRAK_N2, GRUND_STORATAL_N1, GRUND_STORATAL_N2, GRUND_MBLANDAD_N1, GRUND_MBLANDAD_N2].forEach(function(bygg){
    var blad; try { blad = bygg(); } catch(e){ return; }
    (blad.grupper || []).forEach(function(g){
      (g.rader || []).forEach(function(r){
        if(r.typ === 'mulHeltal') lagg('brak-mult-rakna:rakna', { slag:'hb', h:r.h, t:r.t, n:r.n });
        else if(r.typ === 'mulAndel') lagg('brak-mult-rakna:rakna', { slag:'andel', t:r.t, n:r.n, N:r.N });
        else if(r.typ === 'mulBrak' || r.typ === 'mulKors') lagg('brak-mult-forkorta:rakna', { slag:'bb', t1:r.t1, n1:r.n1, t2:r.t2, n2:r.n2 });
        else if(r.opnd) lagg('brak-mult-rakna:rakna', r.opnd);
      });
    });
  });
  return { talBank: function(nod){ return (bank[String(nod)] || []).slice(); } };
})();
