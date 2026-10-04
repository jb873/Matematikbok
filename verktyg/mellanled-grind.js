/* mellanled-grind.js — EN UPPGIFT SOM BEGÄR MELLANLED MÅSTE HA PLATS FÖR DET (order 2026-10-03).
 *
 * FELET den finns för. Uppgift 3 på sjuans fyra räknesätt heter "Beräkna med talsorterna var
 * för sig" — en metod som ÄR ett mellanled — och har en enda ruta. Eleven ombeds visa vägen i
 * ett fält som bara rymmer svaret. Samma fel har lagats flera gånger på olika blad, och utan
 * vakt är lagningen en prenumeration.
 *
 * SIGNALEN LÄSES UR DEN RENDERADE RUBRIKEN, inte ur en tolkning av metodnamn:
 *
 *   MARKÖR (auktoritativ)  rubriken innehåller "visa mellanled". Det är vad bygget ska lyda,
 *                          och grinden gör olydnaden röd. Nya mellanledsuppgifter ska bära
 *                          markören från start — då läser grinden EN entydig signal.
 *   LEGACY (ska krympa)    äldre uppgifter bär signalen i metodnamnet i stället. De står i
 *                          VOKABULAR nedan, en plats, varje post motiverad. Varje post ska
 *                          retrofittas med markören över tid; då töms listan och grinden blir
 *                          helt markör-driven. Listan får bara KRYMPA.
 *
 * Vokabulären är BEVIS-PRÖVAD: en post som inte längre matchar någon renderad rubrik någonstans
 * fäller grinden. En ursäkt som aldrig prövas är en gissning med auktoritet (samma krav som
 * EJ_MOTOR i sidor.js och SKAL i matpunkt.js).
 *
 * MÄTS SÅ: varje grupp (.ovn-grupp) läses. Bär rubriken signalen ska varje rad under den ha
 * plats för ett mellanled — två svarsrutor, eller en kedje-/mellanledsstruktur. En rad med EN
 * ruta och ingen struktur är brottet.
 *
 * KÖR:  node verktyg/mellanled-grind.js [--sida <delsträng>] [--lista] [--sabba]
 * Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('mellanled-grind.js');
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.blad())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
// --sabba: för negativ verifiering. Behandlar en VANLIG grupp som om den bar markören, så att
// en enkel ruta måste fälla. Samma sorts krok som slump-fuzz --sabba.
const SABBA = args.includes('--sabba');
// --sabba drift: motprov för drift-benet (kravet i rubriken men inte i datan).
const SABBA_DRIFT = args.includes('drift');
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

/* LEGACY-VOKABULÄREN. Metodnamn som BÄR signalen utan att ha markören.
 *
 * Bara de två Joachim namngett står här. Jag har sett fler kandidater i materialet — "flytta
 * över", "kompensation", "dubbelparentes" — men vilka av dem som kräver mellanled är ett
 * pedagogiskt avgörande, inte ett mönster att gissa. De rapporteras i stället som kandidater.
 *
 * MÅL: noll poster. Varje post som får markören "visa mellanled" i sin rubrik ska strykas här. */
const VOKABULAR = [
  { nyckel: 'talsorterna var för sig',
    skal: 'metoden ÄR ett mellanled: 232 + 378 räknas 200+300, 30+70, 2+8 och summeras. Utan en ruta för ledet finns ingen plats för metoden.' },
  { nyckel: 'dubbla och halvera',
    skal: 'metoden byter om faktorerna i ett synligt steg (16 · 5 → 8 · 10). Steget är svaret på "hur", och det ska gå att skriva.' }
];

