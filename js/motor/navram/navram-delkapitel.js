/* navram-delkapitel.js — RECEPTET: navigationsramen på en delkapitelsida (order 2026-10-03).
 *
 * Piloten (ak7/k1/d1) löste det svåra. Det här är samma lösning som en DELAD funktion, så
 * propageringen blir en rad per sida i stället för åtta kopior som driver isär (A1).
 *
 * BÄRANDE IDÉ: ramen bygger ingen navigering av sitt eget — den SPEGLAR sidans befintliga knappar
 * och DELEGERAR klicken till dem. Sidans eget skript får stå precis som det är: det bygger
 * #blad-nav, #fardighet-lista och filmlistan som förr, och varje variant i vänsterspalten gör
 * `originalknappen.click()`. Därför fungerar receptet på sidor som skiljer sig inuti — d2 splittar
 * add/sub ur ett blad, d4 kör en annan motorfamilj, någon sida har ett tomt blad — utan en enda
 * specialare. Det som är en funktion ärvs; det som är en kopia ärvs inte.
 *
 * DE FEM LÄRDOMARNA FRÅN PILOTEN, inbyggda här:
 *  1. Motor-element GÖMS, tas aldrig bort. blad-k1-dN.js gör getElementById('tab-row') och
 *     använder resultatet direkt; samma för lecture-list/-player/-frame/-yt-link. Tas något bort
 *     kastar motorfilen vid laddning och sidan blir vit.
 *  2. hidden-attributet duger inte — sidornas egen .tab-row{display:flex} vinner. Därför klassen
 *     .nr-dold (display:none !important) ur navram.css.
 *  3. Latenta rader finns: #fardighet-lista syntes inte i startläget men hade dykt upp när
 *     metod-scenen slogs på. Allt som ersätts gömns, inte bara det som råkar syflas nu.
 *  4. Inre dubblett-flikar i portade vyer scope:as med .nr-dold-embed (body.embed), så den
 *     fristående sidan behåller sina flikar.
 *  5. Grindarna navigerar via .nr-rad. Varianterna ÄR därför riktiga knappar i DOM:en.
 *
 * MONTERA SIST — sist av allt som RÖR NAVIGERINGEN, inte bara efter motorfilen. Receptet
 * SPEGLAR knappar, så varje skript som bygger om dem måste ha kört först. Belagt på d10: sidan
 * filtrerar bort en grupp page-side och kallar renderGruppRad() i ett senare skript — med
 * anropet före det speglade ramen 6 grupper i stället för 5, och den sjätte variantens knapp
 * fanns inte längre i DOM:en.
 *
 * KONFIGURATION — allt annat upptäcks i sidan:
 *   montera({
 *     nivaPrefix: 'k1d2',          // localStorage: <prefix>_naddNiva<n>_<bladId>
 *     kunskapslage: '../kunskapslage/index.html',   // vyn som bäddas in (default)
 *     uppgifter: [...]             // VALFRITT: egen gruppering när bladen har varianter
 *   })
 */
