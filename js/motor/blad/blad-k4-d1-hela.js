/* blad-k4-d1-hela.js — MOMENTET "DET HELA" (åk 7, kapitel 4 Procent, Del 1, moment 4): Blad 1–6, variant A.
   Källa: doc/innehall/k4-d1-procent-moment4.md — Joachims klartext (version 2, facit kontrollräknat), ordagrant.
   Rubrikerna och frågetexterna står som i filen; hakparenteserna visas inte. Inga hjälptexter.
   SVARSRADEN är stegraden från moment 3, spegelvänd (bladkärnans 'stegrad' med spegel, Joachim 2026-11-27):
       ▢ % = ▢          ▢ % = ▢/▢ = ▢          100 % = ▢ · ▢ = ▢
     det givna procenttalet / delningstalet = steget, steget · faktorn = 100, och varje led har rätt värde. Mittraden
     får stå tom när det givna procenttalet redan är ett steg. Facit visar klartextens enklaste väg (steg); där facit
     skriver "(mittraden tom)" är steget procenttalet självt. Blad 4 nr 2–7 och Blad 5 nr 7: fjärde raden
     "Resten = ▢ − ▢ = ▢", rättad på värde.
   Blad 6: flerval med valrutan; nr 5 tre svarsrader (jacka A, B, C) och sedan valrutan; nr 4 a) och b) med valrutan.
   Nr 2 och 5 har raderna under rubriken (gruppens meningar).
   Spärren: NivaRad — Blad 1 och 2 alltid öppna, därefter 80 % rätta rutor på bladet före.
   Mastery (kapitel 4:s store): lövet "Det hela" (proc-hela:rakna, js/data/k4-taxonomi.js). Ingen nätväg. */
