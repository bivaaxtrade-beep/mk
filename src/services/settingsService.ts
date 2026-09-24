import { get, run, query } from '../db/mysql-db.ts';
import { adminDb } from '../lib/firebase-admin.ts';
import logger from '../lib/logger.ts';

// In-memory cache for fast read access
let settingsCache: Record<string, any> = {};
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds

/**
 * Initialize and load settings from PostgreSQL database into memory
 */
export async function initSettings(): Promise<Record<string, any>> {
  try {
    const rows = await query('SELECT key, value FROM app_settings') as Array<{ key: string; value: string }>;
    const result: Record<string, any> = {};
    
    if (rows && rows.length > 0) {
      for (const row of rows) {
        try {
          result[row.key] = JSON.parse(row.value);
        } catch {
          result[row.key] = row.value;
        }
      }
    }

    // If PostgreSQL app_settings is empty, try to hydrate from Firestore if available
    if (Object.keys(result).length === 0 && adminDb) {
      try {
        const snap = await adminDb.collection('app_config').doc('settings').get();
        if (snap.exists) {
          const fsData = snap.data() || {};
          await saveAppSettings(fsData, false);
          Object.assign(result, fsData);
          logger.info('Hydrated PostgreSQL app_settings from Firestore settings document');
        }
      } catch (fsErr: any) {
        logger.warn(`Could not hydrate settings from Firestore: ${fsErr.message}`);
      }
    }

    settingsCache = { ...result };
    lastFetchTime = Date.now();
    return settingsCache;
  } catch (err: any) {
    logger.warn(`Could not load app_settings from database (${err.message}). Using cache/defaults.`);
    return settingsCache;
  }
}

/**
 * Get all current application settings
 */
export async function getAllAppSettings(): Promise<Record<string, any>> {
  const now = Date.now();
  if (now - lastFetchTime > CACHE_TTL_MS || Object.keys(settingsCache).length === 0) {
    await initSettings();
  }
  return settingsCache;
}

/**
 * Get a specific setting by key
 */
export async function getAppSetting<T = any>(key: string, defaultValue: T | null = null): Promise<T | null> {
  const settings = await getAllAppSettings();
  if (key in settings && settings[key] !== undefined && settings[key] !== null) {
    return settings[key] as T;
  }
  return defaultValue;
}

/**
 * Set a single setting in PostgreSQL and sync to Firestore
 */
export async function setAppSetting(key: string, value: any): Promise<void> {
  const now = Date.now();
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  
  try {
    await run(
      `INSERT INTO app_settings (key, value, updated_at, created_at) 
       VALUES (?, ?, ?, ?) 
       ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, valueStr, now, now]
    );
  } catch (err: any) {
    // Fallback for SQLite syntax if ON CONFLICT syntax differs
    try {
      await run(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at, created_at) VALUES (?, ?, ?, ?)`,
        [key, valueStr, now, now]
      );
    } catch (e: any) {
      logger.error(`Failed to save setting "${key}" to PostgreSQL: ${e.message}`);
    }
  }

  // Update in-memory cache
  settingsCache[key] = value;
  lastFetchTime = Date.now();

  // Sync to Firestore for real-time client listeners
  if (adminDb) {
    try {
      await adminDb.collection('app_config').doc('settings').set({ [key]: value }, { merge: true });
    } catch (fsErr: any) {
      logger.warn(`Failed to sync setting "${key}" to Firestore: ${fsErr.message}`);
    }
  }
}

/**
 * Save multiple settings in batch directly to PostgreSQL and sync to Firestore
 */
export async function saveAppSettings(settings: Record<string, any>, syncFirestore = true): Promise<void> {
  if (!settings || typeof settings !== 'object') return;

  const now = Date.now();

  for (const [key, value] of Object.entries(settings)) {
    if (value === undefined) continue;
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    
    try {
      await run(
        `INSERT INTO app_settings (key, value, updated_at, created_at) 
         VALUES (?, ?, ?, ?) 
         ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        [key, valueStr, now, now]
      );
    } catch (err: any) {
      try {
        await run(
          `INSERT OR REPLACE INTO app_settings (key, value, updated_at, created_at) VALUES (?, ?, ?, ?)`,
          [key, valueStr, now, now]
        );
      } catch (e: any) {
        logger.error(`Failed to batch save setting "${key}" to PostgreSQL: ${e.message}`);
      }
    }
    settingsCache[key] = value;
  }

  lastFetchTime = Date.now();

  // Dual sync to Firestore
  if (syncFirestore && adminDb) {
    try {
      await adminDb.collection('app_config').doc('settings').set(settings, { merge: true });
    } catch (fsErr: any) {
      logger.warn(`Failed to batch sync settings to Firestore: ${fsErr.message}`);
    }
  }
}
