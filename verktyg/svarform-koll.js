/* svarform-koll.js — SVARSFORMEN ÄR BINDANDE (order 2026-09-15 "Svarsformen ska hållas, åt båda håll").
   Delad av spec-fuzz-k2 (E-spåret) och spec-fuzz-akr9 (Åk9-spåret).

   Tre led som ska hänga ihop, och som grinden kontrollerar mot varandra:
     1. BANDET  (js/data/spec-villkor-k2.js, per nod × spår × nivå): svarform = TAKET för noden.
     2. GRUPPEN (variant-filens grupper: g.svarform): kravet uppgiften ställer — det rättaren läser.
        Utelämnad = 'enklaste' (förkortat; blandad ELLER oäkta godtas — 19/15-beslutet).
     3. FACIT   (genUppgift(...).facit.form / .svar.form, alla fyra varianter): formen cellen ritas efter.

   Regler:
     · band 'valfri'/saknas → gruppen får sätta vad den vill (noden täcker flera riktningar, t.ex. brak-blandad).
     · band 'enklaste' → gruppen måste vara 'enklaste' (en grupp som kräver blandad/bråkform under en
       enklaste-nod är STRÄNGARE än bandet → fel: bandet ska höjas, inte rättaren).
     · band 'brak'/'blandad'/'decimal' → gruppen måste säga samma.
     · grupp 'brak' → facit.form 'brak' i alla varianter; 'blandad' → 'blandad'; 'decimal' → 'tal'.
       (Formen bestäms av kravet, inte av värdet — brakForm(värde) får inte tvinga fram blandad där
        rubriken säger bråkform: Öva 1 G5, 2,5 → 5/2.)
   Cellformer utan svarscell (val/tecken/ordna/mgn/forlang/reciprok) kollas bara i led 1–2. */
'use strict';

var STRIKT = { brak: 1, blandad: 1, decimal: 1 };
var FACIT_FOR = { brak: 'brak', blandad: 'blandad', decimal: 'tal' };
var UTAN_SVARSCELL = { val: 1, tecken: 1, ordna: 1, mgn: 1, forlang: 1, reciprok: 1, kedja: 1 };
var BAND_UTAN_FORM = { val: 1, tecken: 1, ordning: 1, mgn: 1 };   // bandvärden som är CELLTYP, inte svarsform (klick/ordna/två celler)

function svarsformAv(facit){
  if(!facit) return null;
  if(facit.svar && facit.svar.form) return facit.svar.form;   // sammansatta (addsub/mult/div/komplexdiv/decbrak)
  return facit.form;
}

// bandSvarform(logg, spar) → lista av svarform över nivåerna (enstegs → [x])
function bandSvarformer(SPEC, logg, spar){
  if(!logg) return [];
  var v = SPEC.VILLKOR[logg]; if(!v || !v.spar || !v.spar[spar]) return [];
  var P = v.spar[spar];
  if(P.nivaer) return P.nivaer.map(function(n){ return n.svarform; }).filter(Boolean);
  return P.svarform ? [P.svarform] : [];
}

function kompatibel(bandList, grupp){
  if(!bandList.length) return true;
  // stege: gruppen är OK om NÅGON nivå tillåter den (nivåval ur form sker i fuzzens egen bandFor; här räcker unionen)
  return bandList.some(function(b){
    if(!b || b === 'valfri' || BAND_UTAN_FORM[b]) return true;
    if(b === grupp) return true;
    return false;
  });
}

// svarformKoll(API, SPEC, DOKS, spar) → { fel:[], rows:[] }
function svarformKoll(API, SPEC, DOKS, spar){
  var fel = [], rows = [];
  DOKS.forEach(function(dok){
    var idx = 0;
    API.MALLAR[dok].grupper.forEach(function(g, gi){
      var grupp = g.svarform || 'enklaste';
      var logg = (g.uppgifter[0] && g.uppgifter[0].logg) || g.logg || null;
      var band = bandSvarformer(SPEC, logg, spar);
      var tag = dok + ' G' + (gi + 1) + ' (' + (logg || 'ologgad') + ')';
      var bandOk = kompatibel(band, grupp);
      if(!bandOk) fel.push(tag + ': gruppen kräver ' + grupp + ' men bandet säger ' + band.join('|'));
      // led 3: facit-formen i varianterna
      var former = {}, facitOk = true;
      g.uppgifter.forEach(function(u, ui){
        for(var v = 0; v < 4; v++){
          var gu = API.genUppgift(u, dok, idx + ui, v), f = gu.facit;
          if(UTAN_SVARSCELL[f.form]) { former[f.form] = 1; continue; }
          var sf = svarsformAv(f); former[sf] = 1;
          if(STRIKT[grupp] && sf !== FACIT_FOR[grupp]){ facitOk = false; fel.push(tag + ' uppg ' + ui + ' variant ' + v + ': kravet ' + grupp + ' men facit-form ' + sf); }
        }
      });
      idx += g.uppgifter.length;
      rows.push({ dok: dok, g: 'G' + (gi + 1), grupp: grupp, band: band.join('|') || '—', former: Object.keys(former).join(','), ok: bandOk && facitOk });
    });
  });
  return { fel: fel, rows: rows };
}

function skrivRapport(res){
  res.rows.forEach(function(r){
    console.log('  ' + (r.dok + ' ' + r.g).padEnd(11) + ' krav ' + r.grupp.padEnd(9) + ' band ' + r.band.padEnd(18) + ' facit ' + r.former.padEnd(16) + (r.ok ? '✓' : '✗'));
  });
  console.log('  → svarform-avvikelser: ' + res.fel.length);
  res.fel.forEach(function(s){ console.log('    ✗ ' + s); });
}

module.exports = { svarformKoll: svarformKoll, skrivRapport: skrivRapport };
