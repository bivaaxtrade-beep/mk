import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Search, 
  Check, 
  X, 
  Eye, 
  Lock, 
  LayoutDashboard, 
  Activity, 
  Users, 
  Wallet, 
  CreditCard, 
  MessageCircle, 
  ExternalLink, 
  Zap, 
  UserCheck, 
  Database, 
  Megaphone, 
  Image, 
  GraduationCap, 
  Gift, 
  Trophy, 
  FileText, 
  Settings2, 
  HardDrive,
  Trash2,
  CheckCheck,
  AlertTriangle
} from 'lucide-react';
import { doc, setDoc, deleteDoc, updateDoc } from '../firebase';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

export interface FeatureDefinition {
  id: string;
  name: string;
  bengaliName: string;
  category: 'core' | 'finance' | 'partners' | 'content' | 'system';
  icon: any;
  description: string;
  bengaliDescription: string;
}

export const ALL_ADMIN_FEATURES: FeatureDefinition[] = [
  // Core Operations
  { 
    id: 'stats', 
    name: 'Dashboard Overview', 
    bengaliName: 'ড্যাশবোর্ড ও অ্যানালিটিক্স', 
    category: 'core', 
    icon: LayoutDashboard,
    description: 'View trading volume, active users, win/loss stats and server health',
    bengaliDescription: 'ট্রেডিং ভলিউম, অ্যাক্টিভ ইউজার, উইন/লস স্ট্যাটাস ও সার্ভার হেলথ দেখতে পারবে'
  },
  { 
    id: 'market', 
    name: 'Real-time Markets', 
    bengaliName: 'লাইভ মার্কেটস ও প্রাইস', 
    category: 'core', 
    icon: Activity,
    description: 'View live asset prices, OTC markets, volatility and quote streams',
    bengaliDescription: 'রিয়েল-টাইম অ্যাসেট রেট, ওটিসি মার্কেট এবং প্রাইস কোটেশন দেখতে পারবে'
  },
  { 
    id: 'users', 
    name: 'Traders & Wallets', 
    bengaliName: 'ট্রেডার্স ও ব্যালেন্স হিস্ট্রি', 
    category: 'core', 
    icon: Users,
    description: 'View registered users list, user profiles, emails and current wallet balances',
    bengaliDescription: 'রেজিস্ট্রার্ড সকল ইউজারদের তালিকা, প্রোফাইল তথ্য ও বর্তমান ব্যালেন্স দেখতে পারবে'
  },
  { 
    id: 'signals', 
    name: 'Trading Signals', 
    bengaliName: 'ট্রেডিং সিগন্যালস সেন্টার', 
    category: 'core', 
    icon: Zap,
    description: 'View active trading signals, accuracy percentages and market recommendations',
    bengaliDescription: 'চলমান ট্রেডিং সিগন্যাল, অ্যাকুরেসি রেট ও মার্কেট নির্দেশনা দেখতে পারবে'
  },
  { 
    id: 'copytrading', 
    name: 'Copy Masters', 
    bengaliName: 'কপি ট্রেডিং মাস্টার্স', 
    category: 'core', 
    icon: UserCheck,
    description: 'View verified master traders, win rates, followers and copied positions',
    bengaliDescription: 'ভেরিফাইড মাস্টার ট্রেডারদের তালিকা, উইন রেট এবং ফলোয়ার তথ্য দেখতে পারবে'
  },

  // Finance & Identity Verification
  { 
    id: 'finance', 
    name: 'Finance (Deposits & Withdrawals)', 
    bengaliName: 'ফিন্যান্স ও লেনদেন তালিকা', 
    category: 'finance', 
    icon: Wallet,
    description: 'View user deposit requests, withdrawal queue, payment hashes and tx statuses',
    bengaliDescription: 'ইউজারদের ডিপোজিট ও উইথড্রয়াল রিকোয়েস্ট তালিকা এবং ট্রানজ্যাকশন স্ট্যাটাস দেখতে পারবে'
  },
  { 
    id: 'deposits', 
    name: 'Deposit Gateways', 
    bengaliName: 'পেমেন্ট গেটওয়ে মেথডস', 
    category: 'finance', 
    icon: CreditCard,
    description: 'View supported deposit channels (bKash, Nagad, Rocket, Crypto, Binance Pay)',
    bengaliDescription: 'বিকাশ, নগদ, রকেট ও ক্রিপ্টো ডিপোজিট চ্যানেলগুলোর কনফিগারেশন দেখতে পারবে'
  },
  { 
    id: 'kyc', 
    name: 'KYC Operations', 
    bengaliName: 'কেওয়াইসি ভেরিফিকেশন', 
    category: 'finance', 
    icon: ShieldCheck,
    description: 'View user submitted National ID cards, passports and verification status',
    bengaliDescription: 'ইউজারদের সাবমিট করা এনআইডি, পাসপোর্ট এবং ভেরিফিকেশন আবেদন দেখতে পারবে'
  },

  // Partners & Customer Support
  { 
    id: 'affiliate', 
    name: 'Affiliate & Partner Network', 
    bengaliName: 'অ্যাফিলিয়েট ও পার্টনার্স', 
    category: 'partners', 
    icon: ExternalLink,
    description: 'View affiliate partner accounts, referred trader counts, commission rates and payouts',
    bengaliDescription: 'অ্যাফিলিয়েট পার্টনার্স, রেফারেল কাউন্ট, অর্জিত কমিশন এবং পেআউট রিকোয়েস্ট দেখতে পারবে'
  },
  { 
    id: 'tickets', 
    name: 'Support Desk Tickets', 
    bengaliName: 'সাপোর্ট টিকিটস ও চ্যাট', 
    category: 'partners', 
    icon: MessageCircle,
    description: 'View user support tickets, help desk queries and customer communication logs',
    bengaliDescription: 'ইউজারদের সাপোর্ট টিকিট, অভিযোগ ও মেসেজ কনভারসেশন দেখতে পারবে'
  },

  // Content & Promotions
  { 
    id: 'banners', 
    name: 'Asset Sources & Banners', 
    bengaliName: 'ব্যানার ও মিডিয়া অ্যাসেটস', 
    category: 'content', 
    icon: Database,
    description: 'View homepage promo banners, carousel slides and promotional graphics',
    bengaliDescription: 'হোমপেজ ব্যানার, স্লাইডার এবং প্রমোশনাল গ্রাফিক্স দেখতে পারবে'
  },
  { 
    id: 'news', 
    name: 'Market News Engine', 
    bengaliName: 'মার্কেট নিউজ ও আপডেট', 
    category: 'content', 
    icon: Megaphone,
    description: 'View published global finance articles and market sentiment updates',
    bengaliDescription: 'প্রকাশিত আন্তর্জাতিক ফাইন্যান্সিয়াল নিউজ ও মার্কেট আপডেট দেখতে পারবে'
  },
  { 
    id: 'stories', 
    name: 'Activities & Stories', 
    bengaliName: 'অ্যাক্টিভিটিজ ও ট্রেডার স্টোরিজ', 
    category: 'content', 
    icon: Image,
    description: 'View community success stories, trader badges and media announcements',
    bengaliDescription: 'কমিউনিটি স্টোরি, ট্রেডারদের অর্জন ও মিডিয়া পোস্ট দেখতে পারবে'
  },
  { 
    id: 'education', 
    name: 'Trade Academy', 
    bengaliName: 'ট্রেড একাডেমি ও টিউটোরিয়াল', 
    category: 'content', 
    icon: GraduationCap,
    description: 'View learning curriculum, video tutorials and beginner trading guides',
    bengaliDescription: 'ট্রেডিং ভিডিও টিউটোরিয়াল ও লার্নিং গাইড দেখতে পারবে'
  },
  { 
    id: 'promotions', 
    name: 'Dynamic Bonuses', 
    bengaliName: 'ডায়নামিক ডিপোজিট বোনাস', 
    category: 'content', 
    icon: Zap,
    description: 'View active deposit bonuses and promotional match campaigns',
    bengaliDescription: 'অ্যাক্টিভ ডিপোজিট বোনাস ক্যাম্পেইন দেখতে পারবে'
  },
  { 
    id: 'promos', 
    name: 'Promo Codes', 
    bengaliName: 'প্রোমো কোডস ও ভাউচার', 
    category: 'content', 
    icon: Gift,
    description: 'View promo voucher codes, usage quotas and expiry configurations',
    bengaliDescription: 'প্রোমো ভাউচার কোড, ব্যবহারের সংখ্যা ও মেয়াদ দেখতে পারবে'
  },
  { 
    id: 'tournaments', 
    name: 'Arena Tournaments', 
    bengaliName: 'ট্রেডিং এরিনা টুর্নামেন্ট', 
    category: 'content', 
    icon: Trophy,
    description: 'View trading tournaments, prize pools and participant leaderboards',
    bengaliDescription: 'ট্রেডিং টুর্নামেন্ট, প্রাইজ পুল ও লিডারবোর্ড র‍্যাঙ্কিং দেখতে পারবে'
  },

  // System & Legal Pages
  { 
    id: 'pages', 
    name: 'About Us & Company Info', 
    bengaliName: 'অ্যাবাউট ও কোম্পানি তথ্য', 
    category: 'system', 
    icon: FileText,
    description: 'View official About Us, contact details and corporate background',
    bengaliDescription: 'কোম্পানি পরিচিতি, অফিসের ঠিকানা ও যোগাযোগ তথ্য দেখতে পারবে'
  },
  { 
    id: 'client_agreement', 
    name: 'Client Agreement', 
    bengaliName: 'ক্লায়েন্ট টার্মস ও চুক্তি', 
    category: 'system', 
    icon: FileText,
    description: 'View trader service agreement terms and user conditions',
    bengaliDescription: 'ট্রেডার সার্ভিস এগ্রিমেন্ট ও শর্তাবলী দেখতে পারবে'
  },
  { 
    id: 'aml_policy', 
    name: 'AML Policy', 
    bengaliName: 'অ্যান্টি-মানি লন্ডারিং পলিসি', 
    category: 'system', 
    icon: Shield,
    description: 'View Anti-Money Laundering policies and compliance statements',
    bengaliDescription: 'অ্যান্টি-মানি লন্ডারিং রেগুলেশন পলিসি দেখতে পারবে'
  },
  { 
    id: 'logs', 
    name: 'Control Logs', 
    bengaliName: 'অডিট ও অ্যাক্টিভিটি লগস', 
    category: 'system', 
    icon: FileText,
    description: 'View timestamped administrative actions and system security audit trail',
    bengaliDescription: 'অ্যাডমিন অ্যাক্টিভিটি লগ এবং সিকিউরিটি অডিট ট্রেইল দেখতে পারবে'
  },
  { 
    id: 'snapshots', 
    name: 'System Snapshots', 
    bengaliName: 'সিস্টেম ব্যাকআপ ও স্ন্যাপশট', 
    category: 'system', 
    icon: HardDrive,
    description: 'View database backup records and disaster recovery checkpoints',
    bengaliDescription: 'ডাটাবেজ ব্যাকআপ রেকর্ড ও সিস্টেম রিকভারি স্ন্যাপশট দেখতে পারবে'
  },
  { 
    id: 'settings', 
    name: 'System Kernel Settings', 
    bengaliName: 'সিস্টেম কনফিগ ও সেটিংস', 
    category: 'system', 
    icon: Settings2,
    description: 'View core app config, currency ratios and maintenance states',
    bengaliDescription: 'সিস্টেমের মূল কনফিগারেশন ও কারেন্সি সেটিংস দেখতে পারবে'
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Features', bengaliLabel: 'সকল ফিচার' },
  { id: 'core', label: 'Core Operations', bengaliLabel: 'ট্রেডিং ও মার্কেট' },
  { id: 'finance', label: 'Finance & KYC', bengaliLabel: 'ফিন্যান্স ও কেওয়াইসি' },
  { id: 'partners', label: 'Partners & Support', bengaliLabel: 'পার্টনার্স ও সাপোর্ট' },
  { id: 'content', label: 'Content & Promos', bengaliLabel: 'কনটেন্ট ও প্রমোশন' },
  { id: 'system', label: 'System & Legal', bengaliLabel: 'সিস্টেম ও পলিসি' },
];

export interface AdminUser {
  id: string;
  uid?: string;
  email: string;
  role: string;
  viewOnly?: boolean;
  allowedFeatures?: Record<string, boolean>;
  permissions?: Record<string, boolean>;
  addedAt?: number;
  displayName?: string;
}

interface AdminPermissionsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  isOwner: boolean;
}

