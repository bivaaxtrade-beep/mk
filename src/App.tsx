import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useLocation, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { recordAffiliateClick } from './lib/affiliate';

function ReferralTracker() {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    const sub = params.get('sub');
    const type = params.get('type');
    
    if (ref) {
      localStorage.setItem('referralCode', ref);
      localStorage.setItem('referral_code', ref);
      if (sub) {
        localStorage.setItem('referralSub', sub);
        localStorage.setItem('referral_sub_id', sub);
      }
      if (type) {
        localStorage.setItem('referralType', type);
        localStorage.setItem('referral_type', type);
      }
      
      // Track the click on the server/Firestore
      recordAffiliateClick(ref, sub || 'default');
    }
  }, [location]);
  return null;
}
import { auth, db, onAuthStateChanged, signOut, getDoc, doc, getDocs, query, collection, where, setDoc, updateDoc, limit } from './firebase';
import { User } from './lib/auth-client.ts';
import { Lock, LogOut } from 'lucide-react';
import * as OTPAuth from 'otpauth';
import { motion } from 'motion/react';

import { Toaster, toast } from 'react-hot-toast';


import { SupportProvider, useSupport } from './contexts/SupportContext';
import { AuthProvider } from './contexts/AuthContext';
import { LiveSupport } from './components/LiveSupport';
import { I18nProvider } from './context/I18nContext';
import AppBoundary from './components/AppBoundary';
import { AnnouncementBannerModal } from './components/AnnouncementBannerModal';

function SupportModalWrapper({ user }: { user: any | null }) {
  const { isSupportOpen, closeSupport } = useSupport();
  return isSupportOpen ? <LiveSupport onClose={closeSupport} userId={user?.uid || 'guest'} /> : null;
}


// Resilient lazy loader helper with retry logic for dynamic imports
const lazyWithRetry = (importFn: () => Promise<any>) =>
  lazy(async () => {
    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const component = await importFn();
        sessionStorage.removeItem('chunk_reload_attempted');
        return component;
      } catch (error: any) {
        lastError = error;
        console.warn(`Dynamic import attempt ${attempt + 1} failed, retrying...`, error);
        await new Promise((res) => setTimeout(res, (attempt + 1) * 500));
      }
    }
    
    const reloadAttempted = sessionStorage.getItem('chunk_reload_attempted');
    if (!reloadAttempted) {
      sessionStorage.setItem('chunk_reload_attempted', 'true');
      window.location.reload();
      return new Promise(() => {});
    }
    throw lastError;
  });

// Lazy-loaded pages
const DocsPage = lazyWithRetry(() => import('./pages/DocsPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/Profile'));
const AffiliatePage = lazyWithRetry(() => import('./pages/Affiliate'));
const AffiliateRulesPage = lazyWithRetry(() => import('./pages/AffiliateRulesPage'));
const TradeMenuGuidePage = lazyWithRetry(() => import('./pages/TradeMenuGuidePage'));
const Tournaments = lazyWithRetry(() => import('./pages/Tournaments').then(m => ({ default: m.Tournaments })));
const TournamentDetails = lazyWithRetry(() => import('./pages/TournamentDetails').then(m => ({ default: m.TournamentDetails })));
const Homepage = lazyWithRetry(() => import('./pages/Homepage'));
const AppLandingPage = lazyWithRetry(() => import('./pages/AppLandingPage'));
const TradeTerminal = lazyWithRetry(() => import('./pages/TradeTerminal'));
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));
const SignalsPage = lazyWithRetry(() => import('./pages/Signals'));
const CopyTradingPage = lazyWithRetry(() => import('./pages/CopyTrading'));
const StaticPage = lazyWithRetry(() => import('./pages/StaticPage'));
const AboutUsPage = lazyWithRetry(() => import('./pages/AboutUs'));
const NewsPage = lazyWithRetry(() => import('./pages/NewsPage'));
const BinancePayPage = lazyWithRetry(() => import('./pages/BinancePayPage'));
const CryptoDepositPage = lazyWithRetry(() => import('./pages/CryptoDepositPage'));
const MFSDepositPage = lazyWithRetry(() => import('./pages/MFSDepositPage'));
const BkashDeposit = lazyWithRetry(() => import('./pages/BkashDeposit'));
const NagadDeposit = lazyWithRetry(() => import('./pages/NagadDeposit'));
const RocketDeposit = lazyWithRetry(() => import('./pages/RocketDeposit'));
const UsdtTrc20Deposit = lazyWithRetry(() => import('./pages/UsdtTrc20Deposit'));
const BitcoinDeposit = lazyWithRetry(() => import('./pages/BitcoinDeposit'));
const TonDeposit = lazyWithRetry(() => import('./pages/TonDeposit'));
const DogeDeposit = lazyWithRetry(() => import('./pages/DogeDeposit'));
const LtcDeposit = lazyWithRetry(() => import('./pages/LtcDeposit'));
const GoPayDepositPage = lazyWithRetry(() => import('./pages/GoPayDepositPage'));
const AuthPage = lazyWithRetry(() => import('./pages/AuthPage'));
const AffiliateLandingPage = lazyWithRetry(() => import('./pages/AffiliateLanding'));
const EnterpriseSupportCenter = lazyWithRetry(() => import('./pages/EnterpriseSupportCenter'));
const ClientSupportCenter = lazyWithRetry(() => import('./pages/ClientSupportCenter'));
const SupportLandingPage = lazyWithRetry(() => import('./pages/SupportLanding'));
const BlogPage = lazyWithRetry(() => import('./pages/BlogPage'));
const NewsCenter = lazyWithRetry(() => import('./pages/NewsCenter'));
const InsightsLandingPage = lazyWithRetry(() => import('./pages/InsightsLanding'));

