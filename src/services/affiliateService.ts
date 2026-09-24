import { adminDb } from '../lib/firebase-admin.ts';
import { query, get, run } from '../db/mysql-db.ts';
import logger from '../lib/logger.ts';

export interface AffiliateSummary {
  availableBalance: number;
  heldBalance: number;
  totalEarnings: number;
  totalClicks: number;
  totalRegistrations: number;
  totalFTDs: number;
  totalDepositAmount: number;
  totalTradingVolume: number;
  activeTradersCount: number;
}

export interface EnrichedReferredTrader {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: number;
  realBalance: number;
  demoBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  isFTD: boolean;
  tradeVolume: number;
  tradeCount: number;
  traderNetPnL: number;
  holdCommission: number;
  settledCommission: number;
  totalCommission: number;
  kycStatus?: string;
  country?: string;
  referralSubId?: string;
  referralType?: string;
}

/**
 * Process 10% commission on deposit for the referring affiliate with a 7-day security hold.
 */
export async function processDepositAffiliateCommission(
  userId: string,
  depositAmount: number,
  currency: string = 'USD',
  conn?: any
): Promise<void> {
  try {
    if (!depositAmount || depositAmount <= 0) return;

    // Find referrer info from users table or Firestore
    let referrerUid: string | null = null;
    let referrerAffiliateCode: string | null = null;

    // 1. Check SQL
    try {
      const user = await get('SELECT referred_by_uid, referred_by FROM users WHERE uid = ?', [userId], conn) as any;
      if (user) {
        referrerUid = user.referred_by_uid || null;
        referrerAffiliateCode = user.referred_by || null;
      }
    } catch (e: any) {
      logger.warn(`Could not query SQL user for affiliate: ${e.message}`);
    }

    // 2. Fallback to Firestore
    if (!referrerUid && adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const uData = userDoc.data() || {};
          referrerUid = uData.referredByUid || uData.referred_by_uid || null;
          referrerAffiliateCode = uData.referredBy || uData.referred_by || uData.affiliateId || null;
        }
      } catch (e: any) {
        logger.warn(`Could not query Firestore user for affiliate: ${e.message}`);
      }
    }

    // If we have an affiliate code but not uid, look up affiliate owner
    if (!referrerUid && referrerAffiliateCode && adminDb) {
      try {
        const affDoc = await adminDb.collection('affiliates').doc(referrerAffiliateCode).get();
        if (affDoc.exists) {
          referrerUid = affDoc.data()?.userId || affDoc.data()?.uid || null;
        }
      } catch (e) {}
    }

    if (!referrerUid) {
      logger.info(`No referrer found for user ${userId}, skipping affiliate commission.`);
      return;
    }

    // 10% commission rate
    const commissionPercent = 10;
    const commissionAmount = parseFloat(((depositAmount * commissionPercent) / 100).toFixed(2));
    if (commissionAmount <= 0) return;

    const now = Date.now();
    const holdUntil = now + (7 * 24 * 60 * 60 * 1000); // 7-day security hold period

    const commissionRecord = {
      affiliateUid: referrerUid,
      affiliateId: referrerAffiliateCode || referrerUid,
      referredUid: userId,
      type: 'deposit_commission',
      depositAmount,
      percent: commissionPercent,
      amount: commissionAmount,
      currency: currency || 'USD',
      status: 'held', // Placed in 7-day hold
      holdUntil,
      createdAt: now,
      updatedAt: now,
      description: `10% Deposit Commission ($${depositAmount}) - 7-Day Hold`
    };

    // Store in Firestore
    if (adminDb) {
      await adminDb.collection('commissions').add(commissionRecord);

      // Update aggregate affiliate held balance doc
      const affRef = adminDb.collection('affiliates').doc(referrerUid);
      const affSnap = await affRef.get();
      if (affSnap.exists) {
        const currentData = affSnap.data() || {};
        await affRef.update({
          heldBalance: (currentData.heldBalance || 0) + commissionAmount,
          totalEarned: (currentData.totalEarned || 0) + commissionAmount,
          totalDepositVolume: (currentData.totalDepositVolume || 0) + depositAmount,
          conversions: (currentData.conversions || 0) + 1,
          updatedAt: now
        });
      } else {
        await affRef.set({
          userId: referrerUid,
          uid: referrerUid,
          heldBalance: commissionAmount,
          availableBalance: 0,
          totalEarned: commissionAmount,
          totalDepositVolume: depositAmount,
          conversions: 1,
          createdAt: now,
          updatedAt: now
        }, { merge: true });
      }
    }

    logger.info(`✅ Affiliate commission $${commissionAmount} placed on 7-day hold for affiliate ${referrerUid} from user ${userId}`);
  } catch (err: any) {
    logger.error(`Error in processDepositAffiliateCommission: ${err.message}`);
  }
}

