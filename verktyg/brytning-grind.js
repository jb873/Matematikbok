/* brytning-grind.js — GRINDEN mot K-D, K-E och K-F (KONVENTIONER.md §3).
   ────────────────────────────────────────────────────────────────────────────────────────────────
   Tre layoutregler på uppgiftsytan, alla mätta i riktig webbläsare, en flik i taget:

     K-D  Breda mellanled bryts STRUKTURERAT. En rad får aldrig sluta med ett ensamt "=" — tecknet
          hör till ledet efter det, och en rad som slutar med det lämnar rutan inklämd på nästa rad.
          Mätt: radens barn delas i visuella linjer efter sin top; sista elementet på en linje som
          följs av fler linjer får inte vara ett ensamt likhetstecken.

     K-E  Korta svar får KORTA rutor som växer. En ruta med fast bred start (.bred) vars facit ryms
          i den smala rutans golv är ett brott — det är breda rutor från start som ger K-D:s fula
          brytningar. Golvet mäts på en egen ruta i layouten, inte som en konstant.

     K-F  Streck mellan HUVUDUPPGIFTER, inte mellan deluppgifter. Ingen rad får ha en synlig linje
          under sig; varje grupp utom den första ska ha en linje ovanför sig som SYNS — kontrasten
          mot arkets botten mäts, med alfa inräknad, och måste nå 2,0. De gamla deluppgiftsstrecken
          låg på 1,16 och var osynliga; en regel som bara kräver "en linje" hade godkänt dem.

     K-J  Deluppgiftsbokstaven hör till bokens typografi: samma familj som radens text, minst 60 %
          av dess storlek och nära den i ljushet. Mäts RELATIVT radens egen text, aldrig mot en
          konstant — annars vaktar grinden en smak i stället för en relation.

     K-K  Svarets plats följer uppgiftens form: med likhetstecken står rutan direkt efter tecknet,
          utan tecken skrivs "Svar:" och rutans högerkant ligger vid radens. Luckor (.lucka) är
          delar av uttrycket, inte svar, och en flerrutsrad har inget enskilt svar att högerställa.

   Kör:  node verktyg/brytning-grind.js [--sida d3] [--sabba streck|grupp|bred|par|bokstavsstil|svarsetikett|svarsplats|dubbeletikett|flerradsvar]
         --sabba återskapar felet regeln finns för → benet MÅSTE fälla. Ett motprov som inte kan
         fälla bevisar ingenting.

   Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const LAS_UPP = require('./niva-las-upp').snutt;   // nivåstegen upplåsta innan mätning
const MP = require('./matpunkt').skapa('brytning-grind.js');   // V14
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.alla())) process.exit(0);
const BARA  = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
/* MÄTS I TELEFONENS VY. K-D handlar om BRYTNINGEN, och på en bred skärm bryter ingen rad — ett ben
   som mäter där är grönt därför att det inte mäter något (motprovet --sabba par kunde inte fälla
   det). 390 px är vyn felet syns i; K-E och K-F är breddoberoende och mäts lika gärna där.
   --vy <bredd>x<höjd> byter mått för en egen körning. */
const VY = (i => i >= 0 ? args[i + 1] : '390x844')(args.indexOf('--vy'));

const PRE = `(function(){ var s = 0x2F6E2B1; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); }); try { localStorage.clear(); } catch(e){} })();`;

