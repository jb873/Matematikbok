/* namnare-grind.js — GRINDEN mot "räknefelet": fel räknade där inga fel finns (order 2026-09-22).
   Regel: nämnaren i bladets "X av Y" = antalet SYNLIGA svarsenheter (åk8: svarselement med minst en synlig ruta/knapp;
   åk7: synliga rutor + valgrids). Inga dolda svarsenheter i DOM. Ett helt korrekt ifyllt blad ger full pott.
   Metod (riktig browser, seedad slump):
     ÅK8 (AK8_UI-blad) — två körningar per sida med SAMMA seed: (1) svara godtyckligt på allt + Kontrollera → facit per
     rad; (2) ny sida, fyll allt rätt från början ur facit (som en elev som kan) + Kontrollera. Bara rader vars facit
     proben FÖRSTÅR fylls (tal-listor, "… = svar", ordna/chip/valjflera, fri kedja med bråkknapp); övriga rapporteras
     som "ej täckt" (aldrig rött). RÖTT = nämnaren ≠ synliga svarsenheter · dold svarsenhet · en rad fylld ur facit
     som ändå blir ✗ ("facit godtas ej") · JS-fel.
     ÅK7/ÅK9 (blad-karna/blad-karna-b) — per .ovn-sheet (fliken/nav-knappen som visar bladet klickas fram): fyll ur
     data-attribut + Kontrollera. RÖTT = nämnaren > synliga rutor+grids · dold ruta/grid i visat blad · JS-fel.
     Nians öva-sidor har ingen X-av-Y-summering (fördjupningen räknar "rätt av besvarade") → ingår ej.
   Kör:  node verktyg/namnare-grind.js [--sida grunder] [--seeds 2]     Exit 1 vid rött. Noll nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2), arg = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const BARA = arg('--sida'), SEEDS = +(arg('--seeds') || 1);
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
const PRE = seed => `(function(){ var s = ${seed}; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); }); try { localStorage.clear(); } catch(e){} })();`;

// ── ÅK8 körning 1: svara godtyckligt, samla facit per blad/idx ──
const PROBE8_SAMLA = `(function(){
  var ut = { onerr: window.__onerr, blad: [] };
  function ev(el, t){ el.dispatchEvent(new Event(t, { bubbles:true })); }
  var knappar = Array.from(document.querySelectorAll('.blad-nav-btn'));
  function mat(namn){
    var mount = document.querySelector('[id^="sheet-"]') || document.querySelector('.ovn-sheet'); if(!mount) return;
    var kn = mount.querySelector('[data-kontroll]'); if(!kn) return;
    var svar = Array.from(mount.querySelectorAll(mount.querySelector('.ak8-svar[data-idx]') ? '.ak8-svar[data-idx]' : '.ak8-rad[data-idx]')), b = { blad: namn, facit: {} };
    function synlig(el){ return !!(el.offsetParent) && getComputedStyle(el).visibility !== 'hidden'; }
    svar.forEach(function(s){
      s.querySelectorAll('input').forEach(function(i){ i.value = '0'; ev(i, 'input'); });   // ALLA rutor, oavsett klass (fr-ruta-fyndet)
      var tal = s.querySelectorAll('.ak8-tal:not(.ak8-vf)'); if(tal.length && !s.querySelector('input')) tal.forEach(function(t){ t.click(); });
      var c1 = s.querySelector('.ak8-chip, .ak8-vf, .ak8-korval'); if(c1 && !s.querySelector('.sel')) c1.click();
    });
    kn.click();
    b.obesvarbara = [];   // svarsenheter med synlig ruta/knapp som INTE fick någon markering fast de fyllts → räknas i nämnaren men rättas aldrig
    svar.forEach(function(s){
      var r = s.closest('.ak8-rad') || s, f = r.querySelector('.ak8-fasit'), mk = r.querySelector('.ovn-mark');
      b.facit[s.dataset.idx] = { f: f ? f.textContent.replace(/^\\s*rätt:\\s*/, '').trim() : null, sup: !!(f && f.querySelector('sup')), ok: mk ? mk.textContent : null };
      var harEnhet = Array.prototype.some.call(s.querySelectorAll('input, .ak8-tal, .ak8-chip, .ak8-korval'), synlig);
      if(harEnhet && !mk && !s.querySelector('.ak8-mark-chip')) b.obesvarbara.push(r.textContent.replace(/\\s+/g, ' ').trim().slice(0, 40));
    });
    ut.blad.push(b);
  }
  if(knappar.length) knappar.forEach(function(k){ k.click(); mat(k.textContent.trim().slice(0, 28)); }); else mat('(enda)');
  return ut;
})()`;
// ── ÅK8 körning 2: fyll rätt från början ur facit, Kontrollera, mät ──
const PROBE8_FYLL = `(function(){
  var FACIT = __FACIT__;
  var ut = { onerr: window.__onerr, blad: [] };
  function ev(el, t){ el.dispatchEvent(new Event(t, { bubbles:true })); }
  function synlig(el){ return !!(el.offsetParent) && getComputedStyle(el).visibility !== 'hidden'; }
  function tal(s){ return (String(s).replace(/\\u2212/g, '-').match(/-?\\d+(?:,\\d+)?/g) || []); }
  var knappar = Array.from(document.querySelectorAll('.blad-nav-btn'));
  function mat(namn, bi){
    var mount = document.querySelector('[id^="sheet-"]') || document.querySelector('.ovn-sheet'); if(!mount) return;
    var kn = mount.querySelector('[data-kontroll]'); if(!kn) return;
    var fac = (FACIT[bi] || {}).facit || {};
    var svar = Array.from(mount.querySelectorAll(mount.querySelector('.ak8-svar[data-idx]') ? '.ak8-svar[data-idx]' : '.ak8-rad[data-idx]'));
    function harSynligEnhet(s){ return Array.prototype.some.call(s.querySelectorAll('input, .ak8-tal, .ak8-chip, .ak8-korval, .ak8-mark-chip'), synlig); }
    var b = { blad: namn, svar: svar.length, synligaSvar: svar.filter(harSynligEnhet).length, ejTackta: 0, fyllda: 0, fel: [] };
    var fyllda = [];
    svar.forEach(function(s, si){
      var F = fac[s.dataset.idx] || {}, ftxt = F.f || '', ins = Array.from(s.querySelectorAll('.ak8-in'));
      function ej(){ b.ejTackta++; }
      if(s.querySelector('.ak8-vf')){ s.querySelectorAll('.ak8-vf').forEach(function(x){ if(x.dataset.ratt === '1') x.click(); }); fyllda.push(si); return; }
      if(s.querySelector('.ak8-tal')){
        if(F.ok === '\\u2713'){ s.querySelectorAll('.ak8-tal').forEach(function(t){ t.click(); }); fyllda.push(si); return; }
        var ordn = ftxt.split(/\\s{2,}/).map(function(x){ return x.trim(); }).filter(Boolean); if(ordn.length < 2) ordn = ftxt.split(/\\s+/).filter(Boolean);
        var btns = Array.from(s.querySelectorAll('.ak8-tal')), anv = [], miss = false;
        ordn.forEach(function(v){ var bt = btns.find(function(x){ return anv.indexOf(x) < 0 && x.textContent.trim() === v; }); if(bt){ bt.click(); anv.push(bt); } else miss = true; });
        if(miss || anv.length !== btns.length) ej(); else fyllda.push(si); return; }
      if(s.querySelector('.ak8-chip')){ if(F.ok === '\\u2713'){ s.querySelector('.ak8-chip').click(); fyllda.push(si); return; } var chip = Array.from(s.querySelectorAll('.ak8-chip')).find(function(c){ return c.dataset.val === ftxt || c.textContent.trim() === ftxt; }); if(chip){ chip.click(); fyllda.push(si); } else ej(); return; }
      if(s.querySelector('.ak8-korval')){ if(F.ok === '\\u2713'){ s.querySelector('.ak8-korval').click(); fyllda.push(si); return; } var kv = Array.from(s.querySelectorAll('.ak8-korval')).find(function(c){ return c.textContent.trim() === ftxt; }); if(kv){ kv.click(); fyllda.push(si); } else ej(); return; }
      if(!ins.length){ ej(); return; }
      if(F.ok === '\\u2713'){ ins.forEach(function(i){ i.value = '0'; ev(i, 'input'); }); fyllda.push(si); return; }
      if(!ftxt || F.sup){ ej(); return; }
      if(s.classList.contains('ak8-rad-kedja')){   // fri kedja: mellanled som textuttryck + svar via bråkknappen (blandad: heltal före widgeten)
        var mm = ftxt.match(/rätt svar:\\s*(.+?)\\s*\\(/); var sv = (mm ? mm[1] : ftxt).trim(); var syn = ins.filter(function(i){ return !i.closest('.ak8-extra'); });
        if(syn.length < 2){ ej(); return; }
        var bm = sv.match(/^(-?)(?:(\\d+)\\s+)?(\\d+)\\/(\\d+)$/);
        syn[0].value = bm ? (bm[1] + (bm[2] ? bm[2] + '+' : '') + bm[3] + '/' + bm[4]) : sv; ev(syn[0], 'input');
        if(!bm){ if(!/^-?\\d+(,\\d+)?$/.test(sv)){ ej(); return; } syn[1].value = sv; ev(syn[1], 'input'); fyllda.push(si); return; }
        var kp = document.querySelector('.kp-key[data-key="frac"]'); if(!kp){ ej(); return; }
        syn[1].value = bm[1] + (bm[2] || ''); ev(syn[1], 'input'); syn[1].focus(); syn[1].dispatchEvent(new FocusEvent('focusin', { bubbles:true }));
        kp.dispatchEvent(new MouseEvent('mousedown', { bubbles:true, cancelable:true }));
        var cell = syn[1].closest('.ak8-cell'), ft = cell && cell.querySelector('.ak8-frt'), fn = cell && cell.querySelector('.ak8-frn');
        if(!ft || !fn){ ej(); return; }
        ft.value = bm[3]; ev(ft, 'input'); fn.value = bm[4]; ev(fn, 'input'); fyllda.push(si); return; }
      // Mellanleds-rader (d1: "= [mellanled] = [svar]", facit "8/0,1 = 8·10 / 0,1·10 = 80/1 = 80"):
      // båda cellerna rättas mot samma värde → fyll dem med facitets SISTA tal.
      if(s.querySelectorAll('.ak8-cell .ak8-exprtxt').length === 2 && ftxt.indexOf('=') > -1){
        var svans = ftxt.split('=').pop().trim().replace(/\\s+/g, '');   // det som står efter SISTA = ("420 000" → "420000", "9/16" behålls)
        if(/^[-\\u2212]?[0-9.,\\/]+$/.test(svans)){ ins.forEach(function(i){ i.value = svans; ev(i, 'input'); }); fyllda.push(si); return; }
      }
      var t = tal(ftxt.replace(/^t\\.ex\\.\\s*/, ''));
      if(/^t\\.ex\\./.test(ftxt) && ins.length === 1 && t.length){ ins[0].value = t[0]; ev(ins[0], 'input'); fyllda.push(si); return; }
      if(t.length === ins.length && ftxt.indexOf('=') < 0){ ins.forEach(function(i, k){ i.value = t[k]; ev(i, 'input'); }); fyllda.push(si); return; }
      if(ins.length === 1 && ftxt.indexOf('=') > -1 && t.length){ ins[0].value = t[t.length - 1]; ev(ins[0], 'input'); fyllda.push(si); return; }
      ej();
    });
    b.fyllda = fyllda.length;
    kn.click();
    var sm = mount.querySelector('[data-sammanf]'); b.sammanf = sm ? sm.textContent.replace(/\\s+/g, ' ').trim().slice(0, 70) : null;
    var m = b.sammanf && b.sammanf.match(/(\\d+) av (\\d+)/); if(m){ b.ratt = +m[1]; b.namnare = +m[2]; }
    var m2 = b.sammanf && b.sammanf.match(/alla (\\d+)/); if(m2){ b.ratt = b.namnare = +m2[1]; }
    fyllda.forEach(function(si){ var s = svar[si], r = s.closest('.ak8-rad') || s, mk = r.querySelector('.ovn-mark'); if(!mk || mk.textContent !== '\\u2713') b.fel.push(r.textContent.replace(/\\s+/g, ' ').trim().slice(0, 60) + ' | fyllt: ' + Array.from(s.querySelectorAll('.ak8-in')).map(function(i){ return i.value; }).join(',') + ' | facit: ' + ((fac[s.dataset.idx] || {}).f || '-')); });
    ut.blad.push(b);
  }
  if(knappar.length) knappar.forEach(function(k, i){ k.click(); mat(k.textContent.trim().slice(0, 28), i); }); else mat('(enda)', 0);
  return ut;
})()`;
// ── ÅK7/ÅK9 (blad-karna / blad-karna-b): per .ovn-sheet ──
const PROBE7 = `(function(){
  var ut = { onerr: window.__onerr, blad: [] };
  function ev(el, t){ el.dispatchEvent(new Event(t, { bubbles:true })); }
  function synlig(el){ return !!(el.offsetParent) && getComputedStyle(el).visibility !== 'hidden'; }
  function norm(s){ return String(s).replace(/\\s+/g, '').replace(/\\u2212/g, '-').replace(/[\\u00d7*]/g, '\\u00b7'); }
  function dec(s){ try { return decodeURIComponent(s); } catch(e){ return s; } }
  function faktorer(n, antal){ var d = [], x = n; for(var p = 2; d.length < antal - 1 && p <= x; p++){ while(x % p === 0 && d.length < antal - 1){ d.push(p); x /= p; } } d.push(x); return d.join('\\u00b7'); }
  function fyll(inp, b){
    var d = inp.dataset, v = null;
    if(d.svar !== undefined) v = String(d.svar).replace('.', ',');
    else if(d.uttryck !== undefined) v = dec(d.uttryck).split('|')[0];
    else if(d.form !== undefined) v = dec(d.form).split('|')[0];
    else if(d.fritext !== undefined) v = dec(d.fritext).split('|')[0];
    else if(d.ordna !== undefined) v = String(d.ordna).replace('.', ',');
    else if(d.intmin !== undefined) v = String((parseFloat(d.intmin) + parseFloat(d.intmax)) / 2).replace('.', ',');
    else if(d.faktor !== undefined) v = faktorer(parseInt(d.faktor, 10), parseInt(d.antal, 10));
    else if(d.vl !== undefined) v = String(d.vl).replace('.', ',');
    else if(d.tvatal !== undefined){ var par = Array.from(inp.closest('.ovn-rad, .ovn-grupp').querySelectorAll('.ovn-in[data-tvatal]')); v = String(d.tvatal.split(',')[par.indexOf(inp) % 2] || d.tvatal.split(',')[0]).replace('.', ','); }
    else if(d.min !== undefined){ var lo = parseFloat(d.min), hi = parseFloat(d.max), p2 = Array.from(inp.closest('.ovn-grupp, .ovn-rad').querySelectorAll('.ovn-intervall[data-par="' + d.par + '"]')); v = String(lo + (hi - lo) * (p2.indexOf(inp) === 1 ? 0.6 : 0.4)).replace('.', ','); }
    else if(d.summa !== undefined){ var s = parseFloat(d.summa), grp = Array.from(inp.closest('.ovn-rad, .ovn-grupp').querySelectorAll('.ovn-in[data-summa]')); var k = grp.indexOf(inp), n = grp.length; v = String(k === n - 1 ? s - (n - 1) : 1); }
    else if(d.forenkla !== undefined) v = d.visa;                                   // k3 d3: förenklat uttryck (facit i data-visa)
    else if(d.oppet !== undefined){                                                 // eget uttryck med n termer som förenklas till målet
      var mm = dec(d.oppet).replace(/\\u2212/g, '-').replace(/\\s+/g, '').match(/^(-?\\d*)([a-z])([+-]\\d+)$/);
      if(mm){ var kk = mm[1] === '' ? 1 : (mm[1] === '-' ? -1 : parseInt(mm[1], 10)), kn = parseInt(mm[3], 10);
        v = (kk - 1) + mm[2] + ' + ' + mm[2] + ' + ' + (kn - 1) + ' + 1'; }
    }
    else if(d.sida !== undefined){                                                  // öppet sid-par: a + b = halva omkretsen
      var box = inp.closest('.alg-sidor'), halva = box ? dec(box.dataset.halva) : '';
      v = d.sida === '1' ? '1' : (halva ? halva + ' - 1' : null);
    }
    else if(d.oms !== undefined) v = String(d.oms).replace('.', ',');
    else if(d.text !== undefined) v = d.visa || dec(d.text).split('|')[0];
    else if(d.mellan !== undefined) v = d.mellan;
    else if(d.enhet !== undefined) v = d.enhet;
    else if(d.rund !== undefined) v = d.rund.split('|')[0];
    if(v === null){ b.ejTackta++; return; }
    inp.value = v; ev(inp, 'input');
  }
  function mat(namn, root){
    var b = { blad: namn, synligIn: 0, doldIn: 0, synligGrid: 0, doldGrid: 0, ejTackta: 0 };
    var ins = Array.from(root.querySelectorAll('.ovn-in'));
    ins.forEach(function(i){ if(synlig(i)) b.synligIn++; else b.doldIn++; });
    // k2-kopiornas egna radtyper: raden är EN svarsenhet (som i modulens egen räkning), och rutorna
    // inuti den ska då inte räknas var för sig.
    var RADSEL = '.brak-svar-rad, .brak-fragerad, .brak-forlang-rad, .val-rad, .stam-rad';
    var rader = Array.from(root.querySelectorAll(RADSEL)).filter(synlig);
    var selar = Array.from(root.querySelectorAll('.para-sel')).filter(synlig);
    b.oppna = Array.from(root.querySelectorAll('[data-oppen]')).filter(synlig).length;   // öppen uppgift (villkor, inget facit i DOM) → enhet men ej fyllbar
    b.ejTackta += b.oppna;
    b.valRader = Array.from(root.querySelectorAll('.val-rad')).filter(synlig).length;   // knapprad utan ruta
    b.paraSelar = selar.length;                                                          // <select> utan ruta
    b.radTyper = rader.length;
    var tomma = ins.filter(function(i){ var d = i.dataset; return (d.text !== undefined && dec(d.text) === '') || (d.svar !== undefined && d.svar === ''); }).length;
    b.platshallare = ins.length > 0 && tomma === ins.length;   // byggar-platshållare (tomt facit i varje ruta) → rapporteras med ?, fälls ej
    root.querySelectorAll('.valruta-grid, .ovn-val-grid, .ovn-flerval-grid').forEach(function(g){ if(!synlig(g)) b.doldGrid++; else b.synligGrid++; });
    root.querySelectorAll('.brak-svar-rad, .brak-fragerad').forEach(function(row){ var h = row.querySelector('.brak-hel'), t = row.querySelector('.brak-t'), n = row.querySelector('.brak-n'); if(h && row.dataset.hel !== undefined){ h.value = row.dataset.hel; ev(h, 'input'); } if(t && row.dataset.t !== undefined){ t.value = row.dataset.t; ev(t, 'input'); } if(n && row.dataset.n !== undefined){ n.value = row.dataset.n; ev(n, 'input'); } });
    ins.forEach(function(i){ if(i.closest('.brak-svar-rad, .brak-fragerad') && /brak-(hel|t|n)\\b/.test(i.className)) return; if(/brak-cell|brak-kladd|brak-bada-dec|forlang-tal|forlang-dec/.test(i.className)){ b.ejTackta++; return; } fyll(i, b); });
    // val-rad: klicka knappen vars data-val = radens data-ratt
    root.querySelectorAll('.val-rad').forEach(function(rad){
      var r = rad.dataset.ratt, bt = Array.from(rad.querySelectorAll('.val-knapp')).filter(function(k){ return k.dataset.val === r; })[0];
      if(bt) bt.click(); else b.ejTackta++;
    });
    // para-sel: <select> med data-ratt
    root.querySelectorAll('.para-sel').forEach(function(sel){ if(sel.dataset.ratt){ sel.value = sel.dataset.ratt; ev(sel, 'change'); } else b.ejTackta++; });
    // brak-forlang-rad: hundra/dec ur radens data
    root.querySelectorAll('.brak-forlang-rad').forEach(function(row){
      var h = row.querySelector('.forlang-tal'), d = row.querySelector('.forlang-dec');
      if(h && row.dataset.hundra !== undefined){ h.value = row.dataset.hundra; ev(h, 'input'); }
      if(d && row.dataset.dec !== undefined){ d.value = String(row.dataset.dec).replace('.', ','); ev(d, 'input'); }
      if(!h && !d) b.ejTackta++;
    });
    root.querySelectorAll('.valruta-grid').forEach(function(g){
      // TVÅ varianter: kärnans (facit på griden, data-val per knapp) och k2-kopiornas (facit PER KNAPP, data-ratt=1|0)
      var perKnapp = !!g.querySelector('.valruta-btn[data-ratt]');
      var ratta = dec(g.dataset.ratt || '').split('|').map(norm);
      g.querySelectorAll('.valruta-btn').forEach(function(bt){
        var ar = perKnapp ? bt.dataset.ratt === '1' : ratta.indexOf(norm(dec(bt.dataset.val))) >= 0;
        if(ar !== bt.classList.contains('is-vald')) bt.click();
      });
    });
    root.querySelectorAll('.ovn-val-grid').forEach(function(g){ var bt = g.querySelector('.ovn-val-btn[data-val="' + g.dataset.valsvar + '"]'); if(bt) bt.click(); else b.ejTackta++; });
    root.querySelectorAll('.ovn-flerval-grid').forEach(function(g){ var r = g.dataset.ratt.split(','); g.querySelectorAll('.ovn-flerval-btn').forEach(function(bt){ var ar = r.indexOf(bt.dataset.tal) >= 0; if(ar !== bt.classList.contains('is-vald')) bt.click(); }); });
    var kn = root.querySelector('[data-action="kontroll"]'); if(!kn){ b.ingenKnapp = true; ut.blad.push(b); return; }
    kn.click();
    var sm = root.querySelector('[data-sammanf]'); b.sammanf = sm ? sm.textContent.replace(/\\s+/g, ' ').trim().slice(0, 80) : null;
    var m = b.sammanf && b.sammanf.match(/(\\d+) av (\\d+)/); if(m){ b.ratt = +m[1]; b.namnare = +m[2]; }
    ut.blad.push(b);
  }
  window.confirm = function(){ return true; };
  function visaSheet(sh){ if(synlig(sh)) return true; var tabs = Array.from(document.querySelectorAll('.tab-btn')), navs = Array.from(document.querySelectorAll('.blad-nav-btn'));
    for(var a = 0; a < tabs.length; a++){ tabs[a].click(); if(synlig(sh)) return true; for(var c = 0; c < navs.length; c++){ navs[c].click(); if(synlig(sh)) return true; } } return false; }
  Array.from(document.querySelectorAll('.ovn-sheet')).forEach(function(sh, i){ var h = sh.querySelector('h2'); var namn = (h ? h.textContent.trim() : 'blad ' + (i + 1)).slice(0, 28); if(!visaSheet(sh)){ ut.blad.push({ blad: namn, onabar: true }); return; } mat(namn, sh.parentElement); });
  // Plugg till prov (k1/d10, k3/d7): dokumenten renderas först vid klick → öppna varje grupp + dokument och mät bladet som skapas
  Array.from(document.querySelectorAll('.plugg-gruppbtn')).forEach(function(g){ g.click(); Array.from(document.querySelectorAll('.plugg-dok')).forEach(function(d){ d.click(); var akt = document.getElementById('plugg-aktivt'); var sh = akt && akt.querySelector('.ovn-sheet'); var namn = ('plugg: ' + d.textContent.replace(/\\s+/g, ' ').trim()).slice(0, 28); if(!sh){ ut.blad.push({ blad: namn, ingenKnapp: true }); return; } mat(namn, sh.parentElement); }); });
  return ut;
})()`;

// ── PROBLEMLÖSNINGENS BLAD (d5): egna ruttyper, facit ur modellen ──
// SVARSENHET = en ruta eller rad som rättningen markerar: uttryck, insättning, svar, ekvationsraden
// och varje IFYLLD kedjerad. En tom extra kedjerad är en erbjuden rad, inte en svarsenhet.
const PROBE_D5 = `(function(){
  var ut = { onerr: window.__onerr, blad: [] };
  function synlig(el){ return !!(el.offsetParent) && getComputedStyle(el).visibility !== 'hidden'; }
  function ev(el, t){ el.dispatchEvent(new Event(t, { bubbles:true })); }
  function skrivYta(y, v){ if(!y) return; var f = y.querySelector('.seg-text'); if(!f) return; f.value = v; ev(f, 'input'); }
  function fyllBlad(kort, blad, bryt){
    var M = window.ProbModell, uppgEl = kort.querySelectorAll('.prob-uppg'), brutna = [];
    blad.uppgifter.forEach(function(u, i){
      var el = uppgEl[i]; if(!el) return;
      var l = M.losningsforslag(u); if(!l) return;
      var nycklar = M.nycklarAv(u);
      if(el.querySelectorAll('.prob-delrad').length){
        var nyDel = el.querySelector('.prob-nydel'), v = 0;
        while(el.querySelectorAll('.prob-delrad').length < nycklar.length && nyDel && v++ < 9) nyDel.click();
        nycklar.forEach(function(k, ri){
          var dr = el.querySelectorAll('.prob-delrad')[ri];
          var ir = el.querySelectorAll('.prob-insattrad')[ri], sr = el.querySelectorAll('.prob-svarrad2')[ri];
          var sv = l.svar[k];
          if(bryt === 'sista' && nycklar.length > 1 && ri < nycklar.length - 1){ sv = '999' + (u.enhet ? ' ' + u.enhet : ''); brutna.push(i + ':' + ri); }
          skrivYta(dr && dr.querySelector('.prob-uttryck'), l.uttryck[k]);
          skrivYta(ir && ir.querySelector('.prob-varde'), l.insattning[k]);
          skrivYta(sr && sr.querySelector('.prob-svar'), sv);
        });
      } else {
        skrivYta(el.querySelector('.prob-svar'), l.svar[nycklar[0]]);
      }
      var rader = [l.ekvation].concat(l.kedja);
      var knapp = Array.prototype.filter.call(el.querySelectorAll('.mini-btn'), function(b){ return !b.classList.contains('prob-nydel'); })[0];
      var v2 = 0;
      while(el.querySelectorAll('.eq-vl .seg-text').length < rader.length && knapp && v2++ < 9) knapp.click();
      var vl = el.querySelectorAll('.eq-vl .seg-text'), hl = el.querySelectorAll('.eq-hl .seg-text');
      rader.forEach(function(r, ri){ if(!vl[ri]) return; vl[ri].value = r.vl; hl[ri].value = r.hl; ev(vl[ri], 'input'); ev(hl[ri], 'input'); });
    });
    return brutna;
  }
  function bladen(){
    var nav = Array.prototype.slice.call(document.querySelectorAll('#blad-nav .blad-nav-btn'));
    var B = ['ProbBlad', 'ProbBlad2', 'ProbBlad3', 'ProbBlad4', 'ProbBlad5']
              .map(function(n){ return window[n] && window[n].BLAD; }).filter(Boolean);
    return nav.map(function(k, i){ return { knapp: k, data: B[i] }; }).filter(function(x){ return !!x.data; });
  }
  function oppna(x){
    x.knapp.click();
    var m = Array.prototype.filter.call(document.querySelectorAll('.blad-mount'), function(e){ return !e.hidden && e.offsetParent; })[0];
    return m && m.querySelector('.prob-kort');
  }
  bladen().forEach(function(x){
    var kort = oppna(x); if(!kort) return;
    var b = { blad: x.knapp.textContent.trim().slice(0, 26) };
    fyllBlad(kort, x.data, '');
    var kn = kort.querySelector('[data-action="kontroll"]');
    if(!kn){ b.ingenKnapp = true; ut.blad.push(b); return; }
    kn.click();
    var alla = Array.prototype.slice.call(kort.querySelectorAll('.prob-uttryck, .prob-varde, .prob-svar'));
    b.ytor = alla.filter(synlig).length;
    b.dolda = alla.length - b.ytor;
    var rader = 0;
    Array.prototype.forEach.call(kort.querySelectorAll('.prob-uppg'), function(u){
      var vlar = u.querySelectorAll('.eq-vl'), hlar = u.querySelectorAll('.eq-hl');
      for(var i = 0; i < vlar.length; i++){
        var ifylld = Array.prototype.some.call(vlar[i].querySelectorAll('input'), function(x2){ return x2.value.trim() !== ''; }) ||
                     Array.prototype.some.call((hlar[i] || vlar[i]).querySelectorAll('input'), function(x2){ return x2.value.trim() !== ''; });
        if(ifylld) rader++;
      }
    });
    b.rader = rader; b.enheter = b.ytor + rader;
    var sm = kort.querySelector('[data-sammanf]');
    b.sammanf = sm ? sm.textContent.replace(/\\s+/g, ' ').trim() : null;
    var m = b.sammanf && b.sammanf.match(/(\\d+) av (\\d+)/);
    if(m){ b.ratt = +m[1]; b.namnare = +m[2]; }
    ut.blad.push(b);
  });
  return ut;
})()`;

const SIDOR8 = fs.readdirSync(path.join(ROOT, 'ak8/k1')).filter(f => /\.html$/.test(f) && f !== 'index.html').map(f => 'ak8/k1/' + f);
const SIDOR7 = ['ak7/k2/d1-andel-antal', 'ak7/k2/d2-byta-form', 'ak7/k2/d3-forlanga-forkorta', 'ak7/k2/d4-jamfora-brak', 'ak7/k2/d5-addsub-brak', 'ak7/k2/d6-multiplikation-brak', 'ak7/k2/d7-division-brak', 'ak7/k3/d3-forenkla-uttryck', 'ak7/k1/d1-positionssystem', 'ak7/k1/d2-fyraraknesatt', 'ak7/k1/d3-negativa-tal', 'ak7/k1/d4-brak-decimal', 'ak7/k1/d5-tiopotenser', 'ak7/k1/d6-multiplikation', 'ak7/k1/d7-division', 'ak7/k1/d8-avrundning', 'ak7/k1/d10-pluggtillprov', 'ak7/k3/d1-algebraiska-uttryck', 'ak7/k3/d7-pluggtillprov'].map(p => p + '/index.html');
const TMP = path.join(os.tmpdir(), 'namnare-' + process.pid);
function kor(sida, probe, seed){
  const pf = TMP + '-probe.js', pre = TMP + '-pre.js'; fs.writeFileSync(pf, probe); fs.writeFileSync(pre, PRE(seed));
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), pf, '--pre', pre, '--wait', '2000', '--timeout', '120000'], { encoding: 'utf8', timeout: 180000 });
  try { return JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){ return { err: ((r.stderr || '') + (r.stdout || '')).trim().split('\n').pop() }; }
}
let fel = 0, blad = 0;
console.log('NÄMNARE-GRIND — nämnaren = synliga svarsenheter · inga dolda · rätt ifyllt = full pott\n');
SIDOR8.forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  for(let k = 0; k < SEEDS; k++){
    const seed = 0x2F6E2B1 + k * 7919;
    const s1 = kor(sida, PROBE8_SAMLA, seed); if(!s1.blad){ fel++; console.log('✗ ' + sida + ': inget svar (samla) — ' + s1.err); continue; }
    const s2 = kor(sida, PROBE8_FYLL.replace(/__FACIT__/g, () => JSON.stringify(s1.blad)), seed); if(!s2.blad){ fel++; console.log('✗ ' + sida + ': inget svar (fyll) — ' + s2.err); continue; }
    if(s2.onerr && s2.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + s2.onerr.join(' | ')); }
    s2.blad.forEach((b, bi) => {
      blad++;
      const brott = [], ob = (s1.blad[bi] || {}).obesvarbara || [];
      if(ob.length) brott.push('RÄKNAS MEN RÄTTAS ALDRIG (' + ob.length + '): ' + ob.slice(0, 4).join(' ; '));
      if(b.namnare !== b.synligaSvar) brott.push('NÄMNAREN ' + b.namnare + ' ≠ synliga svarsenheter ' + b.synligaSvar);
      if(b.svar !== b.synligaSvar) brott.push((b.svar - b.synligaSvar) + ' svarselement utan synlig ruta/knapp');
      if(b.fel.length) brott.push('FACIT GODTAS EJ: ' + b.fel.slice(0, 3).join(' ; '));
      if(!b.ejTackta && !b.fel.length && b.ratt !== b.namnare) brott.push('allt fyllt ur facit men ' + b.ratt + ' av ' + b.namnare);
      fel += brott.length;
      console.log((brott.length ? '✗ ' : '✓ ') + sida.replace('ak8/k1/', '') + (SEEDS > 1 ? ' s' + k : '') + ' · ' + b.blad + ': ' + b.ratt + '/' + b.namnare + ' · synliga ' + b.synligaSvar + ' · fyllda ' + b.fyllda + (b.ejTackta ? ' · ej täckta ' + b.ejTackta : '') + (brott.length ? '\n     ' + brott.join('\n     ') : ''));
    });
  }
});
// d5: problemlösningens blad (egna ruttyper)
['ak7/k3/d5-problemlosning/index.html'].forEach(sida => {
  if(BARA && !sida.includes(BARA)) return;
  const u = kor(sida, PROBE_D5, 0x2F6E2B1);
  if(!u.blad || !u.blad.length){ fel++; console.log('✗ ' + sida + ': inga blad mätta — ' + (u.err || 'bladen hittades inte')); return; }
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel — ' + u.onerr.join(' · ')); }
  u.blad.forEach(b => {
    blad++;
    const brott = [];
    if(b.ingenKnapp) brott.push('ingen Kontrollera-knapp');
    if(b.dolda) brott.push(b.dolda + ' dolda svarsenheter');
    if(b.namnare == null) brott.push('ingen "X av Y"-summering');
    else if(b.namnare !== b.enheter) brott.push('nämnaren ' + b.namnare + ' ≠ ' + b.enheter + ' synliga svarsenheter');
    else if(b.ratt !== b.namnare) brott.push('allt fyllt ur modellen men ' + b.ratt + ' av ' + b.namnare);
    if(brott.length){ fel++; console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad + ': ' + brott.join(' · ')); }
    else console.log('✓ ' + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad + ': ' + b.ratt + '/' + b.namnare + ' · synliga ' + b.enheter + ' (' + b.ytor + ' rutor + ' + b.rader + ' rader)');
  });
});

SIDOR7.forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  const u = kor(sida, PROBE7, 0x2F6E2B1); if(!u.blad){ fel++; console.log('✗ ' + sida + ': inget svar — ' + u.err); return; }
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + u.onerr.join(' | ')); }
  u.blad.forEach(b => {
    blad++;
    if(b.onabar){ console.log('? ' + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad + ': ONÅBAR (ingen flik/nav visar bladet)'); return; }
    if(b.ingenKnapp){ console.log('? ' + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad + ': ingen Kontrollera-knapp'); return; }
    if(b.platshallare){ console.log('? ' + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad + ': PLATSHÅLLARE (tomt facit i alla rutor — kan aldrig ge full pott)'); return; }
    const brott = [];
    // Enhet = en SYNLIG ifyllbar ruta, eller en svarsenhet UTAN ruta (knapprad, select, valgrid).
    // Rader som består av rutor räknas alltså via sina rutor — modulerna räknar olika (d5/d6 räknar varje
    // stegruta), och invarianten är att nämnaren aldrig får vara STÖRRE än det eleven kan fylla i.
    var enheter = b.synligIn + b.synligGrid + (b.valRader || 0) + (b.paraSelar || 0) + (b.oppna || 0);
    if(b.namnare > enheter) brott.push('NÄMNAREN ' + b.namnare + ' > synliga svarsenheter ' + enheter + ' (rutor ' + b.synligIn + ' + grids ' + b.synligGrid + ' + knapprader ' + (b.valRader || 0) + ' + val ' + (b.paraSelar || 0) + ')');
    if(b.doldIn || b.doldGrid) brott.push('DOLDA i visat blad: rutor ' + b.doldIn + ', grids ' + b.doldGrid);
    if(!b.ejTackta && b.namnare > 0 && b.ratt !== b.namnare) brott.push('allt fyllt ur data men ' + b.ratt + ' av ' + b.namnare);
    fel += brott.length;
    console.log((brott.length ? '✗ ' : '✓ ') + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad + ': ' + b.ratt + '/' + b.namnare + ' · synliga ' + (b.synligIn + b.synligGrid + (b.valRader || 0) + (b.paraSelar || 0)) + (b.ejTackta ? ' · ej täckta ' + b.ejTackta : '') + (b.namnare === 0 ? ' · TOMT BLAD' : '') + (brott.length ? '\n     ' + brott.join('\n     ') : ''));
  });
});
try { fs.unlinkSync(TMP + '-probe.js'); fs.unlinkSync(TMP + '-pre.js'); } catch(e){}
console.log('\n' + (fel ? '✗ NÄMNARE-GRIND RÖD (' + fel + ')' : '✓ NÄMNARE-GRIND GRÖN') + ' · ' + blad + ' blad mätta');
process.exit(fel ? 1 : 0);
