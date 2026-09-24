import { db, sqlite, schema, pgClient } from './index.ts';
import { sql as drizzleSql } from 'drizzle-orm';
import logger from '../lib/logger.ts';

const usePg = !!process.env.DATABASE_URL;

export function isUsingPostgres(): boolean {
  return usePg;
}

function convertSqlForPg(sql: any): string {
  if (typeof sql !== 'string') {
    if (sql && typeof sql.toSQL === 'function') {
      try {
        const sqlObj = sql.toSQL();
        sql = sqlObj.sql || '';
      } catch (e) {
        sql = String(sql || '');
      }
    } else if (sql && sql.sql) {
      sql = sql.sql;
    } else {
      sql = String(sql || '');
    }
  }

  // Handle SQLite INSERT OR IGNORE -> PostgreSQL ON CONFLICT DO NOTHING
  let normalizedSql = sql.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
  const isInsertOrIgnore = /INSERT\s+OR\s+IGNORE\s+INTO/gi.test(sql);

  // Convert ? to $1, $2, etc.
  let paramIndex = 1;
  let result = '';
  let inString = false;
  for (let i = 0; i < normalizedSql.length; i++) {
    const char = normalizedSql[i];
    if (char === "'") inString = !inString;
    if (char === '?' && !inString) {
      result += `$${paramIndex++}`;
    } else {
      result += char;
    }
  }

  // Handle common SQLite functions
  result = result.replace(/datetime\('now'\)/gi, 'NOW()')
                 .replace(/IFNULL\(/gi, 'COALESCE(');

  if (isInsertOrIgnore && !/ON\s+CONFLICT/i.test(result)) {
    // Attempt to guess the unique column for ON CONFLICT
    if (/users/i.test(result)) result += ' ON CONFLICT (uid) DO NOTHING';
    else if (/candles/i.test(result)) result += ' ON CONFLICT (pair, type, time) DO NOTHING';
    else result += ' ON CONFLICT DO NOTHING';
  }

  return result;
}

// Auto-initialize tables if they don't exist
function initTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      display_name TEXT,
      nickname TEXT,
      photo_url TEXT,
      password_hash TEXT,
      real_balance NUMERIC DEFAULT '0.00',
      demo_balance NUMERIC DEFAULT '10000.00',
      currency TEXT DEFAULT 'USD',
      tfa_enabled BOOLEAN DEFAULT 0,
      tfa_mode TEXT DEFAULT 'app',
      tfa_secret TEXT,
      is_verified BOOLEAN DEFAULT 0,
      is_email_verified BOOLEAN DEFAULT 0,
      is_nid_verified BOOLEAN DEFAULT 0,
      nid_number TEXT,
      is_admin BOOLEAN DEFAULT 0,
      phone TEXT,
      country TEXT,
      country_code TEXT,
      first_name TEXT,
      last_name TEXT,
      gender TEXT,
      dob TEXT,
      birth_day TEXT,
      birth_month TEXT,
      birth_year TEXT,
      time_zone TEXT,
      language TEXT,
      newsletter BOOLEAN DEFAULT 1,
      allow_notifications BOOLEAN DEFAULT 1,
      status TEXT DEFAULT 'Standard',
      kyc_status TEXT DEFAULT 'unverified',
      referred_by_uid TEXT,
      referral_code TEXT,
      referral_sub_id TEXT,
      referral_type TEXT,
      affiliate_balance NUMERIC DEFAULT '0.00',
      total_affiliate_earnings NUMERIC DEFAULT '0.00',
      referral_count INTEGER DEFAULT 0,
      custom_affiliate_share INTEGER,
      withdrawal_otp TEXT,
      withdrawal_otp_expires_at BIGINT,
      total_live_volume NUMERIC DEFAULT '0.00',
      manipulation_mode TEXT DEFAULT 'neutral',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firebase_id TEXT,
      user_id TEXT NOT NULL,
      market_id TEXT NOT NULL,
      asset TEXT,
      amount NUMERIC NOT NULL,
      direction TEXT NOT NULL,
      type TEXT,
      entry_price NUMERIC NOT NULL,
      exit_price NUMERIC,
      duration INTEGER NOT NULL,
      time_left INTEGER,
      expiry_time BIGINT NOT NULL,
      expiration_time TEXT,
      is_demo BOOLEAN DEFAULT 1,
      account_type TEXT DEFAULT 'demo',
      tournament_id TEXT,
      status TEXT DEFAULT 'open',
      target_result TEXT,
      payout_amount NUMERIC,
      payout TEXT,
      settled_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      method TEXT DEFAULT 'direct',
      tx_hash TEXT,
      details TEXT, 
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'success',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS kyc_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      full_name TEXT,
      document_type TEXT,
      document_number TEXT,
      front_image TEXT,
      back_image TEXT,
      selfie_image TEXT,
      rejection_reason TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_email TEXT,
      subject TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      message TEXT,
      last_message TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'medium',
      assigned_agent_id TEXT,
      assigned_agent_name TEXT,
      assigned_agent_email TEXT,
      channel TEXT DEFAULT 'chat',
      rating INTEGER,
      rating_feedback TEXT,
      is_ai_handled BOOLEAN DEFAULT 1,
      closed_at BIGINT,
      first_response_at BIGINT,
      resolved_at BIGINT,
      updated_at BIGINT,
      created_at BIGINT
    )`,
    `CREATE TABLE IF NOT EXISTS ticket_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      sender_type TEXT DEFAULT 'user',
      sender_name TEXT,
      message TEXT NOT NULL,
      attachments TEXT,
      is_internal_note BOOLEAN DEFAULT 0,
      is_admin BOOLEAN DEFAULT 0,
      is_read BOOLEAN DEFAULT 0,
      created_at BIGINT
    )`,
    `CREATE TABLE IF NOT EXISTS candles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pair TEXT NOT NULL,
      type TEXT NOT NULL,
      time BIGINT NOT NULL,
      open NUMERIC NOT NULL,
      high NUMERIC NOT NULL,
      low NUMERIC NOT NULL,
      close NUMERIC NOT NULL,
      volume NUMERIC NOT NULL,
      UNIQUE(pair, type, time)
    )`,
    `CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      description TEXT,
      prize_pool NUMERIC DEFAULT '0.00',
      entry_fee NUMERIC DEFAULT '0.00',
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      status TEXT DEFAULT 'upcoming',
      type TEXT DEFAULT 'daily',
      rules TEXT,
      participant_count INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS master_traders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT,
      win_rate INTEGER DEFAULT 0,
      profit NUMERIC DEFAULT '0.00',
      followers INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS active_copies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      master_id TEXT NOT NULL,
      master_name TEXT,
      max_trade_amount NUMERIC DEFAULT '10.00',
      trades_limit INTEGER DEFAULT 0,
      copied_trades INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS affiliate_commissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_uid TEXT NOT NULL,
      referred_uid TEXT NOT NULL,
      trade_id INTEGER,
      amount NUMERIC NOT NULL,
      trade_amount NUMERIC DEFAULT 0,
      trade_status TEXT,
      percent NUMERIC DEFAULT 50,
      type TEXT DEFAULT 'trade_commission',
      sub_id TEXT DEFAULT 'default',
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      hold_until BIGINT NOT NULL,
      settled_at BIGINT,
      created_at BIGINT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS affiliate_payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      currency TEXT DEFAULT 'USD',
      gateway TEXT DEFAULT 'USDT',
      details TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    try {
      if (usePg) {
        // PG uses serial instead of autoincrement and different types
        let pgSql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
                         .replace(/DATETIME/gi, 'TIMESTAMP')
                         .replace(/BOOLEAN DEFAULT 0/gi, 'BOOLEAN DEFAULT FALSE')
                         .replace(/BOOLEAN DEFAULT 1/gi, 'BOOLEAN DEFAULT TRUE')
                         .replace(/CURRENT_TIMESTAMP/gi, 'NOW()');
        
        if (pgClient) {
          pgClient.unsafe(pgSql).then(() => logger.info(`✅ Table initialized in PG`)).catch((e: any) => {
            if (!e.message?.includes('already exists') && !e.message?.includes('42P07')) {
              logger.error('PG Init Table Error:', e);
            }
          });
        } else {
          db.execute(drizzleSql.raw(pgSql)).then(() => logger.info(`✅ Table initialized in PG`)).catch((e: any) => {
            if (!e.message?.includes('already exists') && !e.message?.includes('42P07')) {
              logger.error('PG Init Table Error:', e);
            }
          });
        }
      } else {
        sqlite.exec(sql);
        logger.info(`✅ Table initialized in SQLite`);
      }
    } catch (err: any) {
      if (!err.message?.includes('already exists') && !err.message?.includes('42P07')) {
        logger.error('Table initialization error:', err);
      }
    }
  }

  try {
    if (!usePg) {
      sqlite.exec("ALTER TABLE users ADD COLUMN admin_permissions TEXT");
    }
  } catch(e) {}

  // Support System Migrations
  const migrations = [
    // Tickets table
    { table: 'tickets', column: 'user_name', type: 'TEXT' },
    { table: 'tickets', column: 'user_email', type: 'TEXT' },
    { table: 'tickets', column: 'category', type: "TEXT DEFAULT 'General'" },
    { table: 'tickets', column: 'assigned_agent_id', type: 'TEXT' },
    { table: 'tickets', column: 'assigned_agent_name', type: 'TEXT' },
    { table: 'tickets', column: 'assigned_agent_email', type: 'TEXT' },
    { table: 'tickets', column: 'channel', type: "TEXT DEFAULT 'chat'" },
    { table: 'tickets', column: 'rating', type: 'INTEGER' },
    { table: 'tickets', column: 'rating_feedback', type: 'TEXT' },
    { table: 'tickets', column: 'is_ai_handled', type: 'BOOLEAN DEFAULT TRUE' },
    { table: 'tickets', column: 'closed_at', type: 'BIGINT' },
    { table: 'tickets', column: 'first_response_at', type: 'BIGINT' },
    { table: 'tickets', column: 'resolved_at', type: 'BIGINT' },
    // Ticket Messages table
    { table: 'ticket_messages', column: 'sender_type', type: "TEXT DEFAULT 'user'" },
    { table: 'ticket_messages', column: 'sender_name', type: 'TEXT' },
    { table: 'ticket_messages', column: 'attachments', type: 'TEXT' },
    { table: 'ticket_messages', column: 'is_internal_note', type: 'BOOLEAN DEFAULT FALSE' },
    { table: 'ticket_messages', column: 'is_read', type: 'BOOLEAN DEFAULT FALSE' }
  ];

  for (const m of migrations) {
    try {
      const sql = `ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type}`;
      if (usePg) {
        if (pgClient) {
          pgClient.unsafe(sql).catch(() => {});
        } else {
          db.execute(drizzleSql.raw(sql)).catch(() => {});
        }
      } else {
        sqlite.exec(sql);
      }
    } catch (e) {}
  }

  try {
    const adminEmails = [
      'bivaaxtrade@gmail.com',
      'msbivaax@gmail.com',
      'bivaaxtrader@gmail.com',
      'hasan1@gmail.com'
    ];
    for (const adminEmail of adminEmails) {
      if (usePg) {
        if (pgClient) {
          pgClient.unsafe(`UPDATE users SET is_admin = true WHERE LOWER(TRIM(email)) = '${adminEmail}'`).catch(() => {});
        }
      } else {
        sqlite.exec(`UPDATE users SET is_admin = 1 WHERE LOWER(TRIM(email)) = '${adminEmail}'`);
      }
    }
  } catch(e) {}
}

