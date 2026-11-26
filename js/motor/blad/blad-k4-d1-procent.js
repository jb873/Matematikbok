/* blad-k4-d1-procent.js — MOMENTET "PROCENT OCH BYTA FORM" (åk 7, kapitel 4 Procent, Del 1 Procent, moment 1):
   Blad 1–5, variant A. Variant B läggs till i samma blad när den är skriven.
   Källa: doc/innehall/k4-d1-procent-moment1.md — Joachims klartext (version 2, facit kontrollräknat, 93 kedjor),
   ordagrant. Ett avsteg som Joachim beslutat (2026-11-26): de gula rutorna i Blad 1 nr 2 är gröna (figurmodulens färg).
   Rubrikerna står som i filen; hakparentesernas förlagor visas inte. Inga hjälptexter.
   Kedjorna (12/16 = 3/4 = 0,75 = 75 %) är bladkärnans formkedja (flerled med en form per led): bråket staplat,
   varje ruta rättas på värde och form — bråk (likvärdiga godtas), enklaste form, hundradelar, decimalform, procentform.
   "≈" för tredjedelarna. Figurerna: SvgAndel (stapel, kvadrat, 100 rutor med färggrupper) och SvgTallinje (tre rader).
   Spärren: NivaRad — Blad 1 och 2 alltid öppna, därefter 80 % rätta rutor på bladet före.
   Mastery (Joachim 2026-11-26, väg b): kapitel 4:s store (loggStore 'k4' → js/mastery-k4.js). Blad 1–4 loggar till
   proc-tillprocent:rakna ("Från bråk och decimalform till procentform"), Blad 5 till proc-franprocent:rakna ("Från
   procentform till bråk och decimalform") — noderna i js/data/k4-taxonomi.js.
   Ingen nätväg. */
