/* blad-k3-d3-samma.js — FÖRENKLA UTTRYCK (åk 7, k3 d3), MOMENT 1 "Samma variabel" (Joachim 2026-11-24: tre moment, högst
   tre blad per moment; avsnittets stegring fördelas på bladen). Blad 1 = steg 1 (upprepad addition, byggt: 1A och 1B);
   Blad 2 = steg 2 plus och minus, Blad 3 = steg 2 gånger och delat — "Kommer senare" tills de är byggda.
   Spärren som i Tolka och teckna: Blad 1 och 2 alltid öppna (§3), Blad 3 vid 80 % på Blad 2A eller 2B (NivaRad).
   Källa: doc/innehall/k3-d3-forenkla-steg1.md (Joachims klartext 2026-11-24, facit kontrollräknat; facit 1B nr 5
   tillagt). Uppgifter, tal och facit ordagrant; förlagan [inom hakparentes] står bara här i kommentaren.
   Befintliga komponenter i bladkärnan (blad-karna-b.js):
     nr 1 och 3  förenkla-rutan (data-forenkla, AlgBrak.gradePoly: värde OCH förenklad form — "x + x + x" godtas inte
                 som det kortare uttrycket)
     nr 2        valrutan
     nr 4        K-C "skriv ett uttryck och förenkla" (skrivforenkla, två rutor) med figuren och dess sidor
     nr 5a       K-B beräkningskedjan (berakna): ersätt variabeln, beräkna; ett led till är frivilligt ("+ led")
     nr 5b       förenkla och sedan K-B (parentes-raden med varde: förenkla = skriv av = ersätt = beräkna)
   Inga hjälptexter. Mastery: alg-samla:rakna ("Förenkla uttryck", k3-taxonomin, utbudslista k3d3), k3-storen.
   Ingen nätväg. */
