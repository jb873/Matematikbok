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
/* ELEVTEXTEN STÅR I FÄLT som låset läser (verktyg/elevtext-grind.js, Joachim 2026-11-27): rubrikerna i { rubrik: '…' },
   frågetexten före svarsraden i { etikett: '…' }. En hjälpfunktion q('…') döljer texten för låset. */
var BLAD = {};

/* ── BLAD 1A — "x av y" ── */
BLAD['1A'] = function(){ return medNod({ titel: T.b1, intro: I.hur, dokument: dok('1A', 'golv'), grupper: [
  g(R.forl, [ andel({ etikett: '9 av 20?' }.etikett, 9, 20, '45/100'), andel({ etikett: '7 av 25?' }.etikett, 7, 25, '28/100'), andel({ etikett: '13 av 50?' }.etikett, 13, 50, '26/100'),
              andel({ etikett: '3 av 20?' }.etikett, 3, 20, '15/100') ]),
  g(R.fork, [ andel({ etikett: '18 av 300?' }.etikett, 18, 300, '6/100'), andel({ etikett: '28 av 400?' }.etikett, 28, 400, '7/100'), andel({ etikett: '44 av 1100?' }.etikett, 44, 1100, '4/100'),
              andel({ etikett: '45 av 900?' }.etikett, 45, 900, '5/100') ]),
  g(R.enk, [ andel({ etikett: '6 av 8?' }.etikett, 6, 8, '3/4'), andel({ etikett: '12 av 15?' }.etikett, 12, 15, '4/5'), andel({ etikett: '7 av 28?' }.etikett, 7, 28, '1/4'),
             andel({ etikett: '15 av 30?' }.etikett, 15, 30, '1/2') ]),
  g(R.bland, [ andel({ etikett: '17 av 25?' }.etikett, 17, 25, '68/100'), andel({ etikett: '32 av 800?' }.etikett, 32, 800, '4/100'), andel({ etikett: '18 av 45?' }.etikett, 18, 45, '2/5'),
               andel({ etikett: '11 av 20?' }.etikett, 11, 20, '55/100'), andel({ etikett: '54 av 600?' }.etikett, 54, 600, '9/100'), andel({ etikett: '33 av 44?' }.etikett, 33, 44, '3/4') ])
] }); };

/* ── BLAD 2A — Lästal ── */
BLAD['2A'] = function(){ return medNod({ titel: T.b2, dokument: dok('2A', 'golv'), grupper: [
  g({ rubrik: 'I en klass går 25 elever. 9 av dem spelar fotboll. Hur många procent av eleverna spelar fotboll?' }.rubrik, [ andel(null, 9, 25, '36/100') ]),
  g({ rubrik: 'På en skola går 600 elever. 42 av dem cyklar till skolan. Hur många procent av eleverna cyklar?' }.rubrik, [ andel(null, 42, 600, '7/100') ]),
  g({ rubrik: 'Ella har 40 kr. Hon köper en glass för 30 kr. Hur många procent av pengarna använder hon till glassen?' }.rubrik, [ andel(null, 30, 40, '3/4') ]),
  g({ rubrik: 'Ett lag sköt 20 straffar och gjorde mål på 17. Hur många procent av straffarna blev mål?' }.rubrik, [ andel(null, 17, 20, '85/100') ]),
  g({ rubrik: 'En bok har 300 sidor. Noah har läst 27 sidor. Hur många procent av boken har han läst?' }.rubrik, [ andel(null, 27, 300, '9/100') ]),
  g({ rubrik: 'I en grupp finns 16 elever. 12 av dem har en egen cykel. Hur många procent av eleverna har en egen cykel?' }.rubrik, [ andel(null, 12, 16, '3/4') ]),
  g({ rubrik: 'I ett lotteri finns 50 lotter. 7 av dem ger vinst. Hur många procent av lotterna ger vinst?' }.rubrik, [ andel(null, 7, 50, '14/100') ]),
  g({ rubrik: 'En glasskiosk sålde 800 glassar en dag. 64 av dem var chokladglass. Hur många procent av glassarna var chokladglass?' }.rubrik, [ andel(null, 64, 800, '8/100') ]),
  g({ rubrik: 'Av 30 elever i en klass har 12 glasögon. Hur många procent av eleverna har glasögon?' }.rubrik, [ andel(null, 12, 30, '2/5') ])
] }); };

