/* uppgift-grind.js — K-A, K-B och K-C: uppgiftens FORM (order 2026-10-04, omgång 3).
 *
 * SKÄLET. De tre mönstren dök upp om och om igen i granskningarna: en ensam deluppgift som ändå
 * bar "a)", en beräkning med en enda ruta där det krävs en kedja, och "skriv ett uttryck och
 * förenkla" med plats bara för svaret. En nedskriven regel stoppar den som inte vet; en grind
 * stoppar regressionen. Den här grinden är den andra halvan.
 *
 * FYRA BEN, alla mätta i den renderade sidan:
 *
 *   BOKSTAV   (K-A) en grupp med EXAKT EN svarsbärande rad får inte rendera någon a)-etikett.
 *             Flera rader → bokstäverna ska finnas, och vara a, b, c … i ordning.
 *
 *   BERÄKNA   (K-B) en uppgift vars rubrik säger "beräkna" måste ha kedjan: minst tre synliga
 *             svarsrutor i en .ovn-berakna, och varje ruta måste bära sitt eget facit i markupen.
 *             En ruta utan facit kan ingen grind fylla, och då mäts uppgiften aldrig.
 *
 *   EGEN RAD  (K-A, uppgiftssidan: "a) b) … också de på raden") en deluppgiftsbokstav får inte stå
 *             ensam på en rad: något av radens innehåll (fråga, uttryck, ruta, val, figur) måste dela
 *             rad med bokstaven. Joachim 2026-11-25: K-C med frågetext hade bokstaven ovanför frågan.
 *
 *   TVÅRUTOR  (K-C) en uppgift vars rubrik eller frågetext säger "skriv ett uttryck … och
 *             förenkla" måste ha minst två svarsrutor per deluppgift — uttrycket och det
 *             förenklade. Mellanledsrutan räknas inte in i de två: den är ett tredje steg.
 *
 * VAD GRINDEN INTE AVGÖR: om texten är rätt formulerad. Den läser rubriken för att veta vilken
 * SORTS uppgift det är, och mäter sedan formen. Ordalydelsen är Joachims.
 *
 * KÖR:  node verktyg/uppgift-grind.js [--sida <delsträng>] [--lista] [--viewport WxH, standard 1366x768]
 *       --sabba bokstav   sätter dit en a)-etikett på en ensam deluppgift  → BOKSTAV måste fälla
 *       --sabba berakna   tar bort kedjans led                             → BERÄKNA måste fälla
 *       --sabba rutor     tar bort den andra rutan i en skriv-och-förenkla → TVÅRUTOR måste fälla
 *       --sabba egenrad   lägger en bokstav på en egen rad                 → EGEN RAD måste fälla
 *
 * SIDORNA: delkapitlens sidor (Sidor.blad()) och UPPGIFTSSIDORNA i nytt format (uppgift.html på skalet, verktyg/uppgiftssidor.js):
 * varje moment, blad och variant (?moment=…&blad=…) och varje författat test (?test=…), lästa ur sidans
 * egna datafiler. Låsta nivåer öppnas med NivaRad:s egen nyckel innan sidan ritas (omgivningen ställs in).
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
  // Uppgiftssidorna i nytt format mäts bara av EGEN RAD: de tre äldre benen mäter samma sidor som förut.
  var BARA_EGENRAD = !!window.__BARA_EGENRAD;
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

  if(SABBA === 'egenrad' && !ut.__egenradSabbad){
    var lab0 = Array.prototype.filter.call(g.querySelectorAll('.ovn-rad .ovn-label'), function(e){
      return synlig(e) && /^[a-z\\u00e5\\u00e4\\u00f6]\\s*\\)$/i.test((e.textContent || '').trim()); })[0];
    if(lab0){ lab0.style.display = 'block'; lab0.style.flexBasis = '100%'; lab0.style.width = '100%';
      ut.__egenradSabbad = true; ut.noter.push('SABBA: lade bokstaven "' + lab0.textContent.trim() + '" p\\u00e5 en egen rad'); }
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
    if(!BARA_EGENRAD && delar <= 1 && etiketter.length > 0){
      ut.brott.push('BOKSTAV i ' + namn + ': en enda deluppgift men bokstavsetikett \\u2014 '
        + 'bokstaven skiljer deluppgifter \\u00e5t, och h\\u00e4r finns inget att skilja');
    }

    // ── K-A, uppgiftssidan: EGEN RAD ───────────────────────────────────────────────────────
    // Bokstaven står på frågans rad (Joachim 2026-11-25). Ensam på sin rad = inget synligt innehåll i raden
    // delar höjd med bokstaven. FÄLLER när raden närmast under bokstaven BÖRJAR med frågan (frågetext eller
    // uttrycket, .ovn-text/.ovn-num, längst till vänster på den raden — inte det som råkar stå högst: en ruta är
    // högre än texten bredvid och skulle annars dölja frågan). Under en figur, rutor eller valknappar fälls den
    // inte (Joachims beslut: benet gäller bokstaven ovanför frågan) — de räknas och skrivs ut som not.
    etiketter.forEach(function(e){
      var rad = e.closest('.ovn-rad') || g, lr = e.getBoundingClientRect();
      var innehall = Array.prototype.filter.call(rad.querySelectorAll('input, .ovn-text, .ovn-num, svg, .valruta-btn, '
        + '.ovn-flerval-btn, .ak8-chip, button, .brak, select, textarea'), function(x){
        return x !== e && !e.contains(x) && !x.contains(e) && synlig(x); });
      var paRaden = innehall.some(function(x){ var r = x.getBoundingClientRect();
        return Math.min(r.bottom, lr.bottom) - Math.max(r.top, lr.top) > 2; });
      if(!innehall.length || paRaden) return;
      var nedan = innehall.filter(function(x){ return x.getBoundingClientRect().top >= lr.bottom - 2; })
        .sort(function(a, b){ return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
      var forst = nedan[0] && nedan[0].getBoundingClientRect();
      var under = !forst ? null : nedan.filter(function(x){ var r = x.getBoundingClientRect();
          return Math.min(r.bottom, forst.bottom) - Math.max(r.top, forst.top) > 2; })
        .sort(function(a, b){ return a.getBoundingClientRect().left - b.getBoundingClientRect().left; })[0];
      var sort = !under ? 'annat' : (under.closest('svg') ? 'figur' : (under.tagName === 'INPUT' || under.tagName === 'SELECT' || under.tagName === 'TEXTAREA' ? 'rutor'
        : (under.closest('button, .valruta-btn, .ovn-flerval-btn, .ak8-chip') ? 'val' : (under.closest('.ovn-text, .ovn-num') ? 'fraga' : 'annat'))));
      if(sort === 'fraga'){
        ut.brott.push('EGEN RAD i ' + namn + ': bokstaven "' + (e.textContent || '').trim() + '" st\\u00e5r ensam ovanf\\u00f6r fr\\u00e5gan \\u2014 '
          + kort(under.textContent) + ' (bokstaven ska st\\u00e5 p\\u00e5 fr\\u00e5gans rad)');
      } else { ut.ensam = ut.ensam || {}; ut.ensam[sort] = (ut.ensam[sort] || 0) + 1;
        if(window.__EGENRAD_ALLA) ut.noter.push('ensam bokstav ' + (e.textContent || '').trim() + ' ovanf\\u00f6r ' + sort + ' i ' + namn); }
    });

    // ── K-B: BERÄKNA ───────────────────────────────────────────────────────────────────────
    // UTLÖSAREN ÄR "SÄTT IN VÄRDE", inte ordet "beräkna". Halva boken har rubriker som "Beräkna"
    // eller "Beräkna med talsorterna var för sig" för ren räkning, och de ska inte ha en kedja —
    // mitt första ben fällde 41 sådana. K-B gäller när ett VÄRDE sätts in i ett uttryck, vilket
    // rubriken säger med en variabeltilldelning: "beräkna värdet när x = 3".
    if(!BARA_EGENRAD && /ber\\u00e4kna/i.test(rubrik) && /\\b[a-z]\\s*=\\s*\\(?-?\\d/i.test(rubrik)){
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
    if(!BARA_EGENRAD) rader.forEach(function(r, ri){
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

/* UPPGIFTSSIDORNA I NYTT FORMAT: hittas på skalet (verktyg/uppgiftssidor.js, delad med keypad-grind.js) — varje
   uppgift.html som laddar arbetsyta.js, med momenten och testen ur sidans egna datafiler. */
