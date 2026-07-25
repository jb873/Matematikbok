/* ============================================================
   FAMILJ B · ÅK8-TILLÄGG: hårdare mult/div-generator för negativa tal.
   ADDITIVT — negMultDivGen/negFaktorerGen i metod-negativa.js är ORÖRDA.
   Laddas som klassiskt <script src> EFTER metod-negativa.js. Ramens
   additiva wrapper renderNegMultDiv pekar sin multdiv-gen hit för åk8.

   Talområde per C4-planen (godkänd):
     nivå 1  heltal ±12, två faktorer, mult/div — teckenreglerna
     nivå 2  heltal ±20 + en enkel decimal (0,x) + tre-fakt-kedja
     nivå 3  stora tal (·10/·100/·200), decimaler (0,0x), upp till 4 faktorer

   Svarsmotorn (negCalcEngine) är RENT NUMERISK (d3ParseNum → 1e-6).
   Därför ligger BRÅK·BRÅK kvar i Öva-bladet (blad C, fracBoxes-input),
   inte här — den enda avvikelsen från C4-planens bokstav (se rapport).
   Alla svar är terminerande decimaler/heltal så eleven kan skriva dem.
   Återanvänder d3RandInt/randPick/prioNum/prioParen/negExpr oförändrat.
   ============================================================ */

function negMultDivGenAk8(level){
  function rnd(x){ return Math.round(x * 1e6) / 1e6; }
  function sgn(){ return Math.random() < 0.5 ? -1 : 1; }

  if(level === 1){
    if(Math.random() < 0.5){                          // multiplikation, heltal
      var a = d3RandInt(2,12), b = d3RandInt(2,12), sa = sgn(), sb = sgn();
      return negExpr(prioParen(sa*a) + ' · ' + prioParen(sb*b), sa*sb*a*b);
    }
    var q = d3RandInt(2,12), d = d3RandInt(2,9), sq = sgn(), sd = sgn(), D = q*d;   // division
    return negExpr(prioParen(sq*sd*D) + ' / ' + prioParen(sd*d), sq*q);
  }

  if(level === 2){
    var t = randPick([1,2,3]);
    if(t === 1){                                       // heltal, bredare område
      var a2 = d3RandInt(2,20), b2 = d3RandInt(2,12), sa2 = sgn(), sb2 = sgn();
      return negExpr(prioParen(sa2*a2) + ' · ' + prioParen(sb2*b2), sa2*sb2*a2*b2);
    }
    if(t === 2){                                       // en enkel decimal 0,x
      var dec = d3RandInt(2,9)/10, k = d3RandInt(2,12), sD = sgn(), sk = sgn();
      return negExpr(prioParen(rnd(sD*dec)) + ' · ' + prioParen(sk*k), rnd(sD*sk*dec*k));
    }
    var f1 = d3RandInt(2,6)*sgn(), f2 = d3RandInt(2,6)*sgn(), f3 = d3RandInt(2,6)*sgn();  // tre faktorer
    return negExpr(prioParen(f1) + ' · ' + prioParen(f2) + ' · ' + prioParen(f3), f1*f2*f3);
  }

  // nivå 3
  var t3 = randPick([1,2,3,4]);
  if(t3 === 1){                                        // stora tal
    var big = d3RandInt(2,9) * randPick([10,100,200]), sm = d3RandInt(2,9), sB = sgn(), sS = sgn();
    if(Math.random() < 0.5) return negExpr(prioParen(sB*big) + ' · ' + prioParen(sS*sm), sB*sS*big*sm);
    var Dv = big*sm;
    return negExpr(prioParen(sB*sS*Dv) + ' / ' + prioParen(sS*sm), sB*big);
  }
  if(t3 === 2){                                        // små decimaler 0,0x
    var dd = d3RandInt(1,9)/100, kk = d3RandInt(2,12), sdd = sgn(), skk = sgn();
    return negExpr(prioParen(rnd(sdd*dd)) + ' · ' + prioParen(skk*kk), rnd(sdd*skk*dd*kk));
  }
  if(t3 === 3){                                        // fyra faktorer, minst två negativa
    var fs, guard = 0;
    do { fs = []; for(var i=0; i<4; i++) fs.push(d3RandInt(2,6) * sgn()); guard++; }
    while(fs.filter(function(v){ return v < 0; }).length < 2 && guard < 60);
    return negExpr(fs.map(prioParen).join(' · '), fs.reduce(function(p,v){ return p*v; }, 1));
  }
  var g1 = randPick([0.2,0.3,0.4,0.5])*sgn(), g2 = d3RandInt(2,9)*sgn(), g3 = randPick([0.1,0.5,2,3])*sgn();  // decimalkedja
  return negExpr(prioParen(rnd(g1)) + ' · ' + prioParen(g2) + ' · ' + prioParen(rnd(g3)), rnd(g1*g2*g3));
}
