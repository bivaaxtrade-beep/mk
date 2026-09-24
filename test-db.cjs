const Database = require('better-sqlite3');
const db = new Database('local_db.sqlite');
const rows = db.prepare("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5").all();
console.log(rows);
