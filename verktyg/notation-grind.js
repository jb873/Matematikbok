/* notation-grind.js — GRINDEN mot K-G och K-I (KONVENTIONER.md §3).
   ────────────────────────────────────────────────────────────────────────────────────────────────
   Principen bakom båda: MELLANRUM BETYDER OPERATION, TÄTT IHOP BETYDER DELAR SOM HÖR SAMMAN.

     K-G  Mellanrum kring BINÄRA räknetecken ("5 + 4", "3x − 6", "3 · x"), ingen luft där delarna
          hör ihop: förtecken ("−5"), koefficient mot parentes ("2(3x − 6)") och parentesen mot sitt
          innehåll ("(3x − 6)").
     K-I  Blandad form skrivs tätt: heltalet står direkt mot det staplade bråket, utan mellanrum.

   K-H (bråk staplas, enhet behåller snedstrecket) mäts av `minus-grind.js` — dess bråkben gör redan
   precis det, med samma gräns mellan bråk och enhet. Två grindar som mäter samma sak glider isär.

   TVÅ MÄTREGLER SOM KOSTADE 800 FALSKA BROTT INNAN DE SATT:
     · TEXTNODEN ÄR ENHETEN, inte raden. Mellan två ELEMENT är mellanrummet layout (flex-gap), inte
       ett tecken: en läsning som klistrar ihop elementen ser "567=▢" där eleven ser "567 = ▢".
     · ETT FÖRTECKEN är ett tecken vars närmast föregående tecken är "(", ett räknetecken eller
       ingenting — och "ingenting" gäller bara om varken noden eller dess element har en granne
       till vänster. "5x − 7" och "▢ − 4" är binära.

   KEDJAN (balansmetoden, Joachim 2026-10-21): bladet är .eq-kort och det staplade bråket .seg-brak —
   uppgiftens led mäts som all annan mattetext, och bråket räknas med i K-I.

     K-L  Matematikens siffror är raka och står på samma linje (Joachim 2026-11-02). Cormorant
          Garamond ritar gammaldags siffror som standard — 3, 4, 5, 7, 9 under linjen, 6 och 8 över,
          1 och 2 låga — och då står "12" och "4 + 8" ojämnt. Regeln bor EN gång i fonts/fonts.css.
          Två ben, och båda behövs:
            EGENSKAPEN  varje synlig siffertext, ruta och knapp på bladet och i knappsatsen har
                        font-variant-numeric med lining-nums. Sidans och bladets rubriker (h1, h2)
                        får behålla typsnittets siffror och mäts inte; testfrågans titel är en h3
                        och bär uppgiftens tal.
            BLÄCKET     siffrorna i samma rad har samma över- och underkant. En Range hittar varje
                        siffra och raden, men dess ruta är typsnittets — lika hög för "1" som för "7"
                        vad som än ritas. Bläcket läses därför ur en skärmdump av raden (cdp-kor
                        --skarm). Alla tio siffror mäts, inte bara 1, 4, 7, 8: med dem blev nästan
                        ingen rad på d4 jämförbar. Tolerans max(1,5 px, 8 % av teckenstorleken).
                        Kalibrerat: raka siffror 0,3–0,5 px; gammaldags minst 3 px (knappsatsens
                        7-8-9: 3,0 px i topp, 4,7 px i botten; d4 upp till 6,5 px). Raka siffror
                        når 1,5 px på en rad med ett staplat bråk (åttans steg 1, "2x/3 − 5 = 7"):
                        Range-rutorna är identiska, men texten rastreras en pixel förskjuten intill
                        bråket, och 5:ans runda botten lägger till en halv.
          Egenskapen ensam går att lura (font-feature-settings "onum" ritar gammalt med lining-nums
          kvar), bläcket ensamt ser bara rader med två olika siffror. Därför två motprov.

   Kör:  node verktyg/notation-grind.js [--sida d3] [--bredd 1366x768] [--glyfer] [--spara-bild mapp]
                                        [--sabba mellanrum|fortecken|blandad|siffror|onum]
   Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const LAS_UPP = require('./niva-las-upp').snutt;   // nivåstegen upplåsta innan mätning
const MP = require('./matpunkt').skapa('notation-grind.js');   // V14
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.alla())) process.exit(0);
const BARA  = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const BREDD = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--bredd'));
const SPARA_BILD = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--spara-bild'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
const PRE = `(function(){ var s = 0x2F6E2B1; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); }); try { localStorage.clear(); } catch(e){} })();`;

const PROBE = `(async function(){
  var SABBA = ${JSON.stringify(SABBA)};
  var ut = { onerr: window.__onerr || null, blad: [], noter: [] };
  var sov = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  try { await document.fonts.ready; } catch(e){}
  function synlig(e){ return e.getClientRects && e.getClientRects().length > 0; }
  var TERM_F = '0-9xyabcn\\\\)', TERM_E = '0-9xyabcn\\\\(';

  /* K-L-SABOTAGEN. siffror: regeln tas bort ur fonts.css, precis den som ska bära K-L.
     onum: glyferna blir gammaldags medan lining-nums står kvar — bara bläcket ser det. */
  if(SABBA === 'siffror'){
    var tagna = 0;
    Array.prototype.forEach.call(document.styleSheets, function(ss){
      if(!/fonts\\/fonts\\.css$/.test(ss.href || '')) return;
      try { for(var i = ss.cssRules.length - 1; i >= 0; i--) if(/lining-nums/.test(ss.cssRules[i].cssText)){ ss.deleteRule(i); tagna++; } }
      catch(e){ ut.noter.push('SABBA: fonts.css gick inte att läsa (' + e.message + ')'); }
    });
    ut.noter.push('SABBA: tog bort ' + tagna + ' regel med lining-nums ur fonts.css');
  }
  if(SABBA === 'onum'){
    var st = document.createElement('style');
    st.textContent = '.ovn-sheet *, .ak8-sheet *, .eq-kort *, .prob-kort *, .keypad * { font-feature-settings: "onum" 1, "lnum" 0 !important; }';
    document.head.appendChild(st);
    ut.noter.push('SABBA: font-feature-settings "onum" — gammaldags glyfer, lining-nums står kvar');
  }

  /* ── K-L: SIFFRORNA ─────────────────────────────────────────────────────────────────────────
     Rubriker får behålla typsnittets siffror, navigeringen är ingen matematik. */
  var LNUM_HOPPA = '.nr-lager, .blad-nav, .blad-subnav, h1, h2';
  // Knappsatsen mäts för sig, en gång per sida — på spaltsidorna ligger den inuti bladet.
  function hoppa(m, rot){ return m.closest(LNUM_HOPPA) || (!rot.matches('.keypad') && m.closest('.keypad')); }
  var SKALA = 2;   // två bildpunkter per CSS-px: halvpixelupplösning på bläcket
  var VISA_GLYFER = ${JSON.stringify(args.includes('--glyfer'))};   // --glyfer: varje siffra i ett brott, med element och bläck
  var SPARA_BILD = ${JSON.stringify(args.includes('--spara-bild'))};  // --spara-bild <mapp>: skärmdumpen bakom ett bläckbrott
  ut.bilder = [];
  function sigAv(el){ var c = el.className; c = c && c.baseVal !== undefined ? c.baseVal : c;
    return el.tagName.toLowerCase() + (c ? '.' + String(c).trim().split(/\\s+/)[0] : ''); }

  // EGENSKAPEN: synlig siffertext, varje ruta och varje sifferknapp bär lining-nums.
  function egenskap(b, rot){
    var miss = {};
    function prova(el, txt){
      b.siffror++;
      if(/lining-nums/.test(getComputedStyle(el).fontVariantNumeric)) return;
      var k = (el.parentElement ? sigAv(el.parentElement) + '>' : '') + sigAv(el);
      (miss[k] = miss[k] || { n: 0, ex: txt }).n++;
    }
    var g = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT, null), n;
    while((n = g.nextNode())){
      var m = n.parentElement;
      if(!m || m.tagName === 'INPUT' || !/[0-9]/.test(n.nodeValue) || !synlig(m) || hoppa(m, rot) || m.closest('button')) continue;
      prova(m, n.nodeValue.trim().slice(0, 20));
    }
    Array.prototype.forEach.call(rot.querySelectorAll('input, textarea, select, button'), function(el){
      if(!synlig(el) || /^(hidden|checkbox|radio)$/.test(el.type) || hoppa(el, rot)) return;
      if(el.tagName === 'BUTTON' && !/[0-9]/.test(el.textContent)) return;
      prova(el, el.tagName === 'BUTTON' ? el.textContent.trim().slice(0, 20) : '[ruta]');
    });
    Object.keys(miss).forEach(function(k){
      b.brott.push('K-L UTAN LINING-NUMS: ' + miss[k].n + ' × ' + k + ' (t.ex. "' + miss[k].ex + '")');
    });
  }

  /* BLÄCKET: Range hittar siffran och raden; skärmdumpen visar var den faktiskt ritas.
     SIFFRAN MÄTS ENSAM. Första svepet fällde rader där siffrorna var raka: kursivt y svänger in
     under 3:an i "3y", en parentes når in över 2:an, tallinjens streck korsar etiketten "100". Under
     skärmdumpen blir därför allt genomskinligt utom de mätta siffrorna, som ritas med en CSS-
     markering (Range-baserad, ändrar bara färg — inget flyttar sig). SVG-text ritas med fill och
     syns i stället genom sitt eget element; figurens linjer blir genomskinliga. */
  // :not(#…) ger id-specificitet utan id på sidan — rutornas egna "border-color … !important"
  // (rätt/fel-lägena) vann annars och ritade gröna kanter genom knappsatsen. Övergångarna stängs
  // av: rutornas kantfärg tonar på .15 s, och skärmdumpen fångade den halvvägs.
  var ISO = 'html.kl-isolera:not(#kl-a):not(#kl-b)';
  var ISOLERA = document.createElement('style');
  ISOLERA.textContent = ISO + ', ' + ISO + ' body { background: #fff !important; }'
    + ' ' + ISO + ' body *, ' + ISO + ' body *::before, ' + ISO + ' body *::after, ' + ISO + ' body *::placeholder, ' + ISO + ' body *::marker'
    + ' { color: transparent !important; -webkit-text-fill-color: transparent !important; -webkit-text-stroke-color: transparent !important;'
    + ' background: transparent !important; border-color: transparent !important; box-shadow: none !important; outline-color: transparent !important;'
    + ' text-decoration-color: transparent !important; text-shadow: none !important; fill: transparent !important; stroke: transparent !important;'
    + ' caret-color: transparent !important; transition: none !important; }'
    + ' ' + ISO + ' body :is(img, canvas, video, iframe) { visibility: hidden !important; }'
    + ' ' + ISO + ' body [data-kl-visa] { fill: #000 !important; }'
    + ' ::highlight(kl-siffror) { color: #000; -webkit-text-fill-color: #000; }';
  document.head.appendChild(ISOLERA);
  async function bild(clip, glyfer){
    var hl = new Highlight(), svg = [];
    glyfer.forEach(function(g){
      if(g.el instanceof SVGElement){ g.el.setAttribute('data-kl-visa', ''); svg.push(g.el); } else hl.add(g.range); });
    CSS.highlights.set('kl-siffror', hl);
    document.documentElement.classList.add('kl-isolera');
    await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
    var b64;
    try { b64 = await window.__skarm({ x: clip.x, y: clip.y, width: clip.w, height: clip.h, scale: SKALA }); }
    finally {
      document.documentElement.classList.remove('kl-isolera'); CSS.highlights.delete('kl-siffror');
      svg.forEach(function(e){ e.removeAttribute('data-kl-visa'); });
    }
    var img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    var c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    var x = c.getContext('2d'); x.drawImage(img, 0, 0);
    return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data, b64: b64 };
  }
  // En rad = samma baslinje (Range-rutans underkant), samma storlek, samma typsnitt — och minst två
  // OLIKA siffror, annars finns inget att jämföra. Alla tio mäts: med bara 1, 4, 7 och 8 blev nästan
  // ingen rad på d4 jämförbar ("x + 5 = 12" har en av dem).
  function rader(rot){
    var gr = {}, g = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT, null), n;
    while((n = g.nextNode())){
      var m = n.parentElement, s = n.nodeValue;
      if(!m || !/[0-9]/.test(s) || !synlig(m) || hoppa(m, rot)) continue;
      var cs = getComputedStyle(m), fs = parseFloat(cs.fontSize);
      for(var i = 0; i < s.length; i++){
        if('0123456789'.indexOf(s[i]) < 0) continue;
        var r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
        var bx = r.getBoundingClientRect(); if(!bx.width || !bx.height) continue;
        var k = Math.round(bx.bottom + scrollY) + '|' + fs + '|' + cs.fontFamily;
        (gr[k] = gr[k] || { fs: fs, glyfer: [] }).glyfer.push({ ch: s[i], el: m, range: r });
      }
    }
    return Object.keys(gr).map(function(k){ return gr[k]; }).filter(function(x){
      var o = {}; x.glyfer.forEach(function(y){ o[y.ch] = 1; }); return Object.keys(o).length >= 2; });
  }
  // Siffran är mätbar om den ligger i vyn och inget annat ligger över den (fast knappsats, tips-knapp).
  function framme(gl){
    var b = gl.range.getBoundingClientRect();
    if(b.top < 0 || b.bottom > innerHeight || b.left < 0 || b.right > innerWidth) return null;
    var e = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2);
    return e && (e === gl.el || gl.el.contains(e) || e.contains(gl.el)) ? b : null;
  }
  function blak(im, clip, b){
    var x0 = Math.max(0, Math.ceil((b.left - clip.vx + 0.5) * SKALA)), x1 = Math.min(im.w - 1, Math.floor((b.right - clip.vx - 0.5) * SKALA));
    var y0 = Math.max(0, Math.floor((b.top - clip.vy) * SKALA)), y1 = Math.min(im.h - 1, Math.ceil((b.bottom - clip.vy) * SKALA) - 1);
    if(x1 < x0 || y1 < y0) return null;
    /* Isolerad bild: vit botten, svarta siffror. Bläck = mörk och grå pixel, mätt mot fast vitt. Ett
       bakgrundsprov ur bilden gav ett ojämnt fel (1 körning av 12 på d10): var hörnpixeln mörk räknades
       varje vit pixel som bläck. Färgade rester (en grön rutkant) är inte heller bläck. */
    function blackPx(x, y){ var k = (y * im.w + x) * 4, r = im.d[k], g = im.d[k + 1], bl = im.d[k + 2];
      return (r + g + bl) / 3 < 140 && Math.max(r, g, bl) - Math.min(r, g, bl) < 60; }
    var topp = -1, botten = -1;
    for(var y = y0; y <= y1; y++) for(var x = x0; x <= x1; x++){
      if(blackPx(x, y)){ if(topp < 0) topp = y; botten = y; break; }
    }
    return topp < 0 ? null : { topp: clip.vy + topp / SKALA, botten: clip.vy + (botten + 1) / SKALA };
  }
  async function blacket(b, rot){
    var vantar = rader(rot);
    while(vantar.length){
      var r0 = vantar[0];
      // 'instant': sidorna rullar mjukt, och då flyttar sig raden medan skärmdumpen tas.
      r0.glyfer[0].el.scrollIntoView({ block: 'center', behavior: 'instant' });
      for(var vila = 0, sy = -1; vila < 20 && sy !== scrollY; vila++){ sy = scrollY; await sov(30); }
      var framma = [], kvar = [];
      vantar.forEach(function(rad){
        var bx = rad.glyfer.map(framme);
        if(bx.every(function(x){ return x; })){ rad.bx = bx; framma.push(rad); } else kvar.push(rad);
      });
      if(framma.indexOf(r0) < 0){
        b.omatbara++; kvar = kvar.filter(function(x){ return x !== r0; });
        if(!b.omatbarEx){ var rb = r0.glyfer[0].range.getBoundingClientRect(), ue = document.elementFromPoint((rb.left + rb.right) / 2, (rb.top + rb.bottom) / 2);
          b.omatbarEx = '"' + String(r0.glyfer[0].el.textContent).trim().slice(0, 16) + '" vid y ' + Math.round(rb.top) + ', överst: ' + (ue ? sigAv(ue) : 'inget'); }
      }
      if(framma.length){
        var l = 1e9, t = 1e9, r = -1e9, u = -1e9;
        framma.forEach(function(rad){ rad.bx.forEach(function(x){ l = Math.min(l, x.left); t = Math.min(t, x.top); r = Math.max(r, x.right); u = Math.max(u, x.bottom); }); });
        var clip = { vx: Math.max(0, Math.floor(l) - 2), vy: Math.max(0, Math.floor(t) - 2) };
        clip.w = Math.ceil(r) + 2 - clip.vx; clip.h = Math.ceil(u) + 2 - clip.vy;
        clip.x = clip.vx + scrollX; clip.y = clip.vy + scrollY;
        var im = await bild(clip, [].concat.apply([], framma.map(function(rad){ return rad.glyfer; })));
        framma.forEach(function(rad){
          var topp = [], botten = [], tecken = {}, visa = '', per = [];
          rad.bx.forEach(function(x, i){ var v = blak(im, clip, x); if(!v) return;
            topp.push(v.topp); botten.push(v.botten); tecken[rad.glyfer[i].ch] = 1; visa += rad.glyfer[i].ch;
            var gcs = getComputedStyle(rad.glyfer[i].el);
            per.push(rad.glyfer[i].ch + ' ' + sigAv(rad.glyfer[i].el) + ' ' + gcs.fontFamily.split(',')[0].replace(/["']/g, '')
              + '/' + gcs.fontVariantNumeric + ' ↑' + (v.topp - x.top).toFixed(1) + ' ↓' + (v.botten - x.top).toFixed(1)); });
          if(Object.keys(tecken).length < 2){ b.omatbara++; b.omatbarEx = b.omatbarEx || 'inget bläck i "' + String(rad.glyfer[0].el.textContent).trim().slice(0, 16) + '"'; return; }
          b.rader++;
          var tol = Math.max(1.5, 0.08 * rad.fs);
          var dt = Math.max.apply(null, topp) - Math.min.apply(null, topp), db = Math.max.apply(null, botten) - Math.min.apply(null, botten);
          b.blakMax = Math.max(b.blakMax, dt, db);
          if((dt > tol || db > tol) && SPARA_BILD && ut.bilder.length < 8 && ut.bilder.indexOf(im.b64) < 0) ut.bilder.push(im.b64);
          if(dt > tol || db > tol)
            b.brott.push('K-L SIFFROR PÅ OLIKA HÖJD: "' + String(rad.glyfer[0].el.textContent).replace(/\\s+/g, ' ').trim().slice(0, 26)
              + '" (' + visa + ', ' + rad.fs + ' px): överkanten skiljer ' + dt.toFixed(1) + ' px, underkanten ' + db.toFixed(1)
              + ' px — tolerans ' + tol.toFixed(1) + (VISA_GLYFER ? '\\n         ' + per.join('\\n         ') : ''));
        });
      }
      vantar = kvar;
    }
  }
  async function siffror(b, rot){
    b.siffror = 0; b.rader = 0; b.omatbara = 0; b.blakMax = 0;
    egenskap(b, rot);
    await blacket(b, rot);
  }

  // Problemlösningens kort mäts bara för K-L: K-G och K-I har aldrig gällt den ytan i grinden.
  async function matSheet(namn, sh){
    var b = { blad: namn, texter: 0, brak: 0, brott: [] };
    if(sh.matches('.prob-kort')){ await siffror(b, sh); ut.blad.push(b); return; }

    /* SABOTAGEN återskapar precis de fel reglerna finns för — i DOM, efter renderingen, så att
       de inte kan städas bort av nästa bindning. */
    if(SABBA === 'mellanrum'){
      var n0 = hittaText(sh, /[0-9xyabcn] [+\\u2212\\u00b7] [0-9xyabcn]/);
      if(n0){ n0.nodeValue = n0.nodeValue.replace(/([0-9xyabcn]) ([+\\u2212\\u00b7]) ([0-9xyabcn])/, '$1$2$3');
        ut.noter.push('SABBA: tog bort luften kring ett binart tecken'); }
    }
    if(SABBA === 'fortecken'){
      var n1 = hittaText(sh, /\\(\\u2212[0-9xyabcn]/);
      if(n1){ n1.nodeValue = n1.nodeValue.replace(/\\((\\u2212)([0-9xyabcn])/, '( $1 $2');
        ut.noter.push('SABBA: satte luft efter ett fortecken'); }
      else {
        var n1b = hittaText(sh, /[0-9xyabcn]\\)/);
        if(n1b){ n1b.nodeValue = n1b.nodeValue.replace(/([0-9xyabcn])\\)/, '$1 )');
          ut.noter.push('SABBA: satte luft innanfor parentesen'); }
      }
    }
    if(SABBA === 'blandad'){
      var br = Array.prototype.filter.call(sh.querySelectorAll('.ovn-brak, .brak, .seg-brak'), synlig)[0];
      if(br){ br.parentNode.insertBefore(document.createTextNode('2\\u00a0'), br);
        ut.noter.push('SABBA: satte ett heltal med mellanrum fore ett stablat brak'); }
    }

    var gang = document.createTreeWalker(sh, NodeFilter.SHOW_TEXT, null), nod;
    while((nod = gang.nextNode())){
      var mor = nod.parentElement;
      if(!mor || !synlig(mor) || mor.tagName === 'INPUT') continue;
      if(mor.closest('.ovn-brak, .brak, .seg-brak, .pot, sup, .keypad, .nr-lager, .blad-nav, .blad-subnav')) continue;
      var s = String(nod.nodeValue).replace(/\\u00a0/g, ' ');
      if(!/[0-9xyabcn]/.test(s)) continue;
      b.texter++;
      // Tecknet står först i raden bara om varken noden eller dess element har en granne.
      var forst = !(nod.previousSibling || mor.previousSibling);
      var m;

      var r1 = new RegExp('([' + TERM_F + '])([+\\\\u2212\\\\u00b7\\\\u00d7=])(?=[' + TERM_E + '])', 'g');
      while((m = r1.exec(s)))
        b.brott.push('K-G UTAN LUFT KRING BINART TECKEN: "' + m[0] + '" i "' + s.trim().slice(0, 34) + '"');

      var r2 = new RegExp('(^|[(+\\\\u2212\\\\u00b7\\\\u00d7=,])\\\\s*\\\\u2212\\\\s+[0-9xyabcn]', 'g');
      while((m = r2.exec(s))){
        if(m.index === 0 && /^\\s*\\u2212/.test(m[0]) && !forst) continue;
        b.brott.push('K-G LUFT EFTER FORTECKEN: "' + m[0].replace(/\\s+/g, ' ').trim()
          + '" i "' + s.trim().slice(0, 34) + '"');
      }

      // ORDGRÄNS: "Beräkna (9 − 4)" är ett ord före en parentes, inte en koefficient.
      var r3 = /(^|[^0-9a-zA-ZåäöÅÄÖ])([0-9xyabcn])\\s+\\(([^)]*)\\)/g;
      while((m = r3.exec(s))){
        if(/^[\\s0-9xyabcn+\\u2212\\u00b7\\u00d7\\/,.]+$/.test(m[3]) && /[0-9xyabcn]/.test(m[3]))
          b.brott.push('K-G LUFT MELLAN KOEFFICIENT OCH PARENTES: "' + m[0].slice(0, 16)
            + '" i "' + s.trim().slice(0, 34) + '"');
      }

      var r4 = new RegExp('\\\\(\\\\s+[0-9xyabcn\\\\u2212]|[' + TERM_F + ']\\\\s+\\\\)', 'g');
      while((m = r4.exec(s)))
        b.brott.push('K-G LUFT INNANFOR PARENTESEN: "' + m[0] + '" i "' + s.trim().slice(0, 34) + '"');
    }

    /* K-I: blandad form. Ett heltal direkt före ett staplat bråk hör ihop med det — mellanrummet
       (hårt eller vanligt) är brottet. Står ett räknetecken emellan är bråket en egen term. */
    Array.prototype.forEach.call(sh.querySelectorAll('.ovn-brak, .brak, .seg-brak'), function(brak){
      if(!synlig(brak)) return;
      b.brak++;
      var f = brak.previousSibling;
      if(f && f.nodeType === 3 && /[0-9]\\s+$/.test(f.nodeValue))
        b.brott.push('K-I BLANDAD FORM MED MELLANRUM: "' + f.nodeValue.replace(/\\s+$/, '_').slice(-8)
          + '[brak]" — heltalet hor ihop med brakdelen');
    });
    await siffror(b, sh);
    ut.blad.push(b);
  }

  function hittaText(rot, monster){
    var g = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT, null), n;
    while((n = g.nextNode())){
      var mor = n.parentElement;
      if(!mor || !synlig(mor) || mor.tagName === 'INPUT') continue;
      if(mor.closest('.ovn-brak, .brak, .seg-brak, .pot, sup, .keypad')) continue;
      if(monster.test(n.nodeValue)) return n;
    }
    return null;
  }

  // EN FLIK I TAGET, mätt medan fliken är framme. Nivåstegen räknas som flikar.
  ${LAS_UPP}
  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
  var sedda = [];
  var YTOR = '.ovn-sheet, .ak8-sheet, .eq-kort, .prob-kort';
  for(var ki = 0; ki < (nav.length || 1); ki++){
    var knapp = nav[ki];
    if(knapp){ if(knapp.disabled) continue; knapp.click(); }
    var ytor = Array.prototype.slice.call(document.querySelectorAll(YTOR));
    for(var yi = 0; yi < ytor.length; yi++){
      var sh = ytor[yi];
      if(sedda.indexOf(sh) >= 0 || !synlig(sh)) continue;
      if(sh.matches('.prob-kort') && sh.parentElement.closest('.ovn-sheet, .ak8-sheet, .eq-kort')) continue;
      sedda.push(sh);
      var vard = sh.parentElement || sh;
      var stegKnappar = function(){ return vard.querySelectorAll('.niva-rad .niva-btn'); };
      var namnNu = function(nr){
        var el = vard.querySelector('.ovn-sheet') || sh, h2 = el.querySelector('h2, .niva-rubrik');
        var bas = h2 ? String(h2.textContent).replace(/\\s+/g, ' ').trim() : 'blad ' + sedda.length;
        if(bas.length > 30) bas = '…' + bas.slice(-29);
        return nr ? bas.slice(0, 24) + ' niva ' + nr : bas;
      };
      var steg = stegKnappar().length;
      if(steg < 2){ await matSheet(namnNu(0), sh); continue; }
      for(var n = 0; n < steg; n++){
        var nb = stegKnappar()[n]; if(!nb || nb.disabled) continue;
        nb.click();
        await matSheet(namnNu(n + 1), vard.querySelector('.ovn-sheet') || sh);
      }
    }
  }

  /* KNAPPSATSEN, en gång per sida, på första bladet: en ruta tar fokus, som när eleven börjar skriva.
     Efter slingan står sista bladet framme, och på spaltsidorna är det ofta ett utan rutor — då
     syns ingen knappsats, och den som "hittas" är en dold kopia med tangenterna vid y 0. */
  // Sidor med flera blad har en knappsats per blad, staplade på samma plats: den som mäts är den
  // vars tangent ligger överst.
  function synligKp(){ return Array.prototype.filter.call(document.querySelectorAll('.keypad'), function(k){
    var r = k.getBoundingClientRect(), t = k.querySelector('.kp-key'); if(!synlig(k) || !t || r.height <= 0) return false;
    var tr = t.getBoundingClientRect(), e = document.elementFromPoint((tr.left + tr.right) / 2, (tr.top + tr.bottom) / 2);
    return !!e && k.contains(e); })[0]; }
  if(nav[0] && !nav[0].disabled){ nav[0].click(); await sov(150); }
  var kp = synligKp();
  if(!kp){
    var forsta = Array.prototype.filter.call(document.querySelectorAll(YTOR.split(', ').map(function(s){ return s + ' input'; }).join(', ')), synlig)[0];
    if(forsta){ forsta.focus(); forsta.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); await sov(250); kp = synligKp(); }
  }
  // Knappsatsen glider in: mät först när tangentens läge står still två avläsningar i rad.
  if(kp){ for(var st = 0, fy = null; st < 30; st++){ var ty = kp.querySelector('.kp-key').getBoundingClientRect().top; if(ty === fy) break; fy = ty; await sov(60); } }
  if(kp){ var kb = { blad: 'knappsats', texter: 0, brak: 0, brott: [] }; await siffror(kb, kp); ut.blad.push(kb); }
  return ut;
})()`;

let fel = 0, texter = 0, brak = 0, blad = 0, siffror = 0, rader = 0, blakMax = 0;
console.log('NOTATION-GRIND — K-G mellanrum kring räknetecken · K-I blandad form tätt ihop · K-L raka siffror'
  + (BREDD ? '  [' + BREDD + ']' : '') + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');

Sidor.alla().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const tmp = path.join(os.tmpdir(), 'notation-' + process.pid + '.js');
  const pre = path.join(os.tmpdir(), 'notation-pre-' + process.pid + '.js');
  fs.writeFileSync(tmp, PROBE); fs.writeFileSync(pre, PRE);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), tmp,
    '--pre', pre, '--vanta-pa', 'blad', '--timeout', '240000', '--skarm']
    .concat(BREDD ? ['--viewport', BREDD, '--size', BREDD] : []), { encoding: 'utf8', timeout: 300000 });
  let ut = null; try { ut = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!ut){ fel++; console.log('✗ ' + sida + ': inget svar — ' + (r.stderr || '').trim().split('\n').pop()); return; }
  if(ut.onerr && ut.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + ut.onerr.join(' | ')); }
  (ut.noter || []).forEach(n => console.log('   ' + n));
  if(SPARA_BILD) (ut.bilder || []).forEach((b64, i) => {
    const fil = path.join(path.resolve(SPARA_BILD), sida.replace(/\/index\.html$/, '').replace(/[\/.]/g, '-') + '-' + (i + 1) + '.png');
    fs.mkdirSync(path.dirname(fil), { recursive: true }); fs.writeFileSync(fil, Buffer.from(b64, 'base64'));
    console.log('   skärmdump bakom bläckbrott: ' + fil);
  });
  MP.rakna(sida, (ut.blad || []).length);
  (ut.blad || []).forEach(b => {
    blad++; texter += b.texter; brak += b.brak; siffror += b.siffror; rader += b.rader; blakMax = Math.max(blakMax, b.blakMax);
    MP.varde(sida, b.blad, { texter: b.texter, brak: b.brak, siffror: b.siffror, rader: b.rader });
    fel += b.brott.length;
    console.log((b.brott.length ? '✗ ' : '✓ ') + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad
      + ': ' + b.texter + ' mattetexter, ' + b.brak + ' bråk, ' + b.siffror + ' sifferelement, '
      + b.rader + ' rader bläckmätta' + (b.rader ? ' (största skillnad ' + b.blakMax.toFixed(1) + ' px)' : '')
      + (b.omatbara ? ', ' + b.omatbara + ' omätbara (' + b.omatbarEx + ')' : '')
      + (b.brott.length ? '\n     ' + b.brott.slice(0, 4).join('\n     ')
         + (b.brott.length > 4 ? '\n     … och ' + (b.brott.length - 4) + ' till' : '') : ''));
  });
  try { fs.unlinkSync(tmp); fs.unlinkSync(pre); } catch(e){}
});

fel += MP.granska();   // V14
console.log('\n' + (fel ? '✗ NOTATION-GRIND RÖD (' + fel + ')' : '✓ NOTATION-GRIND GRÖN')
  + ' · ' + blad + ' blad, ' + texter + ' mattetexter, ' + brak + ' bråk, ' + siffror + ' sifferelement, '
  + rader + ' rader bläckmätta (största skillnad ' + blakMax.toFixed(1) + ' px)');
process.exit(fel ? 1 : 0);
