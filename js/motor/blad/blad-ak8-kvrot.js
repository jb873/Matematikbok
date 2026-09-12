/* blad-ak8-kvrot.js — KVADRATRÖTTER (åk8 k1, delkapitel 11) öva-blad. Dokument 1 = Joachims PDF, oförändrat.
   ────────────────────────────────────────────────────────────────────────────────────────────────────
   Introduktion inför nian: nodfamiljen (kvadrat- och rot-noderna) ärvs av nian (samma nod, högre nivå).
   Bygger på AK8_UI-systemet: tom ruta ≠ rätt, radera ångrar struktur, minusnormalisering (pNum), upphöjt.
   Bladet LOGGAR: varje grupp bär data-logg=<nod>; en besvarad ruta matar Mastery.loggaForsok (rätt/fel).
   Egen liten SVG för uppgift 4 (svg-andel.js ritar andel-figurer, inte skalenliga area-kvadrater —
   rapporterat val, som termometern). Facit exakt mot PDF-läsningen (√/² rekonstruerade, Joachim-OK).            */
(function(){
  'use strict';
  var UI = window.AK8_UI;

  // ── hjälp ──
  function fmt(x){ return String(x).replace('.', ','); }
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/\s/g, '').replace(/[−–—]/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }
  function likhetOk(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  function inTal(){ return '<input class="ak8-in" inputmode="text" autocomplete="off">'; }
  // Notation (GRIND: inga råa ^ — allt formaterat)
  // Omslaget krävs: .ak8-q är inline-flex med gap → oomslaget bas+<sup> blir två flex-items ("40 2"). Samma skäl som potensernas .pot.
  function sup(bas, exp){ return '<span class="kv-pot">' + bas + '<sup>' + exp + '</sup></span>'; }   // 40²
  function rot(radikand){ return '<span class="kv-rot">√<span class="kv-rad">' + radikand + '</span></span>'; }  // √64 med streck

  // ── FAS 2: skalenlig färgad kvadrat, area i svart inuti. Sidan ∝ √area (area 100 syns större än 16). ──
  var KVFARG = { gron:['#d7ecd9', '#2d6a4f'], rod:['#f6d9d6', '#b23b34'], bla:['#d6e4f5', '#1b4b8a'], orange:['#f8e3c8', '#c07a1e'] };
  function kvadratFig(area, fargKey){
    var f = KVFARG[fargKey] || KVFARG.gron, VP = 116, px = Math.round(Math.sqrt(area) * 9);
    if(px > VP - 10) px = VP - 10; if(px < 22) px = 22;
    var x = ((VP - px) / 2).toFixed(1), y = (VP - px - 3).toFixed(1);   // botten-centrerad → storleksskillnaden syns
    return '<svg viewBox="0 0 ' + VP + ' ' + VP + '" width="' + VP + '" height="' + VP + '" role="img" aria-label="kvadrat med area ' + area + '" style="display:block;overflow:visible;">'
      + '<rect x="' + x + '" y="' + y + '" width="' + px + '" height="' + px + '" fill="' + f[0] + '" stroke="' + f[1] + '" stroke-width="2.5"/>'
      + '<text x="' + (VP / 2) + '" y="' + (parseFloat(y) + px / 2 + 6).toFixed(1) + '" text-anchor="middle" font-family="var(--serif,Georgia)" font-size="17" font-weight="600" fill="#12110f">' + area + '</text>'
      + '</svg>';
  }

  // ── DATA — 9 grupper. logg = noden gruppen matar. typ styr svarscellen. ──
  var DATA = [
    { rubrik:'Hur stor area har en kvadrat med sidan', logg:'kvadrat-area:rakna', rader:[
      { typ:'enhet', fraga:'3 dm',   facit:9,      enhet:'dm²', tal:3,   tenhet:'dm' },
      { typ:'enhet', fraga:'30 dm',  facit:900,    enhet:'dm²', tal:30,  tenhet:'dm' },
      { typ:'enhet', fraga:'0,3 m',  facit:0.09,   enhet:'m²',  tal:0.3, tenhet:'m' },
      { typ:'enhet', fraga:'400 cm', facit:160000, enhet:'cm²', tal:400, tenhet:'cm' }
    ]},
    { rubrik:'Beräkna', logg:'kvadrat-rakna:rakna', rader:[
      { typ:'tal', fraga:sup('40', '2') + ' =',  facit:1600,   tal:40 },
      { typ:'tal', fraga:sup('0,5', '2') + ' =', facit:0.25,   tal:0.5 },
      { typ:'tal', fraga:sup('400', '2') + ' =', facit:160000, tal:400 },
      { typ:'tal', fraga:sup('0,1', '2') + ' =', facit:0.01,   tal:0.1 }
    ]},
    { rubrik:'Du vet att ' + sup('13', '2') + ' är 169. Vad är då…', logg:'kvadrat-skala:rakna', rader:[
      { typ:'tal', fraga:sup('1,3', '2') + ' =',  facit:1.69,   tal:1.3,  kant:13 },
      { typ:'tal', fraga:sup('130', '2') + ' =',  facit:16900,  tal:130,  kant:13 },
      { typ:'tal', fraga:sup('0,13', '2') + ' =', facit:0.0169, tal:0.13, kant:13 }
    ]},
    { rubrik:'Hur lång är sidan i kvadraten', logg:'rot-sida:rakna', rader:[
      { typ:'figur', area:16,  farg:'gron',   facit:4,  tal:16 },
      { typ:'figur', area:49,  farg:'rod',    facit:7,  tal:49 },
      { typ:'figur', area:36,  farg:'bla',    facit:6,  tal:36 },
      { typ:'figur', area:100, farg:'orange', facit:10, tal:100 }
    ]},
    { rubrik:'Hur lång är sidan i en kvadrat med arean', logg:'rot-sida:rakna', rader:[
      { typ:'enhet', fraga:'9 cm²',    facit:3,   enhet:'cm', tal:9,    tenhet:'cm' },
      { typ:'enhet', fraga:'900 cm²',  facit:30,  enhet:'cm', tal:900,  tenhet:'cm' },
      { typ:'enhet', fraga:'2500 cm²', facit:50,  enhet:'cm', tal:2500, tenhet:'cm' },
      { typ:'enhet', fraga:'0,81 cm²', facit:0.9, enhet:'cm', tal:0.81, tenhet:'cm' }
    ]},
    { rubrik:'Beräkna', logg:'rot-berakna:rakna', rader:[
      { typ:'tal', fraga:rot('64') + ' =',  facit:8,  tal:64 },
      { typ:'tal', fraga:rot('81') + ' =',  facit:9,  tal:81 },
      { typ:'tal', fraga:rot('36') + ' =',  facit:6,  tal:36 },
      { typ:'tal', fraga:rot('400') + ' =', facit:20, tal:400 }
    ]},
    { rubrik:'Mellan vilka heltal ligger svaret på dessa kvadratrötter', logg:'rot-uppskatta:rakna', rader:[
      { typ:'tvaruta', fraga:rot('14'), lo:3, hi:4,  tal:14 },
      { typ:'tvaruta', fraga:rot('55'), lo:7, hi:8,  tal:55 },
      { typ:'tvaruta', fraga:rot('91'), lo:9, hi:10, tal:91 },
      { typ:'tvaruta', fraga:rot('44'), lo:6, hi:7,  tal:44 }
    ]},
    { rubrik:'Beräkna', logg:'rot-decimal:rakna', rader:[
      { typ:'tal', fraga:rot('0,04') + ' =', facit:0.2, tal:0.04 },
      { typ:'tal', fraga:rot('0,64') + ' =', facit:0.8, tal:0.64 },
      { typ:'tal', fraga:rot('1600') + ' =', facit:40,  tal:1600 },
      { typ:'tal', fraga:rot('0,16') + ' =', facit:0.4, tal:0.16 }
    ]},
    { rubrik:'Använd miniräknare och avrunda till två decimaler', logg:'rot-narmevarde:rakna', rader:[
      { typ:'tal', fraga:rot('2') + ' ≈',  facit:1.41, tal:2 },
      { typ:'tal', fraga:rot('5') + ' ≈',  facit:2.24, tal:5 },
      { typ:'tal', fraga:rot('33') + ' ≈', facit:5.74, tal:33 },
      { typ:'tal', fraga:rot('71') + ' ≈', facit:8.43, tal:71 }
    ]}
  ];

  // ── FAS 4: variant-generator (dokument 2+). SAMMA struktur + svårighet som dok 1, ANDRA tal.
  //    Takregeln: aldrig svårare än Joachims dokument (samma magnitud/decimaler). Facit BERÄKNAS →
  //    facit-diff 0 per konstruktion. Villkor: uppg 3 skalar ur ETT ANNAT känt kvadrattal (≠13²);
  //    uppg 7 + 9 = icke-perfekta kvadrater. Dok 1 (DATA ovan) = Joachims, oförändrat och visas först. ──
  function ri(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function q2(x){ return Math.round(x * 1e6) / 1e6; }                 // stabilt facit (fp-brus bort)
  function komma(x){ return String(x).replace('.', ','); }
  function ejPerfekt(n){ var r = Math.sqrt(n); return Math.abs(r - Math.round(r)) > 1e-9; }
  function distinktEjPerfekt(antal, lo, hi){ var out = []; var vv = 0; while(out.length < antal && vv < 400){ vv++; var n = ri(lo, hi); if(ejPerfekt(n) && out.indexOf(n) < 0) out.push(n); } return out; }

  function genVariant(){
    var farg = ['gron', 'rod', 'bla', 'orange'];
    // 1 — area från sida (sida² = area), enheter
    var s1 = [ri(2, 9), ri(2, 9) * 10, ri(2, 9) / 10, pick([200, 300, 500])];
    var enh1 = ['dm²', 'dm²', 'm²', 'cm²'], sidenh1 = ['dm', 'dm', 'm', 'cm'];
    var G1 = { rubrik:'Hur stor area har en kvadrat med sidan', logg:'kvadrat-area:rakna',
      rader: s1.map(function(s, i){ return { typ:'enhet', fraga:komma(s) + ' ' + sidenh1[i], facit:q2(s * s), enhet:enh1[i], tal:s, tenhet:sidenh1[i] }; }) };
    // 2 — kvadrera (2-siffrigt ×10, decimal, 3-siffrigt ×100, decimal)
    var b2 = [ri(2, 9) * 10, ri(2, 9) / 10, ri(2, 9) * 100, ri(1, 9) / 10];
    var G2 = { rubrik:'Beräkna', logg:'kvadrat-rakna:rakna',
      rader: b2.map(function(b){ return { typ:'tal', fraga:sup(komma(b), '2') + ' =', facit:q2(b * b), tal:b }; }) };
    // 3 — skala ur ett ANNAT känt kvadrattal (≠13²)
    var N = pick([11, 12, 14, 15]);
    var G3 = { rubrik:'Du vet att ' + sup(N, '2') + ' är ' + (N * N) + '. Vad är då…', logg:'kvadrat-skala:rakna', rader:[
      { typ:'tal', fraga:sup(komma(N / 10), '2') + ' =', facit:q2((N / 10) * (N / 10)), tal:N / 10, kant:N },
      { typ:'tal', fraga:sup(N * 10, '2') + ' =', facit:q2((N * 10) * (N * 10)), tal:N * 10, kant:N },
      { typ:'tal', fraga:sup(komma(N / 100), '2') + ' =', facit:q2((N / 100) * (N / 100)), tal:N / 100, kant:N }
    ]};
    // 4 — sida ur perfekt kvadrat, MED figur (fyra olika sidor 2–10)
    var k4 = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 4);
    var G4 = { rubrik:'Hur lång är sidan i kvadraten', logg:'rot-sida:rakna',
      rader: k4.map(function(k, i){ return { typ:'figur', area:k * k, farg:farg[i], facit:k, tal:k * k }; }) };
    // 5 — sida ur perfekt kvadrat, UTAN figur (litet, ×10, större ×10, decimal)
    var s5 = [ri(2, 7), ri(2, 4) * 10, ri(5, 8) * 10, ri(2, 9) / 10];
    var G5 = { rubrik:'Hur lång är sidan i en kvadrat med arean', logg:'rot-sida:rakna',
      rader: s5.map(function(s){ return { typ:'enhet', fraga:komma(q2(s * s)) + ' cm²', facit:s, enhet:'cm', tal:q2(s * s), tenhet:'cm' }; }) };
    // 6 — beräkna √ ur jämnt kvadrattal (fyra olika)
    var k6 = shuffle([5, 6, 7, 8, 9, 10, 12, 15, 20]).slice(0, 4);
    var G6 = { rubrik:'Beräkna', logg:'rot-berakna:rakna',
      rader: k6.map(function(k){ return { typ:'tal', fraga:rot(k * k) + ' =', facit:k, tal:k * k }; }) };
    // 7 — mellan vilka heltal (ICKE-perfekta kvadrater)
    var n7 = distinktEjPerfekt(4, 5, 99);
    var G7 = { rubrik:'Mellan vilka heltal ligger svaret på dessa kvadratrötter', logg:'rot-uppskatta:rakna',
      rader: n7.map(function(n){ var lo = Math.floor(Math.sqrt(n)); return { typ:'tvaruta', fraga:rot(n), lo:lo, hi:lo + 1, tal:n }; }) };
    // 8 — √ ur decimaltal (tre decimaler + ett stort, alla perfekta)
    var s8 = [ri(1, 9) / 10, ri(1, 9) / 10, ri(3, 7) * 10, ri(1, 9) / 10];
    var G8 = { rubrik:'Beräkna', logg:'rot-decimal:rakna',
      rader: s8.map(function(s){ return { typ:'tal', fraga:rot(komma(q2(s * s))) + ' =', facit:s, tal:q2(s * s) }; }) };
    // 9 — närmevärde med räknare, två decimaler (ICKE-perfekta)
    var n9 = distinktEjPerfekt(4, 2, 99);
    var G9 = { rubrik:'Använd miniräknare och avrunda till två decimaler', logg:'rot-narmevarde:rakna',
      rader: n9.map(function(n){ return { typ:'tal', fraga:rot(n) + ' ≈', facit:Math.round(Math.sqrt(n) * 100) / 100, tal:n }; }) };
    return [G1, G2, G3, G4, G5, G6, G7, G8, G9];
  }

  // ── RENDER ──
  var CHECKS = [];
  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'figur'){
      CHECKS.push(function(el){ return { ok: likhetOk(pNum(el.querySelector('.ak8-in').value), r.facit), facit: fmt(r.facit) }; });
      return '<div class="ak8-rad kv-figrad"><span class="kv-fig">' + kvadratFig(r.area, r.farg) + '</span>'
        + '<span class="ak8-svar kv-sidasvar" data-idx="' + idx + '"><span class="kv-sidalabel">sida =</span>' + inTal() + '</span></div>';
    }
    if(r.typ === 'tvaruta'){
      CHECKS.push(function(el){ var ins = el.querySelectorAll('.ak8-in'); return { ok: likhetOk(pNum(ins[0].value), r.lo) && likhetOk(pNum(ins[1].value), r.hi), facit: r.lo + ' och ' + r.hi }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span>'
        + '<span class="ak8-svar" data-idx="' + idx + '">' + inTal() + '<span class="kv-och">och</span>' + inTal() + '</span></div>';
    }
    if(r.typ === 'enhet'){
      CHECKS.push(function(el){ return { ok: likhetOk(pNum(el.querySelector('.ak8-in').value), r.facit), facit: fmt(r.facit) + ' ' + r.enhet }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span>'
        + '<span class="ak8-svar" data-idx="' + idx + '">' + inTal() + '<span class="kv-enhet">' + r.enhet + '</span></span></div>';
    }
    // 'tal'
    CHECKS.push(function(el){ return { ok: likhetOk(pNum(el.querySelector('.ak8-in').value), r.facit), facit: fmt(r.facit) }; });
    return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + inTal() + '</span></div>';
  }

  function renderBlad(mount, data){
    CHECKS = [];
    var doc = data || DATA;   // utan argument = dokument 1 (Joachims, oförändrat); annars en variant
    // Hela omslaget (sheet + h2 + grupper + kontrollrad + sammanf + keypad + bindSheet) via kontraktet
    // AK8_UI.renderSheet — bladet kan inte utelämna formen. Grupperna bär logg → data-logg per grupp.
    UI.renderSheet(mount, 'Kvadratrötter', doc, renderRad, {
      kontrollera: kontrollera,
      reset: function(m){ renderBlad(m, doc); },                  // Rensa = samma tal
      resetLabel: 'Rensa',
      knappar: [{ attr: 'data-nytt', text: '↻ Nytt blad med andra tal', onclick: function(m){ renderBlad(m, genVariant()); } }]   // Nytt = variant (FAS 4)
    });
  }

  function kontrollera(mount){
    var svar = mount.querySelectorAll('.ak8-svar[data-idx]'), tot = 0, ratt = 0;
    svar.forEach(function(el){
      var res = CHECKS[+el.dataset.idx](el);
      tot++;                                              // varje rättbar ruta räknas i nämnaren (tom = obesvarad → ej full pott)
      el.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.remove('ak8-ok', 'ak8-fel'); });
      var f0 = el.querySelector('.ak8-fasit'); if(f0) f0.remove();
      if(!UI.besvarad(el)) return;                        // tom ruta: räknad men varken markerad, rättad eller loggad
      el.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.add(res.ok ? 'ak8-ok' : 'ak8-fel'); });
      UI.markera(el.closest('.ak8-rad') || el, res.ok);
      // Loggning: en besvarad ruta = ett försök (rätt/fel). Tidsspärren i mastery.js kollapsar upprepade klick.
      var grEl = el.closest('.ovn-grupp'), loggNod = grEl && grEl.getAttribute('data-logg');
      if(loggNod && window.Mastery && window.Mastery.loggaForsok) window.Mastery.loggaForsok(loggNod, res.ok ? 'ratt' : 'fel');
      if(res.ok){ ratt++; }
      else { var f = document.createElement('span'); f.className = 'ak8-fasit'; f.innerHTML = 'rätt: ' + res.facit; el.appendChild(f); }
    });
    var s = mount.querySelector('[data-sammanf]'); s.hidden = false;
    if(ratt === tot && tot > 0){
      s.className = 'ovn-sammanf ok';
      s.innerHTML = '<span class="ovn-sammanf-icon">✓</span><span class="ovn-sammanf-titel">Allt rätt!</span>Snyggt räknat – ' + tot + ' av ' + tot + '.';
      if(window.visaAk8Konfetti) window.visaAk8Konfetti();
    } else {
      s.className = 'ovn-sammanf delvis';
      s.textContent = ratt + ' av ' + tot + ' rätt. Se facit vid de röda och försök igen.';
    }
  }

  // talBank(nod) — TESTETS talkälla (FAS 4b): raderna ur dokument 1 + en färsk variant för noden. Testet får
  // därmed bara tal som har täckning i Öva (Joachims tal + variantbandet) — sant per konstruktion, inte kontroll.
  function talBank(nod){
    var ut = [];
    DATA.concat(genVariant()).forEach(function(g){ if(g.logg === nod) g.rader.forEach(function(r){ ut.push(r); }); });
    return ut;
  }
  window.BLAD_AK8_KVROT = { renderBlad: renderBlad, genVariant: genVariant, talBank: talBank, DATA: DATA };
})();
