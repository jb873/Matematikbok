/* likhetsrattare.js — DELAD equality-rättare för bråk-likhetskedjor (window.Likhetsrattare).
   Extraherad VERBATIM ur blad-ak8-d6.js (add/sub bråk) där kärnan byggdes och bevisades.
   EN implementation som d6, mult (förkorta-innan) och problemlösnings-rutan alla lutar mot — inga dubbletter.

   Ingång: ett DOM-element `.ak8-expr` (uttryckscell ur ak8-blad-ui: text-rutor `.ak8-exprtxt`
   + inbäddade stående bråk `.ovn-brak` med `.ak8-frt`/`.ak8-frn`). Ingen mattelogik ändrad; bara flyttad.

   API (window.Likhetsrattare):
     · mixedEval(expr) → tal   — tolkar cellen som blandat-tals-uttryck (blandade tal "3 8/6",
                                 bråk, decimaler, + och −). NaN om ogiltig/tom.
     · finalForm(expr) → { kind:'mi'|'br'|'dec'|'expr'|'tom', num, t, n, simplest }
                                 klassificerar en SLUTruta; simplest = bråkdel reducerad (gcd=1) + proper (|t|<|n|).
     · finalCheck(ff, fin) → bool   — jämför finalForm mot förväntad slutform
                                 fin = {k:'mi',h,t,n} | {k:'br',t,n} | {k:'dec',x}. Kräver rätt kind + rätt värde + enklaste form.
     · provaKedja(exprEls, varde, fin) → { ok, allaLika, slutOk, antal }
                                 FRI equality-kedja (path-fritt): minst ett ifyllt led, VARJE ifyllt led = varde,
                                 sista ifyllda ledet = fin. Godtar alla giltiga vägar (+ − · /, lån, oäkta osv.).
     · likhet(a,b) [1e-9], gcd(a,b), pNum(s), fylld(exprEl)   — hjälpare för återanvändning.
   Laddas som klassiskt <script> FÖRE blad-ak8-dN.js / rut-motorn. Inget nätverk. */
