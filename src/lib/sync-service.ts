import { adminDb } from './firebase-admin.ts';
import { get, run, transaction, db } from '../db/mysql-db.ts';
import logger from './logger.ts';
import { mapUserForFrontend } from './user-utils.ts';
import { getIO } from '../services/socketService.ts';
import Big from 'big.js';

export async function syncUserTransactionsFromFirestore(userId: string) {
  if (!adminDb || !userId) return;
  try {
    const [depositsSnap, withdrawalsSnap, transactionsSnap] = await Promise.all([
      adminDb.collection('deposits').where('userId', '==', userId).get(),
      adminDb.collection('withdrawals').where('userId', '==', userId).get(),
      adminDb.collection('transactions').where('userId', '==', userId).get()
    ]);

    const list: any[] = [];

    depositsSnap.forEach((doc) => {
      const data = doc.data();
      const ts = data.timestamp || data.createdAt || Date.now();
      list.push({
        id: doc.id,
        type: 'deposit',
        amount: Number(data.amount || 0),
        currency: data.currency || 'BDT',
        status: (data.status === 'success' || data.status === 'approved' || data.status === 'completed') ? 'completed' : (data.status || 'pending').toLowerCase(),
        method: data.method || 'direct',
        tx_hash: data.trxId || data.txHash || '',
        timestamp: ts,
        details: { walletNumber: data.walletNumber || '', orderId: data.orderId || '', firestoreId: doc.id }
      });
    });

    withdrawalsSnap.forEach((doc) => {
      const data = doc.data();
      const ts = data.timestamp || data.createdAt || data.created_at || Date.now();
      list.push({
        id: doc.id,
        type: 'withdrawal',
        amount: Number(data.amount || 0),
        currency: data.currency || 'BDT',
        status: (data.status === 'success' || data.status === 'approved' || data.status === 'completed') ? 'completed' : (data.status || 'pending').toLowerCase(),
        method: data.method || 'direct',
        tx_hash: data.trxId || '',
        timestamp: ts,
        details: { ...(data.details || {}), firestoreId: doc.id }
      });
    });

    for (const data of list) {
      const txHash = data.tx_hash;
      const amount = data.amount.toString();
      const type = data.type;
      const status = data.status;
      const createdTime = data.timestamp;
      
      let existingTx = null;
      if (txHash) {
        existingTx = await get('SELECT id FROM transactions WHERE user_id = ? AND tx_hash = ?', [userId, txHash]);
      }
      
      if (!existingTx) {
        const pattern = `%${data.id}%`;
        existingTx = await get('SELECT id FROM transactions WHERE user_id = ? AND details LIKE ?', [userId, pattern]);
      }

      if (!existingTx) {
        await run(
          `INSERT INTO transactions (user_id, type, amount, status, method, tx_hash, currency, details, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            type,
            amount,
            status,
            data.method,
            txHash,
            data.currency,
            JSON.stringify(data.details),
            createdTime
          ]
        );
      } else {
        await run(
          `UPDATE transactions SET status = ?, updated_at = ? WHERE id = ? AND status != ?`,
          [status, Date.now(), existingTx.id, status]
        );
      }
    }
  } catch (err) {
    logger.error(`[syncUserTransactions] Error: ${err}`);
  }
}

export async function syncUserTradesFromFirestore(uid: string) {
  if (!adminDb || !uid) return;
  try {
    const snapshot = await adminDb.collection('trades').where('userId', '==', uid).get();
    if (snapshot.empty) return;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const firebaseId = doc.id;
      const numId = isNaN(Number(firebaseId)) ? 0 : Number(firebaseId);
      const createdAtMs = Number(data.createdAt || Date.now());

      const existing = await get(
        `SELECT id FROM trades WHERE firebase_id = ? OR (id = ? AND ? > 0)`,
        [firebaseId, numId, numId]
      ) as any;

      if (!existing) {
        await run(`
          INSERT INTO trades (firebase_id, user_id, market_id, amount, direction, entry_price, exit_price, duration, expiry_time, is_demo, status, payout_amount, settled_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            firebaseId, uid, data.marketId, data.amount, data.direction, 
            data.entryPrice, data.exitPrice || null, data.duration, 
            data.expiryTime, data.isDemo ? 1 : 0, data.status || 'open', 
            data.payoutAmount || 0, data.settledAt || null, createdAtMs
          ]
        );
      } else {
        await run(`
          UPDATE trades SET status = ?, exit_price = ?, payout_amount = ?, settled_at = ? 
          WHERE id = ? AND status != ?`,
          [data.status || 'open', data.exitPrice || null, data.payoutAmount || 0, data.settledAt || null, existing.id, data.status]
        );
      }
    }
  } catch (err: any) {
    logger.error(`[syncUserTrades] Error: ${err.message}`);
  }
}