/**
 * Process RevShare commission on trade loss for the referring affiliate with a 7-day hold.
 */
export async function processTradeAffiliateCommission(
  userId: string,
  tradeAmount: number,
  isWin: boolean,
  profitOrLoss: number,
  currency: string = 'USD'
): Promise<void> {
  try {
    // RevShare only triggers if trader lost money on live account
    if (isWin || profitOrLoss >= 0) return;
    const lossAmount = Math.abs(profitOrLoss);
    if (lossAmount <= 0) return;

    let referrerUid: string | null = null;
    let referrerAffiliateCode: string | null = null;

    try {
      const user = await get('SELECT referred_by_uid, referred_by FROM users WHERE uid = ?', [userId]) as any;
      if (user) {
        referrerUid = user.referred_by_uid || null;
        referrerAffiliateCode = user.referred_by || null;
      }
    } catch (e) {}

    if (!referrerUid && adminDb) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const uData = userDoc.data() || {};
        referrerUid = uData.referredByUid || uData.referred_by_uid || null;
        referrerAffiliateCode = uData.referredBy || uData.referred_by || null;
      }
    }

    if (!referrerUid) return;

    const commissionPercent = 50; // Standard RevShare 50%
    const commissionAmount = parseFloat(((lossAmount * commissionPercent) / 100).toFixed(2));
    if (commissionAmount <= 0) return;

    const now = Date.now();
    const holdUntil = now + (7 * 24 * 60 * 60 * 1000);

    const commissionRecord = {
      affiliateUid: referrerUid,
      affiliateId: referrerAffiliateCode || referrerUid,
      referredUid: userId,
      type: 'revshare_loss',
      lostAmount: lossAmount,
      percent: commissionPercent,
      amount: commissionAmount,
      currency: currency || 'USD',
      status: 'held',
      holdUntil,
      createdAt: now,
      updatedAt: now,
      description: `RevShare Loss Commission ($${lossAmount}) - 7-Day Hold`
    };

    if (adminDb) {
      await adminDb.collection('commissions').add(commissionRecord);
      const affRef = adminDb.collection('affiliates').doc(referrerUid);
      const affSnap = await affRef.get();
      if (affSnap.exists) {
        const currentData = affSnap.data() || {};
        await affRef.update({
          heldBalance: (currentData.heldBalance || 0) + commissionAmount,
          totalEarned: (currentData.totalEarned || 0) + commissionAmount,
          updatedAt: now
        });
      }
    }
  } catch (err: any) {
    logger.error(`Error in processTradeAffiliateCommission: ${err.message}`);
  }
}

/**
 * Settle all matured commissions (older than 7 days) and transition them from 'held' to 'settled'.
 */
