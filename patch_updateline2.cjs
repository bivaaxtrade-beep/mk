const fs = require('fs');
const file = 'src/pages/TradeTerminal.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `              if (!window.liveCandlePhysics) {
                 window.liveCandlePhysics = { velocity: 0, volatility: 0.00005, pType: 'normal' };
              }
              const phys = window.liveCandlePhysics;
              const nowMs = Date.now();`;

const replace = `              if (!window.liveCandlePhysics) {
                 window.liveCandlePhysics = { velocity: 0, volatility: 0.00005, pType: 'normal' };
              }
              const phys = window.liveCandlePhysics;
              // Make frontend visual volatility relative to the asset price
              // Approx 0.005% of current price as base noise
              phys.volatility = targetPriceRef.current * 0.00005; 
              const nowMs = Date.now();`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Patched updateLine with dynamic relative volatility!");
} else {
    console.log("Could not find search block.");
}
