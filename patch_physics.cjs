const fs = require('fs');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // 1. Patch Historical Data Loop
    const historySearch = `    for (let i = 0; i < historyCount; i++) {
      const open = historyPrice;
      const isUp = Math.random() > 0.5;
      const bodySize = (Math.random() * 0.6) + 0.2; 
      const close = isUp ? open + bodySize : open - bodySize;
      const wickUpper = close > open ? close + Math.random() * 0.4 : open + Math.random() * 0.4;
      const wickLower = close > open ? open - Math.random() * 0.4 : close - Math.random() * 0.4;
      
      historicalData.push({
        time: historyTime as Time,
        open,
        high: wickUpper,
        low: wickLower,
        close,
      });
      historyPrice = close;
      historyTime += timeframeSeconds;
    }`;

    const historyReplace = `    for (let i = 0; i < historyCount; i++) {
      const open = historyPrice;
      const roll = Math.random();
      let close = open;
      let high = open;
      let low = open;

      if (roll < 0.2) {
         // Doji
         close = open + (Math.random() - 0.5) * 0.1;
         high = open + Math.random() * 0.5;
         low = open - Math.random() * 0.5;
      } else if (roll < 0.4) {
         // Strong Trend (Marubozu)
         const dir = Math.random() > 0.5 ? 1 : -1;
         const bodySize = (Math.random() * 0.8) + 0.4;
         close = open + (dir * bodySize);
         high = Math.max(open, close) + (Math.random() * 0.05);
         low = Math.min(open, close) - (Math.random() * 0.05);
      } else if (roll < 0.6) {
         // Rejection (Hammer / Shooting Star)
         const isHammer = Math.random() > 0.5;
         const bodySize = (Math.random() * 0.2) + 0.05;
         close = open + (Math.random() > 0.5 ? bodySize : -bodySize);
         if (isHammer) {
             high = Math.max(open, close) + Math.random() * 0.1;
             low = Math.min(open, close) - ((Math.random() * 0.8) + 0.4);
         } else {
             high = Math.max(open, close) + ((Math.random() * 0.8) + 0.4);
             low = Math.min(open, close) - Math.random() * 0.1;
         }
      } else if (roll < 0.8) {
         // Small body
         const dir = Math.random() > 0.5 ? 1 : -1;
         const bodySize = Math.random() * 0.2 + 0.1;
         close = open + (dir * bodySize);
         high = Math.max(open, close) + Math.random() * 0.2;
         low = Math.min(open, close) - Math.random() * 0.2;
      } else {
         // Normal
         const dir = Math.random() > 0.5 ? 1 : -1;
         const bodySize = Math.random() * 0.5 + 0.2;
         close = open + (dir * bodySize);
         high = Math.max(open, close) + Math.random() * 0.4;
         low = Math.min(open, close) - Math.random() * 0.4;
      }

      historicalData.push({
        time: historyTime as Time,
        open,
        high,
        low,
        close,
      });
      historyPrice = close;
      historyTime += timeframeSeconds;
    }`;

    // 2. Patch Real-time Engine setup
    const engineSetupSearch = `    // 3. Perfect Sync: Real-time engine starts EXACTLY where history ended
    let visualPrice = historyPrice;
    let velocity = 0;

    const updateLoop = () => {`;
    
    const engineSetupReplace = `    // 3. Perfect Sync: Real-time engine starts EXACTLY where history ended
    let visualPrice = historyPrice;
    let velocity = 0;

    // Personality variables for dynamic volatility
    let currentCandleStart = 0;
    let drift = 0;
    let volatilityMult = 1;
    let reversionStrength = 0;

    const updateLoop = () => {`;

    // 3. Patch Real-time Loop Logic
    const physicsSearch = `      // 1. High-Frequency Market Physics (Runs every frame at ~60 FPS)
      
      // Base random noise (Brownian motion)
      const acceleration = (Math.random() - 0.5) * 0.15;
      
      velocity += acceleration;
      
      // Friction/Damping: 0.92 gives it a "sharp" but fluid tick feel (like Quotex)
      velocity *= 0.92;

      // Rare volatility spikes (1.5% chance per frame)
      if (Math.random() > 0.985) {
          velocity += (Math.random() - 0.5) * 0.8;
      }

      // Mean Reversion (The secret to DOJI and LONG WICKS)
      // We pull the price back towards the candle's open if it moves too far
      const open = lastCandleRef.current ? lastCandleRef.current.open : visualPrice;
      const dist = Math.abs(visualPrice - open);
      
      if (dist > 0.5) {
          // Spring force pulling it back. The further away, the stronger the pull.
          const reverseForce = (open - visualPrice) * 0.03; 
          velocity += reverseForce;
      }`;

    const physicsReplace = `      // 1. High-Frequency Market Physics (Runs every frame at ~60 FPS)
      
      if (Number(candleTime) !== currentCandleStart) {
         currentCandleStart = Number(candleTime);
         // Roll new personality for the new 5-second candle
         const roll = Math.random();
         if (roll < 0.2) {
             // Doji: high reversion, low volatility
             drift = 0;
             volatilityMult = 0.3;
             reversionStrength = 0.08;
         } else if (roll < 0.4) {
             // Strong Trend (Marubozu): strong drift, low reversion
             drift = (Math.random() - 0.5) * 0.15;
             volatilityMult = 0.8;
             reversionStrength = 0.005;
         } else if (roll < 0.6) {
             // Rejection (Hammer/Shooting Star): strong initial burst, then we will reverse it.
             drift = (Math.random() - 0.5) * 0.1;
             volatilityMult = 1.5;
             reversionStrength = 0.05;
         } else if (roll < 0.8) {
             // Small Body: low volatility
             drift = (Math.random() - 0.5) * 0.02;
             volatilityMult = 0.4;
             reversionStrength = 0.03;
         } else {
             // Normal volatile
             drift = (Math.random() - 0.5) * 0.06;
             volatilityMult = 1.0;
             reversionStrength = 0.02;
         }
      }

      // Base random noise (Brownian motion) + drift
      const acceleration = ((Math.random() - 0.5) * 0.15 * volatilityMult) + drift;
      
      velocity += acceleration;
      
      // Friction/Damping: 0.92 gives it a "sharp" but fluid tick feel (like Quotex)
      velocity *= 0.92;

      // Rare volatility spikes (1.5% chance per frame)
      if (Math.random() > 0.985) {
          velocity += (Math.random() - 0.5) * 0.8 * volatilityMult;
      }

      // Mean Reversion (The secret to DOJI and LONG WICKS)
      // We pull the price back towards the candle's open if it moves too far
      const open = lastCandleRef.current ? lastCandleRef.current.open : visualPrice;
      const dist = Math.abs(visualPrice - open);
      
      if (dist > 0.3) {
          // Spring force pulling it back. The further away, the stronger the pull.
          const reverseForce = (open - visualPrice) * reversionStrength; 
          velocity += reverseForce;
      }`;

    code = code.replace(historySearch, historyReplace);
    code = code.replace(engineSetupSearch, engineSetupReplace);
    code = code.replace(physicsSearch, physicsReplace);

    fs.writeFileSync(filePath, code);
    console.log('patched ' + filePath);
}

patchFile('src/components/TradingChart.tsx');
patchFile('src/components/OnyxTradingChart.tsx');
