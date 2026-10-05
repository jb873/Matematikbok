/* matpunkt.js — V14: en sida i grindens lista måste ge minst en mätpunkt.
 *
 * SKÄLET. V9 ser till att en sida ligger i grindens lista. Det räcker inte. En sida kan ligga i
 * listan, öppnas, mätas med noll blad — och grinden blir grön. Belagt 2026-10-01:
 * `ak7/k3/d4-ekvationer` kom in i nämnar-grindens lista och gav NOLL blad; grinden skrev inte ens
 * ut en rad om den, och slutade med "GRÖN · 107 blad mätta". Nians fyra öva-blad gav samma
 * tysta noll. Det är samma lögn som startade hela tråden — grön medan noll mäts — ett lager in.
 *
 * V9 garanterar MEDLEMSKAP. V14 garanterar MÄTNING. V11 garanterar att mätningen BLEV ETT
 * VÄRDE.
 *
 * V11 (en grind får inte ha en väg ut som hoppar mätningen) mäts här på utfallet i stället för
 * på kodvägen: varje grind anmäler de värden den sedan skriver ut, och ett värde som är
 * undefined, null, NaN eller tom sträng fäller. Skälet är belagt: namnar-grinden skrev
 * "✓ … 2Tallinjer: undefined/undefined" — den nådde bladet, mätte ingenting, och kallade det
 * grönt. Att leta tidiga returer i källtexten hade mätt kodens FORM; det här mäter vad
 * mätningen blev.
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
  /* d4 EKVATIONER — balansmetoden. Enda bevisade avvikelsen i systemet, och skälen är mätta
   * 2026-10-03 efter att per-rad-domen ytlagts.
   *
   * RÄTTELSE av de tidigare skälen: de sade att motorn saknar status per rad. Det var fel.
   * `kontrolleraUppg` har alltid graderat PER RAD — varje rad tolkas som en ekvation och prövas
   * med `sammaLosning`, alltså på värde — och `K.markera` sätter `rad-ok`/`rad-fel` plus ✓/✗.
   * Jag sökte på seg-ok/ak8-ok/correct/ovn-mark, och inget av dem var motorns ordförråd. Mitt
   * grep avgjorde slutsatsen. Rutorna bär nu ÄVEN plattformens `correct`/`wrong` (mätt inert),
   * så domen är läsbar för ett svep.
   *
   * Och ändå mäter dessa två grindar noll blad på sidan — därför att deras ENHET inte finns i
   * en fri kedja, inte därför att markupen skiljer:
   *
   *   namnare  kräver en "X av Y"-summering där Y = antalet synliga svarsenheter. I kedjan är
   *            antalet rader ELEVENS VAL (avtagande scaffolding: fler led för nybörjaren, färre
   *            för den skicklige, ner till miniminivån i `minstaAntalRader`). En fast nämnare
   *            motsäger metoden.
   *   flerruts fyller varje ruta med 0 och jämför mot ett FACIT PER RAD. En balansrad har inget
   *            facit — eleven hittar själv ett giltigt likhetsled, och 0 = 0 är giltigt men inte
   *            uppgiftens ekvation. Grinden skulle mäta något som inte finns.
   *
   * kontroll-svep mäter d4 utan undantag sedan 2026-10-02 (tre blad, grönt).
   *
   * ÖPPEN FRÅGA, Joachims: noll undantag kräver ett REGELBESLUT, inte mer markup — antingen att
   * nämnarregeln inte gäller en fri kedja (och grinden får veta det), eller att varje kedjerad
   * ska ha ett facit, vilket motsäger den fria kedjan. Jag väljer inte åt dig. */
  { verktyg: 'namnare-grind.js',  sida: 'ak7/k3/d4-ekvationer/index.html', bevis: 'ekvationer-balans', skal: 'fri kedja: antalet rader är elevens val, så nämnaren "synliga svarsenheter" är rörlig med flit' },
  { verktyg: 'flerruts-grind.js', sida: 'ak7/k3/d4-ekvationer/index.html', bevis: 'ekvationer-balans', skal: 'fri kedja: ingen facit per rad att fylla ur — grinden fyller 0 och jämför mot ett facit som inte finns' }
];

