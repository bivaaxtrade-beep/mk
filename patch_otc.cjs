const fs = require('fs');

const file = 'src/services/otcEngine.ts';
let code = fs.readFileSync(file, 'utf8');

// Insert candleVolatilityStates at the top
if (!code.includes('const candleVolatilityStates')) {
    code = code.replace(
        'const marketTrendStates: Record<string, MarketTrend> = {};',
        `const marketTrendStates: Record<string, MarketTrend> = {};\nconst candleVolatilityStates: Record<string, any> = {};`
    );
}

const search = `  // Base random price change - reduced range to prevent "shaking"
  const randNoise = (Math.random() - 0.5) * 1.0; 

  // Set direction based on active trend state
  let trendBias = 0;
  if (state.currentTrend === 'up') {
    trendBias = state.trendIntensity * 1.5; // Much stronger bias for "Big Steps"
  } else if (state.currentTrend === 'down') {
    trendBias = -state.trendIntensity * 1.5;
  } else {
    trendBias = (Math.random() - 0.5) * 0.4;
  }

  // Calculate sharpened momentum for "Big Step" movement
  // Using 0.85 for faster responsiveness and sharper "jumps"
  state.momentum = (state.momentum * 0.85) + (trendBias * 0.15);

  // Combine noise and momentum for aggressive, stepping movement
  const rawVolatility = markets[pair]?.volatility || 0.0002;
  const baseVolatility = rawVolatility / currentPrice;
  
  // High weight on momentum (0.95) and very low on noise (0.05) for clean, bold steps
  const tickChangePercent = (randNoise * 0.05 + state.momentum * 0.95) * baseVolatility * volMult;
  
  let change = currentPrice * tickChangePercent;`;

const replace = `  // --- 5-Second Candle Micro-Volatility (Market Realism) ---
  const bucket5s = now - (now % 5);
  const candleStateKey = \`\${pair}_\${type}\`;
  
  if (!candleVolatilityStates[candleStateKey] || candleVolatilityStates[candleStateKey].start !== bucket5s) {
      const roll = Math.random();
      let pType = 'normal';
      let vMult = 1.0;
      
      if (roll < 0.15) { pType = 'doji'; vMult = 0.5; }
      else if (roll < 0.30) { pType = 'hammer'; vMult = 2.5; }
      else if (roll < 0.45) { pType = 'shooting_star'; vMult = 2.5; }
      else if (roll < 0.60) { pType = 'marubozu'; vMult = 1.5; }
      else if (roll < 0.75) { pType = 'small'; vMult = 0.3; }
      else { pType = 'normal'; vMult = 1.2; }
      
      candleVolatilityStates[candleStateKey] = { start: bucket5s, type: pType, volMult: vMult, initialDir: Math.random() > 0.5 ? 1 : -1 };
  }
  const cState = candleVolatilityStates[candleStateKey];

  // Base random price noise (dynamic based on candle personality)
  const randNoise = (Math.random() - 0.5) * 1.5 * cState.volMult; 

  // Macro trend bias
  let trendBias = 0;
  if (state.currentTrend === 'up') trendBias = state.trendIntensity * 1.5;
  else if (state.currentTrend === 'down') trendBias = -state.trendIntensity * 1.5;
  else trendBias = (Math.random() - 0.5) * 0.4;

  state.momentum = (state.momentum * 0.85) + (trendBias * 0.15);

  const rawVolatility = markets[pair]?.volatility || 0.0002;
  const baseVolatility = rawVolatility / currentPrice;
  
  // Calculate raw change
  const tickChangePercent = (randNoise * 0.1 + state.momentum * 0.9) * baseVolatility * volMult;
  let change = currentPrice * tickChangePercent;
  
  // Apply Micro-Bias (Rejection/Wicks/Doji forces)
  const active5sCandle = candlePool[pair]?.["5 seconds"];
  if (active5sCandle) {
      const openPrice = active5sCandle.open;
      const elapsedSec = now - bucket5s;
      const distToOpen = currentPrice - openPrice;
      const rawPriceChangeLimit = currentPrice * baseVolatility * volMult * 3;
      
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
      }
      
      change += microBias;
  }`;

code = code.replace(search, replace);
fs.writeFileSync(file, code);
console.log('patched backend otcEngine.ts');
