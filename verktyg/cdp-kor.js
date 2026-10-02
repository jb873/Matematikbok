/* cdp-kor.js — kör JS i en RIKTIG sida via Chrome DevTools Protocol (headless), utan temp-kopior.
   ─────────────────────────────────────────────────────────────────────────────────────────────
   Komplement till browser-verify.js: den bygger en temp-kopia med <base> (bra för probe-injektion),
   men sidor som beror på location.pathname / deeplink-boot (drill-ramen ak7-k1-ram.html, dk-resolution
   via filnamn) renderar inte där. Här öppnas ORIGINALFILEN och koden körs efteråt via CDP — inget skrivs
   någonsin i källträdet. Node ≥22 (inbyggd WebSocket), ingen npm.

   KÖR:
     node verktyg/cdp-kor.js <url> <js-fil> [--vanta-pa blad|laddad|generatorer|<uttryck>] [--vanta-tak ms]
                              [--wait ms] [--timeout ms] [--pre fil.js] [--screenshot ut.png] [--size WxH] [--viewport WxH]
     --vanta-pa ersätter --wait: väntan på ett VILLKOR i stället för på en klocka. Se noten vid VILLKOR_NAMN.
       <js-fil> = en JS-text som EVALUERAS i sidan; får vara ett async-uttryck / IIFE som returnerar ett
                  Promise. Resultatet (JSON) skrivs på stdout.
     Exempel:
       node verktyg/cdp-kor.js "file:///C:/…/ak7-k1-ram.html?ko=rot-berakna&formaga=rakna&embed=1" probe.js --wait 1500

   Noll nätväg (bara localhost-CDP). Rör aldrig källfiler. */
'use strict';
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http');

const args = process.argv.slice(2);
const url = args[0], jsFile = args[1];
if(!url || !jsFile){ console.error('användning: node verktyg/cdp-kor.js <url> <js-fil> [--wait ms] [--timeout ms]'); process.exit(2); }
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? parseInt(args[i + 1], 10) : d; };
const WAIT = opt('--wait', 1200), TIMEOUT = opt('--timeout', 60000);
/* --vanta-pa <namn|uttryck>: VÄNTA PÅ ETT VILLKOR i stället för på en klocka.
   En fast väntetid är en kapplöpning mot renderingen, och den förloras under last: samma svep
   gav 17 falska nollor i en körning och noll i nästa, med noll JS-fel och sidor som mätte grönt
   en i taget. Väntan sker i TVÅ faser:

     FAS A — dokumentet är laddat OCH DOM:en har slutat växa (två lika nodräkningar i rad).
             Det är anti-kapplöpningen: en halvbyggd sida mäts aldrig. Taket är --vanta-tak
             (20 s). Nås det har sidan aldrig blivit klar → eget besked, exit 1.
     FAS B — finns mätpunkterna? Nådatid --vanta-nad (2,5 s) efter att sidan blivit stabil.
             Hittas de inte körs proben ÄNDÅ, med besked på stderr. Svepet mäter då noll, och
             V14 avgör om just den sidan borde ha haft mätpunkter.

   Domen om "borde ha mätpunkter" hör hos grinden, inte hos köraren: köraren vet inte vilka
   sidor som ska ha blad. Första försöket lät taket avbryta körningen, och då försvann karta,
   kunskapsläge och nians drillsidor ur svepet — 22 sidor som helt riktigt saknar bladmarkörer
   och vars DOM är stabil på 143 noder. */
