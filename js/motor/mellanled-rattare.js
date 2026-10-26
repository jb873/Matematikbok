/* mellanled-rattare.js — MELLANLEDET MELLAN UTTRYCKET OCH SVARET (order 2026-10-04).
 *
 * JOACHIMS REGEL, ordagrant: "samma termer som i uttrycket, men parenteserna borttagna. Står det
 * minus framför en parentes byts tecknen inuti den, står det plus behålls de. Ett mellanled där
 * termer redan slagits ihop är fel, även om värdet stämmer."
 *     11x − (−5 − 9x)  →  11x + 5 + 9x  →  20x + 5
 *
 * DÄRFÖR RÄTTAS DET INTE PÅ VÄRDE. Ett värdeprov hade godkänt slutsvaret skrivet i
 * mellanledsraden, och då är kravet tomt — mellanledet finns ju för att visa steget, inte
 * resultatet. Jämförelsen är i stället TERMVIS.
 *
 * ORDNINGEN ÄR FRI (Joachim 2026-10-04): jämförelsen är en multimängd. En elev som skriver
 * 11x + 9x + 5 har samma termer, bara omkastade, och addition är kommutativ.
 *
 * FACITET BYGGS MEKANISKT ur uppgiftens uttryck — aldrig skrivet för hand. Uttrycket delas i
 * tecknade grupper på toppnivå; för varje parentes appliceras det yttre tecknet på varje term
 * inuti; termerna skrivs ut i ordning. Ingen hopslagning. Så kan facit aldrig driva isär från
 * uppgiften.
 *
 * KRÄVT ELLER FRIVILLIGT ligger i DATAN (mellanled: 'kravt' | 'frivilligt'), räknat ur regel 7:
 * minus framför en parentes → krävt. Rubriktexten styr ingenting — den är elevtext och får
 * formuleras om utan att kravet ändras.
 *
 * FRIVILLIGT MELLANLED: en tom rad är varken fel eller räknad i nämnaren. En IFYLLD rad rättas
 * som ett krävt mellanled.
 *
 * Node + browser. Ingen nätväg. */
