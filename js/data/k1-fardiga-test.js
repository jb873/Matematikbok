/* k1-fardiga-test.js — FÄRDIGA delkapitel-test för åk7 kapitel 1 (taluppfattning).
   Samma mekanism som ak8-fardiga-test.js: coverage-komplett split (typ-antal-drivet) över
   delkapitlets byggbara noder; ramen bygger via PB.byggFardigt (coverage-seedning + färdigt-läge).
   Byggbara noder = k1:s GEN_NOD-målnoder (ak7-k1-ram.html), belief (primtal:problem/position:resonera)
   exkluderade. Delkapitel→nod via taxonomins visning.utbudslista (d1–d8). GDPR: ren data + DOM, inget nät. */
(function(){
  'use strict';

  // Byggbara noder — spegel av GEN_NOD-värdena i ak7-k1-ram.html (HÅLL I SYNK om generatorer läggs till).
  // Belief exkluderad (primtal:problem = gata/problem, position:resonera = jamfor-tal → självskattningen).
  var BYGGBARA = {};
  ['primtal:begrepp','primtal:rakna','primtal:kommunikation','delbarhet:rakna','delbarhet:begrepp',
   'siffror:begrepp','position:begrepp','position:rakna','utvecklad:metod','utvecklad:rakna','rakneträning:rakna',
   'add-begrepp:begrepp','add-rakna:rakna','add-metoder:uppstallning','sub-begrepp:begrepp','sub-rakna:rakna',
   'sub-metoder:uppstallning','mult-begrepp:begrepp','mult-tabell:rakna','mult-metoder:uppstallning',
   'div-begrepp:begrepp','div-tabell:rakna','div-metoder:kort','prio-samband:rakna','prio-prioritering:rakna',
   'prio-lagar:kommutativa','prio-lagar:associativa','prio-lagar:distributiva','neg-begrepp:begrepp',
   'neg-rakna:addsub','neg-rakna:multdiv','bd-vaxla:rakna','bd-tillbrak:rakna','bd-hundra:rakna','bd-forlang:rakna',
   'mult-rakna:pow10','div-rakna:pow10','mult-rakna:stora','div-rakna:stora'
   // avr-avrundning:begrepp + avr-overslag:rakna BORTTAGNA (spec-kontroll FAS 2.D): öva-bladet (d8)
   // är BLAD_TOM ("byggs snart") → inget härledbart tak → nod-kan ej testas säkert. Åter in när bladet finns.
  ].forEach(function(n){ BYGGBARA[n] = 1; });

  // Antal test-TYPER (snabb-generatorer) per nod — spegel av GEN_NOD. Styr coverage-splitten. Default 1.
  var TYP_PER_NOD = { 'primtal:rakna':2, 'sub-rakna:rakna':2,
    // sjuan-sweep tillägg:
    'add-rakna:rakna':4, 'neg-rakna:addsub':3, 'neg-begrepp:begrepp':2, 'position:rakna':3,
    'mult-rakna:stora':2, 'div-rakna:stora':2 };
  function typCount(n){ return TYP_PER_NOD[n] || 1; }

  // NIANS dk1 (Åk 9-spåret): explicit nod-scope. Öva 1–3:s ak9-noder spänner flera delkapitel
  // (d2/d5/d6) → ingen enskild utbudslista fångar dem, så listan anges direkt. KonceptTÄCKER öva-
  // bladen med ramens testbara noder: decimal-mult/div testas via mult-sma-dec/div-sma-dec, som i
  // ramens GEN_NOD mappar till :stora-noderna (öva/ak9 loggar samma koncept till :sma/:storasma —
  // ramen är kronjuvel/orörd, så testet loggar decimaler till :stora; båda noderna färgas, ingen
  // evidens tappas). Ren additiv gren — d1–d8 orörda, åk7/åk8-testen byte-identiska.
  // Nians noder mappar mot vad Öva 1–3 faktiskt tränar: Öva 1 tiopotens (pow10), Öva 2 decimal ×/÷
  // (sma/div:sma), stora + stora-och-små (stora/storasma), Öva 3 prioritering. div-rakna:stora UT
  // (ingen öva-motsvarighet — Öva 2:s division är decimal via förlängning, inte "division med stora tal").
  var AK9_DK1_NODER = ['mult-rakna:pow10', 'div-rakna:pow10', 'mult-rakna:sma', 'div-rakna:sma', 'mult-rakna:stora', 'mult-rakna:storasma', 'prio-prioritering:rakna'];
  // Feature-set per nod (nivå-parameter). Skickas som cfg.varianter → generatorns makeItem(features).
  // Talområde = första axeln; fler axlar (struktur) läggs till per färdighet efter hand. Noder utan
  // entry → ingen feature → generatorns default. Författad tabell, fylls på per generator.
  var AK9_DK1_VARIANTER = {
    'mult-rakna:pow10': { talomrade: 'nian' },   // decimaloperander + decimala tiopotenser (öva 1)
    'div-rakna:pow10':  { talomrade: 'nian' },
    'mult-rakna:stora': { talomrade: 'nian' },
    'mult-rakna:storasma': { talomrade: 'nian' },   // kompensations-mellanled
    'div-rakna:sma': { talomrade: 'nian' },          // förlängnings-mellanled
    'prio-prioritering:rakna': { struktur: ['parenteser','koefficient','brakstreck'], nivaer: [1,2,3] }  // nivåer = öva 3:s tre grupper (spridning)
  };

  // ── TRÄNINGEN → TESTET (order 2026-10-08) ──────────────────────────────────────────────────────
  // Testet SPEGLAR öva-bladen: (1) varje uppgiftstyp i träningen finns med i något test, (2) testets
  // uppgifter står i träningens ordning (bladens följd, grupp för grupp — redan lätt → svårt), ingen slump.
  // Varje öva-blad listas med ALLA sina grupper i bladets ordning: [rubrik, generator(er)] — eller
  // [rubrik, null, 'skäl'] när ingen testgenerator finns (LUCKA, syns i vakten) / 'TOM' för platshållare.
  // `test` = vilket kort test bladet hamnar i (angränsande blad kan dela test); `testFran: { N: 'titel' }` =
  // från bladets grupp N börjar ett nytt test (delar ett långt blad, ordningen bevaras). En generator tas med där
  // den FÖRST förekommer. Vakt: node verktyg/test-tacker-ova.js — läser de riktiga bladen; en grupp som
  // läggs till/flyttas i öva utan att listan följer med fäller vakten.
  // d1: varje stencil (A/B) är ett eget blad i registret (TIO_/STORLEK_/POSRAK_/EGEN_VARIANTER).
  var TRANING = {
    d1: [
      { blad: 'Tiosystemet – Blad A', test: 'Tiosystemet – del 1', testFran: { 5: 'Tiosystemet – del 2' }, grupper: [
        ['Vilket platsvärde har sjuan i talet?', 'platsvarde'],
        ['Skriv det tal som består av', 'utvform-lasut'],
        ['Använd siffrorna 4, 5, 6 och 7 och skriv', 'pos-siffror'],
        ['Skriv följande tal med siffror', 'tal-ord'],
        ['Skriv i utvecklad form', 'utvform-valj'],
        ['Vilket platsvärde har trean?', 'platsvarde'],
        ['Skriv det tal som består av', 'utvform-lasut'],
        ['Vilket platsvärde har trean i talet?', 'platsvarde'],
        ['Skriv som tal', 'vaxla-till-tal'],
        ['Vilket tal ska stå i rutan?', 'vaxla-antal'],
        ['Skriv i utvecklad form', 'utvform-valj'] ] },
      { blad: 'Tiosystemet – Blad B', test: 'Tiosystemet – del 2', grupper: [
        ['Vilket platsvärde har femman i talet?', 'platsvarde'],
        ['Skriv det tal som består av', 'utvform-lasut'],
        ['Använd siffrorna 2, 4, 6 och 7 och skriv', 'pos-siffror'],
        ['Skriv följande tal med siffror', 'tal-ord'],
        ['Skriv i utvecklad form', 'utvform-valj'],
        ['Vilket platsvärde har sexan?', 'platsvarde'],
        ['Skriv det tal som består av', 'utvform-lasut'],
        ['Vilket platsvärde har sexan i talet?', 'platsvarde'],
        ['Skriv som tal', 'vaxla-till-tal'],
        ['Vilket tal ska stå i rutan?', 'vaxla-antal'],
        ['Skriv i utvecklad form', 'utvform-valj'] ] },
      { blad: 'Storlek och ordning – Stencil A', test: 'Storlek och ordning', grupper: [
        ['Gör tre 10-hopp framåt för varje tal', 'talfoljd'],
        ['Gör tre 10-hopp bakåt för varje tal', 'talfoljd'],
        ['Vilka tal pekar pilarna på?', null, 'tallinje: avläsa tal vid pilar'],
        ['Skriv det tal som är en tiondel större än', 'oka-minska'],
        ['Gör tre 0,4-hopp framåt för varje tal', 'talfoljd'],
        ['Vilka tal pekar pilarna på?', null, 'tallinje: avläsa tal vid pilar'],
        ['Gör tre 0,4-hopp bakåt för varje tal', 'talfoljd'],
        ['Skriv de två talen som kommer i talföljden', 'talfoljd'],
        ['Skriv talen i storleksordning, börja med det minsta', 'jamfor-tal'] ] },
      { blad: 'Storlek och ordning – Stencil B', test: 'Storlek och ordning', grupper: [
        ['Skriv talen i storleksordning, börja med det minsta', 'jamfor-tal'],
        ['Vilket tal är en hundradel mindre än', 'oka-minska'],
        ['Ordna talen i storleksordning, börja med det minsta', 'jamfor-tal'],
        ['Vilket tal är en tusendel mindre än', 'oka-minska'],
        ['Vilka tal pekar pilarna på?', null, 'tallinje: avläsa tal vid pilar'],
        ['Ordna talen i storleksordning, börja med det minsta', 'jamfor-tal'],
        ['Skriv ett tal som är', 'pos-intervall'] ] },
      { blad: 'Räkna i positionssystemet – Blad A', test: 'Räkna i positionssystemet', grupper: [
        ['Skriv två tal inom varje intervall', 'pos-intervall'],
        ['Räkna med huvudräkning', 'add-huvud'],
        ['Räkna med huvudräkning', 'oka-minska'],
        ['Vilket tal ska stå i rutan?', 'sub-begr-r'],
        ['Räkna med huvudräkning', 'oka-minska'],
        ['Vilket tal är 7 tiondelar större än …', 'oka-minska'],
        ['Vilket tal ska stå i rutan?', 'sub-begr-r'],
        ['Vilket tal ligger mittemellan …', 'mittemellan'],
        ['Räkna med huvudräkning', 'oka-minska'],
        ['Räkna med huvudräkning', 'add-huvud'],
        ['Vilket tal ligger mittemellan …', 'mittemellan'] ] },
      { blad: 'Räkna i positionssystemet – Blad B', test: 'Räkna i positionssystemet', grupper: [
        ['Skriv två tal inom varje intervall', 'pos-intervall'],
        ['Räkna med huvudräkning', 'add-huvud'],
        ['Räkna med huvudräkning', 'oka-minska'],
        ['Vilket tal ska stå i rutan?', 'sub-begr-r'],
        ['Räkna med huvudräkning', 'oka-minska'],
        ['Vilket tal är 7 tiondelar större än …', 'oka-minska'],
        ['Vilket tal ska stå i rutan?', 'sub-begr-r'],
        ['Vilket tal ligger mittemellan …', 'mittemellan'],
        ['Räkna med huvudräkning', 'oka-minska'],
        ['Räkna med huvudräkning', 'add-huvud'],
        ['Vilket tal ligger mittemellan …', 'mittemellan'] ] },
      { blad: 'Tals egenskaper – Blad A', test: 'Tals egenskaper – del 1', testFran: { 4: 'Tals egenskaper – del 2' }, grupper: [
        ['Vilka tal är jämna?', 'udda-jamn'],
        ['Vilka tal är sammansatta tal?', 'primtal-binary'],
        ['Vilka tal är jämnt delbara med …', 'delbar-binary'],
        ['Faktorisera talet i två faktorer', 'faktorer'],
        ['Vilka primfaktorer saknas i faktoriseringen?', 'primfakt'],
        ['Vilket tal har faktoriserats?', 'faktor-produkt'],
        ['Vilka tal är jämnt delbara med 4 och 5?', 'delbar-binary'],
        ['Vilka tal är primtal?', 'primtal-binary'],
        ['Vilka tal är jämnt delbara med 3 och 5?', 'delbar-binary'],
        ['Primtalsfaktorisera med faktorträd (skriv som produkt, t.ex. 2·2·3)', 'primfakt'],
        // DIVERGENS ÖVA/TEST (beslut 2026-10-08, medvetet): öva ber om TRE valfria tal delbara med 2, 3, 4 och 5
        // (öppet svar, alla multipler av 60 godtas). Testet (konstruera-delbar) ger i stället ett intervall med
        // EXAKT ETT delbart tal → entydigt facit i befintlig numeric-rättning, ingen ny svarstyp. Prövar samma
        // begrepp (delbarhet ⇔ delbar med minsta gemensamma multipel). Öppen svarstyp kan byggas senare.
        ['Skriv tre tal som är delbara med 2, 3, 4 och 5', 'konstruera-delbar'] ] },
      { blad: 'Tals egenskaper – Blad B', test: 'Tals egenskaper – del 2', grupper: [
        ['Vilka tal är jämna?', 'udda-jamn'],
        ['Vilka tal är sammansatta tal?', 'primtal-binary'],
        ['Vilka tal är jämnt delbara med …', 'delbar-binary'],
        ['Faktorisera talet i två faktorer', 'faktorer'],
        ['Vilka primfaktorer saknas i faktoriseringen?', 'primfakt'],
        ['Vilket tal har faktoriserats?', 'faktor-produkt'],
        ['Vilka tal är jämnt delbara med 4 och 5?', 'delbar-binary'],
        ['Vilka tal är primtal?', 'primtal-binary'],
        ['Vilka tal är jämnt delbara med 3 och 5?', 'delbar-binary'],
        ['Primtalsfaktorisera med faktorträd (skriv som produkt, t.ex. 2·2·3)', 'primfakt'],
        ['Skriv tre tal som är delbara med 2, 3, 4 och 5', 'konstruera-delbar'] ] }
    ],
    d2: [
      { blad: 'Addition', grupper: [
        ['Beräkna', 'add-begr-b'],
        ['Vilka tal?', ['add-term', 'add-tvatal']],
        ['Beräkna med talsorterna var för sig', 'add-uppst'],
        ['Vilket tal saknas?', 'add-begr-r'],
        ['Beräkna med metoden flytta över', 'add-huvud'],
        ['Vilket tal saknas?', 'add-begr-r'],
        ['Beräkna med metoden flytta över', 'add-huvud'] ] },
      { blad: 'Subtraktion', grupper: [
        ['Beräkna med uppställning', 'sub-uppst'],
        ['Beräkna med metoden addition bakifrån', 'sub-huvud'],
        ['Vilket tal saknas?', 'sub-begr-r'],
        ['Beräkna med metoden öka och minska lika', 'sub-huvud'],
        ['Vilket tal saknas?', 'sub-begr-r'] ] },
      { blad: 'Multiplikation', grupper: [
        ['Beräkna med uppställning', 'mult-uppst'],
        ['Beräkna med uppställning', 'mult-uppst'],
        ['Beräkna med talsorterna var för sig', 'mult-rakna-stora'],
        ['Beräkna med dubbla och halvera', 'mult-rakna-stora'] ] },
      { blad: 'Division', test: 'Division och prioriteringsregeln', grupper: [
        ['Kort division', 'div-uppst'],
        ['Kort division', 'div-uppst'],
        ['Kort division', 'div-uppst'],
        ['Beräkna med kort division', 'div-uppst'],
        ['Beräkna med kort division', 'div-uppst'] ] },
      { blad: 'Prioriteringsregeln', test: 'Division och prioriteringsregeln', grupper: [
        ['Beräkna – visa mellanled', 'prio-uttryck'],
        ['Beräkna – visa mellanled', 'prio-uttryck'],
        ['Beräkna – visa mellanled', 'prio-uttryck'] ] },
      { blad: 'Problemlösning – de fyra räknesätten', grupper: [
        ['Blad 1', null, 'lästal (fyra räknesätten) — ingen testgenerator'],
        ['Blad 2', null, 'lästal (fyra räknesätten) — ingen testgenerator'],
        ['Blad 3', null, 'lästal (fyra räknesätten) — ingen testgenerator'],
        ['Blad 4', null, 'lästal (fyra räknesätten) — ingen testgenerator'] ] }
    ],
    d3: [
      { blad: 'Begrepp och förståelse', test: 'Begrepp', grupper: [
        ['Skriv det motsatta talet', 'neg-begr'],
        ['Storleksordna talen från minst till störst', 'neg-ordna'],
        ['Skriv de två tal som saknas i talföljden', 'neg-fallande'],
        ['Storleksordna talen från minst till störst', 'neg-ordna'],
        ['Skriv de två tal som saknas i talföljden', 'neg-fallande'] ] },
      { blad: 'Räkna med negativa tal', test: 'Räkna med negativa tal', grupper: [
        ['Addition', 'neg-addsub'],
        ['Subtraktion', 'neg-addsub'],
        ['Blandat', 'neg-addsub'],
        ['Vilket tal saknas?', 'neg-losut-as'] ] },
      { blad: 'Räkna vidare', test: 'Räkna med negativa tal', grupper: [
        ['Addition med negativa tal', 'neg-dubbel'],
        ['Subtraktion med negativa tal', 'neg-dubbel'],
        ['Blandat med större tal', 'neg-dubbel'],
        ['Vilket tal saknas?', 'neg-losut-as'] ] }
    ],
    d4: [
      { blad: 'Bråk ↔ decimal', grupper: [
        ['Skriv bråket som decimaltal', 'bd-vaxla'],
        ['Skriv som bråk i enklaste form', 'bd-tillbrak'] ] },
      { blad: 'Tiondelar & hundradelar', grupper: [
        ['Skriv decimaltalet i bråkform', 'bd-hundra'],
        ['Förläng till hundradelar och skriv som decimaltal', 'bd-forlang'] ] }
    ],
    d5: [
      { blad: 'Multiplikation med 10, 100 och 1000', test: 'Räkna med 10, 100 och 1000', grupper: [
        ['Beräkna', 'mult-rakna-pow10'],
        ['Beräkna', 'mult-rakna-pow10'],
        ['Beräkna – vilket tal saknas?', 'mult-rakna-pow10'] ] },
      { blad: 'Division med 10, 100 och 1000', test: 'Räkna med 10, 100 och 1000', grupper: [
        ['Beräkna', 'div-rakna-pow10'],
        ['Beräkna', 'div-rakna-pow10'],
        ['Beräkna – vilket tal saknas?', 'div-rakna-pow10'],
        ['Beräkna', 'div-rakna-pow10'] ] }
    ],
    d6: [
      { blad: 'Multiplikation med stora tal', test: 'Multiplikation med stora och små tal', grupper: [
        ['Beräkna', 'mult-rakna-stora'],
        ['Beräkna', 'mult-rakna-stora'],
        ['Beräkna – vilket tal saknas?', 'mult-rakna-stora'] ] },
      { blad: 'Multiplikation med små tal', test: 'Multiplikation med stora och små tal', grupper: [
        ['Beräkna', 'mult-rakna-sma'],
        ['Beräkna', 'mult-sma-dec'],
        ['Beräkna', 'mult-sma-dec'] ] },
      { blad: 'Multiplikation med stora och små tal', test: 'Multiplikation med stora och små tal', grupper: [
        ['Beräkna med mellanled', 'mult-rakna-storasma'],
        ['Beräkna med mellanled', 'mult-rakna-storasma'] ] },
      { blad: 'Problemuppgifter', test: 'Multiplikation med stora och små tal', grupper: [
        ['Lös problemet', null, 'lästal (multiplikation) — ingen testgenerator'] ] }
    ],
    d7: [
      { blad: 'Division med stora tal', test: 'Division med stora och små tal', grupper: [
        ['Beräkna', 'div-rakna-stora'],
        ['Beräkna', 'div-rakna-stora'],
        ['Beräkna', 'div-sma-dec'] ] },
      { blad: 'Division med små tal', test: 'Division med stora och små tal', grupper: [
        ['Beräkna', 'div-sma-dec'],
        ['Beräkna', 'div-sma-dec'],
        ['Beräkna', 'div-sma-dec'],
        ['Beräkna', 'div-sma-dec'] ] },
      { blad: 'Division med små tal – med förlängning', test: 'Division med stora och små tal', grupper: [
        ['Beräkna med förlängning', 'div-rakna-sma'],
        ['Beräkna med förlängning', 'div-rakna-sma'],
        ['Beräkna med förlängning', 'div-rakna-sma'] ] },
      { blad: 'Lästal – division', test: 'Division med stora och små tal', grupper: [
        ['Lös problemet', null, 'lästal (division) — ingen testgenerator'] ] }
    ],
    d8: [
      { blad: 'Avrundning', test: 'Avrundning och överslagsräkning', grupper: [
        ['Avrunda talet', 'avr-rakna'] ] },
      { blad: 'Överslagsräkning', test: 'Avrundning och överslagsräkning', grupper: [
        ['Gör ett överslag', 'avr-overslag'] ] },
      { blad: 'Byggs snart', grupper: [
        ['Kommer snart', null, 'TOM'] ] }
    ]
  };

  // Test ur träningen: generatorer i bladens ordning (första förekomst), grupperade per `test`.
  function testerUrTraning(del){
    var sedda = {}, ut = [], cur = null;
    TRANING[del].forEach(function(b){
      var titel = b.test || b.blad;
      if(!cur || cur.titel !== titel){ cur = { titel: titel, gens: [] }; ut.push(cur); }
      b.grupper.forEach(function(g, gi){
        var nytt = b.testFran && b.testFran[gi + 1];   // delning mitt i ett blad (grupp-nummer, 1-baserat)
        if(nytt && cur.titel !== nytt){ cur = { titel: nytt, gens: [] }; ut.push(cur); }
        [].concat(g[1] || []).forEach(function(namn){ if(!sedda[namn]){ sedda[namn] = 1; cur.gens.push(namn); } });
      });
    });
    return ut.filter(function(t){ return t.gens.length; }).map(function(t){
      return { titel: t.titel, gens: t.gens, nodes: [], antal: Math.min(20, Math.max(10, t.gens.length * 3)) };
    });
  }

  // Byggbara noder i ett delkapitel: taxonomins noder med visning.utbudslista===del ∩ BYGGBARA (taxonomi-ordning).
  function byggbaraNoder(del){
    // Nians noder har EGNA ram-generatorer (decimal-mult/div, storasma) som medvetet INTE ligger i
    // delade BYGGBARA — annars skulle de hamna i åk7:s d6/d7-färdigtest. Därför ingen BYGGBARA-filter här.
    if(del === 'ak9-dk1') return AK9_DK1_NODER.slice();
    var tax = window.K1_TAXONOMI; if(!tax || !tax.noder) return [];
    var ut = [];
    tax.noder.forEach(function(n){
      if(n.visning && n.visning.utbudslista === del && BYGGBARA[n.id] && ut.indexOf(n.id) < 0) ut.push(n.id);
    });
    return ut;
  }

  function antalFor(ns){ var tot = ns.reduce(function(s, n){ return s + typCount(n); }, 0); return Math.min(20, Math.max(10, tot * 3)); }

  // INNEHÅLLS-SPLIT (spec-kontroll FAS 3): ETT test per innehålls-GRUPP (taxonomins visning.grupp),
  // inte TYP_CAP-packning. Färre noder per test, fler test, och testet heter det det gäller ("Multiplikation")
  // i st.f. "Test 1". Testen tillsammans täcker fortfarande hela delkapitlet.
  function gruppAv(id){
    var tax = window.K1_TAXONOMI;
    var n = tax && tax.noder && tax.noder.filter(function(x){ return x.id === id; })[0];
    return (n && n.visning && n.visning.grupp) || 'Övrigt';
  }
  function tester(del){
    if(TRANING[del]) return testerUrTraning(del);   // d1–d8: speglar öva (allt med, träningens ordning)
    var noder = byggbaraNoder(del); if(!noder.length) return [];
    var ordning = [], grupper = {};
    noder.forEach(function(n){ var g = gruppAv(n); if(!grupper[g]){ grupper[g] = []; ordning.push(g); } grupper[g].push(n); });
    var varianter = (del === 'ak9-dk1') ? AK9_DK1_VARIANTER : undefined;
    return ordning.map(function(g){ var ns = grupper[g]; return { titel: g, nodes: ns, antal: antalFor(ns), varianter: varianter }; });
  }

  // Rendera Test-flikens innehåll: färdig-test-knappar (deeplink → ramens ?view=test-fardigt&del=dN&test=M).
  // del = delkapitel-id ('d1'..'d8'). ramPath = relativ sökväg till ak7-k1-ram.html.
  // FAS 4: retur-suffix till test-deeplinken — var eleven ska tillbaka (denna delkapitel-sida) + etikett.
  // Motorns take-back pekar dit i st.f. att gömmas (färdigt test har inga inställningar att gå till).
  function returSuffix(){
    try {
      if(typeof location === 'undefined' || !location.href) return '';
      var titel = (typeof document !== 'undefined' && document.title) ? document.title.split(/[–—·|]/)[0].trim() : '';
      return '&retur=' + encodeURIComponent(location.href) + '&retur_txt=' + encodeURIComponent('← ' + (titel || 'Tillbaka'));
    } catch(e){ return ''; }
  }

  // FAS 3: elevtext — varning när eleven lämnar ett påbörjat prov med minst ett ifyllt svar.
  // Fält-form (varning:) → fångas av elevtext-låset (verktyg/elevtext-grind.js scannar denna fil).
  var FAS3_TEXT = { varning: 'Om du lämnar testet nu försvinner svaren du har fyllt i. Vill du lämna testet?' };

  // Har det inbäddade testet minst ETT ifyllt svar? (same-origin iframe → contentDocument).
  // Kollar test-take-vyns rutor: markerade val (.is-selected) eller ifyllda textrutor ([data-sub-input]).
  function testHarIfyllt(panelEl){
    var f = panelEl && panelEl.querySelector('iframe.test-embed-frame');
    if(!f) return false;
    try {
      var doc = f.contentDocument; if(!doc) return false;
      var body = doc.getElementById('test-take-body') || doc.body; if(!body) return false;
      if(body.querySelector('.is-selected')) return true;
      var ins = body.querySelectorAll('[data-sub-input]');
      for(var i = 0; i < ins.length; i++){ if(ins[i].value && ins[i].value.trim()) return true; }
    } catch(e){}
    return false;
  }

  // FAS 3: bädda IN testet i Test-panelen (som färdighetsträningen) så flikraden ligger kvar.
  // Fast-höjd iframe med INTERN scroll → den fasta keypaden fungerar inuti testet; parent-sidans
  // pinnade topnav + flikrad står kvar ovanför. ramPath öppnas med &embed=1 (ramen döljer eget krom).
  function renderTestFlik(panelEl, del, ramPath){
    if(!panelEl) return;
    ramPath = ramPath || '../../../ak7-k1-ram.html';
    var t = tester(del);
    var retur = returSuffix();   // FAS 4: var eleven ska tillbaka (delkapitel-sidan)

    function stickyHojd(){
      var tn = document.querySelector('.topnav'), tr = document.getElementById('tab-row');
      return (tn ? tn.offsetHeight : 0) + (tr ? tr.offsetHeight : 0);
    }
    function ritaLista(){
      var html = '<div class="test-note" style="text-align:left;"><h3>Test</h3>';
      if(t.length){
        html += '<p style="margin:0 0 18px;">Färdiga test för det här delkapitlet – hopsatta ur momenten. Klicka och kör direkt.'
          + (t.length > 1 ? ' Uppdelat i ' + t.length + ' så att testen tillsammans täcker hela delkapitlet.' : '') + '</p>'
          + '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
        t.forEach(function(test, i){
          var deep = ramPath + '?view=test-fardigt&del=' + del + '&test=' + (i + 1) + '&embed=1' + retur;
          html += '<a href="#" class="test-lank" data-deep="' + encodeURIComponent(deep) + '">' + test.titel + ' <span style="opacity:.7;">· täcker ' + (test.gens || test.nodes).length + ((test.gens || test.nodes).length === 1 ? ' färdighet' : ' färdigheter') + '</span></a>';   // FAS 4a: se ak8-fardiga-test.js
        });
        html += '</div>';
      } else {
        html += '<p>Färdigt test byggs för det här delkapitlet – öva på bladen och färdigheterna så länge.</p>';
      }
      html += '</div>';
      panelEl.innerHTML = html;
      panelEl.querySelectorAll('.test-lank').forEach(function(a){
        a.addEventListener('click', function(e){ e.preventDefault(); oppnaTest(decodeURIComponent(a.getAttribute('data-deep'))); });
      });
    }
    function oppnaTest(src){
      var h = stickyHojd() + 40;
      panelEl.innerHTML = '<div class="test-embed-topp" style="margin:0 0 12px;">'
        + '<button type="button" class="test-tillbaka">← Testlista</button></div>'
        + '<iframe class="test-embed-frame" title="Test" src="' + src + '" '
        + 'style="width:100%;border:0;display:block;background:#fff;border-radius:10px;height:calc(100vh - ' + h + 'px);min-height:440px;"></iframe>';
      panelEl.querySelector('.test-tillbaka').addEventListener('click', function(){
        if(testHarIfyllt(panelEl) && !window.confirm(FAS3_TEXT.varning)) return;   // navigering bort från provet
        ritaLista();
      });
    }
    ritaLista();
  }

  // FAS 3: pinna flikraden (som embed-topnaven) + varna vid flikbyte bort från ett påbörjat prov.
  function initFlikrad(){
    var topnav = document.querySelector('.topnav'), tabRow = document.getElementById('tab-row');
    if(!tabRow) return;
    tabRow.style.position = 'sticky';
    tabRow.style.top = (topnav ? topnav.offsetHeight : 0) + 'px';
    tabRow.style.zIndex = '90';
    var bg = getComputedStyle(tabRow).backgroundColor;
    if(!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') tabRow.style.background = 'var(--paper, #f6f1e8)';
    // Capture → körs FÖRE bladets flik-handler. Lämnar man Test-fliken med ifyllt svar: varna, spara ej.
    tabRow.addEventListener('click', function(e){
      var btn = e.target.closest && e.target.closest('.tab-btn'); if(!btn) return;
      var testPanel = document.querySelector('.tab-panel[data-panel="test"]');
      if(!testPanel || !testPanel.classList.contains('is-active') || btn.dataset.tab === 'test') return;
      if(testHarIfyllt(testPanel) && !window.confirm(FAS3_TEXT.varning)){ e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  // FAS 2: nästa test i delkapitlets lista (samma ordning som renderTestFlik). nr = 1-baserat nummer
  // på testet som just kördes. Returnerar { titel, nr } för nästa, eller null om nr var det SISTA.
  function nastaTest(del, nr){
    var t = tester(del); var i = (nr | 0);   // nästa index (0-baserat) = nr, eftersom current är nr-1
    if(!t.length || i < 1 || i >= t.length) return null;   // sista test (eller okänt) → ingen nästa
    return { titel: t[i].titel, nr: i + 1, antal: t[i].antal };
  }

  window.K1_FARDIGA = { TRANING: TRANING, BYGGBARA: BYGGBARA, byggbaraNoder: byggbaraNoder, tester: tester, nastaTest: nastaTest, renderTestFlik: renderTestFlik };

  // Auto-init på delkapitel-sidor: finns en Test-flik-panel + del-id i URL → rendera Test-knapparna.
  // Ramen (ak7-k1-ram.html) saknar denna panel → hoppas; den wirar färdiga test via boot-deeplinken.
  try {
    if(typeof document !== 'undefined' && document.querySelector){
      var _tp = document.querySelector('.tab-panel[data-panel="test"]');
      var _m = (location.pathname || '').match(/\/(d\d+)-/);
      if(_tp && _m){ renderTestFlik(_tp, _m[1], '../../../ak7-k1-ram.html'); initFlikrad(); }
    }
  } catch(e){}
})();
