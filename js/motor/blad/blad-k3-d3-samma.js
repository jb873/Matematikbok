/* blad-k3-d3-samma.js — FÖRENKLA UTTRYCK (åk 7, k3 d3), MOMENT 1 "Samma variabel" (Joachim 2026-11-24: tre moment, högst
   tre blad per moment; avsnittets stegring fördelas på bladen). Blad 1 = steg 1 (upprepad addition); Blad 2 = steg 2
   plus och minus, Blad 3 = steg 2 gånger och delat (doc/innehall/k3-d3-forenkla-steg2.md). Alla i A och B.
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
// Förenkla-rutan: likvärdiga svar godkänns, också koefficienten 1 utskriven ("1y" = "y"; Joachim 2026-11-24).
function forenkla(uttryck, svar, vars){ return { typ: 'forenkla', fraga: uttryck, svar: svar, vars: vars, tillatEtta: true }; }
function val(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: [ratt] }; }
// K-C: figuren, sidorna (uppställningen eleven skriver) och det förenklade uttrycket.
function omkrets(svg, sidor, svar, vars){ return { typ: 'skrivforenkla', svg: svg, sidor: sidor, svar: svar, vars: vars }; }
// K-B: ersätt variabeln (facit byggs ur uttrycket) och beräkna.
function berakna(fraga, uttryck, x, svar, vars){ return { typ: 'berakna', fraga: fraga, uttryck: uttryck, x: x, svar: svar, vars: vars }; }
// Förenkla först, beräkna sedan: förenklingen och K-B-kedjan på samma rad.
function forenklaBerakna(fraga, uttryck, forenklat, x, svar, vars){
  var r = { typ: 'parentes', uttryck: uttryck, svar: forenklat, mellanled: 'nej', vars: vars, tillatEtta: true,
            varde: { etikett: { etikett: 'Beräkna' }.etikett, x: x, svar: svar } };
  if(fraga) r.fraga = fraga;
  return r;
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

/* ═══ STEG 2 (doc/innehall/k3-d3-forenkla-steg2.md, Joachim 2026-11-24; facit kontrollräknat). Placering: klartextens
   Blad 1A/1B (plus och minus) → Blad 2A/2B, klartextens Blad 2A/2B (gånger och delat) → Blad 3A/3B. Bråk [täljare |
   nämnare] skrivs "8x/2" och ritas staplat (K-H). Uppgift 5: förenkla först, beräkna sedan (K-B). ═══ */
var R2 = {
  forenkla: { rubrik: 'Förenkla.' }.rubrik,
  valj: { rubrik: 'Välj det förenklade uttrycket.' }.rubrik
};
function beraknaRubrik(v, t){ return { rubrik: 'Förenkla först och beräkna sedan värdet när ' + v + ' = ' + t + '.' }.rubrik; }

/* ── BLAD 2A – plus och minus (klartextens Blad 1A) ── */
BLAD['2A'] = function(){ return { titel: 'Plus och minus', grupper: [
  // [E 65a–b, C 58a]
  g(R2.forenkla, [ forenkla('5x + 3x', '8x', 'x'), forenkla('4y + y', '5y', 'y'), forenkla('7a + 2a', '9a', 'a') ]),
  // [E 65e–g, C 58c]
  g(R2.forenkla, [ forenkla('9x − 4x', '5x', 'x'), forenkla('10y − y', '9y', 'y'), forenkla('8z − 2z', '6z', 'z') ]),
  // [E 65d, h, A 2093b]
  g(R2.forenkla, [ forenkla('3x + 2x + x', '6x', 'x'), forenkla('6y − 2y + y', '5y', 'y'), forenkla('x − x', '0', 'x') ]),
  // [E 76]
  g(R2.valj, [ val('3x + 5x:', ['8x', '15x', '8 + x'], '8x'), val('12a − 4a:', ['8', '8a', '16a'], '8a'), val('6y − y:', ['6', '5', '5y'], '5y') ]),
  // [E 79]
  g(beraknaRubrik('x', 4), [ forenklaBerakna('', '2x + 5x', '7x', 4, 28, 'x'), forenklaBerakna('', '9x - 3x', '6x', 4, 24, 'x') ])
] }; };