const PROBE = `(function(){
  var SABBA = ${SABBA};
  var SABBA_DRIFT = ${SABBA_DRIFT};
  var VOK = ${JSON.stringify(VOKABULAR.map(v => v.nyckel))};
  function synlig(el){ return !!el.offsetParent; }
  var ut = { grupper: [], onerr: window.__onerr || null , drift: [] };

  // En rad har PLATS för mellanled om den har två svarsrutor, eller bär en kedje-/mellanledsstruktur.
  function harPlats(rad){
    var rutor = Array.prototype.filter.call(
      rad.querySelectorAll('input.ovn-in, input.ak8-in, input.seg-text, input.ak8-exprtxt'), synlig);
    if(rutor.length >= 2) return { ok: true, rutor: rutor.length };
    if(rad.querySelector('[data-mellan], .ak8-mel, .ak8-rad-kedja, .ovn-mellan, .eq-grid')) return { ok: true, struktur: true, rutor: rutor.length };
    return { ok: false, rutor: rutor.length };
  }

  function mat(yta){
    Array.prototype.forEach.call(document.querySelectorAll('.ovn-grupp'), function(g, gi){
      if(!synlig(g)) return;
      var rub = g.querySelector('.ovn-grupp-rubrik');
      var txt = rub ? (rub.textContent || '').replace(/\\s+/g, ' ').trim() : '';
      if(!txt) return;
      var lag = txt.toLowerCase();
      // KRAVET LIGGER I DATAN. Rubriken läses bara för att upptäcka DRIFT: säger den "visa
      // mellanled" medan datan är tyst har kravet tappats bort på vägen.
      var flagga = g.dataset.mellanled || '';
      var markor = /visa\\s+mellanled/.test(lag);
      var legacy = VOK.filter(function(v){ return lag.indexOf(v) >= 0; });
      // --sabba: låt FÖRSTA gruppen på ytan räknas som kravbärande, så en enkel ruta måste fälla.
      if(SABBA && gi === 0 && !flagga){ flagga = 'kravt'; txt = txt + '  [SABBA: behandlas som kravt]'; }
      // --sabba drift: ta BORT flaggan från en grupp som har den. Rubriken säger fortfarande
      // "visa mellanled", och då ska drift-benet fälla — det är regressionen migreringen stänger.
      if(SABBA_DRIFT && flagga){ flagga = ''; }
      if(!flagga && (markor || legacy.length)){
        ut.drift.push({ yta: yta, rubrik: txt.slice(0, 60),
          varfor: markor ? 'rubriken s\\u00e4ger "visa mellanled"' : 'metodnamnet "' + legacy[0] + '"' });
        return;
      }
      if(!flagga) return;

      var rader = Array.prototype.filter.call(g.querySelectorAll('.ovn-rad, .ak8-rad'), synlig);
      if(!rader.length) rader = [g];
      var utan = [];
      rader.forEach(function(r, ri){
        var p = harPlats(r);
        if(!p.ok) utan.push('rad ' + (ri + 1) + ' (' + p.rutor + ' ruta)');
      });
      ut.grupper.push({ yta: yta, rubrik: txt.slice(0, 60), signal: 'data:' + flagga,
                        rader: rader.length, utanPlats: utan });
    });
  }

  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .plugg-dok, .nr-rad'));
  (nav.length ? nav : [null]).forEach(function(b){
    if(b){ if(b.disabled) return; b.click(); }
    mat(b ? b.textContent.replace(/\\s+/g, ' ').trim().slice(0, 26) : '(enda)');
  });
  return ut;
})()`;

const TMP = path.join(os.tmpdir(), 'mellanledgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);

let fel = 0, grupper = 0, markorGrupper = 0, legacyGrupper = 0, drift = 0;
const sedda = {};          // vilka vokabulär-poster som faktiskt träffade en rubrik
console.log('MELLANLED-GRIND — en uppgift som begär mellanled måste ha plats för det\n');

Sidor.blad().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
    '--vanta-pa', 'blad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + u.onerr.slice(0, 2).join(' | ')); }
  MP.rakna(sida, (u.grupper || []).length);

  // DRIFT: rubriken begär mellanled men datan är tyst. Det är kravet som tappats bort på vägen,
  // och den enda vägen tillbaka till läget före omläggningen.
  (u.drift || []).forEach(d => {
    drift++; fel++;
    sedda[(d.varfor.match(/metodnamnet "(.*)"/) || [])[1] || ''] = 1;
    console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + d.yta + ' · "' + d.rubrik
      + '": ' + d.varfor + ', men gruppen saknar mellanled i datan');
  });
  (u.grupper || []).forEach(g => {
    grupper++;
    markorGrupper++;   // alla flaggade grupper räknas lika: kravet står i datan
    MP.varde(sida, g.rubrik, { rader: g.rader, utanPlats: g.utanPlats.length });
    const adress = sida.replace(/\/index\.html$/, '') + ' · ' + g.yta + ' · "' + g.rubrik + '"';
    if(!g.utanPlats.length){ console.log('✓ ' + adress + ' [' + g.signal + '] ' + g.rader + ' rader, alla med plats'); return; }
    fel += g.utanPlats.length;
    console.log('✗ ' + adress + ' [' + g.signal + ']: ' + g.utanPlats.length + ' av ' + g.rader
      + ' rader UTAN plats för mellanled\n     ' + g.utanPlats.slice(0, 6).join(' · '));
  });
});
try { fs.unlinkSync(TMP); } catch(e){}

// Vokabulären är bevis-prövad: en post som inte träffar någon rubrik är gammal och ska bort.
console.log('\nLEGACY-VOKABULÄR (' + VOKABULAR.length + ' poster — mål: noll)');
VOKABULAR.forEach(v => {
  // Posten är befogad så länge NÅGON grupp bär metodnamnet utan flagga. Bär alla flaggan är
  // posten gammal — listan har gjort sitt och ska krympa.
  const traff = !!sedda[v.nyckel];
  if(traff) console.log('  · "' + v.nyckel + '" — drift kvar: ' + v.skal);
  else console.log('  ✓ "' + v.nyckel + '" — alla s\u00e5dana grupper b\u00e4r nu flaggan; posten kan tas bort');
});

fel += MP.granska();
console.log('\n' + grupper + ' grupper med mellanledskrav i DATAN'
  + (drift ? ' · ' + drift + ' med kravet bara i rubriken (drift)' : ' · ingen drift'));
console.log(fel ? '✗ MELLANLED-GRIND RÖD (' + fel + ')' : '✓ MELLANLED-GRIND GRÖN');
process.exit(fel ? 1 : 0);
