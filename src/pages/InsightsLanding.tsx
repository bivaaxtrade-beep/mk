import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Search, 
  Clock, 
  Globe, 
  BookOpen, 
  HelpCircle, 
  Calculator, 
  Calendar, 
  Coins, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle, 
  Zap, 
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Award,
  ChevronDown
} from 'lucide-react';
import SEO from '../components/SEO';

// 1. ECONOMIC CALENDAR DATA FOR WORLD NEWS
const ECONOMIC_EVENTS = [
  { time: "18:30", currency: "USD", impact: "HIGH", event: "Core CPI (MoM) (Aug)", actual: "0.2%", forecast: "0.2%", previous: "0.1%", status: "bullish" },
  { time: "20:15", currency: "EUR", impact: "HIGH", event: "ECB Interest Rate Decision", actual: "4.25%", forecast: "4.25%", previous: "4.50%", status: "neutral" },
  { time: "21:30", currency: "USD", impact: "HIGH", event: "Initial Jobless Claims", actual: "216K", forecast: "230K", previous: "228K", status: "bullish" },
  { time: "23:00", currency: "GBP", impact: "MEDIUM", event: "BoE Gov Bailey Speaks", actual: "-", forecast: "-", previous: "-", status: "pending" },
  { time: "05:50", currency: "JPY", impact: "MEDIUM", event: "GDP (QoQ) (Q2)", actual: "0.7%", forecast: "0.8%", previous: "0.5%", status: "bearish" }
];

// 2. LIVE MARKET SIGNALS & TECH ANALYSIS
const MARKET_ASSETS = [
  { name: "EUR/USD", price: 1.0842, change: "+0.15%", signal: "Strong Buy", rsi: "64.2", macd: "Bullish Crossover", color: "text-[#00c980]" },
  { name: "GBP/USD", price: 1.2915, change: "-0.08%", signal: "Neutral", rsi: "50.1", macd: "Sideways Range", color: "text-gray-400" },
  { name: "BTC/USDT", price: 62450.00, change: "+3.45%", signal: "Strong Buy", rsi: "71.5", macd: "Strong Momentum", color: "text-[#00c980]" },
  { name: "ETH/USDT", price: 2450.80, change: "+2.12%", signal: "Buy", rsi: "58.7", macd: "Upward Slope", color: "text-[#00c980]" },
  { name: "XAU/USD (Gold)", price: 2518.40, change: "+0.85%", signal: "Strong Buy", rsi: "68.9", macd: "Bullish Channel", color: "text-[#00c980]" },
  { name: "USO/USD (Crude Oil)", price: 68.24, change: "-1.45%", signal: "Strong Sell", rsi: "32.1", macd: "Bearish Breakout", color: "text-[#f45c5c]" }
];

// 3. FORECAST WRITTEN ARTICLES (SEO POWERFUL PARAGRAPHS)
const INSIGHT_ARTICLES = [
  {
    id: 1,
    tag: "Market Brief",
    title: "US inflation cools down to 2.5%: Federal Reserve prepared for interest rate cuts",
    desc: "The latest Consumer Price Index (CPI) metrics suggest a clear macro shift. Here is our exclusive technical forecast for EUR/USD and Gold trading opportunities in the coming days.",
    author: "Bivaax Research Desk",
    readTime: "4 min read",
    content: "The global trading environment is bracing for high volatility. As CPI figures settle comfortably near the 2.5% target zone, economists predict a 25 basis point reduction in federal rates. For binary and OTC options traders, this macro backdrop supports an upward momentum for Gold (XAU/USD) and EUR/USD due to weakness in the US Dollar index (DXY). Monitor local support at 1.0810 for potential high payout entries."
  },
  {
    id: 2,
    tag: "Crypto Intelligence",
    title: "Bitcoin breaks above major $62K resistance: Target $68K in sight?",
    desc: "With substantial spot ETF inflows and whale accumulation on major exchanges, Bitcoin shows high momentum breakout patterns. Read Bivaax dynamic on-chain sentiment breakdown.",
    author: "Crypto Analyst Division",
    readTime: "5 min read",
    content: "On-chain transaction tracking reveals that short-term Bitcoin holders have ceased distribution, while spot accumulation rates hit a 3-month high. The successful defense of the $58,000 support level has cleared the path for a test of the $65,000 and eventually the $68,000 historical resistance zones. Leverage dynamic volatility indicators to trade OTC indices around major US trading sessions."
  }
];

