import { db } from '../firebase';
import { doc, runTransaction, collection, query, where, getDocs, limit, updateDoc, increment, addDoc, getDoc, setDoc } from '../firebase';

/**
 * Generates a sequential professional numeric ID for a new user.
 */
export async function getNextAffiliateId(): Promise<number> {
  try {
    const counterRef = doc(db, 'counters', 'affiliate');
    
    const newId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { currentId: 100000 });
        return 100000;
      }
      const nextId = (counterDoc.data().currentId || 100000) + 1;
      transaction.update(counterRef, { currentId: nextId });
      return nextId;
    });
    
    return newId;
  } catch (err) {
    console.error("Transaction failed, using fallback random numeric ID", err);
    return 100000 + Math.floor(Math.random() * 899999);
  }
}

/**
 * Ensures a user has a permanent sequential affiliate ID.
 * If user already has one, returns existing ID without generating a new one.
 */
export async function ensureUserAffiliateId(uid: string, userData?: any): Promise<string> {
  if (!uid) return '';

  const storageKey = `bivaax_aff_code_${uid}`;

  // 1. Check passed user object first
  let existingCode = userData?.referralCode || userData?.referral_code || userData?.affiliateId || userData?.affiliate_id;
  if (existingCode) {
    const str = String(existingCode);
    try { localStorage.setItem(storageKey, str); } catch (_) {}
    return str;
  }

  // 2. Check client localStorage cache
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) return cached;
  } catch (_) {}

  // 3. Check Firestore document
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      existingCode = data.referralCode || data.referral_code || data.affiliateId || data.affiliate_id;
      if (existingCode) {
        const str = String(existingCode);
        try { localStorage.setItem(storageKey, str); } catch (_) {}
        return str;
      }
    }
  } catch (err) {
    console.warn("Failed to check Firestore for affiliateId:", err);
  }

  // 4. Check backend SQLite user endpoint
  try {
    const res = await fetch(`/api/users?uid=${encodeURIComponent(uid)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sqlUser = data[0];
        existingCode = sqlUser.referral_code || sqlUser.referralCode || sqlUser.affiliate_id || sqlUser.affiliateId;
        if (existingCode) {
          const str = String(existingCode);
          try { localStorage.setItem(storageKey, str); } catch (_) {}
          return str;
        }
      }
    }
  } catch (err) {
    console.warn("Failed to check SQLite backend for affiliateId:", err);
  }

  // 5. Try fetching sequential next ID from backend endpoint
  let newNumericId = 100001;
  try {
    const res = await fetch('/api/affiliate/next-id', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.nextId) {
        newNumericId = parseInt(data.nextId);
      }
    } else {
      newNumericId = await getNextAffiliateId();
    }
  } catch (_) {
    newNumericId = await getNextAffiliateId();
  }

  const strId = String(newNumericId);
  const numVal = parseInt(strId, 10);
  const turnoverCode = !isNaN(numVal) && String(numVal) === strId ? String(numVal + 1) : `${strId}1`;

  // Lock into localStorage immediately so this user will never get another generated ID
  try { 
    localStorage.setItem(storageKey, strId);
    localStorage.setItem(`bivaax_turnover_code_${uid}`, turnoverCode);
  } catch (_) {}

  // 6. Save permanently to Firestore
  try {
    await setDoc(doc(db, 'users', uid), {
      affiliateId: newNumericId,
      referralCode: strId,
      turnoverReferralCode: turnoverCode
    }, { merge: true });
  } catch (err) {
    console.error("Failed to save generated affiliateId to Firestore:", err);
  }

  // 7. Sync to backend SQLite API
  try {
    await fetch(`/api/users/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        referralCode: strId, 
        affiliateId: newNumericId,
        turnoverReferralCode: turnoverCode 
      })
    });
  } catch (err) {
    // network fallback ignored
  }

  return strId;
}

/**
 * Calculates official Revenue Share and Turnover referral codes.
 * E.g. 10056 (RevShare) -> 10057 (Turnover).
 */