(function(){
'use strict';
var NOD = 'alg-samla:rakna';
function F(){ return window.SvgAlgebraFigur; }
function g(rubrik, rader){ return { rubrik: rubrik, logg: NOD, loggStore: 'k3', rader: rader }; }
function forenkla(uttryck, svar, vars){ return { typ: 'forenkla', fraga: uttryck, svar: svar, vars: vars }; }
function val(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: [ratt] }; }
// K-C: figuren, sidorna (uppställningen eleven skriver) och det förenklade uttrycket.
function omkrets(svg, sidor, svar, vars){ return { typ: 'skrivforenkla', svg: svg, sidor: sidor, svar: svar, vars: vars }; }
// K-B: ersätt variabeln (facit byggs ur uttrycket) och beräkna.
function berakna(fraga, uttryck, x, svar, vars){ return { typ: 'berakna', fraga: fraga, uttryck: uttryck, x: x, svar: svar, vars: vars }; }
// Förenkla först, beräkna sedan: förenklingen och K-B-kedjan på samma rad.
function forenklaBerakna(fraga, uttryck, forenklat, x, svar, vars){
  return { typ: 'parentes', fraga: fraga, uttryck: uttryck, svar: forenklat, mellanled: 'nej', vars: vars,
           varde: { etikett: { etikett: 'Beräkna' }.etikett, x: x, svar: svar } };
}
// Rubrikerna i fält (elevtext-låset ser bara kända fält). Ordagrant ur klartexten.
var R = {
  summan: { rubrik: 'Skriv summan som ett kortare uttryck.' }.rubrik,
  valj: { rubrik: 'Välj det uttryck som betyder samma sak.' }.rubrik,
  forenkla: { rubrik: 'Förenkla uttrycket.' }.rubrik,
  omkrets: { rubrik: 'Fyll i ett uttryck för omkretsen och förenkla det.' }.rubrik
};
var BLAD = {};

/* ── BLAD 1A ── */
BLAD['1A'] = function(){ return { titel: 'Upprepad addition', grupper: [
  // [E s. 138 teori, kap 3.3 teori]
  g(R.summan, [ forenkla('x + x + x', '3x', 'x'), forenkla('y + y + y + y + y', '5y', 'y'), forenkla('a + a', '2a', 'a') ]),
  // [kap 3.3 teori]
  g(R.valj, [ val('4x:', ['x + 4', 'x + x + x + x', '4 + 4 + 4 + 4'], 'x + x + x + x'),
              val('2y:', ['y + y', 'y + 2', '2 + 2'], 'y + y'),
              val('3b:', ['3 + b', 'b + 3', 'b + b + b'], 'b + b + b') ]),
  // [A 2092, E exempel]
  g(R.forenkla, [ forenkla('x + x + 2x', '4x', 'x'), forenkla('y + 2y', '3y', 'y'), forenkla('3a + a', '4a', 'a') ]),
  // [kap 3.3 teori, 2.4 teori]
  g(R.omkrets, [
    omkrets(F().triangel({ ben: 'a cm', bas: 'a cm', liksidig: true }), ['a', 'a', 'a'], '3a', 'a'),
    omkrets(F().rektangel({ bredd: 's cm', hojd: 's cm', kvadrat: true }), ['s', 's', 's', 's'], '4s', 's'),
    omkrets(F().rektangel({ bredd: 'b cm', hojd: 'h cm' }), ['b', 'h', 'b', 'h'], '2b + 2h', 'bh') ]),
  // [E 79]
  g('', [ berakna('Beräkna x + x + x när x = 6.', 'x + x + x', 6, 18, 'x'),
          forenklaBerakna('Förenkla först x + x + x och beräkna sedan värdet när x = 6.', 'x + x + x', '3x', 6, 18, 'x') ])
] }; };

/* ── BLAD 1B ── */
BLAD['1B'] = function(){ return { titel: 'Upprepad addition', grupper: [
  // [E s. 138 teori, kap 3.3 teori]
  g(R.summan, [ forenkla('z + z + z + z', '4z', 'z'), forenkla('x + x + x + x + x + x', '6x', 'x'), forenkla('b + b + b', '3b', 'b') ]),
  // [kap 3.3 teori, E exempel]
  g(R.valj, [ val('5y:', ['y + 5', '5 + 5 + 5 + 5 + 5', 'y + y + y + y + y'], 'y + y + y + y + y'),
              val('3x + x:', ['3x', '4x', '4 + x'], '4x'),
              val('y + 2y + y:', ['4y', '3y', '2y + 2'], '4y') ]),
  // [A 2092, E exempel]
  g(R.forenkla, [ forenkla('2x + x + x', '4x', 'x'), forenkla('a + 3a + 2a', '6a', 'a'), forenkla('4y + y', '5y', 'y') ]),
  // [kap 3.3 teori, 2.4 teori, C 60]
  g(R.omkrets, [
    omkrets(F().triangel({ ben: '2x cm', bas: '2x cm', liksidig: true }), ['2x', '2x', '2x'], '6x', 'x'),
    omkrets(F().rektangel({ bredd: '2a cm', hojd: 'a cm' }), ['2a', 'a', '2a', 'a'], '6a', 'a'),
    omkrets(F().rektangel({ bredd: 'x cm', hojd: 'y cm' }), ['x', 'y', 'x', 'y'], '2x + 2y', 'xy') ]),
  // [E 79]
  g('', [ berakna('Beräkna y + y + y + y när y = 7.', 'y + y + y + y', 7, 28, 'y'),
          forenklaBerakna('Förenkla först y + y + y + y och beräkna sedan värdet när y = 7.', 'y + y + y + y', '4y', 7, 28, 'y') ])
] }; };

/* MOMENTET: Blad 1–3 med varianterna A och B; Blad 2 och 3 är inte byggda. Spärren (NivaRad, §3): nyckeln
   k3d3_naddNiva3_samma. */
var MOMENT = { titel: 'Samma variabel', varianter: ['A', 'B'],
  nivaPrefix: 'k3d3', nivaId: 'samma', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: '' }, { nr: 2, titel: '', kommer: true }, { nr: 3, titel: '', kommer: true } ] };

window.BLAD_K3_D3_SAMMA = {
  MOMENT: MOMENT,
  blad: function(id){ var f = BLAD[String(id || '').toUpperCase()]; return f ? f() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
