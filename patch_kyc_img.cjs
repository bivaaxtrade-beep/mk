const fs = require('fs');
const file = 'src/pages/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `                                   <div className="grid grid-cols-1 gap-4">
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

const replace = `                                   <div className="grid grid-cols-1 gap-4">
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
                                       {!selectedKYCRequest.idFrontUrl && !selectedKYCRequest.frontImage && !selectedKYCRequest.idBackUrl && !selectedKYCRequest.backImage && !selectedKYCRequest.selfieUrl && !selectedKYCRequest.selfieImage && (
                                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center text-sm text-gray-400">
                                               No documents uploaded.
                                           </div>
                                       )}
                                   </div>`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync(file, code);
    console.log("Patched KYC img in AdminDashboard!");
} else {
    console.log("Could not find KYC img in AdminDashboard.");
}