(function(){
  'use strict';

  /* Det ramen ersätter som NAVIGERING. #plugg-aktivt står INTE här — det är arbetsytan, inte
     navigering, och flyttas in i ramen i stället för att gömmas. */
  var DOLJ = ['tab-row', 'blad-nav', 'fardighet-lista', 'plugg-grupprad', 'plugg-doklista'];

  function el(tagg, klass, html){
    var e = document.createElement(tagg);
    if(klass) e.className = klass;
    if(html != null) e.innerHTML = html;
    return e;
  }
  function txt(e){ return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }
  /* Synlig = ritad i layouten. Underflikarna finns i DOM:en även för blad som inte är valda, så
     speglingen måste skilja på "finns" och "syns" — annars samlas tio underblad under det första
     bladet. (Saknades först, och gjorde hela ramen tom på d2: ReferenceError i monteringen.) */
  function synlig(e){ return !!(e && e.offsetParent); }

  /* Panelväxling: sidans fyra .tab-panel har redan CSS för .is-active. Ramen sätter den direkt i
     stället för att klicka den gömda flikknappen — klicket skulle också scrolla till toppen
     (motorns egen window.scrollTo), vilket rycker bort arbetsytan under eleven. */
  function visaPanel(namn){
    document.querySelectorAll('.tab-panel').forEach(function(p){
      p.classList.toggle('is-active', p.dataset.panel === namn);
    });
  }

  function montera(cfg){
    cfg = cfg || {};
    var vard = document.getElementById('navram');
    if(!vard || !window.NavRam) return null;

    // ── 1. GÖM det ramen ersätter. Kvar i DOM — motorn läser det. ───────────────────────────
    /* Gömningen körs FÖRST EFTER speglingen — gom() kallas direkt före NavRam.montera. Nästlade
       underflikar hittas på SYNLIGHET (de finns i DOM:en även för ovalda blad), och det går inte
       att mäta på en rad som redan är display:none. Mätt på ak8/k2/d1: med gömningen först hittade
       upptäckten noll underflikar och föll tillbaka på den platta speglingen — 1 grupp / 4
       varianter i stället för 4 grupper / 10 varianter. GÖM ALDRIG DET DU SKA MÄTA INNAN DU MÄTT DET. */
    function gom(){
      DOLJ.forEach(function(id){
        var e = document.getElementById(id);
        if(e){ e.classList.add('nr-dold'); e.setAttribute('aria-hidden', 'true'); }
      });
      /* ALLA bladnav-rader, inte bara den med id="blad-nav": d3 har en andra rad (#fordj-nav,
         fördjupningsbladen) och åttans algebra en .blad-subnav per blad. En dold rad vars knappar
         ingen speglar är innehåll eleven inte kan nå — mätt: två blad försvann ur kontroll-svepet. */
      document.querySelectorAll('.blad-nav, .blad-subnav').forEach(function(e){
        e.classList.add('nr-dold'); e.setAttribute('aria-hidden', 'true');
      });
    }

    // ── 2. UPPGIFTER: spegla #blad-nav. Klicket delegeras till originalknappen. ─────────────
    /* ── PLUGG-SIDOR ──
       Områdena är grupper, dokumenten är varianter. Doklistan byggs OM när ett område väljs, så
       speglingen måste gå igenom områdena en gång för att se alla dokument — och klicket måste
       delegeras på ID, inte på en hållen nod, som blir detached vid ombyggnaden. */
    var pluggRad = document.getElementById('plugg-grupprad');
    var pluggLista = document.getElementById('plugg-doklista');
    function valjPlugg(gruppId, dokId){
      var g = pluggRad.querySelector('[data-grupp="' + gruppId + '"]'); if(g) g.click();
      var d = pluggLista.querySelector('[data-dok="' + dokId + '"]'); if(d) d.click();
    }
    function pluggUppgifter(){
      if(!pluggRad || !pluggLista) return null;
      var gKnappar = Array.prototype.slice.call(pluggRad.querySelectorAll('[data-grupp]'));
      if(!gKnappar.length) return null;
      var start = (pluggRad.querySelector('[data-grupp].is-active') || { dataset: {} }).dataset.grupp;
      var grupper = gKnappar.map(function(gb){
        var gid = gb.dataset.grupp, namn = txt(gb);
        gb.click();   // doklistan ritas om till det här området
        return { rubrik: namn, varianter:
          Array.prototype.map.call(pluggLista.querySelectorAll('[data-dok]'), function(db){
            var did = db.dataset.dok;
            var nr = txt(db.querySelector('.plugg-dok-nr'));
            var dnamn = txt(db.querySelector('.plugg-dok-namn')) || txt(db);
            return { titel: (nr ? nr + '. ' : '') + dnamn,
                     valj: function(){ valjPlugg(gid, did); } };
          }) };
      });
      // Ställ tillbaka det område sidan startade på.
      if(start){ var s0 = pluggRad.querySelector('[data-grupp="' + start + '"]'); if(s0) s0.click(); }
      return grupper;
    }

    /* ALLA bladnav-rader speglas. d3 har två: delkapitlets blad och fördjupningsbladen. */
    var navRader = Array.prototype.filter.call(document.querySelectorAll('.blad-nav'), function(r){
      return r.querySelectorAll('.blad-nav-btn').length > 0;
    });
    function variantAv(b){
      var panel = panelFor(b);
      return { titel: txt(b).replace(/^\d+/, ''), kommer: b.disabled,
               valj: function(){ visaPanel(panel); b.click(); } };
    }
    /* NÄSTLAD NAVIGERING: har ett blad underflikar (.blad-subnav-btn) är BLADET gruppen och
       underbladen varianterna. Underflikarna syns först när bladet är valt, så speglingen måste
       klicka igenom bladen för att se dem — och delegera på PLATS i den synliga raden, eftersom
       raden byggs om vid bladbyte och en hållen nod då blir detached. */
    /* Underflikraderna finns SAMTIDIGT, en inuti varje blad-mount, och byggs aldrig om — bara
       mounten visas eller göms. Raden för blad nr i är därför .blad-subnav nr i, och knapparna i
       den går att hålla direkt. Ingen synlighetsmätning behövs, vilket också gör delegeringen
       oförstörbar av gom(). */
    function subRad(i){ return document.querySelectorAll('.blad-subnav')[i] || null; }
    /* Vilken .tab-panel hör knappen till? d3 har en femte flik ("Fördjupning") med EGEN panel,
       och dess blad ligger där — inte i 'ova'. Hårdkodad panel gör att klicket stänger panelen
       som bär arket. Härled den i stället. */
    function panelFor(e){
      var p = e && e.closest ? e.closest('.tab-panel') : null;
      return (p && p.dataset && p.dataset.panel) ? p.dataset.panel : 'ova';
    }
    function nastladeGrupper(rad){
      var knappar = Array.prototype.slice.call(rad.querySelectorAll('.blad-nav-btn'));
      var nagot = false;
      var grupper = knappar.map(function(b, bi){
        var sr = subRad(bi);
        var subs = sr ? Array.prototype.slice.call(sr.querySelectorAll('.blad-subnav-btn')) : [];
        /* EN underflik är ingen gruppering: bladet ÄR varianten. Räknas den som en grupp måste
           eleven fälla ut den innan hon kan byta — två klick för ett byte — och den utfällda
           gruppen ser ut som en markering utan att vara det. Mätt på d3, som har tre sådana. */
        if(subs.length > 1) nagot = true;
        return { blad: b, subs: subs.length > 1 ? subs : [] };
      });
      if(!nagot) return null;            // platt sida — låt den vanliga vägen gälla
      return grupper.map(function(g){
        if(!g.subs.length){
          /* Blad utan (eller med EN) underflik: ingen rubrik, bara varianten. Med en rubrik hade
             raden blivit en grupp att fälla ut igen — samma fel i ny förpackning. */
          return { rubrik: null, varianter: [variantAv(g.blad)] };
        }
        return { rubrik: txt(g.blad).replace(/^\d+/, ''),
          varianter: g.subs.map(function(sb){
            /* Bladknappen först (visar rätt mount och återställer till underblad 1), sedan
               underfliken — direkt referens, oförändrad av att raden är gömd. */
            var panel = panelFor(g.blad);
            return { titel: txt(sb).replace(/^\d+/, ''), kommer: sb.disabled,
                     valj: function(){ visaPanel(panel); g.blad.click(); sb.click(); } };
          }) };
      });
    }
    var uppgifter = cfg.uppgifter || pluggUppgifter();
    if(!uppgifter){
      /* EN rad → en rubriklös (platt) grupp: bladen är platta på de flesta sidorna, och en grupp
         per blad med EN variant vore två klick för ett blad.
         FLERA rader → en grupp per rad, med radens egen aria-label som rubrik (sidans ord, inte
         påhittade). Sidor med A/B-varianter skickar en egen gruppering via cfg.uppgifter. */
      var nastlat = navRader.length === 1 ? nastladeGrupper(navRader[0]) : null;
      if(nastlat){
        uppgifter = nastlat;
      } else if(navRader.length <= 1){
        var ett = navRader[0];
        uppgifter = [{ rubrik: null, varianter: ett
          ? Array.prototype.map.call(ett.querySelectorAll('.blad-nav-btn'), variantAv) : [] }];
      } else {
        uppgifter = navRader.map(function(r){
          return { rubrik: r.getAttribute('aria-label') || 'Blad',
                   varianter: Array.prototype.map.call(r.querySelectorAll('.blad-nav-btn'), variantAv) };
        });
      }
    }

    // ── 3. METODTRÄNING: spegla #fardighet-lista. EN träning, delad — ingen kopia. ──────────
    var fardEl = document.getElementById('fardighet-lista');
    var metod = fardEl ? Array.prototype.map.call(fardEl.querySelectorAll('.fard-grupp'), function(g){
      return {
        rubrik: txt(g.querySelector('.fard-ko')),
        varianter: Array.prototype.map.call(g.querySelectorAll('.fard-skill'), function(b){
          var t = b.querySelector('.fard-skill-titel'), f = b.querySelector('.fard-skill-formaga');
          return { titel: txt(t) || txt(b), etikett: txt(f), kommer: b.disabled,
                   valj: function(){ visaPanel('fardighet'); b.click(); } };
        })
      };
    }) : [];

    // ── 4. FÖRELÄSNING: spegla filmkorten. Motorns egen spelarlogik återanvänds oförändrad. ──
    var lista = document.getElementById('lecture-list');
    var filmer = lista ? Array.prototype.map.call(lista.querySelectorAll('.lecture-card'), function(k){
      var t = k.querySelector('.lecture-title'), g = k.querySelector('.lecture-tag');
      return { titel: txt(t) || txt(k), etikett: txt(g),
               valj: function(){ visaPanel('forelasningar'); k.click(); } };
    }) : [];

    var arbeta = [{ rubrik: 'Uppgifter', grupper: uppgifter }];
    if(metod.length) arbeta.push({ rubrik: 'Metodträning', grupper: metod });
    if(filmer.length) arbeta.push({ rubrik: 'Föreläsning', grupper: [{ rubrik: 'Filmer', varianter: filmer }] });

    // ── 5. MINA KUNSKAPER: samma fyra vyer på varje sida. Kunskapsläget är den BEFINTLIGA
    //      kartan, inbäddad (?embed=1 → dess egen rubrik och inre flikrad göms). ─────────────
    var MINA = [
      { titel: 'Kunskapsläge',   sub: 'var står jag — färgad av bevis',   vy: 'mv-kunskapslage' },
      { titel: 'Självskattning', sub: 'din egen bild mot bevisen',        vy: 'mv-sjalvskattning' },
      { titel: 'Test',           sub: 'korta, varierade — framplockning', vy: 'mv-test' },
      { titel: 'Dagens träning', sub: 'vad du bör plocka fram idag',      vy: 'mv-dagens' }
    ];
    var PH = {
      'mv-sjalvskattning': 'Din egen bild av vad du kan, ställd vid sidan av bevisen i Kunskapsläget — Kan / Osäker / Kan ej, grupperat per område.',
      'mv-test': 'Korta, varierade pass som täcker delkapitlets alla delar — framplockning, inte förhör.',
      'mv-dagens': 'Systemet väljer vad du bör plocka fram i dag, utifrån vad bevisen visar — det adaptiva navet.'
    };
    var minaVyer = MINA.map(function(m, i){
      var v = el('div', 'nr-mview' + (i === 0 ? ' is-on' : ''));
      v.id = m.vy;
      /* kunskapslage:false — kapitlet har ingen karta än. Då blir vyn en ärlig "Byggs senare"-
         ruta; att bädda in ett ANNAT kapitels karta hade visat fel innehåll. */
      if(m.vy === 'mv-kunskapslage' && cfg.kunskapslage === false){
        v.appendChild(el('div', 'nr-ph', '<div class="nr-ph-mark">Byggs senare</div><p>'
          + 'Kartan för det här kapitlet — färgad av vad du faktiskt övat. Den finns än bara för '
          + 'taluppfattning; algebrans karta byggs när kapitlets taxonomi är på plats.</p>'));
      } else if(m.vy === 'mv-kunskapslage'){
        var f = el('iframe', 'nr-karta-frame');
        f.id = 'karta-frame'; f.title = 'Kunskapsläge'; f.loading = 'lazy';
        f.src = (cfg.kunskapslage || '../kunskapslage/index.html') + '?embed=1';
        v.appendChild(f);
      } else {
        v.appendChild(el('div', 'nr-ph',
          '<div class="nr-ph-mark">Byggs senare</div><p>' + PH[m.vy] + '</p>'));
      }
      return v;
    });

    gom();   // speglingen ar klar - nu far den gamla navigeringen forsvinna

    var ram = window.NavRam.montera({
      vard: vard, arbeta: arbeta, mina: MINA,
      /* Nivåraden läser VERKLIGT tillstånd via NivaRad. Antalet steg kommer ur bladets data; har
         sidan bara ett steg ritas ingen rad. Ingen nivå hittas på. */
      niva: { prefix: cfg.nivaPrefix || 'k1', bladId: cfg.nivaBlad || 'del',
              antal: cfg.nivaAntal || 1, aktuell: 1, valj: function(){} }
    });
    if(!ram) return null;

    // ── 6. Flytta in sidans paneler i arbetsytan, och vyerna i Mina. Id:n behålls — motorn
    //      hittar dem. Panelerna FLYTTAS, aldrig kopieras. ───────────────────────────────────
    Array.prototype.slice.call(document.querySelectorAll('.tab-panel')).forEach(function(p){
      ram.ytaArbeta.appendChild(p);
    });
    /* Plugg-sidan har inga .tab-panel — dess arbetsyta är #plugg-aktivt. Den FLYTTAS in (aldrig
       kopieras) och behåller sitt id, för motorn skriver dokumentet dit. */
    var pAktivt = document.getElementById('plugg-aktivt');
    if(pAktivt) ram.ytaArbeta.appendChild(pAktivt);
    minaVyer.forEach(function(v){ ram.ytaMina.appendChild(v); });

    return ram;
  }

  window.NavRamDelkapitel = { montera: montera, visaPanel: visaPanel };
})();
