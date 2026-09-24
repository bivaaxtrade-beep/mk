import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  ExternalLink, 
  BarChart3, 
  Wallet, 
  HelpCircle, 
  MessageSquare, 
  Menu,
  ChevronDown,
  Calendar,
  MousePointer2,
  Plus,
  UserPlus,
  ArrowRight,
  ChevronRight,
  Edit3,
  Info,
  Zap,
  History,
  X,
  Activity,
  Award,
  Trophy,
  Check,
  CheckCircle2,
  Clock,
  Calculator,
  Bell,
  Settings,
  Globe,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Gift,
  Briefcase,
  Link,
  Image,
  Undo2,
  CreditCard,
  User,
  Bot,
  Headphones,
  LayoutDashboard,
  Banknote,
  AlertTriangle,
  ShieldAlert,
  Send,
  Trash2,
  Lock,
  LogOut,
  Search
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, changeAppLanguage } from '../i18n';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, doc, getDoc, updateDoc, increment, addDoc, deleteDoc } from '../firebase';
import toast from 'react-hot-toast';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { buildTraderReferralLink, getTraderPlatformOrigin, getAffiliatePairCodes } from '../lib/affiliate';
import { getNumericId } from '../lib/user-utils';

export const getNextPayoutDateStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = (8 - day) % 7 || 7; // days to next Monday
  const nextMonday = new Date(d);
  nextMonday.setDate(d.getDate() + diff);
  const m = nextMonday.getMonth() + 1;
  const dayNum = nextMonday.getDate();
  const y = nextMonday.getFullYear();
  return `${m}/${dayNum}/${y}, 6:00 PM`;
};


const StatCard = ({ title, value, subtext, color = "blue", icon: Icon }: { title: string, value: string | number, subtext: string, color?: string, icon?: any }) => {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500/20 text-blue-400 bg-[#15171e]/50",
    green: "border-emerald-500/20 text-emerald-400 bg-[#15171e]/50",
    purple: "border-indigo-500/20 text-indigo-400 bg-[#15171e]/50",
    orange: "border-orange-500/20 text-orange-400 bg-[#15171e]/50",
    cyan: "border-cyan-500/20 text-cyan-400 bg-[#15171e]/50"
  };

  return (
    <div className={`rounded-[32px] p-8 border ${colorMap[color] || colorMap.blue} backdrop-blur-sm shadow-2xl hover:border-white/20 transition-all duration-500 group relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] leading-tight">{title}</h3>
        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${colorMap[color].split(' ')[1]}`}>
          {Icon && <Icon size={18} strokeWidth={2.5} />}
        </div>
      </div>
      <div>
        <div className="text-[36px] font-black text-white leading-none mb-3 tracking-tighter tabular-nums">{value}</div>
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 rounded-full bg-current opacity-40"></div>
           <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{subtext}</span>
        </div>
      </div>
    </div>
  );
};

const FastLink = ({ icon: Icon, title, iconColor, bgColor, onClick }: { icon: any, title: string, iconColor: string, bgColor: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`bg-[#15171e]/50 hover:bg-[#1a1c25] transition-all rounded-[40px] p-8 md:p-10 flex flex-col items-start gap-5 text-left group h-full shadow-2xl border border-white/5 hover:border-white/10 relative overflow-hidden`}
  >
    <div className="absolute -right-8 -bottom-8 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
       <Icon size={160} strokeWidth={1} />
    </div>
    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center bg-white/5 shadow-xl border border-white/5 transition-transform group-hover:scale-110 group-active:scale-95 duration-500 mb-2 z-10`}>
      <Icon className={iconColor} size={32} strokeWidth={2.5} />
    </div>
    <div className="z-10">
      <span className={`text-[20px] md:text-[24px] font-black tracking-tighter text-white block mb-1 group-hover:${iconColor} transition-colors`}>{title}</span>
      <div className="flex items-center gap-2">
         <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Launch Terminal</span>
         <ArrowRight size={12} strokeWidth={3} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </button>
);

const SectionHeading = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex flex-col gap-2 mb-12">
     <div className="flex items-center gap-5">
       <div className="w-14 h-14 flex items-center justify-center bg-[#ffcf00] rounded-2xl text-black shadow-2xl shadow-[#ffcf00]/10">
         <Icon size={28} strokeWidth={2.5} />
       </div>
       <div>
         <h2 className="text-[32px] font-black tracking-tighter text-[#1a2233] leading-none mb-1">{title}</h2>
         <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] ml-0.5">{desc}</p>
       </div>
     </div>
  </div>
);

const BivaaxSidebar = ({ isOpen, onClose, activeTab, onTabChange, initials, onLogout, affiliateBalance, onTransfer }: any) => {
  const { t, i18n } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || 
                      SUPPORTED_LANGUAGES.find(l => i18n.language?.startsWith(l.code)) || 
                      SUPPORTED_LANGUAGES[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(langSearch.toLowerCase().trim()) ||
    l.nativeName.toLowerCase().includes(langSearch.toLowerCase().trim()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase().trim())
  );

  const content = (
    <div className={`flex flex-col h-full bg-white text-slate-900 border-r border-gray-100 overflow-y-auto custom-scrollbar ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
      <div className="p-6 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-50/50 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3b66f5] rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/10">
            <Logo size={20} color="white" />
          </div>
          <div>
            <div className="text-[17px] font-black leading-none tracking-tight text-[#1a2233]">Bivaax</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{t('affiliate_center')}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="px-4 py-2 space-y-1">
        {menuItems.map((item: any) => (
          <button 
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
              activeTab === item.id 
                ? 'bg-[#3b66f5] text-white shadow-xl shadow-blue-600/10' 
                : 'text-slate-500 hover:bg-gray-50 hover:text-[#1a2233]'
            }`}
          >
            <div className="flex items-center gap-4">
               <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-[#1a2233] transition-colors'} />
               <span className={`text-[14px] ${activeTab === item.id ? 'font-black tracking-tight' : 'font-bold'}`}>{t(item.id.replace(/-/g, '_'))}</span>
            </div>
            {item.isNew && (
               <span className="bg-[#34c759] text-[8px] font-black px-1.5 py-0.5 rounded uppercase text-white shadow-sm tracking-widest">{t('new')}</span>
            )}
          </button>
        ))}
        
        <div className="pt-8 px-2 space-y-4">
           <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('affiliate_balance')}</p>
              <p className="text-[26px] font-black text-[#1a2233] tracking-tighter leading-none">$ {affiliateBalance.toFixed(2)}</p>
           </div>
           <button 
             onClick={onTransfer}
             className="w-full bg-[#00dc74] text-white font-black py-4.5 rounded-[22px] uppercase tracking-[0.15em] text-[11px] shadow-xl shadow-emerald-500/10 hover:bg-emerald-500 transition-all active:scale-95"
           >
              {t('transfer_to_main')}
           </button>
        </div>
      </div>

      <div className="p-4 mt-6 space-y-4 border-t border-gray-50">
        <div className="relative">
          <button 
            onClick={() => {
              setLangSearch('');
              setShowLangModal(true);
            }}
            className="flex items-center gap-3.5 px-4 py-3.5 w-full text-slate-600 hover:text-[#1a2233] hover:bg-slate-50 rounded-2xl transition-all font-bold text-[14px] group border border-slate-100"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base group-hover:scale-105 transition-transform shrink-0">
              {currentLang.flag}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">{t('language')}</div>
              <div className="text-[13px] font-bold text-slate-800 leading-tight truncate">
                {currentLang.nativeName} <span className="text-slate-400 font-normal text-xs">({currentLang.name})</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        <div className="px-5 py-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col gap-5">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#1a2233] flex items-center justify-center font-black text-sm shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-black text-[#1a2233] truncate leading-tight">{t('partner_account')}</div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.1em] mt-0.5">{t('verified')}</div>
              </div>
           </div>
           
           <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 w-full text-rose-500 hover:text-white bg-white hover:bg-rose-500 border border-slate-100 hover:border-rose-500 rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.15em] shadow-sm"
            >
              <LogOut size={16} />
              <span>{t('sign_out')}</span>
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-[120] lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:block w-[280px] h-screen sticky top-0 z-50 flex-shrink-0">
        {content}
      </aside>

      {/* Global Language Selector Modal */}
      <AnimatePresence>
        {showLangModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLangModal(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-none">{t('select_language')}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">{t('all_languages')} ({SUPPORTED_LANGUAGES.length})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLangModal(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search input */}
              <div className="p-4 border-b border-slate-100 bg-white">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder={t('search_language')}
                    className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                    autoFocus
                  />
                  {langSearch && (
                    <button 
                      onClick={() => setLangSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1 py-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Languages List */}
              <div className="p-4 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredLanguages.map((lang) => {
                  const isSelected = i18n.language === lang.code || (i18n.language?.startsWith(lang.code) && !SUPPORTED_LANGUAGES.some(x => x.code === i18n.language));
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeAppLanguage(lang.code);
                        if (auth.currentUser) {
                          updateDoc(doc(db, 'users', auth.currentUser.uid), { language: lang.code }).catch(() => {});
                        }
                        setShowLangModal(false);
                      }}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all group ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs' 
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-2xl leading-none">{lang.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 truncate flex items-center justify-between">
                          <span>{lang.nativeName}</span>
                          {isSelected && <Check size={16} className="text-blue-600 shrink-0" />}
                        </div>
                        <div className="text-xs text-slate-400 truncate font-medium">{lang.name}</div>
                      </div>
                    </button>
                  );
                })}
                {filteredLanguages.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                    No matching language found for "{langSearch}"
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const BivaaxHeader = ({ email, initials, onMenuClick, onLogout }: { email: string, initials: string, onMenuClick: () => void, onLogout: () => void }) => {
  const { t } = useTranslation();
  return (
  <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
    <div className="flex items-center gap-4">
      <button onClick={onMenuClick} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all lg:hidden">
        <Menu size={22} className="text-gray-600" />
      </button>
      <div className="hidden lg:block">
         <h1 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">{t('partner_dashboard')}</h1>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-[13px] font-black text-[#1a2233] leading-none mb-1">
          {email.length > 24 ? `${email.substring(0, 6)}***@${email.split('@')[1]}` : email}
        </span>
        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t('verified')}</span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-[#3b66f5] flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-100/50">
        {initials}
      </div>
    </div>
  </header>
  );
};

const BivaaxBalanceCard = ({ 
  availableBalance, 
  heldBalance, 
  onPaymentClick,
  onTransferClick 
}: { 
  availableBalance: number; 
  heldBalance: number; 
  onPaymentClick: () => void;
  onTransferClick?: () => void;
}) => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const getNextPayoutCreditDateStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (8 - day) % 7 || 7;
    const nextMonday = new Date(d);
    nextMonday.setDate(d.getDate() + diff);
    const dayNum = String(nextMonday.getDate()).padStart(2, '0');
    const m = String(nextMonday.getMonth() + 1).padStart(2, '0');
    const y = nextMonday.getFullYear();
    return `${dayNum}.${m}.${y} 12:00 PM`;
  };

  return (
    <div className="bg-[#182238] rounded-2xl p-6 text-white shadow-lg relative border border-[#24314e]">
      <div className="text-xs font-medium text-slate-300 mb-1">
        {t('your_balance')}
      </div>
      <div className="text-[38px] md:text-[44px] font-extrabold text-white tracking-tight tabular-nums leading-tight mb-2">
        ${availableBalance.toFixed(2)}
      </div>

      <button 
        onClick={onPaymentClick}
        className="w-full bg-[#2f66f6] hover:bg-[#2557e0] active:scale-[0.98] transition-all py-3 px-4 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2 shadow-md my-4"
      >
        <CreditCard size={18} />
        <span>{t('payouts')}</span>
      </button>

      {/* Next Payment Row */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>{t('next_payment')}</span>
            <button 
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Info size={14} />
            </button>
          </div>
          <span className="text-[#22c55e] font-semibold">{getNextPayoutDateStr()}</span>
        </div>

        {/* Info Tooltip Bubble */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 bottom-full mb-2 bg-white text-[#1a2238] p-4 rounded-xl shadow-2xl border border-slate-200 z-50 text-xs leading-relaxed font-normal"
            >
              <div className="font-medium text-slate-800 mb-1">
                This is your revenue for the current period. It will be automatically credited on the {getNextPayoutCreditDateStr()}. Please keep in mind that the volume might change due to the trading performance of your client's performance. Sub-partners' program revenue is not taken into account here.
              </div>
              <div className="absolute top-full left-10 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hold Sub-Cards */}
      <div className="space-y-2">
        <div className="bg-[#121929] rounded-xl p-4 border border-[#232f48] flex flex-col justify-center">
          <div className="text-xs text-slate-400 font-medium mb-1">{t('revenue_share_hold')}</div>
          <div className="text-[17px] font-bold text-white tabular-nums">
            {heldBalance > 0 ? `-$${heldBalance.toFixed(2)}` : '$0.00'}
          </div>
        </div>

        <div className="bg-[#121929] rounded-xl p-4 border border-[#232f48] flex flex-col justify-center">
          <div className="text-xs text-slate-400 font-medium mb-1">{t('forex_hold')}</div>
          <div className="text-[17px] font-bold text-white tabular-nums">$0.00</div>
        </div>
      </div>
    </div>
  );
};

const BivaaxStatCard = ({ label, values, icon: Icon, timeRange }: any) => {
  const { t } = useTranslation();
  const displayTimeRange = timeRange || t('this_week');
  return (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 border border-slate-100">
          <Icon size={18} />
        </div>
        <span className="text-base font-bold text-[#1a2238]">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 cursor-pointer">
        {displayTimeRange} <ChevronDown size={12} />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {values.map((v: any, i: number) => (
        <div key={i} className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{v.label}</div>
          <div className="text-[19px] font-bold text-[#1a2238] tracking-tight tabular-nums">{v.val}</div>
        </div>
      ))}
    </div>
  </div>
);
};

const BivaaxLinkCard = ({ 
  revshareLink, 
  turnoverLink, 
  revshareCode, 
  turnoverCode, 
  onCopy 
}: {
  revshareLink: string;
  turnoverLink: string;
  revshareCode?: string;
  turnoverCode?: string;
  onCopy: (url: string, label: string) => void;
}) => {
  const { t } = useTranslation();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (url: string, type: 'revshare' | 'turnover', label: string) => {
    if (!url) return;
    onCopy(url, label);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#1a2238] tracking-tight">
          {t('links_to_attract_traders')}
        </h3>
      </div>

      {/* Revenue Share Link */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-800">
              {t('revenue_share')}
            </span>
            {revshareCode && (
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">
                ID #{revshareCode}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Revenue Share
          </span>
        </div>
        
        <div className="flex items-center gap-2 bg-[#f4f7fa] border border-slate-200 rounded-xl px-3.5 py-2.5 transition-all hover:bg-[#eef2f6]">
          <div className="flex-1 text-xs font-semibold text-slate-700 truncate tracking-tight font-mono select-all">
            {revshareLink || 'Loading link...'}
          </div>
          <button 
            onClick={() => handleCopy(revshareLink, 'revshare', t('revenue_share'))} 
            className={`px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
              copiedType === 'revshare' 
                ? 'bg-emerald-50 text-emerald-600 font-bold text-xs' 
                : 'text-[#2f66f6] hover:bg-blue-50 bg-white border border-slate-200/60 shadow-xs'
            }`}
            title={t('copy_link')}
          >
            {copiedType === 'revshare' ? (
              <>
                <Check size={14} />
                <span className="text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="text-[11px] font-bold hidden sm:inline">{t('copy_link')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Turnover Link */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-800">
              {t('turnover')}
            </span>
            {turnoverCode && (
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100">
                ID #{turnoverCode}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Turnover
          </span>
        </div>
        
        <div className="flex items-center gap-2 bg-[#f4f7fa] border border-slate-200 rounded-xl px-3.5 py-2.5 transition-all hover:bg-[#eef2f6]">
          <div className="flex-1 text-xs font-semibold text-slate-700 truncate tracking-tight font-mono select-all">
            {turnoverLink || 'Loading link...'}
          </div>
          <button 
            onClick={() => handleCopy(turnoverLink, 'turnover', t('turnover'))} 
            className={`px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
              copiedType === 'turnover' 
                ? 'bg-emerald-50 text-emerald-600 font-bold text-xs' 
                : 'text-emerald-600 hover:bg-emerald-50 bg-white border border-slate-200/60 shadow-xs'
            }`}
            title={t('copy_link')}
          >
            {copiedType === 'turnover' ? (
              <>
                <Check size={14} />
                <span className="text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="text-[11px] font-bold hidden sm:inline">{t('copy_link')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const BivaaxProgramCard = ({ title, level, rate, nextLevel, progress, progressText }: any) => {
  const { t } = useTranslation();
  return (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
    <h3 className="text-base font-bold text-[#1a2238] mb-5 tracking-tight">{title}</h3>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-[#f8f9fb] rounded-xl p-4 border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('current_level')}</span>
        <span className="text-[17px] font-bold text-[#1a2238]">{level}</span>
      </div>
      <div className="bg-[#f8f9fb] rounded-xl p-4 border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('rate')}</span>
        <span className="text-[17px] font-bold text-[#1a2238]">{rate}</span>
      </div>
    </div>
    <div className="bg-[#f8f9fb] rounded-2xl p-4 border border-slate-100">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('next_level')}</span>
      <span className="text-[17px] font-bold text-[#1a2238]">{nextLevel}</span>
      <div className="mt-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{progressText}</div>
        <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-200">
          <div 
            className="h-full bg-[#22c55e] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(34,197,94,0.3)]" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[10px] font-bold text-[#22c55e] text-center mt-2.5 uppercase tracking-widest">{Math.floor(progress)} of 30 FTD</div>
      </div>
    </div>
  </div>
);
};
const AffiliateAnalytics = ({ referrals, commissions, affiliateBalance }: any) => {
  const currency = '$';
  const data = [
    { name: 'Directs', value: referrals.length, label: 'Total Referrals', color: '#3b82f6' },
    { name: 'Active', value: referrals.filter((r: any) => (r.tradeVolume || 0) > 0).length, label: 'Live Users', color: '#10b981' },
    { name: 'Locked', value: Number(affiliateBalance.toFixed(2)), label: `Pending ${currency}`, color: '#8b5cf6' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#1a2238]">Performance Index</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Ecosystem revenue & growth metrics</p>
        </div>
      </div>
      
      <div className="h-[280px] md:h-[320px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} 
            />
            <Tooltip 
               cursor={{fill: 'rgba(59, 102, 245, 0.04)'}}
               content={({ active, payload }) => {
                 if (active && payload && payload.length) {
                   const item = payload[0].payload;
                   return (
                     <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{item.label}</p>
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-6 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <p className="text-2xl font-bold text-[#1a2238] leading-none tracking-tight tabular-nums">
                             {item.name === 'Locked' ? `${currency}${item.value}` : item.value}
                          </p>
                       </div>
                     </div>
                   );
                 }
                 return null;
               }}
            />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={54}>
              {data.map((entry, index) => (
                <Cell key={`cell-analytics-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
         {data.map((item, idx) => (
            <div key={`summary-item-${idx}`} className="space-y-1">
               <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.name}</div>
               <div className="text-[18px] font-bold text-[#1a2238] tabular-nums tracking-tight">{item.name === 'Locked' ? `${currency}${item.value}` : item.value}</div>
            </div>
         ))}
      </div>
    </div>
  );
};


