const fs = require('fs');
const file = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `            unsubs.push(onSnapshot(collection(db, 'kycRequests'), (snap) => {
                const reqs = snap.docs.map(d => ({id: d.id, ...d.data()}));
                reqs.sort((a: any, b: any) => {
                    const getMillis = (item: any) => {
                        if (!item) return 0;
                        const candidates = [item.timestamp, item.submittedAt, item.createdAt, item.date];
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
                setKycRequests(reqs);
            }));`;

const replace = `            unsubs.push(onSnapshot(collection(db, 'kycRequests'), (snap) => {
                const reqs = snap.docs.map(d => {
                   const item = d.data();
                   return {
                       id: d.id,
                       userId: item.userId || item.uid || item.user_id || '',
                       userEmail: item.userEmail || item.email || '',
                       fullName: item.fullName || item.userName || item.name || item.full_name || '---',
                       idType: item.idType || item.documentType || item.document_type || 'NID',
                       idNumber: item.idNumber || item.documentNumber || item.document_number || '---',
                       idFrontUrl: item.idFrontUrl || item.frontImage || item.front_image || item.photoURL || '',
                       idBackUrl: item.idBackUrl || item.backImage || item.back_image || '',
                       selfieUrl: item.selfieUrl || item.selfieImage || item.selfie_image || '',
                       status: item.status || 'pending',
                       rejectionReason: item.rejectionReason || '',
                       submittedAt: item.submittedAt || item.timestamp || item.createdAt || 0,
                       ...item
                   };
                });
                setKycRequests(prev => {
                     const map = new Map();
                     // Give priority to newer/updated objects.
                     [...prev, ...reqs].forEach(r => {
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
            }));`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Patched KYC snapshot listener in AdminDashboard!");
} else {
    console.log("Could not find KYC snapshot listener in AdminDashboard.");
}
