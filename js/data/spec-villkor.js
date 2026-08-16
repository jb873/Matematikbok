/* spec-villkor.js — SPEC-VILLKOR: vad varje test-nod FÅR producera, härlett ur öva-dokumenten.
   ─────────────────────────────────────────────────────────────────────────────────────────────
   Grindens andra ben (vid sidan av facit-diffen): verktyg/spec-fuzz.js kör ramens generatorer
   headless och kontrollerar varje uppgift mot nodens villkor här. En generator som producerar
   utanför sitt villkor är ett FEL, inte en variant.

   TAKREGELN (Joachim): uppgifterna får ALDRIG bli svårare än de som finns i öva-dokumentet.
   Öva definierar både GOLV och TAK; variationen sker inom bandet. Nivå-parameterns övre gräns
   per nod HÄRLEDS ur öva — den väljs inte fritt.

   ÅTTANS k1-tak = SJUANS tak. Åttan har inga egna k1-stenciler (återanvänder sjuans blad) och
   åttans dk1/dk2 är repetition av det som ska sitta före högstadiet. profiler.ak8 === 'ak7'.

   ── DETTA ÄR DATA. Ändra ett talområde utan att röra en generator. ──

   SCHEMA (per nod):
     kalla       : var villkoret kommer ifrån (öva-blad/variant) — spårbarhet.
     profiler    : { ak7|ak8|ak9 : PROFIL }.  ak8:'ak7' = ärver sjuans profil.
   PROFIL:
     variant     : feature-set som fuzzen skickar till generatorn (cfg.varianter). null = default.
     enforce     : true (default) = avvikelse räknas i grinden. false = dokumenterad, blockerar EJ
                   (öva-sanning nedskriven, men fixen ej godkänd av Joachim ännu — se _pending).
     tak         : PER-UPPGIFT-tak (varje genererad uppgift MÅSTE uppfylla) — fångar "för svår":
                     maxOperationer, maxParenteser (djup), brakstreck(bool),
                     maxMagnitud (största |tal| i uppgiften), maxDecimaler (flest decimaler).
     kravs       : TÄCKNINGS-krav (generatorns SAMLADE utfall över N prov MÅSTE nå) — fångar "för lätt":
                     faktorSet (dessa värden ska förekomma som operand),
                     decimalOperand(bool), mellanled(bool), minOperationer, parenteser(bool), brakstreck(bool).
     _pending    : fritext — varför enforce:false (vad som väntar på beslut/bygge).
*/
(function(){
  'use strict';

  var VILLKOR = {

    // ── Öva 1 / d5: tiopotenser ─────────────────────────────────────────────────────────────
    'mult-rakna:pow10': {
      kalla: 'åk7 blad-k1-d5 (mult10: 10·6,75 · 100·4,5 · 1000·45,123) · åk9 ova1 tpMult (5,3·100 · 76,9·0,01)',
      profiler: {
        ak7: { variant:null, enforce:false,
          _pending:'åk7 pow10 ger bara heltal·{10,100,1000}; öva-d5 har decimaloperander — ej godkänt att röra åk7-default.',
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:99999, maxDecimaler:3 },
          kravs:{ faktorSet:[10,100,1000] } },
        ak8: 'ak7',
        ak9: { variant:{ talomrade:'nian' }, enforce:true,
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:999999, maxDecimaler:3 },
          kravs:{ faktorSet:[1000,100,10,0.1,0.01,0.001], decimalOperand:true } }
      }
    },
    'div-rakna:pow10': {
      kalla: 'åk7 blad-k1-d5 (div10: 0,5/10 · 703,8/1000 · 83/100) · åk9 ova1 tpDiv (5,4/10 · 32,5/0,1 · 2,8/0,01)',
      profiler: {
        ak7: { variant:null, enforce:false,
          _pending:'åk7 div-pow10 delar bara med 10/100 (heltal); öva-d5 har /1000 + decimaler — ej godkänt att röra åk7-default.',
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:99999, maxDecimaler:3 },
          kravs:{ faktorSet:[10,100] } },
        ak8: 'ak7',
        ak9: { variant:{ talomrade:'nian' }, enforce:true,
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:999999, maxDecimaler:3 },
          kravs:{ faktorSet:[1000,100,10,0.1,0.01,0.001], decimalOperand:true } }
      }
    },

    // ── Öva 2 / d6–d7: stora tal, decimaler ─────────────────────────────────────────────────
    'mult-rakna:stora': {
      kalla: 'åk7 blad-k1-d6 (stora: 800·6 · 23·2000 · 6000·900) · åk9 ova2 (50000·2000 …)',
      profiler: {
        ak7: { variant:null, enforce:false,
          _pending:'åk7-default ger 12–49·3–9 (max 441); öva-d6 har hundra-/tusental — ej godkänt att röra åk7-default.',
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:1000000, maxDecimaler:1 },
          kravs:{} },
        ak8: 'ak7',
        ak9: { variant:{ talomrade:'nian' }, enforce:true,  // slice 1 KLAR — ska passera
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:300000000, maxDecimaler:0 },
          kravs:{ minMagnitud:10000 } }
      }
    },
    'mult-rakna:sma': {  // nian-tillägg (slice 2); ej i åk7/åk8:s test → bara ak9-profil.
      kalla: 'åk7 blad-k1-d6 (sma) · åk9 ova2 multDec — decimalfaktorer {0,5;0,25;0,2;0,1}',
      profiler: {
        ak9: { variant:null, enforce:true,  // slice 2 KLAR — ska passera
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:100, maxDecimaler:2 },
          kravs:{ decimalOperand:true } }
      }
    },
    'mult-rakna:storasma': {
      kalla: 'åk7 blad-k1-d6 (storasma: 60·0,3) · åk9 ova2 g5 (7000·0,4) — KOMPENSATIONS-mellanled',
      profiler: {
        ak7: { variant:null, enforce:false,
          _pending:'öva har kompensations-mellanled; testet ger bara slutsvar. Fix = nian-mellanled (slice 3), åk7-default rörs ej.',
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:100000, maxDecimaler:2 },
          kravs:{} },
        ak8: 'ak7',
        ak9: { variant:{ talomrade:'nian' }, enforce:true,  // slice 3 MÅL
          tak:{ maxOperationer:2, maxParenteser:0, brakstreck:false, maxMagnitud:1000000, maxDecimaler:2 },
          kravs:{ mellanled:true } }
      }
    },
    'div-rakna:sma': {  // nian-tillägg (slice 2); ej i åk7/åk8:s test → bara ak9-profil.
      kalla: 'åk9 ova2 divSkala (34,8/0,04 · 78,42/0,6) — FÖRLÄNGNINGS-mellanled, divisorer {0,01;0,2;0,5;0,03;0,04;0,6}',
      profiler: {
        ak9: { variant:{ talomrade:'nian' }, enforce:true,
          tak:{ maxOperationer:1, maxParenteser:0, brakstreck:false, maxMagnitud:1000, maxDecimaler:2 },
          kravs:{ mellanled:true } }
      }
    },

    // ── Öva 3 / d2: prioritering ────────────────────────────────────────────────────────────
    'prio-prioritering:rakna': {
      kalla: 'åk7 blad-k1-d2 (27/3−3·2 · (32−8)/(4+6) · 20+8,3·100) · åk9 ova3 (4–6 op, nästlade parenteser, bråkstreck)',
      profiler: {
        ak7: { variant:null, enforce:false,
          _pending:'åk7-default: max 3 tal, en parentes, ingen division/decimal. Öva-d2 har mer — men åk7-default rörs ej.',
          tak:{ maxOperationer:4, maxParenteser:2, brakstreck:true, maxMagnitud:1000, maxDecimaler:2 },
          kravs:{} },
        ak8: 'ak7',
        ak9: { variant:{ struktur:['parenteser','koefficient','brakstreck'] }, enforce:true,  // slice 3 MÅL
          tak:{ maxOperationer:6, maxParenteser:2, brakstreck:true, maxMagnitud:1000, maxDecimaler:2 },
          kravs:{ minOperationer:4, parenteser:true } }
      }
    }

  };

  var API = { VILLKOR: VILLKOR,
    // löser upp ak8:'ak7'-arv till konkret profil
    profil: function(nod, ars){
      var n = VILLKOR[nod]; if(!n) return null;
      var p = n.profiler[ars]; if(p == null) return null;
      var guard = 0;
      while(typeof p === 'string' && guard++ < 5){ p = n.profiler[p]; }
      return (typeof p === 'object') ? p : null;
    }
  };

  if(typeof module !== 'undefined' && module.exports) module.exports = API;
  if(typeof window !== 'undefined') window.SPEC_VILLKOR = API;
})();
