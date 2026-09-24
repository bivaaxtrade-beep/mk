import React from 'react';
import { Helmet } from 'react-helmet-async';

  interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  robots?: string;
  isAffiliate?: boolean;
  faqData?: Array<{ question: string, answer: string }>;
  articleData?: {
    headline: string;
    author: string;
    datePublished: string;
    image?: string;
  };
  siteNavigationData?: Array<{
    name: string;
    description: string;
    url: string;
  }>;
  softwareData?: {
    name?: string;
    operatingSystem?: string;
    applicationCategory?: string;
    ratingValue?: string;
    reviewCount?: string;
    downloadUrl?: string;
  };
}

const DEFAULT_KEYWORDS = [
  // Brand & Platform Keywords
  'Bivaax', 'BIVAAX', 'bivaax', 'Bivaax Trade', 'Bivaax App', 'bivaax.com', 'bivaax.trade', 'partner.bivaax.com', 'affiliate.bivaax.com',
  'Bivaax login', 'Bivaax APK', 'Bivaax download', 'Bivaax trading app', 'Bivaax registration', 'Bivaax broker', 'Bivaax promo code',
  // Core Industry Keywords
  'binary options broker', 'online trading platform', 'forex trading platform', 'crypto trading', 'high yield digital options',
  'best binary options', 'professional trading terminal', 'copy trading platform', 'trading signals telegram',
  // Asia Region Specific Long-Tail Keywords (Binary Options & Forex)
  'best binary options broker Bangladesh', 'trusted binary options platform Bangladesh', 'bivaax login BD', 'bKash binary options deposit', 'Nagad forex trading Bangladesh', 'Rocket deposit binary options',
  'best binary options broker India', 'trusted binary options India UPI', 'low deposit forex broker India', 'top binary options broker India 2026', 'forex trading platform India Paytm UPI',
  'binary options trading Pakistan', 'forex broker Pakistan JazzCash Easypaisa', 'online trading Pakistan low deposit',
  'broker binary option Indonesia terpercaya', 'trading forex Indonesia deposit murah', 'aplikasi trading binary options Indonesia', 'broker forex Indonesia resmi',
  'san giao dich quyen chon nhi phan Viet Nam uy tin', 'forex trading Vietnam low deposit', 'top binary options broker Vietnam',
  'binary options Philippines GCash', 'forex broker Philippines low minimum deposit',
  'copy trading signals Asia', 'best forex signals telegram Asia',
  // Latin America (LATAM) Specific Long-Tail Keywords (Binary Options & Forex)
  'melhor corretora de opções binárias Brasil Pix', 'opções binárias confiaveis Brasil 2026', 'broker forex Brasil deposito minimo baixo Pix', 'corretora forex Brasil confiavel',
  'broker de opciones binarias Mexico confiable', 'plataforma opciones binarias Mexico SPEI', 'mejor broker de forex Mexico 2026', 'opciones binarias reguladas Mexico',
  'broker opciones binarias Colombia', 'plataforma forex Colombia PSE Nequi Daviplata', 'opciones binarias retiro rapido Colombia',
  'opciones binarias Argentina pesos', 'broker forex Argentina confiable', 'broker opciones binarias Chile Webpay', 'broker forex Peru BCP Yape',
  'copy trading LATAM', 'señales de opciones binarias Telegram LATAM', 'mejor plataforma de trading America Latina',
  // Affiliate & Partner Program Keywords
  'Bivaax Affiliate Program', 'Bivaax Affiliated Program', 'bivaax affiliated pogram', 'bivaax affiliate program', 'bivaax affiliated program', 'bivaax partner program', 'Bivaax Partners', 'partner.bivaax.com', 'affiliate.bivaax.com', 'bivaax affiliate sign in', 'bivaax partner login', 'bivaax referral code', 'best trading affiliate program', 'high paying forex affiliate Asia', 'binary options affiliate Latin America',
  '80% revenue share broker affiliate', 'CPA trading affiliate network', 'instant USDT affiliate payouts', 'earn money online trading affiliate', 'introducing broker program', 'bivaax IB program', 'bivaax sub-affiliate network'
].join(', ');

