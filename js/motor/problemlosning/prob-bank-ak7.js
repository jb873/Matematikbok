/* prob-bank-ak7.js — PROBLEMLÖSNING ÅK7, NIVÅ 1: de författade uppgifterna (order 2026-11-18, forts.).

   KÄLLA: Joachims två dokument "Algebra – Problemlösning variant 5 – Sjuan".
     - Uppgiftsbladen = dokumentet med två blad per kategori (Blad A och B).
     - Metodträningen = dokumentet med fyra blad per kategori (Blad A–D). Blad A och B är desamma
       i båda dokumenten, så banken bär A–D en gång och uppgiftssidan visar A och B.
   Texterna är dokumentets, ordagrant. Inget är genererat: "nästa blad" är nästa bokstav.

   FEM TYPER, sex varianter var. Uppgift nr k på varje blad är variant k (samma ordning på A–D).
   Kategori 3.2 i dokumenten (fyra–sex personer, rabatter) hör till åttan (Joachims beslut) och
   finns INTE här.

   FORMEN är de befintliga komponenternas (prob-modell.js): delar, relationer och villkor. Facit
   RÄKNAS UT av ProbModell. Varje uppgift bär dessutom dokumentets facit per ruta i fältet facit
   (ett värde per del, i delarnas ordning; foljd = följdfrågans värde). verktyg/spec-prob-bank.js
   prövar att modellen och dokumentet ger samma tal — en felskriven relation fälls där.

   RENDERING: typen "instruktion" ritas med ProbBlad.render (inga delar att namnge — talet ÄR x),
   övriga med ProbBlad2.render (femstegsformen). Loggar till typens nod i k3-taxonomin. */
