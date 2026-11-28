/* blad-k4-d1-delen.js — MOMENTET "DELEN" (åk 7, kapitel 4 Procent, Del 1, moment 3): Blad 1–7, variant A.
   Källa: doc/innehall/k4-d1-procent-moment3.md — Joachims klartext, VERSION 2 (omsorterad 2026-11-28, facit
   faktakollat rad för rad), ordagrant. Version 1 finns i historiken.
   MOMENT OCH BLAD (KONVENTIONER, Joachim 2026-11-28): bladen har ingen titel — momentsidan visar "Blad 1" … "Blad 7",
   och bladets rubrik är momentets namn. Bara Blad 1 har rubriker som namnger steget (1 %, 10 %, Procent som bråk,
   Blandat); övriga blad har ingen metod- eller typrubrik, och lästalens sorter är blandade inom bladet. Hakparenteserna
   (förlagan, [spiral], [författad]) visas inte; de står i kommentarerna. Inga hjälptexter.
   STEGRADEN (Joachim 2026-11-27, bladkärnans 'stegrad'): Blad 1 nr 1, 2 och 4 och Blad 2–6 —
       100 % = ▢          ▢ % = ▢/▢ = ▢          ▢ % = ▢ · ▢ = ▢
     eleven väljer steget själv (1, 2, 4, 5, 10, 20, 25 eller 50 %); rättningen gäller värdet och att leden hänger ihop.
     Facit visar klartextens enklaste väg (rad.steg). Står steget redan på det sökta procenttalet får tredje raden vara
     tom. Enheten efter rutan följer uppgiften; där svaret har en egen enhet (48 barn av 800 besökare) står den sist.
   BRÅKRADEN (Blad 1 nr 3, 'brakrad'): 25 % = ▢ , (▢ · 800)/▢ = ▢ · ▢ = ▢ kr — bråket i enklaste form, övriga led på värde.
   TVÅSTEG (Blad 6 nr 1, 4, 6, 7 och 9; Joachim 2026-11-28, stegradens tillägg rad.helheter + rad.kombo): en stegrad
     per helhet — med två helheter märkta med problemets namn ("7A:", "7B:") — och sist kombinationsraden
     "▢ + ▢ = ▢ elever" (eller "−" enligt facit), rättad på värde.
   Blad 7: tecknet och flervalet med valrutan, nr 3 ringa in (valrutan med flera rätt).
   Figurer: Blad 3 nr 6 sträckan (SvgAlgebraFigur.strackfigur), Blad 4 nr 6 rektangeln med 40 rutor (SvgAndel.delRuta,
   kvadratiska), Blad 6 nr 9 tabellen (tabellkomponenten, matris). Blad 5 nr 6: mätaren som text, ingen figur.
   Spärren: NivaRad — Blad 1 och 2 alltid öppna, därefter 80 % rätta rutor på bladet före.
   Mastery (kapitel 4:s store): lövet "Delen" (proc-delen:rakna, js/data/k4-taxonomi.js), som förut. Ingen nätväg. */
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
/* TVÅSTEG: helheterna (en stegrad var, etikett vid två) och kombinationsraden a tecken b = svaret, med enheten. */
function hel(etikett, hela, procent, steg, enhet){ var h = { hela: hela, procent: procent, steg: steg, enhet: enhet }; if(etikett) h.etikett = etikett; return h; }
function tva(helheter, tecken, a, b, enhet){ return { typ: 'stegrad', helheter: helheter, kombo: { tecken: tecken, a: a, b: b, enhet: enhet } }; }
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
/* Elevtext i fält (elevtext-låset). Ordagrant ur klartexten. Bladets rubrik är momentets namn (inga bladtitlar). */
var TITEL = { titel: 'Delen' }.titel;
var I = { hur: { intro: 'Hur mycket är …' }.intro };
var R = {
  en: { rubrik: '1 %' }.rubrik, tio: { rubrik: '10 %' }.rubrik, brak: { rubrik: 'Procent som bråk' }.rubrik,
  bland: { rubrik: 'Blandat' }.rubrik
};
/* ELEVTEXTEN STÅR I FÄLT som låset läser (verktyg/elevtext-grind.js, Joachim 2026-11-27): frågorna i { fraga: '…' },
   rubrikerna i { rubrik: '…' }, figurens och helheternas text i { etikett: '…' }. */
