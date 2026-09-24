const Database = require('better-sqlite3');
const db = new Database('database.sqlite');
const rows = db.prepare("SELECT * FROM transactions WHERE type='withdrawal' ORDER BY created_at DESC LIMIT 5").all();
console.log(rows);
