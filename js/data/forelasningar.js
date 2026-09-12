/* forelasningar.js — FÖRELÄSNINGSREGISTER + delad montering av Föreläsning-fliken (åk8).
   Syster till AK8_FARDIGA.renderTestFlik: en anropbar funktion, inte ett mönster att kopiera.
   Det är KONTRAKTET som gör att ett nytt delkapitel ärver formen — testfliken ärvdes för att den
   var en funktion; föreläsningen ärvdes inte för att den var en inline-kopia i varje sjuan-blad.

   REGISTER: AK8_FORELASNINGAR[delId] = [ {id:'<YouTube-id>', titel:'…'}, … ]
     delId = delkapitlets id i AK8_K1_BOK (t.ex. 'kvadratrotter'). Tom lista = ingen film ännu →
     ytan märks ärligt tom (.forel-tom). En sida kan INTE skriva egen föreläsningstext: panelen
     ägs helt av renderForelFlik.

   INTEGRITET (samma regel som nian, commit 1ace065): INGEN extern hämtning vid sidöppning.
     Lokal play-platshållare, aldrig tumnagel från img.youtube.com. YouTube-embedden skapas först
     när eleven klickar play. Noll nätväg tills dess.

   Laddas av delkapitel-sidorna. Ren data + DOM. */