const VILLKOR_NAMN = {
  // En bladsida är mätbar när svarsrutor, valrutnät ELLER bladnavigering finns. Navigeringen
  // räknas med därför att proberna själva klickar fram bladen (plugg-sidorna renderar inget
  // före ett dokumentval).
  blad: "document.querySelector('input.ovn-in, input.ak8-in, input.seg-text, .ovn-val-grid, .blad-nav-btn, .blad-subnav-btn, .plugg-dok')",
  // Sidor som mäts i sin helhet (CSS, bredd, tonade kort) — klara när dokumentet är laddat.
  laddad: "document.readyState === 'complete'",
  // Provbyggar-ramarna: generatorerna är fångade när --pre-fällan satt window.__GENS.
  generatorer: "window.__GENS && Object.keys(window.__GENS).length"
};
const vantaI = args.indexOf('--vanta-pa');
const VANTA = vantaI >= 0 ? args[vantaI + 1] : null;
const VANTA_TAK = opt('--vanta-tak', 20000);   // FAS A: tak för "laddad och stabil"
const VANTA_NAD = opt('--vanta-nad', 2500);    // FAS B: nådatid för att mätpunkterna ska dyka upp
// --pre <js-fil>: körs i sidan FÖRE dess egna skript (Page.addScriptToEvaluateOnNewDocument) — t.ex. för att
// fånga IIFE-lokala objekt genom att wrappa en global fabrik (window.__PB via ProvbyggarMotor.montera).
const preI = args.indexOf('--pre'), PRE = preI >= 0 ? fs.readFileSync(path.resolve(args[preI + 1]), 'utf8') : null;
// --screenshot <png>: skärmdump av RIKTIGA sidan EFTER att js-filen körts (synlighet i beviset — sett, inte bara DOM).
// --size WxH: fönsterstorlek (default 900x1200).
const shotI = args.indexOf('--screenshot'), SHOT = shotI >= 0 ? path.resolve(args[shotI + 1]) : null;
const sizeI = args.indexOf('--size'), SIZE = sizeI >= 0 ? args[sizeI + 1].split('x').map(Number) : [900, 1200];
// --viewport WxH: sidans VYPORT när proben körs. --size styr bara fönstret och skärmdumpen, så
// en mätning av telefonbredd krävde det här: window.innerWidth var 500 fast --size sa 360.
const vpI = args.indexOf('--viewport'), VIEWPORT = vpI >= 0 ? args[vpI + 1].split('x').map(Number) : null;
// --console: sidans console.log strömmas (Runtime.consoleAPICalled) till stderr som `console: …` — de sista raderna före
// en tidsgräns pekar ut var sidan hängde (testgen-fuzz loggar generatorns namn före varje anrop).
const KONSOL = args.includes('--console');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9222 + Math.floor(Math.random() * 500);
const expr = fs.readFileSync(path.resolve(jsFile), 'utf8');

const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-kor-'));
// STÄDNING (viktigt): dödas node utifrån (spawnSync-timeout → TerminateProcess på Windows) körs inga handlers,
// och Chrome-barnet överlever som zombie som håller port/resurser → nästa körning hänger (kaskad). Därför:
// (1) egen VAKTHUND som alltid hinner städa före yttre timeout, (2) TRÄD-kill (taskkill /T) så renderer/gpu dör med.
/* Städningen dödar TVÅ vägar, och den andra är inte överflödig.
   Träd-killen (/T på vår egen pid) biter bara om startprocessen fortfarande är förälder. Chrome
   låter ibland startprocessen avsluta sig och lämnar webbläsarträdet föräldralöst — då dödar /T
   ingenting, och en hel instans (~10 processer) står kvar. Mätt 2026-10-02 från rent läge:
   körning 1 och 2 lämnade noll processer, körning 3 lämnade tio. Intermittent, alltså, och över
   ett tiokörningsbevis (560 starter) blev det 197 kvarglömda processer som ströp maskinen — och
   DET var vad som gjorde den fasta väntetiden till en förlorad kapplöpning.
   Andra vägen matchar på profilmappens namn, som är unikt per körning (mkdtemp). Den kan
   därför aldrig råka döda Joachims egen Chrome. */
