/* monster-villkor.js — ÖPPNA TALFÖLJDER RÄTTADE MOT VILLKORET (window.MonsterVillkor).
   Order 2026-09-30, sjuans delkapitel Mönster.

   "Gör en talföljd där mönstret ökar med tre" har inget facit — vilken följd som helst duger,
   så länge den uppfyller villkoret. Rättaren jämför därför inte mot ett svar utan prövar regeln
   mellan varje par av tal. Det är samma sak som AlgBrak.gradeOppet gör för uttryck, fast för
   talföljder: gradeOppet rättar ett ALGEBRAISKT uttryck mot ett mål med termantal, och kunde
   inte användas här.

   VILLKOR
     { typ: 'differens', d: 3 }      varje steg ökar med d
     { typ: 'rekursiv', k: 3, m: 1 } varje nästa tal = k · föregående + m

   ALLA TAL MÅSTE VARA IFYLLDA. En följd med tre tal när fyra begärts är inte halvrätt — den
   visar inte att eleven kan fortsätta mönstret. Och regeln måste hålla mellan VARJE par: en följd
   där bara första steget stämmer är inte en talföljd, det är två tal och en gissning.

   Ingen nätväg. Testas headless av verktyg/monster-fuzz.js. */
(function(){
'use strict';

function talAv(v){
  if(v == null) return NaN;
  var s = String(v).trim().replace(/\s/g, '').replace(/[−–—]/g, '-').replace(',', '.');
  if(s === '' || !/^-?\d*\.?\d+$/.test(s)) return NaN;
  return parseFloat(s);
}

// varden = rutornas innehåll i ordning. antal = hur många tal som begärts.
function prova(varden, villkor, antal){
  var n = antal || (varden || []).length;
  var v = (varden || []).map(talAv);

  if(v.length < n || v.slice(0, n).some(function(x){ return isNaN(x); }))
    return { status: 'fel', skal: 'ofullstandig',
             besked: 'Skriv alla ' + n + ' talen.' };

  var tal = v.slice(0, n);
  if(tal.length < 2) return { status: 'fel', skal: 'forkort', besked: 'Talföljden behöver minst två tal.' };

  for(var i = 1; i < tal.length; i++){
    var fore = tal[i - 1], nu = tal[i];
    if(villkor.typ === 'differens'){
      if(Math.abs((nu - fore) - villkor.d) > 1e-9)
        return { status: 'fel', skal: 'steg', vidSteg: i,
                 besked: 'Steget från ' + visa(fore) + ' till ' + visa(nu) + ' är '
                       + visa(nu - fore) + ', inte ' + visa(villkor.d) + '.' };
    } else if(villkor.typ === 'rekursiv'){
      var vantat = villkor.k * fore + villkor.m;
      if(Math.abs(nu - vantat) > 1e-9)
        return { status: 'fel', skal: 'steg', vidSteg: i,
                 besked: 'Efter ' + visa(fore) + ' ska det komma ' + visa(vantat) + ', inte ' + visa(nu) + '.' };
    } else {
      return { status: 'fel', skal: 'okantVillkor' };
    }
  }
  return { status: 'ratt' };
}
function visa(x){ return String(Math.round(x * 1e9) / 1e9).replace('.', ','); }

window.MonsterVillkor = { prova: prova, talAv: talAv };
})();
