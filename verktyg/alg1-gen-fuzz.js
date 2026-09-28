/* alg1-gen-fuzz.js — RÄKNINGEN I ÅTTANS ALGEBRAGENERATOR (order 2026-09-28).

   Varje typ som har ett facit räknas efterråt: mellanledskedjan måste ge sitt eget svar,
   pyramidens rutor måste vara summan av de två under, den magiska kvadratens rader, kolumner och
   diagonaler måste ha samma summa, sidorna måste ge sin omkrets, och priskedjans total måste
   stämma med delarna.

   KÖR:  node verktyg/alg1-gen-fuzz.js      Exit 1 vid räknefel. Ingen DOM, ingen nätväg. */
const G = require('../js/motor/blad/gen-ak8-alg1.js');
const r = G.rng(31415);

// koefficienten för en bokstav: "4a" → 4, "a" → 1, "−a" → −1, saknas → 0
function koef(s, bok){
  const t = String(s).replace(/−/g, '-');
  const m = t.match(new RegExp('(-?\\d*)' + bok + '(?![a-z])'));
  if(!m) return 0;
  return (m[1] === '' || m[1] === '-') ? Number(m[1] + '1') : Number(m[1]);
}
function konstant(s){
  const t = String(s).replace(/−/g, '-').replace(/-?\d*[a-z]/g, '');
  const m = t.match(/-?\d+/);
  return m ? Number(m[0]) : 0;
}

let fel = 0, n = 0, rapport = [];

// 1) flerled: första ledet uträknat ska bli sista ledets svar
for(let i = 0; i < 500; i++){
  const x = G.flerledRad(r, i % 2 ? 'en' : 'tva'); n++;
  const sista = x.led[x.led.length - 1].svar;
  const uttryck = x.led[0].accept.replace(/·/g, '*').replace(/−/g, '-');
  let v; try { v = eval(uttryck); } catch(e){ v = NaN; }
  if(!(Math.abs(v - sista) < 1e-9)){ fel++; if(rapport.length < 3) rapport.push('flerled: ' + x.uttryck + ' | ' + uttryck + ' = ' + v + ' men svar ' + sista); }
  // mellansteget ska också stämma
  const mellan = x.led[1].accept.replace(/·/g, '*').replace(/−/g, '-');
  let v2; try { v2 = eval(mellan); } catch(e){ v2 = NaN; }
  if(!(Math.abs(v2 - sista) < 1e-9)){ fel++; if(rapport.length < 3) rapport.push('flerled mellansteg: ' + mellan + ' = ' + v2 + ' men svar ' + sista); }
}

// 2) pyramid: varje ruta = summan av de två under, för BÅDA bokstäverna
for(let i = 0; i < 300; i++){
  const p = G.pyramidRad(r); n++;
  const bok = (String(p.botten[0]).match(/[a-z]/g) || ['x'])[0];
  const b = p.botten.map(c => koef(c, bok)), m = p.mitt.map(c => koef(c, bok)), t = koef(p.topp, bok);
  const bk = p.botten.map(konstant), mk = p.mitt.map(konstant), tk = konstant(p.topp);
  const ok = m[0] === b[0] + b[1] && m[1] === b[1] + b[2] && t === m[0] + m[1];
  const okK = mk[0] === bk[0] + bk[1] && mk[1] === bk[1] + bk[2] && tk === mk[0] + mk[1];
  if(!ok || !okK){ fel++; if(rapport.length < 3) rapport.push('pyramid: ' + JSON.stringify(p)); }
}

// 3) magisk kvadrat: samma summa på alla rader, kolumner och diagonaler
for(let i = 0; i < 300; i++){
  const q = G.magiskRad(r); n++;
  const bok = (String(q.rutor[0][0]).match(/[a-z]/g) || ['x'])[0];
  const K = q.rutor.map(rad => rad.map(c => koef(c, bok)));
  const summor = K.map(rad => rad.reduce((a, c) => a + c, 0))
    .concat([0, 1, 2].map(j => K.reduce((a, rad) => a + rad[j], 0)))
    .concat([K[0][0] + K[1][1] + K[2][2], K[0][2] + K[1][1] + K[2][0]]);
  if(new Set(summor).size !== 1){ fel++; if(rapport.length < 3) rapport.push('magisk: ' + JSON.stringify(summor)); }
}

// 4) sidor: de två sidorna ska ge den angivna omkretsen
for(let i = 0; i < 300; i++){
  const s = G.sidorRad(r); n++;
  const bok = (String(s.facit[0]).match(/[a-z]/g) || ['x'])[0];
  const omk = 2 * koef(s.facit[0], bok), omkK = 2 * Number(s.facit[1]);
  if(koef(s.omkrets, bok) !== omk || konstant(s.omkrets) !== omkK){ fel++; if(rapport.length < 3) rapport.push('sidor: ' + s.omkrets + ' mot ' + s.facit.join(' och ')); }
}

// 5) omkrets ur figur: sidorna summerade ska ge facit
for(let i = 0; i < 300; i++){
  const o = G.omkretsForenklaRad(r); n++;
  const bok = (String(o.sidor[0]).match(/[a-z]/g) || ['x'])[0];
  const sumV = o.sidor.reduce((a, c) => a + koef(c, bok), 0);
  const sumK = o.sidor.reduce((a, c) => a + (/[a-z]/.test(c) ? 0 : Number(c)), 0);
  if(koef(o.svar, bok) !== sumV || konstant(o.svar) !== sumK){ fel++; if(rapport.length < 3) rapport.push('omkrets: [' + o.sidor.join(',') + '] → ' + o.svar); }
}

// 6) prisKedja: totalen ska stämma med de tre delarna
for(let i = 0; i < 300; i++){
  const p = G.prisKedjaGrupp(r); n++;
  const vantat = 3 * p.varde + p.mer[0] + p.mer[1];
  if(p.rader[3].svar !== vantat){ fel++; if(rapport.length < 3) rapport.push('prisKedja: ' + p.rader[3].svar + ' mot ' + vantat); }
}

console.log('\nKONTROLL av de nya typerna: ' + n + ' dragningar · ' + fel + ' räknefel');
rapport.forEach(x => console.log('   ' + x));

process.exit(fel ? 1 : 0);