(function(){
  'use strict';

  // ── REGISTER (delId → filmer). Håll nycklarna = AK8_K1_BOK.delkapitel[].id ──
  var AK8_FORELASNINGAR = {
    // Kvadratrötter (dk11) är NYTT stoff — sjuan har ingen genomgång att spegla. Joachim avgör om
    // han spelar in en; tills dess är ytan ärligt tom (inte fylld med annat).
    'kvadratrotter': []
  };

  function delkapitelFor(delNr){
    var bok = window.AK8_K1_BOK || { delkapitel: [] };
    return (bok.delkapitel || []).filter(function(d){ return d.nr === delNr; })[0] || null;
  }
  function videorFor(delId){ return AK8_FORELASNINGAR[delId] || []; }

  // CSS injiceras EN gång av modulen — kontraktet bär sitt eget utseende, sidan kopierar inget.
  // Använder sidans --tokens (navy/gold/paper) med fallbacks.
  var CSS = ''
    + '.forel-wrap{max-width:820px;margin:0 auto;padding:22px 24px 44px;}'
    + '.forel-notis{display:flex;gap:12px;align-items:flex-start;font-size:13.5px;color:var(--ink-soft,#3d3630);background:var(--paper-lt,#faf7f1);border:1px solid var(--paper-dk,#ede6d6);border-left:4px solid var(--gold,#9a7228);border-radius:6px;padding:12px 16px;margin-bottom:18px;line-height:1.55;}'
    + '.forel-notis .ikon{font-size:18px;flex-shrink:0;}'
    + '.forel-tom{font-size:14px;color:var(--ink-faint,#7a6e65);font-style:italic;background:var(--paper-lt,#faf7f1);border:1px dashed var(--paper-dk,#ede6d6);border-radius:8px;padding:18px 20px;line-height:1.6;}'
    + '.lecture-list{display:flex;flex-direction:column;gap:10px;}'
    + '.lecture-card{display:flex;align-items:center;gap:16px;background:var(--paper-lt,#faf7f1);border:1px solid var(--paper-dk,#ede6d6);border-radius:10px;padding:12px 16px;cursor:pointer;transition:border-color .15s,box-shadow .15s;}'
    + '.lecture-card:hover{border-color:var(--gold-lt,#c49a40);box-shadow:0 2px 10px rgba(15,30,46,.07);}'
    + '.lecture-card.is-playing{border-color:var(--gold,#9a7228);background:#fbf4e4;}'
    + '.lecture-thumb{position:relative;width:120px;height:68px;flex-shrink:0;border-radius:6px;overflow:hidden;background:linear-gradient(135deg,var(--navy,#0f1e2e),var(--navy-mid,#1c3550));display:flex;align-items:center;justify-content:center;}'
    + '.lecture-play{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.14);border:1.5px solid rgba(255,255,255,.5);}'
    + '.lecture-play span{color:#fff;font-size:15px;margin-left:2px;}'
    + '.lecture-card:hover .lecture-play{background:var(--gold,#9a7228);border-color:var(--gold,#9a7228);}'
    + '.lecture-meta{flex:1;min-width:0;}'
    + '.lecture-title{font-size:16px;font-weight:600;color:var(--ink,#12110f);}'
    + '.lecture-tag{font-family:var(--cinzel,serif);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint,#7a6e65);margin-top:3px;}'
    + '.lecture-state{font-family:var(--cinzel,serif);font-size:11px;letter-spacing:.06em;color:var(--gold,#9a7228);flex-shrink:0;}'
    + '.lecture-player{display:none;margin:12px 0;}.lecture-player.is-open{display:block;}'
    + '.lecture-frame{position:relative;width:100%;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#000;}'
    + '.lecture-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}'
    + '.lecture-yt-link{display:inline-block;margin-top:8px;font-size:12.5px;color:var(--blue,#2f6ea0);text-decoration:none;}.lecture-yt-link:hover{text-decoration:underline;}'
    + '@media(max-width:560px){.lecture-thumb{width:92px;height:52px;}}';
  function injiceraCss(){
    if(document.getElementById('ak8-forel-css')) return;
    var s = document.createElement('style'); s.id = 'ak8-forel-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  // Rendera Föreläsning-flikens innehåll. panelEl = <section data-panel="forelasning">, delNr = bokens nr.
  function renderForelFlik(panelEl, delNr){
    if(!panelEl) return;
    injiceraCss();
    var dk = delkapitelFor(delNr);
    var filmer = dk ? videorFor(dk.id) : [];
    var wrap = document.createElement('div'); wrap.className = 'forel-wrap';

    if(!filmer.length){
      var tom = document.createElement('div'); tom.className = 'forel-tom';
      tom.textContent = 'Ingen föreläsning ännu för det här delkapitlet. Öva och färdighetsträna så länge – filmen läggs in här när den är klar.';
      wrap.appendChild(tom);
      panelEl.innerHTML = ''; panelEl.appendChild(wrap);
      return;
    }

    var notis = document.createElement('div'); notis.className = 'forel-notis';
    notis.innerHTML = '<span class="ikon">🎬</span><div>Genomgångar till delkapitlets färdigheter. Filmerna laddas från YouTube först när du klickar på play – inget hämtas därifrån innan dess.</div>';
    wrap.appendChild(notis);

    // en delad spelare som flyttas under det klickade kortet (samma som nian)
    var aktivKort = null;
    var player = document.createElement('div'); player.className = 'lecture-player';
    player.innerHTML = '<div class="lecture-frame"></div><a class="lecture-yt-link" target="_blank" rel="noopener">Filmen startar inte? Öppna den på YouTube ↗</a>';
    function stang(){
      if(aktivKort){ aktivKort.classList.remove('is-playing'); aktivKort.querySelector('.lecture-state').textContent = 'Spela film'; }
      player.classList.remove('is-open'); player.querySelector('.lecture-frame').innerHTML = '';
      aktivKort = null;
    }
    function spela(card, f){
      if(aktivKort === card){ stang(); return; }
      stang();
      aktivKort = card; card.classList.add('is-playing'); card.querySelector('.lecture-state').textContent = 'Spelas nu';
      var origin = (location.origin && location.origin.indexOf('http') === 0) ? '&origin=' + encodeURIComponent(location.origin) : '';
      player.querySelector('.lecture-frame').innerHTML = '<iframe src="https://www.youtube.com/embed/' + f.id
        + '?rel=0&playsinline=1' + origin + '" title="' + f.titel
        + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      player.querySelector('.lecture-yt-link').href = 'https://youtu.be/' + f.id;
      player.classList.add('is-open');
      card.insertAdjacentElement('afterend', player);
      player.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    var lista = document.createElement('div'); lista.className = 'lecture-list';
    filmer.forEach(function(f){
      var card = document.createElement('div'); card.className = 'lecture-card';
      // INGEN extern tumnagel — lokal play-platshållare. YouTube laddas först vid klick (spela).
      card.innerHTML = '<div class="lecture-thumb"><span class="lecture-play"><span>▶</span></span></div>'
        + '<div class="lecture-meta"><div class="lecture-title">' + f.titel + '</div><div class="lecture-tag">Föreläsning</div></div>'
        + '<div class="lecture-state">Spela film</div>';
      card.addEventListener('click', function(){ spela(card, f); });
      lista.appendChild(card);
    });
    wrap.appendChild(lista);
    panelEl.innerHTML = ''; panelEl.appendChild(wrap);
  }

  window.AK8_FOREL = { register: AK8_FORELASNINGAR, videorFor: videorFor, renderForelFlik: renderForelFlik };
})();