var E = { kr: 'kr', elever: 'elever', g: 'g', besokare: 'besökare', barn: 'barn', m: 'm', trad: 'träd', ekar: 'ekar',
          bocker: 'böcker', sidor: 'sidor', lampor: 'lampor', platser: 'platser', min: 'min', mal: 'mål', mossor: 'mössor',
          mm: 'mm', rutor: 'rutor', l: 'l', ml: 'ml' };
var BLAD = {};

/* ── BLAD 1A — sorterad start (1 %, 10 %, Procent som bråk), sedan blandat ── */
BLAD['1A'] = function(){ return medNod({ titel: TITEL, intro: I.hur, dokument: dok('1A', 'golv'), grupper: [
  // [G 4151, G 4154, H 5106]
  g(R.en, [ st({ fraga: '7 % av 400 kr?' }.fraga, 400, 7, 1, E.kr), st({ fraga: '3 % av 900 kr?' }.fraga, 900, 3, 1, E.kr),
            st({ fraga: '6 % av 800 kr?' }.fraga, 800, 6, 1, E.kr), st({ fraga: '9 % av 500 kr?' }.fraga, 500, 9, 1, E.kr) ]),
  // [G 4152, H 5107, H 5109]
  g(R.tio, [ st({ fraga: '40 % av 300 kr?' }.fraga, 300, 40, 10, E.kr), st({ fraga: '70 % av 500 kr?' }.fraga, 500, 70, 10, E.kr),
             st({ fraga: '30 % av 900 kr?' }.fraga, 900, 30, 10, E.kr), st({ fraga: '60 % av 1 200 kr?' }.fraga, 1200, 60, 10, E.kr) ]),
  // [H s. 216 (Oscar), H 5135]
  g(R.brak, [ br({ fraga: '25 % av 800 kr?' }.fraga, 800, 25, '1/4', E.kr), br({ fraga: '75 % av 400 kr?' }.fraga, 400, 75, '3/4', E.kr),
              br({ fraga: '20 % av 600 kr?' }.fraga, 600, 20, '1/5', E.kr), br({ fraga: '50 % av 900 kr?' }.fraga, 900, 50, '1/2', E.kr) ]),
  // [G 4153–4155, H 5108, H 5187]
  g(R.bland, [ st({ fraga: '5 % av 700 kr?' }.fraga, 700, 5, 1, E.kr), st({ fraga: '20 % av 1 100 kr?' }.fraga, 1100, 20, 10, E.kr),
               st({ fraga: '75 % av 800 kr?' }.fraga, 800, 75, 25, E.kr), st({ fraga: '4 % av 1 200 kr?' }.fraga, 1200, 4, 1, E.kr),
               st({ fraga: '90 % av 400 kr?' }.fraga, 400, 90, 10, E.kr), st({ fraga: '12 % av 300 kr?' }.fraga, 300, 12, 1, E.kr) ])
] }); };

/* ── BLAD 2A — "p % av x", blandat (ny i version 2) ── */
BLAD['2A'] = function(){ return medNod({ titel: TITEL, intro: I.hur, dokument: dok('2A', 'golv'), grupper: [
  g('', [ st({ fraga: '8 % av 300 kr?' }.fraga, 300, 8, 1, E.kr), st({ fraga: '60 % av 700 kr?' }.fraga, 700, 60, 10, E.kr),
          st({ fraga: '25 % av 600 kr?' }.fraga, 600, 25, 25, E.kr), st({ fraga: '3 % av 800 kr?' }.fraga, 800, 3, 1, E.kr),
          st({ fraga: '20 % av 450 kr?' }.fraga, 450, 20, 10, E.kr), st({ fraga: '75 % av 1 200 kr?' }.fraga, 1200, 75, 25, E.kr),
          st({ fraga: '11 % av 400 kr?' }.fraga, 400, 11, 1, E.kr), st({ fraga: '40 % av 900 kr?' }.fraga, 900, 40, 10, E.kr),
          st({ fraga: '50 % av 1 100 kr?' }.fraga, 1100, 50, 50, E.kr), st({ fraga: '7 % av 1 100 kr?' }.fraga, 1100, 7, 1, E.kr),
          st({ fraga: '70 % av 900 kr?' }.fraga, 900, 70, 10, E.kr), st({ fraga: '9 % av 600 kr?' }.fraga, 600, 9, 1, E.kr) ])
] }); };

