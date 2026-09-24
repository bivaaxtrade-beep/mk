import { describe, it, expect } from 'vitest';
import { 
  SUPPORTED_TIMEFRAMES, 
  TIMEFRAME_SECONDS_MAP, 
  getTimeframeSeconds, 
  formatTimeframeLabel,
  aggregateCandlesToTimeframe,
  updateFormingCandle,
  CandleData
} from '../services/timeframeAggregationEngine.ts';
import { 
  calculateCandleMetrics, 
  validateOHLC, 
  generateSingleCandleOHLC, 
  generateHistoricalCandleSeries 
} from '../services/candlestickEngine.ts';
import { 
  stepPriceProcess, 
  getOrCreatePairPriceState 
} from '../services/priceEngine.ts';

describe('Binomo-Style Multi-Timeframe & Realistic OHLC Engine Tests', () => {

  it('should support all 13 required timeframes with exact seconds', () => {
    const expectedTfs = [
      { tf: "5 seconds", sec: 5 },
      { tf: "10 seconds", sec: 10 },
      { tf: "15 seconds", sec: 15 },
      { tf: "30 seconds", sec: 30 },
      { tf: "1 minute", sec: 60 },
      { tf: "5 minutes", sec: 300 },
      { tf: "10 minutes", sec: 600 },
      { tf: "15 minutes", sec: 900 },
      { tf: "30 minutes", sec: 1800 },
      { tf: "1 hour", sec: 3600 },
      { tf: "3 hours", sec: 10800 },
      { tf: "12 hours", sec: 43200 },
      { tf: "1 day", sec: 86400 }
    ];

    expect(SUPPORTED_TIMEFRAMES.length).toBe(13);
    for (const item of expectedTfs) {
      expect(SUPPORTED_TIMEFRAMES.includes(item.tf as any)).toBe(true);
      expect(TIMEFRAME_SECONDS_MAP[item.tf]).toBe(item.sec);
      expect(getTimeframeSeconds(item.tf)).toBe(item.sec);
    }
  });

  it('should accurately calculate all geometric OHLC candle metrics', () => {
    const bullCandle = { open: 100, high: 110, low: 95, close: 105 };
    const bullMetrics = calculateCandleMetrics(bullCandle);

    expect(bullMetrics.bodySize).toBe(5); // |105 - 100|
    expect(bullMetrics.upperWick).toBe(5); // 110 - max(100, 105)
    expect(bullMetrics.lowerWick).toBe(5); // min(100, 105) - 95
    expect(bullMetrics.candleRange).toBe(15); // 110 - 95
    expect(bullMetrics.isBullish).toBe(true);
    expect(bullMetrics.isBearish).toBe(false);

    const bearCandle = { open: 110, high: 115, low: 90, close: 95 };
    const bearMetrics = calculateCandleMetrics(bearCandle);

    expect(bearMetrics.bodySize).toBe(15); // |95 - 110|
    expect(bearMetrics.upperWick).toBe(5); // 115 - 110
    expect(bearMetrics.lowerWick).toBe(5); // 95 - 90
    expect(bearMetrics.candleRange).toBe(25); // 115 - 90
    expect(bearMetrics.isBullish).toBe(false);
    expect(bearMetrics.isBearish).toBe(true);
  });

  it('should enforce strict OHLC invariants on any raw or mutated candle', () => {
    // Distorted candle with high lower than open
    const invalid = { open: 100, high: 90, low: 105, close: 98 };
    const valid = validateOHLC(invalid);

    expect(valid.high).toBeGreaterThanOrEqual(Math.max(valid.open, valid.close));
    expect(valid.low).toBeLessThanOrEqual(Math.min(valid.open, valid.close));
    expect(valid.high).toBeGreaterThanOrEqual(valid.low);
  });

  it('should aggregate base 5s candles into higher timeframes with 100% mathematical consistency', () => {
    // Generate 60 5s candles aligned to 300s (representing 5 minutes total)
    const base5s: CandleData[] = [];
    let currentPrice = 1.08500;
    const baseTime = 1700000100 - (1700000100 % 300); // Aligned to 5m and 1m boundaries

    for (let i = 0; i < 60; i++) {
      const open = currentPrice;
      const move = (Math.random() - 0.49) * 0.00030;
      const close = open + move;
      const high = Math.max(open, close) + Math.random() * 0.00010;
      const low = Math.min(open, close) - Math.random() * 0.00010;
      
      base5s.push({
        time: baseTime + i * 5,
        open,
        high,
        low,
        close,
        volume: 20
      });
      currentPrice = close;
    }

    // 1. Aggregate to 1 minute (60s)
    const agg1m = aggregateCandlesToTimeframe(base5s, 60, 5);
    expect(agg1m.length).toBe(5); // 60 5s candles = 5 1m candles

    // For each 1m candle, verify that open is the first 5s open and close is the 12th 5s close
    for (let m = 0; m < 5; m++) {
      const slice5s = base5s.slice(m * 12, (m + 1) * 12);
      const expectedOpen = slice5s[0].open;
      const expectedClose = slice5s[slice5s.length - 1].close;
      const expectedHigh = Math.max(...slice5s.map(c => c.high));
      const expectedLow = Math.min(...slice5s.map(c => c.low));

      expect(agg1m[m].open).toBeCloseTo(expectedOpen, 5);
      expect(agg1m[m].close).toBeCloseTo(expectedClose, 5);
      expect(agg1m[m].high).toBeCloseTo(expectedHigh, 5);
      expect(agg1m[m].low).toBeCloseTo(expectedLow, 5);
    }

    // 2. Aggregate to 5 minutes (300s)
    const agg5m = aggregateCandlesToTimeframe(base5s, 300, 5);
    expect(agg5m.length).toBe(1);
    expect(agg5m[0].open).toBeCloseTo(base5s[0].open, 5);
    expect(agg5m[0].close).toBeCloseTo(base5s[base5s.length - 1].close, 5);
    expect(agg5m[0].high).toBeCloseTo(Math.max(...base5s.map(c => c.high)), 5);
    expect(agg5m[0].low).toBeCloseTo(Math.min(...base5s.map(c => c.low)), 5);
  });

  it('should run continuous price process across multiple phases without mathematical drift or collapse', () => {
    const pair = 'Crypto IDX';
    let price = 5400.00;
    const startMs = 1700000000000;

    for (let i = 0; i < 500; i++) {
      const step = stepPriceProcess(pair, price, startMs + i * 100);
      expect(Number.isFinite(step.price)).toBe(true);
      expect(step.price).toBeGreaterThan(0);
      price = step.price;
    }
  });

});
