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

   Negativ verifiering: --sabba facit | relation | test | rabatt | form ska var och en fälla specen.

   Kör: node verktyg/spec-prob-bank.js [--sabba facit|relation|test|rabatt|form] */
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

const antal = ids.size;
if(brott.length){
  console.log('✗ spec-prob-bank: ' + brott.length + ' brott (' + antal + ' uppgifter)');
  brott.forEach(function(b){ console.log('   ' + b); });
  process.exit(1);
}
console.log('✓ spec-prob-bank: ' + antal + ' uppgifter — modellens facit = dokumentets facit per ruta, lösningsförslagen rättas rätt; '
  + BANK.TEST.length + ' test à sex frågor (3.2 författad, facit som testdokumentet); ' + varianter + ' varianter A→B→C→D');
