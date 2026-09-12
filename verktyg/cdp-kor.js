/* cdp-kor.js — kör JS i en RIKTIG sida via Chrome DevTools Protocol (headless), utan temp-kopior.
   ─────────────────────────────────────────────────────────────────────────────────────────────
   Komplement till browser-verify.js: den bygger en temp-kopia med <base> (bra för probe-injektion),
   men sidor som beror på location.pathname / deeplink-boot (drill-ramen ak7-k1-ram.html, dk-resolution
   via filnamn) renderar inte där. Här öppnas ORIGINALFILEN och koden körs efteråt via CDP — inget skrivs
   någonsin i källträdet. Node ≥22 (inbyggd WebSocket), ingen npm.

   KÖR:
     node verktyg/cdp-kor.js <url> <js-fil> [--wait ms] [--timeout ms] [--pre fil.js]
       <js-fil> = en JS-text som EVALUERAS i sidan; får vara ett async-uttryck / IIFE som returnerar ett
                  Promise. Resultatet (JSON) skrivs på stdout.
     Exempel:
       node verktyg/cdp-kor.js "file:///C:/…/ak7-k1-ram.html?ko=rot-berakna&formaga=rakna&embed=1" probe.js --wait 1500

   Noll nätväg (bara localhost-CDP). Rör aldrig källfiler. */
'use strict';
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http');

const args = process.argv.slice(2);
const url = args[0], jsFile = args[1];
if(!url || !jsFile){ console.error('användning: node verktyg/cdp-kor.js <url> <js-fil> [--wait ms] [--timeout ms]'); process.exit(2); }
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? parseInt(args[i + 1], 10) : d; };
const WAIT = opt('--wait', 1200), TIMEOUT = opt('--timeout', 60000);
// --pre <js-fil>: körs i sidan FÖRE dess egna skript (Page.addScriptToEvaluateOnNewDocument) — t.ex. för att
// fånga IIFE-lokala objekt genom att wrappa en global fabrik (window.__PB via ProvbyggarMotor.montera).
const preI = args.indexOf('--pre'), PRE = preI >= 0 ? fs.readFileSync(path.resolve(args[preI + 1]), 'utf8') : null;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9222 + Math.floor(Math.random() * 500);
const expr = fs.readFileSync(path.resolve(jsFile), 'utf8');

const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-kor-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--no-first-run',
  '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, 'about:blank'], { stdio: 'ignore' });

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
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = {};
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if(m.id && pending[m.id]){ pending[m.id](m); delete pending[m.id]; } };
    const send = (method, params) => new Promise(res => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    await send('Page.enable'); await send('Runtime.enable');
    if(PRE) await send('Page.addScriptToEvaluateOnNewDocument', { source: PRE });
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, WAIT));
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: TIMEOUT });
    if(r.result && r.result.exceptionDetails){ console.error('FEL i sidan:', JSON.stringify(r.result.exceptionDetails.exception || r.result.exceptionDetails, null, 0).slice(0, 600)); code = 1; }
    else console.log(JSON.stringify(r.result && r.result.result ? r.result.result.value : null));
    ws.close();
  } catch(e){ console.error('cdp-kor:', e.message); code = 1; }
  finally { try { chrome.kill(); } catch(e){} setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch(e){} process.exit(code); }, 300); }
})();
