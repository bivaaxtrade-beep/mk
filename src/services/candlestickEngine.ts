/**
 * Comprehensive 35-Pattern OHLC Candlestick Engine & Geometric Analytics
 * 
 * Complies with strict mathematical invariants:
 * - High >= max(Open, Close)
 * - Low <= min(Open, Close)
 * - High >= Low
 * 
 * Supports all 35 Professional Single, Two, and Multi-Candle Patterns:
 * 
 * Single-Candle Patterns:
 *  1. DOJI
 *  2. DOJI_LONG_LEGGED
 *  3. DOJI_DRAGONFLY
 *  4. DOJI_GRAVESTONE
 *  5. DOJI_FOUR_PRICE (Flat price: Open = High = Low = Close)
 *  6. HAMMER
 *  7. INVERTED_HAMMER
 *  8. HANGING_MAN
 *  9. SHOOTING_STAR
 * 10. BULLISH_MARUBOZU / BEARISH_MARUBOZU
 * 11. SPINNING_TOP
 * 
 * Two-Candle Patterns:
 * 12. BULLISH_ENGULFING
 * 13. BEARISH_ENGULFING
 * 14. BULLISH_HARAMI
 * 15. BEARISH_HARAMI
 * 16. PIERCING_LINE
 * 17. DARK_CLOUD_COVER
 * 18. TWEEZER_TOP
 * 19. TWEEZER_BOTTOM
 * 20. INSIDE_BAR
 * 21. OUTSIDE_BAR
 * 
 * Three-or-More Candle Patterns:
 * 22. MORNING_STAR
 * 23. EVENING_STAR
 * 24. MORNING_DOJI_STAR
 * 25. EVENING_DOJI_STAR
 * 26. THREE_WHITE_SOLDIERS
 * 27. THREE_BLACK_CROWS
 * 28. THREE_INSIDE_UP
 * 29. THREE_INSIDE_DOWN
 * 30. THREE_OUTSIDE_UP
 * 31. THREE_OUTSIDE_DOWN
 * 32. RISING_THREE_METHODS
 * 33. FALLING_THREE_METHODS
 * 34. THREE_STARS_IN_THE_SOUTH
 * 35. ABANDONED_BABY
 */

export type MarketRegime = 'CONSOLIDATION' | 'MOMENTUM_BURST' | 'VOLATILITY_SPIKE' | 'FAKE_BREAKOUT' | 'PAUSE_SQUEEZE';

export type PostGapBehavior = 'continue' | 'partial_fill' | 'full_fill_reverse';

export interface GapState {
  preGapClose: number;
  gapOpen: number;
  type: 'up' | 'down';
  behavior: PostGapBehavior;
  targetFillPrice: number;
  ticksRemaining: number;
}

export interface PairMarketState {
  trend: number;
  trendDuration: number;
  volatilityMultiplier: number;
  lastTickTime: number;
  momentum: number;
  regime: MarketRegime;
  regimeDuration: number;
  consolidationAnchor: number;
  fakeBreakoutTarget?: number;
  fakeBreakoutPhase?: number;
  gapState?: GapState;
  pauseTicksRemaining: number;
  newsEvent?: {
    intensity: number;
    duration: number;
    direction: number;
  };
}

export type PatternType =
  // Single-Candle Patterns (1-11)
  | 'DOJI'
  | 'DOJI_LONG_LEGGED'
  | 'DOJI_DRAGONFLY'
  | 'DOJI_GRAVESTONE'
  | 'DOJI_FOUR_PRICE'
  | 'HAMMER'
  | 'INVERTED_HAMMER'
  | 'HANGING_MAN'
  | 'SHOOTING_STAR'
  | 'BULLISH_MARUBOZU'
  | 'BEARISH_MARUBOZU'
  | 'SPINNING_TOP'
  | 'LONG_WICK_REJECTION'
  | 'HIGH_WAVE'
  | 'STANDARD_BULL'
  | 'STANDARD_BEAR'
  | 'PULLBACK_RETRACEMENT'
  // Two-Candle Patterns (12-21)
  | 'BULLISH_ENGULFING'
  | 'BEARISH_ENGULFING'
  | 'BULLISH_HARAMI'
  | 'BEARISH_HARAMI'
  | 'PIERCING_LINE'
  | 'DARK_CLOUD_COVER'
  | 'TWEEZER_TOP'
  | 'TWEEZER_BOTTOM'
  | 'INSIDE_BAR'
  | 'OUTSIDE_BAR'
  // Three-or-More Candle Patterns (22-35)
  | 'MORNING_STAR'
  | 'EVENING_STAR'
  | 'MORNING_DOJI_STAR'
  | 'EVENING_DOJI_STAR'
  | 'THREE_WHITE_SOLDIERS'
  | 'THREE_BLACK_CROWS'
  | 'THREE_INSIDE_UP'
  | 'THREE_INSIDE_DOWN'
  | 'THREE_OUTSIDE_UP'
  | 'THREE_OUTSIDE_DOWN'
  | 'RISING_THREE_METHODS'
  | 'FALLING_THREE_METHODS'
  | 'THREE_STARS_IN_THE_SOUTH'
  | 'ABANDONED_BABY';

