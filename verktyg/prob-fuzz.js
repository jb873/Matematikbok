/* prob-fuzz.js — GRIND för problemlösningens rättare (order 2026-09-23).

   Rättaren prövas UTAN gränssnitt. Den bär störst risk i hela bygget, så den ska falla här om den
   inte håller — inte efter att fem blad byggts på den.

   BEVISEN (ordern):
     1. Hugo och Calle godkänns BÅDA vägarna (x som Hugo och x som Calle) — beviset på att rättaren
        prövar sammanhanget och inte ett förväntat svar.
     2. Den likbenta triangelns två lösningar godkänns båda.
     3. Varje uppgift i modellen har unik lösning (utom där flera är avsedda).
     4. Minst två olika x-val godkänns per uppgift där det är möjligt — lösningen BYGGS av fuzzen
        ur modellen (uttryck, ekvation, kedja, svar), inte handskriven per fall.
     5. Fel i olika steg ger besked på RÄTT steg.
     6. För få rader i steg 1 underkänns; två rader i en treradsuppgift underkänns; 18 = x underkänns.

   Uppgifterna nedan är PRÖVNINGSUPPGIFTER ur dokumentets fem varianter (plus en nivå 2-uppgift med
   parentes) — precis så många som bevisen kräver. Bladens innehåll byggs i en annan order.

   KÖR:  node verktyg/prob-fuzz.js            Exit 1 vid rött. Ingen DOM, ingen nätväg, ingen fil ändras. */
'use strict';
const EP  = require('../js/motor/ekvationer-balans/ekv-parser.js');
const MOD = require('../js/motor/problemlosning/prob-modell.js');
const R   = require('../js/motor/problemlosning/prob-rattare.js');

// ── PRÖVNINGSUPPGIFTER ────────────────────────────────────────────────────────────────────────
const UPPGIFTER = [
  { id: 'n1-instruktion', nod: 'alg-prob-instruktion:problem', niva: 1, variabel: 'x',
    text: 'Ett tal multipliceras med 8, sedan adderar man 15 till produkten och får 63. Vilket tal börjar man med?',
    delar: [{ nyckel: 'T', namn: 'talet' }], relationer: [], villkor: ['8·T + 15 = 63'],
    enhet: null, svarDelar: ['T'] },

  { id: 'n1-delar-hugo-calle', nod: 'alg-prob-delar:problem', niva: 1, variabel: 'x',
    text: 'Hugo och Calle är tillsammans 48 år. Calle är 12 år äldre än Hugo. Hur gamla är de?',
    delar: [{ nyckel: 'H', namn: 'Hugo' }, { nyckel: 'C', namn: 'Calle' }],
    relationer: ['C = H + 12'], villkor: ['H + C = 48'], enhet: 'år', svarDelar: ['H', 'C'] },

  { id: 'n1-delar-jorma', nod: 'alg-prob-delar:problem', niva: 1, variabel: 'x',
    text: 'Jorma har tre gånger så många t-tröjor som Mika. Tillsammans har de 76 stycken.',
    delar: [{ nyckel: 'J', namn: 'Jorma' }, { nyckel: 'M', namn: 'Mika' }],
    relationer: ['J = 3·M'], villkor: ['J + M = 76'], enhet: 'st', svarDelar: ['J', 'M'] },

  { id: 'n1-foljd', nod: 'alg-prob-foljd:problem', niva: 1, variabel: 'x',
    text: 'Tre på varandra följande tal har summan 168. Vilka är talen?',
    delar: [{ nyckel: 'A' }, { nyckel: 'B' }, { nyckel: 'C' }],
    relationer: ['B = A + 1', 'C = A + 2'], villkor: ['A + B + C = 168'], enhet: null, svarDelar: ['A', 'B', 'C'] },

  { id: 'n1-vinklar', nod: 'alg-prob-vinklar:problem', niva: 1, variabel: 'x',
    text: 'I en triangel är vinkel A 60 grader. Vinkel B är dubbelt så stor som vinkel C.',
    delar: [{ nyckel: 'A' }, { nyckel: 'B' }, { nyckel: 'C' }],
    relationer: ['A = 60', 'B = 2·C'], villkor: ['A + B + C = 180'], enhet: 'grader', svarDelar: ['A', 'B', 'C'] },

  { id: 'n1-omkrets', nod: 'alg-prob-omkrets:problem', niva: 1, variabel: 'x',
    text: 'I en rektangel är ena sidan 8 m längre än den andra. Omkretsen är 80 m.',
    delar: [{ nyckel: 'K', namn: 'kortsidan' }, { nyckel: 'L', namn: 'långsidan' }],
    relationer: ['L = K + 8'], villkor: ['2·K + 2·L = 80'], enhet: 'm', svarDelar: ['K', 'L'] },

  // NIVÅ 2: parentesen är svårigheten (kräver FAS 1-utökningen av parsern)
  { id: 'n2-area', nod: 'alg-prob-area:problem', niva: 2, variabel: 'a',
    text: 'Rektangelns area är 65 cm². Ena sidan är 5 cm, den andra 3a + 4. Vad är omkretsen?',
    delar: [{ nyckel: 'A', namn: 'a' }], relationer: [], villkor: ['5·(3·A + 4) = 65'],
    enhet: null, svarDelar: ['A'],
    foljdfraga: { etikett: 'Omkrets:', uttryck: '2·5 + 2·(3·A + 4)', enhet: 'cm' } },

  // FLERA GILTIGA LÖSNINGAR: 50° kan vara toppvinkeln eller en basvinkel
  { id: 'n1-likbent', nod: 'alg-prob-vinklar:problem', niva: 1, variabel: 'x',
    text: 'I en likbent triangel är en vinkel 50 grader. Hur stora är de övriga två?',
    delar: [{ nyckel: 'A', namn: 'den givna vinkeln' }, { nyckel: 'B' }, { nyckel: 'C' }],
    enhet: 'grader', svarDelar: ['A', 'B', 'C'],
    grenar: [
      { id: 'topp', relationer: ['A = 50', 'B = C'],  villkor: ['A + B + C = 180'] },
      { id: 'bas',  relationer: ['A = 50', 'B = 50'], villkor: ['A + B + C = 180'] }
    ] }
];

