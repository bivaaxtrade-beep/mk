import { get, query, run, transaction } from '../db/mysql-db.ts';
import { markets_real, markets_demo, userManipulationCache, globalManipulationMode, autoMarketConfig } from './marketService.ts';
import Big from 'big.js';
import { getIO } from './socketService.ts';
import { adminDb, syncUserToFirestore } from '../lib/firebase-admin.ts';
import { createAuditLog } from '../lib/audit.ts';
import logger from '../lib/logger.ts';
import { mapUserForFrontend } from '../lib/user-utils.ts';
import { updateLeaderboardStats, broadcastLeaderboards } from './leaderboardService.ts';
import { unregisterSteeringTrade, getActiveSteeringTrade } from './otcEngine.ts';
import { getAllAppSettings } from './settingsService.ts';

let isSettling = false;

// Global cache for trade exposure: pair_type -> net exposure (positive means UP trades dominate, negative means DOWN trades dominate)
export const tradeExposureCache = new Map<string, number>();
// User specific manipulation exposure: pair_type -> net exposure from users in loss/win mode
export const manipulatedExposureCache = new Map<string, number>();

export async function updateTradeExposureCache() {
  try {
    const openTrades = await query(`
      SELECT market_id, user_id, is_demo, direction, SUM(amount) as total 
      FROM trades 
      WHERE status = 'open' 
      GROUP BY market_id, user_id, is_demo, direction
    `) as any[];

    tradeExposureCache.clear();
    manipulatedExposureCache.clear();
    
    for (const row of openTrades) {
      const isDemo = row.is_demo === 1 || row.is_demo === true || String(row.is_demo) === 'true' || row.account_type === 'demo';
      if (isDemo) continue; // Demo trades NEVER affect market exposure or manipulation
      const type = 'real';
      const key = `${row.market_id}_${type}`;
      const amount = parseFloat(row.total);
      
      // Update global exposure
      let current = tradeExposureCache.get(key) || 0;
      if (row.direction === 'up') {
        current += amount;
      } else {
        current -= amount;
      }
      tradeExposureCache.set(key, current);

      // Update manipulated exposure if user is in cache
      const manipulationMode = userManipulationCache.get(row.user_id);
      if (manipulationMode && manipulationMode !== 'neutral') {
        let manipCurrent = manipulatedExposureCache.get(key) || 0;
        let factor = manipulationMode === 'loss' ? -1 : 1; // if loss mode, we treat UP trade as negative bias (down)
        
        // Logical check: If user is in LOSS mode and goes UP, we want market to go DOWN.
        // So we add 'negative' bias for an UP trade.
        if (row.direction === 'up') {
          manipCurrent += (amount * factor);
        } else {
          manipCurrent -= (amount * factor);
        }
        manipulatedExposureCache.set(key, manipCurrent);
      }
    }
  } catch (err) {
    logger.error('Failed to update trade exposure cache:', err);
  }
}

export async function settleExpiredTrades() {
  if (isSettling) return;
  isSettling = true;
  let broadcastNeeded = false;
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiredTrades = await query(
      'SELECT id, is_demo FROM trades WHERE status = ? AND expiry_time <= ?',
      ['open', now]
    ) as any[];

    for (const trade of expiredTrades) {
      await settleTrade(trade.id);
      if (!trade.is_demo) {
        broadcastNeeded = true;
      }
    }
    
    if (broadcastNeeded) {
      broadcastLeaderboards().catch(err => console.error('Broadcast leaderboard error:', err));
    }
  } catch (err) {
    logger.error('Failed to settle expired trades:', err);
  } finally {
    isSettling = false;
  }
}

