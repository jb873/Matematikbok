/* ============================================================
   blad-ak8-d2.js — ÖVA-BLADEN för åk8 k1 delkapitel 2 "Negativa tal".
   EXAKT-FÖRFATTAT ur TRANSKRIPTION-ak8-k1-d2-negativa-tal.md (tre .docx, lästa ur
   document.xml). Tre blad: A Grunder · B Add/sub · C Mult/div. Statiskt, ingen
   generator. Eleven skriver svar och trycker KONTROLLERA per blad (självrättning
   + facit + konfetti), som övriga blad.

   Bråk renderas som STÅENDE bråk (fracSpan) — även i facit. Tal vänsterställda.
   fracRuta (blad-karna.js) för ruta inne i bråk (C1:6). Rör inga motorer/mellanled.

   NAMNGIVNA PLATSHÅLLARE (väntar på Joachim — se rapport):
     • 6 figurer: tallinje Scala 1/8/11/22 + 2 termometrar
     • B1:4 tredje raden facit (-2+0,7+0,3) — flaggad
     • C2:1 första raden (frac(1888·8,-6)) — trolig felskrivning
     • B2:6 precedenstvetydig — villkors-validering, villkor saknas
     • B2:1 andra raden (-7-(12)) — parentes utan tecken, flaggad
   Auto-rättat rakt av: (-200]→(-200) · 7.5→7,5 · -10.5→-10,5 · saknat = i C1:7.
   ============================================================ */
