/* hjalptext-grind.js — REGEL 4: INGA HJÄLPTEXTER I UPPGIFTERNA (order 2026-10-09, k1 d10 FAS 2).

   SKÄLET. Svepet mot hjälptext letade bara i facket .ak8-hint. Ledtrådar som låg i intro ("Använd
   minusknappen (−)"), i en parentes ("(Du kan räkna på papper …)"), i rubrikens svans ("– tänk på
   ordningen") eller i <em> ("Svara i kronor (kr)") syntes inte för någon grind.

   MÄTS SÅ (statiskt, ingen webbläsare): grinden läser bladfilens elevtext — intro, rubrik, fraga
   (även sammanfogad '…' + '…'), text, hint, exempel och intron som byggs i html — och plockar ut
   INSTRUKTIONSKANDIDATER:
     <em>…</em>                     allt i kursiv är en betonad instruktion
     (…) med ord                    en parentes som innehåller ord (ren matematik "(4 + 6)" räknas inte)
     rubrikens svans efter " – "    "Beräkna – visa mellanled", "– ingen uppställning"
     meningar med ledtrådsord       använd, tänk på, kom ihåg, gärna, papper, med komma, svara i, …
   Varje kandidat måste stå i registret js/data/hjalptext-register.json — Joachims godkända
   instruktioner ("– ingen uppställning", "Använd överslagsräkning."). En ny kandidat som inte är
   godkänd fäller. Samma mönster som elevtext-låset: grinden avgör inget, den visar och låser.

   KÖR:  node verktyg/hjalptext-grind.js                  prövar OMFANG mot registret
         node verktyg/hjalptext-grind.js --godkann <fil>  skriver filens NUVARANDE kandidater som godkända
                                                         (bara efter Joachims granskning)
   Omfång: OMFANG (Plugg till prov k1 d10). Ny fil → en rad. Noll nätväg. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const REG = path.join(ROOT, 'js/data/hjalptext-register.json');
const OMFANG = ['js/motor/blad/blad-k1-d10.js'];
const args = process.argv.slice(2);
const GODKANN = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--godkann'));

const LEDORD = /(^|[^a-zåäö])(använd|tänk på|kom ihåg|gärna|papper|med komma|minusknapp|svara i|ledtråd|tips|t\.ex\.)([^a-zåäö]|$)/i;
const UI = /tryck (sedan )?på kontrollera|när du är klar/i;          // knappinstruktion, inte en ledtråd

function falt(kalla){
  const ut = [];
  // fältsträngar: fält:'…' (+ '…')*  — sammanfogade frågor läses hela
  const re = /(intro|rubrik|fraga|text|hint|exempel)\s*:\s*((?:'(?:[^'\\]|\\.)*'\s*\+?\s*)+)/g; let m;
  while((m = re.exec(kalla)) !== null){
    const s = (m[2].match(/'((?:[^'\\]|\\.)*)'/g) || []).map(x => x.slice(1, -1)).join('');
    ut.push({ falt: m[1], text: s });
  }
  // intron och instruktioner som byggs i html i renderarna
  const re2 = /class="(ovn-intro|ftrad-uppg-instr)">([^<]*)</g;
  while((m = re2.exec(kalla)) !== null) ut.push({ falt: m[1], text: m[2] });
  return ut;
}
function kandidater(f){
  const ut = [], t = f.text;
  (t.match(/<em>([\s\S]*?)<\/em>/g) || []).forEach(e => ut.push(e.replace(/<\/?em>/g, '').trim()));
  const ren = t.replace(/<[^>]*>/g, ' ');
  (ren.match(/\(([^()]*)\)/g) || []).forEach(p => { if(/[a-zåäö]{2,}/i.test(p) && !/^\(\s*(kr|s|m|cm|km|mil|g|kg|l|min|h)\s*\)$/i.test(p)) ut.push(p.trim()); });
  if(f.falt === 'rubrik' && / – /.test(ren)) ut.push('– ' + ren.split(' – ').slice(1).join(' – ').trim());
  ren.split(/(?<=[.!?])\s+/).forEach(men => { if(LEDORD.test(men) && !UI.test(men)) ut.push(men.trim()); });
  return ut;
}
function las(fil){
  const kalla = fs.readFileSync(path.join(ROOT, fil), 'utf8'), set = new Set();
  falt(kalla).forEach(f => kandidater(f).forEach(k => set.add(k.replace(/\s+/g, ' '))));
  return [...set].sort();
}

const reg = fs.existsSync(REG) ? JSON.parse(fs.readFileSync(REG, 'utf8')) : {};
if(GODKANN){
  const filer = OMFANG.filter(f => f.indexOf(GODKANN) >= 0);
  if(!filer.length){ console.error('hjalptext-grind: ingen fil i OMFANG matchar "' + GODKANN + '"'); process.exit(2); }
  filer.forEach(f => { reg[f] = las(f); console.log('godkände ' + reg[f].length + ' instruktioner i ' + f + ':\n  ' + reg[f].join('\n  ')); });
  fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n', 'utf8');
  process.exit(0);
}
let fel = 0;
console.log('HJÄLPTEXT-GRIND — instruktioner i uppgifterna ska vara godkända (regel 4)\n');
OMFANG.forEach(fil => {
  const nu = las(fil), godk = new Set(reg[fil] || []);
  const nya = nu.filter(k => !godk.has(k)), borta = [...godk].filter(k => nu.indexOf(k) < 0);
  nya.forEach(k => { fel++; console.log('✗ ' + fil + ': NY instruktion, inte godkänd: "' + k + '"'); });
  borta.forEach(k => console.log('  ⓘ ' + fil + ': godkänd instruktion finns inte längre: "' + k + '" (städas vid nästa --godkann)'));
  if(!nya.length) console.log('✓ ' + fil + ': ' + nu.length + ' instruktioner, alla godkända');
});
console.log('\n' + (fel ? '✗ HJÄLPTEXT-GRIND RÖD (' + fel + ')' : '✓ HJÄLPTEXT-GRIND GRÖN'));
process.exit(fel ? 1 : 0);
