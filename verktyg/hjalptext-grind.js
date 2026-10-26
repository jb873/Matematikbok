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
         node verktyg/hjalptext-grind.js --sabba ledtrad|blind[:fil]   negativ verifiering (i minnet, källan
                                                         orörd): ledtrad = en ledtråd läggs till i filen,
                                                         blind = filen läses som tom → båda ska fälla.
                                                         Utan :fil gäller det första filen i omfånget.
   Omfång: OMFANG (Plugg till prov k1 d10 + algebrasidorna). Ny fil → en rad. Noll nätväg.

   BLIND FIL FÄLLER. En fil i omfånget där läsaren inte hittar ett enda fält mäts inte — den ser grön
   ut för att grinden inte ser något. Varje fil måste ge minst ett läst fält. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const REG = path.join(ROOT, 'js/data/hjalptext-register.json');
// Algebrasidorna (Joachim 2026-10-26: "d3 och övriga algebrasidor"): sjuans k3 och åttans k2 —
// bladfilerna, problemlösningens texter (prob-modell) och sidorna själva (intron i html).
const OMFANG = ['js/motor/blad/blad-k1-d10.js',
  'js/motor/blad/blad-k3-d1.js', 'js/motor/blad/blad-k3-d2.js', 'js/motor/blad/blad-k3-d3.js', 'js/motor/blad/blad-k3-d7.js',
  'js/motor/ekvationer-balans/ekvationer-balans.js', 'js/motor/problemlosning/prob-modell.js',
  'js/motor/problemlosning/prob-blad.js', 'js/motor/problemlosning/prob-blad2.js', 'js/motor/problemlosning/prob-blad3.js',
  'js/motor/problemlosning/prob-blad4.js', 'js/motor/problemlosning/prob-blad5.js',
  'js/motor/blad/blad-ak8-alg1.js', 'js/motor/blad/blad-ak8-parentes.js', 'js/motor/blad/blad-ak8-mult-parentes.js',
  'js/data/ak8-ekv1.js',
  'ak7/k3/d1-algebraiska-uttryck/index.html', 'ak7/k3/d2-monster/index.html', 'ak7/k3/d3-forenkla-uttryck/index.html',
  'ak7/k3/d4-ekvationer/index.html', 'ak7/k3/d5-problemlosning/index.html', 'ak7/k3/d7-pluggtillprov/index.html',
  'ak8/k2/d1-algebraiska-uttryck/index.html', 'ak8/k2/d3-parentes/index.html', 'ak8/k2/d5-ekvationer-steg1/index.html'];
// KÄND SKULD (Joachim 2026-10-26): sjuans k3 d7 är taluppfattningens kopia och byggs om senare.
// Instruktionerna där rapporteras, men fäller inte. En NY instruktion i filen fäller som vanligt.
const KAND_SKULD = {
  'js/motor/blad/blad-k3-d7.js': [
    'Längst ned bygger du faktorträd – rita gärna på papper också.',
    'Skriv svaret med komma där det behövs.',
    'Tänk på hur decimaltecknet flyttar när du multiplicerar eller dividerar med 10, 100 och 1000.',
    '– visa mellanled']
};
const args = process.argv.slice(2);
const GODKANN = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--godkann'));
const SABBA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sabba'));

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
  // sidans ingress under rubriken (d3:s metodbeskrivning låg där, 2026-10-26)
  const re3 = /class="hero-desc">([^<]*)</g;
  while((m = re3.exec(kalla)) !== null) ut.push({ falt: 'ingress', text: m[1] });
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
const lastaFalt = {};
function las(fil){
  let kalla = fs.readFileSync(path.join(ROOT, fil), 'utf8');
  // --sabba ledtrad|blind[:delsträng] — målfilen är första filen, eller den första som matchar delsträngen
  const [sabbaTyp, sabbaFil] = (SABBA || '').split(':');
  if(SABBA && fil === (sabbaFil ? OMFANG.find(f => f.indexOf(sabbaFil) >= 0) : OMFANG[0])){
    if(sabbaTyp === 'blind') kalla = '';
    else if(sabbaTyp === 'ledtrad') kalla += "\nrubrik: 'Förenkla uttrycket – tänk på att byta tecken'";
  }
  const set = new Set(), f = falt(kalla);
  lastaFalt[fil] = f.length;
  f.forEach(x => kandidater(x).forEach(k => set.add(k.replace(/\s+/g, ' '))));
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
  const nu = las(fil), godk = new Set(reg[fil] || []), skuld = new Set(KAND_SKULD[fil] || []);
  const nya = nu.filter(k => !godk.has(k) && !skuld.has(k)), borta = [...godk].filter(k => nu.indexOf(k) < 0);
  nu.filter(k => skuld.has(k)).forEach(k => console.log('  ~ SKULD ' + fil + ': "' + k + '" (känd skuld, sidan byggs om)'));
  [...skuld].filter(k => nu.indexOf(k) < 0).forEach(k => console.log('  ⓘ ' + fil + ': känd skuld finns inte längre: "' + k + '" (stryk raden i KAND_SKULD)'));
  // En bladfil utan ett enda läst fält är en blind fil. En sida (html) får sakna intro och ingress.
  if(!lastaFalt[fil] && /\.js$/.test(fil)){ fel++; console.log('✗ ' + fil + ': BLIND — läsaren hittade inga fält, filen mäts inte'); return; }
  nya.forEach(k => { fel++; console.log('✗ ' + fil + ': NY instruktion, inte godkänd: "' + k + '"'); });
  borta.forEach(k => console.log('  ⓘ ' + fil + ': godkänd instruktion finns inte längre: "' + k + '" (städas vid nästa --godkann)'));
  if(!nya.length) console.log('✓ ' + fil + ': ' + nu.length + ' instruktioner, alla godkända (' + lastaFalt[fil] + ' fält lästa)');
});
console.log('\n' + (fel ? '✗ HJÄLPTEXT-GRIND RÖD (' + fel + ')' : '✓ HJÄLPTEXT-GRIND GRÖN'));
process.exit(fel ? 1 : 0);