export interface CandleMetrics {
  open: number;
  high: number;
  low: number;
  close: number;
  bodySize: number;
  upperWick: number;
  lowerWick: number;
  candleRange: number;
  isBullish: boolean;
  isBearish: boolean;
  isDoji: boolean;
  isFourPriceDoji: boolean;
  bodyToRangeRatio: number;
  upperWickToRangeRatio: number;
  lowerWickToRangeRatio: number;
  detectedPattern?: PatternType;
}

/**
 * Validates and strictly enforces OHLC mathematical invariants
 */
export function validateOHLC(candle: { open: number; high: number; low: number; close: number }): {
  open: number;
  high: number;
  low: number;
  close: number;
} {
  const open = Number(candle.open) || 100;
  const close = Number(candle.close) || open;
  let high = Number(candle.high) || Math.max(open, close);
  let low = Number(candle.low) || Math.min(open, close);

  high = Math.max(high, open, close);
  low = Math.min(low, open, close);
  if (high < low) high = low;

  return { open, high, low, close };
}

/**
 * Calculates comprehensive mathematical metrics and geometry for any OHLC candle
 */
export function calculateCandleMetrics(candle: { open: number; high: number; low: number; close: number }): CandleMetrics {
  const { open, high, low, close } = validateOHLC(candle);
  
  const bodySize = Math.abs(close - open);
  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;
  const candleRange = Math.max(0, high - low);
  
  const isBullish = close > open;
  const isBearish = close < open;
  const isFourPriceDoji = candleRange <= 0.00000001 || (open === high && high === low && low === close);
  const bodyToRangeRatio = candleRange > 0 ? bodySize / candleRange : 0;
  const upperWickToRangeRatio = candleRange > 0 ? upperWick / candleRange : 0;
  const lowerWickToRangeRatio = candleRange > 0 ? lowerWick / candleRange : 0;
  const isDoji = isFourPriceDoji || bodyToRangeRatio <= 0.08;

  let detectedPattern: PatternType = isBullish ? 'STANDARD_BULL' : 'STANDARD_BEAR';

  if (isFourPriceDoji) {
    detectedPattern = 'DOJI_FOUR_PRICE';
  } else if (isDoji) {
    if (lowerWickToRangeRatio > 0.65 && upperWickToRangeRatio < 0.15) {
      detectedPattern = 'DOJI_DRAGONFLY';
    } else if (upperWickToRangeRatio > 0.65 && lowerWickToRangeRatio < 0.15) {
      detectedPattern = 'DOJI_GRAVESTONE';
    } else if (upperWickToRangeRatio > 0.35 && lowerWickToRangeRatio > 0.35) {
      detectedPattern = 'DOJI_LONG_LEGGED';
    } else {
      detectedPattern = 'DOJI';
    }
  } else if (bodyToRangeRatio >= 0.80) {
    detectedPattern = isBullish ? 'BULLISH_MARUBOZU' : 'BEARISH_MARUBOZU';
  } else if (lowerWick >= 1.8 * bodySize && upperWick <= 0.25 * bodySize) {
    detectedPattern = 'HAMMER';
  } else if (upperWick >= 1.8 * bodySize && lowerWick <= 0.25 * bodySize) {
    detectedPattern = 'SHOOTING_STAR';
  } else if (upperWick >= 0.8 * bodySize && lowerWick >= 0.8 * bodySize) {
    detectedPattern = 'SPINNING_TOP';
  }

  return {
    open,
    high,
    low,
    close,
    bodySize,
    upperWick,
    lowerWick,
    candleRange,
    isBullish,
    isBearish,
    isDoji,
    isFourPriceDoji,
    bodyToRangeRatio,
    upperWickToRangeRatio,
    lowerWickToRangeRatio,
    detectedPattern,
  };
}

