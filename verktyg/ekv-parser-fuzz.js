/* ekv-parser-fuzz.js — balansmetodens PARSER efter tillägget för åttans Ekvationer steg 1
   (order 2026-10-21). Parsern saknade skyddsnät; det här är nätet, och det kördes FÖRE bygget.

   BENEN
     ORÖRT    allt i ekv-parser.js före tillägget är byte för byte detsamma som i e6a9554 (sista
              versionen före tillägget). Prövas på ett fäst md5 av texten, radsluten normaliserade.
              Det är beviset för att sjuan och problemlösningen tolkar exakt som förut: deras anrop
              går bara till de funktionerna.
     PARSER   40 000 slumpade ekvationer av steg 1:s former — x i nämnaren (12/x, 1/(2x), 1/x + 3/(2x)),
              bråk- och decimalkoefficienter, x på båda sidor, "multiplicera båda leden med x"-rader,
              tal = x — prövade mot ett ORAKEL: exakt bråkräkning med BigInt, skriven här och oberoende
              av parsern. Dessutom former som MÅSTE avvisas (x·x, 1/x · 1/x, 1/(x + 1), två bokstäver)
              och andragrad (x + 1/x = 2). Varje dragning ska ge samma lösningsmängd som oraklet.
     TERMER   upprepning och vändning (delas av kedjerättaren och problemlösningen): en tabell med
              fall som ska och inte ska slå till — negativ verifiering i samma körning.
     RADKRAV  (kommer med datafilen) · FACIT (kommer med datafilen)

   Deterministisk slump. Noll nätväg. Exit 1 vid brott.
     node verktyg/ekv-parser-fuzz.js [--n 40000] */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
// EKV_PARSER (miljövariabel) pekar om parsern — för negativ verifiering mot en trasig KOPIA.
const KALLA = process.env.EKV_PARSER ? path.resolve(process.env.EKV_PARSER) : path.join(ROOT, 'js/motor/ekvationer-balans/ekv-parser.js');
const EP = require(KALLA);
const nI = process.argv.indexOf('--n'), N = nI >= 0 ? parseInt(process.argv[nI + 1], 10) : 40000;

let brott = 0;
function fall(ben, text){ brott++; console.log('  ✗ ' + ben + ': ' + text); }

// ── ORÖRT ────────────────────────────────────────────────────────────────────────────────────────
// md5 av ekv-parser.js i e6a9554 fram till "var API = {", med LF-radslut. Samma text ska stå före
// tilläggets markör i dag.
const ORORT_MD5 = '8128e57301705650ff0ed035e68455e2', MARKOR = '/* ══ TILLÄGGET';
(function(){
  const s = fs.readFileSync(KALLA, 'utf8').replace(/\r\n/g, '\n'), i = s.indexOf(MARKOR);
  if(i < 0){ fall('ORÖRT', 'markören för tillägget saknas i ekv-parser.js'); return; }
  const md5 = crypto.createHash('md5').update(s.slice(0, i), 'utf8').digest('hex');
  console.log('ORÖRT   ' + (md5 === ORORT_MD5 ? '✓' : '✗') + ' texten före tillägget: md5 ' + md5 + (md5 === ORORT_MD5 ? ' = e6a9554' : ' ≠ ' + ORORT_MD5));
  if(md5 !== ORORT_MD5) fall('ORÖRT', 'det befintliga i parsern har ändrats');
})();

