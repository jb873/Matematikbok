/* blad-k4-d1-andelen.js — MOMENTET "ANDELEN" (åk 7, kapitel 4 Procent, Del 1, moment 2): Blad 1–6, variant A.
   Källa: doc/innehall/k4-d1-procent-moment2.md — Joachims klartext (version 2, facit kontrollräknat, 51 uppgifter),
   ordagrant. Rubrikerna och frågetexterna står som i filen; hakparenteserna visas inte. Inga hjälptexter.
   SVARSRADEN är fast i alla uppgifter (Joachim 2026-11-26): Andelen = ▢ = ▢ = ▢ = ▢ % — bladkärnans formkedja:
     ruta 1  delen / det hela EXAKT, rättas på form (48/600 godkänns, 8/100 inte) — formrutan 'exakt', staplad
     ruta 2  krävs: ett bråk med samma värde (förlängt, förkortat eller förenklat), rättas på värde — formrutan 'brak'
     ruta 3  decimalform, VALFRI: får lämnas tom; ifylld rättas den på värde — formrutan 'decimal' med valfri
     ruta 4  procent, rättas på värde — formrutan 'procent'
   Facit visar Joachims form (mellanledet ur klartexten). Blad 6 nr 1–3: två svarsrader och sedan valrutan; nr 4–9:
   valrutan. Blad 3 nr 5: tabellen med den befintliga tabellkomponenten (tabell med matris).
   Spärren: NivaRad — Blad 1 och 2 alltid öppna, därefter 80 % rätta rutor på bladet före.
   Mastery (kapitel 4:s store): lövet "Andelen" (proc-andelen:rakna, js/data/k4-taxonomi.js). Ingen nätväg. */
