/* ============================================================
   BLAD-MOTORN · HELTALS-SLÄKTEN — DELAD KÄRNA (blad-karna-b.js)
   ------------------------------------------------------------
   Sjuans arbetsblad har TVÅ släkter med olika kärna. Slå inte ihop dem.

   · Bråk-släkten   → blad-karna.js  (bruten ur ak7/k1/d4). Bärs av
     ak7/k1/d4, ak7/k2/d2, d3, d5, d6 och åttans nio k1-sidor.
     Radtyper: brakSvar, brakTillDec, rakna, brakSaknad, brakTillBanda,
     brakForlang (+ enkel, lucka, problem).
   · Heltals-släkten → DENNA FIL (bruten ur blad-k1-d5.js, 2026-09-19).
     Bärs av ak7/k1/d1, d2, d3, d5, d6, d7, d8, d10 och ak7/k3/d1, d7.
     Radtyper: enkel, lucka, mellan, problem (+ per blad: problemTid,
     brak, brakLucka, text, tvatal, term, ordna, talfoljd, …).

   Varför två kärnor: släkterna delar ursprung (enkel/lucka har samma
   markup) men har drivit isär i problem-radens elevtext (placeholder)
   och i visaKonfetti; bråk-släkten har dessutom k2-d5/d6:s omskrivna
   femleds-kedja. En sammanslagning kräver ett elevtext-beslut och
   bryter åttans byte-identitet — därför hålls de isär (beslut J.B.).

   Kontrakt: funktionerna här är globala function-deklarationer och
   laddas som klassiskt <script> FÖRE blad-<del>.js. Ett blad som
   behöver en radtyp kärnan saknar lägger till den HÄR (additivt),
   inte som lokal kopia av bladHTML/bygg_blad.

   Drift som samlades upp vid utbrytningen (unionen gäller för alla):
   · jamforEnhet: synonymer krona/påsar/flaskor (d7/d8/d1/d2/d3/k3-d1)
     + muggar/askar/liter/mil (d10/k3-d7) — alla i EN tabell.
   · jamforMellan: normaliserar minus (U+2212 → -) — bara d10/k3-d7
     gjorde det förr; samma fel som jamforTal hade (order 2026-09-18).
   ============================================================ */

// ============================================================
// ÖVNINGSMOTOR  – samma motor för alla fyra övningsblad
// ============================================================
//
// Varje övning beskrivs som ett "blad" med en lista av "rader".
// En rad är antingen:
//   - {typ:'enkel',  vansterText:'10 · 5 =',  svar:50}
//   - {typ:'lucka',  delar:['__ · 4,5 = 10'], luckPos:0, svar:???}
//                    (text med en lucka markerad som '__')
//   - {typ:'mellan', vansterText:'60 · 0,3 =', mellan:'6·3', svar:18}
//                    (eleven skriver först mellanled, sedan svar)
//
// 'exempel' (valfritt) visas som förinifyllt exempel ovanför rad-listan.
//
// Rad-lista grupperas av {grupp:'Beräkna', rader:[...]}.

