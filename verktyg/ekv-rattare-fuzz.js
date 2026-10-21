/* ekv-rattare-fuzz.js — DIFFERENTIELL FUZZ för flytten av balansmetodens rättare (order 2026-10-21).

   Påståendet: kedjerättaren flyttades till ekv-rattare.js och fick tre regler som gäller sjuan också —
   UPPREPNING, VÄNDNING och BOKSTAV — och det är de ENDA skillnaderna mot förut (Joachims villkor).
   Gröna svep visar bara att inget SYNS ha gått sönder. Här körs den gamla och den nya rättaren på
   samma indata, och varje skillnad måste förklaras EXAKT av en av de tre reglerna.

   BENEN
     DOM    sjuans tre blad renderas byte för byte som i e6a9554 (fäst md5 av bladens DOM).
     D4     sjuans riktiga sida i headless Chromium. Den GAMLA kontrolleraUppg och kontrollera,
            ordagrant ur e6a9554, mot den NYA (sidans Kontrollera-knapp), på 32 000 slumpade kedjor
            över sjuans 18 uppgifter. Raderna fylls som eleven fyller dem, staplade bråk som segment.
            En skillnad godtas bara om den är precis vad regeln säger:
              upprepning  raden j upprepar raden före (egen termjämförelse, inte rättarens): raderna
                          före j som förut, rad j ✗, raderna efter orörda, beskedet om upprepning
              bokstav     raden j har en annan bokstav än uppgiftens: samma form, beskedet om bokstav
              vändning    ingen regelträff, men vändningarna räknas inte: förut löst, nu för få rader —
                          och (rader − vändningar) < kravet ≤ rader
            Varje kategori måste ha slagit till (annars är provet blint för den), och ingen ny dom får
            vara mildare än den gamla.
     PROB   problemlösningens provaKedja: den gamla ordagrant ur e6a9554 mot den nya, 32 000 kedjor.
            Enda tillåtna skillnad: upprepningen.

   Deterministisk slump. Noll nätväg (bara localhost-CDP). Ingen källfil ändras. Exit 1 vid brott.
     node verktyg/ekv-rattare-fuzz.js [--n 32000] [--hoppa-d4] */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const nI = process.argv.indexOf('--n'), N = nI >= 0 ? parseInt(process.argv[nI + 1], 10) : 32000;
let brott = 0;
function fall(ben, text){ brott++; console.log('  ✗ ' + ben + ': ' + text); }

