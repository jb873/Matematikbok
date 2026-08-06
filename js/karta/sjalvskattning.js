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
     formagaEvidens, // opt-in: läs evidens för belief-only-förmågorna (likhetstecknet) ur mastery.
                     //         utelämnad = ren belief-rad (sjuan, byte-identisk).
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
    // Belief-only-förmågor (ingen egen drill-nod, ingen taxonomi — bor i MODULEN så de faller ut i
    // ALLA kapitel som får sektionen). Likhetstecknet är en central kommunikationsfärdighet överallt.
    var FORMAGA_ROWS = [
      { id:'formaga:likhetstecken', namn:'Använda likhetstecknet korrekt', formaga:'KOMMUNIKATION', omrade:'genomgående' }
    ];

    // ── GRANULARITET: grov lövnod → en belief-rad per variant (ur Joachims xlsx) ──
    // Belief får vara finare än evidens. vantar:true = drillen loggar grovt till förälder-noden;
    // varianterna visar förälderns evidensfärg och är märkta "väntar" (på metod-medveten rättning
    // för egen per-variant-färg). vantar utelämnad/false = drillen loggar redan per variant (väg 1).
    var VARIANTER = {
      // PILOT — Multiplikation med bråk (k2). Drillen (ovamer-k2-mult) loggar grovt → väg 2.
      'brak-mult-rakna:rakna': { vantar:true, rader:[
        { key:'hb',       namn:'Heltal · bråktal' },
        { key:'mh',       namn:'Heltal · tal i blandad form' },
        { key:'bb',       namn:'Två bråktal' },
        { key:'mb',       namn:'Bråktal · tal i blandad form' },
        { key:'mm',       namn:'Två tal i blandad form' },
        { key:'forkorta', namn:'Förkorta innan beräkning' }
      ] },
      // Addition/subtraktion med bråk (k2). raknaEngine → k2Logga grovt → väg 2.
      'brak-add:rakna': { vantar:true, rader:[
        { key:'samma',    namn:'Samma nämnare' },
        { key:'ena',      namn:'Förläng den ena nämnaren' },
        { key:'bada',     namn:'Förläng båda nämnarna' },
        { key:'blandad',  namn:'Blandad form' },
        { key:'former',   namn:'Bråkform, decimalform och blandad form' }
      ] },
      'brak-sub:rakna': { vantar:true, rader:[
        { key:'samma',    namn:'Samma nämnare' },
        { key:'ena',      namn:'Förläng den ena nämnaren' },
        { key:'bada',     namn:'Förläng båda nämnarna' },
        { key:'blandad',  namn:'Blandad form' },
        { key:'lana',     namn:'Låna: gör om ett heltal till bråk' }
      ] },

      // ── k1 räknelagar + metod-noder (VÄG 1) ──────────────────────────────
      // vag1: egen evidensnyckel koId:key — äkta per-variant-evidens (drillen loggar
      //       per kategori via deeplinkarna i ramens OVNING_RENDERS). Ingen delad evidens.
      // vantar: väg 2 (belief finare än evidens) för kategorier utan egen loggnyckel —
      //         delar nodens grova evidens, tydligt märkt "delad evidens".
      'prio-lagar:rakna': { rader:[
        { key:'kommutativa',  namn:'Kommutativa lagen',  vag1:true },
        { key:'associativa',  namn:'Associativa lagen',  vag1:true },
        { key:'distributiva', namn:'Distributiva lagen', vag1:true }
      ] },
      'sub-metoder:metod': { rader:[
        { key:'uppstallning', namn:'Uppställning',        vag1:true },
        { key:'okaminska',    namn:'Öka och minska lika', vag1:true },
        { key:'bakifran',     namn:'Addition bakifrån',   vag1:true }
      ] },
      'div-metoder:metod': { rader:[
        { key:'kort', namn:'Kort division',                    vag1:true },
        { key:'lang', namn:'Lång division (liggande stolen)',  vag1:true }
      ] },
      // Blandning: uppställning loggar per kategori (väg 1), övriga loggar grovt (väg 2).
      'add-metoder:metod': { rader:[
        { key:'uppstallning', namn:'Uppställning',              vag1:true },
        { key:'talsorterna',  namn:'Talsorterna var för sig',  vantar:true },
        { key:'flytta-over',  namn:'Flytta över',              vantar:true }
      ] },
      'mult-metoder:metod': { rader:[
        { key:'uppstallning',   namn:'Uppställning',                    vag1:true },
        { key:'talsorterna',    namn:'Talsorterna var för sig',        vantar:true },
        { key:'dubbla',         namn:'Dubbla och halvera',             vantar:true },
        { key:'kompensation',   namn:'Kompensationsmetoden',           vantar:true },
        { key:'dubbelparentes', namn:'Multiplicera med dubbelparentes', vantar:true }
      ] }
    };
    // Väg-1-varianterna motsvarar RIKTIGA taxonomi-noder (koId:kategori) som kartan visar.
    // I självskattningen renderas de via VARIANTER (indragna, grupperade) — så hoppa över dem
    // som platta rader i raderFor, annars dubbelras (VARIANTER-rad + nodens egen rad).
    var VARIANT_AGA = {};
    Object.keys(VARIANTER).forEach(function(nid){
      var koId = nid.split(':')[0];
      VARIANTER[nid].rader.forEach(function(vr){ if(vr.vag1) VARIANT_AGA[koId + ':' + vr.key] = true; });
    });
    // Granskningsläge: seeda även väg-1-varianternas egna nycklar så den äkta per-kategori-färgen syns.
    if(DEMO){ Object.keys(VARIANTER).forEach(function(nid){
      var koId = nid.split(':')[0];
      VARIANTER[nid].rader.forEach(function(vr){
        if(!vr.vag1) return;
        var m = di++ % 4; demoEv[koId + ':' + vr.key] = [3, 0, 2, 1][m];
        if(m === 0 || m === 1) demoBel[koId + ':' + vr.key] = 'kan';
        if(m === 2) demoBel[koId + ':' + vr.key] = 'kanej';
      });
    }); }

    // Evidens för en k2-lövnod (0–3) eller en k1-delatMed-nod (ur k1-loggen).
    function evidensK2(id){ if(DEMO) return demoEv[id] != null ? demoEv[id] : 0; return MAST.masteryState((MAST.lasMatris() || {})[id], PREF.minNiva); }
    function evidensK1(id){ if(DEMO) return 3; return K1 ? K1.masteryState((K1.lasMatris() || {})[id], null) : 0; }

    // Förmåge-dimensionen: belief-only-förmågor (modulen) + alla i-scope lövnoder som bär
    // KOMMUNIKATION/PROBLEM, tvärsöver områden.
    function formageRader(){
      // config.formagaEvidens (opt-in): läs evidens för belief-only-förmågorna ur mastery
      // (t.ex. likhetstecknet, loggat av prob-rutan → MasteryK2). Utan flaggan (sjuan) = null,
      // dvs ren belief-rad → byte-identiskt. Åttan skickar den → evidensen visas bredvid.
      var rader = FORMAGA_ROWS.map(function(f){ return { id:f.id, namn:f.namn, roll:'karna', evidens: config.formagaEvidens ? evidensK2(f.id) : null, kalla:'formaga', formaga:f.formaga, omrade:f.omrade, beliefOnly: !config.formagaEvidens }; });
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
    // En grov lövnod med VARIANTER expanderas till en rad per variant (belief finare än evidens):
    // varianterna delar förälderns evidensfärg tills drillen splittras (metod-medveten rättning).
    function raderFor(omr){
      var rader = [];
      TAX.filter(function(n){ return n.niva === 'lovnod' && omradeAv(n) === omr && !arFormaga(n); }).forEach(function(n){
        if(VARIANT_AGA[n.id]) return;   // väg-1-kategorinod → renderas via VARIANTER, inte som platt rad
        var sc = scopeAv(n, PREF); if(!sc.inScope) return;
        // OBS: ingen deeplink. Självskattningen leder ALDRIG till en drill (belief ≠ evidens-väg).
        var v = VARIANTER[n.id];
        if(v){
          var koId = n.id.split(':')[0];
          var grovEv = evidensK2(n.id);   // nodens grova evidens (delas av väg-2-rader)
          v.rader.forEach(function(vr){
            var vsc = vr.roll ? scopeAv({ roll:vr.roll, arskursRelevans:n.arskursRelevans }, PREF) : sc;
            if(!vsc.inScope) return;
            if(vr.vag1){
              // Väg 1: äkta per-variant-evidens ur koId:key (deeplinken loggar per kategori). Ingen delad evidens.
              rader.push({ id:koId + ':' + vr.key, namn:vr.namn, roll:vr.roll || n.roll, evidens: evidensK2(koId + ':' + vr.key), kalla:'k2', variant:true });
            } else {
              // Väg 2: delar nodens grova evidens tills drillen loggar per variant → delad-evidens-märkt.
              rader.push({ id:n.id + '#' + vr.key, namn:vr.namn, roll:vr.roll || n.roll, evidens:grovEv, kalla:'k2', variant:true, vantar:true });
            }
          });
        } else {
          rader.push({ id:n.id, namn:(n.visning && n.visning.titel) || n.namn, roll:n.roll, evidens: evidensK2(n.id), kalla:'k2' });
        }
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
    // Väntar-rader (belief finare än evidens): evidensen är OMRÅDETS, inte variantens.
    // Ingen falsk bekräftelse — "stämmer, bevisat" hålls tills evidensen är äkta per variant.
    function statusVantar(belief, ev){
      if(belief === 'kan') return { typ:'omradesev', txt: ev >= 2 ? 'Området ser bra ut – öva just den här varianten för att bekräfta den' : 'Öva den här varianten och visa vad du kan' };
      if(belief === 'kanej' && ev >= 2) return { typ:'omradesev', txt:'Området är på gång – kanske kan du mer än du tror här' };
      return { typ:'neutral', txt:'' };
    }

    var PREF, BELIEFS;
    // En självskattningsrad: kryss (Kan/Osäker/Kan ej) + namn + evidens + status. ALDRIG en drill-länk.
    function radHtml(r, opts){
      opts = opts || {};
      var evNull = r.evidens == null;   // belief-only-förmåga: ingen drill → ingen evidens att bekräfta mot
      var b = BELIEFS[r.id] || '';
      // Evidensen döljs tills eleven tagit ställning på JUST den här raden: hon ska committa en
      // egen tro innan hon ser om den stämmer, annars blir skattningen en avskrift av kartan.
      // Regeln är per rad och drivs av belief-existens → återvändande elev ser sina tidigare
      // ställningstaganden avslöjade, men aldrig något hon inte skattat.
      var avslojad = !!b && !evNull;
      // vantar-rader: evidensen är OMRÅDETS, inte variantens → ingen falsk bekräftelse ("stämmer, bevisat" hålls tills äkta per variant)
      var st = avslojad ? (r.vantar ? statusVantar(b, r.evidens) : status(b, r.evidens)) : { typ:'neutral', txt:'' };
      var evFarg = avslojad ? FARG[r.evidens] : '#D3CDBE';
      var knappar = BELIEF.map(function(kv){ return '<button class="sj-b sj-b-' + kv[0] + (b===kv[0]?' on':'') + '" data-id="' + r.id + '" data-b="' + kv[0] + '">' + kv[1] + '</button>'; }).join('');
      var k1tag = r.kalla === 'k1' ? '<span class="sj-k1" title="hämtas ur kapitel 1 (delatMed)">k1</span>' : '';
      var fmtag = (opts.visaFormaga && r.formaga) ? '<span class="sj-fmtag">' + formageEtikett(r.formaga) + '</span>' : '';
      var omrtag = (opts.visaFormaga && r.omrade) ? '<span class="sj-omrade" title="förmågan bärs här">' + r.omrade + '</span>' : '';
      // Delad-evidens-taggen hör ihop med områdesfärgen → visas först när raden avslöjats.
      var vantag = (r.vantar && avslojad) ? '<span class="sj-vantar" title="Delar områdets evidensfärg tills drillen loggar per variant (väntar på metod-medveten rättning).">delad evidens</span>' : '';
      var dotTitel = avslojad ? (r.vantar ? 'evidens för hela området – inte just den här varianten' : 'evidens')
                              : (evNull ? 'ingen mätning – bara din skattning' : 'Skatta först – evidensen visas när du kryssat');
      var dotKlass = 'sj-dot sj-ev' + (avslojad ? '' : ' sj-ev-dold');
      return '<div class="sj-rad sj-' + st.typ + (r.variant ? ' sj-variant' : '') + (avslojad ? '' : ' sj-oskattad') + '">'
        + '<span class="sj-belief">' + knappar + '</span>'
        + '<span class="sj-namn">' + r.namn + k1tag + omrtag + fmtag + vantag + '</span>'
        + '<span class="' + dotKlass + '"' + (avslojad ? ' style="background:' + evFarg + '"' : '') + ' title="' + dotTitel + '"></span>'
        + '<span class="sj-status">' + (st.txt ? '<span class="sj-badge sj-badge-' + st.typ + '">' + st.txt + '</span>' : '') + '</span>'
        + '</div>';
    }
    // Grupprollup ur ENDAST skattade rader — annars läcker gruppricken samma evidens
    // som radprickarna döljer. null = inget skattat än → neutral platshållare.
    function rollupSkattad(rader){
      var e = rader.filter(function(r){ return BELIEFS[r.id] && r.evidens != null; }).map(function(r){ return r.evidens; });
      return e.length ? Math.min.apply(null, e) : null;
    }
    function gruppDot(rollup){
      return rollup == null ? '<span class="sj-dot sj-ev-dold" title="visas när du skattat raderna"></span>'
                            : '<span class="sj-dot" style="background:' + FARG[rollup] + '"></span>';
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
        var frollup = rollupSkattad(fr);
        html += '<section class="sj-grupp sj-formaga"><div class="sj-grupp-rubrik sj-formaga-rubrik">'
          + gruppDot(frollup)
          + '<span class="sj-grupp-namn">Kommunikation och problemlösning</span>'
          + '<span class="sj-formaga-flagga">förmågor · gäller allt du gör</span></div>'
          + '<p class="sj-formaga-intro">Det här är inget eget delkapitel — det är <em>förmågor</em> som efterfrågas i allt du gör, i alla kapitel och alla år. Vägen och kommunikationen räknas, inte bara svaret.</p>';
        fr.forEach(function(r){ html += radHtml(r, { visaFormaga:true }); });
        html += '</section>';
      }
      OMR.forEach(function(omr){
        var rader = raderFor(omr);
        if(!rader.length) return;
        var rollup = rollupSkattad(rader);
        var stjarna = omr.roll === 'fordjupning' ? ' <span class="sj-stjarna" title="fördjupning">★</span>' : '';
        html += '<section class="sj-grupp"><div class="sj-grupp-rubrik">'
          + gruppDot(rollup) + '<span class="sj-grupp-namn">' + omr.namn + stjarna + '</span></div>';
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
