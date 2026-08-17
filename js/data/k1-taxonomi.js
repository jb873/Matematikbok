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
      "implemented": true
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
      "id": "potenser",
      "namn": "Potenser",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Potenser: skrivsätt, evaluering, potenslagar och prioritering.",
      "grupp": "raknesatt",
      "implemented": true
    },
    {
      "id": "tiopotenser",
      "namn": "Tiopotenser",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Tal som tiopotens, potenslagarna med bas 10 och SI-prefixen kilo–tera.",
      "grupp": "raknesatt",
      "implemented": true
    },
    {
      "id": "grundpotenser",
      "namn": "Grundpotenser",
      "parent": null,
      "niva": "omrade",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Grundpotensform a·10ⁿ: skriva, multiplikation/division med koefficient och normalisering.",
      "grupp": "raknesatt",
      "implemented": true
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
      "roll": "karna",
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
      "roll": "karna",
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
      "namn": "Term och summa",
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
      "namn": "Tiokompisar och dela upp tal",
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
      "namn": "Metoder · Metod",
      "parent": "add-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderAddMetod",
      "begrepp": "Lär dig och välj bland additionsmetoderna.",
      "visning": null,
      "doljKarta": true
    },
    {
      "id": "add-metoder:uppstallning",
      "namn": "Uppställning",
      "parent": "add-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderAddUppstallning",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Addition",
        "gruppordning": 0,
        "radordning": 2,
        "titel": "Uppställning",
        "etikett": "metod",
        "formagaKey": "uppstallning",
        "niva": null
      }
    },
    {
      "id": "add-metoder:talsorterna",
      "namn": "Talsorterna var för sig",
      "parent": "add-metoder",
      "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderTalsorternaAdd",
      "begrepp": "Addera ental, tiotal och hundratal var för sig.",
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
      "namn": "Term och differens",
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
      "namn": "Metoder · Metod",
      "parent": "sub-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderSubMetod",
      "begrepp": "Lär dig och välj bland subtraktionsmetoderna.",
      "visning": null,
      "doljKarta": true
    },
    {
      "id": "sub-metoder:uppstallning",
      "namn": "Uppställning",
      "parent": "sub-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderUppstallningSubEnkel",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Subtraktion",
        "gruppordning": 1,
        "radordning": 2,
        "titel": "Uppställning",
        "etikett": "metod",
        "formagaKey": "uppstallning",
        "niva": null
      }
    },
    {
      "id": "sub-metoder:okaminska",
      "namn": "Öka och minska lika",
      "parent": "sub-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderOkaMinska",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Subtraktion",
        "gruppordning": 1,
        "radordning": 2.1,
        "titel": "Öka och minska lika",
        "etikett": "metod",
        "formagaKey": "okaminska",
        "niva": null
      }
    },
    {
      "id": "sub-metoder:bakifran",
      "namn": "Addition bakifrån",
      "parent": "sub-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderAdditionBakifran",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Subtraktion",
        "gruppordning": 1,
        "radordning": 2.2,
        "titel": "Addition bakifrån",
        "etikett": "metod",
        "formagaKey": "bakifran",
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
      "namn": "Faktor, produkt och primtal",
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
      "namn": "Faktorisera tal",
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
      "namn": "Faktorträd",
      "parent": "mult-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
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
      "namn": "Metoder för multiplikation · Metod",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderMultMetoder",
      "begrepp": "Lär dig och välj bland flera multiplikationsmetoder.",
      "visning": null,
      "doljKarta": true
    },
    {
      "id": "mult-metoder:uppstallning",
      "namn": "Uppställning",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderUppstallningMult",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Multiplikation",
        "gruppordning": 2,
        "radordning": 2,
        "titel": "Uppställning",
        "etikett": "metod",
        "formagaKey": "uppstallning",
        "niva": null
      }
    },
    {
      "id": "mult-metoder:uppstallning-stora",
      "namn": "Uppställning (båda faktorerna > 10)",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderUppstallningMult",
      "begrepp": "Uppställning när båda faktorerna är större än 10.",
      "visning": null
    },
    {
      "id": "mult-metoder:talsorterna",
      "namn": "Talsorterna var för sig",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderMultMetoder",
      "begrepp": "Multiplicera talsorterna var för sig.",
      "visning": null
    },
    {
      "id": "mult-metoder:dubbla",
      "namn": "Dubbla och halvera",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderMultMetoder",
      "begrepp": "Dubbla den ena faktorn och halvera den andra.",
      "visning": null
    },
    {
      "id": "mult-metoder:faktorer",
      "namn": "Dela upp i faktorer",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderMultMetoder",
      "begrepp": "Dela upp en faktor: 19·8 = 20·8 − 1·8.",
      "visning": null
    },
    {
      "id": "mult-metoder:termer",
      "namn": "Dela upp i termer (dubbelparentes)",
      "parent": "mult-metoder",
      "niva": "lovnod",
      "arskursRelevans": { "ak7": "mal" },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderMultMetoder",
      "begrepp": "Dela upp båda faktorerna i termer: 31·19 = (30+1)(20−1).",
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
      "roll": "karna",
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
        "ak7": "mal",
        "ak8": "repetition",
        "ak9": "mal"
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
        "ak7": "mal",
        "ak8": "repetition",
        "ak9": "mal"
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
        "ak7": "mal",
        "ak8": "repetition",
        "ak9": "mal"
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
        "ak7": "mal",
        "ak8": "repetition",
        "ak9": "mal"
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
      "namn": "Täljare, nämnare och kvot",
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
      "namn": "Delbarhetsregler",
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
      "namn": "Metoder · Metod",
      "parent": "div-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderDivMetoder",
      "begrepp": "Lär dig och öva kort och lång division.",
      "visning": null,
      "doljKarta": true
    },
    {
      "id": "div-metoder:kort",
      "namn": "Kort division",
      "parent": "div-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderDivKort",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Division",
        "gruppordning": 3,
        "radordning": 2,
        "titel": "Kort division",
        "etikett": "metod",
        "formagaKey": "kort",
        "niva": null
      }
    },
    {
      "id": "div-metoder:lang",
      "namn": "Lång division",
      "parent": "div-metoder",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "breddning",
      "formaga": "METOD",
      "generator": "renderDivLang",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Division",
        "gruppordning": 3,
        "radordning": 2.1,
        "titel": "Lång division",
        "etikett": "metod",
        "formagaKey": "lang",
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
      "namn": "Beräkningar · Räkna",
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
        "ak7": "mal",
        "ak8": "repetition",
        "ak9": "mal"
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
        "ak7": "mal",
        "ak8": "repetition"
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
        "ak7": "mal",
        "ak8": "repetition"
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
        "ak7": "mal",
        "ak8": "repetition",
        "ak9": "mal"
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
        "ak7": "mal",
        "ak9": "mal"
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
      "roll": "karna",
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
      "namn": "Räknelagar · Räkna",
      "parent": "prio-lagar",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPrioLagar",
      "begrepp": "Öva de tre räknelagarna med tydliga mellanled.",
      "visning": null,
      "doljKarta": true
    },
    {
      "id": "prio-lagar:kommutativa",
      "namn": "Kommutativa lagen",
      "parent": "prio-lagar",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderLagOvning",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Prioriteringsregeln",
        "gruppordning": 4,
        "radordning": 2,
        "titel": "Kommutativa lagen",
        "etikett": "räkna",
        "formagaKey": "kommutativa",
        "niva": null
      }
    },
    {
      "id": "prio-lagar:associativa",
      "namn": "Associativa lagen",
      "parent": "prio-lagar",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderLagOvning",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Prioriteringsregeln",
        "gruppordning": 4,
        "radordning": 2.1,
        "titel": "Associativa lagen",
        "etikett": "räkna",
        "formagaKey": "associativa",
        "niva": null
      }
    },
    {
      "id": "prio-lagar:distributiva",
      "namn": "Distributiva lagen",
      "parent": "prio-lagar",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "METOD",
      "generator": "renderLagOvning",
      "begrepp": null,
      "visning": {
        "utbudslista": "d2",
        "grupp": "Prioriteringsregeln",
        "gruppordning": 4,
        "radordning": 2.2,
        "titel": "Distributiva lagen",
        "etikett": "räkna",
        "formagaKey": "distributiva",
        "niva": null
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
      "id": "neg-rakna:addsub",
      "namn": "Räkna: addition och subtraktion",
      "parent": "neg-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal",
        "ak8": "repetition"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderNegAddSub",
      "begrepp": "Räkna plus och minus med negativa tal.",
      "visning": {
        "utbudslista": "d3",
        "grupp": "Negativa tal",
        "gruppordning": 0,
        "radordning": 1,
        "titel": "Räkna: addition och subtraktion",
        "etikett": "räkna",
        "formagaKey": "addsub",
        "niva": null
      }
    },
    {
      "id": "neg-rakna:multdiv",
      "namn": "Räkna: multiplikation och division",
      "parent": "neg-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal",
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderNegMultDiv",
      "begrepp": "Teckenreglerna för gånger och delat, samt flera faktorer.",
      "visning": {
        "utbudslista": "d3",
        "grupp": "Negativa tal",
        "gruppordning": 0,
        "radordning": 2,
        "titel": "Räkna: multiplikation och division",
        "etikett": "räkna",
        "formagaKey": "multdiv",
        "niva": null
      }
    },
    {
      "id": "bd-vaxla",
      "namn": "Bråk → decimal",
      "parent": "brak-decimal",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Skriva bråket i decimalform. Halva, fjärdedel, femtedel, åttondel, tiondel.",
      "visning": null
    },
    {
      "id": "bd-vaxla:rakna",
      "namn": "Bråk → decimal",
      "parent": "bd-vaxla",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderBrakDecimal",
      "begrepp": "Skriv bråket som decimaltal.",
      "visning": {
        "utbudslista": "d4",
        "grupp": "Bråkform och decimalform",
        "gruppordning": 0,
        "radordning": 0,
        "titel": "Bråk → decimal",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "bd-tillbrak",
      "namn": "Decimal → bråk",
      "parent": "brak-decimal",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Skriva decimaltalet som bråk i enklaste form.",
      "visning": null
    },
    {
      "id": "bd-tillbrak:rakna",
      "namn": "Decimal → bråk",
      "parent": "bd-tillbrak",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderDecimalBrak",
      "begrepp": "Skriv decimaltalet som bråk i enklaste form.",
      "visning": {
        "utbudslista": "d4",
        "grupp": "Bråkform och decimalform",
        "gruppordning": 0,
        "radordning": 1,
        "titel": "Decimal → bråk",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "bd-hundra",
      "namn": "Tiondelar & hundradelar",
      "parent": "brak-decimal",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Skriva tiondelar och hundradelar som bråk i enklaste form – förkortning.",
      "visning": null
    },
    {
      "id": "bd-hundra:rakna",
      "namn": "Tiondelar & hundradelar",
      "parent": "bd-hundra",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderHundraBrak",
      "begrepp": "Skriv decimaltalet som bråk i enklaste form (förkortas).",
      "visning": {
        "utbudslista": "d4",
        "grupp": "Bråkform och decimalform",
        "gruppordning": 0,
        "radordning": 2,
        "titel": "Tiondelar & hundradelar",
        "etikett": "räkna",
        "formagaKey": "rakna",
        "niva": null
      }
    },
    {
      "id": "bd-forlang",
      "namn": "Förläng till hundradelar",
      "parent": "brak-decimal",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Förlänga bråket till hundradelar och läsa av decimaltalet.",
      "visning": null
    },
    {
      "id": "bd-forlang:rakna",
      "namn": "Förläng till hundradelar",
      "parent": "bd-forlang",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak7": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderForlangDec",
      "begrepp": "Förläng till hundradelar och skriv decimaltalet.",
      "visning": {
        "utbudslista": "d4",
        "grupp": "Bråkform och decimalform",
        "gruppordning": 0,
        "radordning": 3,
        "titel": "Förläng till hundradelar",
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
      "id": "pot-begrepp",
      "namn": "Begrepp och skrivsätt",
      "parent": "potenser",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Skriva potenser, växla mot multiplikation och beräkna potensens värde.",
      "visning": null
    },
    {
      "id": "pot-begrepp:skriva",
      "namn": "Begrepp och skrivsätt · Skriv som potens",
      "parent": "pot-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderPotSkriva",
      "begrepp": "Skriv som potens ↔ multiplikation.",
      "visning": null
    },
    {
      "id": "pot-begrepp:evaluera",
      "namn": "Begrepp och skrivsätt · Beräkna värdet",
      "parent": "pot-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPotEvaluera",
      "begrepp": "Beräkna potensens värde.",
      "visning": null
    },
    {
      "id": "pot-addsub",
      "namn": "Räkna med potenser",
      "parent": "potenser",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Addition, subtraktion och blandat – räkna ut varje potens och operera sedan.",
      "visning": null
    },
    {
      "id": "pot-addsub:rakna",
      "namn": "Räkna med potenser · Räkna",
      "parent": "pot-addsub",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPotAddsub",
      "begrepp": "Evaluera-sedan-operera.",
      "visning": null
    },
    {
      "id": "pot-multdiv",
      "namn": "Potenslagar (samma bas)",
      "parent": "potenser",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Multiplikation och division med samma bas, lös ut bas/exponent och resonemang.",
      "visning": null
    },
    {
      "id": "pot-multdiv:rakna",
      "namn": "Potenslagar (samma bas) · Räkna",
      "parent": "pot-multdiv",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPotMultdiv",
      "begrepp": "Behåll basen, operera på exponenterna.",
      "visning": null
    },
    {
      "id": "pot-multdiv:losut",
      "namn": "Potenslagar (samma bas) · Lös ut bas/exponent",
      "parent": "pot-multdiv",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderPotLosut",
      "begrepp": "Hitta okänd bas eller exponent.",
      "visning": null
    },
    {
      "id": "pot-multdiv:resonera",
      "namn": "Potenslagar (samma bas) · Resonera",
      "parent": "pot-multdiv",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RESONERA",
      "generator": "renderPotResonera",
      "begrepp": "Antal faktorer, hur mycket större.",
      "visning": null
    },
    {
      "id": "tio-rakna",
      "namn": "Tiopotenser",
      "parent": "tiopotenser",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Tal som tiopotens och tvärtom, potenslagarna med bas 10, addition/subtraktion och lös ut exponenten.",
      "visning": null
    },
    {
      "id": "tio-rakna:skriva",
      "namn": "Tiopotenser · Skriv som potens",
      "parent": "tio-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderTioSkriva",
      "begrepp": "Skriv tal som tiopotens.",
      "visning": null
    },
    {
      "id": "tio-rakna:evaluera",
      "namn": "Tiopotenser · Beräkna värdet",
      "parent": "tio-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderTioEvaluera",
      "begrepp": "Beräkna tiopotensens värde.",
      "visning": null
    },
    {
      "id": "tio-rakna:rakna",
      "namn": "Tiopotenser · Räkna",
      "parent": "tio-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderTioMultdiv",
      "begrepp": "Multiplikation och division – behåll basen, operera på exponenterna.",
      "visning": null
    },
    {
      "id": "tio-rakna:addsub",
      "namn": "Tiopotenser · Addition och subtraktion",
      "parent": "tio-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderTioAddsub",
      "begrepp": "Addition och subtraktion – räkna ut varje tiopotens, operera sedan.",
      "visning": null
    },
    {
      "id": "tio-rakna:losut",
      "namn": "Tiopotenser · Lös ut bas/exponent",
      "parent": "tio-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderTioLosut",
      "begrepp": "Vad ska stå istället för x?",
      "visning": null
    },
    {
      "id": "gp-rakna",
      "namn": "Grundpotenser",
      "parent": "grundpotenser",
      "niva": "deldoman",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": null,
      "generator": null,
      "begrepp": "Grundpotensform a·10ⁿ: skriva fram och tillbaka, mult/div med koefficient och exponent, normalisering, addition/subtraktion och lös ut x.",
      "visning": null
    },
    {
      "id": "gp-rakna:skriva",
      "namn": "Grundpotenser · Skriv som potens",
      "parent": "gp-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderGpSkriva",
      "begrepp": "Skriv vanligt tal ↔ grundpotensform.",
      "visning": null
    },
    {
      "id": "gp-rakna:multdiv",
      "namn": "Grundpotenser · Multiplikation och division",
      "parent": "gp-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderGpMultdiv",
      "begrepp": "Multiplikation och division – koeff ×/÷, exponent +/−, normalisera.",
      "visning": null
    },
    {
      "id": "gp-rakna:addsub",
      "namn": "Grundpotenser · Addition och subtraktion",
      "parent": "gp-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderGpAddsub",
      "begrepp": "Addition och subtraktion – räkna ut varje tal, operera sedan.",
      "visning": null
    },
    {
      "id": "gp-rakna:losut",
      "namn": "Grundpotenser · Lös ut bas/exponent",
      "parent": "gp-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": "renderGpLosut",
      "begrepp": "Vilket tal ska x vara?",
      "visning": null
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
      "begrepp": "Prioritering med potenser (25−6²=−11) — övas som Öva-blad (dk8 blad 3); progressions-nod under prioriteringsregeln.",
      "visning": null
    },
    {
      "id": "pot-begrepp:tabell",
      "namn": "Potenstabell",
      "parent": "pot-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "RAKNA",
      "generator": null,
      "begrepp": "Fyll värde eller matcha potens (Öva-blad).",
      "visning": null
    },
    {
      "id": "pot-begrepp:figur",
      "namn": "Area i potensform",
      "parent": "pot-begrepp",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": null,
      "begrepp": "Kvadratens area som potens (Öva-blad).",
      "visning": null
    },
    {
      "id": "tio-rakna:prefix",
      "namn": "SI-prefix",
      "parent": "tio-rakna",
      "niva": "lovnod",
      "arskursRelevans": {
        "ak8": "mal"
      },
      "roll": "karna",
      "formaga": "BEGREPP",
      "generator": "renderTioPrefix",
      "begrepp": "Matcha tiopotens mot SI-prefix: kilo 10³, mega 10⁶, giga 10⁹, tera 10¹² (Öva-blad).",
      "visning": null
    }
  ]
};
