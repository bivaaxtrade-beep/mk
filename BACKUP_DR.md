# Bivaax Trade - Backup & Disaster Recovery Guide

This document outlines the procedures for backing up and restoring the Bivaax Trade application database.

## 1. Automated Backups
- **Frequency**: Daily at 03:00 AM server time.
- **Location**: 
  - Local VPS: `/app/applet/backups/`
  - Off-site: Cloud Firestore (`system_backups` and `system_backup_contents` collections).
- **Retention**: Last 20 backups are kept in history.

## 2. Manual Backup (via Admin Panel)
1. Login as **Admin**.
2. Navigate to **Admin Dashboard > Database Settings**.
3. Click **"Backup Now"**.
4. The system will generate a logical SQL dump and sync it to the cloud.

## 3. Manual Restoration using `psql` (CLI)
If the application is inaccessible and you need to restore via terminal:

1. Locate your latest backup file in the `backups/` directory.
2. Ensure the PostgreSQL client is installed on your VPS.
3. Run the following command:

```bash
# Set your DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:port/dbname"

# Restore from the SQL file
psql $DATABASE_URL < backups/backup_1724144000000.sql
```

**Note**: Restoration will append data or update existing records based on Primary Keys. To perform a clean wipe before restore, you must manually DROP and CREATE the database.

## 4. Disaster Recovery Scenarios
- **VPS Loss**: Re-deploy the app, and use the "Emergency Restore" button in the admin panel to pull data from Cloud Firestore.
- **Data Corruption**: Identify the last healthy backup from the history and click "Restore".

## 5. Notification
If an automated backup fails, an error will be logged in the system logs and visible in the Admin Backup History with a "failed" status.
