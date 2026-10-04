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
        ut.push({ tecken: tecken, text: p ? buf.slice(1, -1) : buf, parentes: p });
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
      var inre = ab ? ab.termerAv(g.text) : [g.text];
      inre.forEach(function(t){
        var n = normTerm(t);
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
    var elevT = (ab ? ab.termerAv(txt) : txt.split('+')).map(normTerm).filter(Boolean);
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
  function kravAv(uttryck){
    var g = grupper(uttryck);
    var harParentes = g.some(function(x){ return x.parentes; });
    if(!harParentes) return null;
    return g.some(function(x){ return x.parentes && x.tecken === '-'; }) ? 'kravt' : 'frivilligt';
  }

  var MELLAN = { grade: grade, facitTermer: facitTermer, kravAv: kravAv,
                 grupper: grupper, normTerm: normTerm, BESKED: BESKED, _ab: null };
  if(typeof window !== 'undefined') window.MellanledRattare = MELLAN;
  if(typeof module !== 'undefined' && module.exports) module.exports = MELLAN;
})();