(function(){
'use strict';

var NOD = {
  instruktion: 'alg-prob-instruktion:problem',
  foljd:       'alg-prob-foljd:problem',
  delar:       'alg-prob-delar:problem',
  omkrets:     'alg-prob-omkrets:problem',
  vinklar:     'alg-prob-vinklar:problem'
};

// En uppgift i modellens form. d = [[nyckel, namn], …]; facit = dokumentets värden i samma ordning.
function upp(typ, id, text, d, relationer, villkor, enhet, facit, extra){
  var u = { id: 'p7-' + typ + '-' + id, typ: typ, nod: NOD[typ], niva: 1, variabel: 'x', fraga: text.fraga,
            delar: d.map(function(p){ return { nyckel: p[0], namn: p[1] }; }),
            relationer: relationer, villkor: [villkor], enhet: enhet || null,
            svarDelar: d.map(function(p){ return p[0]; }), facit: facit };
  if(extra) Object.keys(extra).forEach(function(k){ u[k] = extra[k]; });
  return u;
}
// Följa instruktion: en del (talet), inga relationer.
// form 'ekvation': löses som en vanlig ekvation (ekvation → balansmetoden → svar = talet), aldrig i
// femstegsformen — också när uppgiften står i ett blandat blad som testet (order 2026-11-19).
function ins(id, text, villkor, x, enhet){
  return upp('instruktion', id, text, [['T', 'talet']], [], villkor, enhet, [x], { form: 'ekvation' });
}
// Tal som följer varandra: antal tal, steget mellan dem (1 = heltal, 2 = jämna/udda), summan.
function fo(id, text, antal, steg, summa, enhet){
  var d = [], rel = [], sum = [], facit = [], forsta = (summa - steg * antal * (antal - 1) / 2) / antal;
  for(var i = 0; i < antal; i++){
    var k = String.fromCharCode(65 + i);
    d.push([k, 'Tal ' + (i + 1)]);
    if(i) rel.push(k + ' = A + ' + (i * steg));
    sum.push(k); facit.push(forsta + i * steg);
  }
  return upp('foljd', id, text, d, rel, sum.join(' + ') + ' = ' + summa, enhet, facit);
}
var AREA_M = { etikett: 'Area:', uttryck: 'A·B', enhet: 'm²' };
var AREA_CM = { etikett: 'Area:', uttryck: 'A·B', enhet: 'cm²' };

var TYPER = [

// ── 1. FÖLJA INSTRUKTION ─────────────────────────────────────────────────────────────────────
{ id: 'instruktion', titel: 'Följa instruktion', nod: NOD.instruktion, form: 'instruktion', film: 'i32KuSLitLI',
  varianter: [
    { titel: 'Multiplicera och addera' }, { titel: 'Multiplicera och subtrahera' },
    { titel: 'Dividera och addera' }, { titel: 'Dividera och subtrahera' },
    { titel: 'Instruktion i vardagen' }, { titel: 'Tre räknesätt efter varandra' } ],
  blad: {
    A: [
      ins('A1', { fraga: 'Jag tänker på ett tal. Om jag multiplicerar talet med 5 och sedan adderar 6 får jag 41. Vilket tal tänker jag på?' }, '5·T + 6 = 41', 7),
      ins('A2', { fraga: 'Jag tänker på ett tal. Om jag multiplicerar talet med 4 och sedan minskar med 9 får jag 27. Vilket tal tänker jag på?' }, '4·T - 9 = 27', 9),
      ins('A3', { fraga: 'Om jag halverar ett tal och adderar 18 får jag 30. Vilket är talet?' }, 'T/2 + 18 = 30', 24),
      ins('A4', { fraga: 'Om jag dividerar ett tal med 4 och sedan minskar med 6 får jag 3. Vilket är talet?' }, 'T/4 - 6 = 3', 36),
      ins('A5', { fraga: 'Om jag dubblar min ålder och lägger till 7 får jag min pappas ålder. Pappa är 41 år. Hur gammal är jag?' }, '2·T + 7 = 41', 17, 'år'),
      ins('A6', { fraga: 'Noa tänker på ett tal. Han multiplicerar det med 3, dividerar med 2 och adderar sedan 4. Han får 19. Vilket tal tänkte Noa på?' }, '3·T/2 + 4 = 19', 10)
    ],
    B: [
      ins('B1', { fraga: 'Om jag dubblar ett tal och lägger till 13 får jag 45. Vilket är talet?' }, '2·T + 13 = 45', 16),
      ins('B2', { fraga: 'Om jag tredubblar ett tal och drar bort 8 får jag 52. Vilket är talet?' }, '3·T - 8 = 52', 20),
      ins('B3', { fraga: 'Om jag dividerar ett tal med 3 och sedan adderar 5 får jag 12. Vilket är talet?' }, 'T/3 + 5 = 12', 21),
      ins('B4', { fraga: 'Om jag dividerar ett tal med 5 och sedan minskar med 4 får jag 6. Vilket är talet?' }, 'T/5 - 4 = 6', 50),
      ins('B5', { fraga: 'Elsa äter en fjärdedel av kakorna i en burk. Sedan äter hon 3 kakor till. Då har hon ätit 11 kakor. Hur många kakor fanns det i burken från början?' }, 'T/4 + 3 = 11', 32, 'kakor'),
      ins('B6', { fraga: 'Mira tänker på ett tal. Hon dividerar det med 4, multiplicerar med 3 och subtraherar sedan 5. Hon får 13. Vilket tal tänkte Mira på?' }, '3·T/4 - 5 = 13', 24)
    ],
    C: [
      ins('C1', { fraga: 'Jag tänker på ett tal. Om jag multiplicerar talet med 8 och sedan adderar 11 får jag 75. Vilket tal tänker jag på?' }, '8·T + 11 = 75', 8),
      ins('C2', { fraga: 'Om jag multiplicerar ett tal med 9 och subtraherar 14 får jag 58. Vilket är talet?' }, '9·T - 14 = 58', 8),
      ins('C3', { fraga: 'Om jag dividerar ett tal med 6 och adderar 9 får jag 14. Vilket är talet?' }, 'T/6 + 9 = 14', 30),
      ins('C4', { fraga: 'Om jag dividerar ett tal med 3 och sedan minskar med 7 får jag 5. Vilket är talet?' }, 'T/3 - 7 = 5', 36),
      ins('C5', { fraga: 'En burk kakor delas lika mellan 5 kompisar. Varje kompis får dessutom 2 kakor från en annan burk. Då har varje kompis fått 9 kakor. Hur många kakor fanns i den första burken?' }, 'T/5 + 2 = 9', 35, 'kakor'),
      ins('C6', { fraga: 'Liv tänker på ett tal. Hon multiplicerar det med 5, dividerar med 3 och subtraherar sedan 6. Hon får 14. Vilket tal tänkte Liv på?' }, '5·T/3 - 6 = 14', 12)
    ],
    D: [
      ins('D1', { fraga: 'Om jag multiplicerar ett tal med 6 och adderar 23 får jag 101. Vilket är talet?' }, '6·T + 23 = 101', 13),
      ins('D2', { fraga: 'Om jag fyrdubblar ett tal och drar bort 17 får jag 63. Vilket är talet?' }, '4·T - 17 = 63', 20),
      ins('D3', { fraga: 'Om jag dividerar ett tal med 8 och adderar 2,5 får jag 7. Vilket är talet?' }, 'T/8 + 2,5 = 7', 36),
      ins('D4', { fraga: 'Om jag halverar ett tal och sedan drar bort 13 får jag 29. Vilket är talet?' }, 'T/2 - 13 = 29', 84),
      ins('D5', { fraga: 'Om man tar tre gånger Majas ålder och drar bort 5 får man hennes mosters ålder. Mostern är 37 år. Hur gammal är Maja?' }, '3·T - 5 = 37', 14, 'år'),
      ins('D6', { fraga: 'Omar tänker på ett tal. Han dividerar det med 5, multiplicerar med 4 och adderar sedan 9. Han får 33. Vilket tal tänkte Omar på?' }, '4·T/5 + 9 = 33', 30)
    ]
  } },

// ── 2. TAL SOM FÖLJER VARANDRA ────────────────────────────────────────────────────────────────
{ id: 'foljd', titel: 'Tal som följer varandra', nod: NOD.foljd, form: 'delar', film: 'YAcUxMijrx4',
  varianter: [
    { titel: 'Två heltal' }, { titel: 'Tre heltal' }, { titel: 'Jämna tal' }, { titel: 'Udda tal' },
    { titel: 'Fyra eller fem tal' }, { titel: 'Tal som följer varandra i vardagen' } ],
  blad: {
    A: [
      fo('A1', { fraga: 'Summan av två på varandra följande heltal är 45. Vilka är talen?' }, 2, 1, 45),
      fo('A2', { fraga: 'Summan av tre på varandra följande heltal är 75. Vilka är talen?' }, 3, 1, 75),
      fo('A3', { fraga: 'Summan av två på varandra följande jämna tal är 74. Vilka är talen?' }, 2, 2, 74),
      fo('A4', { fraga: 'Summan av två på varandra följande udda tal är 64. Vilka är talen?' }, 2, 2, 64),
      fo('A5', { fraga: 'Summan av fyra på varandra följande heltal är 106. Vilka är talen?' }, 4, 1, 106),
      fo('A6', { fraga: 'En bok är uppslagen. Summan av de två sidnumren är 157. Vilka sidor är uppslagna?' }, 2, 1, 157)
    ],
    B: [
      fo('B1', { fraga: 'Summan av två på varandra följande heltal är 91. Vilka är talen?' }, 2, 1, 91),
      fo('B2', { fraga: 'Summan av tre på varandra följande heltal är 156. Vilka är talen?' }, 3, 1, 156),
      fo('B3', { fraga: 'Summan av tre på varandra följande jämna tal är 96. Vilka är talen?' }, 3, 2, 96),
      fo('B4', { fraga: 'Summan av tre på varandra följande udda tal är 81. Vilka är talen?' }, 3, 2, 81),
      fo('B5', { fraga: 'Summan av fem på varandra följande heltal är 200. Vilka är talen?' }, 5, 1, 200),
      fo('B6', { fraga: 'Tre syskon är födda med exakt ett års mellanrum. Tillsammans är de 39 år. Hur gamla är syskonen?' }, 3, 1, 39, 'år')
    ],
    C: [
      fo('C1', { fraga: 'Summan av två på varandra följande heltal är 137. Vilka är talen?' }, 2, 1, 137),
      fo('C2', { fraga: 'Summan av tre på varandra följande heltal är 222. Vilka är talen?' }, 3, 1, 222),
      fo('C3', { fraga: 'Summan av två på varandra följande jämna tal är 190. Vilka är talen?' }, 2, 2, 190),
      fo('C4', { fraga: 'Summan av två på varandra följande udda tal är 100. Vilka är talen?' }, 2, 2, 100),
      fo('C5', { fraga: 'Summan av fyra på varandra följande heltal är 250. Vilka är talen?' }, 4, 1, 250),
      fo('C6', { fraga: 'Tre hus står bredvid varandra på samma sida av en gata. Husnumren är jämna tal som följer på varandra. Summan av husnumren är 132. Vilka nummer har husen?' }, 3, 2, 132)
    ],
    D: [
      fo('D1', { fraga: 'Summan av två på varandra följande heltal är 249. Vilka är talen?' }, 2, 1, 249),
      fo('D2', { fraga: 'Summan av tre på varandra följande heltal är 345. Vilka är talen?' }, 3, 1, 345),
      fo('D3', { fraga: 'Summan av tre på varandra följande jämna tal är 156. Vilka är talen?' }, 3, 2, 156),
      fo('D4', { fraga: 'Summan av tre på varandra följande udda tal är 225. Vilka är talen?' }, 3, 2, 225),
      fo('D5', { fraga: 'Summan av fem på varandra följande heltal är 335. Vilka är talen?' }, 5, 1, 335),
      fo('D6', { fraga: 'Fyra syskon är födda med exakt ett års mellanrum. Tillsammans är de 54 år. Hur gamla är syskonen?' }, 4, 1, 54, 'år')
    ]
  } },

// ── 3. FLERA PERSONER OCH SAKER (2–3 personer) ───────────────────────────────────────────────
{ id: 'delar', titel: 'Flera personer och saker (2–3 personer)', nod: NOD.delar, form: 'delar', film: 'VlMJXA95eVU',
  varianter: [
    { titel: 'Två personer, skillnad i år' }, { titel: 'Två personer, längd och vikt' },
    { titel: 'Gånger så mycket' }, { titel: 'Lika delar och några till' },
    { titel: 'Tre personer, mer och mindre' }, { titel: 'Tre personer, gånger och mer' } ],
  blad: {
    A: [
      upp('delar', 'A1', { fraga: 'Ella är 6 år äldre än Noah. Tillsammans är de 30 år. Hur gamla är de?' },
          [['N', 'Noah'], ['E', 'Ella']], ['E = N + 6'], 'N + E = 30', 'år', [12, 18]),
      upp('delar', 'A2', { fraga: 'Ali är 12 cm längre än Maja. Tillsammans är deras längd 318 cm. Hur långa är de?' },
          [['M', 'Maja'], ['A', 'Ali']], ['A = M + 12'], 'M + A = 318', 'cm', [153, 165]),
      upp('delar', 'A3', { fraga: 'Elias mamma är 4 gånger så gammal som Elias. Tillsammans är de 55 år. Hur gamla är de?' },
          [['E', 'Elias'], ['M', 'mamma']], ['M = 4·E'], 'E + M = 55', 'år', [11, 44]),
      upp('delar', 'A4', { fraga: 'Två påsar innehåller lika många kulor. Dessutom ligger 7 kulor bredvid. Totalt är det 43 kulor. Hur många kulor finns det i varje påse?' },
          [['P', 'kulor i varje påse']], [], '2·P + 7 = 43', 'kulor', [18]),
      upp('delar', 'A5', { fraga: 'Moa har 15 kr mer än Leo. Vera har 10 kr mindre än Leo. Tillsammans har de 170 kr. Hur mycket har var och en?' },
          [['L', 'Leo'], ['M', 'Moa'], ['V', 'Vera']], ['M = L + 15', 'V = L - 10'], 'L + M + V = 170', 'kr', [55, 70, 45]),
      upp('delar', 'A6', { fraga: 'Ida har dubbelt så många klistermärken som Sam. Kim har 12 fler än Sam. Tillsammans har de 92 klistermärken. Hur många har var och en?' },
          [['S', 'Sam'], ['I', 'Ida'], ['K', 'Kim']], ['I = 2·S', 'K = S + 12'], 'S + I + K = 92', null, [20, 40, 32])
    ],
    B: [
      upp('delar', 'B1', { fraga: 'Liam är 4 år yngre än Saga. Tillsammans är de 26 år. Hur gamla är de?' },
          [['L', 'Liam'], ['S', 'Saga']], ['L = S - 4'], 'L + S = 26', 'år', [11, 15]),
      upp('delar', 'B2', { fraga: 'Hugo väger 8 kg mer än Alva. Tillsammans väger de 102 kg. Hur mycket väger var och en?' },
          [['A', 'Alva'], ['H', 'Hugo']], ['H = A + 8'], 'A + H = 102', 'kg', [47, 55]),
      upp('delar', 'B3', { fraga: 'Saga har 3 gånger så många böcker som Alma. Tillsammans har de 48 böcker. Hur många böcker har var och en?' },
          [['A', 'Alma'], ['S', 'Saga']], ['S = 3·A'], 'A + S = 48', null, [12, 36]),
      upp('delar', 'B4', { fraga: 'Tre lådor innehåller lika många böcker. Dessutom ligger 5 böcker på bordet. Totalt är det 50 böcker. Hur många böcker finns det i varje låda?' },
          [['L', 'böcker i varje låda']], [], '3·L + 5 = 50', 'böcker', [15]),
      upp('delar', 'B5', { fraga: 'I årskurs 7 finns tre klasser. 7B har 3 fler elever än 7A. 7C har 2 färre elever än 7A. Totalt går 76 elever i årskursen. Hur många elever går i varje klass?' },
          [['A', '7A'], ['B', '7B'], ['C', '7C']], ['B = A + 3', 'C = A - 2'], 'A + B + C = 76', null, [25, 28, 23]),
      upp('delar', 'B6', { fraga: 'En cykeltur har tre etapper. Den andra etappen är dubbelt så lång som den första. Den tredje etappen är 4 km kortare än den andra. Hela turen är 36 km. Hur långa är etapperna?' },
          [['A', 'första etappen'], ['B', 'andra etappen'], ['C', 'tredje etappen']], ['B = 2·A', 'C = B - 4'], 'A + B + C = 36', 'km', [8, 16, 12])
    ],
    C: [
      upp('delar', 'C1', { fraga: 'Oskar är 9 år äldre än sin kusin Tilde. Tillsammans är de 41 år. Hur gamla är de?' },
          [['T', 'Tilde'], ['O', 'Oskar']], ['O = T + 9'], 'T + O = 41', 'år', [16, 25]),
      upp('delar', 'C2', { fraga: 'Två hundar väger tillsammans 46 kg. Den ena väger 14 kg mer än den andra. Hur mycket väger hundarna?' },
          [['A', 'den lättare hunden'], ['B', 'den tyngre hunden']], ['B = A + 14'], 'A + B = 46', 'kg', [16, 30]),
      upp('delar', 'C3', { fraga: 'En pappa är 5 gånger så gammal som sin son. Tillsammans är de 48 år. Hur gamla är de?' },
          [['S', 'sonen'], ['P', 'pappan']], ['P = 5·S'], 'S + P = 48', 'år', [8, 40]),
      upp('delar', 'C4', { fraga: 'Fyra lådor innehåller lika många pennor. Dessutom ligger 9 pennor lösa på bordet. Totalt är det 77 pennor. Hur många pennor finns det i varje låda?' },
          [['L', 'pennor i varje låda']], [], '4·L + 9 = 77', 'pennor', [17]),
      upp('delar', 'C5', { fraga: 'Leo har 20 kr mer än Mia. Sam har 15 kr mindre än Mia. Tillsammans har de 245 kr. Hur mycket har var och en?' },
          [['M', 'Mia'], ['L', 'Leo'], ['S', 'Sam']], ['L = M + 20', 'S = M - 15'], 'M + L + S = 245', 'kr', [80, 100, 65]),
      upp('delar', 'C6', { fraga: 'Ella har tre gånger så många kort som Max. Ali har 8 fler än Max. Tillsammans har de 93 kort. Hur många kort har var och en?' },
          [['M', 'Max'], ['E', 'Ella'], ['A', 'Ali']], ['E = 3·M', 'A = M + 8'], 'M + E + A = 93', null, [17, 51, 25])
    ],
    D: [
      upp('delar', 'D1', { fraga: 'Nora är 7 år yngre än sin bror Adam. Tillsammans är de 33 år. Hur gamla är de?' },
          [['N', 'Nora'], ['A', 'Adam']], ['N = A - 7'], 'N + A = 33', 'år', [13, 20]),
      upp('delar', 'D2', { fraga: 'Två plankor är tillsammans 5,2 m långa. Den ena är 0,8 m längre än den andra. Hur långa är plankorna?' },
          [['A', 'den kortare plankan'], ['B', 'den längre plankan']], ['B = A + 0,8'], 'A + B = 5,2', 'm', [2.2, 3.0]),
      upp('delar', 'D3', { fraga: 'Ett äpple väger 3 gånger så mycket som ett plommon. Tillsammans väger de 240 g. Hur mycket väger var och en?' },
          [['P', 'plommonet'], ['A', 'äpplet']], ['A = 3·P'], 'P + A = 240', 'g', [60, 180]),
      upp('delar', 'D4', { fraga: 'Fem påsar innehåller lika mycket godis. Dessutom ligger 120 g godis i en skål. Totalt finns 1 120 g godis. Hur mycket godis finns i varje påse?' },
          [['P', 'godis i varje påse']], [], '5·P + 120 = 1120', 'g', [200]),
      upp('delar', 'D5', { fraga: 'I årskurs 8 finns tre klasser. 8B har 4 fler elever än 8A. 8C har 3 färre elever än 8A. Totalt går 79 elever i årskursen. Hur många elever går i varje klass?' },
          [['A', '8A'], ['B', '8B'], ['C', '8C']], ['B = A + 4', 'C = A - 3'], 'A + B + C = 79', null, [26, 30, 23]),
      upp('delar', 'D6', { fraga: 'En stafett har tre sträckor. Den andra sträckan är dubbelt så lång som den första. Den tredje sträckan är 300 m kortare än den andra. Hela stafetten är 2 200 m. Hur långa är sträckorna?' },
          [['A', 'första sträckan'], ['B', 'andra sträckan'], ['C', 'tredje sträckan']], ['B = 2·A', 'C = B - 300'], 'A + B + C = 2200', 'm', [500, 1000, 700])
    ]
  } },

// ── 4. OMKRETS ───────────────────────────────────────────────────────────────────────────────
{ id: 'omkrets', titel: 'Omkrets', nod: NOD.omkrets, form: 'delar', film: 'ZnhbsnpMrqo',
  varianter: [
    { titel: 'Rektangel och kvadrat med uttryck' }, { titel: 'Triangel med uttryck' },
    { titel: 'Rektangel där en sida är längre' }, { titel: 'Gånger så lång eller likbent' },
    { titel: 'Tre sidor med samband' }, { titel: 'Fler steg: area eller fyrhörning' } ],
  blad: {
    A: [
      upp('omkrets', 'A1', { fraga: 'En rektangel har sidorna 6 cm och (x + 3) cm. Omkretsen är 34 cm. Vilket värde har x?' },
          [['X', 'x']], [], '2·6 + 2·(X + 3) = 34', null, [8]),
      upp('omkrets', 'A2', { fraga: 'En triangel har sidorna 7 cm, 9 cm och (x + 4) cm. Omkretsen är 28 cm. Vilket värde har x?' },
          [['X', 'x']], [], '7 + 9 + (X + 4) = 28', null, [8]),
      upp('omkrets', 'A3', { fraga: 'En rektangel har omkretsen 50 m. Längden är 5 m längre än bredden. Hur långa är sidorna?' },
          [['A', 'bredden'], ['B', 'längden']], ['B = A + 5'], '2·A + 2·B = 50', 'm', [10, 15]),
      upp('omkrets', 'A4', { fraga: 'En rektangel har omkretsen 96 cm. Den långa sidan är 3 gånger så lång som den korta. Hur långa är sidorna?' },
          [['A', 'den korta sidan'], ['B', 'den långa sidan']], ['B = 3·A'], '2·A + 2·B = 96', 'cm', [12, 36]),
      upp('omkrets', 'A5', { fraga: 'En rabatt har formen av en triangel. Ena sidan är 2 m längre än den kortaste sidan. Den längsta sidan är 5 m längre än den kortaste. Omkretsen är 31 m. Hur långa är sidorna?' },
          [['A', 'den kortaste sidan'], ['B', 'den mellersta sidan'], ['C', 'den längsta sidan']], ['B = A + 2', 'C = A + 5'], 'A + B + C = 31', 'm', [8, 10, 13]),
      upp('omkrets', 'A6', { fraga: 'En hage har formen av en rektangel. Kortsidan är 12 m kortare än långsidan. Omkretsen är 104 m. Hur stor är hagens area?' },
          [['A', 'långsidan'], ['B', 'kortsidan']], ['B = A - 12'], '2·A + 2·B = 104', 'm', [32, 20], { foljdfraga: AREA_M, facitFoljd: 640 })
    ],
    B: [
      upp('omkrets', 'B1', { fraga: 'En kvadrat har sidan (x + 3) cm. Omkretsen är 48 cm. Vilket värde har x?' },
          [['X', 'x']], [], '4·(X + 3) = 48', null, [9]),
      upp('omkrets', 'B2', { fraga: 'En triangel har sidorna x cm, (x + 3) cm och 11 cm. Omkretsen är 30 cm. Hur långa är sidorna?' },
          [['A', 'den första sidan'], ['B', 'den andra sidan'], ['C', 'den tredje sidan']], ['B = A + 3', 'C = 11'], 'A + B + C = 30', 'cm', [8, 11, 11]),
      upp('omkrets', 'B3', { fraga: 'En rektangel har omkretsen 46 cm. Bredden är 7 cm kortare än längden. Hur långa är sidorna?' },
          [['A', 'bredden'], ['B', 'längden']], ['B = A + 7'], '2·A + 2·B = 46', 'cm', [8, 15]),
      upp('omkrets', 'B4', { fraga: 'En likbent triangel har två lika långa sidor. Basen är 12 cm och omkretsen är 40 cm. Hur långa är de lika långa sidorna?' },
          [['S', 'en av de lika långa sidorna']], [], '2·S + 12 = 40', 'cm', [14]),
      upp('omkrets', 'B5', { fraga: 'I triangeln ABC är sidan AC dubbelt så lång som AB. Sidan BC är 5 cm längre än AB. Omkretsen är 41 cm. Hur långa är sidorna?' },
          [['A', 'AB'], ['C', 'AC'], ['B', 'BC']], ['C = 2·A', 'B = A + 5'], 'A + B + C = 41', 'cm', [9, 18, 14]),
      upp('omkrets', 'B6', { fraga: 'I fyrhörningen ABCD är omkretsen 50 cm. AB är dubbelt så lång som AD. CD är lika lång som AB. BC är 4 cm kortare än AD. Hur långa är sidorna?' },
          [['D', 'AD'], ['A', 'AB'], ['C', 'CD'], ['B', 'BC']], ['A = 2·D', 'C = A', 'B = D - 4'], 'A + B + C + D = 50', 'cm', [9, 18, 18, 5])
    ],
    C: [
      upp('omkrets', 'C1', { fraga: 'En rektangel har sidorna 9 cm och (x − 2) cm. Omkretsen är 40 cm. Vilket värde har x?' },
          [['X', 'x']], [], '2·9 + 2·(X - 2) = 40', null, [13]),
      upp('omkrets', 'C2', { fraga: 'En triangel har sidorna 10 cm, 13 cm och (x − 5) cm. Omkretsen är 35 cm. Vilket värde har x?' },
          [['X', 'x']], [], '10 + 13 + (X - 5) = 35', null, [17]),
      upp('omkrets', 'C3', { fraga: 'En rektangel har omkretsen 70 m. Längden är 9 m längre än bredden. Hur långa är sidorna?' },
          [['A', 'bredden'], ['B', 'längden']], ['B = A + 9'], '2·A + 2·B = 70', 'm', [13, 22]),
      upp('omkrets', 'C4', { fraga: 'En rektangel har omkretsen 84 cm. Långsidan är dubbelt så lång som kortsidan. Hur långa är sidorna?' },
          [['A', 'kortsidan'], ['B', 'långsidan']], ['B = 2·A'], '2·A + 2·B = 84', 'cm', [14, 28]),
      upp('omkrets', 'C5', { fraga: 'I triangeln ABC är sidan BC 4 cm längre än AB. Sidan AC är 1 cm kortare än BC. Omkretsen är 31 cm. Hur långa är sidorna?' },
          [['A', 'AB'], ['B', 'BC'], ['C', 'AC']], ['B = A + 4', 'C = B - 1'], 'A + B + C = 31', 'cm', [8, 12, 11]),
      upp('omkrets', 'C6', { fraga: 'En rektangel har omkretsen 60 cm. Långsidan är 4 gånger så lång som kortsidan. Hur stor är rektangelns area?' },
          [['A', 'kortsidan'], ['B', 'långsidan']], ['B = 4·A'], '2·A + 2·B = 60', 'cm', [6, 24], { foljdfraga: AREA_CM, facitFoljd: 144 })
    ],
    D: [
      upp('omkrets', 'D1', { fraga: 'En kvadrat har sidan (2x + 1) cm. Omkretsen är 52 cm. Vilket värde har x?' },
          [['X', 'x']], [], '4·(2·X + 1) = 52', null, [6]),
      upp('omkrets', 'D2', { fraga: 'En triangel har sidorna x cm, 2x cm och 15 cm. Omkretsen är 42 cm. Hur långa är sidorna?' },
          [['A', 'den första sidan'], ['B', 'den andra sidan'], ['C', 'den tredje sidan']], ['B = 2·A', 'C = 15'], 'A + B + C = 42', 'cm', [9, 18, 15]),
      upp('omkrets', 'D3', { fraga: 'En rektangulär fotbollsplan för barn har omkretsen 180 m. Kortsidan är 30 m kortare än långsidan. Hur långa är sidorna?' },
          [['A', 'långsidan'], ['B', 'kortsidan']], ['B = A - 30'], '2·A + 2·B = 180', 'm', [60, 30]),
      upp('omkrets', 'D4', { fraga: 'En likbent triangel har omkretsen 50 cm. De två lika långa sidorna är 7 cm längre än basen. Hur långa är sidorna?' },
          [['B', 'basen'], ['S', 'en av de lika långa sidorna']], ['S = B + 7'], 'B + 2·S = 50', 'cm', [12, 19]),
      upp('omkrets', 'D5', { fraga: 'En triangel har en kort, en mellanlång och en lång sida. Den mellanlånga sidan är dubbelt så lång som den korta. Den långa sidan är 6 cm längre än den mellanlånga. Omkretsen är 46 cm. Hur långa är sidorna?' },
          [['A', 'den korta sidan'], ['B', 'den mellanlånga sidan'], ['C', 'den långa sidan']], ['B = 2·A', 'C = B + 6'], 'A + B + C = 46', 'cm', [8, 16, 22]),
      upp('omkrets', 'D6', { fraga: 'I femhörningen ABCDE är alla sidor utom AB lika långa. AB är 5 cm längre än var och en av de andra sidorna. Omkretsen är 45 cm. Hur långa är sidorna?' },
          [['S', 'en av de fyra lika långa sidorna'], ['A', 'AB']], ['A = S + 5'], '4·S + A = 45', 'cm', [8, 13])
    ]
  } },

// ── 5. VINKLAR ───────────────────────────────────────────────────────────────────────────────
{ id: 'vinklar', titel: 'Vinklar', nod: NOD.vinklar, form: 'delar', film: 'lmk_IgsQNeI',
  varianter: [
    { titel: 'Två lika stora vinklar' }, { titel: 'Rätvinklig triangel' },
    { titel: 'Triangel: gånger så stor' }, { titel: 'Triangel: större och mindre' },
    { titel: 'Fyrhörning: alla vinklar beror på en vinkel' }, { titel: 'Fyrhörning: en vinkel är känd' } ],
  blad: {
    A: [
      upp('vinklar', 'A1', { fraga: 'I en likbent triangel är de två basvinklarna lika stora. Toppvinkeln är 45° mindre än var och en av basvinklarna. Hur stora är vinklarna?' },
          [['A', 'den ena basvinkeln'], ['B', 'den andra basvinkeln'], ['C', 'toppvinkeln']], ['B = A', 'C = A - 45'], 'A + B + C = 180', 'grader', [75, 75, 30]),
      upp('vinklar', 'A2', { fraga: 'I en rätvinklig triangel är den ena spetsiga vinkeln dubbelt så stor som den andra. Hur stora är de spetsiga vinklarna?' },
          [['A', 'den mindre spetsiga vinkeln'], ['B', 'den större spetsiga vinkeln']], ['B = 2·A'], 'A + B + 90 = 180', 'grader', [30, 60]),
      upp('vinklar', 'A3', { fraga: 'I en triangel är vinkel B dubbelt så stor som vinkel A. Vinkel C är tre gånger så stor som vinkel A. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C']], ['B = 2·A', 'C = 3·A'], 'A + B + C = 180', 'grader', [30, 60, 90]),
      upp('vinklar', 'A4', { fraga: 'I en triangel är vinkel B 20° större än vinkel A. Vinkel C är 40° större än vinkel A. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C']], ['B = A + 20', 'C = A + 40'], 'A + B + C = 180', 'grader', [40, 60, 80]),
      upp('vinklar', 'A5', { fraga: 'I en fyrhörning är vinkel B dubbelt så stor som vinkel A. Vinkel C är 30° större än vinkel A och vinkel D är 50° större än vinkel A. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C'], ['D', 'vinkel D']], ['B = 2·A', 'C = A + 30', 'D = A + 50'], 'A + B + C + D = 360', 'grader', [56, 112, 86, 106]),
      upp('vinklar', 'A6', { fraga: 'En fyrhörning har en rät vinkel. Av de andra tre vinklarna är den andra dubbelt så stor som den första, och den tredje är 30° större än den första. Hur stora är de tre vinklarna?' },
          [['A', 'den första vinkeln'], ['B', 'den andra vinkeln'], ['C', 'den tredje vinkeln']], ['B = 2·A', 'C = A + 30'], '90 + A + B + C = 360', 'grader', [60, 120, 90])
    ],
    B: [
      upp('vinklar', 'B1', { fraga: 'I en triangel är två av vinklarna lika stora. Den tredje vinkeln är 30° större än var och en av dem. Hur stora är vinklarna?' },
          [['A', 'den ena lika stora vinkeln'], ['B', 'den andra lika stora vinkeln'], ['C', 'den tredje vinkeln']], ['B = A', 'C = A + 30'], 'A + B + C = 180', 'grader', [50, 50, 80]),
      upp('vinklar', 'B2', { fraga: 'I en rätvinklig triangel är den ena spetsiga vinkeln 24° större än den andra. Hur stora är de spetsiga vinklarna?' },
          [['A', 'den mindre spetsiga vinkeln'], ['B', 'den större spetsiga vinkeln']], ['B = A + 24'], 'A + B + 90 = 180', 'grader', [33, 57]),
      upp('vinklar', 'B3', { fraga: 'I en triangel är vinkel B dubbelt så stor som vinkel A. Vinkel C är 20° större än vinkel A. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C']], ['B = 2·A', 'C = A + 20'], 'A + B + C = 180', 'grader', [40, 80, 60]),
      upp('vinklar', 'B4', { fraga: 'I en triangel är vinkel B 10° mindre än vinkel A. Vinkel C är 25° större än vinkel A. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C']], ['B = A - 10', 'C = A + 25'], 'A + B + C = 180', 'grader', [55, 45, 80]),
      upp('vinklar', 'B5', { fraga: 'I en fyrhörning är två av vinklarna lika stora. Den tredje vinkeln är dubbelt så stor som var och en av dem. Den fjärde vinkeln är 60° större än den tredje. Hur stora är vinklarna?' },
          [['A', 'den ena lika stora vinkeln'], ['B', 'den andra lika stora vinkeln'], ['C', 'den tredje vinkeln'], ['D', 'den fjärde vinkeln']], ['B = A', 'C = 2·A', 'D = C + 60'], 'A + B + C + D = 360', 'grader', [50, 50, 100, 160]),
      upp('vinklar', 'B6', { fraga: 'I fyrhörningen ABCD är vinkel A 110°. Vinkel C är tre gånger så stor som vinkel B, och vinkel D är 10° större än vinkel B. Hur stora är vinklarna B, C och D?' },
          [['B', 'vinkel B'], ['C', 'vinkel C'], ['D', 'vinkel D']], ['C = 3·B', 'D = B + 10'], '110 + B + C + D = 360', 'grader', [48, 144, 58])
    ],
    C: [
      upp('vinklar', 'C1', { fraga: 'I en likbent triangel är toppvinkeln dubbelt så stor som var och en av basvinklarna. Hur stora är vinklarna?' },
          [['A', 'den ena basvinkeln'], ['B', 'den andra basvinkeln'], ['C', 'toppvinkeln']], ['B = A', 'C = 2·A'], 'A + B + C = 180', 'grader', [45, 45, 90]),
      upp('vinklar', 'C2', { fraga: 'I en rätvinklig triangel är den ena spetsiga vinkeln 3 gånger så stor som den andra. Hur stora är de spetsiga vinklarna?' },
          [['A', 'den mindre spetsiga vinkeln'], ['B', 'den större spetsiga vinkeln']], ['B = 3·A'], 'A + B + 90 = 180', 'grader', [22.5, 67.5]),
      upp('vinklar', 'C3', { fraga: 'I en triangel är vinkel B fyra gånger så stor som vinkel A. Vinkel C är fem gånger så stor som vinkel A. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C']], ['B = 4·A', 'C = 5·A'], 'A + B + C = 180', 'grader', [18, 72, 90]),
      upp('vinklar', 'C4', { fraga: 'I en triangel är vinkel B 15° större än vinkel A. Vinkel C är 30° större än vinkel B. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C']], ['B = A + 15', 'C = B + 30'], 'A + B + C = 180', 'grader', [40, 55, 85]),
      upp('vinklar', 'C5', { fraga: 'I en fyrhörning är vinkel B 20° större än vinkel A. Vinkel C är dubbelt så stor som vinkel A och vinkel D är 20° mindre än vinkel C. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C'], ['D', 'vinkel D']], ['B = A + 20', 'C = 2·A', 'D = C - 20'], 'A + B + C + D = 360', 'grader', [60, 80, 120, 100]),
      upp('vinklar', 'C6', { fraga: 'I fyrhörningen ABCD är vinkel A 75° och vinkel B 105°. Vinkel C är dubbelt så stor som vinkel D. Hur stora är vinklarna C och D?' },
          [['D', 'vinkel D'], ['C', 'vinkel C']], ['C = 2·D'], '75 + 105 + C + D = 360', 'grader', [60, 120])
    ],
    D: [
      upp('vinklar', 'D1', { fraga: 'I en triangel är två av vinklarna lika stora. Den tredje vinkeln är 18° mindre än var och en av dem. Hur stora är vinklarna?' },
          [['A', 'den ena lika stora vinkeln'], ['B', 'den andra lika stora vinkeln'], ['C', 'den tredje vinkeln']], ['B = A', 'C = A - 18'], 'A + B + C = 180', 'grader', [66, 66, 48]),
      upp('vinklar', 'D2', { fraga: 'I en rätvinklig triangel är den ena spetsiga vinkeln 40° mindre än den andra. Hur stora är de spetsiga vinklarna?' },
          [['A', 'den större spetsiga vinkeln'], ['B', 'den mindre spetsiga vinkeln']], ['B = A - 40'], 'A + B + 90 = 180', 'grader', [65, 25]),
      upp('vinklar', 'D3', { fraga: 'I en triangel är vinkel B tre gånger så stor som vinkel A. Vinkel C är 30° mindre än vinkel B. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C']], ['B = 3·A', 'C = B - 30'], 'A + B + C = 180', 'grader', [30, 90, 60]),
      upp('vinklar', 'D4', { fraga: 'I en triangel är vinkel A 12° mindre än vinkel B. Vinkel C är 18° större än vinkel B. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C']], ['A = B - 12', 'C = B + 18'], 'A + B + C = 180', 'grader', [46, 58, 76]),
      upp('vinklar', 'D5', { fraga: 'I en fyrhörning är vinklarna A och C lika stora. Vinkel B är tre gånger så stor som vinkel A, och vinkel D är 30° större än vinkel A. Hur stora är vinklarna?' },
          [['A', 'vinkel A'], ['B', 'vinkel B'], ['C', 'vinkel C'], ['D', 'vinkel D']], ['C = A', 'B = 3·A', 'D = A + 30'], 'A + B + C + D = 360', 'grader', [55, 165, 55, 85]),
      upp('vinklar', 'D6', { fraga: 'En fyrhörning har två räta vinklar. Av de andra två vinklarna är den ena 40° större än den andra. Hur stora är de två vinklarna?' },
          [['A', 'den mindre vinkeln'], ['B', 'den större vinkeln']], ['B = A + 40'], '90 + 90 + A + B = 360', 'grader', [70, 110])
    ]
  } }
];

