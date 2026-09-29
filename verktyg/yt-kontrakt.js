/* yt-kontrakt.js — VAD VARJE YTA MED INMATNING SKA HA (order 2026-09-28).

   MÖNSTRET som gav ordern: funktionen finns, kopplingen saknas på en yta ingen svepte. Det har
   hänt med pNum, grow(), autoSpace, keypaden, bråkknappen, visning.titel och elevtext-låset — och
   varje gång har det upptäckts av att Joachim klickat, inte av ett verktyg.

   Kontraktet körs mot VARJE yta med inmatning i alla tre årskurserna, i riktig webbläsare, och
   rapporterar vad som saknas per yta.

   KONTROLLERAS MEKANISKT
     KEYPAD      en yta med rutor har en keypad monterad
     TECKEN      en uttrycksruta säger vilka tecken (data-kp) och bokstäver (data-vars) som gäller
     AUTOSPACE   "3+4" skrivet tecken för tecken blir "3 + 4" i en uttrycksruta
     GROW        rutan växer med innehållet
     BRÅK        bråkknappen finns när en ruta ska kunna bära bråk, och bygger i den
     MINUS       keypadens − och tangentbordets - ger samma värde (pNum)
     PLATSHÅLLARE  inga placeholder-texter i svarsrutor
     DIVISION    ingen ÷ i uppgiftstexten — division skrivs som staplat bråk

   LÄSLISTA (går inte att avgöra mekaniskt — läs själv vid granskning)
     · Etiketter framför rutan får stå, hjälptexter i öva får inte. Gränsen är språklig:
       "Area:" namnger, "Skriv ett mellanled först" instruerar. Se elevtext-låset, som kräver att
       varje elevtext ligger i ett FALT-fält och godkänns per fil.
     · Bekräftelsesteg i drillar (inget auto-advance). Drillarna kör i ram-filer med egen
       flödeslogik; kontrollen kräver att man spelar en omgång per drill.
     · Att exemplet inte sammanfaller med en uppgift i samma grupp: verktyg/exempel-svep.js.
     · Att rutorna går att MÄTA: verktyg/namnare-grind.js och verktyg/flerruts-grind.js.

   KÖR:  node verktyg/yt-kontrakt.js [--sida <delsträng>]
   Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const BARA = (i => i >= 0 ? args[i + 1] : null)(args.indexOf('--sida'));
const fileUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const PROBE = `(function(){
  var ut = { onerr: window.__onerr || null, ytor: [] };
  function ev(el, t){ el.dispatchEvent(new Event(t, { bubbles: true })); }
  function synlig(el){ return !!el.offsetParent; }

  // en YTA = ett blad/flik med rutor. Flikarna klickas fram; utan flikar är sidan en yta.
  function rutor(root){
    return Array.prototype.filter.call(
      root.querySelectorAll('input.ovn-in, input.ak8-in, input.seg-text, input.ak8-exprtxt'), synlig);
  }
  // Samma lista som AK8_UI:s UTTRYCKSRUTOR, plus sjuans data-attribut och kedjans segment.
  function uttrycksruta(i){
    return i.matches('[data-uttryck],[data-forenkla],[data-omkrets],[data-oppet],[data-sida],[data-vars],[data-mellan],'
                   + '.ak8-mel,.ak8-exprtxt,.ak8-in-oms,.ak8-pexp,.ak8-gpe,.seg-text');
  }
  function talruta(i){ return !uttrycksruta(i) && !i.matches('[data-nokeypad],[data-text]'); }

  // Den keypad eleven ser: den som ritas (höjd > 0) och inte är undanställd. En sida kan ha flera
  // (widget-keypads inuti uppställningar) — den första i DOM-ordning är inte nödvändigtvis rätt.
  function synligKeypad(){
    var alla = Array.prototype.slice.call(document.querySelectorAll('.keypad'));
    var ritad = alla.filter(function(k){
      return !k.classList.contains('keypad-hidden') && k.getBoundingClientRect().height > 0;
    });
    return ritad[ritad.length - 1] || alla[alla.length - 1] || null;
  }

  function mat(namn, root){
    var alla = rutor(root);
    if(!alla.length) return;
    var y = { yta: namn, rutor: alla.length, brott: [] };

    // KEYPAD
    var kpEl = synligKeypad();
    var kp = kpEl && kpEl.querySelector('.kp-key');
    if(!kp) y.brott.push('KEYPAD saknas');

    // TECKEN — mätt som EFFEKT, inte som attribut: data-kp/data-vars är ett sätt att säga det,
    // åttans celler graderas ur rättar-typen. Det som gäller är vad eleven ser tänt.
    var uttr = alla.filter(uttrycksruta);
    y.uttrycksrutor = uttr.length;
    function tand(k){
      var b = kpEl && kpEl.querySelector('.kp-key[data-key="' + k + '"]');
      return !!b && !b.classList.contains('kp-inactive') && b.getAttribute('aria-disabled') !== 'true';
    }
    function adress(inp){
      return (inp.className || '') + '[' + Array.prototype.map.call(inp.attributes, function(x){ return x.name; })
        .filter(function(n){ return n.indexOf('data-') === 0; }).join(',') + ']';
    }
    function lage(inp){
      inp.focus(); ev(inp, 'focusin');
      return { plus: tand('+'), minus: tand('\u2212'), gang: tand('\u00b7'), del: tand('/') };
    }
    if(uttr.length && kp){
      var L = lage(uttr[0]);
      y.tecken = L;
      var slackta = Object.keys(L).filter(function(k){ return !L[k]; });
      if(slackta.length) y.brott.push('TECKEN: ' + slackta.join(', ') + ' släckta i ' + adress(uttr[0]));
    }
    var talrutor = alla.filter(talruta);
    if(talrutor.length && kp){
      var T = lage(talrutor[0]);
      if(T.plus && T.gang && T.del) y.brott.push('TECKEN: räknetecken tända i talrutan ' + adress(talrutor[0]));
    }

    // AUTOSPACE + GROW på den första uttrycksrutan
    var p = uttr[0];
    if(p){
      var f0 = p.getBoundingClientRect().width;
      p.value = ''; p.focus();
      '3+4'.split('').forEach(function(c){ p.value += c; ev(p, 'input'); });
      y.autoSpace = p.value;
      // vilken ruta som provades — ett brott utan adress går inte att åtgärda
      var vem = (p.className || '') + '[' + Array.prototype.map.call(p.attributes, function(x){ return x.name; }).filter(function(n){ return n.indexOf('data-') === 0; }).join(',') + ']';
      if(p.value.indexOf('3 + 4') < 0 && p.value.indexOf('3 \\u002b 4') < 0) y.brott.push('AUTOSPACE: "3+4" blev "' + p.value + '" i ' + vem);
      p.value = '123456789012345'; ev(p, 'input');
      if(Math.round(p.getBoundingClientRect().width) <= Math.round(f0)) y.brott.push('GROW: rutan växer inte — ' + vem);
      p.value = ''; ev(p, 'input');
      // MINUS: keypadens − (U+2212) och tangentbordets - ska ge samma värde
      if(window.AK8_UI && AK8_UI.pNum){
        var a = AK8_UI.pNum('\\u22125'), b = AK8_UI.pNum('-5');
        if(!(a === b && a === -5)) y.brott.push('MINUS: \\u22125 ger ' + a + ', -5 ger ' + b);
      }
      p.value = ''; ev(p, 'input');
    }

    // GROW PER RUTTYP (order 2026-09-29): måttet är en FORM, inte ett tak. En smal exponentruta ska
    // se ut som en exponent när den är tom — men mellanledet i 3⁴ · 3⁵ skrivs 4 + 5, och då måste
    // rutan följa med. Exponentrutan öppnade som 26 px fast .pot sup .ak8-pexp bett om 44: grow()s
    // rollkonstant skrev över CSS-regeln, och bara ett tecken fick plats.
    //
    // MÄTT SOM EFFEKT: texten mäts med canvas i rutans EGET typsnitt och jämförs med rutans inre
    // bredd. scrollWidth duger inte — en <input> rapporterar samma scrollWidth som clientWidth så
    // fort texten scrollats, och döljer därmed precis det som ska hittas.
    //
    // Provsträngen är densamma som smalrute-svepets: ett fyrsiffrigt tal i en talruta, ett uttryck
    // i en uttrycksruta. Två verktyg som provar olika innehåll säger olika saker om samma ruta, och
    // då går ingen av dem att lita på. En längre sträng skulle dessutom fälla varje avsiktligt
    // kompakt ruta — samma lärdom som de tjugosex falska brotten när kontraktet mätte formen.
    //
    // ÖPPET (rapporterat, inte avgjort): sjuans uppställnings- och följdrutor (data-svar, undantagna
    // från VAXER för att hålla formen i rutnät) klipper ett SEXsiffrigt tal. Om det ska växa är en
    // formfråga för uppställningen, inte något svepet ska avgöra.
    (function(){
      var settTyp = {};
      alla.forEach(function(inp){
        var typ = (inp.className || '').replace(/\s+/g, '.');
        if(settTyp[typ]) return;                       // en per ruttyp räcker — rapporten är per typ
        settTyp[typ] = 1;
        var cs = getComputedStyle(inp);
        var c = document.createElement('canvas').getContext('2d');
        c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        var gammalt = inp.value;
        var txt = uttrycksruta(inp) ? '12 + 15' : '1234';
        inp.value = ''; ev(inp, 'input');
        txt.split('').forEach(function(ch){ inp.value += ch; ev(inp, 'input'); });
        var inre = inp.getBoundingClientRect().width
                 - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0)
                 - parseFloat(cs.borderLeftWidth || 0) - parseFloat(cs.borderRightWidth || 0);
        var behovs = Math.ceil(c.measureText(inp.value).width);
        if(behovs > Math.round(inre) + 1)
          y.brott.push('GROW: "' + inp.value + '" behöver ' + behovs + ' px men rutan ger '
                     + Math.round(inre) + ' — ' + adress(inp));
        inp.value = gammalt; ev(inp, 'input');
      });
    })();

    // BRÅK: en ruta som ska bära bråk kräver en byggarknapp som fungerar
    // Bara rutor som SÄGER att de bär bråk: en kedjeruta för ett tal ska inte erbjuda bråkknappen.
    var brakruta = alla.filter(function(i){ return i.hasAttribute('data-bygg') || (i.getAttribute('data-kp') || '').match(/fri|bygg/); })[0];
    if(brakruta){
      var fk = kpEl && kpEl.querySelector('.kp-key[data-key="frac"]');
      if(!fk) y.brott.push('BRÅK: ingen bråkknapp fast rutorna ska bära bråk');
      else if(fk.classList.contains('kp-inactive') || fk.getAttribute('aria-disabled') === 'true') y.brott.push('BRÅK: bråkknappen är grå');
      else {
        // Bråket byggs olika på olika ytor: .ovn-brak i åttans celler, .seg-brak i kedjans sidor.
        var cell = brakruta.closest('.ak8-cell, .sida, .prob-uttryck, .prob-svar') || brakruta.parentElement;
        brakruta.focus(); ev(brakruta, 'focusin');
        fk.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        if(cell && !cell.querySelector('.ovn-brak, .ovn-kbrak, .seg-brak')) y.brott.push('BRÅK: knappen bygger inget bråk i rutan');
      }
    }

    // PLATSHÅLLARE i svarsrutor
    var ph = alla.filter(function(i){ return (i.placeholder || '').trim() !== ''; });
    if(ph.length) y.brott.push('PLATSHÅLLARE: ' + ph.length + ' rutor med text (' + ph.slice(0, 2).map(function(i){ return i.placeholder; }).join(' ; ') + ')');

    // DIVISION med ÷
    if(/÷/.test(root.textContent || '')) y.brott.push('DIVISION: ÷ i texten — division skrivs som staplat bråk');

    ut.ytor.push(y);
  }

  var nav = Array.prototype.slice.call(document.querySelectorAll('#blad-nav .blad-nav-btn, .blad-nav-btn'));
  if(nav.length){
    nav.forEach(function(k){
      if(k.disabled) return;                      // tom plats — inget innehåll att mäta
      k.click();
      var m = Array.prototype.filter.call(document.querySelectorAll('.blad-mount'), function(e){ return !e.hidden && e.offsetParent; })[0]
           || document.querySelector('.ovn-wrap') || document.body;
      mat(k.textContent.trim().slice(0, 26), m);
    });
  } else {
    mat('(enda)', document.body);
  }
  ut.onerr = window.__onerr || null;
  return ut;
})()`;

// Ytorna: alla delkapitelsidor och åttans blad-sidor (ram-filerna är drillar → läslistan).
function sidor(){
  const ut = [];
  ['ak7/k1', 'ak7/k2', 'ak7/k3', 'ak8/k2'].forEach(kap => {
    const d = path.join(ROOT, kap);
    if(!fs.existsSync(d)) return;
    fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).forEach(e => {
      const p = path.join(d, e.name, 'index.html');
      if(fs.existsSync(p)) ut.push(path.relative(ROOT, p).replace(/\\/g, '/'));
    });
  });
  fs.readdirSync(path.join(ROOT, 'ak8/k1')).filter(f => /\.html$/.test(f) && f !== 'index.html')
    .forEach(f => ut.push('ak8/k1/' + f));
  ['ak9/k1'].forEach(kap => {
    const d = path.join(ROOT, kap);
    if(!fs.existsSync(d)) return;
    fs.readdirSync(d).filter(f => /\.html$/.test(f) && f !== 'index.html').forEach(f => ut.push(kap + '/' + f));
  });
  return ut;
}

const TMP = path.join(os.tmpdir(), 'ytkontrakt-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);
let fel = 0, ytor = 0, sidorMatta = 0;
console.log('YT-KONTRAKT — keypad · tecken · autospace · grow · bråk · minus · platshållare · division\n');
sidor().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
                               '--wait', '2000', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  sidorMatta++;
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + u.onerr.join(' | ')); }
  (u.ytor || []).forEach(y => {
    ytor++;
    if(!y.brott.length){ console.log('✓ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ' (' + y.rutor + ' rutor, ' + y.uttrycksrutor + ' uttryck)'); return; }
    fel += y.brott.length;
    console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + '\n     ' + y.brott.join('\n     '));
  });
});
try { fs.unlinkSync(TMP); } catch(e){}
console.log('\n' + (fel ? '✗ YT-KONTRAKT RÖTT (' + fel + ')' : '✓ YT-KONTRAKT GRÖNT') + ' · ' + ytor + ' ytor på ' + sidorMatta + ' sidor');
process.exit(fel ? 1 : 0);
