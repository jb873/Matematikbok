/* gen-prob-ak7.js — FLER BLAD INOM BANDET för metodträningens drill (order 2026-11-20).

   De författade Blad A–D är exemplen som DEFINIERAR bandet. Efter D gör drillen nya blad genom att BYTA
   TALEN i ett av exemplen — meningen står kvar ord för ord, aldrig omskriven. Aldrig svårare (takregeln).

   ÅTERANVÄNT: den seedade slumpen ur åttans bandgenerator (GEN_AK8_ALG1.rng/ri/val — samma seed ger samma
   blad) och problemlösningens modell (ProbModell: facit räknas ut, lösningsförslaget ger kedjan). Den här
   filen bär bara bandet för problemlösningen: hur ett exempels tal får bytas.

   SÅ BYTS TALEN (per uppgift, mallen = ett av exemplen A–D):
     1. Talen i TEXTEN ("6 år", "1 120 g", "2,5") paras ihop med talen i MODELLEN (relationer/villkor) via
        värdet. Ett tal som bara står i modellen (ord som "dubbelt", "triangel" → 180) är låst. Ett tal i
        texten som inte finns i modellen ("årskurs 7") är låst.
     2. Varje utbytbart tal har en ROLL ur modellen: total (villkorets högerled), mul (faktor före ·),
        div (nämnare efter /), kand (känd del: K = 11), diff (skillnad i en relation), vkonst (känd term i
        villkoret).
     3. BANDET för en roll = spannet hos talen med samma roll i variantens exempel MED SAMMA ENHET (åldrar
        med åldrar, gram med gram). Basdelens värde (delen som inte bestäms av en relation) får sitt spann
        ur samma exempel; totalen får exemplens största som tak.
     4. Har mallen en total dras basdelen och totalen RÄKNAS; annars löses modellen.
   Ett blad godtas bara om: modellen är entydig, alla delar > 0, varje del lika ren som exemplets (heltal där
   exemplet har heltal, högst lika många decimaler), balansmetoden har LIKA MÅNGA rader som exemplets och
   kedjans tal är lika rena, totalen ligger i bandet, jämna/udda behåller exemplets paritet, inget utbytt
   tal blir 0 eller 1 (grammatiken: "1 kakor") om exemplet inte hade det, och texten är inte ett av exemplen.
   Annars dras talen om (seedat). Ger en mall inget godtagbart blad, eller har mallen ingen annan uppgift
   med samma enhet att ta bandet ur, används den inte — och har varianten ingen användbar mall serveras
   INGET (variantlista: ProbGenAk7.granska()). Hellre inget blad än ett dåligt.

   NAMNEN (order 2026-11-21): i ett genererat blad byts också personnamnen — se PERSONNAMN nedan. Talen dras
   först, exakt som utan namnbyte; A–D behåller Joachims namn. */
