/* FAMILJ D · EKVATIONSMOTOR (balansmetoden) — ak7/k3/d4-ekvationer.

   Kedjan: eleven skriver en ny rad i taget, raderna staplas med likhetstecknen under varandra och
   lösningen växer nedåt. Varje rad prövas mot den föregående (samma lösning), och sista raden ska
   vara variabeln ensam i vänsterledet.

   TVÅ LÄGEN (order 2026-09-23) — styrs av var kedjan monteras, inte av uppgiften:
     'utskriven'  EKVATIONSKAPITLET. Varje operation skrivs ut på båda sidor och utförs på nästa
                  rad: 2x + 4 = 12 · 2x + 4 − 4 = 12 − 4 · 2x = 8 · 2x/2 = 8/2 · x = 4.
                  Metoden lärs in här och kommunikationen är poängen → TVÅ rader per operation.
     'kort'       PROBLEMLÖSNINGEN. Eleven har redan tränat och får kapa mellanled — men aldrig
                  under vad kommunikationen kräver → EN rad per operation.
   Kravet räknas i EkvParser.minstaAntalRader (delad regel, ett ställe).

   OMKASTNING: den största x-koefficienten hör hemma i vänsterledet, men det är TILLÅTET, INTE
   KRÄVT. Räknar eleven vidare direkt och hamnar på −8 = −2x är det en giltig väg; hon dividerar och
   skriver x = 4 sist. Rättaren godkänner den. Ledtråden hör till färdighetsträningen, inte hit.

   Parsern ligger i ekv-parser.js (delad med problemlösningens rättare), laddas FÖRE denna fil. */

// ── Parsern: DELAD (js/motor/ekvationer-balans/ekv-parser.js) ──
var _EP = (typeof window !== 'undefined' && window.EkvParser) || null;
var parseSida     = function(s){ return _EP ? _EP.parseSida(s) : null; };
var parseEkvation = function(vl, hl){ return _EP ? _EP.parseEkvation(vl, hl) : null; };
var sammaLosning  = function(a, b){ return _EP ? _EP.sammaLosning(a, b) : false; };
var harUnikLosning= function(e){ return _EP ? _EP.harUnikLosning(e) : false; };
var losningAv     = function(e){ return _EP ? _EP.losningAv(e) : NaN; };
function snygg(tal){ var r = Math.round(tal * 1e6) / 1e6; return String(r).replace('.', ','); }

// ELEVTEXT som fält (elevtext-låset ser fältnamnen).
var EKV_TEXT = {
  klar:      { titel: '✓ Löst!' },
  nyRad:     { titel: '+ Ny rad' },
  ganger:    { titel: 'Gånger' },
  brak:      { titel: 'Bråk' },
  kontroll:  { titel: 'Kontrollera' },
  omstart:   { titel: 'Börja om' },
  allaRatt:  { hint: 'Alla ekvationer lösta och rätt uppställda.' },
  pagang:    { hint: 'De ifyllda raderna stämmer. Fortsätt tills variabeln står ensam i vänsterledet.' },
  fel:       { hint: 'Någon rad har inte samma värde på båda sidor – den är rödmarkerad.' },
  forFa:     { hint: 'Skriv ut varje steg: först operationen i båda leden, sedan resultatet.' }
};

