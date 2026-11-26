/* niva-las-upp.js — DELAD PROV-SNUTT: lås upp bladets nivåsteg innan grinden mäter.
 *
 * SKÄLET. Nivå 3 och uppåt är villkorade (nivå 1 och 2 alltid öppna, lås först från 3), så med
 * tom lagring kommer en grind som bara klickar aldrig till steg 3 — och ett låst steg är ett
 * omätt blad. Grinden ska inte mäta med ?dev=1, för då mäter den inte elevens sida; den ska
 * STÄLLA IN omgivningen och sedan mäta den (V-regeln: mät aldrig något som beror på vem som kör).
 *
 * NYCKELN GISSAS INTE. Den är NivaRad:s egen, <prefix>_naddNiva<n>_<bladId>, och prefixet står på
 * bladet i data-niva-prefix — skrivet av kärnan när raden ritas. Ändras nyckelformen i nivarad.js
 * måste den här snutten följa med, annars dör mätningen tyst.
 *
 * RADEN LÄSER TILLSTÅNDET NÄR DEN RITAS, inte när nyckeln skrivs, så bladet byggs om med ett klick
 * på steg 1 efteråt.
 *
 * ANVÄNDS SÅ (i en grinds probe-sträng):
 *     const LAS_UPP = require('./niva-las-upp').snutt;
 *     const PROBE = `(function(){ ${LAS_UPP} ... })()`;
 *
 * Ingen nätväg. Inget skrivs utanför webbläsarens egen lagring i provet.
 */
'use strict';

const snutt = `
  document.querySelectorAll('[data-nivaer][data-niva-prefix]').forEach(function(ark){
    var antal = parseInt(ark.getAttribute('data-nivaer'), 10) || 1;
    var prefix = ark.getAttribute('data-niva-prefix');
    var vard = ark.closest('[id^="sheet-"]') || ark;
    var bid = String(vard.id || '').replace('sheet-', '');
    for(var _n = 2; _n <= antal; _n++){
      try { localStorage.setItem(prefix + '_naddNiva' + _n + '_' + bid, '1'); } catch(e){}
    }
    var _ett = ark.querySelector('.niva-rad .niva-btn');
    if(_ett) _ett.click();
  });
`;

/* NIVÅVARVET (2026-10-10, arbetsorder v2 k2 "Räkna med former"): upplåsningen ovan gör stegen NÅBARA,
 * men en grind som bara klickar flikarna mäter ändå bara det aktiva steget. Fem grindar (brytning,
 * keypad, kontroll-svep, flerruts, yt-kontrakt) mätte därför nivå 1 och aldrig nivå 2 och 3 på blad med
 * egen nivårad (sjuans k2-kopior ritar raden själva, utan data-nivaer). EN stegning för alla:
 *
 *     const STEG = require('./niva-las-upp').stegSnutt;
 *     ... ${STEG} ... mat(namn); nivaVarv(mount, function(niva){ mat(namn + ' nivå ' + niva); });
 *
 * Knapparna frågas om per varv (bladet byggs om vid klick, en hållen knapp är ett löst element). Låsta
 * steg hoppas över — upplåsningen ovan ska ha öppnat dem; ett steg som ändå är låst syns som ett omätt
 * steg i grindens räkning. Efteråt klickas steg 1, så nästa flik börjar där eleven börjar. */
const stegSnutt = `
  function nivaVarv(mount, fn){
    var antal = (mount && mount.querySelectorAll('.niva-rad .niva-btn').length) || 0;
    for(var _s = 1; _s < antal; _s++){
      var _nb = mount.querySelectorAll('.niva-rad .niva-btn')[_s];
      if(!_nb || _nb.disabled || _nb.classList.contains('is-locked')) continue;
      _nb.click(); fn(_s + 1);
    }
    var _forsta = antal > 1 && mount.querySelector('.niva-rad .niva-btn');
    if(_forsta) _forsta.click();
  }
`;

/* NYTT BLAD (2026-11-10, arbetsorder v3 k2 d2): grindarna mätte bara det FÖRSTA bladet per steg — med tom
 * lagring bygger varje blad sitt grundblad, och "Nytt blad med andra tal" trycktes aldrig. Ett fel som bara
 * finns i Nytt blad-vägen (rubriken "(nytt blad)" i d3, variant B i k1 d5–d7) gick därför igenom. EN snutt
 * för alla grindar:
 *
 *     const NYTT = require('./niva-las-upp').nyttSnutt;
 *     ... ${NYTT} ... mat(namn); nyttVarv(mount, function(i){ mat(namn + ' nytt ' + i); });
 *
 * nyttVarv trycker på bladets SYNLIGA Nytt blad-knapp (kärnornas data-action="nytt-blad", kvrot:s data-nytt)
 * K gånger och anropar fn efter varje tryck. Knappen letas upp på nytt per varv — bladet byggs om vid klick.
 * Saknar bladet knappen händer ingenting (returnerar 0). nyttKlick trycker en gång (för grindar med jobblista).
 * K = 3 (Joachim 2026-11-10). */
