/* blad-ak8-d3.js — Åk8 kapitel 1, delkapitel 2 (Grunder): Öva-blad.
   Bygg-id: d3 (motorer = bygg-id; delkapitel-numret bor i ak8-k1-bok.js). Samma mönster som
   blad-ak8-d1 (mult/div) + d2 (negativa): självständig motor, exakt-författade tal.
   Två blad byggda: "Räkna i positionssystemet" + "Storlek och ordning" (tal REGENERERADE,
   unika mot sjuan). Tiosystemet (blad 1) väntar på beslut om nya blad-mekanismer.
   Talen vänsterställda. Tallinjer ritas via window.SvgTallinje (svg-tallinje.js). */
(function(){
  'use strict';

  // ── Facit-numerik (identiskt beteende som d1/d2) ──
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(/[−–—]/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }   // FAS1: minus-varianter → U+002D
  function fmt(x){ var r = Math.round(x * 1e9) / 1e9, s = String(r).replace('.', ','); return s; }
  function likhetOk(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  function inTal(sm){ return '<input class="ak8-in' + (sm ? ' ak8-in-sm' : '') + '" inputmode="text" autocomplete="off">'; }

  // ── Uppgifts-fabriker ──
  function T(fraga, facit){ return { typ:'tal', fraga:fraga, facit:facit }; }                       // ett talsvar
  function FOLJD(pre, facit){ return { typ:'foljd', pre:pre, facit:facit }; }                       // skriv nästa tal (en input per facit)
  function ORDNA(tal, minstForst){                                                                  // klicka talen i storleksordning
    var idx = tal.map(function(_, i){ return i; }).sort(function(a, b){ return minstForst ? tal[a] - tal[b] : tal[b] - tal[a]; });
    return { typ:'ordna', tal:tal, ordning:idx, minstForst:minstForst !== false };
  }
  function VILLKOR(krav, antal, test, exempel){ return { typ:'villkor', krav:krav, antal:antal, test:test, exempel:exempel }; }  // skriv N tal som uppfyller test
  function PT(v, namn){ return { v:v, namn:namn }; }
  function LINJE(min, max, steg, etiketter, punkter){ return { min:min, max:max, steg:steg, etiketter:etiketter, punkter:punkter }; }
  function AVLAS(linjer){ return { typ:'avlas', linjer:linjer }; }                                  // tallinje(r): avläs vad pilarna pekar på
  function G(rubrik, rader, hint){ return { rubrik:rubrik, rader:rader, hint:hint }; }

  // Tiosystemet-mekanismer (godkända: tecken/valjflera/produkt/summa).
  var PLATSER = ['tusental', 'hundratal', 'tiotal', 'ental', 'tiondel', 'hundradel', 'tusendel'];
  function TECKEN(fraga, alt, ratt){ return { typ:'tecken', fraga:fraga, alt:alt, ratt:ratt }; }   // välj rätt platsvärde (chip)
  function VALJ(tal, test){ return { typ:'valjflera', tal:tal, test:test }; }                        // klicka de tal som uppfyller test
  function PROD(tal){ return { typ:'produkt', tal:tal }; }                                            // två faktorer, produkt = tal
  function SUM(tal, antal){ return { typ:'summa', tal:tal, antal:antal }; }                           // N distinkta termer, summa = tal
  function arSammansatt(v){ if(v < 4) return false; for(var d = 2; d * d <= v; d++) if(v % d === 0) return true; return false; }
  function minstaFaktor(v){ for(var d = 2; d * d <= v; d++) if(v % d === 0) return d; return v; }
  function exempelSumma(tal, antal){ var t = [], s = 0; for(var i = 1; i < antal; i++){ t.push(i); s += i; } t.push(tal - s); return t.join(' + '); }

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD: Räkna i positionssystemet  (nya tal, unika mot sjuan)
  // ══════════════════════════════════════════════════════════════════════════════════════
  var RAKNA = { nr:2, titel:'Räkna i positionssystemet', nod:'position:rakna', uppg:[
    G('Skriv två tal inom varje intervall', [
      VILLKOR('mellan 3,4 och 3,6', 2, function(x){ return x >= 3.4 && x <= 3.6; }, '3,45  och  3,52'),
      VILLKOR('mellan 149 och 150',  2, function(x){ return x >= 149 && x <= 150; }, '149,3  och  149,8'),
      VILLKOR('mellan 0,53 och 0,54', 2, function(x){ return x >= 0.53 && x <= 0.54; }, '0,532  och  0,537')
    ]),
    G('Räkna med huvudräkning', [
      T('0,7 + 0,4 =', 1.1), T('0,1 + 2,9 =', 3), T('0,1 + 5,97 =', 6.07)
    ]),
    G('Räkna med huvudräkning', [
      T('14,927 − 0,1 =', 14.827), T('1,24 − 0,1 =', 1.14), T('1,03 − 0,1 =', 0.93)
    ]),
    G('Vilket tal ska stå i rutan', [
      T('472 − ⃞ = 470,&nbsp; ⃞ =', 2), T('6742 − ⃞ = 742,&nbsp; ⃞ =', 6000), T('3519 − ⃞ = 3469,&nbsp; ⃞ =', 50)
    ]),
    G('Räkna med huvudräkning', [
      T('5,235 − 0,01 =', 5.225), T('0,01 + 3,99 =', 4), T('0,01 + 5,997 =', 6.007)
    ]),
    G('Vilket tal är 7 tiondelar större än', [
      T('13,4', 14.1), T('8,26', 8.96)
    ]),
    G('Vilket tal ska stå i rutan', [
      T('6743 − ⃞ = 6593,&nbsp; ⃞ =', 150), T('8271 − ⃞ = 7871,&nbsp; ⃞ =', 400), T('9482 − ⃞ = 1300,&nbsp; ⃞ =', 8182)
    ]),
    G('Vilket tal ligger mittemellan', [
      T('4,2 och 4,3', 4.25), T('0,26 och 0,27', 0.265), T('517 och 518', 517.5)
    ]),
    G('Räkna med huvudräkning', [
      T('12,748 − 0,01 =', 12.738), T('17 − 0,01 =', 16.99), T('1,004 − 0,01 =', 0.994)
    ]),
    G('Räkna med huvudräkning', [
      T('0,7 + 0,45 =', 1.15), T('1 − 0,3 =', 0.7), T('4 − 2,6 =', 1.4), T('0,74 + 1,08 =', 1.82), T('3,65 − 1,4 =', 2.25)
    ]),
    G('Vilket tal ligger mittemellan', [
      T('1,25 och 1,2', 1.225), T('0,58 och 0,7', 0.64)
    ])
  ] };

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD: Storlek och ordning  (nya tal + nya pilpositioner, unika mot sjuan)
  // ══════════════════════════════════════════════════════════════════════════════════════
  var STORLEK = { nr:3, titel:'Storlek och ordning', nod:'position:rakna', uppg:[
    G('Vilka tal pekar pilarna på?', [
      AVLAS([
        LINJE(0, 0.015, 0.001, [0, 0.005, 0.01, 0.015], [PT(0.002, 'A'), PT(0.008, 'B'), PT(0.014, 'C')]),
        LINJE(0.01, 0.025, 0.001, [0.01, 0.015, 0.02, 0.025], [PT(0.012, 'A'), PT(0.017, 'B'), PT(0.022, 'C')])
      ])
    ]),
    G('Gör tre 0,4-hopp bakåt för varje tal', [
      FOLJD('41,35,', [40.95, 40.55, 40.15]),
      FOLJD('8,64,', [8.24, 7.84, 7.44])
    ]),
    G('Skriv de två talen som kommer i talföljden', [
      FOLJD('0,3   0,5   0,7,', [0.9, 1.1]),
      FOLJD('4,80   4,55   4,30,', [4.05, 3.80]),
      FOLJD('0,52   0,56   0,60,', [0.64, 0.68]),
      FOLJD('0,3   0,6   0,9,', [1.2, 1.5])
    ]),
    G('Skriv talen i storleksordning, börja med det minsta', [
      ORDNA([7.3, 7.205, 7.21, 7.109], true),
      ORDNA([0.53, 0.5, 0.07, 2.845], true)
    ]),
    G('Vilka tal pekar pilarna på?', [
      AVLAS([
        LINJE(0, 20, 1, [0, 10, 20], [PT(3, 'A'), PT(7, 'B'), PT(16, 'C')]),
        LINJE(0, 1.5, 0.1, [0, 0.5, 1, 1.5], [PT(0.2, 'A'), PT(0.7, 'B'), PT(1.2, 'C')])
      ])
    ]),
    G('Vilket tal är en hundradel mindre än', [
      T('5', 4.99), T('14,7', 14.69), T('8,304', 8.294)
    ]),
    G('Ordna talen i storleksordning, börja med det minsta', [
      ORDNA([0.27, 0.2, 0.3, 1.6, 0.25, 3], true)
    ]),
    G('Vilket tal är en tusendel mindre än', [
      T('4', 3.999), T('5000', 4999.999), T('0,63', 0.629)
    ]),
    G('Vilka tal pekar pilarna på?', [
      AVLAS([
        LINJE(0.1, 0.25, 0.01, [0.1, 0.15, 0.2, 0.25], [PT(0.13, 'A'), PT(0.19, 'B'), PT(0.23, 'C')]),
        LINJE(0, 0.15, 0.01, [0, 0.05, 0.1, 0.15], [PT(0.03, 'A'), PT(0.07, 'B'), PT(0.12, 'C')])
      ])
    ]),
    G('Ordna talen i storleksordning, börja med det minsta', [
      ORDNA([1.04, 0.368, 0.8, 1.2, 0.20, 0.02], true)
    ]),
    G('Skriv ett tal som är', [
      VILLKOR('större än 4,9 men mindre än 5',    1, function(x){ return x > 4.9 && x < 5; }, '4,95'),
      VILLKOR('större än 7 men mindre än 7,01',   1, function(x){ return x > 7 && x < 7.01; }, '7,005')
    ])
  ] };

  // ══════════════════════════════════════════════════════════════════════════════════════
  // BLAD: Tiosystemet  (blandat: positionssystem + tal-teori). 12,5 → 125 (bekräftat).
  // ══════════════════════════════════════════════════════════════════════════════════════
  var TIOSYSTEMET = { nr:1, titel:'Tiosystemet', nod:'position:begrepp', uppg:[
    G('Vilket platsvärde har siffran 8? Välj rätt platsvärde', [
      TECKEN('i 835', PLATSER, 'hundratal'),
      TECKEN('i 17,89', PLATSER, 'tiondel'),
      TECKEN('i 18 340', PLATSER, 'tusental'),
      TECKEN('i 9,08', PLATSER, 'hundradel')
    ]),
    G('Skriv talet med siffror', [
      T('åttatusen sjutton', 8017),
      T('femhundratre komma tretton', 503.13),
      T('åtta tiotal, fyra tiondelar och 2 tusendelar', 80.402)
    ]),
    G('Skriv som tal', [
      T('19 tiondelar', 1.9), T('37 tusendelar', 0.037), T('802 hundradelar', 8.02)
    ]),
    G('Vilka tal är sammansatta tal? Klicka på dem', [
      VALJ([7, 12, 13, 17, 25], function(v){ return arSammansatt(v); })
    ]),
    G('Faktorisera i två faktorer', [
      PROD(35), PROD(32)
    ]),
    G('Skriv talet med tre olika termer', [
      SUM(27, 3), SUM(19, 3)
    ]),
    G('Vilka tal är delbara med 5? Klicka på dem', [
      VALJ([67, 75, 125, 176, 18970], function(v){ return v % 5 === 0; })
    ]),
    G('Vilka tal är delbara med 3? Klicka på dem', [
      VALJ([87, 135, 973, 761, 4302], function(v){ return v % 3 === 0; })
    ]),
    G('Utvecklad form &amp; faktorträd', [],
      'Öva "Skriv i utvecklad form" och "Bygg faktorträd" i fliken <em>Färdighetsträning</em> – de har egna interaktiva verktyg.')
  ] };

  // ── RENDER ──
  var CHECKS = [];
  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'tal'){
      CHECKS.push(function(el){ return { ok: likhetOk(pNum(el.querySelector('.ak8-in').value), r.facit), facit: fmt(r.facit) }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + inTal() + '</span></div>';
    }
    if(r.typ === 'foljd'){
      CHECKS.push(function(el){
        var ins = el.querySelectorAll('.ak8-in'), ok = true;
        r.facit.forEach(function(f, i){ if(!likhetOk(pNum(ins[i].value), f)) ok = false; });
        return { ok: ok, facit: r.facit.map(fmt).join('   ') };
      });
      var boxar = r.facit.map(function(){ return inTal(true); }).join(' ');
      return '<div class="ak8-rad"><span class="ak8-q">' + r.pre + '</span><span class="ak8-svar" data-idx="' + idx + '">' + boxar + '</span></div>';
    }
    if(r.typ === 'ordna'){
      CHECKS.push(function(el){
        var valda = [].slice.call(el.querySelectorAll('.ak8-tal.sel'));
        valda.sort(function(a, b){ return (+a.querySelector('.ak8-ordnr').textContent) - (+b.querySelector('.ak8-ordnr').textContent); });
        var ok = valda.length === r.tal.length && valda.every(function(t, i){ return (+t.dataset.i) === r.ordning[i]; });
        return { ok: ok, facit: r.ordning.map(function(i){ return fmt(r.tal[i]); }).join('   '), ordna: true };
      });
      var knappar = r.tal.map(function(v, i){ return '<button type="button" class="ak8-tal" data-i="' + i + '"><span class="ak8-ordnr"></span>' + fmt(v) + '</button>'; }).join('');
      return '<div class="ak8-rad"><span class="ak8-svar" data-idx="' + idx + '"><span class="ak8-ordna">' + knappar + '</span></span></div>';
    }
    if(r.typ === 'villkor'){
      CHECKS.push(function(el){
        var ins = el.querySelectorAll('.ak8-in'), varden = [], ok = true;
        ins.forEach(function(inp){ var v = pNum(inp.value); if(!isFinite(v) || !r.test(v)) ok = false; varden.push(v); });
        for(var a = 0; a < varden.length; a++) for(var b = a + 1; b < varden.length; b++) if(Math.abs(varden[a] - varden[b]) < 1e-6) ok = false;  // distinkta
        return { ok: ok, facit: 't.ex. ' + r.exempel };
      });
      var rutor = []; for(var k = 0; k < r.antal; k++) rutor.push(inTal(true));
      return '<div class="ak8-rad"><span class="ak8-q">' + r.krav + '</span><span class="ak8-svar" data-idx="' + idx + '">' + rutor.join(' ') + '</span></div>';
    }
    if(r.typ === 'avlas'){
      var varden = [], svg = '';
      r.linjer.forEach(function(lin, li){
        svg += (r.linjer.length > 1 ? '<div class="ak8-linje-nr">' + 'abc'.charAt(li) + ')</div>' : '')
          + '<div class="ak8-tallinje">' + window.SvgTallinje.linje(lin) + '</div>';
        var rad = '<div class="ak8-avlas-rad">';
        lin.punkter.forEach(function(p){ varden.push(p.v); rad += '<span class="ak8-avlas-in">' + p.namn + ' = ' + inTal(true) + '</span>'; });
        svg += rad + '</div>';
      });
      CHECKS.push(function(el){
        var ins = el.querySelectorAll('.ak8-in'), ok = true;
        varden.forEach(function(v, i){ if(!likhetOk(pNum(ins[i].value), v)) ok = false; });
        return { ok: ok, facit: varden.map(fmt).join(', ') };
      });
      return '<div class="ak8-rad ak8-rad-fig"><span class="ak8-svar" data-idx="' + idx + '">' + svg + '</span></div>';
    }
    if(r.typ === 'tecken'){
      CHECKS.push(function(el){ var s = el.querySelector('.ak8-chip.sel'); return { ok: !!s && s.dataset.val === r.ratt, facit: r.ratt, chip:true }; });
      var chips = r.alt.map(function(a){ return '<button type="button" class="ak8-chip" data-val="' + a + '">' + a + '</button>'; }).join('');
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '"><span class="ak8-teckenslot">' + chips + '</span></span></div>';
    }
    if(r.typ === 'valjflera'){
      CHECKS.push(function(el){
        var bs = el.querySelectorAll('.ak8-vf'), ok = true, ratt = [];
        bs.forEach(function(b){ var sel = b.classList.contains('sel'), rat = b.dataset.ratt === '1'; if(rat) ratt.push(b.textContent); if(sel !== rat) ok = false; });
        return { ok: ok, facit: ratt.join('   '), valjflera:true };
      });
      var knappar = r.tal.map(function(v){ return '<button type="button" class="ak8-tal ak8-vf" data-ratt="' + (r.test(v) ? '1' : '0') + '">' + fmt(v) + '</button>'; }).join('');
      return '<div class="ak8-rad"><span class="ak8-svar" data-idx="' + idx + '"><span class="ak8-ordna">' + knappar + '</span></span></div>';
    }
    if(r.typ === 'produkt'){
      CHECKS.push(function(el){
        var ins = el.querySelectorAll('.ak8-in'), a = pNum(ins[0].value), b = pNum(ins[1].value);
        var ok = isFinite(a) && isFinite(b) && a > 1 && b > 1 && Math.abs(a * b - r.tal) < 1e-9;
        var d = minstaFaktor(r.tal); return { ok: ok, facit: 't.ex. ' + d + ' · ' + (r.tal / d) };
      });
      return '<div class="ak8-rad"><span class="ak8-q">' + fmt(r.tal) + ' =</span><span class="ak8-svar" data-idx="' + idx + '">' + inTal(true) + ' <span class="ak8-q">·</span> ' + inTal(true) + '</span></div>';
    }
    if(r.typ === 'summa'){
      CHECKS.push(function(el){
        var ins = el.querySelectorAll('.ak8-in'), v = [].map.call(ins, function(i){ return pNum(i.value); });
        var ok = v.every(function(x){ return isFinite(x); }) && Math.abs(v.reduce(function(a, b){ return a + b; }, 0) - r.tal) < 1e-9;
        for(var a = 0; a < v.length; a++) for(var b = a + 1; b < v.length; b++) if(Math.abs(v[a] - v[b]) < 1e-9) ok = false;   // distinkta
        return { ok: ok, facit: 't.ex. ' + exempelSumma(r.tal, r.antal) };
      });
      var rutor = []; for(var k = 0; k < r.antal; k++) rutor.push(inTal(true));
      return '<div class="ak8-rad"><span class="ak8-q">' + fmt(r.tal) + ' =</span><span class="ak8-svar" data-idx="' + idx + '">' + rutor.join(' <span class="ak8-q">+</span> ') + '</span></div>';
    }
    return '';
  }

  function renderBlad(mount, blad){
    var html = '<div class="ovn-sheet"><h2>' + blad.titel + '</h2>';
    blad.uppg.forEach(function(g, gi){
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">' + (gi + 1) + '. ' + g.rubrik + '</div>'
        + (g.hint ? '<div class="ak8-hint">' + g.hint + '</div>' : '');
      var bokN = 0;
      g.rader.forEach(function(r){
        var h = renderRad(r);
        if(/^<div class="ak8-rad[^"]*">/.test(h)){ h = AK8_UI.injLabel(h, bokN); bokN++; }
        html += h;
      });
      html += '</div>';
    });
    html += '<div class="ovn-kontroll-rad"><button class="ovn-kontroll" data-kontroll>Kontrollera</button>'
      + '<button class="ovn-aterstall" data-reset>Återställ</button>' + AK8_UI.printKnappHTML() + '</div>'
      + '<div class="ovn-sammanf" data-sammanf hidden></div></div>';
    html += AK8_UI.keypadHTML({ ops:[',', '−'] });
    mount.innerHTML = html;
    // ordna: klicka i ordning → stämpla sekvensnummer (valjflera-knappar exkluderas)
    mount.querySelectorAll('.ak8-tal:not(.ak8-vf)').forEach(function(btn){
      btn.onclick = function(){
        var grid = btn.closest('.ak8-ordna');
        if(btn.classList.contains('sel')){
          btn.classList.remove('sel'); btn.querySelector('.ak8-ordnr').textContent = '';
          var kvar = [].slice.call(grid.querySelectorAll('.ak8-tal.sel')).sort(function(a, b){ return (+a.querySelector('.ak8-ordnr').textContent) - (+b.querySelector('.ak8-ordnr').textContent); });
          kvar.forEach(function(t, i){ t.querySelector('.ak8-ordnr').textContent = (i + 1); });
        } else {
          btn.classList.add('sel'); btn.querySelector('.ak8-ordnr').textContent = grid.querySelectorAll('.ak8-tal.sel').length;
        }
      };
    });
    // tecken: enkel-val chip. valjflera: växla-val.
    mount.querySelectorAll('.ak8-teckenslot').forEach(function(slot){
      slot.querySelectorAll('.ak8-chip').forEach(function(chip){ chip.onclick = function(){ slot.querySelectorAll('.ak8-chip').forEach(function(c){ c.classList.toggle('sel', c === chip); }); }; });
    });
    mount.querySelectorAll('.ak8-vf').forEach(function(b){ b.onclick = function(){ b.classList.toggle('sel'); }; });
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount); };
    mount.querySelector('[data-reset]').onclick = function(){ CHECKS = []; renderBlad(mount, blad); };
    AK8_UI.bindSheet(mount);
  }

  function kontrollera(mount){
    var svar = mount.querySelectorAll('.ak8-svar[data-idx]'), tot = 0, ratt = 0;
    svar.forEach(function(el){
      var res = CHECKS[+el.dataset.idx](el);
      if(res.flagg) return;
      if(!AK8_UI.besvarad(el)) return;   // obesvarad ruta räknas ej
      tot++;
      if(res.ordna){
        el.querySelector('.ak8-ordna').classList.add(res.ok ? 'ak8-ok-ram' : 'ak8-fel-ram');
      } else if(res.chip){
        var s = el.querySelector('.ak8-chip.sel'); if(s) s.classList.add(res.ok ? 'ratt' : 'fel');
      } else if(res.valjflera){
        el.querySelectorAll('.ak8-vf').forEach(function(b){ var sel = b.classList.contains('sel'), rat = b.dataset.ratt === '1'; if(sel && rat) b.classList.add('ratt'); else if(sel !== rat) b.classList.add('fel'); });
      } else {
        el.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.add(res.ok ? 'ak8-ok' : 'ak8-fel'); });
      }
      AK8_UI.markera(el.closest('.ak8-rad') || el, res.ok);
      if(res.ok){ ratt++; }
      else if(!el.querySelector('.ak8-fasit')){
        var f = document.createElement('span'); f.className = 'ak8-fasit'; f.textContent = 'rätt: ' + res.facit; el.appendChild(f);
      }
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

  window.BLAD_AK8_D3 = {
    TIOSYSTEMET: TIOSYSTEMET, RAKNA: RAKNA, STORLEK: STORLEK,
    renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, ({ TIOSYSTEMET:TIOSYSTEMET, RAKNA:RAKNA, STORLEK:STORLEK })[key]); }
  };
})();