const EXCHANGE_RATES: Record<string, number> = {
  '৳': 1.0,      // BDT (Base)
  '$': 0.00833,  // 1/120 (USD)
  '€': 0.00769   // 1/130 (EUR)
};

const getConvertedBalance = (val: number, curr: string) => {
  const rate = EXCHANGE_RATES[curr] || 1.0;
  return val * rate;
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'promo-perks', label: 'Promo Perks', icon: Gift, isNew: true },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'offers', label: 'Offers', icon: Briefcase },
  { id: 'links', label: 'Links', icon: Link },
  { id: 'promo', label: 'Promo', icon: Image },
  { id: 'postbacks', label: 'Postbacks', icon: Undo2 },
  { id: 'payouts', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'partner-bot', label: 'Partner Bot', icon: Bot, isNew: true },
  { id: 'rules', label: 'Rules', icon: ShieldAlert },
  { id: 'support', label: 'Support Desk', icon: Headphones },
];

export default function AffiliatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(authUser || auth.currentUser);

  useEffect(() => {
    if (authUser) {
      setCurrentUser((prev: any) => ({ ...prev, ...authUser }));
    }
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) setCurrentUser((prev: any) => ({ ...prev, ...u, uid: u.uid }));
    });
    return () => unsub();
  }, [authUser]);
  const userCurrency = '$';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'promo-perks' | 'statistics' | 'offers' | 'links' | 'promo' | 'postbacks' | 'payouts' | 'profile' | 'partner-bot' | 'support' | 'support-detail' | 'rules' | 'sub-affiliates'>('dashboard');
  const [subAffiliates, setSubAffiliates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string, name: string, subId: string, landingPage?: string, linkType?: string, isArchived?: boolean, clicks?: number }[]>([]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignSubId, setNewCampaignSubId] = useState('');
  const [newCampaignType, setNewCampaignType] = useState('revshare');
  const [selectedLandingPage, setSelectedLandingPage] = useState('/register');

  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutGateway, setPayoutGateway] = useState('USDT (TRC-20)');
  const [payoutDetails, setPayoutDetails] = useState({
    mobileNumber: '',
    walletAddress: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountName: '',
  });
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [customAffShare, setCustomAffShare] = useState<number | null>(null);
  const [affId, setAffId] = useState<string | number>('');
  const [impressions, setImpressions] = useState(0);

  const [campaignTab, setCampaignTab] = useState<'live' | 'archived'>('live');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalTab, setPaymentModalTab] = useState<'withdraw' | 'transfer' | 'history'>('withdraw');
  const [view, setView] = useState<'default' | 'new_ticket' | 'tickets'>('default');
  const [postbacks, setPostbacks] = useState<any[]>([]);
  const [isAddingPostback, setIsAddingPostback] = useState(false);
  const [showAddPostback, setShowAddPostback] = useState(false);
  const [newPostback, setNewPostback] = useState({ name: '', url: '', event: 'registration', method: 'GET' });
  const [appConfig, setAppConfig] = useState<any>({});

  const referralCode = affId || '';
  const { revshareCode, turnoverCode } = getAffiliatePairCodes(
    referralCode,
    currentUser?.turnoverReferralCode || currentUser?.turnover_referral_code
  );

  const referralLink = revshareCode 
    ? buildTraderReferralLink(revshareCode, { customDomain: appConfig?.mainDomain })
    : '';

  const revshareLink = referralLink;
  const turnoverLink = turnoverCode 
    ? buildTraderReferralLink(turnoverCode, { customDomain: appConfig?.mainDomain })
    : '';

  const addCampaign = async () => {
    if (!currentUser) return;
    if (!newCampaignName || !newCampaignSubId) return toast.error('Enter campaign details');
    
    const cleanSubId = newCampaignSubId.trim().replace(/\s+/g, '_');
    // Check for duplicate subId
    const isDuplicate = campaigns.some(c => c.subId.toLowerCase() === cleanSubId.toLowerCase());
    if (isDuplicate) return toast.error('This Sub-ID already exists!');

    const newCampObj = {
      userId: currentUser.uid,
      name: newCampaignName,
      subId: cleanSubId,
      linkType: newCampaignType,
      landingPage: selectedLandingPage,
      isArchived: false,
      createdAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, 'affiliate_campaigns'), newCampObj);
      setCampaigns(prev => [...prev.filter(c => c.id !== 'default'), { id: docRef.id, ...newCampObj }]);
      setNewCampaignName('');
      setNewCampaignSubId('');
      setNewCampaignType('revshare');
      toast.success('Campaign successfully created and saved!');
    } catch (error: any) {
      console.error("Firestore campaign creation failed, using local fallback:", error);
      const fakeId = 'camp_' + Date.now();
      setCampaigns(prev => [...prev.filter(c => c.id !== 'default'), { id: fakeId, ...newCampObj }]);
      setNewCampaignName('');
      setNewCampaignSubId('');
      setNewCampaignType('revshare');
      toast.success('Campaign created successfully!');
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!currentUser) return;
    try {
      if (!id.startsWith('camp_')) {
        await deleteDoc(doc(db, 'affiliate_campaigns', id));
      }
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('Campaign removed');
    } catch (error: any) {
      console.error(error);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('Campaign removed');
    }
  };

  const getCampaignLink = (subId: string, landingPage: string = '/register', linkType: string = 'revshare') => {
    const codeToUse = linkType === 'turnover' && turnoverCode ? turnoverCode : (revshareCode || referralCode);
    if (!codeToUse) return 'Loading...';
    return buildTraderReferralLink(codeToUse, {
      subId,
      landingPage,
      customDomain: appConfig?.mainDomain
    });
  };
  const [balance, setBalance] = useState(0.00);
  const [affiliateBalance, setAffiliateBalance] = useState(0.00);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState<{
    availableBalance: number;
    holdBalance: number;
    totalAffiliateEarnings: number;
    totalReferrals: number;
    ftdCount: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);

  // Filtered referrals
  const filteredReferrals = referrals.filter(r => 
    (r.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.uid || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.affiliateId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRegs = referrals.length;
  const totalFTDs = referrals.filter(r => (parseFloat(r.totalDeposits ?? r.realBalance ?? 0)) > 0).length;
  
  // Dynamic Level Calculation based on user requirements
  let currentLevel = 1;
  if (totalRegs >= 200 && totalFTDs >= 200) currentLevel = 5;
  else if (totalRegs >= 200 && totalFTDs >= 100) currentLevel = 4;
  else if (totalRegs >= 100 && totalFTDs >= 40) currentLevel = 3;
  else if (totalRegs >= 50 && totalFTDs >= 25) currentLevel = 2;
  else if (totalRegs >= 1 && totalFTDs >= 5) currentLevel = 1;
  else currentLevel = 1; // Default starting level is 1 (40% RevShare)

  const getCommissionRate = (level: number, type: 'revshare' | 'turnover' = 'revshare') => {
    const rates = {
      revshare: { 1: 40, 2: 50, 3: 60, 4: 70, 5: 80 },
      turnover: { 1: 2, 2: 2.5, 3: 3, 4: 4, 5: 5 }
    };
    return (rates as any)[type]?.[level] || (type === 'revshare' ? 40 : 2);
  };

  const [showCalculator, setShowCalculator] = useState(false);
  const [calcValues, setCalcValues] = useState({ referrals: 10, volumePerRef: 1000 });

  const [promoMaterials, setPromoMaterials] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [ticketReply, setTicketReply] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  // Partner Bot State
  const [botMessages, setBotMessages] = useState<{sender: 'bot' | 'user', text: string, time: number}[]>([
    { 
      sender: 'bot', 
      text: `👋 Welcome to your Bivaax Partner Assistant!\n\nI can verify whether any trader registered under your referral link and provide real-time network intelligence.\n\n🔍 Trader UID Verification:\nPaste any Trader's 9-digit Profile UID (e.g. 114829103) or type /check <UID> to verify if their account was opened with your referral link.\n\n⚡ Quick Commands:\n• /check <UID> — Verify trader registration & FTD deposit\n• /stats — Network performance, clicks & earnings\n• /traders — List your referred traders\n• /link — Your official referral links\n• /balance — Check wallet balance & hold\n• /help — View all commands`, 
      time: Date.now() 
    }
  ]);
  const [botInput, setBotInput] = useState('');
  const [quickUidInput, setQuickUidInput] = useState('');
  const botEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (botEndRef.current) {
       botEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [botMessages]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Set immediate affId from cache/context so link never flashes
    const cachedCode = currentUser.referralCode || currentUser.referral_code || currentUser.affiliateId || currentUser.affiliate_id || localStorage.getItem('bivaax_aff_code_' + currentUser.uid);
    if (cachedCode) {
      setAffId(String(cachedCode));
    } else {
      import('../lib/affiliate').then(({ ensureUserAffiliateId }) => {
        ensureUserAffiliateId(currentUser.uid, currentUser).then(code => {
          if (code) setAffId(code);
        });
      });
    }

    // Listen for current user balance
    const userUnsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
       if (snap.exists()) {
          const userData = snap.data();
          setBalance(userData.balance || 0);
          setAffiliateBalance(userData.affiliateBalance || 0);
          setCustomAffShare(userData.customAffiliateShare || null);
          
          const cachedLocal = localStorage.getItem('bivaax_aff_code_' + currentUser.uid);
          const permCode = userData.referralCode || userData.referral_code || userData.affiliateId || userData.affiliate_id || currentUser?.referralCode || currentUser?.affiliateId || cachedLocal;
          if (permCode) {
             const strPerm = String(permCode);
             setAffId(strPerm);
             try { localStorage.setItem('bivaax_aff_code_' + currentUser.uid, strPerm); } catch(_) {}
             if (!userData.referralCode || !userData.affiliateId) {
                updateDoc(doc(db, 'users', currentUser.uid), { 
                  referralCode: strPerm, 
                  affiliateId: permCode 
                }).catch(e => console.error("Failed sync permanent referral code", e));
             }
          } else {
             // Permanent numeric ID generation
             import('../lib/affiliate').then(async ({ ensureUserAffiliateId }) => {
                 try {
                     const permanentCode = await ensureUserAffiliateId(currentUser.uid, userData);
                     if (permanentCode) setAffId(permanentCode);
                 } catch (e) {
                     console.error("Failed to retroactively give affiliate ID", e);
                 }
             });
          }
          setImpressions(userData.impressions || 0);
       }
    }, (error) => {
       if (auth.currentUser) {
         handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
       }
    });

    // Comprehensive real referral tracking across Firestore and SQLite
    const activeReferralUnsubs: (() => void)[] = [];
    const referralMap = new Map<string, any>();

    const updateCombinedReferrals = () => {
       const list = Array.from(referralMap.values());
       list.sort((a: any, b: any) => {
          const tA = (a.createdAt && typeof a.createdAt.toDate === 'function') ? a.createdAt.toDate().getTime() : (a.createdAt || a.created_at || 0);
          const tB = (b.createdAt && typeof b.createdAt.toDate === 'function') ? b.createdAt.toDate().getTime() : (b.createdAt || b.created_at || 0);
          return tB - tA;
       });
       setReferrals(list);
       setLoadingStats(false);
       
       const activeSubAffs = list.filter((r: any) => (r.referralCount || r.referral_count || 0) > 0);
       setSubAffiliates(activeSubAffs);
    };

    // 1. Fetch enriched referred traders list & summary from Backend API
    const loadEnrichedAffiliateData = async () => {
      try {
        const [tradersRes, summaryRes, commsRes] = await Promise.all([
          fetch(`/api/affiliate/referred-traders?referrerUid=${encodeURIComponent(currentUser.uid)}`),
          fetch(`/api/affiliate/summary?uid=${encodeURIComponent(currentUser.uid)}`),
          fetch(`/api/affiliate/commissions?referrerUid=${encodeURIComponent(currentUser.uid)}`)
        ]);

        if (tradersRes.ok) {
          const list = await tradersRes.json();
          if (Array.isArray(list)) {
            list.forEach((item: any) => {
              const k = item.uid || item.id || item.email;
              if (k && k !== currentUser.uid) {
                referralMap.set(k, { ...referralMap.get(k), ...item });
              }
            });
            updateCombinedReferrals();
          }
        }

        if (summaryRes.ok) {
          const sum = await summaryRes.json();
          setSummaryStats(sum);
          if (typeof sum.availableBalance === 'number') {
            setAffiliateBalance(sum.availableBalance);
          }
        }

        if (commsRes.ok) {
          const commsList = await commsRes.json();
          if (Array.isArray(commsList) && commsList.length > 0) {
            setCommissions(commsList);
          }
        }
      } catch (e) {
        console.warn("Backend enriched affiliate fetch error:", e);
      }
    };
    loadEnrichedAffiliateData();

    // 2. Query Firestore by referredByUid
    const q1 = query(collection(db, 'users'), where('referredByUid', '==', currentUser.uid), limit(100));
    activeReferralUnsubs.push(onSnapshot(q1, (snap) => {
       snap.docs.forEach(d => {
          if (d.id !== currentUser.uid) {
             referralMap.set(d.id, { id: d.id, ...d.data() });
          }
       });
       updateCombinedReferrals();
    }));

    // 3. Query Firestore by referredBy
    const q2 = query(collection(db, 'users'), where('referredBy', '==', currentUser.uid), limit(100));
    activeReferralUnsubs.push(onSnapshot(q2, (snap) => {
       snap.docs.forEach(d => {
          if (d.id !== currentUser.uid) {
             referralMap.set(d.id, { id: d.id, ...d.data() });
          }
       });
       updateCombinedReferrals();
    }));

    // 4. Query Firestore by affId if available
    const activeAffId = affId || currentUser?.referralCode || currentUser?.affiliateId;
    if (activeAffId) {
       const strAff = String(activeAffId);
       const q3 = query(collection(db, 'users'), where('referredBy', '==', strAff), limit(100));
       activeReferralUnsubs.push(onSnapshot(q3, (snap) => {
          snap.docs.forEach(d => { if (d.id !== currentUser.uid) { referralMap.set(d.id, { id: d.id, ...d.data() }); } });
          updateCombinedReferrals();
       }));

       const q4 = query(collection(db, 'users'), where('referredByUid', '==', strAff), limit(100));
       activeReferralUnsubs.push(onSnapshot(q4, (snap) => {
          snap.docs.forEach(d => { if (d.id !== currentUser.uid) { referralMap.set(d.id, { id: d.id, ...d.data() }); } });
          updateCombinedReferrals();
       }));

       const q5 = query(collection(db, 'users'), where('referredByCode', '==', strAff), limit(100));
       activeReferralUnsubs.push(onSnapshot(q5, (snap) => {
          snap.docs.forEach(d => { if (d.id !== currentUser.uid) { referralMap.set(d.id, { id: d.id, ...d.data() }); } });
          updateCombinedReferrals();
       }));
    }

    const unsubConfig = onSnapshot(doc(db, 'app_config', 'settings'), (docSnap) => {
        if (docSnap.exists()) setAppConfig(docSnap.data());
    }, (error) => {
       if (auth.currentUser) {
         handleFirestoreError(error, OperationType.GET, 'app_config/settings');
       }
    });

    const unsubPromo = onSnapshot(collection(db, 'promoMaterials'), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length === 0) {
           setPromoMaterials([
              { id: 'm1', label: 'Global Leader Banner', size: '1080 x 1080', color: 'bg-indigo-600' },
              { id: 'm2', label: 'Pro Trading Hub', size: '1200 x 628', color: 'bg-emerald-600' },
              { id: 'm3', label: 'Trust & Security', size: '728 x 90', color: 'bg-rose-600' }
           ]);
        } else {
           setPromoMaterials(list);
        }
    }, (error) => {
       if (auth.currentUser) {
         handleFirestoreError(error, OperationType.GET, 'promoMaterials');
       }
    });

    const unsubCampaigns = onSnapshot(
      query(collection(db, 'affiliate_campaigns'), where('userId', '==', currentUser.uid)),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        if (list.length === 0) {
          setCampaigns([{ id: 'default', name: 'Main Campaign', subId: 'default' }]);
        } else {
          setCampaigns(list);
        }
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.GET, 'affiliate_campaigns');
        }
      }
    );

    const unsubPostbacks = onSnapshot(
      query(collection(db, 'affiliate_postbacks'), where('userId', '==', currentUser.uid)),
      (snap) => {
        setPostbacks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.GET, 'affiliate_postbacks');
        }
      }
    );

    const unsubPayouts = onSnapshot(
      query(collection(db, 'affiliate_payouts'), where('userId', '==', currentUser.uid)),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const tA = (a.createdAt && typeof a.createdAt.toDate === 'function') ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
          const tB = (b.createdAt && typeof b.createdAt.toDate === 'function') ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
          return tB - tA;
        });
        setPayoutRequests(list);
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.GET, 'affiliate_payouts');
        }
      }
    );

    const unsubTickets = onSnapshot(query(collection(db, 'tickets'), where('userId', '==', currentUser.uid)), (snap) => {
      const tickets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      tickets.sort((a: any, b: any) => {
        const tA = (a.updatedAt && typeof a.updatedAt.toDate === 'function') ? a.updatedAt.toDate().getTime() : (a.updatedAt || 0);
        const tB = (b.updatedAt && typeof b.updatedAt.toDate === 'function') ? b.updatedAt.toDate().getTime() : (b.updatedAt || 0);
        return tB - tA;
      });
      setUserTickets(tickets);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, 'tickets');
      }
    });

    const unsubCommissions = onSnapshot(
      query(collection(db, 'affiliate_commissions'), where('referrerUid', '==', currentUser.uid)),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const tA = (a.createdAt && typeof a.createdAt.toDate === 'function') ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
          const tB = (b.createdAt && typeof b.createdAt.toDate === 'function') ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
          return tB - tA;
        });
        setCommissions(list.slice(0, 50)); // Last 50 commissions
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.GET, 'affiliate_commissions');
        }
      }
    );

    return () => {
       userUnsub();
       activeReferralUnsubs.forEach(unsub => unsub());
       unsubConfig();
       unsubPromo();
       unsubCampaigns();
       unsubPostbacks();
       unsubPayouts();
       unsubTickets();
       unsubCommissions();
    };
  }, [currentUser]);

  useEffect(() => {
    if (selectedTicket) {
      const unsub = onSnapshot(query(collection(db, 'tickets', selectedTicket.id, 'messages'), orderBy('createdAt', 'asc')), (snap) => {
        setTicketMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [selectedTicket]);

  const getAIReply = async (ticketId: string, message: string) => {
    if (selectedTicket?.aiDisabled) return;
    setIsBotTyping(true);
    try {
      const res = await fetch('/api/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      let aiReply = "I'm sorry, I am having trouble processing your request. Please wait for a human representative.";
      if (res.ok) {
        const data = await res.json();
        if (data.reply) aiReply = data.reply;
      } else {
        return;
      }
      
      const lowerMsg = message.toLowerCase();
      const needsEscalation = lowerMsg.includes('agent') || lowerMsg.includes('representative');

      await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
        senderId: 'ai-bot',
        senderName: 'Support Bot',
        senderType: 'support',
        text: aiReply,
        createdAt: Date.now()
      });

      await updateDoc(doc(db, 'tickets', ticketId), {
        lastMessage: aiReply,
        updatedAt: Date.now(),
        ...(needsEscalation ? { aiDisabled: true, status: 'Pending' } : {})
      });
    } catch (e) {
      console.error("AI reply failed:", e);
    } finally {
      setIsBotTyping(false);
    }
  };

  const createSupportTicket = async (subject: string, message: string) => {
    if (!currentUser) {
      toast.error("Please log in to contact support");
      return;
    }
    try {
      const ticketRef = await addDoc(collection(db, 'tickets'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || "Partner",
        subject: subject,
        status: 'Open',
        priority: 'medium',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: 'affiliate'
      });

      const ticketId = ticketRef.id;
      await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || "Partner",
        senderType: 'user',
        text: message,
        createdAt: Date.now()
      });

      toast.success("Support ticket created!");
      getAIReply(ticketId, message);
      return ticketId;
    } catch (e) {
      console.error("Error creating ticket:", e);
      toast.error("Failed to create ticket");
    }
  };

  const sendTicketMessage = async () => {
    if (!selectedTicket || !ticketReply.trim() || !currentUser) return;
    const tid = selectedTicket.id;
    try {
      await addDoc(collection(db, 'tickets', tid, 'messages'), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || "Partner",
        senderType: 'user',
        text: ticketReply,
        createdAt: Date.now()
      });
      
      await updateDoc(doc(db, 'tickets', tid), {
        lastMessage: ticketReply,
        updatedAt: Date.now()
      });

      const msg = ticketReply;
      setTicketReply("");
      getAIReply(tid, msg);
    } catch (e) {
      console.error("Error sending message:", e);
      toast.error("Failed to send message");
    }
  };

  const now = Date.now();
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
  
  const availableCommissions = commissions.filter(c => {
     if (c.status === 'settled') return true;
     const commissionDate = (c.createdAt && typeof c.createdAt.toDate === 'function') ? c.createdAt.toDate().getTime() : (c.createdAt || 0);
     const holdUntil = Number(c.holdUntil || c.hold_until || (commissionDate + oneWeekInMs));
     return now >= holdUntil;
  });
  
  const heldCommissions = commissions.filter(c => {
     if (c.status === 'settled') return false;
     const commissionDate = (c.createdAt && typeof c.createdAt.toDate === 'function') ? c.createdAt.toDate().getTime() : (c.createdAt || 0);
     const holdUntil = Number(c.holdUntil || c.hold_until || (commissionDate + oneWeekInMs));
     return now < holdUntil;
  });

  const availableBalance = summaryStats?.availableBalance !== undefined 
    ? summaryStats.availableBalance 
    : (affiliateBalance > 0 ? affiliateBalance : availableCommissions.reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0));
    
  const heldBalance = summaryStats?.holdBalance !== undefined
    ? summaryStats.holdBalance
    : heldCommissions.reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast.success('Affiliate link copied!', {
      style: { border: '1px solid #10b981', padding: '16px', color: '#10b981', background: '#fff' }
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTransferEarnings = async () => {
    if (!currentUser) return;
    if (availableBalance < 1) {
      toast.error(`Minimum transfer amount is $1.00 (USDT)`);
      return;
    }
    const amountToTransfer = availableBalance;
    try {
      const res = await fetch('/api/affiliate/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ amount: amountToTransfer })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          affiliateBalance: increment(-amountToTransfer),
          balance: increment(amountToTransfer)
        });
      }

      toast.success(`Successfully transferred $${getConvertedBalance(amountToTransfer, '$').toFixed(2)} to Main Live Balance!`);
      setAffiliateBalance(prev => Math.max(0, prev - amountToTransfer));
      if (summaryStats) {
        setSummaryStats({ ...summaryStats, availableBalance: 0 });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Transfer failed. Please try again or contact support.');
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const amountNum = parseFloat(payoutAmount); // Input in USDT
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    const amountInBase = amountNum / EXCHANGE_RATES['$']; // Convert USDT to BDT base

    if (amountInBase > availableBalance) {
      toast.error(`Insufficient available balance ($${availableBalance.toFixed(2)} available)`);
      return;
    }

    const minAmountUSDT = 10;
    if (amountNum < minAmountUSDT) {
      toast.error(`Minimum payout withdrawal amount is $${minAmountUSDT.toFixed(2)}`);
      return;
    }

    let detailsStr = '';
    if (payoutGateway.includes('USDT') || payoutGateway.includes('Binance')) {
      if (!payoutDetails.walletAddress) {
        toast.error('Please enter your Crypto Wallet Address or Binance Pay ID');
        return;
      }
      detailsStr = `${payoutGateway}: ${payoutDetails.walletAddress}`;
    } else if (payoutGateway === 'bKash' || payoutGateway === 'Nagad' || payoutGateway === 'Rocket') {
      if (!payoutDetails.mobileNumber) {
        toast.error(`Please enter your ${payoutGateway} mobile number`);
        return;
      }
      detailsStr = `${payoutGateway} (${payoutDetails.accountName || 'Personal'}): ${payoutDetails.mobileNumber}`;
    } else {
      if (!payoutDetails.accountNumber || !payoutDetails.bankName) {
        toast.error('Please enter your Bank Name and Account Number');
        return;
      }
      detailsStr = `Bank: ${payoutDetails.bankName}, Branch: ${payoutDetails.branchName || 'Main'}, A/C: ${payoutDetails.accountNumber}, Name: ${payoutDetails.accountName}`;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await fetch('/api/affiliate/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          amount: amountNum,
          gateway: payoutGateway,
          details: payoutDetails
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) throw new Error('User data profile not found');

        const liveAffBalance = userDoc.data().affiliateBalance || 0;
        if (amountNum > liveAffBalance) {
          toast.error('Insufficient affiliate balance (real-time check failed)');
          setIsSubmittingPayout(false);
          return;
        }

        await addDoc(collection(db, 'affiliate_payouts'), {
          userId: currentUser.uid,
          email: currentUser.email || 'partner@Bivaax.local',
          amount: amountNum,
          currency: '$',
          gateway: payoutGateway,
          details: detailsStr,
          status: 'Pending',
          createdAt: new Date(),
          processedAt: null,
          rejectReason: null
        });

        await updateDoc(userRef, {
          affiliateBalance: increment(-amountInBase)
        });
      }

      toast.success('Your payout request has been queued! Processing normally takes under 2 hours.', {
        duration: 5000
      });
      setPayoutAmount('');
      setPayoutDetails({
        mobileNumber: '',
        walletAddress: '',
        bankName: '',
        branchName: '',
        accountNumber: '',
        accountName: '',
      });
      setAffiliateBalance(prev => Math.max(0, prev - amountInBase));
      if (summaryStats) {
        setSummaryStats({ ...summaryStats, availableBalance: Math.max(0, summaryStats.availableBalance - amountNum) });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to dispatch payout request: ' + err.message);
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleAddPostback = async () => {
    if (!currentUser) return;
    if (!newPostback.name || !newPostback.url) {
      toast.error('Name and URL are required for a postback.');
      return;
    }
    
    try {
      setIsAddingPostback(true);
      await addDoc(collection(db, 'affiliate_postbacks'), {
         userId: currentUser.uid,
         name: newPostback.name,
         url: newPostback.url,
         event: newPostback.event,
         method: newPostback.method,
         createdAt: new Date(),
         status: 'active'
      });
      toast.success('Postback created successfully!');
      setNewPostback({ name: '', url: '', event: 'registration', method: 'GET' });
      setShowAddPostback(false);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to create postback: ' + e.message);
    } finally {
      setIsAddingPostback(false);
    }
  };

  const handleDeletePostback = async (id: string) => {
    try {
       await deleteDoc(doc(db, 'affiliate_postbacks', id));
       toast.success('Postback deleted.');
    } catch (e: any) {
       console.error(e);
       toast.error('Failed to delete postback.');
    }
  };

  const stats = {
     leads: referrals.length,
     conversions: referrals.filter(r => (r.balance || 0) > 0).length,
     totalVolume: referrals.reduce((acc, r) => acc + (r.tradeVolume || 0), 0),
     networkSize: referrals.reduce((acc, r) => acc + (r.referralCount || 0), 0)
  };

  const getTier = () => {
    const count = stats.leads;
    if (count >= 201) return { name: 'Elite Master', share: appConfig.affiliate_share_elite || 80, color: 'text-amber-500', bg: 'bg-amber-500/10', next: null, icon: Trophy };
    if (count >= 51) return { name: 'VIP Partner', share: appConfig.affiliate_share_vip || 70, color: 'text-indigo-500', bg: 'bg-indigo-500/10', next: 201, icon: Star };
    if (count >= 11) return { name: 'Pro Partner', share: appConfig.affiliate_share_pro || 60, color: 'text-emerald-500', bg: 'bg-emerald-500/10', next: 51, icon: Zap };
    return { name: 'Starter', share: appConfig.affiliate_share_starter || 50, color: 'text-rose-500', bg: 'bg-rose-500/10', next: 11, icon: Activity };
  };

  const currentTier = getTier();
  const progressToNext = currentTier.next ? (stats.leads / currentTier.next) * 100 : 100;

  const executeTraderVerification = async (targetUid: string) => {
    const cleanUid = targetUid.trim();
    if (!cleanUid) return;

    setIsBotTyping(true);

    try {
      // 1. Check local referrals list first (instant response)
      const localMatch = referrals.find(r => {
        const pId = String(r.numericId || getNumericId(r.uid || r.id) || '');
        const rUid = String(r.uid || r.id || '').toLowerCase();
        const rEmail = String(r.email || '').toLowerCase();
        return pId === cleanUid || rUid === cleanUid.toLowerCase() || rEmail === cleanUid.toLowerCase();
      });

      if (localMatch) {
        const pId = localMatch.numericId || getNumericId(localMatch.uid || localMatch.id);
        const email = localMatch.email || '';
        const maskedEmail = email.includes('@')
          ? `${email.split('@')[0].substring(0, 2)}***@${email.split('@')[1]}`
          : 'Anonymous';
        const d = (localMatch.createdAt && typeof localMatch.createdAt.toDate === 'function') 
          ? localMatch.createdAt.toDate() 
          : new Date(localMatch.createdAt || localMatch.created_at || Date.now());
        const regDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const depositAmt = parseFloat(localMatch.totalDeposits || localMatch.realBalance || 0);
        const vol = parseFloat(localMatch.tradeVolume || localMatch.totalLiveVolume || 0);
        const isFtd = depositAmt > 0;

        const reply = `✅ YES — VERIFIED PARTNER TRADER\n━━━━━━━━━━━━━━━━━━━━━━━━\n🎉 Great news! This trader is registered under your referral link.\n\n• Profile UID: ${pId}\n• Email: ${maskedEmail}\n• Name: ${localMatch.displayName || localMatch.name || 'Trader'}\n• Registered: ${regDate}\n• First Deposit (FTD): ${isFtd ? `✅ Yes ($${depositAmt.toFixed(2)})` : '⏳ No deposit yet'}\n• Trade Volume: $${vol.toFixed(2)}\n• Sub-ID: ${localMatch.referralSubId || localMatch.referredSub || 'Main Link'}\n• Status: Active Referral ✅\n━━━━━━━━━━━━━━━━━━━━━━━━\n✨ Eligible for your VIP Signals Group & Promo Perks!`;
        
        setIsBotTyping(false);
        setBotMessages(prev => [...prev, { sender: 'bot', text: reply, time: Date.now() }]);
        return;
      }

      // 2. Query backend to check entire system (SQLite + Firestore)
      const res = await fetch('/api/affiliate/verify-trader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateUid: currentUser?.uid,
          affiliateCode: affId,
          query: cleanUid
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.found) {
          const t = data.trader;
          const regDate = new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

          if (data.isReferredByMe) {
            const reply = `✅ YES — VERIFIED PARTNER TRADER\n━━━━━━━━━━━━━━━━━━━━━━━━\n🎉 Great news! This trader is registered under your referral link.\n\n• Profile UID: ${t.numericId}\n• Email: ${t.maskedEmail}\n• Name: ${t.displayName}\n• Registered: ${regDate}\n• First Deposit (FTD): ${t.hasDeposited ? `✅ Yes ($${t.totalDeposits.toFixed(2)})` : '⏳ No deposit yet'}\n• Trade Volume: $${t.tradingVolume.toFixed(2)}\n• Sub-ID: ${t.subId || 'Main Link'}\n• KYC: ${t.kycStatus === 'verified' || t.kycStatus === 'approved' ? '✅ Verified' : '⏳ Unverified'}\n• Status: Active Referral ✅\n━━━━━━━━━━━━━━━━━━━━━━━━\n✨ Eligible for your VIP Signals Group & Promo Perks!`;
            setIsBotTyping(false);
            setBotMessages(prev => [...prev, { sender: 'bot', text: reply, time: Date.now() }]);
            return;
          } else {
            const reply = `❌ NO — NOT UNDER YOUR LINK\n━━━━━━━━━━━━━━━━━━━━━━━━\n⚠️ Trader Profile UID: "${cleanUid}" exists on Bivaax Trade, but is NOT registered under your affiliate referral link.\n\n• Profile UID: ${t.numericId}\n• Registered: ${regDate}\n• Attribution: Registered direct or under another partner\n━━━━━━━━━━━━━━━━━━━━━━━━\n❌ This trader did NOT use your referral link and cannot be verified for your VIP perks.`;
            setIsBotTyping(false);
            setBotMessages(prev => [...prev, { sender: 'bot', text: reply, time: Date.now() }]);
            return;
          }
        }
      }

      // 3. Not found anywhere
      const notFoundReply = `❌ NOT FOUND — NO ACCOUNT FOUND\n━━━━━━━━━━━━━━━━━━━━━━━━\n⚠️ No trader account was found with Profile UID / ID: "${cleanUid}".\n\n💡 Tip: Please ensure the trader copied their exact 9-digit Profile ID from their Bivaax profile page (under ID: XXXXXXXXX).`;
      setIsBotTyping(false);
      setBotMessages(prev => [...prev, { sender: 'bot', text: notFoundReply, time: Date.now() }]);

    } catch (err: any) {
      console.error("UID verification error:", err);
      setIsBotTyping(false);
      setBotMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `⚠️ Verification check encountered an error. Please try again in a moment.`, 
        time: Date.now() 
      }]);
    }
  };

  const handleBotSubmit = (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = directText || botInput;
    if (!textToSend.trim()) return;

    const userText = textToSend.trim();
    const newMsgs: {sender: 'bot' | 'user', text: string, time: number}[] = [
      ...botMessages, 
      { sender: 'user', text: userText, time: Date.now() }
    ];
    setBotMessages(newMsgs);
    setBotInput('');
    
    const lower = userText.toLowerCase();

    // Check if it's signal request
    if (lower.includes('/signals') || lower.includes('/signal') || lower === 'signal' || lower === 'signals') {
      setIsBotTyping(true);
      setTimeout(() => {
        setIsBotTyping(false);
        setBotMessages(prev => [...prev, {
          sender: 'bot',
          text: `⚠️ Signal Generation Disabled\n━━━━━━━━━━━━━━━━━━━━━━━━\nSignal generation has been removed from this Partner Bot. This assistant is exclusively dedicated to:\n\n• Trader UID Registration Verification\n• Affiliate Network Analytics & Stats\n• Commission & Balance Tracking\n• Referral Link Management\n\nTry sending any Trader UID or type /stats.`,
          time: Date.now()
        }]);
      }, 400);
      return;
    }

    // Check if it's a UID verification
    let uidQuery = '';
    if (lower.startsWith('/check') || lower.startsWith('/verify')) {
      const parts = userText.split(/\s+/);
      if (parts.length > 1) {
        uidQuery = parts.slice(1).join(' ').trim();
      } else {
        setIsBotTyping(true);
        setTimeout(() => {
          setIsBotTyping(false);
          setBotMessages(prev => [...prev, {
            sender: 'bot',
            text: `🔍 UID Verification:\nPlease provide the trader's 9-digit Profile UID to check.\n\nExample:\n• /check 114829103\n• Or simply send: 114829103\n\n(Traders find their UID on the Profile page under "ID: XXXXXXXXX")`,
            time: Date.now()
          }]);
        }, 300);
        return;
      }
    } else if (/^\d{4,14}$/.test(userText.replace(/\s+/g, ''))) {
      uidQuery = userText.replace(/\s+/g, '');
    } else if (/^uid[:\s]+(\S+)/i.test(userText)) {
      const match = userText.match(/^uid[:\s]+(\S+)/i);
      if (match && match[1]) uidQuery = match[1];
    } else if (lower.startsWith('check ') || lower.startsWith('verify ')) {
      uidQuery = userText.substring(userText.indexOf(' ') + 1).trim();
    }

    if (uidQuery) {
      executeTraderVerification(uidQuery);
      return;
    }

    // Other Commands
    setIsBotTyping(true);
    setTimeout(() => {
      let reply = "";
      if (lower.includes('/stats') || lower === 'stats') {
        const leadCount = referrals.length;
        const ftdCount = referrals.filter(r => (parseFloat(r.totalDeposits ?? r.realBalance ?? 0)) > 0).length;
        const totalDep = referrals.reduce((sum, r) => sum + (parseFloat(r.totalDeposits ?? 0)), 0);
        const totalVol = referrals.reduce((sum, r) => sum + (parseFloat(r.tradeVolume ?? r.totalLiveVolume ?? 0)), 0);

        reply = `📊 YOUR PARTNER PERFORMANCE INDEX\n━━━━━━━━━━━━━━━━━━━━━━━━\n• Impressions / Clicks: ${impressions}\n• Total Traders Registered: ${leadCount}\n• First Time Deposits (FTD): ${ftdCount}\n• Active Trading Traders: ${referrals.filter(r => (r.tradeVolume || 0) > 0).length}\n• Total Network Deposits: $${totalDep.toFixed(2)}\n• Total Network Turnover: $${totalVol.toFixed(2)}\n• Available Balance: $${affiliateBalance.toFixed(2)}\n• 7-Day Hold: $${heldBalance.toFixed(2)}\n• Current Tier: ${currentTier.name} (${currentTier.share}% RevShare)\n━━━━━━━━━━━━━━━━━━━━━━━━\nType /traders to view trader details or /balance for payout info.`;
      } else if (lower.includes('/traders') || lower === 'traders') {
        if (referrals.length === 0) {
          reply = `👥 YOUR REFERRED TRADERS\n━━━━━━━━━━━━━━━━━━━━━━━━\nYou do not have any registered traders under your link yet.\nShare your link using /link to start attracting traders!`;
        } else {
          const listStr = referrals.slice(0, 6).map((r, i) => {
            const pId = r.numericId || getNumericId(r.uid || r.id);
            const rawEmail = r.email || '';
            const masked = rawEmail.includes('@') 
              ? `${rawEmail.split('@')[0].substring(0, 2)}***@${rawEmail.split('@')[1]}` 
              : 'Anonymous';
            const dep = parseFloat(r.totalDeposits || 0);
            const isFtd = dep > 0 ? `✅ $${dep.toFixed(2)}` : '⏳ No FTD';
            return `${i + 1}. UID: ${pId} | ${masked} | FTD: ${isFtd}`;
          }).join('\n');

          reply = `👥 REFERRED TRADERS (${referrals.length} Total)\n━━━━━━━━━━━━━━━━━━━━━━━━\n${listStr}\n${referrals.length > 6 ? `\n...and ${referrals.length - 6} more traders.` : ''}\n━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Send any Trader UID to check their complete verification status!`;
        }
      } else if (lower.includes('/link') || lower === 'link') {
        reply = `🔗 YOUR OFFICIAL REFERRAL LINKS\n━━━━━━━━━━━━━━━━━━━━━━━━\n• Main Landing Page:\n${referralLink}\n\n• Direct Trading Terminal:\n${window.location.origin}/trade?ref=${affId || currentUser?.uid}\n\n• Direct Registration:\n${window.location.origin}/register?ref=${affId || currentUser?.uid}\n\n• Your Referral Code:\n${affId || currentUser?.uid}\n━━━━━━━━━━━━━━━━━━━━━━━━\nTraders registering with this code will automatically appear in your network!`;
      } else if (lower.includes('/balance') || lower.includes('/payout') || lower === 'balance' || lower === 'payout') {
        const nextDate = getNextPayoutDateStr();
        reply = `💰 BALANCE & SETTLEMENT STATUS\n━━━━━━━━━━━━━━━━━━━━━━━━\n• Available to Withdraw: $${affiliateBalance.toFixed(2)}\n• 7-Day Security Hold: $${heldBalance.toFixed(2)}\n• Total Earned to Date: $${(affiliateBalance + (summaryStats?.totalAffiliateEarnings || 0)).toFixed(2)}\n• Minimum Payout: $10.00\n• Next Scheduled Settlement: ${nextDate}\n━━━━━━━━━━━━━━━━━━━━━━━━\nUse the "Payment" button on the dashboard to request instant withdrawal.`;
      } else if (lower.includes('/help') || lower === 'help') {
        reply = `🤖 BIVAAX PARTNER BOT COMMANDS\n━━━━━━━━━━━━━━━━━━━━━━━━\n🔍 UID Verification:\n• Send any 9-digit Profile UID (e.g. 114829103)\n• Or type: /check <UID>\n\n📊 Performance & Network:\n• /stats — Detailed clicks, registrations, FTDs & profits\n• /traders — Top referred traders list\n• /link — Your referral links & partner code\n• /balance — Check wallet balance & hold maturation\n• /rates — View commission tiers (40% - 80%)\n• /help — Show this commands manual\n━━━━━━━━━━━━━━━━━━━━━━━━`;
      } else if (lower.includes('/rates') || lower === 'rates') {
        reply = `🏆 COMMISSION TIERS & REVSHARE\n━━━━━━━━━━━━━━━━━━━━━━━━\n• Starter: 50% RevShare (1 - 10 traders)\n• Pro Partner: 60% RevShare (11 - 50 traders)\n• VIP Partner: 70% RevShare (51 - 200 traders)\n• Elite Master: 80% RevShare (201+ traders)\n━━━━━━━━━━━━━━━━━━━━━━━━\nCurrent Status: ${currentTier.name} (${currentTier.share}% RevShare)`;
      } else {
        reply = `I didn't recognize that command.\n\n💡 Try:\n• Send any 9-digit UID (e.g. 114829103) to verify trader\n• /check <UID> — Verify trader registration\n• /stats — Performance stats\n• /traders — Referred traders list\n• /link — Your referral links\n• /balance — Check balance & payout\n• /help — Full commands manual`;
      }

      setIsBotTyping(false);
      setBotMessages(prev => [...prev, { sender: 'bot', text: reply, time: Date.now() }]);
    }, 450);
  };

  const handleQuickUidCheck = () => {
    if (!quickUidInput.trim()) return;
    const q = quickUidInput.trim();
    setQuickUidInput('');
    handleBotSubmit(undefined, `/check ${q}`);
  };

  const Milestone = ({ title, requirement, bonus, isReached }: { title: string, requirement: string, bonus: string, isReached: boolean }) => (
    <div className={`p-5 rounded-3xl border transition-all ${isReached ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
       <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isReached ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
             {isReached ? <CheckCircle2 size={20} /> : <Clock size={20} />}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isReached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
             {isReached ? 'Unlocked' : 'Locked'}
          </span>
       </div>
       <h4 className="text-[15px] font-black text-white mb-1 tracking-tight">{title}</h4>
       <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">{requirement}</p>
       <div className="flex items-center gap-2 text-[12px] font-black text-emerald-400">
          <Award size={14} />
          {bonus}
       </div>
    </div>
  );

  const dynamicChartData = React.useMemo(() => {
    const last7Days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      
      const dayRegs = referrals.filter(r => {
        const regDate = (r.createdAt && typeof r.createdAt.toDate === 'function') ? r.createdAt.toDate() : new Date(r.createdAt || 0);
        return regDate.toDateString() === d.toDateString();
      }).length;

      last7Days.push({ 
        day: dateStr, 
        registrations: dayRegs,
        clicks: 0, 
        ftds: 0 
      });
    }
    return last7Days;
  }, [referrals]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully");
      navigate('/affiliate');
    } catch (err: any) {
      console.error("Logout error:", err);
      toast.error("Logout failed: " + err.message);
    }
  };

  if (appConfig?.affiliateProgramDisabled) {
    return (
      <div className="min-h-screen bg-[#0d0e12] text-white flex flex-col items-center justify-center p-6 text-center">
        <SEO title="Affiliate Program Disabled" description="Affiliate program is currently disabled." robots="noindex, nofollow" />
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-500 shadow-2xl shadow-amber-500/10">
          <Lock size={38} />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
          Affiliate Program Temporarily Disabled
        </h1>
        <p className="text-gray-400 max-w-md text-sm md:text-base leading-relaxed mb-8 font-medium">
          The affiliate & referral program is currently suspended by the system administrator. You cannot access affiliate features or program details at this time.
        </p>
        <button
          onClick={() => navigate('/trade')}
          className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95"
        >
          Return to Trading
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-[#1a2233] font-sans selection:bg-[#3b66f5]/20">
      <SEO 
        title="Bivaax Partner Center | Official Trading Affiliate Portal" 
        description="Official Bivaax Affiliate & Partner Portal. Track real-time referrals, trader analytics, commission revenue share up to 80%, and withdraw earnings with zero fees." 
        isAffiliate={true}
        robots="index, follow" 
      />
      
      <BivaaxSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        initials={currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : "HA"}
        onLogout={handleLogout}
        affiliateBalance={affiliateBalance}
        onTransfer={handleTransferEarnings}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <BivaaxHeader 
          email={currentUser?.email || "user@bivaax.com"} 
          initials={currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : "HA"}
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 pb-24 lg:pb-8">
          
          {activeTab === 'dashboard' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                   <h2 className="text-[28px] font-black text-[#1a2233] tracking-tight leading-none mb-2">{t('partner_dashboard')}</h2>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('network_overview')}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[11px] font-black text-[#1a2233] uppercase tracking-widest">{t('system_online')}</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                   <BivaaxBalanceCard 
                     availableBalance={availableBalance}
                     heldBalance={heldBalance}
                     onPaymentClick={() => setIsPaymentModalOpen(true)}
                   />
                   
                   <BivaaxLinkCard 
                     revshareLink={revshareLink}
                     turnoverLink={turnoverLink}
                     revshareCode={revshareCode}
                     turnoverCode={turnoverCode}
                     onCopy={(url: string, label: string) => {
                        navigator.clipboard.writeText(url);
                        toast.success(`${label} ${t('copy_success') || 'Link copied!'}`);
                     }}
                   />
                </div>

                <div className="space-y-6">
                   <BivaaxProgramCard 
                     title={t('revenue_share')}
                     level={`LEVEL ${currentLevel}`}
                     rate={`${getCommissionRate(currentLevel, 'revshare')}%`}
                     nextLevel={currentLevel < 5 ? `LEVEL ${currentLevel + 1}` : "MAX"}
                     progress={currentLevel === 1 ? (totalFTDs / 5) * 100 : 
                               currentLevel === 2 ? (totalFTDs / 25) * 100 :
                               currentLevel === 3 ? (totalFTDs / 40) * 100 :
                               currentLevel === 4 ? (totalFTDs / 100) * 100 : 100}
                     progressText={currentLevel < 5 ? "FTD PROGRESS TO NEXT LEVEL" : "MAXIMUM LEVEL REACHED"}
                   />

                   <div className="grid grid-cols-1 gap-6">
                       <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                          <h3 className="text-base font-bold text-[#1a2233] mb-5 tracking-tight flex items-center justify-between">
                            {t('turnover')}
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Active</span>
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#f8f9fb] rounded-2xl p-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Max Potential</span>
                              <span className="text-[17px] font-bold text-[#1a2233]">5%</span>
                            </div>
                            <div className="bg-[#f8f9fb] rounded-2xl p-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Your Rate</span>
                              <span className="text-[17px] font-bold text-sky-600">{getCommissionRate(currentLevel, 'turnover')}%</span>
                            </div>
                          </div>
                       </div>
                       
                       <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                          <h3 className="text-base font-bold text-[#1a2233] mb-5 tracking-tight flex items-center justify-between">
                            Sub-Affiliates
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Active</span>
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#f8f9fb] rounded-2xl p-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Network</span>
                              <span className="text-[17px] font-bold text-[#1a2233]">{stats.networkSize}</span>
                            </div>
                            <div className="bg-[#f8f9fb] rounded-2xl p-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Your Rate</span>
                              <span className="text-[17px] font-bold text-fuchsia-600">10%</span>
                            </div>
                          </div>
                       </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BivaaxStatCard 
                  label="Users"
                  icon={Users}
                  values={[
                    { label: 'Clicks', val: impressions },
                    { label: 'Registrations', val: stats.leads },
                    { label: 'FTD', val: stats.conversions }
                  ]}
                />

                <BivaaxStatCard 
                  label="Deposits"
                  icon={Wallet}
                  values={[
                    { label: 'Deposits', val: referrals.reduce((acc, r) => acc + (r.totalDeposits || 0), 0) },
                    { label: 'FTD Amount', val: `$${referrals.filter(r => (r.totalDeposits || 0) > 0).reduce((acc, r) => acc + (r.totalDeposits || 0), 0).toFixed(2)}` },
                    { label: 'Deposits Amount', val: `$${referrals.reduce((acc, r) => acc + (r.totalDeposits || 0), 0).toFixed(2)}` }
                  ]}
                />
             </div>

             <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-base font-bold text-[#1a2233]">This week</h3>
                  <button onClick={() => setActiveTab('statistics')} className="text-sm font-bold text-[#3b66f5]">All statistics</button>
                </div>
                <div className="flex items-center gap-4 mb-8">
                   <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#3b66f5]"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Clicks</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff9500]"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registrations</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#34c759]"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">FTD</span>
                   </div>
                </div>
                <div className="h-[240px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dynamicChartData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                         <YAxis hide />
                         <Tooltip 
                            cursor={{fill: 'rgba(59, 102, 245, 0.05)'}}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                         />
                         <Bar dataKey="clicks" fill="#3b66f5" radius={[4, 4, 0, 0]} barSize={8} />
                         <Bar dataKey="registrations" fill="#ff9500" radius={[4, 4, 0, 0]} barSize={8} />
                         <Bar dataKey="ftds" fill="#34c759" radius={[4, 4, 0, 0]} barSize={8} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
           </div>
        )}
        
        {activeTab === 'promo-perks' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">{t('promo_perks')}</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: t('boosted_revshare'), desc: t('boosted_revshare_desc'), icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                  { title: t('cpa_bonus'), desc: t('cpa_bonus_desc'), icon: Award, color: "text-indigo-500", bg: "bg-indigo-50" },
                  { title: t('weekly_race'), desc: t('weekly_race_desc'), icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { title: t('direct_manager'), desc: t('direct_manager_desc'), icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
                ].map((perk, i) => (
                  <div key={i} className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex items-start gap-6 group hover:shadow-md transition-all">
                    <div className={`p-4 rounded-2xl ${perk.bg} ${perk.color} group-hover:scale-110 transition-transform`}>
                      <perk.icon size={28} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#1a2233]">{perk.title}</h3>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">{perk.desc}</p>
                      <button className="text-sm font-bold text-[#3b66f5] pt-2 flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                        {t('activate_now')} <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        )}

        {activeTab === 'offers' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">{t('offers')}</h2>
             <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Briefcase size={40} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-bold text-[#1a2233]">Available Programs</h3>
                   <p className="text-gray-500 max-w-sm mx-auto">Multiple payout models are being configured for your account. Standard RevShare is active by default.</p>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                   {[
                     { level: 1, rate: '40%', regs: '1 – 10 Regs', ftd: '5 FTD' },
                     { level: 2, rate: '50%', regs: '50 Regs', ftd: '25 FTD' },
                     { level: 3, rate: '60%', regs: '100 Regs', ftd: '40 FTD' },
                     { level: 4, rate: '70%', regs: '200 Regs', ftd: '100 FTD' },
                     { level: 5, rate: '80%', regs: '200+ Regs', ftd: '200 FTD (Monthly)' }
                   ].map((tier) => {
                     const isCurrent = currentLevel === tier.level;
                     return (
                       <div key={`rev-tier-${tier.level}`} className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${isCurrent ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20' : 'bg-gray-50/50 border-gray-100'}`}>
                         <div>
                           <div className="flex items-center justify-between mb-3">
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Level {tier.level}</span>
                             {isCurrent && <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Active</span>}
                           </div>
                           <div className="text-3xl font-black text-[#1a2233] mb-4">{tier.rate}</div>
                         </div>
                         <div className="space-y-1 pt-4 border-t border-gray-200/50 text-[11px] font-medium text-gray-500">
                           <div>• {tier.regs}</div>
                           <div>• {tier.ftd}</div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
             </div>
           </div>
        )}

        {activeTab === 'postbacks' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight">Postbacks</h2>
                <button 
                  onClick={() => setShowAddPostback(!showAddPostback)}
                  className="bg-[#3b66f5] text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-900/10 hover:bg-[#3256d1] transition-colors"
                >
                   {showAddPostback ? <X size={18} /> : <Plus size={18} />} 
                   {showAddPostback ? 'Cancel' : 'Add Postback'}
                </button>
             </div>
             
             {showAddPostback && (
               <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                 <h3 className="text-xl font-bold text-[#1a2233] mb-6">Create New Postback</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Name</label>
                      <input 
                         type="text" 
                         value={newPostback.name}
                         onChange={(e) => setNewPostback({...newPostback, name: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#3b66f5] font-bold text-[#1c1d22]"
                         placeholder="e.g. Voluum Tracker"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Postback URL</label>
                      <input 
                         type="text" 
                         value={newPostback.url}
                         onChange={(e) => setNewPostback({...newPostback, url: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#3b66f5] font-bold text-[#1c1d22]"
                         placeholder="https://tracker.com/postback?clickid={clickid}"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Event Trigger</label>
                      <select 
                         value={newPostback.event}
                         onChange={(e) => setNewPostback({...newPostback, event: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#3b66f5] font-bold text-[#1c1d22] appearance-none"
                      >
                         <option value="registration">Registration (Lead)</option>
                         <option value="ftd">First Time Deposit (FTD)</option>
                         <option value="deposit">Any Deposit</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">HTTP Method</label>
                      <select 
                         value={newPostback.method}
                         onChange={(e) => setNewPostback({...newPostback, method: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#3b66f5] font-bold text-[#1c1d22] appearance-none"
                      >
                         <option value="GET">GET</option>
                         <option value="POST">POST</option>
                      </select>
                    </div>
                 </div>
                 <div className="flex justify-end">
                    <button 
                       onClick={handleAddPostback}
                       disabled={isAddingPostback}
                       className="bg-[#1a2233] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-black transition-colors disabled:opacity-50"
                    >
                       {isAddingPostback ? 'Saving...' : 'Save Postback'}
                    </button>
                 </div>
               </div>
             )}

             {postbacks.length === 0 && !showAddPostback ? (
                 <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <Undo2 size={32} />
                    </div>
                    <p className="text-gray-400 font-medium">Configure server-to-server notifications for your tracking platform.</p>
                 </div>
             ) : (
                <div className="space-y-4">
                   {postbacks.map((pb, i) => (
                      <div key={pb.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                               <h3 className="font-bold text-[#1a2233]">{pb.name}</h3>
                               <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-widest">{pb.event}</span>
                               <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest">{pb.method}</span>
                            </div>
                            <p className="text-[13px] text-gray-400 font-mono break-all max-w-2xl">{pb.url}</p>
                         </div>
                         <button 
                           onClick={() => handleDeletePostback(pb.id)}
                           className="text-red-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors"
                         >
                            <Trash2 size={20} />
                         </button>
                      </div>
                   ))}
                </div>
             )}
           </div>
        )}

        {activeTab === 'partner-bot' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center justify-between px-1">
               <div>
                 <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight">Partner Bot & UID Verification</h2>
                 <p className="text-xs text-gray-500 font-medium mt-0.5">Verify trader registrations under your link and access real-time network intelligence</p>
               </div>
               <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Bot Active</span>
               </div>
             </div>
             
             <div className="bg-white rounded-[24px] overflow-hidden flex flex-col h-[680px] border border-gray-100 shadow-sm relative">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-[#f8fafc] flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 text-[#3b66f5] rounded-2xl flex items-center justify-center shadow-xs">
                         <Bot size={22} />
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                           <h3 className="text-[16px] font-bold text-[#1a2233]">Bivaax Partner Assistant</h3>
                           <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">v2.4 Pro</span>
                         </div>
                         <p className="text-[11px] text-gray-500 font-medium">Trader UID Verification & Network Analytics</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => handleBotSubmit(undefined, '/stats')}
                        className="text-xs font-bold text-gray-600 hover:text-[#3b66f5] bg-white border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs hidden sm:flex items-center gap-1.5"
                      >
                         <BarChart3 size={14} />
                         <span>Stats</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleBotSubmit(undefined, '/link')}
                        className="text-xs font-bold text-gray-600 hover:text-[#3b66f5] bg-white border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs hidden sm:flex items-center gap-1.5"
                      >
                         <Link size={14} />
                         <span>Links</span>
                      </button>
                   </div>
                </div>

                {/* Quick Trader UID Verification Bar */}
                <div className="bg-[#f1f5f9]/70 px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                      <ShieldCheck size={16} className="text-[#3b66f5]" />
                      <span>Quick UID Verification:</span>
                   </div>
                   <div className="flex items-center gap-2 flex-1 max-w-md">
                      <input 
                         type="text"
                         value={quickUidInput}
                         onChange={(e) => setQuickUidInput(e.target.value)}
                         onKeyDown={(e) => { if (e.key === 'Enter') handleQuickUidCheck(); }}
                         placeholder="Enter 9-digit Profile UID (e.g. 114829103)"
                         className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-[#1a2233] placeholder:text-gray-400 focus:outline-none focus:border-[#3b66f5] focus:ring-1 focus:ring-indigo-100 transition-all font-mono"
                      />
                      <button 
                         type="button"
                         onClick={handleQuickUidCheck}
                         disabled={!quickUidInput.trim()}
                         className="bg-[#3b66f5] hover:bg-[#3256d1] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
                      >
                         Check
                      </button>
                   </div>
                </div>
                
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc] relative z-10 scrollbar-hide">
                   {botMessages.map((msg, i) => {
                      const isBot = msg.sender === 'bot';
                      return (
                         <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                               isBot 
                                 ? 'bg-white text-[#1a2233] rounded-tl-none border border-gray-100 shadow-sm' 
                                 : 'bg-[#3b66f5] text-white rounded-tr-none shadow-md shadow-blue-500/10'
                            }`}>
                               <div className="whitespace-pre-line text-[13.5px] leading-relaxed font-normal">
                                  {msg.text}
                               </div>
                               <div className={`text-[10px] font-semibold tracking-wider mt-2.5 ${isBot ? 'text-gray-400' : 'text-blue-100 text-right'}`}>
                                  {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                            </div>
                         </div>
                      );
                   })}
                   {isBotTyping && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                         <div className="p-3.5 rounded-2xl bg-white rounded-tl-none border border-gray-100 shadow-xs flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#3b66f5] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-[#3b66f5] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-[#3b66f5] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                         </div>
                      </div>
                   )}
                   <div ref={botEndRef} />
                </div>
                
                {/* Quick Action Chips & Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 relative z-10 space-y-3">
                   <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
                      {[
                        { label: '🔍 Check UID', cmd: () => { setBotInput('/check '); } },
                        { label: '📊 /stats', cmd: () => { handleBotSubmit(undefined, '/stats'); } },
                        { label: '👥 /traders', cmd: () => { handleBotSubmit(undefined, '/traders'); } },
                        { label: '🔗 /link', cmd: () => { handleBotSubmit(undefined, '/link'); } },
                        { label: '💰 /balance', cmd: () => { handleBotSubmit(undefined, '/balance'); } },
                        { label: '🏆 /rates', cmd: () => { handleBotSubmit(undefined, '/rates'); } },
                        { label: '❓ /help', cmd: () => { handleBotSubmit(undefined, '/help'); } },
                      ].map((item, idx) => (
                         <button 
                            key={idx}
                            type="button"
                            onClick={item.cmd}
                            className="text-[11px] font-bold text-gray-600 hover:text-[#3b66f5] bg-gray-50 hover:bg-indigo-50/70 border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors shadow-2xs"
                         >
                            {item.label}
                         </button>
                      ))}
                   </div>

                   <form onSubmit={(e) => handleBotSubmit(e)} className="flex items-center gap-2.5">
                      <input 
                         type="text"
                         value={botInput}
                         onChange={(e) => setBotInput(e.target.value)}
                         placeholder="Enter Trader UID (e.g. 114829103) or type /help..."
                         className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#1a2233] text-[13.5px] focus:outline-none focus:border-[#3b66f5] focus:bg-white placeholder:text-gray-400 transition-colors font-medium"
                      />
                      <button 
                         type="submit"
                         disabled={!botInput.trim()}
                         className="h-[46px] px-5 bg-[#3b66f5] hover:bg-[#3256d1] disabled:opacity-40 disabled:hover:bg-[#3b66f5] text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 text-xs font-bold gap-2"
                      >
                         <span>Send</span>
                         <Send size={15} />
                      </button>
                   </form>
                </div>
             </div>
           </div>
        )}

        {activeTab === 'profile' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Profile Settings</h2>
             <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm divide-y divide-gray-50">
                <div className="p-8 flex items-center gap-6">
                   <div className="w-20 h-20 rounded-full bg-[#dbeafe] text-[#3b82f6] flex items-center justify-center text-2xl font-bold shadow-inner">
                      {currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : "HA"}
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-[#1a2233] mb-1">{currentUser?.displayName || "Partner Account"}</h3>
                      <p className="text-gray-500 font-medium">{currentUser?.email}</p>
                   </div>
                </div>
                <div className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                         <input type="text" readOnly value={currentUser?.displayName || "N/A"} className="w-full bg-[#f8f9fb] border border-gray-100 rounded-xl px-5 py-3.5 font-bold text-[#1a2233]" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                         <input type="text" readOnly value={currentUser?.email || ""} className="w-full bg-[#f8f9fb] border border-gray-100 rounded-xl px-5 py-3.5 font-bold text-[#1a2233]" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Affiliate ID</label>
                         <input type="text" readOnly value={`#${affId}`} className="w-full bg-[#f8f9fb] border border-gray-100 rounded-xl px-5 py-3.5 font-mono font-bold text-[#3b66f5]" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Account Currency</label>
                         <input type="text" readOnly value="USD (Tether)" className="w-full bg-[#f8f9fb] border border-gray-100 rounded-xl px-5 py-3.5 font-bold text-[#1a2233]" />
                      </div>
                   </div>
                   <div className="pt-4">
                      <button className="bg-gray-100 hover:bg-gray-200 transition-colors px-8 py-3.5 rounded-xl font-bold text-[#1a2233] text-sm">Change Password</button>
                   </div>
                </div>
             </div>
           </div>
         )}

         {activeTab === "statistics" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Statistics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { label: "Clicks", val: impressions, icon: MousePointer2, color: "text-blue-500" },
                   { label: "Registrations", val: stats.leads, icon: UserPlus, color: "text-indigo-500" },
                   { label: "FTD", val: stats.conversions, icon: CheckCircle2, color: "text-green-500" },
                   { label: "Profit", val: `${userCurrency}${getConvertedBalance(affiliateBalance, userCurrency).toFixed(2)}`, icon: Wallet, color: "text-[#3b66f5]" },
                 ].map((s, i) => (
                   <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                     <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-gray-50 ${s.color}`}>
                           <s.icon size={16} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</span>
                     </div>
                     <div className="text-2xl font-bold text-[#1a2233]">{s.val}</div>
                   </div>
                 ))}
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                       <h3 className="text-lg font-bold text-[#1a2233]">Referral Network Audit</h3>
                       <p className="text-sm text-gray-500 font-medium tracking-tight">In-depth member transaction logs</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                       <div className="relative w-full sm:w-64">
                          <input 
                            type="text" 
                            placeholder="Search by ID or Email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-[12px] font-bold text-[#1a2233] focus:outline-none focus:border-[#3b66f5]/30"
                          />
                       </div>
                       <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                          <button className="px-5 py-2.5 rounded-xl bg-[#1a2233] text-white text-[11px] font-bold uppercase tracking-widest shadow-xl">Live Network</button>
                          <button className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-[#1a2233] transition-colors text-[11px] font-bold uppercase tracking-widest">History</button>
                       </div>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                                <th className="pb-6 px-4">User / Partner</th>
                                <th className="pb-6 px-4">{t('joined')}</th>
                                <th className="pb-6 px-4">Live Balance</th>
                                <th className="pb-6 px-4">Total Deposits (FTD)</th>
                                <th className="pb-6 px-4">Trade Volume</th>
                                <th className="pb-6 px-4">Net P&L</th>
                                <th className="pb-6 px-4">7-Day Hold Comm</th>
                                <th className="pb-6 px-4">Available Comm</th>
                                <th className="pb-6 px-4 text-right">Action</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {filteredReferrals.length > 0 ? filteredReferrals.map((ref) => {
                                const email = ref.email || "";
                                const maskedEmail = email.includes("@") ? `${email.split("@")[0].substring(0, 3)}***@${email.split("@")[1].substring(0, 1)}***.com` : "Ano***";
                                const userLiveBalance = parseFloat(ref.realBalance ?? ref.balance ?? 0);
                                const userDeposits = parseFloat(ref.totalDeposits || 0);
                                const userVol = parseFloat(ref.tradeVolume || 0);
                                const userPnL = parseFloat(ref.traderNetPnL || 0);
                                const userHoldComm = parseFloat(ref.holdCommission || 0);
                                const userAvailComm = parseFloat(ref.settledCommission || 0);
                                const isFTD = ref.isFTD || userDeposits > 0;

                                return (
                                   <tr key={`stat-row-${ref.id || ref.uid}`} className="group hover:bg-gray-50/70 transition-all cursor-pointer" onClick={() => setSelectedTrader(ref)}>
                                     <td className="py-5 px-4">
                                        <div className="flex items-center gap-3">
                                           <div className="w-10 h-10 rounded-2xl bg-[#1c1d22] text-white flex items-center justify-center font-black text-[13px] shadow-sm overflow-hidden relative group-hover:scale-105 transition-transform flex-shrink-0">
                                              <img 
                                                src={ref.photoURL || ref.photo_url || ref.avatar || ref.photoUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(ref.displayName || maskedEmail)} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover" 
                                                loading="lazy" 
                                                onError={(e) => { (e.target as any).src = "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(maskedEmail); }} 
                                              />
                                           </div>
                                           <div>
                                              <div className="text-[14px] font-black text-[#1c1d22] flex items-center gap-1.5">
                                                {ref.displayName || ref.first_name || maskedEmail}
                                                {isFTD && (
                                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    FTD
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-[10px] font-bold text-gray-400">
                                                UID: <span className="text-blue-600 font-mono">{ref.uid || ref.id}</span>
                                              </div>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="py-5 px-4 font-bold text-gray-500 text-[12px]">
                                        {new Date(ref.createdAt || Date.now()).toLocaleDateString()}
                                     </td>
                                     <td className="py-5 px-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-black text-[13px] border border-emerald-200 tabular-nums">
                                           {userCurrency} {getConvertedBalance(userLiveBalance, userCurrency).toFixed(2)}
                                        </span>
                                     </td>
                                     <td className="py-5 px-4">
                                        <div className="flex flex-col">
                                          <span className="text-[14px] font-black text-[#1a2233] tabular-nums">
                                             {userCurrency} {getConvertedBalance(userDeposits, userCurrency).toFixed(2)}
                                          </span>
                                          {isFTD && (
                                            <span className="text-[10px] font-bold text-emerald-600">Funded Account</span>
                                          )}
                                        </div>
                                     </td>
                                     <td className="py-5 px-4">
                                        <div className="flex flex-col">
                                          <span className="text-[13px] font-black text-[#1a2233] tabular-nums">
                                             {userCurrency} {getConvertedBalance(userVol, userCurrency).toLocaleString()}
                                          </span>
                                          <span className="text-[10px] font-bold text-gray-400">
                                             {ref.tradeCount || 0} trades
                                          </span>
                                        </div>
                                     </td>
                                     <td className="py-5 px-4">
                                        <span className={`text-[13px] font-black tabular-nums ${userPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                           {userPnL >= 0 ? '+' : ''}{userCurrency} {getConvertedBalance(userPnL, userCurrency).toFixed(2)}
                                        </span>
                                     </td>
                                     <td className="py-5 px-4">
                                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 tabular-nums">
                                           <Clock size={12} />
                                           ${userHoldComm.toFixed(2)}
                                        </span>
                                     </td>
                                     <td className="py-5 px-4">
                                        <span className="inline-flex items-center gap-1 text-[12px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 tabular-nums">
                                           <CheckCircle2 size={12} />
                                           ${userAvailComm.toFixed(2)}
                                        </span>
                                     </td>
                                     <td className="py-5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                          onClick={() => setSelectedTrader(ref)}
                                          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-[#3b66f5] hover:text-white text-[#1a2233] text-[11px] font-black uppercase tracking-wider transition-all"
                                        >
                                          Details
                                        </button>
                                     </td>
                                   </tr>
                                );
                             }) : (
                                <tr>
                                   <td colSpan={9} className="py-24 text-center">
                                      <Activity size={48} className="text-gray-200 mx-auto mb-4" />
                                      <div className="text-[13px] font-black text-gray-400 uppercase tracking-widest">No referred traders recorded yet</div>
                                      <p className="text-[12px] text-gray-400 mt-1">Share your affiliate link to start onboarding traders and earning commissions.</p>
                                   </td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                  <div className="lg:col-span-3 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                       <div>
                          <h3 className="text-[22px] font-black text-[#1c1d22] tracking-tighter">Commissions History</h3>
                          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">RevShare, Turnover & Sub-Affiliates</p>
                       </div>
                       <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                          <button className="px-5 py-2.5 rounded-xl bg-[#1c1d22] text-white text-[11px] font-black uppercase tracking-widest shadow-xl">Recent</button>
                       </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="pb-8 px-4">Date</th>
                                <th className="pb-8 px-4">Type</th>
                                <th className="pb-8 px-4">Source ID</th>
                                <th className="pb-8 px-4">Base Volume</th>
                                <th className="pb-8 px-4">Rate %</th>
                                <th className="pb-8 px-4 text-right">Earned</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {commissions.length > 0 ? commissions.map((comm, idx) => {
                                let typeLabel = "RevShare";
                                let typeColor = "text-indigo-500";
                                let volume = comm.lostAmount || comm.tradeAmount || comm.baseCommissionAmount || comm.depositAmount || 0;
                                
                                if (comm.type === "turnover_share") {
                                   typeLabel = "Turnover";
                                   typeColor = "text-emerald-500";
                                } else if (comm.type === "deposit_commission" || comm.type === "deposit") {
                                   typeLabel = "Deposit";
                                   typeColor = "text-amber-500";
                                   volume = comm.depositAmount || comm.lostAmount || comm.tradeAmount || comm.baseCommissionAmount || 0;
                                }
                                
                                return (
                                   <tr key={`comm-row-${comm.id}`} className="group hover:bg-gray-50/50 transition-all">
                                     <td className="py-6 px-4 font-bold text-gray-500 text-[13px] uppercase tracking-tighter">
                                        {new Date(comm.createdAt || Date.now()).toLocaleDateString()} {new Date(comm.createdAt || Date.now()).toLocaleTimeString()}
                                     </td>
                                     <td className={`py-6 px-4 font-black ${typeColor} text-[13px] uppercase tracking-widest`}>
                                        {typeLabel}
                                     </td>
                                     <td className="py-6 px-4 font-black text-[#1c1d22] text-[15px] tabular-nums tracking-tight">
                                        {comm.referredUid ? String(comm.referredUid).substring(0, 8).toUpperCase() : "N/A"}
                                     </td>
                                     <td className="py-6 px-4">
                                        <span className="text-[14px] font-black text-gray-400 tabular-nums">
                                           {userCurrency} {getConvertedBalance(volume, userCurrency).toLocaleString()}
                                        </span>
                                     </td>
                                     <td className="py-6 px-4 font-black text-gray-700 text-[14px]">
                                        {comm.percent}%
                                     </td>
                                     <td className="py-6 px-4 text-right font-black text-emerald-500 text-[15px] tabular-nums tracking-tighter">
                                        +{userCurrency} {getConvertedBalance(comm.amount || 0, userCurrency).toLocaleString()}
                                     </td>
                                   </tr>
                                );
                             }) : (
                                <tr>
                                   <td colSpan={6} className="py-24 text-center">
                                      <Activity size={48} className="text-gray-100 mx-auto mb-4" />
                                      <div className="text-[12px] font-black text-gray-300 uppercase tracking-widest">Awaiting commission data</div>
                                   </td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="bg-[#1c1d22] rounded-[40px] p-10 text-white relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]"></div>
                       <h4 className="text-[14px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-10">Traffic Funnel</h4>
                       <div className="space-y-6">
                          {[
                             { label: "Direct Entry", val: "65%", color: "bg-indigo-500" },
                             { label: "Social Media", val: "22%", color: "bg-rose-500" },
                             { label: "Telegram Hub", val: "13%", color: "bg-emerald-500" }
                          ].map((item, i) => (
                             <div key={`aff-stat-card-${i}`} className="space-y-2.5">
                                <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-widest">
                                   <span className="text-gray-500">{item.label}</span>
                                   <span className="text-white">{item.val}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div className={`h-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: item.val }}></div>
                                </div>
                             </div>
                          ))}
                       </div>
                       <div className="mt-12 pt-10 border-t border-white/5">
                          <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[11px] uppercase tracking-[0.2em] transition-all border border-white/5">Generate Audit Report</button>
                       </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[40px] p-10 text-white shadow-2xl shadow-emerald-900/20 group">
                       <TrendingUp size={40} className="text-white/20 mb-8 group-hover:scale-110 transition-transform" />
                       <h4 className="text-[24px] font-black tracking-tighter leading-tight mb-4 text-white">Scale Your Reach Today.</h4>
                       <p className="text-emerald-50 text-[14px] font-medium leading-relaxed opacity-70 mb-10">Pro partners with high CR get access to exclusive $5 CPA bonuses per funded user.</p>
                       <button 
                          onClick={() => setView('new_ticket')}
                          className="w-full py-5 rounded-2xl bg-white text-emerald-700 font-black text-[13px] uppercase tracking-widest shadow-xl"
                       >
                          Open Ticket
                       </button>
                    </div>
                 </div>
              </div>

              {/* Referred Traders Overview on Dashboard */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-[#1a2233]">Referred Traders & Live Balances</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time balances and deposit records for your direct network</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('statistics')} 
                    className="text-xs font-black text-[#3b66f5] hover:underline uppercase tracking-wider flex items-center gap-1"
                  >
                    View All Traders <ChevronRight size={14} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        <th className="pb-3 px-3">Trader</th>
                        <th className="pb-3 px-3">Live Balance</th>
                        <th className="pb-3 px-3">Total Deposit</th>
                        <th className="pb-3 px-3">Volume</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {referrals.slice(0, 5).map((ref) => {
                        const email = ref.email || "";
                        const maskedEmail = email.includes("@") ? `${email.split("@")[0].substring(0, 3)}***@${email.split("@")[1].substring(0, 1)}***.com` : "Ano***";
                        const userLiveBalance = parseFloat(ref.realBalance ?? ref.balance ?? 0);
                        const userDeposits = parseFloat(ref.totalDeposits || 0);
                        const userVol = parseFloat(ref.tradeVolume || 0);

                        return (
                          <tr key={`dash-ref-${ref.id || ref.uid}`} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0">
                                  <img 
                                    src={ref.photoURL || ref.photo_url || ref.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(ref.displayName || maskedEmail)} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                    loading="lazy"
                                  />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-gray-900">{ref.displayName || maskedEmail}</div>
                                  <div className="text-[10px] text-gray-400 font-mono">UID: {ref.uid || ref.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-100 tabular-nums">
                                ${userLiveBalance.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-bold text-xs text-gray-900 tabular-nums">
                                ${userDeposits.toFixed(2)}
                              </span>
                              {userDeposits > 0 && (
                                <span className="ml-1.5 text-[9px] font-black uppercase px-1 py-0.2 rounded bg-blue-50 text-blue-600">FTD</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-bold text-xs text-gray-700 tabular-nums">
                                ${userVol.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button 
                                onClick={() => setSelectedTrader(ref)}
                                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#3b66f5] hover:text-white text-gray-700 text-[10px] font-black uppercase transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {referrals.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-gray-400 font-medium">
                            No traders registered under your link yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
         )}
        {activeTab === 'promo' && (
           <div className="space-y-10">
              <SectionHeading icon={Award} title="Marketing Assets" desc="Premium banners and assets for your promotions" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {promoMaterials.length > 0 ? promoMaterials.map((item, i) => (
                    <div key={`aff-promo-mat-${i}`} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all">
                       <div className={`aspect-video rounded-[20px] ${item.color || 'bg-[#1c1d22]'} mb-6 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative shadow-inner`}>
                          {item.imageUrl ? (
                             <img src={item.imageUrl} className="w-full h-full object-cover" alt="Affiliate Promotion" loading="lazy" />
                          ) : (
                             <>
                                <Logo size={32} withBackground className="mb-3" />
                                <div className="text-white font-black text-[18px] tracking-tighter leading-tight drop-shadow-lg">GLOBAL TRADING <br/>LEADER</div>
                             </>
                          )}
                          <div className="absolute bottom-2 left-2 right-2 bg-white/10 backdrop-blur-md rounded-lg py-1 text-[10px] text-white font-black uppercase tracking-[0.2em]">{item.size}</div>
                       </div>
                       
                       <div className="flex items-center justify-between mt-auto">
                          <div>
                             <h4 className="text-[15px] font-black text-[#1c1d22] tracking-tight">{item.label}</h4>
                             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.size}</p>
                          </div>
                          <button 
                            onClick={() => {
                                if (item.imageUrl) {
                                    navigator.clipboard.writeText(item.imageUrl);
                                    toast.success('Image link copied');
                                } else {
                                    toast.error('No image URL associated');
                                }
                            }}
                            className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                             <Copy size={18} />
                          </button>
                       </div>
                       <button className="w-full mt-5 bg-gray-50 hover:bg-gray-100 text-[#1c1d22] font-black py-4 rounded-[20px] text-[13px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                          Get Asset Link
                          <ArrowRight size={16} />
                       </button>
                    </div>
                 )) : (
                    [
                        { size: '1080 x 1080', label: 'Instagram Square', color: 'bg-gradient-to-br from-[#1c1d22] to-[#3a3c42]' },
                        { size: '1200 x 628', label: 'Facebook / Twitter', color: 'bg-gradient-to-br from-indigo-900 to-indigo-600' },
                        { size: '728 x 90', label: 'Web Leaderboard', color: 'bg-gradient-to-br from-rose-900 to-rose-600' }
                    ].map((item, i) => (
                        <div key={`mock-promo-${i}`} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all opacity-60">
                           <div className={`aspect-video rounded-[20px] ${item.color} mb-6 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative shadow-inner`}>
                              <Logo size={32} withBackground className="mb-3" />
                              <div className="text-white font-black text-[18px] tracking-tighter leading-tight drop-shadow-lg text-center font-sans">MARKETING<br/>ASSET</div>
                              <div className="absolute bottom-2 left-2 right-2 bg-white/10 backdrop-blur-md rounded-lg py-1 text-[10px] text-white font-black uppercase tracking-[0.2em]">{item.size}</div>
                           </div>
                           <div className="flex items-center justify-between mt-auto">
                              <div>
                                 <h4 className="text-[15px] font-black text-[#1c1d22] tracking-tight">{item.label}</h4>
                                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.size}</p>
                              </div>
                           </div>
                        </div>
                    ))
                 )}
              </div>
           </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <SectionHeading 
                  icon={ExternalLink} 
                  title="Official Tracking Links" 
                  desc="Your direct Revenue Share and Turnover affiliate links" 
                />
             </div>

             {/* Top Direct Links Card */}
             <BivaaxLinkCard 
               revshareLink={revshareLink}
               turnoverLink={turnoverLink}
               revshareCode={revshareCode}
               turnoverCode={turnoverCode}
               onCopy={(url: string, label: string) => {
                  navigator.clipboard.writeText(url);
                  toast.success(`${label} ${t('copy_success') || 'Link copied!'}`);
               }}
             />

             <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                            <th className="py-8 px-10">Campaign Detail</th>
                            <th className="py-8 px-6">Tracking URL</th>
                            <th className="py-8 px-6 text-center">Clicks</th>
                            <th className="py-8 px-6 text-center">Regs</th>
                            <th className="py-8 px-6 text-center">FTDs</th>
                            <th className="py-8 px-10 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {campaigns.filter(c => campaignTab === 'archived' ? c.isArchived : !c.isArchived).map((camp, i) => {
                            const campRegs = referrals.filter(r => r.referredSub === camp.subId).length;
                            const campFTDs = referrals.filter(r => r.referredSub === camp.subId && (r.totalDeposits || 0) > 0).length;
                            const campClicks = camp.clicks || 0;

                            return (
                             <tr key={`camp-row-${camp.id || i}`} className="group hover:bg-gray-50/50 transition-all">
                               <td className="py-8 px-10">
                                  <div className="flex flex-col">
                                     <span className="text-[15px] font-black text-[#1c1d22] mb-1">{camp.name}</span>
                                     <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.1em]">SubID: {camp.subId}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-8 px-6">
                                  <div className="space-y-4 min-w-[320px]">
                                     {/* Revenue Share Link */}
                                     <div className="space-y-1.5">
                                        <div className="flex items-center justify-between px-1">
                                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('revshare_label')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50 group-hover:bg-white rounded-xl px-4 py-3 border border-gray-100 transition-all">
                                           <span className="text-[11px] font-mono font-bold text-gray-500 truncate flex-1">{getCampaignLink(camp.subId, camp.landingPage, 'revshare')}</span>
                                           <button 
                                             onClick={() => {
                                                navigator.clipboard.writeText(getCampaignLink(camp.subId, camp.landingPage, 'revshare'));
                                                toast.success(t('copy_success'));
                                             }}
                                             className="text-gray-400 hover:text-indigo-600 transition-colors"
                                           >
                                              <Copy size={14} />
                                           </button>
                                        </div>
                                     </div>

                                     {/* Turnover Link */}
                                     <div className="space-y-1.5">
                                        <div className="flex items-center justify-between px-1">
                                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('turnover')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-emerald-50/30 group-hover:bg-white rounded-xl px-4 py-3 border border-emerald-100/50 transition-all">
                                           <span className="text-[11px] font-mono font-bold text-emerald-700/70 truncate flex-1">{getCampaignLink(camp.subId, camp.landingPage, 'turnover')}</span>
                                           <button 
                                             onClick={() => {
                                                navigator.clipboard.writeText(getCampaignLink(camp.subId, camp.landingPage, 'turnover'));
                                                toast.success(t('copy_success'));
                                             }}
                                             className="text-emerald-400 hover:text-emerald-600 transition-colors"
                                           >
                                              <Copy size={14} />
                                           </button>
                                        </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-8 px-6 text-center font-black text-[#1c1d22] text-[15px] tabular-nums">{campClicks}</td>
                               <td className="py-8 px-6 text-center font-black text-[#1c1d22] text-[15px] tabular-nums">{campRegs}</td>
                               <td className="py-8 px-6 text-center font-black text-emerald-500 text-[15px] tabular-nums">{campFTDs}</td>
                               <td className="py-8 px-10 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     <button 
                                       onClick={async () => {
                                         if (camp.id === 'default') return toast.error('Standard campaign cannot be modified');
                                         try {
                                            await updateDoc(doc(db, 'affiliate_campaigns', camp.id), {
                                              isArchived: !camp.isArchived
                                            });
                                            toast.success(camp.isArchived ? 'Campaign restored' : 'Campaign archived');
                                         } catch (e) {
                                            toast.error('Failed to update campaign status');
                                         }
                                       }}
                                       className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                       title={camp.isArchived ? "Restore" : "Archive"}
                                     >
                                        {camp.isArchived ? <Activity size={18} /> : <History size={18} />}
                                     </button>
                                     {camp.id !== 'default' && (
                                        <button 
                                          onClick={() => {
                                            if (confirm('Are you sure you want to delete this campaign permanently?')) {
                                              deleteCampaign(camp.id);
                                            }
                                          }}
                                          className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                           <X size={18} />
                                        </button>
                                     )}
                                  </div>
                               </td>
                            </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </div>

             {/* New Link Generator */}
             <div className="bg-[#1c1d22] rounded-[48px] p-8 md:p-14 text-white relative overflow-hidden group border border-white/5">
                <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-1000"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                   <div>
                      <h3 className="text-[32px] font-black leading-tight tracking-tighter mb-6">Create custom <br/>tracking campaigns.</h3>
                      <p className="text-[#8e9299] text-[15px] font-medium leading-relaxed mb-8 opacity-80">Use unique tracking IDs for different traffic sources (YouTube, Telegram, SEO) to calculate accurate ROI.</p>
                      <div className="flex items-center gap-6">
                         <div className="flex flex-col">
                            <span className="text-[18px] font-black text-white">Lifetime</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Cookie</span>
                         </div>
                         <div className="w-[1px] h-10 bg-white/10"></div>
                         <div className="flex flex-col">
                            <span className="text-[18px] font-black text-white">Unlimited</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking IDs</span>
                         </div>
                      </div>
                   </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/10 shadow-2xl space-y-8">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg">
                              <Zap size={20} />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-[16px] font-black text-white">{t('dual_tracking_enabled')}</h4>
                              <p className="text-[13px] text-gray-400 font-medium leading-relaxed">{t('dual_tracking_desc')}</p>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{t('friendly_name')}</label>
                            <input 
                              type="text" 
                              value={newCampaignName}
                              onChange={e => setNewCampaignName(e.target.value)}
                              placeholder="e.g. YouTube Promo"
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500 text-white font-bold transition-all"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{t('tracking_subid')}</label>
                            <input 
                              type="text" 
                              value={newCampaignSubId}
                              onChange={e => setNewCampaignSubId(e.target.value.replace(/\s+/g, '_'))}
                              placeholder="e.g. yt_01"
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500 text-indigo-400 font-mono transition-all"
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{t('traffic_hub')}</label>
                         <select 
                            value={selectedLandingPage}
                            onChange={e => setSelectedLandingPage(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500 text-white font-bold transition-all appearance-none"
                         >
                            <option value="/" className="bg-[#1c1d22]">Main Homepage (Convert focus)</option>
                            <option value="/trade" className="bg-[#1c1d22]">Trading Interface (Direct focus)</option>
                            <option value="/about-us" className="bg-[#1c1d22]">About Us (Trust focus)</option>
                         </select>
                      </div>
                      
                      <button 
                        onClick={addCampaign}
                        disabled={!newCampaignName || !newCampaignSubId}
                        className="w-full bg-white hover:bg-gray-100 active:scale-[0.98] text-[#1c1d22] font-black py-6 rounded-2xl text-[15px] uppercase tracking-widest shadow-2xl shadow-indigo-900/20 transition-all flex items-center justify-center gap-3"
                      >
                         <Plus size={20} className="text-indigo-600" />
                         {t('generate_campaign')}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'sub-affiliates' && (
           <div className="space-y-10">
              <SectionHeading icon={UserPlus} title={t('sub_affiliate_network')} desc={t('sub_affiliate_desc')} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                       <span className="text-[11px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">2nd Tier Level</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30">
                                <th className="px-8 py-5">{t('partner_email')}</th>
                                <th className="px-8 py-5">{t('joined')}</th>
                                <th className="pb-8 px-4">Source / Sub-ID</th>
                                <th className="px-8 py-5">{t('active_refs')}</th>
                                <th className="px-8 py-5 text-right">{t('your_earnings')}</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {subAffiliates.length > 0 ? subAffiliates.map((sub, i) => {
                                const email = sub.email || "";
                                const maskedEmail = email.includes("@") ? `${email.split("@")[0].substring(0, 3)}***@${email.split("@")[1].substring(0, 1)}***.com` : "Ano***";
                                return (
                                 <tr key={`sub-aff-row-${i}`} className="hover:bg-gray-50 transition-colors">
                                   <td className="px-8 py-5">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-slate-100 border border-indigo-100 flex items-center justify-center font-black text-[10px] text-indigo-600">
                                            {maskedEmail.substring(0, 2).toUpperCase()}
                                         </div>
                                         <span className="font-bold text-[#1c1d22] text-[14px]">{maskedEmail}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-5 text-gray-500 font-bold text-[13px]">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}</td>
                                   <td className="px-8 py-5 text-[#1c1d22] font-black text-[13px]">{sub.referralSubId || 'Direct'}</td>
                                    <td className="px-8 py-5 text-[#1c1d22] font-black text-[13px]">{sub.referralCount || 0}</td>
                                   <td className="px-8 py-5 text-right font-black text-indigo-600 text-[15px]">$ 0.00 [USDT]</td>
                                </tr>
                               )
                             }) : (
                                <tr>
                                   <td colSpan={4} className="px-8 py-20 text-center opacity-50">
                                      <div className="flex flex-col items-center gap-4">
                                         <Users size={32} />
                                         <p className="text-[14px] font-black uppercase tracking-widest leading-none">{t('no_sub_partners')}</p>
                                         <p className="text-[12px] font-medium text-gray-400 max-w-[200px] leading-tight">{t('no_sub_partners_desc')}</p>
                                      </div>
                                   </td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-[#1c1d22] rounded-[32px] p-8 text-white relative overflow-hidden border border-white/5">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]"></div>
                        <h3 className="text-[18px] font-black mb-4 tracking-tight">Refer Other Partners</h3>
                        <p className="text-gray-400 text-[13px] leading-relaxed mb-8">Share this unique invitation with potential affiliates. You'll receive 5% from all revenue generated by their clients.</p>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between mb-4">
                           {referralCode ? (
                               <>
                                   <span className="text-[12px] font-mono text-gray-500 font-bold truncate pr-3">{window.location.protocol}//{window.location.host}/register?ref={referralCode}</span>
                                   <button onClick={() => { navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/register?ref=${referralCode}`); toast.success('Invite link copied'); }} className="text-indigo-400">
                                     <Copy size={16} />
                                   </button>
                               </>
                           ) : (
                               <div className="animate-pulse w-full h-5 bg-white/10 rounded-md"></div>
                           )}
                        </div>
                        
                        <div className="pt-6 border-t border-white/5">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Network Commission</span>
                              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Fixed 5%</span>
                           </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-500/20">
                        <h4 className="font-black text-[17px] mb-4">Partner Strategy</h4>
                        <p className="text-indigo-100 text-[13px] leading-relaxed opacity-90">"Recruiting top-tier sub-affiliates is the fastest way to build passive income. Focus on bloggers and channel owners."</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'payouts' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Payments</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Balance Card */}
                   <BivaaxBalanceCard 
                     availableBalance={availableBalance}
                     heldBalance={heldBalance}
                     onPaymentClick={() => setIsPaymentModalOpen(true)}
                   />


                  {/* Completed Payouts */}
                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                     <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Completed Cashouts</p>
                        <h3 className="text-[36px] font-black text-[#1c1d22] tracking-tight">
                          $ {
                             getConvertedBalance(
                               payoutRequests
                                 .filter(p => p.status === 'completed')
                                 .reduce((acc, curr) => acc + (curr.amount || 0), 0),
                               '$'
                             ).toFixed(2)
                          }
                        </h3>
                     </div>
                     <p className="text-[12px] text-gray-400 font-bold mt-4">Processed through verified secure checkout gateways</p>
                  </div>

                  {/* Pending Payouts */}
                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                     <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Pending Dispersals</p>
                        <h3 className="text-[36px] font-black text-amber-500 tracking-tight">
                          $ {
                             getConvertedBalance(
                               payoutRequests
                                 .filter(p => p.status === 'pending')
                                 .reduce((acc, curr) => acc + (curr.amount || 0), 0),
                               '$'
                             ).toFixed(2)
                          }
                        </h3>
                     </div>
                     <p className="text-[12px] text-gray-400 font-bold mt-4">Audited and processed by security within 2 hours</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form Block */}
                  <div className="lg:col-span-1 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                     <h3 className="text-[18px] font-black text-[#1c1d22] mb-6 flex items-center gap-2">
                        <ArrowUpRight className="text-indigo-600" size={20} />
                        Withdraw Earnings
                     </h3>

                     <form onSubmit={handleRequestPayout} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Payout Gateway</label>
                           <select 
                             value="USDT (TRC-20)"
                             disabled
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-bold text-[#1c1d22] transition-colors cursor-not-allowed"
                          >
                             <option value="USDT (TRC-20)">USDT TRC-20 (Exclusive Affiliate Payout)</option>
                           </select>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Cashout Amount (USDT)</label>
                           <input 
                             type="number" 
                             step="any"
                             value={payoutAmount}
                             onChange={(e) => setPayoutAmount(e.target.value)}
                             placeholder={`Min $100`}
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-black text-[#1c1d22] transition-all"
                           />
                           <p className="text-[10px] text-gray-400 font-bold ml-1">
                              Your Balance: ${getConvertedBalance(affiliateBalance, '$').toFixed(2)}
                           </p>
                        </div>

                        {/* Conditional details input */}
                        {false && (
                           <div className="space-y-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{payoutGateway} Wallet Number</label>
                              <input 
                                type="text" 
                                value={payoutDetails.mobileNumber}
                                onChange={(e) => setPayoutDetails({...payoutDetails, mobileNumber: e.target.value})}
                                placeholder="e.g. 01XXXXXXXXX"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-mono text-[#1c1d22] transition-all"
                              />
                           </div>
                        )}

                        {payoutGateway === 'USDT (TRC-20)' && (
                           <div className="space-y-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">USDT TRC-20 Destination Address</label>
                              <input 
                                type="text" 
                                value={payoutDetails.walletAddress}
                                onChange={(e) => setPayoutDetails({...payoutDetails, walletAddress: e.target.value})}
                                placeholder="e.g. Txxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-mono text-[12px] text-[#1c1d22] transition-all"
                              />
                           </div>
                        )}

                        <button 
                          type="submit" 
                          disabled={isSubmittingPayout || affiliateBalance <= 0}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-[13px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2"
                        >
                           {isSubmittingPayout ? 'Processing...' : 'Submit Cashout Request'}
                        </button>
                     </form>
                  </div>

                  {/* History Table block */}
                  <div className="lg:col-span-2 bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                     <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-[18px] font-black text-[#1c1d22]">Withdrawal Audits</h3>
                        <span className="text-[11px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest font-mono">Global Ledger</span>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30 font-mono">
                                 <th className="px-8 py-5">Initiated</th>
                                 <th className="px-8 py-5 text-right">Amount</th>
                                 <th className="px-8 py-5">Mechanism</th>
                                 <th className="px-8 py-5">Details</th>
                                 <th className="px-8 py-5">Verification</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {payoutRequests.length > 0 ? (
                                 payoutRequests.map((req, i) => {
                                    const dateStr = (req.createdAt && typeof req.createdAt.toDate === 'function') 
                                         ? req.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                         : 'Pending';
                                    return (
                                        <tr key={`payout-req-row-${i}`} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="px-8 py-5 text-[13px] text-gray-500 font-bold">{dateStr}</td>
                                          <td className="px-8 py-5 text-right font-black text-[#1c1d22] text-[14px]">
                                             $ {getConvertedBalance(req.amount || 0, '$').toFixed(2)}
                                          </td>
                                          <td className="px-8 py-5">
                                             <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-gray-100 text-gray-600 font-mono">
                                                {req.gateway}
                                             </span>
                                          </td>
                                          <td className="px-8 py-5 text-[12px] font-semibold text-gray-500 max-w-[180px] truncate" title={req.details}>
                                             {req.details}
                                          </td>
                                          <td className="px-8 py-5">
                                             {req.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-50 text-amber-600 uppercase tracking-widest">
                                                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                   Auditing
                                                </span>
                                             )}
                                             {req.status === 'completed' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest">
                                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                   Disbursed
                                                </span>
                                             )}
                                             {req.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-600 uppercase tracking-widest" title={req.rejectReason || 'Security audit failed'}>
                                                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                                   Rejected
                                                </span>
                                             )}
                                          </td>
                                       </tr>
                                    );
                                 })
                              ) : (
                                 <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold">
                                       No withdrawal dispersals found
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'support' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeading 
                icon={Headphones} 
                title={t('support_desk')} 
                desc={t('support_desk_desc')} 
              />
              
              {/* Main Support Card */}
              <div className="bg-[#1a2233] rounded-[36px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/10">
                 <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-[70px] pointer-events-none"></div>
                 <div className="absolute right-10 bottom-6 opacity-5 pointer-events-none hidden md:block">
                    <Headphones size={240} />
                 </div>

                 <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[11px] font-black uppercase tracking-widest mb-6">
                       <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                       24/7 Dedicated Support Active
                    </div>

                    <h2 className="text-[28px] md:text-[36px] font-black tracking-tight text-white mb-3">
                       {t('need_help_account')}
                    </h2>

                    <p className="text-gray-300 text-[15px] md:text-[16px] leading-relaxed mb-8 font-medium">
                       {t('support_sub_desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                       <button 
                          onClick={() => setView('new_ticket')}
                          className="px-8 py-4 bg-[#3b66f5] hover:bg-[#3256d1] text-white font-black text-[14px] uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/30 transition-all transform active:scale-95"
                       >
                          <Plus size={18} strokeWidth={3} /> {t('open_support_ticket')}
                       </button>

                       <button 
                          onClick={() => setView('tickets')}
                          className="px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-[14px] rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
                       >
                          <History size={16} /> {t('my_support_tickets')}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Assistance Topics Grid */}
              <div className="space-y-4">
                 <h3 className="text-[20px] font-black text-[#1a2233] tracking-tight px-1">
                    {t('partner_topics')}
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm space-y-3">
                       <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <Zap size={22} />
                       </div>
                       <h4 className="text-[16px] font-black text-[#1a2233]">{t('higher_commissions')}</h4>
                       <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                          {t('higher_commissions_desc')}
                       </p>
                    </div>

                    <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm space-y-3">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <CreditCard size={22} />
                       </div>
                       <h4 className="text-[16px] font-black text-[#1a2233]">{t('priority_payouts')}</h4>
                       <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                          {t('priority_payouts_desc')}
                       </p>
                    </div>

                    <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm space-y-3">
                       <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3b66f5] flex items-center justify-center font-bold">
                          <Image size={22} />
                       </div>
                       <h4 className="text-[16px] font-black text-[#1a2233]">{t('custom_promo_materials')}</h4>
                       <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                          {t('custom_promo_desc')}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
         )}

        {activeTab === 'rules' && (
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center">
                 <h2 className="text-[32px] font-black tracking-tighter text-[#1c1d22] mb-3">{t('program_rules_terms')}</h2>
                 <p className="text-[15px] text-gray-500 font-medium">{t('rules_policies')}</p>
              </div>

              <div className="space-y-6">
                 {/* Tier Levels Announcement Banner */}
                 <div className="bg-gradient-to-r from-[#1c1d22] to-[#252830] rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg border border-white/5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                       <div>
                          <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 text-[#ffcf00] border border-[#ffcf00]/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3">
                             <Award size={14} /> Official Operating Levels
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2">4 Commission Levels & System Rules</h3>
                          <p className="text-gray-400 text-sm max-w-xl">
                             From Level 1 Bronze (50% RevShare) to Level 4 Diamond (up to 80% RevShare & $150 CPA), see exact qualifying FTDs, 30-day cookie tracking rules, and backend S2S parameters.
                          </p>
                       </div>
                       <a 
                          href="/affiliate-rules" 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-[#ffcf00] hover:bg-[#e6b800] text-black font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 shadow-lg shadow-[#ffcf00]/10"
                       >
                          Open Full Rulebook <ExternalLink size={14} />
                       </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
                       <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-gray-400 block mb-0.5">Level 1 (Bronze)</span>
                          <span className="font-black text-[#ffcf00] text-base">50% RevShare</span>
                          <span className="text-gray-400 block text-[10px]">1 – 10 FTDs/mo</span>
                       </div>
                       <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-gray-400 block mb-0.5">Level 2 (Silver)</span>
                          <span className="font-black text-slate-300 text-base">60% RevShare</span>
                          <span className="text-gray-400 block text-[10px]">11 – 50 FTDs/mo</span>
                       </div>
                       <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-gray-400 block mb-0.5">Level 3 (Gold)</span>
                          <span className="font-black text-yellow-400 text-base">70% RevShare</span>
                          <span className="text-gray-400 block text-[10px]">51 – 100 FTDs/mo</span>
                       </div>
                       <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-gray-400 block mb-0.5">Level 4 (Diamond)</span>
                          <span className="font-black text-emerald-400 text-base">Up to 80%</span>
                          <span className="text-gray-400 block text-[10px]">101+ FTDs/mo</span>
                       </div>
                    </div>
                 </div>

                 {/* Commission Models */}
                 <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-black text-[#1c1d22] mb-6 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Wallet size={16} />
                       </div>
                       1. {t('revenue_models')}
                    </h3>
                    <div className="space-y-4">
                       <div className="bg-gray-50 rounded-2xl p-5">
                          <h4 className="font-bold text-[#1c1d22] mb-1">{t('revenue_share')}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">{t('revshare_desc')}</p>
                       </div>
                       <div className="bg-gray-50 rounded-2xl p-5">
                          <h4 className="font-bold text-[#1c1d22] mb-1">{t('turnover')}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">{t('turnover_desc')}</p>
                       </div>
                       <div className="bg-gray-50 rounded-2xl p-5">
                          <h4 className="font-bold text-[#1c1d22] mb-1">{t('sub_affiliates')}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">{t('sub_affiliates_desc')}</p>
                       </div>
                    </div>
                 </div>

                 {/* Payout Rules */}
                 <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-black text-[#1c1d22] mb-6 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Banknote size={16} />
                       </div>
                       2. {t('payout_rules')}
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                       <li className="flex gap-3"><span className="text-emerald-500 font-black">✓</span> {t('payout_rule_weekly')}</li>
                       <li className="flex gap-3"><span className="text-emerald-500 font-black">✓</span> {t('payout_rule_methods')}</li>
                       <li className="flex gap-3"><span className="text-emerald-500 font-black">✓</span> {t('payout_rule_traders')}</li>
                       <li className="flex gap-3"><span className="text-emerald-500 font-black">✓</span> {t('payout_rule_holds')}</li>
                    </ul>
                 </div>

                 {/* Prohibitions */}
                 <div className="bg-white rounded-[32px] p-8 border border-red-50 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-black text-red-600 mb-6 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                          <AlertTriangle size={16} />
                       </div>
                       3. {t('traffic_prohibitions')}
                    </h3>
                    <div className="space-y-4">
                       <div className="p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-2xl">
                          <h4 className="font-bold text-red-900 mb-1">{t('no_self_referral')}</h4>
                          <p className="text-sm text-red-700/80">{t('no_self_referral_desc')}</p>
                       </div>
                       <div className="p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-2xl">
                          <h4 className="font-bold text-red-900 mb-1">{t('no_brand_bidding')}</h4>
                          <p className="text-sm text-red-700/80">{t('no_brand_bidding_desc')}</p>
                       </div>
                       <div className="p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-2xl">
                          <h4 className="font-bold text-red-900 mb-1">{t('no_spam')}</h4>
                          <p className="text-sm text-red-700/80">{t('no_spam_desc')}</p>
                       </div>
                    </div>
                 </div>

              </div>

              <div className="bg-[#1c1d22] rounded-[32px] p-8 md:p-10 text-white text-center shadow-xl border border-white/5">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                    <ShieldAlert size={32} />
                 </div>
                 <h3 className="text-[22px] font-black tracking-tight mb-3">{t('compliance_key')}</h3>
                 <p className="text-gray-400 text-[15px] max-w-sm mx-auto mb-8">{t('compliance_desc')}</p>
                 <button onClick={() => setActiveTab('support')} className="bg-white text-[#1c1d22] font-black px-10 py-5 rounded-[22px] text-[15px] uppercase tracking-widest hover:bg-gray-100 transition-all transform active:scale-95 shadow-xl shadow-black/20">
                    {t('contact_compliance')}
                 </button>
              </div>
           </div>
        )}

      {/* Earnings Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalculator(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="bg-[#1c1d22] p-8 md:p-10 text-white relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px]"></div>
                 <button 
                  onClick={() => setShowCalculator(false)}
                  className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5 hover:bg-white/10"
                 >
                   <X size={20} />
                 </button>
                 <h2 className="text-[28px] font-black tracking-tight mb-2">Earnings Calculator</h2>
                 <p className="text-gray-400 font-medium text-[15px]">Estimate your potential revenue share earnings</p>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                 <div className="space-y-6">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <label className="text-[13px] font-black text-[#1c1d22] uppercase tracking-[0.15em]">Referrals Count</label>
                          <span className="text-indigo-600 font-black text-[18px]">{calcValues.referrals}</span>
                       </div>
                       <input 
                          type="range" 
                          min="1" 
                          max="500" 
                          value={calcValues.referrals}
                          onChange={(e) => setCalcValues({ ...calcValues, referrals: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                       />
                    </div>

                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <label className="text-[13px] font-black text-[#1c1d22] uppercase tracking-[0.15em]">Month Volume / Ref</label>
                          <span className="text-indigo-600 font-black text-[18px]">$ {calcValues.volumePerRef}</span>
                       </div>
                       <input 
                          type="range" 
                          min="100" 
                          max="10000" 
                          step="100"
                          value={calcValues.volumePerRef}
                          onChange={(e) => setCalcValues({ ...calcValues, volumePerRef: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                       <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Network Volume</p>
                       <p className="text-[22px] font-black text-[#1c1d22]">$ {(calcValues.referrals * calcValues.volumePerRef).toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-[24px] border border-emerald-100">
                       <p className="text-[11px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Your Monthly Share</p>
                       <p className="text-[22px] font-black text-emerald-600">$ {((calcValues.referrals * calcValues.volumePerRef) * (getTier().share / 100)).toLocaleString()}</p>
                    </div>
                 </div>

                 <button 
                  onClick={() => { setShowCalculator(false); setActiveTab('links'); }}
                  className="w-full bg-[#1c1d22] text-white font-black py-5 rounded-[22px] text-[15px] uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-indigo-500/10"
                 >
                   Start Earning Today
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </main>

      {/* Selected Trader Details Modal */}
      {selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1a2233] p-6 md:p-8 text-white relative overflow-hidden flex-shrink-0">
              <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <button 
                onClick={() => setSelectedTrader(null)}
                className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all border border-white/10"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedTrader.photoURL || selectedTrader.photo_url || selectedTrader.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(selectedTrader.displayName || selectedTrader.email || 'Trader')} 
                    alt="Trader Avatar" 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">{selectedTrader.displayName || 'Referred Trader'}</h3>
                    {(selectedTrader.isFTD || (selectedTrader.totalDeposits || 0) > 0) && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        FTD Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{selectedTrader.email}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                    <span>UID: <strong className="text-indigo-400 font-mono">{selectedTrader.uid || selectedTrader.id}</strong></span>
                    <span>•</span>
                    <span>{t('joined')}: {new Date(selectedTrader.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              {/* 4 Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-1">Live Balance</span>
                  <span className="text-lg font-black text-emerald-900 tabular-nums">
                    ${parseFloat(selectedTrader.realBalance ?? selectedTrader.balance ?? 0).toFixed(2)}
                  </span>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block mb-1">Total Deposited</span>
                  <span className="text-lg font-black text-blue-900 tabular-nums">
                    ${parseFloat(selectedTrader.totalDeposits || 0).toFixed(2)}
                  </span>
                </div>

                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-1">Trade Volume</span>
                  <span className="text-lg font-black text-purple-900 tabular-nums">
                    ${parseFloat(selectedTrader.tradeVolume || 0).toLocaleString()}
                  </span>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block mb-1">Total PnL</span>
                  <span className={`text-lg font-black tabular-nums ${parseFloat(selectedTrader.traderNetPnL || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {parseFloat(selectedTrader.traderNetPnL || 0) >= 0 ? '+' : ''}${parseFloat(selectedTrader.traderNetPnL || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Affiliate Commission Breakdown for this User */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">Commissions Generated from this Trader</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">⏳ 7-Day Hold</span>
                    <span className="text-base font-black text-amber-600 tabular-nums">
                      ${parseFloat(selectedTrader.holdCommission || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Under hold security period</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">✓ Settled & Available</span>
                    <span className="text-base font-black text-emerald-600 tabular-nums">
                      ${parseFloat(selectedTrader.settledCommission || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Ready for payout/transfer</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Lifetime</span>
                    <span className="text-base font-black text-indigo-600 tabular-nums">
                      ${parseFloat(selectedTrader.totalCommission || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">All commissions to date</span>
                  </div>
                </div>
              </div>

              {/* Account Details Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block font-bold">Total Trades Count</span>
                  <span className="font-black text-gray-900 text-sm mt-0.5 block">{selectedTrader.tradeCount || 0} trades</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block font-bold">Withdrawals Total</span>
                  <span className="font-black text-gray-900 text-sm mt-0.5 block">${parseFloat(selectedTrader.totalWithdrawals || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedTrader(null)}
                  className="w-full py-3.5 rounded-xl bg-[#1a2233] text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Desktop */}
      <footer className="hidden md:block border-t border-gray-200 mt-28 py-14 bg-white">
        <div className="max-w-7xl mx-auto px-10 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Logo size={24} />
               <span className="font-black tracking-tighter text-[20px] text-[#1c1d22]">Bivaax</span>
            </div>
            <div className="flex items-center gap-10">
               {['About Network', 'Partner Terms', 'Support', 'Asset Center'].map(item => (
                 <button key={item} className="text-[12px] font-black text-gray-400 hover:text-[#1c1d22] transition-colors tracking-widest uppercase">{item}</button>
               ))}
            </div>
            <p className="text-[12px] font-black text-gray-400 tracking-widest uppercase">© 2026 Bivaax • GLOBAL PARTNER NETWORK</p>
          </div>
          <div className="text-[11px] text-gray-400 leading-relaxed font-medium pt-8 border-t border-gray-50 border-dashed">
            The Bivaax Partner Program is subject to the Affiliate Terms of Service. Commissions are calculated based on net revenue generated by referred clients. Elite status is granted based on volume performance.
          </div>
        </div>
      </footer>

      {/* Interactive Payment & Cashout Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden z-10 border border-gray-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-black text-[#1c1d22]">Partner Payout & Cashout</h3>
                    <p className="text-xs text-gray-500">Manage earnings, instant balance transfer, and withdrawals</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-gray-100 px-6 sm:px-8 bg-gray-50/30 gap-6">
                <button
                  onClick={() => setPaymentModalTab('withdraw')}
                  className={`py-4 font-black text-xs uppercase tracking-widest border-b-2 transition-all ${paymentModalTab === 'withdraw' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  Request Withdrawal
                </button>
                <button
                  onClick={() => setPaymentModalTab('transfer')}
                  className={`py-4 font-black text-xs uppercase tracking-widest border-b-2 transition-all ${paymentModalTab === 'transfer' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  Instant Transfer to Trading
                </button>
                <button
                  onClick={() => setPaymentModalTab('history')}
                  className={`py-4 font-black text-xs uppercase tracking-widest border-b-2 transition-all ${paymentModalTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  Payout History
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                {paymentModalTab === 'withdraw' && (
                  <form onSubmit={(e) => {
                    handleRequestPayout(e);
                    setIsPaymentModalOpen(false);
                  }} className="space-y-6">
                    <div className="bg-indigo-50/60 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-indigo-900/60 block">Available Balance</span>
                        <span className="text-2xl font-black text-indigo-900">${availableBalance.toFixed(2)}</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-indigo-600 text-white px-3 py-1 rounded-full">Min $10.00</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Select Gateway</label>
                      <select 
                        value="USDT (TRC-20)"
                        disabled
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 font-bold text-[#1c1d22] cursor-not-allowed"
                      >
                        <option value="USDT (TRC-20)">USDT TRC-20 (Exclusive Affiliate Payout)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount (USDT)</label>
                      <input 
                        type="number"
                        step="any"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="Min $10.00"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 font-black text-[#1c1d22]"
                      />
                    </div>

                    {(payoutGateway.includes('USDT') || payoutGateway.includes('Binance')) && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Wallet Address / Binance Pay ID</label>
                        <input 
                          type="text"
                          value={payoutDetails.walletAddress}
                          onChange={(e) => setPayoutDetails({...payoutDetails, walletAddress: e.target.value})}
                          placeholder="e.g. Txxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 font-mono text-xs text-[#1c1d22]"
                        />
                      </div>
                    )}

                    {(payoutGateway === 'bKash' || payoutGateway === 'Nagad' || payoutGateway === 'Rocket') && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{payoutGateway} Number</label>
                          <input 
                            type="text"
                            value={payoutDetails.mobileNumber}
                            onChange={(e) => setPayoutDetails({...payoutDetails, mobileNumber: e.target.value})}
                            placeholder="01XXXXXXXXX"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 font-bold text-[#1c1d22]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Account Type</label>
                          <select 
                            onChange={(e) => setPayoutDetails({...payoutDetails, accountName: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 font-bold text-[#1c1d22]"
                          >
                            <option value="Personal">Personal</option>
                            <option value="Agent">Agent</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {payoutGateway === 'Bank Transfer' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Bank Name</label>
                          <input 
                            type="text"
                            value={payoutDetails.bankName}
                            onChange={(e) => setPayoutDetails({...payoutDetails, bankName: e.target.value})}
                            placeholder="e.g. Dutch Bangla Bank"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Account Number</label>
                          <input 
                            type="text"
                            value={payoutDetails.accountNumber}
                            onChange={(e) => setPayoutDetails({...payoutDetails, accountNumber: e.target.value})}
                            placeholder="e.g. 1234567890"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 font-mono text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingPayout || availableBalance < 10}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20"
                    >
                      {isSubmittingPayout ? 'Submitting Request...' : 'Confirm Withdrawal Request'}
                    </button>
                  </form>
                )}

                {paymentModalTab === 'transfer' && (
                  <div className="space-y-6 text-center py-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <Zap size={32} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black text-[#1c1d22]">Instant Transfer to Live Balance</h4>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">Transfer your available affiliate commissions (${availableBalance.toFixed(2)}) directly to your main trading account instantly with 0% fees.</p>
                    </div>
                    <button 
                      onClick={() => {
                        handleTransferEarnings();
                        setIsPaymentModalOpen(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20"
                    >
                      Transfer ${availableBalance.toFixed(2)} Instantly
                    </button>
                  </div>
                )}

                {paymentModalTab === 'history' && (
                  <div className="space-y-4">
                    <h4 className="font-black text-[#1c1d22] text-sm uppercase tracking-wider">Recent Payout Requests</h4>
                    {payoutRequests.length > 0 ? (
                      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                        {payoutRequests.map((req, i) => (
                          <div key={i} className="py-3 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-[#1c1d22] block">{req.gateway}</span>
                              <span className="text-gray-400 text-[10px] font-mono">{req.details}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-indigo-600 block">${req.amount.toFixed(2)}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-50 text-yellow-700">{req.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-400 text-xs font-medium">No withdrawal requests found.</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}


