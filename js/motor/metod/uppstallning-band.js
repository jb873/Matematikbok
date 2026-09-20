/* uppstallning-band.js — UPPSTÄLLNINGSDRILLARNAS TALGENERATOR, styrd av bandet i js/data/spec-villkor.js
   (UPPST_BAND). Ett ställe för alla fyra räknesätten; drillarna (metod-addsub/-mult/-div) hämtar sina
   tal här och rullar inte egna rnd()-intervall. Order 2026-09-19 "Band för uppställningsdrillarna".

   KONTRAKT
     UppstBand.gen(rakne, niva)            → EN uppgift inom bandet (null om 400 dragningar inte räckte)
     UppstBand.omgang(rakne, niva, n, vakt) → n DISTINKTA uppgifter; nivå 3 = fördelning: varje profil minst
                                             en gång per omgång (perOmgang:'alla'), ordningen blandad
     UppstBand.kontrollera(rakne, niva, t) → [] om uppgiften håller bandet, annars lista av brott (fuzzen)
     UppstBand.stat                        → förkastningstal per räknesätt/nivå: {dragningar, godkanda, avslag:{…}}
   Uppgift: add/sub {a,b,answer,display} · mult {m,d,answer,display} · div {N,n,Q,display} · oka-minska {a,b,answer,
   dec,flytt,display} · bakifran samma + nextTio (a/b/answer/flytt = mantissor, dec skalar dem; display i decimalform). `profil` = index i
   blandningen (nivå 3), annars 0.

   Räknar bara HELTAL — bandet har inga decimaler (Joachims talområden). Drillarna renderar dec:0.
   Pure: ingen DOM. Går i browser (window.SPEC_VILLKOR + distinktOmgang ur metod-karna) och i node (fuzz). */
