/* ============================================================
   METOD · d1-TILLÄGG — fyra nya adaptiva drillar (Färdighetsträning, Steg 2)
   Backlog-typer som saknade adaptiv motor:
     • Talnamn ↔ siffror        (ko:siffror  · formaga:namn)
     • Enhetsbyten              (ko:position · formaga:enhet)
     • Faktorisering baklänges  (ko:primtal  · formaga:baklanges)
     • Konstruera (delbarhet)   (ko:delbarhet· formaga:konstruera)
   Återanvänder ramens motorer (negCalcEngine, negPicker, exerciseHeader,
   adjustLevel, keypadHTML, bindKeypad, d3RandInt, d3ParseNum, primeFactorize …).
   RÖR inga befintliga drillar. Laddas som klassiskt <script> efter övriga
   metod-moduler. Nivåstege respekterar ?maxniva via ramens exerciseHeader.
   ============================================================ */

// ============================================================
// PLATSVÄRDE (position/begrepp) — svar i ORD (platsens namn), ingen tipsruta
// "Vilket värde har 5:an i talet 4527?" → hundratal. Nivå 1 = heltal, nivå 2 =
// decimaltal (svaret ibland en heltalsplats), nivå 3 = upp till hundratusental.
// ============================================================
var D1_PLATSNAMN = {'5':'hundratusental','4':'tiotusental','3':'tusental','2':'hundratal','1':'tiotal','0':'ental','-1':'tiondel','-2':'hundradel','-3':'tusendel'};
function d1GenPlatsvarde(level){
  var intLen, decLen;
  if(level === 1){ intLen = 4; decLen = 0; }                                    // heltal (ental..tusental)
  else if(level === 2){ intLen = d3RandInt(2, 4); decLen = d3RandInt(2, 3); }   // decimaltal, ibland heltalsplats
  else { intLen = d3RandInt(4, 6); decLen = d3RandInt(2, 3); }                   // upp till hundratusental
  var maxExp = intLen - 1, exps = [], e;
  for(e = maxExp; e >= 0; e--) exps.push(e);
  for(e = 1; e <= decLen; e++) exps.push(-e);
  var malExp = randPick(exps), digits = {}, malSiffra = null, tries = 0;
  while(tries++ < 30){
    exps.forEach(function(x){ if(x !== malExp) digits[x] = d3RandInt(x === maxExp ? 1 : 0, 9); });  // ledande ej 0
    var andra = exps.filter(function(x){ return x !== malExp; }).map(function(x){ return digits[x]; });
    var fria = [1,2,3,4,5,6,7,8,9].filter(function(d){ return andra.indexOf(d) < 0; });               // mål-siffran unik & nollskild
    if(fria.length){ malSiffra = randPick(fria); digits[malExp] = malSiffra; break; }
  }
  var intPart = '', decPart = '';
  for(e = maxExp; e >= 0; e--) intPart += String(digits[e]);
  for(e = -1; e >= -decLen; e--) decPart += String(digits[e]);
  var talStr = decLen > 0 ? intPart + ',' + decPart : intPart;
  return { malExp: malExp, malSiffra: malSiffra, talStr: talStr, svar: D1_PLATSNAMN[String(malExp)] };
}
function d1NormPlats(s){ return String(s).toLowerCase().replace(/[^a-zåäö]/g, '').replace(/(arna|erna|ar|er|na|s)$/, ''); }
function renderPlatsvarde(body, backFn){
  var forra = null;
  d1CustomEngine(body, {
    title:'Platsvärde', sub:'På vilken plats står den markerade siffran? Svara med platsens namn i ord (t.ex. hundratal).',
    koId:'position', forKey:'begrepp', scoreKey:'platsvarde', OMG:6, keypad:false, inputmode:'text', placeholder:'t.ex. tiotal',
    gen:function(level){
      var t, guard = 0;
      do { t = d1GenPlatsvarde(level); guard++; } while(t.svar === forra && guard < 10);   // ingen direkt upprepning
      forra = t.svar;
      return { q:'Vilket värde har <span class="neg-expr">' + t.malSiffra + '</span>:an i talet <span class="neg-expr">' + t.talStr + '</span>?',
               svar:t.svar, malSiffra:t.malSiffra };
    },
    valid:function(raw, t){ return d1NormPlats(raw) === d1NormPlats(t.svar); },
    ratt:function(t){ return 'Rätt! ' + t.malSiffra + ':an står på ' + t.svar + '-platsen.'; },
    fel:function(t){ return 'Rätt svar: ' + t.svar + '.'; }
  }, backFn);
}

