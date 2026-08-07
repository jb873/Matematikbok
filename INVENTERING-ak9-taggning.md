# INVENTERING — åk9-taggning (READ-ONLY)

Läs-pass. Ingen `js/data/`-fil, ingen taxonomi, ingen mastery-nyckel, ingen generator rörd.
Underlag för minNiva-/scaffolding-designen och för det taggnings-pass som följer.

---

## Utgångspunkt — bekräftad, med två korrigeringar

**Bekräftat:** Nians taluppfattning = samma union som åttans (`K1_TAXONOMI` + `K2_TAXONOMI`, scopat).
Ingen ny taxonomifil. Ingen nod har i dag `ak9`-tagg → **inget** syns i en åk9-scopad vy förrän taggen läggs.

**Mappning bekräftad mot `AK8_K1_BOK`** (nian 9 dk ← åttan 10 dk):

| Nian | Åttan-dk (id) | Not |
|---|---|---|
| N1 Tal och beräkna | `grunder` + `berakningar` | sammanslagning ✓ |
| N2 Räkna med bråk | `rakna-med-brak` + `addsub-brak` + `mult-brak` + `div-brak` | fyra → ett ✓ |
| N3 Negativa tal | `negativa-tal` | ✓ |
| N4 Potenser | `potenser` (inkl. prio-potenser) | ✓ |
| N5 Tiopotenser + små tal | `tiopotenser` | + neg-exp |
| N6 Grundpotenser + små tal | `grundpotenser` | + neg-exp |
| N7 Kvadratrötter | — | nytt (dk7) |
| N8 Fördjupning | `Fördjupning` | |
| N9 Plugg till prov | `Plugg till prov` | |

**Korrigering 1 — `minNiva` finns INTE per nod.** Det är en **per-vy-config**, inte nod-data. `neg-rakna:multdiv` har *inte* `minNiva:3`. Se sektion C.

**Korrigering 2 — tag-arkitekturen:** `K1_TAXONOMI` är **genererad** av `js/data/generate-taxonomi.js`; `K2_TAXONOMI` är **handskriven**. Var en åk9-tagg ska läggas beror på det (sektion A, kolumn "@bor").

---

## A. Nod-inventering per nians delkapitel

Kolumn "@bor" = var taggen bor och måste redigeras för att lägga `ak9`:
- **`OVERRIDES`** = `generate-taxonomi.js` OVERRIDES-map (k1; bevaras vid regenerering).
- **`EXTRA_NODER`** = hårdkodad i `generate-taxonomi.js` (k1).
- **`k1-default`** = sätts av `delArk[delId]` vid generering (k1; en åk9-tagg *måste* till OVERRIDES annars skrivs den över).
- **`k2-inline`** = inline i `k2-taxonomi.js` (handskriven; taggen redigeras på plats).

### N1 · Tal och beräkna
| nod | ak-taggar | @bor | förmåga/roll | gen |
|---|---|---|---|---|
| position:begrepp | ak7:mal | k1-default | BEGREPP/kärna | ✓ |
| primtal:begrepp | ak7:mal | k1-default | BEGREPP/kärna | ✓ |
| primtal:rakna | ak7:mal | k1-default | RAKNA/kärna | ✓ |
| delbarhet:rakna | ak7:mal | k1-default | RAKNA/kärna | ✓ |
| position:rakna | ak7:mal | k1-default | RAKNA/kärna | ✓ |
| position:resonera | ak7:mal | k1-default | RESONERA/kärna | ✓ (belief) |
| mult-rakna:pow10 / :sma / :stora / :storasma | ak7:mal, **ak8:repetition** | **OVERRIDES** | RAKNA/kärna | ✓ |
| div-rakna:pow10 / :sma / :stora / :storasma | ak7:mal, **ak8:repetition** | **OVERRIDES** | RAKNA/kärna | ✓ |

### N2 · Räkna med bråk (alla @k2-inline)
| nod | ak-taggar | förmåga/roll | gen |
|---|---|---|---|
| andel-antal / brak-blandad / brak-likformig / brak-forkorta / brak-forlanga / brak-tid | ak7:mal, ak8:repetition | RAKNA/kärna | ✓ |
| brak-jmf-lika:begrepp / andel-tallinje:begrepp | ak7:mal, ak8:repetition | BEGREPP/kärna | ✓ |
| andel-figur:rakna | ak7:mal, ak8:repetition | RAKNA/kärna (visuell) | ✓ |
| andel-hela:resonera / brak-jmf-ordna:resonera | ak7:mal, ak8:repetition | RESONERA/kärna | ✓ (belief) |
| brak-add / brak-sub | ak7:mal, ak8:repetition | RAKNA/kärna | ✓ |
| brak-mult-rakna | ak7:mal, ak8:repetition | RAKNA/kärna | ✓ |
| brak-div-hb / :bh / :bb / :inv | ak7:**fordjupning**, ak8:mal | RAKNA/fördjupning | ✓ |
| **brak-lana** | ak8:mal | RAKNA/kärna | **✗ gen** |
| **brak-mult-forkorta** | ak8:mal | RAKNA/kärna | **✗ gen** |
| **brak-div-reciprok** | ak8:mal | RAKNA/kärna | **✗ gen** |

