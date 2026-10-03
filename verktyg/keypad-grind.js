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
 * KÖR:  node verktyg/keypad-grind.js [--sida <delsträng>] [--lista]
 * Exit 1 vid låst tecken. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('keypad-grind.js');
const args = process.argv.slice(2);
if(Sidor.lista(args, Sidor.blad())) process.exit(0);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
// --lasupp: tar bort låsningen I SIDAN innan mätningen. Bara för negativ verifiering — samma
// yta, samma läge, en gång med felet och en gång utan. Samma sorts krok som slump-fuzz --sabba.
const LASUPP = args.includes('--lasupp');
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var LASUPP = ${LASUPP};
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

  function mat(namn){
    var rutor = Array.prototype.filter.call(
      document.querySelectorAll('input.ovn-in, input.ak8-in, input.seg-text, input.ak8-exprtxt'), synlig);
    if(!rutor.length) return;
    var y = { yta: namn, rutor: rutor.length, knappar: 0, lasta: [] };

    // Keypaden följer fokus, så den mäts med en ruta fokuserad — det är elevens läge.
    rutor[0].focus();
    rutor[0].dispatchEvent(new Event('focusin', { bubbles: true }));

    var kps = keypads();
    if(!kps.length){ y.ingenKeypad = true; ut.ytor.push(y); return; }
    var kp = kps[kps.length - 1];
    if(LASUPP) Array.prototype.forEach.call(kp.querySelectorAll('.kp-key'), function(b){
      b.classList.remove('kp-inactive'); b.removeAttribute('aria-disabled'); b.disabled = false;
      b.style.pointerEvents = 'auto'; b.style.opacity = '1';
    });
    var knappar = Array.prototype.filter.call(kp.querySelectorAll('.kp-key'), synlig);
    y.knappar = knappar.length;
    knappar.forEach(function(b){
      var skal = last(b);
      if(skal.length) y.lasta.push((b.getAttribute('data-key') || b.textContent.trim() || '?') + ' [' + skal.join(', ') + ']');
    });
    ut.ytor.push(y);
  }

  var nav = Array.prototype.slice.call(document.querySelectorAll('.blad-nav-btn, .blad-subnav-btn, .plugg-dok'));
  (nav.length ? nav : [null]).forEach(function(b){
    if(b){ if(b.disabled) return; b.click(); }
    mat(b ? b.textContent.replace(/\\s+/g, ' ').trim().slice(0, 28) : '(enda)');
  });
  return ut;
})()`;

const TMP = path.join(os.tmpdir(), 'keypadgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);

let fel = 0, ytor = 0, knappar = 0;
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
    ytor++; knappar += y.knappar;
    MP.varde(sida, y.yta, { rutor: y.rutor, knappar: y.knappar, lasta: y.lasta.length });
    if(y.ingenKeypad){
      fel++;
      console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ': INGEN KEYPAD på en yta med '
        + y.rutor + ' rutor — inget att mäta, och tystnad vore ett falskt godkännande');
      return;
    }
    if(!y.lasta.length){
      console.log('✓ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ' (' + y.knappar + ' knappar, alla tända)');
      return;
    }
    fel += y.lasta.length;
    console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ': ' + y.lasta.length
      + ' av ' + y.knappar + ' knappar LÅSTA\n     ' + y.lasta.slice(0, 8).join(' · '));
  });
});
try { fs.unlinkSync(TMP); } catch(e){}

fel += MP.granska();
console.log('\n' + (fel ? '✗ KEYPAD-GRIND RÖD (' + fel + ')' : '✓ KEYPAD-GRIND GRÖN')
  + ' · ' + ytor + ' ytor, ' + knappar + ' knappar prövade');
process.exit(fel ? 1 : 0);
