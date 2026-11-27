/* blad-k4-d1-delen.js — MOMENTET "DELEN" (åk 7, kapitel 4 Procent, Del 1, moment 3): Blad 1–6, variant A.
   Källa: doc/innehall/k4-d1-procent-moment3.md — Joachims klartext (version 1, facit kontrollräknat), ordagrant.
   Rubrikerna och frågetexterna står som i filen; hakparenteserna visas inte. Inga hjälptexter.
   STEGRADEN (Joachim 2026-11-27, bladkärnans 'stegrad'): Blad 1 nr 1, 2 och 4 och Blad 2–5 —
       100 % = ▢          ▢ % = ▢/▢ = ▢          ▢ % = ▢ · ▢ = ▢
     eleven väljer steget själv (1, 5, 10, 20, 25 eller 50 %); rättningen gäller värdet och att leden hänger ihop.
     Facit visar klartextens enklaste väg (rad.steg). Står steget redan på det sökta procenttalet får tredje raden vara
     tom. Enheten efter rutan följer uppgiften; där svaret har en egen enhet (48 barn av 800 besökare) står den sist.
   BRÅKRADEN (Blad 1 nr 3, 'brakrad'): 25 % = ▢ , (▢ · 800)/▢ = ▢ · ▢ = ▢ kr — bråket i enklaste form, övriga led på värde.
   Blad 6: tecknet och flervalet med valrutan, nr 3 ringa in (valrutan med flera rätt).
   Blad 5 nr 5–6: sträckan (SvgAlgebraFigur.strackfigur) och rektangeln med 40 rutor (SvgAndel.delRuta, kvadratiska).
   Spärren: NivaRad — Blad 1 och 2 alltid öppna, därefter 80 % rätta rutor på bladet före.
   Mastery (kapitel 4:s store): lövet "Delen" (proc-delen:rakna, js/data/k4-taxonomi.js). Ingen nätväg. */
