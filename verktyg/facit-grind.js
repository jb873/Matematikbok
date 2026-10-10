/* facit-grind.js — REGEL 11: FACIT STÄMMER, RÄKNAT UR UPPGIFTEN (order 2026-10-09, k1 d10 FAS 2).

   SKÄLET. Ingen grind räknade facit i plugg-datan: ett lästal där 528 · 8 / 12 = 352 bar facit 400,
   och det syntes först när någon räknade för hand. Den här grinden räknar varje rad ur sin uppgift,
   per radtyp, och jämför med datans svar.

   MÄTS SÅ (i webbläsaren, på sidans riktiga data):
     enkel / prioKedja   uttrycket räknas ut = svar; kedjans exempelled har samma värde — både i datan
                         och SÅ SOM DET VISAS (kärnans matteUt; inget ostaplat snedstreck)
     mellan / overslag   uttrycket = svar; varje mellanled har svarets värde (överslag: mellanledet)
     brakText            (heltal +) täljare / nämnare = svar — avrundat till två decimaler om rubriken säger det
     brakSvarB           varje godkänt bråk har decimaltalets värde
     uttryck             utvecklad form: uttrycket = talet i frågan
     ordningsfoljd       ordningen = talen sorterade
     foljd               fortsättningen har talföljdens konstanta steg
     val                 rätt alternativ = det som ligger närmast målet i rubriken
     flerval             de rätta = de tal som uppfyller rubrikens villkor (delbar med n / primtal / sammansatt)
     fragaText           platsvärde, "X tiotal större än N", "N tiondelar …", talnamn i ord, avrundning,
                         "en tiondel/hundradel större än", störst av två, bygg tal av siffror
     problem (lästal)    exakt och overslag ur datan: svar = överslaget (eller exakt där överslag saknas),
                         och det exakta ligger NÄRA (0 < avstånd ≤ 10 %) — annars lär uppgiften inget om överslag;
                         exempelledet i "Min uträkning" prövas som det visas, precis som kedjans
     tallinjen           varje markering ligger på linjen; valrutans svar finns bland alternativen
   En rad som grinden inte kan räkna är ett BROTT ("ej räknad") — en grind som hoppar över det den inte
   förstår skriver grönt om ingenting.

   KÖR:  node verktyg/facit-grind.js [--sabba]      --sabba: ändrar ett svar i minnet → grinden MÅSTE fälla
   Omfång: sidorna i OMFANG (Plugg till prov k1 d10). Ny sida → en rad. Noll nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const SABBA = process.argv.includes('--sabba');
const OMFANG = ['ak7/k1/d10-pluggtillprov/index.html'];
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var SABBA = ${SABBA};
  var ut = { rader: 0, brott: [], ejRaknad: [], perTyp: {} };
  function tal(s){ return parseFloat(String(s).replace(/\\s/g, '').replace(/\\u2212/g, '-').replace(',', '.')); }
  function ev(uttr){
    // STAPLADE BRÅK I DATAN (span.ovn-brak) → (T/N); ett heltal direkt före är blandad form → (H+T/N).
    // Samma för skrivet blandat tal "1 2/5". Utan det lästes "1 2/5" som 1 25.
    var u = String(uttr).replace(/<span class="ovn-brak"><span class="ovn-brak-taljare">([^<]*)<\\/span><span class="ovn-brak-strecket"><\\/span><span class="ovn-brak-namnare">([^<]*)<\\/span><\\/span>/g, '\\u00a7($1/$2)');
    u = u.replace(/(\\d+)\\s*\\u00a7\\(/g, '($1+').replace(/\\u00a7/g, '');
    u = u.replace(/(^|[^\\d,])(\\d+)\\s+(\\d+)\\/(\\d+)/g, '$1($2+$3/$4)');
    var e = u.replace(/<[^>]*>/g, ' ').replace(/[=≈]\\s*$/, '').replace(/[x×·]/g, '*').replace(/\\u2212/g, '-')
      .replace(/(\\d)\\s+(?=\\d{3}(?!\\d))/g, '$1').replace(/,/g, '.').replace(/\\s/g, '');
    // blandad form "1 2/5" står som "12/5" efter mellanslagen bort — men bara när heltalet stod före ett bråk.
    if(!/^[-+*/().\\d]+$/.test(e)) return NaN;
    try { return Function('"use strict";return (' + e + ')')(); } catch(err){ return NaN; }
  }
  function lika(a, b, tol){ return isFinite(a) && isFinite(b) && Math.abs(a - b) < (tol || 1e-9); }
  /* FACIT SOM VISAS (2026-10-10). Exempelledet står i datan som ASCII men visas genom kärnans
     matteUt (minustecken + staplade bråk). brakUt staplar bara enkla termer, så "3 600 / 6" visades
     som blandat tal 3 600⁄6, "1 200 / 10" som 1 200⁄10 och "9 / 0,3" som 9⁄0 följt av ",3" — datan
     räknades rätt, skärmen visade något annat. Ledet renderas därför med SAMMA funktioner och räknas
     ur det renderade: det som eleven ser ska ge svaret, och inget snedstreck får stå ostaplat (K-H). */
  function visatLed(led, s, fel){
    var html = window.BLAD_BRAK_UT(window.BLAD_MINUS_UT(String(led))), syns = html.replace(/<[^>]*>/g, ' ');
    if(/\\//.test(syns)) fel('exempelledet "' + led + '" visas med ostaplat snedstreck: "' + syns.replace(/\\s+/g, ' ').trim() + '"');
    var vv = ev(html);
    if(!lika(vv, Number(s), 1e-6)) fel('exempelledet "' + led + '" visas som "' + syns.replace(/\\s+/g, ' ').trim() + '" = ' + vv + ', facit ' + s);
  }
  function brott(dok, g, r, vad){ ut.brott.push(dok + ' · ' + g + ' · ' + r + ': ' + vad); }
  var ORD = { 'ett':1,'en':1,'två':2,'tre':3,'fyra':4,'fem':5,'sex':6,'sju':7,'åtta':8,'nio':9,'tio':10,'elva':11,'tolv':12,'tretton':13,'fjorton':14,'femton':15,'sexton':16,'sjutton':17,'arton':18,'nitton':19,'tjugo':20 };
  var PLATS = { 'tusental':1000,'hundratal':100,'tiotal':10,'ental':1,'tiondel':0.1,'tiondelar':0.1,'hundradel':0.01,'hundradelar':0.01,'tusendel':0.001,'tusendelar':0.001,'tiotusental':10000,'hundratusental':100000,'heltal':1 };
  function platsNamn(talStr, siffra){
    var s = String(talStr).replace(/\\s/g, ''), p = s.split(','), hel = p[0], dec = p[1] || '';
    var i = hel.indexOf(String(siffra)); var NAMN = ['ental','tiotal','hundratal','tusental','tiotusental','hundratusental'];
    if(i >= 0 && hel.indexOf(String(siffra), i + 1) < 0 && dec.indexOf(String(siffra)) < 0) return NAMN[hel.length - 1 - i];
    var j = dec.indexOf(String(siffra)); if(j >= 0 && hel.indexOf(String(siffra)) < 0 && dec.indexOf(String(siffra), j + 1) < 0) return ['tiondel','hundradel','tusendel','tiotusendel'][j];
    return null;
  }
  function avrunda(v, steg){ return Math.round(v / steg) * steg; }

  function radKoll(dok, rub, r, ri){
    var namn = String.fromCharCode(97 + ri) + ')', t = r.typ, s = r.svar;
    ut.rader++; ut.perTyp[t] = (ut.perTyp[t] || 0) + 1;
    var fel = function(v){ brott(dok, rub, namn + ' ' + (r.vansterText || r.fraga || '').toString().replace(/<[^>]*>/g, '').slice(0, 30), v); };
    if(t === 'enkel' || t === 'prioKedja' || t === 'uppstallning'){
      var v = ev(r.vansterText);
      if(!isFinite(v)){ ut.ejRaknad.push(dok + ' · ' + rub + ' · ' + namn + ' ' + t + ' "' + r.vansterText + '"'); return; }
      var tol = /≈/.test(r.vansterText) ? null : 1e-6;
      if(tol === null){ var steg = /ental/.test(rub) ? 1 : /tv\\u00e5 decimaler/.test(rub) ? 0.01 : /tiondel/.test(rub) ? 0.1 : null;
        if(steg === null){ ut.ejRaknad.push(dok + ' · ' + rub + ' · ' + namn + ' ≈ utan känd avrundning'); return; }
        if(!lika(avrunda(v, steg), Number(s), 1e-6)) fel('avrundat ' + v + ' → ' + avrunda(v, steg) + ', facit ' + s); return; }
      if(!lika(v, Number(s), 1e-6)) fel('uttrycket ger ' + v + ', facit ' + s);
      if(t === 'prioKedja' && !lika(ev(r.led), Number(s), 1e-6)) fel('exempelledet "' + r.led + '" ger ' + ev(r.led) + ', facit ' + s);
      if(t === 'prioKedja') visatLed(r.led, s, fel);
      return;
    }
    if(t === 'mellan' || t === 'overslag'){
      var v2 = ev(r.vansterText), alt = String(r.mellan).split('|').map(ev);
      if(t === 'mellan' && !lika(v2, Number(s), 1e-6)) fel('uttrycket ger ' + v2 + ', facit ' + s);
      alt.forEach(function(a, k){ if(!lika(a, Number(s), 1e-6)) fel('mellanled ' + (k + 1) + ' ger ' + a + ', facit ' + s); });
      if(t === 'overslag'){ var d = Math.abs(v2 - Number(s)) / Math.abs(Number(s)); if(!(d <= 0.25)) fel('överslaget ' + s + ' ligger ' + Math.round(d * 100) + ' % från exakta ' + v2); }
      return;
    }
    if(t === 'brakText'){
      var bv = (Number(r.heltal) || 0) + Number(r.taljare) / Number(r.namnare);
      var mal = /tv\\u00e5 decimaler/.test(rub) ? Math.round(bv * 100) / 100 : bv;
      (r.accept || [r.svar]).forEach(function(a){ if(!lika(tal(a), mal, 1e-9)) fel('godkänt "' + a + '" ≠ ' + mal + (mal !== bv ? ' (avrundat)' : '')); });
      return;
    }
    if(t === 'brakSvarB'){
      (r.accept || [r.svar]).forEach(function(a){ var p = String(a).split('/'); if(!lika(Number(p[0]) / Number(p[1]), tal(r.fraga), 1e-9)) fel('bråket ' + a + ' ≠ ' + r.fraga); });
      return;
    }
    if(t === 'uttryck'){ (r.accept || [r.svar]).forEach(function(a){ if(!lika(ev(a), tal(r.fraga), 1e-9)) fel('utvecklad form "' + a + '" ger ' + ev(a) + ', talet är ' + r.fraga); }); return; }
    if(t === 'ordningsfoljd'){ var sort = r.tal.slice().sort(function(a, b){ return tal(a) - tal(b); }); if(sort.join('|') !== r.ordning.join('|')) fel('ordningen ' + r.ordning.join(' < ') + ' ≠ sorterat ' + sort.join(' < ')); return; }
    if(t === 'foljd'){ var g = r.givna.map(tal), dd = g[1] - g[0]; if(!lika(g[2] - g[1], dd, 1e-9)) { fel('givna talen har inget konstant steg'); return; }
      r.nasta.forEach(function(n, k){ if(!lika(tal(n), g[2] + dd * (k + 1), 1e-9)) fel('nästa ' + (k + 1) + ' = ' + n + ', väntat ' + (g[2] + dd * (k + 1))); }); return; }
    if(t === 'val'){ var m = rub.match(/n\\u00e4rmast ([\\d,]+)/); if(!m){ ut.ejRaknad.push(dok + ' · ' + rub + ' · val utan mål'); return; }
      var malv = tal(m[1]), bast = r.alternativ.slice().sort(function(a, b){ return Math.abs(tal(a) - malv) - Math.abs(tal(b) - malv); });
      if(Math.abs(tal(bast[0]) - malv) === Math.abs(tal(bast[1]) - malv)) fel('två alternativ ligger lika nära ' + m[1]);
      if(bast[0] !== r.svar) fel('närmast ' + m[1] + ' är ' + bast[0] + ', facit ' + r.svar); return; }
    if(t === 'flerval'){
      var prim = function(n){ if(n < 2) return false; for(var q = 2; q * q <= n; q++) if(n % q === 0) return false; return true; };
      var dm = rub.match(/delbara med (\\d+)/), villkor = dm ? function(n){ return n % Number(dm[1]) === 0; }
        : /primtal/.test(rub) ? prim : /sammansatta/.test(rub) ? function(n){ return n > 1 && !prim(n); } : null;
      if(!villkor){ ut.ejRaknad.push(dok + ' · ' + rub + ' · flerval utan känt villkor'); return; }
      var ratt = r.tal.filter(villkor).sort(function(a, b){ return a - b; }), facit = r.ratt.slice().sort(function(a, b){ return a - b; });
      if(ratt.join(',') !== facit.join(',')) fel('rätta enligt villkoret: ' + ratt.join(',') + ' · facit: ' + facit.join(','));
      return;
    }
    if(t === 'faktor' || t === 'forklara' || t === 'intervallEn'){
      if(t === 'intervallEn' && !(r.min < r.max)) fel('intervallet är tomt'); return;   // villkorsrättade: inget facit att räkna
    }
    if(t === 'problem'){
      if(!r.exakt){ ut.ejRaknad.push(dok + ' · ' + rub + ' · ' + namn + ' lästal utan exakt-fält'); return; }
      var ex = ev(r.exakt);
      /* FÄLTET MOT TEXTEN: varje tal i exakt-uttrycket ska stå i frågan. Annars kan fältet glida isär
         från uppgiften (texten säger 138, fältet 139) och grinden räknar på fel uppgift. "60 cm" i
         frågan och 0.6 m i fältet räknas som samma tal (enhetsbyte via faktor 10/100/1000). */
      var fragaTxt = String(r.fraga).replace(/<[^>]*>/g, ' ');
      var fragaTal = (fragaTxt.replace(/(\\d) (?=\\d{3}(?!\\d))/g, '$1').match(/\\d+(?:,\\d+)?/g) || []).map(tal);
      // Tal i ORD räknas också: "Fem kompisar" → 5, "två tiondelar" → 0,2 (räkneord + platsvärde).
      var ordLista = fragaTxt.toLowerCase().split(/[^a-zåäö]+/);
      ordLista.forEach(function(w, k){ if(ORD[w] === undefined) return; fragaTal.push(ORD[w]);
        var nasta = ordLista[k + 1]; if(nasta && PLATS[nasta] !== undefined) fragaTal.push(ORD[w] * PLATS[nasta]); });
      (String(r.exakt).match(/\\d+(?:\\.\\d+)?/g) || []).map(Number).forEach(function(x){
        var finns = fragaTal.some(function(y){ return [1, 10, 100, 1000].some(function(k){ return lika(x, y, 1e-9) || lika(x * k, y, 1e-9) || lika(x, y * k, 1e-9); }); });
        if(!finns) fel('talet ' + x + ' i exakt-fältet står inte i frågan');
      });
      if(r.overslag){
        var ov = ev(r.overslag), avst = Math.abs(ex - ov) / Math.abs(ov);
        if(!lika(ov, Number(s), 1e-6)) fel('överslaget ' + r.overslag + ' = ' + ov + ', facit ' + s);
        if(!(avst > 0)) fel('exakt = överslag (' + ex + ') — uppgiften lär inget om överslag');
        if(avst > 0.10) fel('exakt ' + ex + ' ligger ' + Math.round(avst * 1000) / 10 + ' % från överslaget ' + ov + ' (tak 10 %)');
      } else if(!lika(ex, Number(s), 1e-6)) fel('exakt ' + r.exakt + ' = ' + ex + ', facit ' + s);
      if(r.led && !lika(ev(r.led), Number(s), 1e-6)) fel('exempelledet "' + r.led + '" ger ' + ev(r.led) + ', facit ' + s);
      if(r.led) visatLed(r.led, s, fel);
      return;
    }
    if(t === 'fragaText'){
      var f = String(r.fraga).replace(/<[^>]*>/g, ''), sv = String(s), m2;
      var acc = (r.accept || [sv]);
      var koll = function(vantat){ if(!acc.some(function(a){ return String(a).replace(/\\s/g, '').toLowerCase() === String(vantat).replace(/\\s/g, '').toLowerCase(); })) fel('väntat "' + vantat + '", godkända: ' + acc.join(' | ')); };
      if(/platsv\\u00e4rde har siffran (\\d)/.test(rub)){ var pn = platsNamn(f, rub.match(/siffran (\\d)/)[1]); if(!pn){ ut.ejRaknad.push(dok + ' · ' + rub + ' · ' + f); return; } koll(pn); return; }
      if((m2 = f.match(/^(\\d+|[a-zåäö]+) (tiotal|hundratal|tiondelar|hundradelar) (större|mindre) än ([\\d ,]+)$/))){
        var antal = ORD[m2[1]] || Number(m2[1]); var vv = tal(m2[4]) + (m2[3] === 'större' ? 1 : -1) * antal * PLATS[m2[2]];
        koll(String(Math.round(vv * 1000) / 1000).replace('.', ',')); return; }
      if(/Skriv talet som \\u00e4r en (tiondel|hundradel) st\\u00f6rre \\u00e4n/.test(rub)){ var st = /tiondel/.test(rub) ? 0.1 : 0.01; var v3 = Math.round((tal(f) + st) * 1000) / 1000;
        if(!acc.some(function(a){ return lika(tal(a), v3, 1e-9); })) fel('väntat ' + v3); return; }
      if(/Vilket tal \\u00e4r st\\u00f6rst/.test(rub) && (m2 = f.match(/^([\\d,]+) eller ([\\d,]+)$/))){ koll(tal(m2[1]) > tal(m2[2]) ? m2[1] : m2[2]); return; }
      if(/Avrunda/.test(rub) && PLATS[f] !== undefined){ var m3 = rub.match(/Avrunda ([\\d ,]+) till/); if(!m3){ ut.ejRaknad.push(dok + ' · ' + rub); return; }
        var av = Math.round(Math.round(tal(m3[1]) / PLATS[f]) * PLATS[f] * 1000) / 1000;
        if(!acc.some(function(a){ return lika(tal(a), av, 1e-9); })) fel('avrundat till ' + f + ' = ' + av + ', facit ' + sv); return; }
      if(/Skriv talen med siffror/.test(rub)){ var summa = 0, ok = true;
        f.replace(/ och /g, ', ').split(', ').forEach(function(del){ var mm = del.trim().match(/^(\\d+) ([a-zåäö]+)$/); if(!mm || PLATS[mm[2]] === undefined){ ok = false; return; } summa += Number(mm[1]) * PLATS[mm[2]]; });
        if(!ok){ ut.ejRaknad.push(dok + ' · ' + rub + ' · ' + f); return; }
        if(!acc.some(function(a){ return lika(tal(a), Math.round(summa * 1000) / 1000, 1e-9); })) fel('talet är ' + summa); return; }
      if(/Anv\\u00e4nd siffrorna ([\\d, och]+)/.test(rub)){ var sif = rub.match(/siffrorna ([\\d, och]+)/)[1].match(/\\d/g).map(Number), up = sif.slice().sort(), ned = sif.slice().sort().reverse();
        var perm = []; (function p(a, b){ if(!a.length){ perm.push(Number(b.join(''))); return; } a.forEach(function(x, i){ p(a.slice(0, i).concat(a.slice(i + 1)), b.concat(x)); }); })(sif, []);
        var vant = /st\\u00f6rsta udda/.test(f) ? Math.max.apply(null, perm.filter(function(n){ return n % 2; })) : /minsta j\\u00e4mna/.test(f) ? Math.min.apply(null, perm.filter(function(n){ return n % 2 === 0; }))
          : /st\\u00f6rsta/.test(f) ? Number(ned.join('')) : /minsta/.test(f) ? Number(up.join('')) : null;
        if(vant === null){ ut.ejRaknad.push(dok + ' · ' + rub + ' · ' + f); return; } koll(String(vant)); return; }
      ut.ejRaknad.push(dok + ' · ' + rub + ' · fragaText "' + f + '"'); return;
    }
    ut.ejRaknad.push(dok + ' · ' + rub + ' · okänd radtyp ' + t);
  }
  var D = window.PLUGG_DOKUMENT || {};
  if(SABBA){ D.storasma.grupper[0].rader[0].svar = 2900; ut.sabba = 'ändrade 40 · 70 = 2800 till facit 2900 i minnet'; }
  Object.keys(D).forEach(function(id){ D[id].grupper.forEach(function(g){ g.rader.forEach(function(r, ri){ radKoll(id, g.rubrik, r, ri); }); }); });
  if(window.PLUGG_FAKTORISERA) PLUGG_FAKTORISERA.grupper.forEach(function(g){ g.rader.forEach(function(r, ri){ radKoll('faktorisera', g.rubrik, r, ri); }); });
  (window.TALLINJE_AVLASNING || []).forEach(function(u){ u.mark.forEach(function(m){ ut.rader++; if(m.varde < u.cfg.start || m.varde > u.cfg.slut) brott('tallinjer', u.nr + '', m.bok, 'markeringen ' + m.varde + ' ligger utanför linjen'); }); });
  (window.TALLINJE_UPPSKATTNING || []).forEach(function(u){ u.mark.forEach(function(m){ ut.rader++; if(u.alternativ.indexOf(m.svar) < 0) brott('tallinjer', u.nr + '', m.bok, 'svaret ' + m.svar + ' finns inte bland alternativen'); if(!lika(tal(m.svar), m.varde, 1e-9)) brott('tallinjer', u.nr + '', m.bok, 'svaret ' + m.svar + ' ≠ markeringen ' + m.varde); }); });
  return ut;
})()`;

const TMP = path.join(os.tmpdir(), 'facitgrind-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);
let fel = 0;
console.log('FACIT-GRIND — facit räknat ur uppgiften (regel 11)' + (SABBA ? '  [SABBA]' : '') + '\n');
OMFANG.forEach(sida => {
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP, '--vanta-pa', 'laddad', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null; try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ fel++; console.log('✗ ' + sida + ': inget svar'); return; }
  if(u.sabba) console.log('   SABBA: ' + u.sabba);
  u.brott.forEach(b => console.log('✗ ' + b));
  u.ejRaknad.forEach(b => console.log('✗ EJ RÄKNAD (en rad grinden inte förstår är ett brott): ' + b));
  fel += u.brott.length + u.ejRaknad.length;
  if(!u.rader){ fel++; console.log('✗ ' + sida + ': inga rader mätta'); }
  console.log((u.brott.length + u.ejRaknad.length ? '✗ ' : '✓ ') + sida.replace(/\/index\.html$/, '') + ' · ' + u.rader + ' rader räknade · '
    + Object.keys(u.perTyp).map(k => k + ' ' + u.perTyp[k]).join(', '));
});
try { fs.unlinkSync(TMP); } catch(e){}
console.log('\n' + (fel ? '✗ FACIT-GRIND RÖD (' + fel + ')' : '✓ FACIT-GRIND GRÖN'));
process.exit(fel ? 1 : 0);
