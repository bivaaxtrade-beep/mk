const fs = require('fs');

let content = fs.readFileSync('src/pages/EnterpriseSupportCenter.tsx', 'utf8');

// Replace t.status === 'Open' with (t.status === 'Open' || t.status === 'open')
content = content.replace(/t\.status === 'Open'/g, "(t.status === 'Open' || t.status === 'open')");
content = content.replace(/t\.status !== 'Open'/g, "(t.status !== 'Open' && t.status !== 'open')");

// Pending
content = content.replace(/t\.status === 'Pending'/g, "(t.status === 'Pending' || t.status === 'pending')");
content = content.replace(/t\.status !== 'Pending'/g, "(t.status !== 'Pending' && t.status !== 'pending')");

// Resolved
content = content.replace(/t\.status === 'Resolved'/g, "(t.status === 'Resolved' || t.status === 'resolved')");
content = content.replace(/t\.status !== 'Resolved'/g, "(t.status !== 'Resolved' && t.status !== 'resolved')");

// Escalated
content = content.replace(/t\.status === 'Escalated'/g, "(t.status === 'Escalated' || t.status === 'escalated')");
content = content.replace(/t\.status !== 'Escalated'/g, "(t.status !== 'Escalated' && t.status !== 'escalated')");

// Handle statusFilter comparison
content = content.replace(/t\.status !== statusFilter/g, "(t.status?.toLowerCase() !== statusFilter?.toLowerCase())");

fs.writeFileSync('src/pages/EnterpriseSupportCenter.tsx', content, 'utf8');
console.log('Fixed EnterpriseSupportCenter.tsx');
