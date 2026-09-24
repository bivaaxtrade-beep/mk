import React, { useEffect, useRef } from 'react';
import { createChart, ISeriesApi, CandlestickData, Time, CrosshairMode } from 'lightweight-charts';

interface TradingChartProps {
  activeIndicators?: string[];
}

export const TradingChart: React.FC<TradingChartProps> = ({ activeIndicators = ['sma', 'bb'] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const requestRef = useRef<number>(0);
  const lastCandleRef = useRef<CandlestickData<Time> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'>>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<'Line'>>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<'Line'>>(null);
  const bbMiddleSeriesRef = useRef<ISeriesApi<'Line'>>(null);
  const emaRibbonRefs = useRef<ISeriesApi<'Line'>[]>([]);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'>>(null);

  // Custom Binomo-style Price Line Refs
  const customPriceLineRef = useRef<HTMLDivElement>(null);
  const customPulseDotRef = useRef<HTMLDivElement>(null);
  const customPriceLabelRef = useRef<HTMLDivElement>(null);

  const timeframeSeconds = 5;
  const colors = {
    up: '#10b981',
    down: '#f43f5e',
    bg: '#0a0b0d',
    grid: 'rgba(255, 255, 255, 0.03)',
    border: '#1e222d',
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Load persisted zoom level
    const persistedBarSpacing = localStorage.getItem('trading_chart_bar_spacing');
    const initialBarSpacing = persistedBarSpacing ? parseFloat(persistedBarSpacing) : 22;

    // Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 450,
      layout: {
        background: { color: colors.bg },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: colors.border,
        autoScale: true,
        alignLabels: true,
        borderVisible: true,
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: true,
        barSpacing: initialBarSpacing,
        fixLeftEdge: false,
        fixRightEdge: false,
        rightOffset: 12,
        minBarSpacing: 8.0,
        maxBarSpacing: 70,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
        mouseWheel: true, 
        pinch: true,      
      },
      kineticScroll: {
        touch: true,
        mouse: true,
      },
    });

    // Strict Clamping: Prevent the chart from ever being dragged into a blank state
    const handleScrollAndClamp = () => {
      const timeScale = chart.timeScale();
      
      // Persist zoom level
      const currentSpacing = timeScale.options().barSpacing;
      if (currentSpacing) {
          localStorage.setItem('trading_chart_bar_spacing', currentSpacing.toString());
      }

      const visibleRange = timeScale.getVisibleRange();
      if (!visibleRange) return;
      
      // If user drags too far, we reset to the most recent data (allow up to 30 days of scroll back)
      if (Number(visibleRange.to) < Date.now() / 1000 - 3600 * 24 * 30) {
        timeScale.scrollToRealTime();
        return;
      }

      // Restrict dragging scroll so that the open candle (the latest bar) never goes left of the middle of the screen
      const scrollPos = timeScale.scrollPosition();
      const clientWidth = chartContainerRef.current?.clientWidth || 500;
      const barSpacing = currentSpacing || 22;
      const totalVisibleBars = clientWidth / barSpacing;
      
      // The middle of the screen corresponds to exactly half of totalVisibleBars
      const targetScrollPos = Math.floor(totalVisibleBars / 2);

      if (scrollPos > targetScrollPos) {
        timeScale.scrollToPosition(targetScrollPos, false);
      }
    };

    chart.timeScale().subscribeVisibleTimeRangeChange(handleScrollAndClamp);
    chart.timeScale().subscribeVisibleLogicalRangeChange(handleScrollAndClamp);

    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: colors.up,
      downColor: colors.down,
      borderVisible: true,
      borderUpColor: colors.up,
      borderDownColor: colors.down,
      wickUpColor: colors.up,
      wickDownColor: colors.down,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Add Indicator Series
    smaSeriesRef.current = (chart as any).addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      title: 'SMA 20',
      priceLineVisible: false,
      lastValueVisible: true,
    });

    bbUpperSeriesRef.current = (chart as any).addLineSeries({
      color: 'rgba(59, 130, 246, 0.4)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bbLowerSeriesRef.current = (chart as any).addLineSeries({
      color: 'rgba(59, 130, 246, 0.4)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    bbMiddleSeriesRef.current = (chart as any).addLineSeries({
      color: 'rgba(59, 130, 246, 0.2)',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // EMA Ribbon (6 levels)
    const ribbonColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];
    emaRibbonRefs.current = ribbonColors.map((color, i) => (chart as any).addLineSeries({
      color,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      title: `EMA ${(i + 1) * 10}`,
    }));

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    // 1. Generate Seamless Historical Data (No Gaps on App Load)
    const historyCount = 200; // Increased history
    let historicalData: CandlestickData<Time>[] = [];
    
    // Attempt to load from cache
    try {
      const cached = localStorage.getItem('trading_chart_candles_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          historicalData = parsed.map(d => ({
            ...d,
            time: Number(d.time) as Time
          }));
        }
      }
    } catch (e) {}

    const nowInit = Date.now();
    let historyTime = (Math.floor(nowInit / (timeframeSeconds * 1000)) * timeframeSeconds) - (historyCount * timeframeSeconds);
    let historyPrice = 1589.60;

    if (historicalData.length === 0) {
      for (let i = 0; i < historyCount; i++) {
        let open = historyPrice;
        
        // Add random gap-up or gap-down (20% chance) to simulate real market pricing
        if (i > 0 && Math.random() < 0.20) {
          const gapDirection = Math.random() > 0.5 ? 1 : -1;
          const gapAmount = gapDirection * (0.05 + Math.random() * 0.15);
          open += gapAmount;
        }

        const roll = Math.random();
        let close = open;
        let high = open;
        let low = open;

        if (roll < 0.2) {
           close = open + (Math.random() - 0.5) * 0.1;
           high = open + Math.random() * 0.5;
           low = open - Math.random() * 0.5;
        } else if (roll < 0.4) {
           const dir = Math.random() > 0.5 ? 1 : -1;
           const bodySize = (Math.random() * 0.8) + 0.4;
           close = open + (dir * bodySize);
           high = Math.max(open, close) + (Math.random() * 0.05);
           low = Math.min(open, close) - (Math.random() * 0.05);
        } else if (roll < 0.6) {
           const isHammer = Math.random() > 0.5;
           const bodySize = (Math.random() * 0.2) + 0.05;
           close = open + (Math.random() > 0.5 ? bodySize : -bodySize);
           if (isHammer) {
               high = Math.max(open, close) + Math.random() * 0.1;
               low = Math.min(open, close) - ((Math.random() * 0.8) + 0.4);
           } else {
               high = Math.max(open, close) + ((Math.random() * 0.8) + 0.4);
               low = Math.min(open, close) - Math.random() * 0.1;
           }
        } else {
           const dir = Math.random() > 0.5 ? 1 : -1;
           const bodySize = Math.random() * 0.5 + 0.2;
           close = open + (dir * bodySize);
           high = Math.max(open, close) + Math.random() * 0.4;
           low = Math.min(open, close) - Math.random() * 0.4;
        }

        historicalData.push({
          time: historyTime as Time,
          open,
          high,
          low,
          close,
        });
        historyPrice = close;
        historyTime += timeframeSeconds;
      }
    } else {
      historyPrice = historicalData[historicalData.length - 1].close;
    }
    
    // Indicator Calculation Functions
    const calculateSMA = (data: CandlestickData<Time>[], period: number) => {
      if (data.length < period) return [];
      const smaData = [];
      for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, val) => acc + val.close, 0);
        smaData.push({ time: data[i].time, value: sum / period });
      }
      return smaData;
    };

    const calculateBollingerBands = (data: CandlestickData<Time>[], period: number, stdDev: number) => {
      if (data.length < period) return { upper: [], lower: [], middle: [] };
      const upper = [];
      const lower = [];
      const middle = [];

      for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const closes = slice.map(d => d.close);
        const avg = closes.reduce((acc, val) => acc + val, 0) / period;
        
        const squareDiffs = closes.map(c => Math.pow(c - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / period;
        const sd = Math.sqrt(avgSquareDiff);

        middle.push({ time: data[i].time, value: avg });
        upper.push({ time: data[i].time, value: avg + (sd * stdDev) });
        lower.push({ time: data[i].time, value: avg - (sd * stdDev) });
      }
      return { upper, lower, middle };
    };

    const updateIndicators = (data: CandlestickData<Time>[]) => {
      const active = activeIndicators || [];
      
      // Calculate SMA 20
      if (smaSeriesRef.current) {
        if (active.includes('sma')) {
          smaSeriesRef.current.setData(calculateSMA(data, 20));
        } else {
          smaSeriesRef.current.setData([]);
        }
      }

      // Calculate Bollinger Bands
      const bb = calculateBollingerBands(data, 20, 2);
      if (bbUpperSeriesRef.current) {
        if (active.includes('bb')) bbUpperSeriesRef.current.setData(bb.upper);
        else bbUpperSeriesRef.current.setData([]);
      }
      if (bbLowerSeriesRef.current) {
        if (active.includes('bb')) bbLowerSeriesRef.current.setData(bb.lower);
        else bbLowerSeriesRef.current.setData([]);
      }
      if (bbMiddleSeriesRef.current) {
        if (active.includes('bb')) bbMiddleSeriesRef.current.setData(bb.middle);
        else bbMiddleSeriesRef.current.setData([]);
      }

      // Calculate EMA Ribbon
      emaRibbonRefs.current.forEach((series, i) => {
        const period = (i + 1) * 10;
        if (active.includes('ribbon')) {
          series.setData(calculateEMA(data, period));
        } else {
          series.setData([]);
        }
      });
    };

    const calculateEMA = (data: CandlestickData<Time>[], period: number) => {
      if (data.length < period) return [];
      const emaData = [];
      const k = 2 / (period + 1);
      let ema = data.slice(0, period).reduce((acc, val) => acc + val.close, 0) / period;
      
      emaData.push({ time: data[period - 1].time, value: ema });
      
      for (let i = period; i < data.length; i++) {
        ema = (data[i].close - ema) * k + ema;
        emaData.push({ time: data[i].time, value: ema });
      }
      return emaData;
    };

    // 2. Pre-fill chart with history
    candleSeries.setData(historicalData);
    updateIndicators(historicalData);
    
    const saveToCache = (newData: CandlestickData<Time>[]) => {
      try {
        const last300 = newData.slice(-300);
        localStorage.setItem('trading_chart_candles_cache', JSON.stringify(last300));
      } catch (e) {}
    };

    // 3. Perfect Sync: Real-time engine starts EXACTLY where history ended
    let visualPrice = historyPrice;
    let velocity = 0;
    
    let currentHistory = [...historicalData];
    let lastCacheTime = Date.now();

    // Personality variables for dynamic volatility
    let currentCandleStart = 0;
    let drift = 0;
    let volatilityMult = 1;
    let reversionStrength = 0;

    const updateLoop = () => {
      if (!seriesRef.current) return;

      const now = Date.now();
      const candleTime = (Math.floor(now / (timeframeSeconds * 1000)) * timeframeSeconds) as Time;

      // 1. High-Frequency Market Physics (Runs every frame at ~60 FPS)
      
      if (Number(candleTime) !== currentCandleStart) {
         currentCandleStart = Number(candleTime);
         // Roll new personality for the new 5-second candle
         const roll = Math.random();
         if (roll < 0.15) {
             // Doji/Balance: high reversion, low volatility (Less common)
             drift = 0;
             volatilityMult = 0.4 + (Math.random() * 0.2);
             reversionStrength = 0.06 + (Math.random() * 0.02);
         } else if (roll < 0.50) {
             // Strong Trend: strong drift, low reversion (More common)
             drift = (Math.random() - 0.5) * 0.15;
             volatilityMult = 1.0 + (Math.random() * 0.4);
             reversionStrength = 0.001;
         } else if (roll < 0.75) {
             // Volatile: high volatility, medium drift
             drift = (Math.random() - 0.5) * 0.08;
             volatilityMult = 1.2 + (Math.random() * 0.4);
             reversionStrength = 0.02;
         } else {
             // Normal professional
             drift = (Math.random() - 0.5) * 0.05;
             volatilityMult = 0.85;
             reversionStrength = 0.01;
         }
      }

      // Base random noise (Brownian motion) + drift
      // Added a time-based factor to ensure consistency regardless of frame rate
      const acceleration = ((Math.random() - 0.5) * 0.18 * volatilityMult) + drift;
      
      velocity += acceleration;
      
      // Friction/Damping: 0.93 gives it a fluid yet reactive feel
      velocity *= 0.93;

      // Rare volatility spikes (2% chance per frame) to simulate real market movement
      if (Math.random() > 0.98) {
          velocity += (Math.random() - 0.5) * 0.25 * volatilityMult;
      }

      // Mean Reversion (The secret to DOJI and LONG WICKS)
      const open = lastCandleRef.current ? lastCandleRef.current.open : visualPrice;
      const dist = Math.abs(visualPrice - open);
      
      if (dist > 0.30) {
          const reverseForce = (open - visualPrice) * reversionStrength; 
          velocity += reverseForce;
      }

      // Apply velocity directly to visual price
      visualPrice += velocity;

      // Anti-Stick: Ensure price always has a micro-movement
      if (Math.abs(velocity) < 0.0001) {
        visualPrice += (Math.random() - 0.5) * 0.001;
      }

      let updatedCandle: CandlestickData<Time>;

      // 2. Correct OHLC Tracking
      if (!lastCandleRef.current || (Number(candleTime) > Number(lastCandleRef.current.time))) {
        // Start of a new candle
        // Add random gap-up or gap-down (20% chance) to simulate real market pricing
        if (lastCandleRef.current && Math.random() < 0.20) {
          const gapDirection = Math.random() > 0.5 ? 1 : -1;
          const gapAmount = gapDirection * (0.05 + Math.random() * 0.15);
          visualPrice += gapAmount;
        }

        const openPrice = visualPrice;
        
        updatedCandle = {
          time: candleTime,
          open: openPrice,
          high: Math.max(openPrice, visualPrice),
          low: Math.min(openPrice, visualPrice),
          close: visualPrice,
        };

        // Add to history and cache every new candle
        currentHistory.push(updatedCandle);
        if (currentHistory.length > 500) currentHistory.shift();
        
        // Update indicators on new candle
        updateIndicators(currentHistory);
        
        // Save to cache instantly on every new candle to persist gap-ups/gap-downs across reloads
        saveToCache(currentHistory);
      } else {
        // Continuous development of the current candle
        const body = Math.abs(visualPrice - lastCandleRef.current.open);
        const maxWick = Math.max(body * 0.45, 0.15); // cap wicks to 45% of the body size or small offset
        const targetHigh = Math.max(lastCandleRef.current.open, visualPrice) + maxWick;
        const targetLow = Math.min(lastCandleRef.current.open, visualPrice) - maxWick;

        updatedCandle = {
          ...lastCandleRef.current,
          close: visualPrice,
          high: Math.max(lastCandleRef.current.open, visualPrice, Math.min(Math.max(lastCandleRef.current.high, visualPrice), targetHigh)),
          low: Math.min(lastCandleRef.current.open, visualPrice, Math.max(Math.min(lastCandleRef.current.low, visualPrice), targetLow)),
        };
      }

      lastCandleRef.current = updatedCandle;
      seriesRef.current.update(updatedCandle);

      // 3. Dynamic Binomo-style price line updates
      if (seriesRef.current && chartRef.current) {
        const y = seriesRef.current.priceToCoordinate(visualPrice);
        if (y !== null && y !== undefined) {
          // Check if current candle is green or red to update colors dynamically
          const isOpenGreen = lastCandleRef.current && (visualPrice >= lastCandleRef.current.open);
          const activeColor = isOpenGreen ? '#10b981' : '#f43f5e';
          const shadowColor = isOpenGreen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';

          // Update Horizontal Line
          if (customPriceLineRef.current) {
            customPriceLineRef.current.style.top = `${y}px`;
            customPriceLineRef.current.style.borderTop = `3px dashed ${activeColor}`; // Bold 3px dashed line
            customPriceLineRef.current.style.filter = `drop-shadow(0 0 6px ${shadowColor})`;
            customPriceLineRef.current.style.display = 'block';
          }

          // Update Pulse Dot at the latest candle position
          if (customPulseDotRef.current) {
            const timeScale = chartRef.current.timeScale();
            const x = lastCandleRef.current ? timeScale.timeToCoordinate(lastCandleRef.current.time) : null;
            if (x !== null && x !== undefined) {
              customPulseDotRef.current.style.left = `${x}px`;
              customPulseDotRef.current.style.top = `${y}px`;
              customPulseDotRef.current.style.display = 'block';
              
              // Update pulsing inner element colors dynamically!
              const pingRing1 = customPulseDotRef.current.children[0] as HTMLSpanElement;
              const pingRing2 = customPulseDotRef.current.children[1] as HTMLSpanElement;
              const solidCenter = customPulseDotRef.current.children[2] as HTMLSpanElement;
              
              if (pingRing1) pingRing1.style.backgroundColor = activeColor;
              if (pingRing2) pingRing2.style.backgroundColor = activeColor;
              if (solidCenter) {
                solidCenter.style.backgroundColor = activeColor;
                solidCenter.style.boxShadow = `0 0 12px ${activeColor}`;
              }
            } else {
              customPulseDotRef.current.style.display = 'none';
            }
          }

          // Update Price Label Badge on the right side over the price scale
          if (customPriceLabelRef.current) {
            customPriceLabelRef.current.style.top = `${y}px`;
            customPriceLabelRef.current.innerText = visualPrice.toFixed(2);
            customPriceLabelRef.current.style.backgroundColor = activeColor;
            customPriceLabelRef.current.style.boxShadow = `0 0 10px ${activeColor}`;
            customPriceLabelRef.current.style.display = 'block';
          }
        } else {
          // Hide elements if off-screen or invalid
          if (customPriceLineRef.current) customPriceLineRef.current.style.display = 'none';
          if (customPulseDotRef.current) customPulseDotRef.current.style.display = 'none';
          if (customPriceLabelRef.current) customPriceLabelRef.current.style.display = 'none';
        }
      }

      requestRef.current = requestAnimationFrame(updateLoop);
    };

    requestRef.current = requestAnimationFrame(updateLoop);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (chartRef.current) chartRef.current.remove();
    };
  }, [activeIndicators]);

  return (
    <div className="w-full bg-[#0a0b0d] rounded-xl border border-white/5 shadow-2xl overflow-hidden p-1">
      <div 
        ref={chartContainerRef} 
        className="w-full h-[450px] relative overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {/* Custom Binomo-style Price Line Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {/* Custom Horizontal Price Line */}
          <div 
            ref={customPriceLineRef}
            className="absolute left-0 right-0 h-[3px] bg-transparent pointer-events-none transition-all duration-75"
            style={{
              borderTop: '3px dashed #10b981', // Neon gold/yellow or dynamic green/red dashed line
              top: '0px',
              display: 'none',
            }}
          />

          {/* Pulsating Dot on the live candle */}
          <div 
            ref={customPulseDotRef}
            className="absolute pointer-events-none"
            style={{
              width: '32px',
              height: '32px',
              marginLeft: '-16px',
              marginTop: '-16px',
              top: '0px',
              left: '0px',
              display: 'none',
            }}
          >
            {/* Outer pulsing ring 1 */}
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: '1.5s' }} />
            {/* Outer pulsing ring 2 */}
            <span className="absolute inset-2 rounded-full bg-emerald-400/50 animate-pulse" style={{ animationDuration: '1s' }} />
            {/* Solid center dot */}
            <span className="absolute inset-3 rounded-full bg-emerald-400 border border-black shadow-[0_0_10px_rgba(16,185,129,1)]" />
          </div>

          {/* Styled Price Badge on the right side over the scale */}
          <div
            ref={customPriceLabelRef}
            className="absolute right-0 pointer-events-none px-2 py-1 rounded text-xs font-bold text-black bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)] z-20"
            style={{
              marginTop: '-10px',
              top: '0px',
              display: 'none',
            }}
          >
            0.00
          </div>
        </div>
      </div>
    </div>
  );
};
