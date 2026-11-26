# KONVENTIONER — vad som är kontrakt, och vad som vaktar det

**Läs först.** Det här är matterepots regeldokument. Allt som byggs under `ak7/`, `ak8/`, `ak9/`, `js/` och `verktyg/` lyder under det.

En ny observation som kan påverka **plattformen** — alltså också geografi, historia, kemi och svenska — skrivs i [`PLATTFORMS-ANDRINGAR.md`](PLATTFORMS-ANDRINGAR.md), inte här. Hit flyttas den när den är beslutad och har en funktion att bo i.

**§1–§6 är mattens egna** (navigation, delkapitelsidor, rutor, text, taxonomi — och de regler ingen grind vaktar ännu). Sektionen **Delade plattformsregler** längst ner är däremot ordagrant samma text som i de fyra andra ämnenas `KOMPONENTER-INNEHALL`: ändras den här ska den speglas, och DELAD-BAS höjas i alla ämnen samtidigt.

En konvention som bara finns som en kopia i en redan byggd fil ärvs inte. Nästa sida byggs utan den, och ingen märker det förrän någon klickar. Därför står varje konvention här med **var funktionen bor** och **vad som vaktar den**.

> Regeln bakom listan: **det som är en funktion ärvs, det som är en kopia ärvs inte.**

Grindarna körs **en i taget** — parallell körning ger CDP-timeouts.

Olänkade gamla sidor mäts inte av grindarna; de står kvar som arkiv tills de tas bort. Joachim 2026-11-26.

**Kolumnen "Vad vaktar den" är ärlig.** Står det ett verktyg finns ett prov som fäller när regeln bryts. Står det `—` finns ingen mätning, och regeln bärs bara av att någon minns den. **En tom cell är en TODO, inte ett klartecken.** Den ska skava.

---

## Regel 0 — inga beslut utan Joachims godkännande

Den här filen är kontraktet. Varje chatt och varje Code-pass som rör matteboken läser den **FÖRST** och bygger på det som redan står här.

- Finns en konvention: följ den exakt och bygg på **funktionen** där den bor — kopiera aldrig in en parallell variant (det är vad resten av filen vaktar mot).
- Saknas en regel för det som behövs: **stanna, lägg fram alternativ, fråga Joachim.** Gissa aldrig, "kör inte bara på".
- Inget nytt designval, ny komponent eller ny regel införs utan Joachims godkännande. En ny plattformsobservation skrivs i [`PLATTFORMS-ANDRINGAR.md`](PLATTFORMS-ANDRINGAR.md) tills den är beslutad.

**Vad vaktar den:** — (ingen grind; bärs av att den står först och att varje pass läser filen.)

---

## §1 Navigation

| Konvention | Funktionen bor i | Vad vaktar den |
|---|---|---|
| **Kapitelsidan = renderaren, statusen härledd.** Ett nytt kapitel skapas genom att lägga till data. Ett delkapitel med innehåll har en fil och är öppet; ett utan fil är ett tonat kort utan länk. Inget status-fält får sättas för hand. | `js/kapitel/kapitelsida.js` · korten i `js/kapitel/kapitel-lista.js` · stilen i `js/kapitel/navsida.css` · mallen i `mallar/kapitelsida.html` | `verktyg/kapitelsida-grind.js` |
| **Kapitel-foten är en modul, texten är data.** Kunskapsläge + Träna inför provet. Utan egna fält gäller sjuans k1 ordagrant. | `js/fot/kapitel-fot.js` | `verktyg/kapitelsida-grind.js` (indirekt — faller via sidans render) |

## §2 Delkapitlets sidor

| Konvention | Funktionen bor i | Vad vaktar den |
|---|---|---|
| **Föreläsning = video ur registret.** Aldrig prosa, aldrig inline-video. | `js/data/forelasningar.js` · `AK8_FOREL.renderForelFlik` | `verktyg/delkapitel-grind.js` |
| **Bladen delar kanon-CSS och omslag.** Inga sidegna `.ovn-`/`.ak8-`-regler inline. | `js/motor/blad/ak8-blad-kanon.css` · `AK8_UI.renderSheet` | `verktyg/delkapitel-grind.js` |
| **Delkapitel-skalet** (flikar, band, underflikar). | `js/motor/blad/delkapitel-skal.js` | `verktyg/delkapitel-grind.js` |
| **Testet täcker övningen.** Testet hämtar sina tal ur öva-bladets talbank; en fråga per generator, alla noder. | bladmotorns `talBank(nod)` | `verktyg/delkapitel-grind.js` · `verktyg/testgen-fuzz.js` |
| **Drillen upprepar inte sig själv** inom en omgång. | `distinktOmgang` i metod-kärnan | `verktyg/delkapitel-grind.js` |

## §3 Rutorna eleven skriver i

