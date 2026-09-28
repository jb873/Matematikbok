/* blad-ak8-alg1.js — ÅTTANS ALGEBRAISKA UTTRYCK, tio öva-blad (order 2026-09-28).

   Fyra flikar, två till tre blad var, som tillsammans täcker alla uppgiftstyper i sjuans
   motsvarande blad:

     Tolka uttryck      2 blad   legend → ord och värde · eget uttryck
     Skriva uttryck     3 blad   översätta · dela och para ihop · figur och sammansatt
     Beräkna            2 blad   mellanledskedja med en variabel · två variabler och figur
     Förenkla           3 blad   en variabel · två variabler och konstanter · decimaler och pussel

   UPPGIFTERNA KOMMER UR BANDET (js/data/band-ak8-alg1.js) via generatorn: samma uppgifter som
   sjuans, andra tal, egna figurer. Talområdet är sjuans — det här är repetition.

   RENDERINGEN ÄR SJUANS KÄRNA (blad-karna-b.js). Varje radtyp här finns redan där: uttryck,
   forenkla, omkrets, oppet, sidor, valruta, pyramid, magisk, flerled, bild, enkel. Ingen ny
   radtyp byggs, ingen egen motor — det som är en funktion ärvs.

   FIGURERNA ritas ur samma data som facit (SvgAlgebraFigur), så ett ändrat tal ändrar båda.

   SEEDAT per blad: samma blad varje gång, och "Nytt blad" ger nästa variant. */
