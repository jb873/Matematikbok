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
// NIVÅ 2 extra: hundradelar i enklaste form (nämnare 100, exakta decimaler)
var TERM2_HUNDRA = [
  [1,100,'0,01'], [3,100,'0,03'], [7,100,'0,07'], [9,100,'0,09'],
  [11,100,'0,11'], [13,100,'0,13'], [17,100,'0,17'], [19,100,'0,19'],
  [21,100,'0,21'], [23,100,'0,23'], [27,100,'0,27'], [29,100,'0,29']
];
var TERM2 = TERM1.concat(TERM2_HUNDRA);

// Plocka k unika element ur en lista (utan återläggning)
function gSample(arr, k){
  var kopia = arr.slice();
  for(var i = kopia.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = kopia[i]; kopia[i] = kopia[j]; kopia[j] = t; }
  return kopia.slice(0, k);
}

var BTFORM_HINT = '<strong>Tänk på:</strong> skriv decimaltal med <strong>komma</strong> (t.ex. 0,75) '
  + 'och bråk i <strong>enklaste form</strong> (t.ex. 0,5 = 1/2).';
var BTFORM_HINT2 = BTFORM_HINT + ' På den här nivån finns även <strong>hundradelar</strong> – dem skriver du med nämnaren 100 (t.ex. 0,07 = 7/100).';

// Bygg ett blad ur poolerna för given nivå
function bladBTform(niva, forsta){
  var pool = niva === 2 ? TERM2 : TERM1;
  var bd, db;
  if(forsta){
    if(niva === 1){
      bd = [[1,2,'0,5'],[3,4,'0,75'],[2,5,'0,4'],[7,10,'0,7']];
      db = [[1,2,'0,5'],[1,4,'0,25'],[4,5,'0,8'],[3,5,'0,6'],[1,5,'0,2'],[3,10,'0,3']];
    } else {
      bd = [[1,4,'0,25'],[3,4,'0,75'],[9,10,'0,9'],[7,100,'0,07']];
      db = [[1,2,'0,5'],[3,100,'0,03'],[1,5,'0,2'],[9,100,'0,09'],[3,10,'0,3'],[13,100,'0,13']];
    }
  } else {
    bd = gSample(pool, 4);
    db = gSample(pool, 6);
  }
  return {
    titel: 'Bråk ↔ decimal – nivå ' + niva + (forsta ? '' : ' (nytt blad)'),
    intro: niva === 2
      ? 'Nu även hundradelar. Skriv bråken som decimaltal och decimaltalen som bråk i enklaste form.'
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
var HUNDRA_DEC1 = [ [1,10,'0,1'], [3,10,'0,3'], [7,10,'0,7'], [9,10,'0,9'] ];
var HUNDRA_DEC2 = [
  [3,100,'0,03'], [7,100,'0,07'], [9,100,'0,09'], [11,100,'0,11'],
  [13,100,'0,13'], [17,100,'0,17'], [19,100,'0,19'], [21,100,'0,21'],
  [23,100,'0,23'], [27,100,'0,27'], [29,100,'0,29'], [31,100,'0,31']
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
      dset = [ [7,10,'0,7'], [3,10,'0,3'], [9,10,'0,9'], [1,10,'0,1'] ];
      fset = [ [3,4], [1,2], [1,5], [3,10] ];
    } else {
      dset = [ [7,100,'0,07'], [3,10,'0,3'], [13,100,'0,13'], [9,10,'0,9'] ];
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
var TEST_HINT2 = TEST_HINT + ' På nivå 2 finns även hundradelar.';

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
      t1 = [[1,4,'0,25'], [9,10,'0,9'], [7,100,'0,07']];
      t2 = [[3,5,'0,6'], [3,100,'0,03'], [9,100,'0,09']];
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

// ── Ett hopslaget ÖVA-dokument: bråk↔decimal + tiondelar/hundradelar i ETT blad ──
// Återanvänder bladBTform + bladHundra byte-identiskt (grupperna slås ihop till två
// ämnes-sektioner). Inga nivåer/nivå-etikett – ett dokument. "Nytt blad" ger mängdträning.
function bladOva(forsta){
  var b1 = bladBTform(1, forsta);   // bråk ↔ decimal
  var b2 = bladHundra(1, forsta);   // tiondelar & hundradelar
  return {
    titel: 'Bråkform och decimalform',
    intro: 'Växla mellan bråkform och decimalform. Tiondelar och hundradelar är bryggan mellan formerna. Skriv decimaltal med komma och bråk i enklaste form.',
    hint: b2.hint,
    keypadOps: [','],
    grupper: [].concat(b1.grupper, b2.grupper)
  };
}
function GRUND_OVA(){ return bladOva(true); }
function GEN_OVA(){ return bladOva(false); }

var GENERATORER = {
  ova:    { grund: GRUND_OVA, gen: GEN_OVA },   // hopslaget Öva-dokument (utan nivå-toggle)
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