// ── TESTEN: "Problemlösning – blandade uppgifter 1 och 2", sex frågor var, som Joachim skrev dem.
// Frågorna ur sjuans typer står ORDAGRANT i banken ovan och refereras med sitt id.
// Fråga 3 i test 1 och fråga 5 i test 2 hör till kategori 3.2 (fyra–sex personer, rabatter). Den är
// inget byggt moment i sjuan och finns inte i banken — den står här som FÖRFATTAT testinnehåll,
// Joachims text och facit (order 2026-11-19). Ingen nod: svaren loggas inte till någon sjuan-nod.
function test32(id, text, d, relationer, villkor, facit){
  return { id: 'p7-test-' + id, typ: 'rabatter', nod: null, niva: 1, variabel: 'x', fraga: text.fraga,
           delar: d.map(function(p){ return { nyckel: p[0], namn: p[1] }; }), relationer: relationer, villkor: [villkor],
           enhet: 'kr', svarDelar: d.map(function(p){ return p[0]; }), facit: facit };
}
var TEST = [
  { id: 'test1', titel: 'Test 1', uppgifter: ['omkrets-C3', 'instruktion-B5',
      test32('1-3', { fraga: 'Fyra kompisar köper likadana hoodies. Två betalar fullpris. En har medlemskort och får 30 % rabatt, och en har studentkort och får 40 % rabatt. Tillsammans betalar de 1 320 kr. Vad kostar en hoodie till fullpris?' },
             [['F', 'fullpris'], ['M', 'med medlemskort'], ['S', 'med studentkort']], ['M = 0,7·F', 'S = 0,6·F'], '2·F + M + S = 1320', [400, 280, 240]),
      'foljd-C6', 'vinklar-A5', 'delar-C5'] },
  { id: 'test2', titel: 'Test 2', uppgifter: ['delar-D6', 'vinklar-D2', 'foljd-D4', 'omkrets-A6',
      test32('2-5', { fraga: 'Fem personer köper skidpaket: två vuxna, en ungdom och två barn. Ungdomen får 20 % rabatt och barnen 45 % rabatt. Tillsammans kostar paketen 9 360 kr. Vad kostar ett skidpaket för en vuxen?' },
             [['V', 'vuxen'], ['U', 'ungdom'], ['B', 'barn']], ['U = 0,8·V', 'B = 0,55·V'], '2·V + U + 2·B = 9360', [2400, 1920, 1320]),
      'instruktion-C6'] }
];

