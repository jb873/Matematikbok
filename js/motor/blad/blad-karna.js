/* ============================================================
   FAMILJ A · BLAD-MOTORN — DELAD KÄRNA
   Utbruten intakt ur ak7-k1-d4-brak-decimal.html (Fas 2, Fall A).
   Logik oförändrad. Laddas som klassiskt <script> FÖRE blad-<del>.js.
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
// Stående bråk med EN inmatningsruta i täljar- eller nämnarposition (åk8 d2, C1:6/8).
// Det fasta talet visas, den andra positionen är en .brak-in-ruta. Minsta tillägg —
// återanvänder ovn-brak-markupen + .brak-in-CSS. Rör inte fracSpan/fracBoxes.
function fracRuta(fastTal, opts){
  opts = opts || {};
  var kl = opts.klass ? (' ' + opts.klass) : '';
  var inp = '<input class="brak-in ovn-in fr-ruta' + kl + '" inputmode="numeric" autocomplete="off" style="width:52px;text-align:center;">';
  var t = opts.ruta === 'taljare' ? inp : ('<span class="ovn-num">' + fastTal + '</span>');
  var n = opts.ruta === 'taljare' ? ('<span class="ovn-num">' + fastTal + '</span>') : inp;
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

      if(rad.typ === 'brakForlang'){
        html += '<div class="ovn-brak-rad brak-forlang-rad" data-rad="' + radNummer + '"'
          + ' data-hundra="' + rad.hundra + '" data-dec="' + rad.decSvar + '"'
          + ' data-facit-dec="' + String(rad.decSvar).replace('.', ',') + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += fracSpan(rad.taljare, rad.namnare);
        html += '<span class="ovn-text" style="margin:0 8px;">=</span>';
        html += '<span class="bl-fall"><span class="bl-etikett">hundradelar</span>'
          + '<span class="ovn-brak forlang-frak">'
          + '<input class="ovn-in forlang-tal" inputmode="numeric" autocomplete="off">'
          + '<span class="ovn-brak-strecket"></span>'
          + '<span class="forlang-namn">100</span></span></span>';
        html += '<span class="ovn-text" style="margin:0 8px;">=</span>';
        html += '<span class="bl-fall"><span class="bl-etikett">decimal</span>'
          + '<input class="ovn-in forlang-dec" inputmode="decimal" autocomplete="off"></span>';
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
      if(inp.classList.contains('brak-cell') || inp.classList.contains('brak-kladd') || inp.classList.contains('brak-bada-dec') || inp.classList.contains('forlang-tal') || inp.classList.contains('forlang-dec')) return;
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

    // 4) Förläng-rader (hundradels-täljare + decimal, rättas var för sig)
    rotEl.querySelectorAll('.brak-forlang-rad').forEach(function(row){
      row.querySelectorAll('.ovn-mark, .ovn-fasit').forEach(function(x){ x.remove(); });
      var talIn = row.querySelector('.forlang-tal');
      var decIn = row.querySelector('.forlang-dec');
      [talIn, decIn].filter(Boolean).forEach(function(b){ b.classList.remove('correct','wrong','just-checked'); });
      var cHundra = parseInt(row.dataset.hundra, 10);
      var cDec = parseFloat(row.dataset.dec);
      if(talIn){
        totalt++;
        var talOk = (talIn.value || '').trim() !== '' && parseInt(talIn.value, 10) === cHundra;
        var frak = row.querySelector('.forlang-frak');
        if(talOk){ ratt++; talIn.classList.add('correct','just-checked'); frak.insertAdjacentElement('afterend', marker(true)); }
        else {
          talIn.classList.add('wrong','just-checked');
          var mkT = marker(false); frak.insertAdjacentElement('afterend', mkT);
          var fT = document.createElement('span'); fT.className = 'ovn-fasit';
          fT.textContent = 'rätt: ' + cHundra + '/100'; mkT.insertAdjacentElement('afterend', fT);
        }
        setTimeout(function(){ if(talIn) talIn.classList.remove('just-checked'); }, 500);
      }
      if(decIn){
        totalt++;
        var decOk = jamforTal(decIn.value, cDec);
        if(decOk){ ratt++; decIn.classList.add('correct','just-checked'); decIn.insertAdjacentElement('afterend', marker(true)); }
        else {
          decIn.classList.add('wrong','just-checked');
          var mkD = marker(false); decIn.insertAdjacentElement('afterend', mkD);
          var fD = document.createElement('span'); fD.className = 'ovn-fasit';
          fD.textContent = 'rätt: ' + row.dataset.facitDec; mkD.insertAdjacentElement('afterend', fD);
        }
        setTimeout(function(){ if(decIn) decIn.classList.remove('just-checked'); }, 500);
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
      lsSet('k1d4_naddNiva2_' + blad.tabId, '1');
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



// ============================================================
//  GRINDAR / LÅS  (sparas i localStorage)
// ============================================================
var PRAKTIKFLIKAR = ['btform','hundra'];
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

// Utvecklarläge: lägg ?dev=1 i URL:en så öppnas alla lås.
// Eleverna ser inget — de besöker bara den vanliga URL:en.
function devLas(){
  try { return /[?&]dev=1\b/.test(location.search); } catch(e) { return false; }
}

function markeraKlar(tabId){ lsSet('k1d4_klar_' + tabId, '1'); uppdateraLas(); }
function godkannTest(){ lsSet('k1d4_test_godkand', '1'); uppdateraLas(); }

function setLas(tabId, locked){
  var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  if(btn) btn.classList.toggle('is-locked', locked);
  var lasBox = document.getElementById('las-' + tabId);
  var innehall = document.getElementById(tabId + '-innehall');
  if(lasBox) lasBox.style.display = locked ? '' : 'none';
  if(innehall) innehall.style.display = locked ? 'none' : '';
}
function uppdateraLas(){
  // Testet är öppet från början i detta delkapitel (samma som övriga k1-delkapitel).
  setLas('test', false);
}

// ============================================================
//  ORKESTRERING
// ============================================================

function harBesokt(id){ return lsGet('k1d4_besokt_' + id) === '1'; }
function markeraBesokt(id){ lsSet('k1d4_besokt_' + id, '1'); }
function aktuellNiva(tabId){ return lsGet('k1d4_niva_' + tabId) === '2' ? 2 : 1; }
function byggNiva(tabId, niva){ lsSet('k1d4_niva_' + tabId, String(niva)); byggSheet(tabId, true, niva); }

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
    blad.niva2Upplast = devLas() || (lsGet('k1d4_naddNiva2_' + sheetId) === '1') || (n === 2);
  } else {
    if(forstaBesoket && !harBesokt(sheetId)){ blad = def.grund(); markeraBesokt(sheetId); }
    else { blad = def.gen(); }
  }
  blad.tabId = sheetId;
  blad.kanGenerera = true;
  bygg_blad(rotEl, blad);
  fyllFacitData(rotEl, blad);
}



// ============================================================
//  FÖRELÄSNINGAR  (samma mönster som övriga k1-delkapitel)
// ============================================================

function initForelasningar(){
  var lectureList = document.getElementById('lecture-list');
  var player = document.getElementById('lecture-player');
  var frame = document.getElementById('lecture-frame');
  var ytLink = document.getElementById('lecture-yt-link');
  var tom = document.getElementById('lecture-empty');
  if(!lectureList) return;
  if(!FORELASNINGAR.length){
    if(player) player.style.display = 'none';
    if(tom) tom.style.display = '';
    return;
  }
  var aktivKort = null;
  function stopPlayer(){
    if(aktivKort){ aktivKort.classList.remove('is-playing'); var s = aktivKort.querySelector('[data-state]'); if(s) s.textContent = 'Spela film'; }
    aktivKort = null;
    if(frame) frame.innerHTML = '';
    if(player) player.classList.remove('is-open');
  }
  FORELASNINGAR.forEach(function(f){
    var card = document.createElement('div');
    card.className = 'lecture-card';
    card.innerHTML =
        '<div class="lecture-thumb">'
          + '<img src="https://img.youtube.com/vi/' + f.id + '/mqdefault.jpg" alt="" loading="lazy">'
          + '<div class="lecture-play"><span>▶</span></div>'
        + '</div>'
      + '<div class="lecture-meta">'
        + '<div class="lecture-title">' + f.titel + '</div>'
        + '<div class="lecture-tag">' + f.tag + '</div>'
      + '</div>'
      + '<div class="lecture-state" data-state>Spela film</div>';
    card.addEventListener('click', function(){
      if(aktivKort === card){ stopPlayer(); return; }
      if(aktivKort){ aktivKort.classList.remove('is-playing'); aktivKort.querySelector('[data-state]').textContent = 'Spela film'; }
      aktivKort = card;
      card.classList.add('is-playing');
      card.querySelector('[data-state]').textContent = 'Spelas nu';
      var origin = (location.origin && location.origin.indexOf('http') === 0)
        ? '&origin=' + encodeURIComponent(location.origin) + '&widget_referrer=' + encodeURIComponent(location.origin) : '';
      frame.innerHTML = '<iframe src="https://www.youtube.com/embed/' + f.id
        + '?rel=0&playsinline=1&enablejsapi=1' + origin + '" title="' + f.titel
        + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      ytLink.href = 'https://youtu.be/' + f.id;
      player.classList.add('is-open');
      card.insertAdjacentElement('afterend', player);
      player.scrollIntoView({behavior:'smooth', block:'center'});
    });
    lectureList.appendChild(card);
  });
}