| Konvention | Funktionen bor i | Vad vaktar den |
|---|---|---|
| **Måttet är ett golv, inte ett tak.** En smal ruta ska se ut som den gör när den är tom, och växa när innehållet kräver det. Aldrig `!important` på bredden — det slår ut både växten och mätningen. | `AK8_UI.grow` · `AK8_UI.vaxMedGolv` | `verktyg/smalruta-svep.js` · `verktyg/yt-kontrakt.js` |
| **En yta med rutor har keypad, tecken, autoSpace, bråkknapp och inga platshållare.** Kontraktet trycker på en knapp och prövar *varje* rutas tecken mot dess eget facit — inte bara ytans första ruta. | `js/motor/blad/ak8-blad-ui.js` | `verktyg/yt-kontrakt.js` |
| **Keypadens formgivning är EN fil**, med lägena aktiv och nedtryckt. Låg förr som en ordagrann kopia i nitton sidors `<style>`. Det grå läget finns kvar i CSS:en men ska **inte användas för att säga att ett tecken inte gäller här** — se regeln nedan. | `js/motor/keypad.css` | `verktyg/yt-kontrakt.js` · `verktyg/keypad-grind.js` |
| **Keypaden är alltid helt upplåst.** Alla tecken tända, på varje yta med inmatning, som en miniräknare. Eleven får välja fel operation — addera där multiplikation krävs — och det är meningen: **att välja räknesätt är elevens ansvar, inte gränssnittets.** En grå knapp talar om vilket räknesätt uppgiften vill ha, och tar därmed bort själva valet som skulle övas. Rättaren säger efteråt om valet var rätt; keypaden ska inte säga det i förväg. Regeln ersatte "bara det rättaren accepterar är tänt" (2026-10-03) — den gamla formuleringen stred mot sig själv och lagades om och om igen. Gråa inte ut en knapp för att tecknet "inte gäller här". | `js/motor/keypad.css` · ingen gråning i `AK8_UI.bindKeypad` | `verktyg/keypad-grind.js` |
| **Inget dokument blir bredare än vyporten.** Blir det bredare kan eleven scrolla sidled på hela sidan, och på telefon glider uppgiften ur bild medan hon skriver. Brett innehåll — tabeller, figurer, flikrader — scrollar i sin **egen** ruta eller radbryter. | sidornas layout; tabeller via `.ak8-tabell` i `ak8-blad-kanon.css` | `verktyg/yt-kontrakt.js` (BREDD, mätt på 360 px i egen körning) |
| **En uppgift som begär mellanled har plats för det.** Bär rubriken markören *"visa mellanled"* ska varje rad ha två svarsrutor eller en kedjestruktur — ett enda fält rymmer bara svaret, och då finns ingen plats för metoden som efterfrågas. Äldre uppgifter bär signalen i **metodnamnet** i stället ("talsorterna var för sig", "dubbla och halvera"); de står i grindens legacy-vokabulär och ska **retrofittas med markören**, varpå listan töms och grinden läser en entydig signal. Nya mellanledsuppgifter får markören från start. | radtypen i bladets data (kedjerad / mellanledsrad, inte `enkel`) | `verktyg/mellanled-grind.js` |
| **Samma värde, flera skrivsätt — samma dom.** Tusentalsavgränsaren är ett skrivsätt, inte ett annat tal: `1 400` och `1400` ska godkännas lika, liksom `12 000` och `1 400 000`. Detsamma gäller keypadens − mot tangentbordets `-`, och decimalkomma mot punkt. Saneringen är smal med flit — **bara mellanslag MELLAN TVÅ SIFFROR** tas bort, så `3 · 4` och `6,8` läses som förut och `1 400,5` blir `1400,5`. **Rätta aldrig elevens text med rått `parseInt`:** `parseInt('1 400')` är `1`, alltså inte ett avvisat svar utan ett tyst felläst tal, och eleven får fel på ett rätt svar. Läs genom den delade parsern. | `AK8_UI.pNum` (decimaltal) · `AK8_UI.pInt` (heltal) · `AK8_UI.avTusental` — anropas, kopieras inte | `verktyg/yt-kontrakt.js` (TUSENTAL + MINUS, med `--sabba tusental` som motprov) |
| **Uttrycksrutan godtar uttrycksformen, inte det uträknade värdet.** Där facit är ett uttryck ("25 + 12", "5·100+6·10+7·1", "3·5") underkänns ett ensamt tal ("37", "567", "15"); likvärdiga uttryck godkänns som förut ("12 + 25", "10x" för "10 · x"). Ett ensamt tal godtas bara där facit självt är ett tal. Samma princip som *en redan löst ekvation godtas inte* (problemlösningens rättning): formen är det uppgiften tränar. *Joachim 2026-11-21.* | `blad-karna-b.js` (rättningen av `data-uttryck`, `ensamtTal`) | **—** mätt 2026-11-21 (k1 d1 och d10: 12 rutor godkände förut värdet, nu 0); rök-vakten per blad |
| **Delvis uträknat godtas inte heller — men bara i TECKNA, inte i FÖRENKLA.** Två fall, och skillnaden får inte glida: **(1) Facit UTAN bokstäver = teckna.** Bara den tecknade formen godtas, termer och faktorer i valfri ordning ("2·8 + 4·10", "10·4 + 8·2" för "4·10 + 2·8"). Ingen uträkning, hel eller delvis: "56", "40 + 16", "4·10 + 16", "500+60+7", "5·100+6·10+7" underkänns. Uträknad = färre räkneoperationer än facit, eller ett tal som inte står i facit. En annan likvärdig form med facits egna tal godtas ("2·2·9" bland faktoriseringarna av 36). **(2) Facit MED bokstäver = förenkla.** Förenklingen är det som tränas, så förenklade och oförenklade likvärdiga svar godtas: "y + 3" för "y − 3 + 6", "2x + 7" för "x + x + 7", "4x + 8" för "x + x + 4 + x + x + 4". *Joachim 2026-11-22.* | `blad-karna-b.js` (`utraknat`, i rättningen av `data-uttryck`; fall 2 = `jamforFler`/`jamforForenkla` som förut) | **—** testbatteri 2026-11-22 (5 sidor, 18 svar bytte från godkänt till underkänt, inget godkänt likvärdigt svar ändrades) |
| **En faktorisering har ingen faktor 1.** Där facit är en produkt av tal (skriv 36 som produkt) är talet självt gånger 1 den triviala formen, inte en faktorisering: "1·36" och "36·1" underkänns. Skälet är faktorn 1 — inte att 36 saknas i facit — så regeln är avsiktlig och gäller även om facit en dag skulle innehålla talet. *Joachim 2026-11-22.* | `blad-karna-b.js` (`trivialFaktorisering`, prövas före `utraknat`) | **—** testbatteriet |
| **En byggd flik är klickbar — en tom plats är det inte.** Delflikarna är olika *uppgiftstyper* (Stora tal / Små tal / Lästal), inte en stege: eleven väljer fritt, och grått är fel. Undantaget är bladet **utan uppgifter** — platsen syns men öppnas inte (`is-kommer`), för en flik som leder in i tomrum är värre än ingen flik. Gränsen avgörs av **innehåll, inte av flaggan**: har bladet svarsrutor ska fliken öppna. **Nivå 1 och 2 är ALLTID klickbara** — en duktig elev hoppar fritt uppåt, så **är det bara två nivåer är ingen låst.** Låset hör till ett **tredje** steg och uppåt: nivå 3 är öppen om och endast om nivån under är gjord, läst ur `<prefix>_naddNiva<n>_<bladId>` i localStorage (elev-lokalt). Antalet steg är **data** (`def.nivaer`), inte två hårdkodade knappar — ett tredje steg läggs till i data, och både nyckeln och vidare-knappen följer med. Nivå 3 förväntas bli vanligare i åttan och nian. **Vad "gjord" betyder är ett valbart krav i den delade spärren** (`NivaRad.klarade`, `js/motor/blad/nivarad.js` — det finns EN spärr, ingen andra i mastery-modulen, A1): utan krav högst två fel (dagens sidor, oförändrat); med `{ andel: 0.8 }` minst 80 % rätta **rutor**, räknat på rutor och inte på uppgifter. Varianter av samma steg delar bladId, så Blad 2A eller 2B räcker. Ett låst blad på momentsidan står med 🔒 utan länk (ingen ny elevtext); en direktlänk till ett låst blad (`uppgift.html?blad=3A`) öppnar inte bladet utan skickar till momentsidan, där låset syns i sitt sammanhang. Första användaren: "Tolka och teckna uttryck" (k3 Del1), nyckeln `k3d1_naddNiva3_tolka`. *Joachim 2026-11-22.* *Regeln ersatte „den högsta nivån är villkorad” (2026-10-03), som med två nivåer kräver det MOTSATTA — och dagens tre nivårader (ak7/k2 d2, d3, d6) hade nivå 2 låst, alltså mot regeln.* | flikkonfigurationen i sidan (`kommer`) · `niva2Upplast` i bladmotorerna | `verktyg/flik-grind.js` — mäter innehåll, och **simulerar eleven** i tre tillstånd (tom lagring → låst, nivån under gjord → öppen, tom igen → låst). Komplement till `tonad-svep`/`synlig-grind`, som vaktar motsatsen |
| **Taket mäts mot raden, inte mot en konstant.** En ruta som ska växa får växa så länge raden har plats. Gränsen var ett tal — 340 px — utan koppling till layouten, och klippte ett riktigt svar mitt i (åttans d3: fyra sidor adderade behöver 557 px, raden hade 1139). 340 står kvar som **golv för taket**, så en smal vy beter sig som förut. Hållaren söks från **föräldern**: `closest()` matchar elementet självt, och svarsrutan bär `.ovn-kedja` — annars mäts rutan mot sin egen högerkant och taket blir konstanten igen. | `AK8_UI.grow` → `takFor` | `verktyg/yt-kontrakt.js` (TAK, med `--sabba tak` som motprov; benet gäller **uttrycksrutor** — en 520 px-sträng i en talruta fäller varje avsiktligt kompakt ruta) |
| **K-A. Deluppgiftsbokstav bara vid flera deluppgifter.** Bokstaven (a/b/c/d) finns bara för att skilja flera deluppgifter åt — är de inte flera, är den brus. Flera deluppgifter → a, b, c, d. En enda → ingen bokstav. Figurrader bär inget svar och räknas inte som deluppgifter. | `lbl(bokstav)` i `blad-karna-b.js` — ETT ställe, inte sjutton | `verktyg/uppgift-grind.js` (BOKSTAV, med `--sabba bokstav`; EGEN RAD, med `--sabba egenrad`) |
| **K-B. Beräkna-uppgiften är en kedja i tre led.** Innehåller uppgiften en beräkning säger rubriken **"beräkna"** — inte en omformulering varje gång — och rutorna är: **1** skriv av det förenklade uttrycket · **2** ersätt variabeln med siffror · **3** genomför beräkningen → svar. Kedjan kan ha **fler led** när prioriteringsregeln kräver flera steg: antalet rutor följer beräkningen, inte ett fast tal, och knappen "+ led" lägger till ett steg. Uppgiften bär "visa mellanled"-markören. **Varje ruta bär sitt eget facit i markupen** — en kedja utan facit per ruta kräver ett undantag i varje grind som fyller rutor, vilket d4:s fria kedja redan kostat. | `varde`-raden i `blad-karna-b.js` (`.ovn-berakna`), ersättningsledets facit byggs mekaniskt ur uttrycket och x-värdet | `verktyg/uppgift-grind.js` (BERÄKNA, med `--sabba berakna`) · `verktyg/mellanled-grind.js` (att markören har plats) |
| **K-C. "Skriv ett uttryck och förenkla" = två rutor.** Uppgiftstypen *skriv ett uttryck OCH förenkla det* är två steg, alltså två rutor: uttrycket, sedan det förenklade. Står det minus framför en parentes i elevens uttryck kommer mellanledsrutan emellan (regel 7). Strukturen följer uppgiftstypen och formuleras inte om. **Uttrycket eleven ska ställa upp visas aldrig på sidan** — är uppställningen uppgiften, skriver eleven den själv. | radtypen `skrivforenkla` i `blad-karna-b.js` | `verktyg/uppgift-grind.js` (TVÅRUTOR, med `--sabba rutor`) · `verktyg/yt-kontrakt.js` (FACITLÄCKA) |
| **K-D. Breda mellanled bryts strukturerat — aldrig inklämt.** När ett mellanled (andra eller tredje rutan i en kedja) inte ryms på raden ska det **börja på en ny rad med struktur** — inte klämmas in i slutet av föregående rad. En nödbrytning som lämnar en bred ruta ensam och inträngd i radens slut ser trasig ut och är inte tillåten. Hör ihop med K-E: breda rutor från start ger fula brytningar, korta rutor som växer ger mjuka. | kedjeradens layout i `blad-karna-b.js` (`.ovn-berakna`) och `ak7-delkapitel-kanon.css` | `verktyg/brytning-grind.js` (K-D) — mäter var raden bryter och hur mycket plats den inklämda rutan fick |
| **K-E. Korta svar får korta rutor som växer.** Vanliga tal och korta uttryck: rutan är **kort som golv** (inte fast bred), **växer med innehållet** (`grow()` — golvet är minimimåttet, inte fast bredd) och **får bryta fritt** till ny rad när den växer. En kort ruta som bryter ser bra ut: den börjar liten och bryter mjukt. Gör inte alla rutor breda "för säkerhets skull" — det är vad som orsakar K-D:s fula brytningar. Skärpning av *måttet är ett golv, inte ett tak* högst upp i paragrafen: där gällde regeln växten, här gäller den **valet av startbredd**. | `AK8_UI.grow` · `AK8_UI.vaxMedGolv` · klassvalet i radtyperna (`.ovn-in` mot `.ovn-in.bred`) | `verktyg/brytning-grind.js` (K-E) — en ruta vars facit är kort men som ritas med fast bred klass fälls |
| **K-F. Streck mellan huvuduppgifter — inte mellan deluppgifter.** Separationen hamnar där den betyder något. **Tydligt streck mellan huvuduppgifterna** (1, 2, 3 …), så ögat ser var en uppgift slutar och nästa börjar. **Inga streck mellan deluppgifterna** (a, b, c …) — de hör till samma uppgift och ska läsas som en grupp. De gamla tunna deluppgiftsstrecken var så svaga att ingen såg dem; de gjorde inget jobb och är borttagna. **Ett slags streck, på ett ställe** — ingen tvetydighet om vilken linje som betyder vad. | `.ovn-grupp` i `ak7-delkapitel-kanon.css` och `.ak8-grupp` i `ak8-blad-kanon.css` — gruppen bär strecket, raden bär inget. Balansmetodens kedja (2026-10-21): `.eq-grupp` i `ekv-kedja.css`, deluppgiften `.uppgift` utan streck | `verktyg/brytning-grind.js` (K-F) — avdelare mellan deluppgifter fäller, saknad avdelare mellan huvuduppgifter fäller |
| **K-G. Mellanrum kring beräkningstecken — inte annars.** Mellanrum krävs kring **binära** räknetecken, alltså en operation mellan två delar: `5 + 4`, `3x − 6`, `3 · x`, `… = 18`. Inget mellanrum där delarna hör ihop: **förtecken** (`−5`, inte `− 5`), **koefficient mot parentes** (`2(3x − 6)`, inte `2 (3x − 6)`) och **parentes mot sitt innehåll** (`(3x − 6)`, inte `( 3x − 6 )`). Skillnaden är binärt mot unärt: står tecknet MELLAN två tal eller termer är det en operation och får luft; står det FRAMFÖR ett tal är det ett förtecken och hör ihop med talet. Minustecknet är `−`, aldrig bindestreck. | `AK8_UI.mattextUt` — en delad punkt som all visad matematik går igenom | `verktyg/notation-grind.js` (K-G, med `--sabba mellanrum` och `--sabba fortecken`) |
| **K-H. Bråk med bråkstreck — enhet med snedstreck.** Står siffror eller variabler kring strecket är det ett BRÅK och ritas staplat, täljare över nämnare: `18x/3`, `6b/5`, `12/16`, `x/y`. Står enhetsord kring strecket är `/` ordet "per" och ska stå kvar: `kr/kg`, `km/h`. Skillnaden avgörs av vad som står omkring strecket, inte av vem som skrev det. | `AK8_UI.mattextUt` → `brakUt` | `verktyg/minus-grind.js` (BRÅK-benet, med `--sabba brak`) — samma gräns mellan bråk och enhet mäts på ETT ställe, inte i två grindar som kan glida isär |
| **K-H2. Kolon är division, som snedstreck — i inmatningen.** I uttryckskontexten — överallt där elevens uttryck eller led får skrivas med "/" — godtas ":" som samma division: "y : 4" = "y/4", "18 : 6" = "18/6" = det stående bråket. Det gäller inmatning från tangentbordet — knappsatsen rörs inte (den har ingen kolon-knapp). Text, enheter och talrutor rörs inte: där betyder kolon inget räknetecken. **Problemlösningen undantas:** där är ":" "namn: svar". Kolon har ingen annan betydelse i något facit (sökt 2026-11-22). *Joachim 2026-11-22.* | tolkarna: `blad-karna-b.js` (`evalUttryck`, `prioEval`, `forenklaKanon`, `forenklaFler`, `jamforForm`, `jamforMellan`, `jamforUttryck`), `AlgBrak.parse`, `MellanledRattare.grade`, `AK8_UI` (aritmetiken), `likhetsrattare.js`, `provbyggar-motor.js` (`pbEvalArith`). **Inte** `ekv-parser.js` och **inte problemlösningen** (Joachim 2026-11-22): där betyder ":" redan "namn: svar" ("Max: 12 år"), så kolon-som-division skulle krocka — och filen ligger intill den skyddade `ekvationer-balans.js`. Kolon som division gäller bara i uttryckskontexten. | **—** testbatteri 2026-11-22 (varje tolk med ":" och "/" ger samma dom; text och talrutor oförändrade) |
| **Ett led rättas på FORM — på varje nivå.** Termer och faktorer får byta ordning, också inuti en parentes ("5·(4+3)" = "5·(3+4)", "(6+9)/5" = "(9+6)/5"). Ett bråk håller sina platser — täljare och nämnare byter inte — och skrivs som stående bråk, med snedstreck ("18/6") eller med kolon ("18:6", K-H2). En parentes kring en ren produkt grupperar inget: "4·15/6" = "(4·15)/6". Ett uträknat led är en annan form och underkänns ("35 + 4" för "5 · 7 + 4"). Den gamla jämförelsen står kvar bredvid, så ingenting som godkändes förut underkänns. Gäller där ett led rättas på form: **avskriften** (tolka och Prioriteringsregeln) och tolkas beräkningskedjor. **Prioriteringsregelns led rättas INTE på form** — där gäller prioKedjan (raden nedan). *2026-11-22.* | `blad-karna-b.js` (`jamforForm`: strukturjämförelsen + den gamla) | **—** 44 fall i node 2026-11-22; rök-vakten per blad |
| **Prioriteringsuppgifter rättas med prioKedjan — på värde, alla rätta vägar.** Den etablerade prioritering-rättaren (k1 d10): varje led rättas på VÄRDE och måste fortfarande vara en räkning (ett led som redan är svaret underkänns — genvägsregeln), så varje rätt väg genom uttrycket godkänns ("5 · 7 + 12/3" lika väl som "5 · 7 + 4"); fel parentes blir fel på värde. Ett led till med "+ led". **Avskriften** (eleven skriver av uttrycket) är ett tillägg i prioKedjan och rättas på form. Ingen parallell formrättning av prioriteringsled. *Joachim 2026-11-22 ("Min order om form-rättning var fel — den skapade en parallell variant och underkände korrekta uträkningar.")* **Insättning** ("Beräkna uttryckets värde när x = …", Räkna med uttryck) rättas likadant: uttrycket med bokstaven står tryckt, avskriften med talet insatt rättas på form, leden på värde. **Frivilligt första led** (`rad.ledFrivilligt`) på rader med bara en räkneoperation, där inget led finns mellan avskriften och svaret ("4 + 9 = 13"): den befintliga regeln "frivilligt mellanled" — tomt led är varken fel eller räknat, ifyllt rättas det som vanligt. Övriga rader kräver ledet. *Joachim 2026-11-24.* | `blad-karna-b.js` (`prioKedja` + `rad.avskrift`, `rad.ledFrivilligt`, `prioEval`) | **—** rök-vakten per blad |
| **Förenklade svar skrivs i bokstavsordning med siffertermen sist (6x + 2y + 5). Enda undantaget: blir den första variabeltermen negativ får eleven börja med en positiv term (−20x + 56 eller 56 − 20x). Rätt värde i annan ordning ger beskedet 'Rätt värde – skriv svaret i bokstavsordning.' Gäller svaret i förenkla-uppgifter; teckna godkänner valfri ordning. Joachim 2026-11-24.** | `alg-brak.js` (`ordningOk`, `gradePoly`: beskedet `ordning`; följer facit självt inte regeln rättas ordningen inte) | **—** rök-vakten per blad |
| **Teckenrutan är EN delad komponent.** "Sätt in +, − eller · i rutorna" (och åttans platsvärdes- och ordval): knappar med ett val i taget, en ruta = ett svar. Bladkärnans radtyp `tecken` (text med `___` där rutorna står) och åttans d2/d3 använder samma knappar och samma bindning — ingen kopia per motor. *Joachim 2026-11-22.* | `AK8_UI.teckenKnappar`/`bindTecken`, `tecken.css` (länkad direkt efter `ak8-blad-kanon.css` — samma plats i kaskaden som förut) | **—** d2/d3 mätta identiska före/efter utbrytningen |
| **Talrutan läser talet — och bara talet.** Efter talet får bara en enhet stå ("28 kr" → 28, "5 år" → 5, "60 km/h", "25 %"); en räkning efter talet underkänns ("22+1", "5,5 + 1", "5²", "5 = 5", "28 kr + 5"). Förr läste rutan bara början av texten (parseFloat), så "22+1" godkändes som 22. Delad: alla talrutor läser via samma funktion. *Joachim 2026-11-22.* | `AK8_UI.pNum` (`ENHET_EFTER`) | **—** mätt på alla talruts-sidor 2026-11-22 |
| **K-I. Blandad form utan mellanrum mellan heltal och bråkdel.** Heltalet står tätt intill den staplade bråkdelen: två hela och två fjärdedelar skrivs `2` följt direkt av bråket. Regeln FÖRUTSÄTTER staplat bråk (K-H): med bråkstreck är heltalet och bråkdelen entydiga, medan `22/4` som inline-text kan läsas på två sätt. Blandad form renderad inline är därför ett brott mot K-H, inte bara mot K-I. | `AK8_UI.mattextUt` → `brakUt` (heltalet och bråket i samma cell, utan mellanrum) | `verktyg/notation-grind.js` (K-I, med `--sabba blandad`) |
| **K-J. Deluppgiftsbokstäver i bokens typografi.** Bokstäverna (a, b, c …) följer samma formspråk som resten av boken — serif, bokens färg, i rätt storleksrelation till huvudnumreringen — och läses som en del av samma typografiska familj som uppgiftens nummer (1, 2, 3). Inte främmande liten grå småtext som ser ut att höra till ett annat system. | `.ovn-label` i `ak7-delkapitel-kanon.css`, `.ak8-label` i `ak8-blad-kanon.css` | `verktyg/brytning-grind.js` (K-J, med `--sabba bokstavsstil`) — typsnitt, färg och storlek mäts mot uppgiftens egen rubrik, inte mot en konstant |
| **K-K. Svarsrutans placering följer uppgiftens form.** Rutan växer alltid med innehållet (K-E): startstorleken är liten och enhetlig i båda fallen, och behovet styr aldrig startbredden — bara tillväxten. **Har uppgiften ett likhetstecken** står rutan DIREKT efter tecknet: svaret följer frågan tätt. **Är svaret fritt, utan likhetstecken**, skrivs `Svar:` följt av rutan, och paret ligger högerställt så att **svarets högerkant står still** — när rutan växer flyttas `Svar:` åt vänster, precis som i högermarginalen på papper. **Är frågan flerradig** ligger svaret på EGEN rad under frågan, högerställt — högerkanten står still och etiketten backar, samma princip bara en rad ner. **Etiketten är `Svar:` om ingen finns, annars den som redan står där** (figurraderna har `Omkrets`): aldrig två etiketter. Enheten hör till svaret och följer med rutan (`3 dm` → `Svar: ▢ dm²`). **Ett ritat streck i texten är ingen plats för ögat utan för rutan:** understrecken var pappersnotation som följde med in i datan, och rutan står nu där strecket stod (`160 = ▢ tiotal`). Regeln anger målet, inte mekaniken. | kärnornas radtyper (`=`-ledet via `.ovn-led-par`) och `.ovn-svarsrad` för det fria svaret | `verktyg/brytning-grind.js` (K-K, med `--sabba svarsplats` och `--sabba svarsetikett`) |
| **K-L. Matematikens siffror är raka och står på samma linje.** All matematik — uppgifter, svarsrutor, kedjor, facit, figurers etiketter och knappsatsen — ritas med `font-variant-numeric: lining-nums tabular-nums`. Cormorant Garamond ritar annars gammaldags siffror: 3, 4, 5, 7 och 9 går under linjen, 6 och 8 sticker upp, 1 och 2 är låga, och då står `12`, `4 + 8` och `7x − 8` ojämnt. Löptext och rubriker behåller typsnittets vanliga siffror — det gäller sidans och bladets rubriker (`h1`, `h2`); testfrågans titel är en `h3` och bär uppgiftens tal ("Jämför mot ½ och 1"). Regeln står EN gång, för alla sidor i alla årskurser, och följer **ytan**, inte typsnittet: Source Serif 4 har raka siffror från början men får regeln ändå, så att ett byte av typsnitt inte tar tillbaka felet. Rutor och knappar ärver inte typsnittet (webbläsaren sätter `font` på dem), därför nämns de för sig. *Joachim 2026-11-02.* | `fonts/fonts.css` — den enda stilfil varje sida laddar | `verktyg/notation-grind.js` (K-L: egenskapen på varje sifferelement och bläcket per rad ur en skärmdump, med `--sabba siffror` och `--sabba onum`) |
| **Varje synlig ruta räknas och rättas.** Nämnaren är antalet synliga svarsfält. | bladmotorernas kontroll | `verktyg/namnare-grind.js` |
| **Kontrollera rättar bara rutor eleven svarat i.** En tom ruta är obesvarad, inte fel: ingen färg, inget kryss, inget facit — men den räknas i nämnaren, uppgiften finns kvar att göra. Gäller också inuti ett svar som består av flera rutor: bara de ifyllda färgas. Annars ger ett enda tryck bort hela bladets facit, och det noggranna arbetssättet — en uppgift i taget, Kontrollera efter varje — straffas hårdast. | bladmotorernas kontroll · `AK8_UI.markeraRutor` | `verktyg/kontroll-svep.js` |
| **Evidensen följer FÖRSTA försöket per ruta.** Senare tryck ändrar vad eleven ser, inte vad som loggats. Utan regeln kunde hon rätta sig fram till grönt — och tillsammans med facit-läckan skriva av svaret först. | `AK8_UI.loggaForstaForsoket` | **—** mätt EN gång med diagnos-proben (commit `9e5772d`). Ingen grind kör om den. |
| **Varje ruta i en rad markeras för sig.** | `AK8_UI.markeraRutor` (`res.per`) | `verktyg/flerruts-grind.js` |
| **Svarsformen är bindande** (blandad / bråk / decimal / enklaste) och står i data per grupp. | `Likhetsrattare.finalStatus` | `verktyg/svarform-koll.js` |