// ── BLANDADE UPPGIFTER (order 2026-11-21): sjätte posten i nivåns uppgiftslista, efter Vinklar. Joachims
// författade blandade blad, ordagrant med facit per ruta (§K-K), serverade ett i taget av den återanvändbara
// komponenten js/motor/problemlosning/prob-blandade.js. Bara uppgifter — ingen egen metodträning, inget eget
// test (Test 1 och 2 står kvar under Test). Per nivå: { niva, nr, titel, kallTyper, antalPerBlad, antalBlad,
// blad: [{ id, uppgifter: [upp/ins/fo …] }] }. Nivå 2–4 läggs till som nya poster här, utan nytt bygge.
// BLADEN SAKNAS ÄNNU: dokumentet med de sex blandade bladen har inte kommit fram (vantar). Tills dess står
// posten tonad, utan länk — inget blandas eller genereras i väntan på det.
var BLANDADE = {
  1: { niva: 1, titel: 'Blandade uppgifter', antalPerBlad: 8, antalBlad: 6,
       vantar: 'Joachims dokument med de sex blandade bladen (åtta uppgifter per blad)',
       blad: [] }
};
// Postens konfiguration för en nivå, i komponentens form. Källtyperna = nivåns typer (de fem), numret = nästa
// efter dem (Blad 6A, 6B, …).
function blandade(niva){
  var b = BLANDADE[niva]; if(!b) return null;
  return { id: 'ak7-niva' + niva, niva: b.niva, nr: TYPER.length + 1, titel: b.titel,
           kallTyper: TYPER.map(function(t){ return t.id; }), antalPerBlad: b.antalPerBlad, antalBlad: b.antalBlad,
           vantar: b.blad.length ? null : b.vantar, blad: b.blad };
}

