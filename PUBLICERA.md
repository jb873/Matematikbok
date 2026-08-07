# PUBLICERA — steg för steg

En checklista för att publicera läromedlet så att elever kan öppna det i webbläsaren. Skriven att följas utan att kunna repot utantill. Läs uppifrån och ner första gången.

> **Kort sagt:** allt är statiska filer (HTML/CSS/JS + självhostade fonter). Det finns ingen server, ingen databas, inga inloggningar. All elevdata (kartfärger, självskattning) bor i elevens egen webbläsare (localStorage) och lämnar aldrig datorn. Att "publicera" = lägga filerna på en webbadress. Enklaste vägen är **GitHub Pages** (gratis).

---

## 0. NULÄGE (läs detta först)

Kontrollera i en terminal, stående i projektmappen (`c:\Arkiv - webbbok\Matematik`):

```
git remote -v
git branch --show-current
```

Per 2026-08: **ingen remote är inställd**, och branchen heter **`master`**. Det betyder att repot ännu **inte** är kopplat till GitHub, och **GitHub Pages är inte aktivt**. Det finns ingen publik URL än. Avsnitt 1 sätter upp det (görs **en gång**). Avsnitt 2 är den återkommande publiceringen.

Startsidan är `index.html` (titel "Matematik · Grundskola"). Den länkar vidare till `ak7.html` (Årskurs 7) → kapitlen.

---

## 1. ENGÅNGS-UPPSÄTTNING (görs en gång)

1. **Skapa ett GitHub-konto** om du inte har ett: <https://github.com/join>.
2. **Skapa ett nytt, tomt repository** på GitHub: <https://github.com/new>. Välj ett namn, t.ex. `matematik`. Lämna det **tomt** (ingen README, ingen .gitignore). Notera ägarnamnet (ditt användarnamn) och repo-namnet — de bildar adressen.
3. **Koppla din lokala mapp till GitHub-repot.** I terminalen i projektmappen (byt ut `DITT-NAMN` och `matematik`):
   ```
   git remote add origin https://github.com/DITT-NAMN/matematik.git
   git push -u origin master
   ```
   (Första push:en frågar om inloggning — följ webbläsar-dialogen.)
4. **Aktivera GitHub Pages:** gå till repot på github.com → **Settings** → **Pages** (vänstermenyn). Under "Build and deployment" / "Source" välj **Deploy from a branch**. Välj branch **`master`** och mapp **`/ (root)`**. Klicka **Save**.
5. **Vänta 1–3 minuter.** Pages bygger. När det är klart står den publika adressen högst upp på samma Pages-sida, typiskt:
   ```
   https://DITT-NAMN.github.io/matematik/
   ```
   Elevens startsida blir den adressen + `index.html` (oftast räcker adressen ovan).

> Om Pages-menyn vill ha branch `main` i stället för `master`: byt namn på branchen en gång med `git branch -m master main` och `git push -u origin main`, och välj `main` i Pages. Antingen fungerar.

---

## 2. PUBLICERA EN ÄNDRING (återkommande)

När du (eller en order) gjort ändringar och de är **committade**:

1. Kontrollera att allt är committat:
   ```
   git status
   ```
   Ska visa "nothing to commit, working tree clean". Om inte — committa först (`git add -A` sedan `git commit -m "beskrivning"`).
2. **Skicka upp:**
   ```
   git push
   ```
3. **Se att bygget gick igenom:** på github.com, fliken **Actions** (eller Settings → Pages) visar en grön bock när Pages byggt om. Tar oftast **1–3 minuter**.
4. **Ladda om** den publika adressen i webbläsaren (Ctrl+F5 för att undvika cache). Ändringen ska synas.

---

## 3. VAD ELEVEN SER EFTER PUBLICERING

Startsida → **Årskurs 7** är öppen. Åk 8 och Åk 9 finns men är delvis under uppbyggnad (märkta). Inom Åk 7:

| Kapitel | Öppna delkapitel | Märkta "kommer senare" (synliga, ej klickbara) |
|---|---|---|
| **K1 Taluppfattning** | Del 1–8, Del 10 (Plugg) | Del 9 Fördjupning |
| **K2 Bråk** | Del 1–7, Del 9 (Plugg/Var står jag) | Del 8 Problemlösning |
| **K3 Algebra** | Del 1 Uttryck, Del 4 Ekvationer, Del 7 Plugg | Del 2 Mönster · Del 3 Förenkla · Del 5 Problemlösning · Del 6 Fördjupning |