export async function settleMaturedCommissions(affiliateUid?: string): Promise<{ settledCount: number; settledAmount: number }> {
  try {
    if (!adminDb) return { settledCount: 0, settledAmount: 0 };

    const now = Date.now();
    let queryRef: any = adminDb.collection('commissions').where('status', '==', 'held');
    if (affiliateUid) {
      queryRef = queryRef.where('affiliateUid', '==', affiliateUid);
    }

    const snap = await queryRef.get();
    let settledCount = 0;
    let totalSettledAmount = 0;

    const batch = adminDb.batch();
    const affiliateAmounts = new Map<string, number>();

    snap.forEach((doc: any) => {
      const data = doc.data();
      const holdUntil = data.holdUntil || (data.createdAt ? data.createdAt + 7 * 24 * 60 * 60 * 1000 : 0);
      if (holdUntil <= now) {
        const amt = parseFloat(data.amount || 0);
        batch.update(doc.ref, {
          status: 'settled',
          settledAt: now,
          updatedAt: now
        });
        settledCount++;
        totalSettledAmount += amt;

        const affId = data.affiliateUid || data.affiliateId;
        if (affId) {
          affiliateAmounts.set(affId, (affiliateAmounts.get(affId) || 0) + amt);
        }
      }
    });

    if (settledCount > 0) {
      await batch.commit();

      // Update aggregate affiliate document balances
      for (const [affId, amt] of affiliateAmounts.entries()) {
        const affRef = adminDb.collection('affiliates').doc(affId);
        const affSnap = await affRef.get();
        if (affSnap.exists) {
          const cur = affSnap.data() || {};
          const currentHeld = cur.heldBalance || 0;
          const currentAvail = cur.availableBalance || 0;
          await affRef.update({
            heldBalance: Math.max(0, currentHeld - amt),
            availableBalance: currentAvail + amt,
            updatedAt: now
          });
        }
      }
      logger.info(`✅ Settled ${settledCount} matured commissions totaling $${totalSettledAmount.toFixed(2)}`);
    }

    return { settledCount, settledAmount: totalSettledAmount };
  } catch (err: any) {
    logger.error(`Error in settleMaturedCommissions: ${err.message}`);
    return { settledCount: 0, settledAmount: 0 };
  }
}

/**
 * Get comprehensive summary stats for an affiliate.
 */
export async function getAffiliateSummary(affiliateUid: string, affiliateCode?: string): Promise<AffiliateSummary> {
  const summary: AffiliateSummary = {
    availableBalance: 0,
    heldBalance: 0,
    totalEarnings: 0,
    totalClicks: 0,
    totalRegistrations: 0,
    totalFTDs: 0,
    totalDepositAmount: 0,
    totalTradingVolume: 0,
    activeTradersCount: 0
  };

  try {
    if (!adminDb) return summary;

    // Settle matured commissions first
    await settleMaturedCommissions(affiliateUid);

    // 1. Fetch commissions
    const commSnap = await adminDb.collection('commissions')
      .where('affiliateUid', '==', affiliateUid)
      .get();

    const now = Date.now();
    commSnap.forEach((doc: any) => {
      const data = doc.data();
      const amt = parseFloat(data.amount || 0);
      const isSettled = data.status === 'settled' || (data.holdUntil && data.holdUntil <= now);

      if (isSettled) {
        summary.availableBalance += amt;
      } else {
        summary.heldBalance += amt;
      }
      summary.totalEarnings += amt;
    });

    // 2. Fetch referred traders
    const traders = await getReferredTradersList(affiliateUid, affiliateCode);
    summary.totalRegistrations = traders.length;
    summary.totalFTDs = traders.filter(t => t.isFTD || t.totalDeposits > 0).length;
    summary.totalDepositAmount = traders.reduce((sum, t) => sum + (t.totalDeposits || 0), 0);
    summary.totalTradingVolume = traders.reduce((sum, t) => sum + (t.tradeVolume || 0), 0);
    summary.activeTradersCount = traders.filter(t => (t.tradeCount || 0) > 0).length;

    // 3. Fetch link clicks/impressions
    try {
      const affDoc = await adminDb.collection('affiliates').doc(affiliateUid).get();
      if (affDoc.exists) {
        const affData = affDoc.data() || {};
        summary.totalClicks = affData.impressions || affData.clicks || 0;
      }
    } catch (e) {}

  } catch (err: any) {
    logger.error(`Error in getAffiliateSummary: ${err.message}`);
  }

  return summary;
}