(function(){
  'use strict';
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(/−/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function likhet(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }

  // ── TOKENISERING: en expr-cell → tokenström (tal, stående bråk, operatorer + − · /, likhetstecken) ──
  function tokens(expr){
    var toks = [];
    Array.prototype.forEach.call(expr.children, function(ch){
      if(ch.classList.contains('ak8-exprtxt')){
        var s = ch.value.replace(/[\s ]/g, '').replace(/−/g, '-').replace(/[·×]/g, '*').replace(/÷/g, '/').replace(/,/g, '.'), i = 0;
        while(i < s.length){
          var c = s[i];
          if(c === '+' || c === '-' || c === '*' || c === '/'){ toks.push({ op: c }); i++; }
          else if(c === '='){ toks.push({ eq: true }); i++; }
          else { var m = /^\d*\.?\d+/.exec(s.slice(i)); if(m){ toks.push({ num: parseFloat(m[0]) }); i += m[0].length; } else i++; }
        }
      } else if(ch.classList.contains('ovn-brak')){
        var t = pNum(ch.querySelector('.ak8-frt').value), n = pNum(ch.querySelector('.ak8-frn').value);
        toks.push({ frac: (isFinite(t) && isFinite(n) && n !== 0) ? t / n : NaN, t: t, n: n });
      }
    });
    return toks;
  }
  // Utvärdera EN tokenström (utan =) med prioritet: · / binder före + −; blandat tal = heltal DIREKT följt av bråk.
  function evalSeg(toks){
    var i = 0;
    function factor(){
      var tk = toks[i];
      if(!tk) return NaN;
      if(tk.op === '+'){ i++; return factor(); }
      if(tk.op === '-'){ i++; return -factor(); }
      if(tk.num != null){ i++; if(toks[i] && toks[i].frac != null){ var f = toks[i].frac; i++; return tk.num + f; } return tk.num; }  // blandat tal
      if(tk.frac != null){ i++; return tk.frac; }
      return NaN;
    }
    function term(){ var v = factor(); while(toks[i] && (toks[i].op === '*' || toks[i].op === '/')){ var o = toks[i].op; i++; var f = factor(); v = o === '*' ? v * f : v / f; } return v; }
    function expr(){ var v = term(); while(toks[i] && (toks[i].op === '+' || toks[i].op === '-')){ var o = toks[i].op; i++; var t = term(); v = o === '+' ? v + t : v - t; } return v; }
    if(!toks.length) return NaN;
    var r = expr();
    return (i === toks.length && isFinite(r)) ? r : NaN;
  }
  function mixedEval(expr){ return expr ? evalSeg(tokens(expr)) : NaN; }
  // Dela en cell på likhetstecken → array av segment-VÄRDEN (för uträkningar skrivna som "a = b = c" i en ruta).
  function segvarden(expr){
    if(!expr) return [];
    var toks = tokens(expr), segs = [[]];
    toks.forEach(function(tk){ if(tk.eq){ segs.push([]); } else { segs[segs.length - 1].push(tk); } });
    return segs.filter(function(s){ return s.length; }).map(evalSeg);
  }

  // Klassificera en SLUTruta: enklaste form? blandad/äkta bråk/decimal? (för "svara i enklaste form")
  function finalForm(expr){
    if(!expr) return { kind: 'tom', num: NaN };
    var fracs = expr.querySelectorAll('.ovn-brak'), val = mixedEval(expr);
    var wtxt = ''; Array.prototype.forEach.call(expr.querySelectorAll('.ak8-exprtxt'), function(t){ wtxt += t.value; });
    wtxt = wtxt.replace(/[\s ]/g, '').replace(/−/g, '-').replace(/,/g, '.');
    if(fracs.length === 1){
      var t = pNum(fracs[0].querySelector('.ak8-frt').value), n = pNum(fracs[0].querySelector('.ak8-frn').value);
      var proper = isFinite(t) && isFinite(n) && Math.abs(t) < Math.abs(n) && gcd(t, n) === 1;
      if(/^-?\d+$/.test(wtxt)) return { kind: 'mi', num: val, t: t, n: n, simplest: proper && parseInt(wtxt, 10) !== 0 };
      if(wtxt === '' || wtxt === '-') return { kind: 'br', num: val, t: t, n: n, simplest: proper };
      return { kind: 'expr', num: val };
    }
    if(fracs.length === 0 && /^-?\d*\.?\d+$/.test(wtxt)) return { kind: 'dec', num: val };
    return { kind: 'expr', num: val };
  }

  function finalCheck(ff, fin){
    if(fin.k === 'dec') return ff.kind === 'dec' && likhet(ff.num, fin.x);
    if(fin.k === 'br') return ff.kind === 'br' && likhet(ff.num, fin.t / fin.n) && ff.simplest;
    if(fin.k === 'mi') return ff.kind === 'mi' && likhet(ff.num, fin.h + fin.t / fin.n) && ff.simplest;
    return false;
  }

  // Är cellen ifylld (någon input har värde)?
  function fylld(e){ return !!(e && [].slice.call(e.querySelectorAll('input')).some(function(i){ return i.value.trim() !== ''; })); }

  // FRI equality-kedja: minst ett ifyllt led; varje ifyllt led = varde; sista ifyllda = fin (enklaste form). Path-fritt.
  function provaKedja(exprEls, varde, fin){
    var ifyllda = exprEls.filter(fylld);
    if(!ifyllda.length) return { ok: false, allaLika: false, slutOk: false, antal: 0 };
    var allaLika = ifyllda.every(function(e){ return likhet(mixedEval(e), varde); });
    var slutOk = finalCheck(finalForm(ifyllda[ifyllda.length - 1]), fin);
    return { ok: allaLika && slutOk, allaLika: allaLika, slutOk: slutOk, antal: ifyllda.length };
  }

  // FRI uträkning i beräknings-rutor: varje ruta är en intern likhetskedja ("a = b = c") vars segment
  // måste vara inbördes LIKA — annars likhetstecken-slarv (t.ex. 6+2=8·3=24 → underkänt). Path-fritt:
  // valfri korrekt uträkning inkl. · och /. Kräver minst en ifylld ruta (eleven ska visa uträkningen).
  // Det KORREKTA SLUTVÄRDET bärs av svars-rutan (finalCheck) — beräkningen prövar bara likhetstecknet,
  // så att t.ex. "29 − 17 = 12" (andel-problem, svar 12/29) godtas som giltig uträkning.
  function provaBerakning(boxEls){
    var filled = boxEls.filter(fylld);
    if(!filled.length) return { ok: false, reason: 'tom' };
    for(var b = 0; b < filled.length; b++){
      var segs = segvarden(filled[b]);
      if(!segs.length || segs.some(function(v){ return !isFinite(v); })) return { ok: false, reason: 'ogiltig' };
      for(var s = 1; s < segs.length; s++){ if(!likhet(segs[s], segs[0])) return { ok: false, reason: 'likhet' }; }
    }
    return { ok: true, reason: '' };
  }

  window.Likhetsrattare = {
    mixedEval: mixedEval, finalForm: finalForm, finalCheck: finalCheck, provaKedja: provaKedja,
    segvarden: segvarden, provaBerakning: provaBerakning,
    likhet: likhet, gcd: gcd, pNum: pNum, fylld: fylld
  };
})();
