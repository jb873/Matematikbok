/* DIFFERENTIELL FUZZ i webbläsaren: gamla och nya sammaTermer sida vid sida.
 *
 * Påståendet som ska beläggas är "identitet för entermiga sidor". Gröna svep visar bara att inget
 * SYNS ha gått sönder; identitet visas genom att köra båda versionerna på samma indata och kräva
 * samma utfall i varje dragning.
 *
 * Indata: entermiga sidor (det gamla antagandet), både RIKTIGA uppställningar och fem sorters
 * trasiga — tappad term, dubblerad term, ändrad koefficient, främmande term, omkastad ordning
 * (som ska godtas, eftersom jämförelsen är sorterad). Dessutom skrivvarianter: mellanslag, · och *.
 */
(function(){
  var A = window.AlgBrak;
  if(!A) return { saknas: true };

  // GAMLA implementationen, ordagrant som den såg ut före ändringen.
  function gammal(uttryck, sidor){
    var a = A.termerAv(uttryck).sort();
    var b = (sidor || []).map(function(x){
      return String(x).replace(/\s+/g, '').replace(/[·*]/g, '').toLowerCase();
    }).sort();
    if(a.length !== b.length) return false;
    for(var i = 0; i < a.length; i++) if(a[i] !== b[i]) return false;
    return true;
  }

  // Deterministisk slump så körningen går att upprepa.
  var fro = 20261004;
  function slump(){ fro = (fro * 1103515245 + 12345) & 0x7fffffff; return fro / 0x7fffffff; }
  function heltal(a, b){ return a + Math.floor(slump() * (b - a + 1)); }
  var VAR = ['x', 'y', 'a', 'b'];

  function entermigSida(){
    var r = slump();
    if(r < 0.25) return String(heltal(1, 30));                       // rent tal
    var k = heltal(1, 20), v = VAR[heltal(0, VAR.length - 1)];
    return (k === 1 ? '' : String(k)) + v;                            // koefficient + variabel
  }

  var N = 32000, olika = 0, exempel = [], raknat = { sant: 0, falskt: 0 };
  for(var i = 0; i < N; i++){
    var n = heltal(3, 6), sidor = [];
    for(var j = 0; j < n; j++) sidor.push(entermigSida());

    var termer = sidor.slice();
    var sort = heltal(0, 6);
    if(sort === 1) termer.splice(heltal(0, termer.length - 1), 1);              // tappad term
    else if(sort === 2) termer.push(termer[heltal(0, termer.length - 1)]);      // dubblerad
    else if(sort === 3){ var p = heltal(0, termer.length - 1);
      termer[p] = termer[p].replace(/^\d*/, String(heltal(1, 20))); }           // ändrad koefficient
    else if(sort === 4) termer.push(entermigSida());                            // främmande term
    else if(sort === 5) termer.reverse();                                       // omkastad ordning
    // sort 0 och 6 = riktig uppställning

    var uttryck = termer.join(' + ');
    if(i % 3 === 1) uttryck = termer.join('+');                                 // utan mellanslag
    if(i % 7 === 2) uttryck = termer.join(' + ').replace(/(\d)([a-z])/g, '$1·$2');  // med ·
    if(i % 11 === 3) uttryck = termer.join(' + ').replace(/(\d)([a-z])/g, '$1*$2');      // med *

    var g = gammal(uttryck, sidor), ny = A.sammaTermer(uttryck, sidor);
    if(g) raknat.sant++; else raknat.falskt++;
    if(g !== ny){
      olika++;
      if(exempel.length < 5) exempel.push({ sidor: sidor.join(' | '), uttryck: uttryck, gammal: g, ny: ny });
    }
  }

  /* NEGATIV VERIFIERING: den gamla strängjämförelsen på L-figurens FLERTERMIGA sidor. Faller den
     är "uppstallningFel" vad gradeOmkrets hade svarat — det är dess enda användning av
     sammaTermer (if(!sammaTermer(...)) return uppstallningFel). */
  var lSidor = ['2a + b', 'a + b', 'a', 'b', 'a + b', 'a + 2b'];
  var lUpp = lSidor.join(' + ');
  var neg = { gammal: gammal(lUpp, lSidor), ny: A.sammaTermer(lUpp, lSidor) };
  var negEndTillEnd = A.gradeOmkrets(lUpp + ' = 6a + 6b', lSidor, '6a + 6b').status;

  return { onerr: window.__onerr || null, dragningar: N, olika: olika, exempel: exempel,
           fordelning: raknat, negativ: neg, gradeOmkretsNu: negEndTillEnd };
})()