export function getAffiliatePairCodes(
  baseCode: string | number | null | undefined, 
  customTurnoverCode?: string | null
): {
  revshareCode: string;
  turnoverCode: string;
} {
  if (!baseCode) return { revshareCode: '', turnoverCode: '' };
  const revshareCode = String(baseCode).trim();
  if (!revshareCode) return { revshareCode: '', turnoverCode: '' };

  if (customTurnoverCode && String(customTurnoverCode).trim()) {
    return { revshareCode, turnoverCode: String(customTurnoverCode).trim() };
  }

  const num = parseInt(revshareCode, 10);
  if (!isNaN(num) && String(num) === revshareCode) {
    return {
      revshareCode,
      turnoverCode: String(num + 1)
    };
  }

  return {
    revshareCode,
    turnoverCode: `${revshareCode}1`
  };
}

/**
 * Finds a user by their numeric affiliate ID or turnover code.
 * Distinguishes whether the link used was Revenue Share or Turnover.
 */
export async function getUserByAffiliateId(id: string | number) {
  if (!id) return null;
  const strId = String(id).trim();
  if (!strId) return null;

  // 1. If it is numeric or convertible to a valid integer, search by affiliateId (numeric)
  const numericId = parseInt(strId, 10);
  const isNumeric = !isNaN(numericId) && String(numericId) === strId;

  if (isNumeric) {
    try {
      const q = query(
        collection(db, 'users'), 
        where('affiliateId', '==', numericId), 
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { uid: snap.docs[0].id, ...snap.docs[0].data(), resolvedReferralType: 'revshare' };
      }
    } catch (e) {
      console.warn("Numeric affiliateId query error:", e);
    }
  }

  // 2. Search by referralCode (string) -> RevShare
  try {
    const qStr = query(
      collection(db, 'users'),
      where('referralCode', '==', strId),
      limit(1)
    );
    const snapStr = await getDocs(qStr);
    if (!snapStr.empty) {
      return { uid: snapStr.docs[0].id, ...snapStr.docs[0].data(), resolvedReferralType: 'revshare' };
    }
  } catch (e) {
    console.warn("String referralCode query error:", e);
  }

  // 3. Search by turnoverReferralCode (string) -> Turnover
  try {
    const qTurn = query(
      collection(db, 'users'),
      where('turnoverReferralCode', '==', strId),
      limit(1)
    );
    const snapTurn = await getDocs(qTurn);
    if (!snapTurn.empty) {
      return { uid: snapTurn.docs[0].id, ...snapTurn.docs[0].data(), resolvedReferralType: 'turnover' };
    }
  } catch (e) {
    console.warn("turnoverReferralCode query error:", e);
  }

  // 4. If numeric, check if (numericId - 1) matches a user's affiliateId or referralCode -> Turnover
  if (isNumeric) {
    try {
      const qPrevAff = query(
        collection(db, 'users'),
        where('affiliateId', '==', numericId - 1),
        limit(1)
      );
      const snapPrevAff = await getDocs(qPrevAff);
      if (!snapPrevAff.empty) {
        return { uid: snapPrevAff.docs[0].id, ...snapPrevAff.docs[0].data(), resolvedReferralType: 'turnover' };
      }

      const qPrevRef = query(
        collection(db, 'users'),
        where('referralCode', '==', String(numericId - 1)),
        limit(1)
      );
      const snapPrevRef = await getDocs(qPrevRef);
      if (!snapPrevRef.empty) {
        return { uid: snapPrevRef.docs[0].id, ...snapPrevRef.docs[0].data(), resolvedReferralType: 'turnover' };
      }
    } catch (e) {
      console.warn("Numeric turnover pair lookup error:", e);
    }
  }

  // 5. Fallback: search by affiliateId as a string
  try {
    const qAffStr = query(
      collection(db, 'users'),
      where('affiliateId', '==', strId),
      limit(1)
    );
    const snapAffStr = await getDocs(qAffStr);
    if (!snapAffStr.empty) {
      return { uid: snapAffStr.docs[0].id, ...snapAffStr.docs[0].data(), resolvedReferralType: 'revshare' };
    }
  } catch (e) {
    console.warn("String affiliateId query error:", e);
  }

  // 6. Fallback: search by uid
  try {
    const qUid = query(
      collection(db, 'users'),
      where('uid', '==', strId),
      limit(1)
    );
    const snapUid = await getDocs(qUid);
    if (!snapUid.empty) {
      return { uid: snapUid.docs[0].id, ...snapUid.docs[0].data(), resolvedReferralType: 'revshare' };
    }
  } catch (e) {
    console.warn("Uid query error:", e);
  }

  // 7. Backend REST API fallback (SQLite database)
  try {
    const res = await fetch(`/api/affiliate/resolve/${encodeURIComponent(strId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.uid) {
        return { 
          uid: data.uid, 
          referralCode: data.referralCode,
          resolvedReferralType: data.referralType || 'revshare' 
        };
      }
    }
  } catch (e) {
    console.warn("Backend referral lookup fallback error:", e);
  }

  return null;
}

/**
 * Gets the main trading platform base origin for trader referral links.
 * If accessed from partner.bivaax.com or affiliate.bivaax.com, it strips the subdomain prefix
 * so links lead traders directly to the main trading platform (e.g. bivaax.com).
 */
export function getTraderPlatformOrigin(customDomain?: string): string {
  // Use custom domain if provided in app settings
  if (customDomain) {
    return customDomain.startsWith('http') ? customDomain : `https://${customDomain}`;
  }
  
  if (typeof window === 'undefined') return 'https://bivaax.com';
  
  const { protocol, host, hostname } = window.location;
  
  // Strictly remove partner, affiliate, market, blog subdomains for trader links
  if (
    hostname.startsWith('partner.') || 
    hostname.startsWith('affiliate.') || 
    hostname.startsWith('market.') || 
    hostname.startsWith('blog.') ||
    hostname.startsWith('bloge.') ||
    hostname.includes('asia-southeast1.run.app') // Handle dev environment safely
  ) {
    // If we are on bivaax.com or its subdomains, always point to the main domain
    if (hostname.includes('bivaax.com')) {
      return `${protocol}//bivaax.com`;
    }
    
    // Fallback for other environments: strip common subdomains
    const mainHost = host
      .replace(/^partner\./, '')
      .replace(/^affiliate\./, '')
      .replace(/^market\./, '')
      .replace(/^blog\./, '')
      .replace(/^bloge\./, '');
    return `${protocol}//${mainHost}`;
  }
  
  return window.location.origin;
}

/**
 * Builds a full trader registration link with referral code and optional campaign parameters.
 */
export function buildTraderReferralLink(
  referralCode?: string | number | null,
  options?: { subId?: string; landingPage?: string; linkType?: string; customDomain?: string }
): string {
  if (!referralCode) return '';
  const refStr = String(referralCode).trim();
  if (!refStr) return '';
  const origin = getTraderPlatformOrigin(options?.customDomain);
  const landing = (!options?.landingPage || options.landingPage === '/') ? '/register' : options.landingPage;
  const path = landing.startsWith('/') ? landing : `/${landing}`;
  const base = `${origin}${path}`;
  const connector = base.includes('?') ? '&' : '?';
  let url = `${base}${connector}ref=${encodeURIComponent(refStr)}`;
  if (options?.subId && options.subId !== 'default' && options.subId !== 'MAIN') {
    url += `&sub=${encodeURIComponent(options.subId)}`;
  }
  if (options?.linkType && options.linkType !== 'revshare') {
    url += `&type=${encodeURIComponent(options.linkType)}`;
  }
  return url;
}

/**
 * Records a click for an affiliate link.
 * Updates the specific campaign click count and user's total clicks.
 */
export async function recordAffiliateClick(referralCode: string, subId: string = 'default') {
  if (!referralCode) return;

  try {
    // 1. Resolve referral code to referrer user
    const referrer = await getUserByAffiliateId(referralCode);
    if (!referrer || !referrer.uid) return;

    const referrerUid = referrer.uid;
    const cleanSubId = (subId || 'default').trim();

    // 2. Update campaign clicks if subId exists
    if (cleanSubId && cleanSubId !== 'default' && cleanSubId !== 'MAIN') {
      const q = query(
        collection(db, 'affiliate_campaigns'),
        where('userId', '==', referrerUid),
        where('subId', '==', cleanSubId),
        limit(1)
      );
      const campSnap = await getDocs(q);
      if (!campSnap.empty) {
        const campDoc = campSnap.docs[0];
        await updateDoc(doc(db, 'affiliate_campaigns', campDoc.id), {
          clicks: increment(1)
        });
      }
    }

    // 3. Update total clicks and impressions on user document
    const userRef = doc(db, 'users', referrerUid);
    await updateDoc(userRef, {
      totalClicks: increment(1),
      impressions: increment(1),
      lastClickAt: Date.now()
    }).catch(() => {
      // If document doesn't have these fields yet, merge them
      setDoc(userRef, { totalClicks: 1, impressions: 1, lastClickAt: Date.now() }, { merge: true });
    });

    // 4. Record click in a detailed log collection for analytics
    await addDoc(collection(db, 'affiliate_clicks'), {
      referrerUid,
      referralCode,
      subId: cleanSubId,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });

    // 5. Authoritatively sync click to backend SQLite
    try {
      await fetch('/api/affiliate/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode, subId: cleanSubId })
      });
    } catch (_) {}

    console.log(`[Affiliate] Click recorded for ref=${referralCode}, sub=${cleanSubId}`);
  } catch (err) {
    console.error("[Affiliate] Error recording click:", err);
  }
}