**Problemlösning räknar poängen per uppgift.** Där räknar totalen lösta uppgifter, inte rutor — men varje ruta rättas och markeras fortfarande var för sig. Se **Problemlösning — rättning (metod-rättning)**.

**K-K:s fyra fall** är samma princip i fyra lägen: likhet → rutan efter tecknet · ritat streck → rutan på strecket · fritt svar på en rad → `Svar:` högerställt · fritt svar med flerradig fråga → samma par på egen rad under frågan. Etiketten är en, aldrig två.

**K-K fall 3 och 4 gäller inte en rad som bär en bildruta eller figur.** Där bor rutan inne i bildens omslutning, efter frågetexten, och den placeringen är uppgiftens egen. Ett `Svar:` framför bilden slet isär uppgiften live (prislappsuppgifterna i åttans algebra): etiketten hamnade före bilden och rutan 631 px bort, utanför en 390 px skärm. Referensen för rätt placering är commit 810655b, före K-K. Avgränsningen är densamma som K-E gör mot uppställningens kolumnrutor — **en regel som är rätt för de flesta fall undantas där ytan är annorlunda** — och den vaktas av `brytning-grind.js` (`--sabba bilduppgift`), som fäller en bild-uppgift vars svarsrad bär bilden.

**K-K vilar på K-E.** En liten enhetlig ruta som växer, placerad efter uppgiftens form: intill likhetstecknet när det finns ett, annars `Svar:` högerställt. Behovet styr aldrig startstorleken, bara tillväxten.

