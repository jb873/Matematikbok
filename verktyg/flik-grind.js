/* flik-grind.js — EN BYGGD FLIK ÄR KLICKBAR, OCH NIVÅLÅSET SLÄPPER NÄR DET SKA (order 2026-10-03).
 *
 * REGELN (doc/KONVENTIONER.md §3):
 *   · Delflikar — olika uppgiftstyper (Stora tal / Små tal / Lästal …) — är ALLTID klickbara.
 *     Grå är fel. Undantaget är den tomma platsen: ett blad utan uppgifter leder in i tomrum, och
 *     då syns platsen men öppnas inte (`is-kommer`). Grinden skiljer de två på INNEHÅLL, inte på
 *     flaggan: den räknar svarsrutor i flikens blad.
 *   · Nivåerna under den högsta är alltid klickbara. En duktig elev hoppar fritt uppåt.
 *   · Den HÖGSTA nivån är villkorad: öppen om och endast om nivån under är gjord.
 *
 * VARFÖR GRINDEN FINNS. tonad-svep och synlig-grind vaktar att TOMMA platser inte är klickbara.
 * Ingen vaktade motsatsen — att FYLLDA flikar verkligen är klickbara. En elev som möter en grå
 * flik tror att hon är utelåst, och det syns inte i någon mätning. Ihop täcker de hela regeln.
 *
 * MÄTT SÅ: bara en GRÅ flik behöver sitt innehåll avgjort. En klickbar flik lyder regeln redan
 * genom att vara klickbar, och då behövs ingen parning mot ett blad. Det är inte en förenkling
 * utan själva poängen: sidorna navigerar på minst tre sätt — flera blad som växlas (sjuan), ett
 * blad som byggs om (åttans negativa tal och potenser: tre flikar, ett blad), och nästlade
 * underflikar (ak8/k2/d1: fjorton knappar, fyra blad). En grind som kräver en parning för varje
 * flik faller på navigeringsmodellen i stället för på regeln — mätt 2026-10-03, tre sidor föll
 * så, alla tre utan en enda grå flik. Parningen krävs bara där en dom hänger på den, och håller
 * den inte säger grinden det i stället för att gissa.
 *
 * NY SORTS MÄTNING: grinden SIMULERAR ELEVEN. Nivålåset läser ett sparat tillstånd, så det går
 * inte att mäta strukturellt — tre tillstånd ställs in och mäts i tur och ordning:
 *     tom lagring       → högsta nivån LÅST
 *     nivån under gjord → högsta nivån ÖPPEN
 *     tom igen          → LÅST igen (inte "en gång upplåst, alltid upplåst")
 * Den fäller åt BÅDA håll: låst trots att villkoret är uppfyllt, OCH öppen utan att det är det.
 *
 * NYCKELN LETAS UPP, GISSAS INTE (V9). Upplåsningen läser `<prefix>_naddNiva2_<bladId>` ur
 * localStorage, och prefixet skiljer sig per motorfil. Grinden läser prefixen ur motorfilernas
 * källa, så en ny motorfil fångas av sig själv. Sätter grinden en ANNAN nyckel än upplåsningen
 * läser, simulerar den en elev som inte finns och mäter något som inte styr låset — grönt utan
 * mätning, det värsta utfallet. Därför fäller grinden också när en fil har nivålås men ingen
 * nyckel kan hittas: då VET den att den inte kan mäta.
 *
 * ELEV-LOKALT, OCH I EN ENGÅNGSPROFIL. Grinden tömmer localStorage för att ställa in tillståndet,
 * och snapshottar + återställer därför allt den hittar — även nycklar den inte känner; misslyckas
 * återställningen är det ett brott. Men den verkliga spärren ligger ett steg tidigare: cdp-kor.js
 * startar Chrome med `--user-data-dir` i en ny mkdtemp-mapp per körning, som städas efteråt. Det
 * som töms är alltså en tom engångsprofil, inte elevens eller byggarens riktiga webbläsardata.
 * Ingen nätväg, ingen fil ändras.
 *
 * KÖR:  node verktyg/flik-grind.js [--sida <delsträng>] [--lista]
 *       --sabba flik        spärrar en fylld flik i sidan      → BEN 1 måste fälla
 *       --sabba niva-oppen  öppnar högsta nivån utan villkor   → BEN 3 måste fälla
 *       --sabba niva-last   låser högsta nivån trots villkoret → BEN 3 måste fälla
 * Exit 1 vid brott. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('flik-grind.js');
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.blad())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

/* Nyckel-prefixen ur motorfilernas källa. Två mönster letas: skrivningen (lsSet) och läsningen
   (lsGet). De ska stämma överens — gör de inte det sparar eleven en nyckel som ingen läser, och
   nivån låses aldrig upp. Det är ett fynd i sig, så båda samlas och jämförs. */
