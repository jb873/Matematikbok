/* ekv-rattare.js — BALANSMETODENS KEDJERÄTTARE, delad (order 2026-10-21).

   FLYTTAD ur ekvationer-balans.js (sjuans k3 d4): den beslutande delen av kontrolleraUppg är nu en ren
   funktion, domKedja, som både sjuans och åttans sida anropar. Inget DOM här — sidan läser raderna,
   rättaren dömer, sidan markerar. Kärnan är densamma som förut, rad för rad: varje rad prövas mot den
   föregående (samma lösning), en rad som inte följer bryter kedjan och raderna efter rörs inte, sista
   ifyllda raden markeras röd när raderna är för få, och antalet rader räknas med uppgiftens rad.

   TRE REGLER GÄLLER ÖVERALLT, sjuan också (Joachims beslut 2026-10-21). De är de enda tillåtna
   skillnaderna mot förut, och verktyg/ekv-rattare-fuzz.js prövar att inga andra finns:
     upprepning  en rad med samma termer i samma led som raden före (eller som uppgiften) fälls —
                 varje rad ska vara en riktig operation. Ordningen är fri: 10 + 6x = 64 efter
                 6x + 10 = 64 är en upprepning.
     vändning    en rad där leden bytt plats fälls inte, men räknas inte som operation mot radkravet.
     bokstav     sidan talar om för parsern vilken bokstav som gäller; en rad med en annan fälls.

   SIDANS REGLER (opts.regler) — slås på av den sida som vill ha dem, i dag åttans Ekvationer steg 1:
     namnare     parserns tillägg: x i nämnaren (EkvParser.losningsmangd)
     spegling, samla   radkravet räknas med EkvParser.minstaAntalRaderUtokad
     sistaRaden  SISTA ifyllda raden ska vara x = … ; 25,5 = x som slutsvar fälls ('vand')
     svarsform   svaret exakt, i decimalform eller blandad form; äkta bråk godtas. Oäkta bråk fälls
                 ('blandad'), oförkortat fälls ('forkorta' — prövas först), ett uttryck som inte är
                 färdigräknat fälls ('raknaKlart').

   Node + browser. Ingen nätväg. */
