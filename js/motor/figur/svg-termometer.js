/* ============================================================
   FAMILJ · FIGUR: delad SVG-termometer (window.SvgTermometer).
   Lodrät temperaturskala med rör, behållare och fylld kvicksilver-
   pelare som visar ett värde. Config-driven → figur och facit är
   självkonsistenta. Temas via tm-*-klasser (kvicksilvret är semantiskt
   rött). Ingen nätverk.

   Egen figur, INTE en konfiguration av svg-tallinje.js: den är
   horisontell (axel + pilar + etiketter under, romb-punkter) och saknar
   rör/behållare/fyllnad. Att tvinga in ett lodrätt termometerläge där
   skulle svälla den delade tallinjen med en helt annan visuell modell.
   ============================================================ */
(function(){
  'use strict';
  function fmt(x){ return String(Math.round(x * 1e6) / 1e6).replace('.', ',').replace('-', '−'); }

  // opts: { varde, min, max, steg, etiketter:[värden], enhet, bredd, hojd }
  function termometer(opts){
    var W = opts.bredd || 190, H = opts.hojd || 300;
    var enhet = opts.enhet != null ? opts.enhet : '°C';
    var tubeX = 78, tubeW = 22, mercW = 14;
    var bulbR = 19, bulbCy = H - 30 - bulbR;
    var colTop = 22, colBot = bulbCy - bulbR;
    var min = opts.min, max = opts.max, span = (max - min) || 1;
    function Y(v){ return colTop + (max - v) / span * (colBot - colTop); }
    var etik = opts.etiketter || [];
    function arMajor(v){ for(var i = 0; i < etik.length; i++){ if(Math.abs(etik[i] - v) < 1e-9) return true; } return false; }
    var yv = Y(opts.varde);

    var s = '<svg class="tm-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Termometer som visar ' + fmt(opts.varde) + ' ' + enhet + '">';
    // Rör (tomt) + behållare. Behållaren ritas efter röret så att rörets nedre
    // kant göms bakom bollen (ingen synlig skarv).
    s += '<rect class="tm-tube" x="' + (tubeX - tubeW / 2) + '" y="' + (colTop - 8) + '" width="' + tubeW + '" height="' + (bulbCy - (colTop - 8)).toFixed(1) + '" rx="' + (tubeW / 2) + '"/>';
    s += '<circle class="tm-tube" cx="' + tubeX + '" cy="' + bulbCy + '" r="' + bulbR + '"/>';
    // Kvicksilver: pelare från värdet ner i behållaren + fylld boll (ovanpå den vita behållaren).
    s += '<rect class="tm-mercury" x="' + (tubeX - mercW / 2) + '" y="' + yv.toFixed(1) + '" width="' + mercW + '" height="' + (bulbCy - yv).toFixed(1) + '" rx="' + (mercW / 2) + '"/>';
    s += '<circle class="tm-mercury" cx="' + tubeX + '" cy="' + bulbCy + '" r="' + (bulbR - 3) + '"/>';
    // Skala: delstreck + etiketter till höger om röret.
    var n = Math.round(span / opts.steg), tickX = tubeX + tubeW / 2;
    for(var i = 0; i <= n; i++){
      var v = min + i * opts.steg, y = Y(v), maj = arMajor(v), len = maj ? 12 : 6;
      s += '<line class="tm-tick" x1="' + tickX + '" y1="' + y.toFixed(1) + '" x2="' + (tickX + len) + '" y2="' + y.toFixed(1) + '"/>';
      if(maj) s += '<text class="tm-label" x="' + (tickX + len + 4) + '" y="' + (y + 4).toFixed(1) + '">' + fmt(v) + '</text>';
    }
    // Avläsningsmarkör (vänster): pil in mot röret + värde-pill.
    var pillW = 52, pillX = 8, pillCx = pillX + pillW / 2, tubeL = tubeX - tubeW / 2;
    s += '<rect class="tm-read-box" x="' + pillX + '" y="' + (yv - 11).toFixed(1) + '" width="' + pillW + '" height="22" rx="6"/>';
    s += '<text class="tm-read" x="' + pillCx + '" y="' + (yv + 4).toFixed(1) + '">' + fmt(opts.varde) + '°</text>';
    s += '<line class="tm-read-linje" x1="' + (pillX + pillW) + '" y1="' + yv.toFixed(1) + '" x2="' + (tubeL - 5) + '" y2="' + yv.toFixed(1) + '"/>';
    s += '<polygon class="tm-read-pil" points="' + tubeL + ',' + yv.toFixed(1) + ' ' + (tubeL - 6) + ',' + (yv - 5).toFixed(1) + ' ' + (tubeL - 6) + ',' + (yv + 5).toFixed(1) + '"/>';
    return s + '</svg>';
  }

  window.SvgTermometer = { termometer: termometer };
})();
