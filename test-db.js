const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('local_db.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});

db.serialize(() => {
  db.each("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5", (err, row) => {
    if (err) {
      console.error(err);
    }
    console.log(row);
  });
});

db.close();