initTables();

export async function query(sql: any, params: any[] = [], conn?: any) {
  if (usePg) {
    try {
      const pgSql = convertSqlForPg(sql);
      const client = conn || pgClient;
      if (client && typeof client.unsafe === 'function') {
        const result = await client.unsafe(pgSql, params || []);
        return Array.from(result || []);
      }
      if (conn && typeof conn.query === 'function') {
        return conn.query(sql, params);
      }
      const executor = conn || db;
      const result = await (executor.execute ? executor.execute(drizzleSql.raw(pgSql)) : executor.query(pgSql, params));
      return Array.from(result as any) || [];
    } catch (err: any) {
      logger.error(`PostgreSQL Query Error: ${err.message} | SQL: ${sql} | Params: ${JSON.stringify(params)}`);
      throw err;
    }
  }
  const sqliteExecutor = conn || sqlite;
  return sqliteExecutor.prepare(sql).all(...params);
}

export async function get(sql: any, params: any[] = [], conn?: any) {
  if (usePg) {
    const rows = await query(sql, params, conn);
    return rows[0] || null;
  }
  const sqliteExecutor = conn || sqlite;
  return sqliteExecutor.prepare(sql).get(...params);
}

export async function run(sql: any, params: any[] = [], conn?: any) {
  if (usePg) {
    try {
      let pgSql = convertSqlForPg(sql);
      const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
      const hasReturning = /RETURNING\s+/i.test(pgSql);
      if (isInsert && !hasReturning) {
        pgSql = `${pgSql} RETURNING id`;
      }

      const client = conn || pgClient;
      if (client && typeof client.unsafe === 'function') {
        const result = await client.unsafe(pgSql, params || []);
        return {
          lastInsertRowid: result[0]?.id || 0,
          changes: result.count !== undefined ? result.count : ((result as any).length || 0),
          rows: Array.from(result || [])
        };
      }

      const res = await query(sql, params, conn);
      return {
        lastInsertRowid: res[0]?.id || 0,
        changes: (res as any).length || 0,
        rows: res
      };
    } catch (err: any) {
      logger.error(`PostgreSQL Run Error: ${err.message} | SQL: ${sql} | Params: ${JSON.stringify(params)}`);
      throw err;
    }
  }
  const sqliteExecutor = conn || sqlite;
  return sqliteExecutor.prepare(sql).run(...params);
}