(function(){
'use strict';
var P = window.BLAD_K4_D1_PROCENT; if(!P) return;
var Y = P.TYPER, DELEN = 'proc-delen:rakna', AN = window.SvgAndel, AF = window.SvgAlgebraFigur;
function g(rubrik, rader){ return Y.g(rubrik, rader); }
function medNod(blad){ return Y.medNod(DELEN, blad); }
/* STEGRADEN: fraga (deluppgiftens text eller ingen), det hela, det sökta procenttalet, facitvägens steg, enheten
   (rad 1–2) och svarets enhet när den är en annan. */
function st(fraga, hela, procent, steg, enhet, enhetSvar){
  var r = { typ: 'stegrad', hela: hela, procent: procent, steg: steg, enhet: enhet };
  if(fraga) r.fraga = fraga;
  if(enhetSvar) r.enhetSvar = enhetSvar;
  return r;
}
// BRÅKRADEN: procenttalet som bråk i enklaste form.
function br(fraga, hela, procent, brak, enhet){ return { typ: 'brakrad', fraga: fraga, hela: hela, procent: procent, brak: brak, enhet: enhet }; }
function val(alt, ratt, fraga, flera){
  var r = { typ: 'valruta', matte: true, alt: alt, ratt: [].concat(ratt) };
  if(fraga) r.fraga = fraga;
  if(flera) r.flera = true;
  return r;
}
function dok(blad, tak){
  return { del: 'Del 1 Procent', moment: 'Delen', blad: blad, arskurs: 7, roll: 'kärna', metod: 'Delen: 100 %, steget och faktorn',
           takregel: tak, kalla: 'doc/innehall/k4-d1-procent-moment3.md' };
}
/* Elevtext i fält (elevtext-låset). Ordagrant ur klartexten. */
var T = {
  b1: { titel: '"p % av x"' }.titel, b2: { titel: 'Lästal' }.titel, b3: { titel: 'Det som är kvar' }.titel,
  b4: { titel: 'Flera delar ur samma helhet' }.titel, b5: { titel: 'Rabatt i kronor, och figur eller sträcka' }.titel,
  b6: { titel: 'Jämföra och sant eller falskt' }.titel
};
var I = { hur: { intro: 'Hur mycket är …' }.intro };
var R = {
  en: { rubrik: '1 %' }.rubrik, tio: { rubrik: '10 %' }.rubrik, brak: { rubrik: 'Procent som bråk' }.rubrik,
  bland: { rubrik: 'Blandat' }.rubrik
};
/* ELEVTEXTEN STÅR I FÄLT som låset läser (verktyg/elevtext-grind.js, Joachim 2026-11-27): frågorna i { fraga: '…' },
   rubrikerna i { rubrik: '…' }, figurens text i { etikett: '…' }. En hjälpfunktion f('…') döljer texten för låset. */
var E = { kr: 'kr', elever: 'elever', g: 'g', besokare: 'besökare', barn: 'barn', m: 'm', trad: 'träd', ekar: 'ekar',
          bocker: 'böcker', sidor: 'sidor', lampor: 'lampor', platser: 'platser', min: 'min', mal: 'mål', mossor: 'mössor',
          mm: 'mm', rutor: 'rutor', l: 'l', ml: 'ml' };
var BLAD = {};

/* ── BLAD 1A — "p % av x" ── */
BLAD['1A'] = function(){ return medNod({ titel: T.b1, intro: I.hur, dokument: dok('1A', 'golv'), grupper: [
  g(R.en, [ st({ fraga: '7 % av 400 kr?' }.fraga, 400, 7, 1, E.kr), st({ fraga: '3 % av 900 kr?' }.fraga, 900, 3, 1, E.kr),
            st({ fraga: '6 % av 800 kr?' }.fraga, 800, 6, 1, E.kr), st({ fraga: '9 % av 500 kr?' }.fraga, 500, 9, 1, E.kr) ]),
  g(R.tio, [ st({ fraga: '40 % av 300 kr?' }.fraga, 300, 40, 10, E.kr), st({ fraga: '70 % av 500 kr?' }.fraga, 500, 70, 10, E.kr),
             st({ fraga: '30 % av 900 kr?' }.fraga, 900, 30, 10, E.kr), st({ fraga: '60 % av 1 200 kr?' }.fraga, 1200, 60, 10, E.kr) ]),
  g(R.brak, [ br({ fraga: '25 % av 800 kr?' }.fraga, 800, 25, '1/4', E.kr), br({ fraga: '75 % av 400 kr?' }.fraga, 400, 75, '3/4', E.kr),
              br({ fraga: '20 % av 600 kr?' }.fraga, 600, 20, '1/5', E.kr), br({ fraga: '50 % av 900 kr?' }.fraga, 900, 50, '1/2', E.kr) ]),
  g(R.bland, [ st({ fraga: '5 % av 700 kr?' }.fraga, 700, 5, 1, E.kr), st({ fraga: '20 % av 1 100 kr?' }.fraga, 1100, 20, 10, E.kr),
               st({ fraga: '75 % av 800 kr?' }.fraga, 800, 75, 25, E.kr), st({ fraga: '4 % av 1 200 kr?' }.fraga, 1200, 4, 1, E.kr),
               st({ fraga: '90 % av 400 kr?' }.fraga, 400, 90, 10, E.kr), st({ fraga: '12 % av 300 kr?' }.fraga, 300, 12, 1, E.kr) ])
] }); };

/* ── BLAD 2A — Lästal ── */
BLAD['2A'] = function(){ return medNod({ titel: T.b2, dokument: dok('2A', 'golv'), grupper: [
  g({ rubrik: 'På en skola går 600 elever. 7 % av eleverna spelar i skolans orkester. Hur många elever spelar i orkestern?' }.rubrik, [ st(null, 600, 7, 1, E.elever) ]),
  g({ rubrik: 'En cykel kostar 3 000 kr. Alex har sparat 30 % av priset. Hur mycket har han sparat?' }.rubrik, [ st(null, 3000, 30, 10, E.kr) ]),
  g({ rubrik: 'En påse innehåller 400 g godis. 25 % av godiset är choklad. Hur många gram choklad finns i påsen?' }.rubrik, [ st(null, 400, 25, 25, E.g) ]),
  g({ rubrik: 'En konsert hade 800 besökare. 6 % av besökarna var barn. Hur många barn var på konserten?' }.rubrik, [ st(null, 800, 6, 1, E.besokare, E.barn) ]),
  g({ rubrik: 'Ett spel kostar 500 kr. Mamma betalar 40 % av priset. Hur mycket betalar mamma?' }.rubrik, [ st(null, 500, 40, 10, E.kr) ]),
  g({ rubrik: 'En löparbana är 400 m lång. Ella har sprungit 75 % av ett varv. Hur långt har hon sprungit?' }.rubrik, [ st(null, 400, 75, 25, E.m) ]),
  g({ rubrik: 'I en skog finns 1 100 träd. 3 % av träden är ekar. Hur många ekar finns i skogen?' }.rubrik, [ st(null, 1100, 3, 1, E.trad, E.ekar) ]),
  g({ rubrik: 'En klass samlade in 900 kr. 20 % av pengarna gick till en utflykt. Hur mycket gick till utflykten?' }.rubrik, [ st(null, 900, 20, 10, E.kr) ]),
  g({ rubrik: 'Ett bibliotek har 1 200 böcker. 50 % av böckerna är skönlitteratur. Hur många böcker är skönlitteratur?' }.rubrik, [ st(null, 1200, 50, 50, E.bocker) ])
] }); };

/* ── BLAD 3A — Det som är kvar ── (eleven räknar först det som är kvar i procent: 100 % − p) */
BLAD['3A'] = function(){ return medNod({ titel: T.b3, dokument: dok('3A', 'mellan'), grupper: [
  g({ rubrik: 'En bok har 480 sidor. Noah har 25 % kvar att läsa. Hur många sidor har han läst?' }.rubrik, [ st(null, 480, 75, 25, E.sidor) ]),
  g({ rubrik: 'På en skola går 750 elever. 30 % av eleverna åker buss. Hur många elever åker inte buss?' }.rubrik, [ st(null, 750, 70, 10, E.elever) ]),
  g({ rubrik: 'Ett par skor kostar 900 kr. Sara betalar 20 % kontant. Hur mycket har hon kvar att betala?' }.rubrik, [ st(null, 900, 80, 10, E.kr) ]),
  g({ rubrik: 'På en skola går 350 elever. 10 % av eleverna är sjuka en dag. Hur många elever är friska?' }.rubrik, [ st(null, 350, 90, 10, E.elever) ]),
  g({ rubrik: 'En fabrik tillverkade 500 lampor. 3 % av lamporna var trasiga. Hur många lampor var hela?' }.rubrik, [ st(null, 500, 97, 1, E.lampor) ]),
  g({ rubrik: 'En camping har 1 200 platser. 75 % av platserna är bokade. Hur många platser är lediga?' }.rubrik, [ st(null, 1200, 25, 25, E.platser) ]),
  g({ rubrik: 'Hur mycket är 8 % av 600 kr?' }.rubrik, [ st(null, 600, 8, 1, E.kr) ]),
  g({ rubrik: 'En klass samlade in 700 kr. 40 % av pengarna gick till en klassfest. Hur mycket gick till klassfesten?' }.rubrik, [ st(null, 700, 40, 10, E.kr) ])
] }); };

/* ── BLAD 4A — Flera delar ur samma helhet ── */
BLAD['4A'] = function(){ return medNod({ titel: T.b4, dokument: dok('4A', 'mellan'), grupper: [
  g({ rubrik: 'Ett äpple väger 200 g. 85 % av äpplet är vatten och 12 % är socker.' }.rubrik, [
    st({ fraga: 'Hur många gram vatten finns i äpplet?' }.fraga, 200, 85, 1, E.g), st({ fraga: 'Hur många gram socker finns i äpplet?' }.fraga, 200, 12, 1, E.g),
    st({ fraga: 'Hur många gram är varken vatten eller socker?' }.fraga, 200, 3, 1, E.g) ]),
  g({ rubrik: 'En match är 60 minuter lång. Det blå laget hade bollen 60 % av tiden och det gröna laget 40 % av tiden.' }.rubrik, [
    st({ fraga: 'Hur många minuter hade det blå laget bollen?' }.fraga, 60, 60, 10, E.min), st({ fraga: 'Hur många minuter hade det gröna laget bollen?' }.fraga, 60, 40, 10, E.min) ]),
  g({ rubrik: 'En klass har 30 elever. 20 % av eleverna cyklar till skolan, 50 % går och resten åker buss.' }.rubrik, [
    st({ fraga: 'Hur många elever cyklar?' }.fraga, 30, 20, 20, E.elever), st({ fraga: 'Hur många elever går?' }.fraga, 30, 50, 50, E.elever),
    st({ fraga: 'Hur många elever åker buss?' }.fraga, 30, 30, 10, E.elever) ]),
  g({ rubrik: 'Ett lag gjorde 40 mål under en säsong. Emma gjorde 25 % av målen och Liam gjorde 35 %.' }.rubrik, [
    st({ fraga: 'Hur många mål gjorde Emma?' }.fraga, 40, 25, 25, E.mal), st({ fraga: 'Hur många mål gjorde Liam?' }.fraga, 40, 35, 1, E.mal),
    st({ fraga: 'Hur många mål gjorde Emma och Liam tillsammans?' }.fraga, 40, 60, 10, E.mal) ]),
  g({ rubrik: 'En godispåse väger 500 g. 30 % är lakrits, 45 % är geléhjärtan och resten är choklad.' }.rubrik, [
    st({ fraga: 'Hur många gram lakrits finns i påsen?' }.fraga, 500, 30, 10, E.g), st({ fraga: 'Hur många gram geléhjärtan finns i påsen?' }.fraga, 500, 45, 1, E.g),
    st({ fraga: 'Hur många gram choklad finns i påsen?' }.fraga, 500, 25, 25, E.g) ]),
  g({ rubrik: 'En butik hade 800 mössor. 15 % av mössorna såldes. Hur många mössor finns kvar?' }.rubrik, [ st(null, 800, 85, 1, E.mossor) ]),
  g({ rubrik: 'Ett tåg har 400 platser. 60 % av platserna är upptagna. Hur många platser är upptagna?' }.rubrik, [ st(null, 400, 60, 10, E.platser) ])
] }); };

/* ── BLAD 5A — Rabatt i kronor, och figur eller sträcka ── */
BLAD['5A'] = function(){ return medNod({ titel: T.b5, dokument: dok('5A', 'mellan'), grupper: [
  g({ rubrik: 'En jacka kostar 800 kr. Rabatten är 25 %. Hur många kronor är rabatten?' }.rubrik, [ st(null, 800, 25, 25, E.kr) ]),
  g({ rubrik: 'Ett par skor kostar 650 kr. Rabatten är 20 %. Hur många kronor är rabatten?' }.rubrik, [ st(null, 650, 20, 10, E.kr) ]),
  g({ rubrik: 'Ett spel kostar 450 kr. Rabatten är 30 %. Hur många kronor är rabatten?' }.rubrik, [ st(null, 450, 30, 10, E.kr) ]),
  g({ rubrik: 'En cykel kostar 2 400 kr. Rabatten är 15 %. Hur många kronor är rabatten?' }.rubrik, [ st(null, 2400, 15, 1, E.kr) ]),
  // Klartextens "(Figur: en sträcka som är 60 mm lång.)" — figuren bär uppgiften; rubriken har ingen text.
  g('', [ { typ: 'svgfigur', svg: AF ? AF.strackfigur({ delar: [{ text: { etikett: '60 mm' }.etikett }], alt: 'En sträcka som är 60 mm lång' }) : '' },
    st({ fraga: 'Hur lång är 25 % av sträckan?' }.fraga, 60, 25, 25, E.mm), st({ fraga: 'Hur lång är 40 % av sträckan?' }.fraga, 60, 40, 10, E.mm) ]),
  // "(Figur: en rektangel som är delad i 40 lika stora rutor.)" — 5 · 8 kvadratiska rutor, inga ifyllda.
  g({ rubrik: 'Hur många rutor är 35 % av rektangeln?' }.rubrik, [ { typ: 'svgfigur', svg: AN.delRuta(5, 8, [], { kvadrat: true }) },
    st(null, 40, 35, 1, E.rutor) ]),
  g({ rubrik: 'En bensintank rymmer 60 liter. Tanken är fylld till 75 %. Hur många liter bensin finns i tanken?' }.rubrik, [ st(null, 60, 75, 25, E.l) ]),
  g({ rubrik: 'En smoothie på 300 ml innehåller 40 % jordgubbar och 35 % banan. Hur många ml är jordgubbar och banan tillsammans?' }.rubrik, [ st(null, 300, 75, 25, E.ml) ]),
  g({ rubrik: 'Hur mycket är 6 % av 900 kr?' }.rubrik, [ st(null, 900, 6, 1, E.kr) ])
] }); };

/* ── BLAD 6A — Jämföra och sant eller falskt ── */
BLAD['6A'] = function(){ return medNod({ titel: T.b6, dokument: dok('6A', 'tak'), grupper: [
  g({ rubrik: 'Vilket tecken ska stå i rutan: <, = eller >?' }.rubrik, [
    val(['<', '=', '>'], '=', { fraga: '25 % av 80  □  50 % av 40' }.fraga), val(['<', '=', '>'], '>', { fraga: '10 % av 300  □  30 % av 90' }.fraga),
    val(['<', '=', '>'], '<', { fraga: '40 % av 60  □  60 % av 50' }.fraga) ]),
  g({ rubrik: 'En tröja kostar 600 kr. Vilken rabatt är störst?' }.rubrik, [
    val(['A. 25 % rabatt', 'B. 140 kr i rabatt', 'C. 1/5 av priset i rabatt'], 'A. 25 % rabatt') ]),
  g({ rubrik: 'Vilka påståenden stämmer? Ringa in alla som stämmer.' }.rubrik, [
    val(['A. 50 % av 60 är lika mycket som 60 % av 50.', 'B. 10 % av 500 är 5.', 'C. 25 % av 200 är lika mycket som 1/4 av 200.',
         'D. 1 % av 800 är 80.'],
        ['A. 50 % av 60 är lika mycket som 60 % av 50.', 'C. 25 % av 200 är lika mycket som 1/4 av 200.'], null, true) ]),
  g({ rubrik: 'Ida räknade ut 30 % av 400 kr så här: "1 % = 400/100 = 4, 30 % = 30 + 4 = 34 kr".' }.rubrik, [
    val(['A. Hon har adderat i stället för att multiplicera.', 'B. Hon har delat med fel tal.', 'C. Inget är fel.'],
        'A. Hon har adderat i stället för att multiplicera.', { fraga: 'Vad är fel?' }.fraga),
    val(['A. 34 kr', 'B. 120 kr', 'C. 12 kr'], 'B. 120 kr', { fraga: 'Hur mycket är 30 % av 400 kr?' }.fraga) ]),
  g({ rubrik: 'Omar räknade ut 20 % av 350 kr så här: "350/20 = 17,5 kr". Vad är fel?' }.rubrik, [
    val(['A. Inget är fel.', 'B. Han borde ha delat med 5, eftersom 20 % = 1/5.', 'C. Han borde ha multiplicerat med 20.'],
        'B. Han borde ha delat med 5, eftersom 20 % = 1/5.') ]),
  g({ rubrik: 'Vilket är störst?' }.rubrik, [ val(['A. 50 % av 50', 'B. 30 % av 90', 'C. 5 % av 600'], 'C. 5 % av 600') ]),
  g({ rubrik: 'En mobil kostar 1 500 kr. Rabatten är 20 %. Hur många kronor är rabatten?' }.rubrik, [ val(['A. 30 kr', 'B. 300 kr', 'C. 750 kr'], 'B. 300 kr') ]),
  g({ rubrik: 'En butik har 200 kepsar. 35 % av kepsarna säljs. Hur många kepsar finns kvar?' }.rubrik, [ val(['A. 130', 'B. 70', 'C. 165'], 'A. 130') ])
] }); };

/* MOMENTET: sex blad, variant A. Spärren: NivaRad, krav 80 % rätta rutor på bladet före; Blad 1 och 2 alltid öppna. */
var MOMENT = { titel: 'Delen', varianter: ['A'],
  nivaPrefix: 'k4d1', nivaId: 'delen', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: T.b1 }, { nr: 2, titel: T.b2 }, { nr: 3, titel: T.b3 }, { nr: 4, titel: T.b4 }, { nr: 5, titel: T.b5 },
          { nr: 6, titel: T.b6 } ] };

window.BLAD_K4_D1_DELEN = {
  MOMENT: MOMENT,
  blad: function(id){ var b = BLAD[String(id || '').toUpperCase()]; return b ? b() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