/* ── BLAD 3A — lästalen blandade ── (det som är kvar: eleven räknar först procenten, 100 % − p) */
BLAD['3A'] = function(){ return medNod({ titel: TITEL, dokument: dok('3A', 'mellan'), grupper: [
  // [G 4156]
  g({ rubrik: 'På en skola går 600 elever. 7 % av eleverna spelar i skolans orkester. Hur många elever spelar i orkestern?' }.rubrik, [ st(null, 600, 7, 1, E.elever) ]),
  // [G 4167]
  g({ rubrik: 'På en skola går 750 elever. 30 % av eleverna åker buss. Hur många elever åker inte buss?' }.rubrik, [ st(null, 750, 70, 10, E.elever) ]),
  // [G 4158]
  g({ rubrik: 'En jacka kostar 800 kr. Rabatten är 25 %. Hur många kronor är rabatten?' }.rubrik, [ st(null, 800, 25, 25, E.kr) ]),
  // [H 5111]
  g({ rubrik: 'En match är 60 minuter lång. Det blå laget hade bollen 60 % av tiden och det gröna laget 40 % av tiden.' }.rubrik, [
    st({ fraga: 'Hur många minuter hade det blå laget bollen?' }.fraga, 60, 60, 10, E.min), st({ fraga: 'Hur många minuter hade det gröna laget bollen?' }.fraga, 60, 40, 10, E.min) ]),
  // [H 5189]
  g({ rubrik: 'En cykel kostar 3 000 kr. Alex har sparat 30 % av priset. Hur mycket har han sparat?' }.rubrik, [ st(null, 3000, 30, 10, E.kr) ]),
  // "(Figur: en sträcka som är 60 mm lång.)" — figuren bär uppgiften; rubriken har ingen text. [H 5144]
  g('', [ { typ: 'svgfigur', svg: AF ? AF.strackfigur({ delar: [{ text: { etikett: '60 mm' }.etikett }], alt: 'En sträcka som är 60 mm lång' }) : '' },
    st({ fraga: 'Hur lång är 25 % av sträckan?' }.fraga, 60, 25, 25, E.mm), st({ fraga: 'Hur lång är 40 % av sträckan?' }.fraga, 60, 40, 10, E.mm) ]),
  // [H 5150]
  g({ rubrik: 'Ett par skor kostar 900 kr. Sara betalar 20 % kontant. Hur mycket har hon kvar att betala?' }.rubrik, [ st(null, 900, 80, 10, E.kr) ]),
  // [G 4159]
  g({ rubrik: 'En påse innehåller 400 g godis. 25 % av godiset är choklad. Hur många gram choklad finns i påsen?' }.rubrik, [ st(null, 400, 25, 25, E.g) ]),
  // [H 5147]
  g({ rubrik: 'En klass har 30 elever. 20 % av eleverna cyklar till skolan, 50 % går och resten åker buss.' }.rubrik, [
    st({ fraga: 'Hur många elever cyklar?' }.fraga, 30, 20, 20, E.elever), st({ fraga: 'Hur många elever går?' }.fraga, 30, 50, 50, E.elever),
    st({ fraga: 'Hur många elever åker buss?' }.fraga, 30, 30, 10, E.elever) ]),
  // [G 4158]
  g({ rubrik: 'Ett par skor kostar 650 kr. Rabatten är 20 %. Hur många kronor är rabatten?' }.rubrik, [ st(null, 650, 20, 10, E.kr) ])
] }); };