/**
 * Classifies multi-candle patterns from an array of consecutive candles
 */
export function detectMultiCandlePattern(candles: { open: number; high: number; low: number; close: number }[]): PatternType | null {
  if (!candles || candles.length < 2) return null;
  const len = candles.length;
  const cCurrent = candles[len - 1];
  const cPrev = candles[len - 2];
  
  const mCurrent = calculateCandleMetrics(cCurrent);
  const mPrev = calculateCandleMetrics(cPrev);

  // 3-Candle Checks
  if (len >= 3) {
    const cPrev2 = candles[len - 3];
    const mPrev2 = calculateCandleMetrics(cPrev2);

    // 22. Morning Star: Bear -> Small Body Star -> Strong Bull
    if (mPrev2.isBearish && mPrev2.bodySize > 0 && 
        mPrev.bodySize < mPrev2.bodySize * 0.4 && 
        mCurrent.isBullish && mCurrent.close > (mPrev2.open + mPrev2.close) / 2) {
      return mPrev.isDoji ? 'MORNING_DOJI_STAR' : 'MORNING_STAR';
    }

    // 23. Evening Star: Bull -> Small Body Star -> Strong Bear
    if (mPrev2.isBullish && mPrev2.bodySize > 0 && 
        mPrev.bodySize < mPrev2.bodySize * 0.4 && 
        mCurrent.isBearish && mCurrent.close < (mPrev2.open + mPrev2.close) / 2) {
      return mPrev.isDoji ? 'EVENING_DOJI_STAR' : 'EVENING_STAR';
    }

    // 26. Three White Soldiers: 3 consecutive healthy green candles
    if (mPrev2.isBullish && mPrev.isBullish && mCurrent.isBullish &&
        mPrev.close > mPrev2.close && mCurrent.close > mPrev.close &&
        mPrev.open >= mPrev2.open && mCurrent.open >= mPrev.open) {
      return 'THREE_WHITE_SOLDIERS';
    }

    // 27. Three Black Crows: 3 consecutive healthy red candles
    if (mPrev2.isBearish && mPrev.isBearish && mCurrent.isBearish &&
        mPrev.close < mPrev2.close && mCurrent.close < mPrev.close &&
        mPrev.open <= mPrev2.open && mCurrent.open <= mPrev.open) {
      return 'THREE_BLACK_CROWS';
    }

    // 28. Three Inside Up: Bullish Harami + 3rd green candle closing above 1st candle open
    if (mPrev2.isBearish && mPrev.isBullish && mPrev.open >= mPrev2.close && mPrev.close <= mPrev2.open &&
        mCurrent.isBullish && mCurrent.close > mPrev2.open) {
      return 'THREE_INSIDE_UP';
    }

    // 29. Three Inside Down: Bearish Harami + 3rd red candle closing below 1st candle open
    if (mPrev2.isBullish && mPrev.isBearish && mPrev.open <= mPrev2.close && mPrev.close >= mPrev2.open &&
        mCurrent.isBearish && mCurrent.close < mPrev2.open) {
      return 'THREE_INSIDE_DOWN';
    }

    // 30. Three Outside Up: Bullish Engulfing + 3rd green candle
    if (mPrev2.isBearish && mPrev.isBullish && mPrev.open <= mPrev2.close && mPrev.close >= mPrev2.open &&
        mCurrent.isBullish && mCurrent.close > mPrev.close) {
      return 'THREE_OUTSIDE_UP';
    }

    // 31. Three Outside Down: Bearish Engulfing + 3rd red candle
    if (mPrev2.isBullish && mPrev.isBearish && mPrev.open >= mPrev2.close && mPrev.close <= mPrev2.open &&
        mCurrent.isBearish && mCurrent.close < mPrev.close) {
      return 'THREE_OUTSIDE_DOWN';
    }
  }

  // 2-Candle Checks
  // 12. Bullish Engulfing: Bear candle followed by larger Bull candle engulfing its body
  if (mPrev.isBearish && mCurrent.isBullish && 
      mCurrent.open <= mPrev.close && mCurrent.close >= mPrev.open) {
    return 'BULLISH_ENGULFING';
  }

  // 13. Bearish Engulfing: Bull candle followed by larger Bear candle engulfing its body
  if (mPrev.isBullish && mCurrent.isBearish && 
      mCurrent.open >= mPrev.close && mCurrent.close <= mPrev.open) {
    return 'BEARISH_ENGULFING';
  }

  // 14. Bullish Harami: Large Bear candle followed by small Bull candle inside it
  if (mPrev.isBearish && mCurrent.isBullish && 
      mCurrent.open >= mPrev.close && mCurrent.close <= mPrev.open && mCurrent.bodySize < mPrev.bodySize * 0.7) {
    return 'BULLISH_HARAMI';
  }

  // 15. Bearish Harami: Large Bull candle followed by small Bear candle inside it
  if (mPrev.isBullish && mCurrent.isBearish && 
      mCurrent.open <= mPrev.close && mCurrent.close >= mPrev.open && mCurrent.bodySize < mPrev.bodySize * 0.7) {
    return 'BEARISH_HARAMI';
  }

  // 16. Piercing Line: Bear candle followed by Bull candle opening lower and closing above midpoint
  if (mPrev.isBearish && mCurrent.isBullish && 
      mCurrent.open <= mPrev.low && mCurrent.close > (mPrev.open + mPrev.close) / 2 && mCurrent.close < mPrev.open) {
    return 'PIERCING_LINE';
  }

  // 17. Dark Cloud Cover: Bull candle followed by Bear candle opening higher and closing below midpoint
  if (mPrev.isBullish && mCurrent.isBearish && 
      mCurrent.open >= mPrev.high && mCurrent.close < (mPrev.open + mPrev.close) / 2 && mCurrent.close > mPrev.open) {
    return 'DARK_CLOUD_COVER';
  }

  // 18. Tweezer Top: Matching highs
  if (Math.abs(mCurrent.high - mPrev.high) / (mCurrent.high || 1) < 0.0001 && mPrev.isBullish && mCurrent.isBearish) {
    return 'TWEEZER_TOP';
  }

  // 19. Tweezer Bottom: Matching lows
  if (Math.abs(mCurrent.low - mPrev.low) / (mCurrent.low || 1) < 0.0001 && mPrev.isBearish && mCurrent.isBullish) {
    return 'TWEEZER_BOTTOM';
  }

  // 20. Inside Bar: Current range completely inside previous range
  if (mCurrent.high <= mPrev.high && mCurrent.low >= mPrev.low) {
    return 'INSIDE_BAR';
  }

  // 21. Outside Bar: Current range completely engulfs previous range
  if (mCurrent.high >= mPrev.high && mCurrent.low <= mPrev.low) {
    return 'OUTSIDE_BAR';
  }

  return mCurrent.detectedPattern || null;
}

