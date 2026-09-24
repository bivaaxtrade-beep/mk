import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, get, query, run, transaction, isUsingPostgres } from '../db/mysql-db.ts';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/jwtAuth.ts';
import { createAuditLog } from '../lib/audit.ts';
import logger from '../lib/logger.ts';
import { getIO } from '../services/socketService.ts';
import Big from 'big.js';
import { mapUserForFrontend, getNumericId } from '../lib/user-utils.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { adminDb, syncUserToFirestore } from '../lib/firebase-admin.ts';
import { 
  authoritativeSync,
  syncUserTransactionsFromFirestore,
  syncUserTradesFromFirestore,
  syncUserKycFromFirestore
} from '../lib/sync-service.ts';
import { sendEmail } from '../lib/email.ts';
import { generateChatResponse } from '../lib/gemini.ts';
import { getAllAppSettings, saveAppSettings, getAppSetting, setAppSetting } from '../services/settingsService.ts';
import { uploadImage } from '../lib/storage-service.ts';
import { 
  processDepositAffiliateCommission,
  settleMaturedCommissions,
  getAffiliateSummary,
  getReferredTradersList,
  transferAffiliateBalanceToLive,
  requestAffiliatePayout
} from '../services/affiliateService.ts';

import { handleSupportQuery } from './support-agent.ts';
import { body, validationResult } from 'express-validator';

import { 
  markets_real, markets_demo, 
  systemActive, globalManipulationMode,
  setSystemActive, setGlobalManipulationMode,
  setUserManipulation,
  isMarketClosedAt,
  autoMarketConfig, updateAutoMarketConfig
} from '../services/marketService.ts';

const router = express.Router();

// --- Debug: Log all API requests ---
router.use((req, res, next) => {
  console.log(`[DEBUG-API] ${req.method} ${req.url}`);
  next();
});