**K-G, K-H och K-I är EN princip: mellanrum betyder operation, tätt ihop betyder delar som hör samman.** De är inte tre godtyckliga regler utan samma princip tillämpad på tecken, bråk och blandad form — en vakt som är osäker i ett gränsfall faller tillbaka på den meningen. Notationen renderas på EN delad punkt som all visad matematik går igenom, aldrig per renderare: K-A:s nio renderare och K-D:s 412 brott på arton sidor är vad det kostar att lägga samma regel på flera ställen.

**K-D och K-E är samma princip.** Gör rutorna breda från start → fula brytningar (K-D); låt dem vara korta och växa → mjuka brytningar (K-E). Rutans bredd ska följa innehållet, inte sättas bred i förväg.

**K-D, K-E och K-F gäller mattens egen uppgiftsyta** — en motiverad avvikelse från läseböckerna. Det delade (färg, typsnitt, hero, navram) rörs inte.

## §4 Texten

| Konvention | Funktionen bor i | Vad vaktar den |
|---|---|---|
| **All elevtext ligger i ett FALT-fält och godkänns per fil.** Ingen maskinskriven mening når eleven. | fälten `titel`/`rubrik`/`sub`/`fraga`/… | `verktyg/elevtext-grind.js` |
| **Ingen byggar-riktad text renderas för elev.** | — | `verktyg/platshallar-svep.js` |
| **Exemplet sammanfaller inte med en uppgift i samma grupp.** | `ExempelVakt` i metod-kärnan | `verktyg/exempel-svep.js` |
| **Minus skrivs med minustecken (−, U+2212)** i all elevsynlig matematik — uppgiftstext, figuretiketter, valknappar, facitrad. Eleven skriver − i rutan (autoSpace byter tecknet medan hon skriver), så ett bindestreck i uppgiftstexten ger två olika minus på samma rad. Tankstreck (–) är ett tredje tecken och kommer med ur docx-transkriptioner. Omvandlingen görs i **renderingen**, inte i datan: datan matar rättarna och är ASCII. Undantag: ett tankstreck som skiljer två satser ("Förenkla uttrycket – visa mellanled") och ett talintervall utan mellanrum ("2–4 faktorer"). | `minusUt` i `blad-karna-b.js` (`window.BLAD_MINUS_UT`) · kopplad i figurmodulens `esc()`, som alla etiketter går igenom | `verktyg/minus-grind.js` (`--sabba`) |
| **En figur utan formgivning är inte oformad, den är svart.** SVG:s default-fyllning är svart, så en klass utan CSS ger en helsvart yta — och en textstil på ett `<line>` ger en linje utan stroke, alltså ingen linje. | `svg-algebrafigur.js` + klassernas CSS i bladkanon | `verktyg/figur-grind.js` (svart yta · osynlig linje · text mot sin botten; tre `--sabba`-lägen) |
| **Namngivande ord får stå, instruerande inte.** "Omkrets:" namnger; "Skriv ett mellanled först" instruerar. | — | **—** läslista; går inte att mäta |

## §5 Kopplingen till taxonomin

| Konvention | Funktionen bor i | Vad vaktar den |
|---|---|---|
| **En generator pekar på en nod som finns, och en mastery-nyckel går att spåra tillbaka.** | `js/data/*-taxonomi.js` | `verktyg/koppling-grind.js` |
| **Byggt material är nåbart** — ingen nod med innehåll saknas i utbudslistan. | `visning.utbudslista` | `verktyg/synlig-grind.js` |
| **Nivåtaket per nod hålls.** | `visning.niva` · `DelkapitelSkal.bandFor` | `verktyg/nivatak-svep.js` |

