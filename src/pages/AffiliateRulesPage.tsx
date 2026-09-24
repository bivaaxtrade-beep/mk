import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, HelpCircle, 
  DollarSign, TrendingUp, Layers, Zap, Globe, Lock, Cpu, Server, 
  Users, ChevronDown, ChevronUp, ExternalLink, Award, FileText, Check, X
} from 'lucide-react';
import { Logo } from '../components/Logo';
import SEO from '../components/SEO';

const COMMISSION_TIERS = [
  {
    tier: 'Level 1: Bronze Starter',
    badge: 'Starter',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ftdRange: '1 – 10 FTDs / month',
    revshare: '50%',
    cpa: 'Up to $40',
    turnover: '2.0%',
    subAffiliate: '5%',
    payoutSpeed: 'Weekly (Every Wednesday)',
    minPayout: '$10',
    perks: ['Standard marketing banner pack', 'Real-time analytics dashboard', 'SubID tracking up to 5 parameters', 'Multi-channel support desk']
  },
  {
    tier: 'Level 2: Silver Trader',
    badge: 'Popular',
    badgeColor: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
    ftdRange: '11 – 50 FTDs / month',
    revshare: '60%',
    cpa: 'Up to $75',
    turnover: '3.0%',
    subAffiliate: '6%',
    payoutSpeed: 'Weekly / Bi-weekly priority',
    minPayout: '$10',
    perks: ['Dedicated Affiliate Account Manager', 'Custom promo codes for your audience', 'High-converting localization banners', 'S2S Postback integration support']
  },
  {
    tier: 'Level 3: Gold Pro Partner',
    badge: 'Pro Tier',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    ftdRange: '51 – 100 FTDs / month',
    revshare: '70%',
    cpa: 'Up to $110',
    turnover: '4.0%',
    subAffiliate: '8%',
    payoutSpeed: 'Twice Weekly / On-demand',
    minPayout: '$10',
    perks: ['Exclusive custom landing pages', 'VIP Telegram & WhatsApp 24/7 direct desk', 'Bespoke marketing bonus budget', 'Early access to platform competitions']
  },
  {
    tier: 'Level 4: Diamond VIP Master',
    badge: 'Elite Master',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ftdRange: '101+ FTDs / month',
    revshare: 'Up to 80%',
    cpa: 'Up to $150+',
    turnover: '5.0%',
    subAffiliate: '10%',
    payoutSpeed: 'Daily / Hourly Instant USDT',
    minPayout: '$10',
    perks: ['Custom revenue split agreements', 'Co-branded tournament prize pools', 'Dedicated private API endpoints', 'Executive offline event invitations']
  }
];

