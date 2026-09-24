import { query } from '../db/mysql-db.ts';
import { 
  markets_real, markets_demo, 
  history_real, history_demo, 
  currentCandles_real, currentCandles_demo,
  saveCandleToDB_v2, TIMEFRAMES, timeframeSecondsMap,
  isMarketClosedAt,
  autoMarketConfig
} from './marketService.ts';
import { getIO } from './socketService.ts';
import { tradeExposureCache, manipulatedExposureCache } from './tradeService.ts';
import { globalManipulationMode } from './marketService.ts';
import { markets } from '../markets.ts';

const steeringTradesCache = new Map<string, any[]>();

function getPairPersonality(pair: string) {
  const name = pair.toUpperCase();
  
  // Default values (moderate/normal)
  let tickVol = 0.000065;
  let smoothness = 0.88; // Higher = smoother trends, lower = more jagged ticks
  let dojiRate = 0.05;   // Likelihood of Doji candles
  let marubozuRate = 0.06; // Likelihood of solid healthy body candles
  let wickScale = 0.18;   // General multiplier for wicks/shadows (higher = larger wicks, lower = tighter wicks)
  
  if (name.includes('CRYPTO IDX') || name.includes('IDX')) {
    // Highly volatile indices, snappy movements, larger shadows
    tickVol = 0.000120;
    smoothness = 0.70;
    dojiRate = 0.12;
    marubozuRate = 0.08;
    wickScale = 0.35;
  } else if (name.includes('BTC') || name.includes('ETH') || name.includes('SOL')) {
    // Crypto assets, medium-high volatility, clean movements
    tickVol = 0.000095;
    smoothness = 0.80;
    dojiRate = 0.06;
    marubozuRate = 0.12;
    wickScale = 0.25;
  } else if (name.includes('(OTC)')) {
    // OTC pairs, medium volatility, balanced movements
    tickVol = 0.000085;
    smoothness = 0.85;
    dojiRate = 0.08;
    marubozuRate = 0.08;
    wickScale = 0.22;
  } else if (name.includes('EUR/') || name.includes('GBP/') || name.includes('USD/')) {
    // Major Forex: highly liquid, very smooth, rare long wicks, very rare Dojis
    tickVol = 0.000050;
    smoothness = 0.94; // Extreme smooth trend preservation
    dojiRate = 0.03;
    marubozuRate = 0.14; // Many more healthy standard bodies
    wickScale = 0.12;    // Very small professional shadows
  } else if (name.includes('JPY')) {
    // Yen pairs: snappy, trending, moderate wicks
    tickVol = 0.000065;
    smoothness = 0.90;
    dojiRate = 0.05;
    marubozuRate = 0.10;
    wickScale = 0.16;
  }
  
  return { tickVol, smoothness, dojiRate, marubozuRate, wickScale };
}

function capCandleWicks(candle: any, timeframe?: string, priceUnit?: number, patternType?: string, pair?: string) {
  if (!candle) return;

  const open = Number(candle.open);
  const close = Number(candle.close);
  if (!isFinite(open) || !isFinite(close)) return;

  const body = Math.abs(close - open);
  const pType = patternType || candle.patternType || 'standard';
  
  // Get pair-specific scaling factor
  const { wickScale } = getPairPersonality(pair || '');
  
  // Choose a base scale for wick limits.
  // We combine the body size and the priceUnit (which represents a standard candle range)
  const scale = (priceUnit && priceUnit > 0 ? priceUnit : (open * 0.001)) * (wickScale / 0.18);

  let maxUpperWick = scale * 0.25;
  let maxLowerWick = scale * 0.25;

  // Let's customize wick limits per pattern type to make them perfectly authentic!
  switch (pType) {
    case 'doji_four_price':
      // Absolutely flat - no wicks!
      maxUpperWick = body * 0.05;
      maxLowerWick = body * 0.05;
      break;

    case 'doji':
      // Balanced medium-to-long wicks
      maxUpperWick = scale * (0.35 + Math.random() * 0.25);
      maxLowerWick = scale * (0.35 + Math.random() * 0.25);
      break;

    case 'doji_dragonfly':
      // Dragonfly: very long lower wick, tiny or zero upper wick
      maxUpperWick = scale * (0.01 + Math.random() * 0.03);
      maxLowerWick = scale * (0.65 + Math.random() * 0.45);
      break;

    case 'doji_gravestone':
      // Gravestone: very long upper wick, tiny or zero lower wick
      maxUpperWick = scale * (0.65 + Math.random() * 0.45);
      maxLowerWick = scale * (0.01 + Math.random() * 0.03);
      break;

    case 'doji_long_legged':
      // Long-legged: extremely long balanced wicks
      maxUpperWick = scale * (0.80 + Math.random() * 0.50);
      maxLowerWick = scale * (0.80 + Math.random() * 0.50);
      break;

    case 'high_wave':
      // Tiny body, very long shadows on both sides
      maxUpperWick = scale * (0.75 + Math.random() * 0.40);
      maxLowerWick = scale * (0.75 + Math.random() * 0.40);
      break;

    case 'hammer':
    case 'hanging_man':
      // Long lower shadow (at least 2x-3x the body), tiny upper shadow
      maxLowerWick = Math.max(body * 2.2, scale * (0.60 + Math.random() * 0.35));
      maxUpperWick = Math.max(body * 0.15, scale * (0.02 + Math.random() * 0.06));
      break;

    case 'shooting_star':
    case 'inverted_hammer':
      // Long upper shadow (at least 2x-3x the body), tiny lower shadow
      maxUpperWick = Math.max(body * 2.2, scale * (0.60 + Math.random() * 0.35));
      maxLowerWick = Math.max(body * 0.15, scale * (0.02 + Math.random() * 0.06));
      break;

    case 'spinning_top':
      // Prominent but balanced top & bottom wicks
      maxUpperWick = scale * (0.25 + Math.random() * 0.20);
      maxLowerWick = scale * (0.25 + Math.random() * 0.20);
      break;

    case 'small_body':
      // Thin / small body with moderate wicks
      maxUpperWick = scale * (0.20 + Math.random() * 0.15);
      maxLowerWick = scale * (0.20 + Math.random() * 0.15);
      break;

    case 'marubozu':
      // Marubozu has near-zero wicks (extreme professional solid candle)
      maxUpperWick = body * (0.005 + Math.random() * 0.01);
      maxLowerWick = body * (0.005 + Math.random() * 0.01);
      break;

    case 'momentum_drive':
    case 'engulfing':
      // Strong trend: very small wicks (5% to 15% of body max)
      maxUpperWick = body * (0.05 + Math.random() * 0.12);
      maxLowerWick = body * (0.05 + Math.random() * 0.12);
      break;

    case 'standard':
    default:
      // Standard professional candles: healthy clean body with neat small-to-medium wicks
      // Wicks are normally between 10% to 30% of the body size or small absolute scale
      maxUpperWick = Math.max(body * (0.10 + Math.random() * 0.15), scale * (0.12 + Math.random() * 0.10));
      maxLowerWick = Math.max(body * (0.10 + Math.random() * 0.15), scale * (0.12 + Math.random() * 0.10));
      break;
  }

  // Calculate high and low based on these caps
  const highLimit = Math.max(open, close) + maxUpperWick;
  const lowLimit = Math.min(open, close) - maxLowerWick;

  // Set the high and low strictly bounded by these pattern-based limits!
  candle.high = Math.max(open, close, Math.min(Number(candle.high) || highLimit, highLimit));
  candle.low = Math.min(open, close, Math.max(Number(candle.low) || lowLimit, lowLimit));
}

