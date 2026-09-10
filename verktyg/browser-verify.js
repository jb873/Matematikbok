/* browser-verify.js — bygg en TEMPORÄR, isolerad kopia av en sida för headless-verifiering.
   ───────────────────────────────────────────────────────────────────────────────────────
   Temp-filen skrivs i OS:ets temp-katalog — ALDRIG i källträdet — så den kan aldrig skriva
   över eller ligga bland källfilerna. En injicerad <base href> pekar tillbaka på originalsidans
   mapp, så att relativa resurser (../../../js/…, ../../fonts/…) fortfarande löser. En valfri
   probe-fil injiceras före </body>.

   BAKGRUND: ett ad-hoc-verifieringsskript skrev temp-HTML bredvid källfilerna och gissade temp-
   namnet ur filändelsen (index.html → __v.html). För en sida som INTE hette index.html (potenser.html)
   blev "temp-namnet" = originalnamnet → skriptet skrev över och raderade sedan potenser.html.
   Den här helpern gör det omöjligt: inget skrivs någonsin i repo:t.

   KÖR:
     node verktyg/browser-verify.js <sida.html> [probe.js]
       → skriver ut en file://-URL till temp-kopian.
     Ladda den med headless Chrome och radera temp-filen efteråt, t.ex.:
       URL=$(node verktyg/browser-verify.js ak7/k2/d1-andel-antal/index.html /tmp/probe.js)
       chrome --headless=new --allow-file-access-from-files --virtual-time-budget=4000 --dump-dom "$URL"
       node -e 'require("fs").unlinkSync(process.argv[1])' "${URL#file:///}"
     OBS: cross-dir file:// kräver Chrome-flaggan --allow-file-access-from-files (temp-filen ligger
     i en annan katalog än resurserna den <base>:ar mot).

   Noll nätväg. Rör aldrig källfiler. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');

function fileUrl(p) { return 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20'); }

function build(srcPath, probePath) {
  const abs = path.resolve(srcPath);
  if (!fs.existsSync(abs)) throw new Error('sidan finns inte: ' + abs);
  let html = fs.readFileSync(abs, 'utf8');

  // <base href> → originalsidans mapp, så relativa sökvägar löser trots att temp-filen ligger i OS-temp.
  const baseTag = '<base href="' + fileUrl(path.dirname(abs)) + '/">';
  if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, m => m + '\n' + baseTag);
  else html = baseTag + '\n' + html;   // ingen <head> → först i dokumentet

  if (probePath) {
    const probe = fs.readFileSync(path.resolve(probePath), 'utf8');
    const tag = '<script>\n' + probe + '\n</script>';
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, tag + '\n</body>') : html + tag;
  }

  // Unikt temp-namn i OS-temp — kan aldrig kollidera med eller ligga bland källfilerna.
  const tmp = path.join(os.tmpdir(), 'bverify-' + process.pid + '-' + crypto.randomBytes(5).toString('hex') + '.html');
  fs.writeFileSync(tmp, html);
  return tmp;
}

if (require.main === module) {
  const src = process.argv[2];
  if (!src) { console.error('användning: node verktyg/browser-verify.js <sida.html> [probe.js]'); process.exit(2); }
  try { console.log(fileUrl(build(src, process.argv[3]))); }
  catch (e) { console.error(e.message); process.exit(2); }
}

module.exports = { build, fileUrl };