const FAQ_ITEMS = [
  {
    q: 'How does the Bivaax Partner Program work compared to traditional affiliate programs like Amazon Associates?',
    a: 'Similar to top-tier global networks like Amazon Associates, Bivaax gives you a custom referral link embedded with persistent 30-day tracking cookies. When a visitor clicks your link, creates an account, and makes a deposit (FTD), you automatically earn commissions according to your selected plan (Revenue Share up to 80%, CPA up to $150, or Turnover). All stats, clicks, registrations, and commissions update in real-time on your partner portal.'
  },
  {
    q: 'What are the exact commission levels and how do I advance between tiers?',
    a: 'Bivaax features 4 transparent monthly performance tiers: Level 1 Bronze (1-10 FTDs = 50% RevShare), Level 2 Silver (11-50 FTDs = 60% RevShare), Level 3 Gold (51-100 FTDs = 70% RevShare), and Level 4 Diamond (101+ FTDs = up to 80% RevShare). Levels are calculated automatically at the end of each monthly billing cycle based on the number of active first-time depositors you introduce.'
  },
  {
    q: 'How does the backend cookie tracking and referral attribution system work?',
    a: 'When an end user clicks your affiliate link, the Bivaax backend drops a first-party, secure 30-day cookie and logs the browser fingerprint along with your unique referral ID and SubIDs. If the user registers within 30 days—even if they close their browser and return directly to bivaax.com later—the registration is permanently attributed to your affiliate ID.'
  },
  {
    q: 'What is the SubID parameter structure for tracking multiple traffic sources?',
    a: 'You can append up to 5 dynamic tracking parameters to any referral link: ?ref={YOUR_ID}&subid1={campaign}&subid2={channel}&subid3={ad_creative}&subid4={keyword}&subid5={geo}. These parameters pass through the registration pipeline and are accessible in real-time reports and S2S postback webhooks.'
  },
  {
    q: 'How do Server-to-Server (S2S) postbacks work in the Bivaax affiliate system?',
    a: 'Partners using third-party trackers (like Voluum, RedTrack, BeMob, or custom CRM systems) can register S2S postback URLs in the Partner Portal. When a conversion event occurs (Registration, First Deposit, Repeat Deposit, or Trade Turnover), Bivaax immediately fires an automated HTTP GET/POST webhook with dynamic macros like {click_id}, {payout}, {currency}, {user_id}, and {event_type}.'
  },
  {
    q: 'What types of content and promotional methods are permitted for affiliates?',
    a: 'Permitted methods include: YouTube video tutorials and technical chart analysis, Telegram/WhatsApp trading signal groups, educational blogs and review portals, organic social media content (TikTok, Instagram, Facebook), SEO websites, and generic paid search advertising (e.g. searching "how to trade options" or "forex strategies").'
  },
  {
    q: 'What promotional practices and traffic types are strictly prohibited?',
    a: 'Strictly prohibited practices include: 1) Self-referral (signing up or trading under your own link), 2) Trademark Brand Bidding (running Google/Bing ads on exact match keywords like "Bivaax" or "Bivaax Login"), 3) Deceptive/Guaranteed claims (promising 100% win rates, hacks, or risk-free money), 4) Unsolicited spam via email or SMS, and 5) Incentivized deposits (paying people cashback to register).'
  },
  {
    q: 'What are the payout rules, minimum withdrawal thresholds, and supported methods?',
    a: 'Commissions are processed every Wednesday, with VIP Level 3 and 4 partners eligible for daily or on-demand hourly crypto payouts. The minimum withdrawal threshold is only $10. Supported payment methods include USDT TRC20, Bitcoin, Ethereum, Binance Pay, local bank wire, and localized MFS methods (bKash, Nagad, Rocket in Asia; Pix, SPEI, PSE in Latin America). All affiliate withdrawals have 0% platform fees.'
  },
  {
    q: 'How does the 2-tier Sub-Affiliate / Master Partner system operate?',
    a: 'When you refer other content creators, webmasters, or influencers to join the Bivaax Partner Program via your Master Referral link, you earn a 5% to 10% secondary override on all commissions they generate, paid for life by Bivaax without reducing the sub-affiliate\'s earnings.'
  },
  {
    q: 'Do I need to verify my identity (KYC) to receive affiliate payouts?',
    a: 'Basic withdrawals in cryptocurrency (USDT TRC20) under $5,000 per week require only email verification and wallet address confirmation. Higher volume payouts or fiat local bank transfers require standard identity verification to ensure AML/CFT compliance.'
  }
];

