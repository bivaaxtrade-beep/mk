const fs = require('fs');
const file = 'src/services/otcEngine.ts';
let code = fs.readFileSync(file, 'utf8');

const search1 = `      if (roll < 0.15) { pType = 'doji'; vMult = 0.5; }
      else if (roll < 0.30) { pType = 'hammer'; vMult = 2.5; }
      else if (roll < 0.45) { pType = 'shooting_star'; vMult = 2.5; }
      else if (roll < 0.60) { pType = 'marubozu'; vMult = 1.5; }
      else if (roll < 0.75) { pType = 'small'; vMult = 0.3; }
      else { pType = 'normal'; vMult = 1.2; }`;

const replace1 = `      if (roll < 0.15) { pType = 'doji'; vMult = 0.8; }
      else if (roll < 0.30) { pType = 'hammer'; vMult = 1.2; }
      else if (roll < 0.45) { pType = 'shooting_star'; vMult = 1.2; }
      else if (roll < 0.60) { pType = 'marubozu'; vMult = 1.1; }
      else if (roll < 0.75) { pType = 'small'; vMult = 0.6; }
      else { pType = 'normal'; vMult = 1.0; }`;

const search2 = `      const rawPriceChangeLimit = currentPrice * baseVolatility * volMult * 3;
      
      let microBias = 0;
      if (cState.type === 'doji') {
          // Magnetically pull back to open
          microBias = -distToOpen * 0.4; 
      } else if (cState.type === 'marubozu') {
          // Push constantly in initial direction
          microBias = cState.initialDir * rawPriceChangeLimit * 0.6;
      } else if (cState.type === 'hammer') {
          if (elapsedSec < 3) {
             microBias = -rawPriceChangeLimit * 1.5; // push down sharply
          } else {
             microBias = (openPrice - currentPrice) * 0.7 + (rawPriceChangeLimit * 0.5); // snap back up
          }
      } else if (cState.type === 'shooting_star') {
          if (elapsedSec < 3) {
             microBias = rawPriceChangeLimit * 1.5; // push up sharply
          } else {
             microBias = (openPrice - currentPrice) * 0.7 - (rawPriceChangeLimit * 0.5); // snap back down
          }
      }`;

const replace2 = `      const rawPriceChangeLimit = currentPrice * baseVolatility * volMult * 0.5; // Drastically reduced for organic wicks
      
      let microBias = 0;
      if (cState.type === 'doji') {
          microBias = -distToOpen * 0.15; // Gentler magnetic pull
      } else if (cState.type === 'marubozu') {
          microBias = cState.initialDir * rawPriceChangeLimit * 0.3;
      } else if (cState.type === 'hammer') {
          if (elapsedSec < 3) {
             microBias = -rawPriceChangeLimit * 0.8; 
          } else {
             microBias = (openPrice - currentPrice) * 0.15 + (rawPriceChangeLimit * 0.3); 
          }
      } else if (cState.type === 'shooting_star') {
          if (elapsedSec < 3) {
             microBias = rawPriceChangeLimit * 0.8; 
          } else {
             microBias = (openPrice - currentPrice) * 0.15 - (rawPriceChangeLimit * 0.3); 
          }
      }`;

if (code.includes(search1) && code.includes(search2)) {
    code = code.replace(search1, replace1);
    code = code.replace(search2, replace2);
    fs.writeFileSync(file, code);
    console.log("Patched backend chaos!");
} else {
    console.log("Could not find backend blocks.");
}