// ── ORAKLET: exakta bråk (BigInt) ────────────────────────────────────────────────────────────────
function sgd(a, b){ a = a < 0n ? -a : a; b = b < 0n ? -b : b; while(b){ const t = a % b; a = b; b = t; } return a; }
function Q(p, q){ if(q === undefined) q = 1n; if(q === 0n) throw new Error('noll'); if(q < 0n){ p = -p; q = -q; } const g = sgd(p, q) || 1n; return { p: p / g, q: q / g }; }
const add = (a, b) => Q(a.p * b.q + b.p * a.q, a.q * b.q), sub = (a, b) => Q(a.p * b.q - b.p * a.q, a.q * b.q);
const mul = (a, b) => Q(a.p * b.p, a.q * b.q), div = (a, b) => Q(a.p * b.q, a.q * b.p);
const arNoll = r => r.p === 0n, lika = (a, b) => a.p === b.p && a.q === b.q;
function talQ(s){ const d = s.replace(',', '.').split('.'); const dec = d[1] || ''; return Q(BigInt(d[0] + dec), 10n ** BigInt(dec.length)); }
// Värdet av ett uttryck (parserns skrivsätt) i x. Division med noll → kastar.
function varde(str, x, v){
  const s = str.replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/[·×]/g, '*'); let i = 0;
  const prim = () => { const c = s[i];
    if(c === '('){ i++; const r = utt(); if(s[i] !== ')') throw new Error('parentes'); i++; return r; }
    if(/[0-9]/.test(c)){ const st = i; while(i < s.length && /[0-9.,]/.test(s[i])) i++; return talQ(s.slice(st, i)); }
    if(c === v){ i++; return x; }
    throw new Error('tecken ' + c); };
  const fak = () => { if(s[i] === '-'){ i++; const f = fak(); return Q(-f.p, f.q); } if(s[i] === '+'){ i++; return fak(); } return prim(); };
  const term = () => { let p = fak(); for(;;){ const c = s[i];
    if(c === '*' || c === '/'){ i++; const q = fak(); p = c === '*' ? mul(p, q) : div(p, q); }
    else if(c === '(' || c === v || (/[0-9]/.test(c) && !/[0-9.,]/.test(s[i - 1]))) p = mul(p, fak());
    else return p; } };
  const utt = () => { let p = term(); for(;;){ if(s[i] === '+'){ i++; p = add(p, term()); } else if(s[i] === '-'){ i++; p = sub(p, term()); } else return p; } };
  const r = utt(); if(i !== s.length) throw new Error('rest'); return r;
}
// f(x) = a·x + b + c/x ur tre punkter, kontrollerad i två till. null = inte av formen.
function form(f){
  const P = [1n, 2n, 3n].map(t => f(Q(t)));
  const d21 = sub(P[1], P[0]), d32 = sub(P[2], P[1]);          // a − c/2 = d21 · a − c/6 = d32
  const c = div(sub(d21, d32), Q(-1n, 3n)), a = add(d21, div(c, Q(2n))), b = sub(sub(P[0], a), c);
  for(const t of [5n, -7n]){ const x = Q(t); if(!lika(f(x), add(add(mul(a, x), b), div(c, x)))) return null; }
  return { a, b, c };
}
// Oraklets lösningsmängd för VL = HL, eller null (utanför: andragrad / inte av formen).
function orakel(vl, hl, v){
  const L = x => varde(vl, x, v), H = x => varde(hl, x, v);
  let nollUtesluten = false;
  try { L(Q(0n)); H(Q(0n)); } catch(e){ nollUtesluten = true; }
  const fL = form(L), fH = form(H);
  if(!fL || !fH) return null;
  const A = sub(fL.a, fH.a), B = sub(fL.b, fH.b), C = sub(fL.c, fH.c);
  if(!arNoll(A) && !arNoll(C)) return null;
  if(arNoll(A) && arNoll(C)) return arNoll(B) ? 'alla' : 'ingen';
  let x;
  if(arNoll(C)) x = div(Q(-B.p, B.q), A);
  else { if(arNoll(B)) return 'ingen'; x = div(Q(-C.p, C.q), B); }
  if(nollUtesluten && arNoll(x)) return 'ingen';
  return { x: Number(x.p) / Number(x.q) };
}