// ── UPPGIFTERNA: trappan i tre steg (order 2026-09-23) ────────────────────────────────────────
// visaVL/visaHL = hur uppgiften SKRIVS ut (BRAK:t:n ger stående bråk). vl/hl = samma sak för parsern.
var STEG = [
  { id: 'steg1', mount: 'steg1', titel: 'En operation', nod: 'alg-ekv-ensidig:rakna',
    uppg: [
      { vl:'x+5',     hl:'12', visaVL:'<span class="x">x</span> + 5',      visaHL:'12' },
      { vl:'x-5',     hl:'12', visaVL:'<span class="x">x</span> &minus; 5', visaHL:'12' },
      { vl:'2x',      hl:'5',  visaVL:'2<span class="x">x</span>',          visaHL:'5' },
      { vl:'(x)/(2)', hl:'12', visaVL:'BRAK:x:2',                           visaHL:'12' },
      { vl:'x-12',    hl:'5',  visaVL:'<span class="x">x</span> &minus; 12', visaHL:'5' },
      { vl:'4x',      hl:'32', visaVL:'4<span class="x">x</span>',           visaHL:'32' }
    ] },
  { id: 'steg2', mount: 'steg2', titel: 'Två operationer', nod: 'alg-ekv-ensidig:rakna',
    uppg: [
      { vl:'2x+4',      hl:'12', visaVL:'2<span class="x">x</span> + 4',      visaHL:'12' },
      { vl:'2x-4',      hl:'12', visaVL:'2<span class="x">x</span> &minus; 4', visaHL:'12' },
      { vl:'(y)/(2)-3', hl:'12', visaVL:'BRAK:y:2 &minus; 3',                  visaHL:'12', variabel:'y' },
      { vl:'(y)/(3)+4', hl:'12', visaVL:'BRAK:y:3 + 4',                        visaHL:'12', variabel:'y' },
      { vl:'5x+3',      hl:'18', visaVL:'5<span class="x">x</span> + 3',       visaHL:'18' },
      { vl:'6x-4',      hl:'32', visaVL:'6<span class="x">x</span> &minus; 4', visaHL:'32' }
    ] },
  { id: 'steg3', mount: 'steg3', titel: 'Variabel i båda leden', nod: 'alg-ekv-badaled:rakna',
    uppg: [
      { vl:'5x+4',  hl:'7x-8',   visaVL:'5<span class="x">x</span> + 4',       visaHL:'7<span class="x">x</span> &minus; 8' },
      { vl:'3x+5',  hl:'x+11',   visaVL:'3<span class="x">x</span> + 5',       visaHL:'<span class="x">x</span> + 11' },
      { vl:'5x-3',  hl:'3x+11',  visaVL:'5<span class="x">x</span> &minus; 3', visaHL:'3<span class="x">x</span> + 11' },
      { vl:'7x+12', hl:'3x+24',  visaVL:'7<span class="x">x</span> + 12',      visaHL:'3<span class="x">x</span> + 24' },
      { vl:'5+x',   hl:'17-3x',  visaVL:'5 + <span class="x">x</span>',        visaHL:'17 &minus; 3<span class="x">x</span>' },
      { vl:'30-4x', hl:'15-x',   visaVL:'30 &minus; 4<span class="x">x</span>', visaHL:'15 &minus; <span class="x">x</span>' }
    ] }
];

var LAGE = 'utskriven';          // ekvationskapitlets läge: varje operation skrivs ut på båda sidor
var uppgifter = [], aktivtFalt = null;

