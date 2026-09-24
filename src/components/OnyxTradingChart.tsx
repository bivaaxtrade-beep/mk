import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';

// Onyx Option Signature Colors
const ONYX_THEME = {
  background: '#0a0b0d', // Deep dark
  upColor: '#00c076',     // Onyx Green
  downColor: '#ff3b30',   // Onyx Red
  gridColor: 'rgba(42, 46, 57, 0.2)',
  textColor: '#d1d4dc',
  borderColor: '#2a2e39',
};

export const OnyxTradingChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<any>(null);
  const chartRef = useRef<any>(null);

  // Custom Binomo-style Price Line Refs
  const customPriceLineRef = useRef<HTMLDivElement>(null);
  const customPulseDotRef = useRef<HTMLDivElement>(null);
  const customPriceLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Load persisted zoom level
    const persistedBarSpacing = localStorage.getItem('onyx_chart_bar_spacing');
    const initialBarSpacing = persistedBarSpacing ? parseFloat(persistedBarSpacing) : 22;

    // 1. Initialize Chart with Professional Scaling and Interaction
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 450,
      layout: {
        background: { type: ColorType.Solid, color: ONYX_THEME.background },
        textColor: ONYX_THEME.textColor,
      },
      grid: {
        vertLines: { color: ONYX_THEME.gridColor },
        horzLines: { color: ONYX_THEME.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: ONYX_THEME.borderColor,
        autoScale: true, // Pillar: Keep candles within area
        alignLabels: true,
        borderVisible: true,
      },
      timeScale: {
        borderColor: ONYX_THEME.borderColor,
        timeVisible: true,
        secondsVisible: true,
        barSpacing: initialBarSpacing,
        minBarSpacing: 8.0,
        maxBarSpacing: 70,
        fixLeftEdge: true,
        rightOffset: 10,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      kineticScroll: {
        touch: false,
        mouse: false,
      },
    });
    chartRef.current = chart;

    // Persist zoom level and restrict scroll position so that the latest candle (open candle) cannot go left of the middle of the screen
    const handleScrollAndClamp = () => {
        const timeScale = chart.timeScale();
        const currentSpacing = timeScale.options().barSpacing;
        if (currentSpacing) {
            localStorage.setItem('onyx_chart_bar_spacing', currentSpacing.toString());
        }

        // Restrict dragging scroll so that the open candle (the latest bar) never goes left of the middle of the screen
        const scrollPos = timeScale.scrollPosition();
        const clientWidth = chartContainerRef.current?.clientWidth || 500;
        const barSpacing = currentSpacing || 22;
        const totalVisibleBars = clientWidth / barSpacing;

        const targetScrollPos = Math.floor(totalVisibleBars / 2);

        if (scrollPos > targetScrollPos) {
            timeScale.scrollToPosition(targetScrollPos, false);
        }
    };

    chart.timeScale().subscribeVisibleTimeRangeChange(handleScrollAndClamp);
    chart.timeScale().subscribeVisibleLogicalRangeChange(handleScrollAndClamp);

    // 2. Pillar 4: Visual Polish (Emerald & Rose)
    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: true,
      borderUpColor: '#10b981',
      borderDownColor: '#f43f5e',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      priceLineVisible: false,
      lastValueVisible: false,
    });

    seriesRef.current = candleSeries;

    // 3. Pillar 1 & 2: Continuity and Global Sync Logic
    const timeframeSeconds = 5;
    let lastCandle: any = null;
    let visualPrice = 1589.60;
    let velocity = 0;
    let drift = 0;
    let volatilityMult = 1;
    let reversionStrength = 0;
    let currentCandleStart = 0;

    const requestRef = useRef<number>(0);

    const updateLoop = () => {
      if (!seriesRef.current) return;

      const now = Date.now();
      const candleTime = Math.floor(now / (timeframeSeconds * 1000)) * timeframeSeconds;
      
      // 1. High-Frequency Market Physics (Runs every frame at ~60 FPS)
      
      if (Number(candleTime) !== currentCandleStart) {
         currentCandleStart = Number(candleTime);
         // Roll new personality for the new 5-second candle
         const roll = Math.random();
         if (roll < 0.15) {
             // Doji: high reversion, low volatility (Less common now)
             drift = 0;
             volatilityMult = 0.4;
             reversionStrength = 0.08;
         } else if (roll < 0.45) {
             // Strong Trend (Marubozu): strong drift, very low reversion (More common)
             drift = (Math.random() - 0.5) * 0.12;
             volatilityMult = 1.1;
             reversionStrength = 0.002;
         } else if (roll < 0.65) {
             // Rejection (Hammer/Shooting Star): strong initial burst, then we will reverse it.
             drift = (Math.random() - 0.5) * 0.08;
             volatilityMult = 1.3;
             reversionStrength = 0.05;
         } else if (roll < 0.85) {
             // Healthy Standard: medium volatility, low reversion
             drift = (Math.random() - 0.5) * 0.06;
             volatilityMult = 0.9;
             reversionStrength = 0.01;
         } else {
             // Normal volatile
             drift = (Math.random() - 0.5) * 0.04;
             volatilityMult = 0.8;
             reversionStrength = 0.015;
         }
      }

      // Base random noise (Brownian motion) + drift
      const acceleration = ((Math.random() - 0.5) * 0.15 * volatilityMult) + drift;
      
      velocity += acceleration;
      
      // Friction/Damping: 0.92 gives it a "sharp" but fluid tick feel (like Quotex)
      velocity *= 0.92;

      // Rare volatility spikes (1.5% chance per frame)
      if (Math.random() > 0.985) {
          velocity += (Math.random() - 0.5) * 0.2 * volatilityMult;
      }

      // Mean Reversion (The secret to DOJI and LONG WICKS)
      // We pull the price back towards the candle's open if it moves too far
      const open = lastCandle ? lastCandle.open : visualPrice;
      const dist = Math.abs(visualPrice - open);
      
      if (dist > 0.25) {
          // Spring force pulling it back. Reduced strength and increased distance threshold.
          const reverseForce = (open - visualPrice) * reversionStrength; 
          velocity += reverseForce;
      }

      // Apply velocity directly to visual price
      visualPrice += velocity;

      let updatedCandle;

      // 2. Natural OHLC Tracking
      if (!lastCandle || Number(candleTime) > Number(lastCandle.time)) {
        // Add random gap-up or gap-down (20% chance) to simulate real market pricing
        if (lastCandle && Math.random() < 0.20) {
          const gapDirection = Math.random() > 0.5 ? 1 : -1;
          const gapAmount = gapDirection * (0.05 + Math.random() * 0.15);
          visualPrice += gapAmount;
        }

        const openPrice = visualPrice;
        
        updatedCandle = {
          time: candleTime as any,
          open: openPrice,
          high: Math.max(openPrice, visualPrice),
          low: Math.min(openPrice, visualPrice),
          close: visualPrice,
        };
      } else {
        const body = Math.abs(visualPrice - lastCandle.open);
        const maxWick = Math.max(body * 0.45, 0.15); // cap wicks to 45% of the body size or small offset
        const targetHigh = Math.max(lastCandle.open, visualPrice) + maxWick;
        const targetLow = Math.min(lastCandle.open, visualPrice) - maxWick;

        updatedCandle = {
          ...lastCandle,
          close: visualPrice,
          high: Math.max(lastCandle.open, visualPrice, Math.min(Math.max(lastCandle.high, visualPrice), targetHigh)),
          low: Math.min(lastCandle.open, visualPrice, Math.max(Math.min(lastCandle.low, visualPrice), targetLow)),
        };
      }

      lastCandle = updatedCandle;
      seriesRef.current.update(updatedCandle);
      
      // 3. Dynamic Binomo-style price line updates
      if (seriesRef.current && chartRef.current) {
        const y = seriesRef.current.priceToCoordinate(visualPrice);
        if (y !== null && y !== undefined) {
          // Check if current candle is green or red to update colors dynamically
          const isOpenGreen = lastCandle && (visualPrice >= lastCandle.open);
          const activeColor = isOpenGreen ? '#00c076' : '#ff3b30';
          const shadowColor = isOpenGreen ? 'rgba(0, 192, 118, 0.4)' : 'rgba(255, 59, 48, 0.4)';

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
            const x = lastCandle ? timeScale.timeToCoordinate(lastCandle.time) : null;
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
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  function THEME_RED_OR_GREEN() { return ONYX_THEME.downColor; }

  return (
    <div className="w-full bg-[#0a0b0d] rounded-xl overflow-hidden border border-[#2a2e39] mb-4">
      <div className="px-4 py-3 border-b border-[#2a2e39] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00c076] rounded-full animate-pulse" />
          <span className="text-white font-bold text-sm tracking-wider">ONYX ENGINE LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs">TF: 5S</span>
          <span className="text-gray-500 text-xs">UTC+6</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full relative overflow-hidden h-[450px]">
        {/* Custom Binomo-style Price Line Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {/* Custom Horizontal Price Line */}
          <div 
            ref={customPriceLineRef}
            className="absolute left-0 right-0 h-[3px] bg-transparent pointer-events-none transition-all duration-75"
            style={{
              borderTop: '3px dashed #00c076', // Onyx theme green/red dashed line
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
            <span className="absolute inset-3 rounded-full bg-emerald-400 border border-black shadow-[0_0_10px_rgba(0,192,118,1)]" />
          </div>

          {/* Styled Price Badge on the right side over the scale */}
          <div
            ref={customPriceLabelRef}
            className="absolute right-0 pointer-events-none px-2 py-1 rounded text-xs font-bold text-black bg-emerald-400 shadow-[0_0_10px_rgba(0,192,118,0.9)] z-20"
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
