#!/usr/bin/env node
/* spec-prob-bank.js — vaktar problemlösningsbanken för åk7 (js/motor/problemlosning/prob-bank-ak7.js).

   Banken är FÖRFATTAD: texterna och facit kommer ur Joachims dokument. Facit som eleven rättas mot
   räknas ändå ut av ProbModell ur delar/relationer/villkor. Två källor till samma tal kan glida isär,
   så den här specen kräver att de är lika — per ruta:

     1  ProbModell.granska(u) är tom (uppgiften är entydig och läsbar)
     2  modellens värde per del = dokumentets facit (u.facit), i delarnas ordning
     3  följdfrågan (arean) = dokumentets värde (u.facitFoljd)
     4  modellens eget lösningsförslag rättas som RÄTT av ProbRattare (bladet går att få helt rätt)
     5  formen: fem typer, blad A–D, sex uppgifter per blad, sex varianter per typ, unika id
     6  testen: sex frågor var som Joachim skrev dem, 3.2 med som författat innehåll (ingen nod), facit som
        testdokumentet, Följa instruktion i ekvationsformen
     7  metodträningens källa: varje variant ger Blad A → B → C → D, uppgift nr k på respektive blad
     8  blad efter D (gen-prob-ak7.js): mallens mening oförändrad, samma antal steg, rena tal, rättas rätt,
        seedat; ingen variant utan blad

        personnamnen bytta konsekvent, samma kön, rätt genitiv; A–D orörda
     9  blandade uppgifter (prob-blandade.js): postens form eller tonad med skäl; kön på en fixtur
   Negativ verifiering: --sabba facit | relation | test | rabatt | form | mening | genfacit | namn | genitiv |
   blandade | blandko ska var och en fälla specen.

   Kör: node verktyg/spec-prob-bank.js [--sabba facit|relation|test|rabatt|form|mening|genfacit|namn|genitiv|blandade|blandko]
        [--namnprov]  (skriver ut de genererade bladen med personer) */
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EP = require(path.join(ROOT, 'js/motor/ekvationer-balans/ekv-parser.js'));
global.window = { EkvParser: EP };
const MOD = require(path.join(ROOT, 'js/motor/problemlosning/prob-modell.js'));
global.window.ProbModell = MOD;
const R = require(path.join(ROOT, 'js/motor/problemlosning/prob-rattare.js'));
const BANK = require(path.join(ROOT, 'js/motor/problemlosning/prob-bank-ak7.js'));

const sabba = (process.argv.indexOf('--sabba') > 0) ? process.argv[process.argv.indexOf('--sabba') + 1] : null;
if(sabba === 'facit') BANK.TYPER[2].blad.B[0].facit = [12, 14];
if(sabba === 'relation') BANK.TYPER[3].blad.C[2].relationer = ['A = B + 9'];
if(sabba === 'test') BANK.TEST[0].uppgifter.splice(2, 1);                     // 3.2-frågan borttagen igen
if(sabba === 'rabatt') BANK.TEST[1].uppgifter[4].relationer = ['U = 0,2·V', 'B = 0,55·V'];
if(sabba === 'form') BANK.TYPER[0].blad.B[4].form = undefined;

const brott = [];
function fall(id, vad){ brott.push(id + ': ' + vad); }
const lika = (a, b) => Math.abs(a - b) < 1e-9;

