import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MessageSquare, 
  Ticket, 
  BookOpen, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight, 
  Send, 
  X, 
  Mail, 
  Zap, 
  CheckCircle, 
  Clock, 
  Headphones, 
  Sparkles,
  PhoneCall,
  Lock,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  Smartphone,
  Check,
  AlertTriangle,
  RefreshCw,
  Users,
  FileText,
  BadgeAlert,
  Server,
  Activity,
  Globe,
  Coins
} from 'lucide-react';
import SEO from '../components/SEO';
import { Logo } from '../components/Logo';
import { db, collection, addDoc } from '../firebase';
import { toast } from 'react-hot-toast';

interface FAQ {
  id: string;
  q: string;
  a: string;
  category: string;
}

// 1. DYNAMIC COMPREHENSIVE KNOWLEDGE BASE
const DETAILED_FAQS: FAQ[] = [
  // Deposits (Crypto, USDT, Binance Pay, etc.)
  { 
    id: 'dep-1', 
    category: 'funding', 
    q: 'How do I deposit money using USDT (TRC-20) or BEP-20 networks?', 
    a: 'Crypto deposits are direct, highly secure, and automated. Steps: 1. Go to Cashier > Deposit inside your trade room. 2. Select USDT (TRC-20) or USDT (BEP-20). 3. Copy your unique, single-use Bivaax receiving address, or scan the QR code. 4. Initiate the transfer from your personal wallet (such as Binance, Trust Wallet, or any other exchange). 5. The transaction will automatically process and credit your Bivaax account within 5-10 minutes after network confirmations.' 
  },
  { 
    id: 'dep-2', 
    category: 'funding', 
    q: 'What is the minimum deposit limit and processing fees?', 
    a: 'The minimum deposit limit is exactly $10 in supported cryptocurrency. Bivaax does not impose any deposit fees. If you transfer money using a crypto wallet, any small network gas fees are charged exclusively by your blockchain network or exchange, not Bivaax.' 
  },
  { 
    id: 'dep-3', 
    category: 'funding', 
    q: 'Why has my Cryptocurrency deposit not been credited?', 
    a: 'If your crypto deposit is delayed past 15 minutes, it is usually due to one of these reasons: 1. You sent funds over an incorrect blockchain network (e.g., sending ERC-20 to a TRC-20 address). 2. A typo in the Transaction ID (TxHash) submitted (if manually queried). 3. The transaction is still pending on the blockchain (check explorer status). To resolve, copy your transaction hash (TxHash) and open a priority ticket or live chat immediately.' 
  },
  { 
    id: 'dep-4', 
    category: 'funding', 
    q: 'How do I deposit using Binance Pay for instant funding?', 
    a: 'Binance Pay funding is instant and 100% automated: 1. Select Binance Pay in Bivaax Cashier. 2. Copy your unique Binance Pay Merchant ID, or scan the direct QR code. 3. Initiate the transfer from your Binance Pay wallet. 4. Funding via Binance Pay is instant and has absolute zero gas fees.' 
  },

  // Withdrawals
  { 
    id: 'wit-1', 
    category: 'withdrawals', 
    q: 'How do I withdraw my earnings and what is the timeframe?', 
    a: 'You can request a withdrawal to your USDT (TRC-20), USDT (BEP-20), or Binance Pay account. Withdrawal requests are processed by our specialized finance division 24/7. Average completion time is 15 minutes to 2 hours. In times of high volume or blockchain congestion, it can take up to 24 hours. There are zero withdrawal fees.' 
  },
  { 
    id: 'wit-2', 
    category: 'withdrawals', 
    q: 'What are the minimum and maximum withdrawal limits?', 
    a: 'The minimum withdrawal limit is $10. The maximum withdrawal limit depends on your account status level (Starter, Pro, VIP). VIP accounts enjoy unlimited daily payouts and automated priority clearance within 5 minutes.' 
  },
  { 
    id: 'wit-3', 
    category: 'withdrawals', 
    q: 'Why was my withdrawal request rejected?', 
    a: 'Withdrawals are typically declined due to: 1. Attempting to withdraw to a third-party wallet or address not registered in your name (compliance policy). 2. Not completing your mandatory KYC verification. 3. Active trading rollover bonus requirements not met. 4. Insufficient cleared balance. Check your notifications for the specific rejection code.' 
  },

  // Verification & KYC
  { 
    id: 'kyc-1', 
    category: 'kyc', 
    q: 'What documents are required for full KYC verification?', 
    a: 'To fully verify your identity, we require: 1. A high-resolution color photo of your National ID (NID) Card, Passport, or Driving License (front and back). 2. A clear selfie holding your selected identity document next to your face. 3. (Optional) Proof of address such as a utility bill, bank statement, or internet bill issued within the last 3 months if requested by compliance.' 
  },
  { 
    id: 'kyc-2', 
    category: 'kyc', 
    q: 'How long does the KYC verification process take?', 
    a: 'Our automatic verification system processes documents within 10 to 15 minutes. If your application requires manual inspection by compliance, it can take up to 2 hours. You will receive an automated email confirmation once verified.' 
  },

  // Trading Mechanics
  { 
    id: 'trd-1', 
    category: 'trading', 
    q: 'What is the Bivaax OTC trading system?', 
    a: 'Bivaax OTC (Over-The-Counter) market offers high-liquidity assets with up to 95% payouts. It runs uninterrupted 24/7/365, allowing you to trade currency pairs, indices, and commodities even during weekends when traditional global markets are closed.' 
  },
  { 
    id: 'trd-2', 
    category: 'trading', 
    q: 'Why are payout percentages changing dynamically?', 
    a: 'Payout percentages are set algorithmically based on active market volume, trading density, asset volatility, and liquidity pool depth. Major assets typically range from 82% to 95% payouts.' 
  },

  // Account Security
  { 
    id: 'sec-1', 
    category: 'security', 
    q: 'How do I protect my account using Google 2FA?', 
    a: 'Protecting your funds is our highest priority: 1. Navigate to Profile > Security inside Bivaax. 2. Enable Google Authenticator. 3. Scan the QR code using Google Authenticator on your mobile phone. 4. Write down and save your 16-digit master backup key in a safe offline location. 5. Enter the current 6-digit dynamic code to activate.' 
  },
  { 
    id: 'sec-2', 
    category: 'security', 
    q: 'What should I do if I lose my Google 2FA device?', 
    a: 'If you lose your 2FA device, you must send an email to security@bivaax.com with: 1. Your registered Bivaax email. 2. A high-resolution selfie holding your NID card alongside a handwritten note stating "Reset Bivaax 2FA" and the current date. Our security desk will verify and disable 2FA within 2 hours.' 
  }
];