// ── GENERATORN: lagliga termer (varje mellanprodukt laglig för parsern) och skrivsätt ────────────
let fro = 20261021;
function slump(){ fro = (fro * 1103515245 + 12345) & 0x7fffffff; return fro / 0x7fffffff; }
function heltal(a, b){ return a + Math.floor(slump() * (b - a + 1)); }
function val(lista){ return lista[heltal(0, lista.length - 1)]; }
const DEC = ['0,2', '0,3', '0,5', '0,16', '0,8', '1,5', '2,5', '0,25', '0,1', '3,2'];
function koeff(){ const r = slump(); return r < 0.7 ? String(heltal(1, 15)) : val(DEC); }
function konst(){ const r = slump(); if(r < 0.55) return String(heltal(1, 99)); if(r < 0.8) return '(' + heltal(1, 12) + ')/(' + heltal(2, 15) + ')'; return val(DEC); }
function xTerm(v){
  const k = koeff(), r = slump();
  if(r < 0.35) return (k === '1' ? '' : k) + v;                                  // 6x · x · 0,2x
  if(r < 0.6) return '(' + (k === '1' ? '' : k) + v + ')/(' + heltal(2, 12) + ')'; // (2x)/(3) · (x)/(7)
  if(r < 0.75) return '(' + heltal(1, 9) + ')/(' + heltal(2, 9) + ')·' + v;        // (3)/(4)·x
  return k + '·' + v;
}
function invTerm(v){
  const r = slump(), t = heltal(1, 20);
  if(r < 0.4) return '(' + t + ')/(' + v + ')';                                    // 12/x
  if(r < 0.85) return '(' + t + ')/(' + heltal(2, 9) + v + ')';                    // 1/(2x)
  return '(' + t + ')/(' + val(['0,5', '0,2', '1,5']) + v + ')';
}
function led(v, slag){                                  // slag: 'lin' | 'inv' | 'blandat'
  const n = heltal(1, 3), ut = [];
  for(let i = 0; i < n; i++){
    const r = slump();
    if(slag === 'lin') ut.push(r < 0.5 ? xTerm(v) : konst());
    else if(slag === 'inv') ut.push(r < 0.55 ? invTerm(v) : konst());
    else ut.push(r < 0.35 ? xTerm(v) : r < 0.7 ? invTerm(v) : konst());
  }
  return ut.map((t, i) => i === 0 ? (slump() < 0.2 ? '-' + t : t) : (slump() < 0.5 ? ' + ' : ' - ') + t).join('');
}
// "Multiplicera båda leden med x / 6x / tal": hela ledet i parentes gånger en faktor.
function ganger(sida, v){
  const f = val([v, heltal(2, 12) + v, String(heltal(2, 30)), '(' + heltal(1, 6) + ')/(' + heltal(2, 7) + ')']);
  return slump() < 0.5 ? '(' + sida + ')·' + f : f + '(' + sida + ')';
}
const OLAGLIGA = [
  v => v + '·' + v + ' + 1', v => '(1)/(' + v + ')·(2)/(' + v + ')', v => '(3)/(' + v + ' + 1)',
  v => '(2)/((1)/(' + v + '))', v => '(' + v + '·' + v + ')/(' + v + ')', v => v + ' + ' + (v === 'x' ? 'y' : 'x')
];

let provade = 0, olika = 0, utanfor = 0, avvisade = 0, unika = 0, unikaNamnare = 0;
const exempel = [];
for(let n = 0; n < N; n++){
  const v = slump() < 0.88 ? 'x' : 'y', r = slump();
  let vl, hl, tvingadNull = false;
  if(r < 0.03){ vl = val(OLAGLIGA)(v); hl = konst(); tvingadNull = true; }
  else if(r < 0.08){
    // NOLLFALLEN: den linjära delen löses av x = 0. Med x i en nämnare är 0 utesluten (ingen lösning),
    // utan nämnare är 0 en giltig lösning. Båda sorterna, så att ingen av reglerna kan tappas tyst.
    const k = koeff(), t = konst(), inv = invTerm(v), medNamnare = slump() < 0.6;
    vl = (k === '1' ? '' : k) + v + ' + ' + (medNamnare ? inv : t);
    hl = medNamnare ? inv : t;
    if(slump() < 0.3) vl = '(' + v + ')/(' + v + ') + ' + (k === '1' ? '' : k) + v, hl = '1';
  }
  else {
    const slag = r < 0.35 ? 'lin' : r < 0.75 ? 'inv' : 'blandat';
    vl = led(v, slag); hl = led(v, slump() < 0.5 ? slag : 'lin');
    if(slump() < 0.2){ vl = ganger(vl, v); hl = ganger(hl, v); }
    if(slump() < 0.1){ const t = vl; vl = hl; hl = t; }
    // ibland en känd lösning: höger led justeras med en konstant så att x0 löser ekvationen
    if(slump() < 0.6){
      const x0 = Q(BigInt(heltal(-20, 20) || 3), BigInt(val([1, 1, 1, 2, 4, 5, 3])));
      try {
        const d = sub(varde(vl, x0, v), varde(hl, x0, v));
        if(!arNoll(d)) hl = hl + (d.p < 0n ? ' - ' : ' + ') + '(' + (d.p < 0n ? -d.p : d.p) + ')/(' + d.q + ')';
      } catch(e){}
    }
  }
  let vant;
  try { vant = tvingadNull ? null : orakel(vl, hl, v); } catch(e){ vant = undefined; }
  if(vant === undefined) continue;                     // oraklet kunde inte räkna (division med noll i en punkt)
  provade++;
  const fick = EP.losningsmangd(vl, hl, { variabel: v });
  const samma = (vant === null && fick === null) || (typeof vant === 'string' && vant === fick) ||
    (vant && fick && typeof vant === 'object' && typeof fick === 'object' && Math.abs(vant.x - fick.x) <= 1e-7 * Math.max(1, Math.abs(vant.x)));
  if(vant === null) (tvingadNull ? avvisade++ : utanfor++);
  else if(typeof vant === 'object'){ unika++; if(/\/\([^)]*[xy]\)/.test(vl + hl)) unikaNamnare++; }
  if(!samma){ olika++; if(exempel.length < 8) exempel.push(vl + ' = ' + hl + '  [' + v + ']  orakel ' + JSON.stringify(vant) + ' · parser ' + JSON.stringify(fick)); }
}
console.log('PARSER  ' + (olika ? '✗' : '✓') + ' ' + provade + ' dragningar mot oraklet · olika ' + olika
  + ' (unik lösning ' + unika + ', varav x i nämnaren ' + unikaNamnare + ' · utanför steg 1 ' + utanfor + ' · olagliga former avvisade ' + avvisade + ')');
