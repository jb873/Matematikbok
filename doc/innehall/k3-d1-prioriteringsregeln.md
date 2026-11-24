# Prioriteringsregeln — Del 1 Algebraiska uttryck, moment 2 (åk 7)

Innehållsdokument för bladen 1A, 1B, 2A och 2B. Två källor, angivna per del:

- **Joachims klartext (2026-11-22)** — uppgifterna som i bladfilerna står som formelobjekt (1A/1B nr 3,
  2A/2B nr 1–2), med facit. Joachim har kontrollräknat alla facit; 2A/2B nr 2 har facit här (det saknades i
  bladfilerna). Ordagrant som den kom, nedan under "Klartext från Joachim".
- **Bladfilerna** `Prioriteringsregeln_Blad_1A/1B/2A/2B.docx` — de delar som stod i klartext (övriga uppgifter
  och facit), avskrivna ordagrant.

Byggs i `js/motor/blad/blad-k3-d1-prio.js`. Källhänvisningar i hakparentes ("[Grundkurs 1, 2.2 2031]") hör till
dokumentet och visas inte för eleven.

> **Avvikelse mellan källorna (rapporterad 2026-11-22):** bladfilernas facit för 1B nr 3a ("5 + 3 = 8"),
> 2B nr 1b ("3 · 9 + 8 − 6 = 27 + 8 − 6 = 29") och 2B nr 1c ("45 − 2 · 7 + 3 = 45 − 14 + 3 = 34") hör till andra tal
> än Joachims klartext. Joachims klartext gäller.

## Klartext från Joachim (ordagrant)

```
Notation: bråk [täljare | nämnare] ritas med vågrätt bråkstreck, inga
parenteser runt täljare/nämnare (K-H, bekräftat). Eleven skriver av uttrycket
och visar mellanled. Mellanled rättas på form som övriga flerled; bråk i ett
mellanled godtas som stående bråk, snedstreck (18/6) och kolon (18:6).

BLAD 1A, uppgift 3: Beräkna.
a) [12 | 3] + 5
b) 7 + [18 | 6]
c) [9 + 6 | 5]
Facit: a) 4 + 5 = 9   b) 7 + 3 = 10   c) [15 | 5] = 3

BLAD 1B, uppgift 3: Beräkna.
a) [24 | 4] + 7
b) 9 + [21 | 7]
c) [8 + 12 | 4]
Facit: a) 6 + 7 = 13   b) 9 + 3 = 12   c) [20 | 4] = 5

BLAD 2A, uppgift 1: Beräkna.
a) 5 · (3 + 4) + [12 | 3]
b) 2 · (6 + 3) + [20 | 4] − 7
c) 40 − 3 · (8 − 2) + [9 | 3]
Facit: a) 5 · 7 + 4 = 35 + 4 = 39
       b) 2 · 9 + 5 − 7 = 18 + 5 − 7 = 16
       c) 40 − 3 · 6 + 3 = 40 − 18 + 3 = 25

BLAD 2A, uppgift 2: Beräkna.
a) [18 | 11 − 5]
b) [50 − 14 | 3 + 6]
c) [4 · 15 | 6] + [6 · 10 | 12]
Facit: a) [18 | 6] = 3
       b) [36 | 9] = 4
       c) [60 | 6] + [60 | 12] = 10 + 5 = 15

BLAD 2B, uppgift 1: Beräkna.
a) 4 · (2 + 5) + [15 | 3]
b) 3 · (4 + 6) + [18 | 3] − 9
c) 50 − 4 · (9 − 3) + [12 | 4]
Facit: a) 4 · 7 + 5 = 28 + 5 = 33
       b) 3 · 10 + 6 − 9 = 30 + 6 − 9 = 27
       c) 50 − 4 · 6 + 3 = 50 − 24 + 3 = 29

BLAD 2B, uppgift 2: Beräkna.
a) [24 | 10 − 6]
b) [45 − 9 | 5 + 7]
c) [3 · 16 | 8] + [5 · 12 | 10]
Facit: a) [24 | 4] = 6
       b) [36 | 12] = 3
       c) [48 | 8] + [60 | 10] = 6 + 6 = 12
```

Ersatt 2026-11-22: meningen 'Mellanled rättas på form som övriga flerled' gäller inte längre. Prioriteringsuppgifter rättas med prioKedjan, på värde (KONVENTIONER §3). Bara avskriften rättas på form.

## Ur bladfilerna (klartextdelarna, ordagrant)

### Blad 1A
Skriv av uttrycket och visa ett mellanled i varje uppgift.