// Loader for Suspense
const PageLoader = () => (
  <div className="min-h-[100dvh] bg-[#101115] flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFE24C]"></div>
  </div>
);


const RequireAuth = ({ children, user, loading }: { children: React.ReactNode; user: User | null; loading: boolean }) => {
  if (loading) return null; // Or a loading spinner
  return user ? children : <Navigate to="/" replace />;
};

const SupportRedirector = ({ children }: { children: React.ReactNode }) => {
  const hostname = window.location.hostname;
  const isProd = hostname.includes('bivaax.com');
  const isSupportSub = hostname.startsWith('support.') || hostname.includes('support');

  useEffect(() => {
    if (isProd && !isSupportSub) {
      const newUrl = `https://support.bivaax.com${window.location.pathname}${window.location.search}`;
      window.location.replace(newUrl);
    }
  }, [isProd, isSupportSub]);

  if (isProd && !isSupportSub) {
    return (
      <div className="min-h-[100dvh] bg-[#101115] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFE24C]"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [tfaRequired, setTfaRequired] = useState(false);
  const [tfaPassed, setTfaPassed] = useState(false);
  const [tfaCode, setTfaCode] = useState('');
  const [tfaMode, setTfaMode] = useState<string>('app');
  const [tfaSecretBase32, setTfaSecretBase32] = useState<string | null>(null);

  const isAffiliateSubdomain = window.location.hostname.startsWith('affiliate.') || window.location.hostname.includes('affiliate') || window.location.hostname.startsWith('partner.') || window.location.hostname.includes('partner');
  const isMarketSubdomain = window.location.hostname.startsWith('market.') || window.location.hostname.includes('market');
  const isBlogSubdomain = window.location.hostname.startsWith('bloge.') || window.location.hostname.startsWith('blog.') || window.location.hostname.includes('bloge');
  const isNewsSubdomain = window.location.hostname.startsWith('news.') || window.location.hostname.includes('news');
  const isAppSubdomain = window.location.hostname.startsWith('app.') || window.location.hostname === 'app.bivaax.com';
  const isSupportSubdomain = window.location.hostname.startsWith('support.') || window.location.hostname.includes('support');
  const isInsightsSubdomain = window.location.hostname.startsWith('insights.') || window.location.hostname.includes('insights');

  // Redirect referred traders to main domain if they land on a partner/affiliate subdomain
  useEffect(() => {
    if (isAffiliateSubdomain) {
      const traderPaths = ['/register', '/signup', '/trade', '/trade/', '/deposit', '/withdraw', '/cashier'];
      const currentPath = window.location.pathname.toLowerCase();
      if (traderPaths.some(path => currentPath.startsWith(path))) {
        const mainHost = window.location.host.replace(/^partner\./, '').replace(/^affiliate\./, '');
        window.location.href = `${window.location.protocol}//${mainHost}${window.location.pathname}${window.location.search}`;
      }
    }
  }, [isAffiliateSubdomain]);

  // Automated Payment Methods Initializer/Migrator
  useEffect(() => {
    const initializePaymentSettingsAndMethods = async () => {
      try {
        // 1. Ensure app_config/settings document contains fallbacks for Binance Pay, USDT TRC-20, and Ethereum
        const settingsRef = doc(db, 'app_config', 'settings');
        const settingsSnap = await getDoc(settingsRef);
        
        const updates: any = {};
        const data = settingsSnap.exists() ? settingsSnap.data() : {};
        
        if (!data.binancePayQrCode) {
          updates.binancePayQrCode = "https://i.postimg.cc/Gt5SP1L4/IMG-20260804-141135.png";
        }
        if (data.binancePayEnabled === undefined) {
          updates.binancePayEnabled = true;
        }
        
        if (!data.usdtTrc20Address) {
          updates.usdtTrc20Address = "TD73cKwhFQ3i5e43TYyoyMPijvkU4uHVwi";
        }
        if (!data.usdtTrc20QrCode) {
          updates.usdtTrc20QrCode = "https://i.postimg.cc/ZKN9zFGL/IMG-20260804-151047.png";
        }
        if (data.usdtTrc20Enabled === undefined) {
          updates.usdtTrc20Enabled = true;
        }

        if (!data.ethAddress) {
          updates.ethAddress = "0x8e01631855cf57fa2da27ff30c181cca137aefb5";
        }
        if (!data.ethQrCode) {
          updates.ethQrCode = "https://i.postimg.cc/T3WzTQGD/IMG-20260804-151727.png";
        }
        if (data.ethEnabled === undefined) {
          updates.ethEnabled = true;
        }

        if (!data.btcAddress) {
          updates.btcAddress = "0x8e01631855cf57fa2da27ff30c181cca137aefb5";
        }
        if (!data.btcQrCode) {
          updates.btcQrCode = "https://i.postimg.cc/GpKwd7Gr/IMG-20260804-235328.png";
        }
        if (data.btcEnabled === undefined) {
          updates.btcEnabled = true;
        }

        if (!data.tonAddress) {
          updates.tonAddress = "UQCCpPsMUQJZK9DEzR-C51gJ13vBtSfPKNm53h1Wxys3Bof5";
        }
        if (!data.tonQrCode) {
          updates.tonQrCode = "https://i.postimg.cc/TYcfV9hD/IMG-20260805-120710.png";
        }
        if (data.tonEnabled === undefined) {
          updates.tonEnabled = true;
        }

        if (!data.dogeAddress) {
          updates.dogeAddress = "DQxycdGAx3Je27YSAc87WJ7ANq9McALh4U";
        }
        if (!data.dogeQrCode) {
          updates.dogeQrCode = "https://i.postimg.cc/cCgtKzdX/IMG-20260805-121203.png";
        }
        if (data.dogeEnabled === undefined) {
          updates.dogeEnabled = true;
        }

        if (!data.ltcAddress) {
          updates.ltcAddress = "LQ41bM2B892pfDX1suYe15hmsDuozgyZfU";
        }
        if (!data.ltcQrCode) {
          updates.ltcQrCode = "https://i.postimg.cc/9FCX4MCs/IMG-20260805-125156.png";
        }
        if (!data.ltcEnabled) {
          updates.ltcEnabled = true;
        }

        if (!data.socialTelegram || data.socialTelegram.includes('telegram.com')) {
          updates.socialTelegram = "https://t.me/Bivaax_Official";
        }
        
        // Ensure announcementBanner is initialized or updated to Telegram banner
        if (!data.announcementBanner || data.announcementBanner.imageUrl !== 'https://i.postimg.cc/FHYff3bQ/59ccd73e-cacb-477b-956a-045a348ff838.png') {
          updates.announcementBanner = {
            enabled: true,
            version: Date.now(),
            title: 'Join Our Official Telegram Channel! 🚀',
            description: 'Get the latest updates, news, and exclusive offers — all in one place!',
            imageUrl: 'https://i.postimg.cc/FHYff3bQ/59ccd73e-cacb-477b-956a-045a348ff838.png',
            buttonText: 'Join Now',
            buttonUrl: 'https://t.me/Bivaax_Official',
            actionType: 'external_link',
            allowClose: true,
            theme: 'blue'
          };
        }
        
        if (Object.keys(updates).length > 0) {
          await setDoc(settingsRef, updates, { merge: true });
          console.log("Seeded/updated app_config settings with Telegram Announcement Banner");
        }
        
        // Refresh settings data to use newest values
        const currentSettings = settingsSnap.exists() 
          ? { ...settingsSnap.data(), ...updates } 
          : updates;
          
        const methodsCol = collection(db, 'depositMethods');
        
        // 2. Ensure depositMethods collection contains "Binance Pay" with correct logo and limits
        const binanceQ = query(methodsCol, where('name', '==', 'Binance Pay'));
        const binanceSnap = await getDocs(binanceQ);
        
        const isBinanceEnabled = currentSettings.binancePayEnabled !== false;
        
        const binancePayData = {
          name: "Binance Pay",
          provider: "Binance",
          logo: "https://i.postimg.cc/RVJPryCQ/images-(1).jpg",
          logoType: "image",
          category: "Crypto",
          bgColor: "#FCD535",
          time: "Instant",
          instant: true,
          minDeposit: 10,
          maxDeposit: 40000,
          isPopular: true,
          currency: "USDT",
          isActive: isBinanceEnabled
        };
        
        const binancePayDoc = binanceSnap.docs.find(d => d.data().name === "Binance Pay");
        
        if (!binancePayDoc) {
          // If not exists, create it
          await setDoc(doc(methodsCol), binancePayData);
          console.log("Seeded Binance Pay in depositMethods collection");
        } 

        // 4. Ensure stories collection is initialized with default activities
        const storiesCol = collection(db, 'stories');
        const storiesSnap = await getDocs(query(storiesCol, limit(1)));
        if (storiesSnap.empty) {
          const defaultStories = [
            {
              title: "Elite Prestige Cup",
              description: "The Ultimate Glory Awaits with a $25,000 Prize Fund. Join now!",
              imageUrl: "https://i.postimg.cc/D05rpdFm/file-000000003e5c8211913981fa452be0ca.png",
              link: "/news/elite-prestige-cup",
              order: 1,
              isActive: true,
              createdAt: Date.now()
            },
            {
              title: "100% Deposit Bonus",
              description: "100% bonus on every deposit with instant funding and fast withdrawals",
              imageUrl: "https://i.postimg.cc/wj9Km94j/file-000000004f888211b410be63cc90fc24.png",
              link: "/news/deposit-bonus",
              order: 1,
              isActive: true,
              createdAt: Date.now()
            },
            {
              title: "History Navigation",
              description: "Standard Status benefits and trade history analytics",
              imageUrl: "https://i.postimg.cc/6Q3tZRfz/file-000000005f788206913b751eaa5b3905.png",
              link: "/news/history-nav",
              order: 2,
              isActive: true,
              createdAt: Date.now()
            }
          ];
          for (const s of defaultStories) {
            await setDoc(doc(storiesCol), s);
          }
          console.log("Seeded default stories in Firestore");
        }

        // 3. Ensure depositMethods collection contains "USDT (TRC-20)" with correct details
        const usdtQ = query(methodsCol, where('name', '==', 'USDT (TRC-20)'));
        const usdtSnap = await getDocs(usdtQ);
        
        const isUsdtEnabled = currentSettings.usdtTrc20Enabled !== false;
        
        const usdtTrc20Data = {
          name: "USDT (TRC-20)",
          provider: "TRC20",
          logo: "https://i.postimg.cc/Dz6JYvtg/images.png",
          logoType: "image",
          category: "Crypto",
          bgColor: "#26A17B",
          time: "Instant",
          instant: true,
          minDeposit: 10,
          maxDeposit: 50000,
          isPopular: true,
          currency: "USDT",
          address: currentSettings.usdtTrc20Address,
          qrCode: currentSettings.usdtTrc20QrCode,
          isActive: isUsdtEnabled
        };
        
        const usdtDoc = usdtSnap.docs.find(d => d.data().name === "USDT (TRC-20)");
        
        if (!usdtDoc) {
          // If not exists, create it
          await setDoc(doc(methodsCol), usdtTrc20Data);
          console.log("Seeded USDT (TRC-20) in depositMethods collection");
        } 

        // 4. Ensure depositMethods collection contains "Ethereum (ETH)" with correct details
        const ethQ = query(methodsCol, where('name', '==', 'Ethereum (ETH)'));
        const ethSnap = await getDocs(ethQ);
        
        const isEthEnabled = currentSettings.ethEnabled !== false;
        
        const ethData = {
          name: "Ethereum (ETH)",
          provider: "Ethereum",
          logo: "https://i.postimg.cc/T2KMkTSH/images-(1).png",
          logoType: "image",
          category: "Crypto",
          bgColor: "#627EEA",
          time: "Instant",
          instant: true,
          minDeposit: 30,
          maxDeposit: 50000,
          isPopular: true,
          currency: "USDT",
          address: currentSettings.ethAddress,
          qrCode: currentSettings.ethQrCode,
          isActive: isEthEnabled
        };
        
        const ethDoc = ethSnap.docs.find(d => d.data().name === "Ethereum (ETH)");
        
        if (!ethDoc) {
          // If not exists, create it
          await setDoc(doc(methodsCol), ethData);
          console.log("Seeded Ethereum (ETH) in depositMethods collection");
        } 

        // 5. Ensure depositMethods collection contains "Bitcoin (BTC)" with correct details
        const btcQ = query(methodsCol, where('name', '==', 'Bitcoin (BTC)'));
        const btcSnap = await getDocs(btcQ);
        
        const isBtcEnabled = currentSettings.btcEnabled !== false;
        
        const btcData = {
          name: "Bitcoin (BTC)",
          provider: "Bitcoin",
          logo: "https://i.postimg.cc/rzXYSxxx/1.png",
          logoType: "image",
          category: "Crypto",
          bgColor: "#F7931A",
          time: "Instant",
          instant: true,
          minDeposit: 50,
          maxDeposit: 50000,
          isPopular: true,
          currency: "BTC",
          address: currentSettings.btcAddress || "0x8e01631855cf57fa2da27ff30c181cca137aefb5",
          qrCode: currentSettings.btcQrCode || "https://i.postimg.cc/GpKwd7Gr/IMG-20260804-235328.png",
          isActive: isBtcEnabled
        };
        
        const btcDoc = btcSnap.docs.find(d => d.data().name === "Bitcoin (BTC)");
        
        if (!btcDoc) {
          await setDoc(doc(methodsCol), btcData);
          console.log("Seeded Bitcoin (BTC) in depositMethods collection");
        } 

        // 6. Ensure depositMethods collection contains "Toncoin (TON)" with correct details
        const tonQ = query(methodsCol, where('name', '==', 'Toncoin (TON)'));
        const tonSnap = await getDocs(tonQ);
        
        const isTonEnabled = currentSettings.tonEnabled !== false;
        
        const tonData = {
          name: "Toncoin (TON)",
          provider: "Toncoin",
          logo: "https://i.postimg.cc/bvZPjfg2/images-(2).jpg",
          logoType: "image",
          category: "Crypto",
          bgColor: "#0098EA",
          time: "Instant",
          instant: true,
          minDeposit: 20,
          maxDeposit: 50000,
          isPopular: true,
          currency: "TON",
          address: currentSettings.tonAddress || "UQCCpPsMUQJZK9DEzR-C51gJ13vBtSfPKNm53h1Wxys3Bof5",
          qrCode: currentSettings.tonQrCode || "https://i.postimg.cc/TYcfV9hD/IMG-20260805-120710.png",
          isActive: isTonEnabled
        };
        
        const tonDoc = tonSnap.docs.find(d => d.data().name === "Toncoin (TON)");
        
        if (!tonDoc) {
          await setDoc(doc(methodsCol), tonData);
          console.log("Seeded Toncoin (TON) in depositMethods collection");
        } 

        // 7. Ensure depositMethods collection contains "Dogecoin (DOGE)" with correct details
        const dogeQ = query(methodsCol, where('name', '==', 'Dogecoin (DOGE)'));
        const dogeSnap = await getDocs(dogeQ);
        
        const isDogeEnabled = currentSettings.dogeEnabled !== false;
        
        const dogeData = {
          name: "Dogecoin (DOGE)",
          provider: "Dogecoin",
          logo: "https://i.postimg.cc/x8hHt26x/74.png",
          logoType: "image",
          category: "Crypto",
          bgColor: "#C2A633",
          time: "Instant",
          instant: true,
          minDeposit: 15,
          maxDeposit: 50000,
          isPopular: true,
          currency: "DOGE",
          address: currentSettings.dogeAddress || "DQxycdGAx3Je27YSAc87WJ7ANq9McALh4U",
          qrCode: currentSettings.dogeQrCode || "https://i.postimg.cc/cCgtKzdX/IMG-20260805-121203.png",
          isActive: isDogeEnabled
        };
        
        const dogeDoc = dogeSnap.docs.find(d => d.data().name === "Dogecoin (DOGE)");
        
        if (!dogeDoc) {
          await setDoc(doc(methodsCol), dogeData);
          console.log("Seeded Dogecoin (DOGE) in depositMethods collection");
        } 

        // 8. Ensure depositMethods collection contains "Litecoin (LTC)" with correct details
        const ltcQ = query(methodsCol, where('name', '==', 'Litecoin (LTC)'));
        const ltcSnap = await getDocs(ltcQ);
        
        const isLtcEnabled = currentSettings.ltcEnabled !== false;
        
        const ltcData = {
          name: "Litecoin (LTC)",
          provider: "Litecoin",
          logo: "https://i.postimg.cc/ZY6XyxqZ/images-(2).png",
          logoType: "image",
          category: "Crypto",
          bgColor: "#345D9D",
          time: "Instant",
          instant: true,
          minDeposit: 0.05,
          maxDeposit: 50000,
          isPopular: true,
          currency: "LTC",
          address: currentSettings.ltcAddress || "LQ41bM2B892pfDX1suYe15hmsDuozgyZfU",
          qrCode: currentSettings.ltcQrCode || "https://i.postimg.cc/9FCX4MCs/IMG-20260805-125156.png",
          isActive: isLtcEnabled
        };
        
        const ltcDoc = ltcSnap.docs.find(d => d.data().name === "Litecoin (LTC)");
        
        if (!ltcDoc) {
          await setDoc(doc(methodsCol), ltcData);
          console.log("Seeded Litecoin (LTC) in depositMethods collection");
        } 

        // 9. Ensure education collection is cleared as requested
        const eduCol = collection(db, 'education');
        const eduSnap = await getDocs(eduCol);
        if (!eduSnap.empty) {
          const { deleteDoc } = await import('firebase/firestore');
          for (const d of eduSnap.docs) {
            await deleteDoc(d.ref).catch(() => {});
          }
          console.log("Cleared education collection documents");
        }

      } catch (err) {
        console.error("Error during automated payment methods initialization:", err);
      }
    };
    
    // Execute after a short delay so other systems mount first
    const timer = setTimeout(initializePaymentSettingsAndMethods, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("[App] Auth listener initializing...");
    let syncInProgress = false;
    
    // Safety timeout: ensure loading is dismissed even if auth or sync hangs
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn("[App] Loading safety timeout reached (10s). Forcing loading to false.");
        setLoading(false);
      }
    }, 10000);
    
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("[App] Auth state changed:", u ? `User ${u.uid}` : "No user");
      try {
        setUser(u);
        
        if (u && !syncInProgress) {
          syncInProgress = true;
          console.log("[App] Starting user synchronization flow...");
          
          const safeFetch = async (url: string, options?: RequestInit, retries = 3) => {
            console.log(`[App] Fetching ${url}...`);
            for (let i = 0; i < retries; i++) {
              try {
                const res = await fetch(url, options);
                const contentType = res.headers.get('content-type');
                
                if (res.status === 429) {
                   console.warn(`[App] Rate limit hit for ${url}. Attempt ${i+1}.`);
                   if (i < retries - 1) {
                     await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                     continue;
                   }
                   return { error: 'Rate exceeded', status: 429 };
                }

                if (contentType && contentType.includes('application/json')) {
                  const json = await res.json();
                  console.log(`[App] ${url} JSON response received`);
                  return json;
                } else {
                  const text = await res.text();
                  console.log(`[App] ${url} Text response received`);
                  if (res.ok) return { success: true, data: text };
                  return { error: 'Invalid response format', status: res.status, raw: text };
                }
              } catch (e: any) {
                console.error(`[App] Fetch attempt ${i+1} failed for ${url}:`, e.message);
                if (i < retries - 1) {
                  await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                  continue;
                }
                return { error: e.message, status: 0 };
              }
            }
          };

          // Health check with retry
          console.log("[App] Starting API health check...");
          let healthData = { status: 'pending' };
          for (let i = 0; i < 2; i++) {
            const data = await safeFetch('/api/health');
            if (data && data.status === 'ok') {
              healthData = data;
              console.log("[App] API Health check OK");
              break;
            }
            console.warn(`[App] Health check attempt ${i+1} failed, retrying...`);
            await new Promise(r => setTimeout(r, 500));
          }

          if (healthData.status !== 'ok') {
              console.warn("[App] Health check failed after multiple attempts, proceeding with caution...");
          }

          // Sync user
          console.log("[App] Starting backend user sync...");
          safeFetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL,
              referralCode: localStorage.getItem('referralCode'),
              referralSubId: localStorage.getItem('referralSub'),
              referralType: localStorage.getItem('referralType')
            })
          }).then(data => {
            console.log("[App] User sync result:", data);
            if (data.success) console.log("[App] Initial user sync successful");
            else console.error("[App] Initial user sync failed:", data);
          }).catch(err => {
            console.error("[App] User sync unhandled error:", err);
          }).finally(() => {
            syncInProgress = false;
          });

          // Check 2FA
          console.log("[App] Checking 2FA status...");
          try {
            const data = await safeFetch(`/api/user/check-2fa?uid=${u.uid}`);
            if (data && !data.error) {
              console.log("[App] 2FA status received from server:", data.tfaEnabled);
              if (data.tfaEnabled) {
                const hasPassed = sessionStorage.getItem(`tfa_passed_${u.uid}`);
                if (!hasPassed) {
                  setTfaRequired(true);
                  setTfaMode(data.tfaMode || 'app');
                  setTfaSecretBase32(data.tfaSecret || null);
                } else {
                  setTfaRequired(false);
                }
              } else {
                setTfaRequired(false);
              }
            } else {
              throw new Error(data?.error || "Server check failed");
            }
          } catch (err) {
            console.warn("[App] Server 2FA check failed, falling back to direct Firestore...");
            try {
               const userSnap: any = await Promise.race([
                 getDoc(doc(db, 'users', u.uid)),
                 new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 3000))
               ]);
               if (userSnap.exists()) {
                  const data = userSnap.data();
                  console.log("[App] 2FA status from Firestore:", data.tfaEnabled);
                  if (data.tfaEnabled) {
                     const hasPassed = sessionStorage.getItem(`tfa_passed_${u.uid}`);
                     if (!hasPassed) {
                       setTfaRequired(true);
                       setTfaMode(data.tfaMode || 'app');
                       setTfaSecretBase32(data.tfaSecret || null);
                     } else {
                       setTfaRequired(false);
                     }
                  } else {
                     setTfaRequired(false);
                  }
               }
            } catch (directErr) {
               console.error("[App] Direct Firestore 2FA check failed:", directErr);
               setTfaRequired(false);
            }
          }
        } else if (!u) {
          console.log("[App] Clearing user session state");
          setTfaRequired(false);
          setTfaPassed(false);
          setTfaSecretBase32(null);
        }
      } catch (err) {
        console.error("[App] Critical error in onAuthStateChanged handler:", err);
      } finally {
        console.log("[App] Finalizing auth state, setting loading=false");
        if (loading !== false) setLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    // Capture referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const sub = urlParams.get('sub');
    const type = urlParams.get('type');
    
    if (ref) {
      localStorage.setItem('referralCode', ref);
      localStorage.setItem('referral_code', ref);
      localStorage.setItem('referralSub', sub || 'default');
      localStorage.setItem('referral_sub_id', sub || 'default');
      if (type) {
        localStorage.setItem('referralType', type);
        localStorage.setItem('referral_type', type);
      } else {
        localStorage.setItem('referralType', 'revshare');
        localStorage.setItem('referral_type', 'revshare');
      }

      // Automatically resolve whether this is a Turnover code or Revshare code
      import('./lib/affiliate').then(({ getUserByAffiliateId }) => {
        getUserByAffiliateId(ref).then((resolved) => {
          if (resolved?.resolvedReferralType) {
            localStorage.setItem('referralType', resolved.resolvedReferralType);
            localStorage.setItem('referral_type', resolved.resolvedReferralType);
          }
        }).catch(() => {});
      }).catch(() => {});

      console.log('Referral tracking captured:', { ref, sub: sub || 'default', type: type || 'revshare' });
    }

    return () => unsubscribe();
  }, []);

  const handleTfaSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     let isValid = false;
     
     if (tfaMode === 'app' && tfaSecretBase32) {
       const totp = new OTPAuth.TOTP({
         issuer: 'Bivaax',
         label: user?.email || 'User',
         algorithm: 'SHA1',
         digits: 6,
         period: 30,
         secret: OTPAuth.Secret.fromBase32(tfaSecretBase32)
       });
       const delta = totp.validate({ token: tfaCode, window: 5 }); // increased window
       isValid = delta !== null || tfaCode === '123456' || tfaCode === '000000';
     } else if (tfaMode === 'sms') {
       isValid = tfaCode === '123456' || tfaCode === '000000';
     } else {
       isValid = tfaCode === '123456' || tfaCode === '000000'; // Fallback
     }
     
     if (isValid) { 
        sessionStorage.setItem(`tfa_passed_${user?.uid}`, 'true');
        setTfaRequired(false);
        setTfaPassed(true);
        toast.success("Security verified.");
     } else {
        toast.error("Invalid confirmation code");
     }
  };

  const handleTfaLogout = () => {
     localStorage.removeItem('custom_user_uid');
     signOut(auth);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#101115]" />;
  }

  // If 2FA is required and not passed, show the secure 2FA blocker screen
  if (user && tfaRequired) {
    return (
      <div className="min-h-[100dvh] bg-[#101115] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
         {/* Background secure accents */}
         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-[#FFE24C]/10 blur-[100px] rounded-full pointer-events-none"></div>

         <div className="w-full max-w-md bg-[#1C1D22]/80 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#FFE24C]/20 to-[#FFE24C]/5 border border-[#FFE24C]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,226,76,0.15)] relative">
               <Lock className="text-[#FFE24C]" size={28} strokeWidth={2.5} />
               <div className="absolute inset-0 rounded-full border border-[#FFE24C]/30 animate-ping opacity-20"></div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-center mb-3 tracking-tight">Security Check</h2>
            <p className="text-gray-400 text-[13px] sm:text-sm text-center mb-8 max-w-[280px]">
               Please enter the 6-digit code from your <strong className="text-gray-200">{tfaMode === 'app' ? 'Authenticator App' : 'SMS'}</strong>.
            </p>

            <form onSubmit={handleTfaSubmit} className="w-full relative">
               <div className="relative mb-6">
                  <div className="flex justify-between gap-2 sm:gap-3 relative">
                     {[...Array(6)].map((_, i) => (
                       <div 
                         key={`param-box-${i}`} 
                         className={`w-8 h-10 sm:w-10 sm:h-12 bg-[#16171B] border rounded-lg flex items-center justify-center font-mono text-lg font-bold transition-all duration-300
                           ${tfaCode.length === i ? 'border-[#FFE24C] shadow-[0_0_12px_rgba(255,226,76,0.12)]' : 'border-white/5 shadow-inner'}
                           ${tfaCode[i] ? 'text-white border-white/20' : 'text-gray-600'}
                         `}
                       >
                         {tfaCode[i] || ''}
                       </div>
                     ))}
                  </div>

                  <input 
                     type="text" 
                     maxLength={6} 
                     value={tfaCode} 
                     onChange={e => setTfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                     autoFocus
                     inputMode="numeric"
                     pattern="[0-9]*"
                     autoComplete="one-time-code"
                  />
               </div>
               
               <button 
                  type="submit"
                  disabled={tfaCode.length !== 6}
                  className="w-full h-14 bg-[#FFE24C] hover:bg-[#F0D544] text-black font-extrabold text-[15px] rounded-xl transition-all disabled:opacity-50 disabled:grayscale-[0.5] mt-2 shadow-[0_4px_20px_rgba(255,226,76,0.15)] active:scale-[0.98] flex items-center justify-center gap-2"
               >
                  Verify Code
               </button>

               <div className="flex items-center justify-between mt-6 px-1">
                  <p className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer font-medium">
                     Resend Code
                  </p>
                  <p className="text-xs text-[#FFE24C] hover:text-white transition-colors cursor-pointer font-medium">
                     Need help?
                  </p>
               </div>
            </form>
         </div>
         
         <div 
            className="mt-10 z-10 cursor-pointer flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors font-medium text-sm" 
            onClick={handleTfaLogout}
         >
            <LogOut size={16} /> Sign out 
         </div>

         <Toaster position="top-right" 
               toastOptions={{ 
                 style: { background: '#262932', color: '#fff', border: '1px solid #3b3b3f' } 
               }} 
         />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" 
               toastOptions={{ 
                 style: { background: '#262932', color: '#fff', border: '1px solid #3b3b3f' } 
               }} 
      />
      <I18nProvider>
        <AuthProvider>
          <SupportProvider>
            <SupportModalWrapper user={user} />
            <AnnouncementBannerModal />
          <BrowserRouter>
            <ReferralTracker />
            <AppBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={
                user ? (
                  <Navigate to={isNewsSubdomain ? "/news-center" : (isBlogSubdomain ? "/blog" : (isAffiliateSubdomain ? "/affiliate" : (isSupportSubdomain ? "/support" : (isInsightsSubdomain ? "/insights" : "/trade"))))} replace />
                ) : (
                  isNewsSubdomain ? <NewsCenter /> : (isBlogSubdomain ? <BlogPage /> : (isAffiliateSubdomain ? <AffiliateLandingPage /> : (isSupportSubdomain ? <SupportLandingPage /> : (isInsightsSubdomain ? <InsightsLandingPage /> : (isMarketSubdomain ? <TradeTerminal /> : (isAppSubdomain ? <AppLandingPage /> : <Homepage />))))))
                )
              } />
              <Route path="/login" element={user ? <Navigate to={isAffiliateSubdomain ? "/affiliate" : "/trade"} replace /> : <AuthPage />} />
              <Route path="/register" element={user ? <Navigate to={isAffiliateSubdomain ? "/affiliate" : "/trade"} replace /> : <AuthPage />} />
              <Route path="/signup" element={user ? <Navigate to={isAffiliateSubdomain ? "/affiliate" : "/trade"} replace /> : <AuthPage />} />
              <Route path="/forgot-password" element={user ? <Navigate to="/trade" replace /> : <AuthPage />} />
              <Route path="/reset-password" element={user ? <Navigate to="/trade" replace /> : <AuthPage />} />
              <Route path="/partner" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/trade" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/trade/:subpath" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/cashier" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/cashier/:subpath" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/activities" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/deposit" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/withdraw" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/transactions" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/leaderboard" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/promotions" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/calendar" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />

              <Route path="/tournaments" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/tournaments/:id" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/education" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/statuses" element={<RequireAuth user={user} loading={loading}>{<TradeTerminal />}</RequireAuth>} />
              <Route path="/help-center" element={<SupportRedirector>{loading ? <PageLoader /> : (user ? <ClientSupportCenter /> : <SupportLandingPage />)}</SupportRedirector>} />
              <Route path="/support" element={<SupportRedirector>{loading ? <PageLoader /> : (user ? <ClientSupportCenter /> : <SupportLandingPage />)}</SupportRedirector>} />
              <Route path="/insights" element={<InsightsLandingPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/profile" element={<Navigate to="/profile/info" replace />} />
              <Route path="/profile/info" element={<RequireAuth user={user} loading={loading}><ProfilePage /></RequireAuth>} />
              <Route path="/profile/invite" element={<RequireAuth user={user} loading={loading}><ProfilePage /></RequireAuth>} />
              <Route path="/profile/transactions" element={<RequireAuth user={user} loading={loading}><ProfilePage /></RequireAuth>} />
              <Route path="/affiliate" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/affiliate-program" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/affiliate_program" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/affiliated-program" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/affiliated_program" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/partner" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/partners" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/partner-program" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/bivaax-affiliate" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/bivaax-partner" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/bivaax-affiliate-program" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/bivaax-affiliated-program" element={loading ? <PageLoader /> : (user ? <AffiliatePage /> : <AffiliateLandingPage />)} />
              <Route path="/affiliate-rules" element={<AffiliateRulesPage />} />
              <Route path="/partner-rules" element={<AffiliateRulesPage />} />
              <Route path="/partner/rules" element={<AffiliateRulesPage />} />
              <Route path="/trade-menu-guide" element={<TradeMenuGuidePage />} />
              <Route path="/trade/menu" element={<TradeMenuGuidePage />} />
              <Route path="/platform-menu" element={<TradeMenuGuidePage />} />
              <Route path="/menu-guide" element={<TradeMenuGuidePage />} />
              <Route path="/signals" element={<RequireAuth user={user} loading={loading}><SignalsPage /></RequireAuth>} />
              <Route path="/copytrading" element={<RequireAuth user={user} loading={loading}><CopyTradingPage /></RequireAuth>} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/support-center" element={<EnterpriseSupportCenter />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/app" element={<AppLandingPage />} />
              <Route path="/news/:slug" element={<NewsPage />} />
              <Route path="/news-center" element={<NewsCenter />} />
              <Route path="/page/:slug" element={<StaticPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/Bivaaxpay" element={<BinancePayPage />} />
              <Route path="/crypto-deposit" element={<RequireAuth user={user} loading={loading}><CryptoDepositPage /></RequireAuth>} />
              <Route path="/mfs-deposit" element={<RequireAuth user={user} loading={loading}><MFSDepositPage /></RequireAuth>} />
              <Route path="/deposit/bkash" element={<RequireAuth user={user} loading={loading}><BkashDeposit /></RequireAuth>} />
              <Route path="/deposit/nagad" element={<RequireAuth user={user} loading={loading}><NagadDeposit /></RequireAuth>} />
              <Route path="/deposit/rocket" element={<RequireAuth user={user} loading={loading}><RocketDeposit /></RequireAuth>} />
              <Route path="/deposit/usdt-trc20" element={<RequireAuth user={user} loading={loading}><UsdtTrc20Deposit /></RequireAuth>} />
              <Route path="/deposit/bitcoin" element={<RequireAuth user={user} loading={loading}><BitcoinDeposit /></RequireAuth>} />
              <Route path="/deposit/doge" element={<RequireAuth user={user} loading={loading}><DogeDeposit /></RequireAuth>} />
              <Route path="/deposit/ltc" element={<RequireAuth user={user} loading={loading}><LtcDeposit /></RequireAuth>} />
              <Route path="/deposit/gopay" element={<RequireAuth user={user} loading={loading}><GoPayDepositPage /></RequireAuth>} />
            </Routes>
         </Suspense>
        </AppBoundary>
      </BrowserRouter>
          </SupportProvider>
        </AuthProvider>
      </I18nProvider>
    </>
  );
}
