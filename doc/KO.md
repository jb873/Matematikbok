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

## Sidorna

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

## Beslut som väntar

- [ ] **Självskattningen visar "kommer"-löv som vanliga rader.** Kartan visar ett löv med `visning.kommer` som
  "kommer", men självskattningen (`js/karta/sjalvskattning.js`, delad) listar det med Kan/Osäker/Kan ej: kapitel 4:s
  Andelen, Delen och Det hela, och kapitel 3:s nio kommer-löv. Att ändra modulen ändrar också kapitel 3:s
  självskattning. Joachims beslut: ska självskattningen visa kommer-löv som "Kommer senare" (eller inte alls)?
  Mätt 2026-11-26 på `ak7/k4/kunskapslage/index.html?tab=sjalv`.

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
