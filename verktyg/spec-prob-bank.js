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
     6  testen refererar till uppgifter som finns, och ingen av dem är en åttans uppgift

   Negativ verifiering: --sabba facit (ett facitvärde ändras) och --sabba relation (en relation vänds)
   ska båda fälla specen.

   Kör: node verktyg/spec-prob-bank.js [--sabba facit|relation] */
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
BANK.TEST.forEach(function(te){
  te.uppgifter.forEach(function(ref){
    const u = BANK.uppgift(ref);
    if(!u) fall(te.id, 'okänd uppgift ' + ref);
  });
});

const antal = ids.size;
if(brott.length){
  console.log('✗ spec-prob-bank: ' + brott.length + ' brott (' + antal + ' uppgifter)');
  brott.forEach(function(b){ console.log('   ' + b); });
  process.exit(1);
}
console.log('✓ spec-prob-bank: ' + antal + ' uppgifter — modellens facit = dokumentets facit per ruta, lösningsförslagen rättas rätt, ' + BANK.TEST.length + ' test refererar till banken');
