# KÖ — öppna punkter som väntar på en egen order

Joachim 2026-11-26: kön bor här i repot, inte i en chatts minne. **Öppna punkter läggs hit i varje rapport, och
avklarade stryks.** En punkt här görs inte förrän Joachim ger en order om den — den smygs inte in i andra ordrar.

Varje punkt säger vad som brister, var det mättes och när.

## Grindarna

- [ ] **Brytningens `--sabba svarsplats` fäller inte på fria svar.** Sabotaget flyttar `.ovn-svarsrad` till radens
  vänstra kant, men grinden blir grön. K-K:s högerställning av det fria svaret är alltså inte negativt verifierad på
  uppgiftssidorna i nytt format. Prövat 2026-11-26 på d1 tolka Blad 1A och procent Blad 5A (`verktyg/brytning-grind.js`).
- [ ] **Figurgrindens KONTRAST mäter inte tallinjens radnamn.** Benet mäter bara text inuti en ritad yta; radnamnen i
  tallinjen med tre rader (`SvgTallinje.linje` med `rader`, procent Blad 1 nr 3) står på sidans bakgrund, och
  `--sabba kontrast` blir grön där. 2026-11-26 (`verktyg/figur-grind.js`).
- [ ] **Figurgrindens etikettben når inte staplarna och sträckan i Det hela.** `--sabba etikett` flyttar en text till en
  polygons hörn, och staplarna (`delStrip`) och sträckan (`strackfigur`) har inga polygoner — sabotaget gör ingenting på
  procent Det hela Blad 5A och 6A och grinden blir grön. ETIKETT MOT LINJE mäter bara texter med `af-matt`, så
  stapelns texter ("24 cm", "0 %", "100 %") prövas inte mot stapelns kanter. ETIKETT MOT ETIKETT fäller där (den fällde
  sträckans "40 %" mot "28 mm" innan radavståndet blev 24). Prövat 2026-11-27 (`verktyg/figur-grind.js`).

- [ ] **Uppgifts- och knappsatsgrinden hittar inte procentsidan.** `verktyg/uppgift-grind.js` och
  `verktyg/keypad-grind.js` letar uppgiftssidor efter namnet `…-nyformat/uppgift.html`; `ak7/k4/d1-procent` heter inte
  så, och `--sida d1-procent` ger "0 sidor" (gröna utan mätning). Mätt 2026-11-27.

## Metodträningen

- [ ] **Trädets löv får aldrig färg av elevens arbete.** `js/motor/arbetsyta/metodtrad.html` ritar trädet med
  KartaMotor och k3-storen (`MasteryK3`), och kartan läser evidensen på trädets egna löv-id (`nf-d3-P1`, `nf-k4d1-B2`).
  Drillerna loggar på taxonomins noder (`alg-…`, `proc-…`), och kapitel 4 i k4-storen. Löven står därför röda vad
  eleven än gör — i k3 och k4. Mätt i koden 2026-11-26 (`karta-motor.js`: `matris[node.id]`; lövets `nod` läses inte).
  Joachim 2026-11-27: tas i en egen order efter moment 3.
  Order 2026-11-27: trädet läser samma store och id som drillerna. Stannat på en fråga: flera löv delar nod (k4 B1–B5
  på proc-tillprocent, B6–B7 på proc-franprocent; k3 d1 T1–T6, K1–K7, R3–R6; k3 d3 F, S och M på alg-samla; d5:s
  varianter per typ), och ett försök bär inget löv-id — arbete på ett löv färgar då hela gruppen. k3 d1 R1–R2 och
  k3 d3 N1–N5 loggar i k1-storen.
  2026-11-27, Andelen: grenen A1–A7 står också röd. Mätt på momentsidan med 12 rätta poster på proc-andelen:rakna i
  k4-storen — alla 14 löv röda, "0 av 14 färdigheter befästa".
- [ ] **Andelens innehåll: två frågor till Joachim.** (1) Ordern säger att A5 nr 5 ska ha en tabell, men i
  `doc/innehall/k4-d1-procent-moment2-metodtraning.md` har bara A4 nr 5 en tabell; A5 nr 5 (hyllan med 32 platser) är
  byggd utan tabell. (2) A3:s bank nr 10, 22/44 = 1/2, har k = 22 — utanför lövets talregel k = 2–15. Banken står
  ordagrant; de nya talen följer talregeln (spec-fuzzen). 2026-11-27.
- [ ] **Testlistan visar två "Test 1".** Andelens test heter "Test 1" som i innehållsfilen, och moment 1:s test heter
  också "Test 1"; Test-vyn på momentsidan listar båda utan moment. 2026-11-27.

## Sidorna

- [ ] **Låset ser inte frågorna i Andelen.** `js/motor/blad/blad-k4-d1-andelen.js` lägger 43 frågor och rubriker
  genom hjälpfunktionen `q('…')` och frågetexterna före svarsraden som argument till `andel('9 av 20?', …)` — osynliga
  för elevtext-låset (samma sak som i Delen före 2d6d69f). Mätt 2026-11-27.

- [ ] **87 bokstäver ovanför rutor och 22 ovanför figurer.** 87 deluppgiftsbokstäver står ensamma ovanför en rad som
  börjar med en ruta, mest på sjuans k1-sidor; 22 står ovanför en figur i andra radtyper än K-C. Joachims beslut:
  kvar, fälls inte. (Uppgift-grindens EGEN RAD.)
- [ ] **d5-triangelns figurbrott.** Etiketten "a" ligger på "Omkrets 29 cm" i en triangel på den gamla d5-sidan
  (`ak7/k3/d5-problemlosning/index.html`). Sidan är olänkad och mäts inte av grindarna sedan 2026-11-26 (KONVENTIONER:
  olänkade gamla sidor). Mätt 2026-11-26: figurgrinden hittar inga figurer på d5-sidorna i nytt format.
- [ ] **4 brott i k1 d1.** Brytningsgrinden, K-K RITAT STRECK I STÄLLET FÖR RUTA, på `ak7/k1/d1-positionssystem`,
  Tals egenskaper Blad A c och d ("45 = ___ · ___ · 5 (skriv båda)", "90 = 2 · ___ · ___ · 5 (skriv båda)") och Blad B
  c och d ("63 = ___ · ___ · 7", "150 = 2 · 3 · ___ · ___"): likheten pekar på strecken, men rutan står efter
  meningen. Mätt 2026-11-26.

## Äldre kö (Joachim 2026-11-10/11: "Behåll i kön och gör inte nu")

Flyttad hit ur chattens minne 2026-11-26. Inte ommätt sedan dess.

- [ ] Nämnar-grindens Nytt blad-ben för åttans kvadratrot (PROBE8 mäter åttan i två pass men saknar benet).
- [ ] `GRUND_BL_N1`/`GRUND_BL_N2` saknas i d2:s talbank (`blad-k2-d2.js`, `BLAD_K2_D2` — namnen heter `GRUND_BLANDAD_N*`).
- [ ] `radBlandadBada` i `blad-k2-d2.js` är död kod.
- [ ] AUTOSPACE i ledrutorna i k2 d2 (friv-t), d3 (ml-t) och d6 (kors-cell) — yt-kontrakt rött sedan före v3.
- [ ] Luckan i kontroll-svep på k2 d3: grinden fyller bara svaret i en mellanledsrad, raden blir fel och facit räknas
  som "på tom ruta".
- [ ] De 21 ogranskade elevtexterna i `js/motor/blad/gen-ak8-alg1.js` — aldrig godkända i elevtext-låset; bara "alla
  tre" och "hon får … så många" är godkända där.
