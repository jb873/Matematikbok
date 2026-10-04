/* figur-grind.js — EN FIGUR UTAN FORMGIVNING ÄR INTE OFORMAD, DEN ÄR SVART (order 2026-10-04).
 *
 * VARFÖR GRINDEN FINNS. Prislapparna i åttans d3 ritades helsvarta med nästan svart text ovanpå,
 * och ingen vakt såg det. Orsaken var att klasserna .af-lapp, .af-lapp-namn och .af-lapp-pris
 * uppfanns utan CSS — och SVG:s DEFAULT-FYLLNING ÄR SVART. Samma fälla gällde sträckfigurens
 * linjer, som fick en TEXTSTIL (.af-matt) och därför ritades utan stroke, alltså osynliga.
 *
 * Ingen befintlig grind mäter figurernas färg: yt-kontraktet mäter rutor, synlig-grinden mäter
 * om en plats leder någonstans, tonad-svepet mäter opacitet på kort. Figurens inre var omätt.
 *
 * TRE BEN, alla mätta som EFFEKT i datorn:
 *   SVART     en yta (rect, polygon, circle, path) inuti svg.af-svg med fill rgb(0, 0, 0).
 *             Varje figur i boken är formgiven; svart betyder glömd CSS, inte ett val.
 *             En text får vara nästan svart — det är brödtextens färg — men inte en YTA.
 *   OSYNLIG   en <line> med stroke none eller stroke-width 0: linjen finns i koden men ritas inte.
 *   KONTRAST  en text som ligger inuti en yta måste skilja sig från ytans fyllning. Mäts som
 *             avstånd i RGB; samma färg på text och botten betyder oläslig text.
 *
 * KÖR:  node verktyg/figur-grind.js [--sida <delsträng>] [--lista]
 *       --sabba svart     målar en yta svart        → SVART-benet måste fälla
 *       --sabba osynlig   lägger in en <line> med en textklass → OSYNLIG-benet måste fälla
 *       --sabba kontrast  ger en text sin egen bottens färg → KONTRAST-benet måste fälla
 * Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('figur-grind.js');
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.blad())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var SABBA = ${JSON.stringify(SABBA)};
  var ut = { onerr: window.__onerr || null, figurer: 0, ritade: 0, ytor: 0, linjer: 0, texter: 0,
             brott: [], noter: [] };

  function rgb(s){
    var m = String(s).match(/rgba?\\((\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)/);
    return m ? [ +m[1], +m[2], +m[3] ] : null;
  }
  function avstand(a, b){
    if(!a || !b) return 999;
    return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]);
  }
  function genomskinlig(s){ return /rgba\\(.*,\\s*0\\s*\\)/.test(String(s)) || String(s) === 'none'; }

  // Gå igenom varje figur som eleven kan se.
  // VARJE FIGUR I BLADETS YTA, ritad eller inte — och oavsett klass.
  //
  // Urvalet var förr svg.af-svg bland de RITADE, och då mättes sex figurer på en enda sida i hela
  // boken. Åttans d1 har sex af-svg i DOM:en och noll ritade när sidan öppnas; mönsterfigurerna
  // ritar <svg> helt utan klass (30 på d2-monster). Båda låg utanför grinden.
  //
  // Fyllning och stroke går att läsa på en OritaD figur — mätt: getComputedStyle gav
  // rgba(196,154,64,0.16) på en figur i ett blad som inte var framme. Geometri gör det inte, så
  // KONTRAST-benet mäter bara de ritade; det står i utskriften.
  //
  // GRÄNS: ett blad som byggs först vid klick finns inte i DOM:en när sidan öppnas, och syns inte
  // heller här (ak7/k3/d3-forenkla ger noll svg i bladytan).
  var ROTAR = '.blad-mount, .ovn-sheet, .ovn-wrap, .ak8-blad, .sheet';
  var rotar = Array.prototype.slice.call(document.querySelectorAll(ROTAR));
  if(!rotar.length) rotar = [document.body];
  var svgar = [];
  rotar.forEach(function(r){
    Array.prototype.forEach.call(r.querySelectorAll('svg'), function(x){
      if(svgar.indexOf(x) < 0) svgar.push(x);
    });
  });
  function ritad(s){
    var b = s.getBoundingClientRect();
    return s.getClientRects().length > 0 && b.width > 0 && b.height > 0;
  }
  svgar.forEach(function(sv, fi){
    ut.figurer++;
    var namn = (sv.getAttribute('aria-label') || ('figur ' + (fi + 1))).slice(0, 44);

    // SABBA återskapar exakt de tre fel som fanns på riktigt, inte påhittade varianter.
    if(SABBA === 'svart'){
      // Felet: en klass uppfanns utan CSS, och SVG:s default-fyllning är svart.
      var y0 = sv.querySelector('rect, polygon, circle, path');
      if(y0){ y0.style.fill = 'rgb(0, 0, 0)'; ut.noter.push('SABBA: m\\u00e5lade en yta svart i "' + namn + '"'); }
    }
    if(SABBA === 'osynlig'){
      // Felet: en TEXTSTIL sattes på ett <line>-element, som därför ritades utan stroke. Nivå 1
      // har inga linjer, så raden läggs in här — annars hade benet inte kunnat prövas alls.
      var l0 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l0.setAttribute('class', 'af-sokt-txt');       // en ren textklass: bär ingen stroke
      l0.setAttribute('x1', 4); l0.setAttribute('y1', 4);
      l0.setAttribute('x2', 40); l0.setAttribute('y2', 4);
      sv.appendChild(l0);
      ut.noter.push('SABBA: la in en <line> med en textklass i "' + namn + '"');
    }
    if(SABBA === 'kontrast' && ritad(sv)){
      // Felet: nästan svart text ovanpå en svart yta — texten fick sin bottens egen färg.
      var ytor0 = Array.prototype.slice.call(sv.querySelectorAll('rect, polygon, circle, path'));
      Array.prototype.some.call(sv.querySelectorAll('text'), function(t){
        var tb = t.getBoundingClientRect(), mx = tb.left + tb.width / 2, my = tb.top + tb.height / 2;
        var tr = ytor0.filter(function(y){
          var b = y.getBoundingClientRect();
          return mx >= b.left && mx <= b.right && my >= b.top && my <= b.bottom;
        })[0];
        if(!tr) return false;
        t.style.fill = getComputedStyle(tr).fill;
        ut.noter.push('SABBA: gav en text sin egen bottens f\\u00e4rg i "' + namn + '"');
        return true;
      });
    }

    // BEN 1 — svart yta
    sv.querySelectorAll('rect, polygon, circle, path').forEach(function(e){
      ut.ytor++;
      var f = getComputedStyle(e).fill;
      if(genomskinlig(f)) return;                       // medvetet ofylld: kanten bär formen
      var c = rgb(f);
      if(c && c[0] === 0 && c[1] === 0 && c[2] === 0){
        ut.brott.push('SVART YTA i "' + namn + '": <' + e.tagName.toLowerCase() + ' class="'
          + (e.getAttribute('class') || '') + '"> har fill ' + f
          + ' \\u2014 SVG:s default. Klassen saknar CSS.');
      }
    });

    // BEN 2 — osynlig linje
    sv.querySelectorAll('line').forEach(function(e){
      ut.linjer++;
      var c = getComputedStyle(e);
      if(c.stroke === 'none' || parseFloat(c.strokeWidth) === 0 || genomskinlig(c.stroke)){
        ut.brott.push('OSYNLIG LINJE i "' + namn + '": <line class="'
          + (e.getAttribute('class') || '') + '"> har stroke ' + c.stroke
          + ' och stroke-width ' + c.strokeWidth + ' \\u2014 den ritas inte.');
      }
    });

    // BEN 3 — text mot sin botten. Kräver geometri: måste veta vilken yta texten ligger ovanpå.
    // En oritad figur har inga rektanglar att jämföra, och mäts därför inte här.
    if(!ritad(sv)) return;
    ut.ritade++;
    var ytor = Array.prototype.slice.call(sv.querySelectorAll('rect, polygon, circle, path'));
    sv.querySelectorAll('text').forEach(function(t){
      ut.texter++;
      var tf = rgb(getComputedStyle(t).fill);
      var tb = t.getBoundingClientRect();
      if(!tb.width) return;
      var mx = tb.left + tb.width / 2, my = tb.top + tb.height / 2;
      // vilken yta ligger texten OVANPÅ?
      var under = null;
      ytor.forEach(function(y){
        var b = y.getBoundingClientRect();
        if(mx >= b.left && mx <= b.right && my >= b.top && my <= b.bottom) under = y;
      });
      if(!under) return;                                 // texten ligger utanför figuren
      var yf = getComputedStyle(under).fill;
      if(genomskinlig(yf)) return;
      var d = avstand(tf, rgb(yf));
      if(d < 90){
        ut.brott.push('TEXT MOT SIN BOTTEN i "' + namn + '": "'
          + (t.textContent || '').trim().slice(0, 18) + '" har fill ' + getComputedStyle(t).fill
          + ' p\\u00e5 en yta med ' + yf + ' \\u2014 avst\\u00e5nd ' + d + ', texten g\\u00e5r inte att l\\u00e4sa.');
      }
    });
  });
  return ut;
})()`;

const TMP = path.join(os.tmpdir(), 'figurgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);

let fel = 0, figurer = 0, ytor = 0, linjer = 0, texter = 0, sidorMedFigur = 0;
console.log('FIGUR-GRIND — en figur utan formgivning är inte oformad, den är svart'
  + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');

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

  // En sida utan figurer är utanför grindens område — men frånvaron bevisas (V14).
  MP.rakna(sida, u.figurer ? u.figurer : 1);
  MP.varde(sida, 'figurer', { figurer: u.figurer, ritade: u.ritade, ytor: u.ytor, linjer: u.linjer });
  if(!u.figurer) return;
  sidorMedFigur++; figurer += u.figurer; ytor += u.ytor; linjer += u.linjer; texter += u.texter;

  (u.noter || []).forEach(n => console.log('   ' + n));
  if(u.brott && u.brott.length){
    fel += u.brott.length;
    console.log('✗ ' + kort + ':\n     ' + u.brott.join('\n     '));
  } else {
    console.log('✓ ' + kort + ' (' + u.figurer + ' figurer, ' + u.ritade + ' ritade · '
      + u.ytor + ' ytor · ' + u.linjer + ' linjer · ' + u.texter + ' texter)');
  }
});
try { fs.unlinkSync(TMP); } catch(e){}

fel += MP.granska();
console.log('\n' + (fel ? '✗ FIGUR-GRIND RÖD (' + fel + ')' : '✓ FIGUR-GRIND GRÖN')
  + ' · ' + sidorMedFigur + ' sidor med figurer, ' + figurer + ' figurer, '
  + ytor + ' ytor, ' + linjer + ' linjer, ' + texter + ' texter');
process.exit(fel ? 1 : 0);
