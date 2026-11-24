/* blad-k3-d1-tolka.js — MOMENTET "TOLKA OCH TECKNA UTTRYCK" (åk 7, k3 Del 1 Algebraiska uttryck): blad 1A–3B.
   Källa: Joachims dokument "Tolka och teckna uttryck åk 7 – uppgiftsblad, version 2" (doc/innehall/k3-d1-tolka-och-teckna.md).
   Frågetexter, tal och facit ordagrant, utom meningen "Börja med multiplikationen." (inga hjälptexter i öva, Joachim
   2026-11-24); förlagan [inom hakparentes] står bara här i kommentaren, aldrig för eleven. Figurtexten (inom
   parentes i dokumentet) visas inte — figuren ritas (js/motor/figur/svg-algebrafigur.js).
   Bladen ritas av bladkärnan (blad-karna-b.js, bygg_blad) på uppgiftssidan ak7/k3/d1-algebraiska-uttryck-nyformat/uppgift.html.
   Mastery: varje uppgift loggar till sin kategori (ordern §6) i MasteryK3 (k3.algebra.mastery.v1):
     tolka → alg-tolka:begrepp · teckna → alg-skriva:kommunikation · beräkna → alg-berakna:rakna
   Uppgifter med både teckna/tolka och beräkna: a-delen loggar som gruppen, b-delen (beräkningen) till beräkna.
   Svar: likvärdiga uttryck godkänns överallt (kärnans uttrycksrättning, jamforFler); beräkningarna rättas på
   form led för led (avskriftsrutan + flerled). Ingen nätväg. */
