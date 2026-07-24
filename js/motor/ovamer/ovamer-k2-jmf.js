/* ============================================================
   ovamer-k2-jmf.js — JÄMFÖRA-BRÅK-DRILLARNA för k2 Del 4.
   NY fil — rör inte ovamer-k2.js/korOvning eller något befintligt mellanled.
   Laddas i ak7-k2-ram.html EFTER ovamer-k2.js och registreras i K2_DRILL.

   Jämförelse/omdöme autorättas inte som räkning → KLICK- och FLERVALS-svar.
   Egen interaktions-loop (korOvningKlick) som speglar korOvnings omgång/nivå/
   scorebar/konfetti och loggar via k2Logga — men renderar klickbara kort i
   stället för keypad. Nivån är adaptiv BARA UPPÅT (order).

   PILOT: markeraRiktmarkEngine (nod brak-jmf-riktmark) — "markera alla bråk som
   uppfyller villkoret" mot riktmärkena ½ och 1. Distraktorerna byggs av två
   primitiver: nära1 (n±1/n samt n/n=1) och nära½ (udda m → (m±1)/2 ∕ m).
   ============================================================ */
(function(){
  'use strict';
  function _gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }

  // ── GENERATOR: markera alla (mot ½ och 1) ─────────────────────
  // Returnerar { villkor, villkorText, brak:[[t,n]×5], ratt:[bool×5] }.
  function genMarkeraAlla(level, rnd){
    rnd = rnd || Math.random;
    level = level || 1;
    var maxN = 6 + level * 2;
    function ri(a, b){ return a + Math.floor(rnd() * (b - a + 1)); }
    function oddM(){ return 2 * ri(4, 5 + level * 2) + 1; }        // udda m ≥ 9 (för nära-½)
    // Kant- och "klar"-generatorer → [täljare, nämnare] (förkortade utom eq1)
    var gens = {
      eq1:     function(){ var n = ri(3, maxN); return [n, n]; },              // = 1 exakt (distraktor)
      over1s:  function(){ var n = ri(4, maxN); return [n + 1, n]; },          // strax över 1
      under1s: function(){ var n = ri(5, maxN); return [n - 1, n]; },          // strax under 1
      overHs:  function(){ var m = oddM(); return [(m + 1) / 2, m]; },         // strax över ½ (i (½,1))
      underHs: function(){ var m = oddM(); return [(m - 1) / 2, m]; },         // strax under ½
      overHk:  function(){ var a = [[2,3],[3,5],[5,7],[5,8],[4,7],[7,9]]; return a[ri(0, a.length - 1)]; }, // klart i (½,1)
      underHk: function(){ var a = [[1,4],[2,7],[1,3],[3,8],[2,9],[3,10]]; return a[ri(0, a.length - 1)]; }, // klart <½
      over1k:  function(){ var a = [[3,2],[5,3],[7,4],[7,5],[9,5],[11,6]]; return a[ri(0, a.length - 1)]; }  // klart >1
    };
    var V = {
      gt1:     { text: 'större än 1',                    ok: function(v){ return v > 1; },            sat: ['over1s','over1k'],                    fail: ['eq1','under1s','overHk','underHk','underHs'], hard: ['eq1','under1s'] },
      lt1:     { text: 'mindre än 1',                    ok: function(v){ return v < 1; },            sat: ['under1s','overHk','underHk','overHs','underHs'], fail: ['eq1','over1s','over1k'],         hard: ['eq1','over1s'] },
      lthalf:  { text: 'mindre än en halv',              ok: function(v){ return v < 0.5; },          sat: ['underHs','underHk'],                  fail: ['overHs','overHk','over1s','eq1'],             hard: ['overHs'] },
      between: { text: 'större än en halv men mindre än 1', ok: function(v){ return v > 0.5 && v < 1; }, sat: ['overHs','overHk','under1s'],        fail: ['underHs','underHk','over1s','eq1'],           hard: ['underHs','over1s','eq1'] }
    };
    var vkeys = Object.keys(V), vk = vkeys[ri(0, vkeys.length - 1)], v = V[vk];
    var k = ri(1, 3);                       // antal som uppfyller villkoret (aldrig 0, aldrig 5)
    var chosen = [], seen = {};
    function val(f){ return f[0] / f[1]; }
    function add(f){ var key = f[0] + '/' + f[1]; if(seen[key]) return false; seen[key] = 1; chosen.push(f); return true; }
    var t;
    t = 0; while(chosen.length < k && t++ < 300){ var g = v.sat[ri(0, v.sat.length - 1)], f = gens[g](); if(v.ok(val(f))) add(f); }
    t = 0; var hard = false; while(!hard && t++ < 300){ var gh = v.hard[ri(0, v.hard.length - 1)], fh = gens[gh](); if(!v.ok(val(fh))) hard = add(fh); }
    t = 0; while(chosen.length < 5 && t++ < 600){ var gf = v.fail[ri(0, v.fail.length - 1)], ff = gens[gf](); if(!v.ok(val(ff))) add(ff); }
    // Fisher–Yates-blandning med samma rnd
    for(var i = chosen.length - 1; i > 0; i--){ var j = Math.floor(rnd() * (i + 1)); var tmp = chosen[i]; chosen[i] = chosen[j]; chosen[j] = tmp; }
    return { villkor: vk, villkorText: v.text, brak: chosen, ratt: chosen.map(function(f){ return v.ok(val(f)); }) };
  }

  if(typeof window !== 'undefined') window.genMarkeraAlla = genMarkeraAlla;
  if(typeof module !== 'undefined' && module.exports) module.exports = { genMarkeraAlla: genMarkeraAlla, _gcd: _gcd };

  // ── KLICK-HARNESS: speglar korOvning men med klickbara kort ───
  if(typeof window !== 'undefined' && typeof window.frac === 'function'){
    var frac = window.frac;
    // Engångs-CSS för klickdrillarna
    function ensureCSS(){
      if(document.getElementById('jmf-css')) return;
      var s = document.createElement('style'); s.id = 'jmf-css';
      s.textContent =
        '.jmf-kortrad{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0 6px;}'
      + '.jmf-kort{display:inline-flex;align-items:center;justify-content:center;min-width:78px;padding:14px 18px;'
      + 'border:2px solid #e2d9c6;border-radius:12px;background:#fff;cursor:pointer;font-size:22px;transition:all .12s;}'
      + '.jmf-kort:hover{border-color:#c49a40;}'
      + '.jmf-kort.sel{border-color:#0f1e2e;background:#0f1e2e;box-shadow:0 3px 10px rgba(15,30,46,.18);}'
      + '.jmf-kort.sel .brak{color:#fff;}'
      + '.jmf-kort.ratt{border-color:#2f7d4f;background:rgba(47,125,79,.12);}'
      + '.jmf-kort.fel{border-color:#c0392b;background:rgba(192,57,43,.12);}'
      + '.jmf-kort.miss{border-style:dashed;border-color:#c49a40;}'
      + '.jmf-villkor{font-size:19px;margin:6px 0 2px;}'
      + '.jmf-villkor .brak{margin:0 3px;}';
      document.head.appendChild(s);
    }
    // task: { fragaHtml, kort:[{html, ratt:bool}], facitText }
    window.korOvningKlick = function korOvningKlick(opts){
      ensureCSS();
      var app = window.app || document.getElementById('app');
      var hero = document.getElementById('hero'); if(hero) hero.style.display = 'none';
      var level = 1, omgang = [], idx = 0, results = [], OMG = 6;
      function nyOmgang(){ omgang = []; for(var i = 0; i < OMG; i++) omgang.push(opts.gen(level)); idx = 0; results = []; }
      function render(){
        if(idx >= omgang.length){
          var right = results.filter(function(x){ return x; }).length;
          if(right >= Math.ceil(OMG * 0.8) && level < 3) level++;   // adaptiv BARA uppåt
          app.innerHTML = '<div class="view"><div class="exercise-card">'
            + '<div class="ex-header"><h2 class="ex-title">Klart!</h2><div class="ex-sub">Du klarade ' + right + ' av ' + OMG + '.</div></div>'
            + '<div class="summary"><div class="summary-big">' + right + '/' + OMG + '</div>'
            + '<div class="summary-txt">' + (right >= OMG - 1 ? 'Starkt! Nästa omgång kan bli svårare.' : 'Fortsätt träna!') + '</div>'
            + '<div class="summary-level">Nivå ' + level + '</div></div>'
            + '<div class="ex-actions"><button class="btn primary" id="next">Ny omgång</button>'
            + '<button class="btn subtle" id="back">Till alla områden</button></div></div></div>';
          document.getElementById('next').onclick = function(){ nyOmgang(); render(); };
          document.getElementById('back').onclick = opts.back;
          if(right >= OMG - 1 && window.konfetti) window.konfetti();
          return;
        }
        var task = omgang[idx], dots = '';
        for(var i = 0; i < OMG; i++){ var cls = i < idx ? (results[i] ? 'right' : 'wrong') : (i === idx ? 'current' : ''); dots += '<div class="score-dot ' + cls + '"></div>'; }
        var kortHtml = task.kort.map(function(k, ki){ return '<button class="jmf-kort" data-i="' + ki + '">' + k.html + '</button>'; }).join('');
        app.innerHTML = '<div class="view"><div class="exercise-card">'
          + '<div class="ex-header"><h2 class="ex-title">' + opts.titel + '</h2><div class="ex-sub">' + opts.sub + '</div><span class="ex-level">Nivå ' + level + '</span></div>'
          + '<div class="scorebar">' + dots + '</div>'
          + '<div class="jmf-villkor">' + task.fragaHtml + '</div>'
          + '<div class="jmf-kortrad">' + kortHtml + '</div>'
          + '<div class="ex-feedback" id="fb"></div>'
          + '<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button>'
          + '<button class="btn subtle" id="back">Tillbaka</button></div></div></div>';
        var kort = Array.prototype.slice.call(app.querySelectorAll('.jmf-kort'));
        kort.forEach(function(el){ el.onclick = function(){ if(el.classList.contains('ratt') || el.classList.contains('fel') || el.classList.contains('miss')) return; el.classList.toggle('sel'); }; });
        document.getElementById('back').onclick = opts.back;
        document.getElementById('check').onclick = function(){
          var fb = document.getElementById('fb'); fb.className = 'ex-feedback show';
          var ok = true;
          kort.forEach(function(el, ki){
            var vald = el.classList.contains('sel'), ratt = task.kort[ki].ratt;
            el.classList.remove('sel'); el.style.pointerEvents = 'none';
            if(ratt && vald) el.classList.add('ratt');
            else if(!ratt && vald){ el.classList.add('fel'); ok = false; }
            else if(ratt && !vald){ el.classList.add('miss'); ok = false; }
          });
          if(ok){ fb.classList.add('correct'); fb.textContent = 'Rätt!'; }
          else { fb.classList.add('wrong'); fb.innerHTML = task.facitText; }
          results.push(ok);
          if(window.k2Logga) window.k2Logga(ok);       // additiv mastery-logg → färgar kartan
          var b = document.createElement('button'); b.className = 'btn primary'; b.textContent = (idx + 1 >= OMG ? 'Se resultat' : 'Nästa');
          b.onclick = function(){ idx++; render(); };
          document.getElementById('check').replaceWith(b);
        };
      }
      nyOmgang(); render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── PILOT-ENGINE: markera alla mot ½ och 1 (nod brak-jmf-riktmark) ──
    window.markeraRiktmarkEngine = function(){
      window.korOvningKlick({
        titel: 'Jämföra mot en halv och en hel',
        sub: 'Markera alla bråk som uppfyller villkoret.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genMarkeraAlla(level);
          var facit = u.brak.filter(function(f, i){ return u.ratt[i]; }).map(function(f){ return frac(f[0], f[1]); });
          return {
            fragaHtml: 'Markera alla bråk som är <strong>' + u.villkorText + '</strong>.',
            kort: u.brak.map(function(f, i){ return { html: frac(f[0], f[1]), ratt: u.ratt[i] }; }),
            facitText: 'Rätt: ' + (facit.length ? facit.join(' &nbsp; ') : '(inga)')
          };
        }
      });
    };
  }
})();
