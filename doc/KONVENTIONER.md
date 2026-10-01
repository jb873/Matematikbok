# KONVENTIONER — vad som är kontrakt, och vad som vaktar det

**Läs först.** Det här är matterepots regeldokument. Allt som byggs under `ak7/`, `ak8/`, `ak9/`, `js/` och `verktyg/` lyder under det.

En ny observation som kan påverka **plattformen** — alltså också geografi, historia, kemi och svenska — skrivs i [`PLATTFORMS-ANDRINGAR.md`](PLATTFORMS-ANDRINGAR.md), inte här. Hit flyttas den när den är beslutad och har en funktion att bo i.

**§1–§6 är mattens egna** (navigation, delkapitelsidor, rutor, text, taxonomi — och de regler ingen grind vaktar ännu). Sektionen **Delade plattformsregler** längst ner är däremot ordagrant samma text som i de fyra andra ämnenas `KOMPONENTER-INNEHALL`: ändras den här ska den speglas, och DELAD-BAS höjas i alla ämnen samtidigt.

En konvention som bara finns som en kopia i en redan byggd fil ärvs inte. Nästa sida byggs utan den, och ingen märker det förrän någon klickar. Därför står varje konvention här med **var funktionen bor** och **vad som vaktar den**.

> Regeln bakom listan: **det som är en funktion ärvs, det som är en kopia ärvs inte.**

Grindarna körs **en i taget** — parallell körning ger CDP-timeouts.

**Kolumnen "Vad vaktar den" är ärlig.** Står det ett verktyg finns ett prov som fäller när regeln bryts. Står det `—` finns ingen mätning, och regeln bärs bara av att någon minns den. **En tom cell är en TODO, inte ett klartecken.** Den ska skava.

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
| **Keypadens formgivning är EN fil**, med tre tydligt åtskilda lägen: aktiv, grå (tecknet gäller inte här — dämpad men läsbar, aldrig genomskinlig) och nedtryckt. Låg förr som en ordagrann kopia i nitton sidors `<style>`. | `js/motor/keypad.css` | `verktyg/yt-kontrakt.js` |
| **Bara det rättaren accepterar är tänt.** Godtar rättaren ett uttryck ska räknetecknen vara tända; godtar den bara ett färdigt tal är släckt rätt. Tändningen härleds ur rutans egna godtagna svar, inte ur en lista någon skrivit av. Ett tecken keypaden erbjuder men rättaren underkänner är en fälla, inte en hjälp. | `AK8_UI.tillatnaTecken` (läser `data-vars`, `data-form`, `data-kp`) | `verktyg/yt-kontrakt.js` (BOKSTAV · TECKEN SAKNAS) |
| **Inget dokument blir bredare än vyporten.** Blir det bredare kan eleven scrolla sidled på hela sidan, och på telefon glider uppgiften ur bild medan hon skriver. Brett innehåll — tabeller, figurer, flikrader — scrollar i sin **egen** ruta eller radbryter. | sidornas layout; tabeller via `.ak8-tabell` i `ak8-blad-kanon.css` | `verktyg/yt-kontrakt.js` (BREDD, mätt på 360 px i egen körning) |
| **Varje synlig ruta räknas och rättas.** Nämnaren är antalet synliga svarsfält. | bladmotorernas kontroll | `verktyg/namnare-grind.js` |
| **Kontrollera rättar bara rutor eleven svarat i.** En tom ruta är obesvarad, inte fel: ingen färg, inget kryss, inget facit — men den räknas i nämnaren, uppgiften finns kvar att göra. Gäller också inuti ett svar som består av flera rutor: bara de ifyllda färgas. Annars ger ett enda tryck bort hela bladets facit, och det noggranna arbetssättet — en uppgift i taget, Kontrollera efter varje — straffas hårdast. | bladmotorernas kontroll · `AK8_UI.markeraRutor` | `verktyg/kontroll-svep.js` |
| **Evidensen följer FÖRSTA försöket per ruta.** Senare tryck ändrar vad eleven ser, inte vad som loggats. Utan regeln kunde hon rätta sig fram till grönt — och tillsammans med facit-läckan skriva av svaret först. | `AK8_UI.loggaForstaForsoket` | **—** mätt EN gång med diagnos-proben (commit `9e5772d`). Ingen grind kör om den. |
| **Varje ruta i en rad markeras för sig.** | `AK8_UI.markeraRutor` (`res.per`) | `verktyg/flerruts-grind.js` |
| **Svarsformen är bindande** (blandad / bråk / decimal / enklaste) och står i data per grupp. | `Likhetsrattare.finalStatus` | `verktyg/svarform-koll.js` |

## §4 Texten

| Konvention | Funktionen bor i | Vad vaktar den |
|---|---|---|
| **All elevtext ligger i ett FALT-fält och godkänns per fil.** Ingen maskinskriven mening når eleven. | fälten `titel`/`rubrik`/`sub`/`fraga`/… | `verktyg/elevtext-grind.js` |
| **Ingen byggar-riktad text renderas för elev.** | — | `verktyg/platshallar-svep.js` |
| **Exemplet sammanfaller inte med en uppgift i samma grupp.** | `ExempelVakt` i metod-kärnan | `verktyg/exempel-svep.js` |
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

**Fem av sju kan bli riktiga grindar** (hjälptexter, mellanled på värde, bekräftelsesteg, förvald ruta, delad nod). **En kräver ett datakrok först** (figurerna — figuren måste bära sina värden). **En kan aldrig bli mer än en läslista** (nod när färdigheten bedöms separat), eftersom den vilar på en bedömning av vad som är två olika färdigheter.

Två rader stod här till 2026-10-01 och står inte kvar: *ny sida in i grindarnas listor* och *äkta oberoende slump*. De hörde aldrig hit — de är delade plattformsregler (V9 och V10), och de har verktyg nu: `verktyg/sidlist-grind.js` och `verktyg/slump-fuzz.js`. Raderna flyttade alltså inte för att de blev mindre bindande, utan för att de blev mätta.

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