export default function AffiliateRulesPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<'revshare' | 'cpa' | 'turnover'>('revshare');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-white font-sans selection:bg-[#ffcf00]/30 selection:text-black overflow-x-hidden">
      <SEO 
        title="Bivaax Affiliate Program Rules, Commission Tiers & Policy (2026 Guide)"
        description="Official Bivaax Affiliate Operating Rules & Policy. Complete guide on how our affiliate system works: 4 commission levels (up to 80% RevShare & $150 CPA), 30-day cookie attribution, backend S2S postback setup, allowed traffic rules, and instant payouts."
        keywords="Bivaax affiliate rules, Bivaax partner operating agreement, Bivaax commission tiers, how Bivaax affiliate works, binary options affiliate policy, forex broker partner terms, Bivaax revshare levels, Bivaax CPA rates, S2S postback Bivaax, prohibited affiliate traffic, 30 day cookie tracking, sub affiliate program"
        url="https://bivaax.com/affiliate-rules"
        isAffiliate={true}
        faqData={FAQ_ITEMS.map(item => ({ question: item.q, answer: item.a }))}
      />

      {/* HEADER NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#07080a]/90 backdrop-blur-xl border-b border-white/5 z-50 px-6 md:px-12">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-[#ffcf00] to-[#e69d00] rounded-xl shadow-lg shadow-[#ffcf00]/10 group-hover:scale-105 transition-transform duration-300">
              <Logo size={22} color="black" />
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-black tracking-tighter leading-none mb-0.5 uppercase">Bivaax</span>
              <span className="text-[9px] text-[#ffcf00] font-black uppercase tracking-[0.25em] leading-none">PARTNERS POLICY</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-gray-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#commission-tiers" className="hover:text-white transition-colors">Levels & Tiers</a>
            <a href="#backend-rules" className="hover:text-white transition-colors">Backend & S2S</a>
            <a href="#traffic-rules" className="hover:text-white transition-colors">Content & Traffic Rules</a>
            <a href="#faq-section" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              to="/partner" 
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-300 hover:text-white transition-colors border border-white/5 hover:border-white/10 bg-white/5"
            >
              Partner Portal
            </Link>
            <Link 
              to="/partner" 
              className="bg-[#ffcf00] hover:bg-[#e6b800] text-black px-6 py-2.5 rounded-xl text-[13px] font-black transition-all shadow-lg shadow-[#ffcf00]/10 flex items-center gap-2 uppercase tracking-wider"
            >
              Join Program <ArrowRight size={14} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-36 pb-20 px-6 md:px-12 relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 border border-[#ffcf00]/20 px-4 py-1.5 rounded-full mb-6">
          <FileText size={16} className="text-[#ffcf00]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#ffcf00]">
            Official Operating Agreement & Policy (2026 Edition)
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.05] mb-6">
          Bivaax Partner Program <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffcf00] to-[#ffa500]">Rules, Levels & System Architecture</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
          Everything you need to know about how the Bivaax Affiliate Network functions: exact commission rates across all 4 partner tiers, 30-day cookie attribution, backend S2S postback specifications, allowed traffic channels, and instant payout policies.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="bg-[#121316] border border-white/5 rounded-2xl p-5">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest block mb-1">Max RevShare</span>
            <span className="text-3xl font-black text-[#ffcf00]">Up to 80%</span>
            <span className="text-xs text-gray-400 block mt-1">Lifetime net profit split</span>
          </div>
          <div className="bg-[#121316] border border-white/5 rounded-2xl p-5">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest block mb-1">CPA Commission</span>
            <span className="text-3xl font-black text-emerald-400">$150+</span>
            <span className="text-xs text-gray-400 block mt-1">Per qualifying FTD</span>
          </div>
          <div className="bg-[#121316] border border-white/5 rounded-2xl p-5">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest block mb-1">Cookie Window</span>
            <span className="text-3xl font-black text-blue-400">30 Days</span>
            <span className="text-xs text-gray-400 block mt-1">Sticky device attribution</span>
          </div>
          <div className="bg-[#121316] border border-white/5 rounded-2xl p-5">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest block mb-1">Min Payout</span>
            <span className="text-3xl font-black text-purple-400">$10</span>
            <span className="text-xs text-gray-400 block mt-1">Zero withdrawal fees</span>
          </div>
        </div>
      </section>

      {/* SECTION 1: HOW THE SYSTEM WORKS (LIFECYCLE) */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-[#0c0d10] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              How the System Works: Complete Lifecycle
            </h2>
            <p className="text-gray-400 text-base md:text-lg">
              Operating with the same transparency as Amazon Associates, the Bivaax system automates tracking, attribution, and payment through 5 streamlined stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-[#131418] border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#ffcf00]/10 text-[#ffcf00] font-black flex items-center justify-center text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Registration</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Sign up free in 30 seconds with no initial deposit or verification hurdles. Access your unique referral link immediately.
              </p>
            </div>

            <div className="bg-[#131418] border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 font-black flex items-center justify-center text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">30-Day Cookie Tracking</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                When a user clicks your link, a 30-day sticky cookie binds their browser session and IP fingerprint to your affiliate ID.
              </p>
            </div>

            <div className="bg-[#131418] border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-black flex items-center justify-center text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Trader FTD Conversion</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                The referred trader creates an account and makes a First Time Deposit (FTD) starting at just $10 via crypto or local payment methods.
              </p>
            </div>

            <div className="bg-[#131418] border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 font-black flex items-center justify-center text-lg mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Commission</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Earnings are credited to your balance instantly upon qualifying actions based on your tier (RevShare, CPA, or Turnover).
              </p>
            </div>

            <div className="bg-[#131418] border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 font-black flex items-center justify-center text-lg mb-4">
                5
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero-Fee Payouts</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Withdraw your earnings weekly or hourly via USDT TRC20, Bitcoin, or local bank/MFS with zero processing fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: COMMISSION TIERS & LEVELS */}
      <section id="commission-tiers" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-4">
            <Award size={16} className="text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
              Clear Tier Progression
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Commission Levels & Tiers (কোন লেভেলে কত কি)
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Higher active trader volume unlocks higher revenue share percentages, bigger CPA bonuses, and faster on-demand payout schedules.
          </p>
        </div>

        {/* TIER COMPARISON TABLE */}
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0e1014] shadow-2xl mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400">
                <th className="py-5 px-6 font-bold">Partner Tier Level</th>
                <th className="py-5 px-6 font-bold">Monthly FTD Requirement</th>
                <th className="py-5 px-6 font-bold text-[#ffcf00]">Revenue Share</th>
                <th className="py-5 px-6 font-bold text-emerald-400">CPA Bounty</th>
                <th className="py-5 px-6 font-bold text-blue-400">Turnover Share</th>
                <th className="py-5 px-6 font-bold text-purple-400">Sub-Affiliate</th>
                <th className="py-5 px-6 font-bold">Payout Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {COMMISSION_TIERS.map((tier, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">{tier.tier}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                        {tier.badge}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-mono text-gray-300 font-semibold">{tier.ftdRange}</td>
                  <td className="py-5 px-6 font-black text-[#ffcf00] text-lg">{tier.revshare}</td>
                  <td className="py-5 px-6 font-black text-emerald-400 text-base">{tier.cpa}</td>
                  <td className="py-5 px-6 font-bold text-blue-400">{tier.turnover}</td>
                  <td className="py-5 px-6 font-bold text-purple-400">{tier.subAffiliate}</td>
                  <td className="py-5 px-6 text-gray-300 font-medium">{tier.payoutSpeed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TIER DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMISSION_TIERS.map((tier, idx) => (
            <div key={idx} className="bg-[#111216] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${tier.badgeColor} uppercase tracking-wider inline-block mb-3`}>
                  {tier.badge}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">{tier.tier}</h3>
                <div className="text-3xl font-black text-[#ffcf00] mb-4">{tier.revshare} <span className="text-sm font-normal text-gray-400">RevShare</span></div>
                <div className="space-y-2 mb-6 text-xs text-gray-300">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">FTDs Target:</span>
                    <span className="font-bold">{tier.ftdRange}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">CPA Bounty:</span>
                    <span className="font-bold text-emerald-400">{tier.cpa}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">Payout Speed:</span>
                    <span className="font-bold">{tier.payoutSpeed}</span>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="font-bold text-gray-300 mb-2">Included Perks:</div>
                  {tier.perks.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: BACKEND TECHNICAL RULES & S2S POSTBACKS */}
      <section id="backend-rules" className="py-20 px-6 md:px-12 bg-[#0c0d10] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4">
              <Server size={16} className="text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">
                Backend Architecture (ব্যাকএন্ডের সব রুলস)
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              Backend Attribution & Tracking Specifications
            </h2>
            <p className="text-gray-400 text-base md:text-lg">
              Enterprise tracking infrastructure designed for accuracy, fraud immunity, and seamless integration with third-party tracking software.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tracking Parameters */}
            <div className="bg-[#121316] border border-white/5 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. SubID Parameter Structure</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Every affiliate link supports up to 5 custom SubIDs. You can segment campaigns by ad creative, keyword, channel, or influencer.
              </p>
              <div className="bg-[#090a0d] p-3.5 rounded-xl border border-white/5 font-mono text-xs text-gray-300 break-all mb-4">
                https://bivaax.com/?ref=<span className="text-[#ffcf00]">YOUR_ID</span>&subid1=<span className="text-emerald-400">fb_ads</span>&subid2=<span className="text-blue-400">crypto</span>&subid3=<span className="text-purple-400">video_1</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-2">
                <li>• <strong className="text-white">subid1:</strong> Campaign name or ad set</li>
                <li>• <strong className="text-white">subid2:</strong> Traffic source (YouTube, Telegram, Google)</li>
                <li>• <strong className="text-white">subid3:</strong> Creative format or banner ID</li>
                <li>• <strong className="text-white">subid4:</strong> Keyword or target audience</li>
                <li>• <strong className="text-white">subid5:</strong> Click ID from your tracker</li>
              </ul>
            </div>

            {/* S2S Webhooks */}
            <div className="bg-[#121316] border border-white/5 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. S2S Postback Webhooks</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Connect Voluum, Keitaro, Binom, or custom backends. Bivaax fires automated server-to-server callbacks within 50ms of any event.
              </p>
              <div className="bg-[#090a0d] p-3.5 rounded-xl border border-white/5 font-mono text-xs text-gray-300 break-all mb-4">
                https://tracker.com/postback?click_id=<span className="text-purple-400">&#123;subid5&#125;</span>&event=<span className="text-emerald-400">&#123;event&#125;</span>&amount=<span className="text-[#ffcf00]">&#123;amount&#125;</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-2">
                <li>• <strong className="text-white">&#123;event&#125;:</strong> registration | ftd | deposit | trade</li>
                <li>• <strong className="text-white">&#123;amount&#125;:</strong> Deposit or commission amount in USD</li>
                <li>• <strong className="text-white">&#123;trader_id&#125;:</strong> Anonymized unique trader ID</li>
                <li>• <strong className="text-white">&#123;currency&#125;:</strong> Account denomination (USD, EUR, BDT, INR)</li>
              </ul>
            </div>

            {/* Anti-Fraud Protection */}
            <div className="bg-[#121316] border border-white/5 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Anti-Fraud & Quality Filters</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Our backend runs real-time heuristics to ensure commission integrity and protect genuine top affiliates from fraud flags.
              </p>
              <ul className="text-xs text-gray-400 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Self-Referral Blocker:</strong> Automatically detects shared IPs, device hashes, or payment cards between partner and trader.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Bot & Click Farm Detection:</strong> Filters synthetic browser emulators without penalizing real organic clicks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Negative Balance Reset:</strong> Negative commissions do not carry over to the following month on standard RevShare.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CONTENT & PROMOTIONAL RULES (কন্টেন্টের সব রুলস) */}
      <section id="traffic-rules" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
              Content & Promotional Policy (কন্টেন্টের সব রুলস)
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Allowed vs Prohibited Promotional Methods
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            To safeguard the Bivaax brand and maintain reliable payment partnerships, affiliates must strictly adhere to our marketing guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ALLOWED TRAFFIC */}
          <div className="bg-[#0e1014] border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Allowed Traffic Channels</h3>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Compliant Methods</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-bold text-white mb-1">1. YouTube Trading Education</h4>
                <p className="text-gray-400 text-xs">Technical chart analysis, live trading sessions, broker platform tutorials, and strategy guides.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-bold text-white mb-1">2. Telegram & WhatsApp Communities</h4>
                <p className="text-gray-400 text-xs">Educational VIP signal rooms, daily market briefings, economic calendar alerts, and trading tips.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-bold text-white mb-1">3. SEO Review Websites & Financial Blogs</h4>
                <p className="text-gray-400 text-xs">Comprehensive broker comparison tables, Bivaax review articles, deposit guides, and trading tutorials.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-bold text-white mb-1">4. Generic Paid Search & Social Ads</h4>
                <p className="text-gray-400 text-xs">Targeting generic terms such as "how to trade forex", "best options strategies", or "trading indicators".</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-bold text-white mb-1">5. TikTok, Instagram Reels & Social Feeds</h4>
                <p className="text-gray-400 text-xs">Short-form educational content with transparent financial risk disclosures.</p>
              </div>
            </div>
          </div>

          {/* PROHIBITED TRAFFIC */}
          <div className="bg-[#0e1014] border border-rose-500/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <X size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Strictly Prohibited Methods</h3>
                <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Zero-Tolerance Violations</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <h4 className="font-bold text-rose-400 mb-1">1. Self-Referral Trading</h4>
                <p className="text-gray-400 text-xs">Opening an account with your own referral link or trading to earn commissions on yourself. Results in immediate account suspension.</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <h4 className="font-bold text-rose-400 mb-1">2. Brand Bidding (PPC on Trademark)</h4>
                <p className="text-gray-400 text-xs">Bidding on exact trademark terms such as "Bivaax", "Bivaax Trade", "Bivaax Login", or "bivaax.com" in Google Ads or Bing Ads without written approval.</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <h4 className="font-bold text-rose-400 mb-1">3. Deceptive or Guaranteed Income Claims</h4>
                <p className="text-gray-400 text-xs">Promising "100% guaranteed profit", "magic trading bots", or "zero risk wealth". Affiliates must always include proper risk warnings.</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <h4 className="font-bold text-rose-400 mb-1">4. Unsolicited Spam Messaging</h4>
                <p className="text-gray-400 text-xs">Sending bulk unsolicited emails, SMS spam, or automated direct message flooding on social platforms.</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <h4 className="font-bold text-rose-400 mb-1">5. Incentivized Cashback Fraud</h4>
                <p className="text-gray-400 text-xs">Paying users cash or unauthorized rebates solely to register and deposit. Traffic must demonstrate genuine trading intent.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQ & AI SEARCH RETRIEVAL */}
      <section id="faq-section" className="py-20 px-6 md:px-12 bg-[#0c0d10] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 border border-[#ffcf00]/20 px-4 py-1.5 rounded-full mb-4">
              <HelpCircle size={16} className="text-[#ffcf00]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#ffcf00]">
                AI-Ready Knowledge Base
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              Frequently Asked Questions & Answers
            </h2>
            <p className="text-gray-400 text-base md:text-lg">
              Official, authoritative answers to all affiliate questions—optimized for both human partners and AI search engines.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-[#121316] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left font-bold text-white hover:text-[#ffcf00] transition-colors"
                >
                  <span className="text-base md:text-lg pr-4">{item.q}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp size={20} className="text-[#ffcf00] shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 md:px-12 text-center max-w-5xl mx-auto">
        <div className="bg-gradient-to-b from-[#16181f] to-[#0c0d10] border border-white/10 rounded-3xl p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffcf00]/10 rounded-full blur-[100px] pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Ready to Start Earning Up to 80% RevShare?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Create your affiliate account today. Get instant access to unique referral links, 30-day cookie tracking, marketing banners, and 24/7 dedicated support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/partner" 
              className="w-full sm:w-auto bg-[#ffcf00] hover:bg-[#e6b800] text-black font-black px-8 py-4 rounded-xl text-base transition-all shadow-xl shadow-[#ffcf00]/10 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              Register as Partner <ArrowRight size={18} strokeWidth={3} />
            </Link>
            <Link 
              to="/docs" 
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl text-base transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              Developer API Docs
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={20} color="white" />
            <span className="font-bold text-gray-400">© 2026 Bivaax Trade Partners. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about-us" className="hover:text-gray-300 transition-colors">About Us</Link>
            <Link to="/affiliate-rules" className="hover:text-gray-300 transition-colors">Affiliate Rules</Link>
            <Link to="/docs" className="hover:text-gray-300 transition-colors">API Docs</Link>
            <Link to="/support" className="hover:text-gray-300 transition-colors">24/7 Support Desk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