const NYTT_K = 3;
const nyttSnutt = `
  function nyttKnapp(mount){
    var m = mount || document;
    return Array.prototype.filter.call(m.querySelectorAll('[data-action="nytt-blad"], [data-nytt]'), function(b){
      return !!b.offsetParent && !b.disabled; })[0] || null;
  }
  function nyttKlick(mount){ var b = nyttKnapp(mount); if(!b) return false; b.click(); return true; }
  function nyttVarv(mount, fn, k){
    k = k || ${NYTT_K};
    for(var _i = 1; _i <= k; _i++){
      if(!nyttKlick(mount)) return _i - 1;
      fn(_i);
    }
    return k;
  }
`;

/* SIDORNA I NYTT FORMAT (Joachim 2026-11-25): momentsidan, uppgiftssidan (alla moment, blad, varianter och test) och
 * drillsidan. Deras steg är inte flikar på EN sida utan ADRESSER (?moment=&blad=, ?typ=&blad=, ?test=, ?blandade=,
 * drill.html?bank=), och spärren (NivaRad) skickar ett låst blad till momentsidan. En grind som bara öppnade
 * Sidor.alla() mätte därför uppgiftssidans förvalda blad och inget annat. EN upptäckare för alla grindar:
 *
 *     const NY = require('./niva-las-upp');
 *     NY.jobb(Sidor.alla(), VY, args).forEach(j => {          // gamla sidor som förut + nytt format × NY_VYER
 *       url = fileUrl(path.join(ROOT, j.fil)) + j.fraga;  vy = j.vy;  pre = PRE + (j.ny ? NY.nyPre : '');
 *       ... j.sida är namnet i utskriften och i V14 (matpunkt) ...
 *     });
 *
 * UPPTÄCKTEN GÅR ELEVENS VÄG, i webbläsaren: momentsidan öppnas med spärren upplåst, varje rad i vänsterspalten
 * klickas (momenten, Test, d5:s nivåer och blandade) och varje länk till uppgiftssidan samlas; drillens banker är
 * lövens bank-id, fångade där sidan lämnar dem till skalet (Momentsida.metodtraning). Ett nytt moment, blad, test
 * eller löv mäts alltså utan att någon lista här ändras. Varianterna (Blad A/B) är flikar i växeln på uppgiftssidan
 * och stegas av grindarnas egen flikstegning (.blad-nav-btn), inte som egna adresser.
 *
 * VYERNA: 1366 × 768 och 1536 × 864 (KONVENTIONER, uppgiftssidan). Gamla sidor mäts i grindens egen vy som förut.
 * --nyformat: bara sidorna i nytt format. Ingen nätväg (file://). */
const NY_VYER = ['1366x768', '1536x864'];
/* Spärren upplåst med NivaRad:s egna nycklar (<prefix>_naddNiva<n>_<id>) för varje moment på sidan, skrivna när
   NivaRad sätts — bladfilerna är då redan laddade, och sidans spärr har inte läst nycklarna än. Drillens banker
   fångas ur Momentsida.metodtraning. */