(function(){
  'use strict';
  var SV = (typeof window !== 'undefined' && window.SPEC_VILLKOR)
        || (typeof require === 'function' ? require('../../data/spec-villkor.js') : null);
  if(!SV) throw new Error('uppstallning-band: SPEC_VILLKOR saknas (ladda js/data/spec-villkor.js först)');

  var MAX_DRAG = 400;
  var stat = {};
  function st(rakne, niva){
    var r = stat[rakne] || (stat[rakne] = {});
    return r[niva] || (r[niva] = { dragningar:0, godkanda:0, avslag:{} });
  }
  function avslag(s, skal){ s.avslag[skal] = (s.avslag[skal] || 0) + 1; }

  function rnd(r){ return r.min + Math.floor(Math.random() * (r.max - r.min + 1)); }
  function decStr(mant, dec){ if(!dec) return String(mant); var s = String(mant); while(s.length <= dec) s = '0' + s; return s.slice(0, -dec) + ',' + s.slice(-dec); }   // 8986,2 → '898,6'
  function inom(x, r){ return r == null || (x >= r.min && x <= r.max); }
  function harMinnessiffra(N, n){ var digs = String(N).split('').map(Number), c = 0; for(var i = 0; i < digs.length - 1; i++){ c = (c * 10 + digs[i]) % n; if(c > 0) return true; } return false; }
  function borrows(a, b){ var n = 0, c = 0; while(b > 0 || c > 0){ var ad = a % 10, bd = (b % 10) + c; c = ad < bd ? 1 : 0; if(c) n++; a = Math.floor(a / 10); b = Math.floor(b / 10); } return n; }

  // ── en dragning per räknesätt: {task} eller {skal:'…'} ────────────────────────────────────
  function dragAdd(v){
    var a = rnd(v.term), b = rnd(v.term);
    if(v.minstEn){ if(Math.random() < 0.5) a = rnd(v.minstEn); else b = rnd(v.minstEn); }   // minst en term i storleksbandet — direkt, inte via förkastning
    if(v.resultat && v.resultat.summa && a + b < v.resultat.summa.min) return { skal:'band:summa' };
    if((a % 10) + (b % 10) < 10) return { skal:'struktur:minnessiffra' };                    // drillens krav: metoden ska behövas
    return { task:{ a:a, b:b, answer:a + b, display:a + ' + ' + b } };
  }
  function dragSub(v){
    var a = rnd(v.term), b = rnd(v.term);
    if(v.minstEn){ if(Math.random() < 0.5) a = rnd(v.minstEn); else b = rnd(v.minstEn); }
    if(a < b){ var t = a; a = b; b = t; }
    if(v.resultat && v.resultat.differens && a - b < v.resultat.differens.min) return { skal:'band:differens' };
    if(borrows(a, b) < 1) return { skal:'struktur:vaxling' };
    return { task:{ a:a, b:b, answer:a - b, display:a + ' − ' + b } };
  }
  function dragMult(v, fler){
    var m = rnd(v.faktorStor), d = rnd(v.faktorLiten);
    if(m % 10 < 3) return { skal:'struktur:ental' };                                        // stora faktorns ental ≥ 3: flera delprodukter, ingen "·10"-genväg
    if(fler && d % 10 < 3) return { skal:'struktur:ental' };
    return { task:{ m:m, d:d, answer:m * d, display:m + ' · ' + d } };
  }
  function dragDiv(v){
    var n = rnd(v.namnare);
    var qLo = Math.ceil(v.taljare.min / n), qHi = Math.floor(v.taljare.max / n);
    if(qHi < qLo) return { skal:'band:taljare' };
    var Q = qLo + Math.floor(Math.random() * (qHi - qLo + 1)), N = Q * n;               // kvoten heltal — konstruerat, inte förkastat
    if(v.minnessiffra && !harMinnessiffra(N, n)) return { skal:'struktur:minnessiffra' };            // nivå ≥ 2: minst en rest att bära vidare (kort division: minnessiffra; lång: rest ≠ 0 i något steg)
    return { task:{ N:N, n:n, Q:Q, answer:Q, display:N + ' / ' + n } };
  }
  // Flytt-metoderna (öka och minska lika · addition bakifrån): subtrahendens flyttsiffra KONSTRUERAS (inte förkastas) —
  // sista siffran dras ur [flyttsiffra.min, 10 − forstaSteg.min]; minuenden dras ovanför b + differens.min. vaxling:true
  // konstruerar minuendens flyttsiffra under subtrahendens (växling krävs), ur [minuend.flyttsiffra.min, b-siffran − 1]
  // (bakifran: ≥ 1 så minuenden inte slutar på 0). Förkastas: flyttsiffrorna lika (olika) och minuend utan utrymme.
  // flytt = första hoppet upp till nästa runda tal, nextTio = b + flytt (mantissor).
  function dragFlytt(v){
    var dec = v.decimaler ? rnd(v.decimaler) : 0;
    var fmin = (v.flyttsiffra && v.flyttsiffra.min) || 0, fmax = v.forstaSteg ? 10 - v.forstaSteg.min : 9;
    if(fmax < fmin) return { skal:'band:flyttsiffra' };
    var b = rnd(v.subtrahend); b = b - (b % 10) + (fmin + Math.floor(Math.random() * (fmax - fmin + 1)));
    if(b < v.subtrahend.min || b > v.subtrahend.max) return { skal:'band:subtrahend' };
    var aLo = b + ((v.resultat && v.resultat.differens && v.resultat.differens.min) || 1), aHi = v.minuend.max;
    if(aLo > aHi) return { skal:'band:minuend' };
    var a = rnd({ min:aLo, max:aHi });
    if(v.vaxling){ var mlo = (v.minuend.flyttsiffra && v.minuend.flyttsiffra.min) || 0; if(mlo > (b % 10) - 1) return { skal:'band:flyttsiffra' };
      a = a - (a % 10) + mlo + Math.floor(Math.random() * ((b % 10) - mlo)); if(a < aLo) a += 10; if(a > aHi) return { skal:'band:minuend' }; }   // minuendens flyttsiffra < subtrahendens — konstruerat
    if(v.olika === 'flyttsiffra' && a % 10 === b % 10) return { skal:'struktur:flyttsiffra-lika' };
    var flytt = 10 - (b % 10);
    return { task:{ a:a, b:b, answer:a - b, dec:dec, flytt:flytt, nextTio:b + flytt, egnaDecimaler:true,
                    display:decStr(a, dec) + ' − ' + decStr(b, dec) } };
  }
  var DRAG = { add:dragAdd, sub:dragSub, mult:function(v){ return dragMult(v, false); }, 'mult-fler':function(v){ return dragMult(v, true); }, div:dragDiv, 'oka-minska':dragFlytt, bakifran:dragFlytt };

  // ── gen: dra tills bandet håller ─────────────────────────────────────────────────────────
  function gen(rakne, niva, profilIx, pos){
    var band = SV.UPPST_BAND[rakne]; if(!band) throw new Error('uppstallning-band: okänt räknesätt ' + rakne);
    var s = st(rakne, niva);
    var P = SV.uppstBand(rakne, niva).profiler;
    for(var i = 0; i < MAX_DRAG; i++){
      var ix = profilIx != null ? profilIx : (P > 1 ? Math.floor(Math.random() * P) : 0);
      var v = SV.uppstBand(rakne, niva, ix);
      s.dragningar++;
      var r = DRAG[rakne](v);
      if(r.skal){ avslag(s, r.skal); continue; }
      s.godkanda++;
      r.task.profil = ix; r.task.niva = niva; if(r.task.dec == null) r.task.dec = 0;
      if(v.decimaler && !r.task.egnaDecimaler) skala(rakne, r.task, v, pos || 0);   // oka-minska bär sina decimaler själv (mantissor ur profilen)   // nivå 4: heltalsuppgiften blir decimaltal — mantissorna kvar (bandet, facit), display i decimalform
      return r.task;
    }
    return null;
  }

  // Decimalnivån: samma tal som heltalsbandet, skalade med 10^dec. Mantissorna (a/b/m/answer) är kvar som heltal
  // så kontrollera() och facit räknar som förr; dec + display säger hur de visas. mult-fler: lilla faktorn får
  // decimaler först från uppgift `stegvis.fran` (stegvis introduktion, som den gamla drillen).
  function skala(rakne, t, v, pos){
    t.dec = rnd(v.decimaler);
    if(rakne === 'add' || rakne === 'sub'){ t.display = decStr(t.a, t.dec) + (rakne === 'add' ? ' + ' : ' − ') + decStr(t.b, t.dec); t.answerDec = t.dec; }
    else {
      t.dDec = (v.stegvis && pos + 1 >= v.stegvis.fran) ? v.stegvis.litenDecimaler : 0;
      t.answerDec = t.dec + t.dDec;
      t.display = decStr(t.m, t.dec) + ' · ' + decStr(t.d, t.dDec);
    }
  }

  // ── omgang: n distinkta; nivå 3 = varje profil minst en gång, blandad ordning ────────────
  function omgang(rakne, niva, n, vakt){
    var v = SV.uppstBand(rakne, niva), P = v.profiler;
    var drag = vakt ? vakt.gen(gen) : gen;   // exempelvakten (metod-karna): en dragning lika med förklaringens exempel dras om
    var dist = (typeof distinktOmgang === 'function') ? distinktOmgang : lokalDistinkt;
    for(var forsok = 0; forsok < 20; forsok++){
      // profil per plats: de P första täcker alla profiler, resten slumpas; blandas sedan
      var plan = []; for(var i = 0; i < n; i++) plan.push(i < P ? i : Math.floor(Math.random() * P));
      for(var j = plan.length - 1; j > 0; j--){ var k = Math.floor(Math.random() * (j + 1)); var t = plan[j]; plan[j] = plan[k]; plan[k] = t; }
      var pos = 0;
      var ut = dist(function(){ var ix = plan[Math.min(pos, plan.length - 1)]; var task = drag(rakne, niva, P > 1 ? ix : null, pos); if(task) pos++; return task; },
                    n, function(task){ return task.display; });
      if(P > 1 && v.perOmgang === 'alla'){
        var sedda = {}; ut.forEach(function(task){ sedda[task.profil] = true; });
        if(Object.keys(sedda).length < P) continue;                                         // distinkthets-ersättningar kan ha tappat en profil → gör om
      }
      return ut;
    }
    return ut;
  }
  function lokalDistinkt(g, n, keyFn){
    var ut = [], seen = {}, tries = 0;
    while(ut.length < n && tries++ < 300){ var t = g(); if(t == null) continue; var k = keyFn(t); if(seen[k]) continue; seen[k] = true; ut.push(t); }
    while(ut.length < n){ var t2 = g(); if(t2 == null) break; ut.push(t2); }
    return ut;
  }

  // ── kontrollera: oberoende kontroll mot bandet (fuzzens öga) ─────────────────────────────
  function kontrollera(rakne, niva, t){
    var fel = [];
    var v = SV.uppstBand(rakne, niva, t.profil != null ? t.profil : 0);
    function krav(ok, txt){ if(!ok) fel.push(txt); }
    if(v.decimaler) krav(t.dec >= v.decimaler.min && t.dec <= v.decimaler.max, 'decimaler utanför ' + JSON.stringify(v.decimaler) + ': ' + t.display);
    else krav(!t.dec, 'decimaler på heltalsnivå: ' + t.display);
    if(v.stegvis) krav((t.dDec || 0) === 0 || (t.dDec === v.stegvis.litenDecimaler), 'lilla faktorns decimaler: ' + t.display);
    if(rakne === 'add' || rakne === 'sub'){
      krav(inom(t.a, v.term) && inom(t.b, v.term), 'term utanför ' + JSON.stringify(v.term) + ': ' + t.display);
      if(v.minstEn) krav(inom(t.a, v.minstEn) || inom(t.b, v.minstEn), 'ingen term i ' + JSON.stringify(v.minstEn) + ': ' + t.display);
      if(rakne === 'add'){ krav(t.answer === t.a + t.b, 'facit: ' + t.display); if(v.resultat && v.resultat.summa) krav(t.answer >= v.resultat.summa.min, 'summa < ' + v.resultat.summa.min + ': ' + t.display); krav((t.a % 10) + (t.b % 10) >= 10, 'ingen minnessiffra: ' + t.display); }
      else { krav(t.answer === t.a - t.b, 'facit: ' + t.display); if(v.resultat && v.resultat.differens) krav(t.answer >= v.resultat.differens.min, 'differens < ' + v.resultat.differens.min + ': ' + t.display); krav(borrows(t.a, t.b) >= 1, 'ingen växling: ' + t.display); }
    } else if(rakne === 'mult' || rakne === 'mult-fler'){
      krav(inom(t.m, v.faktorStor), 'stor faktor utanför ' + JSON.stringify(v.faktorStor) + ': ' + t.display);
      krav(inom(t.d, v.faktorLiten), 'liten faktor utanför ' + JSON.stringify(v.faktorLiten) + ': ' + t.display);
      krav(t.answer === t.m * t.d, 'facit: ' + t.display);
      krav(t.m % 10 >= 3, 'stora faktorns ental < 3: ' + t.display);
      if(rakne === 'mult-fler') krav(t.d % 10 >= 3, 'lilla faktorns ental < 3: ' + t.display);
    } else if(rakne === 'oka-minska' || rakne === 'bakifran'){
      krav(inom(t.b, v.subtrahend), 'subtrahend utanför ' + JSON.stringify(v.subtrahend) + ': ' + t.display);
      krav(t.a <= v.minuend.max, 'minuend > ' + v.minuend.max + ': ' + t.display);
      krav(t.answer === t.a - t.b, 'facit: ' + t.display);
      if(v.resultat && v.resultat.differens) krav(t.answer >= v.resultat.differens.min, 'differens < ' + v.resultat.differens.min + ': ' + t.display);
      if(v.flyttsiffra) krav(t.b % 10 >= v.flyttsiffra.min, 'subtrahendens flyttsiffra < ' + v.flyttsiffra.min + ': ' + t.display);
      krav(t.b % 10 !== 0, 'subtrahenden redan rund: ' + t.display);
      if(v.olika === 'flyttsiffra') krav(t.a % 10 !== t.b % 10, 'flyttsiffrorna lika: ' + t.display);
      krav(t.flytt === 10 - (t.b % 10) && (t.b + t.flytt) % 10 === 0, 'flytten gör inte subtrahenden rund: ' + t.display);
      if(v.vaxling) krav(t.a % 10 < t.b % 10, 'ingen växling (minuendens flyttsiffra ≥ subtrahendens): ' + t.display);
      if(v.minuend.flyttsiffra) krav(t.a % 10 >= v.minuend.flyttsiffra.min, 'minuendens flyttsiffra < ' + v.minuend.flyttsiffra.min + ': ' + t.display);
      if(v.forstaSteg) krav(t.flytt >= v.forstaSteg.min, 'första steget < ' + v.forstaSteg.min + ': ' + t.display);
      if(rakne === 'bakifran') krav(t.nextTio === t.b + t.flytt && t.nextTio < t.a, 'nästa runda tal ligger inte mellan termerna: ' + t.display);
    } else if(rakne === 'div'){
      krav(inom(t.N, v.taljare), 'täljare utanför ' + JSON.stringify(v.taljare) + ': ' + t.display);
      krav(inom(t.n, v.namnare), 'nämnare utanför ' + JSON.stringify(v.namnare) + ': ' + t.display);
      krav(t.N === t.Q * t.n && t.answer === t.Q, 'facit/kvot ej heltal: ' + t.display);
      if(v.minnessiffra) krav(harMinnessiffra(t.N, t.n), 'ingen minnessiffra: ' + t.display);
    }
    return fel;
  }

  var API = { gen:gen, omgang:omgang, kontrollera:kontrollera, stat:stat, band:function(r){ return SV.UPPST_BAND[r]; },
              maxNiva:function(r){ return Object.keys(SV.UPPST_BAND[r].nivaer).length; }, decStr:decStr };
  if(typeof module !== 'undefined' && module.exports) module.exports = API;
  if(typeof window !== 'undefined') window.UppstBand = API;
})();
