/* karta-motor.js — parametriserad begreppskarta (window.KartaMotor).
   Utbruten BYTE-TROGET ur ak7/k1/karta (logiken oförändrad). En källa: k1 åk7,
   k1 åk8 och k2 är samma kod med olika config (taxonomi + mastery-nyckel in).

   ── INTEGRITETSGRÄNS: läser bara localStorage via config.mastery. Ingen fetch/
      XHR/WebSocket/sendBeacon. All elevdata bor lokalt. ──

   config = {
     taxonomi,      // window.K1_TAXONOMI | window.K2_TAXONOMI  ({noder:[…]} eller array)
     mastery,       // { lasMatris(), masteryState(log, minNiva), MATRIS_KEY }
     prefKey,       // localStorage-nyckel för pref (bara mal persistas; arskurs låst)
     arskurs,       // 'ak7' | 'ak8'  (fast)
     malDefault,    // 'godkant' (default)
     minNiva,       // null | 3   (nivåbryggan; masteryState får den)
     ramPath,       // deeplink-bas, t.ex. '../../../ak7-k2-ram.html'
     rotNamn,       // rotnodens namn, t.ex. 'Bråk'
     orsakFramtid   // grå-orsakstext för framtida årskurs, t.ex. 'åk 8'
   }
   Skalet tillhandahåller DOM: #cols #meter #mal-seg #scope-note #privacy. */