const nyPre = `
(function(){
  function lasUpp(){ Object.keys(window).forEach(function(k){
    var M = /^BLAD_/.test(k) && window[k] && window[k].MOMENT; if(!M || !M.nivaPrefix) return;
    for(var n = 2; n <= M.blad.length; n++) try { localStorage.setItem(M.nivaPrefix + '_naddNiva' + n + '_' + M.nivaId, '1'); } catch(e){} }); }
  var nr; Object.defineProperty(window, 'NivaRad', { configurable: true, get: function(){ return nr; }, set: function(x){ nr = x; lasUpp(); } });
  var ms; Object.defineProperty(window, 'Momentsida', { configurable: true, get: function(){ return ms; }, set: function(x){
    ms = x;
    if(x && x.metodtraning){ var o = x.metodtraning; x.metodtraning = function(scen, d){
      try { ((d && d.kategorier) || []).forEach(function(k){ (k.lov || []).forEach(function(l){
        if(l.bank) (window.__nfBanker = window.__nfBanker || []).push(l.bank); }); }); } catch(e){}
      return o.apply(this, arguments); }; }
  } });
})();
`;
const UPPTACK = `(async function(){
  var v = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  await v(2200);
  var lankar = {};
  function samla(){ Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function(a){
    var h = a.getAttribute('href'); if(/^uppgift\\.html\\?/.test(h)) lankar[h.replace(/[&?]retur=[^&]*/, '')] = 1; }); }
  samla();
  var rader = Array.prototype.filter.call(document.querySelectorAll('.nr-rad'), function(b){ return !b.disabled && b.getClientRects().length; });
  for(var i = 0; i < rader.length; i++){ rader[i].click(); await v(350); samla(); }
  return { lankar: Object.keys(lankar), banker: window.__nfBanker || [], fel: window.__fel || [] };
})()`;
let _cache = null;
function nyformatSidor(){
  if(_cache) return _cache;
  const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
  const ROOT = path.join(__dirname, '..');
  /* En momentsida i nytt format är en index.html som bygger på skalet (laddar js/motor/arbetsyta/momentsida.js) —
     funktionen, inte namnet. Förr bara <x>-nyformat/index.html; en momentsida utan gammal sida bredvid
     (ak7/k4/d1-procent, 2026-11-26) mättes då inte (V9). */
  const arMomentsida = r => { try { return /js\/motor\/arbetsyta\/momentsida\.js/.test(fs.readFileSync(path.join(ROOT, r), 'utf8')); } catch(e){ return false; } };
  const hitta = d => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).reduce((u, e) => {
    const r = d + '/' + e.name;
    if(e.isDirectory() && !/^(Arkiv|\.)/.test(e.name)) return u.concat(hitta(r));
    if(/\/index\.html$/.test(r) && arMomentsida(r)) u.push(r);
    return u; }, []);
  const tmp = path.join(os.tmpdir(), 'nyformat-' + process.pid);
  fs.writeFileSync(tmp + '-pre.js', nyPre); fs.writeFileSync(tmp + '-upptack.js', UPPTACK);
  const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
  const ut = [], banker = {};
  ['ak7', 'ak8', 'ak9'].filter(a => fs.existsSync(path.join(ROOT, a))).forEach(a => hitta(a).sort().forEach(index => {
    ut.push({ fil: index, fraga: '' });
    let u = null;
    for(let forsok = 0; forsok < 2 && !(u && u.lankar && u.lankar.length); forsok++){   // regel 9: en tappad fil körs om
      const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, index)), tmp + '-upptack.js',
        '--pre', tmp + '-pre.js', '--viewport', NY_VYER[0], '--timeout', '90000'], { encoding: 'utf8', timeout: 150000 });
      try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){ u = null; }
    }
    if(!u || !u.lankar || !u.lankar.length){ ut.push({ fil: index, fraga: '', upptacktFel: 'inga länkar till uppgiftssidan hittades' }); return; }
    const dir = index.replace(/index\.html$/, '');
    u.lankar.sort().forEach(h => ut.push({ fil: dir + 'uppgift.html', fraga: h.slice('uppgift.html'.length) }));
    (u.banker || []).forEach(b => { banker[b] = 1; });
  }));
  Object.keys(banker).sort().forEach(b => ut.push({ fil: 'js/motor/arbetsyta/drill.html', fraga: '?bank=' + encodeURIComponent(b) }));
  try { fs.unlinkSync(tmp + '-pre.js'); fs.unlinkSync(tmp + '-upptack.js'); } catch(e){}
  return (_cache = ut);
}
// Grindens jobb: gamla sidor (utan dem i nytt format) i grindens vy, sedan nytt format × NY_VYER.
function jobb(lista, vy, args){
  const bara = (args || []).includes('--nyformat'), ny = /-nyformat\/|js\/motor\/arbetsyta\/drill\.html/;
  // Momentsidornas kataloger (också de utan -nyformat i namnet): deras sidor mäts bara som nytt format, inte två gånger.
  const nyDir = nyformatSidor().filter(s => /index\.html$/.test(s.fil) && !s.fraga).map(s => s.fil.replace(/index\.html$/, ''));
  const arNy = s => ny.test(s) || nyDir.some(d => s.indexOf(d) === 0);
  const ut = bara ? [] : lista.filter(s => !arNy(s)).map(s => ({ sida: s, fil: s, fraga: '', vy: vy, ny: false }));
  nyformatSidor().forEach(s => NY_VYER.forEach(v => ut.push({ sida: s.fil + s.fraga + ' @' + v, fil: s.fil, fraga: s.fraga, vy: v, ny: true,
    upptacktFel: s.upptacktFel })));
  return ut;
}

module.exports = { snutt: snutt, stegSnutt: stegSnutt, nyttSnutt: nyttSnutt, NYTT_K: NYTT_K,
                   NY_VYER: NY_VYER, nyPre: nyPre, nyformatSidor: nyformatSidor, jobb: jobb };

if(require.main === module) nyformatSidor().forEach(s => console.log(s.fil + s.fraga + (s.upptacktFel ? '  ✗ ' + s.upptacktFel : '')));