/* ── BLAD 4A — lästalen blandade, spiral (nr 11–12) ── */
BLAD['4A'] = function(){ return medNod({ titel: TITEL, dokument: dok('4A', 'mellan'), grupper: [
  // [G 4156, H 5112]
  g({ rubrik: 'En konsert hade 800 besökare. 6 % av besökarna var barn. Hur många barn var på konserten?' }.rubrik, [ st(null, 800, 6, 1, E.besokare, E.barn) ]),
  // [G 4220]
  g({ rubrik: 'På en skola går 350 elever. 10 % av eleverna är sjuka en dag. Hur många elever är friska?' }.rubrik, [ st(null, 350, 90, 10, E.elever) ]),
  // [H 5147]
  g({ rubrik: 'Ett äpple väger 200 g. 85 % av äpplet är vatten och 12 % är socker.' }.rubrik, [
    st({ fraga: 'Hur många gram vatten finns i äpplet?' }.fraga, 200, 85, 1, E.g), st({ fraga: 'Hur många gram socker finns i äpplet?' }.fraga, 200, 12, 1, E.g),
    st({ fraga: 'Hur många gram är varken vatten eller socker?' }.fraga, 200, 3, 1, E.g) ]),
  // [G 4158]
  g({ rubrik: 'Ett spel kostar 450 kr. Rabatten är 30 %. Hur många kronor är rabatten?' }.rubrik, [ st(null, 450, 30, 10, E.kr) ]),
  // [H 5189]
  g({ rubrik: 'Ett spel kostar 500 kr. Mamma betalar 40 % av priset. Hur mycket betalar mamma?' }.rubrik, [ st(null, 500, 40, 10, E.kr) ]),
  // "(Figur: en rektangel som är delad i 40 lika stora rutor.)" — 5 · 8 kvadratiska rutor, inga ifyllda. 5 %-vägen. [H 5145]
  g({ rubrik: 'Hur många rutor är 35 % av rektangeln?' }.rubrik, [ { typ: 'svgfigur', svg: AN.delRuta(5, 8, [], { kvadrat: true }) },
    st(null, 40, 35, 5, E.rutor) ]),
  // [G 4220]
  g({ rubrik: 'En fabrik tillverkade 500 lampor. 3 % av lamporna var trasiga. Hur många lampor var hela?' }.rubrik, [ st(null, 500, 97, 1, E.lampor) ]),
  // [H 5144]
  g({ rubrik: 'En löparbana är 400 m lång. Ella har sprungit 75 % av ett varv. Hur långt har hon sprungit?' }.rubrik, [ st(null, 400, 75, 25, E.m) ]),
  // [H 5147, H 5190] — b) 5 %-vägen
  g({ rubrik: 'Ett lag gjorde 40 mål under en säsong. Emma gjorde 25 % av målen och Liam gjorde 35 %.' }.rubrik, [
    st({ fraga: 'Hur många mål gjorde Emma?' }.fraga, 40, 25, 25, E.mal), st({ fraga: 'Hur många mål gjorde Liam?' }.fraga, 40, 35, 5, E.mal),
    st({ fraga: 'Hur många mål gjorde Emma och Liam tillsammans?' }.fraga, 40, 60, 10, E.mal) ]),
  // [G 4157]
  g({ rubrik: 'En klass samlade in 700 kr. 40 % av pengarna gick till en klassfest. Hur mycket gick till klassfesten?' }.rubrik, [ st(null, 700, 40, 10, E.kr) ]),
  // [spiral blad 1–2, G 4154]
  g({ rubrik: 'Hur mycket är 8 % av 600 kr?' }.rubrik, [ st(null, 600, 8, 1, E.kr) ]),
  // [spiral blad 1–2, G 4151]
  g({ rubrik: 'Hur mycket är 9 % av 700 kr?' }.rubrik, [ st(null, 700, 9, 1, E.kr) ])
] }); };

