/**
 * Continuous Underlying Stochastic Price Process & Market Physics Engine
 * 
 * Provides a continuous, realistic underlying price stream that drives
 * multi-timeframe OHLC candle generation.
 * 
 * Features:
 * - Trend periods (bull & bear multi-candle waves)
 * - Sideways / ranging periods & tight consolidation
 * - Volatility expansion (momentum thrusts, expansion phases)
 * - Volatility contraction (squeeze, quiet market)
 * - Pullbacks, retracements & mean-reversion reversals
 * - Micro-noise and realistic order-flow liquidity friction
 * - Occasional micro-gaps where market conditions allow
 * - Multi-timeframe unified aggregation consistency
 */

export type MarketStatePhase = 
  | 'TRENDING_UP'
  | 'TRENDING_DOWN'
  | 'CONSOLIDATION'
  | 'VOLATILITY_EXPANSION'
  | 'VOLATILITY_CONTRACTION'
  | 'PULLBACK'
  | 'MOMENTUM_BURST';

export interface PriceEngineConfig {
  baseVolatility: number;       // Base volatility ratio (e.g. 0.00008)
  trendStrength: number;        // Drift bias factor
  meanReversionRate: number;    // Pullback rate toward mean
  noiseRatio: number;           // High-frequency tick noise ratio
  gapProbability: number;       // Probability of micro-gap on candle transition
  minWaveDurationSec: number;   // Min seconds for a wave
  maxWaveDurationSec: number;   // Max seconds for a wave
}

export interface PairPriceState {
  currentPrice: number;
  anchorPrice: number;          // Regime center / reference price
  phase: MarketStatePhase;
  phaseDurationMs: number;
  phaseElapsedMs: number;
  targetPrice: number;
  volatilityMult: number;
  drift: number;                // Current direction & magnitude of drift
  prevNoise: number;
  lastTickTimeMs: number;
  decimals: number;
}

const DEFAULT_CONFIGS: Record<string, PriceEngineConfig> = {
  crypto_idx: {
    baseVolatility: 0.00014,
    trendStrength: 1.2,
    meanReversionRate: 0.05,
    noiseRatio: 0.25,
    gapProbability: 0.02,
    minWaveDurationSec: 15,
    maxWaveDurationSec: 60,
  },
  crypto: {
    baseVolatility: 0.00011,
    trendStrength: 1.1,
    meanReversionRate: 0.06,
    noiseRatio: 0.22,
    gapProbability: 0.015,
    minWaveDurationSec: 20,
    maxWaveDurationSec: 75,
  },
  otc_forex: {
    baseVolatility: 0.000085,
    trendStrength: 1.0,
    meanReversionRate: 0.08,
    noiseRatio: 0.20,
    gapProbability: 0.01,
    minWaveDurationSec: 25,
    maxWaveDurationSec: 90,
  },
  real_forex: {
    baseVolatility: 0.000075,
    trendStrength: 0.95,
    meanReversionRate: 0.10,
    noiseRatio: 0.18,
    gapProbability: 0.005,
    minWaveDurationSec: 30,
    maxWaveDurationSec: 120,
  },
  stocks_commodities: {
    baseVolatility: 0.000095,
    trendStrength: 1.05,
    meanReversionRate: 0.07,
    noiseRatio: 0.22,
    gapProbability: 0.02,
    minWaveDurationSec: 20,
    maxWaveDurationSec: 80,
  }
};

export function getEngineConfigForPair(pair: string): PriceEngineConfig {
  if (pair.includes('Crypto IDX') || pair.includes('IDX')) return DEFAULT_CONFIGS.crypto_idx;
  if (pair.includes('BTC/') || pair.includes('ETH/') || pair.includes('SOL/') || pair.includes('BNB/')) return DEFAULT_CONFIGS.crypto;
  if (pair.includes('(OTC)')) return DEFAULT_CONFIGS.otc_forex;
  if (pair.includes('Gold') || pair.includes('Oil') || pair.includes('Apple') || pair.includes('Tesla')) return DEFAULT_CONFIGS.stocks_commodities;
  return DEFAULT_CONFIGS.real_forex;
}

