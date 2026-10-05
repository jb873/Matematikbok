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

   Kör:  node verktyg/brytning-grind.js [--sida d3] [--sabba streck|grupp|bred|par]
         --sabba återskapar felet regeln finns för → benet MÅSTE fälla. Ett motprov som inte kan
         fälla bevisar ingenting.

   Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
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
  var ut = { onerr: window.__onerr || null, blad: [], noter: [] };
  var MIN_KONTRAST = 2.0;

  function synlig(e){ return e.getClientRects().length > 0; }
  function kort(t){ return String(t).replace(/\\s+/g, ' ').trim(); }

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
    return null;
  }

  function matSheet(namn, sh){
    var b = { blad: namn, rader: 0, grupper: 0, rutor: 0, brott: [] };
    var bak = bakgrund(sh);

    /* SABOTAGEN återskapar precis de tre fel reglerna finns för. */
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
    ut.blad.push(b);
  }

  // EN FLIK I TAGET, och matningen MEDAN fliken ar framme: ett dolt blad har inga matt.
  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
  var sedda = [];
  (nav.length ? nav : [null]).forEach(function(knapp){
    if(knapp){ if(knapp.disabled) return; knapp.click(); }
    Array.prototype.forEach.call(document.querySelectorAll('.ovn-sheet, .ak8-sheet'), function(sh){
      if(sedda.indexOf(sh) >= 0 || !synlig(sh)) return;
      sedda.push(sh);
      var h = sh.querySelector('h2');
      var namn = h ? kort(h.textContent) : 'blad ' + sedda.length;
      matSheet(namn.length > 30 ? '…' + namn.slice(-29) : namn, sh);
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
    MP.varde(sida, b.blad, { rader: b.rader, grupper: b.grupper, rutor: b.rutor });
    fel += b.brott.length;
    console.log((b.brott.length ? '✗ ' : '✓ ') + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad
      + ': ' + b.rader + ' rader, ' + b.grupper + ' uppgifter, ' + b.rutor + ' rutor'
      + (b.brott.length ? '\n     ' + b.brott.slice(0, 4).join('\n     ')
         + (b.brott.length > 4 ? '\n     … och ' + (b.brott.length - 4) + ' till' : '') : ''));
  });
  try { fs.unlinkSync(tmp); fs.unlinkSync(pre); } catch(e){}
});

fel += MP.granska();   // V14: en sida i listan måste ge minst en mätpunkt
console.log('\n' + (fel ? '✗ BRYTNING-GRIND RÖD (' + fel + ')' : '✓ BRYTNING-GRIND GRÖN')
  + ' · ' + matta + ' blad, ' + rader + ' rader, ' + grupper + ' uppgifter, ' + rutor + ' rutor');
process.exit(fel ? 1 : 0);
