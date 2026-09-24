const fs = require('fs');
const file = 'src/pages/TradeTerminal.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `      } else {
          rawLastCandleRef.current.close = newClose;
          rawLastCandleRef.current.high = Math.max(rawLastCandleRef.current.high, newClose);
          rawLastCandleRef.current.low = Math.min(rawLastCandleRef.current.low, newClose);
          if (tick.candle?.volume) rawLastCandleRef.current.volume = tick.candle.volume;
      }`;

const replace = `      } else {
          rawLastCandleRef.current.close = newClose;
          // Sync with server's actual high/low from the micro-volatility engine
          if (tick.candle) {
              rawLastCandleRef.current.high = Math.max(rawLastCandleRef.current.high, newClose, tick.candle.high || newClose);
              rawLastCandleRef.current.low = Math.min(rawLastCandleRef.current.low, newClose, tick.candle.low || newClose);
              rawLastCandleRef.current.volume = tick.candle.volume || rawLastCandleRef.current.volume;
          } else {
              rawLastCandleRef.current.high = Math.max(rawLastCandleRef.current.high, newClose);
              rawLastCandleRef.current.low = Math.min(rawLastCandleRef.current.low, newClose);
          }
      }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Patched handleSingleMarketTick!");
} else {
    console.log("Could not find search block.");
}