export async function decideTradeOutcome(trade: {
  userId: string;
  pair: string;
  amount: number | string;
  direction: string;
  duration: number;
  isDemo: boolean;
  accountType?: string;
  expiryTime: number;
}, conn?: any): Promise<'win' | 'loss' | null> {
  const isReal = !trade.isDemo && (!trade.accountType || trade.accountType === 'real');

  // CRITICAL REQUIREMENT: Demo balance has NO manipulation mode at all.
  // Manipulation (User mode, Global mode, Auto Risk 80/20) applies EXCLUSIVELY to Live (real) balance.
  if (!isReal) {
    return null;
  }

  // If Auto Market Risk Management is disabled, return null immediately (natural market flow with zero manipulation)
  if (!autoMarketConfig.enabled) {
    return null;
  }

  const userId = trade.userId;
  const isDemoVal = 0; // Strictly real account trades
  const normDir = (trade.direction || '').toLowerCase();
  const isUp = normDir === 'up' || normDir === 'call' || normDir === 'buy';
  const newAmount = Math.max(1, parseFloat(String(trade.amount || 1)));

  // Check manual user manipulation set by admin (Real balance only)
  const userMode = userManipulationCache.get(trade.userId);
  const globalMode = globalManipulationMode;

  try {
    // 1. Fetch all currently open real trades for this user on this market
    const openTrades = await query(
      `SELECT id, market_id, asset, direction, amount, target_result, expiry_time, created_at 
       FROM trades 
       WHERE user_id = ? AND status = 'open' AND is_demo = ?`,
      [userId, isDemoVal],
      conn
    ) as any[];

    // Calculate total UP and DOWN exposure including this new trade
    let existingUpAmount = 0;
    let existingDownAmount = 0;
    const sameMarketTrades: any[] = [];

    for (const t of openTrades) {
      const mId = (t.market_id || t.asset || '').toLowerCase();
      const pId = (trade.pair || '').toLowerCase();
      if (mId === pId || mId.replace('/', '') === pId.replace('/', '')) {
        sameMarketTrades.push(t);
        const tDir = (t.direction || '').toLowerCase();
        const tIsUp = tDir === 'up' || tDir === 'call' || tDir === 'buy';
        const tAmt = parseFloat(t.amount || 0) || 0;
        if (tIsUp) existingUpAmount += tAmt;
        else existingDownAmount += tAmt;
      }
    }

    const totalUp = existingUpAmount + (isUp ? newAmount : 0);
    const totalDown = existingDownAmount + (!isUp ? newAmount : 0);

    // CASE 1: Both UP and DOWN positions exist simultaneously on this market!
    // The market can only close in ONE single direction.
    // The side with HIGHER total stake loses, and the side with LOWER total stake WINS!
    if (totalUp > 0 && totalDown > 0) {
      let winningDir: 'up' | 'down';

      if (Math.abs(totalUp - totalDown) > 0.01) {
        // Less total amount on UP -> UP wins (market goes UP).
        // Less total amount on DOWN -> DOWN wins (market goes DOWN).
        winningDir = totalUp < totalDown ? 'up' : 'down';
      } else {
        // Equal exposure on both sides: select single direction based on user mode or win rate
        if (userMode === 'win' || globalMode === 'always_win') {
          winningDir = isUp ? 'up' : 'down';
        } else {
          const winRate = autoMarketConfig.winRate !== undefined ? autoMarketConfig.winRate : 20;
          const roll = Math.random() * 100;
          winningDir = (roll < winRate) ? (isUp ? 'up' : 'down') : (isUp ? 'down' : 'up');
        }
      }

      const newTradeTarget: 'win' | 'loss' = (isUp ? (winningDir === 'up' ? 'win' : 'loss') : (winningDir === 'down' ? 'win' : 'loss'));

      // Harmonize all existing open trades in the database so their target_result is consistent with this single market direction!
      for (const openT of sameMarketTrades) {
        const tDir = (openT.direction || '').toLowerCase();
        const tIsUp = tDir === 'up' || tDir === 'call' || tDir === 'buy';
        const expectedResult: 'win' | 'loss' = (tIsUp ? (winningDir === 'up' ? 'win' : 'loss') : (winningDir === 'down' ? 'win' : 'loss'));
        if (openT.target_result !== expectedResult) {
          await run('UPDATE trades SET target_result = ? WHERE id = ?', [expectedResult, openT.id], conn);
          openT.target_result = expectedResult;
        }
      }

      return newTradeTarget;
    }

    // CASE 2: Single Direction Trades (Only UP trades or only DOWN trades)
    // If user opens multiple concurrent trades in the same direction on the same pair,
    // they MUST share the same target result so all entries in the batch win or lose cohesively.
    const existingSameDir = sameMarketTrades.find(t => {
      const tDir = (t.direction || '').toLowerCase();
      const tIsUp = tDir === 'up' || tDir === 'call' || tDir === 'buy';
      return tIsUp === isUp && t.target_result;
    });
    if (existingSameDir) {
      return existingSameDir.target_result as 'win' | 'loss';
    }

    // Direct Admin Manipulation Overrides
    if (userMode === 'loss' || globalMode === 'always_loss') return 'loss';
    if (userMode === 'win' || globalMode === 'always_win') return 'win';

    // 2. Dynamic Win / Loss ratio enforcement based on autoMarketConfig.winRate (Rolling 10-trade cycle)
    const winRate = autoMarketConfig.winRate !== undefined ? autoMarketConfig.winRate : 20;
    const maxWinsAllowed = Math.round((winRate / 100) * 10);
    const minLossesRequired = 10 - maxWinsAllowed;

    const recentTrades = await query(
      `SELECT status, target_result 
       FROM trades 
       WHERE user_id = ? AND is_demo = ? AND status IN ('won', 'lost') 
       ORDER BY id DESC LIMIT 10`,
      [userId, isDemoVal],
      conn
    ) as any[];

    const wonCount = recentTrades.filter(t => t.status === 'won').length;
    const lostCount = recentTrades.filter(t => t.status === 'lost').length;
    const openWinsCount = openTrades.filter(t => t.target_result === 'win').length;

    // If user already hit the maximum allowed wins for the configured win rate (e.g., 20% -> 2 wins), strictly enforce loss
    if ((wonCount + openWinsCount) >= maxWinsAllowed) {
      return 'loss';
    }

    // If user already hit the required losses (e.g. 80% loss -> 8 losses), allow a win to maintain the target win rate
    if (lostCount >= minLossesRequired && recentTrades.length >= minLossesRequired) {
      return 'win';
    }

    // 3. Probabilistic distribution based on configured win rate
    const roll = Math.random() * 100;
    if (roll < winRate) {
      return 'win';
    } else {
      return 'loss';
    }
  } catch (err: any) {
    console.error('Error deciding trade outcome:', err.message);
    return 'loss'; // Default to house risk protection
  }
}