### N3 · Negativa tal
| nod | ak-taggar | @bor | roll | gen |
|---|---|---|---|---|
| neg-begrepp:begrepp | ak7:mal | k1-default | BEGREPP/kärna | ✓ |
| neg-rakna:addsub | ak7:mal, ak8:repetition | OVERRIDES | RAKNA/kärna | ✓ |
| neg-rakna:multdiv | ak7:mal, **ak8:mal** | OVERRIDES | RAKNA/kärna | ✓ |

### N4 · Potenser (alla ak8:mal; k1-default utom EXTRA_NODER)
| nod | @bor | förmåga | gen |
|---|---|---|---|
| pot-begrepp:skriva | k1-default | BEGREPP | ✓ |
| pot-begrepp:evaluera | k1-default | RAKNA | ✓ |
| pot-addsub:rakna | k1-default | RAKNA | ✓ |
| pot-multdiv:rakna / :losut | k1-default | RAKNA | ✓ |
| pot-multdiv:resonera | k1-default | RESONERA | ✓ (belief) |
| **pot-begrepp:tabell** | **EXTRA_NODER** | RAKNA | **✗ gen** |
| **pot-begrepp:figur** | **EXTRA_NODER** | BEGREPP | **✗ gen** |
| **prio-potenser** | **EXTRA_NODER** | RAKNA | **✗ gen** |

### N5 · Tiopotenser + små tal (alla ak8:mal, k1-default)
tio-rakna:skriva (BEGREPP✓) · :evaluera (RAKNA✓) · :rakna (RAKNA✓) · :addsub (RAKNA✓) · :losut (RAKNA✓) · **:prefix (BEGREPP ✗gen, @EXTRA_NODER)**

### N6 · Grundpotenser + små tal (alla ak8:mal, k1-default)
gp-rakna:skriva (BEGREPP✓) · :multdiv (RAKNA✓) · :addsub (RAKNA✓) · :losut (RAKNA✓)

### Tre listor (arbetsmängd)

**A1 — redan åk9-relevant, bara nivå behövs:** **Tom.** Ingen nod har `ak9`-tagg; scoping kräver `arskursRelevans.ak9` per nod. Ingen ärvs automatiskt.

**A2 — behöver `ak9`-tagg (så gott som alla med generator).** Förslag med skäl (Joachim beslutar slutligt):
- N1 mult/div-rakna, N2-bråk (repetition-noder), N3 neg-add/sub: **`ak9:rep`** — samma färdighet, högre talområde = högre nivå, grönt från förr ärvs.
- N2 brak-div-*, N3 neg-multdiv, N4 potenser, N5 tio, N6 gp: **`ak9:mal`** — nians kärninnehåll.
- position/primtal/delbarhet (N1 grunder): **`ak9:rep`** eller **stöd** — de bär E-spårets botten (se B).
- Taggen läggs i **OVERRIDES** för k1-default-noder (annars regenereras den bort) och **inline** för k2-noder.

**A3 — finns inte, måste författas (identifieras, ej byggas):**
- **N7 Kvadratrötter** — hel nod-familj saknas (BEGREPP: rot-begrepp; RAKNA: perfekta/icke-perfekta rötter; METOD: förenkla √8=2√2). Se E.
- **Negativ exponent (N5/N6)** — form-nod saknas (`10⁻³`, `a·10⁻ⁿ`). Se D + nod-beslutet "egen nod".

---

## B. Nivå-inventering (kärnan) — nivå → talområde per generator

Läst ur talurvalet, inte dokumentation. Nivå = drillens streak-nivå (`level`); flera generatorer skalar dock **inte** på `level` utan på `opts` (fasta band per variant).

