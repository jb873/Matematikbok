/* ak8-k1-bok.js — ÅRSKURS 8, kapitel 1: NAVIGATION (enbart).
   ── Enkällsprincipen på årskurs: filen innehåller INGA nod-definitioner. Noderna bor i
      js/data/k1-taxonomi.js (+ k2-taxonomi.js) och delas mellan årskurserna. Skapa ALDRIG
      en åk8-kopia av en åk7-nod. Detta är årskursens ORDNING + blad-indelning; noderna
      är gemensamma och pekas ut via nod-id. ──

   Varje delkapitel: { nr, id, titel, fil, blad:[ { nr, titel, roll, noder:[nod-id…] } ] }.
   roll på blad-nivå = årskursens roll för bladet (repetition | mal | fordjupning | stod).

   ⚠️ Tio delkapitel; fylls i allteftersom Joachim fastställer dem. Negativa tal (delkapitel 3)
   är strukturpiloten och är komplett; övriga väntar på kapitel-listan.

   Konvention (låst): SIDOR = slug (negativa-tal.html), MOTORER = bygg-id (blad-ak8-d2.js).
   Delkapitel-NUMRET bor bara här (nr) → omordning sker single-source i denna fil; sidorna
   läser sitt nummer härifrån (matchar på fil), motorernas bygg-id rörs aldrig. */
