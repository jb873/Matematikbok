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

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function svgStart(w, h, alt){ return '<svg class="af-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(alt) + '">'; }
  function poly(punkter){ return '<polygon class="' + FYLL + ' ' + KANT + '" points="' + punkter.map(function(p){ return p[0] + ',' + p[1]; }).join(' ') + '"/>'; }
  // Etikett på sidan mellan p och q, förskjuten UTÅT från figurens mitt.
  function sidEtikett(p, q, mitt, text, avst){
    var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    var dx = mx - mitt[0], dy = my - mitt[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    var d = avst || 16, x = mx + dx / len * d, y = my + dy / len * d;
    var anchor = Math.abs(dx) / len > 0.5 ? (dx > 0 ? 'start' : 'end') : 'middle';
    return '<text class="' + TXT + '" x="' + x.toFixed(1) + '" y="' + (y + 5).toFixed(1) + '" text-anchor="' + anchor + '">' + esc(text) + '</text>';
  }
  function mitten(pts){ var sx = 0, sy = 0; pts.forEach(function(p){ sx += p[0]; sy += p[1]; }); return [sx / pts.length, sy / pts.length]; }
  function enhetTxt(o, w){ return o.enhet ? '<text class="' + TXT + ' af-enhet" x="' + (w - 4) + '" y="14" text-anchor="end">(' + esc(o.enhet) + ')</text>' : ''; }

  function undertext(o, w, h){
    return o.under ? '<text class="' + TXT + ' af-under" x="' + (w / 2) + '" y="' + (h - 4) + '" text-anchor="middle">' + esc(o.under) + '</text>' : '';
  }
  function figur(pts, matt, opts, w, h, alt){
    var m = mitten(pts), s = svgStart(w, h, opts.alt || alt) + poly(pts);
    pts.forEach(function(p, i){ var q = pts[(i + 1) % pts.length]; if(matt[i]) s += sidEtikett(p, q, m, matt[i], opts.avstand); });
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

  window.SvgAlgebraFigur = { rektangel: rektangel, fyrhorning: fyrhorning, triangel: triangel, femhorning: femhorning,
                             vinkeltriangel: vinkeltriangel, sidtriangel: sidtriangel };
})();