---

## §6 Regler som ingen grind vaktar ännu

De här är lika bindande som allt annat i filen. Skillnaden är att de i dag bärs av att någon minns dem — och **allt som bara står nedskrivet glöms**. Kolumnen längst till höger säger vad som skulle krävas för att flytta regeln från minnet till en mätning.

| Regel | Var den gäller | Mätbar? | Vad som krävs |
|---|---|---|---|
| **Inga hjälptexter i öva.** Öva-bladet ställer uppgiften; det förklarar inte hur man löser den — instruktioner hör hemma i färdighetsträningen. **Gränsen är NÄR texten visas:** före svaret är det en instruktion, efter svaret är det återkoppling. Rättarens besked (`Likhetsrattare`, åttans mellanleds-besked) står därför kvar. | alla öva-blad | **Ja, billigt** | Hjälptexten är ett eget element, och sedan 2026-10-01 har facket **ett enda namn: `.ak8-hint`**. Det hade två — `.brak-hint` i sjuans bråk-kärna — och det var därför d4 överlevde rensningen 2026-09-23: svepet letade på det ena namnet. Ett fack, ett namn. Svepet listar, Joachim dömer en gång, den godkända mängden låses som elevtext-registret. GRÄNS: fångar bara text som ligger i facket — en instruerande mening inbakad i en rubrik ser det inte, samma lucka som elevtext-låsets fältlista. |
| **Mellanled rättas på värde**, inte på form. Eleven får skriva vägen som hen räknar. | `Likhetsrattare.provaKedja` och alla kedjerutor | **Ja, medel** | En fuzz som tar varje kedjas facit, skriver om det med bevarat värde (kasta om termer, `3 · 4` → `4 · 3`, lägg till ett likvärdigt led) och kräver att rättaren godtar. Halvfabrikaten finns: `evalArith` räknar ut värden, `AlgBrak` jämför polynom. |
| **Bekräftelsesteg i drillar** — inget auto-advance. Eleven ska hinna se att svaret var rätt. | drillarnas flöde (ram-filerna) | **Ja, billigt** | `delkapitel-grind` spelar redan en hel omgång per drill för distinkthetens skull. Benet blir: efter ett svar får nästa fråga inte dyka upp förrän bekräftelse-kontrollen klickats. Maskineriet finns; det är ett tillägg, inte ett nytt verktyg. |
| **Ingen förvald ruta — men BARA i drillarna.** I ett blad fyller eleven uppifrån och ner, och första rutan är alltid rätt ställe att börja; kärnorna fokuserar den med flit (`blad-karna-b.js:1370`, `blad-karna.js:580`). I en drill är **valet av var man börjar en del av metoden** — tydligast i en uppställning, där man börjar med entalen. Att peka ut en ruta åt eleven tar bort det valet. Det var hela skälet till regeln. | drillarna, **inte bladen** | **Ja, billigt** | `document.activeElement` får inte vara en `input` när en drillfråga just renderats. Piggybackar på samma drill-omgång som bekräftelsesteget. Räckvidden måste stå i grindens huvud också, annars fäller den bladen för något avsiktligt. |
| **Figurer ritas om med egna värden.** En figur som återanvänds med nya tal ska visa de nya talen. | `SvgAlgebraFigur`, `SvgTermometer`, `svg-andel`, `svg-tallinje` | **Delvis** | En figur som *genereras ur data* är rätt per konstruktion; risken är en handskriven SVG eller en figur som behållit gamla tal. Mätningen: varje tal som syns i figuren ska finnas i radens data. Det kräver att figuren bär sina värden i DOM (ett `data`-attribut på figur-elementet) — den kopplingen finns inte i dag och måste läggas till först. |
| **En nod finns när färdigheten bedöms separat.** Bedöms något för sig ska det ha en egen plats i taxonomin, annars försvinner evidensen in i en grannfärdighet. | taxonomin ⟷ bladen/testen | **Nej, inte som dom** | Att två färdigheter är *olika* är en bedömning, inte en mätning. Det mekaniska som går: lista grupper som rättas för sig (egen rättar-typ eller egen svarsform) men loggar till samma nod som en strukturellt annorlunda grupp. Det ger **kandidater att läsa**, aldrig ett grönt eller rött. |
| **Delad nod loggas i sin hemvist.** Samma färdighet i två årskurser är EN nod; årskursen taggar den, den kopieras aldrig. | `js/data/*-taxonomi.js`, alla generatorer | **Ja, låg–medel** | `koppling-grind` kontrollerar redan att varje loggad nyckel finns i taxonomin. Tillägget: ingen färdighet får vara definierad på två ställen (dubblett-id eller två noder med samma namn/innehåll i olika kapitel), och en generators loggade nyckel ska vara nodens kanoniska id. |
| **Kärnans defaults matchar KONVENTIONER ordagrant** — knappnamn, numrering, bokstavsplacering och allt annat en kärna ritar när bladet inte säger något. En default som spretar från standarden sprids till varje sida som inte råkar sätta värdet själv. Upptäckt 2026-11-21: kärnan skrev "Återställ" där standarden är "Börja om", och valrutans bokstav stod på egen rad där standarden säger "på raden". Rättas i kärnan, aldrig per sida. *Joachim 2026-11-21.* Knappen heter "Börja om" på alla bladkomponenter sedan 2026-11-22 (åttans d1–d8, k2 d1–d7, k1 d10:s tallinje, `blad-karna.js`, k1 d2, `AK8_UI`:s default); **känd kvarleva:** `ekvationer-balans.js` säger "Återställ" tills den får röras. | `blad-karna-b.js` och de andra bladkärnorna, `AK8_UI` | **Ja, billigt** | Ett svep som renderar ett minimalt blad per radtyp och jämför de synliga standardtexterna (knapparna, sammanfattningen) med en lista ur KONVENTIONER, och bokstavens placering (samma rad som frågan) med en mätning av positionerna. |

**Sex av åtta kan bli riktiga grindar** (hjälptexter, mellanled på värde, bekräftelsesteg, förvald ruta, delad nod, kärnans defaults). **En kräver ett datakrok först** (figurerna — figuren måste bära sina värden). **En kan aldrig bli mer än en läslista** (nod när färdigheten bedöms separat), eftersom den vilar på en bedömning av vad som är två olika färdigheter.

Två rader stod här till 2026-10-01 och står inte kvar: *ny sida in i grindarnas listor* och *äkta oberoende slump*. De hörde aldrig hit — de är delade plattformsregler (V9 och V10), och de har verktyg nu: `verktyg/sidlist-grind.js` och `verktyg/slump-fuzz.js`. Raderna flyttade alltså inte för att de blev mindre bindande, utan för att de blev mätta.

---

## Arbetssidan — moment-sida, horisont och uppgiftssida (nov 2026)

REFERENSSIDA: En ny momentsida byggs som d5-problemlosning-nyformat. Allt som skiljer sig är ett fel tills Joachim har godkänt skillnaden.
METODTRÄNING: Rubriken under Föreläsningar fäller ut trädet. Trädet har kategorier och löv. Varje löv med författad bank är klickbart och öppnar drillen, och ett löv utan bank står utan länk. Funktionen bor i momentsida.js, och sidan lämnar bara löven och bankernas id.
TEST: Test är Joachims författade test, listade på momentsidan och öppnade på uppgiftssidan (?test=<id>). Aldrig länkar till gamla test eller provbyggaren. Funktionen bor i momentsida.js. Finns inga författade test står Test med 'Kommer senare'.
INNEHÅLL: Allt Joachim har författat ligger i doc/innehall/ innan det byggs. En order hänvisar till filen där, aldrig till en chatt.
Joachim 2026-11-24.
MOMENT OCH BLAD: Ett moment har Blad 1, 2, 3 … (var och ett i variant A och B), så många som stegringen kräver. Ett avsnitts stegring fördelas på bladen, inte på fler moment, så att vänsterspalten är kort också när åttans och nians fördjupning läggs till. Joachim 2026-11-24.

Pilot: algebra åk7 + procent åk8/9. Ombyggnad av delade delkapitel-skal.js
verifieras av delkapitel-grind.js innan elever lutar sig mot det.

MOMENT-SIDA (elevens arbetssida)
- Slimmat sidhuvud på elevnivå; den stora heron bara på kapitelsidan.
- Två flikar utan undertext: "Arbeta med området" / "Mina kunskaper".
- Vänsterspalt moment-först. Dagens träning + Test UNDER momenten. Badge FRAMFÖR namnet.
- Slimmat sidhuvud med **"← Tillbaka"** överst, som på uppgiftssidan: till sidan man kom från (`?retur=`), annars
  kapitelsidan. Samma knapp och stil på båda sidtyperna (`js/motor/arbetsyta/tillbaka.css`, `Arbetsyta.retur`).
  *Joachim 2026-11-21.*
- Mittensektion, ordning: Uppgifter → Föreläsningar → Metodträning.
- En sektion som inte finns än (t.ex. Föreläsningar utan film) står med rubriken och "Kommer senare" och är inte
  klickbar (`Momentsida.sektionKommer`). *Joachim 2026-11-21.* Detsamma gäller ett MOMENT utan innehåll än (t.ex.
  Prioriteringsregeln, Räkna med uttryck): grått, inte klickbart, och samma "Kommer senare"-etikett som Dagens
  träning — inte bara grått. Det är inte byggt, inte trasigt: rök-vakten ska förvänta det, inte flagga det.
  Detsamma för ett BLAD som inte är färdigbyggt (`kommer: true` i momentets bladlista): "Kommer senare", ingen länk.
