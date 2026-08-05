/* kapitel-fot.js — window.KapitelFot.montera(config)
   Kapitel-foten (Kunskapsläge + Träna inför provet) som delad modul. Utbruten BYTE-TROGET
   ur ak7-k1.html; skalen (sjuan/åttan/nian) monterar med config. Stil i kapitel-fot.css.

   ── UI-regel (genomgående): status:'kommer' = SYNLIG, MÄRKT, EJ KLICKBAR.
      <div> (inget <a>), "kommer"-chip, ingen pekare, ingen hover, aria-disabled. ──
   ── Elev-lokalt: modulen renderar bara navigation. Ingen fetch/XHR/nätväg. ──

   config = {
     mountId?:        'kapitel-fot',     // element att rendera i (default)
     eyebrowText?:    'Begreppskarta · självskattning',
     kunskapslage:    { href, status:'live'|'kommer' },
     skapaTest:       { href, status:'live'|'kommer' },
     sjalvskattning:  { href, status:'live'|'kommer' }
   } */
(function(){
  'use strict';
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // Kunskapsläge-bannern (mörk). live → <a>, kommer → <div> + chip i btn-positionen.
  function bannerHtml(cfg, eyebrow){
    var kommer = cfg.status === 'kommer';
    var inner =
        '<div class="ova-banner-icon">🧭</div>'
      + '<div class="ova-banner-body">'
        + '<div class="ova-banner-eyebrow">' + esc(eyebrow) + '</div>'
        + '<div class="ova-banner-title">Kunskapsläge — var står jag?</div>'
        + '<div class="ova-banner-desc">Områdets framsida: en karta färgad av det du faktiskt övat, och en självskattning där du tar ställning själv. Se vad som sitter och vad som är kvar. Färdighetsträningen når du inne i varje delkapitel.</div>'
      + '</div>'
      + '<div class="ova-banner-btn">' + (kommer ? 'Kommer' : 'Öppna →') + '</div>';
    return kommer
      ? '<div class="ova-banner is-kommer" aria-disabled="true">' + inner + '</div>'
      : '<a class="ova-banner" href="' + esc(cfg.href) + '">' + inner + '</a>';
  }

  // Ett prov-kort (ljust). live → <a> + pil, kommer → <div> + chip.
  function provCardHtml(cfg, icon, titel, desc){
    var kommer = cfg.status === 'kommer';
    var inner =
        '<div class="prov-card-icon">' + icon + '</div>'
      + '<div class="prov-card-body">'
        + '<div class="prov-card-title">' + esc(titel) + '</div>'
        + '<div class="prov-card-desc">' + esc(desc) + '</div>'
      + '</div>'
      + (kommer ? '<span class="kf-chip">Kommer</span>' : '<div class="prov-card-arrow">›</div>');
    return kommer
      ? '<div class="prov-card is-kommer" aria-disabled="true">' + inner + '</div>'
      : '<a class="prov-card" href="' + esc(cfg.href) + '">' + inner + '</a>';
  }

  function montera(config){
    config = config || {};
    var mount = document.getElementById(config.mountId || 'kapitel-fot');
    if(!mount) return null;
    var eyebrow = config.eyebrowText || 'Begreppskarta · självskattning';
    var kunskap = config.kunskapslage || { status:'kommer' };
    var test    = config.skapaTest    || { status:'kommer' };
    var sjalv   = config.sjalvskattning || { status:'kommer' };

    mount.innerHTML =
        '<div class="section-label">Kunskapsläge</div>'
      + bannerHtml(kunskap, eyebrow)
      + '<div class="section-label">Träna inför provet</div>'
      + '<div class="prov-grid">'
        + provCardHtml(test,  '📝', 'Skapa eget test', 'Välj 3–5 moment du vill testa dig på, så sätts ett eget övningstest ihop.')
        + provCardHtml(sjalv, '✓',  'Självskattning',  'Ta ställning själv: Kan · Osäker · Kan ej – för varje färdighet. Bredvid står evidensen från det du övat.')
      + '</div>';
    return mount;
  }

  window.KapitelFot = { montera: montera };
})();
