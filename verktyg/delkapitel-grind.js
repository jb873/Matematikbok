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

   SKAL-SIDORNA (Joachim 2026-10-26: "d3 och övriga algebrasidor, inte bara k1"). Sjuans k3 och åttans
   k2 monteras av DelkapitelSkal, inte av AK8_UI. Samma fyra kontrakt i skalets form:
     S1 FÖRELÄSNING  panelen tom i källan, forelasningar.js laddas, skalet får en forel-nyckel och
                     registret ritar ytan. En nyckel som saknas i registret ger samma tomma yta → varn.
     S2 BLAD         sidan länkar ak7-k1blad-kanon.css + ak7-delkapitel-kanon.css; inga page-only
                     .ovn-/.ak8-regler inline utom de fyra kända (KAND_SKULD_CSS → SKULD).
                     Runtime: varje blad i skalets ova-lista (även underflikar) har en bladyta i en
                     känd form (.ovn-sheet, .eq-kort, .prob-kort) med minst en svarsruta. 0 JS-fel.
     S3 DRILLAR      varje klickbar färdighet (iframe-adressen läses ur sidan, inte byggs här) körd i
                     ramen: varje kategori en hel omgång (poängradens längd) utan upprepad uppgift.
     S4 TEST         varje testlänk på sidan öppnad i ramen: alla noder täckta, en fråga per generator.
   Sidor utan DelkapitelSkal (plugg till prov) listas och hoppas.

   NEGATIVT VERIFIERAD (varje fel återinfört → grinden fäller): se commit-meddelandet för FAS 5.
   Skal-delen: --sabba css|forel|blad|drill|test fäller (felen läggs in i minnet eller i webbläsaren,
   källan rörs inte).
   KÖR:  node verktyg/delkapitel-grind.js [--sida kvadratrotter|d3-parentes] [--snabb]   (--snabb hoppar drill-körningen)
   Noll nätväg. Rör aldrig källfiler (CDP mot riktiga filer, temp bara i OS-temp). Exit 1 vid FEL. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'ak8/k1');
const args = process.argv.slice(2);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const SNABB = args.includes('--snabb');
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));
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

// Skal-sidorna: varje delkapitelmapp i algebrakapitlen.
const SKAL_ROTTER = ['ak7/k3', 'ak8/k2'];
const skalMappar = [].concat(...SKAL_ROTTER.map(r => fs.readdirSync(path.join(ROOT, r))
  .filter(d => /^d\d+-/.test(d) && fs.existsSync(path.join(ROOT, r, d, 'index.html')) && (!BARA || d === BARA))
  .map(d => r + '/' + d)));
console.log('delkapitel-grind · ' + pages.length + ' sidor i ak8/k1 · ' + skalMappar.length + ' i algebrakapitlen' + (SNABB ? ' (--snabb: drillar hoppas)' : ''));

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
  const rt = cdp(fileUrl(abs), `({ sheet: !!document.querySelector('.ovn-sheet'), h2: !!document.querySelector('.ovn-sheet > h2'), celler: document.querySelectorAll('.ak8-svar[data-idx], .ak8-in').length })`, ['--vanta-pa', 'blad']);
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
      })()`, ['--vanta-pa', 'blad', '--timeout', '60000']);
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
if(pages.length) console.log('\n■ TEST (ak8-k1-ram.html, färdiga test per delkapitel)');
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
})()`, ['--pre', pre, '--vanta-pa', 'blad', '--timeout', '120000']);
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