function dodaChrome(){
  try {
    if(process.platform !== 'win32'){ chrome.kill('SIGKILL'); return; }
    spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
    const profNamn = path.basename(prof);
    spawnSync('powershell', ['-NoProfile', '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | " +
      "Where-Object { $_.CommandLine -like '*" + profNamn + "*' } | " +
      "ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch {} }"],
      { stdio: 'ignore', timeout: 15000 });
  } catch(e){}
}
const DEADLINE = (VANTA ? VANTA_TAK + VANTA_NAD : WAIT) + TIMEOUT + 15000;
const vakthund = setTimeout(() => { console.error('cdp-kor: vakthund — deadline ' + DEADLINE + ' ms passerad, städar Chrome'); dodaChrome(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch(e){} process.exit(1); }, DEADLINE);
vakthund.unref && vakthund.unref();
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--no-first-run',
  '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--window-size=' + SIZE[0] + ',' + SIZE[1], '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

function getJson(p, method){ return new Promise((res, rej) => { const rq = http.request({ host: '127.0.0.1', port: PORT, path: p, method: method || 'GET' }, r => { let s = ''; r.on('data', d => s += d); r.on('end', () => { try { res(JSON.parse(s)); } catch(e){ rej(e); } }); }); rq.on('error', rej); rq.end(); }); }
async function waitPort(){ for(let i = 0; i < 200; i++){ try { return await getJson('/json/version'); } catch(e){ await new Promise(r => setTimeout(r, 100)); } } throw new Error('Chrome svarade inte på CDP-porten'); }

(async () => {
  let code = 0;
  try {
    await waitPort();
    // Nyare Chrome kräver PUT för /json/new; annars: första target av typen 'page' (ALDRIG extension-sidor).
    const target = await getJson('/json/new?about:blank', 'PUT').catch(() => null)
      || (await getJson('/json')).find(t => t.type === 'page');
    if(!target) throw new Error('hittar ingen sid-target');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; setTimeout(() => rej(new Error('WebSocket-anslutning tidsgränsad')), 30000); });
    let id = 0; const pending = {};
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if(m.id && pending[m.id]){ pending[m.id](m); delete pending[m.id]; }
      else if(KONSOL && m.method === 'Runtime.consoleAPICalled'){ try { console.error('console: ' + (m.params.args || []).map(a => a.value !== undefined ? a.value : a.description).join(' ')); } catch(e){} } };
    // Varje CDP-steg har egen tidsgräns (30 s; Runtime.evaluate: TIMEOUT+5 s) → en hängd handskakning blir ett
    // namngivet fel i st f en tyst hängning (grinden kan då göra om körningen).
    const send = (method, params) => new Promise((res, rej) => { const i = ++id; const ms = method === 'Runtime.evaluate' ? TIMEOUT + 5000 : 30000;
      const tm = setTimeout(() => { delete pending[i]; rej(new Error('CDP-steg tidsgränsat (' + method + ', ' + ms + ' ms)')); }, ms);
      pending[i] = m => { clearTimeout(tm); res(m); }; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    await send('Page.enable'); await send('Runtime.enable');
    if(PRE) await send('Page.addScriptToEvaluateOnNewDocument', { source: PRE });
    if(VIEWPORT) await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT[0], height: VIEWPORT[1], deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url });

    if(VANTA){
      const uttryck = VILLKOR_NAMN[VANTA] || VANTA;
      // send() ger hela CDP-meddelandet: värdet ligger på message.result.result.value — samma
      // väg som proben läses på nedan. Ett steg för grunt och villkoret blir aldrig sant.
      const las = async (expr) => {
        const p = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
        return (p && p.result && p.result.result && p.result.result.value) || {};
      };
      const PROV_A = '(function(){ return { klar: document.readyState === "complete",'
                   + ' noder: document.getElementsByTagName("*").length }; })()';
      const PROV_B = '(function(){ try { return { ok: !!(' + uttryck + ') }; }'
                   + ' catch(e){ return { ok: false, fel: String(e.message || e) }; } })()';

      // FAS A — laddad och stabil. Det här är anti-kapplöpningen: en halvbyggd sida mäts aldrig.
      const tA = Date.now();
      let stabil = false, forra = -1;
      while(Date.now() - tA < VANTA_TAK){
        const v = await las(PROV_A);
        if(v.klar && v.noder === forra && v.noder > 0){ stabil = true; break; }
        forra = v.noder;
        await new Promise(r => setTimeout(r, 120));
      }
      if(!stabil){
        console.error('cdp-kor: sidan blev aldrig laddad och stabil inom ' + VANTA_TAK + ' ms · ' + url);
        clearTimeout(vakthund); dodaChrome();
        try { fs.rmSync(prof, { recursive: true, force: true }); } catch(e){}
        process.exit(1);
      }

      // FAS B — finns mätpunkterna? Hittas de inte körs proben ändå; svepet mäter noll och V14
      // avgör om sidan borde ha haft dem. Köraren vet inte vilka sidor som ska ha blad.
      const tB = Date.now();
      let funna = false, sistaFel = null;
      while(Date.now() - tB < VANTA_NAD){
        const v = await las(PROV_B);
        if(v.fel) sistaFel = v.fel;
        if(v.ok){ funna = true; break; }
        await new Promise(r => setTimeout(r, 120));
      }
      if(!funna){
        console.error('cdp-kor: inga mätpunkter för villkoret "' + VANTA + '" inom ' + VANTA_NAD
          + ' ms efter att sidan blivit stabil — kör proben ändå'
          + (sistaFel ? ' (fel i villkoret: ' + sistaFel + ')' : '') + ' · ' + url);
      }
    } else {
      await new Promise(r => setTimeout(r, WAIT));
    }
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: TIMEOUT });
    if(r.result && r.result.exceptionDetails){ console.error('FEL i sidan:', JSON.stringify(r.result.exceptionDetails.exception || r.result.exceptionDetails, null, 0).slice(0, 600)); code = 1; }
    else console.log(JSON.stringify(r.result && r.result.result ? r.result.result.value : null));
    if(SHOT){ if(!VIEWPORT) await send('Emulation.setDeviceMetricsOverride', { width: SIZE[0], height: SIZE[1], deviceScaleFactor: 1, mobile: false }); const sh = await send('Page.captureScreenshot', { format: 'png' }); if(sh.result && sh.result.data){ fs.writeFileSync(SHOT, Buffer.from(sh.result.data, 'base64')); console.error('skärmdump: ' + SHOT); } }
    ws.close();
  } catch(e){ console.error('cdp-kor:', e.message); code = 1; }
  finally { clearTimeout(vakthund); dodaChrome(); setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch(e){} process.exit(code); }, 300); }
})();
