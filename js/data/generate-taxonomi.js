// Genererar js/data/k1-taxonomi.js ur ak7-k1-ram.html + delkapitlens DEL.fardighet/FARD.
// Läser faktisk data (gissar inte). Motorer/ram/Arkiv rörs inte. Kör: node js/data/generate-taxonomi.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const ram = fs.readFileSync(path.join(ROOT, 'ak7-k1-ram.html'), 'utf8');

// ---- matcha balanserad {..}/[..] från första förekomsten (hanterar strängar) ----
function matchBracket(s, open){
  const close = open === '{' ? '}' : ']';
  let depth = 0, i = s.indexOf(open); const start = i; let q = null;
  for(; i < s.length; i++){
    const c = s[i];
    if(q){ if(c === '\\'){ i++; continue; } if(c === q) q = null; continue; }
    if(c === '"' || c === "'" || c === '`'){ q = c; continue; }
    if(c === open) depth++;
    else if(c === close){ depth--; if(depth === 0) return s.slice(start, i+1); }
  }
  throw new Error('obalanserad ' + open);
}
function grabLiteral(src, decl, open){
  const idx = src.indexOf(decl);
  if(idx < 0) throw new Error('hittar ej ' + decl);
  return matchBracket(src.slice(idx), open);
}
const evalLit = lit => eval('(' + lit + ')');

// ---- A. rena datastrukturer ur ramen ----
const DELAR = evalLit(grabLiteral(ram, 'const DELAR =', '['));
const KUNSKAPSOMRADEN = evalLit(grabLiteral(ram, 'const KUNSKAPSOMRADEN =', '['));
const FORMAGOR = evalLit(grabLiteral(ram, 'const FORMAGOR =', '{'));

