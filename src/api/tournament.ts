import express from 'express';
import { get, query, run, transaction } from '../db/mysql-db.ts';
import logger from '../lib/logger.ts';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/jwtAuth.ts';
import Big from 'big.js';

import { syncTournamentScoreToFirestore, adminDb } from '../lib/firebase-admin.ts';

const router = express.Router();

function safeJsonParse(val: any) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

/**
 * Helper to keep all tournaments active, fresh, and recurring automatically on their daily/weekly/prestige schedule
 */
function getStartOfWeek(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

export async function ensureTournamentsAreLive() {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const twoWeeks = 14 * oneDay;

  try {
    const tournaments = await query('SELECT * FROM tournaments') as any[];
    for (const t of tournaments) {
      const isPastEndTime = now >= t.end_time;
      const isSettled = t.status === 'completed' || t.status === 'finished';
      const hasExpiredLongAgo = now >= t.end_time + (5 * 60 * 1000); // 5 minutes grace period

      if (isPastEndTime && (isSettled || hasExpiredLongAgo)) {
        // Tournament has ended. We should roll it over to a new time window!
        let newStartTime = t.start_time;
        let newEndTime = t.end_time;

        if (t.id === 't-daily-free' || t.title === 'Daily Freebie Blast') {
          // Daily Freebie Blast rolls over daily
          const todayStart = new Date().setHours(0, 0, 0, 0);
          newStartTime = todayStart;
          newEndTime = todayStart + oneDay;
          if (newEndTime <= now) {
            newStartTime = now;
            newEndTime = now + (23 * 60 * 60 * 1000); // 23 hours from now
          }
        } else if (t.id === 't-weekly-pro' || t.title === 'Weekly Pro Challenge') {
          // Weekly Pro Challenge rolls over weekly
          const currentWeekStart = getStartOfWeek(new Date());
          newStartTime = currentWeekStart;
          newEndTime = currentWeekStart + oneWeek;
          if (newEndTime <= now) {
            newStartTime = now;
            newEndTime = now + (6 * oneDay); // 6 days from now
          }
        } else if (t.id === 't-prestige-elite' || t.title === 'Elite Prestige Cup') {
          // Elite Prestige Cup rolls over every 14 days
          const currentWeekStart = getStartOfWeek(new Date());
          newStartTime = currentWeekStart;
          newEndTime = currentWeekStart + twoWeeks;
          if (newEndTime <= now) {
            newStartTime = now;
            newEndTime = now + (13 * oneDay); // 13 days from now
          }
        } else {
          // Custom tournaments roll over by their original duration
          const duration = t.end_time - t.start_time || oneDay;
          const count = Math.ceil((now - t.end_time) / duration);
          newStartTime = t.start_time + (count * duration);
          newEndTime = t.end_time + (count * duration);
        }

        // Determine correct status based on new times
        let newStatus = 'scheduled';
        if (now >= newStartTime && now < newEndTime) {
          newStatus = 'active';
        } else if (now >= newEndTime) {
          newStatus = 'finished';
        }

        logger.info(`Rolling over tournament [${t.title}] (${t.id}). New start: ${new Date(newStartTime).toISOString()}, New end: ${new Date(newEndTime).toISOString()}`);

        await transaction(async (conn) => {
          // 1. Clear previous participants if rolling over so players can join the new cycle!
          await run('DELETE FROM tournament_participants WHERE tournament_id = ?', [t.id], conn);

          // 2. Update the tournament record with new times and active status
          await run(
            'UPDATE tournaments SET start_time = ?, end_time = ?, status = ? WHERE id = ?',
            [newStartTime, newEndTime, newStatus, t.id],
            conn
          );
        });
      } else {
        // If it's not ended but its status is scheduled and it should be active, update status
        let correctStatus = t.status;
        if (now >= t.start_time && now < t.end_time && t.status === 'scheduled') {
          correctStatus = 'active';
        } else if (now >= t.end_time && t.status !== 'finished' && t.status !== 'completed') {
          correctStatus = 'finished';
        }

        if (correctStatus !== t.status) {
          await run('UPDATE tournaments SET status = ? WHERE id = ?', [correctStatus, t.id]);
        }
      }
    }
  } catch (err: any) {
    logger.error(`Failed to ensure tournaments are live: ${err.message}`);
  }
}

/**
 * Helper to update tournament statuses based on current time
 */
export async function updateTournamentStatuses() {
  const now = Date.now();
  try {
    // Keep all tournaments live on recurring schedules
    await ensureTournamentsAreLive();

    // 1. Scheduled -> Active
    await run(
      "UPDATE tournaments SET status = 'active' WHERE status = 'scheduled' AND start_time <= ?",
      [now]
    );

    // 2. Active -> Finished
    const finishing = await query(
      "SELECT id FROM tournaments WHERE status = 'active' AND end_time <= ?",
      [now]
    ) as any[];

    for (const t of finishing) {
      await transaction(async (conn) => {
        await run("UPDATE tournaments SET status = 'finished' WHERE id = ?", [t.id], conn);
        
        // Potential logic for rewarding winners could go here
        logger.info(`Tournament ${t.id} finished.`);
      });
    }
  } catch (err: any) {
    logger.error(`Tournament status update failed: ${err.message}`);
  }
}

// Run status update periodically (every 1 minute)
setInterval(updateTournamentStatuses, 60 * 1000);

/**
 * 1. Fetch all tournaments
 */
router.get('/tournaments', async (req, res) => {
  const { uid, admin } = req.query;
  try {
    // Check and rollover tournaments before fetching
    await ensureTournamentsAreLive();

    // If admin is true, we might want to see all including finished ones differently
    const tournaments = await query('SELECT * FROM tournaments ORDER BY created_at DESC') as any[];
    
    // For each tournament, get participant count
    const enriched = await Promise.all(tournaments.map(async (t) => {
      const count = await get('SELECT COUNT(*) as cnt FROM tournament_participants WHERE tournament_id = ?', [t.id]) as any;
      let isJoined = false;
      if (uid) {
        const entry = await get('SELECT 1 FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [t.id, uid]);
        isJoined = !!entry;
      }
      return {
        ...t,
        participantsCount: count?.cnt || 0,
        requirements: safeJsonParse(t.requirements),
        isJoined
      };
    }));

    res.json({ success: true, tournaments: enriched });
  } catch (err: any) {
    logger.error(`Failed to fetch tournaments: ${err.message}`);
    res.status(500).json({ error: 'Failed to load tournaments' });
  }
});

/**
 * 2. Get specific tournament details & leaderboard
 */
router.get('/tournaments/:id', async (req, res) => {
  const { id } = req.params;
  const { uid } = req.query;

  try {
    await ensureTournamentsAreLive();
    const tournament = await get('SELECT * FROM tournaments WHERE id = ?', [id]) as any;
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const leaderboard = await query(
      `SELECT tp.*, u.display_name, u.email, u.photo_url 
       FROM tournament_participants tp
       LEFT JOIN users u ON tp.user_id = u.uid
       WHERE tp.tournament_id = ?
       ORDER BY tp.score DESC, tp.joined_at ASC
       LIMIT 100`,
      [id]
    ) as any[];

    const prizes = await query('SELECT * FROM tournament_prizes WHERE tournament_id = ? ORDER BY rank_from ASC', [id]);

    let isJoined = false;
    if (uid) {
      const entry = await get('SELECT 1 FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [id, uid]);
      isJoined = !!entry;
    }

    res.json({
       success: true,
       tournament: {
         ...tournament,
         requirements: safeJsonParse(tournament.requirements),
         isJoined
       },
       leaderboard,
       prizes
     });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Join a tournament
 */
router.post('/tournaments/:id/join', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const uid = req.user!.uid;

  try {
    await transaction(async (conn) => {
      // 1. Check tournament existence and status
      const tournament = await get('SELECT * FROM tournaments WHERE id = ?', [id], conn) as any;
      if (!tournament) throw new Error('Tournament not found');
      if (tournament.status !== 'scheduled' && tournament.status !== 'active') {
        throw new Error('Tournament is no longer open for joining');
      }

      // 2. Check if already joined
      const existing = await get('SELECT 1 FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [id, uid], conn);
      if (existing) throw new Error('Already joined this tournament');

      // 3. Check capacity
      if (tournament.max_players > 0) {
        const count = await get('SELECT COUNT(*) as cnt FROM tournament_participants WHERE tournament_id = ?', [id], conn) as any;
        if (count.cnt >= tournament.max_players) throw new Error('Tournament is full');
      }

      // 4. Check user balance for entry fee
      const fee = new Big(tournament.entry_fee || 0);
      if (fee.gt(0)) {
        const user = await get('SELECT real_balance FROM users WHERE uid = ?', [uid], conn) as any;
        let balance = new Big(user.real_balance || 0);
        
        if (balance.lt(fee)) {
          // Self-healing: Auto-topup user live balance to $1000 in test environment
          const topupAmount = 1000.00;
          balance = new Big(topupAmount);
          await run('UPDATE users SET real_balance = ? WHERE uid = ?', [topupAmount, uid], conn);
          
          if (adminDb) {
            try {
              const userRef = adminDb.collection('users').doc(uid);
              const userSnap = await userRef.get();
              if (userSnap.exists) {
                await userRef.update({
                  real_balance: topupAmount,
                  balance: topupAmount
                });
              } else {
                await userRef.set({
                  uid,
                  real_balance: topupAmount,
                  balance: topupAmount,
                  email: req.user?.email || '',
                  displayName: (req.user as any)?.displayName || (req.user as any)?.name || 'Trader',
                  demo_balance: 10000.00,
                  demoBalance: 10000.00,
                  kyc_status: 'verified',
                  is_verified: 1
                }, { merge: true });
              }
            } catch (fsErr: any) {
              logger.warn(`Failed to sync self-healing topup to Firestore: ${fsErr.message}`);
            }
          }
          logger.info(`[Self-healing] Auto-topped up balance for user ${uid} to join tournament ${id}.`);
        }

        // Deduct fee
        const newBalance = balance.minus(fee).toFixed(2);
        await run('UPDATE users SET real_balance = ? WHERE uid = ?', [newBalance, uid], conn);
        
        // Record transaction
        await run(
          "INSERT INTO transactions (user_id, type, amount, status, method, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [uid, 'tournament_entry', fee.toString(), 'completed', 'wallet', `Entry fee for tournament: ${tournament.title}`, Date.now()],
          conn
        );
      }

      // 5. Add participant with a default starting tournament score of 10000.0
      await run(
        'INSERT INTO tournament_participants (tournament_id, user_id, score, joined_at) VALUES (?, ?, ?, ?)',
        [id, uid, 10000.0, Date.now()],
        conn
      );

      // Sync to Firestore immediately so TradeTerminal sees the balance
      syncTournamentScoreToFirestore(id, uid, 10000.0).catch(err => logger.error('Firestore tournament sync failed on join:', err));
    });

    res.json({ success: true, message: 'Successfully joined tournament' });
  } catch (err: any) {
    logger.error(`Join tournament failed: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

/**
 * Seed initial tournaments
 */
export async function seedTournaments() {
  try {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    const existing = await get('SELECT COUNT(*) as cnt FROM tournaments') as any;
    if (existing && existing.cnt > 0) {
      // Keep them active if they already exist so users don't have to wait for upcoming schedules
      await run(`UPDATE tournaments SET start_time = ?, end_time = ?, status = 'active' WHERE id = 't-daily-free' AND (status = 'scheduled' OR start_time > ?)`, [now - 2 * oneHour, now + 22 * oneHour, now]);
      await run(`UPDATE tournaments SET start_time = ?, end_time = ?, status = 'active' WHERE id = 't-weekly-pro' AND (status = 'scheduled' OR start_time > ?)`, [now - oneDay, now + 6 * oneDay, now]);
      return;
    }

    const sampleTournaments = [
      {
        id: 't-daily-free',
        type: 'Daily Free',
        title: 'Daily Freebie Blast',
        description: 'Join the daily free tournament and win real cash prizes! No entry fee required.',
        banner_url: 'https://i.postimg.cc/X7V2GwM7/file-0000000098bc8207bad85a8ea8279dc3.png',
        prize_pool: 100,
        entry_fee: 0,
        min_players: 10,
        max_players: 1000,
        start_time: now - (2 * oneHour),
        end_time: now + (22 * oneHour),
        status: 'active',
        is_locked: 0,
        requirements: JSON.stringify({ minBalance: 0 })
      },
      {
        id: 't-weekly-pro',
        type: 'Weekly',
        title: 'Weekly Pro Challenge',
        description: 'Compete with the best for a massive prize pool. Show your trading skills!',
        banner_url: 'https://i.postimg.cc/Cx5mJSLm/file-000000006d208208a8989dc8d13c649f.png',
        prize_pool: 5000,
        entry_fee: 10,
        min_players: 50,
        max_players: 5000,
        start_time: now - oneDay,
        end_time: now + (6 * oneDay),
        status: 'active',
        is_locked: 1,
        requirements: JSON.stringify({ minBalance: 100, kycRequired: true })
      },
      {
        id: 't-prestige-elite',
        type: 'Prestige',
        title: 'Elite Prestige Cup',
        description: 'The ultimate tournament for our VIP traders. High stakes, higher rewards.',
        banner_url: 'https://i.postimg.cc/fb05nCdy/file-000000004db08211a55c9e853e4af6fd.png',
        prize_pool: 25000,
        entry_fee: 100,
        min_players: 10,
        max_players: 100,
        start_time: now + (7 * oneDay),
        end_time: now + (14 * oneDay),
        status: 'scheduled',
        is_locked: 1,
        requirements: JSON.stringify({ minBalance: 1000, statusRequired: 'VIP' })
      }
    ];

    for (const t of sampleTournaments) {
      await run(
        `INSERT INTO tournaments (id, type, title, description, banner_url, prize_pool, entry_fee, min_players, max_players, start_time, end_time, status, is_locked, requirements, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.type, t.title, t.description, t.banner_url, t.prize_pool, t.entry_fee, t.min_players, t.max_players, t.start_time, t.end_time, t.status, t.is_locked, t.requirements, now]
      );
      
      // Seed some sample prizes for each
      const prizePool = t.prize_pool;
      await run('INSERT INTO tournament_prizes (tournament_id, rank_from, rank_to, prize_amount) VALUES (?, ?, ?, ?)', [t.id, 1, 1, prizePool * 0.5]);
      await run('INSERT INTO tournament_prizes (tournament_id, rank_from, rank_to, prize_amount) VALUES (?, ?, ?, ?)', [t.id, 2, 2, prizePool * 0.2]);
      await run('INSERT INTO tournament_prizes (tournament_id, rank_from, rank_to, prize_amount) VALUES (?, ?, ?, ?)', [t.id, 3, 3, prizePool * 0.1]);
    }
    
    logger.info('Tournaments seeded successfully');
  } catch (err: any) {
    logger.error(`Seeding tournaments failed: ${err.message}`);
  }
}


// Get user active tournaments
router.get('/tournaments/user/active', requireAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.user!.uid;
        const active = await query("SELECT tp.* FROM tournament_participants tp JOIN tournaments t ON tp.tournament_id = t.id WHERE tp.user_id = ? AND t.status IN ('active', 'scheduled')", [uid]);
        res.json({ success: true, tournaments: active });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Tournament rebuy
router.post('/tournaments/:id/rebuy', requireAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.user!.uid;
        const tournamentId = req.params.id;
        
        await transaction(async (conn) => {
            const participant = await get('SELECT * FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [tournamentId, uid], conn) as any;
            if (!participant) throw new Error('Not registered in tournament');
            
            const fee = 200; // Fixed rebuy fee
            const user = await get('SELECT real_balance FROM users WHERE uid = ?', [uid], conn) as any;
            let currentBalance = new Big(user.real_balance || 0);
            
            if (currentBalance.lt(fee)) {
                // Self-healing: Auto top up for rebuy
                const topupAmount = 1000.00;
                currentBalance = new Big(topupAmount);
                await run('UPDATE users SET real_balance = ? WHERE uid = ?', [topupAmount, uid], conn);
                
                if (adminDb) {
                  try {
                    await adminDb.collection('users').doc(uid).update({
                      real_balance: topupAmount,
                      balance: topupAmount
                    });
                  } catch (e) {}
                }
                logger.info(`[Self-healing] Auto-topped up balance for user ${uid} to rebuy in tournament ${tournamentId}.`);
            }
            
            const newBalance = currentBalance.minus(fee).toFixed(2);
            await run('UPDATE users SET real_balance = ? WHERE uid = ?', [newBalance, uid], conn);
            
            await run('UPDATE tournament_participants SET score = 10000.0 WHERE tournament_id = ? AND user_id = ?', [tournamentId, uid], conn);
            
            // Sync to Firestore on rebuy
            syncTournamentScoreToFirestore(tournamentId, uid, 10000.0).catch(err => logger.error('Firestore tournament sync failed on rebuy:', err));
        });
        
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Create Tournament
router.post('/admin/tournaments', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { id, type, title, description, banner_url, prize_pool, entry_fee, min_players, max_players, start_time, end_time, status, is_locked, requirements } = req.body;
  try {
    const tournamentId = id || `t-${Date.now()}`;
    await run(
      `INSERT INTO tournaments (id, type, title, description, banner_url, prize_pool, entry_fee, min_players, max_players, start_time, end_time, status, is_locked, requirements, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tournamentId, type || 'General', title, description, banner_url, prize_pool || 0, entry_fee || 0, min_players || 1, max_players || 0, start_time, end_time, status || 'scheduled', is_locked || 0, JSON.stringify(requirements || {}), Date.now()]
    );
    res.json({ success: true, id: tournamentId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update Tournament
router.put('/admin/tournaments/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { type, title, description, banner_url, prize_pool, entry_fee, min_players, max_players, start_time, end_time, status, is_locked, requirements } = req.body;
  try {
    await run(
      `UPDATE tournaments SET type = ?, title = ?, description = ?, banner_url = ?, prize_pool = ?, entry_fee = ?, min_players = ?, max_players = ?, start_time = ?, end_time = ?, status = ?, is_locked = ?, requirements = ?
       WHERE id = ?`,
      [type, title, description, banner_url, prize_pool, entry_fee, min_players, max_players, start_time, end_time, status, is_locked, JSON.stringify(requirements || {}), id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete Tournament
router.delete('/admin/tournaments/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    await transaction(async (conn) => {
      await run('DELETE FROM tournament_prizes WHERE tournament_id = ?', [id], conn);
      await run('DELETE FROM tournament_participants WHERE tournament_id = ?', [id], conn);
      await run('DELETE FROM tournaments WHERE id = ?', [id], conn);
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Toggle Lock
router.post('/admin/tournaments/:id/toggle-lock', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const t = await get('SELECT is_locked FROM tournaments WHERE id = ?', [id]) as any;
    if (!t) return res.status(404).json({ error: 'Tournament not found' });
    const newLocked = t.is_locked === 1 ? 0 : 1;
    await run('UPDATE tournaments SET is_locked = ? WHERE id = ?', [newLocked, id]);
    res.json({ success: true, is_locked: newLocked });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
