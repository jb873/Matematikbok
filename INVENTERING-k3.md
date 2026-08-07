# INVENTERING — Kapitel 3 (Algebra, åk7) · READ-ONLY

**Typ:** kartläggning. Inga filer ändrade, ingen kod skriven, ingen commit. Denna fil är enda leveransen.

**Legend:** ✅ VERIFIERAT (läst rad / kört i headless / greppat) · 🔶 ANTAGANDE (rimlig slutsats, ej fullt belagd).

**Metod:** källa läst direkt; parsern + balansmetod-kedjan körda i **headless Chromium** (node-harness undveks). Tre parallella läs-agenter för d1/d7/ram/luckor.

---

## 0. HÖGSTA PRIORITET — BALANSMETODENS MELLANLED (kronjuvel)

### Var den bor
- ✅ **Fil:** `js/motor/ekvationer-balans/ekvationer-balans.js` (458 rader, 23,8 kB).
- ✅ **Modul eller inbäddat?** En **bar-script-fil** (ingen IIFE, inga exports) — globala funktioner + kör direkt på slutraden `renderFlikar(); visaFlik();` (rad 459). Filhuvudet (rad 1-3): *"FAMILJ D · EKVATIONSMOTOR (balansmetod, egen parser) … Byte-identiskt utbrutet (hela scriptet, logik orörd). Bespoke, delar inget med A/B/C."* Den är alltså redan utbruten ur sidan men **inte** modulariserad (globalt namnrum, ingen `montera`).
- ✅ **Värdsida:** `ak7/k3/d4-ekvationer/index.html` — enda filen som laddar den (`index.html:101`). Sidan tillhandahåller DOM-krokarna scriptet skriver till: `#flikRad` (`:96`), `#card` (`:97`), `#ghint` (`:98`), `#actions` (`:99`).

### 1. Publikt API
- ✅ **Inget.** Modulen exponerar inga funktioner (allt är fil-globaler, inget `window.*`, inga exports). Den *är* sin egen sida — kör på load och manipulerar host-DOM direkt. Vid migrering måste ett `montera(config)`-lager läggas UTANPÅ (den får ej skrivas om — kronjuvelsregeln).
- Interna nyckel-funktioner (parsern, se §C): `parseSida` (`:7`), `delaTermer` (`:26`), `tolkaTerm` (`:43`), `parseEkvation(vl,hl)→{A,B}` (`:87`), `sammaLosning(e1,e2)` (`:97`), `harUnikLosning` (`:112`), `losningAv` (`:113`), `arLost(vl,hl)` (`:416`).

### 2. Hur kedjan renderas
- ✅ **DOM per steg** (`nyRad`, `:366-380`): en `.eq-grid`-rad = `.eq-vl > .sida.sida-vl` `=` `.eq-hl > .sida.sida-hl` + `.eq-status`. Varje sida innehåller segment: text (`.seg-text`, `:318`) och bråk (`.seg-brak` med `.brak-tal`/`.brak-streck`, `:325-337`).
- ✅ **Eleven skriver HELA raden själv** (fri VL och HL) — ingen förifylld scaffolding-text. Verktygsknappar per uppgift: **+ Ny rad**, **· Gånger**, **Bråk** (`:301-304`).
- ✅ **Uppgifts-huvudet** (den givna ekvationen) renderas ur `visaVL`/`visaHL`-strängar via `visaSida`/`brakHTML` (`:253-267`); bråk kodas som `BRAK:t:n[:tillägg]` (t.ex. `:130`, `:140`).

### 3. Hur den rättas
- ✅ **Per steg (per rad), inte bara slutsvaret** (`kontrolleraUppg`, `:419-431`). Algoritmen: börja med `upp.startEkv` (den givna ekvationen, `:298`); för varje ifylld rad `parseEkvation(vl,hl)` och kräv `sammaLosning(forra, e)` — dvs **varje rad måste ha SAMMA lösning som föregående** ("gör samma sak på båda sidor"). Fel rad → `rad-fel` + `✗`, stopp. Sista raden måste dessutom vara `arLost` (x ensamt = tal, `:418`) för att uppgiften ska räknas löst (`nadde`, `:427`).
- ✅ **Inte tresektions-rättning.** Det är en fri likhetskedja med lösnings-bevarande per rad. Alla fält är elevifyllda i varje steg (både VL och HL).
- ✅ **Headless-verifierat (DOM-rök):** 5+x=8 löst i två rader (rad1 identitet `5+x=8`, rad2 `x=3`) → 4 `rad-ok`, 0 `rad-fel`, "✓ Löst!" visas. Fel-rad `x=10` på `x−12=5` → 2 `rad-fel`, global fel-hint. Rättningen fungerar.