// ── BYGG EN KORREKT LÖSNING ur modellen, med en vald del som x ────────────────────────────────
// Koefficienterna är rationella tal: rendera dem som bråk (x/3), aldrig som avrundade decimaler.
function brak(v){
  for(let q = 1; q <= 1000; q++) if(Math.abs(v * q - Math.round(v * q)) < 1e-7) return { p: Math.round(v * q), q: q };
  return null;
}
function tal(v){
  const b = brak(v);
  if(b && b.q === 1) return String(b.p);
  if(b) return b.p + '/' + b.q;
  return String(Math.round(v * 1e6) / 1e6).replace('.', ',');
}
function linjartUttryck(a, b, v){
  let s = '';
  if(Math.abs(a) > 1e-9){
    const ba = brak(a);
    if(ba && ba.q === 1) s = (ba.p === 1) ? v : (ba.p === -1 ? '-' + v : ba.p + v);
    else if(ba) s = ((ba.p === 1) ? v : (ba.p === -1 ? '-' + v : ba.p + '·' + v)) + '/' + ba.q;
    else s = tal(a) + v;
  }
  if(Math.abs(b) > 1e-9){
    const t = tal(Math.abs(b));
    s += s ? ((b > 0 ? ' + ' : ' - ') + t) : (b > 0 ? t : '-' + t);
  }
  return s || '0';
}
// Övriga delar som funktioner av den valda: pinna den valda vid två värden och läs av lutningen.
function uttryckMed(u, gren, valdDel){
  const nycklar = MOD.nycklarAv(u), v = u.variabel || 'x';
  const sant = MOD.varden(u, gren); if(sant.fel) return null;
  const bas = sant.varden[valdDel];
  function losMed(pin){
    const rader = [];
    gren.relationer.forEach(e => { const r = MOD.ekvationsRad(e, nycklar); if(r) rader.push(r); });
    const p = MOD.ekvationsRad(valdDel + ' = ' + pin, nycklar); if(p) rader.push(p);
    const M = [];
    // Gauss via modellens egen lösare: bygg ett system med relationerna + pinnen
    return losSystem(rader, nycklar);
  }
  const u0 = losMed(bas), u1 = losMed(bas + 1);
  if(!u0 || !u1) return null;
  const ut = {};
  nycklar.forEach(k => {
    const a = u1[k] - u0[k], b = u0[k] - a * bas;
    ut[k] = linjartUttryck(a, b, v);
  });
  return ut;
}
// liten Gauss (samma som modellens, men returnerar bara värdena eller null)
function losSystem(rader, nycklar){
  const n = nycklar.length, EPS = 1e-9;
  const M = rader.map(r => nycklar.map(k => r.koef[k]).concat([r.hogerled]));
  let rad = 0; const pivot = [];
  for(let kol = 0; kol < n && rad < M.length; kol++){
    let best = -1, bast = EPS;
    for(let i = rad; i < M.length; i++) if(Math.abs(M[i][kol]) > bast){ bast = Math.abs(M[i][kol]); best = i; }
    if(best < 0) continue;
    [M[rad], M[best]] = [M[best], M[rad]];
    const p = M[rad][kol];
    for(let j = kol; j <= n; j++) M[rad][j] /= p;
    for(let i = 0; i < M.length; i++){
      if(i === rad) continue;
      const f = M[i][kol]; if(Math.abs(f) < EPS) continue;
      for(let j = kol; j <= n; j++) M[i][j] -= f * M[rad][j];
    }
    pivot.push(kol); rad++;
  }
  if(pivot.length < n) return null;
  const ut = {};
  pivot.forEach((kol, r) => { ut[nycklar[kol]] = Math.round(M[r][n] * 1e9) / 1e9; });
  return ut;
}
// Kedjan: villkoret med uttrycken insatt, samlad form, x isolerat — och minst så många rader som krävs.
function byggKedja(u, gren, uttryck){
  const v = u.variabel || 'x', opts = { variabel: v };
  const villkor = gren.villkor[0];
  const delar = villkor.split('=');
  let vl = delar[0], hl = delar[1];
  MOD.nycklarAv(u).forEach(k => {
    const re = new RegExp(k + '(?![0-9])', 'g');
    vl = vl.replace(re, '(' + uttryck[k] + ')'); hl = hl.replace(re, '(' + uttryck[k] + ')');
  });
  const rader = [{ vl: vl.trim(), hl: hl.trim() }];
  const L = EP.parseSida(vl, opts), H = EP.parseSida(hl, opts);
  const A = L.a - H.a, B = H.b - L.b, k = L.b - H.b;
  if(Math.abs(L.b) > 1e-9) rader.push({ vl: linjartUttryck(A, k, v), hl: tal(B + k) });
  if(Math.abs(Math.abs(A) - 1) > 1e-9) rader.push({ vl: linjartUttryck(A, 0, v), hl: tal(B) });
  rader.push({ vl: v, hl: tal(B / A) });
  const minst = EP.minstaAntalRader(rader[0].vl, rader[0].hl, opts);
  while(minst != null && rader.length < minst) rader.splice(rader.length - 1, 0, { vl: linjartUttryck(A, 0, v), hl: tal(B) });
  return rader;
}
function byggSvar(u, sant){
  const ut = {};
  (u.svarDelar || MOD.nycklarAv(u)).forEach(k => { ut[k] = tal(sant[k]) + (u.enhet ? ' ' + u.enhet : ''); });
  return ut;
}
function heltLosning(u, gren, valdDel){
  const uttryck = uttryckMed(u, gren, valdDel); if(!uttryck) return null;
  const sant = MOD.varden(u, gren); if(sant.fel) return null;
  const svar = { uttryck, rader: byggKedja(u, gren, uttryck), svar: byggSvar(u, sant.varden) };
  if(u.foljdfraga) svar.foljd = tal(MOD.utvardera(u.foljdfraga.uttryck, sant.varden)) + (u.foljdfraga.enhet ? ' ' + u.foljdfraga.enhet : '');
  return svar;
}