- **Uppgift 1** Beräkna. a) 4 + 3 · 6 b) 5 · 7 + 2 c) (6 + 2) · 3 [Grundkurs 1, 2.2 2031]
  — Facit: a) 4 + 18 = 22 b) 35 + 2 = 37 c) 8 · 3 = 24
- **Uppgift 2** Beräkna. a) 20 − 3 · 4 b) 6 · 5 − 7 c) (11 − 4) · 3 [Grundkurs 2, 2.2 2032]
  — Facit: a) 20 − 12 = 8 b) 30 − 7 = 23 c) 7 · 3 = 21
- **Uppgift 3** — se Joachims klartext. [2.2 2034, Grundkurs 3]
- **Uppgift 4** Vilket tal ska stå i rutan för att likheten ska stämma? a) □ + 3 · 4 = 20 b) 5 · □ − 6 = 14
  c) □ · (2 + 3) = 35 [gröna boken 88–90]
  — Facit: a) 8 (8 + 12 = 20) b) 4 (20 − 6 = 14) c) 7 (7 · 5 = 35)

### Blad 1B
Skriv av uttrycket och visa ett mellanled i varje uppgift.

- **Uppgift 1** Beräkna. a) 5 + 4 · 7 b) 8 · 3 + 6 c) (7 + 3) · 4 [Grundkurs 1, 2.2 2031]
  — Facit: a) 5 + 28 = 33 b) 24 + 6 = 30 c) 10 · 4 = 40
- **Uppgift 2** Beräkna. a) 25 − 4 · 5 b) 7 · 4 − 9 c) (13 − 5) · 2 [Grundkurs 2, 2.2 2032]
  — Facit: a) 25 − 20 = 5 b) 28 − 9 = 19 c) 8 · 2 = 16
- **Uppgift 3** — se Joachims klartext. [2.2 2034, Grundkurs 3]
- **Uppgift 4** Vilket tal ska stå i rutan för att likheten ska stämma? a) □ + 4 · 5 = 26 b) 6 · □ − 8 = 22
  c) □ · (1 + 4) = 45 [gröna boken 88–90]
  — Facit: a) 6 (6 + 20 = 26) b) 5 (30 − 8 = 22) c) 9 (9 · 5 = 45)

### Blad 2A
Skriv av uttrycket och visa mellanled i varje beräkning.

- **Uppgift 1** — se Joachims klartext. [2.2 exempel 4, Grundkurs exempel 2]
- **Uppgift 2** — se Joachims klartext. [2.2 2042–2043]
- **Uppgift 3** Gör så att likheten stämmer. I a och b sätter du in +, − eller · i rutorna. I c sätter du ut en
  parentes. a) 4 □ 5 □ 3 = 17 b) 4 □ 5 □ 3 = 19 c) 2 + 4 · 5 − 1 = 29 [2.2 2044, 2057]
  — Facit: a) 4 · 5 − 3 = 17 b) 4 + 5 · 3 = 19 c) (2 + 4) · 5 − 1 = 30 − 1 = 29
- **Uppgift 4** Beräkna. a) 12,5 − 2 · 3,5 b) 5 · 1,2 + 2,4 · 10 c) 8 · 7 − 4,5 + 10 · 0,25
  [gamla boken 1053–1058]
  — Facit: a) 12,5 − 7 = 5,5 b) 6 + 24 = 30 c) 56 − 4,5 + 2,5 = 54

### Blad 2B
Skriv av uttrycket och visa mellanled i varje beräkning.

- **Uppgift 1** — se Joachims klartext. [2.2 exempel 4, Grundkurs exempel 2]
- **Uppgift 2** — se Joachims klartext. [2.2 2042–2043]
- **Uppgift 3** Gör så att likheten stämmer. I a och b sätter du in +, − eller · i rutorna. I c sätter du ut en
  parentes. a) 6 □ 2 □ 4 = 16 b) 6 □ 2 □ 4 = 14 c) 3 + 5 · 4 − 2 = 30 [2.2 2044, 2057]
  — Facit: a) 6 · 2 + 4 = 16 b) 6 + 2 · 4 = 14 c) (3 + 5) · 4 − 2 = 32 − 2 = 30
- **Uppgift 4** Beräkna. a) 14,5 − 3 · 2,5 b) 4 · 1,5 + 3,6 · 10 c) 9 · 6 − 3,5 + 10 · 0,15
  [gamla boken 1053–1058]
  — Facit: a) 14,5 − 7,5 = 7 b) 6 + 36 = 42 c) 54 − 3,5 + 1,5 = 52