var BOKSTAVER = ['A', 'B', 'C', 'D'];
var UPPGIFTSBLAD = ['A', 'B'];

function typ(id){ return TYPER.filter(function(t){ return t.id === id; })[0] || null; }
function uppgift(ref){
  var p = String(ref).split('-'), t = typ(p[0]); if(!t) return null;
  var b = t.blad[p[1].charAt(0)]; return b ? (b[parseInt(p[1].slice(1), 10) - 1] || null) : null;
}
// Bladets nummer = typens plats (1–5), bokstaven = varianten: "Blad 1A" (KONVENTIONER, Arbetssidan).
function nr(typId){ return TYPER.indexOf(typ(typId)) + 1; }
// Ett blad i bladkomponenternas form: { id, titel, nod, uppgifter }
function blad(typId, bokstav){
  var t = typ(typId); if(!t || !t.blad[bokstav]) return null;
  return { id: t.id + '-' + bokstav, titel: 'Blad ' + nr(typId) + bokstav + ' · ' + t.titel, nod: t.nod, uppgifter: t.blad[bokstav] };
}
// Ett test i bladkomponenternas form. En fråga är ett id ur banken eller en författad uppgift (3.2).
// Testet ritas med ProbBlad2.render; frågor med form 'ekvation' (Följa instruktion) ritas där i
// ekvationsformen — svarsformen följer frågans typ.
function testBlad(testId){
  var te = TEST.filter(function(x){ return x.id === testId; })[0]; if(!te) return null;
  return { id: te.id, titel: te.titel, nod: null,
           uppgifter: te.uppgifter.map(function(x){ return typeof x === 'string' ? uppgift(x) : x; }) };
}
// Variant k (1–6) av en typ, i bladordning A–D — metodträningens bank för den varianten.
function variantBank(typId, k){
  var t = typ(typId); if(!t) return [];
  return BOKSTAVER.map(function(b){ return t.blad[b][k - 1]; }).filter(Boolean);
}

