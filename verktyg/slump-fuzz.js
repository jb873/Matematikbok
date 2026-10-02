/* slump-fuzz.js — V10: generatorernas slump ska vara ÄKTA OBEROENDE, inte bara dubblettfri.
 *
 *   KÖR:  node verktyg/slump-fuzz.js [--ram ak8-k1-ram.html] [--n 600] [--omgangar 3] [--visa]
 *         Exit 1 vid rött. Noll nätväg, ingen fil ändras.
 *
 * SKÄLET. `distinktOmgang` fäller två identiska uppgifter i samma omgång, och det har fått gälla
 * som bevis på att slumpen duger. Det är det inte. En följd kan vara dubblettfri och ändå
 * förutsägbar: tal som kryper uppåt genom omgången, så att svårigheten stiger av en slump ingen
 * valt; ett mönster som upprepas var tredje uppgift; samma operand i nio fall av tio med en
 * avvikare emellan. Eleven möter det som "udda tur", läraren som ett blad som inte känns jämnt.
 * Inget av det syns i en dubblettkontroll.
 *
 * TRE PROV, alla på själva följden och inte på enskilda tal:
 *
 *   RUNS       Wald–Wolfowitz. Talen delas i över/under medianen och antalet SVÄNGAR räknas.
 *              För få svängar = följden vandrar (trend, drift). För många = den växlar
 *              mekaniskt. z = (R − E[R]) / sd[R].
 *   AUTOKORR   r på lag 1, 2 och 3. Är nästa tal förutsägbart ur det förra är r skilt från noll.
 *              z = r · √n.
 *   UPPREP     hur ofta x[i] == x[i−1], mot vad fördelningen själv ger (Σp²). Bara ÖVERSKOTT
 *              fälls: en generator med distinktOmgang har noll upprepningar med flit, och det
 *              är inte ett fel.
 *
 * TRÖSKELN. |z| > 4 (p ≈ 6·10⁻⁵ per prov), OCH samma generator måste falla i minst TVÅ av
 * tre oberoende omgångar. Ett statistiskt prov som fäller på en enda körning blir en grind som
 * blinkar rött av slump — och en grind man slutar tro på är värre än ingen. Två av tre ger
 * ett falskt rött i storleksordningen 10⁻⁸ per generator, och de fyra ramarna har 185.
 *
 * SIGNALEN. Varje generator lämnar `{subs:[{prompt, answer}]}`. Två följder mäts: FÖRSTA TALET
 * i den första deluppgiftens prompt (uppgiftens ingångstal — det eleven ser först) och SVARET
 * när det är numeriskt. Ett tal som genereras men aldrig syns i prompten mäts inte; det är
 * grindens kända gräns, skriven här i stället för att låtsas att den inte finns.
 *
 * Generatorerna fångas i ramen på samma väg som testgen-fuzz: en setter-fälla på
 * window.ProvbyggarMotor som läser cfg.generators ur montera(). Ingen generator anropas i node,
 * alltså ingen risk att mäta en kopia av koden i stället för koden (V1).
 *
 * NEGATIVT VERIFIERAD 2026-10-01 med tre injicerade fel, ett i taget (--sabba), uppmätt:
 *   drift   — tal som kryper uppåt genom omgången   → RUNS z = −16,3 (10 svängar, 150 väntade)
 *   lag1    — vart annat tal härlett ur det förra   → AUTOKORR lag1 z = 8,8 (r = 0,51)
 *   klump   — samma tal i 30 % av dragningarna      → UPPREP z = 5,0 (0,318 mot väntat 0,201)
 * Varje fel fäller sitt eget ben FÖRST, men inte bara det: en drift ÄR en lag-korrelation och
 * fäller därför också autokorrelationen. Att påstå ren separation mellan benen hade varit
 * osant — de tre proven mäter tre sidor av samma beroende, inte tre oberoende fel.
 *
 * FÖRSTA FÖRSÖKET VAR GRÖNT OCH BETYDDE INGENTING. Vakten löd `if(vs.length < 2) return`, så
 * varje ben hoppade ur innan provet när grinden kördes med EN omgång — alla tre injicerade fel
 * passerade obemärkt. Kravet räknas nu på antalet omgångar som faktiskt gav ett z-värde. En
 * grön grind som inte mäter är det farligaste utfall en grind kan ge; den här var det en stund.
 */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const N = parseInt(opt('--n', '600'), 10);
