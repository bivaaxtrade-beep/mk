const fs = require('fs');
const file = 'src/pages/TradeTerminal.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `      if (rawLastCandleRef.current && targetPriceRef.current > 0) {
          if (currentInterpolatedPriceRef.current === 0) {
              currentInterpolatedPriceRef.current = targetPriceRef.current;
          } else {
              // Buttery smooth fluid interpolation at 60FPS
              // 0.28 factor ensures it is both Fast and Smooth
              currentInterpolatedPriceRef.current += (targetPriceRef.current - currentInterpolatedPriceRef.current) * 0.28;
          }
          // Enable interpolation for ALL chart types to ensure no jumping
          newInterp = currentInterpolatedPriceRef.current;
      }`;

const replace = `      // High-Frequency Market Physics & Organic Wicks (Runs every frame at ~60 FPS)
      if (rawLastCandleRef.current && targetPriceRef.current > 0) {
          if (currentInterpolatedPriceRef.current === 0) {
              currentInterpolatedPriceRef.current = targetPriceRef.current;
              // Initialize frontend physics state if not exists
              if (!window.liveCandlePhysics) {
                 window.liveCandlePhysics = { velocity: 0, volatility: 0.00005, pType: 'normal' };
              }
          } else {
              if (!window.liveCandlePhysics) {
                 window.liveCandlePhysics = { velocity: 0, volatility: 0.00005, pType: 'normal' };
              }
              const phys = window.liveCandlePhysics;
              const nowMs = Date.now();
              const candleStart = rawLastCandleRef.current.time * 1000;
              const elapsed = nowMs - candleStart;
              
              // Roll personality at start of new candle
              if (elapsed < 100 && (!phys.lastRoll || nowMs - phys.lastRoll > 4000)) {
                  phys.lastRoll = nowMs;
                  const r = Math.random();
                  if (r < 0.2) phys.pType = 'doji';
                  else if (r < 0.4) phys.pType = 'hammer';
                  else if (r < 0.6) phys.pType = 'shooting_star';
                  else if (r < 0.8) phys.pType = 'marubozu';
                  else phys.pType = 'normal';
              }

              // Base random noise (Brownian motion)
              let noise = (Math.random() - 0.5) * phys.volatility;
              
              // Apply organic micro-bias based on personality to stretch wicks/bodies
              const openPrice = rawLastCandleRef.current.open;
              const distToOpen = currentInterpolatedPriceRef.current - openPrice;
              
              if (phys.pType === 'doji') {
                  // Magnetically pull back to open
                  noise -= distToOpen * 0.05; 
              } else if (phys.pType === 'hammer') {
                  if (elapsed < 3000) noise -= phys.volatility * 2; // push down
                  else noise += (openPrice - currentInterpolatedPriceRef.current) * 0.05 + (phys.volatility); // snap up
              } else if (phys.pType === 'shooting_star') {
                  if (elapsed < 3000) noise += phys.volatility * 2; // push up
                  else noise -= (currentInterpolatedPriceRef.current - openPrice) * 0.05 + (phys.volatility); // snap down
              }
              
              phys.velocity += noise;
              phys.velocity *= 0.85; // Damping/friction for snappy quotation movement
              
              // Add rare volatility spikes
              if (Math.random() > 0.95) {
                  phys.velocity += (Math.random() - 0.5) * phys.volatility * 5;
              }

              // Anchor force: strongly pull towards the server's true target price
              const anchorForce = (targetPriceRef.current - currentInterpolatedPriceRef.current) * 0.2;
              phys.velocity += anchorForce;

              // Apply velocity
              currentInterpolatedPriceRef.current += phys.velocity;
          }
          newInterp = currentInterpolatedPriceRef.current;
      }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Patched updateLine with High-Frequency Physics!");
} else {
    console.log("Could not find search block in updateLine.");
}