(function(){
'use strict';

var G = window.GEN_AK8_ALG1, B = window.BAND_AK8_ALG1, F = window.SvgAlgebraFigur;
if(!G || !B) return;

var ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio'];
function ordTal(n){ return ORD[n] || String(n); }
function formen(n, ental, flertal){ return n === 1 ? ental : flertal; }

// ELEVTEXT som fält (elevtext-låset ser fältnamnen). Joachim sätter ordalydelsen.
var TEXT = {
  berakna:    { rubrik: 'Beräkna' },
  forenkla:   { rubrik: 'Förenkla uttrycket' },
  valjUttryck:{ rubrik: 'Välj det uttryck som stämmer' },
  skrivUttryck:{ rubrik: 'Skriv ett uttryck' },
  paraIhop:   { rubrik: 'Para ihop genom att skriva rätt uttryck' },
  stracka:    { rubrik: 'Skriv ett uttryck för längden av den röda sträckan' },
  omkrets:    { rubrik: 'Skriv ett uttryck för figurens omkrets och förenkla det' },
  medMellanled:{ rubrik: 'Beräkna med mellanled' },
  pyramid:    { rubrik: 'Fyll i de tomma rutorna. Varje ruta är summan av de två rutorna under.' },
  magisk:     { rubrik: 'Fyll i de tomma rutorna så att summan blir lika stor lodrätt, vågrätt och diagonalt.' },
  sidor:      { rubrik: 'Skriv två sidor som ger den omkretsen' },
  oppet:      { rubrik: 'Skriv ett uttryck som innehåller fyra termer och förenklas till' },
  eget:       { rubrik: 'Skriv ett eget uttryck' }
};

function G_(rubrik, rader){ return { rubrik: rubrik, rader: rader }; }

// ── FLIK 1 · TOLKA UTTRYCK ───────────────────────────────────────────────────────────────────
// Legenden visar VAD bokstaven står för, aldrig hur många — antalet står i uttrycket, och att
// läsa det är hela uppgiften (samma rättelse som gjordes i sjuans blad).
function legendSvg(vara){
  return '<div class="emoji-bild">'
    + '<span class="emoji-grupp">' + vara.emoji[0] + '<span class="emoji-text">' + vara.ental[0] + ' · ' + vara.b1 + ' kr</span></span>'
    + '<span class="emoji-grupp">' + vara.emoji[1] + '<span class="emoji-text">' + vara.ental[1] + ' · ' + vara.b2 + ' kr</span></span>'
    + '</div>';
}
function tolkaGrupp(r, vara, vakt){
  var varor = { b1: vara.b1, b2: vara.b2, pris: vara.pris,
    ord: function(a, b){ return ordTal(a) + ' ' + formen(a, vara.ental[0], vara.flertal[0])
                              + ' och ' + ordTal(b) + ' ' + formen(b, vara.ental[1], vara.flertal[1]); } };
  var x = G.dra('tolka', function(){ return G.tolkaRad(r, varor); }, null, r, vakt);
  var utanMellanslag = x.svar.replace(/\s/g, '');
  return G_('En ' + vara.ental[0] + ' kostar ' + vara.b1 + ' kronor och en ' + vara.ental[1] + ' kostar ' + vara.b2 + ' kronor', [
    { typ: 'bild', svarTyp: 'text', fraga: 'Vad har någon köpt om uttrycket ' + x.uttryck + ' beskriver kostnaden?',
      svar: x.svar, accept: [utanMellanslag, utanMellanslag.replace(/och/g, '')], svg: legendSvg(vara) },
    { typ: 'enkel', vansterText: 'Hur mycket kostar det om ' + x.varden + '?', svar: x.belopp }
  ]);
}
function bladTolka(nr, seed){
  var r = G.rng(seed), vakt = {}, grupper = [];
  var varor = B.BAND.VAROR;
  if(nr === 1){
    varor.slice(0, 4).forEach(function(v){ grupper.push(tolkaGrupp(r, v, vakt)); });
    return { titel: 'Tolka uttryck – blad 1', grupper: grupper };
  }
  grupper.push(tolkaGrupp(r, varor[4], vakt));
  grupper.push(G_(TEXT.eget.rubrik, EGNA_UTTRYCK(r)));
  return { titel: 'Tolka uttryck – blad 2', grupper: grupper };
}
// De egna uttrycken: sammanhanget är text, talet kommer ur bandet.
function EGNA_UTTRYCK(r){
  var n1 = G.ri(r, 2, 6), n2 = G.ri(r, 2, 5), n3 = G.ri(r, 2, 6);
  return [
    { typ: 'uttryck', fraga: 'En film kostar a kronor att hyra. Skriv ett uttryck för vad det kostar att hyra ' + n1 + ' filmer.',
      svar: n1 + 'a', accept: [n1 + 'a', 'a·' + n1, n1 + '·a'], vars: 'a' },
    { typ: 'uttryck', fraga: 'Saga är x år. Hennes lillasyster är ' + n2 + ' år yngre. Skriv ett uttryck för lillasysterns ålder.',
      svar: 'x−' + n2, accept: ['x-' + n2], vars: 'x' },
    { typ: 'uttryck', fraga: 'En biljett kostar b kronor. Skriv ett uttryck för vad ' + n3 + ' biljetter kostar.',
      svar: n3 + 'b', accept: [n3 + 'b', 'b·' + n3, n3 + '·b'], vars: 'b' }
  ];
}

// ── FLIK 2 · SKRIVA UTTRYCK ─────────────────────────────────────────────────────────────────
function strackaSvg(delar){
  // sträckan ritas ur delarna: en röd hel sträcka över, delarna under med sina mått
  var bredd = 320, x0 = 30, x1 = 290, n = delar.length, steg = (x1 - x0) / n, s = '';
  s += '<svg viewBox="0 0 ' + bredd + ' 70" width="' + bredd + '" height="70" xmlns="http://www.w3.org/2000/svg">';
  s += '<line x1="' + x0 + '" y1="22" x2="' + x1 + '" y2="22" stroke="#c0392b" stroke-width="3"/>';
  s += '<line x1="' + x0 + '" y1="16" x2="' + x0 + '" y2="28" stroke="#c0392b" stroke-width="2"/>';
  s += '<line x1="' + x1 + '" y1="16" x2="' + x1 + '" y2="28" stroke="#c0392b" stroke-width="2"/>';
  s += '<line x1="' + x0 + '" y1="48" x2="' + x1 + '" y2="48" stroke="#333" stroke-width="2"/>';
  for(var i = 0; i <= n; i++){
    var x = x0 + steg * i;
    s += '<line x1="' + x + '" y1="42" x2="' + x + '" y2="54" stroke="#333" stroke-width="2"/>';
  }
  delar.forEach(function(d, i){
    s += '<text x="' + (x0 + steg * i + steg / 2) + '" y="65" text-anchor="middle" font-size="14" font-style="italic">' + d + '</text>';
  });
  return s + '</svg>';
}
function bladSkriva(nr, seed){
  var r = G.rng(seed), vakt = {}, grupper = [];
  function rader(variant, antal){
    var ut = [];
    for(var i = 0; i < antal; i++) ut.push(G.dra('skriva', function(){ return G.skrivaRad(r, variant); }, null, r, vakt));
    return ut;
  }
  if(nr === 1){
    var v = rader('valruta', 3);
    grupper.push(G_(TEXT.valjUttryck.rubrik, v.map(function(x){
      return { typ: 'valruta', fraga: x.fraga, alt: x.alt, ratt: [x.ratt] };
    })));
    var bokstav = 'a';
    grupper.push(G_('En person är ' + bokstav + ' cm lång. Skriv ett uttryck för längden av en person som är', [
      rader('langre', 1)[0], rader('kortare', 1)[0], rader('ganger', 1)[0]
    ].map(function(x){ return { typ: 'uttryck', fraga: x.fraga, svar: x.svar.replace(/\s/g, ''), accept: [x.svar.replace(/\s/g, '')], vars: x.varibel }; })));
    grupper.push(G_(TEXT.skrivUttryck.rubrik, rader('mer', 3).map(function(x){
      return { typ: 'uttryck', fraga: x.fraga, svar: x.svar.replace(/\s/g, ''), accept: [x.svar.replace(/\s/g, '')], vars: x.varibel };
    })));
    return { titel: 'Skriva uttryck – blad 1', grupper: grupper };
  }
  if(nr === 2){
    var sf = rader('strackfigur', 3);
    grupper.push(G_(TEXT.stracka.rubrik, sf.map(function(x){
      return { typ: 'bild', svarTyp: 'uttryck', fraga: 'Röda sträckan =', svar: x.svar,
               accept: [x.svar, x.delar.join('+')], vars: (x.delar[0].match(/[a-z]/) || ['x'])[0], svg: strackaSvg(x.delar) };
    })));
    grupper.push(G_(TEXT.skrivUttryck.rubrik, rader('halften', 2).map(function(x){
      return { typ: 'uttryck', fraga: x.fraga, svar: x.svar, accept: [x.svar], vars: x.varibel };
    })));
    var pi = G.skrivaRad(r, 'paraIhop');
    grupper.push(G_(TEXT.paraIhop.rubrik, pi.rader.map(function(q){
      return { typ: 'uttryck', fraga: q.fraga, svar: q.svar, accept: [q.svar], vars: pi.variabel };
    })));
    return { titel: 'Skriva uttryck – blad 2', grupper: grupper };
  }
  var om = rader('omkrets', 2);
  grupper.push(G_(TEXT.omkrets.rubrik, om.map(function(x){
    return { typ: 'omkrets', svg: F ? F.rektangel({ bredd: x.sidor[0], hojd: x.sidor[1] }) : '',
             sidor: x.sidor, svar: x.visa, vars: x.varibel };
  })));
  var sl = rader('sammanlagd', 2);
  grupper.push(G_(TEXT.skrivUttryck.rubrik, sl.map(function(x){
    return { typ: 'uttryck', fraga: 'En person är ' + x.delar[0] + ' år. Syskonet är ' + x.delar[1].replace(/\s/g, ' ')
                    + ' år. Det tredje syskonet är ' + x.delar[2] + ' år. ' + x.fraga + '.',
             svar: x.svar, accept: [x.svar], vars: (x.svar.match(/[a-z]/) || ['x'])[0] };
  })));
  var pk = G.skrivaRad(r, 'prisKedja');
  grupper.push(G_('En glass kostar ' + pk.variabel + ' kr, en läsk kostar ' + pk.mer[0]
    + ' kr mer än glassen och en smörgås kostar ' + pk.mer[1] + ' kr mer än glassen', pk.rader.map(function(q, i){
      if(i === 3) return { typ: 'enkel', vansterText: q.fraga, svar: q.svar };
      return { typ: 'uttryck', fraga: q.fraga, svar: q.svar, accept: [q.svar], vars: pk.variabel };
    })));
  return { titel: 'Skriva uttryck – blad 3', grupper: grupper };
}

// ── FLIK 3 · BERÄKNA MED UTTRYCK ────────────────────────────────────────────────────────────
// Sjuans form: uttrycket, värdet insatt, uträkningen, svaret — en kedja per rad.
function flerledRad(x){
  return { typ: 'flerled', vansterText: x.uttryck + ', &nbsp;' + x.varden,
           led: x.led.map(function(l){ return l.svar !== undefined ? { svar: l.svar } : { accept: [l.accept], visa: l.visa }; }) };
}
function bladBerakna(nr, seed){
  var r = G.rng(seed), vakt = {}, grupper = [];
  function dra(variant, antal){
    var ut = [];
    for(var i = 0; i < antal; i++) ut.push(G.dra('berakna', function(){ return G.beraknaRad(r, variant); }, null, r, vakt));
    return ut;
  }
  if(nr === 1){
    [0, 1, 2].forEach(function(){ grupper.push(G_(TEXT.medMellanled.rubrik, dra('flerledEn', 2).map(flerledRad))); });
    return { titel: 'Beräkna med uttryck – blad 1', grupper: grupper };
  }
  grupper.push(G_(TEXT.medMellanled.rubrik, dra('flerledTva', 2).map(flerledRad)));
  grupper.push(G_(TEXT.medMellanled.rubrik, dra('flerledTva', 2).map(flerledRad)));
  var fig = dra('flerledFigur', 1)[0];
  grupper.push(G_(TEXT.medMellanled.rubrik, [
    { typ: 'omkrets', svg: F ? F.rektangel({ bredd: fig.sidor[0], hojd: fig.sidor[1] }) : '',
      sidor: fig.sidor, svar: fig.uttryck, vars: (fig.sidor[0].match(/[a-z]/) || ['x'])[0] },
    flerledRad(fig)
  ]));
  return { titel: 'Beräkna med uttryck – blad 2', grupper: grupper };
}

// ── FLIK 4 · FÖRENKLA UTTRYCK ───────────────────────────────────────────────────────────────
function forenklaRad(x, vars){
  return { typ: 'forenkla', fraga: x.fraga, svar: x.svar, vars: vars || (x.fraga.match(/[a-z]/) || ['x'])[0] };
}
function bladForenkla(nr, seed){
  var r = G.rng(seed), vakt = {}, grupper = [];
  var N = B.BAND.forenkla.nivaer[nr];
  function dra(variant, antal){
    var eg = variant === 'noll' ? 'nollsvar' : (variant === 'decimal' ? 'decimal' : null);
    var ut = [];
    for(var i = 0; i < antal; i++) ut.push(G.dra('forenkla', function(){ return G.forenklaRad(r, variant, eg); }, eg, r, vakt));
    return ut;
  }
  if(nr === 1){
    grupper.push(G_(TEXT.forenkla.rubrik, dra('summa', 3).concat(dra('differens', 2)).map(function(x){ return forenklaRad(x); })));
    grupper.push(G_(TEXT.forenkla.rubrik, dra('noll', 1).concat(dra('faktor', 2)).concat(dra('decimal', 1)).map(function(x){ return forenklaRad(x); })));
    grupper.push(G_(TEXT.forenkla.rubrik, dra('tva', 4).map(function(x){ return forenklaRad(x, 'xy'); })));
    return { titel: 'Förenkla uttryck – blad 1', grupper: grupper };
  }
  if(nr === 2){
    grupper.push(G_(TEXT.forenkla.rubrik, dra('tva', 3).concat(dra('negativKoeff', 2)).map(function(x){ return forenklaRad(x, 'xy'); })));
    grupper.push(G_(TEXT.forenkla.rubrik, dra('konstant', 3).concat(dra('femTermer', 2)).map(function(x){ return forenklaRad(x, 'xy'); })));
    var om = dra('omkretsForenkla', 2);
    grupper.push(G_(TEXT.omkrets.rubrik, om.map(function(x){
      return { typ: 'omkrets', svg: F ? F.fyrhorning({ sidor: x.sidor }) : '', sidor: x.sidor, svar: x.svar,
               vars: (x.sidor[0].match(/[a-z]/) || ['x'])[0] };
    })));
    return { titel: 'Förenkla uttryck – blad 2', grupper: grupper };
  }
  grupper.push(G_(TEXT.forenkla.rubrik, dra('decimalFlera', 2).concat(dra('parentesNeg', 2)).map(function(x){ return forenklaRad(x, 'xy'); })));
  grupper.push(G_(TEXT.oppet.rubrik, dra('oppet', 2).map(function(x){
    return { typ: 'oppet', fraga: x.mal, mal: x.mal, termer: 4, vars: (x.mal.match(/[a-z]/) || ['x'])[0] };
  })));
  grupper.push(G_(TEXT.pyramid.rubrik, dra('pyramid', 2).map(pyramidRad)));
  grupper.push(G_(TEXT.magisk.rubrik, dra('magisk', 1).map(magiskRad)));
  var sd = dra('sidor', 1)[0];
  grupper.push(G_(sd.fraga, [
    { typ: 'sidor', svg: F ? F.rektangel({ bredd: '?', hojd: '?' }) : '',
      halva: sd.facit[0] + '+' + sd.facit[1], visa: sd.omkrets, vars: (sd.facit[0].match(/[a-z]/) || ['x'])[0] }
  ]));
  return { titel: 'Förenkla uttryck – blad 3', grupper: grupper };
}
// Pyramiden i kärnans form: rader uppifrån, fast = given ruta, svar = ruta att fylla.
function pyramidRad(p){
  var vars = (p.botten[0].match(/[a-z]/g) || ['x']).slice(0, 2).join('');
  return { typ: 'pyramid', vars: vars, rader: [
    [{ svar: p.topp }],
    [{ svar: p.mitt[0] }, { svar: p.mitt[1] }],
    [{ fast: p.botten[0] }, { fast: p.botten[1] }, { fast: p.botten[2] }]
  ] };
}
// Magiska kvadraten: fyra rutor givna, fem att fylla.
function magiskRad(m){
  var platt = m.rutor[0].concat(m.rutor[1]).concat(m.rutor[2]);
  var vars = (platt[0].match(/[a-z]/) || ['x'])[0];
  var givna = { 0: 1, 4: 1, 6: 1, 8: 1 };
  return { typ: 'magisk', vars: vars, summa: m.summa,
           rutor: platt.map(function(c, i){ return givna[i] ? { fast: c } : { svar: c }; }) };
}

// ── MONTERING ────────────────────────────────────────────────────────────────────────────────
var BLAD = {
  'tolka1':    function(s){ return bladTolka(1, s); },
  'tolka2':    function(s){ return bladTolka(2, s); },
  'skriva1':   function(s){ return bladSkriva(1, s); },
  'skriva2':   function(s){ return bladSkriva(2, s); },
  'skriva3':   function(s){ return bladSkriva(3, s); },
  'berakna1':  function(s){ return bladBerakna(1, s); },
  'berakna2':  function(s){ return bladBerakna(2, s); },
  'forenkla1': function(s){ return bladForenkla(1, s); },
  'forenkla2': function(s){ return bladForenkla(2, s); },
  'forenkla3': function(s){ return bladForenkla(3, s); }
};
var FRON = { tolka1: 101, tolka2: 102, skriva1: 201, skriva2: 202, skriva3: 203,
             berakna1: 301, berakna2: 302, forenkla1: 401, forenkla2: 402, forenkla3: 403 };

// ── TALBANK: uppgifterna ur bladen, märkta med nod och nivå ────────────────────────────────
// Pusselformerna (pyramid, magisk kvadrat, öppen uppgift) läggs INTE i banken: de stannar i öva.
// En elev som kan allt kan ändå fastna på ett pussel, och då prövar testet något annat än öva
// tränar (Joachims beslut).
var NOD = { tolka: 'alg-tolka:begrepp', skriva: 'alg-skriva:kommunikation',
            berakna: 'alg-berakna:rakna', forenkla: 'alg-samla:rakna' };
var BANK = null;
function byggBank(){
  var b = {};
  function lagg(nod, post){ (b[nod] = b[nod] || []).push(post); }
  Object.keys(BLAD).forEach(function(id){
    var flik = id.replace(/\d+$/, ''), niva = Number(id.slice(-1));
    var blad = BLAD[id](FRON[id]);
    (blad.grupper || []).forEach(function(g){
      (g.rader || []).forEach(function(r){
        var nod = NOD[flik], gemensamt = { niva: niva, stam: g.rubrik, blad: id };
        if(r.typ === 'uttryck' && r.svar)
          lagg(nod, Object.assign({ slag: 'uttryck', fraga: r.fraga, svar: r.svar, accept: (r.accept || []).slice() }, gemensamt));
        else if(r.typ === 'bild' && r.svarTyp === 'uttryck' && r.svar)
          lagg(nod, Object.assign({ slag: 'figur', fraga: r.fraga, svar: r.svar, accept: (r.accept || []).slice(), svg: r.svg || '' }, gemensamt));
        else if(r.typ === 'bild' && r.svarTyp === 'text' && r.svar)
          lagg(nod, Object.assign({ slag: 'ord', fraga: r.fraga, svar: r.svar, accept: (r.accept || []).slice(), svg: r.svg || '' }, gemensamt));
        else if(r.typ === 'enkel' && typeof r.svar === 'number')
          lagg(nod, Object.assign({ slag: 'varde', fraga: r.vansterText, svar: r.svar }, gemensamt));
        else if(r.typ === 'valruta' && r.alt && r.ratt && r.ratt.length === 1)
          lagg(nod, Object.assign({ slag: 'val', fraga: r.fraga, alt: r.alt.slice(), ratt: r.ratt[0] }, gemensamt));
        else if(r.typ === 'forenkla' && r.svar)
          lagg(nod, Object.assign({ slag: 'forenkla', fraga: r.fraga, svar: r.svar }, gemensamt));
        else if(r.typ === 'omkrets' && r.svar)
          lagg(nod, Object.assign({ slag: 'omkrets', fraga: 'Skriv ett uttryck för figurens omkrets', svar: r.svar, sidor: (r.sidor || []).slice(), svg: r.svg || '' }, gemensamt));
        else if(r.typ === 'flerled' && r.led && r.led.length)
          lagg(nod, Object.assign({ slag: 'flerled', fraga: r.vansterText, led: r.led.slice(),
                                    svar: r.led[r.led.length - 1].svar }, gemensamt));
        // pyramid, magisk, oppet, sidor → medvetet utanför banken
      });
    });
  });
  return b;
}
function talBank(nod, maxNiva){
  if(!BANK) BANK = byggBank();
  var lista = (BANK[String(nod)] || []).slice();
  return maxNiva ? lista.filter(function(p){ return p.niva <= maxNiva; }) : lista;
}

// Skalet hämtar bladen som DATA (ova: [{ blad: [...] }]) — modulen monterar inte själv.
function bygg(id){ var b = BLAD[id](FRON[id]); b.kanGenerera = true; b.genId = id; return b; }
function flikar(){
  return [
    { titel: 'Tolka uttryck',       mount: 'tolka',    blad: [{ titel: 'Blad 1', id: 'tolka1', data: bygg('tolka1') }, { titel: 'Blad 2', id: 'tolka2', data: bygg('tolka2') }] },
    { titel: 'Skriva uttryck',      mount: 'skriva',   blad: [{ titel: 'Blad 1', id: 'skriva1', data: bygg('skriva1') }, { titel: 'Blad 2', id: 'skriva2', data: bygg('skriva2') }, { titel: 'Blad 3', id: 'skriva3', data: bygg('skriva3') }] },
    { titel: 'Beräkna med uttryck', mount: 'berakna',  blad: [{ titel: 'Blad 1', id: 'berakna1', data: bygg('berakna1') }, { titel: 'Blad 2', id: 'berakna2', data: bygg('berakna2') }] },
    { titel: 'Förenkla uttryck',    mount: 'forenkla', blad: [{ titel: 'Blad 1', id: 'forenkla1', data: bygg('forenkla1') }, { titel: 'Blad 2', id: 'forenkla2', data: bygg('forenkla2') }, { titel: 'Blad 3', id: 'forenkla3', data: bygg('forenkla3') }] }
  ];
}

window.BLAD_AK8_ALG1 = { BLAD: BLAD, FRON: FRON, bygg: bygg, flikar: flikar, talBank: talBank, NOD: NOD };
})();