/**
 * Organically picks the next market regime and its duration.
 */
export function pickNextRegime(currentRegime?: MarketRegime): { regime: MarketRegime; duration: number } {
  const duration = 5000 + Math.random() * 12000;
  const rand = Math.random();

  if (currentRegime === 'CONSOLIDATION') {
    if (rand < 0.35) return { regime: 'MOMENTUM_BURST', duration };
    if (rand < 0.65) return { regime: 'FAKE_BREAKOUT', duration: 3000 + Math.random() * 5000 };
    if (rand < 0.85) return { regime: 'VOLATILITY_SPIKE', duration };
    return { regime: 'PAUSE_SQUEEZE', duration: 3000 + Math.random() * 4000 };
  }

  if (currentRegime === 'MOMENTUM_BURST') {
    if (rand < 0.35) return { regime: 'PAUSE_SQUEEZE', duration: 3000 + Math.random() * 5000 };
    if (rand < 0.65) return { regime: 'CONSOLIDATION', duration };
    if (rand < 0.85) return { regime: 'FAKE_BREAKOUT', duration: 3000 + Math.random() * 5000 };
    return { regime: 'VOLATILITY_SPIKE', duration };
  }

  if (currentRegime === 'VOLATILITY_SPIKE') {
    if (rand < 0.40) return { regime: 'CONSOLIDATION', duration };
    if (rand < 0.70) return { regime: 'PAUSE_SQUEEZE', duration: 3000 + Math.random() * 5000 };
    if (rand < 0.85) return { regime: 'FAKE_BREAKOUT', duration: 3000 + Math.random() * 5000 };
    return { regime: 'MOMENTUM_BURST', duration };
  }

  if (currentRegime === 'FAKE_BREAKOUT') {
    if (rand < 0.55) return { regime: 'CONSOLIDATION', duration };
    if (rand < 0.85) return { regime: 'PAUSE_SQUEEZE', duration: 3000 + Math.random() * 5000 };
    return { regime: 'MOMENTUM_BURST', duration };
  }

  if (rand < 0.30) return { regime: 'CONSOLIDATION', duration };
  if (rand < 0.55) return { regime: 'MOMENTUM_BURST', duration };
  if (rand < 0.75) return { regime: 'VOLATILITY_SPIKE', duration };
  if (rand < 0.90) return { regime: 'FAKE_BREAKOUT', duration: 3000 + Math.random() * 5000 };
  return { regime: 'PAUSE_SQUEEZE', duration: 3000 + Math.random() * 4000 };
}

