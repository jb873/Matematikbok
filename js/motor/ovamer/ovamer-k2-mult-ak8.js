/* ============================================================
   ovamer-k2-mult-ak8.js — ÅTTANS färdighetsträning för multiplikation med bråk (order 2026-09-21, FAS 2).
   Additiv: åk7:s multBrakEngine (ovamer-k2-mult.js) rörs inte. Registreras i k2-ramens K2_DRILL för
   ko=brak-mult-rakna / brak-mult-forkorta NÄR deeplinken bär ?variant= — ett KORT PER ÖVA-GRUPP i blad-ak8-d7:

     variant   öva-grupp (d7)                                        nod (loggas ur ?ko=)
     hb        B1 g1 heltal · bråk, svar i blandad form              brak-mult-rakna
     bb        B1 g2 bråk · bråk, visa mellanled                     brak-mult-rakna
     produkt   B1 g3 förkorta produktbråk (11·5)/10                  brak-mult-forkorta
     huvud     B1 g4 räkna i huvudet (fri, inget mellanled)          brak-mult-rakna
     hm        B1 g5 heltal · blandad form                           brak-mult-rakna
     forkorta  B1 g6 förkorta och beräkna (korsförkortning)          brak-mult-forkorta
     mm        B2 g1/g3 blandad · blandad, förenkla innan            brak-mult-rakna
     tre       B2 g2 tre faktorer, förkorta                          brak-mult-forkorta

   Ytan är öva-bladets: AK8_UI (ak8-blad-ui) — DELAD keypad med EN bråkknapp, uttryckscell för mellanledet
   (värde-rättad, valfri väg), och en SVARSRUTA SOM FÖLJER SVARSFORMEN: heltal → en ruta, äkta bråk → bråkcell,
   oäkta → blandad cell (hel + bråk; oäkta godtas när kravet är 'enklaste'). Rättning = Likhetsrattare
   (finalStatus + svarform), samma regel som bladen och testet. Facit räknas ur talen.
   Nivå 1–3 via adjustLevel (metod-karna); evidens via k2Logga (mastery-k2). Konfetti vid ≥ 5 av 6.
   CSS: ak8-blad-kanon.css + ak8-blad-ui.css länkas in när engine startar (k2-ramens egen .keypad är en annan
   layout — den gamla raden — och får inte samma CSS; därför inte i <head>).
   ============================================================ */