/**
 * Get enriched list of all traders referred by this affiliate with live balance, deposit amounts, and trade volumes.
 */
export async function getReferredTradersList(
  affiliateUid: string,
  affiliateCode?: string
): Promise<EnrichedReferredTrader[]> {
  const list: EnrichedReferredTrader[] = [];

  try {
    // 1. Query users referred in SQL
    let sqlUsers: any[] = [];
    try {
      sqlUsers = await query(
        `SELECT uid, email, display_name, real_balance, demo_balance, total_deposits, total_withdrawals, 
                country, kyc_status, created_at, referred_by_uid, referred_by 
         FROM users 
         WHERE referred_by_uid = ? OR (referred_by IS NOT NULL AND (referred_by = ? OR referred_by = ?))`,
        [affiliateUid, affiliateCode || affiliateUid, affiliateUid]
      ) as any[];
    } catch (e: any) {
      logger.warn(`Could not query SQL referred users: ${e.message}`);
    }

    // 2. Query users referred in Firestore
    let fsUsers: any[] = [];
    if (adminDb) {
      try {
        const snap1 = await adminDb.collection('users')
          .where('referredByUid', '==', affiliateUid)
          .get();
        snap1.forEach(doc => fsUsers.push({ id: doc.id, ...doc.data() }));

        if (affiliateCode && affiliateCode !== affiliateUid) {
          const snap2 = await adminDb.collection('users')
            .where('referredBy', '==', affiliateCode)
            .get();
          snap2.forEach(doc => {
            if (!fsUsers.some(u => u.id === doc.id)) {
              fsUsers.push({ id: doc.id, ...doc.data() });
            }
          });
        }
      } catch (e: any) {
        logger.warn(`Could not query Firestore referred users: ${e.message}`);
      }
    }

    // 3. Merge users
    const userMap = new Map<string, any>();
    for (const u of fsUsers) {
      const uid = u.uid || u.id;
      userMap.set(uid, {
        uid,
        email: u.email || '',
        displayName: u.displayName || u.name || '',
        photoURL: u.photoURL || u.photo_url || u.avatar || '',
        realBalance: parseFloat(u.balance ?? u.realBalance ?? 0),
        demoBalance: parseFloat(u.demoBalance ?? 10000),
        totalDeposits: parseFloat(u.totalDeposits || 0),
        totalWithdrawals: parseFloat(u.totalWithdrawals || 0),
        kycStatus: u.kycStatus || 'unverified',
        country: u.country || '',
        createdAt: u.createdAt ? (typeof u.createdAt === 'number' ? u.createdAt : Date.parse(u.createdAt) || Date.now()) : Date.now(),
        referralSubId: u.referralSubId || 'Direct',
        referralType: u.referralType || 'RevShare'
      });
    }

    for (const u of sqlUsers) {
      const uid = u.uid;
      const existing = userMap.get(uid);
      if (existing) {
        existing.realBalance = parseFloat(u.real_balance || existing.realBalance || 0);
        existing.demoBalance = parseFloat(u.demo_balance || existing.demoBalance || 10000);
        existing.totalDeposits = parseFloat(u.total_deposits || existing.totalDeposits || 0);
        existing.totalWithdrawals = parseFloat(u.total_withdrawals || existing.totalWithdrawals || 0);
        existing.kycStatus = u.kyc_status || existing.kycStatus;
        existing.displayName = u.display_name || existing.displayName;
        existing.email = u.email || existing.email;
      } else {
        userMap.set(uid, {
          uid,
          email: u.email || '',
          displayName: u.display_name || '',
          photoURL: '',
          realBalance: parseFloat(u.real_balance || 0),
          demoBalance: parseFloat(u.demo_balance || 10000),
          totalDeposits: parseFloat(u.total_deposits || 0),
          totalWithdrawals: parseFloat(u.total_withdrawals || 0),
          kycStatus: u.kyc_status || 'unverified',
          country: u.country || '',
          createdAt: u.created_at || Date.now(),
          referralSubId: 'Direct',
          referralType: 'RevShare'
        });
      }
    }

    // 4. Enrich with Trade Volumes and Commission breakdown for each user
    const now = Date.now();
    for (const [uid, user] of userMap.entries()) {
      let tradeVolume = 0;
      let tradeCount = 0;
      let traderNetPnL = 0;
      let holdCommission = 0;
      let settledCommission = 0;
      let totalCommission = 0;

      // Check trade volume in SQL
      try {
        const tradeStats = await get(
          `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as volume, COALESCE(SUM(profit - amount), 0) as pnl 
           FROM trades 
           WHERE user_id = ? AND is_demo = 0`,
          [uid]
        ) as any;
        if (tradeStats) {
          tradeCount = Number(tradeStats.count || 0);
          tradeVolume = parseFloat(tradeStats.volume || 0);
          traderNetPnL = parseFloat(tradeStats.pnl || 0);
        }
      } catch (e) {}

      // Check commissions generated by this user
      if (adminDb) {
        try {
          const commSnap = await adminDb.collection('commissions')
            .where('referredUid', '==', uid)
            .get();

          commSnap.forEach(doc => {
            const data = doc.data();
            const amt = parseFloat(data.amount || 0);
            const isSettled = data.status === 'settled' || (data.holdUntil && data.holdUntil <= now);
            if (isSettled) {
              settledCommission += amt;
            } else {
              holdCommission += amt;
            }
            totalCommission += amt;
          });
        } catch (e) {}
      }

      const isFTD = user.totalDeposits > 0;

      list.push({
        id: uid,
        uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        realBalance: user.realBalance,
        demoBalance: user.demoBalance,
        totalDeposits: user.totalDeposits,
        totalWithdrawals: user.totalWithdrawals,
        isFTD,
        tradeVolume,
        tradeCount,
        traderNetPnL,
        holdCommission,
        settledCommission,
        totalCommission,
        kycStatus: user.kycStatus,
        country: user.country,
        referralSubId: user.referralSubId,
        referralType: user.referralType
      });
    }

    // Sort by recent registration
    list.sort((a, b) => b.createdAt - a.createdAt);

  } catch (err: any) {
    logger.error(`Error in getReferredTradersList: ${err.message}`);
  }

  return list;
}