**Allt obyggt är synligt, ärligt märkt och DÖTT** — inga klickbara länkar leder till tomma sidor:
- På **landningssidorna** har obyggda delkapitel en "Kommer senare"-markering och går inte att klicka.
- På **kartan** (Var står jag?) syns obyggda områden (K3 Mönster/Problemlösning/Fördjupning) med **streckad ram + "kommer"-chip**, tydligt skilda från den grå "annan årskurs / bortvalt"-färgen. De är döda (ej klickbara). De drar aldrig ner en förälders färg eller completion-procenten.
- I **provbyggaren** är färdigheter utan test-generator märkta "byggs" och går inte att välja.

**Del 3 Algebra – en nyans:** delkapitel-*sidan* är inte byggd (märkt "kommer" på landningssidan), men förenkla-*drillen* är live och nås via "Öva mer". Kartan visar förenkla-noden som färgbar och klickbar. Det är avsiktligt.

---

## 4. REACHABILITY (döda länkar)

Senaste kontrollen: **488 lokala länkar över 58 HTML-sidor, 0 döda länkar** på den publika ytan. (En träff finns i utvecklings-verktyget `js/motor/ovamer/k3-mastery-vakt.html`, som använder en absolut `file:///`-sökväg — det är ett testverktyg, inte en publik sida, och ska inte länkas från något eleven ser.)

**Kör om kontrollen** innan en större publicering (i projektmappen):
```
node -e 'const fs=require("fs"),p=require("path");function w(d,a){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(["Arkiv",".git","node_modules"].includes(e.name))continue;const q=p.join(d,e.name);e.isDirectory()?w(q,a):e.name.endsWith(".html")&&a.push(q);}return a;}let dead=[];for(const f of w(".",[])){const h=fs.readFileSync(f,"utf8");let m;const re=/(?:href|src)\s*=\s*["\x27]([^"\x27]+)["\x27]/g;while((m=re.exec(h))){let u=m[1].trim();if(/^(https?:|mailto:|#|data:|javascript:|tel:)/i.test(u)||!u)continue;let c=u.split("#")[0].split("?")[0];if(!c)continue;let t=p.normalize(p.join(p.dirname(f),decodeURIComponent(c)));if(!fs.existsSync(t))dead.push(f+" -> "+u);}}console.log("Döda länkar:",dead.length);dead.forEach(d=>console.log("  "+d));'
```
Förväntat: `Döda länkar: 0` (bortsett från vakt-filens file:///-rad).

---

## 5. ROLLBACK (om en publicering ser fel ut)

Publicering är ofarlig att backa — filerna är statiska och versionshanterade.

1. **Hitta commiten före den du vill ångra:**
   ```
   git log --oneline -10
   ```
2. **Backa den senaste publiceringen** (skapar en NY commit som upphäver den — säkrast, skriver inte om historik):
   ```
   git revert HEAD
   git push
   ```
   För flera commits: `git revert HEAD~2..HEAD` (backar de tre senaste).
3. Vänta 1–3 min på Pages-bygget, ladda om (Ctrl+F5).

**Vad händer med elevernas svar?** Ingenting. Kartfärger och självskattning bor i **elevens webbläsare (localStorage)** på elevens dator. En revert ändrar bara filerna på webbadressen — den rör **inte** elevens localStorage. Elever behåller sin progress oavsett hur du publicerar eller backar.

---

## 6. SISTA KONTROLLEN FÖRE PUSH (snabb checklista)

- [ ] **Rök-vakten grön:** öppna `js/motor/ovamer/k3-mastery-vakt.html` i webbläsaren (eller headless) → `RESULTAT: ✅ ALLA 5 PASS`. Bekräftar att drill-loggningen är intakt.
- [ ] **0 externa fontanrop:** `grep -rn "fonts.googleapis\|fonts.gstatic" --include=*.html --include=*.css . | grep -v Arkiv` → tomt. (Fonterna är självhostade i `fonts/`.)
- [ ] **0 döda länkar:** kör reachability-scriptet i avsnitt 4 → `Döda länkar: 0`.
- [ ] **0 JS-fel på landningssidorna:** öppna `index.html`, `ak7.html`, `ak7-k1.html`, `ak7-k2.html`, `ak7-k3.html` i webbläsaren, tryck F12 → Console → inga röda fel.
- [ ] **`git status` rent** (allt committat).

När alla fem är bockade: `git push`.