const ids = new Set();
if(BANK.TYPER.length !== 5) fall('banken', 'ska ha fem typer, har ' + BANK.TYPER.length);
BANK.TYPER.forEach(function(t){
  if(!t.varianter || t.varianter.length !== 6) fall(t.id, 'ska ha sex varianter');
  BANK.BOKSTAVER.forEach(function(b){
    const lista = t.blad[b] || [];
    if(lista.length !== 6) fall(t.id + ' blad ' + b, 'ska ha sex uppgifter, har ' + lista.length);
    lista.forEach(function(u){
      if(ids.has(u.id)) fall(u.id, 'id finns två gånger'); ids.add(u.id);
      if(u.nod !== t.nod) fall(u.id, 'fel nod ' + u.nod);
      const g = MOD.granska(u);
      if(g.length){ fall(u.id, 'granska: ' + g.join('; ')); return; }
      const gren = MOD.grenarAv(u)[0], v = MOD.varden(u, gren);
      if(v.fel){ fall(u.id, 'varden: ' + v.fel); return; }
      const nycklar = MOD.nycklarAv(u);
      if(!u.facit || u.facit.length !== nycklar.length) fall(u.id, 'facit ska ha ett värde per del');
      else nycklar.forEach(function(k, i){ if(!lika(v.varden[k], u.facit[i])) fall(u.id, 'del ' + k + ': modellen ger ' + v.varden[k] + ', dokumentet ' + u.facit[i]); });
      if(u.foljdfraga){
        const f = MOD.utvardera(u.foljdfraga.uttryck, v.varden);
        if(!lika(f, u.facitFoljd)) fall(u.id, 'följdfrågan: modellen ger ' + f + ', dokumentet ' + u.facitFoljd);
      }
      // lösningsförslaget ska rättas som rätt (det är så en elev får full pott)
      const lf = MOD.losningsforslag(u);
      if(!lf){ fall(u.id, 'inget lösningsförslag'); return; }
      const rader = [lf.ekvation].concat(lf.kedja);
      const svar = { uttryck: lf.uttryck, rader: rader, insattning: lf.insattning, svar: lf.svar };
      if(u.foljdfraga) svar.foljd = MOD.talStr(MOD.utvardera(u.foljdfraga.uttryck, v.varden)) + ' ' + u.foljdfraga.enhet;
      const res = R.ratta(u, svar);
      if(res.status !== 'ratt') fall(u.id, 'lösningsförslaget rättas ' + res.status + ' i steg ' + res.steg + ' (' + res.besked + ')');
    });
  });
});
// En uppgift: entydig, modellens värden = dokumentets facit, lösningsförslaget rättas rätt.
function provaUppgift(u, utanNod){
  const g = MOD.granska(u).filter(function(f){ return !(utanNod && f === 'nod saknas'); });
  if(g.length){ fall(u.id, 'granska: ' + g.join('; ')); return; }
  const v = MOD.varden(u, MOD.grenarAv(u)[0]);
  if(v.fel){ fall(u.id, 'varden: ' + v.fel); return; }
  MOD.nycklarAv(u).forEach(function(k, i){ if(!lika(v.varden[k], u.facit[i])) fall(u.id, 'del ' + k + ': modellen ger ' + v.varden[k] + ', dokumentet ' + u.facit[i]); });
  const lf = MOD.losningsforslag(u);
  const res = lf && R.ratta(u, { uttryck: lf.uttryck, rader: [lf.ekvation].concat(lf.kedja), insattning: lf.insattning, svar: lf.svar });
  if(!res || res.status !== 'ratt') fall(u.id, 'lösningsförslaget rättas inte rätt');
}

// 6  TESTEN: sex frågor var, som Joachim skrev dem; 3.2 (rabatter) står med som författat testinnehåll
//    (ingen nod), resten är bankens uppgifter. Följa instruktion bär form 'ekvation'.
const TEST_FACIT = { test1: [[13, 22], [32], [400, 280, 240], [42, 44, 46], [56, 112, 86, 106], [80, 100, 65]],
                     test2: [[500, 1000, 700], [65, 25], [73, 75, 77], [32, 20], [2400, 1920, 1320], [12]] };
BANK.TEST.forEach(function(te){
  const tb = BANK.testBlad(te.id);
  if(!tb || tb.uppgifter.length !== 6) fall(te.id, 'ska ha sex frågor, har ' + (tb ? tb.uppgifter.length : 0));
  (tb ? tb.uppgifter : []).forEach(function(u, i){
    if(!u){ fall(te.id, 'fråga ' + (i + 1) + ' finns inte'); return; }
    const forf = (typeof te.uppgifter[i] !== 'string');
    if(forf){ if(u.typ !== 'rabatter' || u.nod !== null) fall(u.id, 'författad testfråga ska vara 3.2 utan nod'); provaUppgift(u, true); }
    if(u.typ === 'instruktion' && u.form !== 'ekvation') fall(u.id, 'Följa instruktion ska lösas som ekvation (form)');
    const f = (TEST_FACIT[te.id] || [])[i];
    if(f && JSON.stringify(u.facit) !== JSON.stringify(f)) fall(te.id + ' fråga ' + (i + 1), 'facit ' + JSON.stringify(u.facit) + ' ≠ testets ' + JSON.stringify(f));
  });
});
const rabatter = BANK.TEST.reduce(function(n, te){ return n + BANK.testBlad(te.id).uppgifter.filter(function(u){ return u && u.typ === 'rabatter'; }).length; }, 0);
if(rabatter !== 2) fall('testen', 'ska bära två 3.2-frågor, bär ' + rabatter);

