/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k1-d10-pluggtillprov.html
   Byte-identiskt utbrutet (hela scriptet, logik orörd). Egen generation. */
// ---- PLUGG-MENY (byggs nedan) ----

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
  // tillåt komma eller punkt, ignorera mellanslag, normalisera minustecken
  if(a == null) return false;
  var s = String(a).replace(/\s/g,'').replace(/\u2212/g,'-').replace(',', '.');
  if(s === '') return false;
  var n = parseFloat(s);
  if(isNaN(n)) return false;
  return Math.abs(n - b) < 1e-9;
}
function jamforText(a, godkanda){
  // Jämför fritext mot en lista godkända svar. Ignorerar mellanslag,
  // gemener/versaler, och normaliserar ·/x/* samt komma/punkt.
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
function jamforMellan(a, b){
  // mellanled får skrivas med eller utan likhetstecken, mellanslag, ·/x/*, − → -
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
function jamforEnhet(a, b){
  // Enhet rättas flexibelt: utan mellanslag, gemener,
  // och med vanliga skrivvarianter (kr/sek osv. accepteras).
  if(a == null) return false;
  var alias = {
    'sek':'s', 'sekund':'s', 'sekunder':'s',
    'kr':'kr', 'kronor':'kr', 'krona':'kr',
    'meter':'m', 'metrar':'m',
    'kilometer':'km',
    'centimeter':'cm',
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
    html += '<div class="ovn-grupp">';
    html += '<div class="ovn-grupp-rubrik">' + (gi+1) + '. ' + grupp.rubrik + '</div>';
    grupp.rader.forEach(function(rad){
      radNummer++;
      var bokstav = String.fromCharCode(96 + ((radNummer - 1) % 26) + 1); // a, b, c...
      // FAKTOR: faktorisera ett tal – godtar alla korrekta faktoriseringar
      if(rad.typ === 'faktor'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text ovn-num">' + rad.tal + ' =</span>';
        html += '<input class="ovn-in bred" data-faktor="' + rad.tal + '" data-antal="' + rad.antal
          + '" inputmode="text" autocomplete="off" placeholder="' + (rad.antal===2?'t.ex. 2·9':'t.ex. 2·2·9') + '">';
        html += '</div>';
        return;
      }
      // FORKLARA: fritextsvar, ingen rätt/fel – visar facit vid kontroll
      if(rad.typ === 'forklara'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '" style="flex-direction:column;align-items:stretch;gap:8px;">';
        html += '<textarea class="prob-kladd" data-forklara="' + encodeURIComponent(rad.facit)
          + '" rows="3" placeholder="Skriv din förklaring här..."></textarea>';
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
        html += '<input class="ovn-in" data-text="' + encodeURIComponent(acc)
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
      if(rad.typ === 'intervall'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        html += '<input class="ovn-in bred" data-min="' + rad.min + '" data-max="' + rad.max
          + '" data-exkl="' + (rad.exkl ? '1' : '0') + '" inputmode="decimal" autocomplete="off" placeholder="ditt tal">';
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
      if(rad.typ === 'text'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text" style="flex:1;min-width:160px;">' + rad.fraga + '</span>';
        var accept = (rad.accept || [rad.svar]).join('|');
        html += '<input class="ovn-in bred" data-text="' + encodeURIComponent(accept)
          + '" data-visa="' + rad.svar + '" inputmode="text" autocomplete="off" placeholder="svar">';
        html += '</div>';
        return;
      }
      // ORDNA: tal som ska sorteras – eleven skriver i ordning i fält
      if(rad.typ === 'ordna'){
        html += '<div class="ovn-rad" data-rad="' + radNummer + '" style="flex-wrap:wrap;">';
        html += '<span class="ovn-label">' + bokstav + ')</span>';
        html += '<span class="ovn-text" style="width:100%;font-size:16px;color:var(--ink-faint);">Talen: '
          + rad.tal.join('  ·  ') + '</span>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;width:100%;margin-top:6px;">';
        rad.ordning.forEach(function(t, i){
          html += '<input class="ovn-in" data-ordna="' + rad.ordning[i].replace(/,/g,'.')
            + '" inputmode="decimal" autocomplete="off" style="width:74px;"'
            + ' placeholder="' + (i+1) + ':a">';
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
      // räkna om bokstav per grupp
      html += '<div class="ovn-rad" data-rad="' + radNummer + '">';
      html += '<span class="ovn-label">' + bokstav + ')</span>';
      if(rad.typ === 'enkel'){
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<input class="ovn-in" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
      } else if(rad.typ === 'lucka'){
        // text innehåller '__' där luckan ska sitta
        var bitar = rad.text.split('__');
        html += '<span class="ovn-text ovn-num">' + bitar[0] + '</span>';
        html += '<input class="ovn-in lucka" data-svar="' + rad.svar
          + '" inputmode="decimal" autocomplete="off">';
        if(bitar[1] !== undefined) html += '<span class="ovn-text ovn-num">' + bitar[1] + '</span>';
      } else if(rad.typ === 'mellan'){
        // [Vänster] (≈ eller =) [mellanled-input] = [svar-input]
        var mellanTecken = rad.tecken || '=';
        html += '<span class="ovn-text ovn-num">' + rad.vansterText + '</span>';
        html += '<span class="ovn-text" style="margin:0 2px;">' + mellanTecken + '</span>';
        html += '<input class="ovn-in bred" data-mellan="' + rad.mellan
          + '" inputmode="text" autocomplete="off" placeholder="överslag">';
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
          html += '<input class="ovn-in prio-vl" data-vl="' + st.vlValue + '" inputmode="text" autocomplete="off" placeholder="förenkla">';
          html += '<span class="prio-eq">=</span>';
          if(arSista){
            html += '<input class="ovn-in prio-svar" data-svar="' + rad.svar + '" inputmode="decimal" autocomplete="off" placeholder="svar">';
          } else {
            html += '<span class="prio-tom"></span>';
          }
          html += '</div>';
        });
        html += '</div>';
        html += '</div>';
        return;
      }
      html += '</div>';
    });
    radNummer = 0; // bokstäver räknas om per grupp
  });

  // räkna om labels per grupp
  html += '</div>';

  // Knappsats – samma stil som öva-delen
  html += '<div class="ovn-wrap" style="padding-top:0;">';
  html += '<div class="ovn-keypad" data-keypad>';
  // Sifferblock 7-8-9 / 4-5-6 / 1-2-3 / 0(span2) backsteg
  html += '<div class="ovn-keypad-digits">';
  ['7','8','9','4','5','6','1','2','3'].forEach(function(d){
    html += '<button type="button" class="ovn-kp-key" data-key="' + d + '">' + d + '</button>';
  });
  html += '<button type="button" class="ovn-kp-key span2" data-key="0">0</button>';
  html += '<button type="button" class="ovn-kp-key util" data-key="back">\u232B</button>';
  html += '</div>';
  // Operator-kolumn: , − / · =
  html += '<div class="ovn-keypad-ops">';
  [',','−','/','·','='].forEach(function(o){
    html += '<button type="button" class="ovn-kp-key op" data-key="' + o + '">' + o + '</button>';
  });
  html += '</div>';
  html += '</div>';

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
    inp.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === 'Tab' && !e.shiftKey){
        if(e.key === 'Enter'){
          e.preventDefault();
          if(i + 1 < inputs.length) inputs[i+1].focus();
        }
      }
    });
    inp.addEventListener('input', function(){
      inp.classList.remove('correct','wrong');
      var f = inp.parentElement.querySelector('.ovn-fasit');
      if(f) f.remove();
    });
  });

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
      if(k === 'back'){
        aktiv.value = aktiv.value.slice(0, -1);
      } else {
        aktiv.value += k;
      }
      aktiv.dispatchEvent(new Event('input', {bubbles:true}));
      aktiv.focus();
    });
  });

  // Kontroll / Återställ / Skriv ut
  var forstaForsoket = true; // 0-1 fel på första försöket -> nytt blad
  rotEl.querySelector('[data-action="kontroll"]').addEventListener('click', function(){
    var ratt = 0, totalt = 0;
    inputs.forEach(function(inp){
      var rad = inp.closest('.ovn-rad, .ovn-brak-rad, .prob-rad') || inp.parentElement;
      // Ta bort eventuella tidigare fasit-spans och markeringar
      rad.querySelectorAll('.ovn-fasit, .ovn-mark').forEach(function(f){ f.remove(); });
      inp.classList.remove('correct','wrong','just-checked');
      var ok;
      var facitText = null;
      if(inp.dataset.mellan){
        ok = jamforMellan(inp.value, inp.dataset.mellan);
        facitText = inp.dataset.mellan;
      } else if(inp.dataset.enhet){
        ok = jamforEnhet(inp.value, inp.dataset.enhet);
        facitText = inp.dataset.enhet;
      } else if(inp.dataset.text !== undefined){
        // textsvar – jämför mot lista av godkända varianter
        var godkanda = decodeURIComponent(inp.dataset.text).split('|');
        ok = jamforText(inp.value, godkanda);
        facitText = inp.dataset.visa;
      } else if(inp.dataset.ordna !== undefined){
        // sorteringsfält – jämför positionens tal
        ok = jamforTal(inp.value, parseFloat(inp.dataset.ordna));
        facitText = inp.dataset.ordna.replace('.', ',');
      } else if(inp.dataset.min !== undefined){
        // intervall – vilket tal som helst inom gränserna godtas
        var v = parseFloat(String(inp.value).replace(',', '.'));
        var mn = parseFloat(inp.dataset.min), mx = parseFloat(inp.dataset.max);
        if(isNaN(v)){
          ok = false;
        } else if(inp.dataset.exkl === '1'){
          ok = v > mn && v < mx;
        } else {
          ok = v >= mn && v <= mx;
        }
        facitText = 'ett tal mellan ' + String(mn).replace('.', ',') + ' och ' + String(mx).replace('.', ',');
      } else if(inp.dataset.faktor !== undefined){
        // faktorisering – godtar alla korrekta uppdelningar
        var malTal = parseInt(inp.dataset.faktor, 10);
        var malAntal = parseInt(inp.dataset.antal, 10);
        var delar = String(inp.value).replace(/\u2212/g,'-')
          .replace(/[x×*]/g,'·').replace(/\s/g,'').split('·');
        var produkt = 1, giltigt = true;
        if(delar.length !== malAntal) giltigt = false;
        delar.forEach(function(d){
          var dv = parseInt(d, 10);
          if(isNaN(dv) || dv < 2) giltigt = false;
          else produkt *= dv;
        });
        ok = giltigt && produkt === malTal;
        facitText = 'produkt = ' + malTal + ', ' + malAntal + ' faktorer (minst 2 var)';
      } else if(inp.dataset.vl !== undefined){
        // Prioritering, vänsterled: rättas på värde
        var elevVarde = prioEval(inp.value);
        var malVarde = parseFloat(inp.dataset.vl);
        ok = elevVarde !== null && Math.abs(elevVarde - malVarde) < 1e-6;
        facitText = 'ledet ska bli ' + String(malVarde).replace('.', ',');
      } else {
        ok = jamforTal(inp.value, parseFloat(inp.dataset.svar));
        facitText = inp.dataset.svar ? inp.dataset.svar.replace('.', ',') : '';
      }
      totalt++;
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
        var f = document.createElement('span');
        f.className = 'ovn-fasit';
        f.textContent = 'rätt svar: ' + facitText;
        inp.insertAdjacentElement('afterend', mark);
        mark.insertAdjacentElement('afterend', f);
      }
      // Ta bort blink-klassen efter animationen
      setTimeout(function(){ inp.classList.remove('just-checked'); }, 500);
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

  if(inputs[0]) inputs[0].focus();
}

// ============================================================
// UPPGIFTSDATA – stencilerna från Joachim
// ============================================================
// ============================================================
// PLUGG TILL PROV – meny och dokument
// ============================================================
// 14 dokument grupperade i kategorier + en självskattningsmatris.
// Varje dokument byggs med samma övningsmotor (bladHTML/bygg_blad).
// Dokument som ännu inte är byggda har 'klar:false' och visas som
// "byggs snart".

var PLUGG_GRUPPER = [
  {id:'talsystem', namn:'Talsystem', dok:[
    {nr:1,  id:'tio',        namn:'Tiosystemet',            klar:true},
    {nr:2,  id:'tallinjer',  namn:'Tallinjer',              klar:true},
    {nr:3,  id:'jobbatal',   namn:'Jobba med tal',          klar:true}
  ]},
  {id:'raknesatt', namn:'Räknesätt', dok:[
    {nr:4,  id:'metoder',    namn:'Metoder i de fyra räknesätten', klar:true},
    {nr:5,  id:'tiopotens',  namn:'Multiplikation med 10, 100 och 1000', klar:true},
    {nr:6,  id:'storasma',   namn:'Multiplikation med stora och små tal', klar:true},
    {nr:7,  id:'prio',       namn:'Prioriteringsregeln',    klar:true}
  ]},
  {id:'delbarhet', namn:'Delbarhet', dok:[
    {nr:8,  id:'delbarhet',  namn:'Delbarhet',              klar:true},
    {nr:9,  id:'faktorisera', namn:'Faktorisera',           klar:true}
  ]},
  {id:'former', namn:'Tal i olika former', dok:[
    {nr:10, id:'brak',       namn:'Bråk och decimaltal',    klar:true},
    {nr:11, id:'negativa',   namn:'Negativa tal',           klar:true},
    {nr:12, id:'avrundning', namn:'Avrundning',             klar:true}
  ]},
  {id:'problem', namn:'Problemlösning', dok:[
    {nr:13, id:'overslag',   namn:'Överslagsräkning',       klar:true},
    {nr:14, id:'lastal',     namn:'Lästal',                 klar:true}
  ]},
  {id:'sjalvskattning', namn:'Självskattning', dok:[
    {nr:15, id:'matris',     namn:'Självskattningsmatris',  klar:false}
  ]}
];

// Dokumentinnehåll – byggs ut efterhand. Nyckel = dokumentets id.
// Faktorisera-dokumentets vanliga uppgifter (1-5). Faktorträd byggs separat.
var PLUGG_FAKTORISERA = {
  titel:'',
  intro:'',
  grupper:[
    {rubrik:'Faktorisera talet i två faktorer (t.ex. 2·9)', rader:[
      {typ:'faktor', tal:18, antal:2},
      {typ:'faktor', tal:25, antal:2},
      {typ:'faktor', tal:27, antal:2},
      {typ:'faktor', tal:42, antal:2}
    ]},
    {rubrik:'Faktorisera talet i tre faktorer (t.ex. 2·2·9)', rader:[
      {typ:'faktor', tal:36, antal:3},
      {typ:'faktor', tal:24, antal:3},
      {typ:'faktor', tal:12, antal:3},
      {typ:'faktor', tal:64, antal:3}
    ]},
    {rubrik:'Vad menas med ett primtal? Ge tre exempel', rader:[
      {typ:'forklara', facit:'Ett primtal är ett tal större än 1 som bara är delbart med 1 och sig självt. Exempel: 2, 3, 5, 7, 11, 13.'}
    ]},
    {rubrik:'Vad menas med ett sammansatt tal? Ge tre exempel', rader:[
      {typ:'forklara', facit:'Ett sammansatt tal är ett tal som är delbart med fler tal än 1 och sig självt – det kan delas upp i mindre faktorer. Exempel: 4, 6, 8, 9, 12.'}
    ]},
    {rubrik:'Vilka av talen är primtal? (10–19, 31, 33, 35, 37, 39)', rader:[
      {typ:'flerval', tal:[10,11,12,13,14,15,16,17,18,19,31,33,35,37,39], ratt:[11,13,17,19,31,37]}
    ]},
    {rubrik:'Vilka av talen är sammansatta tal?', rader:[
      {typ:'flerval', tal:[10,11,12,13,14,15,16,17,18,19,31,33,35,37,39], ratt:[10,12,14,15,16,18,33,35,39]}
    ]}
  ]
};

var PLUGG_DOKUMENT = {
  'lastal': {
    titel:'Lästal',
    intro:'Läs uppgiften och visa din beräkning i rutan. Skriv sedan svaret med rätt enhet. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Lös problemet', rader:[
        {typ:'problem',
         fraga:'Per köper 10 chokladbitar för 4,50 kr/st och 100 kolor för 0,50 kr/st. '
           + 'Hur mycket ska han betala? <em>Svara i kronor (kr).</em>',
         svar:95, enhet:'kr'},
        {typ:'problem',
         fraga:'En biobiljett kostar 135 kr/st. Om man köper ett paket med 10 stycken betalar man 1 190 kr. '
           + 'Hur mycket tjänar man på varje biobiljett genom att köpa paketerbjudandet? <em>Svara i kronor (kr).</em>',
         svar:16, enhet:'kr'},
        {typ:'problem',
         fraga:'Yonko och Ceasar sprang 60 meter. Yonko sprang på tiden 8,83 sekunder. '
           + 'Ceasar sprang två tiondelar långsammare. Vilken tid hade Ceasar? <em>Svara i sekunder (s).</em>',
         svar:9.03, enhet:'s'},
        {typ:'problem',
         fraga:'Fem kompisar ska gå på bio och äta hamburgare efteråt. Det kostar 575 kr att gå på bio '
           + 'och 440 kr att äta hamburgare. Hur mycket ska varje person betala? <em>Svara i kronor (kr).</em>',
         svar:203, enhet:'kr'},
        {typ:'problem',
         fraga:'Under en löpartävling behövdes 3 548 muggar till 6 vätskekontroller. '
           + 'Ungefär hur många muggar behövdes till varje vätskekontroll? '
           + '<em>Använd överslagsräkning. Svara i antal muggar.</em>',
         svar:600, enhet:'muggar'},
        {typ:'problem',
         fraga:'Filip ska beställa pennor till skolan. Pennorna ligger i askar med 12 pennor i varje ask. '
           + 'Varje elev behöver cirka 8 pennor och det går 528 elever på skolan. '
           + 'Ungefär hur många askar ska han beställa? <em>Använd överslagsräkning. Svara i antal askar.</em>',
         svar:400, enhet:'askar'},
        {typ:'problem',
         fraga:'En dag gick Elsa 8 000 steg. Hur långt gick hon om varje steg var 60 cm långt? '
           + '<em>Svara i meter (m).</em>',
         svar:4800, enhet:'m'},
        {typ:'problem',
         fraga:'Marias moped drar 0,3 liter bensin per mil. Hur långt kan hon köra med 9 liter? '
           + '<em>Svara i mil.</em>',
         svar:30, enhet:'mil'}
      ]}
    ]
  },
  'overslag': {
    titel:'Överslagsräkning',
    intro:'Skriv först ditt överslag (de avrundade talen) i mellanledet, och sedan svaret. '
      + 'Exempel: 567 + 743 ≈ 600 + 700 = 1300.',
    grupper:[
      {rubrik:'Beräkna med överslagsräkning', rader:[
        {typ:'mellan', vansterText:'567 + 743', tecken:'≈', mellan:'600+700', svar:1300},
        {typ:'mellan', vansterText:'139 + 279', tecken:'≈', mellan:'100+300', svar:400},
        {typ:'mellan', vansterText:'289 + 415 + 307', tecken:'≈', mellan:'300+400+300', svar:1000}
      ]},
      {rubrik:'Beräkna med överslagsräkning', rader:[
        {typ:'mellan', vansterText:'82,5 + 39,2 + 58,6', tecken:'≈', mellan:'80+40+60', svar:180},
        {typ:'mellan', vansterText:'4,9 + 7,3 + 8,8 + 5,1', tecken:'≈', mellan:'5+7+9+5', svar:26}
      ]},
      {rubrik:'Beräkna med överslagsräkning', rader:[
        {typ:'mellan', vansterText:'78 − 59', tecken:'≈', mellan:'80-60', svar:20},
        {typ:'mellan', vansterText:'891 − 586', tecken:'≈', mellan:'900-600', svar:300},
        {typ:'mellan', vansterText:'67,1 − 56,8', tecken:'≈', mellan:'70-60', svar:10}
      ]},
      {rubrik:'Beräkna med överslagsräkning', rader:[
        {typ:'mellan', vansterText:'489,7 − 275,4', tecken:'≈', mellan:'490-280', svar:210},
        {typ:'mellan', vansterText:'132,8 − 41,7', tecken:'≈', mellan:'130-40', svar:90},
        {typ:'mellan', vansterText:'242 + 37 − 118', tecken:'≈', mellan:'240+40-120', svar:160}
      ]},
      {rubrik:'Beräkna med överslagsräkning', rader:[
        {typ:'mellan', vansterText:'4,1 · 21', tecken:'≈', mellan:'4·20', svar:80},
        {typ:'mellan', vansterText:'32 · 18', tecken:'≈', mellan:'30·20', svar:600},
        {typ:'mellan', vansterText:'6,9 · 208', tecken:'≈', mellan:'7·200', svar:1400}
      ]},
      {rubrik:'Beräkna med överslagsräkning', rader:[
        {typ:'mellan', vansterText:'42 · 58', tecken:'≈', mellan:'40·60', svar:2400},
        {typ:'mellan', vansterText:'690 · 32', tecken:'≈', mellan:'700·30', svar:21000},
        {typ:'mellan', vansterText:'395 · 5,1', tecken:'≈', mellan:'400·5', svar:2000}
      ]},
      {rubrik:'Beräkna med överslagsräkning', rader:[
        {typ:'mellan', vansterText:'29 / 5', tecken:'≈', mellan:'30/5', svar:6},
        {typ:'mellan', vansterText:'43 / 9', tecken:'≈', mellan:'45/9', svar:5},
        {typ:'mellan', vansterText:'408 / 6', tecken:'≈', mellan:'420/6', svar:70}
      ]},
      {rubrik:'Beräkna med överslagsräkning', rader:[
        {typ:'mellan', vansterText:'23,8 / 5,9', tecken:'≈', mellan:'24/6', svar:4},
        {typ:'mellan', vansterText:'44,8 / 4,9', tecken:'≈', mellan:'45/5', svar:9},
        {typ:'mellan', vansterText:'139 / 19', tecken:'≈', mellan:'140/20', svar:7}
      ]}
    ]
  },
  'delbarhet': {
    titel:'Delbarhet',
    intro:'Klicka på alla tal som är delbara med det angivna talet. Tryck sedan på Kontrollera.',
    grupper:[
      {rubrik:'Vilka av talen är delbara med 2?', rader:[
        {typ:'flerval', tal:[7,212,18,25,111,6,788], ratt:[212,18,6,788]}
      ]},
      {rubrik:'Vilka av talen är delbara med 3?', rader:[
        {typ:'flerval', tal:[21,32,51,81,39,46,1002], ratt:[21,51,81,39,1002]}
      ]},
      {rubrik:'Vilka av talen är delbara med 5?', rader:[
        {typ:'flerval', tal:[15,72,100,255,91,60,480,5689], ratt:[15,100,255,60,480]}
      ]},
      {rubrik:'Vilka av talen är delbara med 4?', rader:[
        {typ:'flerval', tal:[712,605,816,928,531,314], ratt:[712,816,928]}
      ]}
    ]
  },
  'brak': {
    titel:'Bråk och decimaltal',
    intro:'Räkna ut talen. Skriv decimaltal med komma och bråk som t.ex. 3/10. Tryck sedan på Kontrollera.',
    grupper:[
      {rubrik:'Skriv talen i decimalform', rader:[
        {typ:'brakText', taljare:'1', namnare:'2', svar:'0,5', accept:['0,5','0.5']},
        {typ:'brakText', taljare:'1', namnare:'3', svar:'0,33', accept:['0,33','0.33']},
        {typ:'brakText', taljare:'1', namnare:'4', svar:'0,25', accept:['0,25','0.25']},
        {typ:'brakText', taljare:'1', namnare:'5', svar:'0,2', accept:['0,2','0.2']}
      ]},
      {rubrik:'Skriv talen i decimalform', rader:[
        {typ:'brakText', taljare:'3', namnare:'4', svar:'0,75', accept:['0,75','0.75']},
        {typ:'brakText', taljare:'2', namnare:'5', svar:'0,4', accept:['0,4','0.4']},
        {typ:'brakText', taljare:'13', namnare:'100', svar:'0,13', accept:['0,13','0.13']},
        {typ:'brakText', taljare:'2', namnare:'3', svar:'0,67', accept:['0,67','0.67']}
      ]},
      {rubrik:'Skriv talen i decimalform', rader:[
        {typ:'brakText', heltal:'1', taljare:'3', namnare:'100', svar:'1,03', accept:['1,03','1.03']},
        {typ:'brakText', heltal:'2', taljare:'1', namnare:'4', svar:'2,25', accept:['2,25','2.25']},
        {typ:'brakText', heltal:'4', taljare:'4', namnare:'5', svar:'4,8', accept:['4,8','4.8']},
        {typ:'brakText', heltal:'2', taljare:'7', namnare:'100', svar:'2,07', accept:['2,07','2.07']}
      ]},
      {rubrik:'Skriv talen i bråkform (skriv som t.ex. 3/10)', rader:[
        {typ:'text', fraga:'0,3', svar:'3/10', accept:['3/10']},
        {typ:'text', fraga:'0,13', svar:'13/100', accept:['13/100']},
        {typ:'text', fraga:'0,06', svar:'6/100', accept:['6/100','3/50']},
        {typ:'text', fraga:'1,3', svar:'13/10', accept:['13/10']}
      ]},
      {rubrik:'Beräkna – byt mellan bråk och decimalform', rader:[
        {typ:'text', fraga:'4/10 + 0,24', svar:'0,64', accept:['0,64','0.64']},
        {typ:'text', fraga:'0,5 − 1/4', svar:'0,25', accept:['0,25','0.25']},
        {typ:'text', fraga:'3/4 + 1,3', svar:'2,05', accept:['2,05','2.05']},
        {typ:'text', fraga:'1 2/5 − 0,7', svar:'0,7', accept:['0,7','0.7']}
      ]}
    ]
  },
  'negativa': {
    titel:'Negativa tal',
    intro:'Räkna ut talen. Använd minusknappen (−) för negativa tal. Tryck sedan på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'6 − 8 =', svar:-2},
        {typ:'enkel', vansterText:'−7 + 9 =', svar:2},
        {typ:'enkel', vansterText:'−7 + 3 =', svar:-4}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'−6 + (−4) =', svar:-10},
        {typ:'enkel', vansterText:'−6 + 2 + 7 =', svar:3},
        {typ:'enkel', vansterText:'−12 + 4 + 5 =', svar:-3}
      ]},
      {rubrik:'Beräkna med prioriteringsregeln', rader:[
        {typ:'enkel', vansterText:'−5 − 3 · 4 =', svar:-17},
        {typ:'enkel', vansterText:'4 − 5 · 2 =', svar:-6},
        {typ:'enkel', vansterText:'−8 − 3 · 3 =', svar:-17}
      ]}
    ]
  },
  'avrundning': {
    titel:'Avrundning',
    intro:'Avrunda talen enligt instruktionen. Tryck sedan på Kontrollera.',
    grupper:[
      {rubrik:'Avrunda till ental', rader:[
        {typ:'enkel', vansterText:'4,82 ≈', svar:5},
        {typ:'enkel', vansterText:'3,265 ≈', svar:3},
        {typ:'enkel', vansterText:'9,5 ≈', svar:10}
      ]},
      {rubrik:'Avrunda 68 325 till', rader:[
        {typ:'text', fraga:'tiotusental', svar:'70000', accept:['70000','70 000']},
        {typ:'text', fraga:'tusental', svar:'68000', accept:['68000','68 000']},
        {typ:'text', fraga:'hundratal', svar:'68300', accept:['68300','68 300']}
      ]},
      {rubrik:'Avrunda 2 485 till', rader:[
        {typ:'text', fraga:'tusental', svar:'2000', accept:['2000','2 000']},
        {typ:'text', fraga:'hundratal', svar:'2500', accept:['2500','2 500']},
        {typ:'text', fraga:'tiotal', svar:'2490', accept:['2490','2 490']}
      ]},
      {rubrik:'Avrunda till två decimaler', rader:[
        {typ:'enkel', vansterText:'1,489 ≈', svar:1.49},
        {typ:'enkel', vansterText:'2,67389 ≈', svar:2.67},
        {typ:'enkel', vansterText:'156,02863 ≈', svar:156.03}
      ]},
      {rubrik:'Avrunda till tiondel', rader:[
        {typ:'enkel', vansterText:'23,56 ≈', svar:23.6},
        {typ:'enkel', vansterText:'2,34 ≈', svar:2.3},
        {typ:'enkel', vansterText:'126,746 ≈', svar:126.7}
      ]},
      {rubrik:'Avrunda 7 923,2896 till', rader:[
        {typ:'text', fraga:'heltal', svar:'7923', accept:['7923','7 923']},
        {typ:'text', fraga:'tiotal', svar:'7920', accept:['7920','7 920']},
        {typ:'text', fraga:'tiondelar', svar:'7923,3', accept:['7923,3','7923.3','7 923,3']},
        {typ:'text', fraga:'hundradelar', svar:'7923,29', accept:['7923,29','7923.29','7 923,29']}
      ]}
    ]
  },
  'metoder': {
    titel:'Metoder i de fyra räknesätten',
    intro:'Räkna ut talen med den metod som anges. Skriv svaret och tryck Kontrollera. (Du kan räkna på papper och bara skriva svaret här.)',
    grupper:[
      {rubrik:'Beräkna med uppställning', rader:[
        {typ:'enkel', vansterText:'7 403 + 2 178 =', svar:9581},
        {typ:'enkel', vansterText:'296,7 + 371,8 =', svar:668.5},
        {typ:'enkel', vansterText:'13,67 + 48,4 =', svar:62.07}
      ]},
      {rubrik:'Beräkna med talsorterna var för sig', rader:[
        {typ:'enkel', vansterText:'232 + 378 =', svar:610},
        {typ:'enkel', vansterText:'956 + 356 =', svar:1312},
        {typ:'enkel', vansterText:'748 + 252 =', svar:1000}
      ]},
      {rubrik:'Beräkna med metoden flytta över', rader:[
        {typ:'enkel', vansterText:'864 + 298 =', svar:1162},
        {typ:'enkel', vansterText:'1 997 + 2 578 =', svar:4575},
        {typ:'enkel', vansterText:'7 406 + 197 =', svar:7603}
      ]},
      {rubrik:'Beräkna med uppställning', rader:[
        {typ:'enkel', vansterText:'468 − 273 =', svar:195},
        {typ:'enkel', vansterText:'3 788,7 − 169,9 =', svar:3618.8},
        {typ:'enkel', vansterText:'678,9 − 539,67 =', svar:139.23}
      ]},
      {rubrik:'Beräkna med uppställning', rader:[
        {typ:'enkel', vansterText:'164 · 8 =', svar:1312},
        {typ:'enkel', vansterText:'367 · 6 =', svar:2202},
        {typ:'enkel', vansterText:'26,45 · 4 =', svar:105.8}
      ]},
      {rubrik:'Beräkna med talsorterna var för sig', rader:[
        {typ:'enkel', vansterText:'7 · 64 =', svar:448},
        {typ:'enkel', vansterText:'6 · 643 =', svar:3858},
        {typ:'enkel', vansterText:'4 · 2 816 =', svar:11264}
      ]},
      {rubrik:'Beräkna med kort division', rader:[
        {typ:'enkel', vansterText:'462 / 3 =', svar:154},
        {typ:'enkel', vansterText:'1 099 / 7 =', svar:157},
        {typ:'enkel', vansterText:'10,8 / 6 =', svar:1.8}
      ]},
      {rubrik:'Beräkna med kort division', rader:[
        {typ:'enkel', vansterText:'312 / 5 =', svar:62.4},
        {typ:'enkel', vansterText:'145 / 4 =', svar:36.25},
        {typ:'enkel', vansterText:'4,50 / 8 =', svar:0.5625}
      ]}
    ]
  },
  'tiopotens': {
    titel:'Multiplikation och division med 10, 100 och 1000',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Multiplikation med heltal', rader:[
        {typ:'enkel', vansterText:'10 · 65 =', svar:650},
        {typ:'enkel', vansterText:'189 · 100 =', svar:18900},
        {typ:'enkel', vansterText:'87 · 1 000 =', svar:87000}
      ]},
      {rubrik:'Multiplikation med decimaltal', rader:[
        {typ:'enkel', vansterText:'100 · 4,25 =', svar:425},
        {typ:'enkel', vansterText:'10 · 0,75 =', svar:7.5},
        {typ:'enkel', vansterText:'6,07 · 1 000 =', svar:6070}
      ]},
      {rubrik:'Division med heltal', rader:[
        {typ:'enkel', vansterText:'459 / 10 =', svar:45.9},
        {typ:'enkel', vansterText:'709 / 100 =', svar:7.09},
        {typ:'enkel', vansterText:'12 / 1 000 =', svar:0.012}
      ]},
      {rubrik:'Division med decimaltal', rader:[
        {typ:'enkel', vansterText:'2,53 / 10 =', svar:0.253},
        {typ:'enkel', vansterText:'459,3 / 100 =', svar:4.593},
        {typ:'enkel', vansterText:'34,5 / 1 000 =', svar:0.0345}
      ]}
    ]
  },
  'storasma': {
    titel:'Multiplikation och division med stora och små tal',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Multiplikation med stora tal', rader:[
        {typ:'enkel', vansterText:'40 · 70 =', svar:2800},
        {typ:'enkel', vansterText:'30 · 400 =', svar:12000},
        {typ:'enkel', vansterText:'4 500 · 2 000 =', svar:9000000}
      ]},
      {rubrik:'Multiplikation med små tal', rader:[
        {typ:'enkel', vansterText:'5 · 0,5 =', svar:2.5},
        {typ:'enkel', vansterText:'6 · 0,4 =', svar:2.4},
        {typ:'enkel', vansterText:'0,2 · 7 =', svar:1.4}
      ]},
      {rubrik:'Multiplikation med små tal', rader:[
        {typ:'enkel', vansterText:'0,3 · 0,4 =', svar:0.12},
        {typ:'enkel', vansterText:'0,06 · 0,7 =', svar:0.042},
        {typ:'enkel', vansterText:'0,05 · 0,09 =', svar:0.0045}
      ]},
      {rubrik:'Multiplikation med små och stora tal', rader:[
        {typ:'enkel', vansterText:'800 · 0,2 =', svar:160},
        {typ:'enkel', vansterText:'0,02 · 700 =', svar:14},
        {typ:'enkel', vansterText:'0,06 · 4 000 =', svar:240}
      ]},
      {rubrik:'Division med stora tal', rader:[
        {typ:'enkel', vansterText:'45 000 / 9 000 =', svar:5},
        {typ:'enkel', vansterText:'3 600 / 40 =', svar:90},
        {typ:'enkel', vansterText:'2 400 / 80 =', svar:30}
      ]},
      {rubrik:'Division med små tal', rader:[
        {typ:'enkel', vansterText:'8 / 0,5 =', svar:16},
        {typ:'enkel', vansterText:'6 / 0,2 =', svar:30},
        {typ:'enkel', vansterText:'5 / 0,25 =', svar:20}
      ]},
      {rubrik:'Division med små tal', rader:[
        {typ:'enkel', vansterText:'2,8 / 0,4 =', svar:7},
        {typ:'enkel', vansterText:'2,4 / 0,04 =', svar:60},
        {typ:'enkel', vansterText:'2,45 / 0,7 =', svar:3.5}
      ]}
    ]
  },
  'prio': {
    titel:'Prioriteringsregeln',
    intro:'Räkna nedåt och visa mellanledet. Skriv det förenklade ledet i rutan före likhetstecknet – med alla delar under varandra – och svaret i rutan efter. Parenteser först, sedan multiplikation och division, sist addition och subtraktion. Tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna – tänk på ordningen', rader:[
        {typ:'prio', vansterText:'2 + 3 · 4', steg:[{vlValue:14}], svar:14},
        {typ:'prio', vansterText:'(2 + 5) · 6', steg:[{vlValue:42}], svar:42},
        {typ:'prio', vansterText:'6 · 3 + 4 · 4', steg:[{vlValue:34}], svar:34}
      ]},
      {rubrik:'Beräkna – tänk på ordningen', rader:[
        {typ:'prio', vansterText:'2 · 3 + 9 / 3', steg:[{vlValue:9}], svar:9},
        {typ:'prio', vansterText:'3 · (4 + 5) · 2', steg:[{vlValue:54}], svar:54},
        {typ:'prio', vansterText:'6 · 9 − 5 · 8', steg:[{vlValue:14}], svar:14}
      ]},
      {rubrik:'Beräkna – tänk på ordningen', rader:[
        {typ:'prio', vansterText:'4 · (23 − 3 · 6 / 2)', steg:[{vlValue:56}], svar:56},
        {typ:'prio', vansterText:'32 − 8 / (4 + 6) · 2', steg:[{vlValue:30.4}], svar:30.4}
      ]}
    ]
  },
  'jobbatal': {
    titel:'Talsystem – jobba med tal',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Vilket tal är', rader:[
        {typ:'text', fraga:'4 tiotal större än 3 080', svar:'3120'},
        {typ:'text', fraga:'5 tiotal mindre än 3 249', svar:'3199'},
        {typ:'text', fraga:'7 hundratal mindre än 4 576', svar:'3876'},
        {typ:'text', fraga:'4 hundratal större än 5 875', svar:'6275'}
      ]},
      {rubrik:'Vilka tre tal följer i talföljden?', rader:[
        {typ:'foljd', givna:['9,2','9,4','9,6'],        nasta:['9,8','10,0','10,2']},
        {typ:'foljd', givna:['9,3','9,6','9,9'],        nasta:['10,2','10,5','10,8']},
        {typ:'foljd', givna:['9,92','9,94','9,96'],     nasta:['9,98','10,00','10,02']},
        {typ:'foljd', givna:['0,192','0,194','0,196'],  nasta:['0,198','0,200','0,202']},
        {typ:'foljd', givna:['2,488','2,491','2,494'],  nasta:['2,497','2,500','2,503']}
      ]},
      {rubrik:'Vilket tal är störst? Skriv det större talet', rader:[
        {typ:'text', fraga:'9,1 eller 9,09', svar:'9,1', accept:['9,1','9.1']},
        {typ:'text', fraga:'10,39 eller 10,4', svar:'10,4', accept:['10,4','10.4']}
      ]},
      {rubrik:'Skriv ett tal som är', rader:[
        {typ:'intervall', fraga:'större än 9,9 men mindre än 10', min:9.9, max:10, exkl:true},
        {typ:'intervall', fraga:'större än 10 men mindre än 10,01', min:10, max:10.01, exkl:true}
      ]},
      {rubrik:'Skriv talen med siffror', rader:[
        {typ:'text', fraga:'3 ental, 5 hundradelar och 7 tusendelar', svar:'3,057', accept:['3,057','3.057']},
        {typ:'text', fraga:'2 tiotal och 5 hundradelar', svar:'20,05', accept:['20,05','20.05']},
        {typ:'text', fraga:'4 hundratal, 9 ental och 8 tusendelar', svar:'409,008', accept:['409,008','409.008']}
      ]},
      {rubrik:'Skriv talen med siffror', rader:[
        {typ:'text', fraga:'12 hundradelar', svar:'0,12', accept:['0,12','0.12']},
        {typ:'text', fraga:'17 tusendelar', svar:'0,017', accept:['0,017','0.017']},
        {typ:'text', fraga:'19 tiondelar', svar:'1,9', accept:['1,9','1.9']}
      ]},
      {rubrik:'Skriv talet som är en tiondel större än', rader:[
        {typ:'text', fraga:'6', svar:'6,1', accept:['6,1','6.1']},
        {typ:'text', fraga:'4,58', svar:'4,68', accept:['4,68','4.68']},
        {typ:'text', fraga:'8,04', svar:'8,14', accept:['8,14','8.14']},
        {typ:'text', fraga:'7,98', svar:'8,08', accept:['8,08','8.08']}
      ]},
      {rubrik:'Skriv talet som är en hundradel större än', rader:[
        {typ:'text', fraga:'7,5', svar:'7,51', accept:['7,51','7.51']},
        {typ:'text', fraga:'5,217', svar:'5,227', accept:['5,227','5.227']},
        {typ:'text', fraga:'5,991', svar:'6,001', accept:['6,001','6.001']},
        {typ:'text', fraga:'8,99', svar:'9,00', accept:['9,00','9.00','9','9,0','9.0']}
      ]},
      {rubrik:'Beräkna med huvudräkning – ingen uppställning', rader:[
        {typ:'enkel', vansterText:'0,8 + 0,03 =', svar:0.83},
        {typ:'enkel', vansterText:'0,8 + 0,3 =', svar:1.1},
        {typ:'enkel', vansterText:'3,9 + 0,1 =', svar:4.0},
        {typ:'enkel', vansterText:'3,98 + 0,1 =', svar:4.08}
      ]},
      {rubrik:'Beräkna med huvudräkning – ingen uppställning', rader:[
        {typ:'enkel', vansterText:'2,83 − 0,02 =', svar:2.81},
        {typ:'enkel', vansterText:'5,13 − 0,2 =', svar:4.93},
        {typ:'enkel', vansterText:'3,06 − 0,1 =', svar:2.96},
        {typ:'enkel', vansterText:'7,56 − 1,6 =', svar:5.96}
      ]},
      {rubrik:'Skriv talet som är', rader:[
        {typ:'text', fraga:'sex tiondelar mindre än 7,49', svar:'6,89', accept:['6,89','6.89']},
        {typ:'text', fraga:'tolv tiondelar mindre än 7,16', svar:'5,96', accept:['5,96','5.96']}
      ]}
    ]
  },
  'tio': {
    titel:'Talsystem – tiosystemet',
    intro:'Räkna ut talen. När du är klar, tryck på Kontrollera.',
    grupper:[
      {rubrik:'Vilket platsvärde har siffran 2 i talet?', rader:[
        {typ:'text', fraga:'4 523', svar:'tiotal', accept:['tiotal','tiotalet']},
        {typ:'text', fraga:'13 234', svar:'hundratal', accept:['hundratal','hundratalet']},
        {typ:'text', fraga:'6,21', svar:'tiondel', accept:['tiondel','tiondelar','tiondelen']}
      ]},
      {rubrik:'Ordna talen i storleksordning, börja med det minsta', rader:[
        {typ:'ordna', tal:['0,1','2,5','0,5','3,0','0,4'], ordning:['0,1','0,4','0,5','2,5','3,0']}
      ]},
      {rubrik:'Skriv talen i utvecklad form', rader:[
        {typ:'text', fraga:'176', svar:'1·100+7·10+6·1', accept:['1·100+7·10+6·1','100+70+6']},
        {typ:'text', fraga:'34,6', svar:'3·10+4·1+6·0,1', accept:['3·10+4·1+6·0,1','30+4+0,6']},
        {typ:'text', fraga:'8702', svar:'8·1000+7·100+2·1', accept:['8·1000+7·100+2·1','8000+700+2']}
      ]},
      {rubrik:'Skriv talen på vanligt sätt', rader:[
        {typ:'enkel', vansterText:'5 · 10 =', svar:50},
        {typ:'enkel', vansterText:'7 · 10 + 5 · 0,1 =', svar:70.5},
        {typ:'enkel', vansterText:'2 · 100 + 4 · 10 + 6 · 1 =', svar:246}
      ]},
      {rubrik:'Ordna talen i storleksordning, börja med det minsta', rader:[
        {typ:'ordna', tal:['0,18','0,1','0,2','1,7','0,15','2'], ordning:['0,1','0,15','0,18','0,2','1,7','2']}
      ]},
      {rubrik:'Vilket tal är närmast 2,8? Välj ett av talen', rader:[
        {typ:'val', alternativ:['2,9','0,3','2,69','0,25','2','3'], svar:'2,9'}
      ]},
      {rubrik:'Vilket platsvärde har siffran 2 i talet?', rader:[
        {typ:'text', fraga:'10,02', svar:'hundradel', accept:['hundradel','hundradelar','hundradelen']},
        {typ:'text', fraga:'293 834', svar:'hundratusental', accept:['hundratusental','hundratusentalet','hundra tusental']},
        {typ:'text', fraga:'19,0921', svar:'tusendel', accept:['tusendel','tusendelar','tusendelen']}
      ]},
      {rubrik:'Skriv talen i storleksordning, börja med det minsta', rader:[
        {typ:'ordna', tal:['1,023','1,2','1,32','1,03'], ordning:['1,023','1,03','1,2','1,32']}
      ]},
      {rubrik:'Skriv i utvecklad form', rader:[
        {typ:'text', fraga:'657', svar:'6·100+5·10+7·1', accept:['6·100+5·10+7·1','600+50+7']},
        {typ:'text', fraga:'23,4', svar:'2·10+3·1+4·0,1', accept:['2·10+3·1+4·0,1','20+3+0,4']},
        {typ:'text', fraga:'4,72', svar:'4·1+7·0,1+2·0,01', accept:['4·1+7·0,1+2·0,01','4+0,7+0,02']}
      ]},
      {rubrik:'Använd siffrorna 7, 5, 8 och 4', rader:[
        {typ:'text', fraga:'Skriv det största talet du kan', svar:'8754'},
        {typ:'text', fraga:'Skriv det minsta talet du kan', svar:'4578'},
        {typ:'text', fraga:'Skriv det största udda talet', svar:'8745'},
        {typ:'text', fraga:'Skriv det minsta jämna talet', svar:'4578'}
      ]},
      {rubrik:'Skriv talen i storleksordning, börja med det minsta', rader:[
        {typ:'ordna', tal:['0,52','0,423','0,3','0,42'], ordning:['0,3','0,42','0,423','0,52']}
      ]},
      {rubrik:'Skriv talen i storleksordning, börja med det minsta', rader:[
        {typ:'ordna', tal:['0,52','0,523','0,5','0,059'], ordning:['0,059','0,5','0,52','0,523']}
      ]}
    ]
  }
};