/* ── BLAD 2B – plus och minus (klartextens Blad 1B) ── */
BLAD['2B'] = function(){ return { titel: 'Plus och minus', grupper: [
  // [E 65f]
  g(R2.forenkla, [ forenkla('12x + 9x', '21x', 'x'), forenkla('25y + 15y', '40y', 'y'), forenkla('100z − 25z', '75z', 'z') ]),
  // [E 65c, e, g]
  g(R2.forenkla, [ forenkla('11x − 4x', '7x', 'x'), forenkla('3y + 19y', '22y', 'y'), forenkla('20a − a', '19a', 'a') ]),
  // [E 65, A 2093]
  g(R2.forenkla, [ forenkla('4x + 3x − 2x', '5x', 'x'), forenkla('8y − 3y − 5y', '0', 'y'), forenkla('a + 6a − 4a', '3a', 'a') ]),
  // [E 76]
  g(R2.valj, [ val('9b − 2b + b:', ['6b', '7b', '8b'], '8b'), val('15x − 15x:', ['0', 'x', '30x'], '0'), val('2y + 7y − 3y:', ['12y', '6y', '6'], '6y') ]),
  // [E 79]
  g(beraknaRubrik('y', 5), [ forenklaBerakna('', '6y + 4y - 3y', '7y', 5, 35, 'y'), forenklaBerakna('', '12y - 7y', '5y', 5, 25, 'y') ])
] }; };

/* ── BLAD 3A – gånger och delat (klartextens Blad 2A) ── */
BLAD['3A'] = function(){ return { titel: 'Gånger och delat', grupper: [
  // [E 66a–b]
  g(R2.forenkla, [ forenkla('2 · 3y', '6y', 'y'), forenkla('4 · 5x', '20x', 'x'), forenkla('3 · 2a', '6a', 'a') ]),
  // [E 66c, exempel b]
  g(R2.forenkla, [ forenkla('5y · 3', '15y', 'y'), forenkla('2x · 4', '8x', 'x'), forenkla('7a · 2', '14a', 'a') ]),
  // [E 66e–f, exempel c]
  g(R2.forenkla, [ forenkla('8x/2', '4x', 'x'), forenkla('12y/3', '4y', 'y'), forenkla('10a/5', '2a', 'a') ]),
  // [E 66, E 76]
  g(R2.valj, [ val('4 · 2x:', ['6x', '8x', '42x'], '8x'), val('6y/2:', ['3y', '4y', '3'], '3y'), val('3x · 5:', ['8x', '35x', '15x'], '15x') ]),
  // [E 79]
  g(beraknaRubrik('x', 3), [ forenklaBerakna('', '4 · 2x', '8x', 3, 24, 'x'), forenklaBerakna('', '10x/2', '5x', 3, 15, 'x') ])
] }; };

/* ── BLAD 3B – gånger och delat (klartextens Blad 2B) ── */
BLAD['3B'] = function(){ return { titel: 'Gånger och delat', grupper: [
  // [E 66a–b]
  g(R2.forenkla, [ forenkla('6 · 4x', '24x', 'x'), forenkla('10 · 6y', '60y', 'y'), forenkla('8 · 3a', '24a', 'a') ]),
  // [E 66c]
  g(R2.forenkla, [ forenkla('9y · 4', '36y', 'y'), forenkla('2y · 6', '12y', 'y'), forenkla('5x · 5', '25x', 'x') ]),
  // [E 66e, g, h]
  g(R2.forenkla, [ forenkla('24x/6', '4x', 'x'), forenkla('2y/2', 'y', 'y'), forenkla('8x/8', 'x', 'x') ]),
  // [E 66, E 76]
  g(R2.valj, [ val('18a/3:', ['6', '15a', '6a'], '6a'), val('3 · 4y:', ['7y', '12y', '34y'], '12y'), val('5x/5:', ['x', '5', '0'], 'x') ]),
  // [E 79]
  g(beraknaRubrik('y', 4), [ forenklaBerakna('', '3 · 5y', '15y', 4, 60, 'y'), forenklaBerakna('', '16y/8', '2y', 4, 8, 'y') ])
] }; };

/* MOMENTET: Blad 1–3 med varianterna A och B (Blad 1 = steg 1, Blad 2 = steg 2 plus och minus, Blad 3 = steg 2
   gånger och delat). Spärren (NivaRad, §3): Blad 1 och 2 alltid öppna, Blad 3 vid 80 % på Blad 2A eller 2B — nyckeln
   k3d3_naddNiva3_samma. */
var MOMENT = { titel: 'Samma variabel', varianter: ['A', 'B'],
  nivaPrefix: 'k3d3', nivaId: 'samma', nivaKrav: { andel: 0.8 },
  blad: [ { nr: 1, titel: '' }, { nr: 2, titel: '' }, { nr: 3, titel: '' } ] };

window.BLAD_K3_D3_SAMMA = {
  MOMENT: MOMENT,
  blad: function(id){ var f = BLAD[String(id || '').toUpperCase()]; return f ? f() : null; },
  idn: function(){ return Object.keys(BLAD); }
};
})();
