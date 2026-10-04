/* minus-grind.js — MINUS SKRIVS MED MINUSTECKEN (− U+2212), inte bindestreck (order 2026-10-04).
 *
 * SKÄLET. Eleven skriver − i rutan: autoSpace byter tecknet medan hon skriver. Men uppgiftstexten
 * visade "4x - 9" med bindestreck, och i åttans d3 fanns dessutom ett TREDJE tecken — tankstreck
 * (– U+2013) — i fyrtiotre mattesträngar, från transkriptionen ur docx. Tre olika minus på samma
 * sida, varav eleven bara kan skriva ett.
 *
 * Ingen grind mätte det. Yt-kontraktet mäter att keypadens − och tangentbordets - ger samma VÄRDE
 * (pNum), alltså att rättningen inte bryr sig om tecknet. Det är en annan fråga än vilket tecken
 * som STÅR i texten.
 *
 * VAD SOM MÄTS: all elevsynlig text i bladet — uppgiftsrader, gruppernas rubriker, valknappar,
 * facitrader och figurernas etiketter — läses ur den renderade sidan. Brott är ett bindestreck
 * eller tankstreck som står MELLAN TVÅ MATTETERMER (tal, parentes eller en ensam variabel).
 *
 * VAD SOM INTE ÄR BROTT: ett TALINTERVALL utan mellanrum ("2–4 faktorer" — bokens matematik
 * skriver alltid räknetecknet med mellanrum, och autoSpace lägger till dem i elevens ruta),
 * ett tankstreck som skiljer två satser ("Förenkla uttrycket – visa
 * mellanled" är Joachims egen rubrik), och ett bindestreck inuti ett ord ("x-axeln", "tre-vägs").
 * Gränsen är teckenomgivningen, inte raden: en RUBRIK kan innehålla matematik, och gör det.
 * Elevens egna inmatningar läses inte — de är inte bokens text.
 *
 * KÖR:  node verktyg/minus-grind.js [--sida <delsträng>] [--lista]
 *       --sabba   byter ett minustecken mot bindestreck i sidan → grinden MÅSTE fälla
 * Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('minus-grind.js');
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.blad())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = args.includes('--sabba');
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var SABBA = ${SABBA};
  var ut = { onerr: window.__onerr || null, texter: 0, brott: [], noter: [] };

  // En ensam variabel räknas som matteterm; ett ord gör det inte. Därför kräver bokstavsledet att
  // det INTE följer eller föregås av fler bokstäver: "x-axeln" är ett ord, "4x - 9" är matematik.
  var BOK = 'xyabcn';
  var MATTE = new RegExp(
    '(?:[0-9)]|(?:^|[^A-Za-z\\\\u00c0-\\\\u024f])[' + BOK + '])' +
    '\\\\s*[-\\\\u2013]\\\\s*' +
    '(?:[0-9(]|[' + BOK + '](?![A-Za-z\\\\u00c0-\\\\u024f]))');

  // Elevsynlig text i bladet. Keypaden och navigeringen är inte bokens text; elevens egna
  // inmatningar (input.value) är inte heller det.
  var ROTAR = '.blad-mount, .ovn-sheet, .ovn-wrap, .ak8-blad, .sheet';
  var UTE = '.keypad, .blad-nav, .blad-subnav, .nr-nav, .tabs, script, style';

  function synlig(el){
    var b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0;
  }

  var rotar = Array.prototype.filter.call(document.querySelectorAll(ROTAR), synlig);
  if(!rotar.length) rotar = [document.body];

  if(SABBA){
    // Byt ETT minustecken mot bindestreck i en uppgiftstext — exakt det fel grinden finns för.
    var m0 = null;
    rotar.forEach(function(rot){
      if(m0) return;
      Array.prototype.some.call(rot.querySelectorAll('.ovn-num, .ovn-text, text'), function(e){
        if(String(e.textContent).indexOf('\\u2212') < 0) return false;
        m0 = e; e.textContent = String(e.textContent).replace('\\u2212', '-'); return true;
      });
    });
    ut.noter.push(m0 ? 'SABBA: bytte ett minustecken mot bindestreck i "'
      + String(m0.textContent).slice(0, 40) + '"' : 'SABBA: hittade inget minustecken att byta');
  }

  var sedda = {};
  rotar.forEach(function(rot){
    // Varje textnod för sig: då pekar brottet på den text som faktiskt står i sidan, och
    // föräldrarnas sammanslagna textContent ger inte samma rad om och om igen.
    var gang = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        var p = n.parentElement;
        if(!p || p.closest(UTE)) return NodeFilter.FILTER_REJECT;
        if(!String(n.nodeValue).trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while((n = gang.nextNode())){
      var txt = String(n.nodeValue).replace(/\\s+/g, ' ').trim();
      ut.texter++;
      if(!/[-\\u2013]/.test(txt)) continue;
      // INTERVALL UNDANTAS: ett streck mellan tv\u00e5 rena tal utan mellanrum \u00e4r "2\u20134", inte "2 \u2212 4".
      // Bokens matematik skriver alltid r\u00e4knetecknet med mellanrum, och autoSpace l\u00e4gger till dem
      // i elevens ruta \u2014 d\u00e4rf\u00f6r \u00e4r mellanrummen den s\u00e4kra skillnaden.
      var utanIntervall = txt.replace(/(?:^|[^\\d])\\d+[-\\u2013]\\d+(?![\\d])/g, function(m){
        return m.replace(/[-\\u2013]/, '\\u2212');
      });
      if(!MATTE.test(utanIntervall)) continue;
      var p = n.parentElement;
      var adress = p.tagName.toLowerCase() + (p.getAttribute('class') ? '.' + p.getAttribute('class').split(/\\s+/).join('.') : '');
      var nyckel = adress + '|' + txt;
      if(sedda[nyckel]) continue;
      sedda[nyckel] = 1;
      ut.brott.push('"' + txt.slice(0, 70) + '"  (' + adress + ')');
    }
  });
  return ut;
})()`;

const TMP = path.join(os.tmpdir(), 'minusgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);

let fel = 0, texter = 0, sidor = 0;
console.log('MINUS-GRIND — minus skrivs med minustecken (−), inte bindestreck'
  + (SABBA ? '  [SABBA]' : '') + '\n');

Sidor.blad().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
    '--vanta-pa', 'blad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  const kort = sida.replace(/\/index\.html$/, '');
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + kort + ': JS-fel ' + u.onerr.slice(0, 2).join(' | ')); }

  MP.rakna(sida, u.texter);
  MP.varde(sida, 'minus', { texter: u.texter, brott: u.brott.length });
  sidor++; texter += u.texter;
  (u.noter || []).forEach(n => console.log('   ' + n));
  if(u.brott.length){
    fel += u.brott.length;
    console.log('✗ ' + kort + ' (' + u.brott.length + '):\n     ' + u.brott.slice(0, 6).join('\n     ')
      + (u.brott.length > 6 ? '\n     … och ' + (u.brott.length - 6) + ' till' : ''));
  } else {
    console.log('✓ ' + kort + ' (' + u.texter + ' texter)');
  }
});
try { fs.unlinkSync(TMP); } catch(e){}

fel += MP.granska();
console.log('\n' + (fel ? '✗ MINUS-GRIND RÖD (' + fel + ')' : '✓ MINUS-GRIND GRÖN')
  + ' · ' + sidor + ' sidor, ' + texter + ' texter lästa');
process.exit(fel ? 1 : 0);