(function(){
  'use strict';
  if(typeof window === 'undefined') return;

  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function rI(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  function rP(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function proper(maxN){ for(var k = 0; k < 60; k++){ var n = rI(2, maxN), t = rI(1, n - 1); if(gcd(t, n) === 1) return [t, n]; } return [1, 2]; }
  function MI(h, t, n){ return { k: 'mi', h: h, t: t, n: n }; }
  function BR(t, n){ return { k: 'br', t: t, n: n }; }
  function DE(x){ return { k: 'dec', x: x }; }
  // slutform ur värdet T/N (förkortat): heltal → decimal, oäkta → blandad, äkta → bråk
  function fin(T, N){ var g = gcd(T, N); T /= g; N /= g; return N === 1 ? DE(T) : T > N ? MI(Math.floor(T / N), T % N, N) : BR(T, N); }
  function finText(f){ return f.k === 'dec' ? String(f.x) : f.k === 'br' ? f.t + '/' + f.n : f.h + ' ' + f.t + '/' + f.n; }

  // ── visning (stående bråk, blandad, produktbråk) ──
  function fr(t, n){ return '<span class="ovn-brak"><span class="ovn-brak-taljare">' + t + '</span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare">' + n + '</span></span>'; }
  function mx(h, t, n){ return h + '&nbsp;' + fr(t, n); }
  var GNG = ' · ';

  // ── generatorer per variant: {q, T, N, svarform, mellan} (T/N = värdet, oförkortat) ──
  var GEN = {
    hb: function(lvl){   // heltal · bråk → oäkta (svar i blandad form, som öva-gruppen)
      for(var k = 0; k < 80; k++){ var h = rI(2, 3 + lvl * 2), b = proper(3 + lvl * 2); var T = h * b[0], N = b[1];
        if(T > N && T % N !== 0) return { q: h + GNG + fr(b[0], b[1]), T: T, N: N, svarform: 'blandad', mellan: true }; }
      return { q: 5 + GNG + fr(3, 4), T: 15, N: 4, svarform: 'blandad', mellan: true };
    },
    bb: function(lvl, d){   // bråk · bråk (äkta svar, enklaste form)
      var a = proper(3 + lvl * 2), b = proper(3 + lvl * 2);
      if(a[0] === b[0] && a[1] === b[1]) return (d || 0) < 20 ? GEN.bb(lvl, (d || 0) + 1) : { q: fr(a[0], a[1]) + GNG + fr(b[0], b[1]), T: a[0] * b[0], N: a[1] * b[1], svarform: 'enklaste', mellan: true };   // inte samma bråk två gånger (TAK 20 omdragningar)
      return { q: fr(a[0], a[1]) + GNG + fr(b[0], b[1]), T: a[0] * b[0], N: a[1] * b[1], svarform: 'enklaste', mellan: true };
    },
    produkt: function(lvl){   // förkorta produktbråk: (a·b)/c eller c/(a·b), gemensam faktor finns
      for(var k = 0; k < 80; k++){ var c = rP(lvl < 2 ? [10, 12, 15, 18] : lvl < 3 ? [12, 15, 18, 20, 21, 24] : [18, 20, 21, 24, 28, 30, 36]);
        var a = rI(2, 5 + lvl * 2), b = rI(2, 9 + lvl * 3); if(gcd(a * b, c) === 1) continue;
        var upp = Math.random() < 0.6;
        return upp ? { q: fr(a + '·' + b, c), T: a * b, N: c, svarform: 'enklaste', mellan: true } : { q: fr(c, a + '·' + b), T: c, N: a * b, svarform: 'enklaste', mellan: true }; }
      return { q: fr('11·5', 10), T: 55, N: 10, svarform: 'enklaste', mellan: true };
    },
    huvud: function(lvl){   // huvudräkning: bråk · heltal, bråk · bråk, heltal · oäkta — inget mellanled (fri)
      var slag = rP(['bh', 'bb', 'ho']), b = proper(4 + lvl * 2);
      if(slag === 'bh'){ var h = rI(2, 4 + lvl * 2); return { q: fr(b[0], b[1]) + GNG + h, T: b[0] * h, N: b[1], svarform: 'enklaste', mellan: false }; }
      if(slag === 'bb'){ var c = proper(4 + lvl * 2); return { q: fr(b[0], b[1]) + GNG + fr(c[0], c[1]), T: b[0] * c[0], N: b[1] * c[1], svarform: 'enklaste', mellan: false }; }
      var h2 = rI(2, 3 + lvl), n = rI(3, 5 + lvl * 2), t = rI(n + 1, 2 * n + lvl * 2); return { q: h2 + GNG + fr(t, n), T: h2 * t, N: n, svarform: 'enklaste', mellan: false };
    },
    hm: function(lvl){   // heltal · blandad form
      var h = rI(2, 3 + lvl), hel = rI(1, 2 + lvl), b = proper(3 + lvl * 2);
      return { q: h + GNG + mx(hel, b[0], b[1]), T: h * (hel * b[1] + b[0]), N: b[1], svarform: 'enklaste', mellan: true };
    },
    forkorta: function(lvl, d){   // korsförkortning tvingad: t1=p1·g1, n1=q1·g2, t2=p2·g2, n2=q2·g1
      var G = lvl < 2 ? [2, 3, 5] : lvl < 3 ? [3, 5, 7, 11] : [7, 11, 13];
      var p1 = rI(1, 3), q1 = rI(2, 4), p2 = rI(1, 3), q2 = rI(2, 4), g1 = rP(G), g2 = rP(G);
      var t1 = p1 * g1, n1 = q1 * g2, t2 = p2 * g2, n2 = q2 * g1;
      if(t1 === n1 || t2 === n2 || (t1 === t2 && n1 === n2) || t1 * t2 === n1 * n2) return (d || 0) < 20 ? GEN.forkorta(lvl, (d || 0) + 1) : { q: fr(3, 4) + GNG + fr(2, 9), T: 6, N: 36, svarform: 'enklaste', mellan: true };   // ingen faktor = 1, inga lika faktorer, produkten ≠ 1 (TAK 20)
      return { q: fr(t1, n1) + GNG + fr(t2, n2), T: t1 * t2, N: n1 * n2, svarform: 'enklaste', mellan: true };
    },
    mm: function(lvl){   // blandad · blandad, förenkla innan beräkning
      var h1 = rI(1, 2 + lvl), b1 = proper(3 + lvl * 2), h2 = rI(1, 3 + lvl), b2 = proper(3 + lvl * 2);
      var A = h1 * b1[1] + b1[0], B = h2 * b2[1] + b2[0];
      return { q: mx(h1, b1[0], b1[1]) + GNG + mx(h2, b2[0], b2[1]), T: A * B, N: b1[1] * b2[1], svarform: 'enklaste', mellan: true };
    },
    tre: function(lvl, d){   // tre faktorer med gemensamma faktorer att förkorta
      var G = lvl < 2 ? [2, 3, 5] : [3, 5, 7];
      var g1 = rP(G), g2 = rP(G), g3 = rP(G), p = [rI(1, 3), rI(1, 3), rI(1, 3)], q = [rI(2, 4), rI(2, 4), rI(2, 4)];
      var t1 = p[0] * g1, n1 = q[0] * g2, t2 = p[1] * g2, n2 = q[1] * g3, t3 = p[2] * g3, n3 = q[2] * g1;
      if(t1 === n1 || t2 === n2 || t3 === n3 || t1 * t2 * t3 === n1 * n2 * n3) return (d || 0) < 20 ? GEN.tre(lvl, (d || 0) + 1) : { q: fr(4, 5) + GNG + fr(10, 21) + GNG + fr(7, 12), T: 280, N: 1260, svarform: 'enklaste', mellan: true };   // ingen faktor = 1, produkten ≠ 1 (TAK 20)
      return { q: fr(t1, n1) + GNG + fr(t2, n2) + GNG + fr(t3, n3), T: t1 * t2 * t3, N: n1 * n2 * n3, svarform: 'enklaste', mellan: true };
    }
  };
  var TITEL = { hb: 'Heltal gånger bråk', bb: 'Bråk gånger bråk', produkt: 'Förkorta produktbråk', huvud: 'Räkna i huvudet', hm: 'Heltal gånger blandad form', forkorta: 'Förkorta och beräkna', mm: 'Blandad form gånger blandad form', tre: 'Tre faktorer – förkorta' };
  var SUB = { hb: 'Visa ett mellanled och svara i blandad form.', bb: 'Visa mellanled och svara i enklaste form.', produkt: 'Förkorta innan du räknar – visa mellanled, svara i enklaste form.', huvud: 'Räkna i huvudet – bara svaret, i enklaste form.', hm: 'Visa mellanled och svara i enklaste form.', forkorta: 'Förkorta korsvis innan du multiplicerar – visa mellanled, svara i enklaste form.', mm: 'Gör om till oäkta bråk, förenkla innan beräkning – visa mellanled, svara i enklaste form.', tre: 'Förkorta över alla täljare och nämnare – visa mellanled, svara i enklaste form.' };

  // ── svarscellen följer svarsformen (facit): heltal → ruta, äkta → bråkcell, oäkta → blandad cell ──
  function fracInner(cls){ return '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ak8-in fr-ruta ' + cls + 't" inputmode="text" autocomplete="off"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ak8-in fr-ruta ' + cls + 'n" inputmode="text" autocomplete="off"></span></span>'; }
  function svarCell(f){
    if(f.k === 'dec') return '<span class="ak8-bc" data-r="s"><input class="ak8-in ak8-hel" inputmode="text" autocomplete="off"></span>';
    return '<span class="ak8-bc' + (f.k === 'mi' ? ' ak8-mcx' : '') + '" data-r="s">' + (f.k === 'mi' ? '<input class="ak8-in ak8-mh" inputmode="text" autocomplete="off">' : '') + fracInner('ak8-b') + '</span>';
  }
  function num(v){ return window.AK8_UI.evalArith(String(v || '').trim()); }
  function lasSvar(scope, f){
    var c = scope.querySelector('.ak8-bc[data-r="s"]');
    if(f.k === 'dec'){ var x = num(c.querySelector('.ak8-hel').value); return { hel: x, t: 0, n: 1, hasHel: isFinite(x), num: x, tom: c.querySelector('.ak8-hel').value.trim() === '' }; }
    var t = num(c.querySelector('.ak8-bt').value), n = num(c.querySelector('.ak8-bn').value), mh = c.querySelector('.ak8-mh');
    var hasHel = !!(mh && mh.value.trim() !== ''), h = hasHel ? num(mh.value) : 0;
    var tom = c.querySelector('.ak8-bt').value.trim() === '' && c.querySelector('.ak8-bn').value.trim() === '' && !hasHel;
    return { hel: h, t: t, n: n, hasHel: hasHel, num: (isFinite(t) && isFinite(n) && n !== 0 && isFinite(h)) ? h + t / n : NaN, tom: tom };
  }

  function lankaCSS(){
    ['js/motor/blad/ak8-blad-kanon.css', 'js/motor/blad/ak8-blad-ui.css'].forEach(function(href){
      if(document.querySelector('link[href="' + href + '"]')) return;
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l);
    });
  }

  window.multAk8Engine = function(variant){
    var gen = GEN[variant] || GEN.bb; variant = GEN[variant] ? variant : 'bb';
    var LR = window.Likhetsrattare, UI = window.AK8_UI, app = document.getElementById('app');
    lankaCSS();
    var hero = document.getElementById('hero'); if(hero) hero.style.display = 'none';
    var level = 1, OMG = 6, omgang = [], idx = 0, results = [];
    function nyOmgang(){ omgang = []; var seen = {}; for(var i = 0; i < OMG && omgang.length < OMG; i++){ var u = null; for(var k = 0; k < 30; k++){ u = gen(level); var key = u.q; if(!seen[key]){ seen[key] = 1; break; } } omgang.push(u); } idx = 0; results = []; }
    function summary(){
      var right = results.filter(function(x){ return x; }).length;
      var adj = window.adjustLevel(level, right, omgang.length, null, 3); level = adj.level;
      app.innerHTML = '<div class="view"><div class="exercise-card">'
        + '<div class="ex-header"><h2 class="ex-title">Klart!</h2><div class="ex-sub">Du klarade ' + right + ' av ' + omgang.length + '.</div></div>'
        + '<div class="summary"><div class="summary-big">' + right + '/' + omgang.length + '</div>'
        + '<div class="summary-txt">' + (adj.delta > 0 ? 'Bra jobbat – nästa omgång blir lite svårare.' : adj.delta < 0 ? 'Nästa omgång blir lite lättare.' : 'Fortsätt träna!') + '</div>'
        + '<div class="summary-level">Nivå ' + level + '</div></div>'
        + '<div class="ex-actions"><button class="btn primary" id="next">Ny omgång</button></div></div></div>';
      document.getElementById('next').onclick = function(){ nyOmgang(); render(); };
      if(right >= omgang.length - 1 && window.konfetti) window.konfetti();
    }
    function render(){
      if(idx >= omgang.length){ summary(); return; }
      var u = omgang[idx], f = fin(u.T, u.N), V = u.T / u.N, dots = '';
      window.__aktuellNiva = level;   // nivåbrygga: k2-evidens bär nivå (kan nå grönt i åttans karta)
      for(var i = 0; i < omgang.length; i++){ var cls = i < idx ? (results[i] ? 'right' : 'wrong') : (i === idx ? 'current' : ''); dots += '<div class="score-dot ' + cls + '"></div>'; }
      app.innerHTML = '<div class="view"><div class="exercise-card">'
        + '<div class="ex-header"><h2 class="ex-title">' + TITEL[variant] + '</h2><div class="ex-sub">' + SUB[variant] + '</div><span class="ex-level">Nivå ' + level + '</span></div>'
        + '<div class="scorebar">' + dots + '</div>'
        + '<div class="ovn-sheet" style="padding:8px 0 0;background:none;border:none;box-shadow:none;"><div class="ak8-rad ak8-rad-kedja" data-idx="0"><span class="ak8-q">' + u.q + '</span>'
        + (u.mellan ? '<span class="ovn-text ak8-eq">=</span>' + UI.ansCell('m') : '')
        + '<span class="ovn-text ak8-eq">=</span>' + svarCell(f) + '</div></div>'
        + '<div class="ex-feedback" id="fb"></div>'
        + '<div class="ex-actions"><button class="btn primary" id="check">Kontrollera</button></div>'
        + '</div></div>' + UI.keypadHTML({ builders: true, ops: ['+', '−', '·', '/', ','] });
      UI.bindSheet(app);
      var kn = document.getElementById('check');
      kn.onclick = function(){
        var rad = app.querySelector('.ak8-rad'), ok = true, besked = '';
        if(u.mellan){
          var mExpr = rad.querySelector('.ak8-cell[data-r="m"] .ak8-expr');
          var mTom = Array.prototype.every.call(mExpr.querySelectorAll('.ak8-in'), function(i){ return i.value.trim() === ''; });
          var mv = mTom ? NaN : LR.mixedEval(mExpr);
          if(mTom){ ok = false; besked = 'Visa ett mellanled före svaret.'; }
          else if(!(isFinite(mv) && Math.abs(mv - V) < 1e-9)){ ok = false; besked = 'Mellanledet är inte lika med uttrycket.'; }
          mExpr.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.add((!mTom && isFinite(mv) && Math.abs(mv - V) < 1e-9) ? 'ak8-ok' : 'ak8-fel'); });
        }
        var s = lasSvar(rad, f), svarOk;
        if(f.k === 'dec') svarOk = isFinite(s.num) && Math.abs(s.num - f.x) < 1e-9;
        else { var st = LR.finalStatus(LR.ffAv(s.hasHel ? s.hel : null, s.t, s.n), f, u.svarform); svarOk = st.status === 'ratt'; if(!svarOk && st.status === 'form' && !besked) besked = LR.besked(st.orsak); }
        if(!svarOk) ok = false;
        rad.querySelectorAll('.ak8-bc .ak8-in').forEach(function(i){ i.classList.add(svarOk ? 'ak8-ok' : 'ak8-fel'); });
        rad.querySelectorAll('.ak8-in').forEach(function(i){ i.disabled = true; });
        var fb = document.getElementById('fb'); fb.className = 'ex-feedback show ' + (ok ? 'correct' : 'wrong');
        fb.textContent = ok ? 'Rätt!' : ((besked ? besked + ' ' : '') + 'Rätt svar: ' + finText(f));
        results.push(ok);
        if(window.k2Logga) window.k2Logga(ok);
        var b = document.createElement('button'); b.className = 'btn primary'; b.textContent = (idx + 1 >= omgang.length ? 'Se resultat' : 'Nästa');
        b.onclick = function(){ idx++; render(); };
        kn.replaceWith(b);
      };
    }
    nyOmgang(); render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  window.multAk8Gen = GEN;   // rena generatorer (fuzz)
})();
