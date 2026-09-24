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
function provaKedja(u, rader){
  var opts = parOpts(u);
  var ifyllda = rader.filter(function(r){ return r && !tom(r.vl) && !tom(r.hl); });
  var forra = EP.parseEkvation(ifyllda[0].vl, ifyllda[0].hl, opts);
  for(var i = 1; i < ifyllda.length; i++){
    var e = EP.parseEkvation(ifyllda[i].vl, ifyllda[i].hl, opts);
    if(!e) return { steg: 'balans', rad: i + 1, besked: BESKED.radOlaslig.hint };
    if(!EP.sammaLosning(forra, e)) return { steg: 'balans', rad: i + 1, besked: BESKED.radFoljerEj.hint };
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

  // STEG 2 — ekvationen (rad 1 i kedjan)
  var rader = (svar.rader || []).filter(function(r){ return r && (!tom(r.vl) || !tom(r.hl)); });
  if(!rader.length) return { status: 'fel', steg: 'ekvation', besked: BESKED.ekvationOlaslig.hint, gren: gren.id };
  var ekvFel = provaEkvation(u, gren, uttryck, rader[0]);
  if(ekvFel) return Object.assign({ status: 'fel', gren: gren.id }, ekvFel);

  // STEG 3 — balansmetoden
  var kedja = provaKedja(u, rader);
  if(kedja.steg) return Object.assign({ status: 'fel', gren: gren.id }, kedja);

  // STEG 4 — insättningen i elevens EGNA uttryck
  var x = kedja.losning, varden = {};
  MOD.nycklarAv(u).forEach(function(k){ varden[k] = EP.varde(uttryck[k], x, opts); });
  if(svar.insattning){
    var nycklar = MOD.nycklarAv(u);
    for(var i = 0; i < nycklar.length; i++){
      var k2 = nycklar[i], t = svar.insattning[k2];
      if(tom(t)) return { status: 'fel', steg: 'insattning', del: k2, besked: BESKED.svarSaknas.hint, gren: gren.id };
      var vr = vardeUr(t, opts);
      if(vr.fel === 'kedjebrott')
        return { status: 'fel', steg: 'insattning', del: k2, besked: BESKED.insattningKedja.hint, gren: gren.id };
      if(vr.fel || Math.abs(vr.varde - varden[k2]) > 1e-6)
        return { status: 'fel', steg: 'insattning', del: k2, besked: BESKED.insattningFel.hint, gren: gren.id };
    }
  }

  // Följdfrågan (Area: / Omkrets:) — mellan balansmetoden och svaret
  if(u.foljdfraga){
    var mal = MOD.utvardera(u.foljdfraga.uttryck, sant.varden);
    var f = provaSvarsfalt(svar.foljd, mal, u.foljdfraga.enhet, opts);
    if(f) return { status: 'fel', steg: 'foljd', besked: f.fel, enhetSaknas: !!f.enhetSaknas, gren: gren.id };
  }

  // STEG 5 — svaret: ett fält per del, alla delar besvaras alltid
  var svarDelar = u.svarDelar || MOD.nycklarAv(u), svarFalt = svar.svar || {};
  for(var s = 0; s < svarDelar.length; s++){
    var d = svarDelar[s];
    var r = provaSvarsfalt(svarFalt[d], sant.varden[d], u.enhet, opts);
    if(r) return { status: 'fel', steg: 'svar', del: d, besked: r.fel, enhetSaknas: !!r.enhetSaknas, gren: gren.id };
  }

  return { status: 'ratt', steg: null, gren: gren.id, losning: x, varden: sant.varden };
}

var API = { ratta: ratta, BESKED: BESKED, provaUttryck: provaUttryck, provaEkvation: provaEkvation,
            provaKedja: provaKedja, talUr: talUr, harEnhet: harEnhet };
if(typeof window !== 'undefined') window.ProbRattare = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
