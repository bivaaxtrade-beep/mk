import React from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, ArrowRight, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ReferralStatsCard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0a0a0f] border border-[#1a1a24] rounded-[32px] p-6 relative overflow-hidden group"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-yellow-500/10 transition-colors duration-500" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Partnership Program</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Growth Statistics</p>
          </div>
        </div>
        <Link 
          to="/affiliate" 
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all group/btn"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Total Invites</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {user.referralCount || 0}
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Pending Rewards</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">{user.currency || 'USD'}</span>
            <p className="text-2xl font-black text-white tracking-tight">
              {(user.affiliateBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Invite Code</span>
          <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">{user.referralCode || user.affiliateId || user.referral_code || user.affiliate_id || 'NOT_SET'}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Lifetime Profit</span>
          <p className="text-xs font-black text-white">
            {user.currency || 'USD'} {(user.totalAffiliateEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralStatsCard;
