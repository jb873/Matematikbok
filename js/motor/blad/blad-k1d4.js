/* ============================================================
   FAMILJ A · INNEHÅLL k1-d4 (Bråkform och decimalform)
   Talpooler + generatorer + GENERATORER + FORELASNINGAR.
   Utbrutet intakt. Kräver blad-karna.js laddad först.
   ============================================================ */

// ── Talpooler (delkapitel 4: enkla, exakta bråk ↔ decimal) ──
// NIVÅ 1: halva, fjärdedel, femtedel, tiondel – [täljare, nämnare, decimalsträng]
var TERM1 = [
  [1,2,'0,5'], [1,4,'0,25'], [3,4,'0,75'],
  [1,5,'0,2'], [2,5,'0,4'], [3,5,'0,6'], [4,5,'0,8'],
  [1,10,'0,1'], [3,10,'0,3'], [7,10,'0,7'], [9,10,'0,9']
];
// NIVÅ 2 extra: åttondelar (exakta decimaler, meningsfull form-växling – 1/8 = 0,125).
// (Ugly hundradelar som 29/100 = 0,29 togs bort – de är redan i enklaste form och ger
//  ingen förkortning; hundradels-arbetet ligger i Tiondelar & hundradelar-bladet.)
var TERM2_ATTONDEL = [
  [1,8,'0,125'], [3,8,'0,375'], [5,8,'0,625'], [7,8,'0,875']
];
var TERM2 = TERM1.concat(TERM2_ATTONDEL);

// Plocka k unika element ur en lista (utan återläggning)
function gSample(arr, k){
  var kopia = arr.slice();
  for(var i = kopia.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = kopia[i]; kopia[i] = kopia[j]; kopia[j] = t; }
  return kopia.slice(0, k);
}

var BTFORM_HINT = '<strong>Tänk på:</strong> skriv decimaltal med <strong>komma</strong> (t.ex. 0,75) '
  + 'och bråk i <strong>enklaste form</strong> (t.ex. 0,5 = 1/2).';
var BTFORM_HINT2 = BTFORM_HINT + ' Här finns även <strong>åttondelar</strong> – t.ex. 1/8 = 0,125 och 3/8 = 0,375.';

// Bygg ett blad ur poolerna för given nivå
function bladBTform(niva, forsta){
  var pool = niva === 2 ? TERM2 : TERM1;
  var bd, db;
  if(forsta){
    if(niva === 1){
      bd = [[1,2,'0,5'],[3,4,'0,75'],[2,5,'0,4'],[7,10,'0,7']];
      db = [[1,2,'0,5'],[1,4,'0,25'],[4,5,'0,8'],[3,5,'0,6'],[1,5,'0,2'],[3,10,'0,3']];
    } else {
      bd = [[1,8,'0,125'],[3,4,'0,75'],[5,8,'0,625'],[9,10,'0,9']];
      db = [[1,2,'0,5'],[7,8,'0,875'],[1,5,'0,2'],[3,8,'0,375'],[3,10,'0,3'],[1,4,'0,25']];
    }
  } else {
    bd = gSample(pool, 4);
    db = gSample(pool, 6);
  }
  return {
    titel: 'Bråk ↔ decimal – nivå ' + niva + (forsta ? '' : ' (nytt blad)'),
    intro: niva === 2
      ? 'Nu även åttondelar. Skriv bråken som decimaltal och decimaltalen som bråk i enklaste form.'
      : 'Skriv bråken som decimaltal och decimaltalen som bråk i enklaste form.',
    hint: niva === 2 ? BTFORM_HINT2 : BTFORM_HINT,
    keypadOps: [','],
    grupper: [
      {rubrik:'Skriv bråket som decimaltal', rader:
        bd.map(function(p){ return radBrakDec(p[0], p[1], avr(p[0]/p[1], 6)); })},
      {rubrik:'Skriv som bråk i enklaste form', rader:
        db.map(function(p){ return radDecBrak(p[0], p[1], p[2]); })}
    ]
  };
}
function GRUND_BTFORM_N1(){ return bladBTform(1, true); }
function GEN_BTFORM_N1(){ return bladBTform(1, false); }
function GRUND_BTFORM_N2(){ return bladBTform(2, true); }
function GEN_BTFORM_N2(){ return bladBTform(2, false); }