/**
 * Transfer available affiliate earnings to the user's live trading account balance.
 */
export async function transferAffiliateBalanceToLive(
  affiliateUid: string,
  amount: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    if (!amount || amount <= 0) return { success: false, error: 'Invalid transfer amount' };

    const summary = await getAffiliateSummary(affiliateUid);
    if (summary.availableBalance < amount) {
      return { 
        success: false, 
        error: `Insufficient available balance. You have $${summary.availableBalance.toFixed(2)} available. (Note: $${summary.heldBalance.toFixed(2)} is currently under 7-day security hold)` 
      };
    }

    // Deduct available commission docs in Firestore
    if (adminDb) {
      const commSnap = await adminDb.collection('commissions')
        .where('affiliateUid', '==', affiliateUid)
        .where('status', '==', 'settled')
        .get();

      let remainingToDeduct = amount;
      const batch = adminDb.batch();

      for (const doc of commSnap.docs) {
        if (remainingToDeduct <= 0) break;
        const data = doc.data();
        const docAmt = parseFloat(data.amount || 0);

        if (docAmt <= remainingToDeduct) {
          batch.update(doc.ref, { status: 'transferred', transferredAt: Date.now() });
          remainingToDeduct -= docAmt;
        } else {
          batch.update(doc.ref, { amount: docAmt - remainingToDeduct });
          remainingToDeduct = 0;
        }
      }

      await batch.commit();

      // Update affiliate doc
      const affRef = adminDb.collection('affiliates').doc(affiliateUid);
      const affSnap = await affRef.get();
      if (affSnap.exists) {
        const curAvail = affSnap.data()?.availableBalance || 0;
        await affRef.update({ availableBalance: Math.max(0, curAvail - amount) });
      }
    }

    // Credit user's real balance in SQL & Firestore
    let newBalance = amount;
    try {
      const user = await get('SELECT real_balance FROM users WHERE uid = ?', [affiliateUid]) as any;
      if (user) {
        newBalance = parseFloat(user.real_balance || 0) + amount;
        await run('UPDATE users SET real_balance = ? WHERE uid = ?', [newBalance, affiliateUid]);
      }
    } catch (e) {}

    if (adminDb) {
      try {
        const userRef = adminDb.collection('users').doc(affiliateUid);
        const uSnap = await userRef.get();
        if (uSnap.exists) {
          const currentBal = uSnap.data()?.balance || 0;
          newBalance = currentBal + amount;
          await userRef.update({ balance: newBalance });
        }
      } catch (e) {}
    }

    // Record transaction
    try {
      await run(
        `INSERT INTO transactions (user_id, type, amount, status, method, details, created_at) 
         VALUES (?, 'transfer_in', ?, 'completed', 'affiliate_commission', ?, ?)`,
        [affiliateUid, amount, JSON.stringify({ note: 'Affiliate commission transfer to live balance' }), Date.now()]
      );
    } catch (e) {}

    return { success: true, newBalance };
  } catch (err: any) {
    logger.error(`Error in transferAffiliateBalanceToLive: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Request payout for available affiliate balance.
 */
export async function requestAffiliatePayout(
  affiliateUid: string,
  amount: number,
  method: string,
  walletAddress: string
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  try {
    if (!amount || amount <= 0) return { success: false, error: 'Invalid payout amount' };
    if (amount < 100) return { success: false, error: 'Minimum affiliate payout withdrawal amount is $100.00' };
    if (!method || !walletAddress) return { success: false, error: 'Payment method and address required' };

    const summary = await getAffiliateSummary(affiliateUid);
    if (summary.availableBalance < amount) {
      return { 
        success: false, 
        error: `Insufficient available balance. You have $${summary.availableBalance.toFixed(2)} available. (Note: $${summary.heldBalance.toFixed(2)} is currently in 7-day security hold)` 
      };
    }

    // Create payout record
    let payoutId = `payout-${Date.now()}`;
    const payoutRecord = {
      userId: affiliateUid,
      affiliateUid,
      amount,
      method,
      walletAddress,
      status: 'pending',
      type: 'affiliate_payout',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (adminDb) {
      const docRef = await adminDb.collection('affiliatePayouts').add(payoutRecord);
      payoutId = docRef.id;

      // Deduct from available balance
      const affRef = adminDb.collection('affiliates').doc(affiliateUid);
      const affSnap = await affRef.get();
      if (affSnap.exists) {
        const curAvail = affSnap.data()?.availableBalance || 0;
        await affRef.update({ availableBalance: Math.max(0, curAvail - amount) });
      }
    }

    return { success: true, payoutId };
  } catch (err: any) {
    logger.error(`Error in requestAffiliatePayout: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Check if a specific trader UID or identifier was registered under this affiliate
 */
export async function checkTraderUidAffiliateStatus(
  affiliateUid: string,
  targetIdentifier: string,
  affiliateCode?: string
): Promise<{
  exists: boolean;
  registeredUnderPartner: boolean;
  message: string;
  trader?: {
    uid: string;
    id: string;
    emailMasked: string;
    displayName: string;
    createdAt: number | string;
    kycStatus: string;
    isFTD: boolean;
    depositAmount: number;
    tradeVolume: number;
    commissionGenerated: number;
    country?: string;
  };
}> {
  try {
    const cleanId = (targetIdentifier || '').trim();
    if (!cleanId) {
      return { exists: false, registeredUnderPartner: false, message: 'Please provide a valid User ID or UID.' };
    }

    // 1. Check SQL
    let matchedSqlUser: any = null;
    try {
      matchedSqlUser = await get(
        `SELECT id, uid, email, display_name, real_balance, demo_balance, total_deposits, total_withdrawals, 
                country, kyc_status, created_at, referred_by_uid, referred_by, total_live_volume
         FROM users 
         WHERE uid = ? OR id = ? OR referral_code = ? OR email = ? OR display_name = ?`,
        [cleanId, cleanId, cleanId, cleanId, cleanId]
      );
    } catch (e: any) {
      logger.warn(`Error querying user in SQL for UID check: ${e.message}`);
    }

    // 2. Check Firestore if not found
    let matchedFsUser: any = null;
    if (!matchedSqlUser && adminDb) {
      try {
        const docById = await adminDb.collection('users').doc(cleanId).get();
        if (docById.exists) {
          matchedFsUser = { id: docById.id, uid: docById.id, ...docById.data() };
        } else {
          const snap = await adminDb.collection('users').where('email', '==', cleanId).limit(1).get();
          if (!snap.empty) {
            matchedFsUser = { id: snap.docs[0].id, uid: snap.docs[0].id, ...snap.docs[0].data() };
          }
        }
      } catch (e: any) {
        logger.warn(`Error querying user in Firestore for UID check: ${e.message}`);
      }
    }

    const user = matchedSqlUser || matchedFsUser;
    if (!user) {
      return {
        exists: false,
        registeredUnderPartner: false,
        message: `No account found with User ID "${cleanId}". Please verify the UID and try again.`
      };
    }

    const userUid = user.uid || user.id;
    const userRefByUid = user.referred_by_uid || user.referredByUid || null;
    const userRefBy = user.referred_by || user.referredBy || null;

    const isDirectUidMatch = Boolean(userRefByUid && userRefByUid === affiliateUid);
    const isCodeMatch = Boolean(
      (affiliateCode && userRefBy && (userRefBy === affiliateCode || userRefBy === affiliateUid)) ||
      (userRefBy && userRefBy === affiliateUid)
    );

    const isReferredByThisPartner = isDirectUidMatch || isCodeMatch;

    // Calculate commissions generated if available
    let totalComm = 0;
    if (adminDb && isReferredByThisPartner) {
      try {
        const commSnap = await adminDb.collection('commissions')
          .where('affiliateUid', '==', affiliateUid)
          .where('referredUid', '==', userUid)
          .get();
        commSnap.forEach(cDoc => {
          totalComm += parseFloat(cDoc.data().amount || 0);
        });
      } catch (e) {}
    }

    const rawEmail = user.email || '';
    let emailMasked = 'Anonymous';
    if (rawEmail.includes('@')) {
      const parts = rawEmail.split('@');
      const name = parts[0];
      const domain = parts[1];
      emailMasked = `${name.substring(0, 2)}***@${domain}`;
    }

    const depositAmount = parseFloat(user.total_deposits || user.totalDeposits || 0);
    const tradeVolume = parseFloat(user.total_live_volume || user.tradeVolume || 0);

    return {
      exists: true,
      registeredUnderPartner: isReferredByThisPartner,
      message: isReferredByThisPartner 
        ? `✅ Yes! This User ID (${user.id || userUid}) is successfully registered under your referral link.`
        : `❌ No. This User ID (${user.id || userUid}) exists on Bivaax, but is NOT registered under your referral link.`,
      trader: {
        uid: userUid,
        id: (user.id || userUid).toString(),
        emailMasked,
        displayName: user.display_name || user.displayName || 'Trader',
        createdAt: user.created_at || user.createdAt || Date.now(),
        kycStatus: user.kyc_status || user.kycStatus || 'unverified',
        isFTD: depositAmount > 0,
        depositAmount,
        tradeVolume,
        commissionGenerated: totalComm,
        country: user.country || 'Global'
      }
    };
  } catch (err: any) {
    logger.error(`Error in checkTraderUidAffiliateStatus: ${err.message}`);
    return {
      exists: false,
      registeredUnderPartner: false,
      message: 'Failed to verify UID. Please try again.'
    };
  }
}

