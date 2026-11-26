/* nya-tal.js — NYA TAL EFTER BANKEN (KONVENTIONER "Arbetssidan", METODTRÄNING; Joachim 2026-11-25).
   "I ett räknelöv är de författade uppgifterna mallar. Drillen serverar först banken i ordning. Därefter ger 'Nytt blad'
   en uppgift med samma form som en mall (samma antal termer, samma räknesätt, samma svarsform) och nya tal inom
   mallarnas band: talen håller sig inom lövets talregler och mellan bankens minsta och största. Aldrig svårare än
   banken; svårare = nästa författade nivå (takregeln)."

   DELAD: källregistret (k3-forfattad-kalla.js) ger varje källa vars löv bär `mall` en nasta(i) härifrån — samma
   mekanism för d1:s och d3:s räknelöv. Källan lämnar bara data:
     mall = { ref, mallar: [{ uttryck, x? }], regler: { koef, konst, faktor, varde: [min, max] }, bygg(ny) → blad }
   uttryck är mallens text (ASCII-minus, som bladens data); x är värdet i en "förenkla och beräkna" (tal eller karta).

   SAMMA FORM: mallens text behålls tecken för tecken — bara talen byts. Talens ROLL avgör bandet:
     faktor  talet framför en parentes          koef  talet framför en bokstav          konst  övriga tal
     varde   insättningsvärdet (x)
   Bandet = lövets talregel ∩ [bankens minsta, bankens största] för rollen. En koefficient eller faktor blir aldrig 1
   (den skrivs inte ut — då vore formen en annan), inte heller ett tal intill · eller / (gånger 1 är en annan uppgift),
   och inget tal blir 0. Ett insättningsvärde behåller sina decimaler; x = 0 i mallen förblir 0 (2026-11-26, d1).
   SAMMA SVARSFORM: det förenklade svaret har samma termer med samma tecken som mallens svar. En parentes med bara tal
   behåller sitt tecken (17 − (8 − 3) blir aldrig 17 − (3 − 8)).
   ALDRIG SVÅRARE: inget tal i svaret, och inget beräknat värde, är större (till beloppet) än bankens största.
   Uppgiften får inte vara en av bankens eller någon av de tio senaste nya.

   Talen dras ur en slump som SÅS med lövet och bladnumret: nasta(i) ger samma uppgift varje gång den frågas (drillen
   frågar efter blad i + 1 för att veta om knappen ska visas). Hittas ingen uppgift som håller reglerna ges null — då
   visas ingen knapp, och inget dåligt blad serveras. Node + webbläsare. Ingen nätväg. */