function jamforTal(a, b){
  // tillåt komma eller punkt, ignorera mellanslag
  if(a == null) return false;
  var n = AK8_UI.pNum(a);   // DELAD parser (ak8-blad-ui): mellanslag/NBSP, alla minusvarianter (U+2212, –, —), komma → punkt.
                            // Förr lokal: 10 av 15 kopior tog inte keypadens '−' → negativt svar = NaN = fel (order 2026-09-18 FAS 1).
  if(isNaN(n)) return false;
  return Math.abs(n - b) < 1e-9;
}
function jamforMellan(a, b){
  // mellanled får skrivas med eller utan likhetstecken, mellanslag, ·/x/*, − → -
  // (minus-normaliseringen fanns bara i d10/k3-d7 förr; kärnan gör den alltid — som jamforTal.)
  if(a == null) return false;
  function norm(x){
    return String(x).toLowerCase()
      .replace(/[x×*]/g, '·')
      .replace(/\u2212/g, '-')
      .replace(/[\s=]/g, '')
      .replace(',', '.');
  }
  return norm(a) === norm(b);
}
// (hjälpare ur k1-d3, flyttade till kärnan 2026-09-19)
// Visa ett tal med snyggt minustecken (− = U+2212) och decimalkomma
function visaTal(t){
  var s = String(t).replace('.', ',');
  return s.replace(/^-/, '\u2212');
}
// FAS2 (omskrivning till sjuan): en 'enkel'-uppgift som SUBTRAHERAR ett negativt tal (a − (−b) = a + b)
// får en omskrivningscell före svaret. Kravet bärs av UTTRYCKET (samma regex som åttans blad-ak8-d2 +
// drillen), tvåvägs: 8 − (−6) får cell, −12 + (−8) får ingen (inget dubbelminus).
function harDubbelMinus(fraga){ return /[−–-]\s*\(\s*[−–-]/.test(String(fraga)); }
// Värde-utvärderare (+ − · / parenteser, unärt minus, alla minus-varianter) — ingen eval. Omskrivningen
// rättas på VÄRDE, så en giltig men annorlunda skriven form ('8 + 6', '14') godtas. Speglar blad-ak8-d2.
function evalUttryck(str){
  var s = String(str).replace(/[−–—]/g,'-').replace(/[·×]/g,'*').replace(/÷/g,'/').replace(/,/g,'.').replace(/\s+/g,'');
  if(s === '' || !/^[-+*/().0-9]+$/.test(s)) return NaN;
  var i = 0;
  function expr(){ var v = term(); while(s[i]==='+'||s[i]==='-'){ var o=s[i++]; var t=term(); v = o==='+'?v+t:v-t; } return v; }
  function term(){ var v = factor(); while(s[i]==='*'||s[i]==='/'){ var o=s[i++]; var f=factor(); v = o==='*'?v*f:v/f; } return v; }
  function factor(){ if(s[i]==='+'){ i++; return factor(); } if(s[i]==='-'){ i++; return -factor(); }
    if(s[i]==='('){ i++; var v=expr(); if(s[i]===')') i++; return v; }
    var m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i)); if(!m) return NaN; i += m[0].length; return parseFloat(m[0]); }
  var r = expr(); return i === s.length ? r : NaN;
}
// Kanonisk omskrivning för facit-visning: slår ihop yttre operator med inre tecken, tar bort parentesen.
function skrivOm(f){ return String(f).replace(/([+−–-])\s*\(\s*([+−–-]?)\s*([0-9]+(?:[.,][0-9]+)?)\s*\)/g,
  function(m, yttre, inre, tal){ var neg = (/[−–-]/.test(yttre)) !== (/[−–-]/.test(inre)); return (neg ? ' − ' : ' + ') + tal; }).replace(/\s*=\s*$/,'').replace(/\s{2,}/g,' ').trim(); }
function jamforEnhet(a, b){
  // Enhet rättas flexibelt: utan mellanslag, gemener,
  // och med vanliga skrivvarianter (kr/sek osv. accepteras).
  if(a == null) return false;
  // UNIONEN av alla tio bladens tabeller (drift samlad 2026-09-19): nya synonymer läggs HÄR, inte per blad.
  var alias = {
    'sek':'s', 'sekund':'s', 'sekunder':'s',
    'kr':'kr', 'kronor':'kr', 'krona':'kr',
    'meter':'m', 'metrar':'m',
    'kilometer':'km',
    'centimeter':'cm',
    'pase':'påsar', 'påse':'påsar', 'pasar':'påsar', 'påsarna':'påsar',
    'flaska':'flaskor', 'flaskorna':'flaskor',
    'mugg':'muggar', 'muggarna':'muggar',
    'ask':'askar', 'askarna':'askar',
    'liter':'l',
    'mil':'mil'
  };
  function norm(x){
    var t = String(x).toLowerCase().replace(/\./g,'').replace(/\s/g,'');
    // ta bort eventuell punkt (m. -> m)
    return t;
  }
  var na = norm(a), nb = norm(b);
  if(na === nb) return true;
  // alias åt båda håll
  if(alias[na] === nb) return true;
  if(alias[nb] === na) return true;
  return false;
}