(function(){
  'use strict';

  /* Beskeden är ELEVTEXT, godkända av Joachim 2026-10-04 och registrerade i elevtext-låset.
     De visas EFTER svar — återkoppling, aldrig hjälptext före. */
  var BESKED = {
    parentes:   'Parentesen ska vara borttagen i mellanledet.',
    hopslaget:  'Du har redan slagit ihop termer. Skriv först alla termer utan parentes.',
    tecken:     'Kolla tecknen — står det minus framför en parentes byter alla termer inuti tecken.',
    koefficient:'Ett av talen stämmer inte. Jämför term för term.',
    termer:     'Jämför term för term med uppgiften.'
  };

  function AB(){ return (typeof window !== 'undefined' && window.AlgBrak) || MELLAN._ab; }

  // Normalisera en term till jämförbar form: gemener, inga mellanslag, inget · eller *,
  // alla minusvarianter till '-', och koefficienten 1 utskriven så x och 1x är samma term.
  function normTerm(t){
    var s = String(t).replace(/\s+/g, '').replace(/[·*]/g, '')
                     .replace(/[−–—]/g, '-').toLowerCase();
    if(s === '') return '';
    var neg = s[0] === '-';
    if(neg || s[0] === '+') s = s.slice(1);
    s = s.replace(/^([a-z])/, '1$1');          // x → 1x
    if(/^[0-9]/.test(s) === false) s = '1' + s; // säkerhetsnät
    return (neg ? '-' : '') + s;
  }

  /* KANONISK TERM (Joachim 2026-10-26, multiplikation med parentes). En produkt kan skrivas med
     bokstäverna i valfri ordning och exponenten på två sätt: 7yx och 7xy, y² och y^2 är samma
     term. Kanonen sorterar bokstäverna och skriver exponenten ^n; ett bråktal står sist (7/4x och
     7x/4 → 7x/4). TALEN RÄKNAS ALDRIG OM: 18x/3 förblir 18x/3, och 3·2x är inte 6x — ett led
     ska visa produkterna uträknade, och en kanon som räknade åt eleven hade gjort kravet tomt.
     Samma bokstav två gånger (yy, x·x) är en oräknad produkt och lämnas som den är. En term som
     inte har formen lämnas som normTerm gör den — för del 1:s termer blir resultatet detsamma. */
  var TERM = /^(\d+(?:,\d+)?)?((?:[a-z](?:\^\d+)?)*)(?:\/(\d+(?:,\d+)?))?$/;
  var TERM_BRAK_FORE = /^(\d+(?:,\d+)?)\/(\d+(?:,\d+)?)((?:[a-z](?:\^\d+)?)+)$/;
  function kanon(t){
    var ab = AB(), s = String(t);
    if(ab && ab.utanUpphojt) s = ab.utanUpphojt(s);
    var n = normTerm(s);
    if(n === '') return '';
    var neg = n[0] === '-', r = neg ? n.slice(1) : n, m = TERM.exec(r), tal, bok, nam;
    if(m){ tal = m[1]; bok = m[2]; nam = m[3]; }
    else if((m = TERM_BRAK_FORE.exec(r))){ tal = m[1]; nam = m[2]; bok = m[3]; }
    else return n;
    var delar = [], sett = {};
    (bok.match(/[a-z](?:\^\d+)?/g) || []).forEach(function(d){ delar.push(d); sett[d[0]] = (sett[d[0]] || 0) + 1; });
    if(Object.keys(sett).some(function(b){ return sett[b] > 1; })) return n;   // yy: oräknad produkt
    delar = delar.map(function(d){ return d.replace(/\^1$/, ''); }).sort();
    return (neg ? '-' : '') + (tal || '1') + delar.join('') + (nam ? '/' + nam : '');
  }

  /* ── PRODUKT MED PARENTES ────────────────────────────────────────────────────────────────
     JOACHIMS REGEL 2026-10-26: "parenteserna borttagna, varje produkt uträknad, inget hopslaget."
       7 + 2(3x + 5)           →  7 + 6x + 10
       (x + 2)(x + 3)          →  x² + 3x + 2x + 6
       3b(5a + 7) − 3b(a − 1)  →  15ab + 21b − 3ab + 3b
     En toppnivågrupp som är en PRODUKT av faktorer där minst en är en parentes multipliceras ut
     term för term, i ordning: först termerna i första faktorn, var och en gånger varje term i
     nästa. Alla andra grupper går den gamla vägen, och del 1 påverkas därför inte.
     Faktorer: heltal, variabel (med exponent), parentes (med exponent) och division med ett
     heltal (x/3). Decimaltal och nästlade parenteser multipliceras inte här — gruppen går då den
     gamla vägen, och det är en uppgift som ingen regel ännu beskriver. */
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var x = a % b; a = b; b = x; } return a || 1; }
  function Q(n, d){ d = d || 1; if(d < 0){ n = -n; d = -d; } var g = gcd(n, d); return { n: n / g, d: d / g }; }
  function mono(k, v){ return { k: k, v: v || {} }; }
  function monoMul(a, b){
    var v = {}, c;
    for(c in a.v) v[c] = (v[c] || 0) + a.v[c];
    for(c in b.v) v[c] = (v[c] || 0) + b.v[c];
    return mono(Q(a.k.n * b.k.n, a.k.d * b.k.d), v);
  }
  // En term ur en parentes, t.ex. "-6", "3x", "x/3", "7xy" → monom. null = inte ett heltalsmonom.
  function monoAv(t){
    var s = String(t).replace(/\s+/g, '').replace(/[·*]/g, '').replace(/[−–—]/g, '-');
    var neg = s[0] === '-'; if(neg || s[0] === '+') s = s.slice(1);
    var m = /^(\d+)?((?:[a-z](?:\^\d+)?)*)(?:\/(\d+))?$/.exec(s);
    if(!m || (!m[1] && !m[2])) return null;
    var v = {};
    (m[2].match(/[a-z](?:\^\d+)?/g) || []).forEach(function(d){ v[d[0]] = (v[d[0]] || 0) + (d.length > 1 ? +d.slice(2) : 1); });
    return mono(Q((neg ? -1 : 1) * (m[1] ? +m[1] : 1), m[3] ? +m[3] : 1), v);
  }
  function monoText(mo){
    var bok = Object.keys(mo.v).filter(function(c){ return mo.v[c]; }).sort()
                .map(function(c){ return c + (mo.v[c] > 1 ? '^' + mo.v[c] : ''); }).join('');
    return (mo.k.n < 0 ? '-' : '') + Math.abs(mo.k.n) + bok + (mo.k.d > 1 ? '/' + mo.k.d : '');
  }
  /* Gruppens faktorer, eller null om gruppen inte är en produkt med parentes. */
  function faktorer(raw){
    var ab = AB(), s = String(raw).replace(/\s+/g, '').replace(/[·*]/g, '·').replace(/[−–—]/g, '-');
    if(ab && ab.utanUpphojt) s = ab.utanUpphojt(s);
    if(s.indexOf('(') < 0) return null;
    var f = [], i = 0, harParentes = false;
    function exponent(){ if(s[i] !== '^') return 1; i++; var e = ''; while(/[0-9]/.test(s[i] || '')) e += s[i++]; return +e || 1; }
    while(i < s.length){
      var c = s[i];
      if(c === '·'){ i++; continue; }
      if(c === '('){
        var djup = 0, j = i;
        for(; j < s.length; j++){ if(s[j] === '(') djup++; if(s[j] === ')'){ djup--; if(!djup) break; } }
        if(j >= s.length) return null;
        var inre = s.slice(i + 1, j);
        if(/[()]/.test(inre) || /\d,\d/.test(inre)) return null;   // nästlat eller decimaltal: gamla vägen
        i = j + 1;
        var termer = (AB() ? AB().termerAv(inre) : []).map(monoAv);
        if(!termer.length || termer.some(function(t){ return !t; })) return null;
        f.push({ termer: termer, pot: exponent() }); harParentes = true; continue;
      }
      if(/[0-9]/.test(c)){
        var tal = ''; while(/[0-9]/.test(s[i] || '')) tal += s[i++];
        if(s[i] === ',') return null;
        f.push({ termer: [mono(Q(+tal))], pot: 1 }); continue;
      }
      if(/[a-z]/.test(c)){ i++; var v = {}; v[c] = exponent(); f.push({ termer: [mono(Q(1), v)], pot: 1 }); continue; }
      if(c === '/'){
        i++; var nm = ''; while(/[0-9]/.test(s[i] || '')) nm += s[i++];
        if(!nm) return null;
        f.push({ termer: [mono(Q(1, +nm))], pot: 1 }); continue;
      }
      return null;
    }
    return harParentes && f.length > 1 || (harParentes && f[0].pot > 1) ? f : null;
  }
  function multipliceraUt(f){
    var acc = [mono(Q(1))];
    f.forEach(function(fa){
      for(var p = 0; p < fa.pot; p++){
        var ny = [];
        acc.forEach(function(a){ fa.termer.forEach(function(b){ ny.push(monoMul(a, b)); }); });
        acc = ny;
      }
    });
    return acc.filter(function(m){ return m.k.n !== 0; });
  }

  function vand(t){
    var s = String(t);
    return s[0] === '-' ? s.slice(1) : '-' + s;
  }

  /* Dela uttrycket i toppnivågrupper: [{tecken:'+'|'-', text:'...', parentes:bool}] */
  function grupper(uttryck){
    var s = String(uttryck).replace(/\s+/g, '').replace(/[−–—]/g, '-');
    var ut = [], tecken = '+', buf = '', djup = 0, i;
    function skjut(){
      if(buf !== ''){
        var p = buf[0] === '(' && buf[buf.length - 1] === ')';
        // raw: gruppen som den står — en produkt som (x + 2)(x + 3) ser ut som en parentes här.
        ut.push({ tecken: tecken, text: p ? buf.slice(1, -1) : buf, parentes: p, raw: buf });
      }
      buf = '';
    }
    for(i = 0; i < s.length; i++){
      var c = s[i];
      if(c === '(') djup++;
      if(c === ')') djup--;
      if(djup === 0 && (c === '+' || c === '-') && i > 0 && !/[+\-*\/^]/.test(s[i - 1])){
        skjut(); tecken = c; continue;
      }
      if(i === 0 && (c === '+' || c === '-')){ tecken = c; continue; }
      buf += c;
    }
    skjut();
    return ut;
  }

  /* FACITETS MELLANLED: parenteserna borttagna, tecknen bytta där det stod minus framför.
     Returnerar en lista normaliserade termer — ingen hopslagning. */
  function facitTermer(uttryck){
    var ab = AB(), ut = [];
    grupper(uttryck).forEach(function(g){
      // UTAN AlgBrak GÅR DET INTE ATT RÄTTA. Modulen föll förr tyst tillbaka på hela gruppen som
      // EN term, och gav då ett mellanled som varken är elevens eller matematikens — ett fel som
      // syns först i elevens ruta. Mätt: i node (där window saknas) godkändes ett teckenfel och
      // det riktiga mellanledet underkändes. Fel rättning får inte vara tyst.
      if(!ab) throw new Error("MellanledRattare: AlgBrak saknas — mellanledet kan inte rättas");
      var f = faktorer(g.raw);
      if(f){                                                   // produkt med parentes: multiplicera ut
        multipliceraUt(f).forEach(function(mo){
          var n = kanon(monoText(mo));
          ut.push(g.tecken === '-' ? vand(n) : n);
        });
        return;
      }
      var inre = ab.termerAv(g.text);
      inre.forEach(function(t){
        var n = kanon(t);
        if(n === '') return;
        ut.push(g.tecken === '-' ? vand(n) : n);
      });
    });
    return ut;
  }

  function multimangd(lista){
    var m = {};
    lista.forEach(function(t){ m[t] = (m[t] || 0) + 1; });
    return m;
  }
  function likaMangd(a, b){
    var ka = Object.keys(a), kb = Object.keys(b);
    if(ka.length !== kb.length) return false;
    for(var i = 0; i < ka.length; i++) if(a[ka[i]] !== b[ka[i]]) return false;
    return true;
  }

  /* Rättar elevens mellanled mot uppgiftens uttryck.
     krav: 'kravt' | 'frivilligt'. Tom rad vid 'frivilligt' → {status:'hoppat'} (varken rätt, fel
     eller räknad i nämnaren). Tom rad vid 'kravt' → {status:'tom'}, som behandlas som obesvarad. */
  function grade(elev, uttryck, krav){
    var txt = (elev == null ? '' : String(elev)).trim();
    if(txt === '') return { status: krav === 'frivilligt' ? 'hoppat' : 'tom' };

    if(/[()]/.test(txt)) return { status: 'fel', fall: 'parentes', besked: BESKED.parentes };

    var ab = AB();
    var elevT = (ab ? ab.termerAv(txt) : txt.split('+')).map(kanon).filter(Boolean);
    var facitT = facitTermer(uttryck);
    if(!elevT.length) return { status: 'tom' };

    var eM = multimangd(elevT), fM = multimangd(facitT);
    if(likaMangd(eM, fM)) return { status: 'ratt' };

    // FÄRRE TERMER → eleven har slagit ihop. Skiljer sig från "glömt en term" genom att
    // värdet ändå stämmer: en riktig hopslagning bevarar värdet, en glömd term gör det inte.
    if(elevT.length < facitT.length){
      var varde = ab && ab.parse && ab.pointEqual;
      var likaVarde = false;
      if(varde){
        try { likaVarde = ab.pointEqual(ab.parse(txt), ab.parse(facitT.join('+').replace(/\+-/g, '-'))); }
        catch(e){ likaVarde = false; }
      }
      return likaVarde
        ? { status: 'fel', fall: 'hopslaget', besked: BESKED.hopslaget }
        : { status: 'fel', fall: 'termer', besked: BESKED.termer };
    }

    // SAMMA ANTAL TERMER: är det bara tecknen som skiljer?
    if(elevT.length === facitT.length){
      var utanTecken = function(m){
        var o = {}; Object.keys(m).forEach(function(k){
          var b = k[0] === '-' ? k.slice(1) : k; o[b] = (o[b] || 0) + m[k];
        }); return o;
      };
      if(likaMangd(utanTecken(eM), utanTecken(fM)))
        return { status: 'fel', fall: 'tecken', besked: BESKED.tecken };
      return { status: 'fel', fall: 'koefficient', besked: BESKED.koefficient };
    }

    return { status: 'fel', fall: 'termer', besked: BESKED.termer };
  }

  /* REGEL 7, mekanisk: minus framför en parentes → mellanled krävt. Bara plus framför parenteser
     → frivilligt. Ingen parentes → inget mellanled.
     Den här funktionen är källan till data-flaggan; den läser ALDRIG rubriktext. */
  /* MULTIPLIKATION (Joachim 2026-10-26): ledet krävs bara där det SKILJER SIG från svaret, alltså
     där två termer i det utmultiplicerade ledet har samma variabeldel och ska slås ihop.
     6(x + 7) → 6x + 42 är redan svaret, och ett led där vore en kopia. Står det minus framför en
     parentes gäller regel 7 som förut. */
  function kravAv(uttryck){
    var g = grupper(uttryck);
    var produkt = g.map(function(x){ return !!faktorer(x.raw); });
    var harParentes = g.some(function(x, i){ return x.parentes || produkt[i]; });
    if(!harParentes) return null;
    if(g.some(function(x, i){ return x.parentes && !produkt[i] && x.tecken === '-'; })) return 'kravt';
    if(produkt.some(Boolean)) return ledSkiljer(uttryck) ? 'kravt' : null;
    return 'frivilligt';
  }
  // Har ledet två termer med samma variabeldel (konstanter räknas som en variabeldel)?
  function ledSkiljer(uttryck){
    var sett = {};
    return facitTermer(uttryck).some(function(t){
      var k = t.replace(/^-/, '').replace(/^[\d,]+/, '').replace(/\/[\d,]+$/, '');
      if(sett[k]) return true; sett[k] = 1; return false;
    });
  }

  var MELLAN = { grade: grade, facitTermer: facitTermer, kravAv: kravAv, kanon: kanon,
                 grupper: grupper, normTerm: normTerm, BESKED: BESKED, _ab: null };
  if(typeof window !== 'undefined') window.MellanledRattare = MELLAN;
  if(typeof module !== 'undefined' && module.exports) module.exports = MELLAN;
})();
