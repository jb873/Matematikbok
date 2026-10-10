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
     · provaFormled(ledEl, svarEl, uppg) → { status, ok, ledOk, svarOk, ledOrsak, svarOrsak, orsak, besked }
                                 TILLÄGG 2026-10-10 (sjuans k2 d2 "Räkna med former"): ETT mellanled där varje tal
                                 skrivits om för sig i samma form, och ett exakt svar i ledets form. En väg per
                                 uppgift (uppg.vag 'dec' | 'brak'). Se FORMLEDET nedan. Ingen befintlig funktion ändrad.
     · formledDelar(exprEl), formledBesked(orsak), FORMLED_BESKED   — ledets termer; formledets elevtext.
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

  /* ── FORMLEDET (sjuans k2 d2 "Räkna med former", Joachims beslut 2026-10-10) ──────────────────────
     TILLÄGG: inget ovanför är ändrat, och ingen som använder modulen i dag anropar det här.
     Uppgiften blandar bråkform och decimalform. Mellanledet skriver om VARJE tal för sig, i SAMMA form,
     och svaret är exakt i ledets form. EN väg per uppgift (uppg.vag), avgjord av talen:
       'dec'   båda talen går att skriva exakt i decimalform → decimaltal; heltalet står kvar (3 − 0,8).
               Bråkvägen underkänns här (eget besked).
       'brak'  någon nämnare har andra faktorer än 2 och 5 (tredjedelar …) → båda talen som bråk, med
               gemensam nämnare (vilken som helst); heltalet som bråk (9/3 − 1/3); blandad form godtas
               i ledet (1 8/20 − 13/20).
     Svaret: exakt. 'dec' → decimalform. 'brak' → bråk i enklaste form, blandad form när det är större
     än 1 (finalStatus med kravet 'blandad': 13/10 underkänns med "skriv svaret i blandad form").
     uppg = { termer:[{t,n}…] (uppgiftens tal, exakt, i ordning), ops:['+'|'−'…], vag, varde:{t,n},
              ejExakt:{t,n} (det tal som inte går att skriva exakt — till beskedet) }.
     Cellen läses här och inte med tokens(): ett staplat bråk i ledet ska ha HELTAL i täljare och
     nämnare. tokens() räknar ut "3·3" och kan därför inte skilja ett omskrivet tal från en uträkning. */
  // ELEVTEXT, godkänd av Joachim 2026-10-10 (FAS 1-rapporten + det nya decimalVag). {brak} = uppg.ejExakt.
  var FORMLED_BESKED = {
    genvag:       { hint: 'Det där är svaret. Skriv först om båda talen i samma form.' },
    olikaForm:    { hint: 'Skriv båda talen i samma form – båda som bråk eller båda som decimaltal.' },
    ejExakt:      { hint: '{brak} går inte att skriva exakt i decimalform. Skriv båda talen i bråkform.' },
    avrundatSvar: { hint: 'Svaret ska vara exakt. Svara i samma form som ledet.' },
    varjeTal:     { hint: 'Skriv om varje tal för sig – vart och ett ska ha samma värde som i uppgiften.' },
    sammaNamnare: { hint: 'Skriv bråken med samma nämnare.' },
    decimalVag:   { hint: 'Båda talen går att skriva exakt i decimalform. Räkna med decimaltal.' }
  };
  // Formledets egna besked först, sedan svarsformens (blandad, förkorta, decimal, klart) ur BESKED.
  function formledBesked(orsak){ return ((FORMLED_BESKED[orsak] || BESKED[orsak]) || {}).hint || ''; }

  // Ledet → { termer:[{slag:'hel'|'dec'|'brak'|'blandad', varde, t?, n?}], ops:['+'|'−'] } eller { annat:true }.
  function formledDelar(expr){
    var lista = [], annat = false;
    Array.prototype.forEach.call(expr ? expr.children : [], function(ch){
      if(ch.classList.contains('ak8-exprtxt')){
        var s = String(ch.value).replace(/[\s ]/g, '').replace(/[-–—−]/g, '−'), i = 0;
        while(i < s.length){
          var c = s[i];
          if(c === '+' || c === '−'){ lista.push({ op: c }); i++; continue; }
          var m = /^\d+(?:[.,]\d+)?/.exec(s.slice(i));
          if(m){ lista.push({ tal: m[0] }); i += m[0].length; } else { annat = true; i++; }   // · / ( ) = …
        }
      } else if(ch.classList.contains('ovn-brak') && !ch.classList.contains('ovn-kbrak')){
        var ft = String(ch.querySelector('.ak8-frt').value).trim(), fn = String(ch.querySelector('.ak8-frn').value).trim();
        if(/^\d+$/.test(ft) && /^\d+$/.test(fn) && Number(fn) > 0) lista.push({ t: Number(ft), n: Number(fn) });
        else if(ft !== '' || fn !== '') annat = true;            // tomt byggt bråk räknas inte; uträkning i bråket gör
      } else annat = true;                                       // potens, komplexbråk
    });
    if(annat) return { annat: true };
    var termer = [], ops = [], i = 0, vantaTerm = true, tecken = 1;
    while(i < lista.length){
      var tk = lista[i];
      if(vantaTerm){
        if(tk.op === '−' && !termer.length && tecken === 1){ tecken = -1; i++; continue; }   // förtecken
        if(tk.tal !== undefined){
          var nx = lista[i + 1];
          if(/^\d+$/.test(tk.tal) && nx && nx.t !== undefined){   // heltal direkt följt av bråk = blandad form
            termer.push({ slag: 'blandad', varde: tecken * (Number(tk.tal) + nx.t / nx.n), t: nx.t, n: nx.n }); i += 2;
          } else {
            termer.push({ slag: /[.,]/.test(tk.tal) ? 'dec' : 'hel', varde: tecken * parseFloat(tk.tal.replace(',', '.')) }); i++;
          }
        } else if(tk.t !== undefined){ termer.push({ slag: 'brak', varde: tecken * tk.t / tk.n, t: tk.t, n: tk.n }); i++; }
        else return { annat: true };
        tecken = 1; vantaTerm = false;
      } else {
        if(tk.op === undefined) return { annat: true };          // två tal i rad utan räknetecken
        ops.push(tk.op); vantaTerm = true; i++;
      }
    }
    if(vantaTerm) return { annat: true };                        // tomt, eller slutar på ett tecken
    return { termer: termer, ops: ops };
  }

  // Är ett FEL decimalsvar ett avrundat rätt svar? (0,43 för 13/30: inom en halv enhet i sista decimalen)
  function avrundatTal(expr, v){
    var txt = ''; Array.prototype.forEach.call(expr.querySelectorAll('.ak8-exprtxt'), function(t){ txt += t.value; });
    txt = txt.replace(/[\s ]/g, '').replace(/[−–—]/g, '-');
    if(!/^-?\d+(?:[.,]\d+)?$/.test(txt)) return false;
    var d = (txt.split(/[.,]/)[1] || '').length, x = pNum(txt);
    return isFinite(x) && !likhet(x, v) && Math.abs(x - v) <= 0.5 * Math.pow(10, -d) + 1e-12;
  }

  function provaFormled(ledExpr, svarExpr, uppg){
    var ledFylld = fylld(ledExpr), svarFylld = fylld(svarExpr);
    if(!ledFylld && !svarFylld) return { status: 'tom', ok: false, ledOk: false, svarOk: false, orsak: null, besked: '' };
    var v = uppg.varde.t / uppg.varde.n;
    // LEDET
    var led = { ok: false, orsak: ledFylld ? 'fel' : 'saknas' };
    if(ledFylld){
      var p = formledDelar(ledExpr), raVarde = likhet(mixedEval(ledExpr), v);
      if(p.annat) led.orsak = raVarde ? 'varjeTal' : 'fel';
      else if(p.termer.length === 1) led.orsak = raVarde ? 'genvag' : 'fel';
      else if(p.termer.length !== uppg.termer.length || p.ops.join('') !== uppg.ops.join('')) led.orsak = raVarde ? 'varjeTal' : 'fel';
      else {
        var slag = p.termer.map(function(x){ return x.slag; });
        var harDec = slag.indexOf('dec') >= 0, harHel = slag.indexOf('hel') >= 0;
        var harBrak = slag.indexOf('brak') >= 0 || slag.indexOf('blandad') >= 0;
        if(harDec && harBrak) led.orsak = 'olikaForm';
        else if(uppg.vag === 'brak' && harHel && harBrak) led.orsak = 'olikaForm';     // heltalet ska skrivas som bråk
        else if(uppg.vag === 'brak' && harDec) led.orsak = 'ejExakt';
        else if(uppg.vag === 'dec' && harBrak) led.orsak = 'decimalVag';
        else if(!p.termer.every(function(x, i){ return likhet(x.varde, uppg.termer[i].t / uppg.termer[i].n); })) led.orsak = raVarde ? 'varjeTal' : 'fel';
        else if(uppg.vag === 'brak' && !p.termer.every(function(x){ return x.n === p.termer[0].n; })) led.orsak = 'sammaNamnare';
        else led = { ok: true, orsak: null };
      }
    }
    // SVARET
    var svar = { ok: false, orsak: svarFylld ? 'fel' : 'saknas' };
    if(svarFylld){
      var ff = finalForm(svarExpr), heltal = likhet(v, Math.round(v));
      if(!likhet(ff.num, v)) svar.orsak = (ff.kind === 'dec' && avrundatTal(svarExpr, v)) ? 'avrundatSvar' : 'fel';
      else {
        var st = (uppg.vag === 'dec' || (heltal && ff.kind === 'dec'))
          ? finalStatus(ff, { k: 'dec', x: v }, 'decimal')
          : finalStatus(ff, { k: 'br', t: uppg.varde.t, n: uppg.varde.n }, 'blandad');
        svar = st.status === 'ratt' ? { ok: true, orsak: null } : { ok: false, orsak: st.orsak || 'fel' };
      }
    }
    var ok = led.ok && svar.ok;
    var medBesked = function(o){ return o && o !== 'fel' && o !== 'saknas'; };
    var orsak = (!led.ok && medBesked(led.orsak)) ? led.orsak : ((!svar.ok && medBesked(svar.orsak)) ? svar.orsak : null);
    return { status: ok ? 'ratt' : (orsak ? 'form' : 'fel'), ok: ok, ledOk: led.ok, svarOk: svar.ok,
             ledOrsak: led.orsak, svarOrsak: svar.orsak, orsak: orsak, besked: orsak ? formledBesked(orsak) : '' };
  }

  window.Likhetsrattare = {
    mixedEval: mixedEval, finalForm: finalForm, finalCheck: finalCheck, finalStatus: finalStatus, ffAv: ffAv,
    besked: besked, BESKED: BESKED, provaKedja: provaKedja,
    segvarden: segvarden, provaBerakning: provaBerakning,
    likhet: likhet, gcd: gcd, pNum: pNum, fylld: fylld,
    provaFormled: provaFormled, formledDelar: formledDelar, formledBesked: formledBesked, FORMLED_BESKED: FORMLED_BESKED
  };
})();
