/* ekv-kedja.js — KEDJANS RAD-UI som delad komponent (order 2026-09-23).

   En rad i en lösning: [vänsterled] = [högerled] [status], i ett rutnät som håller likhetstecknen
   under varandra. Raderna staplas och lösningen växer nedåt.

   Används av BÅDA ytorna — ekvationskapitlets blad (d4) och problemlösningens blad (d5) — så att
   raden ser likadan ut och beter sig likadant på båda. Läget (hur många rader som krävs) är inte
   radens sak; det avgörs av EkvParser.minstaAntalRader där kedjan monteras.

   RUTNÄTET: den som monterar äger .eq-grid (4 kolumner: VL · = · HL · status). rad() lägger fyra
   celler i det gridet. Etiketter och knappar läggs som egna celler som spänner alla fyra kolumner.

   Ingen text i rutorna: inga placeholders. aria-label namnger rutan, den ger inget exempel. */
(function(){
'use strict';

var aktivtFalt = null;

function autoStorlek(inp){ inp.setAttribute('size', Math.max(3, (inp.value || '').length + 1)); }

function textSeg(opts){
  opts = opts || {};
  var inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'seg-text';
  inp.setAttribute('inputmode', 'text'); inp.setAttribute('data-kp', 'fri');
  inp.setAttribute('data-vars', opts.vars || 'xy');
  inp.setAttribute('aria-label', opts.etikett || 'rad i lösningen');
  autoStorlek(inp);
  inp.addEventListener('focus', function(){ aktivtFalt = inp; });
  inp.addEventListener('input', function(){ autoStorlek(inp); });
  if(opts.onEnter) inp.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); opts.onEnter(); } });
  return inp;
}

function brakSeg(opts){
  opts = opts || {};
  var w = document.createElement('span'); w.className = 'seg-brak';
  var t = document.createElement('input'), streck = document.createElement('span'), n = document.createElement('input');
  [t, n].forEach(function(inp, i){
    inp.type = 'text'; inp.className = 'brak-tal';
    inp.setAttribute('inputmode', 'text'); inp.setAttribute('data-kp', 'fri');
    inp.setAttribute('data-vars', opts.vars || 'xy');
    inp.setAttribute('aria-label', i === 0 ? 'täljare' : 'nämnare');
    autoStorlek(inp);
    inp.addEventListener('focus', function(){ aktivtFalt = inp; });
    inp.addEventListener('input', function(){ autoStorlek(inp); });
    if(opts.onEnter) inp.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); opts.onEnter(); } });
  });
  streck.className = 'brak-streck';
  w.appendChild(t); w.appendChild(streck); w.appendChild(n);
  w._tIn = t; w._nIn = n;
  return w;
}

// En rad i gridet. Returnerar { vlSida, hlSida, status, vlWrap, hlWrap, fokus() }.
function rad(grid, opts){
  opts = opts || {};
  var vlWrap = document.createElement('div'); vlWrap.className = 'eq-vl';
  var vlSida = document.createElement('div'); vlSida.className = 'sida sida-vl';
  vlSida.appendChild(textSeg(opts)); vlWrap.appendChild(vlSida);
  var eqWrap = document.createElement('div'); eqWrap.className = 'eq-eq'; eqWrap.textContent = '=';
  var hlWrap = document.createElement('div'); hlWrap.className = 'eq-hl';
  var hlSida = document.createElement('div'); hlSida.className = 'sida sida-hl';
  hlSida.appendChild(textSeg(opts)); hlWrap.appendChild(hlSida);
  var status = document.createElement('div'); status.className = 'eq-status';
  grid.appendChild(vlWrap); grid.appendChild(eqWrap); grid.appendChild(hlWrap); grid.appendChild(status);
  var r = { vlSida: vlSida, hlSida: hlSida, status: status, vlWrap: vlWrap, hlWrap: hlWrap,
            fokus: function(){ var f = vlSida.querySelector('.seg-text'); if(f){ f.focus(); aktivtFalt = f; } } };
  [vlSida, hlSida].forEach(function(s){ s.addEventListener('input', function(){ rensa(r); }); });
  return r;
}

// En cell som spänner hela rutnätet (etikett, knapprad, svarsrad).
function helRad(grid, klass){
  var d = document.createElement('div'); d.className = klass || 'eq-helrad';
  d.style.gridColumn = '1 / -1';
  grid.appendChild(d);
  return d;
}

function rensa(r){
  r.vlWrap.classList.remove('rad-ok', 'rad-fel'); r.hlWrap.classList.remove('rad-ok', 'rad-fel');
  r.status.textContent = ''; r.status.style.color = '';
}
function markera(r, ok){
  rensa(r);
  r.vlWrap.classList.add(ok ? 'rad-ok' : 'rad-fel'); r.hlWrap.classList.add(ok ? 'rad-ok' : 'rad-fel');
  r.status.textContent = ok ? '✓' : '✗';
  r.status.style.color = ok ? 'var(--green)' : 'var(--red)';
}

// Läser en sida: textsegment och bråksegment i ordning → "(t)/(n)" för bråken.
function las(sidaEl){
  var bitar = [];
  Array.prototype.forEach.call(sidaEl.childNodes, function(node){
    if(node.classList && node.classList.contains('seg-text')){ if(node.value.trim() !== '') bitar.push(node.value.trim()); }
    else if(node.classList && node.classList.contains('seg-brak')){
      var t = node._tIn.value.trim(), n = node._nIn.value.trim();
      if(t !== '' || n !== '') bitar.push('(' + (t || '0') + ')/(' + (n || '1') + ')');
    }
  });
  return bitar.join('');
}
function radPar(r){ return { vl: las(r.vlSida), hl: las(r.hlSida) }; }
function tomRad(r){ var p = radPar(r); return p.vl === '' && p.hl === ''; }

// Keypad-hjälpare: skriv i det senast fokuserade fältet inom en viss rot.
function aktivInom(rot){
  if(aktivtFalt && rot.contains(aktivtFalt)) return aktivtFalt;
  var f = rot.querySelector('.seg-text'); if(f) aktivtFalt = f;
  return aktivtFalt;
}
function infogaTecken(rot, tecken){
  var inp = aktivInom(rot); if(!inp) return;
  var start = inp.selectionStart, end = inp.selectionEnd;
  if(typeof start === 'number'){
    inp.value = inp.value.slice(0, start) + tecken + inp.value.slice(end);
    inp.selectionStart = inp.selectionEnd = start + tecken.length;
  } else inp.value += tecken;
  autoStorlek(inp); inp.focus();
}
function infogaBrak(rot, opts){
  var inp = aktivInom(rot); if(!inp) return;
  var sida = inp.closest('.sida'); if(!sida) return;
  var brak = brakSeg(opts), nyText = textSeg(opts);
  if(inp.nextSibling){ sida.insertBefore(brak, inp.nextSibling); sida.insertBefore(nyText, brak.nextSibling); }
  else { sida.appendChild(brak); sida.appendChild(nyText); }
  brak._tIn.focus(); aktivtFalt = brak._tIn;
}

var API = { rad: rad, helRad: helRad, rensa: rensa, markera: markera, las: las, radPar: radPar,
            tomRad: tomRad, textSeg: textSeg, brakSeg: brakSeg, infogaTecken: infogaTecken,
            infogaBrak: infogaBrak, autoStorlek: autoStorlek };
if(typeof window !== 'undefined') window.EkvKedja = API;
if(typeof module !== 'undefined' && module.exports) module.exports = API;
})();
