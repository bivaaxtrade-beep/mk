import React from 'react';
import { 
  ArrowLeft, 
  Diamond, 
  Shield, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Star, 
  TrendingUp, 
  LayoutGrid, 
  Wallet, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StatusesViewProps {
  activeTab: string;
  onBack: () => void;
  onTrading: () => void;
  onDeposit: () => void;
  demoBalance: number;
  completedDepositsBdt: number;
  activeUserStatus: string;
  userCurrency: string;
  formatWithCurrency: (amount: number, currency: string) => string;
  nextStatusInfo: {
    nextTier: string;
    requiredBdt: number;
    leftBdt: number;
    progress: number;
  };
}

export const StatusesView: React.FC<StatusesViewProps> = ({
  onBack,
  onTrading,
  onDeposit,
  demoBalance,
  completedDepositsBdt,
  activeUserStatus,
  userCurrency,
  formatWithCurrency,
  nextStatusInfo,
}) => {
  const [selectedFilter, setSelectedFilter] = React.useState<'all' | 'free' | 'standard' | 'gold' | 'vip' | 'prestige'>('all');

  return (
    <div id="statuses-view-container" className="fixed inset-0 z-[600] flex flex-col bg-[#111216] text-white overflow-y-auto pb-safe">
      {/* Top Sticky Header */}
      <div id="statuses-header" className="h-14 md:h-16 flex items-center justify-between px-3 md:px-8 border-b border-white/5 shrink-0 sticky top-0 bg-[#16171d]/95 backdrop-blur-md z-[210]">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button 
            id="statuses-back-btn"
            onClick={onBack} 
            className="p-2 -ml-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#FFE24C]/10 border border-[#FFE24C]/20 flex items-center justify-center text-[#FFE24C] shrink-0">
              <Diamond size={16} />
            </div>
            <span className="text-sm md:text-base font-extrabold text-white tracking-wide truncate">Account Statuses</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button 
            id="statuses-trading-header-btn"
            onClick={onTrading} 
            className="bg-[#FFE24C] hover:bg-[#ebd04f] active:scale-95 text-black px-4 py-1.5 md:px-6 md:py-2 rounded-xl font-black transition-all text-xs md:text-sm uppercase tracking-wider cursor-pointer shadow-md shadow-[#FFE24C]/10"
          >
            Trading
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center py-6 md:py-10 px-4 md:px-8">
        <div className="max-w-[1440px] w-full">
          
          {/* Status Level Progression Hero Card */}
          <div id="statuses-hero-card" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1c24] via-[#212430] to-[#1a1c24] border border-white/10 p-5 md:p-7 mb-8 shadow-xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#FFE24C]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Level</span>
                  <span className={`text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full border ${
                    activeUserStatus === 'Prestige' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                    activeUserStatus === 'VIP' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' :
                    activeUserStatus === 'Gold' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                    activeUserStatus === 'Standard' ? 'bg-[#00C980]/20 text-[#00C980] border-[#00C980]/40' :
                    'bg-gray-700/40 text-gray-300 border-gray-600/40'
                  }`}>
                    ★ {activeUserStatus}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Trading Advantages & Status Privileges
                </h2>
                <p className="text-gray-400 text-xs md:text-sm max-w-2xl leading-relaxed">
                  Upgrade your status by depositing to unlock up to 95% maximum profitability, instant 4-hour withdrawals, risk-free trades, personal VIP manager, and deposit insurance.
                </p>
              </div>

              {/* Progress Tracker Widget */}
              <div className="bg-[#14151a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 min-w-[280px] sm:min-w-[340px] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Accumulated Deposits:</span>
                  <span className="font-bold text-white">{formatWithCurrency(completedDepositsBdt, userCurrency)}</span>
                </div>
                
                {nextStatusInfo.nextTier !== 'Max Tier' ? (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">Next Tier: <span className="text-[#FFE24C] font-bold">{nextStatusInfo.nextTier}</span></span>
                      <span className="text-[#FFE24C] font-bold">{formatWithCurrency(nextStatusInfo.leftBdt, userCurrency)} needed</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00C980] via-[#FFE24C] to-[#FFE24C] rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(5, nextStatusInfo.progress)}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-[#00C980] font-bold flex items-center gap-1.5">
                    <Check size={14} strokeWidth={3} /> You have achieved the highest prestige tier!
                  </div>
                )}

                <button 
                  id="upgrade-status-hero-btn"
                  onClick={() => {
                    onDeposit();
                    toast.success('Open cashier deposit to upgrade your status!');
                  }} 
                  className="w-full bg-[#FFE24C] hover:bg-[#ebd04f] active:scale-95 text-black font-extrabold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md mt-1 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp size={14} strokeWidth={2.5} />
                  <span>Deposit & Upgrade Status</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Pill Tabs */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
            {[
              { id: 'all', name: 'All Tiers' },
              { id: 'free', name: 'Free' },
              { id: 'standard', name: 'Standard' },
              { id: 'gold', name: 'Gold' },
              { id: 'vip', name: 'VIP' },
              { id: 'prestige', name: 'Prestige' },
            ].map(tab => (
              <button
                key={tab.id}
                id={`status-filter-${tab.id}`}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-[#FFE24C] text-black border-[#FFE24C] shadow-md shadow-[#FFE24C]/20'
                    : 'bg-[#1a1b22] text-gray-400 border-white/10 hover:text-white hover:bg-[#23242e]'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* 5 Status Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 pb-16">
            
            {/* 1. FREE CARD */}
            {(selectedFilter === 'all' || selectedFilter === 'free') && (
              <div id="status-card-free" className={`rounded-2xl flex flex-col relative overflow-hidden transition-all duration-200 border ${
                activeUserStatus === 'Free'
                  ? 'bg-[#1a1c22] border-[#00C980] ring-1 ring-[#00C980]/40 shadow-lg shadow-[#00C980]/5'
                  : 'bg-[#16171d] border-white/10 hover:border-white/20'
              }`}>
                <div className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-white">Free</h3>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                      <Shield size={16} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded inline-flex items-center uppercase tracking-wider ${
                      activeUserStatus === 'Free' ? 'bg-[#00C980] text-black' : 'bg-white/10 text-gray-400'
                    }`}>
                      {activeUserStatus === 'Free' ? 'Your Current Status' : 'Starter Level'}
                    </span>
                  </div>

                  <div className="bg-[#101115] p-3.5 rounded-xl border border-white/5 space-y-1 mb-4">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Required Deposit</div>
                    <div className="text-lg font-black text-white">{formatWithCurrency(0, userCurrency)}</div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="bg-[#101115] p-3 rounded-xl border border-white/5">
                      <div className="text-base font-extrabold text-white">30 Trades</div>
                      <div className="text-[11px] text-gray-400">on Demo Account</div>
                    </div>
                    <div className="bg-[#101115] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold text-white">100+</div>
                        <div className="text-[11px] text-gray-400">Basic Assets</div>
                      </div>
                      <LayoutGrid size={16} className="text-gray-500" />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-b border-white/5 py-3 mb-4 text-gray-300">
                    <div className="flex justify-between items-center"><span className="text-gray-400">Profitability</span><span className="font-bold text-white">up to 82%</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Withdrawals</span><span className="font-bold text-gray-400">3-5 days</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Deposit bonus</span><span className="font-bold text-gray-400">—</span></div>
                  </div>

                  <div className="space-y-2.5 text-[12px] text-gray-400 flex-1 mb-5">
                    <div className="flex items-start gap-2"><Check size={14} className="shrink-0 mt-0.5 text-[#00C980]" strokeWidth={2.5} /> <span>Demo account access</span></div>
                    <div className="flex items-start gap-2"><Check size={14} className="shrink-0 mt-0.5 text-[#00C980]" strokeWidth={2.5} /> <span>Real-time candlestick charts</span></div>
                    <div className="flex items-start gap-2 opacity-40"><X size={14} className="shrink-0 mt-0.5 text-gray-500" /> <span>Risk-free trades</span></div>
                    <div className="flex items-start gap-2 opacity-40"><X size={14} className="shrink-0 mt-0.5 text-gray-500" /> <span>VIP tournaments access</span></div>
                    <div className="flex items-start gap-2 opacity-40"><X size={14} className="shrink-0 mt-0.5 text-gray-500" /> <span>Personal manager</span></div>
                  </div>

                  <div className="mt-auto">
                    <button 
                      disabled={activeUserStatus === 'Free'}
                      onClick={onDeposit}
                      className="w-full bg-white/10 hover:bg-white/15 text-gray-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {activeUserStatus === 'Free' ? 'Active Status' : 'Free Tier'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. STANDARD CARD */}
            {(selectedFilter === 'all' || selectedFilter === 'standard') && (
              <div id="status-card-standard" className={`rounded-2xl flex flex-col relative overflow-hidden transition-all duration-200 border ${
                activeUserStatus === 'Standard'
                  ? 'bg-gradient-to-b from-[#14261f] to-[#101c16] border-[#00C980] ring-2 ring-[#00C980]/40 shadow-xl shadow-[#00C980]/10'
                  : 'bg-gradient-to-b from-[#131f19] to-[#0f1512] border-[#00C980]/20 hover:border-[#00C980]/40'
              }`}>
                <div className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-[#00C980]">Standard</h3>
                    <div className="w-8 h-8 rounded-full bg-[#00C980]/10 flex items-center justify-center text-[#00C980]">
                      <ShieldCheck size={18} strokeWidth={2.2} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded inline-flex items-center uppercase tracking-wider ${
                      activeUserStatus === 'Standard' ? 'bg-[#00C980] text-black font-black' : (completedDepositsBdt >= 1000 ? 'bg-[#00C980]/20 text-[#00C980]' : 'bg-white/10 text-gray-400')
                    }`}>
                      {activeUserStatus === 'Standard' ? '✓ Your Current Status' : (completedDepositsBdt >= 1000 ? 'Unlocked' : 'Min Deposit $8.50')}
                    </span>
                  </div>

                  <div className="bg-[#0c1611] p-3.5 rounded-xl border border-[#00C980]/15 space-y-1 mb-4">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Required Deposit</div>
                    <div className="text-lg font-black text-white">{formatWithCurrency(1000, userCurrency)}</div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="bg-[#0c1611] p-3 rounded-xl border border-[#00C980]/15 flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold text-[#00C980]">up to 85%</div>
                        <div className="text-[11px] text-gray-400">Profitability</div>
                      </div>
                      <TrendingUp size={16} className="text-[#00C980]" />
                    </div>
                    <div className="bg-[#0c1611] p-3 rounded-xl border border-[#00C980]/15 flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold text-white">115+</div>
                        <div className="text-[11px] text-gray-400">Assets & OTC</div>
                      </div>
                      <LayoutGrid size={16} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-b border-white/5 py-3 mb-4 text-gray-300">
                    <div className="flex justify-between items-center"><span className="text-gray-400">Withdrawals</span><span className="font-bold text-[#00C980]">24 Hours</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Invite Friends</span><span className="font-bold text-white">up to $15</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Deposit bonus</span><span className="font-bold text-[#00C980]">up to 50%</span></div>
                  </div>

                  <div className="space-y-2.5 text-[12px] text-gray-300 flex-1 mb-5">
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-[#00C980]" strokeWidth={2.5} /> <span>24-hour fast withdrawals</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-[#00C980]" strokeWidth={2.5} /> <span>Drawing tools & technical indicators</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-[#00C980]" strokeWidth={2.5} /> <span>Standard tournament participation</span></div>
                    <div className="flex items-start gap-2 opacity-40"><X size={14} className="shrink-0 mt-0.5 text-gray-500" /> <span>Risk-free trades</span></div>
                    <div className="flex items-start gap-2 opacity-40"><X size={14} className="shrink-0 mt-0.5 text-gray-500" /> <span>VIP manager</span></div>
                  </div>

                  <div className="mt-auto">
                    <button 
                      id="standard-tier-action-btn"
                      onClick={onDeposit}
                      className={`w-full font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                        activeUserStatus === 'Standard'
                          ? 'bg-[#00C980] text-black shadow-lg shadow-[#00C980]/20'
                          : 'bg-[#00C980]/20 text-[#00C980] hover:bg-[#00C980] hover:text-black border border-[#00C980]/30'
                      }`}
                    >
                      {activeUserStatus === 'Standard' ? 'Active Status' : 'Deposit $8.50 to Unlock'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. GOLD CARD */}
            {(selectedFilter === 'all' || selectedFilter === 'gold') && (
              <div id="status-card-gold" className={`rounded-2xl flex flex-col relative overflow-hidden transition-all duration-200 border ${
                activeUserStatus === 'Gold'
                  ? 'bg-gradient-to-b from-[#282211] to-[#17140b] border-[#FFE24C] ring-2 ring-[#FFE24C]/40 shadow-xl shadow-[#FFE24C]/10'
                  : 'bg-gradient-to-b from-[#1f1b0e] to-[#121008] border-[#FFE24C]/25 hover:border-[#FFE24C]/50'
              }`}>
                <div className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-[#FFE24C]">Gold</h3>
                    <div className="w-8 h-8 rounded-full bg-[#FFE24C]/10 flex items-center justify-center text-[#FFE24C]">
                      <Zap size={18} strokeWidth={2.2} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded inline-flex items-center uppercase tracking-wider ${
                      activeUserStatus === 'Gold' ? 'bg-[#FFE24C] text-black font-black' : (completedDepositsBdt >= 42000 ? 'bg-[#FFE24C]/20 text-[#FFE24C]' : 'bg-white/10 text-gray-400')
                    }`}>
                      {activeUserStatus === 'Gold' ? '★ Your Current Status' : (completedDepositsBdt >= 42000 ? 'Unlocked' : 'Popular Choice')}
                    </span>
                  </div>

                  <div className="bg-[#121008] p-3.5 rounded-xl border border-[#FFE24C]/15 space-y-1 mb-4">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Required Deposit</div>
                    <div className="text-lg font-black text-[#FFE24C]">{formatWithCurrency(42000, userCurrency)}</div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="bg-[#121008] p-3 rounded-xl border border-[#FFE24C]/15 flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold text-[#FFE24C]">up to 90%</div>
                        <div className="text-[11px] text-gray-400">Max Profitability</div>
                      </div>
                      <TrendingUp size={16} className="text-[#FFE24C]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#121008] p-2.5 rounded-xl border border-[#FFE24C]/15">
                        <div className="text-sm font-extrabold text-white">135+</div>
                        <div className="text-[10px] text-gray-400">Assets</div>
                      </div>
                      <div className="bg-[#121008] p-2.5 rounded-xl border border-[#FFE24C]/15">
                        <div className="text-sm font-extrabold text-[#FFE24C]">5%</div>
                        <div className="text-[10px] text-gray-400">Cashback</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-b border-white/5 py-3 mb-4 text-gray-300">
                    <div className="flex justify-between items-center"><span className="text-gray-400">Withdrawals</span><span className="font-bold text-[#FFE24C]">24 Hours</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Invite Friends</span><span className="font-bold text-white">up to $50</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Deposit bonus</span><span className="font-bold text-[#FFE24C]">up to 150%</span></div>
                  </div>

                  <div className="space-y-2.5 text-[12px] text-gray-300 flex-1 mb-5">
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-[#FFE24C]" strokeWidth={2.5} /> <span>Advanced expedited processing</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-[#FFE24C]" strokeWidth={2.5} /> <span>Real-time expert trading signals</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-[#FFE24C]" strokeWidth={2.5} /> <span>5% monthly loss cashback</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-[#FFE24C]" strokeWidth={2.5} /> <span>Priority customer support</span></div>
                    <div className="flex items-start gap-2 opacity-40"><X size={14} className="shrink-0 mt-0.5 text-gray-500" /> <span>Dedicated VIP manager</span></div>
                  </div>

                  <div className="mt-auto">
                    <button 
                      id="gold-tier-action-btn"
                      onClick={onDeposit}
                      className={`w-full font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                        activeUserStatus === 'Gold'
                          ? 'bg-[#FFE24C] text-black shadow-lg shadow-[#FFE24C]/20'
                          : 'bg-[#FFE24C] text-black hover:bg-[#ebd04f] shadow-md shadow-[#FFE24C]/20'
                      }`}
                    >
                      {activeUserStatus === 'Gold' ? 'Active Status' : 'Upgrade to Gold'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. VIP CARD */}
            {(selectedFilter === 'all' || selectedFilter === 'vip') && (
              <div id="status-card-vip" className={`rounded-2xl flex flex-col relative overflow-hidden transition-all duration-200 border ${
                activeUserStatus === 'VIP'
                  ? 'bg-gradient-to-b from-[#132437] to-[#0c1520] border-sky-400 ring-2 ring-sky-400/40 shadow-xl shadow-sky-400/10'
                  : 'bg-gradient-to-b from-[#111e2d] to-[#0a111a] border-sky-400/25 hover:border-sky-400/50'
              }`}>
                <div className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-sky-400">VIP</h3>
                    <div className="w-8 h-8 rounded-full bg-sky-400/10 flex items-center justify-center text-sky-400">
                      <Crown size={18} strokeWidth={2.2} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded inline-flex items-center uppercase tracking-wider ${
                      activeUserStatus === 'VIP' ? 'bg-sky-400 text-black font-black' : (completedDepositsBdt >= 85000 ? 'bg-sky-400/20 text-sky-300' : 'bg-sky-500/10 text-sky-300 border border-sky-500/20')
                    }`}>
                      {activeUserStatus === 'VIP' ? '★ Your VIP Status' : (completedDepositsBdt >= 85000 ? 'Unlocked' : 'Elite Trader')}
                    </span>
                  </div>

                  <div className="bg-[#090f17] p-3.5 rounded-xl border border-sky-400/15 space-y-1 mb-4">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Required Deposit</div>
                    <div className="text-lg font-black text-sky-400">{formatWithCurrency(85000, userCurrency)}</div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="bg-[#090f17] p-3 rounded-xl border border-sky-400/15 flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold text-sky-400">up to 92%</div>
                        <div className="text-[11px] text-gray-400">Max Profitability</div>
                      </div>
                      <TrendingUp size={16} className="text-sky-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#090f17] p-2.5 rounded-xl border border-sky-400/15">
                        <div className="text-sm font-extrabold text-white">150+</div>
                        <div className="text-[10px] text-gray-400">Assets</div>
                      </div>
                      <div className="bg-[#090f17] p-2.5 rounded-xl border border-sky-400/15">
                        <div className="text-sm font-extrabold text-sky-400">10%</div>
                        <div className="text-[10px] text-gray-400">Cashback</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-b border-white/5 py-3 mb-4 text-gray-300">
                    <div className="flex justify-between items-center"><span className="text-gray-400">Withdrawals</span><span className="font-bold text-sky-400">4 Hours</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Invite Friends</span><span className="font-bold text-white">up to $250</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Deposit bonus</span><span className="font-bold text-sky-400">up to 200%</span></div>
                  </div>

                  <div className="space-y-2.5 text-[12px] text-gray-300 flex-1 mb-5">
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-sky-400" strokeWidth={2.5} /> <span>Personal dedicated VIP manager</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-sky-400" strokeWidth={2.5} /> <span>Monthly Risk-free insured trades</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-sky-400" strokeWidth={2.5} /> <span>Free entry to VIP tournaments</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-sky-400" strokeWidth={2.5} /> <span>Deposit insurance protection guarantee</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-sky-400" strokeWidth={2.5} /> <span>Multi-window simultaneous trading</span></div>
                  </div>

                  <div className="mt-auto">
                    <button 
                      id="vip-tier-action-btn"
                      onClick={onDeposit}
                      className={`w-full font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                        activeUserStatus === 'VIP'
                          ? 'bg-sky-400 text-black shadow-lg shadow-sky-400/20'
                          : 'bg-sky-400 text-black hover:bg-sky-300 shadow-md shadow-sky-400/20'
                      }`}
                    >
                      {activeUserStatus === 'VIP' ? 'Active VIP' : 'Upgrade to VIP'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PRESTIGE CARD */}
            {(selectedFilter === 'all' || selectedFilter === 'prestige') && (
              <div id="status-card-prestige" className={`rounded-2xl flex flex-col relative overflow-hidden transition-all duration-200 border ${
                activeUserStatus === 'Prestige'
                  ? 'bg-gradient-to-b from-[#381647] to-[#1e0b27] border-purple-400 ring-2 ring-purple-400/40 shadow-xl shadow-purple-400/15'
                  : 'bg-gradient-to-b from-[#291135] to-[#15071c] border-purple-400/30 hover:border-purple-400/60'
              }`}>
                <div className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-purple-300">Prestige</h3>
                    <div className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center text-purple-300">
                      <Star size={18} strokeWidth={2.2} fill="currentColor" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded inline-flex items-center uppercase tracking-wider ${
                      activeUserStatus === 'Prestige' ? 'bg-purple-400 text-black font-black' : (completedDepositsBdt >= 360000 ? 'bg-purple-400/20 text-purple-300' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30')
                    }`}>
                      {activeUserStatus === 'Prestige' ? '★ Ultimate Prestige Tier' : (completedDepositsBdt >= 360000 ? 'Unlocked' : 'Supreme Status')}
                    </span>
                  </div>

                  <div className="bg-[#120519] p-3.5 rounded-xl border border-purple-400/20 space-y-1 mb-4">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Required Deposit</div>
                    <div className="text-lg font-black text-purple-300">{formatWithCurrency(360000, userCurrency)}</div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="bg-[#120519] p-3 rounded-xl border border-purple-400/20 flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold text-purple-300">up to 95%</div>
                        <div className="text-[11px] text-gray-400">Highest Profitability</div>
                      </div>
                      <TrendingUp size={16} className="text-purple-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#120519] p-2.5 rounded-xl border border-purple-400/20">
                        <div className="text-sm font-extrabold text-white">170+</div>
                        <div className="text-[10px] text-gray-400">All Assets</div>
                      </div>
                      <div className="bg-[#120519] p-2.5 rounded-xl border border-purple-400/20">
                        <div className="text-sm font-extrabold text-purple-300">15%</div>
                        <div className="text-[10px] text-gray-400">Cashback +</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-b border-purple-500/20 py-3 mb-4 text-purple-200">
                    <div className="flex justify-between items-center"><span className="text-purple-300/70">Withdrawals</span><span className="font-bold text-white">1-4 Hours (Instant)</span></div>
                    <div className="flex justify-between items-center"><span className="text-purple-300/70">Invite Friends</span><span className="font-bold text-white">up to $850</span></div>
                    <div className="flex justify-between items-center"><span className="text-purple-300/70">Deposit bonus</span><span className="font-bold text-purple-300">up to 300%</span></div>
                  </div>

                  <div className="space-y-2.5 text-[12px] text-purple-100 flex-1 mb-5">
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-purple-300" strokeWidth={2.5} /> <span>15% Monthly Cashback Plus package</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-purple-300" strokeWidth={2.5} /> <span>Full balance insurance on zero balance</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-purple-300" strokeWidth={2.5} /> <span>VIP Mobile App & early access</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-purple-300" strokeWidth={2.5} /> <span>Elite 24/7 personal trading consultant</span></div>
                    <div className="flex items-start gap-2 text-white"><Check size={14} className="shrink-0 mt-0.5 text-purple-300" strokeWidth={2.5} /> <span>Highest prize pool tournament entries</span></div>
                  </div>

                  <div className="mt-auto">
                    <button 
                      id="prestige-tier-action-btn"
                      onClick={onDeposit}
                      className={`w-full font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                        activeUserStatus === 'Prestige'
                          ? 'bg-purple-400 text-black shadow-lg shadow-purple-400/30'
                          : 'bg-purple-500 text-white hover:bg-purple-400 hover:text-black shadow-md shadow-purple-500/20'
                      }`}
                    >
                      {activeUserStatus === 'Prestige' ? 'Active Prestige' : 'Upgrade to Prestige'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
