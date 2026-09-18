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
     · finalStatus(ff, fin, krav) → { status:'ratt'|'form'|'fel', orsak }   — TRE LÄGEN (som alg-brak):
                                 'fel' = fel värde · 'form' = RÄTT värde men fel form · 'ratt'. orsak (vid form):
                                 'blandad' | 'brak' | 'brakform' | 'decimal' | 'forkorta' | 'klart' → BESKED[orsak].
                                 fin = {k:'mi',h,t,n} | {k:'br',t,n} | {k:'dec',x}.
                                 krav = SVARSFORMEN uppgiften ställer (bandet/gruppen, inte rubriktexten):
                                   'enklaste' (default) — förkortat; blandad ELLER oäkta godtas (19/15-beslutet)
                                   'blandad' — blandad form krävs (oäkta → 'form')
                                   'brak'    — bråkform krävs (blandad → 'form')
                                   'decimal' — decimalform krävs
     · finalCheck(ff, fin, krav) → bool   — finalStatus(...).status === 'ratt'.
     · ffAv(hel, t, n) → ff       — finalForm-objekt ur lösa fält (hel-ruta + stående bråk, t.ex. nians celler).
     · besked(orsak) → sträng     — elevtexten för ett form-läge (BESKED-fälten; formuleringen är Joachims).
     · provaKedja(exprEls, varde, fin, krav) → { ok, allaLika, slutOk, antal, status, orsak }
                                 FRI equality-kedja (path-fritt): minst ett ifyllt led, VARJE ifyllt led = varde,
                                 sista ifyllda ledet = fin. Godtar alla giltiga vägar (+ − · /, lån, oäkta osv.).
     · likhet(a,b) [1e-9], gcd(a,b), pNum(s), fylld(exprEl)   — hjälpare för återanvändning.
   Laddas som klassiskt <script> FÖRE blad-ak8-dN.js / rut-motorn. Inget nätverk. */
