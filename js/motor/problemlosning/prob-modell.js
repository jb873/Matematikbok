/* prob-modell.js — UPPGIFTSMODELLEN för problemlösning (order 2026-09-23).

   Rättaren prövar elevens EGET val. Då kan uppgiften inte bära ett facit — den måste bära det som
   gör elevens val prövbart: delarna, hur de förhåller sig till varandra, och uppgiftens villkor.

   FORMEN (en uppgift):
     {
       id:'n1-delar-a', nod:'alg-prob-delar:problem', niva:1,
       variabel:'x',                              // elevens val är x; annars uppgiftens bokstav
       text:'Hugo och Calle är tillsammans 48 år. Calle är 12 år äldre än Hugo. Hur gamla är de?',
       delar:[ {nyckel:'H', namn:'Hugo'}, {nyckel:'C', namn:'Calle'} ],
       relationer:['C = H + 12'],                 // måste bli IDENTITETER med elevens uttryck insatta
       villkor:['H + C = 48'],                    // ekvationen ska följa ur dessa — utan dem kan
                                                  // rättaren inte veta om 48 följer eller är påhittat
       enhet:'år',                                // null = rent tal, ingen enhetskontroll
       svarDelar:['H','C'],                       // alla delar besvaras alltid (Joachims beslut 2)
       foljdfraga:null,                           // {etikett:'Area:', uttryck:'a·b', enhet:'cm²'}
       grenar:null                                // flera giltiga tolkningar (likbenta triangeln)
     }

   NYCKLAR: delarnas nycklar är VERSALER (H, C, T1), variabeln är gemen (x, a). Då kan uttryck
   substitueras in i relationerna utan att krocka med variabeln.

   GRENAR: en uppgift med flera giltiga lösningar (t.ex. "i en likbent triangel är en vinkel 50°" —
   50° kan vara toppvinkeln eller en basvinkel) bär flera grenar. Varje gren har egna relationer och
   villkor; rättaren väljer den gren elevens uttryck stämmer med och prövar resten mot den.

   FACIT RÄKNAS UT, det skrivs inte: relationerna + villkoren är ett linjärt ekvationssystem över
   delarna, och lösningen är uppgiftens sanna värden. Går systemet inte att lösa entydigt är det
   uppgiften som är fel, och granska() säger det innan något byggs på den.

   Ren data + aritmetik. Använder EkvParser (js/motor/ekvationer-balans/ekv-parser.js). */