// ============================================================
//  DEL 2 · TIONDELAR & HUNDRADELAR  (bryggan mellan formerna)
// ============================================================
// Decimaltal som skrivs i bråkform (tiondelar/hundradelar, redan i enklaste form)
var HUNDRA_DEC1 = [ [1,2,'0,5'], [1,5,'0,2'], [3,10,'0,3'], [2,5,'0,4'], [7,10,'0,7'], [4,5,'0,8'] ];
// Hundradelar som FÖRKORTAS (0,05 = 5/100 = 1/20) – kräver tanke, till skillnad från t.ex. 29/100.
var HUNDRA_DEC2 = [
  [1,20,'0,05'], [3,20,'0,15'], [7,20,'0,35'], [9,20,'0,45'],
  [1,25,'0,04'], [3,25,'0,12'], [2,25,'0,08'], [4,25,'0,16'], [6,25,'0,24'],
  [3,50,'0,06'], [7,50,'0,14'], [1,4,'0,25']
];
// Bråk som förlängs till hundradelar (nämnaren delar 100)
var FORL1 = [ [1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,10],[3,10],[7,10],[9,10] ];
var FORL2 = FORL1.concat([ [1,20],[3,20],[7,20],[9,20],[1,25],[3,25],[7,25],[1,50],[3,50],[7,50] ]);

// Förläng-rad: given bråk = [__]/100 = [__] decimal (två rättade rutor)
function radForlang(t, n){
  return {typ:'brakForlang', taljare:t, namnare:n, hundra: t * 100 / n, decSvar: avr(t / n, 6)};
}

var HUNDRA_HINT = '<strong>Tänk på:</strong> en tiondel skrivs med nämnaren <strong>10</strong> och en hundradel med nämnaren <strong>100</strong> (0,7 = 7/10, 0,25 = 25/100). '
  + 'När du förlänger ett bråk till hundradelar kan du läsa av decimaltalet direkt: 3/4 = 75/100 = 0,75.';
var HUNDRA_HINT2 = HUNDRA_HINT + ' På den här nivån finns även bråk vars nämnare är 20, 25 eller 50 – förläng dem till hundradelar.';

function bladHundra(niva, forsta){
  var decPool  = niva === 2 ? HUNDRA_DEC1.concat(HUNDRA_DEC2) : HUNDRA_DEC1;
  var forlPool = niva === 2 ? FORL2 : FORL1;
  var dset, fset;
  if(forsta){
    if(niva === 1){
      dset = [ [1,2,'0,5'], [3,10,'0,3'], [2,5,'0,4'], [7,10,'0,7'] ];
      fset = [ [3,4], [1,2], [1,5], [3,10] ];
    } else {
      dset = [ [1,20,'0,05'], [3,10,'0,3'], [3,25,'0,12'], [9,20,'0,45'] ];
      fset = [ [3,4], [1,20], [3,25], [7,10] ];
    }
  } else {
    dset = gSample(decPool, 4);
    fset = gSample(forlPool, 4);
  }
  return {
    titel: 'Tiondelar och hundradelar – nivå ' + niva + (forsta ? '' : ' (nytt blad)'),
    intro: niva === 2
      ? 'Använd tiondelar och hundradelar som brygga mellan bråkform och decimalform.'
      : 'Använd tiondelar som brygga mellan bråkform och decimalform.',
    hint: niva === 2 ? HUNDRA_HINT2 : HUNDRA_HINT,
    keypadOps: [','],
    grupper: [
      {rubrik:'Skriv decimaltalet i bråkform', rader:
        dset.map(function(p){ return radDecBrak(p[0], p[1], p[2]); })},
      {rubrik:'Förläng till hundradelar och skriv som decimaltal', rader:
        fset.map(function(p){ return radForlang(p[0], p[1]); })}
    ]
  };
}
function GRUND_HUNDRA_N1(){ return bladHundra(1, true); }
function GEN_HUNDRA_N1(){ return bladHundra(1, false); }
function GRUND_HUNDRA_N2(){ return bladHundra(2, true); }
function GEN_HUNDRA_N2(){ return bladHundra(2, false); }

// ============================================================
//  DEL 3 · TEST – VISA VAD DU KAN  (samlingstest för delkapitlet)
// ============================================================
var TEST_HINT  = '<strong>Testet:</strong> visa att du klarar hela delkapitlet. '
  + 'Skriv decimaltal med komma och bråk i <strong>enklaste form</strong>.';
var TEST_HINT2 = TEST_HINT + ' På nivå 2 finns även åttondelar och hundradelar som förkortas.';

