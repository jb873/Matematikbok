/* monster-fuzz.js — FIGURERNA ÄR RITADE UR REGELN (order 2026-09-30).

   Mönsterfigurerna ska genereras ur mönstrets regel, inte ritas en gång per figur. Då måste det
   som RITAS och det som PÅSTÅS stämma överens för varje n — annars är "genererad ur regeln" bara
   ett ord i en kommentar.

   KRÄVS PER FAMILJ
     ANTAL      antalet ritade delar = familjens formel, för n = 1…30.
                Antalet räknas ur svg-monster.figur(), som räknar det ritade — inte ur formeln.
     FÖRLAGAN   figur 1–3 stämmer med dokumentets bilder (siffrorna nedan är avlästa ur dem).
     DISTINKT   varje sticka ritas EN gång. En dubblerad kant syns inte på skärmen men gör
                antalet fel, och är just det fel som uppstår när delade kanter inte slås ihop.
     PUNKTER    två punkter får inte ligga på samma plats (samma fel, andra familjen).
     LÄNGD      ingen sticka får ha längden noll. En sådan RÄKNAS men SYNS inte — den långa
                sexhörningen ritades som en romb med rätt antal kanter, och bara en jämförelse
                av FORMEN mot dokumentets bild avslöjade det. Nu mäts det.

   KÖR:  node verktyg/monster-fuzz.js
   Exit 1 vid fel. Ingen nätväg, ingen fil ändras, ingen webbläsare behövs. */
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'js/motor/figur/svg-monster.js'));
const M = global.window.SvgMonster;

// Figur 1–3 avlästa ur dokumentets bilder (word/media), familj för familj.
const FORLAGAN = {
  kulorRad:          [1, 3, 5],
  bollarTva:         [5, 8, 11],
  prickarTriangel:   [3, 5, 7],
  knappar4:          [5, 9, 13],
  kulorBlock:        [4, 8, 12],
  blaRoda:           [5, 11, 17],
  kvadrater:         [4, 7, 10],
  trianglar:         [3, 5, 7],
  sexhorningar:      [6, 11, 16],
  langaSexhorningar: [6, 11, 16]
};

function delarAv(familj, n){
  const f = M.FAMILJER[familj];
  return f.bygg(n);
}
function nyckelKant(s){
  const a = s.x1.toFixed(3) + ',' + s.y1.toFixed(3), b = s.x2.toFixed(3) + ',' + s.y2.toFixed(3);
  return a < b ? a + '|' + b : b + '|' + a;
}

let fel = 0, familjer = 0;
console.log('MÖNSTER-FUZZ — figuren ritas ur regeln, antalet räknas ur figuren\n');

Object.keys(M.FAMILJER).forEach(namn => {
  const f = M.FAMILJER[namn];
  familjer++;
  const brott = [];

  // ANTAL: det ritade mot formeln, n = 1…30
  for(let n = 1; n <= 30; n++){
    const r = M.figur(namn, n);
    const vantat = f.formel(n);
    if(r.antal !== vantat){ brott.push('n=' + n + ': ritade ' + r.antal + ' delar, formeln ' + f.uttryck + ' ger ' + vantat); break; }
  }

  // FÖRLAGAN: figur 1–3 mot dokumentets bilder
  const forl = FORLAGAN[namn];
  if(!forl) brott.push('ingen avläsning ur förlagan — familjen saknas i FORLAGAN');
  else [1, 2, 3].forEach(n => {
    const a = M.figur(namn, n).antal;
    if(a !== forl[n - 1]) brott.push('figur ' + n + ': ritar ' + a + ', dokumentets bild visar ' + forl[n - 1]);
  });

  // DISTINKT / PUNKTER: ingen del ritad två gånger
  for(let n = 1; n <= 12; n++){
    const delar = delarAv(namn, n), sedd = {};
    let dubbel = 0;
    delar.forEach(d => {
      const k = f.slag === 'stickor' ? nyckelKant(d) : (d.x.toFixed(3) + ',' + d.y.toFixed(3));
      if(sedd[k]) dubbel++; else sedd[k] = 1;
    });
    if(dubbel){ brott.push('n=' + n + ': ' + dubbel + ' ' + (f.slag === 'stickor' ? 'sticka/or' : 'punkt(er)') + ' ritade två gånger'); break; }
  }

  // LÄNGD: en sticka utan längd räknas men syns inte
  if(f.slag === 'stickor'){
    for(let n = 1; n <= 12; n++){
      const nollor = delarAv(namn, n).filter(d => Math.abs(d.x1 - d.x2) < 1e-9 && Math.abs(d.y1 - d.y2) < 1e-9);
      if(nollor.length){ brott.push('n=' + n + ': ' + nollor.length + ' sticka/or med längden noll — räknas men syns inte'); break; }
    }
  }

  if(brott.length){ fel += brott.length; console.log('✗ ' + namn.padEnd(20) + '\n     ' + brott.join('\n     ')); }
  else console.log('✓ ' + namn.padEnd(20) + ' ' + f.uttryck.padEnd(8) + ' · n=1…30 · figur 1–3 = ' + forl.join(', '));
});

console.log('\n' + (fel ? '✗ MÖNSTER-FUZZ RÖTT (' + fel + ')' : '✓ MÖNSTER-FUZZ GRÖN')
  + ' · ' + familjer + ' familjer');
process.exit(fel ? 1 : 0);
