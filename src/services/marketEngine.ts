import { getIO, getActiveConnections } from './socketService.ts';
import { 
  markets_real, markets_demo, 
  history_real, history_demo, 
  currentCandles_real, currentCandles_demo,
  systemActive, globalManipulationMode,
  fetchAllRealPrices, initializeCandlesFromDB,
  initializeUserManipulation, loadAutoMarketConfig,
  saveCandleToDB_v2, TIMEFRAMES, timeframeSecondsMap,
  pruneHistoricalCandles
} from './marketService.ts';
import { markets } from '../markets.ts';
import { settleExpiredTrades, updateTradeExposureCache, tradeExposureCache, cleanupOldDemoTrades } from './tradeService.ts';
import { updatePair } from './otcEngine.ts';
import { liveApiService } from './liveApiService.ts';

const TICK_INTERVAL = 16;

export async function startMarketEngine() {
  console.log('🚀 Starting Market Engine...');
  
  // Initialize candles from the database asynchronously in background
  initializeCandlesFromDB().catch(err => console.error("Error initializing candles:", err));
  
  // Initialize user manipulation cache
  initializeUserManipulation().catch(err => console.error("Error initializing user manipulation:", err));

  // Initialize auto market risk management config
  loadAutoMarketConfig().catch(err => console.error("Error initializing auto market config:", err));

  // Initial price fetch
  fetchAllRealPrices();
  setInterval(fetchAllRealPrices, 30000); // Sync with real prices every 30 seconds

  // 0. Start Live API Service (Binance WebSockets)
  try {
    liveApiService.start();
    console.log('✅ Live API Service started.');
  } catch (err) {
    console.error('Failed to start Live API Service:', err);
  }

  // Initialize automatic cleanup of demo trades older than 7 days
  cleanupOldDemoTrades().catch(err => console.error("Error in initial demo trade cleanup:", err));
  setInterval(() => {
    cleanupOldDemoTrades().catch(err => console.error("Error in hourly demo trade cleanup:", err));
  }, 60 * 60 * 1000); // Run hourly to keep the DB lightweight

  // Settle expired trades every 1 second (using recursive timeout to prevent overlap)
  const runSettlement = async () => {
    if (systemActive && getActiveConnections() > 0) {
      try {
        await updateTradeExposureCache();
        await settleExpiredTrades();
      } catch (e) {
        console.error('Settlement error:', e);
      }
    }
    setTimeout(runSettlement, 1000);
  };
  runSettlement();

  // Main Ticker Loop (using recursive timeout)
  let lastSummaryEmit = Date.now();
  const runTicker = async () => {
    if (systemActive) {
      try {
        const io = getIO();
        const marketKeys = Object.keys(markets);
        const nowMs = Date.now();
        const nowSec = Math.floor(nowMs / 1000);
        
        // Broadcast summary every ~1000ms (1 second) to prevent UI blocking
        const shouldEmitSummary = (nowMs - lastSummaryEmit) >= 1000;

        for (const pair of marketKeys) {
          try {
            // Process unified market tick
            const tick = updatePair(pair, 'real', nowSec, nowMs);
            if (tick) {
              const roomReal = `market_${pair}_real`;
              const roomDemo = `market_${pair}_demo`;
              const listenersReal = io.sockets.adapter.rooms.get(roomReal);
              const listenersDemo = io.sockets.adapter.rooms.get(roomDemo);
              if ((listenersReal && listenersReal.size > 0) || (listenersDemo && listenersDemo.size > 0)) {
                io.to(roomReal).to(roomDemo).emit('market_tick', { pair, ...tick });
              }
            }
          } catch (pairErr) {
            // Skip broken pairs
          }
        }

        if (shouldEmitSummary) {
          // Calculate and broadcast sentiment for all pairs
          const sentiments: Record<string, number> = {};
          for (const pair of marketKeys) {
            // Base sentiment with organic random drift
            let base = 50 + (Math.sin(nowSec / 20) * 10); // Waves between 40-60
            const exposure = tradeExposureCache.get(`${pair}_real`) || 0;
            
            // Adjust based on real market exposure
            if (exposure !== 0) {
              base += (exposure > 0 ? 8 : -8);
            }
            
            // Add final micro-jitter
            const final = base + (Math.random() * 4 - 2);
            sentiments[pair] = Math.max(12, Math.min(88, Math.floor(final)));
          }
          io.emit('market_sentiment', sentiments);

          io.emit('market_ticks', markets_real);
          lastSummaryEmit = nowMs;
        }
      } catch (tickErr) {
        console.error('Ticker loop error:', tickErr);
      }
    }
    setTimeout(runTicker, 32); // 32ms (approx 30fps) is optimal for web trading
  };
  runTicker();
}