/**
 * Processes revenue share when a referred user loses a trade.
 * Bivaax model: Referrer gets a share of the lost amount.
 */
export async function processRevenueShare(userId: string, lostAmount: number, currency: string) {
  try {
    const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', userId), limit(1)));
    if (userSnap.empty) {
        // If query by uid fails (depending on how it's stored), try direct doc
        const userDoc = await getDocs(query(collection(db, 'users'), where('email', '!=', ''), limit(1))); // dummy but better use standard doc
    }
    
    // Better: just use the userId directly if we have it
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId), limit(1)));
    if (userDoc.empty) return;
    
    const userData = userDoc.docs[0].data();
    const referrerUid = userData.referredBy || userData.referredByUid || userData.referred_by_uid;
    if (!referrerUid) return;

    const referrerRef = doc(db, 'users', referrerUid);
    const referrerSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', referrerUid), limit(1)));
    
    if (referrerSnap.empty) return;
    const referrerData = referrerSnap.docs[0].data();

    // Determine share percentage (default 50% or from tier)
    let sharePercent = 50;
    if (referrerData.customAffiliateShare) {
        sharePercent = referrerData.customAffiliateShare;
    } else {
        // Basic tier logic
        const refCount = referrerData.referralCount || 0;
        if (refCount >= 201) sharePercent = 80;
        else if (refCount >= 51) sharePercent = 70;
        else if (refCount >= 11) sharePercent = 60;
    }

    const shareAmount = lostAmount * (sharePercent / 100);

    // Record the commission in a pending state
    await addDoc(collection(db, 'affiliate_commissions'), {
        referrerUid,
        referredUid: userId,
        amount: shareAmount,
        lostAmount: lostAmount,
        currency: currency,
        percent: sharePercent,
        createdAt: Date.now(),
        holdUntil: Date.now() + 7 * 24 * 60 * 60 * 1000,
        status: 'pending',
        type: 'revenue_share'
    });

  } catch (err) {
    console.error("Error processing revenue share:", err);
  }
}