// ============================================================
// MENY-LOGIK
// ============================================================
var pluggGruppRad = document.getElementById('plugg-grupprad');
var pluggDoklista = document.getElementById('plugg-doklista');
var pluggAktivt   = document.getElementById('plugg-aktivt');
var pluggValdGrupp = PLUGG_GRUPPER[0].id;

function renderGruppRad(){
  pluggGruppRad.innerHTML = '<div class="plugg-grupprad-rubrik">Välj område att öva på</div>'
    + '<div class="plugg-grupprad-knappar">'
    + PLUGG_GRUPPER.map(function(g){
        return '<button class="plugg-gruppbtn' + (g.id === pluggValdGrupp ? ' is-active' : '')
          + '" data-grupp="' + g.id + '">' + g.namn + '</button>';
      }).join('')
    + '</div>';
  pluggGruppRad.querySelectorAll('[data-grupp]').forEach(function(btn){
    btn.onclick = function(){
      pluggValdGrupp = btn.dataset.grupp;
      renderGruppRad();
      renderDoklista();
      pluggAktivt.innerHTML = '';
    };
  });
}

function renderDoklista(){
  var grupp = PLUGG_GRUPPER.find(function(g){ return g.id === pluggValdGrupp; });
  pluggDoklista.innerHTML = '<div class="plugg-doklista-rubrik">' + grupp.namn
    + ' &mdash; välj ett dokument</div>'
    + grupp.dok.map(function(d){
    return '<button class="plugg-dok" data-dok="' + d.id + '"'
      + (d.klar ? '' : ' style="opacity:.55;"') + '>'
      + '<span class="plugg-dok-nr">' + d.nr + '</span>'
      + '<span class="plugg-dok-namn">' + d.namn + '</span>'
      + '<span class="plugg-dok-pil">' + (d.klar ? '›' : '◌') + '</span>'
    + '</button>';
  }).join('');
  pluggDoklista.querySelectorAll('[data-dok]').forEach(function(btn){
    btn.onclick = function(){
      var dokId = btn.dataset.dok;
      pluggDoklista.querySelectorAll('.plugg-dok').forEach(function(b){
        b.classList.toggle('is-active', b === btn);
      });
      oppnaDokument(dokId);
    };
  });
}

