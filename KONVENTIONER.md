# KONVENTIONER — vad som är kontrakt, och vad som vaktar det

En konvention som bara finns som en kopia i en redan byggd fil ärvs inte. Nästa sida byggs utan den, och ingen märker det förrän någon klickar. Därför står varje konvention här med **var funktionen bor** och **vilken grind som kör den**.

> Regeln bakom listan: **det som är en funktion ärvs, det som är en kopia ärvs inte.**

Grindarna körs **en i taget** — parallell körning ger CDP-timeouts.

---

## Navigation

| Konvention | Funktionen bor i | Grind |
|---|---|---|
| **Kapitelsidan = renderaren, statusen härledd.** Ett nytt kapitel skapas genom att lägga till data. Ett delkapitel med innehåll har en fil och är öppet; ett utan fil är ett tonat kort utan länk. Inget status-fält får sättas för hand. | `js/kapitel/kapitelsida.js` · korten i `js/kapitel/kapitel-lista.js` · stilen i `js/kapitel/navsida.css` · mallen i `mallar/kapitelsida.html` | `verktyg/kapitelsida-grind.js` |
| **Kapitel-foten är en modul, texten är data.** Kunskapsläge + Träna inför provet. Utan egna fält gäller sjuans k1 ordagrant. | `js/fot/kapitel-fot.js` | (ingår i kapitelside-grinden via sidans render) |

## Delkapitlets sidor

| Konvention | Funktionen bor i | Grind |
|---|---|---|
| **Föreläsning = video ur registret.** Aldrig prosa, aldrig inline-video. | `js/data/forelasningar.js` · `AK8_FOREL.renderForelFlik` | `verktyg/delkapitel-grind.js` |
| **Bladen delar kanon-CSS och omslag.** Inga sidegna `.ovn-`/`.ak8-`-regler inline. | `js/motor/blad/ak8-blad-kanon.css` · `AK8_UI.renderSheet` | `verktyg/delkapitel-grind.js` |
| **Delkapitel-skalet** (flikar, band, underflikar). | `js/motor/blad/delkapitel-skal.js` | `verktyg/delkapitel-grind.js` |
| **Testet täcker övningen.** Testet hämtar sina tal ur öva-bladets talbank; en fråga per generator, alla noder. | bladmotorns `talBank(nod)` | `verktyg/delkapitel-grind.js` · `verktyg/testgen-fuzz.js` |
| **Drillen upprepar inte sig själv** inom en omgång. | `distinktOmgang` i metod-kärnan | `verktyg/delkapitel-grind.js` |

## Rutorna eleven skriver i

| Konvention | Funktionen bor i | Grind |
|---|---|---|
| **Måttet är ett golv, inte ett tak.** En smal ruta ska se ut som den gör när den är tom, och växa när innehållet kräver det. Aldrig `!important` på bredden — det slår ut både växten och mätningen. | `AK8_UI.grow` · `AK8_UI.vaxMedGolv` | `verktyg/smalruta-svep.js` · `verktyg/yt-kontrakt.js` |
| **En yta med rutor har keypad, tecken, autoSpace, bråkknapp och inga platshållare.** Kontraktet trycker på en knapp och prövar *varje* rutas tecken mot dess eget facit — inte bara ytans första ruta. | `js/motor/blad/ak8-blad-ui.js` | `verktyg/yt-kontrakt.js` |
| **Keypadens formgivning är EN fil**, med tre tydligt åtskilda lägen: aktiv, grå (tecknet gäller inte här — dämpad men läsbar, aldrig genomskinlig) och nedtryckt. Låg förr som en ordagrann kopia i nitton sidors `<style>`. | `js/motor/keypad.css` | `verktyg/yt-kontrakt.js` |
| **Varje synlig ruta räknas och rättas.** Nämnaren är antalet synliga svarsfält. | bladmotorernas kontroll | `verktyg/namnare-grind.js` |
| **Varje ruta i en rad markeras för sig.** | `AK8_UI.markeraRutor` (`res.per`) | `verktyg/flerruts-grind.js` |
| **Svarsformen är bindande** (blandad / bråk / decimal / enklaste) och står i data per grupp. | `Likhetsrattare.finalStatus` | `verktyg/svarform-koll.js` |

## Texten

| Konvention | Funktionen bor i | Grind |
|---|---|---|
| **All elevtext ligger i ett FALT-fält och godkänns per fil.** Ingen maskinskriven mening når eleven. | fälten `titel`/`rubrik`/`sub`/`fraga`/… | `verktyg/elevtext-grind.js` |
| **Ingen byggar-riktad text renderas för elev.** | — | `verktyg/platshallar-svep.js` |
| **Exemplet sammanfaller inte med en uppgift i samma grupp.** | `ExempelVakt` i metod-kärnan | `verktyg/exempel-svep.js` |
| **Namngivande ord får stå, instruerande inte.** "Omkrets:" namnger; "Skriv ett mellanled först" instruerar. | — | läslista (går inte att mäta) |

## Kopplingen till taxonomin

| Konvention | Funktionen bor i | Grind |
|---|---|---|
| **En generator pekar på en nod som finns, och en mastery-nyckel går att spåra tillbaka.** | `js/data/*-taxonomi.js` | `verktyg/koppling-grind.js` |
| **Byggt material är nåbart** — ingen nod med innehåll saknas i utbudslistan. | `visning.utbudslista` | `verktyg/synlig-grind.js` |
| **Nivåtaket per nod hålls.** | `visning.niva` · `DelkapitelSkal.bandFor` | `verktyg/nivatak-svep.js` |

---

## Hur en grind ska vara byggd

1. **Mät effekten, inte attributet.** `getComputedStyle().fontFamily` säger `'Cormorant Garamond'` även när filen inte finns; `scrollWidth` säger att texten ryms så fort den scrollats; ett `data-`-attribut säger vad någon tänkte, inte vad eleven ser. En grind som mäter formen blir ett hinder för allt som gör rätt på ett annat sätt.
2. **Mät på rätt ställe.** En sida kan bära flera keypads och flera flikar. Mät per flik, per blad, per yta.
3. **Negativt verifiera varje ben.** Återinför felet och se att grinden fäller — och kontrollera *varför* den faller. Ett prov som faller av fel skäl verifierar ingenting.
4. **Inget undantag i grinden.** Går något inte att mäta ska markupen ändras, inte grinden få ett undantag. Går det ändå inte: skriv ned gränsen i grindens huvud.
5. **En i taget.** Parallell körning ger CDP-timeouts.