function pickTimeframePattern(pair: string): string {
  const { dojiRate, marubozuRate } = getPairPersonality(pair);
  const r = Math.random();
  
  // Adjust probability of Doji / Pinbar based on pair personality
  if (r < dojiRate * 0.1) return 'doji_four_price'; 
  if (r < dojiRate * 0.4) return 'doji';           
  if (r < dojiRate * 0.6) return 'doji_dragonfly'; 
  if (r < dojiRate * 0.8) return 'doji_gravestone';
  if (r < dojiRate) return 'doji_long_legged';
  
  const nextThresh = dojiRate;
  if (r < nextThresh + 0.05) return 'hammer';         
  if (r < nextThresh + 0.10) return 'shooting_star';  
  if (r < nextThresh + 0.13) return 'inverted_hammer';
  if (r < nextThresh + 0.16) return 'hanging_man';    
  if (r < nextThresh + 0.21) return 'spinning_top';   
  if (r < nextThresh + 0.24) return 'high_wave';      
  if (r < nextThresh + 0.31) return 'small_body';     
  
  const marubozuThresh = nextThresh + 0.31;
  if (r < marubozuThresh + marubozuRate) return 'marubozu';       
  if (r < marubozuThresh + marubozuRate + 0.10) return 'momentum_drive'; 
  if (r < marubozuThresh + marubozuRate + 0.15) return 'engulfing';      
  return 'standard';                     
}

export async function syncSteeringTrades() {
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const allActive = await query(
      `SELECT id, market_id, is_demo, account_type, entry_price, direction, target_result, expiry_time, duration, created_at, amount 
       FROM trades 
       WHERE status = 'open' AND (expiry_time > ? OR expiry_time IS NULL)`,
      [nowSec]
    ) as any[];
    
    const newCache = new Map<string, any[]>();
    for (const t of allActive) {
      const isDemo = (t.is_demo === true || t.is_demo === 1 || String(t.is_demo) === 'true' || t.account_type === 'demo');
      if (isDemo) continue; // Skip demo trades! Demo trades NEVER steer or manipulate.
      const type = 'real';
      const key = `${t.market_id}_${type}`;
      if (!newCache.has(key)) newCache.set(key, []);
      newCache.get(key)!.push(t);
    }
    
    steeringTradesCache.clear();
    for (const [k, v] of newCache) {
      steeringTradesCache.set(k, v);
    }
  } catch (e) {
    // Fail silently
  }
}

export function registerSteeringTrade(t: {
  id?: number | string;
  market_id: string;
  is_demo: boolean | number;
  entry_price: number | string;
  direction: string;
  target_result: 'win' | 'loss';
  expiry_time: number;
  duration?: number;
  created_at?: number;
  amount?: number | string;
}) {
  const isDemo = (t.is_demo === true || t.is_demo === 1 || String(t.is_demo) === 'true');
  if (isDemo) {
    return; // Demo balance has ZERO manipulation mode or steering!
  }
  const type = 'real';
  const key = `${t.market_id}_${type}`;
  if (!steeringTradesCache.has(key)) {
    steeringTradesCache.set(key, []);
  }
  const list = steeringTradesCache.get(key)!;
  const existingIdx = list.findIndex(item => item.id && t.id && String(item.id) === String(t.id));
  if (existingIdx >= 0) {
    list[existingIdx] = t;
  } else {
    list.push(t);
  }
}

export function unregisterSteeringTrade(id: number | string) {
  for (const [key, list] of steeringTradesCache.entries()) {
    const filtered = list.filter(item => String(item.id) !== String(id));
    steeringTradesCache.set(key, filtered);
  }
}

export function getActiveSteeringTrade(market_id: string, direction?: string) {
  const key = `${market_id}_real`;
  const list = steeringTradesCache.get(key) || [];
  if (!direction) return list[0];
  const dir = direction.toLowerCase();
  return list.find(t => (t.direction || '').toLowerCase() === dir);
}

// Initial sync and then every 2 seconds
syncSteeringTrades();
setInterval(syncSteeringTrades, 2000);

// Dynamic Trend & Micro-Wave State Tracker
interface MarketTrend {
  waveType: 'trend_up' | 'trend_down' | 'zigzag' | 'range';
  waveDir: 'up' | 'down' | 'range';
  waveCandlesLeft: number;
  lastCandleColor: 'green' | 'red' | 'doji';
  consecutiveColorCount: number;
}

const marketTrendStates: Record<string, MarketTrend> = {};
const candleVolatilityStates: Record<string, any> = {};
const noiseOffsets = new Map<string, number>();