// ── PROV ──────────────────────────────────────────────────────────────────────────────────────
let fel = 0, prov = 0;
function ok(namn, villkor, extra){
  prov++;
  if(villkor) console.log('  ✓ ' + namn);
  else { console.log('  ✗ ' + namn + (extra ? '  — ' + extra : '')); fel++; }
}
function avSteg(res){ return res.status === 'ratt' ? 'ratt' : res.steg; }

console.log('PROB-FUZZ — rättaren prövad utan gränssnitt\n');

// BEVIS 3: modellen granskas
console.log('Modellen (unik lösning, läsbara villkor):');
UPPGIFTER.forEach(u => {
  const f = MOD.granska(u);
  ok('granska ' + u.id, f.length === 0, f.join(' · '));
});

// BEVIS 1 + 4: varje uppgift löst med VARJE del som x
console.log('\nElevens eget val av x (lösningen byggd ur modellen):');
UPPGIFTER.forEach(u => {
  MOD.grenarAv(u).forEach(gren => {
    const nycklar = MOD.nycklarAv(u);
    let godkanda = 0;
    nycklar.forEach(k => {
      const los = heltLosning(u, gren, k);
      if(!los) return;                                   // delen kan inte vara x (konstant del)
      const uttr = los.uttryck[k];
      if(String(uttr).trim() !== (u.variabel || 'x')) return;   // pinnen gav inte x självt
      const res = R.ratta(u, los);
      ok(u.id + (u.grenar ? '/' + gren.id : '') + ' · x = ' + k, res.status === 'ratt',
         JSON.stringify(res) + ' svar: ' + JSON.stringify(los));
      if(res.status === 'ratt') godkanda++;
    });
    const mojliga = nycklar.filter(k => { const l = heltLosning(u, gren, k); return l && String(l.uttryck[k]).trim() === (u.variabel || 'x'); }).length;
    if(mojliga >= 2) ok(u.id + (u.grenar ? '/' + gren.id : '') + ' · minst två olika x-val godkänns', godkanda >= 2, godkanda + ' av ' + mojliga);
  });
});

