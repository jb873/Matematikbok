/* navram.js — NAVIGATIONSRAMEN, delad motor (order 2026-10-03, pilot på ak7/k1/d1).
 *
 * TVÅ LAGER, växlas överst: "Arbeta med området" · "Mina kunskaper". Vänsterspalten är enda
 * navigeringsytan; arbetsytan till höger är ren. Namnen är LÅSTA — ändra dem inte här.
 *
 * INTERAKTIONERNA ÄR KOPIERADE ur den klickbara prototypen (matematik-navigation-prototyp.html),
 * inte uppfunna. Fyra beteenden, ordagrant därifrån:
 *   1. lagerväxling    — .is-on flyttas mellan de två knapparna och de två panelerna
 *   2. toggleHuvud     — ALLA huvudrubriker stängs, sedan öppnas den klickade om den var stängd.
 *                        Ett klick på en öppen rubrik stänger den alltså. EN öppen i taget.
 *   3. toggleGrp       — samma, men scopat till den egna .nr-huvud-body, så grupper under andra
 *                        huvudrubriker inte rörs. EN grupp öppen i taget.
 *   4. valjVariant     — .is-on flyttas mellan varianterna, och arbetsytan byter innehåll.
 * Regeln "en öppen i taget" är inte smak: den är det som håller vänsterspalten inom en
 * Chromebooks höjd.
 *
 * SKILLNADEN MOT PROTOTYPEN är att allt innehåll och allt tillstånd är VERKLIGT:
 *   · dragspelet får sina grupper och varianter ur sidans egen data (cfg.arbeta), inte ur en
 *     hårdkodad tabell;
 *   · nivåraden läser localStorage via den delade NivaRad-modulen, inte en simulerad flagga.
 *     Prototypen låser upp nivån när man klickar på låset ("I prototypen: klarar du nivå 2 så
 *     låses den upp") — den simuleringen är MEDVETET inte kopierad. Här öppnas ett steg bara av
 *     att eleven klarat steget under.
 *
 * KONFIGURATION (en källa per sida, inget hårdkodat här):
 *   montera({
 *     vard:      element som ramen ritas i,
 *     arbeta:    [{ rubrik, grupper:[{ rubrik, varianter:[{ titel, etikett, kommer, valj() }] }] }],
 *     mina:      [{ titel, sub, vy }]      // vy = element-id i arbetsytan
 *     niva:      { prefix, bladId, antal, aktuell, valj(n) } | null
 *   })
 *
 * Ingen nätväg. Inget tillstånd lämnar enheten.
 */