function nyckelPrefix(){
  const dir = path.join(ROOT, 'js/motor/blad');
  const las = {}, skriv = {}, harLas = {};
  fs.readdirSync(dir).filter(f => f.endsWith('.js')).forEach(f => {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    if(/niva2Upplast/.test(s)) harLas[f] = true;
    let m, r = /lsGet\('([A-Za-z0-9_]+)_naddNiva2_'/g;
    while((m = r.exec(s))) (las[f] = las[f] || []).push(m[1]);
    r = /lsSet\('([A-Za-z0-9_]+)_naddNiva2_'/g;
    while((m = r.exec(s))) (skriv[f] = skriv[f] || []).push(m[1]);
  });
  return { las, skriv, harLas };
}
const NYCK = nyckelPrefix();
const ALLA_PREFIX = Array.from(new Set(Object.values(NYCK.las).flat()));
// Fil med nivålås men utan läsbar nyckel → grinden kan INTE simulera eleven där.
const OMATBARA = Object.keys(NYCK.harLas).filter(f => !(NYCK.las[f] && NYCK.las[f].length));
// Skrivning som inte matchar läsningen → eleven sparar något ingen läser.
const OPARADE = Object.keys(NYCK.harLas).map(f => {
  const l = (NYCK.las[f] || []).join(','), s = (NYCK.skriv[f] || []).join(',');
  return (l && s && l !== s) ? (f + ': läser ' + l + ', skriver ' + s) : null;
}).filter(Boolean);

const PROBE = `(function(){
  var SABBA = ${JSON.stringify(SABBA)}, PREFIX = ${JSON.stringify(ALLA_PREFIX)};
  var ut = { onerr: window.__onerr || null, flikar: [], nivaer: [], brott: [], noter: [] };

  // Lagringen snapshottas HELT, sa aterstallningen blir exakt - aven nycklar vi inte kanner.
  var snap = {};
  try { for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); snap[k] = localStorage.getItem(k); } } catch(e){}
  function tom(){ try { localStorage.clear(); } catch(e){} }
  function aterstall(){ try { tom(); Object.keys(snap).forEach(function(k){ localStorage.setItem(k, snap[k]); }); } catch(e){} }

  function synlig(el){ return !!el.offsetParent; }
  /* LAST mats som EFFEKT, inte som attribut: en knapp kan vara sparrad utan klassen och bara
     klassen utan att vara sparrad. Samma fyra prov som keypad-grinden, plus de tva klasserna. */
  function last(b){
    var c = getComputedStyle(b), s = [];
    if(b.disabled) s.push('disabled');
    if(b.getAttribute('aria-disabled') === 'true') s.push('aria-disabled');
    if(c.pointerEvents === 'none') s.push('pointer-events:none');
    if(parseFloat(c.opacity) < 0.9) s.push('opacity ' + c.opacity);
    if(b.classList.contains('is-kommer')) s.push('is-kommer');
    if(b.classList.contains('is-locked')) s.push('is-locked');
    return s;
  }

  // -- BEN 1: delflikar ------------------------------------------------------------------
  var btns = Array.prototype.filter.call(
    document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn'), synlig);

  /* Bladen: bara de YTTERSTA monteringselementen. sheet-* ligger INUTI blad-*, sa en
     sammanslagen lista blir dubbelt sa lang och parar knapp 3 med blad 2 - matt 2026-10-03:
     fliken "Med forlangning" (0 rutor) rapporterades som fylld med 17 rutor, som var
     grannbladets. Darav containment-filtret. */
  var alla = Array.prototype.slice.call(document.querySelectorAll('[id^="blad-"], [id^="sheet-"]'))
    .filter(function(m){ return m.id !== 'blad-nav'; });
  var mounts = alla.filter(function(m){
    return !alla.some(function(o){ return o !== m && o.contains(m); });
  });
  // Parning via ordningstal haller bara nar antalet stammer. Den behovs BARA for gra flikar.
  var parbart = (mounts.length === btns.length);
  function rutorFor(i){
    if(!parbart) return null;
    var m = mounts[i];
    return m ? m.querySelectorAll('input, select, textarea').length : null;
  }

  if(SABBA === 'flik'){
    // Sparra den FORSTA fyllda fliken -> BEN 1 maste falla och namnge den.
    for(var q = 0; q < btns.length; q++){
      var rq = rutorFor(q);
      if(rq !== null && rq > 0){
        btns[q].disabled = true; btns[q].setAttribute('aria-disabled', 'true');
        ut.noter.push('SABBA: sparrade fliken "' + btns[q].textContent.replace(/\\s+/g, ' ').trim() + '"');
        break;
      }
    }
  }

  btns.forEach(function(b, i){
    var titel = b.textContent.replace(/\\s+/g, ' ').trim();
    var skal = last(b);
    var f = { titel: titel, last: skal };
    if(!skal.length){
      /* KLICKBAR = regeln lydd. Inget blad behover letas upp: det ar darfor grinden inte
         faller pa navigeringsmodellen (ett blad som byggs om, nastlade underflikar). */
      f.klickbar = true; ut.flikar.push(f); return;
    }
    // GRA - nu, och bara nu, avgor innehallet om det ar ett brott eller regeln.
    var rutor = rutorFor(i);
    f.rutor = rutor;
    if(rutor === null){
      f.obedombar = true;
      ut.brott.push('GRA FLIK SOM INTE GAR ATT BEDOMA: "' + titel + '" ar sparrad ('
        + skal.join(', ') + '), men sidan har ' + btns.length + ' flikknappar och '
        + mounts.length + ' blad - grinden kan inte avgora om bladet har uppgifter');
    } else if(rutor > 0){
      f.brott = true;
      ut.brott.push('FLIK GRA MEN FYLLD: "' + titel + '" har ' + rutor
        + ' svarsrutor men ar osparrbar - ' + skal.join(', '));
    } else {
      f.tomOchStangd = true;   // regeln: platsen syns, men leder inte in i tomrum
    }
    ut.flikar.push(f);
  });

  // -- BEN 2+3: nivaraden ---------------------------------------------------------------
  function nivaknappar(){
    return Array.prototype.filter.call(document.querySelectorAll('.niva-btn'), synlig).map(function(b){
      return { niva: parseInt(b.dataset.niva, 10), last: last(b),
               txt: b.textContent.replace(/\\s+/g, ' ').trim() };
    });
  }
  var blad = Array.prototype.map.call(document.querySelectorAll('[id^="sheet-"]'),
    function(s){ return s.id.replace('sheet-', ''); });
  function bygg(niva){ blad.forEach(function(id){ try { byggSheet(id, false, niva); } catch(e){} }); }
  function sattGjord(){
    blad.forEach(function(id){ PREFIX.forEach(function(p){
      try { localStorage.setItem(p + '_naddNiva2_' + id, '1'); } catch(e){} }); });
  }

  if(nivaknappar().length && typeof byggSheet !== 'function'){
    ut.brott.push('NIVA: sidan har nivaknappar men byggSheet ar inte nabar - grinden kan inte stalla in tillstandet');
    ut.nivaGrans = 'byggSheet ej nabar';
  } else if(typeof byggSheet === 'function'){
    tom(); bygg(1);
    var A = nivaknappar();
    if(A.length){
      var toppen = Math.max.apply(null, A.map(function(k){ return k.niva; }));
      // BEN 2 - varje niva UNDER toppen ska vara klickbar.
      A.filter(function(k){ return k.niva < toppen; }).forEach(function(k){
        if(k.last.length) ut.brott.push('NIVA ' + k.niva + ' GRA (tom lagring): nivaer under den '
          + 'hogsta ska alltid vara klickbara - ' + k.last.join(', '));
      });
      // BEN 3 - toppen, tillstandsdrivet, i tre lagen.
      var toppA = A.filter(function(k){ return k.niva === toppen; });
      var lastA = toppA.every(function(k){ return k.last.length > 0; });
      if(SABBA === 'niva-oppen'){
        document.querySelectorAll('.niva-btn[data-niva="' + toppen + '"]').forEach(function(b){
          b.disabled = false; b.removeAttribute('aria-disabled');
          b.classList.remove('is-locked'); b.style.opacity = '1';
        });
        lastA = false; ut.noter.push('SABBA: oppnade niva ' + toppen + ' utan villkor');
      }
      if(!lastA) ut.brott.push('NIVA ' + toppen + ' OPPEN UTAN VILLKOR: med tom lagring ska den vara last - laset lacker');

      sattGjord(); bygg(1);
      var B = nivaknappar().filter(function(k){ return k.niva === toppen; });
      var oppenB = B.length > 0 && B.every(function(k){ return k.last.length === 0; });
      if(SABBA === 'niva-last'){
        document.querySelectorAll('.niva-btn[data-niva="' + toppen + '"]').forEach(function(b){
          b.disabled = true; b.setAttribute('aria-disabled', 'true');
        });
        oppenB = false; ut.noter.push('SABBA: laste niva ' + toppen + ' trots uppfyllt villkor');
        B = nivaknappar().filter(function(k){ return k.niva === toppen; });   // skalet ska beskriva det SABOTERADE laget
      }
      if(!oppenB) ut.brott.push('NIVA ' + toppen + ' LAST TROTS VILLKORET: nivan under ar gjord men knappen ar '
        + (B.length ? B[0].last.join(', ') : 'borta'));

      tom(); bygg(1);
      var C = nivaknappar().filter(function(k){ return k.niva === toppen; });
      if(!(C.length && C.every(function(k){ return k.last.length > 0; })))
        ut.brott.push('NIVA ' + toppen + ' FORBLEV OPPEN: lagringen tomd, men laset slar inte till igen');

      ut.nivaer.push({ toppen: toppen, antal: A.length, blad: blad.length });
    }
  }

  /* En sida utan delflikar OCH utan nivarad ar utanfor grindens omrade. Men noll matpunkter
     lases som "omatt" (V14), sa franvaron BEVISAS i stallet: sidan maste ha renderat svarsrutor
     (alltsa laddat klart) och sakna bade flikknappar och nivaknappar. Da ar "inga flikar" ett
     MATT resultat. Renderade den inget alls lamnas noll matpunkter med flit - da ar sidan tom
     eller obyggd, och det agarskapet hor hos V14:s egen lista, inte hos ett eget brott harifran. */
  if(!btns.length && !ut.nivaer.length){
    var r = document.querySelectorAll('input, select, textarea').length;
    if(r) ut.enkelSida = { rutor: r, flikknappar: 0, nivaknappar: 0 };
  }

  aterstall();
  ut.aterstalld = (function(){ try { return localStorage.length === Object.keys(snap).length; } catch(e){ return null; } })();
  if(ut.aterstalld === false) ut.brott.push('LAGRINGEN EJ ATERSTALLD efter matningen');
  return ut;
})()`;

const TMP = path.join(os.tmpdir(), 'flikgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);

let fel = 0, flikar = 0, klickbara = 0, nivarader = 0, graTomma = 0;
console.log('FLIK-GRIND — en byggd flik är klickbar, nivålåset släpper när det ska'
  + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');
console.log('NYCKLAR ur motorfilernas källa (letade, inte handskrivna): '
  + (ALLA_PREFIX.length ? ALLA_PREFIX.map(p => p + '_naddNiva2_<bladId>').join(' · ') : '(inga)'));
if(OMATBARA.length){ fel += OMATBARA.length;
  console.log('✗ nivålås utan läsbar nyckel — grinden kan inte simulera eleven: ' + OMATBARA.join(', ')); }
if(OPARADE.length){ fel += OPARADE.length;
  console.log('✗ nyckeln som skrivs är inte den som läses: ' + OPARADE.join(' | ')); }
console.log('');

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
  MP.rakna(sida, (u.flikar || []).length + (u.nivaer || []).length + (u.enkelSida ? 1 : 0));

  (u.noter || []).forEach(n => console.log('   ' + n));
  (u.flikar || []).forEach(f => {
    flikar++;
    if(f.klickbar){ klickbara++; MP.varde(sida, 'flik:' + f.titel, { klickbar: 1 }); return; }
    MP.varde(sida, 'flik:' + f.titel, { rutor: f.rutor === null ? -1 : f.rutor, last: f.last.length });
    if(f.tomOchStangd){ graTomma++;
      console.log('· ' + kort + ' · "' + f.titel + '" grå och TOM (0 svarsrutor) — platsen syns, '
        + 'men leder inte in i tomrum. Blir den fylld ska flaggan bort.'); }
  });
  (u.nivaer || []).forEach(n => { nivarader++;
    MP.varde(sida, 'nivarad', { toppen: n.toppen, antal: n.antal }); });
  if(u.nivaGrans) console.log('   gräns: ' + u.nivaGrans);
  if(u.enkelSida) MP.varde(sida, 'enkelsida', u.enkelSida);

  if(u.brott && u.brott.length){
    fel += u.brott.length;
    console.log('✗ ' + kort + ':\n     ' + u.brott.join('\n     '));
  }
});
try { fs.unlinkSync(TMP); } catch(e){}

fel += MP.granska();
console.log('\n' + (fel ? '✗ FLIK-GRIND RÖD (' + fel + ')' : '✓ FLIK-GRIND GRÖN')
  + ' · ' + flikar + ' flikar (' + klickbara + ' klickbara, ' + graTomma + ' grå-och-tomma), '
  + nivarader + ' nivårader');
process.exit(fel ? 1 : 0);
