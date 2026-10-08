/* kontroll-svep.js — mäter rutor OCH valrutnät (valrutnäten tillagda 2026-10-02) — KONTROLLERA FÅR INTE GE BORT FACIT (order 2026-09-30).

   En elev rapporterade det: svara på EN uppgift, tryck Kontrollera, och alla andra visas som fel
   med rätt svar utskrivet. Bladet är förbrukat efter första trycket.

   Värst drabbas det noggranna arbetssättet: vissa elever gör en uppgift i taget och trycker
   Kontrollera efter varje. Det är precis vad bladen ska tillåta.

   REGELN
     · Kontrollera rättar bara rutor eleven SVARAT i
     · Tomma rutor lämnas omarkerade — ingen färg, inget kryss
     · Facit visas bara för en ruta eleven svarat i, och först efter rättning
     · Den obesvarade rutan räknas ändå i nämnaren: uppgiften finns kvar att göra

   MÄTS SÅ: svara rätt på EN ruta, tryck Kontrollera, och räkna hur många TOMMA rutor som fick
   en markering eller ett facit. Allt över noll är brottet eleven såg.

   KÖR:  node verktyg/kontroll-svep.js [--sida <delsträng>]
   Exit 1 när en tom ruta rättas. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const LAS_UPP = require('./niva-las-upp').snutt;   // nivåstegen upplåsta innan mätning
const MP = require('./matpunkt').skapa('kontroll-svep.js');   // V14
const args = process.argv.slice(2);
if(Sidor.lista(args, sidor())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  function synlig(el){ return !!el.offsetParent; }
  function status(i){
    var c = ' ' + (i.className || '') + ' ';
    return /\\s(correct|ak8-ok)\\s/.test(c) ? 'ratt' : /\\s(wrong|ak8-fel)\\s/.test(c) ? 'fel' : '';
  }
  function facitEl(root){
    return Array.prototype.filter.call(root.querySelectorAll('.ovn-fasit, .ak8-fasit'), synlig);
  }
  function kontrollKnapp(){
    return Array.prototype.slice.call(document.querySelectorAll('button'))
      .filter(function(b){ return /kontroll/i.test(b.textContent) && synlig(b); })[0];
  }

  var ut = { onerr: null, blad: [] };
  /* NIVÅRADEN: ett blad med steg visar bara det aktiva, och ett ostett steg är ett omätt
     blad. Svepet lägger till ett jobb per extra steg och frågar om knapparna på nytt per
     varv — bladet byggs om vid klick, så en hållen knapp är ett löst element. */
  function synligMount(){
    return Array.prototype.filter.call(document.querySelectorAll('.blad-mount'), function(e){ return !e.hidden && e.offsetParent; })[0]
        || Array.prototype.filter.call(document.querySelectorAll('.ovn-sheet'), function(e){ return !!e.offsetParent; })[0]
        || document.body;
  }
  /* Bara den DELADE raden vandras: bladet anmäler sina steg i data-nivaer. Se filhuvudet för
     mätningen bakom gränsen. */
  function nivaKnappar(){
    var m = synligMount();
    var ark = m.querySelector('[data-nivaer]') || (m.matches && m.matches('[data-nivaer]') ? m : null);
    return ark ? ark.querySelectorAll('.niva-rad .niva-btn') : [];
  }
  /* Stegen låses upp först — delad snutt, se verktyg/niva-las-upp.js. */
  ${LAS_UPP}
  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
  var jobb = (nav.length ? nav : [null]).map(function(b){ return { knapp: b, niva: null }; });
  function kor(j){
    var b = j.knapp;
    var nivaNamn = j.niva === null ? '' : ' niv\u00e5 ' + (j.niva + 1);
    if(b){ if(b.disabled) return; b.click(); }
    if(j.niva === null){
      var steg = nivaKnappar().length;
      for(var n = 1; n < steg; n++) jobb.push({ knapp: b, niva: n });
    } else {
      var nb = nivaKnappar()[j.niva]; if(!nb || nb.disabled) return; nb.click();
    }
    var mount = Array.prototype.filter.call(document.querySelectorAll('.blad-mount'), function(e){ return !e.hidden && e.offsetParent; })[0]
             || document.querySelector('.ovn-sheet') || document.body;
    var rutor = Array.prototype.filter.call(mount.querySelectorAll('input.ovn-in, input.ak8-in'), synlig)
      .filter(function(i){ return !i.disabled && !i.readOnly; });
    // Valrutnäten mäts med samma regel som rutorna. Ett blad som BARA har rutnät mättes förut
    // inte alls — det föll ur på raden nedan.
    var grids = Array.prototype.filter.call(
      mount.querySelectorAll('.ovn-val-grid, .tl-valgrid, .val-rad, .ovn-flerval-grid'), synlig);
    // UPPSTÄLLNINGAR (radtyp 'uppstallning'): uppställningen är EN enhet, som mellanledet. En helt
    // tom uppställning är obesvarad — ingen av dess rutor får markeras. Rutorna bär inte .ovn-in och
    // står därför utanför listan ovan; utan det här mätte svepet runt raden.
    var uppst = Array.prototype.filter.call(mount.querySelectorAll('.ovn-uppst'), synlig);
    if(!rutor.length && !grids.length && !uppst.length) return;
    // Vilka rutnät är OBESVARADE när vi trycker? Dem får rättningen inte markera.
    var gridsUtanVal = grids.filter(function(g){ return !g.querySelector('.is-vald, .selected'); });

    // EN ruta besvaras; resten lämnas tomma. Finns facit i DOM skrivs det rätta svaret, annars
    // en etta — provet gäller de ANDRA rutorna, och om det besvarade är rätt eller fel spelar
    // ingen roll för dem. Utan reserven testades åttans blad aldrig: deras facit bor i radens
    // data, inte i ett attribut, så ingen ruta besvarades och provet mätte ingenting.
    var mal = rutor.filter(function(i){ return i.getAttribute('data-svar') || i.getAttribute('data-visa'); })[0] || rutor[0] || null;
    var svarad = mal;
    if(mal){
      mal.focus(); mal.dispatchEvent(new Event('focusin', { bubbles: true }));
      mal.value = mal.getAttribute('data-svar') || mal.getAttribute('data-visa') || '1';
      mal.dispatchEvent(new Event('input', { bubbles: true }));
    }
    var kn = kontrollKnapp();
    if(!kn){ ut.blad.push({ blad: (b ? b.textContent.trim() : '(enda)') + nivaNamn, fel: 'ingen Kontrollera-knapp' }); return; }
    var facitFore = facitEl(mount).length;
    kn.click();

    var tomma = rutor.filter(function(i){ return i !== svarad && String(i.value).trim() === ''; });
    var markerade = tomma.filter(function(i){ return status(i) !== ''; });
    var facitEfter = facitEl(mount);
    // facit som hör till en TOM ruta
    var facitPaTom = facitEfter.filter(function(f){
      var rad = f.parentElement;
      var i = rad && rad.querySelector('input.ovn-in, input.ak8-in');
      return i && String(i.value).trim() === '';
    });
    // Ett obesvarat rutnät som fått correct/wrong pekar ut svaret. Vi räknar rutnäten, inte
    // knapparna: ett rutnät med en grön knapp har gett bort sin uppgift, hur många knappar det
    // än har.
    var valUtanVal = gridsUtanVal.filter(function(g){ return g.querySelector('.correct, .wrong'); });
    var uppstMarkerade = 0;
    uppst.forEach(function(u){
      var c = Array.prototype.slice.call(u.querySelectorAll('.mult-upp-ans'));
      if(c.every(function(i){ return String(i.value).trim() === ''; }))
        uppstMarkerade += c.filter(function(i){ return status(i) !== ''; }).length
          + (u.nextElementSibling && u.nextElementSibling.classList.contains('ovn-mark') ? 1 : 0);
    });
    ut.blad.push({
      blad: (b ? b.textContent.trim() : '(enda)') + nivaNamn,
      rutor: rutor.length, tomma: tomma.length,
      markerade: markerade.length,
      facitPaTom: facitPaTom.length,
      valRutnat: grids.length, valObesvarade: gridsUtanVal.length, valUtanVal: valUtanVal.length,
      uppst: uppst.length, uppstMarkerade: uppstMarkerade,
      valExempel: valUtanVal.slice(0, 2).map(function(g){
        var k = g.querySelector('.correct');
        return (k ? k.textContent.trim().slice(0, 14) : '?') + ' markerad utan val';
      }),
      svaradStatus: svarad ? status(svarad) : '(ingen ruta med facit)',
      exempel: facitPaTom.slice(0, 2).map(function(f){ return f.textContent.replace(/\\s+/g, ' ').trim().slice(0, 34); })
    });
  }
  /* length läses varje varv: nivåjobben läggs till medan listan betas av. */
  for(var ji = 0; ji < jobb.length; ji++) kor(jobb[ji]);
  ut.onerr = window.__onerr || null;
  return ut;
})()`;

// Bladsidorna i alla tre årskurserna.
// Sidmängden bor i verktyg/sidor.js — EN upptäckare för alla svep (V9). Här låg förut en
// ordagrann kopia av samma readdir-funktion; fyra verktyg bar var sin.
function sidor(){ return Sidor.blad(); }

const TMP = path.join(os.tmpdir(), 'kontrollsvep-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);
let fel = 0, blad = 0, sidorMatta = 0;
const perArskurs = {};
console.log('KONTROLL-SVEP — en obesvarad ruta är inte fel\n');
sidor().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
                               '--vanta-pa', 'blad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  sidorMatta++;
  const ar = sida.slice(0, 3);
  perArskurs[ar] = perArskurs[ar] || { blad: 0, trasiga: 0 };
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + u.onerr.join(' | ')); }
  MP.rakna(sida, (u.blad || []).length);
  (u.blad || []).forEach(x => {
    blad++; perArskurs[ar].blad++;
    // V11 vaktar de värden ett BESKED vilar på. Ger proben inget besked — "ingen Kontrollera-
    // knapp" — finns inget att vakta, och grinden säger det högt med ett ?. Anmälan står därför
    // EFTER den returen. (Nian har nio sådana sidor: drill- och provsidor som svepet öppnar men
    // inte kan döma. Ingen av dem är en bladsida, så V14 kräver dem inte heller.)
    if(x.fel){ console.log('? ' + sida + ' · ' + x.blad + ': ' + x.fel); return; }
    MP.varde(sida, x.blad, { rutor: x.rutor, tomma: x.tomma, markerade: x.markerade,
                             facitPaTom: x.facitPaTom, valRutnat: x.valRutnat, valUtanVal: x.valUtanVal });
    const brott = x.markerade + x.facitPaTom + (x.valUtanVal || 0) + (x.uppstMarkerade || 0);
    if(!brott){
      console.log('✓ ' + sida.replace(/\/index\.html$/, '') + ' · ' + x.blad
        + ' (' + x.rutor + ' rutor, ' + x.tomma + ' lämnades tomma'
        + (x.valRutnat ? ', ' + x.valRutnat + ' valrutnät varav ' + x.valObesvarade + ' obesvarade' : '')
        + (x.uppst ? ', ' + x.uppst + ' obesvarade uppställningar' : '') + ')');
      return;
    }
    fel += brott; perArskurs[ar].trasiga++;
    console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + x.blad
      + ': ' + x.markerade + ' tomma rutor markerade, ' + x.facitPaTom + ' fick facit'
      + (x.valUtanVal ? ', ' + x.valUtanVal + ' obesvarade valrutnät markerade' : '')
      + (x.uppstMarkerade ? ', ' + x.uppstMarkerade + ' markeringar i obesvarade uppställningar' : '')
      + (x.exempel.length ? '\n     ' + x.exempel.join(' | ') : '')
      + ((x.valExempel && x.valExempel.length) ? '\n     ' + x.valExempel.join(' | ') : ''));
  });
});
try { fs.unlinkSync(TMP); } catch(e){}

console.log('\nPER ÅRSKURS');
Object.keys(perArskurs).sort().forEach(a => {
  const p = perArskurs[a];
  console.log('  ' + a + ': ' + p.blad + ' blad, ' + p.trasiga + ' ger bort facit');
});
fel += MP.granska();   // V14: en sida i listan måste ge minst en mätpunkt
console.log('\n' + (fel ? '✗ KONTROLL-SVEP RÖTT (' + fel + ')' : '✓ KONTROLL-SVEP GRÖNT')
  + ' · ' + blad + ' blad på ' + sidorMatta + ' sidor');
process.exit(fel ? 1 : 0);
