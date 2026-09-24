const fs = require('fs');
let code = fs.readFileSync('src/api/routes.ts', 'utf8');

code = code.replace(
  /if \(\!userId \|\| \!status\) \{\n    return res\.status\(400\)\.json\(\{ error: 'Missing required parameters' \}\);\n  \}/g,
  `if (!userId || !status) {
    return res.status(400).json({ error: 'Missing user ID or status parameters. This happens if the KYC data is corrupted. Please reject and ask user to resubmit.' });
  }`
);

fs.writeFileSync('src/api/routes.ts', code);
console.log('patched2');