const OMG = parseInt(opt('--omgangar', '3'), 10);
const VISA = args.includes('--visa');
const SABBA = opt('--sabba', '');            // drift | lag1 | klump — bara för negativ verifiering
const GRANS = parseFloat(opt('--z', '4'));
const RAMAR = opt('--ram', null) ? [opt('--ram')] : ['ak7-k1-ram.html', 'ak7-k2-ram.html', 'ak7-k3-ram.html', 'ak8-k1-ram.html'];
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

/* Setter-fällan: samma mönster som testgen-fuzz. Math.random lämnas ORÖRD — det är just den
   riktiga slumpen som ska prövas, inte en seedad ersättare. */
const PRE = `(function(){
  window.__onerr = [];
  window.addEventListener('error', function(e){ window.__onerr.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  var Mv;
  Object.defineProperty(window, 'ProvbyggarMotor', { configurable: true,
    get: function(){ return Mv; },
    set: function(M){ Mv = M;
      if(M && M.montera && !M.__fangad){ M.__fangad = true; var m0 = M.montera;
        M.montera = function(cfg){ window.__GENS = cfg.generators; return m0.apply(this, arguments); }; } } });
})();`;

const PROBE = `(function(){
  var G = window.__GENS; if(!G) return { fel: 'inga generatorer fångade' };
  var N = ${N}, SABBA = ${JSON.stringify(SABBA)};

  function forstaTal(s){ var m = String(s == null ? '' : s).match(/-?\\d+(?:[.,]\\d+)?/); return m ? parseFloat(m[0].replace(',', '.')) : null; }

  // ── proven ──────────────────────────────────────────────────────────────────────────────
  function runs(x){
    var sorterad = x.slice().sort(function(a, b){ return a - b; });
    var med = sorterad[Math.floor(sorterad.length / 2)];
    var t = []; for(var i = 0; i < x.length; i++){ if(x[i] > med) t.push(1); else if(x[i] < med) t.push(0); }
    var n1 = 0; t.forEach(function(v){ if(v) n1++; }); var n2 = t.length - n1;
    if(n1 < 10 || n2 < 10) return { z: null, varfor: 'för få tal på var sida om medianen (' + n1 + '/' + n2 + ')' };
    var R = 1; for(var j = 1; j < t.length; j++) if(t[j] !== t[j - 1]) R++;
    var n = n1 + n2, E = 2 * n1 * n2 / n + 1;
    var V = 2 * n1 * n2 * (2 * n1 * n2 - n) / (n * n * (n - 1));
    return { z: V > 0 ? (R - E) / Math.sqrt(V) : null, R: R, E: +E.toFixed(1) };
  }
  function autokorr(x, lag){
    var n = x.length, m = 0; x.forEach(function(v){ m += v; }); m /= n;
    var num = 0, den = 0;
    for(var i = 0; i < n; i++){ var d = x[i] - m; den += d * d; if(i + lag < n) num += d * (x[i + lag] - m); }
    if(den === 0) return { r: null, varfor: 'alla tal lika' };
    var r = num / den;
    return { r: r, z: r * Math.sqrt(n) };
  }
  function upprep(x){
    var n = x.length, rakn = {}, lika = 0;
    for(var i = 0; i < n; i++){ rakn[x[i]] = (rakn[x[i]] || 0) + 1; if(i && x[i] === x[i - 1]) lika++; }
    var vantat = 0; Object.keys(rakn).forEach(function(k){ var p = rakn[k] / n; vantat += p * p; });
    var obs = lika / (n - 1);
    var sd = Math.sqrt(Math.max(vantat * (1 - vantat), 1e-12) / (n - 1));
    return { obs: +obs.toFixed(4), vantat: +vantat.toFixed(4), z: (obs - vantat) / sd, distinkt: Object.keys(rakn).length };
  }

  var ut = [];
  Object.keys(G).forEach(function(ko){
    ['snabb', 'problem'].forEach(function(kind){
      (G[ko][kind] || []).forEach(function(gen, gi){
        var namn = ko + '/' + kind + '#' + gi;
        var tal = [], svar = [], kast = null, i, k = 0;
        for(i = 0; i < N; i++){
          var r;
          try { r = gen(new Set()); } catch(e){ kast = e.message; break; }
          if(!r || !r.subs || !r.subs.length) continue;
          var s0 = r.subs[0];
          var t = forstaTal(s0.prompt);
          if(t !== null && isFinite(t)) tal.push(t);
          if(typeof s0.answer === 'number' && isFinite(s0.answer)) svar.push(s0.answer);
        }
        // Injicerade fel för negativ verifiering — rör bara mätserien, aldrig materialet.
        if(SABBA === 'drift') tal = tal.map(function(v, j){ return v + j * 0.5; });
        if(SABBA === 'lag1') for(k = 1; k < tal.length; k += 2) tal[k] = tal[k - 1];
        if(SABBA === 'klump') for(k = 0; k < tal.length; k++) if(k % 10 < 3) tal[k] = 7;

        var post = { namn: namn, n: tal.length, kast: kast };
        if(tal.length >= 100){
          post.runs = runs(tal);
          post.l1 = autokorr(tal, 1); post.l2 = autokorr(tal, 2); post.l3 = autokorr(tal, 3);
          post.upp = upprep(tal);
        }
        if(svar.length >= 100){ post.svarRuns = runs(svar); post.svarL1 = autokorr(svar, 1); }
        ut.push(post);
      });
    });
  });
  return { generatorer: ut.length, resultat: ut, onerr: window.__onerr };
})()`;