### Potens-familjen (`js/motor/potens/potens-drill.js`) — SAMMA motor för pot/tio/gp, bara `basFn` + `opts`
| generator | nivåberoende | talområde |
|---|---|---|
| genEvaluera (49–56) | `eMax = 2 + min(level,2)` → **grund nivå 1: e∈[2,3]; nivå ≥2: e∈[2,4]** | värde ≤ `opts.valMax` (pot 1000, **tio 1e8**, gp via genGp); nivå 1: 25% bas∈{0,1} |
| genSkriva (117–121) | **ingen** (level ignoreras) | e∈[2,6], bas 2–9 / 10 |
| genMultdiv (76–91) | **ingen** | mult m,n∈[2,7], m+n≤12; div mm∈[5,12], nn∈[2,mm−1]; blandat p,q∈[2,6] |
| genAddsub (62–73) | **ingen** (styrs av opts) | e∈[2,`opts.expMax`] (pot 3, **tio 6**), värde ≤ `opts.valMax` (pot 130, **tio 1e6**) |
| genLosut (95–105) | **ingen** | A: x^e=V, e∈[2,5], V=b^e≤1e5; B: b^x=V, x∈[0,8] |

**Slutsats potenser:** nivå-stegen är **grund** — bara genEvaluera skalar (till nivå 2, sedan platt). Talområdes-vidden kommer ur `opts` (tio/gp vidgar), inte ur level. → En nians nivå ovanpå åttans kräver **utökat talurval/opts**, inte bara ett `level`-steg; taket sitter i de fasta banden.

### K2-bråk-drillarna (`js/motor/ovamer/ovamer-k2.js`) — äkta 3-nivåstege (MAXNIVA=3, KRAV=4 rätt i rad)
| generator | nivå 1 | nivå 2 | nivå 3 |
|---|---|---|---|
| forlangaEngine (12–14) | 1/2,1/3,2/3,1/4,3/4 | 2/5,3/5,1/6,5/6,3/8,5/8 | 3/7,4/9,5/12,7/10,5/9,7/12 |
| forkortaEngine (42–44) | små nämnare | mellan | 3/7…7/12 |
| raknaEngine add/sub (130–146) | samma nämnare | ena delar andra | förläng båda (pool3) |
→ Bråk-drillarna har **redan** en riktig nivå-stege med stigande nämnare/komplexitet. E-spåret har nivå 1 att falla tillbaka på.

### Mult/div-rakna (`js/motor/metod/metod-mult.js`) — band per kategori
- pow10: ·10/100/1000. sma: decimal (whole 10–999, 1–2 dec, 838–844). stora: `d3RandInt(31,55)…(238,899)` (563–567). storasma: mellanled. Uppställning: nivå 1 m∈23–99, nivå 2 123–999, nivå 3 decimaler (814–817).

### Neg (`js/motor/metod/metod-negativa-ak8.js`) — 3 nivåer (19–52)
nivå 1: a,b∈[2,12]; nivå 2: a∈[2,20], decimaler, tre faktorer; nivå 3: stora × 10/100/200.

### position/primtal/delbarhet (N1 grunder)
Custom-generatorer (i `ak7-k1-ram.html`). Egna nivå-/talband finns men lästes **inte** i detalj denna gång — de är åk7-grunder (stöd-spår), mindre kritiska för nians tak. Flaggas för läsning om de ska in i ett nian-nivåband.

---

## C. Befintliga `minNiva`-värden — bekräftar: obyggt som nod-data

`minNiva` sätts **aldrig per nod**. Enda förekomster (data):
- **Per-vy-config**, satt vid montering av karta/självskattning:
  - `ak7/k1/karta/index.html:53` → `minNiva: null`
  - `ak7/k1/kunskapslage/index.html:66`, `ak7/k2/kunskapslage/index.html:70` → `minNiva: null`
  - **`ak8/k1/karta/index.html:77` → `minNiva: 3`** (nivåbryggan; gäller HELA åk8-vyn, inte en nod)
- **Mekaniken:** `js/mastery.js:70,74` `masteryState(log, minNiva, …)` filtrerar rätt-events på `niva ≥ minNiva`. `js/karta/karta-motor.js:91,162` och `sjalvskattning.js` skickar in `PREF.minNiva`.

→ **`minNiva` är i praktiken obyggt som data.** Det finns som *ett tal per vy* (åk8=3), inte per nod. Det är designens verkliga startpunkt: nians nivå-band måste besluta om det ska förbli per-vy (ett tal för hela nian) eller bli per-nod, och `niva`-fältet på rätt-events måste sättas av generatorerna för att `minNiva` ska betyda något.

---

## D. Neg-exp-gaten — distribuerad, inte en one-liner

Fil: `js/motor/potens/potens-drill.js`. **Motorn stödjer negativ exponent redan** — `potSvarStr` (21) och `potSvarHtml` (22) renderar `a⁻ᵏ = 1/aᵏ`; kommentar 20–21 + 74–75 säger uttryckligen "motorn KAN, talurvalet avgör".