### 4. Avtagande scaffolding
- ✅ **Ingen scaffolding-/nivåparameter som styr hur mycket som visas.** Eleven bygger alltid alla rader själv. Progressionen är i stället **sektions-baserad**: `NIVAER` (`:119-181`) har två nivåer (`steg2` "Grunderna", `steg3` "Variabel i båda leden"), var och en med `delar` (`intro`/`grund`/`svar`). En del låses tills föregående är klar (`del-last`, `:280-286`; `delKlar`/`delStatus`, `:315-316`). "Miniminivå" = den fria kedjan från start; det finns inget läge med mer/mindre förifyllt.

### 5. Beroenden (båda riktningar)
- ✅ **Använder:** ingenting externt utom host-DOM-elementen (`#card`/`#flikRad`/`#actions`/`#ghint`). **Egen parser** — den delar *inte* ekvationslogik med någon annan motor.
- ✅ **Används av:** ingen. Bespoke, isolerad (`:2`). Ingen annan fil importerar/anropar den (grep: enda referensen är `d4-ekvationer/index.html:101`).
- ✅ Slutsats: **inga farliga beroenden i migreringen** — den kan flyttas som helhet; risken är bara host-DOM-kontraktet + globalt namnrum.

### 6. Vad den täcker idag (✅ kört i headless mot ökande svårighet)
| Ekvationstyp | Exempel | Utfall |
|---|---|---|
| Ensidig | `5+x=8`, `5x+3=18` | ✅ x=3 |
| Variabel i båda led | `3x+5=x+11` | ✅ x=3 |
| Flera x-termer | `2x+7+3x=8+x+11` | ✅ x=3 |
| Bråk-koefficient | `(x)/(2)+4=6` | ✅ x=4 |
| Decimaltal | `10x−3,4=4,6` | ✅ x=0,8 |
| Negativa tal | `−2x=−10` | ✅ x=5 |
| x i högerled | `29=(x)/(6)+8` | ✅ x=126 |
| Uttryck i täljare | `(5x+3)/5=4` | ✅ x=3,4 |
| **Koefficient före parentes** | `3(x+2)=12` | ❌ **parse=null** (avvisas rent — ingen krasch, inget felsvar) |
| Ledande minus-parentes | `−(x−4)=1` | ✅ x=3 |

- ✅ **Klarar:** alla linjära former ovan (ensidig, båda led, bråk-koeff, decimal, negativa, uttryck-i-täljare med `/tal`).
- ✅ **Klarar INTE:** implicit multiplikation `tal(parentes)` → `null`. Det är **konsekvent** med att fördjupningsflikarna "Tecken före parentes" och "Siffra före parentes" är **låsta platshållare** (`ekvationer-balans.js:195-197`, `las:true`) och att `visaFlik` renderar dem som "inte byggd än" (`:233-234`). Test-flikarna likaså låsta (`:194`, `:197`, `:231-232`).

---

## A. DE TRE GJORDA DELKAPITLEN

### d1 — Algebraiska uttryck (`ak7/k3/d1-algebraiska-uttryck/index.html` + `js/motor/blad/blad-k3-d1.js`)
- ✅ **Val-rad:** INTE Föreläsning/Öva/Färdighetsträning/Fördjupning/Test. Sidan har en gammal `.tab-row` med 5 `.tab-btn` (`index.html:829-835`):
  - **Föreläsningar** — 🔶 STUBB (tom `FORELASNINGAR=[]`, `blad-k3-d1.js:20-23`; platshållartext `:76-81`).
  - **Skriva uttryck** — ✅ funktionell (`BLAD_SKRIVA`, 8 grupper, `:848-896`, byggs `:1027`).
  - **Tolka uttryck** — ✅ funktionell (`BLAD_TOLKA`, 6 grupper, `:898-951`).
  - **Beräkna med uttryck** — ✅ funktionell (`BLAD_BERAKNA`, 6 grupper, `:954-1012`).
  - **Test** — 🔶 STUBB ("Det här avsnittet byggs senare", `:1014-1022`).
