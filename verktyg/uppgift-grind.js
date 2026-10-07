/* uppgift-grind.js — K-A, K-B och K-C: uppgiftens FORM (order 2026-10-04, omgång 3).
 *
 * SKÄLET. De tre mönstren dök upp om och om igen i granskningarna: en ensam deluppgift som ändå
 * bar "a)", en beräkning med en enda ruta där det krävs en kedja, och "skriv ett uttryck och
 * förenkla" med plats bara för svaret. En nedskriven regel stoppar den som inte vet; en grind
 * stoppar regressionen. Den här grinden är den andra halvan.
 *
 * TRE BEN, alla mätta i den renderade sidan:
 *
 *   BOKSTAV   (K-A) en grupp med EXAKT EN svarsbärande rad får inte rendera någon a)-etikett.
 *             Flera rader → bokstäverna ska finnas, och vara a, b, c … i ordning.
 *
 *   BERÄKNA   (K-B) en uppgift vars rubrik säger "beräkna" måste ha kedjan: minst tre synliga
 *             svarsrutor i en .ovn-berakna, och varje ruta måste bära sitt eget facit i markupen.
 *             En ruta utan facit kan ingen grind fylla, och då mäts uppgiften aldrig.
 *
 *   TVÅRUTOR  (K-C) en uppgift vars rubrik eller frågetext säger "skriv ett uttryck … och
 *             förenkla" måste ha minst två svarsrutor per deluppgift — uttrycket och det
 *             förenklade. Mellanledsrutan räknas inte in i de två: den är ett tredje steg.
 *
 * VAD GRINDEN INTE AVGÖR: om texten är rätt formulerad. Den läser rubriken för att veta vilken
 * SORTS uppgift det är, och mäter sedan formen. Ordalydelsen är Joachims.
 *
 * KÖR:  node verktyg/uppgift-grind.js [--sida <delsträng>] [--lista]
 *       --sabba bokstav   sätter dit en a)-etikett på en ensam deluppgift  → BOKSTAV måste fälla
 *       --sabba berakna   tar bort kedjans led                             → BERÄKNA måste fälla
 *       --sabba rutor     tar bort den andra rutan i en skriv-och-förenkla → TVÅRUTOR måste fälla
 * Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('uppgift-grind.js');
const LAS_UPP = require('./niva-las-upp').snutt;   // nivåstegen upplåsta innan mätning
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.blad())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var SABBA = ${JSON.stringify(SABBA)};
  var ut = { onerr: window.__onerr || null, grupper: 0, brott: [], noter: [] };

  function synlig(e){ return !e.hidden && !e.closest('[hidden]') && e.getClientRects().length > 0; }
  function kort(t){ return String(t).replace(/\\s+/g, ' ').trim().slice(0, 52); }

  // EN FLIK I TAGET. Sidan kan ha flera nivåer, och bara en syns åt gången — en grind som mäter
  // "sidan" mäter i själva verket den flik som råkar vara framme.
  // MÄTNINGEN SKER MEDAN FLIKEN ÄR FRAMME. Att samla grupperna per flik och mäta dem efteråt gav
  // falska brott: nivå 1:s beräkna-kedjor var dolda när mätningen kördes, och synlig() sade då att
  // kedjan inte fanns. En dold grupp går inte att mäta — den måste mätas i sitt eget ögonblick.
  ${LAS_UPP}
  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
  var sedda = [];
  /* Nivåstegen är flikar: stegets grupper finns inte i DOM:en förrän steget visas. */
  function stegVarv(gorNagot){
    var rader = document.querySelectorAll('.niva-rad');
    if(!rader.length){ gorNagot(); return; }
    var antal = document.querySelectorAll('.niva-rad .niva-btn').length;
    if(antal < 2){ gorNagot(); return; }
    for(var n = 0; n < antal; n++){
      var nb = document.querySelectorAll('.niva-rad .niva-btn')[n];
      if(!nb || nb.disabled) continue;
      nb.click();
      gorNagot();
    }
  }
  (nav.length ? nav : [null]).forEach(function(b){
    if(b){ if(b.disabled) return; b.click(); }
    stegVarv(function(){
    Array.prototype.filter.call(document.querySelectorAll('.ovn-grupp'), synlig).forEach(function(g){
      if(sedda.indexOf(g) >= 0) return;
      sedda.push(g);
      matGrupp(g, sedda.length - 1);
    });
    });
  });
  return ut;

  function matGrupp(g, gi){

  // SABBA återskapar de tre fel reglerna finns för.
  if(SABBA === 'bokstav'){
    var ensam = grupper.filter(function(g){ return g.querySelectorAll('.ovn-rad').length === 1; })[0];
    if(ensam && !ensam.querySelector('.ovn-label')){
      var r = ensam.querySelector('.ovn-rad');
      var sp = document.createElement('span'); sp.className = 'ovn-label'; sp.textContent = 'a)';
      r.insertBefore(sp, r.firstChild);
      ut.noter.push('SABBA: satte dit "a)" p\\u00e5 en ensam deluppgift');
    }
  }
  if(SABBA === 'berakna'){
    var k0 = document.querySelector('.ovn-berakna');
    if(k0){
      var inp0 = k0.querySelectorAll('input');
      if(inp0.length > 1){ inp0[1].remove(); ut.noter.push('SABBA: tog bort ett led ur kedjan'); }
    }
  }
  if(SABBA === 'rutor'){
    var s0 = document.querySelector('[data-skriv]');
    if(s0){
      var rad0 = s0.closest('.ovn-rad');
      var slut = rad0 && rad0.querySelector('.ovn-in[data-forenkla]');
      if(slut){ slut.remove(); ut.noter.push('SABBA: tog bort f\\u00f6renklingsrutan ur en skriv-och-f\\u00f6renkla'); }
    }
  }

    ut.grupper++;
    var rubrik = (g.querySelector('.ovn-grupp-rubrik') || {}).textContent || '';
    var rader = Array.prototype.filter.call(g.querySelectorAll('.ovn-rad'), synlig);
    var namn = 'grupp ' + (gi + 1) + ' "' + kort(rubrik) + '"';

    // ── K-A: BOKSTAV ───────────────────────────────────────────────────────────────────────
    // En svarsbärande rad är en rad med minst en synlig svarsruta eller ett valrutnät. En ren
    // figurrad bär inget svar och är ingen deluppgift.
    var barande = rader.filter(function(r){
      return r.querySelector('input, .valruta-grid, .ovn-val-grid, .ovn-flerval-grid');
    });
    // .ovn-label BÄR TVÅ SAKER: deluppgiftens bokstav ("a)") och, i två av k2-kopiorna, gruppens
    // NUMMER ("1."). Ett ben som räknar klassen fäller varje grupp i de bladen — mätt: 16 falska
    // brott på d1-andel-antal. K-A gäller bokstaven, så bokstaven är vad som räknas.
    var etiketter = Array.prototype.filter.call(g.querySelectorAll('.ovn-label'), function(e){
      return synlig(e) && /^[a-zåäö]\\s*\\)$/i.test((e.textContent || '').trim());
    });
    // DELUPPGIFTER RÄKNAS INTE SOM RADER. Sjuans bråkblad lägger sju deluppgifter i EN rad, var
    // och en med sin egen bokstav — gruppen har sju deluppgifter, inte en. Mitt första ben läste
    // "en rad, sju bokstäver" och fällde 70 gånger över boken, allihop fel. Antalet deluppgifter
    // är det STÖRSTA av svarsbärande rader och bokstäver.
    var delar = Math.max(barande.length, etiketter.length);
    if(delar <= 1 && etiketter.length > 0){
      ut.brott.push('BOKSTAV i ' + namn + ': en enda deluppgift men bokstavsetikett \\u2014 '
        + 'bokstaven skiljer deluppgifter \\u00e5t, och h\\u00e4r finns inget att skilja');
    }

    // ── K-B: BERÄKNA ───────────────────────────────────────────────────────────────────────
    // UTLÖSAREN ÄR "SÄTT IN VÄRDE", inte ordet "beräkna". Halva boken har rubriker som "Beräkna"
    // eller "Beräkna med talsorterna var för sig" för ren räkning, och de ska inte ha en kedja —
    // mitt första ben fällde 41 sådana. K-B gäller när ett VÄRDE sätts in i ett uttryck, vilket
    // rubriken säger med en variabeltilldelning: "beräkna värdet när x = 3".
    if(/ber\\u00e4kna/i.test(rubrik) && /\\b[a-z]\\s*=\\s*\\(?-?\\d/i.test(rubrik)){
      var kedjor = Array.prototype.filter.call(g.querySelectorAll('.ovn-berakna'), synlig);
      if(!kedjor.length){
        ut.brott.push('BER\\u00c4KNA i ' + namn + ': rubriken s\\u00e4ger ber\\u00e4kna, men ingen kedja finns '
          + '\\u2014 en ensam ruta ger ingen plats f\\u00f6r stegen');
      }
      kedjor.forEach(function(k){
        var rutor = Array.prototype.filter.call(k.querySelectorAll('input'), synlig);
        if(rutor.length < 3){
          ut.brott.push('BER\\u00c4KNA i ' + namn + ': kedjan har ' + rutor.length
            + ' synliga rutor, minst 3 kr\\u00e4vs (uttrycket, ers\\u00e4ttningen, svaret)');
        }
        rutor.forEach(function(i, k2){
          var d = i.dataset;
          var harFacit = d.forenkla !== undefined || d.insatt !== undefined
                      || d.mellanvarde !== undefined || d.svar !== undefined;
          if(!harFacit){
            ut.brott.push('BER\\u00c4KNA i ' + namn + ': led ' + (k2 + 1)
              + ' b\\u00e4r inget facit i markupen \\u2014 ingen grind kan fylla det, allts\\u00e5 m\\u00e4ts det aldrig');
          }
        });
      });
    }

    // ── K-C: TVÅRUTOR ──────────────────────────────────────────────────────────────────────
    // Uppgiftstypen känns igen på "skriv ... uttryck ... förenkla" i rubriken ELLER i radens
    // frågetext — problemen bär texten på raden, omkretsuppgifterna i rubriken.
    rader.forEach(function(r, ri){
      var fraga = (r.querySelector('.ovn-text') || {}).textContent || '';
      var text = rubrik + ' ' + fraga;
      // VERBET, inte adjektivet. "Skriv ett uttryck … och förenkla det" är två steg; "Skriv ett
      // uttryck … (förenklat)" ber om den färdiga formen i ETT steg. Skillnaden står i ordet:
      // "förenkla" är imperativ, "förenklat"/"förenklad" är en egenskap hos svaret.
      // Mätt: utan gränsen fälldes glass-uppgiften i sjuans d1, som bara har ett steg.
      if(!/skriv[\\s\\S]{0,60}uttryck/i.test(text) || !/f\\u00f6renkla\\b/i.test(text)) return;
      // mellanledsrutan är ett TREDJE steg och räknas inte in i de två
      var svarsrutor = Array.prototype.filter.call(r.querySelectorAll('input'), function(i){
        return synlig(i) && i.dataset.parentesmellan === undefined;
      });
      if(svarsrutor.length < 2){
        ut.brott.push('TV\\u00c5RUTOR i ' + namn + ', rad ' + (ri + 1) + ': "skriv ett uttryck och '
          + 'f\\u00f6renkla" har ' + svarsrutor.length + ' svarsruta \\u2014 tv\\u00e5 steg kr\\u00e4ver tv\\u00e5 rutor');
      }
    });
  }
})()`;

const TMP = path.join(os.tmpdir(), 'uppgiftgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);

let fel = 0, grupper = 0, sidor = 0;
console.log('UPPGIFT-GRIND — K-A bokstav · K-B beräkna-kedjan · K-C två rutor'
  + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');

Sidor.blad().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
    '--vanta-pa', 'blad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  const namn = sida.replace(/\/index\.html$/, '');
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + namn + ': JS-fel ' + u.onerr.slice(0, 2).join(' | ')); }

  MP.rakna(sida, u.grupper || 1);
  MP.varde(sida, 'uppgift', { grupper: u.grupper, brott: u.brott.length });
  sidor++; grupper += u.grupper;
  (u.noter || []).forEach(n => console.log('   ' + n));
  if(u.brott.length){
    fel += u.brott.length;
    console.log('✗ ' + namn + ' (' + u.brott.length + '):\n     ' + u.brott.slice(0, 6).join('\n     ')
      + (u.brott.length > 6 ? '\n     … och ' + (u.brott.length - 6) + ' till' : ''));
  } else if(u.grupper){
    console.log('✓ ' + namn + ' (' + u.grupper + ' uppgifter)');
  }
});
try { fs.unlinkSync(TMP); } catch(e){}

fel += MP.granska();
console.log('\n' + (fel ? '✗ UPPGIFT-GRIND RÖD (' + fel + ')' : '✓ UPPGIFT-GRIND GRÖN')
  + ' · ' + sidor + ' sidor, ' + grupper + ' uppgifter');
process.exit(fel ? 1 : 0);