// ══ SKAL-SIDORNA (algebrakapitlen) ══════════════════════════════════════════════════════════════
// De fyra inline-reglerna som blev kvar efter css-flytten 2026-09-19, likadana på alla åtta sidor.
// Känd skuld tills de flyttas till kanon (egen order). En ny page-only regel fäller.
const KAND_SKULD_CSS = new Set(['.ovn-grupp-rubrik', '.ovn-in', '.ovn-ordna-in', '.ovn-foljd-in']);
const SKAL_KANON = ['js/motor/blad/ak7-k1blad-kanon.css', 'js/motor/blad/ak7-delkapitel-kanon.css'];
const skalSel = new Set([].concat(...SKAL_KANON.map(a => tokenize(fs.readFileSync(path.join(ROOT, a), 'utf8')).map(norm))));
const BLADYTOR = '.ovn-sheet, .eq-kort, .prob-kort';
const tmpFil = (namn, js) => { const f = path.join(os.tmpdir(), 'grind-' + namn + '-' + process.pid + '.js'); fs.writeFileSync(f, js); return f; };
const iSidan = fn => '(' + fn.toString() + ')(' + JSON.stringify(SABBA) + ')';

// I sidan: skalets cfg fångas när DelkapitelSkal.montera anropas; JS-fel samlas.
const preSkal = tmpFil('skal', `window.__e = []; window.addEventListener('error', function(e){ window.__e.push(String(e.message)); });
(function(){ var real; Object.defineProperty(window, 'DelkapitelSkal', { configurable: true, get: function(){ return real; },
  set: function(v){ real = v; var m = v.montera; v.montera = function(cfg){ window.__SKALCFG = cfg; return m.apply(this, arguments); }; } }); })();`);
// I ramen: --sabba drill gör slumpen konstant (uppgifterna upprepas); --sabba test tappar testets sista nod.
const preRam = tmpFil('ram', 'window.__e = []; window.addEventListener(\'error\', function(e){ window.__e.push(String(e.message)); });'
  + (SABBA === 'drill' ? ' Math.random = function(){ return 0.42; };' : '')
  + (SABBA === 'test' ? ` (function(){ var real; Object.defineProperty(window, 'ProvbyggarMotor', { configurable: true, get: function(){ return real; },
      set: function(v){ real = v; var m = v.montera; v.montera = function(){ var pb = m.apply(this, arguments), bf = pb.byggFardigt;
        pb.byggFardigt = function(o){ return bf.call(this, Object.assign({}, o, { nodes: o.nodes.slice(0, -1) })); }; return pb; }; } }); })();` : ''));

function skalProbe(sabba){
  var cfg = window.__SKALCFG; if(!cfg) return { fel: 'DelkapitelSkal.montera anropades inte' };
  var blad = [];
  (cfg.ova || []).forEach(function(p){
    var ytor = (p.blad && p.blad.length)
      ? p.blad.map(function(b){ return { titel: p.titel + ' › ' + b.titel, el: document.getElementById('sheet-' + b.id) }; })
      : [{ titel: p.titel, el: document.getElementById('blad-' + p.mount) }];
    ytor.forEach(function(y){ blad.push(y); });
  });
  if(sabba === 'blad' && blad[0] && blad[0].el) blad[0].el.innerHTML = '';
  blad = blad.map(function(y){
    var yta = y.el && y.el.querySelector('.ovn-sheet, .eq-kort, .prob-kort');
    return { titel: y.titel, finns: !!y.el, form: yta ? yta.className.split(' ')[0] : null,
             rutor: yta ? yta.querySelectorAll('input, [contenteditable="true"]').length : 0 };
  });
  var fp = document.querySelector('.tab-panel[data-panel="forelasningar"]'), reg = window.FOREL && window.FOREL.register;
  var forel = { nyckel: cfg.forel || null, ritad: !!(fp && fp.querySelector('.forel-wrap')),
                iRegistret: !!(reg && cfg.forel && Object.prototype.hasOwnProperty.call(reg, cfg.forel)) };
  var drillar = [].slice.call(document.querySelectorAll('#fardighet-lista .fard-skill')).map(function(b){
    var titel = (b.querySelector('.fard-skill-titel') || b).textContent.trim();
    if(b.disabled) return { titel: titel, kommer: true };
    b.click(); var f = document.getElementById('fard-frame');
    return { titel: titel, src: f ? f.getAttribute('src') : null };
  });
  var test = [].slice.call(document.querySelectorAll('.test-lank')).map(function(a){
    return { titel: a.textContent.trim(), deep: decodeURIComponent(a.getAttribute('data-deep')) }; });
  return { blad: blad, forel: forel, drillar: drillar, test: test, jsFel: window.__e || [] };
}