// 7  METODTRÄNINGENS KÄLLA: varje variant ger fyra instanser A → B → C → D, uppgift nr k på respektive blad.
let varianter = 0;
BANK.TYPER.forEach(function(t){
  t.varianter.forEach(function(v, i){
    const k = BANK.drillKalla(t.id + '/' + (i + 1)); varianter++;
    if(!k){ fall(t.id + '/' + (i + 1), 'ingen källa'); return; }
    if(k.arskurs !== 7) fall(t.id + '/' + (i + 1), 'horisont ' + k.arskurs);
    const ordning = k.instanser.map(function(x){ return x.bokstav; }).join('');
    if(ordning !== 'ABCD') fall(t.id + '/' + (i + 1), 'ordning ' + ordning);
    k.instanser.forEach(function(x){
      const vant = t.blad[x.bokstav][i];
      if(x.blad.uppgifter.length !== 1 || x.blad.uppgifter[0] !== vant) fall(t.id + '/' + (i + 1) + ' ' + x.bokstav, 'fel uppgift');
    });
  });
});
if(BANK.drillKalla('instruktion/7') || BANK.drillKalla('okand/1')) fall('drillKalla', 'okänd referens ska ge null');

// 8  FLER BLAD EFTER D (gen-prob-ak7.js): blad E, F, … per variant. Varje genererat blad ska ha mallens
//    MENING oförändrad (bara talen bytta), samma antal rader i balansmetoden som mallen, heltal där mallen
//    har heltal, facit = modellen, och rättas rätt. Samma blad varje gång (seedat). Ingen variant tom.
//    NAMN (order 2026-11-21): personnamnen byts också — konsekvent inom bladet (en person = ett nytt namn,
//    två personer = två namn), samma kön (meningens han/hon står kvar), rätt genitiv (det NYA namnet böjt:
//    Majas, Elias), inget nytt namn som liknar exemplets. Resten av meningen oförändrad. A–D orörda.
const GEN = require(path.join(ROOT, 'js/motor/problemlosning/gen-prob-ak7.js'));
const GEN_ANTAL = 16;
function utanNamn(s){
  let t = String(s);
  GEN.namnIText(t).slice().reverse().forEach(function(p){
    t = t.slice(0, p.start) + (p.form === 'gen' ? '§s' : (p.form === 'oklar' ? '§?' : '§')) + t.slice(p.slut);
  });
  return t;
}
const skelett = function(s){ return utanNamn(s).replace(/\d{1,3}(?: \d{3})+|\d+(?:,\d+)?/g, '#'); };
const forfattat = JSON.stringify(BANK.TYPER.map(function(t){ return BANK.BOKSTAVER.map(function(b){
  return t.blad[b].map(function(u){ return [u.fraga, u.delar.map(function(d){ return d.namn; })]; }); }); }));
