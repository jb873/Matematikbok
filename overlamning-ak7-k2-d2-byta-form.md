# ÖVERLÄMNING – ak7-k2-d2-byta-form.html (Byta form)
**Projekt:** Digitalt matematikläromedel åk 7–9, hostat på GitHub Pages.
**Teknikstack:** Självständiga HTML-filer med inbäddad CSS. Ingen backend. Allt i samma mapp.
**Mall:** `ak7-k1-d7-division.html` är ursprunglig mall. Konversation på svenska.

---

## Namnbyte (uppdaterat)
Hela projektet har döpts om till mönstret `ak7-k{kapitel}-d{delkapitel}-ämne`. Gamla → nya namn relevanta här:
- `delkapitel-brak-2.html` → **`ak7-k2-d2-byta-form.html`** (denna fil, Kapitel 2 · Delkapitel 2)
- `delkapitel-brak.html` → **`ak7-k2-d5-addsub-brak.html`** (Kapitel 2 · Delkapitel 5, refereras nedan som "brak-5")
- `delkapitel-division.html` → **`ak7-k1-d7-division.html`** (mallen)

**Viktigt:** Endast *filnamnen* ändrades. Interna kodbeteckningar är oförändrade och ska användas som tidigare — localStorage-prefixen `brak2_` respektive `brak5_`, flik-IDn (`btform`, `blandad`, `rakna`, `test`), funktionsnamn och CSS-klasser. Hela boken delar nu samma formspråk (Source Serif 4 + Cormorant + Cinzel); färdighetsträningsfilerna `ak7-k1-ram.html` / `ak7-k2-ram.html` är harmoniserade mot detta.

---

## Filen vi jobbar med
**`ak7-k2-d2-byta-form.html`** – Kapitel 2, Delkapitel 2 · Byta form.
Ladda upp filen i chatten – Claude läser den direkt från disk.

---

## Struktur – fyra flikar

| Flik | ID | Status |
|------|----|--------|
| Bråk ↔ decimal | `btform` | ✅ KLAR – två nivåer |
| Blandad form | `blandad` | ✅ KLAR – två nivåer |
| Räkna med former | `rakna` | ❌ Platshållare – ska byggas |
| Visa vad du kan (test) | `test` | ❌ Platshållare – låst tills de tre övningsdelarna är klara |

Testet låses upp när eleven klarat **nivå 1** på alla tre övningsflikar (btform, blandad, rakna). Nivå 2 är frivillig fördjupning.

---

## Etablerade beslut (VIKTIGT att följa)

- **Alltid enklaste form** – 2/4 och 6/5 underkänns, 1/2 respektive 1 1/5 krävs.
- **Inga dubbletter** – "Nytt blad" drar utan återläggning via `gSample()`.
- **Nivåsystem:** Nivå 1 klarad helt (allt rätt) → markeras klar mot test-grinden. Nivå 2 låses upp vid ≤2 fel på nivå 1 (men krävs ej för testet).
- **localStorage-prefix:** `brak2_` (separerat från brak-5 som använder `brak5_`).
- **Avrundning:** 1/3 ≈ 0,33 och 2/3 ≈ 0,67 visas med ≈-tecken (inte = ). Godkänns: 0,33 eller 0,3 för 1/3; 0,67 eller 0,7 för 2/3.
- **Knappsats:** komma-tangent (`,`) alltid med på dessa delar. Operatorer läggs till vid behov.
- **Faktagranskning:** Faktagranska alltid facit med oberoende node-script innan leverans. Kör `node --check` på extraherad JS.

---

## Vad som är byggt

### Del 1 · Bråk ↔ decimal (`btform`)
**Två nivåer. Nivå 1 och 2 har samma struktur, olika talpool.**

Nivå 1 – pool `TERM1` (äkta bråk, nämnare ≤ 10):
`[1,2], [1,4], [3,4], [1,5], [2,5], [3,5], [4,5], [1,10], [3,10], [7,10], [9,10]`
Plus avrundade: `RUND1 = [1,3], [2,3]`

Nivå 2 – pool `TERM2` = TERM1 + åttondelar `[1,8],[3,8],[5,8],[7,8]` + tal >1 `[5,4],[7,4],[6,5],[7,5],[8,5],[9,5],[5,2],[7,2]`
Plus avrundade i bråk→dec: `RUND2` = RUND1 + `[9,8],[11,8],[10,3],[11,3]`