export async function runRawSql(sql: string) {
  return query(sql);
}

let sqliteTransactionMutex = Promise.resolve();

export async function transaction<T>(cb: (tx: any) => Promise<T>): Promise<T> {
  if (usePg) {
    if (pgClient && typeof pgClient.begin === 'function') {
      return pgClient.begin(async (txSql: any) => {
        const txConn = {
          unsafe: (sql: any, params: any[] = []) => txSql.unsafe(convertSqlForPg(sql), params || []),
          query: (sql: any, params: any[] = []) => query(sql, params, txSql),
          execute: (sql: any, params: any[] = []) => query(sql, params, txSql),
          run: (sql: any, params: any[] = []) => run(sql, params, txSql),
          get: (sql: any, params: any[] = []) => get(sql, params, txSql),
          all: (sql: any, params: any[] = []) => query(sql, params, txSql),
          prepare: (sql: any) => ({
            all: (...params: any[]) => query(sql, params, txSql),
            get: (...params: any[]) => get(sql, params, txSql),
            run: (...params: any[]) => run(sql, params, txSql),
          })
        };
        return cb(txConn);
      });
    }

    return db.transaction(async (tx: any) => {
      const txConn = {
        query: (sql: any, params: any[] = []) => query(sql, params, tx),
        execute: (sql: any, params: any[] = []) => query(sql, params, tx),
        run: (sql: any, params: any[] = []) => run(sql, params, tx),
        get: (sql: any, params: any[] = []) => get(sql, params, tx),
        all: (sql: any, params: any[] = []) => query(sql, params, tx),
        prepare: (sql: any) => ({
          all: (...params: any[]) => query(sql, params, tx),
          get: (...params: any[]) => get(sql, params, tx),
          run: (...params: any[]) => run(sql, params, tx),
        })
      };
      return cb(txConn);
    });
  }
  
  // For SQLite, we MUST serialize transactions because better-sqlite3 is synchronous 
  // but our application logic (the callback) is asynchronous. 
  // Simultaneous async transactions on the same connection will interfere.
  
  const result = await new Promise<T>((resolve, reject) => {
    sqliteTransactionMutex = sqliteTransactionMutex.then(async () => {
      try {
        sqlite.exec('BEGIN TRANSACTION');
        const txConn = {
            ...sqlite,
            prepare: (sql: string) => sqlite.prepare(sql),
            exec: (sql: string) => sqlite.exec(sql),
            run: (sql: string, ...params: any[]) => sqlite.prepare(sql).run(...params),
            get: (sql: string, ...params: any[]) => sqlite.prepare(sql).get(...params),
            all: (sql: string, ...params: any[]) => sqlite.prepare(sql).all(...params),
        };
        const result = await cb(txConn);
        sqlite.exec('COMMIT');
        resolve(result);
      } catch (err) {
        try {
          sqlite.exec('ROLLBACK');
        } catch (rollbackErr) {
          // Rollback might fail if the error happened during BEGIN or COMMIT
        }
        reject(err);
      }
    }).catch((err) => {
      // Keep mutex chain alive even if a transaction fails
      if (typeof reject === 'function') reject(err);
    });
  });

  return result;
}

export async function updatePostgresConfig(newUrl: string): Promise<{ success: boolean; error?: string }> {
  // Since we use Drizzle now, this is a placeholder or we could re-initialize db
  logger.info("PostgreSQL configuration update requested. Please restart the app with the new DATABASE_URL.");
  return { success: true };
}

export { db, schema };

export const dbHelper = {
  query,
  get,
  run,
  transaction,
  isUsingPostgres,
  db,
  schema,
  updatePostgresConfig,
  runRawSql,
  prepare: (sql: string) => {
    return {
      all: (...params: any[]) => query(sql, params),
      get: (...params: any[]) => get(sql, params),
      run: (...params: any[]) => run(sql, params)
    };
  }
};

export default dbHelper;
