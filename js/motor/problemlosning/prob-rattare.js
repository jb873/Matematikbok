/* prob-rattare.js — RÄTTAREN för problemlösning (order 2026-09-23).

   Det nya och svåraste: eleven väljer SJÄLV vad x är, så uppgiften har inget facit att jämföra med.
   Rättaren läser steg 1 och prövar om resten hänger ihop med elevens eget val.

   METODENS FEM STEG — rättaren följer dem i ordning och STANNAR VID FÖRSTA FELET:
     1 uttryck     minst en del är x själv, och varje relation blir en IDENTITET med elevens
                   uttryck insatta ("x + 12" och "x − 12" är båda rätt, beroende på vad som är x)
     2 ekvation    elevens ekvation ska följa ur uppgiftens villkor med hennes egna uttryck insatta
     3 balansmetod kedjan från elevens egen ekvation; minst en rad för ekvationen plus en per
                   operation som krävs; sista raden x = tal med x i vänsterledet
     4 insättning  x in i elevens EGNA uttryck (ett tidigt fel straffas inte två gånger)
     5 svar        ett fält per del — alla delar besvaras alltid — rättat på tal och enhet

   Rätt räknat ur en felaktig modellering är FEL, och beskedet hamnar på steg 1: eleven har räknat
   rätt men löst fel problem, och modelleringen är det metoden tränar.

   Uppgifter med flera giltiga tolkningar (likbenta triangeln) bär grenar; rättaren väljer den gren
   elevens uttryck stämmer med och prövar resten mot den.

   Ren funktion: in uppgift + elevens svar, ut { status, steg, … }. Ingen DOM, ingen nätväg. */
