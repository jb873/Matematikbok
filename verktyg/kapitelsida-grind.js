/* kapitelsida-grind.js — KAPITELSIDAN SOM KONTRAKT (order 2026-09-29).

   MÖNSTRET som gav ordern: sex kapitelsidor, sex olika utseenden. Sjuans k1 var förlagan, och
   åttans k1 avvek i nästan allt — kicker utan linjer och i omvänd ordning, rubrik i fel typsnitt
   (sidan laddade aldrig fonts.css), ingen "← Alla kapitel", ingen DELKAPITEL-etikett, numrerade
   cirklar i stället för DEL N, bladnamn i stället för beskrivning, och BYGGER på elva delkapitel
   som alla var byggda och i bruk.

   Det som är en FUNKTION ärvs; det som är en KOPIA ärvs inte. Kapitelsidan är därför en delad
   renderare (js/kapitel/kapitelsida.js) och den här grinden vaktar att den används.

   KRÄVS PER KAPITELSIDA (mätt i riktig webbläsare, inte i källkoden)
     RENDERARE     sidan är monterad via Kapitelsida.montera
     STIL          ingen kapitelsidestil inline — navsida.css är källan
     TYPSNITT      rubriken står i Cormorant (fonts.css laddad)
     HUVUD         kicker med linjer, ordningen Kapitel N · Årskurs N, ingress
     TILLBAKA      "← Alla kapitel" finns och leder till en sida som finns
     ETIKETT       sektionsetiketten Delkapitel
     KORT          blå vänsterkant, DEL N, och antingen en länk till innehåll
                   eller ett kommer-kort som är tonat, omärkt med pil och utan <a>
     (GRÄNS: grinden ser inte att ett kort BORDE vara dött. Ett kort som pekar på en sida som
      finns men är tom ser likadant ut som ett som pekar på innehåll. Den regeln bärs av datan
      — sidan härleder öppenheten ur innehållet, inte ur ett fält — inte av mätningen här.)
     LEDER RÄTT    varje länk pekar på en fil som finns på disk
     HANDSATT      inget status-fält i kapiteldatan — statusen härleds ur innehållet

   KÖR:  node verktyg/kapitelsida-grind.js [--sida <delsträng>]
   Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

// Kapitelsidorna: en sida per kapitel, den som listar delkapitlen.
const SIDOR = [
  'ak7-k1.html', 'ak7-k2.html', 'ak7-k3.html',
  'ak8/k1/index.html', 'ak8/k2/index.html', 'ak9/k1/index.html'
];
// Kapiteldata som inte får bära ett handsatt status-fält.
const DATA = ['js/data/ak8-k1-bok.js', 'js/data/ak9-k1-bok.js'].concat(SIDOR);

const PROBE = `(function(){
  var brott = [];
  function finns(sel){ return !!document.querySelector(sel); }

  // RENDERARE — mätt som effekt: modulen är laddad och har ritat sidans huvud.
  if(!window.Kapitelsida) brott.push('RENDERARE: Kapitelsida saknas (sidan rullar egen markup)');

  // STIL — kapitelsidestil får inte ligga inline. Andra sidors stilar (elevfeedback m.fl.)
  // injiceras i huvudet vid körning; det som räknas är om SIDAN bär kapitelsidans regler själv.
  var egna = Array.prototype.filter.call(document.querySelectorAll('head style'), function(s){
    return /\\.nav-card|\\.card-grid|\\.hero-eyebrow|\\.card-stripe|\\.section-label/.test(s.textContent || '');
  });
  if(egna.length) brott.push('STIL: ' + egna.length + ' inline-block med kapitelsidestil (navsida.css är källan)');
  var lankad = Array.prototype.some.call(document.querySelectorAll('link[rel=stylesheet]'), function(l){
    return /navsida\\.css/.test(l.getAttribute('href') || ''); });
  if(!lankad) brott.push('STIL: navsida.css inte länkad');

  // TYPSNITT — rubriken ska stå i Cormorant. Åttans k1 föll tillbaka på Source Serif för att
  // sidan aldrig laddade fonts.css.
  // MÄTT SOM EFFEKT: getComputedStyle().fontFamily ger den DEKLARERADE listan, inte det typsnitt
  // som faktiskt laddats — den säger 'Cormorant Garamond' även när filen inte finns, och
  // webbläsaren i själva verket ritar Georgia. document.fonts.check svarar på det som gäller.
  var h1 = document.querySelector('h1.hero-title');
  if(!h1) brott.push('HUVUD: h1.hero-title saknas');
  else {
    var cs = getComputedStyle(h1);
    if(!/Cormorant/.test(cs.fontFamily))
      brott.push('TYPSNITT: rubriken begär ' + cs.fontFamily.split(',')[0] + ' (väntat Cormorant)');
    else {
      // document.fonts.check svarar JA om typsnittet råkar vara installerat på maskinen — då mäter
      // man datorn, inte sidan. Det som gäller för eleven är om SIDAN laddar typsnittet själv:
      // en FontFace i dokumentets uppsättning kommer från en @font-face-regel, alltså från fonts.css.
      var egen = false;
      if(document.fonts && document.fonts.forEach)
        document.fonts.forEach(function(f){ if(/Cormorant/.test(f.family)) egen = true; });
      if(!egen) brott.push('TYPSNITT: sidan laddar inget Cormorant-typsnitt själv — fonts.css inte länkad');
    }
  }

  // HUVUD — kicker med linjer på båda sidor, i ordningen Kapitel N · Årskurs N.
  var eb = document.querySelector('.hero-eyebrow');
  if(!eb) brott.push('HUVUD: kicker saknas');
  else {
    var f = getComputedStyle(eb, '::before').width, e = getComputedStyle(eb, '::after').width;
    if(f === 'auto' || e === 'auto' || parseFloat(f) <= 0) brott.push('HUVUD: kickern saknar linjer');
    if(!/^Kapitel\\s+\\d+\\s+·\\s+Årskurs\\s+\\d+$/.test(eb.textContent.trim()))
      brott.push('HUVUD: kickern lyder "' + eb.textContent.trim() + '" (väntat Kapitel N · Årskurs N)');
  }
  if(!finns('.hero-desc')) brott.push('HUVUD: ingress saknas');

  // TILLBAKA
  var back = document.querySelector('.hero-back');
  if(!back) brott.push('TILLBAKA: "← Alla kapitel" saknas');

  // ETIKETT — sektionsetiketten Delkapitel (kapitel-fotens egna etiketter räknas inte).
  var etiketter = Array.prototype.map.call(document.querySelectorAll('.section-label'), function(e){ return e.textContent.trim(); });
  if(etiketter.indexOf('Delkapitel') < 0) brott.push('ETIKETT: sektionsetiketten Delkapitel saknas (fann: ' + etiketter.join(' / ') + ')');

  // KORTEN
  var kort = Array.prototype.slice.call(document.querySelectorAll('#delkapitel-grid .nav-card'));
  if(!kort.length) brott.push('KORT: inga delkapitelkort');
  var lankar = [];
  kort.forEach(function(k, i){
    var nr = k.querySelector('.card-num');
    if(!nr || !/^Del\\s+\\d+$/.test(nr.textContent.trim()))
      brott.push('KORT ' + (i + 1) + ': numret lyder "' + (nr ? nr.textContent.trim() : '(saknas)') + '" (väntat Del N)');
    var stripe = k.querySelector('.card-stripe');
    var prov = k.classList.contains('is-prov'), fordj = k.classList.contains('is-fordjupning');
    if(!stripe) brott.push('KORT ' + (i + 1) + ': vänsterkant saknas');
    else if(!prov && !fordj && getComputedStyle(stripe).backgroundColor !== 'rgb(27, 75, 138)')
      brott.push('KORT ' + (i + 1) + ': vänsterkanten är ' + getComputedStyle(stripe).backgroundColor + ' (väntat blå)');

    if(k.tagName === 'A'){
      if(!k.getAttribute('href')) brott.push('KORT ' + (i + 1) + ': länk utan mål');
      else lankar.push(k.getAttribute('href'));
    } else {
      // kommer-kort: tonat, utan pil, utan länk, märkt för den som inte ser
      if(getComputedStyle(k).opacity === '1') brott.push('KORT ' + (i + 1) + ': kommer-kort inte tonat');
      if(getComputedStyle(k).pointerEvents !== 'none') brott.push('KORT ' + (i + 1) + ': kommer-kort går att klicka på');
      if(k.querySelector('.card-arrow')) brott.push('KORT ' + (i + 1) + ': kommer-kort har pil');
      if(k.getAttribute('aria-disabled') !== 'true') brott.push('KORT ' + (i + 1) + ': kommer-kort saknar aria-disabled');
    }
  });

  return { onerr: window.__onerr || null, brott: brott, kort: kort.length,
           lankar: lankar, tillbaka: back ? back.getAttribute('href') : null };
})()`;

// ── HANDSATT STATUS i kapiteldatan (källkod, inte DOM) ──────────────────────────────────────
// Statusen ska härledas ur innehållet. Ett status-fält gick att sätta för hand, och gjorde det:
// åttans elva delkapitel stod som 'bygger' medan alla elva var byggda, nians nio som 'skelett'
// medan sju var tomma och två byggda. Fältet får inte komma tillbaka.
function handsattStatus(){
  const ut = [];
  DATA.forEach(f => {
    const p = path.join(ROOT, f);
    if(!fs.existsSync(p)) return;
    const s = fs.readFileSync(p, 'utf8');
    // bara i kapiteldata: status på ett delkapitel-objekt (fil/nr i samma post)
    const rader = s.split('\n');
    rader.forEach((rad, i) => {
      if(/\bstatus\s*:\s*['"](open|soon|bygger|skelett|kommer)['"]/.test(rad) && /\b(nr|fil)\s*:/.test(rad))
        ut.push(f + ':' + (i + 1) + ' — ' + rad.trim().slice(0, 90));
    });
  });
  return ut;
}

const TMP = path.join(os.tmpdir(), 'kapsida-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);
let fel = 0, matta = 0;
console.log('KAPITELSIDE-GRIND — kapitelsidan är renderaren, statusen härleds\n');

SIDOR.forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
                               '--vanta-pa', 'laddad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ fel++; console.log('✗ ' + sida + ': inget svar från sidan'); return; }
  matta++;
  const brott = u.brott.slice();
  if(u.onerr && u.onerr.length) brott.push('JS-FEL: ' + u.onerr.join(' | '));

  // LEDER RÄTT — varje länk ska peka på något som finns. Frågetecken och ankare skalas bort.
  const katalog = path.dirname(path.join(ROOT, sida));
  u.lankar.concat(u.tillbaka ? [u.tillbaka] : []).forEach(h => {
    if(/^(https?:|mailto:|#)/.test(h)) return;
    const mal = path.resolve(katalog, decodeURIComponent(h.split('?')[0].split('#')[0]));
    if(!fs.existsSync(mal)) brott.push('LEDER RÄTT: ' + h + ' finns inte');
  });

  if(brott.length){ fel += brott.length; console.log('✗ ' + sida + ' (' + u.kort + ' kort)\n     ' + brott.join('\n     ')); }
  else console.log('✓ ' + sida + ' · ' + u.kort + ' kort, ' + u.lankar.length + ' leder till innehåll');
});
try { fs.unlinkSync(TMP); } catch(e){}

const hand = handsattStatus();
if(hand.length){ fel += hand.length; console.log('\n✗ HANDSATT STATUS i kapiteldata:\n     ' + hand.join('\n     ')); }
else console.log('\n✓ HANDSATT STATUS: inget status-fält i kapiteldatan');

console.log('\n' + (fel ? '✗ KAPITELSIDE-GRIND RÖD (' + fel + ')' : '✓ KAPITELSIDE-GRIND GRÖN')
  + ' · ' + matta + ' kapitelsidor');
process.exit(fel ? 1 : 0);
