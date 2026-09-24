import { query } from './src/db/mysql-db';

async function run() {
  const rows = await query('SELECT * FROM kyc_requests LIMIT 5;');
  console.log(rows);
  
  // also check users
  const users = await query('SELECT uid, display_name, email FROM users LIMIT 5;');
  console.log(users);
}
run().catch(console.error);