(function(){
'use strict';
var P = window.BLAD_K4_D1_PROCENT; if(!P) return;
var Y = P.TYPER, HELA = 'proc-hela:rakna', AN = window.SvgAndel, AF = window.SvgAlgebraFigur;
function g(rubrik, rader, meningar){ var gr = Y.g(rubrik, rader); if(meningar) gr.meningar = meningar; return gr; }
function medNod(blad){ return Y.medNod(HELA, blad); }
/* SPEGELVÄND STEGRAD: fraga (deluppgiftens text eller ingen), det givna procenttalet, delen, facitvägens steg, enheten
   (rad 1–2), svarets enhet när den är en annan; rest = fjärde raden. */
function h(fraga, procent, del, steg, enhet, enhetSvar){
  var r = { typ: 'stegrad', spegel: true, procent: procent, del: del, steg: steg, enhet: enhet };
  if(fraga) r.fraga = fraga;
  if(enhetSvar) r.enhetSvar = enhetSvar;
  return r;
}
function rest(r){ r.rest = true; return r; }
function val(alt, ratt, fraga){ var r = { typ: 'valruta', matte: true, alt: alt, ratt: [ratt] }; if(fraga) r.fraga = fraga; return r; }
function fig(svg){ return { typ: 'svgfigur', svg: svg }; }
function dok(blad, tak){
  return { del: 'Del 1 Procent', moment: 'Det hela', blad: blad, arskurs: 7, roll: 'kärna', metod: 'Det hela: procenttalet, steget och 100 %',
           takregel: tak, kalla: 'doc/innehall/k4-d1-procent-moment4.md' };
}
/* Elevtext i fält (elevtext-låset). Ordagrant ur klartexten. */
var T = {
  b1: { titel: '"100 % om p % är x"' }.titel, b2: { titel: 'Lästal' }.titel, b3: { titel: 'Rabatten i kronor' }.titel,
  b4: { titel: 'Delen är det som är kvar' }.titel, b5: { titel: 'Figur och sträcka' }.titel,
  b6: { titel: 'Jämföra och hitta felet' }.titel
};
var R = {
  en: { rubrik: '1 %' }.rubrik, tio: { rubrik: '10 %' }.rubrik, brak: { rubrik: 'Procent som bråk' }.rubrik,
  bland: { rubrik: 'Blandat' }.rubrik
};
/* ELEVTEXTEN STÅR I FÄLT som låset läser (verktyg/elevtext-grind.js): frågorna och meningarna i { fraga: '…' },
   rubrikerna i { rubrik: '…' }, figurernas texter i { etikett: '…' }. En hjälpfunktion f('…') döljer texten för låset. */
var E = { kr: 'kr', elever: 'elever', km: 'km', apple: 'äpplen', langder: 'längder', m2: 'm²', besokare: 'besökare', inlagg: 'inlägg',
          platser: 'platser', sidor: 'sidor', lampor: 'lampor', medlemmar: 'medlemmar', godis: 'godisbitar', cm: 'cm', mm: 'mm',
          liter: 'liter', rutor: 'rutor', bilar: 'bilar', kg: 'kg' };
/* FIGURERNA (punkt 6 i ordern, figurerna godkända av Joachim 2026-11-27): staplarna med delStrip — odelad stapel med
   den färgade delen som procenttalets bredd (hel), texten ovanför den färgade delen (text) och 0 %, procenttalet och
   100 % under (skala); nr 6 behåller sina 10 delar och får bara texten. Sträckan med strackfigur — den blå delen är 40 %
   av sträckan, "?" över hela. Rektangeln med delRuta (40 rutor, 6 färgade). */
var FIG = {
  b5n1: function(){ return AN.delStrip(10, [], { hel: 30, text: { etikett: '24 cm' }.etikett, skala: true }); },
  b5n2: function(){ return AN.delStrip(10, [], { hel: 24, text: { etikett: 'Jordgubbar, 96 m²' }.etikett, skala: true }); },
  b5n3: function(){ return AF ? AF.strackfigur({ helhet: '?', delar: [{ text: [{ etikett: '40 %' }.etikett, { etikett: '28 mm' }.etikett], farg: 'bla', andel: 40 }, { text: ' ', andel: 60 }] }) : ''; },
  b5n5: function(){ return AN.delRuta(5, 8, [0, 1, 2, 3, 4, 5], { kvadrat: true }); },
  b5n6: function(){ return AN.delStrip(10, [0, 1, 2], { text: { etikett: '45 kr' }.etikett }); },
  b6n8: function(){ return AN.delStrip(10, [], { hel: 75, text: { etikett: '36 cm' }.etikett, skala: true }); }
};
var BLAD = {};

/* ── BLAD 1A — "100 % om p % är x" ── */
BLAD['1A'] = function(){ return medNod({ titel: T.b1, dokument: dok('1A', 'golv'), grupper: [
  g(R.en, [ h({ fraga: '3 % är 27 kr. Hur mycket är 100 %?' }.fraga, 3, 27, 1, E.kr), h({ fraga: '6 % är 48 kr. Hur mycket är 100 %?' }.fraga, 6, 48, 1, E.kr),
            h({ fraga: '4 % är 28 kr. Hur mycket är 100 %?' }.fraga, 4, 28, 1, E.kr), h({ fraga: '8 % är 96 kr. Hur mycket är 100 %?' }.fraga, 8, 96, 1, E.kr) ]),
  g(R.tio, [ h({ fraga: '30 % är 45 kr. Hur mycket är 100 %?' }.fraga, 30, 45, 10, E.kr), h({ fraga: '40 % är 120 kr. Hur mycket är 100 %?' }.fraga, 40, 120, 10, E.kr),
             h({ fraga: '70 % är 280 kr. Hur mycket är 100 %?' }.fraga, 70, 280, 10, E.kr), h({ fraga: '60 % är 54 kr. Hur mycket är 100 %?' }.fraga, 60, 54, 10, E.kr) ]),
  g(R.brak, [ h({ fraga: '75 % är 60 kr. Hur mycket är 100 %?' }.fraga, 75, 60, 25, E.kr), h({ fraga: '40 % är 36 kr. Hur mycket är 100 %?' }.fraga, 40, 36, 20, E.kr),
              h({ fraga: '60 % är 42 kr. Hur mycket är 100 %?' }.fraga, 60, 42, 20, E.kr), h({ fraga: '80 % är 48 kr. Hur mycket är 100 %?' }.fraga, 80, 48, 20, E.kr) ]),
  g(R.bland, [ h({ fraga: '9 % är 63 kr. Hur mycket är 100 %?' }.fraga, 9, 63, 1, E.kr), h({ fraga: '60 % är 132 kr. Hur mycket är 100 %?' }.fraga, 60, 132, 10, E.kr),
               h({ fraga: '75 % är 120 kr. Hur mycket är 100 %?' }.fraga, 75, 120, 25, E.kr), h({ fraga: '12 % är 60 kr. Hur mycket är 100 %?' }.fraga, 12, 60, 1, E.kr),
               h({ fraga: '24 % är 18 kr. Hur mycket är 100 %?' }.fraga, 24, 18, 4, E.kr), h({ fraga: '90 % är 270 kr. Hur mycket är 100 %?' }.fraga, 90, 270, 10, E.kr),
               h({ fraga: '25 % är 35 kr. Hur mycket är 100 %?' }.fraga, 25, 35, 25, E.kr), h({ fraga: '10 % är 64 kr. Hur mycket är 100 %?' }.fraga, 10, 64, 10, E.kr) ])
] }); };

/* ── BLAD 2A — Lästal ── */
BLAD['2A'] = function(){ return medNod({ titel: T.b2, dokument: dok('2A', 'golv'), grupper: [
  g({ rubrik: '30 % av eleverna på en skola åker buss. Det är 45 elever. Hur många elever går på skolan?' }.rubrik, [ h(null, 30, 45, 10, E.elever) ]),
  g({ rubrik: 'En biobiljett kostar 48 kr. Det är 8 % av Alis månadspeng. Hur stor är hans månadspeng?' }.rubrik, [ h(null, 8, 48, 1, E.kr) ]),
  g({ rubrik: 'Ella har cyklat 75 % av vägen till skolan. Det är 6 km. Hur lång är vägen?' }.rubrik, [ h(null, 75, 6, 25, E.km) ]),
  g({ rubrik: 'Noah har sparat 40 % av priset på en cykel. Han har sparat 280 kr. Vad kostar cykeln?' }.rubrik, [ h(null, 40, 280, 10, E.kr) ]),
  g({ rubrik: '60 % av eleverna i en klass har en mobil med sig. Det är 12 elever. Hur många elever går i klassen?' }.rubrik, [ h(null, 60, 12, 20, E.elever) ]),
  g({ rubrik: '3 % av äpplena i en låda är ruttna. Det är 15 äpplen. Hur många äpplen finns i lådan?' }.rubrik, [ h(null, 3, 15, 1, E.apple) ]),
  g({ rubrik: 'Valter har simmat 18 längder. Det är 75 % av dagens träningssträcka. Hur många längder ska han simma?' }.rubrik, [ h(null, 75, 18, 25, E.langder) ]),
  g({ rubrik: 'En bonde odlar jordgubbar på 280 m². Det är 35 % av hans odlingar. Hur stora är odlingarna?' }.rubrik, [ h(null, 35, 280, 5, E.m2) ]),
  g({ rubrik: 'På en konsert var 210 av besökarna barn. Det var 70 % av alla besökare. Hur många besökare var det?' }.rubrik, [ h(null, 70, 210, 10, E.besokare) ]),
  g({ rubrik: 'Hanna gjorde sex inlägg på sociala medier med bilder från sin skejtning. Det var 20 % av alla hennes inlägg den dagen. Hur många inlägg gjorde hon sammanlagt?' }.rubrik, [ h(null, 20, 6, 20, E.inlagg) ]),
  g({ rubrik: '50 % av eleverna i en klass spelar ett instrument. Det är 14 elever. Hur många elever går i klassen?' }.rubrik, [ h(null, 50, 14, 50, E.elever) ])
] }); };

/* ── BLAD 3A — Rabatten i kronor ── */
BLAD['3A'] = function(){ return medNod({ titel: T.b3, dokument: dok('3A', 'mellan'), grupper: [
  g({ rubrik: 'En tröja är på rea med 30 % rabatt. Rabatten är 60 kr. Vad kostade tröjan före rean?' }.rubrik, [ h(null, 30, 60, 10, E.kr) ]),
  g({ rubrik: 'Ett par skor säljs med 15 % rabatt. Rabatten är 45 kr. Vad är det ordinarie priset?' }.rubrik, [ h(null, 15, 45, 5, E.kr) ]),
  g({ rubrik: 'En jacka säljs med 40 % rabatt. Rabatten är 160 kr. Vad är det ordinarie priset?' }.rubrik, [ h(null, 40, 160, 10, E.kr) ]),
  g({ rubrik: 'En kamera säljs med 12 % rabatt. Rabatten är 72 kr. Vad är det ordinarie priset?' }.rubrik, [ h(null, 12, 72, 4, E.kr) ]),
  g({ rubrik: 'En surfplatta säljs med 35 % rabatt. Rabatten är 175 kr. Vad är det ordinarie priset?' }.rubrik, [ h(null, 35, 175, 5, E.kr) ]),
  g({ rubrik: 'En soffa säljs med 60 % rabatt. Rabatten är 450 kr. Vad är det ordinarie priset?' }.rubrik, [ h(null, 60, 450, 20, E.kr) ]),
  g({ rubrik: 'Under en rea är det 20 % rabatt. En tröja blir 100 kr billigare. Vad kostade tröjan före rean?' }.rubrik, [ h(null, 20, 100, 20, E.kr) ]),
  g({ rubrik: 'En mössa säljs med 25 % rabatt. Rabatten är 70 kr. Vad är det ordinarie priset?' }.rubrik, [ h(null, 25, 70, 25, E.kr) ]),
  g({ rubrik: '6 % är 42 kr. Hur mycket är 100 %?' }.rubrik, [ h(null, 6, 42, 1, E.kr) ]),
  g({ rubrik: '90 % av platserna på ett tåg är bokade. Det är 180 platser. Hur många platser har tåget?' }.rubrik, [ h(null, 90, 180, 10, E.platser) ])
] }); };

/* ── BLAD 4A — Delen är det som är kvar ── */
BLAD['4A'] = function(){ return medNod({ titel: T.b4, dokument: dok('4A', 'mellan'), grupper: [
  g({ rubrik: 'I en låda är 5 äpplen ruttna. Det motsvarar 20 % av alla äpplen i lådan. Hur många friska äpplen finns det i lådan?' }.rubrik, [
    val(['A 100', 'B 25', 'C 20', 'D 4'], 'C 20') ]),
  g({ rubrik: '30 % av eleverna i en klass åker buss. Det är 12 elever. Hur många elever åker inte buss?' }.rubrik, [ rest(h(null, 30, 12, 10, E.elever)) ]),
  g({ rubrik: 'Noah har läst 75 sidor. Det är 60 % av boken. Hur många sidor har han kvar att läsa?' }.rubrik, [ rest(h(null, 60, 75, 20, E.sidor)) ]),
  g({ rubrik: '8 % av lamporna i en leverans var trasiga. Det var 24 lampor. Hur många lampor var hela?' }.rubrik, [ rest(h(null, 8, 24, 1, E.lampor)) ]),
  g({ rubrik: '40 % av medlemmarna i en klubb är pojkar. Det är 18 pojkar. Hur många flickor finns i klubben?' }.rubrik, [ rest(h(null, 40, 18, 20, E.medlemmar)) ]),
  g({ rubrik: '15 % av godiset i en påse är rött. Det är 12 godisbitar. Hur många godisbitar är inte röda?' }.rubrik, [ rest(h(null, 15, 12, 5, E.godis)) ]),
  g({ rubrik: 'Mira har betalat 70 % av en resa. Hon har betalat 350 kr. Hur mycket har hon kvar att betala?' }.rubrik, [ rest(h(null, 70, 350, 10, E.kr)) ]),
  g({ rubrik: 'En väska säljs med 30 % rabatt. Rabatten är 90 kr. Vad är det ordinarie priset?' }.rubrik, [ h(null, 30, 90, 10, E.kr) ]),
  g({ rubrik: '45 % av eleverna på en skola äter frukost i skolan. Det är 90 elever. Hur många elever går på skolan?' }.rubrik, [ h(null, 45, 90, 5, E.elever) ])
] }); };

/* ── BLAD 5A — Figur och sträcka ── */
BLAD['5A'] = function(){ return medNod({ titel: T.b5, dokument: dok('5A', 'mellan'), grupper: [
  g({ rubrik: 'Hur lång är hela stapeln?' }.rubrik, [ fig(FIG.b5n1()), h(null, 30, 24, 10, E.cm) ]),
  g({ rubrik: 'Hur stora är odlingarna?' }.rubrik, [ fig(FIG.b5n2()), h(null, 24, 96, 4, E.m2) ]),
  g({ rubrik: 'Hur lång är hela sträckan?' }.rubrik, [ fig(FIG.b5n3()), h(null, 40, 28, 20, E.mm) ]),
  g({ rubrik: 'En tank är fylld till 75 %. Den innehåller 45 liter. Hur mycket rymmer tanken?' }.rubrik, [ h(null, 75, 45, 25, E.liter) ]),
  g({ rubrik: 'De färgade rutorna är 15 % av rektangeln. Hur många rutor har rektangeln?' }.rubrik, [ fig(FIG.b5n5()), h(null, 15, 6, 5, E.rutor) ]),
  g({ rubrik: 'Hur mycket är hela stapeln värd?' }.rubrik, [ fig(FIG.b5n6()), h(null, 30, 45, 10, E.kr) ]),
  g({ rubrik: '16 % av bilarna i en kontroll körde för fort. Det var 32 bilar. Hur många bilar körde inte för fort?' }.rubrik, [ rest(h(null, 16, 32, 4, E.bilar)) ]),
  g({ rubrik: '45 % är 18 kg. Hur mycket är 100 %?' }.rubrik, [ h(null, 45, 18, 5, E.kg) ])
] }); };

/* ── BLAD 6A — Jämföra och hitta felet ── */
BLAD['6A'] = function(){ return medNod({ titel: T.b6, dokument: dok('6A', 'tak'), grupper: [
  g({ rubrik: '40 % av vikten på en låda är 120 g. Vad väger lådan?' }.rubrik, [ val(['A 48 g', 'B 300 g', 'C 30 g', 'D 3 kg'], 'B 300 g') ]),
  g({ rubrik: 'Agnes köper ett par byxor med 40 % rabatt. Hon betalar 360 kr. Tre kompisar räknar ut vad byxorna kostade före rabatten.' }.rubrik, [
    val(['A Pella', 'B Fia', 'C Ali'], 'A Pella', { fraga: 'Vem har räknat rätt?' }.fraga) ],
    [ { fraga: 'Pella: 60 % = 360 kr, 10 % = 360/6 = 60 kr, 100 % = 10 · 60 = 600 kr' }.fraga,
      { fraga: 'Fia: 40 % = 360 kr, 10 % = 360/4 = 90 kr, 100 % = 10 · 90 = 900 kr' }.fraga,
      { fraga: 'Ali: 40 % av 360 kr = 144 kr, 360 + 144 = 504 kr' }.fraga ]),
  g({ rubrik: '20 % av ett tal är 60. Vilket är talet?' }.rubrik, [ val(['A 12', 'B 80', 'C 120', 'D 300'], 'D 300') ]),
  g({ rubrik: 'Ida räknade så här: "25 % = 40 kr, 100 % = 25 · 40 = 1000 kr".' }.rubrik, [
    val(['A Hon har multiplicerat med 25 i stället för med 4.', 'B Hon har delat med fel tal.', 'C Inget är fel.'],
        'A Hon har multiplicerat med 25 i stället för med 4.', { fraga: 'Vad är fel?' }.fraga),
    val(['A 1000 kr', 'B 160 kr', 'C 10 kr'], 'B 160 kr', { fraga: 'Vad är 100 %?' }.fraga) ]),
  g({ rubrik: 'Tre jackor säljs med rabatt.' }.rubrik, [
    h({ fraga: 'Jacka A:' }.fraga, 20, 80, 20, E.kr), h({ fraga: 'Jacka B:' }.fraga, 30, 105, 10, E.kr), h({ fraga: 'Jacka C:' }.fraga, 10, 45, 10, E.kr),
    val(['A Jacka A', 'B Jacka B', 'C Jacka C'], 'C Jacka C', { fraga: 'Vilken jacka hade högst ordinarie pris?' }.fraga) ],
    [ { fraga: 'Jacka A: 20 % rabatt, rabatten är 80 kr.' }.fraga, { fraga: 'Jacka B: 30 % rabatt, rabatten är 105 kr.' }.fraga,
      { fraga: 'Jacka C: 10 % rabatt, rabatten är 45 kr.' }.fraga, { fraga: 'Räkna ut det ordinarie priset för varje jacka.' }.fraga ]),
  g({ rubrik: '30 % av eleverna på en skola cyklar. Det är 90 elever. Hur många elever går på skolan?' }.rubrik, [ val(['A 27', 'B 120', 'C 300', 'D 900'], 'C 300') ]),
  g({ rubrik: '10 % av lotterna i ett lotteri ger vinst. Det är 8 lotter. Hur många lotter ger inte vinst?' }.rubrik, [ val(['A 72', 'B 80', 'C 18'], 'A 72') ]),
  g({ rubrik: 'Hur lång är hela stapeln?' }.rubrik, [ fig(FIG.b6n8()), val(['A 27 cm', 'B 48 cm', 'C 144 cm'], 'B 48 cm') ])
] }); };

/* MOMENTET: sex blad, variant A. Spärren: NivaRad, krav 80 % rätta rutor på bladet före; Blad 1 och 2 alltid öppna. */
var MOMENT = { titel: 'Det hela', varianter: ['A'],
  nivaPrefix: 'k4d1', nivaId: 'hela', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: T.b1 }, { nr: 2, titel: T.b2 }, { nr: 3, titel: T.b3 }, { nr: 4, titel: T.b4 }, { nr: 5, titel: T.b5 },
          { nr: 6, titel: T.b6 } ] };

window.BLAD_K4_D1_HELA = {
  MOMENT: MOMENT,
  blad: function(id){ var b = BLAD[String(id || '').toUpperCase()]; return b ? b() : null; },
  idn: function(){ return Object.keys(BLAD); },
  // Testet och metodträningen (H1–H7) bygger med samma svarsrad: den spegelvända stegraden, Resten-raden och valrutan.
  TYPER: { h: h, rest: rest, val: val, fig: fig, E: E, HELA: HELA }
};
})();
