/* blad-k3-d1-metod.js — METODTRÄNINGENS BANKER I DEL 1 (åk 7, k3 Del 1 Algebraiska uttryck): Tolka (T1–T6), Teckna
   (K1–K7) och Räkna (R1–R6). Källa: doc/innehall/k3-d1-metodtraning.md (Joachims banker, facit kontrollräknat). Texten
   ordagrant; "Börja med multiplikationen." står kvar — instruktioner hör hemma i färdighetsträningen (Joachim 2026-11-24).
   Varje bank är ett löv i metodträningens träd (momentsidan) med bank: 'k3d1:<löv>'. Drillen (js/motor/arbetsyta/drill.html; i ramen likadant)
   (js/motor/ovamer/k3-forfattad-kalla.js, källan 'k3d1') serverar en uppgift i taget, i bankens ordning ("Nytt blad" =
   nästa uppgift), ritad med bladkärnan (bygg_blad) och de befintliga uppgiftstyperna (blad-k3-d1-typer.js).
   Bankens gemensamma instruktion ("Para ihop …", "Ringa in …", "Skriv av uttrycket …") står som bladets inledande rad.
   En prislista i uppgiften är prislisteraden (blad.remsa). Mastery: samma noder som bladen. Ingen nätväg. */
(function(){
'use strict';
var T = window.K3D1_TYPER;
if(!T) return;
var TOLKA = T.TOLKA, TECKNA = T.TECKNA, BERAKNA = T.BERAKNA, PRIO = T.PRIO, F = T.F;
var val = T.val, flera = T.flera, flerval = T.flerval, utt = T.utt, talfoljd = T.talfoljd, tallinje = T.tallinje,
    paraIhop = T.paraIhop, berakna = T.berakna, prio = T.prio, sattIn = T.sattIn, enOp = T.enOp, lucka = T.lucka,
    tecken = T.tecken, figur = T.figur;

// En uppgift: rubrik (uppgiftstexten), rader, ev. prislista (varor).
function u(rubrik, rader, varor){ return { rubrik: rubrik, rader: rader, varor: varor || null }; }
function v1(rubrik, alt, ratt, varor){ return u(rubrik, [val('', alt, ratt)], varor); }
function biljetter(){ return figur(F().prislappar({ varor: [{ namn: 'Vuxenbiljett', pris: 'v kr' }, { namn: 'Barnbiljett', pris: 'b kr' }] })); }
function frukt(){ return figur(F().prislappar({ varor: [{ namn: 'Äpple', pris: 'a kr' }, { namn: 'Banan', pris: 'b kr' }] })); }
var PARA = { rubrik: 'Para ihop varje person med rätt mening. Svara med bokstav.' }.rubrik;
function para(rubrik, meningar, par){ return u(rubrik, [paraIhop('', meningar, par)]); }
function ringa(rubrik, tal, ratt){ return u(rubrik, [flerval(tal, ratt)]); }
var RUTAN = { rubrik: 'Vilket tal ska stå i rutan?' }.rubrik;
var TECKNA_IN = { rubrik: 'Sätt in +, − eller · i rutorna så att likheten stämmer.' }.rubrik;
var PARENTES = { rubrik: 'Sätt ut en parentes så att likheten stämmer.' }.rubrik;
var RUTORNA = { rubrik: 'Fyll i uttrycken som ska stå i rutorna.' }.rubrik;
var OMKRETSEN = { fraga: 'Fyll i ett uttryck för omkretsen:' }.fraga;
function velj(rubrik, alt, ratt){ return v1({ rubrik: 'Välj rätt uttryck: ' + rubrik }.rubrik, alt, ratt); }

/* BANKERNA. Byggs när de hämtas (figurerna behöver SvgAlgebraFigur). kat = trädets kategori; nod = mastery. */
var KAT = [ { id: 'T', namn: 'Tolka' }, { id: 'K', namn: 'Teckna' }, { id: 'R', namn: 'Räkna' } ];
var BANK = {};

/* ═════════ TOLKA ═════════ */
BANK.T1 = { kat: 'T', namn: 'Tolka en beräkning med tal', nod: TOLKA, uppg: function(){ return [
  v1('Sara betalar (2 · 12 + 20) kr. Vad har hon köpt?', ['1 bulle och 2 kaffe', '2 bullar och 1 kaffe', '2 kakor och 1 kaffe'], '2 bullar och 1 kaffe',
     [['Bulle', '12 kr'], ['Kaffe', '20 kr'], ['Kaka', '15 kr']]),
  v1('Adam betalar (16 + 3 · 10) kr. Vad har han köpt?', ['1 glass och 3 godis', '3 glassar och 1 godis', '1 glass och 3 läsk'], '1 glass och 3 godis',
     [['Glass', '16 kr'], ['Läsk', '14 kr'], ['Godis', '10 kr']]),
  v1('En bulle kostar 12 kr och en kaffe 20 kr. Ella betalar med en 50-lapp. Beräkningen 50 − 3 · 12 = 14 visar hur mycket hon får tillbaka. Vad har hon köpt?',
     ['3 kaffe', '14 bullar', '3 bullar'], '3 bullar'),
  v1('En kaffe kostar 20 kr. Omar köper kaffe och betalar med en 100-lapp. Beräkningen är 100 − 4 · 20 = 20. Vad betyder talet efter likhetstecknet?',
     ['priset för ett kaffe', 'hur mycket han får tillbaka', 'antalet kaffe'], 'hur mycket han får tillbaka'),
  v1('Familjen betalar (4 · 90 + 2 · 45) kr. Vad har de köpt?', ['2 biljetter och 4 popcorn', '6 biljetter', '4 biljetter och 2 popcorn'], '4 biljetter och 2 popcorn',
     [['Biobiljett', '90 kr'], ['Popcorn', '45 kr']]),
  v1('En pizza kostar 70 kr. Lina betalar med en 500-lapp. Beräkningen är 500 − 5 · 70 = 150. Vad betyder 150?',
     ['hur mycket hon får tillbaka', 'priset för 5 pizzor', 'antalet pizzor'], 'hur mycket hon får tillbaka'),
  v1('Leo betalar (3 · 8 + 2 · 25 + 6) kr. Vad har han köpt?', ['2 pennor, 3 block och 1 sudd', '3 pennor, 2 block och 1 sudd', '3 pennor, 1 block och 2 sudd'],
     '3 pennor, 2 block och 1 sudd', [['Penna', '8 kr'], ['Block', '25 kr'], ['Sudd', '6 kr']]),
  v1('En bussresa kostar 30 kr. Mira laddar sitt busskort med 300 kr. Beräkningen 300 − 7 · 30 = 90 visar något efter 7 resor. Vad betyder 90?',
     ['priset för 7 resor', 'antalet resor', 'pengarna som är kvar på kortet'], 'pengarna som är kvar på kortet'),
  v1('Nils betalar (4 · 5 + 4 · 7) kr. Vad har han köpt?', ['4 äpplen och 4 päron', '8 äpplen', '4 äpplen och 7 päron'], '4 äpplen och 4 päron',
     [['Äpple', '5 kr'], ['Päron', '7 kr']]),
  v1('En korv kostar 22 kr och en dricka 13 kr. Vad kan beräkningen 2 · 22 + 3 · 13 = 83 visa?',
     ['hur mycket man får tillbaka', 'vad 3 korvar och 2 dricka kostar', 'vad 2 korvar och 3 dricka kostar'], 'vad 2 korvar och 3 dricka kostar')
]; } };

BANK.T2 = { kat: 'T', namn: 'Tolka ett uttryck med en variabel', nod: TOLKA, uppg: function(){ return [
  v1('En bulle kostar 12 kr och en kaffe 20 kr. Vad kan uttrycket x · 12 + 20 betyda?', ['x bullar och ett kaffe', '12 bullar och x kaffe', 'en bulle och x kaffe'], 'x bullar och ett kaffe'),
  v1('En bulle kostar 12 kr och en kaffe 20 kr. Vad kan uttrycket 12 + x · 20 betyda?', ['x bullar och ett kaffe', 'en bulle och x kaffe', '12 bullar och 20 kaffe'], 'en bulle och x kaffe'),
  v1('En glass kostar 16 kr. Vad kan uttrycket 100 − 16 · x betyda?',
     ['priset för x glassar', 'antalet glassar man kan köpa för 100 kr', 'hur mycket man får tillbaka när man köper x glassar och betalar med en 100-lapp'],
     'hur mycket man får tillbaka när man köper x glassar och betalar med en 100-lapp'),
  v1('En biobiljett kostar b kr. Vad betyder 4 · b?', ['priset för en biljett', 'priset för 4 biljetter', 'antalet biljetter'], 'priset för 4 biljetter'),
  v1('En taxiresa kostar 50 kr i start och 15 kr per kilometer. Vad kan uttrycket 50 + 15 · k betyda?',
     ['priset för en resa på k kilometer', 'priset för en resa på 15 kilometer', 'hur många kilometer resan är'], 'priset för en resa på k kilometer'),
  v1('Elsa har x kr. Vad betyder x − 35?', ['hur mycket hon har om hon får 35 kr till', 'hur mycket hon har kvar när hon har handlat för 35 kr', '35 gånger så mycket som hon har'],
     'hur mycket hon har kvar när hon har handlat för 35 kr'),
  v1('En ask innehåller x pennor. Vad betyder 6 · x?', ['antalet pennor i 6 askar', 'antalet pennor när man har tagit bort 6', 'antalet pennor i varje ask'], 'antalet pennor i 6 askar'),
  v1('Leo har x kort och delar dem lika med sin bror. Vad betyder x/2?', ['hur många kort de har tillsammans', '2 kort fler än Leo har', 'hur många kort var och en får'],
     'hur många kort var och en får'),
  v1('En pizza kostar 70 kr och en läsk 15 kr. Vad kan uttrycket 70 + x · 15 betyda?', ['x pizzor och en läsk', 'en pizza och x läsk', '70 pizzor och 15 läsk'], 'en pizza och x läsk'),
  v1('En vecka har 7 dagar. Vad kan uttrycket 7 · v + 2 betyda?', ['antalet dagar på v veckor och 2 dagar', 'antalet veckor på v dagar', 'antalet dagar på 2 veckor'],
     'antalet dagar på v veckor och 2 dagar')
]; } };

BANK.T3 = { kat: 'T', namn: 'Tolka ett uttryck med två variabler och "lika många"', nod: TOLKA, uppg: function(){ return [
  v1('En glass kostar 15 kr och en läsk 12 kr. Vad kan uttrycket x · 15 + y · 12 betyda?', ['x läsk och y glassar', 'x glassar och y läsk', '15 glassar och 12 läsk'], 'x glassar och y läsk'),
  v1('En glass kostar 15 kr och en läsk 12 kr. Vad kan uttrycket x · 12 + y · 15 betyda?', ['x läsk och y glassar', 'x glassar och y läsk', '12 läsk och 15 glassar'], 'x läsk och y glassar'),
  v1('En glass kostar 15 kr och en läsk 12 kr. Vad kan uttrycket x · 15 + x · 12 betyda?', ['x glassar och 12 läsk', '15 glassar och 12 läsk', 'lika många glassar som läsk'], 'lika många glassar som läsk'),
  v1('En korv kostar 20 kr och en dricka 10 kr. Vad kan uttrycket x · 20 + x · 10 betyda?', ['lika många korvar som dricka', 'x korvar och 10 dricka', '20 korvar och x dricka'], 'lika många korvar som dricka'),
  u('Vad kan uttrycket 2 · v + 3 · b betyda?', [biljetter(), val('', ['biljetter för 3 vuxna och 2 barn', 'biljetter för 2 vuxna och 3 barn', 'biljetter för 5 vuxna'], 'biljetter för 2 vuxna och 3 barn')]),
  u('Vad kan uttrycket v + 4 · b betyda?', [biljetter(), val('', ['biljetter för 4 vuxna och 1 barn', 'biljetter för 5 barn', 'biljetter för 1 vuxen och 4 barn'], 'biljetter för 1 vuxen och 4 barn')]),
  u('Vad kan uttrycket 3a + 3b betyda?', [frukt(), val('', ['lika många äpplen som bananer, 3 av varje', '3 äpplen och 1 banan', '6 äpplen'], 'lika många äpplen som bananer, 3 av varje')]),
  u('Vad kan uttrycket 5a + 2b betyda?', [frukt(), val('', ['2 äpplen och 5 bananer', '5 äpplen och 2 bananer', '7 bananer'], '5 äpplen och 2 bananer')]),
  v1('En penna kostar p kr och ett block k kr. Vad kan uttrycket 100 − 2 · p − k betyda?',
     ['priset för 2 pennor och ett block', 'hur mycket man får tillbaka när man köper ett block och 2 pennor och betalar med en 100-lapp',
      'hur mycket man får tillbaka när man köper 2 block och en penna och betalar med en 100-lapp'],
     'hur mycket man får tillbaka när man köper ett block och 2 pennor och betalar med en 100-lapp'),
  v1('En glass kostar 15 kr och en läsk 12 kr. Vad kan uttrycket x · 15 + 2 · 12 betyda?', ['x glassar och 2 läsk', '2 glassar och x läsk', 'lika många glassar som läsk'], 'x glassar och 2 läsk')
]; } };

BANK.T4 = { kat: 'T', namn: 'Tolka jämförelser', nod: TOLKA, uppg: function(){ return [
  v1('Vera är x år. Hennes bror Max är (x + 4) år. Vad betyder x + 4?', ['Max är 4 år.', 'Max är 4 år yngre än Vera.', 'Max är 4 år äldre än Vera.'], 'Max är 4 år äldre än Vera.'),
  v1('Pappa är y år. Sonen är (y − 32) år. Vad betyder y − 32?', ['Sonen är 32 år yngre än pappa.', 'Sonen är 32 år.', 'Pappa är 32 år yngre än sonen.'], 'Sonen är 32 år yngre än pappa.'),
  v1('Maja är m år och Hugo är h år. Maja är äldst. Vad betyder m − h?', ['hur gamla de är tillsammans', 'hur mycket äldre Maja är än Hugo', 'hur mycket äldre Hugo är än Maja'], 'hur mycket äldre Maja är än Hugo'),
  v1('Maja är m år och Hugo är h år. Vad betyder m + h?', ['hur gamla de är tillsammans', 'hur mycket äldre Maja är än Hugo', 'Majas ålder om h år'], 'hur gamla de är tillsammans'),
  v1('Farmor är f år. Barnbarnet Elin är f/7 år. Vad betyder f/7?', ['Elin är 7 år yngre än farmor.', 'Elin är en sjundedel så gammal som farmor.', 'Farmor är 7 år.'], 'Elin är en sjundedel så gammal som farmor.'),
  v1('Lisa är x år. Hennes mamma är (3 · x) år. Vad betyder 3 · x?', ['Mamma är 3 år äldre än Lisa.', 'Mamma är 3 år.', 'Mamma är tre gånger så gammal som Lisa.'], 'Mamma är tre gånger så gammal som Lisa.'),
  v1('Ali är a cm lång. Bo är (a − 8) cm lång. Vad betyder a − 8?', ['Bo är 8 cm kortare än Ali.', 'Bo är 8 cm längre än Ali.', 'Bo är 8 cm lång.'], 'Bo är 8 cm kortare än Ali.'),
  v1('I en klass finns p pojkar och f flickor. Vad betyder p + f?', ['hur många fler pojkar än flickor det finns', 'hur många elever det finns i klassen', 'hur många flickor det finns'],
     'hur många elever det finns i klassen'),
  v1('Leo har k kr. Sam har (k + 50) kr. Vad betyder k + 50?', ['Sam har 50 kr.', 'Sam har 50 kr mindre än Leo.', 'Sam har 50 kr mer än Leo.'], 'Sam har 50 kr mer än Leo.'),
  v1('Ella är x år. Vad betyder x + 5?', ['Ellas ålder om 5 år', 'Ellas ålder för 5 år sedan', '5 gånger Ellas ålder'], 'Ellas ålder om 5 år')
]; } };

BANK.T5 = { kat: 'T', namn: 'Para ihop flera uttryck med meningar', nod: TOLKA, intro: PARA, uppg: function(){ return [
  para('Mormor är m år.', ['A. 2 år äldre än mormor', 'B. en sjättedel så gammal som mormor', 'C. 26 år yngre än mormor', 'D. 21 år yngre än mormor'],
       [['Mamma är (m − 26) år.', 'C'], ['Morfar är (m + 2) år.', 'A'], ['Barnbarnet är m/6 år.', 'B'], ['Moster är (m − 21) år.', 'D']]),
  para('Pappa är p år.', ['A. 3 år yngre än pappa', 'B. 30 år äldre än pappa', 'C. 28 år yngre än pappa', 'D. en fjärdedel så gammal som pappa'],
       [['Farfar är (p + 30) år.', 'B'], ['Dottern är p/4 år.', 'D'], ['Mamma är (p − 3) år.', 'A'], ['Sonen är (p − 28) år.', 'C']]),
  para('Läraren Anna är a år.', ['A. 9 år yngre än Anna', 'B. 15 år äldre än Anna', 'C. 36 år yngre än Anna', 'D. 11 år äldre än Anna'],
       [['Kollegan Bo är (a + 11) år.', 'D'], ['Eleven Sam är (a − 36) år.', 'C'], ['Rektorn är (a + 15) år.', 'B'], ['Praktikanten är (a − 9) år.', 'A']]),
  para('Ella har e kr.', ['A. hälften så mycket som Ella', 'B. 15 kr mindre än Ella', 'C. dubbelt så mycket som Ella', 'D. 40 kr mer än Ella'],
       [['Sam har (e + 40) kr.', 'D'], ['Ida har (2 · e) kr.', 'C'], ['Leo har (e − 15) kr.', 'B'], ['Mo har e/2 kr.', 'A']]),
  para('Hugo är h cm lång.', ['A. 6 cm längre än Hugo', 'B. en tredjedel så lång som Hugo', 'C. 45 cm längre än Hugo', 'D. 30 cm kortare än Hugo'],
       [['Pappa är (h + 45) cm.', 'C'], ['Lillasyster är (h − 30) cm.', 'D'], ['Hunden är h/3 cm.', 'B'], ['Brodern är (h + 6) cm.', 'A']]),
  para('Farmor Greta är g år.', ['A. 4 år yngre än Greta', 'B. 29 år yngre än Greta', 'C. 5 år äldre än Greta', 'D. en åttondel så gammal som Greta'],
       [['Farfar är (g + 5) år.', 'C'], ['Pappa är (g − 29) år.', 'B'], ['Barnbarnet är g/8 år.', 'D'], ['Gretas bror är (g − 4) år.', 'A']]),
  para('Kalle har k kulor.', ['A. en fjärdedel så många som Kalle', 'B. 7 färre än Kalle', 'C. tre gånger så många som Kalle', 'D. 12 fler än Kalle'],
       [['Ali har (k + 12) kulor.', 'D'], ['Bea har (3 · k) kulor.', 'C'], ['Cem har (k − 7) kulor.', 'B'], ['Dina har k/4 kulor.', 'A']]),
  para('Mamma Lena är k år.', ['A. 30 år yngre än mamma', 'B. en femtedel så gammal som mamma', 'C. 3 år äldre än mamma', 'D. 24 år äldre än mamma'],
       [['Pappa är (k + 3) år.', 'C'], ['Mormor är (k + 24) år.', 'D'], ['Dottern är k/5 år.', 'B'], ['Sonen är (k − 30) år.', 'A']])
]; } };

BANK.T6 = { kat: 'T', namn: 'Vilka värden kan x ha?', nod: TOLKA, intro: { intro: 'Ringa in alla tal som är möjliga.' }.intro, uppg: function(){ return [
  ringa('Vera är x år. Hennes lillasyster Ines är (x − 5) år. Vilka tal kan x vara?', [2, 4, 6, 11], [6, 11]),
  ringa('Omar är x år. Hans lillebror är (x − 7) år. Vilka tal kan x vara?', [3, 6, 9, 15], [9, 15]),
  ringa('Lisa har x kr. Hon köper en bok för 60 kr och har (x − 60) kr kvar. Vilka tal kan x vara?', [40, 55, 75, 100], [75, 100]),
  ringa('En klass har x elever. 4 elever är sjuka, och (x − 4) elever är i skolan. Vilka tal kan x vara?', [2, 3, 20, 27], [20, 27]),
  ringa('Bo har x kulor. Han ger bort 12 och har (x − 12) kulor kvar. Vilka tal kan x vara?', [5, 10, 15, 30], [15, 30]),
  ringa('Ett band är x cm långt. Man klipper bort 25 cm och har (x − 25) cm kvar. Vilka tal kan x vara?', [20, 24, 30, 50], [30, 50]),
  ringa('Mira är x år. Hennes kusin är (x − 9) år. Vilka tal kan x vara?', [4, 8, 11, 13], [11, 13]),
  ringa('En buss har x platser. 18 platser är upptagna och (x − 18) är lediga. Vilka tal kan x vara?', [12, 15, 40, 52], [40, 52]),
  ringa('Lina har x kr. Hon betalar 45 kr och har (x − 45) kr kvar. Vilka tal kan x vara?', [20, 40, 50, 100], [50, 100]),
  ringa('Ali är x år. Hans syster är (x − 3) år. Vilka tal kan x vara?', [1, 2, 5, 12], [5, 12])
]; } };

/* ═════════ TECKNA ═════════ */
BANK.K1 = { kat: 'K', namn: 'Mer, mindre, gånger och delar', nod: TECKNA, uppg: function(){ return [
  velj('6 mer än x.', ['x + 6', '6x', 'x − 6'], 'x + 6'),
  velj('9 mindre än y.', ['9 − y', 'y − 9', 'y + 9'], 'y − 9'),
  velj('y mindre än 40.', ['y − 40', '40 − y', '40 + y'], '40 − y'),
  velj('5 gånger så mycket som n.', ['n + 5', '5 · n', 'n/5'], '5 · n'),
  velj('en tredjedel av x.', ['3x', 'x − 3', 'x/3'], 'x/3'),
  u('Ella har x kr. Hon får 25 kr till. Fyll i hur mycket hon har nu:', [utt('', 'x + 25', 'x')]),
  u('Ella har x kr. Hon handlar för 18 kr. Fyll i hur mycket hon har kvar:', [utt('', 'x − 18', 'x')]),
  u('Ett tal är a. Fyll i ett uttryck för ett tal som är dubbelt så stort:', [utt('', '2 · a', 'a')]),
  u('x äpplen delas lika mellan 4 personer. Fyll i hur många var och en får:', [utt('', 'x/4', 'x')]),
  u('Ett tal är n. Fyll i ett uttryck för ett tal som är 10 mindre:', [utt('', 'n − 10', 'n')]),
  velj('3 mer än dubbelt så mycket som x.', ['2 · x + 3', '3 · x + 2', 'x + 2 + 3'], '2 · x + 3'),
  velj('7 mindre än hälften av x.', ['x/2 − 7', '7 − x/2', 'x/7 − 2'], 'x/2 − 7')
]; } };

BANK.K2 = { kat: 'K', namn: 'Per styck och växel', nod: TECKNA, uppg: function(){ return [
  u('En glass kostar 14 kr. Fyll i vad x glassar kostar:', [utt('', '14 · x', 'x')]),
  v1('En bussresa kostar 25 kr. Vilket uttryck visar vad r resor kostar?', ['25 + r', '25 · r', 'r − 25'], '25 · r'),
  u('Ett äpple kostar a kr. Fyll i vad 6 äpplen kostar:', [utt('', '6 · a', 'a')]),
  u('En bulle kostar 12 kr och en kaffe 20 kr. Fyll i vad x bullar och ett kaffe kostar:', [utt('', '12 · x + 20', 'x')]),
  v1('Leo köper x läsk för 12 kr styck och betalar med en 100-lapp. Vilket uttryck visar hur mycket han får tillbaka?', ['12 · x − 100', '100 − 12 · x', '100 − x'], '100 − 12 · x'),
  u('En bok kostar 80 kr. Sara köper x böcker och betalar med en 500-lapp. Fyll i hur mycket hon får tillbaka:', [utt('', '500 − 80 · x', 'x')]),
  u('En korv kostar 20 kr och en dricka 10 kr. Fyll i vad x korvar och y dricka kostar:', [utt('', '20 · x + 10 · y', 'xy')]),
  u('En glass kostar g kr och en läsk l kr. Fyll i vad 2 glassar och 3 läsk kostar:', [utt('', '2 · g + 3 · l', 'gl')]),
  u('En vuxenbiljett kostar 120 kr och en barnbiljett 60 kr. Fyll i vad 2 vuxenbiljetter och b barnbiljetter kostar:', [utt('', '2 · 120 + 60 · b', 'b')]),
  v1('En pizza kostar 70 kr och en läsk 15 kr. Familjen köper x pizzor och lika många läsk. Vilket uttryck visar vad det kostar?', ['70 · x + 15 · x', '70 + 15 · x', '85 + x'], '70 · x + 15 · x'),
  u('En penna kostar 8 kr och ett block 25 kr. Mo köper x pennor och y block och betalar med en 200-lapp. Fyll i hur mycket hon får tillbaka:', [utt('', '200 − 8 · x − 25 · y', 'xy')])
]; } };

BANK.K3 = { kat: 'K', namn: 'Start plus förändring', nod: TECKNA, uppg: function(){ return [
  u('Nora har 150 kr. Hon sparar 30 kr i veckan. Fyll i hur mycket hon har efter v veckor:', [utt('', '150 + 30 · v', 'v')]),
  u('Ett ljus är 20 cm långt. Det brinner ner 2 cm i timmen. Fyll i ljusets längd efter t timmar:', [utt('', '20 − 2 · t', 't')]),
  v1('En tunna innehåller 80 liter vatten. Det rinner ut 5 liter i minuten. Vilket uttryck visar hur mycket vatten som finns kvar efter m minuter?',
     ['80 + 5 · m', '80 − 5 · m', '5 · m − 80'], '80 − 5 · m'),
  u('En taxiresa kostar 45 kr i start och 12 kr per kilometer. Fyll i vad en resa på k kilometer kostar:', [utt('', '45 + 12 · k', 'k')]),
  u('Ett år har 12 månader. Fyll i hur många månader a år och 5 månader är:', [utt('', '12 · a + 5', 'a')]),
  u('En timme har 60 minuter. Fyll i hur många minuter t timmar och 15 minuter är:', [utt('', '60 · t + 15', 't')]),
  u('Ett gymkort kostar 200 kr i avgift och sedan 50 kr per besök. Fyll i vad b besök kostar:', [utt('', '200 + 50 · b', 'b')]),
  u('Ett presentkort är värt 500 kr. Ett biobesök kostar 90 kr. Fyll i hur mycket som finns kvar på kortet efter x biobesök:', [utt('', '500 − 90 · x', 'x')]),
  u('En växt är 12 cm hög. Den växer 3 cm i veckan.', [
    utt('Fyll i växtens höjd efter v veckor:', '12 + 3 · v', 'v'),
    berakna('Hur hög är växten efter 5 veckor? Skriv uttrycket med 5 i stället för v och räkna i flera led. Börja med multiplikationen.', '12 + 3 · 5', ['12 + 15'], 27, 'cm')]),
  u('Ett ljus är 30 cm långt. Det brinner ner 3 cm i timmen.', [
    utt('Fyll i ljusets längd efter t timmar:', '30 − 3 · t', 't'),
    berakna('Hur långt är ljuset efter 4 timmar? Skriv uttrycket med 4 i stället för t och räkna i flera led. Börja med multiplikationen.', '30 − 3 · 4', ['30 − 12'], 18, 'cm')])
]; } };

function alder(rubrik, a, b){ return u(rubrik, [utt(a[0], a[1], a[2], a[3] || 'år.'), utt(b[0], b[1], b[2], b[3] || 'år.')]); }
BANK.K4 = { kat: 'K', namn: 'Ålder i flera led', nod: TECKNA, uppg: function(){ return [
  alder('Pappa är y år. Fyll i.', ['Mamma är 2 år yngre än pappa. Hon är', 'y − 2', 'y'], ['Moster är 5 år äldre än mamma. Hon är', 'y − 2 + 5', 'y']),
  alder('Vera är x år. Fyll i.', ['Max är 3 år äldre än Vera. Han är', 'x + 3', 'x'], ['Kusinen är 6 år yngre än Max. Hon är', 'x + 3 − 6', 'x']),
  alder('Mormor är m år. Fyll i.', ['Morfar är 4 år äldre än mormor. Han är', 'm + 4', 'm'], ['Morfars bror är 7 år yngre än morfar. Han är', 'm + 4 − 7', 'm']),
  alder('Lisa är x år. Fyll i.', ['Storasyster är dubbelt så gammal som Lisa. Hon är', '2 · x', 'x'], ['Kusinen är 3 år äldre än storasyster. Hon är', '2 · x + 3', 'x']),
  alder('Pappa är y år. Fyll i.', ['Farfar är 28 år äldre än pappa. Han är', 'y + 28', 'y'], ['Farmor är 2 år yngre än farfar. Hon är', 'y + 28 − 2', 'y']),
  alder('Hugo är h år. Fyll i.', ['Brodern är 4 år yngre än Hugo. Han är', 'h − 4', 'h'], ['Hunden är 9 år yngre än brodern. Den är', 'h − 4 − 9', 'h']),
  alder('Mamma är k år. Fyll i.', ['Pappa är 1 år äldre än mamma. Han är', 'k + 1', 'k'], ['Faster är 6 år yngre än pappa. Hon är', 'k + 1 − 6', 'k']),
  alder('Sam är s år. Fyll i.', ['Mamma är tre gånger så gammal som Sam. Hon är', '3 · s', 's'], ['Pappa är 2 år äldre än mamma. Han är', '3 · s + 2', 's']),
  alder('Ida är x år. Fyll i.', ['Kusinen är 5 år äldre än Ida. Hon är', 'x + 5', 'x'], ['Kusinens mamma är 25 år äldre än kusinen. Hon är', 'x + 5 + 25', 'x']),
  alder('Pappa är y år. Fyll i.', ['Dottern är en fjärdedel så gammal som pappa. Hon är', 'y/4', 'y'], ['Sonen är 3 år äldre än dottern. Han är', 'y/4 + 3', 'y'])
]; } };

function stracka(o){ return figur(F().strackfigur(o)); }
BANK.K5 = { kat: 'K', namn: 'Sträckor och tallinje', nod: TECKNA, uppg: function(){ return [
  u('Vilket uttryck visar hela sträckans längd?', [stracka({ delar: [{ text: 'x cm' }, { text: '6 cm' }, { text: 'x cm' }] }), val('', ['x + 6', 'x + 6 + x', '6x'], 'x + 6 + x')]),
  u('Vilket uttryck visar längden av delen med frågetecknet?', [stracka({ helhet: '30 cm', delar: [{ text: 'x cm' }, {}] }), val('', ['30 + x', 'x − 30', '30 − x'], '30 − x')]),
  u('', [stracka({ delar: [{ text: 'x cm' }, { text: '9 cm' }] }), utt('Fyll i hela sträckans längd:', 'x + 9', 'x', 'cm')]),
  u('', [stracka({ helhet: '50 cm', delar: [{ text: 'x cm' }, {}] }), utt('Fyll i längden av delen med frågetecknet:', '50 − x', 'x', 'cm')]),
  u('', [stracka({ delar: [{ text: 'x cm' }, { text: 'x cm' }, { text: '4 cm' }] }), utt('Fyll i hela sträckans längd:', 'x + x + 4', 'x', 'cm')]),
  u('', [stracka({ helhet: '100 cm', delar: [{ text: 'x cm' }, {}] }), utt('Fyll i längden av delen med frågetecknet:', '100 − x', 'x', 'cm')]),
  u(RUTORNA, [tallinje(7, 2, 1, [[0, 'x − 2'], [5, 'x + 3'], [7, 'x + 5']])]),
  u(RUTORNA, [tallinje(6, 2, 2, [[0, 'x − 4'], [4, 'x + 4'], [6, 'x + 8']])]),
  u(RUTORNA, [tallinje(6, 1, 3, [[0, 'x − 3'], [4, 'x + 9'], [6, 'x + 15']])]),
  u(RUTORNA, [tallinje(5, 1, 10, [[0, 'x − 10'], [3, 'x + 20'], [5, 'x + 40']])])
]; } };

BANK.K6 = { kat: 'K', namn: 'Tal i följd, jämna och udda', nod: TECKNA, uppg: function(){ return [
  u('Tre tal följer varandra. Det minsta är n. Fyll i de två andra.', [talfoljd('', ['n', null, null], [null, 'n + 1', 'n + 2'], 'n')]),
  u('Fyra tal följer varandra. Det minsta är n. Fyll i de tre andra.', [talfoljd('', ['n', null, null, null], [null, 'n + 1', 'n + 2', 'n + 3'], 'n')]),
  u('Tre jämna tal följer varandra. Det minsta är n. Fyll i de två andra.', [talfoljd('', ['n', null, null], [null, 'n + 2', 'n + 4'], 'n')]),
  u('u är ett udda tal. Fyll i nästa udda tal:', [utt('', 'u + 2', 'u')]),
  u('Tre udda tal följer varandra. Det minsta är u. Fyll i de två andra.', [talfoljd('', ['u', null, null], [null, 'u + 2', 'u + 4'], 'u')]),
  u('Ett tal är n. Fyll i talet som kommer direkt före n:', [utt('', 'n − 1', 'n')]),
  u('j är ett jämnt tal. Fyll i det jämna talet som kommer direkt före j:', [utt('', 'j − 2', 'j')]),
  v1('n är ett jämnt tal. Vilket uttryck visar nästa jämna tal?', ['n + 1', 'n + 2', '2n'], 'n + 2'),
  v1('Ett tal är n. Vilket uttryck visar talet som kommer direkt efter?', ['n − 1', 'n + 1', 'n + 2'], 'n + 1'),
  u('Tre tal följer varandra. Det minsta är a. Fyll i de två andra.', [talfoljd('', ['a', null, null], [null, 'a + 1', 'a + 2'], 'a')])
]; } };

BANK.K7 = { kat: 'K', namn: 'Omkrets', nod: TECKNA, uppg: function(){ return [
  u('', [figur(F().triangel({ ben: 'x cm', bas: '6 cm' })), utt(OMKRETSEN, 'x + x + 6', 'x')]),
  u('', [figur(F().rektangel({ bredd: 'x cm', hojd: '5 cm' })), utt(OMKRETSEN, 'x + 5 + x + 5', 'x')]),
  u('', [figur(F().rektangel({ bredd: 's cm', hojd: 's cm', kvadrat: true })), utt(OMKRETSEN, 's + s + s + s', 's')]),
  u('', [figur(F().triangel({ ben: 'a cm', bas: 'a cm', liksidig: true })), utt(OMKRETSEN, 'a + a + a', 'a')]),
  u('', [figur(F().sidtriangel({ sidor: ['x cm', 'x + 2 cm', '7 cm'] })), utt(OMKRETSEN, 'x + x + 2 + 7', 'x')]),
  u('', [figur(F().rektangel({ bredd: 'x + 1 cm', hojd: 'x cm' })),
         flera('Vilka uttryck visar omkretsen? Ringa in alla som stämmer.', ['x + x + 1 + x + x + 1', '4 · x + 2', 'x + x + 1', '2x + 1'], ['x + x + 1 + x + x + 1', '4 · x + 2'])]),
  u('', [figur(F().rektangel({ bredd: 'x + 5 cm', hojd: 'x cm' })), utt(OMKRETSEN, 'x + x + 5 + x + x + 5', 'x')]),
  u('', [figur(F().rektangel({ bredd: 's cm', hojd: '4 cm' })), utt(OMKRETSEN, 's + 4 + s + 4', 's'),
         berakna('Beräkna omkretsen när s = 6 med uttrycket 2 · s + 8. Skriv uttrycket med 6 i stället för s och räkna i flera led. Börja med multiplikationen.', '2 · 6 + 8', ['12 + 8'], 20, 'cm')]),
  u('', [figur(F().triangel({ ben: 'x cm', bas: '9 cm' })), utt(OMKRETSEN, 'x + x + 9', 'x'),
         berakna('Beräkna omkretsen när x = 5. Skriv uttrycket med 5 i stället för x och räkna i flera led.', '5 + 5 + 9', [], 19, 'cm')]),
  u('', [figur(F().rektangel({ bredd: 'x + 3 cm', hojd: 'x cm' })),
         flera('Vilka uttryck visar omkretsen? Ringa in alla som stämmer.', ['4 · x + 6', '2x + 3', 'x + x + 3 + x + x + 3', '4x + 3'], ['4 · x + 6', 'x + x + 3 + x + x + 3']),
         berakna('Beräkna omkretsen när x = 4 med uttrycket 4 · x + 6. Skriv uttrycket med 4 i stället för x och räkna i flera led. Börja med multiplikationen.', '4 · 4 + 6', ['16 + 6'], 22, 'cm')])
]; } };

/* ═════════ RÄKNA ═════════ */
function p1(uttr, led, svar){ return u('', [prio(uttr, led, svar)]); }
BANK.R1 = { kat: 'R', namn: 'Prioriteringsregeln med tal', nod: PRIO, intro: { intro: 'Skriv av uttrycket och räkna i flera led.' }.intro, uppg: function(){ return [
  p1('6 + 5 · 4', ['6 + 20'], 26), p1('8 · 7 − 9', ['56 − 9'], 47), p1('40 − 6 · 5', ['40 − 30'], 10),
  p1('(9 + 3) · 5', ['12 · 5'], 60), p1('(20 − 8) · 3', ['12 · 3'], 36), p1('30/6 + 8', ['5 + 8'], 13),
  p1('15 − 24/4', ['15 − 6'], 9), p1('(7 + 11)/3', ['18/3'], 6), p1('42/(10 − 4)', ['42/6'], 7),
  p1('3 · (4 + 5) + 20/5', ['3 · 9 + 4', '27 + 4'], 31), p1('50 − 4 · (10 − 3) + 18/6', ['50 − 4 · 7 + 3', '50 − 28 + 3'], 25),
  p1('(5 · 12)/4 + (3 · 14)/7', ['60/4 + 42/7', '15 + 6'], 21), p1('4 · 2,5 + 3 · 1,5', ['10 + 4,5'], 14.5), p1('20,5 − 3 · 4,5', ['20,5 − 13,5'], 7)
]; } };

BANK.R2 = { kat: 'R', namn: 'Saknat tal eller tecken', nod: PRIO, uppg: function(){ return [
  u(RUTAN, [lucka('__ + 4 · 6 = 30', 6)]), u(RUTAN, [lucka('5 · __ − 7 = 23', 6)]), u(RUTAN, [lucka('__ · (5 + 2) = 56', 8)]),
  u(RUTAN, [lucka('40 − 3 · __ = 25', 5)]), u(RUTAN, [lucka('__/4 + 3 = 8', 20)]),
  u(TECKNA_IN, [tecken('3 ___ 4 ___ 5 = 23', ['+', '·'])]), u(TECKNA_IN, [tecken('3 ___ 4 ___ 5 = 7', ['·', '−'])]),
  u(TECKNA_IN, [tecken('8 ___ 2 ___ 3 = 14', ['+', '·'])]), u(TECKNA_IN, [tecken('7 ___ 3 ___ 2 = 19', ['·', '−'])]),
  u(PARENTES, [utt('4 + 2 · 6 − 1 = 35', '(4 + 2) · 6 − 1')]), u(PARENTES, [utt('10 − 4 · 2 + 3 = 15', '(10 − 4) · 2 + 3')]),
  u(PARENTES, [utt('2 · 3 + 4 · 5 = 50', '(2 · 3 + 4) · 5')])
]; } };

var SATT_IN = { intro: 'Skriv av uttrycket, sätt in talet och räkna i flera led.' }.intro;
var SATT_IN_TALEN = { intro: 'Skriv av uttrycket, sätt in talen och räkna i flera led.' }.intro;
BANK.R3 = { kat: 'R', namn: 'Sätt in en variabel', nod: BERAKNA, intro: SATT_IN, uppg: function(){ return [
  u('Beräkna x + 14 när x = 6.', [enOp('x + 14', '6 + 14', 20)]),
  u('Beräkna 8x när x = 7.', [enOp('8x', '8 · 7', 56)]),
  u('Beräkna 25 − x när x = 9.', [enOp('25 − x', '25 − 9', 16)]),
  u('Beräkna 4x + 3 när x = 5. Börja med multiplikationen.', [sattIn('4x + 3', '4 · 5 + 3', ['20 + 3'], 23)]),
  u('Beräkna 6y − 8 när y = 4. Börja med multiplikationen.', [sattIn('6y − 8', '6 · 4 − 8', ['24 − 8'], 16)]),
  u('Beräkna 30 − 3a när a = 7. Börja med multiplikationen.', [sattIn('30 − 3a', '30 − 3 · 7', ['30 − 21'], 9)]),
  u('Beräkna 5 + 2x när x = 9. Börja med multiplikationen.', [sattIn('5 + 2x', '5 + 2 · 9', ['5 + 18'], 23)]),
  u('Beräkna 7b − 12 när b = 3. Börja med multiplikationen.', [sattIn('7b − 12', '7 · 3 − 12', ['21 − 12'], 9)]),
  u('Beräkna 100 − 8x när x = 6. Börja med multiplikationen.', [sattIn('100 − 8x', '100 − 8 · 6', ['100 − 48'], 52)]),
  u('Beräkna 2x + 7 när x = 0.', [sattIn('2x + 7', '2 · 0 + 7', ['0 + 7'], 7)]),
  u('Beräkna 9n + 1 när n = 4. Börja med multiplikationen.', [sattIn('9n + 1', '9 · 4 + 1', ['36 + 1'], 37)]),
  u('Beräkna 50 − 5m när m = 8. Börja med multiplikationen.', [sattIn('50 − 5m', '50 − 5 · 8', ['50 − 40'], 10)])
]; } };

BANK.R4 = { kat: 'R', namn: 'Sätt in med bråk och parentes', nod: BERAKNA, intro: SATT_IN, uppg: function(){ return [
  u('Beräkna x/3 + 5 när x = 12.', [sattIn('x/3 + 5', '12/3 + 5', ['4 + 5'], 9)]),
  u('Beräkna 20 − y/2 när y = 8.', [sattIn('20 − y/2', '20 − 8/2', ['20 − 4'], 16)]),
  u('Beräkna (x + 4)/2 när x = 6.', [sattIn('(x + 4)/2', '(6 + 4)/2', ['10/2'], 5)]),
  u('Beräkna 3 · (x + 2) när x = 5.', [sattIn('3 · (x + 2)', '3 · (5 + 2)', ['3 · 7'], 21)]),
  u('Beräkna 4 · (y − 3) när y = 9.', [sattIn('4 · (y − 3)', '4 · (9 − 3)', ['4 · 6'], 24)]),
  u('Beräkna 2 · (a + 5) − 4 när a = 3.', [sattIn('2 · (a + 5) − 4', '2 · (3 + 5) − 4', ['2 · 8 − 4', '16 − 4'], 12)]),
  u('Beräkna 6 + (2x + 1) när x = 4. Räkna först ut parentesen.', [sattIn('6 + (2x + 1)', '6 + (2 · 4 + 1)', ['6 + (8 + 1)', '6 + 9'], 15)]),
  u('Beräkna 30 − (x + 6) när x = 9. Räkna först ut parentesen.', [sattIn('30 − (x + 6)', '30 − (9 + 6)', ['30 − 15'], 15)]),
  u('Beräkna x/4 + 2x när x = 8.', [sattIn('x/4 + 2x', '8/4 + 2 · 8', ['2 + 16'], 18)]),
  u('Beräkna (x − 2)/3 + x när x = 11.', [sattIn('(x − 2)/3 + x', '(11 − 2)/3 + 11', ['9/3 + 11', '3 + 11'], 14)]),
  u('Beräkna (3x − 1) − (x + 2) när x = 5. Räkna först ut parenteserna.', [sattIn('(3x − 1) − (x + 2)', '(3 · 5 − 1) − (5 + 2)', ['(15 − 1) − 7', '14 − 7'], 7)]),
  u('Beräkna 5 · (x − 4) + x/2 när x = 6.', [sattIn('5 · (x − 4) + x/2', '5 · (6 − 4) + 6/2', ['5 · 2 + 3', '10 + 3'], 13)])
]; } };

BANK.R5 = { kat: 'R', namn: 'Sätt in två variabler och decimaltal', nod: BERAKNA, intro: SATT_IN_TALEN, uppg: function(){ return [
  u('Beräkna a + b när a = 6 och b = 9.', [enOp('a + b', '6 + 9', 15)]),
  u('Beräkna 3a + b när a = 4 och b = 5.', [sattIn('3a + b', '3 · 4 + 5', ['12 + 5'], 17)]),
  u('Beräkna 2a − b när a = 7 och b = 3.', [sattIn('2a − b', '2 · 7 − 3', ['14 − 3'], 11)]),
  u('Beräkna 4a + 3b när a = 2 och b = 5.', [sattIn('4a + 3b', '4 · 2 + 3 · 5', ['8 + 15'], 23)]),
  u('Beräkna 5a − 2b när a = 6 och b = 4.', [sattIn('5a − 2b', '5 · 6 − 2 · 4', ['30 − 8'], 22)]),
  u('Beräkna 2x när x = 3,5.', [enOp('2x', '2 · 3,5', 7)]),
  u('Beräkna 4x + 1 när x = 2,5.', [sattIn('4x + 1', '4 · 2,5 + 1', ['10 + 1'], 11)]),
  u('Beräkna 10 − 3x när x = 1,5.', [sattIn('10 − 3x', '10 − 3 · 1,5', ['10 − 4,5'], 5.5)]),
  u('Beräkna 3a + 2b när a = 1,5 och b = 4.', [sattIn('3a + 2b', '3 · 1,5 + 2 · 4', ['4,5 + 8'], 12.5)]),
  u('Beräkna 6x − 2y när x = 2,5 och y = 3.', [sattIn('6x − 2y', '6 · 2,5 − 2 · 3', ['15 − 6'], 9)]),
  u('Beräkna (2x + 3) + (y − 1) när x = 4 och y = 6. Räkna först ut parenteserna.', [sattIn('(2x + 3) + (y − 1)', '(2 · 4 + 3) + (6 − 1)', ['(8 + 3) + 5', '11 + 5'], 16)]),
  u('Beräkna (3a − 4) − (2b + 1) när a = 6 och b = 2. Räkna först ut parenteserna.', [sattIn('(3a − 4) − (2b + 1)', '(3 · 6 − 4) − (2 · 2 + 1)', ['(18 − 4) − (4 + 1)', '14 − 5'], 9)])
]; } };

function xv(rubrik, alt, ratt){ return u(rubrik, [val('', alt, ratt)]); }
BANK.R6 = { kat: 'R', namn: 'Vilket x ger värdet?', nod: BERAKNA, intro: { intro: 'Välj det värde på x som ger uttrycket rätt värde.' }.intro, uppg: function(){ return [
  xv('x + 7 har värdet 15.', ['x = 7', 'x = 8', 'x = 22'], 'x = 8'),
  xv('3x har värdet 27.', ['x = 8', 'x = 9', 'x = 24'], 'x = 9'),
  xv('2x + 5 har värdet 17.', ['x = 6', 'x = 7', 'x = 11'], 'x = 6'),
  xv('4x − 3 har värdet 25.', ['x = 5', 'x = 7', 'x = 22'], 'x = 7'),
  xv('30 − x har värdet 18.', ['x = 12', 'x = 18', 'x = 48'], 'x = 12'),
  xv('20 − 2x har värdet 8.', ['x = 4', 'x = 6', 'x = 12'], 'x = 6'),
  xv('x/2 + 3 har värdet 10.', ['x = 7', 'x = 14', 'x = 20'], 'x = 14'),
  xv('5x + 4 har värdet 39.', ['x = 7', 'x = 8', 'x = 35'], 'x = 7'),
  xv('3 · (x + 2) har värdet 21.', ['x = 5', 'x = 7', 'x = 19'], 'x = 5'),
  xv('50 − 4x har värdet 18.', ['x = 8', 'x = 9', 'x = 32'], 'x = 8')
]; } };

/* ═════════ NYA TAL EFTER BANKEN (KONVENTIONER, METODTRÄNING; Joachim 2026-11-26) ═════════
   Räknelöven R1, R3, R4 och R5: de författade uppgifterna är mallar, och den delade mekanismen (js/motor/ovamer/nya-tal.js,
   via källregistret) ger efter banken nya uppgifter med samma form och nya tal inom bankens band. R2 (saknat tal eller
   tecken) har bara författade uppgifter. Klartexten (k3-d1-metodtraning.md) har inga talregler per löv: bandet är bankens
   minsta–största per roll. Därtill, som i banken: varje beräknat värde är positivt (0 bara ur en faktor 0), har högst
   så många decimaler som mallens tal (divisionen går jämnt), och är inte större än bankens största. En mall med x = 0
   behåller x = 0 (det är uppgiftens poäng).
   AVSKRIFT OCH LED räknas ur den nya uppgiften på samma sätt som bankens facit: först parenteserna (det innersta ett
   räknesteg i taget) och de enkla bråken, sedan alla multiplikationer och divisioner på en gång, sist summan.
   Exempel ur banken: 3 · (4 + 5) + 20/5 → 3 · 9 + 4 → 27 + 4;  (3 · 5 − 1) − (5 + 2) → (15 − 1) − 7 → 14 − 7. */
BANK.R1.regler = {}; BANK.R1.mallTyp = 'prio';
/* Mallens egna talregler (Joachim 2026-11-26): i "(5 · 12)/4 + (3 · 14)/7" väljs nämnaren först och sedan en täljare som
   är en multipel av den, så att divisionen alltid går jämnt inom bandet (delbar i nya-tal.js). */
BANK.R1.delbar = ['(5 · 12)/4 + (3 · 14)/7'];
BANK.R3.regler = {}; BANK.R3.mallTyp = 'satt';
BANK.R4.regler = {}; BANK.R4.mallTyp = 'satt';
BANK.R5.regler = {}; BANK.R5.mallTyp = 'satt';

function talUt(v){ return String(Math.round(v * 1e9) / 1e9).replace('.', ','); }
function decAv(v){ return (String(Math.round(v * 1e9) / 1e9).split('.')[1] || '').length; }
/* Ett räkneuttryck med bara tal: summa = [{ op, f: [{ op, v }] }] där v är { tal } eller { par: summa }. */
function lasRakna(s){
  var t = String(s).match(/\d+(?:,\d+)?|[+\-−·\/()]/g) || [], i = 0;
  function summa(){
    var ut = [{ op: '+', f: term() }];
    while(t[i] === '+' || t[i] === '−' || t[i] === '-'){ var op = t[i++] === '+' ? '+' : '−'; ut.push({ op: op, f: term() }); }
    return ut;
  }
  function term(){
    var ut = [{ op: null, v: faktor() }];
    while(t[i] === '·' || t[i] === '/'){ var op = t[i++]; ut.push({ op: op, v: faktor() }); }
    return ut;
  }
  function faktor(){
    var x = t[i++];
    if(x === '('){ var s2 = summa(); if(t[i++] !== ')') throw new Error('parentes'); return { par: s2 }; }
    if(/^\d/.test(x || '')) return { tal: parseFloat(x.replace(',', '.')) };
    throw new Error('oväntat ' + x);
  }
  var r = summa(); if(i < t.length) throw new Error('rest'); return r;
}
function skrivRakna(s){
  return s.map(function(it, k){
    var ft = it.f.map(function(x, j){
      var v = x.v.par ? '(' + skrivRakna(x.v.par) + ')' : talUt(x.v.tal);
      return j === 0 ? v : (x.op === '·' ? ' · ' : '/') + v;
    }).join('');
    return k === 0 ? ft : ' ' + it.op + ' ' + ft;
  }).join('');
}
function harPar(s){ return s.some(function(it){ return it.f.some(function(x){ return !!x.v.par; }); }); }
function ettTal(s){ return s.length === 1 && s[0].f.length === 1 && !s[0].f[0].v.par ? s[0].f[0].v.tal : null; }
/* ETT STEG. varden samlar varje uträknat värde (för kontrollerna); noll = ett 0 som inte kommer ur en faktor 0. */
function steg(s, varden){
  function termVarde(f){
    var v = f[0].v.tal, harNoll = v === 0;
    for(var j = 1; j < f.length; j++){ harNoll = harNoll || f[j].v.tal === 0; v = f[j].op === '·' ? v * f[j].v.tal : v / f[j].v.tal; }
    v = Math.round(v * 1e9) / 1e9; varden.push({ v: v, ok0: harNoll }); return v;
  }
  function niva(s2){                                    // en nivå utan parenteser: först · och /, sedan summan
    if(s2.some(function(it){ return it.f.length > 1; }))
      return s2.map(function(it){ return { op: it.op, f: it.f.length > 1 ? [{ op: null, v: { tal: termVarde(it.f) } }] : it.f }; });
    var v = 0; s2.forEach(function(it){ v += (it.op === '−' ? -1 : 1) * it.f[0].v.tal; });
    v = Math.round(v * 1e9) / 1e9; varden.push({ v: v, ok0: false });
    return [{ op: '+', f: [{ op: null, v: { tal: v } }] }];
  }
  function parSteg(s2){
    return s2.map(function(it){
      var f = it.f.map(function(x){
        if(!x.v.par) return { op: x.op, v: x.v, gammal: true };
        var inre = harPar(x.v.par) ? parSteg(x.v.par) : niva(x.v.par), t2 = ettTal(inre);
        return { op: x.op, v: t2 !== null ? { tal: t2 } : { par: inre } };
      });
      // Ett enkelt bråk (tal/tal, båda tal redan före steget) räknas i samma steg som parenteserna.
      for(var j = f.length - 1; j >= 1; j--){
        if(f[j].op === '/' && f[j].gammal && f[j - 1].gammal && !f[j].v.par && !f[j - 1].v.par){
          var q = termVarde([{ op: null, v: f[j - 1].v }, { op: '/', v: f[j].v }]);
          f.splice(j - 1, 2, { op: f[j - 1].op, v: { tal: q } });
        }
      }
      return { op: it.op, f: f.map(function(x){ return { op: x.op, v: x.v }; }) };
    });
  }
  return harPar(s) ? parSteg(s) : niva(s);
}
/* LEDEN för ett räkneuttryck: { led: [text …] (utan svaret), svar, varden }. */
function ledAv(text){
  var s = lasRakna(text), led = [], varden = [];
  for(var n = 0; n < 12 && ettTal(s) === null; n++){ s = steg(s, varden); if(ettTal(s) === null) led.push(skrivRakna(s)); }
  return { led: led, svar: ettTal(s), varden: varden };
}
/* AVSKRIFTEN: uttrycket med talen insatta — "4x + 3" och x = 5 → "4 · 5 + 3". */
function avskriftAv(uttryck, x){
  function v(k){ return talUt(typeof x === 'object' ? x[k] : x); }
  return String(uttryck).replace(/(\d)\s*([a-z])/gi, function(_, d, k){ return d + ' · ' + v(k); })
    .replace(/[a-z]/gi, function(k){ return v(k); });
}
// "x = 6", "a = 6 och b = 9" — variablerna i rubrikens ordning.
function narText(x, bokstav){
  if(typeof x !== 'object') return bokstav + ' = ' + talUt(x);
  return Object.keys(x).map(function(k){ return k + ' = ' + talUt(x[k]); }).join(' och ');
}
// Mallen ur en författad uppgift (rubriken bär värdet: "Beräkna 4x + 3 när x = 5. Börja med multiplikationen.").
function mallAv(b, x){
  var rad = x.rader[0];
  if(!rad || rad.typ !== 'prioKedja') return null;
  if(b.mallTyp === 'prio'){
    var mp = { uttryck: rad.vansterText, typ: 'prio', antalLed: rad.facitLed.length };
    if((b.delbar || []).indexOf(rad.vansterText) >= 0) mp.delbar = true;
    return mp;
  }
  var m = /när ((?:[a-z] = \d+(?:,\d+)?(?: och )?)+)\./.exec(x.rubrik); if(!m) return null;
  var par = m[1].split(' och ').map(function(p){ var q = p.split(' = '); return [q[0], parseFloat(q[1].replace(',', '.'))]; });
  var xv = par.length === 1 ? par[0][1] : par.reduce(function(o, p){ o[p[0]] = p[1]; return o; }, {});
  return { uttryck: rad.vansterText, typ: rad.ledFrivilligt ? 'en' : 'satt', x: xv, bokstav: par[0][0], rubrik: x.rubrik, nar: m[1],
           antalLed: rad.facitLed.length };
}
// Högst antal decimaler bland mallens tal och värden.
function mallDec(m){
  var d = (m.uttryck.match(/\d+(?:,\d+)?/g) || []).map(function(t){ return (t.split(',')[1] || '').length; });
  (m.x == null ? [] : typeof m.x === 'object' ? Object.keys(m.x).map(function(k){ return m.x[k]; }) : [m.x]).forEach(function(v){ d.push(decAv(v)); });
  return Math.max.apply(null, d.concat([0]));
}
/* KONTROLLEN (lövets extra): avskrift och led räknas, och den nya uppgiften håller bankens villkor. */
function raknaExtra(maxVarde){
  return function(ny, m){
    var av = m.typ === 'prio' ? ny.uttryck : avskriftAv(ny.uttryck, ny.x), r;
    try { r = ledAv(av); } catch(e){ return false; }
    if(r.svar === null || r.led.length !== m.antalLed) return false;
    var dec = mallDec(m);
    if(r.varden.some(function(x){ return x.v < 0 || (x.v === 0 && !x.ok0) || decAv(x.v) > dec || x.v > maxVarde; })) return false;
    // Gånger eller delat med 1 — i avskriften eller i ett led (6 · (4 − 3) → 6 · 1) — och bråket a/a är andra uppgifter än bankens.
    function aa(t){ return (t.match(/\d+(?:,\d+)?\/\d+(?:,\d+)?/g) || []).some(function(q){ var p = q.split('/'); return p[0] === p[1]; }); }
    if([av].concat(r.led).some(function(t){ return /(^|[^\d,])1 ·|· 1(?![\d,])|\/1(?![\d,])|(^|[^\d,])1\//.test(t) || aa(t); })) return false;
    // Ett svar som är ett heltal i mallen förblir ett heltal (20,5 − 3 · 4,5 = 7).
    if(m.svarV === Math.round(m.svarV) && r.svar !== Math.round(r.svar)) return false;
    ny.avskrift = av; ny.led = r.led; ny.varde = r.svar;
    return true;
  };
}
// Bladet för en ny uppgift ur mallen: samma typ, samma rubrik med de nya talen.
function byggRakna(b){
  return function(ny, m){
    var rader, rubrik = '';
    if(m.typ === 'prio') rader = [prio(ny.uttryck, ny.led, ny.varde)];
    else {
      rubrik = m.rubrik.replace(m.uttryck, ny.uttryck).replace('när ' + m.nar + '.', 'när ' + narText(ny.x, m.bokstav) + '.');
      rader = [m.typ === 'en' ? enOp(ny.uttryck, ny.avskrift, ny.varde) : sattIn(ny.uttryck, ny.avskrift, ny.led, ny.varde)];
    }
    var blad = { titel: b.namn, grupper: [T.g(rubrik, b.nod, rader)] };
    if(b.intro) blad.intro = b.intro;
    return blad;
  };
}

var ORDNING = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6'];
var FORMAGA = { T: 'BEGREPP', K: 'KOMMUNIKATION', R: 'RAKNA' };

/* TRÄDET för momentsidan (Momentsida.metodtraning): rot → Tolka, Teckna, Räkna → löven med bankernas id. */
function trad(){
  return { rot: { id: 'nf-d1', namn: 'Algebraiska uttryck' }, arskursRelevans: { ak7: 'mal' }, arskurs: 'ak7',
    prefKey: 'k3.d1.nyformat.pref.v1', utfalld: ['nf-d1'], rotNamn: 'Algebra', orsakFramtid: 'åk 8',
    kategorier: KAT.map(function(k){
      return { id: 'nf-d1-' + k.id, namn: k.namn, lov: ORDNING.filter(function(id){ return BANK[id].kat === k.id; }).map(function(id){
        return { id: 'nf-d1-' + id, namn: BANK[id].namn, nod: BANK[id].nod, formaga: FORMAGA[k.id], bank: 'k3d1:' + id };
      }) };
    }) };
}

/* DRILLENS KÄLLA (ramens k3-forfattad-kalla.js, källan 'k3d1', referens = lövets id): en uppgift per blad, i bankens
   ordning. Bladet: bankens namn som rubrik, bankens instruktion som inledande rad, uppgiften som enda grupp. */
function bladBokstav(i){ return i < 26 ? String.fromCharCode(65 + i) : String(i + 1); }
function drillKalla(ref){
  var b = BANK[String(ref || '')]; if(!b) return null;
  var uppg = b.uppg();
  var instanser = uppg.map(function(x, i){
    var blad = { titel: b.namn, grupper: [T.g(x.rubrik, b.nod, x.rader)] };
    if(b.intro) blad.intro = b.intro;
    if(x.varor) blad.remsa = T.remsa(x.varor, 1);
    return { bokstav: bladBokstav(i), blad: blad };
  });
  var kalla = { arskurs: 7, titel: b.namn, instanser: instanser,
    rita: function(mount, blad){
      // Ett nytt blad i en ny montering: bygg_blad binder sina lyssnare på monteringen.
      mount.innerHTML = ''; var m = document.createElement('div'); m.className = 'ovn-wrap fk-d1-blad'; mount.appendChild(m);
      window.bygg_blad(m, blad);
      // Knappsatsen visar bladets egna bokstäver (som på uppgiftssidan).
      var kp = document.getElementById('ovn-keypad-shared');
      if(kp && window.AK8_UI && AK8_UI.keypadBokstaver && window.bladBokstaver) AK8_UI.keypadBokstaver(kp, window.bladBokstaver(blad));
    } };
  // Räknelöven: mallarna, bankens största beräknade värde och hur ett nytt blad byggs (nya-tal.js gör resten).
  if(b.regler){
    var mallar = uppg.map(function(x){ return mallAv(b, x); }).filter(Boolean), maxV = 0;
    mallar.forEach(function(m){ var r = ledAv(m.typ === 'prio' ? m.uttryck : avskriftAv(m.uttryck, m.x));
      m.svarV = r.svar; r.varden.forEach(function(x){ maxV = Math.max(maxV, x.v); }); });
    if(mallar.length) kalla.mall = { ref: 'k3d1:' + ref, mallar: mallar, regler: b.regler, extra: raknaExtra(maxV), bygg: byggRakna(b) };
  }
  return kalla;
}

window.BLAD_K3_D1_METOD = { ORDNING: ORDNING, trad: trad, drillKalla: drillKalla,
  // För spec-fuzzen: att bankens egna avskrifter och led följer av samma räkning (BANKEN).
  rakna: { ledAv: ledAv, avskriftAv: avskriftAv, mallAv: function(id, x){ return mallAv(BANK[id], x); } },
  bank: function(id){ var b = BANK[id]; return b ? { id: id, kat: b.kat, namn: b.namn, nod: b.nod, intro: b.intro, uppg: b.uppg() } : null; } };
})();
