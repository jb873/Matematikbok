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
//  RÄTTNINGEN AV DE KRÄVDA LEDEN I "SKRIV SOM BRÅK" OCH AV "HELTAL OCH BRÅK" (Joachim 2026-11-10)
//  Rena funktioner (värden in, dom ut) — kontrollera anropar dem, och rättar-fuzzen prövar dem direkt.
//  Svarsformen avgörs av den DELADE Likhetsrattare (ffAv + finalStatus); modulen är orörd.
// ============================================================
// ELEVTEXT, godkänd av Joachim 2026-11-10 (v3 FAS 1). Övriga besked är rättarens egna, redan godkända.
var D2_BESKED = { genvagDecBrak: { hint: 'Det där är svaret. Skriv först decimaltalet som bråk.' } };
function d2Besked(orsak){
  return (D2_BESKED[orsak] || {}).hint || (window.Likhetsrattare ? window.Likhetsrattare.formledBesked(orsak) : '');
}
function d2Tom(s){ return String(s == null ? '' : s).replace(/[\s  ]/g, '') === ''; }
// En bråkruta bär ett HELTAL: "7,9" och "7a" är inte 7 (pInt hade läst dem som 7).
function d2Heltal(s){
  var t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(/[−–—]/g, '-');
  return /^-?\d+$/.test(t) ? parseInt(t, 10) : NaN;
}
/* "SKRIV SOM BRÅK I ENKLASTE FORM", tal > 1 (nivå 2, c–f): 1,75 = 175/100 = 7/4.
   Ledet KRÄVS och rättas på värdet; ett led som redan är förkortat är svaret och underkänns (genvägen).
   Svaret är ett bråk i enklaste form, oäkta när talet är > 1 (krav 'brak'); ett oförkortat svar får
   "Rätt värde – förkorta svaret." Led och svar är EN enhet. facit = {t, n} i enklaste form. */
function provaDecBrakKravt(tL, nL, tS, nS, facit){
  var ledFylld = !d2Tom(tL) || !d2Tom(nL), svarFylld = !d2Tom(tS) || !d2Tom(nS);
  if(!ledFylld && !svarFylld) return { status: 'tom', ok: false, ledOk: false, svarOk: false, ledFylld: false, svarFylld: false, orsak: null, besked: '' };
  var R = window.Likhetsrattare, v = facit.t / facit.n;
  var lt = d2Heltal(tL), ln = d2Heltal(nL);
  var ledVarde = ledFylld && isFinite(lt) && isFinite(ln) && ln !== 0 && Math.abs(lt / ln - v) < 1e-9;
  var ledOk = ledVarde && gcd(lt, ln) > 1;
  var st = svarFylld ? R.finalStatus(R.ffAv(0, d2Heltal(tS), d2Heltal(nS)), { k: 'br', t: facit.t, n: facit.n }, 'brak') : { status: 'fel' };
  var svarOk = st.status === 'ratt';
  var orsak = (ledVarde && !ledOk) ? 'genvagDecBrak' : (st.status === 'form' ? st.orsak : null);
  return { status: (ledOk && svarOk) ? 'ratt' : 'fel', ok: ledOk && svarOk, ledOk: ledOk, svarOk: svarOk,
           ledFylld: ledFylld, svarFylld: svarFylld, orsak: orsak, besked: orsak ? d2Besked(orsak) : '' };
}
/* "HELTAL OCH BRÅK" (Räkna med former nivå 1, fråga 1): 3 − 2/3 = 2 1/3. Svaret är exakt i BLANDAD FORM
   (heltalsruta + bråk). Rätt värde i annan form underkänns med rättarens besked: 4,9 eller 49/10 →
   "Rätt värde – skriv svaret i blandad form.", 4 18/20 → "Rätt värde – förkorta svaret.".
   Leden är frivilliga: ett ifyllt led rättas på värdet, och ett led som redan är svaret underkänns
   ("Det där är svaret. Skriv det bara i sista rutan."). ledEls = de synliga ledens .ak8-expr i ordning. */
