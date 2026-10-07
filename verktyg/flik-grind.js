/* flik-grind.js — EN BYGGD FLIK ÄR KLICKBAR, OCH NIVÅLÅSET SLÄPPER NÄR DET SKA (order 2026-10-03).
 *
 * REGELN (doc/KONVENTIONER.md §3):
 *   · Delflikar — olika uppgiftstyper (Stora tal / Små tal / Lästal …) — är ALLTID klickbara.
 *     Grå är fel. Undantaget är den tomma platsen: ett blad utan uppgifter leder in i tomrum, och
 *     då syns platsen men öppnas inte (`is-kommer`). Grinden skiljer de två på INNEHÅLL, inte på
 *     flaggan: den räknar svarsrutor i flikens blad.
 *   · Nivå 1 och 2 är ALLTID klickbara. Är det bara två nivåer är alltså ingen låst — eleven
 *     hoppar fritt. (Regeln spikad av Joachim 2026-10-03; vakten vaktade först "den högsta
 *     nivån är villkorad", vilket med två nivåer kräver det MOTSATTA.)
 *   · Nivå 3 och uppåt är villkorad: öppen om och endast om nivån under är gjord. Inget blad
 *     har tre steg i dag, så det benet skriver ut en GRÄNS i stället för att tiga.
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
 *     tom lagring       → nivå 1–2 öppna; nivå 3+ LÅST
 *     nivån under gjord → nivå 3+ ÖPPEN
 *     tom igen          → LÅST igen (inte "en gång upplåst, alltid upplåst")
 * Den fäller åt BÅDA håll: låst trots att villkoret är uppfyllt, OCH öppen utan att det är det.
 * Nivå 1–2 mäts i alla tre lägena — de ska vara öppna oavsett vad som står i lagringen.
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
 *       --sabba niva-last   låser nivå 2                        → BEN 2 måste fälla i tre lägen
 *       --sabba niva-oppen  öppnar nivå 3+ utan villkor         → BEN 3 (ingen data i dag)
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
    /* Siffran ar INTE med i monstret. Motorn skriver nyckeln generaliserat
       (lsSet('<prefix>_naddNiva' + nastaNiva + '_')), och ett monster med en hardkodad 2 slutade
       da matcha - varpa pariteskontrollen nedan dog tyst. Utan siffran haller bada aven for
       niva 3 och uppat. */
    /* DEN DELADE MODULEN bygger nyckeln i en egen funktion och tar prefixet som argument, så
       inget lsGet-anrop bär det. Prefixet står i bladets data (nivaPrefix:'k1d7') — letas
       där, i stället för att skrivas av för hand. */
    let d2, rd = /nivaPrefix\s*:\s*'([A-Za-z0-9_]+)'/g;
    while((d2 = rd.exec(s))){ (las[f] = las[f] || []).push(d2[1]); (skriv[f] = skriv[f] || []).push(d2[1]); }
    let m, r = /lsGet\('([A-Za-z0-9_]+)_naddNiva/g;
    while((m = r.exec(s))) (las[f] = las[f] || []).push(m[1]);
    r = /lsSet\('([A-Za-z0-9_]+)_naddNiva/g;
    while((m = r.exec(s))) (skriv[f] = skriv[f] || []).push(m[1]);
  });
  // Dedup per fil: flera trafar pa samma prefix ar normalt (las + skriv pa flera stallen).
  Object.keys(las).forEach(function(f){ las[f] = Array.from(new Set(las[f])); });
  Object.keys(skriv).forEach(function(f){ skriv[f] = Array.from(new Set(skriv[f])); });
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

  /* -- BEN 1b: NAVIGATIONSRAMENS VARIANTER (.nr-rad) ---------------------------------------
     Samma regel, ny yta. En gra variant maste bara taxonomins .is-kommer; grå utan flagga ar
     ett brott. Parning mot blad gors INTE: ramen har manga varianter mot fa blad, och bladet
     byggs om vid klick. Det som avgor saken ar VARFOR platsen ar gra. */
  /* Dragspelet GAS IGENOM: en rubrik oppen och en grupp oppen ar sjalva regeln, sa bara ett
     fatal rader ar synliga i startlaget. Grinden oppnar varje rubrik och varje grupp och maler
     varianterna dar - annars mater den startlaget, inte ytan. */
  var varianter = [];
  Array.prototype.forEach.call(document.querySelectorAll('.nr-huvud'), function(h){
    var hh = h.querySelector('.nr-huvud-h');
    if(hh && !h.classList.contains('is-open')) hh.click();
    Array.prototype.forEach.call(h.querySelectorAll('.nr-grp'), function(g){
      var gh = g.querySelector('.nr-grp-h');
      if(gh && !g.classList.contains('is-open')) gh.click();
      Array.prototype.forEach.call(g.querySelectorAll('.nr-rad'), function(v){
        if(synlig(v) && varianter.indexOf(v) < 0) varianter.push(v);
      });
    });
  });
  if(SABBA === 'flik' && varianter.length){
    // Gra den forsta varianten som INTE bar is-kommer -> BEN 1b maste falla och namna den.
    for(var w = 0; w < varianter.length; w++){
      if(!varianter[w].classList.contains('is-kommer')){
        varianter[w].disabled = true; varianter[w].setAttribute('aria-disabled', 'true');
        ut.noter.push('SABBA: graade varianten "'
          + varianter[w].textContent.replace(/\\s+/g, ' ').trim().slice(0, 34) + '"');
        break;
      }
    }
  }
  varianter.forEach(function(v){
    var titel = v.textContent.replace(/\\s+/g, ' ').trim().slice(0, 40);
    var skal = last(v);
    var kommer = v.classList.contains('is-kommer');
    var f = { titel: titel, variant: true, last: skal, kommer: kommer };
    if(!skal.length){ f.klickbar = true; }
    else if(!kommer){
      ut.brott.push('VARIANT GRA UTAN SKAL: "' + titel + '" ar sparrad (' + skal.join(', ')
        + ') men bar inte .is-kommer - en gra plats maste ha ett dokumenterat skal i datan');
    } else { f.tomOchStangd = true; }
    ut.flikar.push(f);
  });
  // Ramen finns men utan en enda variant = navigeringen renderade inte.
  if(document.querySelector('.nr-lager') && !varianter.length)
    ut.brott.push('NAVRAMEN TOM: .nr-lager finns men noll varianter - vanster-spalten renderade inte');

  // -- BEN 2+3: nivaraden ---------------------------------------------------------------
  /* Nivåraden hör till ETT blad, och ett dolt blad har inga synliga knappar. Innan raden läses
     klickas bladet fram — annars mäter benet bara det blad som råkade vara startblad. */
  function framBladMedNivarad(){
    /* Finns ingen nivåknapp alls i dokumentet finns inget att leta fram, och då klickas
       ingenting: klicken är en sidoeffekt, och en sida utan nivåer ska inte navigeras av
       det här benet. */
    if(!document.querySelector('.niva-btn')) return false;
    if(Array.prototype.some.call(document.querySelectorAll('.niva-btn'), synlig)) return true;
    var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .nr-rad'));
    for(var i = 0; i < nav.length; i++){
      if(nav[i].disabled) continue;
      nav[i].click();
      if(Array.prototype.some.call(document.querySelectorAll('.niva-btn'), synlig)) return true;
    }
    return false;
  }
  function nivaknappar(){
    framBladMedNivarad();
    return Array.prototype.filter.call(document.querySelectorAll('.niva-btn'), synlig).map(function(b){
      return { niva: parseInt(b.dataset.niva, 10), last: last(b),
               txt: b.textContent.replace(/\\s+/g, ' ').trim() };
    });
  }
  var blad = Array.prototype.map.call(document.querySelectorAll('[id^="sheet-"]'),
    function(s){ return s.id.replace('sheet-', ''); });
  /* Varje tillstandsbyte bygger om bladet, vilket suddar en DOM-sabotering. Darfor applicerar
     bygg() om den efterat - annars kan --sabba bara falla i det FORSTA laget, och ett prov som
     bara kan falla pa ett av tre stallen bevisar inte att de tre mats. */
  function sabotera(){
    if(SABBA !== 'niva-last') return;
    document.querySelectorAll('.niva-btn[data-niva="2"]').forEach(function(b){
      b.disabled = true; b.setAttribute('aria-disabled', 'true');
    });
  }
  /* TVÅ MEKANISMER. De äldre motorerna tar nivån som tredje argument till byggSheet; den
     DELADE nivåraden (nivarad.js) byts med ett klick på knappen och läser sitt tillstånd ur
     localStorage. Fanns bara den första vägen anropades d7:s byggSheet(id, variant,
     kanVaraGrundblad) med nivån som tredje argument — ett annat argument, tyst fel. */
  function deladRad(){ return !!document.querySelector('.niva-rad .niva-btn'); }
  function bygg(niva){
    if(deladRad()){
      framBladMedNivarad();
      var kn = document.querySelector('.niva-rad .niva-btn[data-niva="' + niva + '"]');
      if(kn && !kn.disabled) kn.click();
      sabotera();
      return;
    }
    blad.forEach(function(id){ try { byggSheet(id, false, niva); } catch(e){} });
    sabotera();
  }
  /* NIVÅN SOM SKA VARA NÅDD anges av anroparen. Nyckeln för nivå n betyder "n är nådd", och
     den skrivs när n-1 är klarad — så för att pröva att TOPPEN öppnas skrivs toppens nyckel. */
  function sattGjord(niva){
    var n = niva || 2;
    blad.forEach(function(id){ PREFIX.forEach(function(p){
      try { localStorage.setItem(p + '_naddNiva' + n + '_' + id, '1'); } catch(e){} }); });
  }

  if(nivaknappar().length && typeof byggSheet !== 'function' && !deladRad()){
    ut.brott.push('NIVA: sidan har nivaknappar men byggSheet ar inte nabar - grinden kan inte stalla in tillstandet');
    ut.nivaGrans = 'byggSheet ej nabar';
  } else if(typeof byggSheet === 'function' || deladRad()){
    tom(); bygg(1);
    var A = nivaknappar();
    if(A.length){
      var toppen = Math.max.apply(null, A.map(function(k){ return k.niva; }));
      var fria = [1, 2];   // alltid klickbara, oavsett lagring

      /* BEN 2 - niva 1 och 2 ska vara oppna i ALLA TRE lagringslagen. Darfor mats de i varje
         lage, inte bara i det forsta: ett las som slar till forst nar nagot sparats hade annars
         sluppit igenom. */
      function fria_oppna(lage){
        nivaknappar().filter(function(k){ return fria.indexOf(k.niva) >= 0 && k.last.length; })
          .forEach(function(k){
            ut.brott.push('NIVA ' + k.niva + ' GRA (' + lage + '): niva 1 och 2 ar alltid '
              + 'klickbara - ar det bara tva nivaer ar ingen last - ' + k.last.join(', '));
          });
      }
      if(SABBA === 'niva-last'){ sabotera(); ut.noter.push('SABBA: laste niva 2 (ateranvands efter varje ombyggnad)'); }
      fria_oppna('tom lagring');

      /* BEN 3 - niva 3 och uppat ar villkorad, och mats tillstandsdrivet. Finns ingen sadan niva
         har benet inget att mata, och det ar en GRANS som skrivs ut - inte ett tyst godkannande
         (V11/V14). Far ett blad ett tredje steg borjar benet mata av sig sjalvt. */
      if(toppen < 3){
        ut.nivaGrans = 'ingen nivarad har tre steg an (toppen ar ' + toppen
          + ') - det tillstandsdrivna benet har inget att mata har';
        sattGjord(); bygg(1); fria_oppna('nivan under gjord');
        tom(); bygg(1); fria_oppna('tom igen');
      } else {
        var toppA = nivaknappar().filter(function(k){ return k.niva === toppen; });
        var lastA = toppA.length > 0 && toppA.every(function(k){ return k.last.length > 0; });
        if(SABBA === 'niva-oppen'){
          document.querySelectorAll('.niva-btn[data-niva="' + toppen + '"]').forEach(function(b){
            b.disabled = false; b.removeAttribute('aria-disabled');
            b.classList.remove('is-locked'); b.style.opacity = '1';
          });
          lastA = false; ut.noter.push('SABBA: oppnade niva ' + toppen + ' utan villkor');
        }
        if(!lastA) ut.brott.push('NIVA ' + toppen + ' OPPEN UTAN VILLKOR: med tom lagring ska den vara last - laset lacker');

        sattGjord(toppen); bygg(1); fria_oppna('nivan under gjord');
        var B = nivaknappar().filter(function(k){ return k.niva === toppen; });
        var oppenB = B.length > 0 && B.every(function(k){ return k.last.length === 0; });
        if(!oppenB) ut.brott.push('NIVA ' + toppen + ' LAST TROTS VILLKORET: nivan under ar gjord men knappen ar '
          + (B.length ? B[0].last.join(', ') : 'borta'));

        tom(); bygg(1); fria_oppna('tom igen');
        var C = nivaknappar().filter(function(k){ return k.niva === toppen; });
        if(!(C.length && C.every(function(k){ return k.last.length > 0; })))
          ut.brott.push('NIVA ' + toppen + ' FORBLEV OPPEN: lagringen tomd, men laset slar inte till igen');
      }

      ut.nivaer.push({ toppen: toppen, antal: A.length, blad: blad.length });
    }
  }

  /* En sida utan delflikar OCH utan nivarad ar utanfor grindens omrade. Men noll matpunkter
     lases som "omatt" (V14), sa franvaron BEVISAS i stallet: sidan maste ha renderat svarsrutor
     (alltsa laddat klart) och sakna bade flikknappar och nivaknappar. Da ar "inga flikar" ett
     MATT resultat. Renderade den inget alls lamnas noll matpunkter med flit - da ar sidan tom
     eller obyggd, och det agarskapet hor hos V14:s egen lista, inte hos ett eget brott harifran. */
  if(!btns.length && !ut.nivaer.length && !document.querySelector('.nr-lager')){
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
    // En VARIANT mats pa skalet i datan, en FLIK pa innehallet i bladet. Anmal det som matts.
    if(f.variant) MP.varde(sida, 'variant:' + f.titel, { last: f.last.length, kommer: f.kommer ? 1 : 0 });
    else MP.varde(sida, 'flik:' + f.titel, { rutor: f.rutor === null ? -1 : f.rutor, last: f.last.length });
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
