const fs = require('fs');
const file = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `        // Fetch KYC requests from backend API
        const kycRef = await fetch('/api/admin/kyc/requests', { headers });
        if (kycRef.ok) {
            const apiKyc = await kycRef.json();
            if (Array.isArray(apiKyc)) {
                setKycRequests(apiKyc);
            }
        }`;

const replace = `        // Fetch KYC requests from backend API
        const kycRef = await fetch('/api/admin/kyc/requests', { headers });
        if (kycRef.ok) {
            const apiKyc = await kycRef.json();
            if (Array.isArray(apiKyc)) {
                setKycRequests(prev => {
                     const map = new Map();
                     [...prev, ...apiKyc].forEach(r => {
                         if (!r) return;
                         map.set(String(r.id), Object.assign({}, map.get(String(r.id)) || {}, r));
                     });
                     const arr = Array.from(map.values());
                     arr.sort((a: any, b: any) => {
                         const getMillis = (item: any) => {
                            if (!item) return 0;
                            const candidates = [item.submittedAt, item.timestamp, item.createdAt, item.date];
                            for (const val of candidates) {
                                if (!val) continue;
                                if (typeof val.toMillis === 'function') return val.toMillis();
                                if (typeof val.toDate === 'function') return val.toDate().getTime();
                                if (val instanceof Date) return val.getTime();
                                if (typeof val === 'number') return val;
                                if (typeof val === 'string') {
                                    const parsed = Date.parse(val);
                                    if (!isNaN(parsed)) return parsed;
                                }
                            }
                            return 0;
                        };
                        return getMillis(b) - getMillis(a);
                     });
                     return arr;
                });
            }
        }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Patched KYC fetch overwrite in AdminDashboard!");
} else {
    console.log("Could not find KYC fetch overwrite in AdminDashboard.");
}
