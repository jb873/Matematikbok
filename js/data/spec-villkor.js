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


  // ═══════════════════════════════════════════════════════════════════════════════════════════
  //  UPPSTÄLLNINGS-BANDET — talområden för Färdighetsträningens uppställningsdrillar
  //  (add/sub/mult/div, ak7-k1-ram). Joachims talområden, order 2026-09-19. "15 + 15 var inte
  //  högstadienivå." Generatorn (js/motor/metod/uppstallning-band.js) läser HÄR; ändra ett tal-
  //  område utan att röra generatorn; verktyg/uppst-band-fuzz.js påstår att bandet hålls.
  //
  //  SCHEMA per räknesätt:
  //    namn      : { 1:'…', 2:'…', 3:'…' }  — nivånamnet eleven ser (FALT: elevtext, J.B. sätter ordet)
  //    nivaer    : { 1: VILLKOR, 2: VILLKOR, 3: VILLKOR }
  //  VILLKOR:
  //    arv       : nivå vars villkor gäller i botten (2 och 3 ärver 1: "övriga villkor gäller fortfarande")
  //    <operand> : { min, max }  — tillåtet område per operand (term/faktorStor/faktorLiten/taljare/namnare)
  //    minstEn   : { min, max }  — MINST EN av de storleksbärande operanderna ska ligga här (nivå 2)
  //    resultat  : { summa|differens|kvot : { min } | 'heltal' } — villkor på resultatet
  //    blandning : { perOmgang:'alla', profiler:[ VILLKOR-tillägg, … ] } — NIVÅ 3 ÄR EN FÖRDELNING,
  //                inte ett intervall: varje uppgift dras ur EN profil; 'alla' = varje omgång ska
  //                innehålla varje profil minst en gång (klättringen håller det tidigare färskt).
  //    struktur  : drillens egna krav som gör metoden nödvändig (minnessiffra/växling) — dokumenterade
  //                här så fuzzen kan skilja bandets förkastning från strukturens.
  //
  //  ANTAGANDEN (ej i ordern, satta som data så de kan justeras): nivå 1 = tvåsiffrigt (max 99);
  //  nivå 2:s andra operand får vara upp till 999; nivå 3-profilerna 535–1234 och 1235–9999;
  //  den lilla faktorn i mult är 3–9 (ensiffrig drill) resp. 12–99 (flersiffrig drill, ental ≥ 3);
  //  nämnaren i div är 3–9 (kort och lång division delar band).
  var UPPST_BAND = {
    add: {
      kalla: 'Joachim 2026-09-19: båda termerna > 34, summan > 100; nivå 2 en term > 334; nivå 3 blandat > 534 / > 1234',
      namn: { 1:'Tvåsiffriga tal', 2:'Tresiffriga tal', 3:'Decimaltal', 4:'Tusental' },
      omgang: 5,
      nivaer: {
        1: { term:{min:35,max:99}, resultat:{ summa:{min:101} }, struktur:'minnessiffra i entalen (drillens krav)' },
        2: { arv:1, term:{min:35,max:999}, minstEn:{min:335,max:999} },
        3: { arv:2, decimaler:{min:1,max:2} },   // DECIMALTAL som nivå 3 (J.B. 2026-09-19, alt. c): ny notation före större tal; minNiva:3 i åttan = klarade decimaler som förr. Mantissor ur nivå 2 (tresiffriga räcker)
        4: { arv:1, term:{min:35,max:9999}, blandning:{ perOmgang:'alla', profiler:[ { minstEn:{min:535,max:1234} }, { minstEn:{min:1235,max:9999} } ] } }   // TUSENTAL som nivå 4: större tal av samma slag, två profiler   // FJÄRDE NIVÅN (J.B. 2026-09-19): nivå 3:s heltalsband skalat med 10^dec — bandet i heltal, uppgiften i decimaltal
      }
    },
    sub: {
      kalla: 'Joachim 2026-09-19: båda termerna > 34, differensen > 31; nivå 2 en term > 334; nivå 3 blandat > 534 / > 1234',
      namn: { 1:'Tvåsiffriga tal', 2:'Tresiffriga tal', 3:'Decimaltal', 4:'Tusental' },
      omgang: 5,
      nivaer: {
        1: { term:{min:35,max:199}, resultat:{ differens:{min:32} }, struktur:'minst en växling (drillens krav)' },   // max 199 (J.B. 2026-09-19): med 99 blev poolen ~500 par och synbart likformig
        2: { arv:1, term:{min:35,max:999}, minstEn:{min:335,max:999} },
        3: { arv:2, decimaler:{min:1,max:2} },   // DECIMALTAL som nivå 3 (J.B. 2026-09-19, alt. c): ny notation före större tal; minNiva:3 i åttan = klarade decimaler som förr. Mantissor ur nivå 2 (tresiffriga räcker)
        4: { arv:1, term:{min:35,max:9999}, blandning:{ perOmgang:'alla', profiler:[ { minstEn:{min:535,max:1234} }, { minstEn:{min:1235,max:9999} } ] } }   // TUSENTAL som nivå 4: större tal av samma slag, två profiler   // fjärde nivån: decimaltal (skalat heltalsband)
      }
    },
    mult: {   // ensiffrig multiplikator (mult-metoder:uppstallning)
      kalla: 'Joachim 2026-09-19: ena faktorn > 34, den andra ≥ 3; nivå 2 en faktor > 334; nivå 3 blandat > 534 / > 1234',
      namn: { 1:'Tvåsiffrigt tal · ensiffrigt', 2:'Tresiffrigt tal · ensiffrigt', 3:'Decimaltal · ensiffrigt', 4:'Tusental · ensiffrigt' },
      omgang: 3,
      nivaer: {
        1: { faktorStor:{min:35,max:99}, faktorLiten:{min:3,max:9}, struktur:'stora faktorns ental ≥ 3 (drillens krav: flera delprodukter)' },
        2: { arv:1, faktorStor:{min:335,max:999} },
        3: { arv:2, decimaler:{min:1,max:2} },   // DECIMALTAL som nivå 3 (alt. c): stora faktorn skalad, tresiffrig mantissa
        4: { arv:1, blandning:{ perOmgang:'alla', profiler:[ { faktorStor:{min:1235,max:4999} }, { faktorStor:{min:5000,max:9999} } ] } }   // TUSENTAL som nivå 4: tusental genomgående (>534-profilen gav nivå 2-tal när storleken bärs av EN faktor)
      }
    },
    'mult-fler': {   // flersiffrig multiplikator (mult-metoder:uppstallning-stora) — samma band, liten faktor tvåsiffrig
      kalla: 'som mult; den andra faktorn ≥ 3 uppfylls av tvåsiffrig multiplikator (ental ≥ 3 för två delprodukter)',
      namn: { 1:'Tvåsiffrigt · tvåsiffrigt', 2:'Tresiffrigt · tvåsiffrigt', 3:'Decimaltal · tvåsiffrigt', 4:'Tusental · tvåsiffrigt' },
      omgang: 5,
      nivaer: {
        1: { faktorStor:{min:35,max:99}, faktorLiten:{min:12,max:99}, struktur:'båda faktorernas ental ≥ 3 (drillens krav)' },
        2: { arv:1, faktorStor:{min:335,max:999} },
        3: { arv:2, decimaler:{min:1,max:1}, stegvis:{ litenDecimaler:1, fran:3 } },   // DECIMALTAL som nivå 3: stora faktorn EN decimal (som den gamla drillen — två + lilla faktorns en gav tre decimaler i svaret); lilla faktorn decimal först från tredje uppgiften (stegvis, som förr)
        4: { arv:1, blandning:{ perOmgang:'alla', profiler:[ { faktorStor:{min:1235,max:4999} }, { faktorStor:{min:5000,max:9999} } ] } }   // TUSENTAL som nivå 4
      }
    },
    div: {   // kort OCH lång division (div-metoder:kort / lang) delar band
      kalla: 'Joachim 2026-09-19: täljaren > 54, nämnaren ≥ 3; nivå 2 täljare > 334; nivå 3 blandat > 534 / > 1234',
      namn: { 1:'Täljare upp till 334', 2:'Tresiffrig täljare', 3:'Täljare i tusental' },
      omgang: 5, omgangLang: 4,
      nivaer: {
        1: { taljare:{min:55,max:334}, namnare:{min:3,max:9}, resultat:{ kvot:'heltal' }, struktur:'ingen regel om första siffran (togs bort 2026-09-19: 312/4 med tvåsiffrig kvot är just det eleven ska förstå; layouten hoppar över första kvotcellen)' },
        2: { arv:1, taljare:{min:335,max:999}, minnessiffra:true, struktur:'minst en minnessiffra/rest att bära vidare (drillens krav, ärvs av nivå 3)' },
        3: { arv:2, blandning:{ perOmgang:'alla', profiler:[ { taljare:{min:1235,max:4999} }, { taljare:{min:5000,max:9999} } ] } }   // tusental genomgående (J.B. 2026-09-19): >534-profilen gav nivå 2-tal när storleken bärs av EN operand
      }
    },
    'oka-minska': {   // sub-metoder:okaminska — öka och minska lika: båda termerna flyttas lika mycket så att SUBTRAHENDEN blir ett runt tal
      // FLYTTSIFFRA = siffran i den position som flyttas upp: entalet för heltal, tiondelen för tiondelar, hundradelen för hundradelar.
      // Subtrahendens flyttsiffra ≥ min gör flytten liten (52 − 38 → 54 − 40; 52 − 31 lönar sig inte). vaxling:true är ett
      // villkor MELLAN operanderna: minuendens flyttsiffra < subtrahendens — växling krävs (99 − 67 går rakt fram, 48 − 38 är
      // redan klar). Hundradelar: flytten går till NÄSTA TIONDEL (15,02 → 15,10 är fullgott; 9,91 → 10 var ett exempel, inte regeln).
      kalla: 'Joachim 2026-09-20: subtrahenden ≥ 16 med ental ≥ 6, växling krävs; profil 16–19 så de små syns; nivå 2 tresiffrigt och tusental (samma svårighet); nivå 3 tiondelar (siffra ≥ 6) och hundradelar (ingen gräns) blandade',
      namn: { 1:'Tvåsiffriga tal', 2:'Tresiffriga tal och tusental', 3:'Decimaltal' },
      omgang: 6,
      nivaer: {
        1: { subtrahend:{min:16,max:89}, minuend:{max:99}, flyttsiffra:{min:6}, vaxling:true, resultat:{ differens:{min:11} },
             blandning:{ perOmgang:'alla', vikter:[1,9], profiler:[ { subtrahend:{min:16,max:19} }, { subtrahend:{min:26,max:89} } ] } },   // 16–19 MINST EN per omgång (perOmgang), inte hälften: vikter styr resten av platserna (1:9 ≈ 0,4 extra)
        2: { arv:1, minuend:{max:9999}, blandning:{ perOmgang:'alla', profiler:[ { subtrahend:{min:116,max:989} }, { subtrahend:{min:1006,max:9989} } ] } },   // tresiffrigt OCH tusental i samma omgång
        3: { arv:1, blandning:{ perOmgang:'alla', profiler:[   // decimaler = ny sorts svårighet → sist; mantissor i heltal, decimaler skalar (16–999 tiondelar = 1,6–99,9)
              { decimaler:{min:1,max:1}, subtrahend:{min:16,max:979},   minuend:{max:999},  resultat:{ differens:{min:21} } },                       // tiondelar: flyttsiffra ≥ 6 ärvs (9,7 ja, 9,2 nej); differens ≥ 2,1 (elva gällde heltal, J.B.)
              { decimaler:{min:2,max:2}, subtrahend:{min:116,max:9789}, minuend:{max:9999}, flyttsiffra:{min:1}, resultat:{ differens:{min:201} } } ] } }   // hundradelar: ingen gräns (flytten till nästa tiondel ≤ 0,09), bara inte 0; differens ≥ 2,01
      }
    },
    bakifran: {   // sub-metoder:bakifran — addition bakifrån: från subtrahenden i hopp uppåt till minuenden (fri stegindelning, order 2026-09-20)
      // Samma flyttsiffra-begrepp som oka-minska. vaxling:true = minuendens flyttsiffra < subtrahendens (går subtraktionen rakt
      // fram behövs ingen metod) — medför olika. forstaSteg.min = första hoppet (upp till nästa runda tal) minst så stort:
      // 2490 − 449 med +1 är trivialt. Med fri stegindelning delar eleven själv upp resten; talen bär inget villkor på det
      // (inget tak på resten, J.B.: styrs minuenden nära ett hundratal tränas inte de mellanliggande hoppen). Minuenden får inte
      // sluta på 0 (75,0 − 30,4 ser ut som ett fel, 70 − 52 bär inte metoden) → minuend.flyttsiffra ≥ 1, som kräver subtrahendens ≥ 2.
      kalla: 'Joachim 2026-09-20: växling krävs, första steget ≥ 3, minuenden slutar inte på 0, inget tak på resten; nivåer som oka-minska; nivå 3 tiondelar och hundradelar med differens ≥ 2 hela enheter',
      namn: { 1:'Tvåsiffriga tal', 2:'Tresiffriga tal och tusental', 3:'Decimaltal' },
      omgang: 5,
      nivaer: {
        1: { subtrahend:{min:16,max:89}, minuend:{max:99, flyttsiffra:{min:1}}, flyttsiffra:{min:2}, vaxling:true, forstaSteg:{min:3}, resultat:{ differens:{min:11} } },
        2: { arv:1, minuend:{max:9999, flyttsiffra:{min:1}}, blandning:{ perOmgang:'alla', profiler:[ { subtrahend:{min:116,max:989} }, { subtrahend:{min:1006,max:9989} } ] } },
        3: { arv:1, blandning:{ perOmgang:'alla', profiler:[
              { decimaler:{min:1,max:1}, subtrahend:{min:16,max:979},   minuend:{max:999, flyttsiffra:{min:1}},  resultat:{ differens:{min:21} } },     // tiondelar: första hoppet ≥ 0,3, differens ≥ 2,1 (1,9 är knappt ett hopp, J.B.)
              { decimaler:{min:2,max:2}, subtrahend:{min:116,max:9789}, minuend:{max:9999, flyttsiffra:{min:1}}, resultat:{ differens:{min:201} } } ] } }   // hundradelar: första hoppet ≥ 0,03 (nästa tiondel), differens ≥ 2,01 (samma regel)
      }
    }
  };

  // Löser upp arv + profil till ETT platt villkor: uppstBand('add', 3, 1) = nivå 3, profil 1.
  function uppstBand(rakne, niva, profilIx){
    var r = UPPST_BAND[rakne]; if(!r) return null;
    var v = r.nivaer[niva]; if(!v) return null;
    var ut = {}, bl = null;
    function lagg(o){ if(o.blandning) bl = o.blandning; Object.keys(o).forEach(function(k){ if(k === 'arv' || k === 'blandning') return; ut[k] = o[k]; }); }   // blandningen ärvs (nivå 4 ärver nivå 3:s profiler)
    (function arv(n, djup){ var x = r.nivaer[n]; if(!x || djup > 5) return; if(x.arv) arv(x.arv, djup + 1); lagg(x); })(niva, 0);   // arv följs rekursivt (3 → 2 → 1)
    if(bl && profilIx != null && bl.profiler[profilIx]) lagg(bl.profiler[profilIx]);
    ut.decimaler = ut.decimaler || null;   // nivå 4: {min,max} — heltalsbandet skalas med 10^dec
    ut.profiler = bl ? bl.profiler.length : 1;
    ut.perOmgang = bl ? bl.perOmgang : null;
    ut.vikter = bl && bl.vikter ? bl.vikter : null;   // relativ vikt per profil för platserna efter täckningen (utelämnad = lika)
    ut.maxNiva = Object.keys(r.nivaer).length;
    return ut;
  }

  var API = { VILLKOR: VILLKOR, UPPST_BAND: UPPST_BAND, uppstBand: uppstBand,
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
