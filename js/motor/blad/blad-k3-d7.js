/* FAMILJ A · ARBETSSIDANS MOTOR — ak7-k3-d7-pluggtillprov.html
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
        // rad.steg = [{vl:'18 + 8', vlValue:26}], rad.svar = slutsvar
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
    html += '</div>';
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
        // Prioritering, vänsterled: rättas på värde (eleven får skriva uttrycket fritt)
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
  {id:'tal-rakneregler', namn:'Tal och räkneregler', dok:[
    {nr:1, id:'prio',       namn:'Prioriteringsregeln',          klar:true},
    {nr:2, id:'negativa',   namn:'Negativa tal',                 klar:true},
    {nr:3, id:'multdiv',    namn:'Multiplikation och division',  klar:true}
  ]}
];

var PLUGG_DOKUMENT = {
  'prio': {
    titel:'Prioriteringsregeln',
    intro:'Räkna nedåt och visa mellanledet. Skriv det förenklade ledet i rutan före likhetstecknet – med alla delar under varandra – och svaret i rutan efter. Multiplikation och division först, sedan addition och subtraktion. Tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader:[
        {typ:'prio', vansterText:'3 · 6 + 8', steg:[{vlValue:26}], svar:26},
        {typ:'prio', vansterText:'7 + 3 · 7', steg:[{vlValue:28}], svar:28},
        {typ:'prio', vansterText:'3 · 6 + 3 · 8', steg:[{vlValue:42}], svar:42}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'prio', vansterText:'3 · (6 + 7)', steg:[{vlValue:39}], svar:39},
        {typ:'prio', vansterText:'9 · (8 − 5)', steg:[{vlValue:27}], svar:27},
        {typ:'prio', vansterText:'(7 − 4) · 8', steg:[{vlValue:24}], svar:24}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'prio', vansterText:'20/4 + 18/6', steg:[{vlValue:8}], svar:8},
        {typ:'prio', vansterText:'25 + 3 · 5 − 50/5', steg:[{vlValue:30}], svar:30},
        {typ:'prio', vansterText:'3 · (2 · 2 + 7)', steg:[{vlValue:33}], svar:33}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'prio', vansterText:'(25 + 7)/4', steg:[{vlValue:8}], svar:8},
        {typ:'prio', vansterText:'16/(17 − 9)', steg:[{vlValue:2}], svar:2},
        {typ:'prio', vansterText:'6 · (8 + 8/2)', steg:[{vlValue:72}], svar:72}
      ]}
    ]
  },
  'negativa': {
    titel:'Negativa tal',
    intro:'Räkna med negativa tal. På de sista uppgifterna ska du visa mellanledet – skriv först om subtraktion av ett negativt tal till addition, sedan svaret. Tryck på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'7 − 11 =', svar:-4},
        {typ:'enkel', vansterText:'−12 + 5 =', svar:-7},
        {typ:'enkel', vansterText:'−3 − 4 =', svar:-7}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'8 + (−2) =', svar:6},
        {typ:'enkel', vansterText:'(−4) + (−2) =', svar:-6},
        {typ:'enkel', vansterText:'6 + (−13) =', svar:-7}
      ]},
      {rubrik:'Beräkna – visa mellanled', rader:[
        {typ:'mellan', vansterText:'3 − (−5)', mellan:'3+5', svar:8},
        {typ:'mellan', vansterText:'(−6) − (−2)', mellan:'-6+2', svar:-4},
        {typ:'mellan', vansterText:'−15 − (−11)', mellan:'-15+11', svar:-4}
      ]},
      {rubrik:'Beräkna – visa mellanled', rader:[
        {typ:'mellan', vansterText:'(−8) + (−2) + 5', mellan:'-8-2+5', svar:-5},
        {typ:'mellan', vansterText:'9 + (−6) − (−2)', mellan:'9-6+2', svar:5},
        {typ:'mellan', vansterText:'(−4) − 5 + (−1) − (−7)', mellan:'-4-5-1+7', svar:-3}
      ]}
    ]
  },
  'multdiv': {
    titel:'Multiplikation och division',
    intro:'Räkna ut talen. Tänk på hur decimaltecknet flyttar när du multiplicerar eller dividerar med 10, 100 och 1000. Skriv svaret med komma där det behövs. Tryck sedan på Kontrollera.',
    grupper:[
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'7,8 · 100 =', svar:780},
        {typ:'enkel', vansterText:'10 · 0,564 =', svar:5.64},
        {typ:'enkel', vansterText:'4,2 · 1000 =', svar:4200}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'83/10 =', svar:8.3},
        {typ:'enkel', vansterText:'56,7/10 =', svar:5.67},
        {typ:'enkel', vansterText:'41,9/1000 =', svar:0.0419}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'717/3 =', svar:239},
        {typ:'enkel', vansterText:'916/4 =', svar:229},
        {typ:'enkel', vansterText:'7005/5 =', svar:1401},
        {typ:'enkel', vansterText:'27,37/7 ≈', svar:3.91}
      ]},
      {rubrik:'Beräkna', rader:[
        {typ:'enkel', vansterText:'450/300 =', svar:1.5},
        {typ:'enkel', vansterText:'1,2/0,3 =', svar:4},
        {typ:'enkel', vansterText:'0,08 · 0,3 =', svar:0.024},
        {typ:'enkel', vansterText:'400 · 0,6 =', svar:240}
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