/* ── BLAD 5A — lästalen blandade, spiral (nr 12–13) ── */
BLAD['5A'] = function(){ return medNod({ titel: TITEL, dokument: dok('5A', 'mellan'), grupper: [
  // [H 5119]
  g({ rubrik: 'I en skog finns 1 100 träd. 3 % av träden är ekar. Hur många ekar finns i skogen?' }.rubrik, [ st(null, 1100, 3, 1, E.trad, E.ekar) ]),
  // [G 4167]
  g({ rubrik: 'En camping har 1 200 platser. 75 % av platserna är bokade. Hur många platser är lediga?' }.rubrik, [ st(null, 1200, 25, 25, E.platser) ]),
  // [H 5147]
  g({ rubrik: 'En godispåse väger 500 g. 30 % är lakrits, 45 % är geléhjärtan och resten är choklad.' }.rubrik, [
    st({ fraga: 'Hur många gram lakrits finns i påsen?' }.fraga, 500, 30, 10, E.g), st({ fraga: 'Hur många gram geléhjärtan finns i påsen?' }.fraga, 500, 45, 1, E.g),
    st({ fraga: 'Hur många gram choklad finns i påsen?' }.fraga, 500, 25, 25, E.g) ]),
  // [G 4158, H 5116]
  g({ rubrik: 'En cykel kostar 2 400 kr. Rabatten är 15 %. Hur många kronor är rabatten?' }.rubrik, [ st(null, 2400, 15, 1, E.kr) ]),
  // [G 4157]
  g({ rubrik: 'En klass samlade in 900 kr. 20 % av pengarna gick till en utflykt. Hur mycket gick till utflykten?' }.rubrik, [ st(null, 900, 20, 10, E.kr) ]),
  // Mätaren som text, ingen figur. [H 5117]
  g({ rubrik: 'En tank rymmer 60 liter. Den är fylld till 75 %. Hur många liter bensin finns i tanken?' }.rubrik, [ st(null, 60, 75, 25, E.l) ]),
  // [G 4163]
  g({ rubrik: 'En bok har 480 sidor. Noah har 25 % kvar att läsa. Hur många sidor har han läst?' }.rubrik, [ st(null, 480, 75, 25, E.sidor) ]),
  // [H 5147]
  g({ rubrik: 'En smoothie på 300 ml innehåller 40 % jordgubbar och 35 % banan. Hur många ml är jordgubbar och banan tillsammans?' }.rubrik, [ st(null, 300, 75, 25, E.ml) ]),
  // [H 5146]
  g({ rubrik: 'Ett bibliotek har 1 200 böcker. 50 % av böckerna är skönlitteratur. Hur många böcker är skönlitteratur?' }.rubrik, [ st(null, 1200, 50, 50, E.bocker) ]),
  // [G 4167]
  g({ rubrik: 'En butik hade 800 mössor. 15 % av mössorna såldes. Hur många mössor finns kvar?' }.rubrik, [ st(null, 800, 85, 1, E.mossor) ]),
  // [G 4167]
  g({ rubrik: 'Ett tåg har 400 platser. 60 % av platserna är upptagna. Hur många platser är upptagna?' }.rubrik, [ st(null, 400, 60, 10, E.platser) ]),
  // [spiral blad 1–2, H 5106]
  g({ rubrik: 'Hur mycket är 6 % av 900 kr?' }.rubrik, [ st(null, 900, 6, 1, E.kr) ]),
  // [spiral blad 1–2, H 5109]
  g({ rubrik: 'Hur mycket är 80 % av 500 kr?' }.rubrik, [ st(null, 500, 80, 10, E.kr) ])
] }); };