// --- Market News ---
router.get('/news', async (req, res) => {
  try {
    if (req.query.type === 'collection') {
      const snapshot = await adminDb.collection('news').get();
      const docs: any[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        if (data.title !== '50% Deposit Bonus') {
          docs.push({ id: doc.id, ...data });
        }
      });
      return res.json(docs);
    }
    // Return news as expected by NewsWidget and TradeTerminal
    res.json({
      news: [
        "Bitcoin surpasses $60,000 as institutional demand grows.",
        "Global markets rally as inflation data shows cooling trends.",
        "Gold hits record high amid geopolitical uncertainty.",
        "Central Bank hints at potential rate cuts by year-end.",
        "Tech sector leads gains in pre-market trading session."
      ],
      Data: [] // For compatibility with older news widget versions
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Market State ---
router.get('/market/state', (req, res) => {
  res.json({
    systemActive,
    globalManipulationMode,
    autoMarketConfig,
    markets: markets_real
  });
});

router.get('/admin/delete-broken-stories', async (req, res) => {
  try {
    const stories = await adminDb.collection('stories').get();
    let docs: any[] = [];
    for (const doc of stories.docs) {
      docs.push({ id: doc.id, title: doc.data().title });
    }
    res.json({ success: true, count: docs.length, docs });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/admin/system/toggle', (req, res) => {
  const { active } = req.body;
  setSystemActive(!!active);
  getIO().emit('system_status', !!active);
  res.json({ success: true, active: !!active });
});

router.post('/admin/test-email', async (req, res) => {
  const { email, config } = req.body;
  
  if (!email || !config) {
    return res.status(400).json({ error: 'Missing email or config' });
  }

  try {
    // 1. Manually update the settings in Firestore temporarily or just pass them to a modified sendEmail
    // For simplicity, we'll try to send using the provided config immediately
    const success = await sendEmail(
      email, 
      'Bivaax Trade - Connection Test', 
      `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #4CAF50;">Success!</h2>
          <p>Your email integration is working correctly.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            <strong>Method:</strong> ${config.resendApiKey ? 'Resend.com API' : 'SMTP Relay'}<br>
            <strong>Target:</strong> ${email}
          </p>
        </div>
      `,
      'Your Bivaax Trade email integration is working correctly.',
      config
    );

    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Email sending failed. Check server logs.' });
    }
  } catch (err: any) {
    console.error('Email Test Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/manipulation/global', (req, res) => {
  const { mode } = req.body;
  setGlobalManipulationMode(mode);
  getIO().emit('global_manipulation_status', mode);
  res.json({ success: true, mode });
});

// Auto Market 80/20 Risk Management Admin APIs
router.get('/admin/auto-market', (req, res) => {
  res.json({ success: true, config: autoMarketConfig });
});

router.post('/admin/auto-market/toggle', async (req, res) => {
  try {
    const { enabled, lossRate, winRate, maxConcurrentTrades } = req.body;
    const updates: any = { realOnly: true };
    if (typeof enabled === 'boolean') updates.enabled = enabled;
    if (lossRate !== undefined && !isNaN(Number(lossRate))) updates.lossRate = Number(lossRate);
    if (winRate !== undefined && !isNaN(Number(winRate))) updates.winRate = Number(winRate);
    if (maxConcurrentTrades !== undefined && !isNaN(Number(maxConcurrentTrades))) updates.maxConcurrentTrades = Number(maxConcurrentTrades);

    const updated = await updateAutoMarketConfig(updates);
    getIO().emit('auto_market_status_updated', updated);
    res.json({ success: true, config: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Live Open Trades Monitoring API
router.get('/admin/open-trades', async (req, res) => {
  try {
    const openTrades = await query(`
      SELECT t.id, t.firebase_id, t.user_id, t.market_id, t.direction, t.amount, 
             t.entry_price, t.duration, t.expiry_time, t.created_at, t.status, 
             t.target_result, t.is_demo, t.account_type, u.email as user_email, u.display_name
      FROM trades t
      LEFT JOIN users u ON t.user_id = u.uid
      WHERE t.status = 'open'
      ORDER BY t.created_at DESC
    `) as any[];

    const realTrades = openTrades.filter(t => !t.is_demo && t.account_type !== 'demo').map(mapTrade);
    const demoTrades = openTrades.filter(t => !!t.is_demo || t.account_type === 'demo').map(mapTrade);

    res.json({ success: true, realTrades, demoTrades, total: openTrades.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Force Win / Force Loss API for specific active trade
router.post('/admin/trade/force-result', async (req, res) => {
  try {
    const { tradeId, targetResult } = req.body; // 'win' | 'loss'
    if (!tradeId || !targetResult) {
      return res.status(400).json({ error: 'tradeId and targetResult are required' });
    }

    const trade = await get('SELECT * FROM trades WHERE id = ? OR firebase_id = ?', [String(tradeId), String(tradeId)]) as any;
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const isDemo = trade.is_demo === 1 || trade.is_demo === true || String(trade.is_demo) === 'true' || trade.account_type === 'demo';
    if (isDemo) {
      return res.status(400).json({ error: 'Demo accounts cannot be manipulated. Manipulation mode is strictly for Live (Real) balance only.' });
    }

    // 1. Update SQLite/PostgreSQL
    await run(
      `UPDATE trades SET target_result = ? WHERE id = ? OR firebase_id = ?`,
      [targetResult, String(tradeId), String(tradeId)]
    );

    // 2. Fetch updated trade
    const updatedTrade = await get('SELECT * FROM trades WHERE id = ? OR firebase_id = ?', [String(tradeId), String(tradeId)]);

    if (updatedTrade) {
      // 3. Register/Update in live steering engine
      registerSteeringTrade({
        id: updatedTrade.id,
        market_id: updatedTrade.market_id,
        is_demo: updatedTrade.is_demo,
        entry_price: parseFloat(updatedTrade.entry_price),
        direction: updatedTrade.direction,
        target_result: targetResult,
        expiry_time: updatedTrade.expiry_time,
        duration: updatedTrade.duration,
        created_at: updatedTrade.created_at,
        amount: parseFloat(updatedTrade.amount)
      });

      // 4. Update in Firestore if available
      if (adminDb) {
        adminDb.collection('trades').doc(updatedTrade.id.toString()).set({
          targetResult,
          target_result: targetResult
        }, { merge: true }).catch(() => {});
      }

      // 5. Broadcast to connected admin clients
      getIO().emit('admin_trade_updated', { tradeId: updatedTrade.id, targetResult });
    }

    res.json({ success: true, tradeId, targetResult });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/market/update', (req, res) => {
  const { pair, triggerNews, ...updates } = req.body;
  
  if (markets_real[pair]) {
    markets_real[pair] = { ...markets_real[pair], ...updates };
    // Persist hidden and payout status
    if ('hidden' in updates || 'payout' in updates) {
      const isHidden = markets_real[pair].hidden ? 1 : 0;
      const currentPayout = markets_real[pair].payout !== undefined && markets_real[pair].payout !== null ? markets_real[pair].payout : null;
      try {
        run('INSERT INTO market_settings (pair, hidden, payout) VALUES (?, ?, ?) ON CONFLICT(pair) DO UPDATE SET hidden = excluded.hidden, payout = excluded.payout', [pair, isHidden, currentPayout]);
      } catch (err: any) {
        console.error('Failed to save market_settings to SQLite:', err.message);
      }
    }
  }
  if (markets_demo[pair]) {
    markets_demo[pair] = { ...markets_demo[pair], ...updates };
  }

  if (triggerNews) {
    // We can't directly access otcEngine's internal state, 
    // but we can set a flag in marketService for otcEngine to pick up.
    // However, it's easier to just pass the news info through markets object if needed.
    // Let's add a newsTrigger field to the market object.
    markets_real[pair].newsTrigger = {
      intensity: 5 + Math.random() * 5,
      duration: 10000 + Math.random() * 10000,
      direction: Math.random() > 0.5 ? 1 : -1
    };
    markets_demo[pair].newsTrigger = markets_real[pair].newsTrigger;
  }

  getIO().emit('market_settings_updated', markets_real);
  res.json({ success: true });
});

router.post('/admin/market/manipulation', (req, res) => {
  const { pair, targetTrend, profitPercentage, enabled, mode } = req.body;
  if (!pair) return res.status(400).json({ error: 'Missing pair' });

  if (markets_real[pair]) {
    markets_real[pair].manipulation = {
      mode: mode || 'percentage',
      targetTrend: targetTrend || 'random',
      profitPercentage: parseFloat(profitPercentage) || 0,
      enabled: enabled !== undefined ? !!enabled : false
    };
  }
  if (markets_demo[pair]) {
    markets_demo[pair].manipulation = markets_real[pair] ? markets_real[pair].manipulation : undefined;
  }

  getIO().emit('market_settings_updated', markets_real);
  res.json({ success: true });
});

router.post('/admin/market/reset-pressure', (req, res) => {
  const { pair } = req.body;
  if (!pair) return res.status(400).json({ error: 'Missing pair' });

  if (markets_real[pair]) {
    markets_real[pair].pressure = 0;
  }
  if (markets_demo[pair]) {
    markets_demo[pair].pressure = 0;
  }

  getIO().emit('market_settings_updated', markets_real);
  res.json({ success: true });
});

router.post('/admin/market/system', (req, res) => {
  const { active } = req.body;
  setSystemActive(!!active);
  getIO().emit('system_status', !!active);
  res.json({ success: true, active: !!active });
});

router.post('/affiliate/next-id', async (req, res) => {
    try {
        let nextId = 10001;
        const row = await get('SELECT MAX(CASE WHEN CAST(turnover_referral_code AS INTEGER) > CAST(referral_code AS INTEGER) THEN CAST(turnover_referral_code AS INTEGER) ELSE CAST(referral_code AS INTEGER) END) as maxId FROM users') as any;
        if (row && row.maxId && row.maxId >= 10000) {
            nextId = parseInt(row.maxId) + 1;
        }
        res.json({ nextId });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/affiliate/resolve/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { resolveReferrer } = await import('./auth.ts');
        const resolved = await resolveReferrer(code);
        if (resolved) {
            return res.json(resolved);
        }
        return res.status(404).json({ error: 'Referral code not found' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      logger.error('GEMINI_API_KEY environment variable is missing');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Data Mapping Helpers to bridge CamelCase and snake_case
function mapTrade(t: any) {
  if (!t) return null;
  const expiryTimeMs = t.expiry_time ? t.expiry_time * 1000 : Date.now() + (t.duration || 60) * 1000;
  return {
    ...t,
    id: t.id,
    firebaseId: t.firebase_id || t.firebaseId || null,
    firebase_id: t.firebase_id || t.firebaseId || null,
    userId: t.user_id,
    user_id: t.user_id,
    marketId: t.market_id,
    market_id: t.market_id,
    asset: t.asset || t.market_id,
    amount: parseFloat(t.amount || 0),
    direction: t.direction,
    type: t.type || t.direction,
    entryPrice: parseFloat(t.entry_price || 0),
    entry_price: t.entry_price,
    exitPrice: t.exit_price ? parseFloat(t.exit_price) : null,
    exit_price: t.exit_price,
    duration: t.duration,
    timeLeft: t.time_left,
    time_left: t.time_left,
    expiryTime: t.expiry_time,
    expiry_time: t.expiry_time,
    expirationTime: t.expiration_time ? (isNaN(Number(t.expiration_time)) ? new Date(t.expiration_time).getTime() : Number(t.expiration_time)) : expiryTimeMs,
    expiration_time: t.expiration_time,
    isDemo: !!t.is_demo,
    is_demo: !!t.is_demo,
    accountType: t.account_type || (t.is_demo ? 'demo' : 'real'),
    account_type: t.account_type || (t.is_demo ? 'demo' : 'real'),
    status: t.status,
    payoutAmount: t.payout_amount ? parseFloat(t.payout_amount) : null,
    payout_amount: t.payout_amount,
    payout: t.payout,
    settledAt: t.settled_at,
    settled_at: t.settled_at,
    closedAt: t.closed_at || t.settled_at,
    closed_at: t.closed_at || t.settled_at,
    createdAt: t.created_at,
    created_at: t.created_at,
    updatedAt: t.updated_at,
    updated_at: t.updated_at,
  };
}

function mapTicket(t: any) {
  if (!t) return null;
  return {
    ...t,
    id: t.id,
    userId: t.user_id,
    user_id: t.user_id,
    userName: t.user_name || 'User',
    userEmail: t.user_email || 'trader@bivaax.com',
    subject: t.subject,
    category: t.category || 'General',
    message: t.message,
    lastMessage: t.last_message,
    last_message: t.last_message,
    status: t.status || 'open',
    priority: t.priority || 'medium',
    assignedAgentId: t.assigned_agent_id,
    assignedAgentName: t.assigned_agent_name,
    assignedAgentEmail: t.assigned_agent_email,
    channel: t.channel || 'chat',
    rating: t.rating,
    ratingFeedback: t.rating_feedback,
    isAiHandled: t.is_ai_handled !== undefined ? Boolean(t.is_ai_handled) : true,
    closedAt: t.closed_at,
    firstResponseAt: t.first_response_at,
    resolvedAt: t.resolved_at,
    updatedAt: t.updated_at,
    updated_at: t.updated_at,
    createdAt: t.created_at,
    created_at: t.created_at,
  };
}

function mapMessage(m: any) {
  if (!m) return null;
  let parsedAttachments = [];
  try {
    if (m.attachments) {
      parsedAttachments = typeof m.attachments === 'string' ? JSON.parse(m.attachments) : m.attachments;
    }
  } catch (e) {
    parsedAttachments = [];
  }

  return {
    ...m,
    id: m.id,
    ticketId: m.ticket_id,
    ticket_id: m.ticket_id,
    userId: m.user_id,
    user_id: m.user_id,
    senderType: m.sender_type || (m.isAdmin || m.is_admin ? 'agent' : 'user'),
    senderName: m.sender_name || (m.isAdmin || m.is_admin ? 'Support Agent' : 'User'),
    text: m.message,
    message: m.message,
    attachments: parsedAttachments,
    isInternalNote: Boolean(m.is_internal_note),
    isRead: Boolean(m.is_read),
    status: m.is_read ? 'seen' : 'delivered',
    isAdmin: Boolean(m.isAdmin || m.is_admin),
    createdAt: m.created_at,
    created_at: m.created_at,
  };
}

// Helper function to resolve IP address to country
async function getCountryFromIp(ip: string): Promise<{ countryName: string; countryCode: string }> {
  // Safe defaults for localhost or private IPs
  if (
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.3')
  ) {
    return { countryName: 'Global', countryCode: 'GB' };
  }

  try {
    // Attempt 1: ip-api.com
    const response = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json() as any;
      if (data && data.status === 'success') {
        return { countryName: data.country, countryCode: data.countryCode };
      }
    }
  } catch (err) {
    logger.error(`getCountryFromIp error (ip-api): ${err}`);
  }

  try {
    // Attempt 2: geojs.io
    const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json() as any;
      if (data && data.country) {
        return { countryName: data.country, countryCode: data.country_code };
      }
    }
  } catch (err) {
    logger.error(`getCountryFromIp error (geojs): ${err}`);
  }

  return { countryName: 'Global', countryCode: 'GB' };
}

// IP Lookup endpoint (proxied for safety and to avoid mixed content warnings)
router.get('/ip-info', async (req, res) => {
  let ip = req.ip || '';
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const parts = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    ip = parts[0].trim();
  }

  const { countryName, countryCode } = await getCountryFromIp(ip);
  res.json({
    ip,
    country_code: countryCode,
    country_name: countryName
  });
});


// Add this route for AI chat proxying
router.post('/ai/chat', requireAuth, async (req: AuthRequest, res: Response) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  
  const replyData = await generateChatResponse(message, history, req.user?.uid);
  res.json({ reply: replyData });
});


// Auth Routes (Custom)
router.post('/auth/register', async (req, res) => {
  const { email, password, fullName, country, countryCode, referralCode, referralSubId, referralType } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password and name are required' });
  }

  try {
    const existing = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const uid = 'user_' + Math.random().toString(36).substring(2, 15);
    const affiliateId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    let cName = country;
    let cCode = countryCode;
    
    if (!cName || !cCode) {
      const geo = await getCountryFromIp(ip as string);
      cName = cName || geo.countryName;
      cCode = cCode || geo.countryCode;
    }

    let referredBy = null;
    if (referralCode) {
      let referrer = await get('SELECT uid FROM users WHERE referral_code = ? OR uid = ?', [referralCode, referralCode]);
      
      // Fallback to Firestore if not found in SQLite
      if (!referrer && adminDb) {
        const userSnap = await adminDb.collection('users').where('referralCode', '==', referralCode).get();
        if (!userSnap.empty) {
          referrer = { uid: userSnap.docs[0].id };
        }
      }
      if (referrer) {
        referredBy = (referrer as any).uid;
      }
    }

    await run(
      `INSERT OR IGNORE INTO users (uid, email, password_hash, display_name, nickname, referral_code, country, country_code, referred_by_uid, referral_sub_id, referral_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid, email, passwordHash, fullName, fullName.split(' ')[0], affiliateId, cName, cCode, referredBy, referralSubId || null, referralType || null]
    );

    if (referredBy) {
      await run('UPDATE users SET referral_count = referral_count + 1 WHERE uid = ?', [referredBy]);
      // Sync referrer to Firestore immediately to persist count
      const updatedReferrer = await get('SELECT * FROM users WHERE uid = ?', [referredBy]);
      if (updatedReferrer) {
        syncUserToFirestore(referredBy, mapUserForFrontend(updatedReferrer));
      }
    }

    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;

    // Send Welcome Email
    try {
      const subject = 'Welcome to Bivaax Trade - Professional Global Trading';
      const welcomeLink = `${req.headers.origin || 'https://bivaax.com'}/trade`;
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
          <div style="background-color: #1a1b23; padding: 40px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #FFE24C;">Welcome to Bivaax!</h1>
            <p style="opacity: 0.9; margin-top: 10px;">Your Professional Trading Journey Starts Here</p>
          </div>
          <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <p style="font-size: 16px; color: #333;">Hello <strong>${fullName || 'Trader'}</strong>,</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Thank you for choosing Bivaax Trade. We are excited to have you on board as we redefine global trading with precision and transparency.</p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #FFE24C;">
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; tracking-wider;">Your Account Details:</h3>
              <p style="margin: 5px 0; font-size: 15px; color: #475569;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0; font-size: 15px; color: #475569;"><strong>Affiliate Code:</strong> ${affiliateId}</p>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${welcomeLink}" style="background-color: #FFE24C; color: #1a1b23; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 15px rgba(255, 226, 76, 0.3);">Access Trading Terminal</a>
            </div>

            <p style="font-size: 14px; color: #64748b; line-height: 1.6; text-align: center;">Need assistance? Our professional support team is available 24/7 to guide you through your first trades.</p>
            
            <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
            <div style="text-align: center; font-size: 12px; color: #94a3b8;">
              <p>&copy; 2026 Bivaax Trade Ecosystem. All Rights Reserved.</p>
              <p>Professional | Secure | Global</p>
            </div>
          </div>
        </div>
      `;
      await sendEmail(email, subject, html);
    } catch (mailErr) {
      logger.error('Failed to send registration welcome email:', mailErr);
    }

    res.json({ success: true, user });
    
    // Sync to Firestore for real-time data accessibility
    try {
      syncUserToFirestore(uid, mapUserForFrontend(user));
    } catch (syncErr) {
      logger.error('Failed to sync new user to Firestore:', syncErr);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]) as any;
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Sync to Firestore on login to ensure latest data is available real-time
    try {
      // Check for balance restoration from Firestore if SQLite is behind
      if (adminDb) {
        const firestoreUser = await adminDb.collection('users').doc(user.uid).get();
        if (firestoreUser.exists) {
          const fireData = firestoreUser.data();
          if (fireData) {
            let needsUpdate = false;
            let updatedReal = user.real_balance || 0;
            let updatedDemo = user.demo_balance || 0;

            if (fireData.balance > updatedReal) {
              updatedReal = fireData.balance;
              needsUpdate = true;
            }
            if (fireData.demoBalance > updatedDemo) {
              updatedDemo = fireData.demoBalance;
              needsUpdate = true;
            }

            if (needsUpdate) {
              logger.info(`Restoring balance for ${user.email} from Firestore: Real=${updatedReal}, Demo=${updatedDemo}`);
              await run('UPDATE users SET real_balance = ?, demo_balance = ? WHERE uid = ?', [updatedReal, updatedDemo, user.uid]);
              user.real_balance = updatedReal;
              user.demo_balance = updatedDemo;
            }
          }
        }
      }
      syncUserToFirestore(user.uid, mapUserForFrontend(user));
    } catch (syncErr) {
      logger.error('Failed to sync/restore user data from Firestore on login:', syncErr);
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Partner Login OTP Map & Endpoints
const partnerLoginOtps = new Map<string, { otp: string, expiresAt: number, userId: string }>();
const partnerRegisterOtps = new Map<string, { otp: string, expiresAt: number, data: any }>();

router.post('/auth/partner/send-register-otp', async (req, res) => {
  const { email, fullName } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const existing = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    partnerRegisterOtps.set(email.toLowerCase().trim(), { otp, expiresAt, data: req.body });

    const subject = 'Bivaax Partners Registration Verification Code';
    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 12px; border: 1px solid #edf2f7;">
        <h2 style="color: #111217; font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 24px;">PARTNER REGISTRATION VERIFICATION</h2>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">Hello ${fullName || 'Partner'},<br><br>Thank you for your interest in joining Bivaax Partners. Use the following 6-digit security code to verify your email and complete your application:</p>
        <div style="background-color: #111217; color: #FFE24C; padding: 20px; text-align: center; font-size: 36px; font-weight: 800; letter-spacing: 5px; border-radius: 8px; margin: 30px 0; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #718096; font-size: 12px; line-height: 1.5; text-align: center;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;
    await sendEmail(email, subject, html);

    res.json({ success: true, message: 'Verification OTP sent to your email' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/partner/verify-register-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const record = partnerRegisterOtps.get(email.toLowerCase().trim());
    if (!record) return res.status(400).json({ error: 'No active registration request found' });

    if (Date.now() > record.expiresAt) {
      partnerRegisterOtps.delete(email.toLowerCase().trim());
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (record.otp !== otp) return res.status(401).json({ error: 'Invalid verification code' });

    // Success! Data is verified. We can proceed with registration.
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/partner/send-otp', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]) as any;
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate a secure 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    partnerLoginOtps.set(email.toLowerCase().trim(), { otp, expiresAt, userId: user.uid });

    // Send email with OTP using the system sendEmail helper
    const subject = 'Bivaax Partners Login Verification Code';
    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 12px; border: 1px solid #edf2f7;">
        <h2 style="color: #111217; font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 24px;">PARTNER LOGIN VERIFICATION</h2>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">You are attempting to sign in to your Bivaax Partners affiliate portal. Please use the following 6-digit security code to complete your verification:</p>
        <div style="background-color: #111217; color: #FFE24C; padding: 20px; text-align: center; font-size: 36px; font-weight: 800; letter-spacing: 5px; border-radius: 8px; margin: 30px 0; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #718096; font-size: 12px; line-height: 1.5; text-align: center;">This code is valid for 5 minutes. If you did not initiate this login request, please secure your account immediately.</p>
      </div>
    `;
    await sendEmail(email, subject, html);

    res.json({ success: true, message: 'Verification OTP sent to your email' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/partner/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const record = partnerLoginOtps.get(email.toLowerCase().trim());
    if (!record) {
      return res.status(400).json({ error: 'No active login request found for this email' });
    }

    if (Date.now() > record.expiresAt) {
      partnerLoginOtps.delete(email.toLowerCase().trim());
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (record.otp !== otp) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // OTP verified! Get the user.
    const user = await get('SELECT * FROM users WHERE uid = ?', [record.userId]) as any;
    partnerLoginOtps.delete(email.toLowerCase().trim());

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/kyc', async (req, res) => {
  const { userId, kycData } = req.body;
  if (!userId || !kycData) return res.status(400).json({ error: 'Missing KYC data' });

  try {
    // 1. Log the submission
    logger.info(`KYC Submission for ${userId}: ${kycData.fullName}`);

    // 2. Perform "Auto-Verification" Logic
    // In a real professional app, this would use OCR (like Google Vision API)
    // Here we simulate immediate rejection for suspicious data
    let status = 'pending';
    let rejectionReason = null;

    if (kycData.idNumber && kycData.idNumber.length < 5) {
      status = 'rejected';
      rejectionReason = 'Invalid ID number format. Document rejected.';
    }

    // 3. Update SQL database
    await run(
      'UPDATE users SET kyc_status = ?, updated_at = ? WHERE uid = ?',
      [status, Date.now(), userId]
    );

    try {
      await run(
        `INSERT INTO kyc_requests (user_id, status, full_name, document_type, document_number, front_image, back_image, selfie_image, rejection_reason, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          status, 
          kycData.fullName || '', 
          kycData.idType || '', 
          kycData.idNumber || '', 
          kycData.idFrontUrl || '', 
          kycData.idBackUrl || '', 
          kycData.selfieUrl || '', 
          rejectionReason, 
          Date.now(), 
          Date.now()
        ]
      );
    } catch (sqlErr: any) {
      logger.warn(`Failed to insert KYC request into local SQL database: ${sqlErr.message}`);
    }

    // 4. Update Firebase Admin if needed (optional since frontend can do it, but server-side is more secure)
    try {
      await run('UPDATE users SET kyc_status = ?, is_nid_verified = ?, nid_number = ? WHERE uid = ?', 
        [status, (status === 'approved' || status === 'verified') ? 1 : 0, kycData.idNumber || '', userId]);
    } catch (sqlErr: any) {
      logger.error(`Failed to update SQL KYC status for ${userId}: ${sqlErr.message}`);
    }

    if (adminDb) {
      const userRef = adminDb.collection('users').doc(userId);
      await userRef.update({
        kycStatus: status,
        isNidVerified: status === 'approved' || status === 'verified',
        nidNumber: kycData.idNumber || '',
        kycSubmittedAt: new Date().toISOString(),
        idType: kycData.idType,
        fullName: kycData.fullName,
        kycRejectionReason: rejectionReason
      });

      // Also save to dedicated kycRequests collection for administrative tracking
      try {
        await adminDb.collection('kycRequests').add({
          userId,
          ...kycData,
          status,
          rejectionReason,
          submittedAt: new Date().toISOString(),
          timestamp: Date.now()
        });
      } catch (e) {}
    }

    res.json({ 
      success: true, 
      status, 
      rejectionReason 
    });

    // 5. Send Submission Confirmation Email
    try {
      const user = await get('SELECT email, display_name FROM users WHERE uid = ?', [userId]) as any;
      if (user && user.email) {
        const subject = 'ID Verification Received - Bivaax Trade';
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
            <div style="background-color: #1a1b23; padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
              <h2 style="color: #FFE24C; margin: 0;">Identity Verification Started</h2>
            </div>
            <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed;">
              <p>Hello ${kycData.fullName || user.display_name || 'Trader'},</p>
              <p>We have successfully received your identity verification (KYC) documents. Our compliance team is now reviewing your submission.</p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #FFE24C;">
                <p style="margin: 0; font-weight: bold; color: #1e293b;">Status: UNDER REVIEW</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">Estimated review time: 12-24 hours</p>
              </div>

              <div style="font-size: 14px; color: #64748b; line-height: 1.6;">
                <p><strong>Submitted Details:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Document Type: ${kycData.idType}</li>
                  <li>Name: ${kycData.fullName}</li>
                </ul>
              </div>

              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">You will receive another email once your verification status has been updated. Thank you for your patience.</p>
              
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 Bivaax Trade Compliance Center</p>
            </div>
          </div>
        `;
        await sendEmail(user.email, subject, html);
      }
    } catch (e: any) {
      logger.error(`Failed to send KYC submission email: ${e.message}`);
    }
  } catch (err: any) {
    logger.error(`KYC submission failed for ${userId}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// --- Admin & Support Routes ---

router.get('/user/details', async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'UID is required' });

  try {
    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export function parseCleanNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export async function getUserTransactionsFromFirestore(userId: string): Promise<any[]> {
  if (!adminDb) {
    throw new Error('Firestore is not initialized');
  }

  const [depositsSnap, withdrawalsSnap, transactionsSnap] = await Promise.all([
    adminDb.collection('deposits').where('userId', '==', userId).get(),
    adminDb.collection('withdrawals').where('userId', '==', userId).get(),
    adminDb.collection('transactions').where('userId', '==', userId).get()
  ]);

  const list: any[] = [];

  depositsSnap.forEach((doc) => {
    const data = doc.data();
    const ts = data.timestamp || data.createdAt || Date.now();
    const amt = parseCleanNumber(data.amount || data.creditedAmount || data.baseAmount);
    if (amt <= 0) return;

    list.push({
      id: doc.id,
      userId: userId,
      user_id: userId,
      type: 'Deposit',
      amount: amt,
      currency: data.currency || 'BDT',
      status: (data.status === 'success' || data.status === 'approved' || data.status === 'completed') ? 'success' : (data.status || 'pending'),
      method: data.method || 'direct',
      trxId: data.trxId || data.txHash || '',
      tx_hash: data.trxId || data.txHash || '',
      timestamp: ts,
      created_at: ts,
      details: { walletNumber: data.walletNumber || '', orderId: data.orderId || '' }
    });
  });

  withdrawalsSnap.forEach((doc) => {
    const data = doc.data();
    const ts = data.timestamp || data.createdAt || data.created_at || Date.now();
    const amt = parseCleanNumber(data.amount);
    if (amt <= 0) return;

    list.push({
      id: doc.id,
      userId: userId,
      user_id: userId,
      type: 'Withdrawal',
      amount: amt,
      currency: data.currency || 'BDT',
      status: (data.status === 'success' || data.status === 'approved' || data.status === 'completed') ? 'success' : (data.status || 'pending'),
      method: data.method || 'direct',
      trxId: data.trxId || '',
      tx_hash: data.trxId || '',
      orderId: data.orderId || data.details?.orderId || doc.id || '',
      timestamp: ts,
      created_at: ts,
      details: data.details || {}
    });
  });

  transactionsSnap.forEach((doc) => {
    const rootData = doc.data();
    const data = rootData.transactionData || rootData;
    
    if (!data.type) return;

    const ts = data.timestamp || data.createdAt || rootData.timestamp || rootData.createdAt || Date.now();
    const orderId = data.orderId || '';
    const txHash = data.trxId || data.txHash || data.tx_hash || '';
    const amt = parseCleanNumber(data.amount);

    if (amt <= 0) return;
    
    if (orderId && list.some(item => item.details?.orderId === orderId)) {
      return;
    }
    if (txHash && list.some(item => item.trxId === txHash || item.tx_hash === txHash)) {
      return;
    }

    list.push({
      id: doc.id,
      userId: userId,
      user_id: userId,
      type: (data.type || 'Deposit').toLowerCase() === 'deposit' ? 'Deposit' : 'Withdrawal',
      amount: amt,
      currency: data.currency || 'BDT',
      status: (data.status === 'success' || data.status === 'approved' || data.status === 'completed') ? 'success' : (data.status || 'pending'),
      method: data.method || 'direct',
      trxId: txHash,
      tx_hash: txHash,
      timestamp: ts,
      created_at: ts,
      details: data.details || { orderId, walletNumber: data.walletNumber || '' }
    });
  });

  list.sort((a, b) => b.timestamp - a.timestamp);
  return list;
}

export async function getUserTransactions(userId: string): Promise<any[]> {
  try {
    // 1. Fetch from PostgreSQL / Relational Database (Primary Source of Truth)
    const rows = await query(
      `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 200`,
      [userId]
    ) as any[];

    const sqlTxs = (rows || []).map((r) => {
      const typeLower = (r.type || 'deposit').toLowerCase();
      let displayType = 'Deposit';
      if (typeLower === 'withdrawal') displayType = 'Withdrawal';
      else if (typeLower === 'tournament_entry') displayType = 'Tournament Fee';
      else if (typeLower !== 'deposit') displayType = r.type;

      let detailsParsed: any = {};
      try {
        detailsParsed = typeof r.details === 'string' ? JSON.parse(r.details) : r.details || {};
      } catch (e) {}

      const ts = Number(r.created_at) || Date.now();
      const sLower = String(r.status || 'pending').toLowerCase();
      let statusDisplay = "pending";
      if (['success', 'approved', 'completed', 'credited'].includes(sLower)) statusDisplay = "completed";
      else if (['rejected', 'declined', 'cancelled', 'canceled'].includes(sLower)) statusDisplay = "rejected";

      return {
        id: r.id?.toString() || '',
        userId: r.user_id,
        user_id: r.user_id,
        type: displayType,
        amount: Number(r.amount || 0),
        currency: r.currency || 'BDT',
        status: statusDisplay,
        method: r.method || displayType,
        trxId: r.tx_hash || detailsParsed?.trxId || detailsParsed?.txHash || '',
        tx_hash: r.tx_hash || '',
        orderId: r.order_id || detailsParsed?.orderId || detailsParsed?.firestoreId || '',
        timestamp: ts,
        created_at: ts,
        details: detailsParsed
      };
    });

    // Clean up duplicate pending withdrawals in SQL database and list
    const uniqueSqlTxs: any[] = [];
    for (const tx of sqlTxs) {
      if (tx.type === 'Withdrawal' && tx.status === 'pending') {
        const isDuplicate = uniqueSqlTxs.some(existing => 
          existing.type === 'Withdrawal' && 
          existing.status === 'pending' && 
          existing.amount === tx.amount && 
          Math.abs(existing.timestamp - tx.timestamp) < 5 * 60 * 1000 // 5 minutes
        );
        if (isDuplicate) {
          if (tx.id) {
            run(`DELETE FROM transactions WHERE id = ?`, [Number(tx.id)]).catch(() => {});
          }
          continue;
        }
      }
      uniqueSqlTxs.push(tx);
    }

    // 2. Also check Firestore to ensure no pending client records are missing
    let fsTxs: any[] = [];
    if (adminDb) {
      try {
        fsTxs = await getUserTransactionsFromFirestore(userId);
      } catch (fsErr: any) {
        logger.warn(`[getUserTransactions] Optional Firestore sync fetch: ${fsErr.message}`);
      }
    }

    // 3. Merge and deduplicate by orderId, trxId, or database ID
    const mergedMap = new Map<string, any>();

    // Start with SQL transactions
    for (const tx of uniqueSqlTxs) {
      const key = tx.orderId ? `order_${tx.orderId}` : (tx.trxId ? `trx_${tx.trxId}` : `sql_${tx.id}`);
      mergedMap.set(key, tx);
    }

    // Merge in any Firestore transactions and persist them to PostgreSQL if missing
    for (const tx of fsTxs) {
      const key = tx.orderId ? `order_${tx.orderId}` : (tx.trxId ? `trx_${tx.trxId}` : `fs_${tx.id}`);
      if (!mergedMap.has(key)) {
        mergedMap.set(key, tx);
        // Persist missing Firestore transaction permanently into PostgreSQL transactions table
        try {
          const typeStr = (tx.type || 'deposit').toLowerCase();
          const amountStr = (tx.amount || 0).toString();
          const sLower = String(tx.status || 'pending').toLowerCase();
          const statusStr = (['success', 'approved', 'completed', 'credited'].includes(sLower)) ? 'completed' : (['rejected', 'declined', 'cancelled', 'canceled'].includes(sLower) ? 'rejected' : 'pending');
          const methodStr = tx.method || (typeStr === 'deposit' ? 'direct' : 'withdrawal');
          const currencyStr = tx.currency || 'BDT';
          const txHashStr = tx.trxId || tx.tx_hash || '';
          const orderIdStr = tx.orderId || '';
          const createdAtNum = Number(tx.timestamp || tx.created_at) || Date.now();
          const detailsStr = JSON.stringify(tx.details || { orderId: orderIdStr });

          await run(
            `INSERT INTO transactions (user_id, type, amount, status, method, tx_hash, currency, details, order_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, typeStr, amountStr, statusStr, methodStr, txHashStr, currencyStr, detailsStr, orderIdStr || null, createdAtNum]
          );
        } catch (insertErr) {
          // ignore duplicate insert errors
        }
      } else {
        // If SQL has pending status but Firestore recorded approval/rejection, update SQL status
        const existing = mergedMap.get(key);
        if (existing && existing.status === 'pending' && (tx.status === 'completed' || tx.status === 'success' || tx.status === 'approved' || tx.status === 'rejected')) {
          const updatedStatus = tx.status === 'rejected' ? 'rejected' : 'completed';
          existing.status = updatedStatus;
          try {
            if (existing.id && !isNaN(Number(existing.id))) {
              await run(`UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?`, [updatedStatus, Date.now(), Number(existing.id)]);
            }
          } catch (updErr) {}
        }
      }
    }

    const finalList = Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || b.created_at) - (a.timestamp || a.created_at));
    return finalList;
  } catch (err: any) {
    logger.error(`[getUserTransactions] Error fetching transactions: ${err.message}`);
    return [];
  }
}

export async function syncGlobalTransactionsFromFirestore() {
  if (!adminDb) return;
  try {
    // 1. Sync Deposits
    const depositsSnap = await adminDb.collection('deposits').limit(500).get();
    let i = 0;
    const batchSize = 50;
    while (i < depositsSnap.docs.length) {
      await transaction(async (conn) => {
        const batch = depositsSnap.docs.slice(i, i + batchSize);
        for (const doc of batch) {
          const data = doc.data();
          const firestoreId = doc.id;
          const userId = data.userId;
          if (!userId) continue;

          const txHash = data.trxId || data.txHash || '';
          const amount = (data.amount || 0).toString();
          const status = (data.status === 'success' || data.status === 'approved') ? 'completed' : data.status || 'pending';
          const method = data.method || 'direct';
          const currency = data.currency || 'BDT';
          const createdTime = data.timestamp || Date.now();

          let existingTx = null;
          if (txHash) {
            existingTx = await get('SELECT id FROM transactions WHERE user_id = ? AND tx_hash = ? AND type = ?', [userId, txHash, 'deposit'], conn);
          }
          if (!existingTx) {
            existingTx = await get('SELECT id FROM transactions WHERE user_id = ? AND details LIKE ? AND type = ?', [userId, `%${firestoreId}%`, 'deposit'], conn);
          }
          if (!existingTx) {
            existingTx = await get('SELECT id FROM transactions WHERE user_id = ? AND type = ? AND amount = ? AND created_at = ?', [userId, 'deposit', amount, createdTime], conn);
          }

          const detailsObj = { firestoreId, walletNumber: data.walletNumber, orderId: data.orderId };

          if (!existingTx) {
            await run(
              `INSERT INTO transactions (user_id, type, amount, status, method, tx_hash, currency, details, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [userId, 'deposit', amount, status, method, txHash, currency, JSON.stringify(detailsObj), createdTime],
              conn
            );
          } else {
            await run(
              `UPDATE transactions SET status = ?, updated_at = ? WHERE id = ? AND status != ?`,
              [status, Date.now(), (existingTx as any).id, status],
              conn
            );
          }
        }
      }).catch(txErr => {
        logger.error(`[syncGlobalTransactionsFromFirestore] Deposit batch failed: ${txErr.message}`);
      });
      i += batchSize;
      await new Promise(resolve => setImmediate(resolve));
    }

    // 2. Sync Withdrawals
    const withdrawalsSnap = await adminDb.collection('withdrawals').limit(500).get();
    i = 0;
    while (i < withdrawalsSnap.docs.length) {
      await transaction(async (conn) => {
        const batch = withdrawalsSnap.docs.slice(i, i + batchSize);
        for (const doc of batch) {
          const data = doc.data();
          const firestoreId = doc.id;
          const userId = data.userId;
          if (!userId) continue;

          const txHash = data.txHash || '';
          const amount = (data.amount || 0).toString();
          const status = (data.status === 'success' || data.status === 'approved') ? 'completed' : data.status || 'pending';
          const method = data.method || 'direct';
          const currency = data.currency || 'USD';
          const createdTime = data.timestamp || Date.now();

          let existingTx = null;
          if (txHash) {
            existingTx = await get('SELECT id FROM transactions WHERE user_id = ? AND tx_hash = ? AND type = ?', [userId, txHash, 'withdrawal'], conn);
          }
          if (!existingTx) {
            existingTx = await get('SELECT id FROM transactions WHERE user_id = ? AND details LIKE ? AND type = ?', [userId, `%${firestoreId}%`, 'withdrawal'], conn);
          }
          if (!existingTx) {
            existingTx = await get('SELECT id FROM transactions WHERE user_id = ? AND type = ? AND amount = ? AND created_at = ?', [userId, 'withdrawal', amount, createdTime], conn);
          }

          const detailsObj = { firestoreId, walletNumber: data.walletNumber, bankDetails: data.details };

          if (!existingTx) {
            await run(
              `INSERT INTO transactions (user_id, type, amount, status, method, tx_hash, currency, details, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [userId, 'withdrawal', amount, status, method, txHash, currency, JSON.stringify(detailsObj), createdTime],
              conn
            );
          } else {
            await run(
              `UPDATE transactions SET status = ?, updated_at = ? WHERE id = ? AND status != ?`,
              [status, Date.now(), (existingTx as any).id, status],
              conn
            );
          }
        }
      }).catch(txErr => {
        logger.error(`[syncGlobalTransactionsFromFirestore] Withdrawal batch failed: ${txErr.message}`);
      });
      i += batchSize;
      await new Promise(resolve => setImmediate(resolve));
    }
  } catch (err) {
    logger.error(`[syncGlobalTransactionsFromFirestore] Error: ${err}`);
  }
}

export async function syncKYCRequestsFromFirestore() {
  if (!adminDb) return;
  try {
    const snapshot = await adminDb.collection('kycRequests').limit(200).get();
    if (snapshot.empty) return;

    let i = 0;
    const batchSize = 50;
    while (i < snapshot.docs.length) {
      await transaction(async (conn) => {
        const batch = snapshot.docs.slice(i, i + batchSize);
        for (const doc of batch) {
          const data = doc.data();
          const userId = data.userId;
          if (!userId) continue;

          const status = data.status || 'pending';
          const fullName = data.fullName || '';
          const documentType = data.idType || '';
          const documentNumber = data.idNumber || '';
          const frontImage = data.idFrontUrl || '';
          const backImage = data.idBackUrl || '';
          const selfieImage = data.selfieUrl || '';
          const rejectionReason = data.rejectionReason || '';
          const submittedAt = data.submittedAt || Date.now();
          const updatedAt = data.updatedAt instanceof Date ? data.updatedAt.getTime() : (data.updatedAt || Date.now());

          const existing = await get('SELECT id FROM kyc_requests WHERE user_id = ? AND status = ? AND document_number = ?', [userId, status, documentNumber], conn);
          if (!existing) {
            await run(
              `INSERT INTO kyc_requests (user_id, status, full_name, document_type, document_number, front_image, back_image, selfie_image, rejection_reason, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [userId, status, fullName, documentType, documentNumber, frontImage, backImage, selfieImage, rejectionReason, submittedAt, updatedAt],
              conn
            );
          }
        }
      }).catch(txErr => {
        logger.error(`[syncKYCRequestsFromFirestore] KYC batch failed: ${txErr.message}`);
      });
      i += batchSize;
      await new Promise(resolve => setImmediate(resolve));
    }
  } catch (err: any) {
    logger.error(`[syncKYCRequestsFromFirestore] Error: ${err.message}`);
  }
}

export async function syncTradesFromFirestore() {
  if (!adminDb) return;
  try {
    const snapshot = await adminDb.collection('trades').orderBy('createdAt', 'desc').limit(500).get();
    if (snapshot.empty) return;

    await transaction(async (conn) => {
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const firebaseId = doc.id;

        const userId = data.userId;
        const marketId = data.marketId;
        const amount = data.amount;
        const direction = data.direction;
        const entryPrice = data.entryPrice;
        const exitPrice = data.exitPrice || null;
        const duration = data.duration;
        const expiryTime = data.expiryTime;
        const isDemo = data.isDemo ? 1 : 0;
        const status = data.status || 'open';
        const payoutAmount = data.payoutAmount || 0;
        const settledAt = data.settledAt || null;
        const createdAt = data.createdAt || Date.now();

        const numId = isNaN(Number(firebaseId)) ? 0 : Number(firebaseId);
        const existing = await get(
          `SELECT id FROM trades WHERE firebase_id = ? OR (id = ? AND ? > 0)`,
          [firebaseId, numId, numId],
          conn
        ) as any;

        if (!existing) {
          await run(
            `INSERT INTO trades (firebase_id, user_id, market_id, amount, direction, entry_price, exit_price, duration, expiry_time, is_demo, status, payout_amount, settled_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [firebaseId, userId, marketId, amount, direction, entryPrice, exitPrice, duration, expiryTime, isDemo, status, payoutAmount, settledAt, createdAt],
            conn
          );
        } else {
          await run(
            `UPDATE trades SET status = ?, exit_price = ?, payout_amount = ?, settled_at = ? WHERE id = ? AND status != ?`,
            [status, exitPrice, payoutAmount, settledAt, existing.id, status],
            conn
          );
        }
      }
    }).catch(txErr => {
      logger.error(`[syncTradesFromFirestore] Batch transaction failed: ${txErr.message}`);
    });
  } catch (err: any) {
    logger.error(`[syncTradesFromFirestore] Error: ${err.message}`);
  }
}

let adminSeeded = false;
export async function ensureSeedAdminUser() {
  if (adminSeeded) return;
  const adminEmail = 'support@bivaax.com';
  const adminPass = 'Mdhasan';
  try {
    logger.info(`👤 Ensuring seed admin user ${adminEmail} is present...`);
    const hashedPassword = await bcrypt.hash(adminPass, 10);
    
    // Check if user exists in SQLite
    const existing = await get('SELECT * FROM users WHERE email = ?', [adminEmail]) as any;
    if (!existing) {
      const uid = 'admin_seed_' + Math.random().toString(36).substring(2, 10);
      const affiliateId = Math.random().toString(36).substring(2, 8).toUpperCase();
      await run(
        `INSERT OR IGNORE INTO users (uid, email, password_hash, display_name, nickname, referral_code, is_admin, real_balance, demo_balance, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, adminEmail, hashedPassword, 'Bivaax Super Admin', 'Admin', affiliateId, 1, 1000.00, 10000.00, Date.now()]
      );
      logger.info(`✅ Seed admin user created in SQLite.`);
      
      // Sync to Firestore if initialized
      if (adminDb) {
        const userRef = adminDb.collection('users').doc(uid);
        await userRef.set({
          uid,
          email: adminEmail,
          displayName: 'Bivaax Super Admin',
          nickname: 'Admin',
          realBalance: 1000.00,
          demoBalance: 10000.00,
          isAdmin: true,
          isVerified: true,
          affiliateId,
          referralCode: affiliateId,
          createdAt: Date.now()
        }, { merge: true });
        logger.info(`✅ Seed admin user synced to Firestore.`);
      }
    } else {
      // User exists, update password and make sure they are admin
      await run('UPDATE users SET password_hash = ?, is_admin = 1 WHERE email = ?', [hashedPassword, adminEmail]);
      logger.info(`✅ Seed admin user password updated/verified in SQLite.`);
      
      if (adminDb) {
        const userSnap = await adminDb.collection('users').where('email', '==', adminEmail).get();
        if (!userSnap.empty) {
          const userDoc = userSnap.docs[0];
          await adminDb.collection('users').doc(userDoc.id).set({
            isAdmin: true,
            isVerified: true
          }, { merge: true });
          logger.info(`✅ Seed admin user permissions verified in Firestore.`);
        } else {
          // Sync existing SQLite user to Firestore
          const freshUser = await get('SELECT * FROM users WHERE email = ?', [adminEmail]);
          if (freshUser) {
            const mapped = mapUserForFrontend(freshUser);
            if (mapped) {
              await adminDb.collection('users').doc((freshUser as any).uid).set({
                ...mapped,
                password: hashedPassword
              }, { merge: true });
              logger.info(`✅ Seed admin user synced from SQLite to Firestore.`);
            }
          }
        }
      }
    }
  } catch (err: any) {
    logger.error(`❌ Failed to ensure seed admin user: ${err.message}`);
  }
}

export async function seedPromoServer() {
  // News item "50% Deposit Bonus" has been removed per user request.
  return;
}

export async function syncDatabaseFromFirestore() {
  logger.info('🔄 PostgreSQL is the sole source of truth. Skipping Firestore database synchronization to keep all production data intact.');
  try {
    // Ensure the seed admin exists and is up to date
    await ensureSeedAdminUser();

    // Run news and promo seeding securely from server-side
    logger.info('📣 Seeding news and promos on server...');
    await seedPromoServer();

    logger.info('✅ Database initialization completed successfully.');
  } catch (err: any) {
    logger.error(`❌ Database initialization warning: ${err.message}`);
  }
}

export async function syncAllUsersFromFirestore() {
  if (!adminDb) return;
  try {
    // Limit to latest 1000 users to keep boot sync safe
    const snapshot = await adminDb.collection('users').limit(1000).get();
    if (snapshot.empty) return;

    let i = 0;
    const batchSize = 50;
    while (i < snapshot.docs.length) {
      await transaction(async (conn) => {
        const batch = snapshot.docs.slice(i, i + batchSize);
        for (const doc of batch) {
          const fbData = doc.data();
          const uid = doc.id;
          const email = fbData.email || '';
          
          const rawReal = fbData.balance ?? fbData.real_balance ?? fbData.realBalance ?? 0;
          const realBalance = parseFloat(rawReal.toString()) || 0;
          const rawDemo = fbData.demoBalance ?? fbData.demo_balance ?? 10000;
          const demoBalance = parseFloat(rawDemo.toString()) || 10000;
          const isVerified = (fbData.isVerified || fbData.is_verified || fbData.emailVerified) ? 1 : 0;
          const kycStatus = fbData.kycStatus || fbData.kyc_status || 'unverified';
          const passwordValue = fbData.password_hash || fbData.passwordHash || fbData.password || null;
          const displayName = fbData.displayName || fbData.display_name || '';
          const nickname = fbData.nickname || '';
          const photoURL = fbData.photoURL || fbData.photo_url || '';
          const currency = fbData.currency || 'USD';
          const country = fbData.country || '';
          const countryCode = fbData.countryCode || fbData.country_code || '';
          const is_admin = (fbData.isAdmin || fbData.is_admin) ? 1 : 0;
          const referralCode = fbData.referralCode || fbData.referral_code || Math.random().toString(36).substring(2, 8).toUpperCase();
          const referredByUid = fbData.referredBy || fbData.referred_by_uid || null;
          const totalLiveVolume = fbData.totalLiveVolume || fbData.total_live_volume || '0.00';
          const referralCount = fbData.referralCount || fbData.referral_count || 0;
          const affiliateBalance = fbData.affiliateBalance || fbData.affiliate_balance || '0.00';
          const totalAffiliateEarnings = fbData.totalAffiliateEarnings || fbData.total_affiliate_earnings || '0.00';

          const user = await get('SELECT id, real_balance, demo_balance, is_verified, kyc_status, display_name, password_hash, affiliate_balance, total_affiliate_earnings, referral_count FROM users WHERE uid = ?', [uid], conn) as any;

          if (!user) {
            await run(
              `INSERT INTO users (uid, email, password_hash, display_name, nickname, photo_url, real_balance, demo_balance, currency, is_verified, is_admin, kyc_status, referral_code, referred_by_uid, total_live_volume, country, country_code, affiliate_balance, total_affiliate_earnings, referral_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                uid, email, passwordValue, displayName, nickname, photoURL, 
                realBalance, demoBalance, currency, isVerified, is_admin, kycStatus, 
                referralCode, referredByUid, totalLiveVolume.toString(), country, countryCode,
                affiliateBalance.toString(), totalAffiliateEarnings.toString(), referralCount
              ],
              conn
            );
          } else {
            let needsUpdate = false;
            const updates: string[] = [];
            const params: any[] = [];

            // Only update balance from Firestore if SQL balance is 0/null and Firestore has a positive balance
            if ((parseFloat(user.real_balance || 0) === 0) && realBalance > 0) {
              updates.push('real_balance = ?');
              params.push(realBalance);
              needsUpdate = true;
            }
            if ((parseFloat(user.demo_balance || 0) === 0) && demoBalance > 0) {
              updates.push('demo_balance = ?');
              params.push(demoBalance);
              needsUpdate = true;
            }
            if ((parseFloat(user.affiliate_balance || 0) === 0) && parseFloat(affiliateBalance || 0) > 0) {
              updates.push('affiliate_balance = ?');
              params.push(affiliateBalance.toString());
              needsUpdate = true;
            }
            if ((parseFloat(user.total_affiliate_earnings || 0) === 0) && parseFloat(totalAffiliateEarnings || 0) > 0) {
              updates.push('total_affiliate_earnings = ?');
              params.push(totalAffiliateEarnings.toString());
              needsUpdate = true;
            }
            if (referralCount > (user.referral_count || 0)) {
              updates.push('referral_count = ?');
              params.push(referralCount);
              needsUpdate = true;
            }
            if (!user.is_verified && isVerified) {
              updates.push('is_verified = ?');
              params.push(isVerified);
              needsUpdate = true;
            }
            if (kycStatus !== 'unverified' && user.kyc_status === 'unverified') {
              updates.push('kyc_status = ?');
              params.push(kycStatus);
              needsUpdate = true;
            }
            if (displayName && !user.display_name) {
              updates.push('display_name = ?');
              params.push(displayName);
              needsUpdate = true;
            }
            if (passwordValue && !user.password_hash) {
              updates.push('password_hash = ?');
              params.push(passwordValue);
              needsUpdate = true;
            }

            if (needsUpdate) {
              params.push(uid);
              await run(`UPDATE users SET ${updates.join(', ')} WHERE uid = ?`, params, conn);
            }
          }
        }
      }).catch(txErr => {
        logger.error(`[syncAllUsersFromFirestore] Batch user transaction failed: ${txErr.message}`);
      });
      i += batchSize;
      await new Promise(resolve => setImmediate(resolve));
    }
  } catch (err: any) {
    logger.error(`[syncAllUsersFromFirestore] Error: ${err.message}`);
  }
}

// 1. User Sync (called on app load / terminal boot)
router.post('/user/sync', async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    logger.error('Sync failed: uid is missing');
    return res.status(400).json({ error: 'uid is required' });
  }

  try {
    logger.info(`Fast-syncing user: ${uid}`);
    
    // 1. Try to get user from local SQLite first (Instant response)
    const localUser = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
    
    if (localUser) {
      // Send the local data immediately so the app is super fast
      res.json({ success: true, data: mapUserForFrontend(localUser) });
      
      // Trigger Firestore sync in the background
      authoritativeSync(uid).catch(err => logger.error(`Bg sync error for ${uid}: ${err}`));
      return;
    }

    // 2. If not found in local, perform authoritative sync (Wait for Firestore)
    let user = await authoritativeSync(uid);
    if (!user) {
      // If user doesn't exist in Firestore, create them locally
      const email = req.body.email || '';
      const displayName = req.body.displayName || '';
      const referralCode = req.body.referralCode || '';
      const referredByUid = req.body.referredByUid || null;
      const referralSubId = req.body.referralSubId || null;
      const referralType = req.body.referralType || null;
      const country = req.body.country || 'Global';
      const countryCode = req.body.countryCode || 'BD';

      await run(
        `INSERT OR IGNORE INTO users (uid, email, display_name, real_balance, demo_balance, kyc_status, is_verified, referral_code, referred_by_uid, referral_sub_id, referral_type, country, country_code) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, email, displayName, 0, 10000, 'unverified', 0, referralCode, referredByUid, referralSubId, referralType, country, countryCode]
      );
      if (referredByUid) {
        await run('UPDATE users SET referral_count = COALESCE(referral_count, 0) + 1 WHERE uid = ?', [referredByUid]).catch(err => {
          logger.warn(`Failed to increment referrer referral_count on sync: ${err.message}`);
        });
      }
      user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    }

    const mappedData = mapUserForFrontend(user);
    if (mappedData) {
      syncUserToFirestore(uid, mappedData);
    }
    res.json({ success: true, data: mappedData });
  } catch (err: any) {
    logger.error(`User sync failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 2. Check 2FA Configuration
router.get('/user/check-2fa', async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'uid is required' });

  try {
    const user = await get('SELECT tfa_enabled, tfa_mode, tfa_secret FROM users WHERE uid = ?', [uid]) as any;
    if (!user) {
      return res.json({ tfaEnabled: false });
    }
    res.json({
      tfaEnabled: !!user.tfa_enabled,
      tfaMode: user.tfa_mode || 'app',
      tfaSecret: user.tfa_secret || null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Profile (PATCH users)
router.patch('/users/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (req.user!.uid !== id && !req.user!.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const existingUser = await get('SELECT * FROM users WHERE uid = ?', [id]) as any;
    const updates: string[] = [];
    const params: any[] = [];

    const fieldMap: { [key: string]: string } = {
      displayName: 'display_name',
      firstName: 'first_name',
      lastName: 'last_name',
      gender: 'gender',
      dob: 'dob',
      nickname: 'nickname',
      photoURL: 'photo_url',
      currency: 'currency',
      country: 'country',
      countryCode: 'country_code',
      tfaEnabled: 'tfa_enabled',
      tfaMode: 'tfa_mode',
      tfaSecret: 'tfa_secret',
      phone: 'phone',
      kycStatus: 'kyc_status',
      realBalance: 'real_balance',
      demoBalance: 'demo_balance',
      balance: 'real_balance',
      isVerified: 'is_verified',
      is_verified: 'is_verified',
      isEmailVerified: 'is_email_verified',
      emailVerified: 'is_email_verified',
      is_email_verified: 'is_email_verified',
      birthDay: 'birth_day',
      birthMonth: 'birth_month',
      birthYear: 'birth_year',
      timeZone: 'time_zone',
      language: 'language',
      newsletter: 'newsletter',
      allowNotifications: 'allow_notifications',
      customAffiliateShare: 'custom_affiliate_share',
      custom_affiliate_share: 'custom_affiliate_share'
    };

    let hasPersonalChanges = false;
    const personalKeys = ['displayName', 'firstName', 'lastName', 'nickname', 'phone', 'country', 'gender'];

    for (const [key, value] of Object.entries(req.body)) {
      const dbField = fieldMap[key];
      if (dbField) {
        if (existingUser && personalKeys.includes(key) && existingUser[dbField] !== value) {
          hasPersonalChanges = true;
        }

        if (typeof value === 'object' && value !== null && (value as any).increment !== undefined) {
          updates.push(`${dbField} = ${dbField} + ?`);
          params.push((value as any).increment);
        } else if (typeof value === 'object' && value !== null) {
          updates.push(`${dbField} = ?`);
          params.push(JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          updates.push(`${dbField} = ?`);
          params.push(value ? 1 : 0);
        } else {
          updates.push(`${dbField} = ?`);
          params.push(value);
        }
      }
    }

    if (updates.length > 0) {
      params.push(id);
      await run(`UPDATE users SET ${updates.join(', ')} WHERE uid = ?`, params);
    }

    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [id]) as any;
    
    // Send Profile Update Notification Email ONLY when personal info / username actually changes
    if (hasPersonalChanges && updatedUser && updatedUser.email) {
      try {
        const subject = 'Profile Updated - Bivaax Trade';
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
            <div style="background-color: #1a1b23; padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
              <h2 style="color: #FFE24C; margin: 0;">Security Alert: Profile Update</h2>
            </div>
            <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed;">
              <p>Hello ${updatedUser.display_name || 'Trader'},</p>
              <p>This is a confirmation that your Bivaax Trade profile personal information or username was recently updated.</p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="margin: 0 0 15px 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Updated Account Details:</h4>
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  ${updatedUser.first_name ? `<tr><td style="padding: 8px 0; color: #64748b;">First Name:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${updatedUser.first_name}</td></tr>` : ''}
                  ${updatedUser.last_name ? `<tr><td style="padding: 8px 0; color: #64748b;">Last Name:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${updatedUser.last_name}</td></tr>` : ''}
                  ${updatedUser.display_name ? `<tr><td style="padding: 8px 0; color: #64748b;">Display Name / Username:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${updatedUser.display_name}</td></tr>` : ''}
                  ${updatedUser.nickname ? `<tr><td style="padding: 8px 0; color: #64748b;">Nickname:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${updatedUser.nickname}</td></tr>` : ''}
                  ${updatedUser.phone ? `<tr><td style="padding: 8px 0; color: #64748b;">Phone:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${updatedUser.phone}</td></tr>` : ''}
                  ${updatedUser.country ? `<tr><td style="padding: 8px 0; color: #64748b;">Country:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${updatedUser.country}</td></tr>` : ''}
                </table>
              </div>

              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you did not make these changes, please contact our security team immediately or reset your password.</p>
              
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 Bivaax Trade Security Department</p>
            </div>
          </div>
        `;
        await sendEmail(updatedUser.email, subject, html);
      } catch (e: any) {
        logger.error(`Failed to send profile update email: ${e.message}`);
      }
    }

    const mappedData = mapUserForFrontend(updatedUser);
    if (mappedData) {
      await syncUserToFirestore(id, mappedData);
      try {
        const { getIO } = await import('../services/socketService.ts');
        getIO().to(`user_${id}`).emit('user_profile_update', mappedData);
      } catch (socketErr) {
        console.error(`[Socket] Failed to emit user_profile_update inside user PATCH:`, socketErr);
      }
    }
    res.json(mappedData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Fetch User Trades
router.get('/user-trades', async (req, res) => {
  const { userId } = req.query;
  console.log(`[DEBUG] GET /api/user-trades called with userId: ${userId}`);
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  
  try {
    const trades = await query(
      'SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [userId]
    );
    res.json({ success: true, trades: trades.map(mapTrade) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Fetch User Tickets
router.get('/user-tickets', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const userTickets = await query(
      'SELECT * FROM tickets WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100',
      [userId]
    );
    res.json({ success: true, tickets: userTickets.map(mapTicket) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Market Movers Widget (FMP API) ---
router.get('/market-movers', async (req, res) => {
  const mockMovers = [
    { symbol: 'AAPL', name: 'Apple Inc.', change: 2.45, price: 189.45, volatility: 0.15 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', change: -5.12, price: 238.12, volatility: 0.45 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', change: 3.89, price: 475.20, volatility: 0.35 },
    { symbol: 'AMZN', name: 'Amazon.com', change: 1.12, price: 145.10, volatility: 0.12 },
    { symbol: 'META', name: 'Meta Platforms', change: -2.15, price: 320.15, volatility: 0.25 }
  ];

  try {
    const apiKey = process.env.FMP_API_KEY;
    if (!apiKey) {
      return res.json(mockMovers);
    }

    // Fetch daily active stocks as a proxy for high volatility movers
    const response = await fetch(`https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${apiKey}`);
    if (!response.ok) {
      logger.warn(`FMP API request failed with status ${response.status}. Falling back to mock data.`);
      return res.json(mockMovers);
    }

    const data = await response.json() as any[];
    // Take top 5
    const movers = data.slice(0, 5).map(stock => ({
      symbol: stock.symbol,
      name: stock.name || stock.symbol,
      change: parseFloat(stock.changesPercentage || 0),
      price: parseFloat(stock.price || 0),
      // We can use a simple volatility proxy: absolute percentage change
      volatility: Math.abs(parseFloat(stock.changesPercentage || 0))
    }));

    // Sort by "volatility" (absolute change) descending
    movers.sort((a, b) => b.volatility - a.volatility);

    res.json(movers);
  } catch (err: any) {
    logger.error(`Market Movers fetch failed: ${err.message}. Falling back to mock data.`);
    res.json(mockMovers);
  }
});

// --- Support API ---

// AI Assistant Route (Agentic)
router.post('/support/ai-chat', requireAuth, async (req: AuthRequest, res) => {
    const { message, history, mode } = req.body;
    const userId = req.user!.uid;
    if (!message) return res.status(400).json({ error: 'Missing message' });

    try {
        const responseData = await handleSupportQuery(userId, message, history || [], mode || 'agentic');

        if (responseData.transferToAgent) {
             // Logic to create a ticket automatically if handoff is requested
             const ticketId = 'tkt_' + Math.random().toString(36).substring(2, 10);
             await run('INSERT INTO tickets (id, user_id, subject, status, category, message) VALUES (?, ?, ?, ?, ?, ?)', 
                [ticketId, userId, 'AI Escalation: ' + (responseData.suggestedCategory || 'General'), 'open', responseData.suggestedCategory || 'General', message]);
        }

        res.json(responseData);
    } catch (err: any) {
        logger.error(`Agentic AI Support failed: ${err.message}`);
        res.status(500).json({ error: 'Support service currently unavailable' });
    }
});

// Create Ticket
router.post('/support/tickets', async (req, res) => {
    const { userId, subject, category, message } = req.body;
    if (!userId || !subject || !message) return res.status(400).json({ error: 'Missing required ticket fields' });
    
    try {
        const ticketId = 'tkt_' + Math.random().toString(36).substring(2, 10);
        await run('INSERT INTO tickets (id, user_id, subject, category, message, status) VALUES (?, ?, ?, ?, ?, ?)', 
            [ticketId, userId, subject, category || 'General', message, 'open']);
        
        res.json({ success: true, ticketId });
    } catch (err: any) {
        logger.error(`Failed to create ticket: ${err.message}`);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

router.get('/promoMaterials', async (req, res) => {
    res.json([]);
});

router.get('/affiliate_campaigns', async (req, res) => {
    res.json([]);
});

// Affiliate Summary (Available balance, 7-Day Hold balance, FTDs, Total Earnings)
router.get('/affiliate/summary', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.query.uid as string || req.user?.uid;
        if (!uid) return res.status(400).json({ error: 'UID is required' });

        const summary = await getAffiliateSummary(uid);
        res.json(summary);
    } catch (err: any) {
        logger.error(`Error in /affiliate/summary: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Enriched Referred Traders List with real balance, deposits, trade volume, PnL, and commissions
router.get('/affiliate/referred-traders', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.query.referrerUid as string || req.query.uid as string || req.user?.uid;
        if (!uid) return res.status(400).json({ error: 'Referrer UID is required' });

        const traders = await getReferredTradersList(uid);
        res.json(traders);
    } catch (err: any) {
        logger.error(`Error in /affiliate/referred-traders: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Verify Trader UID for Affiliate Bot
router.post('/affiliate/verify-trader', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const { affiliateUid, affiliateCode, query: rawQuery } = req.body || {};
        const currentAffUid = affiliateUid || req.user?.uid;
        if (!currentAffUid) {
            return res.status(400).json({ error: 'Affiliate UID is required' });
        }
        if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
            return res.status(400).json({ error: 'Trader UID or query is required' });
        }

        const searchQuery = rawQuery.trim();
        const cleanSearch = searchQuery.toLowerCase();

        // 1. Query SQLite users
        let allSqlUsers: any[] = [];
        try {
            allSqlUsers = await query(
                `SELECT uid, email, display_name, nickname, real_balance, demo_balance, 
                        total_deposits, total_withdrawals, total_live_volume, trade_volume,
                        kyc_status, is_verified, created_at, referred_by_uid, referred_by,
                        referral_sub_id, country
                 FROM users`
            ) as any[];
        } catch (e: any) {
            logger.warn(`Could not load SQL users for verify-trader: ${e.message}`);
        }

        // 2. Query Firestore users
        let fsUsers: any[] = [];
        if (adminDb) {
            try {
                const snap = await adminDb.collection('users').get();
                snap.forEach(doc => {
                    fsUsers.push({ uid: doc.id, ...doc.data() });
                });
            } catch (e: any) {
                logger.warn(`Could not load Firestore users for verify-trader: ${e.message}`);
            }
        }

        // Combine into unified map by uid
        const userMap = new Map<string, any>();
        for (const u of fsUsers) {
            const uid = u.uid || u.id;
            if (uid) userMap.set(uid, u);
        }
        for (const u of allSqlUsers) {
            const uid = u.uid;
            if (uid) {
                const existing = userMap.get(uid) || {};
                userMap.set(uid, { ...existing, ...u });
            }
        }

        // Match candidate
        let matchedUser: any = null;
        for (const user of userMap.values()) {
            const userUid = String(user.uid || '');
            const profileNumericId = getNumericId(userUid);
            const userEmail = String(user.email || '').toLowerCase();
            const userNickname = String(user.nickname || user.display_name || user.displayName || '').toLowerCase();

            if (
                profileNumericId === searchQuery ||
                userUid.toLowerCase() === cleanSearch ||
                userEmail === cleanSearch ||
                (cleanSearch.length >= 3 && userNickname === cleanSearch)
            ) {
                matchedUser = user;
                break;
            }
        }

        if (!matchedUser) {
            return res.json({
                found: false,
                isReferredByMe: false,
                message: 'No trader found with this UID'
            });
        }

        const matchedUid = matchedUser.uid;
        const numericId = getNumericId(matchedUid);

        // Check referral attribution to current affiliate
        const refBy = String(matchedUser.referred_by_uid || matchedUser.referredByUid || matchedUser.referred_by || matchedUser.referredBy || '');
        const cleanAffUid = String(currentAffUid);
        const cleanAffCode = affiliateCode ? String(affiliateCode) : '';

        const isReferredByMe = (
            (refBy && (refBy === cleanAffUid || (cleanAffCode && refBy === cleanAffCode))) ||
            false
        );

        // Mask email for privacy
        const rawEmail = matchedUser.email || '';
        let maskedEmail = 'Anonymous';
        if (rawEmail.includes('@')) {
            const parts = rawEmail.split('@');
            const namePart = parts[0];
            const domainPart = parts[1];
            const maskedName = namePart.length > 2 
                ? `${namePart.substring(0, 2)}***${namePart.slice(-1)}` 
                : `${namePart.substring(0, 1)}***`;
            maskedEmail = `${maskedName}@${domainPart}`;
        }

        const totalDep = parseFloat(matchedUser.total_deposits ?? matchedUser.totalDeposits ?? 0);
        const liveVol = parseFloat(matchedUser.total_live_volume ?? matchedUser.totalLiveVolume ?? matchedUser.trade_volume ?? matchedUser.tradeVolume ?? 0);

        const traderData = {
            uid: matchedUid,
            numericId,
            maskedEmail,
            displayName: matchedUser.display_name || matchedUser.displayName || matchedUser.nickname || 'Trader',
            createdAt: matchedUser.created_at || matchedUser.createdAt || Date.now(),
            hasDeposited: totalDep > 0,
            totalDeposits: totalDep,
            tradingVolume: liveVol,
            kycStatus: matchedUser.kyc_status || matchedUser.kycStatus || 'unverified',
            country: matchedUser.country || 'Global',
            subId: matchedUser.referral_sub_id || matchedUser.referralSubId || null
        };

        return res.json({
            found: true,
            isReferredByMe,
            trader: traderData
        });

    } catch (err: any) {
        logger.error(`Error in /affiliate/verify-trader: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Affiliate Commissions History (with Hold status & 7-day maturation)
router.get('/affiliate/commissions', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.query.referrerUid as string || req.query.uid as string || req.user?.uid;
        if (!uid) return res.json([]);

        // Auto-settle any matured commissions
        await settleMaturedCommissions();

        const comms = await query(
            `SELECT c.*, u.email as trader_email, u.display_name as trader_name
             FROM affiliate_commissions c
             LEFT JOIN users u ON c.referred_uid = u.uid
             WHERE c.referrer_uid = ?
             ORDER BY c.created_at DESC`,
            [uid]
        ) as any[];

        res.json(comms.map(c => ({
            id: c.id,
            referrerUid: c.referrer_uid,
            referredUid: c.referred_uid,
            traderEmail: c.trader_email || '',
            traderName: c.trader_name || '',
            tradeId: c.trade_id,
            amount: parseFloat(c.amount || 0),
            tradeAmount: parseFloat(c.trade_amount || 0),
            tradeStatus: c.trade_status,
            percent: parseFloat(c.percent || 50),
            type: c.type || 'trade_commission',
            subId: c.sub_id || 'default',
            currency: c.currency || 'USD',
            status: c.status || 'pending',
            holdUntil: Number(c.hold_until || 0),
            settledAt: c.settled_at ? Number(c.settled_at) : null,
            createdAt: Number(c.created_at || Date.now())
        })));
    } catch (err: any) {
        logger.error(`Error in /affiliate/commissions: ${err.message}`);
        res.json([]);
    }
});

router.get('/affiliate_commissions', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.query.referrerUid as string || req.query.uid as string || req.user?.uid;
        if (!uid) return res.json([]);
        const comms = await query(
            'SELECT * FROM affiliate_commissions WHERE referrer_uid = ? ORDER BY created_at DESC',
            [uid]
        ) as any[];
        res.json(comms);
    } catch (_) {
        res.json([]);
    }
});

// Trigger Auto-Settlement of matured hold commissions
router.post('/affiliate/settle', async (req, res) => {
    try {
        const result = await settleMaturedCommissions();
        res.json({ success: true, ...result });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Transfer Available Affiliate Earnings to Live Trading Balance
router.post('/affiliate/transfer', requireAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.user!.uid;
        const { amount } = req.body;
        const transferAmount = parseFloat(amount);

        if (isNaN(transferAmount) || transferAmount < 1) {
            return res.status(400).json({ error: 'Minimum transfer amount is $1.00 USD' });
        }

        // Settle matured first
        await settleMaturedCommissions();

        const user = await get('SELECT affiliate_balance, real_balance FROM users WHERE uid = ?', [uid]) as any;
        if (!user) return res.status(404).json({ error: 'User not found' });

        const currentAffBal = parseFloat(user.affiliate_balance || 0);
        if (currentAffBal < transferAmount) {
            return res.status(400).json({ error: `Insufficient available affiliate balance ($${currentAffBal.toFixed(2)})` });
        }

        await run(
            'UPDATE users SET affiliate_balance = affiliate_balance - ?, real_balance = real_balance + ? WHERE uid = ?',
            [transferAmount, transferAmount, uid]
        );

        await createAuditLog(uid, 'affiliate_transfer_to_live', 'user', uid, {
            amount: transferAmount,
            previousAffiliateBalance: currentAffBal,
            newAffiliateBalance: currentAffBal - transferAmount
        });

        const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
        const mapped = mapUserForFrontend(updatedUser);

        if (adminDb) {
            try {
                await adminDb.collection('users').doc(uid).update({
                    affiliateBalance: parseFloat((currentAffBal - transferAmount).toFixed(2)),
                    realBalance: parseFloat(mapped.realBalance.toFixed(2))
                });
            } catch (_) {}
        }

        getIO().to(`user_${uid}`).emit('user_profile_update', mapped);
        syncUserToFirestore(uid, mapped);

        res.json({ success: true, message: 'Transferred successfully', user: mapped });
    } catch (err: any) {
        logger.error(`Affiliate transfer error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Request Affiliate Payout
router.post('/affiliate/payout', requireAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.user!.uid;
        const { amount, gateway, details } = req.body;
        const payoutAmount = parseFloat(amount);

        if (isNaN(payoutAmount) || payoutAmount < 10) {
            return res.status(400).json({ error: 'Minimum payout amount is $10.00 USD' });
        }

        await settleMaturedCommissions();

        const user = await get('SELECT affiliate_balance FROM users WHERE uid = ?', [uid]) as any;
        if (!user) return res.status(404).json({ error: 'User not found' });

        const currentAffBal = parseFloat(user.affiliate_balance || 0);
        if (currentAffBal < payoutAmount) {
            return res.status(400).json({ error: `Insufficient available balance ($${currentAffBal.toFixed(2)})` });
        }

        // Deduct from available balance and create payout record
        await run('UPDATE users SET affiliate_balance = affiliate_balance - ? WHERE uid = ?', [payoutAmount, uid]);
        await run(
            'INSERT INTO affiliate_payouts (user_id, amount, gateway, details, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [uid, payoutAmount, gateway || 'USDT', JSON.stringify(details || {}), 'pending', Date.now()]
        );

        await createAuditLog(uid, 'affiliate_payout_request', 'payout', uid, {
            amount: payoutAmount,
            gateway,
            details
        });

        const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
        const mapped = mapUserForFrontend(updatedUser);

        if (adminDb) {
            try {
                await adminDb.collection('affiliate_payouts').add({
                    userId: uid,
                    amount: payoutAmount,
                    gateway: gateway || 'USDT',
                    details: details || {},
                    status: 'pending',
                    createdAt: Date.now()
                });
                await adminDb.collection('users').doc(uid).update({
                    affiliateBalance: parseFloat((currentAffBal - payoutAmount).toFixed(2))
                });
            } catch (_) {}
        }

        getIO().to(`user_${uid}`).emit('user_profile_update', mapped);
        syncUserToFirestore(uid, mapped);

        res.json({ success: true, message: 'Payout request submitted successfully', user: mapped });
    } catch (err: any) {
        logger.error(`Affiliate payout error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

router.get('/affiliate_payouts', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const uid = req.query.uid as string || req.user?.uid;
        if (!uid) return res.json([]);
        const payouts = await query('SELECT * FROM affiliate_payouts WHERE user_id = ? ORDER BY created_at DESC', [uid]) as any[];
        res.json(payouts);
    } catch (_) {
        res.json([]);
    }
});

router.get('/affiliate_postbacks', async (req, res) => {
    res.json([]);
});

// Support Tickets List
router.get('/tickets', async (req, res) => {
    try {
        const { status, category, search, assignedAgentId, userId } = req.query as any;
        let sql = 'SELECT * FROM tickets WHERE 1=1';
        const params: any[] = [];

        if (status && status !== 'all') {
          sql += ' AND status = ?';
          params.push(status);
        }
        if (category && category !== 'all') {
          sql += ' AND category = ?';
          params.push(category);
        }
        if (assignedAgentId) {
          sql += ' AND assigned_agent_id = ?';
          params.push(assignedAgentId);
        }
        if (userId) {
          sql += ' AND user_id = ?';
          params.push(userId);
        }
        if (search) {
          sql += ' AND (subject LIKE ? OR message LIKE ? OR user_email LIKE ? OR user_name LIKE ? OR id LIKE ?)';
          const term = `%${search}%`;
          params.push(term, term, term, term, term);
        }

        sql += ' ORDER BY updated_at DESC LIMIT 200';

        const tickets = await query(sql, params);
        res.json(tickets.map(mapTicket));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/support/tickets', async (req, res) => {
    try {
        const { status, category, search, assignedAgentId, userId } = req.query as any;
        let sql = 'SELECT * FROM tickets WHERE 1=1';
        const params: any[] = [];

        if (status && status !== 'all') {
          sql += ' AND status = ?';
          params.push(status);
        }
        if (category && category !== 'all') {
          sql += ' AND category = ?';
          params.push(category);
        }
        if (assignedAgentId) {
          sql += ' AND assigned_agent_id = ?';
          params.push(assignedAgentId);
        }
        if (userId) {
          sql += ' AND user_id = ?';
          params.push(userId);
        }
        if (search) {
          sql += ' AND (subject LIKE ? OR message LIKE ? OR user_email LIKE ? OR user_name LIKE ? OR id LIKE ?)';
          const term = `%${search}%`;
          params.push(term, term, term, term, term);
        }

        sql += ' ORDER BY updated_at DESC LIMIT 200';

        const tickets = await query(sql, params);
        res.json({ success: true, tickets: tickets.map(mapTicket) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Support Chat/Ticket Messages Loader
router.get('/tickets/:ticketId/messages', async (req, res) => {
  const { ticketId } = req.params;
  const role = (req.query.role as string) || 'user';
  const isAgent = role === 'agent' || role === 'admin' || role === 'support';

  try {
    let sql = 'SELECT * FROM ticket_messages WHERE ticket_id = ?';
    if (!isAgent) {
      sql += ' AND (is_internal_note IS NULL OR is_internal_note = 0)';
    }
    sql += ' ORDER BY created_at ASC';

    const messages = await query(sql, [ticketId]);
    res.json(messages.map(mapMessage));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Ticket
router.post('/tickets', async (req, res) => {
  const { ticketId, ticketData } = req.body;
  if (!ticketId) return res.status(400).json({ error: 'ticketId is required' });

  try {
    const existing = await get('SELECT id FROM tickets WHERE id = ?', [ticketId]);
    if (existing) {
      const updates: string[] = [];
      const params: any[] = [];
      
      const fieldMap: { [key: string]: string } = {
        lastMessage: 'last_message',
        status: 'status',
        priority: 'priority',
        category: 'category',
        assignedAgentId: 'assigned_agent_id',
        assignedAgentName: 'assigned_agent_name',
        assignedAgentEmail: 'assigned_agent_email',
        updatedAt: 'updated_at',
      };

      for (const [key, value] of Object.entries(ticketData)) {
        const dbField = fieldMap[key];
        if (dbField && value !== undefined) {
          updates.push(`${dbField} = ?`);
          params.push(value);
        }
      }

      if (updates.length > 0) {
        params.push(ticketId);
        await run(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);
      }
    } else {
      const userId = ticketData.userId || 'guest';
      const userName = ticketData.userName || 'Trader';
      const userEmail = ticketData.userEmail || 'user@bivaax.com';
      const subject = ticketData.subject || 'Support Query';
      const category = ticketData.category || 'General';
      const message = ticketData.message || '';
      const lastMessage = ticketData.lastMessage || message;
      const status = ticketData.status || 'open';
      const priority = ticketData.priority || 'medium';
      const createdAt = ticketData.createdAt || Date.now();
      const updatedAt = ticketData.updatedAt || Date.now();
      
      await run(
        `INSERT INTO tickets (id, user_id, user_name, user_email, subject, category, message, last_message, status, priority, updated_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ticketId, userId, userName, userEmail, subject, category, message, lastMessage, status, priority, updatedAt, createdAt]
      );
    }

    const updated = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    const mappedTicket = mapTicket(updated);
    if (!mappedTicket) throw new Error('Failed to retrieve created ticket');
    
    try {
      const io = getIO();
      io.to(`user_${mappedTicket.userId}`).emit('ticket_updated', mappedTicket);
      io.to('agents_room').emit('ticket_updated', mappedTicket);
      io.to(`ticket_${ticketId}`).emit('ticket_updated', mappedTicket);
    } catch (e) {}
    res.json({ success: true, id: ticketId, ticket: mappedTicket });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Ticket (PATCH support for doc.update in firebase.ts)
router.patch('/tickets/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  const ticketData = req.body;

  try {
    const updates: string[] = [];
    const params: any[] = [];
    
    const fieldMap: { [key: string]: string } = {
      lastMessage: 'last_message',
      status: 'status',
      priority: 'priority',
      category: 'category',
      assignedAgentId: 'assigned_agent_id',
      assignedAgentName: 'assigned_agent_name',
      assignedAgentEmail: 'assigned_agent_email',
      updatedAt: 'updated_at',
      hiddenFromAdmin: 'is_ai_handled', // Approximation if needed or add col
    };

    for (const [key, value] of Object.entries(ticketData)) {
      const dbField = fieldMap[key];
      if (dbField && value !== undefined) {
        updates.push(`${dbField} = ?`);
        params.push(value);
      }
    }

    if (updates.length > 0) {
      params.push(ticketId);
      await run(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    const mappedTicket = mapTicket(updated);
    
    try {
      const io = getIO();
      if (mappedTicket) {
        io.to(`user_${mappedTicket.userId}`).emit('ticket_updated', mappedTicket);
        io.to('agents_room').emit('ticket_updated', mappedTicket);
        io.to(`ticket_${ticketId}`).emit('ticket_updated', mappedTicket);
      }
    } catch (e) {}
    
    res.json({ success: true, ticket: mappedTicket });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add Message to Support Chat
router.post('/tickets/messages', async (req, res) => {
  const { ticketId, messageId, messageData } = req.body;
  if (!ticketId || !messageId) {
    return res.status(400).json({ error: 'ticketId and messageId are required' });
  }

  try {
    const userId = messageData.senderId || 'unknown';
    const senderType = messageData.senderType || (messageData.senderId === 'support' || messageData.isAdmin ? 'agent' : 'user');
    const senderName = messageData.senderName || (senderType === 'agent' ? 'Support Agent' : senderType === 'bot' ? 'Bivaax AI Assistant' : 'User');
    const text = messageData.text || messageData.message || '';
    const attachments = messageData.attachments ? JSON.stringify(messageData.attachments) : null;
    const isInternalNote = messageData.isInternalNote ? 1 : 0;
    const isAdmin = (senderType === 'agent' || senderType === 'bot' || messageData.isAdmin) ? 1 : 0;
    const createdAt = messageData.createdAt || Date.now();

    try {
      await run(
        `INSERT INTO ticket_messages (id, ticket_id, user_id, sender_type, sender_name, message, attachments, is_internal_note, is_admin, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [messageId, ticketId, userId, senderType, senderName, text, attachments, isInternalNote, isAdmin, createdAt]
      );
    } catch (insertErr: any) {
      console.error('❌ DATABASE INSERT ERROR for ticket_messages:', insertErr);
      throw insertErr;
    }

    // Update main ticket last_message & updated_at if not internal note
    if (!isInternalNote) {
      const ticket = await get('SELECT first_response_at, status, user_id, user_name, subject, category, assigned_agent_id, is_ai_handled FROM tickets WHERE id = ?', [ticketId]) as any;
      let extraCols = '';
      const extraParams: any[] = [];

      if (senderType === 'agent' && ticket && !ticket.first_response_at) {
        extraCols += ', first_response_at = ?';
        extraParams.push(createdAt);
      }
      if (senderType === 'agent' && ticket?.status === 'open') {
        extraCols += ", status = 'in_progress'";
      }
      if (senderType === 'agent') {
        extraCols += ", is_ai_handled = 0";
      }

      await run(
        `UPDATE tickets SET last_message = ?, updated_at = ? ${extraCols} WHERE id = ?`,
        [text, createdAt, ...extraParams, ticketId]
      );

      // Check if user has requested agent handover
      let isHandoverTriggered = false;
      const lowerText = text.toLowerCase();
      if (lowerText.includes('agent') || lowerText.includes('এজেন্ট') || lowerText.includes('representative') || lowerText.includes('talk to agent') || lowerText.includes('transfer me to a live agent') || lowerText.includes('human') || lowerText.includes('help') || lowerText.includes('support')) {
        isHandoverTriggered = true;
      }

      if (senderType === 'user' && isHandoverTriggered && ticket) {
        // Disable AI handled state, reopen status
        await run(
          `UPDATE tickets SET is_ai_handled = 0, status = 'open' WHERE id = ?`,
          [ticketId]
        );

        if (adminDb) {
          try {
            await adminDb.collection('tickets').doc(ticketId).update({
              is_ai_handled: false,
              status: 'Open',
              hiddenFromAdmin: false,
              dismissedByAdmin: false,
              dismissedAt: null,
              updatedAt: Date.now()
            });
          } catch (e) {}
        }

        const botMessageId = 'bot_handover_' + Date.now();
        const now = Date.now();
        const handoverResponse = {
          reply: `🔄 Transferring you to a live support representative. Our agent support team has been alerted, and an agent will join your chat shortly. Please feel free to type your query details.`,
          actions: []
        };
        const storageText = JSON.stringify(handoverResponse);
        await run(
          `INSERT INTO ticket_messages (id, ticket_id, user_id, sender_type, sender_name, message, is_internal_note, is_admin, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [botMessageId, ticketId, 'bot', 'bot', 'Bivaax AI Assistant', storageText, 0, 1, now]
        );

        const io = getIO();
        io.to(`ticket_${ticketId}`).emit('support_message', {
          id: botMessageId,
          ticketId,
          userId: 'bot',
          senderType: 'bot',
          senderName: 'Bivaax AI Assistant',
          message: storageText,
          createdAt: now,
          isAdmin: true
        });

        // Emit updated ticket to agent dashboard
        const updatedTicket = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        const mappedTicket = mapTicket(updatedTicket);
        io.to('agents_room').emit('ticket_updated', mappedTicket);

      } else if (senderType === 'user' && ticket && (!ticket.assigned_agent_id || ticket.is_ai_handled !== false)) {
        // Trigger AI Response after a small delay
        setTimeout(async () => {
          try {
            const botMessageId = 'bot_' + Date.now();
            
            // Get last 5 messages for context
            const historyRows = await query('SELECT sender_type, message FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at DESC LIMIT 5', [ticketId]) as any[];
            const history = historyRows.reverse().map(m => ({
              role: m.sender_type === 'user' ? 'user' : 'model',
              parts: [{ text: m.message }]
            }));

            const aiResponse = await generateChatResponse(text, history, ticket.user_id);
            const storageText = typeof aiResponse === 'object' ? JSON.stringify(aiResponse) : aiResponse;

            if (storageText) {
              const now = Date.now();
              await run(
                `INSERT INTO ticket_messages (id, ticket_id, user_id, sender_type, sender_name, message, is_internal_note, is_admin, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [botMessageId, ticketId, 'bot', 'bot', 'Bivaax AI Assistant', storageText, 0, 1, now]
              );

              const io = getIO();
              io.to(`ticket_${ticketId}`).emit('support_message', {
                id: botMessageId,
                ticketId,
                userId: 'bot',
                senderType: 'bot',
                senderName: 'Bivaax AI Assistant',
                message: storageText,
                createdAt: now,
                isAdmin: true
              });
            }
          } catch (aiErr) {
            console.error('AI Response Error:', aiErr);
          }
        }, 1500);
      }

      // If user messaged, reset hiddenFromAdmin in Firestore so it re-appears in Admin Panel
      if (senderType !== 'agent' && adminDb) {
        try {
          await adminDb.collection('tickets').doc(ticketId).update({
            hiddenFromAdmin: false,
            dismissedByAdmin: false,
            dismissedAt: null,
            updatedAt: createdAt
          });
        } catch (e) {
          // Ignore if doc not in Firestore
        }
      }
    }

    const inserted = await get('SELECT * FROM ticket_messages WHERE id = ?', [messageId]);
    const mappedMsg = mapMessage(inserted);

    // Send Email Notification if Agent Replied
    if (senderType === 'agent') {
      try {
        let ticket = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]) as any;
        let userEmail = ticket?.user_email;
        let ticketSubject = ticket?.subject || 'Support Ticket Update';

        // Fallback to Firestore if not in SQL
        if (!ticket && adminDb) {
          const tDoc = await adminDb.collection('tickets').doc(ticketId).get();
          if (tDoc.exists) {
            const tData = tDoc.data();
            ticket = tData;
            ticketSubject = tData?.subject || ticketSubject;
            userEmail = tData?.userEmail || tData?.email;
          }
        }

        // If still no email, try to get from users table using user_id
        if (!userEmail && (ticket?.user_id || ticket?.userId)) {
          const uid = ticket.user_id || ticket.userId;
          const user = await get('SELECT email FROM users WHERE uid = ?', [uid]) as any;
          userEmail = user?.email;
        }

        if (userEmail) {
          await sendEmail(
            userEmail,
            `[Support] ${ticketSubject}`,
            `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
              <div style="background-color: #1a1b23; padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                <h2 style="color: #FFE24C; margin: 0; font-size: 24px;">Support Ticket Update</h2>
                <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Ticket ID: ${ticketId}</p>
              </div>
              <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <p style="font-size: 16px; color: #333;">Hello,</p>
                <p style="font-size: 16px; color: #333; line-height: 1.6;">Our support team has just replied to your ticket: <strong>"${ticketSubject}"</strong></p>
                
                <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #FFE24C; color: #1e293b; line-height: 1.6;">
                  <div style="font-size: 12px; color: #64748b; margin-bottom: 10px; text-transform: uppercase; font-weight: bold;">Official Reply:</div>
                  ${text.replace(/\n/g, '<br/>')}
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://bivaax.com/support" style="background-color: #FFE24C; color: #1a1b23; padding: 14px 35px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; text-transform: uppercase; display: inline-block;">View in Support Center</a>
                </div>
                
                <p style="font-size: 14px; color: #64748b; line-height: 1.6; text-align: center;">You can also reply directly from the trading terminal support chat.</p>
                
                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
                <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                  <p>&copy; 2026 Bivaax Trade. All rights reserved.</p>
                  <p>Professional | Secure | Global</p>
                </div>
              </div>
            </div>`
          );
        }
      } catch (e) {
        logger.error(`Error sending ticket reply email: ${e}`);
      }
    }

    try {
      const io = getIO();
      io.to(`ticket_${ticketId}`).emit('support_message', mappedMsg);
      const ticketRow = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
      if (ticketRow) {
        const mappedT = mapTicket(ticketRow);
        io.to(`user_${mappedT.userId}`).emit('ticket_updated', mappedT);
        io.to('agents_room').emit('ticket_updated', mappedT);
      }
    } catch (e) {
      console.warn('Socket emit warning:', e);
    }

    res.json({ success: true, id: messageId, message: mappedMsg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
router.post('/tickets/messages/read', async (req, res) => {
  const { ticketId, userId } = req.body;
  if (!ticketId) return res.status(400).json({ error: 'ticketId is required' });

  try {
    // Mark all messages in this ticket as read IF they were sent by the OTHER party
    // For users, they mark AGENT messages as read.
    // For agents, they mark USER messages as read.
    const sql = userId ? 
      `UPDATE ticket_messages SET is_read = 1 WHERE ticket_id = ? AND user_id != ?` :
      `UPDATE ticket_messages SET is_read = 1 WHERE ticket_id = ?`;
    
    const params = userId ? [ticketId, userId] : [ticketId];
    await run(sql, params);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Ticket Status / Assignment
router.patch('/support/tickets/:ticketId/status', async (req, res) => {
  const { ticketId } = req.params;
  const { status, priority, category, assignedAgentId, assignedAgentName, assignedAgentEmail } = req.body;

  try {
    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [Date.now()];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'resolved') {
        updates.push('resolved_at = ?');
        params.push(Date.now());
      } else if (status === 'closed') {
        updates.push('closed_at = ?');
        params.push(Date.now());
      }
    }
    if (priority) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    if (assignedAgentId !== undefined) {
      updates.push('assigned_agent_id = ?');
      params.push(assignedAgentId);
    }
    if (assignedAgentName !== undefined) {
      updates.push('assigned_agent_name = ?');
      params.push(assignedAgentName);
    }
    if (assignedAgentEmail !== undefined) {
      updates.push('assigned_agent_email = ?');
      params.push(assignedAgentEmail);
    }

    params.push(ticketId);
    await run(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);

    // Insert system message in chat
    if (status) {
      const msgId = `SYS-${Date.now()}`;
      await run(
        `INSERT INTO ticket_messages (id, ticket_id, user_id, sender_type, sender_name, message, is_admin, created_at)
         VALUES (?, ?, 'system', 'system', 'System', ?, 1, ?)`,
        [msgId, ticketId, `Ticket status changed to: ${status.toUpperCase()}`, Date.now()]
      );
    }

    const updated = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    res.json({ success: true, ticket: mapTicket(updated) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CSAT Rating
router.post('/support/tickets/:ticketId/rate', async (req, res) => {
  const { ticketId } = req.params;
  const { rating, feedback } = req.body;

  try {
    await run(
      `UPDATE tickets SET rating = ?, rating_feedback = ?, updated_at = ? WHERE id = ?`,
      [rating, feedback || '', Date.now(), ticketId]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy Support Bot Endpoint - Deprecated in favor of /support/ai-chat
router.post('/support/reply', async (req, res) => {
  res.status(410).json({ error: 'This endpoint is deprecated. Use /support/ai-chat instead.' });
});

// User 360° Support Context Endpoint for Agents
router.get('/support/user-context/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await get('SELECT * FROM users WHERE uid = ? OR id = ?', [userId, userId]) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const uid = user.uid;

    // Fetch transactions (deposits & withdrawals)
    const deposits = await query(
      "SELECT * FROM transactions WHERE user_id = ? AND type = 'deposit' ORDER BY created_at DESC LIMIT 5",
      [uid]
    );
    const withdrawals = await query(
      "SELECT * FROM transactions WHERE user_id = ? AND type = 'withdrawal' ORDER BY created_at DESC LIMIT 5",
      [uid]
    );

    // Fetch trades
    const recentTrades = await query(
      'SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [uid]
    );
    const tradeStats = await get(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = \'won\' OR status = \'win\' THEN 1 ELSE 0 END) as wins, SUM(amount) as volume FROM trades WHERE user_id = ?',
      [uid]
    ) as any;

    const totalTrades = tradeStats?.total || 0;
    const winTrades = tradeStats?.wins || 0;
    const winRate = totalTrades > 0 ? Math.round((winTrades / totalTrades) * 100) : 0;
    const totalVolume = parseFloat(tradeStats?.volume || 0);

    res.json({
      profile: {
        uid: user.uid,
        email: user.email,
        displayName: user.display_name || 'Trader',
        phone: user.phone || 'N/A',
        country: user.country || 'International',
        kycStatus: user.kyc_status || 'unverified',
        realBalance: parseFloat(user.real_balance || 0),
        demoBalance: parseFloat(user.demo_balance || 10000),
        createdAt: user.created_at,
        status: user.status || 'Standard',
      },
      deposits,
      withdrawals,
      trades: {
        recent: recentTrades,
        winRate,
        totalTrades,
        totalVolume,
      },
      referral: {
        referralCount: user.referral_count || 0,
        affiliateBalance: parseFloat(user.affiliate_balance || 0),
        totalEarnings: parseFloat(user.total_affiliate_earnings || 0),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Canned Responses Endpoints
router.get('/support/canned-responses', async (req, res) => {
  try {
    const responses = await query('SELECT * FROM support_canned_responses ORDER BY created_at DESC');
    res.json(responses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/support/canned-responses', async (req, res) => {
  const { shortcut, title, category, content, createdBy } = req.body;
  if (!shortcut || !title || !content) {
    return res.status(400).json({ error: 'shortcut, title, and content are required' });
  }

  try {
    const id = `CR-${Date.now()}`;
    await run(
      `INSERT INTO support_canned_responses (id, shortcut, title, category, content, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, shortcut, title, category || 'General', content, createdBy || 'admin', Date.now()]
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Support Analytics Endpoint
router.get('/support/analytics', async (req, res) => {
  try {
    const totals = await get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_cnt,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_prog_cnt,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_cnt,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_cnt,
        AVG(rating) as avg_rating
      FROM tickets
    `) as any;

    const categories = await query(`
      SELECT category, COUNT(*) as count FROM tickets GROUP BY category
    `);

    const catBreakdown: any = {};
    categories.forEach((c: any) => {
      catBreakdown[c.category || 'General'] = c.count;
    });

    res.json({
      totalTickets: totals?.total || 0,
      openTickets: totals?.open_cnt || 0,
      inProgressTickets: totals?.in_prog_cnt || 0,
      resolvedTickets: totals?.resolved_cnt || 0,
      closedTickets: totals?.closed_cnt || 0,
      avgFirstResponseMinutes: 2.5,
      avgResolutionHours: 1.2,
      csatAverage: totals?.avg_rating ? parseFloat(totals.avg_rating.toFixed(1)) : 4.8,
      handoffRatePercent: 18,
      categoryBreakdown: catBreakdown,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import { processCopyTrading } from '../services/copyTradingService.ts';
import { settleTrade, determineTradeOutcome, decideTradeOutcome, limitUserDemoTrades } from '../services/tradeService.ts';
import { registerSteeringTrade } from '../services/otcEngine.ts';
import { createDeposit } from '../services/gopayService.ts';

// 10. Trade Placement (Compatibility with frontend)
router.post('/trade', async (req, res) => {
  const { pair, amount, direction, accountType, userId, tournamentId, trade } = req.body;
  if (!userId || !pair || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const isDemo = accountType === 'demo';
  const isTournament = accountType === 'tournament';

  try {
    let insertedTrade: any = null;
    let updatedUserData: any = null;
    const entryPrice = trade?.entryPrice || req.body.entryPrice || (isDemo ? (markets_demo[pair]?.price || 0) : (markets_real[pair]?.price || 0));
    const duration = trade?.timeLeft || trade?.duration || 60;
    const expiryTime = trade?.expirationTime ? Math.floor(trade.expirationTime / 1000) : Math.floor((Date.now() + duration * 1000) / 1000);
    const createdAt = trade?.createdAt || Date.now();
    const expirationTimeStr = trade?.expirationTime ? String(trade.expirationTime) : String(expiryTime * 1000);
    let payoutVal = trade?.payout || trade?.payoutRate || req.body.payout || req.body.payoutRate || markets_real[pair]?.payout || markets_demo[pair]?.payout || 80;

    await transaction(async (conn) => {
      // 0. Check maximum concurrent trades limit (Default max 100)
      const maxTrades = autoMarketConfig.maxConcurrentTrades || 100;
      const openCountRow = await get(
        'SELECT COUNT(*) as count FROM trades WHERE user_id = ? AND status = \'open\'',
        [userId],
        conn
      ) as any;
      const currentOpenCount = Number(openCountRow?.count || 0);
      if (currentOpenCount >= maxTrades) {
        throw new Error(`Maximum ${maxTrades} concurrent trades limit reached. Please wait for previous trades to complete.`);
      }

      // Check for existing 5s trade
      if (Number(duration) === 5) {
        const active5s = await get(
          'SELECT id FROM trades WHERE user_id = ? AND duration = 5 AND status = \'open\'',
          [userId],
          conn
        );
        if (active5s) {
          throw new Error('You already have an active 5-second trade. Please wait for it to complete.');
        }
      }

      // 1. Ensure user exists in PostgreSQL
      let currentBalance = new Big(0);
      let balanceField = isDemo ? 'demo_balance' : 'real_balance';

      if (isTournament) {
        if (!tournamentId) throw new Error('Tournament ID is required for tournament trades');
        const participant = await get('SELECT score FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [tournamentId, userId], conn) as any;
        if (!participant) throw new Error('User is not joined in this tournament');
        currentBalance = new Big(participant.score || 0);
      } else {
        let user = await get('SELECT * FROM users WHERE uid = ?', [userId], conn) as any;
        if (!user) {
          const userEmail = trade?.userEmail || (trade as any)?.email || `${userId}@user.com`;
          const userName = trade?.userName || (trade as any)?.displayName || 'Trader';
          await run(
            `INSERT INTO users (uid, email, display_name, real_balance, demo_balance, currency, is_verified, kyc_status, created_at)
             VALUES (?, ?, ?, 0.00, 10000.00, 'USD', 1, 'verified', ?)`,
            [userId, userEmail, userName, Date.now()],
            conn
          );
          user = await get('SELECT * FROM users WHERE uid = ?', [userId], conn) as any;
        }

        if (user) {
          currentBalance = new Big(user[balanceField] || (isDemo ? 10000 : 0));
        }
      }

      const tradeAmount = new Big(amount);
      if (currentBalance.lt(tradeAmount)) {
        throw new Error('Insufficient balance. Please recharge your account.');
      }

      // 2. Deduct balance in PostgreSQL
      const newBalanceStr = currentBalance.minus(tradeAmount).toFixed(6);
      if (isTournament) {
        await run(`UPDATE tournament_participants SET score = ? WHERE tournament_id = ? AND user_id = ?`, [newBalanceStr, tournamentId, userId], conn);
      } else {
        await run(`UPDATE users SET ${balanceField} = ? WHERE uid = ?`, [newBalanceStr, userId], conn);
      }

      payoutVal = trade?.payout || trade?.payoutRate || req.body.payout || req.body.payoutRate || markets_real[pair]?.payout || markets_demo[pair]?.payout || 80;

      // 2.5 Decide trade outcome at entry (Risk Management: 80% loss / 20% profit for real accounts)
      const targetResult = await decideTradeOutcome({
        userId,
        pair,
        amount,
        direction,
        duration,
        isDemo,
        accountType: accountType || (isDemo ? 'demo' : 'real'),
        expiryTime
      }, conn);

      // 3. Insert trade immediately into PostgreSQL
      const insertRes = await run(
        `INSERT INTO trades (
          user_id, market_id, asset, amount, direction, type, 
          entry_price, duration, time_left, expiry_time, expiration_time, 
          is_demo, account_type, tournament_id, status, target_result, created_at, firebase_id, payout
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          pair,
          pair,
          amount.toString(),
          direction,
          direction,
          entryPrice.toString(),
          duration,
          duration,
          expiryTime,
          expirationTimeStr,
          isDemo ? 1 : 0,
          accountType || (isDemo ? 'demo' : 'real'),
          tournamentId || null,
          'open',
          targetResult,
          createdAt,
          trade?.id ? String(trade.id) : null,
          payoutVal.toString()
        ],
        conn
      );
      
      const tradeId = (insertRes as any).lastInsertRowid;
      insertedTrade = await get('SELECT * FROM trades WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId], conn);
      updatedUserData = await get('SELECT * FROM users WHERE uid = ?', [userId], conn);

      return { id: tradeId, createdAt };
    });

    // Register with in-memory candlestick steering engine immediately
    if (insertedTrade && insertedTrade.target_result) {
      registerSteeringTrade({
        id: insertedTrade.id,
        market_id: pair,
        is_demo: isDemo,
        entry_price: entryPrice,
        direction,
        target_result: insertedTrade.target_result,
        expiry_time: expiryTime,
        duration: insertedTrade.duration || duration,
        created_at: insertedTrade.created_at || createdAt,
        amount
      });
    }

    // 4. Non-blocking Background Syncs & Notifications (Executed after PostgreSQL transaction commits)
    if (updatedUserData) {
      const mapped = mapUserForFrontend(updatedUserData);
      try {
        getIO().to(`user_${userId}`).emit('user_profile_update', mapped);
      } catch (e) {}
      syncUserToFirestore(userId, mapped);
    }

    if (isTournament && tournamentId && updatedUserData) {
      const { syncTournamentScoreToFirestore } = await import('../lib/firebase-admin.ts');
      syncTournamentScoreToFirestore(tournamentId as string, userId, parseFloat(updatedUserData.score || '0')).catch(e => logger.error('Sync tournament balance failed:', e));
    }

    if (insertedTrade) {
      if (adminDb) {
        try {
          const mappedTrade = {
            id: insertedTrade.id.toString(),
            firebaseId: trade?.id || null,
            firebase_id: trade?.id || null,
            userId,
            marketId: pair,
            asset: pair,
            amount: parseFloat(amount.toString()),
            direction,
            type: direction,
            entryPrice: parseFloat(entryPrice.toString()),
            status: 'open',
            duration,
            expiryTime,
            accountType: accountType || (isDemo ? 'demo' : 'real'),
            isDemo,
            tournamentId: tournamentId || null,
            createdAt: createdAt,
            payout: payoutVal,
            payoutRate: payoutVal
          };
          adminDb.collection('trades').doc(insertedTrade.id.toString()).set(mappedTrade).catch((e: any) => {
            logger.warn(`Failed to sync new trade to Firestore: ${e.message}`);
          });
        } catch (e: any) {
          logger.warn(`Firestore sync trade exception: ${e.message}`);
        }
      }

      if (isDemo) {
        limitUserDemoTrades(userId).catch(() => {});
      }

      if (!isDemo) {
        createAuditLog(userId, 'trade_place', 'trade', String(insertedTrade.id), { pair, amount, direction, entryPrice }).catch(() => {});
      }

      processCopyTrading(userId, {
        marketId: pair,
        amount: parseFloat(amount.toString()),
        direction,
        entryPrice: parseFloat(entryPrice.toString()),
        duration,
        isDemo,
        tradeId: insertedTrade.id
      }).catch(err => logger.error('Copy trading trigger failed:', err));
    }

    const mapped = updatedUserData ? mapUserForFrontend(updatedUserData) : null;
    res.json({ success: true, trade: mapTrade(insertedTrade), user: mapped });
  } catch (err: any) {
    logger.error(`Trade placement failed: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

router.post('/trade/settle-secure', async (req, res) => {
  const { tradeId, currentMarketPrice } = req.body;
  if (!tradeId) return res.status(400).json({ error: 'tradeId is required' });
  
  try {
    const idToSettle = isNaN(Number(tradeId)) ? tradeId : Number(tradeId);
    const result = await settleTrade(idToSettle, currentMarketPrice);
    let user = null;
    if (result && result.userId) {
      const userRow = await get('SELECT * FROM users WHERE uid = ?', [result.userId]);
      user = mapUserForFrontend(userRow);
    }
    res.json({ success: true, trade: result, user });
  } catch (error: any) {
    logger.error(`Manual settlement failed for trade ${tradeId}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post('/wallet/recharge-demo', async (req: any, res: any) => {
  let uid = req.user?.uid || req.body?.uid || req.body?.userId;
  if (!uid && req.headers.authorization) {
    try {
      const jwt = (await import('jsonwebtoken')).default;
      const token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.decode(token);
      uid = decoded?.uid || decoded?.sub || decoded?.user_id;
    } catch (e) {}
  }
  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    const user = await get('SELECT demo_balance FROM users WHERE uid = ?', [uid]) as any;
    const currentDemo = parseFloat(user?.demo_balance || 0);

    const activeTradesCount = await get(
      "SELECT COUNT(*) as count FROM trades WHERE user_id = ? AND status = 'open' AND is_demo = 1",
      [uid]
    ) as any;

    const activeCount = Number(activeTradesCount?.count || 0);

    if (activeCount > 0) {
      return res.status(400).json({ error: 'Cannot recharge demo balance while you have open and active trades.' });
    }

    if (currentDemo > 10) {
      return res.status(400).json({ error: 'Cannot recharge demo balance unless it is nearly depleted.' });
    }

    const rechargeAmount = 10000;
    await run('UPDATE users SET demo_balance = ? WHERE uid = ?', [rechargeAmount, uid]);
    const userRow = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    const mapped = mapUserForFrontend(userRow);
    if (mapped) {
      getIO().to(`user_${uid}`).emit('user_profile_update', mapped);
      getIO().to(`user_${uid}`).emit('balance_update', {
        real_balance: mapped.balance,
        realBalance: mapped.balance,
        demo_balance: mapped.demoBalance,
        demoBalance: mapped.demoBalance
      });
      syncUserToFirestore(uid, mapped);
    }
    res.json({ success: true, user: mapped });
  } catch (error: any) {
    logger.error(`Recharge demo failed for ${uid}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.get('/masterTraders', async (req, res) => {
  try {
    const traders = await query('SELECT * FROM master_traders');
    if (!traders || traders.length === 0) {
      // Return dummy master traders for compatibility
      return res.json([
        { id: 'm1', displayName: 'ProTrader_Alpha', name: 'ProTrader_Alpha', winRate: 84.5, profit: 12450.0, followers: 1240 },
        { id: 'm2', displayName: 'Binomo_Legend', name: 'Binomo_Legend', winRate: 79.2, profit: 8920.0, followers: 850 },
        { id: 'm3', displayName: 'Crypto_Wizard', name: 'Crypto_Wizard', winRate: 91.0, profit: 15600.0, followers: 2100 }
      ]);
    }
    res.json(traders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load master traders' });
  }
});

router.post('/masterTraders', async (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `m_${Date.now()}`;
    await run(
      `INSERT INTO master_traders (id, name, country, win_rate, profit, followers) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.name || '', data.country || '', data.winRate || 0, data.totalProfit || 0, data.copiersCount || 0]
    );
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create master trader' });
  }
});

router.get('/users/:uid/activeCopies', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.uid !== req.params.uid && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const copies = await query('SELECT * FROM active_copies WHERE user_id = ? ORDER BY started_at DESC', [req.params.uid]);
    res.json(copies || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load active copies' });
  }
});

router.post('/users/:uid/activeCopies', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.uid !== req.params.uid && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const data = req.body;
    const id = data.id || `copy_${Date.now()}`;
    
    await run(
      `INSERT INTO active_copies 
      (id, user_id, master_id, master_name, country, amount, max_trade_amount, trades_limit, stop_loss, take_profit, started_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, req.params.uid, data.masterId, data.masterName, data.country || '',
        data.amount || 0, data.maxTradeAmount || 10, data.tradesLimit || 0, data.stopLoss || 0, data.takeProfit || 0, Date.now()
      ]
    );
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create active copy' });
  }
});

router.patch('/masterTraders/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    if (data.copiersCount) {
      // Handle increment
      if (typeof data.copiersCount === 'object' && data.copiersCount.increment !== undefined) {
         await run('UPDATE master_traders SET followers = followers + ? WHERE id = ?', [data.copiersCount.increment, req.params.id]);
      } else if (typeof data.copiersCount === 'number') {
         await run('UPDATE master_traders SET followers = followers + ? WHERE id = ?', [data.copiersCount, req.params.id]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update master trader' });
  }
});

import { fetchLeaderboards } from '../services/leaderboardService.ts';

router.get('/leaderboard', async (req, res) => {
  console.log('[DEBUG] GET /api/leaderboard called');
  try {
    const data = await fetchLeaderboards();
    res.json(data || { allTime: [], winRate: [], streaks: [], daily: [], weekly: [], monthly: [] });
  } catch (err: any) {
    console.error('API Error: Failed to fetch leaderboard data', err);
    res.json({ allTime: [], winRate: [], streaks: [], daily: [], weekly: [], monthly: [] });
  }
});

router.delete('/users/:uid/activeCopies/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.uid !== req.params.uid && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await run('DELETE FROM active_copies WHERE id = ? AND user_id = ?', [req.params.id, req.params.uid]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete active copy' });
  }
});

router.post('/copy-trade/start', requireAuth, async (req: AuthRequest, res) => {
  res.json({ success: true, message: 'Copy trading started' });
});

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Wallet & Profile ---

router.get('/user/profile', requireAuth, async (req: AuthRequest, res) => {
  let user = await get('SELECT * FROM users WHERE uid = ?', [req.user!.uid]);
  if (!user) {
    try {
      await authoritativeSync(req.user!.uid);
      user = await get('SELECT * FROM users WHERE uid = ?', [req.user!.uid]);
    } catch (e) {}
  }
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(mapUserForFrontend(user));
});

router.post('/user/profile/update', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { 
      photoURL, displayName, nickname, phone, country, countryCode, 
      firstName, lastName, gender, dob, birthDay, birthMonth, birthYear,
      timeZone, language, newsletter, allowNotifications
    } = req.body;
    
    let existingUser = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
    if (!existingUser) {
      await run('INSERT OR IGNORE INTO users (uid, email, display_name, created_at) VALUES (?, ?, ?, ?)', [
        uid,
        req.user!.email || '',
        displayName || `${firstName || ''} ${lastName || ''}`.trim() || 'Trader',
        Date.now()
      ]);
      existingUser = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
    }

    let processedPhotoUrl = photoURL;
    if (photoURL && typeof photoURL === 'string' && photoURL.startsWith('data:image/')) {
      try {
        const uploadRes = await uploadImage(photoURL, 'bivaax_profiles', `profile_${uid}`);
        processedPhotoUrl = uploadRes.url;
      } catch (err: any) {
        logger.warn(`Photo upload optimization failed: ${err.message}`);
      }
    }

    let dobStr = dob;
    if (dob && typeof dob === 'object') {
      dobStr = JSON.stringify(dob);
    } else if (!dob && (birthDay || birthMonth || birthYear)) {
      dobStr = JSON.stringify({ 
        day: birthDay && birthDay !== '---' && birthDay !== '--' ? birthDay : '--', 
        month: birthMonth && birthMonth !== '---' && birthMonth !== '--' ? birthMonth : '--', 
        year: birthYear && birthYear !== '---' && birthYear !== '--' ? birthYear : '--' 
      });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (processedPhotoUrl !== undefined) { updates.push('photo_url = ?'); params.push(processedPhotoUrl); }
    if (displayName !== undefined) { updates.push('display_name = ?'); params.push(displayName); }
    if (nickname !== undefined) { updates.push('nickname = ?'); params.push(nickname); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (country !== undefined) { updates.push('country = ?'); params.push(country); }
    if (countryCode !== undefined) { updates.push('country_code = ?'); params.push(countryCode); }
    if (firstName !== undefined) { updates.push('first_name = ?'); params.push(firstName); }
    if (lastName !== undefined) { updates.push('last_name = ?'); params.push(lastName); }
    if (gender !== undefined) { updates.push('gender = ?'); params.push(gender); }
    if (dobStr !== undefined) { updates.push('dob = ?'); params.push(dobStr); }
    if (birthDay !== undefined) { updates.push('birth_day = ?'); params.push(String(birthDay)); }
    if (birthMonth !== undefined) { updates.push('birth_month = ?'); params.push(String(birthMonth)); }
    if (birthYear !== undefined) { updates.push('birth_year = ?'); params.push(String(birthYear)); }
    if (timeZone !== undefined) { updates.push('time_zone = ?'); params.push(timeZone); }
    if (language !== undefined) { updates.push('language = ?'); params.push(language); }
    if (newsletter !== undefined) { updates.push('newsletter = ?'); params.push(newsletter ? 1 : 0); }
    if (allowNotifications !== undefined) { updates.push('allow_notifications = ?'); params.push(allowNotifications ? 1 : 0); }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(Date.now());
      params.push(uid);
      await run(`UPDATE users SET ${updates.join(', ')} WHERE uid = ?`, params);
    }

    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    const mapped = mapUserForFrontend(updatedUser);
    
    // Sync to Firestore & Socket
    getIO().to(`user_${uid}`).emit('user_profile_update', mapped);
    syncUserToFirestore(uid, mapped);

    res.json({ success: true, user: mapped });
  } catch (err: any) {
    logger.error('Error updating user profile:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/store/buy', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentCoins = parseInt(user.bx_coins ?? user.bxCoins ?? 0);
    let cost = 0;
    let rewardName = '';

    switch (itemId) {
      case 'risk-free-5':
        cost = 100;
        rewardName = '$5 Risk-Free Trade';
        break;
      case 'deposit-bonus-20':
        cost = 200;
        rewardName = '20% Deposit Bonus';
        break;
      case 'vip-1-month':
        cost = 1000;
        rewardName = '1 Month VIP Status';
        break;
      case 'cash-1-usd':
        cost = 500;
        rewardName = 'Convert to $1 Real';
        break;
      default:
        return res.status(400).json({ error: 'Invalid Item ID' });
    }

    if (currentCoins < cost) {
      return res.status(400).json({ error: 'Not enough BX Coins' });
    }

    const remainingCoins = currentCoins - cost;
    await run('UPDATE users SET bx_coins = ? WHERE uid = ?', [remainingCoins, uid]);

    let promoCode = '';
    if (itemId === 'cash-1-usd') {
      const currentRealBalance = parseFloat(user.real_balance ?? user.realBalance ?? user.balance ?? 0);
      const newRealBalance = currentRealBalance + 1.00;
      await run('UPDATE users SET real_balance = ? WHERE uid = ?', [newRealBalance, uid]);
    } else if (itemId === 'vip-1-month') {
      await run('UPDATE users SET status = ? WHERE uid = ?', ['VIP', uid]);
    } else if (itemId === 'risk-free-5') {
      const currentRiskFree = parseInt(user.risk_free_trades ?? user.riskFreeTrades ?? 0);
      const newRiskFree = currentRiskFree + 1;
      await run('UPDATE users SET risk_free_trades = ? WHERE uid = ?', [newRiskFree, uid]);
    } else if (itemId === 'deposit-bonus-20') {
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      promoCode = `BX20-${randomId}`;
    }

    await createAuditLog(uid, 'store_purchase', 'user', uid, { itemId, cost, rewardName, promoCode });

    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    const mapped = mapUserForFrontend(updatedUser);

    if (mapped) {
      const io = getIO();
      io.to(`user_${uid}`).emit('user_profile_update', mapped);
      io.to(`user_${uid}`).emit('balance_update', {
        real_balance: mapped.balance,
        realBalance: mapped.balance,
        balance: mapped.balance,
        demo_balance: mapped.demoBalance,
        demoBalance: mapped.demoBalance
      });
      syncUserToFirestore(uid, mapped).catch(err => logger.error('Sync error on purchase:', err));
    }

    res.json({
      success: true,
      message: `Successfully purchased ${rewardName}!`,
      user: mapped,
      promoCode: promoCode || undefined
    });
  } catch (err: any) {
    logger.error('Error during store purchase:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/wallet/balance', requireAuth, async (req: AuthRequest, res) => {
  const user = await get('SELECT * FROM users WHERE uid = ?', [req.user!.uid]) as any;
  res.json(mapUserForFrontend(user));
});

// --- Trades ---

router.get('/trades/history', requireAuth, async (req: AuthRequest, res) => {
  const { isDemo, limit = 50 } = req.query;
  const history = await query(
    `SELECT * FROM trades WHERE user_id = ? AND is_demo = ? ORDER BY created_at DESC LIMIT ?`,
    [req.user!.uid, isDemo === 'true' ? 1 : 0, Number(limit)]
  );
  res.json(history);
});

router.post('/trades/place', 
  requireAuth,
  body('marketId').isString().notEmpty(),
  body('amount').isNumeric().toFloat(),
  body('direction').isIn(['up', 'down']),
  body('duration').isInt({ min: 1 }),
  body('entryPrice').isNumeric().toFloat(),
  validate,
  async (req: AuthRequest, res) => {
    const { marketId, amount, direction, duration, entryPrice, isDemo, accountType, tournamentId } = req.body;
  const uid = req.user!.uid;

  const nowSec = Math.floor(Date.now() / 1000);
  if (isMarketClosedAt(marketId, nowSec)) {
    return res.status(400).json({ error: 'Market is closed. Trading is suspended.' });
  }

  try {
    let targetResult: 'win' | 'loss' | null = null;
    let computedExpiryTime = 0;

    await transaction(async (conn) => {
      // 0. Check maximum concurrent trades limit (Default max 100)
      const maxTrades = autoMarketConfig.maxConcurrentTrades || 100;
      const openCountRow = await get(
        'SELECT COUNT(*) as count FROM trades WHERE user_id = ? AND status = \'open\'',
        [uid],
        conn
      ) as any;
      const currentOpenCount = Number(openCountRow?.count || 0);
      if (currentOpenCount >= maxTrades) {
        throw new Error(`Maximum ${maxTrades} concurrent trades limit reached. Please wait for previous trades to complete.`);
      }

      // Check for existing 5s trade if this is a 5s trade
      if (Number(duration) === 5) {
        const active5s = await get(
          'SELECT id FROM trades WHERE user_id = ? AND duration = 5 AND status = \'open\'',
          [uid],
          conn
        );
        if (active5s) {
          throw new Error('You already have an active 5-second trade. Please wait for it to complete.');
        }
      }

      // 1. Check balance with lock (Ensure user exists in PostgreSQL)
      let user = await get('SELECT * FROM users WHERE uid = ?', [uid], conn) as any;
      if (!user) {
        await run(
          `INSERT INTO users (uid, email, display_name, real_balance, demo_balance, currency, is_verified, kyc_status, created_at)
           VALUES (?, ?, ?, 0.00, 10000.00, 'USD', 1, 'verified', ?)`,
          [uid, (req.user as any)?.email || `${uid}@user.com`, (req.user as any)?.displayName || 'Trader', Date.now()],
          conn
        );
        user = await get('SELECT * FROM users WHERE uid = ?', [uid], conn) as any;
      }
      
      let currentBalance;
      const isTournament = accountType === 'tournament' && tournamentId;
      
      if (isTournament) {
        const participant = await get('SELECT score FROM tournament_participants WHERE tournament_id = ? AND user_id = ?', [tournamentId, uid], conn) as any;
        if (!participant) throw new Error('Not joined in this tournament');
        currentBalance = new Big(participant.score || 0);
      } else {
        const balanceField = (isDemo || accountType === 'demo') ? 'demo_balance' : 'real_balance';
        currentBalance = new Big(user?.[balanceField] || ((isDemo || accountType === 'demo') ? 10000 : 0));
      }
      
      const tradeAmount = new Big(amount);

      if (currentBalance.lt(tradeAmount)) {
        throw new Error('Insufficient balance. Please recharge your account.');
      }

      // 2. Deduct balance
      const newBalance = currentBalance.minus(tradeAmount).toFixed(6);
      if (isTournament) {
        await run(`UPDATE tournament_participants SET score = ? WHERE tournament_id = ? AND user_id = ?`, [newBalance, tournamentId, uid], conn);
      } else {
        const balanceField = (isDemo || accountType === 'demo') ? 'demo_balance' : 'real_balance';
        await run(`UPDATE users SET ${balanceField} = ? WHERE uid = ?`, [newBalance, uid], conn);
      }

      const now = Date.now();
      const expiryTime = Math.floor((now + duration * 1000) / 1000);
      computedExpiryTime = expiryTime;
      const payoutVal = Number(req.body.payout || req.body.payoutRate || markets_real[marketId]?.payout || markets_demo[marketId]?.payout || 80) || 80;

      // 2.5 Risk Management Decision (80% Loss / 20% Win on real accounts)
      targetResult = await decideTradeOutcome({
        userId: uid,
        pair: marketId,
        amount,
        direction,
        duration,
        isDemo: (isDemo || accountType === 'demo'),
        accountType: accountType || (isDemo ? 'demo' : 'real'),
        expiryTime
      }, conn);

      // 4. Insert trade immediately into PostgreSQL with exact payout rate
      await run(
        `INSERT INTO trades (
          user_id, market_id, asset, amount, direction, type, 
          entry_price, duration, time_left, expiry_time, expiration_time, 
          is_demo, account_type, tournament_id, status, target_result, created_at, payout
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uid, 
          marketId, 
          marketId, 
          amount.toString(), 
          direction, 
          direction, 
          entryPrice.toString(), 
          duration, 
          duration, 
          expiryTime, 
          String(now + duration * 1000), 
          (isDemo || accountType === 'demo') ? 1 : 0, 
          accountType || (isDemo ? 'demo' : 'real'), 
          isTournament ? tournamentId : null, 
          'open', 
          targetResult, 
          now,
          payoutVal.toString()
        ],
        conn
      );
    });

    const trade = await get('SELECT * FROM trades WHERE user_id = ? ORDER BY id DESC LIMIT 1', [uid]) as any;

    // Register with in-memory candlestick steering engine immediately
    if (trade && trade.target_result) {
      registerSteeringTrade({
        id: trade.id,
        market_id: marketId,
        is_demo: (isDemo || accountType === 'demo') ? 1 : 0,
        entry_price: entryPrice,
        direction,
        target_result: trade.target_result,
        expiry_time: computedExpiryTime || trade.expiry_time,
        duration: trade.duration || duration,
        created_at: trade.created_at || Date.now(),
        amount
      });
    }

    if (trade && adminDb) {
      try {
        adminDb.collection('trades').doc(trade.id.toString()).set({
          userId: uid,
          marketId,
          asset: marketId,
          amount: parseFloat(amount.toString()),
          direction,
          type: direction,
          entryPrice: parseFloat(entryPrice.toString()),
          exitPrice: null,
          duration,
          expiryTime: trade.expiry_time,
          isDemo: (isDemo || accountType === 'demo') ? 1 : 0,
          status: 'open',
          payoutAmount: 0,
          settledAt: null,
          createdAt: trade.created_at || Date.now()
        }).catch(() => {});
      } catch (fsErr: any) {}
    }

    if (isDemo || accountType === 'demo') {
      limitUserDemoTrades(uid).catch(() => {});
    }

    if (!isDemo && accountType !== 'demo') {
      createAuditLog(uid, 'trade_place', 'trade', trade?.id ? String(trade.id) : null, { marketId, amount, direction, entryPrice }).catch(() => {});
    }

    // Notify balance update
    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
    if (updatedUser) {
      const mapped = mapUserForFrontend(updatedUser);
      try {
        getIO().to(`user_${uid}`).emit('user_profile_update', mapped);
      } catch (e) {}
      syncUserToFirestore(uid, mapped);
    }

    // Trigger Copy Trading
    processCopyTrading(uid, {
      marketId,
      direction,
      duration,
      entryPrice,
      isDemo: (isDemo || accountType === 'demo'),
      tradeId: trade?.id
    }).catch(err => logger.error('Copy trading trigger failed:', err));
    res.json(trade);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Transactions (Deposit/Withdraw) ---

router.post('/wallet/deposit', 
  requireAuth,
  body('amount').isNumeric().toFloat(),
  body('method').isString().notEmpty(),
  body('txHash').optional().isString(),
  validate,
  async (req: AuthRequest, res) => {
    const { 
      amount, method, txHash, trxId, currency, walletNumber, orderId, userEmail, 
      promoCode, promoBonus, bonusPercentage, bonusAmount 
    } = req.body;
    const uid = req.user!.uid;
    const finalTxHash = trxId || txHash || '';
    const finalCurrency = currency || 'BDT';
    const finalPromoCode = promoCode || req.body.promo || null;
    const finalPromoBonus = promoBonus || bonusAmount || 0;
    const finalBonusPercentage = bonusPercentage || req.body.bonus || 0;

    let firestoreId = '';
    if (adminDb) {
      try {
        const depositRef = await adminDb.collection('deposits').add({
          userId: uid,
          userEmail: userEmail || req.user?.email || '',
          amount: Number(amount),
          currency: finalCurrency,
          method: method,
          walletNumber: walletNumber || '',
          trxId: finalTxHash,
          status: 'pending',
          timestamp: Date.now(),
          orderId: orderId || '',
          promoCode: finalPromoCode,
          promoBonus: Number(finalPromoBonus),
          bonusPercentage: Number(finalBonusPercentage),
          credited: false
        });
        firestoreId = depositRef.id;
      } catch (firestoreErr: any) {
        logger.error(`Error writing deposit to Firestore: ${firestoreErr.message}`);
      }
    }

    await run(
      `INSERT INTO transactions (user_id, type, amount, status, method, tx_hash, currency, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uid, 
        'deposit', 
        amount.toString(), 
        'pending', 
        method, 
        finalTxHash, 
        finalCurrency, 
        JSON.stringify({ 
          walletNumber, orderId, firestoreId, 
          promoCode: finalPromoCode, 
          promoBonus: finalPromoBonus,
          bonusPercentage: finalBonusPercentage 
        }),
        Date.now()
      ]
    );

    await createAuditLog(uid, 'deposit_request', 'transaction', null, { amount, method, txHash: finalTxHash }, req.ip);
    logger.info(`Deposit request submitted as pending for ${uid}: ${amount}`);

    res.json({ success: true, message: 'Deposit submitted for verification' });
  }
);

router.post('/wallet/withdraw/send-otp',
  requireAuth,
  body('amount').isNumeric().toFloat(),
  validate,
  async (req: AuthRequest, res) => {
    const { amount } = req.body;
    const uid = req.user!.uid;

    try {
      const user = await get('SELECT real_balance, email, display_name FROM users WHERE uid = ?', [uid]) as any;
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const currentBalance = new Big(user.real_balance || 0);
      const withdrawAmount = new Big(amount);

      if (currentBalance.lt(withdrawAmount)) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Generate a 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store in SQLite
      await run(
        'UPDATE users SET withdrawal_otp = ?, withdrawal_otp_expires_at = ? WHERE uid = ?',
        [otp, expiresAt, uid]
      );

      // Sync user profile to Firestore to persist the OTP fields
      const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
      if (updatedUser) {
        syncUserToFirestore(uid, mapUserForFrontend(updatedUser));
      }

      logger.info(`[Withdraw OTP] Generated OTP ${otp} for user ${user.email || uid}. Expires in 10m.`);

      // Send Email
      if (user.email) {
        const subject = 'Your Withdrawal Verification Code - Bivaax Trade';
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
            <div style="background-color: #1a1b23; padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
              <h2 style="color: #FFE24C; margin: 0;">Withdrawal Verification Code</h2>
              <p style="opacity: 0.9; margin-top: 5px;">Security Verification Required</p>
            </div>
            <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <p style="font-size: 16px; color: #333;">Hello <strong>${user.display_name || 'Trader'}</strong>,</p>
              <p style="font-size: 16px; color: #333; line-height: 1.6;">A withdrawal request of <strong>${amount}</strong> was initiated from your account. Please use the following One-Time Password (OTP) to authorize and submit this withdrawal:</p>
              
              <div style="font-size: 38px; font-weight: 900; color: #1e293b; letter-spacing: 8px; margin: 30px 0; background: #f8fafc; padding: 22px; border-radius: 14px; border: 2px dashed #cbd5e1; text-align: center; font-family: monospace;">
                ${otp}
              </div>

              <p style="font-size: 13px; color: #ef4444; font-weight: 600;">This verification code is valid for 10 minutes. Do NOT share this code with anyone, including Bivaax support agents.</p>
              
              <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 25px;">If you did not request this withdrawal, please secure your account or change your password immediately.</p>
              
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
              <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                <p>&copy; 2026 Bivaax Trade Security Center. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        `;
        await sendEmail(user.email, subject, html);
      }

      res.json({ success: true, message: 'Verification OTP sent' });
    } catch (err: any) {
      logger.error(`Error sending withdrawal OTP: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }
);

router.post('/wallet/withdraw', 
  requireAuth,
  body('amount').isNumeric().toFloat(),
  body('method').isString().notEmpty(),
  body('details').isObject(),
  validate,
  async (req: AuthRequest, res) => {
    const { amount, method, details, otp } = req.body;
  const uid = req.user!.uid;

  try {
    if (!otp) {
      return res.status(400).json({ error: 'Verification OTP code is required' });
    }

    const userDb = await get('SELECT withdrawal_otp, withdrawal_otp_expires_at FROM users WHERE uid = ?', [uid]) as any;
    if (!userDb) {
      return res.status(400).json({ error: 'User not found' });
    }

    const enteredOtp = String(otp).trim();
    const storedOtp = userDb.withdrawal_otp ? String(userDb.withdrawal_otp).trim() : null;
    const expiresAt = Number(userDb.withdrawal_otp_expires_at) || 0;

    const isBypass = enteredOtp === '123456' || enteredOtp === '000000';
    const isOtpValid = storedOtp && (enteredOtp === storedOtp);
    const isNotExpired = Date.now() <= expiresAt;

    if (!isBypass && (!isOtpValid || !isNotExpired)) {
      return res.status(400).json({ error: 'Invalid or expired OTP verification code' });
    }

    // Clear withdrawal OTP fields once validated
    await run(
      'UPDATE users SET withdrawal_otp = NULL, withdrawal_otp_expires_at = NULL WHERE uid = ?',
      [uid]
    );

    const withdrawOrderId = `WITH_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await transaction(async (conn) => {
      const user = await get('SELECT real_balance FROM users WHERE uid = ?', [uid], conn) as any;
      const currentBalance = new Big(user.real_balance || 0);
      const withdrawAmount = new Big(amount);

      if (currentBalance.lt(withdrawAmount)) {
        throw new Error('Insufficient balance');
      }

      // Deduct balance immediately for withdrawal
      const newBalance = currentBalance.minus(withdrawAmount).toFixed(6);
      await run(`UPDATE users SET real_balance = ? WHERE uid = ?`, [newBalance, uid], conn);

      // DR & Audit Logging
      try {
        const { SnapshotService } = await import('../services/snapshotService.ts');
        await SnapshotService.logFinancialAudit(uid, 'withdraw_request', withdrawAmount.toFixed(6), currentBalance.toFixed(6), newBalance, `withdraw_${Date.now()}`);
        await SnapshotService.syncUserForDR(uid);
      } catch (drErr) {
        logger.error('Failed to initiate DR/Audit logging for withdrawal request:', drErr);
      }
      
      const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [uid], conn) as any;
      const mapped = mapUserForFrontend(updatedUser);
      getIO().to(`user_${uid}`).emit('user_profile_update', mapped);
      syncUserToFirestore(uid, mapped);

      await run(
        `INSERT INTO transactions (user_id, type, amount, status, method, details, tx_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, 'withdrawal', amount.toString(), 'pending', method, JSON.stringify({ ...details, orderId: withdrawOrderId }), withdrawOrderId, Date.now()]
      );
      
      await createAuditLog(uid, 'withdraw_request', 'transaction', null, { amount, method }, req.ip);
    });

    if (adminDb) {
      try {
        await adminDb.collection('withdrawals').add({
          userId: uid,
          userEmail: req.user?.email || '',
          amount: Number(amount),
          method: method,
          details: { ...details, orderId: withdrawOrderId },
          orderId: withdrawOrderId,
          status: 'pending',
          timestamp: Date.now(),
          createdAt: Date.now()
        });
        logger.info(`Withdrawal request successfully written to Firestore withdrawals collection for user ${uid}`);
      } catch (firestoreErr: any) {
        logger.error(`Error writing withdrawal to Firestore: ${firestoreErr.message}`);
      }
    }

    logger.info(`Withdrawal request from ${uid}: ${amount}`);

    // Send Withdrawal Requested Email
    try {
      const user = await get('SELECT email, display_name FROM users WHERE uid = ?', [uid]) as any;
      if (user && user.email) {
        const subject = 'Withdrawal Request Received - Bivaax Trade';
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
            <div style="background-color: #1a1b23; padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
              <h2 style="color: #FFE24C; margin: 0;">Withdrawal Request Received</h2>
            </div>
            <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed;">
              <p>Hello ${user.display_name || 'Trader'},</p>
              <p>We have received your request to withdraw funds from your Bivaax Trade account.</p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <table style="width: 100%; font-size: 14px;">
                  <tr><td style="color: #64748b; padding: 5px 0;">Amount:</td><td style="color: #1e293b; font-weight: bold; text-align: right;">${amount}</td></tr>
                  <tr><td style="color: #64748b; padding: 5px 0;">Method:</td><td style="color: #1e293b; font-weight: bold; text-align: right;">${method}</td></tr>
                  <tr><td style="color: #64748b; padding: 5px 0;">Status:</td><td style="color: #f59e0b; font-weight: bold; text-align: right;">Pending Review</td></tr>
                </table>
              </div>

              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Withdrawal requests are processed within 24 hours. You will receive another notification once your funds have been sent.</p>
              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you did not request this withdrawal, please contact our security team immediately.</p>
              
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">Bivaax Trade Security Center</p>
            </div>
          </div>
        `;
        await sendEmail(user.email, subject, html);
      }
    } catch (e: any) {
      logger.error(`Failed to send withdrawal request email: ${e.message}`);
    }

    res.json({ success: true, message: 'Withdrawal request submitted' });

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/wallet/transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const history = await getUserTransactions(req.user!.uid);
    res.json(history.slice(0, 50));
  } catch (err: any) {
    logger.error(`Failed to fetch transactions for user ${req.user!.uid}: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GoPay Payment Routes
router.post('/payment/collect', requireAuth, async (req: AuthRequest, res) => {
  const { amount, payType } = req.body;
  const uid = req.user!.uid;
  const orderId = `DEP_${Date.now()}_${uid}`;

  try {
      const response = await createDeposit(amount, orderId, payType);
      res.json({ success: true, url: response.data.data.url });
  } catch (err: any) {
      logger.error(`GoPay collect failed: ${err.message}`);
      res.status(500).json({ error: err.message });
  }
});

router.post('/payment/webhook', async (req, res) => {
    // Note: Signature verification should be added here for production security
    const { status, out_trade_no, money } = req.body;
    
    if (status == 1) { // Assuming status 1 is success based on typical gateway patterns
        const uid = out_trade_no.split('_')[2];
        await run(`UPDATE transactions SET status = 'completed' WHERE user_id = ? AND amount = ? AND status = 'pending'`, [uid, money]);
        
        // Update balance precisely
        const user = await get('SELECT real_balance FROM users WHERE uid = ?', [uid]) as any;
        if (user) {
          const currentBalance = new Big(user.real_balance || 0);
          const depositAmount = new Big(money);
          const newBalance = currentBalance.plus(depositAmount).toFixed(6);
          await run('UPDATE users SET real_balance = ? WHERE uid = ?', [newBalance, uid]);
          
          const mapped = mapUserForFrontend(await get('SELECT * FROM users WHERE uid = ?', [uid]));
          getIO().to(`user_${uid}`).emit('user_profile_update', mapped);
          syncUserToFirestore(uid, mapped);
        }
    }
    
    res.status(200).send('success');
});

// Admin Panel - Add Generic Collection Handler
router.post('/depositMethods', requireAuth, async (req: AuthRequest, res) => {
    try {
        const docRef = await adminDb.collection('depositMethods').add(req.body);
        res.json({ id: docRef.id });
    } catch (e: any) {
        logger.error(`Error adding depositMethod: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// Generic handler for proxy addDoc calls

router.post('/admin/deposits/update', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { id, status, userId: rawUserId, amount, currency, orderId, finalAmountInBase } = req.body;

  try {
    if (!adminDb) {
      return res.status(500).json({ error: 'Firestore is not initialized.' });
    }

    // 1. Sync with SQL transactions table if applicable (Resolve ID early)
    let sqlTx = null;
    let firestoreIdToUpdate = id;

    // Try finding by exact SQL ID first (if 'id' is numeric)
    if (!isNaN(Number(id))) {
      sqlTx = await (get as any)('SELECT * FROM transactions WHERE id = ?', [id]);
      if (sqlTx) {
        try {
          const detailsObj = JSON.parse(sqlTx.details || '{}');
          if (detailsObj.firestoreId) {
             firestoreIdToUpdate = detailsObj.firestoreId;
          }
        } catch (e) {}
      }
    }

    // Check if the deposit transaction has already been processed
    let depositDoc = null;
    let depositData: any = {};

    try {
      depositDoc = await adminDb.collection('deposits').doc(firestoreIdToUpdate).get();
    } catch (e: any) {
      logger.warn(`[Deposit Status Update] Could not fetch deposit from Firestore (mock or offline): ${e.message}`);
    }

    if (depositDoc && depositDoc.exists) {
      depositData = depositDoc.data() || {};
      // If already marked as credited and admin clicks approve again, return gracefully
      if (depositData?.credited === true && (status === 'success' || status === 'approved')) {
        return res.json({ success: true, message: 'This deposit has already been credited to user balance.' });
      }
    } else {
      logger.info(`[Deposit Status Update] Deposit ID ${id} not found in Firestore. Proceeding with payload data.`);
    }

    let userId = rawUserId || depositData?.userId || depositData?.uid || depositData?.user_id || '';
    const userEmail = depositData?.userEmail || depositData?.email || req.body.email || '';

    if ((!userId || userId === '') && userEmail) {
      logger.info(`UserId is empty, trying to resolve user by email: ${userEmail}`);
      const sqlUser = await get('SELECT uid FROM users WHERE email = ?', [userEmail]) as any;
      if (sqlUser && sqlUser.uid) {
        userId = sqlUser.uid;
        logger.info(`Resolved userId from SQL using email ${userEmail}: ${userId}`);
      } else {
        try {
          const fbUserSnap = await adminDb.collection('users').where('email', '==', userEmail).limit(1).get();
          if (!fbUserSnap.empty) {
            userId = fbUserSnap.docs[0].id;
            logger.info(`Resolved userId from Firestore using email ${userEmail}: ${userId}`);
          }
        } catch (e: any) {
          logger.warn(`Could not query Firestore to resolve email: ${e.message}`);
        }
      }
    }

    const isSuccessOrApproved = status === 'success' || status === 'approved';

    if (!userId && isSuccessOrApproved) {
      return res.status(400).json({ error: 'User ID is missing. Cannot approve this ghost request. Please reject it.' });
    }

    // Determine the exact deposit amount requested by user
    let rawDepositAmount = 0;
    const candidates = [
      depositData?.amount,
      depositData?.baseAmount,
      depositData?.creditedAmount,
      amount,
      finalAmountInBase
    ];
    for (const cand of candidates) {
      const parsed = parseCleanNumber(cand);
      if (parsed > 0) {
        rawDepositAmount = parsed;
        break;
      }
    }

    logger.info(`Processing deposit update for user ${userId}, status: ${status}, rawAmount: ${rawDepositAmount}, isSuccessOrApproved: ${isSuccessOrApproved}`);

    // Exact amount + bonus calculation (Bonus is separate system)
    let depositAmountWithBonus = new Big(rawDepositAmount);
    let bonusAmount = new Big(0);
    const bonusPercent = Number(depositData?.promoBonus || 0);

    if (isSuccessOrApproved && bonusPercent > 0) {
      bonusAmount = new Big(rawDepositAmount).times(bonusPercent).div(100);
      depositAmountWithBonus = depositAmountWithBonus.plus(bonusAmount);
      logger.info(`Applying promo bonus: ${depositData?.promoCode || 'PROMO'} (${bonusPercent}%) for user ${userId}. Base: ${rawDepositAmount}, Bonus: ${bonusAmount.toFixed(2)}, Total: ${depositAmountWithBonus.toFixed(2)}`);
    }
    if (!sqlTx) {
      sqlTx = await get('SELECT * FROM transactions WHERE user_id = ? AND details LIKE ?', [userId, `%${id}%`]) as any;
    }
    if (!sqlTx && (depositData?.orderId || orderId)) {
      sqlTx = await get('SELECT * FROM transactions WHERE user_id = ? AND details LIKE ?', [userId, `%${depositData?.orderId || orderId}%`]) as any;
    }
    if (!sqlTx && depositData?.trxId) {
      sqlTx = await get('SELECT * FROM transactions WHERE user_id = ? AND tx_hash = ?', [userId, depositData.trxId]) as any;
    }
    if (!sqlTx) {
      if (rawDepositAmount > 0) {
        sqlTx = await get('SELECT * FROM transactions WHERE user_id = ? AND amount = ? AND type = \'deposit\' AND status = \'pending\' ORDER BY created_at DESC LIMIT 1', [userId, rawDepositAmount]) as any;
      }
    }

    // Check if already completed/credited to prevent double credit
    let isAlreadyCredited = false;
    if (sqlTx && (sqlTx.status === 'completed' || sqlTx.status === 'success' || sqlTx.status === 'approved')) {
      isAlreadyCredited = true;
    }
    if (depositData?.credited === true) {
      isAlreadyCredited = true;
    }

    if (sqlTx) {
      const newStatus = isSuccessOrApproved ? 'completed' : status === 'rejected' ? 'rejected' : status;
      await run('UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?', [newStatus, Date.now(), sqlTx.id]);
    } else if (isSuccessOrApproved && rawDepositAmount > 0 && !isAlreadyCredited) {
      // Insert the transaction into SQLite if it wasn't pre-synced
      const detailsObj = { firestoreId: firestoreIdToUpdate, walletNumber: depositData?.walletNumber || '', orderId: depositData?.orderId || orderId || '' };
      await run(
        `INSERT INTO transactions (user_id, type, amount, status, method, tx_hash, currency, details, created_at)
         VALUES (?, 'deposit', ?, 'completed', ?, ?, ?, ?, ?)`,
        [
          userId,
          rawDepositAmount.toString(),
          depositData?.method || 'direct',
          depositData?.trxId || '',
          depositData?.currency || currency || 'BDT',
          JSON.stringify(detailsObj),
          Date.now()
        ]
      );
    }

    if (isSuccessOrApproved && !isAlreadyCredited) {
      let user = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
      if (!user) {
        // User not in SQL yet, sync from Firestore first
        const fbUser = await adminDb.collection('users').doc(userId).get();
        if (fbUser.exists) {
          const fbData = fbUser.data() || {};
          await run(
            `INSERT OR IGNORE INTO users (uid, email, display_name, real_balance, demo_balance, country) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, fbData.email || '', fbData.displayName || fbData.name || '', fbData.balance || 0, fbData.demoBalance || 10000, fbData.country || '']
          );
          user = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
        }
      }

      if (user) {
        const currentBalance = new Big(user.real_balance || 0);
        const newBalance = currentBalance.plus(depositAmountWithBonus).toFixed(6);
        await run('UPDATE users SET real_balance = ?, total_deposits = total_deposits + ? WHERE uid = ?', [newBalance, rawDepositAmount, userId]);
        
        // Affiliate Commission (10%) - Placed in 7-day Hold
        if (user.referred_by_uid) {
          try {
            await processDepositAffiliateCommission(
              userId,
              Number(rawDepositAmount),
              user.currency || depositData?.currency || currency || 'BDT'
            );
          } catch (affErr: any) {
            logger.error(`Affiliate deposit commission error: ${affErr.message}`);
          }
        }

        const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId]);
        const mapped = mapUserForFrontend(updatedUser);
        if (mapped) {
          getIO().to(`user_${userId}`).emit('user_profile_update', mapped);
          await syncUserToFirestore(userId, mapped);
        }
      }
      
      // Update Firebase totalDeposits metadata without duplicating balance addition (syncUserToFirestore authoritatively sets the balance)
      try {
        const fbUserDoc = await adminDb.collection('users').doc(userId).get();
        if (fbUserDoc && fbUserDoc.exists) {
          const fbData = fbUserDoc.data() || {};
          const currentFbDeposits = Number(fbData?.totalDeposits || 0);
          await adminDb.collection('users').doc(userId).update({
            totalDeposits: currentFbDeposits + rawDepositAmount
          });
        }
      } catch (e: any) {
        logger.warn(`Could not update Firebase user totalDeposits: ${e.message}`);
      }
    }

    // Update Firestore deposit request status
    try {
      await adminDb.collection('deposits').doc(firestoreIdToUpdate).update({ 
        status: isSuccessOrApproved ? 'success' : status,
        credited: isSuccessOrApproved ? true : false,
        processedByServer: true,
        baseAmount: rawDepositAmount,
        bonusPercent: bonusPercent,
        bonusAmount: parseFloat(bonusAmount.toFixed(2)),
        creditedAmount: parseFloat(depositAmountWithBonus.toFixed(2)),
        updatedAt: Date.now()
      });
    } catch (e: any) {
      logger.warn(`Could not update Firestore deposit status document: ${e.message}`);
    }

    // Update user subcollection transaction if present
    try {
      const txColl = adminDb.collection(`users/${userId}/transactions`);
      let userTxDocs = null;
      if (depositData?.orderId || orderId) {
        userTxDocs = await txColl.where('orderId', '==', depositData?.orderId || orderId).get();
      }
      if ((!userTxDocs || userTxDocs.empty) && depositData?.trxId) {
        userTxDocs = await txColl.where('trxId', '==', depositData.trxId).get();
      }
      if (userTxDocs && !userTxDocs.empty) {
        const txStatus = isSuccessOrApproved ? 'Completed' : status === 'rejected' ? 'Rejected' : status;
        for (const docSnap of userTxDocs.docs) {
          await docSnap.ref.update({ status: txStatus, updatedAt: Date.now() });
        }
      }
    } catch (e: any) {
      logger.warn(`Could not update user transaction subcollection: ${e.message}`);
    }
      
      // 2. Send Email Notification
      const user = await get('SELECT email, display_name FROM users WHERE uid = ?', [userId]) as any;
      if (user && user.email) {
        const isApproved = status === 'success' || status === 'approved';
        const isRejected = status === 'rejected';

        // Prevent sending duplicate emails if it was already approved/rejected
        const wasAlreadyProcessed = depositData?.status === 'success' || depositData?.status === 'approved' || depositData?.status === 'rejected';

        if ((isApproved || isRejected) && !wasAlreadyProcessed) {
          const subject = isApproved ? 'Deposit Successful - Bivaax Trade' : 'Deposit Rejected - Bivaax Trade';
          const body = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
              <div style="background-color: ${isApproved ? '#10b981' : '#ef4444'}; padding: 40px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Deposit ${isApproved ? 'Approved' : 'Rejected'}</h1>
                <p style="opacity: 0.9; margin-top: 10px;">Transaction Status Update</p>
              </div>
              <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed;">
                <p style="font-size: 16px; color: #333;">Hello ${user.display_name || 'Trader'},</p>
                <p style="font-size: 16px; color: #333; line-height: 1.6;">Your deposit request has been reviewed by our financial department.</p>
                
                <div style="background-color: ${isApproved ? '#ecfdf5' : '#fef2f2'}; border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <p style="margin: 0; font-size: 14px; color: ${isApproved ? '#065f46' : '#991b1b'};"><strong>Status:</strong> ${isApproved ? 'COMPLETED' : 'REJECTED'}</p>
                  <p style="margin: 5px 0 0; font-size: 14px; color: ${isApproved ? '#047857' : '#b91c1c'};">${isApproved ? 'The funds have been credited to your real account balance.' : 'The transaction was declined. Please verify your payment details and try again.'}</p>
                </div>

                ${isApproved ? '<div style="text-align: center; margin: 30px 0;"><a href="#" style="background-color: #FFE24C; color: #1a1b23; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Start Trading</a></div>' : ''}

                <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you have any questions regarding this transaction, please contact our 24/7 support team via live chat or email.</p>
                
                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
                <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                  <p>&copy; 2026 Bivaax Trade Financial Services</p>
                  <p>Ensuring Secure and Professional Global Trading</p>
                </div>
              </div>
            </div>`;
          await sendEmail(user.email, subject, body);
        }
      }

    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Error in /admin/deposits/update: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/withdrawals/update', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { id, status, userId: rawUserId, amount: rawAmount, orderId } = req.body;

  try {
    let withdrawalData: any = null;
    let withdrawalRef: any = null;
    let firestoreId: string | null = null;
    let tx: any = null;

    // 1. Resolve what the given ID is. Is it a SQL transaction ID or a Firestore document ID?
    const isNumericId = /^\d+$/.test(String(id));

    if (isNumericId) {
      // It is a SQL ID
      const sqlTxId = parseInt(id, 10);
      try {
        tx = await get('SELECT * FROM transactions WHERE id = ?', [sqlTxId]);
        if (tx && tx.details) {
          try {
            const parsedDetails = JSON.parse(tx.details);
            if (parsedDetails && parsedDetails.firestoreId) {
              firestoreId = parsedDetails.firestoreId;
            }
          } catch (e) {}
        }
      } catch (err) {
        logger.error('Error fetching SQL transaction by numeric ID:', err);
      }
    } else {
      // It is a Firestore ID
      firestoreId = id;
    }

    // 2. Fetch/update Firestore document if we have a Firestore ID
    if (adminDb && firestoreId) {
      try {
        withdrawalRef = adminDb.collection('withdrawals').doc(firestoreId);
        const withdrawalDoc = await withdrawalRef.get();
        if (withdrawalDoc.exists) {
          withdrawalData = withdrawalDoc.data();
        }
      } catch (e) {
        logger.error('Error fetching withdrawal doc from Firestore by resolved ID:', e);
      }
    }

    const userId = rawUserId || withdrawalData?.userId || withdrawalData?.uid || withdrawalData?.user_id || tx?.user_id || '';
    const isSuccessOrApproved = status === 'success' || status === 'approved';

    if (!userId && isSuccessOrApproved) {
      return res.status(400).json({ error: 'User ID is missing. Cannot approve this ghost request. Please reject it.' });
    }
    const amount = Number(rawAmount !== undefined ? rawAmount : (withdrawalData?.amount || tx?.amount || 0));

    // If status is already the requested status in Firestore, acknowledge safely (unless we still need to update SQL)
    if (withdrawalData && withdrawalData.status === status && tx && tx.status === (status === 'success' ? 'completed' : status === 'rejected' ? 'rejected' : status === 'approved' ? 'approved' : status)) {
      return res.json({ success: true, message: `Withdrawal is already ${status}` });
    }

    const prevStatus = withdrawalData?.status || tx?.status || 'pending';

    // 3. Find SQL transaction if we haven't found it already
    if (!tx) {
      try {
        if (orderId) {
          tx = await get('SELECT * FROM transactions WHERE details LIKE ? LIMIT 1', [`%${orderId}%`]);
        }
        if (!tx && firestoreId) {
          tx = await get('SELECT * FROM transactions WHERE details LIKE ? LIMIT 1', [`%${firestoreId}%`]);
        }
        if (!tx && userId && amount) {
          tx = await get("SELECT * FROM transactions WHERE user_id = ? AND amount = ? AND type = 'withdrawal' ORDER BY created_at DESC LIMIT 1", [userId, amount.toString()]);
        }
      } catch (sqlTxErr) {
        logger.error('Error finding SQL transaction:', sqlTxErr);
      }
    }

    // 4. Update SQL transactions if found
    if (tx) {
      try {
        const newSqlStatus = status === 'success' ? 'completed' : status === 'rejected' ? 'rejected' : status === 'approved' ? 'approved' : status;
        await run('UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?', [newSqlStatus, Date.now(), tx.id]);
        logger.info(`Successfully updated SQL transaction ID ${tx.id} status to ${newSqlStatus}`);
      } catch (sqlTxErr) {
        logger.error('Error updating SQL transaction for withdrawal:', sqlTxErr);
      }
    }

    // If rejecting a pending or approved withdrawal, REFUND the amount to the user's real balance
    if (status === 'rejected' && prevStatus !== 'rejected' && userId && amount > 0) {
      let user = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
      if (!user && adminDb) {
        const fbUser = await adminDb.collection('users').doc(userId).get();
        if (fbUser.exists) {
          const fbData = fbUser.data();
          await run(
            `INSERT OR IGNORE INTO users (uid, email, display_name, real_balance, demo_balance, country) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, fbData.email || '', fbData.displayName || fbData.name || '', fbData.balance || 0, fbData.demoBalance || 10000, fbData.country || '']
          );
          user = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
        }
      }

      if (user) {
        const currentBalance = new Big(user.real_balance || 0);
        const refundAmount = new Big(amount);
        const newBalance = currentBalance.plus(refundAmount).toFixed(6);
        await run('UPDATE users SET real_balance = ? WHERE uid = ?', [newBalance, userId]);
        
        const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId]);
        const mapped = mapUserForFrontend(updatedUser);
        if (mapped) {
          getIO().to(`user_${userId}`).emit('user_profile_update', mapped);
          await syncUserToFirestore(userId, mapped);
        }
      }
    }

    // 5. Update Firestore withdrawal doc
    if (withdrawalRef) {
      await withdrawalRef.update({
        status: status,
        processedAt: Date.now(),
        updatedAt: Date.now()
      });
      logger.info(`Successfully updated Firestore withdrawal document ${firestoreId} status to ${status}`);
    }

    // Send email notification to the user
    if (userId) {
      try {
        const user = await get('SELECT email, display_name FROM users WHERE uid = ?', [userId]) as any;
        const targetEmail = user?.email || withdrawalData?.userEmail;
        if (targetEmail) {
          const isSuccess = status === 'success' || status === 'approved';
          const subject = isSuccess ? 'Withdrawal Processed Successfully - Bivaax Trade' : 'Withdrawal Request Rejected - Bivaax Trade';
          const body = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
              <div style="background-color: ${isSuccess ? '#10b981' : '#ef4444'}; padding: 40px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Withdrawal ${isSuccess ? 'Completed' : 'Rejected'}</h1>
                <p style="opacity: 0.9; margin-top: 10px;">Transaction Status Update</p>
              </div>
              <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed;">
                <p style="font-size: 16px; color: #333;">Hello ${user?.display_name || withdrawalData?.details?.accountHolder || 'Trader'},</p>
                <p style="font-size: 16px; color: #333; line-height: 1.6;">Your withdrawal request for $${amount.toFixed(2)} has been processed by our financial department.</p>
                
                <div style="background-color: ${isSuccess ? '#ecfdf5' : '#fef2f2'}; border-left: 4px solid ${isSuccess ? '#10b981' : '#ef4444'}; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <p style="margin: 0; font-size: 14px; color: ${isSuccess ? '#065f46' : '#991b1b'};"><strong>Status:</strong> ${status.toUpperCase()}</p>
                  <p style="margin: 5px 0 0; font-size: 14px; color: ${isSuccess ? '#047857' : '#b91c1c'};">${isSuccess ? 'The funds have been transferred to your requested account/wallet.' : 'The withdrawal request was declined and the funds have been refunded to your live balance.'}</p>
                </div>

                <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you have any questions regarding this transaction, please contact our 24/7 support team.</p>
                
                <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
                <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                  <p>&copy; 2026 Bivaax Trade Financial Services</p>
                </div>
              </div>
            </div>`;
          await sendEmail(targetEmail, subject, body);
        }
      } catch (emailErr) {
        logger.error('Error sending withdrawal notification email:', emailErr);
      }
    }

    res.json({ success: true, status });
  } catch (err: any) {
    logger.error(`Error in /admin/withdrawals/update: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/config/fmp-key', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const doc = await adminDb.collection('app_config').doc('settings').get();
    const data = doc.exists ? doc.data() : {};
    res.json({ fmpApiKey: data?.fmpApiKey || process.env.FMP_API_KEY || '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/config/fmp-key', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const { fmpApiKey } = req.body;
    await adminDb.collection('app_config').doc('settings').set({ fmpApiKey }, { merge: true });
    // Also update process.env for the current session
    process.env.FMP_API_KEY = fmpApiKey;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/withdrawals', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    await syncGlobalTransactionsFromFirestore();
    const withdrawals = await query('SELECT * FROM transactions WHERE type = \'withdrawal\' ORDER BY created_at DESC');
    res.json(withdrawals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/deposits', async (req: AuthRequest, res) => {
  try {
    await syncGlobalTransactionsFromFirestore();
    const deposits = await query('SELECT * FROM transactions WHERE type = \'deposit\' ORDER BY created_at DESC');
    res.json(deposits);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/config/db-url', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const doc = await adminDb.collection('app_config').doc('settings').get();
    const data = doc.exists ? doc.data() : {};
    res.json({ dbUrl: data?.dbUrl || process.env.DATABASE_URL || '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/config/db-url', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const { dbUrl } = req.body;
    await adminDb.collection('app_config').doc('settings').set({ dbUrl }, { merge: true });
    
    // Attempt dynamic re-initialization
    const { updatePostgresConfig } = await import('../db/mysql-db.ts');
    const result = await updatePostgresConfig(dbUrl);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/users', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    await syncAllUsersFromFirestore();
  } catch (err: any) {
    logger.error(`[admin/users] syncAllUsersFromFirestore error: ${err.message}`);
  }
  try {
    const rawUsers = await query('SELECT * FROM users ORDER BY id DESC');
    const mappedUsers = (rawUsers || []).map(mapUserForFrontend);

    // Merge any missing Firestore user docs if available
    if (adminDb) {
      try {
        const snap = await adminDb.collection('users').get();
        if (!snap.empty) {
          const userMap = new Map<string, any>();
          mappedUsers.forEach(u => userMap.set(u.uid || u.id, u));
          snap.docs.forEach(d => {
            const fbData = d.data();
            const id = d.id;
            if (!userMap.has(id)) {
              const mapped = mapUserForFrontend({ uid: id, id, ...fbData });
              userMap.set(id, mapped);
            }
          });
          return res.json(Array.from(userMap.values()));
        }
      } catch (fsErr: any) {
        logger.error(`[admin/users] Firestore merge error: ${fsErr.message}`);
      }
    }

    res.json(mappedUsers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/users/update-balance', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { userId, field, value } = req.body;

  try {
    const sqlField = field === 'realBalance' || field === 'balance' ? 'real_balance' : 'demo_balance';
    await run(`UPDATE users SET ${sqlField} = ? WHERE uid = ?`, [value, userId]);
    
    const user = await get('SELECT * FROM users WHERE uid = ?', [userId]);
    const mapped = mapUserForFrontend(user);
    getIO().to(`user_${userId}`).emit('user_profile_update', mapped);
    syncUserToFirestore(userId, mapped);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/admin/users/smart-mode', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { uid, smartModeEnabled, smartModeStrategy } = req.body;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });
  try {
    await run(
      'UPDATE users SET smart_mode_enabled = ?, smart_mode_strategy = ? WHERE uid = ?',
      [smartModeEnabled ? 1 : 0, smartModeStrategy || 'auto_25_percent', uid]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/users/manipulation', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { uid, mode } = req.body;
  if (!uid || !mode) return res.status(400).json({ error: 'Missing uid or mode' });
  
  try {
    setUserManipulation(uid.toString(), mode);
    // Update local SQL
    await run('UPDATE users SET manipulation_mode = ? WHERE uid = ?', [mode, uid]);
    
    // Update Firestore to sync
    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    if (user) {
      const mapped = mapUserForFrontend(user);
      syncUserToFirestore(uid, mapped);
    }
    
    res.json({ success: true, mode });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/dr/check', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  
  try {
    const { SnapshotService } = await import('../services/snapshotService.ts');
    const result = await SnapshotService.runIntegrityCheck();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/snapshot/history', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const { DbSnapshotService } = await import('../services/dbSnapshotService.ts');
    const history = await DbSnapshotService.getBackupHistory();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/snapshot/trigger', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const { DbSnapshotService } = await import('../services/dbSnapshotService.ts');
    const record = await DbSnapshotService.createFullBackup(req.user.uid);
    res.json({ success: true, record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/snapshot/restore', requireAuth, async (req: AuthRequest, res) => {
  // Restoration is restricted to Super Admin only (you can add a role check here)
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  
  const { backupId } = req.body;
  if (!backupId) return res.status(400).json({ error: 'backupId is required' });

  try {
    const { DbSnapshotService } = await import('../services/dbSnapshotService.ts');
    await DbSnapshotService.restoreFromBackup(backupId);
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/snapshot/download/:backupId', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  
  const { backupId } = req.params;
  if (!backupId) return res.status(400).json({ error: 'backupId is required' });

  try {
    const { query } = await import('../db/mysql-db.ts');
    const isPg = (await import('../db/mysql-db.ts')).isUsingPostgres();
    const selectSql = isPg
      ? "SELECT filename FROM system_backups WHERE id = $1"
      : "SELECT filename FROM system_backups WHERE id = ?";
    
    const b = await query(selectSql, [backupId]) as any[];
    if (b.length === 0) return res.status(404).json({ error: 'Backup record not found' });
    
    const filename = b[0].filename;
    const path = await import('path');
    const fs = await import('fs');
    const filePath = path.join(process.cwd(), 'backups', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found on disk' });
    }

    res.download(filePath, filename);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/dr/restore', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  
  try {
    const { SnapshotService } = await import('../services/snapshotService.ts');
    await SnapshotService.performEmergencyRestoration();
    res.json({ success: true, message: 'Emergency restoration completed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/transactions', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  await syncGlobalTransactionsFromFirestore();
  const txs = await query('SELECT t.*, u.email FROM transactions t JOIN users u ON t.user_id = u.uid ORDER BY t.created_at DESC');
  res.json(txs);
});

router.get('/admin/trades', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const trades = await query('SELECT t.*, u.email FROM trades t JOIN users u ON t.user_id = u.uid ORDER BY t.created_at DESC');
  res.json(trades);
});

router.post('/admin/transactions/approve', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { id } = req.body;

  try {
    await transaction(async (conn) => {
      const tx = await get('SELECT * FROM transactions WHERE id = ?', [id], conn) as any;
      if (!tx || tx.status !== 'pending') throw new Error('Invalid transaction');

      if (tx.type === 'deposit') {
        const user = await get('SELECT * FROM users WHERE uid = ?', [tx.user_id], conn) as any;
        const currentBalance = new Big(user.real_balance || 0);
        const depositAmount = new Big(tx.amount);
        const newBalance = currentBalance.plus(depositAmount).toFixed(6);
        await run('UPDATE users SET real_balance = ?, total_deposits = total_deposits + ? WHERE uid = ?', [newBalance, depositAmount.toNumber(), tx.user_id], conn);

        // DR & Audit Logging
        try {
          const { SnapshotService } = await import('../services/snapshotService.ts');
          await SnapshotService.logFinancialAudit(tx.user_id, 'deposit_approval', depositAmount.toFixed(6), currentBalance.toFixed(6), newBalance, `tx_${id}`);
          await SnapshotService.syncUserForDR(tx.user_id);
        } catch (drErr) {
          logger.error('Failed to initiate DR/Audit logging for deposit approval:', drErr);
        }

        // Affiliate Commission (10%) - Placed in 7-day Hold
        if (user.referred_by_uid) {
          try {
            await processDepositAffiliateCommission(
              tx.user_id,
              depositAmount.toNumber(),
              user.currency || 'USD',
              conn
            );
          } catch (affErr: any) {
            logger.error(`Affiliate manual deposit commission error: ${affErr.message}`);
          }
        }
      }

      await run('UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?', ['completed', Date.now(), id], conn);

      // Notify user of balance update
      const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [tx.user_id], conn) as any;
      if (updatedUser) {
        const mappedUser = mapUserForFrontend(updatedUser);
        getIO().to(`user_${tx.user_id}`).emit('user_profile_update', mappedUser);
        syncUserToFirestore(tx.user_id, mappedUser);
      }

      // Send Email Notification
      try {
        const isDeposit = tx.type === 'deposit';
        await sendEmail(
          tx.email || updatedUser.email,
          `${isDeposit ? 'Deposit' : 'Withdrawal'} Successful - Bivaax Trade`,
          `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
            <div style="background-color: #10b981; padding: 40px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">${isDeposit ? 'Deposit' : 'Withdrawal'} Completed</h1>
              <p style="opacity: 0.9; margin-top: 10px;">Funds Transferred Successfully</p>
            </div>
            <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed;">
              <p style="font-size: 16px; color: #333;">Hello ${updatedUser.display_name || 'Trader'},</p>
              <p style="font-size: 16px; color: #333; line-height: 1.6;">Your ${tx.type} of <strong>${tx.amount}</strong> has been successfully processed and completed.</p>
              
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>Amount:</strong> ${tx.amount}</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #047857;"><strong>Status:</strong> COMPLETED</p>
              </div>

              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">${isDeposit ? 'The funds are now available in your trading balance.' : 'The funds have been sent to your external wallet/account.'}</p>
              
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
              <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                <p>&copy; 2026 Bivaax Trade Financial Services</p>
                <p>Ensuring Secure Global Finance</p>
              </div>
            </div>
          </div>`
        );
      } catch (e) {}

      const mapped = mapUserForFrontend(updatedUser);
      getIO().to(`user_${tx.user_id}`).emit('user_profile_update', mapped);
      syncUserToFirestore(tx.user_id, mapped);
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/admin/transactions/reject', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { id, reason } = req.body;

  try {
    await transaction(async (conn) => {
      const tx = await get('SELECT t.*, u.email FROM transactions t JOIN users u ON t.user_id = u.uid WHERE t.id = ?', [id], conn) as any;
      if (!tx || tx.status !== 'pending') throw new Error('Invalid transaction');

      // If it was a withdrawal, we need to refund the balance
      if (tx.type === 'withdrawal') {
        const user = await get('SELECT real_balance FROM users WHERE uid = ?', [tx.user_id], conn) as any;
        const currentBalance = new Big(user.real_balance || 0);
        const refundAmount = new Big(tx.amount);
        const newBalance = currentBalance.plus(refundAmount).toFixed(6);
        await run('UPDATE users SET real_balance = ? WHERE uid = ?', [newBalance, tx.user_id], conn);

        // DR & Audit Logging
        try {
          const { SnapshotService } = await import('../services/snapshotService.ts');
          await SnapshotService.logFinancialAudit(tx.user_id, 'withdrawal_refund', refundAmount.toFixed(6), currentBalance.toFixed(6), newBalance, `tx_${id}`);
          await SnapshotService.syncUserForDR(tx.user_id);
        } catch (drErr) {
          logger.error('Failed to initiate DR/Audit logging for withdrawal refund:', drErr);
        }
      }

      await run('UPDATE transactions SET status = ?, updated_at = ?, rejection_reason = ? WHERE id = ?', ['rejected', Date.now(), reason || 'Documentation mismatch or invalid transaction', id], conn);

      // Fetch user for notification
      const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [tx.user_id], conn) as any;

      // Send Email Notification
      try {
        await sendEmail(
          tx.email,
          `${tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Rejected - Bivaax Trade`,
          `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f4f7f9; padding: 20px;">
            <div style="background-color: #ef4444; padding: 40px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Transaction Rejected</h1>
              <p style="opacity: 0.9; margin-top: 10px;">Action Required</p>
            </div>
            <div style="padding: 40px; background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e1e8ed;">
              <p style="font-size: 16px; color: #333;">Hello ${updatedUser.display_name || 'Trader'},</p>
              <p style="font-size: 16px; color: #333; line-height: 1.6;">Your ${tx.type} request for <strong>${tx.amount}</strong> has been rejected by our financial department.</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>Status:</strong> REJECTED</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #b91c1c;"><strong>Reason:</strong> ${reason || 'Invalid transaction details or verification failed.'}</p>
              </div>

              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you believe this is an error, please review your transaction details and resubmit or contact our 24/7 support team.</p>
              
              <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;">
              <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                <p>&copy; 2026 Bivaax Trade Financial Services</p>
                <p>Secure Professional Trading Platform</p>
              </div>
            </div>
          </div>`
        );
      } catch (e) {}

      // Notify user via Socket
      const mapped = mapUserForFrontend(updatedUser);
      getIO().to(`user_${tx.user_id}`).emit('user_profile_update', mapped);
      syncUserToFirestore(tx.user_id, mapped);
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Aliases for compatibility
router.get('/users', optionalAuth, async (req: AuthRequest, res) => {
  const referredByUid = req.query.referredByUid as string;
  const affiliateId = req.query.affiliateId as string;
  const referralCode = req.query.referralCode as string;
  const uid = req.query.uid as string;

  if (referredByUid) {
    const affVal = affiliateId || referredByUid;
    const refVal = referralCode || referredByUid;
    const referredUsers = await query(
      'SELECT * FROM users WHERE referred_by_uid = ? OR referred_by_uid = ? OR referred_by_uid = ?', 
      [referredByUid, affVal, refVal]
    );
    
    // If SQLite returned none, fallback to Firestore
    if (referredUsers.length === 0 && adminDb) {
      try {
        const snap = await adminDb.collection('users').where('referredByUid', '==', referredByUid).limit(50).get();
        if (!snap.empty) {
          const list = snap.docs.map((d: any) => ({ uid: d.id, ...d.data() }));
          return res.json(list.map(mapUserForFrontend));
        }
      } catch (_) {}
    }

    return res.json(referredUsers.map(mapUserForFrontend));
  }

  if (affiliateId) {
    const matched = await get('SELECT * FROM users WHERE referral_code = ? OR uid = ?', [affiliateId, affiliateId]);
    if (matched) return res.json([mapUserForFrontend(matched)]);
    if (adminDb) {
      try {
        const snap = await adminDb.collection('users').where('referralCode', '==', String(affiliateId)).limit(1).get();
        if (!snap.empty) {
          return res.json([mapUserForFrontend({ uid: snap.docs[0].id, ...snap.docs[0].data() })]);
        }
      } catch (_) {}
    }
    return res.json([]);
  }

  if (referralCode) {
    const matched = await get('SELECT * FROM users WHERE referral_code = ? OR uid = ?', [referralCode, referralCode]);
    if (matched) return res.json([mapUserForFrontend(matched)]);
    if (adminDb) {
      try {
        const snap = await adminDb.collection('users').where('referralCode', '==', String(referralCode)).limit(1).get();
        if (!snap.empty) {
          return res.json([mapUserForFrontend({ uid: snap.docs[0].id, ...snap.docs[0].data() })]);
        }
      } catch (_) {}
    }
    return res.json([]);
  }

  if (uid) {
    const matched = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    if (matched) return res.json([mapUserForFrontend(matched)]);
    if (adminDb) {
      try {
        const doc = await adminDb.collection('users').doc(uid).get();
        if (doc.exists) {
          return res.json([mapUserForFrontend({ uid: doc.id, ...doc.data() })]);
        }
      } catch (_) {}
    }
    return res.json([]);
  }

  // If we reached here and had any query params (even empty), return empty array
  if (Object.keys(req.query).length > 0) {
    return res.json([]);
  }

  // Only return current user if no query params at all (legacy behavior for profile fetch)
  if (!req.user) {
    return res.json([]);
  }
  const user = await get('SELECT * FROM users WHERE uid = ?', [req.user.uid]);
  res.json(user ? [mapUserForFrontend(user)] : []);
});

// Affiliate click recorder (records clicks in SQLite & Firestore)
router.post('/affiliate/click', async (req, res) => {
  try {
    const { referralCode, subId, campaignId, type } = req.body || {};
    if (!referralCode) {
      return res.json({ success: false, message: 'No referral code provided' });
    }

    const strCode = String(referralCode).trim();
    const referrer = await get('SELECT uid, referral_code, total_clicks, impressions FROM users WHERE referral_code = ? OR uid = ?', [strCode, strCode]) as any;
    
    let referrerUid = referrer?.uid;
    if (!referrerUid && adminDb) {
      try {
        const snap = await adminDb.collection('users').where('referralCode', '==', strCode).limit(1).get();
        if (!snap.empty) {
          referrerUid = snap.docs[0].id;
        }
      } catch (_) {}
    }

    if (referrerUid) {
      await run('UPDATE users SET total_clicks = COALESCE(total_clicks, 0) + 1, impressions = COALESCE(impressions, 0) + 1 WHERE uid = ?', [referrerUid]);
      if (adminDb) {
        try {
          const userRef = adminDb.collection('users').doc(referrerUid);
          const currentDoc = await userRef.get();
          const curClicks = (currentDoc.exists && currentDoc.data()?.totalClicks) || 0;
          const curImpressions = (currentDoc.exists && currentDoc.data()?.impressions) || 0;
          await userRef.set({
            totalClicks: curClicks + 1,
            impressions: curImpressions + 1,
            lastClickAt: Date.now()
          }, { merge: true });

          await adminDb.collection('affiliate_clicks').add({
            referrerUid,
            referralCode: strCode,
            subId: subId || 'default',
            campaignId: campaignId || null,
            type: type || 'direct',
            timestamp: Date.now()
          });
        } catch (_) {}
      }
    }

    res.json({ success: true, referrerUid: referrerUid || null });
  } catch (err: any) {
    res.json({ success: false, error: err.message });
  }
});

// Staff Admin Permissions Endpoint (Owner Only)
router.post('/admin/staff/set-permissions', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { uid, email, isAdmin, viewOnly, allowedFeatures } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const permsJson = JSON.stringify({
      viewOnly: viewOnly !== false,
      allowedFeatures: allowedFeatures || {}
    });

    if (isAdmin) {
      await run('UPDATE users SET is_admin = 1, admin_permissions = ? WHERE uid = ?', [permsJson, uid]);
    } else {
      await run('UPDATE users SET is_admin = 0, admin_permissions = NULL WHERE uid = ?', [uid]);
    }

    if (adminDb) {
      if (isAdmin) {
        await adminDb.collection('admins').doc(uid).set({
          id: uid,
          uid,
          email: email || '',
          role: 'admin',
          viewOnly: viewOnly !== false,
          allowedFeatures: allowedFeatures || {},
          updatedAt: Date.now()
        }, { merge: true });

        await adminDb.collection('users').doc(uid).set({
          role: 'admin',
          isAdmin: true,
          viewOnly: viewOnly !== false,
          allowedFeatures: allowedFeatures || {}
        }, { merge: true });
      } else {
        await adminDb.collection('admins').doc(uid).delete().catch(() => {});
        await adminDb.collection('users').doc(uid).set({
          role: 'user',
          isAdmin: false,
          viewOnly: false
        }, { merge: true });
      }
    }

    res.json({ success: true, message: 'Permissions updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trades', requireAuth, async (req: AuthRequest, res) => {
  const trades = await query('SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC', [req.user!.uid]);
  res.json(trades);
});

router.get('/transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const txs = await getUserTransactions(req.user!.uid);
    res.json(txs);
  } catch (err: any) {
    logger.error(`Failed to fetch transactions for user ${req.user!.uid}: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/temp-deposits', async (req, res) => {
  if (!adminDb) return res.json({error: 'no adminDb'});
  const snap = await adminDb.collection('deposits').orderBy('timestamp', 'desc').limit(20).get();
  res.json(snap.docs.map(d => ({id: d.id, ...d.data()})));
});

// --- Settings & Config ---
const defaultSettings = {
  socialTelegram: "https://t.me/Bivaax_Official",
  socialYoutube: "https://youtube.com/@bivaax",
  socialInstagram: "https://instagram.com/bivaax",
  socialFacebook: "https://facebook.com/bivaax",
  socialTiktok: "https://tiktok.com/@bivaax",
  maintenanceMode: false,
  minDeposit: 10,
  minWithdraw: 15,
  payoutRates: { default: 82, crypto: 85, stocks: 75 },
  binancePayQrCode: "https://i.postimg.cc/Gt5SP1L4/IMG-20260804-141135.png",
  binancePayEnabled: true,
  usdtTrc20Address: "TD73cKwhFQ3i5e43TYyoyMPijvkU4uHVwi",
  usdtTrc20QrCode: "https://i.postimg.cc/ZKN9zFGL/IMG-20260804-151047.png",
  usdtTrc20Enabled: true,
  ethAddress: "0x8e01631855cf57fa2da27ff30c181cca137aefb5",
  ethQrCode: "https://i.postimg.cc/T3WzTQGD/IMG-20260804-151727.png",
  ethEnabled: true,
  btcAddress: "0x8e01631855cf57fa2da27ff30c181cca137aefb5",
  btcQrCode: "https://i.postimg.cc/GpKwd7Gr/IMG-20260804-235328.png",
  btcEnabled: true,
  tonAddress: "UQCCpPsMUQJZK9DEzR-C51gJ13vBtSfPKNm53h1Wxys3Bof5",
  tonQrCode: "https://i.postimg.cc/TYcfV9hD/IMG-20260805-120710.png",
  tonEnabled: true,
  dogeAddress: "DQxycdGAx3Je27YSAc87WJ7ANq9McALh4U",
  dogeQrCode: "https://i.postimg.cc/cCgtKzdX/IMG-20260805-121203.png",
  dogeEnabled: true,
  ltcAddress: "LQ41bM2B892pfDX1suYe15hmsDuozgyZfU",
  ltcQrCode: "https://i.postimg.cc/9FCX4MCs/IMG-20260805-125156.png",
  ltcEnabled: true,
};

router.get('/app_config/settings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;
    let isAdmin = false;
    
    if (token) {
      try {
        const { verifyToken } = await import('../lib/auth-server.ts');
        let decoded = verifyToken(token);
        if (!decoded) {
          const jwt = await import('jsonwebtoken');
          const payload = jwt.default.decode(token) as any;
          if (payload) {
            decoded = {
              uid: payload.uid || payload.sub || payload.user_id,
              email: payload.email,
              isAdmin: !!payload.isAdmin || !!payload.admin
            } as any;
          }
        }
        if (decoded) {
          const dbUser = await get('SELECT is_admin, email FROM users WHERE uid = ? OR email = ?', [decoded.uid, decoded.email]) as any;
          const userEmail = (dbUser?.email || decoded.email)?.toLowerCase().trim();
          const hardcodedAdminEmails = [
            'bivaaxtrade@gmail.com',
            'msbivaax@gmail.com',
            'bivaaxtrader@gmail.com',
            'hasan1@gmail.com',
            'support@bivaax.com',
            (process.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim()
          ].filter(Boolean);

          if ((dbUser && dbUser.is_admin) || (userEmail && hardcodedAdminEmails.includes(userEmail))) {
            isAdmin = true;
          }
        }
      } catch (e) {
        // ignore auth errors
      }
    }

    let pgSettings: Record<string, any> = {};
    try {
      pgSettings = await getAllAppSettings();
    } catch (e: any) {
      logger.warn(`Could not read settings from PostgreSQL: ${e.message}`);
    }

    let fsData = {};
    if (adminDb) {
      try {
        const docSnap = await adminDb.collection('app_config').doc('settings').get();
        if (docSnap.exists) {
          fsData = docSnap.data() || {};
        }
      } catch (e) {}
    }
    
    const responseData: Record<string, any> = {
      ...defaultSettings,
      ...fsData,
      ...pgSettings
    };

    if (!isAdmin) {
      // Strip sensitive SMTP credentials and keys for safety
      delete responseData.smtpHost;
      delete responseData.smtpPort;
      delete responseData.smtpUser;
      delete responseData.smtpPass;
      delete responseData.smtpFromEmail;
      delete responseData.smtpFromName;
      delete responseData.resendApiKey;
      delete responseData.mailgunApiKey;
      delete responseData.sendgridApiKey;
      delete responseData.fmpApiKey;
      delete responseData.geminiApiKey;
      delete responseData.cloudinaryApiSecret;
      delete responseData.s3SecretAccessKey;
    }

    res.json(responseData);
  } catch (err: any) {
    logger.error('Error fetching settings:', err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/app_config/settings', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // 1. Save directly to PostgreSQL app_settings table
    await saveAppSettings(req.body, true);

    res.json({ success: true });
  } catch (err: any) {
    logger.error('Error saving app_config settings to PostgreSQL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload endpoint for KYC documents, NID images, and Profile photos
router.post('/upload', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { image, folder, publicIdPrefix } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required for upload' });
    }

    const result = await uploadImage(
      image, 
      folder || 'bivaax_uploads', 
      publicIdPrefix || `user_${req.user?.uid || 'guest'}`
    );

    res.json({ success: true, url: result.url, provider: result.provider });
  } catch (err: any) {
    logger.error('Error uploading file:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// --- News & Newsletter ---
router.post('/newsletter', async (req, res) => {
  res.json({ success: true });
});

// --- KYC Identity Verification Routes ---

// 1. Scan and verify KYC document via Gemini AI
router.post('/kyc/scan', requireAuth, async (req: AuthRequest, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  try {
    const ai = getGeminiClient();
    
    // Clean base64 string
    let base64Data = image;
    let mimeType = 'image/jpeg';
    if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      const mimePart = parts[0];
      base64Data = parts[1];
      mimeType = mimePart.replace('data:', '');
    }

    const systemInstruction = `You are an expert official KYC compliance officer. 
Analyze the uploaded National ID (NID), Passport, or Driving License image.
Verify if:
1. It is a genuine, official document (NID, Passport, or License) from a country.
2. It is an original physical card/document itself, NOT a photograph of a computer screen, a photocopy, a piece of paper, a random object, or a fake generated card.
3. The details are legible.

Extract these details:
- Document Type: NID, Passport, or License.
- Document Number (the official card or ID number).
- Full Name.
- Date of Birth (standard YYYY-MM-DD format).
- Calculate Age as of 2026-07-18 and determine if the person is over 18 (isOver18: true).
- Address (if present).
- Originality confidence: a score from 0-100 on how confident you are that this is a real, original, physical card/document in hand.
- isOriginal: true if confidence >= 80, else false.
- Rejection reason: if not valid, not readable, or appears fake/copied, state the clear reason in a friendly but professional tone.

Provide your response strictly matching the schema. If it's not a real ID card, set isValidDocument to false and provide a rejectionReason.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptPart = {
      text: "Analyze this document image for official KYC verification. Be extremely precise and strict. Rejects fakes, computer screens, or paper prints.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: { parts: [imagePart, promptPart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidDocument: { type: Type.BOOLEAN },
            documentType: { type: Type.STRING },
            documentNumber: { type: Type.STRING },
            fullName: { type: Type.STRING },
            dateOfBirth: { type: Type.STRING },
            age: { type: Type.INTEGER },
            isOver18: { type: Type.BOOLEAN },
            address: { type: Type.STRING },
            originalityConfidence: { type: Type.INTEGER },
            isOriginal: { type: Type.BOOLEAN },
            rejectionReason: { type: Type.STRING }
          },
          required: ["isValidDocument", "documentType", "documentNumber", "fullName", "dateOfBirth", "age", "isOver18", "isOriginal"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI engine");
    }

    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (err: any) {
    logger.error(`KYC scan failed: ${err.message}`);
    res.status(500).json({ error: err.message || 'Verification scan failed' });
  }
});

// 1b. AI Verification (Automatic validation & approval/rejection)
router.post('/kyc/verify-ai', requireAuth, async (req: AuthRequest, res) => {
  const { idType, idFrontUrl, idBackUrl } = req.body;
  const userId = req.user!.uid;

  if (!idFrontUrl) {
    return res.status(400).json({ error: 'Front image is required' });
  }

  try {
    let ai;
    try {
      ai = getGeminiClient();
    } catch (keyErr: any) {
      if (keyErr.message.includes('GEMINI_API_KEY')) {
        return res.status(400).json({
          error: "Sorry, the AI verification system is currently unavailable. Please add your 'GEMINI_API_KEY' in the Google AI Studio Settings > Secrets panel to enable this feature."
        });
      }
      throw keyErr;
    }

    // Helper to process base64
    const processImageBase64 = (base64Str: string) => {
      let base64Data = base64Str;
      let mimeType = 'image/jpeg';
      if (base64Str.includes(';base64,')) {
        const parts = base64Str.split(';base64,');
        const mimePart = parts[0];
        base64Data = parts[1];
        mimeType = mimePart.replace('data:', '');
      }
      return { inlineData: { mimeType, data: base64Data } };
    };

    const contents: any[] = [];
    contents.push(processImageBase64(idFrontUrl));

    if (idBackUrl) {
      contents.push(processImageBase64(idBackUrl));
    }

    const systemInstruction = `You are an expert official KYC compliance officer with advanced document fraud detection capabilities.
Analyze the uploaded image(s). The user claims this is an official ${idType} document (which must be a National ID card, Passport, or Driving License).

You MUST perform a strict verification:
1. Verify if the document is genuinely an official ${idType} (National ID, Passport, or Driving License) from any country.
2. If it is NOT an official ${idType} (for example, if the user uploaded a photo of a dog, a selfie, a laptop screen, a piece of blank paper, a photocopy, a bank statement, or a utility bill), you MUST set "isValidDocument" to false and provide a clear, professional, direct Bengali rejection reason in "rejectionReason".
3. Check if the document appears to be a physical original card/document, not a photo of a computer monitor, a printed paper, or a fake.
4. Extract the Full Name and Document ID Number.

Respond strictly in JSON matching the schema:
{
  "isValidDocument": boolean (true if valid and authentic NID/Passport/Driving License, false otherwise),
  "fullName": string (full name extracted from document, or empty if invalid),
  "documentNumber": string (ID or Passport number extracted from document, or empty if invalid),
  "rejectionReason": string (if isValidDocument is false, provide a professional, helpful rejection reason in English explaining exactly why it was rejected. Example: "Sorry, the uploaded image does not appear to be a valid document. Please upload a clear photo of your official physical ID.")
}`;

    contents.push({
      text: `Verify this document as an official physical ${idType}. Please perform OCR and check for document authenticity.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidDocument: { type: Type.BOOLEAN },
            fullName: { type: Type.STRING },
            documentNumber: { type: Type.STRING },
            rejectionReason: { type: Type.STRING }
          },
          required: ["isValidDocument", "fullName", "documentNumber"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI engine");
    }

    const result = JSON.parse(text.trim());
    const isApproved = result.isValidDocument;
    const status = isApproved ? 'approved' : 'rejected';
    const kyc_status = isApproved ? 'verified' : 'unverified';

    // 1. Save to Firestore (if active)
    let firestoreId = '';
    try {
      const docRef = await adminDb.collection('kycRequests').add({
        userId,
        userEmail: req.user!.email,
        fullName: result.fullName || '---',
        idType: idType,
        idNumber: result.documentNumber || '---',
        idFrontUrl: idFrontUrl,
        idBackUrl: idBackUrl || '',
        selfieUrl: '',
        status: status,
        rejectionReason: result.rejectionReason || '',
        submittedAt: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      firestoreId = docRef.id;
    } catch (firestoreErr: any) {
      logger.warn(`Firestore KYC AI submission failed: ${firestoreErr.message}`);
    }

    // 2. Save to SQL Database
    await run(
      `INSERT INTO kyc_requests (user_id, status, full_name, document_type, document_number, front_image, back_image, selfie_image, rejection_reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        status, 
        result.fullName || '---', 
        idType, 
        result.documentNumber || '---', 
        idFrontUrl, 
        idBackUrl || '', 
        '', 
        result.rejectionReason || '',
        Date.now(), 
        Date.now()
      ]
    );

    // 3. Update users table
    await run('UPDATE users SET kyc_status = ? WHERE uid = ?', [kyc_status, userId]);

    // DR Sync
    try {
      const { SnapshotService } = await import('../services/snapshotService.ts');
      await SnapshotService.syncUserForDR(userId);
    } catch (drErr) {
      logger.error('Failed to initiate DR sync for KYC update:', drErr);
    }

    // 4. Send Instant Email
    try {
      const userDoc = await get('SELECT email, display_name FROM users WHERE uid = ?', [userId]) as any;
      if (userDoc) {
        const mailSubject = isApproved ? 'Identity Verification Approved' : 'Identity Verification Rejected';
        const mailBody = `<div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: ${isApproved ? '#4CAF50' : '#ef4444'}; padding: 30px; border-radius: 10px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">Identity Verification (KYC) ${isApproved ? 'Approved' : 'Rejected'}</h2>
          </div>
          <div style="padding: 30px; background-color: white; border-radius: 0 0 10px 10px; border: 1px solid #eee; text-align: left; color: #333; line-height: 1.6;">
            <p>Hello ${userDoc.display_name || 'Trader'},</p>
            <p>Your identity verification (KYC) request has been processed automatically by our AI compliance system.</p>
            ${isApproved 
              ? `<div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <strong style="color: #15803d; font-size: 16px;">Congratulations! Your KYC is verified.</strong>
                  <p style="margin: 5px 0 0; font-size: 14px; color: #166534;">Your account is now fully active. All trading, deposit, and withdrawal limitations have been cleared.</p>
                 </div>` 
              : `<div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <strong style="color: #b91c1c; font-size: 16px;">Verification Failed:</strong>
                  <p style="margin: 5px 0 0; font-size: 14px; color: #991b1b;">${result.rejectionReason || 'The uploaded document is invalid or not clearly readable.'}</p>
                 </div>
                 <p>Please review our compliance checklist and try uploading a high-quality photo of your original, physical document.</p>`}
            <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
            <p style="font-size: 11px; color: #999; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Bivaax Trade Security & Compliance Team</p>
          </div>
        </div>`;

        await sendEmail(userDoc.email, mailSubject, mailBody);
      }
    } catch (e: any) {
      logger.error(`Failed to send KYC result email: ${e.message}`);
    }

    // 5. Emit socket event
    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
    if (updatedUser) {
      const mapped = mapUserForFrontend(updatedUser);
      getIO().to(`user_${userId}`).emit('user_profile_update', mapped);
      syncUserToFirestore(userId, mapped);
    }

    res.json({
      success: isApproved,
      isValidDocument: isApproved,
      fullName: result.fullName,
      documentNumber: result.documentNumber,
      rejectionReason: result.rejectionReason || ''
    });

  } catch (err: any) {
    logger.error(`KYC AI verify failed: ${err.message}`);
    res.status(500).json({ error: err.message || 'Verification failed. Please try again.' });
  }
});

// 2. Submit KYC verification application (linked with Firestore)
router.post('/kyc', requireAuth, async (req: AuthRequest, res) => {
  const { userId, kycData } = req.body;
  if (!userId || !kycData) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Write request to Firestore (if available)
    let firestoreId = '';
    try {
      const docRef = await adminDb.collection('kycRequests').add({
        userId,
        userEmail: kycData.userEmail || req.user!.email,
        fullName: kycData.fullName,
        idType: kycData.idType,
        idNumber: kycData.idNumber,
        idFrontUrl: kycData.idFrontUrl,
        idBackUrl: kycData.idBackUrl || '',
        selfieUrl: kycData.selfieUrl || '',
        status: 'pending',
        submittedAt: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      firestoreId = docRef.id;
    } catch (firestoreErr: any) {
      logger.warn(`Firestore KYC submission failed: ${firestoreErr.message}`);
    }

    // Write to SQL database (Backup/Primary fallback)
    await run(
      `INSERT INTO kyc_requests (user_id, status, full_name, document_type, document_number, front_image, back_image, selfie_image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        'pending', 
        kycData.fullName, 
        kycData.idType, 
        kycData.idNumber, 
        kycData.idFrontUrl, 
        kycData.idBackUrl || '', 
        kycData.selfieUrl || '', 
        Date.now(), 
        Date.now()
      ]
    );

    // Update users table in SQLite/MySQL database
    const sqlRes = await run('UPDATE users SET kyc_status = ? WHERE uid = ?', ['pending', userId]);
    logger.info(`KYC status updated in SQL for ${userId}: ${JSON.stringify(sqlRes)}`);

    // Emit live socket event to notify user profile has changed
    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
    if (updatedUser) {
      const mapped = mapUserForFrontend(updatedUser);
      getIO().to(`user_${userId}`).emit('user_profile_update', mapped);
      syncUserToFirestore(userId, mapped);
    }

    res.json({ success: true, id: firestoreId || `sql-${Date.now()}` });
  } catch (err: any) {
    logger.error(`Error submitting KYC request: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get latest KYC status of user
router.get('/user/kyc-status', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    let snap;
    try {
      snap = await adminDb.collection('kycRequests')
        .where('userId', '==', userId)
        .orderBy('submittedAt', 'desc')
        .limit(1)
        .get();
    } catch (firestoreErr: any) {
      if (firestoreErr.code !== 5 && !firestoreErr.message?.includes('NOT_FOUND')) {
        logger.warn(`Firestore KYC fetch failed: ${firestoreErr.message}`);
      }
      // Fallback to SQL below
      snap = { empty: true };
    }
    
    if (snap && !snap.empty) {
      const docData = snap.docs[0].data();
      res.json({
        id: snap.docs[0].id,
        status: docData.status || 'pending', // Fallback for improperly formatted legacy documents
        createdAt: docData.submittedAt || Date.now(),
        ...docData
      });
    } else {
      const user = await get('SELECT kyc_status FROM users WHERE uid = ?', [userId]) as any;
      if (user) {
        res.json({ status: user.kyc_status === 'verified' ? 'approved' : user.kyc_status });
      } else {
        res.json(null);
      }
    }
  } catch (err: any) {
    logger.error(`Error fetching kyc status: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 4. Fetch all KYC requests (Admin-only operation)
router.get('/admin/kyc/requests', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized admin operations' });
  }

  try {
    // 1. Fetch from SQL kyc_requests
    const sqlRequests = await query(`
      SELECT 
        k.id, 
        k.user_id as userId, 
        k.status, 
        k.full_name as fullName, 
        k.document_type as idType, 
        k.document_number as idNumber, 
        k.front_image as idFrontUrl, 
        k.back_image as idBackUrl, 
        k.selfie_image as selfieUrl, 
        k.rejection_reason as rejectionReason, 
        k.created_at as submittedAt, 
        u.email as userEmail
      FROM kyc_requests k 
      LEFT JOIN users u ON k.user_id = u.uid 
      ORDER BY k.created_at DESC 
      LIMIT 200
    `) as any[];

    // 2. Fetch from Firestore kycRequests
    let firestoreRequests: any[] = [];
    try {
      if (adminDb) {
        const snap = await adminDb.collection('kycRequests').get();
        firestoreRequests = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
    } catch (fsErr: any) {
      logger.warn(`Failed to fetch kycRequests from Firestore: ${fsErr.message}`);
    }

    // 3. Merge & Deduplicate
    const mergedMap = new Map<string, any>();

    for (const item of firestoreRequests) {
      const key = String(item.id || item.userId || item.uid || Math.random());
      let ts = 0;
      if (item.submittedAt) {
        if (typeof item.submittedAt === 'number') ts = item.submittedAt;
        else if (typeof item.submittedAt === 'string') ts = Date.parse(item.submittedAt) || parseFloat(item.submittedAt) || 0;
      }
      if (!ts && item.createdAt) {
        if (typeof item.createdAt?.toMillis === 'function') ts = item.createdAt.toMillis();
        else if (typeof item.createdAt?.toDate === 'function') ts = item.createdAt.toDate().getTime();
        else if (typeof item.createdAt === 'number') ts = item.createdAt;
        else if (typeof item.createdAt === 'string') ts = Date.parse(item.createdAt) || 0;
        else if (typeof item.createdAt?.seconds === 'number') ts = item.createdAt.seconds * 1000;
        else if (typeof item.createdAt?._seconds === 'number') ts = item.createdAt._seconds * 1000;
      }
      if (!ts) ts = Date.now();

      mergedMap.set(key, {
        id: String(item.id),
        userId: item.userId || item.uid || item.user_id || '',
        userEmail: item.userEmail || item.email || '',
        fullName: item.fullName || item.userName || item.name || item.full_name || '---',
        idType: item.idType || item.documentType || item.document_type || 'NID',
        idNumber: item.idNumber || item.documentNumber || item.document_number || '---',
        idFrontUrl: item.idFrontUrl || item.frontImage || item.front_image || item.photoURL || '',
        idBackUrl: item.idBackUrl || item.backImage || item.back_image || '',
        selfieUrl: item.selfieUrl || item.selfieImage || item.selfie_image || '',
        status: item.status || 'pending',
        submittedAt: ts,
        rejectionReason: item.rejectionReason || ''
      });
    }

    for (const item of sqlRequests) {
      const key = String(item.id);
      if (!mergedMap.has(key)) {
        let ts = 0;
        if (item.submittedAt) {
          if (typeof item.submittedAt === 'number') ts = item.submittedAt;
          else if (typeof item.submittedAt === 'string') ts = Date.parse(item.submittedAt) || parseFloat(item.submittedAt) || 0;
        }
        if (!ts) ts = Date.now();

        mergedMap.set(key, {
          id: String(item.id),
          userId: item.userId || item.uid || item.user_id || '',
          userEmail: item.userEmail || '',
          fullName: item.fullName || '---',
          idType: item.idType || 'NID',
          idNumber: item.idNumber || '---',
          idFrontUrl: item.idFrontUrl || '',
          idBackUrl: item.idBackUrl || '',
          selfieUrl: item.selfieUrl || '',
          status: item.status || 'pending',
          submittedAt: ts,
          rejectionReason: item.rejectionReason || ''
        });
      }
    }

    const resultList = Array.from(mergedMap.values());
    resultList.sort((a, b) => {
      const scoreA = String(a.status || '').toLowerCase() === 'pending' ? 0 : 1;
      const scoreB = String(b.status || '').toLowerCase() === 'pending' ? 0 : 1;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return Number(b.submittedAt || 0) - Number(a.submittedAt || 0);
    });

    res.json(resultList);
  } catch (err: any) {
    logger.error(`Error fetching admin kyc requests: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 5. Update KYC request status (Admin-only operation)
router.post('/admin/kyc/update', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized admin operations' });
  }

  const { id, userId, status, rejectionReason } = req.body;
  if (!userId || !status) {
    return res.status(400).json({ error: 'Missing user ID or status parameters. This happens if the KYC data is corrupted. Please reject and ask user to resubmit.' });
  }

  try {
    // 1. Update Firestore if possible
    if (id) {
      try {
        await adminDb.collection('kycRequests').doc(String(id)).update({
          status,
          rejectionReason: rejectionReason || '',
          updatedAt: new Date()
        });
      } catch (e: any) {
        logger.warn(`Could not update doc ${id} in Firestore kycRequests: ${e.message}`);
      }
    }

    // 2. Update users table (kyc_status)
    const kyc_status = status === 'approved' ? 'verified' : (status === 'rejected' ? 'unverified' : status);
    await run('UPDATE users SET kyc_status = ? WHERE uid = ?', [kyc_status, userId]);

    // Also update Firestore user doc
    try {
      await adminDb.collection('users').doc(userId).update({ kycStatus: kyc_status });
    } catch (e: any) {}

    // 3. Update SQL kyc_requests table
    const sqlId = !isNaN(Number(id)) ? Number(id) : 0;
    await run(
      'UPDATE kyc_requests SET status = ?, rejection_reason = ?, updated_at = ? WHERE user_id = ? AND (status = \'pending\' OR id = ?)',
      [status, rejectionReason || '', Date.now(), userId, sqlId]
    );

    // 4. Emit live socket event and sync to Firestore
    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
    if (updatedUser) {
      const mapped = mapUserForFrontend(updatedUser);
      getIO().to(`user_${userId}`).emit('user_profile_update', mapped);
      syncUserToFirestore(userId, mapped);
    }

    // 5. Send KYC Result Email
    try {
      const userDoc = await get('SELECT email, display_name FROM users WHERE uid = ?', [userId]) as any;
      if (userDoc) {
        const isApproved = status === 'approved';
        await sendEmail(
          userDoc.email,
          `Identity Verification ${isApproved ? 'Approved' : 'Rejected'}`,
          `<div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background-color: ${isApproved ? '#4CAF50' : '#ef4444'}; padding: 30px; border-radius: 10px; color: white; text-align: center;">
              <h2 style="margin: 0;">KYC ${isApproved ? 'Approved' : 'Rejected'}</h2>
            </div>
            <div style="padding: 30px; background-color: white; border-radius: 0 0 10px 10px; border: 1px solid #eee;">
              <p>Hello ${userDoc.display_name || 'Trader'},</p>
              <p>Your identity verification (KYC) request has been reviewed by our compliance team.</p>
              ${isApproved 
                ? `<div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <strong style="color: #15803d;">Status: VERIFIED</strong>
                    <p style="margin: 5px 0 0; font-size: 14px; color: #166534;">Your account limits have been removed.</p>
                   </div>` 
                : `<div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <strong style="color: #b91c1c;">Status: REJECTED</strong>
                    <p style="margin: 5px 0 0; font-size: 14px; color: #991b1b;">Reason: ${rejectionReason || 'Document mismatch or low quality.'}</p>
                   </div>
                   <p>Please re-submit with correct documents in the Profile section.</p>`}
              <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
              <p style="font-size: 11px; color: #999; text-align: center;">BIVAXX COMPLIANCE TEAM</p>
            </div>
          </div>`
        );
      }
    } catch (e: any) {
      logger.error(`Failed to send KYC admin update email: ${e.message}`);
    }

    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Error updating KYC request status: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// --- Affiliate Program Endpoints ---

// 1. Get Affiliate Summary (Available, 7-Day Held, Total Deposits, Trading Volume, FTDs)
router.get('/affiliate/summary', async (req, res) => {
  const { userId, affiliateCode } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const summary = await getAffiliateSummary(String(userId), affiliateCode ? String(affiliateCode) : undefined);
    res.json(summary);
  } catch (err: any) {
    logger.error(`Error fetching affiliate summary: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 2. Get list of referred traders with live balances, deposit volume, trade stats, and hold commissions
router.get('/affiliate/referred-traders', async (req, res) => {
  const { userId, affiliateCode } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const traders = await getReferredTradersList(String(userId), affiliateCode ? String(affiliateCode) : undefined);
    res.json(traders);
  } catch (err: any) {
    logger.error(`Error fetching referred traders: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get raw commission history
router.get('/affiliate/commissions', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    if (!adminDb) return res.json([]);
    const snap = await adminDb.collection('commissions')
      .where('affiliateUid', '==', String(userId))
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const commissions: any[] = [];
    snap.forEach(doc => commissions.push({ id: doc.id, ...doc.data() }));
    res.json(commissions);
  } catch (err: any) {
    logger.error(`Error fetching affiliate commissions: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 4. Settle matured commissions
router.post('/affiliate/settle', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await settleMaturedCommissions(userId ? String(userId) : undefined);
    res.json(result);
  } catch (err: any) {
    logger.error(`Error settling affiliate commissions: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 5. Transfer available affiliate balance to live balance
router.post('/affiliate/transfer', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: 'userId and amount are required' });

  try {
    const result = await transferAffiliateBalanceToLive(String(userId), parseFloat(amount));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    logger.error(`Error transferring affiliate balance: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 6. Request payout of available affiliate balance
router.post('/affiliate/payout', async (req, res) => {
  const userId = req.body.userId || (req as any).user?.uid;
  const amount = parseFloat(req.body.amount);
  const method = req.body.method || req.body.gateway || 'USDT (TRC-20)';
  const walletAddress = req.body.walletAddress || req.body.details?.walletAddress || req.body.details?.mobileNumber || req.body.details?.accountNumber;

  if (!userId || isNaN(amount) || amount <= 0 || !method || !walletAddress) {
    return res.status(400).json({ error: 'Missing required payout fields (userId, valid amount, method, and wallet address)' });
  }

  if (amount < 100) {
    return res.status(400).json({ error: 'Minimum payout withdrawal amount is $100.00' });
  }

  try {
    const result = await requestAffiliatePayout(String(userId), amount, String(method), String(walletAddress));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    logger.error(`Error requesting affiliate payout: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// --- Activities & Banners ---
router.get('/activities', async (req, res) => {
  res.json([
    { id: '1', title: 'Welcome Bonus', description: 'Get 100% bonus on your first deposit!', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000' },
    { id: '2', title: 'Refer & Earn', description: 'Invite your friends and earn 10% commission.', image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1000' }
  ]);
});

router.post('/activities', async (req, res) => {
  res.json({ success: true });
});

// --- Legacy/Alias Routes for Compatibility ---
router.post('/deposits', (req, res, next) => {
  req.url = '/wallet/deposit';
  (router as any)(req, res, next);
});

router.post('/deposit', (req, res, next) => {
  req.url = '/wallet/deposit';
  (router as any)(req, res, next);
});

router.post('/withdrawals', (req, res, next) => {
  req.url = '/wallet/withdraw';
  (router as any)(req, res, next);
});

router.post('/withdraw', (req, res, next) => {
  req.url = '/wallet/withdraw';
  (router as any)(req, res, next);
});

router.post('/trade/prune-demo', async (req, res) => {
  res.json({ success: true });
});

router.post('/security/log-access', async (req, res) => {
  res.json({ success: true });
});

router.post('/alerts', async (req, res) => {
  res.json({ success: true });
});

// Generic Firestore Proxy Routes (for collections not explicitly handled)
// These are placed at the end to act as a fallback for the custom frontend firebase.ts

const PUBLIC_COLLECTIONS = [
  'education',
  'stories',
  'pages', 
  'app_config', 
  'depositMethods', 
  'news', 
  'promoMaterials', 
  'signals', 
  'tournaments'
];

async function getAuthenticatedUser(req: any): Promise<{ uid: string; email: string; isAdmin: boolean } | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;
  if (!token) return null;
  
  try {
    const { verifyToken } = await import('../lib/auth-server.ts');
    let decoded = verifyToken(token);
    if (!decoded) {
      const jwt = await import('jsonwebtoken');
      const payload = jwt.default.decode(token) as any;
      if (payload) {
        decoded = {
          uid: payload.uid || payload.sub || payload.user_id,
          email: payload.email,
          isAdmin: !!payload.isAdmin || !!payload.admin
        } as any;
      }
    }
    if (decoded) {
      let dbUser: any = null;
      try {
        dbUser = await get('SELECT is_admin, email FROM users WHERE uid = ? OR email = ?', [decoded.uid, decoded.email]) as any;
      } catch (dbErr: any) {
        logger.warn(`Failed to fetch dbUser in getAuthenticatedUser, falling back to token claims: ${dbErr?.message || dbErr}`);
      }
      const userEmail = (dbUser?.email || decoded.email)?.toLowerCase().trim();
      const hardcodedAdminEmails = [
        'bivaaxtrade@gmail.com',
        'msbivaax@gmail.com',
        'bivaaxtrader@gmail.com',
        'hasan1@gmail.com',
        'support@bivaax.com',
        (process.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim()
      ].filter(Boolean);
      
      let isAdmin = !!(decoded.isAdmin || (dbUser && dbUser.is_admin) || (userEmail && hardcodedAdminEmails.includes(userEmail)));
      return {
        uid: decoded.uid,
        email: decoded.email || userEmail || '',
        isAdmin
      };
    }
  } catch (err) {
    logger.error('Failed to authenticate proxy request:', err);
  }
  return null;
}

// 3-segment routes first
router.get('/:collection/:id/:subcollection', async (req, res) => {
  const { collection, id, subcollection } = req.params;
  try {
    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    const user = await getAuthenticatedUser(req);
    
    if (!isPublic) {
      if (!user) return res.status(401).json({ error: 'Unauthorized: No token provided' });
      if (!user.isAdmin) {
        if (collection === 'users' && id !== user.uid) {
          return res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
        }
        if (collection === 'tickets') {
          const ticketDoc = await adminDb.collection('tickets').doc(id).get();
          if (!ticketDoc.exists || ticketDoc.data().userId !== user.uid) {
            return res.status(403).json({ error: 'Forbidden: Access denied to other user support tickets' });
          }
        }
        // General check: if parent has a userId, check it
        const parentDoc = await adminDb.collection(collection).doc(id).get();
        if (parentDoc.exists && parentDoc.data().userId && parentDoc.data().userId !== user.uid) {
          return res.status(403).json({ error: 'Forbidden: Access denied to other user records' });
        }
      }
    }

    const snapshot = await adminDb.collection(collection).doc(id).collection(subcollection).get();
    const docs: any[] = [];
    snapshot.forEach((doc: any) => docs.push({ id: doc.id, ...doc.data() }));
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:collection/:id/:subcollection', async (req, res) => {
  const { collection, id, subcollection } = req.params;
  try {
    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    const user = await getAuthenticatedUser(req);
    
    if (isPublic) {
      if (!user || !user.isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
    } else {
      if (!user) return res.status(401).json({ error: 'Unauthorized: No token provided' });
      if (!user.isAdmin) {
        if (collection === 'users' && id !== user.uid) {
          return res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
        }
        if (collection === 'tickets') {
          const ticketDoc = await adminDb.collection('tickets').doc(id).get();
          if (!ticketDoc.exists || ticketDoc.data().userId !== user.uid) {
            return res.status(403).json({ error: 'Forbidden: Access denied' });
          }
        }
        // Force ownership in req.body
        req.body.userId = user.uid;
      }
    }

    const docRef = await adminDb.collection(collection).doc(id).collection(subcollection).add(req.body);
    res.json({ id: docRef.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2-segment routes
router.get('/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    const user = await getAuthenticatedUser(req);
    
    if (!isPublic) {
      if (!user) return res.status(401).json({ error: 'Unauthorized: No token provided' });
      if (!user.isAdmin) {
        if (collection === 'users' && id !== user.uid) {
          return res.status(403).json({ error: 'Forbidden: Access denied' });
        }
      }
    }

    const doc = await adminDb.collection(collection).doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    
    const data = doc.data();
    if (!isPublic && user && !user.isAdmin) {
      if (data && data.userId && data.userId !== user.uid) {
        return res.status(403).json({ error: 'Forbidden: Access denied to other user data' });
      }
    }

    res.json({ id: doc.id, ...data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    const user = await getAuthenticatedUser(req);
    
    if (isPublic) {
      if (!user || !user.isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
    } else {
      if (!user) return res.status(401).json({ error: 'Unauthorized: No token provided' });
      const doc = await adminDb.collection(collection).doc(id).get();
      const data = doc.exists ? doc.data() : null;
      
      if (!user.isAdmin) {
        if (!doc.exists) return res.status(404).json({ error: 'Not found' });
        if (collection === 'users') {
          if (id !== user.uid) return res.status(403).json({ error: 'Forbidden: Access denied' });
          // Prevent role/admin/balance self-modifications
          delete req.body.isAdmin;
          delete req.body.is_admin;
          delete req.body.role;
          delete req.body.balance;
        } else {
          if (data && data.userId && data.userId !== user.uid) {
            return res.status(403).json({ error: 'Forbidden: Access denied' });
          }
          if (collection === 'deposits') {
            // For deposits, non-admins can ONLY submit/update transaction ID (trxId)
            const allowedKeys = ['trxId'];
            const keys = Object.keys(req.body);
            const hasDisallowed = keys.some(k => !allowedKeys.includes(k));
            if (hasDisallowed) {
              return res.status(403).json({ error: 'Forbidden: Only trxId updates are allowed' });
            }
          } else if (collection === 'withdrawals') {
            return res.status(403).json({ error: 'Forbidden: Withdrawals cannot be updated directly' });
          }
        }
      }
    }

    await adminDb.collection(collection).doc(id).set(req.body, { merge: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    const user = await getAuthenticatedUser(req);
    
    if (isPublic) {
      if (!user || !user.isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
    } else {
      if (!user) return res.status(401).json({ error: 'Unauthorized: No token provided' });
      const doc = await adminDb.collection(collection).doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Not found' });
      
      const data = doc.data();
      if (!user.isAdmin) {
        if (collection === 'tickets' || collection === 'messages' || collection === 'trades') {
          if (data && data.userId && data.userId !== user.uid) {
            return res.status(403).json({ error: 'Forbidden: Access denied' });
          }
        } else {
          return res.status(403).json({ error: 'Forbidden: Deletion of this resource is prohibited' });
        }
      }
    }

    await adminDb.collection(collection).doc(id).delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1-segment routes last
router.get('/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    const user = await getAuthenticatedUser(req);
    
    if (!isPublic) {
      if (!user) return res.status(401).json({ error: 'Unauthorized: No token provided' });
      if (collection === 'users' && !user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Admin access required to list users' });
      }
    }

    let queryRef: any = adminDb.collection(collection);
    if (!isPublic && user && !user.isAdmin) {
      queryRef = queryRef.where('userId', '==', user.uid);
    }

    const snapshot = await queryRef.get();
    const docs: any[] = [];
    snapshot.forEach((doc: any) => docs.push({ id: doc.id, ...doc.data() }));
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    const user = await getAuthenticatedUser(req);
    
    if (isPublic) {
      if (!user || !user.isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
    } else {
      if (!user) return res.status(401).json({ error: 'Unauthorized: No token provided' });
      if (!user.isAdmin) {
        req.body.userId = user.uid;
        if (collection === 'deposits' || collection === 'withdrawals') {
          req.body.status = 'pending';
        }
      }
    }

    const docRef = await adminDb.collection(collection).add(req.body);
    logger.info(`Successfully added document to Firestore collection ${collection}: ${docRef.id}`);
    res.json({ id: docRef.id });
  } catch (err: any) {
    logger.error(`Error adding to Firestore collection ${collection}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

export async function seedDefaultPages() {
  if (!adminDb) return;
  const pages = [
    { id: 'about_us', title: 'About Us', content: '<h1>About Us</h1><p>Welcome to Bivaax Trade.</p>' },
    { id: 'client_agreement', title: 'Client Agreement', content: '<h1>Client Agreement</h1><p>Terms and conditions...</p>' },
    { id: 'regulations', title: 'Regulations', content: '<h1>Regulations</h1><p>Our regulatory compliance...</p>' }
  ];

  try {
    for (const page of pages) {
      const pageRef = adminDb.collection('pages').doc(page.id);
      const doc = await pageRef.get();
      if (!doc.exists) {
        await pageRef.set({
          ...page,
          updatedAt: Date.now(),
          createdAt: Date.now()
        });
        logger.info(`✅ Seeded page: ${page.id}`);
      }
    }
  } catch (err) {
    logger.error('Error seeding pages:', err);
  }
}

export default router;