/* ── BLAD 3A — Det hela räknas ut först ── */
BLAD['3A'] = function(){ return medNod({ titel: T.b3, dokument: dok('3A', 'mellan'), grupper: [
  g({ rubrik: 'I en klass finns 12 flickor och 13 pojkar. Hur många procent av eleverna är flickor?' }.rubrik, [ andel(null, 12, 25, '48/100') ]),
  g({ rubrik: 'På en konsert var 186 vuxna och 14 barn. Hur många procent av besökarna var barn?' }.rubrik, [ andel(null, 14, 200, '7/100') ]),
  g({ rubrik: 'Ett lag vann 9 matcher, spelade oavgjort i 4 och förlorade 2. Hur många procent av matcherna vann laget?' }.rubrik, [ andel(null, 9, 15, '3/5') ]),
  g({ rubrik: 'I en påse finns 7 röda, 5 gröna och 8 gula godisbitar. Hur många procent av godisbitarna är röda?' }.rubrik, [ andel(null, 7, 20, '35/100') ]),
  // Tabellen (befintlig tabellkomponent): klartextens "Antal syskon 0 – 3 elever. 1 – 10 elever. 2 – 6 elever. 3 eller fler – 1 elev."
  // "Hur många procent av eleverna har" står sist i rubriken, före a) och b), som i filen.
  g({ rubrik: 'Tabellen visar hur många syskon eleverna i en grupp har. Hur många procent av eleverna har' }.rubrik, [
    { typ: 'tabell', huvud: 'kolumn', matris: [
      [{ etikett: 'Antal syskon' }.etikett, '0', '1', '2', { etikett: '3 eller fler' }.etikett],
      ['', { etikett: '3 elever' }.etikett, { etikett: '10 elever' }.etikett, { etikett: '6 elever' }.etikett, { etikett: '1 elev' }.etikett] ] },
    andel({ etikett: 'inga syskon?' }.etikett, 3, 20, '15/100'), andel({ etikett: 'ett syskon?' }.etikett, 10, 20, '1/2') ]),
  g({ rubrik: 'På en skola finns 552 elever och 48 vuxna. Hur många procent av alla på skolan är vuxna?' }.rubrik, [ andel(null, 48, 600, '8/100') ]),
  g({ rubrik: 'Hur många procent är 18 av 24?' }.rubrik, [ andel(null, 18, 24, '3/4') ]),
  g({ rubrik: 'En korg innehåller 300 äpplen. 21 av dem är ruttna. Hur många procent av äpplena är ruttna?' }.rubrik, [ andel(null, 21, 300, '7/100') ])
] }); };

/* ── BLAD 4A — Delen läggs ihop eller är det som är kvar ── */
BLAD['4A'] = function(){ return medNod({ titel: T.b4, dokument: dok('4A', 'mellan'), grupper: [
  g({ rubrik: 'I en klass med 25 elever har 6 elever en hund och 5 elever en katt. Ingen har både hund och katt. Hur många procent av eleverna har en hund eller en katt?' }.rubrik, [ andel(null, 11, 25, '44/100') ]),
  g({ rubrik: 'Ett lag spelade 16 matcher. De vann 7 och spelade oavgjort i 5. Resten förlorade de. Hur många procent av matcherna förlorade laget?' }.rubrik, [ andel(null, 4, 16, '1/4') ]),
  g({ rubrik: 'Noah har 800 kr. Han köper en jacka för 500 kr och en mössa för 228 kr. Hur många procent av pengarna har han kvar?' }.rubrik, [ andel(null, 72, 800, '9/100') ]),
  g({ rubrik: 'I en påse finns 50 kulor. 12 är röda, 15 är blå och resten är gula. Hur många procent av kulorna är röda eller blå?' }.rubrik, [ andel(null, 27, 50, '54/100') ]),
  g({ rubrik: 'En hylla har plats för 24 böcker. Där står 12 deckare och 6 fantasyböcker. Resten av platserna är tomma. Hur många procent av platserna är fyllda?' }.rubrik, [ andel(null, 18, 24, '3/4') ]),
  g({ rubrik: 'Ett bibliotek lånade ut 700 böcker en vecka. 35 var serieböcker och 21 var ljudböcker. Hur många procent av böckerna var serieböcker eller ljudböcker?' }.rubrik, [ andel(null, 56, 700, '8/100') ]),
  g({ rubrik: 'En simhall hade 20 besökare en morgon. 13 av dem var barn. Hur många procent av besökarna var barn?' }.rubrik, [ andel(null, 13, 20, '65/100') ]),
  g({ rubrik: 'I en grupp finns 9 flickor och 6 pojkar. Hur många procent av gruppen är pojkar?' }.rubrik, [ andel(null, 6, 15, '2/5') ])
] }); };

