/* matpunkt.js — V14: en sida i grindens lista måste ge minst en mätpunkt.
 *
 * SKÄLET. V9 ser till att en sida ligger i grindens lista. Det räcker inte. En sida kan ligga i
 * listan, öppnas, mätas med noll blad — och grinden blir grön. Belagt 2026-10-01:
 * `ak7/k3/d4-ekvationer` kom in i nämnar-grindens lista och gav NOLL blad; grinden skrev inte ens
 * ut en rad om den, och slutade med "GRÖN · 107 blad mätta". Nians fyra öva-blad gav samma
 * tysta noll. Det är samma lögn som startade hela tråden — grön medan noll mäts — ett lager in.
 *
 * V9 garanterar MEDLEMSKAP. V14 garanterar MÄTNING.
 *
 * SÅ HÄR ANVÄNDS DEN i en grind:
 *     const MP = require('./matpunkt').skapa('namnare-grind.js');
 *     ... per sida:  MP.forsok(sida);           // sidan öppnades
 *     ... per mätning: MP.rakna(sida, antal);   // blad/rader/ytor som faktiskt mättes
 *     ... sist:      fel += MP.granska();       // fäller och NAMNGER sidan
 *
 * Bara försökta sidor granskas, så `--sida x` fungerar som förut: en körning som bara öppnade
 * en sida döms inte för de andra.
 *
 * SKÄL, inte tyst noll. Ett undantag gäller bara om det står i SKAL med ett **bevis grinden kan
 * pröva** — samma mönster som `EJ_MOTOR` i sidor.js. Beviset är ett uttryck som måste finnas i
 * sidans källa; håller det inte är skälet gammalt och grinden faller. Ett undantag för en sida
 * som BÖRJAT ge mätpunkter faller också: då döljer det nästa riktiga nolla.
 *
 * NEGATIVT VERIFIERAD 2026-10-01 i samma läge som grinden körs (V12), se grindens rapport.
 */
'use strict';
const fs = require('fs'), path = require('path');
const Sidor = require('./sidor');
const ROOT = Sidor.ROOT;

/* Sidor som får ge noll mätpunkter, med skäl och BEVIS — ett uttryck som måste finnas i sidans
 * källa. Håller beviset inte är skälet gammalt och grinden faller.
 *
 * Här får INTE en sida föras in bara för att den är tom. En AVSIKTLIG nolla (grinden mäter en
 * sorts rad som sidan med flit inte har) är ett skäl. En OAVSIKTLIG nolla är ett fynd att
 * utreda — innehåll eller generator saknas. Skillnaden är hela poängen med listan, och den
 * får inte avgöras av vilket av de två som är bekvämast. */
const SKAL = [
  // Tom med flit. Fylls bara av en nolla som är AVSIKTLIG, och först efter mätning.
  //
  // Nians fyra öva-blad hör INTE hit: de ligger inte i nämnar- och flerruts-grindens listor
  // alls, så V14 ser dem aldrig. De är ett MEDLEMSKAPS-undantag och står i V9:s UNDANTAG i
  // sidlist-grind.js. Hade de legat här hade skälet aldrig prövats — en ursäkt som inte kan
  // falla ut är precis den tysta raden V14 finns för att förbjuda.
];

/* Räckvidden, utskriven i stället för tyst utelämnad. V14 gäller grindar vars mätenhet är
 * blad/rader/ytor på en bladsida. Två svep står utanför, och det är ett beslut med skäl:
 *   smalruta-svep — enheten är RUTTYP, och en bladsida utan smala rutor har inga att mäta;
 *   tonad-svep    — enheten är CSS-regel på repots alla sidor, och noll döda regler är
 *                   det önskade utfallet, inte en utebliven mätning.
 * Får något av dem en per-blad-enhet hör det hit. */
const UTANFOR = {
  'smalruta-svep.js': 'enheten är ruttyp; en bladsida utan smala rutor har inget att mäta',
  'tonad-svep.js': 'enheten är CSS-regel på repots alla sidor; noll döda regler är rätt utfall'
};

function skapa(verktyg){
  const matt = {};        // sida -> antal mätpunkter
  const forsokta = [];
  const skal = SKAL.filter(s => s.verktyg === verktyg);

  return {
    forsok: function(sida){ if(forsokta.indexOf(sida) < 0) forsokta.push(sida); if(!(sida in matt)) matt[sida] = 0; },
    rakna: function(sida, antal){ matt[sida] = (matt[sida] || 0) + (antal || 0); },

    granska: function(){
      if(UTANFOR[verktyg]) return 0;
      const bladsidor = new Set(Sidor.alla());
      let brott = 0;
      const nollor = [], undantagna = [], gamla = [];

      forsokta.filter(s => bladsidor.has(s)).forEach(function(sida){
        const n = matt[sida] || 0;
        const u = skal.find(x => x.sida === sida);
        if(n > 0){
          // Ett undantag för en sida som mäts ska bort — annars döljer det nästa riktiga nolla.
          if(u) gamla.push(sida + ' ger ' + n + ' mätpunkter men står kvar i SKAL');
          return;
        }
        if(!u){ nollor.push(sida); return; }
        const kalla = fs.existsSync(path.join(ROOT, sida)) ? fs.readFileSync(path.join(ROOT, sida), 'utf8') : '';
        if(kalla.indexOf(u.bevis) < 0) gamla.push(sida + ': skälet säger "' + u.skal + '" men ' + u.bevis + ' finns inte i sidan');
        else undantagna.push(sida + ' — ' + u.skal);
      });

      console.log('\nV14 — mätpunkter per sida');
      if(nollor.length){
        brott += nollor.length;
        console.log('  ✗ ' + nollor.length + ' sida(or) i listan gav NOLL mätpunkter, utan skäl:');
        nollor.forEach(s => console.log('      ' + s));
        console.log('      En oavsiktlig nolla är ett fynd att utreda — skriv inte bort den som skäl.');
      }
      gamla.forEach(function(g){ brott++; console.log('  ✗ gammalt skäl: ' + g); });
      if(!nollor.length && !gamla.length){
        console.log('  ✓ varje bladsida i listan gav minst en mätpunkt' +
          (undantagna.length ? ' (' + undantagna.length + ' undantagna med prövat skäl)' : ''));
      }
      undantagna.forEach(u => console.log('      undantagen: ' + u));
      return brott;
    }
  };
}

module.exports = { skapa, SKAL, UTANFOR };

if(require.main === module){
  console.log('V14 — skäl-listan (' + SKAL.length + ' rader):');
  SKAL.forEach(s => console.log('  ' + s.verktyg.padEnd(18) + s.sida + '  [bevis: ' + s.bevis + ']  ' + s.skal));
  console.log('\nUtanför V14:s räckvidd:');
  Object.keys(UTANFOR).forEach(k => console.log('  ' + k.padEnd(18) + UTANFOR[k]));
}
