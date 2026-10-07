/* navram-beteende.js — RAMEN SKA BETE SIG RÄTT, inte bara se rätt ut (order 2026-10-04).
 *
 * VARFÖR GRINDEN FINNS. Fyra fel slank förbi alla befintliga vakter, för de mäter STRUKTUR: att
 * knappar finns, att rutor går att rätta, att keypaden är tänd. Ingen mätte vad som HÄNDER när man
 * klickar. De två felen den här grinden fångar:
 *
 *   1. EN VARIANT SOM INTE BYTER NÅGOT. Klick på "Blad 2" valde bladet men stannade på blad 1,
 *      för delegeringen letade underflikar på synlighet och raden var redan gömd. Utifrån ser det
 *      ut som "det nya visas inte / det gamla står kvar". Strukturellt var allt rätt: knappen
 *      fanns, var klickbar och hade en handler.
 *   2. EN NIVÅRAD SOM INTE SPEGLAR DATAN. Raden får sitt antal ur sidans data; ritar den ett fast
 *      antal leder knappar in i tomhet.
 *
 * MÄTS SÅ:
 *   BEN A  För varje variant: klicka, och kräv att EXAKT EN arbetsyta är synlig.
 *   BEN B  Inom en grupp måste varianterna visa OLIKA arbetsytor. Två varianter som landar på
 *          samma yta är precis felet ovan — och det är det enda sättet att se det, eftersom båda
 *          klicken "lyckas" strukturellt. (Rutantal duger INTE som identitet: Beräkna blad 1 och
 *          blad 2 har båda 18 rutor, och på det byggde jag först ett falskt bevis.)
 *   BEN D  Varje variant är nåbar med ETT klick: ingen ligger gömd i en hopfälld grupp.
 *   BEN E  Efter klicket sitter markeringen (is-on) på den klickade varianten och ingen annan.
 *   BEN C  Antalet ritade .niva-btn = det antal ramen fick ur datan (window.__NAVRAM), där 0 och
 *          1 betyder ingen rad alls.
 *
 * KÖR:  node verktyg/navram-beteende.js [--sida <delsträng>] [--lista]
 *       --sabba delegering  låter varje variant peka på FÖRSTA ytan → BEN B måste fälla
 *       --sabba nivarad     ritar en extra nivåknapp → BEN C måste fälla
 *       --sabba tvaklick    fäller ihop en grupp → BEN D måste fälla
 *       --sabba markering   flyttar markeringen till en annan rad → BEN E måste fälla
 * Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('navram-beteende.js');
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.blad())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var SABBA = ${JSON.stringify(SABBA)};
  var ut = { onerr: window.__onerr || null, harRam: !!document.querySelector('.nr-lager'),
             grupper: [], brott: [], noter: [] };
  if(!ut.harRam) return ut;

  function synlig(e){ return !!(e && e.offsetParent); }
  /* ARBETSYTAN: det element som bär uppgifterna. Tre släkten finns — sjuans/åttans ark
     (#sheet-*), plugg-sidans dokumentyta (#plugg-aktivt) och bladmounten. Identiteten är
     ELEMENTETS id plus dess rubrik, aldrig rutantalet: två olika blad kan ha lika många rutor. */
  function synligaYtor(){
    var ark = Array.prototype.filter.call(document.querySelectorAll('[id^="sheet-"]'), synlig);
    if(ark.length) return ark.map(function(e){
      var h = e.querySelector('h2, h3');
      return e.id + '/' + (h ? h.textContent.replace(/\\s+/g, ' ').trim().slice(0, 40) : '');
    });
    var pa = document.getElementById('plugg-aktivt');
    if(synlig(pa)){
      var ph = pa.querySelector('h2, h3');
      return ['plugg-aktivt/' + (ph ? ph.textContent.replace(/\\s+/g, ' ').trim().slice(0, 40) : '')];
    }
    return Array.prototype.filter.call(document.querySelectorAll('.blad-mount'), synlig)
      .map(function(e){ return e.id; });
  }

  if(SABBA === 'nivarad'){
    // En extra nivåknapp → BEN C måste fälla.
    var vard = document.querySelector('.niva-rad-vard');
    if(vard){
      var r = vard.querySelector('.niva-rad') || vard.appendChild(document.createElement('div'));
      r.className = 'niva-rad';
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'niva-btn'; b.dataset.niva = '1'; b.textContent = 'Niv\\u00e5 1';
      r.appendChild(b);
      ut.noter.push('SABBA: la en extra niv\\u00e5knapp');
    }
    /* Finns ingen ram-rad på sidan saboteras BLADETS rad i stället — annars kan provet bara
       fälla på en av de två platserna, och då bevisar det inte att båda mäts. */
    var ark = document.querySelector('[data-nivaer] .niva-rad');
    if(ark){
      var b2 = document.createElement('button');
      b2.type = 'button'; b2.className = 'niva-btn'; b2.dataset.niva = '9';
      b2.textContent = 'Niv\\u00e5 9';
      ark.appendChild(b2);
      ut.noter.push('SABBA: la en extra niv\\u00e5knapp i BLADETS rad');
    }
  }

  // ── BEN C: nivåraden speglar datan ──────────────────────────────────────────────────────
  var anmalt = window.__NAVRAM || null;
  /* RAMENS rad mäts mot ramens data. Ett BLAD kan bära en egen rad ur sin egen data (stegen
     hör till bladet — nyckeln är <prefix>_naddNiva<n>_<bladId>), och den hör inte hit: en
     räkning av alla .niva-btn på sidan blandade ihop de två och fällde en korrekt sida. */
  var ramVard = document.querySelector('.niva-rad-vard');
  var ritade = ramVard ? ramVard.querySelectorAll('.niva-btn').length
                       : document.querySelectorAll('.niva-btn').length;
  /* BLADETS egen rad: antalet knappar ska vara exakt det antal steg bladet anmäler i
     data-nivaer, och ett steg ritas aldrig som en ensam knapp. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-nivaer]'), function(ark){
    var vantat = parseInt(ark.getAttribute('data-nivaer'), 10);
    var egna = ark.querySelectorAll('.niva-rad .niva-btn').length;
    var bor = vantat >= 2 ? vantat : 0;
    if(egna !== bor){
      ut.brott.push('BLADETS NIVARAD SPEGLAR INTE DATAN: ' + egna + ' knappar ritade i bladet, '
        + 'men datan ger ' + vantat + ' steg = ' + bor + ' knappar');
    }
  });
  ut.niva = { anmaltAntal: anmalt ? anmalt.nivaAntal : null,
              forvantade: anmalt ? anmalt.forvantadeNivaknappar : null, ritade: ritade };
  if(!anmalt){
    ut.brott.push('NIVARAD OMATBAR: ramen anmalde inget nivaantal (window.__NAVRAM saknas) - da kan grinden inte avgora om raden speglar datan');
  } else if(ritade !== anmalt.forvantadeNivaknappar){
    ut.brott.push('NIVARAD SPEGLAR INTE DATAN: ' + ritade + ' nivaknappar ritade, men datan ger '
      + anmalt.nivaAntal + ' niva(er) = ' + anmalt.forvantadeNivaknappar + ' knappar');
  }

  // ── BEN A+B: varje variant byter yta, och varianterna i en grupp visar OLIKA ytor ────────
  var huvud = Array.prototype.slice.call(document.querySelectorAll('.nr-huvud'));
  var uppg = huvud.filter(function(h){
    var hh = h.querySelector('.nr-huvud-h');
    return hh && /Uppgifter/.test(hh.textContent);
  })[0];
  if(!uppg){ ut.brott.push('INGEN UPPGIFTER-RUBRIK att prova'); aterstall(); return ut; }

  /* BEN D — ETT KLICK RÄCKER. Mäts FÖRE någon grupprubrik klickats: är varianten gömd i en
     hopfälld grupp måste eleven fälla ut den först, och då är ett byte två klick. */
  var allaRader = Array.prototype.slice.call(uppg.querySelectorAll('.nr-rad'));
  if(SABBA === 'tvaklick'){
    /* Sabotaget SKAPAR felet i st\u00e4llet f\u00f6r att leta upp det: efter r\u00e4ttelsen finns ingen
       en-variantgrupp kvar att f\u00e4lla ihop, och ett motprov som inte kan f\u00e4lla bevisar ingenting.
       H\u00e4r byggs precis det som var fel \u2014 en grupp med EN variant, hopf\u00e4lld. */
    var v0 = uppg.querySelector('.nr-rad:not([disabled])');
    if(v0){
      var ny = document.createElement('div'); ny.className = 'nr-grp';
      var h0 = document.createElement('div'); h0.className = 'nr-grp-h'; h0.textContent = 'Sabbad grupp';
      var kropp = document.createElement('div'); kropp.className = 'nr-grp-body'; kropp.hidden = true;
      /* SYSKON till den yttersta gruppen, aldrig inuti den: .nr-grp.is-open .nr-grp-body är
         en ättlingsregel och hade satt display:block även på en nästlad hopfälld kropp. */
      var topp = v0.closest('.nr-grp') || v0;
      topp.parentNode.insertBefore(ny, topp);
      kropp.appendChild(v0); ny.appendChild(h0); ny.appendChild(kropp);
      ut.noter.push('SABBA: la en variant i en hopf\u00e4lld grupp med EN variant');
    }
  }
  /* GÄLLER GRUPPEN MED EN VARIANT. Har gruppen FLERA varianter är dragspelet avsikten: öppna
     området, välj dokument. Joachims krav gällde den grupp som bara har ETT blad — där finns inget
     att välja mellan, och utfällningen är ett steg utan innehåll. Mätt: utan den här gränsen fällde
     benet 27 äkta flervariantgrupper på fyra sidor. */
  allaRader.forEach(function(v){
    if(v.disabled) return;
    var grp = v.closest('.nr-grp');
    var syskon = grp ? grp.querySelectorAll('.nr-rad').length : 1;
    if(syskon > 1) return;
    if(!synlig(v)){
      ut.brott.push('KRAVER TVA KLICK: "' + v.textContent.replace(/\s+/g, ' ').trim().slice(0, 28)
        + '" ligger gomd i en hopfalld grupp — ett byte ska kosta ETT klick');
    }
  });

  var gr = Array.prototype.slice.call(uppg.querySelectorAll('.nr-grp'));
  gr.forEach(function(g, gi){
    var gh = g.querySelector('.nr-grp-h');
    if(gh) gh.click();
    var namn = gh ? gh.textContent.replace(/[\\s\\u25be\\u25b8]+/g, ' ').trim() : '(rubrikl\\u00f6s)';
    var varianter = Array.prototype.slice.call(g.querySelectorAll('.nr-rad'));
    var sedda = {}, rad = { grupp: namn, varianter: [] };

    varianter.forEach(function(v, vi){
      if(v.disabled){ rad.varianter.push({ titel: v.textContent.trim().slice(0, 28), kommer: true }); return; }
      if(SABBA === 'delegering' && vi > 0){
        // Peka varianten på FÖRSTA varianten → två varianter landar på samma yta.
        varianter[0].click();
        ut.noter.push('SABBA: variant ' + (vi + 1) + ' i "' + namn + '" pekar pa den forsta');
      } else {
        v.click();
      }
      var ytor = synligaYtor();
      var titel = v.textContent.replace(/\\s+/g, ' ').trim().slice(0, 28);
      rad.varianter.push({ titel: titel, ytor: ytor.length, yta: ytor[0] || '(ingen)' });

      if(ytor.length !== 1){
        ut.brott.push('EJ EXAKT EN YTA: "' + namn + ' / ' + titel + '" visar ' + ytor.length
          + ' arbetsytor' + (ytor.length > 1 ? ' samtidigt (' + ytor.slice(0, 3).join(' + ') + ')' : ''));
      }
      /* BEN E — MARKERINGEN FÖLJER BLADET. Efter klicket ska is-on sitta på den klickade
         varianten och ingen annan. En markering som pekar på något annat än det som visas är
         värre än ingen alls: den säger att eleven är någon annanstans än hon är. */
      if(SABBA === 'markering' && vi === 0 && varianter.length > 1){
        v.classList.remove('is-on'); varianter[1].classList.add('is-on');
        ut.noter.push('SABBA: flyttade markeringen till en annan rad');
      }
      if(SABBA !== 'delegering'){
        var markerade = Array.prototype.slice.call(uppg.querySelectorAll('.nr-rad.is-on'));
        if(markerade.length !== 1 || markerade[0] !== v){
          ut.brott.push('MARKERINGEN FOLJER INTE BLADET: efter klick pa "' + titel + '" ar '
            + (markerade.length === 0 ? 'ingen rad markerad'
               : markerade.length > 1 ? markerade.length + ' rader markerade'
               : '"' + markerade[0].textContent.replace(/\s+/g, ' ').trim().slice(0, 28) + '" markerad'));
        }
      }
      var nyckel = ytor[0] || '(ingen)';
      if(sedda[nyckel] !== undefined){
        ut.brott.push('TVA VARIANTER, SAMMA YTA: "' + namn + '" — "' + sedda[nyckel] + '" och "'
          + titel + '" landar bada pa ' + nyckel + ' (klicket byter ingenting)');
      }
      sedda[nyckel] = titel;
    });
    ut.grupper.push(rad);
  });

  function aterstall(){}
  return ut;
})()`;

const TMP = path.join(os.tmpdir(), 'navrambet-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);

let fel = 0, sidorMedRam = 0, varianter = 0;
console.log('NAVRAM-BETEENDE — varje variant byter yta, nivåraden speglar datan'
  + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');

Sidor.blad().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
    '--vanta-pa', 'laddad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  const kort = sida.replace(/\/index\.html$/, '');
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + kort + ': JS-fel ' + u.onerr.slice(0, 2).join(' | ')); }

  // Sidor utan ramen är utanför grindens område — men frånvaron BEVISAS (V14).
  if(!u.harRam){ MP.rakna(sida, 1); MP.varde(sida, 'utan-ram', { harRam: 0 }); return; }
  sidorMedRam++;

  const antal = (u.grupper || []).reduce((a, g) => a + g.varianter.length, 0);
  varianter += antal;
  MP.rakna(sida, antal + 1);
  MP.varde(sida, 'nivarad', { ritade: u.niva.ritade, forvantade: u.niva.forvantade });
  (u.grupper || []).forEach(g => g.varianter.forEach(v =>
    MP.varde(sida, 'variant:' + g.grupp + '/' + v.titel, { ytor: v.kommer ? 0 : v.ytor })));

  (u.noter || []).forEach(n => console.log('   ' + n));
  if(u.brott && u.brott.length){
    fel += u.brott.length;
    console.log('✗ ' + kort + ':\n     ' + u.brott.join('\n     '));
  } else {
    console.log('✓ ' + kort + ' (' + antal + ' varianter, var och en på egen yta · '
      + u.niva.ritade + ' nivåknappar = datans ' + u.niva.anmaltAntal + ')');
  }
});
try { fs.unlinkSync(TMP); } catch(e){}

fel += MP.granska();
console.log('\n' + (fel ? '✗ NAVRAM-BETEENDE RÖD (' + fel + ')' : '✓ NAVRAM-BETEENDE GRÖN')
  + ' · ' + sidorMedRam + ' sidor med ramen, ' + varianter + ' varianter provade');
process.exit(fel ? 1 : 0);
