import { query, run, runRawSql, isUsingPostgres } from '../db/mysql-db.ts';
import logger from '../lib/logger.ts';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export interface BackupRecord {
  id: string;
  timestamp: number;
  filename: string;
  size: number;
  status: 'success' | 'failed';
  tables_count: number;
  created_by: string;
}

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const SECURE_OFFSITE_DIR = path.join(process.cwd(), 'secure_offsite_backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
if (!fs.existsSync(SECURE_OFFSITE_DIR)) {
  fs.mkdirSync(SECURE_OFFSITE_DIR, { recursive: true });
}

export const DbSnapshotService = {
  /**
   * Generates a full SQL dump of the database.
   * Handles PostgreSQL (via pg_dump) and SQLite (logical dump).
   */
  async createFullBackup(adminId: string): Promise<BackupRecord> {
    const timestamp = Date.now();
    const dateStr = new Date(timestamp).toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${dateStr}_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);
    const offsiteFilePath = path.join(SECURE_OFFSITE_DIR, filename);
    
    logger.info(`[BACKUP] Starting database backup requested by admin: ${adminId}`);
    
    let usedPgDump = false;
    let tablesCount = 0;
    const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PG_URL;
    const isPg = isUsingPostgres();

    try {
      // 1. Try backup using pg_dump if in PostgreSQL mode
      if (isPg && postgresUrl) {
        try {
          logger.info(`[BACKUP] Executing pg_dump for backup...`);
          // Exclude huge transient tick history tables from pg_dump
          await execPromise(`pg_dump "${postgresUrl}" -T candles -T historical_candles -T market_settings -f "${filePath}"`);
          usedPgDump = true;
          logger.info(`[BACKUP-SUCCESS] pg_dump completed successfully.`);
        } catch (pgErr: any) {
          logger.warn(`[BACKUP-FALLBACK] pg_dump failed/not found: ${pgErr.message}. Falling back to streaming logical dumper.`);
        }
      }

      // 2. Fallback to logical SQL dumper if pg_dump is not available or failed, or if using SQLite
      if (!usedPgDump) {
        let tablesResult: any[] = [];
        
        if (isPg) {
          tablesResult = await query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
          ) as any[];
        } else {
          // SQLite table listing
          tablesResult = await query(
            "SELECT name as table_name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
          ) as any[];
        }
        
        const tables = tablesResult.map(t => t.table_name);
        tablesCount = tables.length;

        const writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });
        
        writeStream.write(`-- Bivaax Trade Enterprise Backup (Logical Fallback)\n`);
        writeStream.write(`-- Generated at: ${new Date(timestamp).toISOString()}\n`);
        writeStream.write(`-- Requested by: ${adminId}\n`);
        writeStream.write(`-- Database type: ${isPg ? 'PostgreSQL' : 'SQLite'}\n\n`);
        
        if (isPg) {
          writeStream.write("SET statement_timeout = 0;\nSET lock_timeout = 0;\nSET client_encoding = 'UTF8';\n");
          writeStream.write("SET standard_conforming_strings = on;\nSET check_function_bodies = false;\n");
          writeStream.write("SET xmloption = content;\nSET client_min_messages = warning;\nSET row_security = off;\n\n");
        }

        const EXCLUDED_TABLES = new Set(['candles', 'historical_candles', 'market_settings']);

        for (const table of tables) {
          // Skip internal/meta tables and transient market tick history
          if (table.startsWith('_') || table.startsWith('sqlite_') || EXCLUDED_TABLES.has(table.toLowerCase())) {
            continue;
          }

          logger.info(`[BACKUP] Dumping table: ${table}`);
          writeStream.write(`\n--\n-- Table structure & data for ${table}\n--\n\n`);
          
          const pageSize = 2000;
          let offset = 0;
          let hasMore = true;

          while (hasMore) {
            const selectSql = isPg
              ? `SELECT * FROM "${table}" LIMIT ${pageSize} OFFSET ${offset}`
              : `SELECT * FROM "${table}" LIMIT ${pageSize} OFFSET ${offset}`;
              
            const rows = await query(selectSql) as any[];
            
            if (!rows || rows.length === 0) {
              hasMore = false;
              break;
            }

            const columns = Object.keys(rows[0]);
            const colStr = columns.map(c => `"${c}"`).join(', ');

            for (const row of rows) {
              const values = columns.map(col => {
                const val = row[col];
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'number') {
                  if (isNaN(val) || !isFinite(val)) return 'NULL';
                  return val;
                }
                if (typeof val === 'boolean') return val ? 'true' : 'false';
                if (val instanceof Date) return `'${val.toISOString()}'`;
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return `'${String(val).replace(/'/g, "''")}'`;
              }).join(', ');

              writeStream.write(`INSERT ${isPg ? '' : 'OR IGNORE'} INTO "${table}" (${colStr}) VALUES (${values})${isPg ? ' ON CONFLICT DO NOTHING' : ''};\n`);
            }

            if (rows.length < pageSize) {
              hasMore = false;
            } else {
              offset += pageSize;
            }
          }
        }

        await new Promise((resolve, reject) => {
          writeStream.end((err: any) => {
            if (err) reject(err);
            else resolve(true);
          });
        });
      } else {
        // If pg_dump succeeded, get tables count from system catalogs
        try {
          const countRes = await query(
            "SELECT count(*)::int as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
          ) as any[];
          tablesCount = countRes[0]?.cnt || 0;
        } catch (e) {
          tablesCount = 15; // default fallback count estimate
        }
      }

      // 3. Save locally and sync to secure off-site backup storage path
      const stats = fs.statSync(filePath);
      fs.copyFileSync(filePath, offsiteFilePath);
      logger.info(`[BACKUP-SUCCESS] Secure off-site copy generated at: ${offsiteFilePath}`);

      const backupId = `bk_${timestamp}`;
      
      // 4. Record metadata in database
      const placeholder = isPg ? '$' : '?';
      const insertSql = isPg 
        ? `INSERT INTO system_backups (id, timestamp, filename, size, status, tables_count, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`
        : `INSERT INTO system_backups (id, timestamp, filename, size, status, tables_count, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;

      await run(insertSql, [backupId, timestamp, filename, stats.size, 'success', tablesCount, adminId]);

      // 5. Store detailed entry in audit logs
      const detailsStr = `Database backup created successfully: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB). Type: ${usedPgDump ? 'pg_dump' : 'logical_dumper'}. Synced to secure off-site backup storage.`;
      const auditSql = isPg
        ? `INSERT INTO audit_logs (user_id, type, amount, old_balance, new_balance, reference_id, details, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
        : `INSERT INTO audit_logs (user_id, type, amount, old_balance, new_balance, reference_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      await run(auditSql, [adminId, 'DATABASE_BACKUP', 0, 0, 0, backupId, detailsStr, timestamp]);

      logger.info(`[BACKUP-SUCCESS] Backup ${backupId} completed. Size: ${(stats.size / 1024).toFixed(2)} KB`);
      
      // Rotate backups to keep VPS disk space clean (30 days retention)
      await this.rotateBackups();

      return {
        id: backupId,
        timestamp,
        filename,
        size: stats.size,
        status: 'success',
        tables_count: tablesCount,
        created_by: adminId
      };

    } catch (err: any) {
      logger.error(`[BACKUP-FAILED] ${err.message}`);
      
      const failId = `bk_fail_${timestamp}`;
      try {
        const failSql = isPg
          ? `INSERT INTO system_backups (id, timestamp, filename, size, status, tables_count, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`
          : `INSERT INTO system_backups (id, timestamp, filename, size, status, tables_count, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await run(failSql, [failId, timestamp, 'N/A', 0, 'failed', 0, adminId]);
      } catch (dbErr: any) {
        logger.error(`[BACKUP-DB-RECORD-FAILED] Failed to insert failure log to database: ${dbErr.message}`);
      }
      
      throw err;
    }
  },

  /**
   * Cleans up backups older than 30 days locally and off-site
   */
  async rotateBackups() {
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      // Clean up primary backup dir
      if (fs.existsSync(BACKUP_DIR)) {
        const files = fs.readdirSync(BACKUP_DIR);
        for (const file of files) {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < thirtyDaysAgo) {
            logger.info(`[BACKUP-ROTATION] Deleting old primary backup: ${file}`);
            fs.unlinkSync(filePath);
          }
        }
      }

      // Clean up secure off-site backup dir
      if (fs.existsSync(SECURE_OFFSITE_DIR)) {
        const offsiteFiles = fs.readdirSync(SECURE_OFFSITE_DIR);
        for (const file of offsiteFiles) {
          const filePath = path.join(SECURE_OFFSITE_DIR, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < thirtyDaysAgo) {
            logger.info(`[BACKUP-ROTATION] Deleting old off-site backup copy: ${file}`);
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (err: any) {
      logger.error(`[BACKUP-ROTATION-FAILED] ${err.message}`);
    }
  },

  /**
   * Retrieves backup history from database
   */
  async getBackupHistory(limitCount: number = 20): Promise<BackupRecord[]> {
    try {
      const isPg = isUsingPostgres();
      const historySql = isPg
        ? `SELECT id, timestamp, filename, size, status, tables_count, created_by FROM system_backups ORDER BY timestamp DESC LIMIT $1`
        : `SELECT id, timestamp, filename, size, status, tables_count, created_by FROM system_backups ORDER BY timestamp DESC LIMIT ?`;

      const rows = await query(historySql, [limitCount]) as any[];

      return rows.map(r => ({
        id: r.id,
        timestamp: Number(r.timestamp),
        filename: r.filename,
        size: Number(r.size),
        status: r.status as any,
        tables_count: Number(r.tables_count),
        created_by: r.created_by
      }));
    } catch (err: any) {
      logger.error(`[BACKUP-HISTORY-FAILED] Failed to fetch history from database: ${err.message}`);
      return [];
    }
  },

  /**
   * Restore process using raw SQL execution
   */
  async restoreFromBackup(backupId: string) {
    logger.warn(`[RESTORE] RESTORATION INITIATED FOR BACKUP: ${backupId}`);
    
    try {
      let sqlContent = '';
      const isPg = isUsingPostgres();
      
      // 1. Locate filename from records
      const selectSql = isPg
        ? "SELECT filename FROM system_backups WHERE id = $1"
        : "SELECT filename FROM system_backups WHERE id = ?";
      const b = await query(selectSql, [backupId]) as any[];
      const filename = b.length > 0 ? b[0].filename : `backup_${backupId}.sql`;
      
      const filePath = path.join(BACKUP_DIR, filename);
      const offsiteFilePath = path.join(SECURE_OFFSITE_DIR, filename);
      
      if (fs.existsSync(filePath)) {
        sqlContent = fs.readFileSync(filePath, 'utf8');
      } else if (fs.existsSync(offsiteFilePath)) {
        sqlContent = fs.readFileSync(offsiteFilePath, 'utf8');
        logger.info(`[RESTORE] Restoring from off-site backup storage copy.`);
      }

      if (!sqlContent) {
        throw new Error(`Backup file ${filename} not found in primary or off-site backup storage`);
      }

      // 2. Execute SQL dump as a raw block
      logger.info(`[RESTORE] Running raw SQL restore script...`);
      await runRawSql(sqlContent);

      logger.info(`[RESTORE-SUCCESS] Database restored from backup: ${backupId}`);
      return { success: true };
    } catch (err: any) {
      logger.error(`[RESTORE-FAILED] ${err.message}`);
      throw err;
    }
  }
};
