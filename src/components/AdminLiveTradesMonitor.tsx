import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, TrendingUp, TrendingDown, CheckCircle, XCircle, 
  Search, RefreshCw, Zap, Shield, User, DollarSign, Clock, AlertCircle
} from 'lucide-react';
import { AssetLogo } from './AssetLogo';
import { toast } from 'react-hot-toast';
import { getCurrencySymbol } from '../lib/currencies';
import { io, Socket } from 'socket.io-client';

interface Trade {
  id: number | string;
  firebaseId?: string;
  userId: string;
  userEmail?: string;
  displayName?: string;
  asset: string;
  marketId?: string;
  direction: 'up' | 'down' | 'call' | 'put';
  amount: number;
  entryPrice: number;
  duration: number;
  expiryTime: number;
  createdAt: number;
  status: 'open' | 'won' | 'lost' | 'draw';
  targetResult?: 'win' | 'loss' | 'neutral';
  isDemo: boolean;
  accountType?: string;
}

export const AdminLiveTradesMonitor: React.FC<{ userCurrency?: string }> = ({ userCurrency = 'BDT' }) => {
  const [realTrades, setRealTrades] = useState<Trade[]>([]);
  const [demoTrades, setDemoTrades] = useState<Trade[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('all');
  const [forcingTradeId, setForcingTradeId] = useState<string | number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch open trades from server
  const fetchOpenTrades = async () => {
    try {
      const res = await fetch('/api/admin/open-trades');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRealTrades(data.realTrades || []);
          setDemoTrades(data.demoTrades || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch open trades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenTrades();
    const interval = setInterval(fetchOpenTrades, 1500); // Poll every 1.5s for instant sync

    // Socket.io connection for real-time market price updates
    const socket = io();
    socketRef.current = socket;

    socket.on('market_tick', (tick: any) => {
      if (tick && tick.pair && typeof tick.price === 'number') {
        setLivePrices(prev => ({
          ...prev,
          [tick.pair]: tick.price
        }));
      }
    });

    socket.on('admin_trade_updated', () => {
      fetchOpenTrades();
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const handleForceResult = async (tradeId: number | string, targetResult: 'win' | 'loss') => {
    setForcingTradeId(tradeId);
    try {
      const res = await fetch('/api/admin/trade/force-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId, targetResult })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Trade #${tradeId} set to Force ${targetResult.toUpperCase()}!`);
        // Update local state instantly
        const updater = (list: Trade[]) => list.map(t => 
          String(t.id) === String(tradeId) || (t.firebaseId && String(t.firebaseId) === String(tradeId))
            ? { ...t, targetResult }
            : t
        );
        setRealTrades(updater);
        setDemoTrades(updater);
      } else {
        toast.error(data.error || 'Failed to update trade outcome');
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setForcingTradeId(null);
    }
  };

  const filterTrades = (trades: Trade[]) => {
    return trades.filter(t => {
      const matchesSearch = 
        !searchTerm || 
        (t.userEmail && t.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.displayName && t.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.asset && t.asset.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(t.id).includes(searchTerm);

      const matchesAsset = selectedAssetFilter === 'all' || t.asset === selectedAssetFilter;

      return matchesSearch && matchesAsset;
    });
  };

  const filteredReal = filterTrades(realTrades);
  const filteredDemo = filterTrades(demoTrades);

  // Collect all unique assets for filtering dropdown
  const allAssets = Array.from(new Set([...realTrades, ...demoTrades].map(t => t.asset)));

  const renderTradeCard = (t: Trade, isReal: boolean) => {
    const currentPrice = livePrices[t.asset] || t.entryPrice;
    const isUp = t.direction === 'up' || t.direction === 'call';
    
    // Calculate live status: in the money vs out of the money
    let isWinning = false;
    if (isUp) {
      isWinning = currentPrice > t.entryPrice;
    } else {
      isWinning = currentPrice < t.entryPrice;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const expirySec = Number(t.expiryTime);
    const durationSec = Math.max(1, Number(t.duration) || 60);
    const timeLeft = Math.max(0, expirySec - nowSec);
    const progressPercent = Math.min(100, Math.max(0, ((durationSec - timeLeft) / durationSec) * 100));

    return (
      <div 
        key={`trade-${t.id}`}
        className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
          isReal 
            ? 'bg-[#0f1715] border-emerald-500/20 hover:border-emerald-500/40' 
            : 'bg-[#15130d] border-amber-500/20 hover:border-amber-500/40'
        }`}
      >
        {/* TOP ROW: USER & ASSET */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <AssetLogo name={t.asset} size={36} />
            <div className="truncate">
              <h4 className="text-sm font-black text-white truncate flex items-center gap-2">
                {t.asset}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                  isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {isUp ? 'CALL ↑' : 'PUT ↓'}
                </span>
              </h4>
              <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <User size={10} className="text-gray-500" />
                {t.displayName || t.userEmail || t.userId}
              </p>
            </div>
          </div>

          <div className="text-end shrink-0">
            <div className="text-sm font-black text-white font-mono">
              {getCurrencySymbol(userCurrency)}{t.amount.toFixed(2)}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center justify-end gap-1 ${
              isWinning ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isWinning ? (
                <>
                  <TrendingUp size={12} />
                  <span>WINNING (+82%)</span>
                </>
              ) : (
                <>
                  <TrendingDown size={12} />
                  <span>LOSING (-100%)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: ENTRY VS CURRENT PRICE */}
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono text-[11px]">
          <div>
            <span className="text-gray-500 text-[9px] uppercase block font-sans font-bold">Entry Price</span>
            <span className="text-white font-bold">{t.entryPrice.toFixed(t.asset.includes('IDX') ? 2 : 5)}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[9px] uppercase block font-sans font-bold">Live Price</span>
            <span className={`font-bold ${isWinning ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentPrice.toFixed(t.asset.includes('IDX') ? 2 : 5)}
            </span>
          </div>
        </div>

        {/* COUNTDOWN TIMER BAR */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-gray-500 flex items-center gap-1 font-mono">
              <Clock size={11} className="text-gray-400" />
              {timeLeft}s remaining
            </span>
            {t.targetResult && (
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                t.targetResult === 'win' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                FORCED {t.targetResult.toUpperCase()}
              </span>
            )}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isReal ? 'bg-emerald-500' : 'bg-amber-500'
              }`} 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS: FORCE WIN & FORCE LOSS (ONLY FOR REAL ACCOUNTS) */}
        {isReal ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              disabled={forcingTradeId === t.id}
              onClick={() => handleForceResult(t.id, 'win')}
              className={`py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                t.targetResult === 'win'
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20 scale-105'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <CheckCircle size={13} />
              Force Win
            </button>

            <button
              disabled={forcingTradeId === t.id}
              onClick={() => handleForceResult(t.id, 'loss')}
              className={`py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                t.targetResult === 'loss'
                  ? 'bg-red-500 text-white shadow-red-500/20 scale-105'
                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              <XCircle size={13} />
              Force Loss
            </button>
          </div>
        ) : (
          <div className="pt-1 flex items-center justify-center py-2 px-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-400/80 text-[10px] font-bold tracking-wider uppercase gap-1.5">
            <Shield size={12} className="text-amber-400" />
            <span>Pure Natural Flow (No Manipulation on Demo)</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH HEADER */}
      <div className="bg-[#0d0d12] border border-white/10 rounded-[28px] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search trader email, asset, trade ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <select
            value={selectedAssetFilter}
            onChange={e => setSelectedAssetFilter(e.target.value)}
            className="bg-white/5 border border-white/10 text-xs text-white rounded-2xl px-3 py-2.5 outline-none font-medium"
          >
            <option value="all" className="bg-[#0d0d12]">All Markets ({allAssets.length})</option>
            {allAssets.map(asset => (
              <option key={asset} value={asset} className="bg-[#0d0d12]">{asset}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={fetchOpenTrades}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* DUAL PANELS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: REAL ACCOUNT LIVE ENTRIES */}
        <div className="bg-[#0d1210] border border-emerald-500/30 rounded-[32px] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Zap size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Real Account Live Entries
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </h3>
                <p className="text-xs text-emerald-400/80 font-medium">Real money positions live on chart</p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black">
              {filteredReal.length} Active
            </div>
          </div>

          {filteredReal.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <Activity size={32} className="mx-auto text-gray-600 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-wider">No active Real Account trades</p>
              <p className="text-[10px] text-gray-600">Trades placed on Real accounts will appear here instantly</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredReal.map(t => renderTradeCard(t, true))}
            </div>
          )}
        </div>

        {/* PANEL 2: DEMO ACCOUNT LIVE ENTRIES */}
        <div className="bg-[#14120b] border border-amber-500/30 rounded-[32px] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Demo Account Live Entries
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                </h3>
                <p className="text-xs text-amber-400/80 font-medium">Practice demo positions live on chart</p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black">
              {filteredDemo.length} Active
            </div>
          </div>

          {filteredDemo.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <Activity size={32} className="mx-auto text-gray-600 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-wider">No active Demo Account trades</p>
              <p className="text-[10px] text-gray-600">Trades placed on Demo accounts will appear here instantly</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredDemo.map(t => renderTradeCard(t, false))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
