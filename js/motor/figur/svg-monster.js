/* svg-monster.js — MÖNSTERFIGURER RITADE UR REGELN (window.SvgMonster), order 2026-09-30.

   Dokumentets figurer är inskannade läroboksbilder. Här ritas de om som SVG, och framför allt:
   figuren GENERERAS ur mönstrets regel, så att figur n kan ritas för varje n. Det behövs för
   varianterna och för färdighetsträningen — och det gör antalet mätbart i stället för påstått.

   TIO FAMILJER, INTE TIO KOPIOR
   Allt är antingen PUNKTER (kulor, bollar, prickar, knappar) eller STICKOR (kvadrater, trianglar,
   sexhörningar). Alltså två ritare. En familj är bara en placeringsregel: n → punkter, eller
   n → segment. Ritaren vet ingenting om mönstret; regeln vet ingenting om ritandet.

   STICKFAMILJERNA DELAR EN FUNKTION: radAvCeller upprepar en cell n gånger och slår ihop de
   kanter som sammanfaller. Då FALLER ANTALET UT UR GEOMETRIN i stället för att skrivas in —
   kvadraten ger 3n+1, triangeln 2n+1, sexhörningen 5n+1, utan att någon av dem nämner sin formel.

   ANTALET RÄKNAS UR DET RITADE (punkter.length / segment.length), aldrig ur en formel. Det är
   det som gör verktyg/monster-fuzz.js möjlig: den jämför det ritade antalet med familjens formel
   för n = 1…30, och skulle falla om ritningen och regeln gled isär.

   Ingen nätväg. */