export function getDecimalsForAsset(asset: string): number {
  if (asset.includes('SHIB') || asset.includes('PEPE') || asset.includes('BONK') || asset.includes('RSR') || asset.includes('FLOKI')) {
    return 8;
  }
  if (asset.includes('Crypto IDX') || asset.includes('BTC/') || asset.includes('ETH/') || asset.includes('US 30') || asset.includes('JPN 225')) {
    return 2;
  }
  if (asset.includes('/JPY')) {
    return 3;
  }
  if (asset.includes('Gold') || asset.includes('Oil') || asset.includes('Apple') || asset.includes('Tesla')) {
    return 2;
  }
  return 5;
}

const pairStates = new Map<string, PairPriceState>();

/**
 * Initializes or retrieves the continuous price state for a market pair
 */
export function getOrCreatePairPriceState(pair: string, initialPrice: number): PairPriceState {
  let state = pairStates.get(pair);
  if (!state) {
    const decimals = getDecimalsForAsset(pair);
    const config = getEngineConfigForPair(pair);
    const durationMs = (config.minWaveDurationSec + Math.random() * (config.maxWaveDurationSec - config.minWaveDurationSec)) * 1000;
    const initialPhase: MarketStatePhase = Math.random() < 0.45 ? 'TRENDING_UP' : (Math.random() < 0.90 ? 'TRENDING_DOWN' : 'CONSOLIDATION');
    
    state = {
      currentPrice: initialPrice > 0 ? initialPrice : 100.00,
      anchorPrice: initialPrice > 0 ? initialPrice : 100.00,
      phase: initialPhase,
      phaseDurationMs: durationMs,
      phaseElapsedMs: 0,
      targetPrice: initialPrice,
      volatilityMult: 1.0,
      drift: initialPhase === 'TRENDING_UP' ? 1 : (initialPhase === 'TRENDING_DOWN' ? -1 : 0),
      prevNoise: 0,
      lastTickTimeMs: Date.now(),
      decimals,
    };
    pairStates.set(pair, state);
  }
  return state;
}

/**
 * Steps the continuous stochastic market price forward in time
 * by dt milliseconds.
 */
