/* k3-mastery-wiring.js — DEEPLINK-ROUTER + OBSERVERANDE loggning för kapitel 3 (algebra).
   ADDITIV: ingen rad ändras i ovamer-k3.js eller ekvationer-balans.js. Laddas SIST (efter
   ovamer-k3.js + mastery-k3.js) så engines + MasteryK3 finns. Två jobb:

   1. ROUTER: ?ko=&formaga= → oppnaGrupp(omr,grupp) — samma dispatch som översiktens knappar
      (ak7-k3-ram.html:422-425). En rad i DEEPLINK = en wirad generator.

   2. LOGGNING (den svåra delen): ovamer-k3-motorerna har INGEN delad scorebar-funktion och
      anropar INTE getTutorScore (verifierat), så MasteryK3-Proxyn fångar dem inte. Men varje
      engine sätter #fb.ex-feedback → .correct/.wrong EXAKT en gång per försök (ovamer-k3.js:
      134/338/541/814). Vi OBSERVERAR den DOM-signalen (MutationObserver på #app) och loggar per
      försök till MasteryK3 för URL:ens nod. Ingen motorrad ändras — samma observerande princip
      som mastery.js-Proxyn (motorn vet inte att den avlyssnas). Jämför-funktionerna kunde INTE
      användas: de anropas N× per försök i mellanled-engines → skulle överräkna. #fb är den enda
      rena per-försök-signalen.

      Loggar BARA i deeplink-läge för en WIRAD nod (utan nod vet vi inte vilken färdighet
      försöket hör till → kartan skulle ljuga). GDPR: bara MasteryK3 (localStorage), inget nät. */
(function(){
  'use strict';
  // Nod → [område, grupp]. En rad = en wirad generator (belägg: oppnaGrupp, ak7-k3-ram.html).
  var DEEPLINK = {
    'alg-tolka:begrepp':         ['uttryck', 'tolka'],     // tolkaEngine    (ovamer-k3.js:66)
    'alg-skriva:kommunikation':  ['uttryck', 'skriva'],    // skrivaEngine   (ovamer-k3.js:723)
    'alg-berakna:rakna':         ['uttryck', 'berakna'],   // beraknaEngine  (ovamer-k3.js:258)
    'alg-samla:rakna':           ['uttryck', 'forenkla']   // forenklaEngine (ovamer-k3.js:462) — Del3-sidan saknas, wirad mot ramen
  };

  function aktuellNod(){
    try { var q = new URLSearchParams(location.search), ko = q.get('ko'), f = q.get('formaga');
      return (ko && f) ? ko + ':' + f : null; } catch(e){ return null; }
  }
  var nod = aktuellNod();

  // ── 1. Router ──
  function route(){
    if(nod && DEEPLINK[nod] && typeof oppnaGrupp === 'function'){ oppnaGrupp(DEEPLINK[nod][0], DEEPLINK[nod][1]); }
    else if(nod && typeof renderOversikt === 'function'){ renderOversikt(); }   // okänd deeplink → översikt
    // ingen deeplink: ramen renderade redan översikten (ak7-k3-ram.html:450)
  }

  // ── 2. Observerande loggning (bara för en wirad nod) ──
  var loggaAktiv = !!(nod && DEEPLINK[nod] && window.MasteryK3);
  var loggade = (typeof WeakSet === 'function') ? new WeakSet() : null;   // en #fb loggas en gång
  function hantera(fb){
    if(!loggaAktiv || !fb || !fb.classList || !fb.classList.contains('ex-feedback')) return;
    var ratt = fb.classList.contains('correct'), fel = fb.classList.contains('wrong');
    if(!ratt && !fel) return;
    if(loggade){ if(loggade.has(fb)) return; loggade.add(fb); }
    window.MasteryK3.loggaForsok(nod, ratt ? 'ratt' : 'fel');
  }
  function startObs(){
    var root = document.getElementById('app') || document.body;
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        if(m.type === 'attributes'){ hantera(m.target); }
        else if(m.addedNodes){ [].forEach.call(m.addedNodes, function(n){
          if(n.nodeType !== 1) return;
          if(n.classList && n.classList.contains('ex-feedback')) hantera(n);
          if(n.querySelectorAll){ [].forEach.call(n.querySelectorAll('.ex-feedback'), hantera); }
        }); }
      });
    }).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  }

  function boot(){ startObs(); route(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