/* KÄNDA RÖDA MED ORSAK. En rad här gör INGENTING grönt — sidan räknas som brott precis som
   förut. Den enda skillnaden är att utskriften säger varför den är röd, och att granska() kan
   skilja en känd röd från en NY. Utan den skillnaden blir fyra eviga röda ett brus som döljer
   den femte, och då är grinden lika tyst som när den var grön.

   Nians fyra öva-sidor: strukturen är annorlunda uppbyggd och ännu inte genomtänkt. Att städa
   dem nu vore att låsa en struktur innan den är bestämd, och att skriva ett skäl vore att
   påstå att nollan är avsiktlig. Ingetdera är sant. De tas när nian arbetas igenom. */
const ETIKETT = [
  { sida: 'ak9/k1/rakna-med-brak-akr9-ova.html',    etikett: 'väntar genomgång', skal: 'nians struktur inte genomtänkt än — städas när nian arbetas igenom' },
  { sida: 'ak9/k1/rakna-med-brak-fordjupning.html', etikett: 'väntar genomgång', skal: 'nians struktur inte genomtänkt än — städas när nian arbetas igenom' },
  { sida: 'ak9/k1/rakna-med-brak-ova.html',         etikett: 'väntar genomgång', skal: 'nians struktur inte genomtänkt än — städas när nian arbetas igenom' },
  { sida: 'ak9/k1/tal-och-berakna-ova.html',        etikett: 'väntar genomgång', skal: 'nians struktur inte genomtänkt än — städas när nian arbetas igenom' },
  /* d4 och d5 bygger uppgiftsytan som rutnät (eq-grid, prob-uppg) med .seg-text-rutor — mätt
     2026-10-05: noll .ovn-sheet, noll .ovn-rad, noll .ovn-in på båda sidorna. K-D och K-E har
     ingen motsvarighet där; K-F har det, och om strecket ska gälla rutnäten är Joachims beslut. */
  { sida: 'ak7/k3/d4-ekvationer/index.html',        etikett: 'väntar beslut', skal: 'egen rutnätsyta (eq-grid) utan .ovn-sheet — K-F på rutnäten väntar på besked' },
  { sida: 'ak7/k3/d5-problemlosning/index.html',    etikett: 'väntar beslut', skal: 'egen rutnätsyta (prob-uppg) utan .ovn-sheet — K-F på rutnäten väntar på besked' }
];

/* Räckvidden, utskriven i stället för tyst utelämnad. V14 gäller grindar vars mätenhet är
 * blad/rader/ytor på en bladsida. Två svep står utanför, och det är ett beslut med skäl:
 *   smalruta-svep — enheten är RUTTYP, och en bladsida utan smala rutor har inga att mäta;
 *   tonad-svep    — enheten är CSS-regel på repots alla sidor, och noll döda regler är
 *                   det önskade utfallet, inte en utebliven mätning.
 * Får något av dem en per-blad-enhet hör det hit. */
const UTANFOR = {
  'smalruta-svep.js': 'enheten är ruttyp; en bladsida utan smala rutor har inget att mäta',
  'tonad-svep.js': 'enheten är CSS-regel på repots alla sidor; noll döda regler är rätt utfall',
  // Enheten är "grupp med mellanledssignal". De flesta bladsidor har ingen, helt riktigt — att
  // kräva en mätpunkt per sida hade gjort varje sida utan mellanledsuppgift röd. Grinden mäter
  // ändå: den rapporterar antalet grupper med signal, och V11 vaktar att värdena blev värden.
  'mellanled-grind.js': 'enheten är grupp med mellanledssignal; de flesta sidor har ingen sådan grupp'
};

