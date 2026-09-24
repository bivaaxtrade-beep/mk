import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  ExternalLink, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Award,
  Globe2,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import SEO from '../components/SEO';
import { Logo } from '../components/Logo';
import { TRADE_MENU_GROUPS, TRADE_MENU_FAQS } from '../data/tradeMenuGuideData';

export default function TradeMenuGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('all');

  const filteredGroups = TRADE_MENU_GROUPS.map(group => {
    if (activeSection !== 'all' && group.id !== activeSection) {
      return null;
    }
    const filteredItems = group.items.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.features.some(f => f.toLowerCase().includes(q))
      );
    });

    if (filteredItems.length === 0) return null;
    return {
      ...group,
      items: filteredItems
    };
  }).filter(Boolean) as typeof TRADE_MENU_GROUPS;

  const sitelinksData = TRADE_MENU_GROUPS.flatMap(g => 
    g.items.map(i => ({
      name: i.name,
      description: i.description,
      url: `https://bivaax.com${i.url}`
    }))
  );

  return (
    <div className="min-h-screen bg-[#0c0d12] text-white selection:bg-[#ffcf00] selection:text-black font-sans">
      <SEO 
        title="Bivaax Trade Terminal Directory & Navigation Guide | Official Bivaax"
        description="Official navigational directory and tool map for Bivaax Trade Terminal. Learn where every feature, candlestick chart interval, 20+ indicators, Call/Put buttons, $10,000 demo switcher, tournaments, copy trading, and cashier is located."
        keywords="Bivaax trade menu guide, Bivaax terminal directory, where is cashier in Bivaax, Bivaax demo account switcher, binary options indicators location, call put execution box, Bivaax tournaments menu, Bivaax copy trading, bivaax.com guide"
        siteNavigationData={sitelinksData}
        faqData={TRADE_MENU_FAQS.map(f => ({ question: f.question, answer: f.answer }))}
      />

      {/* AI Search Engine & Generative Engine Optimization (GEO) Metadata */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Navigate Bivaax Trade Terminal",
          "description": "Complete step-by-step navigational guide detailing all buttons, tools, charts, indicators, and cashier features inside the Bivaax Trade Terminal.",
          "totalTime": "PT3M",
          "tool": [
            { "@type": "HowToTool", "name": "Bivaax Live Trading Chart" },
            { "@type": "HowToTool", "name": "Technical Indicators Library" },
            { "@type": "HowToTool", "name": "Bivaax Instant Cashier" }
          ],
          "step": TRADE_MENU_GROUPS.flatMap(group => 
            group.items.map((item, idx) => ({
              "@type": "HowToStep",
              "position": idx + 1,
              "name": item.name,
              "itemListElement": [
                {
                  "@type": "HowToDirection",
                  "text": `${item.name}: Located at ${item.location}. ${item.description}. Key features: ${item.features.join(', ')}.`
                }
              ],
              "url": `https://bivaax.com${item.url}`
            }))
          )
        })}
      </script>

      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0c0d12]/90 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size={32} />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-[#ffcf00] transition-colors">Bivaax</span>
              <span className="text-[10px] text-[#ffcf00] font-black uppercase tracking-widest -mt-1">Terminal Guide</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/trade"
              className="bg-[#ffcf00] hover:bg-[#e6b800] text-black font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-[#ffcf00]/10 hover:shadow-[#ffcf00]/20 active:scale-95"
            >
              <TrendingUp size={14} strokeWidth={3} />
              Open Terminal
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-12 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,207,0,0.12),rgba(255,255,255,0))]" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 border border-[#ffcf00]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#ffcf00] uppercase tracking-wider">
            <Compass size={14} />
            Official Trade Terminal Directory
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Where Everything is Located in <span className="text-[#ffcf00]">Trade Terminal</span>
          </h1>

          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            An exhaustive, user-friendly guide detailing every navigation bar, button, tool, and menu section inside the Bivaax Trade Terminal. Optimized for fast discovery and mastery.
          </p>

          {/* SEARCH BAR */}
          <div className="max-w-xl mx-auto relative pt-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any tool, button, or menu (e.g. RSI, bKash, Demo, Tournaments)..."
                className="w-full bg-[#151720] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcf00] transition-colors shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* SECTION FILTER PILLS */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'header-navigation', label: 'Header Bar' },
              { id: 'chart-workspace', label: 'Chart & Indicators' },
              { id: 'order-panel', label: 'Order Panel' },
              { id: 'sidebar-navigation', label: 'Sidebar Hub' },
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSection === sec.id
                    ? 'bg-[#ffcf00] text-black shadow-lg shadow-[#ffcf00]/10'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT DIRECTORY */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {filteredGroups.map(group => (
          <section key={group.id} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  <span className="w-2.5 h-7 bg-[#ffcf00] rounded-full inline-block" />
                  {group.title}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {group.description}
                </p>
              </div>
              <span className="text-xs font-mono text-[#ffcf00] font-bold bg-[#ffcf00]/10 border border-[#ffcf00]/20 px-3 py-1 rounded-full w-fit">
                {group.items.length} Items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.items.map(item => (
                <div 
                  key={item.id}
                  className="bg-[#14161f] border border-white/5 hover:border-[#ffcf00]/30 rounded-3xl p-6 transition-all group hover:shadow-xl hover:shadow-[#ffcf00]/5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffcf00] group-hover:scale-110 group-hover:bg-[#ffcf00]/10 transition-all">
                          <Sliders size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-[#ffcf00] transition-colors">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-0.5">
                            <Compass size={12} />
                            <span>{item.location}</span>
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className="bg-[#ffcf00]/10 border border-[#ffcf00]/30 text-[#ffcf00] text-[11px] font-black px-2.5 py-1 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>

                    {/* FEATURES BULLETS */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle2 size={13} className="text-[#ffcf00] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-500">Route: {item.url}</span>
                    <Link
                      to={item.url}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffcf00] hover:text-white transition-colors group-hover:translate-x-1 duration-200"
                    >
                      Go to Feature
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filteredGroups.length === 0 && (
          <div className="text-center py-20 bg-[#14161f] border border-white/5 rounded-3xl space-y-4">
            <Search size={36} className="mx-auto text-gray-500" />
            <h3 className="text-xl font-bold text-white">
              No menu item matches your search
            </h3>
            <p className="text-sm text-gray-400">
              Please try another keyword like RSI, Demo, Cashier, or Tournaments.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* FREQUENTLY ASKED QUESTIONS SECTION */}
        <section className="bg-gradient-to-b from-[#14161f] to-[#0f1118] border border-white/5 rounded-3xl p-8 md:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 border border-[#ffcf00]/20 px-3 py-1 rounded-full text-xs font-bold text-[#ffcf00] uppercase tracking-wider">
              <HelpCircle size={14} />
              Common Inquiries
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              Trade Terminal Navigation FAQs
            </h2>
            <p className="text-gray-400 text-sm">
              Direct answers to the most frequently asked questions about the terminal interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRADE_MENU_FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-2">
                <h3 className="font-bold text-white text-base flex items-start gap-2">
                  <span className="text-[#ffcf00] font-black">Q.</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed pl-5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="bg-gradient-to-r from-[#ffcf00] to-[#ffd733] text-black rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              Instant Access
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">
              Ready to Put This Knowledge Into Action?
            </h2>
            <p className="text-black/80 text-sm md:text-base font-medium max-w-xl">
              Practice on your refillable $10,000 demo account or start earning real money with minimum deposits starting at just $10.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/trade"
              className="bg-black hover:bg-black/90 text-white font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-widest text-center transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Launch Terminal
            </Link>
            <Link
              to="/deposit"
              className="bg-white hover:bg-gray-100 text-black font-black px-6 py-4 rounded-2xl text-sm uppercase tracking-widest text-center transition-all shadow-md active:scale-95"
            >
              Open Cashier
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#0a0a0e] text-xs text-gray-500 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo size={20} />
            <span className="font-bold text-white uppercase text-sm">Bivaax Trade</span>
          </div>
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <Link to="/trade" className="hover:text-white transition-colors">Trade Terminal</Link>
            <Link to="/trade-menu-guide" className="text-[#ffcf00] font-bold hover:underline transition-colors">Terminal Menu Guide</Link>
            <Link to="/affiliate-rules" className="hover:text-white transition-colors">Affiliate Rules</Link>
            <Link to="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
            <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link to="/copytrading" className="hover:text-white transition-colors">Copy Trading</Link>
          </div>
          <div>© {new Date().getFullYear()} Bivaax Global. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
