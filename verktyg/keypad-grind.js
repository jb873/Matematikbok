/* keypad-grind.js — KEYPADEN ÄR ALLTID HELT UPPLÅST (order 2026-10-03).
 *
 * REGELN (doc/KONVENTIONER.md §3): alla tecken tända, på varje yta med inmatning, som en
 * miniräknare. Eleven får välja fel operation — addera där multiplikation krävs — och det är
 * meningen: att välja räknesätt är elevens ansvar, inte gränssnittets. En grå knapp talar om
 * vilket räknesätt uppgiften vill ha, och tar därmed bort själva valet som skulle övas.
 *
 * VARFÖR GRINDEN FINNS. Regeln stod i KONVENTIONER i en motstridig form ("bara det rättaren
 * accepterar är tänt") och lagades om och om igen. En regel utan vakt är en prenumeration på
 * samma lagning. Den här grinden gör gråningen röd i stället.
 *
 * MÄTS SÅ: varje yta med inmatningsfält öppnas, keypaden letas upp, och VARJE knapp prövas mot
 * fyra sätt att vara låst — klassen `kp-inactive`, `aria-disabled`, `disabled`, och EFFEKTEN i
 * datorn (pointer-events: none, eller opacitet under 0,9). Effekten mäts för att en knapp kan
 * vara låst utan att bära klassen, och tvärtom.
 *
 * Grinden fäller också om en yta med rutor saknar keypad helt — då finns inget att mäta, och
 * tystnad vore ett falskt godkännande (V11/V14).
 *
 * KNAPPARNAS VERKAN (Joachim 2026-10-26): INGEN KNAPP FÅR SKRIVA ETT ORD I EN RUTA. En tänd knapp
 * kan ändå vara fel: i vanliga rutor skrev bråkknappen "frac" och potensknappen "pot", och den
 * här grinden såg det inte, eftersom den bara mätte att knapparna var upplåsta. Nu TRYCKS varje
 * synlig knapp i varje ruttyp, som en mus gör det (mousedown, mouseup, click), i en tom ruta:
 *   · fälls  om tryckningen skrev två bokstäver i följd, eller knappens namn ("back", "pot" …)
 *   · fälls  om potensknappen varken skrev en upphöjd siffra eller byggde en potens
 *   · fälls  om bråkknappen varken skrev / eller byggde ett staplat bråk
 *   · fälls  om x, potens, 3 inte ger x³ i en vanlig ruta (exponentläget)
 * Rutor med maxlength (en siffra per ruta) prövas bara på ord — en exponent får inte plats där.
 *
 * KÖR:  node verktyg/keypad-grind.js [--sida <delsträng>] [--lista] [--sabba ord]
 *   --sabba ord  potensknappen skriver "pot" igen (i sidan, före mätningen) — negativ verifiering.
 * Exit 1 vid låst tecken eller fel verkan. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('keypad-grind.js');
const LAS_UPP = require('./niva-las-upp').snutt;        // nivåstegen upplåsta innan mätning
const STEG = require('./niva-las-upp').stegSnutt;       // och stegade: nivå 2 och 3 mäts
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.blad())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
// --lasupp: tar bort låsningen I SIDAN innan mätningen. Bara för negativ verifiering — samma
// yta, samma läge, en gång med felet och en gång utan. Samma sorts krok som slump-fuzz --sabba.
const LASUPP = args.includes('--lasupp');
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var LASUPP = ${LASUPP};
  // --sabba ord: det gamla felet tillbaka, i sidan. Potensknappen skriver sitt namn och inget annat.
  if(${JSON.stringify(SABBA)} === 'ord') document.addEventListener('mousedown', function(e){
    var b = e.target.closest && e.target.closest('.kp-key[data-key="pot"]'); if(!b) return;
    var a = document.activeElement; if(a && a.tagName === 'INPUT'){ a.value += 'pot'; }
    e.stopImmediatePropagation(); e.preventDefault();
  }, true);
  function synlig(el){ return !!el.offsetParent; }
  var ut = { ytor: [], onerr: window.__onerr || null };

  // Den keypad eleven ser: ritad (höjd > 0) och inte undanställd.
  function keypads(){
    return Array.prototype.slice.call(document.querySelectorAll('.keypad')).filter(function(k){
      return !k.classList.contains('keypad-hidden') && k.getBoundingClientRect().height > 0;
    });
  }
  // Fyra sätt att vara låst. Effekten mäts, inte bara attributet: en knapp kan vara låst utan
  // klassen, och bära klassen utan att vara låst.
  function last(b){
    var c = getComputedStyle(b), skal = [];
    if(b.classList.contains('kp-inactive')) skal.push('kp-inactive');
    if(b.getAttribute('aria-disabled') === 'true') skal.push('aria-disabled');
    if(b.disabled) skal.push('disabled');
    if(c.pointerEvents === 'none') skal.push('pointer-events:none');
    if(parseFloat(c.opacity) < 0.9) skal.push('opacity ' + c.opacity);
    return skal;
  }

  /* En ruttyps adress: samma sorts signatur som yt-kontraktet använder. Mätningen görs PER
     RUTTYP, inte på ytans första ruta — keypaden följer fokus, och olika rutor på samma yta kan
     ge olika keypad. Första versionen mätte bara rutor[0] och rapporterade därför "INGEN KEYPAD"
     på tre ytor vars FÖRSTA ruta råkade vara en ordruta, fast keypaden fanns för varje talruta
     på samma yta (mätt 2026-10-03: 189 px för talrutorna, 0 för ordrutorna). Samma felklass som
     yt-kontraktets gamla "mätte bara uttr[0]". */
  function adress(i){
    return (i.className || '').trim() + '[' + Array.prototype.map.call(i.attributes, function(a){ return a.name; })
      .filter(function(n){ return n.indexOf('data-') === 0; }).sort().join(',') + ']';
  }
  // ORDRUTA: keypaden ska vara dold. Det är plattformens egen regel — en bokstavsruta har inget
  // att hämta i en sifferkeypad, och den döljs för att inte skymma uppgiften. Alltså inget brott.
  function ordruta(i){ return i.matches('[data-nokeypad], [data-text]'); }

  /* KNAPPARNAS VERKAN. Varje knapp trycks i en TOM ruta av typen. Allt som skrivs läses ur rutans
     cell (en uttryckscell kan få nya fält när ett bråk byggs). Cellen återställs efter varje
     tryckning: värdet töms, och en byggd struktur tas bort genom att cellens innehåll läggs
     tillbaka — bara uttryckscellens, vars lyssnare sitter på bladet och inte på fälten. */
  var UPP = /[\\u2070\\u00b9\\u00b2\\u00b3\\u2074-\\u2079]/;
  function tryck(b){ ['mousedown', 'mouseup', 'click'].forEach(function(t){ b.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true })); }); }
  // En byggd struktur: uttryckscellens bråk och potens, och ekvationskedjans bråksegment, som
  // byggs BREDVID rutan (i dess förälder) och inte i den.
  var STRUKTUR = '.ovn-brak, .ak8-pot, .seg-brak';
  function verkan(inp, knappar, y){
    var cell = inp.closest('.ak8-expr'), spar = cell ? cell.innerHTML : null;
    var idx = cell ? Array.prototype.indexOf.call(cell.querySelectorAll('input'), inp) : 0;
    var omr = cell || inp.parentNode, fore = [].slice.call(omr.querySelectorAll(STRUKTUR));
    // Rutan får inte plats med en exponent (en siffra per ruta), eller ÄR själv en del av en
    // potens (bas- eller exponentfält): där prövas bara att inget ord skrivs.
    var full = inp.hasAttribute('maxlength') || !!inp.closest('sup, .pot, .ak8-pot');
    function ruta(){ return cell ? cell.querySelectorAll('input')[idx] : inp; }
    function aterstall(){
      if(cell && cell.innerHTML !== spar) cell.innerHTML = spar;
      if(!cell) [].forEach.call(omr.querySelectorAll(STRUKTUR), function(s){ if(fore.indexOf(s) < 0 && s.parentNode) s.parentNode.removeChild(s); });
      var r = ruta(); r.value = ''; r.__exp = null; r.focus(); r.dispatchEvent(new Event('focusin', { bubbles: true }));
      return r;
    }
    function skrivet(){ return Array.prototype.map.call(cell ? cell.querySelectorAll('input') : [inp], function(i){ return i.value; }).join(''); }
    function strukturer(){ return omr.querySelectorAll(STRUKTUR).length; }
    var v0 = inp.value;
    aterstall();
    knappar.forEach(function(b){
      var k = b.getAttribute('data-key') || b.textContent.trim();
      aterstall();
      var s0 = strukturer();
      tryck(b);
      var d = skrivet().replace(/\\s+/g, ''), bygg = strukturer() > s0, brott = null;
      if(/[A-Za-z\\u00c5\\u00c4\\u00d6\\u00e5\\u00e4\\u00f6]{2,}/.test(d) || (k.length > 1 && d.indexOf(k) >= 0)) brott = 'skrev "' + d + '"';
      else if(!full && k === 'pot' && !bygg && !UPP.test(d)) brott = 'ingen exponent (skrev "' + d + '")';
      else if(!full && k === 'frac' && !bygg && d.indexOf('/') < 0) brott = 'inget bråk (skrev "' + d + '")';
      if(brott){ var n = k + ': ' + brott + ' i ' + adress(inp); if(y.verkan.indexOf(n) < 0) y.verkan.push(n); }
      y.tryck++;
    });
    // Exponentläget i en vanlig ruta: x, potens, 3 → x³.
    if(!cell && !full){
      var kx = knappar.filter(function(b){ return b.getAttribute('data-key') === 'x'; })[0],
          kp2 = knappar.filter(function(b){ return b.getAttribute('data-key') === 'pot'; })[0],
          k3 = knappar.filter(function(b){ return b.getAttribute('data-key') === '3'; })[0];
      if(kx && kp2 && k3){
        aterstall(); tryck(kx); tryck(kp2); tryck(k3);
        var e = skrivet().replace(/\\s+/g, '');
        if(e !== 'x\\u00b3'){ var n2 = 'x, potens, 3: gav "' + e + '", väntat x³'; if(y.verkan.indexOf(n2) < 0) y.verkan.push(n2); }
        y.tryck += 3;
      }
    }
    var r = aterstall(); r.value = v0;
  }

  function mat(namn){
    // input.mult-upp-ans: uppställningens svarsruta (radtyp 'uppstallning', order 2026-10-07) — en
    // talruta som ska få bladets delade keypad, fast den inte bär .ovn-in.
    var rutor = Array.prototype.filter.call(
      document.querySelectorAll('input.ovn-in, input.ak8-in, input.seg-text, input.ak8-exprtxt, input.mult-upp-ans'), synlig);
    if(!rutor.length) return;
    var y = { yta: namn, rutor: rutor.length, knappar: 0, lasta: [], ordrutor: 0, provade: 0, verkan: [], tryck: 0 };

    var sett = {}, kp = null;
    rutor.forEach(function(inp){
      var typ = adress(inp);
      if(sett[typ]) return;
      sett[typ] = 1;
      if(ordruta(inp)){ y.ordrutor++; return; }      // dold keypad är rätt här
      y.provade++;
      inp.focus();
      inp.dispatchEvent(new Event('focusin', { bubbles: true }));
      var kps = keypads();
      if(!kps.length){ y.utanKeypad = (y.utanKeypad || []); y.utanKeypad.push(typ); return; }
      kp = kps[kps.length - 1];
      if(LASUPP) Array.prototype.forEach.call(kp.querySelectorAll('.kp-key'), function(b){
        b.classList.remove('kp-inactive'); b.removeAttribute('aria-disabled'); b.disabled = false;
        b.style.pointerEvents = 'auto'; b.style.opacity = '1';
      });
      var knappar = Array.prototype.filter.call(kp.querySelectorAll('.kp-key'), synlig);
      y.knappar = knappar.length;
      knappar.forEach(function(b){
        var skal = last(b);
        if(skal.length){
          var nyckel = (b.getAttribute('data-key') || b.textContent.trim() || '?') + ' [' + skal.join(', ') + ']';
          if(y.lasta.indexOf(nyckel) < 0) y.lasta.push(nyckel);
        }
      });
      verkan(inp, knappar, y);
    });
    // Ingen talruta alls på ytan (bara ordrutor) → inget keypad-krav, och inget att mäta.
    if(!y.provade){ y.baraOrdrutor = true; ut.ytor.push(y); return; }
    if(y.utanKeypad && y.utanKeypad.length){ y.ingenKeypad = true; ut.ytor.push(y); return; }
    ut.ytor.push(y);
  }

  /* NIVÅSTEGEN (2026-10-10): upplåsta och stegade med de DELADE snuttarna (verktyg/niva-las-upp.js).
     Förr mättes bara flikens aktiva steg — nivå 2 och 3 hade aldrig fått sin keypad prövad. */
  ${LAS_UPP}
  ${STEG}
  function synligMount(){
    return Array.prototype.filter.call(document.querySelectorAll('.blad-mount'), function(e){ return !e.hidden && e.offsetParent; })[0]
        || Array.prototype.filter.call(document.querySelectorAll('.ovn-wrap'), function(e){ return !!e.offsetParent && e.querySelector('.niva-rad'); })[0]
        || document.body;
  }
  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .plugg-dok, .nr-rad'));
  (nav.length ? nav : [null]).forEach(function(b){
    if(b){ if(b.disabled) return; b.click(); }
    var namn = b ? b.textContent.replace(/\\s+/g, ' ').trim().slice(0, 28) : '(enda)';
    mat(namn);
    nivaVarv(synligMount(), function(niva){ mat(namn.slice(0, 22) + ' niv\\u00e5 ' + niva); });
  });
  return ut;
})()`;

const TMP = path.join(os.tmpdir(), 'keypadgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);

let fel = 0, ytor = 0, knappar = 0, tryck = 0;
const berorda = {};                                            // sidor med fel verkan, för rapporten
console.log('KEYPAD-GRIND — keypaden är alltid helt upplåst\n');

Sidor.blad().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
    '--vanta-pa', 'blad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + u.onerr.slice(0, 2).join(' | ')); }
  MP.rakna(sida, (u.ytor || []).length);

  (u.ytor || []).forEach(y => {
    ytor++; knappar += y.knappar; tryck += y.tryck || 0;
    MP.varde(sida, y.yta, { rutor: y.rutor, knappar: y.knappar, lasta: y.lasta.length });
    if(y.verkan && y.verkan.length){
      fel += y.verkan.length; berorda[sida] = (berorda[sida] || 0) + y.verkan.length;
      console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ': ' + y.verkan.length
        + ' knapp(ar) med FEL VERKAN\n     ' + y.verkan.slice(0, 6).join(' · '));
    }
    if(y.baraOrdrutor){
      console.log('· ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ' (' + y.ordrutor
        + ' ordruttyper, inga talrutor — keypaden ska vara dold här)');
      return;
    }
    if(y.ingenKeypad){
      fel++;
      console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ': INGEN KEYPAD för talruttypen '
        + (y.utanKeypad || []).slice(0, 2).join(' · ') + ' — en yta med inmatning ska ha keypad');
      return;
    }
    if(!y.lasta.length){
      console.log('✓ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ' (' + y.knappar + ' knappar, alla tända · '
        + y.provade + ' talruttyper' + (y.ordrutor ? ' · ' + y.ordrutor + ' ordruttyper med dold keypad' : '') + ')');
      return;
    }
    fel += y.lasta.length;
    console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ': ' + y.lasta.length
      + ' av ' + y.knappar + ' knappar LÅSTA\n     ' + y.lasta.slice(0, 8).join(' · '));
  });
});
try { fs.unlinkSync(TMP); } catch(e){}

fel += MP.granska();
if(Object.keys(berorda).length) console.log('\nSidor med fel verkan: ' + Object.keys(berorda).length + '\n  '
  + Object.keys(berorda).map(s => s.replace(/\/index\.html$/, '') + ' (' + berorda[s] + ')').join('\n  '));
console.log('\n' + (fel ? '✗ KEYPAD-GRIND RÖD (' + fel + ')' : '✓ KEYPAD-GRIND GRÖN')
  + ' · ' + ytor + ' ytor, ' + knappar + ' knappar prövade, ' + tryck + ' tryckningar');
process.exit(fel ? 1 : 0);
