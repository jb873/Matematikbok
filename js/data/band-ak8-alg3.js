/* band-ak8-alg3.js — TALOMRÅDET FÖR ÅTTANS "UTTRYCK MED MINUS ELLER PLUS FRAMFÖR PARENTES"
   (åk8 kapitel 2, delkapitel 3). Order 2026-10-04.

   Skrivet UR Joachims tre källdokument, inte uppfunnet:
     Parentes nivå 1.docx   md5 56f8f7e32b4a03f83f0d64f2ed58a76d   14 uppgifter
     Parentes Nivå 2.docx   md5 a115a4acfee122f841b221764ab17a0d   10 uppgifter
     Parentes nivå 3.docx   md5 7aabd7a60d132b803ecfca078a6289e7    8 uppgifter

   TRE NIVÅER, en per dokument. Nivån säger vilka VARIANTER bladet bygger av och hur stora talen
   får vara. Formen är band-ak8-alg1.js:s — samma fält, samma princip: generatorn LÄSER villkoren
   här, den bär dem inte.

   DEN BÄRANDE REGELN i det här delkapitlet är TECKENBYTET. Står ett minustecken framför en
   parentes byter alla termer inuti tecken; står det plus behålls de. Därför får ett talbyte
   aldrig ta bort minustecknet framför en parentes — då försvinner själva uppgiften. Det står som
   behallEgenskap: 'minus framför parentes' på de varianter där minuset ÄR poängen.

   NIVÅSTEGRINGEN, läst ur dokumenten:
     1  en parentes, plus eller minus framför, positiva tal inuti
     2  negativa tal inuti parentesen (11x − (−5 − 9x)), tre parenteser i rad, decimaler, bråk
     3  flera variabler i samma uttryck, staplat bråk som helhet, "summan av två uttryck",
        talpyramid, sammansatt figur

   MELLANLED KRÄVS överallt där det står minus framför en parentes (Joachims regel 2026-10-04).
   Det är inte ett bandvillkor utan en uppgiftsegenskap, men bandet får inte generera ett tal som
   gör mellanledet meningslöst — därför minTermer på varianterna. */
