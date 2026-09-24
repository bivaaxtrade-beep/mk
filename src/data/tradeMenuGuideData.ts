export interface MenuSectionItem {
  id: string;
  name: string;
  bnName: string;
  location: string;
  bnLocation: string;
  description: string;
  bnDescription: string;
  url: string;
  iconName: string;
  badge?: string;
  features: string[];
  bnFeatures: string[];
}

export interface MenuGroup {
  id: string;
  title: string;
  bnTitle: string;
  description: string;
  bnDescription: string;
  items: MenuSectionItem[];
}

export const TRADE_MENU_GROUPS: MenuGroup[] = [
  {
    id: 'header-navigation',
    title: 'Top Header Bar & Account Controls',
    bnTitle: 'টপ হেডার বার এবং অ্যাকাউন্ট কন্ট্রোলস',
    description: 'Header navigation controls located at the very top of the Trade Terminal on both desktop and mobile viewports.',
    bnDescription: 'ট্রেড পেজের সবার উপরে অবস্থিত হেডার কন্ট্রোলস, যা ডেস্কটপ ও মোবাইলে সবসময় দৃশ্যমান থাকে।',
    items: [
      {
        id: 'asset-switcher',
        name: 'Asset Selector & Multi-Tab Bar',
        bnName: 'অ্যাসেট সিলেক্টর ও মাল্টি-ট্যাব বার',
        location: 'Top Left (Desktop) / Top Center (Mobile)',
        bnLocation: 'উপরে বাম পাশে (ডেস্কটপ) / উপরে মাঝে (মোবাইল)',
        description: 'Click the "+" button or tab pills to open and switch between Forex pairs (EUR/USD, GBP/USD), Crypto (BTC, ETH), OTC weekend markets, Stocks, and Commodities. Shows real-time payout percentages (up to 95%).',
        bnDescription: 'টপ বারের "+" বাটনে ক্লিক করে ফরেক্স কারেন্সি, ক্রিপ্টো, ওটিসি মার্কেট এবং স্টক নির্বাচন করা যায়। প্রতিটি অ্যাসেটের বর্তমান প্রফিট পারসেন্টেজ (সর্বোচ্চ ৯৫%) প্রদর্শিত হয়।',
        url: '/trade/assets',
        iconName: 'Plus',
        features: ['Up to 95% yield display', 'Quick asset search', 'OTC 24/7 weekend assets', 'Multi-tab concurrent viewing'],
        bnFeatures: ['সর্বোচ্চ ৯৫% পে-আউট', 'দ্রুত অ্যাসেট সার্চ', '২৪/৭ ওটিসি মার্কেট ট্রেডিং', 'একসাথে একাধিক ট্যাব খোলা']
      },
      {
        id: 'account-switcher',
        name: 'Demo vs. Real Account Switcher',
        bnName: 'ডেমো ও রিয়েল অ্যাকাউন্ট স্যুইচার',
        location: 'Top Right Header Bar',
        bnLocation: 'উপরে ডান পাশের হেডার বার',
        description: 'Click your balance to open the account dropdown. Switch seamlessly between the $10,000 free refillable Demo account, your Real Live Cash account, and active Tournament balances.',
        bnDescription: 'ব্যালেন্সের উপর ক্লিক করে ফ্রি $১০,০০০ ভার্চুয়াল ডেমো অ্যাকাউন্ট, লাইভ ক্যাশ অ্যাকাউন্ট এবং টুর্নামেন্ট অ্যাকাউন্টের মধ্যে মুহূর্তে সুইচ করা যায়। ডেমো ব্যালেন্স যেকোনো সময় ফ্রি রিফিল করা যায়।',
        url: '/trade',
        iconName: 'ChevronDown',
        badge: '$10,000 Refillable',
        features: ['Instant 1-click account toggle', 'Zero-risk demo practice', '1-click balance refill button', 'Hidden balance privacy mode'],
        bnFeatures: ['১-ক্লিকে অ্যাকাউন্ট পরিবর্তন', 'ঝুঁকিহীন ফ্রি ডেমো প্র্যাকটিস', '১-ক্লিকে ব্যালেন্স রিফিল', 'ব্যালেন্স হাইড/শো অপশন']
      },
      {
        id: 'cashier-quick-buttons',
        name: 'Cashier Quick Actions (Deposit & Withdraw)',
        bnName: 'ক্যাশিয়ার ডিপোজিট ও উইথড্র বাটন',
        location: 'Top Right Header Bar',
        bnLocation: 'টপ হেডার বারের একদম ডান পাশে',
        description: 'Golden "Deposit" button and dark "Withdrawal" button for immediate funds management. Supports local MFS (bKash, Nagad, Rocket), USDT TRC20, Bitcoin, Ethereum, and Binance Pay with 0% commission.',
        bnDescription: 'টপ বারের সোনালী "Deposit" এবং "Withdrawal" বাটনে ক্লিক করে সরাসরি ফান্ড জমা ও উত্তোলন করা যায়। বিকাশ, নগদ, রকেট, ইউএসডিটি ও বাইন্যান্স পে সাপোর্টেড।',
        url: '/cashier',
        iconName: 'Wallet',
        badge: 'Instant & 0% Fee',
        features: ['Instant bKash, Nagad, Rocket deposit', 'Instant USDT/Crypto processing', 'Fast zero-fee withdrawal processing', 'Real-time transaction status history'],
        bnFeatures: ['বিকাশ, নগদ, রকেট ইনস্ট্যান্ট ডিপোজিট', 'ইউএসডিটি ও ক্রিপ্টো সাপোর্ট', 'শূন্য ফি দ্রুত উইথড্রয়াল', 'রিয়েল-টাইম ট্রানজ্যাকশন হিস্ট্রি']
      },
      {
        id: 'profile-avatar-status',
        name: 'Profile Avatar & VIP Status Badge',
        bnName: 'প্রোফাইল অবতার ও ভিআইপি স্ট্যাটাস ব্যাজ',
        location: 'Top Right Corner (Next to Cashier)',
        bnLocation: 'উপরে একদম ডান কোণায় ক্যাশিয়ারের পাশে',
        description: 'Displays user initials, avatar picture, and status emblem (Free, Standard, Gold, VIP, Prestige). Clicking opens the comprehensive Profile & Security drawer.',
        bnDescription: 'ইউজার ছবি ও স্ট্যাটাস ব্যাজ। ক্লিক করলে সম্পূর্ণ সিকিউরিটি সেটিংস, 2FA, ইসলামিক অ্যাকাউন্ট ও কেওয়াইসি ভেরিফিকেশন ড্রয়ার ওপেন হয়।',
        url: '/profile',
        iconName: 'User',
        features: ['KYC verification badge', 'VIP status progression bar', 'Instant 2FA security status', 'One-click logout and session control'],
        bnFeatures: ['কেওয়াইসি ভেরিফিকেশন ব্যাজ', 'ভিআইপি স্ট্যাটাস প্রগ্রেস বার', '2FA গুগল অথেন্টিকেটর স্ট্যাটাস', 'লগআউট ও সেশন কন্ট্রোল']
      }
    ]
  },
  {
    id: 'chart-workspace',
    title: 'Chart Engine & Technical Analysis Controls',
    bnTitle: 'চার্ট ইঞ্জিন ও টেকনিক্যাল অ্যানালাইসিস টুলস',
    description: 'Tools located directly on the candlestick chart canvas for professional technical market analysis.',
    bnDescription: 'ক্যান্ডেলস্টিক চার্টের উপর অবস্থিত প্রফেশনাল টেকনিক্যাল অ্যানালাইসিসের সকল বাটন ও টুলস।',
    items: [
      {
        id: 'timeframe-selector',
        name: 'Chart Timeframe Switcher',
        bnName: 'টাইমফ্রেম সিলেক্টর',
        location: 'Bottom Left of Chart Canvas',
        bnLocation: 'চার্ট ক্যানভাসের নিচে বাম কোণায়',
        description: 'Change candlestick aggregation period from ultra-fast 5 seconds up to 1 day (5s, 10s, 15s, 30s, 1m, 2m, 5m, 15m, 30m, 1h, 1d).',
        bnDescription: 'ক্যান্ডেলস্টিকের সময় নির্ধারণ করার জন্য ৫ সেকেন্ড থেকে শুরু করে ১ দিন পর্যন্ত টাইমফ্রেম (5s, 15s, 1m, 5m, 1h, 1d) বাছাই করার টুল।',
        url: '/trade',
        iconName: 'Clock',
        features: ['5-second micro scalping timeframe', 'Standard 1m and 5m binary options timeframes', 'Daily macro trend inspection', 'Custom candle intervals'],
        bnFeatures: ['৫ সেকেন্ড আল্ট্রা-ফাস্ট স্ক্যাল্পিং', 'জনপ্রিয় ১ মিনিট ও ৫ মিনিট টাইমফ্রেম', 'দৈনিক ট্রেন্ড অ্যানালাইসিস', 'স্মুথ রিয়েল-টাইম ক্যান্ডেল আপডেট']
      },
      {
        id: 'chart-type-selector',
        name: 'Chart Visual Types (Candles, Area, Bars)',
        bnName: 'চার্ট টাইপ সিলেক্টর (ক্যান্ডেল, বার, মাউন্টেন)',
        location: 'Bottom Left of Chart Canvas',
        bnLocation: 'চার্ট ক্যানভাসের নিচে টাইমফ্রেমের পাশে',
        description: 'Switch between Japanese Candlesticks, Mountain/Area Line Chart, Bar Charts, and Heikin-Ashi smoothed candles for noise-free trend identification.',
        bnDescription: 'জাপানিজ ক্যান্ডেলস্টিক, মাউন্টেন এরিয়া লাইন, আমেরিকান বার এবং হেইকেন-আশি স্মুথ চার্টের মধ্যে সুইচ করার বাটন।',
        url: '/trade',
        iconName: 'CandlestickChart',
        features: ['Japanese Candlesticks with wicks and bodies', 'Heikin-Ashi trend smoothing', 'High-contrast area view', 'Configurable color palettes'],
        bnFeatures: ['জাপানিজ ক্যান্ডেলস্টিক ভিউ', 'হেইকেন-আশি ট্রেন্ড ফিল্টার', 'স্মুথ এরিয়া চার্ট ভিউ', 'কাস্টম কালার প্যালেট']
      },
      {
        id: 'indicators-drawer',
        name: 'Technical Indicators (RSI, MACD, Bollinger Bands)',
        bnName: 'টেকনিক্যাল ইন্ডিকেটর ড্রয়ার',
        location: 'Bottom Left of Chart Canvas',
        bnLocation: 'চার্ট ক্যানভাসের নিচে বাম পাশে',
        description: 'Access 20+ mathematical indicators including Relative Strength Index (RSI), Moving Average Convergence Divergence (MACD), Bollinger Bands, Moving Averages (SMA/EMA), Stochastic, and Parabolic SAR.',
        bnDescription: '২০টির বেশি টেকনিক্যাল ইন্ডিকেটর যেমন RSI, MACD, বলিঙ্গার ব্যান্ডস, মুভিং এভারেজ (SMA/EMA), স্টোকাস্টিক এবং ফ্র্যাক্টালস এক ক্লিকে চার্টে যুক্ত করার মেনু।',
        url: '/trade',
        iconName: 'Activity',
        badge: '20+ Indicators',
        features: ['RSI overbought/oversold levels (70/30)', 'Bollinger Bands volatility envelopes', 'MACD signal line crossovers', 'EMA/SMA trend filters'],
        bnFeatures: ['RSI ওভারবট ও ওভারসোল্ড লেভেল', 'বলিঙ্গার ব্যান্ড ভলাটাইল চ্যানেল', 'MACD ক্রসওভার সিগন্যাল', 'EMA ও SMA ট্রেন্ড ফিল্টার']
      },
      {
        id: 'drawing-tools',
        name: 'Drawing & Chart Annotation Tools',
        bnName: 'চার্ট ড্রয়িং ও ট্রেন্ডলাইন টুলস',
        location: 'Bottom Left of Chart Canvas',
        bnLocation: 'চার্ট ক্যানভাসের নিচে ইন্ডিকেটরের পাশে',
        description: 'Draw custom trendlines, horizontal support/resistance levels, vertical time markers, ray lines, and Fibonacci retracement ratios directly onto market prices.',
        bnDescription: 'চার্টের উপর নিজের মতো করে ট্রেন্ডলাইন, সাপোর্ট ও রেজিস্ট্যান্স লেভেল, ফিবোনাচ্চি রিট্রেসমেন্ট এবং চ্যানেল ড্র করার প্রফেশনাল টুলবক্স।',
        url: '/trade',
        iconName: 'Edit3',
        features: ['Custom trendlines with magnet snapping', 'Horizontal key psychological price levels', 'Fibonacci golden ratio retracements (0.618 / 0.5)', 'Color and line weight customization'],
        bnFeatures: ['ম্যাগনেট স্ন্যাপিং ট্রেন্ডলাইন', 'সাপোর্ট ও রেজিস্ট্যান্স লেভেল ড্রয়িং', 'ফিবোনাচ্চি গোল্ডেন রেশিও টুলস', 'কালার ও লাইন থিকনেস কাস্টমাইজেশন']
      }
    ]
  },
  {
    id: 'order-panel',
    title: 'Order Execution Panel (Call / Put Controls)',
    bnTitle: 'অর্ডার এক্সিকিউশন প্যানেল (কল ও পুট বাটন)',
    description: 'The right-hand panel on desktop (or sticky bottom sheet on mobile) where traders place Call (High) and Put (Low) trades.',
    bnDescription: 'ডেস্কটপে ডান পাশে এবং মোবাইলে নিচের দিকে অবস্থিত ট্রেড প্লেসমেন্ট প্যানেল।',
    items: [
      {
        id: 'investment-input',
        name: 'Investment Amount Selector',
        bnName: 'ইনভেস্টমেন্ট অ্যামাউন্ট সিলেক্টর',
        location: 'Order Panel Top Section',
        bnLocation: 'অর্ডার প্যানেলের উপরের অংশ',
        description: 'Input your desired trade investment starting from just $1 (or local equivalent). Features quick preset increment buttons (+$1, +$5, +$10, +$50, +$100).',
        bnDescription: 'ট্রেডের ইনভেস্টমেন্ট পরিমাণ নির্ধারণ করার ঘর। সর্বনিম্ন মাত্র ১ ডলার থেকে শুরু করা যায়। দ্রুত টাইপ না করে +১, +৫, +১০ বাটন দিয়েও বাড়ানো যায়।',
        url: '/trade',
        iconName: 'DollarSign',
        features: ['Minimum $1 entry threshold', 'One-click quick value multipliers', 'Real-time account balance validation', 'Custom currency display (USD, BDT, INR, etc.)'],
        bnFeatures: ['সর্বনিম্ন ১ ডলার থেকে ট্রেড', '১-ক্লিক কুইক অ্যামাউন্ট বাটন', 'অটো ব্যালেন্স ভ্যালিডেশন', 'লোকাল কারেন্সিতে প্রদর্শন']
      },
      {
        id: 'expiry-timer',
        name: 'Expiration Time Selector',
        bnName: 'ট্রেড এক্সপায়ারেশন টাইম সিলেক্টর',
        location: 'Order Panel Middle Section',
        bnLocation: 'অর্ডার প্যানেলের মাঝামাঝি অংশ',
        description: 'Choose your trade duration from 1 minute, 2 minutes, 5 minutes, 15 minutes, 1 hour, or end of current market trading session.',
        bnDescription: 'ট্রেড কতক্ষণ চলবে তা নির্ধারণ করার অপশন। ১ মিনিট, ২ মিনিট, ৫ মিনিট, ১৫ মিনিট বা ১ ঘণ্টা পর্যন্ত এক্সপায়ারেশন টাইম সেট করা যায়।',
        url: '/trade',
        iconName: 'Clock',
        features: ['Dynamic 1-minute turbo expiries', 'Precise candlestick closure alignment', 'Visual vertical expiration boundary on chart', 'Count-down timer in real-time'],
        bnFeatures: ['১ মিনিটের টার্বো এক্সপায়ারি', 'ক্যান্ডেলস্টিক সমাপ্তির সাথে টাইমিং', 'চার্টে এক্সপায়ারি লাইনের ভিজুয়াল ডিসপ্লে', 'রিয়েল-টাইম সেকেন্ড কাউন্টডাউন']
      },
      {
        id: 'call-put-buttons',
        name: 'CALL (Green / High) & PUT (Red / Low) Buttons',
        bnName: 'কল (সবুজ / আপ) ও পুট (লাল / ডাউন) এক্সিকিউশন বাটন',
        location: 'Order Panel Bottom Section',
        bnLocation: 'অর্ডার প্যানেলের নিচে বড় সবুজ ও লাল বাটন',
        description: 'Large high-contrast 1-click execution buttons. Clicking CALL (Green) forecasts price will close above strike level. Clicking PUT (Red) forecasts price will close below strike level.',
        bnDescription: 'সবুজ "CALL" বাটন (দাম উপরে যাবে) এবং লাল "PUT" বাটন (দাম নিচে নামবে)। ক্লিক করামাত্র কোনো লেটেন্সি ছাড়া ট্রেড ওপেন হয় এবং প্রফিট পারসেন্টেজ ডিসপ্লে করে।',
        url: '/trade',
        iconName: 'ArrowUpRight',
        badge: 'Instant Execution',
        features: ['<15ms instant server execution speed', 'High-contrast green and red visual indicators', 'Net profit projection displayed on button hover', 'Audio confirmations and tactile haptic feedback'],
        bnFeatures: ['১৫ মিলিসেকেন্ডের দ্রুত এক্সিকিউশন', 'হাই-কনট্রাস্ট সবুজ ও লাল বাটন', 'বাটনের উপর সরাসরি নেট প্রফিটের হিসাব', 'অডিও নোটিফিকেশন ও ভাইব্রেশন']
      }
    ]
  },
  {
    id: 'sidebar-navigation',
    title: 'Platform Navigation Menu (Sidebar Drawer & Bottom Bar)',
    bnTitle: 'প্ল্যাটফর্ম নেভিগেশন মেনু (সাইডবার ড্রয়ার ও মোবাইল বটম বার)',
    description: 'The primary navigation hub accessed via the hamburger menu icon (top-left) or the left desktop sidebar and mobile bottom tab bar.',
    bnDescription: 'ট্রেড পেজের প্রধান সাইডবার ড্রয়ার ও মোবাইল বটম বার, যা সম্পূর্ণ প্ল্যাটফর্মের প্রতিটি পেজে নিয়ে যায়।',
    items: [
      {
        id: 'nav-trade',
        name: 'Trade Terminal (`/trade`)',
        bnName: 'ট্রেড টার্মিনাল (`/trade`)',
        location: 'Sidebar Item 1 / Mobile Bottom Tab 1',
        bnLocation: 'সাইডবারের ১ম আইকন / মোবাইলের ১ম ট্যাব',
        description: 'The central core trading environment featuring live candlestick charts, order placing panel, and asset switching.',
        bnDescription: 'প্ল্যাটফর্মের মূল লাইভ ট্রেডিং স্ক্রিন। এখানে লাইভ ক্যান্ডেল চার্ট, টেকনিক্যাল টুলস ও অর্ডার প্যানেল থাকে।',
        url: '/trade',
        iconName: 'LayoutDashboard',
        features: ['Real-time streaming ticks', 'Zero latency charting', 'High payouts up to 95%', 'Full-screen mode support'],
        bnFeatures: ['রিয়েল-টাইম লাইভ প্রাইস টিকস', 'জিরো লেটেন্সি চার্ট', 'সর্বোচ্চ ৯৫% পে-আউট', 'ফুল-স্ক্রিন মোড সাপোর্ট']
      },
      {
        id: 'nav-activities',
        name: 'Activities & Trade Orders (`/activities`)',
        bnName: 'অ্যাক্টিভিটিজ ও লাইভ অর্ডার্স (`/activities`)',
        location: 'Sidebar Item 2 / Mobile Bottom Tab 4',
        bnLocation: 'সাইডবারের ২য় আইকন / মোবাইলের ৪র্থ ট্যাব',
        description: 'Monitor active running trades in real-time with live remaining seconds, strike prices, and instant settlement results. Review past trade history with win-rate analytics.',
        bnDescription: 'বর্তমান রানিং ট্রেডগুলোর সেকেন্ড কাউন্টডাউন, স্ট্রাইক প্রাইস এবং পূর্ববর্তী ট্রেডের লাভ-ক্ষতির পূর্ণাঙ্গ রিপোর্ট।',
        url: '/activities',
        iconName: 'LayoutGrid',
        features: ['Live active order countdown', 'Instant win/loss notifications', 'Historical profit and loss ledger', 'Daily and weekly win-rate charts'],
        bnFeatures: ['রানিং ট্রেডের লাইভ কাউন্টডাউন', 'ইনস্ট্যান্ট উইন/লস রেজাল্ট', 'অতীত ট্রেডের পুঙ্খানুপুঙ্খ রেকর্ড', 'দৈনিক ও সাপ্তাহিক উইন-রেট স্ট্যাটস']
      },
      {
        id: 'nav-copytrading',
        name: 'Copy Trading (`/copytrading`)',
        bnName: 'কপি ট্রেডিং (`/copytrading`)',
        location: 'Sidebar Drawer "For Traders" / Mobile Bottom Tab 3',
        bnLocation: 'সাইডবার মেনুর "For Traders" / মোবাইলের ৩য় ট্যাব',
        description: 'Browse top-performing master traders ranked by verified ROI and win rates. Automatically mirror their trades in real-time with custom stop-loss and allocation safeguards.',
        bnDescription: 'অভিজ্ঞ ও সফল মাস্টার ট্রেডারদের তালিকা। তাদের প্রফিট ও উইন রেট দেখে এক ক্লিকে তাদের ট্রেড স্বয়ংক্রিয়ভাবে নিজের অ্যাকাউন্টে কপি করা যায়।',
        url: '/copytrading',
        iconName: 'Users',
        badge: 'Popular',
        features: ['Verified master trader track records', 'Automated trade replication', 'Custom stop-loss and maximum copy size limits', '1-click start and stop copy options'],
        bnFeatures: ['ভেরিফাইড মাস্টার ট্রেডার প্রোফাইল', 'স্বয়ংক্রিয় ১-ক্লিক ট্রেড কপি', 'কাস্টম স্টপ-লস ও ইনভেস্টমেন্ট লিমিট', 'যেকোনো সময় বন্ধ বা চালু করার সুবিধা']
      },
      {
        id: 'nav-tournaments',
        name: 'Trading Tournaments (`/tournaments`)',
        bnName: 'ট্রেডিং টুর্নামেন্টস (`/tournaments`)',
        location: 'Sidebar Drawer "For Traders" Section',
        bnLocation: 'সাইডবার ড্রয়ারের "For Traders" অপশন',
        description: 'Join competitive binary options tournaments with large cash prize pools. Trade with virtual tournament currency and climb the leaderboard to win withdrawable cash rewards.',
        bnDescription: 'আকর্ষণীয় নগদ পুরস্কারের টুর্নামেন্ট। টুর্নামেন্ট ব্যালেন্স দিয়ে ট্রেড করে লিডারবোর্ডের শীর্ষে উঠে রিয়েল ক্যাশ প্রাইজ জেতার সুযোগ।',
        url: '/tournaments',
        iconName: 'Trophy',
        badge: 'Cash Prizes',
        features: ['Free demo tournaments with cash prizes', 'Guaranteed high prize pools', 'Real-time competitive participant rankings', 'Direct-to-cash balance prize payouts'],
        bnFeatures: ['ফ্রি টুর্নামেন্টে অংশ নিয়ে রিয়েল ক্যাশ প্রাইজ', 'বড় প্রাইজ পুল গ্যারান্টি', 'রিয়েল-টাইম র‍্যাংকিং লিডারবোর্ড', 'সরাসরি উইথড্রয়ালযোগ্য ক্যাশ রিওয়ার্ড']
      },
      {
        id: 'nav-leaderboard',
        name: 'Top 20 Leaderboard (`/leaderboard`)',
        bnName: 'টপ ২০ লিডারবোর্ড (`/leaderboard`)',
        location: 'Sidebar Drawer "For Traders" Section',
        bnLocation: 'সাইডবার ড্রয়ারের "For Traders" অপশন',
        description: 'See the most successful traders of the day, week, and month. View net profits, country flags, and trading volume milestones.',
        bnDescription: 'প্ল্যাটফর্মের আজকের ও সপ্তাহের সেরা ট্রেডারদের র‍্যাংকিং। কে কত প্রফিট করেছে, কোন দেশের ট্রেডার তা সরাসরি দেখা যায়।',
        url: '/leaderboard',
        iconName: 'Award',
        features: ['Daily and weekly profit rankings', 'Global trader community benchmarks', 'Country flag identification', 'Inspirational profit targets'],
        bnFeatures: ['দৈনিক ও সাপ্তাহিক প্রফিট র‍্যাংকিং', 'গ্লোবাল ট্রেডারদের পারফরম্যান্স', 'দেশভিত্তিক ট্রেডার তালিকা', 'অনুপ্রেরণামূলক ট্রেডিং মাইলফলক']
      },
      {
        id: 'nav-promotions',
        name: 'Promotions & Bonuses (`/promotions`)',
        bnName: 'প্রমোশন ও বোনাস (`/promotions`)',
        location: 'Sidebar Drawer "For Traders" Section',
        bnLocation: 'সাইডবার ড্রয়ারের "For Traders" অপশন',
        description: 'Redeem deposit promo codes (e.g. 50% to 100% deposit bonuses), activate risk-free trade vouchers, and participate in cash-back loyalty rewards.',
        bnDescription: 'ডিপোজিট বোনাস প্রোমোকোড ব্যবহার করে ৫০% থেকে ১০০% অতিরিক্ত ব্যালেন্স নেওয়ার পেজ। রিস্ক-ফ্রি ট্রেড ভাউচার ও ক্যাশব্যাক সুবিধা।',
        url: '/promotions',
        iconName: 'Gift',
        features: ['50% - 100% deposit match bonus codes', 'Risk-free trades refunding lost positions', 'Weekly turnover cashback', 'Instant promo code redemption input'],
        bnFeatures: ['৫০% - ১০০% ডিপোজিট বোনাস কোড', 'রিস্ক-ফ্রি ট্রেড ভাউচার সাপোর্ট', 'সাপ্তাহিক টার্নওভার ক্যাশব্যাক', '১-ক্লিকে প্রোমোকোড রিডিম']
      },
      {
        id: 'nav-calendar',
        name: 'Economic Calendar (`/calendar`)',
        bnName: 'ইকোনমিক ক্যালেন্ডার (`/calendar`)',
        location: 'Sidebar Drawer "For Traders" Section',
        bnLocation: 'সাইডবার ড্রয়ারের "For Traders" অপশন',
        description: 'Track key macroeconomic events such as central bank interest rate hikes, Non-Farm Payrolls (NFP), Consumer Price Index (CPI), and GDP data that drive massive currency volatility.',
        bnDescription: 'আন্তর্জাতিক অর্থনৈতিক সংবাদ ও নিউজ রিলিজ ক্যালেন্ডার। US CPI, Non-Farm Payrolls (NFP) এবং সুদের হার ঘোষণার সময়সূচী ও প্রভাব বিশ্লেষণ।',
        url: '/calendar',
        iconName: 'Calendar',
        features: ['Real-time economic event countdowns', 'Impact ratings (Low, Medium, High impact bull heads)', 'Previous, Forecast, and Actual data comparison', 'Currency filter (USD, EUR, GBP, JPY)'],
        bnFeatures: ['রিয়েল-টাইম নিউজ কাউন্টডাউন', 'হাই-ইম্প্যাক্ট মার্কেট ভোলাটিলিটি ওয়ার্নিং', 'পূর্ববর্তী, পূর্বাভাস ও বর্তমান ডাটা তুলনা', 'কারেন্সি ফিল্টারিং সুবিধা']
      },
      {
        id: 'nav-statuses',
        name: 'VIP Statuses & Tiers (`/statuses`)',
        bnName: 'ভিআইপি স্ট্যাটাস ও টিয়ার্স (`/statuses`)',
        location: 'Sidebar Drawer "Information" Section',
        bnLocation: 'সাইডবার ড্রয়ারের "Information" অপশন',
        description: 'Explore the 5 platform status tiers: Free, Standard, Gold, VIP, and Prestige. Leveling up grants up to 95% asset profitability, dedicated account managers, and priority 4-hour withdrawals.',
        bnDescription: 'প্ল্যাটফর্মের ৫টি অ্যাকাউন্ট লেভেল: Free, Standard, Gold, VIP, এবং Prestige। লেভেল বাড়লে পে-আউট ৯৫% পর্যন্ত বৃদ্ধি পায় এবং দ্রুততম ৪ ঘণ্টায় উইথড্র নিশ্চিত হয়।',
        url: '/statuses',
        iconName: 'Diamond',
        badge: 'Up to 95% Yield',
        features: ['Profitability boost from 82% to 95%', 'Priority withdrawal queue (instant to 4 hours)', 'Personal dedicated account manager', 'Free weekly trading insurance & risk-free trades'],
        bnFeatures: ['পে-আউট ৮২% থেকে বাড়িয়ে ৯৫% পর্যন্ত', 'অগ্রাধিকার ভিত্তিতে দ্রুততম উইথড্র', 'পার্সোনাল ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার', 'ফ্রি সাপ্তাহিক ট্রেডিং ইনস্যুরেন্স']
      },
      {
        id: 'nav-cashier',
        name: 'Cashier & Banking Hub (`/cashier`)',
        bnName: 'ক্যাশিয়ার ও ব্যাংকিং হাব (`/cashier`)',
        location: 'Sidebar & Header Shortcuts (`/deposit`, `/withdraw`, `/transactions`)',
        bnLocation: 'সাইডবার ও হেডার বাটন (`/deposit`, `/withdraw`, `/transactions`)',
        description: 'Manage all financial transactions. Features instant local deposit gateways (bKash, Nagad, Rocket, UPI, Pix, SPEI) and crypto (USDT TRC20, Bitcoin, Ethereum, Binance Pay).',
        bnDescription: 'টাকা জমা ও তোলার কেন্দ্রীয় ব্যাংকিং হাব। বিকাশ, নগদ, রকেট, ইউএসডিটি, বিটকয়েন ও বাইন্যান্স পে-এর মাধ্যমে শূন্য ফি-তে লেনদেন পরিচালনা।',
        url: '/cashier',
        iconName: 'CreditCard',
        features: ['Zero processing fees on deposits & withdrawals', 'Instant automated mobile banking credits', 'Crypto multi-chain integration (TRC20, ERC20, BEP20, TON)', 'Audited real-time transaction ledger'],
        bnFeatures: ['ডিপোজিট ও উইথড্রয়ে শূন্য প্রসেসিং ফি', 'মোবাইল ব্যাংকিংয়ে ইনস্ট্যান্ট ব্যালেন্স যোগ', 'মাল্টি-চেইন ক্রিপ্টো ডিপোজিট সাপোর্ট', 'স্বচ্ছ ট্রানজ্যাকশন হিস্ট্রি ও ভাউচার']
      },
      {
        id: 'nav-profile',
        name: 'Profile, Security & KYC (`/profile`)',
        bnName: 'প্রোফাইল, সিকিউরিটি ও কেওয়াইসি (`/profile`)',
        location: 'Sidebar Bottom / Header Profile Avatar',
        bnLocation: 'সাইডবারের নিচে / হেডারের প্রোফাইল আইকন',
        description: 'Complete KYC identity verification, enable Google Authenticator 2-Factor Authentication (2FA), toggle Halal Islamic swap-free mode, and configure regional language preferences.',
        bnDescription: 'জাতীয় পরিচয়পত্র/পাসপোর্ট দিয়ে কেওয়াইসি ভেরিফিকেশন, গুগল অথেন্টিকেটর 2FA সিকিউরিটি, ইসলামিক অ্যাকাউন্ট ও ভাসা (Language) পরিবর্তন করার সম্পূর্ণ ড্যাশবোর্ড।',
        url: '/profile',
        iconName: 'ShieldCheck',
        features: ['Fast automated KYC document upload', 'Google Authenticator 2FA protection', 'Islamic interest-free account toggle', '22+ global languages selector'],
        bnFeatures: ['সহজ ও দ্রুত কেওয়াইসি ভেরিফিকেশন', 'গুগল অথেন্টিকেটর 2FA প্রোটেকশন', 'সুদমুক্ত ইসলামিক অ্যাকাউন্ট অপশন', 'বাংলাসহ ২২টির বেশি ভাসা পরিবর্তন']
      },
      {
        id: 'nav-support',
        name: '24/7 Live Support Desk (`/support-center`)',
        bnName: '২৪/৭ লাইভ সাপোর্ট ডেস্ক (`/support-center`)',
        location: 'Sidebar Drawer Bottom / Floating Action Button',
        bnLocation: 'সাইডবার ড্রয়ারের নিচে / ফ্লোটিং চ্যাট বাটন',
        description: 'Connect immediately with dedicated support agents for deposit assistance, withdrawal inquiries, technical terminal help, and account verification guidance.',
        bnDescription: 'ডিপোজিট, উইথড্রয়াল বা যেকোনো টেকনিক্যাল সমস্যায় তাৎক্ষণিক সমাধান পাওয়ার জন্য সার্বক্ষণিক লাইভ চ্যাট সাপোর্ট ডেস্ক।',
        url: '/support-center',
        iconName: 'MessageSquare',
        badge: '24/7 Live Help',
        features: ['<1 minute average chat response time', 'Multilingual support agents (Bengali, English, Spanish, Hindi)', 'Direct screenshot and receipt upload', 'Comprehensive FAQ troubleshooting knowledgebase'],
        bnFeatures: ['১ মিনিটের মধ্যে লাইভ এজেন্ট রেসপন্স', 'বাংলা ও ইংরেজিতে সরাসরি সমাধান', 'স্ক্রিনশট ও পেমেন্ট রিসিট আপলোড', 'সহজ প্রশ্নোত্তরের বিশাল নলেজবেস']
      },
      {
        id: 'nav-affiliate',
        name: 'Bivaax Affiliate & Partner Program (`/affiliate`)',
        bnName: 'বাইভাক্স অ্যাফিলিয়েট ও পার্টনার প্রোগ্রাম (`/affiliate`)',
        location: 'Sidebar Drawer "For Partners" / Header Links',
        bnLocation: 'সাইডবার মেনুর "For Partners" / হেডার লিংক',
        description: 'Join the official Bivaax Affiliated Program (Bivaax Partners / IB Program). Earn up to 80% lifetime Revenue Share, high CPA commissions, and sub-affiliate rewards with instant hourly USDT payouts and 0% withdrawal fees.',
        bnDescription: 'অফিসিয়াল বাইভাক্স অ্যাফিলিয়েট প্রোগ্রাম। সর্বোচ্চ ৮০% লাইফটাইম রেভিনিউ শেয়ার, হাই সিপিএ কমিশন এবং ইনস্ট্যান্ট ইউএসডিটি পে-আউট।',
        url: '/affiliate',
        iconName: 'Briefcase',
        badge: 'Up to 80% RevShare',
        features: ['Up to 80% lifetime Revenue Share & CPA', 'Instant hourly USDT commission payouts', 'Sub-affiliate multi-tier network (up to 10%)', 'High-converting promo banners & referral tracking'],
        bnFeatures: ['সর্বোচ্চ ৮০% লাইফটাইম রেভিনিউ শেয়ার', 'ইনস্ট্যান্ট ইউএসডিটি কমিশন উইথড্র', 'সাব-অ্যাফিলিয়েট মাল্টি-টিয়ার কমিশন', 'হাই-কনভার্টিং প্রমো ব্যানার ও ট্র্যাকিং লিংক']
      }
    ]
  }
];

