/* k4-taxonomi.js — PROCENT-taxonomin (maskinläsbar nodstruktur för kapitel 4, åk 7). Joachim 2026-11-26 (väg b).
   Samma form, fältnamn och konventioner som k1-, k2- och k3-taxonomi.js:
     { id, namn, parent, niva, arskursRelevans, roll, formaga, generator, begrepp, visning }
   Områden har dessutom { grupp, implemented }.

   ── OMRÅDET Procent med fem lövnoder, alla åk 7 och kärna:
        proc-tillprocent:rakna   Från bråk och decimalform till procentform   (moment 1, Blad 1–4)
        proc-franprocent:rakna   Från procentform till bråk och decimalform   (moment 1, Blad 5)
        proc-andelen:rakna       Andelen                                      (moment 2, Blad 1–6)
        proc-delen:rakna         Delen                                        (moment 3 — inte byggt än)
        proc-hela:rakna          Det hela                                     (moment 4 — inte byggt än)
      Löven utan innehåll än bär visning.kommer (plats utan innehåll — kartan visar dem som "kommer", inte som luckor,
      och självskattningen visar dem inte). Andelen fick sitt innehåll 2026-11-26 (moment 2).

   ── BYTA FORM bor HÄR, inte i k2 (Joachim 2026-11-26): procentformen utökar bråkens byta form (k2 brak-byta), men
      noderna och evidensen hör till kapitel 4. De två byta form-löven bär en delatMed-HÄNVISNING till k2:s brak-byta —
      bara en hänvisning: de loggas i kapitel 4:s store (js/mastery-k4.js, bladkärnans route 'k4'), och ingen nod
      finns i k2. Självskattningen läser delatMed bara på områden, så hänvisningen ritar inga k2-rader här.
      Ingen parallell struktur: k2-taxonomi.js pekar hit.

   Ingen generator: moment 1 är författade blad (js/motor/blad/blad-k4-d1-procent.js), som loggar per grupp. */
window.K4_TAXONOMI = {
  "noder": [

    /* ═══════════════ Del 1 · Procent ═══════════════ */
    {
      "id": "proc", "namn": "Procent", "parent": null, "niva": "omrade",
      "arskursRelevans": { "ak7": "mal" }, "roll": "karna", "formaga": null, "generator": null,
      "begrepp": "Procent som andel, byta form mellan bråk, decimalform och procentform, och andel, del och det hela.",
      "grupp": "procent", "implemented": true
    },
    {
      "id": "proc-tillprocent:rakna", "namn": "Från bråk och decimalform till procentform", "parent": "proc", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "nivamodell": "nytt", "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Skriv en andel i bråkform, decimalform och procentform — standardbråk, enklaste form och hundradelar.",
      "delatMed": { "kalla": "k2-taxonomi", "beskrivning": "Procentformen utökar bråkens byta form (hänvisning, loggas i k4).", "noder": ["brak-byta"] },
      "visning": null
    },
    {
      "id": "proc-franprocent:rakna", "namn": "Från procentform till bråk och decimalform", "parent": "proc", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "nivamodell": "nytt", "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Skriv procenten i hundradelar, i enklaste form och i decimalform; det hela är 100 %.",
      "delatMed": { "kalla": "k2-taxonomi", "beskrivning": "Procentformen utökar bråkens byta form (hänvisning, loggas i k4).", "noder": ["brak-byta"] },
      "visning": null
    },
    {
      "id": "proc-andelen:rakna", "namn": "Andelen", "parent": "proc", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "nivamodell": "nytt", "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Hur stor andel är delen av det hela?",
      "visning": null
    },
    {
      "id": "proc-delen:rakna", "namn": "Delen", "parent": "proc", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "nivamodell": "nytt", "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Hur stor är delen när andelen och det hela är kända?",
      "visning": { "kommer": true }
    },
    {
      "id": "proc-hela:rakna", "namn": "Det hela", "parent": "proc", "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" }, "nivamodell": "nytt", "roll": "karna", "formaga": "RAKNA", "generator": null,
      "begrepp": "Hur stort är det hela när delen och andelen är kända?",
      "visning": { "kommer": true }
    }
  ]
};