// ---- SKRIV TALET MED SIFFROR (position/begrepp) — bygg tal av platsvärdesdelar ----
// Nivå 1 = heltal upp till hundratusental (inga decimaler). Nivå 2 = decimaltal,
// heltalsdel max tusental (aldrig bara ental). Nivå 3 = hela spannet hundratusental
// →tusendel med flera nollor (extra svårt). Delarna visas i ologisk ordning.
// Delen med antalet i BOKSTÄVER ("tre hundratusental", "en tiondel", "fem tiondelar").
// ett/en-genus: heltalsplatser (tal) = "ett", decimalplatser (del) = "en".
function d1SkrivtalDelText(c, exp){
  var ord = (c === 1 && exp < 0) ? 'en' : D1_ENTAL[c];
  var namn = D1_PLATSNAMN[String(exp)];
  if(exp < 0 && c > 1) namn += 'ar';                                    // två tiondelar, en tiondel
  return ord + ' ' + namn;
}
function d1ListaOch(arr){
  if(arr.length <= 1) return arr.join('');
  return arr.slice(0, -1).join(', ') + ' och ' + arr[arr.length - 1];
}
function d1GenSkrivtal(level){
  var places = level === 1 ? [3,2,1,0]                                  // nivå 1: heltal ental..tusental (stegring)
             : level === 2 ? [3,2,1,0,-1,-2,-3]
             : [5,4,3,2,1,0,-1,-2,-3];
  var antal = level === 3 ? d3RandInt(3, 4) : d3RandInt(2, 4);
  var valda = shuffle(places.slice()).slice(0, antal);
  if(level === 2 && !valda.some(function(p){ return p < 0; })){         // nivå 2 ska vara decimaltal
    valda[d3RandInt(0, valda.length - 1)] = randPick([-1,-2,-3]);
    valda = valda.filter(function(v, i, a){ return a.indexOf(v) === i; });
    while(valda.length < antal){ var ex = randPick(places); if(valda.indexOf(ex) < 0) valda.push(ex); }
  }
  var summa = 0, delar = [];
  valda.forEach(function(p){ var c = d3RandInt(1, 9); summa += c * Math.pow(10, p); delar.push({ c:c, exp:p }); });
  summa = Math.round(summa * 1e6) / 1e6;
  var vis = delar.slice(), tries = 0;                                   // ologisk ordning (ej platsordning)
  if(vis.length > 2){ do { vis = shuffle(delar.slice()); tries++; } while(tries < 50 && d1ArSorterad(vis.map(function(d){ return d.exp; }))); }
  else vis = shuffle(delar.slice());
  var txt = d1ListaOch(vis.map(function(d){ return d1SkrivtalDelText(d.c, d.exp); }));
  return { display: txt, answerNum: summa, answerStr: posKomma(summa) };
}

// ---- Anti-mönster: balanserad, anti-klustrad plan över svarskategorier ----
// Ger n värden ur cats med så jämn fördelning som möjligt, blandade och utan
// att någon kategori förekommer fler än 2 gånger i rad. Används av kategoriska
// flashcard-drillar (udda/jämnt, antal siffror, primtal/sammansatt, delbarhet,
// jämför <>=) så eleven inte kan gissa på mönstret i stället för att räkna.
function d1BalansPlan(cats, n){
  // Balanserad fördelning i en OLOGISK ordning: inga kluster (>2 lika i rad),
  // ingen lång regelbunden växling (a,b,a,b,a…), och för fler-kategori-drillar
  // ingen direkt upprepning (varje värde skiljer sig från det förra → äkta
  // variation). Rejection sampling: poängsätt slumpade blandningar, ta en utan
  // brister (annars den minst dåliga).
  var i, base = Math.floor(n / cats.length), multiset = [];
  for(i = 0; i < cats.length; i++){ for(var j = 0; j < base; j++) multiset.push(cats[i]); }
  var extra = shuffle(cats.slice()).slice(0, n - base * cats.length);
  for(i = 0; i < extra.length; i++) multiset.push(extra[i]);
  var flerKat = cats.length >= 3;
  function poang(p){
    var s = 0, run = 1, alt = 1;
    for(var k = 1; k < p.length; k++){
      if(p[k] === p[k-1]){ run++; if(flerKat) s += 6; } else run = 1;   // direkt upprepning: illa för fler-kat
      if(run > 2) s += 100;                                              // kluster
      if(p[k] !== p[k-1] && k >= 2 && p[k] === p[k-2]) alt++; else alt = (p[k] !== p[k-1] ? 2 : 1);
      if(alt >= 5) s += 25;                                             // lång alternering (varannan-mönster)
    }
    return s;
  }
  var best = multiset.slice(), bestS = Infinity;
  for(var t = 0; t < 80; t++){
    var p = shuffle(multiset), sc = poang(p);
    if(sc === 0) return p;
    if(sc < bestS){ bestS = sc; best = p; }
  }
  return best;
}
// Stateful plockare: ger en fabrik som delar ut en balanserad kategori i taget,
// och fyller på med ett nytt block när planen tar slut.
function d1PlanPickare(){ var plan = []; return function(cats, blockN){
  if(!plan.length) plan = d1BalansPlan(cats, blockN || 8);
  return plan.shift();
}; }