(function(){
  'use strict';
  var F = { fracSpan: window.fracSpan, fracRuta: window.fracRuta };
  function frac(t, n){ return F.fracSpan(t, n); }
  // FAS1: normalisera ALLA minus-varianter (U+2212 matematiskt minus / U+2013 en-dash / U+2014 em-dash)
  // → U+002D innan parseFloat. Keypaden matar in U+2212; utan detta gav parseFloat('−2')=NaN → rätt svar rött.
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/\s/g, '').replace(/[−–—]/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }
  function fmt(x){ return String(x).replace('.', ','); }
  function neg(html){ return '<span class="ovn-text">−</span>' + html; }   // minus framför stående bråk

  // ── Byggstenar per uppgiftstyp (returnerar {html, check(el)}) ──
  // Tal-svar (beräkna, tom ruta, motsatta, mitt, temperatur): ett textfält, facit = tal.
  function T(fraga, facit, flagg){
    return { typ:'tal', fraga:fraga, facit:facit, flagg:flagg };
  }
  // Bråk-svar: fracBoxes-liknande (täljare/nämnare), värde-lika + teckenkänsligt.
  function B(fraga, ft, fn){ return { typ:'brak', fraga:fraga, ft:ft, fn:fn }; }
  // fracRuta: ruta i bråket, rhs = värdet efter =, facit = talet i rutan.
  function R(fast, ruta, rhs, facit){ return { typ:'fracruta', fast:fast, ruta:ruta, rhs:rhs, facit:facit }; }
  // Tecken-val: chips.
  function C(fraga, alt, ratt){ return { typ:'tecken', fraga:fraga, alt:alt, ratt:ratt }; }
  // Storleksordna (klicka i ordning): tal-lista + rätt ordning (index).
  function O(tal, minstForst){ var idx = tal.map(function(v, i){ return i; }).sort(function(a, b){ return minstForst ? tal[a] - tal[b] : tal[b] - tal[a]; }); return { typ:'ordna', tal:tal, ordning:idx, minstForst:minstForst }; }
  // Mellanled (omgruppering: samla positiva först): expr = [posSum] − [negSum] = [svar].
  function M(exprHtml, posSum, negSum, svar, flagg){ return { typ:'mellan', expr:exprHtml, posSum:posSum, negSum:negSum, svar:svar, flagg:flagg }; }
  // Villkors-validering (öppet svar, många rätta): test-funktion. Platshållare om test=null.
  function V(kravHtml, antal, test, exempel){ return { typ:'villkor', krav:kravHtml, antal:antal, test:test, exempel:exempel }; }
  // Teckenekvation: sätt in ett tecken (+ − × /) i varje ruta så att leden blir lika.
  // disp = 'A ___ B = C ___ D' (två rutor). Flera lösningar accepteras (validering).
  function E(disp, exempel){ return { typ:'ekv', disp:disp, exempel:exempel }; }
  // Figur-platshållare (väntar på Joachim).
  function FIG(namn){ return { typ:'figur', namn:namn }; }
  // Avläsning: SVG-tallinje(r) + fält "namn = __" per punkt. Positioner = facit (självkonsistent).
  function LINJE(min, max, steg, etiketter, punkter){ return { min:min, max:max, steg:steg, etiketter:etiketter, punkter:punkter }; }
  function PT(v, namn){ return { v:v, namn:namn }; }
  function AVLAS(linjer){ return { typ:'avlas', linjer:linjer }; }
  // Avstånd mellan punkter: par = [[namnA, namnB, vA, vB], …], facit = |vA − vB|.
  function AVST(par){ return { typ:'avstand', par:par }; }
  // Markera talen på tallinjen (klicka-placera). mal = tal (eller {v, txt} för bråk).
  function MARK(min, max, steg, etiketter, mal){ return { typ:'markera', min:min, max:max, steg:steg, etiketter:etiketter, mal:mal }; }

  // ─────────────────────────────────────────────────────────────
  //  BLAD A — GRUNDER (nod neg-begrepp:begrepp, repetition)
  // ─────────────────────────────────────────────────────────────
  var BLAD_A = { nr:1, titel:'Grunder', nod:'neg-begrepp:begrepp', uppg:[
    { rubrik:'Vilka tal motsvarar de olika bokstäverna?', rader:[ AVLAS([
      LINJE(-8, 6, 1, [-5, 0, 5], [PT(-7,'D'), PT(-2,'C'), PT(1,'B'), PT(4,'A')]),
      LINJE(-11, 2, 1, [-10, -5, 0], [PT(-8,'D'), PT(-5,'C'), PT(-1,'B'), PT(1,'A')]),
      LINJE(-22, 4, 2, [-20, -10, 0], [PT(-18,'D'), PT(-12,'C'), PT(-4,'B'), PT(2,'A')]) ]) ] },
    { rubrik:'Vilket är det motsatta talet till', rader:[ T('2', -2), T('−3', 3), T('7', -7) ] },
    { rubrik:'Skriv talen i storleksordning, börja med det största', rader:[ O([3,-4,-7,5], false), O([0.2,-1.2,-0.2,1.2], false) ] },
    { rubrik:'Vilket tecken ska stå mellan talen, &gt; eller &lt;', rader:[ C('−4 ___ 3', ['&lt;','&gt;'], '&lt;'), C('−1,5 ___ −3,5', ['&lt;','&gt;'], '&gt;'), C('−4,5 ___ −2,9', ['&lt;','&gt;'], '&lt;') ] },
    { rubrik:'Vilka tal motsvarar de olika bokstäverna?', rader:[ AVLAS([
      LINJE(-0.6, 0.6, 0.1, [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6], [PT(-0.4,'A'), PT(0.1,'B'), PT(0.5,'C')]) ]) ] },
    { rubrik:'Hur långt är det mellan', rader:[ AVST([ ['A','B',-0.4,0.1], ['B','C',0.1,0.5], ['A','C',-0.4,0.5] ]) ] },
    { rubrik:'Skriv två tal som ligger mellan', rader:[
      V('1 och −4', 2, function(x){ return x > -4 && x < 1; }, 't.ex. 0 och −2'),
      V('−1 och −2', 2, function(x){ return x > -2 && x < -1; }, 't.ex. −1,3 och −1,7') ] },
    { rubrik:'Markera talen på tallinjen', rader:[ MARK(-5, 5, 0.5, [-5, 0, 5], [3, -3, 2.5, -0.5, -4.5]) ] },
    { rubrik:'Skriv de tre nästföljande talen i talföljden', rader:[
      { typ:'foljd', pre:'10, 7, 4,', facit:[1,-2,-5] },
      { typ:'foljd', pre:'−17, −13, −9,', facit:[-5,-1,3] } ] },
    { rubrik:'Vilket tal ligger mittemellan', rader:[ T('−3 och 1', -1), T('−5 och 4', -0.5), T('−7 och 3', -2) ] },
    { rubrik:'Temperaturen är −5 grader Celsius. Vad visar termometern om temperaturen', rader:[ T('ökar med 3 grader', -2), T('minskar med 4 grader', -9), T('ökar med 9 grader', 4) ] },
    { rubrik:'Markera bråken på tallinjen', rader:[ MARK(-1, 1, 1/12, [-1, 0, 1], [
      { v:0.5, txt:'½' }, { v:-0.5, txt:'−½' }, { v:1/3, txt:'⅓' }, { v:-1/3, txt:'−⅓' }, { v:0.25, txt:'¼' }, { v:-0.25, txt:'−¼' } ]) ] },
    { rubrik:'Skriv talen i storleksordning, börja med det minsta', rader:[ O([-2.3, 0, 5.1, 5.03, -2.34], true) ] }
  ] };

  // ─────────────────────────────────────────────────────────────
  //  BLAD B — ADDITION OCH SUBTRAKTION (nod neg-rakna:addsub, repetition)
  // ─────────────────────────────────────────────────────────────
  var BLAD_B = { nr:2, titel:'Addition och subtraktion', nod:'neg-rakna:addsub', uppg:[
    { grupp:'Blad B1' },
    { rubrik:'Beräkna', rader:[ T('4 − 7 =', -3), T('−1 − 7 =', -8), T('−5 + 7 =', 2), T('−8 + 3 =', -5) ] },
    { rubrik:'Beräkna', rader:[ T('3 − 15 =', -12), T('−5 + 19 =', 14), T('35 − 100 =', -65), T('−230 + 500 =', 270) ] },
    FIG('Termometer — Scala åk 8 uppgift 28'),
    { rubrik:'Beräkna', rader:[ T('−25 − 7 =', -32), T('0,6 − 1,8 =', -1.2), T('0,7 − 3 =', -2.3) ] },
    { rubrik:'Beräkna med mellanled', hint:'Samla de positiva talen först. Exempel: 6 − 12 + 8 = 14 − 12 = 2', rader:[
      M('3 − 15 + 17', 20, 15, 5),
      M('18 − 35 − 65', 18, 100, -82),
      M('−2 + 0,7 + 0,3', 1, 2, -1),
      M('0,6 − 0,8 + 0,5', 1.1, 0.8, 0.3) ] },
    { rubrik:'Vilket tal ska stå i den tomma rutan', rader:[ T('6 − □ = −2', 8), T('□ + 5 = 3', -2), T('−3 + □ = 11', 14), T('□ − 5 = −10', -5) ] },
    { rubrik:'Beräkna', rader:[
      B(frac(3,8) + ' <span class="ovn-text">−</span> ' + frac(5,8) + ' =', -2, 8),
      B(neg(frac(1,4)) + ' <span class="ovn-text">−</span> ' + frac(1,2) + ' =', -3, 4),
      B(neg(frac(1,4)) + ' <span class="ovn-text">+</span> ' + frac(4,5) + ' =', 11, 20) ] },
    { rubrik:'Vilket tal är', rader:[ T('6 tiondelar större än −10,5', -9.9), T('6 tiondelar mindre än −10,5', -11.1), T('6 hundradelar mindre än −10,5', -10.56), T('6 hundradelar större än −10,5', -10.44) ] },
    { grupp:'Blad B2' },
    { rubrik:'Beräkna', rader:[ T('−5 − (−7) =', 2), T('−7 − (−12) =', 5), T('−4 + (−11) =', -15), T('−0,9 − (−3) =', 2.1) ] },
    { rubrik:'Vilket tal saknas', rader:[ T('7 + □ = 3', -4), T('6 − □ = 13', -7), T('5 + □ = −1', -6) ] },
    { rubrik:'Beräkna', rader:[ T('17 − (−8) =', 25), T('4 + (−11) =', -7), T('(−6) + (−2,5) =', -8.5), T('(−7) − (−4) =', -3) ] },
    { rubrik:'Vilket tecken ska stå i rutan för att likheten ska stämma (+ eller −)', rader:[
      C('5 ___ (−3) = 2', ['+','−'], '+'), C('(−7) ___ 9 = −16', ['+','−'], '−'), C('(−8) ___ (−2) = −6', ['+','−'], '−'),
      C(neg(frac(1,2)) + ' ___ (' + neg(frac(1,4)) + ') = ' + neg(frac(1,4)), ['+','−'], '−') ] },
    { rubrik:'Beräkna', rader:[ T('5 − (−3) + (−4) =', 4), T('6 + (−9) − (−6) + 2 =', 5), T('−9 − (−3) + (−6) =', -12) ] },
    { rubrik:'Skriv in ett tecken så att uttrycken blir lika (+ − × /)', rader:[
      E('3 ___ (−4) = (−2) ___ 9', '3 − (−4) = (−2) + 9'),
      E('(−6) − (−8) ___ 7 = 12 + (−17) ___ 14', '(−6) − (−8) + 7 = 12 + (−17) + 14'),
      E('(−2,5) ___ (−4) + 5 = 7,5 − (−9) ___ 18', '(−2,5) + (−4) + 5 = 7,5 − (−9) − 18') ] }
  ] };

  // ─────────────────────────────────────────────────────────────
  //  BLAD C — MULTIPLIKATION OCH DIVISION (nod neg-rakna:multdiv, mål)
  // ─────────────────────────────────────────────────────────────
  var BLAD_C = { nr:3, titel:'Multiplikation och division', nod:'neg-rakna:multdiv', uppg:[
    { grupp:'Blad C1' },
    { rubrik:'Beräkna', rader:[ T('5 · (−8) =', -40), T('(−7) · (−6) =', 42), T('−9 · 3 =', -27) ] },
    { rubrik:'Beräkna', rader:[ T(frac(-63,9) + ' =', -7), T(frac(-32,-4) + ' =', 8), T(frac(28,-7) + ' =', -4) ] },
    { rubrik:'Beräkna', rader:[ T('−0,2 · (−7) =', 1.4), T('(−0,8) · 0,3 =', -0.24), T('3 · (−0,04) =', -0.12) ] },
    { rubrik:'Beräkna', rader:[ T(frac(-1500,-5) + ' =', 300), T(frac('−0,24',3) + ' =', -0.08), T(frac('3,6','−2') + ' =', -1.8) ] },
    { rubrik:'Vad ska stå i den tomma rutan?', rader:[ T('(−5) · □ = 35', -7), T('□ · 7 = −28', -4), T('(−4) · □ = −36', 9), T('□ · 0,5 = −0,25', -0.5) ] },
    { rubrik:'Vad ska stå i den tomma rutan?', hint:'Rutan ligger inne i bråket.', rader:[
      R(-56, 'namnare', 8, -7), R(-9, 'taljare', 3, -27), R(-36, 'namnare', -9, 4), R(11, 'taljare', -4, -44) ] },
    { rubrik:'Beräkna', rader:[ T('13 + 2 · (−5) =', 3), T('8 + ' + frac(15,-3) + ' =', 3), T('(−3) · (−5) − 8 =', 7), T(frac(-18,-3) + ' + (−4) =', 2) ] },
    { grupp:'Blad C2' },
    { rubrik:'Beräkna', rader:[
      T(frac('4 · 9','−6') + ' =', -6),
      T(frac('3 · (−12)','(−4) · (−5)') + ' =', -1.8), T(frac('4 · (−8)','(−2) · 2') + ' =', 8) ] },
    { rubrik:'Beräkna', rader:[ T('(−2) · 6 · (−3) =', 36), T('(−4) · (−8) · (−3) =', -96), T('(−11) · (−3) · 5 =', 165) ] },
    { rubrik:'Vilket tecken ska stå mellan talen? &lt; eller &gt; eller =', rader:[
      C('(−10) · 2 ___ (−3) · (−6)', ['&lt;','&gt;','='], '&lt;'),
      C('(−4) · 7,5 ___ 2 · (−15)', ['&lt;','&gt;','='], '='),
      C('(−80) · 20 ___ 2 · (−200)', ['&lt;','&gt;','='], '&lt;') ] },
    { rubrik:'Beräkna', rader:[ T('2 · (−40) · (−8) =', 640), T('(−4) · (−5) · (−200) =', -4000), T('2 · (−0,03) · (−0,6) =', 0.036), T('(−0,2) · (−0,4) · 300 · (−0,02) =', -0.48) ] },
    { rubrik:'Beräkna', rader:[
      T('(−1) · (−3) + ' + frac(-16,-4) + ' =', 7),
      T(frac(15,-3) + ' + (−6) · 3 =', -23),
      T('(−1) · 8 − (−12) + ' + frac(-10,2) + ' =', -1) ] },
    { rubrik:'Beräkna', rader:[
      B(neg(frac(1,4)) + ' · (−3) =', 3, 4),
      B(frac(1,3) + ' · (' + neg(frac(3,5)) + ') =', -1, 5),
      B(frac(3,4) + ' · (−3) + 2 =', -1, 4),
      B(frac(2,3) + ' · (' + neg(frac(1,4)) + ') · (' + neg(frac(3,5)) + ') =', 1, 10) ] },
    { rubrik:'Beräkna', rader:[
      T('(−3) · 2 · (−2) · (−3) =', -36), T('0,9 + 7 · (−0,6) =', -3.3),
      T('0,7 · (−0,3) + ' + frac('−1,8','−0,2') + ' =', 8.79),
      T(frac('(−8) · 3','−6') + ' + (−3) · (−3) =', 13) ] }
  ] };

  // ═══════════════ RENDER + SJÄLVRÄTTNING ═══════════════
  var CHECKS = [];   // data-idx → check(el) → { ok, facit }
  var CUR_NEG = false;   // FAS3: sätts per grupp i renderBlad — styr om brak-rader får teckenruta (grupp-härlett, ej per uppgift)
  // FAS2: en uppgift KRÄVER omskrivningscell när den subtraherar ett negativt tal (a − (−b) = a + b) —
  // detekteras ur uttrycket (bandet bär kravet, inte rubriken), tvåvägs (cell finns exakt då mönstret finns).
  function harDubbelMinus(fraga){ return /[−–-]\s*\(\s*[−–-]/.test(String(fraga)); }
  // Kanonisk omskrivning för facit-visning: slår ihop yttre operator med inre tecken, tar bort parentesen.
  function skrivOm(f){ return String(f).replace(/([+−–-])\s*\(\s*([+−–-]?)\s*([0-9]+(?:[.,][0-9]+)?)\s*\)/g,
    function(m, yttre, inre, tal){ var neg = (/[−–-]/.test(yttre)) !== (/[−–-]/.test(inre)); return (neg ? ' − ' : ' + ') + tal; }); }
  // FAS3: kan NÅGOT svar i gruppen bli negativt? (styr teckenrutans närvaro, ej enskild uppgifts facit)
  function gruppKanNeg(u){ return (u.rader || []).some(function(r){
    return (typeof r.facit === 'number' && r.facit < 0) || (typeof r.ft === 'number' && r.ft < 0) || (typeof r.svar === 'number' && r.svar < 0)
      || (Array.isArray(r.tal) && r.tal.some(function(v){ return v < 0; }))
      || (Array.isArray(r.facit) && r.facit.some(function(v){ return v < 0; })); }); }
  function inTal(){ return '<input class="ak8-in" inputmode="text" autocomplete="off">'; }
  function likhetOk(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  // data-val avkodas av webbläsaren (&lt; → <); facit i datan är entity-form för display.
  function unesc(s){ return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }

  // Liten aritmetik-utvärderare (+ − × / parenteser, unärt minus) — ingen eval.
  function evalArith(s){
    s = String(s).replace(/[−–—]/g, '-').replace(/[·×]/g, '*').replace(/÷/g, '/').replace(/,/g, '.').replace(/\s+/g, '');   // FAS1: alla minus-varianter
    var i = 0;
    function expr(){ var v = term(); while(s[i] === '+' || s[i] === '-'){ var op = s[i++]; var t = term(); v = op === '+' ? v + t : v - t; } return v; }
    function term(){ var v = factor(); while(s[i] === '*' || s[i] === '/'){ var op = s[i++]; var f = factor(); v = op === '*' ? v * f : v / f; } return v; }
    function factor(){
      if(s[i] === '+'){ i++; return factor(); }
      if(s[i] === '-'){ i++; return -factor(); }
      if(s[i] === '('){ i++; var v = expr(); if(s[i] === ')') i++; return v; }
      var m = /^[0-9]*\.?[0-9]+/.exec(s.slice(i)); if(!m) return NaN; i += m[0].length; return parseFloat(m[0]);
    }
    var r = expr();
    return i === s.length ? r : NaN;
  }
  // Teckenchips för ekvation: display + JS-operator.
  var EKV_OPS = [['+','+'], ['−','-'], ['×','*'], ['÷','/']];
  function ekvChips(){ return EKV_OPS.map(function(o){ return '<button type="button" class="ak8-chip" data-op="' + o[1] + '">' + o[0] + '</button>'; }).join(''); }

  function renderRad(r){
    var idx = CHECKS.length;
    if(r.typ === 'tal'){
      if(harDubbelMinus(r.fraga) && r.facit != null){
        // FAS2: omskrivningscell (skriv om utan dubbeltecken) + svarscell. BÅDA rättas på VÄRDE (evalArith
        // på omskrivningen → godtar valfri giltig form), så metodsteget krävs men skrivsättet är fritt.
        CHECKS.push(function(el){
          var ins = el.querySelectorAll('.ak8-in');
          var oms = evalArith(ins[0].value), sv = pNum(ins[1].value);
          return { ok: likhetOk(oms, r.facit) && likhetOk(sv, r.facit), facit: skrivOm(r.fraga) + ' ' + fmt(r.facit) };
        });
        return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">'
          + '<input class="ak8-in ak8-in-oms" inputmode="text" autocomplete="off" placeholder="skriv om" style="width:96px;">'
          + '<span class="ovn-text" style="margin:0 6px;">=</span>' + inTal() + '</span>'
          + (r.flagg ? '<span class="ak8-flagg" title="' + r.flagg + '">⚑</span>' : '') + '</div>';
      }
      CHECKS.push(function(el){ if(r.facit == null) return { flagg:true }; return { ok: likhetOk(pNum(el.querySelector('.ak8-in').value), r.facit), facit: fmt(r.facit) }; });
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + inTal() + '</span>'
        + (r.flagg ? '<span class="ak8-flagg" title="' + r.flagg + '">⚑</span>' : '') + '</div>';
    }
    if(r.typ === 'brak'){
      // FAS3: teckenruta FRAMFÖR bråket när gruppen kan ge negativt svar (annars finns den inte alls → avslöjar
      // inget). Tom ruta = positivt svar (giltigt). Tecknet normaliseras enligt FAS1 och multipliceras med bråket.
      var teckenruta = CUR_NEG;
      CHECKS.push(function(el){
        var t = pNum(el.querySelector('.ak8-bt').value), n = pNum(el.querySelector('.ak8-bn').value), sign = 1;
        if(teckenruta){ var sb = el.querySelector('.ak8-sign'); var sraw = String(sb ? sb.value : '').replace(/[−–—\s]/g, '-'); sign = sraw === '' ? 1 : (sraw === '-' ? -1 : NaN); }
        var v = sign * (t / n);
        return { ok: isFinite(v) && isFinite(t) && isFinite(n) && n !== 0 && Math.abs(v - r.ft / r.fn) < 1e-9, facit: (r.ft < 0 ? '−' : '') + Math.abs(r.ft) + '/' + r.fn };
      });
      var signBox = teckenruta ? '<input class="ak8-in ak8-sign" inputmode="text" autocomplete="off" maxlength="1" aria-label="tecken (skriv − eller lämna tomt)" style="width:26px;text-align:center;margin-right:4px;vertical-align:middle;">' : '';
      var box = '<span class="ovn-brak"><span class="ovn-brak-taljare"><input class="ak8-in ak8-bt" inputmode="text" style="width:48px;text-align:center;"></span><span class="ovn-brak-strecket"></span><span class="ovn-brak-namnare"><input class="ak8-in ak8-bn" inputmode="text" style="width:48px;text-align:center;"></span></span>';
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga + '</span><span class="ak8-svar" data-idx="' + idx + '">' + signBox + box + '</span></div>';
    }
    if(r.typ === 'fracruta'){
      CHECKS.push(function(el){ return { ok: likhetOk(pNum(el.querySelector('.fr-ruta').value), r.facit), facit: fmt(r.facit) }; });
      return '<div class="ak8-rad"><span class="ak8-svar" data-idx="' + idx + '">' + F.fracRuta(r.fast, { ruta: r.ruta })
        + '<span class="ovn-text" style="margin:0 8px;">= ' + fmt(r.rhs) + '</span></span></div>';
    }
    if(r.typ === 'tecken'){
      CHECKS.push(function(el){ var v = el.querySelector('.ak8-chip.sel'); return { ok: !!v && v.dataset.val === unesc(r.ratt), facit: r.ratt, chip:true }; });
      var chips = r.alt.map(function(a){ return '<button type="button" class="ak8-chip" data-val="' + a + '">' + a + '</button>'; }).join('');
      return '<div class="ak8-rad"><span class="ak8-q">' + r.fraga.replace('___', '<span class="ak8-svar ak8-teckenslot" data-idx="' + idx + '">' + chips + '</span>') + '</span></div>';
    }
    if(r.typ === 'ordna'){
      CHECKS.push(function(el){ var sel = Array.prototype.slice.call(el.querySelectorAll('.ak8-tal.sel')); sel.sort(function(a, b){ var na = a.querySelector('.ak8-ordnr'), nb = b.querySelector('.ak8-ordnr'); return (na ? +na.textContent : 0) - (nb ? +nb.textContent : 0); }); var vald = sel.map(function(b){ return +b.dataset.i; }); return { ok: vald.length === r.tal.length && vald.every(function(i, p){ return i === r.ordning[p]; }), facit: r.ordning.map(function(i){ return fmt(r.tal[i]); }).join('  ') }; });
      var tal = r.tal.map(function(v, i){ return '<button type="button" class="ak8-tal" data-i="' + i + '">' + fmt(v) + '</button>'; }).join('');
      return '<div class="ak8-rad"><span class="ak8-svar ak8-ordna" data-idx="' + idx + '">' + tal + '</span></div>';
    }
    if(r.typ === 'foljd'){
      CHECKS.push(function(el){ var ins = el.querySelectorAll('.ak8-in'), ok = true; r.facit.forEach(function(f, i){ if(!likhetOk(pNum(ins[i].value), f)) ok = false; }); return { ok: ok, facit: r.facit.map(fmt).join(', ') }; });
      var boxar = r.facit.map(function(){ return inTal(); }).join('<span class="ovn-text" style="margin:0 4px;">,</span>');
      return '<div class="ak8-rad"><span class="ak8-q">' + r.pre + '</span><span class="ak8-svar" data-idx="' + idx + '">' + boxar + '</span></div>';
    }
    if(r.typ === 'mellan'){
      CHECKS.push(function(el){ var ins = el.querySelectorAll('.ak8-in'); var ok = likhetOk(pNum(ins[0].value), r.posSum) && likhetOk(pNum(ins[1].value), r.negSum) && likhetOk(pNum(ins[2].value), r.svar); return { ok: ok, facit: fmt(r.posSum) + ' − ' + fmt(r.negSum) + ' = ' + fmt(r.svar) }; });
      var scaff = '<span class="ovn-text">= </span>' + inTal() + '<span class="ovn-text" style="margin:0 6px;">−</span>' + inTal() + '<span class="ovn-text" style="margin:0 6px;">= </span>' + inTal();
      return '<div class="ak8-rad"><span class="ak8-q">' + r.expr + '</span><span class="ak8-svar" data-idx="' + idx + '">' + scaff + '</span>'
        + (r.flagg ? '<span class="ak8-flagg" title="' + r.flagg + '">⚑</span>' : '') + '</div>';
    }
    if(r.typ === 'villkor'){
      if(!r.test){ // platshållare (villkor saknas)
        return '<div class="ak8-rad"><span class="ak8-q">' + r.krav + '</span><span class="ak8-vantar">väntar på villkor</span></div>';
      }
      CHECKS.push(function(el){ var ins = el.querySelectorAll('.ak8-in'), svar = [], seen = {}, dist = true, alla = true; for(var i = 0; i < r.antal; i++){ var v = pNum(ins[i].value); svar.push(v); if(!isFinite(v) || !r.test(v)) alla = false; var k = Math.round(v * 1e6); if(seen[k]) dist = false; seen[k] = 1; } return { ok: alla && dist, facit: r.exempel }; });
      var boxar2 = []; for(var i = 0; i < r.antal; i++) boxar2.push(inTal());
      return '<div class="ak8-rad"><span class="ak8-q">' + r.krav + '</span><span class="ak8-svar" data-idx="' + idx + '">' + boxar2.join('<span class="ovn-text" style="margin:0 6px;">och</span>') + '</span></div>';
    }
    if(r.typ === 'ekv'){
      var delar = r.disp.split('=');
      function sida(txt, slot){ var seg = txt.split('___'); return seg[0] + '<span class="ak8-ekvslot" data-slot="' + slot + '">' + ekvChips() + '</span>' + (seg[1] || ''); }
      CHECKS.push(function(el){
        var slots = el.querySelectorAll('.ak8-ekvslot'), ops = [];
        for(var s = 0; s < slots.length; s++){ var sel = slots[s].querySelector('.ak8-chip.sel'); if(!sel) return { ok:false, facit:r.exempel, chip:true }; ops.push(sel.dataset.op); }
        var L = evalArith(delar[0].replace('___', ops[0])), R = evalArith(delar[1].replace('___', ops[1]));
        return { ok: isFinite(L) && isFinite(R) && Math.abs(L - R) < 1e-9, facit: 't.ex. ' + r.exempel, chip:true };
      });
      return '<div class="ak8-rad"><span class="ak8-q"><span class="ak8-svar" data-idx="' + idx + '" style="display:inline;">'
        + sida(delar[0], 0) + '<span class="ovn-text" style="margin:0 8px;">=</span>' + sida(delar[1], 1) + '</span></span></div>';
    }
    if(r.typ === 'avlas'){
      var varden = [], html = '';
      r.linjer.forEach(function(lin, li){
        var pre = r.linjer.length > 1 ? '<span class="ak8-linje-nr">' + 'abc'.charAt(li) + ')</span>' : '';
        html += '<div class="ak8-tallinje">' + pre + (window.SvgTallinje ? window.SvgTallinje.linje(lin) : '') + '</div>';
        html += '<div class="ak8-avlas-rad">' + lin.punkter.map(function(p){ varden.push(p.v); return '<span class="ak8-avlas-in">' + p.namn + ' = <input class="ak8-in ak8-in-sm"></span>'; }).join('') + '</div>';
      });
      CHECKS.push(function(el){ var ins = el.querySelectorAll('.ak8-in'), ok = true, fac = []; varden.forEach(function(v, i){ if(!likhetOk(pNum(ins[i].value), v)) ok = false; fac.push(fmt(v)); }); return { ok: ok, facit: fac.join(', ') }; });
      return '<div class="ak8-rad ak8-rad-fig"><span class="ak8-svar" data-idx="' + idx + '">' + html + '</span></div>';
    }
    if(r.typ === 'avstand'){
      CHECKS.push(function(el){ var ins = el.querySelectorAll('.ak8-in'), ok = true, fac = []; r.par.forEach(function(pp, i){ var d = Math.round(Math.abs(pp[2] - pp[3]) * 1e6) / 1e6; if(!likhetOk(pNum(ins[i].value), d)) ok = false; fac.push(fmt(d)); }); return { ok: ok, facit: fac.join(', ') }; });
      var h2 = r.par.map(function(pp){ return '<span class="ak8-avlas-in">' + pp[0] + ' och ' + pp[1] + ': <input class="ak8-in ak8-in-sm"></span>'; }).join('');
      return '<div class="ak8-rad"><span class="ak8-svar" data-idx="' + idx + '">' + h2 + '</span></div>';
    }
    if(r.typ === 'markera'){
      var mal = r.mal.map(function(m){ return (typeof m === 'object') ? { v:m.v, txt:m.txt } : { v:m, txt:fmt(m) }; });
      var malTxt = mal.map(function(m){ return m.txt; }).join(', ');
      var chips = mal.map(function(m){ return '<button type="button" class="ak8-mark-chip" data-v="' + (Math.round(m.v * 1e6) / 1e6) + '">' + m.txt + '</button>'; }).join('');
      var svg = window.SvgTallinje ? window.SvgTallinje.linje({ min:r.min, max:r.max, steg:r.steg, etiketter:r.etiketter, punkter:[], klickbar:true }) : '';
      CHECKS.push(function(el){ var mks = el.querySelectorAll('.tl-marker'); var ok = mks.length === mal.length; mks.forEach(function(mk){ if(Math.abs(+mk.dataset.v - +mk.dataset.target) > 1e-3) ok = false; }); return { ok: ok, facit: malTxt }; });
      return '<div class="ak8-rad ak8-rad-fig"><span class="ak8-svar" data-idx="' + idx + '"><div class="ak8-mark-chips">' + chips + '</div><div class="ak8-mark-wrap">' + svg + '</div></span></div>';
    }
    if(r.typ === 'figur'){
      return '<div class="ak8-figur">▨ Figur: <strong>' + r.namn + '</strong> — SVG byggs när Joachim specificerat den.</div>';
    }
    return '';
  }

  function renderBlad(mount, blad){
    var html = '<div class="ovn-sheet"><h2>' + blad.titel + '</h2>';
    var grpN = 0;   // löpande gruppnummer (bara riktiga uppgiftsgrupper; figur/sektionshuvud hoppas över)
    blad.uppg.forEach(function(u){
      if(u.typ === 'figur'){ html += renderRad(u); return; }
      if(u.grupp){ html += '<h3 class="ak8-grupp">' + u.grupp + '</h3>'; return; }
      grpN++;
      CUR_NEG = gruppKanNeg(u);   // FAS3: teckenruta-styrning för brak-rader i denna grupp
      html += '<div class="ovn-grupp"><div class="ovn-grupp-rubrik">' + grpN + '. ' + u.rubrik + (u.villkorNot ? ' <span class="ak8-flagg" title="Precedenstvetydig — villkors-validering, villkoret saknas">⚑</span>' : '') + '</div>';
      if(u.hint) html += '<p class="ak8-hint">' + u.hint + '</p>';
      var bokN = 0;
      u.rader.forEach(function(r){
        var h = renderRad(r);
        if(/^<div class="ak8-rad[^"]*">/.test(h)){ h = AK8_UI.injLabel(h, bokN); bokN++; }
        html += h;
      });
      html += '</div>';
    });
    html += '<div class="ovn-kontroll-rad"><button type="button" class="ovn-kontroll" data-kontroll>Kontrollera</button><button type="button" class="ovn-aterstall" data-reset>Återställ</button>' + AK8_UI.printKnappHTML() + '</div><div class="ovn-sammanf" data-sammanf style="display:none;"></div></div>';
    html += AK8_UI.keypadHTML({ ops:['+', '−', '·', '/'] });
    mount.innerHTML = html;
    // interaktioner
    mount.querySelectorAll('.ak8-teckenslot .ak8-chip, .ak8-ekvslot .ak8-chip').forEach(function(ch){ ch.onclick = function(){ if(ch.className.indexOf('ratt') > -1 || ch.className.indexOf('fel') > -1) return; ch.parentNode.querySelectorAll('.ak8-chip').forEach(function(o){ o.classList.remove('sel'); }); ch.classList.add('sel'); }; });
    mount.querySelectorAll('.ak8-ordna').forEach(function(rad){ rad.querySelectorAll('.ak8-tal').forEach(function(b){ b.onclick = function(){ if(b.style.pointerEvents === 'none') return; if(b.classList.contains('sel')){ b.classList.remove('sel'); b.querySelector('.ak8-ordnr') && b.querySelector('.ak8-ordnr').remove(); } else { var n = rad.querySelectorAll('.ak8-tal.sel').length + 1; b.classList.add('sel'); var s = document.createElement('span'); s.className = 'ak8-ordnr'; s.textContent = n; b.appendChild(s); } }; }); });
    mount.querySelectorAll('.ak8-mark-wrap').forEach(function(wrap){
      var svg = wrap.querySelector('svg'), band = wrap.querySelector('.tl-clickband'), g = wrap.querySelector('.tl-markers');
      if(!band || !g) return;
      var chipsBox = wrap.parentNode.querySelector('.ak8-mark-chips');
      var min = +g.dataset.min, max = +g.dataset.max, steg = +g.dataset.steg, padL = +g.dataset.padl, padR = +g.dataset.padr, W = +g.dataset.w, y = +g.dataset.y, span = max - min;
      var NS = 'http://www.w3.org/2000/svg', sel = null;
      function Xv(v){ return padL + (v - min) / span * (W - padL - padR); }
      function fritt(chip){ chip.classList.remove('placed'); }
      function taBort(mk){ var c = chipsBox.querySelector('.ak8-mark-chip[data-v="' + mk.dataset.target + '"]'); if(c) fritt(c); mk.remove(); }
      function placera(v, chip){
        var grp = document.createElementNS(NS, 'g'); grp.setAttribute('class', 'tl-marker'); grp.dataset.v = v; grp.dataset.target = chip.dataset.v;
        var cx = Xv(v);
        var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', cx.toFixed(1)); c.setAttribute('cy', y); c.setAttribute('r', '6'); c.setAttribute('class', 'tl-marker-dot');
        var t = document.createElementNS(NS, 'text'); t.setAttribute('x', cx.toFixed(1)); t.setAttribute('y', y - 13); t.setAttribute('class', 'tl-marker-txt'); t.textContent = chip.textContent;
        grp.appendChild(c); grp.appendChild(t); g.appendChild(grp);
        grp.addEventListener('click', function(ev){ ev.stopPropagation(); taBort(grp); });
      }
      chipsBox.querySelectorAll('.ak8-mark-chip').forEach(function(ch){ ch.onclick = function(){ if(ch.classList.contains('placed')) return; chipsBox.querySelectorAll('.ak8-mark-chip').forEach(function(o){ o.classList.remove('sel'); }); ch.classList.add('sel'); sel = ch; }; });
      band.addEventListener('click', function(e){
        if(!sel) return;
        var rect = svg.getBoundingClientRect();
        var val = ((e.clientX - rect.left) / rect.width * W - padL) / (W - padL - padR) * span + min;
        var v = min + Math.round((val - min) / steg) * steg; v = Math.round(v * 1e6) / 1e6;
        if(v < min) v = min; if(v > max) v = max;
        Array.prototype.slice.call(g.querySelectorAll('.tl-marker')).forEach(function(mk){ if(Math.abs(+mk.dataset.v - v) < 1e-6) taBort(mk); });
        placera(v, sel); sel.classList.add('placed'); sel.classList.remove('sel'); sel = null;
      });
    });
    mount.querySelector('[data-kontroll]').onclick = function(){ kontrollera(mount, blad); };
    mount.querySelector('[data-reset]').onclick = function(){ CHECKS = []; renderBlad(mount, blad); };
    AK8_UI.bindSheet(mount);
  }

  function kontrollera(mount, blad){
    var svar = mount.querySelectorAll('.ak8-svar[data-idx]'), tot = 0, ratt = 0;
    svar.forEach(function(el){
      var res = CHECKS[+el.dataset.idx](el);
      if(res.flagg) return;   // flaggad rad utan facit — räknas ej
      if(!AK8_UI.besvarad(el)) return;   // obesvarad ruta räknas ej
      tot++;
      el.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.remove('ak8-ok', 'ak8-fel'); });
      var old = el.parentNode.querySelector('.ak8-fasit'); if(old) old.remove();
      if(res.chip){ el.querySelectorAll('.ak8-chip').forEach(function(c){ c.style.pointerEvents = 'none'; if(c.classList.contains('sel')) c.classList.add(res.ok ? 'ratt' : 'fel'); }); }
      else if(el.classList.contains('ak8-ordna')){ el.querySelectorAll('.ak8-tal').forEach(function(b){ b.style.pointerEvents = 'none'; }); el.classList.add(res.ok ? 'ak8-ok-ram' : 'ak8-fel-ram'); }
      else { el.querySelectorAll('.ak8-in').forEach(function(i){ i.classList.add(res.ok ? 'ak8-ok' : 'ak8-fel'); }); }
      AK8_UI.markera(el.closest('.ak8-rad') || el, res.ok);
      if(res.ok) ratt++;
      else if(res.facit){ var f = document.createElement('span'); f.className = 'ak8-fasit'; f.innerHTML = 'rätt: ' + res.facit; (el.closest('.ak8-rad') || el).appendChild(f); }
    });
    var sam = mount.querySelector('[data-sammanf]');
    if(ratt === tot && tot > 0){ sam.className = 'ovn-sammanf ok'; sam.style.display = ''; sam.innerHTML = '<div class="ovn-sammanf-icon">✓</div><span class="ovn-sammanf-titel">Allt rätt!</span>Du klarade alla ' + tot + '.'; if(window.visaAk8Konfetti) window.visaAk8Konfetti(); }
    else { sam.className = 'ovn-sammanf delvis'; sam.style.display = ''; sam.innerHTML = 'Du har ' + ratt + ' av ' + tot + ' rätt. Rätta de röda och tryck Kontrollera igen.'; }
    sam.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  window.BLAD_AK8_D2 = { A: BLAD_A, B: BLAD_B, C: BLAD_C, renderBlad: function(mount, key){ CHECKS = []; renderBlad(mount, ({ A:BLAD_A, B:BLAD_B, C:BLAD_C })[key]); }, helpers:{ frac:frac, pNum:pNum, fmt:fmt } };
})();