// ── RITA ETT BLAD: samma val av komponent överallt där bankens blad visas (uppgiftssidan och
// metodträningens drill i ramen). Följa instruktion = ekvationsformen (ProbBlad), övriga = femstegsformen.
function rita(mount, b, form){
  var R = (form === 'instruktion') ? window.ProbBlad : window.ProbBlad2;
  return R && R.render ? R.render(mount, b) : null;
}

// ── KNAPPSATSEN: en delad, fast (AK8_UI), med kedjans byggare (bråk, potens). Samma montering på
// uppgiftssidan och i ramens drill. Returnerar knappsatsen (en per sida).
function knappsats(){
  var finns = document.getElementById('prob-keypad'); if(finns) return finns;
  if(!(window.AK8_UI && AK8_UI.keypadHTML)) return null;
  var w = document.createElement('div'); w.innerHTML = AK8_UI.keypadHTML({ vars: 'x' });
  var kp = w.firstChild; if(!kp) return null;
  kp.id = 'prob-keypad'; document.body.appendChild(kp);
  AK8_UI.bindKeypad(document.body, { byggare: window.EkvKedja && EkvKedja.byggare });
  return kp;
}

// ── METODTRÄNINGENS FÖRFATTADE KÄLLA (order 2026-11-19). Kartans löv för en variant deklarerar
// bank: 'prob-ak7:<typ>/<variant>' (t.ex. 'prob-ak7:instruktion/1'). Ramens drill
// (js/motor/ovamer/k3-forfattad-kalla.js) hämtar här varianternas instanser: uppgift nr k på
// Blad A, B, C, D, i den ordningen. Nytt blad = nästa bokstav. Horisonten är typens: Nivå 1 = åk7.
// EFTER D (order 2026-11-20): fler blad INOM BANDET — gen-prob-ak7.js byter talen i ett av exemplen A–D,
// meningen oförändrad, aldrig svårare. nasta(i) ger blad nr i (0 = A … 3 = D, 4 = E, …) eller null när
// varianten inte bär fler (flaggad: inget dåligt blad serveras). Från 2026-11-21 byts också personnamnen i
// de genererade bladen (konsekvent, samma kön, rätt genitiv); A–D behåller dokumentens namn.
function bladBokstav(i){ return i < 26 ? String.fromCharCode(65 + i) : String(i + 1); }
function drillKalla(ref){
  var p = String(ref || '').split('/'), t = typ(p[0]), k = parseInt(p[1], 10);
  if(!t || !(k >= 1 && k <= t.varianter.length)) return null;
  var v = t.varianter[k - 1];
  function blad1(bokstav, u){
    return { bokstav: bokstav, blad: { id: 'drill-' + t.id + '-v' + k + '-' + bokstav, titel: t.titel + ' · ' + v.titel + ' · Blad ' + bokstav,
                                       nod: t.nod, uppgifter: [u] } };
  }
  var instanser = BOKSTAVER.map(function(b){ return blad1(b, t.blad[b][k - 1]); });
  var GEN = (typeof window !== 'undefined' && window.ProbGenAk7) ||
            (typeof require === 'function' ? (function(){ try { return require('./gen-prob-ak7.js'); } catch(e){ return null; } })() : null);
  var gen = GEN ? GEN.variant(instanser.map(function(x){ return x.blad.uppgifter[0]; }), ref) : null;
  return {
    arskurs: 7, form: t.form, titel: t.titel + ' · ' + v.titel,
    instanser: instanser,
    nasta: function(i){
      if(i < instanser.length) return instanser[i];
      var u = gen && gen.generera(i - instanser.length);
      if(!u) return null;
      if(t.form === 'instruktion') u.form = 'ekvation';
      return blad1(bladBokstav(i), u);
    },
    rita: function(mount, b){ return rita(mount, b, t.form); }
  };
}

var API = { TYPER: TYPER, TEST: TEST, BOKSTAVER: BOKSTAVER, UPPGIFTSBLAD: UPPGIFTSBLAD,
            typ: typ, nr: nr, uppgift: uppgift, blad: blad, testBlad: testBlad, variantBank: variantBank,
            rita: rita, knappsats: knappsats, drillKalla: drillKalla, BLANDADE: BLANDADE, blandade: blandade };
if(typeof window !== 'undefined') window.ProbBankAk7 = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
