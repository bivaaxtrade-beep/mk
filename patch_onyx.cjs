const fs = require('fs');
function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    const search1 = `             // Doji: high reversion, low volatility
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
         }`;

    const replace1 = `             // Doji: high reversion, low volatility
             drift = 0;
             volatilityMult = 0.5;
             reversionStrength = 0.15;
         } else if (roll < 0.4) {
             // Strong Trend (Marubozu): strong drift, low reversion
             drift = (Math.random() - 0.5) * 0.08;
             volatilityMult = 0.8;
             reversionStrength = 0.005;
         } else if (roll < 0.6) {
             // Rejection (Hammer/Shooting Star): strong initial burst, then we will reverse it.
             drift = (Math.random() - 0.5) * 0.05;
             volatilityMult = 1.2;
             reversionStrength = 0.08;
         } else if (roll < 0.8) {
             // Small Body: low volatility
             drift = (Math.random() - 0.5) * 0.02;
             volatilityMult = 0.4;
             reversionStrength = 0.03;
         } else {
             // Normal volatile
             drift = (Math.random() - 0.5) * 0.04;
             volatilityMult = 0.9;
             reversionStrength = 0.02;
         }`;

    const search2 = `      // Rare volatility spikes (1.5% chance per frame)
      if (Math.random() > 0.985) {
          velocity += (Math.random() - 0.5) * 0.8 * volatilityMult;
      }

      // Mean Reversion (The secret to DOJI and LONG WICKS)
      // We pull the price back towards the candle's open if it moves too far
      const open = lastCandle ? lastCandle.open : visualPrice;
      const dist = Math.abs(visualPrice - open);
      
      if (dist > 0.3) {
          // Spring force pulling it back. The further away, the stronger the pull.
          const reverseForce = (open - visualPrice) * reversionStrength; 
          velocity += reverseForce;
      }`;

    const replace2 = `      // Rare volatility spikes (1.5% chance per frame)
      if (Math.random() > 0.985) {
          velocity += (Math.random() - 0.5) * 0.2 * volatilityMult;
      }

      // Mean Reversion (The secret to DOJI and LONG WICKS)
      // We pull the price back towards the candle's open if it moves too far
      const open = lastCandle ? lastCandle.open : visualPrice;
      const dist = Math.abs(visualPrice - open);
      
      if (dist > 0.15) {
          // Spring force pulling it back. The further away, the stronger the pull.
          const reverseForce = (open - visualPrice) * reversionStrength; 
          velocity += reverseForce;
      }`;

    if (code.includes(search1) && code.includes(search2)) {
        code = code.replace(search1, replace1);
        code = code.replace(search2, replace2);
        fs.writeFileSync(filePath, code);
        console.log("Patched " + filePath);
    }
}
patchFile('src/components/OnyxTradingChart.tsx');