// ============================================================
// TALLINJE – generell, återanvändbar SVG-komponent
// ============================================================
// Ritar en tallinje med utsatta tal, delstreck och pilar (A,B,C,D).
// Används i två lägen:
//   - avläsning:    eleven skriver talet pilen pekar på (exakt)
//   - uppskattning: eleven väljer rätt tal ur en ruta (ingen indelning)
//
// Konfiguration:
//   {start, slut, huvudsteg, delstreck, markeringar:[{bok,varde}], visaTal:bool}
// visaTal=false ger en "bar" linje (uppskattningsläge).
// Returnerar en sträng med SVG.
function ritaTallinje(cfg){
  var W = 680, H = cfg.markeringar ? 120 : 80;
  var mLeft = 40, mRight = 40;
  var lineY = 78;
  var x0 = mLeft, x1 = W - mRight;
  function px(varde){
    return x0 + (varde - cfg.start) / (cfg.slut - cfg.start) * (x1 - x0);
  }
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" '
    + 'style="width:100%;max-width:680px;height:auto;font-family:\'Source Serif 4\',Georgia,serif;">';

  // Huvudlinje med pilspets
  svg += '<line x1="' + (x0-10) + '" y1="' + lineY + '" x2="' + (x1+14) + '" y2="' + lineY
    + '" stroke="#12110f" stroke-width="2"/>';
  svg += '<polygon points="' + (x1+14) + ',' + lineY + ' ' + (x1+6) + ',' + (lineY-5)
    + ' ' + (x1+6) + ',' + (lineY+5) + '" fill="#12110f"/>';

  // Delstreck (små) + huvudstreck (stora, med tal)
  if(cfg.delstreck && cfg.huvudsteg){
    var litet = cfg.huvudsteg / cfg.delstreck;
    var v = cfg.start;
    // för flyttalssäkerhet, iterera i heltalssteg
    var antalSmaTotalt = Math.round((cfg.slut - cfg.start) / litet);
    for(var i = 0; i <= antalSmaTotalt; i++){
      var varde = cfg.start + i * litet;
      var x = px(varde);
      // är det ett huvudstreck? (jämnt delbart med huvudsteg)
      var ar_huvud = Math.abs(Math.round((varde - cfg.start)/cfg.huvudsteg) * cfg.huvudsteg - (varde - cfg.start)) < 1e-9;
      if(ar_huvud){
        svg += '<line x1="' + x + '" y1="' + (lineY-9) + '" x2="' + x + '" y2="' + (lineY+9) + '" stroke="#12110f" stroke-width="2"/>';
        if(cfg.visaTal !== false){
          var etikett = String(Math.round(varde*1e6)/1e6).replace('.', ',');
          svg += '<text x="' + x + '" y="' + (lineY+26) + '" text-anchor="middle" font-size="13" fill="#3d3630">' + etikett + '</text>';
        }
      } else {
        svg += '<line x1="' + x + '" y1="' + (lineY-5) + '" x2="' + x + '" y2="' + (lineY+5) + '" stroke="#7a6e65" stroke-width="1"/>';
      }
    }
  } else if(cfg.utsatta){
    // uppskattningsläge: bara några få utsatta tal, ingen indelning
    cfg.utsatta.forEach(function(u){
      var x = px(u);
      svg += '<line x1="' + x + '" y1="' + (lineY-9) + '" x2="' + x + '" y2="' + (lineY+9) + '" stroke="#12110f" stroke-width="2"/>';
      var etikett = String(u).replace('.', ',');
      svg += '<text x="' + x + '" y="' + (lineY+26) + '" text-anchor="middle" font-size="13" fill="#3d3630">' + etikett + '</text>';
    });
  }

  // Pilar med bokstäver (pekar ned på linjen)
  if(cfg.markeringar){
    cfg.markeringar.forEach(function(m){
      var x = px(m.varde);
      // pil ovanför linjen som pekar ned
      svg += '<line x1="' + x + '" y1="28" x2="' + x + '" y2="' + (lineY-12) + '" stroke="#b91c1c" stroke-width="2"/>';
      svg += '<polygon points="' + x + ',' + (lineY-10) + ' ' + (x-5) + ',' + (lineY-18)
        + ' ' + (x+5) + ',' + (lineY-18) + '" fill="#b91c1c"/>';
      svg += '<circle cx="' + x + '" cy="18" r="13" fill="#b91c1c"/>';
      svg += '<text x="' + x + '" y="23" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">' + m.bok + '</text>';
    });
  }

  svg += '</svg>';
  return svg;
}

