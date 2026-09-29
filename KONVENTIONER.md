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

## Regler som ingen grind vaktar ännu

De här är lika bindande som allt annat i filen. Skillnaden är att de i dag bärs av att någon minns dem — och **allt som bara står nedskrivet glöms**. Kolumnen längst till höger säger vad som skulle krävas för att flytta regeln från minnet till en mätning.

| Regel | Var den gäller | Mätbar? | Vad som krävs |
|---|---|---|---|
| **Inga hjälptexter i öva.** Öva-bladet ställer uppgiften; det förklarar inte hur man löser den. | alla öva-blad | **Ja, billigt** | Hjälptexten är ett eget element — men facket har **två namn**: `.ak8-hint` (åttans `gruppRubrik`) och `.brak-hint` (sjuans bråk-kärna). Ett svep som listar dem på öva-ytor är en kort körning; båda klasserna måste med. Skilj på hjälptext **före** uppgiften och rättarens **besked efter** svar (`Likhetsrattare`, åttans mellanleds-besked) — det senare är återkoppling och ska stå kvar. Bäst form: svepet listar, Joachim dömer en gång, den godkända mängden låses som elevtext-registret. GRÄNS: fångar bara text som ligger i facket — en instruerande mening inbakad i en rubrik ser det inte, samma lucka som elevtext-låsets fältlista. **MÄTT 2026-09-30: regeln hålls inte.** Sjuans d4 renderar två hjälptexter ovanför uppgifterna ("Tänk på: skriv decimaltal med komma…", "Tänk på: en tiondel skrivs med nämnaren 10…"). |
| **Mellanled rättas på värde**, inte på form. Eleven får skriva vägen som hen räknar. | `Likhetsrattare.provaKedja` och alla kedjerutor | **Ja, medel** | En fuzz som tar varje kedjas facit, skriver om det med bevarat värde (kasta om termer, `3 · 4` → `4 · 3`, lägg till ett likvärdigt led) och kräver att rättaren godtar. Halvfabrikaten finns: `evalArith` räknar ut värden, `AlgBrak` jämför polynom. |
| **Bekräftelsesteg i drillar** — inget auto-advance. Eleven ska hinna se att svaret var rätt. | drillarnas flöde (ram-filerna) | **Ja, billigt** | `delkapitel-grind` spelar redan en hel omgång per drill för distinkthetens skull. Benet blir: efter ett svar får nästa fråga inte dyka upp förrän bekräftelse-kontrollen klickats. Maskineriet finns; det är ett tillägg, inte ett nytt verktyg. |
| **Ingen förvald ruta** i drillarna. | drillarna | **Ja, billigt** | `document.activeElement` får inte vara en `input` när en fråga just renderats. Piggybackar på samma drill-omgång. ⚠️ OBS: bladkärnorna fokuserar första rutan med flit (`blad-karna-b.js:1370`, `blad-karna.js:580`) — regelns räckvidd måste sägas exakt innan den mäts, annars fäller den bladen för något som är avsiktligt. |
| **Figurer ritas om med egna värden.** En figur som återanvänds med nya tal ska visa de nya talen. | `SvgAlgebraFigur`, `SvgTermometer`, `svg-andel`, `svg-tallinje` | **Delvis** | En figur som *genereras ur data* är rätt per konstruktion; risken är en handskriven SVG eller en figur som behållit gamla tal. Mätningen: varje tal som syns i figuren ska finnas i radens data. Det kräver att figuren bär sina värden i DOM (ett `data`-attribut på figur-elementet) — den kopplingen finns inte i dag och måste läggas till först. |
| **En nod finns när färdigheten bedöms separat.** Bedöms något för sig ska det ha en egen plats i taxonomin, annars försvinner evidensen in i en grannfärdighet. | taxonomin ⟷ bladen/testen | **Nej, inte som dom** | Att två färdigheter är *olika* är en bedömning, inte en mätning. Det mekaniska som går: lista grupper som rättas för sig (egen rättar-typ eller egen svarsform) men loggar till samma nod som en strukturellt annorlunda grupp. Det ger **kandidater att läsa**, aldrig ett grönt eller rött. |
| **Delad nod loggas i sin hemvist.** Samma färdighet i två årskurser är EN nod; årskursen taggar den, den kopieras aldrig. | `js/data/*-taxonomi.js`, alla generatorer | **Ja, låg–medel** | `koppling-grind` kontrollerar redan att varje loggad nyckel finns i taxonomin. Tillägget: ingen färdighet får vara definierad på två ställen (dubblett-id eller två noder med samma namn/innehåll i olika kapitel), och en generators loggade nyckel ska vara nodens kanoniska id. |

**Fem av sju kan bli riktiga grindar** (hjälptexter, mellanled på värde, bekräftelsesteg, förvald ruta, delad nod). **En kräver ett datakrok först** (figurerna — figuren måste bära sina värden). **En kan aldrig bli mer än en läslista** (nod när färdigheten bedöms separat), eftersom den vilar på en bedömning av vad som är två olika färdigheter.

---

## Hur en grind ska vara byggd

1. **Mät effekten, inte attributet.** `getComputedStyle().fontFamily` säger `'Cormorant Garamond'` även när filen inte finns; `scrollWidth` säger att texten ryms så fort den scrollats; ett `data-`-attribut säger vad någon tänkte, inte vad eleven ser. En grind som mäter formen blir ett hinder för allt som gör rätt på ett annat sätt.

2. **Mät aldrig något som beror på vem som kör provet.** `document.fonts.check('16px "Cormorant Garamond"')` svarar ja om typsnittet råkar vara **installerat på maskinen** — grönt hos den som bygger, rött hos eleven som saknar det. Den sortens grind är farligare än ingen grind alls, eftersom den är grön just där någon tittar. Mät vad **sidan själv levererar** (en FontFace i `document.fonts` kommer från sidans `@font-face`), aldrig vad datorn råkar ha. Samma sak gäller skärmstorlek, installerade teckensnitt, tidszon, språkinställning och allt annat som följer med maskinen och inte med sidan. Vill du pröva ett villkor som beror på omgivningen — telefonbredd, till exempel — så **ställ in omgivningen i provet** (`cdp-kor.js --viewport`) i stället för att lita på den du råkar ha.

3. **Mät på rätt ställe.** En sida kan bära flera keypads och flera flikar. Mät per flik, per blad, per yta.

4. **Negativt verifiera varje ben.** Återinför felet och se att grinden fäller.

5. **Ett prov som faller av fel skäl verifierar ingenting.** Läs *varför* grinden blev röd, inte bara *att* den blev det. KORT-provet i kapitelside-grinden gav ett kommer-kort en länk till en fil som inte fanns; grinden föll — men på den trasiga länken, inte på klickbarheten. Det hade sett ut som en fungerande negativ verifiering av ett ben som i själva verket aldrig prövades. Bryt den mekanism benet påstår sig vakta, ingenting annat, och kontrollera att brottet som rapporteras är benets eget.

6. **Inget undantag i grinden.** Går något inte att mäta ska markupen ändras, inte grinden få ett undantag. Går det ändå inte: skriv ned gränsen i grindens huvud.

7. **En i taget.** Parallell körning ger CDP-timeouts.
