import { run } from '../db/mysql-db.ts';
import logger from './logger.ts';

export async function createAuditLog(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: any,
  ipAddress?: string
) {
  try {
    const logType = action || entityType || 'general';
    const now = Date.now();
    await run(
      `INSERT INTO audit_logs (user_id, action, type, entity_type, entity_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, logType, entityType || null, entityId || null, details ? JSON.stringify(details) : null, ipAddress || null, now]
    );
  } catch (err) {
    logger.error('Failed to create audit log:', err);
  }
}

export async function logLogin(userId: string, ipAddress?: string, userAgent?: string, status: string = 'success') {
  try {
    const now = Date.now();
    await run(
      `INSERT INTO login_history (user_id, ip_address, user_agent, status, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, ipAddress, userAgent, status, now]
    );
  } catch (err) {
    logger.error('Failed to log login:', err);
  }
}

