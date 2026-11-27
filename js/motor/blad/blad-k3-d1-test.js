/* blad-k3-d1-test.js — TESTEN I DEL 1 (åk 7, k3 Del 1 Algebraiska uttryck): test 1–6.
   Källa: doc/innehall/k3-d1-test.md (Joachims test, kontrollräknade 2026-11-22 och 2026-11-24). Uppgifter, tal och facit
   ordagrant; meningarna "Börja med multiplikationen/multiplikationerna." visas inte (källans ändringsrad). Hakparentesen
   (vilket blad uppgiften liknar) står bara här i kommentaren.
   Varje uppgift byggs med samma komponent som bladet den liknar (blad-k3-d1-typer.js): T = Tolka och teckna (tolka-
   bladens former, beräkningen som flerled med avskrift), P = Prioriteringsregeln (prioKedjan med avskrift, rutan för
   saknat tal, teckenrutan, sätt ut parentes), R = Räkna med uttryck (prioKedjan med avskriften med talet insatt).
   Prislistan överst är prislisteraden (blad.remsa) och följer med genom uppgifterna som använder den.
   Mastery: samma noder som bladen. Öppnas på uppgiftssidan: uppgift.html?test=test1 … test6. Ingen nätväg. */
(function(){
'use strict';
var T = window.K3D1_TYPER;
if(!T) return;
var TOLKA = T.TOLKA, TECKNA = T.TECKNA, BERAKNA = T.BERAKNA, PRIO = T.PRIO, F = T.F;
var g = T.g, val = T.val, flera = T.flera, flerval = T.flerval, utt = T.utt, talfoljd = T.talfoljd, tallinje = T.tallinje,
    paraIhop = T.paraIhop, berakna = T.berakna, prio = T.prio, sattIn = T.sattIn, enOp = T.enOp, lucka = T.lucka,
    tecken = T.tecken, figur = T.figur, remsa = T.remsa;

// Rubriker i fält (elevtext-låset ser bara kända fält). Ordagrant ur testen.
var R = {
  berakna: { rubrik: 'Beräkna.' }.rubrik,
  rutan: { rubrik: 'Vilket tal ska stå i rutan?' }.rubrik,
  likhet: { rubrik: 'Gör så att likheten stämmer. I a och b sätter du in +, − eller · i rutorna. I c sätter du ut en parentes.' }.rubrik,
  valj: { rubrik: 'Välj rätt uttryck.' }.rubrik,
  fyllUtt: { rubrik: 'Fyll i uttrycken.' }.rubrik,
  rutorna: { rubrik: 'Fyll i uttrycken som ska stå i rutorna.' }.rubrik
};
var BETALAR = { fraga: 'Hur mycket betalar hon? Skriv av uttrycket och räkna i flera led.' }.fraga;
var BETALAR_HAN = { fraga: 'Hur mycket betalar han? Skriv av uttrycket och räkna i flera led.' }.fraga;
var OMKRETSEN = { fraga: 'Fyll i ett uttryck för omkretsen:' }.fraga;

var TEST = {};

/* ── TEST 1 ── */
TEST.test1 = function(){ return { titel: 'Test 1',
  remsa: remsa([['Äpple', '6 kr'], ['Banan', '4 kr'], ['Juice', '15 kr'], ['Bulle', '12 kr']], 4),
  grupper: [
    // [tolka och beräkna – T 1A nr 1]
    g('Elsa betalar (3 · 6 + 15) kr.', TOLKA, [
      val('Vad har hon köpt?', ['3 äpplen och 1 juice', '1 äpple och 3 juice', '3 bananer och 1 juice'], '3 äpplen och 1 juice'),
      berakna(BETALAR, '3 · 6 + 15', ['18 + 15'], 33, 'kr') ]),
    // [teckna – T 1A nr 4]
    g('Ali köper x bananer. Vilket uttryck visar vad det kostar?', TECKNA, [ val('', ['x + 4', '4 · x', '4 − x'], '4 · x') ]),
    // [teckna – T 2A nr 7]
    g('Moa är x år. Fyll i uttrycken.', TECKNA, [
      utt('Hennes bror är 2 år äldre. Han är', 'x + 2', 'x', 'år.'),
      utt('Hennes kusin är 3 år yngre. Hon är', 'x − 3', 'x', 'år.'),
      utt('Hennes pappa är tre gånger så gammal. Han är', '3 · x', 'x', 'år.') ]),
    // [tolka – T 1A nr 5]
    g('Vad kan uttrycket x · 12 + 15 betyda?', TOLKA, [ val('', ['x bullar och en juice', '12 bullar och x juice', 'en bulle och x juice'], 'x bullar och en juice') ]),
    // [beräkna – P 1A nr 1–2]
    g(R.berakna, PRIO, [ prio('5 + 4 · 3', ['5 + 12'], 17), prio('30 − 2 · 8', ['30 − 16'], 14), prio('(7 + 3) · 4', ['10 · 4'], 40) ]),
    // [beräkna – P 1A nr 4]
    g(R.rutan, PRIO, [ lucka('__ + 2 · 5 = 16', 6), lucka('4 · __ − 3 = 25', 7), lucka('__ · (3 + 2) = 40', 8) ]),
    // [beräkna – R 1A nr 1–2]
    g('Beräkna uttryckets värde när x = 5.', BERAKNA, [
      enOp('x + 11', '5 + 11', 16), sattIn('4x − 6', '4 · 5 − 6', ['20 − 6'], 14), sattIn('30 − 3x', '30 − 3 · 5', ['30 − 15'], 15) ]),
    // [teckna och beräkna – T 3A nr 7]
    g('', TECKNA, [
      figur(F().rektangel({ bredd: 'x cm', hojd: '4 cm' })),
      utt(OMKRETSEN, 'x + 4 + x + 4', 'x'),
      berakna('Beräkna omkretsen när x = 6 med uttrycket 2 · x + 8.', '2 · 6 + 8', ['12 + 8'], 20, 'cm') ])
  ] }; };

/* ── TEST 2 ── */
TEST.test2 = function(){ return { titel: 'Test 2',
  remsa: remsa([['Korv', '18 kr'], ['Dricka', '10 kr'], ['Glass', '14 kr'], ['Chips', '16 kr']], 2),
  grupper: [
    // [tolka och beräkna – T 1A nr 1]
    g('Oskar betalar (2 · 18 + 10) kr.', TOLKA, [
      val('Vad har han köpt?', ['2 korvar och 1 dricka', '1 korv och 2 dricka', '2 korvar och 2 dricka'], '2 korvar och 1 dricka'),
      berakna(BETALAR_HAN, '2 · 18 + 10', ['36 + 10'], 46, 'kr') ]),
    // [teckna – T 1A nr 6]
    g('Lina köper x glassar och betalar med en 100-lapp. Vilket uttryck visar hur mycket hon får tillbaka?', TECKNA, [
      val('', ['14 · x − 100', '100 − 14 · x', '100 − x'], '100 − 14 · x') ]),
    // [teckna – T 1A nr 7, T 2A nr 4, 6]
    g(R.fyllUtt, TECKNA, [
      utt('En vecka har 7 dagar. x veckor har', '7 · x', 'x', 'dagar.'),
      utt('Ett tal är x. Nästa tal är', 'x + 1', 'x', '.'),
      figur(F().strackfigur({ delar: [{ text: 'x cm' }, { text: '6 cm' }] })),
      utt('Hela sträckan är', 'x + 6', 'x', 'cm.') ]),
    // [tolka – T 2A nr 2]
    g('Ebba är y år. Hennes mamma är (y + 28) år. Vad betyder y + 28?', TOLKA, [
      val('', ['Mamma är 28 år.', 'Mamma är 28 år äldre än Ebba.', 'Ebba är 28 år äldre än mamma.'], 'Mamma är 28 år äldre än Ebba.') ]),
    // [beräkna – P 1A nr 1–2]
    g(R.berakna, PRIO, [ prio('8 · 3 + 6', ['24 + 6'], 30), prio('25 − 4 · 5', ['25 − 20'], 5), prio('(12 − 5) · 3', ['7 · 3'], 21) ]),
    // [beräkna – P 1A nr 3]
    g(R.berakna, PRIO, [ prio('20/5 + 6', ['4 + 6'], 10), prio('9 + 24/8', ['9 + 3'], 12), prio('(10 + 8)/6', ['18/6'], 3) ]),
    // [beräkna – R 1A nr 1–3]
    g('Beräkna uttryckets värde när y = 6.', BERAKNA, [
      enOp('5y', '5 · 6', 30), sattIn('2y + 9', '2 · 6 + 9', ['12 + 9'], 21), sattIn('y/3 + 4', '6/3 + 4', ['2 + 4'], 6) ]),
    // [teckna och beräkna – T 2A nr 8]
    g('', TECKNA, [
      figur(F().triangel({ ben: 'x cm', bas: '5 cm' })),
      utt(OMKRETSEN, 'x + x + 5', 'x'),
      berakna('Beräkna omkretsen när x = 7.', '7 + 7 + 5', [], 19, 'cm') ])
  ] }; };

/* ── TEST 3 ── */
TEST.test3 = function(){ return { titel: 'Test 3',
  remsa: remsa([['Pizza', '65 kr'], ['Sallad', '45 kr'], ['Läsk', '15 kr'], ['Kaffe', '20 kr']], 4),
  grupper: [
    // [tolka och beräkna – T 1B nr 1]
    g('Familjen betalar (2 · 65 + 3 · 15) kr.', TOLKA, [
      val('Vad har de köpt?', ['2 pizzor och 3 läsk', '3 pizzor och 2 läsk', '2 pizzor och 3 sallader'], '2 pizzor och 3 läsk'),
      berakna({ fraga: 'Hur mycket betalar de? Skriv av uttrycket och räkna i flera led.' }.fraga, '2 · 65 + 3 · 15', ['130 + 45'], 175, 'kr') ]),
    // [teckna – T 3A nr 1–2]
    g(R.valj, TECKNA, [
      val('5 mer än x:', ['x + 5', '5x', 'x − 5'], 'x + 5'),
      val('5 mindre än x:', ['5 − x', 'x − 5', 'x + 5'], 'x − 5'),
      val('hälften av x:', ['2x', 'x − 2', 'x/2'], 'x/2') ]),
    // [teckna – T 1A nr 6]
    g('Max köper x läsk och betalar med en 100-lapp. Fyll i ett uttryck för hur mycket han får tillbaka:', TECKNA, [ utt('', '100 − 15 · x', 'x') ]),
    // [tolka – T 1B nr 5]
    g('Vad kan uttrycket x · 65 + y · 20 betyda?', TOLKA, [ val('', ['x pizzor och y kaffe', 'x kaffe och y pizzor', '65 pizzor och 20 kaffe'], 'x pizzor och y kaffe') ]),
    // [beräkna – P 1B nr 1–2]
    g(R.berakna, PRIO, [ prio('6 + 7 · 2', ['6 + 14'], 20), prio('9 · 4 − 11', ['36 − 11'], 25), prio('(15 − 6) · 2', ['9 · 2'], 18) ]),
    // [beräkna – P 1B nr 4]
    g(R.rutan, PRIO, [ lucka('__ + 6 · 3 = 25', 7), lucka('3 · __ − 4 = 20', 8), lucka('__ · (4 + 1) = 45', 9) ]),
    // [beräkna – R 1B nr 1–3]
    g('Beräkna uttryckets värde när x = 8.', BERAKNA, [
      enOp('x − 3', '8 − 3', 5), sattIn('3x + 4', '3 · 8 + 4', ['24 + 4'], 28), sattIn('2 · (x + 2)', '2 · (8 + 2)', ['2 · 10'], 20) ]),
    // [teckna – T 2A nr 5]
    g(R.rutorna, TECKNA, [ tallinje(6, 2, 1, [[0, 'x − 2'], [4, 'x + 2'], [6, 'x + 4']]) ])
  ] }; };

/* ── TEST 4 ── */
TEST.test4 = function(){ return { titel: 'Test 4',
  remsa: remsa([['Bok', '89 kr'], ['Penna', '12 kr'], ['Block', '25 kr'], ['Sudd', '8 kr']], 1),
  grupper: [
    // [teckna och beräkna – T 1B nr 2, 3B nr 6]
    g('Nora köper 3 block och 2 pennor och betalar med en 200-lapp.', TECKNA, [
      val('Vilket uttryck visar hur mycket hon får tillbaka?', ['200 − 3 · 25 − 2 · 12', '200 − 3 · 25 + 2 · 12', '3 · 25 + 2 · 12 − 200'], '200 − 3 · 25 − 2 · 12'),
      berakna({ fraga: 'Hur mycket får hon tillbaka? Skriv av uttrycket och räkna i flera led.' }.fraga, '200 − 3 · 25 − 2 · 12', ['200 − 75 − 24'], 101, 'kr') ]),
    // [tolka – T 3A nr 3]
    g('Pappa Jonas är y år. Para ihop varje person med rätt mening. Svara med bokstav.', TOLKA, [
      paraIhop('', ['A. 2 år yngre än pappa', 'B. en tredjedel så gammal som pappa', 'C. 27 år äldre än pappa', 'D. 30 år yngre än pappa'],
               [['Farmor är (y + 27) år.', 'C'], ['Dottern är (y/3) år.', 'B'], ['Mamma är (y − 2) år.', 'A'], ['Sonen är (y − 30) år.', 'D']]) ]),
    // [teckna – T 3B nr 2]
    g(R.valj, TECKNA, [
      val('4 mer än dubbelt så mycket som x:', ['2 · x + 4', '4 · x + 2', 'x + 2 + 4'], '2 · x + 4'),
      val('x mindre än 30:', ['x − 30', '30 − x', '30 + x'], '30 − x'),
      val('3 mindre än en fjärdedel av x:', ['x/4 − 3', '3 − x/4', 'x/3 − 4'], 'x/4 − 3') ]),
    // [teckna – T 3B nr 5]
    g(R.rutorna, TECKNA, [ tallinje(6, 1, 4, [[0, 'x − 4'], [4, 'x + 12'], [5, 'x + 16']]) ]),
    // [beräkna – P 2A nr 1–2]
    g(R.berakna, PRIO, [
      prio('4 · (6 + 3) + 16/4', ['4 · 9 + 4', '36 + 4'], 40),
      prio('30 − 2 · (9 − 4) + 15/5', ['30 − 2 · 5 + 3', '30 − 10 + 3'], 23),
      prio('(56 − 20)/(2 + 4)', ['36/6'], 6) ]),
    // [beräkna – P 2A nr 3]
    g(R.likhet, PRIO, [ tecken('5 ___ 4 ___ 2 = 18', ['·', '−']), tecken('5 ___ 4 ___ 2 = 13', ['+', '·']), utt('3 + 6 · 4 − 2 = 34', '(3 + 6) · 4 − 2') ]),
    // [beräkna – R 2A nr 1, 5]
    g('Beräkna uttryckets värde när x = 5 och y = 3.', BERAKNA, [
      sattIn('3x + 2y', '3 · 5 + 2 · 3', ['15 + 6'], 21),
      sattIn('4x − 3y', '4 · 5 − 3 · 3', ['20 − 9'], 11),
      sattIn('(2x + 4) − (3y − 1)', '(2 · 5 + 4) − (3 · 3 − 1)', ['(10 + 4) − (9 − 1)', '14 − 8'], 6) ]),
    // [teckna och beräkna – T 3B nr 8]
    g('Ett ljus är 24 cm långt. Det brinner ner 3 cm i timmen.', TECKNA, [
      utt('Fyll i ett uttryck för ljusets längd efter x timmar:', '24 − 3 · x', 'x'),
      berakna('Hur långt är ljuset efter 5 timmar?', '24 − 3 · 5', ['24 − 15'], 9, 'cm') ])
  ] }; };

/* ── TEST 5 ── */
TEST.test5 = function(){ return { titel: 'Test 5',
  remsa: remsa([['Smoothie', '35 kr'], ['Macka', '28 kr'], ['Kaka', '15 kr'], ['Te', '12 kr']], 2),
  grupper: [
    // [tolka – T 1B nr 6]
    g('Vad kan uttrycket x · 28 + x · 12 betyda?', TOLKA, [ val('', ['lika många mackor som te', 'x mackor och 12 te', '28 mackor och x te'], 'lika många mackor som te') ]),
    // [teckna – T 3B nr 6]
    g('Simon köper x mackor och y te och betalar med en 200-lapp. Fyll i ett uttryck för hur mycket han får tillbaka:', TECKNA, [ utt('', '200 − 28 · x − 12 · y', 'xy') ]),
    // [tolka – T 3B nr 3]
    g('Mormor Inga är x år.', TOLKA, [
      paraIhop('Para ihop varje person med rätt mening. Svara med bokstav.',
               ['A. 4 år äldre än mormor', 'B. en femtedel så gammal som mormor', 'C. 25 år yngre än mormor', 'D. 22 år yngre än mormor'],
               [['Mamma är (x − 25) år.', 'C'], ['Morfar är (x + 4) år.', 'A'], ['Barnbarnet är (x/5) år.', 'B'], ['Moster är (x − 22) år.', 'D']]),
      lucka('__ år', 3, 'Hur mycket äldre är moster än mamma?') ]),
    // [tolka – T 3B nr 4]
    g('', TOLKA, [
      figur(F().prislappar({ varor: [{ namn: 'Vuxenbiljett', pris: 'x kr' }, { namn: 'Barnbiljett', pris: 'y kr' }] })),
      val('Vad kan uttrycket 3 · x + 2 · y betyda?', ['biljetter för 3 vuxna och 2 barn', 'biljetter för 2 vuxna och 3 barn', 'biljetter för 5 vuxna'], 'biljetter för 3 vuxna och 2 barn'),
      val('Vad kan uttrycket 2 · y + x betyda?', ['biljetter för 1 vuxen och 2 barn', 'biljetter för 2 vuxna och 1 barn', 'biljetter för 3 barn'], 'biljetter för 1 vuxen och 2 barn') ]),
    // [beräkna – P 2B nr 1, 2, 4]
    g(R.berakna, PRIO, [
      prio('6 · (5 − 2) + 21/7 − 4', ['6 · 3 + 3 − 4', '18 + 3 − 4'], 17),
      prio('(9 · 8)/6 + (5 · 6)/10', ['72/6 + 30/10', '12 + 3'], 15),
      prio('14,5 − 3 · 2,5', ['14,5 − 7,5'], 7) ]),
    // [beräkna – P 2B nr 3]
    g(R.likhet, PRIO, [ tecken('6 ___ 2 ___ 4 = 14', ['+', '·']), tecken('6 ___ 2 ___ 4 = 16', ['·', '+']), utt('8 − 2 · 3 + 1 = 19', '(8 − 2) · 3 + 1') ]),
    // [beräkna – R 2A nr 3, R 1A nr 5]
    g('Beräkna uttryckets värde när x = 7.', BERAKNA, [
      sattIn('(x + 5)/4 + x', '(7 + 5)/4 + 7', ['12/4 + 7', '3 + 7'], 10),
      sattIn('3 · (x − 2) − 6', '3 · (7 − 2) − 6', ['3 · 5 − 6', '15 − 6'], 9),
      sattIn('50 − (4x + 2)', '50 − (4 · 7 + 2)', ['50 − (28 + 2)', '50 − 30'], 20) ]),
    // [teckna och beräkna – T 2B nr 8]
    g('', TECKNA, [
      figur(F().rektangel({ bredd: 'x + 3 cm', hojd: 'x cm' })),
      flera('Vilka uttryck visar omkretsen? Ringa in alla som stämmer.', ['x + x + 3 + x + x + 3', '4 · x + 6', 'x + x + 3', '2x + 3'],
            ['x + x + 3 + x + x + 3', '4 · x + 6']),
      berakna('Beräkna omkretsen när x = 5 med uttrycket 4 · x + 6.', '4 · 5 + 6', ['20 + 6'], 26, 'cm', '4 · x + 6') ])
  ] }; };

/* ── TEST 6 ── */
TEST.test6 = function(){ return { titel: 'Test 6',
  remsa: remsa([['Kaffe', '25 kr'], ['Bulle', '18 kr'], ['Smörgås', '45 kr'], ['Juice', '22 kr']], 1),
  grupper: [
    // [tolka och beräkna – T 1B nr 1]
    g('Leo betalar (2 · 45 + 3 · 18 + 25) kr.', TOLKA, [
      val('Vad har han köpt?', ['2 smörgåsar, 3 bullar och 1 kaffe', '3 smörgåsar, 2 bullar och 1 kaffe', '2 smörgåsar, 3 kaffe och 1 bulle'], '2 smörgåsar, 3 bullar och 1 kaffe'),
      berakna(BETALAR_HAN, '2 · 45 + 3 · 18 + 25', ['90 + 54 + 25'], 169, 'kr') ]),
    // [teckna – T 2B nr 6]
    g({ rubrik: 'Fyll i.' }.rubrik, TECKNA, [
      talfoljd('Tre jämna tal följer varandra. Det minsta är x.', ['x', null, null], [null, 'x + 2', 'x + 4'], 'x'),
      utt('x är ett udda tal. Nästa udda tal är', 'x + 2', 'x', '.'),
      talfoljd('Tre tal följer varandra. Det största är x.', [null, null, 'x'], ['x − 2', 'x − 1', null], 'x') ]),
    // [tolka – T 2A nr 3]
    g('Vera är x år. Hennes lillasyster Ines är (x − 6) år. Vilka tal kan x vara? Ringa in alla som är möjliga.', TOLKA, [ flerval([3, 5, 8, 14], [8, 14]) ]),
    // [teckna – T 2B nr 7]
    g('Pappa är y år. Fyll i uttrycken.', TECKNA, [
      utt('Mamma är 4 år yngre än pappa. Hon är', 'y − 4', 'y', 'år.'),
      utt('Farmor är dubbelt så gammal som pappa. Hon är', '2 · y', 'y', 'år.'),
      utt('Lillebror är en sjättedel så gammal som pappa. Han är', 'y/6', 'y', 'år.'),
      utt('Moster är 7 år äldre än mamma. Hon är', 'y − 4 + 7', 'y', 'år.') ]),
    // [beräkna – P 2A nr 1, 2, 4]
    g(R.berakna, PRIO, [
      prio('3 · (12 − 4) − 36/9 + 5', ['3 · 8 − 4 + 5', '24 − 4 + 5'], 25),
      prio('(63 − 15)/(4 + 4)', ['48/8'], 6),
      prio('6 · 2,5 + 1,5 · 10 − 4,5', ['15 + 15 − 4,5'], 25.5) ]),
    // [beräkna – R 2A nr 4]
    g('Vilket värde på x ger uttrycket rätt värde? Välj.', BERAKNA, [
      val({ fraga: '5x − 4 har värdet 31.' }.fraga, ['x = 6', 'x = 7', 'x = 8'], 'x = 7'),
      val({ fraga: '40 − 3x har värdet 16.' }.fraga, ['x = 6', 'x = 8', 'x = 12'], 'x = 8'),
      val({ fraga: 'x/3 + 5 har värdet 9.' }.fraga, ['x = 4', 'x = 12', 'x = 14'], 'x = 12') ]),
    // [beräkna – R 2B nr 1, 2, 5]
    g('Beräkna uttryckets värde när x = 4 och y = 1,5.', BERAKNA, [
      sattIn('3x + 2y', '3 · 4 + 2 · 1,5', ['12 + 3'], 15),
      sattIn('(5x − 3) − (2y + 4)', '(5 · 4 − 3) − (2 · 1,5 + 4)', ['(20 − 3) − (3 + 4)', '17 − 7'], 10),
      sattIn('(x + 8)/3 + 2y', '(4 + 8)/3 + 2 · 1,5', ['12/3 + 3', '4 + 3'], 7) ]),
    // [teckna och beräkna – T 3A nr 8]
    g('Nora har 120 kr. Hon sparar 35 kr i veckan.', TECKNA, [
      utt('Fyll i ett uttryck för hur mycket hon har efter x veckor:', '120 + 35 · x', 'x'),
      berakna('Hur mycket har hon efter 8 veckor?', '120 + 35 · 8', ['120 + 280'], 400, 'kr') ])
  ] }; };

var TESTER = [1, 2, 3, 4, 5, 6].map(function(n){ return { id: 'test' + n, titel: 'Test ' + n }; });

window.BLAD_K3_D1_TEST = {
  TESTER: TESTER,
  test: function(id){ var f = TEST[String(id || '')]; return f ? f() : null; },
  idn: function(){ return Object.keys(TEST); }
};
})();