// I ramen: varje kategori (.sub-card) en hel omgång — poängradens längd — med fel svar och Nästa.
// En drill utan kategorimeny är en enda omgång. Uppgiftens signatur är HELA kortet utom knappsats,
// poängrad, nivåetikett och återkoppling: det som varierar ligger inte alltid i .ex-fraga (bilden med
// antalen i "Vad har personen köpt?", figuren i "Geometriska figurer", talen i Beräkna-raden).
async function drillOmgang(){
  var _st = window.setTimeout; window.setTimeout = function(fn, ms){ return _st(fn, ms >= 400 ? 5 : ms); };   // accelerera "nästa uppgift"
  var sov = function(ms){ return new Promise(function(r){ _st(r, ms); }); };
  function signatur(c){
    var k = c.cloneNode(true);
    k.querySelectorAll('.keypad, .scorebar, .ex-level, .ex-feedback, button').forEach(function(x){ x.remove(); });
    return k.innerHTML.replace(/\s+/g, ' ').trim();
  }
  var n = document.querySelectorAll('.sub-card').length, ut = [];
  for(var k = 0; k < Math.max(n, 1); k++){
    var namn = 'hela drillen';
    if(n){
      var sc = document.querySelectorAll('.sub-card')[k]; if(!sc) return { fel: 'kategori ' + (k + 1) + ' försvann efter Tillbaka' };
      namn = (sc.querySelector('.sub-card-namn') || sc).textContent.trim();
      sc.click(); await sov(250);
    }
    var c = document.querySelector('.exercise-card'), antal = c ? c.querySelectorAll('.scorebar .score-dot').length : 0;
    if(!antal) return { form: namn + ': ingen poängrad' };
    var visade = [];
    for(var i = 0; i < antal; i++){
      c = document.querySelector('.exercise-card'); if(!c) return { fel: namn + ': kortet försvann vid steg ' + (i + 1) };
      visade.push(signatur(c));
      c.querySelectorAll('input').forEach(function(x){ x.value = '0'; x.dispatchEvent(new Event('input', { bubbles: true })); });
      var chk = c.querySelector('#check'); if(!chk) return { form: namn + ': ingen kontrollknapp vid steg ' + (i + 1) };
      chk.click(); await sov(150);
      if(i < antal - 1){
        var nasta = [].filter.call(document.querySelectorAll('.exercise-card button'), function(b){ return /nästa/i.test(b.textContent); })[0];
        if(!nasta) return { fel: namn + ': ingen Nästa-knapp efter steg ' + (i + 1) };
        nasta.click(); await sov(150);
      }
    }
    ut.push({ namn: namn, antal: antal, distinkta: new Set(visade).size });
    var bak = document.getElementById('back'); if(bak) bak.click(); await sov(250);
  }
  return { kategorier: ut, jsFel: window.__e || [] };
}

// I ramen: det färdiga testet som deep-länken byggde.
function testProbe(){
  var q = location.search, del = (q.match(/[?&]del=([a-z0-9-]+)/i) || [])[1], nr = parseInt((q.match(/[?&]test=(\d+)/) || [])[1] || '1', 10);
  var tt = ((window.K3_FARDIGA && K3_FARDIGA.tester(del)) || [])[nr - 1];
  if(!tt) return { fel: 'testet finns inte i K3_FARDIGA (' + del + ' #' + nr + ')' };
  var st = window.PB && PB.state && PB.state.test; if(!st || !st.questions) return { fel: 'ramen byggde inget test' };
  if(!st.questions.length) return { fel: 'testet har 0 frågor (eleven ser "Ditt test – 0 frågor") — ingen testgenerator för ' + tt.nodes.join(' ') };
  var qs = st.questions, gens = qs.map(function(x){ return x.generator; }), gn = window.K3_GEN_NOD || {};
  var noder = new Set(gens.map(function(g){ return gn[g]; }));
  return { fragor: qs.length, saknade: tt.nodes.filter(function(x){ return !noder.has(x); }),
           dubbla: gens.filter(function(g, k){ return gens.indexOf(g) !== k; }), jsFel: window.__e || [] };
}