(function(){
  'use strict';

  function el(tagg, klass, html){
    var e = document.createElement(tagg);
    if(klass) e.className = klass;
    if(html != null) e.innerHTML = html;
    return e;
  }
  function chev(open){ return '<span class="nr-chev">' + (open ? '▾' : '▸') + '</span>'; }

  /* ── 2. EN HUVUDRUBRIK ÖPPEN I TAGET (prototypens toggleHuvud) ── */
  function toggleHuvud(spalt, huvud){
    var varOpen = huvud.classList.contains('is-open');
    spalt.querySelectorAll('.nr-huvud').forEach(function(h){
      h.classList.remove('is-open');
      var c = h.querySelector('.nr-huvud-h .nr-chev');
      if(c) c.textContent = '▸';
    });
    if(!varOpen){
      huvud.classList.add('is-open');
      var c = huvud.querySelector('.nr-huvud-h .nr-chev');
      if(c) c.textContent = '▾';
    }
  }

  /* ── 3. EN GRUPP ÖPPEN I TAGET, scopat till den egna huvudrubriken (toggleGrp) ── */
  function toggleGrp(grp){
    var varOpen = grp.classList.contains('is-open');
    var scope = grp.closest('.nr-huvud-body') || grp.parentElement;
    scope.querySelectorAll('.nr-grp').forEach(function(g){
      g.classList.remove('is-open');
      var c = g.querySelector('.nr-grp-h .nr-chev');
      if(c) c.textContent = '▸';
    });
    if(!varOpen){
      grp.classList.add('is-open');
      var c = grp.querySelector('.nr-grp-h .nr-chev');
      if(c) c.textContent = '▾';
    }
  }

  function montera(cfg){
    var vard = cfg.vard;
    if(!vard) return null;

    // ── LAGERVÄXLAREN ──────────────────────────────────────────────────────────────────────
    var lager = el('div', 'nr-lager');
    var bArbeta = el('button', 'is-on',
      'Arbeta med området<span class="nr-mini">uppgifter · metodträning · föreläsning</span>');
    var bMina = el('button', null,
      'Mina kunskaper<span class="nr-mini">kunskapsläge · självskattning · test · dagens träning</span>');
    bArbeta.type = 'button'; bMina.type = 'button';
    lager.appendChild(bArbeta); lager.appendChild(bMina);

    var wrap = el('div', 'nr-wrap');
    var pArbeta = el('div', 'nr-panel is-on');
    var pMina = el('div', 'nr-panel');
    var spaltA = el('div', 'nr-spalt');
    var ytaA = el('div', 'nr-yta');
    var spaltM = el('div', 'nr-spalt');
    var ytaM = el('div', 'nr-yta');
    pArbeta.appendChild(spaltA); pArbeta.appendChild(ytaA);
    pMina.appendChild(spaltM); pMina.appendChild(ytaM);
    wrap.appendChild(pArbeta); wrap.appendChild(pMina);

    /* 1. Lagerväxling. Den är också TILLBAKA-VÄGEN: det finns ingen separat retur-knapp, för
       växlaren är alltid närvarande. */
    function valjLager(vilket){
      var arbeta = (vilket === 'arbeta');
      bArbeta.classList.toggle('is-on', arbeta);
      bMina.classList.toggle('is-on', !arbeta);
      pArbeta.classList.toggle('is-on', arbeta);
      pMina.classList.toggle('is-on', !arbeta);
    }
    bArbeta.addEventListener('click', function(){ valjLager('arbeta'); });
    bMina.addEventListener('click', function(){ valjLager('mina'); });

    // ── NIVÅRADEN, ovanför arbetsytan ──────────────────────────────────────────────────────
    var nivrad = el('div', 'niva-rad-vard');
    var nivmsg = el('div', 'nr-nivmsg');
    ytaA.appendChild(nivrad); ytaA.appendChild(nivmsg);

    function ritaNiva(){
      if(!cfg.niva || !window.NivaRad){ nivrad.innerHTML = ''; return; }
      var n = cfg.niva;
      nivrad.innerHTML = window.NivaRad.html({
        antal: n.antal, niva: n.aktuell, prefix: n.prefix, bladId: n.bladId
      });
      window.NivaRad.bind(nivrad, function(vald){
        n.aktuell = vald;
        if(typeof n.valj === 'function') n.valj(vald);
        ritaNiva();
      });
      /* En LÅST knapp är disabled, så den ger inget klick. Beskedet hör ändå hit: eleven ska
         veta VARFÖR steget är stängt, inte bara se ett hänglås. */
      nivrad.querySelectorAll('.niva-btn.is-locked').forEach(function(b){
        var nv = parseInt(b.dataset.niva, 10);
        var namn = (window.NivaRad.NAMN[nv] || ('Nivå ' + nv));
        var krav = (window.NivaRad.NAMN[nv - 1] || ('nivå ' + (nv - 1)));
        b.removeAttribute('disabled');          // så klicket når fram och kan ge besked
        b.setAttribute('aria-disabled', 'true');
        b.addEventListener('click', function(ev){
          ev.preventDefault();
          nivmsg.textContent = namn + ' öppnas när ' + krav.toLowerCase() + ' är gjord.';
        });
      });
    }

    // ── ARBETA: dragspelet, byggt ur sidans VERKLIGA innehåll ──────────────────────────────
    var allaVarianter = [];
    (cfg.arbeta || []).forEach(function(hr, hi){
      var forst = (hi === 0);
      var huvud = el('div', 'nr-huvud' + (forst ? ' is-open' : ''));
      var hh = el('div', 'nr-huvud-h', hr.rubrik + ' ' + chev(forst));
      huvud.appendChild(hh);
      var body = el('div', 'nr-huvud-body');

      (hr.grupper || []).forEach(function(g, gi){
        /* En grupp UTAN rubrik ritas platt: inget dragspelshuvud, alltid öppen. Platta blad
           (de flesta k1-sidorna har inga varianter) ska inte kosta två klick för ett blad. */
        var platt = !g.rubrik;
        var gOpen = platt || (forst && gi === 0);
        var grp = el('div', 'nr-grp' + (gOpen ? ' is-open' : '') + (platt ? ' nr-grp-platt' : ''));
        var gh = null;
        if(!platt){
          gh = el('div', 'nr-grp-h', g.rubrik + ' ' + chev(gOpen));
          grp.appendChild(gh);
        }
        var gbody = el('div', 'nr-grp-body');

        (g.varianter || []).forEach(function(v){
          var btn = el('button', 'nr-rad' + (v.kommer ? ' is-kommer' : ''),
            '<span class="nr-t">' + v.titel + '</span>'
            + (v.etikett ? '<span class="nr-fm">' + v.etikett + '</span>' : ''));
          btn.type = 'button';
          if(v.kommer){ btn.disabled = true; btn.setAttribute('aria-disabled', 'true'); }
          else {
            btn.addEventListener('click', function(){
              // 4. valjVariant — markeringen flyttas, arbetsytan byter innehåll.
              allaVarianter.forEach(function(b){ b.classList.remove('is-on'); });
              btn.classList.add('is-on');
              nivmsg.textContent = '';
              if(typeof v.valj === 'function') v.valj();
            });
          }
          gbody.appendChild(btn);
          allaVarianter.push(btn);
        });

        grp.appendChild(gbody);
        if(gh) gh.addEventListener('click', function(){ toggleGrp(grp); });
        body.appendChild(grp);
      });

      huvud.appendChild(body);
      hh.addEventListener('click', function(){ toggleHuvud(spaltA, huvud); });
      spaltA.appendChild(huvud);
    });

    // ── MINA KUNSKAPER: fyra vyer, växlas ──────────────────────────────────────────────────
    var minaKnappar = [];
    (cfg.mina || []).forEach(function(m, i){
      var btn = el('button', 'nr-mrad' + (i === 0 ? ' is-on' : ''),
        m.titel + '<span class="nr-sub">' + m.sub + '</span>');
      btn.type = 'button';
      btn.addEventListener('click', function(){
        minaKnappar.forEach(function(b){ b.classList.remove('is-on'); });
        btn.classList.add('is-on');
        (cfg.mina || []).forEach(function(x){
          var v = document.getElementById(x.vy);
          if(v) v.classList.toggle('is-on', x.vy === m.vy);
        });
      });
      minaKnappar.push(btn);
      spaltM.appendChild(btn);
    });

    vard.appendChild(lager);
    vard.appendChild(wrap);
    ritaNiva();

    // Första variantens innehåll visas direkt, så arbetsytan aldrig står tom.
    var forstVariant = allaVarianter.filter(function(b){ return !b.disabled; })[0];
    if(forstVariant) forstVariant.click();

    return {
      ytaArbeta: ytaA, ytaMina: ytaM, nivrad: nivrad, nivmsg: nivmsg,
      valjLager: valjLager, ritaNiva: ritaNiva
    };
  }

  window.NavRam = { montera: montera };
})();
