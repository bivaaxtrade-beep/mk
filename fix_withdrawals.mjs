import fs from 'fs';

let code = fs.readFileSync('src/pages/TradeTerminal.tsx', 'utf8');

const startTarget = "{withdrawStep === 'methods' ? (";
const startIdx = code.indexOf(startTarget);

if (startIdx === -1) {
    console.log("Could not find start target");
    process.exit(1);
}

const searchPattern = ") : (\n                 <div className=\"animate-in fade-in";
let elseIdx = code.indexOf(searchPattern);

if (elseIdx !== -1) {
    console.log("Found else branch!");
    
    // We replace from startIdx to elseIdx + 5
    const newBlock = "{withdrawStep === 'methods' && (() => { " +
                  "const hasCompletedDeposits = userTransactions.filter(t => t.type === 'Deposit' && t.status === 'Completed').length > 0; " +
                  "const activeMethods = depositMethods.filter(m => m.isActive !== false); " +
                  "if (!hasCompletedDeposits) { " +
                    "return ( " +
                       "<div className=\"flex flex-col\"> " +
                         " {/* Banner */} " +
                         "<div className=\"bg-[#24252a] rounded-[16px] p-5 relative overflow-hidden mb-4 shadow-sm h-[140px] flex items-center justify-between border border-white/5\"> " +
                           "<div className=\"relative z-10 w-[60%]\"> " +
                             "<h2 className=\"text-white text-[19px] font-black leading-tight tracking-tight mt-2\">Available from $10</h2> " +
                           "</div> " +
                           "<div className=\"relative z-10 w-[100px] h-[100px] opacity-90 right-2 pointer-events-none\"> " +
                             "<img src=\"/assets/coin.png\" alt=\"\" className=\"w-full h-full object-contain filter\" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> " +
                             "<div className=\"absolute inset-0 bg-[#24252a]/10 rounded-full\"></div> " +
                             "<div className=\"absolute inset-0 flex items-center justify-center text-[70px] font-black text-white/5 shadow-inner\"> " +
                                "$ " +
                             "</div> " +
                           "</div> " +
                         "</div> " +
                         "<div className=\"flex justify-center gap-2 mb-8 mt-2\"> " +
                           "<div className=\"w-6 h-1.5 bg-white rounded-full\"></div> " +
                           "<div className=\"w-1.5 h-1.5 bg-[#3a3b41] rounded-full\"></div> " +
                           "<div className=\"w-1.5 h-1.5 bg-[#3a3b41] rounded-full\"></div> " +
                         "</div> " +
                         "<div className=\"mb-6\"> " +
                           "<h2 className=\"text-white text-[22px] font-black mb-1\">Your withdrawals will be here</h2> " +
                           "<p className=\"text-gray-400 text-[14px]\">Choose convenient deposit method</p> " +
                         "</div> " +
                         "<button " +
                           "onClick={() => setCashierTab('deposits')} " +
                           "className=\"w-full bg-[#FFE24C] hover:bg-[#F0D544] text-black font-extrabold text-[16px] py-[13px] rounded-[10px] shadow-sm transition-all mb-10 active:scale-[0.98]\"> " +
                           "Deposit " +
                         "</button> " +
                         "<h3 className=\"text-white text-[20px] font-black mb-4 tracking-tight\">Deposit to unlock</h3> " +
                         "<div className=\"flex flex-col gap-2 relative z-10 mb-8\"> " +
                           "{activeMethods.map((method, idx) => ( " +
                              "<div " +
                                "key={`withdraw-locked-${idx}-${method.name}`} " +
                                "className=\"bg-[#24252a] hover:bg-[#2c2d33] transition-colors rounded-[16px] flex items-center cursor-pointer border-none relative min-h-[64px] px-4\" " +
                                "onClick={() => { " +
                                  "setSelectedMethod(method); " +
                                  "setWithdrawStep('locked_method'); " +
                                "}}> " +
                                "<div className=\"w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 overflow-hidden\" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}> " +
                                  "{method.logoType === 'image' || !method.logoType ? ( " +
                                      "method.logo ? ( " +
                                        "<img src={method.logo} alt=\"\" className=\"w-full h-full object-contain\" referrerPolicy=\"no-referrer\"  loading=\"lazy\" /> " +
                                      ") : ( " +
                                        "<div className=\"text-white font-bold\">{method.name?.[0] || '?'}</div> " +
                                      ") " +
                                  ") : ( " +
                                      "<span className=\"text-white font-bold\">{method.logo}</span> " +
                                  ")} " +
                                "</div> " +
                                "<div className=\"ml-3 flex flex-col justify-center z-10 py-2\"> " +
                                  "<span className=\"text-white text-[15px] font-bold leading-tight tracking-wide\">{method.name}</span> " +
                                  "<div className=\"flex items-center gap-1 mt-0.5\"> " +
                                    "<Icons.Zap size={12} className=\"text-[#FFE24C]\" fill=\"currentColor\" /> " +
                                    "<span className=\"text-[#FFE24C] text-[11px] font-bold uppercase\">instant</span> " +
                                    "<span className=\"text-gray-500 text-[11px] font-medium tracking-wide\"> • from {['crypto', 'other'].includes(method.category?.toLowerCase() || '') ? `$${method.minDeposit || 10}` : formatRawCurrency(method.minDeposit || 10, userCurrency)}</span> " +
                                  "</div> " +
                                "</div> " +
                              "</div> " +
                           "))} " +
                         "</div> " +
                       "</div> " +
                    "); " +
                  "} " +
                  "return ( " +
                    "<> " +
                      " {/* Promo Banner */} " +
                      "<div className=\"bg-gradient-to-br from-[#0B0D23] via-[#0E1545] to-[#0A2665] rounded-[16px] p-5 relative overflow-hidden mb-8 shadow-sm\"> " +
                        "<div className=\"relative z-10 w-[65%]\"> " +
                          "<h2 className=\"text-white text-[17px] font-bold leading-tight mb-2 tracking-tight\">Want bigger profit?</h2> " +
                          "<p className=\"text-white/80 text-[13px] leading-[1.3] mb-4\">Looks like recent news brings good profit to traders. Hurry up and make some trades!</p> " +
                          "<button className=\"w-full bg-[#FFE24C] hover:bg-[#F0D544] text-black font-semibold text-[15px] py-2.5 rounded-[12px] transition-colors shadow-sm\"> " +
                            "Check the news " +
                          "</button> " +
                        "</div> " +
                        " {/* Abstract globe shape */} " +
                        "<div className=\"absolute right-[-40px] top-1/2 -translate-y-[45%] w-[180px] h-[180px] rounded-full border border-[#0d45a9]/50 bg-gradient-to-br from-[#1b62f1] to-[#012f91] opacity-60 shadow-inner flex items-center justify-center overflow-hidden pointer-events-none\"> " +
                           "<div className=\"w-[120px] h-[120px] rounded-full border border-[#4d8eff]/30 rotate-45 flex items-center justify-center pointer-events-none\"> " +
                              "<div className=\"w-[60px] h-[60px] rounded-full border border-[#7aaaff]/20 pointer-events-none\"></div> " +
                           "</div> " +
                        "</div> " +
                      "</div> " +
                      "<h3 className=\"text-white text-xl font-bold mb-4 tracking-tight\">Withdrawal Methods</h3> " +
                      "{activeMethods.length > 0 ? ( " +
                        "<div className=\"flex flex-col gap-2 relative z-10 mb-8\"> " +
                           "{activeMethods.map((method, idx) => ( " +
                              "<div " +
                                "key={`withdraw-${idx}-${method.name}`} " +
                                "className=\"bg-[#24252a] hover:bg-[#2c2d33] transition-colors rounded-[16px] flex items-center cursor-pointer border-none relative min-h-[64px] px-4\" " +
                                "onClick={() => { " +
                                  "setSelectedMethod(method); " +
                                  "setWithdrawStep('form'); " +
                                "}}> " +
                                "<div className=\"w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 overflow-hidden\" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}> " +
                                  "{method.logoType === 'image' || !method.logoType ? ( " +
                                      "method.logo ? ( " +
                                        "<img src={method.logo} alt=\"\" className=\"w-full h-full object-contain\" referrerPolicy=\"no-referrer\"  loading=\"lazy\" /> " +
                                      ") : ( " +
                                        "<div className=\"text-white font-bold\">{method.name?.[0] || '?'}</div> " +
                                      ") " +
                                  ") : ( " +
                                      "<span className=\"text-white font-bold\">{method.logo}</span> " +
                                  ")} " +
                                "</div> " +
                                "<div className=\"ml-3 flex flex-col justify-center z-10 py-2\"> " +
                                  "<span className=\"text-white text-[15px] font-bold leading-tight tracking-wide\">{method.name}</span> " +
                                  "<div className=\"flex items-center gap-1 mt-0.5\"> " +
                                    "<Icons.Zap size={12} className=\"text-[#00C980]\" fill=\"currentColor\" /> " +
                                    "<span className=\"text-[#00C980] text-[11px] font-bold uppercase\">Available</span> " +
                                    "<span className=\"text-gray-500 text-[11px] font-medium tracking-wide\"> • Min: {formatWithCurrency(currentMinWithdrawal, userCurrency)}</span> " +
                                  "</div> " +
                                "</div> " +
                                "<div className=\"ml-auto\"> " +
                                    "<Icons.ChevronRight size={18} className=\"text-gray-600 group-hover:text-white transition-colors\" /> " +
                                "</div> " +
                              "</div> " +
                           "))} " +
                        "</div> " +
                      ") : ( " +
                        "<div className=\"bg-[#2A2B31]/40 rounded-[16px] p-8 text-center border border-dashed border-white/5 mb-8\"> " +
                           "<p className=\"text-gray-500 text-sm\">No withdrawal methods available. Please contact support.</p> " +
                        "</div> " +
                      ")} " +
                    "</> " +
                  "); " +
               "})()} " +
               "{withdrawStep === 'locked_method' && selectedMethod && ( " +
                 "<div className=\"animate-in fade-in slide-in-from-right-4 duration-300 relative z-10 w-full mb-10 pb-8 flex flex-col min-h-[500px]\"> " +
                   "<div className=\"flex items-center gap-2 mb-10 mt-2\"> " +
                     "<button onClick={() => setWithdrawStep('methods')} className=\"text-gray-400 hover:text-white transition-colors p-1 -ml-1 shrink-0\"> " +
                       "<Icons.ArrowLeft size={24} /> " +
                     "</button> " +
                     "<div className=\"flex items-center gap-2 bg-[#24252a] px-3 py-1.5 rounded-full border border-white/5\"> " +
                       "<div className=\"w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm\" style={{ backgroundColor: selectedMethod.bgColor || '#1e1e1e' }}> " +
                         "{selectedMethod.logoType === 'image' || !selectedMethod.logoType ? ( " +
                           "selectedMethod.logo ? ( " +
                             "<img src={selectedMethod.logo} alt=\"\" className=\"w-full h-full object-contain\" referrerPolicy=\"no-referrer\" loading=\"lazy\" /> " +
                           ") : ( " +
                             "<div className=\"text-white font-bold text-[10px]\">{selectedMethod.name?.[0] || '?'}</div> " +
                           ") " +
                         ") : ( " +
                           "<span className=\"text-white font-bold text-[10px]\">{selectedMethod.logo}</span> " +
                         ")} " +
                       "</div> " +
                       "<span className=\"text-white text-[14px] font-bold tracking-tight\">{selectedMethod.name}</span> " +
                       "<span className=\"text-gray-500 text-[12px] font-medium px-0.5\">•</span> " +
                       "<div className=\"flex items-center\"> " +
                         "<Icons.Zap size={12} className=\"text-[#FFE24C]\" fill=\"currentColor\" /> " +
                         "<span className=\"text-[#FFE24C] text-[12px] font-bold tracking-wide\">instant</span> " +
                       "</div> " +
                     "</div> " +
                   "</div> " +
                   "<div className=\"flex-1 flex flex-col items-center justify-center pt-8\"> " +
                     "<div className=\"w-[100px] h-[100px] rounded-full flex items-center justify-center shadow-md mb-8 overflow-hidden bg-[#24252a] border-4 border-[#1e1e1e]\" style={{ backgroundColor: selectedMethod.bgColor || '#1e1e1e' }}> " +
                       "{selectedMethod.logoType === 'image' || !selectedMethod.logoType ? ( " +
                           "selectedMethod.logo ? ( " +
                             "<img src={selectedMethod.logo} alt=\"\" className=\"w-2/3 h-2/3 object-contain\" referrerPolicy=\"no-referrer\" loading=\"lazy\" /> " +
                           ") : ( " +
                             "<div className=\"text-white font-bold text-4xl\">{selectedMethod.name?.[0] || '?'}</div> " +
                           ") " +
                       ") : ( " +
                           "<span className=\"text-white font-bold text-4xl\">{selectedMethod.logo}</span> " +
                       ")} " +
                     "</div> " +
                     "<h2 className=\"text-white text-[28px] font-black tracking-tight mb-12 text-center leading-tight\">Want to unlock<br/>{selectedMethod.name}?</h2> " +
                     "<button " +
                       "onClick={() => { " +
                         "setCashierTab('deposits'); " +
                       "}} " +
                       "className=\"w-full max-w-[300px] bg-[#FFE24C] hover:bg-[#F0D544] text-black font-extrabold text-[16px] py-[13px] rounded-[10px] shadow-sm transition-all active:scale-[0.98]\"> " +
                       "Deposit " +
                     "</button> " +
                   "</div> " +
                 "</div> " +
               ")} " +
               "{withdrawStep === 'form' && (";

    code = code.substring(0, startIdx) + newBlock + code.substring(elseIdx + 5);
    
    fs.writeFileSync('src/pages/TradeTerminal.tsx', code);
    console.log("Success! Updated the UI logic.");
} else {
    console.log("Could not find the else branch");
}
