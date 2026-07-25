/* ============================================================
   FAMILJ · FIGUR: delad SVG-tallinje (window.SvgTallinje).
   Återanvändbar för åk7–9. Ritar en horisontell tallinje med
   pilar, delstreck (steg), etiketter och namngivna punkter (A/B/C…).
   Positioner styrs av anroparen → figur och facit är självkonsistenta.
   Temas via CSS-klasser (tl-*), inga hårda färger. Ingen nätverk.
   ============================================================ */
(function(){
  'use strict';
  function fmt(x){ return String(Math.round(x * 1e6) / 1e6).replace('.', ',').replace('-', '−'); }

  // opts: { min, max, steg, etiketter:[värden], punkter:[{v, namn}], bredd, hojd }
  function linje(opts){
    var W = opts.bredd || 640, H = opts.hojd || 74;
    var padL = 30, padR = 30, y = Math.round(H * 0.62);
    var span = opts.max - opts.min || 1;
    function X(v){ return padL + (v - opts.min) / span * (W - padL - padR); }
    var etik = opts.etiketter || [];
    function arMajor(v){ for(var i = 0; i < etik.length; i++){ if(Math.abs(etik[i] - v) < 1e-9) return true; } return false; }

    var s = '<svg class="tl-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img">';
    // delstreck + etiketter
    var steg = opts.steg, n = Math.round(span / steg);
    for(var i = 0; i <= n; i++){
      var v = opts.min + i * steg, x = X(v), maj = arMajor(v);
      var h = maj ? 9 : 5;
      s += '<line class="tl-tick" x1="' + x.toFixed(1) + '" y1="' + (y - h) + '" x2="' + x.toFixed(1) + '" y2="' + (y + h) + '"/>';
      if(maj) s += '<text class="tl-label" x="' + x.toFixed(1) + '" y="' + (y + 24) + '">' + fmt(v) + '</text>';
    }
    // axel med pilar
    s += '<line class="tl-axis" x1="8" y1="' + y + '" x2="' + (W - 8) + '" y2="' + y + '"/>';
    s += '<polygon class="tl-arrow" points="' + (W - 8) + ',' + y + ' ' + (W - 18) + ',' + (y - 5) + ' ' + (W - 18) + ',' + (y + 5) + '"/>';
    s += '<polygon class="tl-arrow" points="8,' + y + ' 18,' + (y - 5) + ' 18,' + (y + 5) + '"/>';
    // punkter (romb + bokstav ovanför)
    (opts.punkter || []).forEach(function(p){
      var x = X(p.v), r = 5;
      s += '<path class="tl-pt" d="M' + x.toFixed(1) + ' ' + (y - r) + ' L' + (x + r).toFixed(1) + ' ' + y + ' L' + x.toFixed(1) + ' ' + (y + r) + ' L' + (x - r).toFixed(1) + ' ' + y + ' Z"/>';
      s += '<text class="tl-pt-namn" x="' + x.toFixed(1) + '" y="' + (y - 14) + '">' + p.namn + '</text>';
    });
    return s + '</svg>';
  }

  window.SvgTallinje = { linje: linje };
})();