(function(){
'use strict';

var G = (typeof window !== 'undefined' && window.GEN_AK8_ALG1) ||
        (typeof require === 'function' ? require('../blad/gen-ak8-alg1.js') : null);
var M = (typeof window !== 'undefined' && window.ProbModell) ||
        (typeof require === 'function' ? require('./prob-modell.js') : null);

var FORSOK = 600;        // dragningar per mall och blad innan mallen ges upp

// ── tal i texten: "45", "1 120", "2,5", inte "7B"/"8A" (klassnamn) ──
var TEXT_TAL = /(\d{1,3}(?: \d{3})+|\d+)(?:,(\d+))?(?![\dA-Za-zÅÄÖåäö]|,\d)/g;
// ENHETSKLASSER: saker som räknas i styck hör till samma band (kulor, böcker, pennor, kakor — antal saker).
// Övriga enheter är sin egen klass (cm och m har olika skala; år är år). Se ANTAGANDEN i leveransen.
var ENHETSKLASS = { 'kulor': 'st', 'böcker': 'st', 'pennor': 'st', 'kakor': 'st' };
function klass(enhet){ var e = enhet || ''; return ENHETSKLASS[e] || e; }
function lasTal(s){ return parseFloat(String(s).replace(/ /g, '').replace(',', '.')); }
function decimaler(v){ var s = String(Math.round(v * 1e6) / 1e6); var i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
function talText(v){
  var d = decimaler(v), s = d ? v.toFixed(d) : String(Math.round(v));
  var p = s.split('.'), hel = p[0];
  if(hel.length >= 4) hel = hel.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return hel + (p[1] ? ',' + p[1] : '');
}
function modellTal(v){ return String(v).replace('.', ','); }

// ── MALLEN: exemplets tal i text och modell, och deras roller ──
function tokensIText(t){
  var ut = [], m; TEXT_TAL.lastIndex = 0;
  while((m = TEXT_TAL.exec(t)) !== null) ut.push({ start: m.index, slut: m.index + m[0].length, varde: lasTal(m[0]) });
  return ut;
}
function tokensIModell(str, var_){
  // var_ = 'rel' | 'villkor'
  var ut = [], re = /\d+(?:,\d+)?/g, m;
  var lika = str.indexOf('='), vl = str.slice(0, lika), hl = str.slice(lika + 1).trim();
  while((m = re.exec(str)) !== null){
    var fore = str.slice(0, m.index).replace(/\s+$/, ''), efter = str.slice(m.index + m[0].length).replace(/^\s+/, '');
    var roll;
    if(var_ === 'villkor' && m.index > lika && hl === m[0]) roll = 'total';
    else if(fore.slice(-1) === '/') roll = 'div';
    else if(efter.charAt(0) === '·') roll = 'mul';
    else if(var_ === 'rel' && m.index > lika && /^\s*[A-ZÅÄÖ]\d?\s*$/.test(vl) && hl === m[0]) roll = 'kand';
    else if(var_ === 'rel') roll = 'diff';
    else roll = 'vkonst';
    ut.push({ start: m.index, slut: m.index + m[0].length, varde: lasTal(m[0]), roll: roll });
  }
  return ut;
}
function basNyckel(u){
  var vanster = (u.relationer || []).map(function(r){ return r.split('=')[0].trim(); });
  var n = M.nycklarAv(u);
  for(var i = 0; i < n.length; i++) if(vanster.indexOf(n[i]) < 0) return n[i];
  return n[0];
}
function mall(u){
  var text = tokensIText(u.fraga);
  var modell = [];
  (u.relationer || []).forEach(function(r, i){ tokensIModell(r, 'rel').forEach(function(t){ t.kalla = 'rel'; t.i = i; modell.push(t); }); });
  (u.villkor || []).forEach(function(r, i){ tokensIModell(r, 'villkor').forEach(function(t){ t.kalla = 'villkor'; t.i = i; modell.push(t); }); });
  // ett utbytbart tal = ett värde som står både i texten och i modellen
  var platser = {};
  text.forEach(function(t){
    var mt = modell.filter(function(x){ return Math.abs(x.varde - t.varde) < 1e-9; });
    if(!mt.length) return;                       // står bara i texten → låst
    var k = String(t.varde);
    if(!platser[k]) platser[k] = { varde: t.varde, roll: mt[0].roll, text: [], modell: mt };
    platser[k].text.push(t);
  });
  // Står värdet FLER gånger i modellen än i texten är några av dem låsta tal ur orden (rektangelns
  // "2·" i 2·9 + 2·(X − 2)). Då byts bara de som inte är faktorer; går det inte att avgöra bär mallen inte.
  var tvetydig = false;
  Object.keys(platser).forEach(function(k){
    var p = platser[k];
    if(p.modell.length > p.text.length){
      var ejFaktor = p.modell.filter(function(x){ return x.roll !== 'mul'; });
      if(ejFaktor.length === p.text.length){ p.modell = ejFaktor; p.roll = ejFaktor[0].roll; }
      else tvetydig = true;
    }
  });
  var lista = tvetydig ? [] : Object.keys(platser).map(function(k){ return platser[k]; });
  var sant = M.varden(u, M.grenarAv(u)[0]);
  var lf = M.losningsforslag(u);
  return { u: u, platser: lista, tvetydig: tvetydig, bas: basNyckel(u), varden: sant.varden, kedjeRader: lf ? lf.kedja.length : null,
           kedjeDec: lf ? Math.max.apply(null, [0].concat(lf.kedja.map(function(r){ return decimaler(lasTal(r.hl)); }))) : 0,
           total: lista.filter(function(p){ return p.roll === 'total'; })[0] || null };
}

// ── BANDET för en mall: ur variantens exempel med samma enhet ──
function band(mallar, m){
  var grupp = mallar.filter(function(x){ return klass(x.u.enhet) === klass(m.u.enhet); });
  var roller = {};
  grupp.forEach(function(x){ x.platser.forEach(function(p){
    (roller[p.roll] = roller[p.roll] || []).push(p.varde);
  }); });
  function spann(l){ return l && l.length ? [Math.min.apply(null, l), Math.max.apply(null, l)] : null; }
  var b = {};
  Object.keys(roller).forEach(function(r){ b[r] = spann(roller[r]); });
  b.bas = spann(grupp.map(function(x){ return x.varden[x.bas]; }));
  // Varje DEL (ålder, sida, vinkel …) ska ligga inom spannet hos exemplens delar — en ålder på 4 år där
  // exemplen har 11–25, eller en barnfotbollsplan på 12 × 6 m, är inte samma band.
  var delvarden = [];
  grupp.forEach(function(x){ Object.keys(x.varden).forEach(function(k){ delvarden.push(x.varden[k]); }); });
  b.delar = spann(delvarden);
  // Omkrets: också figurens SIDOR ska ligga inom exemplens spann ("4 cm och (x − 5) cm" med x = 6 ger en
  // sida på 1 cm, där exemplens sidor är 6–13 cm).
  var sidvarden = [];
  grupp.forEach(function(x){
    if(x.u.typ !== 'omkrets') return;
    var sd = sidor(x.u.villkor[0].split('=')[0], x.varden); if(sd) sidvarden = sidvarden.concat(sd);
  });
  b.sidor = spann(sidvarden);
  b.grupp = grupp.length;
  return b;
}

// Sidorna i en månghörning ur villkorets vänsterled ("7 + 9 + (X + 4)", "2·S + 12", "A + B + C + D"):
// varje term är en sida, "k·Y" är k sidor. null = vänsterledet är inte en summa av sidor.
function sidor(lhs, varden){
  var termer = [], djup = 0, start = 0, s = String(lhs);
  for(var i = 0; i < s.length; i++){
    var c = s.charAt(i);
    if(c === '(') djup++; else if(c === ')') djup--;
    else if(c === '+' && djup === 0){ termer.push(s.slice(start, i)); start = i + 1; }
    else if(c === '-' && djup === 0) return null;
  }
  termer.push(s.slice(start));
  var ut = [];
  for(var j = 0; j < termer.length; j++){
    var t = termer[j].trim(), m = t.match(/^(\d+)·(.+)$/), antal = 1;
    if(m){ antal = +m[1]; t = m[2]; }
    var v = M.utvardera(t, varden); if(v == null) return null;
    for(var a = 0; a < antal; a++) ut.push(v);
  }
  return ut;
}

// ── DRAGNING ──
function dra(r, spann, ref){
  var d = decimaler(ref), steg = Math.pow(10, -d);
  var lo = Math.round(spann[0] / steg), hi = Math.round(spann[1] / steg);
  var v = G.ri(r, lo, hi) * steg;
  return Math.round(v * 1e6) / 1e6;
}
function ersatt(str, tokens, nyttFor){
  // tokens sorterade bakifrån så positionerna står kvar
  var s = str;
  tokens.slice().sort(function(a, b){ return b.start - a.start; }).forEach(function(t){
    var ny = nyttFor(t); if(ny == null) return;
    s = s.slice(0, t.start) + ny + s.slice(t.slut);
  });
  return s;
}
function bygg(m, val){
  // val: { '<gammalt värde>': nytt värde }
  var u = m.u, nu = JSON.parse(JSON.stringify(u));
  var texttok = []; m.platser.forEach(function(p){ p.text.forEach(function(t){ texttok.push({ start: t.start, slut: t.slut, p: p }); }); });
  nu.fraga = ersatt(u.fraga, texttok, function(t){ return talText(val[String(t.p.varde)]); });
  // I modellen byts BARA platsens egna positioner (inte varje tal med samma värde).
  function mod(str, kalla, i){
    var tok = [];
    m.platser.forEach(function(p){ p.modell.forEach(function(t){ if(t.kalla === kalla && t.i === i) tok.push({ start: t.start, slut: t.slut, p: p }); }); });
    return ersatt(str, tok, function(t){ return modellTal(val[String(t.p.varde)]); });
  }
  nu.relationer = (u.relationer || []).map(function(r, i){ return mod(r, 'rel', i); });
  nu.villkor = (u.villkor || []).map(function(r, i){ return mod(r, 'villkor', i); });
  return nu;
}
function godtas(m, nu, b, exempelTexter){
  if(M.granska(nu).length) return false;
  var v = M.varden(nu, M.grenarAv(nu)[0]); if(v.fel) return false;
  var n = M.nycklarAv(nu);
  for(var i = 0; i < n.length; i++){
    var x = v.varden[n[i]], ref = m.varden[n[i]];
    if(!(x > 0)) return false;
    if(decimaler(x) > decimaler(ref)) return false;
    if(b.delar && (x < b.delar[0] || x > b.delar[1])) return false;
  }
  // Omkrets: figuren ska gå att rita — längsta sidan kortare än summan av de andra (8, 4, 12 är ingen triangel).
  if(m.u.typ === 'omkrets'){
    var sd = sidor(nu.villkor[0].split('=')[0], v.varden);
    if(sd && sd.length >= 3){
      var max = Math.max.apply(null, sd), summa = sd.reduce(function(a, c){ return a + c; }, 0);
      if(!(max < summa - max - 1e-9) || sd.some(function(x2){ return !(x2 > 0); })) return false;
    }
    if(sd && b.sidor && sd.some(function(x3){ return x3 < b.sidor[0] - 1e-9 || x3 > b.sidor[1] + 1e-9; })) return false;
  }
  // Paritet: jämna/udda tal, och alla tal i följd (en uppslagen bok har jämn vänstersida — 78 och 79).
  if(/jämn|udda/i.test(m.u.fraga) || m.u.typ === 'foljd'){
    var pb = Math.round(m.varden[m.bas]) % 2, pn = Math.round(v.varden[m.bas]) % 2;
    if(pb !== pn) return false;
  }
  if(nu.foljdfraga){
    var f = M.utvardera(nu.foljdfraga.uttryck, v.varden), f0 = M.utvardera(m.u.foljdfraga.uttryck, m.varden);
    if(!(f > 0) || decimaler(f) > decimaler(f0)) return false;
  }
  var lf = M.losningsforslag(nu);
  if(!lf || lf.kedja.length !== m.kedjeRader) return false;
  for(var k = 0; k < lf.kedja.length; k++){
    var h = lasTal(lf.kedja[k].hl);
    if(!isFinite(h) || decimaler(h) > m.kedjeDec) return false;
  }
  if(exempelTexter.indexOf(nu.fraga) >= 0) return false;
  nu.facit = n.map(function(k){ return v.varden[k]; });
  if(nu.foljdfraga) nu.facitFoljd = M.utvardera(nu.foljdfraga.uttryck, v.varden);
  return true;
}
// Ett nytt blad ur mallen m, seedat. null = mallen ger inget godtagbart blad.
function ettBlad(m, b, seed, exempelTexter){
  if(!G || !M || !m.platser.length || b.grupp < 2) return null;
  var r = G.rng(seed);
  for(var f = 0; f < FORSOK; f++){
    var val = {}, ok = true;
    m.platser.forEach(function(p){
      if(p.roll === 'total') return;
      var sp = b[p.roll] || [p.varde, p.varde];
      var x = dra(r, sp, p.varde);
      if(x < 2 && p.varde >= 2) ok = false;
      val[String(p.varde)] = x;
    });
    if(!ok) continue;
    // Tal som är OLIKA i exemplet ska vara olika efter bytet ("B 20° större … C 40° större" får inte bli
    // "B 15° … C 15°" — då säger texten något annat om figuren).
    var dragna = m.platser.filter(function(p){ return p.roll !== 'total'; }).map(function(p){ return val[String(p.varde)]; });
    if(dragna.some(function(x, i2){ return dragna.indexOf(x) !== i2; })) continue;
    if(m.total){
      // basdelen dras, totalen räknas ur relationerna (samma modell, villkoret byts mot basvärdet)
      var bas = dra(r, b.bas, m.varden[m.bas]);
      var utan = bygg(m, Object.assign({}, val, (function(){ var o = {}; o[String(m.total.varde)] = m.total.varde; return o; })()));
      var hjalp = { delar: utan.delar, relationer: utan.relationer, villkor: [m.bas + ' = ' + modellTal(bas)] };
      var vv = M.varden(hjalp, M.grenarAv(hjalp)[0]); if(vv.fel) continue;
      var lhs = utan.villkor[0].split('=')[0];
      var tot = M.utvardera(lhs, vv.varden); if(tot == null) continue;
      tot = Math.round(tot * 1e6) / 1e6;
      var tb = b.total || [m.total.varde, m.total.varde];
      // Totalen räknas ur delar som redan ligger i bandet; den får inte bli STÖRRE än exemplens största
      // (taket). Golvet sätts av delarna själva — ett exempelpar med nästan lika totaler (92/93) skulle
      // annars låsa varianten vid exemplen.
      if(tot > tb[1] || decimaler(tot) > decimaler(m.total.varde) || (tot < 2 && m.total.varde >= 2)) continue;
      val[String(m.total.varde)] = tot;
    }
    // samma värde på två platser i exemplet → samma nya värde (de är samma tal)
    var nu = bygg(m, val);
    if(nu.fraga === m.u.fraga) continue;
    if(godtas(m, nu, b, exempelTexter)) return nu;
  }
  return null;
}

// ── PERSONNAMN (order 2026-11-21): i ett genererat blad byts också personnamnen, så bladet inte känns som
// samma uppgift igen. Talen dras först och exakt som förut; namnen läggs på efteråt med en egen seedad slump.
//   KÄLLA: de svenska förnamnen i Joachims problemlösningsdokument (A–D), påfyllda med två könsneutrala
//   högstadienamn (Alex, Robin) så att "Kim" har något att bytas mot.
//   KÖNET behålls: meningen står kvar ord för ord, också "han/hon/hennes" ("Noa tänker … Han multiplicerar").
//   Bara personnamn byts — objekt, kontext och struktur står kvar.
//   KONSEKVENT inom bladet: alla "Elias" → samma nya namn; två personer får två olika namn (och inga två namn
//   med samma början, Noa/Noah); ett nytt namn liknar inte något av exemplets namn.
//   GENITIV: positionen läses i exemplet ("Majas ålder" = genitiv, "som Elias." = grundform) och det NYA namnet
//   böjs (Maja → Majas, Elias/Max/Alex → oförändrat). Ett namn på -s/-x/-z där det inte går att avgöra om
//   positionen är genitiv (nästa ord är varken ett känt verb/småord eller ett känt huvudord) är OKLART: den
//   personen behåller exemplets namn i hela bladet, och mallen flaggas (granska() → namn.oklara).
var NAMN = {
  pojke:  ['Noa', 'Omar', 'Noah', 'Ali', 'Elias', 'Leo', 'Liam', 'Hugo', 'Oskar', 'Max', 'Adam', 'Sam'],
  flicka: ['Elsa', 'Mira', 'Liv', 'Maja', 'Ella', 'Moa', 'Vera', 'Ida', 'Saga', 'Alva', 'Alma', 'Tilde', 'Mia', 'Nora'],
  neutralt: ['Kim', 'Alex', 'Robin']
};
var KON = {};
Object.keys(NAMN).forEach(function(k){ NAMN[k].forEach(function(n){ KON[n] = k; }); });
// Efter ett namn på -s/-x/-z: grundform om nästa ord är ett av de här (verb och småord ur dokumenten) …
var NOM_FOLJER = ['är', 'har', 'väger', 'tänker', 'tänkte', 'äter', 'får', 'fick', 'och', 'eller', 'som', 'på', 'men',
                  'multiplicerar', 'dividerar', 'adderar', 'subtraherar', 'dubblar', 'halverar'];
// … genitiv om det är ett av de här (vad en person kan "ha": släkt, ålder, mått).
var GEN_HUVUD = ['mamma', 'pappa', 'mor', 'far', 'bror', 'syster', 'moster', 'morbror', 'faster', 'farbror', 'mormor',
                 'morfar', 'farmor', 'farfar', 'kusin', 'kompis', 'ålder', 'längd', 'vikt'];
function sxz(n){ return /[sxz]$/i.test(n); }
function genitiv(n){ return sxz(n) ? n : n + 's'; }
var ORD = /[A-Za-zÅÄÖåäöÉé]+/g;
// Personnamnen i en text: [{ start, slut, namn (grundform), form: 'nom' | 'gen' | 'oklar' }]
function namnIText(t){
  var s = String(t), ut = [], m; ORD.lastIndex = 0;
  while((m = ORD.exec(s)) !== null){
    var w = m[0], namn = null, form = null;
    if(KON.hasOwnProperty(w)){
      namn = w; form = 'nom';
      if(sxz(w)){
        var rest = s.slice(m.index + w.length), f = rest.match(/^ +([a-zåäöé]+)/);
        if(f) form = NOM_FOLJER.indexOf(f[1]) >= 0 ? 'nom' : (GEN_HUVUD.indexOf(f[1]) >= 0 ? 'gen' : 'oklar');
        else form = /^\s*([.,!?;:)]|$)/.test(rest) ? 'nom' : 'oklar';
      }
    } else if(/s$/.test(w) && KON.hasOwnProperty(w.slice(0, -1)) && !sxz(w.slice(0, -1))){
      namn = w.slice(0, -1); form = 'gen';
    }
    if(namn) ut.push({ start: m.index, slut: m.index + w.length, namn: namn, form: form });
  }
  return ut;
}
// Mallens personer: vilka som byts och vilka som är oklara (behåller exemplets namn, flaggas).
function namnMall(u){
  var pos = namnIText(u.fraga);
  (u.delar || []).forEach(function(d){ pos = pos.concat(namnIText(d.namn)); });
  var personer = [], oklara = [];
  pos.forEach(function(p){
    if(personer.indexOf(p.namn) < 0) personer.push(p.namn);
    if(p.form === 'oklar' && oklara.indexOf(p.namn) < 0) oklara.push(p.namn);
  });
  return { personer: personer, oklara: oklara, byts: personer.filter(function(n){ return oklara.indexOf(n) < 0; }) };
}
function borjan(n){ return n.slice(0, 3).toLowerCase(); }
// Nya namn för mallens personer: samma kön, inbördes olika, inget som liknar exemplets namn — och helst
// inget av namnen i bladet före (forra), så två blad i rad inte har samma person.
function valjNamn(info, r, forra){
  var upptagna = info.personer.map(borjan), karta = {}, nyss = (forra || []).map(borjan);
  info.byts.forEach(function(n){
    var kand = NAMN[KON[n]].filter(function(x){ return upptagna.indexOf(borjan(x)) < 0; });
    var farska = kand.filter(function(x){ return nyss.indexOf(borjan(x)) < 0; });
    if(farska.length) kand = farska;
    if(!kand.length) return;                     // inget ledigt namn → personen behåller sitt
    var ny = G.val(r, kand); karta[n] = ny; upptagna.push(borjan(ny));
  });
  return karta;
}
function sattNamn(str, karta){
  var pos = namnIText(str), s = String(str);
  pos.slice().reverse().forEach(function(p){
    var ny = karta[p.namn]; if(!ny || p.form === 'oklar') return;
    s = s.slice(0, p.start) + (p.form === 'gen' ? genitiv(ny) : ny) + s.slice(p.slut);
  });
  return s;
}
function bytNamn(nu, info, seed, forra){
  if(!info.byts.length) return {};
  var karta = valjNamn(info, G.rng(seed), forra);
  nu.fraga = sattNamn(nu.fraga, karta);
  (nu.delar || []).forEach(function(d){ d.namn = sattNamn(d.namn, karta); });
  return karta;
}

// ── VARIANTEN: exemplen A–D (i ordning) → en källa för blad nr 5, 6, … ──
function variant(exempel, ref){
  var mallar = exempel.map(mall);
  var texter = exempel.map(function(u){ return u.fraga; });
  var bas = 0; for(var i = 0; i < ref.length; i++) bas = (bas * 31 + ref.charCodeAt(i)) >>> 0;
  var namnInfo = exempel.map(namnMall);
  var cache = {}, talTexter = {};
  // Blad nr n efter D (n = 0, 1, …): mallarna turas om (A, B, C, D, A, …); en mall som inte ger ett
  // godtagbart blad hoppas över för det bladet. null = ingen mall bär (varianten flaggas).
  // UPPREPNING: ett nytt blad ska helst inte ha visats förut (exemplen räknas alltid som visade). Är bandet
  // så smalt att allt är visat får ett tidigare genererat blad komma igen — men aldrig samma som bladet före.
  // Upprepningen jämförs på TALEN (texten före namnbytet), så talen blir exakt desamma som utan namnbyte.
  function generera(n){
    if(cache.hasOwnProperty(n)) return cache[n];
    var tidigare = [];
    for(var p = 0; p < n; p++){ generera(p); if(talTexter[p]) tidigare.push(talTexter[p]); }
    var forra = tidigare.length ? tidigare[tidigare.length - 1] : null;
    var ut = null, utMi = -1;
    [texter.concat(tidigare), texter.concat(forra ? [forra] : [])].forEach(function(undvik, pass){
      for(var j = 0; j < mallar.length && !ut; j++){
        var mi = (n + j) % mallar.length, m = mallar[mi];
        var nu = ettBlad(m, band(mallar, m), (bas + 7919 * (n + 1) + 104729 * mi + 31337 * pass) >>> 0, undvik);
        if(nu){ nu.id = m.u.id + '-g' + (n + 1); nu.mall = ['A', 'B', 'C', 'D'][mi]; nu.upprepning = pass > 0; ut = nu; utMi = mi; }
      }
    });
    if(ut){
      talTexter[n] = ut.fraga;
      var fore = n > 0 ? generera(n - 1) : null;
      var forraNamn = fore && fore.namnByte ? Object.keys(fore.namnByte).map(function(k){ return fore.namnByte[k]; }) : [];
      ut.namnByte = bytNamn(ut, namnInfo[utMi], (bas + 7919 * (n + 1) + 104729 * utMi + 2654435761) >>> 0, forraNamn);
    }
    cache[n] = ut;
    return ut;
  }
  // Vilka mallar bär? (för flaggningen: provar de första blad)
  function granska(antal){
    antal = antal || 12;
    var bar = mallar.map(function(m, mi){ var b = band(mallar, m);
      return { platser: m.platser.length, grupp: b.grupp, blad: 0, namn: namnInfo[mi] }; });
    for(var n = 0; n < antal; n++){
      mallar.forEach(function(m, mi){
        if(ettBlad(m, band(mallar, m), (bas + 7919 * (n + 1) + 104729 * mi) >>> 0, texter)) bar[mi].blad++;
      });
    }
    return bar;
  }
  return { generera: generera, granska: granska, mallar: mallar };
}

var API = { variant: variant, mall: mall, band: band, talText: talText, decimaler: decimaler,
            NAMN: NAMN, KON: KON, namnIText: namnIText, namnMall: namnMall, genitiv: genitiv };
if(typeof window !== 'undefined') window.ProbGenAk7 = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
