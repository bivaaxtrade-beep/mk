const fs = require('fs');
let code = fs.readFileSync('src/api/routes.ts', 'utf8');

code = code.replace(
  /await run\(\n      'UPDATE kyc_requests SET status = \?, rejection_reason = \?, updated_at = \? WHERE user_id = \? AND \\\(status = \\'pending\\' OR id = \?\\\)',\n      \[status, rejectionReason \|\| '', Date\.now\(\), userId, id \|\| 0\]\n    \);/g,
  `const sqlId = !isNaN(Number(id)) ? Number(id) : 0;
    await run(
      'UPDATE kyc_requests SET status = ?, rejection_reason = ?, updated_at = ? WHERE user_id = ? AND (status = \\'pending\\' OR id = ?)',
      [status, rejectionReason || '', Date.now(), userId, sqlId]
    );`
);

fs.writeFileSync('src/api/routes.ts', code);
console.log('patched4');