function oppnaDokument(dokId){
  if(dokId === 'tallinjer'){
    renderTallinjeDok();
    return;
  }
  if(dokId === 'faktorisera'){
    renderFaktoriseraDok();
    return;
  }
  var blad = PLUGG_DOKUMENT[dokId];
  if(blad){
    pluggAktivt.innerHTML = '<div class="ovn-wrap" id="plugg-sheet"></div>';
    bygg_blad(document.getElementById('plugg-sheet'), blad);
    pluggAktivt.scrollIntoView({behavior:'smooth', block:'start'});
  } else {
    pluggAktivt.innerHTML = '<div class="ovn-wrap"><div class="content-card">'
      + '<div class="placeholder-note"><span class="pn-icon">📄</span>'
      + '<span>Det här dokumentet byggs snart.</span></div>'
    + '</div></div>';
    pluggAktivt.scrollIntoView({behavior:'smooth', block:'start'});
  }
}

// ============================================================
// FAKTORTRÄD – fristående interaktiv komponent (dok 9)
// ============================================================
function isPrime(n){
  if(n<2) return false;
  if(n===2) return true;
  if(n%2===0) return false;
  for(var i=3;i*i<=n;i+=2) if(n%i===0) return false;
  return true;
}
var _ftId = 0;
function ftMakeNode(value, isRoot){
  return {id:'ft'+(_ftId++), value:value, children:null, isPrime:isPrime(value), isRoot:!!isRoot, errorMsg:null};
}
function ftBygg(container, startTal){
  _ftId = 0;
  var root = ftMakeNode(startTal, true);
  var pending = {};

  function isKlar(node){
    if(node.children) return node.children.every(isKlar);
    return node.isPrime;
  }
  function findNode(node, id){
    if(node.id === id) return node;
    if(node.children){ for(var i=0;i<node.children.length;i++){ var r=findNode(node.children[i],id); if(r) return r; } }
    return null;
  }
  function renderNode(node){
    var html = '<div class="tnode" data-id="'+node.id+'">';
    var cls = 'tnode-label';
    if(node.isRoot) cls += ' root';
    else if(node.isPrime) cls += ' prime';
    else cls += ' composite';
    html += '<div class="'+cls+'">'+node.value+'</div>';
    if(node.children){
      html += '<div class="tnode-connector"></div>';
      html += '<div class="tnode-children">'+node.children.map(renderNode).join('')+'</div>';
    } else if(!node.isPrime){
      var pi = pending[node.id] || {left:'',right:''};
      var errCls = node.errorMsg ? 'error' : '';
      html += '<div class="tnode-input-row">'
        + '<span class="tnode-target">'+node.value+'</span>'
        + '<span class="tnode-eq">=</span>'
        + '<input class="tnode-input '+errCls+'" type="text" inputmode="numeric" data-pi="'+node.id+'-left" value="'+pi.left+'" maxlength="3">'
        + '<span class="tnode-mult">·</span>'
        + '<input class="tnode-input '+errCls+'" type="text" inputmode="numeric" data-pi="'+node.id+'-right" value="'+pi.right+'" maxlength="3">'
        + '<button class="tnode-expand-btn" data-expand="'+node.id+'">Dela</button>'
        + '</div>'
        + (node.errorMsg ? '<div style="font-size:12px;color:var(--error);margin-top:6px;text-align:center;">'+node.errorMsg+'</div>' : '');
    }
    html += '</div>';
    return html;
  }
  function expandNode(id){
    var node = findNode(root, id);
    if(!node) return;
    var pi = pending[id] || {left:'',right:''};
    var a = parseInt(pi.left,10), b = parseInt(pi.right,10);
    node.errorMsg = null;
    if(!a || !b || a<2 || b<2){
      node.errorMsg = 'Båda faktorerna ska vara minst 2.';
    } else if(a*b !== node.value){
      node.errorMsg = a+' · '+b+' = '+(a*b)+', men vi vill ha '+node.value+'.';
    } else {
      node.children = [ftMakeNode(a), ftMakeNode(b)];
      delete pending[id];
    }
    render();
  }
  function render(){
    container.innerHTML = '<div class="ftrad-canvas">'+renderNode(root)+'</div>'
      + '<div class="ftrad-klar'+(isKlar(root)?' show':'')+'">'
        + '✓ Klart! Alla bladnoder är primtal: '+ftPrimLeaves(root).sort(function(x,y){return x-y;}).join(' · ')
      + '</div>'
      + '<button type="button" class="ftrad-omstart">Börja om</button>';
    container.querySelectorAll('.tnode-input').forEach(function(inp){
      inp.addEventListener('input', function(){
        var parts = inp.dataset.pi.split('-');
        var nid = parts[0], sida = parts[1];
        if(!pending[nid]) pending[nid] = {left:'',right:''};
        pending[nid][sida] = inp.value;
        var node = findNode(root, nid);
        if(node) node.errorMsg = null;
      });
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
          e.preventDefault();
          var nid = inp.dataset.pi.split('-')[0];
          expandNode(nid);
        }
      });
    });
    container.querySelectorAll('[data-expand]').forEach(function(btn){
      btn.addEventListener('click', function(){ expandNode(btn.dataset.expand); });
    });
    container.querySelector('.ftrad-omstart').addEventListener('click', function(){
      root = ftMakeNode(startTal, true);
      pending = {};
      render();
    });
  }
  function ftPrimLeaves(node){
    if(node.children) return node.children.reduce(function(acc,c){ return acc.concat(ftPrimLeaves(c)); }, []);
    return [node.value];
  }
  render();
}

