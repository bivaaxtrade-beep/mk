import { get, query, run } from '../db/mysql-db.ts';
import { getIO } from './socketService.ts';

export const updateLeaderboardStats = async (userId: string, tradeStatus: 'won' | 'lost' | 'draw', profit: number, volume: number, conn?: any) => {
  try {
    const stat = await get('SELECT * FROM leaderboard_stats WHERE user_id = ?', [userId], conn) as any;
    const now = Date.now();
    
    // Safely parse input numbers to ensure they are finite numbers
    const addedProfit = Number.isFinite(Number(profit)) ? parseFloat(Number(profit).toFixed(4)) : 0;
    const addedVolume = Number.isFinite(Number(volume)) ? parseFloat(Number(volume).toFixed(4)) : 0;

    if (!stat) {
      const isWin = tradeStatus === 'won';
      const currentStreak = isWin ? 1 : (tradeStatus === 'lost' ? -1 : 0);
      const won = isWin ? 1 : 0;
      const lost = tradeStatus === 'lost' ? 1 : 0;
      const draw = tradeStatus === 'draw' ? 1 : 0;
      
      const roi = addedVolume > 0 ? parseFloat(((Math.max(0, addedProfit) / addedVolume) * 100).toFixed(2)) : 0;

      await run(`
        INSERT INTO leaderboard_stats (
          user_id, total_profit, total_trades, won_trades, lost_trades, draw_trades,
          total_volume, current_streak, max_streak, roi, last_trade_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, addedProfit, 1, won, lost, draw, addedVolume, currentStreak, isWin ? 1 : 0, roi, now], conn);
    } else {
      let currentStreak = parseInt(String(stat.current_streak || 0), 10) || 0;
      let maxStreak = parseInt(String(stat.max_streak || 0), 10) || 0;

      if (tradeStatus === 'won') {
        currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (tradeStatus === 'lost') {
        currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
      } else {
        currentStreak = 0; // Draw resets streak
      }

      // Safe numeric conversion for existing values (handles strings from Postgres NUMERIC)
      const existingVolume = parseFloat(String(stat.total_volume || '0')) || 0;
      const newVolume = parseFloat((existingVolume + addedVolume).toFixed(4));

      // Safe numeric conversion for profit
      const existingProfit = parseFloat(String(stat.total_profit || '0')) || 0;
      const newProfit = parseFloat((existingProfit + addedProfit).toFixed(4));

      const newRoi = newVolume > 0 ? parseFloat(((Math.max(0, newProfit) / newVolume) * 100).toFixed(2)) : 0;
      const newWonTrades = (parseInt(String(stat.won_trades || 0), 10) || 0) + (tradeStatus === 'won' ? 1 : 0);
      const newLostTrades = (parseInt(String(stat.lost_trades || 0), 10) || 0) + (tradeStatus === 'lost' ? 1 : 0);
      const newDrawTrades = (parseInt(String(stat.draw_trades || 0), 10) || 0) + (tradeStatus === 'draw' ? 1 : 0);
      const newTotalTrades = (parseInt(String(stat.total_trades || 0), 10) || 0) + 1;

      await run(`
        UPDATE leaderboard_stats SET 
          total_profit = ?,
          total_trades = ?,
          won_trades = ?,
          lost_trades = ?,
          draw_trades = ?,
          total_volume = ?,
          current_streak = ?,
          max_streak = ?,
          roi = ?,
          last_trade_at = ?
        WHERE user_id = ?
      `, [
        newProfit, 
        newTotalTrades,
        newWonTrades,
        newLostTrades,
        newDrawTrades,
        newVolume, 
        currentStreak, 
        maxStreak, 
        newRoi, 
        now, 
        userId
      ], conn);
    }
  } catch (err) {
    console.error('Error updating leaderboard stats:', err);
  }
};

function seedRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export const fetchLeaderboards = async () => {
  let allTime: any[] = [];
  let winRate: any[] = [];
  let streaks: any[] = [];
  let daily: any[] = [];
  let weekly: any[] = [];
  let monthly: any[] = [];

  try {
    // Ensure leaderboard_stats table exists if not already
    await run(`
      CREATE TABLE IF NOT EXISTS leaderboard_stats (
        user_id TEXT PRIMARY KEY,
        total_profit NUMERIC DEFAULT 0,
        total_trades INTEGER DEFAULT 0,
        won_trades INTEGER DEFAULT 0,
        lost_trades INTEGER DEFAULT 0,
        draw_trades INTEGER DEFAULT 0,
        total_volume NUMERIC DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        max_streak INTEGER DEFAULT 0,
        roi NUMERIC DEFAULT 0,
        last_trade_at INTEGER
      )
    `).catch(() => {});

    // 1. All Time Top Profit
    try {
      allTime = await query(`
        SELECT l.user_id, 
               CAST(l.total_profit AS REAL) as total_profit, 
               l.total_trades, l.won_trades, l.lost_trades,
               CAST(u.real_balance AS REAL) as balance,
               COALESCE(u.nickname, u.display_name) as display_name, u.photo_url, u.country, u.country_code
        FROM leaderboard_stats l
        JOIN users u ON l.user_id = u.uid
        WHERE l.total_profit > 0
        ORDER BY total_profit DESC
        LIMIT 100
      `) || [];
    } catch (e) {
      console.error('Error fetching allTime leaderboard:', e);
      allTime = [];
    }

    // 2. Highest Win Rate (min 10 trades)
    try {
      winRate = await query(`
        SELECT l.*, COALESCE(u.nickname, u.display_name) as display_name, u.photo_url, u.country, u.country_code,
        CAST(l.won_trades AS REAL) / CAST(l.total_trades AS REAL) * 100 as win_percentage
        FROM leaderboard_stats l
        JOIN users u ON l.user_id = u.uid
        WHERE l.total_trades >= 10
        ORDER BY win_percentage DESC
        LIMIT 100
      `) || [];
    } catch (e) {
      console.error('Error fetching winRate leaderboard:', e);
      winRate = [];
    }

    // 3. Current Max Streak
    try {
      streaks = await query(`
        SELECT l.*, COALESCE(u.nickname, u.display_name) as display_name, u.photo_url, u.country, u.country_code
        FROM leaderboard_stats l
        JOIN users u ON l.user_id = u.uid
        ORDER BY CAST(l.max_streak AS INTEGER) DESC
        LIMIT 100
      `) || [];
    } catch (e) {
      console.error('Error fetching streaks leaderboard:', e);
      streaks = [];
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayTimestamp = Math.floor(startOfDay.getTime() / 1000);
    
    try {
      daily = await query(`
        SELECT * FROM (
          SELECT t.user_id, 
                 SUM(CASE 
                   WHEN t.status = 'won' THEN (CAST(COALESCE(t.payout_amount, 0) AS REAL) - CAST(t.amount AS REAL)) 
                   WHEN t.status = 'lost' THEN -CAST(t.amount AS REAL)
                   ELSE 0 
                 END) as profit,
                 CAST(u.real_balance AS REAL) as balance,
                 COALESCE(u.nickname, u.display_name) as display_name, u.photo_url, u.country, u.country_code
          FROM trades t
          JOIN users u ON t.user_id = u.uid
          WHERE (t.account_type = 'real' OR t.is_demo = 0) AND t.status IN ('won', 'lost', 'draw')
          AND t.settled_at >= ?
          GROUP BY t.user_id, u.uid, u.real_balance, u.nickname, u.display_name, u.photo_url, u.country, u.country_code
        ) sub
        WHERE profit > 0
        ORDER BY profit DESC
        LIMIT 100
      `, [startOfDayTimestamp]) || [];
    } catch (e) {
      console.error('Error fetching daily leaderboard:', e);
      daily = [];
    }

    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    try {
      weekly = await query(`
        SELECT * FROM (
          SELECT t.user_id, 
                 SUM(CASE 
                   WHEN t.status = 'won' THEN (CAST(COALESCE(t.payout_amount, 0) AS REAL) - CAST(t.amount AS REAL)) 
                   WHEN t.status = 'lost' THEN -CAST(t.amount AS REAL)
                   ELSE 0 
                 END) as profit,
                 CAST(u.real_balance AS REAL) as balance,
                 COALESCE(u.nickname, u.display_name) as display_name, u.photo_url, u.country, u.country_code
          FROM trades t
          JOIN users u ON t.user_id = u.uid
          WHERE (t.account_type = 'real' OR t.is_demo = 0) AND t.status IN ('won', 'lost', 'draw')
          AND t.settled_at >= ?
          GROUP BY t.user_id, u.uid, u.real_balance, u.nickname, u.display_name, u.photo_url, u.country, u.country_code
        ) sub
        WHERE profit > 0
        ORDER BY profit DESC
        LIMIT 100
      `, [sevenDaysAgo]) || [];
    } catch (e) {
      console.error('Error fetching weekly leaderboard:', e);
      weekly = [];
    }

    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    try {
      monthly = await query(`
        SELECT * FROM (
          SELECT t.user_id, 
                 SUM(CASE 
                   WHEN t.status = 'won' THEN (CAST(COALESCE(t.payout_amount, 0) AS REAL) - CAST(t.amount AS REAL)) 
                   WHEN t.status = 'lost' THEN -CAST(t.amount AS REAL)
                   ELSE 0 
                 END) as profit,
                 CAST(u.real_balance AS REAL) as balance,
                 COALESCE(u.nickname, u.display_name) as display_name, u.photo_url, u.country, u.country_code
          FROM trades t
          JOIN users u ON t.user_id = u.uid
          WHERE (t.account_type = 'real' OR t.is_demo = 0) AND t.status IN ('won', 'lost', 'draw')
          AND t.settled_at >= ?
          GROUP BY t.user_id, u.uid, u.real_balance, u.nickname, u.display_name, u.photo_url, u.country, u.country_code
        ) sub
        WHERE profit > 0
        ORDER BY profit DESC
        LIMIT 100
      `, [thirtyDaysAgo]) || [];
    } catch (e) {
      console.error('Error fetching monthly leaderboard:', e);
      monthly = [];
    }

    const nowObj = new Date();
    const dateStr = nowObj.toISOString().split('T')[0];
    const year = nowObj.getFullYear();
    const month = nowObj.getMonth();
    const day = nowObj.getDate();
    const hour = nowObj.getHours();
    const minute = nowObj.getMinutes();

    // Current 30-minute step in the day (0 to 47)
    const currentStep = Math.floor((hour * 60 + minute) / 30);

    // Large global pool of traders for daily dynamic selection
    const masterTraderPool = [
      // Americas
      { user_id: 'trader_1', display_name: 'CryptoKing', country: 'United States', country_code: 'us', base_balance: 12450.50 },
      { user_id: 'trader_2', display_name: 'MoonWalker', country: 'Brazil', country_code: 'br', base_balance: 8940.20 },
      { user_id: 'trader_3', display_name: 'AlphaTrader_99', country: 'United States', country_code: 'us', base_balance: 15400.00 },
      { user_id: 'trader_4', display_name: 'BearSlayer', country: 'Canada', country_code: 'ca', base_balance: 3200.50 },
      { user_id: 'trader_5', display_name: 'ScalpKing', country: 'Mexico', country_code: 'mx', base_balance: 4500.00 },
      { user_id: 'trader_6', display_name: 'CariocaFX', country: 'Brazil', country_code: 'br', base_balance: 6200.00 },
      { user_id: 'trader_7', display_name: 'TorontoBulls', country: 'Canada', country_code: 'ca', base_balance: 8900.00 },
      { user_id: 'trader_8', display_name: 'Vanguard_Trade', country: 'United States', country_code: 'us', base_balance: 18200.00 },

      // Asia & Oceania
      { user_id: 'trader_9', display_name: 'TradeMaster', country: 'India', country_code: 'in', base_balance: 5670.80 },
      { user_id: 'trader_10', display_name: 'MumbaiBulls', country: 'India', country_code: 'in', base_balance: 7800.00 },
      { user_id: 'trader_11', display_name: 'DhakaBulls', country: 'Bangladesh', country_code: 'bd', base_balance: 4300.00 },
      { user_id: 'trader_12', display_name: 'BengalTiger', country: 'Bangladesh', country_code: 'bd', base_balance: 5100.00 },
      { user_id: 'trader_13', display_name: 'ProfitPro', country: 'Australia', country_code: 'au', base_balance: 6780.00 },
      { user_id: 'trader_14', display_name: 'MarketWizard', country: 'Japan', country_code: 'jp', base_balance: 12400.00 },
      { user_id: 'trader_15', display_name: 'TokyoScalper', country: 'Japan', country_code: 'jp', base_balance: 9500.00 },
      { user_id: 'trader_16', display_name: 'OptionOpener', country: 'South Korea', country_code: 'kr', base_balance: 8500.00 },
      { user_id: 'trader_17', display_name: 'BinaryBoss', country: 'Indonesia', country_code: 'id', base_balance: 4500.00 },
      { user_id: 'trader_18', display_name: 'NusantaraFX', country: 'Indonesia', country_code: 'id', base_balance: 3800.00 },
      { user_id: 'trader_19', display_name: 'CryptoClimber', country: 'Vietnam', country_code: 'vn', base_balance: 3200.00 },
      { user_id: 'trader_20', display_name: 'ForexFiend', country: 'Thailand', country_code: 'th', base_balance: 5000.00 },
      { user_id: 'trader_21', display_name: 'StockStar', country: 'Singapore', country_code: 'sg', base_balance: 12500.00 },
      { user_id: 'trader_22', display_name: 'CoinCollector', country: 'Malaysia', country_code: 'my', base_balance: 6150.00 },
      { user_id: 'trader_23', display_name: 'SydneyScalper', country: 'Australia', country_code: 'au', base_balance: 7400.00 },
      { user_id: 'trader_24', display_name: 'K_Trader99', country: 'South Korea', country_code: 'kr', base_balance: 9100.00 },
      { user_id: 'trader_25', display_name: 'PinoyTrader', country: 'Philippines', country_code: 'ph', base_balance: 2900.00 },

      // Europe & UK
      { user_id: 'trader_26', display_name: 'BullRider', country: 'Germany', country_code: 'de', base_balance: 14500.00 },
      { user_id: 'trader_27', display_name: 'FrankfurtFX', country: 'Germany', country_code: 'de', base_balance: 11200.00 },
      { user_id: 'trader_28', display_name: 'ChartGuru', country: 'France', country_code: 'fr', base_balance: 4500.00 },
      { user_id: 'trader_29', display_name: 'ParisBulls', country: 'France', country_code: 'fr', base_balance: 8300.00 },
      { user_id: 'trader_30', display_name: 'TrendHunter', country: 'United Kingdom', country_code: 'gb', base_balance: 9800.00 },
      { user_id: 'trader_31', display_name: 'LondonBridge_FX', country: 'United Kingdom', country_code: 'gb', base_balance: 16400.00 },
      { user_id: 'trader_32', display_name: 'SignalSender', country: 'Italy', country_code: 'it', base_balance: 5600.00 },
      { user_id: 'trader_33', display_name: 'MilanoCapital', country: 'Italy', country_code: 'it', base_balance: 7200.00 },
      { user_id: 'trader_34', display_name: 'FastTrader', country: 'Spain', country_code: 'es', base_balance: 3200.00 },
      { user_id: 'trader_35', display_name: 'MadridFX', country: 'Spain', country_code: 'es', base_balance: 6900.00 },
      { user_id: 'trader_36', display_name: 'NewbieTrader', country: 'Turkey', country_code: 'tr', base_balance: 3100.00 },
      { user_id: 'trader_37', display_name: 'BosphorusFX', country: 'Turkey', country_code: 'tr', base_balance: 4800.00 },
      { user_id: 'trader_38', display_name: 'NordicScalp', country: 'Sweden', country_code: 'se', base_balance: 9400.00 },
      { user_id: 'trader_39', display_name: 'SwissCapital', country: 'Switzerland', country_code: 'ch', base_balance: 21000.00 },

      // Africa & Middle East
      { user_id: 'trader_40', display_name: 'GoldMiner', country: 'South Africa', country_code: 'za', base_balance: 6340.00 },
      { user_id: 'trader_41', display_name: 'LagosPips', country: 'Nigeria', country_code: 'ng', base_balance: 4200.00 },
      { user_id: 'trader_42', display_name: 'DubaiTrader_1', country: 'United Arab Emirates', country_code: 'ae', base_balance: 28000.00 },
      { user_id: 'trader_43', display_name: 'DesertBulls', country: 'Saudi Arabia', country_code: 'sa', base_balance: 19500.00 },
      { user_id: 'trader_44', display_name: 'NaijaScalper', country: 'Nigeria', country_code: 'ng', base_balance: 3800.00 },
      { user_id: 'trader_45', display_name: 'CapeTownFX', country: 'South Africa', country_code: 'za', base_balance: 5100.00 },

      // Additional Global Traders
      { user_id: 'trader_46', display_name: 'ApexPips', country: 'United States', country_code: 'us', base_balance: 11000.00 },
      { user_id: 'trader_47', display_name: 'ZenithFX', country: 'United Kingdom', country_code: 'gb', base_balance: 13200.00 },
      { user_id: 'trader_48', display_name: 'DeltaTrader', country: 'Canada', country_code: 'ca', base_balance: 7600.00 },
      { user_id: 'trader_49', display_name: 'DesiScalper', country: 'India', country_code: 'in', base_balance: 4900.00 },
      { user_id: 'trader_50', display_name: 'SylhetTrader', country: 'Bangladesh', country_code: 'bd', base_balance: 3700.00 },
      { user_id: 'trader_51', display_name: 'VectorCapital', country: 'Germany', country_code: 'de', base_balance: 15800.00 },
      { user_id: 'trader_52', display_name: 'PioneerFX', country: 'Australia', country_code: 'au', base_balance: 8200.00 },
      { user_id: 'trader_53', display_name: 'IberiaTrader', country: 'Spain', country_code: 'es', base_balance: 5400.00 },
      { user_id: 'trader_54', display_name: 'KyotoPips', country: 'Japan', country_code: 'jp', base_balance: 10800.00 },
      { user_id: 'trader_55', display_name: 'SambaCapital', country: 'Brazil', country_code: 'br', base_balance: 6700.00 },
      { user_id: 'trader_56', display_name: 'NordicRider', country: 'Norway', country_code: 'no', base_balance: 12100.00 },
      { user_id: 'trader_57', display_name: 'PolderTrader', country: 'Netherlands', country_code: 'nl', base_balance: 9300.00 },
      { user_id: 'trader_58', display_name: 'ViennaFX', country: 'Austria', country_code: 'at', base_balance: 8700.00 },
      { user_id: 'trader_59', display_name: 'PolishPips', country: 'Poland', country_code: 'pl', base_balance: 4100.00 },
      { user_id: 'trader_60', display_name: 'HellasTrade', country: 'Greece', country_code: 'gr', base_balance: 3900.00 }
    ];

    // Select 25 traders deterministically for today dateStr
    const poolRand = seedRandom(`daily_selection_${dateStr}`);
    const shuffledPool = [...masterTraderPool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(poolRand() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }
    const selectedFakeUsers = shuffledPool.slice(0, 25);

    // 1. Assign each selected user a daily score for ranking
    const userDailyScores = selectedFakeUsers.map(u => {
      const dailyRand = seedRandom(`daily_score_${dateStr}_${u.user_id}`);
      return {
        user: u,
        score: dailyRand()
      };
    });

    // Sort users by daily random score so rankings change every day
    userDailyScores.sort((a, b) => b.score - a.score);

    // 2. Generate EOD target and 30-minute step progression for each user
    const processedFakeUsers = userDailyScores.map((item, rank) => {
      const u = item.user;
      const userRand = seedRandom(`target_${dateStr}_${u.user_id}`);
      
      // Top rank gets ~$18,000 - $25,000 EOD profit.
      // Rank 24 gets ~$35 - $60 EOD profit.
      const maxProfit = 18000 + userRand() * 7000;
      const minProfit = 35 + userRand() * 25;
      
      // Non-linear power curve for realistic rank spacing
      const rankRatio = (24 - rank) / 24;
      const eodTargetProfit = minProfit + Math.pow(rankRatio, 2.4) * (maxProfit - minProfit);

      // Accumulate 30-minute step weights up to currentStep (0..47)
      let totalWeight = 0;
      let accumulatedWeight = 0;
      for (let s = 0; s < 48; s++) {
        const stepRand = seedRandom(`step_${dateStr}_${u.user_id}_${s}`);
        const weight = 0.3 + stepRand() * 1.4;
        totalWeight += weight;
        if (s <= currentStep) {
          accumulatedWeight += weight;
        }
      }

      const progressRatio = accumulatedWeight / totalWeight;
      let dailyProfit = parseFloat((eodTargetProfit * progressRatio).toFixed(2));

      // Ensure bottom ranks stay at minimum $20 - $35 profit floor
      const minFloor = 20 + Math.floor(userRand() * 15);
      if (dailyProfit < minFloor) {
        dailyProfit = parseFloat((minFloor + userRand() * 5).toFixed(2));
      }

      // Weekly & Monthly calculations scaling off EOD + historical seed
      const weekSeed = `${year}-W${Math.ceil((day + 7) / 7)}`;
      const weeklyRand = seedRandom(`weekly_${weekSeed}_${u.user_id}`);
      const weeklyProfit = parseFloat((dailyProfit * (3.5 + weeklyRand() * 2.5) + (1500 + weeklyRand() * 25000)).toFixed(2));

      const monthlyRand = seedRandom(`monthly_${year}_${month}_${u.user_id}`);
      const monthlyProfit = parseFloat((weeklyProfit * (2.8 + monthlyRand() * 2.2) + (5000 + monthlyRand() * 80000)).toFixed(2));

      const allTimeRand = seedRandom(`alltime_${u.user_id}`);
      const allTimeProfit = parseFloat((monthlyProfit * (3 + allTimeRand() * 4) + (20000 + allTimeRand() * 150000)).toFixed(2));

      const winRate = Math.min(98, Math.max(68, Math.floor(74 + (userRand() * 20))));
      const totalTrades = Math.max(12, Math.floor((dailyProfit / 150) + userRand() * 40));
      const wonTrades = Math.floor(totalTrades * (winRate / 100));
      const lostTrades = totalTrades - wonTrades;

      return {
        user_id: u.user_id,
        display_name: u.display_name,
        photo_url: '',
        country: u.country,
        country_code: u.country_code,
        balance: u.base_balance + dailyProfit,
        total_trades: totalTrades,
        won_trades: wonTrades,
        lost_trades: lostTrades,
        win_rate: winRate,
        dailyProfit,
        weeklyProfit,
        monthlyProfit,
        allTimeProfit
      };
    });

    // Merge fake users into allTime
    const finalAllTime = [...allTime, ...processedFakeUsers.map(u => ({
      user_id: u.user_id,
      display_name: u.display_name,
      total_profit: u.allTimeProfit,
      total_trades: u.total_trades * 10,
      won_trades: u.won_trades * 10,
      lost_trades: u.lost_trades * 10,
      photo_url: u.photo_url,
      country: u.country,
      country_code: u.country_code,
      balance: u.balance,
      win_rate: u.win_rate
    }))].sort((a, b) => Number(b.total_profit) - Number(a.total_profit)).slice(0, 20);

    // Merge fake users into daily/weekly/monthly
    const dailyWithFake = [...daily, ...processedFakeUsers.map(u => ({ 
      user_id: u.user_id, 
      profit: u.dailyProfit, 
      display_name: u.display_name, 
      photo_url: u.photo_url, 
      country: u.country, 
      country_code: u.country_code,
      balance: u.balance,
      win_rate: u.win_rate
    }))].sort((a, b) => Number(b.profit) - Number(a.profit)).slice(0, 20);

    const weeklyWithFake = [...weekly, ...processedFakeUsers.map(u => ({ 
      user_id: u.user_id, 
      profit: u.weeklyProfit, 
      display_name: u.display_name, 
      photo_url: u.photo_url, 
      country: u.country, 
      country_code: u.country_code,
      balance: u.balance,
      win_rate: u.win_rate
    }))].sort((a, b) => Number(b.profit) - Number(a.profit)).slice(0, 20);

    const monthlyWithFake = [...monthly, ...processedFakeUsers.map(u => ({ 
      user_id: u.user_id, 
      profit: u.monthlyProfit, 
      display_name: u.display_name, 
      photo_url: u.photo_url, 
      country: u.country, 
      country_code: u.country_code,
      balance: u.balance,
      win_rate: u.win_rate
    }))].sort((a, b) => Number(b.profit) - Number(a.profit)).slice(0, 20);

    return { 
      allTime: finalAllTime, 
      winRate: winRate || [], 
      streaks: streaks || [], 
      daily: dailyWithFake, 
      weekly: weeklyWithFake, 
      monthly: monthlyWithFake 
    };

  } catch (err) {
    console.error('Failed to fetch leaderboards:', err);
    return { allTime: [], winRate: [], streaks: [], daily: [], weekly: [], monthly: [] };
  }
};

export const broadcastLeaderboards = async () => {
  const data = await fetchLeaderboards();
  if (data) {
    const io = getIO();
    io.emit('leaderboard_update', data);
  }
};