// ---- Ologisk presentationsordning: blanda en lista så den ALDRIG står sorterad ----
// (varken stigande eller fallande) — annars blir svaret trivialt (bara vända på
// den visade ordningen). För 1–2 element går det inte att undvika, då blandas bara.
function d1ArSorterad(a){
  var asc = true, desc = true;
  for(var i = 1; i < a.length; i++){ if(a[i] < a[i-1]) asc = false; if(a[i] > a[i-1]) desc = false; }
  return asc || desc;
}
function d1OloggiskOrdning(arr){
  if(arr.length <= 2) return shuffle(arr);
  var a, tries = 0;
  do { a = shuffle(arr); tries++; } while(tries < 50 && d1ArSorterad(a));
  return a;
}

// ---- Störst/minst-facit: bygg största/minsta talet av givna distinkta siffror ----
// decimaler = antal siffror efter kommat (0 = heltal). Ledande heltalssiffra får
// aldrig vara 0 (ett flersiffrigt tal skrivs inte med inledande nolla).
function d1StorstMinstSvar(siffror, storst, decimaler){
  var s = siffror.slice().sort(function(a, b){ return storst ? b - a : a - b; });
  var heltalsDel = s.length - decimaler;
  // Ledande nolla ogiltig endast när heltalsdelen har ≥2 siffror ("05" skrivs ej,
  // men "0,5" är ett giltigt tal). Byt då fram första nollskilda siffran.
  if(heltalsDel >= 2 && s[0] === 0){
    for(var k = 1; k < s.length; k++){ if(s[k] !== 0){ var t = s[0]; s[0] = s[k]; s[k] = t; break; } }
  }
  var intDel = s.slice(0, heltalsDel).join('');
  var decDel = s.slice(heltalsDel).join('');
  var str = decimaler > 0 ? intDel + ',' + decDel : intDel;
  return { str: str, num: parseFloat(str.replace(',', '.')) };
}

// ---- Svenska talord, heltal 0..999999 (facit + fråga för Talnamn) ----
var D1_ENTAL = ['noll','ett','två','tre','fyra','fem','sex','sju','åtta','nio',
  'tio','elva','tolv','tretton','fjorton','femton','sexton','sjutton','arton','nitton'];
var D1_TIOTAL = ['','','tjugo','trettio','fyrtio','femtio','sextio','sjuttio','åttio','nittio'];
function d1Under100(n){
  if(n < 20) return D1_ENTAL[n];
  var t = Math.floor(n/10), o = n%10;
  return D1_TIOTAL[t] + (o ? D1_ENTAL[o] : '');
}
function d1Under1000(n){
  if(n < 100) return d1Under100(n);
  var h = Math.floor(n/100), r = n%100;
  return D1_ENTAL[h] + 'hundra' + (r ? d1Under100(r) : '');
}
function d1TalTillOrd(n){
  if(n === 0) return 'noll';
  if(n < 1000) return d1Under1000(n);
  var tus = Math.floor(n/1000), r = n%1000;
  var tusDel = (tus === 1 ? 'ettusen' : d1Under1000(tus) + 'tusen');
  return tusDel + (r ? d1Under1000(r) : '');
}
// Normalisering för fritext-jämförelse (accepterar mellanslag/bindestreck/"och",
// å/ä/ö utan prickar samt hundra/etthundra, tusen/ettusen).
function d1NormOrd(s){
  return String(s).toLowerCase()
    .replace(/\s+/g,'').replace(/-/g,'').replace(/och/g,'')
    .replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o')
    .replace(/ett(hundra|tusen)/g,'$1');
}

