/* k1-taxonomi.js — maskinläsbar nodstruktur (område → deldomän → lövnod).
   AUTOGENERERAD av js/data/generate-taxonomi.js ur ak7-k1-ram.html + delkapitlens utbudslistor.
   formaga + generator är förifyllda ur koden. arskursRelevans + roll har defaults att tagga
   (roll: karna | breddning | fordjupning). Manuella tags bor i OVERRIDES/EXTRA_NODER i generatorn.
   visning bär presentationsdatan; visning.utbudslista anger vilken delkapitel-lista raden hör till.
   REGENERERA när ramens DELAR/DELAR_KO/OVNING_RENDERS ändras. Motorer/Arkiv orörda. */
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Förstå skillnaden mellan siffra och tal, och vad som gör ett tal udda eller jämnt.",
      "visning": null
    },
    {
      "id": "siffror:begrepp",
      "namn": "Siffror och tal (udda/jämnt · antal · störst/minst)",
      "parent": "siffror",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderSiffrorBegrepp",
      "begrepp": "Vad en siffra och ett tal är, udda/jämnt och att bygga tal av siffror.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Siffror och tal",
        "gruppordning": 0,
        "radordning": 0,
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
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderTalnamn",
      "begrepp": null,
      "visning": {
        "utbudslista": "d1",
        "grupp": "Siffror och tal",
        "gruppordning": 0,
        "radordning": 1,
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Platsvärden från tusental till tusendel. Tallinjen. Avgör en siffras värde i talet.",
      "visning": null
    },
    {
      "id": "position:begrepp",
      "namn": "Platsvärde & bygga tal",
      "parent": "position",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderPositionBegrepp",
      "begrepp": "Platsvärde, och skriva tal från ental, tiondelar, hundradelar …",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Positionssystemet",
        "gruppordning": 1,
        "radordning": 0,
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
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPositionRakna",
      "begrepp": "Tallinjen, storleksordna, talföljder och att öka/minska med en tiondel.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Positionssystemet",
        "gruppordning": 1,
        "radordning": 1,
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
      "roll": "karna",
      "formaga": "RESONERA",
      "generator": "renderPositionResonera",
      "begrepp": "Jämför tal som 9,1 och 9,09, och hitta tal som ligger mellan.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Positionssystemet",
        "gruppordning": 1,
        "radordning": 2,
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
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderEnhetsbyten",
      "begrepp": null,
      "visning": {
        "utbudslista": "d1",
        "grupp": "Positionssystemet",
        "gruppordning": 1,
        "radordning": 3,
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Dela upp tal som 54,2 = 5·10 + 4·1 + 2·0,1",
      "visning": null
    },
    {
      "id": "utvecklad:metod",
      "namn": "Skriv i utvecklad form",
      "parent": "utvecklad",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderUtveckladMetod",
      "begrepp": "Skriv talet i utvecklad form steg för steg.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Utvecklad form",
        "gruppordning": 2,
        "radordning": 0,
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
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderUtveckladRakna",
      "begrepp": "Vilket tal står på utvecklad form?",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Utvecklad form",
        "gruppordning": 2,
        "radordning": 1,
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Avgör om ett tal är primtal eller sammansatt. Bygg faktorträd och hitta primfaktorer.",
      "visning": null
    },
    {
      "id": "primtal:begrepp",
      "namn": "Primtal eller sammansatt?",
      "parent": "primtal",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderPrimtalBegrepp",
      "begrepp": "Är talet ett primtal eller sammansatt? Snabba flashcards.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Primtal & faktorträd",
        "gruppordning": 4,
        "radordning": 0,
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
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPrimtalRakna",
      "begrepp": "Dela upp tal i termer eller faktorer. Två, tre eller fyra stycken.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Primtal & faktorträd",
        "gruppordning": 4,
        "radordning": 1,
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
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderPrimtalMetod",
      "begrepp": "Bygg faktorträd – välj själv hur du delar upp.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Primtal & faktorträd",
        "gruppordning": 4,
        "radordning": 2,
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
      "roll": "karna",
      "formaga": "KOMMUNIKATION",
      "generator": "renderPrimtalKomm",
      "begrepp": "Skriv hela primtalsfaktoriseringen.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Primtal & faktorträd",
        "gruppordning": 4,
        "radordning": 3,
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
      "roll": "karna",
      "formaga": "RESONERA",
      "generator": "renderPrimtalResonera",
      "begrepp": "Förklara varför ett tal är primtal eller inte.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Primtal & faktorträd",
        "gruppordning": 4,
        "radordning": 4,
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
      "roll": "karna",
      "formaga": "PROBLEM",
      "generator": "renderPrimtalProblem",
      "begrepp": "Gåtor: vilket tal är jag?",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Primtal & faktorträd",
        "gruppordning": 4,
        "radordning": 5,
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
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderFaktoriseringBaklanges",
      "begrepp": null,
      "visning": {
        "utbudslista": "d1",
        "grupp": "Primtal & faktorträd",
        "gruppordning": 4,
        "radordning": 6,
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Reglerna för 2, 3, 5 och 10. Fördjupning: 4, 6 och 9.",
      "visning": null
    },
    {
      "id": "delbarhet:begrepp",
      "namn": "Vad är delbarhet?",
      "parent": "delbarhet",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderDelbarhetBegrepp",
      "begrepp": "Vad betyder delbarhet? Vad är en siffersumma?",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Delbarhet",
        "gruppordning": 5,
        "radordning": 0,
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
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderDelbarhetRakna",
      "begrepp": "Avgör snabbt om ett tal är delbart.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Delbarhet",
        "gruppordning": 5,
        "radordning": 1,
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
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderKonstrueraDelbar",
      "begrepp": null,
      "visning": {
        "utbudslista": "d1",
        "grupp": "Delbarhet",
        "gruppordning": 5,
        "radordning": 2,
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "T.ex. öka 9,92 med en tiondel, minska 10,09 med en hundradel.",
      "visning": null
    },
    {
      "id": "rakneträning:rakna",
      "namn": "Öka & minska (tiondel · hundradel · tusendel)",
      "parent": "rakneträning",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderRaknetraningRakna",
      "begrepp": "Öka och minska med en tiondel, hundradel eller tusendel.",
      "visning": {
        "utbudslista": "d1",
        "grupp": "Räkneträning",
        "gruppordning": 3,
        "radordning": 0,
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Term och summa, tiokompisar och hundrakompisar samt att dela upp tal i termer.",
      "visning": null
    },
    {
      "id": "add-begrepp:begrepp",
      "namn": "Begrepp",
      "parent": "add-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderAddBegrepp",
      "begrepp": "Vad menas med term och summa?",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Addition",
        "gruppordning": 0,
        "radordning": 0,
        "titel": "Begrepp",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": 2
      }
    },
    {
      "id": "add-begrepp:rakna",
      "namn": "Begrepp · Räkna",
      "parent": "add-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Räkna i huvudet med tiokompisar, decimaltal och tal i bråkform och blandad form.",
      "visning": null
    },
    {
      "id": "add-rakna:rakna",
      "namn": "Huvudräkning",
      "parent": "add-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderAddHuvudrakning",
      "begrepp": "Huvudräkning med tiokompisar, decimaltal och bråk.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Addition",
        "gruppordning": 0,
        "radordning": 1,
        "titel": "Huvudräkning",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "add-metoder",
      "namn": "Metoder",
      "parent": "addition",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Uppställning, talsorterna var för sig, flytta över och addition med negativa tal.",
      "visning": null
    },
    {
      "id": "add-metoder:metod",
      "namn": "Metoder",
      "parent": "add-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderAddMetod",
      "begrepp": "Lär dig och välj bland additionsmetoderna.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Addition",
        "gruppordning": 0,
        "radordning": 2,
        "titel": "Metoder",
        "etikett": "metod",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "add-problem",
      "namn": "Problemlösning",
      "parent": "addition",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Lös additionsproblem med lästal – välj svårighetsgrad själv.",
      "visning": null
    },
    {
      "id": "add-problem:problem",
      "namn": "Problemlösning",
      "parent": "add-problem",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "PROBLEM",
      "generator": "renderAddProblem",
      "begrepp": "Lös lästal med addition.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Addition",
        "gruppordning": 0,
        "radordning": 3,
        "titel": "Problemlösning",
        "etikett": "problemlösning",
        "formagaKey": "problem",
        "niva": null
      }
    },
    {
      "id": "sub-begrepp",
      "namn": "Begrepp",
      "parent": "subtraktion",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Term och differens – matematikens vokabulär för subtraktion. Dela upp en differens i termer.",
      "visning": null
    },
    {
      "id": "sub-begrepp:begrepp",
      "namn": "Begrepp",
      "parent": "sub-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderSubBegrepp",
      "begrepp": "Vad menas med term och differens?",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Subtraktion",
        "gruppordning": 1,
        "radordning": 0,
        "titel": "Begrepp",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": 2
      }
    },
    {
      "id": "sub-begrepp:rakna",
      "namn": "Begrepp · Räkna",
      "parent": "sub-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Räkna i huvudet över tiotalsgränsen, med decimaltal och med bråkform.",
      "visning": null
    },
    {
      "id": "sub-rakna:rakna",
      "namn": "Huvudräkning",
      "parent": "sub-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderSubHuvudrakning",
      "begrepp": "Huvudräkning med enkla tal, decimaltal och bråk.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Subtraktion",
        "gruppordning": 1,
        "radordning": 1,
        "titel": "Huvudräkning",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "sub-metoder",
      "namn": "Metoder",
      "parent": "subtraktion",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Uppställning, öka och minska lika, addition bakifrån och subtraktion med negativa tal.",
      "visning": null
    },
    {
      "id": "sub-metoder:metod",
      "namn": "Metoder",
      "parent": "sub-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderSubMetod",
      "begrepp": "Lär dig och välj bland subtraktionsmetoderna.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Subtraktion",
        "gruppordning": 1,
        "radordning": 2,
        "titel": "Metoder",
        "etikett": "metod",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "sub-problem",
      "namn": "Problemlösning",
      "parent": "subtraktion",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Lös subtraktionsproblem med lästal – välj svårighetsgrad själv.",
      "visning": null
    },
    {
      "id": "sub-problem:problem",
      "namn": "Problemlösning",
      "parent": "sub-problem",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "PROBLEM",
      "generator": "renderSubProblem",
      "begrepp": "Lös lästal med subtraktion.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Subtraktion",
        "gruppordning": 1,
        "radordning": 3,
        "titel": "Problemlösning",
        "etikett": "problemlösning",
        "formagaKey": "problem",
        "niva": null
      }
    },
    {
      "id": "mult-begrepp",
      "namn": "Begrepp",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Faktor, produkt, primtal och sammansatt tal. Faktorisera tal och bygg faktorträd.",
      "visning": null
    },
    {
      "id": "mult-begrepp:begrepp",
      "namn": "Begrepp",
      "parent": "mult-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderMultBegrepp",
      "begrepp": "Känn igen faktor, produkt, primtal och sammansatt tal.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Multiplikation",
        "gruppordning": 2,
        "radordning": 0,
        "titel": "Begrepp",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": 2
      }
    },
    {
      "id": "mult-begrepp:rakna",
      "namn": "Begrepp · Räkna",
      "parent": "mult-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
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
      "roll": "breddning",
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Träna tabellerna snabbt – tre nivåer med stigande svårighet.",
      "visning": null
    },
    {
      "id": "mult-tabell:rakna",
      "namn": "Multiplikationstabellen",
      "parent": "mult-tabell",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderMultTabell",
      "begrepp": "Snabba flashcards med multiplikationstabellen.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Multiplikation",
        "gruppordning": 2,
        "radordning": 1,
        "titel": "Multiplikationstabellen",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "mult-metoder",
      "namn": "Metoder för multiplikation",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Uppställning, talsorterna var för sig, dubbla och halvera, kompensation och dubbelparentes.",
      "visning": null
    },
    {
      "id": "mult-metoder:metod",
      "namn": "Metoder",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderMultMetoder",
      "begrepp": "Lär dig och välj bland flera multiplikationsmetoder.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Multiplikation",
        "gruppordning": 2,
        "radordning": 2,
        "titel": "Metoder",
        "etikett": "metod",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "mult-rakna",
      "namn": "Beräkningar",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Multiplikation med 10, 100 och 1000, stora tal, små tal och negativa tal.",
      "visning": null
    },
    {
      "id": "mult-rakna:rakna",
      "namn": "Beräkningar",
      "parent": "mult-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderMultRakna",
      "begrepp": "Blandade beräkningar – nivån anpassar sig.",
      "visning": null,
      "doljKarta": true
    },
    {
      "id": "mult-rakna:pow10",
      "namn": "Multiplikation med 10, 100 och 1000",
      "parent": "mult-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderMultRakna",
      "begrepp": null,
      "visning": {
        "utbudslista": "d5",
        "grupp": "Räkna med 10, 100 och 1000",
        "gruppordning": 0,
        "radordning": 0,
        "titel": "Multiplikation med 10, 100 och 1000",
        "etikett": "räkna",
        "formagaKey": "pow10",
        "niva": null
      }
    },
    {
      "id": "mult-rakna:stora",
      "namn": "Stora tal",
      "parent": "mult-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderMultRakna",
      "begrepp": null,
      "visning": {
        "utbudslista": "d6",
        "grupp": "Multiplikation med stora och små tal",
        "gruppordning": 0,
        "radordning": 0,
        "titel": "Stora tal",
        "etikett": "räkna",
        "formagaKey": "stora",
        "niva": null
      }
    },
    {
      "id": "mult-rakna:sma",
      "namn": "Små tal",
      "parent": "mult-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderMultRakna",
      "begrepp": null,
      "visning": {
        "utbudslista": "d6",
        "grupp": "Multiplikation med stora och små tal",
        "gruppordning": 0,
        "radordning": 1,
        "titel": "Små tal",
        "etikett": "räkna",
        "formagaKey": "sma",
        "niva": null
      }
    },
    {
      "id": "mult-rakna:storasma",
      "namn": "Stora och små tal",
      "parent": "mult-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderMultRakna",
      "begrepp": null,
      "visning": {
        "utbudslista": "d6",
        "grupp": "Multiplikation med stora och små tal",
        "gruppordning": 0,
        "radordning": 2,
        "titel": "Stora och små tal",
        "etikett": "räkna",
        "formagaKey": "storasma",
        "niva": null
      }
    },
    {
      "id": "mult-problem",
      "namn": "Problemlösning med lästal",
      "parent": "multiplikation",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Lästal i olika varianter och svårighetsgrad. Visa din kommunikation.",
      "visning": null
    },
    {
      "id": "mult-problem:problem",
      "namn": "Problemlösning",
      "parent": "mult-problem",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "PROBLEM",
      "generator": "renderMultProblem",
      "begrepp": "Lös lästal som handlar om multiplikation.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Multiplikation",
        "gruppordning": 2,
        "radordning": 4,
        "titel": "Problemlösning",
        "etikett": "problemlösning",
        "formagaKey": "problem",
        "niva": null
      }
    },
    {
      "id": "div-begrepp",
      "namn": "Begrepp",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Täljare, nämnare och kvot. Delbarhetsreglerna för 2, 3, 5, 10 samt 4 och 9, och talgåtor.",
      "visning": null
    },
    {
      "id": "div-begrepp:begrepp",
      "namn": "Begrepp",
      "parent": "div-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderDivBegrepp",
      "begrepp": "Känn igen täljare, nämnare och kvot.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Division",
        "gruppordning": 3,
        "radordning": 0,
        "titel": "Begrepp",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": 2
      }
    },
    {
      "id": "div-begrepp:rakna",
      "namn": "Begrepp · Räkna",
      "parent": "div-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Träna divisionstabellen snabbt – tre nivåer med stigande nämnare.",
      "visning": null
    },
    {
      "id": "div-tabell:rakna",
      "namn": "Divisionstabellen",
      "parent": "div-tabell",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderDivTabell",
      "begrepp": "Snabba flashcards med divisionstabellen.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Division",
        "gruppordning": 3,
        "radordning": 1,
        "titel": "Divisionstabellen",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "div-metoder",
      "namn": "Metoder",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Kort division och lång division (liggande stolen) – med genomgång och övning.",
      "visning": null
    },
    {
      "id": "div-metoder:metod",
      "namn": "Metoder",
      "parent": "div-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderDivMetoder",
      "begrepp": "Lär dig och öva kort och lång division.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Division",
        "gruppordning": 3,
        "radordning": 2,
        "titel": "Metoder",
        "etikett": "metod",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "div-rakna",
      "namn": "Beräkningar",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Division med 10, 100 och 1000, stora tal, små tal genom förlängning och negativa tal.",
      "visning": null
    },
    {
      "id": "div-rakna:rakna",
      "namn": "Beräkningar",
      "parent": "div-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderDivRakna",
      "begrepp": "Blandade beräkningar – nivån anpassar sig.",
      "visning": null,
      "doljKarta": true
    },
    {
      "id": "div-rakna:pow10",
      "namn": "Division med 10, 100 och 1000",
      "parent": "div-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderDivRakna",
      "begrepp": null,
      "visning": {
        "utbudslista": "d5",
        "grupp": "Räkna med 10, 100 och 1000",
        "gruppordning": 0,
        "radordning": 1,
        "titel": "Division med 10, 100 och 1000",
        "etikett": "räkna",
        "formagaKey": "pow10",
        "niva": null
      }
    },
    {
      "id": "div-rakna:stora",
      "namn": "Stora tal",
      "parent": "div-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderDivRakna",
      "begrepp": null,
      "visning": {
        "utbudslista": "d7",
        "grupp": "Division med stora och små tal",
        "gruppordning": 0,
        "radordning": 0,
        "titel": "Stora tal",
        "etikett": "räkna",
        "formagaKey": "stora",
        "niva": null
      }
    },
    {
      "id": "div-rakna:storasma",
      "namn": "Stora och små tal",
      "parent": "div-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderDivRakna",
      "begrepp": null,
      "visning": {
        "utbudslista": "d7",
        "grupp": "Division med stora och små tal",
        "gruppordning": 0,
        "radordning": 1,
        "titel": "Stora och små tal",
        "etikett": "räkna",
        "formagaKey": "storasma",
        "niva": null
      }
    },
    {
      "id": "div-rakna:sma",
      "namn": "Små tal – förlängning",
      "parent": "div-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderDivRakna",
      "begrepp": null,
      "visning": {
        "utbudslista": "d7",
        "grupp": "Division med stora och små tal",
        "gruppordning": 0,
        "radordning": 2,
        "titel": "Små tal – förlängning",
        "etikett": "räkna",
        "formagaKey": "sma",
        "niva": null
      }
    },
    {
      "id": "div-problem",
      "namn": "Problemlösning med lästal",
      "parent": "division",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Lästal i olika varianter och svårighetsgrad. Visa din kommunikation.",
      "visning": null
    },
    {
      "id": "div-problem:problem",
      "namn": "Problemlösning",
      "parent": "div-problem",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "PROBLEM",
      "generator": "renderDivProblem",
      "begrepp": "Lös lästal som handlar om division.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Division",
        "gruppordning": 3,
        "radordning": 4,
        "titel": "Problemlösning",
        "etikett": "problemlösning",
        "formagaKey": "problem",
        "niva": null
      }
    },
    {
      "id": "prio-samband",
      "namn": "Samband mellan räknesätt",
      "parent": "prio",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Hur addition och subtraktion hänger ihop, och hur multiplikation och division hänger ihop. Fyll i talet som saknas.",
      "visning": null
    },
    {
      "id": "prio-samband:rakna",
      "namn": "Samband mellan räknesätt",
      "parent": "prio-samband",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPrioSamband",
      "begrepp": "Hitta talet som saknas i rutan – två kategorier.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Prioriteringsregeln",
        "gruppordning": 4,
        "radordning": 0,
        "titel": "Samband mellan räknesätt",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "prio-prioritering",
      "namn": "Prioriteringsregeln",
      "parent": "prio",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "I vilken ordning räknar man? Parenteser, sedan multiplikation och division, sist addition och subtraktion.",
      "visning": null
    },
    {
      "id": "prio-prioritering:rakna",
      "namn": "Prioriteringsregeln",
      "parent": "prio-prioritering",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPrioBerakning",
      "begrepp": "Räkna ut uttryck med prioriteringsregeln – tre nivåer.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Prioriteringsregeln",
        "gruppordning": 4,
        "radordning": 1,
        "titel": "Prioriteringsregeln",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "prio-prioritering:metod",
      "namn": "Prioriteringsregeln · Metod",
      "parent": "prio-prioritering",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
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
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Den kommutativa, associativa och distributiva lagen – verktyg som gör uträkningar enklare.",
      "visning": null
    },
    {
      "id": "prio-lagar:rakna",
      "namn": "Räknelagar",
      "parent": "prio-lagar",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPrioLagar",
      "begrepp": "Öva de tre räknelagarna med tydliga mellanled.",
      "visning": {
        "utbudslista": "d2",
        "grupp": "Prioriteringsregeln",
        "gruppordning": 4,
        "radordning": 2,
        "titel": "Räknelagar",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": 2
      }
    },
    {
      "id": "neg-begrepp",
      "namn": "Begrepp och förståelse",
      "parent": "negativa",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Motsatta tal, storleksordna positiva och negativa tal samt talföljder.",
      "visning": null
    },
    {
      "id": "neg-begrepp:begrepp",
      "namn": "Begrepp och förståelse",
      "parent": "neg-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderNegBegrepp",
      "begrepp": "Motsatta talet, storleksordna och talföljder – tre kategorier.",
      "visning": {
        "utbudslista": "d3",
        "grupp": "Negativa tal",
        "gruppordning": 0,
        "radordning": 0,
        "titel": "Begrepp och förståelse",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "neg-rakna",
      "namn": "Räkna med negativa tal",
      "parent": "negativa",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Räkna med negativa tal i addition, subtraktion, multiplikation och division – även med flera faktorer.",
      "visning": null
    },
    {
      "id": "neg-rakna:rakna",
      "namn": "Räkna med negativa tal",
      "parent": "neg-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderNegRakna",
      "begrepp": "Addition och subtraktion, multiplikation och division, flera faktorer.",
      "visning": {
        "utbudslista": "d3",
        "grupp": "Negativa tal",
        "gruppordning": 0,
        "radordning": 1,
        "titel": "Räkna med negativa tal",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "avr-avrundning",
      "namn": "Avrundning",
      "parent": "avrundning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Begreppet närmevärde, avrundningsreglerna och att avrunda hela tal och decimaltal till olika platsvärden.",
      "visning": null
    },
    {
      "id": "avr-avrundning:begrepp",
      "namn": "Avrundning",
      "parent": "avr-avrundning",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderAvrAvrundning",
      "begrepp": "Närmevärde, avrunda hela tal och avrunda decimaltal – tre kategorier.",
      "visning": {
        "utbudslista": "d8",
        "grupp": "Avrundning och överslag",
        "gruppordning": 0,
        "radordning": 0,
        "titel": "Avrundning",
        "etikett": "begrepp",
        "formagaKey": null,
        "niva": null
      }
    },
    {
      "id": "avr-overslag",
      "namn": "Överslagsräkning",
      "parent": "avrundning",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Använd avrundning för att snabbt göra ungefärliga beräkningar i alla räknesätt.",
      "visning": null
    },
    {
      "id": "avr-overslag:rakna",
      "namn": "Överslagsräkning",
      "parent": "avr-overslag",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderAvrOverslag",
      "begrepp": "Överslagsberäkningar i addition, subtraktion, multiplikation och division.",
      "visning": {
        "utbudslista": "d8",
        "grupp": "Avrundning och överslag",
        "gruppordning": 0,
        "radordning": 1,
        "titel": "Överslagsräkning",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "prio-kombinationer",
      "namn": "Kombinationer av räknesätt (i–iv)",
      "parent": "prio-prioritering",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPrioBerakning",
      "begrepp": "Blanda ·, /, + och − i rätt ordning.",
      "visning": null
    },
    {
      "id": "prio-parenteser",
      "namn": "Parenteser med tal (v)",
      "parent": "prio-prioritering",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPrioBerakning",
      "begrepp": "Räkna parentesen först. Parentes med tal hör åk 7 (parentes i ekvationer = åk 8, k3).",
      "visning": null
    },
    {
      "id": "prio-negativt",
      "namn": "Svaret blir negativt (vi)",
      "parent": "prio-prioritering",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "fordjupning",
      "formaga": "RAKNA",
      "generator": "renderPrioBerakning",
      "begrepp": "Uttryck där resultatet blir negativt – utmaning.",
      "visning": null
    },
    {
      "id": "prio-potenser",
      "namn": "Potenser (vii)",
      "parent": "prio-prioritering",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": null,
      "begrepp": "Prioritering med potenser – framtid, kommer i åk 8.",
      "visning": null
    }
  ]
};