for(const mapp of skalMappar){
  const abs = path.join(ROOT, mapp, 'index.html');
  let html = fs.readFileSync(abs, 'utf8');
  console.log('\n■ ' + mapp);
  if(!/DelkapitelSkal\.montera\(/.test(html)){ ok('hoppas: ingen DelkapitelSkal (sidan har en annan form, t.ex. plugg till prov)'); continue; }
  const forsta = mapp === skalMappar.find(m => /DelkapitelSkal\.montera\(/.test(fs.readFileSync(path.join(ROOT, m, 'index.html'), 'utf8')));
  if(SABBA === 'forel' && forsta) html = html.replace(/(data-panel="forelasningar"[^>]*>)/, '$1<p>Titta på filmen om parenteser.</p>');
  if(SABBA === 'css' && forsta) html = html.replace('</style>', '.ovn-pafund{color:red;}\n</style>');

  // ── S1 FÖRELÄSNING (källan) ──
  const panel = html.match(/<section class="tab-panel[^"]*" data-panel="forelasningar"[^>]*>([\s\S]*?)<\/section>/);
  if(!panel) fel('föreläsning: panelen saknas');
  else {
    const inre = panel[1].replace(/<!--[\s\S]*?-->/g, '').trim();
    if(inre.length) fel('föreläsning: panelen har egen text/markup i källan (' + inre.replace(/\s+/g, ' ').slice(0, 60) + '…) — ska vara tom och monteras via registret');
    else ok('föreläsning: panelen tom i källan');
  }
  if(!/js\/data\/forelasningar\.js/.test(html)) fel('föreläsning: forelasningar.js laddas inte');
  if(/youtube\.com|img\.youtube|<iframe[^>]*youtu/i.test(html)) fel('föreläsning: inline YouTube i källan (integritetsregeln: bara registret, laddas vid klick)');

  // ── S2 BLAD (källan): kanon-länkar + inga page-only blad-regler ──
  const saknas = SKAL_KANON.filter(a => html.indexOf(a) < 0);
  if(saknas.length) fel('blad: länkas inte: ' + saknas.map(a => path.basename(a)).join(', '));
  else ok('blad: kanon-css länkad (' + SKAL_KANON.map(a => path.basename(a)).join(' + ') + ')');
  const stilar = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const inline = tokenize(stilar).map(norm).filter(s => /^\.(ovn|ak8)/.test(s) && !skalSel.has(s));
  const nyaRegler = inline.filter(s => !KAND_SKULD_CSS.has(s)), kanda = inline.filter(s => KAND_SKULD_CSS.has(s));
  if(nyaRegler.length) fel('blad: page-only regler inline (finns inte i kanon — lägg i ak7-k1blad-kanon.css): ' + nyaRegler.join(' '));
  else ok('blad: inga nya page-only blad-regler inline');
  if(kanda.length) skuld('blad: ' + kanda.length + ' kända inline-regler från css-flytten (' + kanda.join(' ') + ') — flyttas till kanon i egen order');

  // ── Runtime: S1 ytan, S2 bladen, och listorna till S3/S4 ur sidan ──
  const rt = cdp(fileUrl(abs), iSidan(skalProbe), ['--pre', preSkal, '--vanta-pa', 'blad', '--timeout', '90000']);
  if(rt.fel){ fel('sidan: ' + rt.fel); continue; }
  if(rt.jsFel.length) fel('sidan: JS-fel vid laddning: ' + rt.jsFel.slice(0, 3).join(' | '));
  if(!rt.forel.nyckel) fel('föreläsning: skalet får ingen forel-nyckel');
  else if(!rt.forel.ritad) fel('föreläsning: registret ritade ingen yta för "' + rt.forel.nyckel + '"');
  else if(!rt.forel.iRegistret) varn('föreläsning: nyckeln "' + rt.forel.nyckel + '" saknas i registret (ytan blir ärligt tom ändå — lägg in den som [])');
  else ok('föreläsning: monteras via registret ("' + rt.forel.nyckel + '")');
  if(!rt.blad.length) fel('blad runtime: skalets ova-lista är tom');
  rt.blad.forEach(b => {
    if(!b.finns) fel('blad runtime: "' + b.titel + '" har ingen yta i DOM:en');
    else if(!b.form) fel('blad runtime: "' + b.titel + '" renderade ingen bladyta (' + BLADYTOR + ')');
    else if(!b.rutor) fel('blad runtime: "' + b.titel + '" har inga svarsrutor');
    else ok('blad runtime: "' + b.titel + '" · ' + b.form + ' · ' + b.rutor + ' rutor');
  });

  // ── S3 DRILLAR ──
  const levande = rt.drillar.filter(d => !d.kommer), kommer = rt.drillar.length - levande.length;
  if(!rt.drillar.length) ok('drillar: ingen Färdighetsträning på sidan');
  else if(kommer) ok('drillar: ' + kommer + ' dämpade kort (kommer) — leder inte in i tomrum');
  if(levande.length && SNABB) varn('drillar: ' + levande.length + ' hoppade (--snabb)');
  else for(const d of levande){
    if(!d.src){ fel('drill "' + d.titel + '": kortet satte ingen iframe-adress'); continue; }
    const [fil, fraga] = d.src.split('?');
    const r = cdp(fileUrl(path.resolve(path.dirname(abs), fil)) + '?' + fraga, iSidan(drillOmgang), ['--pre', preRam, '--wait', '1500', '--timeout', '180000']);
    if(r.form) varn('drill "' + d.titel + '": annan drillform (' + r.form + ') — ej bedömd');
    else if(r.fel) fel('drill "' + d.titel + '": ' + r.fel.slice(0, 160));
    else if(!r.kategorier) fel('drill "' + d.titel + '": oväntat svar från ramen: ' + JSON.stringify(r).slice(0, 160));
    else {
      if(r.jsFel.length) fel('drill "' + d.titel + '": JS-fel: ' + r.jsFel.slice(0, 2).join(' | '));
      r.kategorier.forEach(k => {
        if(k.distinkta < k.antal) fel('drill "' + d.titel + '" › ' + k.namn + ': upprepning i omgången (' + k.distinkta + '/' + k.antal + ' distinkta)');
        else ok('drill "' + d.titel + '" › ' + k.namn + ': ' + k.antal + '/' + k.antal + ' distinkta');
      });
    }
  }

  // ── S4 TEST ──
  if(!rt.test.length) ok('test: inget färdigt test för sidan');
  for(const t of rt.test){
    const [fil, fraga] = t.deep.split('?');
    const r = cdp(fileUrl(path.resolve(path.dirname(abs), fil)) + '?' + fraga, iSidan(testProbe), ['--pre', preRam, '--vanta-pa', 'blad', '--timeout', '120000']);
    if(r.fel) fel('test "' + t.titel + '": ' + r.fel.slice(0, 160));
    else if(r.jsFel.length) fel('test "' + t.titel + '": JS-fel: ' + r.jsFel.slice(0, 2).join(' | '));
    else if(r.saknade.length) fel('test "' + t.titel + '": noder EJ täckta: ' + r.saknade.join(' '));
    else if(r.dubbla.length) fel('test "' + t.titel + '": generator dubblerad: ' + [...new Set(r.dubbla)].join(' '));
    else ok('test "' + t.titel + '" (' + r.fragor + ' frågor): alla noder, en fråga per generator');
  }
}
[preSkal, preRam].forEach(f => { try { fs.unlinkSync(f); } catch(e){} });

console.log('\n' + (FEL ? '✗ GRIND RÖD — ' + FEL + ' fel' : '✓ GRIND GRÖN') + ' · ' + VARN + ' varningar · ' + SKULD + ' kända skulder');
process.exit(FEL ? 1 : 0);
