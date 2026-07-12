/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k2-d5-addsub-brak.html
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

// Bråk som värde-objekt vid räkning
function frVarde(t1, n1, op, t2, n2){
  if(op === '+') return {t: t1 * n2 + t2 * n1, n: n1 * n2};
  return {t: t1 * n2 - t2 * n1, n: n1 * n2};
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
// Räkneuttryck med svar i bråkform (svar alltid i enklaste form)
function radBerakna(t1, n1, op, t2, n2){
  var v = frVarde(t1, n1, op, t2, n2);
  var rad = {typ:'brakSvar', vanster: fracSpan(t1,n1) + opSpan(op) + fracSpan(t2,n2),
          likhet:true, svar: kanonisk(v.t, v.n), olikaNamn: (n1 !== n2)};
  if(n1 !== n2){
    // Steg-data för femledad uppställning (förläng → samma nämnare → lägg ihop → svar)
    var L = n1 * n2 / gcd(n1, n2);   // minsta gemensamma nämnare
    var f1 = L / n1, f2 = L / n2;     // förlängningsfaktorer
    var nt1 = t1 * f1, nt2 = t2 * f2; // nya täljare
    var komb = (op === '+') ? (nt1 + nt2) : (nt1 - nt2);
    rad.steg = {
      t1:t1, n1:n1, op:op, t2:t2, n2:n2,
      f1:f1, f2:f2,                       // förläng: (t1·f1)/(n1·f1)
      L:L, nt1:nt1, nt2:nt2,              // samma nämnare: nt1/L op nt2/L
      kombT:komb, kombN:L,                // lägg ihop: komb/L
      svar: kanonisk(komb, L)            // svar (enklaste/blandad form)
    };
  }
  return rad;
}

// ── Blandad form: heltal + bråk ──
// radBland(h1,t1,n1, op, h2,t2,n2): visar två tal i blandad form, svar i enklaste blandad form.
function blandSpan(h, t, n){
  if(t === 0) return '<span class="ovn-text ovn-num">' + h + '</span>';
  var fore = h ? '<span class="ovn-text ovn-num" style="margin-right:5px;">' + h + '</span>' : '';
  return fore + fracSpan(t, n);
}
function radBland(h1, t1, n1, op, h2, t2, n2){
  // exakt värde
  var T1 = h1 * n1 + t1, T2 = h2 * n2 + t2;
  var v = frVarde(T1, n1, op, T2, n2);
  return {typ:'brakSvar',
    vanster: blandSpan(h1,t1,n1) + opSpan(op) + blandSpan(h2,t2,n2),
    likhet:true, svar: kanonisk(v.t, v.n), olikaNamn: (n1 !== n2)};
}
// Blandad form via decimalform: visar talen, eleven svarar med ETT decimaltal.
// termer: [{h,t,n}, {op,h,t,n}, ...]  dec = facit som decimaltal
function radBlandDec(termer){
  var val = termer[0].h + termer[0].t / termer[0].n;
  var visa = blandSpan(termer[0].h, termer[0].t, termer[0].n);
  for(var i = 1; i < termer.length; i++){
    visa += opSpan(termer[i].op) + blandSpan(termer[i].h, termer[i].t, termer[i].n);
    val += (termer[i].op === '+' ? 1 : -1) * (termer[i].h + termer[i].t / termer[i].n);
  }
  var dec = Math.round(val * 1e6) / 1e6;
  return {typ:'brakDecimal', vanster: visa, svarDec: dec};
}

// Flerterms-uttryck (2 eller 3 termer), svar i enklaste form.
function radTermer(termer){
  var t = termer[0].t, n = termer[0].n;
  var vanster = fracSpan(t, n);
  var olika = false;
  for(var i = 1; i < termer.length; i++){
    vanster += opSpan(termer[i].op) + fracSpan(termer[i].t, termer[i].n);
    if(termer[i].n !== termer[0].n) olika = true;
    var v = frVarde(t, n, termer[i].op, termer[i].t, termer[i].n);
    t = v.t; n = v.n;
  }
  var rad = {typ:'brakSvar', vanster: vanster, likhet:true, svar: kanonisk(t, n), olikaNamn: olika};
  // Femledad uppställning bara för tvåtermsuttryck med olika nämnare
  if(termer.length === 2 && termer[0].n !== termer[1].n){
    var t1=termer[0].t, n1=termer[0].n, op=termer[1].op, t2=termer[1].t, n2=termer[1].n;
    var L = n1 * n2 / gcd(n1, n2);
    var f1 = L / n1, f2 = L / n2, nt1 = t1*f1, nt2 = t2*f2;
    var komb = (op === '+') ? (nt1 + nt2) : (nt1 - nt2);
    rad.steg = {t1:t1,n1:n1,op:op,t2:t2,n2:n2,f1:f1,f2:f2,L:L,nt1:nt1,nt2:nt2,kombT:komb,kombN:L,svar:kanonisk(komb,L)};
  }
  return rad;
}
// Vilket tal saknas (lucka i en täljare). Heltalssvar = x.
function radSaknad(t1, n1, op, nLucka, x){
  var v = frVarde(t1, n1, op, x, nLucka);
  var res = kanonisk(v.t, v.n);
  var luckBrak = '<span class="ovn-brak"><span class="ovn-brak-taljare">@IN@</span>'
    + '<span class="ovn-brak-strecket"></span>'
    + '<span class="ovn-brak-namnare">' + nLucka + '</span></span>';
  var html = fracSpan(t1,n1) + opSpan(op) + luckBrak
    + '<span class="ovn-text" style="margin:0 6px;">=</span>' + mixedSpan(res);
  return {typ:'brakSaknad', html: html, svar: x};
}
// "Vilket tal ska adderas med base för att summan ska bli target?"  svar = target - base
function radFragaAdd(bt, bn, tgt){
  var ans = frVarde(tgt.t, tgt.n, '-', bt, bn);
  var fraga = 'Vilket tal ska adderas med ' + fracSpan(bt,bn)
    + ' för att summan ska bli ' + mixedSpan(kanonisk(tgt.t, tgt.n)) + ' ?';
  return {typ:'brakSvar', fraga:true, vanster: fraga, svar: kanonisk(ans.t, ans.n)};
}
// "Vilket tal ska subtraheras med base för att differensen ska bli target?"  n - base = target -> n = target + base
function radFragaSub(bt, bn, tgt){
  var ans = frVarde(tgt.t, tgt.n, '+', bt, bn);
  var fraga = 'Vilket tal ska subtraheras med ' + fracSpan(bt,bn)
    + ' för att differensen ska bli ' + mixedSpan(kanonisk(tgt.t, tgt.n)) + ' ?';
  return {typ:'brakSvar', fraga:true, vanster: fraga, svar: kanonisk(ans.t, ans.n)};
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
  var s = String(a).replace(/\s/g,'').replace(',', '.');
  if(s === '') return false;
  var n = parseFloat(s);
  if(isNaN(n)) return false;
  return Math.abs(n - b) < 1e-9;
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
    + (blad.intro ? '<p class="ovn-intro">' + blad.intro + '</p>' : '');

  if(blad.tvaNivaer){
    var l2 = !blad.niva2Upplast;
    html += '<div class="niva-rad">'
      + '<button type="button" class="niva-btn' + (blad.niva===1?' is-active':'') + '" data-niva="1">Nivå 1</button>'
      + '<button type="button" class="niva-btn' + (blad.niva===2?' is-active':'') + (l2?' is-locked':'') + '" data-niva="2"' + (l2?' disabled':'') + '>Nivå 2' + (l2?' 🔒':'') + '</button>'
      + '</div>';
  }

  html += '<div class="brak-hint"><strong>Tänk på:</strong> svara alltid i <strong>enklaste form</strong>. '
    + (blad.mellanled ? 'Visa hur du räknar i uträkningsrutan – t.ex. hur du förlänger – innan du skriver svaret. ' : '')
    + 'Är svaret i blandad form (större än 1) finns en liten ruta till vänster för heltalet.</div>';

  blad.grupper.forEach(function(grupp, gi){
    html += '<div class="ovn-grupp">';
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

      if(rad.typ === 'brakDecimal'){
        // Blandad form via decimalform – eleven svarar med ett decimaltal
        html += '<div class="ovn-brak-rad brak-dec-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += rad.vanster;
        html += '<span class="ovn-text" style="margin:0 4px;">=</span>';
        html += '<input class="ovn-in brak-dec-in" data-svar="' + rad.svarDec + '" inputmode="decimal" autocomplete="off" placeholder="decimaltal" style="width:110px;">';
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
        html += '<textarea class="prob-kladd" rows="3" placeholder="Skriv din uträkning här (rättas inte)"></textarea>';
        html += '<div class="prob-svar-rad"><span class="prob-label">Svar:</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar + '" inputmode="decimal" autocomplete="off" placeholder="tal">';
        if(rad.enhet) html += '<input class="ovn-in enhet" data-enhet="' + rad.enhet + '" inputmode="text" autocomplete="off" placeholder="enhet">';
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
  html += '<div class="ovn-keypad" data-keypad>';
  html += '<div class="ovn-keypad-digits">';
  ['7','8','9','4','5','6','1','2','3'].forEach(function(d){
    html += '<button type="button" class="ovn-kp-key" data-key="' + d + '">' + d + '</button>';
  });
  html += '<button type="button" class="ovn-kp-key span2" data-key="0">0</button>';
  html += '<button type="button" class="ovn-kp-key util" data-key="back">\u232B</button>';
  html += '</div>';
  if(blad.keypadOps && blad.keypadOps.length){
    html += '<div class="ovn-keypad-ops">';
    blad.keypadOps.forEach(function(o){
      html += '<button type="button" class="ovn-kp-key op" data-key="' + o + '">' + o + '</button>';
    });
    html += '</div>';
  }
  html += '</div>';

  html += '<div class="ovn-kontroll-rad">'
    + '<button type="button" class="ovn-kontroll" data-action="kontroll">Kontrollera</button>'
    + '<button type="button" class="ovn-aterstall" data-action="reset">Återställ</button>'
    + (blad.kanGenerera ? '<button type="button" class="ovn-aterstall" data-action="nytt-blad">↻ Nytt blad med andra tal</button>' : '')
    + '</div>';
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
    inp.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); if(i + 1 < inputs.length) inputs[i+1].focus(); }
    });
    inp.addEventListener('input', function(){
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
  rotEl.querySelectorAll('.ovn-kp-key').forEach(function(btn){
    btn.addEventListener('mousedown', function(e){
      e.preventDefault();
      var k = btn.dataset.key;
      var aktiv = document.activeElement;
      if(!aktiv || !aktiv.classList || !aktiv.classList.contains('ovn-in')){
        if(inputs.length === 0) return;
        aktiv = inputs[fokus] || inputs[0];
        aktiv.focus();
      }
      if(k === 'back') aktiv.value = aktiv.value.slice(0, -1);
      else aktiv.value += k;
      aktiv.dispatchEvent(new Event('input', {bubbles:true}));
      aktiv.focus();
    });
  });

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
      // Steg-celler (femledad uppställning): rätta och färglägg, men utan inline-markörer
      if(inp.classList.contains('brak-steg-cell')){
        inp.classList.remove('correct','wrong','just-checked');
        var okS = jamforTal(inp.value, parseFloat(inp.dataset.svar));
        totalt++;
        if(okS){ ratt++; inp.classList.add('correct','just-checked'); }
        else { inp.classList.add('wrong','just-checked'); }
        setTimeout(function(){ inp.classList.remove('just-checked'); }, 500);
        return;
      }
      var rad = inp.closest('.ovn-rad, .ovn-brak-rad, .prob-rad') || inp.parentElement;
      rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
      inp.classList.remove('correct','wrong','just-checked');
      var ok;
      if(inp.dataset.enhet) ok = (String(inp.value).toLowerCase().replace(/[\s.]/g,'') === String(inp.dataset.enhet).toLowerCase().replace(/[\s.]/g,''));
      else ok = jamforTal(inp.value, parseFloat(inp.dataset.svar));
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

      var cH = parseInt(row.dataset.hel, 10);
      var cT = parseInt(row.dataset.t, 10);
      var cN = parseInt(row.dataset.n, 10);
      var fyll = function(el){ return el ? (el.value || '').trim() : ''; };
      var lika = function(el, v){ return el && fyll(el) !== '' && parseInt(el.value, 10) === v; };
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
        boxar.forEach(function(b){ b.classList.add('correct','just-checked'); });
        ankare.insertAdjacentElement('afterend', mk);
      } else {
        boxar.forEach(function(b){ b.classList.add('wrong','just-checked'); });
        ankare.insertAdjacentElement('afterend', mk);
        var f = document.createElement('span'); f.className = 'ovn-fasit';
        f.textContent = 'rätt svar: ' + row.dataset.facit;
        mk.insertAdjacentElement('afterend', f);
      }
      setTimeout(function(){ boxar.forEach(function(b){ b.classList.remove('just-checked'); }); }, 500);
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
    if(blad.tvaNivaer && blad.niva === 1 && (totalt - ratt) <= 2 && totalt > 0){
      lsSet('brak5_naddNiva2_' + blad.tabId, '1');
      var rad2 = document.createElement('div'); rad2.className = 'niva-vidare';
      var knapp2 = document.createElement('button');
      knapp2.type = 'button'; knapp2.className = 'ovn-kontroll';
      knapp2.textContent = (ratt === totalt) ? 'Snyggt! Gå vidare till nivå 2 →' : 'Bra jobbat — du får gå vidare till nivå 2 →';
      knapp2.addEventListener('click', function(){ byggNiva(blad.tabId, 2); });
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
  if(inputs[0]) inputs[0].focus();
}

// fyll varje bråksvarsrad med facit-data efter rendering
function fyllFacitData(rotEl, blad){
  var rader = rotEl.querySelectorAll('.brak-svar-rad, .brak-fragerad');
  var fasitLista = [];
  blad.grupper.forEach(function(g){ g.rader.forEach(function(r){ if(r.typ === 'brakSvar') fasitLista.push(r.svar); }); });
  rader.forEach(function(row, i){
    var s = fasitLista[i];
    if(!s) return;
    row.dataset.hel = s.hel; row.dataset.t = s.t; row.dataset.n = s.n;
    row.dataset.facit = mixedText(s);
  });
}

// ============================================================
//  STENCIL (grundblad) – Joachims original, 2c rättad (1 1/5)
// ============================================================
function GRUND_FORLANG1(){
  return {
    titel: 'Addition och subtraktion med bråk – Stencil 1',
    intro: 'Räkna ut talen och skriv svaret i enklaste form. Tryck på Kontrollera när du är klar.',
    tabId: 'forlang1',
    kanGenerera: true,
    mellanled: true,
    keypadOps: ['+','−','/','='],
    grupper: [
      {rubrik:'Beräkna', rader:[
        radBerakna(2,6,'+',3,6),
        radBerakna(3,4,'-',1,4),
        radBerakna(1,5,'+',2,5),
        radBerakna(7,9,'-',3,9)
      ]},
      {rubrik:'Beräkna – svara i enklaste form', rader:[
        radBerakna(3,10,'+',2,10),
        radBerakna(5,6,'-',1,6),
        radBerakna(4,5,'+',2,5),
        radBerakna(7,9,'+',8,9)
      ]},
      {rubrik:'Beräkna – förläng en nämnare', rader:[
        radBerakna(1,2,'+',3,4),
        radBerakna(5,12,'-',1,4),
        radBerakna(4,10,'+',2,5),
        radBerakna(7,9,'-',1,3)
      ]},
      {rubrik:'Vilket tal saknas för att likheten ska stämma?', rader:[
        radSaknad(3,10,'+',10,4),
        radSaknad(3,4,'+',8,3),
        radSaknad(3,7,'+',14,7)
      ]},
      {rubrik:'Vilket tal ska adderas?', rader:[
        radFragaAdd(3,4,{t:5,n:4}),
        radFragaAdd(3,4,{t:9,n:8}),
        radFragaAdd(3,4,{t:25,n:12})
      ]},
      {rubrik:'Vilket tal ska subtraheras?', rader:[
        radFragaSub(3,4,{t:5,n:4}),
        radFragaSub(3,4,{t:9,n:8}),
        radFragaSub(3,4,{t:25,n:12})
      ]}
    ]
  };
}

// ============================================================
//  GENERATOR – nya likvärdiga uppgifter (svar beräknas, aldrig fel facit)
// ============================================================
function genG1(){ // samma nämnare, äkta bråk (svar < 1)
  var n = gPick([4,5,6,8,9,10,12]);
  var op = gPick(['+','-']);
  var a, b;
  if(op === '+'){ a = gRand(1, n-2); b = gRand(1, n-1-a); }
  else { a = gRand(2, n-1); b = gRand(1, a-1); }
  return radBerakna(a, n, op, b, n);
}
function genG2(){ // samma nämnare, kan bli oäkta -> blandad form
  var n = gPick([5,6,8,9,10,12]);
  var op = gPick(['+','+','-']);
  var a, b;
  if(op === '+'){ a = gRand(2, n-1); b = gRand(2, n-1); }
  else { a = gRand(2, n-1); b = gRand(1, a-1); }
  return radBerakna(a, n, op, b, n);
}
var FORLANG_PAR = [[2,4],[2,6],[2,8],[3,6],[3,9],[4,8],[4,12],[5,10],[6,12]];
function genG3(){ // förläng EN nämnare (den ena delar den andra)
  var par = gPick(FORLANG_PAR);
  var liten = par[0], stor = par[1];
  var op = gPick(['+','-']);
  var tStor = gRand(1, stor-1);
  var tLiten = gRand(1, liten-1);
  if(op === '+'){
    // se till att summan inte blir orimligt stor men tillåt oäkta ibland
    return gPick([true,false])
      ? radBerakna(tLiten, liten, '+', tStor, stor)
      : radBerakna(tStor, stor, '+', tLiten, liten);
  } else {
    // större bråk minus mindre -> positivt
    var stortVarde = tStor / stor, litetVarde = tLiten / liten;
    if(stortVarde >= litetVarde) return radBerakna(tStor, stor, '-', tLiten, liten);
    return radBerakna(tLiten, liten, '-', tStor, stor);
  }
}
function genG4(){ // vilket tal saknas (heltalssvar)
  var par = gPick([[10,10],[8,8],[12,12]].concat(FORLANG_PAR));
  var n1 = par[1], nLucka = par[0] === par[1] ? par[1] : par[1]; // håll resultatets nämnare = större
  // bygg så att resultatet blir snyggt positivt
  var nL = par[0] <= par[1] ? par[0] : par[1];
  var nR = par[0] <= par[1] ? par[1] : par[0];
  var t1 = gRand(1, nL-1);
  var x = gRand(1, Math.max(1, nR-1));
  return radSaknad(t1, nL, '+', nR, x);
}
function genG5(){ // adderas med base
  var base = gPick([[3,4],[1,2],[1,4],[2,3],[1,3],[5,6]]);
  var ansT = gRand(1, 5), ansN = gPick([2,3,4,6,8,12]);
  var tgt = frVarde(base[0], base[1], '+', ansT, ansN);
  return radFragaAdd(base[0], base[1], {t: tgt.t, n: tgt.n});
}
function genG6(){ // subtraheras med base
  var base = gPick([[3,4],[1,2],[1,4],[2,3],[1,3],[5,6]]);
  var tgtT = gRand(1, 6), tgtN = gPick([2,3,4,6,8,12]);
  return radFragaSub(base[0], base[1], {t: tgtT, n: tgtN});
}
// Generera flera uppgifter men undvik att samma svar upprepas för ofta.
// genFn() -> rad med rad.svar = {hel,t,n}. maxLika = hur många gånger ett svar får återkomma.
function unika(genFn, antal, maxLika){
  maxLika = maxLika || 1;
  var rader = [], rakning = {}, forsok = 0;
  while(rader.length < antal && forsok < 200){
    forsok++;
    var r = genFn();
    var nyckel = r.svar ? mixedText(r.svar) : ('r' + rader.length);
    if((rakning[nyckel] || 0) >= maxLika) continue;
    rakning[nyckel] = (rakning[nyckel] || 0) + 1;
    rader.push(r);
  }
  while(rader.length < antal) rader.push(genFn()); // säkerhetsnät
  return rader;
}
function GEN_FORLANG1(){
  return {
    titel: 'Addition och subtraktion med bråk – nytt blad',
    intro: 'Nya tal, samma metoder. Skriv svaren i enklaste form.',
    tabId: 'forlang1',
    kanGenerera: true,
    mellanled: true,
    keypadOps: ['+','−','/','='],
    grupper: [
      {rubrik:'Beräkna', rader: unika(genG1, 4, 1)},
      {rubrik:'Beräkna – svara i enklaste form', rader: unika(genG2, 4, 1)},
      {rubrik:'Beräkna – förläng en nämnare', rader: unika(genG3, 4, 1)},
      {rubrik:'Vilket tal saknas för att likheten ska stämma?', rader: unika(genG4, 3, 2)},
      {rubrik:'Vilket tal ska adderas?', rader: unika(genG5, 3, 1)},
      {rubrik:'Vilket tal ska subtraheras?', rader: unika(genG6, 3, 1)}
    ]
  };
}

// ============================================================
//  FLIK 2 · FÖRLÄNG BÅDA NÄMNARNA  (två nivåer)
// ============================================================
function F(t,n){ return {t:t, n:n}; }
function T(op,t,n){ return {op:op, t:t, n:n}; }

// Stencil – nivå 1
function GRUND_FORLANG2_N1(){
  return {
    titel: 'Förläng båda nämnarna – nivå 1',
    intro: 'Förläng båda bråken till samma nämnare innan du räknar. Svara i enklaste form.',
    mellanled: true,
    grupper: [
      {rubrik:'Beräkna med bråk', rader:[
        radTermer([F(3,4),T('+',1,3)]),
        radTermer([F(3,5),T('+',1,2)]),
        radTermer([F(2,3),T('-',1,2)]),
        radTermer([F(3,4),T('-',2,5)])
      ]},
      {rubrik:'Beräkna med bråk', rader:[
        radTermer([F(3,4),T('+',5,6)]),
        radTermer([F(5,8),T('+',3,5)]),
        radTermer([F(7,9),T('-',3,5)]),
        radTermer([F(7,8),T('-',5,6)])
      ]}
    ]
  };
}
// Stencil – nivå 2
function GRUND_FORLANG2_N2(){
  return {
    titel: 'Förläng båda nämnarna – nivå 2',
    intro: 'Svårare nämnare och uppgifter med tre termer. Räkna ett steg i taget och svara i enklaste form.',
    mellanled: true,
    grupper: [
      {rubrik:'Beräkna med bråk', rader:[
        radTermer([F(4,9),T('+',5,6)]),
        radTermer([F(2,9),T('+',10,11)]),
        radTermer([F(3,8),T('+',1,9)])
      ]},
      {rubrik:'Beräkna med bråk', rader:[
        radTermer([F(1,4),T('+',1,3),T('+',1,2)]),
        radTermer([F(2,3),T('+',3,4),T('+',1,6)]),
        radTermer([F(3,7),T('+',3,4),T('-',1,2)]),
        radTermer([F(3,5),T('-',5,6),T('+',7,10)])
      ]}
    ]
  };
}

// Par där NÅGON täljare INTE delar den andra (kräver att båda förlängs)
var PAR_FB    = [[3,4],[2,5],[2,3],[4,5],[4,6],[5,8],[5,6],[3,8],[3,10],[6,8],[3,5],[5,9]];
var PAR_FB_S  = [[9,6],[9,11],[8,9],[7,8],[7,9],[5,8],[7,10],[8,11],[9,10],[7,12],[5,12],[8,6]];

function genTvaTerm(pool){
  var par = gPick(pool);
  var d1 = par[0], d2 = par[1];
  var t1 = gRand(1, d1-1), t2 = gRand(1, d2-1);
  var op = gPick(['+','-']);
  if(op === '-'){
    // se till att resultatet blir positivt
    if(t1/d1 >= t2/d2) return radTermer([F(t1,d1), T('-',t2,d2)]);
    return radTermer([F(t2,d2), T('-',t1,d1)]);
  }
  return radTermer([F(t1,d1), T('+',t2,d2)]);
}
function genTreTerm(){
  var denoms = [2,3,4,5,6,8,10,12];
  for(var a=0; a<80; a++){
    var d = [gPick(denoms), gPick(denoms), gPick(denoms)];
    if(d[0]===d[1] && d[1]===d[2]) continue;           // kräv olika nämnare
    var t = [gRand(1,d[0]-1), gRand(1,d[1]-1), gRand(1,d[2]-1)];
    var ops = [gPick(['+','-']), gPick(['+','-'])];
    var v = frVarde(t[0], d[0], ops[0], t[1], d[1]);
    v = frVarde(v.t, v.n, ops[1], t[2], d[2]);
    if(v.t <= 0) continue;                              // positivt slutsvar
    return radTermer([F(t[0],d[0]), T(ops[0],t[1],d[1]), T(ops[1],t[2],d[2])]);
  }
  return radTermer([F(1,4), T('+',1,3), T('+',1,2)]);   // reserv
}
function GEN_FORLANG2_N1(){
  return {
    titel: 'Förläng båda nämnarna – nivå 1 (nytt blad)',
    intro: 'Förläng båda bråken till samma nämnare. Svara i enklaste form.',
    mellanled: true,
    grupper: [
      {rubrik:'Beräkna med bråk', rader: unika(function(){ return genTvaTerm(PAR_FB); }, 4, 1)},
      {rubrik:'Beräkna med bråk', rader: unika(function(){ return genTvaTerm(PAR_FB); }, 4, 1)}
    ]
  };
}
function GEN_FORLANG2_N2(){
  return {
    titel: 'Förläng båda nämnarna – nivå 2 (nytt blad)',
    intro: 'Svårare nämnare och tre termer. Svara i enklaste form.',
    mellanled: true,
    grupper: [
      {rubrik:'Beräkna med bråk', rader: unika(function(){ return genTvaTerm(PAR_FB_S); }, 3, 1)},
      {rubrik:'Beräkna med bråk', rader: unika(genTreTerm, 4, 1)}
    ]
  };
}

// ============================================================
//  BLANDAD FORM – Joachims stenciler (blad 1 lätt, blad 2 svårare)
// ============================================================
function GRUND_BLANDAD_N1(){
  return {
    titel: 'Räkna med blandad form – blad 1',
    intro: 'Räkna med tal i blandad form (heltal och bråk). Skriv svaret i enklaste blandad form. Är svaret större än 1 finns en ruta för heltalet.',
    tabId: 'blandad', mellanled: true, keypadOps: ['+','−','/','='],
    grupper: [
      {rubrik:'Räkna med blandad form', rader:[
        radBland(1,3,4,'+',1,2,4),   // 1 3/4 + 1 2/4 = 3 1/4
        radBland(4,3,5,'-',2,1,5),   // 4 3/5 - 2 1/5 = 2 2/5
        radBland(4,2,5,'+',3,2,3),   // 4 2/5 + 3 2/3 = 8 1/15
        radBland(4,3,4,'-',1,1,6)    // 4 3/4 - 1 1/6 = 3 7/12
      ]},
      {rubrik:'Räkna med blandad form genom att göra om till decimalform', rader:[
        radBlandDec([{h:2,t:3,n:4},{op:'-',h:1,t:3,n:10}]),   // 1,45
        radBlandDec([{h:3,t:7,n:10},{op:'+',h:1,t:3,n:5}]),   // 5,3
        radBlandDec([{h:0,t:1,n:2},{op:'+',h:0,t:3,n:4},{op:'+',h:2,t:3,n:10}]) // 3,55
      ]}
    ]
  };
}
function GRUND_BLANDAD_N2(){
  return {
    titel: 'Räkna med blandad form – blad 2',
    intro: 'Svårare uppgifter. Ibland behöver du växla (låna) från heltalet. Skriv svaret i enklaste form.',
    tabId: 'blandad', mellanled: true, keypadOps: ['+','−','/','='],
    grupper: [
      {rubrik:'Räkna med blandad form', rader:[
        radBland(5,1,7,'-',2,6,7),   // 2 2/7
        radBland(4,1,12,'-',1,3,4),  // 2 1/3
        radBland(3,1,3,'-',0,1,2)    // 2 5/6
      ]},
      {rubrik:'Beräkna med decimaltal', rader:[
        radBlandDec([{h:5,t:23,n:100},{op:'-',h:3,t:9,n:10}]),            // 1,33
        radBlandDec([{h:0,t:2,n:5},{op:'+',h:1,t:1,n:4},{op:'-',h:0,t:7,n:10}]), // 0,95
        radBlandDec([{h:7,t:73,n:100},{op:'-',h:5,t:4,n:5}])             // 1,93
      ]}
    ]
  };
}
// Genererade blad i samma anda
function gBland(maxHel, namnare, tillatSub){
  var n = gPick(namnare);
  var op = tillatSub ? gPick(['+','+','-']) : '+';
  var h1 = gRand(1, maxHel), h2 = gRand(1, maxHel);
  var t1 = gRand(1, n-1), t2 = gRand(1, n-1);
  if(op === '-'){ // se till att resultatet blir positivt
    if(h1 < h2 || (h1===h2 && t1<t2)){ var H=h1,T=t1; h1=h2;t1=t2; h2=H;t2=T; }
  }
  return radBland(h1,t1,n,op,h2,t2,n);
}
function gBlandOlika(maxHel){
  var par = gPick([[2,3],[3,4],[2,5],[3,5],[4,6],[2,4]]);
  var n1 = par[0], n2 = par[1];
  var op = gPick(['+','+','-']);
  var h1 = gRand(1, maxHel), h2 = gRand(1, maxHel);
  var t1 = gRand(1, n1-1), t2 = gRand(1, n2-1);
  if(op === '-' && (h1 + t1/n1) < (h2 + t2/n2)){ var H=h1,T=t1,N=n1; h1=h2;t1=t2;n1=n2; h2=H;t2=T;n2=N; }
  return radBland(h1,t1,n1,op,h2,t2,n2);
}
function gBlandDec(specs){
  // specs: lista av tillåtna nämnare som ger fina decimaler
  var n1 = gPick([2,4,5,10]), n2 = gPick([2,4,5,10]);
  var op = gPick(['+','-']);
  var h1 = gRand(1,5), h2 = gRand(1,4), t1 = gRand(1,n1-1), t2 = gRand(1,n2-1);
  if(op === '-' && (h1+t1/n1) < (h2+t2/n2)){ var H=h1,T=t1,N=n1; h1=h2;t1=t2;n1=n2; h2=H;t2=T;n2=N; }
  return radBlandDec([{h:h1,t:t1,n:n1},{op:op,h:h2,t:t2,n:n2}]);
}
function GEN_BLANDAD_N1(){
  return {
    titel: 'Räkna med blandad form – nytt blad',
    intro: 'Nya tal, samma metod. Skriv svaret i enklaste blandad form.',
    tabId: 'blandad', mellanled: true, keypadOps: ['+','−','/','='],
    grupper: [
      {rubrik:'Räkna med blandad form (samma nämnare)', rader: unika(function(){ return gBland(5,[4,5,6,8],true); }, 4, 1)},
      {rubrik:'Räkna med blandad form (olika nämnare)', rader: unika(function(){ return gBlandOlika(5); }, 3, 1)},
      {rubrik:'Räkna genom att göra om till decimalform', rader: unika(gBlandDec, 3, 1)}
    ]
  };
}
function GEN_BLANDAD_N2(){
  return {
    titel: 'Räkna med blandad form – nytt blad (svårare)',
    intro: 'Svårare tal. Ibland behöver du växla från heltalet. Skriv svaret i enklaste form.',
    tabId: 'blandad', mellanled: true, keypadOps: ['+','−','/','='],
    grupper: [
      {rubrik:'Räkna med blandad form', rader: unika(function(){ return gBlandOlika(6); }, 4, 1)},
      {rubrik:'Beräkna med decimaltal', rader: unika(gBlandDec, 3, 1)}
    ]
  };
}

// ============================================================
//  GRINDAR / LÅS  (sparas i localStorage)
// ============================================================
var PRAKTIKFLIKAR = ['forlang1','forlang2','blandad','problem'];
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

function markeraKlar(tabId){ lsSet('brak5_klar_' + tabId, '1'); uppdateraLas(); }
function godkannTest(){ lsSet('brak5_test_godkand', '1'); uppdateraLas(); }

function setLas(tabId, locked){
  var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  if(btn) btn.classList.toggle('is-locked', locked);
  var lasBox = document.getElementById('las-' + tabId);
  var innehall = document.getElementById(tabId + '-innehall');
  if(lasBox) lasBox.style.display = locked ? '' : 'none';
  if(innehall) innehall.style.display = locked ? 'none' : '';
}
function uppdateraLas(){
  var allaKlara = PRAKTIKFLIKAR.every(function(id){ return lsGet('brak5_klar_' + id) === '1'; });
  var testGod = lsGet('brak5_test_godkand') === '1';
  setLas('test', !allaKlara);
  setLas('fordjup', !testGod);
}

// ============================================================
//  ORKESTRERING
// ============================================================
var GENERATORER = {
  forlang1: { grund: GRUND_FORLANG1, gen: GEN_FORLANG1 },
  forlang2: { nivaer: { 1: { grund: GRUND_FORLANG2_N1, gen: GEN_FORLANG2_N1 },
                        2: { grund: GRUND_FORLANG2_N2, gen: GEN_FORLANG2_N2 } } },
  blandad: { nivaer: { 1: { grund: GRUND_BLANDAD_N1, gen: GEN_BLANDAD_N1 },
                       2: { grund: GRUND_BLANDAD_N2, gen: GEN_BLANDAD_N2 } } }
};
function harBesokt(id){ return lsGet('brak5_besokt_' + id) === '1'; }
function markeraBesokt(id){ lsSet('brak5_besokt_' + id, '1'); }
function aktuellNiva(tabId){ return lsGet('brak5_niva_' + tabId) === '2' ? 2 : 1; }
function byggNiva(tabId, niva){ lsSet('brak5_niva_' + tabId, String(niva)); byggSheet(tabId, true, niva); }

function byggSheet(sheetId, forstaBesoket, niva){
  var rotEl = document.getElementById('sheet-' + sheetId);
  if(!rotEl) return;
  var def = GENERATORER[sheetId];
  if(!def) return;
  var blad;
  if(def.nivaer){
    var n = niva || aktuellNiva(sheetId);
    var ld = def.nivaer[n];
    var key = sheetId + '_n' + n;
    if(forstaBesoket && !harBesokt(key)){ blad = ld.grund(); markeraBesokt(key); }
    else { blad = ld.gen(); }
    blad.niva = n;
    blad.tvaNivaer = true;
    blad.niva2Upplast = (lsGet('brak5_naddNiva2_' + sheetId) === '1') || (n === 2);
  } else {
    if(forstaBesoket && !harBesokt(sheetId)){ blad = def.grund(); markeraBesokt(sheetId); }
    else { blad = def.gen(); }
  }
  blad.tabId = sheetId;
  blad.kanGenerera = true;
  bygg_blad(rotEl, blad);
  fyllFacitData(rotEl, blad);
}

// Flikväxling (låsta flikar reagerar inte)
var tabRow = document.getElementById('tab-row');
tabRow.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    if(btn.classList.contains('is-locked')) return;
    var id = btn.dataset.tab;
    tabRow.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.toggle('is-active', b === btn); });
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.toggle('is-active', p.dataset.panel === id); });
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

uppdateraLas();
byggSheet('forlang1', true);
byggSheet('forlang2', true);
byggSheet('blandad', true);