exempel.forEach(e => console.log('      ' + e));
if(olika) fall('PARSER', olika + ' dragningar skiljer sig från oraklet');
if(provade < 30000) fall('PARSER', 'bara ' + provade + ' dragningar prövade (krav 30 000)');
if(avvisade < 100 || utanfor < 100) fall('PARSER', 'för få dragningar av de former som ska avvisas (' + avvisade + ' / ' + utanfor + ')');
if(unikaNamnare < 5000) fall('PARSER', 'för få dragningar med x i nämnaren och unik lösning (' + unikaNamnare + ', krav 5 000)');

// ── TERMER: upprepning och vändning ────────────────────────────────────────────────────────────────
(function(){
  const R = (s) => { const d = s.split('='); return { vl: d[0], hl: d[1] }; };
  const TAB = [
    // [före, rad, upprepar, vändning]
    ['6x + 10 = 64', '6x + 10 = 64', true, false],
    ['6x + 10 = 64', '10 + 6x = 64', true, false],          // omkastade termer: ingen operation
    ['6x + 10 = 64', '6x+10=64', true, false],
    ['6x + 10 = 64', '6x + 10 − 10 = 64 − 10', false, false],
    ['6x = 54', '54 = 6x', false, true],
    ['95 = 4x − 7', '4x − 7 = 95', false, true],
    ['95 = 4x − 7', '−7 + 4x = 95', false, true],
    ['25.5 = x', 'x = 25.5', false, true],
    ['x = 9', 'x = 9', true, false],
    ['1x = 9', 'x = 9', true, false],
    ['10x = 9', 'x = 9', false, false],
    ['(x)/(7)+4 = 9', '(x)/(7)+4−4 = 9−4', false, false],
    ['(x)/(7) = 5', '(x)/(7)·7 = 5·7', false, false],
    ['2x − 4 = 12', '2x + 4 = 12', false, false],           // tecknet ändrat: inte samma rad
    ['5 = 5', '5 = 5', true, false]
  ];
  let fel = 0;
  TAB.forEach(([f, r, u, vd]) => {
    const fu = EP.upprepar(R(f), R(r)), fv = EP.vandning(R(f), R(r));
    if(fu !== u || fv !== vd){ fel++; console.log('      ✗ "' + f + '" → "' + r + '": upprepar ' + fu + ' (väntat ' + u + '), vändning ' + fv + ' (väntat ' + vd + ')'); }
  });
  const slaRtill = TAB.filter(t => t[2] || t[3]).length, inte = TAB.length - slaRtill;
  console.log('TERMER  ' + (fel ? '✗' : '✓') + ' ' + TAB.length + ' fall: ' + slaRtill + ' ska slå till, ' + inte + ' ska inte (negativ verifiering) · fel ' + fel);
  if(fel) fall('TERMER', fel + ' fall gav fel dom');
})();

console.log(brott ? '\nRÖD · ' + brott + ' brott' : '\nGRÖN');
process.exit(brott ? 1 : 0);
