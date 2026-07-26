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
          log.push({ ts: nu - Math.round(dagarSedan * D), resultat: 'ratt', niva: 3 });   // niva:3 → demo funkar även med minNiva:3 (åk8)
        }
        if(log.length) m[n.id] = log;
      });
      return m;
    }

    // ── SCOPING: arskursRelevans + roll × elevens kontext ──
    // Grått reserveras för GENUIN framtid (nodens tidigaste relevanta år ligger EFTER elevens)
    // och för lärar-bortvalt (breddning/fördjupning i godkänt). Elevens år ELLER förflutet
    // (repetition från tidigare år) bär sin mastery-färg. Färg-beräkningen är oförändrad —
    // detta styr bara om noden visas i färg eller grått.
    var AR_ORDN = { ak7:7, ak8:8, ak9:9 };
    function scopeAv(node, pref){
      var ark = node.arskursRelevans || {};
      var nu = AR_ORDN[pref.arskurs] || 0;
      var keys = Object.keys(ark);
      if(!keys.length) return { inScope:false, orsak:'framtid' };
      var minAr = Math.min.apply(null, keys.map(function(k){ return AR_ORDN[k] || 99; }));
      if(minAr > nu) return { inScope:false, orsak:'framtid' };   // bara senare år → genuin framtid
      // Roll-avläsning för det relevanta året: elevens år om noden finns där, annars närmaste förflutna.
      var relAr = (pref.arskurs in ark) ? pref.arskurs
        : keys.filter(function(k){ return (AR_ORDN[k] || 99) <= nu; }).sort(function(a, b){ return AR_ORDN[b] - AR_ORDN[a]; })[0];
      if(ark[relAr] === 'stod') return { inScope:true, stod:true };
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
        return { state: MAST.masteryState(matris[node.id], pref.minNiva, BLEKNING, !!LARD[node.id]), stod: !!sc.stod };
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

    // ── RENDER (vågrätt tankekartsträd: rot vänster → växer höger, hela trädet synligt) ──
    // Bara presentation. nodBox ritar EN nod; nodTree bygger [box][barn-kolumn] rekursivt.
    function nodBox(node, opts){
      opts = opts || {};
      var status = opts.rootStatus || nodStatus(node, PREF, MATRIS);
      var farg = status.gra ? GRA : FARG[status.state];
      var lankbar = node.niva === 'lovnod' && !status.gra && !!node.generator;   // concept-noder (utan generator) länkas ej
      var b = document.createElement(lankbar ? 'a' : 'div');
      b.className = 'node' + (opts.root ? ' root' : '') + (status.gra ? ' gra' : '')
        + (node.niva === 'lovnod' && !status.gra && !node.generator ? ' nolink' : '');
      b.style.background = farg.bg; b.style.borderColor = farg.br; b.style.color = farg.fg;
      var rollM = node.roll === 'breddning' ? '＋' : node.roll === 'fordjupning' ? '★' : '';
      var stodM = (node.arskursRelevans && node.arskursRelevans[PREF.arskurs] === 'stod') ? 'stöd' : '';
      var markM = stodM || rollM;
      var markTitle = stodM ? 'stöd – valbart stödspår' : node.roll;
      var orsak = status.gra ? '<span class="gra-orsak">' + (status.orsak === 'framtid' ? (config.orsakFramtid || 'framtid') : 'bortvalt') + '</span>' : '';
      // Kart-etikett: kortare kartLabel om taxonomin bär en, annars nodens fulla namn
      // (självskattningens namn rörs inte). Tvåradsbrytning sköts av css:en, inte av kapning.
      var label = node.kartLabel || node.namn;
      b.innerHTML = '<span class="txt">' + label + orsak + '</span>'
        + (markM && !status.gra ? '<span class="roll' + (stodM ? ' stod' : '') + '" title="' + markTitle + '">' + markM + '</span>' : '');
      if(lankbar){ b.href = deeplink(node); b.style.textDecoration = 'none'; }
      return b;
    }
    // Rekursiv gren: [nodens ruta][kolumn med barn-grenar]. Rot = syntetisk vänsternod.
    function nodTree(node, isRoot){
      var wrap = document.createElement('div'); wrap.className = 'km-node';
      wrap.appendChild(nodBox(node, isRoot ? { rootStatus: rotStatus(PREF, MATRIS), root:true } : {}));
      var barn = isRoot ? OMRADEN : barnAv(node.id);
      // Godkänt fäller ihop de grå grenarna (bortvalt + framtid) → kortare default-vy;
      // Allt visar hela trädet inkl. grå. Rör bara synligheten — rollup/scoping oförändrat.
      if(PREF.mal === 'godkant'){ barn = barn.filter(function(c){ return !nodStatus(c, PREF, MATRIS).gra; }); }
      if(barn.length){
        var kids = document.createElement('div'); kids.className = 'km-kids';
        barn.forEach(function(c){ kids.appendChild(nodTree(c, false)); });
        wrap.appendChild(kids);
      }
      return wrap;
    }
    function render(){
      var cols = document.getElementById('cols'); cols.innerHTML = '';
      var tree = document.createElement('div'); tree.className = 'km-tree';
      tree.appendChild(nodTree({ id:null, niva:'rot', namn: config.rotNamn || 'Karta' }, true));
      cols.appendChild(tree);
      renderMeter();
      renderControls();
    }
    function renderMeter(){
      var lov = TAX.filter(function(n){ var sc = scopeAv(n, PREF); return n.niva === 'lovnod' && n.generator && !n.doljKarta && sc.inScope && !sc.stod; });
      var Y = lov.length;
      var X = lov.filter(function(n){ return MAST.masteryState(MATRIS[n.id], PREF.minNiva, BLEKNING, !!LARD[n.id]) === 3; }).length;
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
    // Glömskekurvan: bara åk8-kartan (config.blekning) blekner. ?blekveckor=N är en test-hook
    // som skjuter blekklockan framåt N veckor (simulerar inaktivitet headless) — 0 i drift.
    var BLEKNING = config.blekning ? { aktiv:true, nu: Date.now() } : null;
    // Persistent har-varit-lärd-flagga per nod (golv-regeln) — läses EN gång, bara när blekning är på.
    var LARD = (config.blekning && MAST.lasLard) ? MAST.lasLard() : {};
    try{ if(BLEKNING){ var bw = parseFloat(new URLSearchParams(location.search).get('blekveckor')); if(bw > 0) BLEKNING.nu += bw * 7 * 86400000; } }catch(e){}
    try{ var q = new URLSearchParams(location.search);
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
