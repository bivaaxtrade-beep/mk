import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import path from 'path';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { getSafeDatabase } from './sqlite-factory.ts';

let db: any;
let sqlite: any;
let pgClient: any = null;

if (process.env.DATABASE_URL) {
  pgClient = postgres(process.env.DATABASE_URL, { max: 10, idle_timeout: 20 });
  db = drizzle(pgClient, { schema });
} else {
  sqlite = getSafeDatabase(path.join(process.cwd(), 'database.sqlite'));
  db = drizzleSqlite(sqlite, { schema });
}

export { db, schema, sqlite, pgClient };
export type DB = typeof db;