(function(){
'use strict';
var TOLKA = 'alg-tolka:begrepp', TECKNA = 'alg-skriva:kommunikation', BERAKNA = 'alg-berakna:rakna';
function F(){ return window.SvgAlgebraFigur; }
function g(rubrik, nod, rader){ return { rubrik: rubrik, logg: nod, loggStore: 'k3', rader: rader }; }
function val(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: [].concat(ratt) }; }
function flera(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: ratt, flera: true }; }
function utt(fraga, svar, vars, efter){ var r = { typ: 'uttryck', fraga: fraga, svar: svar }; if(vars) r.vars = vars; if(efter !== undefined) r.efter = efter; return r; }
// Beräkningen: eleven skriver av uttrycket med talet insatt (avskriftsrutan) och räknar i flera led; varje led på form.
function berakna(fraga, avskrift, led, svar, enhet){
  return { typ: 'flerled', logg: BERAKNA, fraga: fraga, avskrift: { visa: avskrift },
           led: led.map(function(l){ return { visa: l }; }).concat([{ svar: svar }]), enhet: enhet };
}
function figur(svg){ return { typ: 'svgfigur', svg: svg }; }
function streck(n){ var s = []; for(var i = 0; i <= n; i++) s.push({ v: i }); return s; }
function tallinje(n, x, steg, rutor){
  var s = streck(n); s[x].etikett = 'x'; s[x + 1].etikett = 'x + ' + steg;
  return { typ: 'tallinje', min: -0.5, max: n + 0.5, streck: s, vars: 'x',
           rutor: rutor.map(function(r){ return { v: r[0], svar: r[1] }; }) };
}
// Para ihop (kärnans radtyp paraihop): EN deluppgift. Meningarna A–D under varandra, sedan varje person med
// bokstavsknapparna; par = [[fråga, rätt bokstav], …].
var ABCD = ['A', 'B', 'C', 'D'];
function paraIhop(fraga, meningar, par){
  return { typ: 'paraihop', fraga: fraga, meningar: meningar, alt: ABCD, par: par.map(function(x){ return { fraga: x[0], ratt: x[1] }; }) };
}
function prislista(varor){
  // Fyra lappar på rad är bredare än figurernas tak (.af-svg max 300 px) — då blev texten oläsligt liten.
  // Prislistan får sin naturliga bredd (viewBox), aldrig mer.
  var svg = F().prislappar({ varor: varor.map(function(v){ return { namn: v[0], pris: v[1] }; }) });
  var w = (/viewBox="0 0 (\d+)/.exec(svg) || [])[1];
  if(w) svg = svg.replace('<svg class="af-svg"', '<svg class="af-svg" style="max-width:' + w + 'px"');
  return '<div class="alg-bild">' + svg + '</div>'
    + '<div style="margin-top:8px;">Använd prislistan.</div>';
}
// Uppgiftsdokumentets fält (KONVENTIONER "UPPGIFTSDOKUMENT (ett per blad)"; ordern §2).
function dok(blad, roll, tak){
  return { del: 'Del 1 Algebraiska uttryck', moment: 'Tolka och teckna uttryck', blad: blad, arskurs: 7, roll: roll,
           metod: 'Tolka och teckna uttryck',
           takregel: tak + ' (golv = blad 1 och 2, tak = blad 3). Inga parenteser att räkna med och ingen variabel gånger variabel (åk 7).',
           antal: '~80 % rätt för att gå vidare till nästa blad' };
}

var BLAD = {};

/* ── BLAD 1A – Per styck och per gång ── */
BLAD['1A'] = function(){ return { titel: 'Per styck och per gång', dokument: dok('1A', 'kärna', 'golv'),
  exempel: prislista([['Smörgås', '25 kr'], ['Bulle', '10 kr'], ['Mjölk', '8 kr'], ['Saft', '12 kr']]),
  grupper: [
    // [tolka och beräkna – mall 1]
    g('Ida betalar (2 · 10 + 8) kr.', TOLKA, [
      val('Vad har hon köpt?', ['2 bullar och 1 mjölk', '1 bulle och 2 mjölk', '2 smörgåsar och 1 mjölk'], '2 bullar och 1 mjölk'),
      berakna('Hur mycket betalar hon? Skriv av uttrycket och räkna i flera led.', '2 · 10 + 8', ['20 + 8'], 28, 'kr')
    ]),
    // [tolka – mall 2]
    g('Omar betalar med en 50-lapp. Beräkningen 50 − 3 · 12 = 14 visar hur mycket han får tillbaka. Vad har han köpt?', TOLKA, [
      val('', ['3 saft', '12 saft', '3 mjölk'], '3 saft')
    ]),
    // [teckna – mall 3]
    g('Fyll i ett uttryck för vad det kostar.', TECKNA, [
      utt('en smörgås och en saft:', '25 + 12'),
      utt('4 bullar och 2 mjölk:', '4 · 10 + 2 · 8')
    ]),
    // [teckna – mall 12a]
    g('Ella köper x bullar. Vilket uttryck visar vad det kostar?', TECKNA, [
      val('', ['x + 10', '10 · x', '10 − x'], '10 · x')
    ]),
    // [tolka – mall 11]
    g('Vad kan uttrycket x · 25 + 12 betyda?', TOLKA, [
      val('', ['x smörgåsar och en saft', '25 smörgåsar och x saft', 'en smörgås och x saft'], 'x smörgåsar och en saft')
    ]),
    // [teckna – mall 10, 12c]
    g('Ella betalar för sina x bullar med en 100-lapp. Fyll i ett uttryck för hur mycket hon får tillbaka.', TECKNA, [
      utt('', '100 − 10 · x', 'x')
    ]),
    // [teckna – II 25]
    g('En vecka har 7 dagar. Fyll i ett uttryck.', TECKNA, [
      utt('v veckor har', '7 · v', 'v', 'dagar.'),
      utt('v veckor och 3 dagar är', '7 · v + 3', 'v', 'dagar.')
    ]),
    // [teckna – HH 623]
    g('En höna har 2 ben och ett får har 4 ben. Fyll i ett uttryck för hur många ben det finns.', TECKNA, [
      utt('h höns:', '2 · h', 'h'),
      utt('f får:', '4 · f', 'f')
    ])
  ] }; };

/* ── BLAD 1B – Per styck och per gång ── */
BLAD['1B'] = function(){ return { titel: 'Per styck och per gång', dokument: dok('1B', 'kärna', 'golv'),
  exempel: prislista([['Korv', '20 kr'], ['Glass', '15 kr'], ['Chips', '18 kr'], ['Läsk', '12 kr']]),
  grupper: [
    // [tolka och beräkna – mall 1]
    g('Noah betalar (20 + 2 · 15 + 18) kr.', TOLKA, [
      val('Vad har han köpt?', ['en korv, två glassar och en påse chips', 'två korvar, en glass och en påse chips', 'en korv, en glass och två påsar chips'],
          'en korv, två glassar och en påse chips'),
      berakna('Hur mycket betalar han? Skriv av uttrycket och räkna i flera led.', '20 + 2 · 15 + 18', ['20 + 30 + 18'], 68, 'kr')
    ]),
    // [tolka – mall 2]
    g('Mira köper korv och betalar med en 200-lapp. Beräkningen är 200 − 4 · 20 = 120. Vad betyder talet 120?', TOLKA, [
      val('', ['priset för fyra korvar', 'hur mycket hon får tillbaka', 'antalet korvar'], 'hur mycket hon får tillbaka')
    ]),
    // [teckna – mall 3, 12a]
    g('Fyll i ett uttryck för vad det kostar.', TECKNA, [
      utt('3 läsk och 2 påsar chips:', '3 · 12 + 2 · 18'),
      utt('x korvar och en läsk:', 'x · 20 + 12', 'x')
    ]),
    // [teckna – mall 12b]
    g('Sara köper x glassar och y läsk. Vilket uttryck visar vad det kostar?', TECKNA, [
      val('', ['15 · x + 12 · y', '12 · x + 15 · y', '15 + x + 12 + y'], '15 · x + 12 · y')
    ]),
    // [tolka – mall 11, 12b]
    g('Vad kan uttrycket x · 20 + y · 15 betyda?', TOLKA, [
      val('', ['x korvar och y glassar', 'x glassar och y korvar', '20 korvar och 15 glassar'], 'x korvar och y glassar')
    ]),
    // [tolka – mall 11a]
    g('Vad kan uttrycket x · 15 + x · 12 betyda?', TOLKA, [
      val('', ['x glassar och 12 läsk', 'lika många glassar som läsk', '15 glassar och 12 läsk'], 'lika många glassar som läsk')
    ]),
    // [teckna – mall 10, 12c]
    g('Theo köper x påsar chips och betalar med en 200-lapp. Fyll i ett uttryck för hur mycket han får tillbaka.', TECKNA, [
      utt('', '200 − 18 · x', 'x')
    ]),
    // [teckna och beräkna – HH 607]
    g('Leo har 200 kr. Han sparar 60 kr i månaden.', TECKNA, [
      utt('Fyll i ett uttryck för hur mycket han har efter m månader:', '200 + 60 · m', 'm'),
      berakna('Hur mycket har han efter 5 månader? Skriv uttrycket med 5 i stället för m och räkna i flera led.',
              '200 + 60 · 5', ['200 + 300'], 500, 'kr')
    ])
  ] }; };

/* ── BLAD 2A – Mer, mindre och delar ── */
BLAD['2A'] = function(){ return { titel: 'Mer, mindre och delar', dokument: dok('2A', 'kärna', 'golv'),
  grupper: [
    // [teckna – HH 617, GG 15]
    g('Vera är x år. Hennes kusin är 4 år yngre. Vilket uttryck visar kusinens ålder?', TECKNA, [
      val('', ['4 − x', 'x − 4', 'x + 4'], 'x − 4')
    ]),
    // [tolka – GG intro, HH 609]
    g('Vera är x år. Hennes bror Max är (x + 3) år. Vad betyder x + 3?', TOLKA, [
      val('', ['Max är 3 år äldre än Vera.', 'Max är 3 år.', 'Max är 3 år yngre än Vera.'], 'Max är 3 år äldre än Vera.')
    ]),
    // [tolka – II 20]
    g('Vera är x år. Hennes lillasyster Ines är (x − 5) år. Vilka tal kan x vara? Ringa in alla som är möjliga.', TOLKA, [
      { typ: 'flerval', tal: [2, 4, 9, 12], ratt: [9, 12] }
    ]),
    // [teckna – HH 618, CC s. 270 nr 8]
    g('Vilket uttryck visar hela sträckans längd?', TECKNA, [
      figur(F().strackfigur({ delar: [{ text: 'x cm' }, { text: '5 cm' }, { text: 'x cm' }] })),
      val('', ['x + 5', 'x + 5 + x', '5x'], 'x + 5 + x')
    ]),
    // [teckna – II 19]
    g('Fyll i uttrycken som ska stå i rutorna.', TECKNA, [
      tallinje(8, 3, 1, [[0, 'x − 3'], [5, 'x + 2'], [7, 'x + 4']])
    ]),
    // [teckna – HH 614]
    g('Tre tal följer varandra. Det minsta talet är n. Fyll i de två andra talen.', TECKNA, [
      { typ: 'talfoljd', termer: ['n', null, null], facit: [null, 'n + 1', 'n + 2'], uttryckSvar: true, fortsatt: false, vars: 'n' }
    ]),
    // [teckna – GG 22, HH 604]
    g('Vera är x år. Fyll i uttrycken.', TECKNA, [
      utt('Max är 3 år äldre än Vera. Han är', 'x + 3', 'x', 'år.'),
      utt('Ines är 5 år yngre än Vera. Hon är', 'x − 5', 'x', 'år.'),
      utt('Mamma är 29 år äldre än Vera. Hon är', 'x + 29', 'x', 'år.')
    ]),
    // [teckna och beräkna – II 28]
    g('', TECKNA, [
      figur(F().triangel({ ben: 'x cm', bas: '7 cm' })),
      utt('Fyll i ett uttryck för triangelns omkrets:', 'x + x + 7', 'x'),
      berakna('Beräkna omkretsen när x = 4. Skriv uttrycket med 4 i stället för x och räkna i flera led.', '4 + 4 + 7', [], 15, 'cm')
    ])
  ] }; };

/* ── BLAD 2B – Mer, mindre och delar ── */
BLAD['2B'] = function(){ return { titel: 'Mer, mindre och delar', dokument: dok('2B', 'kärna', 'golv'),
  grupper: [
    // [teckna – HH 617, A2072]
    g('Välj rätt uttryck.', TECKNA, [
      val('7 mindre än y:', ['7 − y', 'y − 7', 'y + 7'], 'y − 7'),
      val('y mindre än 20:', ['20 − y', 'y − 20', '20 + y'], '20 − y')
    ]),
    // [tolka – GG intro, HH 609]
    g('Pappa Erik är y år. Sonen Sixten är (y − 30) år. Vad betyder y − 30?', TOLKA, [
      val('', ['Sixten är 30 år.', 'Sixten är 30 år yngre än pappa.', 'Pappa är 30 år yngre än Sixten.'], 'Sixten är 30 år yngre än pappa.')
    ]),
    // [tolka – HH 615, 627]
    g('Maja är m år och Hugo är h år. Maja är äldst.', TOLKA, [
      val('Vad betyder m − h?', ['hur mycket äldre Maja är än Hugo', 'hur mycket äldre Hugo är än Maja', 'hur gamla de är tillsammans'], 'hur mycket äldre Maja är än Hugo'),
      val('Vad betyder m + h?', ['hur mycket äldre Maja är än Hugo', 'hur gamla de är tillsammans', 'Majas ålder om h år'], 'hur gamla de är tillsammans')
    ]),
    // [teckna – CC 15]
    g('Vilket uttryck visar längden av delen med frågetecknet?', TECKNA, [
      figur(F().strackfigur({ helhet: '20 cm', delar: [{ text: 'x cm' }, {}] })),
      val('', ['20 + x', 'x − 20', '20 − x'], '20 − x')
    ]),
    // [teckna – II 19]
    g('Fyll i uttrycken som ska stå i rutorna.', TECKNA, [
      tallinje(7, 1, 2, [[0, 'x − 2'], [4, 'x + 6'], [6, 'x + 10']])
    ]),
    // [teckna – HH 614]
    g('Fyll i.', TECKNA, [
      { typ: 'talfoljd', fraga: 'Tre jämna tal följer varandra. Det minsta är n.', termer: ['n', null, null], facit: [null, 'n + 2', 'n + 4'],
        uttryckSvar: true, fortsatt: false, vars: 'n' },
      utt('u är ett udda tal. Nästa udda tal är', 'u + 2', 'u', '.')
    ]),
    // [teckna – GG 22, HH 604]
    g('Pappa Erik är y år. Fyll i uttrycken.', TECKNA, [
      utt('Mamma är 3 år yngre än pappa. Hon är', 'y − 3', 'y', 'år.'),
      utt('Farfar är dubbelt så gammal som pappa. Han är', '2 · y', 'y', 'år.'),
      utt('Lillasyster Alma är en fjärdedel så gammal som pappa. Hon är', 'y/4', 'y', 'år.'),
      utt('Moster är 6 år äldre än mamma. Hon är', 'y − 3 + 6', 'y', 'år.')
    ]),
    // [teckna och beräkna – II 26, 28]
    g('', TECKNA, [
      figur(F().rektangel({ bredd: 'x + 2 cm', hojd: 'x cm' })),
      flera('Vilka uttryck visar rektangelns omkrets? Ringa in alla som stämmer.', ['x + x + 2 + x + x + 2', '4 · x + 4', 'x + x + 2', '2x + 2'],
            ['x + x + 2 + x + x + 2', '4 · x + 4']),
      berakna('Beräkna omkretsen när x = 8 med uttrycket 4 · x + 4. Skriv uttrycket med 8 i stället för x och räkna i flera led.',
              '4 · 8 + 4', ['32 + 4'], 36, 'cm')
    ])
  ] }; };

/* ── BLAD 3A – Blandade uppgifter ── */
BLAD['3A'] = function(){ return { titel: 'Blandade uppgifter', dokument: dok('3A', 'breddning', 'tak'),
  grupper: [
    // [teckna – GG 14, 18]
    g('Ella har x pärlor. Välj rätt uttryck.', TECKNA, [
      val('Hon får 8 till:', ['x + 8', '8x', 'x − 8'], 'x + 8'),
      val('Hon har nu tre gånger så många som från början:', ['x + 3', '3 · x', 'x/3'], '3 · x'),
      val('Hon tappar 5:', ['5 − x', 'x − 5', 'x + 5'], 'x − 5'),
      val('Hon delar dem lika i 2 burkar:', ['x/2', '2x', 'x − 2'], 'x/2')
    ]),
    // [teckna – HH 617, GG 15]
    g('Välj rätt uttryck.', TECKNA, [
      val('6 mindre än y:', ['6 − y', 'y − 6', '6y'], 'y − 6'),
      val('6 gånger y:', ['y + 6', '6 · y', 'y/6'], '6 · y'),
      val('6 mer än y:', ['y − 6', '6 · y', 'y + 6'], 'y + 6')
    ]),
    // [tolka – GG intro, HH 609]
    g('Farmor Greta är g år. Para ihop varje persons ålder med rätt mening. Svara med bokstav.', TOLKA, [
      paraIhop('', ['A. 3 år äldre än farmor', 'B. en sjättedel så gammal som farmor', 'C. 2 år yngre än farmor', 'D. 30 år yngre än farmor'],
               [['Pappa Lars är (g − 30) år.', 'D'], ['Farfar Bo är (g + 3) år.', 'A'], ['Barnbarnet Elsa är (g/6) år.', 'B'], ['Gretas syster Ulla är (g − 2) år.', 'C']])
    ]),
    // [tolka – II 30a]
    g('Omar betalar (3a + 2b) kr. Vad köper han?', TOLKA, [
      figur(F().prislappar({ varor: [{ namn: 'Äpple', pris: 'a kr' }, { namn: 'Banan', pris: 'b kr' }] })),
      val('', ['3 äpplen och 2 bananer', '2 äpplen och 3 bananer', '5 äpplen'], '3 äpplen och 2 bananer')
    ]),
    // [teckna – CC 15]
    g('Vilket uttryck visar längden av delen med frågetecknet?', TECKNA, [
      figur(F().strackfigur({ helhet: '30 cm', delar: [{ text: 'x cm' }, {}] })),
      val('', ['30 + x', '30 − x', 'x − 30'], '30 − x')
    ]),
    // [teckna – mall 10, 12c]
    g('En biobiljett kostar 95 kr. Sara köper x biljetter och betalar med en 500-lapp. Fyll i ett uttryck för hur mycket hon får tillbaka.', TECKNA, [
      utt('', '500 − 95 · x', 'x')
    ]),
    // [teckna och beräkna – II 28]
    g('', TECKNA, [
      figur(F().rektangel({ bredd: 's cm', hojd: '3 cm' })),
      flera('Vilka uttryck visar rektangelns omkrets? Ringa in alla som stämmer.', ['s + 3 + s + 3', '2 · s + 6', 's + 3', '3s'], ['s + 3 + s + 3', '2 · s + 6']),
      berakna('Beräkna omkretsen när s = 7 med uttrycket 2 · s + 6. Skriv uttrycket med 7 i stället för s och räkna i flera led.',
              '2 · 7 + 6', ['14 + 6'], 20, 'cm')
    ]),
    // [teckna och beräkna – HH 607]
    g('Nora har 150 kr. Hon sparar 40 kr i veckan.', TECKNA, [
      utt('Fyll i ett uttryck för hur mycket hon har efter v veckor:', '150 + 40 · v', 'v'),
      berakna('Hur mycket har hon efter 6 veckor? Skriv uttrycket med 6 i stället för v och räkna i flera led.',
              '150 + 40 · 6', ['150 + 240'], 390, 'kr')
    ])
  ] }; };

/* ── BLAD 3B – Blandade uppgifter ── */
BLAD['3B'] = function(){ return { titel: 'Blandade uppgifter', dokument: dok('3B', 'breddning', 'tak'),
  grupper: [
    // [teckna – GG 14, 18]
    g('Leo har n fotbollskort. Välj rätt uttryck.', TECKNA, [
      val('Hans kompis har dubbelt så många som Leo:', ['n + 2', '2 · n', 'n/2'], '2 · n'),
      val('Leo ger bort 4:', ['4 − n', 'n − 4', 'n + 4'], 'n − 4'),
      val('Hans syster har 7 färre än Leo:', ['7 − n', 'n + 7', 'n − 7'], 'n − 7'),
      val('Hans kusin har en fjärdedel så många som Leo:', ['n/4', '4n', 'n − 4'], 'n/4')
    ]),
    // [teckna – HH 617, A2072]
    g('Välj rätt uttryck.', TECKNA, [
      val('x mindre än 50:', ['50 − x', 'x − 50', '50 + x'], '50 − x'),
      val('3 mer än dubbelt så mycket som x:', ['2 · x + 3', '3 · x + 2', 'x + 2 + 3'], '2 · x + 3'),
      val('5 mindre än en tredjedel av x:', ['x/3 − 5', '5 − x/3', 'x/5 − 3'], 'x/3 − 5')
    ]),
    // [tolka – GG intro, HH 609]
    g('Mamma Karin är k år.', TOLKA, [
      paraIhop('Para ihop varje person med rätt mening. Svara med bokstav.',
               ['A. en tredjedel så gammal som mamma', 'B. 29 år yngre än mamma', 'C. 2 år äldre än mamma', 'D. 26 år äldre än mamma'],
               [['Pappa är (k + 2) år.', 'C'], ['Mormor är (k + 26) år.', 'D'], ['Dottern är (k/3) år.', 'A'], ['Sonen är (k − 29) år.', 'B']]),
      { typ: 'lucka', fraga: 'Hur mycket äldre är mormor än pappa?', text: '__ år', svar: 24 }
    ]),
    // [tolka – II 24, 30a, HH 615]
    g('', TOLKA, [
      figur(F().prislappar({ varor: [{ namn: 'Vuxenbiljett', pris: 'v kr' }, { namn: 'Barnbiljett', pris: 'b kr' }] })),
      val('Vad kan uttrycket 2 · v + 3 · b betyda?', ['biljetter för 2 vuxna och 3 barn', 'biljetter för 3 vuxna och 2 barn', 'biljetter för 5 vuxna'], 'biljetter för 2 vuxna och 3 barn'),
      val('Vad betyder v − b?', ['hur mycket dyrare en vuxenbiljett är än en barnbiljett', 'hur mycket dyrare en barnbiljett är än en vuxenbiljett', 'priset för en vuxen och ett barn'],
          'hur mycket dyrare en vuxenbiljett är än en barnbiljett')
    ]),
    // [teckna – II 19]
    g('Fyll i uttrycken som ska stå i rutorna.', TECKNA, [
      tallinje(6, 1, 5, [[0, 'x − 5'], [4, 'x + 15'], [5, 'x + 20']])
    ]),
    // [teckna – mall 10, 12c]
    g('En korv kostar 20 kr och en läsk kostar 12 kr. Ali köper x korvar och y läsk och betalar med en 200-lapp. Fyll i ett uttryck för hur mycket han får tillbaka.', TECKNA, [
      utt('', '200 − 20 · x − 12 · y', 'xy')
    ]),
    // [teckna och beräkna – II 28]
    g('', TECKNA, [
      figur(F().rektangel({ bredd: 'x + 4 cm', hojd: 'x cm' })),
      utt('Fyll i ett uttryck för rektangelns omkrets:', 'x + x + 4 + x + x + 4', 'x'),
      berakna('Beräkna omkretsen när x = 6 med uttrycket 4 · x + 8. Skriv uttrycket med 6 i stället för x och räkna i flera led.',
              '4 · 6 + 8', ['24 + 8'], 32, 'cm')
    ]),
    // [teckna och beräkna – HH 607, H kap 5 A22b]
    g('Ett ljus är 30 cm långt. Det brinner ner 2 cm i timmen.', TECKNA, [
      utt('Fyll i ett uttryck för ljusets längd efter t timmar:', '30 − 2 · t', 't'),
      berakna('Hur långt är ljuset efter 8 timmar? Skriv uttrycket med 8 i stället för t och räkna i flera led.',
              '30 − 2 · 8', ['30 − 16'], 14, 'cm')
    ])
  ] }; };

/* MOMENTET: tre blad med varianterna A och B (KONVENTIONER: "Blad 1A" utan mellanslag). Bladen byggs när de
   hämtas (figurerna behöver SvgAlgebraFigur, som laddas före den här filen). */
/* SPÄRREN (steg 5, Joachim 2026-11-22): bladen är NivaRad:s steg — blad 1 och 2 alltid öppna (§3), blad 3 öppnas
   vid minst 80 % rätta rutor på blad 2, variant A eller B (varianterna delar nivaId). Nyckeln är NivaRad:s egen:
   k3d1_naddNiva3_tolka. */
var MOMENT = { titel: 'Tolka och teckna uttryck', varianter: ['A', 'B'],
  nivaPrefix: 'k3d1', nivaId: 'tolka', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: 'Per styck och per gång' }, { nr: 2, titel: 'Mer, mindre och delar' }, { nr: 3, titel: 'Blandade uppgifter' } ] };

window.BLAD_K3_D1_TOLKA = {
  MOMENT: MOMENT,
  blad: function(id){ var f = BLAD[String(id || '').toUpperCase()]; return f ? f() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