// ============================================================
// KONFETTI – när eleven får alla rätt
// ============================================================
function visaKonfetti(){
  // Plocka bort eventuell gammal konfetti
  var gammal = document.querySelector('.konfetti-lager');
  if(gammal) gammal.remove();
  var lager = document.createElement('div');
  lager.className = 'konfetti-lager';
  document.body.appendChild(lager);
  var färger = ['#16a34a','#dc2626','#f59e0b','#3b82f6','#a855f7','#ec4899','#06b6d4'];
  var antal = 80;
  for(var i = 0; i < antal; i++){
    var b = document.createElement('span');
    b.className = 'konfetti';
    b.style.left = (Math.random() * 100) + 'vw';
    b.style.background = färger[Math.floor(Math.random() * färger.length)];
    var duration = 2.5 + Math.random() * 2; // 2,5–4,5 sek
    var delay = Math.random() * 0.8;        // upp till 0,8 sek försening
    b.style.animationDuration = duration + 's';
    b.style.animationDelay = delay + 's';
    b.style.width = (6 + Math.random() * 8) + 'px';
    b.style.height = (10 + Math.random() * 8) + 'px';
    lager.appendChild(b);
  }
  // Städa upp efter att allt fallit klart
  setTimeout(function(){ if(lager.parentNode) lager.remove(); }, 6000);
}