(function(){
'use strict';

// ── färger ur paletten, med reserv (figuren ritas också på sidor som inte sätter variablerna) ──
var BLA  = 'var(--blue,#1b4b8a)';
var GULD = 'var(--gold,#9a7228)';
var ROD  = 'var(--rod,#c0392b)';

// ── RITARE 1: PUNKTER ──────────────────────────────────────────────────────────────────────
// punkter = [{ x, y, farg? }] i rutnätsenheter. r = radie i px, steg = enhetens px-avstånd.
function ritaPunkter(punkter, opts){
  opts = opts || {};
  var steg = opts.steg || 26, r = opts.r || 10, pad = r + 4;
  var xs = punkter.map(function(p){ return p.x; }), ys = punkter.map(function(p){ return p.y; });
  var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
  var b = (Math.max.apply(null, xs) - x0) * steg + pad * 2;
  var h = (Math.max.apply(null, ys) - y0) * steg + pad * 2;
  var kroppar = punkter.map(function(p){
    return '<circle cx="' + ((p.x - x0) * steg + pad).toFixed(1) + '" cy="' + ((p.y - y0) * steg + pad).toFixed(1)
         + '" r="' + r + '" fill="' + (p.farg || BLA) + '" stroke="rgba(0,0,0,.18)" stroke-width="1"/>';
  }).join('');
  return svgRam(b, h, kroppar, opts);
}

// ── RITARE 2: STICKOR ──────────────────────────────────────────────────────────────────────
// segment = [{ x1, y1, x2, y2 }] i rutnätsenheter.
function ritaStickor(segment, opts){
  opts = opts || {};
  var steg = opts.steg || 34, pad = 8, tj = opts.tjocklek || 4;
  var xs = [], ys = [];
  segment.forEach(function(s){ xs.push(s.x1, s.x2); ys.push(s.y1, s.y2); });
  var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
  var b = (Math.max.apply(null, xs) - x0) * steg + pad * 2;
  var h = (Math.max.apply(null, ys) - y0) * steg + pad * 2;
  var kroppar = segment.map(function(s){
    return '<line x1="' + ((s.x1 - x0) * steg + pad).toFixed(1) + '" y1="' + ((s.y1 - y0) * steg + pad).toFixed(1)
         + '" x2="' + ((s.x2 - x0) * steg + pad).toFixed(1) + '" y2="' + ((s.y2 - y0) * steg + pad).toFixed(1)
         + '" stroke="' + (opts.farg || GULD) + '" stroke-width="' + tj + '" stroke-linecap="round"/>';
  }).join('');
  return svgRam(b, h, kroppar, opts);
}

// max-width:100% — inget dokument får bli bredare än vyporten (ytkontraktets BREDD-ben).
function svgRam(b, h, inner, opts){
  return '<svg viewBox="0 0 ' + Math.ceil(b) + ' ' + Math.ceil(h) + '" width="' + Math.ceil(b) + '" height="' + Math.ceil(h)
       + '" style="max-width:100%;height:auto;" role="img"'
       + (opts && opts.alt ? ' aria-label="' + String(opts.alt).replace(/"/g, '&quot;') + '"' : ' aria-hidden="true"')
       + '>' + inner + '</svg>';
}

// ── DELAD REGEL FÖR ALLA STICKFAMILJER ─────────────────────────────────────────────────────
// Upprepa cellen n gånger med steget, och slå ihop kanter som sammanfaller. Antalet blir
// cellensKanter·n − delade, vilket ger 3n+1 / 2n+1 / 5n+1 UR GEOMETRIN — ingen formel skrivs in.
// kanter: [[x1,y1,x2,y2] …] i cellens egna koordinater. steg(k) ger cellens förskjutning.
function radAvCeller(kanter, steg, n, vridning){
  var sedd = {}, ut = [];
  for(var k = 0; k < n; k++){
    var d = steg(k);
    var vand = vridning ? vridning(k) : null;
    kanter.forEach(function(e){
      var p1 = { x: e[0], y: e[1] }, p2 = { x: e[2], y: e[3] };
      if(vand){ p1 = vand(p1); p2 = vand(p2); }
      var s = { x1: p1.x + d.x, y1: p1.y + d.y, x2: p2.x + d.x, y2: p2.y + d.y };
      var nyckel = kantNyckel(s);
      if(sedd[nyckel]) return;            // delad kant — ritas en gång
      sedd[nyckel] = 1; ut.push(s);
    });
  }
  return ut;
}
function kantNyckel(s){
  var a = s.x1.toFixed(3) + ',' + s.y1.toFixed(3), b = s.x2.toFixed(3) + ',' + s.y2.toFixed(3);
  return a < b ? a + '|' + b : b + '|' + a;   // riktningslös: samma kant åt båda hållen
}

// ── FAMILJERNA ─────────────────────────────────────────────────────────────────────────────
// Varje familj säger bara VAR sakerna ligger. Formeln står i kommentaren för läsarens skull och
// prövas av monster-fuzz mot det ritade antalet — den styr ingenting.
var FAMILJER = {

  // Kulor på rad: 1, 3, 5 …  (2n − 1)
  kulorRad: { slag: 'punkter', formel: function(n){ return 2 * n - 1; }, uttryck: '2n − 1',
    bygg: function(n){
      var p = [];
      for(var i = 0; i < 2 * n - 1; i++) p.push({ x: i, y: 0 });
      return p;
    } },

  // Tennisbollar i två rader: övre n+1, undre 2n+1  (3n + 2)
  bollarTva: { slag: 'punkter', formel: function(n){ return 3 * n + 2; }, uttryck: '3n + 2',
    bygg: function(n){
      var p = [], i;
      for(i = 0; i <= n; i++)     p.push({ x: i + 0.5, y: 0 });
      for(i = 0; i <= 2 * n; i++) p.push({ x: i, y: 1 });
      return p;
    } },

  // Prickar i triangel: övre n, undre n+1  (2n + 1)
  prickarTriangel: { slag: 'punkter', formel: function(n){ return 2 * n + 1; }, uttryck: '2n + 1',
    bygg: function(n){
      var p = [], i;
      for(i = 0; i < n; i++)  p.push({ x: i + 0.5, y: 0 });
      for(i = 0; i <= n; i++) p.push({ x: i, y: 1 });
      return p;
    } },

  // Knappar som formar en fyra (Joachims uppdelning 2026-09-30):
  // vänster kolumn n+1, mittraden n−1, höger kolumn 2n+1  (4n + 1)
  knappar4: { slag: 'punkter', formel: function(n){ return 4 * n + 1; }, uttryck: '4n + 1',
    bygg: function(n){
      var p = [], i;
      for(i = 0; i <= n; i++)     p.push({ x: 0, y: i });            // vänster kolumn, n+1
      for(i = 1; i < n; i++)      p.push({ x: i, y: n });            // mittraden, n−1
      for(i = 0; i <= 2 * n; i++) p.push({ x: n, y: i });            // höger kolumn, 2n+1
      return p;
    } },

  // Röda kulor i 2×2-block: n block à fyra  (4n)
  kulorBlock: { slag: 'punkter', formel: function(n){ return 4 * n; }, uttryck: '4n',
    bygg: function(n){
      var p = [];
      for(var k = 0; k < n; k++){
        p.push({ x: k * 2.5,     y: 0, farg: ROD }); p.push({ x: k * 2.5 + 1, y: 0, farg: ROD });
        p.push({ x: k * 2.5,     y: 1, farg: ROD }); p.push({ x: k * 2.5 + 1, y: 1, farg: ROD });
      }
      return p;
    } },

  // Blå och röda: blå 2n uppe + 2n nere, röda 2n−1 emellan  (blå 4n, totalt 6n − 1)
  blaRoda: { slag: 'punkter', formel: function(n){ return 6 * n - 1; }, uttryck: '6n − 1',
    delformel: { bla: function(n){ return 4 * n; }, blaUttryck: '4n' },
    bygg: function(n){
      var p = [], i;
      for(i = 0; i < 2 * n; i++)     p.push({ x: i, y: 0, farg: BLA });
      for(i = 0; i < 2 * n - 1; i++) p.push({ x: i + 0.5, y: 1, farg: ROD });
      for(i = 0; i < 2 * n; i++)     p.push({ x: i, y: 2, farg: BLA });
      return p;
    } },

  // Kvadrater i rad av stickor: 4 kanter, n−1 delade  (3n + 1)
  kvadrater: { slag: 'stickor', formel: function(n){ return 3 * n + 1; }, uttryck: '3n + 1',
    bygg: function(n){
      return radAvCeller([[0,0, 1,0], [1,0, 1,1], [1,1, 0,1], [0,1, 0,0]],
                         function(k){ return { x: k, y: 0 }; }, n);
    } },

  // Trianglar i rad, VÄXLANDE RIKTNING (▽△▽…): 3 kanter, n−1 delade  (2n + 1)
  // Varannan triangel pekar nedåt, varannan uppåt — som i förlagan. Riktningen kommer ur
  // hörnens placering, inte ur en spegling: udda k läser toppen som botten.
  trianglar: { slag: 'stickor', formel: function(n){ return 2 * n + 1; }, uttryck: '2n + 1',
    bygg: function(n){
      var segment = [], sedd = {};
      for(var k = 0; k < n; k++){
        var x = k * 0.5, hop;
        if(k % 2 === 0) hop = [{x:x, y:0}, {x:x+1, y:0}, {x:x+0.5, y:1}];   // ▽ två hörn uppe, spetsen ned
        else            hop = [{x:x, y:1}, {x:x+1, y:1}, {x:x+0.5, y:0}];   // △ två hörn nere, spetsen upp
        for(var i = 0; i < 3; i++){
          var a = hop[i], b = hop[(i + 1) % 3];
          var s = { x1: a.x, y1: a.y, x2: b.x, y2: b.y }, nyckel = kantNyckel(s);
          if(sedd[nyckel]) continue;
          sedd[nyckel] = 1; segment.push(s);
        }
      }
      return segment;
    } },

  // Sexhörningar i rad: 6 kanter, n−1 delade  (5n + 1)
  sexhorningar: { slag: 'stickor', formel: function(n){ return 5 * n + 1; }, uttryck: '5n + 1',
    bygg: function(n){ return radAvCeller(sexKanter(0.25), function(k){ return { x: k, y: 0 }; }, n); } },

  // Långa sexhörningar: samma topologi, högre cell  (5n + 1)
  langaSexhorningar: { slag: 'stickor', formel: function(n){ return 5 * n + 1; }, uttryck: '5n + 1',
    bygg: function(n){ return radAvCeller(sexKanter(0.3, 1.8), function(k){ return { x: k, y: 0 }; }, n); } }
};

// Sexhörning med lodräta sidor: vänster och höger kant är lodräta, så grannen delar dem.
// lut = spetsens höjd som andel av cellen; hojd = cellens höjd i enheter.
// lut MÅSTE vara < 0,5 — vid 0,5 möts spetsarna och den lodräta sidan blir noll lång. Då ritas
// en romb i stället för en sexhörning, och ANTALET stämmer ändå (sex kanter, en av dem utan
// längd). Det var så långaSexhorningar blev fel form med rätt siffra.
function sexKanter(lut, hojd){
  var h = hojd || 1, t = lut * h, b = h - t;
  return [
    [0, t,  0.5, 0],   // upp-vänster
    [0.5, 0, 1, t],    // upp-höger
    [1, t,  1, b],     // höger (delas med nästa cell)
    [1, b,  0.5, h],   // ned-höger
    [0.5, h, 0, b],    // ned-vänster
    [0, b,  0, t]      // vänster
  ];
}

// ── FIGUR: ritad ur regeln, antalet räknat ur det ritade ────────────────────────────────────
function figur(familjNamn, n, opts){
  var f = FAMILJER[familjNamn];
  if(!f) return { svg: '', antal: 0, fel: 'okänd familj: ' + familjNamn };
  var delar = f.bygg(n);
  var svg = f.slag === 'punkter' ? ritaPunkter(delar, opts) : ritaStickor(delar, opts);
  return { svg: svg, antal: delar.length, slag: f.slag, uttryck: f.uttryck };
}

// Figur 1, 2, 3 bredvid varandra — dokumentets "Detta är de tre första figurerna i ett mönster".
function treForsta(familjNamn, opts){
  var ut = '<div class="monster-rad">';
  for(var n = 1; n <= 3; n++){
    ut += '<figure class="monster-figur">' + figur(familjNamn, n, opts).svg
        + '<figcaption>figur ' + n + '</figcaption></figure>';
  }
  return ut + '</div>';
}

window.SvgMonster = { figur: figur, treForsta: treForsta, FAMILJER: FAMILJER,
                      ritaPunkter: ritaPunkter, ritaStickor: ritaStickor, radAvCeller: radAvCeller };
})();
