/* ============================================================
   ovamer-k2-mult.js — MULTIPLIKATIONS-DRILLEN för k2 Del 6.
   NY fil — rör inte ovamer-k2.js/korOvning eller något befintligt mellanled.
   Laddas i ak7-k2-ram.html EFTER ovamer-k2.js och registreras i K2_DRILL som
   'brak-mult-rakna' → loggar till noden brak-mult-rakna:rakna → färgar Del 6.

   En färdighet (korOvning, tresektions-rättning, konfetti):
     multBrakEngine — multiplicera bråk. Nivå 1 bråk·bråk + heltal·bråk;
     nivå 2 heltal·bråk (svar>1), bråk·bråk med korsförkortning, blandad·heltal;
     nivå 3 blandad·bråk + STORA TAL med förkortnings-mellanled (à la Del 7).

   Facit = värdetest ur talen (aldrig hårdkodat). Svar ALLTID i enklaste form;
   täljare > nämnare → blandad form (heltalsruta + äkta bråkdel). Stora tal:
   förkortnings-mellanled — täljar-/nämnarfaktorer rättas på VÄRDE (valfri giltig
   korsförkortning godtas), slutsvaret mot enklaste form. Bråk stående (frac).

   Rena generatorer (injicerbar rnd) exponeras för fuzz/runs-test.
   ============================================================ */