- ✅ **Öva-blad:** **EXAKT-FÖRFATTAT** (hårdkodade objekt-literaler, inte genererat). Motorn *stöder* generering (`kanGenerera`/`genId`, `:579,:790`) men **inget blad sätter det** → helt statiskt. Källa: filhuvudet "Egen generation"; ingen docx/bokreferens nämns (🔶 sökt, inga sidhänvisningar).
- ✅ **Färdighetsträning:** finns INTE på d1-sidan. Den bor i `ak7-k3-ram.html` (se nedan) — d1-sidan laddar bara `blad-k3-d1.js` (`index.html:873`), aldrig `ovamer-k3.js`.
- ✅ **Wiring:** GAMMAL djupnav (egna flikar, klass-toggling `:4-16`); ingen KartaMotor/vy-router/deeplink.

### d4 — Ekvationer (balansmetoden)
- Se **§0**. ✅ Två funktionella flikar (Grunderna, Variabel i båda leden); Föreläsningar + Test + två parentes-fördjupningar är låsta platshållare. GAMMAL bespoke flik-nav (`#card`/`#flikRad`), ingen KartaMotor.

### d7 — Plugg till prov (`ak7/k3/d7-pluggtillprov/index.html` + `js/motor/blad/blad-k3-d7.js`)
- ✅ **Ingen val-rad** av standardtyp. Självständigt "Plugg till prov"-blad: behållarna `#plugg-grupprad`/`#plugg-doklista`/`#plugg-aktivt` (`index.html:970-976`).
- ✅ **En enda grupp** idag: "Tal och räkneregler" (`PLUGG_GRUPPER`, `blad-k3-d7.js:697-703`) med tre `klar:true`-dokument: `prio`, `negativa`, `multdiv` (fulla datablad `:705-786`).
- ✅ **Öva-blad:** **EXAKT-FÖRFATTAT** ("stencilerna från Joachim", `:687-688`); ingen generering aktiv.
- 🔶 **Latent bugg:** `bygg_blad` anropar odefinierad `byggSheet` (`:641,:675`) — vilande (kräver `kanGenerera` som aldrig sätts).
- ✅ **Ingen självskattning byggd** trots att hero-texten utlovar det (`index.html:965`).
- ✅ **Oanvänd talföljds-renderare:** `typ:'foljd'` finns (`:209-221`) men **utan data** (grep `typ:'foljd'`/`givna:` = 0) → infrastruktur för mönster finns latent, inga uppgifter.

### ak7-k3-ram.html ("Öva mer"-appen — bär färdighetsträningen)
- ✅ **Egen inline-monolit** (`<script>` `:198-451`): egen datastruktur `OMRADEN` (`:204-248`), egna jämförare (`jamforTal:259`, `jamforUttryck:267`, `forenklaFler:284`…), egen SPA-router `renderOversikt():387` + `oppnaGrupp():420`. Laddar EN extern fil: `ovamer-k3.js` (`:452`).
- ✅ **Fyra drill-familjer, GENERERADE + adaptiva nivå 1-3, egen motor** (inte `korOvning`): Tolka (`tolkaEngine`, `ovamer-k3.js:66`), Beräkna (`beraknaEngine:258`, explicit lvl 1/2/3), Förenkla (`forenklaEngine:462`), Skriva (`skrivaEngine:723`). Omgångar om 6, scorebar, `adjustLevel`.
- ✅ **Monterar INGET delat:** ingen ProvbyggarMotor/KartaMotor/Sjalvskattning/mastery (grep 0).
- ✅ **Döda deep-links:** `ak7-k3.html:405` (`?view=test-config`) och `:413` (`?view=skattning`) länkar hit, men ram-filen parsar aldrig `?view` → båda landar på vanliga översikten.

---

## B. LUCKORNA (mönster d2 · förenkla d3 · problemlösning d5)

Två parallella system måste skiljas: **(1) läs-delkapitel** `ak7/k3/dX/index.html` och **(2) "Öva mer"** (`ak7-k3-ram.html`+`ovamer-k3.js`).

