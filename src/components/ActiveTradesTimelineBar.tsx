import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AssetLogo } from './AssetLogo';

export interface ActiveTradesTimelineBarProps {
  activeTrades: any[];
  now: Date;
  timeZone: string;
  userCurrency: string;
  markets: Record<string, any>;
  currentPrices?: Record<string, number>;
  activeAsset?: string;
  onSelectAsset?: (asset: string) => void;
  onViewOpenTrades?: () => void;
  formatWithCurrency?: (amt: number, curr?: string) => string;
  className?: string;
}

export const ActiveTradesTimelineBar: React.FC<ActiveTradesTimelineBarProps> = ({
  activeTrades = [],
  now,
  timeZone = 'UTC',
  userCurrency = 'USD',
  markets = {},
  currentPrices = {},
  activeAsset,
  onSelectAsset,
  onViewOpenTrades,
  formatWithCurrency = (amt: number, curr = 'USD') => `${curr === 'BDT' ? '৳' : '$'}${amt.toFixed(2)}`,
  className = ''
}) => {
  // Format current live time in HH:mm:ss for the selected timezone
  const liveTimeString = useMemo(() => {
    try {
      return now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: timeZone || 'UTC'
      });
    } catch (e) {
      return now.toTimeString().split(' ')[0];
    }
  }, [now, timeZone]);

  // Compute GMT offset string (e.g., "GMT+6", "GMT+0", "GMT-4")
  const gmtOffsetString = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone || 'UTC',
        timeZoneName: 'shortOffset'
      }).formatToParts(now);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      if (tzPart && tzPart.value) {
        return tzPart.value;
      }
    } catch (e) {}

    // Fallback: estimate offset based on UTC difference
    try {
      const invDate = new Date(now.toLocaleString('en-US', { timeZone: timeZone || 'UTC' }));
      const diffMinutes = Math.round((invDate.getTime() - now.getTime()) / 60000) - now.getTimezoneOffset();
      const sign = diffMinutes >= 0 ? '+' : '-';
      const absDiff = Math.abs(diffMinutes);
      const hours = Math.floor(absDiff / 60);
      const mins = absDiff % 60;
      return `GMT${sign}${hours}${mins > 0 ? `:${mins.toString().padStart(2, '0')}` : ''}`;
    } catch (e) {
      return 'GMT+6';
    }
  }, [now, timeZone]);

  const hasActiveTrades = activeTrades && activeTrades.length > 0;

  return (
    <div 
      className={`relative w-full h-[36px] bg-[#1c1d22] border-y border-white/5 flex items-center overflow-hidden select-none z-20 ${className}`}
    >
      <AnimatePresence mode="wait">
        {!hasActiveTrades ? (
          /* Normal State (Binomo exact style): "21:26:36 GMT+6       View open trades" */
          <motion.div
            key="timeline-normal-binomo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full h-full flex items-center justify-between px-3 md:px-5"
          >
            {/* Left: Live Ticking Clock + GMT Offset */}
            <div className="flex items-center gap-2 text-[#90939e] text-[12px] font-medium tracking-tight">
              <span className="font-mono tracking-normal text-[#9ca3af]">{liveTimeString}</span>
              <span className="text-[#6b7280] text-[11px] font-medium">{gmtOffsetString}</span>
            </div>

            {/* Right: View open trades clickable link */}
            <button
              type="button"
              onClick={onViewOpenTrades}
              className="text-[#90939e] hover:text-white underline underline-offset-2 text-[12px] font-medium cursor-pointer transition-colors"
            >
              View open trades
            </button>
          </motion.div>
        ) : (
          /* Active Trade State: Binomo Live Trade Horizontal Ticker Strip */
          <motion.div
            key="active-trades-ticker"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18 }}
            className="w-full h-full flex items-center justify-between px-2.5 overflow-hidden"
          >
            {/* Horizontal Scrollable Active Trade Badges */}
            <div
              className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar py-0.5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {activeTrades.map((trade, idx) => {
                const tradeAsset = trade.asset || 'BTC/USD';
                const tradeAmount = Number(trade.amount || 0);
                const payoutRate = Number(trade.payout || trade.payoutRate || markets[tradeAsset]?.payout || 80);
                const potentialReturn = tradeAmount * (1 + payoutRate / 100);

                // Calculate live countdown and remaining progress
                const nowMs = now.getTime();
                const expMs = Number(trade.expirationTime || (trade.createdAt ? trade.createdAt + (trade.timeLeft || 60) * 1000 : nowMs + 60000));
                const createdMs = Number(trade.createdAt || (expMs - (trade.timeLeft || 60) * 1000));
                const totalDurationMs = Math.max(5000, expMs - createdMs);
                const remainingMs = Math.max(0, expMs - nowMs);
                const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));
                const mins = Math.floor(remainingSecs / 60);
                const secs = remainingSecs % 60;
                const formattedCountdown = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                const progressRatio = Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100));

                // Determine current win/loss dynamic status
                const marketPriceRaw = markets[tradeAsset]?.price || markets[tradeAsset.toUpperCase()]?.price;
                const currentAssetPrice = (currentPrices && (currentPrices[tradeAsset] || currentPrices[tradeAsset.toUpperCase()])) || (marketPriceRaw ? parseFloat(marketPriceRaw) : 0) || trade.entryPrice || 0;
                const isTradeUp = trade.type === 'up' || trade.direction === 'up';
                const isWinning = currentAssetPrice && trade.entryPrice 
                  ? (isTradeUp ? currentAssetPrice > trade.entryPrice : currentAssetPrice < trade.entryPrice)
                  : true;

                const isSelectedAsset = activeAsset && (activeAsset.toLowerCase() === tradeAsset.toLowerCase());

                return (
                  <div
                    key={`timeline-active-trade-${trade.id || idx}`}
                    onClick={() => onSelectAsset && onSelectAsset(tradeAsset)}
                    className={`flex items-center gap-2 bg-transparent hover:bg-white/[0.04] px-2 py-1 rounded-[4px] shrink-0 transition-all cursor-pointer active:scale-[0.98] ${
                      isSelectedAsset ? 'bg-white/[0.06]' : ''
                    }`}
                    title={`${tradeAsset} Trade - Click to view chart`}
                  >
                    {/* 1. Asset Logo */}
                    <div className="shrink-0">
                      <AssetLogo name={tradeAsset} size={18} />
                    </div>

                    {/* 2. Amount & Return (৳100.00 → ৳180.00) */}
                    <div className="flex items-center gap-1 text-[12px] font-bold tracking-tight whitespace-nowrap">
                      <span className="text-gray-200">
                        {formatWithCurrency(tradeAmount, userCurrency)}
                      </span>
                      <span className="text-gray-500 font-normal text-[11px]">→</span>
                      <span className={isWinning ? "text-white font-extrabold" : "text-gray-400 font-semibold line-through opacity-80"}>
                        {formatWithCurrency(potentialReturn, userCurrency)}
                      </span>
                    </div>

                    {/* 3. Countdown Timer & Mini Progress Bar */}
                    <div className="flex items-center gap-1.5 bg-[#121316]/60 px-2 py-0.5 rounded-[4px] shrink-0">
                      <span className="text-[11px] font-mono font-bold text-gray-200 tracking-tight">
                        {formattedCountdown}
                      </span>
                      <div className="w-5 h-1.5 bg-[#2a2d36] rounded-full overflow-hidden shrink-0">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isWinning ? 'bg-[#13b878]' : 'bg-[#ea4d5d]'}`} 
                          style={{ width: `${progressRatio}%` }} 
                        />
                      </div>
                    </div>

                    {/* 4. Direction Arrow Badge (Green UP / Red DOWN) */}
                    <div 
                      className={`w-4 h-4 rounded-[4px] flex items-center justify-center text-white shrink-0 shadow-sm ${
                        isTradeUp ? 'bg-[#13b878]' : 'bg-[#ea4d5d]'
                      }`}
                    >
                      {isTradeUp ? (
                        <ArrowUpRight size={12} strokeWidth={2.8} />
                      ) : (
                        <ArrowDownRight size={12} strokeWidth={2.8} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: View open trades link */}
            <button
              type="button"
              onClick={onViewOpenTrades}
              className="shrink-0 ml-2 hidden sm:block text-[#90939e] hover:text-white underline underline-offset-2 text-[11px] font-medium cursor-pointer transition-colors"
            >
              View open trades
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