const SEO: React.FC<SEOProps> = ({
  title = 'Bivaax Trade | Professional Trading Platform',
  description = 'Official Bivaax Trade platform and app (bivaax.com). Trade Forex, Binary Options, Crypto, and Stocks with up to 95% payouts, $10,000 free demo balance, instant local deposits, and 24/7 expert support across Asia and Latin America.',
  keywords,
  image = 'https://i.postimg.cc/6p1dmLjB/IMG-20260822-005000-661.jpg',
  url,
  type = 'website',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  isAffiliate = false,
  faqData,
  articleData,
  siteNavigationData,
  softwareData,
}) => {
  // Dynamically resolve domain (bivaax.com, subdomains, etc.)
  const currentHost = typeof window !== 'undefined' ? window.location.host : 'bivaax.com';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://bivaax.com';
  const effectiveUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://bivaax.com/');
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const finalKeywords = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;

  // Detect whether this is an affiliate/partner page or subdomain
  const isAffiliateContext = isAffiliate || 
    currentPath.startsWith('/affiliate') || 
    currentPath.startsWith('/partner') || 
    currentHost.includes('affiliate') || 
    currentHost.includes('partner');

  // Centrally detect strictly private administrative/payment paths to enforce noindex
  const isPrivatePath = 
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/profile/info') ||
    currentPath.startsWith('/profile/security') ||
    currentPath.startsWith('/profile/transactions') ||
    currentPath.startsWith('/deposit') ||
    currentPath.startsWith('/withdraw') ||
    currentPath.startsWith('/cashier') ||
    currentPath.startsWith('/crypto-deposit') ||
    currentPath.startsWith('/mfs-deposit') ||
    currentPath.startsWith('/Bivaaxpay');

  const effectiveRobots = isPrivatePath ? 'noindex, nofollow' : robots;
  const siteTitle = (title === 'Bivaax Trade' || title.includes('Bivaax') || title.includes('BIVAAX')) ? title : `${title} | Bivaax Trade`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="description" content={description} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="Bivaax Trade" />
      <meta name="robots" content={effectiveRobots} />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={effectiveUrl} />

      {/* Icons & Logo */}
      <link rel="icon" type="image/jpeg" href={image} />
      <link rel="shortcut icon" type="image/jpeg" href={image} />
      <link rel="apple-touch-icon" href={image} />

      {/* Regional & Multilingual Alternates for Asia & Latin America */}
      <link rel="alternate" hrefLang="en" href="https://bivaax.com/" />
      <link rel="alternate" hrefLang="bn" href="https://bivaax.com/?lang=bn" />
      <link rel="alternate" hrefLang="hi" href="https://bivaax.com/?lang=hi" />
      <link rel="alternate" hrefLang="id" href="https://bivaax.com/?lang=id" />
      <link rel="alternate" hrefLang="vi" href="https://bivaax.com/?lang=vi" />
      <link rel="alternate" hrefLang="pt-BR" href="https://bivaax.com/?lang=pt" />
      <link rel="alternate" hrefLang="es-419" href="https://bivaax.com/?lang=es" />
      <link rel="alternate" hrefLang="x-default" href="https://bivaax.com/" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={effectiveUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="Bivaax Trade" />

      {/* Twitter / X */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={effectiveUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Mobile Apps & Theme */}
      <meta name="apple-mobile-web-app-title" content="Bivaax Trade" />
      <meta name="application-name" content="Bivaax Trade" />
      <meta name="theme-color" content="#121316" />

      {/* Dynamic JSON-LD for Google AI Search Results, Knowledge Graph & Sitelinks */}
      <script type="application/ld+json">
        {JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Bivaax Trade",
            "alternateName": [
              "Bivaax", "বিভাগ", "বিভাগ ট্রেড", "বিভাগ ট্রেডিং", "Bivaax.com", "bivaax.trade", "Bivaax Trading Platform",
              "Bivaax Partners", "Bivaax App", currentHost
            ],
            "url": currentOrigin,
            "sameAs": [
              "https://bivaax.com/",
              "https://bivaax.trade/",
              "https://partner.bivaax.com/",
              "https://app.bivaax.com/",
              "https://www.facebook.com/Bivaaxtrade",
              "https://www.instagram.com/Bivaaxtrade",
              "https://t.me/Bivaaxtrade",
              "https://youtube.com/@bivaax"
            ],
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${currentOrigin}/docs?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Bivaax Trade",
            "alternateName": ["Bivaax", "Bivaax.com", "Bivaax Partners"],
            "url": "https://bivaax.com/",
            "logo": image,
            "description": "Global online financial broker and digital trading ecosystem providing Forex, Binary Options, Cryptocurrency, and Stocks trading across Asia, Latin America, and worldwide.",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-800-BIVAAX",
              "contactType": "customer service",
              "email": "support@bivaax.com",
              "availableLanguage": [
                "English", "Bengali", "Hindi", "Indonesian", "Vietnamese", "Portuguese", "Spanish", "Arabic", "Russian"
              ]
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "FinancialService",
            "name": "Bivaax Trade Platform",
            "url": currentOrigin,
            "image": image,
            "priceRange": "$$",
            "currenciesAccepted": "USD, EUR, BDT, INR, BRL, MXN, COP, USDT, BTC, ETH",
            "paymentAccepted": "Cryptocurrency, USDT TRC20, Binance Pay, Bkash, Nagad, Rocket, UPI, Pix, SPEI, Bank Transfer",
            "areaServed": [
              { "@type": "Country", "name": "Bangladesh" },
              { "@type": "Country", "name": "India" },
              { "@type": "Country", "name": "Pakistan" },
              { "@type": "Country", "name": "Indonesia" },
              { "@type": "Country", "name": "Vietnam" },
              { "@type": "Country", "name": "Brazil" },
              { "@type": "Country", "name": "Mexico" },
              { "@type": "Country", "name": "Colombia" },
              { "@type": "Country", "name": "Argentina" },
              { "@type": "Country", "name": "Global" }
            ],
            "description": "Professional binary options, forex, and cryptocurrency trading broker with high-yield payouts, $10,000 free demo balance, and instant local withdrawal methods."
          },
          isAffiliateContext && {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Bivaax Partners Affiliate & IB Program",
            "serviceType": "Affiliate & Introducing Broker Program",
            "provider": {
              "@type": "Organization",
              "name": "Bivaax Trade",
              "url": "https://bivaax.com"
            },
            "url": effectiveUrl,
            "description": "The highest-paying financial trading affiliate program offering up to 80% lifetime Revenue Share, custom CPA deals, sub-affiliate commissions, and instant hourly USDT payouts with zero fees.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free registration for affiliates and introducing brokers with access to high-converting marketing materials and 24/7 dedicated affiliate management."
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": siteNavigationData && siteNavigationData.length > 0 ? "Bivaax Platform & Trade Menu Navigation" : "Bivaax Trade Key Sitelinks",
            "itemListElement": (siteNavigationData && siteNavigationData.length > 0 ? siteNavigationData : [
              {
                name: "Bivaax App Download",
                description: "Download the official Bivaax Trading App for Android (APK), iOS, and Web.",
                url: "https://app.bivaax.com/"
              },
              {
                name: "Bivaax Partners & Affiliate",
                description: "Join the Bivaax Partner program and earn up to 80% revenue share with instant payouts.",
                url: "https://partner.bivaax.com/"
              },
              {
                name: "Live Trading Terminal",
                description: "Trade Forex, Binary Options, and Crypto with real-time candlestick charts.",
                url: "https://bivaax.com/trade"
              },
              {
                name: "Create Free Demo Account",
                description: "Register instantly and start trading with a refillable $10,000 demo account.",
                url: "https://bivaax.com/register"
              },
              {
                name: "Sign In to Bivaax",
                description: "Access your trading account, open orders, and monitor profits.",
                url: "https://bivaax.com/login"
              },
              {
                name: "Copy Trading",
                description: "Automatically replicate trades executed by verified master traders.",
                url: "https://bivaax.com/copytrading"
              },
              {
                name: "Market Insights & Signals",
                description: "Real-time trading signals, economic calendar, and technical indicators.",
                url: "https://insights.bivaax.com/"
              },
              {
                name: "Official Blog & Tutorials",
                description: "In-depth trading guides, broker analysis, and platform documentation.",
                url: "https://blog.bivaax.com/"
              },
              {
                name: "24/7 Support & Help Center",
                description: "Get round-the-clock help for deposits, withdrawals, and account verification.",
                url: "https://support.bivaax.com/"
              }
            ]).map((item, index) => ({
              "@type": "SiteNavigationElement",
              "position": index + 1,
              "name": item.name,
              "description": item.description,
              "url": item.url
            }))
          },
          (softwareData || currentPath === '/app' || currentHost.startsWith('app.')) && {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": softwareData?.name || "Bivaax Trade: Online Trading App",
            "alternateName": ["Bivaax App", "Bivaax Trading App", "Bivaax APK", "Bivaax Mobile App"],
            "operatingSystem": softwareData?.operatingSystem || "Android, iOS, Windows, macOS, Web",
            "applicationCategory": softwareData?.applicationCategory || "FinanceApplication",
            "url": "https://app.bivaax.com/",
            "downloadUrl": softwareData?.downloadUrl || "https://app.bivaax.com/",
            "installUrl": "https://app.bivaax.com/",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": softwareData?.ratingValue || "4.9",
              "ratingCount": softwareData?.reviewCount || "28450",
              "bestRating": "5"
            },
            "description": "Official Bivaax Trading App. High-speed execution, advanced technical charts, $10,000 demo practice balance, and instant deposit/withdrawal processing."
          },
          faqData && {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(f => ({
              "@type": "Question",
              "name": f.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
              }
            }))
          },
          articleData && {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": articleData.headline,
            "image": [articleData.image || image],
            "datePublished": articleData.datePublished,
            "author": [{
              "@type": "Person",
              "name": articleData.author,
              "url": "https://bivaax.com/about-us"
            }]
          }
        ].filter(Boolean))}
      </script>
    </Helmet>
  );
};

export default SEO;