**Grupper per blad:**
1. Skriv bråket som decimaltal (4 exakta + 2 avrundade med ≈)
2. Skriv som bråk i enklaste form (6 st, bara tal som går jämnt ut)

**Radtyper som används:**
- `brakTillDec` – visar bråk, eleven skriver decimal i vanlig input
- `brakSvar` – visar decimal-text, eleven skriver bråk i täljare/nämnare-rutor

---

### Del 2 · Blandad form (`blandad`)
**Två nivåer. Nivå 1 och 2 har samma struktur, olika talpool.**

Nivå 1 – pool `BL_N1` (oäkta bråk >1, exakta decimaler, nämnare 2/4/5/10):
```
[3,2],[5,2],[7,2],[9,2],
[5,4],[7,4],[9,4],[11,4],
[6,5],[7,5],[8,5],[9,5],[11,5],[12,5],
[11,10],[13,10],[17,10],[19,10],[21,10],[23,10]
```

Nivå 2 – pool `BL_N2` = BL_N1 + åttondelar `[9,8]...[19,8]` + 25-delar `[26,25],[29,25],[31,25],[37,25],[43,25],[51,25],[57,25]`

**Grupper per blad (11 unika tal, 4+4+3, inga dubbletter):**
1. Skriv bråket i blandad form (4 st) → `radBrakBlandad` → typ `brakSvar`
2. Skriv bråket som decimaltal (4 st) → `radBrakDec2` → typ `brakTillDec`
3. Fyll i både decimal och blandad form (3 st) → `radBlandadBada` → typ `brakTillBanda`

**Ny radtyp `brakTillBanda`:** visar oäkta bråk, eleven fyller i decimal-input (klass `brak-bada-dec`) + blandad form (brak-svar-rutor). Rad-div har klass `brak-bada-rad`. Decimaldelen och blandad-delen rättas var för sig i graderingssektion 3. Varje del räknas som ett eget svar i totalt/rätt.

---

## Motorns radtyper (relevanta för brak-2)

| Typ | Beskrivning |
|-----|-------------|
| `brakSvar` | Svarsfält: [hel ruta] + [täljare/nämnare]. Hel-rutan visas bara vid blandad form. Klass `brak-svar-rad`. Facit fylls av `fyllFacitData()`. |
| `brakTillDec` | Visar bråk, vanlig decimal-input. Klass `ovn-brak-rad`. |
| `brakTillBanda` | Visar oäkta bråk, eleven fyller i BÅDA decimal (`brak-bada-dec`) + blandad form. Klass `brak-bada-rad`. Facit embedded direkt i HTML-attribut (data-dec, data-hel, data-t, data-n). Rättas av graderingssektion 3. |

Graderingen har tre sektioner:
1. Generisk (alla `.ovn-in` utom `.brak-cell`, `.brak-kladd`, `.brak-bada-dec`)
2. Bråksvar (`.brak-svar-rad, .brak-fragerad`)
3. Båda-rader (`.brak-bada-rad`) – decimal + blandad form var för sig

---

## Nästa steg – Del 3 · Räkna med former (`rakna`)

**Innehåll att bygga:** Räkna med tal i olika former – t.ex. 1,5 + 3/4, eller 2 1/4 − 0,75. Eleven behöver göra om ett tal till samma form innan räkning.

**Har ej diskuterats:** Stencil saknas. Frågor att stämma av i ny chatt:
- Vilka taltyper? (Samma pool som Del 2, eller enklare?)
- Bara addition/subtraktion, eller även multiplikation?
- Ska mellanled (uträkning) visas som i brak-5 flik 1?
- Två nivåer (Joachims preference: samma svårighetsgrad, bara andra tal) eller en nivå?
- Testets innehåll (Del 4) – bestäms när Del 3 är klar.

---

## Tekniska påminnelser till Claude i ny chatt

1. **Läs filen från disk** (`/mnt/user-data/uploads/ak7-k2-d2-byta-form.html`) med `view`-verktyget. Behöver inte förklaras – koden talar för sig.
2. **Kör alltid `node --check`** på extraherad JS innan leverans.
3. **Kör alltid oberoende facit-node-script** – verifiera mot handräknad tabell.
4. **Leverera till `/mnt/user-data/outputs/`** och använd `present_files`.
5. **Fuzz minst 30 000 blad** per generator för att verifiera inga dubbletter och korrekta svar.
6. `gSample(arr, k)` finns i filen – använd den för urvalet utan återläggning.
7. `kanonisk(t, n)` returnerar `{hel, t, n}` – enklaste blandade form. Alltid använda för att beräkna facit.
