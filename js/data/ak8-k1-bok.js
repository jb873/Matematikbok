/* ak8-k1-bok.js — ÅRSKURS 8, kapitel 1: NAVIGATION (enbart).
   ── Enkällsprincipen på årskurs: filen innehåller INGA nod-definitioner. Noderna bor i
      js/data/k1-taxonomi.js (+ k2-taxonomi.js) och delas mellan årskurserna. Skapa ALDRIG
      en åk8-kopia av en åk7-nod. Detta är årskursens ORDNING + blad-indelning; noderna
      är gemensamma och pekas ut via nod-id. ──

   Varje delkapitel: { nr, id, titel, fil, blad:[ { nr, titel, roll, noder:[nod-id…] } ] }.
   roll på blad-nivå = årskursens roll för bladet (repetition | mal | fordjupning | stod).

   ⚠️ De nio delkapitlen fylls i allteftersom Joachim fastställer dem. d2 (Negativa tal) är
   strukturpiloten och är komplett här; delkapitel 1, 3–9 väntar på kapitel-listan. */
window.AK8_K1_BOK = {
  arskurs: 'ak8',
  kapitel: 'k1',
  titel: 'Tal och tals användning',          // ⚠️ kapiteltitel bekräftas av Joachim
  delkapitel: [
    {
      nr: 1, id: 'd1', titel: 'Repetition: positionssystem och fyra räknesätt', fil: 'd1-repetition.html', status: 'bygger',
      // Fyra av åtta blad byggda (mult/div ur Joachims fyra docx). De fyra andra
      // (positionssystem, addition, subtraktion, …) väntar på kapitel-listan.
      // Noderna är sjuans Del 5/6/7 med {ak8:repetition} (OVERRIDES) — single-source.
      blad: [
        { nr: 1, titel: 'Multiplikation och division med 10, 100 och 1000', roll: 'repetition', noder: ['mult-rakna:pow10', 'div-rakna:pow10'] },
        { nr: 2, titel: 'Multiplicera och dividera med små tal',             roll: 'repetition', noder: ['mult-rakna:sma', 'div-rakna:sma'] },
        { nr: 3, titel: 'Multiplicera och dividera med stora tal',           roll: 'repetition', noder: ['mult-rakna:stora', 'div-rakna:stora'] },
        { nr: 4, titel: 'Multiplicera och dividera med stora och små tal',   roll: 'repetition', noder: ['mult-rakna:storasma', 'div-rakna:storasma'] }
      ]
    },
    {
      nr: 2, id: 'd2', titel: 'Negativa tal', fil: 'd2-negativa-tal.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Grunder',                     roll: 'repetition', noder: ['neg-begrepp:begrepp'] },
        { nr: 2, titel: 'Addition och subtraktion',    roll: 'repetition', noder: ['neg-rakna:addsub'] },
        { nr: 3, titel: 'Multiplikation och division', roll: 'mal',        noder: ['neg-rakna:multdiv'] }
      ]
    }
    // ⚠️ Delkapitel 1, 3–9 väntar på Joachims kapitel-lista (titlar + nod-id per blad).
    // Grunder- och add/sub-bladens noder får {ak8:repetition} i Fas C2; mult/div får ev.
    // finare nya noder ({ak8:mal}) enligt transkriptionen — pekas då ut här utan att röra
    // noddefinitionerna (single-source).
  ]
};
