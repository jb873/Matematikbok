/* gen-ak8-alg1.js — ÅTTANS ALGEBRAUPPGIFTER UR BANDET (order 2026-09-28).

   Åttans delkapitel 1 är sjuans uppgifter med andra tal och andra figurer. Generatorn läser
   talområdet och reglerna ur js/data/band-ak8-alg1.js — den bär dem inte själv. Två prov körs på
   varje dragning:

     1. EGENSKAPEN på raden ska hålla efter bytet (decimal förblir decimal, nollsvar förblir noll).
     2. Uppgiften får inte bli identisk med sjuans (BAND.SJUANS_PAR).

   Håller den inte, dras talen om. Efter ett tak på försök behålls sista dragningen och raden
   märks — hellre en märkt rad än en tyst identisk.

   Seedad: samma seed ger samma blad, så facit och figurer inte glider isär mellan körningar. */
(function(){
'use strict';

var B = (typeof window !== 'undefined' && window.BAND_AK8_ALG1)
     || (typeof require === 'function' ? require('../../data/band-ak8-alg1.js') : null);

// ── seedad slump (samma blad varje gång) ──
function rng(seed){
  var s = seed >>> 0;
  return function(){ s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function ri(r, a, b){ return a + Math.floor(r() * (b - a + 1)); }
function val(r, lista){ return lista[Math.floor(r() * lista.length)]; }
function sanera(s){ return String(s).replace(/[\s ]/g, '').replace(/[−–—]/g, '-').replace(/[·×]/g, '·'); }

// ── termsträng: 4x, x, 12y, −3x ──
function term(k, v){
  if(k === 1) return v;
  if(k === -1) return '−' + v;
  // minustecknet är U+2212 överallt eleven ser det — aldrig ASCII-bindestreck
  return String(k).replace('.', ',').replace(/^-/, '−') + v;
}
function led(k, v, forst){
  var t = term(Math.abs(k), v);
  if(forst) return (k < 0 ? '−' : '') + t;
  return (k < 0 ? ' − ' : ' + ') + t;
}
// Talet eleven SER: minustecknet är U+2212, decimaltecknet komma. Datan behåller talet som tal.
function talText(n){ return String(n).replace('.', ',').replace(/^-/, '−'); }
function konst(c, forst){
  if(forst) return String(c);
  return (c < 0 ? ' − ' : ' + ') + Math.abs(c);
}

// ── FLIK 4 · FÖRENKLA: a·v + b·v → (a+b)v, med varianter ──
function forenklaRad(r, variant, egenskap){
  if(variant === 'omkretsForenkla') return omkretsForenklaRad(r);
  if(variant === 'oppet')           return oppetRad(r);
  if(variant === 'pyramid')         return pyramidRad(r);
  if(variant === 'magisk')          return magiskRad(r);
  if(variant === 'sidor')           return sidorRad(r);
  var F = B.BAND.forenkla, v = val(r, ['x', 'y', 'a', 'b']);
  if(variant === 'summa'){
    var a = ri(r, F.koeff[0], F.koeff[1]), b = ri(r, F.koeff[0], F.koeff[1]);
    return { fraga: led(a, v, true) + led(b, v), svar: term(a + b, v) };
  }
  if(variant === 'differens'){
    var c = ri(r, 6, F.koeff[1] + 8), d = ri(r, F.koeff[0], c - 1);
    return { fraga: led(c, v, true) + led(-d, v), svar: term(c - d, v) };
  }
  if(variant === 'noll'){                       // EGENSKAP: svaret ska vara 0
    var e = ri(r, F.koeff[0], F.koeff[1]);
    return { fraga: led(e, v, true) + led(-e, v), svar: '0' };
  }
  if(variant === 'faktor'){
    var f = ri(r, 2, 9), g = ri(r, 2, 9);
    return { fraga: f + ' · ' + term(g, v), svar: term(f * g, v) };
  }
  if(variant === 'decimal'){                    // EGENSKAP: decimal · 10 flyttar decimaltecknet
    var tiondel = ri(r, 11, 49);
    while(tiondel % 10 === 0) tiondel = ri(r, 11, 49);   // aldrig ett helt tal: decimalen ÄR uppgiften
    return { fraga: String(tiondel / 10).replace('.', ',') + v + ' · 10', svar: term(tiondel, v) };
  }
  if(variant === 'tva'){
    // den första bokstaven i alfabetet står först i svaret — samma form eleven lärt sig i sjuan
    var par = (v === 'a' || v === 'b') ? ['a', 'b'] : ['x', 'y'];
    var v1 = par[0], v2 = par[1];
    var p = ri(r, 3, 9), q = ri(r, 2, p - 1), s1 = ri(r, 2, 8), s2 = ri(r, 2, 8);
    return { fraga: led(p, v1, true) + led(s1, v2) + led(-q, v1) + led(s2, v2),
             svar: term(p - q, v1) + led(s1 + s2, v2) };
  }
  if(variant === 'negativKoeff'){          // svaret får en NEGATIV koefficient: 8x − 5y + 3x + 2y
    var na = ri(r, 3, 9), nb = ri(r, 3, 9), nc = ri(r, 2, 9), nd = ri(r, 2, nb - 1);   // nb ≥ 3: annars blir skillnaden noll
    return { fraga: led(na, 'x', true) + led(-nb, 'y') + led(nc, 'x') + led(nd, 'y'),
             svar: term(na + nc, 'x') + led(nd - nb, 'y') };
  }
  if(variant === 'femTermer'){              // fem led, två variabler och en konstant
    var fa = ri(r, 2, 8), fb = ri(r, 2, 8), fc = ri(r, 1, fa - 1) || 1, fd = ri(r, 2, 8), fe = ri(r, 1, 9);
    return { fraga: led(fa, 'y', true) + led(fb, 'x') + led(-fc, 'y') + led(fd, 'x') + konst(fe),
             svar: term(fb + fd, 'x') + led(fa - fc, 'y') + konst(fe) };
  }
  if(variant === 'decimalFlera'){           // decimaler i flera termer, ofta negativt facit
    var T3 = (B.BAND.forenkla.nivaer && B.BAND.forenkla.nivaer[3].tiondelar) || [1, 9];
    var k = ri(r, 2, 8), P = ri(r, T3[0], T3[1]);
    // Koefficienten ska bli LITEN och ofta negativ (sjuans rad ger −0,1x). Skillnaden väljs FÖRST,
    // en till nio tiondelar med tecken, och D räknas fram ur den — då kan villkoret aldrig missas.
    var delta = ri(r, 1, 9) * (r() < 0.6 ? -1 : 1);       // oftare negativ koefficient
    var D = k * P - delta;
    if(D < 2){ delta = -Math.abs(delta); D = k * P - delta; }
    if(D % 10 === 0){ delta += (Math.abs(delta) >= 9 ? -1 : 1) * (delta < 0 ? -1 : 1); D = k * P - delta; }
    // konstanterna: båda med decimal, och de får inte ta ut varandra
    var C = ri(r, 2, 29), E = ri(r, 2, 29), varv = 0;
    while((C % 10 === 0) && varv++ < 40) C = ri(r, 2, 29);
    while((E === C || E % 10 === 0 || (C - E) % 10 === 0) && varv++ < 120) E = ri(r, 2, 29);
    var kv = (k * P - D) / 10, kon = (C - E) / 10;
    function dec(x){ return String(Math.round(x * 10) / 10).replace('.', ','); }
    return { fraga: k + ' · ' + dec(P / 10) + 'x' + ' + ' + dec(C / 10) + ' − ' + dec(D / 10) + 'x' + ' − ' + dec(E / 10),
             svar: (kv < 0 ? '−' : '') + dec(Math.abs(kv)) + 'x' + (kon < 0 ? ' − ' : ' + ') + dec(Math.abs(kon)) };
  }
  if(variant === 'parentesNeg'){             // negativ term i parentes, tre delar i svaret
    var pa = ri(r, 2, 7), pb = ri(r, 2, 8), pc = ri(r, 1, 9), pd = ri(r, 1, 5), pe = ri(r, 2, 8), pf = ri(r, 1, 12);
    while(pf === pc) pf = ri(r, 1, 12);
    return { fraga: '(−' + term(pa, 'x') + ')' + led(pb, 'y') + konst(pc) + led(-pd, 'x') + led(pe, 'y') + konst(-pf),
             svar: term(-(pa + pd), 'x') + led(pb + pe, 'y') + konst(pc - pf) };
  }
  // 'konstant': termer + konstanter
  var K = B.BAND.forenkla.konstant;
  var m1 = ri(r, 3, 9), m2 = ri(r, 2, m1 - 1);
  var k1 = ri(r, K[0] + 1, K[1]), k2 = ri(r, K[0], k1 - 1);   // k1 > k2, så konstanten aldrig tar ut sig
  return { fraga: led(m1, v, true) + konst(k1) + led(-m2, v) + konst(-k2),
           svar: term(m1 - m2, v) + konst(k1 - k2) };
}

// ── FLIK 3 · BERÄKNA: sätt in värdet ──
function beraknaRad(r, variant){
  if(variant === 'flerledEn')    return flerledRad(r, 'en');
  if(variant === 'flerledTva')   return flerledRad(r, 'tva');
  if(variant === 'flerledFigur') return flerledFigurRad(r);
  var Bk = B.BAND.berakna, v = val(r, ['x', 'y', 'a', 'b']);
  var k = ri(r, Bk.koeff[0], Bk.koeff[1]), c = ri(r, Bk.konstant[0], Bk.konstant[1]);
  var x = ri(r, Bk.varde[0], Bk.varde[1]);
  if(variant === 'tva'){
    var v2 = v === 'x' ? 'y' : 'x', k2 = ri(r, 2, 9), y = ri(r, 1, 9);
    while(y === x) y = ri(r, 1, 9);            // olika värden, annars går de inte att skilja åt
    return { fraga: term(k, v) + led(k2, v2), varden: v + ' = ' + x + ', ' + v2 + ' = ' + y,
             svar: k * x + k2 * y, svarText: talText(k * x + k2 * y) };
  }
  if(variant === 'minus'){
    return { fraga: term(k, v) + konst(-c), varden: v + ' = ' + x, svar: k * x - c, svarText: talText(k * x - c) };
  }
  return { fraga: term(k, v) + konst(c), varden: v + ' = ' + x, svar: k * x + c, svarText: talText(k * x + c) };
}

// ── FLIK 2 · SKRIVA: text → uttryck ──
function skrivaRad(r, variant){
  // bandets namn → typens egen funktion (ett ordförråd, en uppslagning)
  if(variant === 'valruta')     return valrutaRad(r);
  if(variant === 'strackfigur') return strackfigurRad(r);
  if(variant === 'paraIhop')    return paraIhopGrupp(r);
  if(variant === 'sammanlagd')  return sammanlagdRad(r);
  if(variant === 'prisKedja')   return prisKedjaGrupp(r);
  if(variant === 'omkrets')     return omkretsSkrivaRad(r);
  var S = B.BAND.skriva, v = val(r, ['x', 'a', 'b', 'y']);
  var n = ri(r, S.tal[0], S.tal[1]), k = ri(r, S.koeff[0], S.koeff[1]);
  if(variant === 'langre') return { fraga: n + ' cm längre', svar: v + ' + ' + n, varibel: v };
  if(variant === 'kortare') return { fraga: n + ' cm kortare', svar: v + ' − ' + n, varibel: v };
  if(variant === 'ganger') return { fraga: k + ' gånger så lång', svar: term(k, v), varibel: v };
  if(variant === 'halften') return { fraga: 'hälften så lång', svar: v + '/2', varibel: v };

  return { fraga: n + ' mer än ' + v, svar: v + ' + ' + n, varibel: v };
}

// ── FLIK 1 · TOLKA: uttryck → ord, och värdet ──
function tolkaRad(r, varor){
  var T = B.BAND.tolka;
  // olika antal och olika pris: annars syns inte vilken bokstav som hör till vilken vara
  var a = ri(r, T.antal[0], T.antal[1]), b = ri(r, T.antal[0], T.antal[1]);
  while(b === a) b = ri(r, T.antal[0], T.antal[1]);
  // varans EGET prisspann när det finns, annars flikens yttre ram
  var s1 = (varor.pris && varor.pris[0]) || T.pris, s2 = (varor.pris && varor.pris[1]) || T.pris;
  var p1 = ri(r, s1[0], s1[1]), p2 = ri(r, s2[0], s2[1]);
  while(p2 === p1) p2 = ri(r, s2[0], s2[1]);
  var bok = [varor.b1, varor.b2];
  return { uttryck: term(a, bok[0]) + ' + ' + term(b, bok[1]),
           svar: varor.ord(a, b),
           varden: bok[0] + ' = ' + p1 + ', ' + bok[1] + ' = ' + p2,
           belopp: a * p1 + b * p2 };
}

// ══════════ SJUANS ÖVRIGA UPPGIFTSTYPER ══════════
// Varje typ speglar en grupp i sjuans blad. Uppgiften är densamma, talen är åttans.

// SKRIVA · valruta: en mening, tre uttryck att välja mellan (ett rätt).
function valrutaRad(r){
  var v = val(r, ['x', 'a', 'b', 'y']), n = ri(r, 2, 9), k = ri(r, 2, 5);
  var fall = val(r, ['far', 'ger', 'dubbelt']);
  if(fall === 'far')  return { typ: 'valruta', fraga: 'hon får ' + n + ' nya',
    alt: [term(1, v) + ' − ' + n, term(1, v) + ' + ' + n, term(n, v)], ratt: v + '+' + n };
  if(fall === 'ger')  return { typ: 'valruta', fraga: 'hon ger bort ' + n,
    alt: [term(1, v) + ' − ' + n, term(n, v), term(1, v) + ' + ' + n], ratt: v + '-' + n };
  return { typ: 'valruta', fraga: 'hon får ' + (k === 2 ? 'dubbelt' : k + ' gånger') + ' så många till',
    alt: [term(k, v), term(k + 1, v), v + '/' + k], ratt: String(k) + v };
}
// SKRIVA · sträckfigur: en sträcka delad i delar — figuren ritas ur delarna.
function strackfigurRad(r){
  var v = val(r, ['x', 'a']), n = ri(r, 2, 9);
  var form = val(r, ['delad', 'lika']);
  if(form === 'delad') return { typ: 'strackfigur', delar: [v, String(n)], fraga: 'Röda sträckan =',
    svar: v + '+' + n, visa: v + ' + ' + n };
  var antal = ri(r, 3, 4), d = []; for(var i = 0; i < antal; i++) d.push(v);
  return { typ: 'strackfigur', delar: d, fraga: 'Röda sträckan =', svar: String(antal) + v, visa: term(antal, v) };
}
// SKRIVA · para ihop: fyra påståenden om SAMMA bokstav.
function paraIhopGrupp(r){
  var v = val(r, ['b', 'a', 'x']), n = ri(r, 2, 9), m = ri(r, 2, 9);
  while(m === n) m = ri(r, 2, 9);
  return { typ: 'paraIhop', variabel: v, rader: [
    { fraga: n + ' mer än ' + v,                svar: v + '+' + n },
    { fraga: 'Hälften så mycket som ' + v,      svar: v + '/2' },
    { fraga: 'Dubbelt så mycket som ' + v,      svar: '2' + v },
    { fraga: m + ' mindre än ' + v,             svar: v + '-' + m }
  ] };
}
// SKRIVA · sammanlagd: tre personer summeras (sjuans Elsa-grupp).
function sammanlagdRad(r){
  var v = val(r, ['x', 'a']), n = ri(r, 2, 6);
  // eleven själv är v, syskon 1 är v + n, syskon 2 är dubbelt så gammal → 4v + n
  return { typ: 'uttryck', fraga: 'Skriv ett uttryck för syskonens sammanlagda ålder',
           delar: [v, v + ' + ' + n, '2' + v], svar: '4' + v + '+' + n, visa: term(4, v) + ' + ' + n };
}
// SKRIVA · priskedja: tre varor med samma bas, uttryck OCH värde i samma grupp.
function prisKedjaGrupp(r){
  var v = val(r, ['x', 'a']), n = ri(r, 3, 12), m = ri(r, 3, 15), p = ri(r, 8, 25);
  while(m === n) m = ri(r, 3, 15);
  return { typ: 'prisKedja', variabel: v, mer: [n, m], varde: p, rader: [
    { fraga: 'Skriv ett uttryck för vad läsken kostar',   svar: v + '+' + n, visa: v + ' + ' + n },
    { fraga: 'Skriv ett uttryck för vad smörgåsen kostar', svar: v + '+' + m, visa: v + ' + ' + m },
    { fraga: 'Skriv ett uttryck för vad allt tre kostar',  svar: '3' + v + '+' + (n + m), visa: term(3, v) + ' + ' + (n + m) },
    { fraga: 'Hur mycket kostar allt om ' + v + ' = ' + p + '?', svar: 3 * p + n + m }
  ] };
}

// BERÄKNA · flerled: uttrycket, värdet insatt, uträkningen, svaret — sjuans kedja.
function flerledRad(r, form){
  var Bk = B.BAND.berakna;
  var v = val(r, ['x', 'y', 'a', 'b']), k = ri(r, 2, 9), c = ri(r, 1, Bk.konstant[1]);
  var x = ri(r, Bk.varde[0], Bk.varde[1]);
  if(form === 'en'){
    var minus = r() < 0.5;
    var uttryck = term(k, v) + (minus ? ' − ' : ' + ') + c;
    var prod = k * x, svar = minus ? prod - c : prod + c;
    return { typ: 'flerled', uttryck: uttryck, varden: v + ' = ' + x,
             led: [ { visa: k + '·' + x + (minus ? ' − ' : ' + ') + c, accept: k + '·' + x + (minus ? '-' : '+') + c },
                    { visa: prod + (minus ? ' − ' : ' + ') + c,        accept: prod + (minus ? '-' : '+') + c },
                    { svar: svar, svarText: talText(svar) } ] };
  }
  // två variabler: 6x − 3y, x = 4, y = 2  →  6·4 − 3·2  →  24 − 6  →  18
  var v2 = v === 'x' ? 'y' : 'x', k2 = ri(r, 2, 9), y = ri(r, 1, 9);
  while(y === x) y = ri(r, 1, 9);
  var minus2 = r() < 0.5;
  var p1 = k * x, p2 = k2 * y, svar2 = minus2 ? p1 - p2 : p1 + p2;
  return { typ: 'flerled', uttryck: term(k, v) + (minus2 ? ' − ' : ' + ') + term(k2, v2),
           varden: v + ' = ' + x + ', ' + v2 + ' = ' + y,
           led: [ { visa: k + '·' + x + (minus2 ? ' − ' : ' + ') + k2 + '·' + y, accept: k + '·' + x + (minus2 ? '-' : '+') + k2 + '·' + y },
                  { visa: p1 + (minus2 ? ' − ' : ' + ') + p2,                    accept: p1 + (minus2 ? '-' : '+') + p2 },
                  { svar: svar2, svarText: talText(svar2) } ] };
}
// BERÄKNA · figur: uttrycket kommer ur en figur, sedan sätts värdet in.
function flerledFigurRad(r){
  var v = val(r, ['a', 'x']), s1 = ri(r, 2, 6), s2 = ri(r, 2, 8), x = ri(r, 2, 9);
  var uttryck = term(2 * s1, v) + ' + ' + (2 * s2), svar = 2 * s1 * x + 2 * s2;
  return { typ: 'flerledFigur', sidor: [term(s1, v), String(s2), term(s1, v), String(s2)],
           uttryck: uttryck, varden: v + ' = ' + x,
           led: [ { visa: (2 * s1) + '·' + x + ' + ' + (2 * s2), accept: (2 * s1) + '·' + x + '+' + (2 * s2) },
                  { visa: (2 * s1 * x) + ' + ' + (2 * s2),       accept: (2 * s1 * x) + '+' + (2 * s2) },
                  { svar: svar, svarText: talText(svar) } ] };
}

// SKRIVA · omkrets ur figur: skriv uttrycket för omkretsen och förenkla det.
function omkretsSkrivaRad(r){
  var v = val(r, ['x', 'a']), s1 = ri(r, 2, 6), s2 = ri(r, 2, 9);
  return { typ: 'omkrets', varibel: v, fraga: 'rektangel med sidorna ' + term(s1, v) + ' och ' + s2,
           sidor: [term(s1, v), String(s2), term(s1, v), String(s2)],
           svar: term(2 * s1, v) + '+' + (2 * s2), visa: term(2 * s1, v) + ' + ' + (2 * s2) };
}

// FÖRENKLA · omkrets ur figur, som ska förenklas.
function omkretsForenklaRad(r){
  var v = val(r, ['x', 'a']), s1 = ri(r, 2, 6), s2 = ri(r, 2, 9), s3 = ri(r, 2, 6), s4 = ri(r, 2, 9);
  return { typ: 'omkrets', sidor: [term(s1, v), String(s2), term(s3, v), String(s4)],
           svar: term(s1 + s3, v) + ' + ' + (s2 + s4) };
}
// FÖRENKLA · öppen: skriv ett uttryck med fyra termer som förenklas till …
function oppetRad(r){
  var v = val(r, ['x', 'a']), v2 = v === 'x' ? 'y' : 'b';
  var k = ri(r, 3, 9), c = ri(r, 2, 12);
  return { typ: 'oppet', mal: term(k, v) + ' + ' + c, termer: 4,
           fraga: 'Skriv ett uttryck som innehåller fyra termer och förenklas till ' + term(k, v) + ' + ' + c };
}
// FÖRENKLA · pyramid: varje ruta är summan av de två under.
function pyramidRad(r){
  var v = val(r, ['a', 'x']), v2 = v === 'a' ? 'b' : null;
  var b1 = ri(r, 1, 5), b2 = ri(r, 1, 5), b3 = ri(r, 1, 5);
  var c1 = ri(r, 1, 4), c2 = ri(r, 1, 4), c3 = ri(r, 1, 4);
  function cell(k, m){ return v2 ? (term(k, v) + ' + ' + term(m, v2)) : (term(k, v) + ' + ' + m); }
  return { typ: 'pyramid', botten: [cell(b1, c1), cell(b2, c2), cell(b3, c3)],
           mitt: [cell(b1 + b2, c1 + c2), cell(b2 + b3, c2 + c3)],
           topp: cell(b1 + 2 * b2 + b3, c1 + 2 * c2 + c3) };
}
// FÖRENKLA · magisk kvadrat: samma summa lodrätt, vågrätt och diagonalt.
function magiskRad(r){
  // bygger ur en klassisk 3×3 med uttrycket k·v + m i varje ruta
  var v = val(r, ['x', 'a']), k = ri(r, 1, 4), m = ri(r, 1, 6);
  var M = [[8, 1, 6], [3, 5, 7], [4, 9, 2]];
  var rutor = M.map(function(rad){ return rad.map(function(t){ return term(k * t, v) + ' + ' + (m * t); }); });
  return { typ: 'magisk', rutor: rutor, summa: term(15 * k, v) + ' + ' + (15 * m) };
}
// FÖRENKLA · sidor: omkretsen är given, skriv två sidor som ger den.
function sidorRad(r){
  var v = val(r, ['x', 'a']), k = ri(r, 4, 12), c = ri(r, 2, 10);
  return { typ: 'sidor', omkrets: term(2 * k, v) + ' + ' + (2 * c),
           fraga: 'Omkretsen av rektangeln är ' + term(2 * k, v) + ' + ' + (2 * c) + '. Skriv två sidor som ger den omkretsen.',
           facit: [term(k, v), String(c)] };
}

// ── PROVEN: egenskapen och att uppgiften inte är sjuans ──
function haller(flik, rad, egenskap){
  var nyckel = sanera(rad.fraga || rad.uttryck || '');
  if(B.BAND.regler.ejSjuansTal && (B.SJUANS_PAR[flik] || []).some(function(p){ return sanera(p) === nyckel; })) return false;
  if(!egenskap) return true;
  var f = B.BAND.EGENSKAPER[egenskap];
  return !f || f(rad.fraga, rad.svar);
}
// vakt = en mängd redan dragna uppgifter i samma blad; en upprepning dras om.
function dra(flik, fn, egenskap, r, vakt){
  for(var i = 0; i < 40; i++){
    var rad = fn(r);
    var nyckel = sanera((rad.fraga || rad.uttryck || '') + '|' + (rad.svar || ''));
    if(haller(flik, rad, egenskap) && !(vakt && vakt[nyckel])){
      if(vakt) vakt[nyckel] = 1;
      return rad;
    }
  }
  var sista = fn(r); sista.omarkt = true; return sista;
}

var API = { rng: rng, ri: ri, val: val, dra: dra, haller: haller, talText: talText,
            forenklaRad: forenklaRad, beraknaRad: beraknaRad, skrivaRad: skrivaRad, tolkaRad: tolkaRad,
            valrutaRad: valrutaRad, strackfigurRad: strackfigurRad, paraIhopGrupp: paraIhopGrupp,
            sammanlagdRad: sammanlagdRad, prisKedjaGrupp: prisKedjaGrupp,
            flerledRad: flerledRad, flerledFigurRad: flerledFigurRad,
            omkretsForenklaRad: omkretsForenklaRad, omkretsSkrivaRad: omkretsSkrivaRad, oppetRad: oppetRad, pyramidRad: pyramidRad,
            magiskRad: magiskRad, sidorRad: sidorRad,
            term: term, led: led, konst: konst };
if(typeof window !== 'undefined') window.GEN_AK8_ALG1 = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