// ---- Generisk motor med egen validering (fritext in, cfg.valid(raw, task)) ----
// Speglar negCalcEngine men släpper igenom flera giltiga svar / textsvar.
// cfg: {title, sub, koId, forKey, scoreKey, OMG, keypadOps, keypad(bool),
//       inputmode, gen(level)->{q, ...}, valid(raw,task)->bool, ratt(task), fel(task)}
function d1CustomEngine(body, cfg, backFn){
  var level = 1, omgang = [], idx = 0, results = [], OMG = cfg.OMG || 6;
  function genOmgang(){ var a = []; for(var i=0;i<OMG;i++) a.push(cfg.gen(level)); return a; }
  function render(){
    if(idx >= omgang.length){
      var right = results.filter(function(x){ return x; }).length, total = results.length;
      var adj = adjustLevel(level, right, total); level = adj.level;
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader(cfg.title, 'Du klarade ' + right + ' av ' + total + '.', level)
        + renderSummaryCard({right:right, total:total, level:level, levelChange:adj.change})
        + '<div style="margin-top:-8px;text-align:center;"><button class="btn subtle" id="d1c-back">Tillbaka</button></div>'
      + '</div>';
      document.getElementById('summary-next-btn').onclick = function(){ omgang = genOmgang(); idx = 0; results = []; render(); };
      document.getElementById('d1c-back').onclick = backFn;
      return;
    }
    var task = omgang[idx];
    body.innerHTML = '<div class="exercise-card">'
      + exerciseHeader(cfg.title, cfg.sub, level)
      + renderScoreBarSimple(results.filter(function(x){return x;}).length, results.filter(function(x){return !x;}).length, omgang.length, idx)
      + '<div class="neg-fraga">' + task.q + '</div>'
      + '<div class="rakna-svar-rad"><input type="text" class="rakna-svar-input" id="d1c-input" inputmode="' + (cfg.inputmode || 'text') + '" autocomplete="off" placeholder="' + (cfg.placeholder || '?') + '"' + (cfg.maxlength ? ' maxlength="' + cfg.maxlength + '"' : '') + '></div>'
      + '<div class="rakna-uppdela-feedback" id="d1c-fb"></div>'
      + (cfg.keypad === false ? '' : keypadHTML(cfg.keypadOps || []))
      + '<div style="margin-top:16px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
        + '<button class="btn primary" id="d1c-check">Kontrollera</button>'
        + '<button class="btn subtle" id="d1c-tillbaka">Tillbaka</button>'
      + '</div>'
    + '</div>';
    var card = body.querySelector('.exercise-card');
    if(cfg.keypad !== false) bindKeypad(card);
    var input = document.getElementById('d1c-input');
    setTimeout(function(){ input.focus(); }, 50);
    input.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); check(); } });
    document.getElementById('d1c-tillbaka').onclick = backFn;
    document.getElementById('d1c-check').onclick = check;
    function check(){
      var raw = input.value.trim(), fb = document.getElementById('d1c-fb');
      fb.className = 'rakna-uppdela-feedback show';
      input.disabled = true; document.getElementById('d1c-check').disabled = true;
      var ts = getTutorScore(cfg.koId, cfg.forKey), tsG = getTutorScore(cfg.koId, cfg.scoreKey);
      ts.total++; tsG.total++;
      var ok = cfg.valid(raw, task);
      if(ok){ input.classList.add('correct'); fb.classList.add('correct'); fb.textContent = cfg.ratt(task, raw); ts.correct++; tsG.correct++; }
      else { input.classList.add('wrong'); fb.classList.add('wrong'); fb.textContent = cfg.fel(task, raw); }
      results.push(ok);
      setTimeout(function(){ idx++; render(); }, ok ? 1700 : 2900);
    }
  }
  omgang = genOmgang(); render();
}