/* ── BLAD 6A — tvåstegsuppgifter, spiral (nr 10) ── */
BLAD['6A'] = function(){ return medNod({ titel: TITEL, dokument: dok('6A', 'tak'), grupper: [
  // [författad, G 4156] — två helheter, sedan 5 + 3 = 8
  g({ rubrik: 'I klass 7A går 25 elever och i klass 7B går 30 elever. 20 % av eleverna i 7A och 10 % av eleverna i 7B cyklar till skolan. Hur många elever cyklar sammanlagt?' }.rubrik, [
    tva([ hel({ etikett: '7A:' }.etikett, 25, 20, 20, E.elever), hel({ etikett: '7B:' }.etikett, 30, 10, 10, E.elever) ], '+', 5, 3, E.elever) ]),
  // [H 5044, H 5147] — det hela räknas först (14 + 16 = 30)
  g({ rubrik: 'I en klass finns 14 flickor och 16 pojkar. 30 % av eleverna spelar fotboll. Hur många elever spelar fotboll?' }.rubrik, [ st(null, 30, 30, 10, E.elever) ]),
  // [H 5111, D 17] — 1 timme = 60 min, 5 %-vägen
  g({ rubrik: 'Hur många minuter är 15 % av en timme?' }.rubrik, [ st(null, 60, 15, 5, E.min) ]),
  // [H 5139] — två helheter, sedan 120 − 100 = 20
  g({ rubrik: 'Ella sparar 20 % av sin månadspeng på 500 kr. Omar sparar 30 % av sin månadspeng på 400 kr. Hur mycket mer sparar Omar?' }.rubrik, [
    tva([ hel({ etikett: 'Ella:' }.etikett, 500, 20, 10, E.kr), hel({ etikett: 'Omar:' }.etikett, 400, 30, 10, E.kr) ], '−', 120, 100, E.kr) ]),
  // [G 4158] — det hela räknas först (2 · 250 = 500)
  g({ rubrik: 'Två konsertbiljetter kostar 250 kr styck. Man får 10 % rabatt på hela köpet. Hur många kronor är rabatten?' }.rubrik, [ st(null, 500, 10, 10, E.kr) ]),
  // [författad, G 4167] — en helhet, sedan 350 − 40 = 310
  g({ rubrik: 'Ett tåg har 500 platser. 70 % av platserna är upptagna. Vid nästa station går 40 personer av. Hur många platser är upptagna nu?' }.rubrik, [
    tva([ hel(null, 500, 70, 10, E.platser) ], '−', 350, 40, E.platser) ]),
  // [författad, H 5147] — en helhet (5 %-vägen), sedan 140 − 50 = 90
  g({ rubrik: 'En godispåse väger 400 g. 35 % av godiset är lakrits. Ella äter 50 g lakrits. Hur många gram lakrits finns kvar?' }.rubrik, [
    tva([ hel(null, 400, 35, 5, E.g) ], '−', 140, 50, E.g) ]),
  // [G 4163] — kvar 100 % − 25 % − 30 % = 45 %, 5 %-vägen
  g({ rubrik: 'En bok har 600 sidor. Noah läser 25 % av boken på måndagen och 30 % på tisdagen. Hur många sidor har han kvar att läsa?' }.rubrik, [ st(null, 600, 45, 5, E.sidor) ]),
  // "(Tabell: Månadspeng – Liam 400 kr, Ida 300 kr.)" — två helheter, sedan 60 + 45 = 105. [H 5189]
  g({ rubrik: 'Båda sparar 15 % av sin månadspeng. Hur mycket sparar de tillsammans?' }.rubrik, [
    { typ: 'tabell', huvud: 'rad', matris: [ [ '', { etikett: 'Månadspeng' }.etikett ], [ { etikett: 'Liam' }.etikett, '400 kr' ], [ { etikett: 'Ida' }.etikett, '300 kr' ] ] },
    tva([ hel({ etikett: 'Liam:' }.etikett, 400, 15, 5, E.kr), hel({ etikett: 'Ida:' }.etikett, 300, 15, 5, E.kr) ], '+', 60, 45, E.kr) ]),
  // [spiral blad 1–2, H 5108]
  g({ rubrik: 'Hur mycket är 12 % av 500 kr?' }.rubrik, [ st(null, 500, 12, 1, E.kr) ])
] }); };