- `?moment=<id>` på momentsidan öppnar det momentet (uppgiftssidans Tillbaka leder dit), så eleven kommer tillbaka dit
  hen var. Uppgiftssidan väljer moment med `?moment=<id>&blad=<nr><variant>`; utan moment det första. *2026-11-22.*
  *Joachim 2026-11-22.*
- **Funktionen bor i** `js/motor/arbetsyta/momentsida.js` (märket, de fällbara sektionerna, ramen med momenten och
  Dagens träning + Test) och `momentsida.css` — delade av delkapitlens momentsidor; sidan äger bara sitt innehåll
  (utbrutet ur problemlösningens momentsida 2026-11-21, bara en flytt).

HORISONT-BADGES (härleds, taggas inte för hand)
Varje nod/moment bär årskurs (7/8/9) OCH roll (karna/breddning/fordjupning).
Badgen härleds mot eleven:
  doc-år = elevens, kärna      → 7/8/9 (Nu)
  doc-år = elevens, fördjupning → F
  doc-år > elevens             → FF
  doc-år < elevens             → R (repetition)
Badge framför namnet; bokstav bär, färg förstärker; ingen teckenförklaring.
KRAV: taxonomin måste bära årskurs per nod (rollen finns redan).

UPPGIFTER (blad)
- Blad = nivå + ev. variant: "Blad 1A", "Blad 1B", "Blad 2" — utan mellanslag;
  bokstav BARA vid flera varianter (speglar K-A).
- Info/descriptor på bladet när det finns varianter (namnger, instruerar aldrig — §4).

FÖRELÄSNINGAR
- Har namn, samma som uppgifterna; ingen längd visas.

METODTRÄNING = färdighetsträningens träd (INTE platta chips)
- Metodträning är en knapp; trädet fälls ut UNDER den på sidan.
- Trädet = den byggda färdighetsträningen/kartans noder, scope:at tre nivåer:
  kapitel (Algebra) → avsnitt (Ekvationer) → bladet.
- Horisonten filtrerar trädet (R/Nu/F/FF) — samma mekanism som kartans
  "Godkänt (kärna)/Allt" roll-filter. En variant har inga siffror/underrubriker,
  den är en mängd uppgifter att träna. Mastery-färg visar status. Ett klick på ett löv öppnar drillen som en egen sida med uppgiftssidans upplägg (← Tillbaka till momentsidan med Metodträning utfälld, knappsatsen till höger). Trädet visas i full höjd utan egen scroll. Joachim 2026-11-24.
- Innehållet är FÖRFATTAT, inte genererat ur taxonomins noder: varje löv har en författad bank, som
  problemlösningens (`bank: 'prob-ak7:<typ>/<variant>'`, serverad av `js/motor/ovamer/k3-forfattad-kalla.js`).
  *Joachim 2026-11-22.*
- Har inget löv en bank står Metodträning med 'Kommer senare', på samma sätt som Test. Joachim 2026-11-24.
- NYA TAL EFTER BANKEN: I ett räknelöv är de författade uppgifterna mallar. Drillen serverar först banken i ordning. Därefter ger 'Nytt blad' en uppgift med samma form som en mall (samma antal termer, samma räknesätt, samma svarsform) och nya tal inom mallarnas band: talen håller sig inom lövets talregler och mellan bankens minsta och största. Aldrig svårare än banken; svårare = nästa författade nivå (takregeln). Valuppgifter, ringa in och löv där sammanhanget bär uppgiften (tolka, teckna, tillämpning) har bara författade uppgifter. Joachim 2026-11-25.
- INGET parallellt träd byggs — återanvänd komponenten (A1/Regel 0).

UPPGIFTSSIDA (övningssida) — preciserad i sektionen **Uppgiftssidan (arbetsytan)** nedan
(2026-11-22); den gäller där de skiljer sig (bl.a. knappen heter "Föreläsning", Kontrollera står under
kalkylatorn).
- Hero borta → "Tillbaka"-knapp (till sidan man kom från).
- Full bredd (plats för flera mellanled). Knappsats + Kontrollera NERE TILL HÖGER,
  inte kolumn till höger om uppgiften.
- Blad A/B som växel på sidan. Bladfilm överst + "Visa genomgång"-knapp vid uppgiften.
- Svarsrutor små, växer med svaret (§3).
- Nytt blad prestationsstyrt (~80 %: 5→4, 10→8): löst → svårare författad nivå;
  ej löst → samma. Svårare = nästa författade nivå, aldrig algoritm (takregeln).

UPPGIFTSDOKUMENT (ett per blad)
Fält: Del · Moment · Blad (nr + ev. bokstav) · Årskurs (7/8/9) ·
Roll (kärna/breddning/fordjupning) · Metod-etikett (namnger, §4) ·
Takregel golv/tak · Antal (mastery-tröskel) · uppgifter + facit per ruta (§K-K).
PLATSEN FÖR FÖRFATTAT INNEHÅLL: källtexten — Joachims uppgifter och facit i klartext, ordagrant, med källa per del — 
ligger i `doc/innehall/<kapitel>-<del>-<moment>.md` (första: `k3-d1-prioriteringsregeln.md`). Datafilen som bygger bladen 
(`js/motor/blad/blad-…js`, eller en bank som `prob-bank-ak7.js`) bär innehållet i koden och pekar på dokumentet. Samma plats 
för Räkna med uttryck, provet och metodträningen. Problemlösningens källor ligger i dag bara i banken (Joachims dokument 
utanför repot). *Joachim 2026-11-22.*

BLADKÄRNANS GRUNDSTIL på nya sidor: det som gäller ALLA uppgiftstyper — rutan (`.ovn-in`), valknapparna
(`.valruta-grid`, `.valruta-btn`), uppgiftsrubriken (`.ovn-grupp-rubrik`), rättningens animationer (`ovn-pulse`,
`ovn-mark-in`, `konfetti-fall`) och knappsatsens bråkknapp (`.kp-kbrak…`) — bor i `js/motor/blad/karna-b-grund.css`.
En regel som bara gäller EN uppgiftstyp läggs i typens egen delade fil, `js/motor/blad/karna-b-<typ>.css` (t.ex.
`karna-b-talfoljd.css`), inte i grundfilen; sidan laddar typfilerna för de typer dess blad använder. Inga kopior i
sidans `<style>`. (Flyttat ordagrant ur d1-sidan 2026-11-21, Joachims beslut.) De gamla sidorna bär sina egna kopior och
laddar inte filerna.

Vad vaktar den: — mestadels ny UI utan grind; byggs och verifieras per pilot.

---

## Uppgiftssidan (arbetsytan)

*Joachim 2026-11-22.* Arbetsytan är sidan där eleven löser ett blad. Pilot: problemlösning åk7
(`ak7/k3/d5-problemlosning-nyformat/uppgift.html`).

| Konvention | Funktionen bor i | Vad vaktar den |
|---|---|---|
| **Sidhuvudet är slimmat:** navbar + brödsmula + ← Tillbaka. Inget hjältehuvud — skärmen maximeras för uppgifterna. Under: växeln **Blad A / Blad B** (nedtonad — ett val på sidan, inte sidans namn) och knappen **Föreläsning**. | sidans markup · skalet `js/motor/arbetsyta/arbetsyta.css` och `Arbetsyta.retur`/`Arbetsyta.vaxel` (`arbetsyta.js`) | **—** |
| **Rubriken är typen**, t.ex. "Problemlösning flera personer och saker" — utan "Blad 3A" och utan typens parentes ("(2–3 personer)"). | `rubrik()` i bladets bank (`ProbBankAk7.blad`) | **—** |
| **Talen numreras "1.", "2." på samma rad som uppgiftstexten.** a) b) bara vid deluppgifter (K-A), också de på raden. Som i boken. | bladkomponentens val `numrering: 'tal'` (`ProbBlad.fragaMedNummer`, delad av `ProbBlad2`) | `verktyg/uppgift-grind.js` EGEN RAD (bokstaven får inte stå ensam ovanför frågan; mätt vid 1366 × 768, med `--sabba egenrad`). *Joachim 2026-11-25:* utan fråga står bokstaven bredvid figuren (K-C). |
| **Färgen är bokens egna palett-tokens** — samma som delkapitelsidorna, ordagrant. Ingen egen palett, inga approximerade värden. | sidans `:root` (= delkapitelsidornas) · kedjans färger i `ekv-kedja.css`/`prob-blad.css` | **—** mätt en gång 2026-11-22 (beräknade färger lika ekvationskapitlet d4); ingen grind |
| **Stegen (Delarna, Ekvation, Balansmetoden, Sätt in värdet, Svar): rutorna små och växer med innehållet** (§3 K-E), och **likhetstecknen står under varandra genom raderna** — vänster led högerställt mot tecknet, höger led vänsterställt, i ett rutnät per steg. | bladkomponentens val `arbetsyta` (`.prob-kort.arbetsyta`, `.prob-rutnat` i `prob-blad.css`) · kedjans `eq-grid` | **—** |
| **Sätt in värdet: vänster beräkningsruta BARA när delen är ett uttryck** — eleven räknar ut, t.ex. `18 + 12 = 30`. För x eller ett tal finns ingen vänsterruta (`x = 18`). | `ProbBlad2` (`arUttryck`, beräkningsrutan under `arbetsyta`) | **—** |
| **Kalkylatorn till höger. Under den, på samma rad: Kontrollera, Börja om och Tipsa** — aldrig över tangenterna. Bladet går inte in under kalkylatorn. Den delade knappsatsen ändras inte; placeringen är sidans. | skalet: `arbetsyta.css` och `Arbetsyta.placera` (`js/motor/arbetsyta/arbetsyta.js`) | **—** |
| **Figurer för geometri är SVG** (eget pass). **Funktionella bilder stannar, dekorativa går.** | `svg-algebrafigur.js` | **—** |
| **Knappsatsen visar bladets egna bokstäver**, tagna ur bladets data (facit för de rutor eleven skriver i) — inte alltid x y a b c n. Byter med växeln Blad A/B. Fler bokstäver än knappsatsens sex platser är ett fel i bladet. *Joachim 2026-11-21.* | `bladBokstaver(blad)` i `blad-karna-b.js` · `AK8_UI.keypadBokstaver(kp, bokstäver)` i `ak8-blad-ui.js` · anropet i sidans `vidVisa` | **—** rök-vakten per blad (bokstäverna mot facit) |
| **Skalet formger knappsatsen och knappraden oavsett bladkomponent:** `Arbetsyta.placera` sätter `.nf-kalkylator` och `.nf-knapprad` — problemlösningens `#prob-keypad`/`.actions` och bladkärnans `#ovn-keypad-shared`/`.ovn-kontroll-rad` får samma regler. | `arbetsyta.js` (`placera`) · `arbetsyta.css` | **—** |