const PROBE = `(function(){
  var SABBA = ${JSON.stringify(SABBA)};
  // SABBA uppst-bryt: uppställningens rader tvingas brytas — K-U måste fälla.
  if(SABBA === 'uppst-bryt'){ var _ub = document.createElement('style'); _ub.textContent = '.ovn-uppst .mult-upp-row{flex-wrap:wrap !important;max-width:90px !important}'; document.head.appendChild(_ub); }
  var ut = { onerr: window.__onerr || null, blad: [], noter: [] };
  var MIN_KONTRAST = 2.0;

  function synlig(e){ return e.getClientRects().length > 0; }
  function kort(t){ return String(t).replace(/\\s+/g, ' ').trim(); }
  /* RADBOXARNA i en text: ett block har EN klientrektangel hur många rader det än bryter över,
     så antalet rader måste läsas ur en Range över innehållet. */
  function radrektanglar(el){
    var r = document.createRange(); r.selectNodeContents(el);
    return Array.prototype.slice.call(r.getClientRects());
  }
  function radantal(el){ return el ? radrektanglar(el).length : 0; }

  /* KONTRAST med alfa inräknad: en linje med alpha .55 är inte sin egen färg, den är sin färg
     BLANDAD med bakgrunden. Utan blandningen mäter provet en linje som inte finns på skärmen. */
  function delar(s){ var m = String(s).match(/[\\d.]+/g) || []; return m.map(Number); }
  function blanda(farg, bak){
    var d = delar(farg), c = d.slice(0, 3), a = d.length > 3 ? d[3] : 1;
    if(a >= 1) return c;
    var b = delar(bak).slice(0, 3);
    return c.map(function(v, i){ return a * v + (1 - a) * (b[i] === undefined ? 255 : b[i]); });
  }
  function lum(c){ var a = c.map(function(v){ v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; }
  function kontrast(a, b){ var l1 = lum(a), l2 = lum(b), hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return Math.round(((hi + .05) / (lo + .05)) * 100) / 100; }
  function bakgrund(el){
    var e = el;
    while(e && e !== document.documentElement){
      var b = getComputedStyle(e).backgroundColor;
      if(b && !/rgba\\([^)]*,\\s*0\\)/.test(b) && b !== 'transparent') return b;
      e = e.parentElement;
    }
    return 'rgb(255,255,255)';
  }
  function kant(el, sida){
    var st = getComputedStyle(el);
    var b = parseFloat(st['border' + sida + 'Width']) || 0;
    if(!b || st['border' + sida + 'Style'] === 'none') return null;
    var farg = st['border' + sida + 'Color'];
    if(/rgba\\([^)]*,\\s*0\\)/.test(farg)) return null;
    return { bredd: b, farg: farg };
  }

  /* GOLVET för en smal ruta mäts på en EGEN ruta i layouten (utanför bild). Rutan på raden kan
     ligga i en dold flik, och en osynlig ruta är 0 px bred — mäts den, ser varje facit för långt
     ut och benet blir tyst. */
  var golvInnanmate = 0;
  (function(){
    var p = document.createElement('input');
    p.className = 'ovn-in';
    p.style.cssText = 'position:absolute;left:-9999px;top:0;';
    document.body.appendChild(p);
    var st = getComputedStyle(p);
    golvInnanmate = p.getBoundingClientRect().width
      - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight)
      - parseFloat(st.borderLeftWidth) - parseFloat(st.borderRightWidth);
    p.remove();
  })();
  var matare = document.createElement('span');
  matare.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0;';
  document.body.appendChild(matare);
  function textbredd(el, text){
    var st = getComputedStyle(el);
    matare.style.font = st.font || (st.fontSize + ' ' + st.fontFamily);
    matare.textContent = text;
    return matare.getBoundingClientRect().width;
  }
  function facitAv(inp){
    var d = inp.dataset;
    if(d.visa) return d.visa;
    if(d.svar !== undefined) return String(d.svar);
    if(d.forenkla !== undefined) return decodeURIComponent(d.forenkla);
    // förlängningens led (d7): facitet står i rutan, led 1 som del + faktor, led 2 som talet
    if(d.forlled !== undefined) return decodeURIComponent(d.forlled) + ' · ' + d.forlfaktor;
    if(d.forlbrak !== undefined) return String(d.forlbrak);
    if(d.forlprod !== undefined) return String(d.forlprod);   // produktledet
    return null;
  }

  function matSheet(namn, sh){
    var b = { blad: namn, rader: 0, grupper: 0, rutor: 0, bokstaver: 0, svarMedLikhet: 0, svarFritt: 0, brott: [] };
    var bak = bakgrund(sh);

    /* SABOTAGEN återskapar precis de tre fel reglerna finns för. */
    /* --sabba bilduppgift: lagg bilden och rutan i en svarsrad med "Svar:" forst — precis
       det K-K gjorde live. BENET MASTE FALLA. */
    if(SABBA === 'bilduppgift'){
      var bRad = Array.prototype.filter.call(sh.querySelectorAll('.ovn-rad, .ak8-rad'), function(r){
        return synlig(r) && r.querySelector('.emoji-bild, .alg-figur, .fig-wrap, svg, img')
            && r.querySelector('input');
      })[0];
      if(bRad && !bRad.querySelector('.ovn-svarsrad')){
        var parS = document.createElement('span');
        parS.className = 'ovn-svarsrad';
        var etS = document.createElement('span');
        etS.className = 'ovn-svar-etikett'; etS.textContent = 'Svar:';
        parS.appendChild(etS);
        var kvar = Array.prototype.slice.call(bRad.children).filter(function(c){
          return !c.classList.contains('ovn-label'); });
        bRad.appendChild(parS);
        kvar.forEach(function(c){ parS.appendChild(c); });
        ut.noter.push('SABBA: la bilden och rutan i en svarsrad med "Svar:" forst');
      }
    }
    if(SABBA === 'streck'){
      var r0 = sh.querySelector('.ovn-rad, .ak8-rad');
      if(r0){ r0.style.borderBottom = '1px dotted rgb(237,230,214)';
        ut.noter.push('SABBA: satte tillbaka en linje under en deluppgiftsrad'); }
    }
    if(SABBA === 'grupp'){
      var g0 = Array.prototype.filter.call(sh.querySelectorAll('.ovn-grupp, .ak8-grupp'), synlig)[1];
      if(g0){ g0.style.borderTop = 'none';
        ut.noter.push('SABBA: tog bort strecket ovanfor en huvuduppgift'); }
    }
    if(SABBA === 'bred'){
      var sm = Array.prototype.filter.call(sh.querySelectorAll('input.ovn-in'), function(i){
        var f = facitAv(i); return synlig(i) && f && !i.classList.contains('bred') && textbredd(i, f) <= golvInnanmate; })[0];
      if(sm){ sm.classList.add('bred');
        ut.noter.push('SABBA: gav ett kort svar en fast bred ruta'); }
    }
    if(SABBA === 'bokstavsstil'){
      var l9 = Array.prototype.filter.call(sh.querySelectorAll('.ovn-label, .ak8-label'), synlig)[0];
      if(l9){ l9.style.fontFamily = 'Cinzel, serif'; l9.style.fontSize = '11px'; l9.style.color = 'rgb(122,110,101)';
        ut.noter.push('SABBA: gav bokstaven ett eget typsnitt och liten gra ton'); }
    }
    if(SABBA === 'svarsetikett'){
      var e9 = Array.prototype.filter.call(sh.querySelectorAll('.ovn-svar-etikett'), synlig)[0];
      if(e9){ e9.remove(); ut.noter.push('SABBA: tog bort "Svar:"-etiketten'); }
    }
    if(SABBA === 'dubbeletikett'){
      var d9 = Array.prototype.filter.call(sh.querySelectorAll('.ovn-svarsrad'), synlig)[0];
      if(d9){ var extra = document.createElement('span'); extra.className = 'ovn-svar-etikett';
        extra.textContent = 'Omkrets'; d9.insertBefore(extra, d9.firstChild);
        ut.noter.push('SABBA: satte dit en andra etikett i svarsparet'); }
    }
    if(SABBA === 'flerradsvar'){
      var f9 = Array.prototype.filter.call(sh.querySelectorAll('.ovn-svarsrad-egen'), synlig)[0];
      /* Flytta in paret I fragans text: det ar sa felet ser ut nar svaret klams in i slutet av
         en flerradig fraga. Att bara ta bort klassen racker inte — raden kan anda brytas sa att
         paret hamnar under, och da bevisar motprovet ingenting. */
      if(f9){ var fr9 = f9.previousElementSibling;
        if(fr9 && !fr9.querySelector('input')){ f9.classList.remove('ovn-svarsrad-egen'); fr9.appendChild(f9);
          ut.noter.push('SABBA: klamde in det flerradiga svaret i fragans sista rad'); } }
    }
    if(SABBA === 'svarsplats'){
      var p9 = Array.prototype.filter.call(sh.querySelectorAll('.ovn-svarsrad'), synlig)[0];
      if(p9){ p9.style.marginLeft = '0'; p9.style.marginRight = 'auto';
        ut.noter.push('SABBA: flyttade det fria svaret till radens vanstra kant'); }
    }
    if(SABBA === 'par'){
      var par = sh.querySelector('.ovn-led-par');
      if(par){
        var mor = par.parentNode;
        while(par.firstChild) mor.insertBefore(par.firstChild, par);
        par.remove();
        ut.noter.push('SABBA: loste upp ett likhetstecken fran sin ruta');
      }
    }

    // ── K-F a: ingen linje mellan deluppgifterna ──────────────────────────────────────────
    Array.prototype.forEach.call(sh.querySelectorAll('.ovn-rad, .ak8-rad, .ovn-brak-rad'), function(r){
      if(!synlig(r)) return;
      b.rader++;
      var k = kant(r, 'Bottom');
      if(k) b.brott.push('K-F AVDELARE MELLAN DELUPPGIFTER: raden "' + kort(r.textContent).slice(0, 22)
        + '" har en linje under sig (' + k.bredd + ' px) — strecket hor till huvuduppgiften');

      // ── K-D: ingen rad far sluta med ett ensamt likhetstecken ──────────────────────────
      var barn = Array.prototype.filter.call(r.children, synlig);
      if(barn.length < 2) return;
      var linjer = [];
      barn.forEach(function(c){
        var cr = c.getBoundingClientRect();
        var l = linjer[linjer.length - 1];
        if(!l || Math.abs(l.top - cr.top) > 6) linjer.push({ top: cr.top, items: [c] });
        else l.items.push(c);
      });
      if(linjer.length < 2) return;
      linjer.forEach(function(l, i){
        if(i === linjer.length - 1) return;                 // sista linjen far sluta hur den vill
        var sista = l.items[l.items.length - 1];
        /* Ett ENSAMT tecken, inte ett par: paret bär också texten "=" (rutan bidrar med noll
           text), och utan det här villkoret fällde benet precis den struktur det ska kräva. */
        var ensamt = kort(sista.textContent) === '=' && sista.tagName !== 'INPUT'
          && !(sista.querySelector && sista.querySelector('input'));
        if(ensamt)
          b.brott.push('K-D RADEN SLUTAR MED ETT ENSAMT "=": "' + kort(r.textContent).slice(0, 22)
            + '" bryter sa att tecknet blir kvar och rutan kalms in pa nasta rad');
      });
    });

    // ── K-J: deluppgiftsbokstaven i bokens typografi ──────────────────────────────────────
    var radtext = Array.prototype.filter.call(sh.querySelectorAll('.ovn-text, .ak8-tal'), synlig)[0];
    if(radtext){
      var rs = getComputedStyle(radtext);
      var rFamilj = rs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      var rStorlek = parseFloat(rs.fontSize);
      var rLjus = lum(blanda(rs.color, bak));
      Array.prototype.forEach.call(sh.querySelectorAll('.ovn-label, .ak8-label'), function(lbl){
        if(!synlig(lbl)) return;
        b.bokstaver++;
        var ls = getComputedStyle(lbl);
        var lFamilj = ls.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        var lStorlek = parseFloat(ls.fontSize);
        var lLjus = lum(blanda(ls.color, bak));
        if(lFamilj !== rFamilj)
          b.brott.push('K-J ANNAT TYPSNITT: bokstaven "' + kort(lbl.textContent) + '" ar ' + lFamilj
            + ' medan raden ar ' + rFamilj);
        else if(lStorlek < rStorlek * 0.6)
          b.brott.push('K-J FOR LITEN: bokstaven ar ' + Math.round(lStorlek) + ' px mot radens '
            + Math.round(rStorlek) + ' px (' + Math.round(100 * lStorlek / rStorlek) + ' %, kravs 60)');
        else if(Math.abs(lLjus - rLjus) > 0.10)
          b.brott.push('K-J FOR LJUS: bokstavens ton ligger ' + (Math.round(100 * (lLjus - rLjus)) / 100)
            + ' fran radens i ljushet (kravs 0,10)');
      });
    }

    // ── K-K: svarets plats foljer uppgiftens form ─────────────────────────────────────────
    Array.prototype.forEach.call(sh.querySelectorAll('.ovn-rad, .ak8-rad'), function(rad){
      if(!synlig(rad)) return;
      var rutor = Array.prototype.filter.call(rad.querySelectorAll('input.ovn-in, input.ak8-in'), synlig)
        .filter(function(i){ return !i.classList.contains('lucka')
          && !i.closest('.ovn-brak, .brak, .alg-pyramid, .alg-magisk, .ovn-val-grid, .valruta-grid'); });
      if(!rutor.length) return;
      var txt = kort(rad.textContent);
      /* FRÅGAN FÖRE RUTAN avgör, inte raden. "Omkrets ▢ = ▢" är en kedja: första rutan svarar på
         frågan, resten är led (K-B/K-D). Ett likhetstecken FÖRE rutan gör uppgiften till en
         likhet, och då ska rutan följa tecknet. */
      var harLikhetFore = false;
      rutor.forEach(function(i){
        var fore = '';
        var n = i.previousSibling;
        while(n){ fore = (n.nodeType === 3 ? n.nodeValue : n.textContent || '') + fore; n = n.previousSibling; }
        if(fore.indexOf('=') < 0) return;                    // rutan svarar på frågan
        harLikhetFore = true;
        /* PROSA MED LIKHETSTECKEN är ingen likhet: "om a = 12 och b = 5" är ett villkor i frågan.
           Det regeln siktar på är det RITADE STRECKET som står där rutan borde stå. */
        if(!/_{2,}/.test(fore)) return;
        var par = i.closest('.ovn-led-par');
        if(par && kort(par.textContent).indexOf('=') === 0) return;
        var f = i.previousSibling;
        while(f && f.nodeType === 3 && !f.nodeValue.trim()) f = f.previousSibling;
        var intill = f ? (f.nodeType === 3 ? f.nodeValue : f.textContent) : '';
        if(/=\s*$/.test(intill || '')) return;
        b.brott.push('K-K RITAT STRECK I STALLET FOR RUTA: "' + txt.slice(0, 34) + '" — likheten pekar pa strecket, men rutan star efter meningen');
      });
      if(harLikhetFore || txt.indexOf('=') >= 0){
        b.svarMedLikhet++;
        return;
      }
      if(rutor.length !== 1) return;                      // flerrutsrad: inget enskilt svar
      b.svarFritt++;
      var ruta = rutor[0], par2 = ruta.closest('.ovn-svarsrad');

      /* BILD-UPPGIFT: egen placering. Rutan star dar datan satte den, inne i bilden, och
         K-K:s hogerstallda "Svar:" galler inte. Det som falls ar ISARSLITNINGEN. */
      var bildEl = rad.querySelector('.emoji-bild, .alg-figur, .fig-wrap, svg, img');
      if(bildEl){
        b.svarBild = (b.svarBild || 0) + 1;
        if(par2 && par2.querySelector('.emoji-bild, .alg-figur, .fig-wrap, svg, img')){
          b.brott.push('K-K BILDUPPGIFT ISARSLITEN: "' + txt.slice(0, 30) + '" — svarsraden bar '
            + 'bilden, sa "Svar:" hamnar fore bilden och rutan slits fran etiketten');
        } else if(par2){
          var etB = par2.querySelector('.ovn-svar-etikett');
          if(etB){
            var erB = etB.getBoundingClientRect(), urB = ruta.getBoundingClientRect();
            if(Math.abs(erB.top - urB.top) > 12 || (urB.left - erB.right) > 90)
              b.brott.push('K-K BILDUPPGIFT ISARSLITEN: "' + txt.slice(0, 30) + '" — etiketten och '
                + 'rutan ligger ' + Math.round(urB.left - erB.right) + ' px isar, '
                + Math.round(Math.abs(erB.top - urB.top)) + ' px i hojd');
          }
        }
        return;                                          // ovriga K-K-ben galler inte har
      }
      if(!par2 || !par2.querySelector('.ovn-svar-etikett')){
        b.brott.push('K-K FRITT SVAR UTAN "Svar:": "' + txt.slice(0, 34) + '"');
        return;
      }
      /* SVARETS högerkant, inte rutans: en enhet efter rutan ("dm²") hör till svaret och ligger
         i samma par. Mäter man rutan ser ett svar med enhet alltid ut att ha luft kvar. */
      var rr = rad.getBoundingClientRect(), ir = par2.getBoundingClientRect();
      if(rr.right - ir.right > 24)
        b.brott.push('K-K FRITT SVAR EJ HOGERSTALLT: "' + txt.slice(0, 28) + '" har '
          + Math.round(rr.right - ir.right) + ' px luft till radens hogerkant');

      /* FLERRADIG FRÅGA: svaret ska ligga på EGEN rad under frågan. Mätt på frågans klient-
         rektanglar (en text som bryter över flera rader har flera) och på att svarsparet börjar
         UNDER frågans sista rad — inte inklämt i slutet av den. */
      /* Ligger svaret INUTI frågans text är det inklämt per definition — ingen geometri behövs. */
      var inneIFraga = par2.closest('.ovn-text, .ak8-tal');
      if(inneIFraga && radantal(inneIFraga) > 1)
        b.brott.push('K-K FLERRADIG FRAGA MED SVARET PA FRAGERADEN: "' + txt.slice(0, 28)
          + '" — svaret star inuti fragans text');
      var fragaEl = par2.previousElementSibling
        || (par2.parentElement && par2.parentElement.querySelector('.ovn-text, .ak8-tal'));
      if(fragaEl && radantal(fragaEl) > 1){
        var rutor9 = radrektanglar(fragaEl);
        var fr = rutor9[rutor9.length - 1];
        if(ir.top < fr.bottom - 2)
          b.brott.push('K-K FLERRADIG FRAGA MED SVARET PA FRAGERADEN: "' + txt.slice(0, 28)
            + '" — svaret hor hemma pa egen rad under fragan');
      }

      /* DUBBEL ETIKETT: ett svar har en etikett, inte två. "Omkrets Svar: ▢" är det fel regeln
         finns för — står en etikett redan där ska den användas, inte kompletteras. */
      var etiketter = par2.querySelectorAll('.ovn-svar-etikett').length;
      var foreEl = par2.previousElementSibling;
      var foreOrd = foreEl && !foreEl.querySelector('input')
        && /^[A-ZÅÄÖ][a-zåäöA-ZÅÄÖ]{3,}:?$/.test(kort(foreEl.textContent)) ? 1 : 0;
      if(etiketter + foreOrd > 1)
        b.brott.push('K-K DUBBEL ETIKETT: "' + kort(par2.textContent).slice(0, 24)
          + '" har ' + (etiketter + foreOrd) + ' etiketter');
    });

    // ── K-F b: streck ovanfor varje huvuduppgift utom den forsta ──────────────────────────
    /* EN UPPGIFT är en grupp som bär något att göra — en rad eller en ruta. Rena rubriker
       ("Blad B1" i åttans negativa tal) bär samma klass men är inte uppgifter, och en linje mellan
       en rubrik och dess egen första uppgift skiljer ingenting åt. */
    var grupper = Array.prototype.filter.call(sh.querySelectorAll('.ovn-grupp, .ak8-grupp'), function(g){
      return synlig(g) && (g.querySelector('.ovn-rad, .ak8-rad, .ovn-brak-rad, input'));
    });
    grupper.forEach(function(g, i){
      b.grupper++;
      if(i === 0) return;                                   // forsta uppgiften har inget fore sig
      var k = kant(g, 'Top');
      if(!k){ b.brott.push('K-F SAKNAD AVDELARE MELLAN HUVUDUPPGIFTER: grupp ' + (i + 1)
        + ' ("' + kort(g.textContent).slice(0, 22) + '") har ingen linje ovanfor sig'); return; }
      var c = kontrast(delar(bak).slice(0, 3), blanda(k.farg, bak));
      if(c < MIN_KONTRAST) b.brott.push('K-F AVDELAREN SYNS INTE: grupp ' + (i + 1) + ' har kontrast '
        + c + ' mot arket (kravs ' + MIN_KONTRAST + ') — en linje ingen ser gor inget jobb');
    });

    // ── K-E: korta svar far inte fast breda rutor ─────────────────────────────────────────
    if(golvInnanmate > 0){
      Array.prototype.forEach.call(sh.querySelectorAll('input.ovn-in'), function(inp){
        if(!synlig(inp)) return;
        var f = facitAv(inp); if(!f) return;
        b.rutor++;
        if(!inp.classList.contains('bred')) return;
        var tb = textbredd(inp, f);
        if(tb <= golvInnanmate)
          b.brott.push('K-E FAST BRED RUTA FOR KORT SVAR: "' + f + '" tar ' + Math.round(tb)
            + ' px och ryms i den smala rutans golv (' + Math.round(golvInnanmate) + ' px)');
      });
    }

    // ── K-U: uppställningen bryts aldrig (radtyp 'uppstallning', order 2026-10-07) ──────────
    // En uppställning är ett rutnät: varje rad på EN linje, raderna i ordning uppifrån och ned, och
    // kolumnerna rakt under varandra (radernas högerkanter lika). Bryts en rad hamnar siffrorna i
    // fel kolumn — då är det inte längre en uppställning. Mäts vid Chromebook-bredderna först.
    b.uppst = 0;
    Array.prototype.forEach.call(sh.querySelectorAll('.ovn-uppst'), function(u){
      if(!synlig(u)) return;
      b.uppst++;
      var rows = Array.prototype.filter.call(u.querySelectorAll('.mult-upp-row'), synlig);
      var tal = rows.slice(0, 2).map(function(x){ return kort(x.textContent).replace(/\\s/g, ''); }).join(' ');
      var hogra = [], forraBotten = -Infinity;
      rows.forEach(function(row, ri){
        var celler = Array.prototype.filter.call(row.children, synlig);
        var tops = celler.map(function(c){ return Math.round(c.getBoundingClientRect().top); });
        if(tops.length && Math.max.apply(null, tops) - Math.min.apply(null, tops) > 2)
          b.brott.push('K-U RADEN BRYTS: rad ' + (ri + 1) + ' i "' + tal + '" ligger på flera linjer');
        var rr = row.getBoundingClientRect();
        if(rr.top < forraBotten - 1) b.brott.push('K-U RADERNA ÖVERLAPPAR: rad ' + (ri + 1) + ' i "' + tal + '"');
        forraBotten = rr.bottom;
        if(celler.length) hogra.push(Math.round(celler[celler.length - 1].getBoundingClientRect().right));
      });
      if(hogra.length && Math.max.apply(null, hogra) - Math.min.apply(null, hogra) > 2)
        b.brott.push('K-U KOLUMNERNA GLIDER: radernas högerkanter i "' + tal + '" är ' + hogra.join('/') + ' px');
      /* KOLUMN FÖR KOLUMN, och KOMMAT (Joachims granskning 2026-10-08: kommat smalt, tätt mellan
         siffrorna, siffrorna kvar i sina kolumner). Kommat och kommaluften är inga kolumner: siffra
         nummer k från höger ska ha samma högerkant i varje rad. Kommat ska vara smalt (högst halva
         sifferkolumnen), ligga mellan sina grannar och stå efter lika många siffror från höger i
         alla rader som bär det. */
      // Kommat känns igen på INNEHÅLLET, inte bara på klassen: en layout som ritar kommat i en vanlig\n      // .cell ska fällas av bredden, inte slinka förbi som en sifferkolumn.\n      function arKomma(c){ return c.classList.contains('komma') || kort(c.textContent) === ','; }\n      var kolumner = {}, kommaPlats = {};
      rows.forEach(function(row, ri){
        var celler = Array.prototype.filter.call(row.children, function(c){ return synlig(c) && !c.classList.contains('opcell'); });
        var siffror = celler.filter(function(c){ return !arKomma(c); });
        siffror.slice().reverse().forEach(function(c, k){ (kolumner[k] = kolumner[k] || []).push(Math.round(c.getBoundingClientRect().right)); });
        celler.forEach(function(c, ci){
          if(!arKomma(c)) return;
          var cr = c.getBoundingClientRect(), fore = celler[ci - 1], efter = celler[ci + 1];
          var efterAntal = celler.slice(ci + 1).filter(function(x){ return !arKomma(x); }).length;
          kommaPlats[efterAntal] = true;
          var sifferBredd = siffror.length ? siffror[siffror.length - 1].getBoundingClientRect().width : 40;
          if(kort(c.textContent) === ',' && cr.width > sifferBredd / 2 + 1)
            b.brott.push('K-U KOMMAT ÄR BRETT: ' + Math.round(cr.width) + ' px mot sifferkolumnens ' + Math.round(sifferBredd) + ' i "' + tal + '"');
          if((fore && fore.getBoundingClientRect().right > cr.left + 1) || (efter && efter.getBoundingClientRect().left < cr.right - 1))
            b.brott.push('K-U KOMMAT ÖVERLAPPAR en siffra i rad ' + (ri + 1) + ' av "' + tal + '"');
        });
      });
      Object.keys(kolumner).forEach(function(k){
        var x = kolumner[k];
        if(Math.max.apply(null, x) - Math.min.apply(null, x) > 2)
          b.brott.push('K-U SIFFRORNA UR KOLUMN: siffra ' + (+k + 1) + ' från höger i "' + tal + '" står vid ' + x.join('/') + ' px');
      });
      if(Object.keys(kommaPlats).length > 1)
        b.brott.push('K-U KOMMAT PÅ OLIKA PLATS: efter ' + Object.keys(kommaPlats).join(' resp. ') + ' siffror från höger i "' + tal + '"');
    });
    ut.blad.push(b);
  }

  // EN FLIK I TAGET, och matningen MEDAN fliken ar framme: ett dolt blad har inga matt.
  ${LAS_UPP}
  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
  var sedda = [];
  (nav.length ? nav : [null]).forEach(function(knapp){
    if(knapp){ if(knapp.disabled) return; knapp.click(); }
    Array.prototype.forEach.call(document.querySelectorAll('.ovn-sheet, .ak8-sheet'), function(sh){
      if(sedda.indexOf(sh) >= 0 || !synlig(sh)) return;
      sedda.push(sh);
      var vard = sh.parentElement || sh;
      function stegKnappar(){ return vard.querySelectorAll('.niva-rad .niva-btn'); }
      function namnNu(nr){
        var el = vard.querySelector('.ovn-sheet') || sh, h2 = el.querySelector('h2');
        var bas = h2 ? kort(h2.textContent) : 'blad ' + sedda.length;
        if(bas.length > 30) bas = '…' + bas.slice(-29);
        return nr ? bas.slice(0, 24) + ' niva ' + nr : bas;
      }
      var steg = stegKnappar().length;
      if(steg < 2){ matSheet(namnNu(0), sh); return; }
      /* Bladet byggs om vid nivåklick, så BÅDE knappen och arket letas upp på nytt per steg —
         en hållen nod är ett löst element och har inga mått. */
      for(var n = 0; n < steg; n++){
        var nb = stegKnappar()[n]; if(!nb || nb.disabled) continue;
        nb.click();
        var nySh = vard.querySelector('.ovn-sheet') || sh;
        matSheet(namnNu(n + 1), nySh);
      }
    });
  });
  matare.remove();
  return ut;
})()`;

