/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k2-d3-forlanga-forkorta.html
   Byte-identiskt utbrutet (hela scriptet, logik orörd). Egen generation. */
// ============================================================
//  HJÄLPARE
// ============================================================
function gPick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }

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
    // Mellanledskravet står i DATAN (grupp.mellanled) — mellanled-grind läser flaggan, inte rubriken.
    html += '<div class="ovn-grupp"' + (grupp.mellanled ? ' data-mellanled="' + grupp.mellanled + '"' : '') + '>';
    html += '<div class="ovn-grupp-rubrik">' + (gi+1) + '. ' + grupp.rubrik + '</div>';
    var radNummer = 0;
    grupp.rader.forEach(function(rad){
      radNummer++;
      var bokstav = String.fromCharCode(96 + radNummer);

      if(rad.typ === 'brakSvar'){
        var kladd = blad.mellanled
          ? '<input class="ovn-in bred brak-kladd" inputmode="text" autocomplete="off">'
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

      if(rad.typ === 'kedja'){
        html += '<div class="ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        rad.led.forEach(function(L, idx){
          if(idx > 0) html += '<span class="ovn-text" style="margin:0 7px;font-size:20px;">=</span>';
          var tHtml = L.bt
            ? '<input class="ovn-in kedje-in" data-svar="' + L.t + '" inputmode="numeric" autocomplete="off">'
            : '<span class="ovn-brak-taljare">' + L.t + '</span>';
          var nHtml = L.bn
            ? '<input class="ovn-in kedje-in" data-svar="' + L.n + '" inputmode="numeric" autocomplete="off">'
            : '<span class="ovn-brak-namnare">' + L.n + '</span>';
          html += '<span class="ovn-brak kedje-brak">' + tHtml
            + '<span class="ovn-brak-strecket"></span>' + nHtml + '</span>';
        });
        html += '</div>';
        return;
      }

      if(rad.typ === 'tecken'){
        html += '<div class="ovn-brak-rad val-rad" data-rad="' + radNummer + '" data-typ="tecken" data-ratt="' + rad.svar + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += fracSpan(rad.a[0], rad.a[1]);
        html += '<span class="val-knappar">';
        ['<','=','>'].forEach(function(s){
          html += '<button type="button" class="val-knapp val-tecken" data-val="' + s + '">' + s + '</button>';
        });
        html += '</span>';
        html += fracSpan(rad.b[0], rad.b[1]);
        html += '</div>';
        return;
      }

      if(rad.typ === 'mc'){
        html += '<div class="ovn-brak-rad val-rad mc-rad" data-rad="' + radNummer + '" data-typ="mc" data-ratt="' + rad.ratt + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="mc-fraga">Lika med ' + fracSpan(rad.mal[0], rad.mal[1]) + ' ?</span>';
        html += '<span class="mc-alternativ">';
        rad.alternativ.forEach(function(alt, i){
          html += '<button type="button" class="val-knapp mc-alt" data-val="' + i + '">'
            + fracSpan(alt[0], alt[1]) + '</button>';
        });
        html += '</span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'forlang'){
        html += '<div class="ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += fracSpan(rad.t, rad.n);
        html += '<span class="ovn-text" style="margin:0 7px;font-size:20px;">=</span>';
        html += '<span class="ovn-brak kedje-brak">'
          + '<input class="ovn-in forlang-in" data-svar="' + rad.svarT + '" inputmode="numeric" autocomplete="off">'
          + '<span class="ovn-brak-strecket"></span>'
          + '<span class="ovn-brak-namnare">' + rad.malN + '</span></span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'stambrak'){
        html += '<div class="ovn-brak-rad stam-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text" style="margin-right:10px;">Ett stambråk:</span>';
        html += '<span class="ovn-brak kedje-brak">'
          + '<input class="ovn-in stam-cell stam-t" inputmode="numeric" autocomplete="off">'
          + '<span class="ovn-brak-strecket"></span>'
          + '<input class="ovn-in stam-cell stam-n" inputmode="numeric" autocomplete="off"></span>';
        html += '</div>';
        return;
      }

      if(rad.typ === 'para'){
        var par = rad.par;
        var red = function(t, n){ var g = gcd(t, n); return [t/g, n/g]; };
        var simpl = par.map(function(p){ return red(p[0], p[1]); });
        var pos = gSample(par.map(function(_, i){ return i; }), par.length); // pos[k] = ursprungsindex på legendplats k
        var LBL = ['A','B','C','D','E','F'];
        var labelFor = par.map(function(_, i){ return LBL[pos.indexOf(i)]; });
        html += '<div class="para-block ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<div class="para-wrap"><div class="para-vanster">';
        par.forEach(function(p, i){
          html += '<div class="para-item">' + fracSpan(p[0], p[1])
            + '<select class="para-sel" data-ratt="' + labelFor[i] + '">'
            + '<option value="">?</option>'
            + par.map(function(_, k){ return '<option value="' + LBL[k] + '">' + LBL[k] + '</option>'; }).join('')
            + '</select></div>';
        });
        html += '</div><div class="para-legend">';
        pos.forEach(function(origIdx, k){
          var s = simpl[origIdx];
          html += '<span class="para-leg-item"><b>' + LBL[k] + '.</b> ' + fracSpan(s[0], s[1]) + '</span>';
        });
        html += '</div></div></div>';
        return;
      }

      /* MELLANLEDET, FÖRLÄNGA OCH FÖRKORTA (Joachim 2026-10-25). Eleven skriver hela ledet själv:
           förläng  2/9 = (2 · 3)/(9 · 3) = 6/27
           förkorta 4/14 = (4/2)/(14/2) = 2/7   — snedstrecket inne i täljare och nämnare är ett
                                                 uttryckligt undantag från regeln om staplad division
         Rättas i kontrollera (steg 7): samma faktor i täljare och nämnare, rätt faktor, och ett led
         som redan är svaret (ett ensamt tal) fälls. Rutorna i ledet bär data-mellan med ledets facit
         (repots konvention: en |-lista, första formen först), svaret data-svar. */
      if(rad.typ === 'mellanled'){
        var k = rad.k, T = rad.slag === 'forlang' ? rad.t * k : rad.t / k, N = rad.slag === 'forlang' ? rad.n * k : rad.n / k;
        var tkn = rad.slag === 'forlang' ? ' · ' : '/';
        var facit = '(' + rad.t + tkn + k + ')/(' + rad.n + tkn + k + ') = ' + T + '/' + N;
        var bl = rad.blandad && T > N ? { hel: Math.floor(T / N), t: T % N, n: N } : null;
        if(bl) facit += ' = ' + bl.hel + (bl.t ? ' ' + bl.t + '/' + bl.n : '');
        html += '<div class="ovn-brak-rad mellanled-rad" data-rad="' + radNummer + '" data-slag="' + rad.slag + '" data-t="' + rad.t
          + '" data-n="' + rad.n + '" data-k="' + k + '" data-facit="' + facit + '"' + (bl ? ' data-blandad="1"' : '') + '>';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += fracSpan(rad.t, rad.n);
        html += '<span class="mellan-eq">=</span>';
        var ledFacit = function(tal){ return rad.slag === 'forlang' ? tal + '·' + k + '|' + k + '·' + tal : tal + '/' + k; };
        html += '<span class="ovn-brak kedje-brak ml-led">'
          + '<input class="ovn-in ml-cell ml-t" data-mellan="' + ledFacit(rad.t) + '" inputmode="text" autocomplete="off" aria-label="täljarens led">'
          + '<span class="ovn-brak-strecket"></span>'
          + '<input class="ovn-in ml-cell ml-n" data-mellan="' + ledFacit(rad.n) + '" inputmode="text" autocomplete="off" aria-label="nämnarens led"></span>';
        html += '<span class="mellan-eq">=</span>';
        if(bl){
          html += '<span class="ml-svar ml-blandad"><input class="ovn-in ml-cell ml-svar-hel" data-svar="' + bl.hel + '" inputmode="numeric" autocomplete="off" aria-label="heltal">'
            + (bl.t ? '<span class="ovn-brak kedje-brak"><input class="ovn-in ml-cell ml-svar-t" data-svar="' + bl.t + '" inputmode="numeric" autocomplete="off">'
              + '<span class="ovn-brak-strecket"></span><input class="ovn-in ml-cell ml-svar-n" data-svar="' + bl.n + '" inputmode="numeric" autocomplete="off"></span>' : '')
            + '</span>';
        } else {
          html += '<span class="ovn-brak kedje-brak ml-svar">'
            + '<input class="ovn-in ml-cell ml-svar-t" data-svar="' + T + '" inputmode="numeric" autocomplete="off">'
            + '<span class="ovn-brak-strecket"></span>'
            + (rad.fastN ? '<span class="ovn-brak-namnare">' + N + '</span>'
                         : '<input class="ovn-in ml-cell ml-svar-n" data-svar="' + N + '" inputmode="numeric" autocomplete="off">')
            + '</span>';
        }
        html += '</div>';
        return;
      }

      if(rad.typ === 'mgn'){
        var M = rad.M, f1 = M / rad.a[1], f2 = M / rad.b[1];
        var forlangLinje = function(t, n, f){
          return fracSpan(t, n) + '<span class="mellan-eq">=</span>'
            + '<span class="ovn-brak kedje-brak">'
              + '<span class="mellan-prod">' + t + '·<input class="ovn-in mellan-fin" data-svar="' + f + '" inputmode="numeric" autocomplete="off"></span>'
              + '<span class="ovn-brak-strecket"></span>'
              + '<span class="mellan-prod">' + n + '·<input class="ovn-in mellan-fin" data-svar="' + f + '" inputmode="numeric" autocomplete="off"></span></span>'
            + '<span class="mellan-eq">=</span>'
            + '<span class="ovn-brak kedje-brak">'
              + '<input class="ovn-in forlang-in" data-svar="' + (t * f) + '" inputmode="numeric" autocomplete="off">'
              + '<span class="ovn-brak-strecket"></span>'
              + '<span class="ovn-brak-namnare">' + M + '</span></span>';
        };
        html += '<div class="ovn-brak-rad mgn-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<div class="mgn-block">';
        html += '<div class="mgn-text">Förläng ' + fracSpan(rad.a[0], rad.a[1]) + ' och ' + fracSpan(rad.b[0], rad.b[1]) + ' till samma nämnare.</div>';
        html += '<div class="mgn-line">Minsta gemensamma nämnare = <input class="ovn-in mellan-fin mgn-in" data-svar="' + M + '" inputmode="numeric" autocomplete="off"></div>';
        html += '<div class="mgn-line">' + forlangLinje(rad.a[0], rad.a[1], f1) + '</div>';
        html += '<div class="mgn-line">' + forlangLinje(rad.b[0], rad.b[1], f2) + '</div>';
        html += '</div></div>';
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
  // DELAD AK8_UI-keypad (fast layout + kontext-gråning). Migrerad från egen .ovn-keypad.
  html += AK8_UI.keypadHTML();

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
    inp.addEventListener('input', function(){
      // Rutan följer talet: måttet är formen (34 px bråkcell, 26 px stegruta), inte ett tak.
      if(window.AK8_UI && AK8_UI.vaxMedGolv) AK8_UI.vaxMedGolv(inp);
      inp.classList.remove('correct','wrong');
      if(inp.classList.contains('brak-cell')){
        var rad = inp.closest('.brak-svar-rad, .brak-fragerad, .blandad-rad, .brak-bada-rad');
        if(rad) rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
        if(rad) rad.querySelectorAll('.brak-cell, .brak-bada-dec').forEach(function(c){ c.classList.remove('correct','wrong'); });
      } else if(inp.classList.contains('ml-cell')){
        var mlRad = inp.closest('.mellanled-rad');
        if(mlRad) mlRad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
        if(mlRad) mlRad.querySelectorAll('.ml-cell').forEach(function(c){ c.classList.remove('correct','wrong'); });
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
  // Knappsats – delad AK8_UI-bindning (fokus-följning, kontext-gråning, ⌫, Enter→nästa ruta).
  if(window.AK8_UI && AK8_UI.bindKeypad) AK8_UI.bindKeypad(rotEl);

  // Valknappar (jämför-tecken & välj-rätt): markera ett val per rad
  rotEl.querySelectorAll('.val-rad').forEach(function(rad){
    rad.querySelectorAll('.val-knapp').forEach(function(b){
      b.addEventListener('click', function(){
        if(rad.dataset.last === '1') return;
        rad.querySelectorAll('.val-knapp').forEach(function(x){ x.classList.remove('selected'); });
        b.classList.add('selected');
      });
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
      if(inp.classList.contains('brak-cell') || inp.classList.contains('brak-kladd') || inp.classList.contains('brak-bada-dec') || inp.classList.contains('stam-cell') || inp.classList.contains('ml-cell')) return;
      var rad = inp.closest('.ovn-rad, .ovn-brak-rad, .prob-rad') || inp.parentElement;
      rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
      inp.classList.remove('correct','wrong','just-checked');
      // OBESVARAD RUTA RÄTTAS INTE: räknas i nämnaren, men får varken markering eller facit.
      if(String(inp.value).trim() === ''){ totalt++; return; }
      var ok;
      if(inp.dataset.enhet) ok = (String(inp.value).toLowerCase().replace(/[\s.]/g,'') === String(inp.dataset.enhet).toLowerCase().replace(/[\s.]/g,''));
      else if(inp.dataset.rund){
        ok = inp.dataset.rund.split('|').some(function(v){ return jamforTal(inp.value, parseFloat(v.replace(',', '.'))); });
      }
      else ok = jamforLed(inp, parseFloat(inp.dataset.svar));
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

    // 3) Båda-rader (decimal + blandad form i samma rad, rättas var för sig)
    rotEl.querySelectorAll('.brak-bada-rad').forEach(function(row){
      row.querySelectorAll('.ovn-mark, .ovn-fasit').forEach(function(x){ x.remove(); });
      var decIn = row.querySelector('.brak-bada-dec');
      var helIn = row.querySelector('.brak-hel');
      var tIn   = row.querySelector('.brak-t');
      var nIn   = row.querySelector('.brak-n');
      [decIn, helIn, tIn, nIn].filter(Boolean).forEach(function(b){ b.classList.remove('correct','wrong','just-checked'); });
      var lika = function(el, v){ return el && (el.value||'').trim()!=='' && AK8_UI.pInt(el.value)===v; };
      var cDec = parseFloat(row.dataset.dec);
      var cH   = parseInt(row.dataset.hel, 10);
      var cT   = parseInt(row.dataset.t,   10);
      var cN   = parseInt(row.dataset.n,   10);
      // Decimal
      if(decIn) totalt++;
      if(decIn && String(decIn.value).trim() !== ''){
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

    // 4) Valrader (jämför-tecken & välj-rätt) – ett val per rad
    rotEl.querySelectorAll('.val-rad').forEach(function(rad){
      totalt++;
      rad.dataset.last = '1';
      rad.querySelectorAll('.ovn-fasit').forEach(function(x){ x.remove(); });
      var knappar = rad.querySelectorAll('.val-knapp');
      var sel = rad.querySelector('.val-knapp.selected');
      var ratt2 = rad.dataset.ratt;
      var ok = !!sel && sel.dataset.val === ratt2;
      knappar.forEach(function(b){ b.classList.remove('correct','wrong'); });
      if(ok){
        ratt++;
        sel.classList.add('correct');
      } else if(sel){
        sel.classList.add('wrong');
        // markera rätt alternativ — men BARA när eleven svarat. Utan sel-villkoret pekades det
        // rätta alternativet ut även på en obesvarad uppgift, eftersom ok då är falskt och
        // grenen kördes ändå. Samma regel som för tomma rutor: obesvarat markeras inte.
        knappar.forEach(function(b){ if(b.dataset.val === ratt2) b.classList.add('correct'); });
      }
    });

    // 5) Stambråk – täljaren ska vara 1, nämnaren ett heltal ≥ 2
    rotEl.querySelectorAll('.stam-rad').forEach(function(rad){
      totalt++;
      rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
      var tEl = rad.querySelector('.stam-t'), nEl = rad.querySelector('.stam-n');
      tEl.classList.remove('correct','wrong'); nEl.classList.remove('correct','wrong');
      var tv = (tEl.value || '').trim(), nv = (nEl.value || '').trim();
      // Obesvarad rad rättas inte: räknad i nämnaren, men varken färgad eller facit-visad.
      if(tv === '' && nv === '') return;
      // Tusentalsmellanslag bort före BÅDE formkontrollen och värdet: "1 400" är samma
      // nämnare som "1400", och heltalsmönstret nedan skulle annars fälla skrivsättet.
      var nvN = AK8_UI.avTusental(nv);
      var nNum = AK8_UI.pInt(nv);
      var tOk = (AK8_UI.avTusental(tv) === '1');
      var nOk = (/^\d+$/.test(nvN) && nNum >= 2);
      if(tOk && nOk){
        ratt++;
        tEl.classList.add('correct'); nEl.classList.add('correct');
        rad.appendChild(marker(true));
      } else {
        if(tv !== '') tEl.classList.add(tOk ? 'correct' : 'wrong');
        if(nv !== '') nEl.classList.add(nOk ? 'correct' : 'wrong');
        rad.appendChild(marker(false));
        var f = document.createElement('span'); f.className = 'ovn-fasit';
        f.textContent = '1 i täljaren, ett heltal ≥ 2 i nämnaren';
        rad.appendChild(f);
      }
    });

    // 6) Para ihop – ett rätt val per bråk
    rotEl.querySelectorAll('.para-sel').forEach(function(sel){
      totalt++;
      var item = sel.closest('.para-item');
      if(item) item.querySelectorAll('.ovn-fasit').forEach(function(x){ x.remove(); });
      sel.classList.remove('correct','wrong');
      var ok = sel.value !== '' && sel.value === sel.dataset.ratt;
      if(ok){ ratt++; sel.classList.add('correct'); }
      else {
        sel.classList.add('wrong');
        var f = document.createElement('span'); f.className = 'ovn-fasit';
        f.textContent = 'rätt: ' + sel.dataset.ratt;
        if(item) item.appendChild(f);
      }
    });

    // 7) Mellanled (förlänga och förkorta) — raden är EN enhet: ledet och svaret.
    //    Ledet: i täljaren det givna talet och faktorn (2 · 3, eller 3 · 2), i nämnaren samma faktor;
    //    vid förkortning talet delat med faktorn (4/2). Samma faktor uppe och nere, och den faktor
    //    uppgiften säger. Ett led som är ett ensamt tal är genvägen — svaret, inte steget — och fälls.
    rotEl.querySelectorAll('.mellanled-rad').forEach(function(row){
      totalt++;
      row.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(x){ x.remove(); });
      var celler = Array.prototype.slice.call(row.querySelectorAll('.ml-cell'));
      celler.forEach(function(c){ c.classList.remove('correct','wrong','just-checked'); });
      if(celler.every(function(c){ return String(c.value).trim() === ''; })) return;   // obesvarad
      var slag = row.dataset.slag, t = +row.dataset.t, n = +row.dataset.n, k = +row.dataset.k;
      function led(el, bas){
        var s = AK8_UI.avTusental(String(el.value)).replace(/\s+/g, '').replace(/[*×x⋅]/g, '·');
        var m = slag === 'forlang' ? s.match(/^(\d+)·(\d+)$/) : s.match(/^(\d+)[\/:÷](\d+)$/);
        if(!m) return null;
        var a = +m[1], b = +m[2];
        if(slag === 'forkort') return a === bas ? b : null;
        return a === bas ? b : (b === bas ? a : null);
      }
      var kt = led(row.querySelector('.ml-t'), t), kn = led(row.querySelector('.ml-n'), n);
      var ledOk = kt !== null && kt === kn && kt === k;
      var svarOk = true;
      row.querySelectorAll('[data-svar]').forEach(function(c){
        var cOk = String(c.value).trim() !== '' && AK8_UI.pInt(c.value) === +c.dataset.svar;
        if(!cOk) svarOk = false;
        if(String(c.value).trim() !== '') c.classList.add(cOk ? 'correct' : 'wrong');
      });
      row.querySelectorAll('[data-mellan]').forEach(function(c){
        if(String(c.value).trim() !== '') c.classList.add(ledOk ? 'correct' : 'wrong');
      });
      var ok = ledOk && svarOk, mk = marker(ok);
      row.appendChild(mk);
      if(ok) ratt++;
      else { var fx = document.createElement('span'); fx.className = 'ovn-fasit'; fx.innerHTML = 'rätt svar: ' + mellanledFacitHTML(slag, t, n, k, row.dataset.blandad === '1'); row.appendChild(fx); }
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
      lsSet('brak3_naddNiva' + nastaNiva + '_' + blad.tabId, '1');
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
    rotEl.querySelectorAll('.val-rad').forEach(function(rad){
      rad.dataset.last = '';
      rad.querySelectorAll('.val-knapp').forEach(function(b){ b.classList.remove('selected','correct','wrong'); });
    });
    rotEl.querySelectorAll('.para-sel').forEach(function(s){ s.value = ''; s.classList.remove('correct','wrong'); });
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

// Plocka k unika element ur en lista (utan återläggning)
function gSample(arr, k){
  var kopia = arr.slice();
  for(var i = kopia.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = kopia[i]; kopia[i] = kopia[j]; kopia[j] = t; }
  return kopia.slice(0, k);
}
// ============================================================
//  GRINDAR / LÅS  (sparas i localStorage)
// ============================================================
var PRAKTIKFLIKAR = ['forlanga','forkorta'];   // "Med mellanled" ingår i Förlänga (Joachim 2026-10-25)
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

// Utvecklarläge: lägg ?dev=1 i URL:en så öppnas alla lås.
// Eleverna ser inget — de besöker bara den vanliga URL:en.
function devLas(){
  try { return /[?&]dev=1\b/.test(location.search); } catch(e) { return false; }
}

function markeraKlar(tabId){ lsSet('brak3_klar_' + tabId, '1'); uppdateraLas(); }
function godkannTest(){ lsSet('brak3_test_godkand', '1'); uppdateraLas(); }

function setLas(tabId, locked){
  var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  if(btn) btn.classList.toggle('is-locked', locked);
  var lasBox = document.getElementById('las-' + tabId);
  var innehall = document.getElementById(tabId + '-innehall');
  if(lasBox) lasBox.style.display = locked ? '' : 'none';
  if(innehall) innehall.style.display = locked ? 'none' : '';
}
function uppdateraLas(){
  var allaKlara = devLas() || PRAKTIKFLIKAR.every(function(id){ return lsGet('brak3_klar_' + id) === '1'; });
  setLas('test', !allaKlara);
}

// ============================================================
//  ORKESTRERING
// ============================================================
// ============================================================
//  DELKAPITEL 3 · FÖRLÄNGA  (innehåll)
// ============================================================
// Radbyggare
/* MELLANLEDET (Joachim 2026-10-25). En förlängning per uppgift, bråket i enklaste form, nämnare 3–10,
   och förlängningen visas alltid som ett led eleven skriver: 2/9 = (2 · 3)/(9 · 3) = 6/27.
   Förkortningen likadant: 4/14 = (4/2)/(14/2) = 2/7, där T/N är i enklaste form och faktorn är
   största gemensamma delaren. Kravet står i gruppens data (mellanled: 'kravt'); rubriken säger det
   för eleven, men grindarna läser flaggan. */
function radMellanled(slag, t, n, k, extra){
  var r = {typ:'mellanled', slag:slag, t:t, n:n, k:k};
  if(extra) Object.keys(extra).forEach(function(e){ r[e] = extra[e]; });
  return r;
}
// Facit vid fel svar staplas så som eleven skriver det (Joachim 2026-10-25): 4/2 över 6/2 = 2/3.
// Snedstrecket inne i täljare och nämnare är ledets undantag, som i rutorna.
function mellanledFacitHTML(slag, t, n, k, blandad){
  var tkn = slag === 'forlang' ? ' · ' : '/';
  var T = slag === 'forlang' ? t * k : t / k, N = slag === 'forlang' ? n * k : n / k;
  var ut = fracSpan(t + tkn + k, n + tkn + k) + opSpan('=') + fracSpan(T, N);
  if(blandad && T > N) ut += opSpan('=') + mixedSpan({hel: Math.floor(T / N), t: T % N, n: N});
  return '<span class="ml-facit">' + ut + '</span>';
}
function radForlangMed(p, k){ return radMellanled('forlang', p[0], p[1], k); }
function radForlangTill(p, malN){ return radMellanled('forlang', p[0], p[1], malN / p[1], {fastN:true}); }
function radTecken(t1, n1, t2, n2){
  var v = t1 * n2 - t2 * n1;
  var s = v < 0 ? '<' : (v > 0 ? '>' : '=');
  return {typ:'tecken', a:[t1,n1], b:[t2,n2], svar:s};
}
function radMC(o){ return {typ:'mc', mal:o.mal, alternativ:o.alternativ, ratt:o.ratt}; }
function radKedja(led){ return {typ:'kedja', led: led}; }
// "Vilket tal saknas?" — ett steg: 3/5 = ▢/20
function radLucka(p){ return radKedja([{t:p[0], n:p[1]}, {t:p[0] * p[2] / p[1], n:p[2], bt:true}]); }
function radMGN(t1, n1, t2, n2){ var M = n1 * n2 / gcd(n1, n2); return {typ:'mgn', a:[t1,n1], b:[t2,n2], M:M}; }

// Pooler — [täljare, nämnare] i enklaste form, nämnare 3–10
var FORL_MED2 = [[4,5],[3,4],[2,5],[1,5],[2,3],[3,7],[5,9],[7,10]];
var FORL_MED3 = [[2,9],[3,4],[4,7],[5,8],[1,6],[2,5],[3,10],[5,7]];
// Tecken och flerval i samma talområde (Joachim 2026-10-25): det givna bråket i enklaste form med nämnare
// 3–10; det andra är ett sådant bråk eller en förlängning av ett (då står likhetstecknet).
var FORL_TECKEN = [ // [t1,n1,t2,n2]
  [5,9,7,9],[3,4,3,8],[4,9,8,18],[3,5,6,10],[5,6,7,8],[3,5,7,10],[7,10,2,3]
];
var FORL_LUCKA = [[3,5,20],[2,3,12],[3,4,20],[4,9,27],[5,6,24],[2,7,21]];   // [t, n, ny nämnare]
var FORL_MC = [
  {mal:[2,5], alternativ:[[3,6],[4,10],[4,7],[2,10],[5,8]], ratt:1},
  {mal:[2,3], alternativ:[[3,4],[4,6],[3,5],[5,6],[4,5]], ratt:1},
  {mal:[6,7], alternativ:[[6,8],[12,14],[7,8],[5,7],[12,13]], ratt:1},
  {mal:[3,4], alternativ:[[3,5],[6,8],[4,6],[9,16],[2,3]], ratt:1},
  {mal:[1,3], alternativ:[[1,4],[2,5],[2,6],[3,6],[2,3]], ratt:2}
];
var FORL_TILL   = [[3,8,24],[5,6,30],[4,9,36],[7,10,50],[2,7,28],[3,5,45]];   // [t, n, nämnaren som står]
var FORL_TILL60 = [[5,6],[7,10],[3,4],[2,5],[1,3]];
var MGN_PAIRS   = [[1,3,1,4],[2,3,1,4],[3,4,1,6],[2,5,1,4],[3,10,1,4]];

function bladForlanga(niva, forsta){
  if(niva === 2){
    var till = forsta ? FORL_TILL.slice(0,3)   : gSample(FORL_TILL, 3);
    var t60  = forsta ? FORL_TILL60.slice(0,3) : gSample(FORL_TILL60, 3);
    var mgn  = forsta ? MGN_PAIRS.slice(0,2)   : gSample(MGN_PAIRS, 2);
    return {
      titel: 'Förlänga – nivå 2',
      grupper: [
        {rubrik:'Förläng till nämnaren som står – skriv mellanledet och svaret', mellanled:'kravt', rader: till.map(function(p){ return radForlangTill(p, p[2]); })},
        {rubrik:'Förläng så att nämnaren blir 60', mellanled:'kravt', rader: t60.map(function(p){ return radForlangTill(p, 60); })},
        {rubrik:'Förläng två bråk till minsta gemensamma nämnare', mellanled:'kravt', rader: mgn.map(function(p){ return radMGN(p[0], p[1], p[2], p[3]); })}
      ]
    };
  }
  var med2   = forsta ? FORL_MED2.slice(0,3)   : gSample(FORL_MED2, 3);
  var med3   = forsta ? FORL_MED3.slice(0,3)   : gSample(FORL_MED3, 3);
  var tecken = forsta ? FORL_TECKEN.slice(0,4) : gSample(FORL_TECKEN, 4);
  var lucka  = forsta ? FORL_LUCKA.slice(0,3)  : gSample(FORL_LUCKA, 3);
  var mc     = forsta ? FORL_MC.slice(0,2)     : gSample(FORL_MC, 2);
  return {
    titel: 'Förlänga – nivå 1',
    grupper: [
      {rubrik:'Förläng med 2 – skriv mellanledet och svaret', mellanled:'kravt', rader: med2.map(function(p){ return radForlangMed(p, 2); })},
      {rubrik:'Förläng med 3 – skriv mellanledet och svaret', mellanled:'kravt', rader: med3.map(function(p){ return radForlangMed(p, 3); })},
      {rubrik:'Vilket tecken ska stå mellan bråken? <, = eller >', rader: tecken.map(function(p){ return radTecken(p[0], p[1], p[2], p[3]); })},
      {rubrik:'Vilket tal saknas?', rader: lucka.map(radLucka)},
      {rubrik:'Vilket bråk är likvärdigt? Välj rätt alternativ', rader: mc.map(function(x){ return radMC(x); })}
    ]
  };
}
function GRUND_FORLANGA_N1(){ return bladForlanga(1, true); }
function GEN_FORLANGA_N1(){ return bladForlanga(1, false); }
function GRUND_FORLANGA_N2(){ return bladForlanga(2, true); }
function GEN_FORLANGA_N2(){ return bladForlanga(2, false); }

// ============================================================
//  DELKAPITEL 3 · FÖRKORTA  (innehåll)
// ============================================================
// Talen är (T · f)/(N · f): T/N i enklaste form, N 3–10. Nivå 1 f 2–6, nivå 2 f ∈ {4, 6, 8, 9, 12}.
function radForkorta(p){ return radMellanled('forkort', p[0], p[1], gcd(p[0], p[1])); }
function radBlandadForkort(p){ return radMellanled('forkort', p[0], p[1], gcd(p[0], p[1]), {blandad:true}); }
function radStam(){ return {typ:'stambrak'}; }
function radPara(par){ return {typ:'para', par: par}; }

var FORK_MED2  = [[4,6],[4,14],[6,8],[10,12],[8,10],[6,14],[14,16],[10,18]];
var FORK_MED5  = [[10,15],[15,20],[20,25],[5,30],[35,40],[15,50],[10,45]];
var FORK_ENK1  = [[16,20],[15,25],[24,30],[6,9],[8,12],[9,15]];
var FORK_LANG  = [[16,40],[24,54],[27,36],[48,60],[36,48],[40,72],[42,54],[20,36]];
var FORK_BLAND = [[72,20],[96,18],[63,36],[88,24],[60,16],[84,36]];
var FORK_PARA  = [
  [[4,8],[6,9],[9,12],[4,10]],
  [[6,8],[10,15],[8,10],[3,12]],
  [[2,6],[6,8],[10,12],[4,5]]
];

function bladForkorta(niva, forsta){
  if(niva === 2){
    var lang  = forsta ? FORK_LANG.slice(0,4)  : gSample(FORK_LANG, 4);
    var bland = forsta ? FORK_BLAND.slice(0,3) : gSample(FORK_BLAND, 3);
    return {
      titel: 'Förkorta – nivå 2',
      grupper: [
        {rubrik:'Förkorta så långt som möjligt – skriv mellanledet och svaret', mellanled:'kravt', rader: lang.map(radForkorta)},
        {rubrik:'Förkorta till blandad form – skriv mellanledet och svaret', mellanled:'kravt', rader: bland.map(radBlandadForkort)}
      ]
    };
  }
  var m2   = forsta ? FORK_MED2.slice(0,3) : gSample(FORK_MED2, 3);
  var m5   = forsta ? FORK_MED5.slice(0,3) : gSample(FORK_MED5, 3);
  var enk  = forsta ? FORK_ENK1.slice(0,3) : gSample(FORK_ENK1, 3);
  var para = forsta ? FORK_PARA[0]         : gPick(FORK_PARA);
  return {
    titel: 'Förkorta – nivå 1',
    grupper: [
      {rubrik:'Förkorta med 2 – skriv mellanledet och svaret', mellanled:'kravt', rader: m2.map(radForkorta)},
      {rubrik:'Förkorta med 5 – skriv mellanledet och svaret', mellanled:'kravt', rader: m5.map(radForkorta)},
      {rubrik:'Förkorta till enklaste form – skriv mellanledet och svaret', mellanled:'kravt', rader: enk.map(radForkorta)},
      {rubrik:'Skriv ett stambråk (1 i täljaren)', rader: [radStam(), radStam(), radStam()]},
      {rubrik:'Para ihop bråk som har samma värde', rader: [radPara(para)]}
    ]
  };
}
function GRUND_FORKORTA_N1(){ return bladForkorta(1, true); }
function GEN_FORKORTA_N1(){ return bladForkorta(1, false); }
function GRUND_FORKORTA_N2(){ return bladForkorta(2, true); }
function GEN_FORKORTA_N2(){ return bladForkorta(2, false); }

var GENERATORER = {
  forlanga: { nivaer: { 1: { grund: GRUND_FORLANGA_N1, gen: GEN_FORLANGA_N1 },
                        2: { grund: GRUND_FORLANGA_N2, gen: GEN_FORLANGA_N2 } } },
  forkorta: { nivaer: { 1: { grund: GRUND_FORKORTA_N1, gen: GEN_FORKORTA_N1 },
                        2: { grund: GRUND_FORKORTA_N2, gen: GEN_FORKORTA_N2 } } }
};
function harBesokt(id){ return lsGet('brak3_besokt_' + id) === '1'; }
function markeraBesokt(id){ lsSet('brak3_besokt_' + id, '1'); }
function aktuellNiva(tabId){ return lsGet('brak3_niva_' + tabId) === '2' ? 2 : 1; }
function byggNiva(tabId, niva){ lsSet('brak3_niva_' + tabId, String(niva)); byggSheet(tabId, true, niva); }

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
    blad.nivaAntal = Object.keys(def.nivaer).length;   // antalet steg är DATA, inte två hårdkodade knappar
    blad.niva2Upplast = devLas() || (lsGet('brak3_naddNiva2_' + sheetId) === '1') || (n === 2);
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
byggSheet('forlanga', true);
byggSheet('forkorta', true);

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

// ══ TALBANK — testets tal ur ÖVA-bladets data (order 2026-09-23). Se blad-k2-d5.js. ════════════
window.BLAD_K2_D3 = (function(){
  var bank = {};
  function lagg(nod, post){ (bank[nod] = bank[nod] || []).push(post); }
  var blad = [];
  [GRUND_FORLANGA_N1, GRUND_FORLANGA_N2, GRUND_FORKORTA_N1, GRUND_FORKORTA_N2].forEach(function(bygg){
    if(typeof bygg !== 'function') return;
    try { blad.push(bygg()); } catch(e){}
  });
  blad.forEach(function(b){
    (b.grupper || []).forEach(function(g){
      (g.rader || []).forEach(function(r){
        if(r.typ === 'mellanled' && r.slag === 'forlang') lagg('brak-forlanga:rakna', { slag:'forlang', t:r.t, n:r.n, malN:r.n * r.k });
        else if(r.typ === 'mellanled' && !r.blandad) lagg('brak-forkorta:rakna', { slag:'forkorta', t:r.t, n:r.n, f:r.k });
        else if(r.typ === 'tecken') lagg('brak-jmf-lika:begrepp', { slag:'tecken', a:r.a, b:r.b, svar:r.svar });
        else if(r.typ === 'mgn') lagg('brak-mgn:rakna', { slag:'mgn', t1:r.t1, n1:r.n1, t2:r.t2, n2:r.n2 });
      });
    });
  });
  return { talBank: function(nod){ return (bank[String(nod)] || []).slice(); } };
})();