(function(){
'use strict';

var EP = (typeof window !== 'undefined' && window.EkvParser) ||
         (typeof require === 'function' ? require('./ekv-parser.js') : null);

/* BESKEDEN är ELEVTEXT, godkända av Joachim 2026-10-21. {v} är uppgiftens bokstav. De visas EFTER
   Kontrollera, på uppgiftens egen beskedrad — återkoppling, aldrig hjälptext före. */
var BESKED = {
  upprepning: { hint: 'Raden är samma som raden före. Varje rad ska vara ett nytt steg.' },
  bokstav:    { hint: 'Uppgiften använder {v} – skriv {v} i varje rad.' },
  vand:       { hint: 'Rätt värde – skriv sista raden som {v} = …' },
  blandad:    { hint: 'Rätt värde – skriv svaret i blandad form' },
  forkorta:   { hint: 'Rätt värde – förkorta svaret' },
  raknaKlart: { hint: 'Rätt värde – räkna klart svaret.' },
  forFaKort:  { hint: 'Skriv en ny rad för varje operation.' }
};
function beskedText(nyckel, v){
  var b = BESKED[nyckel]; return b ? b.hint.replace(/\{v\}/g, v || 'x') : '';
}

function sgd(a, b){ return b ? sgd(b, a % b) : a; }
// Svarets form, ur sista radens högerled i råform (bråken som [t|n]). null = godkänd form.
function svarsform(ra){
  var s = String(ra == null ? '' : ra).replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim();
  if(/^-?\s*\d+([,.]\d+)?$/.test(s)) return null;                                   // heltal, decimaltal
  var m = s.match(/^(-)?\s*(?:(\d+)\s*)?\[(\d+)\|(\d+)\]$/) ||                     // (−)(heltal) staplat bråk
          s.match(/^(-)?\s*(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);                       // skrivet på raden
  if(!m) return 'raknaKlart';
  var t = parseInt(m[3], 10), n = parseInt(m[4], 10);
  if(!(n > 0)) return 'raknaKlart';
  if(n === 1 || sgd(t, n) > 1) return 'forkorta';
  if(t >= n) return 'blandad';
  return null;
}

function tom(r){ return r.vl === '' && r.hl === ''; }
function annanBokstav(r, v){
  return /[a-zåäö]/i.test(String(r.vl + ' ' + r.hl).toLowerCase().split(String(v).toLowerCase()).join(''));
}

/* domKedja(uppg, rader, opts)
     uppg  { vl, hl, variabel }   uppgiftens led i parserns skrivsätt
     rader [{ vl, hl, hlRa }]      så som sidan läste dem; hlRa (råform) behövs bara för svarsformen
     opts  { lage: 'utskriven' | 'kort', regler: { … } }
   Ut: { status[], forFa, klar, ok, hade, krav, besked, sistIfylld }
     status[i]: 'ok' | 'fel' | 'tom' | null — null = raden nåddes inte (efter brottet) och rörs inte. */
function domKedja(uppg, rader, opts){
  opts = opts || {};
  var R = opts.regler || {}, v = uppg.variabel || 'x', p = { variabel: v };
  var ekv   = R.namnare ? function(a, b){ return EP.losningsmangd(a, b, p); } : function(a, b){ return EP.parseEkvation(a, b, p); };
  var samma = R.namnare ? EP.sammaMangd : EP.sammaLosning;
  var unik  = R.namnare ? EP.arUnikMangd : EP.harUnikLosning;
  var lost  = R.namnare ? function(a, b){ return EP.arLostNamnare(a, b, p); } : function(a, b){ return EP.arLost(a, b, p); };

  var forra = ekv(uppg.vl, uppg.hl), fore = { vl: uppg.vl, hl: uppg.hl };
  var allaOk = true, nadde = false, hade = false, antal = 1, vandningar = 0, besked = null;
  var status = rader.map(function(){ return null; }), sistIfylld = -1;
  rader.forEach(function(r, i){ if(!tom(r)) sistIfylld = i; });

  for(var i = 0; i < rader.length; i++){
    var r = rader[i];
    if(tom(r)){ status[i] = 'tom'; continue; }
    hade = true; antal++;
    var e = ekv(r.vl, r.hl);
    if(!e || !samma(forra, e)){
      status[i] = 'fel'; allaOk = false;
      if(!e && annanBokstav(r, v)) besked = 'bokstav';
      break;
    }
    if(EP.upprepar(fore, r)){ status[i] = 'fel'; allaOk = false; besked = 'upprepning'; break; }
    if(EP.vandning(fore, r)) vandningar++;
    status[i] = 'ok';
    forra = e; fore = r;
    if(!R.sistaRaden && unik(e) && lost(r.vl, r.hl)) nadde = true;
  }

  // ÅTTANS SISTA RAD: svaret är den sista ifyllda raden, och den ska vara v = ett tal i godkänd form.
  var formfel = null;
  if(R.sistaRaden && allaOk && sistIfylld >= 0){
    var s = rader[sistIfylld];
    nadde = unik(forra) && lost(s.vl, s.hl);
    if(!nadde && EP.arVandLost(s.vl, s.hl, p)) formfel = 'vand';
    else if(nadde && R.svarsform) formfel = svarsform(s.hlRa);
    if(formfel){ status[sistIfylld] = 'fel'; besked = formfel; nadde = false; }
  }

  var krav = (R.spegling || R.samla || R.namnare)
    ? EP.minstaAntalRaderUtokad(uppg.vl, uppg.hl, { variabel: v, lage: opts.lage, spegling: R.spegling, samla: R.samla, namnare: R.namnare })
    : EP.minstaAntalRader(uppg.vl, uppg.hl, { lage: opts.lage });
  var forFa = nadde && krav != null && (antal - vandningar) < krav;
  if(forFa && !besked) besked = 'forFa';
  var klar = allaOk && nadde && !forFa && !formfel;
  return { status: status, forFa: forFa, klar: klar, ok: allaOk && !forFa && !formfel, hade: hade, krav: krav,
           besked: besked, sistIfylld: sistIfylld };
}

var API = { domKedja: domKedja, svarsform: svarsform, BESKED: BESKED, beskedText: beskedText };
if(typeof window !== 'undefined') window.EkvRattare = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
