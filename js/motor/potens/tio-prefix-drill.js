/* tio-prefix-drill.js — Färdighetsträning för SI-prefix (nod tio-rakna:prefix).
   NY additiv fil — rör INTE potens-drill.js (potens-motorn) eller ramens övriga
   drillar. Laddas av ak7-k1-ram.html EFTER potens-drill.js → återanvänder ramens
   globala flerval-hjälpare (exerciseHeader, renderSummaryCard, getTutorScore,
   shuffle) precis som renderAddBegrepp. Facit = provbyggarens prefix-generator
   (ak8-k1-ram.html: gt-tio-prefix): kilo 10³ · mega 10⁶ · giga 10⁹ · tera 10¹².
   Korval (flerval), samma riktning som provbyggaren: 10ⁿ → prefix. */
(function(){
  'use strict';
  var PREFIX = [['kilo', 3], ['mega', 6], ['giga', 9], ['tera', 12]];

  // Ren generator (facit ur uppgiften; exponeras för fuzz). Speglar provbyggarens gt-tio-prefix.
  function genPrefix(){
    var t = PREFIX[Math.floor(Math.random() * PREFIX.length)];
    return { namn: t[0], exp: t[1], options: PREFIX.map(function(p){ return p[0]; }), svar: t[0] };
  }
  if(typeof window !== 'undefined') window.genTioPrefix = genPrefix;
  if(typeof module !== 'undefined' && module.exports){ module.exports = { genPrefix: genPrefix, PREFIX: PREFIX }; }

  if(typeof window === 'undefined') return;

  // ── Flerval-drill (körs i ramen; loggar till tio-rakna/prefix → karta drill-evidens) ──
  window.renderTioPrefix = function(body){
    var omgang = [], idx = 0, resultat = [];

    function genOmgang(){
      // En omgång = de fyra prefixen i slumpad ordning (heltäckande, ingen upprepning).
      return (typeof shuffle === 'function' ? shuffle(PREFIX.slice()) : PREFIX.slice());
    }

    function render(){
      if(idx >= omgang.length){
        var right = resultat.filter(function(x){ return x; }).length, total = resultat.length;
        body.innerHTML = '<div class="exercise-card">'
          + exerciseHeader('SI-prefix · tiopotens', 'Du klarade ' + right + ' av ' + total + '.')
          + renderSummaryCard({right: right, total: total, nextLabel: 'Nytt övningsblad'})
          + '</div>';
        document.getElementById('summary-next-btn').onclick = function(){
          omgang = genOmgang(); idx = 0; resultat = []; render();
        };
        return;
      }
      var k = omgang[idx];                 // [namn, exp]
      var svar = k[0], exp = k[1];
      var optBtns = shuffle(PREFIX.map(function(p){ return p[0]; })).map(function(opt){
        return '<button class="fc-btn" data-val="' + opt + '">' + opt + '</button>';
      }).join('');
      body.innerHTML = '<div class="exercise-card">'
        + exerciseHeader('SI-prefix · tiopotens', 'Vilket SI-prefix motsvarar tiopotensen?')
        + '<div class="flashcard">'
          + '<div class="flashcard-prompt" style="font-size:20px;margin-bottom:20px;">Vilket SI-prefix motsvarar 10<sup>' + exp + '</sup>?</div>'
          + '<div class="flashcard-actions" id="fc-actions">' + optBtns + '</div>'
          + '<div class="flashcard-explanation" id="fc-exp"></div>'
          + '<div class="fc-progress">Fråga ' + (idx + 1) + ' av ' + omgang.length + '</div>'
        + '</div>'
      + '</div>';
      var btns = document.querySelectorAll('#fc-actions .fc-btn');
      btns.forEach(function(btn){
        btn.addEventListener('click', function(){
          var correct = btn.dataset.val === svar;
          btn.classList.add(correct ? 'correct' : 'wrong');
          if(!correct){
            var rightBtn = document.querySelector('#fc-actions [data-val="' + svar + '"]');
            if(rightBtn) rightBtn.classList.add('correct');
          }
          document.getElementById('fc-exp').textContent = svar + ' = 10^' + exp + '.';
          btns.forEach(function(b){ b.disabled = true; });
          resultat.push(correct);
          var ts = getTutorScore('tio-rakna', 'prefix');
          ts.total++; if(correct) ts.correct++;
          setTimeout(function(){ idx++; render(); }, 1500);
        });
      });
    }
    omgang = genOmgang(); render();
  };
})();
