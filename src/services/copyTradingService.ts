import { get, query, run, transaction } from '../db/mysql-db.ts';
import { getIO } from './socketService.ts';
import { mapUserForFrontend } from '../lib/user-utils.ts';
import Big from 'big.js';
import { markets_real } from './marketService.ts';
import logger from '../lib/logger.ts';

/**
 * Process copy trading for a master trader's trade
 */
export async function processCopyTrading(masterId: string, tradeData: { 
  marketId: string, 
  direction: string, 
  entryPrice: number, 
  isDemo: boolean,
  amount?: number,
  duration?: number, 
  tradeId?: number 
}) {
  try {
    // 1. Find all active followers for this master
    const followers = await query("SELECT * FROM active_copies WHERE master_id = ? AND status = 'active'", [masterId]) as any[];
    
    for (const follower of followers) {
      try {
        await transaction(async (conn) => {
          // Check follower's trade limit
          if (follower.trades_limit > 0 && follower.copied_trades >= follower.trades_limit) {
            // Deactivate copy relationship
            await run("UPDATE active_copies SET status = 'inactive' WHERE id = ?", [follower.id], conn);
            return;
          }

          const userId = follower.user_id;
          const isDemo = tradeData.isDemo; // Usually followers copy the same account type or real
          const balanceField = isDemo ? 'demo_balance' : 'real_balance';
          
          // Get follower's balance
          const user = await get(`SELECT ${balanceField} FROM users WHERE uid = ?`, [userId], conn) as any;
          if (!user) return;

          const currentBalance = new Big(user[balanceField] || 0);
          const tradeAmount = new Big(follower.max_trade_amount || '10');

          if (currentBalance.lt(tradeAmount)) {
            // Not enough balance, maybe notify?
            return;
          }

          // Deduct balance
          const newBalance = currentBalance.minus(tradeAmount).toFixed(2);
          await run(`UPDATE users SET ${balanceField} = ? WHERE uid = ?`, [newBalance, userId], conn);

          // Create trade
          const duration = tradeData.duration || 60;
          const expiryTime = Math.floor((Date.now() + duration * 1000) / 1000);
          await run(
            `INSERT INTO trades (user_id, market_id, amount, direction, entry_price, duration, expiry_time, is_demo, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, tradeData.marketId, tradeAmount.toString(), tradeData.direction, tradeData.entryPrice.toString(), duration, expiryTime, isDemo ? 1 : 0, 'open'],
            conn
          );

          // Update copy stats
          await run('UPDATE active_copies SET copied_trades = copied_trades + 1 WHERE id = ?', [follower.id], conn);

          // Notify follower
          const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId], conn) as any;
          const mapped = mapUserForFrontend(updatedUser);
          getIO().to(`user_${userId}`).emit('user_profile_update', mapped);
          
          // Sync to Firestore
          try {
            const { syncUserToFirestore } = await import('../lib/firebase-admin.ts');
            syncUserToFirestore(userId, mapped).catch(e => logger.error(`Sync follower balance failed for ${userId}:`, e));
          } catch (e) {}

          getIO().to(`user_${userId}`).emit('trade_placed', { success: true, message: `Copied trade from ${follower.master_name}` });
        });
      } catch (err) {
        logger.error(`Failed to process copy for user ${follower.user_id}:`, err);
      }
    }
  } catch (err) {
    logger.error(`Error in processCopyTrading for master ${masterId}:`, err);
  }
}

/**
 * Start simulation of mock master traders to make the platform feel alive
 */
export function startMasterSimulation() {
  const runSimulation = async () => {
    try {
      // 1. Get mock masters
      const mockMasters = await query('SELECT * FROM master_traders') as any[];
      if (!mockMasters || mockMasters.length === 0) {
        setTimeout(runSimulation, 30000);
        return;
      }

      // 2. Pick random number of masters to "trade" (1 to 3)
      const numTrades = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...mockMasters].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numTrades);
      
      for (const master of selected) {
        // 3. Random trade parameters
        const marketIds = Object.keys(markets_real);
        const marketId = marketIds[Math.floor(Math.random() * marketIds.length)];
        const direction = Math.random() > 0.5 ? 'up' : 'down';
        const duration = 60; // 1 minute
        const currentPrice = markets_real[marketId]?.price || 1.0;

        // 4. Process copying for this simulated trade (strictly DEMO mode for simulation)
        await processCopyTrading(master.id, {
          marketId,
          direction,
          duration,
          entryPrice: currentPrice,
          isDemo: true
        });
      }

    } catch (err) {
      logger.error('Master simulation error:', err);
    }
    setTimeout(runSimulation, 15000); // Every 15 seconds 1-3 masters trade
  };

  runSimulation();
}

/**
 * Seed initial master traders if the table is empty
 */
export async function seedMasterTraders() {
  try {
    const existing = await query('SELECT COUNT(*) as count FROM master_traders') as any[];
    // Force re-seeding if we have fewer than 100 traders to ensure the "unlimited" feel
    if (existing[0].count >= 100) return;

    if (existing[0].count > 0) {
      await run('DELETE FROM master_traders');
    }

    const baseTraders = [
      { id: 'm1', name: 'CRISHTTRADER', country: '🇻🇪', win_rate: 88, profit: 45000, followers: 6 },
      { id: 'm2', name: 'OBOROTEN', country: '🇺🇦', win_rate: 81, profit: 86000, followers: 13 },
      { id: 'm3', name: 'GEOVANNY', country: '🇨🇴', win_rate: 74, profit: 12000, followers: 5 },
      { id: 'm4', name: 'ALEX FOREX', country: '🇬🇧', win_rate: 92, profit: 125000, followers: 38 },
      { id: 'm5', name: 'BINANCE WHALE', country: '🇸🇬', win_rate: 85, profit: 240000, followers: 71 },
      { id: 'm6', name: 'TRADEMINATOR', country: '🇧🇩', win_rate: 89, profit: 155000, followers: 42 },
      { id: 'm7', name: 'SHARK_TRADER', country: '🇺🇸', win_rate: 91, profit: 198000, followers: 85 },
      { id: 'm8', name: 'ELITE_SIGNALS', country: '🇦🇪', win_rate: 84, profit: 92000, followers: 54 },
      { id: 'm9', name: 'CRYPTO_KING', country: '🇰🇷', win_rate: 79, profit: 310000, followers: 120 },
      { id: 'm10', name: 'MASTER_ZEN', country: '🇯🇵', win_rate: 94, profit: 75000, followers: 29 },
      { id: 'm11', name: 'BULL_RUNNER', country: '🇧🇷', win_rate: 82, profit: 64000, followers: 31 },
      { id: 'm12', name: 'SCALPER_PRO', country: '🇩🇪', win_rate: 87, profit: 112000, followers: 47 },
      { id: 'm13', name: 'DHAKA_WIZARD', country: '🇧🇩', win_rate: 90, profit: 48000, followers: 19 },
      { id: 'm14', name: 'VOLATILITY_X', country: '🇷🇺', win_rate: 76, profit: 210000, followers: 63 },
      { id: 'm15', name: 'PIPS_HUNTER', country: '🇦🇺', win_rate: 83, profit: 56000, followers: 22 },
      { id: 'm16', name: 'FOREX_MASTER', country: '🇨🇭', win_rate: 95, profit: 185000, followers: 92 },
      { id: 'm17', name: 'WALLSTREET_BET', country: '🇺🇸', win_rate: 71, profit: 420000, followers: 156 },
      { id: 'm18', name: 'EAGLE_EYE', country: '🇹🇷', win_rate: 88, profit: 34000, followers: 14 },
      { id: 'm19', name: 'GOLD_DIGGER', country: '🇿🇦', win_rate: 86, profit: 128000, followers: 36 },
      { id: 'm20', name: 'TECH_ANALYSIS', country: '🇮🇳', win_rate: 80, profit: 42000, followers: 25 },
      { id: 'm21', name: 'QUANT_TRADE', country: '🇨🇦', win_rate: 93, profit: 265000, followers: 78 },
      { id: 'm22', name: 'TREND_FOLLOWER', country: '🇫🇷', win_rate: 78, profit: 89000, followers: 41 },
      { id: 'm23', name: 'CHART_GURU', country: '🇮🇩', win_rate: 84, profit: 52000, followers: 18 },
      { id: 'm24', name: 'NIGHT_OWL', country: '🇪🇸', win_rate: 89, profit: 97000, followers: 33 },
      { id: 'm25', name: 'ALPHA_TRADER', country: '🇸🇬', win_rate: 91, profit: 143000, followers: 59 },
      { id: 'm26', name: 'MARCUS_FX', country: '🇳🇬', win_rate: 85, profit: 28000, followers: 11 },
      { id: 'm27', name: 'VIKING_TRADE', country: '🇳🇴', win_rate: 87, profit: 76000, followers: 27 },
      { id: 'm28', name: 'SAMURAI_TRADER', country: '🇯🇵', win_rate: 92, profit: 154000, followers: 68 },
      { id: 'm29', name: 'PHOENIX_RISE', country: '🇬🇷', win_rate: 81, profit: 61000, followers: 24 },
      { id: 'm30', name: 'LEGACY_TRADE', country: '🇮🇹', win_rate: 83, profit: 119000, followers: 51 }
    ];

    const countries = ['🇧🇩', '🇺🇸', '🇬🇧', '🇮🇳', '🇦🇪', '🇨🇦', '🇩🇪', '🇸🇬', '🇦🇺', '🇫🇷', '🇮🇩', '🇲🇾', '🇹🇷', '🇰🇷', '🇧🇷', '🇷🇺', '🇻🇳', '🇵🇭', '🇳🇬', '🇿🇦', '🇰🇼', '🇶🇦', '🇸🇦', '🇯🇵', '🇲🇽', '🇪🇸', '🇮🇹'];
    const prefixes = ['Pro', 'Elite', 'Master', 'Alpha', 'Expert', 'Swift', 'Prime', 'Global', 'Smart', 'Neo', 'Max', 'Ultra', 'Super', 'Hyper', 'Nova', 'Apex'];
    const suffixes = ['Trader', 'Forex', 'Signals', 'Wizard', 'King', 'Bull', 'Scalper', 'Quantum', 'Strategy', 'Gold', 'Profit', 'Wealth', 'Edge', 'Flow', 'Market'];

    const traders = [...baseTraders];
    for (let i = 31; i <= 150; i++) {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      const s = suffixes[Math.floor(Math.random() * suffixes.length)];
      const name = `${p}_${s}_${i}`;
      const country = countries[Math.floor(Math.random() * countries.length)];
      const winRate = 65 + Math.floor(Math.random() * 32); // 65% to 97%
      const profit = 10000 + Math.floor(Math.random() * 500000);
      const followers = Math.floor(Math.random() * 120);

      traders.push({
        id: `m${i}`,
        name,
        country,
        win_rate: winRate,
        profit,
        followers
      });
    }

    for (const t of traders) {
      await run(
        'INSERT INTO master_traders (id, name, country, win_rate, profit, followers) VALUES (?, ?, ?, ?, ?, ?)',
        [t.id, t.name, t.country, t.win_rate, t.profit, t.followers]
      );
    }
    logger.info(`Master traders seeded successfully (${traders.length} traders)`);
  } catch (err) {
    logger.error('Failed to seed master traders:', err);
  }
}
