/* flerruts-grind.js — GRINDEN mot "grön rad med fel kvar" (order 2026-09-21).
   Bakgrund: i en rad med flera rutor rensade varje ruta hela radens ✓/✗ vid rättning → bara sista rutans bock blev kvar;
   A, B fel + C rätt visade ✓ (sjuans kärna blad-karna-b/blad-karna). Åttans moduler rättade raden som helhet (aldrig ✓
   med fel) men visade inte rutornas egen status. Regeln: VARJE ruta visar sin egen markering, raden är grön bara om alla
   rutor är rätt.
   Kör, per blad i riktig browser: fyll SISTA rutan rätt och övriga FEL i varje flerrutsrad → kräv att raden inte är ✓
   och att rutorna visar egen status (sista ok, övriga fel) för tallinje-/talföljds-/hopp-rader. Facit läses ur bladets
   egen facit-text efter en första rättning (åk8) resp. data-svar (åk7).
   Kör:  node verktyg/flerruts-grind.js [--sida grunder]        Exit 1 vid fel. Noll nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2), BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
const PRE = `(function(){ var s = 0x2F6E2B1; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); }); try { localStorage.clear(); } catch(e){} })();`;
// PROBLEMLÖSNINGENS BLAD (d5): varje ruta visar sin EGEN status. Provet: fyll allt rätt ur
// modellen utom EN enhet → den ska bli fel och de andra rätt, och uppgiften får inte bli löst.
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
      if(el.querySelector('.prob-foljd') && u.foljdfraga){
        var mal = M.utvardera(u.foljdfraga.uttryck, M.varden(u, M.grenarAv(u)[0]).varden);
        skrivYta(el.querySelector('.prob-foljd'), mal + ' ' + u.foljdfraga.enhet);
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
    fyllBlad(kort, x.data, 'sista');
    var kn = kort.querySelector('[data-action="kontroll"]'); if(!kn) return;
    kn.click();
    var b = { blad: x.knapp.textContent.trim().slice(0, 26), rader: 0, provade: 0, gronFastFel: [], perRutaSaknas: [] };
    Array.prototype.forEach.call(kort.querySelectorAll('.prob-uppg'), function(u, ui){
      var sv = Array.prototype.filter.call(u.querySelectorAll('.prob-svar'), synlig);
      if(sv.length < 2) return;                       // en enda svarsruta = ingen flerrutsrad
      b.rader++; b.provade++;
      var st = sv.map(function(y){ return y.classList.contains('fel') ? 'fel' : y.classList.contains('ratt') ? 'ratt' : '-'; });
      if(u.querySelector('.uppg-klar.show')) b.gronFastFel.push('uppg ' + (ui + 1) + ' ✓ trots ' + (sv.length - 1) + ' felaktiga svar');
      if(st[st.length - 1] !== 'ratt') b.gronFastFel.push('uppg ' + (ui + 1) + ' sista rutan rätt men ' + st[st.length - 1]);
      var saknas = st.slice(0, -1).filter(function(s2){ return s2 !== 'fel'; }).length;
      if(saknas) b.perRutaSaknas.push('uppg ' + (ui + 1) + ': ' + saknas + ' felaktiga rutor omarkerade (' + st.join(',') + ')');
    });
    ut.blad.push(b);
  });
  return ut;
})()`;

// ÅK8 (AK8_UI-blad): per blad-flik
const PROBE8 = `(function(){
  var ut = { onerr: window.__onerr, blad: [] };
  function ev(el, t){ el.dispatchEvent(new Event(t, { bubbles:true })); }
  function tal(s){ return (String(s).match(/-?\\d+(?:,\\d+)?/g) || []); }
  var knappar = Array.from(document.querySelectorAll('.blad-nav-btn'));
  function mat(namn){
    var mount = document.querySelector('[id^="sheet-"]') || document.querySelector('.ovn-sheet'); if(!mount) return;
    var kn = mount.querySelector('[data-kontroll]'); if(!kn) return;
    var rader = Array.from(mount.querySelectorAll('.ak8-rad')).filter(function(r){ return r.querySelectorAll('.ak8-svar[data-idx]').length === 1 && r.querySelectorAll('.ak8-in').length > 1 && !r.querySelector('.ak8-chip, .ak8-vf, .ak8-tal, .ak8-korval, .ovn-brak, .ak8-pot, .ak8-cell'); });
    var b = { blad: namn, rader: rader.length, gronFastFel: [], perRutaSaknas: [], provade: 0 };
    rader.forEach(function(r){ r.querySelectorAll('.ak8-in').forEach(function(i){ i.value = '0'; ev(i, 'input'); }); }); kn.click();
    var facit = rader.map(function(r){ var f = r.querySelector('.ak8-fasit'); return f ? tal(f.textContent.replace(/^[^:]*:/, '')) : null; });
    rader.forEach(function(r, ri){ var ins = Array.from(r.querySelectorAll('.ak8-in')), f = facit[ri]; if(!f || f.length !== ins.length) return;
      ins.forEach(function(inp, i){ inp.value = i === ins.length - 1 ? f[i] : String(parseFloat(f[i].replace(',', '.')) + 1).replace('.', ','); ev(inp, 'input'); }); });
    kn.click();
    rader.forEach(function(r, ri){ var ins = Array.from(r.querySelectorAll('.ak8-in')), f = facit[ri]; if(!f || f.length !== ins.length) return;
      b.provade++;
      var rub = ((r.closest('.ovn-grupp, .ak8-grupp') || { querySelector: function(){ return null; } }).querySelector('.ovn-grupp-rubrik') || { textContent: '' }).textContent.trim();
      var mark = (r.querySelector('.ovn-mark') || {}).textContent || '-';
      var st = ins.map(function(i){ return i.classList.contains('ak8-ok') ? 'ok' : i.classList.contains('ak8-fel') ? 'fel' : '-'; });
      if(mark === '✓') b.gronFastFel.push(rub.slice(0, 40) + ' [' + st.join(',') + ']');
      var perRuta = st[st.length - 1] === 'ok' && st.slice(0, -1).every(function(x){ return x === 'fel'; });
      if(/pilarna|talföljd|följd|hopp|tallinje/i.test(rub) && !perRuta) b.perRutaSaknas.push(rub.slice(0, 40) + ' [' + st.join(',') + ']');
    });
    ut.blad.push(b);
  }
  if(knappar.length) knappar.forEach(function(k){ k.click(); mat(k.textContent.trim().slice(0, 30)); }); else mat('(enda)');
  return ut;
})()`;
// ÅK7 (blad-karna-b / blad-karna): per .ovn-sheet, rader med ≥ 2 .ovn-in[data-svar]
const PROBE7 = `(function(){
  var ut = { onerr: window.__onerr, blad: [] };
  function ev(el, t){ el.dispatchEvent(new Event(t, { bubbles:true })); }
  function mat(namn, root){
    var b = { blad: namn, rader: 0, gronFastFel: [], perRutaSaknas: [], provade: 0 };
    var SEL = '.ovn-in[data-svar], .ovn-in[data-forenkla]';   // uttrycksrutor (pyramid/magisk kvadrat, k3 d3) räknas med
    var rader = Array.from(root.querySelectorAll('.ovn-rad')).filter(function(r){ return r.querySelectorAll(SEL).length >= 2; });
    // k2: bråkrader vars facit står på RADEN (data-hel/t/n) och vars rutor är .brak-cell
    var brakRader = Array.from(root.querySelectorAll('.brak-svar-rad, .brak-fragerad')).filter(function(r){ return r.querySelectorAll('.brak-hel, .brak-t, .brak-n').length >= 2; });
    b.rader = rader.length + brakRader.length; if(!b.rader){ ut.blad.push(b); return; }
    rader.forEach(function(r){ var ins = Array.from(r.querySelectorAll(SEL)); ins.forEach(function(inp, i){
      var uttryck = inp.dataset.forenkla !== undefined, ratt = uttryck ? inp.dataset.visa : inp.dataset.svar;
      inp.value = i === ins.length - 1 ? ratt : (uttryck ? ratt + ' + 1' : String(parseFloat(String(ratt).replace(',', '.')) + 1).replace('.', ','));   // fel värde i alla utom sista
      ev(inp, 'input'); }); });
    // k2-bråkrader: sista rutan rätt, övriga fel (facit ur radens data)
    brakRader.forEach(function(r){
      var cel = ['hel', 't', 'n'].map(function(k){ return { el: r.querySelector('.brak-' + k), v: r.dataset[k] }; }).filter(function(x){ return x.el; });
      cel.forEach(function(c, i){ c.el.value = (i === cel.length - 1) ? c.v : String(parseInt(c.v, 10) + 1); ev(c.el, 'input'); });
    });
    var kn = root.querySelector('[data-action="kontroll"]') || (root.parentElement && root.parentElement.querySelector('[data-action="kontroll"]')) || document.querySelector('[data-action="kontroll"]'); if(kn) kn.click();
    brakRader.forEach(function(r){
      b.provade++;
      var marks = Array.from(r.querySelectorAll('.ovn-mark')).map(function(m){ return m.textContent; });
      var cel = Array.from(r.querySelectorAll('.brak-hel, .brak-t, .brak-n'));
      var st = cel.map(function(i){ return i.classList.contains('correct') ? 'ok' : i.classList.contains('wrong') ? 'fel' : '-'; });
      if(marks.length && marks.every(function(m){ return m === '\u2713'; })) b.gronFastFel.push('bråkrad [' + st.join(',') + ']');
    });
    rader.forEach(function(r){ var ins = Array.from(r.querySelectorAll(SEL)); b.provade++;
      var marks = ins.map(function(i){ var n = i.nextElementSibling; return (n && n.classList.contains('ovn-mark')) ? n.textContent : '-'; });
      var st = ins.map(function(i){ return i.classList.contains('correct') ? 'ok' : i.classList.contains('wrong') ? 'fel' : '-'; });
      var alla = Array.from(r.querySelectorAll('.ovn-mark')).map(function(m){ return m.textContent; });
      if(alla.length && alla.every(function(m){ return m === '✓'; })) b.gronFastFel.push('[' + st.join(',') + ']');
      var per = marks[marks.length - 1] === '✓' && marks.slice(0, -1).every(function(m){ return m === '✗'; });
      if(!per) b.perRutaSaknas.push('[' + marks.join('') + ' / ' + st.join(',') + ']');
    });
    ut.blad.push(b);
  }
  Array.from(document.querySelectorAll('.ovn-sheet')).forEach(function(sh, i){ var h = sh.querySelector('h2'); mat((h ? h.textContent.trim() : 'blad ' + (i + 1)).slice(0, 30), sh); });
  // Plugg till prov (k1/d10, k3/d7): dokumenten renderas vid klick → öppna varje grupp + dokument
  Array.from(document.querySelectorAll('.plugg-gruppbtn')).forEach(function(g){ g.click(); Array.from(document.querySelectorAll('.plugg-dok')).forEach(function(d){ d.click(); var akt = document.getElementById('plugg-aktivt'); var sh = akt && akt.querySelector('.ovn-sheet'); if(sh) mat(('plugg: ' + d.textContent.replace(/\\s+/g, ' ').trim()).slice(0, 30), sh); }); });
  return ut;
})()`;
const SIDOR8 = fs.readdirSync(path.join(ROOT, 'ak8/k1')).filter(f => /\.html$/.test(f) && f !== 'index.html').map(f => ['ak8/k1/' + f, PROBE8]);
const SIDOR7 = ['ak7/k2/d1-andel-antal', 'ak7/k2/d2-byta-form', 'ak7/k2/d3-forlanga-forkorta', 'ak7/k2/d4-jamfora-brak', 'ak7/k2/d5-addsub-brak', 'ak7/k2/d6-multiplikation-brak', 'ak7/k2/d7-division-brak', 'ak7/k3/d3-forenkla-uttryck', 'ak7/k1/d1-positionssystem', 'ak7/k1/d2-fyraraknesatt', 'ak7/k1/d3-negativa-tal', 'ak7/k1/d4-brak-decimal', 'ak7/k1/d5-tiopotenser', 'ak7/k1/d6-multiplikation', 'ak7/k1/d7-division', 'ak7/k1/d8-avrundning', 'ak7/k1/d10-pluggtillprov', 'ak7/k3/d1-algebraiska-uttryck', 'ak7/k3/d7-pluggtillprov'].map(p => [p + '/index.html', PROBE7]);
let fel = 0, provade = 0;
console.log('FLERRUTS-GRIND — sista rutan rätt, övriga fel: raden får inte bli ✓; tallinje/talföljd/hopp visar status per ruta\n');
const SIDOR_D5 = [['ak7/k3/d5-problemlosning/index.html', PROBE_D5]];
SIDOR8.concat(SIDOR7).concat(SIDOR_D5).forEach(([sida, probe]) => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  const tmp = path.join(os.tmpdir(), 'flerruts-' + process.pid + '.js'), pre = path.join(os.tmpdir(), 'flerruts-pre-' + process.pid + '.js');
  fs.writeFileSync(tmp, probe); fs.writeFileSync(pre, PRE);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), tmp, '--pre', pre, '--wait', '2000', '--timeout', '90000'], { encoding: 'utf8', timeout: 150000 });
  let ut = null; try { ut = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!ut){ fel++; console.log('✗ ' + sida + ': inget svar — ' + (r.stderr || '').trim().split('\n').pop()); return; }
  if(ut.onerr && ut.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + ut.onerr.join(' | ')); }
  ut.blad.forEach(b => {
    if(!b.rader) return;
    provade += b.provade;
    const bad = b.gronFastFel.length + b.perRutaSaknas.length; fel += bad;
    console.log((bad ? '✗ ' : '✓ ') + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad + ': ' + b.provade + '/' + b.rader + ' flerrutsrader provade'
      + (b.gronFastFel.length ? ' · GRÖN FAST FEL: ' + b.gronFastFel.join(' ; ') : '') + (b.perRutaSaknas.length ? ' · status per ruta saknas: ' + b.perRutaSaknas.slice(0, 3).join(' ; ') : ''));
  });
  try { fs.unlinkSync(tmp); fs.unlinkSync(pre); } catch(e){}
});
console.log('\n' + (fel ? '✗ FLERRUTS-GRIND RÖD (' + fel + ')' : '✓ FLERRUTS-GRIND GRÖN') + ' · ' + provade + ' rader provade');
process.exit(fel ? 1 : 0);