(function(){
'use strict';

var EPS = 1e-9;
var EP = (typeof window !== 'undefined' && window.EkvParser) ||
         (typeof require === 'function' ? require('../ekvationer-balans/ekv-parser.js') : null);
var MOD = (typeof window !== 'undefined' && window.ProbModell) ||
          (typeof require === 'function' ? require('./prob-modell.js') : null);

// ELEVTEXT som fält — hint: är ett av fältnamnen elevtext-låset känner (verktyg/elevtext-grind.js:32),
// så beskeden syns i låsets lista. Joachim sätter den slutliga ordalydelsen.
var BESKED = {
  delSaknas:      { hint: 'Varje del ska ha ett uttryck – en del saknas.' },
  ejTolkat:       { hint: 'Uttrycket gick inte att tolka.' },
  ingenX:         { hint: 'En av delarna ska vara x själv – börja med att välja vilken.' },
  relationBryts:  { hint: 'Uttrycken stämmer inte med vad uppgiften säger om delarna.' },
  ekvationOlaslig:{ hint: 'Ekvationen gick inte att tolka.' },
  ekvationLost:   { hint: 'Det här är svaret, inte ekvationen. Ekvationen ska visa villkoret i uppgiften.' },
  ekvationFel:    { hint: 'Ekvationen följer inte ur uppgiften och dina uttryck.' },
  ingenLosning:   { hint: 'Ekvationen har ingen entydig lösning.' },
  radOlaslig:     { hint: 'Raden gick inte att tolka.' },
  radFoljerEj:    { hint: 'Raden följer inte ur raden ovanför.' },
  upprepning:     { hint: 'Raden är samma som raden före. Varje rad ska vara ett nytt steg.' },
  forFaRader:     { hint: 'Visa ett steg i taget – det behövs fler rader innan x står ensamt.' },
  ejLost:         { hint: 'Sista raden ska vara x = tal, med x i vänsterledet.' },
  insattningFel:  { hint: 'Värdet stämmer inte med ditt eget uttryck.' },
  insattningKedja:{ hint: 'Leden i rutan är inte lika mycket värda.' },
  svarSaknas:     { hint: 'Alla delar ska ha ett svar.' },
  svarTalFel:     { hint: 'Fel värde.' },
  svarEnhetSaknas:{ hint: 'Talet är rätt – men enheten saknas.' },
  foljdFel:       { hint: 'Värdet stämmer inte.' }
};

function tom(v){ return v == null || String(v).trim() === ''; }
function parOpts(u){ return { variabel: (u.variabel || 'x') }; }

// Elevens uttryck insatta i en relation/villkor: "C = H + 12" → "(x+12) = (x) + 12"
function satt(str, uttryck){
  var s = String(str);
  Object.keys(uttryck).forEach(function(k){
    s = s.replace(new RegExp(k + '(?![0-9])', 'g'), '(' + uttryck[k] + ')');
  });
  return s;
}
function sidor(str){
  var d = String(str).split('=');
  return d.length === 2 ? { vl: d[0], hl: d[1] } : null;
}

// ── STEG 1 ────────────────────────────────────────────────────────────────────────────────────
// Prövar elevens uttryck mot EN gren. Returnerar null när allt stämmer, annars felet.
function provaUttryck(u, gren, uttryck){
  var opts = parOpts(u), nycklar = MOD.nycklarAv(u);
  var antalX = 0;
  for(var i = 0; i < nycklar.length; i++){
    var k = nycklar[i];
    if(tom(uttryck[k])) return { steg: 'uttryck', del: k, besked: BESKED.delSaknas.hint };
    var p = EP.parseSida(uttryck[k], opts);
    if(!p) return { steg: 'uttryck', del: k, besked: BESKED.ejTolkat.hint };
    if(Math.abs(p.a - 1) < EPS && Math.abs(p.b) < EPS) antalX++;
  }
  // MINST en del ska vara x själv. (Inte 'exakt en': i en likbent triangel är två delar lika
  // stora och skrivs båda som x — 50 + x + x = 180. Att skriva ALLA delar som x fångas ändå, av
  // identitetstestet nedan: 'C = H + 12' kan inte bli identitet med både H och C satta till x.)
  if(antalX === 0) return { steg: 'uttryck', besked: BESKED.ingenX.hint };

  for(var j = 0; j < gren.relationer.length; j++){
    var rel = sidor(satt(gren.relationer[j], uttryck));
    if(!rel) return { steg: 'uttryck', relation: gren.relationer[j], besked: BESKED.relationBryts.hint };
    var L = EP.parseSida(rel.vl, opts), H = EP.parseSida(rel.hl, opts);
    if(!L || !H) return { steg: 'uttryck', relation: gren.relationer[j], besked: BESKED.ejTolkat.hint };
    if(Math.abs(L.a - H.a) > 1e-7 || Math.abs(L.b - H.b) > 1e-7)
      return { steg: 'uttryck', relation: gren.relationer[j], besked: BESKED.relationBryts.hint };
  }
  return null;
}

// ── STEG 2 ────────────────────────────────────────────────────────────────────────────────────
// Villkoret med elevens egna uttryck insatta ÄR den förväntade ekvationen. Alla ekvivalenta former
// godtas (2x + 12 = 48, x + x + 12 = 48, 48 = 2x + 12) — samma lösning och samma x-koefficient.
// Ett redan löst "x = 18" godtas INTE: det är svaret, inte ekvationen.
function provaEkvation(u, gren, uttryck, rad1){
  var opts = parOpts(u);
  if(!rad1 || tom(rad1.vl) || tom(rad1.hl)) return { steg: 'ekvation', besked: BESKED.ekvationOlaslig.hint };
  var elev = EP.parseEkvation(rad1.vl, rad1.hl, opts);
  if(!elev) return { steg: 'ekvation', besked: BESKED.ekvationOlaslig.hint };
  if(!EP.harUnikLosning(elev)) return { steg: 'ekvation', besked: BESKED.ingenLosning.hint };
  if(EP.arLost(rad1.vl, rad1.hl, opts)) return { steg: 'ekvation', besked: BESKED.ekvationLost.hint };

  for(var i = 0; i < gren.villkor.length; i++){
    var v = sidor(satt(gren.villkor[i], uttryck));
    if(!v) continue;
    var vant = EP.parseEkvation(v.vl, v.hl, opts);
    if(!vant) continue;
    if(EP.sammaLosning(vant, elev) && Math.abs(Math.abs(elev.A) - Math.abs(vant.A)) < 1e-7)
      return null;
  }
  return { steg: 'ekvation', besked: BESKED.ekvationFel.hint };
}

// ── STEG 3 ────────────────────────────────────────────────────────────────────────────────────
// Kedjan: varje rad följer ur den föregående, sista raden x = tal. Minsta antal rader räknas ur
// elevens EGEN ekvation (en rad för ekvationen plus en per operation som krävs).
// UPPREPNING (Joachim 2026-10-21, samma regel som balansmetodens kedja): en rad med samma termer i
// samma led som raden före är ingen operation och fälls — annars kunde raderna fyllas ut till kravet.
function provaKedja(u, rader){
  var opts = parOpts(u);
  var ifyllda = rader.filter(function(r){ return r && !tom(r.vl) && !tom(r.hl); });
  var forra = EP.parseEkvation(ifyllda[0].vl, ifyllda[0].hl, opts);
  for(var i = 1; i < ifyllda.length; i++){
    var e = EP.parseEkvation(ifyllda[i].vl, ifyllda[i].hl, opts);
    if(!e) return { steg: 'balans', rad: i + 1, besked: BESKED.radOlaslig.hint };
    if(!EP.sammaLosning(forra, e)) return { steg: 'balans', rad: i + 1, besked: BESKED.radFoljerEj.hint };
    if(EP.upprepar(ifyllda[i - 1], ifyllda[i])) return { steg: 'balans', rad: i + 1, besked: BESKED.upprepning.hint };
    forra = e;
  }
  var sista = ifyllda[ifyllda.length - 1];
  if(!EP.arLost(sista.vl, sista.hl, opts)) return { steg: 'balans', rad: ifyllda.length, besked: BESKED.ejLost.hint };
  var minst = EP.minstaAntalRader(ifyllda[0].vl, ifyllda[0].hl, opts);
  if(minst != null && ifyllda.length < minst)
    return { steg: 'balans', rad: ifyllda.length, kravRader: minst, besked: BESKED.forFaRader.hint };
  return { losning: EP.losningAv(forra) };
}

// ── STEG 5 ────────────────────────────────────────────────────────────────────────────────────
// Svaret rättas på TAL och ENHET; resten av texten ignoreras ("Calle är 30 kg" = "30 kg").
var ENHETSORD = {
  'år': ['år', 'ar'], 'kr': ['kr', 'kronor', 'kronor.'], 'kg': ['kg', 'kilo', 'kilogram'],
  'cm': ['cm'], 'm': ['m', 'meter'], 'dl': ['dl'], 'st': ['st', 'stycken'],
  'grader': ['grader', 'grad', '°'], 'cm²': ['cm2', 'cm²', 'kvadratcentimeter'], 'm²': ['m2', 'm²', 'kvadratmeter']
};
// Talet i ett svar: "30 kg", "Calle är 30 kg", "3/4 kg" och det byggda bråket "(3)/(4) kg" ska alla
// ge samma värde — två skrivsätt får aldrig ge olika utfall. Enhetsorden plockas bort, sedan prövas
// hela uttrycket med parsern; först om det inte går tas första talet i texten.
function talUr(text){
  var s = String(text).replace(/(\d)[  ](?=\d{3}\b)/g, '$1').replace(/−/g, '-').replace(/,/g, '.');
  var utanOrd = s.replace(/[a-zåäöA-ZÅÄÖ°²]+/g, ' ').trim();
  if(utanOrd !== '' && EP){
    var p = EP.parseSida(utanOrd);
    if(p && Math.abs(p.a) < EPS && isFinite(p.b)) return p.b;
  }
  var m = s.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}
// VÄRDET I EN RUTA. Rutan får bära uträkningen, inte bara svaret:
//   "30"  ·  "18 + 12"  ·  "18 + 12 = 30"   → alla är värda trettio.
// Står flera led i rutan måste de vara lika mycket värda (samma regel som beräkningsrutorna).
function vardeUr(text, opts){
  var led = String(text == null ? '' : text).split('=').map(function(d){ return d.trim(); }).filter(function(d){ return d !== ''; });
  if(!led.length) return { fel: 'tom' };
  var varden = [];
  for(var i = 0; i < led.length; i++){
    // Ett led som är UTTRYCKET självt (x + 12) har inget värde — det är bara upprepat ur steg 1,
    // precis som i metodens skiss: x + 12 = 18 + 12 = 30. Det hoppas över.
    var p = EP && opts && opts.variabel && EP.parseSida(led[i], opts);
    if(p && Math.abs(p.a) > 1e-9) continue;
    var v = talUr(led[i]);
    if(v === null) return { fel: 'otolkat' };
    varden.push(v);
  }
  if(!varden.length) return { fel: 'otolkat' };
  for(var j = 1; j < varden.length; j++) if(Math.abs(varden[j] - varden[0]) > 1e-6) return { fel: 'kedjebrott' };
  return { varde: varden[varden.length - 1] };
}

function harEnhet(text, enhet){
  if(!enhet) return true;
  var s = String(text).toLowerCase().replace(/[.,;:!?]/g, ' ');
  var former = ENHETSORD[enhet] || [String(enhet).toLowerCase()];
  return former.some(function(e){
    var ee = String(e).toLowerCase();
    return new RegExp('(^|[^a-zåäö0-9])' + ee.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-zåäö0-9]|$)').test(s + ' ');
  });
}
function provaSvarsfalt(text, varde, enhet, opts){
  if(tom(text)) return { fel: BESKED.svarSaknas.hint };
  var vr = vardeUr(text, opts);
  if(vr.fel === 'kedjebrott') return { fel: BESKED.insattningKedja.hint };
  if(vr.fel || Math.abs(vr.varde - varde) > 1e-6) return { fel: BESKED.svarTalFel.hint };
  if(!harEnhet(text, enhet)) return { fel: BESKED.svarEnhetSaknas.hint, enhetSaknas: true };
  return null;
}

// ── HUVUDET ───────────────────────────────────────────────────────────────────────────────────
// svar = { uttryck:{del→str}, rader:[{vl,hl}…]  (rad 1 = elevens ekvation),
//          insattning:{del→str}?, foljd:str?, svar:{del→str} }
function ratta(u, svar){
  svar = svar || {};
  var uttryck = svar.uttryck || {}, opts = parOpts(u);
  var grenar = MOD.grenarAv(u);

  // STEG 1 — pröva grenarna; den gren elevens uttryck stämmer med bär resten av rättningen.
  var gren = null, forstaFel = null;
  for(var g = 0; g < grenar.length; g++){
    var fel = provaUttryck(u, grenar[g], uttryck);
    if(!fel){ gren = grenar[g]; break; }
    if(!forstaFel) forstaFel = fel;
  }
  if(!gren) return Object.assign({ status: 'fel' }, forstaFel);

  var sant = MOD.varden(u, gren);
  if(sant.fel) return { status: 'fel', steg: 'uppgift', besked: 'Uppgiften går inte att lösa entydigt (' + sant.fel + ').' };

  // varje ruta bär sitt eget omdöme i det steg där felet ligger; stegen före är godkända
  var per = { uttryck: {}, insattning: {}, svar: {} };
  MOD.nycklarAv(u).forEach(function(k){ per.uttryck[k] = true; });

  // STEG 2 — ekvationen (rad 1 i kedjan)
  var rader = (svar.rader || []).filter(function(r){ return r && (!tom(r.vl) || !tom(r.hl)); });
  if(!rader.length) return { status: 'fel', steg: 'ekvation', besked: BESKED.ekvationOlaslig.hint, gren: gren.id, per: per };
  var ekvFel = provaEkvation(u, gren, uttryck, rader[0]);
  if(ekvFel) return Object.assign({ status: 'fel', gren: gren.id, per: per }, ekvFel);

  // STEG 3 — balansmetoden
  var kedja = provaKedja(u, rader);
  if(kedja.steg) return Object.assign({ status: 'fel', gren: gren.id, per: per }, kedja);

  // STEG 4 — insättningen i elevens EGNA uttryck
  var x = kedja.losning, varden = {};
  MOD.nycklarAv(u).forEach(function(k){ varden[k] = EP.varde(uttryck[k], x, opts); });
  if(svar.insattning){
    var nycklar = MOD.nycklarAv(u), insFel = null;
    for(var i = 0; i < nycklar.length; i++){
      var k2 = nycklar[i], t = svar.insattning[k2], b = null;
      if(tom(t)) b = BESKED.svarSaknas.hint;
      else {
        var vr = vardeUr(t, opts);
        if(vr.fel === 'kedjebrott') b = BESKED.insattningKedja.hint;
        else if(vr.fel || Math.abs(vr.varde - varden[k2]) > 1e-6) b = BESKED.insattningFel.hint;
      }
      per.insattning[k2] = !b;
      if(b && !insFel) insFel = { status: 'fel', steg: 'insattning', del: k2, besked: b, gren: gren.id };
    }
    if(insFel) return Object.assign(insFel, { per: per });
  }

  // Följdfrågan (Area: / Omkrets:) — mellan balansmetoden och svaret
  if(u.foljdfraga){
    var mal = MOD.utvardera(u.foljdfraga.uttryck, sant.varden);
    var f = provaSvarsfalt(svar.foljd, mal, u.foljdfraga.enhet, opts);
    per.foljd = !f;
    if(f) return { status: 'fel', steg: 'foljd', besked: f.fel, enhetSaknas: !!f.enhetSaknas, gren: gren.id, per: per };
  }

  // STEG 5 — svaret: ett fält per del, alla delar besvaras alltid
  var svarDelar = u.svarDelar || MOD.nycklarAv(u), svarFalt = svar.svar || {}, svarFel = null;
  for(var s = 0; s < svarDelar.length; s++){
    var d = svarDelar[s];
    var r = provaSvarsfalt(svarFalt[d], sant.varden[d], u.enhet, opts);
    per.svar[d] = !r;
    if(r && !svarFel) svarFel = { status: 'fel', steg: 'svar', del: d, besked: r.fel, enhetSaknas: !!r.enhetSaknas, gren: gren.id };
  }
  if(svarFel) return Object.assign(svarFel, { per: per });

  return { status: 'ratt', steg: null, gren: gren.id, losning: x, varden: sant.varden, per: per };
}

// ══ METOD-RÄTTAREN — PILOT (order 2026-11-23): bara typen "Flera personer och saker" (typ 'delar'). ══════
// Rättar METODEN, inte en uppställning. Variabelvalet är fritt (Noah = x eller Ella = x). Bias: GODTA giltigt
// arbete — ett felaktigt "fel" är värre än ett uteblivet. Ingen symbolisk motor: uppgiftens entydiga lösning
// är känd ur modellen, och elevens rader prövas mot den.
//   · Delarna        rättas INTE (elevens egen uppställning; svaret fångar en felaktig).
//   · Ekvationen     godtas när den har en entydig lösning som är en av uppgiftens sanna delvärden (då är
//                    elevens x någon av delarna), och inte redan är löst ("x = 12" är svaret, inte ekvationen).
//   · Balansmetoden  giltig algebra: varje rad har samma lösning som raden ovanför, ingen upprepning, sista
//                    raden x = tal, och minst så många rader som ekvationen kräver (samma regler som förut).
//   · Sätt in värdet beräkningsrutan och värdet rättas mot elevens EGET x insatt i hennes eget uttryck.
//   · Svaret         rätt tal och rätt enhet per del. Står en dels namn i svaret eller som radens namn knyts
//                    svaret till den delen; annars godtas det för en del vars värde det har (en gång per del).
// Ut: { status, steg, besked, ekvation:t/f/null, rader:[t/f/null per ifylld kedjerad], delrader:[{berakning,
//       varde, svar, enhetSaknas}], foljd, x }. Ett omdöme null = obedömt (tom ruta, eller inget att pröva mot).
// Inte inskriven i KONVENTIONER än (Joachim låser modellen när piloten känns rätt).
var METOD_PILOT = { delar: true };
function arMetodRattning(u){ return !!(u && METOD_PILOT[u.typ]); }

function lika(a, b){ return a != null && b != null && Math.abs(a - b) < 1e-6; }
function smaOrd(s){ return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function ordFinns(text, ord){
  if(!ord) return false;
  var e = ord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^a-zåäö0-9])' + e + '([^a-zåäö0-9]|$)').test(text);
}

