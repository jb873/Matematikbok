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
 * BRÅK-BENET: ett snedstreck mellan två termer är ett bråk som inte staplats. Samma princip,
 * samma grind — båda handlar om vilket TECKEN som står i elevsynlig matematik. "kr/kg" är en
 * enhet och rörs inte.
 *
 * KÖR:  node verktyg/minus-grind.js [--sida <delsträng>] [--lista]
 *       --sabba   byter ett minustecken mot bindestreck i sidan → grinden MÅSTE fälla
 *       --sabba brak  skriver in ett platt bråk i en uppgiftstext → BRÅK-benet måste fälla
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
// --sabba brak: motprov för BRÅK-benet (platt bråk i elevsynlig matematik).
const SABBA_BRAK = args.includes('brak');
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var SABBA = ${SABBA};
  var SABBA_BRAK = ${SABBA_BRAK};
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

  // EN FLIK I TAGET: varje nivå har sin egen text, och bara en syns åt gången.
  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
  var rotar = [];
  (nav.length ? nav : [null]).forEach(function(b){
    if(b){ if(b.disabled) return; b.click(); }
    Array.prototype.filter.call(document.querySelectorAll(ROTAR), synlig).forEach(function(r){
      if(rotar.indexOf(r) < 0) rotar.push(r);
    });
  });
  if(!rotar.length) rotar = [document.body];

  if(SABBA_BRAK){
    // Skriv in ett PLATT bråk i en uppgiftstext — exakt det fel benet finns för.
    var b0 = null;
    rotar.forEach(function(rot){
      if(b0) return;
      b0 = rot.querySelector('.ovn-num, .ovn-text');
    });
    if(b0){ b0.textContent += ' 3x/4'; ut.noter.push('SABBA: skrev in ett platt br\\u00e5k "3x/4" i en uppgiftstext'); }
  }
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
      // BRÅK-BENET: ett snedstreck mellan två TERMER är ett bråk som inte staplats. "kr/kg" rörs
      // inte — båda sidor är två bokstäver utan siffra, alltså en enhet.
      // ORDGRÄNSER: utan dem fångas "r/k" ur "kr/kg" och enheten räknas som ett bråk. Snedstrecket
      // räknas bara när hela termen står på var sida — "4b/5" ja, "kr/kg" nej.
      var _br = txt.match(/(^|[^\\w])(\\d*[a-zA-Z]?)\\s*\\/\\s*(\\d*[a-zA-Z]?)(?![\\w])/g) || [];
      _br.forEach(function(bit){
        var d2 = bit.split('/');
        var t2 = (d2[0] || '').trim(), n2 = (d2[1] || '').trim();
        if(!t2 || !n2) return;
        if(!/\\d/.test(t2) && !/\\d/.test(n2) && t2.length > 1 && n2.length > 1) return;   // enhet
        var p2 = n.parentElement;
        var a2 = p2.tagName.toLowerCase() + (p2.getAttribute('class') ? '.' + p2.getAttribute('class').split(/\\s+/).join('.') : '');
        var ny = 'BR\\u00c5K: "' + bit.trim() + '" i "' + txt.slice(0, 50) + '" (' + a2 + ') \\u2014 br\\u00e5k st\\u00e5r staplade';
        if(ut.brott.indexOf(ny) < 0) ut.brott.push(ny);
      });
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
      ut.brott.push('MINUS: "' + txt.slice(0, 70) + '"  (' + adress + ')');
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
