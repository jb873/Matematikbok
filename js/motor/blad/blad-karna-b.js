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

// EGNA MARKERINGAR (order 2026-09-21): i en rad med flera rutor rensar varje ruta bara de ✓/✗ + facit som står
// direkt efter DEN rutan. Förr rensades hela radens/förälderns markeringar per ruta → bara sista rutans bock blev
// kvar, och en rad med A, B fel och C rätt visade ✓ (grön rad med fel kvar).
function egnaMarken(inp){ var nxt = inp.nextElementSibling; while(nxt && nxt.classList && (nxt.classList.contains('ovn-mark') || nxt.classList.contains('ovn-fasit'))){ var t = nxt; nxt = nxt.nextElementSibling; t.remove(); } }
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
// (hjälpare ur k1-d1, flyttade till kärnan 2026-09-19)
function jamforUttryck(a, godkanda){
  if(a == null) return false;
  function normTerm(t){
    var neg = false;
    if(t[0] === '+'){ t = t.slice(1); }
    else if(t[0] === '-'){ neg = true; t = t.slice(1); }
    var ch = t.split('').sort().join('');
    return (neg ? '-' : '') + ch;
  }
  function norm(x){
    var s = String(x).toLowerCase()
      .replace(/[·×*]/g, '')
      .replace(/\s/g, '')
      .replace(/\u2212/g, '-')
      .replace(/,/g, '.');
    var termer = s.replace(/-/g, '+-').split('+').filter(function(t){ return t !== ''; });
    return termer.map(normTerm).sort().join('+');
  }
  var na = norm(a);
  return godkanda.some(function(g){ return norm(g) === na; });
}
// Jämför fritext mot en lista godkända svar (gemener, utan mellanslag).
function jamforText(a, godkanda){
  if(a == null) return false;
  function norm(x){
    return String(x).toLowerCase().replace(/\s/g,'').replace(/[.,!?]/g,'');
  }
  var na = norm(a);
  if(na === '') return false;
  return godkanda.some(function(g){ return norm(g) === na; });
}
// Symbolisk förenkling av linjärt uttryck med EN variabel → kanonisk form.
function forenklaKanon(uttryck){
  if(uttryck == null) return null;
  var s = String(uttryck).toLowerCase()
    .replace(/\u2212/g, '-').replace(/[×]/g, '*').replace(/·/g, '*')
    .replace(/\s/g, '').replace(/,/g, '.');
  if(s === '') return null;
  var vm = s.match(/[a-z]/);
  var v = vm ? vm[0] : null;
  if(v && new RegExp('[a-z]').test(s.replace(new RegExp(v,'g'),''))) return null;
  s = s.replace(/(\d|\))(\()/g, '$1*$2')
       .replace(/(\))(\d|[a-z]|\()/g, '$1*$2')
       .replace(/(\d)([a-z])/g, '$1*$2')
       .replace(/([a-z])(\d)/g, '$1*$2');
  function evalAt(xval){
    var e = v ? s.replace(new RegExp(v,'g'), '('+xval+')') : s;
    if(!/^[-+*/().\d]+$/.test(e)) return null;
    try{ var r = Function('"use strict";return ('+e+')')(); return (typeof r==='number'&&isFinite(r))?r:null; }
    catch(err){ return null; }
  }
  if(!v){ var c0 = evalAt(0); return c0===null?null:'C'+(Math.round(c0*1e6)/1e6); }
  var f0 = evalAt(0), f1 = evalAt(1);
  if(f0===null||f1===null) return null;
  return (Math.round((f1-f0)*1e6)/1e6) + v + '+' + (Math.round(f0*1e6)/1e6);
}
function jamforForenkla(a, facit){
  var na = forenklaKanon(a);
  if(na === null) return false;
  return na === forenklaKanon(facit);
}
// Symbolisk förenkling med FLERA variabler (x,y,a,b). Expanderar parenteser,
// multiplikation och division, samlar koefficienter per variabel + konstant.
// Returnerar kanonisk sträng, eller null om uttrycket inte kan tolkas.
function forenklaFler(uttryck){
  if(uttryck == null) return null;
  var s = String(uttryck).toLowerCase()
    .replace(/\u2212/g,'-').replace(/[×]/g,'*').replace(/·/g,'*')
    .replace(/\s/g,'').replace(/,/g,'.');
  if(s === '') return null;
  // vilka variabler förekommer?
  var vars = [];
  (s.match(/[a-z]/g)||[]).forEach(function(c){ if(vars.indexOf(c)<0) vars.push(c); });
  // implicit multiplikation
  s = s.replace(/(\d|\))(\()/g,'$1*$2')
       .replace(/(\))(\d|[a-z]|\()/g,'$1*$2')
       .replace(/(\d)([a-z])/g,'$1*$2')
       .replace(/([a-z])(\d)/g,'$1*$2')
       .replace(/([a-z])([a-z])/g,'$1*$2');
  function evalAt(vals){
    var e = s;
    for(var k in vals){ e = e.replace(new RegExp(k,'g'), '('+vals[k]+')'); }
    if(!/^[-+*/().\d]+$/.test(e)) return null;
    try{ var r = Function('"use strict";return ('+e+')')(); return (typeof r==='number'&&isFinite(r))?r:null; }
    catch(err){ return null; }
  }
  // konstant = värde då alla variabler = 0
  var noll = {}; vars.forEach(function(v){ noll[v]=0; });
  var c = evalAt(noll);
  if(c === null) return null;
  // koefficient för varje variabel: värde då just den = 1 (övriga 0), minus konstant
  var koef = {};
  for(var i=0;i<vars.length;i++){
    var vv = {}; vars.forEach(function(v){ vv[v]=0; }); vv[vars[i]] = 1;
    var f1 = evalAt(vv);
    if(f1 === null) return null;
    koef[vars[i]] = Math.round((f1 - c)*1e6)/1e6;
  }
  // kanonisk: variabler i bokstavsordning + konstant
  var delar = vars.slice().sort().map(function(v){ return koef[v]+v; });
  delar.push('C'+(Math.round(c*1e6)/1e6));
  return delar.join('|');
}
function jamforFler(a, facit){
  var na = forenklaFler(a);
  if(na === null) return false;
  return na === forenklaFler(facit);
}
// Jämför ett led på FORM (rätt tal och tecken; godtar mellanslag, ·/x/*,
// omkastad faktorordning 3·5=5·3 och omkastad termordning 15+2=2+15).
function jamforForm(a, godkanda){
  if(a == null) return false;
  function normTerm(t){
    var neg=false;
    if(t[0]==='+'){t=t.slice(1);} else if(t[0]==='-'){neg=true;t=t.slice(1);}
    var faktorer=t.split('·').filter(function(f){return f!=='';}).sort();
    return (neg?'-':'') + faktorer.join('·');
  }
  function norm(x){
    var s=String(x).toLowerCase().replace(/[×*x]/g,'·').replace(/\s/g,'').replace(/\u2212/g,'-').replace(/,/g,'.');
    if(s==='') return '';
    var termer=s.replace(/-/g,'+-').split('+').filter(function(t){return t!=='';});
    return termer.map(normTerm).sort().join('+');
  }
  var na=norm(a);
  if(na==='') return false;
  return godkanda.some(function(g){return norm(g)===na;});
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
// (hjälpare ur k1-d10/k3-d7, flyttade till kärnan 2026-09-19)
// Fritext ELLER uttryck/tal mot lista av godkända varianter: ·/x/* och komma/punkt normaliseras. Skild från
// jamforText (d1: ordsvar — tar bort skiljetecken, rör inte x som är variabel). Två funktioner, två namn.
function jamforFritext(a, godkanda){
  if(a == null) return false;
  function norm(x){
    return String(x).toLowerCase()
      .replace(/[x×*]/g, '·')
      .replace(/\s/g, '')
      .replace(/,/g, '.');
  }
  var na = norm(a);
  if(na === '') return false;
  for(var i = 0; i < godkanda.length; i++){
    if(na === norm(godkanda[i])) return true;
  }
  return false;
}
// Utvärderar ett aritmetiskt uttryck (·/× → *, − → -, , → .) säkert.
// Returnerar talet, eller null om uttrycket är ogiltigt/otillåtet.
function prioEval(uttryck){
  if(uttryck == null) return null;
  var e = String(uttryck)
    .replace(/[x×]/g, '*')
    .replace(/\u00b7/g, '*')
    .replace(/\u2212/g, '-')
    .replace(/\s/g, '')
    .replace(/,/g, '.');
  if(e === '') return null;
  if(!/^[-+*/().\d]+$/.test(e)) return null;
  try{
    var v = Function('"use strict";return (' + e + ')')();
    if(typeof v !== 'number' || !isFinite(v)) return null;
    return Math.round(v * 1e6) / 1e6;
  }catch(err){ return null; }
}
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

  if(blad.stegvis){
    html += '<div class="steg-nav" data-stegnav>'
      + '<button type="button" class="steg-btn" data-steg="prev" disabled>← Föregående</button>'
      + '<span class="steg-info" data-steg-info>Avsnitt 1 av ' + blad.grupper.length + '</span>'
      + '<button type="button" class="steg-btn" data-steg="next">Nästa avsnitt →</button>'
      + '</div>';
  }

  var radNummer = 0;
  blad.grupper.forEach(function(grupp, gi){
    // data-logg (valfritt) märker en grupp vars besvarade rutor ska matas till mastery.
    // Utan data-logg loggas ingenting (opt-in) — de fyra äldre bladen rörs inte.
    html += '<div class="ovn-grupp"' + (grupp.logg ? ' data-logg="' + grupp.logg + '"' : '') + (grupp.loggStore ? ' data-logg-store="' + grupp.loggStore + '"' : '') + '>';
    html += '<div class="ovn-grupp-rubrik">' + (gi+1) + '. ' + grupp.rubrik + '</div>';
    grupp.rader.forEach(function(rad){
      radNummer++;
      var bokstav = String.fromCharCode(96 + ((radNummer - 1) % 26) + 1); // a, b, c...
      // (radtyper ur k1-d10/k3-d7 — plugg till prov — flyttade till kärnan 2026-09-19; kolliderande namn omdöpta)
      if(rad.typ === 'faktor'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text ovn-num">' + rad.tal + ' =</span>';
        html += '<input class="ovn-in bred" data-faktor="' + rad.tal + '" data-antal="' + rad.antal
          + '" inputmode="text" autocomplete="off">';   // platshållare: ledning, ej exempel (facit-läcka borttagen)
        html += '</div>';
        return;
      }
      // FORKLARA: fritextsvar, ingen rätt/fel – visar facit vid kontroll
      if(rad.typ === 'forklara'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '" style="flex-direction:column;align-items:stretch;gap:8px;">';
        html += '<textarea class="prob-kladd" data-forklara="' + encodeURIComponent(rad.facit)
          + '" rows="3"></textarea>';
        html += '</div>';
        return;
      }
      // BRAKTEXT: visa bråk grafiskt (ev. med heltal framför), elev skriver decimalform
      if(rad.typ === 'brakText'){
        html += '<div class="ovn-brak-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        if(rad.heltal){
          html += '<span class="ovn-text ovn-num" style="font-size:22px;margin-right:2px;">' + rad.heltal + '</span>';
        }
        html += '<span class="ovn-brak">';
        html += '<span class="ovn-brak-taljare">' + rad.taljare + '</span>';
        html += '<span class="ovn-brak-strecket"></span>';
        html += '<span class="ovn-brak-namnare">' + rad.namnare + '</span>';
        html += '</span>';
        html += '<span class="ovn-text">=</span>';
        var acc = (rad.accept || [rad.svar]).join('|');
        html += '<input class="ovn-in" data-fritext="' + encodeURIComponent(acc)
          + '" data-visa="' + rad.svar + '" inputmode="decimal" autocomplete="off">';
        html += '</div>';
        return;
      }
      // FLERVAL: välj flera tal ur en lista (t.ex. "vilka är delbara med 3")
      if(rad.typ === 'flerval'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '" style="flex-wrap:wrap;">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        var ratta = rad.ratt.map(function(x){ return String(x); }).join(',');
        html += '<div class="ovn-flerval-grid" data-ratt="' + ratta + '">';
        rad.tal.forEach(function(t){
          html += '<button type="button" class="ovn-flerval-btn" data-tal="' + t + '">' + t + '</button>';
        });
        html += '</div></div>';
        return;
      }
      // INTERVALL: öppet svar – vilket tal som helst inom intervallet godtas
      if(rad.typ === 'intervallEn'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in bred" data-intmin="' + rad.min + '" data-intmax="' + rad.max
          + '" data-exkl="' + (rad.exkl ? '1' : '0') + '" inputmode="decimal" autocomplete="off">';
        html += '</div>';
        return;
      }
      // FÖLJD: talföljd – givna tal visas, eleven fyller i de tre nästa
      if(rad.typ === 'foljd'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '" style="flex-wrap:wrap;">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text ovn-num" style="font-size:19px;">'
          + rad.givna.join('   ') + '   …</span>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-left:6px;">';
        rad.nasta.forEach(function(t){
          html += '<input class="ovn-in" data-ordna="' + String(t).replace(/,/g,'.')
            + '" inputmode="decimal" autocomplete="off" style="width:80px;">';
        });
        html += '</div></div>';
        return;
      }
      // TEXT: en fråga, ett textsvar (ord eller uttryck)
      if(rad.typ === 'fragaText'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        var accept = (rad.accept || [rad.svar]).join('|');
        html += '<input class="ovn-in bred" data-fritext="' + encodeURIComponent(accept)
          + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off">';
        html += '</div>';
        return;
      }
      // ORDNA: tal som ska sorteras – eleven skriver i ordning i fält
      if(rad.typ === 'ordningsfoljd'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '" style="flex-wrap:wrap;">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text" style="width:100%;font-size:16px;color:var(--ink-faint);">Talen: '
          + rad.tal.join('  ·  ') + '</span>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;width:100%;margin-top:6px;">';
        rad.ordning.forEach(function(t, i){
          html += '<input class="ovn-in" data-ordna="' + rad.ordning[i].replace(/,/g,'.')
            + '" inputmode="decimal" autocomplete="off" style="width:74px;"'
            + '>';
        });
        html += '</div></div>';
        return;
      }
      // VAL: flervalsfråga – knappar, en är rätt
      if(rad.typ === 'val'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '" style="flex-wrap:wrap;">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<div class="ovn-val-grid" data-valsvar="' + rad.svar.replace(/,/g,'.') + '">';
        rad.alternativ.forEach(function(alt){
          html += '<button type="button" class="ovn-val-btn" data-val="' + alt.replace(/,/g,'.')
            + '">' + alt + '</button>';
        });
        html += '</div></div>';
        return;
      }
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
          + '></textarea>';
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
          + '></textarea>';
        html += '<div class="prob-svar-rad">';
        html += '<span class="prob-label">Svar:</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar + '" '
          + 'inputmode="decimal" autocomplete="off">';
        html += '<span class="prob-label">Enhet:</span>';   // namnet står FRAMFÖR rutan, inte i den
        html += '<input class="ovn-in enhet" data-enhet="' + rad.enhet + '" '
          + 'inputmode="text" autocomplete="off">';
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
      // (ur k1-d1, flyttat till kärnan 2026-09-19)
      // Tallinje: SVG med pilar A/B/C, eleven skriver vad varje pil pekar på
      if(rad.typ === 'tallinje'){
        html += '<div class="ovn-rad ovn-tallinje-rad" data-rad="' + radNummer + '" style="flex-direction:column;align-items:flex-start;gap:10px;">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        // bygg SVG
        var W=620, H=70, x0=30, x1=590, mn=rad.min, mx=rad.max;
        function px(v){ return x0 + (v-mn)/(mx-mn)*(x1-x0); }
        var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">';
        s+='<line x1="'+x0+'" y1="48" x2="'+x1+'" y2="48" stroke="#333" stroke-width="2"/>';
        s+='<polygon points="'+x1+',48 '+(x1-9)+',44 '+(x1-9)+',52" fill="#333"/>';
        // delstreck
        rad.streck.forEach(function(t){
          var x=px(t.v);
          s+='<line x1="'+x+'" y1="'+(t.lang?40:44)+'" x2="'+x+'" y2="'+(t.lang?56:52)+'" stroke="#333" stroke-width="'+(t.lang?2:1)+'"/>';
          if(t.etikett!==undefined) s+='<text x="'+x+'" y="68" text-anchor="middle" font-size="12" fill="#555">'+visaTal(t.etikett)+'</text>';
        });
        // pilar
        rad.pilar.forEach(function(p){
          var x=px(p.v);
          s+='<line x1="'+x+'" y1="14" x2="'+x+'" y2="40" stroke="#c0392b" stroke-width="2"/>';
          s+='<polygon points="'+x+',44 '+(x-4)+',37 '+(x+4)+',37" fill="#c0392b"/>';
          s+='<circle cx="'+x+'" cy="9" r="9" fill="#c0392b"/>';
          s+='<text x="'+x+'" y="13" text-anchor="middle" font-size="11" fill="#fff" font-weight="bold">'+p.namn+'</text>';
        });
        s+='</svg>';
        html += '<div class="alg-bild" style="width:100%;">' + s + '</div>';
        // svarsrutor: en per pil
        html += '<span class="ovn-tallinje-svar" style="display:flex;gap:14px;flex-wrap:wrap;">';
        rad.pilar.forEach(function(p){
          html += '<span style="display:inline-flex;align-items:center;gap:5px;"><span class="ovn-text ovn-num">'+p.namn+' =</span>'
            + '<input class="ovn-in" data-svar="' + p.v + '" inputmode="decimal" autocomplete="off" style="width:80px;"></span>';
        });
        html += '</span></div>';
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
            + '" inputmode="text" autocomplete="off">';
          html += '<span class="ovn-text">=</span>';
        }
        html += '<input class="ovn-in" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      } else if(rad.typ === 'intervall'){
        // Skriv tal strikt mellan min och max. Två rutor som standard, en ruta om enkelt:true.
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in ovn-intervall" data-min="' + rad.min + '" data-max="' + rad.max
          + '" data-par="' + radNummer + '" inputmode="decimal" autocomplete="off">';
        if(!rad.enkelt){
          html += '<input class="ovn-in ovn-intervall" data-min="' + rad.min + '" data-max="' + rad.max
            + '" data-par="' + radNummer + '" inputmode="decimal" autocomplete="off">';
        }
      } else if(rad.typ === 'uttryck'){
        // svaret är ett algebraiskt uttryck (rättas normaliserat)
        if(rad.likhet){
          html += '<span class="ovn-text ovn-num">' + rad.fraga + '</span>';
          html += '<span class="ovn-text" style="margin:0 4px;">=</span>';
        } else {
          html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        }
        var acceptU = (rad.accept || [rad.svar]).join('|');
        html += '<input class="ovn-in bred" data-uttryck="' + encodeURIComponent(acceptU)
          + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off">';
      } else if(rad.typ === 'forenkla'){
        // FÖRENKLA (k3 d3): svaret är ett uttryck som ska vara förenklat så långt det går.
        // Rättas av AlgBrak.gradePoly — värde + skriven form, två åtskilda besked. data-vars öppnar
        // variabelknapparna på keypaden för just den här rutan.
        html += '<span class="ovn-text ovn-num">' + (rad.fragaHtml || rad.fraga) + '</span>';
        html += '<span class="ovn-text" style="margin:0 4px;">=</span>';
        html += '<input class="ovn-in bred" data-forenkla="' + encodeURIComponent(rad.svar) + '" data-vars="' + (rad.vars || 'xy')
          + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off"' + (rad.placeholder ? '' : '') + '>';   // ingen platshållartext (Joachim)
      } else if(rad.typ === 'omkrets'){
        // OMKRETS UR FIGUR: figuren (SVG ur svg-algebrafigur.js) + ett förenklat uttryck som svar.
        html += '<div style="display:flex;flex-direction:column;gap:10px;width:100%;">';
        html += '<div class="alg-bild">' + rad.svg + '</div>';
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
        html += '<span class="ovn-text">' + (rad.fraga || 'Omkrets') + '</span>';
        // MED SIDOR I DATA: en kedjeruta — uppställningen och förenklingen i SAMMA ruta
        // ("x + 3x + x + 3x = 8x"). Utan sidor: som förr, bara det förenklade uttrycket.
        html += rad.sidor
          ? '<input class="ovn-in bred ovn-kedja" data-omkrets="' + encodeURIComponent(rad.svar)
            + '" data-sidor="' + encodeURIComponent(rad.sidor.join('|')) + '" data-vars="' + (rad.vars || 'xy')
            + '" data-visa="' + rad.sidor.join(' + ') + ' = ' + rad.svar + '" inputmode="text" autocomplete="off">'
          : '<input class="ovn-in bred" data-forenkla="' + encodeURIComponent(rad.svar) + '" data-vars="' + (rad.vars || 'xy')
            + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off">';
        html += '</div></div>';
      } else if(rad.typ === 'oppet'){
        // ÖPPET SVAR: eleven skriver ETT EGET uttryck med bestämt antal termer som förenklas till målet.
        // Många svar är rätt — rättas mot (1) antal termer, (2) värdet. Formen granskas INTE (det ska
        // vara oförenklat).
        html += '<span class="ovn-text" style="min-width:150px;">' + (rad.fraga || '') + '</span>';
        html += '<input class="ovn-in bred" data-oppet="' + encodeURIComponent(rad.mal) + '" data-termer="' + (rad.termer || 4)
          + '" data-vars="' + (rad.vars || 'x') + '" data-visa="' + rad.mal + '" inputmode="text" autocomplete="off">';
      } else if(rad.typ === 'pyramid'){
        // ADDITIONSPYRAMID: varje ruta = summan av de två under. Rutor med 'fast' är givna, övriga
        // fylls i. EN RUTA = ETT SVAR (egen markering) — flerrutsrad enligt order 2026-09-21.
        html += '<div class="alg-pyramid">';
        rad.rader.forEach(function(r){
          html += '<div class="alg-pyr-rad">';
          r.forEach(function(c){
            html += (c.fast !== undefined)
              ? '<span class="alg-ruta alg-ruta-fast">' + c.fast + '</span>'
              : '<input class="ovn-in alg-ruta" data-forenkla="' + encodeURIComponent(c.svar) + '" data-vars="' + (rad.vars || 'xy')
                + '" data-visa="' + c.svar + '" inputmode="text" autocomplete="off">';
          });
          html += '</div>';
        });
        html += '</div>';
      } else if(rad.typ === 'magisk'){
        // MAGISK KVADRAT: rad, kolumn och diagonal ger samma summa = 3 · mittrutan. Lösningen är
        // entydig ur de givna rutorna (kontrollerat vid konstruktionen) → varje ruta rättas mot sitt
        // eget värde och visar egen markering.
        html += '<div class="alg-magisk-wrap">';
        if(rad.summa) html += '<div class="alg-magisk-summa">Summan: <em>' + rad.summa + '</em></div>';
        html += '<div class="alg-magisk">';
        rad.rutor.forEach(function(c){
          html += (c.fast !== undefined)
            ? '<span class="alg-ruta alg-ruta-fast">' + c.fast + '</span>'
            : '<input class="ovn-in alg-ruta" data-forenkla="' + encodeURIComponent(c.svar) + '" data-vars="' + (rad.vars || 'xyp')
              + '" data-visa="' + c.svar + '" inputmode="text" autocomplete="off">';
        });
        html += '</div></div>';
      } else if(rad.typ === 'sidor'){
        // ÖPPEN OMKRETS (C5): figuren + TVÅ sidor som tillsammans ska ge den angivna omkretsen.
        // Paret är svaret → båda rutorna får samma markering, men var och en visar den själv.
        html += '<div style="display:flex;flex-direction:column;gap:10px;width:100%;">';
        if(rad.svg) html += '<div class="alg-bild">' + rad.svg + '</div>';
        html += '<div class="alg-sidor" data-halva="' + encodeURIComponent(rad.halva) + '" data-visa="' + rad.visa + '">';
        html += '<input class="ovn-in bred" data-sida="1" data-vars="' + (rad.vars || 'x') + '" inputmode="text" autocomplete="off">';
        html += '<span class="ovn-text" style="margin:0 6px;">och</span>';
        html += '<input class="ovn-in bred" data-sida="2" data-vars="' + (rad.vars || 'x') + '" inputmode="text" autocomplete="off">';
        html += '</div></div>';
      } else if(rad.typ === 'ordtext'){
        // fritext som tolkning (rättas mot lista av godkända formuleringar)
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        var acceptT = (rad.accept || [rad.svar]).join('|');
        html += '<input class="ovn-in bred" data-nokeypad data-text="' + encodeURIComponent(acceptT)
          + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off">';
      } else if(rad.typ === 'bild'){
        // SVG-bild + uttrycks- eller numeriskt svar
        html += '<div style="display:flex;flex-direction:column;gap:10px;width:100%;">';
        html += '<div class="alg-bild">' + rad.svg + '</div>';
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
        html += '<span class="ovn-text">' + (rad.fraga||'') + '</span>';
        if(rad.svarTyp === 'uttryck' && rad.sidor){
          // OMKRETS UR FIGUREN: kedjeruta (uppställning = förenkling), som omkrets-raden.
          html += '<input class="ovn-in bred ovn-kedja" data-omkrets="' + encodeURIComponent(rad.svar)
            + '" data-sidor="' + encodeURIComponent(rad.sidor.join('|')) + '" data-vars="' + (rad.vars || 'xy')
            + '" data-visa="' + rad.sidor.join(' + ') + ' = ' + rad.svar + '" inputmode="text" autocomplete="off">';
        } else if(rad.svarTyp === 'uttryck'){
          var accB = (rad.accept || [rad.svar]).join('|');
          html += '<input class="ovn-in bred" data-uttryck="' + encodeURIComponent(accB)
            + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off">';
        } else if(rad.svarTyp === 'text'){
          var accBt = (rad.accept || [rad.svar]).join('|');
          html += '<input class="ovn-in bred" data-nokeypad data-text="' + encodeURIComponent(accBt)
            + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off">';
        } else {
          html += '<input class="ovn-in" data-svar="' + rad.svar + '" inputmode="decimal" autocomplete="off">';
        }
        html += '</div></div>';
      } else if(rad.typ === 'valruta'){
        // Välj rätt uttryck bland alternativ (kan ha flera rätta). Valfri SVG ovanför.
        html += '<div style="display:flex;flex-direction:column;gap:10px;width:100%;">';
        if(rad.svg) html += '<div class="alg-bild">' + rad.svg + '</div>';
        html += '<span class="ovn-text" style="min-width:160px;">' + (rad.fraga||'') + '</span>';
        var ratta = (rad.ratt || []).join('|');
        var flera = rad.flera ? '1' : '';
        html += '<div class="valruta-grid" data-ratt="' + encodeURIComponent(ratta) + '" data-flera="' + flera + '">';
        rad.alt.forEach(function(a){
          html += '<button type="button" class="valruta-btn" data-val="' + encodeURIComponent(a) + '">' + a + '</button>';
        });
        html += '</div></div>';
      } else if(rad.typ === 'flerled'){
        // Horisontell likhetskedja: uppgift = [insättning] = [förenkling] = [svar]
        // led-objekt: {accept:[...], visa:'...'} ; sista ledet {svar:tal}
        // Stöd för bråk i visat uttryck via rad.vansterHtml (annars rad.vansterText).
        html += '<span class="ovn-text ovn-num">' + (rad.vansterHtml || rad.vansterText) + '</span>';
        html += '<span class="ovn-text" style="margin:0 3px;">=</span>';
        rad.led.forEach(function(led, li){
          var arSvar = (li === rad.led.length - 1);
          if(arSvar){
            html += '<input class="ovn-in" data-svar="' + led.svar + '" inputmode="decimal" autocomplete="off" style="min-width:70px;">';
          } else {
            var acc = (led.accept || [led.visa]).join('|');
            html += '<input class="ovn-in bred" data-form="' + encodeURIComponent(acc)
              + '" data-visa="' + led.visa + '" inputmode="text" autocomplete="off" style="min-width:96px;">';
            html += '<span class="ovn-text" style="margin:0 3px;">=</span>';
          }
        });
      } else if(rad.typ === 'text'){
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in bred" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      } else if(rad.typ === 'term'){
        // Dela upp ett tal i summa av termer – godtar alla korrekta uppdelningar
        html += '<span class="ovn-text" style="min-width:140px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in bred" data-term="' + rad.summa + '" data-antal="' + (rad.antal||2)
          + '" inputmode="text" autocomplete="off">';   // platshållare: ledning, ej exempel (10+8=18 var facit-läcka)
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
      } else if(rad.typ === 'overslag'){
        // [Vänster] (≈ eller =) [mellanled-input] = [svar-input]
        var mellanTecken = rad.tecken || '=';
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<span class="ovn-text" style="margin:0 2px;">' + mellanTecken + '</span>';
        html += '<input class="ovn-in bred" data-mellan="' + rad.mellan
          + '" inputmode="text" autocomplete="off">';
        html += '<span class="ovn-text">=</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      } else if(rad.typ === 'prio'){
        // Lodrät uppställning: uppgiftsrad överst, sedan steg-rad(er) med
        // [vänsterled-ruta] = [svar-ruta]. Vänsterledet rättas på värde, svaret exakt.
        html = html.replace('class="ovn-rad"', 'class="ovn-rad prio-rad"');
        html += '<div class="prio-block">';
        html += '<div class="prio-uppgift"><span class="ovn-num">' + rad.vansterText + '</span><span class="prio-eq">=</span></div>';
        var steg = rad.steg || [];
        steg.forEach(function(st, si){
          var arSista = (si === steg.length - 1);
          html += '<div class="prio-steg">';
          html += '<input class="ovn-in prio-vl" data-vl="' + st.vlValue + '" inputmode="text" autocomplete="off">';
          html += '<span class="prio-eq">=</span>';
          if(arSista){
            html += '<input class="ovn-in prio-svar" data-svar="' + rad.svar + '" inputmode="decimal" autocomplete="off">';
          } else {
            html += '<span class="prio-tom"></span>';
          }
          html += '</div>';
        });
        html += '</div>';
        html += '</div>';
        return;
      } else if(rad.typ === 'mellan'){
        // [Vänster]  = [mellanled-input]  = [svar-input]
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in bred" data-mellan="' + rad.mellan
          + '" inputmode="text" autocomplete="off">';
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
      egnaMarken(inp);   // rutans egen ✓/✗ + facit bort vid ändring (inte grannarnas)
      // Auto-mellanrum runt + och − i mellanled-fält (data-form)
      if(inp.dataset.form !== undefined){
        var pos = inp.selectionStart;
        var fore = inp.value.slice(0, pos);
        var ny = inp.value
          .replace(/\s*([+\u2212-])\s*/g, ' $1 ')   // mellanrum runt + och −
          .replace(/\s{2,}/g, ' ')                    // inga dubbla mellanrum
          .replace(/^\s+/, '');                        // inget inledande mellanrum
        if(ny !== inp.value){
          // justera markörposition efter inskjutna mellanrum
          var foreNy = fore.replace(/\s*([+\u2212-])\s*/g, ' $1 ').replace(/\s{2,}/g,' ').replace(/^\s+/,'');
          inp.value = ny;
          var nyPos = foreNy.length;
          try{ inp.setSelectionRange(nyPos, nyPos); }catch(e){}
        }
      }
    });
  });

  // Knappsats – EN delad AK8_UI-keypad per sida (inte en per blad): monteras i document.body (utanför
  // blad-mounts/ev. transform) och binds mot hela sidan → följer fokus över alla blad, Enter→nästa ruta,
  // kontext-gråning, ⌫. Mönstret ur d1/d2 (a320f04), sedan 2026-09-19 kärnans för alla blad.
  if(window.AK8_UI && !document.getElementById('ovn-keypad-shared')){
    var _kw = document.createElement('div'); _kw.innerHTML = AK8_UI.keypadHTML();
    var _kp = _kw.firstChild; if(_kp){
      _kp.id = 'ovn-keypad-shared'; document.body.appendChild(_kp); AK8_UI.bindKeypad(document.body);
      // Synlig bara när ett blad syns. Förr låg keypaden inne i bladet och försvann med Öva-panelen; i body
      // måste den själv dölja sig på Föreläsning/Färdighetsträning/Test (egna ytor, egna keypads). Flikbyte =
      // klass-/hidden-ändring på paneler/mounts → MutationObserver. När ett blad syns lämnas beslutet till
      // bindKeypads ordsvars-regel (data-nokeypad) så de två inte drar åt olika håll.
      var _syn = function(){
        var bladSyns = Array.prototype.some.call(document.querySelectorAll('.ovn-sheet'), function(el){ return el.getClientRects().length > 0; });
        var a = document.activeElement;
        var dolj = !bladSyns || !!(a && a.tagName === 'INPUT' && a.matches('[data-nokeypad]'));
        // Skriv bara vid FAKTISK ändring: classList.add/remove sätter attributet även när inget ändras →
        // observern skulle trigga sig själv i all oändlighet.
        if(_kp.classList.contains('keypad-hidden') !== dolj) _kp.classList.toggle('keypad-hidden', dolj);
      };
      new MutationObserver(_syn).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'hidden', 'style'] });
      _syn();
    }
  }

  // Flervalsknappar – markera valt alternativ
  rotEl.querySelectorAll('.ovn-val-grid').forEach(function(grid){
    grid.querySelectorAll('.ovn-val-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        grid.querySelectorAll('.ovn-val-btn').forEach(function(b){
          b.classList.remove('is-vald','correct','wrong');
        });
        btn.classList.add('is-vald');
        grid.dataset.valt = btn.dataset.val;
      });
    });
  });

  // Multi-select-knappar – toggla av/på (välj flera)
  rotEl.querySelectorAll('.ovn-flerval-grid').forEach(function(grid){
    grid.querySelectorAll('.ovn-flerval-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        btn.classList.toggle('is-vald');
        btn.classList.remove('correct','wrong','missad');
      });
    });
  });

  // Valruta-knappar: enkel- eller flerval
  // ── VÄXANDE RUTOR: uttrycksrutor växer med innehållet (AK8_UI.grow — samma funktion som åttans
  // blad använder). Golvet är rutans EGEN css-bredd, så tomma rutor ser ut precis som förut.
  // Rutor med bara ett tal (data-svar) rörs inte: de ska hålla sin form i uppställningar och rutnät.
  // OBS: rutnätens rutor (pyramid, magisk kvadrat) står UTANFÖR — de ska hålla sin form i rutnätet.
  var VAXER = '.ovn-in[data-forenkla]:not(.alg-ruta),.ovn-in[data-omkrets],.ovn-in[data-oppet],.ovn-in[data-uttryck],.ovn-in[data-sida],.ovn-in[data-form],.ovn-in[data-text]';
  function vaxRuta(inp){
    if(!inp || !window.AK8_UI || !AK8_UI.grow) return;
    if(inp.dataset.minw === undefined){
      var b = Math.round(inp.getBoundingClientRect().width);
      inp.dataset.minw = String(b > 0 ? b : 90);
    }
    AK8_UI.grow(inp, { min: parseInt(inp.dataset.minw, 10) });
  }
  rotEl.querySelectorAll(VAXER).forEach(function(inp){
    vaxRuta(inp);
    inp.addEventListener('input', function(){ vaxRuta(inp); });
  });

  rotEl.querySelectorAll('.valruta-grid').forEach(function(grid){
    var flera = grid.dataset.flera === '1';
    grid.querySelectorAll('.valruta-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(flera){
          btn.classList.toggle('is-vald');
        } else {
          grid.querySelectorAll('.valruta-btn').forEach(function(b){ b.classList.remove('is-vald','correct','wrong'); });
          btn.classList.add('is-vald');
        }
      });
    });
  });

  // Kontroll / Återställ / Skriv ut
  var forstaForsoket = true; // 0-1 fel på första försöket -> nytt blad
  rotEl.querySelector('[data-action="kontroll"]').addEventListener('click', function(){
    var ratt = 0, totalt = 0;
    // Vid stegvis läge: rätta bara det synliga avsnittet
    var aktivaInputs = blad.stegvis
      ? inputs.filter(function(inp){ var g = inp.closest('.ovn-grupp'); return g && !g.classList.contains('steg-dold'); })
      : inputs;
    // Sid-paret (typ 'sidor') rättas som PAR i en egen loop nedan — hoppas över här, annars räknas
    // rutorna en gång till i nämnaren och facit-kedjan saknar data-svar.
    aktivaInputs = aktivaInputs.filter(function(inp){ return inp.dataset.sida === undefined; });
    aktivaInputs.forEach(function(inp){
      var rad = inp.parentElement;
      // Ta bort rutans EGNA tidigare fasit + markering (inte grannarnas — se egnaMarken)
      egnaMarken(inp);
      inp.classList.remove('correct','wrong','just-checked');
      var ok, _besked = null;
      if(inp.dataset.forenkla !== undefined){
        // FÖRENKLA: värde + skriven form (AlgBrak.gradePoly). 'form' = rätt värde men inte förenklat
        // → räknas som fel, men beskedet talar om VAD som är kvar att göra (samma två lägen som bråken).
        var _rf = window.AlgBrak ? window.AlgBrak.gradePoly(inp.value, decodeURIComponent(inp.dataset.forenkla)) : { status: 'fel' };
        ok = _rf.status === 'ratt';
        if(_rf.status === 'form') _besked = _rf.besked;
        else if(_rf.parsefel) _besked = _rf.besked;
      } else if(inp.dataset.omkrets !== undefined){
        // OMKRETS SOM KEDJA: uppställningen (figurens sidor adderade) + förenklingen i samma ruta.
        // Bara slutsvaret är inte "fel värde" — det saknar uppställningen, och beskedet säger det.
        var _so = decodeURIComponent(inp.dataset.sidor || '').split('|').filter(Boolean);
        var _rk = window.AlgBrak ? window.AlgBrak.gradeOmkrets(inp.value, _so, decodeURIComponent(inp.dataset.omkrets)) : { status: 'fel' };
        ok = _rk.status === 'ratt';
        if(!ok && _rk.besked) _besked = _rk.besked;
      } else if(inp.dataset.oppet !== undefined){
        // ÖPPET SVAR: eget uttryck med bestämt antal termer som förenklas till målet.
        var _ro = window.AlgBrak ? window.AlgBrak.gradeOppet(inp.value, decodeURIComponent(inp.dataset.oppet), parseInt(inp.dataset.termer, 10)) : { status: 'fel' };
        ok = _ro.status === 'ratt';
        if(_ro.besked) _besked = _ro.besked;
      } else if(inp.dataset.uttryck !== undefined){
        var godk = decodeURIComponent(inp.dataset.uttryck).split('|');
        ok = jamforUttryck(inp.value, godk)
          || godk.some(function(g){ return jamforForenkla(inp.value, g); })
          || godk.some(function(g){ return jamforFler(inp.value, g); });
      } else if(inp.dataset.form !== undefined){
        ok = jamforForm(inp.value, decodeURIComponent(inp.dataset.form).split('|'));
      } else if(inp.dataset.text !== undefined){
        ok = jamforText(inp.value, decodeURIComponent(inp.dataset.text).split('|'));
      } else if(inp.dataset.oms !== undefined){
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
      } else if(inp.dataset.min !== undefined){
        // intervall: talet ska ligga strikt mellan min och max, och de två fälten i paret ska skilja sig
        var lo = parseFloat(inp.dataset.min), hi = parseFloat(inp.dataset.max);
        var vi = parseFloat(String(inp.value).replace(',','.'));
        var inomIntervall = !isNaN(vi) && vi > lo && vi < hi;
        // hitta parets andra fält
        var par = rotEl.querySelectorAll('.ovn-intervall[data-par="' + inp.dataset.par + '"]');
        var olika = true;
        if(par.length === 2){
          var v0 = parseFloat(String(par[0].value).replace(',','.'));
          var v1 = parseFloat(String(par[1].value).replace(',','.'));
          if(!isNaN(v0) && !isNaN(v1) && Math.abs(v0 - v1) < 1e-9) olika = false;
        }
        ok = inomIntervall && olika;
      } else if(inp.dataset.fritext !== undefined){
        // fritext/uttryck/decimaltal – jämför mot lista av godkända varianter (d10:s jamforText)
        ok = jamforFritext(inp.value, decodeURIComponent(inp.dataset.fritext).split('|'));
      } else if(inp.dataset.ordna !== undefined){
        // sorteringsfält – jämför positionens tal
        ok = jamforTal(inp.value, parseFloat(inp.dataset.ordna));
      } else if(inp.dataset.intmin !== undefined){
        // intervall (en ruta) – vilket tal som helst inom gränserna godtas; data-exkl=1 → strikt
        var vI = parseFloat(String(inp.value).replace(',', '.'));
        var mnI = parseFloat(inp.dataset.intmin), mxI = parseFloat(inp.dataset.intmax);
        if(isNaN(vI)) ok = false;
        else if(inp.dataset.exkl === '1') ok = vI > mnI && vI < mxI;
        else ok = vI >= mnI && vI <= mxI;
      } else if(inp.dataset.faktor !== undefined){
        // faktorisering – godtar alla korrekta uppdelningar
        var malTalF = parseInt(inp.dataset.faktor, 10);
        var malAntalF = parseInt(inp.dataset.antal, 10);
        var delar = String(inp.value).replace(/\u2212/g,'-')
          .replace(/[x×*]/g,'·').replace(/\s/g,'').split('·');
        var produkt = 1, giltigtF = true;
        if(delar.length !== malAntalF) giltigtF = false;
        delar.forEach(function(d){
          var dv = parseInt(d, 10);
          if(isNaN(dv) || dv < 2) giltigtF = false;
          else produkt *= dv;
        });
        ok = giltigtF && produkt === malTalF;
      } else if(inp.dataset.vl !== undefined){
        // Prioritering, vänsterled: rättas på värde
        var elevVarde = prioEval(inp.value);
        ok = elevVarde !== null && Math.abs(elevVarde - parseFloat(inp.dataset.vl)) < 1e-6;
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
      // STORE-ROUTE: k1-taxonomin bor i window.Mastery, k3 (algebra) i window.MasteryK3. Utan route
      // hamnade algebra-evidensen i k1-storen. data-logg-store sätts av bladets data (grupp.loggStore).
      var _store = (_grEl && _grEl.getAttribute('data-logg-store') === 'k3') ? window.MasteryK3 : window.Mastery;
      // Omskrivningscellen (data-oms) loggas EJ separat — annars två evidens per uppgift; svarscellen bär loggen.
      if(_loggNod && inp.dataset.oms === undefined && String(inp.value).trim() !== '' && _store && _store.loggaForsok){
        _store.loggaForsok(_loggNod, ok ? 'ratt' : 'fel');
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
        else if(inp.dataset.uttryck !== undefined) facit = inp.dataset.visa;
        else if(inp.dataset.form !== undefined) facit = inp.dataset.visa;
        else if(inp.dataset.text !== undefined) facit = inp.dataset.visa;
        else if(inp.dataset.mellan) facit = inp.dataset.mellan;
        else if(inp.dataset.enhet) facit = inp.dataset.enhet;
        else if(inp.dataset.term !== undefined) facit = 'summan ska bli ' + inp.dataset.term.replace('.', ',');
        else if(inp.dataset.tvatal !== undefined) facit = inp.dataset.tvatal.split(',').join(' och ');
        else if(inp.dataset.min !== undefined) facit = 'ett tal mellan ' + inp.dataset.min.replace('.', ',') + ' och ' + inp.dataset.max.replace('.', ',') + ' (två olika)';
        else if(inp.dataset.fritext !== undefined) facit = inp.dataset.visa;
        else if(inp.dataset.ordna !== undefined) facit = inp.dataset.ordna.replace('.', ',');
        else if(inp.dataset.intmin !== undefined) facit = 'ett tal mellan ' + String(parseFloat(inp.dataset.intmin)).replace('.', ',') + ' och ' + String(parseFloat(inp.dataset.intmax)).replace('.', ',');
        else if(inp.dataset.faktor !== undefined) facit = 'produkt = ' + parseInt(inp.dataset.faktor, 10) + ', ' + parseInt(inp.dataset.antal, 10) + ' faktorer (minst 2 var)';
        else if(inp.dataset.vl !== undefined) facit = 'ledet ska bli ' + String(parseFloat(inp.dataset.vl)).replace('.', ',');
        else if(inp.dataset.omkrets !== undefined) facit = inp.dataset.visa;   // "3x + 5x + 4x = 12x"
        else if(inp.dataset.forenkla !== undefined) facit = inp.dataset.visa;
        else if(inp.dataset.oppet !== undefined) facit = 'ett eget uttryck med ' + inp.dataset.termer + ' termer som förenklas till ' + inp.dataset.visa;
        else facit = inp.dataset.svar.replace('.', ',');
        var f = document.createElement('span');
        f.className = 'ovn-fasit';
        f.textContent = _besked ? _besked : ('rätt svar: ' + facit);   // 'form'-läget: beskedet i stället för facit (eleven har rätt värde)
        inp.insertAdjacentElement('afterend', mark);
        mark.insertAdjacentElement('afterend', f);
      }
      // Ta bort blink-klassen efter animationen
      setTimeout(function(){ inp.classList.remove('just-checked'); }, 500);
    });
    // Rätta valruta-grids (välj rätt uttryck, ev. flera rätta)
    rotEl.querySelectorAll('.valruta-grid').forEach(function(grid){
      if(blad.stegvis){ var gg = grid.closest('.ovn-grupp'); if(gg && gg.classList.contains('steg-dold')) return; }
      totalt++;
      var ratta = decodeURIComponent(grid.dataset.ratt).split('|');
      var flera = grid.dataset.flera === '1';
      var valda = [];
      grid.querySelectorAll('.valruta-btn').forEach(function(b){
        b.classList.remove('correct','wrong');
        var bv = decodeURIComponent(b.dataset.val);
        var arRatt = ratta.some(function(r){ return jamforUttryck(bv,[r]) || jamforFler(bv,r); });
        if(b.classList.contains('is-vald')){
          valda.push(bv);
          b.classList.add(arRatt ? 'correct' : 'wrong');
        } else if(arRatt){
          b.classList.add('correct'); // visa de rätta även om ej valda
        }
      });
      // rätt om: valt minst ett, och alla valda är rätta, och (om ej flera) exakt ett valt
      var allaValdaRatt = valda.length>0 && valda.every(function(v){ return ratta.some(function(r){ return jamforUttryck(v,[r])||jamforFler(v,r); }); });
      var antalRatta = ratta.length;
      var ok = allaValdaRatt && (flera ? valda.length===antalRatta : valda.length===1);
      if(ok) ratt++;
    });
    // Rätta öppna sid-par (typ 'sidor'): a + b = halva omkretsen. Paret = ETT svar i nämnaren,
    // men båda rutorna får sin egen markering (flerruts-regeln).
    rotEl.querySelectorAll('.alg-sidor').forEach(function(box){
      totalt++;
      var a = box.querySelector('[data-sida="1"]'), b = box.querySelector('[data-sida="2"]');
      [a, b].forEach(function(i){ i.classList.remove('correct', 'wrong', 'just-checked'); egnaMarken(i); });
      if(!String(a.value).trim() && !String(b.value).trim()) return;   // obesvarad: räknad, men inte rättad
      var res = window.AlgBrak ? window.AlgBrak.gradeSidor(a.value, b.value, decodeURIComponent(box.dataset.halva)) : { status: 'fel' };
      var okS = res.status === 'ratt';
      [a, b].forEach(function(i){
        i.classList.add(okS ? 'correct' : 'wrong', 'just-checked');
        var mk = document.createElement('span'); mk.className = 'ovn-mark ' + (okS ? 'ok' : 'fel'); mk.textContent = okS ? '✓' : '✗';
        i.insertAdjacentElement('afterend', mk);
      });
      if(okS) ratt++;
      else {
        var fs2 = document.createElement('span'); fs2.className = 'ovn-fasit';
        fs2.textContent = res.besked || ('sidorna ska tillsammans ge omkretsen ' + box.dataset.visa);
        box.appendChild(fs2);
      }
      var _gr = box.closest('.ovn-grupp'), _nod = _gr && _gr.getAttribute('data-logg');
      var _st = (_gr && _gr.getAttribute('data-logg-store') === 'k3') ? window.MasteryK3 : window.Mastery;
      if(_nod && _st && _st.loggaForsok) _st.loggaForsok(_nod, okS ? 'ratt' : 'fel');
    });

    // Rätta flervalsfrågor
    rotEl.querySelectorAll('.ovn-val-grid').forEach(function(grid){
      totalt++;
      var ratt_svar = grid.dataset.valsvar;
      var valt = grid.dataset.valt;
      grid.querySelectorAll('.ovn-val-btn').forEach(function(b){
        b.classList.remove('correct','wrong');
        if(b.dataset.val === ratt_svar) b.classList.add('correct');
        else if(b.dataset.val === valt) b.classList.add('wrong');
      });
      if(valt === ratt_svar) ratt++;
    });
    // Rätta multi-select (delbarhet): alla rätta valda, inga felaktiga
    rotEl.querySelectorAll('.ovn-flerval-grid').forEach(function(grid){
      totalt++;
      var rattaTal = grid.dataset.ratt.split(',');
      var alltRatt = true;
      grid.querySelectorAll('.ovn-flerval-btn').forEach(function(b){
        b.classList.remove('correct','wrong','missad');
        var arRatt = rattaTal.indexOf(b.dataset.tal) >= 0;
        var arVald = b.classList.contains('is-vald');
        if(arVald && arRatt){ b.classList.add('correct'); }
        else if(arVald && !arRatt){ b.classList.add('wrong'); alltRatt = false; }
        else if(!arVald && arRatt){ b.classList.add('missad'); alltRatt = false; }
      });
      if(alltRatt) ratt++;
    });
    // Förklaringsfrågor – visa exempelfacit (rättas inte)
    rotEl.querySelectorAll('[data-forklara]').forEach(function(ta){
      var gammalFacit = ta.parentElement.querySelector('.forklara-facit');
      if(gammalFacit) gammalFacit.remove();
      var facit = decodeURIComponent(ta.dataset.forklara);
      var fd = document.createElement('div');
      fd.className = 'forklara-facit';
      fd.style.cssText = 'margin-top:8px;padding:10px 14px;background:var(--bg-warm);border-left:3px solid var(--gold);border-radius:6px;font-size:14px;color:var(--ink-soft);';
      fd.innerHTML = '<strong>Exempel på svar:</strong> ' + facit;
      ta.insertAdjacentElement('afterend', fd);
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

    // Valfri callback (används bl.a. för att låsa upp Stencil B)
    if(typeof blad.onResultat === 'function'){ blad.onResultat(ratt, totalt); }

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
    rotEl.querySelectorAll('.valruta-btn').forEach(function(b){ b.classList.remove('is-vald','correct','wrong'); });
    rotEl.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
    // Nollställ flervalsknappar – ta bort vald, rätt och fel
    rotEl.querySelectorAll('.ovn-val-grid').forEach(function(grid){
      grid.querySelectorAll('.ovn-val-btn').forEach(function(b){
        b.classList.remove('is-vald','correct','wrong');
      });
      delete grid.dataset.valt;
    });
    // Nollställ multi-select
    rotEl.querySelectorAll('.ovn-flerval-btn').forEach(function(b){
      b.classList.remove('is-vald','correct','wrong','missad');
    });
    rotEl.querySelectorAll('.forklara-facit').forEach(function(f){ f.remove(); });
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

  // Steg-navigering: visa ett avsnitt (en grupp) i taget
  if(blad.stegvis){
    var grupper = Array.from(rotEl.querySelectorAll('.ovn-grupp'));
    var stegInfo = rotEl.querySelector('[data-steg-info]');
    var prevBtn = rotEl.querySelector('[data-steg="prev"]');
    var nextBtn = rotEl.querySelector('[data-steg="next"]');
    var aktuellt = 0;
    function visaSteg(i){
      aktuellt = Math.max(0, Math.min(grupper.length-1, i));
      grupper.forEach(function(g, gi){ g.classList.toggle('steg-dold', gi !== aktuellt); });
      stegInfo.textContent = 'Avsnitt ' + (aktuellt+1) + ' av ' + grupper.length;
      prevBtn.disabled = (aktuellt === 0);
      nextBtn.disabled = (aktuellt === grupper.length-1);
      var nav = rotEl.querySelector('[data-stegnav]');
      if(nav) nav.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
    prevBtn.addEventListener('click', function(){ visaSteg(aktuellt-1); });
    nextBtn.addEventListener('click', function(){ visaSteg(aktuellt+1); });
    visaSteg(0);
  }

  if(inputs[0]) inputs[0].focus();
}