export function stepPriceProcess(
  pair: string, 
  currentPrice: number, 
  nowMs: number, 
  biasDirection?: number // Admin/steering directional bias (-1 to 1)
): { price: number; isGap: boolean; gapDelta: number } {
  const state = getOrCreatePairPriceState(pair, currentPrice);
  const config = getEngineConfigForPair(pair);
  
  const dtMs = Math.max(1, Math.min(1000, nowMs - state.lastTickTimeMs));
  state.lastTickTimeMs = nowMs;
  state.phaseElapsedMs += dtMs;

  // 1. Check phase transition (Wave / Regime switching)
  let isGap = false;
  let gapDelta = 0;

  if (state.phaseElapsedMs >= state.phaseDurationMs) {
    state.phaseElapsedMs = 0;
    const nextDuration = (config.minWaveDurationSec + Math.random() * (config.maxWaveDurationSec - config.minWaveDurationSec)) * 1000;
    state.phaseDurationMs = nextDuration;
    state.anchorPrice = state.currentPrice;

    // Organic transition between market regimes
    const roll = Math.random();
    if (state.phase === 'TRENDING_UP') {
      state.phase = roll < 0.35 ? 'PULLBACK' : (roll < 0.65 ? 'CONSOLIDATION' : (roll < 0.85 ? 'VOLATILITY_EXPANSION' : 'TRENDING_DOWN'));
    } else if (state.phase === 'TRENDING_DOWN') {
      state.phase = roll < 0.35 ? 'PULLBACK' : (roll < 0.65 ? 'CONSOLIDATION' : (roll < 0.85 ? 'VOLATILITY_EXPANSION' : 'TRENDING_UP'));
    } else if (state.phase === 'PULLBACK') {
      state.phase = roll < 0.50 ? (state.drift > 0 ? 'TRENDING_UP' : 'TRENDING_DOWN') : 'CONSOLIDATION';
    } else if (state.phase === 'CONSOLIDATION') {
      state.phase = roll < 0.40 ? 'MOMENTUM_BURST' : (roll < 0.70 ? (Math.random() < 0.5 ? 'TRENDING_UP' : 'TRENDING_DOWN') : 'VOLATILITY_CONTRACTION');
    } else if (state.phase === 'MOMENTUM_BURST') {
      state.phase = roll < 0.50 ? 'PULLBACK' : 'CONSOLIDATION';
    } else {
      state.phase = roll < 0.45 ? 'TRENDING_UP' : (roll < 0.90 ? 'TRENDING_DOWN' : 'CONSOLIDATION');
    }

    // Set regime drift & volatility
    switch (state.phase) {
      case 'TRENDING_UP':
        state.drift = 0.65 + Math.random() * 0.75;
        state.volatilityMult = 0.9 + Math.random() * 0.3;
        break;
      case 'TRENDING_DOWN':
        state.drift = -(0.65 + Math.random() * 0.75);
        state.volatilityMult = 0.9 + Math.random() * 0.3;
        break;
      case 'PULLBACK':
        state.drift = -state.drift * (0.5 + Math.random() * 0.4);
        state.volatilityMult = 0.8 + Math.random() * 0.2;
        break;
      case 'CONSOLIDATION':
        state.drift = (Math.random() - 0.5) * 0.2;
        state.volatilityMult = 0.5 + Math.random() * 0.3;
        break;
      case 'VOLATILITY_EXPANSION':
        state.drift = (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6);
        state.volatilityMult = 1.6 + Math.random() * 0.9;
        break;
      case 'VOLATILITY_CONTRACTION':
        state.drift = (Math.random() - 0.5) * 0.1;
        state.volatilityMult = 0.35 + Math.random() * 0.25;
        break;
      case 'MOMENTUM_BURST':
        state.drift = (Math.random() < 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.0);
        state.volatilityMult = 2.0 + Math.random() * 1.0;
        break;
    }

    // Rare occasional micro-gap on phase break
    if (Math.random() < config.gapProbability) {
      isGap = true;
      const gapSign = state.drift >= 0 ? 1 : -1;
      gapDelta = gapSign * state.currentPrice * config.baseVolatility * (0.8 + Math.random() * 1.5);
    }
  }

  // 2. Continuous drift + mean reversion calculation
  const dtSec = dtMs / 1000;
  const effectiveVol = config.baseVolatility * state.volatilityMult;
  
  // Drift step
  let netDrift = state.drift * config.trendStrength;
  if (biasDirection !== undefined && biasDirection !== 0) {
    netDrift += biasDirection * 1.5;
  }
  
  const driftStep = state.currentPrice * effectiveVol * netDrift * dtSec * 1.8;

  // Mean reversion pull toward anchor
  const displacement = (state.currentPrice - state.anchorPrice) / (state.currentPrice || 1);
  const meanReversionPull = -displacement * config.meanReversionRate * state.currentPrice * dtSec;

  // High-frequency stochastic micro-noise (Brownian bridge with momentum filter)
  const z1 = (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 1.732; // Normal-like noise
  const rawNoise = z1 * effectiveVol * state.currentPrice * Math.sqrt(dtSec) * config.noiseRatio * 3.5;
  const filteredNoise = state.prevNoise * 0.65 + rawNoise * 0.35;
  state.prevNoise = filteredNoise;

  // Momentum impulses (Binomo / Quotex snappy step jumps)
  let jumpStep = 0;
  if (Math.random() < 0.08) {
    const jumpDir = Math.random() < 0.5 ? 1 : -1;
    jumpStep = jumpDir * effectiveVol * state.currentPrice * (0.3 + Math.random() * 0.7);
  }

  let nextPrice = state.currentPrice + driftStep + meanReversionPull + filteredNoise + jumpStep + gapDelta;

  // Strict positive check
  if (nextPrice <= 0.00000001 || !isFinite(nextPrice)) {
    nextPrice = state.anchorPrice > 0 ? state.anchorPrice : 100.00;
  }

  state.currentPrice = nextPrice;
  return {
    price: nextPrice,
    isGap,
    gapDelta,
  };
}
