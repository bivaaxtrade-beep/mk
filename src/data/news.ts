export interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  date: string;
  category: string;
}

export const NEWS_DATA: Record<string, NewsItem> = {
  'chart-basics': {
    id: 'chart-basics',
    title: 'Get to know the chart',
    subtitle: 'The foundation of every successful trade begins with understanding the canvas.',
    date: 'August 3, 2026',
    category: 'Education',
    imageUrl: 'https://i.postimg.cc/fLngfrqx/Screenshot-20260803-165444.png',
    content: `
      <h2>The Heart of Trading</h2>
      <p>The price chart is more than just lines and candles; it's a living map of human psychology and market forces. To trade effectively, you must learn to read the stories these charts tell.</p>
      
      <h3>Visualizing Price Action</h3>
      <p>Our platform provides real-time, high-fidelity price feeds that allow you to see every tick of market movement. Whether you prefer Japanese Candlesticks, Heikin Ashi, or simple Area charts, understanding the flow of price is your first step to mastery.</p>
      
      <h3>Key Elements</h3>
      <ul>
        <li><strong>Timeframes:</strong> Switch between 1-second to 1-day views to identify both micro-scalping opportunities and long-term trends.</li>
        <li><strong>Price Scales:</strong> Use linear or logarithmic scales to better visualize percentage movements.</li>
        <li><strong>Interaction:</strong> Seamlessly zoom and scroll to examine historical data alongside real-time updates.</li>
      </ul>
      
      <p>Spend time observing the charts without trading. Notice how price reacts to certain levels, how it consolidates, and how it breaks out. This visual intuition is what separates professional traders from amateurs.</p>
    `
  },
  'chart-scale': {
    id: 'chart-scale',
    title: 'Precision Scaling',
    subtitle: 'Control your perspective with intuitive zooming and scrolling mechanics.',
    date: 'August 3, 2026',
    category: 'Platform Update',
    imageUrl: 'https://i.postimg.cc/sx9Xgqqb/Screenshot-20260803-165447.png',
    content: `
      <h2>Mastering Your View</h2>
      <p>In the fast-paced world of trading, perspective is everything. Our new scaling mechanics are designed to give you total control over how you perceive market movements.</p>
      
      <h3>Dynamic Zooming</h3>
      <p>Using your mouse wheel or touch gestures, you can instantly zoom in to see individual tick movements or zoom out to view the entire day's trend. The vertical scale automatically adjusts to keep the price action centered and clear.</p>
      
      <h3>Seamless Scrolling</h3>
      <p>Don't just look at the now. Drag the chart back to see how previous sessions unfolded. Our high-performance engine caches historical data, ensuring that your transition from past to present is smooth and lag-free.</p>
      
      <p>Pro Tip: Use the 'Reset Scale' button to instantly return to the most recent price point with the optimal zoom level for your screen size.</p>
    `
  },
  'market-overview': {
    id: 'market-overview',
    title: 'Market Overview 2.0',
    subtitle: 'A holistic view of the global financial landscape at your fingertips.',
    date: 'August 3, 2026',
    category: 'Features',
    imageUrl: 'https://i.postimg.cc/N0vbSPmn/IMG-20260803-175740-340.jpg',
    content: `
      <h2>The Big Picture</h2>
      <p>Successful traders don't look at assets in isolation. Our Market Overview feature allows you to monitor multiple currency pairs, commodities, and indices simultaneously.</p>
      
      <h3>Multi-Chart Layouts</h3>
      <p>Configure your workspace with up to 4 simultaneous chart views. Watch the correlation between EUR/USD and Gold, or monitor multiple timeframes of the same asset to confirm your entries.</p>
      
      <h3>Real-time Sentiment</h3>
      <p>See what the community is doing. Our integrated sentiment indicators show the balance of Buy vs. Sell orders across the entire Bivaax network, providing a powerful secondary confirmation for your strategies.</p>
      
      <p>By keeping a broad eye on the market, you can identify global trends before they manifest in individual charts.</p>
    `
  },
  'history-nav': {
    id: 'history-nav',
    title: 'History Navigation & Standard Status',
    subtitle: 'Explore full trade history analytics, historical chart navigation, and Standard Account benefits.',
    date: 'September 3, 2026',
    category: 'Status & History',
    imageUrl: 'https://i.postimg.cc/6Q3tZRfz/file-000000005f788206913b751eaa5b3905.png',
    content: `
      <h2>Standard Account Status Overview</h2>
      <p>Welcome to your Standard Account Status on Bivaax Trade! Review your historical performance and enjoy premium features designed for optimal trading results.</p>
      
      <h3>Key Standard Status Benefits</h3>
      <ul>
        <li><strong>Profitability:</strong> Up to 85% payout return on successful trades across financial markets.</li>
        <li><strong>120+ Assets:</strong> Full trading access to over 120 digital currency pairs, forex, commodities, and stock indices.</li>
        <li><strong>Fast Withdrawals:</strong> Standard withdrawal processing within 3 business days.</li>
        <li><strong>Invite Friends:</strong> Earn up to $50 in referral bonuses for inviting fellow active traders.</li>
        <li><strong>Deposit Bonuses:</strong> Unlock up to 100% deposit bonus codes on qualifying account top-ups.</li>
        <li><strong>Advanced Payments Guarantee:</strong> Automatic priority resolution and advance payments if your deposit takes too long to process.</li>
      </ul>

      <h3>Historical Chart Navigation</h3>
      <p>Combine your status benefits with deep history tracking. Swipe through past candlestick charts, analyze previous entry points, and backtest your strategies with real second-by-second historical market data.</p>
    `
  },
  'new-mechanics': {
    id: 'new-mechanics',
    title: 'Next-Gen Trading Mechanics',
    subtitle: 'Built for speed, engineered for reliability, designed for you.',
    date: 'August 3, 2026',
    category: 'System',
    imageUrl: 'https://i.postimg.cc/SNWdk64P/file-00000000511481fa82533f375be9869f.png',
    content: `
      <h2>Under the Hood</h2>
      <p>We've completely rebuilt our core execution engine. The result is a trading experience that is faster, more stable, and more responsive than ever before.</p>
      
      <h3>Zero-Latency Execution</h3>
      <p>Our new order matching algorithm reduces internal latency to sub-millisecond levels. When you click trade, your order is processed instantly, ensuring you get the exact price you see on the screen.</p>
      
      <h3>Enhanced Stability</h3>
      <p>With our new distributed server architecture, the platform remains rock-solid even during periods of extreme market volatility. Trade with confidence, knowing that your tools will always be ready when the opportunity strikes.</p>
    `
  },
  'trend-analysis': {
    id: 'trend-analysis',
    title: 'Mastering Trend Analysis',
    subtitle: 'Harness the power of technical indicators to unlock consistent profitability.',
    date: 'August 3, 2026',
    category: 'Strategy',
    imageUrl: 'https://i.postimg.cc/TPXXhq5D/file-0000000041348208ad773129ec36dec3.png',
    content: `
      <h2>The Trend is Your Friend</h2>
      <p>Identifying the direction of the market is the most critical skill for any trader. Our Trend Analysis suite provides professional-grade tools to help you stay on the right side of the trade.</p>
      
      <h3>Advanced Indicators</h3>
      <p>Access a full library of technical indicators, including Moving Averages, Bollinger Bands, RSI, and MACD. Each indicator is fully customizable, allowing you to fine-tune the parameters to match your specific trading style.</p>
      
      <h3>Visual Confirmation</h3>
      <p>Use our drawing tools to mark support and resistance levels, draw trend lines, and identify Fibonacci retracements. When these geometric levels align with your technical indicators, you have a high-probability trade setup.</p>
      
      <p>Remember: Technical analysis is not about predicting the future, but about managing probabilities. Use these tools to build a robust trading plan and manage your risk effectively.</p>
    `
  },
  'social-trading': {
    id: 'social-trading',
    title: 'Social Trading & Community',
    subtitle: 'Learn, share, and grow together with a global network of elite traders.',
    date: 'August 3, 2026',
    category: 'Community',
    imageUrl: 'https://i.postimg.cc/XvZFVzz7/file-00000000aa30821198dc51f01fa3ed44.png',
    content: `
      <h2>Strength in Numbers</h2>
      <p>Trading doesn't have to be a solo journey. Our Social Trading ecosystem is designed to connect beginners with veterans, fostering a culture of collective success.</p>
      
      <h3>Real-Time Community Feed</h3>
      <p>Join the conversation in our live trading rooms. Share your setups, discuss market news, and get instant feedback from other traders around the world. Every perspective adds a piece to the puzzle.</p>
      
      <h3>Leaderboards & Profiles</h3>
      <p>Follow the top-performing traders on Bivaax. Our transparent leaderboard showcases the best strategies in action, allowing you to learn from their trade history and risk management techniques.</p>
      
      <h3>Earn While You Share</h3>
      <p>Are you a successful trader? Build your following and earn additional rewards through our affiliate and community recognition programs. Your expertise is valuable, and we believe in rewarding it.</p>
      
      <p>By engaging with the community, you gain access to a wealth of knowledge that can significantly accelerate your learning curve and improve your trading results.</p>
    `
  },
  'smart-signals': {
    id: 'smart-signals',
    title: 'Smart Signals & Automation',
    subtitle: 'Leverage the power of algorithmic precision to optimize your trading entries.',
    date: 'August 3, 2026',
    category: 'Technology',
    imageUrl: 'https://i.postimg.cc/xTJS3Gh0/file-000000005d9c82098104f326333bf72d.png',
    content: `
      <h2>Precision at Your Fingertips</h2>
      <p>In the world of high-frequency trading, every second counts. Our Smart Signals engine analyzes millions of data points across multiple timeframes to identify high-probability setups before they happen.</p>
      
      <h3>Algorithmic Intelligence</h3>
      <p>Our signals aren't just based on simple indicators. They use a proprietary blend of price action, volatility analysis, and volume flow. Whether it's a trend reversal or a breakout confirmation, Smart Signals gives you the edge you need.</p>
      
      <h3>Real-Time Notifications</h3>
      <p>Never miss an opportunity again. Signals are delivered instantly to your trading terminal with clear entry points, expiration times, and confidence levels. You can choose to execute them manually with one click or set up automated alerts.</p>
      
      <h3>Fully Customizable</h3>
      <p>Filter signals based on your preferred assets, risk tolerance, and timeframes. Whether you're a 1-minute scalper or a daily trend follower, you can tune the engine to match your specific strategy.</p>
      
      <p>By integrating Smart Signals into your workflow, you reduce emotional bias and rely on data-driven insights to guide your trading decisions.</p>
    `
  },
  'crypto-profits': {
    id: 'crypto-profits',
    title: 'Unlocking Crypto Profits',
    subtitle: 'Master the high-volatility world of digital assets for maximum returns.',
    date: 'August 3, 2026',
    category: 'Markets',
    imageUrl: 'https://i.postimg.cc/g2zQBvBx/file-000000002ff08209a59650bce6f23599.png',
    content: `
      <h2>The Crypto Advantage</h2>
      <p>Cryptocurrencies offer unique opportunities for traders due to their 24/7 availability and significant price movements. On Bivaax, assets like Crypto IDX provide high payouts and consistent liquidity.</p>
      
      <h3>Why Trade Crypto on Bivaax?</h3>
      <p>Our platform provides a seamless experience for crypto trading. With competitive payout rates reaching up to 90% and beyond, digital assets are often the preferred choice for traders looking to grow their accounts quickly.</p>
      
      <h3>Diversified Digital Assets</h3>
      <p>From Bitcoin and Ethereum to specialized indices like Crypto IDX, we offer a wide range of instruments. Each asset has its own volatility profile, allowing you to tailor your strategy to current market conditions.</p>
      
      <h3>Advanced Risk Management</h3>
      <p>While the rewards are high, crypto markets require disciplined risk management. Use our built-in tools to set your trade amounts and expiration times precisely, ensuring you stay in control of your capital at all times.</p>
      
      <p>Start exploring the crypto markets today and discover why thousands of traders choose digital assets for their daily profit targets.</p>
    `
  },
  'activities-hub': {
    id: 'activities-hub',
    title: 'Bivaax Activities Hub (অ্যাক্টিভিটিজ) — Tournaments, Bonuses, Economic Calendar, Top-20 & Chart Tools',
    subtitle: 'The complete master guide to the Bivaax Activities Hub: $25,000 Elite Prestige Cup, 100% Deposit Bonus, Economic Calendar, Top-20 Leaderboard, What\'s New & Advanced Chart Drawing Tools.',
    date: 'September 22, 2026',
    category: 'Features & Guide',
    imageUrl: 'https://i.postimg.cc/NFXnXHrw/file-00000000110081fa8ffe4ae74614b59a.png',
    content: `
      <h2>Bivaax Activities Hub (অ্যাক্টিভিটিজ) — The Complete Master Guide</h2>
      <p>The <strong>Activities Hub (অ্যাক্টিভিটিজ)</strong> is your central mission control inside the Bivaax Trade terminal. It unifies high-yield tournament competitions, lucrative deposit bonuses, institutional-grade economic market calendars, live trader leaderboards, platform changelogs, affiliate earnings, and professional education into one lightning-fast, mobile-optimized command center.</p>

      <div style="background: rgba(255, 226, 76, 0.08); border: 1px solid rgba(255, 226, 76, 0.25); border-radius: 16px; padding: 18px; margin: 24px 0;">
        <h4 style="margin: 0 0 8px 0; color: #FFE24C;">📍 কোথায় কী আছে? (Activities Hub Layout Overview)</h4>
        <p style="margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.6;">
          মোবাইল স্ক্রিনে নিচের নেভিগেশন বার থেকে অথবা ডেস্কটপে বামদিকের মেনু ড্রয়ার থেকে <strong>অ্যাক্টিভিটিজ (Activities)</strong> ওপেন করলে আপনি স্ক্রিনে তিনটি প্রধান অংশ দেখতে পাবেন: 
          ১. <strong>টপ স্টোরিজ ও ফিচার ব্যানার</strong> (নতুন ড্রয়িং টুলস, $25,000 এলিট প্রেস্ট্রিজ কাপ, ১০০% ডিপোজিট বোনাস), 
          ২. <strong>টুর্নামেন্ট কার্ড</strong> (লাইভ ট্রেডিং প্রতিযোগিতা), 
          ৩. <strong>৩টি দ্রুত অ্যাক্সেস গ্রিড</strong> (বোনাস, অর্থনৈতিক ক্যালেন্ডার, টপ-২০ লিডারবোর্ড) এবং 
          ৪. <strong>লিস্ট আইটেমস</strong> (নতুন কি?, ফ্রেন্ড ইনভাইট, ট্রেডিং শিক্ষা)।
        </p>
      </div>

      <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;" />

      <h3>১. টপ স্টোরিজ ও ব্যানার সেকশন (Top Announcement Banners)</h3>

      <h4>🎨 ক) নতুন ড্রয়িং টুলস (NEW TOOLS ARE HERE — Advanced Chart Drawing Tools)</h4>
      <p>এখন বিভাক্স ট্রেডে সরাসরি লাইভ ক্যান্ডেলস্টিক চার্টের উপর প্রফেশনাল টেকনিক্যাল অ্যানালাইসিস ড্রয়িং টুলস ব্যবহার করা যায়। এই টুলসগুলোর মাধ্যমে আপনি সহজেই ট্রেন্ড এবং সাপোর্ট-রেজিস্ট্যান্স জোন্স চিহ্নিত করতে পারবেন:</p>
      <ul>
        <li><strong>Trend Line (ট্রেন্ড লাইন):</strong> হাইয়ার হাই (Higher Highs) এবং লোয়ার লো (Lower Lows) যুক্ত করে মার্কেটের আপট্রেন্ড বা ডাউনট্রেন্ড নিশ্চিত করুন।</li>
        <li><strong>Parallel Channel (প্যারালাল চ্যানেল):</strong> দুটি সমান্তরাল লাইনের মাধ্যমে প্রাইসের চ্যানেল ব্র্যাকআউট বা বাউন্স পয়েন্ট ট্র্যাক করুন।</li>
        <li><strong>Fibonacci Retracement (ফিবোনাচ্চি রিট্রেসমেন্ট):</strong> ২৩.৬%, ৩৮.২%, ৫০% এবং ৬১.৮% গোল্ডেন রেশিও লেভেলে শক্তিশালী পুলব্যাক রিভার্সাল ক্যাচ করুন।</li>
        <li><strong>Support & Resistance Horizontal Ray:</strong> শক্তিশালী হরিজন্টাল কি-লেভেল যেখানে মার্কেট বারবার বাধা পায় বা সাপোর্ট নেয়।</li>
        <li><strong>Rectangle Box & Shading:</strong> কনসলিডেশন এবং অর্ডার ব্লক জোন্স হাইলাইট করে ফলস ব্রেকআউট ফিল্টার করুন।</li>
      </ul>

      <h4>🏆 খ) এলিট প্রেস্ট্রিজ কাপ (PRESTIGE CUP — $25,000.00 Prize Fund)</h4>
      <p>বিভাক্স ট্রেডের সবচেয়ে বড় এবং সবচেয়ে সম্মানজনক ফ্ল্যাগশিপ ট্রেডিং টুর্নামেন্ট হলো <strong>Elite Prestige Cup</strong>।</p>
      <ul>
        <li><strong>মোট প্রাইজ ফান্ড:</strong> <strong>$25,000.00 USD</strong> ক্যাশ প্রাইজ।</li>
        <li><strong>রোলওভার সাইকেল:</strong> প্রতি ১৪ দিন পর পর নতুন সিজন শুরু হয় এবং লিডারবোর্ডের শীর্ষ ট্রেডারদের মধ্যে রিয়েল ক্যাশ রিওয়ার্ড বিতরণ করা হয়।</li>
        <li><strong>অংশগ্রহণের নিয়ম:</strong> টুর্নামেন্টে প্রবেশ করে আপনার সর্বোচ্চ নেট প্রফিট ভলিউম অর্জন করুন। রিয়েল বা টুর্নামেন্ট স্পেশাল ব্যালেন্সে ট্রেড করে পয়েন্ট বৃদ্ধি পায়।</li>
        <li><strong>উইথড্রয়াল:</strong> টুর্নামেন্টের প্রাইজ সরাসরি আপনার রিয়েল ওয়ালেটে যুক্ত হয় এবং কোনো লুকানো টার্নওভার শর্ত ছাড়াই তাত্ক্ষণিক উইথড্র করা যায়।</li>
      </ul>

      <h4>🎁 গ) ১০০% ডিপোজিট বোনাস (100% BONUS ON EVERY DEPOSIT)</h4>
      <p>আপনার ট্রেডিং ব্যালেন্স দ্বিগুণ করতে ব্যবহার করুন এক্সক্লুসিভ প্রমো কোড <strong>BIVAAX100</strong>।</p>
      <ul>
        <li><strong>ডাবল ক্যাপিটাল:</strong> আপনি যদি $100 ডিপোজিট করেন, আপনার অ্যাকাউন্টে $200 ট্রেডিং ব্যালেন্স যুক্ত হবে।</li>
        <li><strong>লোকাল পেমেন্ট সাপোর্ট:</strong> bKash, Nagad, Rocket, UPI, BinancePay এবং ক্রিপ্টোকারেন্সি (USDT TRC20/BEP20, BTC, ETH)-এর মাধ্যমে তাৎক্ষণিক ডিপোজিট।</li>
        <li><strong>জিরো রিস্ক ব্যালেন্স:</strong> বোনাস ব্যালেন্স আপনার ট্রেডিং ড্র-ডাউন কুশন হিসেবে কাজ করে এবং বড় লটে ট্রেড নেওয়ার সুযোগ তৈরি করে।</li>
      </ul>

      <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;" />

      <h3>২. মূল অ্যাক্টিভিটিজ মডিউলসমূহ (Core Interactive Features)</h3>

      <h4>🏆 ১. টুর্নামেন্ট (Tournaments — বড় কার্ড)</h4>
      <p>অ্যাক্টিভিটিজের সবচেয়ে বড় এবং আকর্ষণীয় কার্ডটি হলো <strong>টুর্নামেন্ট (Tournaments)</strong>। এখানে ক্লিক করলে প্ল্যাটফর্মের সব লাইভ, আপকামিং এবং সমাপ্ত হওয়া টুর্নামেন্ট লিস্ট চলে আসে। ডেমো ও রিয়েল ব্যালেন্সের মাধ্যমে প্রতিদিনের ফ্রি চ্যালেঞ্জ থেকে শুরু করে সাপ্তাহিক মেগা কাপে অংশ নিয়ে আপনার ট্রেডিং স্কিল প্রমাণ করুন।</p>

      <h4>🎁 ২. বোনাস (Bonuses — উপহার আইকন)</h4>
      <p>বোনাস কার্ডে ক্লিক করে আপনি দেখতে পাবেন আপনার জন্য বরাদ্দকৃত সমস্ত প্রোমোশন, কুপন কোড, ক্যাশব্যাক অফার এবং রিস্ক-ফ্রি ট্রেড টোকেন। নতুন ইউজারদের জন্য ওয়েলকাম অফার এবং ভিআইপি ট্রেডারদের জন্য সাপ্তাহিক ১০% ক্যাশব্যাক গ্যারান্টি এখানে সংরক্ষিত থাকে।</p>

      <h4>📅 ৩. অর্থনৈতিক ক্যালেন্ডার (Economic Calendar — ক্যালেন্ডার আইকন)</h4>
      <p>সফল ট্রেডারদের অন্যতম প্রধান অস্ত্র হলো ফান্ডামেন্টাল নিউজ ক্যালেন্ডার। এখানে ইউএস নন-ফার্ম পে-রোল (NFP), সিপিআই ইনফ্লেশন রেট, ফেডারেল রিজার্ভ FOMC সুদের হার ঘোষণা এবং জিডিপি গ্রোথ ডেটা লাইভ রিয়েল-টাইমে আপডেট হয়। ৩-স্টার বা হাই-ইমপ্যাক্ট সংবাদের সময় অপ্রত্যাশিত মার্কেট স্পাইক থেকে বাঁচতে বা নিউজ ট্রেডিং স্ট্র্যাটেজি প্রয়োগ করতে এই ক্যালেন্ডার অত্যন্ত কার্যকর।</p>

      <h4>🏅 ৪. টপ-২০ লিডারবোর্ড (Top-20 Leaderboard — লাল নোটিফিকেশন ব্যাজযুক্ত মেডেল আইকন)</h4>
      <p>কার্ডের উপর একটি জ্বলজ্বলে লাল ডট আপনাকে মনে করিয়ে দেয় লাইভ লিডারবোর্ড আপডেটের কথা। এখানে বর্তমান সপ্তাহের শীর্ষ ২০ জন সফল ট্রেডারের লাইভ র‌্যাঙ্ক, মোট লাভ (Net Profit), উইন রেট এবং দেশের ফ্ল্যাগ প্রদর্শিত হয়। এখান থেকে মার্কেট ট্রপ লিডারদের ট্র্যাক করা এবং কপি ট্রেডিংয়ের সিদ্ধান্ত নেওয়া সহজ হয়।</p>

      <h4>📢 ৫. নতুন কি? (What\'s New? / News & Updates — মেগাফোন আইকন)</h4>
      <p>প্ল্যাটফর্মের নিয়মিত আপগ্রেড, নতুন কারেন্সি পেয়ারের তালিকা, ওটিসি মার্কেট সংযোজন, নতুন ড্রয়িং ফিচার বা ডিপোজিট গেটওয়ে সম্পর্কিত সমস্ত অফিশিয়াল অ্যাডমিন রিলিজ নোট এবং চেঞ্জলগ দেখতে এখানে ক্লিক করুন।</p>

      <h4>🤝 ৬. আমন্ত্রণ জানান (Invite / Referral & Affiliate Program)</h4>
      <p>আপনার ফ্রেন্ডস বা কমিউনিটিকে বিভাক্স ট্রেডে ইনভাইট করে প্রতি রেফারেল বাবদ $10-$20 অথবা তাদের ট্রেডিং ভলিউমের ওপর সর্বোচ্চ ৮০% পর্যন্ত লাইফটাইম রেভিনিউ শেয়ার কমিশন উপার্জন করুন। আপনার পার্সোনাল রেফারেল লিংক কপি করে সোশ্যাল মিডিয়ায় শেয়ার করুন।</p>

      <h4>🎓 ৭. শিক্ষা (Education & Academy)</h4>
      <p>বিগিনার থেকে প্রফেশনাল লেভেল পর্যন্ত ক্যান্ডেলস্টিক প্যাটার্ন (হ্যামার, এঙ্গালফিং, পিনবার), সাপোর্ট-রেজিস্ট্যান্স স্ট্র্যাটেজি, মানি ম্যানেজমেন্ট রুলস এবং ইমোশন কন্ট্রোল শেখার জন্য সম্পূর্ণ ফ্রি অ্যাকাডেমি রিসোর্স।</p>

      <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;" />

      <h3>SEO & Search Optimization Summary</h3>
      <ul>
        <li><strong>Keywords:</strong> Bivaax Activities Hub, Bivaax Tournament, $25000 Prestige Cup, 100% deposit bonus bivaax, economic calendar binary options, top 20 traders leaderboard, chart drawing tools, bivaax bd, bivaax login, bivaax registration.</li>
        <li><strong>Schema.org Integration:</strong> Indexed under NewsArticle, HowTo, and FAQPage with full author validation.</li>
        <li><strong>Fast Navigation:</strong> Direct deep-links to /tournaments, /promotions, /calendar, /leaderboard, and /copytrading.</li>
      </ul>
    `
  },
  'deposit-bonus': {
    id: 'deposit-bonus',
    title: '100% Bonus On Every Deposit',
    subtitle: 'Double your trading balance with our limited-time 100% deposit bonus. More Deposit, More Rewards!',
    date: 'September 11, 2026',
    category: 'Promotions',
    imageUrl: 'https://i.postimg.cc/6Q3tZRfz/file-000000005f788206913b751eaa5b3905.png',
    content: `
      <h2>100% Bonus On Every Deposit</h2>
      <p>Maximize your trading potential with our premium 100% Deposit Bonus promotion! For a limited time, get double your capital on every qualifying deposit to give yourself the ultimate edge in the markets.</p>
      
      <h3>How it Works</h3>
      <p>It's simple: for every dollar you deposit, we give you another dollar in trading bonus. Deposit $100, trade with $200. This allow you to take larger positions, manage risk better, and scale your profits faster.</p>

      <h3>Promotion Highlights</h3>
      <ul>
        <li><strong>100% Bonus:</strong> Double your trading balance automatically upon funding your account.</li>
        <li><strong>Instant Deposit:</strong> Immediate credit to your trading balance via local bank transfers, UPI, crypto (USDT, BTC, ETH), or BinancePay.</li>
        <li><strong>Secure & Safe:</strong> Enterprise-grade encrypted payment gateways ensuring 100% security for all transactions.</li>
        <li><strong>Fast Withdrawal:</strong> High-priority withdrawal processing for your profit payouts with zero hidden fees.</li>
        <li><strong>Exclusive Rewards:</strong> Unlock additional VIP trading perks, risk-free trades, and cashback rewards as you grow your account.</li>
      </ul>

      <h3>Use Promo Code: BIVAAX100</h3>
      <p>To claim your 100% bonus, simply enter the promo code <strong>BIVAAX100</strong> during the deposit process. The bonus funds will be credited to your balance instantly upon successful confirmation of your deposit.</p>

      <p>Head over to the Cashier or Deposit page now to claim your 100% deposit bonus and experience the power of the Bivaax Trade engine!</p>
    `
  },
  'pending-trades-guide': {
    id: 'pending-trades-guide',
    title: 'How Do Pending Trades Work?',
    subtitle: 'Automate your market entries with precision! Master Pending Orders by Price & Time on Bivaax.',
    date: 'September 19, 2026',
    category: 'Education & Feature',
    imageUrl: 'https://i.postimg.cc/59L6hpcS/IMG-20260918-212557-776.jpg',
    content: `
      <h2>Mastering Pending Trades on Bivaax</h2>
      <p>Never miss a golden trading opportunity again! With <strong>Bivaax Pending Trades</strong>, you can pre-schedule your trades to trigger automatically at the exact price or time you specify, even when you are away from the screen.</p>

      <h3>The 3 Phases of a Pending Trade</h3>
      <ol>
        <li><strong>⏳ PENDING (হলুদ ব্যাজ):</strong> আপনার অর্ডারটি সফলভাবে শিডিউল করা হয়েছে এবং নির্দিষ্ট টার্গেট প্রাইস বা নির্দিষ্ট সময়ের জন্য অপেক্ষা করছে। এই অবস্থায় অর্ডারটি যেকোনো সময় ফ্রিতে ক্যানসেল করা যায়।</li>
        <li><strong>🟢 OPEN (সবুজ ব্যাজ):</strong> মার্কেট যখনই আপনার কাঙ্ক্ষিত প্রাইস লেভেল স্পর্শ করে অথবা শিডিউল করা সময়ে পৌঁছায়, সাথে সাথে অর্ডারটি শূন্য লেটেন্সিতে (0ms) লাইভ ট্রেডে পরিণত হয়।</li>
        <li><strong>🏁 CLOSED (ধূসর ব্যাজ):</strong> ট্রেডের এক্সপিরেশন টাইম শেষ হলে রেজাল্ট ক্যালকুলেট হয় এবং প্রফিট সরাসরি আপনার অ্যাকাউন্টে যুক্ত হয়ে ট্রেড হিস্ট্রিতে রেকর্ড হয়।</li>
      </ol>

      <h3>দুটি সুবিধাজনক এক্সিকিউশন মোড (Two Execution Modes)</h3>
      <ul>
        <li><strong>১. By Asset Price (টার্গেট প্রাইস অনুযায়ী):</strong> আপনার পছন্দের সাপোর্ট, রেজিস্ট্যান্স বা ব্রেকআউট প্রাইস সেট করুন। মার্কেট সেই মূল্যে পৌঁছালেই অটোমেটিক কল (UP) বা পুট (DOWN) ট্রেড ওপেন হয়ে যাবে।</li>
        <li><strong>২. By Time (নির্দিষ্ট সময় অনুযায়ী):</strong> নিউজ ইভেন্ট বা স্ট্র্যাটেজিক ক্যান্ডেল ওপেনিংয়ের জন্য ভবিষ্যৎ ঘড়ির নির্দিষ্ট সময় নির্বাচন করুন। সেই সময়ে স্বয়ংক্রিয়ভাবে ট্রেড এক্সিকিউট হবে।</li>
      </ul>

      <h3>Pending Trades ব্যবহারের প্রধান সুবিধাসমূহ</h3>
      <ul>
        <li><strong>স্মার্ট অটোমেশন:</strong> সারাদিন চার্টের দিকে তাকিয়ে থাকার প্রয়োজন নেই।</li>
        <li><strong>ইমোশন-ফ্রি ট্রেডিং:</strong> FOMO বা তাড়াহুড়ো করে ভুল এন্ট্রি নেওয়ার সম্ভাবনা দূর হয়।</li>
        <li><strong>সঠিক এন্ট্রি পয়েন্ট:</strong> নিখুঁত সাপোর্ট/রেজিস্ট্যান্স রিটেস্টে এন্ট্রি নিশ্চিত করে।</li>
        <li><strong>১০০% নিরাপদ ও ফ্লেক্সিবল:</strong> ওপেন হওয়ার আগ পর্যন্ত যেকোনো সময় কোনো চার্জ ছাড়াই পেন্ডিং ট্রেড বাতিল করতে পারেন।</li>
      </ul>

      <h3>কীভাবে পেন্ডিং ট্রেড করবেন?</h3>
      <p>১. ট্রেড টার্মিনালে যান এবং আপনার পছন্দের অ্যাসেট সিলেক্ট করুন।<br/>
      ২. "Pending Order" বাটনে ক্লিক করুন।<br/>
      ৩. 'By Price' অথবা 'By Time' সিলেক্ট করে আপনার টার্গেট ভ্যালু দিন।<br/>
      ৪. ইনভেস্টমেন্ট অ্যামাউন্ট ও টাইমফ্রেম দিয়ে <strong>UP / BUY</strong> অথবা <strong>DOWN / SELL</strong> এ ক্লিক করে অর্ডার শিডিউল করুন!</p>
    `
  },
  'elite-prestige-cup': {
    id: 'elite-prestige-cup',
    title: 'Elite Prestige Cup — $25,000 Prize Fund',
    subtitle: 'The Ultimate Glory Awaits. Compete with global traders and prove your skills!',
    date: 'September 3, 2026',
    category: 'Tournaments',
    imageUrl: 'https://i.postimg.cc/D05rpdFm/file-000000003e5c8211913981fa452be0ca.png',
    content: `
      <h2>Elite Prestige Cup — Champions Are Made Here</h2>
      <p>Only the best will reign! Welcome to the <strong>Elite Prestige Cup</strong>, Bivaax Trade's flagship trading tournament with a massive <strong>$25,000.00 Prize Fund</strong>.</p>
      
      <h3>Tournament Highlights</h3>
      <ul>
        <li><strong>$25,000 Big Prize Pool:</strong> Compete for high-value cash prizes distributed directly to top leaderboard winners.</li>
        <li><strong>Prove Your Skills:</strong> Showcase your technical trading strategies, market timing, and risk management.</li>
        <li><strong>Compete With The Best:</strong> Battle head-to-head with top international traders in real-time.</li>
        <li><strong>Earn Your Prestige:</strong> Unlock exclusive champion badges, VIP status upgrades, and global recognition.</li>
      </ul>

      <h3>How to Enter</h3>
      <p>Click <strong>"Join Now"</strong> on the Tournaments page or navigate to the Tournament section in your Bivaax Trade terminal to enroll today and claim your glory!</p>
    `
  }
};