Gaten = exponent-urvalet, som är **positivt på flera ställen**:
| generator | rad | exponent-urval | relax innebär |
|---|---|---|---|
| genEvaluera | 51,53 | `eMin = opts.expMin ?? 2`; `e = ri(eMin,eMax)` | tillåt `expMin < 0` för tio/gp |
| genSkriva | 119 | `e = ri(2,6)` | vidga till negativa |
| genMultdiv (div) | 84 | `if(opts.neg){ mm=ri(2,9); nn=ri(2,9) }` → m<n → **negativ resExp** | **redan en flagga** — sätt `opts.neg` |
| genLosut | 101,102 | `x = ri(0, …)` | tillåt negativa x |

→ **Överlämningens "one-liner" stämmer bara för motorn** (redan neg-exp-kapabel) **och för multdiv** (`opts.neg` = en flagga). Evaluera/skriva/losut kräver **var sin** talurvals-ändring. Gaten sitter alltså på **~3–4 ställen**, inte ett. Nians dk5/6 neg-exp är därför en liten men **flerställig** relax — plus form-frågan (svaret `1/10³` vs `0,001`) som är ett format-beslut, inte bara ett talurval.

---

## E. Lös-ut-basen för kvadratrötter (`genLosut`, dk7)

Signatur: `genLosut(level, basFn, opts)`. Form A (rad 97–100): `x^e = V, x = ?`, där `b = ri(2,9)`, `e = ri(2,5)`, `V = b^e` **konstruerad som perfekt potens** → svar `x = b` (heltal).

- **`e = 2` fungerar redan** för **perfekta kvadrater**: V∈{4,9,…,81}, `x² = V → x = b` heltal. Så "√ av perfekt kvadrat → heltal" är **gratis** (genLosut med e låst till 2).
- **Icke-perfekta kvadrater (det pedagogiskt intressanta):** genLosut genererar **aldrig** dem (V är alltid en perfekt potens per konstruktion). `√2, √20, förenkla √8 = 2√2, uppskatta √20 mellan 4 och 5` → **helt nytt** författar-jobb: ny generator (icke-perfekt radikand), nytt svarsformat (radikal-form / decimal-approximation / förenkling), ny rättare. → **dk7 är billig för perfekta rötter, dyr för irrationella** — och irrationella rötter är själva poängen med kapitlet.

---

## F. Luckor som blockerar nivåhöjning (union-brett)

En nod utan drill kan inte nivå-höjas. **10** union-lövnoder saknar generator; av dem ligger **7 i nians taluppfattning-mappning:**

| nod | delkapitel | ak-tagg | typ |
|---|---|---|---|
| tio-rakna:prefix (SI-prefix) | N5 | ak8:mal | begrepp/korval |
| brak-lana | N2 | ak8:mal | räkning (lucka) |
| brak-mult-forkorta | N2 | ak8:mal | räkning (lucka) |
| brak-div-reciprok | N2 | ak8:mal | räkning (lucka) |
| prio-potenser | N4 | ak8:mal | räkning (Öva-blad-nod) |
| pot-begrepp:tabell | N4 | ak8:mal | räkning (Öva-blad-nod) |
| **pot-begrepp:figur** | N4 | ak8:mal | begrepp/visuell (**utöver orderns lista**) |

**Bekräftat + en till:** orderns lista (SI-prefix, brak-lana, brak-mult-forkorta, brak-div-reciprok, prio-potenser, pot-begrepp:tabell) stämmer; **`pot-begrepp:figur`** är en sjunde utan drill i samma familj.

**Utanför nian-mappningen** (union-brett, för fullständighet): `fordjup-variabler:rakna`, `fordjup-brytut:resonera`, `fordjup-brytut:konjugat` (k2, `ak7:fordjupning`) — algebra-fördjupning, ej nian-taluppfattning.

Not: provbyggaren har **egna** test-generatorer för brak-lana/mult-forkorta/div-reciprok/SI-prefix/prio-potenser (åttans ram) — de är alltså **mätbara i prov** men saknar **nöt-drill** (Färdighetsträning). Nivå-höjning gäller nöt-drillen; provbarheten finns redan.

---

## Sammanfattning för minNiva-/scaffolding-designen

1. **minNiva är obyggt** (per-vy-tal, ej nod-data) → designens startpunkt; kräver att generatorerna sätter `niva` på rätt-events.
2. **Nivå-stegar finns färdiga** i bråk- (3 nivåer) och neg-drillarna (3 nivåer); **grunda/opts-styrda** i potens-familjen → nians potens-nivåer kräver utökat talurval, inte bara ett level-steg.
3. **Neg-exp** = motorn klar, gaten på ~3–4 talurvals-ställen (+ format-beslut).
4. **Kvadratrötter** = perfekta gratis (genLosut e=2), irrationella nytt.
5. **7 drill-luckor** blockerar nivåhöjning i N2/N4/N5.

Inget skrivet: ingen `ak9`-tagg, inget `minNiva`, ingen nod, ingen generator. `git status` = bara denna rapportfil.
