// elevfeedback.js — floating "TIPSA"-knapp + modal för elevtips via Gmail-compose.
// PORTAD BYTE-TROGET från Historia-/Geografiboken (jb873.github.io/Historiabok/js/elevfeedback.js):
// samma beteende, placering (flytande nere till höger) och rapport-väg. Eleven väljer kategori +
// skriver kommentar; JS bygger en Gmail-compose-URL med sidtitel, URL och tidpunkt och öppnar
// Gmails skrivruta i ny flik — eleven klickar själv "Skicka". Ingen server, ingen fetch, ingen
// tredjepart, ingen persondata utöver elevens text (samma dataväg som de andra böckerna).
// Enda anpassningen för matteboken: CSS injiceras här (self-contained, ett script per sida) och
// använder mattebokens design-tokens (--gold/--paper/--ink…) med fallback, så knappen känns som
// samma läromedel. Logiken/Gmail-vägen är oförändrad.

(function () {
  'use strict';

  var MOTTAGAR_MAIL = 'jb@alphaskolan.se';

  function nyEl(tagg, klass) {
    var e = document.createElement(tagg);
    if (klass) { e.className = klass; }
    return e;
  }

  // ── CSS (self-contained; injiceras en gång). Struktur = böckernas; tokens = mattebokens. ──
  function injiceraStil() {
    if (document.getElementById('elevfeedback-stil')) { return; }
    var css = [
      '.feedback-knapp{position:fixed;bottom:20px;right:20px;z-index:990;padding:12px 20px;',
      'background:linear-gradient(135deg,var(--gold,#8a5e1e),var(--gold-lt,#b8893a));color:#fff;',
      "border:none;border-radius:28px;font-family:var(--cinzel,'Cinzel',serif);font-size:14px;",
      'letter-spacing:.05em;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.25);transition:all .2s;',
      'display:flex;align-items:center;gap:8px;}',
      '.feedback-knapp:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.35);}',
      '.feedback-knapp .ikon{font-size:18px;}',
      '.feedback-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;',
      'background:rgba(27,20,13,.6);z-index:1300;align-items:center;justify-content:center;}',
      '.feedback-overlay.aktiv{display:flex;}',
      '.feedback-modal{background:var(--paper-lt,var(--paper,#f1e8d4));max-width:500px;width:90%;',
      'padding:24px;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.3);border:1px solid var(--paper-dk,#d8c9aa);}',
      ".feedback-modal h2{font-family:var(--cinzel,'Cinzel',serif);font-size:22px;color:var(--ink,#1c140d);",
      'margin:0 0 16px;display:flex;justify-content:space-between;align-items:center;}',
      '.feedback-modal .stang{background:none;border:none;font-size:20px;cursor:pointer;color:var(--ink,#1c140d);padding:4px 8px;}',
      '.feedback-modal label.kategori{display:block;font-size:14px;color:var(--ink,#1c140d);margin:8px 0;cursor:pointer;}',
      '.feedback-modal label.kategori input{margin-right:8px;}',
      '.feedback-modal textarea{width:100%;min-height:100px;padding:8px;border:1px solid var(--paper-dk,#d8c9aa);',
      "border-radius:4px;font-family:var(--serif,'Cormorant Garamond',serif);font-size:15px;",
      'background:#fff;resize:vertical;box-sizing:border-box;}',
      '.feedback-modal .sida-info{font-size:12px;color:var(--ink-faint,#8a7860);margin-top:12px;font-style:italic;}',
      '.feedback-modal .knappar{display:flex;gap:12px;margin-top:16px;justify-content:flex-end;}',
      ".feedback-modal .skicka{background:var(--gold,#8a5e1e);color:#fff;border:none;padding:10px 24px;",
      "border-radius:4px;font-family:var(--cinzel,'Cinzel',serif);letter-spacing:.05em;cursor:pointer;}",
      '.feedback-modal .avbryt{background:transparent;border:1px solid var(--paper-dk,#d8c9aa);color:var(--ink-faint,#8a7860);',
      'padding:10px 20px;border-radius:4px;cursor:pointer;font-family:var(--serif,serif);}',
      '@media print{.feedback-knapp,.feedback-overlay{display:none !important;}}'
    ].join('');
    var stil = document.createElement('style');
    stil.id = 'elevfeedback-stil';
    stil.textContent = css;
    document.head.appendChild(stil);
  }

  function skapaKnapp() {
    var knapp = nyEl('button', 'feedback-knapp');
    knapp.type = 'button';
    knapp.setAttribute('aria-label', 'Tipsa oss om förbättringar');
    knapp.innerHTML = '<span class="ikon" aria-hidden="true">💬</span><span>TIPSA</span>';
    knapp.addEventListener('click', oppnaModal);
    document.body.appendChild(knapp);
  }

  function skapaModal() {
    var overlay = nyEl('div', 'feedback-overlay');
    overlay.id = 'feedback-overlay';

    var modal = nyEl('div', 'feedback-modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = [
      '<h2>Tipsa oss om förbättringar <button type="button" class="stang" aria-label="Stäng">✕</button></h2>',
      '<p style="font-size:14px;color:var(--ink-faint,#8a7860);">Vad gäller det?</p>',
      '<label class="kategori"><input type="radio" name="kategori" value="Det är fel"> Det är fel</label>',
      '<label class="kategori"><input type="radio" name="kategori" value="Förbättringsförslag" checked> Förbättringsförslag</label>',
      '<label class="kategori"><input type="radio" name="kategori" value="Ny idé"> Ny idé</label>',
      '<label class="kategori"><input type="radio" name="kategori" value="Annat"> Annat</label>',
      '<p style="font-size:14px;color:var(--ink-faint,#8a7860);margin-top:12px;">Berätta mer:</p>',
      '<textarea id="feedback-kommentar" placeholder="Skriv här..."></textarea>',
      '<p class="sida-info" id="feedback-sida-info"></p>',
      '<div class="knappar">',
      '<button type="button" class="avbryt">Avbryt</button>',
      '<button type="button" class="skicka">SKICKA TIPS</button>',
      '</div>'
    ].join('');

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector('.stang').addEventListener('click', stangModal);
    modal.querySelector('.avbryt').addEventListener('click', stangModal);
    modal.querySelector('.skicka').addEventListener('click', skickaTips);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { stangModal(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { stangModal(); }
    });
  }

  function oppnaModal() {
    var overlay = document.getElementById('feedback-overlay');
    overlay.classList.add('aktiv');
    var sidtitel = document.title || 'Okänd sida';
    document.getElementById('feedback-sida-info').textContent = 'Sidan: ' + sidtitel;
  }

  function stangModal() {
    var overlay = document.getElementById('feedback-overlay');
    if (overlay) { overlay.classList.remove('aktiv'); }
  }

  function skickaTips() {
    var kategoriEl = document.querySelector('input[name="kategori"]:checked');
    var kategori = kategoriEl ? kategoriEl.value : 'Ej angiven';
    var kommentar = document.getElementById('feedback-kommentar').value;

    if (!kommentar.trim()) {
      alert('Skriv en kommentar innan du skickar.');
      return;
    }

    var sidtitel = document.title || 'Okänd sida';
    var url = window.location.href;
    var tid = new Date().toISOString().slice(0, 16).replace('T', ' ');

    var subject = 'Elevtips — ' + kategori + ' — ' + sidtitel;
    var body = [
      'Kategori: ' + kategori,
      '',
      'Kommentar:',
      kommentar,
      '',
      'Sidan: ' + sidtitel,
      'URL: ' + url,
      'Tid: ' + tid
    ].join('\n');

    // Gmail-compose-URL: öppnar Gmails skrivruta direkt i webbläsaren för inloggade
    // elever (Gmail-skola). Eleven klickar själv "Skicka". Samma väg som Historia/Geografi.
    var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1' +
      '&to=' + encodeURIComponent(MOTTAGAR_MAIL) +
      '&su=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    window.open(gmailUrl, '_blank', 'noopener');
    setTimeout(stangModal, 500);
  }

  function start() {
    injiceraStil();
    skapaKnapp();
    skapaModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