function renderFaktoriseraDok(){
  // Del 1: vanliga uppgifter via bladmotorn. Del 2: faktorträd.
  var html = '<div class="ovn-wrap"><div class="ovn-sheet">';
  html += '<h2>Faktorisera</h2>';
  html += '<p class="ovn-intro">Arbeta med faktorer och primtal. Längst ned bygger du faktorträd – rita gärna på papper också.</p>';
  html += '</div></div>';
  html += '<div class="ovn-wrap" id="faktorisera-blad"></div>';
  // Faktorträd-sektioner
  html += '<div class="ovn-wrap">';
  html += '<div class="ftrad-uppg"><div class="ftrad-uppg-rubrik">6. Primtalsfaktorisera med faktorträd</div>'
    + '<div class="ftrad-uppg-instr">Skriv två faktorer och tryck Dela. Fortsätt tills alla bladnoder är gröna primtal.</div>';
  html += '<div style="display:flex;gap:40px;flex-wrap:wrap;justify-content:center;">';
  ['ft15','ft21','ft25'].forEach(function(id){ html += '<div id="'+id+'"></div>'; });
  html += '</div></div>';
  html += '<div class="ftrad-uppg"><div class="ftrad-uppg-rubrik">7. Primtalsfaktorisera med faktorträd</div>'
    + '<div class="ftrad-uppg-instr">Skriv två faktorer och tryck Dela. Fortsätt tills alla bladnoder är gröna primtal.</div>';
  html += '<div style="display:flex;gap:40px;flex-wrap:wrap;justify-content:center;">';
  ['ft18','ft48','ft60'].forEach(function(id){ html += '<div id="'+id+'"></div>'; });
  html += '</div></div>';
  html += '</div>';

  pluggAktivt.innerHTML = html;
  // Bygg de vanliga uppgifterna
  bygg_blad(document.getElementById('faktorisera-blad'), PLUGG_FAKTORISERA);
  // Bygg faktorträden
  ftBygg(document.getElementById('ft15'), 15);
  ftBygg(document.getElementById('ft21'), 21);
  ftBygg(document.getElementById('ft25'), 25);
  ftBygg(document.getElementById('ft18'), 18);
  ftBygg(document.getElementById('ft48'), 48);
  ftBygg(document.getElementById('ft60'), 60);
  pluggAktivt.scrollIntoView({behavior:'smooth', block:'start'});
}

