const fs = require('fs');
let content = fs.readFileSync('src/db/mysql-db.ts', 'utf8');

const regex = /catch \(err: any\) \{\s*if \(err\.code === 'EAI_AGAIN' \|\| err\.code === 'ECONNREFUSED' \|\| err\.code === 'ENOTFOUND'\) \{[\s\S]*?\} else \{\s*throw err;\s*\}\s*\}/g;

content = content.replace(regex, `catch (err: any) {
      throw err;
    }`);

fs.writeFileSync('src/db/mysql-db.ts', content);