// BEVIS 2: den likbenta triangelns BÅDA lösningar
console.log('\nLikbenta triangeln — båda lösningarna:');
const lik = UPPGIFTER.filter(u => u.id === 'n1-likbent')[0];
const topp = R.ratta(lik, { uttryck: { A: '50', B: 'x', C: 'x' },
  rader: [{ vl: '50 + x + x', hl: '180' }, { vl: '2x', hl: '130' }, { vl: 'x', hl: '65' }],
  svar: { A: '50 grader', B: '65 grader', C: '65 grader' } });
ok('50° som toppvinkel (65 + 65)', topp.status === 'ratt' && topp.gren === 'topp', JSON.stringify(topp));
const bas = R.ratta(lik, { uttryck: { A: '50', B: '50', C: 'x' },
  rader: [{ vl: '50 + 50 + x', hl: '180' }, { vl: 'x', hl: '80' }],
  svar: { A: '50 grader', B: '50 grader', C: '80 grader' } });
ok('50° som basvinkel (50 + 80)', bas.status === 'ratt' && bas.gren === 'bas', JSON.stringify(bas));

// BEVIS 5 + 6: fel i olika steg ger besked på rätt steg
console.log('\nFel på rätt steg:');
const hc = UPPGIFTER.filter(u => u.id === 'n1-delar-hugo-calle')[0];
const RATT = { uttryck: { H: 'x', C: 'x + 12' },
  rader: [{ vl: '(x) + (x + 12)', hl: '48' }, { vl: '2x + 12', hl: '48' }, { vl: '2x', hl: '36' }, { vl: 'x', hl: '18' }],
  svar: { H: '18 år', C: '30 år' } };
function med(andring){ return Object.assign({}, RATT, andring); }

ok('hela lösningen är rätt', R.ratta(hc, RATT).status === 'ratt', JSON.stringify(R.ratta(hc, RATT)));
// Problemlösningen kapar mellanled: TRE rader i 2x + 12 = 48 räcker (en rad per operation).
ok('tre rader i 2x + 12 = 48 godkänns (kort läge)',
   R.ratta(hc, med({ rader: [{ vl: '2x + 12', hl: '48' }, { vl: '2x', hl: '36' }, { vl: 'x', hl: '18' }] })).status === 'ratt');
