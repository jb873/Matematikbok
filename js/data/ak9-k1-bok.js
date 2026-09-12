/* ak9-k1-bok.js — ÅRSKURS 9, kapitel 1 (Taluppfattning): NAVIGATION (enbart).
   ── Enkällsprincipen på årskurs: filen innehåller INGA nod-definitioner. Noderna kommer att
      bo i js/data/k1-taxonomi.js (+ k2-taxonomi.js) och delas mellan årskurserna via ak9-taggar
      + minNiva (beslut a: ingen dubblett per årskurs). Detta är årskursens ORDNING + delkapitel-
      indelning; noderna är gemensamma och pekas ut via nod-id när taxonomin taggas (eget bygge). ──

   Varje delkapitel: { nr, id, titel, fil, byggId, status }. status:'skelett' = sida finns men tom.
   Konvention (låst): DISPLAY-NR bor bara här (nr) → omordning = ett två-fälts-diff. Filnamn = slug (id/fil).
   Bygg-id (byggId) är STABILT och frikopplat från display-ordning; motorernas bygg-id rörs aldrig vid omordning.

   ── AVSIKTLIG DIVERGENS (dokumenterad, inte ett brott) ──────────────────────────────────────────
   Åk9:s delkapitel-sidor använder ÅK7:s mönster (grupperad platt UTBUDSLISTA), INTE åk8:s flikar.
   Sedan 2026-09-12 TVÅ rader (gymnasiespåret borttaget — eleverna arbetar i Ma1c/Ma2c; E-spåret blev
   en hänvisning till kunskapsläget): "Årskurs 9" (delkapitlets eget material, först) och "Repetition".
   Sidorna är tomma skal: js/data/ak9-utbud.js (AK9_UTBUD.render) ritar raderna ur `utbud` nedan —
   EN plats att fylla på när Joachims NP-dokument kommer (np), inte nio. Konsekvens: en elev som just
   kommit från ÅTTAN möter i NIAN sjuans utseende, inte åttans. Avsiktligt; båda mönstren finns redan.
   ──────────────────────────────────────────────────────────────────────────────────────────────── */
window.AK9_K1_BOK = {
  arskurs: 'ak9',
  kapitel: 'k1',
  titel: 'Taluppfattning',
  // SKELETT: alla nio delkapitel har en sida (två-raders utbudslista via AK9_UTBUD, tom/ärligt märkt). Ingen taxonomi,
  // inga noder, inga generatorer, inga blad ännu — de fylls i i egna byggen. dk9 "Plugg till prov" blir
  // kunskapslägesvyns hemvist i nian (som k1 Del10 / k2 Del9); dk8 "Fördjupning" är innehållstyp, inte behållare.
  delkapitel: [
    { nr: 1, id: 'tal-och-berakna',          titel: 'Tal och beräkna',                                          fil: 'tal-och-berakna.html',          byggId: 'd1', status: 'skelett',
      utbud: {
        nian: [ { titel:'Föreläsning', href:'tal-och-berakna-forel.html' }, { titel:'Öva', href:'tal-och-berakna-ova.html' }, { titel:'Färdighetsträning', href:'tal-och-berakna-fard.html' }, { titel:'Test', href:'tal-och-berakna-test.html' } ],
        // direktlänkar till åttans/sjuans motsvarande material — komplement till kunskapsläget, inte tyngdpunkt
        repetition: [ { ar:'Åk 8', titel:'Grunder', href:'../../ak8/k1/grunder.html' }, { ar:'Åk 8', titel:'Beräkningar', href:'../../ak8/k1/berakningar.html' }, { ar:'Åk 7', titel:'Positionssystem och fyra räknesätt', href:'../../ak7-k1.html' } ]
      } },
    { nr: 2, id: 'rakna-med-brak',           titel: 'Räkna med bråk',                                           fil: 'rakna-med-brak.html',           byggId: 'd2', status: 'skelett',
      utbud: {
        nian: [ 'Föreläsning', { titel:'Öva', href:'rakna-med-brak-akr9-ova.html' }, { titel:'Färdighetsträning', href:'rakna-med-brak-fard.html' }, { titel:'Test', href:'rakna-med-brak-test.html' } ],
        // Gy-fördjupningen (åtta dokument algebraiska bråk, alg-brak.js) ligger kvar — som bråkets fördjupning, inte ett spår
        fordjupning: [ { titel:'Fördjupning · Algebraiska bråk', href:'rakna-med-brak-fordjupning.html' } ],
        // Joachims E-öva (sex dokument med varianter) — grundnivån, under Repetition
        np: [ { titel:'Öva · grundnivå (sex dokument)', href:'rakna-med-brak-ova.html' } ]
      } },
    { nr: 3, id: 'rakna-med-negativa-tal',   titel: 'Räkna med negativa tal',                                   fil: 'rakna-med-negativa-tal.html',   byggId: 'd3', status: 'skelett' },
    { nr: 4, id: 'rakna-med-potenser',       titel: 'Räkna med potenser',                                       fil: 'rakna-med-potenser.html',       byggId: 'd4', status: 'skelett' },
    { nr: 5, id: 'tiopotenser-och-sma-tal',  titel: 'Räkna med tiopotenser och små tal (negativ exponent)',     fil: 'tiopotenser-och-sma-tal.html',  byggId: 'd5', status: 'skelett' },
    { nr: 6, id: 'grundpotenser-och-sma-tal', titel: 'Räkna med grundpotenser och små tal (negativ exponent)',  fil: 'grundpotenser-och-sma-tal.html', byggId: 'd6', status: 'skelett' },
    { nr: 7, id: 'kvadratrotter',            titel: 'Kvadratrötter och räkna med kvadratrötter',                fil: 'kvadratrotter.html',            byggId: 'd7', status: 'skelett' },
    { nr: 8, id: 'fordjupning',              titel: 'Fördjupning',                                              fil: 'fordjupning.html',              byggId: 'd8', status: 'skelett' },
    { nr: 9, id: 'plugg-till-prov',          titel: 'Plugg till prov',                                          fil: 'plugg-till-prov.html',          byggId: 'd9', status: 'skelett' }
  ]
};