/* ── BLAD 7A — jämföra, sant eller falskt och hitta felet (flerval), spiral (nr 7–8) ── */
BLAD['7A'] = function(){ return medNod({ titel: TITEL, dokument: dok('7A', 'tak'), grupper: [
  // [H 5113]
  g({ rubrik: 'Vilket tecken ska stå i rutan: <, = eller >?' }.rubrik, [
    val(['<', '=', '>'], '=', { fraga: '25 % av 80  □  50 % av 40' }.fraga), val(['<', '=', '>'], '>', { fraga: '10 % av 300  □  30 % av 90' }.fraga),
    val(['<', '=', '>'], '<', { fraga: '40 % av 60  □  60 % av 50' }.fraga) ]),
  // [H 5116]
  g({ rubrik: 'En tröja kostar 600 kr. Vilken rabatt är störst?' }.rubrik, [
    val(['A. 25 % rabatt', 'B. 140 kr i rabatt', 'C. 1/5 av priset i rabatt'], 'A. 25 % rabatt') ]),
  // [H 5139]
  g({ rubrik: 'Vilka påståenden stämmer? Ringa in alla som stämmer.' }.rubrik, [
    val(['A. 50 % av 60 är lika mycket som 60 % av 50.', 'B. 10 % av 500 är 5.', 'C. 25 % av 200 är lika mycket som 1/4 av 200.',
         'D. 1 % av 800 är 80.'],
        ['A. 50 % av 60 är lika mycket som 60 % av 50.', 'C. 25 % av 200 är lika mycket som 1/4 av 200.'], null, true) ]),
  // [H 5041, E 16]
  g({ rubrik: 'Ida räknade ut 30 % av 400 kr så här: "1 % = 400/100 = 4, 30 % = 30 + 4 = 34 kr".' }.rubrik, [
    val(['A. Hon har adderat i stället för att multiplicera.', 'B. Hon har delat med fel tal.', 'C. Inget är fel.'],
        'A. Hon har adderat i stället för att multiplicera.', { fraga: 'Vad är fel?' }.fraga),
    val(['A. 34 kr', 'B. 120 kr', 'C. 12 kr'], 'B. 120 kr', { fraga: 'Hur mycket är 30 % av 400 kr?' }.fraga) ]),
  // [E 16]
  g({ rubrik: 'Omar räknade ut 20 % av 350 kr så här: "350/20 = 17,5 kr". Vad är fel?' }.rubrik, [
    val(['A. Inget är fel.', 'B. Han borde ha delat med 5, eftersom 20 % = 1/5.', 'C. Han borde ha multiplicerat med 20.'],
        'B. Han borde ha delat med 5, eftersom 20 % = 1/5.') ]),
  // [H 5113]
  g({ rubrik: 'Vilket är störst?' }.rubrik, [ val(['A. 50 % av 50', 'B. 30 % av 90', 'C. 5 % av 600'], 'C. 5 % av 600') ]),
  // [spiral, G 4158]
  g({ rubrik: 'En mobil kostar 1 500 kr. Rabatten är 20 %. Hur många kronor är rabatten?' }.rubrik, [ val(['A. 30 kr', 'B. 300 kr', 'C. 750 kr'], 'B. 300 kr') ]),
  // [spiral, G 4167]
  g({ rubrik: 'En butik har 200 kepsar. 35 % av kepsarna säljs. Hur många kepsar finns kvar?' }.rubrik, [ val(['A. 130', 'B. 70', 'C. 165'], 'A. 130') ])
] }); };

/* MOMENTET: sju blad, variant A, utan bladtitlar (momentsidan: "Blad 1" … "Blad 7"). Spärren: NivaRad, krav 80 % rätta
   rutor på bladet före; Blad 1 och 2 alltid öppna. */
var MOMENT = { titel: 'Delen', varianter: ['A'],
  nivaPrefix: 'k4d1', nivaId: 'delen', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: '' }, { nr: 2, titel: '' }, { nr: 3, titel: '' }, { nr: 4, titel: '' }, { nr: 5, titel: '' },
          { nr: 6, titel: '' }, { nr: 7, titel: '' } ] };

window.BLAD_K4_D1_DELEN = {
  MOMENT: MOMENT,
  // Stegraden, bråkraden, valrutan och enheterna för testet och metodträningen (blad-k4-d1-test.js,
  // blad-k4-d1-metod.js): samma rader som bladen.
  TYPER: { st: st, br: br, val: val, E: E, DELEN: DELEN },
  blad: function(id){ var b = BLAD[String(id || '').toUpperCase()]; return b ? b() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