// 2. INTERACTIVE TROUBLESHOOTING WIZARD DATA
const WIZARD_STEPS = {
  start: {
    question: "What issue are you facing right now?",
    options: [
      { label: "Deposit / Funding Issue", next: "deposit" },
      { label: "Withdrawal / Cashout delay", next: "withdrawal" },
      { label: "KYC / Account Verification rejection", next: "kyc" },
      { label: "Google 2FA / Login recovery", next: "security" }
    ]
  },
  deposit: {
    question: "Which deposit network or method did you use?",
    options: [
      { label: "USDT (TRC-20) Network", next: "deposit_crypto" },
      { label: "USDT (BEP-20) Network", next: "deposit_crypto" },
      { label: "Binance Pay / Direct Transfer", next: "deposit_binance" }
    ]
  },
  deposit_binance: {
    question: "Did you complete and approve the payment inside your Binance App?",
    options: [
      { label: "Yes, approved in Binance but balance is still 0", action: "binance_sync" },
      { label: "No, the checkout timed out or failed", action: "binance_failed" }
    ]
  },
  deposit_crypto: {
    question: "Has the transaction been fully confirmed on the Blockchain Explorer?",
    options: [
      { label: "Yes, confirmed but balance is still 0", action: "crypto_node_sync" },
      { label: "No, it is still pending/unconfirmed in my wallet", action: "wait_blockchain" },
      { label: "I sent it using a wrong network", action: "wrong_network" }
    ]
  },
  withdrawal: {
    question: "What is the current status of your cashout request?",
    options: [
      { label: "Status is 'In Process' or 'Pending'", action: "withdrawal_sla_time" },
      { label: "Status is 'Rejected' or 'Failed'", action: "withdrawal_failed_reason" }
    ]
  },
  kyc: {
    question: "Why was your verification rejected?",
    options: [
      { label: "Selfie holding NID was unclear / cropped", action: "kyc_selfie_guide" },
      { label: "Document name mismatch with profile", action: "kyc_name_mismatch" }
    ]
  },
  security: {
    question: "What security problem are you having?",
    options: [
      { label: "I lost my phone & Google Authenticator", action: "2fa_lost_solution" },
      { label: "My 2FA code shows 'Incorrect Code' error", action: "2fa_time_sync" }
    ]
  }
};

