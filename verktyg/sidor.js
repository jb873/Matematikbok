/* sidor.js — EN upptäckare av elevens sidor, för alla svep och grindar.
 *
 * Varför filen finns (V9 i de delade plattformsreglerna, doc/KONVENTIONER.md):
 *   "Nya sidor måste in i grindarnas listor — annars växer material utanför mätningen."
 * Grindarnas sidlistor var förut handskrivna arrayer på två ställen och fyra ordagranna
 * kopior av samma readdir-funktion på fyra andra. En kopia driver isär: Mönster-bladet
 * mättes inte av nämnar- och flerruts-grinden förrän någon mindes att lägga till det
 * (108 -> 110 blad). Den sortens regel ska inte bäras av minne.
 *
 * Här finns mängderna EN gång, och de LETAS UPP PÅ DISK. En ny sida kommer in av sig själv.
 *
 *   alla()   — sanningsmängden: varje .html under ak7/ ak8/ ak9/ som laddar en bladmotor.
 *              Det är den mängd V9 mäts mot.
 *   blad()   — det svepen öppnar: delkapitlens index.html + åttans k1-blad + nians öva-blad.
 *   allaHtml() — varje .html i repot utom Arkiv (tonad-svepet mäter CSS, inte blad).
 *
 * En bladsida känns igen på TVÅ sätt, och mängden är unionen — se noten vid MOTOR. Det andra
 * sättet (allt i bladmapparna utom namngivna undantag) gör att en NY motor kommer in av sig
 * själv, utan att någon måste minnas att utöka ett mönster. Att undantagen är sanna, och att
 * ingen motorfil står oladdad, prövas av verktyg/sidlist-grind.js (benet MOTORER).
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

/* Två vägar att känna igen en bladsida, och sanningsmängden är UNIONEN. Mätt 2026-10-01:
   mönstret alleni ger 38 sidor, mappen alleni 35 — och de 35 är inte en delmängd. Tre sidor
   (ak7/k3/d4-ekvationer, två av nians) bär sin motor inline eller via en modul utanför
   bladmapparna, och syns bara för mönstret. Elva motorfiler (sjuans blad-k1-d*, blad-ak8-alg1,
   blad-ak8-kvrot) står utanför mönstret och syns bara för mappen. Att välja en av vägarna hade
   tappat sidor åt ena eller andra hållet. */
const MOTOR = /blad-karna|ak8-blad-ui|blad-k2-d|blad-k3-d|blad-ak8-d|ProbBlad|AK9_OVA/;
const MOTORMAPP = ['js/motor/blad', 'js/motor/problemlosning', 'js/motor/ekvationer-balans'];

/* Filer i motormapparna som INTE är bladmotorer. Varje rad är ett påstående med skäl, och
   sidlist-grinden prövar att påståendet håller. Allt annat i mapparna räknas som motor — så en
   ny motor kommer in av sig själv i stället för att behöva skrivas in i ett mönster.

   OBS att listan svarar på EN fråga: "definierar filen ett blad?" Den svarar INTE på frågan
   "visar det att sidan har rutor om filen laddas?" — de är olika. `ak8-blad-ui.js` är inget
   blad, men en sida som laddar det delade rut-UI:t HAR rutor, och därför står den kvar i
   MOTOR-mönstret. Mätt 2026-10-01: tas den ur mönstret tappas nians fördjupningssida, som
   bygger sin bladyta inline med `AK8_UI.keypadHTML` utan en egen motorfil. Den som läser
   detta som en motsägelse läser två frågor som en. */
const EJ_MOTOR = {
  'delkapitel-skal.js': 'flikskalet (flikar, band, underflikar) — definierar inget blad',
  'ak8-blad-ui.js': 'delat rut-UI (keypad, grow, markeraRutor) — definierar inget blad, men dess närvaro visar att sidan har rutor'
};

const HOPPA = new Set(['Arkiv', '.git', 'node_modules', 'fonts', 'mallar']);

function rel(p){ return path.relative(ROOT, p).replace(/\\/g, '/'); }

function htmlUnder(start){
  const ut = [];
  (function ga(d){
    if(!fs.existsSync(d)) return;
    for(const e of fs.readdirSync(d, { withFileTypes: true })){
      if(HOPPA.has(e.name)) continue;
      const p = path.join(d, e.name);
      if(e.isDirectory()) ga(p);
      else if(/\.html$/.test(e.name)) ut.push(p);
    }
  })(start);
  return ut;
}

/* Motorfilerna: allt i bladmapparna som inte uttryckligen är undantaget. */
function motorfiler(){
  const ut = [];
  MOTORMAPP.forEach(d => {
    const abs = path.join(ROOT, d);
    if(!fs.existsSync(abs)) return;
    fs.readdirSync(abs).filter(f => /\.js$/.test(f) && !EJ_MOTOR[f]).forEach(f => ut.push({ mapp: d, fil: f }));
  });
  return ut;
}

/* Sanningsmängden: sidor med en bladmotor, sedd BÅDA vägarna (se noten vid MOTOR).
   Mäter innehållet i filen, inte var den ligger — en bladsida i en ny mapp hittas ändå. */
function alla(){
  const motorer = motorfiler().map(m => '/' + m.fil);
  const ut = [];
  ['ak7', 'ak8', 'ak9'].forEach(a => htmlUnder(path.join(ROOT, a)).forEach(p => {
    const s = fs.readFileSync(p, 'utf8');
    if(MOTOR.test(s) || motorer.some(f => s.indexOf(f) >= 0)) ut.push(rel(p));
  }));
  return ut.sort();
}

/* Det svepen öppnar. Samma form som de fyra kopiorna hade, men utan att räkna upp sidorna:
   delkapitelmapparnas index.html, plus de kapitel som lägger bladen som egna filer. */
function blad(){
  const ut = [];
  ['ak7/k1', 'ak7/k2', 'ak7/k3', 'ak8/k2'].forEach(kap => {
    const d = path.join(ROOT, kap);
    if(!fs.existsSync(d)) return;
    fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory() && !HOPPA.has(e.name)).forEach(e => {
      const p = path.join(d, e.name, 'index.html');
      if(fs.existsSync(p)) ut.push(rel(p));
    });
  });
  ['ak8/k1', 'ak9/k1'].forEach(kap => {
    const d = path.join(ROOT, kap);
    if(!fs.existsSync(d)) return;
    fs.readdirSync(d).filter(f => /\.html$/.test(f) && f !== 'index.html').forEach(f => ut.push(kap + '/' + f));
  });
  return ut.sort();
}

function allaHtml(){ return htmlUnder(ROOT).map(rel).sort(); }

/* --lista i varje verktyg: skriver verktygets egen sidmängd och slutar. Det är så
   sidlist-grinden läser mängden — ur verktygets egen kod, inte ur dess källtext. */
function lista(args, mangd){
  if(!args.includes('--lista')) return false;
  console.log(mangd.join('\n'));
  return true;
}

module.exports = { alla, blad, allaHtml, lista, motorfiler, MOTOR, MOTORMAPP, EJ_MOTOR, ROOT };

if(require.main === module){
  const a = process.argv.slice(2);
  const m = a.includes('--blad') ? blad() : a.includes('--html') ? allaHtml() : alla();
  console.log(m.join('\n'));
}
