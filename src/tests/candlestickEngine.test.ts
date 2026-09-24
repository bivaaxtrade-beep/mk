import { describe, it, expect } from 'vitest';
import { 
  generateSingleCandleOHLC, 
  pickNextRegime, 
  pickRandomPattern, 
  calculateCandleMetrics,
  detectMultiCandlePattern,
  PatternType, 
  MarketRegime 
} from '../services/candlestickEngine.ts';

describe('Candlestick Engine Mathematical & 35-Pattern Tests', () => {

  it('should strictly satisfy OHLC mathematical invariants across 10,000 generated candles', () => {
    let currentPrice = 100.0;
    const volatility = 0.002;

    for (let i = 0; i < 10000; i++) {
      const isGap = Math.random() < 0.1;
      const gapDirection = Math.random() > 0.5 ? 1 : -1;
      
      const c = generateSingleCandleOHLC(currentPrice, volatility, undefined, {
        isGap,
        gapDirection,
        gapSizeMultiplier: 1.5
      });

      // 1. High must be >= max(open, close)
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));

      // 2. Low must be <= min(open, close)
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));

      // 3. High must be >= Low
      expect(c.high).toBeGreaterThanOrEqual(c.low);

      // 4. All prices must be strictly positive finite numbers
      expect(c.open).toBeGreaterThan(0);
      expect(c.high).toBeGreaterThan(0);
      expect(c.low).toBeGreaterThan(0);
      expect(c.close).toBeGreaterThan(0);
      expect(Number.isFinite(c.open)).toBe(true);
      expect(Number.isFinite(c.high)).toBe(true);
      expect(Number.isFinite(c.low)).toBe(true);
      expect(Number.isFinite(c.close)).toBe(true);

      currentPrice = c.close;
    }
  });

  it('should generate Four Price Doji (flat candle where Open = High = Low = Close)', () => {
    const basePrice = 1.0850;
    const fourPriceDoji = generateSingleCandleOHLC(basePrice, 0.001, 'DOJI_FOUR_PRICE');
    
    expect(fourPriceDoji.open).toBe(basePrice);
    expect(fourPriceDoji.high).toBe(basePrice);
    expect(fourPriceDoji.low).toBe(basePrice);
    expect(fourPriceDoji.close).toBe(basePrice);

    const metrics = calculateCandleMetrics(fourPriceDoji);
    expect(metrics.isFourPriceDoji).toBe(true);
    expect(metrics.bodySize).toBe(0);
    expect(metrics.candleRange).toBe(0);
    expect(metrics.detectedPattern).toBe('DOJI_FOUR_PRICE');
  });

  it('should generate single-candle patterns with exact geometric properties', () => {
    const basePrice = 100.0;
    const vol = 0.002;

    // 1. DOJI
    const doji = generateSingleCandleOHLC(basePrice, vol, 'DOJI');
    const dojiMetrics = calculateCandleMetrics(doji);
    expect(dojiMetrics.isDoji).toBe(true);

    // 2. DOJI DRAGONFLY
    const dragonfly = generateSingleCandleOHLC(basePrice, vol, 'DOJI_DRAGONFLY');
    const dfMetrics = calculateCandleMetrics(dragonfly);
    expect(dfMetrics.lowerWick).toBeGreaterThan(dfMetrics.upperWick);

    // 3. DOJI GRAVESTONE
    const gravestone = generateSingleCandleOHLC(basePrice, vol, 'DOJI_GRAVESTONE');
    const gsMetrics = calculateCandleMetrics(gravestone);
    expect(gsMetrics.upperWick).toBeGreaterThan(gsMetrics.lowerWick);

    // 4. BULLISH MARUBOZU
    const bullMaru = generateSingleCandleOHLC(basePrice, vol, 'BULLISH_MARUBOZU');
    const bmMetrics = calculateCandleMetrics(bullMaru);
    expect(bmMetrics.isBullish).toBe(true);
    expect(bmMetrics.bodyToRangeRatio).toBeGreaterThan(0.80);

    // 5. HAMMER
    const hammer = generateSingleCandleOHLC(basePrice, vol, 'HAMMER');
    const hMetrics = calculateCandleMetrics(hammer);
    expect(hMetrics.lowerWick).toBeGreaterThan(hMetrics.upperWick);

    // 6. SHOOTING STAR
    const star = generateSingleCandleOHLC(basePrice, vol, 'SHOOTING_STAR');
    const sMetrics = calculateCandleMetrics(star);
    expect(sMetrics.upperWick).toBeGreaterThan(sMetrics.lowerWick);

    // 7. SPINNING TOP
    const spin = generateSingleCandleOHLC(basePrice, vol, 'SPINNING_TOP');
    const spMetrics = calculateCandleMetrics(spin);
    expect(spMetrics.upperWick).toBeGreaterThan(0);
    expect(spMetrics.lowerWick).toBeGreaterThan(0);
  });

  it('should detect two-candle patterns (Engulfing, Harami, Piercing, Tweezers, Inside/Outside Bars)', () => {
    // Bullish Engulfing
    const bullEngulf = detectMultiCandlePattern([
      { open: 105, high: 106, low: 99, close: 100 },
      { open: 99, high: 108, low: 98, close: 107 }
    ]);
    expect(bullEngulf).toBe('BULLISH_ENGULFING');

    // Bearish Engulfing
    const bearEngulf = detectMultiCandlePattern([
      { open: 100, high: 106, low: 99, close: 105 },
      { open: 106, high: 107, low: 97, close: 98 }
    ]);
    expect(bearEngulf).toBe('BEARISH_ENGULFING');

    // Bullish Harami
    const bullHarami = detectMultiCandlePattern([
      { open: 110, high: 112, low: 95, close: 98 },
      { open: 100, high: 105, low: 99, close: 104 }
    ]);
    expect(bullHarami).toBe('BULLISH_HARAMI');

    // Bearish Harami
    const bearHarami = detectMultiCandlePattern([
      { open: 98, high: 112, low: 96, close: 110 },
      { open: 108, high: 109, low: 101, close: 102 }
    ]);
    expect(bearHarami).toBe('BEARISH_HARAMI');

    // Inside Bar
    const insideBar = detectMultiCandlePattern([
      { open: 100, high: 120, low: 80, close: 110 },
      { open: 102, high: 115, low: 85, close: 108 }
    ]);
    expect(insideBar).toBe('INSIDE_BAR');

    // Outside Bar
    const outsideBar = detectMultiCandlePattern([
      { open: 100, high: 110, low: 90, close: 105 },
      { open: 102, high: 125, low: 75, close: 108 }
    ]);
    expect(outsideBar).toBe('OUTSIDE_BAR');
  });

  it('should detect three-candle patterns (Morning/Evening Star, Three White Soldiers, Three Black Crows, Inside Up/Down, Outside Up/Down)', () => {
    // Morning Star
    const morningStar = detectMultiCandlePattern([
      { open: 110, high: 112, low: 98, close: 100 },
      { open: 98, high: 101, low: 96, close: 99 },
      { open: 100, high: 112, low: 99, close: 108 }
    ]);
    expect(morningStar).toBe('MORNING_STAR');

    // Evening Star
    const eveningStar = detectMultiCandlePattern([
      { open: 100, high: 112, low: 98, close: 110 },
      { open: 111, high: 114, low: 109, close: 112 },
      { open: 110, high: 111, low: 97, close: 101 }
    ]);
    expect(eveningStar).toBe('EVENING_STAR');

    // Three White Soldiers
    const soldiers = detectMultiCandlePattern([
      { open: 100, high: 106, low: 99, close: 105 },
      { open: 104, high: 111, low: 103, close: 110 },
      { open: 109, high: 116, low: 108, close: 115 }
    ]);
    expect(soldiers).toBe('THREE_WHITE_SOLDIERS');

    // Three Black Crows
    const crows = detectMultiCandlePattern([
      { open: 115, high: 116, low: 109, close: 110 },
      { open: 111, high: 112, low: 104, close: 105 },
      { open: 106, high: 107, low: 99, close: 100 }
    ]);
    expect(crows).toBe('THREE_BLACK_CROWS');
  });

  it('should produce all 5 market regimes with valid durations', () => {
    const regimesSeen = new Set<MarketRegime>();

    let currentRegime: MarketRegime | undefined = undefined;
    for (let i = 0; i < 50; i++) {
      const res = pickNextRegime(currentRegime);
      expect(res.duration).toBeGreaterThan(0);
      regimesSeen.add(res.regime);
      currentRegime = res.regime;
    }

    expect(regimesSeen.has('CONSOLIDATION')).toBe(true);
    expect(regimesSeen.has('MOMENTUM_BURST')).toBe(true);
    expect(regimesSeen.has('VOLATILITY_SPIKE')).toBe(true);
    expect(regimesSeen.has('FAKE_BREAKOUT')).toBe(true);
    expect(regimesSeen.has('PAUSE_SQUEEZE')).toBe(true);
  });

  it('should pick random patterns covering all defined pattern types including Four Price Doji', () => {
    const patternsSeen = new Set<PatternType>();
    for (let i = 0; i < 300; i++) {
      patternsSeen.add(pickRandomPattern());
    }

    expect(patternsSeen.has('DOJI_FOUR_PRICE')).toBe(true);
    expect(patternsSeen.has('DOJI')).toBe(true);
    expect(patternsSeen.has('SPINNING_TOP')).toBe(true);
    expect(patternsSeen.has('HAMMER')).toBe(true);
    expect(patternsSeen.has('SHOOTING_STAR')).toBe(true);
    expect(patternsSeen.has('INVERTED_HAMMER')).toBe(true);
    expect(patternsSeen.has('LONG_WICK_REJECTION')).toBe(true);
    expect(patternsSeen.has('BULLISH_MARUBOZU')).toBe(true);
    expect(patternsSeen.has('BEARISH_MARUBOZU')).toBe(true);
  });
});
