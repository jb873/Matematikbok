# MELLANLEDS-REGISTER — Kapitel 3 (Algebra, åk7)

**Syfte:** checklista över ALLA byggda mellanled i algebra. Mellanledet — att eleven visar *vägen*, inte bara svaret — är plattformens kärna (kommunikation) och en kronjuvel. Ingen kommande k3-order får tappa bort ett av dessa; varje order ska stämmas av mot detta register. **Ingen kod ändras av registret.** Alla rader verifierade mot källan.

**Provbyggarens sub-typer** (js/provbyggare/provbyggar-motor.js:31, 86, 102): `numeric` · `flerval` · `product` · `brak` · `mellanled` (bråk-flerstegs, täljare/nämnare per led) · `mellanled-num` (numerisk flerstegs, slutVärde per led).

---

## 0. KRONJUVEL — Balansmetodens likhetskedja

| | |
|---|---|
| **Fil + rader** | [js/motor/ekvationer-balans/ekvationer-balans.js](js/motor/ekvationer-balans/ekvationer-balans.js) — parser `parseSida`/`parseEkvation`/`sammaLosning`/`arLost` (rad 7-113), render `renderNiva` (268-313) + `nyRad` (366-380), rättning `kontrolleraUppg` (419-431) + `kontrolleraAlla` (432-458) |
| **Taxonomi-nod** | `alg-ekv-ensidig:rakna` + `alg-ekv-badaled:rakna` (k3-taxonomi.js) |
| **Rättning** | **Per steg (per rad).** Varje ifylld rad tolkas som en ekvation `parseEkvation(vl,hl)` och måste ha **samma lösning som föregående rad** (`sammaLosning`, start = `upp.startEkv`). Sista raden måste vara `arLost` (x ensamt = tal). Fel rad → stopp + `rad-fel`. |
| **Elevifyllda fält** | **BÅDA leden (VL och HL) i varje rad**, fritt skrivna via segment (`.seg-text` + `.seg-brak`). Ingen förifylld scaffolding. |
| **Provbyggar-sub-typ** | **INGEN befintlig — NY VARIANT KRÄVS.** Alla nuvarande sub-typer rättar på *värde/facit*; detta rättar på **ekvations-EKVIVALENS** (lösnings-bevarande led-för-led, VL=HL). Föreslå variant `ekvation-kedja` / `balans`: N rader, varje rad = ekvation, alla samma lösning, sista = `x = tal`. |
| **Överlever migreringen om** | montera-omslaget bevarar **parsern orörd** (parseSida/parseEkvation/sammaLosning/arLost, byte-identiskt) OCH per-rad-kontraktet (start=startEkv, varje rad sammaLosning mot föregående, arLost-slutkrav). Wrappern får bara flytta host-DOM-krokarna (#card/#flikRad/#actions/#ghint) och exponera en mount — **aldrig röra rättningslogiken.** Verifierat fungerande (headless: 5+x=8 i två rader → Löst; fel rad → rad-fel). |

---

## 1. Insättnings-likhetskedja (`flerled`)

| | |
|---|---|
| **Fil + rader** | [blad-k3-d1.js](js/motor/blad/blad-k3-d1.js) — render rad 504-537, data rad 959-1010 |
| **Taxonomi-nod** | `alg-berakna:rakna` (Del1, Beräkna med uttryck) |
| **Rättning** | **Per led.** `uttryck = [insättning] = [förenkling] = [svar]` (t.ex. `5y−3, y=2` → `5·2−3` = `10−3` = `7`). Mellanleden matchas på FORM (`data-form`, normaliserad), sista ledet på tal (`data-svar`). |
| **Elevifyllda fält** | Varje led-input (insättning, förenkling, svar). |
| **Provbyggar-sub-typ** | Närmast `mellanled-num` (numeriskt flerstegs), MEN mellanleden matchas på uttrycks-FORM, inte bara värde → `mellanled-num` med **form-medveten led-matchning** (jamforForenkla). |
| **Överlever om** | montera-omslaget bevarar form-normaliseringen (data-form-jämförelsen) + slutledets tal-check. |

## 2. Två-fälts-mellanled (`mellan`)

| | |
|---|---|
| **Fil + rader** | [blad-k3-d1.js](js/motor/blad/blad-k3-d1.js) — render rad 539-546 (data-mellan + data-svar) |
| **Taxonomi-nod** | `alg-berakna:rakna` (Del1) |
| **Rättning** | Per fält: `[Vänster] = [mellanled] = [svar]`, mellanled + svar rättas separat. |
| **Elevifyllda fält** | mellanled-fält + svar-fält. |
| **Provbyggar-sub-typ** | `mellanled-num` (2-stegs numeriskt). |
| **Överlever om** | wrappern bevarar de två separata fält-checkarna (data-mellan, data-svar). |

## 3. Förenkla-uppställning · omkrets (öva-mer)

| | |
|---|---|
| **Fil + rader** | [ovamer-k3.js](js/motor/ovamer/ovamer-k3.js) — `forenklaEngine` kat `omkrets`, rad 493-547 (mellanled `forenkla-led`/`data-form` :496; svar :498; rättning :515-538) |
| **Taxonomi-nod** | `alg-samla:rakna` (Del3, Förenkla — generator: forenklaEngine) |
| **Rättning** | **Per steg.** Uppställning (mellanled) → förenklat svar. Mellanledet via `jamforForm`/`jamforFler`, slutsvaret via `jamforUttryck`/`jamforFler`. |
| **Elevifyllda fält** | uppställnings-fält + förenklat-svar-fält. |
| **Provbyggar-sub-typ** | **INGEN befintlig — NY VARIANT KRÄVS.** Detta är ett **algebraiskt uttrycks-mellanled** (uttryck → förenklat uttryck), rättat på uttrycks-EKVIVALENS (`jamforFler`), inte tal/bråk. Föreslå variant `uttryck-mellanled`. |
| **Överlever om** | wrappern bevarar `jamforFler`/`jamforForm` (symbolisk uttrycks-jämförelse) orörd. |

## 4. Skriva-uttryck · figur-mellanled (öva-mer)

| | |
|---|---|
| **Fil + rader** | [ovamer-k3.js](js/motor/ovamer/ovamer-k3.js) — `skrivaEngine` kat `figur`, rad 764-820 (mellanled uppställning/omkrets + förenklat slutsvar :807-808) |
| **Taxonomi-nod** | `alg-skriva:kommunikation` (Del1, Skriva uttryck — generator: skrivaEngine) |
| **Rättning** | Per steg: mellanled (uppställning) ska förenklas till samma som svaret; båda rättas separat (`jamforFler`). |
| **Elevifyllda fält** | uppställnings-fält + slutsvar-fält. |
| **Provbyggar-sub-typ** | Samma som #3 → **NY VARIANT `uttryck-mellanled`.** |
| **Överlever om** | samma som #3 (symbolisk jämförelse bevarad). |

## 5. Prioriterings-uppställning (`prio`)

| | |
|---|---|
| **Fil + rader** | [blad-k3-d7.js](js/motor/blad/blad-k3-d7.js) — render rad 345-360, data rad 706-728 |
| **Taxonomi-nod** | Del7 `alg-prov` (repetition). **OBS:** innehållet är k1-stoff (prioritering) → hör egentligen hemma i k1-noden `prio-prioritering` (delatMed-förslag, se rapport). |
| **Rättning** | **Per steg.** Lodrät uppställning: steg-rad(er) (`prio-vl`, "förenkla") + slutsvar (`prio-svar`). Varje steg egen ruta. |
| **Elevifyllda fält** | varje steg-ruta + slutsvar. |
| **Provbyggar-sub-typ** | `mellanled-num` (numeriskt stegvis). |
| **Överlever om** | wrappern bevarar de per-steg-rutorna (data-vl per steg + data-svar). |

## 6. Negativa-tal-mellanled (`flerled`, d7)

| | |
|---|---|
| **Fil + rader** | [blad-k3-d7.js](js/motor/blad/blad-k3-d7.js) — render rad ~336 (flerled-gren), data rad 729-751 |
| **Taxonomi-nod** | Del7 `alg-prov` (repetition). **OBS:** k1-stoff (negativa tal) → hör hemma i k1-noden `neg-rakna` (delatMed-förslag). |
| **Rättning** | Per fält: skriv om subtraktion av negativt tal → addition (mellanled), sedan svaret. Två fält, separat. |
| **Elevifyllda fält** | omskrivnings-fält + svar-fält. |
| **Provbyggar-sub-typ** | `mellanled-num`. |
| **Överlever om** | wrappern bevarar mellanled- + svar-checkarna. |

---

## SAMMANFATTNING — vad varje kommande order MÅSTE hedra

- **Tre distinkta rättnings-familjer:**
  1. **Ekvations-kedja** (balansmetoden) — lösnings-bevarande VL=HL per rad. **Ny provbyggar-variant krävs.** Kronjuvel — parsern + per-rad-kontraktet får ALDRIG skrivas om, bara omslutas.
  2. **Uttrycks-mellanled** (förenkla omkrets/figur) — symbolisk uttrycks-ekvivalens (`jamforFler`). **Ny provbyggar-variant krävs.**
  3. **Numeriskt mellanled** (insättning, mellan, prio, negativa) — mappar på befintlig `mellanled-num`, ev. med form-medveten led-matchning.
- **k1-repetition i Del7** (prio, negativa) ska bindas via `delatMed` mot k1-noderna, inte dupliceras.
- **k2:s ★-fördjupningsnoder** (faktorisera / bryta ut / konjugat) har hemvist i k3 (delatMed k2→k3, satt i k3-taxonomi.js). **När de får drillar ska de ha MELLANLED** — metodstegen är kärnan; svaret utan vägen är värdelöst där. (Samma lärdom som k2: mellanledet är kärnan och testet måste hedra det.)
