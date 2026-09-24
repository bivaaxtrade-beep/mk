const fs = require('fs');
let code = fs.readFileSync('src/api/routes.ts', 'utf8');

const target = `    // 3. Update SQL kyc_requests table
    await run(
      'UPDATE kyc_requests SET status = ?, rejection_reason = ?, updated_at = ? WHERE user_id = ? AND (status = \\'pending\\' OR id = ?)',
      [status, rejectionReason || '', Date.now(), userId, id || 0]
    );`;

const replacement = `    // 3. Update SQL kyc_requests table
    const sqlId = !isNaN(Number(id)) ? Number(id) : 0;
    await run(
      'UPDATE kyc_requests SET status = ?, rejection_reason = ?, updated_at = ? WHERE user_id = ? AND (status = \\'pending\\' OR id = ?)',
      [status, rejectionReason || '', Date.now(), userId, sqlId]
    );`;

code = code.replace(target, replacement);

fs.writeFileSync('src/api/routes.ts', code);
console.log('patched5');
