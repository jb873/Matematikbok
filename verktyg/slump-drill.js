/* slump-drill.js — DRILLYTANS probe för V10:s slumpkvalitetsfuzz.
 *
 * Provsidans generatorer fångas via ProvbyggarMotor.montera i slump-fuzz.js. Drillarna är den
 * ANDRA ytan med samma regel, och den har länge saknat mätning: en drill vars slump går att
 * gissa på mönster lär eleven spela mönstret i stället för att räkna.
 *
 * Ingen ny fuzz — samma tre prov (runs, autokorrelation lag 1–3, upprepningsöverskott), samma
 * statistik-sträng, bara en ny yta. Statistiken skickas in utifrån så att de två ytorna mäter
 * med SAMMA prov; en kopia hade drivit isär.
 *
 * BÅDA drillytorna enumereras ur sidans eget beteende, aldrig ur en handskriven lista:
 *
 *   A  window.gen*   drillmodulernas generatorer RETURNERAR en uppgift. Proben skannar window
 *                    efter nycklar som matchar /^gen[A-Z]/ och är funktioner. Varje numeriskt
 *                    fält blir en egen serie — en drift i en operand syns även om svaret ser
 *                    jämnt ut.
 *   B  OVNING_RENDERS / K2_DRILL   sjuans k1- och k2-drillar genererar INLINE i renderaren och
 *                    returnerar ingenting. Där renderas drillen om i en lös box och talet läses
 *                    ur FRÅGAN — kortets text minus rubrik, underrubrik, poängrad, svarsrad och
 *                    keypad. Registren är `const` på skriptnivå, inte på window, så de nås med
 *                    eval i sidans globala skop.
 *
 * Generatorer utan tal (figur- och ordgeneratorer) kan inte runs-testas. De skrivs ut som
 * DOKUMENTERAD GRÄNS — tyst hoppade vore ett mäthål, inte en gräns.
 */
'use strict';

