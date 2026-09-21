/* delkapitel-grind.js — KONTRAKTS-GRIND för åk8-delkapitel (FAS 5, "Gör konventionerna till kontrakt").
   ─────────────────────────────────────────────────────────────────────────────────────────────────
   Bakgrund: dk11 byggdes utan fyra konventioner som redan fanns — men bara som KOPIOR i redan byggda
   filer, inte som anropbara kontrakt. Det som var kontrakt (renderTestFlik) ärvdes; det som var kopia
   (föreläsningsform, bladomslag + CSS, drill-distinkthet, test-täckning) ärvdes inte. Nu finns kontrakten
   (AK8_FOREL.renderForelFlik, ak8-blad-kanon.css + AK8_UI.renderSheet, distinktOmgang, generateTest
   coverage) och den här grinden KÖRS — den läses inte. Per åk8-sida kräver den:

     1 FÖRELÄSNING  har sidan en föreläsningspanel ska den vara TOM i källan och monteras via registret
                    (forelasningar.js + AK8_FOREL.renderForelFlik). Ingen egen text, ingen inline-video.
     2 BLAD         sidan länkar ak8-blad-kanon.css; inga PAGE-ONLY .ovn-/.ak8-regler inline (bara
                    överskrivningar av selektorer som finns i kanon/shared); Öva renderar .ovn-sheet.
     3 DRILLAR      varje drill i sidans Färdighetsträning körd en hel omgång (8) i riktiga ramen — ingen
                    uppgift upprepad. (Kända skuld-drillar rapporteras som SKULD, ej FEL, tills de migreras.)
     4 TEST         varje färdigt test för sidans delkapitel: EN fråga per generator (ingen dubblerad),
                    alla noder täckta; för dk11, dk7 och dk6 dessutom alla tal ∈ öva-bladets talmängd (talBank).

   NEGATIVT VERIFIERAD (varje fel återinfört → grinden fäller): se commit-meddelandet för FAS 5.
   KÖR:  node verktyg/delkapitel-grind.js [--sida kvadratrotter] [--snabb]   (--snabb hoppar drill-körningen)
   Noll nätväg. Rör aldrig källfiler (CDP mot riktiga filer, temp bara i OS-temp). Exit 1 vid FEL. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'ak8/k1');
const args = process.argv.slice(2);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SNABB = args.includes('--snabb');
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

// Kända drill-skulder (saknar distinkthet, egen order — se minnet drill-distinkthet-skuld). Rapporteras som SKULD.
// Ta bort en rad när drillen migrerats till distinktOmgang; grinden blir då skarp för den.
const KAND_SKULD_KO = /^(mult-|div-|position|add-|sub-|prio-|avr-|siffror|tal-|primtal|delbar|neg-|brak-)/;

let FEL = 0, VARN = 0, SKULD = 0;
const ok = (s) => console.log('   ✓ ' + s);
const fel = (s) => { FEL++; console.log('   ✗ FEL  ' + s); };
const varn = (s) => { VARN++; console.log('   ! varn ' + s); };
const skuld = (s) => { SKULD++; console.log('   ~ SKULD ' + s); };

function cdp(url, js, extra){
  const tmp = path.join(os.tmpdir(), 'grind-' + process.pid + '-' + Math.random().toString(16).slice(2) + '.js');
  fs.writeFileSync(tmp, js);
  let r; for(let forsok = 0; forsok < 2; forsok++){   // ett omförsök vid CDP-portrace (Chrome hann inte upp)
    r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), url, tmp].concat(extra || []), { encoding: 'utf8', timeout: 320000 });
    if(r.status === 0) break;                                           // lyckat → klart
    if(!(r.signal || /svarade inte på CDP-porten|hittar ingen sid-target|vakthund|CDP-steg tidsgränsat|WebSocket-anslutning/.test(r.stderr || ''))) break;   // riktigt fel i sidan → ingen retry; harness-hängning → ett omförsök
  }
  try { fs.unlinkSync(tmp); } catch(e){}
  if(r.status !== 0){ return { fel: (r.stderr || r.stdout || (r.signal ? 'timeout (' + r.signal + ')' : 'okänt fel')).trim().slice(0, 300) }; }
  try { return JSON.parse(r.stdout.trim().split('\n').pop()); } catch(e){ return { fel: 'ogiltig JSON: ' + r.stdout.slice(0, 200) }; }
}

// ── CSS-tokenizer (samma som css-flytten) ──
function tokenize(css){
  const out = []; let i = 0, n = css.length;
  while(i < n){
    if(/\s/.test(css[i])){ i++; continue; }
    if(css.startsWith('/*', i)){ const e = css.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    const ob = css.indexOf('{', i); if(ob < 0) break;
    const sel = css.slice(i, ob).trim();
    if(sel.startsWith('@')){ let d = 0, j = ob; for(; j < n; j++){ if(css[j] === '{') d++; else if(css[j] === '}'){ d--; if(d === 0) break; } } i = j + 1; continue; }
    const cb = css.indexOf('}', ob); if(cb < 0) break;
    out.push(sel); i = cb + 1;
  }
  return out;
}
const norm = s => s.replace(/\s+/g, ' ').trim();
const kanonSel = new Set(tokenize(fs.readFileSync(path.join(ROOT, 'js/motor/blad/ak8-blad-kanon.css'), 'utf8')).map(norm)
  .concat(tokenize(fs.readFileSync(path.join(ROOT, 'js/motor/blad/ak8-blad-ui.css'), 'utf8')).map(norm)));

const pages = fs.readdirSync(DIR).filter(f => /\.html$/.test(f) && f !== 'index.html' && (!BARA || f === BARA + '.html')).sort();
console.log('delkapitel-grind · ' + pages.length + ' sidor' + (SNABB ? ' (--snabb: drillar hoppas)' : ''));

for(const p of pages){
  const abs = path.join(DIR, p), html = fs.readFileSync(abs, 'utf8');
  console.log('\n■ ' + p);

  // ── 1 FÖRELÄSNING ──
  const panel = html.match(/<section class="tab-panel[^"]*" data-panel="forelasning(?:ar)?"[^>]*>([\s\S]*?)<\/section>/);
  if(panel){
    const inre = panel[1].replace(/<!--[\s\S]*?-->/g, '').trim();
    if(inre.length) fel('föreläsning: panelen har egen text/markup i källan (' + inre.replace(/\s+/g, ' ').slice(0, 60) + '…) — ska vara tom och monteras via registret');
    else ok('föreläsning: panelen tom i källan');
    if(!/js\/data\/forelasningar\.js/.test(html)) fel('föreläsning: forelasningar.js laddas inte');
    if(!/AK8_FOREL\.renderForelFlik\(/.test(html)) fel('föreläsning: AK8_FOREL.renderForelFlik anropas inte');
    else ok('föreläsning: monteras via AK8_FOREL.renderForelFlik');
    if(/youtube\.com|img\.youtube|<iframe[^>]*youtu/i.test(html)) fel('föreläsning: inline YouTube i källan (integritetsregeln: bara registret, laddas vid klick)');
  } else ok('föreläsning: ingen panel (ok — gäller bara sidor med fliken)');

  // ── 2 BLAD: kanon-länk + inga page-only blad-regler ──
  if(!/js\/motor\/blad\/ak8-blad-kanon\.css/.test(html)) fel('blad: ak8-blad-kanon.css länkas inte');
  else ok('blad: kanon-css länkad');
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const inlineBlad = tokenize(styles).map(norm).filter(s => /^\.(ovn|ak8)/.test(s));
  const pageOnly = inlineBlad.filter(s => !kanonSel.has(s));
  if(pageOnly.length) fel('blad: page-only regler inline (finns inte i kanon/shared — lägg i ak8-blad-kanon.css): ' + pageOnly.join(' '));
  else if(inlineBlad.length) varn('blad: ' + inlineBlad.length + ' inline-överskrivning(ar) av kanon (tillåtet, dokumentera): ' + inlineBlad.slice(0, 6).join(' ') + (inlineBlad.length > 6 ? ' …' : ''));
  else ok('blad: inga inline blad-regler');

  // ── 2b BLAD runtime: Öva renderar .ovn-sheet ──
  const rt = cdp(fileUrl(abs), `({ sheet: !!document.querySelector('.ovn-sheet'), h2: !!document.querySelector('.ovn-sheet > h2'), celler: document.querySelectorAll('.ak8-svar[data-idx], .ak8-in').length })`, ['--wait', '1800']);
  if(rt.fel) fel('blad runtime: ' + rt.fel);
  else if(!rt.sheet || !rt.h2) fel('blad runtime: Öva saknar .ovn-sheet/h2 (omslaget) — montera via AK8_UI.renderSheet');
  else ok('blad runtime: .ovn-sheet + h2 renderade (' + rt.celler + ' celler)');

  // ── 3 DRILLAR: hela omgångar utan upprepning ──
  const dm = html.match(/var DRILLS\s*=\s*\[([\s\S]*?)\];/);
  if(!dm){ ok('drillar: ingen Färdighetsträning på sidan'); }
  else if(SNABB){ varn('drillar: hoppade (--snabb)'); }
  else {
    const drills = [...dm[1].matchAll(/\{[^}]*ko:'([^']+)'[^}]*?(?:f|formaga):'([^']+)'[^}]*\}|\{[^}]*ko:'([^']+)'[^}]*\}/g)]
      .map(m => ({ ko: m[1] || m[3], f: m[2] || 'rakna' }));
    const ram = html.match(/var RAM\s*=\s*'([^']+)'/), ramAbs = ram ? path.resolve(DIR, ram[1]) : path.join(ROOT, 'ak7-k1-ram.html');
    for(const d of drills){
      const url = fileUrl(ramAbs) + '?ko=' + encodeURIComponent(d.ko) + '&formaga=' + encodeURIComponent(d.f) + '&embed=1';
      const r = cdp(url, `(async function(){
        const _st = window.setTimeout; window.setTimeout = function(fn, ms){ return _st(fn, ms >= 1000 ? 5 : ms); };   // accelerera "nästa uppgift"-fördröjningen
        const sleep = ms => new Promise(r => _st(r, ms)); const shown = [];
        for(let i = 0; i < 8; i++){
          const fast = document.querySelector('.exercise-card .rakna-svar-fast, .exercise-card .uppgift, .exercise-card .task-display, .exercise-card .rakna-uppgift');
          const card = document.querySelector('.exercise-card'); if(!card) return { fel: 'ingen exercise-card vid steg ' + i };
          shown.push((fast ? fast.innerHTML : card.innerHTML.replace(/<input[^>]*>/g, '')).replace(/\\s+/g, ' ').trim());
          const inputs = card.querySelectorAll('input'); inputs.forEach(x => { x.value = '0'; });
          const chk = card.querySelector('#kv-check, #pot-check, .btn.primary, button[id$="-check"]'); if(!chk) return { fel: 'ingen kontrollknapp vid steg ' + i, shown };
          chk.click(); await sleep(120);
          if(document.getElementById('summary-next-btn')) break;
        }
        return { antal: shown.length, distinkta: new Set(shown).size };
      })()`, ['--wait', '1800', '--timeout', '60000']);
      const tag = d.ko + '/' + d.f;
      if(r.fel && /ingen kontrollknapp|ingen exercise-card/.test(r.fel)) varn('drill ' + tag + ': harness-form ej stödd av grinden (' + r.fel.slice(0, 40) + ') — ej bedömd');
      else if(r.fel){ if(KAND_SKULD_KO.test(d.ko)) skuld('drill ' + tag + ': kunde inte köras (' + r.fel.slice(0, 60) + ')'); else fel('drill ' + tag + ': ' + r.fel.slice(0, 120)); }
      else if(r.antal < 8) varn('drill ' + tag + ': omgång < 8 (' + r.antal + ') — annan harness-form, ej bedömd');
      else if(r.distinkta < r.antal){ if(KAND_SKULD_KO.test(d.ko)) skuld('drill ' + tag + ': upprepning (' + r.distinkta + '/' + r.antal + ' distinkta) — känd skuld, egen order'); else fel('drill ' + tag + ': upprepning i omgången (' + r.distinkta + '/' + r.antal + ' distinkta)'); }
      else ok('drill ' + tag + ': 8/8 distinkta');
    }
  }
}

// ── 4 TEST: täckning per färdigt test — EN CDP-körning PER DELKAPITEL (alla 20 i en session tidsgränsade) ──
console.log('\n■ TEST (ak8-k1-ram.html, färdiga test per delkapitel)');
const pre = path.join(os.tmpdir(), 'grind-pre-' + process.pid + '.js');
fs.writeFileSync(pre, `(function(){ var real; Object.defineProperty(window,'ProvbyggarMotor',{configurable:true,get:function(){return real;},set:function(v){ real=v; var m=v.montera; v.montera=function(cfg){ var pb=m.apply(this,arguments); window.__PB=pb; window.__GENNOD=cfg.genNod; return pb; }; }}); })();`);
for(const sida of pages){
const t = cdp(fileUrl(path.join(ROOT, 'ak8-k1-ram.html')), `(function(){
  var bok = (window.AK8_K1_BOK||{}).delkapitel||[], ut = [];
  bok.forEach(function(dk){ if(dk.fil !== '${sida}') return;
    (AK8_FARDIGA.tester(dk.nr)||[]).forEach(function(tt, i){
      __PB.byggFardigt({ nodes: tt.nodes, antal: tt.antal, seed: 1000 + dk.nr*10 + i });
      var qs = __PB.state.test.questions, gens = qs.map(function(q){ return q.generator; });
      var noder = new Set(qs.map(function(q){ return __GENNOD[q.generator]; }));
      var saknade = tt.nodes.filter(function(n){ return !noder.has(n); });
      var dubbla = gens.filter(function(g, k){ return gens.indexOf(g) !== k; });
      // dk11: tal ∈ öva-bandet
      var utanfor = [];
      if(window.BLAD_AK8_KVROT && tt.nodes.some(function(n){ return /^(kvadrat|rot)-/.test(n); })){
        var band = {}; tt.nodes.forEach(function(n){ band[n] = new Set(); for(var k=0;k<150;k++) BLAD_AK8_KVROT.talBank(n).forEach(function(r){ band[n].add(String(r.tal)); }); });
        qs.forEach(function(q){ var n = __GENNOD[q.generator]; if(!band[n]) return; q.subs.forEach(function(s){
          var p = String(s.prompt||'').replace(/\\^2/g,''); var m = p.match(/√\\s*([\\d,]+)/) || p.match(/sidan ([\\d,]+)/) || p.match(/arean ([\\d,]+)/) || p.match(/Beräkna ([\\d,]+)/) || p.match(/Beräkna:\\s*([\\d,]+)/);
          if(m && !band[n].has(String(parseFloat(m[1].replace(',','.'))))) utanfor.push(q.generator + ':' + m[1]); }); });
      }
      // dk6 (multiplikation, 2026-09-21 FAS 3): talföljd per delfråga ∈ BLAD_AK8_D7.talBank
      if(window.BLAD_AK8_D7 && tt.nodes.some(function(n){ return /^brak-mult-/.test(n); })){
        var till6 = {}; function add6(n, arr){ (till6[n] = till6[n] || new Set()).add(arr.join(',')); }
        BLAD_AK8_D7.talBank('brak-mult-rakna').forEach(function(r){
          if(r.slag === 'hb') add6('brak-mult-rakna:rakna', r.ordning === 'bh' ? [r.t, r.n, r.h] : [r.h, r.t, r.n]);
          else if(r.slag === 'bb') add6('brak-mult-rakna:rakna', r.a.concat(r.b));
          else if(r.slag === 'blandad') add6('brak-mult-rakna:rakna', [r.h].concat(r.M));
          else add6('brak-mult-rakna:rakna', r.A.concat(r.B)); });
        BLAD_AK8_D7.talBank('brak-mult-forkorta').forEach(function(r){
          if(r.slag === 'produkt') add6('brak-mult-forkorta:rakna', r.t.concat(r.n));
          else if(r.slag === 'tre') add6('brak-mult-forkorta:rakna', [].concat(r.f[0], r.f[1], r.f[2]));
          else add6('brak-mult-forkorta:rakna', r.a.concat(r.b)); });
        qs.forEach(function(q){ var n = __GENNOD[q.generator]; if(!till6[n]) return; q.subs.forEach(function(s){
          var nums = (String(s.prompt || '').match(/\\d+/g) || []).map(Number);
          if(!till6[n].has(nums.join(','))) utanfor.push(q.generator + ':' + nums.join('/')); }); });
      }
      // dk7 (division, 2026-09-21): varje delfrågas talföljd (siffrorna i prompten, i ordning) måste finnas i BLAD_AK8_D8.talBank
      if(window.BLAD_AK8_D8 && tt.nodes.some(function(n){ return /^brak-div-/.test(n); })){
        function seq(a){ return a.join(','); }
        var till = {};
        function add(n, arr){ (till[n] = till[n] || new Set()).add(seq(arr)); }
        BLAD_AK8_D8.talBank('brak-div-hb').forEach(function(r){ add('brak-div-hb:rakna', [r.h, r.t, r.n]); });
        BLAD_AK8_D8.talBank('brak-div-bh').forEach(function(r){ add('brak-div-bh:rakna', [r.t, r.n, r.h]); });
        BLAD_AK8_D8.talBank('brak-div-bb').forEach(function(r){ add('brak-div-bb:rakna', r.slag === 'blandad' ? r.A.concat(r.B) : r.a.concat(r.b)); });
        BLAD_AK8_D8.talBank('brak-div-bb:prio').forEach(function(x){ add('brak-div-bb:rakna', x.typ === 'mult-sub' ? [].concat(x.A, x.B, x.C, x.D) : [].concat(x.A, x.B, x.C)); });
        BLAD_AK8_D8.talBank('brak-div-reciprok').forEach(function(r){ add('brak-div-reciprok:rakna', [r.t, r.n]); add('brak-div-inv:rakna', [r.t, r.n]); });
        qs.forEach(function(q){ var n = __GENNOD[q.generator]; if(!till[n]) return; q.subs.forEach(function(s){
          var nums = (String(s.prompt || '').match(/\\d+/g) || []).map(Number);   // prompt-prefixen ("Räkna ut steg för steg:", "… till") saknar siffror
          if(!till[n].has(seq(nums))) utanfor.push(q.generator + ':' + nums.join('/')); }); });
      }
      ut.push({ dk: dk.nr, titel: tt.titel, fragor: qs.length, delfragor: qs.reduce(function(s,q){ return s+q.subs.length; },0), saknade: saknade, dubbla: dubbla, utanfor: utanfor });
    });
  });
  return ut;
})()`, ['--pre', pre, '--wait', '2500', '--timeout', '120000']);
if(!t || t.fel) fel('test (' + sida + '): ' + (t ? t.fel : 'inget svar'));
else if(!Array.isArray(t)) fel('test (' + sida + '): oväntat svar från ramen: ' + JSON.stringify(t).slice(0, 300));
else if(!t.length) ok('test (' + sida + '): inget färdigt test för sidan');
else t.forEach(function(x){
  const tag = 'dk' + x.dk + ' "' + x.titel + '" (' + x.fragor + ' frågor, ' + x.delfragor + ' delfrågor)';
  if(x.saknade.length) fel('test ' + tag + ': noder EJ täckta: ' + x.saknade.join(' '));
  else if(x.dubbla.length) fel('test ' + tag + ': generator dubblerad: ' + [...new Set(x.dubbla)].join(' '));
  else if(x.utanfor.length) fel('test ' + tag + ': tal utanför öva-bandet: ' + x.utanfor.join(' '));
  else ok('test ' + tag + ': alla noder, en fråga per generator' + ((x.dk === 11 || x.dk === 7 || x.dk === 6) ? ', alla tal ∈ öva' : ''));
});
}
try { fs.unlinkSync(pre); } catch(e){}

console.log('\n' + (FEL ? '✗ GRIND RÖD — ' + FEL + ' fel' : '✓ GRIND GRÖN') + ' · ' + VARN + ' varningar · ' + SKULD + ' kända skulder');
process.exit(FEL ? 1 : 0);