// ============================================================
// #2 · TALNAMN ↔ SIFFROR   (ko:siffror · formaga:namn)
// ============================================================
function d1GenTal(level){
  // Nivåstruktur: 1 = hundratal (100–999), 2 = tusental (1000–9999),
  // 3 = tiotusental med kluriga former (10000–99999, t.ex. "fjortontusen fem").
  if(level === 1) return d3RandInt(100, 999);
  if(level === 2) return d3RandInt(1000, 9999);
  return d3RandInt(10000, 99999);
}
function renderTalnamn(body){
  negPicker(body, 'Talnamn och siffror', 'Välj riktning. Nivån anpassar sig medan du räknar.', [
    {id:'siffror', nr:1, namn:'Läs ordet — skriv siffrorna', desc:'”fyrahundra tjugofem” → 425'},
    {id:'ord',     nr:2, namn:'Läs talet — skriv med ord',   desc:'425 → fyrahundratjugofem'}
  ], function(katId, backFn){
    if(katId === 'siffror'){
      // ord → tal: svaret är ett tal → sifferinmatning (robust exakt facit)
      negCalcEngine(body, {
        title:'Skriv talet med siffror', sub:'Vilket tal står skrivet med ord?',
        koId:'siffror', forKey:'namn', scoreKey:'namn-siffror', OMG:6, keypadOps:[],
        gen:function(level){ var n = d1GenTal(level);
          return { q:'Skriv talet <span class="neg-expr">' + d1TalTillOrd(n) + '</span> med siffror.', answer:n }; }
      }, backFn);
    } else {
      // tal → ord: svaret är text → fritext-jämförelse (normaliserad), ingen sifferknappsats
      d1CustomEngine(body, {
        title:'Skriv talet med ord', sub:'Skriv talet med bokstäver (mellanslag spelar ingen roll).',
        koId:'siffror', forKey:'namn', scoreKey:'namn-ord', OMG:6, keypad:false, inputmode:'text', placeholder:'t.ex. fyrahundratjugofem',
        gen:function(level){ var n = d1GenTal(level); return { q:'Skriv talet <span class="neg-expr">' + n + '</span> med ord.', ord:d1TalTillOrd(n), tal:n }; },
        valid:function(raw, t){ return d1NormOrd(raw) === d1NormOrd(t.ord); },
        ratt:function(t){ return 'Rätt! ' + t.tal + ' = ' + t.ord + '.'; },
        fel:function(t){ return 'Rätt svar: ' + t.ord + '.'; }
      }, backFn);
    }
  });
}

// ============================================================
// #3 · ENHETSBYTEN   (ko:position · formaga:enhet)
// ============================================================
var D1_ENH = [
  {namn:'tusental', f:1000}, {namn:'hundratal', f:100}, {namn:'tiotal', f:10}, {namn:'ental', f:1},
  {namn:'tiondelar', f:0.1}, {namn:'hundradelar', f:0.01}, {namn:'tusendelar', f:0.001}
];
function d1EnhByNamn(n){ for(var i=0;i<D1_ENH.length;i++) if(D1_ENH[i].namn===n) return D1_ENH[i]; }
function d1GenEnhet(level){
  // Målenheter per nivå: 1 = heltalsplatser, 2 = tiondelar, 3 = hundra-/tusendelar.
  var mal = level===1 ? ['tusental','hundratal','tiotal']
          : level===2 ? ['tiondelar','tiotal','hundratal']
          : ['hundradelar','tusendelar','tiondelar'];
  var U = d1EnhByNamn(randPick(mal));
  // svaret (antal av målenheten). Nivå 3 rejält större → krångligare tal, t.ex.
  // 4,1 i hundradelar = 410. Nivå 2 lite mer variation än förr.
  var A = level===3 ? d3RandInt(11, 999) : (level===2 ? d3RandInt(2, 90) : d3RandInt(2, 40));
  var value = Math.round(A * U.f * 1e6) / 1e6;
  // Två fraseringar: "value = ___ enhet" och "N enhetA = ___ enhetB"
  if(Math.random() < 0.5 || U.f >= 1){
    return { q:'<span class="neg-expr">' + posKomma(value) + '</span> = ___ ' + U.namn + '?', answer:A };
  }
  // enhetA (större) → målenhet (mindre): count_a * f_a / U.f
  var storre = D1_ENH.filter(function(e){ return e.f > U.f; });
  var A2 = storre[d3RandInt(0, storre.length-1)];
  var count = d3RandInt(1, 9);
  var ans = Math.round(count * A2.f / U.f);
  return { q:'<span class="neg-expr">' + count + ' ' + A2.namn + '</span> = ___ ' + U.namn + '?', answer:ans };
}
function renderEnhetsbyten(body){
  negCalcEngine(body, {
    title:'Enhetsbyten', sub:'Hur många av den efterfrågade enheten är talet?',
    koId:'position', forKey:'enhet', scoreKey:'enhet', OMG:6, keypadOps:[','],
    gen:d1GenEnhet
  }, function(){ navTo('ovning', {koId:'position', formaga:'enhet'}); });
}

