const fs = require('fs');
const file = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `                                   <div className="grid grid-cols-2 gap-4 p-4 bg-[#15161d] rounded-2xl border border-white/5">
                                       <div>
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">Full Name</label>
                                           <p className="font-bold">{selectedKYCRequest.fullName || selectedKYCRequest.userName}</p>
                                       </div>
                                       <div>`;

const replace = `                                   <div className="grid grid-cols-2 gap-4 p-4 bg-[#15161d] rounded-2xl border border-white/5">
                                       <div className="col-span-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">Email</label>
                                           <p className="font-mono text-sm">{selectedKYCRequest.userEmail || selectedKYCRequest.email || 'N/A'}</p>
                                       </div>
                                       <div>
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">Full Name</label>
                                           <p className="font-bold">{selectedKYCRequest.fullName || selectedKYCRequest.userName || 'N/A'}</p>
                                       </div>
                                       <div>`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Patched KYC modal UI 2 in AdminDashboard!");
} else {
    console.log("Could not find KYC modal UI 2 in AdminDashboard.");
}