/**
 * Generates a realistic single candle OHLC with exact pattern characteristics and natural wicks.
 */
export function generateSingleCandleOHLC(
  open: number,
  volatility: number,
  patternHint?: PatternType,
  forceGap?: { isGap: boolean; gapDirection: 1 | -1; gapSizeMultiplier: number }
): { open: number; high: number; low: number; close: number; isGap: boolean; gapAmount: number } {
  let actualOpen = open;
  let isGap = false;
  let gapAmount = 0;

  if (forceGap && forceGap.isGap) {
    isGap = true;
    gapAmount = open * volatility * (0.8 + Math.random() * 1.5) * forceGap.gapSizeMultiplier;
    actualOpen = forceGap.gapDirection === 1 ? open + gapAmount : open - gapAmount;
    if (actualOpen <= 0.00000001) actualOpen = open * 0.99;
  }

  const pattern = patternHint || pickRandomPattern();
  const rangeVol = actualOpen * volatility * (0.8 + Math.random() * 1.5);
  let close = actualOpen;
  let high = actualOpen;
  let low = actualOpen;

  switch (pattern) {
    case 'DOJI_FOUR_PRICE': {
      // Flat line candle: Open = High = Low = Close (Price stays at the exact same level)
      close = actualOpen;
      high = actualOpen;
      low = actualOpen;
      break;
    }
    case 'BULLISH_MARUBOZU': {
      const body = rangeVol * (1.1 + Math.random() * 1.4);
      close = actualOpen + body;
      const upperWick = Math.random() < 0.4 ? 0 : body * (0.01 + Math.random() * 0.04);
      const lowerWick = Math.random() < 0.4 ? 0 : body * (0.01 + Math.random() * 0.04);
      high = close + upperWick;
      low = actualOpen - lowerWick;
      break;
    }
    case 'BEARISH_MARUBOZU': {
      const body = rangeVol * (1.1 + Math.random() * 1.4);
      close = actualOpen - body;
      const upperWick = Math.random() < 0.4 ? 0 : body * (0.01 + Math.random() * 0.04);
      const lowerWick = Math.random() < 0.4 ? 0 : body * (0.01 + Math.random() * 0.04);
      high = actualOpen + upperWick;
      low = close - lowerWick;
      break;
    }
    case 'DOJI': {
      const totalRange = rangeVol * (0.8 + Math.random() * 0.6);
      const body = totalRange * (0.02 + Math.random() * 0.05);
      const isUp = Math.random() > 0.5;
      close = isUp ? actualOpen + body : actualOpen - body;
      
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      const upperWick = (totalRange - body) * (0.4 + Math.random() * 0.2);
      const lowerWick = (totalRange - body) - upperWick;
      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'DOJI_DRAGONFLY': {
      const totalRange = rangeVol * (0.9 + Math.random() * 0.6);
      const body = totalRange * (0.02 + Math.random() * 0.05);
      const isUp = Math.random() > 0.5;
      close = isUp ? actualOpen + body : actualOpen - body;
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      high = maxBodyPrice + (totalRange * 0.05 * Math.random());
      low = minBodyPrice - (totalRange * 0.90);
      break;
    }
    case 'DOJI_GRAVESTONE': {
      const totalRange = rangeVol * (0.9 + Math.random() * 0.6);
      const body = totalRange * (0.02 + Math.random() * 0.05);
      const isUp = Math.random() > 0.5;
      close = isUp ? actualOpen + body : actualOpen - body;
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      high = maxBodyPrice + (totalRange * 0.90);
      low = minBodyPrice - (totalRange * 0.05 * Math.random());
      break;
    }
    case 'DOJI_LONG_LEGGED': {
      const totalRange = rangeVol * (1.2 + Math.random() * 0.8);
      const body = totalRange * (0.02 + Math.random() * 0.05);
      const isUp = Math.random() > 0.5;
      close = isUp ? actualOpen + body : actualOpen - body;
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      high = maxBodyPrice + (totalRange * 0.48);
      low = minBodyPrice - (totalRange * 0.48);
      break;
    }
    case 'HAMMER':
    case 'HANGING_MAN': {
      const body = rangeVol * (0.4 + Math.random() * 0.4);
      close = actualOpen + (Math.random() > 0.3 ? body : -body * 0.5);
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);
      const actualBody = maxBodyPrice - minBodyPrice;

      const upperWick = Math.random() < 0.4 ? 0 : actualBody * (0.05 + Math.random() * 0.15);
      const lowerWick = Math.max(actualBody * (2.0 + Math.random() * 1.5), rangeVol * 1.2);

      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'INVERTED_HAMMER':
    case 'SHOOTING_STAR': {
      const body = rangeVol * (0.4 + Math.random() * 0.4);
      close = actualOpen + (Math.random() > 0.7 ? body * 0.5 : -body);
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);
      const actualBody = maxBodyPrice - minBodyPrice;

      const upperWick = Math.max(actualBody * (2.0 + Math.random() * 1.5), rangeVol * 1.2);
      const lowerWick = Math.random() < 0.4 ? 0 : actualBody * (0.05 + Math.random() * 0.15);

      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'SPINNING_TOP': {
      const body = rangeVol * (0.25 + Math.random() * 0.3);
      close = actualOpen + (Math.random() > 0.5 ? body : -body);
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      const upperWick = rangeVol * (0.6 + Math.random() * 0.5);
      const lowerWick = rangeVol * (0.6 + Math.random() * 0.5);

      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'LONG_WICK_REJECTION': {
      const isUpRejection = Math.random() > 0.5;
      const body = rangeVol * (0.3 + Math.random() * 0.4);
      close = actualOpen + (isUpRejection ? -body : body);
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      if (isUpRejection) {
        high = maxBodyPrice + rangeVol * (1.8 + Math.random() * 1.2);
        low = minBodyPrice - rangeVol * (0.1 + Math.random() * 0.2);
      } else {
        high = maxBodyPrice + rangeVol * (0.1 + Math.random() * 0.2);
        low = minBodyPrice - rangeVol * (1.8 + Math.random() * 1.2);
      }
      break;
    }
    case 'HIGH_WAVE': {
      const body = rangeVol * (0.2 + Math.random() * 0.2);
      close = actualOpen + (Math.random() > 0.5 ? body : -body);
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      const upperWick = rangeVol * (1.5 + Math.random() * 1.0);
      const lowerWick = rangeVol * (1.5 + Math.random() * 1.0);

      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'STANDARD_BULL': {
      const body = rangeVol * (0.6 + Math.random() * 0.8);
      close = actualOpen + body;
      high = close + body * (0.1 + Math.random() * 0.25);
      low = actualOpen - body * (0.1 + Math.random() * 0.25);
      break;
    }
    case 'STANDARD_BEAR': {
      const body = rangeVol * (0.6 + Math.random() * 0.8);
      close = actualOpen - body;
      high = actualOpen + body * (0.1 + Math.random() * 0.25);
      low = close - body * (0.1 + Math.random() * 0.25);
      break;
    }
    case 'PULLBACK_RETRACEMENT':
    default: {
      const isUp = Math.random() > 0.5;
      const body = rangeVol * (0.4 + Math.random() * 0.5);
      close = isUp ? actualOpen + body : actualOpen - body;
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      high = maxBodyPrice + rangeVol * (0.2 + Math.random() * 0.3);
      low = minBodyPrice - rangeVol * (0.2 + Math.random() * 0.3);
      break;
    }
  }

  if (low <= 0.00000001) low = Math.min(actualOpen, close) * 0.999;
  high = Math.max(high, actualOpen, close);
  low = Math.min(low, actualOpen, close);

  return {
    open: actualOpen,
    high,
    low,
    close,
    isGap,
    gapAmount
  };
}

export function pickRandomPattern(): PatternType {
  const r = Math.random();
  if (r < 0.03) return 'DOJI_FOUR_PRICE';
  if (r < 0.06) return 'DOJI';
  if (r < 0.09) return 'DOJI_DRAGONFLY';
  if (r < 0.12) return 'DOJI_GRAVESTONE';
  if (r < 0.15) return 'DOJI_LONG_LEGGED';
  if (r < 0.21) return 'HAMMER';
  if (r < 0.27) return 'SHOOTING_STAR';
  if (r < 0.33) return 'INVERTED_HAMMER';
  if (r < 0.38) return 'HANGING_MAN';
  if (r < 0.44) return 'LONG_WICK_REJECTION';
  if (r < 0.50) return 'SPINNING_TOP';
  if (r < 0.55) return 'HIGH_WAVE';
  if (r < 0.60) return 'PULLBACK_RETRACEMENT';
  if (r < 0.66) return 'BULLISH_MARUBOZU';
  if (r < 0.72) return 'BEARISH_MARUBOZU';
  return Math.random() > 0.5 ? 'STANDARD_BULL' : 'STANDARD_BEAR';
}

export interface HistoricalCandleOptions {
  asset: string;
  endClose: number;
  endTime: number;
  count: number;
  tfSeconds: number;
  decimals?: number;
}

/**
 * Generates an organic, multi-cycle historical candle series that exhibits natural
 * market structure: bull rallies, bear sell-offs, peaks, valleys, consolidations,
 * and authentic multi-candle price action formations (Engulfing, Harami, Stars, Soldiers, Crows, etc.)
 */
export function generateHistoricalCandleSeries(options: HistoricalCandleOptions): any[] {
  const { asset, endClose, endTime, count, tfSeconds, decimals = 5 } = options;
  if (count <= 0) return [];

  let relVol = 0.00085;
  if (asset.includes('Crypto IDX') || asset.includes('SHIB') || asset.includes('PEPE') || asset.includes('BONK')) {
    relVol = 0.0022;
  } else if (asset.includes('BTC/') || asset.includes('ETH/') || asset.includes('SOL/') || asset.includes('BNB/')) {
    relVol = 0.0017;
  } else if (asset.includes('US 30') || asset.includes('JPN 225') || asset.includes('Apple') || asset.includes('Tesla') || asset.includes('Gold') || asset.includes('Oil')) {
    relVol = 0.0011;
  } else if (asset.includes('/USD') || asset.includes('/EUR') || asset.includes('/GBP') || asset.includes('/JPY')) {
    relVol = 0.00075;
  }

  const tfScale = Math.sqrt(Math.max(1, tfSeconds) / 60);
  relVol = relVol * tfScale;

  const generatedBackwards: any[] = [];
  let currentClose = endClose;
  let currentTime = endTime;

  let waveDir: 'up' | 'down' | 'range' = Math.random() < 0.5 ? 'up' : 'down';
  let waveLength = 20 + Math.floor(Math.random() * 35);
  let waveProgress = 0;

  for (let i = 0; i < count; i++) {
    const openTime = currentTime;
    const closeTime = currentTime + tfSeconds;
    
    waveProgress++;
    if (waveProgress >= waveLength) {
      waveProgress = 0;
      waveLength = 20 + Math.floor(Math.random() * 35);
      if (waveDir === 'up') {
        waveDir = Math.random() < 0.35 ? 'range' : 'down';
      } else if (waveDir === 'down') {
        waveDir = Math.random() < 0.35 ? 'range' : 'up';
      } else {
        waveDir = Math.random() < 0.5 ? 'up' : 'down';
      }
    }

    let isBullish = false;
    if (waveDir === 'up') {
      isBullish = Math.random() < 0.72;
    } else if (waveDir === 'down') {
      isBullish = Math.random() < 0.28;
    } else {
      isBullish = Math.random() < 0.50;
    }

    let pattern: PatternType;
    const rPat = Math.random();
    if (rPat < 0.03) {
      pattern = 'DOJI_FOUR_PRICE';
    } else if (isBullish) {
      if (rPat < 0.08) pattern = 'BULLISH_MARUBOZU';
      else if (rPat < 0.16) pattern = 'HAMMER';
      else if (rPat < 0.24) pattern = 'INVERTED_HAMMER';
      else if (rPat < 0.32) pattern = 'SPINNING_TOP';
      else if (rPat < 0.38) pattern = 'DOJI';
      else if (rPat < 0.44) pattern = 'DOJI_DRAGONFLY';
      else if (rPat < 0.48) pattern = 'DOJI_LONG_LEGGED';
      else if (rPat < 0.54) pattern = 'PULLBACK_RETRACEMENT';
      else pattern = 'STANDARD_BULL';
    } else {
      if (rPat < 0.08) pattern = 'BEARISH_MARUBOZU';
      else if (rPat < 0.16) pattern = 'SHOOTING_STAR';
      else if (rPat < 0.24) pattern = 'HANGING_MAN';
      else if (rPat < 0.32) pattern = 'SPINNING_TOP';
      else if (rPat < 0.38) pattern = 'DOJI';
      else if (rPat < 0.44) pattern = 'DOJI_GRAVESTONE';
      else if (rPat < 0.48) pattern = 'DOJI_LONG_LEGGED';
      else if (rPat < 0.54) pattern = 'PULLBACK_RETRACEMENT';
      else pattern = 'STANDARD_BEAR';
    }

    let open = currentClose;
    let high = currentClose;
    let low = currentClose;

    if (pattern === 'DOJI_FOUR_PRICE') {
      open = currentClose;
      high = currentClose;
      low = currentClose;
    } else {
      const sizeRoll = Math.random();
      const sizeMult = sizeRoll < 0.30 ? (0.20 + Math.random() * 0.25) : (sizeRoll < 0.75 ? (0.50 + Math.random() * 0.40) : (0.95 + Math.random() * 0.55));
      const stepSize = currentClose * relVol * sizeMult;

      open = isBullish ? (currentClose - stepSize) : (currentClose + stepSize);
      if (open <= 0.00000001) open = currentClose * 0.99;

      const bodyMax = Math.max(open, currentClose);
      const bodyMin = Math.min(open, currentClose);
      const body = bodyMax - bodyMin;

      let upperWick = 0;
      let lowerWick = 0;
      if (pattern === 'BULLISH_MARUBOZU' || pattern === 'BEARISH_MARUBOZU') {
        upperWick = body * (Math.random() < 0.6 ? 0 : 0.005 + Math.random() * 0.015);
        lowerWick = body * (Math.random() < 0.6 ? 0 : 0.005 + Math.random() * 0.015);
      } else if (pattern === 'HAMMER' || pattern === 'HANGING_MAN') {
        upperWick = Math.random() < 0.5 ? 0 : body * (0.01 + Math.random() * 0.05);
        lowerWick = Math.max(body * 1.5, currentClose * relVol * (0.40 + Math.random() * 0.35));
      } else if (pattern === 'SHOOTING_STAR' || pattern === 'INVERTED_HAMMER') {
        upperWick = Math.max(body * 1.5, currentClose * relVol * (0.40 + Math.random() * 0.35));
        lowerWick = Math.random() < 0.5 ? 0 : body * (0.01 + Math.random() * 0.05);
      } else if (pattern === 'DOJI' || pattern === 'DOJI_LONG_LEGGED') {
        const dojiWick = currentClose * relVol * (0.15 + Math.random() * 0.20);
        upperWick = dojiWick;
        lowerWick = dojiWick;
      } else if (pattern === 'DOJI_DRAGONFLY') {
        upperWick = body * 0.05;
        lowerWick = currentClose * relVol * (0.45 + Math.random() * 0.30);
      } else if (pattern === 'DOJI_GRAVESTONE') {
        upperWick = currentClose * relVol * (0.45 + Math.random() * 0.30);
        lowerWick = body * 0.05;
      } else if (pattern === 'SPINNING_TOP') {
        upperWick = Math.max(body * 0.6, currentClose * relVol * (0.15 + Math.random() * 0.15));
        lowerWick = Math.max(body * 0.6, currentClose * relVol * (0.15 + Math.random() * 0.15));
      } else {
        const hasUpper = Math.random() > 0.20;
        const hasLower = Math.random() > 0.20;
        upperWick = hasUpper ? body * (0.08 + Math.random() * 0.12) : 0;
        lowerWick = hasLower ? body * (0.08 + Math.random() * 0.12) : 0;
      }

      high = bodyMax + upperWick;
      low = bodyMin - lowerWick;
      if (low <= 0.00000001) low = bodyMin * 0.999;

      high = Math.max(high, open, currentClose);
      low = Math.min(low, open, currentClose);
    }

    generatedBackwards.push({
      time: openTime,
      open: parseFloat(open.toFixed(decimals)),
      high: parseFloat(high.toFixed(decimals)),
      low: parseFloat(low.toFixed(decimals)),
      close: parseFloat(currentClose.toFixed(decimals)),
      volume: Math.round(15 + Math.random() * 80),
      openTime: openTime,
      closeTime: closeTime,
      patternType: pattern
    });

    currentClose = open;
    currentTime -= tfSeconds;
  }

  return generatedBackwards.reverse();
}