const WIZARD_ACTIONS: Record<string, { title: string, text: string, steps: string[] }> = {
  binance_sync: {
    title: "Binance Pay Sync",
    text: "While Binance Pay transfers are usually instant, temporary API handshake delays between Binance and our node gateway can occur.",
    steps: [
      "Open your Binance App and verify the payment is marked as 'COMPLETED' under Pay history.",
      "Wait 2 to 3 minutes for the merchant callback to execute.",
      "If balance is not updated, submit a ticket below with your Binance Pay Order ID and transaction screenshot."
    ]
  },
  binance_failed: {
    title: "Binance Pay Transaction Cancelled",
    text: "If you cancelled the checkout flow or the transaction failed due to timeout, no funds have been debited.",
    steps: [
      "Verify your Binance funding wallet balance to confirm no funds were deducted.",
      "Go back to Bivaax Cashier and initiate a fresh deposit request.",
      "Complete the checkout in your Binance app within the 10-minute validity window."
    ]
  },
  crypto_node_sync: {
    title: "Crypto Node Sync Delay",
    text: "If the blockchain scanner shows 'SUCCESS' but your Bivaax balance remains unchanged, the node API is likely syncing.",
    steps: [
      "Wait 5 minutes for transaction confirmations to reach at least 3 blocks.",
      "Refresh your trade terminal screen.",
      "If not resolved in 15 minutes, submit a ticket below with your TxHash/TxID."
    ]
  },
  wait_blockchain: {
    title: "Awaiting Network Confirmations",
    text: "Your transfer is still inside the Mempool of the blockchain network. Bivaax cannot credit funds until confirmed on-chain.",
    steps: [
      "Check your personal wallet (Binance, Trust Wallet) withdrawal status.",
      "Ensure you have sufficient network energy/gas fees (such as TRX or BNB) to execute the transfer.",
      "No action is required on Bivaax yet. Your wallet will automatically update on credit."
    ]
  },
  wrong_network: {
    title: "Wrong Deposit Network (e.g., ERC-20 to TRC-20)",
    text: "If you transferred USDT using a different blockchain network than selected, the funds may be stuck in the smart contract node.",
    steps: [
      "Double check your sender transaction receipt on Tronscan or BscScan.",
      "Confirm if the destination address matches your Bivaax deposit address exactly.",
      "If the network was incorrect, open a priority ticket below with the TxHash, sender address, and correct network details."
    ]
  },
  withdrawal_sla_time: {
    title: "Withdrawal Processing Timeline",
    text: "Withdrawal processing is fast, operating 24/7. Starter accounts clear in 1-2 hours. VIP accounts process in under 5 minutes.",
    steps: [
      "Ensure you have verified your email address and profile identity.",
      "Check your phone for SMS or email notification regarding withdrawal updates.",
      "If more than 4 hours have passed, contact our VIP Support Telegram."
    ]
  },
  withdrawal_failed_reason: {
    title: "Withdrawal Rejection Check",
    text: "To protect client security, cashouts must meet strict anti-money laundering and accounting rules.",
    steps: [
      "Check your profile settings: is your name spelled exactly as on your payout wallet?",
      "Verify if you have met the minimum standard trade rollover requirements (1x deposit volume).",
      "Upload high-resolution NID photos to enable full withdrawal access."
    ]
  },
  kyc_selfie_guide: {
    title: "Perfect Selfie Guidelines",
    text: "Verification fails if details on your document cannot be clearly read in your selfie.",
    steps: [
      "Hold your NID card right next to your chin. Do not cover your face.",
      "Ensure high lighting with zero reflections, shadows, or text blur.",
      "The text on your NID card MUST be 100% readable in the photo."
    ]
  },
  kyc_name_mismatch: {
    title: "Profile Name Mismatch",
    text: "Our automated compliance system strictly requires the trading account profile name to match your NID.",
    steps: [
      "Go to Profile inside your trade room.",
      "Check if your profile name matches your NID name exactly.",
      "If you need to change your registered name, open a ticket below attaching your NID."
    ]
  },
  "2fa_lost_solution": {
    title: "Emergency 2FA Reset Guide",
    text: "If you did not write down your 16-digit recovery master key, you must verify your identity to reset 2FA.",
    steps: [
      "Send an email to security@bivaax.com using your registered trade email.",
      "Attach a clear, bright selfie holding your NID and a handwritten paper stating 'Reset Bivaax 2FA' with today's date.",
      "Our security manager will disable 2FA for your account in under 2 hours."
    ]
  },
  "2fa_time_sync": {
    title: "Google Authenticator Sync Issue",
    text: "Your 2FA codes fail if the internal time of your mobile phone does not match Google's central server time.",
    steps: [
      "Open your Google Authenticator app on your phone.",
      "Go to Settings > Time correction for codes > Sync now.",
      "Ensure your phone's date and time settings are set to 'Set Automatically' via internet."
    ]
  }
};