function bladTest(niva, forsta){
  var poolBD = niva === 2 ? TERM2 : TERM1;
  var poolF  = niva === 2 ? FORL2 : FORL1;
  var t1, t2, t3;
  if(forsta){
    if(niva === 1){
      t1 = [[1,2,'0,5'], [3,4,'0,75'], [7,10,'0,7']];
      t2 = [[1,4,'0,25'], [2,5,'0,4'], [3,10,'0,3']];
      t3 = [[3,4], [1,5], [1,2]];
    } else {
      t1 = [[1,8,'0,125'], [9,10,'0,9'], [5,8,'0,625']];
      t2 = [[3,5,'0,6'], [1,20,'0,05'], [3,25,'0,12']];
      t3 = [[3,4], [1,20], [3,25]];
    }
  } else {
    var bd = gSample(poolBD, 6);
    t1 = bd.slice(0, 3);
    t2 = bd.slice(3, 6);
    t3 = gSample(poolF, 3);
  }
  return {
    titel: 'Visa vad du kan – nivå ' + niva + (forsta ? '' : ' (nytt blad)'),
    intro: 'Ett samlingstest för hela delkapitlet. Tre områden.',
    hint: niva === 2 ? TEST_HINT2 : TEST_HINT,
    keypadOps: [','],
    isTest: true,
    grupper: [
      {rubrik:'Skriv bråket som decimaltal',
       rader: t1.map(function(p){ return radBrakDec(p[0], p[1], avr(p[0]/p[1], 6)); })},
      {rubrik:'Skriv decimaltalet som bråk i enklaste form',
       rader: t2.map(function(p){ return radDecBrak(p[0], p[1], p[2]); })},
      {rubrik:'Förläng till hundradelar och skriv som decimaltal',
       rader: t3.map(function(p){ return radForlang(p[0], p[1]); })}
    ]
  };
}
function GRUND_TEST_N1(){ return bladTest(1, true); }
function GEN_TEST_N1(){ return bladTest(1, false); }
function GRUND_TEST_N2(){ return bladTest(2, true); }
function GEN_TEST_N2(){ return bladTest(2, false); }

// ── ÖVA: två blad (per ämne), utan nivå-toggle men med HELA innehållet (nivå-2-poolen
//    innehåller både enkla tal och de svåra: hundradelar, förlängning av 20/25/50).
//    Återanvänder bladBTform/bladHundra byte-identiskt; sätter bara ren titel. ──
// Slå ihop enkla (nivå 1) och svåra (nivå 2) grupper per rubrik, utan dubbletter, så
// varje blad garanterat innehåller BÅDE enkla tal OCH de svåra som låg på den låsta nivån.
function bdMergeGrupper(g1, g2){
  var out = [];
  function grupp(rubrik){ var ex = out.filter(function(x){ return x.rubrik === rubrik; })[0]; if(!ex){ ex = { rubrik: rubrik, rader: [], _seen: {} }; out.push(ex); } return ex; }
  function add(g){ var ex = grupp(g.rubrik); g.rader.forEach(function(r){ var k = JSON.stringify(r); if(!ex._seen[k]){ ex._seen[k] = 1; ex.rader.push(r); } }); }
  g1.forEach(add); g2.forEach(add);
  out.forEach(function(g){ delete g._seen; });
  return out;
}
function bladBrakDec(forsta){
  var b1 = bladBTform(1, forsta), b2 = bladBTform(2, forsta);
  return {
    titel: 'Bråk ↔ decimal',
    intro: 'Skriv bråket som decimaltal och decimaltalet som bråk i enklaste form. Här finns både enkla tal och svårare med hundradelar.',
    hint: BTFORM_HINT + ' Här finns även <strong>hundradelar</strong> – dem skriver du med nämnaren 100 (t.ex. 0,07 = 7/100).',
    keypadOps: [','],
    grupper: bdMergeGrupper(b1.grupper, b2.grupper)
  };
}
function bladTionHundra(forsta){
  var b1 = bladHundra(1, forsta), b2 = bladHundra(2, forsta);
  return {
    titel: 'Tiondelar & hundradelar',
    intro: 'Tiondelar och hundradelar är bryggan mellan formerna. Här finns både enkla tal och svårare – förläng bråket till hundradelar och läs av decimaltalet.',
    hint: HUNDRA_HINT + ' Här finns även bråk vars nämnare är 20, 25 eller 50 – förläng dem till hundradelar.',
    keypadOps: [','],
    grupper: bdMergeGrupper(b1.grupper, b2.grupper)
  };
}

var GENERATORER = {
  brakdec:    { grund: function(){ return bladBrakDec(true); },    gen: function(){ return bladBrakDec(false); } },
  tionhundra: { grund: function(){ return bladTionHundra(true); }, gen: function(){ return bladTionHundra(false); } },
  btform: { nivaer: { 1: { grund: GRUND_BTFORM_N1, gen: GEN_BTFORM_N1 },
                      2: { grund: GRUND_BTFORM_N2, gen: GEN_BTFORM_N2 } } },
  hundra: { nivaer: { 1: { grund: GRUND_HUNDRA_N1, gen: GEN_HUNDRA_N1 },
                      2: { grund: GRUND_HUNDRA_N2, gen: GEN_HUNDRA_N2 } } },
  test:   { nivaer: { 1: { grund: GRUND_TEST_N1,   gen: GEN_TEST_N1 },
                      2: { grund: GRUND_TEST_N2,   gen: GEN_TEST_N2 } } }
};

// Lägg till filmer här, t.ex.: {id:'YOUTUBE_ID', titel:'Bråkform och decimalform', tag:'Föreläsning'}
var FORELASNINGAR = [
];