/* ── BLAD 5A — Byta enhet och tid ── */
BLAD['5A'] = function(){ return medNod({ titel: T.b5, intro: I.hur, dokument: dok('5A', 'mellan'), grupper: [
  g({ rubrik: '45 minuter av en timme?' }.rubrik, [ andel(null, 45, 60, '3/4') ]),
  g({ rubrik: '12 minuter av en timme?' }.rubrik, [ andel(null, 12, 60, '1/5') ]),
  g({ rubrik: '30 minuter av 2 timmar?' }.rubrik, [ andel(null, 30, 120, '1/4') ]),
  g({ rubrik: '3 dm av 2 m?' }.rubrik, [ andel(null, 3, 20, '15/100') ]),
  g({ rubrik: '7 dl av 2 liter?' }.rubrik, [ andel(null, 7, 20, '35/100') ]),
  g({ rubrik: '63 cm av 7 m?' }.rubrik, [ andel(null, 63, 700, '9/100') ]),
  g({ rubrik: '48 cm av 6 m?' }.rubrik, [ andel(null, 48, 600, '8/100') ]),
  g({ rubrik: 'I en kör sjunger 16 flickor och 9 pojkar. Hur många procent av körens medlemmar är pojkar?' }.rubrik, [ andel(null, 9, 25, '36/100') ]),
  g({ rubrik: 'Mira har 500 kr. Hon köper en tröja för 300 kr och en mössa för 165 kr. Hur många procent av pengarna har hon kvar?' }.rubrik, [ andel(null, 35, 500, '7/100') ])
] }); };

/* ── BLAD 6A — Jämföra och hitta felet ── */
BLAD['6A'] = function(){ return medNod({ titel: T.b6, intro: I.valj, dokument: dok('6A', 'tak'), grupper: [
  g({ rubrik: 'Alva gjorde mål på 17 av 20 straffar. Leo gjorde mål på 21 av 25 straffar.' }.rubrik, [
    andel({ etikett: 'Alva:' }.etikett, 17, 20, '85/100'), andel({ etikett: 'Leo:' }.etikett, 21, 25, '84/100'),
    val(['A. Alva', 'B. Leo', 'C. De var lika bra'], 'A. Alva', { fraga: 'Vem var bäst?' }.fraga) ]),
  g({ rubrik: 'I klass 7A cyklar 9 av 20 elever till skolan. I klass 7B cyklar 12 av 25 elever.' }.rubrik, [
    andel({ etikett: '7A:' }.etikett, 9, 20, '45/100'), andel({ etikett: '7B:' }.etikett, 12, 25, '48/100'),
    val(['A. 7A', 'B. 7B', 'C. Andelen är lika stor'], 'B. 7B', { fraga: 'I vilken klass är andelen som cyklar störst?' }.fraga) ]),
  g({ rubrik: 'Kim fick 39 av 50 poäng på prov 1 och 18 av 24 poäng på prov 2.' }.rubrik, [
    andel({ etikett: 'Prov 1:' }.etikett, 39, 50, '78/100'), andel({ etikett: 'Prov 2:' }.etikett, 18, 24, '3/4'),
    val(['A. Prov 1', 'B. Prov 2', 'C. Lika bra på båda'], 'A. Prov 1', { fraga: 'På vilket prov lyckades Kim bäst?' }.fraga) ]),
  g({ rubrik: 'Vilken andel är störst?' }.rubrik, [ val(['A. 2 av 25', 'B. 7 av 100', 'C. 36 av 400'], 'C. 36 av 400') ]),
  g({ rubrik: 'Ida räknade så här: "Av 20 elever är 5 flickor. Andelen flickor = 5/15 = 1/3 ≈ 33 %."' }.rubrik, [
    val(['A. Hon har räknat med pojkarna som det hela.', 'B. Hon har förkortat fel.', 'C. Inget är fel.'],
        'A. Hon har räknat med pojkarna som det hela.', { fraga: 'Vad är fel?' }.fraga),
    val(['A. 33 %', 'B. 25 %', 'C. 5 %'], 'B. 25 %', { fraga: 'Hur många procent av eleverna är flickor?' }.fraga) ]),
  g({ rubrik: 'Omar räknade så här: "I en påse finns 8 röda och 12 gula kulor. Andelen röda = 8/12 = 2/3 ≈ 67 %." Vad är fel?' }.rubrik, [
    val(['A. Inget är fel.', 'B. Han har förkortat fel.', 'C. Han har delat med de gula kulorna i stället för med alla kulor.'],
        'C. Han har delat med de gula kulorna i stället för med alla kulor.') ]),
  g({ rubrik: 'Sara räknade så här: "Andelen = 7/25 = 7/100 = 7 %." Vad är fel?' }.rubrik, [
    val(['A. Hon har förkortat i stället för att förlänga.', 'B. Hon har förlängt nämnaren men inte täljaren.', 'C. Inget är fel.'],
        'B. Hon har förlängt nämnaren men inte täljaren.') ]),
  g({ rubrik: 'Hur många procent är 15 minuter av en timme?' }.rubrik, [ val(['A. 15 %', 'B. 25 %', 'C. 40 %'], 'B. 25 %') ]),
  g({ rubrik: 'Ett fotbollslag spelade 20 matcher. Laget vann 8 matcher och spelade oavgjort i 3. Hur många procent av matcherna vann laget eller spelade oavgjort?' }.rubrik, [
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