(function(){
  'use strict';
  function _gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = b; b = a % b; a = t; } return a || 1; }
  function _kanonisk(t, n){ if(n < 0){ t = -t; n = -n; } var g = _gcd(t, n); t /= g; n /= g; var hel = Math.floor(t / n), rem = t - hel * n; if(rem === 0) return { hel: hel, t: 0, n: 1 }; return { hel: hel, t: rem, n: n }; }
  function _drawProper(maxN, rnd){ for(;;){ var n = 2 + Math.floor(rnd() * (maxN - 1)); var t = 1 + Math.floor(rnd() * (n - 1)); if(_gcd(t, n) === 1) return [t, n]; } }

  // ── Rena generatorer ─────────────────────────────────────────
  // Stora tal med TVINGAD korsförkortning: konstruera ur små mål-faktorer p/q + korsfaktorer g1,g2.
  // t1=p1·g1, n1=q1·g2, t2=p2·g2, n2=q2·g1 → t1&n2 delar g1, t2&n1 delar g2. Svaret = p1p2/q1q2.
  function genStora(level, rnd){
    rnd = rnd || Math.random;
    var p1 = 1 + Math.floor(rnd() * 3), q1 = 2 + Math.floor(rnd() * 2);
    var p2 = 1 + Math.floor(rnd() * 2), q2 = 2 + Math.floor(rnd() * 2);
    var GP = [7, 11, 13, 17], g1 = GP[Math.floor(rnd() * GP.length)], g2 = GP[Math.floor(rnd() * GP.length)];
    var t1 = p1 * g1, n1 = q1 * g2, t2 = p2 * g2, n2 = q2 * g1;
    var num = t1 * t2, den = n1 * n2;
    return { kind: 'stora', t1: t1, n1: n1, t2: t2, n2: n2, num: num, den: den, V: num / den, ans: _kanonisk(num, den), p1: p1, q1: q1, p2: p2, q2: q2 };
  }
  // Grunddrill: två faktorer (bråk/heltal/blandad), facit i enklaste/blandad form.
  function genMultBrak(level, rnd){
    rnd = rnd || Math.random; level = level || 1;
    var maxN = 4 + level * 2, kind;
    if(level <= 1) kind = rnd() < 0.7 ? 'bb' : 'hb';
    else if(level === 2) kind = ['hb', 'bb', 'mh'][Math.floor(rnd() * 3)];
    else kind = ['mb', 'stora', 'bb'][Math.floor(rnd() * 3)];
    if(kind === 'stora') return genStora(level, rnd);

    var num, den, res;
    if(kind === 'hb'){                                   // heltal · bråk
      var a = _drawProper(maxN, rnd), h = 2 + Math.floor(rnd() * (2 + level));
      num = h * a[0]; den = a[1];
      return { kind: kind, h: h, t2: a[0], n2: a[1], num: num, den: den, V: num / den, ans: _kanonisk(num, den) };
    }
    if(kind === 'mh'){                                   // blandad · heltal
      var b = _drawProper(maxN, rnd), hel = 1 + Math.floor(rnd() * 2), h2 = 2 + Math.floor(rnd() * 3);
      var oa = hel * b[1] + b[0]; num = oa * h2; den = b[1];
      return { kind: kind, hel: hel, t1: b[0], n1: b[1], h: h2, num: num, den: den, V: num / den, ans: _kanonisk(num, den) };
    }
    if(kind === 'mb'){                                   // blandad · bråk
      var b1 = _drawProper(maxN, rnd), hel1 = 1 + Math.floor(rnd() * 2), b2 = _drawProper(maxN, rnd);
      var oa2 = hel1 * b1[1] + b1[0]; num = oa2 * b2[0]; den = b1[1] * b2[1];
      return { kind: kind, hel: hel1, t1: b1[0], n1: b1[1], t2: b2[0], n2: b2[1], num: num, den: den, V: num / den, ans: _kanonisk(num, den) };
    }
    var A = _drawProper(maxN, rnd), B = _drawProper(maxN, rnd);   // bråk · bråk
    num = A[0] * B[0]; den = A[1] * B[1];
    return { kind: 'bb', t1: A[0], n1: A[1], t2: B[0], n2: B[1], num: num, den: den, V: num / den, ans: _kanonisk(num, den) };
  }

  if(typeof window !== 'undefined'){ window.genMultBrak = genMultBrak; window.genMultStora = genStora; }
  if(typeof module !== 'undefined' && module.exports) module.exports = { genMultBrak: genMultBrak, genStora: genStora, _gcd: _gcd, _kanonisk: _kanonisk };

  // ── Drill-engine (körs i ramen) ──────────────────────────────
  if(typeof window !== 'undefined' && typeof window.korOvning === 'function'){
    var frac = window.frac, fracBoxes = window.fracBoxes, valFor = window.valFor, mixed = window.mixed;
    function intg(x){ return '<span style="font-size:22px;padding:0 4px;font-feature-settings:\'tnum\';">' + x + '</span>'; }
    function heltalBox(cls){ return '<input class="brak-in ' + cls + '" inputmode="numeric" autocomplete="off" style="width:46px;height:44px;text-align:center;font-size:20px;">'; }
    var GNG = '<span style="margin:0 7px;color:#7a6e65;">·</span>';
    var LIKA = '<span style="margin:0 8px;font-size:22px;">=</span>';
    function hint(txt){ return '<span style="margin-left:12px;font-size:13px;color:#7a6e65;">' + txt + '</span>'; }
    function blandInput(){ return heltalBox('m-hel') + '<span style="margin:0 4px;"></span>' + fracBoxes('m-t', 'm-n'); }
    function blandFaktor(hel, t, n){ return intg(hel) + frac(t, n); }   // blandad faktor "1 ¾"

    // Svarskontroll: ALLTID enklaste form; täljare > nämnare → blandad (heltalsruta + äkta bråkdel).
    // Facit = ans (kanonisk, värde-härledd). Helt tal → tom bråkdel accepteras.
    function svarRatt(ans){
      var hh = parseInt(valFor('m-hel'), 10); if(isNaN(hh)) hh = 0;
      var tt = parseInt(valFor('m-t'), 10), nn = parseInt(valFor('m-n'), 10);
      if(isNaN(tt) && isNaN(nn)) return ans.t === 0 && hh === ans.hel;   // helt tal
      if(isNaN(tt) || isNaN(nn) || nn === 0) return false;
      if(_gcd(tt, nn) !== 1 || tt >= nn) return false;                    // enklaste + äkta bråkdel
      return hh === ans.hel && tt === ans.t && nn === ans.n;
    }

    window.multBrakEngine = function(){
      window.korOvning({
        titel: 'Multiplikation med bråk',
        sub: 'Multiplicera. Skriv svaret i enklaste form – är täljaren större än nämnaren, skriv blandad form.',
        back: window.renderOversikt,
        gen: function(level){
          var u = genMultBrak(level);
          // vänsterled (faktorerna) per typ
          var vanster;
          if(u.kind === 'hb') vanster = intg(u.h) + GNG + frac(u.t2, u.n2);
          else if(u.kind === 'mh') vanster = blandFaktor(u.hel, u.t1, u.n1) + GNG + intg(u.h);
          else if(u.kind === 'mb') vanster = blandFaktor(u.hel, u.t1, u.n1) + GNG + frac(u.t2, u.n2);
          else vanster = frac(u.t1, u.n1) + GNG + frac(u.t2, u.n2);   // bb + stora

          if(u.kind !== 'stora'){
            // Grunddrill: ett svar (blandad-input)
            return {
              fragaHtml: '<div style="display:flex;align-items:center;flex-wrap:wrap;font-size:22px;">'
                + vanster + LIKA + blandInput() + '</div>',
              facitText: (u.ans.t === 0) ? ('' + u.ans.hel) : (u.ans.hel ? mixed(u.ans.hel, u.ans.t, u.ans.n) : frac(u.ans.t, u.ans.n)),
              faltRatt: function(f){ return svarRatt(u.ans); },
              check: function(){ return svarRatt(u.ans); }
            };
          }
          // Stora tal: förkortnings-mellanled (värde-rättat) + slutsvar (enklaste form)
          var mellan = '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 6px;">'
            + '<span style="padding:2px 10px;display:flex;align-items:center;gap:6px;">' + fracBoxCell('m-ct1') + GNG + fracBoxCell('m-ct2') + '</span>'
            + '<span style="height:2.5px;background:#12110f;align-self:stretch;min-width:120px;"></span>'
            + '<span style="padding:2px 10px;display:flex;align-items:center;gap:6px;">' + fracBoxCell('m-cn1') + GNG + fracBoxCell('m-cn2') + '</span></span>';
          return {
            fragaHtml: '<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;font-size:22px;">'
              + '<div style="display:flex;align-items:center;flex-wrap:wrap;">' + vanster + '</div>'
              + '<div style="display:flex;align-items:center;flex-wrap:wrap;">' + LIKA + mellan + hint('förkorta korsvis (täljare mot nämnare)') + '</div>'
              + '<div style="display:flex;align-items:center;flex-wrap:wrap;">' + LIKA + blandInput() + hint('svar i enklaste form') + '</div>'
              + '</div>',
            facitText: (u.ans.t === 0) ? ('' + u.ans.hel) : (u.ans.hel ? mixed(u.ans.hel, u.ans.t, u.ans.n) : frac(u.ans.t, u.ans.n)),
            faltRatt: function(f){
              if(/m-c/.test(f.className)) return mellanRatt(u.V);
              return svarRatt(u.ans);
            },
            check: function(){ return mellanRatt(u.V) && svarRatt(u.ans); }
          };
        }
      });
    };
    function fracBoxCell(cls){ return '<input class="brak-in ' + cls + '" inputmode="numeric" autocomplete="off" style="width:56px;height:40px;text-align:center;font-size:19px;">'; }
    // Mellanled värde-rättat: (ct1·ct2)/(cn1·cn2) == V (valfri giltig korsförkortning godtas).
    function mellanRatt(V){
      var a = parseInt(valFor('m-ct1'), 10), b = parseInt(valFor('m-ct2'), 10), c = parseInt(valFor('m-cn1'), 10), d = parseInt(valFor('m-cn2'), 10);
      if([a, b, c, d].some(function(x){ return isNaN(x); })) return false;
      if(c === 0 || d === 0) return false;
      return Math.abs((a * b) / (c * d) - V) < 1e-9;
    }
  }
})();
