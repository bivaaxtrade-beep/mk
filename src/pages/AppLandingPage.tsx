import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Activity, Smartphone, Monitor, Zap, Globe, 
  TrendingUp, Lock, CheckCircle2, BarChart3, CreditCard, ChevronRight,
  Download, Play, Layers, MousePointer2, Cpu, Sparkles, Server, Globe2,
  Clock, Shield, BarChart, ExternalLink, Menu, X
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

// --- Sub-components for better organization ---

const LiveTicker = () => {
  const assets = [
    { symbol: 'BTC/USD', price: '64,120.40', change: '+2.45%', up: true },
    { symbol: 'ETH/USD', price: '3,450.12', change: '+1.12%', up: true },
    { symbol: 'EUR/USD', price: '1.08450', change: '-0.05%', up: false },
    { symbol: 'GBP/JPY', price: '190.240', change: '+0.15%', up: true },
    { symbol: 'GOLD', price: '2,350.40', change: '+0.85%', up: true },
    { symbol: 'SOL/USD', price: '145.20', change: '-1.40%', up: false },
  ];

  return (
    <div className="w-full bg-[#101115]/80 backdrop-blur-md border-y border-white/5 py-3 overflow-hidden relative">
      <div className="flex animate-marquee whitespace-nowrap gap-12">
        {[...assets, ...assets].map((asset, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">{asset.symbol}</span>
            <span className="text-white font-mono text-sm font-bold">{asset.price}</span>
            <span className={`text-[10px] font-bold ${asset.up ? 'text-emerald-500' : 'text-rose-500'}`}>
              {asset.change}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

const BentoCard = ({ title, desc, icon: Icon, color, className = "", children }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`bg-[#16171B] border border-white/5 rounded-3xl p-8 relative overflow-hidden group transition-all duration-500 hover:border-${color}-500/30 ${className}`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-${color}-500/10 transition-all duration-500`} />
    <div className={`w-12 h-12 bg-${color}-500/10 rounded-2xl flex items-center justify-center text-${color}-500 mb-6 group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <h3 className="text-xl font-black text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed font-medium mb-6">{desc}</p>
    {children}
  </motion.div>
);

const FeatureBadge = ({ text }: { text: string }) => (
  <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest inline-flex items-center gap-1.5">
    <div className="w-1 h-1 rounded-full bg-[#ffcf00]" />
    {text}
  </div>
);

export default function AppLandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0d0e12] text-white flex flex-col font-sans overflow-x-hidden selection:bg-[#ffcf00] selection:text-black">
      <SEO 
        title="Bivaax App - Download Official Trading App (Android, iOS & Web)"
        description="Download the official Bivaax Trading App. Trade Forex, Crypto, Stocks & Commodities with 95% payouts, $10,000 free demo balance, and instant withdrawals on Android, iOS, or browser."
        keywords="Bivaax App, Bivaax APK, Bivaax download, Bivaax trading app, Bivaax mobile app, Bivaax app login, bivaax.com app, Bivaax Android app, Bivaax iOS, binary options app, online trading app"
        faqData={[
          {
            question: "How do I download and install the Bivaax App?",
            answer: "You can install the official Bivaax App directly from https://bivaax.com/app as a high-speed Progressive Web App (PWA) on your Android, iPhone, or Desktop with one tap."
          },
          {
            question: "Is the Bivaax App free to use?",
            answer: "Yes, the Bivaax App is 100% free to download and install. Every user gets a free $10,000 refillable demo account immediately."
          },
          {
            question: "Can I trade on both mobile and PC with one Bivaax account?",
            answer: "Yes, your Bivaax account syncs seamlessly across all devices including Android, iOS, tablets, and desktop web browsers."
          }
        ]}
        softwareData={{
          name: "Bivaax Trade - Official Trading App",
          operatingSystem: "Android, iOS, Windows, macOS, Web",
          applicationCategory: "FinanceApplication",
          ratingValue: "4.9",
          reviewCount: "18940",
          downloadUrl: "https://bivaax.com/app"
        }}
      />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#ffcf00]/5 blur-[150px] rounded-full opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full opacity-60" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
      </div>

      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0d0e12]/80 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Logo />
            <nav className="hidden md:flex items-center gap-8">
              {['Markets', 'Tournaments', 'Copy Trading', 'Affiliate'].map((item) => (
                <button 
                  key={item}
                  onClick={() => navigate(`/${item.toLowerCase().replace(' ', '')}`)}
                  className="text-gray-400 hover:text-[#ffcf00] text-xs font-black uppercase tracking-widest transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/trade')}
                className="group relative bg-[#ffcf00] text-black font-black text-xs px-8 py-3 rounded-full transition-all overflow-hidden uppercase tracking-widest"
              >
                <span className="relative z-10 flex items-center gap-2">Launch Terminal <Zap size={14} fill="currentColor" /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-gray-400 hover:text-white font-black text-xs px-4 py-2 transition-colors uppercase tracking-widest"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs px-8 py-3 rounded-full transition-all uppercase tracking-widest hidden sm:block"
                >
                  Join Now
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 lg:pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <FeatureBadge text="Official Terminal 3.4.0" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] uppercase"
            >
              The World's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffcf00] via-white to-[#ffcf00] bg-[length:200%_auto] animate-gradient-flow">Fastest</span> Terminal
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed font-medium"
            >
              Access institutional-grade liquidity and professional charting tools directly in your browser. Experience zero-latency execution on any device.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-[#ffcf00] hover:bg-white text-black font-black text-sm px-12 py-5 rounded-full transition-all shadow-[0_0_40px_rgba(255,207,0,0.2)] flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95"
              >
                Create Account <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-sm px-12 py-5 rounded-full transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                Live Demo <Play size={18} fill="currentColor" />
              </button>
            </motion.div>
          </div>

          {/* Visual Showcase */}
          <motion.div
            style={{ opacity, scale }}
            className="relative w-full max-w-6xl mx-auto group"
          >
            <div className="absolute inset-0 bg-[#ffcf00]/20 blur-[120px] rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
            
            <div className="relative bg-[#16171B] border border-white/10 rounded-[2.5rem] p-3 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="bg-[#0d0e12] rounded-[2rem] border border-white/5 overflow-hidden">
                {/* Mockup Topbar */}
                <div className="h-14 border-b border-white/5 bg-[#121318] flex items-center justify-between px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 max-w-md h-8 bg-white/5 rounded-full mx-8 flex items-center justify-center border border-white/5">
                    <span className="text-[10px] text-gray-500 font-black tracking-widest flex items-center gap-2 uppercase">
                      <Lock size={10} className="text-[#ffcf00]" /> app.bivaax.com/terminal
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5" />
                  </div>
                </div>
                
                {/* Mockup Content - Professional Terminal View */}
                <div className="aspect-[16/9] bg-[#0d0e12] p-6 flex gap-6">
                  {/* Left Sidebar */}
                  <div className="w-20 flex flex-col gap-3">
                    {[BarChart3, Globe, Activity, Layers, Server].map((Icon, i) => (
                      <div key={i} className={`w-full aspect-square rounded-2xl flex items-center justify-center border transition-all ${i === 0 ? 'bg-[#ffcf00] border-[#ffcf00] text-black shadow-lg shadow-[#ffcf00]/20' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}>
                        <Icon size={20} strokeWidth={2.5} />
                      </div>
                    ))}
                  </div>

                  {/* Main Chart Area */}
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="h-16 bg-[#16171B] rounded-2xl border border-white/5 flex items-center justify-between px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#ffcf00]/10 flex items-center justify-center font-black text-[#ffcf00] text-xs border border-[#ffcf00]/20">BTC</div>
                        <div>
                          <div className="text-sm font-black text-white tracking-tight">BTC/USD (Bitcoin)</div>
                          <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">+2.45% Today</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-lg font-black text-white font-mono">$64,120.40</div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Market Price</div>
                        </div>
                        <div className="w-32 h-10 bg-[#ffcf00] rounded-xl flex items-center justify-center text-black font-black text-xs uppercase tracking-widest">Trade Now</div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-[#16171B] rounded-2xl border border-white/5 relative overflow-hidden p-6 group">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />
                      {/* Simulated Chart */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                        <path 
                          d="M0,300 Q100,280 200,320 T400,250 T600,280 T800,220 T1000,240" 
                          fill="none" 
                          stroke="#ffcf00" 
                          strokeWidth="3" 
                          className="drop-shadow-[0_0_8px_rgba(255,207,0,0.5)]"
                        />
                        <path 
                          d="M0,300 Q100,280 200,320 T400,250 T600,280 T800,220 T1000,240 L1000,400 L0,400 Z" 
                          fill="url(#chart-grad)" 
                        />
                        <defs>
                          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffcf00" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ffcf00" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Price Tooltip */}
                      <div className="absolute top-1/4 right-1/4 bg-[#ffcf00] text-black px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl">
                        $64,120.40
                      </div>
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className="w-64 flex flex-col gap-6">
                    <div className="bg-[#16171B] rounded-2xl border border-white/5 p-5">
                      <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Quick Stats</div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-gray-400 uppercase">Profit Pool</span>
                          <span className="text-xs font-black text-white">$1.2M+</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-gray-400 uppercase">Active Trades</span>
                          <span className="text-xs font-black text-white">8,420</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="w-[82%] h-full bg-[#ffcf00]" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 group/btn cursor-pointer active:scale-95 transition-all">
                        <TrendingUp size={24} className="text-emerald-500 group-hover/btn:scale-125 transition-transform" />
                        <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">Call Option</span>
                        <span className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-widest">Payout: 82%</span>
                      </div>
                      <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 group/btn cursor-pointer active:scale-95 transition-all">
                        <TrendingUp size={24} className="text-rose-500 rotate-180 group-hover/btn:scale-125 transition-transform" />
                        <span className="text-rose-500 font-black text-xs uppercase tracking-widest">Put Option</span>
                        <span className="text-[9px] text-rose-500/60 font-bold uppercase tracking-widest">Payout: 82%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <LiveTicker />

      {/* Bento Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <FeatureBadge text="Engineered Core" />
              <h2 className="text-4xl md:text-6xl font-black mt-6 tracking-tighter uppercase leading-[0.95]">
                Built for <span className="text-[#ffcf00]">High Precision</span> <br />
                Financial Trading
              </h2>
            </div>
            <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
              Every component of Bivaax is optimized for speed and security, providing a seamless bridge between you and the global markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <BentoCard 
              title="Global Asset Liquidity" 
              desc="Access 500+ assets across Forex, Crypto, Stocks, and Commodities with deep liquidity pools."
              icon={Globe2} 
              color="blue"
              className="md:col-span-8"
            >
              <div className="flex gap-4 mt-auto">
                {['EUR/USD', 'BTC/USD', 'AAPL', 'GOLD'].map(asset => (
                  <div key={asset} className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {asset}
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard 
              title="Safe Cold Storage" 
              desc="Multi-signature wallets and offline asset protection."
              icon={Lock} 
              color="emerald"
              className="md:col-span-4"
            >
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Shield Active</span>
                <Shield size={16} className="text-emerald-500" />
              </div>
            </BentoCard>

            <BentoCard 
              title="Millisecond Execution" 
              desc="Advanced matching engine ensures zero-latency trade processing."
              icon={Zap} 
              color="amber"
              className="md:col-span-4"
            >
               <div className="flex items-center gap-2 mt-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">0.8ms average latency</span>
               </div>
            </BentoCard>

            <BentoCard 
              title="Professional Analytics" 
              desc="Integrated technical indicators, sentiment analysis, and real-time news feeds for smarter decisions."
              icon={BarChart} 
              color="indigo"
              className="md:col-span-8"
            >
               <div className="grid grid-cols-4 gap-3 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                       <div className={`absolute bottom-0 w-full bg-indigo-500/20`} style={{ height: `${20 + i * 20}%` }} />
                    </div>
                  ))}
               </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Device Section */}
      <section className="py-32 bg-black/40 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#ffcf00]/5 blur-[200px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FeatureBadge text="Universal Compatibility" />
          <h2 className="text-4xl md:text-6xl font-black mt-6 mb-20 tracking-tighter uppercase leading-[0.95]">
            One Terminal. <span className="text-[#ffcf00]">Every Device.</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white border border-white/10 shadow-xl">
                <Monitor size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Desktop Pro</h3>
              <p className="text-gray-500 text-sm font-medium">Advanced multi-chart layout with keyboard shortcuts and institutional tools.</p>
            </div>
            
            <div className="flex flex-col items-center gap-6 md:scale-125">
              <div className="w-24 h-24 bg-[#ffcf00] rounded-[2.5rem] flex items-center justify-center text-black border-4 border-[#ffcf00] shadow-[0_0_50px_rgba(255,207,0,0.3)]">
                <Smartphone size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-[#ffcf00]">Mobile Web</h3>
              <p className="text-gray-400 text-sm font-bold">The full power of Bivaax in your pocket. Optimized for touch navigation and fast execution.</p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white border border-white/10 shadow-xl">
                <Layers size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Tablet Flow</h3>
              <p className="text-gray-500 text-sm font-medium">Perfect balance of screen space and portability. Ideal for technical analysis on the go.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#16171B] border border-white/5 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-[#ffcf00]/5 blur-[120px] -mr-40 pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <FeatureBadge text="Institutional Security" />
                <h2 className="text-4xl md:text-6xl font-black mt-6 mb-8 tracking-tighter uppercase leading-[0.95]">
                  Your Assets, <br />
                  <span className="text-[#ffcf00]">Fortified.</span>
                </h2>
                <div className="space-y-8">
                  {[
                    { title: "256-bit AES Encryption", desc: "Military-grade data protection for all user information and communication." },
                    { title: "Advanced 2FA Protection", desc: "Multi-layered authentication including App, SMS, and Hardware keys." },
                    { title: "Anti-DDoS Infrastructure", desc: "Proprietary network defense system ensuring 100% platform uptime." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center text-[#ffcf00] border border-white/5">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">{item.title}</h4>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-[#0d0e12] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10" />
                  <div className="flex flex-col items-center gap-6 relative z-10 py-8 text-center">
                    <div className="w-24 h-24 bg-[#ffcf00]/10 rounded-full flex items-center justify-center text-[#ffcf00] border-2 border-[#ffcf00]/20 animate-pulse">
                      <ShieldCheck size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">System Status: Secure</h3>
                    <p className="text-gray-500 text-xs font-bold leading-relaxed max-w-[240px]">Real-time security audits and automated threat detection active 24/7/365.</p>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ x: [-200, 400] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-40 h-full bg-[#ffcf00]"
                      />
                    </div>
                  </div>
                </div>
                {/* Decorative floating elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#ffcf00]/10 blur-[60px] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter uppercase leading-[0.85]">
              Start Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffcf00] to-white">Success Story</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-16 max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed">
              Join the elite circle of professional traders. <br />
              Experience Bivaax Terminal today.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button 
                onClick={() => navigate('/register')}
                className="group relative bg-[#ffcf00] text-black font-black text-sm px-16 py-6 rounded-full transition-all overflow-hidden uppercase tracking-widest shadow-[0_0_50px_rgba(255,207,0,0.3)] active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-3">Create Free Account <ArrowRight size={20} /></span>
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
            
            <div className="mt-16 flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale transition-all hover:grayscale-0">
               {['Visa', 'Mastercard', 'Binance', 'Bitcoin', 'Ethereum'].map(item => (
                 <span key={item} className="text-sm font-black text-white uppercase tracking-[0.3em]">{item}</span>
               ))}
            </div>
          </motion.div>
        </div>
        
        {/* Radial Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[120%] h-[120%] bg-[#ffcf00]/5 blur-[200px] rounded-full pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-24 relative z-10 bg-[#0a0b0e]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-4">
              <Logo />
              <p className="text-gray-500 mt-8 text-sm leading-relaxed font-medium">
                The world's most advanced web trading terminal. Engineered for extreme performance, security, and global accessibility. Join the future of trading.
              </p>
              <div className="flex items-center gap-4 mt-10">
                {[Globe, Globe2, Activity].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-gray-500 hover:text-[#ffcf00] hover:border-[#ffcf00]/30 transition-all cursor-pointer">
                    <Icon size={18} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
              {[
                { title: 'Platform', links: ['Web Trader', 'Mobile App', 'Tournaments', 'Leaderboard'] },
                { title: 'Resources', links: ['Help Center', 'API Docs', 'Affiliate', 'Signals'] },
                { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'AML Policy', 'Risk Disclosure'] }
              ].map((section) => (
                <div key={section.title}>
                  <h4 className="text-white font-black mb-8 uppercase tracking-widest text-[10px]">{section.title}</h4>
                  <ul className="space-y-4">
                    {section.links.map(link => (
                      <li key={link}>
                        <button className="text-gray-500 hover:text-[#ffcf00] text-xs font-bold uppercase tracking-widest transition-colors">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Bivaax International Group. All rights reserved.
            </div>
            <div className="flex items-center gap-8">
               <span className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 All Systems Operational
               </span>
               <div className="text-gray-700 text-[8px] font-bold uppercase tracking-widest max-w-xs text-right hidden lg:block">
                 Bivaax Trade is authorized and regulated in multiple jurisdictions. High risk investment warning.
               </div>
            </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          animation: gradient-flow 6s ease infinite;
        }
      `}</style>
    </div>
  );
}
