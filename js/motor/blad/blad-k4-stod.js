/* blad-k4-stod.js — STÖDDOKUMENTEN I PROCENT (Joachim 2026-11-28). Innehållet ordagrant ur
   doc/innehall/k4-procent-stod-byta-form.md. Visas på procentens uppgiftssida (ak7/k4/d1-procent/uppgift.html?stod=byta-form),
   ritat av bladkärnan (bygg_blad): avsnitten är bladets uppgifter utan rutor (rubriken och meningarna under den, bråken
   staplade) och standardbråken står i tabellkomponenten (tabell med matris). Inga rutor, ingen knappsats, ingen loggning;
   sidan döljer kontrollknapparna. Länkas från procentkapitlen i åk 7, 8 och 9 (KONVENTIONER: ett moment i två årskurser
   byggs en gång); åk 8 och 9 länkar hit med ?retur= så att Tillbaka leder tillbaka. Ingen ny komponent. */
(function(){
'use strict';

/* ── BYTA FORM ──
   Ett avsnitt: { rubrik, text, punkter, exempel } eller, i avsnitt 4, flera block { underrubrik, punkter } före exemplen
   och standardbråken efter dem. Texterna är klartextens, ordagrant. */
var BYTA_FORM = {
  titel: 'Byta form',
  intro: 'Ett tal kan skrivas på tre sätt: i bråkform, i decimalform och i procentform. Procent betyder hundradelar, så 35 % är detsamma som 35/100.',
  avsnitt: [
    { rubrik: 'Förlänga till hundradelar',
      text: 'Används när nämnaren är 20, 25 eller 50 och bråket inte går att förkorta.',
      punkter: [ 'Ta reda på hur många gånger nämnaren går i 100.',
                 'Multiplicera täljaren och nämnaren med det talet.',
                 'Antalet hundradelar är procenttalet.' ],
      exempel: [ '7/20 = 35/100 = 35 %', '13/25 = 52/100 = 52 %' ] },
    { rubrik: 'Förkorta till hundradelar',
      text: 'Används när nämnaren är ett jämnt hundratal, från 200 till 1 200.',
      punkter: [ 'Ta reda på hur många hundratal nämnaren är.',
                 'Dela täljaren och nämnaren med det talet.',
                 'Antalet hundradelar är procenttalet.' ],
      exempel: [ '8/200 = 4/100 = 4 %', '72/300 = 24/100 = 24 %' ] },
    { rubrik: 'Förkorta till enklaste form',
      text: 'Används när bråket går att förkorta till ett standardbråk.',
      punkter: [ 'Hitta det största tal som både täljaren och nämnaren går att dela med.',
                 'Dela täljaren och nämnaren med det talet.',
                 'Skriv bråket i decimalform.',
                 'Skriv decimaltalet i procentform.' ],
      exempel: [ '12/16 = 3/4 = 0,75 = 75 %', '6/30 = 1/5 = 0,2 = 20 %' ] },
    { rubrik: 'Byta mellan former',
      block: [ { underrubrik: 'Från bråk till procent',
                 punkter: [ 'Skriv bråket i decimalform.',
                            'Multiplicera decimaltalet med 100. Kommat flyttas två steg åt höger.',
                            'Skriv procenttecknet efter talet.' ] },
               { underrubrik: 'Från procent till bråk och decimalform',
                 punkter: [ 'Skriv procenttalet som hundradelar.',
                            'Förkorta till enklaste form.',
                            'Skriv bråket i decimalform.' ] } ],
      exempel: [ '35 % = 35/100 = 7/20 = 0,35', '60 % = 60/100 = 3/5 = 0,6' ],
      tabell: { underrubrik: 'Standardbråken',
                matris: [ [ 'Bråkform', 'Decimalform', 'Procentform' ],
                          [ '1/2', '0,5', '50 %' ],
                          [ '1/4', '0,25', '25 %' ],
                          [ '3/4', '0,75', '75 %' ],
                          [ '1/5', '0,2', '20 %' ],
                          [ '1/10', '0,1', '10 %' ],
                          [ '1/3', '≈ 0,33', '≈ 33 %' ] ] } }
  ]
};
// Ordet före exemplen, som i klartexten.
var ORD = { exempel: { etikett: 'Exempel' } };

var STOD = { 'byta-form': BYTA_FORM };

/* BLADET: ett avsnitt = en uppgift i bladkärnan utan rutor. Meningarna under rubriken (grupp.meningar) är raderna i
   ordning, med en tom rad före exemplen och mellan blocken; punkterna med "•", underrubrikerna i fetstil. Standardbråken:
   tabell med matris och rubrikrad. Ingen grupp loggar (loggarEj med skälet). */
function fet(s){ return '<b>' + s + '</b>'; }
function blad(id){
  var S = STOD[id]; if(!S) return null;
  var punkt = function(p){ return '• ' + p; };
  var brak = window.BLAD_BRAK_UT || function(s){ return s; };
  return {
    titel: S.titel,
    intro: brak(S.intro),
    grupper: S.avsnitt.map(function(a){
      var m = [];
      if(a.text) m.push(a.text);
      if(a.punkter) m.push.apply(m, a.punkter.map(punkt));
      (a.block || []).forEach(function(b, i){ if(i) m.push(''); m.push(fet(b.underrubrik)); m.push.apply(m, b.punkter.map(punkt)); });
      m.push('', fet(ORD.exempel.etikett));
      m.push.apply(m, a.exempel);
      var rader = [];
      if(a.tabell){ m.push('', fet(a.tabell.underrubrik)); rader.push({ typ: 'tabell', matris: a.tabell.matris, huvud: 'rad' }); }
      return { rubrik: a.rubrik, meningar: m, rader: rader, loggarEj: 'stöddokument utan rutor' };
    })
  };
}

window.BLAD_K4_STOD = { STOD: STOD, blad: blad };
})();