export async function determineTradeOutcome(trade: {
  user_id: string;
  market_id: string;
  amount: number | string;
  direction: string;
  duration: number;
  is_demo: boolean;
  expiry_time: number;
  created_at: number;
}, conn?: any): Promise<'win' | 'loss' | 'draw' | null> {
  return decideTradeOutcome({
    userId: trade.user_id,
    pair: trade.market_id,
    amount: trade.amount,
    direction: trade.direction,
    duration: trade.duration,
    isDemo: trade.is_demo,
    expiryTime: trade.expiry_time
  }, conn);
}

export async function settleTrade(tradeId: number | string, currentMarketPrice?: number) {
  try {
    const result = await transaction(async (conn) => {
      // Lock the trade record
      let trade: any = null;
      if (typeof tradeId === 'number' || !isNaN(Number(tradeId))) {
        trade = await get('SELECT * FROM trades WHERE id = ?', [Number(tradeId)], conn) as any;
      }
      if (!trade && tradeId) {
        trade = await get('SELECT * FROM trades WHERE firebase_id = ?', [tradeId.toString()], conn) as any;
      }

      if (!trade) return null;
      if (trade.status !== 'open') {
         return {
            id: trade.id.toString(),
            userId: trade.user_id,
            marketId: trade.market_id,
            asset: trade.market_id,
            amount: parseFloat(trade.amount),
            direction: trade.direction,
            type: trade.direction,
            entryPrice: parseFloat(trade.entry_price),
            exitPrice: parseFloat(trade.exit_price || 0),
            status: trade.status,
            payoutAmount: parseFloat(trade.payout_amount || 0),
            duration: trade.duration,
            expiryTime: trade.expiry_time,
            accountType: trade.account_type,
            isDemo: !!trade.is_demo,
            createdAt: trade.created_at,
            settledAt: trade.settled_at
         };
      }

      const isDemo = !!trade.is_demo || trade.account_type === 'demo';
      const marketsPool = isDemo ? markets_demo : markets_real;
      const m = marketsPool[trade.market_id];
      
      let exitPrice = currentMarketPrice !== undefined && !isNaN(Number(currentMarketPrice))
        ? Number(currentMarketPrice)
        : (m ? Number(m.price) : parseFloat(trade.entry_price));
      const entryPrice = parseFloat(trade.entry_price);

      const dir = (trade.direction || trade.type || 'up').toLowerCase();
      const isUp = dir === 'up' || dir === 'call' || dir === 'buy';
      const targetResult = trade.target_result;

      // Batch Harmonization: Check any sibling trade settled on the same market within the same 1-second expiry window
      const tradeExpiry = Number(trade.expiry_time || 0);
      let settledBatchTrade: any = null;

      if (tradeExpiry > 0) {
        settledBatchTrade = await get(
          `SELECT exit_price, status 
           FROM trades 
           WHERE user_id = ? AND (LOWER(market_id) = LOWER(?) OR LOWER(asset) = LOWER(?))
           AND is_demo = ? AND status IN ('won', 'lost', 'draw') AND exit_price IS NOT NULL
           AND ABS(expiry_time - ?) <= 1 AND id != ?
           ORDER BY id DESC LIMIT 1`,
          [trade.user_id, trade.market_id, trade.market_id, isDemo ? 1 : 0, tradeExpiry, trade.id],
          conn
        ) as any;
      }

      if (settledBatchTrade && settledBatchTrade.exit_price) {
        const batchExit = parseFloat(settledBatchTrade.exit_price);
        if (!isNaN(batchExit) && batchExit > 0) {
          exitPrice = batchExit;
        }
      }

      // Helper to round to asset display precision to ensure refund if screen price is equal
      const roundToAssetPrecision = (val: number) => {
        if (val >= 10000) return Math.round(val);
        if (val >= 1000) return parseFloat(val.toFixed(1));
        if (val >= 100) return parseFloat(val.toFixed(2));
        if (val >= 10) return parseFloat(val.toFixed(3));
        if (val >= 1) return parseFloat(val.toFixed(4));
        return parseFloat(val.toFixed(5));
      };

      const pExitOriginal = roundToAssetPrecision(exitPrice);
      const pEntry = roundToAssetPrecision(entryPrice);
      let isDraw = pExitOriginal === pEntry;
      let isWin = false;

      // If price was completely flat / draw, and targetResult was specified for live account risk management
      if (isDraw && targetResult && autoMarketConfig.enabled && !isDemo) {
        const minDelta = Math.max(0.00001, entryPrice * 0.0001);
        if (targetResult === 'win') {
          exitPrice = isUp ? Number((entryPrice + minDelta).toFixed(8)) : Number((entryPrice - minDelta).toFixed(8));
        } else if (targetResult === 'loss') {
          exitPrice = isUp ? Number((entryPrice - minDelta).toFixed(8)) : Number((entryPrice + minDelta).toFixed(8));
        }
        const pExitManipulated = roundToAssetPrecision(exitPrice);
        isDraw = pExitManipulated === pEntry;
        if (!isDraw) {
          isWin = isUp ? pExitManipulated > pEntry : pExitManipulated < pEntry;
        }
      } else {
        if (!isDraw) {
          isWin = isUp ? pExitOriginal > pEntry : pExitOriginal < pEntry;
        }
      }

      const tradeAmount = new Big(trade.amount);

      let newStatus = 'lost';
      let payoutAmount = new Big(0);

      // Payout rate resolution: must always be valid, defaults to 80-95%
      let payoutPercent = parseFloat(trade.payout || trade.payout_rate || (m ? m.payout : 80) || 80);
      if (isNaN(payoutPercent) || payoutPercent <= 0) {
        payoutPercent = 80;
      }

      if (isWin) {
        newStatus = 'won';
        const profit = tradeAmount.times(payoutPercent).div(100);
        payoutAmount = tradeAmount.plus(profit);
      } else if (isDraw) {
        newStatus = 'draw';
        payoutAmount = tradeAmount;
      }

      // Update trade in SQL with exact precision
      await run(
        'UPDATE trades SET status = ?, exit_price = ?, payout_amount = ?, settled_at = ? WHERE id = ?',
        [newStatus, exitPrice.toString(), payoutAmount.toFixed(2), Math.floor(Date.now() / 1000), trade.id],
        conn
      );

      if (isDemo) {
        await limitUserDemoTrades(trade.user_id, conn);
      }

      // Unregister from in-memory steering cache immediately
      unregisterSteeringTrade(trade.id);

      // Sync trade settlement to Firestore asynchronously (fire-and-forget, never block SQL transaction)
      if (adminDb) {
        (async () => {
          try {
            await adminDb.collection('trades').doc(trade.id.toString()).update({
              status: newStatus,
              exitPrice: parseFloat(exitPrice.toString()),
              payoutAmount: payoutAmount.toNumber(),
              settledAt: Math.floor(Date.now() / 1000)
            });
          } catch (fsErr: any) {
            try {
              const fullTrade = await get('SELECT * FROM trades WHERE id = ?', [trade.id]);
              if (fullTrade) {
                const mapped = {
                  id: (fullTrade as any).id.toString(),
                  userId: (fullTrade as any).user_id,
                  marketId: (fullTrade as any).market_id,
                  asset: (fullTrade as any).market_id,
                  amount: parseFloat((fullTrade as any).amount),
                  direction: (fullTrade as any).direction,
                  type: (fullTrade as any).direction,
                  entryPrice: parseFloat((fullTrade as any).entry_price),
                  exitPrice: parseFloat(exitPrice.toString()),
                  status: newStatus,
                  payoutAmount: payoutAmount.toNumber(),
                  duration: (fullTrade as any).duration,
                  expiryTime: (fullTrade as any).expiry_time,
                  accountType: (fullTrade as any).account_type,
                  isDemo: !!(fullTrade as any).is_demo,
                  createdAt: (fullTrade as any).created_at,
                  settledAt: Math.floor(Date.now() / 1000)
                };
                await adminDb.collection('trades').doc(trade.id.toString()).set(mapped);
              }
            } catch (e) {}
          }
        })().catch(() => {});
      }

      // Update user balance if payout > 0
      if (payoutAmount.gt(0)) {
        if (trade.account_type === 'tournament' && trade.tournament_id) {
           const participant = await get('SELECT score FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [trade.tournament_id, trade.user_id], conn) as any;
           if (participant) {
             const currentBalance = new Big(participant.score || 0);
             const newBalance = currentBalance.plus(payoutAmount).toFixed(6);
             await run(`UPDATE tournament_participants SET score = ? WHERE tournament_id = ? AND user_id = ?`, [newBalance, trade.tournament_id, trade.user_id], conn);
             
             // Sync updated score to Firestore
             import('../lib/firebase-admin.ts').then(({ syncTournamentScoreToFirestore }) => {
               syncTournamentScoreToFirestore(trade.tournament_id, trade.user_id, parseFloat(newBalance)).catch(() => {});
             }).catch(() => {});
           }
        } else {
           const balanceField = (trade.is_demo || trade.account_type === 'demo') ? 'demo_balance' : 'real_balance';
           // Lock user record
           const user = await get('SELECT ' + balanceField + ' FROM users WHERE uid = ?', [trade.user_id], conn) as any;
           if (user) {
               const currentBalance = new Big(user[balanceField] || 0);
               const newBalance = currentBalance.plus(payoutAmount).toFixed(6);
               await run(`UPDATE users SET ${balanceField} = ? WHERE uid = ?`, [newBalance, trade.user_id], conn);
               
               // DR & Audit Logging (non-blocking)
               if (trade.account_type === 'real' || !trade.is_demo) {
                 import('./snapshotService.ts').then(({ SnapshotService }) => {
                   SnapshotService.logFinancialAudit(trade.user_id, 'trade_payout', payoutAmount.toFixed(6), currentBalance.toFixed(6), newBalance, `trade_${tradeId}`).catch(() => {});
                   SnapshotService.syncUserForDR(trade.user_id).catch(() => {});
                 }).catch(() => {});
               }
               
               // Sync to Firestore immediately and notify UI
               (async () => {
                 try {
                   const { syncUserToFirestore } = await import('../lib/firebase-admin.ts');
                   const { mapUserForFrontend } = await import('../lib/user-utils.ts');
                   const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [trade.user_id]) as any;
                   if (updatedUser) {
                     const mapped = mapUserForFrontend(updatedUser);
                     syncUserToFirestore(trade.user_id, mapped).catch(() => {});
                     const { getIO } = await import('./socketService.ts');
                     getIO().to(`user_${trade.user_id}`).emit('user_profile_update', mapped);
                   }
                 } catch (e) {}
               })().catch(() => {});
               
               if (!trade.is_demo && trade.account_type !== 'demo' && trade.account_type !== 'tournament') {
                 createAuditLog(trade.user_id, 'trade_payout', 'trade', trade.id.toString(), { payoutAmount: payoutAmount.toNumber(), newBalance }).catch(() => {});
               }
           }
        }
      }

      if (!trade.is_demo && trade.account_type !== 'demo' && trade.account_type !== 'tournament') {
        const profit = payoutAmount.minus(tradeAmount).toNumber();
        // Update leaderboard stats safely so auxiliary stats calculations never abort the trade settlement transaction
        updateLeaderboardStats(trade.user_id, newStatus as any, profit, tradeAmount.toNumber()).catch(lbErr => {
          logger.error('Failed to update leaderboard stats asynchronously:', lbErr);
        });

        // 1. Increment trader's total live trade volume and BX Coins
        const bxCoinsEarned = Math.max(1, Math.floor(tradeAmount.toNumber() / 10)); // 1 coin per $10, min 1
        await run('UPDATE users SET total_live_volume = total_live_volume + ?, bx_coins = bx_coins + ? WHERE uid = ?', [tradeAmount.toNumber(), bxCoinsEarned, trade.user_id], conn);

        // 2. Process real-time Affiliate Commission
        try {
          const traderUser = await get('SELECT referred_by_uid, referral_sub_id, referral_type FROM users WHERE uid = ?', [trade.user_id], conn) as any;
          if (traderUser && traderUser.referred_by_uid) {
            const referrerUid = traderUser.referred_by_uid;
            const referrer = await get('SELECT uid, custom_affiliate_share, affiliate_balance, total_affiliate_earnings FROM users WHERE uid = ? OR referral_code = ?', [referrerUid, referrerUid], conn) as any;
            
            if (referrer) {
              const actualReferrerUid = referrer.uid;
              
              // Determine dynamic tier share percentage based on the referrer's referral count
              let refCount = 0;
              try {
                const countResult = await get('SELECT COUNT(*) as cnt FROM users WHERE referred_by_uid = ?', [actualReferrerUid], conn) as any;
                refCount = countResult?.cnt || 0;
              } catch (cntErr) {
                logger.error('Failed to count referrals for referrer in settlement:', cntErr);
              }

              const settings: any = await getAllAppSettings().catch(() => ({}));
              let tierShare = 50;
              if (refCount >= 201) {
                tierShare = Number(settings.affiliate_share_elite) || 80;
              } else if (refCount >= 51) {
                tierShare = Number(settings.affiliate_share_vip) || 70;
              } else if (refCount >= 11) {
                tierShare = Number(settings.affiliate_share_pro) || 60;
              } else {
                tierShare = Number(settings.affiliate_share_starter) || 50;
              }

              const sharePct = (referrer.custom_affiliate_share && referrer.custom_affiliate_share > 0) 
                ? referrer.custom_affiliate_share 
                : tierShare;
              
              const referralType = traderUser.referral_type || 'revshare';
              let commAmount = 0;
              
              if (referralType === 'turnover') {
                // Turnover model: 2% to 5% share on TOTAL volume (win or loss)
                // We use the tierShare logic but scale it for turnover (2% starter, up to 5% elite)
                let turnoverRate = 2; // Starter
                if (refCount >= 201) turnoverRate = 5; // Elite
                else if (refCount >= 51) turnoverRate = 4; // VIP
                else if (refCount >= 11) turnoverRate = 3; // PRO
                else if (refCount >= 5) turnoverRate = 2.5; // Junior Pro
                
                commAmount = tradeAmount.times(turnoverRate).div(100).toNumber();
              } else {
                // Default RevShare model: Commission only on LOST trades (40% to 80%)
                if (newStatus === 'lost') {
                  commAmount = tradeAmount.times(sharePct).div(100).toNumber();
                }
              }

              if (commAmount > 0) {
                const commFormatted = commAmount.toFixed(2);
                await run(
                  'UPDATE users SET affiliate_balance = affiliate_balance + ?, total_affiliate_earnings = total_affiliate_earnings + ? WHERE uid = ?',
                  [commFormatted, commFormatted, actualReferrerUid],
                  conn
                );

                await createAuditLog(actualReferrerUid, 'affiliate_trade_commission', 'user', trade.user_id, { 
                  tradeId: trade.id, 
                  tradeAmount: tradeAmount.toNumber(), 
                  tradeStatus: newStatus,
                  commission: commFormatted 
                });

                if (adminDb) {
                  try {
                    await adminDb.collection('affiliate_commissions').add({
                      referrerUid: actualReferrerUid,
                      referredUid: trade.user_id,
                      tradeId: trade.id,
                      amount: parseFloat(commFormatted),
                      tradeAmount: tradeAmount.toNumber(),
                      tradeStatus: newStatus,
                      subId: traderUser.referral_sub_id || 'default',
                      createdAt: Date.now(),
                      type: 'trade_commission'
                    });

                    const currentAffBal = parseFloat(referrer.affiliate_balance || 0);
                    const currentTotalEarnings = parseFloat(referrer.total_affiliate_earnings || 0);
                    await adminDb.collection('users').doc(actualReferrerUid).update({
                      affiliateBalance: currentAffBal + parseFloat(commFormatted),
                      totalAffiliateEarnings: currentTotalEarnings + parseFloat(commFormatted)
                    });
                  } catch (fsErr: any) {
                    logger.error(`Failed to record affiliate_commissions to Firestore: ${fsErr.message}`);
                  }
                }

                // Notify referrer via Socket and Firestore
                const updatedReferrer = await get('SELECT * FROM users WHERE uid = ?', [actualReferrerUid], conn) as any;
                if (updatedReferrer) {
                  const mappedReferrer = mapUserForFrontend(updatedReferrer);
                  getIO().to(`user_${actualReferrerUid}`).emit('user_profile_update', mappedReferrer);
                  syncUserToFirestore(actualReferrerUid, mappedReferrer);
                }
              }
            }
          }
        } catch (affErr: any) {
          logger.error(`Affiliate commission calculation error: ${affErr.message}`);
        }
      }

      const fullTrade = await get('SELECT * FROM trades WHERE id = ?', [trade.id], conn) as any;

      let tournamentBalance = null;
      if (trade.account_type === 'tournament' && trade.tournament_id) {
         const participant = await get('SELECT score FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [trade.tournament_id, trade.user_id], conn) as any;
         if (participant) {
           tournamentBalance = parseFloat(participant.score || 0);
         }
      }

      return { 
        id: tradeId, 
        status: newStatus, 
        exitPrice, 
        payoutAmount: payoutAmount.toNumber(), 
        userId: trade.user_id,
        isDemo,
        accountType: trade.account_type,
        asset: trade.market_id,
        direction: trade.direction,
        type: trade.direction,
        amount: parseFloat(trade.amount),
        entryPrice: parseFloat(trade.entry_price),
        createdAt: trade.created_at,
        settledAt: Math.floor(Date.now() / 1000),
        payoutRate: parseFloat(trade.payout || trade.payout_rate || (m ? m.payout : 80) || 80),
        payout: parseFloat(trade.payout || trade.payout_rate || (m ? m.payout : 80) || 80),
        tournamentBalance
      };
    });

    if (result) {
      const io = getIO();
      const user = await get('SELECT * FROM users WHERE uid = ?', [result.userId]) as any;
      const mapped = mapUserForFrontend(user);

      const enrichedResult = {
        ...result,
        user: mapped,
        balance: mapped?.balance ?? 0,
        realBalance: mapped?.balance ?? 0,
        demoBalance: mapped?.demoBalance ?? 10000,
        ...(result.tournamentBalance !== undefined && result.tournamentBalance !== null ? { tournamentBalance: result.tournamentBalance } : {})
      };

      // Notify user via socket
      io.to(`user_${result.userId}`).emit('trade_settled', enrichedResult);
      
      if (mapped) {
        // Also notify profile and balance updates
        io.to(`user_${result.userId}`).emit('user_profile_update', mapped);
        io.to(`user_${result.userId}`).emit('balance_update', {
          real_balance: mapped.balance,
          realBalance: mapped.balance,
          balance: mapped.balance,
          demo_balance: mapped.demoBalance,
          demoBalance: mapped.demoBalance
        });
        syncUserToFirestore(result.userId, mapped).catch(err => logger.error('Firestore user sync error on trade settlement:', err));
      }

      return enrichedResult;
    }

    return result;
  } catch (err) {
    console.error('Settlement error:', err);
    return null;
  }
}

/**
 * Automatically purges demo trades older than 7 days from both SQL database and Firestore.
 * Live balance trades are preserved permanently.
 */
export async function cleanupOldDemoTrades() {
  try {
    const thresholdMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    logger.info(`[TradeCleanup] Starting automatic cleanup of demo trades older than 7 days... Threshold: ${new Date(thresholdMs).toISOString()}`);
    
    // 1. Delete from PostgreSQL / local SQL database
    await run('DELETE FROM trades WHERE is_demo = 1 AND created_at < ?', [thresholdMs]);
    logger.info('[TradeCleanup] Successfully cleaned up old demo trades from local SQL database.');

    // 2. Delete from Firebase Firestore (using batch delete)
    if (adminDb) {
      const snapshot = await adminDb.collection('trades')
        .where('isDemo', '==', 1)
        .where('createdAt', '<', thresholdMs)
        .get();

      if (!snapshot.empty) {
        logger.info(`[TradeCleanup] Found ${snapshot.size} demo trades in Firestore to delete.`);
        const batch = adminDb.batch();
        snapshot.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        logger.info(`[TradeCleanup] Successfully deleted ${snapshot.size} old demo trades from Firestore.`);
      } else {
        logger.info('[TradeCleanup] No old demo trades found in Firestore to purge.');
      }
    }
  } catch (err: any) {
    logger.error('[TradeCleanup] Failed to cleanup old demo trades:', err.message || err);
  }
}

/**
 * Limits demo trade history to a maximum of 30 records per user in database and Firestore.
 * Excess oldest demo trades are automatically deleted. Real trade history is preserved permanently.
 */
export async function limitUserDemoTrades(userId: string, conn?: any) {
  try {
    const demoTrades = await query(
      'SELECT id FROM trades WHERE user_id = ? AND is_demo = 1 ORDER BY created_at DESC, id DESC',
      [userId],
      conn
    ) as any[];

    if (demoTrades && demoTrades.length > 30) {
      const excessTrades = demoTrades.slice(30);
      const excessIds = excessTrades.map(t => t.id);

      if (excessIds.length > 0) {
        const placeholders = excessIds.map(() => '?').join(',');
        await run(
          `DELETE FROM trades WHERE id IN (${placeholders})`,
          excessIds,
          conn
        );
        logger.info(`[DemoLimit] Successfully pruned ${excessIds.length} excess demo trades for user ${userId} from SQL.`);

        if (adminDb) {
          const batch = adminDb.batch();
          let count = 0;
          for (const id of excessIds) {
            batch.delete(adminDb.collection('trades').doc(String(id)));
            count++;
            if (count >= 400) {
              await batch.commit();
              count = 0;
            }
          }
          if (count > 0) {
            await batch.commit();
          }
          logger.info(`[DemoLimit] Successfully pruned ${excessIds.length} excess demo trades for user ${userId} from Firestore.`);
        }
      }
    }
  } catch (err: any) {
    logger.error('[DemoLimit] Failed to limit user demo trades:', err?.message || err);
  }
}