function bladHTML(blad){
  var html = '<div class="ovn-sheet">'
    + '<h2>' + blad.titel + '</h2>'
    + (blad.intro ? '<p class="ovn-intro">' + blad.intro + '</p>' : '');

  if(blad.exempel){
    html += '<div class="ovn-exempel">' + blad.exempel + '</div>';
  }

  var radNummer = 0;
  blad.grupper.forEach(function(grupp, gi){
    // data-logg (valfritt) märker en grupp vars besvarade rutor ska matas till mastery.
    // Utan data-logg loggas ingenting (opt-in) — de fyra äldre bladen rörs inte.
    html += '<div class="ovn-grupp"' + (grupp.logg ? ' data-logg="' + grupp.logg + '"' : '') + '>';
    html += '<div class="ovn-grupp-rubrik">' + (gi+1) + '. ' + grupp.rubrik + '</div>';
    grupp.rader.forEach(function(rad){
      radNummer++;
      var bokstav = String.fromCharCode(96 + ((radNummer - 1) % 26) + 1); // a, b, c...
      // (radtyp ur k1-d7/d8, flyttad till kärnan 2026-09-19)
      if(rad.typ === 'problemTid'){
        // Problem med tidssvar: timmar + minuter i två fält
        html += '<div class="prob-rad" data-rad="' + radNummer + '">';
        html += '<div class="prob-fraga">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span>' + rad.fraga + '</span>';
        html += '</div>';
        html += '<div class="prob-kladd-rubrik">Min uträkning</div>';
        html += '<textarea class="prob-kladd" rows="3" '
          + 'placeholder="Skriv din uträkning här (för din egen del — rättas inte)"></textarea>';
        html += '<div class="prob-svar-rad">';
        html += '<span class="prob-label">Svar:</span>';
        html += '<input class="ovn-in" data-svar="' + rad.timmar + '" '
          + 'inputmode="numeric" autocomplete="off" style="width:70px;">';
        html += '<span class="ovn-text" style="margin:0 2px;">h</span>';
        html += '<input class="ovn-in" data-svar="' + rad.minuter + '" '
          + 'inputmode="numeric" autocomplete="off" style="width:70px;">';
        html += '<span class="ovn-text" style="margin:0 2px;">min</span>';
        html += '</div>';
        html += '</div>';
        return;
      }
      if(rad.typ === 'problem'){
        // Problem har egen layout: fråga + kladdruta + svar/enhet
        html += '<div class="prob-rad" data-rad="' + radNummer + '">';
        html += '<div class="prob-fraga">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span>' + rad.fraga + '</span>';
        html += '</div>';
        html += '<div class="prob-kladd-rubrik">Min uträkning</div>';
        html += '<textarea class="prob-kladd" rows="3" '
          + 'placeholder="Skriv din uträkning här (för din egen del — rättas inte)"></textarea>';
        html += '<div class="prob-svar-rad">';
        html += '<span class="prob-label">Svar:</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar + '" '
          + 'inputmode="decimal" autocomplete="off" placeholder="tal">';
        html += '<input class="ovn-in enhet" data-enhet="' + rad.enhet + '" '
          + 'inputmode="text" autocomplete="off" placeholder="enhet">';
        html += '</div>';
        html += '</div>';
        return;
      }
      // (radtyper ur k1-d7/d8, flyttade till kärnan 2026-09-19)
      // Bråk-uppgifter: täljare/nämnare visas som riktigt bråk
      if(rad.typ === 'brak' || rad.typ === 'brakLucka'){
        html += '<div class="ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        // Bråk-blocket
        html += '<span class="ovn-brak">';
        if(rad.typ === 'brakLucka' && rad.luckaPos === 'taljare'){
          // täljaren innehåller en lucka, t.ex. "706 · __"
          var tBitar = rad.taljare.split('__');
          html += '<span class="ovn-brak-taljare">' + tBitar[0]
            + '<input class="ovn-in lucka" data-svar="' + rad.svar
            + '" inputmode="decimal" autocomplete="off" style="width:64px;height:34px;font-size:17px;">'
            + (tBitar[1] !== undefined ? tBitar[1] : '') + '</span>';
          html += '<span class="ovn-brak-strecket"></span>';
          html += '<span class="ovn-brak-namnare">' + rad.namnare + '</span>';
        } else if(rad.typ === 'brakLucka' && rad.luckaPos === 'namnare'){
          html += '<span class="ovn-brak-taljare">' + rad.taljare + '</span>';
          html += '<span class="ovn-brak-strecket"></span>';
          var nBitar = rad.namnare.split('__');
          html += '<span class="ovn-brak-namnare">' + nBitar[0]
            + '<input class="ovn-in lucka" data-svar="' + rad.svar
            + '" inputmode="decimal" autocomplete="off" style="width:64px;height:34px;font-size:17px;">'
            + (nBitar[1] !== undefined ? nBitar[1] : '') + '</span>';
        } else {
          html += '<span class="ovn-brak-taljare">' + rad.taljare + '</span>';
          html += '<span class="ovn-brak-strecket"></span>';
          html += '<span class="ovn-brak-namnare">' + rad.namnare + '</span>';
        }
        html += '</span>';
        html += '<span class="ovn-text">=</span>';
        if(rad.typ === 'brakLucka'){
          // facit står efter likhetstecknet (eleven löser luckan i bråket)
          html += '<span class="ovn-text ovn-num">' + rad.hoger + '</span>';
        } else {
          html += '<input class="ovn-in" data-svar="' + rad.svar
            + '" inputmode="decimal" autocomplete="off">';
        }
        html += '</div>';
        return;
      }
      // (radtyper ur k1-d3, flyttade till kärnan 2026-09-19)
      // Storleksordna: visa talmängden, eleven skriver i ordning i rutor
      if(rad.typ === 'ordna'){
        var sorterat = rad.tal.slice().sort(function(a,b){ return rad.fallande ? b-a : a-b; });
        html += '<div class="ovn-rad ovn-ordna-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-ordna-prompt">' + (rad.fraga || (rad.fallande ? 'Störst till minst:' : 'Minst till störst:')) + '</span>';
        html += '<span class="ovn-ordna-set">{ ' + rad.tal.map(function(t){ return visaTal(t); }).join(', ') + ' }</span>';
        html += '<span class="ovn-ordna-svar">';
        sorterat.forEach(function(v, k){
          if(k>0) html += '<span class="ovn-ordna-pil">' + (rad.fallande ? '>' : '<') + '</span>';
          html += '<input class="ovn-in ovn-ordna-in" data-svar="' + v + '" inputmode="text" autocomplete="off">';
        });
        html += '</span>';
        html += '</div>';
        return;
      }
      // Talföljd: vissa termer givna, andra (null) är ifyllnadsrutor
      if(rad.typ === 'talfoljd'){
        html += '<div class="ovn-rad ovn-foljd-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-foljd-led">';
        rad.termer.forEach(function(t, k){
          if(k>0) html += '<span class="ovn-foljd-komma">,</span>';
          if(t === null){
            html += '<input class="ovn-in ovn-foljd-in" data-svar="' + rad.facit[k] + '" inputmode="text" autocomplete="off">';
          } else {
            html += '<span class="ovn-text ovn-num ovn-foljd-tal">' + visaTal(t) + '</span>';
          }
        });
        html += '<span class="ovn-foljd-komma">, …</span>';
        html += '</span>';
        html += '</div>';
        return;
      }
      // räkna om bokstav per grupp
      html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
      html += '<span class="ovn-label">' + bokstav + ')</span>';
      if(rad.typ === 'enkel'){
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        // FAS2: subtraktion av negativt tal → omskrivningscell (värde-rättad) före svaret. Klassen
        // ak8-in-oms ger uttrycks-läge på den delade keypaden (+ · ( ) aktiva); data-oms = rättvärdet.
        if(harDubbelMinus(rad.vansterText)){
          html += '<input class="ovn-in bred ak8-in-oms" data-oms="' + rad.svar
            + '" inputmode="text" autocomplete="off" placeholder="skriv om">';
          html += '<span class="ovn-text">=</span>';
        }
        html += '<input class="ovn-in" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      } else if(rad.typ === 'text'){
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in bred" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off" placeholder="svar">';
      } else if(rad.typ === 'term'){
        // Dela upp ett tal i summa av termer – godtar alla korrekta uppdelningar
        html += '<span class="ovn-text" style="min-width:140px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in bred" data-term="' + rad.summa + '" data-antal="' + (rad.antal||2)
          + '" inputmode="text" autocomplete="off" placeholder="två termer">';   // platshållare: ledning, ej exempel (10+8=18 var facit-läcka)
      } else if(rad.typ === 'tvatal'){
        // Två tal i valfri ordning
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in" data-tvatal="' + rad.tal.join(',') + '" data-pos="0" inputmode="decimal" autocomplete="off" style="width:80px;">';
        html += '<span class="ovn-text">och</span>';
        html += '<input class="ovn-in" data-tvatal="' + rad.tal.join(',') + '" data-pos="1" inputmode="decimal" autocomplete="off" style="width:80px;">';
      } else if(rad.typ === 'lucka'){
        // text innehåller '__' där luckan ska sitta
        var bitar = rad.text.split('__');
        html += '<span class="ovn-text ovn-num">' + bitar[0] + '</span>';
        html += '<input class="ovn-in lucka" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
        if(bitar[1] !== undefined) html += '<span class="ovn-text ovn-num">' + bitar[1] + '</span>';
      } else if(rad.typ === 'mellan'){
        // [Vänster]  = [mellanled-input]  = [svar-input]
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in bred" data-mellan="' + rad.mellan
          + '" inputmode="text" autocomplete="off" placeholder="mellanled">';
        html += '<span class="ovn-text">=</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      }
      html += '</div>';
    });
    html += '</div>';
    radNummer = 0; // bokstäver räknas om per grupp
  });

  // räkna om labels per grupp
  html += '</div>';

  // Knappsats – samma stil som öva-delen
  html += '<div class="ovn-wrap" style="padding-top:0;">';
  // Keypaden ligger INTE i bladet: en per sida monteras i body av bygg_blad (se där).

  html += '<div class="ovn-kontroll-rad">'
    + '<button type="button" class="ovn-kontroll" data-action="kontroll">Kontrollera</button>'
    + '<button type="button" class="ovn-aterstall" data-action="reset">Återställ</button>'
    + (blad.kanGenerera ? '<button type="button" class="ovn-aterstall" data-action="nytt-blad">↻ Nytt blad med andra tal</button>' : '')
  + '</div>';

  html += '<div class="ovn-sammanf" data-sammanf style="display:none;"></div>';

  html += '<div class="ovn-skriv-ut"><button type="button" data-action="print">↗ Skriv ut bladet</button></div>';
  html += '</div>';
  return html;
}

function bygg_blad(rotEl, blad){
  rotEl.innerHTML = bladHTML(blad);

  // Räkna om radbokstäver så att varje grupp börjar om från 'a'
  rotEl.querySelectorAll('.ovn-grupp').forEach(function(g){
    var bok = 96;
    g.querySelectorAll('.ovn-label').forEach(function(lbl){
      bok++;
      lbl.textContent = String.fromCharCode(bok) + ')';
    });
  });

  var inputs = Array.from(rotEl.querySelectorAll('.ovn-in'));
  var fokus = 0;

  // Tab/Enter -> nästa input. Ångra rättning så fort man ändrar.
  inputs.forEach(function(inp, i){
    inp.addEventListener('focus', function(){ fokus = i; });
    inp.addEventListener('input', function(){
      inp.classList.remove('correct','wrong');
      var f = inp.parentElement.querySelector('.ovn-fasit');
      if(f) f.remove();
    });
  });

  // Knappsats – EN delad AK8_UI-keypad per sida (inte en per blad): monteras i document.body (utanför
  // blad-mounts/ev. transform) och binds mot hela sidan → följer fokus över alla blad, Enter→nästa ruta,
  // kontext-gråning, ⌫. Mönstret ur d1/d2 (a320f04), sedan 2026-09-19 kärnans för alla blad.
  if(window.AK8_UI && !document.getElementById('ovn-keypad-shared')){
    var _kw = document.createElement('div'); _kw.innerHTML = AK8_UI.keypadHTML();
    var _kp = _kw.firstChild; if(_kp){ _kp.id = 'ovn-keypad-shared'; document.body.appendChild(_kp); AK8_UI.bindKeypad(document.body); }
  }

  // Kontroll / Återställ / Skriv ut
  var forstaForsoket = true; // 0-1 fel på första försöket -> nytt blad
  rotEl.querySelector('[data-action="kontroll"]').addEventListener('click', function(){
    var ratt = 0, totalt = 0;
    inputs.forEach(function(inp){
      var rad = inp.parentElement;
      // Ta bort eventuella tidigare fasit-spans och markeringar
      rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
      inp.classList.remove('correct','wrong','just-checked');
      var ok;
      if(inp.dataset.oms !== undefined){
        // FAS2: omskrivningscellen rättas på VÄRDE (giltig men annorlunda skriven form godtas)
        var ov = evalUttryck(inp.value);
        ok = !isNaN(ov) && Math.abs(ov - parseFloat(inp.dataset.oms)) < 1e-9;
      } else if(inp.dataset.mellan){
        ok = jamforMellan(inp.value, inp.dataset.mellan);
      } else if(inp.dataset.enhet){
        ok = jamforEnhet(inp.value, inp.dataset.enhet);
      } else if(inp.dataset.term !== undefined){
        // dela upp i termer – godtar alla korrekta summor
        var malSumma = parseFloat(inp.dataset.term);
        var malAntal = parseInt(inp.dataset.antal, 10);
        var termer = String(inp.value).replace(/\u2212/g,'-').replace(/\s/g,'').split('+');
        var summa = 0, giltigt = true;
        if(termer.length !== malAntal) giltigt = false;
        termer.forEach(function(t){
          var v = parseFloat(t.replace(',','.'));
          if(isNaN(v)) giltigt = false; else summa += v;
        });
        ok = giltigt && Math.abs(summa - malSumma) < 1e-9;
      } else if(inp.dataset.tvatal !== undefined){
        // två tal i valfri ordning – båda fälten ska tillsammans matcha
        var malTal = inp.dataset.tvatal.split(',').map(function(x){ return parseFloat(x); });
        var v = parseFloat(String(inp.value).replace(',','.'));
        ok = !isNaN(v) && malTal.some(function(m){ return Math.abs(m-v)<1e-9; });
      } else {
        ok = jamforTal(inp.value, parseFloat(inp.dataset.svar));
      }
      totalt++;
      // FAS 2 · loggning: bara grupper med data-logg matar mastery. En besvarad (ej tom) ruta
      // loggas som försök — FEL registreras som 'fel' (orange), rätt som 'ratt'. Grupp 4
      // (decimaler) saknar data-logg → matar inte mastery. Tidsspärren i mastery.js kollapsar
      // upprepade Kontrollera-klick i samma pass, så retention inte blåses upp.
      var _grEl = inp.closest('.ovn-grupp');
      var _loggNod = _grEl && _grEl.getAttribute('data-logg');
      // Omskrivningscellen (data-oms) loggas EJ separat — annars två evidens per uppgift; svarscellen bär loggen.
      if(_loggNod && inp.dataset.oms === undefined && String(inp.value).trim() !== '' && window.Mastery && window.Mastery.loggaForsok){
        window.Mastery.loggaForsok(_loggNod, ok ? 'ratt' : 'fel');
      }
      // Bocken/krysset – stor, syns tydligt
      var mark = document.createElement('span');
      mark.className = 'ovn-mark ' + (ok ? 'ok' : 'fel');
      mark.textContent = ok ? '✓' : '✗';
      if(ok){
        inp.classList.add('correct','just-checked');
        ratt++;
        inp.insertAdjacentElement('afterend', mark);
      } else {
        inp.classList.add('wrong','just-checked');
        var facit;
        if(inp.dataset.oms !== undefined){ var _vt = rad.querySelector('.ovn-num'); facit = _vt ? skrivOm(_vt.textContent) : inp.dataset.oms.replace('.', ','); }
        else if(inp.dataset.mellan) facit = inp.dataset.mellan;
        else if(inp.dataset.enhet) facit = inp.dataset.enhet;
        else if(inp.dataset.term !== undefined) facit = 'summan ska bli ' + inp.dataset.term.replace('.', ',');
        else if(inp.dataset.tvatal !== undefined) facit = inp.dataset.tvatal.split(',').join(' och ');
        else facit = inp.dataset.svar.replace('.', ',');
        var f = document.createElement('span');
        f.className = 'ovn-fasit';
        f.textContent = 'rätt svar: ' + facit;
        inp.insertAdjacentElement('afterend', mark);
        mark.insertAdjacentElement('afterend', f);
      }
      // Ta bort blink-klassen efter animationen
      setTimeout(function(){ inp.classList.remove('just-checked'); }, 500);
    });
    var sam = rotEl.querySelector('[data-sammanf]');
    sam.style.display = 'block';
    sam.classList.remove('ok','delvis');
    if(ratt === totalt){
      sam.classList.add('ok');
      sam.innerHTML = '<div class="ovn-sammanf-icon">✓</div>'
        + '<span class="ovn-sammanf-titel">Allt rätt!</span>'
        + ratt + ' av ' + totalt + ' &mdash; jättebra jobbat!';
      // Konfetti regnar
      visaKonfetti();
    } else {
      sam.classList.add('delvis');
      sam.textContent = 'Du fick ' + ratt + ' av ' + totalt + ' rätt. Titta på de rödmarkerade rutorna.';
    }
    sam.scrollIntoView({behavior:'smooth', block:'center'});

    // Automatiskt nytt blad om eleven klarade 0-1 fel på FÖRSTA försöket
    // (slarvfel räcker inte för att låsa upp samma blad – men 2+ fel betyder
    //  att hen bör få rätta och försöka igen utan att bladet byts).
    var fel = totalt - ratt;
    if(forstaForsoket && fel <= 1 && blad.kanGenerera && blad.genId){
      // Visa en mjuk meddelandetext och byt blad efter en kort paus
      setTimeout(function(){
        var sam2 = rotEl.querySelector('[data-sammanf]');
        if(sam2){
          var info = document.createElement('div');
          info.style.cssText = 'margin-top:14px;font-size:14px;font-weight:normal;color:#15803d;';
          info.textContent = 'Nytt blad med andra tal kommer …';
          sam2.appendChild(info);
        }
      }, 1600);
      setTimeout(function(){
        // markera att vi börjat en ny "session" på bladet, så nytt blad genereras
        byggSheet(rotEl.id.replace('sheet-',''), 'A', false);
      }, 3200);
    }
    forstaForsoket = false;
  });

  rotEl.querySelector('[data-action="reset"]').addEventListener('click', function(){
    inputs.forEach(function(inp){
      inp.value = '';
      inp.classList.remove('correct','wrong','just-checked');
    });
    rotEl.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
    var sam = rotEl.querySelector('[data-sammanf]');
    sam.style.display = 'none';
    sam.textContent = '';
    forstaForsoket = true;
    if(inputs[0]) inputs[0].focus();
  });

  var nyttBtn = rotEl.querySelector('[data-action="nytt-blad"]');
  if(nyttBtn){
    nyttBtn.addEventListener('click', function(){
      byggSheet(rotEl.id.replace('sheet-',''), 'B', false);
    });
  }

  rotEl.querySelector('[data-action="print"]').addEventListener('click', function(){
    window.print();
  });

  if(inputs[0]) inputs[0].focus();
}