let fel = 0, matta = 0, rader = 0, grupper = 0, rutor = 0;
console.log('BRYTNING-GRIND — K-D strukturerad brytning · K-E korta rutor som växer · K-F strecket mellan huvuduppgifter'
  + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');

Sidor.alla().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const tmp = path.join(os.tmpdir(), 'brytning-' + process.pid + '.js');
  const pre = path.join(os.tmpdir(), 'brytning-pre-' + process.pid + '.js');
  fs.writeFileSync(tmp, PROBE); fs.writeFileSync(pre, PRE);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), tmp,
    '--pre', pre, '--vanta-pa', 'blad', '--viewport', VY, '--timeout', '90000'], { encoding: 'utf8', timeout: 150000 });
  let ut = null; try { ut = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!ut){ fel++; console.log('✗ ' + sida + ': inget svar — ' + (r.stderr || '').trim().split('\n').pop()); return; }
  if(ut.onerr && ut.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + ut.onerr.join(' | ')); }
  (ut.noter || []).forEach(n => console.log('   ' + n));
  MP.rakna(sida, (ut.blad || []).length);
  (ut.blad || []).forEach(b => {
    matta++; rader += b.rader; grupper += b.grupper; rutor += b.rutor;
    MP.varde(sida, b.blad, { rader: b.rader, grupper: b.grupper, rutor: b.rutor,
      bokstaver: b.bokstaver, svarMedLikhet: b.svarMedLikhet, svarFritt: b.svarFritt });
    fel += b.brott.length;
    console.log((b.brott.length ? '✗ ' : '✓ ') + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad
      + ': ' + b.rader + ' rader, ' + b.grupper + ' uppgifter, ' + b.rutor + ' rutor, '
      + b.bokstaver + ' bokstäver, ' + b.svarMedLikhet + '=/' + b.svarFritt + ' fria svar' + (b.svarBild ? ' · ' + b.svarBild + ' bild-uppgifter' : '')
      + (b.brott.length ? '\n     ' + b.brott.slice(0, 4).join('\n     ')
         + (b.brott.length > 4 ? '\n     … och ' + (b.brott.length - 4) + ' till' : '') : ''));
  });
  // K-U VID CHROMEBOOK (Joachim 2026-10-08: skärmen som räknas, 1366 × 768 och 1536 × 864). Bara
  // sidor som laddar uppställningens yta — en läsning av filen — och bara K-U räknas här: övriga
  // ben mäts i grindens egen vy ovan (K-D syns bara där raderna bryter).
  if(fs.readFileSync(path.join(ROOT, sida), 'utf8').indexOf('uppstallning-yta.js') >= 0){
    ['1366x768', '1536x864'].forEach(vy => {
      const rc = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), tmp,
        '--pre', pre, '--vanta-pa', 'blad', '--viewport', vy, '--timeout', '90000'], { encoding: 'utf8', timeout: 150000 });
      let uc = null; try { uc = JSON.parse((rc.stdout || '').trim().split('\n').pop()); } catch(e){}
      if(!uc){ fel++; console.log('✗ ' + sida + ' · K-U ' + vy + ': inget svar'); return; }
      let antal = 0; const ku = [];
      (uc.blad || []).forEach(b => { antal += b.uppst || 0; b.brott.filter(x => /^K-U/.test(x)).forEach(x => ku.push(b.blad + ': ' + x)); });
      fel += ku.length;
      if(!antal){ fel++; console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · K-U ' + vy + ': sidan laddar ytan men ingen uppställning mättes'); return; }
      console.log((ku.length ? '✗ ' : '✓ ') + sida.replace(/\/index\.html$/, '') + ' · K-U ' + vy + ': ' + antal + ' uppställningar'
        + (ku.length ? '\n     ' + ku.slice(0, 4).join('\n     ') + (ku.length > 4 ? '\n     … och ' + (ku.length - 4) + ' till' : '') : ', hela'));
    });
  }
  try { fs.unlinkSync(tmp); fs.unlinkSync(pre); } catch(e){}
});

fel += MP.granska();   // V14: en sida i listan måste ge minst en mätpunkt
console.log('\n' + (fel ? '✗ BRYTNING-GRIND RÖD (' + fel + ')' : '✓ BRYTNING-GRIND GRÖN')
  + ' · ' + matta + ' blad, ' + rader + ' rader, ' + grupper + ' uppgifter, ' + rutor + ' rutor');
process.exit(fel ? 1 : 0);