// ── körning ───────────────────────────────────────────────────────────────────────────────
let fel = 0, matta = 0, hoppade = 0;
const korta = [];   // generatorer vars prompt inte ger nog med tal — skrivs ut, inte tigs bort
const brottPerGen = {};   // namn -> { ben: antal omgångar det föll i }
console.log('SLUMP-FUZZ — V10: äkta oberoende slump · ' + N + ' dragningar × ' + OMG +
  ' omgångar · fäller vid |z| > ' + GRANS + ' i minst ' + Math.min(2, OMG) + ' av ' + OMG + ' omgångar' + (SABBA ? '  [SABBA: ' + SABBA + ']' : '') + '\n');

const tmp = path.join(os.tmpdir(), 'slumpfuzz-' + process.pid + '.js');
const pre = path.join(os.tmpdir(), 'slumpfuzz-pre-' + process.pid + '.js');
fs.writeFileSync(tmp, PROBE); fs.writeFileSync(pre, PRE);

RAMAR.forEach(ram => {
  const perOmgang = [];
  for(let o = 0; o < OMG; o++){
    const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, ram)), tmp,
      '--pre', pre, '--vanta-pa', 'generatorer', '--timeout', '120000'], { encoding: 'utf8', timeout: 180000 });
    let u = null;
    try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
    if(!u || u.fel){
      fel++;
      console.log('✗ ' + ram + ' omgång ' + (o + 1) + ': ' + ((u && u.fel) || (r.stderr || '').trim().split('\n').pop() || 'sidan svarade inte'));
      return;
    }
    if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + ram + ': JS-fel i sidan — ' + u.onerr.slice(0, 2).join(' · ')); }
    perOmgang.push(u.resultat);
  }
  if(perOmgang.length < OMG) return;

  // Ett brott räknas per (generator, ben) och måste upprepas i minst två omgångar.
  const namn = perOmgang[0].map(p => p.namn);
  const BEN = [
    ['RUNS', p => p.runs && p.runs.z, p => p.runs && ('R=' + p.runs.R + ' väntat ' + p.runs.E)],
    ['AUTOKORR lag1', p => p.l1 && p.l1.z, p => p.l1 && ('r=' + p.l1.r.toFixed(3))],
    ['AUTOKORR lag2', p => p.l2 && p.l2.z, p => p.l2 && ('r=' + p.l2.r.toFixed(3))],
    ['AUTOKORR lag3', p => p.l3 && p.l3.z, p => p.l3 && ('r=' + p.l3.r.toFixed(3))],
    ['UPPREP', p => p.upp && Math.max(0, p.upp.z), p => p.upp && (p.upp.obs + ' mot väntat ' + p.upp.vantat)],
    ['SVAR runs', p => p.svarRuns && p.svarRuns.z, p => p.svarRuns && ('R=' + p.svarRuns.R)],
    ['SVAR lag1', p => p.svarL1 && p.svarL1.z, p => p.svarL1 && ('r=' + p.svarL1.r.toFixed(3))]
  ];

  const brott = [];
  namn.forEach((nm, i) => {
    const poster = perOmgang.map(res => res[i]).filter(Boolean);
    if(!poster.length) return;
    if(poster[0].kast){ fel++; console.log('✗ ' + nm + ': kastade — ' + poster[0].kast); return; }
    if(poster[0].n < 100){ hoppade++; korta.push(nm + ' (' + poster[0].n + ' tal)'); return; }
    matta++;
    BEN.forEach(([benNamn, z, text]) => {
      const vs = poster.map(z).filter(v => v !== null && v !== undefined && isFinite(v));
      if(!vs.length) return;
      // Kravet följer antalet omgångar som FAKTISKT gav ett z-värde, inte --omgangar. Här stod
      // först "if(vs.length < 2) return", och då kunde en körning med en omgång aldrig falla:
      // varje ben hoppade ur innan provet. Grinden var grön för att den inte mätte.
      const krav = Math.min(2, vs.length);
      const over = vs.filter(v => Math.abs(v) > GRANS);
      if(over.length >= krav){
        brott.push('  ✗ ' + nm + ' · ' + benNamn + ': z = ' + over.map(v => v.toFixed(1)).join(', ') +
          ' i ' + over.length + '/' + vs.length + ' omgångar — ' + (text(poster[0]) || ''));
        brottPerGen[nm] = 1;
      }
    });
  });

  console.log((brott.length ? '✗ ' : '✓ ') + ram + ' · ' + namn.length + ' generatorer' +
    (brott.length ? ' · ' + brott.length + ' brott' : ' · följderna håller'));
  brott.forEach(b => { console.log(b); fel++; });

  if(VISA){
    perOmgang[0].filter(p => p.n >= 100).slice(0, 8).forEach(p => console.log('    ' + p.namn.padEnd(34) +
      ' n=' + String(p.n).padStart(4) + ' distinkt=' + String(p.upp.distinkt).padStart(3) +
      ' runs z=' + (p.runs.z === null ? '–' : p.runs.z.toFixed(1)).padStart(5) +
      ' lag1 r=' + (p.l1.r === null ? '–' : p.l1.r.toFixed(3)).padStart(6)));
  }
});

console.log('\n' + matta + ' generatorer mätta' + (hoppade ? ' · ' + hoppade + ' OMÄTTA' : ''));
if(korta.length){
  console.log('OMÄTTA — prompten ger färre än 100 tal, följden går inte att pröva statistiskt:');
  korta.forEach(k => console.log('    ' + k));
}
console.log(fel ? '✗ ' + Object.keys(brottPerGen).length + ' generator(er) med beroende följd' :
  '✓ SLUMP-FUZZ GRÖN — ingen följd vandrar, upprepar sig eller låter sig förutsägas');
process.exit(fel ? 1 : 0);
