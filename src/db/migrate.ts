import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index.ts';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { drizzle } from 'drizzle-orm/postgres-js';

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is missing. Cannot migrate.');
    return;
  }

  console.log('🔄 Running migrations...');
  
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const migrationDb = drizzle(migrationClient, { schema });

  try {
    await migrate(migrationDb, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await migrationClient.end();
  }
}

runMigration();
