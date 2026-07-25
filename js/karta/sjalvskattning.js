/* sjalvskattning.js — självskattning mot taxonomin (window.Sjalvskattning).
   Belief (elevens omdöme) MÖTER evidens (mastery-färg). Bekräftelse = de sammanfaller;
   glapp åt båda håll lyfts fram. Raderna kommer UR taxonomin, aldrig en handhållen lista.

   ── INTEGRITETSGRÄNS: belief och evidens läses/skrivs bara till localStorage.
      Ingen fetch/XHR/WebSocket/sendBeacon. All elevdata bor lokalt. ──

   config = {
     taxonomi,     // window.K2_TAXONOMI
     mastery,      // kapitlets egen: { lasMatris(), masteryState(log,minNiva) }
     k1mastery,    // window.Mastery — för delatMed-rader (k1-noder färgas ur k1-loggen)
     beliefKey,    // 'k2.brak.belief.v1'
     prefKey,      // delad med kartan (bara mal läses)
     arskurs, malDefault, minNiva,
     ramPath,      // deeplink-bas för öva-länkar
     mountId       // container-id
   } */
(function(){
  'use strict';
  window.Sjalvskattning = { montera: montera };

  var FARG = { 0:'#D14A40', 1:'#E08529', 2:'#E4BC34', 3:'#6BA544' };
  var BELIEF = [ ['kan','Kan'], ['osaker','Osäker'], ['kanej','Kan ej'] ];

  function montera(config){
    var TAX = (config.taxonomi && config.taxonomi.noder) || config.taxonomi || [];
    var MAST = config.mastery, K1 = config.k1mastery;
    var byId = {}; TAX.forEach(function(n){ byId[n.id] = n; });
    var mount = document.getElementById(config.mountId);

    function lasPref(){
      var d = { arskurs: config.arskurs, mal: config.malDefault || 'godkant', minNiva: config.minNiva || null };
      try{ var s = JSON.parse(localStorage.getItem(config.prefKey)) || {}; if(s.mal) d.mal = s.mal; }catch(e){}
      try{ var q = new URLSearchParams(location.search).get('mal'); if(q === 'allt' || q === 'godkant') d.mal = q; }catch(e){}  // förhandsvisa scope
      return d;
    }
    function lasBelief(){ var stored; try{ stored = JSON.parse(localStorage.getItem(config.beliefKey)) || {}; }catch(e){ stored = {}; }
      return DEMO ? Object.assign({}, demoBel, stored) : stored; }
    function sparBelief(b){ try{ localStorage.setItem(config.beliefKey, JSON.stringify(b)); }catch(e){} }

    // ── Granskningsläge (?demo): seedar evidens + några belief så bekräftelse och
    //    båda glapp-fallen syns direkt. Skrivs ALDRIG till localStorage. ──
    var DEMO = /[?&]demo\b/.test(location.search), demoEv = {}, demoBel = {};
    if(DEMO){ var di = 0; TAX.filter(function(n){ return n.niva === 'lovnod'; }).forEach(function(n){
      var m = di++ % 4; demoEv[n.id] = [3, 0, 2, 1][m];
      if(m === 0) demoBel[n.id] = 'kan';   // grön + Kan → bekräftat
      if(m === 1) demoBel[n.id] = 'kan';   // röd + Kan → glapp (pluggplan)
      if(m === 2) demoBel[n.id] = 'kanej'; // gul/grön + Kan ej → bättre än du tror
    }); }

    function scopeAv(node, pref){
      var ark = node.arskursRelevans || {};
      if(!(pref.arskurs in ark)) return { inScope:false };
      if(ark[pref.arskurs] === 'stod') return { inScope:true, stod:true };
      if(pref.mal === 'godkant' && node.roll && node.roll !== 'karna') return { inScope:false, valdeBort:true };
      return { inScope:true };
    }
    function omradeAv(node){ var n = node; while(n && n.niva !== 'omrade'){ n = byId[n.parent]; } return n; }
    // Tvärgående förmågor (Joachims kärnbudskap): KOMMUNIKATION + PROBLEM återkommer i ALLT,
    // alla kapitel, alla år. De ska INTE begravas som en rad i en grupp — de lyfts ut till en
    // egen förmåge-dimension. Här markeras vilka noder som bär dem.
    var FORMAGE_DIM = { KOMMUNIKATION:1, PROBLEM:1 };
    function arFormaga(n){ return !!FORMAGE_DIM[n.formaga]; }
    function formageEtikett(f){ return f === 'KOMMUNIKATION' ? 'kommunikation' : 'problemlösning'; }

    // Evidens för en k2-lövnod (0–3) eller en k1-delatMed-nod (ur k1-loggen).
    function evidensK2(id){ if(DEMO) return demoEv[id] != null ? demoEv[id] : 0; return MAST.masteryState((MAST.lasMatris() || {})[id], PREF.minNiva); }
    function evidensK1(id){ if(DEMO) return 3; return K1 ? K1.masteryState((K1.lasMatris() || {})[id], null) : 0; }

    // Förmåge-dimensionen: alla i-scope lövnoder som bär KOMMUNIKATION/PROBLEM, tvärsöver områden.
    function formageRader(){
      var rader = [];
      TAX.filter(function(n){ return n.niva === 'lovnod' && arFormaga(n); }).forEach(function(n){
        var sc = scopeAv(n, PREF); if(!sc.inScope) return;
        var omr = omradeAv(n);
        rader.push({ id:n.id, namn:(n.visning && n.visning.titel) || n.namn, roll:n.roll, evidens: evidensK2(n.id), kalla:'k2',
          formaga:n.formaga, omrade: omr ? omr.namn : '' });
      });
      return rader;
    }

    // Rader per område: k2-lövnoder (i scope) + ev. delatMed-rader (k1-noder).
    // Förmåge-noderna (KOMMUNIKATION/PROBLEM) exkluderas här — de bor i förmåge-dimensionen.
    function raderFor(omr){
      var rader = [];
      TAX.filter(function(n){ return n.niva === 'lovnod' && omradeAv(n) === omr && !arFormaga(n); }).forEach(function(n){
        var sc = scopeAv(n, PREF); if(!sc.inScope) return;
        // OBS: ingen deeplink. Självskattningen leder ALDRIG till en drill (belief ≠ evidens-väg).
        rader.push({ id:n.id, namn:(n.visning && n.visning.titel) || n.namn, roll:n.roll, evidens: evidensK2(n.id), kalla:'k2' });
      });
      if(omr.delatMed && omr.delatMed.noder){
        omr.delatMed.noder.forEach(function(k1id){
          rader.push({ id:k1id, namn: k1Namn(k1id), roll:'karna', evidens: evidensK1(k1id), kalla:'k1' });
        });
      }
      return rader;
    }
    function k1Namn(id){   // riktigt namn ur k1-taxonomin om laddad, annars enkel etikett
      var t = window.K1_TAXONOMI && window.K1_TAXONOMI.noder;
      if(t){ for(var i = 0; i < t.length; i++){ if(t[i].id === id) return (t[i].visning && t[i].visning.titel) || t[i].namn; } }
      return id.replace(/:.*/, '').replace(/-/g, ' ');
    }

    // Bekräftelse / glapp av belief × evidens.
    function status(belief, ev){
      if(belief === 'kan' && ev === 3) return { typ:'bekraftat', txt:'Stämmer – bevisat över tid' };
      if(belief === 'kan' && ev < 3)  return { typ:'glapp-plan', txt: ev===0 ? 'Du säger Kan men inget är bevisat ännu – öva och visa det' : 'På väg – fortsätt öva tills det sitter' };
      if(belief === 'kanej' && ev === 3) return { typ:'glapp-battre', txt:'Bättre än du tror – evidensen är grön' };
      if(belief === 'kanej' && ev >= 1)  return { typ:'glapp-battre', txt:'Du har redan börjat visa det här' };
      return { typ:'neutral', txt:'' };
    }

    var PREF, BELIEFS;
    // En självskattningsrad: kryss (Kan/Osäker/Kan ej) + namn + evidens + status. ALDRIG en drill-länk.
    function radHtml(r, opts){
      opts = opts || {};
      var b = BELIEFS[r.id] || '', st = status(b, r.evidens);
      var knappar = BELIEF.map(function(kv){ return '<button class="sj-b sj-b-' + kv[0] + (b===kv[0]?' on':'') + '" data-id="' + r.id + '" data-b="' + kv[0] + '">' + kv[1] + '</button>'; }).join('');
      var k1tag = r.kalla === 'k1' ? '<span class="sj-k1" title="hämtas ur kapitel 1 (delatMed)">k1</span>' : '';
      var fmtag = (opts.visaFormaga && r.formaga) ? '<span class="sj-fmtag">' + formageEtikett(r.formaga) + '</span>' : '';
      var omrtag = (opts.visaFormaga && r.omrade) ? '<span class="sj-omrade" title="förmågan bärs här">' + r.omrade + '</span>' : '';
      return '<div class="sj-rad sj-' + st.typ + '">'
        + '<span class="sj-belief">' + knappar + '</span>'
        + '<span class="sj-namn">' + r.namn + k1tag + omrtag + fmtag + '</span>'
        + '<span class="sj-dot sj-ev" style="background:' + FARG[r.evidens] + '" title="evidens"></span>'
        + '<span class="sj-status">' + (st.txt ? '<span class="sj-badge sj-badge-' + st.typ + '">' + st.txt + '</span>' : '') + '</span>'
        + '</div>';
    }
    function render(){
      PREF = lasPref(); BELIEFS = lasBelief();
      var OMR = TAX.filter(function(n){ return n.niva === 'omrade' && n.implemented; });
      var html = '<div class="sj-topp"><span class="sj-visa-lbl">Visa:</span>'
        + '<span class="sj-seg" id="sj-seg"><button data-mal="godkant"' + (PREF.mal==='godkant'?' class="on"':'') + '>Godkänt (kärna)</button>'
        + '<button data-mal="allt"' + (PREF.mal==='allt'?' class="on"':'') + '>Allt</button></span></div>';
      // TVÄRGÅENDE FÖRMÅGE-DIMENSION — Joachims kärnbudskap: vägen och kommunikationen räknas, inte bara svaret.
      var fr = formageRader();
      if(fr.length){
        var frollup = Math.min.apply(null, fr.map(function(r){ return r.evidens; }));
        html += '<section class="sj-grupp sj-formaga"><div class="sj-grupp-rubrik sj-formaga-rubrik">'
          + '<span class="sj-dot" style="background:' + FARG[frollup] + '"></span>'
          + '<span class="sj-grupp-namn">Kommunikation och problemlösning</span>'
          + '<span class="sj-formaga-flagga">förmågor · gäller allt du gör</span></div>'
          + '<p class="sj-formaga-intro">Det här är inget eget delkapitel — det är <em>förmågor</em> som efterfrågas i allt du gör, i alla kapitel och alla år. Vägen och kommunikationen räknas, inte bara svaret.</p>';
        fr.forEach(function(r){ html += radHtml(r, { visaFormaga:true }); });
        html += '</section>';
      }
      OMR.forEach(function(omr){
        var rader = raderFor(omr);
        if(!rader.length) return;
        var rollup = Math.min.apply(null, rader.map(function(r){ return r.evidens; }));
        var stjarna = omr.roll === 'fordjupning' ? ' <span class="sj-stjarna" title="fördjupning">★</span>' : '';
        html += '<section class="sj-grupp"><div class="sj-grupp-rubrik">'
          + '<span class="sj-dot" style="background:' + FARG[rollup] + '"></span><span class="sj-grupp-namn">' + omr.namn + stjarna + '</span></div>';
        rader.forEach(function(r){ html += radHtml(r, {}); });
        html += '</section>';
      });
      html += '<p class="sj-integritet" id="sj-integritet"></p>';
      mount.innerHTML = html;
      // wiring
      mount.querySelectorAll('#sj-seg button').forEach(function(btn){ btn.onclick = function(){
        var p = lasPref(); p.mal = btn.dataset.mal; try{ localStorage.setItem(config.prefKey, JSON.stringify({ mal:p.mal })); }catch(e){} render();
      }; });
      mount.querySelectorAll('.sj-b').forEach(function(btn){ btn.onclick = function(){
        var b = lasBelief(); if(b[btn.dataset.id] === btn.dataset.b) delete b[btn.dataset.id]; else b[btn.dataset.id] = btn.dataset.b; sparBelief(b); render();
      }; });
      var integ = document.getElementById('sj-integritet');
      if(integ) integ.textContent = 'Din självskattning sparas bara på den här enheten (localStorage) och skickas aldrig någonstans.';
    }
    render();
    return { render: render };
  }
})();