(function(){
'use strict';

var EPS = 1e-9;
var EP = (typeof window !== 'undefined' && window.EkvParser) ||
         (typeof require === 'function' ? require('../ekvationer-balans/ekv-parser.js') : null);

// ── Sidor och ekvationer över DELARNA (flera obekanta) ────────────────────────────────────────
// Ett uttryck som "H + C" blir { koef:{H:1, C:1}, konst:0 } genom att räknas ut i punkter:
// konstanten är värdet när alla delar är 0, koefficienten skillnaden när EN del är 1.
function utvardera(str, varden){
  var s = String(str);
  Object.keys(varden).forEach(function(k){
    s = s.replace(new RegExp(k + '(?![0-9])', 'g'), '(' + varden[k] + ')');
  });
  var p = EP && EP.parseSida(s);
  return (p && Math.abs(p.a) < EPS) ? p.b : null;
}
function linjarForm(str, nycklar){
  var noll = {}; nycklar.forEach(function(k){ noll[k] = 0; });
  var konst = utvardera(str, noll);
  if(konst === null) return null;
  var koef = {}, fel = false;
  nycklar.forEach(function(k){
    var v = {}; nycklar.forEach(function(j){ v[j] = (j === k) ? 1 : 0; });
    var f = utvardera(str, v);
    if(f === null){ fel = true; return; }
    koef[k] = f - konst;
  });
  return fel ? null : { koef: koef, konst: konst };
}
// "VL = HL" → en rad i systemet: summa(koef · del) = konstant
function ekvationsRad(str, nycklar){
  var delar = String(str).split('=');
  if(delar.length !== 2) return null;
  var L = linjarForm(delar[0], nycklar), H = linjarForm(delar[1], nycklar);
  if(!L || !H) return null;
  var koef = {};
  nycklar.forEach(function(k){ koef[k] = L.koef[k] - H.koef[k]; });
  return { koef: koef, hogerled: H.konst - L.konst };
}

// ── Gauss-elimination: lösning + entydighet ───────────────────────────────────────────────────
function los(rader, nycklar){
  var n = nycklar.length;
  var M = rader.map(function(r){ return nycklar.map(function(k){ return r.koef[k]; }).concat([r.hogerled]); });
  var rad = 0, pivotKol = [];
  for(var kol = 0; kol < n && rad < M.length; kol++){
    var best = -1, bast = EPS;
    for(var i = rad; i < M.length; i++){ if(Math.abs(M[i][kol]) > bast){ bast = Math.abs(M[i][kol]); best = i; } }
    if(best < 0) continue;
    var tmp = M[rad]; M[rad] = M[best]; M[best] = tmp;
    var p = M[rad][kol];
    for(var j = kol; j <= n; j++) M[rad][j] /= p;
    for(var i2 = 0; i2 < M.length; i2++){
      if(i2 === rad) continue;
      var f = M[i2][kol];
      if(Math.abs(f) < EPS) continue;
      for(var j2 = kol; j2 <= n; j2++) M[i2][j2] -= f * M[rad][j2];
    }
    pivotKol.push(kol); rad++;
  }
  // motsägelse? (0 = k)
  for(var i3 = rad; i3 < M.length; i3++){
    var allaNoll = true;
    for(var j3 = 0; j3 < n; j3++) if(Math.abs(M[i3][j3]) > EPS) allaNoll = false;
    if(allaNoll && Math.abs(M[i3][n]) > EPS) return { fel: 'motsagelse' };
  }
  if(pivotKol.length < n) return { fel: 'flera-losningar' };
  var ut = {};
  pivotKol.forEach(function(kol, r){ ut[nycklar[kol]] = Math.round(M[r][n] * 1e9) / 1e9; });
  return { varden: ut };
}

// ── API ───────────────────────────────────────────────────────────────────────────────────────
function nycklarAv(u){ return (u.delar || []).map(function(d){ return d.nyckel; }); }
function grenarAv(u){
  if(u.grenar && u.grenar.length) return u.grenar.map(function(g, i){
    return { id: g.id || ('gren' + (i + 1)), relationer: g.relationer || u.relationer || [], villkor: g.villkor || u.villkor || [] };
  });
  return [{ id: 'enda', relationer: u.relationer || [], villkor: u.villkor || [] }];
}

// Uppgiftens sanna värden per gren (facit räknas ut ur modellen).
function varden(u, gren){
  var nycklar = nycklarAv(u);
  var rader = [];
  gren.relationer.concat(gren.villkor).forEach(function(e){
    var r = ekvationsRad(e, nycklar);
    if(r) rader.push(r);
  });
  if(rader.length !== gren.relationer.length + gren.villkor.length) return { fel: 'oläsbart-villkor' };
  return los(rader, nycklar);
}

// GRANSKNING — säger vad som är fel i uppgiften, innan något byggs på den.
function granska(u){
  var fel = [];
  if(!u.id) fel.push('id saknas');
  if(!u.nod) fel.push('nod saknas');
  if(!u.delar || !u.delar.length) fel.push('inga delar');
  var nycklar = nycklarAv(u);
  nycklar.forEach(function(k){ if(!/^[A-ZÅÄÖ][0-9]?$/.test(k)) fel.push('delnyckel måste vara versal: ' + k); });
  if(new Set(nycklar).size !== nycklar.length) fel.push('dubbel delnyckel');
  var v = (u.variabel || 'x');
  if(!/^[a-zåäö]$/.test(v)) fel.push('variabeln måste vara en gemen bokstav: ' + v);
  (u.svarDelar || nycklar).forEach(function(k){ if(nycklar.indexOf(k) < 0) fel.push('svarDel utan del: ' + k); });
  grenarAv(u).forEach(function(g){
    g.relationer.concat(g.villkor).forEach(function(e){
      if(!ekvationsRad(e, nycklar)) fel.push('oläsbart villkor (' + g.id + '): ' + e);
    });
    if(!g.villkor.length) fel.push('villkor saknas (' + g.id + ') — då kan ekvationen inte prövas');
    var lv = varden(u, g);
    if(lv.fel) fel.push('systemet går inte att lösa entydigt (' + g.id + '): ' + lv.fel);
  });
  if(u.foljdfraga && !u.foljdfraga.uttryck) fel.push('följdfrågan saknar uttryck');
  return fel;
}

// ── KANONISK LÖSNING ────────────────────────────────────────────────────────────────────────
// Koefficienterna är rationella: de skrivs som bråk (x/3), aldrig som avrundade decimaler —
// annars ger flyttalen uttryck som "0,333333333x + 1,9e-8", som ingen elev skriver.
function brak(v){
  for(var q = 1; q <= 1000; q++) if(Math.abs(v * q - Math.round(v * q)) < 1e-7) return { p: Math.round(v * q), q: q };
  return null;
}
function talStr(v){
  var b = brak(v);
  if(b && b.q === 1) return String(b.p);
  if(b) return b.p + '/' + b.q;
  return String(Math.round(v * 1e6) / 1e6).replace('.', ',');
}
function linjart(a, b, v){
  var s = '';
  if(Math.abs(a) > 1e-9){
    var ba = brak(a);
    if(ba && ba.q === 1) s = (ba.p === 1) ? v : (ba.p === -1 ? '-' + v : ba.p + v);
    else if(ba) s = ((ba.p === 1) ? v : (ba.p === -1 ? '-' + v : ba.p + '·' + v)) + '/' + ba.q;
    else s = talStr(a) + v;
  }
  if(Math.abs(b) > 1e-9){
    var t = talStr(Math.abs(b));
    s += s ? ((b > 0 ? ' + ' : ' - ') + t) : (b > 0 ? t : '-' + t);
  }
  return s || '0';
}
// Övriga delar som funktioner av den valda: pinna den valda vid två värden och läs av lutningen.
function uttryckMed(u, gren, valdDel){
  var nycklar = nycklarAv(u), v = u.variabel || 'x';
  var sant = varden(u, gren); if(sant.fel) return null;
  var bas = sant.varden[valdDel];
  function pinnat(pin){
    var rader = [];
    gren.relationer.forEach(function(e){ var r = ekvationsRad(e, nycklar); if(r) rader.push(r); });
    var p = ekvationsRad(valdDel + ' = ' + pin, nycklar); if(p) rader.push(p);
    var l = los(rader, nycklar);
    return l.fel ? null : l.varden;
  }
  var u0 = pinnat(bas), u1 = pinnat(bas + 1);
  if(!u0 || !u1) return null;
  var ut = {};
  nycklar.forEach(function(k){
    var a = u1[k] - u0[k], b = u0[k] - a * bas;
    ut[k] = linjart(a, b, v);
  });
  return ut;
}
// Hela lösningen: uttryck, ekvation, kedja (kort läge), värden och svar.
function losningsforslag(u, gren, valdDel){
  gren = gren || grenarAv(u)[0];
  var nycklar = nycklarAv(u), v = u.variabel || 'x';
  valdDel = valdDel || nycklar[0];
  var uttryck = uttryckMed(u, gren, valdDel);
  if(!uttryck || String(uttryck[valdDel]).trim() !== v){
    // den valda delen blev inte x självt (t.ex. en känd del) → pröva de övriga
    for(var i = 0; i < nycklar.length; i++){
      var kand = uttryckMed(u, gren, nycklar[i]);
      if(kand && String(kand[nycklar[i]]).trim() === v){ uttryck = kand; valdDel = nycklar[i]; break; }
    }
  }
  if(!uttryck) return null;
  var sant = varden(u, gren); if(sant.fel) return null;

  // ekvationen = villkoret med uttrycken insatta
  var delar = String(gren.villkor[0]).split('=');
  var vl = delar[0], hl = delar[1];
  nycklar.forEach(function(k){
    var re = new RegExp(k + '(?![0-9])', 'g');
    vl = vl.replace(re, '(' + uttryck[k] + ')'); hl = hl.replace(re, '(' + uttryck[k] + ')');
  });
  var EP2 = (typeof window !== 'undefined' && window.EkvParser) ||
            (typeof require === 'function' ? require('../ekvationer-balans/ekv-parser.js') : null);
  var L = EP2.parseSida(vl, { variabel: v }), H = EP2.parseSida(hl, { variabel: v });
  var A = L.a - H.a, B = H.b - L.b, k0 = L.b - H.b;
  var kedja = [];
  if(Math.abs(L.b) > 1e-9) kedja.push({ vl: linjart(A, k0, v), hl: talStr(B + k0) });
  if(Math.abs(Math.abs(A) - 1) > 1e-9) kedja.push({ vl: linjart(A, 0, v), hl: talStr(B) });
  kedja.push({ vl: v, hl: talStr(B / A) });

  var svar = {}, insattning = {};
  nycklar.forEach(function(k){
    insattning[k] = talStr(sant.varden[k]);
    svar[k] = talStr(sant.varden[k]) + (u.enhet ? ' ' + u.enhet : '');
  });
  return { valdDel: valdDel, uttryck: uttryck, ekvation: { vl: vl.trim(), hl: hl.trim() },
           kedja: kedja, varden: sant.varden, insattning: insattning, svar: svar, gren: gren.id };
}

var API = { losningsforslag: losningsforslag, uttryckMed: uttryckMed, linjart: linjart, talStr: talStr,
            varden: varden, granska: granska, grenarAv: grenarAv, nycklarAv: nycklarAv,
            linjarForm: linjarForm, ekvationsRad: ekvationsRad, utvardera: utvardera };
if(typeof window !== 'undefined') window.ProbModell = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