// ============================================================
// TALLINJE-DOKUMENT (dokument 2)
// ============================================================
var TALLINJE_AVLASNING = [
  {nr:1, cfg:{start:0,   slut:50,    huvudsteg:10,   delstreck:10},
   mark:[{bok:'A',varde:9},{bok:'B',varde:25},{bok:'C',varde:38},{bok:'D',varde:43}]},
  {nr:2, cfg:{start:1,   slut:4,     huvudsteg:1,    delstreck:10},
   mark:[{bok:'A',varde:1.5},{bok:'B',varde:2.9},{bok:'C',varde:3.1},{bok:'D',varde:4.0}]},
  {nr:3, cfg:{start:0.1, slut:0.25,  huvudsteg:0.05, delstreck:5},
   mark:[{bok:'A',varde:0.12},{bok:'B',varde:0.18},{bok:'C',varde:0.24}]},
  {nr:4, cfg:{start:0,   slut:0.015, huvudsteg:0.01, delstreck:10},
   mark:[{bok:'A',varde:0.001},{bok:'B',varde:0.007},{bok:'C',varde:0.013}]},
  {nr:5, cfg:{start:0.01,slut:0.025, huvudsteg:0.01, delstreck:10},
   mark:[{bok:'A',varde:0.011},{bok:'B',varde:0.015},{bok:'C',varde:0.022}]}
];
var TALLINJE_UPPSKATTNING = [
  {nr:6, cfg:{start:1, slut:2.6, utsatta:[1,2]},
   alternativ:['1,2','2,4','1,09','2,05'],
   mark:[{bok:'A',varde:1.2,svar:'1,2'},{bok:'B',varde:2.05,svar:'2,05'},{bok:'C',varde:2.4,svar:'2,4'}]},
  {nr:7, cfg:{start:0.4, slut:0.54, utsatta:[0.4,0.5]},
   alternativ:['0,45','0,406','0,529','0,495'],
   mark:[{bok:'A',varde:0.45,svar:'0,45'},{bok:'B',varde:0.495,svar:'0,495'},{bok:'C',varde:0.529,svar:'0,529'}]}
];