function provaBlandKedja(ledEls, helS, tS, nS, varde){
  var R = window.Likhetsrattare, v = varde.t / varde.n, fin = { k: 'br', t: varde.t, n: varde.n };
  var cellStatus = ledEls.map(function(){ return null; });
  var fyllda = ledEls.filter(function(e){ return [].some.call(e.querySelectorAll('input'), function(i){ return !d2Tom(i.value); }); });
  var svarFylld = !d2Tom(helS) || !d2Tom(tS) || !d2Tom(nS);
  if(!fyllda.length && !svarFylld) return { status: 'tom', ok: false, svarOk: false, mellanOk: true, cellStatus: cellStatus, orsak: null, besked: '' };
  var mellan = { ok: true, orsak: null };
  fyllda.forEach(function(c){
    var ok = Math.abs(R.mixedEval(c) - v) < 1e-9, o = ok ? null : 'fel';
    if(ok && R.finalStatus(R.finalForm(c), fin, 'blandad').status === 'ratt'){ ok = false; o = 'genvagLed'; }
    cellStatus[ledEls.indexOf(c)] = ok ? 'ok' : 'fel';
    if(!ok && mellan.ok) mellan = { ok: false, orsak: o };
  });
  var st;
  if(!svarFylld) st = { status: 'fel' };
  else if(d2Tom(tS) && d2Tom(nS)){                       // bara heltalsrutan: 4,9 är rätt värde i fel form
    var x = AK8_UI.pNum(helS);
    st = (isFinite(x) && Math.abs(x - v) < 1e-9) ? { status: 'form', orsak: 'blandad' } : { status: 'fel' };
  } else {
    var h = d2Tom(helS) ? 0 : d2Heltal(helS);
    st = isFinite(h) ? R.finalStatus(R.ffAv(h, d2Heltal(tS), d2Heltal(nS)), fin, 'blandad') : { status: 'fel' };
  }
  var svarOk = st.status === 'ratt', ok = svarOk && mellan.ok;
  var orsak = (!mellan.ok && mellan.orsak !== 'fel') ? mellan.orsak : (st.status === 'form' ? st.orsak : null);
  return { status: ok ? 'ratt' : 'fel', ok: ok, svarOk: svarOk, mellanOk: mellan.ok, cellStatus: cellStatus,
           orsak: orsak, besked: orsak ? d2Besked(orsak) : '' };
}
// "+ led"/"− led" i Heltal och bråk: knapparna följer läget (inget dolt led kvar → "+ led" göms;
// inget synligt led → "− led" göms). Ett gömt led ritas om tomt (byggda bråk bort), som i åttans kedja.
function blandKnappar(row){
  var alla = row.querySelectorAll('.ak8-ledwrap').length, extra = row.querySelectorAll('.ak8-ledwrap.ak8-extra').length;
  var mer = row.querySelector('[data-bmer]'), mindre = row.querySelector('[data-bmindre]');
  if(mer) mer.hidden = extra === 0;
  if(mindre) mindre.hidden = (alla - extra) === 0;
}
function blandLedGom(row, w){
  var roll = w.querySelector('[data-r]').getAttribute('data-r'), tmp = document.createElement('span');
  tmp.innerHTML = AK8_UI.ledWrap(roll, 'ak8-extra');
  w.parentNode.replaceChild(tmp.firstChild, w);
  blandKnappar(row);
}
if(typeof window !== 'undefined') window.D2_RATT = { provaDecBrakKravt: provaDecBrakKravt, provaBlandKedja: provaBlandKedja, d2Besked: d2Besked };


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
    // data-mellanled / data-logg-store ur datan (delad hjälpare) — tomt för grupper utan flaggor
    html += '<div class="ovn-grupp"' + (window.AK8_UI && AK8_UI.gruppAttr ? AK8_UI.gruppAttr(grupp) : '') + '>';
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
          // RADENS EGEN FLAGGA (Joachim 2026-11-10): i "Skriv som bråk i enklaste form" på nivå 2 krävs ledet på
          // c–f (talet > 1) men är frivilligt på a–b. data-mellanled på raden går före gruppens (mellanled-grind).
          html += '<div class="ovn-brak-rad brak-svar-rad" data-rad="' + radNummer + '"'
            + (rad.mellanled ? ' data-mellanled="' + rad.mellanled + '"' : '')
            + (rad.mellanled === 'kravt' && rad.frivilligtLed ? ' data-facit-led="' + rad.frivilligtLed.t + '/' + rad.frivilligtLed.n + '"' : '') + '>';
          html += '<span class="ovn-label">' + bokstav + ')</span>';
          html += rad.vanster;
          html += '<span class="ovn-text" style="margin:0 4px;">=</span>';
          if(rad.frivilligtLed){
            // Ledet (35/100). Frivilligt: rättas på värdet om det fylls i, annars inte alls (steg 2b i kontrollera).
            // Krävt (rad.mellanled 'kravt'): rättas ihop med svaret som EN enhet (steg 2 i kontrollera).
            var fl = rad.frivilligtLed;
            html += '<span class="ovn-brak brak-svar-frak brak-friv" data-varde="' + (fl.t / fl.n) + '">'
              + '<input class="ovn-in brak-cell friv-t" data-mellan="' + fl.t + '" inputmode="numeric" autocomplete="off" aria-label="mellanledets täljare">'
              + '<span class="ovn-brak-strecket"></span>'
              + '<input class="ovn-in brak-cell friv-n" data-mellan="' + fl.n + '" inputmode="numeric" autocomplete="off" aria-label="mellanledets nämnare"></span>'
              + '<span class="ovn-text" style="margin:0 4px;">=</span>';
          }
          if(blad.mellanled){
            html += kladd + '<span class="ovn-text" style="margin:0 4px;">=</span>';
          }
          html += svarBrakHTML(rad.svar);
          html += '</div>';
        }
        return;
      }

      if(rad.typ === 'blandKedja'){
        // HELTAL OCH BRÅK (Räkna med former nivå 1, fråga 1 — Joachim 2026-11-10): uppgift = svar i blandad
        // form (heltalsruta + bråk). Ledet är FRIVILLIGT: två led ligger dolda bakom "+ led" (åttans
        // uttrycksceller, samma som formkedjan) och rättas på värdet om de fylls i; ett led som redan är svaret
        // underkänns. Knapparnas text är kedjans egen (AK8_UI) — attributen byts, så att den delade "+ led"-
        // logiken (som kräver två synliga led) inte tar raden.
        var knappar = AK8_UI.kedjaRadHTML(0, '').match(/<button[\s\S]*<\/button>/)[0]
          .replace('data-mer', 'data-bmer').replace('data-mindre', 'data-bmindre');
        html += '<div class="ovn-brak-rad ak8-rad ak8-rad-kedja ak8-lana bland-kedja" data-rad="' + radNummer + '" data-logg="' + rad.logg + '"'
          + ' data-mellanled="frivilligt" data-varde="' + rad.varde.t + '/' + rad.varde.n + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span><span class="ak8-q">' + rad.vansterHTML + '</span>';
        html += AK8_UI.ledWrap('L0', 'ak8-extra') + AK8_UI.ledWrap('L1', 'ak8-extra');
        html += '<span class="bland-svar"><span class="ovn-text ak8-eq">=</span>' + svarBrakHTML(rad.svar) + '</span>';
        html += knappar + '</div>';
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

      if(rad.typ === 'formKedja'){
        // FORMKEDJAN: uppgift = mellanled (+ tillagda led) = svar, i åttans DELADE fria kedja
        // (AK8_UI.kedjaRadHTML): L0 + L1 synliga, L2/L3 bakom "+ led" (knapparna och deras text är
        // kedjans egna). Raden får d2:s attribut, och varje cell sitt facit i data-visa (K-B): L0 ett
        // korrekt led, de övriga svaret — den sista ifyllda cellen är svaret.
        // Bokstaven står FÖRE kedjans frågefält (.ak8-q), som radens eget barn — som på d2:s övriga rader
        // (mellanrum och placering ur sjuans .ovn-label). Inuti frågefältet låg den tätt mot talet ("b)0,7").
        var kedja = AK8_UI.kedjaRadHTML(radNummer, rad.vansterHTML)
          .replace(/^<div class="ak8-rad ak8-rad-kedja ak8-lana" data-idx="\d+">/,
            '<div class="ovn-brak-rad ak8-rad ak8-rad-kedja ak8-lana form-kedja" data-rad="' + radNummer + '" data-logg="' + rad.logg + '"'
            + ' data-formled="' + encodeURIComponent(JSON.stringify(rad.uppg)) + '"><span class="ovn-label">' + bokstav + ')</span>')
          .replace('data-r="L0"', 'data-r="L0" data-visa="' + rad.facitLed + '"');
        ['L1', 'L2', 'L3'].forEach(function(r){ kedja = kedja.replace('data-r="' + r + '"', 'data-r="' + r + '" data-visa="' + rad.facitSvar + '"'); });
        html += kedja;
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
      var bk = inp.closest('.bland-kedja');
      if(bk){   // Heltal och bråk: hela raden är en enhet — markering, facit och rutornas färg bort
        AK8_UI.rensaRad(bk);
        bk.querySelectorAll('.brak-cell').forEach(function(c){ c.classList.remove('correct','wrong'); });
      } else if(inp.classList.contains('brak-cell')){
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
  // Knappsats – delad AK8_UI-bindning (fokus-följning, kontext-gråning, ⌫, Enter→nästa ruta).
  // Formkedjans celler bygger staplade bråk med bråkknappen → åttans fulla bindning (bindSheet: bråk-
  // och potensbyggare, ⌫ ur ett byggt bråk, räknesätt ur bråkfältet, auto-mellanslag). Övriga blad som förr.
  if(window.AK8_UI && AK8_UI.bindSheet && rotEl.querySelector('.form-kedja, .bland-kedja')) AK8_UI.bindSheet(rotEl, {focus: false});
  else if(window.AK8_UI && AK8_UI.bindKeypad) AK8_UI.bindKeypad(rotEl);

  // Heltal och bråk: "+ led" visar nästa dolda led, "− led" gömmer och tömmer det senast tillagda.
  // Lyssnarna sitter på radens egna element (nya vid varje ritning) — de staplas inte vid Nytt blad.
  rotEl.querySelectorAll('.bland-kedja').forEach(function(row){
    var mer = row.querySelector('[data-bmer]'), mindre = row.querySelector('[data-bmindre]');
    mer.addEventListener('click', function(){
      var d = row.querySelector('.ak8-ledwrap.ak8-extra'); if(!d) return;
      d.classList.remove('ak8-extra'); var i0 = d.querySelector('input'); if(i0){ AK8_UI.grow(i0); i0.focus(); }
      AK8_UI.rensaRad(row); blandKnappar(row);
    });
    mindre.addEventListener('click', function(){
      var syn = row.querySelectorAll('.ak8-ledwrap:not(.ak8-extra)'); if(!syn.length) return;
      blandLedGom(row, syn[syn.length - 1]); AK8_UI.rensaRad(row);
      // fokus till det senaste synliga ledet, annars svarets första ruta — keypaden ska ha en levande ruta
      var kvar = row.querySelectorAll('.ak8-ledwrap:not(.ak8-extra) .ak8-in');
      var f = kvar.length ? kvar[kvar.length - 1] : row.querySelector('.bland-svar input'); if(f) f.focus();
    });
    row.addEventListener('input', function(){ row.querySelectorAll('.bland-svar .brak-cell').forEach(function(c){ c.classList.remove('correct','wrong'); }); });
    blandKnappar(row);
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
      // KRÄVT LED (nivå 2, c–f): led och svar är EN enhet — provaDecBrakKravt dömer, beskedet säger vad.
      if(row.dataset.mellanled === 'kravt'){
        // Saknas ledets rutor (ska inte hända — då är raden fel byggd) rättas ledet som tomt, utan krasch.
        var ledRutor = [row.querySelector('.friv-t'), row.querySelector('.friv-n')].filter(Boolean);
        ledRutor.forEach(function(c){ c.classList.remove('correct','wrong','just-checked'); });
        var lv = function(k){ var c = row.querySelector('.friv-' + k); return c ? c.value : ''; };
        var rk = provaDecBrakKravt(lv('t'), lv('n'), tIn.value, nIn.value, { t: parseInt(row.dataset.t, 10), n: parseInt(row.dataset.n, 10) });
        if(rk.status === 'tom') return;                    // obesvarad: räknas i nämnaren, ingen markering
        ledRutor.forEach(function(c){ if(!d2Tom(c.value)) c.classList.add(rk.ledOk ? 'correct' : 'wrong', 'just-checked'); });
        [tIn, nIn].forEach(function(c){ if(!d2Tom(c.value)) c.classList.add(rk.svarOk ? 'correct' : 'wrong', 'just-checked'); });
        var mkK = marker(rk.ok), ankK = row.querySelector('.brak-svar');
        ankK.insertAdjacentElement('afterend', mkK);
        if(rk.ok) ratt++;
        else {
          var fK = document.createElement('span'); fK.className = 'ovn-fasit';
          fK.textContent = (rk.besked ? rk.besked + ' ' : '') + 'rätt svar: ' + row.dataset.facitLed + ' = ' + row.dataset.facit;
          mkK.insertAdjacentElement('afterend', fK);
        }
        setTimeout(function(){ row.querySelectorAll('.brak-cell').forEach(function(b){ b.classList.remove('just-checked'); }); }, 500);
        return;
      }
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

    // 2b) Frivilligt mellanled (decimaltal som bråk, Joachim 2026-10-26): ett tomt led är varken fel eller
    //     räknas i nämnaren. Ett ifyllt led rättas på VÄRDET — 35/100 och 70/200 är båda rätt för 0,35.
    rotEl.querySelectorAll('.brak-friv').forEach(function(led){
      if(led.closest('[data-mellanled="kravt"]')) return;   // krävt led: rättat ihop med svaret i steg 2
      var t = led.querySelector('.friv-t'), n = led.querySelector('.friv-n');
      [t, n].forEach(function(c){ c.classList.remove('correct','wrong','just-checked'); });
      if(String(t.value).trim() === '' && String(n.value).trim() === '') return;
      totalt++;
      var vt = AK8_UI.pInt(t.value), vn = AK8_UI.pInt(n.value);
      var ok = !isNaN(vt) && !isNaN(vn) && vn !== 0 && Math.abs(vt / vn - parseFloat(led.dataset.varde)) < 1e-9;
      if(ok) ratt++;
      [t, n].forEach(function(c){ if(String(c.value).trim() !== '') c.classList.add(ok ? 'correct' : 'wrong'); });
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

    // 4) Formkedjor (Räkna med former): mellanled, tillagda led och svar rättas som EN enhet av den
    //    delade Likhetsrattare.provaFormledKedja. Beskedet säger vad som är fel; facit visar ett korrekt
    //    led och svaret. Cellerna bakom "+ led" som inte lagts till räknas inte.
    var formRader = [];
    blad.grupper.forEach(function(g){ g.rader.forEach(function(r){ if(r.typ === 'formKedja') formRader.push(r); }); });
    rotEl.querySelectorAll('.form-kedja').forEach(function(row, i){
      AK8_UI.rensaRad(row);
      totalt++;
      var celler = AK8_UI.kedjaCeller(row).filter(function(e){ return !e.closest('.ak8-extra'); });
      var uppg = JSON.parse(decodeURIComponent(row.dataset.formled));
      var r = window.Likhetsrattare.provaFormledKedja(celler, uppg);
      if(r.status === 'tom') return;                       // obesvarad: räknas i nämnaren, ingen markering
      celler.forEach(function(c, k){
        var st = r.cellStatus[k]; if(!st) return;          // tom cell: ingen markering
        c.querySelectorAll('.ak8-in').forEach(function(inp){ if(String(inp.value).trim() !== '') inp.classList.add(st === 'ok' ? 'ak8-ok' : 'ak8-fel'); });
      });
      AK8_UI.markera(row, r.ok);
      if(r.ok) ratt++;
      else {
        var besked = r.besked && uppg.ejExakt ? r.besked.replace('{brak}', rk_brakHTML(uppg.ejExakt.t, uppg.ejExakt.n)) : r.besked;
        var fs = document.createElement('span'); fs.className = 'ak8-fasit ovn-fasit';   // åttans rensning, sjuans röda ruta
        fs.innerHTML = (besked ? besked + ' ' : '') + 'rätt: ' + formRader[i].facitHTML;
        row.appendChild(fs);
      }
      AK8_UI.loggaForstaForsoket(row, window.MasteryK2, row.dataset.logg, r.ok);   // första försöket per rad
    });

    // 5) Heltal och bråk (Räkna med former nivå 1, fråga 1): svar i blandad form, frivilliga led.
    //    provaBlandKedja dömer; loggning som formkedjan (första försöket per rad, k2-storen).
    rotEl.querySelectorAll('.bland-kedja').forEach(function(row){
      AK8_UI.rensaRad(row);
      var celler = row.querySelectorAll('.bland-svar .brak-cell');
      celler.forEach(function(c){ c.classList.remove('correct','wrong','just-checked'); });
      totalt++;
      var leds = AK8_UI.kedjaCeller(row).filter(function(e){ return !e.closest('.ak8-extra'); });
      var h = row.querySelector('.bland-svar .brak-hel'), t = row.querySelector('.bland-svar .brak-t'), n = row.querySelector('.bland-svar .brak-n');
      var vd = row.dataset.varde.split('/');
      var r = provaBlandKedja(leds, h.value, t.value, n.value, { t: parseInt(vd[0], 10), n: parseInt(vd[1], 10) });
      if(r.status === 'tom') return;                       // obesvarad: räknas i nämnaren, ingen markering
      leds.forEach(function(c, k){
        var st = r.cellStatus[k]; if(!st) return;
        c.querySelectorAll('.ak8-in').forEach(function(inp){ if(!d2Tom(inp.value)) inp.classList.add(st === 'ok' ? 'ak8-ok' : 'ak8-fel'); });
      });
      celler.forEach(function(c){ if(!d2Tom(c.value)) c.classList.add(r.svarOk ? 'correct' : 'wrong'); });
      AK8_UI.markera(row, r.ok);
      if(r.ok) ratt++;
      else {
        var fb = document.createElement('span'); fb.className = 'ak8-fasit ovn-fasit';
        fb.innerHTML = (r.besked ? r.besked + ' ' : '') + 'rätt: <span class="form-facit">' + rk_brakHTML(parseInt(vd[0], 10), parseInt(vd[1], 10)) + '</span>';
        row.appendChild(fb);
      }
      AK8_UI.loggaForstaForsoket(row, window.MasteryK2, row.dataset.logg, r.ok);
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
      if(blad.tabId && (blad.niva === undefined || blad.niva === 1)) markeraKlar(blad.tabId);
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
      lsSet('brak2_naddNiva' + nastaNiva + '_' + blad.tabId, '1');
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
    // Formkedjans celler: byggda bråk bort, en tom textruta kvar (cellens startläge); tillagda led
    // göms igen och knapparna går tillbaka till startläget (ett led + svar).
    rotEl.querySelectorAll('.form-kedja').forEach(function(row){
      AK8_UI.rensaRad(row);
      row.querySelectorAll('.ak8-expr').forEach(function(e){
        e.querySelectorAll('[data-byggd]').forEach(function(w){ w.remove(); });
        var txt = e.querySelectorAll('.ak8-exprtxt');
        for(var k = 1; k < txt.length; k++) txt[k].remove();
        if(txt[0]){ txt[0].value = ''; AK8_UI.grow(txt[0]); }
      });
      [].slice.call(row.querySelectorAll('.ak8-ledwrap')).forEach(function(w, k){ if(k >= 2) w.classList.add('ak8-extra'); });
      var mer = row.querySelector('[data-mer]'), mindre = row.querySelector('[data-mindre]');
      if(mer) mer.hidden = false;
      if(mindre) mindre.hidden = true;
    });
    // Heltal och bråk: de tillagda leden göms och töms igen (startläget: uppgift = svar).
    rotEl.querySelectorAll('.bland-kedja').forEach(function(row){
      AK8_UI.rensaRad(row);
      row.querySelectorAll('.ak8-ledwrap').forEach(function(w){ blandLedGom(row, w); });
    });
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
// Bråk-rad: decimaltal visas, eleven skriver bråket i enklaste form (återanvänder brakSvar).
// FRIVILLIGT MELLANLED (Joachim 2026-10-26): 0,35 = 35/100 = 7/20, men 0,35 = 7/20 godtas också. Ledet är
// decimaltalet som tiondels-, hundradels- eller tusendelsbråk; ett ifyllt led rättas på VÄRDET, ett tomt led
// är varken fel eller räknas. Gruppen bär mellanled: 'frivilligt' i datan.
// NIVÅ 2 (Joachim 2026-11-10): ENKLASTE FORM ÄR ALDRIG BLANDAD FORM. Ett tal > 1 får svaret som oäkta bråk
// (1,75 = 175/100 = 7/4), utan heltalsruta, och ledet KRÄVS: krav 'kravt' på raden. a–b (talet < 1) bär
// 'frivilligt' på raden. Radens flagga går före gruppens. Nivå 1 (bara tal < 1) är oförändrad: krav saknas.
function radDecBrak(t, n, dec, krav){
  var d = (String(dec).split(',')[1] || '').length, N = Math.pow(10, d), T = Math.round(parseFloat(String(dec).replace(',', '.')) * N);
  var g = gcd(t, n);
  var r = {typ:'brakSvar', vanster:'<span class="ovn-text ovn-num">' + dec + '</span>',
    svar: krav === 'kravt' ? {hel: 0, t: t / g, n: n / g} : kanonisk(t, n), opnd:{slag:'decBrak', t:t, n:n, dec:dec},
    frivilligtLed: {t: T, n: N}};
  if(krav) r.mellanled = krav;
  return r;
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
// BARA NÄMNARE VARS DECIMALFORM INTE TAR SLUT (tredjedelar). Ett tal som går jämnt ut skrivs exakt med =.
var RUND1 = [ [1,3, 0.33, '0,33', '0,33|0,3'], [2,3, 0.67, '0,67', '0,67|0,7'] ];
// Nivå 2 får även tredjedels-tal > 1 som avrundas i bråk→decimal-riktningen
var RUND2 = RUND1.concat([
  [10,3, 3.33, '3,33', '3,33|3,3'], [11,3, 3.67, '3,67', '3,67|3,7']
]);
// 9/8 och 11/8 GÅR JÄMNT UT (Joachim 2026-11-10, v3 fråga A): förr bland de avrundade (≈ 1,13 och ≈ 1,38,
// och det exakta 1,125 underkändes). Nu exakta med =, svaren 1,125 och 1,375. Bara bråk→decimal-riktningen:
// talen hör inte till "Skriv som bråk", vars tal > 1 är TERM2_OAKTA.
var BD2_EXAKT_EXTRA = [ [9,8,'1,125'], [11,8,'1,375'] ];

function rundRad(p){ return radBrakDec(p[0], p[1], p[2], '≈', p[4]); }

// Plocka k unika element ur en lista (utan återläggning)
function gSample(arr, k){
  var kopia = arr.slice();
  for(var i = kopia.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = kopia[i]; kopia[i] = kopia[j]; kopia[j] = t; }
  return kopia.slice(0, k);
}

// Bygg ett blad ur poolerna för given nivå
// "SKRIV SOM BRÅK" PÅ NIVÅ 2 HAR FAST UPPSTÄLLNING (Joachim 2026-11-10), även efter Nytt blad: a–b tal < 1
// (TERM1 + åttondelar, ledet frivilligt), c–f tal > 1 (TERM2_OAKTA, ledet krävs, svaret oäkta bråk).
var DB2_UNDER = TERM1.concat(TERM2_ATTON);
function bladBTform(niva, forsta){
  var bdPool = niva === 2 ? TERM2.concat(BD2_EXAKT_EXTRA) : TERM1;
  var rund   = niva === 2 ? RUND2 : RUND1;
  var bd, rd, db;
  if(forsta){
    // Representativ, fast första uppsättning per nivå
    if(niva === 1){
      bd = [[1,2,'0,5'],[3,4,'0,75'],[2,5,'0,4'],[7,10,'0,7']];
      rd = [RUND1[0], RUND1[1]];
      db = [[1,2,'0,5'],[1,4,'0,25'],[4,5,'0,8'],[3,5,'0,6'],[1,5,'0,2'],[3,10,'0,3']];
    } else {
      bd = [[5,8,'0,625'],[3,8,'0,375'],[5,4,'1,25'],[7,5,'1,4']];
      rd = [RUND2[0], gPick([RUND2[2],RUND2[3]])];
      db = { under: [[1,8,'0,125'],[7,8,'0,875']], over: [[7,4,'1,75'],[7,2,'3,5'],[6,5,'1,2'],[5,2,'2,5']] };
    }
  } else {
    bd = gSample(bdPool, 4);
    rd = gSample(rund, 2);
    db = niva === 2 ? { under: gSample(DB2_UNDER, 2), over: gSample(TERM2_OAKTA, 4) } : gSample(TERM1, 6);
  }
  var dbRader = niva === 2
    ? db.under.map(function(p){ return radDecBrak(p[0], p[1], p[2], 'frivilligt'); })
        .concat(db.over.map(function(p){ return radDecBrak(p[0], p[1], p[2], 'kravt'); }))
    : db.map(function(p){ return radDecBrak(p[0], p[1], p[2]); });
  return {
    titel: 'Bråk ↔ decimal – nivå ' + niva,
    keypadOps: [','],
    grupper: [
      {rubrik:'Skriv bråket som decimaltal', rader:
        bd.map(function(p){ return radBrakDec(p[0], p[1], avr(p[0]/p[1], 6)); })
        .concat(rd.map(function(p){ return rundRad(p); }))},
      {rubrik:'Skriv som bråk i enklaste form', mellanled:'frivilligt', rader: dbRader}
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
// (Talpoolerna BL_N1/BL_N2 och radBrakDec2 användes bara av det gamla samlingstestet — borttagna 2026-11-10.)

// Bråk visas, eleven skriver blandad form (brakSvar med blandat svar)
function radBrakBlandad(t, n){
  return {typ:'brakSvar', vanster: fracSpan(t, n), likhet:true, svar: kanonisk(t, n)};
}
// Bråk visas, eleven fyller i BÅDE decimal och blandad form
function radBlandadBada(t, n){
  return {typ:'brakTillBanda', taljare:t, namnare:n, decSvar: avr(t/n, 6), brakSvar: kanonisk(t, n)};
}

  + 'I bråkform skriver du bara täljare och nämnare (t.ex. 7/4).';

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
  return {typ:'brakSvar', vanster: mixedSpan({hel:hel, t:t, n:n}), likhet:true, svar:{hel:0, t:o.t, n:o.n}, opnd:{slag:'blandadOakta', hel:hel, t:t, n:n}};
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
    titel: 'Blandad form och bråkform – nivå ' + niva,
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
// ----- FORMKEDJAN (båda nivåerna — Joachims beslut 2026-10-10, piloten + v2) -----
// Gäller alla grupper utom "Heltal och bråk" på nivå 1, som har svar i blandad form (radBlandKedja nedan).
// Uppgift = mellanled = svar. EN väg per uppgift, avgjord av talen: går båda talen att skriva exakt i
// decimalform räknar eleven med decimaltal (heltalet står kvar, 3 − 0,8); annars skrivs båda om till
// bråk med gemensam nämnare (vilken som helst; heltalet som bråk 9/3; blandad form godtas i ledet).
// Svaret är exakt och i ledets form; bråksvar > 1 i blandad form. Inget avrundat, inget ≈.
// "+ led": det första ledet är obligatoriskt, eleven får lägga till fler (9/3 − 1/3 = 8/3 = 2 2/3).
// Rättas av den delade Likhetsrattare.provaFormledKedja. Raden loggar till räknesättets nod (brak-add/-sub).
// Talpoolerna: bråkvägens minsta gemensamma nämnare högst 30 (rad.mgn; spec-fuzz-k2-blad.js vaktar).
function rk_lcm(a, b){ return a / gcd(a, b) * b; }
// 'brak' när något bråk (äkta, oäkta eller blandat) i förkortad form har en nämnare med andra faktorer än 2 och 5
function rk_formVag(L, R){
  return [L, R].some(function(term){
    if(term[0] !== 'frac' && term[0] !== 'imp' && term[0] !== 'mixed') return false;
    var f = rk_toFrac(term);
    return !rk_isFiniteDec(f.n / gcd(f.t, f.n));
  }) ? 'brak' : 'dec';
}
function rk_decText(t, n){ return String(Math.round(t / n * 1e9) / 1e9).replace('.', ',').replace('-', '−'); }
// Exakt bråk som visas: blandad form när det är större än 1, tecknet först (K-H staplat, K-I tätt)
function rk_brakHTML(t, n){ return (t < 0 ? '<span class="ovn-text ovn-num">−</span>' : '') + mixedSpan(kanonisk(Math.abs(t), n)); }
function rk_brakText(t, n){ return (t < 0 ? '−' : '') + mixedText(kanonisk(Math.abs(t), n)); }
function radFormKedja(L, op, R){
  var fL = rk_toFrac(L), fR = rk_toFrac(R), minus = (op === '−' || op === '-'), opTxt = minus ? '−' : '+';
  var ct = fL.t * fR.n + (minus ? -1 : 1) * fR.t * fL.n, cn = fL.n * fR.n, g = gcd(ct, cn);
  var varde = {t: ct / g, n: cn / g}, vag = rk_formVag(L, R);
  // Bråkvägens MINSTA gemensamma nämnare: talen i förkortad form (0,375 = 3/8, inte 375/1000)
  var rL = {t: fL.t / gcd(fL.t, fL.n), n: fL.n / gcd(fL.t, fL.n)}, rR = {t: fR.t / gcd(fR.t, fR.n), n: fR.n / gcd(fR.t, fR.n)};
  var mgn = rk_lcm(rL.n, rR.n);
  var led, ledText, svar, svarText;
  if(vag === 'dec'){
    var dL = rk_decText(fL.t, fL.n), dR = rk_decText(fR.t, fR.n);
    ledText = dL + ' ' + opTxt + ' ' + dR;
    led = '<span class="ovn-text ovn-num">' + dL + '</span>' + opSpan(opTxt) + '<span class="ovn-text ovn-num">' + dR + '</span>';
    svarText = rk_decText(varde.t, varde.n);
    svar = '<span class="ovn-text ovn-num">' + svarText + '</span>';
  } else {
    var N = mgn, tL = rL.t * N / rL.n, tR = rR.t * N / rR.n;
    ledText = tL + '/' + N + ' ' + opTxt + ' ' + tR + '/' + N;
    led = fracSpan(tL, N) + opSpan(opTxt) + fracSpan(tR, N);
    svarText = rk_brakText(varde.t, varde.n);
    svar = rk_brakHTML(varde.t, varde.n);
  }
  // Talet som inte går att skriva exakt i decimalform — till beskedet ("1/3 går inte att skriva exakt …")
  var ejExakt = null;
  if(vag === 'brak') [L, R].some(function(term){
    if(term[0] === 'int' || term[0] === 'dec') return false;
    var f = rk_toFrac(term), gg = gcd(f.t, f.n);
    if(rk_isFiniteDec(f.n / gg)) return false;
    ejExakt = {t: f.t / gg, n: f.n / gg}; return true;
  });
  return {typ:'formKedja', vansterHTML: rk_uttryckHTML(L, op, R), logg: minus ? 'brak-sub:rakna' : 'brak-add:rakna', mgn: mgn,
    uppg: {termer: [fL, fR], ops: [opTxt], vag: vag, varde: varde, ejExakt: ejExakt},
    // facit hålls ihop (K-D: ett uttryck bryts inte mitt i) — beskedet före får bryta, uttrycket inte
    facitLed: ledText, facitSvar: svarText, facitHTML: '<span class="form-facit">' + led + opSpan('=') + svar + '</span>'};
}

// ----- HELTAL OCH BRÅK (nivå 1, fråga 1 — Joachim 2026-11-10) -----
// Svaret är ALLTID exakt i blandad form, oavsett talen (3 − 2/3 = 2 1/3, 5 − 1/10 = 4 9/10, 4 + 1/5 = 4 1/5):
// gruppen följer inte formkedjans väg-regel. Svarsrutor för blandad form (heltal + bråk); ledet är frivilligt
// (mellanled: 'frivilligt'). Rättas av provaBlandKedja; loggar till räknesättets nod som formkedjan.
function radBlandKedja(L, op, R){
  var fL = rk_toFrac(L), fR = rk_toFrac(R), minus = (op === '−' || op === '-'), opTxt = minus ? '−' : '+';
  var ct = fL.t * fR.n + (minus ? -1 : 1) * fR.t * fL.n, cn = fL.n * fR.n, g = gcd(ct, cn);
  var varde = {t: ct / g, n: cn / g};
  var rL = fL.n / gcd(fL.t, fL.n), rR = fR.n / gcd(fR.t, fR.n);
  return {typ:'blandKedja', vansterHTML: rk_uttryckHTML(L, op, R), logg: minus ? 'brak-sub:rakna' : 'brak-add:rakna',
    mellanled: 'frivilligt', mgn: rk_lcm(rL, rR), varde: varde, svar: kanonisk(varde.t, varde.n),
    uppg: {termer: [fL, fR], ops: [opTxt], varde: varde}, facitSvar: rk_brakText(varde.t, varde.n)};
}

// ----- TALPOOLER -----
// Varje element: [L-term, op, R-term]

// Nivå 1, Grupp 1: heltal ± äkta bråk — VARJE svar i blandad form (heltal > 0 och en bråkdel).
// Bort 2026-11-10: 1 − 2/3 (= 1/3, inte blandad form). spec-fuzz-k2-blad.js vaktar.
var RK_G1_N1 = [
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

// Nivå 2, Grupp 1: bråk med tredjedel ± decimal — bråkvägen, exakt svar i bråkform (7/30)
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

// Nivå 2, Grupp 2: decimal ± exakt bråk (åtton- och femtedelar, alla positiva)
// GEMENSAM NÄMNARE HÖGST 30 (Joachim 2026-10-10): bråkvägens minsta gemensamma nämnare får inte gå
// över 30, även i decimalvägens uppgifter. Bort: 0,8 − 1/8, 0,9 − 3/8 och 0,6 + 1/8 (fyrtiondelar).
// Vaktas av verktyg/spec-fuzz-k2-blad.js mot spec-villkor-k2.js (BLAD).
var RK_G2_N2 = [
  [['dec','0,4'], '−', ['frac',1,5]],
  [['dec','0,5'], '−', ['frac',1,8]],
  [['dec','0,375'], '+', ['frac',1,4]],
  [['frac',3,8],  '+', ['dec','0,25']],
  [['dec','0,625'], '−', ['frac',1,4]],
  [['frac',5,8],  '−', ['dec','0,5']],
  [['frac',7,8],  '−', ['dec','0,5']],
  [['dec','0,75'], '−', ['frac',1,8]],
  [['frac',3,8],  '+', ['dec','0,5']],
  [['dec','0,7'], '−', ['frac',1,5]],
  [['frac',5,8],  '−', ['dec','0,25']]
];

// Nivå 2, Grupp 3: blandad/oäkta − blandad/oäkta. INGA NEGATIVA SVAR (Joachim 2026-11-10: för svårt i sjuan):
// de sex som gav negativt svar är vända så att det större talet står först (1 4/5 − 2 1/4 → 2 1/4 − 1 4/5).
// spec-fuzz-k2-blad.js vaktar (BLAD 'k2:ejNegativ').
var RK_G3_N2 = [
  [['mixed',3,3,4], '−', ['mixed',1,3,8]],
  [['mixed',2,1,4], '−', ['mixed',1,4,5]],     // vänd
  [['imp',7,5],     '−', ['frac',3,4]],        // vänd
  [['mixed',2,1,2], '−', ['mixed',1,3,4]],
  [['imp',9,4],     '−', ['mixed',1,1,2]],
  [['mixed',2,1,2], '−', ['mixed',1,1,4]],     // vänd
  [['mixed',3,1,5], '−', ['mixed',1,3,4]],
  [['imp',9,4],     '−', ['mixed',1,1,2]],     // vänd (samma uppgift som rad 5 — se rapporten)
  [['imp',11,4],    '−', ['mixed',1,3,8]],
  [['mixed',2,3,8], '−', ['mixed',1,1,4]],
  [['mixed',2,1,2], '−', ['mixed',1,2,5]],     // vänd
  [['imp',7,4],     '−', ['mixed',1,5,8]],
  [['mixed',3,1,2], '−', ['mixed',1,7,8]],
  [['mixed',2,1,4], '−', ['mixed',1,1,8]]      // vänd
];

// RUBRIKERNA per nivå och grupp, som rubrik-fält (elevtext-låset ser var och en).
// Godkända av Joachim 2026-11-10 (v3): svarsformen står i rubriken. Fråga 2 på nivå 2 utan parentes.
var RK_RUBRIK = {
  1: [ { rubrik: 'Heltal och bråk – svara i blandad form' },
       { rubrik: 'Decimaltal och bråk – svara i decimalform' },
       { rubrik: 'Blandad form och oäkta bråk – svara i decimalform' } ],
  2: [ { rubrik: 'Bråk och decimaltal med tredjedelar – svara i bråkform' },
       { rubrik: 'Decimaltal och bråk' },
       { rubrik: 'Blandad form och oäkta bråk – svara i decimalform' } ]
};

function bladRakna(niva, forsta){
  var p1 = niva === 2 ? RK_G1_N2 : RK_G1_N1;
  var p2 = niva === 2 ? RK_G2_N2 : RK_G2_N1;
  var p3 = niva === 2 ? RK_G3_N2 : RK_G3_N1;
  var a, b, c;
  if(forsta){
    if(niva === 1){
      a = [RK_G1_N1[13], RK_G1_N1[8], RK_G1_N1[10]];                  // 3−2/3, 5−1/10, 4+1/5 (Joachims exempel)
      b = [RK_G2_N1[0], RK_G2_N1[1], RK_G2_N1[2]];                    // 0,5+1/5, 3/4−0,3, 3/4+1,1
      c = [RK_G3_N1[0], RK_G3_N1[1], RK_G3_N1[2]];                    // 1 2/5−0,65, 8/5−1 1/4, 2 1/4−0,75
    } else {
      a = [RK_G1_N2[0], RK_G1_N2[1], RK_G1_N2[2]];                    // 1/3−0,1, 0,7−2/3, 0,5+1/3
      b = [RK_G2_N2[0], RK_G2_N2[1], RK_G2_N2[2]];                    // 0,4−1/5, 0,5−1/8, 0,375+1/4
      c = [RK_G3_N2[0], RK_G3_N2[1], RK_G3_N2[2]];                    // 3 3/4−1 3/8, 2 1/4−1 4/5, 7/5−3/4
    }
  } else {
    a = gSample(p1, 3);
    b = gSample(p2, 3);
    c = gSample(p3, 3);
  }
  // FORMKEDJAN i alla grupper utom "Heltal och bråk" på nivå 1: mellanledet krävs (flaggan i datan, inte i
  // rubriken), svaret är exakt, vägen följer talen. "Heltal och bråk" (Joachim 2026-11-10): svar i blandad
  // form, ledet frivilligt (radBlandKedja). Alla rader loggar i k2-storen.
  function grupp(nr, tal){
    var bland = niva === 1 && nr === 0;
    // Rubriken TILLDELAS (inte som fält med ett uttryck): elevtext-låset läser då bara RK_RUBRIK.
    var g = { mellanled: bland ? 'frivilligt' : 'kravt', loggStore: 'k2',
      rader: tal.map(function(t){ return bland ? radBlandKedja(t[0], t[1], t[2]) : radFormKedja(t[0], t[1], t[2]); }) };
    g.rubrik = RK_RUBRIK[niva][nr].rubrik;
    return g;
  }
  return {
    titel: 'Räkna med former – nivå ' + niva,
    keypadOps: niva === 2 ? [',', '-'] : [','],
    grupper: [ grupp(0, a), grupp(1, b), grupp(2, c) ]
  };
}
function GRUND_RAKNA_N1(){ return bladRakna(1, true); }
function GEN_RAKNA_N1(){ return bladRakna(1, false); }
function GRUND_RAKNA_N2(){ return bladRakna(2, true); }
function GEN_RAKNA_N2(){ return bladRakna(2, false); }

// DEL 4, sidans gamla samlingstest (bladTest), togs bort 2026-11-10 (v3): sidan hade ingen yta för det
// (#sheet-test saknas — testfliken leder till kapitlets provbyggare), och det var den sista användaren av
// den avrundande räkna-raden (≈). Verifierat att inget annat i repot använde testet eller dess talpooler.

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
                      2: { grund: GRUND_RAKNA_N2,   gen: GEN_RAKNA_N2 } } }
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
    blad.nivaAntal = Object.keys(def.nivaer).length;   // antalet steg är DATA, inte två hårdkodade knappar
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
byggSheet('btform', true);
byggSheet('blandad', true);
byggSheet('rakna', true);

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
window.BLAD_K2_D2 = (function(){
  var bank = {};
  function lagg(nod, post){ (bank[nod] = bank[nod] || []).push(post); }
  var byggare = [];
  ['GRUND_BTFORM_N1','GRUND_BTFORM_N2','GRUND_BL_N1','GRUND_BL_N2','GRUND_RAKNA_N1','GRUND_RAKNA_N2'].forEach(function(namn){
    if(typeof window[namn] === 'function') byggare.push(window[namn]);
  });
  byggare.forEach(function(bygg){
    var b; try { b = bygg(); } catch(e){ return; }
    (b.grupper || []).forEach(function(g){
      (g.rader || []).forEach(function(r){
        if(r.typ === 'brakTillDec') lagg('bd-vaxla:rakna', { slag:'brakDec', t:r.taljare, n:r.namnare, dec:r.svar });
        else if(r.opnd && r.opnd.slag === 'decBrak') lagg('bd-tillbrak:rakna', r.opnd);
        else if(r.opnd && r.opnd.slag === 'blandadOakta') lagg('brak-blandad:rakna', r.opnd);
      });
    });
  });
  return { talBank: function(nod){ return (bank[String(nod)] || []).slice(); } };
})();