window.AK8_K1_BOK = {
  arskurs: 'ak8',
  kapitel: 'k1',
  titel: 'Tal och tals användning',          // ⚠️ kapiteltitel bekräftas av Joachim
  delkapitel: [
    {
      nr: 2, id: 'berakningar', titel: 'Beräkningar', fil: 'berakningar.html', status: 'bygger',
      // Fyra mult/div-blad byggda (ur Joachims fyra docx). Prioriteringsregeln utan potenser
      // = tom slot, byggs i egen order. Noderna är sjuans Del 5/6/7 med {ak8:repetition}.
      blad: [
        { nr: 1, titel: 'Multiplikation och division med 10, 100 och 1000', roll: 'repetition', noder: ['mult-rakna:pow10', 'div-rakna:pow10'] },
        { nr: 2, titel: 'Multiplicera och dividera med små tal',             roll: 'repetition', noder: ['mult-rakna:sma', 'div-rakna:sma'] },
        { nr: 3, titel: 'Multiplicera och dividera med stora tal',           roll: 'repetition', noder: ['mult-rakna:stora', 'div-rakna:stora'] },
        { nr: 4, titel: 'Multiplicera och dividera med stora och små tal',   roll: 'repetition', noder: ['mult-rakna:storasma', 'div-rakna:storasma'] }
        // ⚠️ tom slot: Prioriteringsregeln utan potenser — byggs i egen order (sjuans källa pekas ut).
      ]
    },
    {
      // Grunder (position 2). Räkna + Storlek byggda (tal REGENERERADE, unika mot sjuan).
      // Tiosystemet (blad 1) väntar på beslut om nya blad-mekanismer (välj-flera/produkt/summa).
      // Nod-taggning (stöd/repetition) på blad-/nod-nivå LÄMNAS OSATT — Joachim sätter den
      // efteråt (som negativa tal). Noderna är sjuans k1 (position:*), återanvända — inga nya.
      nr: 1, id: 'grunder', titel: 'Grunder', roll: 'stod', fil: 'grunder.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Tiosystemet',               noder: ['position:begrepp', 'primtal:begrepp', 'primtal:rakna', 'delbarhet:rakna'] },
        { nr: 2, titel: 'Räkna i positionssystemet', noder: ['position:rakna', 'position:resonera'] },
        { nr: 3, titel: 'Storlek och ordning',       noder: ['position:rakna', 'position:resonera'] }
      ]
    },
    {
      // Räkna med bråk (position 4) — ärver åk7 k2 (bråk). Öva-bladet "Grunder i bråk" är
      // EXAKT-författat ur TRANSKRIPTION-ak8-grunder-i-brak.md (12 uppgiftstyper). Noderna är
      // sjuans k2 (single-source) med {ak8:repetition}, plus två nya åk8-repetitions-noder som
      // k2 saknade: likformiga bråk (brak-likformig) och tid↔bråk/decimal (brak-tid). Motor:
      // blad-ak8-d5.js (återanvänder ak8-blad-ui + svg-andel + svg-tallinje). minNiva ej satt.
      nr: 4, id: 'rakna-med-brak', titel: 'Räkna med bråk', fil: 'rakna-med-brak.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Grunder i bråk', roll: 'repetition', noder: [
          'andel-hela:resonera', 'brak-blandad:rakna', 'brak-likformig:rakna', 'brak-forkorta:rakna', 'brak-forlanga:rakna',
          'brak-tid:rakna', 'brak-jmf-ordna:resonera', 'brak-jmf-lika:begrepp', 'andel-tallinje:begrepp', 'andel-figur:rakna'
        ] }
      ]
    },
    {
      // Addition och subtraktion med bråk (position 5) — ärver åk7 k2 (brak-as). Två Öva-blad,
      // exakt-författade ur "Addition och subtraktion med bråk (1).docx". Motor blad-ak8-d6.js:
      // mixed-eval likhetskedjor, ogrindad förlängnings-knapp, fri equality-rättad LÅNA-kedja.
      // Noderna är sjuans brak-add/brak-sub {ak8:repetition} + ny nod brak-lana {ak8:mal} (nytt
      // mål i åttan). Problemlösnings-fliken byggs i egen order. minNiva ej satt.
      nr: 5, id: 'addsub-brak', titel: 'Addition och subtraktion', fil: 'addsub-brak.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Addition och subtraktion, blad 1', roll: 'repetition', noder: ['brak-add:rakna', 'brak-sub:rakna', 'brak-blandad:rakna', 'brak-lana:rakna'] },
        { nr: 2, titel: 'Addition och subtraktion, blad 2', roll: 'repetition', noder: ['brak-add:rakna', 'brak-sub:rakna', 'brak-lana:rakna'] }
      ]
    },
    {
      // Multiplikation med bråk (position 6) — ärver åk7 k2 (brak-mult). Två Öva-blad, exakt-författade
      // ur "Multiplikation med bråk.docx". Motor blad-ak8-d7.js: kanoniska grupper på fasta produktbråk-
      // rutor, förkorta-/förenkla-innan + ta-bort-mellanled equality-rättade via delade Likhetsrattare.
      // Noderna: sjuans brak-mult {ak8:repetition} + ny nod brak-mult-forkorta {ak8:mal} (förkorta-innan =
      // egen färdighet i åttan, för stora tal). Problemlösning byggs kombinerad med division. minNiva ej satt.
      nr: 6, id: 'mult-brak', titel: 'Multiplikation', fil: 'mult-brak.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Multiplikation, blad 1', roll: 'repetition', noder: ['brak-mult-rakna:rakna', 'brak-mult-forkorta:rakna'] },
        { nr: 2, titel: 'Multiplikation, blad 2', roll: 'repetition', noder: ['brak-mult-rakna:rakna', 'brak-mult-forkorta:rakna'] }
      ]
    },
    {
      nr: 3, id: 'negativa-tal', titel: 'Negativa tal', fil: 'negativa-tal.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Grunder',                     roll: 'repetition', noder: ['neg-begrepp:begrepp'] },
        { nr: 2, titel: 'Addition och subtraktion',    roll: 'repetition', noder: ['neg-rakna:addsub'] },
        { nr: 3, titel: 'Multiplikation och division', roll: 'mal',        noder: ['neg-rakna:multdiv'] }
      ]
    },
    {
      // Potenser (position 8) — greenfield potens-familj, pilot för dk 8/9/10 (samma motor,
      // olika bas). Öva-bladen exakt-författade ur TRANSKRIPTION-ak8-potenser.md. Generatorerna
      // (Färdighetsträning) + de nya {ak8:mal}-noderna (pot-*) byggs i FAS 3; prio-potenser
      // återanvänds. minNiva sätts när talurvalet spikats (FAS 3).
      nr: 8, id: 'potenser', titel: 'Potenser', fil: 'potenser.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Potenser grund',                  noder: ['pot-begrepp:skriva', 'pot-begrepp:evaluera', 'pot-begrepp:tabell', 'pot-begrepp:figur', 'pot-addsub:rakna'] },
        { nr: 2, titel: 'Multiplikation och division',      noder: ['pot-multdiv:rakna', 'pot-multdiv:losut', 'pot-multdiv:resonera'] },
        { nr: 3, titel: 'Prioriteringsregeln med potenser', noder: ['prio-potenser'] }
      ]
    },
    {
      // Tiopotenser (position 9) — ETT blad via SAMMA potens-motor med bas 10 (ingen ny motor;
      // renderTio* återanvänder pot-generatorerna, bara basFn:basTio skiljer). SI-prefix är en
      // begreppsnod (tio-rakna:prefix, blad-only). Motorn är dessutom negativ-exponent-kapabel
      // (a^(−k)=1/a^k, stående bråk) men det gate:as i talurvalet — inget blad använder det än.
      nr: 9, id: 'tiopotenser', titel: 'Tiopotenser', fil: 'tiopotenser.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Tiopotenser', noder: ['tio-rakna:skriva', 'tio-rakna:evaluera', 'tio-rakna:rakna', 'tio-rakna:addsub', 'tio-rakna:losut', 'tio-rakna:prefix'] }
      ]
    },
    {
      // Grundpotenser (position 10) — grundpotensform a·10ⁿ. SAMMA exponentkärna (m±n, expLag)
      // som potens/tiopotens; nytt koefficient- + normaliserings-lager ovanpå (ingen ny motor).
      // Ett blad, exakt-författat ur TRANSKRIPTION-ak8-grundpotenser.md. minNiva sätts i egen order.
      nr: 10, id: 'grundpotenser', titel: 'Grundpotenser', fil: 'grundpotenser.html', status: 'bygger',
      blad: [
        { nr: 1, titel: 'Grundpotenser', noder: ['gp-rakna:skriva', 'gp-rakna:multdiv', 'gp-rakna:addsub', 'gp-rakna:losut'] }
      ]
    }
    // ⚠️ Delkapitel 4–7 (bråk ×4) väntar. Noderna är gemensamma med åk 7 (single-source).
  ]
};
