import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Server process starting...');
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';

// Prevent process crashes on external hosts from unhandled background library promises
process.on('unhandledRejection', (reason: any) => {
  console.warn('⚠️ Handled unhandledRejection:', reason?.message || reason);
});

process.on('uncaughtException', (err: any) => {
  console.warn('⚠️ Handled uncaughtException:', err?.message || err);
});

// Graceful termination handler for Cloud Run / container orchestration
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Performing graceful shutdown...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT. Exiting...');
  process.exit(0);
});

import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { initSocket } from './src/services/socketService';
import { startMarketEngine } from './src/services/marketEngine';
import { loadMarketSettings } from './src/services/marketService';
import { startMasterSimulation, seedMasterTraders } from './src/services/copyTradingService';
import { backupDatabase } from './src/db/snapshot';
import authRouter from './src/api/auth';
import apiRouter, { syncDatabaseFromFirestore, seedDefaultPages } from './src/api/routes';
import tournamentRouter, { seedTournaments } from './src/api/tournament';
import { startTournamentEngine } from './src/services/tournamentService';
import logger from './src/lib/logger';

import { isUsingPostgres } from './src/db/mysql-db';

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const PORT = isNaN(envPort) || envPort === 0 ? 3000 : envPort;
  const httpServer = createServer(app);

  // Bot & Exploit Blocker Middleware - RUN FIRST to protect resources
  const forbiddenPatterns = [
    /\.php$/i,
    /\.env/i,
    /\.git/i,
    /wp-(admin|login|content|includes)/i,
    /xmlrpc\.php/i,
    /vapi/i,
    /cgi-bin/i,
    /\.jsp$/i,
    /\.asp$/i,
    /\.aspx$/i,
    /admin\/(login|setup|config)/i,
    /\bconfig\/(?:db|settings)(?!\/)/i,
    /shell/i,
    /backup/i,
    /dump/i,
    /myadmin/i,
    /phpmyadmin/i
  ];

  app.use((req: Request, res: Response, next: NextFunction) => {
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    if (userAgent.includes('googlebot') || userAgent.includes('bingbot') || userAgent.includes('yandex') || userAgent.includes('baidu') || userAgent.includes('duckduckbot') || userAgent.includes('applebot') || userAgent.includes('slurp')) {
      return next();
    }
    const isBotScan = forbiddenPatterns.some(pattern => pattern.test(req.path));
    if (isBotScan) {
      // Quietly block and avoid expensive logging/processing
      return res.status(403).send('Forbidden');
    }
    next();
  });

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  // Health check endpoints
  app.get('/health', (req, res) => { res.status(200).send('OK'); });
  app.get('/api/health', (req, res) => { 
    res.status(200).json({ 
      status: 'ok', 
      database: isUsingPostgres() ? "PostgreSQL (Permanent)" : "SQLite (Temporary - DATA WILL BE LOST ON RESTART)",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    }); 
  });
  
  // Logging
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000, // Increased for dev/heavy use
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Increased for dev
    message: { error: 'Too many login/register attempts. Please try again after 15 minutes.' }
  });
  app.use('/api/auth/', authLimiter);

  // Initialize Socket.IO
  initSocket(httpServer);

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api', tournamentRouter);
  app.use('/api', apiRouter);

  // Catch-all for missing API endpoints to prevent returning HTML for API calls
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found', path: req.path });
  });

  // Helper for SSR SEO Meta Tag Injection
  const injectSEOMetadata = (html: string, reqPath: string, host: string, protocol: string): string => {
    const baseUrl = `${protocol}://${host}`;
    let title = "Bivaax Trade - Official Website";
    let description = "Create a free Bivaax Trade account and start trading forex, crypto, stocks, and commodities with real-time charts and fast execution.";
    const canonical = `${baseUrl}${reqPath}`;

    if (reqPath === '/register' || reqPath === '/signup') {
      title = "Create Account | Bivaax Trade";
      description = "Create a free Bivaax Trade account and start trading forex, crypto, stocks, and commodities. Get a $10,000 demo balance to practice risk-free.";
    } else if (reqPath === '/login') {
      title = "Sign In | Bivaax Trade";
      description = "Sign in to your Bivaax Trade account to trade forex, crypto, stocks, and commodities with real-time charts.";
    } else if (reqPath === '/forgot-password' || reqPath === '/reset-password') {
      title = "Forgot Password | Bivaax Trade";
      description = "Reset your Bivaax Trade account password securely using email verification.";
    } else if (reqPath === '/affiliate' || reqPath === '/partner') {
      title = "Partner Login - Bivaax Trade";
      description = "Sign in to your Bivaax Trade partner account. Track your referrals, view commission earnings, and manage your affiliate links.";
    } else if (reqPath.startsWith('/tournaments')) {
      title = "Trading Tournaments | Bivaax Trade";
      description = "Join live binary options trading tournaments on Bivaax Trade and compete for real cash prize pools.";
    } else if (reqPath === '/leaderboard') {
      title = "Leaderboard & Top Traders | Bivaax Trade";
      description = "View top performing traders, rankings, and daily profits on Bivaax Trade.";
    } else if (reqPath === '/trade') {
      title = "Live Trading Terminal | Bivaax Trade";
      description = "Trade global markets on Bivaax Trade with real-time charts, technical indicators, and instant order execution.";
    } else if (reqPath === '/help-center' || reqPath === '/support') {
      title = "Help Center & FAQ | Bivaax Trade";
      description = "Get 24/7 customer support, FAQs, and guides for deposits, withdrawals, and account verification on Bivaax Trade.";
    } else if (reqPath === '/about-us') {
      title = "About Us | Bivaax Trade";
      description = "Learn more about Bivaax Trade, our vision, trading technology, and global financial market solutions.";
    } else if (reqPath === '/docs') {
      title = "Documentation & API | Bivaax Trade";
      description = "Explore platform documentation, trading guides, and tools on Bivaax Trade.";
    }

    let updated = html.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
    updated = updated.replace(/<meta name="description" content=".*?" \/>/gi, `<meta name="description" content="${description}" />`);
    updated = updated.replace(/<meta property="og:title" content=".*?" \/>/gi, `<meta property="og:title" content="${title}" />`);
    updated = updated.replace(/<meta property="og:description" content=".*?" \/>/gi, `<meta property="og:description" content="${description}" />`);
    
    if (updated.includes('<link rel="canonical"')) {
      updated = updated.replace(/<link rel="canonical" href=".*?" \/>/gi, `<link rel="canonical" href="${canonical}" />`);
    } else {
      updated = updated.replace('</head>', `<link rel="canonical" href="${canonical}" />\n  </head>`);
    }

    return updated;
  };

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    const host = req.get('host') || 'bivaax.com';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Allow: /register
Allow: /login
Allow: /signup
Allow: /forgot-password
Allow: /affiliate
Allow: /partner
Allow: /trade
Allow: /tournaments
Allow: /leaderboard
Allow: /signals
Allow: /copytrading
Allow: /help-center
Allow: /support
Allow: /about-us
Allow: /docs
Allow: /blog
Allow: /news/
Allow: /page/
Allow: /assets/
Allow: /public/
Allow: /images/

Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`);
  });

  // SEO: sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const host = req.get('host') || 'bivaax.com';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];
    res.type('application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/forgot-password</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/affiliate</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/trade</loc>
    <lastmod>${today}</lastmod>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tournaments</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/leaderboard</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/signals</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/copytrading</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/help-center</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about-us</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/docs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/news/chart-basics</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/news/chart-scale</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/news/market-overview</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/page/terms-of-service</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/page/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`);
  });

  // Vite middleware
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltFrontend = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === "production" || hasBuiltFrontend) {
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const host = req.get('host') || 'bivaax.com';
      const protocol = req.protocol || 'https';
      try {
        const rawHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        const seoHtml = injectSEOMetadata(rawHtml, req.path, host, protocol);
        res.type('html').send(seoHtml);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  } else {
    console.log('📦 Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true 
      },
      appType: "spa",
    });
    
    // HTML SEO Interceptor for Vite dev server
    app.use(async (req, res, next) => {
      if (req.method === 'GET' && req.headers.accept?.includes('text/html') && !req.path.startsWith('/api') && !req.path.includes('.')) {
        const host = req.get('host') || 'bivaax.com';
        const protocol = req.protocol || 'https';
        try {
          const rawHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
          const transformedHtml = await vite.transformIndexHtml(req.url, rawHtml);
          const seoHtml = injectSEOMetadata(transformedHtml, req.path, host, protocol);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(seoHtml);
        } catch (err) {
          next(err);
        }
      } else {
        next();
      }
    });

    app.use(vite.middlewares);
    console.log('✅ Vite middleware ready');
  }

  // Centralized Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    const status = err.status || 500;
    res.status(status).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
  });

  // Schedule Daily Backup (Every 24 hours)
  setInterval(backupDatabase, 24 * 60 * 60 * 1000);
  // backupDatabase(); // Disabled for faster startup

  // Set server timeout to 30 seconds to prevent hanging connections from exhausting resources
  httpServer.timeout = 30000;
  httpServer.keepAliveTimeout = 65000;
  httpServer.headersTimeout = 66000;
  
  // Monitor event loop lag to diagnose performance issues
  setInterval(() => {
    const start = Date.now();
    setImmediate(() => {
      const lag = Date.now() - start;
      if (lag > 200) {
        console.warn(`[PERF] Event loop lag detected: ${lag}ms`);
      }
    });
  }, 5000);

  // Bind early to ensure health checks pass in Docker/Dokploy environments
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    
    // Defer heavy background tasks so the server responds immediately
    setTimeout(async () => {
      // PRE-BOOT SAFETY: Create a backup before any synchronization or market engine starts
      try {
        const { DbSnapshotService } = await import('./src/services/dbSnapshotService.ts');
        console.log('🛡️ [SAFE-DEPLOYMENT] Creating pre-boot recovery point...');
        await DbSnapshotService.createFullBackup('system_pre_boot');
        console.log('✅ [SAFE-DEPLOYMENT] Pre-boot backup secured.');
      } catch (err: any) {
        console.warn('⚠️ [SAFE-DEPLOYMENT] Pre-boot backup skipped/failed:', err.message);
      }

      console.log('🔄 Starting background synchronization and seeding...');
      
      // 1. Sync local database from Firestore (restores Users, Trades, etc.)
      try {
        await syncDatabaseFromFirestore();
      } catch (syncErr: any) {
        console.error('Failed to sync database from Firestore on boot:', syncErr.message);
      }

      // 2. Seed static data
      try {
        await seedMasterTraders();
        await seedTournaments();
        await seedDefaultPages();
        startTournamentEngine();
      } catch (err) {}

      // 3. Start Market Engine (starts price generation ticker)
      setTimeout(async () => {
        console.log('📈 Starting Market Engine...');
        loadMarketSettings().catch(() => {}); // Non-blocking
        startMarketEngine();
        
        // 4. Start Copy Trading Simulation
        setTimeout(() => {
          console.log('👥 Starting Copy Trading Simulation...');
          startMasterSimulation();
        }, 10000);

        // 5. Schedule Daily Database Backup (3 AM)
        setInterval(async () => {
          const now = new Date();
          if (now.getHours() === 3 && now.getMinutes() === 0) {
            try {
              const { DbSnapshotService } = await import('./src/services/dbSnapshotService.ts');
              console.log('[SCHEDULE] Running daily automated backup...');
              await DbSnapshotService.createFullBackup('system_automated');
            } catch (err) {
              console.error('Automated backup failed:', err);
            }
          }
        }, 60000);
      }, 5000);
      
    }, 2000);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