export function updatePair(pair: string, type: 'real' | 'demo', now: number, nowMs?: number) {
  if (isMarketClosedAt(pair, now)) {
    return null;
  }
  const pool = type === 'real' ? markets_real : markets_demo;
  const historyPool = type === 'real' ? history_real : history_demo;
  const candlePool = type === 'real' ? currentCandles_real : currentCandles_demo;
  
  const m = pool[pair];
  if (!m) return null;

  let currentPrice = Number(m.price);
  if (!currentPrice || currentPrice <= 0 || !isFinite(currentPrice)) {
    currentPrice = Number(markets[pair]?.price) || 100.00;
    m.price = currentPrice;
  }

  // 1. Initialize or update cyclic wave state (alternating waves and two-way market flow)
  const trendKey = `${pair}_${type}`;
  if (!marketTrendStates[trendKey]) {
    const waveTypeRoll = Math.random();
    let waveType: 'trend_up' | 'trend_down' | 'zigzag' | 'range' = 'zigzag';
    let waveDir: 'up' | 'down' | 'range' = 'range';
    let waveCandlesLeft = 5;

    if (waveTypeRoll < 0.30) {
      waveType = 'trend_up';
      waveDir = 'up';
      waveCandlesLeft = 12 + Math.floor(Math.random() * 15); // 12 to 26 candles of upward trend!
    } else if (waveTypeRoll < 0.60) {
      waveType = 'trend_down';
      waveDir = 'down';
      waveCandlesLeft = 12 + Math.floor(Math.random() * 15); // 12 to 26 candles of downward trend!
    } else if (waveTypeRoll < 0.85) {
      waveType = 'zigzag';
      waveDir = Math.random() < 0.5 ? 'up' : 'down';
      waveCandlesLeft = 2 + Math.floor(Math.random() * 4); // 2 to 5 candles of zigzag!
    } else {
      waveType = 'range';
      waveDir = 'range';
      waveCandlesLeft = 8 + Math.floor(Math.random() * 10);
    }

    marketTrendStates[trendKey] = {
      waveType,
      waveDir,
      waveCandlesLeft,
      lastCandleColor: 'green',
      consecutiveColorCount: 1
    };
  }
  const state = marketTrendStates[trendKey];

  // Determine market-specific relative tick volatility and smoothness using pair personality
  const { tickVol, smoothness } = getPairPersonality(pair);

  // --- 5-Second Candle Micro-Physics & Organic Two-Way Market Wave ---
  const bucket5s = now - (now % 5);
  const candleStateKey = `${pair}_${type}`;
  const steeringKey = `${pair}_real`;
  // Steering and manipulation strictly apply to REAL accounts. Demo is 100% unmanipulated.
  const rawActiveSteeringTrades = type === 'real' 
    ? (steeringTradesCache.get(steeringKey) || []).filter(t => {
        const exp = Number(t.expiry_time);
        return isNaN(exp) || exp > now;
      })
    : [];
  
  // Sort trades so largest amount real trades get highest steering priority
  const activeSteeringTrades = rawActiveSteeringTrades.slice().sort((a, b) => {
    return (parseFloat(b.amount || 0) - parseFloat(a.amount || 0));
  });

  // Evaluate active trade steering target with majority exposure logic
  let activeRealSteeringTarget: { 
    targetDir: 'up' | 'down'; 
    entryPrice: number;
    timeLeft: number;
    elapsedRatio: number; // 0.0 (entry) to 1.0 (expiry)
  } | null = null;

  if (type === 'real' && rawActiveSteeringTrades.length > 0) {
    let totalUpAmount = 0;
    let totalDownAmount = 0;
    let weightedUpPrice = 0;
    let weightedDownPrice = 0;
    let activeTradeCount = 0;

    for (const trade of rawActiveSteeringTrades) {
      const expirySec = Number(trade.expiry_time);
      const timeLeft = expirySec - now;
      if (timeLeft > 0) {
        activeTradeCount++;
        const dir = (trade.direction || 'up').toLowerCase();
        const isUp = dir === 'up' || dir === 'call' || dir === 'buy';
        const amt = Math.max(1, parseFloat(trade.amount || 10));
        const entry = parseFloat(trade.entry_price) || currentPrice;

        if (isUp) {
          totalUpAmount += amt;
          weightedUpPrice += entry * amt;
        } else {
          totalDownAmount += amt;
          weightedDownPrice += entry * amt;
        }
      }
    }

    if (autoMarketConfig.enabled && activeTradeCount > 0) {
      let targetDir: 'up' | 'down';
      let refEntryPrice = currentPrice;

      // Majority Exposure Rule: If opposite positions exist, steer market so the side with HIGHER total $ loses!
      if (totalUpAmount > 0 && totalDownAmount > 0 && Math.abs(totalUpAmount - totalDownAmount) > 0.01) {
        if (totalUpAmount > totalDownAmount) {
          // More total money on UP -> Market must go DOWN (UP loses)
          targetDir = 'down';
          refEntryPrice = weightedUpPrice / totalUpAmount;
        } else {
          // More total money on DOWN -> Market must go UP (DOWN loses)
          targetDir = 'up';
          refEntryPrice = weightedDownPrice / totalDownAmount;
        }
      } else {
        // Single user or single direction trades: follow 80% loss / 20% win rule
        const primaryTrade = activeSteeringTrades[0];
        const dir = (primaryTrade.direction || 'up').toLowerCase();
        const isUp = dir === 'up' || dir === 'call' || dir === 'buy';
        // If ANY trade in this concurrent batch has 'win', harmonize them to win together
        const targetResult = activeSteeringTrades.some(t => t.target_result === 'win') ? 'win' : (primaryTrade.target_result || 'loss');

        targetDir = targetResult === 'win' ? (isUp ? 'up' : 'down') : (isUp ? 'down' : 'up');

        // Extract entry prices across all active trades in the batch
        const entryPrices = activeSteeringTrades
          .map(t => parseFloat(t.entry_price))
          .filter(p => isFinite(p) && p > 0);

        if (entryPrices.length > 0) {
          if (targetDir === 'down') {
            // Price must drop below ALL entry prices
            refEntryPrice = Math.min(...entryPrices);
          } else {
            // Price must rise above ALL entry prices
            refEntryPrice = Math.max(...entryPrices);
          }
        } else {
          refEntryPrice = parseFloat(primaryTrade.entry_price) || currentPrice;
        }
      }

      // Smooth progress from trade entry (elapsedRatio = 0.0) to expiry (elapsedRatio = 1.0)
      // Span across the latest expiry in the concurrent batch so multiple entries steer together until all finish
      const expirySec = Math.max(...activeSteeringTrades.map(t => Number(t.expiry_time) || 0));
      const durationSec = Math.max(5, Math.max(...activeSteeringTrades.map(t => Number(t.duration) || 60)));
      const timeLeft = expirySec - now;
      const elapsedSec = durationSec - Math.max(0, timeLeft);
      const elapsedRatio = Math.min(1.0, Math.max(0.0, elapsedSec / durationSec));

      activeRealSteeringTarget = {
        targetDir,
        entryPrice: refEntryPrice,
        timeLeft,
        elapsedRatio
      };
    }
  }

  // Initialize a new 5-second candle state when entering a new 5-second bucket
  if (!candleVolatilityStates[candleStateKey] || candleVolatilityStates[candleStateKey].start !== bucket5s) {
    // Decrement wave counter on candle completion
    if (candleVolatilityStates[candleStateKey]) {
      state.waveCandlesLeft--;
      if (state.waveCandlesLeft <= 0) {
        // Change Phase / Wave Type naturally!
        const r = Math.random();
        if (state.waveType === 'trend_up' || state.waveType === 'trend_down') {
          // After a trend, transition into a zigzag consolidation, range or reverse wave
          if (r < 0.45) {
            state.waveType = 'zigzag';
            state.waveDir = Math.random() < 0.5 ? 'up' : 'down';
            state.waveCandlesLeft = 3 + Math.floor(Math.random() * 5); // 3 to 7 candles of zigzag
          } else if (r < 0.80) {
            state.waveType = 'range';
            state.waveDir = 'range';
            state.waveCandlesLeft = 4 + Math.floor(Math.random() * 6); // 4 to 9 candles of range
          } else {
            // Reverse trend!
            state.waveType = state.waveType === 'trend_up' ? 'trend_down' : 'trend_up';
            state.waveDir = state.waveType === 'trend_up' ? 'up' : 'down';
            state.waveCandlesLeft = 4 + Math.floor(Math.random() * 8); // 4 to 11 candles of trend
          }
        } else {
          // From zigzag or range, breakout into a fresh trend or alternate phase
          if (r < 0.40) {
            state.waveType = 'trend_up';
            state.waveDir = 'up';
            state.waveCandlesLeft = 4 + Math.floor(Math.random() * 8);
          } else if (r < 0.80) {
            state.waveType = 'trend_down';
            state.waveDir = 'down';
            state.waveCandlesLeft = 4 + Math.floor(Math.random() * 8);
          } else {
            state.waveType = r < 0.90 ? 'zigzag' : 'range';
            state.waveDir = state.waveType === 'zigzag' ? (Math.random() < 0.5 ? 'up' : 'down') : 'range';
            state.waveCandlesLeft = state.waveType === 'zigzag' ? (3 + Math.floor(Math.random() * 4)) : (4 + Math.floor(Math.random() * 6));
          }
        }
      } else {
        // Within the current wave type/phase, handle micro-direction shifts if in zigzag
        if (state.waveType === 'zigzag') {
          state.waveDir = state.waveDir === 'up' ? 'down' : 'up';
        }
      }
    }

    const isOTC = pair.includes('(OTC)') || pair.includes('Crypto IDX') || pair.includes('IDX');
    const hasLiveTarget = m.targetPrice && m.targetPrice > 0 && !isOTC;

    let targetColor: 'green' | 'red' | 'doji' = 'green';

    if (activeRealSteeringTarget) {
      const { targetDir } = activeRealSteeringTarget;
      targetColor = targetDir === 'down' ? 'red' : 'green';
    } else if (hasLiveTarget && type === 'real') {
      // REAL MARKET DATA INTEGRATION:
      // If no active manipulation/steering is required, follow the REAL world price from Live API!
      const targetDiff = m.targetPrice! - currentPrice;
      const dec = (pair.includes('Crypto IDX') || pair.includes('BTC/') || pair.includes('ETH/')) ? 2 : 5;
      const epsilon = dec === 2 ? 0.01 : 0.00001;

      if (Math.abs(targetDiff) < epsilon) {
        targetColor = 'doji';
      } else {
        targetColor = targetDiff > 0 ? 'green' : 'red';
      }
    } else {
      // 100% ORGANIC SIMULATED MARKET FLOW (for OTC or when no live data is available):
      if (state.waveType === 'trend_up') {
        const roll = Math.random();
        targetColor = roll < 0.65 ? 'green' : (roll < 0.88 ? 'red' : 'doji');
      } else if (state.waveType === 'trend_down') {
        const roll = Math.random();
        targetColor = roll < 0.65 ? 'red' : (roll < 0.88 ? 'green' : 'doji');
      } else {
        // Enforce strict limits against repetitive streaks
        if (state.lastCandleColor === 'green') {
          if (state.consecutiveColorCount >= 3) {
            // 3 or more greens: guaranteed pullback or doji pause
            targetColor = Math.random() < 0.85 ? 'red' : 'doji';
          } else if (state.consecutiveColorCount === 2) {
            // 2 greens in a row: 60% chance of red pullback, 15% doji, 25% green
            const r = Math.random();
            targetColor = r < 0.60 ? 'red' : (r < 0.75 ? 'doji' : 'green');
          } else {
            // 1 green in a row: wave determines
            if (state.waveDir === 'up') {
              targetColor = Math.random() < 0.55 ? 'green' : (Math.random() < 0.85 ? 'red' : 'doji');
            } else if (state.waveDir === 'down') {
              targetColor = Math.random() < 0.60 ? 'red' : (Math.random() < 0.85 ? 'green' : 'doji');
            } else {
              targetColor = Math.random() < 0.45 ? 'red' : (Math.random() < 0.80 ? 'green' : 'doji');
            }
          }
        } else if (state.lastCandleColor === 'red') {
          if (state.consecutiveColorCount >= 3) {
            // 3 or more reds: guaranteed green bounce or doji pause
            targetColor = Math.random() < 0.85 ? 'green' : 'doji';
          } else if (state.consecutiveColorCount === 2) {
            // 2 reds in a row: 60% chance of green bounce, 15% doji, 25% red
            const r = Math.random();
            targetColor = r < 0.60 ? 'green' : (r < 0.75 ? 'doji' : 'red');
          } else {
            // 1 red in a row: wave determines
            if (state.waveDir === 'down') {
              targetColor = Math.random() < 0.55 ? 'red' : (Math.random() < 0.85 ? 'green' : 'doji');
            } else if (state.waveDir === 'up') {
              targetColor = Math.random() < 0.60 ? 'green' : (Math.random() < 0.85 ? 'red' : 'doji');
            } else {
              targetColor = Math.random() < 0.45 ? 'green' : (Math.random() < 0.80 ? 'red' : 'doji');
            }
          }
        } else {
          // Last was doji: fresh start
          targetColor = state.waveDir === 'up' ? 'green' : (state.waveDir === 'down' ? 'red' : (Math.random() < 0.5 ? 'green' : 'red'));
        }
      }
    }

    // Pattern archetype selection across all single and multi-candle types
    const pRoll = Math.random();
    let pType = 'standard';
    if (pRoll < 0.02) {
      pType = 'doji_four_price'; // Flat line (price unchanged)
      targetColor = 'doji';
    } else if (pRoll < 0.07) {
      pType = 'doji'; // Classic neutral Doji
      targetColor = 'doji';
    } else if (pRoll < 0.11) {
      pType = 'doji_dragonfly'; // Dragonfly Doji (long lower shadow rejection)
      targetColor = 'doji';
    } else if (pRoll < 0.15) {
      pType = 'doji_gravestone'; // Gravestone Doji (long upper shadow rejection)
      targetColor = 'doji';
    } else if (pRoll < 0.19) {
      pType = 'doji_long_legged'; // Long-legged Doji (extra long top & bottom wicks)
      targetColor = 'doji';
    } else if (targetColor === 'green' && pRoll < 0.28) {
      pType = 'hammer'; // Bullish rejection pinbar with long lower shadow
    } else if (targetColor === 'red' && pRoll < 0.28) {
      pType = 'shooting_star'; // Bearish rejection pinbar with long upper shadow
    } else if (pRoll < 0.35) {
      pType = targetColor === 'green' ? 'inverted_hammer' : 'hanging_man';
    } else if (pRoll < 0.42) {
      pType = 'spinning_top'; // Small/medium body with prominent balanced top & bottom wicks
    } else if (pRoll < 0.48) {
      pType = 'high_wave'; // Tiny body with extra-long upper and lower shadows
    } else if (pRoll < 0.58) {
      pType = 'small_body'; // Thin / small body with clear wicks
    } else if (pRoll < 0.76) {
      pType = 'standard'; // Classic standard candle with realistic wicks
    } else if (pRoll < 0.88) {
      pType = 'momentum_drive'; // Strong healthy momentum candle
    } else if (pRoll < 0.96) {
      pType = 'marubozu'; // Solid full body candle
    } else if (pRoll < 0.98) {
      pType = 'engulfing'; // Multi-candle engulfing structure
    } else {
      pType = 'harami';
    }

    // Dynamic body size calculation tailored for OTC physics (thin, medium, healthy large)
    const baseUnit = currentPrice * tickVol * (2.4 + Math.random() * 1.6);
    let sizeMultiplier = 1.0;
    
    // Natural market size distribution across the full spectrum:
    const sizeRoll = Math.random();
    if (state.waveType === 'trend_up' || state.waveType === 'trend_down') {
      const isTrendAligned = (state.waveType === 'trend_up' && targetColor === 'green') || (state.waveType === 'trend_down' && targetColor === 'red');
      if (isTrendAligned) {
        sizeMultiplier = 1.0 + Math.random() * 0.80; // Active trend candle (healthier)
      } else {
        sizeMultiplier = 0.35 + Math.random() * 0.45; // Small pullback/rejection
      }
    } else {
      if (sizeRoll < 0.20) {
        sizeMultiplier = 0.25 + Math.random() * 0.30; // Small / thin candle
      } else if (sizeRoll < 0.60) {
        sizeMultiplier = 0.55 + Math.random() * 0.45; // Medium active candle
      } else {
        sizeMultiplier = 0.95 + Math.random() * 0.65; // Healthy trend candle
      }
    }

    let targetBody = baseUnit * sizeMultiplier;
    let bypassPatternBody = false;

    if (hasLiveTarget && type === 'real' && !activeRealSteeringTarget) {
      // Use the actual price delta from real market data as our target body size
      targetBody = Math.abs(m.targetPrice! - currentPrice);
      bypassPatternBody = true;
    }
    
    if (!bypassPatternBody) {
      if (pType === 'doji_four_price') targetBody = 0;
      else if (pType === 'doji' || pType === 'doji_dragonfly' || pType === 'doji_gravestone' || pType === 'doji_long_legged') targetBody = baseUnit * (0.005 + Math.random() * 0.035);
      else if (pType === 'high_wave') targetBody = baseUnit * (0.10 + Math.random() * 0.12);
      else if (pType === 'small_body') targetBody = baseUnit * (0.18 + Math.random() * 0.16);
      else if (pType === 'spinning_top') targetBody = baseUnit * (0.22 + Math.random() * 0.18);
      else if (pType === 'hammer' || pType === 'shooting_star' || pType === 'inverted_hammer' || pType === 'hanging_man') targetBody = baseUnit * (0.25 + Math.random() * 0.20);
      else if (pType === 'standard') targetBody = baseUnit * (0.45 + Math.random() * 0.35);
      else if (pType === 'marubozu') targetBody = baseUnit * (0.90 + Math.random() * 0.40);
      else if (pType === 'momentum_drive' || pType === 'engulfing') targetBody = baseUnit * (1.05 + Math.random() * 0.45);
    }

    // Proportional authentic wicks: natural, clean, and characteristic of each candle archetype
    let lowerWickDepth = 0;
    let upperWickDepth = 0;

    if (pType === 'doji_four_price') {
      upperWickDepth = 0;
      lowerWickDepth = 0;
    } else if (pType === 'doji') {
      upperWickDepth = baseUnit * (0.45 + Math.random() * 0.40);
      lowerWickDepth = baseUnit * (0.45 + Math.random() * 0.40);
    } else if (pType === 'doji_dragonfly') {
      upperWickDepth = baseUnit * (0.01 + Math.random() * 0.03);
      lowerWickDepth = baseUnit * (0.85 + Math.random() * 0.60);
    } else if (pType === 'doji_gravestone') {
      upperWickDepth = baseUnit * (0.85 + Math.random() * 0.60);
      lowerWickDepth = baseUnit * (0.01 + Math.random() * 0.03);
    } else if (pType === 'doji_long_legged') {
      upperWickDepth = baseUnit * (0.80 + Math.random() * 0.60);
      lowerWickDepth = baseUnit * (0.80 + Math.random() * 0.60);
    } else if (pType === 'high_wave') {
      upperWickDepth = baseUnit * (0.90 + Math.random() * 0.70);
      lowerWickDepth = baseUnit * (0.90 + Math.random() * 0.70);
    } else if (pType === 'small_body') {
      upperWickDepth = baseUnit * (0.20 + Math.random() * 0.25);
      lowerWickDepth = baseUnit * (0.20 + Math.random() * 0.25);
    } else if (pType === 'hammer' || pType === 'hanging_man') {
      lowerWickDepth = baseUnit * (0.85 + Math.random() * 0.65);
      upperWickDepth = baseUnit * (0.02 + Math.random() * 0.10);
    } else if (pType === 'shooting_star' || pType === 'inverted_hammer') {
      upperWickDepth = baseUnit * (0.85 + Math.random() * 0.65);
      lowerWickDepth = baseUnit * (0.02 + Math.random() * 0.10);
    } else if (pType === 'spinning_top') {
      upperWickDepth = baseUnit * (0.45 + Math.random() * 0.35);
      lowerWickDepth = baseUnit * (0.45 + Math.random() * 0.35);
    } else if (pType === 'marubozu') {
      // Marubozu has almost zero wicks
      lowerWickDepth = Math.random() < 0.8 ? 0 : baseUnit * (0.002 + Math.random() * 0.005);
      upperWickDepth = Math.random() < 0.8 ? 0 : baseUnit * (0.002 + Math.random() * 0.005);
    } else if (pType === 'momentum_drive' || pType === 'engulfing') {
      // Momentum candles have small wicks
      if (targetColor === 'green') {
        lowerWickDepth = baseUnit * (0.01 + Math.random() * 0.03);
        upperWickDepth = baseUnit * (0.03 + Math.random() * 0.05);
      } else {
        upperWickDepth = baseUnit * (0.01 + Math.random() * 0.03);
        lowerWickDepth = baseUnit * (0.03 + Math.random() * 0.05);
      }
    } else {
      // Standard candle wicks: natural, more professional small wicks (5% to 15% of body)
      const wickMult = Math.random() < 0.2 ? 0.02 : (0.05 + Math.random() * 0.10);
      upperWickDepth = targetBody * wickMult;
      lowerWickDepth = targetBody * wickMult;
    }

    const openPrice = currentPrice;
    let targetClose = openPrice;
    if (targetColor === 'green') targetClose = openPrice + targetBody;
    else if (targetColor === 'red') targetClose = openPrice - targetBody;
    else targetClose = openPrice + (Math.random() - 0.5) * baseUnit * 0.12;

    // Direct targetClose calculation for active trade steering:
    // Natural continuous offset from entry price without last-minute sudden changes
    if (activeRealSteeringTarget) {
      const { targetDir, entryPrice, elapsedRatio } = activeRealSteeringTarget;
      const dec = (pair.includes('Crypto IDX') || pair.includes('BTC/') || pair.includes('ETH/')) ? 2 : 5;
      const minPips = Math.max(entryPrice * 0.00018, dec === 2 ? 0.08 : 0.00012);

      // Consistent margin established from trade start
      const targetOffset = minPips * (1.0 + 0.5 * elapsedRatio);

      if (targetDir === 'down') {
        const targetLevel = entryPrice - targetOffset;
        targetClose = Math.min(targetClose, targetLevel);
      } else {
        const targetLevel = entryPrice + targetOffset;
        targetClose = Math.max(targetClose, targetLevel);
      }
    }

    // Admin Pressure / Manipulation support (APPLIES EXCLUSIVELY TO REAL ACCOUNTS)
    let adminBias = 0;
    if (type === 'real') {
      const exposureKey = `${pair}_real`;
      const exposure = tradeExposureCache.get(exposureKey) || 0;
      const manipExposure = manipulatedExposureCache.get(exposureKey) || 0;
      
      // A. Global Manipulation overrides
      if (globalManipulationMode === 'always_loss') {
        adminBias = exposure > 0 ? -0.00018 : 0.00018;
      } else if (globalManipulationMode === 'always_win') {
        adminBias = exposure > 0 ? 0.00018 : -0.00018;
      }

      // B. User-Specific Manipulation override (manipExposure is set via admin panel per user)
      if (manipExposure !== 0) {
        adminBias += manipExposure > 0 ? 0.00025 : -0.00025;
      }

      // C. Specific Pair-Level Manipulation set from Admin Market Architect Card
      if (m.manipulation && m.manipulation.enabled) {
        const manipMode = m.manipulation.mode;
        if (manipMode === 'always_loss') {
          adminBias += exposure > 0 ? -0.00022 : 0.00022;
        } else if (manipMode === 'always_win') {
          adminBias += exposure > 0 ? 0.00022 : -0.00022;
        } else if (manipMode === 'percentage') {
          const trend = m.manipulation.targetTrend;
          if (trend === 'up') {
            adminBias += 0.00030; // Strong upward trajectory!
          } else if (trend === 'down') {
            adminBias += -0.00030; // Strong downward trajectory!
          }
        } else if (manipMode === 'smart_house') {
          // Pushes against net trade exposure
          adminBias += exposure > 0 ? -0.00025 : 0.00025;
        }
      }

      // D. Market Pressure Slider slider (-100 to 100)
      if (m.pressure) {
        // High impact slider movement
        adminBias += (m.pressure / 100) * 0.00035;
      }
      
      targetClose += (adminBias * currentPrice * 10);
    }

    candleVolatilityStates[candleStateKey] = {
      start: bucket5s,
      targetColor,
      pType,
      openPrice,
      targetClose,
      targetBody,
      baseUnit,
      lowerWickDepth,
      upperWickDepth,
      highTarget: Math.max(openPrice, targetClose) + upperWickDepth,
      lowTarget: Math.min(openPrice, targetClose) - lowerWickDepth
    };
    
    // Smoothly cap wick targets if steering is active, so candles never cross entry level during the trade
    if (activeRealSteeringTarget) {
      const { targetDir, entryPrice, elapsedRatio } = activeRealSteeringTarget;
      const dec = (pair.includes('Crypto IDX') || pair.includes('BTC/') || pair.includes('ETH/')) ? 2 : 5;
      const minPips = Math.max(entryPrice * 0.00018, dec === 2 ? 0.08 : 0.00012);
      const safeMargin = minPips * (0.6 + 0.4 * elapsedRatio);
      
      if (targetDir === 'down') {
         const absoluteCeiling = entryPrice - safeMargin;
         candleVolatilityStates[candleStateKey].highTarget = Math.min(candleVolatilityStates[candleStateKey].highTarget, absoluteCeiling);
         candleVolatilityStates[candleStateKey].targetClose = Math.min(candleVolatilityStates[candleStateKey].targetClose, absoluteCeiling);
      } else {
         const absoluteFloor = entryPrice + safeMargin;
         candleVolatilityStates[candleStateKey].lowTarget = Math.max(candleVolatilityStates[candleStateKey].lowTarget, absoluteFloor);
         candleVolatilityStates[candleStateKey].targetClose = Math.max(candleVolatilityStates[candleStateKey].targetClose, absoluteFloor);
      }
    }
  }

  const cState = candleVolatilityStates[candleStateKey];

  // Dynamically steer active candle target on every tick (even if trade entered mid-candle)
  if (activeRealSteeringTarget && cState) {
    const { targetDir, entryPrice, elapsedRatio } = activeRealSteeringTarget;
    const dec = (pair.includes('Crypto IDX') || pair.includes('BTC/') || pair.includes('ETH/')) ? 2 : 5;
    const minPips = Math.max(entryPrice * 0.00018, dec === 2 ? 0.08 : 0.00012);
    const safeMargin = minPips * (0.6 + 0.4 * elapsedRatio);

    if (targetDir === 'down') {
       const absoluteCeiling = entryPrice - safeMargin;
       if (cState.targetClose > absoluteCeiling) {
         cState.targetClose = absoluteCeiling;
       }
       if (cState.highTarget > absoluteCeiling) {
         cState.highTarget = absoluteCeiling;
       }
    } else {
       const absoluteFloor = entryPrice + safeMargin;
       if (cState.targetClose < absoluteFloor) {
         cState.targetClose = absoluteFloor;
       }
       if (cState.lowTarget < absoluteFloor) {
         cState.lowTarget = absoluteFloor;
       }
    }
  }

  // Intra-candle progression (0.0 to 1.0 across the 5 seconds)
  const currentNowMs = nowMs || (now * 1000 + (Date.now() % 1000));
  const elapsedMs = Math.max(0, Math.min(5000, currentNowMs - (bucket5s * 1000)));
  const progress = elapsedMs / 5000; // 0.0 to 1.0

  const candleOpen = cState.openPrice;
  const candleClose = cState.targetClose;
  const highTarget = cState.highTarget;
  const lowTarget = cState.lowTarget;

  // 1. Quotex-style dynamic price micro-thrusts (dhap diye uthbe, dhap diye nambe - snappy staircase impulses)
  const burstCount = 6;
  const burstCycle = progress * burstCount;
  const burstIndex = Math.floor(burstCycle);
  const burstProgress = burstCycle - burstIndex;
  // Snappy ease: quick jump in first 40% of micro-interval, followed by slight consolidation
  const microSnap = Math.min(1.0, burstProgress * 2.2);
  const quantizedProgress = (burstIndex + microSnap) / burstCount;
  const blendedProgress = progress * 0.35 + quantizedProgress * 0.65;

  const smoothCurve = (1 - Math.cos(blendedProgress * Math.PI)) / 2;
  let basePriceAtProgress = candleOpen + (candleClose - candleOpen) * smoothCurve;

  // 2. Continuous Two-Phase Shadow Development (Forms real upper & lower wicks smoothly without jumping):
  const pType = cState.pType || 'standard';

  // Phase 1 (0% to 35%): Smooth probe in opposite direction creating the initial wick cleanly
  if (progress < 0.35) {
    let probeFactor = 0.25; // Reduced default probe
    if (pType === 'hammer' || pType === 'hanging_man') probeFactor = 0.85;
    else if (pType === 'doji' || pType === 'doji_dragonfly' || pType === 'doji_long_legged') probeFactor = 0.80;
    else if (pType === 'spinning_top' || pType === 'high_wave') probeFactor = 0.70;
    else if (pType === 'small_body') probeFactor = 0.40;
    else if (pType === 'standard') probeFactor = 0.15; // Standard candles probe much less
    else if (pType === 'shooting_star' || pType === 'inverted_hammer') probeFactor = 0.10;
    else if (pType === 'marubozu' || pType === 'momentum_drive') probeFactor = 0.02;

    if (probeFactor > 0) {
      const probeWave = Math.sin((progress / 0.35) * Math.PI); // Smooth curve: 0 -> 1 -> 0
      if (cState.targetColor === 'green') {
        const lowerExcursion = (candleOpen - lowTarget) * probeFactor;
        basePriceAtProgress -= lowerExcursion * probeWave;
      } else if (cState.targetColor === 'red') {
        const upperExcursion = (highTarget - candleOpen) * probeFactor;
        basePriceAtProgress += upperExcursion * probeWave;
      } else {
        const lowerExcursion = (candleOpen - lowTarget) * probeFactor;
        basePriceAtProgress -= lowerExcursion * probeWave;
      }
    }
  }

  // Phase 2 (35% to 100%): Drive to peak at ~68% creating rejection shadow, settling smoothly to targetClose
  if (progress >= 0.35 && progress <= 1.0) {
    let peakFactor = 0.25; // Reduced default peak
    if (pType === 'shooting_star' || pType === 'inverted_hammer') peakFactor = 0.85;
    else if (pType === 'doji' || pType === 'doji_gravestone' || pType === 'doji_long_legged') peakFactor = 0.80;
    else if (pType === 'spinning_top' || pType === 'high_wave') peakFactor = 0.70;
    else if (pType === 'small_body') peakFactor = 0.40;
    else if (pType === 'standard') peakFactor = 0.15; // Standard candles peak much less
    else if (pType === 'hammer' || pType === 'hanging_man') peakFactor = 0.10;
    else if (pType === 'marubozu' || pType === 'momentum_drive') peakFactor = 0.02;

    if (peakFactor > 0) {
      const peakWave = Math.sin(((progress - 0.35) / 0.65) * Math.PI); // Smooth curve: 0 -> 1 at ~0.675 -> 0 at 1.0
      if (cState.targetColor === 'green') {
        const upperExcursion = (highTarget - candleClose) * peakFactor;
        basePriceAtProgress += upperExcursion * peakWave;
      } else if (cState.targetColor === 'red') {
        const lowerExcursion = (candleClose - lowTarget) * peakFactor;
        basePriceAtProgress -= lowerExcursion * peakWave;
      } else {
        const upperExcursion = (highTarget - candleOpen) * peakFactor;
        basePriceAtProgress += upperExcursion * peakWave;
      }
    }
  }

  // Consistent steering guard: keeps price smoothly and securely on target side throughout trade duration
  if (activeRealSteeringTarget) {
    const { targetDir, entryPrice, elapsedRatio } = activeRealSteeringTarget;
    const dec = (pair.includes('Crypto IDX') || pair.includes('BTC/') || pair.includes('ETH/')) ? 2 : 5;
    const minPips = Math.max(entryPrice * 0.00018, dec === 2 ? 0.08 : 0.00012);
    const safeMargin = minPips * (0.6 + 0.4 * elapsedRatio);

    if (targetDir === 'down') {
      basePriceAtProgress = Math.min(basePriceAtProgress, entryPrice - safeMargin);
    } else {
      basePriceAtProgress = Math.max(basePriceAtProgress, entryPrice + safeMargin);
    }
  }

  // Fine-tuned Quotex OTC tick impulse with high-speed micro-bursts (dhap diye up/down jumps)
  const noiseKey = `${pair}_${type}`;
  const prevNoise = noiseOffsets.get(noiseKey) || 0;
  
  const impulseRoll = Math.random();
  let impulseStep = (Math.random() - 0.5) * tickVol * currentPrice * 0.08;
  if (impulseRoll < 0.15) {
    // 15% chance of a sharp fast burst in price
    const burstDir = Math.random() < 0.5 ? 1 : -1;
    impulseStep += burstDir * tickVol * currentPrice * (0.12 + Math.random() * 0.22);
  }
  const tickNoise = prevNoise * smoothness + impulseStep;
  noiseOffsets.set(noiseKey, tickNoise);

  let rawNewPrice = basePriceAtProgress + tickNoise;
  let newPrice = currentPrice * 0.08 + rawNewPrice * 0.92;

  const isCrypto = pair.includes('/') && !pair.includes('(OTC)') && !pair.includes('Crypto IDX');
  if (isCrypto && m.targetPrice && m.targetPrice > 0 && !activeRealSteeringTarget) {
    newPrice = m.targetPrice;
  }

  // Strict positive sanity check (multiplicative dynamics naturally stay positive)
  if (newPrice <= 0.00000001 || !isFinite(newPrice)) {
    newPrice = Number(markets[pair]?.price) || 100.00;
  }

  // Decimal formatting based on asset archetype
  let decimals = 5;
  if (pair.includes('SHIB') || pair.includes('PEPE') || pair.includes('BONK') || pair.includes('RSR') || pair.includes('FLOKI')) {
    decimals = 8;
  } else if (pair.includes('Crypto IDX') || pair.includes('BTC/') || pair.includes('ETH/') || pair.includes('US 30') || pair.includes('JPN 225')) {
    decimals = 2;
  } else if (pair.includes('/JPY')) {
    decimals = 3;
  } else if (pair.includes('Gold') || pair.includes('Oil') || pair.includes('Apple') || pair.includes('Tesla') || pair.includes('Google')) {
    decimals = 2;
  }

  newPrice = Number(newPrice.toFixed(decimals));
  m.price = newPrice;

  const priceUnit = currentPrice * tickVol * 25;

  // Update all timeframes
  for (const tf of TIMEFRAMES) {
    const tfSeconds = timeframeSecondsMap[tf];
    const bucketTime = now - (now % tfSeconds);
    if (!candlePool[pair]) candlePool[pair] = {};
    let activeCandle = candlePool[pair][tf];

    if (!activeCandle) {
      const prevHist = historyPool[pair]?.[tf];
      const prevClose = (Array.isArray(prevHist) && prevHist.length > 0) ? prevHist[prevHist.length - 1].close : newPrice;
      const initialPattern = tf === '5 seconds' ? (cState?.pType || 'standard') : pickTimeframePattern(pair);
      candlePool[pair][tf] = {
        open: prevClose,
        high: Math.max(prevClose, newPrice),
        low: Math.min(prevClose, newPrice),
        close: newPrice,
        volume: Math.random() * 20 + 5,
        openTime: bucketTime,
        closeTime: bucketTime + tfSeconds,
        patternType: initialPattern
      };
      saveCandleToDB_v2(pair, type, tf, candlePool[pair][tf]);
    } else if (bucketTime > activeCandle.openTime) {
      if (!historyPool[pair]) historyPool[pair] = {};
      if (!historyPool[pair][tf]) historyPool[pair][tf] = [];

      let prevCompletedClose = activeCandle.close;
      let currOpenTime = activeCandle.openTime;

      // Handle candle completion and bridge any time gaps smoothly
      while (currOpenTime < bucketTime) {
        const nextBucketTime = currOpenTime + tfSeconds;
        const completed = {
          open: activeCandle.open,
          high: activeCandle.high,
          low: activeCandle.low,
          close: activeCandle.close,
          volume: activeCandle.volume,
          openTime: currOpenTime,
          closeTime: nextBucketTime,
          patternType: activeCandle.patternType || 'standard'
        };

        capCandleWicks(completed, tf, priceUnit, completed.patternType, pair);
        saveCandleToDB_v2(pair, type, tf, completed);

        if (tf === "5 seconds") {
          const color = completed.close > completed.open ? 'green' : (completed.close < completed.open ? 'red' : 'doji');
          if (color === state.lastCandleColor && color !== 'doji') {
            state.consecutiveColorCount++;
          } else {
            state.consecutiveColorCount = 1;
            state.lastCandleColor = color;
          }
        }

        const historyRow = {
          time: completed.openTime,
          open: completed.open,
          high: completed.high,
          low: completed.low,
          close: completed.close,
          volume: completed.volume,
          openTime: completed.openTime,
          closeTime: completed.closeTime
        };

        historyPool[pair][tf].push(historyRow);
        if (historyPool[pair][tf].length > 50000) {
          historyPool[pair][tf] = historyPool[pair][tf].slice(-50000);
        }

        try {
          const isCrypto = pair.includes('/') && !pair.includes('(OTC)') && !pair.includes('Crypto IDX');
          if (!(isCrypto && tf !== "5 seconds")) {
            getIO().to(`market_${pair}_real`).to(`market_${pair}_demo`).emit('candle_complete', { pair, timeframe: tf, candle: historyRow });
          }
        } catch(e) {}

        prevCompletedClose = completed.close;
        currOpenTime = nextBucketTime;

        if (currOpenTime < bucketTime) {
          activeCandle = {
            open: prevCompletedClose,
            high: prevCompletedClose,
            low: prevCompletedClose,
            close: prevCompletedClose,
            volume: Math.random() * 20 + 5,
            openTime: currOpenTime,
            closeTime: currOpenTime + tfSeconds,
            patternType: pickTimeframePattern(pair)
          };
        }
      }

      // New active candle starts precisely at previous close
      const newPattern = tf === '5 seconds' ? (cState?.pType || 'standard') : pickTimeframePattern(pair);
      candlePool[pair][tf] = {
        open: prevCompletedClose,
        high: Math.max(prevCompletedClose, newPrice),
        low: Math.min(prevCompletedClose, newPrice),
        close: newPrice,
        volume: Math.random() * 20 + 5,
        openTime: bucketTime,
        closeTime: bucketTime + tfSeconds,
        patternType: newPattern
      };
      saveCandleToDB_v2(pair, type, tf, candlePool[pair][tf]);
    } else {
      activeCandle.close = newPrice;
      activeCandle.high = Math.max(activeCandle.high, newPrice);
      activeCandle.low = Math.min(activeCandle.low, newPrice);
      activeCandle.volume += Math.random() * 2;
      if (!activeCandle.patternType) {
        activeCandle.patternType = tf === '5 seconds' ? (cState?.pType || 'standard') : pickTimeframePattern(pair);
      }
      capCandleWicks(activeCandle, tf, priceUnit, activeCandle.patternType, pair);
      saveCandleToDB_v2(pair, type, tf, activeCandle);
    }
  }

  const active5s = candlePool[pair]?.["5 seconds"];
  return {
    price: newPrice,
    time: now,
    candle: active5s ? {
      time: active5s.openTime,
      open: active5s.open,
      high: active5s.high,
      low: active5s.low,
      close: active5s.close,
      volume: active5s.volume
    } : null
  };
}
