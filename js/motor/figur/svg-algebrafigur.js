/* ============================================================
   FAMILJ · FIGUR: delade SVG-figurer för algebra (window.SvgAlgebraFigur).
   Månghörningar vars sidor är MÄRKTA MED UTTRYCK (3x, 2b, 18 …) — underlaget
   för "skriv ett uttryck för figurens omkrets". Config-driven: sidmåtten är
   data, figuren ritas ur dem, så figur och facit inte kan glida isär.

   Egna exempel, inga avritade bokfigurer (order 2026-09-22): måtten kommer ur
   bladets data och kan bytas utan att rita om något.

   Formerna är medvetet SCHEMATISKA — sidorna är inte skalenliga mot uttrycken
   (3x kan vara vad som helst); de visar formen och var måttet står, precis som
   läroboksfigurerna. Etiketten placeras utanför kanten, på sidans mittpunkt.

   API (alla returnerar en SVG-sträng):
     rektangel({ bredd:'4x', hojd:'3', enhet })
     fyrhorning({ sidor:['3x','18','5x','12'], enhet })     topp, höger, botten, vänster
     triangel({ ben:'3y', bas:'4', enhet })                 likbent
     femhorning({ sidor:[s1..s5], enhet })
   Ingen nätväg. Temas via af-*-klasser.
   ============================================================ */