// ---- B. DELAR_KO-fyllningarna ----
const DELAR_KO = { taluppfattning: KUNSKAPSOMRADEN };
const reFill = /DELAR_KO\['([a-z0-9-]+)'\]\s*=\s*\[/g; let mF;
while((mF = reFill.exec(ram))){
  const delId = mF[1];
  if(delId === 'taluppfattning') continue;
  DELAR_KO[delId] = evalLit(matchBracket(ram.slice(mF.index + mF[0].length - 1), '['));
}

// ---- C. OVNING_RENDERS: koId → {formagaKey: renderFnNamn} ----
const orBody = grabLiteral(ram, 'const OVNING_RENDERS =', '{');
const OR = {};
{
  const inner = orBody.slice(orBody.indexOf('{') + 1, orBody.lastIndexOf('}'));
  let i = 0;
  while(i < inner.length){
    while(i < inner.length && /[\s,]/.test(inner[i])) i++;
    if(inner.slice(i, i+2) === '//'){ while(i < inner.length && inner[i] !== '\n') i++; continue; }
    if(i >= inner.length) break;
    let key;
    if(inner[i] === "'"){ const e = inner.indexOf("'", i+1); key = inner.slice(i+1, e); i = e+1; }
    else { let j = i; while(j < inner.length && /[\w-]/.test(inner[j])) j++; key = inner.slice(i, j); i = j; }
    while(i < inner.length && /[\s:]/.test(inner[i])) i++;
    const body = matchBracket(inner.slice(i), '{'); i += body.length;
    const map = {}; let mm; const reFn = /([\w-]+)\s*:\s*\(b\)\s*=>\s*([A-Za-z0-9_]+)\s*\(/g;
    while((mm = reFn.exec(body))) map[mm[1]] = mm[2];
    OR[key] = map;
  }
}

// ---- D. delkapitlens kurerade utbudslistor (presentationen) ----
// Inkrementellt: läs FARD ur en sida som fortfarande har sin hårdkodade array (obunden).
// När en sida bundits (arrayen borttagen) bevaras dess visning ur befintliga k1-taxonomi.js.
const CANDIDATES = [
  { id: 'd1', file: 'ak7/k1/d1-positionssystem/index.html', anchor: 'fardighet:[', from: 'fardighet:' },
  { id: 'd2', file: 'ak7/k1/d2-fyraraknesatt/index.html',   anchor: 'var FARD=[',  from: 'var FARD=' }
];
const PAGES = [];
for(const cand of CANDIDATES){
  const src = fs.readFileSync(path.join(ROOT, cand.file), 'utf8');
  const idx = src.indexOf(cand.anchor);
  if(idx < 0) continue; // redan bunden → hoppa, visning bevaras nedan
  PAGES.push({ id: cand.id, fard: evalLit(matchBracket(src.slice(idx + cand.from.length), '[')) });
}
// Bevara visning för redan bundna sidor ur den befintliga taxonomin.
const prevVisning = {};
const taxPath = path.join(ROOT, 'js/data/k1-taxonomi.js');
if(fs.existsSync(taxPath)){
  const vm = require('vm'); const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(taxPath, 'utf8'), sandbox);
  for(const n of ((sandbox.window.K1_TAXONOMI || {}).noder || [])) if(n.visning) prevVisning[n.id] = n.visning;
}

// Presentationen ligger PER LÖVNOD (så gruppering funkar oavsett om utbudslistan grupperar
// per KO (d1) eller per område (d2)). lövId = koId:techKey.
const pilotDrill = {};
for(const page of PAGES){
  page.fard.forEach(function(g, gi){
    g.drills.forEach(function(d, di){
      const techKey = d.formagaKey || d.formaga;
      pilotDrill[d.ko + ':' + techKey] = {
        utbudslista: page.id, grupp: g.ko, gruppordning: gi, radordning: di,
        titel: d.titel, etikett: d.formaga,
        formagaKey: d.formagaKey || null, niva: d.niva || null
      };
    });
  });
}

// tagClass -> stor förmåge-kategori
const CAT = { 'tag-begrepp':'BEGREPP','tag-rakna':'RAKNA','tag-metod':'METOD','tag-komm':'KOMMUNIKATION','tag-resonera':'RESONERA','tag-problem':'PROBLEM' };
function storKategori(key){
  const f = FORMAGOR[key];
  if(f && CAT[f.tagClass]) return CAT[f.tagClass];
  return key.toUpperCase();
}

// ---- bygg noder ----
const noder = [];
const koToDel = {};
const DEFAULT_ARK = { ak7: 'mal' };
// Per-delkapitel arskurs: en DELAR-entry med ak:'ak8' (t.ex. Potenser) ger HELA subträdet
// (område/deldomän/lövnoder) arskursRelevans {ak8:mal} utan per-nod-OVERRIDES.
const delArk = {}; for(const del of DELAR){ delArk[del.id] = del.ak === 'ak8' ? { ak8: 'mal' } : DEFAULT_ARK; }
function arkFor(delId){ return Object.assign({}, delArk[delId] || DEFAULT_ARK); }

for(const del of DELAR){
  noder.push({
    id: del.id, namn: del.titel, parent: null, niva: 'omrade',
    arskursRelevans: arkFor(del.id), roll: 'karna',
    formaga: null, generator: null, begrepp: del.beskrivning || null,
    grupp: del.grupp || null, implemented: !!del.implemented
  });
}
for(const delId in DELAR_KO){
  for(const ko of DELAR_KO[delId]){
    koToDel[ko.id] = delId;
    noder.push({
      id: ko.id, namn: ko.titel, parent: delId, niva: 'deldoman',
      arskursRelevans: arkFor(delId), roll: 'karna',
      formaga: null, generator: null, begrepp: ko.beskrivning || null,
      visning: null   // presentationen ligger på lövnoderna
    });
    const rend = OR[ko.id] || {};
    for(const techKey in rend){
      const kat = storKategori(techKey);
      const lovId = ko.id + ':' + techKey;
      const vis = pilotDrill[lovId] || prevVisning[lovId] || null;
      const desc = ko.formagor && ko.formagor[techKey] ? ko.formagor[techKey].desc : null;
      noder.push({
        id: lovId,
        namn: vis ? vis.titel : (ko.titel + ' · ' + ((FORMAGOR[techKey] && FORMAGOR[techKey].label) || techKey)),
        parent: ko.id, niva: 'lovnod',
        arskursRelevans: arkFor(delId),
        roll: (kat === 'METOD') ? 'breddning' : 'karna',
        formaga: kat, generator: rend[techKey], begrepp: desc,
        visning: vis
      });
    }
  }
}

// ---- EXTRA noder: analysverktygets finare decomposition (utan egna kod-generatorer) ----
// Prioriteringsregelns i–vii. renderPrioBerakning täcker i–vi via svårighetsnivåer; de är
// pedagogiska progressions-noder under prio-prioritering (visning:null => syns ej i utbudslistor).
const EXTRA_NODER = [
  { id:'prio-kombinationer', namn:'Kombinationer av räknesätt (i–iv)', parent:'prio-prioritering', niva:'lovnod',
    arskursRelevans:{ ak7:'mal' }, roll:'karna', formaga:'RAKNA', generator:'renderPrioBerakning',
    begrepp:'Blanda ·, /, + och − i rätt ordning.', visning:null },
  { id:'prio-parenteser', namn:'Parenteser med tal (v)', parent:'prio-prioritering', niva:'lovnod',
    arskursRelevans:{ ak7:'mal' }, roll:'karna', formaga:'RAKNA', generator:'renderPrioBerakning',
    begrepp:'Räkna parentesen först. Parentes med tal hör åk 7 (parentes i ekvationer = åk 8, k3).', visning:null },
  { id:'prio-negativt', namn:'Svaret blir negativt (vi)', parent:'prio-prioritering', niva:'lovnod',
    arskursRelevans:{ ak7:'mal' }, roll:'fordjupning', formaga:'RAKNA', generator:'renderPrioBerakning',
    begrepp:'Uttryck där resultatet blir negativt – utmaning.', visning:null },
  { id:'prio-potenser', namn:'Potenser (vii)', parent:'prio-prioritering', niva:'lovnod',
    arskursRelevans:{ ak8:'mal' }, roll:'karna', formaga:'RAKNA', generator:null,
    begrepp:'Prioritering med potenser (25−6²=−11) — övas som Öva-blad (dk8 blad 3); progressions-nod under prioriteringsregeln.', visning:null },

  // ── Potenser (åk8): område + deldomän + drill-lövnoder byggs ur DELAR/DELAR_KO/OVNING_RENDERS
  //    (ak:'ak8' → {ak8:mal}). Här bara de TVÅ blad-noderna som saknar egen drill-generator. ──
  { id:'pot-begrepp:tabell', namn:'Potenstabell', parent:'pot-begrepp', niva:'lovnod',
    arskursRelevans:{ ak8:'mal' }, roll:'karna', formaga:'RAKNA', generator:null,
    begrepp:'Fyll värde eller matcha potens (Öva-blad).', visning:null },
  { id:'pot-begrepp:figur', namn:'Area i potensform', parent:'pot-begrepp', niva:'lovnod',
    arskursRelevans:{ ak8:'mal' }, roll:'karna', formaga:'BEGREPP', generator:null,
    begrepp:'Kvadratens area som potens (Öva-blad).', visning:null },

  // ── Tiopotenser (åk8): tio-rakna + drill-lövnoder byggs ur DELAR_KO/OVNING_RENDERS.
  //    Här bara SI-prefix-noden (blad-only, ingen egen drill-generator). ──
  { id:'tio-rakna:prefix', namn:'SI-prefix', parent:'tio-rakna', niva:'lovnod',
    arskursRelevans:{ ak8:'mal' }, roll:'karna', formaga:'BEGREPP', generator:null,
    begrepp:'Matcha tiopotens mot SI-prefix: kilo 10³, mega 10⁶, giga 10⁹, tera 10¹² (Öva-blad).', visning:null }
];
for(const n of EXTRA_NODER) noder.push(n);

// ---- OVERRIDES: manuella tags från Joachims review (bevaras vid regenerering) ----
// Regenerering sätter defaults; dessa läggs på ovanpå för enskilda noder. Fyll på per order.
const OVERRIDES = {
  // 'nod-id': { roll: 'fordjupning' },  eller  { arskursRelevans: { ak8: 'mal' } }
  // Del 5/6/7 — Beräkningar-kategorier utbrutna ur mult-rakna/div-rakna till egna
  // färdigheter. visning.formagaKey = kategori-nyckeln → deeplink ?formaga=<kat> loggar
  // till just denna nod (mult-rakna:pow10 etc.), så kartan skiljer Del 5/6/7 åt.
  // Del 5/6/7-räkna-noderna repeteras i åk8 delkapitel 1 (fyra mult/div-blad). {ak8:repetition}
  // — grönt från sjuan ärvs (repetition, ingen ny ribba; höjt talområde är extra träning i Öva-bladen).
  'mult-rakna:pow10':    { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d5', grupp:'Räkna med 10, 100 och 1000', gruppordning:0, radordning:0, titel:'Multiplikation med 10, 100 och 1000', etikett:'räkna', formagaKey:'pow10', niva:null } },
  'div-rakna:pow10':     { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d5', grupp:'Räkna med 10, 100 och 1000', gruppordning:0, radordning:1, titel:'Division med 10, 100 och 1000', etikett:'räkna', formagaKey:'pow10', niva:null } },
  'mult-rakna:stora':    { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d6', grupp:'Multiplikation med stora och små tal', gruppordning:0, radordning:0, titel:'Stora tal', etikett:'räkna', formagaKey:'stora', niva:null } },
  'mult-rakna:sma':      { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d6', grupp:'Multiplikation med stora och små tal', gruppordning:0, radordning:1, titel:'Små tal', etikett:'räkna', formagaKey:'sma', niva:null } },
  'mult-rakna:storasma': { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d6', grupp:'Multiplikation med stora och små tal', gruppordning:0, radordning:2, titel:'Stora och små tal', etikett:'räkna', formagaKey:'storasma', niva:null } },
  'div-rakna:stora':     { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d7', grupp:'Division med stora och små tal', gruppordning:0, radordning:0, titel:'Stora tal', etikett:'räkna', formagaKey:'stora', niva:null } },
  'div-rakna:storasma':  { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d7', grupp:'Division med stora och små tal', gruppordning:0, radordning:1, titel:'Stora och små tal', etikett:'räkna', formagaKey:'storasma', niva:null } },
  'div-rakna:sma':       { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d7', grupp:'Division med stora och små tal', gruppordning:0, radordning:2, titel:'Små tal – förlängning', etikett:'räkna', formagaKey:'sma', niva:null } },
  // Del 8 — Avrundning och överslag: generatorerna finns, bind dem till d8:s Färdighetsträning.
  'avr-avrundning:begrepp': { visning:{ utbudslista:'d8', grupp:'Avrundning och överslag', gruppordning:0, radordning:0, titel:'Avrundning', etikett:'begrepp', formagaKey:null, niva:null } },
  'avr-overslag:rakna':     { visning:{ utbudslista:'d8', grupp:'Avrundning och överslag', gruppordning:0, radordning:1, titel:'Överslagsräkning', etikett:'räkna', formagaKey:'rakna', niva:null } },
  // Beräkningar-aggregaten avlöstes av per-kategori-noderna i Del 5/6/7. Ta bort dem ur
  // Fyra räknesätt (d2) och dölj dem på kartan (kategorierna är de riktiga färdigheterna).
  'mult-rakna:rakna': { visning:null, doljKarta:true },
  'div-rakna:rakna':  { visning:null, doljKarta:true },
  // Del 4 — Bråkform och decimalform: fyra drillar (en per Öva-avdelning), samma tal som Öva.
  'bd-vaxla:rakna':    { visning:{ utbudslista:'d4', grupp:'Bråkform och decimalform', gruppordning:0, radordning:0, titel:'Bråk → decimal', etikett:'räkna', formagaKey:'rakna', niva:null } },
  'bd-tillbrak:rakna': { visning:{ utbudslista:'d4', grupp:'Bråkform och decimalform', gruppordning:0, radordning:1, titel:'Decimal → bråk', etikett:'räkna', formagaKey:'rakna', niva:null } },
  'bd-hundra:rakna':   { visning:{ utbudslista:'d4', grupp:'Bråkform och decimalform', gruppordning:0, radordning:2, titel:'Tiondelar & hundradelar', etikett:'räkna', formagaKey:'rakna', niva:null } },
  'bd-forlang:rakna':  { visning:{ utbudslista:'d4', grupp:'Bråkform och decimalform', gruppordning:0, radordning:3, titel:'Förläng till hundradelar', etikett:'räkna', formagaKey:'rakna', niva:null } },

  // Negativa tal — neg-rakna delad (åk8-strukturpilot). add/sub = repetition åk8; mult/div = mål åk8.
  'neg-rakna:addsub':  { arskursRelevans:{ ak7:'mal', ak8:'repetition' }, visning:{ utbudslista:'d3', grupp:'Negativa tal', gruppordning:0, radordning:1, titel:'Räkna: addition och subtraktion', etikett:'räkna', formagaKey:'addsub', niva:null } },
  'neg-rakna:multdiv': { arskursRelevans:{ ak7:'mal', ak8:'mal' },        visning:{ utbudslista:'d3', grupp:'Negativa tal', gruppordning:0, radordning:2, titel:'Räkna: multiplikation och division', etikett:'räkna', formagaKey:'multdiv', niva:null } },

  // Roll-korrigering (Joachims review): primär-metoden per räknesätt är GOLVET (kärna), inte
  // breddning. Migreringens default (kat METOD → breddning) drog med sådant som krävs för
  // godkänt. De sekundära metoderna (flytta över, addition bakifrån, dubbelparentes, liggande
  // stolen) bor kvar i samma drill. Faktorträd + utvecklad form = golvet (bekräftat).
  'mult-begrepp:metod':      { roll:'karna' },
  'prio-prioritering:metod': { roll:'karna' },
  'primtal:metod':           { roll:'karna' },
  'utvecklad:metod':         { roll:'karna' },

  // ── B: räknelagar + metoder utbrutna per kategori (deldomän → barn) ──────────────────
  // Kör B (Joachims val): den grova metod-/lag-noden blir INTE en egen kart-ruta — kategorierna
  // ÄR färdigheterna. Aggregatet göms på kartan (doljKarta → ur barnAv/rollup) och tas ur
  // Färdighetsträningen (visning:null). Noden finns kvar för picker-deeplinken (OVNING_RENDERS
  // …:metod / prio-lagar:rakna) och för självskattningens VARIANTER (belief-rader).
  // Kategori-noderna genereras automatiskt ur OVNING_RENDERS; här får de roll + visning.
  // Roll (primär-metod-regeln): uppställning, kort division och räknelagarna = KÄRNA (golvet);
  // de alternativa metoderna = BREDDNING (grå i godkänt-vyn).
  'add-metoder:metod':  { roll:'karna', visning:null, doljKarta:true },
  'sub-metoder:metod':  { roll:'karna', visning:null, doljKarta:true },
  'mult-metoder:metod': { roll:'karna', visning:null, doljKarta:true },
  'div-metoder:metod':  { roll:'karna', visning:null, doljKarta:true },
  'prio-lagar:rakna':   { roll:'karna', visning:null, doljKarta:true },

  // Addition — uppställning (kärna). talsorterna/flytta över förblir belief-only i självskattningen.
  'add-metoder:uppstallning': { roll:'karna', visning:{ utbudslista:'d2', grupp:'Addition', gruppordning:0, radordning:2, titel:'Uppställning', etikett:'metod', formagaKey:'uppstallning', niva:null } },
  // Subtraktion — uppställning (kärna) + öka/minska, addition bakifrån (breddning)
  'sub-metoder:uppstallning': { roll:'karna',     visning:{ utbudslista:'d2', grupp:'Subtraktion', gruppordning:1, radordning:2,   titel:'Uppställning',        etikett:'metod', formagaKey:'uppstallning', niva:null } },
  'sub-metoder:okaminska':    { roll:'breddning', visning:{ utbudslista:'d2', grupp:'Subtraktion', gruppordning:1, radordning:2.1, titel:'Öka och minska lika',  etikett:'metod', formagaKey:'okaminska',    niva:null } },
  'sub-metoder:bakifran':     { roll:'breddning', visning:{ utbudslista:'d2', grupp:'Subtraktion', gruppordning:1, radordning:2.2, titel:'Addition bakifrån',    etikett:'metod', formagaKey:'bakifran',     niva:null } },
  // Multiplikation — uppställning (kärna)
  'mult-metoder:uppstallning': { roll:'karna', visning:{ utbudslista:'d2', grupp:'Multiplikation', gruppordning:2, radordning:2, titel:'Uppställning', etikett:'metod', formagaKey:'uppstallning', niva:null } },
  // Division — kort (kärna) + lång (breddning)
  'div-metoder:kort': { roll:'karna',     visning:{ utbudslista:'d2', grupp:'Division', gruppordning:3, radordning:2,   titel:'Kort division', etikett:'metod', formagaKey:'kort', niva:null } },
  'div-metoder:lang': { roll:'breddning', visning:{ utbudslista:'d2', grupp:'Division', gruppordning:3, radordning:2.1, titel:'Lång division', etikett:'metod', formagaKey:'lang', niva:null } },
  // Räknelagar — alla tre kärna (kärnbegrepp)
  'prio-lagar:kommutativa':  { roll:'karna', visning:{ utbudslista:'d2', grupp:'Prioriteringsregeln', gruppordning:4, radordning:2,   titel:'Kommutativa lagen',  etikett:'räkna', formagaKey:'kommutativa',  niva:null } },
  'prio-lagar:associativa':  { roll:'karna', visning:{ utbudslista:'d2', grupp:'Prioriteringsregeln', gruppordning:4, radordning:2.1, titel:'Associativa lagen',  etikett:'räkna', formagaKey:'associativa',  niva:null } },
  'prio-lagar:distributiva': { roll:'karna', visning:{ utbudslista:'d2', grupp:'Prioriteringsregeln', gruppordning:4, radordning:2.2, titel:'Distributiva lagen', etikett:'räkna', formagaKey:'distributiva', niva:null } }
};
for(const n of noder){
  const o = OVERRIDES[n.id];
  if(o){
    if(o.roll) n.roll = o.roll;
    if(o.arskursRelevans) n.arskursRelevans = o.arskursRelevans;
    if('visning' in o){ n.visning = o.visning; if(o.visning && o.visning.titel) n.namn = o.visning.titel; }
    if(o.doljKarta) n.doljKarta = true;
  }
}

// ---- skriv fil ----
const header = '/* k1-taxonomi.js — maskinläsbar nodstruktur (område → deldomän → lövnod).\n'
  + '   AUTOGENERERAD av js/data/generate-taxonomi.js ur ak7-k1-ram.html + delkapitlens utbudslistor.\n'
  + '   formaga + generator är förifyllda ur koden. arskursRelevans + roll har defaults att tagga\n'
  + '   (roll: karna | breddning | fordjupning). Manuella tags bor i OVERRIDES/EXTRA_NODER i generatorn.\n'
  + '   visning bär presentationsdatan; visning.utbudslista anger vilken delkapitel-lista raden hör till.\n'
  + '   REGENERERA när ramens DELAR/DELAR_KO/OVNING_RENDERS ändras. Motorer/Arkiv orörda. */\n';
fs.mkdirSync(path.join(ROOT, 'js/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'js/data/k1-taxonomi.js'), header + 'window.K1_TAXONOMI = ' + JSON.stringify({ noder }, null, 2) + ';\n', 'utf8');

// ---- rapport ----
const c = niva => noder.filter(n => n.niva === niva).length;
console.log('Noder:', noder.length, '| områden:', c('omrade'), '| deldomäner:', c('deldoman'), '| lövnoder:', c('lovnod'));
const rader = noder.filter(n => n.niva === 'lovnod' && n.visning);
const utbudIds = [...new Set(rader.map(n => n.visning.utbudslista))].sort();
for(const uid of utbudIds){
  const r = rader.filter(n => n.visning.utbudslista === uid);
  const grupper = new Set(r.map(n => n.visning.grupp)).size;
  console.log('  utbudslista ' + uid + ': ' + grupper + ' grupper, ' + r.length + ' rader' + (PAGES.some(p => p.id === uid) ? ' (läst ur sidan)' : ' (bevarad)'));
}
const rollC = {}; noder.filter(n => n.niva === 'lovnod').forEach(n => rollC[n.roll] = (rollC[n.roll] || 0) + 1);
console.log('roll (lövnoder):', JSON.stringify(rollC));

// ---- KORSKOLL: kodens färdigheter (OVNING_RENDERS) utan taxonomi-nod ----
const nodeIds = new Set(noder.map(n => n.id));
const koIds = new Set();
for(const d in DELAR_KO) for(const k of DELAR_KO[d]) koIds.add(k.id);
const luckor = [];
for(const koId in OR){
  for(const techKey in OR[koId]){
    const lovId = koId + ':' + techKey, gen = OR[koId][techKey];
    if(!koIds.has(koId)) luckor.push(lovId + '  → ' + gen + '  (koId saknar KO i DELAR_KO)');
    else if(!nodeIds.has(lovId)) luckor.push(lovId + '  → ' + gen + '  (KO finns men lövnod saknas)');
  }
}
console.log('KORSKOLL – kodfärdigheter utan nod: ' + luckor.length);
luckor.forEach(l => console.log('  ⚠ ' + l));
console.log('Divisionstabellen: nod ' + (nodeIds.has('div-tabell:rakna') ? 'FINNS (div-tabell:rakna → ' + (OR['div-tabell'] || {}).rakna + ')' : 'SAKNAS'));