// svar = { rader:[{vl,hl}…] (rad 1 = ekvationen), delrader:[{ namn, uttryck, berakning|null, varde, svar }], foljd }
function rattaMetod(u, svar){
  svar = svar || {};
  var opts = parOpts(u), ut = { status: 'fel', steg: null, besked: '', ekvation: null, rader: [], delrader: [], foljd: null, x: null };
  function forstaFel(steg, besked){ if(!ut.steg){ ut.steg = steg; ut.besked = besked; } }

  // Uppgiftens sanna delvärden (alla grenar): elevens x ska vara ett av dem.
  var grenar = MOD.grenarAv(u), gren = null, sant = null, alla = [];
  grenar.forEach(function(g){
    var v = MOD.varden(u, g); if(v.fel) return;
    if(!gren){ gren = g; sant = v.varden; }
    Object.keys(v.varden).forEach(function(k){ alla.push(v.varden[k]); });
  });
  if(!sant) return { status: 'fel', steg: 'uppgift', besked: 'Uppgiften går inte att lösa entydigt.' };
  function arSant(x){ return alla.some(function(v){ return lika(v, x); }); }

  // ── EKVATIONEN + BALANSMETODEN ──
  var rader = (svar.rader || []).filter(function(r){ return r && (!tom(r.vl) || !tom(r.hl)); });
  var e0 = null, x = null, kedjaKlar = false;
  if(!rader.length) forstaFel('ekvation', BESKED.ekvationOlaslig.hint);
  else {
    var r0 = rader[0];
    e0 = (!tom(r0.vl) && !tom(r0.hl)) ? EP.parseEkvation(r0.vl, r0.hl, opts) : null;
    if(!e0){ ut.ekvation = false; forstaFel('ekvation', BESKED.ekvationOlaslig.hint); }
    else if(!EP.harUnikLosning(e0)){ ut.ekvation = false; e0 = null; forstaFel('ekvation', BESKED.ingenLosning.hint); }
    else if(EP.arLost(r0.vl, r0.hl, opts)){ ut.ekvation = false; e0 = null; forstaFel('ekvation', BESKED.ekvationLost.hint); }
    else {
      ut.ekvation = arSant(EP.losningAv(e0));
      if(!ut.ekvation) forstaFel('ekvation', BESKED.ekvationFel.hint);
    }
    // Kedjan: giltig algebra från elevens EGEN ekvation (också när ekvationen inte ger rätt lösning —
    // räknandet bedöms för sig, ett tidigt fel straffas inte två gånger).
    if(e0){
      var forra = e0, bruten = false;
      for(var i = 1; i < rader.length; i++){
        var ri = rader[i];
        var e = (!tom(ri.vl) && !tom(ri.hl)) ? EP.parseEkvation(ri.vl, ri.hl, opts) : null;
        var b = !e ? BESKED.radOlaslig.hint
              : !EP.sammaLosning(forra, e) ? BESKED.radFoljerEj.hint
              : EP.upprepar(rader[i - 1], ri) ? BESKED.upprepning.hint : null;
        if(b){ ut.rader[i] = false; forstaFel('balans', b); bruten = true; break; }
        ut.rader[i] = true; forra = e;
      }
      var sista = rader[rader.length - 1];
      if(!bruten){
        if(rader.length < 2 || !EP.arLost(sista.vl, sista.hl, opts)) forstaFel('balans', BESKED.ejLost.hint);
        else {
          var minst = EP.minstaAntalRader(rader[0].vl, rader[0].hl, opts);
          if(minst != null && rader.length < minst){ ut.rader[rader.length - 1] = false; forstaFel('balans', BESKED.forFaRader.hint); }
          else kedjaKlar = true;
        }
      }
      // ELEVENS x: sista radens värde när kedjan når x = tal, annars ekvationens lösning
      x = (!bruten && rader.length >= 2 && EP.arLost(sista.vl, sista.hl, opts)) ? EP.losningAv(forra) : EP.losningAv(e0);
    }
  }
  ut.rader[0] = ut.ekvation;
  ut.x = x;

  // ── SÄTT IN VÄRDET: elevens x i elevens eget uttryck ──
  var delrader = svar.delrader || [];
  delrader.forEach(function(d, i){
    var o = { berakning: null, varde: null, svar: null, enhetSaknas: false };
    var mal = (x != null && !tom(d.uttryck) && EP.parseSida(d.uttryck, opts)) ? EP.varde(d.uttryck, x, opts) : null;
    [['berakning', d.berakning], ['varde', d.varde]].forEach(function(p){
      if(p[1] == null || tom(p[1]) || mal == null) return;
      var vr = vardeUr(p[1], opts);
      o[p[0]] = !vr.fel && lika(vr.varde, mal);
      if(!o[p[0]]) forstaFel('insattning', vr.fel === 'kedjebrott' ? BESKED.insattningKedja.hint : BESKED.insattningFel.hint);
    });
    ut.delrader[i] = o;
  });

  // ── FÖLJDFRÅGAN (om uppgiften har en) ──
  if(u.foljdfraga && !tom(svar.foljd)){
    var f = provaSvarsfalt(svar.foljd, MOD.utvardera(u.foljdfraga.uttryck, sant), u.foljdfraga.enhet, opts);
    ut.foljd = !f; if(f) forstaFel('foljd', f.fel);
  }

  // ── SVARET: tal + enhet per del. Namn i svaret eller som radens namn knyter svaret till en del. ──
  var svarDelar = (u.svarDelar || MOD.nycklarAv(u)).map(function(k){
    var d = (u.delar || []).filter(function(x2){ return x2.nyckel === k; })[0];
    return { k: k, namn: smaOrd(d && d.namn), v: sant[k], tagen: false };
  });
  function bunden(d){
    var t = smaOrd(d.svar), n = smaOrd(d.namn);
    var h = svarDelar.filter(function(p){ return p.namn && ordFinns(t, p.namn); });
    if(h.length === 1) return h[0];
    if(n){
      h = svarDelar.filter(function(p){ return p.namn === n; }); if(h.length === 1) return h[0];
      if(n.length === 1){ h = svarDelar.filter(function(p){ return p.namn.charAt(0) === n; }); if(h.length === 1) return h[0]; }
    }
    return null;
  }
  // Namnen ur svarstexten INNAN tal och enhet läses: "7A 25" är 25 (inte 7), och "kulor i varje påse 18"
  // bär ingen enhet bara för att delens namn innehåller ordet. Delarnas namn och radens eget namn.
  function utanNamn(d){
    var t = smaOrd(d.svar), namnen = svarDelar.map(function(p){ return p.namn; }).concat([smaOrd(d.namn)])
      .filter(Boolean).sort(function(a, b){ return b.length - a.length; });
    namnen.forEach(function(n){
      var e = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      t = t.replace(new RegExp('(^|[^a-zåäö0-9])' + e + '(?=[^a-zåäö0-9]|$)', 'g'), '$1 ');
    });
    return t.replace(/^[\s:=–-]+/, '').trim();
  }
  function provaDel(d, p, o){
    var r = provaSvarsfalt(utanNamn(d), p.v, u.enhet, opts);
    o.svar = !r; o.enhetSaknas = !!(r && r.enhetSaknas); p.tagen = true;
    if(r) forstaFel('svar', r.fel);
  }
  var ifyllda = 0;
  // först de svar som namnger sin del, sedan de övriga mot en ledig del med samma värde
  [true, false].forEach(function(forstVarvet){
    delrader.forEach(function(d, i){
      if(tom(d.svar)) return;
      var o = ut.delrader[i], p = bunden(d);
      if(forstVarvet){ if(p){ ifyllda++; provaDel(d, p, o); } return; }
      if(p || o.svar !== null) return;
      ifyllda++;
      var vr = vardeUr(utanNamn(d), opts);
      var ledig = svarDelar.filter(function(q){ return !q.tagen && !vr.fel && lika(q.v, vr.varde); })[0];
      if(ledig) provaDel(d, ledig, o);
      else { o.svar = false; forstaFel('svar', vr.fel === 'kedjebrott' ? BESKED.insattningKedja.hint : BESKED.svarTalFel.hint); }
    });
  });
  if(ifyllda < svarDelar.length) forstaFel('svar', BESKED.svarSaknas.hint);

  var rattDelar = ut.delrader.every(function(o){ return o.berakning !== false && o.varde !== false && o.svar !== false; });
  if(ut.ekvation === true && kedjaKlar && rattDelar && ut.foljd !== false && !ut.steg &&
     (!u.foljdfraga || ut.foljd === true)) ut.status = 'ratt';
  return ut;
}

var API = { ratta: ratta, BESKED: BESKED, provaUttryck: provaUttryck, provaEkvation: provaEkvation,
            provaKedja: provaKedja, talUr: talUr, harEnhet: harEnhet,
            rattaMetod: rattaMetod, arMetodRattning: arMetodRattning, METOD_PILOT: METOD_PILOT };
if(typeof window !== 'undefined') window.ProbRattare = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