function provaNamn(id, u, mallU){
  const pm = GEN.namnIText(mallU.fraga), pn = GEN.namnIText(u.fraga);
  if(pm.length !== pn.length){ fall(id, 'namnen: ' + pm.length + ' i mallen, ' + pn.length + ' i bladet'); return 0; }
  const karta = {}, info = GEN.namnMall(mallU);
  pm.forEach(function(p, j){
    const q = pn[j], tok = u.fraga.slice(q.start, q.slut);
    if(p.form !== q.form) fall(id, 'namnet "' + tok + '" står i ' + q.form + ', mallen har ' + p.form);
    if(karta.hasOwnProperty(p.namn) && karta[p.namn] !== q.namn) fall(id, p.namn + ' har blivit både ' + karta[p.namn] + ' och ' + q.namn);
    karta[p.namn] = q.namn;
    if(q.form === 'gen' && tok !== GEN.genitiv(q.namn)) fall(id, 'genitiv av ' + q.namn + ' ska vara ' + GEN.genitiv(q.namn) + ', står ' + tok);
    if(q.form === 'nom' && tok !== q.namn) fall(id, 'grundform ' + q.namn + ', står ' + tok);
  });
  const nya = Object.keys(karta).map(function(k){ return karta[k]; });
  if(new Set(nya).size !== nya.length) fall(id, 'två personer har fått samma namn: ' + nya.join(', '));
  let bytta = 0;
  Object.keys(karta).forEach(function(gammal){
    const ny = karta[gammal];
    if(GEN.KON[ny] !== GEN.KON[gammal]) fall(id, gammal + ' → ' + ny + ' byter kön (meningens han/hon står kvar)');
    if(info.oklara.indexOf(gammal) >= 0){ if(ny !== gammal) fall(id, gammal + ' står i en oklar position men har bytts'); return; }
    if(ny === gammal || info.personer.some(function(x){ return x.slice(0, 3).toLowerCase() === ny.slice(0, 3).toLowerCase(); }))
      fall(id, gammal + ' → ' + ny + ': inget nytt namn');
    else bytta++;
  });
  mallU.delar.forEach(function(d, j){
    const vantat = karta.hasOwnProperty(d.namn) ? karta[d.namn] : d.namn;
    if(u.delar[j].namn !== vantat) fall(id, 'delens namn ' + u.delar[j].namn + ', väntat ' + vantat);
  });
  return bytta;
}
let genererade = 0, namnBlad = 0, namnBytta = 0, sabbatNamn = false, sabbatGenitiv = false;
const namnProv = [];
BANK.TYPER.forEach(function(t){
  t.varianter.forEach(function(v, i){
    const ref = t.id + '/' + (i + 1), k = BANK.drillKalla(ref), k2 = BANK.drillKalla(ref);
    let antal = 0, forraNamn = [];
    for(let n = 4; n < 4 + GEN_ANTAL; n++){
      const x = k.nasta(n); if(!x) continue;
      const u = x.blad.uppgifter[0];
      const nyaNamn = Object.keys(u.namnByte || {}).map(function(g){ return u.namnByte[g]; });
      nyaNamn.forEach(function(nm){ if(forraNamn.indexOf(nm) >= 0) fall(ref + ' blad ' + x.bokstav, nm + ' fanns också i bladet före'); });
      forraNamn = nyaNamn;
      if(sabba === 'mening' && n === 4 && i === 0 && t.id === 'instruktion') u.fraga = u.fraga.replace('multiplicerar', 'dividerar');
      if(sabba === 'genfacit' && n === 5 && i === 2 && t.id === 'delar') u.facit = u.facit.map(function(f){ return f + 1; });
      const mallU = t.blad[u.mall][i];
      if(sabba === 'namn' && !sabbatNamn){            // en person byter namn mitt i bladet
        const pn = GEN.namnIText(u.fraga), sista = pn[pn.length - 1];
        if(sista && pn.filter(function(p){ return p.namn === sista.namn; }).length > 1){
          const annat = GEN.NAMN[GEN.KON[sista.namn]].filter(function(x){ return u.fraga.indexOf(x) < 0; })[0];
          u.fraga = u.fraga.slice(0, sista.start) + annat + u.fraga.slice(sista.slut); sabbatNamn = true;
        }
      }
      if(sabba === 'genitiv' && !sabbatGenitiv){       // genitiv-s:et tappat ("Leo mamma")
        const g = GEN.namnIText(u.fraga).filter(function(p){ return p.form === 'gen' && !/[sxz]$/.test(p.namn); })[0];
        if(g){ u.fraga = u.fraga.slice(0, g.start) + g.namn + u.fraga.slice(g.slut); sabbatGenitiv = true; }
      }
      antal++; genererade++;
      const id = ref + ' blad ' + x.bokstav;
      if(x.bokstav !== String.fromCharCode(65 + n)) fall(id, 'bokstaven ska vara ' + String.fromCharCode(65 + n));
      if(skelett(u.fraga) !== skelett(mallU.fraga)) fall(id, 'meningen är ändrad: "' + u.fraga + '"');
      if(['A', 'B', 'C', 'D'].some(function(b){ return t.blad[b][i].fraga === u.fraga; })) fall(id, 'samma text som ett exempel');
      if(GEN.namnMall(mallU).personer.length){
        namnBlad++; const b2 = provaNamn(id, u, mallU); namnBytta += b2;
        if(namnProv.length < 400) namnProv.push(id + ' (mall ' + u.mall + '): ' + u.fraga);
      }
      if(t.form === 'instruktion' && u.form !== 'ekvation') fall(id, 'Följa instruktion ska lösas som ekvation');
      const g = MOD.granska(u); if(g.length){ fall(id, 'granska: ' + g.join('; ')); continue; }
      const vv = MOD.varden(u, MOD.grenarAv(u)[0]);
      MOD.nycklarAv(u).forEach(function(key, j){
        const ref0 = MOD.varden(mallU, MOD.grenarAv(mallU)[0]).varden[key];
        if(!lika(vv.varden[key], u.facit[j])) fall(id, 'facit ' + u.facit[j] + ' ≠ modellen ' + vv.varden[key]);
        if(!(vv.varden[key] > 0)) fall(id, 'del ' + key + ' ≤ 0');
        if(Number.isInteger(ref0) && !Number.isInteger(Math.round(vv.varden[key] * 1e9) / 1e9)) fall(id, 'del ' + key + ' är inget heltal: ' + vv.varden[key]);
      });
      const lf = MOD.losningsforslag(u), lf0 = MOD.losningsforslag(mallU);
      if(!lf || lf.kedja.length !== lf0.kedja.length) fall(id, 'balansmetoden har inte lika många rader som mallen');
      const svar = { uttryck: lf.uttryck, rader: [lf.ekvation].concat(lf.kedja), insattning: lf.insattning, svar: lf.svar };
      if(u.foljdfraga) svar.foljd = MOD.talStr(u.facitFoljd) + ' ' + u.foljdfraga.enhet;
      const res = R.ratta(u, svar);
      if(res.status !== 'ratt') fall(id, 'lösningsförslaget rättas ' + res.status + ' (' + res.besked + ')');
      const y = k2.nasta(n);
      if(!y || y.blad.uppgifter[0].fraga !== u.fraga) fall(id, 'inte samma blad vid ny körning (seed)');
    }
    if(!antal) fall(ref, 'inget blad efter D — varianten bär inte');
  });
});
if(sabba === 'namn' && !sabbatNamn) fall('sabba namn', 'hittade inget blad att sabba');
if(sabba === 'genitiv' && !sabbatGenitiv) fall('sabba genitiv', 'hittade inget blad att sabba');
if(JSON.stringify(BANK.TYPER.map(function(t){ return BANK.BOKSTAVER.map(function(b){
  return t.blad[b].map(function(u){ return [u.fraga, u.delar.map(function(d){ return d.namn; })]; }); }); })) !== forfattat)
  fall('A–D', 'de författade bladen har ändrats av genereringen');