(function(){
'use strict';

/* ── LINJÄRT UTTRYCK: { '': konstant, x: koef, … } ─────────────────────────────────────────────── */
function tal(s){ return parseFloat(String(s).replace(',', '.')); }
function rund(v){ return Math.round(v * 1e9) / 1e9; }
function tokens(s){
  var t = [], re = /\s*(\d+(?:,\d+)?|[a-zåäö]|[-−+·*×\/()])/gi, m, pos = 0;
  s = String(s);
  while(pos < s.length){
    re.lastIndex = pos; m = re.exec(s);
    if(!m || m.index !== pos){ if(/\s/.test(s[pos])){ pos++; continue; } throw new Error('NyaTal: kan inte läsa "' + s + '"'); }
    var x = m[1]; pos = re.lastIndex;
    if(/^\d/.test(x)) t.push({ t: 'n', v: tal(x) });
    else if(/^[a-zåäö]$/i.test(x)) t.push({ t: 'v', v: x.toLowerCase() });
    else t.push({ t: 'o', v: x === '−' ? '-' : (x === '×' || x === '*') ? '·' : x });
  }
  return t;
}
function konstAv(p){ var k = Object.keys(p).filter(function(x){ return x !== '' && p[x] !== 0; }); return k.length ? null : (p[''] || 0); }
function plus(a, b, s){ var r = {}; Object.keys(a).forEach(function(k){ r[k] = a[k]; });
  Object.keys(b).forEach(function(k){ r[k] = rund((r[k] || 0) + s * b[k]); }); return r; }
function skala(a, c){ var r = {}; Object.keys(a).forEach(function(k){ r[k] = rund(a[k] * c); }); return r; }
function poly(s){
  var t = tokens(s), i = 0;
  function titta(){ return t[i]; }
  function uttryck(){
    var a = term();
    while(titta() && titta().t === 'o' && (titta().v === '+' || titta().v === '-')){ var op = t[i++].v; a = plus(a, term(), op === '+' ? 1 : -1); }
    return a;
  }
  function term(){
    var a = faktor();
    for(;;){
      var n = titta(); if(!n) break;
      if(n.t === 'o' && (n.v === '·' || n.v === '/')){
        i++; var b = faktor(), kb = konstAv(b), ka = konstAv(a);
        if(n.v === '/'){ if(kb === null || kb === 0) throw new Error('NyaTal: division med uttryck'); a = skala(a, 1 / kb); }
        else if(kb !== null) a = skala(a, kb); else if(ka !== null) a = skala(b, ka); else throw new Error('NyaTal: inte linjärt');
      } else if(n.t === 'v' || (n.t === 'o' && n.v === '(')){      // underförstådd multiplikation: 3x, 2(x + 1)
        var c = faktor(), kc = konstAv(c), kaa = konstAv(a);
        if(kaa !== null) a = skala(c, kaa); else if(kc !== null) a = skala(a, kc); else throw new Error('NyaTal: inte linjärt');
      } else break;
    }
    return a;
  }
  function faktor(){
    var n = t[i++];
    if(!n) throw new Error('NyaTal: uttrycket tar slut');
    if(n.t === 'n') return { '': n.v };
    if(n.t === 'v'){ var p = {}; p[n.v] = 1; return p; }
    if(n.v === '-') return skala(faktor(), -1);
    if(n.v === '(') { var a = uttryck(); if(!t[i] || t[i].v !== ')') throw new Error('NyaTal: parentes'); i++; return a; }
    throw new Error('NyaTal: oväntat ' + n.v);
  }
  var r = uttryck();
  if(i < t.length) throw new Error('NyaTal: rest i "' + s + '"');
  Object.keys(r).forEach(function(k){ if(r[k] === 0 && k !== '') delete r[k]; });
  if(!r['']) delete r[''];
  return r;
}
function varde(p, x){
  var s = p[''] || 0;
  Object.keys(p).forEach(function(k){ if(k) s += p[k] * (typeof x === 'object' ? x[k] : x); });
  return rund(s);
}
// Talet i skrift: decimalkomma, inga nollor på slutet.
function talUt(v){ return String(rund(v)).replace('.', ','); }
/* SVARET i bokstavsordning med siffertermen sist (KONVENTIONER §3), ASCII-minus som bladens data: "-2x + 5y", "4x - 3". */
function svarAv(p){
  var k = Object.keys(p).filter(function(x){ return x; }).sort();
  if(p['']) k.push('');
  if(!k.length) return '0';
  return k.map(function(x, j){
    var c = p[x], a = Math.abs(c), s = (x && a === 1) ? x : talUt(a) + x;
    return j === 0 ? (c < 0 ? '-' + s : s) : (c < 0 ? ' - ' : ' + ') + s;
  }).join('');
}
// Termerna och deras tecken: "x+,y-,+" — svarsformen.
function form(p){ return Object.keys(p).sort().map(function(k){ return k + (p[k] < 0 ? '-' : '+'); }).join(','); }

/* ── TALEN I MALLEN och deras roller ──────────────────────────────────────────────────────── */
function talIMall(s){
  var ut = [], re = /\d+(?:,\d+)?/g, m;
  while((m = re.exec(s))){
    var efter = s.slice(m.index + m[0].length).replace(/^\s+/, '')[0] || '';
    var fore = s.slice(0, m.index);
    if(/[a-zåäö\d,]$/i.test(fore)) continue;                // del av något annat (säkerhetsnät)
    // Ett tal intill · eller / multipliceras eller divideras: blir det 1 är uppgiften en annan (3 · (x + 2) → 1 · (x + 2)).
    var vidMult = /[·\/]\s*$/.test(fore) || efter === '·' || efter === '/';
    ut.push({ i: m.index, n: m[0].length, v: tal(m[0]), dec: (m[0].split(',')[1] || '').length, vidMult: vidMult,
              roll: efter === '(' ? 'faktor' : /[a-zåäö]/i.test(efter) ? 'koef' : 'konst' });
  }
  return ut;
}
// Parenteser med bara tal: deras värden (tecknet ska behållas).
function talParenteser(s){
  var ut = [], re = /\(([^()a-zåäö]*)\)/gi, m;
  while((m = re.exec(s))){ try { var p = poly(m[1]); if(konstAv(p) !== null) ut.push(konstAv(p)); } catch(e){} }
  return ut;
}
function vardenAv(x){ return x == null ? [] : (typeof x === 'object' ? Object.keys(x).map(function(k){ return tal(x[k]); }) : [tal(x)]); }
function decAv(v){ return (String(rund(tal(v))).split('.')[1] || '').length; }

/* ── SLUMPEN, sådd med lövet och bladnumret ───────────────────────────────────────────────── */
function hash(s){ var h = 2166136261; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function slump(fro){ var a = fro >>> 0; return function(){ a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ── BANDET: lövets talregel ∩ bankens minsta–största, per roll ───────────────────────────── */
function band(mall){
  var b = {}, maxSvar = 0, maxVarde = 0;
  function in_(roll, v){ var x = b[roll] || (b[roll] = [Infinity, -Infinity]); x[0] = Math.min(x[0], v); x[1] = Math.max(x[1], v); }
  mall.mallar.forEach(function(m){
    talIMall(m.uttryck).forEach(function(t){ in_(t.roll, t.v); if(t.dec) in_(t.roll + '.' + t.dec, t.v); });
    // x = 0 behålls som det är (forsok) och dras aldrig — det räknas inte in i bandet för de andra värdena.
    vardenAv(m.x).forEach(function(v){ if(v === 0) return; in_('varde', v); if(decAv(v)) in_('varde.' + decAv(v), v); });
    var p = poly(m.uttryck);
    Object.keys(p).forEach(function(k){ maxSvar = Math.max(maxSvar, Math.abs(p[k])); });
    if(m.x != null) maxVarde = Math.max(maxVarde, Math.abs(varde(p, m.x)));
  });
  var r = mall.regler || {};
  Object.keys(b).forEach(function(nyckel){ var roll = nyckel.split('.')[0];
    if(r[roll]){ b[nyckel][0] = Math.max(b[nyckel][0], r[roll][0]); b[nyckel][1] = Math.min(b[nyckel][1], r[roll][1]); } });
  return { roll: b, maxSvar: maxSvar, maxVarde: maxVarde };
}
// Ett decimaltal förblir ett decimaltal med lika många decimaler (0,4 blir aldrig 2 eller 0,5 → 0,50).
function dra(rnd, lo, hi, dec, inteEtt){
  var steg = Math.pow(10, -dec), a = Math.ceil(lo / steg - 1e-9), z = Math.floor(hi / steg + 1e-9);
  if(z < a) return null;
  for(var f = 0; f < 40; f++){
    var n = a + Math.floor(rnd() * (z - a + 1)), v = rund(n * steg);
    if(dec > 0 && n % 10 === 0) continue;
    if(v !== 0 && !(inteEtt && v === 1)) return v;
  }
  return null;
}

/* EN NY UPPGIFT ur mallen m. Ger { uttryck, svar, x, vardeSvar } eller null om försöket bryter mot reglerna. */
function forsok(m, B, rnd, extra){
  var tl = talIMall(m.uttryck), s = m.uttryck;
  for(var j = tl.length - 1; j >= 0; j--){
    var t = tl[j], bb = (t.dec && B.roll[t.roll + '.' + t.dec]) || B.roll[t.roll]; if(!bb) return null;
    var v = dra(rnd, bb[0], bb[1], t.dec, t.roll !== 'konst' || t.vidMult);
    if(v === null) return null;
    s = s.slice(0, t.i) + talUt(v) + s.slice(t.i + t.n);
  }
  var p, pm;
  try { p = poly(s); pm = poly(m.uttryck); } catch(e){ return null; }
  if(form(p) !== form(pm)) return null;                                               // samma svarsform
  if(Object.keys(p).some(function(k){ return Math.abs(p[k]) > B.maxSvar; })) return null;   // aldrig svårare
  var tp = talParenteser(s), tm = talParenteser(m.uttryck);
  if(tp.some(function(v, k){ return (v > 0) !== (tm[k] > 0) || v === 0; })) return null;
  var ny = { uttryck: s, svar: svarAv(p) };
  if(m.x != null){
    /* Insättningsvärdet: ett decimaltal förblir ett decimaltal med lika många decimaler (d1 R5: x = 3,5), ur bankens
       band för decimalvärdena; x = 0 i mallen förblir 0 — att sätta in 0 är den uppgiftens poäng (d1 R3). */
    var dx = function(v){ v = tal(v); if(v === 0) return 0; var d = decAv(v), bv = (d && B.roll['varde.' + d]) || B.roll.varde;
      return dra(rnd, bv[0], bv[1], d, false); };
    if(typeof m.x === 'object'){ ny.x = {}; Object.keys(m.x).forEach(function(k){ ny.x[k] = dx(m.x[k]); }); }
    else ny.x = dx(m.x);
    if(vardenAv(ny.x).some(function(v){ return v === null; })) return null;
    ny.vardeSvar = varde(p, ny.x);
    var vm = varde(pm, m.x), vn = ny.vardeSvar;
    // Samma tecken som mallens värde; är mallens värde 0 blir det nya 0 eller positivt. Ett heltal förblir ett heltal.
    if(vm === 0 ? vn < 0 : (vn === 0 || (vn > 0) !== (vm > 0))) return null;
    if(Math.abs(vn) > B.maxVarde || (vm === Math.round(vm) && vn !== Math.round(vn))) return null;
  }
  if(extra && extra(ny, m) === false) return null;                                     // lövets egen talregel
  return ny;
}

/* nasta(i) för en källa: banken först (instanser), sedan nya uppgifter ur mallarna. */
function medNasta(kalla){
  var M = kalla.mall; if(!M || !M.mallar || !M.mallar.length || !M.bygg) return kalla;
  var B = band(M), n = kalla.instanser.length, cache = {}, sett = {};
  // En uppgift är densamma om uttrycket och insättningsvärdet är desamma (x + x + x + x när x = 8 och x = 5 är två).
  function nyckel(x){ return x.uttryck.replace(/\s+/g, '') + (x.x != null ? '|' + JSON.stringify(x.x) : ''); }
  M.mallar.forEach(function(m){ sett[nyckel(m)] = 1; });
  /* MALLEN FÖRST (Joachim 2026-11-26): varje blad väljer en mall med lika stor chans för varje mall i banken och drar
     sedan tal tills en uppgift inom bandet hittas. Förr provades mallarna i tur och ordning med 400 dragningar var, och
     en mall som sällan ger en giltig uppgift hoppades över — den kom nästan aldrig (R1:s "(5 · 12)/4 + (3 · 14)/7": 0
     av 300). Ger en mall ingen uppgift efter DRAG dragningar tas nästa mall i bankens ordning, så att drillen inte tar
     slut; det räknas i statistik.tomma och rapporteras av spec-fuzzen. */
  var DRAG = 20000, S = kalla.statistik = { val: [], drag: [], tomma: [] };
  M.mallar.forEach(function(){ S.val.push(0); S.drag.push(0); S.tomma.push(0); });
  function ny(i){
    if(i in cache) return cache[i];
    var senaste = [];
    for(var j = Math.max(n, i - 10); j < i; j++){ var f = ny(j); if(f) senaste.push(nyckel(f)); }
    var rnd = slump(hash(String(M.ref) + ':' + i)), res = null, L = M.mallar.length;
    var forst = Math.floor(rnd() * L);                          // lika stor chans för varje mall
    for(var k = 0; k < L && !res; k++) res = dra1((forst + k) % L);   // k > 0 bara om mallen inte gav någon uppgift
    function dra1(idx){
      S.val[idx]++;
      for(var f2 = 0; f2 < DRAG; f2++){
        S.drag[idx]++;
        var x = forsok(M.mallar[idx], B, rnd, M.extra);
        if(x && !sett[nyckel(x)] && senaste.indexOf(nyckel(x)) < 0){ x.mall = idx; return x; }
      }
      S.tomma[idx]++;
      return null;
    }
    return (cache[i] = res);
  }
  kalla.nyUppgift = ny;
  kalla.nasta = function(i){
    if(i < n) return kalla.instanser[i];
    var x = ny(i); if(!x) return null;
    return { bokstav: String(i + 1), blad: M.bygg(x, M.mallar[x.mall]), ny: x };
  };
  return kalla;
}

var NyaTal = { poly: poly, svarAv: svarAv, form: form, talIMall: talIMall, band: band, medNasta: medNasta, varde: varde, talUt: talUt };
if(typeof window !== 'undefined') window.NyaTal = NyaTal;
if(typeof module !== 'undefined' && module.exports) module.exports = NyaTal;
})();