function skapa(verktyg){
  const matt = {};        // sida -> antal mätpunkter
  const varden = [];      // V11: de värden grinden bygger sitt besked på
  const forsokta = [];
  const skal = SKAL.filter(s => s.verktyg === verktyg);

  return {
    forsok: function(sida){ if(forsokta.indexOf(sida) < 0) forsokta.push(sida); if(!(sida in matt)) matt[sida] = 0; },
    rakna: function(sida, antal){ matt[sida] = (matt[sida] || 0) + (antal || 0); },

    /* V11: grinden anmäler de värden den bygger sitt besked på. Ett värde som inte blev ett
       värde fäller — oavsett hur grönt beskedet ser ut. Grinden väljer själv VAD som är dess
       mätning; den som anmäler fel saker vaktas inte, och det syns i att listan är tom. */
    varde: function(sida, namn, obj){
      Object.keys(obj || {}).forEach(function(k){
        var v = obj[k];
        var trasigt = v === undefined || v === null || v === '' ||
                      (typeof v === 'number' && !isFinite(v));
        varden.push({ sida: sida, namn: namn, nyckel: k, varde: v, trasigt: trasigt });
      });
    },

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
        // Kända röda och nya röda skiljs i utskriften. Båda är brott; bara den nya är en nyhet.
        const kanda = nollor.filter(s => ETIKETT.some(e => e.sida === s));
        const nya = nollor.filter(s => !ETIKETT.some(e => e.sida === s));
        if(nya.length){
          console.log('  ✗ ' + nya.length + ' NY röd: sida i listan gav NOLL mätpunkter, utan skäl och utan etikett:');
          nya.forEach(s => console.log('      ' + s));
          console.log('      En oavsiktlig nolla är ett fynd att utreda — skriv inte bort den som skäl.');
        }
        if(kanda.length){
          console.log('  ✗ ' + kanda.length + ' känd röd (räknas som brott, orsaken känd):');
          kanda.forEach(function(s){
            const e = ETIKETT.find(x => x.sida === s);
            console.log('      [' + e.etikett + '] ' + s + ' — ' + e.skal);
          });
        }
      }
      gamla.forEach(function(g){ brott++; console.log('  ✗ gammalt skäl: ' + g); });
      if(!nollor.length && !gamla.length){
        console.log('  ✓ varje bladsida i listan gav minst en mätpunkt' +
          (undantagna.length ? ' (' + undantagna.length + ' undantagna med prövat skäl)' : ''));
      }
      undantagna.forEach(u => console.log('      undantagen: ' + u));

      // ── V11: blev mätningen ett värde? ──────────────────────────────────────────────────
      if(varden.length){
        const trasiga = varden.filter(v => v.trasigt);
        if(trasiga.length){
          brott += trasiga.length;
          console.log('  ✗ V11: ' + trasiga.length + ' mätvärde(n) blev aldrig ett värde — grinden skrev besked utan att mäta:');
          trasiga.slice(0, 12).forEach(t => console.log('      ' + t.sida + ' · ' + t.namn + ' · ' + t.nyckel + ' = ' + String(t.varde)));
          if(trasiga.length > 12) console.log('      … och ' + (trasiga.length - 12) + ' fler');
        } else {
          console.log('  ✓ V11: alla ' + varden.length + ' anmälda mätvärden blev verkliga värden');
        }
      }

      /* En etikett som inte längre behövs döljer nästa riktiga nolla, precis som ett dött skäl.
         Men ETIKETT-listan är DELAD mellan grindarna, och en enda körning kan inte bevisa att en
         etikett är död: att DEN HÄR grinden mäter något på sidan säger inget om de andra. Mätt
         2026-10-03: flik-grind ger 1 mätpunkt på tal-och-berakna-ova.html (5 svarsrutor, inga
         flikar) medan nians nolla står kvar i tre andra grindar — etiketten blev ett brott fast
         den behövs. Ett brott som är fel lär oss att strunta i röda rader, vilket är värre än
         inget brott. Beskedet står därför kvar med sin begränsning utskriven, men räknas inte.
         Vill man göra det till ett brott måste etiketten bära vilka grindar den gäller för, eller
         mätningen samlas över alla grindar i en körning. De verkliga nollorna är brott som förr. */
      ETIKETT.filter(e => forsokta.indexOf(e.sida) >= 0 && (matt[e.sida] || 0) > 0).forEach(function(e){
        console.log('  · etiketten för ' + e.sida + ' behövs inte för DEN HÄR grinden — sidan ger '
          + matt[e.sida] + ' mätpunkter här. Delad lista: pröva de andra grindarna före du tar bort den.');
      });
      return brott;
    }
  };
}

module.exports = { skapa, SKAL, ETIKETT, UTANFOR };

if(require.main === module){
  console.log('V14 — skäl-listan (' + SKAL.length + ' rader):');
  SKAL.forEach(s => console.log('  ' + s.verktyg.padEnd(18) + s.sida + '  [bevis: ' + s.bevis + ']  ' + s.skal));
  console.log('\nKända röda med orsak (' + ETIKETT.length + ' rader) — röda, inte gröna:');
  ETIKETT.forEach(e => console.log('  [' + e.etikett + '] ' + e.sida));
  console.log('\nUtanför V14:s räckvidd:');
  Object.keys(UTANFOR).forEach(k => console.log('  ' + k.padEnd(18) + UTANFOR[k]));
}
