/* synlig-grind.js — SYNLIG START: varje surfat färdighetskort ska leda till en drill som faktiskt visas.
   ─────────────────────────────────────────────────────────────────────────────────────────────
   Komplement till koppling-grind (statisk: renderare finns ⟷ visning finns). Det statiska benet ser att
   renderAvrOverslag FINNS — bara en körning ser att den säger "byggs inom kort". Vi har haft dolda drillar
   som renderade tomt och kort som ledde till kapitelöversikten (2026-09-19: avr-overslag:rakna = stubb).

   För varje lövnod med visning.utbudslista (k1/k2/k3) öppnas ramens deeplink (?ko=&formaga=&embed=1, som
   hubbens kort gör) i riktig Chrome (cdp-kor.js) och kräver:
     · ett synligt .exercise-card
     · minst en synlig input/knapp (utöver "tillbaka")
     · ingen synlig kapitelöversikt (.hist-del-card)
     · ingen stubb-text ("byggs inom kort" / "byggs senare" / "kommer snart")
     · 0 JS-fel
   Noder märkta visning.kommer = true (plats utan innehåll; hubben visar kortet dämpat och oklickbart) ska
   TVÄRTOM vara stubb/tomma — de rapporteras som KOMMER, inte FEL, och blir FEL den dag de faktiskt renderar
   (då ska flaggan bort).

   NEGATIVT VERIFIERAD (2026-09-19): formagaKey pekad på renderAvrOverslag → FEL "stubb-text"; på saknad
   renderare → FEL "kapitelöversikt". Se commit.
   KÖR:  node verktyg/synlig-grind.js [--kapitel k1|k2|k3] [--nod <id>]     (~108 deeplinks ≈ 6 min)
   Noll nätväg. Rör aldrig källfiler. Exit 1 vid FEL. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const KAP = opt('--kapitel'), NOD = opt('--nod');
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const STUBB_RE = /byggs inom kort|byggs senare|kommer snart|inte byggd än/i;

// Probe som körs i sidan — samma kriterier som hubbens elev ser.
const PROBE = `(function(){
  function vis(e){ return !!(e && e.offsetParent !== null && e.getBoundingClientRect().height > 0); }
  // KEYPAD-kravet: numeriska fält (inputmode numeric/decimal, eller siffercell maxlength=1) kräver synlig keypad —
  // en elev på surfplatta kan inte fylla i annars. Rena textfält (inputmode text / data-nokeypad) får tangentbord.
  function matKeypad(){
    var falt = [].filter.call(document.querySelectorAll('input:not([type=hidden]):not([disabled]), textarea:not([disabled])'), vis);
    var num = falt.filter(function(i){ var im = (i.getAttribute('inputmode') || '').toLowerCase(); return im === 'numeric' || im === 'decimal' || (!im && i.getAttribute('maxlength') === '1') || /ans-input|upp-ans|div-kort|div-lang|brak-in|ovn-in/.test(i.className) && im !== 'text' && !i.hasAttribute('data-nokeypad'); });
    var txt = falt.length - num.length;
    var kp = [].filter.call(document.querySelectorAll('.keypad, .ovn-keypad, .kp-key, .keypad-digits, .kp-btn'), vis).length;
    return { numInputs: num.length, textInputs: txt, keypad: kp };
  }
  function start(){ var b = [].find.call(document.querySelectorAll('button, a.btn'), function(x){ return vis(x) && /^(Öva nu|Öva|Starta|Börja|Börja öva|Öva nu ->|Öva nu →)/i.test(x.textContent.trim()); }); if(b){ b.click(); return true; } return false; }
  var kort = [].filter.call(document.querySelectorAll('.exercise-card'), vis).length;
  var inputs = [].filter.call(document.querySelectorAll('input, textarea, select, .kp-key, button'), function(b){ return vis(b) && !/tillbaka|till alla|←/i.test(b.textContent || ''); }).length;
  var oversikt = [].filter.call(document.querySelectorAll('.hist-del-card, .del-card'), vis).length;
  var text = (document.body.innerText || '').replace(/\\s+/g, ' ').trim();
  var h = [].find.call(document.querySelectorAll('h1,h2,h3'), vis);
  var bas = { fel: (window.__jsfel || []).length, onerr: window.__onerr || [], kort: kort, inputs: inputs, oversikt: oversikt, stubb: ${STUBB_RE.toString()}.test(text), tom: text.length < 40, rubrik: h ? h.textContent.trim().slice(0, 40) : '' };
  var k0 = matKeypad();
  if(k0.numInputs + k0.textInputs > 0 || !start()) return Object.assign(bas, k0, { startad: false });
  return new Promise(function(res){ setTimeout(function(){ var k1 = matKeypad(); res(Object.assign(bas, k1, { startad: true, fel: (window.__jsfel || []).length, onerr: window.__onerr || [] })); }, 700); });
})()`;
// window.onerror-hook före sidans skript (__jsfel missade kastade fel — kartan som renderade tomt)
const PRE = "window.__onerr = []; window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename||'').split('/').pop() + ':' + e.lineno); });";

function cdp(url){
  const tmp = path.join(os.tmpdir(), 'synlig-' + process.pid + '-' + Math.random().toString(16).slice(2) + '.js');
  fs.writeFileSync(tmp, PROBE);
  const pre = tmp.replace(/\.js$/, '-pre.js'); fs.writeFileSync(pre, PRE);
  let r; for(let forsok = 0; forsok < 2; forsok++){
    r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), url, tmp, '--pre', pre, '--wait', '1800', '--timeout', '40000'], { encoding: 'utf8', timeout: 90000 });
    if(r.status === 0) break;
    if(!(r.signal || /svarade inte på CDP-porten|hittar ingen sid-target|vakthund|CDP-steg tidsgränsat|WebSocket/.test(r.stderr || ''))) break;
  }
  try { fs.unlinkSync(tmp); fs.unlinkSync(pre); } catch(e){}
  if(r.status !== 0) return { harness: (r.stderr || r.stdout || 'okänt fel').trim().slice(0, 200) };
  try { return JSON.parse(r.stdout.trim().split('\n').pop()); } catch(e){ return { harness: 'ogiltig JSON: ' + r.stdout.slice(0, 200) }; }
}

function surfade(){
  const out = [];
  for(const [f, key, kap, ram] of [['js/data/k1-taxonomi.js', 'K1_TAXONOMI', 'k1', 'ak7-k1-ram.html'], ['js/data/k2-taxonomi.js', 'K2_TAXONOMI', 'k2', 'ak7-k2-ram.html'], ['js/data/k3-taxonomi.js', 'K3_TAXONOMI', 'k3', 'ak7-k3-ram.html']]){
    if(KAP && KAP !== kap) continue;
    const w = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { window: w });
    for(const n of (w[key].noder || [])){
      if(n.niva !== 'lovnod' || !n.visning || !n.visning.utbudslista) continue;
      if(NOD && n.id !== NOD) continue;
      const p = String(n.id).split(':'), fk = n.visning.formagaKey || p[1];
      let url = fileUrl(path.join(ROOT, ram)) + '?ko=' + encodeURIComponent(p[0]) + '&formaga=' + encodeURIComponent(fk) + '&embed=1';
      if(n.visning.niva && n.visning.niva < 3) url += '&maxniva=' + n.visning.niva;
      out.push({ id: n.id, kap, utbud: n.visning.utbudslista, kommer: !!n.visning.kommer, url });
    }
  }
  return out;
}

const noder = surfade();
console.log('SYNLIG-GRIND · ' + noder.length + ' surfade kort (' + (KAP || 'k1+k2+k3') + ')');
let FEL = 0, KOMMER = 0, OK = 0; const t0 = Date.now();
for(const n of noder){
  const r = cdp(n.url);
  let status, why = '';
  if(r.harness){ status = 'FEL'; why = 'harness: ' + r.harness; }
  else {
    const onerr = (r.onerr || []).length;
    const utanKeypad = r.numInputs > 0 && r.keypad === 0;
    const synlig = r.kort > 0 && r.inputs > 0 && r.oversikt === 0 && !r.stubb && !r.tom && r.fel === 0 && onerr === 0 && !utanKeypad;
    if(n.kommer){ status = synlig ? 'FEL' : 'KOMMER'; why = synlig ? 'renderar trots visning.kommer — ta bort flaggan' : 'plats utan innehåll (kortet dämpat i hubben)'; }
    else if(synlig) status = 'OK';
    else { status = 'FEL'; why = onerr ? 'onerror: ' + r.onerr[0] : utanKeypad ? 'INMATNING UTAN KEYPAD (' + r.numInputs + ' numeriska fält, 0 keypad)' : r.fel ? r.fel + ' JS-fel' : r.oversikt ? 'kapitelöversikt i st f drill (renderare saknas?)' : r.stubb ? 'stubb-text ("byggs inom kort")' : r.tom ? 'tom sida' : !r.kort ? 'inget .exercise-card' : 'inga synliga rutor/knappar'; }
  }
  if(status === 'OK') OK++; else if(status === 'KOMMER') KOMMER++; else FEL++;
  console.log('  ' + (status === 'OK' ? '✓' : status === 'KOMMER' ? '~' : '✗') + ' ' + n.kap + ' ' + n.id.padEnd(34) + (status === 'OK' ? '«' + (r.rubrik || '') + '»' : status + ' — ' + why));
}
console.log('\n' + (FEL ? '✗ SYNLIG-GRIND RÖD' : '✓ SYNLIG-GRIND GRÖN') + ' · ' + OK + ' synliga · ' + KOMMER + ' kommer · ' + FEL + ' fel · ' + Math.round((Date.now() - t0) / 1000) + ' s');
process.exit(FEL ? 1 : 0);
