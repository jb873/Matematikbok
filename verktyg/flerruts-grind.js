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
    var rader = Array.from(root.querySelectorAll('.ovn-rad')).filter(function(r){ return r.querySelectorAll('.ovn-in[data-svar]').length >= 2; });
    b.rader = rader.length; if(!rader.length){ ut.blad.push(b); return; }
    rader.forEach(function(r){ var ins = Array.from(r.querySelectorAll('.ovn-in[data-svar]')); ins.forEach(function(inp, i){ var ratt = inp.dataset.svar; inp.value = i === ins.length - 1 ? ratt : String(parseFloat(String(ratt).replace(',', '.')) + 1).replace('.', ','); ev(inp, 'input'); }); });
    var kn = root.querySelector('[data-action="kontroll"]') || (root.parentElement && root.parentElement.querySelector('[data-action="kontroll"]')) || document.querySelector('[data-action="kontroll"]'); if(kn) kn.click();
    rader.forEach(function(r){ var ins = Array.from(r.querySelectorAll('.ovn-in[data-svar]')); b.provade++;
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
const SIDOR7 = ['ak7/k1/d1-positionssystem', 'ak7/k1/d2-fyraraknesatt', 'ak7/k1/d3-negativa-tal', 'ak7/k1/d4-brak-decimal', 'ak7/k1/d5-tiopotenser', 'ak7/k1/d6-multiplikation', 'ak7/k1/d7-division', 'ak7/k1/d8-avrundning', 'ak7/k1/d10-pluggtillprov', 'ak7/k3/d1-algebraiska-uttryck', 'ak7/k3/d7-pluggtillprov'].map(p => [p + '/index.html', PROBE7]);
let fel = 0, provade = 0;
console.log('FLERRUTS-GRIND — sista rutan rätt, övriga fel: raden får inte bli ✓; tallinje/talföljd/hopp visar status per ruta\n');
SIDOR8.concat(SIDOR7).forEach(([sida, probe]) => {
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