export const AdminPermissionsModal: React.FC<AdminPermissionsModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaved,
  isOwner
}) => {
  if (!isOpen || !user) return null;

  // Initialize features map
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const initialAllowed: Record<string, boolean> = useMemo(() => {
    const map: Record<string, boolean> = {};
    ALL_ADMIN_FEATURES.forEach(f => {
      if (user.allowedFeatures && user.allowedFeatures[f.id] !== undefined) {
        map[f.id] = !!user.allowedFeatures[f.id];
      } else if (user.permissions) {
        // Legacy conversion fallback
        if (f.id === 'stats') map[f.id] = true;
        else if (f.id === 'users') map[f.id] = !!user.permissions.canManageUsers;
        else if (f.id === 'finance') map[f.id] = !!(user.permissions.canManageFinance || user.permissions.canManageDeposits || user.permissions.canManageWithdrawals);
        else if (f.id === 'deposits') map[f.id] = !!user.permissions.canManageDeposits;
        else if (f.id === 'kyc') map[f.id] = !!user.permissions.canManageKYC;
        else if (f.id === 'market' || f.id === 'signals' || f.id === 'copytrading') map[f.id] = !!user.permissions.canManageMarkets;
        else if (f.id === 'tickets') map[f.id] = !!user.permissions.canManageSupport;
        else if (f.id === 'news' || f.id === 'education' || f.id === 'banners' || f.id === 'stories' || f.id === 'pages') map[f.id] = !!user.permissions.canManageContent;
        else if (f.id === 'settings' || f.id === 'logs') map[f.id] = !!user.permissions.canManageSystem;
        else map[f.id] = false;
      } else {
        map[f.id] = false;
      }
    });
    return map;
  }, [user]);

  const [allowedFeatures, setAllowedFeatures] = useState<Record<string, boolean>>(initialAllowed);

  const toggleFeature = (featureId: string) => {
    setAllowedFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  const handleAllowAll = () => {
    const updated: Record<string, boolean> = {};
    ALL_ADMIN_FEATURES.forEach(f => {
      updated[f.id] = true;
    });
    setAllowedFeatures(updated);
    toast.success('সকল ফিচারের ভিউ পারমিশন এলাও করা হয়েছে');
  };

  const handleRevokeAll = () => {
    const updated: Record<string, boolean> = {};
    ALL_ADMIN_FEATURES.forEach(f => {
      updated[f.id] = false;
    });
    setAllowedFeatures(updated);
    toast.success('সকল ফিচারের পারমিশন বাতিল করা হয়েছে');
  };

  const handleFinancePreset = () => {
    const updated: Record<string, boolean> = {};
    ALL_ADMIN_FEATURES.forEach(f => {
      updated[f.id] = ['stats', 'finance', 'deposits', 'kyc'].includes(f.id);
    });
    setAllowedFeatures(updated);
    toast.success('ফিন্যান্স ও কেওয়াইসি ভিউ পারমিশন সিলেক্ট করা হয়েছে');
  };

  const handleSupportPreset = () => {
    const updated: Record<string, boolean> = {};
    ALL_ADMIN_FEATURES.forEach(f => {
      updated[f.id] = ['stats', 'tickets', 'users', 'affiliate'].includes(f.id);
    });
    setAllowedFeatures(updated);
    toast.success('সাপোর্ট ও ইউজার্স ভিউ পারমিশন সিলেক্ট করা হয়েছে');
  };

  const handleSave = async () => {
    if (!isOwner) {
      toast.error('শুধুমাত্র ওনার অ্যাডমিন পারমিশন সেট করতে পারবেন');
      return;
    }

    setIsSaving(true);
    const userId = user.id || user.uid;

    try {
      // Prepare backward compatible permissions
      const legacyPerms = {
        canManageUsers: !!allowedFeatures.users,
        canManageStaff: false, // Only owner manages staff
        canManageFinance: !!allowedFeatures.finance,
        canManageContent: !!(allowedFeatures.banners || allowedFeatures.news || allowedFeatures.stories || allowedFeatures.education),
        canManageMarkets: !!(allowedFeatures.market || allowedFeatures.signals || allowedFeatures.copytrading),
        canManageSystem: !!allowedFeatures.settings,
        canManageDeposits: !!allowedFeatures.deposits,
        canManageWithdrawals: !!allowedFeatures.finance,
        canManageKYC: !!allowedFeatures.kyc,
        canManageSupport: !!allowedFeatures.tickets
      };

      const adminPayload = {
        id: userId,
        uid: userId,
        email: user.email,
        role: 'admin',
        viewOnly: true, // Crucial: User cannot control anything, only view allowed features
        allowedFeatures,
        permissions: legacyPerms,
        updatedAt: Date.now()
      };

      // 1. Save to Firestore
      await setDoc(doc(db, 'admins', userId), adminPayload, { merge: true });
      await updateDoc(doc(db, 'users', userId), { 
        role: 'admin',
        isAdmin: true,
        viewOnly: true,
        allowedFeatures
      }).catch(() => {});

      // 2. Call backend sync if available
      try {
        await fetch('/api/admin/staff/set-permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            uid: userId,
            email: user.email,
            isAdmin: true,
            viewOnly: true,
            allowedFeatures
          })
        });
      } catch (_) {}

      toast.success(`${user.email} এর অ্যাডমিন ভিউ পারমিশন সফলভাবে আপডেট করা হয়েছে!`);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving admin permissions:', err);
      toast.error(`পারমিশন সেভ করতে ব্যর্থ: ${err.message || 'অজানা ত্রুটি'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFeatures = ALL_ADMIN_FEATURES.filter(f => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = !searchFilter.trim() || 
      f.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
      f.bengaliName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const allowedCount = Object.values(allowedFeatures).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0f15] border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between gap-4 bg-gradient-to-r from-blue-950/20 via-transparent to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Shield size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Owner Management • ওনার কন্ট্রোল
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Lock size={10} /> View-Only Mode
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
                অ্যাডমিন ফিচার পারমিশন সেটআপ
              </h2>
              <p className="text-gray-400 text-xs font-medium">
                ইউজার: <span className="text-white font-bold">{user.email}</span> (ID: {user.id || user.uid})
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="px-6 md:px-8 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-xs leading-relaxed font-medium">
            <strong>নিরাপত্তা নীতি:</strong> এই অ্যাডমিন শুধুমাত্র আপনার অনুমোদিত ফিচারগুলো <strong>দেখতে (View Only)</strong> পারবে। কোনো ব্যালেন্স এডিট, ডিপোজিট/উইথড্রয়াল অনুমোদন বা সেটিংস <strong>কন্ট্রোল/পরিবর্তন করতে পারবে না</strong>।
          </p>
        </div>

        {/* Presets and Filter Bar */}
        <div className="p-6 border-b border-white/5 space-y-4 bg-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">কুইক সিলেক্ট:</span>
              <button 
                onClick={handleAllowAll}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <CheckCheck size={14} /> সব দেখতে পারবে ({ALL_ADMIN_FEATURES.length})
              </button>
              <button 
                onClick={handleFinancePreset}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <Wallet size={14} /> ফিন্যান্স ও কেওয়াইসি
              </button>
              <button 
                onClick={handleSupportPreset}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <MessageCircle size={14} /> সাপোর্ট ও ইউজার্স
              </button>
              <button 
                onClick={handleRevokeAll}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <X size={14} /> সব বন্ধ
              </button>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                অনুমোদিত: <span className="text-blue-400">{allowedCount}</span> / {ALL_ADMIN_FEATURES.length} টি ফিচার
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="ফিচারের নাম সার্চ করুন..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full bg-[#12131b] border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.bengaliLabel}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature List Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFeatures.map(f => {
            const isAllowed = !!allowedFeatures[f.id];
            const Icon = f.icon;

            return (
              <div 
                key={f.id}
                onClick={() => toggleFeature(f.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-4 group ${
                  isAllowed 
                    ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-md shadow-blue-500/5' 
                    : 'bg-[#12131b] border-white/5 text-gray-400 hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isAllowed 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/5 text-gray-400 group-hover:text-white'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-white tracking-tight">{f.bengaliName}</p>
                      <span className="text-[10px] text-gray-500 font-medium">({f.name})</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug mt-1 line-clamp-2">
                      {f.bengaliDescription}
                    </p>
                  </div>
                </div>

                {/* Switch indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                  <div className={`w-12 h-6 rounded-full transition-all flex items-center p-0.5 ${
                    isAllowed ? 'bg-blue-500 justify-end' : 'bg-white/10 justify-start'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-black">
                      {isAllowed ? <Check size={12} strokeWidth={3} /> : <X size={12} className="text-gray-400" />}
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${
                    isAllowed ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {isAllowed ? 'অনুমোদিত' : 'বন্ধ'}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredFeatures.length === 0 && (
            <div className="col-span-2 py-12 text-center text-gray-500 text-sm">
              কোনো ফিচার পাওয়া যায়নি
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/10 bg-[#0a0a0f] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Eye size={16} className="text-blue-400" />
            <span>মোট <strong>{allowedCount}</strong> টি ফিচার দেখার অনুমতি পাবে (ভিউ-অনলি)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs transition-all flex-1 sm:flex-none"
            >
              বাতিল (Cancel)
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              {isSaving ? (
                <span>সংরক্ষণ হচ্ছে...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>পারমিশন সেভ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