// ============================================================
// #6 · FAKTORISERING BAKLÄNGES   (ko:primtal · formaga:baklanges)
// ============================================================
function d1GenProdukt(level){
  var antal = level===1 ? 2 : level===2 ? 3 : 4;
  var pool = level===1 ? [2,3,5] : level===2 ? [2,3,5,7] : [2,3,5,7,11];
  var faktorer = [];
  for(var i=0;i<antal;i++) faktorer.push(randPick(pool));
  faktorer.sort(function(a,b){ return a-b; });
  var prod = faktorer.reduce(function(a,b){ return a*b; }, 1);
  return { q:'Vilket tal har faktoriserats?<br><span class="neg-expr">' + faktorer.join(' · ') + '</span>', answer:prod };
}
function d1GenSaknad(level){
  // Visa ett tal och dess primfaktorisering med EN faktor dold → skriv den saknade.
  var antal = level===1 ? 2 : level===2 ? 3 : 4;
  var pool = level===1 ? [2,3,5] : level===2 ? [2,3,5,7] : [2,3,5,7,11];
  var faktorer = [];
  for(var i=0;i<antal;i++) faktorer.push(randPick(pool));
  faktorer.sort(function(a,b){ return a-b; });
  var prod = faktorer.reduce(function(a,b){ return a*b; }, 1);
  var dold = d3RandInt(0, faktorer.length-1), svar = faktorer[dold];
  var visad = faktorer.map(function(f,i){ return i===dold ? '__' : f; }).join(' · ');
  return { q:'Vilken primfaktor saknas?<br><span class="neg-expr">' + prod + ' = ' + visad + '</span>', answer:svar };
}
function renderFaktoriseringBaklanges(body){
  negPicker(body, 'Faktorisering baklänges', 'Välj vad du vill träna på. Nivån anpassar sig medan du räknar.', [
    {id:'produkt', nr:1, namn:'Vilket tal har faktoriserats?', desc:'2 · 2 · 3 → 12'},
    {id:'saknad',  nr:2, namn:'Vilken primfaktor saknas?',     desc:'12 = 2 · 2 · __'}
  ], function(katId, backFn){
    if(katId === 'produkt'){
      negCalcEngine(body, { title:'Vilket tal har faktoriserats?', sub:'Multiplicera ihop faktorerna.',
        koId:'primtal', forKey:'baklanges', scoreKey:'bak-produkt', OMG:6, keypadOps:[], gen:d1GenProdukt }, backFn);
    } else {
      negCalcEngine(body, { title:'Vilken primfaktor saknas?', sub:'Vilket primtal fattas i faktoriseringen?',
        koId:'primtal', forKey:'baklanges', scoreKey:'bak-saknad', OMG:6, keypadOps:[], gen:d1GenSaknad }, backFn);
    }
  });
}

// ============================================================
// #7 · KONSTRUERA TAL MED DELBARHETSVILLKOR   (ko:delbarhet · formaga:konstruera)
// ============================================================
function d1LCM(arr){
  function gcd(a,b){ return b ? gcd(b, a%b) : a; }
  return arr.reduce(function(a,b){ return a / gcd(a,b) * b; }, 1);
}
function d1GenKonstr(level){
  var div = level===1 ? [randPick([2,3,5,10])]
          : level===2 ? shuffle([2,3,5,10]).slice(0,2)
          : [2,3,4,5];
  div = div.slice().sort(function(a,b){ return a-b; });
  return { div:div, lcm:d1LCM(div) };
}
function renderKonstrueraDelbar(body){
  d1CustomEngine(body, {
    title:'Konstruera tal', sub:'Skriv ett tal som uppfyller villkoret. Det finns många rätta svar!',
    koId:'delbarhet', forKey:'konstruera', scoreKey:'konstruera', OMG:6, keypadOps:[], inputmode:'numeric', placeholder:'ditt tal',
    gen:function(level){ var t = d1GenKonstr(level);
      return { q:'Skriv ett tal som är <strong>delbart med ' + t.div.join(', ') + '</strong>.', div:t.div, lcm:t.lcm }; },
    valid:function(raw, t){ var n = d3ParseNum(raw);
      return n !== null && Number.isInteger(n) && n > 0 && t.div.every(function(d){ return n % d === 0; }); },
    ratt:function(t, raw){ return 'Rätt! ' + raw.trim() + ' är delbart med ' + t.div.join(', ') + '.'; },
    fel:function(t){ return 'Inte riktigt. Ett tal som funkar är ' + t.lcm + '.'; }
  }, function(){ navTo('ovning', {koId:'delbarhet', formaga:'konstruera'}); });
}
