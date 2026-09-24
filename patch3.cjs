const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /if \(\!res\.ok\) throw new Error\("Update failed"\);/g,
  `if (!res.ok) {
     const errData = await res.json().catch(() => ({}));
     throw new Error(errData.error || "Update failed");
   }`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log('patched3');