function renderTallinjeDok(){
  var html = '<div class="ovn-wrap"><div class="ovn-sheet">';
  html += '<h2>Talsystem – tallinjer</h2>';
  html += '<p class="ovn-intro">Vilka tal pekar pilarna på? Skriv talet vid varje bokstav. '
    + 'I de sista uppgifterna väljer du rätt tal ur rutan. Tryck sedan på Kontrollera.</p>';
  TALLINJE_AVLASNING.forEach(function(u){
    var cfg = Object.assign({}, u.cfg, {markeringar:u.mark, visaTal:true});
    html += '<div class="tl-uppg" data-tl="' + u.nr + '">';
    html += '<div class="tl-rubrik">' + u.nr + '. Vilka tal pekar pilarna på?</div>';
    html += ritaTallinje(cfg);
    html += '<div class="tl-svarsrad">';
    u.mark.forEach(function(m){
      html += '<span class="tl-svar"><span class="tl-bok">' + m.bok + ' =</span>'
        + '<input class="ovn-in" data-tlsvar="' + m.varde + '" inputmode="decimal" autocomplete="off" style="width:80px;"></span>';
    });
    html += '</div></div>';
  });
  TALLINJE_UPPSKATTNING.forEach(function(u){
    var cfg = Object.assign({}, u.cfg, {markeringar:u.mark, visaTal:true});
    html += '<div class="tl-uppg" data-tl="' + u.nr + '">';
    html += '<div class="tl-rubrik">' + u.nr + '. Vilka tal pekar pilarna på? Välj bland talen i rutan.</div>';
    html += ritaTallinje(cfg);
    html += '<div class="tl-ruta">' + u.alternativ.join('&nbsp;&nbsp;&nbsp;') + '</div>';
    html += '<div class="tl-svarsrad">';
    u.mark.forEach(function(m){
      html += '<div class="tl-valrad"><span class="tl-bok">' + m.bok + ':</span>'
        + '<div class="ovn-val-grid tl-valgrid" data-valsvar="' + m.svar.replace(/,/g,'.') + '">';
      u.alternativ.forEach(function(alt){
        html += '<button type="button" class="ovn-val-btn" data-val="' + alt.replace(/,/g,'.') + '">' + alt + '</button>';
      });
      html += '</div></div>';
    });
    html += '</div></div>';
  });
  html += '<div class="ovn-kontroll-rad">'
    + '<button type="button" class="ovn-kontroll" data-tl-kontroll>Kontrollera</button>'
    + '<button type="button" class="ovn-aterstall" data-tl-reset>Återställ</button>'
    + '</div>';
  html += '<div class="ovn-sammanf" data-tl-sammanf style="display:none;"></div>';
  html += '</div></div>';

  pluggAktivt.innerHTML = html;
  var rot = pluggAktivt;

  rot.querySelectorAll('.tl-valgrid').forEach(function(grid){
    grid.querySelectorAll('.ovn-val-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        grid.querySelectorAll('.ovn-val-btn').forEach(function(b){ b.classList.remove('is-vald','correct','wrong'); });
        btn.classList.add('is-vald');
        grid.dataset.valt = btn.dataset.val;
      });
    });
  });

  rot.querySelector('[data-tl-kontroll]').addEventListener('click', function(){
    var ratt = 0, totalt = 0;
    rot.querySelectorAll('[data-tlsvar]').forEach(function(inp){
      totalt++;
      var rad = inp.closest('.tl-svar');
      rad.querySelectorAll('.ovn-mark, .ovn-fasit').forEach(function(f){ f.remove(); });
      inp.classList.remove('correct','wrong');
      var ok = jamforTal(inp.value, parseFloat(inp.dataset.tlsvar));
      var mark = document.createElement('span');
      mark.className = 'ovn-mark ' + (ok?'ok':'fel');
      mark.textContent = ok?'✓':'✗';
      if(ok){ inp.classList.add('correct'); ratt++; inp.insertAdjacentElement('afterend', mark); }
      else {
        inp.classList.add('wrong');
        var f = document.createElement('span'); f.className='ovn-fasit';
        f.textContent = String(inp.dataset.tlsvar).replace('.', ',');
        inp.insertAdjacentElement('afterend', mark);
        mark.insertAdjacentElement('afterend', f);
      }
    });
    rot.querySelectorAll('.tl-valgrid').forEach(function(grid){
      totalt++;
      var rattSvar = grid.dataset.valsvar, valt = grid.dataset.valt;
      grid.querySelectorAll('.ovn-val-btn').forEach(function(b){
        b.classList.remove('correct','wrong');
        if(b.dataset.val === rattSvar) b.classList.add('correct');
        else if(b.dataset.val === valt) b.classList.add('wrong');
      });
      if(valt === rattSvar) ratt++;
    });
    var sam = rot.querySelector('[data-tl-sammanf]');
    sam.style.display = 'block';
    sam.classList.remove('ok','delvis');
    if(ratt === totalt){
      sam.classList.add('ok');
      sam.innerHTML = '<div class="ovn-sammanf-icon">✓</div><span class="ovn-sammanf-titel">Allt rätt!</span>'
        + ratt + ' av ' + totalt + ' &mdash; jättebra jobbat!';
      visaKonfetti();
    } else {
      sam.classList.add('delvis');
      sam.textContent = 'Du fick ' + ratt + ' av ' + totalt + ' rätt. Titta på de rödmarkerade.';
    }
    sam.scrollIntoView({behavior:'smooth', block:'center'});
  });

  rot.querySelector('[data-tl-reset]').addEventListener('click', function(){
    rot.querySelectorAll('[data-tlsvar]').forEach(function(inp){
      inp.value=''; inp.classList.remove('correct','wrong');
    });
    rot.querySelectorAll('.ovn-mark, .ovn-fasit').forEach(function(f){ f.remove(); });
    rot.querySelectorAll('.tl-valgrid').forEach(function(grid){
      grid.querySelectorAll('.ovn-val-btn').forEach(function(b){ b.classList.remove('is-vald','correct','wrong'); });
      delete grid.dataset.valt;
    });
    var sam = rot.querySelector('[data-tl-sammanf]');
    sam.style.display='none'; sam.textContent='';
  });

  pluggAktivt.scrollIntoView({behavior:'smooth', block:'start'});
}

renderGruppRad();
renderDoklista();
