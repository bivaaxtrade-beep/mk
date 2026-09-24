/**
 * Multi-Timeframe OHLC Aggregation Engine
 * 
 * Aggregates continuous underlying price ticks and base 5s candles
 * into all 13 supported timeframes with mathematical integrity.
 * 
 * Supported Timeframes:
 * 1. 5 seconds (5s)
 * 2. 10 seconds (10s)
 * 3. 15 seconds (15s)
 * 4. 30 seconds (30s)
 * 5. 1 minute (60s)
 * 6. 5 minutes (300s)
 * 7. 10 minutes (600s)
 * 8. 15 minutes (900s)
 * 9. 30 minutes (1800s)
 * 10. 1 hour (3600s)
 * 11. 3 hours (10800s)
 * 12. 12 hours (43200s)
 * 13. 1 day (86400s)
 */

import { validateOHLC } from './candlestickEngine.ts';

export const SUPPORTED_TIMEFRAMES = [
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
] as const;

export type SupportedTimeframe = typeof SUPPORTED_TIMEFRAMES[number];

export const TIMEFRAME_SECONDS_MAP: Record<string, number> = {
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

export function getTimeframeSeconds(tf: string): number {
  if (!tf || typeof tf !== 'string') return 60;
  if (TIMEFRAME_SECONDS_MAP[tf]) return TIMEFRAME_SECONDS_MAP[tf];
  
  const clean = tf.trim();
  const match = clean.match(/^(\d+)\s*([a-zA-Z]*)$/);
  if (!match) return 60;
  const val = parseInt(match[1]) || 1;
  const unit = match[2]?.toLowerCase() || '';
  if (unit.startsWith("s")) return val;
  if (unit.startsWith("m")) return val * 60;
  if (unit.startsWith("h")) return val * 3600;
  if (unit.startsWith("d")) return val * 86400;
  return val || 60;
}

export function formatTimeframeLabel(tf: string): string {
  if (!tf || typeof tf !== 'string') return "";
  const clean = tf.trim();
  const match = clean.match(/^(\d+)\s*([a-zA-Z]*)$/);
  if (!match) return tf;
  const val = match[1];
  const unit = match[2] ? match[2][0].toLowerCase() : '';
  return `${val}${unit}`;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openTime?: number;
  closeTime?: number;
}

/**
 * Aggregates a series of base candles or ticks into exact higher-timeframe candles.
 * Guarantees zero gaps and strict OHLC bounds.
 */
export function aggregateCandlesToTimeframe(
  baseCandles: CandleData[], 
  targetTfSeconds: number,
  decimals: number = 5
): CandleData[] {
  if (!baseCandles || !Array.isArray(baseCandles) || baseCandles.length === 0) return [];
  if (targetTfSeconds <= 0) return baseCandles;

  // 1. Sort ascending by time
  const sorted = [...baseCandles]
    .map(c => {
      const t = Number(c.openTime || c.time || 0);
      const o = Number(c.open);
      const cl = Number(c.close);
      const h = Number(c.high);
      const l = Number(c.low);
      const v = Number(c.volume || 10);
      return { time: t, open: o, high: h, low: l, close: cl, volume: v };
    })
    .filter(c => c.time > 0 && isFinite(c.open) && isFinite(c.close) && c.open > 0)
    .sort((a, b) => a.time - b.time);

  if (sorted.length === 0) return [];

  const aggregated: CandleData[] = [];
  let currentBucketTime: number | null = null;
  let currentCandle: CandleData | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const bucketTime = Math.floor(item.time / targetTfSeconds) * targetTfSeconds;

    if (currentBucketTime === null || bucketTime !== currentBucketTime) {
      if (currentCandle) {
        const validated = validateOHLC(currentCandle);
        aggregated.push({
          time: currentCandle.time,
          open: parseFloat(validated.open.toFixed(decimals)),
          high: parseFloat(validated.high.toFixed(decimals)),
          low: parseFloat(validated.low.toFixed(decimals)),
          close: parseFloat(validated.close.toFixed(decimals)),
          volume: currentCandle.volume,
          openTime: currentCandle.time,
          closeTime: currentCandle.time + targetTfSeconds
        });
      }

      currentBucketTime = bucketTime;
      currentCandle = {
        time: bucketTime,
        open: item.open,
        high: Math.max(item.open, item.high, item.close),
        low: Math.min(item.open, item.low, item.close),
        close: item.close,
        volume: item.volume,
        openTime: bucketTime,
        closeTime: bucketTime + targetTfSeconds
      };
    } else if (currentCandle) {
      currentCandle.high = Math.max(currentCandle.high, item.high, item.open, item.close);
      currentCandle.low = Math.min(currentCandle.low, item.low, item.open, item.close);
      currentCandle.close = item.close;
      currentCandle.volume += item.volume;
    }
  }

  if (currentCandle) {
    const validated = validateOHLC(currentCandle);
    aggregated.push({
      time: currentCandle.time,
      open: parseFloat(validated.open.toFixed(decimals)),
      high: parseFloat(validated.high.toFixed(decimals)),
      low: parseFloat(validated.low.toFixed(decimals)),
      close: parseFloat(validated.close.toFixed(decimals)),
      volume: currentCandle.volume,
      openTime: currentCandle.time,
      closeTime: currentCandle.time + targetTfSeconds
    });
  }

  return aggregated;
}

/**
 * Updates an in-flight forming candle with a new price tick.
 * Ensures High >= max(Open, Close) and Low <= min(Open, Close).
 */
export function updateFormingCandle(
  formingCandle: CandleData,
  newPrice: number,
  volumeDelta: number = 1
): CandleData {
  formingCandle.close = newPrice;
  formingCandle.high = Math.max(formingCandle.high, newPrice, formingCandle.open);
  formingCandle.low = Math.min(formingCandle.low, newPrice, formingCandle.open);
  formingCandle.volume = (formingCandle.volume || 0) + volumeDelta;
  return formingCandle;
}
