/* k1-taxonomi.js — maskinläsbar nodstruktur (område → deldomän → lövnod).
   AUTOGENERERAD ur ak7-k1-ram.html (DELAR/DELAR_KO/OVNING_RENDERS/FORMAGOR) + d1:s DEL.fardighet.
   formaga + generator är förifyllda ur koden. arskursRelevans + malniva har defaults att tagga.
   visning bär presentationsdatan för utbudslistan (pilot: taluppfattning). Motorer orörda. */
window.K1_TAXONOMI = {
  "noder": [
    {
      "id": "taluppfattning",
      "namn": "Taluppfattning",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Tal och deras egenskaper: siffror, positionssystemet, tallinjer, primtal och delbarhet.",
      "grupp": "tal",
      "implemented": true
    },
    {
      "id": "brak-decimal",
      "namn": "Byta form mellan bråkform och decimalform",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Översätta mellan bråk, decimaltal och blandad form. T.ex. 3/4 = 0,75.",
      "grupp": "tal",
      "implemented": false
    },
    {
      "id": "addition",
      "namn": "Addition",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Begrepp, huvudräkning, metoder och problemlösning för addition.",
      "grupp": "raknesatt",
      "implemented": true
    },
    {
      "id": "subtraktion",
      "namn": "Subtraktion",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Begrepp, huvudräkning, metoder och problemlösning för subtraktion.",
      "grupp": "raknesatt",
      "implemented": true
    },
    {
      "id": "multiplikation",
      "namn": "Multiplikation",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Begrepp, multiplikationstabellen, metoder, beräkningar och problemlösning med lästal.",
      "grupp": "raknesatt",
      "implemented": true
    },
    {
      "id": "division",
      "namn": "Division",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Begrepp, delbarhet, divisionstabellen, kort och lång division, beräkningar och problemlösning.",
      "grupp": "raknesatt",
      "implemented": true
    },
    {
      "id": "prio",
      "namn": "Prioriteringsregeln och lagar",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Samband mellan räknesätten, prioriteringsregeln och de tre räknelagarna.",
      "grupp": "raknesatt",
      "implemented": true
    },
    {
      "id": "negativa",
      "namn": "Negativa tal",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Tal mindre än noll. Motsatta tal, storleksordna och räkna med negativa tal i alla räknesätt.",
      "grupp": "raknesatt",
      "implemented": true
    },
    {
      "id": "avrundning",
      "namn": "Avrundning och överslagsräkning",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Närmevärde och avrundningsregler. Avrunda till olika platsvärden och använd överslag.",
      "grupp": "avslutning",
      "implemented": true
    },
    {
      "id": "blandat",
      "namn": "Blandade uppgifter",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Repetition av allt i kapitlet. Bra inför prov.",
      "grupp": "avslutning",
      "implemented": false
    },
    {
      "id": "siffror",
      "namn": "Siffror och tal · udda och jämna",
      "parent": "taluppfattning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Förstå skillnaden mellan siffra och tal, och vad som gör ett tal udda eller jämnt.",
      "visning": {
        "rubrik": "Siffror och tal",
        "ordning": 0
      }
    },
    {
      "id": "siffror:begrepp",
      "namn": "Siffror och tal (udda/jämnt · antal · störst/minst)",
      "parent": "siffror",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderSiffrorBegrepp",
      "begrepp": "Vad en siffra och ett tal är, udda/jämnt och att bygga tal av siffror.",
      "visning": {
        "titel": "Siffror och tal (udda/jämnt · antal · störst/minst)",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": 2
      }
    },
    {
      "id": "siffror:namn",
      "namn": "Talnamn ↔ siffror",
      "parent": "siffror",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderTalnamn",
      "begrepp": null,
      "visning": {
        "titel": "Talnamn ↔ siffror",
        "etikett": "begrepp",
        "formagaKey": "namn",
        "niva": null
      }
    },
    {
      "id": "position",
      "namn": "Positionssystemet",
      "parent": "taluppfattning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Platsvärden från tusental till tusendel. Tallinjen. Avgör en siffras värde i talet.",
      "visning": {
        "rubrik": "Positionssystemet",
        "ordning": 1
      }
    },
    {
      "id": "position:begrepp",
      "namn": "Platsvärde & bygga tal",
      "parent": "position",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderPositionBegrepp",
      "begrepp": "Platsvärde, och skriva tal från ental, tiondelar, hundradelar …",
      "visning": {
        "titel": "Platsvärde & bygga tal",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "position:rakna",
      "namn": "Tallinje, talföljder & storleksordna",
      "parent": "position",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderPositionRakna",
      "begrepp": "Tallinjen, storleksordna, talföljder och att öka/minska med en tiondel.",
      "visning": {
        "titel": "Tallinje, talföljder & storleksordna",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "position:resonera",
      "namn": "Jämföra & mittemellan",
      "parent": "position",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RESONERA",
      "generator": "renderPositionResonera",
      "begrepp": "Jämför tal som 9,1 och 9,09, och hitta tal som ligger mellan.",
      "visning": {
        "titel": "Jämföra & mittemellan",
        "etikett": "resonera",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "position:enhet",
      "namn": "Enhetsbyten (tiotal, tiondelar …)",
      "parent": "position",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderEnhetsbyten",
      "begrepp": null,
      "visning": {
        "titel": "Enhetsbyten (tiotal, tiondelar …)",
        "etikett": "begrepp",
        "formagaKey": "enhet",
        "niva": null
      }
    },
    {
      "id": "utvecklad",
      "namn": "Utvecklad form",
      "parent": "taluppfattning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Dela upp tal som 54,2 = 5·10 + 4·1 + 2·0,1",
      "visning": {
        "rubrik": "Utvecklad form",
        "ordning": 2
      }
    },
    {
      "id": "utvecklad:metod",
      "namn": "Skriv i utvecklad form",
      "parent": "utvecklad",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "valbar",
      "formaga": "METOD",
      "generator": "renderUtveckladMetod",
      "begrepp": "Skriv talet i utvecklad form steg för steg.",
      "visning": {
        "titel": "Skriv i utvecklad form",
        "etikett": "metod",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "utvecklad:rakna",
      "namn": "Vilket tal står på utvecklad form?",
      "parent": "utvecklad",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderUtveckladRakna",
      "begrepp": "Vilket tal står på utvecklad form?",
      "visning": {
        "titel": "Vilket tal står på utvecklad form?",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "primtal",
      "namn": "Primtal, sammansatta tal och faktorträd",
      "parent": "taluppfattning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Avgör om ett tal är primtal eller sammansatt. Bygg faktorträd och hitta primfaktorer.",
      "visning": {
        "rubrik": "Primtal & faktorträd",
        "ordning": 4
      }
    },
    {
      "id": "primtal:begrepp",
      "namn": "Primtal eller sammansatt?",
      "parent": "primtal",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderPrimtalBegrepp",
      "begrepp": "Är talet ett primtal eller sammansatt? Snabba flashcards.",
      "visning": {
        "titel": "Primtal eller sammansatt?",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "primtal:rakna",
      "namn": "Faktorisera (2–4 faktorer)",
      "parent": "primtal",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderPrimtalRakna",
      "begrepp": "Dela upp tal i termer eller faktorer. Två, tre eller fyra stycken.",
      "visning": {
        "titel": "Faktorisera (2–4 faktorer)",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "primtal:metod",
      "namn": "Bygg faktorträd",
      "parent": "primtal",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "valbar",
      "formaga": "METOD",
      "generator": "renderPrimtalMetod",
      "begrepp": "Bygg faktorträd – välj själv hur du delar upp.",
      "visning": {
        "titel": "Bygg faktorträd",
        "etikett": "metod",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "primtal:kommunikation",
      "namn": "Skriv hela primtalsfaktoriseringen",
      "parent": "primtal",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "KOMMUNIKATION",
      "generator": "renderPrimtalKomm",
      "begrepp": "Skriv hela primtalsfaktoriseringen.",
      "visning": {
        "titel": "Skriv hela primtalsfaktoriseringen",
        "etikett": "kommunikation",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "primtal:resonera",
      "namn": "Förklara varför ett tal är primtal",
      "parent": "primtal",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RESONERA",
      "generator": "renderPrimtalResonera",
      "begrepp": "Förklara varför ett tal är primtal eller inte.",
      "visning": {
        "titel": "Förklara varför ett tal är primtal",
        "etikett": "resonera",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "primtal:problem",
      "namn": "Talgåtor: vilket tal är jag?",
      "parent": "primtal",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "PROBLEM",
      "generator": "renderPrimtalProblem",
      "begrepp": "Gåtor: vilket tal är jag?",
      "visning": {
        "titel": "Talgåtor: vilket tal är jag?",
        "etikett": "problemlösning",
        "formagaKey": "problem",
        "niva": null
      }
    },
    {
      "id": "primtal:baklanges",
      "namn": "Faktorisering baklänges",
      "parent": "primtal",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderFaktoriseringBaklanges",
      "begrepp": null,
      "visning": {
        "titel": "Faktorisering baklänges",
        "etikett": "räkna",
        "formagaKey": "baklanges",
        "niva": null
      }
    },
    {
      "id": "delbarhet",
      "namn": "Delbarhetsregler",
      "parent": "taluppfattning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Reglerna för 2, 3, 5 och 10. Fördjupning: 4, 6 och 9.",
      "visning": {
        "rubrik": "Delbarhet",
        "ordning": 5
      }
    },
    {
      "id": "delbarhet:begrepp",
      "namn": "Vad är delbarhet?",
      "parent": "delbarhet",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderDelbarhetBegrepp",
      "begrepp": "Vad betyder delbarhet? Vad är en siffersumma?",
      "visning": {
        "titel": "Vad är delbarhet?",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "delbarhet:rakna",
      "namn": "Avgör delbarhet snabbt",
      "parent": "delbarhet",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderDelbarhetRakna",
      "begrepp": "Avgör snabbt om ett tal är delbart.",
      "visning": {
        "titel": "Avgör delbarhet snabbt",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "delbarhet:konstruera",
      "namn": "Konstruera tal (delbarhet)",
      "parent": "delbarhet",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderKonstrueraDelbar",
      "begrepp": null,
      "visning": {
        "titel": "Konstruera tal (delbarhet)",
        "etikett": "räkna",
        "formagaKey": "konstruera",
        "niva": null
      }
    },
    {
      "id": "rakneträning",
      "namn": "Räkneträning – öka och minska",
      "parent": "taluppfattning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "T.ex. öka 9,92 med en tiondel, minska 10,09 med en hundradel.",
      "visning": {
        "rubrik": "Räkneträning",
        "ordning": 3
      }
    },
    {
      "id": "rakneträning:rakna",
      "namn": "Öka & minska (tiondel · hundradel · tusendel)",
      "parent": "rakneträning",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderRaknetraningRakna",
      "begrepp": "Öka och minska med en tiondel, hundradel eller tusendel.",
      "visning": {
        "titel": "Öka & minska (tiondel · hundradel · tusendel)",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "add-begrepp",
      "namn": "Begrepp",
      "parent": "addition",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Term och summa, tiokompisar och hundrakompisar samt att dela upp tal i termer.",
      "visning": null
    },
    {
      "id": "add-begrepp:begrepp",
      "namn": "Begrepp · Begrepp",
      "parent": "add-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderAddBegrepp",
      "begrepp": "Vad menas med term och summa?",
      "visning": null
    },
    {
      "id": "add-begrepp:rakna",
      "namn": "Begrepp · Räkna",
      "parent": "add-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderAddBegreppRakna",
      "begrepp": "Tiokompisar, hundrakompisar och att dela upp tal i termer.",
      "visning": null
    },
    {
      "id": "add-rakna",
      "namn": "Huvudräkning",
      "parent": "addition",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Räkna i huvudet med tiokompisar, decimaltal och tal i bråkform och blandad form.",
      "visning": null
    },
    {
      "id": "add-rakna:rakna",
      "namn": "Huvudräkning · Räkna",
      "parent": "add-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderAddHuvudrakning",
      "begrepp": "Huvudräkning med tiokompisar, decimaltal och bråk.",
      "visning": null
    },
    {
      "id": "add-metoder",
      "namn": "Metoder",
      "parent": "addition",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Uppställning, talsorterna var för sig, flytta över och addition med negativa tal.",
      "visning": null
    },
    {
      "id": "add-metoder:metod",
      "namn": "Metoder · Metod",
      "parent": "add-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "valbar",
      "formaga": "METOD",
      "generator": "renderAddMetod",
      "begrepp": "Lär dig och välj bland additionsmetoderna.",
      "visning": null
    },
    {
      "id": "add-problem",
      "namn": "Problemlösning",
      "parent": "addition",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Lös additionsproblem med lästal – välj svårighetsgrad själv.",
      "visning": null
    },
    {
      "id": "add-problem:problem",
      "namn": "Problemlösning · Problemlösning",
      "parent": "add-problem",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "PROBLEM",
      "generator": "renderAddProblem",
      "begrepp": "Lös lästal med addition.",
      "visning": null
    },
    {
      "id": "sub-begrepp",
      "namn": "Begrepp",
      "parent": "subtraktion",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Term och differens – matematikens vokabulär för subtraktion. Dela upp en differens i termer.",
      "visning": null
    },
    {
      "id": "sub-begrepp:begrepp",
      "namn": "Begrepp · Begrepp",
      "parent": "sub-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderSubBegrepp",
      "begrepp": "Vad menas med term och differens?",
      "visning": null
    },
    {
      "id": "sub-begrepp:rakna",
      "namn": "Begrepp · Räkna",
      "parent": "sub-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderSubBegreppRakna",
      "begrepp": "Dela upp en differens i två eller tre termer.",
      "visning": null
    },
    {
      "id": "sub-rakna",
      "namn": "Huvudräkning",
      "parent": "subtraktion",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Räkna i huvudet över tiotalsgränsen, med decimaltal och med bråkform.",
      "visning": null
    },
    {
      "id": "sub-rakna:rakna",
      "namn": "Huvudräkning · Räkna",
      "parent": "sub-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderSubHuvudrakning",
      "begrepp": "Huvudräkning med enkla tal, decimaltal och bråk.",
      "visning": null
    },
    {
      "id": "sub-metoder",
      "namn": "Metoder",
      "parent": "subtraktion",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Uppställning, öka och minska lika, addition bakifrån och subtraktion med negativa tal.",
      "visning": null
    },
    {
      "id": "sub-metoder:metod",
      "namn": "Metoder · Metod",
      "parent": "sub-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "valbar",
      "formaga": "METOD",
      "generator": "renderSubMetod",
      "begrepp": "Lär dig och välj bland subtraktionsmetoderna.",
      "visning": null
    },
    {
      "id": "sub-problem",
      "namn": "Problemlösning",
      "parent": "subtraktion",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Lös subtraktionsproblem med lästal – välj svårighetsgrad själv.",
      "visning": null
    },
    {
      "id": "sub-problem:problem",
      "namn": "Problemlösning · Problemlösning",
      "parent": "sub-problem",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "PROBLEM",
      "generator": "renderSubProblem",
      "begrepp": "Lös lästal med subtraktion.",
      "visning": null
    },
    {
      "id": "mult-begrepp",
      "namn": "Begrepp",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Faktor, produkt, primtal och sammansatt tal. Faktorisera tal och bygg faktorträd.",
      "visning": null
    },
    {
      "id": "mult-begrepp:begrepp",
      "namn": "Begrepp · Begrepp",
      "parent": "mult-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderMultBegrepp",
      "begrepp": "Känn igen faktor, produkt, primtal och sammansatt tal.",
      "visning": null
    },
    {
      "id": "mult-begrepp:rakna",
      "namn": "Begrepp · Räkna",
      "parent": "mult-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderMultFaktorisera",
      "begrepp": "Faktorisera ett tal i två eller tre faktorer.",
      "visning": null
    },
    {
      "id": "mult-begrepp:metod",
      "namn": "Begrepp · Metod",
      "parent": "mult-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "valbar",
      "formaga": "METOD",
      "generator": "renderPrimtalMetod",
      "begrepp": "Bygg ett faktorträd och hitta primtalsfaktorerna.",
      "visning": null
    },
    {
      "id": "mult-tabell",
      "namn": "Multiplikationstabellen",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Träna tabellerna snabbt – tre nivåer med stigande svårighet.",
      "visning": null
    },
    {
      "id": "mult-tabell:rakna",
      "namn": "Multiplikationstabellen · Räkna",
      "parent": "mult-tabell",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderMultTabell",
      "begrepp": "Snabba flashcards med multiplikationstabellen.",
      "visning": null
    },
    {
      "id": "mult-metoder",
      "namn": "Metoder för multiplikation",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Uppställning, talsorterna var för sig, dubbla och halvera, kompensation och dubbelparentes.",
      "visning": null
    },
    {
      "id": "mult-metoder:metod",
      "namn": "Metoder för multiplikation · Metod",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "valbar",
      "formaga": "METOD",
      "generator": "renderMultMetoder",
      "begrepp": "Lär dig och välj bland flera multiplikationsmetoder.",
      "visning": null
    },
    {
      "id": "mult-rakna",
      "namn": "Beräkningar",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Multiplikation med 10, 100 och 1000, stora tal, små tal och negativa tal.",
      "visning": null
    },
    {
      "id": "mult-rakna:rakna",
      "namn": "Beräkningar · Räkna",
      "parent": "mult-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderMultRakna",
      "begrepp": "Blandade beräkningar – nivån anpassar sig.",
      "visning": null
    },
    {
      "id": "mult-problem",
      "namn": "Problemlösning med lästal",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Lästal i olika varianter och svårighetsgrad. Visa din kommunikation.",
      "visning": null
    },
    {
      "id": "mult-problem:problem",
      "namn": "Problemlösning med lästal · Problemlösning",
      "parent": "mult-problem",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "PROBLEM",
      "generator": "renderMultProblem",
      "begrepp": "Lös lästal som handlar om multiplikation.",
      "visning": null
    },
    {
      "id": "div-begrepp",
      "namn": "Begrepp",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Täljare, nämnare och kvot. Delbarhetsreglerna för 2, 3, 5, 10 samt 4 och 9, och talgåtor.",
      "visning": null
    },
    {
      "id": "div-begrepp:begrepp",
      "namn": "Begrepp · Begrepp",
      "parent": "div-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderDivBegrepp",
      "begrepp": "Känn igen täljare, nämnare och kvot.",
      "visning": null
    },
    {
      "id": "div-begrepp:rakna",
      "namn": "Begrepp · Räkna",
      "parent": "div-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderDivBegreppRakna",
      "begrepp": "Delbarhetsregler och talgåtor – tre kategorier.",
      "visning": null
    },
    {
      "id": "div-tabell",
      "namn": "Divisionstabellen",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Träna divisionstabellen snabbt – tre nivåer med stigande nämnare.",
      "visning": null
    },
    {
      "id": "div-tabell:rakna",
      "namn": "Divisionstabellen · Räkna",
      "parent": "div-tabell",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderDivTabell",
      "begrepp": "Snabba flashcards med divisionstabellen.",
      "visning": null
    },
    {
      "id": "div-metoder",
      "namn": "Metoder",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Kort division och lång division (liggande stolen) – med genomgång och övning.",
      "visning": null
    },
    {
      "id": "div-metoder:metod",
      "namn": "Metoder · Metod",
      "parent": "div-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "valbar",
      "formaga": "METOD",
      "generator": "renderDivMetoder",
      "begrepp": "Lär dig och öva kort och lång division.",
      "visning": null
    },
    {
      "id": "div-rakna",
      "namn": "Beräkningar",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Division med 10, 100 och 1000, stora tal, små tal genom förlängning och negativa tal.",
      "visning": null
    },
    {
      "id": "div-rakna:rakna",
      "namn": "Beräkningar · Räkna",
      "parent": "div-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderDivRakna",
      "begrepp": "Blandade beräkningar – nivån anpassar sig.",
      "visning": null
    },
    {
      "id": "div-problem",
      "namn": "Problemlösning med lästal",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Lästal i olika varianter och svårighetsgrad. Visa din kommunikation.",
      "visning": null
    },
    {
      "id": "div-problem:problem",
      "namn": "Problemlösning med lästal · Problemlösning",
      "parent": "div-problem",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "PROBLEM",
      "generator": "renderDivProblem",
      "begrepp": "Lös lästal som handlar om division.",
      "visning": null
    },
    {
      "id": "prio-samband",
      "namn": "Samband mellan räknesätt",
      "parent": "prio",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Hur addition och subtraktion hänger ihop, och hur multiplikation och division hänger ihop. Fyll i talet som saknas.",
      "visning": null
    },
    {
      "id": "prio-samband:rakna",
      "namn": "Samband mellan räknesätt · Räkna",
      "parent": "prio-samband",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderPrioSamband",
      "begrepp": "Hitta talet som saknas i rutan – två kategorier.",
      "visning": null
    },
    {
      "id": "prio-prioritering",
      "namn": "Prioriteringsregeln",
      "parent": "prio",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "I vilken ordning räknar man? Parenteser, sedan multiplikation och division, sist addition och subtraktion.",
      "visning": null
    },
    {
      "id": "prio-prioritering:rakna",
      "namn": "Prioriteringsregeln · Räkna",
      "parent": "prio-prioritering",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderPrioBerakning",
      "begrepp": "Räkna ut uttryck med prioriteringsregeln – tre nivåer.",
      "visning": null
    },
    {
      "id": "prio-prioritering:metod",
      "namn": "Prioriteringsregeln · Metod",
      "parent": "prio-prioritering",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "valbar",
      "formaga": "METOD",
      "generator": "renderPrioMetod",
      "begrepp": "Visa metoden steg för steg – räkna nedåt rad för rad.",
      "visning": null
    },
    {
      "id": "prio-lagar",
      "namn": "Räknelagar",
      "parent": "prio",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Den kommutativa, associativa och distributiva lagen – verktyg som gör uträkningar enklare.",
      "visning": null
    },
    {
      "id": "prio-lagar:rakna",
      "namn": "Räknelagar · Räkna",
      "parent": "prio-lagar",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderPrioLagar",
      "begrepp": "Öva de tre räknelagarna med tydliga mellanled.",
      "visning": null
    },
    {
      "id": "neg-begrepp",
      "namn": "Begrepp och förståelse",
      "parent": "negativa",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Motsatta tal, storleksordna positiva och negativa tal samt talföljder.",
      "visning": null
    },
    {
      "id": "neg-begrepp:begrepp",
      "namn": "Begrepp och förståelse · Begrepp",
      "parent": "neg-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderNegBegrepp",
      "begrepp": "Motsatta talet, storleksordna och talföljder – tre kategorier.",
      "visning": null
    },
    {
      "id": "neg-rakna",
      "namn": "Räkna med negativa tal",
      "parent": "negativa",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Räkna med negativa tal i addition, subtraktion, multiplikation och division – även med flera faktorer.",
      "visning": null
    },
    {
      "id": "neg-rakna:rakna",
      "namn": "Räkna med negativa tal · Räkna",
      "parent": "neg-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderNegRakna",
      "begrepp": "Addition och subtraktion, multiplikation och division, flera faktorer.",
      "visning": null
    },
    {
      "id": "avr-avrundning",
      "namn": "Avrundning",
      "parent": "avrundning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Begreppet närmevärde, avrundningsreglerna och att avrunda hela tal och decimaltal till olika platsvärden.",
      "visning": null
    },
    {
      "id": "avr-avrundning:begrepp",
      "namn": "Avrundning · Begrepp",
      "parent": "avr-avrundning",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "BEGREPP",
      "generator": "renderAvrAvrundning",
      "begrepp": "Närmevärde, avrunda hela tal och avrunda decimaltal – tre kategorier.",
      "visning": null
    },
    {
      "id": "avr-overslag",
      "namn": "Överslagsräkning",
      "parent": "avrundning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": null,
      "generator": null,
      "begrepp": "Använd avrundning för att snabbt göra ungefärliga beräkningar i alla räknesätt.",
      "visning": null
    },
    {
      "id": "avr-overslag:rakna",
      "namn": "Överslagsräkning · Räkna",
      "parent": "avr-overslag",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "malniva": "obligatorisk",
      "formaga": "RAKNA",
      "generator": "renderAvrOverslag",
      "begrepp": "Överslagsberäkningar i addition, subtraktion, multiplikation och division.",
      "visning": null
    }
  ]
};
