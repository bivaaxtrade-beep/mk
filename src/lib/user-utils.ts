export const getNumericId = (uid: string): string => {
  if (!uid) return '';
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 1000000000).toString().padStart(9, '1');
};

export function mapUserForFrontend(user: any) {
  if (!user) return null;
  const uid = user.uid || user.id || 'user_' + Math.random().toString(36).substring(2, 9);
  const realBal = parseFloat(user.real_balance ?? user.realBalance ?? user.balance ?? 0);
  const demoBal = parseFloat(user.demo_balance ?? user.demoBalance ?? 10000);
  const numericId = user.numeric_id || user.numericId || getNumericId(uid);
  return {
    bxCoins: parseInt(user.bx_coins ?? user.bxCoins ?? 0),
    riskFreeTrades: parseInt(user.risk_free_trades ?? user.riskFreeTrades ?? 0),
    id: uid,
    uid: uid,
    numericId,
    email: user.email || '',
    displayName: user.display_name || user.displayName || user.first_name || user.email?.split('@')[0] || 'User',
    firstName: user.first_name || user.firstName || '',
    lastName: user.last_name || user.lastName || '',
    gender: (user.gender && user.gender !== '--' && user.gender !== '---') ? user.gender : '---',
    dob: (() => {
      if (!user.dob) return null;
      try {
        return typeof user.dob === 'string' ? JSON.parse(user.dob) : user.dob;
      } catch (e) {
        return user.dob;
      }
    })(),
    birthDay: (() => {
      if (user.birth_day && user.birth_day !== '--' && user.birth_day !== '---') return String(user.birth_day);
      if (user.birthDay && user.birthDay !== '--' && user.birthDay !== '---') return String(user.birthDay);
      if (!user.dob) return '---';
      try {
        const obj = typeof user.dob === 'string' ? JSON.parse(user.dob) : user.dob;
        return (obj?.day && obj.day !== '--' && obj.day !== '---') ? String(obj.day) : '---';
      } catch (e) { return '---'; }
    })(),
    birthMonth: (() => {
      if (user.birth_month && user.birth_month !== '--' && user.birth_month !== '---') return String(user.birth_month);
      if (user.birthMonth && user.birthMonth !== '--' && user.birthMonth !== '---') return String(user.birthMonth);
      if (!user.dob) return '---';
      try {
        const obj = typeof user.dob === 'string' ? JSON.parse(user.dob) : user.dob;
        return (obj?.month && obj.month !== '--' && obj.month !== '---') ? String(obj.month) : '---';
      } catch (e) { return '---'; }
    })(),
    birthYear: (() => {
      if (user.birth_year && user.birth_year !== '--' && user.birth_year !== '---') return String(user.birth_year);
      if (user.birthYear && user.birthYear !== '--' && user.birthYear !== '---') return String(user.birthYear);
      if (!user.dob) return '---';
      try {
        const obj = typeof user.dob === 'string' ? JSON.parse(user.dob) : user.dob;
        return (obj?.year && obj.year !== '--' && obj.year !== '---') ? String(obj.year) : '---';
      } catch (e) { return '---'; }
    })(),
    timeZone: user.time_zone || user.timeZone || 'UTC',
    language: user.language || 'en',
    newsletter: user.newsletter !== undefined ? !!user.newsletter : (user.emailNewsletter !== undefined ? !!user.emailNewsletter : true),
    allowNotifications: user.allow_notifications !== undefined ? !!user.allow_notifications : (user.allowNotifications !== undefined ? !!user.allowNotifications : true),
    nickname: user.nickname || user.displayName,
    photoURL: user.photo_url || user.photoURL || '',
    balance: realBal,
    realBalance: realBal,
    demoBalance: demoBal,
    currency: user.currency || 'USD',
    isVerified: !!user.is_verified || !!user.isVerified || !!user.emailVerified || !!user.is_email_verified,
    isEmailVerified: !!user.is_email_verified || !!user.isEmailVerified || !!user.emailVerified || !!user.is_verified,
    isNidVerified: !!user.is_nid_verified || !!user.isNidVerified || (user.kyc_status === 'approved' || user.kycStatus === 'approved'),
    isAdmin: !!user.is_admin || !!user.isAdmin,
    kycStatus: user.kyc_status || user.kycStatus || 'unverified',
    affiliateId: user.affiliate_id || user.affiliateId || user.referral_code || user.referralCode,
    referralCode: user.referral_code || user.referralCode,
    referralCount: user.referral_count || user.referralCount || 0,
    affiliateBalance: parseFloat(user.affiliate_balance ?? user.affiliateBalance ?? 0),
    totalAffiliateEarnings: parseFloat(user.total_affiliate_earnings ?? user.totalAffiliateEarnings ?? 0),
    totalLiveVolume: parseFloat(user.total_live_volume || user.totalLiveVolume || user.trade_volume || user.tradeVolume || 0),
    tradeVolume: parseFloat(user.total_live_volume || user.totalLiveVolume || user.trade_volume || user.tradeVolume || 0),
    totalDeposits: parseFloat(user.total_deposits ?? user.totalDeposits ?? 0),
    totalWithdrawals: parseFloat(user.total_withdrawals ?? user.totalWithdrawals ?? 0),
    status: user.status || 'Standard',
    phone: user.phone,
    isPhoneVerified: !!user.is_phone_verified || !!user.isPhoneVerified || !!user.phoneVerified,
    phoneVerified: !!user.is_phone_verified || !!user.isPhoneVerified || !!user.phoneVerified,
    country: user.country,
    countryCode: user.country_code || user.countryCode,
    referredBy: user.referred_by_uid || user.referredBy || user.referredByUid,
    referredByUid: user.referred_by_uid || user.referredBy || user.referredByUid,
    referralSubId: user.referral_sub_id || user.referralSubId || null,
    referralType: user.referral_type || user.referralType || null,
    is2FAEnabled: !!user.is_2fa_enabled || !!user.is2faEnabled || !!user.tfa_enabled,
    smart_mode_enabled: user.smart_mode_enabled || user.smartModeEnabled ? 1 : 0,
    smart_mode_strategy: user.smart_mode_strategy || user.smartModeStrategy || 'balanced',
    manipulationMode: user.manipulation_mode || user.manipulationMode || 'neutral',
    createdAt: user.created_at || user.createdAt || Date.now(),
    created_at: user.created_at || user.createdAt || Date.now(),
    updated_at: user.updated_at || user.updatedAt || Date.now()
  };
}
