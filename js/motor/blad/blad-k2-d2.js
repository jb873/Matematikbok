/* ============================================================
   FAMILJ A · ARBETSSIDANS MOTOR — ak7-k2-d2-byta-form.html
   Byte-identiskt utbrutet (hela scriptet, logik orörd). Egen generation,
   ej hopslagen med blad-karna.js (drift). Laddas via <script src>.
   ============================================================ */
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
  return {typ:'brakSvar', vanster: fracSpan(t1,n1) + opSpan(op) + fracSpan(t2,n2),
          likhet:true, svar: kanonisk(v.t, v.n)};
}
// Flerterms-uttryck (2 eller 3 termer), svar i enklaste form.
// termer: [{t,n}, {op:'+'/'-', t, n}, ...]
function radTermer(termer){
  var t = termer[0].t, n = termer[0].n;
  var vanster = fracSpan(t, n);
  for(var i = 1; i < termer.length; i++){
    vanster += opSpan(termer[i].op) + fracSpan(termer[i].t, termer[i].n);
    var v = frVarde(t, n, termer[i].op, termer[i].t, termer[i].n);
    t = v.t; n = v.n;
  }
  return {typ:'brakSvar', vanster: vanster, likhet:true, svar: kanonisk(t, n)};
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

  html += '<div class="brak-hint">' + (blad.hint
    ? blad.hint
    : ('<strong>Tänk på:</strong> svara alltid i <strong>enklaste form</strong>. '
       + (blad.mellanled ? 'Visa hur du räknar i uträkningsrutan – t.ex. hur du förlänger – innan du skriver svaret. ' : '')
       + 'Är svaret i blandad form (större än 1) finns en liten ruta till vänster för heltalet.')) + '</div>';

  blad.grupper.forEach(function(grupp, gi){
    html += '<div class="ovn-grupp">';
    html += '<div class="ovn-grupp-rubrik">' + (gi+1) + '. ' + grupp.rubrik + '</div>';
    var radNummer = 0;
    grupp.rader.forEach(function(rad){
      radNummer++;
      var bokstav = String.fromCharCode(96 + radNummer);

      if(rad.typ === 'brakSvar'){
        var kladd = blad.mellanled
          ? '<input class="ovn-in bred brak-kladd" inputmode="text" autocomplete="off" placeholder="visa hur du räknar">'
          : '';
        if(rad.fraga){
          html += '<div class="brak-fragerad" data-rad="' + radNummer + '">';
          html += '<span class="ovn-label">' + bokstav + ')</span>';
          html += '<span class="brak-fragetext">' + rad.vanster + '</span>';
          if(blad.mellanled){
            html += '<span class="brak-svarlabel">Uträkning:</span>' + kladd;
          }
          html += '<span class="brak-svarlabel">Svar:</span>';
          html += svarBrakHTML(rad.svar);
          html += '</div>';
        } else {
          html += '<div class="ovn-brak-rad brak-svar-rad" data-rad="' + radNummer + '">';
          html += '<span class="ovn-label">' + bokstav + ')</span>';
          html += rad.vanster;
          html += '<span class="ovn-text" style="margin:0 4px;">=</span>';
          if(blad.mellanled){
            html += kladd + '<span class="ovn-text" style="margin:0 4px;">=</span>';
          }
          html += svarBrakHTML(rad.svar);
          html += '</div>';
        }
        return;
      }

      if(rad.typ === 'brakTillDec'){
        html += '<div class="ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += fracSpan(rad.taljare, rad.namnare);
        var tecken = (rad.not === '≈') ? '≈' : '=';
        html += '<span class="ovn-text" style="margin:0 6px;font-size:20px;">' + tecken + '</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar + '"' + (rad.rund ? ' data-rund="' + rad.rund + '"' : '') + ' inputmode="decimal" autocomplete="off">';
        html += '</div>';
        return;
      }

      if(rad.typ === 'rakna'){
        html += '<div class="ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += rad.vansterHTML;
        var teckenR = (rad.not === '≈') ? '≈' : '=';
        html += '<span class="ovn-text" style="margin:0 6px;font-size:20px;">' + teckenR + '</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar + '"' + (rad.rund ? ' data-rund="' + rad.rund + '"' : '') + ' inputmode="decimal" autocomplete="off">';
        html += '</div>';
        return;
      }

      if(rad.typ === 'brakTillBanda'){
        var k = rad.brakSvar;
        var decStr = String(rad.decSvar).replace('.', ',');
        html += '<div class="ovn-brak-rad brak-bada-rad" data-rad="' + radNummer + '"'
          + ' data-dec="' + rad.decSvar + '"'
          + ' data-hel="' + k.hel + '" data-t="' + k.t + '" data-n="' + k.n + '"'
          + ' data-facit-dec="' + decStr + '"'
          + ' data-facit-brak="' + mixedText(k) + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += fracSpan(rad.taljare, rad.namnare);
        html += '<span class="ovn-text" style="margin:0 8px;">=</span>';
        html += '<span class="bl-fall"><span class="bl-etikett">decimal</span>'
          + '<input class="ovn-in brak-bada-dec" inputmode="decimal" autocomplete="off"></span>';
        html += '<span class="ovn-text" style="margin:0 8px;">=</span>';
        html += '<span class="bl-fall"><span class="bl-etikett">blandad form</span>' + svarBrakHTML(k) + '</span>';
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
        var rad = inp.closest('.brak-svar-rad, .brak-fragerad, .blandad-rad, .brak-bada-rad');
        if(rad) rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
        if(rad) rad.querySelectorAll('.brak-cell, .brak-bada-dec').forEach(function(c){ c.classList.remove('correct','wrong'); });
      } else if(inp.classList.contains('brak-bada-dec')){
        var rad = inp.closest('.brak-bada-rad');
        if(rad) rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
        if(rad) rad.querySelectorAll('.brak-cell, .brak-bada-dec').forEach(function(c){ c.classList.remove('correct','wrong'); });
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
      if(inp.classList.contains('brak-cell') || inp.classList.contains('brak-kladd') || inp.classList.contains('brak-bada-dec')) return;
      var rad = inp.closest('.ovn-rad, .ovn-brak-rad, .prob-rad') || inp.parentElement;
      rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
      inp.classList.remove('correct','wrong','just-checked');
      var ok;
      if(inp.dataset.enhet) ok = (String(inp.value).toLowerCase().replace(/[\s.]/g,'') === String(inp.dataset.enhet).toLowerCase().replace(/[\s.]/g,''));
      else if(inp.dataset.rund){
        ok = inp.dataset.rund.split('|').some(function(v){ return jamforTal(inp.value, parseFloat(v.replace(',', '.'))); });
      }
      else ok = jamforTal(inp.value, parseFloat(inp.dataset.svar));
      totalt++;
      var mk = marker(ok);
      if(ok){ inp.classList.add('correct','just-checked'); ratt++; inp.insertAdjacentElement('afterend', mk); }
      else {
        inp.classList.add('wrong','just-checked');
        var facit = inp.dataset.enhet ? inp.dataset.enhet
          : (inp.dataset.rund ? '≈ ' + inp.dataset.rund.split('|')[0] : String(inp.dataset.svar).replace('.', ','));
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

    // 3) Båda-rader (decimal + blandad form i samma rad, rättas var för sig)
    rotEl.querySelectorAll('.brak-bada-rad').forEach(function(row){
      row.querySelectorAll('.ovn-mark, .ovn-fasit').forEach(function(x){ x.remove(); });
      var decIn = row.querySelector('.brak-bada-dec');
      var helIn = row.querySelector('.brak-hel');
      var tIn   = row.querySelector('.brak-t');
      var nIn   = row.querySelector('.brak-n');
      [decIn, helIn, tIn, nIn].filter(Boolean).forEach(function(b){ b.classList.remove('correct','wrong','just-checked'); });
      var lika = function(el, v){ return el && (el.value||'').trim()!=='' && parseInt(el.value,10)===v; };
      var cDec = parseFloat(row.dataset.dec);
      var cH   = parseInt(row.dataset.hel, 10);
      var cT   = parseInt(row.dataset.t,   10);
      var cN   = parseInt(row.dataset.n,   10);
      // Decimal
      if(decIn){
        totalt++;
        var decOk = jamforTal(decIn.value, cDec);
        if(decOk){ ratt++; decIn.classList.add('correct','just-checked'); decIn.insertAdjacentElement('afterend', marker(true)); }
        else {
          decIn.classList.add('wrong','just-checked');
          var mk1 = marker(false); decIn.insertAdjacentElement('afterend', mk1);
          var f1 = document.createElement('span'); f1.className = 'ovn-fasit';
          f1.textContent = 'rätt: ' + row.dataset.facitDec; mk1.insertAdjacentElement('afterend', f1);
        }
        setTimeout(function(){ if(decIn) decIn.classList.remove('just-checked'); }, 500);
      }
      // Blandad form
      var boxar2 = [helIn, tIn, nIn].filter(Boolean);
      if(boxar2.length){
        totalt++;
        var brakOk = lika(helIn, cH) && lika(tIn, cT) && lika(nIn, cN);
        var ankare2 = row.querySelector('.brak-svar');
        if(brakOk){ ratt++; boxar2.forEach(function(b){ b.classList.add('correct','just-checked'); }); ankare2.insertAdjacentElement('afterend', marker(true)); }
        else {
          boxar2.forEach(function(b){ b.classList.add('wrong','just-checked'); });
          var mk2 = marker(false); ankare2.insertAdjacentElement('afterend', mk2);
          var f2 = document.createElement('span'); f2.className = 'ovn-fasit';
          f2.textContent = 'rätt: ' + row.dataset.facitBrak; mk2.insertAdjacentElement('afterend', f2);
        }
        setTimeout(function(){ boxar2.forEach(function(b){ b.classList.remove('just-checked'); }); }, 500);
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
    if(blad.tvaNivaer && blad.niva === 1 && (totalt - ratt) <= 2 && totalt > 0){
      lsSet('brak2_naddNiva2_' + blad.tabId, '1');
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

// fyll varje svarsrad (bråksvar + blandad-rad) med facit-data efter rendering
function fyllFacitData(rotEl, blad){
  var fasitLista = [];
  blad.grupper.forEach(function(g){ g.rader.forEach(function(r){
    if(r.typ === 'brakSvar') fasitLista.push(r.svar);
  }); });
  var rader = rotEl.querySelectorAll('.brak-svar-rad, .brak-fragerad');
  rader.forEach(function(row, i){
    var s = fasitLista[i];
    if(!s) return;
    row.dataset.hel = s.hel; row.dataset.t = s.t; row.dataset.n = s.n;
    row.dataset.facit = mixedText(s);
  });
}

// ============================================================
//  DEL 1 · BRÅK ↔ DECIMAL
// ============================================================
function avr(x, d){ var p = Math.pow(10, d); return Math.round(x * p) / p; }

// Decimaltal-rad: bråk visas, eleven skriver decimaltalet
function radBrakDec(t, n, val, note, rund){
  return {typ:'brakTillDec', taljare:t, namnare:n, svar:val, not:note||'', rund:rund||''};
}
// Bråk-rad: decimaltal visas, eleven skriver bråket i enklaste form (återanvänder brakSvar)
function radDecBrak(t, n, dec){
  return {typ:'brakSvar', vanster:'<span class="ovn-text ovn-num">' + dec + '</span>', svar:kanonisk(t, n)};
}

// ── Talpooler per nivå ──
// NIVÅ 1: vanliga äkta bråk, nämnare ≤ 10, exakta decimaler – [täljare, nämnare, decimalsträng]
var TERM1 = [
  [1,2,'0,5'], [1,4,'0,25'], [3,4,'0,75'],
  [1,5,'0,2'], [2,5,'0,4'], [3,5,'0,6'], [4,5,'0,8'],
  [1,10,'0,1'], [3,10,'0,3'], [7,10,'0,7'], [9,10,'0,9']
];
// NIVÅ 2 extra: åttondelar (exakta decimaler) + tal > 1 som går jämnt ut
var TERM2_ATTON = [ [1,8,'0,125'], [3,8,'0,375'], [5,8,'0,625'], [7,8,'0,875'] ];
var TERM2_OAKTA = [ [5,4,'1,25'], [7,4,'1,75'], [6,5,'1,2'], [7,5,'1,4'], [8,5,'1,6'], [9,5,'1,8'], [5,2,'2,5'], [7,2,'3,5'] ];
// Nivå 2-poolen för BÅDA riktningar (alla går jämnt ut, så de är reversibla)
var TERM2 = TERM1.concat(TERM2_ATTON, TERM2_OAKTA);

// Bråk som måste avrundas (bara bråk→decimal) – [t, n, avrundat, sträng, godkända svar]
var RUND1 = [ [1,3, 0.33, '0,33', '0,33|0,3'], [2,3, 0.67, '0,67', '0,67|0,7'] ];
// Nivå 2 får även åttondels-/tredjedels-tal > 1 som avrundas i bråk→decimal-riktningen
var RUND2 = RUND1.concat([
  [9,8, 1.13, '1,13', '1,13|1,1'], [11,8, 1.38, '1,38', '1,38|1,4'],
  [10,3, 3.33, '3,33', '3,33|3,3'], [11,3, 3.67, '3,67', '3,67|3,7']
]);

function rundRad(p){ return radBrakDec(p[0], p[1], p[2], '≈', p[4]); }

// Plocka k unika element ur en lista (utan återläggning)
function gSample(arr, k){
  var kopia = arr.slice();
  for(var i = kopia.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = kopia[i]; kopia[i] = kopia[j]; kopia[j] = t; }
  return kopia.slice(0, k);
}

var BTFORM_HINT = '<strong>Tänk på:</strong> skriv decimaltal med <strong>komma</strong> (t.ex. 0,75) '
  + 'och bråk i <strong>enklaste form</strong>. Tecknet ≈ betyder att svaret är avrundat.';
var BTFORM_HINT2 = BTFORM_HINT + ' På den här nivån finns även åttondelar och tal större än 1 – skriv dem i blandad form (t.ex. 1 och 1/4).';

// Bygg ett blad ur poolerna för given nivå
function bladBTform(niva, forsta){
  var exakt = niva === 2 ? TERM2 : TERM1;
  var rund  = niva === 2 ? RUND2 : RUND1;
  var bd, rd, db, titel, hint;
  if(forsta){
    // Representativ, fast första uppsättning per nivå
    if(niva === 1){
      bd = [[1,2,'0,5'],[3,4,'0,75'],[2,5,'0,4'],[7,10,'0,7']];
      rd = [RUND1[0], RUND1[1]];
      db = [[1,2,'0,5'],[1,4,'0,25'],[4,5,'0,8'],[3,5,'0,6'],[1,5,'0,2'],[3,10,'0,3']];
    } else {
      bd = [[5,8,'0,625'],[3,8,'0,375'],[5,4,'1,25'],[7,5,'1,4']];
      rd = [RUND2[0], gPick([RUND2[2],RUND2[3],RUND2[4],RUND2[5]])];
      db = [[1,8,'0,125'],[7,8,'0,875'],[6,5,'1,2'],[5,2,'2,5'],[3,4,'0,75'],[2,5,'0,4']];
    }
  } else {
    bd = gSample(exakt, 4);
    rd = gSample(rund, 2);
    db = gSample(exakt, 6);
  }
  return {
    titel: 'Bråk ↔ decimal – nivå ' + niva + (forsta ? '' : ' (nytt blad)'),
    intro: niva === 2
      ? 'Nu även åttondelar och tal större än 1. Skriv svaren i enklaste form / blandad form.'
      : 'Skriv bråken som decimaltal och decimaltalen som bråk.',
    hint: niva === 2 ? BTFORM_HINT2 : BTFORM_HINT,
    keypadOps: [','],
    grupper: [
      {rubrik:'Skriv bråket som decimaltal', rader:
        bd.map(function(p){ return radBrakDec(p[0], p[1], avr(p[0]/p[1], 6)); })
        .concat(rd.map(function(p){ return rundRad(p); }))},
      {rubrik:'Skriv som bråk i enklaste form', rader:
        db.map(function(p){ return radDecBrak(p[0], p[1], p[2]); })}
    ]
  };
}

function GRUND_BTFORM_N1(){ return bladBTform(1, true); }
function GEN_BTFORM_N1(){ return bladBTform(1, false); }
function GRUND_BTFORM_N2(){ return bladBTform(2, true); }
function GEN_BTFORM_N2(){ return bladBTform(2, false); }

// ============================================================
//  DEL 2 · BLANDAD FORM  (växla mellan blandad form, bråk, decimal)
// ============================================================
// Talpooler: tal > 1 som ger exakt decimal. [täljare, nämnare, decimalsträng]
var BL_N1 = [
  [3,2,'1,5'],[5,2,'2,5'],[7,2,'3,5'],[9,2,'4,5'],
  [5,4,'1,25'],[7,4,'1,75'],[9,4,'2,25'],[11,4,'2,75'],
  [6,5,'1,2'],[7,5,'1,4'],[8,5,'1,6'],[9,5,'1,8'],[11,5,'2,2'],[12,5,'2,4'],
  [11,10,'1,1'],[13,10,'1,3'],[17,10,'1,7'],[19,10,'1,9'],[21,10,'2,1'],[23,10,'2,3']
];
var BL_N2_EXTRA = [
  [9,8,'1,125'],[11,8,'1,375'],[13,8,'1,625'],[15,8,'1,875'],[17,8,'2,125'],[19,8,'2,375'],
  [26,25,'1,04'],[29,25,'1,16'],[31,25,'1,24'],[37,25,'1,48'],[43,25,'1,72'],[51,25,'2,04'],[57,25,'2,28']
];
var BL_N2 = BL_N1.concat(BL_N2_EXTRA);

// Bråk visas, eleven skriver blandad form (brakSvar med blandat svar)
function radBrakBlandad(t, n){
  return {typ:'brakSvar', vanster: fracSpan(t, n), likhet:true, svar: kanonisk(t, n)};
}
// Bråk visas, eleven skriver decimaltal
function radBrakDec2(t, n){
  return {typ:'brakTillDec', taljare:t, namnare:n, svar: avr(t/n, 6), not:''};
}
// Bråk visas, eleven fyller i BÅDE decimal och blandad form
function radBlandadBada(t, n){
  return {typ:'brakTillBanda', taljare:t, namnare:n, decSvar: avr(t/n, 6), brakSvar: kanonisk(t, n)};
}

var BL_HINT = '<strong>Tänk på:</strong> blandad form skrivs som heltal + bråk (t.ex. 1 och 3/4), och bråket ska vara i <strong>enklaste form</strong>. '
  + 'I bråkform skriver du bara täljare och nämnare (t.ex. 7/4).';
var BL_HINT2 = BL_HINT + ' På den här nivån finns även blandade tal vars bråkdel är ett oäkta bråk – skriv om dem i enklaste form (t.ex. 2 och 7/6 = 3 och 1/6).';

// ── Nya radtyper för blandad form ↔ bråkform ──
// Oäkta bråk → blandad form (visar t/n, svar = blandad form)
//   återanvänder radBrakBlandad(t,n) som redan finns.
// Blandad form → oäkta bråk (visar "hel t/n", svar = oäkta bråk i enklaste form)
function oaktaEnklast(hel, t, n){
  var T = hel * n + t;
  var g = gcd(T, n);
  return {t: T / g, n: n / g};
}
function radBlandadTillOakta(hel, t, n){
  var o = oaktaEnklast(hel, t, n);
  return {typ:'brakSvar', vanster: mixedSpan({hel:hel, t:t, n:n}), likhet:true, svar:{hel:0, t:o.t, n:o.n}};
}
// Blandat tal med oäkta bråkdel → enklaste blandade form (visar "hel t/n", svar = kanonisk)
function radEnklasteForm(hel, t, n){
  var T = hel * n + t;
  return {typ:'brakSvar', vanster: mixedSpan({hel:hel, t:t, n:n}), likhet:true, svar: kanonisk(T, n)};
}

// ── Talpooler (seedade med Joachims papper) ──
// Nivå 1
var BL1_OAKTA   = [[7,2],[18,5],[13,3],[17,7],[10,3],[19,8],[16,5],[29,4]];           // skriv i blandad form
var BL1_BLANDAD = [[3,1,3],[1,2,7],[2,3,4],[2,3,5],[1,3,7],[1,5,6],[7,2,3],[5,3,4]];  // skriv i bråkform
// Nivå 2
var BL2_OAKTA    = [[31,5],[48,7],[34,3],[62,9],[51,8],[57,5],[92,17],[97,15]];                 // skriv i blandad form
var BL2_BLANDAD  = [[13,1,4],[16,2,5],[11,3,11],[19,1,3],[12,2,7],[14,3,8],[17,1,6],[15,4,9]];  // skriv i bråkform
var BL2_ENKLASTE = [[2,7,6],[7,8,5],[5,9,7],[11,7,3],[7,7,4],[4,10,3]];                         // skriv i enklaste form

function bladBlandad(niva, forsta){
  var poolO = niva === 2 ? BL2_OAKTA   : BL1_OAKTA;
  var poolB = niva === 2 ? BL2_BLANDAD : BL1_BLANDAD;
  var oakta, blandad, enklaste;
  if(forsta){
    oakta    = poolO.slice(0, 4);
    blandad  = poolB.slice(0, 4);
    enklaste = niva === 2 ? BL2_ENKLASTE.slice(0, 3) : [];
  } else {
    oakta    = gSample(poolO, 4);
    blandad  = gSample(poolB, 4);
    enklaste = niva === 2 ? gSample(BL2_ENKLASTE, 3) : [];
  }
  var grupper = [
    {rubrik:'Skriv i blandad form', rader: oakta.map(function(p){ return radBrakBlandad(p[0], p[1]); })},
    {rubrik:'Skriv i bråkform',     rader: blandad.map(function(p){ return radBlandadTillOakta(p[0], p[1], p[2]); })}
  ];
  if(niva === 2){
    grupper.push({rubrik:'Skriv i enklaste form', rader: enklaste.map(function(p){ return radEnklasteForm(p[0], p[1], p[2]); })});
  }
  return {
    titel: 'Blandad form och bråkform – nivå ' + niva + (forsta ? '' : ' (nytt blad)'),
    intro: niva === 2
      ? 'Växla mellan oäkta bråk och blandad form. Sista delen: skriv blandade tal i enklaste form.'
      : 'Växla mellan oäkta bråk och blandad form.',
    hint: niva === 2 ? BL_HINT2 : BL_HINT,
    keypadOps: [],
    grupper: grupper
  };
}
function GRUND_BLANDAD_N1(){ return bladBlandad(1, true); }
function GEN_BLANDAD_N1(){ return bladBlandad(1, false); }
function GRUND_BLANDAD_N2(){ return bladBlandad(2, true); }
function GEN_BLANDAD_N2(){ return bladBlandad(2, false); }

// ============================================================
//  DEL 3 · RÄKNA MED FORMER  (räkna med tal i olika former, svara i decimal)
// ============================================================
// Termtyp: ['int', H]
//          ['frac', T, N]                  äkta bråk T<N
//          ['imp',  T, N]                  oäkta bråk T>N (eller =N)
//          ['mixed', H, T, N]              blandad form
//          ['dec',  strängMedKomma]        decimaltal, t.ex. '0,75'

function rk_toFrac(term){
  if(term[0] === 'int')   return {t: term[1], n: 1};
  if(term[0] === 'frac')  return {t: term[1], n: term[2]};
  if(term[0] === 'imp')   return {t: term[1], n: term[2]};
  if(term[0] === 'mixed') return {t: term[1]*term[3] + term[2], n: term[3]};
  if(term[0] === 'dec'){
    var s = term[1];                                   // t.ex. '0,75' eller '1,1'
    var p = s.indexOf(',');
    var d = p >= 0 ? (s.length - p - 1) : 0;
    var mult = Math.pow(10, d);
    var num = Math.round(parseFloat(s.replace(',', '.')) * mult);
    return {t: num, n: mult};
  }
  return {t:0, n:1};
}
function rk_isFiniteDec(n){
  if(n <= 0) return false;
  while(n % 2 === 0) n /= 2;
  while(n % 5 === 0) n /= 5;
  return n === 1;
}
function rk_termHTML(term){
  if(term[0] === 'int')   return '<span class="ovn-text ovn-num">' + term[1] + '</span>';
  if(term[0] === 'frac')  return fracSpan(term[1], term[2]);
  if(term[0] === 'imp')   return fracSpan(term[1], term[2]);
  if(term[0] === 'mixed') return mixedSpan({hel:term[1], t:term[2], n:term[3]});
  if(term[0] === 'dec')   return '<span class="ovn-text ovn-num">' + term[1] + '</span>';
  return '';
}
function rk_uttryckHTML(L, op, R){
  return '<span class="rakna-uttryck" style="display:inline-flex;align-items:center;">' + rk_termHTML(L) + opSpan(op) + rk_termHTML(R) + '</span>';
}
function rk_avr(x, d){ var p = Math.pow(10, d); return Math.round(x * p) / p; }

// Bygg en räkna-rad utifrån två termer och operator
function radRakna(L, op, R){
  var fL = rk_toFrac(L), fR = rk_toFrac(R);
  var sign = (op === '−' || op === '-') ? -1 : 1;
  var ct = fL.t * fR.n + sign * fR.t * fL.n;
  var cn = fL.n * fR.n;
  var g = ct === 0 ? cn : gcd(Math.abs(ct), cn);
  var simN = cn / g;                                   // förenkla nämnaren
  var exakt = rk_isFiniteDec(simN);
  var v = ct / cn;
  if(exakt){
    return {typ:'rakna', vansterHTML: rk_uttryckHTML(L, op, R), svar: rk_avr(v, 6), not: '='};
  } else {
    var v2 = rk_avr(v, 2);
    var v1 = rk_avr(v, 1);
    var rund = String(v2).replace('.', ',') + '|' + String(v1).replace('.', ',');
    return {typ:'rakna', vansterHTML: rk_uttryckHTML(L, op, R), svar: v2, rund: rund, not: '≈'};
  }
}

// ----- TALPOOLER -----
// Varje element: [L-term, op, R-term]

// Nivå 1, Grupp 1: heltal ± äkta bråk (alla svar positiva)
var RK_G1_N1 = [
  [['int',1], '−', ['frac',2,3]],
  [['int',3], '−', ['frac',4,5]],
  [['int',2], '+', ['frac',1,4]],
  [['int',1], '+', ['frac',3,10]],
  [['int',4], '−', ['frac',1,2]],
  [['int',2], '−', ['frac',1,5]],
  [['int',3], '+', ['frac',2,5]],
  [['int',1], '+', ['frac',7,10]],
  [['int',2], '−', ['frac',3,4]],
  [['int',5], '−', ['frac',1,10]],
  [['int',3], '−', ['frac',1,3]],
  [['int',4], '+', ['frac',1,5]],
  [['int',2], '+', ['frac',3,5]],
  [['int',1], '+', ['frac',1,4]],
  [['int',3], '−', ['frac',2,3]],
  [['int',2], '+', ['frac',9,10]]
];

// Nivå 1, Grupp 2: decimal ± äkta bråk (alla svar positiva)
var RK_G2_N1 = [
  [['dec','0,5'], '+', ['frac',1,5]],
  [['frac',3,4], '−', ['dec','0,3']],
  [['frac',3,4], '+', ['dec','1,1']],
  [['dec','0,25'], '+', ['frac',1,2]],
  [['frac',1,4], '+', ['dec','0,5']],
  [['frac',4,5], '−', ['dec','0,4']],
  [['dec','0,6'], '−', ['frac',1,5]],
  [['frac',1,2], '+', ['dec','0,75']],
  [['dec','0,7'], '−', ['frac',1,4]],
  [['frac',3,5], '+', ['dec','0,3']],
  [['dec','0,9'], '−', ['frac',1,2]],
  [['frac',1,5], '+', ['dec','0,75']],
  [['dec','1,2'], '−', ['frac',1,2]],
  [['frac',1,4], '+', ['dec','0,4']]
];

// Nivå 1, Grupp 3: blandad/oäkta involverad (alla svar positiva)
var RK_G3_N1 = [
  [['mixed',1,2,5], '−', ['dec','0,65']],
  [['imp',8,5],     '−', ['mixed',1,1,4]],
  [['mixed',2,1,4], '−', ['dec','0,75']],
  [['mixed',1,1,2], '+', ['dec','0,5']],
  [['mixed',1,3,4], '−', ['dec','0,8']],
  [['imp',7,4],     '−', ['frac',1,2]],
  [['mixed',1,1,5], '+', ['frac',2,5]],
  [['mixed',2,1,2], '−', ['mixed',1,1,4]],
  [['imp',9,5],     '−', ['dec','0,9']],
  [['mixed',1,2,5], '+', ['dec','0,4']],
  [['mixed',1,3,5], '−', ['dec','0,55']],
  [['imp',7,5],     '+', ['dec','0,8']],
  [['mixed',2,3,4], '−', ['mixed',1,1,2]],
  [['mixed',1,1,4], '+', ['dec','0,75']]
];

// Nivå 2, Grupp 1: bråk med tredjedel ± decimal (svar med ≈)
var RK_G1_N2 = [
  [['frac',1,3], '−', ['dec','0,1']],
  [['dec','0,7'], '−', ['frac',2,3]],
  [['dec','0,5'], '+', ['frac',1,3]],
  [['frac',2,3], '+', ['dec','0,2']],
  [['dec','0,8'], '−', ['frac',1,3]],
  [['frac',1,3], '+', ['dec','0,4']],
  [['dec','0,9'], '−', ['frac',2,3]],
  [['frac',2,3], '−', ['dec','0,3']],
  [['dec','1,1'], '−', ['frac',1,3]],
  [['frac',1,3], '+', ['dec','0,7']],
  [['dec','0,6'], '+', ['frac',1,3]],
  [['frac',2,3], '−', ['dec','0,1']],
  [['dec','1,2'], '−', ['frac',2,3]]
];

// Nivå 2, Grupp 2: decimal ± exakt bråk (åtton- och femtondelar, alla positiva)
var RK_G2_N2 = [
  [['dec','0,4'], '−', ['frac',1,5]],
  [['dec','0,8'], '−', ['frac',1,8]],
  [['dec','0,5'], '−', ['frac',1,8]],
  [['dec','0,375'], '+', ['frac',1,4]],
  [['frac',3,8],  '+', ['dec','0,25']],
  [['dec','0,625'], '−', ['frac',1,4]],
  [['frac',5,8],  '−', ['dec','0,5']],
  [['dec','0,9'], '−', ['frac',3,8]],
  [['frac',7,8],  '−', ['dec','0,5']],
  [['dec','0,75'], '−', ['frac',1,8]],
  [['dec','0,6'], '+', ['frac',1,8]],
  [['frac',3,8],  '+', ['dec','0,5']],
  [['dec','0,7'], '−', ['frac',1,5]],
  [['frac',5,8],  '−', ['dec','0,25']]
];

// Nivå 2, Grupp 3: blandad/oäkta − blandad/oäkta (vissa svar är negativa)
var RK_G3_N2 = [
  [['mixed',3,3,4], '−', ['mixed',1,3,8]],
  [['mixed',1,4,5], '−', ['mixed',2,1,4]],
  [['frac',3,4],    '−', ['imp',7,5]],
  [['mixed',2,1,2], '−', ['mixed',1,3,4]],
  [['imp',9,4],     '−', ['mixed',1,1,2]],
  [['mixed',1,1,4], '−', ['mixed',2,1,2]],
  [['mixed',3,1,5], '−', ['mixed',1,3,4]],
  [['mixed',1,1,2], '−', ['imp',9,4]],
  [['imp',11,4],    '−', ['mixed',1,3,8]],
  [['mixed',2,3,8], '−', ['mixed',1,1,4]],
  [['mixed',1,2,5], '−', ['mixed',2,1,2]],
  [['imp',7,4],     '−', ['mixed',1,5,8]],
  [['mixed',3,1,2], '−', ['mixed',1,7,8]],
  [['mixed',1,1,8], '−', ['mixed',2,1,4]]
];

var RAKNA_HINT  = '<strong>Tänk på:</strong> gör om alla tal till <strong>samma form</strong> innan du räknar. '
  + 'Skriv svaret som decimaltal med komma (t.ex. 0,75). Tecknet ≈ betyder att svaret är avrundat.';
var RAKNA_HINT2 = RAKNA_HINT + ' På den här nivån kan svaret bli <strong>negativt</strong> – skriv då minustecken framför (t.ex. −0,45).';

function bladRakna(niva, forsta){
  var p1 = niva === 2 ? RK_G1_N2 : RK_G1_N1;
  var p2 = niva === 2 ? RK_G2_N2 : RK_G2_N1;
  var p3 = niva === 2 ? RK_G3_N2 : RK_G3_N1;
  var a, b, c;
  if(forsta){
    if(niva === 1){
      a = [RK_G1_N1[0], RK_G1_N1[1], RK_G1_N1[2]];                    // 1−2/3, 3−4/5, 2+1/4
      b = [RK_G2_N1[0], RK_G2_N1[1], RK_G2_N1[2]];                    // 0,5+1/5, 3/4−0,3, 3/4+1,1
      c = [RK_G3_N1[0], RK_G3_N1[1], RK_G3_N1[2]];                    // 1 2/5−0,65, 8/5−1 1/4, 2 1/4−0,75
    } else {
      a = [RK_G1_N2[0], RK_G1_N2[1], RK_G1_N2[2]];                    // 1/3−0,1, 0,7−2/3, 0,5+1/3
      b = [RK_G2_N2[0], RK_G2_N2[1], RK_G2_N2[2]];                    // 0,4−1/5, 0,8−1/8, 0,5−1/8
      c = [RK_G3_N2[0], RK_G3_N2[1], RK_G3_N2[2]];                    // 3 3/4−1 3/8, 1 4/5−2 1/4, 3/4−7/5
    }
  } else {
    a = gSample(p1, 3);
    b = gSample(p2, 3);
    c = gSample(p3, 3);
  }
  return {
    titel: 'Räkna med former – nivå ' + niva + (forsta ? '' : ' (nytt blad)'),
    intro: niva === 2
      ? 'Räkna med tal i olika former. Vissa svar blir negativa.'
      : 'Räkna med tal i olika former – gör om till samma form innan du räknar. Svara i decimalform.',
    hint: niva === 2 ? RAKNA_HINT2 : RAKNA_HINT,
    keypadOps: niva === 2 ? [',', '-'] : [','],
    grupper: [
      {rubrik: niva === 2 ? 'Bråk och decimaltal med tredjedelar (≈ avrundat svar)'
                          : 'Heltal och bråk',
       rader: a.map(function(t){ return radRakna(t[0], t[1], t[2]); })},
      {rubrik: niva === 2 ? 'Decimaltal och bråk (åtton- och femtondelar)'
                          : 'Decimaltal och bråk',
       rader: b.map(function(t){ return radRakna(t[0], t[1], t[2]); })},
      {rubrik: niva === 2 ? 'Blandad form och oäkta bråk'
                          : 'Blandad form och oäkta bråk',
       rader: c.map(function(t){ return radRakna(t[0], t[1], t[2]); })}
    ]
  };
}
function GRUND_RAKNA_N1(){ return bladRakna(1, true); }
function GEN_RAKNA_N1(){ return bladRakna(1, false); }
function GRUND_RAKNA_N2(){ return bladRakna(2, true); }
function GEN_RAKNA_N2(){ return bladRakna(2, false); }

// ============================================================
//  DEL 4 · TEST – VISA VAD DU KAN  (samlingstest från hela kapitlet)
// ============================================================
// 5 områden, 3 frågor per område (a, b, c) = 15 totalt:
//   1. Skriv bråket som decimaltal              (TERM-pool)
//   2. Skriv decimaltalet som bråk              (TERM-pool, ej överlapp med 1)
//   3. Skriv oäkta bråket i blandad form        (BL-pool)
//   4. Skriv oäkta bråket som decimaltal        (BL-pool, ej överlapp med 3)
//   5. Räkna och svara i decimalform            (kombinerad räkna-pool)

var TEST_RAKNA_N1 = RK_G1_N1.concat(RK_G2_N1, RK_G3_N1);
var TEST_RAKNA_N2 = RK_G1_N2.concat(RK_G2_N2, RK_G3_N2);

var TEST_HINT  = '<strong>Testet:</strong> visa att du klarar alla områden. '
  + 'Skriv decimaltal med komma och bråk i <strong>enklaste form</strong>. '
  + 'Tecknet ≈ betyder att svaret är avrundat.';
var TEST_HINT2 = TEST_HINT + ' På nivå 2 kan svaret i sista frågan bli <strong>negativt</strong>.';

function bladTest(niva, forsta){
  var poolBD = niva === 2 ? TERM2 : TERM1;
  var poolBL = niva === 2 ? BL_N2 : BL_N1;
  var poolRK = niva === 2 ? TEST_RAKNA_N2 : TEST_RAKNA_N1;
  var t1, t2, t3, t4, t5;
  if(forsta){
    if(niva === 1){
      t1 = [[1,2,'0,5'], [3,4,'0,75'], [3,5,'0,6']];
      t2 = [[1,4,'0,25'], [2,5,'0,4'], [7,10,'0,7']];
      t3 = [[3,2,'1,5'], [5,4,'1,25'], [7,5,'1,4']];
      t4 = [[5,2,'2,5'], [9,5,'1,8'], [11,10,'1,1']];
      t5 = [RK_G1_N1[0], RK_G2_N1[0], RK_G3_N1[0]];          // 1−2/3, 0,5+1/5, 1 2/5−0,65
    } else {
      t1 = [[5,8,'0,625'], [3,4,'0,75'], [7,2,'3,5']];
      t2 = [[3,8,'0,375'], [1,8,'0,125'], [6,5,'1,2']];
      t3 = [[9,8,'1,125'], [31,25,'1,24'], [11,4,'2,75']];
      t4 = [[13,8,'1,625'], [37,25,'1,48'], [9,4,'2,25']];
      t5 = [RK_G1_N2[0], RK_G2_N2[0], RK_G3_N2[0]];          // 1/3−0,1, 0,4−1/5, 3 3/4−1 3/8
    }
  } else {
    var bd = gSample(poolBD, 6);                              // unika över tema 1+2
    var bl = gSample(poolBL, 6);                              // unika över tema 3+4
    t1 = bd.slice(0, 3);
    t2 = bd.slice(3, 6);
    t3 = bl.slice(0, 3);
    t4 = bl.slice(3, 6);
    t5 = gSample(poolRK, 3);
  }
  return {
    titel: 'Visa vad du kan – nivå ' + niva + (forsta ? '' : ' (nytt blad)'),
    intro: 'Ett samlingstest från hela kapitlet. Fem områden, tre uppgifter per område.',
    hint: niva === 2 ? TEST_HINT2 : TEST_HINT,
    keypadOps: niva === 2 ? [',', '-'] : [','],
    isTest: true,
    grupper: [
      {rubrik:'Skriv bråket som decimaltal',
       rader: t1.map(function(p){ return radBrakDec2(p[0], p[1]); })},
      {rubrik:'Skriv decimaltalet som bråk i enklaste form',
       rader: t2.map(function(p){ return radDecBrak(p[0], p[1], p[2]); })},
      {rubrik:'Skriv det oäkta bråket i blandad form',
       rader: t3.map(function(p){ return radBrakBlandad(p[0], p[1]); })},
      {rubrik:'Skriv det oäkta bråket som decimaltal',
       rader: t4.map(function(p){ return radBrakDec2(p[0], p[1]); })},
      {rubrik:'Räkna och svara i decimalform',
       rader: t5.map(function(task){ return radRakna(task[0], task[1], task[2]); })}
    ]
  };
}
function GRUND_TEST_N1(){ return bladTest(1, true); }
function GEN_TEST_N1(){ return bladTest(1, false); }
function GRUND_TEST_N2(){ return bladTest(2, true); }
function GEN_TEST_N2(){ return bladTest(2, false); }

// ============================================================
//  GRINDAR / LÅS  (sparas i localStorage)
// ============================================================
var PRAKTIKFLIKAR = ['btform','blandad','rakna'];
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

// Utvecklarläge: lägg ?dev=1 i URL:en så öppnas alla lås.
// Eleverna ser inget — de besöker bara den vanliga URL:en.
function devLas(){
  try { return /[?&]dev=1\b/.test(location.search); } catch(e) { return false; }
}

function markeraKlar(tabId){ lsSet('brak2_klar_' + tabId, '1'); uppdateraLas(); }
function godkannTest(){ lsSet('brak2_test_godkand', '1'); uppdateraLas(); }

function setLas(tabId, locked){
  var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  if(btn) btn.classList.toggle('is-locked', locked);
  var lasBox = document.getElementById('las-' + tabId);
  var innehall = document.getElementById(tabId + '-innehall');
  if(lasBox) lasBox.style.display = locked ? '' : 'none';
  if(innehall) innehall.style.display = locked ? 'none' : '';
}
function uppdateraLas(){
  var allaKlara = devLas() || PRAKTIKFLIKAR.every(function(id){ return lsGet('brak2_klar_' + id) === '1'; });
  setLas('test', !allaKlara);
}

// ============================================================
//  ORKESTRERING
// ============================================================
var GENERATORER = {
  btform: { nivaer: { 1: { grund: GRUND_BTFORM_N1, gen: GEN_BTFORM_N1 },
                      2: { grund: GRUND_BTFORM_N2, gen: GEN_BTFORM_N2 } } },
  blandad: { nivaer: { 1: { grund: GRUND_BLANDAD_N1, gen: GEN_BLANDAD_N1 },
                       2: { grund: GRUND_BLANDAD_N2, gen: GEN_BLANDAD_N2 } } },
  rakna:  { nivaer: { 1: { grund: GRUND_RAKNA_N1,   gen: GEN_RAKNA_N1 },
                      2: { grund: GRUND_RAKNA_N2,   gen: GEN_RAKNA_N2 } } },
  test:   { nivaer: { 1: { grund: GRUND_TEST_N1,    gen: GEN_TEST_N1 },
                      2: { grund: GRUND_TEST_N2,    gen: GEN_TEST_N2 } } }
};
function harBesokt(id){ return lsGet('brak2_besokt_' + id) === '1'; }
function markeraBesokt(id){ lsSet('brak2_besokt_' + id, '1'); }
function aktuellNiva(tabId){ return lsGet('brak2_niva_' + tabId) === '2' ? 2 : 1; }
function byggNiva(tabId, niva){ lsSet('brak2_niva_' + tabId, String(niva)); byggSheet(tabId, true, niva); }

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
    blad.niva2Upplast = devLas() || (lsGet('brak2_naddNiva2_' + sheetId) === '1') || (n === 2);
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
byggSheet('btform', true);
byggSheet('blandad', true);
byggSheet('rakna', true);
byggSheet('test', true);

// Visa en liten badge i hörnet om dev-läget är aktivt
if(devLas()){
  var devBadge = document.createElement('div');
  devBadge.textContent = '🔧 DEV — alla lås öppna';
  devBadge.style.cssText = 'position:fixed;top:10px;right:10px;background:#fbbf24;color:#1f2937;'
    + 'padding:4px 10px;border-radius:4px;font-family:monospace;font-size:11px;font-weight:700;'
    + 'z-index:9999;box-shadow:0 2px 6px rgba(0,0,0,.18);';
  document.body.appendChild(devBadge);
  console.info('🔧 DEV-läge aktiverat — alla lås är öppna (test-fliken och nivå 2 på alla flikar).');
}