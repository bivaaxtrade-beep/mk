import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Calendar, TrendingUp, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const TradingViewWidget = ({ type }: { type: 'calendar' | 'news' | 'analysis' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget if any
    container.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;

    if (type === 'calendar') {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
      script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "isTransparent": true,
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "importanceFilter": "-1,0,1",
        "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF"
      });
    } else if (type === 'news') {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
      script.innerHTML = JSON.stringify({
        "feedMode": "all_symbols",
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "regular",
        "width": "100%",
        "height": "100%",
        "locale": "en"
      });
    } else if (type === 'analysis') {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
      script.innerHTML = JSON.stringify({
        "interval": "1h",
        "width": "100%",
        "isTransparent": true,
        "height": "100%",
        "symbol": "FX:EURUSD",
        "showIntervalTabs": true,
        "locale": "en",
        "colorTheme": "dark"
      });
    }

    container.appendChild(script);
  }, [type]);

  return (
    <div className="w-full h-full min-h-[500px]" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default function NewsCenter() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white">
      <SEO 
        title="Market News Center | Bivaax Trade"
        description="Stay updated with the latest real-time market news, economic calendar, and technical analysis on Bivaax. Your ultimate hub for financial intelligence."
        keywords="Bivaax news, trading news, economic calendar, market analysis, forex news, crypto updates, Bivaax intelligence, real-time news feed"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0b0d]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Newspaper className="text-[#FFE24C]" size={24} />
                News <span className="text-[#FFE24C]">Center</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Real-time Market Intelligence</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Live Feed Active</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Grid: News & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Market News */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[32px] p-8 overflow-hidden flex flex-col h-[700px]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#FFE24C]/10 rounded-2xl text-[#FFE24C]">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Market News</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Financial Timeline</p>
              </div>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden bg-black/20">
              <TradingViewWidget type="news" />
            </div>
          </motion.div>

          {/* Economic Calendar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[32px] p-8 overflow-hidden flex flex-col h-[700px]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#FFE24C]/10 rounded-2xl text-[#FFE24C]">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Events</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Economic Calendar</p>
              </div>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden bg-black/20">
              <TradingViewWidget type="calendar" />
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Technical Analysis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-8 overflow-hidden flex flex-col h-[600px]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#FFE24C]/10 rounded-2xl text-[#FFE24C]">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Technical Analysis</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sentiment & Gauge Indicators</p>
            </div>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden bg-black/20">
            <TradingViewWidget type="analysis" />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center px-6">
         <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Powered by Bivaax Intelligence & TradingView</p>
         <button 
           onClick={() => navigate('/trade')}
           className="px-8 py-4 bg-[#FFE24C] text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
         >
           Start Trading
         </button>
      </footer>
    </div>
  );
}