// ── EGEN TERMNYCKEL (oberoende av EkvParser.termNyckel — den är det som prövas) ───────────────────
function egenNyckel(sida){
  const s = String(sida).replace(/\[([^\[\]|]*)\|([^\[\]|]*)\]/g, '($1)/($2)').replace(/\s+/g, '')
    .replace(/[−–—]/g, '-').replace(/[·×]/g, '*').replace(/(\d),(\d)/g, '$1.$2').toLowerCase();
  const delar = []; let djup = 0, start = 0;
  for(let i = 0; i < s.length; i++){
    if(s[i] === '(') djup++; else if(s[i] === ')') djup--;
    else if(djup === 0 && i > start && (s[i] === '+' || s[i] === '-') && s[i - 1] !== '*' && s[i - 1] !== '/'){ delar.push(s.slice(start, i)); start = i; }
  }
  delar.push(s.slice(start));
  return delar.filter(d => d && d !== '+' && d !== '-').map(d => d.replace(/^\+/, '').replace(/^(-?)1(?=[a-zåäö(])/, '$1')).sort().join('|');
}
const EGEN_NYCKEL_SRC = egenNyckel.toString();

// ══ BENET PROB (node) ══════════════════════════════════════════════════════════════════════════
(function(){
  const EP = require(path.join(ROOT, 'js/motor/ekvationer-balans/ekv-parser.js'));
  const R = require(path.join(ROOT, 'js/motor/problemlosning/prob-rattare.js'));
  const BESKED = R.BESKED;
  function tom(v){ return v == null || String(v).trim() === ''; }
  function parOpts(u){ return { variabel: (u.variabel || 'x') }; }
  // GAMLA provaKedja, ordagrant ur e6a9554 (prob-rattare.js).
  function provaKedjaGammal(u, rader){
    var opts = parOpts(u);
    var ifyllda = rader.filter(function(r){ return r && !tom(r.vl) && !tom(r.hl); });
    var forra = EP.parseEkvation(ifyllda[0].vl, ifyllda[0].hl, opts);
    for(var i = 1; i < ifyllda.length; i++){
      var e = EP.parseEkvation(ifyllda[i].vl, ifyllda[i].hl, opts);
      if(!e) return { steg: 'balans', rad: i + 1, besked: BESKED.radOlaslig.hint };
      if(!EP.sammaLosning(forra, e)) return { steg: 'balans', rad: i + 1, besked: BESKED.radFoljerEj.hint };
      forra = e;
    }
    var sista = ifyllda[ifyllda.length - 1];
    if(!EP.arLost(sista.vl, sista.hl, opts)) return { steg: 'balans', rad: ifyllda.length, besked: BESKED.ejLost.hint };
    var minst = EP.minstaAntalRader(ifyllda[0].vl, ifyllda[0].hl, opts);
    if(minst != null && ifyllda.length < minst)
      return { steg: 'balans', rad: ifyllda.length, kravRader: minst, besked: BESKED.forFaRader.hint };
    return { losning: EP.losningAv(forra) };
  }
  let fro = 20261022;
  const slump = () => { fro = (fro * 1103515245 + 12345) & 0x7fffffff; return fro / 0x7fffffff; };
  const heltal = (a, b) => a + Math.floor(slump() * (b - a + 1));
  const tal = q => Number.isInteger(q) ? String(q) : String(Math.round(q * 1000) / 1000);
  function ekv(v, s){                       // en slumpad ekvation med lösningen s, slumpad termordning
    let a = heltal(-6, 9), c = heltal(-4, 5); if(a === c) a++;
    const b = heltal(-20, 20), d = b + (a - c) * s;
    const xt = k => k === 0 ? null : (k === 1 ? v : k === -1 ? '-' + v : k + v);
    const led = (k, m) => { const t = [xt(k), m === 0 ? null : tal(m)].filter(Boolean); if(!t.length) return '0'; if(slump() < 0.5) t.reverse(); return t.join('+').replace(/\+-/g, '-'); };
    return { vl: led(a, b), hl: led(c, d) };
  }
  let olika = 0, upp = 0, lika = 0; const ex = [];
  for(let n = 0; n < N; n++){
    const v = slump() < 0.85 ? 'x' : 'y', s = heltal(-12, 30), u = { variabel: v };
    const rader = [ekv(v, s)], langd = heltal(1, 7);
    for(let i = 0; i < langd; i++){
      const r = slump(), forra = rader[rader.length - 1];
      if(r < 0.15) rader.push({ vl: forra.vl, hl: forra.hl });                                    // upprepning
      else if(r < 0.2) rader.push({ vl: forra.vl.split('+').reverse().join('+'), hl: forra.hl }); // omkastad
      else if(r < 0.27) rader.push({ vl: forra.hl, hl: forra.vl });                               // vändning
      else if(r < 0.33) rader.push(ekv(v, s + heltal(1, 3)));                                     // fel rad
      else if(r < 0.37) rader.push({ vl: '', hl: '' });                                           // tom
      else rader.push(ekv(v, s));
    }
    if(slump() < 0.6) rader.push({ vl: v, hl: tal(s) });
    const gammal = provaKedjaGammal(u, rader), ny = R.provaKedja(u, rader);
    // Förväntat: som förut — utom vid första upprepningen, om den gamla nådde dit.
    const ifyllda = rader.filter(r => !tom(r.vl) && !tom(r.hl));
    let j = -1;
    for(let i = 1; i < ifyllda.length; i++){ if(egenNyckel(ifyllda[i].vl) === egenNyckel(ifyllda[i - 1].vl) && egenNyckel(ifyllda[i].hl) === egenNyckel(ifyllda[i - 1].hl)){ j = i; break; } }
    const gammalBrott = gammal.rad != null && gammal.besked !== BESKED.ejLost.hint && gammal.besked !== BESKED.forFaRader.hint ? gammal.rad - 1 : Infinity;
    const vant = (j >= 0 && j < gammalBrott) ? { steg: 'balans', rad: j + 1, besked: BESKED.upprepning.hint } : gammal;
    if(JSON.stringify(ny) === JSON.stringify(vant)){ if(vant === gammal) lika++; else upp++; }
    else { olika++; if(ex.length < 6) ex.push(JSON.stringify(rader) + '\n        gammal ' + JSON.stringify(gammal) + '\n        ny     ' + JSON.stringify(ny) + '\n        väntat ' + JSON.stringify(vant)); }
  }
  console.log('PROB    ' + (olika || !upp ? '✗' : '✓') + ' ' + N + ' kedjor: som förut ' + lika + ' · upprepning fälld ' + upp + ' · oförklarade skillnader ' + olika);
  ex.forEach(e => console.log('      ' + e));
  if(olika) fall('PROB', olika + ' kedjor skiljer sig utan att upprepningen förklarar det');
  if(!upp) fall('PROB', 'upprepningsregeln slog aldrig till — provet är blint');
})();

// ══ BENEN DOM och D4 (headless Chromium) ═══════════════════════════════════════════════════════
const DOM_MD5 = { steg1: 'b1f581f602648f4f369218a661823624', steg2: '780a732bdb6ed593e591cdd00f9feb52', steg3: '32eda4ae6e9e04e7101462f45e4271df' };
const PROBE = String.raw`new Promise(function(res){
  var vanta = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  (async function(){
    for(var t = 0; t < 50 && !(window.EkvBlad && window.EkvRattare && window.EkvKedja); t++) await vanta(100);
    var C = window.__FUZZ, ut = { dom: {}, n: 0, lika: 0, upprepning: 0, bokstav: 0, vandning: 0, olika: 0, mildare: 0, ex: [], regelTraffGammalLost: 0 };
    ['steg1', 'steg2', 'steg3'].forEach(function(id){ var s = document.getElementById('sheet-' + id); ut.dom[id] = s ? s.innerHTML : null; });

    // ── GAMLA implementationen, ordagrant ur e6a9554 (ekvationer-balans.js r. 95–119 och 190–201).
    //    Enda ändringen: namnen (…Gammal), så att den inte krockar med den nya.
    function kontrolleraUppgGammal(upp){
      var forra = upp.startEkv, allaOk = true, nadde = false, hade = false, antal = 1;
      for(var i = 0; i < upp.rader.length; i++){
        var rad = upp.rader[i], vl = lasSida(rad.vlSida), hl = lasSida(rad.hlSida);
        rensaFarg(rad);
        if(vl === '' && hl === '') continue;
        hade = true; antal++;
        var e = parseEkvation(vl, hl);
        if(!e || !sammaLosning(forra, e)){ K.markera(rad, false); allaOk = false; break; }
        K.markera(rad, true);
        forra = e;
        if(harUnikLosning(e) && arLost(vl, hl)) nadde = true;
      }
      // Kravet på antal rader: läget avgör (utskrivet = två rader per operation).
      var krav = _EP ? _EP.minstaAntalRader(upp.vl, upp.hl, { lage: LAGE }) : null;
      var forFa = nadde && krav != null && antal < krav;
      if(forFa){
        var sistRad = upp.rader.filter(function(r){ return lasSida(r.vlSida) !== '' || lasSida(r.hlSida) !== ''; }).pop();
        if(sistRad) K.markera(sistRad, false);
      }
      var klar = allaOk && nadde && !forFa;
      upp.klarEl.classList.toggle('show', klar);
      upp.forFaEl.classList.toggle('show', !!forFa);
      return { ok: allaOk && !forFa, klar: klar, hade: hade, forFa: forFa, krav: krav };
    }
    function kontrolleraGammal(steg, hintEl){
      var mina = uppgifter.filter(function(u){ return u.steg === steg.id; });
      var klar = 0, fel = 0, forFa = 0;
      mina.forEach(function(u){
        var r = kontrolleraUppgGammal(u);
        if(r.klar) klar++; else if(r.forFa) forFa++; else if(!r.ok) fel++;
      });
      if(fel){ hintEl.className = 'global-hint fel'; hintEl.textContent = EKV_TEXT.fel.hint; }
      else if(forFa){ hintEl.className = 'global-hint fel'; hintEl.textContent = EKV_TEXT.forFa.hint; }
      else if(klar === mina.length){ hintEl.className = 'global-hint ok'; hintEl.textContent = EKV_TEXT.allaRatt.hint; }
      else { hintEl.className = 'global-hint ok'; hintEl.textContent = EKV_TEXT.pagang.hint; }
    }

    var egenNyckel = ` + EGEN_NYCKEL_SRC + String.raw`;
    var fro = C.fro;
    function slump(){ fro = (fro * 1103515245 + 12345) & 0x7fffffff; return fro / 0x7fffffff; }
    function heltal(a, b){ return a + Math.floor(slump() * (b - a + 1)); }
    function tal(q){ if(Number.isInteger(q)) return String(q).replace('-', '−'); var r = Math.round(q * 1000) / 1000; return String(r).replace('.', ',').replace('-', '−'); }
    function ekv(v, s){
      var a = heltal(-6, 9), c = heltal(-4, 5); if(a === c) a++;
      var b = heltal(-20, 20), d = b + (a - c) * s;
      function xt(k){ return k === 0 ? null : (k === 1 ? v : k === -1 ? '−' + v : tal(k) + v); }
      function led(k, m){ var t = [xt(k), m === 0 ? null : tal(m)].filter(Boolean); if(!t.length) return '0'; if(slump() < 0.5) t.reverse();
        return t.join(' + ').replace(/\+ −/g, '− '); }
      return led(a, b) + ' = ' + led(c, d);
    }
    var BRAK = /\[([^\[\]|]*)\|([^\[\]|]*)\]/;
    function inp(el, v){ el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
    function fyllSida(sida, str){
      var cur = sida.querySelector('.seg-text'), rest = str.trim(), m;
      while((m = rest.match(BRAK))){
        inp(cur, rest.slice(0, m.index).trim());
        var b = EkvKedja.brakVid(cur, {}); inp(b._tIn, m[1]); inp(b._nIn, m[2]);
        cur = b.nextSibling; rest = rest.slice(m.index + m[0].length).trim();
      }
      inp(cur, rest);
    }
    function bild(mount){
      var grid = mount.querySelector('.eq-grid'), vls = grid.querySelectorAll('.eq-vl'), hls = grid.querySelectorAll('.eq-hl'), st = grid.querySelectorAll('.eq-status');
      var rader = [];
      for(var i = 0; i < vls.length; i++){
        var ins = Array.prototype.map.call(vls[i].querySelectorAll('input'), function(x){ return x.className; }).concat(Array.prototype.map.call(hls[i].querySelectorAll('input'), function(x){ return x.className; }));
        rader.push([vls[i].className, hls[i].className, st[i].textContent, st[i].style.color, ins.join(',')].join(' ; '));
      }
      var kl = mount.querySelector('.uppg-klar'), ff = mount.querySelector('.uppg-forfa'), h = mount.querySelector('.global-hint');
      return { rader: rader, status: Array.prototype.map.call(st, function(s){ return s.textContent; }), klar: kl.className, forfa: ff.className + ' | ' + ff.textContent, hint: h.className + ' | ' + h.textContent };
    }
    var ALLA = [];
    EkvBlad.STEG.forEach(function(s){ s.uppg.forEach(function(u){ ALLA.push(u); }); });
    function kor(u, rader, gammal){
      var mount = document.createElement('div'); document.body.appendChild(mount);
      var steg = { id: 'fz' + (gammal ? 'A' : 'B') + ut.n, mount: 'x', titel: 'f', nod: 'prov:ingen', uppg: [u] };
      EkvBlad.renderSteg(mount, steg);
      var grid = mount.querySelector('.eq-grid'), nyB = mount.querySelector('.uppg-verktyg .mini-btn');
      rader.forEach(function(r, i){
        if(i > 0) nyB.click();
        var vl = grid.querySelectorAll('.sida-vl'), hl = grid.querySelectorAll('.sida-hl'), d = r.text.split('=');
        if(r.text !== ''){ fyllSida(vl[vl.length - 1], d[0]); fyllSida(hl[hl.length - 1], d[1]); }
      });
      if(gammal) kontrolleraGammal(steg, mount.querySelector('.global-hint'));
      else mount.querySelector('.actions .btn.primary').click();
      var b = bild(mount);
      mount.remove();
      uppgifter = uppgifter.filter(function(x){ return x.steg !== steg.id; });
      return b;
    }
    var TEXT_UPP = EkvRattare.beskedText('upprepning');
    for(var n = 0; n < C.n; n++){
      ut.n++;
      var u = ALLA[heltal(0, ALLA.length - 1)], v = u.variabel || 'x', annan = v === 'x' ? 'y' : 'x';
      var e0 = EkvParser.parseEkvation(u.vl, u.hl), s = e0.B / e0.A;
      var krav = EkvParser.minstaAntalRader(u.vl, u.hl, { lage: 'utskriven' });
      var forsta = u.vl.replace(/\((\w+)\)\/\((\w+)\)/g, '[$1|$2]').replace(/-/g, '−') + ' = ' + u.hl.replace(/-/g, '−');
      var rader = [], langd = heltal(1, krav + 2), forra = forsta;
      var stil = slump();   // vissa kedjor är byggda för att nå kravet med vändningar
      for(var i = 0; i < langd; i++){
        var r = slump(), text, d = forra.split('=');
        if(stil < 0.18 && r < 0.45) text = d[1].trim() + ' = ' + d[0].trim();                                     // vändning
        else if(r < 0.10) text = forra;                                                                            // upprepning
        else if(r < 0.14 && d[0].indexOf('+') > 0) text = d[0].split(' + ').reverse().join(' + ').trim() + ' = ' + d[1].trim(); // omkastade termer
        else if(r < 0.20) text = d[1].trim() + ' = ' + d[0].trim();                                                // vändning
        else if(r < 0.25) text = ekv(v, s).split(v).join(annan);                                                   // annan bokstav
        else if(r < 0.30) text = ekv(v, s + heltal(1, 3));                                                         // fel rad
        else if(r < 0.33) text = '';                                                                               // tom
        else if(r < 0.37) text = v + ' + = 3';                                                                     // trasig
        else if(r < 0.47 && d[0].indexOf('[') < 0 && d[1].indexOf('[') < 0){ var k = heltal(2, 6); text = '[' + d[0].trim() + '|' + k + '] = [' + d[1].trim() + '|' + k + ']'; }
        else if(r < 0.57){ var m = heltal(1, 9); text = d[0].trim() + ' − ' + m + ' = ' + d[1].trim() + ' − ' + m; }  // operationen utskriven
        else text = ekv(v, s);
        rader.push({ text: text }); if(text !== '') forra = text;
      }
      if(slump() < 0.75) rader.push({ text: slump() < 0.85 ? v + ' = ' + tal(s) : tal(s) + ' = ' + v });

      var A = kor(u, rader, true), B = kor(u, rader, false);
      if(JSON.stringify(A) === JSON.stringify(B)){ ut.lika++; continue; }

      // ── Förklaras skillnaden av en regel? Egen analys av kedjan, inte rättarens.
      var ifyllda = []; rader.forEach(function(r, i){ if(r.text !== '') ifyllda.push(i); });
      var jUpp = -1, jBok = -1, fore = forsta;
      ifyllda.forEach(function(i){
        var t = rader[i].text, a = t.split('='), f = fore.split('=');
        if(jUpp < 0 && egenNyckel(a[0]) === egenNyckel(f[0]) && egenNyckel(a[1]) === egenNyckel(f[1])) jUpp = i;
        if(jBok < 0 && new RegExp('[a-zåäö]', 'i').test(t.toLowerCase().split(v).join(''))) jBok = i;
        fore = t;
      });
      var j = (jUpp >= 0 && (jBok < 0 || jUpp < jBok)) ? jUpp : jBok, regel = j === jUpp && j >= 0 ? 'upprepning' : (j >= 0 ? 'bokstav' : null);
      var forklarad = false;
      var foreJ = function(k){ return A.rader.slice(0, k).join('\n') === B.rader.slice(0, k).join('\n') && A.status.slice(0, k).indexOf('✗') < 0; };
      var sistIfylld = ifyllda.length ? ifyllda[ifyllda.length - 1] : -1;
      if(regel && foreJ(j)){
        var text = regel === 'upprepning' ? TEXT_UPP : EkvRattare.beskedText('bokstav', v);
        var efter = B.status.slice(j + 1).every(function(x, k){ return x === '' || (j + 1 + k === sistIfylld && x === '✗'); });
        forklarad = B.status[j] === '✗' && efter && B.forfa === 'uppg-forfa show | ' + text && B.klar === 'uppg-klar' && B.hint === 'global-hint fel | ' + text;
        if(forklarad){ ut[regel]++; if(A.klar === 'uppg-klar show') ut.regelTraffGammalLost++; }
      } else if(!regel){
        // vändning: förut löst, nu för få rader — och vändningarna förklarar det
        var vand = 0, f2 = forsta, antal = 1;
        ifyllda.forEach(function(i){ var a = rader[i].text.split('='), f = f2.split('=');
          if(egenNyckel(a[0]) === egenNyckel(f[1]) && egenNyckel(a[1]) === egenNyckel(f[0])) vand++; antal++; f2 = rader[i].text; });
        var ovrigaLika = A.rader.slice(0, sistIfylld).join('\n') === B.rader.slice(0, sistIfylld).join('\n');
        forklarad = vand > 0 && A.klar === 'uppg-klar show' && B.klar === 'uppg-klar' && B.status[sistIfylld] === '✗' && ovrigaLika &&
                    (antal - vand) < krav && krav <= antal && B.forfa === 'uppg-forfa show | ' + EKV_TEXT.forFa.hint;
        if(forklarad) ut.vandning++;
      }
      if(B.klar === 'uppg-klar show' && A.klar !== 'uppg-klar show') ut.mildare++;
      if(!forklarad){ ut.olika++; if(ut.ex.length < 6) ut.ex.push({ uppg: forsta, rader: rader.map(function(r){ return r.text; }), A: A, B: B, regel: regel, j: j }); }
    }
    res(Object.assign(ut, { jsFel: window.__e || [] }));
  })().catch(function(e){ res({ FEL: e.message + ' ' + e.stack }); });
})`;

if(process.argv.includes('--hoppa-d4')){ console.log('D4      (hoppat över)'); }
else {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ekv-rattare-fuzz-'));
  const probeFil = path.join(tmp, 'probe.js'); fs.writeFileSync(probeFil, PROBE);
  const url = 'file:///' + path.join(ROOT, 'ak7/k3/d4-ekvationer/index.html').replace(/\\/g, '/');
  const SATSER = 4, per = Math.ceil(N / SATSER);
  const sum = { n: 0, lika: 0, upprepning: 0, bokstav: 0, vandning: 0, olika: 0, mildare: 0, regelTraffGammalLost: 0 }, ex = [], jsFel = [];
  let dom = null;
  for(let s = 0; s < SATSER; s++){
    const pre = path.join(tmp, 'pre' + s + '.js');
    fs.writeFileSync(pre, "window.__e=[]; window.addEventListener('error', function(e){ window.__e.push(String(e.message)); });\n" +
      'window.__FUZZ = ' + JSON.stringify({ fro: 20261021 + s * 7919, n: per }) + ';\n');
    const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), url, probeFil, '--pre', pre, '--vanta-pa', 'laddad', '--viewport', '1366x768', '--timeout', '900000'],
                        { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    let j = null;
    try { j = JSON.parse(String(r.stdout).replace(/^﻿/, '').trim().split('\n').filter(l => l.trim().startsWith('{')).pop()); } catch(e){}
    if(!j || j.FEL){ fall('D4', 'sats ' + s + ' gav inget resultat: ' + (j && j.FEL ? j.FEL : String(r.stderr).slice(0, 300))); continue; }
    if(!dom) dom = j.dom;
    Object.keys(sum).forEach(k => { sum[k] += j[k] || 0; });
    j.ex.forEach(e => { if(ex.length < 6) ex.push(e); });
    (j.jsFel || []).forEach(e => jsFel.push(e));
  }
  if(dom){
    const avv = Object.keys(DOM_MD5).filter(k => crypto.createHash('md5').update(dom[k] || '', 'utf8').digest('hex') !== DOM_MD5[k]);
    console.log('DOM     ' + (avv.length ? '✗' : '✓') + ' sjuans tre blad renderas som i e6a9554' + (avv.length ? ' — skiljer: ' + avv.join(', ') : ''));
    if(avv.length) fall('DOM', 'sjuans blad renderas annorlunda: ' + avv.join(', '));
  }
  const ok = !sum.olika && !sum.mildare && sum.upprepning && sum.bokstav && sum.vandning && sum.n >= 30000 && !jsFel.length;
  console.log('D4      ' + (ok ? '✓' : '✗') + ' ' + sum.n + ' kedjor: som förut ' + sum.lika + ' · förklarade skillnader: upprepning ' + sum.upprepning +
    ', bokstav ' + sum.bokstav + ', vändning ' + sum.vandning + ' (varav förut lösta som nu fälls av en regel: ' + sum.regelTraffGammalLost + ')' +
    ' · OFÖRKLARADE ' + sum.olika + ' · mildare än förut ' + sum.mildare + ' · JS-fel ' + jsFel.length);
  ex.forEach(e => console.log('      ' + JSON.stringify(e).slice(0, 900)));
  if(sum.olika) fall('D4', sum.olika + ' kedjor skiljer sig utan att en tillåten regel förklarar det');
  if(sum.mildare) fall('D4', sum.mildare + ' kedjor är lösta nu men inte förut');
  ['upprepning', 'bokstav', 'vandning'].forEach(k => { if(!sum[k]) fall('D4', 'regeln ' + k + ' slog aldrig till — provet är blint för den'); });
  if(sum.n < 30000) fall('D4', 'bara ' + sum.n + ' kedjor (krav 30 000)');
  if(jsFel.length) fall('D4', 'JS-fel: ' + jsFel.slice(0, 3).join(' | '));
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(brott ? '\nRÖD · ' + brott + ' brott' : '\nGRÖN');
process.exit(brott ? 1 : 0);