(function(){
'use strict';
var A = window.SvgAndel, TL = window.SvgTallinje;
function g(rubrik, rader){ return { rubrik: rubrik, rader: rader }; }
var TILL = 'proc-tillprocent:rakna', FRAN = 'proc-franprocent:rakna';
// Bladets alla grupper loggar till noden, i kapitel 4:s store.
function medNod(nod, blad){ blad.grupper.forEach(function(gr){ gr.logg = nod; gr.loggStore = 'k4'; }); return blad; }
// Formkedjans led: bråk (likvärdiga godtas), enklaste form, hundradelar, decimalform, procentform, given text.
function br(s){ return { form: 'brak', svar: s }; }
function enk(s){ return { form: 'enklaste', svar: s }; }
function hun(s){ return { form: 'hundradelar', svar: s }; }
function dec(v){ return { form: 'decimal', svar: v }; }
function pro(v){ return { form: 'procent', svar: v }; }
function txt(s){ return { text: s }; }
function ca(l){ l.tecken = '≈'; return l; }
function kedja(vanster, led, extra){
  var r = { typ: 'flerled', led: led };
  if(vanster != null) r.vansterText = vanster;
  if(extra) Object.keys(extra).forEach(function(k){ r[k] = extra[k]; });
  return r;
}
function upp(n){ var ut = []; for(var i = 0; i < n; i++) ut.push(i); return ut; }   // de n första rutorna färgade
function sant(fraga, ratt){ return { typ: 'valruta', matte: true, fraga: fraga, alt: ['Sant', 'Falskt'], ratt: [ratt] }; }
function dok(blad, tak){
  return { del: 'Del 1 Procent', moment: 'Procent och byta form', blad: blad, arskurs: 7, roll: 'kärna',
           metod: 'Byta form', takregel: tak, kalla: 'doc/innehall/k4-d1-procent-moment1.md' };
}
/* Elevtext i fält (elevtext-låset läser bara kända fält). Ordagrant ur klartexten, godkänd av Joachim 2026-11-26. */
var T = {
  b1: { titel: 'Samma andel i tre former' }.titel,
  b2: { titel: 'Byta form med standardbråk' }.titel,
  b3: { titel: 'Förenkla till enklaste form' }.titel,
  b4: { titel: 'Förlänga och förkorta till hundradelar' }.titel,
  b5: { titel: 'Från procent, och det hela är 100 %' }.titel
};
var I = {
  b2: { intro: 'Skriv bråket i decimalform och sedan i procentform.' }.intro,
  b3: { intro: 'Skriv bråket i enklaste form. Skriv det sedan i decimalform och procentform.' }.intro,
  b4: { intro: 'Skriv bråket i hundradelar. Skriv det sedan i decimalform och procentform.' }.intro
};
var R = {
  b1n1: { rubrik: 'Hur stor del av figuren är färgad? Skriv i bråkform, decimalform och procentform.' }.rubrik,
  b1n2: { rubrik: 'Kvadraten består av 100 rutor. Skriv hur stor del av kvadraten varje färg är, i bråkform, decimalform och procentform.' }.rubrik,
  b1n3: { rubrik: 'Tallinjen har tre rader. Fyll i talen som saknas.' }.rubrik,
  b1n4: { rubrik: 'Fyll i det som saknas i tabellen.' }.rubrik,
  b1n5: { rubrik: 'Ringa in alla tal som är lika mycket värda som 2/5.' }.rubrik,
  sant: { rubrik: 'Stämmer det? Ringa in Sant eller Falskt.' }.rubrik,
  b1n7: { rubrik: 'Para ihop talen med samma värde.' }.rubrik,
  n10:  { rubrik: 'Nämnaren 10' }.rubrik,
  n100: { rubrik: 'Nämnaren 100' }.rubrik,
  n24:  { rubrik: 'Nämnaren 2 och 4' }.rubrik,
  n5:   { rubrik: 'Nämnaren 5' }.rubrik,
  n3:   { rubrik: 'Nämnaren 3. Avrunda decimaltalet till två decimaler.' }.rubrik,
  bland:{ rubrik: 'Blandade nämnare' }.rubrik,
  linj: { rubrik: 'Vad ska stå på linjerna?' }.rubrik,
  halv: { rubrik: 'Halvor och fjärdedelar' }.rubrik,
  femt: { rubrik: 'Femtedelar' }.rubrik,
  stor: { rubrik: 'Större tal' }.rubrik,
  valj: { rubrik: 'Välj bråket i enklaste form.' }.rubrik,
  d20:  { rubrik: '20-delar' }.rubrik,
  d25:  { rubrik: '25-delar' }.rubrik,
  d50:  { rubrik: '50-delar' }.rubrik,
  d200: { rubrik: '200-delar till 600-delar' }.rubrik,
  d700: { rubrik: '700-delar till 1200-delar' }.rubrik,
  blandat: { rubrik: 'Blandat' }.rubrik,
  tal:  { rubrik: 'Större täljare' }.rubrik,
  b5n1: { rubrik: 'Skriv procenten i hundradelar, i enklaste form och i decimalform. Hela tiotal.' }.rubrik,
  b5n2: { rubrik: 'Skriv procenten i hundradelar, i enklaste form och i decimalform. Övriga.' }.rubrik,
  hela: { rubrik: 'Det hela är 100 %' }.rubrik,
  kvar: { rubrik: 'Det som är kvar' }.rubrik
};
var BLAD = {};

/* ── BLAD 1A — Samma andel i tre former ── */
BLAD['1A'] = function(){ return medNod(TILL, { titel: T.b1, dokument: dok('1A', 'golv'), grupper: [
  g(R.b1n1, [
    kedja(null, [br('3/10'), dec(0.3), pro(30)], { svg: A.delStrip(10, [0, 1, 2]) }),
    kedja(null, [br('1/4'), dec(0.25), pro(25)], { svg: A.delRuta(2, 2, [0]) }),
    kedja(null, [br('2/5'), dec(0.4), pro(40)], { svg: A.delStrip(5, [0, 1]) }),
    kedja(null, [br('37/100'), dec(0.37), pro(37)], { svg: A.delRuta(10, 10, upp(37)) })
  ]),
  g(R.b1n2, [
    { typ: 'svgfigur', svg: A.delRuta(10, 10, [{ antal: 1, farg: 'bla' }, { antal: 9, farg: 'rod' }, { antal: 40, farg: 'gron' }]) },
    kedja(null, [br('1/100'), dec(0.01), pro(1)], { etikett: { etikett: 'blå:' }.etikett }),
    kedja(null, [br('9/100'), dec(0.09), pro(9)], { etikett: { etikett: 'röda:' }.etikett }),
    kedja(null, [br('40/100'), dec(0.4), pro(40)], { etikett: { etikett: 'gröna:' }.etikett }),
    kedja(null, [br('50/100'), dec(0.5), pro(50)], { etikett: { etikett: 'vita:' }.etikett })
  ]),
  g(R.b1n3, [
    { typ: 'svgfigur', svg: TL.linje({ min: 0, max: 1, steg: 0.25, rader: ['Bråkform', 'Decimalform', 'Procentform'] }) },
    { typ: 'tabell', huvud: 'kolumn', matris: [
      ['Bråkform', '1/4', '2/4', br('3/4'), '4/4'],
      ['Decimalform', '0,25', dec(0.5), '0,75', dec(1)],
      ['Procentform', pro(25), '50 %', pro(75), '100 %'] ] }
  ]),
  g(R.b1n4, [
    { typ: 'tabell', huvud: 'rad', matris: [
      ['Procentform', 'Bråkform', 'Decimalform'],
      ['50 %', '1/2', bok(dec(0.5), 'a')],
      [bok(pro(25), 'b'), '1/4', '0,25'],
      ['20 %', bok(br('1/5'), 'c'), '0,2'],
      [bok(pro(10), 'd'), '1/10', bok(dec(0.1), 'e')],
      ['1 %', bok(br('1/100'), 'f'), '0,01'] ] }
  ]),
  g(R.b1n5, [
    { typ: 'valruta', matte: true, flera: true, alt: ['0,4', '4/10', '4 %', '40 %', '0,04', '40/100', '0,40', '2,5'],
      ratt: ['0,4', '4/10', '40 %', '40/100', '0,40'] }
  ]),
  g(R.sant, [ sant('0,6 = 6 %', 'Falskt'), sant('1/5 = 20 %', 'Sant'), sant('0,25 = 25 %', 'Sant'),
              sant('1/4 = 4 %', 'Falskt'), sant('0,05 = 50 %', 'Falskt') ]),
  g(R.b1n7, [
    { typ: 'paraihop', matte: true, meningar: ['1) 25 %', '2) 20 %', '3) 1/2', '4) 40 %', '5) 3/4'],
      alt: ['1', '2', '3', '4', '5'],
      par: [ { fraga: 'A 1/5', ratt: '2' }, { fraga: 'B 75 %', ratt: '5' }, { fraga: 'C 4/10', ratt: '4' },
             { fraga: 'D 0,50', ratt: '3' }, { fraga: 'E 1/4', ratt: '1' } ] }
  ])
] }); };
function bok(ruta, b){ ruta.bokstav = b; return ruta; }

/* ── BLAD 2A — Byta form med standardbråk ── */
function dp(b, d, p){ return kedja(b, [dec(d), pro(p)]); }
BLAD['2A'] = function(){ return medNod(TILL, { titel: T.b2, intro: I.b2, dokument: dok('2A', 'golv'), grupper: [
  g(R.n10,  [ dp('3/10', 0.3, 30), dp('7/10', 0.7, 70), dp('1/10', 0.1, 10), dp('9/10', 0.9, 90) ]),
  g(R.n100, [ dp('37/100', 0.37, 37), dp('8/100', 0.08, 8), dp('60/100', 0.6, 60), dp('3/100', 0.03, 3) ]),
  g(R.n24,  [ dp('1/2', 0.5, 50), dp('1/4', 0.25, 25), dp('3/4', 0.75, 75), dp('2/4', 0.5, 50) ]),
  g(R.n5,   [ dp('1/5', 0.2, 20), dp('2/5', 0.4, 40), dp('3/5', 0.6, 60), dp('4/5', 0.8, 80) ]),
  g(R.n3,   [ kedja('1/3', [ca(dec(0.33)), pro(33)]), kedja('2/3', [ca(dec(0.67)), pro(67)]) ]),
  g(R.bland,[ dp('4/5', 0.8, 80), dp('7/100', 0.07, 7), dp('1/4', 0.25, 25), kedja('2/3', [ca(dec(0.67)), pro(67)]),
              dp('9/10', 0.9, 90), dp('1/2', 0.5, 50) ]),
  g(R.linj, [ kedja('3/4', [dec(0.75), txt('75 %')]),
              kedja(null, [br('1/5'), txt('0,2'), pro(20)]),
              kedja('3/10', [dec(0.3), pro(30)]),
              kedja(null, [br('1/100'), txt('0,01'), pro(1)]) ])
] }); };

/* ── BLAD 3A — Förenkla till enklaste form ── */
function edp(b, e, d, p){ return kedja(b, [enk(e), dec(d), pro(p)]); }
function valj(fraga, ratt){ return { typ: 'valruta', matte: true, fraga: fraga, alt: VAL[fraga], ratt: [ratt] }; }
var VAL = { '15/20:': ['A. 3/4', 'B. 5/4', 'C. 1/5'], '8/40:': ['A. 1/4', 'B. 1/5', 'C. 2/5'], '18/30:': ['A. 3/5', 'B. 2/3', 'C. 3/10'] };
BLAD['3A'] = function(){ return medNod(TILL, { titel: T.b3, intro: I.b3, dokument: dok('3A', 'mellan'), grupper: [
  g(R.halv, [ edp('6/8', '3/4', 0.75, 75), edp('5/10', '1/2', 0.5, 50), edp('4/16', '1/4', 0.25, 25), edp('9/12', '3/4', 0.75, 75) ]),
  g(R.femt, [ edp('6/15', '2/5', 0.4, 40), edp('8/10', '4/5', 0.8, 80), edp('3/15', '1/5', 0.2, 20), edp('12/20', '3/5', 0.6, 60) ]),
  g(R.stor, [ edp('12/16', '3/4', 0.75, 75), edp('18/24', '3/4', 0.75, 75), edp('14/28', '1/2', 0.5, 50),
              edp('9/36', '1/4', 0.25, 25), edp('21/35', '3/5', 0.6, 60), edp('16/40', '2/5', 0.4, 40) ]),
  g(R.valj, [ valj('15/20:', 'A. 3/4'), valj('8/40:', 'B. 1/5'), valj('18/30:', 'A. 3/5') ])
] }); };

/* ── BLAD 4A — Förlänga och förkorta till hundradelar ── */
function hdp(b, h, d, p){ return kedja(b, [hun(h), dec(d), pro(p)]); }
BLAD['4A'] = function(){ return medNod(TILL, { titel: T.b4, intro: I.b4, dokument: dok('4A', 'mellan'), grupper: [
  g(R.d20,  [ hdp('7/20', '35/100', 0.35, 35), hdp('13/20', '65/100', 0.65, 65), hdp('17/20', '85/100', 0.85, 85), hdp('19/20', '95/100', 0.95, 95) ]),
  g(R.d25,  [ hdp('6/25', '24/100', 0.24, 24), hdp('13/25', '52/100', 0.52, 52), hdp('19/25', '76/100', 0.76, 76), hdp('22/25', '88/100', 0.88, 88) ]),
  g(R.d50,  [ hdp('9/50', '18/100', 0.18, 18), hdp('21/50', '42/100', 0.42, 42), hdp('33/50', '66/100', 0.66, 66), hdp('43/50', '86/100', 0.86, 86) ]),
  g(R.d200, [ hdp('14/200', '7/100', 0.07, 7), hdp('27/300', '9/100', 0.09, 9), hdp('32/400', '8/100', 0.08, 8),
              hdp('55/500', '11/100', 0.11, 11), hdp('18/600', '3/100', 0.03, 3) ]),
  g(R.d700, [ hdp('42/700', '6/100', 0.06, 6), hdp('72/800', '9/100', 0.09, 9), hdp('63/900', '7/100', 0.07, 7),
              hdp('44/1100', '4/100', 0.04, 4), hdp('96/1200', '8/100', 0.08, 8) ]),
  g(R.blandat, [ hdp('11/20', '55/100', 0.55, 55), hdp('36/400', '9/100', 0.09, 9), hdp('17/25', '68/100', 0.68, 68),
                 hdp('77/700', '11/100', 0.11, 11), hdp('41/50', '82/100', 0.82, 82), hdp('54/900', '6/100', 0.06, 6) ]),
  g(R.tal,  [ hdp('63/300', '21/100', 0.21, 21), hdp('128/400', '32/100', 0.32, 32), hdp('246/600', '41/100', 0.41, 41),
              hdp('488/800', '61/100', 0.61, 61), hdp('279/900', '31/100', 0.31, 31), hdp('252/1200', '21/100', 0.21, 21) ])
] }); };

/* ── BLAD 5A — Från procent, och det hela är 100 % ── */
function hed(p, h, e, d){ return kedja(p, [hun(h), enk(e), dec(d)]); }
function rest(fraga, svar){ return { typ: 'text', fraga: fraga, svar: svar, enhet: '%' }; }
BLAD['5A'] = function(){ return medNod(FRAN, { titel: T.b5, dokument: dok('5A', 'tak'), grupper: [
  g(R.b5n1, [ hed('30 %', '30/100', '3/10', 0.3), hed('50 %', '50/100', '1/2', 0.5), hed('20 %', '20/100', '1/5', 0.2), hed('75 %', '75/100', '3/4', 0.75) ]),
  g(R.b5n2, [ hed('35 %', '35/100', '7/20', 0.35), hed('8 %', '8/100', '2/25', 0.08), hed('45 %', '45/100', '9/20', 0.45), hed('4 %', '4/100', '1/25', 0.04) ]),
  g(R.hela, [
    rest({ fraga: '40 % av eleverna cyklar till skolan. Hur många procent cyklar inte?' }.fraga, 60),
    rest({ fraga: '65 % av klassen har syskon. Hur många procent har inga syskon?' }.fraga, 35),
    { typ: 'bild', svg: A.delRuta(10, 10, upp(28)), fraga: { fraga: 'Hur många procent är inte färgade?' }.fraga, svar: 72, enhet: ' %' },
    rest({ fraga: '1/4 av godiset i påsen är rött. Hur många procent är inte rött?' }.fraga, 75)
  ]),
  g(R.kvar, [
    rest({ fraga: 'En flagga är 30 % blå och 45 % gul. Resten är vit. Hur många procent är vit?' }.fraga, 25),
    rest({ fraga: 'Lisa har läst 3/5 av boken. Hur många procent har hon kvar att läsa?' }.fraga, 40)
  ]),
  g(R.sant, [ sant('0,7 = 7/10 = 70 %', 'Sant'), sant('12 % = 0,12', 'Sant'), sant('5 % = 0,5', 'Falskt'),
              sant('60 % = 3/5', 'Sant'), sant('25 % = 1/25', 'Falskt') ])
] }); };

/* MOMENTET: fem blad, variant A (B kommer senare och läggs till i samma blad). Spärren: NivaRad, krav 80 % rätta rutor
   på bladet före; Blad 1 och 2 alltid öppna (KONVENTIONER §3). Bladens namn ur klartextens tabell. */
var MOMENT = { titel: 'Procent och byta form', varianter: ['A'],
  nivaPrefix: 'k4d1', nivaId: 'byta', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: T.b1 }, { nr: 2, titel: T.b2 }, { nr: 3, titel: T.b3 }, { nr: 4, titel: T.b4 }, { nr: 5, titel: T.b5 } ] };

window.BLAD_K4_D1_PROCENT = {
  MOMENT: MOMENT,
  blad: function(id){ var f = BLAD[String(id || '').toUpperCase()]; return f ? f() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