ok('fel tecken i uttrycket → steg 1', avSteg(R.ratta(hc, med({ uttryck: { H: 'x', C: 'x - 12' } }))) === 'uttryck');
ok('en del utan uttryck → steg 1',    avSteg(R.ratta(hc, med({ uttryck: { H: 'x', C: '' } }))) === 'uttryck');
ok('ingen del är x → steg 1',         avSteg(R.ratta(hc, med({ uttryck: { H: '18', C: '30' } }))) === 'uttryck');
ok('rätt räknat ur fel modellering → steg 1 (inte svar)',
   avSteg(R.ratta(hc, { uttryck: { H: 'x', C: 'x - 12' },
     rader: [{ vl: '(x) + (x - 12)', hl: '48' }, { vl: '2x - 12', hl: '48' }, { vl: '2x', hl: '60' }, { vl: 'x', hl: '30' }],
     svar: { H: '30 år', C: '18 år' } })) === 'uttryck');
ok('påhittad ekvation → steg 2',      avSteg(R.ratta(hc, med({ rader: [{ vl: '2x + 12', hl: '50' }, { vl: '2x', hl: '38' }, { vl: 'x', hl: '19' }] }))) === 'ekvation');
ok('18 = x som ekvation → steg 2',    avSteg(R.ratta(hc, med({ rader: [{ vl: '18', hl: 'x' }] }))) === 'ekvation');
ok('x = 18 som ekvation → steg 2',    avSteg(R.ratta(hc, med({ rader: [{ vl: 'x', hl: '18' }] }))) === 'ekvation');
ok('rad som inte följer → steg 3',    avSteg(R.ratta(hc, med({ rader: [{ vl: '2x + 12', hl: '48' }, { vl: '2x', hl: '30' }, { vl: 'x', hl: '15' }] }))) === 'balans');
ok('två rader i en treradsuppgift → steg 3',
   avSteg(R.ratta(hc, med({ rader: [{ vl: '2x + 12', hl: '48' }, { vl: 'x', hl: '18' }] }))) === 'balans');
ok('slutar utan x = tal → steg 3',    avSteg(R.ratta(hc, med({ rader: [{ vl: '2x + 12', hl: '48' }, { vl: '2x', hl: '36' }] }))) === 'balans');
ok('18 = x som SLUTRAD → steg 3',     avSteg(R.ratta(hc, med({ rader: [{ vl: '2x + 12', hl: '48' }, { vl: '2x', hl: '36' }, { vl: '18', hl: 'x' }] }))) === 'balans');
ok('fel insättning → steg 4',         avSteg(R.ratta(hc, med({ insattning: { H: '18', C: '28' } }))) === 'insattning');
ok('fel svarsvärde → steg 5',         avSteg(R.ratta(hc, med({ svar: { H: '18 år', C: '31 år' } }))) === 'svar');
ok('svar utan enhet → steg 5 med eget besked',
   (function(){ const r = R.ratta(hc, med({ svar: { H: '18', C: '30 år' } })); return r.steg === 'svar' && r.enhetSaknas === true; })());
ok('svar med text runt talet godtas', R.ratta(hc, med({ svar: { H: 'Hugo är 18 år', C: 'Calle är 30 år gammal' } })).status === 'ratt');
ok('en del utan svar → steg 5',       avSteg(R.ratta(hc, med({ svar: { H: '18 år', C: '' } }))) === 'svar');

// Följdfrågan (Area:/Omkrets:) rättas mellan balansmetoden och svaret
console.log('\nFöljdfråga (nivå 2, parentes i ekvationen):');
const area = UPPGIFTER.filter(u => u.id === 'n2-area')[0];
const areaLos = heltLosning(area, MOD.grenarAv(area)[0], 'A');
ok('area-uppgiften löst med parentes', areaLos && R.ratta(area, areaLos).status === 'ratt', JSON.stringify(areaLos && R.ratta(area, areaLos)));
ok('fel omkrets → steg foljd', areaLos && avSteg(R.ratta(area, Object.assign({}, areaLos, { foljd: '30 cm' }))) === 'foljd');

console.log('\n' + (fel ? '✗ PROB-FUZZ RÖD · ' : '✓ PROB-FUZZ GRÖN · ') + prov + ' prov · ' + fel + ' fel');
process.exit(fel ? 1 : 0);
