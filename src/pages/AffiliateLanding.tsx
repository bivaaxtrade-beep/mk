import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  ArrowRight, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Zap, 
  ChevronDown, 
  ShieldCheck, 
  MessageSquare,
  Globe,
  PieChart,
  Bot,
  Laptop,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserCheck,
  Download,
  FileText,
  FileCode,
  Shield,
  Clock,
  Briefcase,
  HelpCircle,
  BookOpen,
  ArrowUpRight,
  ChevronRight,
  Star,
  Layers,
  Sparkles
} from 'lucide-react';
import { Logo } from '../components/Logo';
import SEO from '../components/SEO';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, setDoc, doc } from '../firebase';
import { toast } from 'react-hot-toast';
import { getNextAffiliateId, getUserByAffiliateId } from '../lib/affiliate';

export default function AffiliateLandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  // Auth widget states
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password' | 'verify_reset_otp' | 'reset_password'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login flow
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Forgot Password / Reset flow
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Register flow
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);

  // Interactive Calculator State
  const [tradersCount, setTradersCount] = useState(50);
  const [avgTradeVolume, setAvgTradeVolume] = useState(5000);
  const [calculatorModel, setCalculatorModel] = useState<'revshare' | 'cpa' | 'hybrid'>('revshare');

  // Interactive Portal Showcase State
  const [activePortalTab, setActivePortalTab] = useState<'analytics' | 'links' | 'creatives'>('analytics');

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Dynamic RevShare Rate based on referrals count (Aligned with Binola Cortex requirements)
  const getRevShareRate = (count: number) => {
    if (count >= 200) return 80;
    if (count >= 100) return 60;
    if (count >= 50) return 50;
    return 40;
  };

  const revShareRate = getRevShareRate(tradersCount);
  // Estimate platform fee/revenue rate as 2.5% of total traded volume
  const estimatedPlatformRevenue = tradersCount * avgTradeVolume * 0.025;
  const estimatedMonthlyCommission = (estimatedPlatformRevenue * (revShareRate / 100)).toFixed(2);
  const estimatedCpaPayout = tradersCount * 150; // $150 average CPA payout

  const faqs = [
    {
      q: "What is Bivaax Partners and how does it work?",
      a: "Bivaax Partners is our official affiliate marketing program. It enables content creators, community leaders, digital marketers, and trading experts to monetize their traffic. By promoting Bivaax with your unique tracking link, you earn a substantial lifetime commission of up to 80% of platform revenue generated from every trade your referrals make."
    },
    {
      q: "How high is the commission rate?",
      a: "We offer an escalating hybrid Revenue Share structure. You start at 50% flat commission rate of platform revenue, which scales automatically up to 80% based on active referral count. We also support sub-affiliate tiers, allowing you to earn an extra 10% from partners you refer."
    },
    {
      q: "When and how are payouts processed?",
      a: "Affiliate commissions are synchronized instantly in your partner vault. Payout requests are processed every hour with a low minimum threshold of only $10. We support fast withdrawals to verified USDT (TRC-20) addresses as well as other global fiat integrations inside your portal with zero platform charges."
    },
    {
      q: "Do I get dedicated marketing support?",
      a: "Standard, Silver, and VIP affiliates all gain access to our custom promotional hub. This includes landing page builders, interactive analytics dashboards, custom campaign tracking (Sub-IDs), localized brand kits, high-converting banner ads, and a highly responsive 24/7 dedicated partner support team."
    },
    {
      q: "Is there any cost to join?",
      a: "None whatsoever. Bivaax Partners is a completely free program. Registration takes less than 2 minutes, and your partner tracking credentials are generated instantly so you can start converting your audience immediately."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Handle Partner Login OTP request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/partner/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }
      setOtpSent(true);
      setCountdown(300); // 5 minutes
      toast.success("Security OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Partner Login verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/partner/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Incorrect security code.");
      }

      // OTP is valid! Log in the user client side
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back, Partner!");
      navigate('/affiliate');
    } catch (err: any) {
      toast.error(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Partner Registration OTP request
  const handleRequestRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !regEmail || !regPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!agreed) {
      toast.error("You must agree to the Partnership Agreement.");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/partner/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, fullName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send verification code.");
      
      setRegOtpSent(true);
      setCountdown(300);
      toast.success("Registration OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Partner Registration completion
  const handlePartnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtpCode) {
      toast.error("Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify Registration OTP
      const verifyResponse = await fetch('/api/auth/partner/verify-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, otp: regOtpCode })
      });
      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(verifyData.error || "Invalid registration code.");

      const ref = localStorage.getItem('referralCode') || localStorage.getItem('referral_code');
      let finalReferrerUid = null;
      if (ref) {
        try {
          const referrerUser = await getUserByAffiliateId(ref);
          if (referrerUser && referrerUser.uid) {
            finalReferrerUid = referrerUser.uid;
          }
        } catch (err) {
          console.error("Referrer resolution failed:", err);
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const user = userCredential.user;
      const affiliateId = await getNextAffiliateId();

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: fullName,
        balance: 0.0,
        demoBalance: 10000.0,
        currency: 'USD',
        affiliateId: affiliateId,
        referralCode: affiliateId.toString(),
        country: 'Global',
        countryCode: 'US',
        createdAt: Date.now(),
        isVerified: false,
        isPartner: true
      }, { merge: true });

      // Sync user profile to SQL backend
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: fullName,
            nickname: fullName.split(' ')[0],
            country: 'Global',
            countryCode: 'US',
            referralCode: affiliateId.toString(),
            referredByUid: finalReferrerUid || null
          })
        });
      } catch (err) {
        console.warn("Backend sync warning:", err);
      }

      toast.success("Partner account created successfully!");
      navigate('/affiliate');
    } catch (err: any) {
      toast.error(err.message || "Failed to apply for partnership.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password - Request OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reset code.");
      
      setAuthMode('verify_reset_otp');
      toast.success("Security OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Reset OTP
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp) {
      toast.error("Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid reset code.");
      
      setAuthMode('reset_password');
      toast.success("Verification successful!");
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail, 
          token: resetOtp, 
          password: newPassword 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reset password.");
      
      toast.success("Password reset successful! You can now sign in.");
      setAuthMode('login');
      setEmail(resetEmail);
      setPassword('');
      setOtpSent(false);
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-white font-sans selection:bg-[#ffcf00]/30 selection:text-black overflow-x-hidden">
      <SEO 
        title="Bivaax Affiliate & Partners Program | Earn up to 80% RevShare"
        description="Join the official Bivaax Affiliate Program (Bivaax Partners). Earn up to 80% lifetime Revenue Share, custom CPA deals, and instant hourly USDT payouts with zero fees. Access high-converting promotional banners, smart tracking links, and 24/7 dedicated support."
        keywords="bivaax affiliated pogram, bivaax affiliate program, bivaax affiliated program, Bivaax Partners, Bivaax Affiliate, partner.bivaax.com, affiliate.bivaax.com, Bivaax official affiliate program, refer and earn bivaax, earn money online trading, introduce broker program, bivaax registration, bivaax partner sign in, high paying financial affiliate, binary options affiliate, best forex affiliate, bivaax agent bangla, best binary options affiliate program Bangladesh, best forex affiliate program India, opções binárias afiliados Brasil Pix, broker afiliado Mexico, high paying trading affiliate Asia, earn 80% revshare broker, binary options IB program, sub-affiliate, CPA trading commission, bivaax referral code, instant USDT affiliate withdrawal"
        url="https://partner.bivaax.com/"
        type="website"
        isAffiliate={true}
        faqData={faqs.map(item => ({ question: item.q, answer: item.a }))}
      />

      {/* FIXED FLOATING NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#07080a]/85 backdrop-blur-2xl border-b border-white/5 z-50 px-6 md:px-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-[#ffcf00] to-[#e69d00] rounded-xl shadow-lg shadow-[#ffcf00]/10 group-hover:scale-105 transition-transform duration-300">
              <Logo size={22} color="black" />
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-black tracking-tighter leading-none mb-0.5 uppercase">Bivaax</span>
              <span className="text-[9px] text-[#ffcf00] font-black uppercase tracking-[0.25em] leading-none">PARTNERS</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              to="/affiliate-rules" 
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-gray-300 hover:text-white transition-colors border border-white/5 hover:border-white/10 bg-white/5"
            >
              <Award size={14} className="text-[#ffcf00]" /> Rules & Levels
            </Link>
            <button 
              onClick={() => {
                setAuthMode('login');
                setOtpSent(false);
                const el = document.getElementById('auth-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="px-5 py-2.5 rounded-xl text-[13px] font-black text-gray-300 hover:text-white transition-colors uppercase tracking-widest border border-white/5 hover:border-white/10 bg-white/5"
            >
              Sign In
            </button>
            <button 
              onClick={() => {
                setAuthMode('register');
                const el = document.getElementById('auth-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="bg-[#ffcf00] hover:bg-[#e6b800] text-black px-6 py-2.5 rounded-xl text-[13px] font-black transition-all shadow-xl shadow-[#ffcf00]/5 hover:shadow-[#ffcf00]/20 flex items-center gap-2 uppercase tracking-widest"
            >
              Apply Now <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO & SPLIT WORKSPACE SECTION */}
      <section className="pt-32 pb-24 px-6 md:px-12 relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">
        {/* Decorative Grid Background and Mesh */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-[#ffcf00]/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Left Side: Elegant copy & stats */}
        <div className="lg:col-span-7 space-y-8 z-10">
          <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 border border-[#ffcf00]/20 px-4 py-1.5 rounded-full">
            <Award size={16} className="text-[#ffcf00]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ffcf00]">Elite Multi-Tier IB Program</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] text-white">
            Monetize Traffic <br />With Up To <span className="text-[#ffcf00]">80% RevShare</span>
          </h1>
          <p className="text-gray-400 text-base md:text-xl max-w-xl font-medium leading-relaxed">
            Partner with the world's most transparent and high-payout trading system. Access localized brand banners, smart sub-tracking links, and instant payout processing.
          </p>

          {/* Core Program Achievements Ticker */}
          <div className="grid grid-cols-3 gap-6 py-6 border-y border-white/5 max-w-2xl">
            <div>
              <div className="text-2xl md:text-4xl font-black text-[#ffcf00]">$4.8M+</div>
              <div className="text-[10px] md:text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">Commissions Paid</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-black text-white">12,400+</div>
              <div className="text-[10px] md:text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">Active Partners</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-black text-emerald-500">67.4%</div>
              <div className="text-[10px] md:text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">Average CR</div>
            </div>
          </div>

          {/* Mini benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 max-w-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 mt-0.5">
                <Zap size={16} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-white">Hourly Instant Payouts</h4>
                <p className="text-[12px] text-gray-500 mt-0.5">No holding periods. Withdraw instantly via USDT with zero fees.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 mt-0.5">
                <Users size={16} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-white">2-Tier Sub-Affiliate Program</h4>
                <p className="text-[12px] text-gray-500 mt-0.5">Earn an additional passive 10% from partners you introduce.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High Fidelity Auth Card */}
        <div id="auth-section" className="lg:col-span-5 z-10">
          <div className="bg-[#121318]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient gold card glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#ffcf00]/10 blur-xl rounded-full" />

            {/* Form Tabs */}
            {['login', 'register'].includes(authMode) && (
              <div className="flex border-b border-white/5 mb-6">
                <button 
                  onClick={() => {
                    setAuthMode('login');
                    setOtpSent(false);
                  }} 
                  className={`flex-1 pb-4 text-center text-sm font-bold uppercase tracking-wider transition-colors relative ${authMode === 'login' ? 'text-[#ffcf00]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Sign In
                  {authMode === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf00]" />}
                </button>
                <button 
                  onClick={() => setAuthMode('register')} 
                  className={`flex-1 pb-4 text-center text-sm font-bold uppercase tracking-wider transition-colors relative ${authMode === 'register' ? 'text-[#ffcf00]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Apply Now
                  {authMode === 'register' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf00]" />}
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {authMode === 'login' ? (
                <motion.div
                  key="login-form-pane"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  {!otpSent ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Partner Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                          <input 
                            type="email" 
                            required
                            placeholder="partner@yourdomain.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#181920] border border-white/5 hover:border-white/10 focus:border-[#ffcf00] rounded-xl pl-12 pr-4 py-3.5 text-sm placeholder-gray-600 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            placeholder="••••••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#181920] border border-white/5 hover:border-white/10 focus:border-[#ffcf00] rounded-xl pl-12 pr-12 py-3.5 text-sm placeholder-gray-600 focus:outline-none transition-colors"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            setAuthMode('forgot_password');
                            setResetEmail(email);
                          }}
                          className="text-[10px] font-black text-[#ffcf00] hover:underline uppercase tracking-widest"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#ffcf00] hover:bg-[#e6b800] text-black h-13 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-4"
                      >
                        {loading ? "Checking Credentials..." : "Proceed & Send Code"}
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <div className="text-center space-y-2">
                        <div className="inline-flex p-3 bg-[#ffcf00]/10 border border-[#ffcf00]/20 rounded-full text-[#ffcf00]">
                          <ShieldCheck size={28} />
                        </div>
                        <h4 className="text-lg font-black">Email OTP Verification</h4>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          We have sent a secure 6-digit confirmation code to <strong className="text-gray-200">{email}</strong>.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Security Code</label>
                        <input 
                          type="text" 
                          maxLength={6}
                          required
                          placeholder="000000" 
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-[#181920] border border-white/5 focus:border-[#ffcf00] rounded-xl px-4 py-4 text-center text-2xl font-black tracking-[0.4em] focus:outline-none placeholder-gray-700"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#ffcf00] hover:bg-[#e6b800] text-black h-13 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Confirm & Access Portal"}
                      </button>

                      <div className="text-center">
                        {countdown > 0 ? (
                          <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Resend Code in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                        ) : (
                          <button 
                            type="button" 
                            onClick={handleRequestOtp}
                            className="text-[11px] text-[#ffcf00] hover:underline font-black uppercase tracking-widest"
                          >
                            Resend Verification Code
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </motion.div>
              ) : authMode === 'register' ? (
                <motion.div
                  key="register-form-pane"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  {!regOtpSent ? (
                    <form onSubmit={handleRequestRegisterOtp} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="John Doe" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#181920] border border-white/5 hover:border-white/10 focus:border-[#ffcf00] rounded-xl px-4 py-3.5 text-sm placeholder-gray-600 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Partnership Email</label>
                        <input 
                          type="email" 
                          required
                          placeholder="partner@yourdomain.com" 
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-[#181920] border border-white/5 hover:border-white/10 focus:border-[#ffcf00] rounded-xl px-4 py-3.5 text-sm placeholder-gray-600 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Secure Password</label>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••••••" 
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-[#181920] border border-white/5 hover:border-white/10 focus:border-[#ffcf00] rounded-xl px-4 py-3.5 text-sm placeholder-gray-600 focus:outline-none transition-colors"
                        />
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer select-none py-1">
                        <input 
                          type="checkbox" 
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-700 bg-black text-[#ffcf00] focus:ring-0 mt-0.5 accent-[#ffcf00]"
                        />
                        <span className="text-[11px] text-gray-400 font-medium leading-normal">
                          I hereby agree to the <span className="text-white hover:underline">Bivaax Partners Agreement</span> and standard terms of service.
                        </span>
                      </label>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#ffcf00] hover:bg-[#e6b800] text-black h-13 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                      >
                        {loading ? "Processing..." : "Send Verification Code"}
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handlePartnerRegister} className="space-y-6">
                      <div className="text-center space-y-2">
                        <div className="inline-flex p-3 bg-[#ffcf00]/10 border border-[#ffcf00]/20 rounded-full text-[#ffcf00]">
                          <ShieldCheck size={28} />
                        </div>
                        <h4 className="text-lg font-black">Verify Your Email</h4>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          Enter the 6-digit verification code we sent to <strong className="text-gray-200">{regEmail}</strong>.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Registration Code</label>
                        <input 
                          type="text" 
                          maxLength={6}
                          required
                          placeholder="000000" 
                          value={regOtpCode}
                          onChange={(e) => setRegOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-[#181920] border border-white/5 focus:border-[#ffcf00] rounded-xl px-4 py-4 text-center text-2xl font-black tracking-[0.4em] focus:outline-none placeholder-gray-700"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#ffcf00] hover:bg-[#e6b800] text-black h-13 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Complete Registration"}
                      </button>

                      <div className="text-center">
                        <button 
                          type="button" 
                          onClick={() => setRegOtpSent(false)}
                          className="text-[11px] text-gray-500 hover:text-white font-black uppercase tracking-widest transition-colors"
                        >
                          Change Email Address
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              ) : authMode === 'forgot_password' ? (
                <motion.div
                  key="forgot-password-pane"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-black">Reset Password</h4>
                    <p className="text-xs text-gray-400">Enter your partner email to receive a reset code.</p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Partner Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                          type="email" 
                          required
                          placeholder="partner@yourdomain.com" 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full bg-[#181920] border border-white/5 hover:border-white/10 focus:border-[#ffcf00] rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#ffcf00] hover:bg-[#e6b800] text-black h-13 font-black uppercase text-xs tracking-widest rounded-xl transition-all disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send Reset Code"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('login')}
                      className="w-full text-[11px] font-black text-gray-500 hover:text-white uppercase tracking-widest text-center transition-colors"
                    >
                      Back to Sign In
                    </button>
                  </form>
                </motion.div>
              ) : authMode === 'verify_reset_otp' ? (
                <motion.div
                  key="verify-reset-otp-pane"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-[#ffcf00]/10 border border-[#ffcf00]/20 rounded-full text-[#ffcf00]">
                      <ShieldCheck size={28} />
                    </div>
                    <h4 className="text-lg font-black">Reset Code Sent</h4>
                    <p className="text-xs text-gray-400">Please enter the 6-digit code sent to your email.</p>
                  </div>
                  <form onSubmit={handleVerifyResetOtp} className="space-y-6">
                    <input 
                      type="text" 
                      maxLength={6}
                      required
                      placeholder="000000" 
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-[#181920] border border-white/5 focus:border-[#ffcf00] rounded-xl px-4 py-4 text-center text-2xl font-black tracking-[0.4em] focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#ffcf00] hover:bg-[#e6b800] text-black h-13 font-black uppercase text-xs tracking-widest rounded-xl transition-all disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify Reset Code"}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="reset-password-pane"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-black">Create New Password</h4>
                    <p className="text-xs text-gray-400">Set a strong password for your partner account.</p>
                  </div>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          minLength={6}
                          placeholder="••••••••••••" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#181920] border border-white/5 hover:border-white/10 focus:border-[#ffcf00] rounded-xl pl-12 pr-12 py-3.5 text-sm focus:outline-none transition-colors"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#ffcf00] hover:bg-[#e6b800] text-black h-13 font-black uppercase text-xs tracking-widest rounded-xl transition-all disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CORE PARTNERSHIP PILLARS (BENTO) */}
      <section className="py-24 bg-[#0a0b0e] border-y border-white/5 px-6 md:px-12 relative">
        <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Comprehensive <span className="text-[#ffcf00]">Ecosystem</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">We deliver unmatched technological solutions, robust conversion frameworks, and prompt commission settlements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#121318]/50 border border-white/5 rounded-3xl p-8 hover:border-[#ffcf00]/20 hover:bg-[#121318]/80 transition-all group">
              <div className="w-12 h-12 bg-[#ffcf00]/10 rounded-xl flex items-center justify-center text-[#ffcf00] mb-6 group-hover:scale-110 transition-transform">
                <Percent size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold">Dynamic Revenue Streams</h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">Earn a significant portion of the platform fee from every single transaction executed by your referred traders for their lifetime, with tiers scaling seamlessly up to 80% RevShare.</p>
            </div>

            <div className="bg-[#121318]/50 border border-white/5 rounded-3xl p-8 hover:border-[#ffcf00]/20 hover:bg-[#121318]/80 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Laptop size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold">Innovative Partner Suite</h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">Access real-time conversion stats, high-converting pre-made banners, customized smart redirect sub-ID trackers, landing page construction templates, and full brand guideline asset kits.</p>
            </div>

            <div className="bg-[#121318]/50 border border-white/5 rounded-3xl p-8 hover:border-[#ffcf00]/20 hover:bg-[#121318]/80 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <DollarSign size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold">No-Barrier Instant Withdrawals</h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">No hold periods, limits, or hidden fees. Initiate withdrawals whenever you want. Your commission balance is processed every hour with a low $10 minimum via USDT, Bitcoin, or wire transfer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE EARNINGS ESTIMATOR */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#121318] to-[#07080a] border border-white/5 rounded-[32px] p-8 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ffcf00]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="lg:col-span-6 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Interactive <span className="text-[#ffcf00]">Calculator</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Use our dynamic slider model to see how much commissions you will generate based on your chosen program model.</p>
            
            {/* Model Selectors */}
            <div className="flex bg-[#181920] p-1.5 rounded-xl border border-white/5">
              <button 
                onClick={() => setCalculatorModel('revshare')} 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${calculatorModel === 'revshare' ? 'bg-[#ffcf00] text-black font-black' : 'text-gray-400 hover:text-white'}`}
              >
                Revenue Share
              </button>
              <button 
                onClick={() => setCalculatorModel('cpa')} 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${calculatorModel === 'cpa' ? 'bg-[#ffcf00] text-black font-black' : 'text-gray-400 hover:text-white'}`}
              >
                CPA Deal
              </button>
              <button 
                onClick={() => setCalculatorModel('hybrid')} 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${calculatorModel === 'hybrid' ? 'bg-[#ffcf00] text-black font-black' : 'text-gray-400 hover:text-white'}`}
              >
                Hybrid Model
              </button>
            </div>

            <div className="space-y-8 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">Monthly Active Referrals</span>
                  <span className="text-[#ffcf00] font-black">{tradersCount} Traders</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="500" 
                  value={tradersCount} 
                  onChange={(e) => setTradersCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#181920] rounded-full appearance-none cursor-pointer accent-[#ffcf00]"
                />
              </div>

              {calculatorModel !== 'cpa' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-400">Average Trader Monthly Volume</span>
                    <span className="text-blue-400 font-black">${avgTradeVolume.toLocaleString()} USD</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="50000" 
                    step="1000"
                    value={avgTradeVolume} 
                    onChange={(e) => setAvgTradeVolume(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#181920] rounded-full appearance-none cursor-pointer accent-blue-400"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#181920]/80 border border-white/5 rounded-3xl p-8 relative">
              <div className="absolute top-4 right-4 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black px-3 py-1 rounded-full uppercase tracking-wider">Live Estimate</div>
              
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest">Est. Monthly Commission</span>
                  <div className="text-4xl md:text-5xl font-black text-[#ffcf00] tracking-tighter mt-1">
                    ${calculatorModel === 'revshare' ? Number(estimatedMonthlyCommission).toLocaleString(undefined, {minimumFractionDigits: 2}) : 
                      calculatorModel === 'cpa' ? estimatedCpaPayout.toLocaleString() : 
                      (Number(estimatedMonthlyCommission) + (tradersCount * 50)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Your Comm. Rate</span>
                    <div className="text-lg font-black text-white mt-1">
                      {calculatorModel === 'revshare' ? `${revShareRate}% RevShare` : 
                       calculatorModel === 'cpa' ? "$150 CPA Flat" : 
                       `${revShareRate}% + $50 CPA`}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Est. Annual Earnings</span>
                    <div className="text-lg font-black text-emerald-500 mt-1">
                      ${calculatorModel === 'revshare' ? (Number(estimatedMonthlyCommission) * 12).toLocaleString(undefined, {maximumFractionDigits: 0}) : 
                        calculatorModel === 'cpa' ? (estimatedCpaPayout * 12).toLocaleString() : 
                        ((Number(estimatedMonthlyCommission) + (tradersCount * 50)) * 12).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </div>
                  </div>
                </div>

                <div className="bg-[#121318] p-4 rounded-xl border border-white/5">
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                    *Estimates are calculated using a baseline platform margin of 2.5%. Lifetime referrals earn you continuous payouts as long as they remain active. There is no commission limit.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    const el = document.getElementById('auth-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-white hover:bg-gray-200 text-black h-14 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Create Partner Account <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL DASHBOARD SHOWCASE (HIGH-FIDELITY PREVIEW) */}
      <section className="py-24 bg-[#0a0b0e] border-y border-white/5 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Advanced <span className="text-[#ffcf00]">Partner Portal</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Get real-time monitoring, instant link generation, and complete marketing asset catalogs in a single workspace.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Showcase Left: Menu Switchers */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <button 
                  onClick={() => setActivePortalTab('analytics')}
                  className={`w-full p-6 text-left border rounded-2xl flex items-center gap-4 transition-all ${activePortalTab === 'analytics' ? 'bg-[#ffcf00]/10 border-[#ffcf00]/30 text-[#ffcf00]' : 'bg-[#121318]/40 border-white/5 text-gray-400 hover:text-white hover:bg-[#121318]/60'}`}
                >
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Real-time Advanced Analytics</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Monitor registrations, click-rates, deposits, and income.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActivePortalTab('links')}
                  className={`w-full p-6 text-left border rounded-2xl flex items-center gap-4 transition-all ${activePortalTab === 'links' ? 'bg-[#ffcf00]/10 border-[#ffcf00]/30 text-[#ffcf00]' : 'bg-[#121318]/40 border-white/5 text-gray-400 hover:text-white hover:bg-[#121318]/60'}`}
                >
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Smart Tracking Link Generator</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Generate custom target URLs and assign custom sub-IDs.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActivePortalTab('creatives')}
                  className={`w-full p-6 text-left border rounded-2xl flex items-center gap-4 transition-all ${activePortalTab === 'creatives' ? 'bg-[#ffcf00]/10 border-[#ffcf00]/30 text-[#ffcf00]' : 'bg-[#121318]/40 border-white/5 text-gray-400 hover:text-white hover:bg-[#121318]/60'}`}
                >
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Promotional Creative Assets</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Download pre-made landing banners, icons, and localized copies.</p>
                  </div>
                </button>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 text-[#ffcf00] font-black text-xs uppercase tracking-wider">
                  <Bot size={18} />
                  <span>Interactive API Integration</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">
                  Connect your CRM directly to our server with low-latency S2S tracking webhooks and REST endpoints.
                </p>
              </div>
            </div>

            {/* Showcase Right: Rendered Dashboard Interface Mockup */}
            <div className="lg:col-span-8 bg-[#121318] border border-white/5 rounded-[32px] overflow-hidden flex flex-col min-h-[480px]">
              {/* Terminal Window Header */}
              <div className="h-12 bg-black/40 border-b border-white/5 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 border border-red-500/30" />
                  <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                  <span className="w-3.5 h-3.5 rounded-full bg-green-500/20 border border-green-500/30" />
                  <span className="text-[11px] text-gray-600 font-black uppercase tracking-wider ml-2">Bivaax Affiliate Terminal</span>
                </div>
                <div className="text-[10px] font-mono text-gray-500">HTTPS://PARTNER.BIVAAX.COM/DASHBOARD</div>
              </div>

              {/* Terminal Content Panel */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {activePortalTab === 'analytics' && (
                    <motion.div 
                      key="analytics-preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 flex-1 flex flex-col justify-between"
                    >
                      {/* Top metric panels */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Total Hits</span>
                          <div className="text-xl font-black text-white mt-1">452,109</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Registrations</span>
                          <div className="text-xl font-black text-[#ffcf00] mt-1">14,892</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">New Deposits</span>
                          <div className="text-xl font-black text-emerald-500 mt-1">8,452</div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Net Commission</span>
                          <div className="text-xl font-black text-white mt-1">$48,251.20</div>
                        </div>
                      </div>

                      {/* Mock performance analytics chart */}
                      <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex-1 min-h-[180px] flex flex-col justify-between">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          <span>Performance Trend (Last 7 Days)</span>
                          <span className="text-emerald-400">CR +3.4% This Week</span>
                        </div>
                        <div className="flex items-end justify-between h-28 pt-4 gap-2">
                          {[35, 60, 45, 90, 75, 110, 140].map((val, idx) => (
                            <div key={`chart-bar-${idx}`} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full bg-gradient-to-t from-[#ffcf00]/20 to-[#ffcf00] rounded-t-md" style={{ height: `${val}px` }} />
                              <span className="text-[8px] text-gray-600 font-black font-mono">DAY {idx+1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePortalTab === 'links' && (
                    <motion.div 
                      key="links-preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 flex-1 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold">Generated Custom Campaign Link</h4>
                        <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                          <code className="text-xs font-mono text-[#ffcf00] break-all select-all">https://bivaax.com/register?ref=partner999&sub=email_campaign</code>
                          <button 
                            onClick={() => toast.success("Copied tracker link to clipboard!")}
                            className="bg-[#ffcf00] hover:bg-[#e6b800] text-black font-black text-[11px] px-4 py-2 rounded-lg uppercase tracking-wider shrink-0 transition-colors"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Campaign Target</label>
                          <select className="w-full bg-black/20 border border-white/5 p-3 rounded-lg text-xs font-medium focus:outline-none focus:border-[#ffcf00]">
                            <option>Registration Landing Page (Default)</option>
                            <option>Platform Trade Terminal</option>
                            <option>VIP Bonus Promo</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Custom tracking sub-ID</label>
                          <input 
                            placeholder="e.g. facebook_ads" 
                            className="w-full bg-black/20 border border-white/5 p-3 rounded-lg text-xs font-medium focus:outline-none focus:border-[#ffcf00] placeholder-gray-700"
                          />
                        </div>
                      </div>

                      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                          *Sub-ID channels allow you to monitor CTR (Click-Through Rate), registration ratios, and ROI for separate advertising setups (Google Ads, Telegram influencers, Email blasts) instantly in your dashboard.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activePortalTab === 'creatives' && (
                    <motion.div 
                      key="creatives-preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 items-start"
                    >
                      {[
                        { name: "Global Main Banner", size: "728x90 px", lang: "EN/ES/BD" },
                        { name: "Bonus Promo Square", size: "1080x1080 px", lang: "EN/BD" },
                        { name: "Telegram Mini Banner", size: "1200x628 px", lang: "EN/RU/BD" },
                        { name: "Platform Video Teaser", size: "1920x1080 mp4", lang: "EN" },
                        { name: "Introducing Guide PDF", size: "A4 Size", lang: "EN/BD/ES" },
                        { name: "Direct Native Copy Kit", size: "Text File", lang: "Global" }
                      ].map((item, idx) => (
                        <div key={`creative-item-${idx}`} className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[110px] hover:border-[#ffcf00]/20 transition-colors">
                          <div>
                            <div className="font-bold text-xs line-clamp-1">{item.name}</div>
                            <div className="text-[10px] text-gray-500 mt-1 font-mono">{item.size}</div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-400 font-mono font-bold uppercase">{item.lang}</span>
                            <button 
                              onClick={() => toast.success(`Preparing ${item.name} download...`)}
                              className="text-gray-400 hover:text-[#ffcf00]"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE MULTIPLIER (SUB-AFFILIATE TREE) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Sub-affiliate tree graphics */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-[#ffcf00]/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="bg-[#121318] border border-white/5 p-8 rounded-[32px] relative z-10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Multi-Level commission tier</span>
                <span className="text-xs bg-[#ffcf00]/10 border border-[#ffcf00]/20 text-[#ffcf00] font-black px-2.5 py-1 rounded-full">+10% passive income</span>
              </div>

              {/* Visual hierarchy map */}
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-xl border border-[#ffcf00]/25 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#ffcf00]/10 flex items-center justify-center text-[#ffcf00]">
                      <UserCheck size={16} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">Your Partner Account (Tier 1)</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">Direct referral commissions</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#ffcf00]">Up to 80% RevShare</span>
                </div>

                <div className="w-0.5 h-6 bg-dashed bg-[#ffcf00]/40 ml-8 border-l border-dashed border-[#ffcf00]/30" />

                <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center justify-between ml-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Users size={14} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">Sub-Affiliates Referred By You (Tier 2)</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">Partners who sign up under you</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-400">+10% Flat Payout</span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-[11px] text-gray-500 leading-relaxed font-medium">
                <strong>Example:</strong> If a sub-affiliate you introduced generates $10,000 USD in platform commissions this month, you will receive $1,000 USD paid instantly to your balance, without affecting their income.
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Sub-Partner <span className="text-[#ffcf00]">Network</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed">
              Scale your earnings passively beyond direct user promotions. Introduce other publishers, bloggers, influencers, or signals group admins to the Bivaax network and receive an extra 10% flat on all commission revenue they process.
            </p>
            <div className="space-y-4">
              {[
                "Dual tracking mechanics for multi-tier referrals",
                "Earnings are synchronized and processed in your unified portal",
                "Unlimited sub-partners and passive cashflow potential",
                "No negative balance carryover across tiers"
              ].map((item, idx) => (
                <div key={`sub-aff-benefit-${idx}`} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ffcf00]/10 flex items-center justify-center text-[#ffcf00]">
                    <CheckCircle size={12} />
                  </div>
                  <span className="text-xs font-bold text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE PATHWAYS TO COMMISSIONS */}
      <section className="py-24 bg-[#0a0b0e] border-t border-white/5 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">How It <span className="text-[#ffcf00]">Works</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Follow these straightforward steps to launch your tracking framework and start accumulating hourly income.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Join Program", desc: "Complete the free registration. Get approved instantly and access your custom partner portal." },
              { step: "02", title: "Acquire Link", desc: "Construct specialized tracking links and download localized pre-made promotional creative assets." },
              { step: "03", title: "Route Traffic", desc: "Promote Bivaax on your channels, blogs, trading signal groups, or email templates." },
              { step: "04", title: "Withdraw Profits", desc: "Monitor live hits in real-time. Initiate withdrawals every hour via secure USDT transfer." }
            ].map((step, idx) => (
              <div key={`step-guide-${idx}`} className="bg-[#121318]/40 border border-white/5 rounded-2xl p-8 relative hover:bg-[#121318]/60 transition-colors">
                <div className="text-4xl font-black text-[#ffcf00]/20 font-mono absolute top-4 right-6">{step.step}</div>
                <h4 className="text-lg font-bold mt-4">{step.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed mt-3">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLIANCE & RESOURCE DOCUMENT HUB (USER REQUESTED: "আরও সব ডকুমেন্টস দেয়া থাকবে") */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Resources & <span className="text-[#ffcf00]">Compliance</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Download legal documents, official agreement files, visual kits, and direct integration manuals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "Partnership Agreement", desc: "Official affiliate program terms, commission structures, and compliance rules.", file: "Bivaax_Partner_Agreement.pdf", size: "1.4 MB" },
              { icon: Download, title: "Brand Guidelines Kit", desc: "High-resolution transparent logos, colors, visual guides, and banner structures.", file: "Bivaax_Brand_Assets.zip", size: "24.8 MB" },
              { icon: FileCode, title: "API Reference Docs", desc: "Integration manual for server-to-server tracking webhooks and REST S2S configs.", file: "Bivaax_S2S_API_Guide.pdf", size: "840 KB" },
              { icon: Shield, title: "Compliance Guidelines", desc: "Traffic regulation document. Permitted channels, trademark rules, and spam restrictions.", file: "Bivaax_Traffic_Policy.pdf", size: "1.1 MB" }
            ].map((docItem, idx) => (
              <div key={`doc-item-${idx}`} className="bg-[#121318]/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-[#ffcf00]/20 hover:bg-[#121318] transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-[#ffcf00] group-hover:scale-105 transition-transform">
                    <docItem.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{docItem.title}</h4>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{docItem.desc}</p>
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold line-clamp-1 break-all">{docItem.file}</div>
                    <div className="text-[9px] text-gray-600 font-mono mt-0.5">{docItem.size}</div>
                  </div>
                  <button 
                    onClick={() => toast.success(`Preparing ${docItem.file} download...`)}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-[#ffcf00] hover:text-black transition-colors text-gray-400"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER LEVELS & REVENUE STRUCTURE */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#ffcf00]/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Commission <span className="text-[#ffcf00]">Levels</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Our dynamic multi-tier system rewards performance. Reach higher levels to unlock maximum Revenue Share and Turnover payouts.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Revenue Share Table */}
            <div className="bg-[#121318]/60 backdrop-blur-md border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#ffcf00]/10 rounded-2xl flex items-center justify-center text-[#ffcf00]">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Revenue Share (RevShare)</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Lifetime Profit Sharing Deal</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { level: 1, rate: '40%', req: '1 – 10 Regs + 5 FTD' },
                  { level: 2, rate: '50%', req: '50 Regs + 25 FTD' },
                  { level: 3, rate: '60%', req: '100 Regs + 40 FTD' },
                  { level: 4, rate: '70%', req: '200 Regs + 100 FTD' },
                  { level: 5, rate: '80%', req: '200+ Regs + 200 FTD' }
                ].map((tier) => (
                  <div key={`rev-l-${tier.level}`} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#ffcf00]/20 transition-colors group">
                    <div className="flex items-center gap-5">
                      <div className="text-xs font-black text-gray-500 uppercase tracking-widest bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center">L{tier.level}</div>
                      <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Commission Rate</div>
                        <div className="text-xl font-black text-white group-hover:text-[#ffcf00] transition-colors">{tier.rate}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Requirement</div>
                      <div className="text-xs font-bold text-gray-300">{tier.req}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Turnover Table */}
            <div className="bg-[#121318]/60 backdrop-blur-md border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <PieChart size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Turnover Share (Volume)</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Earnings Based on Trading Volume</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { level: 1, rate: '2.0%', req: '1 – 10 Regs + 5 FTD' },
                  { level: 2, rate: '2.5%', req: '50 Regs + 25 FTD' },
                  { level: 3, rate: '3.0%', req: '100 Regs + 40 FTD' },
                  { level: 4, rate: '4.0%', req: '200 Regs + 100 FTD' },
                  { level: 5, rate: '5.0%', req: '200+ Regs + 200 FTD' }
                ].map((tier) => (
                  <div key={`turn-l-${tier.level}`} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-colors group">
                    <div className="flex items-center gap-5">
                      <div className="text-xs font-black text-gray-500 uppercase tracking-widest bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center">L{tier.level}</div>
                      <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Volume Rate</div>
                        <div className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{tier.rate}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Requirement</div>
                      <div className="text-xs font-bold text-gray-300">{tier.req}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-[#ffcf00]/10 border border-white/5 rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Need a custom CPA or Hybrid deal?</h4>
              <p className="text-sm text-gray-400 font-medium">Our VIP managers can structure unique payout models for high-volume traffic sources. Reach out to our partner desk.</p>
            </div>
            <a 
              href="https://t.me/bivaax_partners" 
              target="_blank" 
              rel="noreferrer"
              className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
            >
              Contact VIP Desk
            </a>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-24 bg-[#0a0b0e] border-t border-white/5 px-6 md:px-12 relative">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Frequently Asked <span className="text-[#ffcf00]">Questions</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Can't find what you are looking for? Find direct answers here or reach our partner help desk.</p>
            
            {/* Live Search Input */}
            <div className="max-w-md mx-auto pt-4">
              <input 
                type="text" 
                placeholder="Search partner FAQ database..." 
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full bg-[#121318]/90 border border-white/5 focus:border-[#ffcf00] text-sm px-6 py-4 rounded-xl focus:outline-none placeholder-gray-600 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <div 
                key={`faq-item-${idx}`} 
                className="bg-[#121318]/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 text-white hover:text-[#ffcf00] transition-colors"
                >
                  <span className="font-bold text-sm md:text-base leading-tight">{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`shrink-0 text-gray-500 transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-[#ffcf00]" : ""}`} 
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-6 text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm font-medium">No FAQ records found matching your keywords.</div>
            )}
          </div>
        </div>
      </section>

      {/* PARTNERS HELP DESK CENTER */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#121318] to-black border border-white/5 rounded-[32px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 text-[#ffcf00] font-black text-xs uppercase tracking-wider">
              <MessageSquare size={16} />
              <span>Dedicated Support Matrix</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Connect With A Partner Manager</h2>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              We provide VIP managers to our Standard, Silver, and Gold level affiliates. Discuss customized deals, custom branding configurations, integration help, and payouts questions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <a 
              href="mailto:partners@bivaax.com"
              className="flex-1 bg-white hover:bg-gray-200 text-black px-8 py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-center"
            >
              Email Support
            </a>
            <a 
              href="https://t.me/bivaax_partners" 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 bg-[#24A1DE] hover:bg-[#208fbe] text-white px-8 py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-center"
            >
              Telegram Desk
            </a>
          </div>
        </div>
      </section>

      {/* AFFILIATE SUPPORT & WITHDRAWAL POLICY */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-[#121318]/90 border border-white/5 rounded-[36px] p-8 md:p-14 space-y-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} /> Official Policy Update
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">Affiliate Support & Withdrawal Policy</h2>
            </div>
            <div className="bg-black/40 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-bold text-gray-300">USDT TRC-20 Exclusive Gateway</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                01
              </div>
              <h4 className="font-bold text-white text-base">USDT TRC-20 Only</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                All affiliate commission earnings and withdrawals are processed exclusively via <strong className="text-white">USDT (TRC-20)</strong> blockchain network for maximum speed and security.
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffcf00]/10 text-[#ffcf00] flex items-center justify-center font-black">
                02
              </div>
              <h4 className="font-bold text-white text-base">No Local MFS Payouts</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Legacy local mobile financial services (<strong className="text-gray-300">bKash, Nagad, Rocket, Upay</strong>) have been completely removed from the affiliate program payout system.
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black">
                03
              </div>
              <h4 className="font-bold text-white text-base">Hourly Settlements</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Withdrawals are processed 24/7 with a low $10 minimum threshold. Funds arrive in your TRC-20 wallet within minutes of request approval.
              </p>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-300 font-medium leading-relaxed">
              <strong className="text-white">Need help setting up your USDT TRC-20 wallet?</strong> Contact our partner support desk via Telegram or email for instant guidance.
            </div>
            <a 
              href="https://t.me/bivaax_partners" 
              target="_blank" 
              rel="noreferrer"
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all"
            >
              Get Wallet Help
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CONVERSION BOTTOM BLOCK */}
      <section className="py-24 border-t border-white/5 text-center px-6 relative">
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-tight">Ready to earn lifetime <span className="text-[#ffcf00]">passive revenue?</span></h2>
          <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto">
            Create your account today. Launch campaigns, monitor conversions instantly, and get paid with maximum efficiency.
          </p>
          <button 
            onClick={() => {
              const el = document.getElementById('auth-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#ffcf00] hover:bg-[#e6b800] text-black px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-[#ffcf00]/10 flex items-center gap-3 mx-auto active:scale-95"
          >
            Get Started Now <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </section>

      {/* MINIMALIST FOOTER */}
      <footer className="py-12 bg-[#050608] border-t border-white/5 text-center text-xs text-gray-500 px-6 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo size={18} />
            <span className="font-black tracking-tight text-white uppercase text-sm">Bivaax Partners</span>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <Link to="/affiliate-rules" className="text-[#ffcf00] font-bold hover:underline transition-colors">Operating Rules & Levels</Link>
            <Link to="/about-us" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/docs" className="hover:text-white transition-colors">API Docs</Link>
            <Link to="/support" className="hover:text-white transition-colors">24/7 Support</Link>
          </div>
          <div>© {new Date().getFullYear()} Bivaax Group. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}