const US = require('./uppgiftssidor');
function uppgiftsSidor(){ return US.sidor(); }
const PRE_LAS = US.preLas('window.__BARA_EGENRAD = true; ');

/* VYPORTEN: elevens skärm, den smalare av de två mätstorlekarna (KONVENTIONER: 1366 × 768 och 1536 × 864). I
   cdp-kor:s standardfönster (900 px) bryts långa frågor bredvid knappsatsen, och EGEN RAD mätte då en skärm ingen har.
   --viewport WxH väljer en annan. */
const VY = (i => i >= 0 ? args[i + 1] : '1366x768')(args.indexOf('--viewport'));
let fel = 0, grupper = 0, sidor = 0;
console.log('UPPGIFT-GRIND — K-A bokstav · K-A egen rad · K-B beräkna-kedjan · K-C två rutor'
  + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');

const UPPG = uppgiftsSidor();
Sidor.blad().concat(UPPG).forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  const ny = UPPG.indexOf(sida) >= 0, fil = sida.split('?')[0], fraga = sida.slice(fil.length);
  if(!ny) MP.forsok(sida);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, fil)) + fraga, TMP,
    '--vanta-pa', 'blad', '--timeout', '60000', '--viewport', VY].concat(ny ? ['--pre', PRE_LAS] : []), { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  // Ingen mätning på en uppgiftssida i nytt format fäller (Joachim 2026-11-27); de äldre sidorna vaktas av V14 (MP).
  if(!u){ if(ny) fel++; console.log((ny ? '✗ ' : '? ') + sida + ': inget svar'); return; }
  const namn = sida.replace(/\/index\.html$/, '');
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + namn + ': JS-fel ' + u.onerr.slice(0, 2).join(' | ')); }

  if(!ny){ MP.rakna(sida, u.grupper || 1); MP.varde(sida, 'uppgift', { grupper: u.grupper, brott: u.brott.length }); }
  else if(!u.grupper){ fel++; console.log('\u2717 ' + sida + ': inga uppgifter ritade (sp\u00e4rren eller en tappad fil)'); return; }
  sidor++; grupper += u.grupper;
  (u.noter || []).forEach(n => console.log('   ' + n));
  if(u.ensam) console.log('   \u00b7 ' + sida + ': bokstav ensam ovanf\u00f6r ' + Object.keys(u.ensam).map(k => u.ensam[k] + ' ' + k).join(', ') + ' (f\u00e4lls inte)');
  if(u.brott.length){
    fel += u.brott.length;
    console.log('✗ ' + namn + ' (' + u.brott.length + '):\n     ' + u.brott.slice(0, 6).join('\n     ')
      + (u.brott.length > 6 ? '\n     … och ' + (u.brott.length - 6) + ' till' : ''));
  } else if(u.grupper){
    console.log('✓ ' + namn + ' (' + u.grupper + ' uppgifter)');
  }
});
try { fs.unlinkSync(TMP); fs.unlinkSync(PRE_LAS); } catch(e){}

fel += MP.granska();
/* EN GRIND SOM INTE MÄTER NÅGOT ÄR INTE GRÖN (Joachim 2026-11-27): noll mätta sidor — fel --sida, eller sidor som
   grinden inte hittar — fäller. */
if(!sidor){ fel++; console.log('\n✗ inga sidor mätta' + (BARA ? ' för --sida ' + BARA : '') + ' — en grind som inte mäter något är inte grön'); }
console.log('\n' + (fel ? '✗ UPPGIFT-GRIND RÖD (' + fel + ')' : '✓ UPPGIFT-GRIND GRÖN')
  + ' · ' + sidor + ' sidor, ' + grupper + ' uppgifter');
process.exit(fel ? 1 : 0);