export default function SupportLandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // SLA simulation states
  const [liveWait, setLiveWait] = useState('1m 18s');
  const [activeAgents, setActiveAgents] = useState(48);
  const [resolvedToday, setResolvedToday] = useState(2581);

  // Self-Help Wizard state
  const [wizardHistory, setWizardHistory] = useState<string[]>(['start']);
  const [wizardAction, setWizardAction] = useState<string | null>(null);

  // Ticket creation states
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Deposit / Funding');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  // Diagnostic Checklist
  const [diagnosticScore, setDiagnosticScore] = useState(0);
  const [checklist, setChecklist] = useState({
    email: false,
    phone: false,
    pass: false,
    g2fa: false,
    kyc: false
  });

  // Dynamic SLA simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate real-time fluctuations
      setActiveAgents(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 60 ? 45 : (next < 35 ? 40 : next);
      });
      setResolvedToday(prev => prev + 1);
      const randomSec = Math.floor(Math.random() * 40) + 40;
      setLiveWait(`0m ${randomSec}s`);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Recalculate diagnostic score
  useEffect(() => {
    let score = 0;
    if (checklist.email) score += 20;
    if (checklist.phone) score += 20;
    if (checklist.pass) score += 20;
    if (checklist.g2fa) score += 20;
    if (checklist.kyc) score += 20;
    setDiagnosticScore(score);
  }, [checklist]);

  // Troubleshooting Wizard functions
  const handleWizardOption = (nextStepOrAction: string) => {
    if (WIZARD_ACTIONS[nextStepOrAction]) {
      setWizardAction(nextStepOrAction);
    } else {
      setWizardHistory(prev => [...prev, nextStepOrAction]);
    }
  };

  const handleWizardBack = () => {
    if (wizardAction) {
      setWizardAction(null);
    } else if (wizardHistory.length > 1) {
      setWizardHistory(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handleWizardReset = () => {
    setWizardHistory(['start']);
    setWizardAction(null);
  };

  // Auto scroll to category FAQs when clicked
  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId === selectedCategory ? null : catId);
    setOpenFaqId(null);
    setTimeout(() => {
      document.getElementById('faq-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Filter FAQs based on category & search query
  const filteredFaqs = DETAILED_FAQS.filter(faq => {
    const matchesCategory = selectedCategory ? faq.category === selectedCategory : true;
    const matchesSearch = searchQuery.trim() === '' || 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Ticket Submission Handler
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEmail || !ticketSubject || !ticketMessage) {
      toast.error('Please fill out all required ticket fields.');
      return;
    }

    setSubmitting(true);
    try {
      const ticketId = `BVX-ST-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        ticketId,
        userId: 'guest',
        userEmail: ticketEmail.trim(),
        userName: ticketEmail.split('@')[0],
        subject: ticketSubject.trim(),
        category: ticketCategory,
        status: 'open',
        lastMessage: ticketMessage.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isGuestTicket: true
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'tickets'), payload);

      // Add the initial message
      await addDoc(collection(db, 'tickets', docRef.id, 'messages'), {
        ticketId: docRef.id,
        senderId: 'guest',
        senderName: ticketEmail.split('@')[0],
        senderType: 'user',
        text: ticketMessage.trim(),
        createdAt: Date.now()
      });

      setGeneratedTicketId(ticketId);
      setTicketSuccess(true);
      toast.success('Your support ticket has been submitted successfully!');
      
      setTicketSubject('');
      setTicketMessage('');
    } catch (error: any) {
      console.error('Error submitting support ticket:', error);
      toast.error('Could not submit ticket. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentWizardStepKey = wizardHistory[wizardHistory.length - 1];
  const currentStepData = WIZARD_STEPS[currentWizardStepKey as keyof typeof WIZARD_STEPS];

  return (
    <div className="min-h-screen bg-[#07080a] text-white font-sans selection:bg-[#ffcf00]/30 selection:text-black overflow-x-hidden">
      <SEO 
        title="Bivaax Help & Support Portal | Client Help Center"
        description="Search our dynamic knowledge base, solve transaction issues instantly with our Troubleshooting Wizard, or open a high-priority support ticket. Live operations desk active 24/7."
        keywords="Bivaax support, support.bivaax.com, Bivaax help desk, Bivaax FAQ, binary options help, deposit issue Bivaax, 2FA reset, contact Bivaax, live support"
        url="https://support.bivaax.com/"
        type="website"
      />

      {/* BACKGROUND DECORATIVE FX */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#ffcf00]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* FLOATING HEADER */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#07080a]/90 backdrop-blur-3xl border-b border-white/5 z-50 px-4 sm:px-6 md:px-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <a href="https://bivaax.com" className="flex items-center gap-2.5 sm:gap-3 group">
            <Logo size={40} className="rounded-xl shadow-lg shadow-[#ffcf00]/10 group-hover:scale-105 transition-transform duration-300" withBackground />
            <div className="flex flex-col">
              <span className="text-[16px] sm:text-[18px] font-black tracking-tighter leading-none mb-0.5 uppercase">Bivaax</span>
              <span className="text-[8px] sm:text-[9px] text-[#ffcf00] font-black uppercase tracking-[0.25em] leading-none">SUPPORT DESK</span>
            </div>
          </a>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Operations Active</span>
            </div>
            <a 
              href="https://bivaax.com" 
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-[12px] font-black text-gray-300 hover:text-white transition-colors uppercase tracking-widest border border-white/5 hover:border-white/10 bg-white/5"
            >
              Back to Main
            </a>
          </div>
        </div>
      </header>

      {/* OPERATIONS METRICS DESK (SLA LIVE) */}
      <section className="pt-24 sm:pt-28 pb-4 bg-[#0a0c10] border-b border-white/5 relative z-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 bg-[#101115]/30 border border-white/5 rounded-2xl p-3 sm:p-4 hover:border-[#ffcf00]/10 transition-colors duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Activity size={16} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-wider truncate">System Status</span>
              <span className="text-white text-[10px] sm:text-xs font-black uppercase tracking-wide truncate block">100% Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-[#101115]/30 border border-white/5 rounded-2xl p-3 sm:p-4 hover:border-[#ffcf00]/10 transition-colors duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#ffcf00]/10 flex items-center justify-center text-[#ffcf00] shrink-0">
              <Clock size={16} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-wider truncate">Avg Chat Queue</span>
              <span className="text-white text-[10px] sm:text-xs font-black truncate block">{liveWait}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-[#101115]/30 border border-white/5 rounded-2xl p-3 sm:p-4 hover:border-[#ffcf00]/10 transition-colors duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <Users size={16} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-wider truncate">Agents Online</span>
              <span className="text-white text-[10px] sm:text-xs font-black truncate block">{activeAgents} Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-[#101115]/30 border border-white/5 rounded-2xl p-3 sm:p-4 hover:border-[#ffcf00]/10 transition-colors duration-300 col-span-2 lg:col-span-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
              <CheckCircle size={16} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-wider truncate">Solved Today</span>
              <span className="text-white text-[10px] sm:text-xs font-black truncate block">{resolvedToday.toLocaleString()} Cases</span>
            </div>
          </div>
        </div>
      </section>

      {/* HERO SECTION */}
      <section className="pt-12 sm:pt-16 pb-12 px-4 sm:px-6 md:px-12 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffcf00]/10 border border-[#ffcf00]/20 rounded-full mb-6"
        >
          <Sparkles size={14} className="text-[#ffcf00]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ffcf00]">Official Client Help Desk</span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
          How can we <span className="bg-gradient-to-r from-[#ffcf00] to-[#e69d00] bg-clip-text text-transparent">assist your</span> trades?
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          Access high-resolution answers, diagnose your account security, use the automated Troubleshooting Wizard, or submit a priority support ticket.
        </p>

        {/* SEARCH BOX */}
        <div className="max-w-2xl mx-auto relative mb-6">
          <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <input 
            type="text" 
            placeholder="Search help topics (e.g., USDT TRC-20, verification, 2FA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101115] border border-white/10 hover:border-[#ffcf00]/30 focus:border-[#ffcf00] focus:ring-1 focus:ring-[#ffcf00] rounded-2xl py-4 sm:py-5 pl-12 sm:pl-14 pr-6 text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 shadow-2xl"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      {/* INTERACTIVE TROUBLESHOOTING WIZARD */}
      <section className="py-8 px-6 md:px-12 max-w-4xl mx-auto relative z-10">
        <div className="bg-[#101115] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#ffcf00]/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BadgeAlert size={18} className="text-[#ffcf00]" />
                <h3 className="text-lg font-black tracking-tight uppercase">Automated Troubleshooter</h3>
              </div>
              <p className="text-xs text-gray-400">Answer 2 simple questions to find instant, step-by-step resolution instructions.</p>
            </div>
            {(wizardHistory.length > 1 || wizardAction) && (
              <div className="flex gap-2">
                <button 
                  onClick={handleWizardBack}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleWizardReset}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!wizardAction ? (
              <motion.div 
                key={currentWizardStepKey}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h4 className="text-sm md:text-base font-bold text-gray-200">{currentStepData?.question}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentStepData?.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleWizardOption(opt.next || opt.action || '')}
                      className="p-4 bg-[#07080a] border border-white/5 hover:border-[#ffcf00]/40 rounded-2xl text-left text-xs md:text-sm transition-all flex items-center justify-between group"
                    >
                      <span className="font-bold text-gray-300 group-hover:text-white">{opt.label}</span>
                      <ChevronRight size={16} className="text-gray-500 group-hover:text-[#ffcf00] transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={wizardAction}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                  <CheckCircle className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                      Recommended Action: {WIZARD_ACTIONS[wizardAction]?.title}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{WIZARD_ACTIONS[wizardAction]?.text}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Follow these steps to resolve:</span>
                  {WIZARD_ACTIONS[wizardAction]?.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#07080a] border border-white/5 rounded-xl">
                      <div className="w-6 h-6 rounded-lg bg-[#ffcf00]/15 text-[#ffcf00] flex items-center justify-center text-xs font-black flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <span className="text-gray-500 text-[11px]">Still need help? Open a high priority ticket below.</span>
                  <button 
                    onClick={handleWizardReset}
                    className="w-full sm:w-auto bg-[#ffcf00] hover:bg-[#e6b800] text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    Start Over <RefreshCw size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* TOPICS ACCORDION SELECTION */}
      <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-xs text-[#ffcf00] font-black uppercase tracking-widest block mb-1">Detailed Manuals</span>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight">Interactive Knowledge Categories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { id: 'funding', title: 'Funding & Deposits', count: '4 Detailed articles', color: 'bg-[#ffcf00]/10 border-[#ffcf00]/20 text-[#ffcf00]', icon: CreditCard },
            { id: 'withdrawals', title: 'Payouts & Cashouts', count: '3 Detailed articles', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', icon: Zap },
            { id: 'kyc', title: 'KYC & Verification', count: '2 Detailed articles', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', icon: Shield },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button 
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[#101115] border-[#ffcf00] shadow-2xl' 
                    : 'bg-[#101115]/30 border-white/5 hover:border-white/10 hover:bg-[#101115]'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${cat.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] bg-white/5 text-gray-400 font-bold px-2.5 py-1 rounded-lg">{cat.count}</span>
                </div>
                <h4 className="font-black text-sm md:text-base mb-1">{cat.title}</h4>
                <p className="text-xs text-gray-500">Click to view all specialized answers.</p>
              </button>
            );
          })}
        </div>

        {/* FAQ ACCORDION INNER BOX */}
        <div id="faq-container" className="max-w-4xl mx-auto scroll-mt-24">
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div 
                  key={faq.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'bg-[#101115] border-[#ffcf00]/50' : 'bg-[#101115]/30 border-white/5'
                  }`}
                >
                  <button 
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-sm md:text-base tracking-tight text-white hover:text-[#ffcf00] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#ffcf00]' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6 pt-2 text-xs md:text-sm text-gray-300 leading-relaxed border-t border-white/5 bg-[#07080a]/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW FEATURE: DIAGNOSTIC SELF CHECKLIST */}
      <section className="py-8 px-6 md:px-12 max-w-4xl mx-auto relative z-10">
        <div className="bg-[#101115] border border-white/10 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black tracking-tight uppercase">Account Security Health-Check</h3>
              <p className="text-xs text-gray-400">Complete this check before depositing to ensure instant withdrawals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-[#07080a] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={checklist.email}
                  onChange={(e) => setChecklist(prev => ({ ...prev, email: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 bg-[#07080a]"
                />
                <span className="text-xs font-bold text-gray-300">My Email Address is Verified</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[#07080a] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={checklist.phone}
                  onChange={(e) => setChecklist(prev => ({ ...prev, phone: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 bg-[#07080a]"
                />
                <span className="text-xs font-bold text-gray-300">Active Mobile Number linked</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[#07080a] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={checklist.pass}
                  onChange={(e) => setChecklist(prev => ({ ...prev, pass: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 bg-[#07080a]"
                />
                <span className="text-xs font-bold text-gray-300">Password has at least 8 characters & symbols</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[#07080a] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={checklist.g2fa}
                  onChange={(e) => setChecklist(prev => ({ ...prev, g2fa: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 bg-[#07080a]"
                />
                <span className="text-xs font-bold text-gray-300">Google 2FA Code is fully active</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[#07080a] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={checklist.kyc}
                  onChange={(e) => setChecklist(prev => ({ ...prev, kyc: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 bg-[#07080a]"
                />
                <span className="text-xs font-bold text-gray-300">NID / Passport high-res photo uploaded</span>
              </label>
            </div>

            {/* Diagnostic Result Screen */}
            <div className="bg-[#07080a] border border-white/5 p-6 rounded-2xl text-center space-y-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Security Score</span>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#101115" strokeWidth="8" fill="transparent" />
                  <circle cx="48" cy="48" r="40" stroke={diagnosticScore === 100 ? '#10b981' : (diagnosticScore >= 60 ? '#f59e0b' : '#ef4444')} strokeWidth="8" fill="transparent" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * diagnosticScore) / 100}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-xl font-black text-white">{diagnosticScore}%</span>
              </div>
              <div>
                {diagnosticScore === 100 ? (
                  <p className="text-xs font-bold text-emerald-400">Excellent! Your account is 100% secure.</p>
                ) : (
                  <p className="text-xs text-gray-400">Complete all checks to shield your profits.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIORITY SUPPORT TICKET SUBMISSION */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-white/5">
        
        {/* Contact Links */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Direct Live Chat Contacts</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 uppercase">Direct Channels</h2>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-8 max-w-md">
              Need real-time manual assistance from one of our system operators? Connect through our official messaging desks.
            </p>

            <div className="space-y-4">
              <a 
                href="https://t.me/bivaax_trade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-[#101115]/30 hover:bg-[#101115] hover:border-[#ffcf00]/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform duration-300">
                  <Send size={20} />
                </div>
                <div className="flex-grow">
                  <h4 className="text-[14px] font-bold text-white group-hover:text-[#ffcf00] transition-colors">Official Telegram Channel</h4>
                  <p className="text-gray-500 text-[10px]">Real-time broadcasts, community news & direct admin lines.</p>
                </div>
                <ExternalLink size={14} className="text-gray-500 group-hover:text-white transition-colors" />
              </a>

              <a 
                href="mailto:support@bivaax.com" 
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-[#101115]/30 hover:bg-[#101115] hover:border-[#ffcf00]/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#ffcf00]/10 flex items-center justify-center text-[#ffcf00] group-hover:scale-105 transition-transform duration-300">
                  <Mail size={20} />
                </div>
                <div className="flex-grow">
                  <h4 className="text-[14px] font-bold text-white group-hover:text-[#ffcf00] transition-colors">Operations Email Helpdesk</h4>
                  <p className="text-gray-500 text-[10px]">support@bivaax.com — Priority verification & SLA.</p>
                </div>
                <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          <div className="mt-8 text-gray-500 text-xs leading-relaxed border-t border-white/5 pt-6 hidden lg:block">
            <strong>Security Warning:</strong> Bivaax help desk agents will never ask you to transfer funds to external private wallets or ask for your master password/2FA key. Always verify URLs.
          </div>
        </div>

        {/* Ticket Box */}
        <div className="lg:col-span-7">
          <div className="bg-[#101115] border border-white/10 rounded-3xl p-6 md:p-8 relative shadow-2xl">
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mb-1">Create Support Ticket</h3>
              <p className="text-xs text-gray-400">Submit an emergency ticket directly to our network queue.</p>
            </div>

            <AnimatePresence mode="wait">
              {!ticketSuccess ? (
                <motion.form 
                  key="form"
                  onSubmit={handleCreateTicket} 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Registered Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="yourname@gmail.com"
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        className="w-full bg-[#07080a] border border-white/10 focus:border-[#ffcf00] rounded-xl px-4 py-3.5 text-xs outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Issue Category</label>
                      <select 
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full bg-[#07080a] border border-white/10 focus:border-[#ffcf00] rounded-xl px-4 py-3.5 text-xs outline-none transition-colors text-white"
                      >
                        <option value="Deposit / Funding">Deposit / Funding Issue</option>
                        <option value="Withdrawal Issue">Withdrawal Delay</option>
                        <option value="Account Verification / KYC">KYC Verification Rejection</option>
                        <option value="Two-Factor Auth (2FA)">2FA Code Error / Reset</option>
                        <option value="Technical Bug / Glitch">Trading Terminal Glitch</option>
                        <option value="General Support">General Account Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Subject / Brief Summary</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. USDT BEP-20 deposit completed but status shows pending"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full bg-[#07080a] border border-white/10 focus:border-[#ffcf00] rounded-xl px-4 py-3.5 text-xs outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Detailed Message / Transaction Details</label>
                    <textarea 
                      required 
                      rows={4}
                      placeholder="Please enter your transaction ID, cryptocurrency TxHash, deposit time, or describe the verification problem..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full bg-[#07080a] border border-white/10 focus:border-[#ffcf00] rounded-xl px-4 py-3.5 text-xs outline-none transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-[#ffcf00] hover:bg-[#e6b800] text-black disabled:opacity-50 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#ffcf00]/5"
                  >
                    {submitting ? 'Sending Ticket...' : 'Dispatch Ticket To Queue'}
                    <Send size={14} strokeWidth={2.5} />
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tight mb-2 uppercase">Ticket Successfully Submitted!</h4>
                    <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                      Our dispatch server has queued your case for our finance & safety desk. A response will be sent to your inbox.
                    </p>
                  </div>

                  <div className="bg-[#07080a] border border-white/5 rounded-2xl p-4 max-w-sm mx-auto">
                    <span className="block text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Emergency Tracking ID</span>
                    <span className="text-white font-mono font-black text-sm tracking-widest select-all">{generatedTicketId}</span>
                  </div>

                  <button 
                    onClick={() => {
                      setTicketSuccess(false);
                      setTicketEmail('');
                    }}
                    className="text-xs font-bold text-[#ffcf00] hover:text-white uppercase tracking-widest transition-colors border-b border-dashed border-[#ffcf00] pb-0.5"
                  >
                    Create another ticket <ArrowRight size={12} className="inline ml-1" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#07080a] py-12 px-6 md:px-12 mt-16 text-center text-gray-500 text-xs relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="font-bold text-white">Bivaax Operations</span>
            <span>© 2026. All Rights Reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="https://bivaax.com/page/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="https://bivaax.com/page/terms-conditions" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