Rättningsmodellen för flera giltiga lösningar: se **Problemlösning — rättning (metod-rättning)** nedan.

**Känt hål (2026-11-21):** problemlösningens uppgiftssida saknar rättningens animationer (pulsen, bocken, konfettin). Dess rättning
rör aldrig de animerade elementen (`.ovn-sammanf.ok`, `.ovn-mark`, konfetti), så att ladda grundfilen gör ingenting — den laddas
därför inte. Att ge problemlösningen animationerna kräver en ändring i dess rättning. Görs inte nu (Joachim).

Andra uppgiftssidan i formatet: `ak7/k3/d1-algebraiska-uttryck-nyformat/uppgift.html` (momentet Tolka och teckna uttryck,
blad 1A–3B ur `js/motor/blad/blad-k3-d1-tolka.js`, ritade av bladkärnan).

Vad vaktar den: — ny UI utan grind; verifieras per pilot med mätprober (båda vyportarna).

---

## Problemlösning — rättning (metod-rättning)

*Joachim, nov 2026.* Rättaren kontrollerar **metoden**, inte en viss uppställning. Det finns flera giltiga
lösningar på samma uppgift, och alla ska godtas.

| Konvention | Funktionen bor i | Vad vaktar den |
|---|---|---|
| **Fritt variabelval.** Eleven väljer själv vilken storhet som är x; valet är aldrig fel. | `ProbRattare.rattaMetod` | `verktyg/spec-prob-bank.js` (metod-rättaren: varje giltigt variabelval prövas) |
| **Ekvationen** godtas om den har en entydig lösning som är ett av uppgiftens rätta värden. En redan löst ekvation ("x = 12") godtas inte. | `ProbRattare.rattaMetod` | `verktyg/spec-prob-bank.js` |
| **Balansmetoden är giltig algebra:** varje rad har samma lösning som raden ovanför, ingen rad upprepar den förra, sista raden är x = tal, och det finns minst så många rader som ekvationen kräver. | `ProbRattare.rattaMetod` (via `EkvParser`) | `verktyg/spec-prob-bank.js` |
| **Sätt in värdet:** beräkningsrutan visar insättningen (talet insatt för x), inte bara resultatet, och rättas mot elevens eget x. Tom ruta = uppgiften inte löst. | `ProbRattare.rattaMetod` · `visarInsattning` | `verktyg/spec-prob-bank.js` |
| **Svaret skrivs på EN rad** och rättas på tal + enhet. Namn vid talet binder värdet till personen (ombytta svar fångas); annars godtas värdet för rätt person. Enhet med eller utan blanksteg; "st" godtas som antalsenhet; fel måttenhet fångas. | `ProbRattare.lasSvarsrad` | `verktyg/spec-prob-bank.js` |
| **Delarna** är elevens egen uppställning och rättas inte mot en mall; svaret fångar uppställningsfel. | `ProbRattare.rattaMetod` | `verktyg/spec-prob-bank.js` (uppställningsfelet i A1 fångas av svaret) |
| **Poäng per uppgift:** "Du har löst X av Y uppgifter" räknar lösta uppgifter (hela kedjan rätt), inte rutor. Gäller typen överallt: blad, test, blandade och drill. | `ProbBlad2` (totalen i `kontrollera`) | **—** mätt med prober, ingen grind |

Samma princip i bladkärnans uttrycksrutor: där facit är ett uttryck godtas inte det uträknade värdet, helt eller delvis (§3, "Uttrycksrutan godtar uttrycksformen" och "Delvis uträknat godtas inte heller").

Hör ihop med §3: för problemlösning räknas poängen per uppgift, men varje ruta rättas fortfarande var för sig.

PROBLEMLÖSNINGENS STEGFORM: Uppgiften löses i Joachims steg (Delarna, Sätt in värdet, Balansmetoden, Svar). Stegrubrikerna med sina linjer och 'Svar' som sista stegets rubrik ovanför rutan är stegformen och ett godkänt undantag från K-F och K-K. Strecket MELLAN uppgifterna följer K-F. Joachim 2026-11-26.

---

## Delade plattformsregler — kanoniserade i alla ämnen

### Verifieringsregler — och vad som vaktar dem

**🔗 DELAD** · DELAD-BAS v1.4 · kanoniserad 2026-10-01, bevisad i matematikbygget (Spår 3) · utökad med V11–V14

**META-PRINCIP: en regel som bara står nedskriven glöms.** Det har hänt sju gånger i
mattearbetet. Varje *bevisad* regel ska vaktas av en **grind eller ett kontrakt**, inte bara
dokumenteras. Dokumentet stoppar *ovetande*; bara enforcement stoppar *regression*. Vid varje
ny regel: fråga **"vad vaktar den?"** — står svaret tomt är regeln ännu inte skyddad.

Kolumnen **Vad vaktar den** är ärlig. Står det ett verktyg finns ett prov som fäller när regeln
bryts. Står cellen tom finns ingen mätning, och regeln bärs bara av att någon minns den.
**En tom cell är en TODO, inte ett klartecken.** Den ska skava.

#### Verifiering — varje ämne med interaktivitet eller JS

| # | Regel | Vad vaktar den (matte) |
|---|---|---|
| V1 | **Verifiera i headless Chromium**, inte enbart node-harness — harness ger falska gröna bockar. Skalet puppeterar motorns **publika kontroller**, aldrig internt state (testa som en elev). | `verktyg/cdp-kor.js` — varje grind körs mot sidan som eleven öppnar den (`file://`), med `window.onerror` kopplad |
| V2 | **En grind ska negativt verifieras** — återinför felet och se att den fäller. En grind som aldrig fällt är inte bevisad. |  |
| V3 | **Mät effekten, inte attributet.** Ett kontrakt som mäter *formen* blir ett hinder för allt som gör rätt på annat sätt. | `verktyg/yt-kontrakt.js` — trycker på en knapp och mäter renderingen, inte attributet |
| V4 | **Mät det eleven ser**, inte det första som råkar matcha i DOM-ordningen. | `verktyg/yt-kontrakt.js` (facit-drivet per ruta) · `verktyg/namnare-grind.js` · `verktyg/flerruts-grind.js` |
| V5 | **Synlighet hör till beviset.** Ett grönt logikprov kan dölja en tom rendering. | `verktyg/synlig-grind.js` · `verktyg/tonad-svep.js` (mäter opacitet EFTER animationen) |
| V6 | **Ett bevis på en vy säger inget om de andra.** Mät per flik, per blad, per årskurs/sida. | `verktyg/kontroll-svep.js` · `verktyg/delkapitel-grind.js` — mäter per flik och per blad |
| V7 | **Mät innan du tror på utfallet.** Grinden har flera gånger fällt något som var rätt. |  |
| V8 | **Kör grindarna en i taget.** Parallella körningar ger falska träffar. |  |
| V9 | **Nya sidor måste in i grindarnas listor** — annars växer material utanför mätningen. | `verktyg/sidlist-grind.js` — mängderna bor i `verktyg/sidor.js` och letas upp på disk; en ny sida kommer in i alla sex svepen av sig själv |
| V10 | **Generatorer: äkta oberoende slump**, verifierad med runs-test/autokorrelation — inte bara "inga dubbletter" (gäller varje ämne med slumpade uppgifter: matte, flipcards, tidslinjeövningar). | `verktyg/slump-fuzz.js` — runs-test + autokorrelation (lag 1–3) + upprepningsöverskott; fäller vid z-värde över 4 i minst två av tre omgångar |
| V11 | **En grind får inte ha en väg ut som hoppar mätningen.** En early-return, en vakt eller ett undantag som avslutar grinden *utan att mäta* ger grönt utan bevis. Belagt: `if(vs.length < 2) return` i slumpfuzzen lät alla tre injicerade felen passera — grinden mätte inte, och grönt såg ut som ett godkännande. | **—** *byggs*: en negativ verifiering som fäller när mätningen hoppas över, och på sikt en lint mot tidiga returer före mätpunkten |
| V12 | **Kör den negativa verifieringen i exakt det läge grinden ska köras i.** Annars godkänner provet ett läge som aldrig prövas. Belagt: samma fel som V11 — den negativa verifieringen kördes med en omgång och grinden med tre, och blev falskt grön i båda ändar. | *disciplin* — kan inte vaktas mekaniskt. Står i grindens huvud och bärs av praxis |
| V13 | **Mät aldrig något som beror på vem eller var provet körs.** En miljö- eller maskinberoende kontroll är grön där någon tittar och säger ingenting om elevens vy. Mät den renderade elevvyn, inte körmiljön. Belagt: `document.fonts.check` svarar ja om typsnittet är installerat på maskinen — grönt hos byggaren, rött hos eleven. Skärpning av V3 och V4. | **—** *byggs*: en plats är rättad (`yt-kontrakt` läser en FontFace ur `document.fonts` i stället för `document.fonts.check`), men inget prov hindrar nästa |
| V14 | **En sida i grindens lista måste ge minst en mätpunkt.** Ger den noll — noll blad, noll rader, noll ytor — är grinden röd, utom där ett dokumenterat skäl säger annat, och skälet prövas av grinden. V9 garanterar att en sida ligger i listan; V14 garanterar att en sida i listan faktiskt mäts. Belagt: `ak7/k3/d4-ekvationer` kom in i nämnar-grindens lista, gav noll blad, fick inte ens en utskriven rad — och grinden slutade "GRÖN · 107 blad mätta". Ett undantag duger bara som rad i en lista med ett skäl grinden kan verifiera, aldrig som tyst noll. | inbyggd i grindarna via `verktyg/matpunkt.js` — nämnar-grind, flerruts-grind, kontroll-svep och yt-kontrakt fäller och namnger sidan. Skäl-listan `SKAL` bär ett bevis som prövas i sidans källa, som `EJ_MOTOR` i `sidor.js` — och är **tom** i dag: mätningen visade att ingen av de sju nollorna är avsiktlig. Utanför räckvidden, med skäl i modulen: smalruta-svep (enheten är ruttyp) och tonad-svep (enheten är CSS-regel på alla sidor) |