(function(){
  'use strict';
  var FYLL = 'af-yta', KANT = 'af-kant', TXT = 'af-matt';

  // MINUSTECKEN I ETIKETTERNA: figurens text är matematik, och "4x - 9" ska visas "4x − 9"
  // precis som i uppgiftstexten. Kopplingen ligger i esc(), som SAMTLIGA etiketter går igenom
  // (sidmått, hörnbokstäver, enheter, prislappar, sträckor) — inte per etikett, så att en ny
  // figur får tecknet utan att någon behöver minnas det.
  //
  // Kärnans funktion används när den finns; modulen laddas också utan bladkärnan
  // (provbyggaren), och då gäller samma regel lokalt.
  function minusUt(s){
    if(window.BLAD_MINUS_UT) return window.BLAD_MINUS_UT(s);
    if(s == null) return s;
    return String(s).replace(/(^|[\s(=])[-\u2013](?=\d|\()/g, "$1\u2212")
                    .replace(/(\S)\s[-\u2013]\s(?=\S)/g, "$1 \u2212 ");
  }
  function esc(s){ return minusUt(String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function svgStart(w, h, alt){ return '<svg class="af-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(alt) + '">'; }
  function poly(punkter){ return '<polygon class="' + FYLL + ' ' + KANT + '" points="' + punkter.map(function(p){ return p[0] + ',' + p[1]; }).join(' ') + '"/>'; }
  // Ligger punkten inuti polygonen? (stråle åt höger, räkna korsningar)
  function inuti(x, y, pts){
    var inne = false;
    for(var i = 0, j = pts.length - 1; i < pts.length; j = i++){
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if(((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi)) inne = !inne;
    }
    return inne;
  }
  /* ETIKETT PÅ SIDAN mellan p och q, förskjuten VINKELRÄTT UT från sidan.
     Förr förskjöts den i riktningen från figurens tyngdpunkt. För en konvex figur pekar den ut,
     men en L-figur är inte konvex: urtagets sidor fick då en riktning LÄNGS linjen, och etiketten
     hamnade på hörnet ovanpå den. Nu bär varje sida sin egen normal, och av de två väljs den som
     inte pekar in i figuren. Konvexa figurer ser likadana ut som förut. */
  /* inne: etiketten står på figurens INSIDA. Ett urtags botten märks så i förlagan — utanför hamnar
     den i urtaget, bredvid urtagets djup, och de två måtten läses som ett. */
  function sidEtikett(p, q, mitt, text, avst, pts, inne){
    var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    var ex = q[0] - p[0], ey = q[1] - p[1], len = Math.sqrt(ex * ex + ey * ey) || 1;
    var nx = -ey / len, ny = ex / len;                       // normal
    if(pts && inuti(mx + nx * 4, my + ny * 4, pts)){ nx = -nx; ny = -ny; }
    else if(!pts){                                            // utan punktlista: som förut
      var dx = mx - mitt[0], dy = my - mitt[1], dl = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = dx / dl; ny = dy / dl;
    }
    if(inne){ nx = -nx; ny = -ny; }
    var d = avst || 16, x = mx + nx * d, y = my + ny * d;
    var anchor = Math.abs(nx) > 0.5 ? (nx > 0 ? 'start' : 'end') : 'middle';
    /* Baslinjen: en etikett ovanför sidan ska lyfta hela sin höjd, en under bara sin baslinje.
       Utan det hänger texten ner i linjen den just flyttats bort från. */
    var dy2 = ny < -0.5 ? 0 : (ny > 0.5 ? 12 : 5);
    return '<text class="' + TXT + '" x="' + x.toFixed(1) + '" y="' + (y + dy2).toFixed(1) + '" text-anchor="' + anchor + '">' + esc(text) + '</text>';
  }
  function mitten(pts){ var sx = 0, sy = 0; pts.forEach(function(p){ sx += p[0]; sy += p[1]; }); return [sx / pts.length, sy / pts.length]; }
  function enhetTxt(o, w){ return o.enhet ? '<text class="' + TXT + ' af-enhet" x="' + (w - 4) + '" y="14" text-anchor="end">(' + esc(o.enhet) + ')</text>' : ''; }

  function undertext(o, w, h){
    return o.under ? '<text class="' + TXT + ' af-under" x="' + (w / 2) + '" y="' + (h - 4) + '" text-anchor="middle">' + esc(o.under) + '</text>' : '';
  }
  function figur(pts, matt, opts, w, h, alt){
    var m = mitten(pts);
    // HÖRNEN (valfria): en uppgift som talar om "sidan AC" måste visa var A och C sitter.
    // Modulen kunde rita hörnbokstäver sedan tidigare, men bara i vinkeltriangel — som i sin tur
    // saknar sidetiketter. Nu bär figur() båda, så varje figurtyp kan ha hörn.
    var hornNamn = (opts.horn || []).filter(Boolean).join('');
    var etikett = opts.alt || (alt + (hornNamn ? ' och hörnen ' + hornNamn.split('').join(', ') : ''));
    var s = svgStart(w, h, etikett) + poly(pts);
    var inne = opts.inne || [];
    pts.forEach(function(p, i){ var q = pts[(i + 1) % pts.length]; if(matt[i]) s += sidEtikett(p, q, m, matt[i], opts.avstand, pts, inne.indexOf(i) >= 0); });
    if(opts.horn) pts.forEach(function(p, i){ s += hornEtikett(p, m, opts.horn[i], null); });
    return s + enhetTxt(opts, w) + undertext(opts, w, h) + '</svg>';
  }

  // Hörnets etikett: bokstaven utanför hörnet, ett eventuellt gradtal innanför.
  function hornEtikett(p, mitt, bokstav, varde){
    var dx = p[0] - mitt[0], dy = p[1] - mitt[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ut = '';
    if(bokstav){
      var bx = p[0] + dx / len * 14, by = p[1] + dy / len * 14;
      ut += '<text class="' + TXT + ' af-horn" x="' + bx.toFixed(1) + '" y="' + (by + 5).toFixed(1) + '" text-anchor="middle">' + esc(bokstav) + '</text>';
    }
    if(varde){
      var ix = p[0] - dx / len * 30, iy = p[1] - dy / len * 30;
      ut += '<text class="' + TXT + '" x="' + ix.toFixed(1) + '" y="' + (iy + 5).toFixed(1) + '" text-anchor="middle">' + esc(varde) + '</text>';
    }
    return ut;
  }

  // Triangel med namngivna hörn och kända vinklar. Formen är sned med flit: en liksidig ritning
  // antyder lika vinklar. vinklar[i] tomt = okänd vinkel, som eleven själv sätter namn på.
  function vinkeltriangel(o){
    var w = 250, h = 160, pts = [[46, 128], [212, 128], [104, 30]];
    var horn = o.horn || ['A', 'B', 'C'], vinklar = o.vinklar || [];
    var m = mitten(pts);
    var namn = horn.filter(Boolean).join(', ');
    var s2 = svgStart(w, h, o.alt || ('Triangel med hörnen ' + namn)) + poly(pts);
    pts.forEach(function(p, i){ s2 += hornEtikett(p, m, horn[i], vinklar[i]); });
    return s2 + undertext(o, w, h) + '</svg>';
  }

  // Triangel vars SIDOR är namngivna (sida a, b, c) — samma sneda form.
  function sidtriangel(o){
    var w = 250, h = 160, pts = [[46, 128], [212, 128], [104, 30]];
    var sidor = o.sidor || ['', '', ''];
    return figur(pts, sidor, o, w, h, o.alt || ('Triangel med sidorna ' + sidor.filter(Boolean).join(', ')));
  }

  function rektangel(o){
    var w = 260, h = 140, x0 = 60, y0 = 34, bw = 140, bh = 74;
    var pts = [[x0, y0], [x0 + bw, y0], [x0 + bw, y0 + bh], [x0, y0 + bh]];
    return figur(pts, [o.bredd, o.hojd, '', ''], o, w, h, 'Rektangel med sidorna ' + o.bredd + ' och ' + o.hojd);
  }
  // Fyrhörning: rak botten, lodräta sidor av olika höjd (formen i bokens uppgift) — topp, höger, botten, vänster.
  function fyrhorning(o){
    var w = 280, h = 150, x0 = 62, yB = 112, bw = 150;
    var pts = [[x0, 62], [x0 + bw, 34], [x0 + bw, yB], [x0, yB]];
    return figur(pts, [o.sidor[0], o.sidor[1], o.sidor[2], o.sidor[3]], o, w, h, 'Fyrhörning med sidorna ' + o.sidor.join(', '));
  }
  function triangel(o){
    var w = 220, h = 150, cx = 110, top = 24, yB = 116, halv = 34;
    var pts = [[cx, top], [cx + halv, yB], [cx - halv, yB]];
    return figur(pts, [o.ben, o.bas, o.ben], o, w, h, 'Likbent triangel med benen ' + o.ben + ' och basen ' + o.bas);
  }
  // Femhörning: oregelbunden (som bokens), sidorna i ordning från övre vänstra hörnet medurs.
  function femhorning(o){
    var w = 290, h = 160, pts = [[70, 60], [150, 28], [232, 60], [214, 122], [92, 134]];
    return figur(pts, o.sidor, o, w, h, 'Femhörning med sidorna ' + o.sidor.join(', '));
  }

  /* ── L-FIGUR (urtag i nedre högra hörnet) ──────────────────────────────────────────────────
     SEX sidor, uppräknade medurs från övre vänstra hörnet:
       0 topp · 1 höger · 2 urtagets överkant · 3 urtagets sida · 4 botten · 5 vänster
     Sidorna ÄR datan — samma lista som går till AlgBrak.gradeOmkrets, så figuren och facit kan
     inte skilja sig åt. Urtagets mått står utsatta med flit (Joachim 2026-10-04): utan dem går
     figuren inte att räkna på term för term, även om omkretsen råkar bli 2·(bredd + höjd).

     SAMMANHANGET SOM MÅSTE HÅLLA, och som bladets fuzz prövar:
       sida 0 = sida 4 + sida 2    (toppen är botten plus urtagets bredd)
       sida 5 = sida 1 + sida 3    (vänstra sidan är högra plus urtagets höjd)
     En sidlista som bryter mot det ritar en figur som inte går ihop. */
  /* urtag: 'uppe' (d3 del 2) lägger urtaget i ÖVRE högra hörnet — förlagans L. Sidorna räknas
     fortfarande medurs från övre vänstra hörnet, men blir då:
       0 topp · 1 urtagets sida · 2 urtagets underkant · 3 höger · 4 botten · 5 vänster
     med sambanden sida 4 = sida 0 + sida 2 och sida 5 = sida 1 + sida 3. */
  function lfigur(o){
    var sidor = o.sidor || [];
    var w = 300, h = 190, x0 = 54, y0 = 30, bw = 190, bh = 120, uw = 78, uh = 48;
    var pts = o.urtag === 'uppe'
      ? [[x0, y0], [x0 + bw - uw, y0], [x0 + bw - uw, y0 + uh], [x0 + bw, y0 + uh], [x0 + bw, y0 + bh], [x0, y0 + bh]]
      : [[x0, y0], [x0 + bw, y0], [x0 + bw, y0 + bh - uh],
         [x0 + bw - uw, y0 + bh - uh], [x0 + bw - uw, y0 + bh], [x0, y0 + bh]];
    return figur(pts, sidor, o, w, h,
      o.alt || ('L-formad figur med sidorna ' + sidor.filter(Boolean).join(', ')));
  }

  /* ── STRÄCKFIGUR — "hur lång är den röda sträckan?" ────────────────────────────────────────
     HELHETEN står alltid utsatt ovanför (Joachim 2026-10-04) — utan den går uppgiften inte att
     lösa. Delarna står under; den del som saknar text är den sökta och ritas i avvikande färg.
     Delarnas bredd i bilden är schematisk: talen står i etiketterna, och figuren ska inte gå att
     mäta med linjal i stället för att räknas ut. */
  function strackfigur(o){
    var delar = o.delar || [], n = delar.length;
    var w = 320, h = 104, x0 = 26, xs = w - 26, y = 62, bredd = (xs - x0) / Math.max(n, 1);
    var s2 = svgStart(w, h, o.alt || ('Str\u00e4cka ' + o.helhet + ' delad i ' + n + ' delar'));
    s2 += '<line class="af-matt" x1="' + x0 + '" y1="28" x2="' + xs + '" y2="28"/>'
       +  '<line class="af-matt" x1="' + x0 + '" y1="22" x2="' + x0 + '" y2="34"/>'
       +  '<line class="af-matt" x1="' + xs + '" y1="22" x2="' + xs + '" y2="34"/>'
       +  '<text class="' + TXT + '" x="' + ((x0 + xs) / 2) + '" y="18" text-anchor="middle">' + esc(o.helhet) + '</text>';
    delar.forEach(function(d, i){
      var a = x0 + i * bredd, b = a + bredd, sokt = !d.text;
      s2 += '<line class="af-del' + (sokt ? ' af-sokt' : '') + '" x1="' + a + '" y1="' + y + '" x2="' + b + '" y2="' + y + '"/>'
         +  '<line class="af-matt" x1="' + a + '" y1="' + (y - 6) + '" x2="' + a + '" y2="' + (y + 6) + '"/>'
         +  '<line class="af-matt" x1="' + b + '" y1="' + (y - 6) + '" x2="' + b + '" y2="' + (y + 6) + '"/>'
         +  '<text class="' + TXT + (sokt ? ' af-sokt-txt' : '') + '" x="' + ((a + b) / 2) + '" y="' + (y + 22) + '" text-anchor="middle">'
         +  esc(d.text || '?') + '</text>';
    });
    return s2 + undertext(o, w, h) + '</svg>';
  }

  /* ── PRISLAPP — varan och dess pris ────────────────────────────────────────────────────────
     Bokens prisbilder är fotografier, och skannade bilder kommer inte in på sidan. Här ritas en
     lapp per vara i stället. Ett uttryck (x kr) är ett pris lika gärna som ett tal — det är hela
     poängen med uppgiften. */
  function prislappar(o){
    var varor = o.varor || [], n = varor.length;
    var bw = 118, mellan = 18, w = n * bw + (n - 1) * mellan + 20, h = 86;
    var s2 = svgStart(w, h, o.alt || ('Prislappar: ' + varor.map(function(v){ return v.namn + ' ' + v.pris; }).join(', ')));
    varor.forEach(function(v, i){
      var x = 10 + i * (bw + mellan);
      s2 += '<rect class="af-lapp" x="' + x + '" y="14" width="' + bw + '" height="54" rx="7"/>'
         +  '<text class="' + TXT + ' af-lapp-namn" x="' + (x + bw / 2) + '" y="36" text-anchor="middle">' + esc(v.namn) + '</text>'
         +  '<text class="' + TXT + ' af-lapp-pris" x="' + (x + bw / 2) + '" y="58" text-anchor="middle">' + esc(v.pris) + '</text>';
    });
    return s2 + undertext(o, w, h) + '</svg>';
  }

  /* ══ MULTIPLIKATION MED PARENTES (åk8 d3 del 2, FAS 2 2026-10-26) ══════════════════════════
     Fyra figurer ur Joachims dokument, ritade med egna mått. Måtten är data som i figurerna ovan;
     ett tomt mått ritas inte (sidan finns men är omärkt — eleven räknar ut den). */

  /* ── DELAD REKTANGEL — sidorna delade i delar, ytan i rutor ─────────────────────────────────
     hojder uppifrån och ned, bredder från vänster. hojder ['x'] och bredder ['x', '4'] är en
     rektangel x · (x + 4) i två rutor; två höjder och två bredder ger fyra. Delarnas storlek i
     bilden är schematisk: en del med variabel ritas något större än en ren siffra, inget mer. */
  function deladRektangel(o){
    var hojder = o.hojder || [], bredder = o.bredder || [];
    function vikt(s){ return /[a-z]/i.test(s) ? 1.5 : 1; }
    function delning(lista, total){
      var sum = lista.reduce(function(a, s){ return a + vikt(s); }, 0), pos = [0];
      lista.forEach(function(s){ pos.push(pos[pos.length - 1] + vikt(s) / sum * total); });
      return pos;
    }
    var bw = 170, bh = hojder.length > 1 ? 112 : 76, x0 = 62, y0 = 22, w = 270, h = y0 + bh + 34;
    var px = delning(bredder, bw), py = delning(hojder, bh);
    var pts = [[x0, y0], [x0 + bw, y0], [x0 + bw, y0 + bh], [x0, y0 + bh]];
    var s = svgStart(w, h, o.alt || ('Rektangel delad i rutor, höjderna ' + hojder.join(' och ')
      + ', bredderna ' + bredder.join(' och '))) + poly(pts);
    px.slice(1, -1).forEach(function(x){ s += '<line class="' + KANT + '" x1="' + (x0 + x).toFixed(1) + '" y1="' + y0 + '" x2="' + (x0 + x).toFixed(1) + '" y2="' + (y0 + bh) + '"/>'; });
    py.slice(1, -1).forEach(function(y){ s += '<line class="' + KANT + '" x1="' + x0 + '" y1="' + (y0 + y).toFixed(1) + '" x2="' + (x0 + bw) + '" y2="' + (y0 + y).toFixed(1) + '"/>'; });
    hojder.forEach(function(t, i){ if(t) s += '<text class="' + TXT + '" x="' + (x0 - 10) + '" y="' + (y0 + (py[i] + py[i + 1]) / 2 + 5).toFixed(1) + '" text-anchor="end">' + esc(t) + '</text>'; });
    bredder.forEach(function(t, i){ if(t) s += '<text class="' + TXT + '" x="' + (x0 + (px[i] + px[i + 1]) / 2).toFixed(1) + '" y="' + (y0 + bh + 20) + '" text-anchor="middle">' + esc(t) + '</text>'; });
    return s + enhetTxt(o, w) + undertext(o, w, h) + '</svg>';
  }

  /* ── U-FIGUR (urtag mitt i överkanten) ──────────────────────────────────────────────────────
     ÅTTA sidor, medurs från övre vänstra hörnet:
       0 topp vänster · 1 urtagets vänstra sida · 2 urtagets botten · 3 urtagets högra sida ·
       4 topp höger · 5 höger · 6 botten · 7 vänster
     SAMMANHANGET SOM MÅSTE HÅLLA: sida 6 = sida 0 + sida 2 + sida 4, sida 5 = sida 7, sida 1 = sida 3. */
  function ufigur(o){
    var sidor = o.sidor || [];
    /* Urtaget är brett nog för två etiketter: djupet på en av väggarna och bredden ovanför botten.
       Med 56 px krockade de (mätt i förhandsvisningen 2026-10-26). */
    var w = 300, h = 180, x0 = 54, y0 = 28, bw = 192, bh = 110, uw = 88, ud = 58, ul = x0 + (bw - uw) / 2;
    var pts = [[x0, y0], [ul, y0], [ul, y0 + ud], [ul + uw, y0 + ud], [ul + uw, y0],
               [x0 + bw, y0], [x0 + bw, y0 + bh], [x0, y0 + bh]];
    var o2 = {}; Object.keys(o).forEach(function(k){ o2[k] = o[k]; });
    if(!o2.inne) o2.inne = [2];                               // urtagets botten märks inifrån, som i förlagan
    return figur(pts, sidor, o2, w, h, o.alt || ('U-formad figur med sidorna ' + sidor.filter(Boolean).join(', ')));
  }

  /* ── TRIANGELURTAG — rektangel där en triangel är bortskuren från överkanten ner till mitten ─
     FEM sidor, medurs från övre vänstra hörnet:
       0 vänster snedsida · 1 höger snedsida · 2 höger · 3 botten · 4 vänster
     Diagonalernas nedre halvor ritas streckade: de visar att urtagets spets ligger i mitten, så
     urtaget är en triangel med rektangelns bredd som bas och halva höjden som höjd. */
  function triangelurtag(o){
    var sidor = o.sidor || [];
    var w = 300, h = 160, x0 = 50, y0 = 22, bw = 200, bh = 96, cx = x0 + bw / 2, cy = y0 + bh / 2;
    var pts = [[x0, y0], [cx, cy], [x0 + bw, y0], [x0 + bw, y0 + bh], [x0, y0 + bh]];
    var s = figur(pts, sidor, o, w, h, o.alt || ('Rektangel med ett triangelformat urtag, sidorna ' + sidor.filter(Boolean).join(', ')));
    var hjalp = '<line class="af-hjalp" x1="' + cx + '" y1="' + cy + '" x2="' + x0 + '" y2="' + (y0 + bh) + '"/>'
              + '<line class="af-hjalp" x1="' + cx + '" y1="' + cy + '" x2="' + (x0 + bw) + '" y2="' + (y0 + bh) + '"/>';
    return s.replace(/(<polygon[^>]*\/>)/, '$1' + hjalp);
  }

  /* ── REKTANGEL MED HÅL — den färgade ytan är den stora rektangeln minus den lilla ────────────
     Måtten står under och till höger om båda rektanglarna. Hålet ritas som en del av samma yta
     (evenodd), så att det är ytan UTANFÖR hålet som är färgad. kvadrat: true ritar båda som
     kvadrater (förlagan till Fördjupningens sista uppgift). */
  function halrektangel(o){
    var k = !!o.kvadrat, w = 300, h = k ? 196 : 172, x0 = k ? 70 : 40, y0 = 20,
        bw = k ? 144 : 200, bh = k ? 144 : 120, hw = k ? 62 : 84, hh = k ? 62 : 48;
    var hx = x0 + (bw - hw) / 2 - 6, hy = y0 + (bh - hh) / 2 - 6;
    var d = 'M' + x0 + ' ' + y0 + 'h' + bw + 'v' + bh + 'h' + (-bw) + 'Z'
          + 'M' + hx + ' ' + hy + 'h' + hw + 'v' + hh + 'h' + (-hw) + 'Z';
    var s = svgStart(w, h, o.alt || ('Rektangel ' + o.bredd + ' gånger ' + o.hojd + ' med ett rektangulärt hål '
      + o.halBredd + ' gånger ' + o.halHojd));
    s += '<path class="' + FYLL + ' ' + KANT + '" fill-rule="evenodd" d="' + d + '"/>';
    function t(x, y, txt, anchor){ return txt ? '<text class="' + TXT + '" x="' + x + '" y="' + y + '" text-anchor="' + anchor + '">' + esc(txt) + '</text>' : ''; }
    s += t(x0 + bw / 2, y0 + bh + 20, o.bredd, 'middle') + t(x0 + bw + 8, y0 + bh / 2 + 5, o.hojd, 'start')
       + t(hx + hw / 2, hy + hh + 18, o.halBredd, 'middle') + t(hx + hw + 7, hy + hh / 2 + 5, o.halHojd, 'start');
    return s + enhetTxt(o, w) + undertext(o, w, h) + '</svg>';
  }

  window.SvgAlgebraFigur = { rektangel: rektangel, fyrhorning: fyrhorning, triangel: triangel, femhorning: femhorning,
                             vinkeltriangel: vinkeltriangel, sidtriangel: sidtriangel,
                             lfigur: lfigur, strackfigur: strackfigur, prislappar: prislappar,
                             deladRektangel: deladRektangel, ufigur: ufigur, triangelurtag: triangelurtag,
                             halrektangel: halrektangel };
})();