export const TRADE_MENU_FAQS = [
  {
    question: "Where can I find the Bivaax Affiliate and Partner Program page?",
    bnQuestion: "Bivaax-এর অ্যাফিলিয়েট বা পার্টনার প্রোগ্রাম পেজটি কোথায় পাব?",
    answer: "You can access the Bivaax Affiliate Program directly by visiting /affiliate (or partner.bivaax.com) or by clicking 'Partner & Affiliate Program' inside the navigation menu. You can register as an affiliate partner for free and earn up to 80% lifetime Revenue Share.",
    bnAnswer: "ট্রেড পেজের নেভিগেশন মেনু থেকে অথবা সরাসরি /affiliate এবং partner.bivaax.com ঠিকানায় গিয়ে ফ্রি রেজিস্ট্রেশন করে সর্বোচ্চ ৮০% পর্যন্ত লাইফটাইম কমিশন আয় করতে পারবেন।"
  },
  {
    question: "Where can I switch between Demo and Real accounts in the Bivaax Trade Terminal?",
    bnQuestion: "Bivaax ট্রেড পেজে ডেমো এবং রিয়েল অ্যাকাউন্ট কিভাবে পরিবর্তন করব?",
    answer: "Look at the top-right header bar. Click on your balance amount or the arrow next to 'Demo Account' or 'Live Account'. A dropdown will appear allowing you to select your $10,000 refillable practice account or your real money account with one click.",
    bnAnswer: "ট্রেড পেজের উপরে ডান পাশের হেডার বারে আপনার ব্যালেন্সের উপর ক্লিক করুন। একটি ড্রপডাউন মেনু আসবে যেখান থেকে আপনি ১-ক্লিকেই $১০,০০০ ফ্রি ডেমো অ্যাকাউন্ট অথবা রিয়েল ক্যাশ অ্যাকাউন্টে সুইচ করতে পারবেন।"
  },
  {
    question: "How do I choose trading assets and check payout rates on Bivaax?",
    bnQuestion: "Bivaax-এ কিভাবে ট্রেডিং অ্যাসেট বাছাই করব এবং প্রফিট পারসেন্টেজ দেখব?",
    answer: "At the top-left of the chart workspace, click the '+' button next to the opened asset tabs. This opens the asset catalog covering Forex, Crypto, Stocks, Commodities, and 24/7 OTC markets. Each asset displays its exact payout percentage (up to 95%).",
    bnAnswer: "চার্টের উপরে বাম পাশে থাকা '+' বাটনে ক্লিক করুন। এখানে ফরেক্স, ক্রিপ্টোকারেন্সি, স্টক ও ওটিসি অ্যাসেটের পূর্ণাঙ্গ তালিকা দেখতে পাবেন এবং প্রতিটি অ্যাসেটের বর্তমান পে-আউট (সর্বোচ্চ ৯৫%) দেখতে পাবেন।"
  },
  {
    question: "Where are technical indicators like RSI, MACD, and Bollinger Bands located?",
    bnQuestion: "RSI, MACD এবং বলিঙ্গার ব্যান্ডের মতো টেকনিক্যাল ইন্ডিকেটরগুলো চার্টে কোথায় আছে?",
    answer: "At the bottom-left corner of the candlestick chart canvas, you will find four analytical icons: Chart Visual Types (Candles/Bars), Timeframe Selector (5s to 1d), Indicators Drawer (compass/graph icon), and Drawing Tools (pencil icon). Click the indicator icon to apply RSI, MACD, Moving Averages, and Bollinger Bands.",
    bnAnswer: "ক্যান্ডেলস্টিক চার্টের নিচে বাম কোণায় ইন্ডিকেটর আইকন (গ্রাফ/কম্পাস চিহ্ন) রয়েছে। সেখানে ক্লিক করলে RSI, MACD, বলিঙ্গার ব্যান্ডস, মুভিং এভারেজসহ ২০টির বেশি ইন্ডিকেটর এক ক্লিকেই চার্টে চালু করতে পারবেন।"
  },
  {
    question: "How do I execute a CALL (Higher) or PUT (Lower) trade?",
    bnQuestion: "কিভাবে কল (CALL) বা পুট (PUT) ট্রেড ওপেন করব?",
    answer: "On desktop, look at the order panel on the right side (or at the bottom on mobile). 1) Set your investment amount ($1 minimum). 2) Choose your expiration duration (1m, 2m, 5m, etc.). 3) Review your potential profit. 4) Click the green CALL button if you forecast the price will rise, or click the red PUT button if you forecast the price will fall.",
    bnAnswer: "ডেস্কটপে ডান পাশের প্যানেলে (মোবাইলে নিচের দিকে) প্রথমে ইনভেস্টমেন্টের পরিমাণ ($১ থেকে শুরু) লিখুন, তারপর এক্সপায়ারেশনের সময় (১ মিনিট, ৫ মিনিট ইত্যাদি) নির্ধারণ করুন। এরপর দাম বাড়বে মনে হলে সবুজ CALL বাটন চাপুন, আর দাম কমবে মনে হলে লাল PUT বাটন চাপুন।"
  },
  {
    question: "Where can I find Copy Trading, Tournaments, and the Economic Calendar?",
    bnQuestion: "কপি ট্রেডিং, টুর্নামেন্ট এবং ইকোনমিক ক্যালেন্ডার কোথায় পাব?",
    answer: "Click the hamburger Menu icon at the top-left corner of the Trade Terminal to open the expanded navigation sidebar. Under the 'For Traders' section, you will find direct links to Copy Trading (/copytrading), Tournaments (/tournaments), Leaderboard (/leaderboard), Promotions (/promotions), and Economic Calendar (/calendar).",
    bnAnswer: "ট্রেড পেজের উপরে বাম কোণায় থাকা মেনু (হ্যামবার্গার) বাটনে ক্লিক করলে সাইডবার ড্রয়ার ওপেন হবে। সেখানে 'For Traders' অপশনের ভেতরে কপি ট্রেডিং, টুর্নামেন্টস, লিডারবোর্ড, বোনাস প্রমোশন এবং ইকোনমিক ক্যালেন্ডারের সরাসরি বাটন পেয়ে যাবেন।"
  },
  {
    question: "How do I deposit funds using bKash, Nagad, or Crypto USDT in the Trade Terminal?",
    bnQuestion: "বিকাশ, নগদ বা ইউএসডিটি দিয়ে ট্রেড পেজ থেকে কিভাবে সরাসরি ডিপোজিট করব?",
    answer: "Click the prominent golden 'Deposit' button located at the top-right header of the Trade Terminal (or open the Cashier tab from the sidebar menu). Select your preferred method (bKash, Nagad, Rocket, Binance Pay, or USDT TRC20), enter your amount, and follow the simple on-screen instructions for instant automated balance crediting.",
    bnAnswer: "ট্রেড পেজের উপরে ডান পাশের সোনালী 'Deposit' বাটনে ক্লিক করুন। এরপর বিকাশ, নগদ, রকেট, বাইন্যান্স পে বা ইউএসডিটি নির্বাচন করে ডিপোজিট অ্যামাউন্ট লিখুন। সাথে সাথে আপনার অ্যাকাউন্টে ব্যালেন্স যুক্ত হয়ে যাবে।"
  }
];