(function(){
'use strict';

var BAND = {

  // ── NIVÅ 1 — en parentes, positiva tal inuti ──────────────────────────────────────────────
  // Dokumentets uppgifter 1, 2, 6, 9, 11, 14 är rena förenklingar; 3, 5, 7, 8, 10 är figur- och
  // valuppgifter; 12 och 13 är problem. Talen nedan spänner det dokumentet använder.
  forenkla: {
    nivaer: {
      1: { varianter: ['plusParentes', 'minusParentes', 'tvaParenteser'],
           koeff: [2, 15], konstant: [3, 12], minTermer: 3,
           behallEgenskap: 'minus framför parentes' },
      2: { varianter: ['minusNegativInuti', 'treParenteser', 'decimal', 'brakKoefficient'],
           koeff: [2, 13], konstant: [2, 11], decimal: [0.1, 0.9], namnare: [3, 8], minTermer: 4,
           behallEgenskap: 'minus framför parentes' },
      3: { varianter: ['flervariabel', 'stapladBrak', 'decimalFlera'],
           koeff: [1, 9], konstant: [3, 23], decimal: [0.04, 5.9], namnare: [2, 8], minTermer: 4,
           behallEgenskap: 'minus framför parentes' }
    }
  },

  // ── VÄRDE INSATT — förenkla först, sätt in sedan ──────────────────────────────────────────
  // Nivå 1 uppgift 6 (x = 3) och 14 (x = 7); nivå 3 uppgift 2 (x = 4, y = −2).
  varde: {
    nivaer: {
      1: { varianter: ['enVariabel'],            insatt: [2, 9] },
      3: { varianter: ['tvaVariabler', 'negativtVarde'], insatt: [-5, 6] }
    }
  },

  // ── SAKNAT TAL — vad fattas för att likheten ska gälla ────────────────────────────────────
  // Nivå 1 uppgift 11. Luckan ligger INUTI parentesen, så teckenbytet är det som avgör svaret.
  saknatTal: {
    nivaer: {
      1: { varianter: ['luckaIParentes'], koeff: [1, 4], konstant: [2, 12] }
    }
  },

  // ── OMKRETS — uttryck ur figur, parentes när delar dras bort ──────────────────────────────
  // Nivå 1 uppgift 3, 5, 7, 8 · nivå 2 uppgift 10 · nivå 3 uppgift 3, 8.
  omkrets: {
    nivaer: {
      1: { varianter: ['rektangel', 'triangel', 'flervalOmkrets', 'sidaSomSaknas'],
           koeff: [1, 6], konstant: [2, 12] },
      2: { varianter: ['tvaFigurerSkillnad'],  koeff: [1, 5], konstant: [1, 10] },
      3: { varianter: ['sammansattFigur', 'tvaRektanglarSkillnad'],
           koeff: [1, 4], konstant: [2, 12] }
    }
  },

  // ── VÄLJA OCH PARA IHOP — förståelseträning, inget räknande ───────────────────────────────
  // Nivå 1 uppgift 4 (vilket uttryck stämmer) och 10 (para ihop). Distraktorerna ska skilja sig
  // på TECKNET, inte på talen — annars går uppgiften att lösa utan att förstå parentesregeln.
  valj: {
    nivaer: {
      1: { varianter: ['vilketStammer', 'paraIhop'], koeff: [2, 9], konstant: [2, 7],
           distraktorRegel: 'skilj på tecken, inte på tal' }
    }
  },

  // ── ÖPPEN UPPGIFT MOT VILLKOR — eleven väljer tal, villkoret rättas ───────────────────────
  // Nivå 2 uppgift 4: "omkretsen är 8x + 14 — ge exempel på hur långa sidorna kan vara."
  oppet: {
    nivaer: {
      2: { varianter: ['likbentTriangel'], koeff: [4, 12], konstant: [6, 20] }
    }
  },

  // ── TALPYRAMID — varje ruta är summan av de två den står på ───────────────────────────────
  // Nivå 3 uppgift 6. Två former: alla tre nedre givna (räkna uppåt), eller en lucka nedtill
  // (räkna baklänges — det är där parentesen och teckenbytet dyker upp).
  pyramid: {
    nivaer: {
      3: { varianter: ['uppat', 'baklanges'], koeff: [1, 5], konstant: [1, 6], rader: 3 }
    }
  },

  // ── SUMMAN AV TVÅ UTTRYCK — uppställning med parentes, sedan mellanled ────────────────────
  // Nivå 3 uppgift 5 och 7. Eleven skriver (summan) − (det ena uttrycket) och förenklar.
  summan: {
    nivaer: {
      3: { varianter: ['heltal', 'brak'], koeff: [1, 8], konstant: [3, 18], namnare: [2, 8] }
    }
  },

  // ── PROBLEM — text till uttryck, parentes när något dras bort ─────────────────────────────
  // Nivå 1 uppgift 12 (Sven/Anna/Harald) och 13 (Vilgot) · nivå 2 uppgift 6 (Linus) och 7 (pris
  // per kilo). Priser och antal ska vara rimliga: en banan för 6 kr, inte för 60.
  problem: {
    nivaer: {
      1: { varianter: ['flerPersoner', 'kontoKvar'], pris: [4, 60], konto: [100, 900] },
      2: { varianter: ['gerBort', 'prisPerKilo'],    pris: [8, 40],  antal: [1, 9] }
    }
  },

  // ── Regler som gäller alla flikar ─────────────────────────────────────────────────────────
  regler: {
    // Minustecknet framför parentesen är uppgiften. Ett byte som gör alla parenteser till
    // plus-parenteser förkastas.
    minstEnMinusParentes: true,
    // Facit får inte bli noll-uttryck om uppgiften handlar om att samla termer — utom där
    // dokumentet HAR ett sådant svar med flit (nivå 2 uppgift 2d ger −7b, alltså x-termerna tar ut
    // varandra, och det är poängen).
    tillatNollTerm: true,
    // Decimaler skrivs med komma. Bråk renderas staplat, aldrig "a/b" på en rad.
    decimaltecken: ',',
    brakStaplat: true
  }
};

window.BAND_AK8_ALG3 = BAND;
})();
