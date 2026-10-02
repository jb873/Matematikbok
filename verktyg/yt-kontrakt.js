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
     BREDD       inget dokument blir bredare än vyporten (mätt på 360 px, egen körning)

   VAD DEN HÄR GRINDEN INTE TÄCKER
     · Gränsen mellan etikett och hjälptext är språklig ("Area:" namnger, "Skriv ett mellanled
       först" instruerar) och avgörs inte här. Elevtext-låset kräver att varje elevtext ligger i
       ett FALT-fält och godkänns per fil.
     · Angränsande grindar: exempel-svep.js (exemplet ≠ uppgift i samma grupp), namnare-grind.js
       och flerruts-grind.js (att rutorna går att MÄTA).
     · Plattformsreglerna i stort — inklusive de som ingen grind vaktar ännu, och vad som skulle
       krävas för att mäta dem — står i doc/KONVENTIONER.md. Den listan bor på ETT ställe; skriv inte
       av den hit.

   KÖR:  node verktyg/yt-kontrakt.js [--sida <delsträng>]
   Exit 1 vid brott. Ingen nätväg, ingen fil ändras. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const Sidor = require('./sidor');
const MP = require('./matpunkt').skapa('yt-kontrakt.js');   // V14
const args = process.argv.slice(2);
if(Sidor.lista(args, sidor())) process.exit(0);
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
    // TECKEN — VARJE uttrycksruta, inte bara ytans första. En ruta längre ned kan bära ett annat
    // teckenbehov, och den som bara mäter ruta ett ser aldrig det.
    if(uttr.length && kp){
      y.tecken = lage(uttr[0]);
      var settT = {};
      uttr.forEach(function(inp){
        var typ = adress(inp);
        if(settT[typ]) return;                 // en per ruttyp räcker — rapporten är per typ
        settT[typ] = 1;
        var L = lage(inp);
        var slackta = Object.keys(L).filter(function(k){ return !L[k]; });
        if(slackta.length) y.brott.push('TECKEN: ' + slackta.join(', ') + ' släckta i ' + typ);
      });
    }

    // BOKSTÄVER — rutans facit säger vilka bokstäver svaret behöver; de ska vara tända.
    // Granskades inte alls förr: TECKEN läste bara räknetecknen.
    if(kp){
      var settB = {};
      alla.forEach(function(inp){
        var facit = inp.getAttribute('data-visa') || '';
        if(!facit) return;
        var typ = adress(inp);
        if(settB[typ]) return;
        settB[typ] = 1;
        inp.focus(); ev(inp, 'focusin');
        ['x','y','a','b','c','n'].forEach(function(v){
          // bokstaven ska stå fristående i facit, inte inuti ett ord
          if(!new RegExp('(^|[^a-zåäöA-ZÅÄÖ])' + v + '([^a-zåäöA-ZÅÄÖ]|$)').test(facit)) return;
          if(!tand(v)) y.brott.push('BOKSTAV: facit "' + facit.slice(0, 32) + '" behöver ' + v + ', som är släckt i ' + typ);
        });
        // TECKEN I FACIT: ett tecken som facit kräver måste finnas på keypaden alls.
        ['=', '(', ')', '/'].forEach(function(t){
          if(facit.indexOf(t) < 0) return;
          var b = kpEl && kpEl.querySelector('.kp-key[data-key="' + t + '"]');
          if(!b) y.brott.push('TECKEN SAKNAS: facit "' + facit.slice(0, 32) + '" behöver ' + t + ', som inte finns på keypaden');
          else if(b.classList.contains('kp-inactive')) y.brott.push('TECKEN: facit "' + facit.slice(0, 32) + '" behöver ' + t + ', som är släckt i ' + typ);
        });
      });
    }

    // TRYCK — når ett knapptryck fram till rutan? Keypaden kan vara monterad och ändå obunden.
    // Eleven trycker med mousedown; det är den vägen som ska mätas.
    if(uttr.length && kp){
      var p0 = uttr[0], fore0 = p0.value;
      p0.focus(); ev(p0, 'focusin');
      var kn = kpEl && kpEl.querySelector('.kp-key[data-key="5"]:not(.kp-inactive)');
      if(kn){
        kn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        if(p0.value === fore0) y.brott.push('TRYCK: keypadens 5 når inte fram till ' + adress(p0));
        p0.value = fore0; ev(p0, 'input');
      }
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
        // Rutor som SKA växa fylls tills texten är bredare än det tomma måttet — en sträng som får
        // plats ändå prövar ingenting ("12 + 15" rymdes i en 124 px-ruta som aldrig växte).
        // Rutor som medvetet hålls fasta (uppställningens data-svar, rutnäten) prövas med ett
        // rimligt innehåll i stället. Vilka som är vilka står i kärnans egen lista, inte här.
        inp.value = ''; ev(inp, 'input');
        var csT = getComputedStyle(inp);
        var tomInre = Math.round(inp.getBoundingClientRect().width
          - parseFloat(csT.paddingLeft || 0) - parseFloat(csT.paddingRight || 0)
          - parseFloat(csT.borderLeftWidth || 0) - parseFloat(csT.borderRightWidth || 0));
        var vaxSel = window.BLAD_VAXER || null;
        var skaVaxa = (vaxSel && inp.matches(vaxSel))
                   || !!(window.AK8_UI && AK8_UI.EGET_MATT && inp.matches(AK8_UI.EGET_MATT));
        var enhet = uttrycksruta(inp) ? '12x + 15y + ' : '1234';
        var txt = enhet;
        if(skaVaxa){ while(c.measureText(txt).width <= tomInre && txt.length < 60) txt += enhet; }
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

  /* Plattformens bladnavigering är TVÅ nivåer: flik (.blad-nav-btn) och underflik
     (.blad-subnav-btn). Här läses bara den första, och därför mäter yt-kontraktet inte de
     sidor vars blad ligger bakom en underflik — plugg-sidorna ger noll ytor.
     PRÖVAT OCH ÅTERSTÄLLT 2026-10-02: att bara lägga .blad-subnav-btn i samma PLATTA lista
     kostade mer än det gav. Plugg-sidorna kom in (6 rader), men fem sjuan-sidor föll ur och
     gav noll — d3-negativa-tal, d6-multiplikation, d7-division, d8-avrundning,
     d4-jamfora-brak — och summan gick från 97 ytor på 56 sidor till 88 på 55. På en sida med
     BÅDA nivåerna hamnar proben i en annan vy när underflikarna ligger i samma svep.
     Rätt lösning är en NÄSTLAD genomgång: klicka flik, läs om underflikarna, klicka var och en.
     Det är en egen ändring, inte en selektor-rad. Kontroll-svepet mäter plugg-sidorna redan. */
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
// Bredd-proben: vad som sticker ut, och vad som gör det. Utan adressen går brottet inte att
// åtgärda — "sidan är för bred" säger inte vilket element som är för brett.
const BREDD_PROBE = `(function(){
  var d = document.documentElement, over = [];
  if(d.scrollWidth > window.innerWidth + 1){
    Array.prototype.forEach.call(document.querySelectorAll('*'), function(el){
      var r = el.getBoundingClientRect();
      if(r.width > 0 && Math.round(r.right) > window.innerWidth + 1){
        var a = el.tagName.toLowerCase()
              + (el.className && typeof el.className === 'string' && el.className
                 ? '.' + el.className.split(/\\s+/).slice(0, 2).join('.') : '');
        if(over.length < 5 && over.indexOf(a) < 0) over.push(a + ' →' + Math.round(r.right) + 'px');
      }
    });
  }
  return { onerr: window.__onerr || null, vyport: window.innerWidth, dok: d.scrollWidth, over: over };
})()`;
const BREDD = 360;

// Sidmängden bor i verktyg/sidor.js — EN upptäckare för alla svep (V9). Här låg förut en
// ordagrann kopia av samma readdir-funktion; fyra verktyg bar var sin.
function sidor(){ return Sidor.blad(); }

const TMP = path.join(os.tmpdir(), 'ytkontrakt-' + process.pid + '.js');
fs.writeFileSync(TMP, PROBE);
const TMPB = path.join(os.tmpdir(), 'ytbredd-' + process.pid + '.js');
fs.writeFileSync(TMPB, BREDD_PROBE);
let fel = 0, ytor = 0, sidorMatta = 0;
console.log('YT-KONTRAKT — keypad · tecken · autospace · grow · bråk · minus · platshållare · division\n');
sidor().forEach(sida => {
  if(BARA && sida.indexOf(BARA) < 0) return;
  MP.forsok(sida);
  const r = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMP,
                               '--wait', '2000', '--timeout', '60000'], { encoding: 'utf8', timeout: 120000 });
  let u = null;
  try { u = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(!u){ console.log('? ' + sida + ': inget svar'); return; }
  sidorMatta++;
  if(u.onerr && u.onerr.length){ fel++; console.log('✗ ' + sida + ': JS-fel ' + u.onerr.join(' | ')); }
  // BREDD — egen körning på telefonbredd. Ett dokument bredare än vyporten betyder att eleven
  // kan scrolla sidled på hela sidan; på telefon glider uppgiften ur bild medan hon skriver.
  const rb = spawnSync('node', [path.join(__dirname, 'cdp-kor.js'), fileUrl(path.join(ROOT, sida)), TMPB,
                                '--wait', '1200', '--timeout', '40000', '--viewport', BREDD + 'x800'],
                       { encoding: 'utf8', timeout: 90000 });
  let ub = null;
  try { ub = JSON.parse((rb.stdout || '').trim().split('\n').pop()); } catch(e){}
  if(ub && ub.dok > ub.vyport + 1){
    fel++;
    console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · BREDD: dokumentet blir ' + ub.dok
      + ' px på en ' + ub.vyport + ' px skärm — eleven kan scrolla sidled\n     '
      + (ub.over.length ? ub.over.join('\n     ') : '(hittade inget enskilt element)'));
  }

  MP.rakna(sida, (u.ytor || []).length);
  (u.ytor || []).forEach(y => {
    ytor++;
    if(!y.brott.length){ console.log('✓ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + ' (' + y.rutor + ' rutor, ' + y.uttrycksrutor + ' uttryck)'); return; }
    fel += y.brott.length;
    console.log('✗ ' + sida.replace(/\/index\.html$/, '') + ' · ' + y.yta + '\n     ' + y.brott.join('\n     '));
  });
});
try { fs.unlinkSync(TMP); } catch(e){}
try { fs.unlinkSync(TMPB); } catch(e){}
fel += MP.granska();   // V14: en sida i listan måste ge minst en mätpunkt
console.log('\n' + (fel ? '✗ YT-KONTRAKT RÖTT (' + fel + ')' : '✓ YT-KONTRAKT GRÖNT') + ' · ' + ytor + ' ytor på ' + sidorMatta + ' sidor');
process.exit(fel ? 1 : 0);
