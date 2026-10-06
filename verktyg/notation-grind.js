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

   Kör:  node verktyg/notation-grind.js [--sida d3] [--sabba mellanrum|fortecken|blandad]
   Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('notation-grind.js');   // V14
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.alla())) process.exit(0);
const BARA  = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
const PRE = `(function(){ var s = 0x2F6E2B1; Math.random = function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); }); try { localStorage.clear(); } catch(e){} })();`;

const PROBE = `(function(){
  var SABBA = ${JSON.stringify(SABBA)};
  var ut = { onerr: window.__onerr || null, blad: [], noter: [] };
  function synlig(e){ return e.getClientRects && e.getClientRects().length > 0; }
  var TERM_F = '0-9xyabcn\\\\)', TERM_E = '0-9xyabcn\\\\(';

  function matSheet(namn, sh){
    var b = { blad: namn, texter: 0, brak: 0, brott: [] };

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
      var br = Array.prototype.filter.call(sh.querySelectorAll('.ovn-brak, .brak'), synlig)[0];
      if(br){ br.parentNode.insertBefore(document.createTextNode('2\\u00a0'), br);
        ut.noter.push('SABBA: satte ett heltal med mellanrum fore ett stablat brak'); }
    }

    var gang = document.createTreeWalker(sh, NodeFilter.SHOW_TEXT, null), nod;
    while((nod = gang.nextNode())){
      var mor = nod.parentElement;
      if(!mor || !synlig(mor) || mor.tagName === 'INPUT') continue;
      if(mor.closest('.ovn-brak, .brak, .pot, sup, .keypad, .nr-lager, .blad-nav, .blad-subnav')) continue;
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
    Array.prototype.forEach.call(sh.querySelectorAll('.ovn-brak, .brak'), function(brak){
      if(!synlig(brak)) return;
      b.brak++;
      var f = brak.previousSibling;
      if(f && f.nodeType === 3 && /[0-9]\\s+$/.test(f.nodeValue))
        b.brott.push('K-I BLANDAD FORM MED MELLANRUM: "' + f.nodeValue.replace(/\\s+$/, '_').slice(-8)
          + '[brak]" — heltalet hor ihop med brakdelen');
    });
    ut.blad.push(b);
  }

  function hittaText(rot, monster){
    var g = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT, null), n;
    while((n = g.nextNode())){
      var mor = n.parentElement;
      if(!mor || !synlig(mor) || mor.tagName === 'INPUT') continue;
      if(mor.closest('.ovn-brak, .brak, .pot, sup, .keypad')) continue;
      if(monster.test(n.nodeValue)) return n;
    }
    return null;
  }

  // EN FLIK I TAGET, mätt medan fliken är framme.
  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
  var sedda = [];
  (nav.length ? nav : [null]).forEach(function(knapp){
    if(knapp){ if(knapp.disabled) return; knapp.click(); }
    Array.prototype.forEach.call(document.querySelectorAll('.ovn-sheet, .ak8-sheet'), function(sh){
      if(sedda.indexOf(sh) >= 0 || !synlig(sh)) return;
      sedda.push(sh);
      var h = sh.querySelector('h2');
      var namn = h ? String(h.textContent).replace(/\\s+/g, ' ').trim() : 'blad ' + sedda.length;
      matSheet(namn.length > 30 ? '…' + namn.slice(-29) : namn, sh);
    });
  });
  return ut;
})()`;

let fel = 0, texter = 0, brak = 0, blad = 0;
console.log('NOTATION-GRIND — K-G mellanrum kring räknetecken · K-I blandad form tätt ihop'
  + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');

Sidor.alla().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const tmp = path.join(os.tmpdir(), 'notation-' + process.pid + '.js');
  const pre = path.join(os.tmpdir(), 'notation-pre-' + process.pid + '.js');
  fs.writeFileSync(tmp, PROBE); fs.writeFileSync(pre, PRE);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), tmp,
    '--pre', pre, '--vanta-pa', 'blad', '--timeout', '90000'], { encoding: 'utf8', timeout: 150000 });
  let ut = null; try { ut = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!ut){ fel++; console.log('✗ ' + sida + ': inget svar — ' + (r.stderr || '').trim().split('\n').pop()); return; }
  if(ut.onerr && ut.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + ut.onerr.join(' | ')); }
  (ut.noter || []).forEach(n => console.log('   ' + n));
  MP.rakna(sida, (ut.blad || []).length);
  (ut.blad || []).forEach(b => {
    blad++; texter += b.texter; brak += b.brak;
    MP.varde(sida, b.blad, { texter: b.texter, brak: b.brak });
    fel += b.brott.length;
    console.log((b.brott.length ? '✗ ' : '✓ ') + sida.replace(/\/index\.html$/, '') + ' · ' + b.blad
      + ': ' + b.texter + ' mattetexter, ' + b.brak + ' bråk'
      + (b.brott.length ? '\n     ' + b.brott.slice(0, 4).join('\n     ')
         + (b.brott.length > 4 ? '\n     … och ' + (b.brott.length - 4) + ' till' : '') : ''));
  });
  try { fs.unlinkSync(tmp); fs.unlinkSync(pre); } catch(e){}
});

fel += MP.granska();   // V14
console.log('\n' + (fel ? '✗ NOTATION-GRIND RÖD (' + fel + ')' : '✓ NOTATION-GRIND GRÖN')
  + ' · ' + blad + ' blad, ' + texter + ' mattetexter, ' + brak + ' bråk');
process.exit(fel ? 1 : 0);