(function(){
  'use strict';
  window.KartaMotor = { montera: montera };

  function montera(config){
    var TAX = (config.taxonomi && config.taxonomi.noder) || config.taxonomi || [];
    var MAST = config.mastery;
    var RAM = config.ramPath;
    var byId = {}; TAX.forEach(function(n){ byId[n.id] = n; });
    function barnAv(id){ return TAX.filter(function(n){ return n.parent === id && !n.doljKarta; }); }
    var OMRADEN = TAX.filter(function(n){ return n.niva === 'omrade' && n.implemented; });

    // ── ELEV-LOKAL DATA · localStorage ENDAST. Lämnar ALDRIG enheten. ──
    function lasMatris(){
      if(/[?&]demo\b/.test(location.search)) return demoMatris();
      return MAST.lasMatris() || {};
    }
    function lasPref(){
      var d = { arskurs: config.arskurs, mal: config.malDefault || 'godkant', minNiva: config.minNiva || null };
      try{ var s = JSON.parse(localStorage.getItem(config.prefKey)) || {}; if(s.mal) d.mal = s.mal; }catch(e){}  // bara mal; arskurs låst
      return d;
    }
    function sparPref(p){ try{ localStorage.setItem(config.prefKey, JSON.stringify({ mal: p.mal })); }catch(e){} }
    function demoMatris(){
      var m = {}, nu = Date.now(), D = 86400000;
      var monster = [ {n:6, spann:30}, {n:3, spann:5}, {n:1, spann:0}, {n:0, spann:0} ];
      var i = 0;
      TAX.filter(function(n){ return n.niva === 'lovnod' && n.generator && !n.doljKarta; }).forEach(function(n){
        var p = monster[i++ % monster.length], log = [];
        for(var k = 0; k < p.n; k++){
          var dagarSedan = p.n > 1 ? p.spann * (p.n - 1 - k) / (p.n - 1) : 0;
          log.push({ ts: nu - Math.round(dagarSedan * D), resultat: 'ratt' });
        }
        if(log.length) m[n.id] = log;
      });
      return m;
    }

    // ── SCOPING: arskursRelevans + roll × elevens kontext ──
    function scopeAv(node, pref){
      var ark = node.arskursRelevans || {};
      if(!(pref.arskurs in ark)) return { inScope:false, orsak:'framtid' };
      if(ark[pref.arskurs] === 'stod') return { inScope:true, stod:true };
      if(pref.mal === 'godkant' && node.roll && node.roll !== 'karna') return { inScope:false, orsak:'valde-bort' };
      return { inScope:true };
    }

    // ── FÄRG: lövnod ur matris, förälder = svagaste i-scope barn (rollup) ──
    var FARG = {
      0:{bg:'#D14A40',br:'#AE3229',fg:'#fff'},
      1:{bg:'#E08529',br:'#BE6A16',fg:'#fff'},
      2:{bg:'#E4BC34',br:'#C29A1C',fg:'#4A3A08'},
      3:{bg:'#6BA544',br:'#4E7D30',fg:'#fff'}
    };
    var GRA = { bg:'#EAE6DA', br:'#D3CDBE', fg:'#8A857A' };
    function nodStatus(node, pref, matris){
      if(node.niva === 'lovnod'){
        var sc = scopeAv(node, pref);
        if(!sc.inScope) return { gra:true, orsak:sc.orsak };
        return { state: MAST.masteryState(matris[node.id], pref.minNiva), stod: !!sc.stod };
      }
      var scoped = barnAv(node.id).map(function(b){ return nodStatus(b, pref, matris); }).filter(function(c){ return !c.gra && !c.stod; });
      if(!scoped.length) return { gra:true, orsak:'framtid' };
      return { state: Math.min.apply(null, scoped.map(function(c){ return c.state; })) };
    }
    function rotStatus(pref, matris){
      var scoped = OMRADEN.map(function(o){ return nodStatus(o, pref, matris); }).filter(function(c){ return !c.gra; });
      if(!scoped.length) return { gra:true, orsak:'framtid' };
      return { state: Math.min.apply(null, scoped.map(function(c){ return c.state; })) };
    }

    // ── DEEPLINK till drillen (rör ej drillen — bara länkar in) ──
    function deeplink(node){
      var ko, formaga, p = node.id.split(':');
      if(p.length === 2){ ko = p[0]; formaga = p[1]; }
      else if(node.visning && node.visning.formagaKey){ ko = node.parent; formaga = node.visning.formagaKey; }
      else { ko = node.parent; formaga = 'rakna'; }
      return RAM + '?ko=' + encodeURIComponent(ko) + '&formaga=' + encodeURIComponent(formaga);
    }

    // ── RENDER ──
    var val = { omrade:null, deldoman:null };
    function nodBox(node, opts){
      opts = opts || {};
      var status = opts.rootStatus || nodStatus(node, PREF, MATRIS);
      var farg = status.gra ? GRA : FARG[status.state];
      var lankbar = node.niva === 'lovnod' && !status.gra && !!node.generator;   // concept-noder (utan generator) länkas ej
      var b = document.createElement(lankbar ? 'a' : 'div');
      b.className = 'node' + (opts.root ? ' root' : '') + (status.gra ? ' gra' : '') + (opts.sel ? ' sel' : '')
        + (node.niva === 'lovnod' && !status.gra && !node.generator ? ' nolink' : '');
      b.style.background = farg.bg; b.style.borderColor = farg.br; b.style.color = farg.fg;
      var rollM = node.roll === 'breddning' ? '＋' : node.roll === 'fordjupning' ? '★' : '';
      var stodM = (node.arskursRelevans && node.arskursRelevans[PREF.arskurs] === 'stod') ? 'stöd' : '';
      var markM = stodM || rollM;
      var markTitle = stodM ? 'stöd – valbart stödspår' : node.roll;
      var orsak = status.gra ? '<span class="gra-orsak">' + (status.orsak === 'framtid' ? (config.orsakFramtid || 'framtid') : 'bortvalt') + '</span>' : '';
      var chev = (opts.hasChildren && !status.gra) ? '<span class="chev">›</span>' : '';
      b.innerHTML = '<span class="txt">' + node.namn + orsak + '</span>'
        + (markM && !status.gra ? '<span class="roll' + (stodM ? ' stod' : '') + '" title="' + markTitle + '">' + markM + '</span>' : '') + chev;
      if(lankbar){
        b.href = deeplink(node); b.style.textDecoration = 'none';
      } else if(!status.gra && opts.onClick){
        b.addEventListener('click', opts.onClick);
      }
      return b;
    }
    function kolumn(rubrik){
      var c = document.createElement('div'); c.className = 'col';
      if(rubrik){ var r = document.createElement('div'); r.className = 'col-rubrik'; r.textContent = rubrik; c.appendChild(r); }
      return c;
    }
    function render(){
      var cols = document.getElementById('cols'); cols.innerHTML = '';
      var c1 = kolumn('Område');
      c1.appendChild(nodBox({ niva:'rot', namn: config.rotNamn || 'Karta' }, { root:true, rootStatus:rotStatus(PREF, MATRIS) }));
      cols.appendChild(c1);
      var c2 = kolumn('Deldomäner');
      OMRADEN.forEach(function(o){
        c2.appendChild(nodBox(o, { hasChildren:true, sel: val.omrade === o.id, onClick:function(){ val.omrade = o.id; val.deldoman = null; render(); } }));
      });
      cols.appendChild(c2);
      if(val.omrade){
        var c3 = kolumn('Färdighetsområden');
        barnAv(val.omrade).forEach(function(d){
          c3.appendChild(nodBox(d, { hasChildren:true, sel: val.deldoman === d.id, onClick:function(){ val.deldoman = d.id; render(); } }));
        });
        cols.appendChild(c3);
      }
      if(val.deldoman){
        var c4 = kolumn('Färdigheter');
        barnAv(val.deldoman).forEach(function(l){ c4.appendChild(nodBox(l, {})); });
        cols.appendChild(c4);
      }
      renderMeter();
      renderControls();
    }
    function renderMeter(){
      var lov = TAX.filter(function(n){ var sc = scopeAv(n, PREF); return n.niva === 'lovnod' && n.generator && !n.doljKarta && sc.inScope && !sc.stod; });
      var Y = lov.length;
      var X = lov.filter(function(n){ return MAST.masteryState(MATRIS[n.id], PREF.minNiva) === 3; }).length;
      var pct = Y ? Math.round(X / Y * 100) : 0;
      var el = document.getElementById('meter'); if(!el) return;
      el.innerHTML =
        '<div class="meter-tal">' + X + ' <small>av ' + Y + ' färdigheter befästa</small></div>'
        + '<div class="meter-bar"><div class="meter-fill" style="width:' + pct + '%"></div></div>'
        + '<div class="meter-txt">' + pct + '%</div>';
    }
    function renderControls(){
      document.querySelectorAll('#mal-seg button').forEach(function(btn){ btn.classList.toggle('on', btn.dataset.mal === PREF.mal); });
      var valbara = TAX.filter(function(n){ return n.niva === 'lovnod' && n.roll && n.roll !== 'karna'; }).length;
      var note = document.getElementById('scope-note'); if(!note) return;
      note.textContent = PREF.mal === 'godkant'
        ? valbara + ' valbara färdigheter (breddning/fördjupning) är bortvalda — kärnan räcker för godkänt.'
        : 'Alla färdigheter visas, även breddning och fördjupning.';
    }

    // ── init ──
    var PREF = lasPref();
    var MATRIS = lasMatris();
    try{ var q = new URLSearchParams(location.search);
      if(q.get('omrade') && byId[q.get('omrade')]) val.omrade = q.get('omrade');
      if(q.get('deldoman') && byId[q.get('deldoman')]) val.deldoman = q.get('deldoman');
      if(q.get('mal') === 'allt' || q.get('mal') === 'godkant') PREF.mal = q.get('mal');
    }catch(e){}
    document.querySelectorAll('#mal-seg button').forEach(function(btn){
      btn.addEventListener('click', function(){ PREF.mal = btn.dataset.mal; sparPref(PREF); render(); });
    });
    var priv = document.getElementById('privacy');
    if(priv) priv.textContent = 'Din progress sparas bara på den här enheten (localStorage) och skickas aldrig någonstans. Kartan hämtar inget från nätet utom typsnitten.';
    render();
    return { render: render };
  }
})();