(function(){
'use strict';
var P = window.BLAD_K4_D1_PROCENT; if(!P) return;
var Y = P.TYPER, ANDELEN = 'proc-andelen:rakna';
function rund(v){ return Math.round(v * 1e6) / 1e6; }
function g(rubrik, rader){ return Y.g(rubrik, rader); }
function medNod(blad){ return Y.medNod(ANDELEN, blad); }
var ORD = { andelen: { vansterText: 'Andelen' }.vansterText };
/* SVARSRADEN: "Andelen = del/hela = mellanled = decimal (valfri) = procent %". fraga: texten före raden ("9 av 20?",
   "Alva:"), eller ingen när frågan är uppgiftens rubrik. */
function andel(fraga, del, hela, mellan){
  var v = del / hela, r = { typ: 'flerled', vansterText: ORD.andelen, led: [
    { form: 'exakt', svar: del + '/' + hela }, { form: 'brak', svar: mellan },
    { form: 'decimal', svar: rund(v), valfri: true }, { form: 'procent', svar: rund(100 * v) } ] };
  if(fraga) r.etikett = fraga;
  return r;
}
// Flerval med valrutan: ett rätt alternativ ("A. Alva").
function val(alt, ratt, fraga){ var r = { typ: 'valruta', matte: true, alt: alt, ratt: [ratt] }; if(fraga) r.fraga = fraga; return r; }
function dok(blad, tak){
  return { del: 'Del 1 Procent', moment: 'Andelen', blad: blad, arskurs: 7, roll: 'kärna', metod: 'Andelen = delen / det hela',
           takregel: tak, kalla: 'doc/innehall/k4-d1-procent-moment2.md' };
}
/* Elevtext i fält (elevtext-låset). Ordagrant ur klartexten. */
var T = {
  b1: { titel: '"x av y"' }.titel, b2: { titel: 'Lästal' }.titel, b3: { titel: 'Det hela räknas ut först' }.titel,
  b4: { titel: 'Delen läggs ihop eller är det som är kvar' }.titel, b5: { titel: 'Byta enhet och tid' }.titel,
  b6: { titel: 'Jämföra och hitta felet' }.titel
};
var I = { hur: { intro: 'Hur många procent är …' }.intro, valj: { intro: 'Välj rätt alternativ.' }.intro };
var R = {
  forl: { rubrik: 'Förlänga' }.rubrik, fork: { rubrik: 'Förkorta' }.rubrik, enk: { rubrik: 'Enklaste form' }.rubrik,
  bland: { rubrik: 'Blandat' }.rubrik
};
function q(t){ return { rubrik: t }.rubrik; }
var BLAD = {};

/* ── BLAD 1A — "x av y" ── */
BLAD['1A'] = function(){ return medNod({ titel: T.b1, intro: I.hur, dokument: dok('1A', 'golv'), grupper: [
  g(R.forl, [ andel('9 av 20?', 9, 20, '45/100'), andel('7 av 25?', 7, 25, '28/100'), andel('13 av 50?', 13, 50, '26/100'),
              andel('3 av 20?', 3, 20, '15/100') ]),
  g(R.fork, [ andel('18 av 300?', 18, 300, '6/100'), andel('28 av 400?', 28, 400, '7/100'), andel('44 av 1100?', 44, 1100, '4/100'),
              andel('45 av 900?', 45, 900, '5/100') ]),
  g(R.enk, [ andel('6 av 8?', 6, 8, '3/4'), andel('12 av 15?', 12, 15, '4/5'), andel('7 av 28?', 7, 28, '1/4'),
             andel('15 av 30?', 15, 30, '1/2') ]),
  g(R.bland, [ andel('17 av 25?', 17, 25, '68/100'), andel('32 av 800?', 32, 800, '4/100'), andel('18 av 45?', 18, 45, '2/5'),
               andel('11 av 20?', 11, 20, '55/100'), andel('54 av 600?', 54, 600, '9/100'), andel('33 av 44?', 33, 44, '3/4') ])
] }); };

/* ── BLAD 2A — Lästal ── */
BLAD['2A'] = function(){ return medNod({ titel: T.b2, dokument: dok('2A', 'golv'), grupper: [
  g(q('I en klass går 25 elever. 9 av dem spelar fotboll. Hur många procent av eleverna spelar fotboll?'), [ andel(null, 9, 25, '36/100') ]),
  g(q('På en skola går 600 elever. 42 av dem cyklar till skolan. Hur många procent av eleverna cyklar?'), [ andel(null, 42, 600, '7/100') ]),
  g(q('Ella har 40 kr. Hon köper en glass för 30 kr. Hur många procent av pengarna använder hon till glassen?'), [ andel(null, 30, 40, '3/4') ]),
  g(q('Ett lag sköt 20 straffar och gjorde mål på 17. Hur många procent av straffarna blev mål?'), [ andel(null, 17, 20, '85/100') ]),
  g(q('En bok har 300 sidor. Noah har läst 27 sidor. Hur många procent av boken har han läst?'), [ andel(null, 27, 300, '9/100') ]),
  g(q('I en grupp finns 16 elever. 12 av dem har en egen cykel. Hur många procent av eleverna har en egen cykel?'), [ andel(null, 12, 16, '3/4') ]),
  g(q('I ett lotteri finns 50 lotter. 7 av dem ger vinst. Hur många procent av lotterna ger vinst?'), [ andel(null, 7, 50, '14/100') ]),
  g(q('En glasskiosk sålde 800 glassar en dag. 64 av dem var chokladglass. Hur många procent av glassarna var chokladglass?'), [ andel(null, 64, 800, '8/100') ]),
  g(q('Av 30 elever i en klass har 12 glasögon. Hur många procent av eleverna har glasögon?'), [ andel(null, 12, 30, '2/5') ])
] }); };

/* ── BLAD 3A — Det hela räknas ut först ── */
BLAD['3A'] = function(){ return medNod({ titel: T.b3, dokument: dok('3A', 'mellan'), grupper: [
  g(q('I en klass finns 12 flickor och 13 pojkar. Hur många procent av eleverna är flickor?'), [ andel(null, 12, 25, '48/100') ]),
  g(q('På en konsert var 186 vuxna och 14 barn. Hur många procent av besökarna var barn?'), [ andel(null, 14, 200, '7/100') ]),
  g(q('Ett lag vann 9 matcher, spelade oavgjort i 4 och förlorade 2. Hur många procent av matcherna vann laget?'), [ andel(null, 9, 15, '3/5') ]),
  g(q('I en påse finns 7 röda, 5 gröna och 8 gula godisbitar. Hur många procent av godisbitarna är röda?'), [ andel(null, 7, 20, '35/100') ]),
  // Tabellen (befintlig tabellkomponent): klartextens "Antal syskon 0 – 3 elever. 1 – 10 elever. 2 – 6 elever. 3 eller fler – 1 elev."
  // "Hur många procent av eleverna har" står sist i rubriken, före a) och b), som i filen.
  g(q('Tabellen visar hur många syskon eleverna i en grupp har. Hur många procent av eleverna har'), [
    { typ: 'tabell', huvud: 'kolumn', matris: [
      [{ etikett: 'Antal syskon' }.etikett, '0', '1', '2', { etikett: '3 eller fler' }.etikett],
      ['', { etikett: '3 elever' }.etikett, { etikett: '10 elever' }.etikett, { etikett: '6 elever' }.etikett, { etikett: '1 elev' }.etikett] ] },
    andel('inga syskon?', 3, 20, '15/100'), andel('ett syskon?', 10, 20, '1/2') ]),
  g(q('På en skola finns 552 elever och 48 vuxna. Hur många procent av alla på skolan är vuxna?'), [ andel(null, 48, 600, '8/100') ]),
  g(q('Hur många procent är 18 av 24?'), [ andel(null, 18, 24, '3/4') ]),
  g(q('En korg innehåller 300 äpplen. 21 av dem är ruttna. Hur många procent av äpplena är ruttna?'), [ andel(null, 21, 300, '7/100') ])
] }); };

/* ── BLAD 4A — Delen läggs ihop eller är det som är kvar ── */
BLAD['4A'] = function(){ return medNod({ titel: T.b4, dokument: dok('4A', 'mellan'), grupper: [
  g(q('I en klass med 25 elever har 6 elever en hund och 5 elever en katt. Ingen har både hund och katt. Hur många procent av eleverna har en hund eller en katt?'), [ andel(null, 11, 25, '44/100') ]),
  g(q('Ett lag spelade 16 matcher. De vann 7 och spelade oavgjort i 5. Resten förlorade de. Hur många procent av matcherna förlorade laget?'), [ andel(null, 4, 16, '1/4') ]),
  g(q('Noah har 800 kr. Han köper en jacka för 500 kr och en mössa för 228 kr. Hur många procent av pengarna har han kvar?'), [ andel(null, 72, 800, '9/100') ]),
  g(q('I en påse finns 50 kulor. 12 är röda, 15 är blå och resten är gula. Hur många procent av kulorna är röda eller blå?'), [ andel(null, 27, 50, '54/100') ]),
  g(q('En hylla har plats för 24 böcker. Där står 12 deckare och 6 fantasyböcker. Resten av platserna är tomma. Hur många procent av platserna är fyllda?'), [ andel(null, 18, 24, '3/4') ]),
  g(q('Ett bibliotek lånade ut 700 böcker en vecka. 35 var serieböcker och 21 var ljudböcker. Hur många procent av böckerna var serieböcker eller ljudböcker?'), [ andel(null, 56, 700, '8/100') ]),
  g(q('En simhall hade 20 besökare en morgon. 13 av dem var barn. Hur många procent av besökarna var barn?'), [ andel(null, 13, 20, '65/100') ]),
  g(q('I en grupp finns 9 flickor och 6 pojkar. Hur många procent av gruppen är pojkar?'), [ andel(null, 6, 15, '2/5') ])
] }); };

/* ── BLAD 5A — Byta enhet och tid ── */
BLAD['5A'] = function(){ return medNod({ titel: T.b5, intro: I.hur, dokument: dok('5A', 'mellan'), grupper: [
  g(q('45 minuter av en timme?'), [ andel(null, 45, 60, '3/4') ]),
  g(q('12 minuter av en timme?'), [ andel(null, 12, 60, '1/5') ]),
  g(q('30 minuter av 2 timmar?'), [ andel(null, 30, 120, '1/4') ]),
  g(q('3 dm av 2 m?'), [ andel(null, 3, 20, '15/100') ]),
  g(q('7 dl av 2 liter?'), [ andel(null, 7, 20, '35/100') ]),
  g(q('63 cm av 7 m?'), [ andel(null, 63, 700, '9/100') ]),
  g(q('48 cm av 6 m?'), [ andel(null, 48, 600, '8/100') ]),
  g(q('I en kör sjunger 16 flickor och 9 pojkar. Hur många procent av körens medlemmar är pojkar?'), [ andel(null, 9, 25, '36/100') ]),
  g(q('Mira har 500 kr. Hon köper en tröja för 300 kr och en mössa för 165 kr. Hur många procent av pengarna har hon kvar?'), [ andel(null, 35, 500, '7/100') ])
] }); };

/* ── BLAD 6A — Jämföra och hitta felet ── */
BLAD['6A'] = function(){ return medNod({ titel: T.b6, intro: I.valj, dokument: dok('6A', 'tak'), grupper: [
  g(q('Alva gjorde mål på 17 av 20 straffar. Leo gjorde mål på 21 av 25 straffar.'), [
    andel('Alva:', 17, 20, '85/100'), andel('Leo:', 21, 25, '84/100'),
    val(['A. Alva', 'B. Leo', 'C. De var lika bra'], 'A. Alva', { fraga: 'Vem var bäst?' }.fraga) ]),
  g(q('I klass 7A cyklar 9 av 20 elever till skolan. I klass 7B cyklar 12 av 25 elever.'), [
    andel('7A:', 9, 20, '45/100'), andel('7B:', 12, 25, '48/100'),
    val(['A. 7A', 'B. 7B', 'C. Andelen är lika stor'], 'B. 7B', { fraga: 'I vilken klass är andelen som cyklar störst?' }.fraga) ]),
  g(q('Kim fick 39 av 50 poäng på prov 1 och 18 av 24 poäng på prov 2.'), [
    andel('Prov 1:', 39, 50, '78/100'), andel('Prov 2:', 18, 24, '3/4'),
    val(['A. Prov 1', 'B. Prov 2', 'C. Lika bra på båda'], 'A. Prov 1', { fraga: 'På vilket prov lyckades Kim bäst?' }.fraga) ]),
  g(q('Vilken andel är störst?'), [ val(['A. 2 av 25', 'B. 7 av 100', 'C. 36 av 400'], 'C. 36 av 400') ]),
  g(q('Ida räknade så här: "Av 20 elever är 5 flickor. Andelen flickor = 5/15 = 1/3 ≈ 33 %."'), [
    val(['A. Hon har räknat med pojkarna som det hela.', 'B. Hon har förkortat fel.', 'C. Inget är fel.'],
        'A. Hon har räknat med pojkarna som det hela.', { fraga: 'Vad är fel?' }.fraga),
    val(['A. 33 %', 'B. 25 %', 'C. 5 %'], 'B. 25 %', { fraga: 'Hur många procent av eleverna är flickor?' }.fraga) ]),
  g(q('Omar räknade så här: "I en påse finns 8 röda och 12 gula kulor. Andelen röda = 8/12 = 2/3 ≈ 67 %." Vad är fel?'), [
    val(['A. Inget är fel.', 'B. Han har förkortat fel.', 'C. Han har delat med de gula kulorna i stället för med alla kulor.'],
        'C. Han har delat med de gula kulorna i stället för med alla kulor.') ]),
  g(q('Sara räknade så här: "Andelen = 7/25 = 7/100 = 7 %." Vad är fel?'), [
    val(['A. Hon har förkortat i stället för att förlänga.', 'B. Hon har förlängt nämnaren men inte täljaren.', 'C. Inget är fel.'],
        'B. Hon har förlängt nämnaren men inte täljaren.') ]),
  g(q('Hur många procent är 15 minuter av en timme?'), [ val(['A. 15 %', 'B. 25 %', 'C. 40 %'], 'B. 25 %') ]),
  g(q('Ett fotbollslag spelade 20 matcher. Laget vann 8 matcher och spelade oavgjort i 3. Hur många procent av matcherna vann laget eller spelade oavgjort?'), [
    val(['A. 11 %', 'B. 40 %', 'C. 55 %'], 'C. 55 %') ])
] }); };

/* MOMENTET: sex blad, variant A. Spärren: NivaRad, krav 80 % rätta rutor på bladet före; Blad 1 och 2 alltid öppna. */
var MOMENT = { titel: 'Andelen', varianter: ['A'],
  nivaPrefix: 'k4d1', nivaId: 'andelen', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: T.b1 }, { nr: 2, titel: T.b2 }, { nr: 3, titel: T.b3 }, { nr: 4, titel: T.b4 }, { nr: 5, titel: T.b5 },
          { nr: 6, titel: T.b6 } ] };

window.BLAD_K4_D1_ANDELEN = {
  MOMENT: MOMENT,
  // Svarsraden och valrutan för testet och metodträningen (blad-k4-d1-test.js, blad-k4-d1-metod.js): samma rad som bladen.
  TYPER: { andel: andel, val: val, ANDELEN: ANDELEN },
  blad: function(id){ var f = BLAD[String(id || '').toUpperCase()]; return f ? f() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