- ✅ **Som läs-delkapitel: HELT TOMMA.** Inga filer `ak7/k3/d2*`, `d3*`, `d5*` existerar (ls+find, 0 träffar). Kapitelsidan bekräftar `fil:null, status:'soon'` (`ak7-k3.html:433,434,436`). Inga `blad-k3-d2/d3/d5`-motorer, inga `*monster*`/`*forenkla*`/`*problem*`-filer.
- ✅ **I "Öva mer":**
  - **Förenkla — FULLT BYGGT** (`renderForenkla` `ovamer-k3.js:553`, `forenklaEngine:462`, generatorer `:383/:407/:438/:444`; symbolisk `forenklaFler` `ram:284-317`). `implemented:true` (`ram:212`).
  - **Mönster/talföljd — REN STUBB:** område med 4 undergrupper ALLA `implemented:false` (`ram:216-224`), knappar `disabled` (`ram:402-403`), ingen motor (grep 0). Plus den oanvända d7-renderaren ovan.
  - **Problemlösning — REN STUBB:** 7 undergrupper ALLA `implemented:false` (`ram:236-247`), ingen motor.
- ✅ Ingen bortkommenterad uppgiftskod för mönster/problem hittad. Enda "halvfärdiga" spåret = talföljds-renderaren utan data (`blad-k3-d7.js:209`).

---

## C. EKVATIONSPARSERN (motorfamilj D)

- ✅ **Filväg:** `js/motor/ekvationer-balans/ekvationer-balans.js`, rader ~`7-113` (parsern) inuti 458-raders-filen.
- ✅ **Publikt API:** inget exponerat (fil-globaler); anropas internt av rättningen. Signaturer: `parseSida(str)→{a,b}|null`, `parseEkvation(vl,hl)→{A,B}|null`, `sammaLosning(e1,e2)→bool`, `harUnikLosning(e)→bool`, `losningAv(e)→tal`.
- ✅ **Teststatus:** **NOLL.** Ingen fuzz, ingen facit-verifiering, inga tester någonstans (grep: filen refereras bara av d4-sidan).
- ✅ **Ärlig bedömning (kört, §0-tabellen):** robust för **linjära** ekvationer — hanterar koefficienter, konstanter, x i båda led, flera x-termer, bråk-koefficient `(x)/(n)`, division av uttryck `/tal`, uttryck i täljare `(5x+3)/5`, decimaler (komma), negativa tal. **Kraschar inte** — ogiltigt/ostött ger `null` (t.ex. `3(x+2)`), inte felsvar. **Stödjer ej:** implicit multiplikation `tal(...)` / parentesexpansion, potenser, flera variabler.
- ✅ **Slutsats: BYGGBAR VIDARE PÅ.** Ren, liten, förutsägbar; avvisar det den inte klarar i stället för att ljuga. Naturlig utbyggnad = parentesexpansion (`a(bx+c)`) för att låsa upp de två fördjupningsflikarna. Bör INTE ersättas — men bör få fuzz + facit-verifiering innan den byggs ut (idag noll skyddsnät).

---

## D. ÖVRIGA MELLANLED I k3 (utöver balansmetoden)

Minst sex stegvisa mellanled finns; **alla rättar per fält/steg** (ej bara slutsvar):
1. ✅ `blad-k3-d1.js:504-520` + data `:958-1010` — `typ:'flerled'`: insättnings-likhetskedja `uttryck = [insättn] = [förenkling] = [svar]` (t.ex. `5y−3, y=2 → 5·2−3 = 10−3 = 7`); mellanled matchas på form, sista på tal.
2. ✅ `blad-k3-d1.js:539-546` — `typ:'mellan'`: `[Vänster]=[mellanled]=[svar]`, två fält, separat rättning.
3. ✅ `ovamer-k3.js:493-547` — `forenklaEngine` kat `omkrets`: uppställning (mellanled) → förenklat svar; rättas per steg (`jamforForm`/`jamforFler`).
4. ✅ `ovamer-k3.js:764-820` — `skrivaEngine` kat `figur`: mellanled + slutsvar, separat.
5. ✅ `blad-k3-d7.js:346-360` + data `:708-728` — `typ:'prio'`: lodrät prioriteringsuppställning, steg för steg.
6. ✅ `blad-k3-d7.js:336` + data `:734-751` — negativa-tal-mellanled (skriv om `−(−)` → `+`, sedan svar), två fält.

- ✅ Ett stegvis **mönster→uttryck**-mellanled finns **INTE** (talföljds-renderaren saknar data+motor).

---

## E. ÅTERANVÄNDBARHET (delade mekanismer vs k3)

✅ **k3 använder INGEN av de byggda delade mekanismerna.** Allt är bespoke/gammalt.