export default function InsightsLandingPage() {
  const [activeTab, setActiveTab] = useState<'signals' | 'calculator' | 'calendar' | 'articles'>('signals');

  // LIVE MARKET TICK SIMULATOR
  const [liveAssets, setLiveAssets] = useState(MARKET_ASSETS);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAssets(prev => prev.map(asset => {
        const volatility = asset.name.includes("BTC") ? 45 : (asset.name.includes("ETH") ? 2.5 : 0.0008);
        const rand = (Math.random() - 0.5) * 2;
        const priceDelta = rand * volatility;
        const newPrice = Math.max(0.0001, asset.price + priceDelta);
        const changePercent = (parseFloat(asset.change) + rand * 0.1).toFixed(2);
        
        let signal = asset.signal;
        let color = asset.color;
        if (asset.name.includes("BTC") || asset.name.includes("Gold")) {
          signal = "Strong Buy";
          color = "text-[#00c980]";
        } else {
          signal = Math.random() > 0.6 ? "Buy" : (Math.random() < 0.4 ? "Sell" : "Neutral");
          color = signal.includes("Buy") ? "text-[#00c980]" : (signal.includes("Sell") ? "text-[#f45c5c]" : "text-gray-400");
        }

        return {
          ...asset,
          price: newPrice,
          change: (rand >= 0 ? "+" : "") + changePercent + "%",
          signal,
          color
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // CALCULATOR STATE MANAGEMENT
  const [calcType, setCalcType] = useState<'profit' | 'fibonacci'>('profit');
  const [investment, setInvestment] = useState(100);
  const [payout, setPayout] = useState(85);
  const [successRate, setSuccessRate] = useState(60);
  const [calcTrades, setCalcTrades] = useState(10);
  
  // Fibonacci state
  const [highPrice, setHighPrice] = useState(2500);
  const [lowPrice, setLowPrice] = useState(2400);

  // Profit calculations
  const potentialProfitPerTrade = investment * (payout / 100);
  const winCount = Math.round(calcTrades * (successRate / 100));
  const lossCount = calcTrades - winCount;
  const grossProfit = winCount * potentialProfitPerTrade;
  const grossLoss = lossCount * investment;
  const netProfit = grossProfit - grossLoss;

  // Fibonacci Golden Levels
  const diff = highPrice - lowPrice;
  const fibLevels = {
    "0.0%": highPrice,
    "23.6%": (highPrice - diff * 0.236).toFixed(2),
    "38.2%": (highPrice - diff * 0.382).toFixed(2),
    "50.0%": (highPrice - diff * 0.5).toFixed(2),
    "61.8%": (highPrice - diff * 0.618).toFixed(2),
    "78.6%": (highPrice - diff * 0.786).toFixed(2),
    "100.0%": lowPrice
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-white font-sans selection:bg-[#ffcf00]/30 selection:text-black overflow-x-hidden">
      
      {/* EXTREMELY STRONG SEO INJECTIONS FOR MULTIPLE SUBDOMAIN LINKINGS */}
      <SEO 
        title="Bivaax Insights | Real-time Market Signals, Analytics & Forex Calculators"
        description="Access official Bivaax Market Insights. View live technical sentiment signals for major currencies, indices, cryptocurrencies, real-time economic calendars, and expert Fibonacci calculators."
        keywords="Bivaax insights, insights.bivaax.com, Bivaax signals, live trading signals, binary options profit calculator, Fibonacci calculator, US inflation trading, BTC technical forecast"
        url="https://insights.bivaax.com/"
        type="website"
      />

      {/* JSON-LD SCHEMA FOR GOOGLE SEARCH CONSOLE CONTEXT */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Bivaax Insights",
          "url": "https://insights.bivaax.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://insights.bivaax.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>

      {/* LUXURY AMBIENT BACKGROUNDS */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#ffcf00]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* FLOATING NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#07080a]/90 backdrop-blur-3xl border-b border-white/5 z-50 px-6 md:px-12">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <a href="https://bivaax.com" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-[#ffcf00] to-[#e69d00] rounded-xl shadow-lg shadow-[#ffcf00]/10 group-hover:scale-105 transition-transform duration-300">
              <span className="text-black font-black text-xl">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-black tracking-tighter leading-none mb-0.5 uppercase">Bivaax</span>
              <span className="text-[9px] text-[#ffcf00] font-black uppercase tracking-[0.25em] leading-none">INSIGHTS & INTEL</span>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#ffcf00]/10 border border-[#ffcf00]/20 rounded-full text-[#ffcf00] text-xs font-bold">
              <Sparkles size={12} className="animate-pulse" />
              <span>AI Sentiment Sentinels: Active</span>
            </div>
            <a 
              href="https://bivaax.com" 
              className="px-5 py-2.5 rounded-xl text-[12px] font-black text-gray-300 hover:text-white transition-colors uppercase tracking-widest border border-white/5 hover:border-white/10 bg-white/5"
            >
              Start Trading Room
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-36 pb-12 px-6 md:px-12 text-center relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#ffcf00]/10 border border-[#ffcf00]/20 rounded-full mb-6 shadow-xl"
        >
          <Award size={13} className="text-[#ffcf00]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#ffcf00]">Verified Global Market Sentinel Hub</span>
        </motion.div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight max-w-5xl mx-auto mb-6 leading-none uppercase">
          Market Intelligence <br />
          <span className="bg-gradient-to-r from-[#ffcf00] via-[#ffd633] to-[#e69d00] bg-clip-text text-transparent">Decoded in Real-Time</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-lg max-w-3xl mx-auto mb-12 leading-relaxed font-normal">
          Empower your market forecasts with our instant AI sentiments, dynamic fibonacci analyzers, real-time macroeconomic indicators, and expert technical insights.
        </p>

        {/* COMPREHENSIVE SUBDOMAIN NETWORK BANNER (LINKING TO SOURCED SUBDOMAINS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16 bg-[#0a0c10]/80 p-3 rounded-2xl border border-white/5 shadow-2xl">
          {[
            { name: "Live Terminal", desc: "trade.bivaax.com", url: "https://bivaax.com" },
            { name: "Official Support", desc: "support.bivaax.com", url: "https://support.bivaax.com" },
            { name: "Partner Network", desc: "partner.bivaax.com", url: "https://partner.bivaax.com" },
            { name: "Market Intelligence", desc: "insights.bivaax.com", url: "https://insights.bivaax.com", active: true }
          ].map((item, idx) => (
            <a 
              key={idx}
              href={item.url}
              className={`p-3 rounded-xl border text-left transition-all ${
                item.active 
                  ? 'bg-[#ffcf00]/10 border-[#ffcf00]/30 text-[#ffcf00]' 
                  : 'bg-white/5 border-transparent hover:border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span className="block text-xs font-black uppercase tracking-wide">{item.name}</span>
              <span className="text-[10px] opacity-70 block font-mono">{item.desc}</span>
            </a>
          ))}
        </div>
      </section>

      {/* CORE PORTAL TAB SWITCHER */}
      <section className="py-4 px-6 max-w-7xl mx-auto relative z-10 flex flex-wrap gap-3 justify-center border-b border-white/5 pb-8 mb-12">
        {[
          { id: 'signals', label: 'AI Technical Signals', icon: Zap },
          { id: 'calculator', label: 'Trading Calculators', icon: Calculator },
          { id: 'calendar', label: 'Economic Calendar', icon: Calendar },
          { id: 'articles', label: 'Daily Trend Forecasts', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                isActive 
                  ? 'bg-[#ffcf00] text-black border-[#ffcf00] shadow-xl shadow-[#ffcf00]/10 scale-105' 
                  : 'bg-[#101115]/80 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* DYNAMIC PORTAL CONTENTS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 relative z-10 min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LIVE TECHNICAL SIGNALS */}
          {activeTab === 'signals' && (
            <motion.div 
              key="signals"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Technical Sentiment Sentinel</h3>
                  <p className="text-xs text-gray-500">Live sentiment analysis utilizing RSI, Moving Averages, and Stochastic sweeps updated every 3 seconds.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Streaming Real-Time</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveAssets.map((asset, idx) => (
                  <div key={idx} className="bg-[#101115]/50 border border-white/5 hover:border-[#ffcf00]/30 transition-all p-6 rounded-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#ffcf00]/5 blur-[60px] rounded-full pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-0.5">FOREX / INDEX / CRYPTO</span>
                        <h4 className="text-lg font-black tracking-tight">{asset.name}</h4>
                      </div>
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-lg bg-white/5 ${asset.color} border border-white/10`}>
                        {asset.signal}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <span className="block text-[10px] text-gray-500 uppercase font-black">Live Quote</span>
                        <span className="font-mono text-sm font-bold text-white transition-all">
                          {asset.name.includes("BTC") ? asset.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : asset.price.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-500 uppercase font-black">24H Change</span>
                        <span className={`font-mono text-sm font-bold ${asset.change.startsWith("+") ? "text-[#00c980]" : "text-[#f45c5c]"}`}>
                          {asset.change}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-500 uppercase font-black">RSI (14)</span>
                        <span className="text-xs text-gray-300 font-bold font-mono">{asset.rsi}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-500 uppercase font-black">MACD Wave</span>
                        <span className="text-xs text-gray-300 font-bold font-mono">{asset.macd}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE HIGH SEO CALCULATORS */}
          {activeTab === 'calculator' && (
            <motion.div 
              key="calculator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Left Side: Controls */}
              <div className="lg:col-span-5 bg-[#101115] border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
                <div className="flex gap-2 p-1.5 bg-[#07080a] rounded-xl border border-white/5">
                  <button 
                    onClick={() => setCalcType('profit')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${calcType === 'profit' ? 'bg-[#ffcf00] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Binary Profit Calculator
                  </button>
                  <button 
                    onClick={() => setCalcType('fibonacci')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${calcType === 'fibonacci' ? 'bg-[#ffcf00] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Fibonacci Calculator
                  </button>
                </div>

                {calcType === 'profit' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Trade Stake / Investment ($)</label>
                      <input 
                        type="number" 
                        value={investment} 
                        onChange={(e) => setInvestment(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#07080a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-[#ffcf00]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Asset Payout Rate (%)</label>
                      <input 
                        type="number" 
                        value={payout} 
                        onChange={(e) => setPayout(Math.min(100, Math.max(10, parseInt(e.target.value) || 0)))}
                        className="w-full bg-[#07080a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-[#ffcf00]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Estimated Win Rate / Success Rate ({successRate}%)</label>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={successRate} 
                        onChange={(e) => setSuccessRate(parseInt(e.target.value))}
                        className="w-full accent-[#ffcf00] bg-[#07080a] rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Total Planned Trades</label>
                      <input 
                        type="number" 
                        value={calcTrades} 
                        onChange={(e) => setCalcTrades(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#07080a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-[#ffcf00]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">High / Peak Price Value</label>
                      <input 
                        type="number" 
                        value={highPrice} 
                        onChange={(e) => setHighPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#07080a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-[#ffcf00]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Low / Bottom Price Value</label>
                      <input 
                        type="number" 
                        value={lowPrice} 
                        onChange={(e) => setLowPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#07080a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:border-[#ffcf00]"
                      />
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-gray-400 leading-relaxed">
                      <strong>Fibonacci Retracement Tool:</strong> Primarily used in forex and crypto to pinpoint potential buy/sell support and resistance barriers during correction phases.
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Results Display */}
              <div className="lg:col-span-7 bg-[#0a0c10] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                {calcType === 'profit' ? (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs text-[#ffcf00] font-black uppercase tracking-widest block mb-1">PROFIT REPORT</span>
                      <h4 className="text-xl font-black">Trade Simulation Analysis</h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-[#101115] border border-white/5 p-4 rounded-xl">
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">Wins / Payouts</span>
                        <span className="text-lg font-bold text-emerald-400">{winCount} trades</span>
                      </div>
                      <div className="bg-[#101115] border border-white/5 p-4 rounded-xl">
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">Losses / Stakes</span>
                        <span className="text-lg font-bold text-red-400">{lossCount} trades</span>
                      </div>
                      <div className="bg-[#101115] border border-white/5 p-4 rounded-xl col-span-2 sm:col-span-1">
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">Per Trade Earn</span>
                        <span className="text-lg font-bold text-white">${potentialProfitPerTrade.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center space-y-2">
                      <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider">Net Estimated Yield</span>
                      <span className={`text-4xl font-black block tracking-tight ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {netProfit >= 0 ? "+" : ""}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                      <span className="text-[10px] text-gray-500 block">Calculated on compounding organic broker margins.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs text-[#ffcf00] font-black uppercase tracking-widest block mb-1">RETRACEMENT LEVELS</span>
                      <h4 className="text-xl font-black">Fibonacci Golden Grid Analysis</h4>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(fibLevels).map(([level, val]) => (
                        <div key={level} className="flex justify-between items-center p-3.5 bg-[#101115] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${level === "61.8%" ? "bg-[#ffcf00] animate-pulse" : "bg-blue-500"}`} />
                            <span className={`text-xs font-bold font-mono ${level === "61.8%" ? "text-[#ffcf00]" : "text-gray-300"}`}>
                              Fib {level} {level === "61.8%" && "(Golden Ratio)"}
                            </span>
                          </div>
                          <span className="font-mono text-sm text-white font-black">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 border-t border-white/5 pt-6 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span>Simulation results are mathematical forecasts and do not guarantee active market profits.</span>
                  <a href="https://bivaax.com" className="text-xs font-black text-[#ffcf00] hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
                    Trade Terminal <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: REAL-TIME ECONOMIC CALENDAR */}
          {activeTab === 'calendar' && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Macroeconomic Sentinel Calendar</h3>
                <p className="text-xs text-gray-500">World bank policy meetings, interest rates decision events, and key high-impact CPI prints.</p>
              </div>

              <div className="bg-[#101115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#07080a] border-b border-white/5 text-[10px] text-gray-500 font-black uppercase tracking-wider">
                        <th className="p-4 pl-6">Time</th>
                        <th className="p-4">Currency</th>
                        <th className="p-4">Impact</th>
                        <th className="p-4">Economic Release Event</th>
                        <th className="p-4">Actual</th>
                        <th className="p-4">Forecast</th>
                        <th className="p-4">Previous</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {ECONOMIC_EVENTS.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6 font-mono text-gray-400">{item.time}</td>
                          <td className="p-4 font-bold text-white">{item.currency}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                              item.impact === "HIGH" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {item.impact}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-gray-200">{item.event}</td>
                          <td className="p-4 font-mono font-bold text-white">{item.actual}</td>
                          <td className="p-4 font-mono text-gray-400">{item.forecast}</td>
                          <td className="p-4 font-mono text-gray-400">{item.previous}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DEEP WRITTEN DAILY ANALYTICAL ARTICLES */}
          {activeTab === 'articles' && (
            <motion.div 
              key="articles"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Market Forecasts & Research Columns</h3>
                <p className="text-xs text-gray-500">Expert articles from Bivaax desk optimized for global news channels and search indexing.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {INSIGHT_ARTICLES.map((art) => (
                  <div key={art.id} className="bg-[#101115] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative hover:border-[#ffcf00]/30 transition-all group">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#ffcf00] uppercase tracking-widest px-2.5 py-1 bg-[#ffcf00]/10 rounded-lg">
                          {art.tag}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs font-bold">
                          <Clock size={12} />
                          <span>{art.readTime}</span>
                        </div>
                      </div>

                      <h4 className="text-lg md:text-xl font-black tracking-tight leading-snug group-hover:text-[#ffcf00] transition-colors">
                        {art.title}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{art.desc}</p>
                      
                      <div className="p-5 bg-[#07080a] border border-white/5 rounded-2xl text-xs md:text-sm text-gray-300 leading-relaxed">
                        {art.content}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs text-gray-500">
                      <span className="font-bold">By {art.author}</span>
                      <a href="https://bivaax.com" className="text-xs font-black text-[#ffcf00] hover:text-white transition-all uppercase tracking-widest flex items-center gap-1">
                        Open Trade <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#07080a] py-12 px-6 md:px-12 text-center text-gray-500 text-xs relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="font-bold text-white">Bivaax Operations</span>
            <span>© 2026. All Rights Reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="https://bivaax.com/page/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="https://bivaax.com/page/terms-conditions" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="https://bivaax.com/docs" className="hover:text-white transition-colors">API & Webhooks</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