function probe(STATISTIK, N, SABBA) {
  return '(function(){\n'
    + '  var N = ' + N + ', SABBA = ' + JSON.stringify(SABBA) + ';\n'
    + STATISTIK + '\n'
    + '  var ut = { gen: [], renderare: [], utanTal: [] };\n'
    + '  function sabba(x){\n'
    + '    if(SABBA === "drift") return x.map(function(v, j){ return v + j * 0.5; });\n'
    + '    if(SABBA === "lag1"){ var y = x.slice(); for(var i = 1; i < y.length; i += 2) y[i] = y[i-1]; return y; }\n'
    + '    if(SABBA === "klump"){ var z = x.slice(); for(var k = 0; k < z.length; k++) if(k % 10 < 3) z[k] = 7; return z; }\n'
    + '    return x;\n'
    + '  }\n'
    + '  function prov(x){ return { distinkt: (function(){ var d={}; x.forEach(function(v){ d[v]=1; }); return Object.keys(d).length; })(), runs: runs(x), l1: autokorr(x, 1), l2: autokorr(x, 2), l3: autokorr(x, 3), upp: upprep(x) }; }\n'
    // ── YTA A ──────────────────────────────────────────────────────────────────────────────
    + '  var genNamn = Object.keys(window).filter(function(k){ return /^gen[A-Z]/.test(k) && typeof window[k] === "function"; }).sort();\n'
    /* NIVÅN HÅLLS FAST per serie. Första försöket cyklade nivån (i % 3) + 1 och injicerade då en
       period-3-struktur i varje serie: genAddTask föll på lag3 med z = 12,5, vilket var MITT
       provs mönster och inte drillens. En drill körs dessutom på en nivå i taget, så fast nivå
       är också det läge eleven möter. Varje nivå blir en egen serie. */
    + '  genNamn.forEach(function(namn){\n'
    + '    [1, 2, 3].forEach(function(niva){ matGen(namn, niva); });\n'
    + '  });\n'
    + '  function matGen(namn, NIVA){\n'
    + '    var serier = {}, kast = null, n = 0;\n'
    + '    for(var i = 0; i < N; i++){\n'
    // Generatorerna har olika anropsform: vissa tar en nivå, vissa en rng, vissa inget. Proben
    // provar formerna i tur och ordning. Går ingen av dem är det PROBENS gräns, inte drillens
    // fel — därför hamnar den i utanTal och inte bland brotten. Första försöket rapporterade
    // "rng is not a function" som ett drill-fel, vilket var mitt fel klätt i drillens namn.
    + '      var r = null, former = [[NIVA], [], [Math.random], [NIVA, Math.random]];\n'
    + '      for(var fi = 0; fi < former.length && r === null; fi++){\n'
    + '        try { r = window[namn].apply(null, former[fi]); } catch(e){ kast = String(e.message || e).slice(0, 70); }\n'
    + '      }\n'
    + '      if(r !== null) kast = null; else break;\n'
    + '      if(!r || typeof r !== "object") continue;\n'
    + '      n++;\n'
    + '      Object.keys(r).forEach(function(k){\n'
    + '        var v = r[k];\n'
    + '        if(typeof v !== "number" || !isFinite(v)) return;\n'
    + '        (serier[k] = serier[k] || []).push(v);\n'
    + '      });\n'
    + '    }\n'
    + '    if(kast){ ut.utanTal.push(namn + " (gen · ingen av probens anropsformer fungerade: " + kast + ")"); return; }\n'
    // Ett fält är en serie först om det var numeriskt i minst 90 % av dragningarna: ett fält som
    // bara dyker upp ibland ger en serie med hål, och hål är inte en följd.
    + '    var falt = Object.keys(serier).filter(function(k){ return serier[k].length >= 0.9 * n && serier[k].length >= 100; });\n'
    + '    if(!falt.length){ ut.utanTal.push(namn + " nivå " + NIVA + " (gen · " + n + " dragningar · inget numeriskt fält)"); return; }\n'
    + '    var post = { namn: namn + " nivå " + NIVA, n: n, falt: {} };\n'
    // Samma regel som på renderar-ytan: en nära konstant serie är ingen följd att pröva.
    + '    falt.forEach(function(k){\n'
    + '      var pk = prov(sabba(serier[k]));\n'
    + '      if(pk.distinkt < 5){ ut.utanTal.push(namn + " nivå " + NIVA + " fält " + k + " (" + pk.distinkt + " distinkta värden — ingen följd att pröva)"); return; }\n'
    + '      post.falt[k] = pk;\n'
    + '    });\n'
    + '    if(Object.keys(post.falt).length) ut.gen.push(post);\n'
    + '    else ut.utanTal.push(namn + " nivå " + NIVA + " (inget fält med varierande följd)");\n'
    + '  }\n'
    // ── YTA B ──────────────────────────────────────────────────────────────────────────────
    + '  function register(){\n'
    + '    var reg = [];\n'
    + '    [["OVNING_RENDERS", "k1"], ["K2_DRILL", "k2"]].forEach(function(par){\n'
    + '      var R = null; try { R = eval(par[0]); } catch(e){ return; }\n'
    + '      if(!R || typeof R !== "object") return;\n'
    + '      Object.keys(R).forEach(function(ko){\n'
    + '        var v = R[ko];\n'
    + '        if(typeof v === "function"){ reg.push({ namn: par[1] + ":" + ko, fn: v }); return; }\n'
    + '        if(v && typeof v === "object") Object.keys(v).forEach(function(f){\n'
    + '          if(typeof v[f] === "function") reg.push({ namn: par[1] + ":" + ko + "/" + f, fn: v[f] });\n'
    + '        });\n'
    + '      });\n'
    + '    });\n'
    + '    return reg;\n'
    + '  }\n'
    + '  function fragaTal(box){\n'
    + '    var k = box.cloneNode(true);\n'
    + '    [".exercise-header", ".fc-scorebar", ".keypad", ".difficulty-badge", ".rakna-svar-rad",\n'
    + '     ".ovn-kontroll-rad", ".exercise-sub", ".exercise-title"].forEach(function(sel){\n'
    + '      Array.prototype.forEach.call(k.querySelectorAll(sel), function(e){ e.remove(); });\n'
    + '    });\n'
    + '    var m = (k.textContent || "").replace(/\\s+/g, " ").match(/-?\\d+(?:[.,]\\d+)?/);\n'
    + '    return m ? parseFloat(m[0].replace(",", ".")) : null;\n'
    + '  }\n'
    + '  var RN = Math.min(N, 250);\n'
    + '  register().forEach(function(d){\n'
    + '    var tal = [], kast = null;\n'
    + '    for(var i = 0; i < RN; i++){\n'
    + '      var box = document.createElement("div");\n'
    + '      box.style.position = "absolute"; box.style.left = "-9999px";\n'
    + '      document.body.appendChild(box);\n'
    + '      try { d.fn(box); } catch(e){ kast = String(e.message || e).slice(0, 70); box.remove(); break; }\n'
    + '      var t = fragaTal(box);\n'
    + '      box.remove();\n'
    + '      if(t !== null && isFinite(t)) tal.push(t);\n'
    + '    }\n'
    + '    if(kast){ ut.renderare.push({ namn: d.namn, kast: kast }); return; }\n'
    + '    if(tal.length < 100){ ut.utanTal.push(d.namn + " (renderare · " + tal.length + " tal i frågan)"); return; }\n'
    /* En NÄRA KONSTANT serie är inte en följd att pröva. Metoddrillarna visar ett fast
       räkneexempel ("Tänk så här: … 54,2 ="), och proben läste exemplet: utvecklad/metod gav
       54,2 fjorton gånger av fjorton och flaggades ändå på autokorrelation. Ett statistiskt
       prov på en konstant serie mäter ingenting — den hör bland gränserna, inte bland brotten. */
    + '    var p = prov(sabba(tal));\n'
    + '    if(p.distinkt < 5){ ut.utanTal.push(d.namn + " (renderare · " + tal.length + " tal men bara " + p.distinkt + " distinkta — fast räkneexempel, ingen följd att pröva)"); return; }\n'
    + '    ut.renderare.push({ namn: d.namn, n: tal.length, falt: { fraga: p } });\n'
    + '  });\n'
    + '  ut.onerr = window.__onerr || null;\n'
    + '  return ut;\n'
    + '})()';
}

module.exports = { probe: probe };