| Mekanism | Byggd (fil) | Används i k3? | Kan monteras som skal? |
|---|---|---|---|
| KartaMotor.montera | `js/karta/karta-motor.js:24` | ❌ Nej | Ja — men kräver k3-taxonomi (saknas) |
| Sjalvskattning.montera / kunskapsläge | `js/karta/sjalvskattning.js:27` | ❌ Nej | Ja — kräver taxonomi + MasteryK3 |
| mastery.js Proxy-loggning | `js/mastery.js` | ❌ Nej — **MasteryK3 saknas** (grep 0) | Ja — ny MasteryK3 efter k2-mönstret |
| korOvning / korOvningKlick | `ak7-k2-ram.html:479` m.fl. | ❌ Nej — k3 har egna engines | Delvis (drillarna skulle behöva portas) |
| villkors-validering | k2-lagret | ❌ Nej | Ja |
| delatMed (lånade noder) | `k2-taxonomi.js:104`, `sjalvskattning.js:204` | ❌ Nej | Kräver k3-taxonomi |
| OVERRIDES | `generate-taxonomi.js:191` | ❌ Nej (ingen k3-nod) | Ja när k3-noder finns |
| svg-moduler | `js/motor/figur/svg-tallinje.js` m.fl. | ❌ Nej — d7 har **egen** `ritaTallinje` (`blad-k3-d7.js:849`, dubblett) | Ja (ersätt dubbletten) |

- ✅ **Saknas helt för k3:** k3-taxonomi (`js/data/k3-taxonomi.js` finns ej; `K3_TAXONOMI`/`MasteryK3`/`k3.*belief|pref|mastery` = 0 träffar), provbyggar-montering, karta/självskattning, view-router.
- 🔶 **Krock-risker vid framtida montering:** globala namnkollisioner — `jamforTal`/`jamforText`/`jamforUttryck`/`konfetti` deklareras som fil-globaler i BÅDE `blad-k3-d7.js` och `ak7-k3-ram.html` (och balansmetoden lägger `parseSida` m.fl. globalt). Laddas delade motorer på samma sida vinner sista definitionen. Måste namnrymd-skyddas när k3 dras in under delad infrastruktur. Duplicerad `ritaTallinje` vs `svg-tallinje.js` = underhållsrisk.

---

## REKOMMENDERAD UPPLÄGGNING

**Balansmetodens mellanled behöver INTE granskas/kompletteras innan något wiras.** Det är verifierat fungerande (§0). Det ska **bevaras byte-identiskt** och wiras först — logiken rörs aldrig; den får bara ett tunt `montera(config)`-omslag + host-DOM-kontraktet flyttas med. Enda utbyggnaden (parentesexpansion för de låsta fördjupningsflikarna) är additiv och kan vänta.

**Men "wira det befintliga" kräver en förutsättning som saknas: en k3-taxonomi.** Utan den kan varken karta, provbyggare, kunskapsläge, självskattning, mastery, delatMed eller OVERRIDES fästa. Taxonomin är därför keystone-steget.

Föreslagen ordning:
1. **k3-taxonomi** (`js/data/k3-taxonomi.js`, handskriven som k2 eller via generate-taxonomi.js) — noder för d1/d4 (byggt) + platshållar-noder för d2/d3/d5. Keystone.
2. **MasteryK3** (kopiera k2-mönstret) + logga de befintliga drillarna (ovamer-k3) och balansmetoden mot nod-id.
3. **Wira det redan byggda** som tunna skal: KartaMotor + kunskapsläge + Sjalvskattning.montera (union vid behov), ProvbyggarMotor.montera, view-router (`?view=test-config`/`skattning` — idag döda länkar). Namnrymd-skydda k3:s globala jämförare/konfetti först (krock-risken i §E).
4. **Balansmetoden:** montera-omslag, bevara logik; koppla dess "löst"-signal till MasteryK3.
5. **Sedan bygga mellanled/innehåll:** luckorna d2 Mönster + d5 Problemlösning (rena stubbar idag), lyfta Förenkla (byggt i Öva-mer) till ett läs-delkapitel d3, och parentesexpansion i parsern (+ fuzz/facit-verifiering, som idag är noll).

**Kort:** wira befintligt först (taxonomi → mastery → montera-skal), bygg mellanled/luckor sen. Balansmetoden är klar och ska skyddas, inte kompletteras, i migreringen.