#### Arkitektur — alla ämnen

| # | Regel | Vad vaktar den (matte) |
|---|---|---|
| A1 | **Delade moduler, inte kopior.** En kopia driver isär även när den är märkt som kopia. DELAD-basen ärvs/synkas; kopieras aldrig. | `verktyg/delkapitel-grind.js` (delad CSS + delat skal) · `verktyg/koppling-grind.js` (nod ⟷ generator) — men sidornas inline-CSS-kopior vaktas inte |

Nio av femton rader har en grind. **Fem har ingen:** V2 och V7 är läsregler (de säger hur man bygger och läser ett prov, inte vad sidan ska göra), V8 står bara i grindarnas huvud, och V11 och V13 väntar på vakter som ska byggas. **V12 räknas inte dit** — den kan inte vaktas mekaniskt och är disciplin, inte en TODO. A1 vaktas för skal och CSS-kanon men inte för sidornas inline-kopior. V9, V10 och V14 byggdes 2026-10-01.

> **Vad den här sektionen ersätter.** Av de elva reglerna stod **en** nedskriven förut: V1,
> som prosa i DEL 6 i Kemiboken och Svenskboken. Det blockcitatet står kvar ordagrant där
> det står — den här sektionen utökar det, ersätter det inte. Geografiboken och Historiaboken
> hade inte ens den. **V10 fanns inte nedskriven någonstans.** De övriga nio
> bars av praxis i mattearbetet utan att vara kanon i något ämne.

> **Tillägget 2026-10-01: V11–V13.** Tre regler till, och alla tre är belagda i samma
> arbetspass som skrev dem — de kommer ur fel som faktiskt gjordes, inte ur en genomgång av
> vad som *kunde* gå fel. Två av dem (V11, V12) föddes ur ett och samma fel: en grind som var
> grön för tre injicerade fel därför att den hoppade över mätningen, och en negativ
> verifiering som kördes i ett annat läge än grinden. **Regel före vakt** — de canoniseras nu
> med ärlig vaktkolumn, och vakterna byggs i en senare omgång. V12 får ingen: den kan inte
> vaktas mekaniskt.

> **V14 (2026-10-01).** Komplementet till V9, och belagt av samma tråd som V11 och V12: grön
> medan noll mäts. V9 stängde hålet att en sida kan stå utanför listan; V14 stänger hålet att
> en sida kan stå i listan och ändå inte mätas. Vakten tvingar fram ett val som förut gjordes
> av tystnaden: en **avsiktlig** nolla (grinden mäter en sorts rad sidan inte har) skrivs som
> skäl med bevis, en **oavsiktlig** nolla är ett fynd att utreda. Förut var båda tyst gröna.

---

### Mattens anteckningar till reglerna

Texten ovan är **delad** — den står ordagrant likadan i geografins, historians, kemins och
svenskans `KOMPONENTER-INNEHALL`. Ändra den inte här utan att spegla; det är hela skälet till
DELAD-BAS-stämpeln. Nedan står mattens egna anteckningar: varje regel med det fall som
bevisade den. De två sista hör inte till de elva — de är matte-egna tillägg, och kandidater
att lyfta in i den delade uppsättningen.

1. **Mät effekten, inte attributet.** *(V3.)* `getComputedStyle().fontFamily` säger `'Cormorant Garamond'` även när filen inte finns; `scrollWidth` säger att texten ryms så fort den scrollats; ett `data-`-attribut säger vad någon tänkte, inte vad eleven ser. En grind som mäter formen blir ett hinder för allt som gör rätt på ett annat sätt.

2. **Mät aldrig något som beror på vem som kör provet.** *(Matte-eget — INTE en av de elva. Kandidat att lyfta.)* `document.fonts.check('16px "Cormorant Garamond"')` svarar ja om typsnittet råkar vara **installerat på maskinen** — grönt hos den som bygger, rött hos eleven som saknar det. Den sortens grind är farligare än ingen grind alls, eftersom den är grön just där någon tittar. Mät vad **sidan själv levererar** (en FontFace i `document.fonts` kommer från sidans `@font-face`), aldrig vad datorn råkar ha. Samma sak gäller skärmstorlek, installerade teckensnitt, tidszon, språkinställning och allt annat som följer med maskinen och inte med sidan. Vill du pröva ett villkor som beror på omgivningen — telefonbredd, till exempel — så **ställ in omgivningen i provet** (`cdp-kor.js --viewport`) i stället för att lita på den du råkar ha.

3. **Mät på rätt ställe.** *(V4 och V6.)* En sida kan bära flera keypads och flera flikar. Mät per flik, per blad, per yta.

4. **Negativt verifiera varje ben.** *(V2.)* Återinför felet och se att grinden fäller.

5. **Ett prov som faller av fel skäl verifierar ingenting.** *(V7.)* Läs *varför* grinden blev röd, inte bara *att* den blev det. KORT-provet i kapitelside-grinden gav ett kommer-kort en länk till en fil som inte fanns; grinden föll — men på den trasiga länken, inte på klickbarheten. Det hade sett ut som en fungerande negativ verifiering av ett ben som i själva verket aldrig prövades. Bryt den mekanism benet påstår sig vakta, ingenting annat, och kontrollera att brottet som rapporteras är benets eget.

6. **Inget undantag i grinden.** *(Matte-eget — INTE en av de elva. Kandidat att lyfta.)* Går något inte att mäta ska markupen ändras, inte grinden få ett undantag. Går det ändå inte: skriv ned gränsen i grindens huvud.

7. **En i taget.** *(V8.)* Parallell körning ger CDP-timeouts.

8. **Kör provet i en riktig webbläsare, inte i en node-harness.** *(V1.)* Den äldsta av de åtta, och den som stod oskriven längst. En harness som importerar modulen och anropar den provar koden; eleven möter sidan. Node-harnessen gav flera falska gröna bockar i matematikbygget — en modul som räknade rätt i noden renderade fel, laddades inte, eller doldes av en annan flik. Varje grind här körs därför genom `verktyg/cdp-kor.js` mot sidan som eleven öppnar den (`file://`), med `window.onerror` kopplad så att ett JS-fel fäller provet i stället för att tystna. Noll nätväg: en grind som hämtar något över nätet mäter nätet.

9. **En tappad fil vid sidladdning är testmiljön, inte koden.** *(Matte-eget — INTE en av de elva.)* I den lokala testmiljön (headless Chromium via `verktyg/cdp-kor.js` mot förhandsservern på 127.0.0.1) tappar ungefär **en sidladdning på 60** en skript- eller stilfil: sidan ritas då ofullständigt eller inte alls (en motor saknas, knappsatsen hamnar i mobilläget), oftast **utan** JS-fel. Det är inte ett fel i koden — uppmätt 2026-11-21: den gamla och den nya uppgiftssidan laddades 60 gånger var och tappade en fil en gång var, och servern loggade inga misslyckade anrop. Därför: **ett enstaka avvikande läge körs om innan det räknas som en skillnad.** Försvinner avvikelsen vid omkörning var det miljön; kommer den tillbaka är det koden. Ett prov som ska skilja före från efter jämför aldrig en enda körning.
