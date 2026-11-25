/* blad-k3-d3-typer.js — UPPGIFTSTYPERNA I FÖRENKLA UTTRYCK (åk 7, k3 d3), delade av momentens datafiler (moment 3
   blad-k3-d3-siffer.js, moment 4 blad-k3-d3-tillampning.js). Befintliga komponenter i bladkärnan (blad-karna-b.js):
     forenkla        förenkla-rutan (AlgBrak.gradePoly: värde, förenklad form och ordning — KONVENTIONER §3);
                     likvärdiga svar som 1y = y godkänns (tillatEtta)
     val / flera     valrutan; flera = ringa in alla som stämmer
     ringa           "Ringa in alla variabeltermer": varje term i uttrycket är ett val
     omkrets         K-C "skriv ett uttryck och förenkla" med figuren och dess sidor (två rutor)
     skriv           K-C utan figursidor: uppställningen rättas på värde, sedan det förenklade (två rutor)
     utt             teckna (uttrycksrutan; termerna i valfri ordning)
     berakna         K-B: ersätt variabeln (en eller flera) och beräkna, med enhet
     fb              förenkla först och beräkna sedan: förenklingen och K-B-kedjan (förenklat, insättning, svar)
     figur           figurmotorn (svg-algebrafigur.js): rektangel, triangel, sträcka, femhörning, prislappar (också
                     lådor med vikt: en lapp per låda)
   Mastery: alg-samla:rakna ("Förenkla uttryck"), k3-storen. Ingen nätväg. */
(function(){
'use strict';
var NOD = 'alg-samla:rakna';
function F(){ return window.SvgAlgebraFigur; }
function g(rubrik, rader){ return { rubrik: rubrik, logg: NOD, loggStore: 'k3', rader: rader }; }
function forenkla(uttryck, svar, vars){ return { typ: 'forenkla', fraga: uttryck, svar: svar, vars: vars || 'x', tillatEtta: true }; }
function val(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: [ratt] }; }
function flera(fraga, alt, ratt){ return { typ: 'valruta', fraga: fraga, alt: alt, ratt: ratt, flera: true }; }
function ringa(uttryck, termer, ratt){ return { typ: 'valruta', fraga: uttryck, alt: termer, ratt: ratt, flera: true }; }
function omkrets(svg, sidor, svar, vars, fraga){
  var r = { typ: 'skrivforenkla', svg: svg, sidor: sidor, svar: svar, vars: vars || 'x' };
  if(fraga) r.fraga = fraga;
  return r;
}
function skriv(fraga, uppstallning, svar, vars){ return { typ: 'skrivforenkla', fraga: fraga, skriv: uppstallning, svar: svar, vars: vars || 'x' }; }
function utt(fraga, svar, vars){ return { typ: 'uttryck', fraga: fraga, svar: svar, vars: vars || 'x' }; }
function berakna(fraga, uttryck, x, svar, vars, enhet){
  var r = { typ: 'berakna', fraga: fraga, uttryck: uttryck, x: x, svar: svar, vars: vars || 'x' };
  if(enhet) r.enhet = enhet;
  return r;
}
function fb(uttryck, forenklat, x, svar, vars){
  return { typ: 'parentes', uttryck: uttryck, svar: forenklat, mellanled: 'nej', vars: vars || 'x', tillatEtta: true,
           varde: { etikett: { etikett: 'Beräkna' }.etikett, x: x, svar: svar } };
}
function figur(svg){ return { typ: 'svgfigur', svg: svg }; }
// Lådor med vikt: en lapp per låda (namn, vikt).
function lador(lista){ return figur(F().prislappar({ varor: lista.map(function(l){ return { namn: l[0], pris: l[1] }; }) })); }
// Rubriken "Förenkla först och beräkna sedan värdet när …".
function nar(text){ return { rubrik: 'Förenkla först och beräkna sedan värdet när ' + text + '.' }.rubrik; }
var R = {
  forenkla: { rubrik: 'Förenkla.' }.rubrik,
  valj: { rubrik: 'Välj det förenklade uttrycket.' }.rubrik,
  omkrets: { rubrik: 'Skriv ett uttryck för omkretsen och förenkla det.' }.rubrik
};

/* PARENTESER (moment 5 och metodträningens gren Parenteser; flyttat hit ur blad-k3-d3-parenteser.js 2026-11-25 så att
   bladen och drillen använder SAMMA funktioner). Åttans komponenter och rättning:
     parentes.p   radtypen 'parentes': uttrycket = mellanled = svar (MellanledRattare + AlgBrak.gradePoly)
     parentes.fb  förenkla och beräkna: frågan ("när x = 4") på bokstavens rad, parentesraden, K-B-kedjan
     parentes.sk  K-C "skriv ett uttryck och förenkla" (figur valfri)
     parentes.krav  mellanledets krav ur uttrycket: minus framför parentes → 'kravt'; plus eller siffra framför →
                  'frivilligt'; ledet vore svaret (3(x + 2) → 3x + 6) → 'nej' (MellanledRattare.kravAv, som åttan)
     parentes.g   gruppen med nod och k3-storen; gruppens mellanledsflagga ur raderna (som i åttan) */
function ML(){ return window.MellanledRattare; }
function pKrav(u){
  var m = ML(), k = m && m.kravAv(u);
  if(!k) return 'nej';
  return m.grupper(u).some(function(x){ return x.parentes && x.tecken === '-'; }) ? 'kravt' : 'frivilligt';
}
function pVars(u){
  var v = (String(u).match(/[a-z]/g) || []).filter(function(c, i, a){ return a.indexOf(c) === i; }).sort().join('');
  return v || 'x';
}
function pG(rubrik, nod, rader){
  var gr = { rubrik: rubrik, logg: nod, loggStore: 'k3', rader: rader };
  if(rader.some(function(r){ return r.mellanled === 'kravt'; })) gr.mellanled = 'kravt';
  return gr;
}
function pP(uttryck, svar){
  return { typ: 'parentes', uttryck: uttryck, svar: svar, vars: pVars(uttryck + ' ' + svar), mellanled: pKrav(uttryck), tillatEtta: true };
}
function pFb(fraga, uttryck, forenklat, x, svar){
  var r = pP(uttryck, forenklat);
  if(fraga) r.fraga = fraga;
  r.varde = { etikett: { etikett: 'Beräkna' }.etikett, x: x, svar: svar };
  return r;
}
function pSk(fraga, skriv, svar, svg){
  var r = { typ: 'skrivforenkla', fraga: fraga, skriv: skriv, svar: svar, vars: pVars(skriv), mellanled: pKrav(skriv) };
  if(svg) r.svg = svg;
  return r;
}

window.K3D3_TYPER = { NOD: NOD, F: F, g: g, forenkla: forenkla, val: val, flera: flera, ringa: ringa, omkrets: omkrets,
  skriv: skriv, utt: utt, berakna: berakna, fb: fb, figur: figur, lador: lador, nar: nar, R: R,
  parentes: { krav: pKrav, vars: pVars, g: pG, p: pP, fb: pFb, sk: pSk } };
})();