export async function syncUserKycFromFirestore(userId: string) {
  if (!adminDb || !userId) return;
  try {
    const kycSnap = await adminDb.collection('kycRequests').where('userId', '==', userId).get();
    
    // Always update user table status from Firestore user doc first
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData) {
        const existingUser = await get('SELECT is_verified, is_email_verified FROM users WHERE uid = ?', [userId]) as any;
        const isVer = (userData.is_verified || userData.isVerified || userData.emailVerified || userData.isEmailVerified || userData.is_email_verified || existingUser?.is_verified || existingUser?.is_email_verified) ? 1 : 0;
        await run(
          'UPDATE users SET kyc_status = ?, is_verified = ?, is_email_verified = ? WHERE uid = ?',
          [userData.kycStatus || 'unverified', isVer, isVer, userId]
        );
      }
    }

    if (!kycSnap.empty) {
      for (const doc of kycSnap.docs) {
        const data = doc.data();
        const existing = await get('SELECT id FROM kyc_requests WHERE user_id = ? AND (full_name = ? AND document_number = ?)', 
          [userId, data.fullName, data.idNumber]);
        
        if (!existing) {
          await run(
            `INSERT INTO kyc_requests (user_id, status, full_name, document_type, document_number, front_image, back_image, selfie_image, rejection_reason, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              data.status || 'pending',
              data.fullName || '',
              data.idType || '',
              data.idNumber || '',
              data.idFrontUrl || '',
              data.idBackUrl || '',
              data.selfieUrl || '',
              data.rejectionReason || null,
              data.timestamp || Date.now(),
              data.updatedAt || Date.now()
            ]
          );
        } else {
          await run(
            'UPDATE kyc_requests SET status = ?, rejection_reason = ?, updated_at = ? WHERE id = ?',
            [data.status || 'pending', data.rejectionReason || null, Date.now(), existing.id]
          );
        }
      }
    }
  } catch (err: any) {
    logger.error(`[syncUserKyc] Error: ${err.message}`);
  }
}

/**
 * Authoritatively syncs all user data from Firestore to SQLite.
 * This is the "Truth" restoration flow.
 */
export async function authoritativeSync(userId: string, emitSocket = true) {
  if (!adminDb || !userId) return null;
  
  try {
    const doc = await adminDb.collection('users').doc(userId).get();
    if (!doc.exists) return null;

    const fireData = doc.data();
    if (!fireData) return null;

    const oldUser = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
    let user = oldUser;

    const rawFireRealBal = fireData.real_balance ?? fireData.realBalance ?? fireData.balance;
    const fireRealBal = (rawFireRealBal !== undefined && rawFireRealBal !== null) ? parseFloat(rawFireRealBal.toString()) : null;
    const finalRealBal = (oldUser && oldUser.real_balance !== undefined && oldUser.real_balance !== null) 
      ? parseFloat((oldUser.real_balance ?? 0).toString()) 
      : ((fireRealBal !== null && !isNaN(fireRealBal)) ? fireRealBal : 0);

    const rawFireDemoBal = fireData.demo_balance ?? fireData.demoBalance;
    const fireDemoBal = (rawFireDemoBal !== undefined && rawFireDemoBal !== null) ? parseFloat(rawFireDemoBal.toString()) : null;
    const finalDemoBal = (oldUser && oldUser.demo_balance !== undefined && oldUser.demo_balance !== null) 
      ? parseFloat((oldUser.demo_balance ?? 10000).toString()) 
      : ((fireDemoBal !== null && !isNaN(fireDemoBal)) ? fireDemoBal : 10000);

    const rawFireAffBal = fireData.affiliate_balance ?? fireData.affiliateBalance;
    const fireAffBal = (rawFireAffBal !== undefined && rawFireAffBal !== null) ? parseFloat(rawFireAffBal.toString()) : null;
    const finalAffBal = (fireAffBal !== null && !isNaN(fireAffBal)) ? fireAffBal : (oldUser ? parseFloat((oldUser.affiliate_balance ?? 0).toString()) : 0);

    const fireRefCode = fireData.referralCode || fireData.referral_code || fireData.affiliateId || fireData.affiliate_id || '';

    const fireFirstName = fireData.firstName || fireData.first_name || (user ? user.first_name : null);
    const fireLastName = fireData.lastName || fireData.last_name || (user ? user.last_name : null);
    const fireGender = fireData.gender || (user ? user.gender : null);
    const fireDob = (() => {
      if (typeof fireData.dob === 'object' && fireData.dob !== null) return JSON.stringify(fireData.dob);
      if (fireData.dob) return fireData.dob;
      if (fireData.birthDay || fireData.birthMonth || fireData.birthYear) {
        return JSON.stringify({ day: fireData.birthDay || '--', month: fireData.birthMonth || '--', year: fireData.birthYear || '--' });
      }
      return user ? user.dob : null;
    })();
    const fireNickname = fireData.nickname || (user ? user.nickname : null);
    const firePhone = fireData.phone || fireData.phoneNumber || (user ? user.phone : null);
    const fireBirthDay = fireData.birthDay || fireData.birth_day || (user ? user.birth_day : null);
    const fireBirthMonth = fireData.birthMonth || fireData.birth_month || (user ? user.birth_month : null);
    const fireBirthYear = fireData.birthYear || fireData.birth_year || (user ? user.birth_year : null);
    const fireTimeZone = fireData.timeZone || fireData.time_zone || (user ? user.time_zone : null);
    const fireLanguage = fireData.language || (user ? user.language : null);
    const fireNewsletter = fireData.newsletter !== undefined ? (fireData.newsletter ? 1 : 0) : (user ? user.newsletter : 1);
    const fireAllowNotifications = fireData.allowNotifications !== undefined ? (fireData.allowNotifications ? 1 : 0) : (user ? user.allow_notifications : 1);
    const isVerifiedVal = (fireData.is_verified || fireData.isVerified || fireData.emailVerified || fireData.isEmailVerified || fireData.is_email_verified || (user && (user.is_verified || user.is_email_verified))) ? 1 : 0;
    const isEmailVerifiedVal = (fireData.is_email_verified || fireData.isEmailVerified || fireData.emailVerified || fireData.is_verified || fireData.isVerified || (user && (user.is_email_verified || user.is_verified))) ? 1 : 0;
    const fireCustomShare = fireData.customAffiliateShare !== undefined ? fireData.customAffiliateShare : (fireData.custom_affiliate_share !== undefined ? fireData.custom_affiliate_share : null);
    const fireReferralSubId = fireData.referralSubId || fireData.referral_sub_id || (user ? user.referral_sub_id : null);
    const fireReferralType = fireData.referralType || fireData.referral_type || (user ? user.referral_type : null);

    if (!user) {
      // Restore basic profile
      await run(
        `INSERT OR IGNORE INTO users (
          uid, email, display_name, first_name, last_name, gender, dob, birth_day, birth_month, birth_year,
          time_zone, language, newsletter, allow_notifications, nickname, phone,
          real_balance, demo_balance, kyc_status, is_verified, is_email_verified, country, 
          referral_code, referred_by_uid, affiliate_balance, total_affiliate_earnings, referral_count, custom_affiliate_share,
          referral_sub_id, referral_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          fireData.email || '',
          fireData.displayName || fireData.name || '',
          fireFirstName,
          fireLastName,
          fireGender,
          fireDob,
          fireBirthDay,
          fireBirthMonth,
          fireBirthYear,
          fireTimeZone,
          fireLanguage,
          fireNewsletter,
          fireAllowNotifications,
          fireNickname,
          firePhone,
          finalRealBal,
          finalDemoBal,
          fireData.kycStatus || fireData.kyc_status || 'unverified',
          isVerifiedVal,
          isEmailVerifiedVal,
          fireData.country || '',
          fireRefCode,
          fireData.referredBy || fireData.referred_by_uid || '',
          finalAffBal,
          fireData.totalAffiliateEarnings || fireData.total_affiliate_earnings || 0,
          fireData.referralCount || fireData.referral_count || 0,
          fireCustomShare,
          fireReferralSubId,
          fireReferralType
        ]
      );
      user = await get('SELECT * FROM users WHERE uid = ?', [userId]);
    } else {
      const finalRefCode = fireRefCode || user.referral_code || '';
      // Authoritatively update existing record without wiping positive balances or personal info
      await run(
        `UPDATE users SET 
          real_balance = ?, demo_balance = ?, kyc_status = ?, is_verified = ?, is_email_verified = ?,
          display_name = ?, first_name = ?, last_name = ?, gender = ?, dob = ?, birth_day = ?, birth_month = ?, birth_year = ?,
          time_zone = ?, language = ?, newsletter = ?, allow_notifications = ?, nickname = ?, phone = ?,
          country = ?, affiliate_balance = ?, total_affiliate_earnings = ?, referral_count = ?, referral_code = ?, custom_affiliate_share = ?,
          referral_sub_id = ?, referral_type = ?
        WHERE uid = ?`,
        [
          finalRealBal,
          finalDemoBal,
          fireData.kycStatus || fireData.kyc_status || user.kyc_status || 'unverified',
          isVerifiedVal,
          isEmailVerifiedVal,
          fireData.displayName || fireData.name || user.display_name,
          fireFirstName,
          fireLastName,
          fireGender,
          fireDob,
          fireBirthDay,
          fireBirthMonth,
          fireBirthYear,
          fireTimeZone,
          fireLanguage,
          fireNewsletter,
          fireAllowNotifications,
          fireNickname,
          firePhone,
          fireData.country || user.country,
          finalAffBal,
          fireData.totalAffiliateEarnings || fireData.total_affiliate_earnings || user.total_affiliate_earnings || 0,
          fireData.referralCount || fireData.referral_count || user.referral_count || 0,
          finalRefCode,
          fireCustomShare,
          fireReferralSubId,
          fireReferralType,
          userId
        ]
      );
      user = await get('SELECT * FROM users WHERE uid = ?', [userId]);
    }

    // Sync sub-collections in parallel background tasks
    Promise.all([
      syncUserTransactionsFromFirestore(userId),
      syncUserTradesFromFirestore(userId),
      syncUserKycFromFirestore(userId)
    ]).catch(e => logger.error(`Sub-sync error: ${e}`));

    const finalUser = await get('SELECT * FROM users WHERE uid = ?', [userId]);
    
    // Always authoritatively push database values back to Firestore so Firestore stays 100% in sync with PostgreSQL
    if (finalUser) {
      const { syncUserToFirestore } = await import('./firebase-admin.ts');
      const mapped = mapUserForFrontend(finalUser);
      syncUserToFirestore(userId, mapped).catch(err => logger.error(`Syncing back to Firestore failed for ${userId}:`, err));

      // Notify the frontend via socket
      if (emitSocket) {
        const io = getIO();
        if (io) {
          io.to(`user_${userId}`).emit('user_profile_update', mapped);
          io.to(`user:${userId}`).emit('user_update', mapped);
          if (oldUser && (oldUser.real_balance !== finalUser.real_balance || oldUser.demo_balance !== finalUser.demo_balance)) {
            io.to(`user_${userId}`).emit('balance_update', {
              real_balance: finalUser.real_balance,
              demo_balance: finalUser.demo_balance
            });
            io.to(`user:${userId}`).emit('balance_update', {
              real_balance: finalUser.real_balance,
              demo_balance: finalUser.demo_balance
            });
          }
        }
      }
    }

    return finalUser;
  } catch (err: any) {
    logger.error(`[authoritativeSync] Error for ${userId}: ${err.message}`);
    return null;
  }
}
