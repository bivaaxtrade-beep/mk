const fs = require('fs');
const file = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `                                    <div className="grid grid-cols-2 gap-4 p-4 bg-[#15161d] rounded-2xl border border-white/5">
                                       <div>
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">Full Name</label>
                                           <p className="font-bold">{selectedKYCRequest.fullName || selectedKYCRequest.userName}</p>
                                       </div>
                                       <div>
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">ID Type</label>
                                           <p className="font-bold text-yellow-500">{selectedKYCRequest.idType || selectedKYCRequest.documentType}</p>
                                       </div>
                                       <div className="col-span-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">ID Number</label>
                                           <p className="font-bold">{selectedKYCRequest.idNumber || selectedKYCRequest.documentNumber}</p>
                                       </div>
                                   </div>
                                   <div className="grid grid-cols-1 gap-4">
                                       <div className="space-y-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500">Front</label>
                                           <img src={selectedKYCRequest.idFrontUrl || selectedKYCRequest.frontImage} className="w-full rounded-xl border border-white/5" alt="Front" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                       </div>
                                       <div className="space-y-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500">Back</label>
                                           <img src={selectedKYCRequest.idBackUrl || selectedKYCRequest.backImage} className="w-full rounded-xl border border-white/5" alt="Back" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                       </div>
                                       <div className="space-y-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500">Selfie</label>
                                           <img src={selectedKYCRequest.selfieUrl || selectedKYCRequest.selfieImage} className="w-full rounded-xl border border-white/5" alt="Selfie" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                       </div>
                                   </div>`;

const replace = `                                    <div className="grid grid-cols-2 gap-4 p-4 bg-[#15161d] rounded-2xl border border-white/5">
                                       <div className="col-span-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">Email</label>
                                           <p className="font-mono text-sm">{selectedKYCRequest.userEmail || selectedKYCRequest.email || 'N/A'}</p>
                                       </div>
                                       <div>
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">Full Name</label>
                                           <p className="font-bold">{selectedKYCRequest.fullName || selectedKYCRequest.userName || 'N/A'}</p>
                                       </div>
                                       <div>
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">ID Type</label>
                                           <p className="font-bold text-yellow-500">{selectedKYCRequest.idType || selectedKYCRequest.documentType || 'N/A'}</p>
                                       </div>
                                       <div className="col-span-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">ID Number</label>
                                           <p className="font-bold">{selectedKYCRequest.idNumber || selectedKYCRequest.documentNumber || 'N/A'}</p>
                                       </div>
                                   </div>
                                   <div className="grid grid-cols-1 gap-4">
                                       {(selectedKYCRequest.idFrontUrl || selectedKYCRequest.frontImage) && (
                                           <div className="space-y-2">
                                               <label className="text-[10px] font-black uppercase text-gray-500">Front</label>
                                               <img src={selectedKYCRequest.idFrontUrl || selectedKYCRequest.frontImage} className="w-full rounded-xl border border-white/5" alt="Front" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                           </div>
                                       )}
                                       {(selectedKYCRequest.idBackUrl || selectedKYCRequest.backImage) && (
                                           <div className="space-y-2">
                                               <label className="text-[10px] font-black uppercase text-gray-500">Back</label>
                                               <img src={selectedKYCRequest.idBackUrl || selectedKYCRequest.backImage} className="w-full rounded-xl border border-white/5" alt="Back" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                           </div>
                                       )}
                                       {(selectedKYCRequest.selfieUrl || selectedKYCRequest.selfieImage) && (
                                           <div className="space-y-2">
                                               <label className="text-[10px] font-black uppercase text-gray-500">Selfie</label>
                                               <img src={selectedKYCRequest.selfieUrl || selectedKYCRequest.selfieImage} className="w-full rounded-xl border border-white/5" alt="Selfie" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                           </div>
                                       )}
                                   </div>`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Patched KYC modal UI in AdminDashboard!");
} else {
    console.log("Could not find KYC modal UI in AdminDashboard.");
}