(function(){
  'use strict';
  function pNum(s){ if(s == null) return NaN; s = String(s).replace(/[\s ]/g, '').replace(/[−–—]/g, '-').replace(',', '.'); return s === '' ? NaN : parseFloat(s); }   // alla minusvarianter (U+2212, –, —) — förr bara U+2212 (order 2026-09-18 FAS 1)
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function likhet(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9; }
  // Täljare/nämnare i ett stående bråk får vara ett UTTRYCK ("5·4") — multiplikationens mellanled är
  // (5·4)/(6·7) (åk8 mult/div, 2026-09-15). AK8_UI.evalArith när den finns, annars rent tal (nian utan AK8_UI).
  function talVarde(s){ return (window.AK8_UI && AK8_UI.evalArith) ? AK8_UI.evalArith(s) : pNum(s); }
  function harOperator(s){ return /[+\-−–—·×*\/]/.test(String(s || '').replace(/^\s*[-−]/, '')); }   // ledande minus = tecken, inte operator

  // ── TOKENISERING: en expr-cell → tokenström (tal, stående bråk, operatorer + − · /, likhetstecken) ──
  function tokens(expr){
    var toks = [];
    Array.prototype.forEach.call(expr.children, function(ch){
      if(ch.classList.contains('ak8-exprtxt')){
        var s = ch.value.replace(/[\s ]/g, '').replace(/[−–—]/g, '-').replace(/[·×]/g, '*').replace(/÷/g, '/').replace(/,/g, '.'), i = 0;
        while(i < s.length){
          var c = s[i];
          if(c === '+' || c === '-' || c === '*' || c === '/'){ toks.push({ op: c }); i++; }
          else if(c === '='){ toks.push({ eq: true }); i++; }
          else { var m = /^\d*\.?\d+/.exec(s.slice(i)); if(m){ toks.push({ num: parseFloat(m[0]) }); i += m[0].length; } else i++; }
        }
      } else if(ch.classList.contains('ovn-kbrak')){
        // Staplat komplex-bråk: täljare/nämnare är nästlade uttrycks-celler → rekursera tokens+evalSeg
        // in i dem och lägg värdet som ett bråk-token. (Additivt; platta .ovn-brak orörda.)
        var top = ch.querySelector('.ovn-kbrak-topp .ak8-expr'), bot = ch.querySelector('.ovn-kbrak-botten .ak8-expr');
        var tv = top ? evalSeg(tokens(top)) : NaN, bv = bot ? evalSeg(tokens(bot)) : NaN;
        toks.push({ frac: (isFinite(tv) && isFinite(bv) && bv !== 0) ? tv / bv : NaN, t: tv, n: bv });
      } else if(ch.classList.contains('ovn-brak')){
        var t = talVarde(ch.querySelector('.ak8-frt').value), n = talVarde(ch.querySelector('.ak8-frn').value);
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
    wtxt = wtxt.replace(/[\s ]/g, '').replace(/[−–—]/g, '-').replace(/,/g, '.');
    if(fracs.length === 1){
      var ft = fracs[0].querySelector('.ak8-frt').value, fn = fracs[0].querySelector('.ak8-frn').value;
      if(harOperator(ft) || harOperator(fn)) return { kind: 'expr', num: val };   // (2·2)/(3·3) är ett led, inte ett SVAR i enklaste form
      var t = pNum(ft), n = pNum(fn);
      var proper = isFinite(t) && isFinite(n) && Math.abs(t) < Math.abs(n) && gcd(t, n) === 1;
      if(/^-?\d+$/.test(wtxt)) return { kind: 'mi', num: val, hel: parseInt(wtxt, 10), t: t, n: n, simplest: proper && parseInt(wtxt, 10) !== 0 };
      if(wtxt === '' || wtxt === '-') return { kind: 'br', num: val, hel: 0, t: t, n: n, simplest: proper };
      return { kind: 'expr', num: val };
    }
    if(fracs.length === 0 && /^-?\d*\.?\d+$/.test(wtxt)) return { kind: 'dec', num: val };
    return { kind: 'expr', num: val };
  }

  // ff ur lösa fält (nians/d8:s celler: hel-ruta + täljare/nämnare). hel = null/0 → bråk, annars blandad.
  function ffAv(hel, t, n){
    var h = (hel == null || !isFinite(hel)) ? 0 : hel;
    var proper = isFinite(t) && isFinite(n) && Math.abs(t) < Math.abs(n) && gcd(t, n) === 1;
    var num = (isFinite(t) && isFinite(n) && n !== 0) ? h + t / n : NaN;
    if(h !== 0) return { kind: 'mi', num: num, hel: h, t: t, n: n, simplest: proper };
    return { kind: 'br', num: num, hel: 0, t: t, n: n, simplest: proper };
  }

  // ELEVTEXT för form-lägena, som FÄLT (elevtext-låset). Godkända av Joachim 2026-09-15 med två ändringar:
  // ETT uttryck genomgående ("Rätt värde – …", samma som gy-fördjupningen), och klart-texten pekar på vad som saknas.
  var BESKED = {
    blandad:  { hint: 'Rätt värde – skriv svaret i blandad form.' },
    // 'brak' NÅS INTE i dag: där bråkform krävs ritas cellen utan hel-ruta, så eleven kan inte skriva blandad form.
    // Texten finns för att regeln är komplett, inte som bevis på att fallet är täckt i någon vy.
    brak:     { hint: 'Rätt värde – skriv svaret som ett bråk, utan heltal.' },
    brakform: { hint: 'Rätt värde – skriv svaret i bråkform.' },
    decimal:  { hint: 'Rätt värde – svara i decimalform.' },
    forkorta: { hint: 'Rätt värde – förkorta svaret.' },
    klart:    { hint: 'Rätt värde – räkna ut sista ledet.' }
  };
  function besked(orsak){ return (BESKED[orsak] || {}).hint || ''; }

  // TRE LÄGEN. Värdet först: fel värde = 'fel'. Rätt värde → formen avgör: 'ratt' eller 'form' + orsak.
  // krav = svarsformen uppgiften ställer. 'enklaste' (default): förkortat räcker — blandad OCH oäkta i
  // lägsta termer godtas (Joachim 2026-09-15: "19/15 godkänns"). 'blandad'/'brak'/'decimal' = formen krävs
  // (Joachim: "står det blandad form ska bråkform inte godkännas" — och spegelvänt).
  function finalStatus(ff, fin, krav){
    krav = krav || 'enklaste';
    var v = fin.k === 'dec' ? fin.x : fin.k === 'mi' ? fin.h + fin.t / fin.n : fin.t / fin.n;
    if(!ff || !likhet(ff.num, v)) return { status: 'fel' };
    function form(o){ return { status: 'form', orsak: o }; }
    var R = { status: 'ratt' };
    if(fin.k === 'dec' || krav === 'decimal') return ff.kind === 'dec' ? R : form('decimal');
    if(ff.kind === 'dec') return form('brakform');          // 0,5 där ett bråk väntas
    if(ff.kind !== 'mi' && ff.kind !== 'br') return form('klart');   // uttryck/led, inte ett svar
    var lagst = isFinite(ff.t) && isFinite(ff.n) && gcd(ff.t, ff.n) === 1;
    var proper = lagst && Math.abs(ff.t) < Math.abs(ff.n);
    if(ff.kind === 'mi' && ff.hel !== 0){                    // blandad form skriven
      if(krav === 'brak') return form('brak');
      if(!lagst) return form('forkorta');
      if(!proper) return form('blandad');                    // 1 7/2 — bråkdelen ska vara äkta
      return R;
    }
    // bråkform skriven (hel-rutan tom eller 0)
    if(!lagst) return form('forkorta');
    if(krav === 'blandad' && !proper) return form('blandad');   // 15/4 där blandad form krävs
    return R;
  }
  function finalCheck(ff, fin, krav){ return finalStatus(ff, fin, krav).status === 'ratt'; }

  // Är cellen ifylld (någon input har värde)?
  function fylld(e){ return !!(e && [].slice.call(e.querySelectorAll('input')).some(function(i){ return i.value.trim() !== ''; })); }

  // FRI equality-kedja: minst ett ifyllt led; varje ifyllt led = varde; sista ifyllda = fin (enklaste form). Path-fritt.
  function provaKedja(exprEls, varde, fin, krav){
    var ifyllda = exprEls.filter(fylld);
    if(!ifyllda.length) return { ok: false, allaLika: false, slutOk: false, antal: 0, status: 'fel' };
    var allaLika = ifyllda.every(function(e){ return likhet(mixedEval(e), varde); });
    var fs = finalStatus(finalForm(ifyllda[ifyllda.length - 1]), fin, krav), slutOk = fs.status === 'ratt';
    return { ok: allaLika && slutOk, allaLika: allaLika, slutOk: slutOk, antal: ifyllda.length,
             status: allaLika ? fs.status : 'fel', orsak: allaLika ? fs.orsak : undefined };
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
    mixedEval: mixedEval, finalForm: finalForm, finalCheck: finalCheck, finalStatus: finalStatus, ffAv: ffAv,
    besked: besked, BESKED: BESKED, provaKedja: provaKedja,
    segvarden: segvarden, provaBerakning: provaBerakning,
    likhet: likhet, gcd: gcd, pNum: pNum, fylld: fylld
  };
})();