if(!namnBlad) fall('namn', 'inga genererade blad med personer');
if(process.argv.indexOf('--namnprov') > 0) namnProv.forEach(function(s){ console.log(s); });

// 9  BLANDADE UPPGIFTER (prob-blandade.js, order 2026-11-21). Den riktiga posten: håller formen (antal blad,
//    åtta uppgifter, minst en ur varje typ) och varje uppgift rättas som bankens — ELLER står tonad med ett
//    skäl (vantar) så länge Joachims blad inte finns. Komponenten (form + kö) prövas dessutom på en FIXTUR ur
//    bankens egna uppgifter (bara här i specen): ett blad i taget, nästa vid återkomst, ingen repris, stannar
//    efter sista. Negativt: formfel i fixturen ska fångas.
const PB = require(path.join(ROOT, 'js/motor/problemlosning/prob-blandade.js'));
if(sabba === 'blandade') BANK.BLANDADE[1].vantar = null;
if(sabba === 'blandko') PB.aktuellt = function(){ return 0; };   // kön står still: samma blad igen
let blandadeStatus = '';
(function(){
  const cfg = BANK.blandade(1);
  if(!cfg){ fall('blandade', 'nivå 1 saknar konfiguration'); return; }
  if(cfg.nr !== 6 || cfg.kallTyper.join() !== 'instruktion,foljd,delar,omkrets,vinklar') fall('blandade', 'ska vara sjätte posten och spegla de fem typerna');
  PB.granska(cfg).forEach(function(f){ fall('blandade nivå 1', f); });
  if(!cfg.blad.length){
    if(PB.harBlad(cfg)) fall('blandade', 'tom post ska stå tonad');
    blandadeStatus = 'nivå 1 väntar på bladen (' + cfg.vantar + ') — posten tonad';
  } else {
    let n = 0;
    PB.bladen(cfg).forEach(function(b){ b.uppgifter.forEach(function(u){
      if(ids.has(u.id)) fall(u.id, 'id finns redan i banken'); provaUppgift(u); n++;
      if(u.typ === 'instruktion' && u.form !== 'ekvation') fall(u.id, 'Följa instruktion ska lösas som ekvation (form)');
    }); });
    blandadeStatus = 'nivå 1: ' + cfg.blad.length + ' blad, ' + n + ' uppgifter rättas rätt';
  }
  // FIXTUREN: sex blad à åtta uppgifter ur banken, varje typ minst en gång per blad.
  const typer = cfg.kallTyper;
  const fix = Object.assign({}, cfg, { id: 'fixtur', vantar: null, blad: [0, 1, 2, 3, 4, 5].map(function(s){
    const u = typer.map(function(t){ return BANK.typ(t).blad[BANK.BOKSTAVER[s % 4]][s]; })
      .concat([0, 1, 2].map(function(j){ return BANK.typ(typer[(s + j) % 5]).blad[BANK.BOKSTAVER[(s + 1) % 4]][(s + j + 1) % 6]; }));
    return { id: 'f' + (s + 1), uppgifter: u };
  }) });
  PB.granska(fix).forEach(function(f){ fall('blandade fixtur', f); });
  // negativt: sju uppgifter, och ett blad utan vinklar, ska fångas
  const trasig = Object.assign({}, fix, { blad: fix.blad.map(function(b, i){
    return { id: b.id, uppgifter: i === 0 ? b.uppgifter.slice(0, 7) : (i === 1 ? b.uppgifter.map(function(u){ return u.typ === 'vinklar' ? BANK.typ('delar').blad.A[0] : u; }) : b.uppgifter) };
  }) });
  const tf = PB.granska(trasig);
  if(!tf.some(function(f){ return /ska ha 8 uppgifter, har 7/.test(f); }) || !tf.some(function(f){ return /saknar en uppgift ur vinklar/.test(f); }))
    fall('blandade fixtur', 'formfel fångas inte: ' + JSON.stringify(tf));
  // kön: en lagring per elev; varje "återkomst" läser den på nytt
  const minne = { d: {}, getItem: function(k){ return this.d[k] || null; }, setItem: function(k, v){ this.d[k] = v; } };
  const opt = { lagring: minne }, visade = [];
  for(let varv = 0; varv < 8; varv++){
    const i = PB.aktuellt(fix, PB.lasGjorda(fix, opt));
    if(i < 0) break;
    const b = PB.bladen(fix)[i];
    if(visade.indexOf(b.id) >= 0){ fall('blandade kö', 'repris: ' + b.id); break; }
    visade.push(b.id); PB.markeraGjort(fix, b.id, opt);
  }
  if(visade.join() !== 'fixtur-f1,fixtur-f2,fixtur-f3,fixtur-f4,fixtur-f5,fixtur-f6') fall('blandade kö', 'ordning ' + visade.join());
  if(PB.aktuellt(fix, PB.lasGjorda(fix, opt)) !== -1) fall('blandade kö', 'stannar inte efter sjätte');
  if(PB.bladen(fix)[0].titel !== 'Blad 6A · Blandade uppgifter' || PB.bladen(fix)[5].titel !== 'Blad 6F · Blandade uppgifter') fall('blandade', 'bladnamn ' + PB.bladen(fix)[0].titel);
})();

const antal = ids.size;
if(brott.length){
  console.log('✗ spec-prob-bank: ' + brott.length + ' brott (' + antal + ' uppgifter)');
  brott.forEach(function(b){ console.log('   ' + b); });
  process.exit(1);
}
console.log('✓ spec-prob-bank: ' + antal + ' uppgifter — modellens facit = dokumentets facit per ruta, lösningsförslagen rättas rätt; '
  + BANK.TEST.length + ' test à sex frågor (3.2 författad, facit som testdokumentet); ' + varianter + ' varianter A→B→C→D; '
  + genererade + ' genererade blad efter D (mening oförändrad, samma antal steg, rena tal, rättas rätt); '
  + namnBlad + ' av dem med personer, ' + namnBytta + ' namn bytta (konsekvent, samma kön, rätt genitiv); '
  + 'blandade: ' + blandadeStatus + '; komponenten (fixtur 6 × 8): form, kö 6A→6F utan repris, stannar efter sjätte');