function autoStorlek(inp){ var len = (inp.value || '').length; inp.setAttribute('size', Math.max(3, len + 1)); }
function skapaTextSeg(vars){
  var inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'seg-text'; inp.setAttribute('inputmode', 'text'); inp.setAttribute('data-kp', 'fri');
  inp.setAttribute('data-vars', vars || 'xy');          // keypadens bokstäver: uppgiftens variabel
  inp.setAttribute('aria-label', 'rad i lösningen');    // namnger rutan, ger inget exempel
  autoStorlek(inp);
  inp.addEventListener('focus', function(){ aktivtFalt = inp; });
  inp.addEventListener('input', function(){ autoStorlek(inp); });
  inp.addEventListener('keydown', function(e){ tangent(e, inp); });
  return inp;
}
function skapaBrakSeg(vars){
  var w = document.createElement('span'); w.className = 'seg-brak';
  var t = document.createElement('input'), s = document.createElement('span'), n = document.createElement('input');
  [t, n].forEach(function(inp, i){
    inp.type = 'text'; inp.className = 'brak-tal'; inp.setAttribute('inputmode', 'text'); inp.setAttribute('data-kp', 'fri');
    inp.setAttribute('data-vars', vars || 'xy');
    inp.setAttribute('aria-label', i === 0 ? 'täljare' : 'nämnare');
    autoStorlek(inp);
    inp.addEventListener('focus', function(){ aktivtFalt = inp; });
    inp.addEventListener('input', function(){ autoStorlek(inp); });
    inp.addEventListener('keydown', function(e){ tangent(e, inp); });
  });
  s.className = 'brak-streck';
  w.appendChild(t); w.appendChild(s); w.appendChild(n);
  w._tIn = t; w._nIn = n; return w;
}
function tangent(e, inp){
  if(e.key === 'Enter'){ e.preventDefault(); var u = uppFor(inp); if(u) nyRad(u); return; }
}
function uppFor(inp){
  var g = inp.closest('.eq-grid');
  for(var i = 0; i < uppgifter.length; i++) if(uppgifter[i].grid === g) return uppgifter[i];
  return null;
}
function nyRad(upp){
  var grid = upp.grid;
  var vlWrap = document.createElement('div'); vlWrap.className = 'eq-vl';
  var vlSida = document.createElement('div'); vlSida.className = 'sida sida-vl'; vlSida.appendChild(skapaTextSeg(upp.vars)); vlWrap.appendChild(vlSida);
  var eqWrap = document.createElement('div'); eqWrap.className = 'eq-eq'; eqWrap.textContent = '=';
  var hlWrap = document.createElement('div'); hlWrap.className = 'eq-hl';
  var hlSida = document.createElement('div'); hlSida.className = 'sida sida-hl'; hlSida.appendChild(skapaTextSeg(upp.vars)); hlWrap.appendChild(hlSida);
  var status = document.createElement('div'); status.className = 'eq-status';
  grid.appendChild(vlWrap); grid.appendChild(eqWrap); grid.appendChild(hlWrap); grid.appendChild(status);
  var rad = { vlSida: vlSida, hlSida: hlSida, status: status, vlWrap: vlWrap, hlWrap: hlWrap };
  upp.rader.push(rad);
  [vlSida, hlSida].forEach(function(s){ s.addEventListener('input', function(){ rensaFarg(rad); }); });
  var f = vlSida.querySelector('.seg-text'); if(f){ f.focus(); aktivtFalt = f; }
  return rad;
}
function rensaFarg(rad){
  rad.vlWrap.classList.remove('rad-ok', 'rad-fel'); rad.hlWrap.classList.remove('rad-ok', 'rad-fel');
  rad.status.textContent = ''; rad.status.style.color = '';
}
function infogaTecken(upp, tecken){
  if(!aktivtFalt || aktivtFalt.closest('.eq-grid') !== upp.grid){
    var sr = upp.rader[upp.rader.length - 1]; aktivtFalt = sr.vlSida.querySelector('.seg-text');
  }
  if(!aktivtFalt) return;
  var inp = aktivtFalt, start = inp.selectionStart, end = inp.selectionEnd;
  if(typeof start === 'number'){
    inp.value = inp.value.slice(0, start) + tecken + inp.value.slice(end);
    inp.selectionStart = inp.selectionEnd = start + tecken.length;
  } else inp.value += tecken;
  autoStorlek(inp); inp.focus();
}
function infogaBrakI(upp){
  if(!aktivtFalt || aktivtFalt.closest('.eq-grid') !== upp.grid){
    var sr = upp.rader[upp.rader.length - 1]; aktivtFalt = sr.vlSida.querySelector('.seg-text');
  }
  if(!aktivtFalt) return;
  var sida = aktivtFalt.closest('.sida'); if(!sida) return;
  var brak = skapaBrakSeg(upp.vars), nyText = skapaTextSeg(upp.vars);
  if(aktivtFalt.nextSibling){ sida.insertBefore(brak, aktivtFalt.nextSibling); sida.insertBefore(nyText, brak.nextSibling); }
  else { sida.appendChild(brak); sida.appendChild(nyText); }
  brak._tIn.focus(); aktivtFalt = brak._tIn;
}
function lasSida(sidaEl){
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
function arLost(vl, hl){ return _EP ? _EP.arLost(vl, hl) : false; }

// ── RÄTTNING ──────────────────────────────────────────────────────────────────────────────────
// Raderna prövas mot uppgiftens ekvation och mot varandra; sista raden ska vara variabeln ensam i
// vänsterledet. Antalet rader räknas med UPPGIFTENS rad (den står tryckt ovanför elevens rader).
function kontrolleraUppg(upp){
  var forra = upp.startEkv, allaOk = true, nadde = false, hade = false, antal = 1;
  for(var i = 0; i < upp.rader.length; i++){
    var rad = upp.rader[i], vl = lasSida(rad.vlSida), hl = lasSida(rad.hlSida);
    rensaFarg(rad);
    if(vl === '' && hl === '') continue;
    hade = true; antal++;
    var e = parseEkvation(vl, hl);
    if(!e || !sammaLosning(forra, e)){
      rad.vlWrap.classList.add('rad-fel'); rad.hlWrap.classList.add('rad-fel');
      rad.status.textContent = '✗'; rad.status.style.color = 'var(--red)';
      allaOk = false; break;
    }
    rad.vlWrap.classList.add('rad-ok'); rad.hlWrap.classList.add('rad-ok');
    rad.status.textContent = '✓'; rad.status.style.color = 'var(--green)';
    forra = e;
    if(harUnikLosning(e) && arLost(vl, hl)) nadde = true;
  }
  // Kravet på antal rader: läget avgör (utskrivet = två rader per operation).
  var krav = _EP ? _EP.minstaAntalRader(upp.vl, upp.hl, { lage: LAGE }) : null;
  var forFa = nadde && krav != null && antal < krav;
  if(forFa){
    var sistRad = upp.rader.filter(function(r){ return lasSida(r.vlSida) !== '' || lasSida(r.hlSida) !== ''; }).pop();
    if(sistRad){
      sistRad.vlWrap.classList.remove('rad-ok'); sistRad.hlWrap.classList.remove('rad-ok');
      sistRad.vlWrap.classList.add('rad-fel'); sistRad.hlWrap.classList.add('rad-fel');
      sistRad.status.textContent = '✗'; sistRad.status.style.color = 'var(--red)';
    }
  }
  var klar = allaOk && nadde && !forFa;
  upp.klarEl.classList.toggle('show', klar);
  upp.forFaEl.classList.toggle('show', !!forFa);
  return { ok: allaOk && !forFa, klar: klar, hade: hade, forFa: forFa, krav: krav };
}

// ── RENDERING: ett steg per öva-blad ──────────────────────────────────────────────────────────
function brakHTML(taljare, namnare){
  return '<span class="seg-brak" style="font-size:19px;"><span style="font-style:italic;">' + taljare +
         '</span><span class="brak-streck" style="min-width:20px;"></span><span>' + namnare + '</span></span>';
}
function visaSida(spec){
  if(!spec) return spec;
  if(spec.indexOf('BRAK:') === 0 && spec.indexOf(' ') === -1){
    var d = spec.split(':');
    var html = brakHTML(d[1], d[2]);
    if(d[3]) html += '<span style="margin-left:5px;">' + d[3].replace('+', ' + ').replace('-', ' &minus; ') + '</span>';
    return html;
  }
  return spec.replace(/BRAK:([^:\s]+):([^:\s]+)/g, function(m, t, n){ return brakHTML(t, n); });
}

function renderSteg(mount, steg){
  mount.innerHTML = '';
  var kort = document.createElement('div'); kort.className = 'eq-kort';
  var rub = document.createElement('div'); rub.className = 'niva-rubrik'; rub.textContent = steg.titel;
  kort.appendChild(rub);

  steg.uppg.forEach(function(u, idx){
    var block = document.createElement('div'); block.className = 'uppgift';
    block.setAttribute('data-nod', steg.nod);
    var et = document.createElement('div'); et.className = 'uppg-etikett'; et.textContent = String.fromCharCode(97 + idx) + ')';
    block.appendChild(et);
    var grid = document.createElement('div'); grid.className = 'eq-grid'; block.appendChild(grid);
    var uvl = document.createElement('div'); uvl.className = 'eq-uppg-vl'; uvl.innerHTML = visaSida(u.visaVL);
    var ueq = document.createElement('div'); ueq.className = 'eq-uppg-eq'; ueq.textContent = '=';
    var uhl = document.createElement('div'); uhl.className = 'eq-uppg-hl'; uhl.innerHTML = visaSida(u.visaHL);
    var usp = document.createElement('div');
    grid.appendChild(uvl); grid.appendChild(ueq); grid.appendChild(uhl); grid.appendChild(usp);

    var upp = { grid: grid, startEkv: parseEkvation(u.vl, u.hl), vl: u.vl, hl: u.hl,
                vars: u.variabel || 'x', rader: [], klarEl: null, forFaEl: null, steg: steg.id };
    uppgifter.push(upp);

    var vt = document.createElement('div'); vt.className = 'uppg-verktyg';
    var nyB = document.createElement('button'); nyB.type = 'button'; nyB.className = 'mini-btn'; nyB.textContent = EKV_TEXT.nyRad.titel;
    nyB.onclick = function(){ nyRad(upp); };
    var gangB = document.createElement('button'); gangB.type = 'button'; gangB.className = 'mini-btn';
    gangB.innerHTML = '<span style="font-size:18px;font-weight:700;line-height:1;">·</span> ' + EKV_TEXT.ganger.titel;
    gangB.onclick = function(){ infogaTecken(upp, '·'); };
    var brB = document.createElement('button'); brB.type = 'button'; brB.className = 'mini-btn';
    brB.innerHTML = '<span class="mini-brak"><span>▢</span><span class="mini-streck"></span><span>▢</span></span> ' + EKV_TEXT.brak.titel;
    brB.onclick = function(){ infogaBrakI(upp); };
    vt.appendChild(nyB); vt.appendChild(gangB); vt.appendChild(brB); block.appendChild(vt);

    var klar = document.createElement('div'); klar.className = 'uppg-klar'; klar.textContent = EKV_TEXT.klar.titel;
    upp.klarEl = klar; block.appendChild(klar);
    var forFa = document.createElement('div'); forFa.className = 'uppg-forfa'; forFa.textContent = EKV_TEXT.forFa.hint;
    upp.forFaEl = forFa; block.appendChild(forFa);

    kort.appendChild(block);
    nyRad(upp);
  });

  var actions = document.createElement('div'); actions.className = 'actions';
  var kn = document.createElement('button'); kn.type = 'button'; kn.className = 'btn primary'; kn.textContent = EKV_TEXT.kontroll.titel;
  var rn = document.createElement('button'); rn.type = 'button'; rn.className = 'btn subtle'; rn.textContent = EKV_TEXT.omstart.titel;
  var hint = document.createElement('div'); hint.className = 'global-hint';
  kn.onclick = function(){ kontrollera(steg, hint); };
  rn.onclick = function(){ uppgifter = uppgifter.filter(function(x){ return x.steg !== steg.id; }); renderSteg(mount, steg); };
  actions.appendChild(kn); actions.appendChild(rn);
  kort.appendChild(actions); kort.appendChild(hint);
  mount.appendChild(kort);
}

function kontrollera(steg, hintEl){
  var mina = uppgifter.filter(function(u){ return u.steg === steg.id; });
  var klar = 0, fel = 0, forFa = 0;
  mina.forEach(function(u){
    var r = kontrolleraUppg(u);
    if(r.klar) klar++; else if(r.forFa) forFa++; else if(!r.ok) fel++;
  });
  if(fel){ hintEl.className = 'global-hint fel'; hintEl.textContent = EKV_TEXT.fel.hint; }
  else if(forFa){ hintEl.className = 'global-hint fel'; hintEl.textContent = EKV_TEXT.forFa.hint; }
  else if(klar === mina.length){ hintEl.className = 'global-hint ok'; hintEl.textContent = EKV_TEXT.allaRatt.hint; }
  else { hintEl.className = 'global-hint ok'; hintEl.textContent = EKV_TEXT.pagang.hint; }
}

// ── MONTERING: ett steg per öva-blad (#sheet-steg1 …). Skalet äger flikar och bladnavigering. ──
(function(){
  STEG.forEach(function(steg){
    var mount = document.getElementById('sheet-' + steg.mount);
    if(mount) renderSteg(mount, steg);
  });
})();

// Delad AK8_UI-keypad (fixed nedtill, följer fokus). Fälten är data-kp="fri" → operatorer aktiva,
// data-vars säger vilka bokstäver som gäller i uppgiften.
(function(){
  if(!(window.AK8_UI && AK8_UI.keypadHTML) || document.getElementById('ekv-keypad')) return;
  var w = document.createElement('div'); w.innerHTML = AK8_UI.keypadHTML({ vars: 'xy' });
  var kp = w.firstChild; if(!kp) return;
  kp.id = 'ekv-keypad'; document.body.appendChild(kp);
  AK8_UI.bindKeypad(document.body);
})();

if(typeof window !== 'undefined') window.EkvKedja = { STEG: STEG, renderSteg: renderSteg, uppgifter: function(){ return uppgifter; }, lage: function(l){ if(l) LAGE = l; return LAGE; } };
