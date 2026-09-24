import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../lib/auth-server.ts';
import { history_real, history_demo, currentCandles_real, currentCandles_demo, markets_real, markets_demo, systemActive } from './marketService.ts';
import { get, run, query } from '../db/mysql-db.ts';
import { mapUserForFrontend } from '../lib/user-utils.ts';
import { generateSingleCandleOHLC, generateHistoricalCandleSeries, PatternType } from './candlestickEngine.ts';

import { markets } from '../markets.ts';

function getTimeSeconds(tf: string): number {
  if (!tf || typeof tf !== 'string') return 5;
  const clean = tf.trim();
  const match = clean.match(/^(\d+)\s*([a-zA-Z]*)$/);
  if (!match) return 5;
  const val = parseInt(match[1]) || 5;
  const unit = match[2]?.toLowerCase() || '';
  if (unit.startsWith("s")) return val;
  if (unit.startsWith("m")) return val * 60;
  if (unit.startsWith("h")) return val * 3600;
  if (unit.startsWith("d")) return val * 86400;
  return val || 5;
}

let io: Server;
let activeConnections = 0;

export function getActiveConnections() {
  return activeConnections;
}

function getDecimalsForAsset(asset: string): number {
  if (asset.includes('SHIB') || asset.includes('PEPE') || asset.includes('BONK') || asset.includes('RSR') || asset.includes('FLOKI')) {
    return 8;
  }
  if (asset.includes('Crypto IDX') || asset.includes('BTC/') || asset.includes('ETH/') || asset.includes('US 30') || asset.includes('JPN 225')) {
    return 2;
  }
  if (asset.includes('/JPY')) {
    return 3;
  }
  if (asset.includes('Gold') || asset.includes('Oil') || asset.includes('Apple') || asset.includes('Tesla')) {
    return 2;
  }
  return 5;
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    activeConnections++;
    console.log('New client connected:', socket.id, 'Total:', activeConnections);

    // Join market specific rooms
    socket.on('subscribe_market', (pair: string, type: string) => {
      socket.join(`market_${pair}_${type}`);
      socket.join(type); // 'real' or 'demo'
    });

    socket.on('unsubscribe_market', (pair: string, type: string) => {
      socket.leave(`market_${pair}_${type}`);
    });

    // User-specific room for private updates (balance, trade results)
    socket.on('authenticate', (token: string) => {
      try {
        if (!token) return;
        const decoded = verifyToken(token) as any;
        if (decoded && decoded.uid) {
          socket.data.userId = decoded.uid;
          socket.join(`user_${decoded.uid}`);
          if (decoded.is_admin || decoded.role === 'admin' || decoded.role === 'support' || decoded.role === 'supervisor') {
            socket.join('agents_room');
          }
          console.log(`User/Agent ${decoded.uid} authenticated on socket ${socket.id}`);
        } else if (typeof token === 'string' && token.length > 5 && !token.includes('.')) {
          // If a direct userId or session token was passed
          socket.data.userId = token;
          socket.join(`user_${token}`);
          console.log(`User room joined directly for ${token} on socket ${socket.id}`);
        }
      } catch (err) {
        console.error('Socket authentication failed:', err);
      }
    });

    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        socket.data.userId = userId;
        socket.join(`user_${userId}`);
        console.log(`Explicit join_user_room: ${userId}`);
      }
    });

    // Support Chat Rooms & Real-time Events
    socket.on('join_ticket', (ticketId: string) => {
      if (ticketId) {
        socket.join(`ticket_${ticketId}`);
      }
    });

    socket.on('leave_ticket', (ticketId: string) => {
      if (ticketId) {
        socket.leave(`ticket_${ticketId}`);
      }
    });

    socket.on('typing', ({ ticketId, senderType, isTyping }) => {
      if (ticketId) {
        socket.to(`ticket_${ticketId}`).emit('typing', { senderType, isTyping });
      }
    });

    socket.on('message_status', async ({ ticketId, messageId, status }) => {
      if (ticketId && messageId) {
        if (status === 'seen') {
          try {
            await run('UPDATE ticket_messages SET is_read = 1 WHERE id = ?', [messageId]);
          } catch (err) {}
        }
        socket.to(`ticket_${ticketId}`).emit('message_status', { messageId, status });
      }
    });

    socket.on('request_initial_data', async (params: { asset: string, accountType: 'real' | 'demo', timeframe?: string, userId?: string }) => {
      const { asset, accountType, userId, timeframe } = params;
      
      // 1. Handle Room Subscriptions
      // Leave all previous market rooms to prevent data leakage and excessive bandwidth
      Array.from(socket.rooms).forEach(room => {
        if (room.startsWith('market_') || room === 'real' || room === 'demo') {
          socket.leave(room);
        }
      });
      
      // Join the new market room and the account type room
      socket.join(`market_${asset}_${accountType}`);
      socket.join(accountType);
      
      const tf = timeframe || "1 minute";
      const tfSecs = getTimeSeconds(tf);
      const history = accountType === 'real' ? history_real : history_demo;
      const currentCandles = accountType === 'real' ? currentCandles_real : currentCandles_demo;
      const pool = accountType === 'real' ? markets_real : markets_demo;

      const nowSecs = Math.floor(Date.now() / 1000);
      const bucketTime = nowSecs - (nowSecs % tfSecs);
      const decimals = getDecimalsForAsset(asset);
      const currentPrice = Number(pool[asset]?.price) || Number(markets[asset]?.price) || 100.00;

      if (!history[asset]) history[asset] = {};
      if (!currentCandles[asset]) currentCandles[asset] = {};

      // Retrieve existing completed candles for this asset and timeframe
      let rawHistory = Array.isArray(history[asset][tf]) ? history[asset][tf] : [];
      
      // Strictly filter to completed candles whose openTime is strictly before the current active bucket
      let completedCandles = rawHistory.filter((c: any) => {
        const cTime = Number(c.openTime || c.time || 0);
        return cTime > 0 && cTime < bucketTime;
      });

      // If we do not have at least 250 completed candles, generate seamlessly backwards from the oldest known candle
      if (completedCandles.length < 250) {
        const needed = 250 - completedCandles.length;
        const oldestCandle = completedCandles[0];
        const lastTime = oldestCandle ? Number(oldestCandle.openTime || oldestCandle.time) : bucketTime;
        const price = oldestCandle ? (Number(oldestCandle.open) || currentPrice) : currentPrice;

        const extraGenerated = generateHistoricalCandleSeries({
          asset,
          endClose: price,
          endTime: oldestCandle ? (lastTime - tfSecs) : (bucketTime - tfSecs),
          count: needed,
          tfSeconds: tfSecs,
          decimals
        });

        completedCandles = [...extraGenerated, ...completedCandles];
      }

      // Check if there is any time gap between the newest completed candle and the active bucket
      const newestCompleted = completedCandles[completedCandles.length - 1];
      if (newestCompleted) {
        const newestOpenTime = Number(newestCompleted.openTime || newestCompleted.time);
        if (newestOpenTime < bucketTime - tfSecs) {
          const gapCount = Math.min(80, Math.floor((bucketTime - (newestOpenTime + tfSecs)) / tfSecs));
          if (gapCount > 0) {
            const bridgeCandles = generateHistoricalCandleSeries({
              asset,
              endClose: currentPrice,
              endTime: bucketTime - tfSecs,
              count: gapCount,
              tfSeconds: tfSecs,
              decimals
            });
            completedCandles = [...completedCandles, ...bridgeCandles];
          }
        }
      }

      // Keep up to 2000 completed candles in server memory
      if (completedCandles.length > 2000) {
        completedCandles = completedCandles.slice(-2000);
      }
      history[asset][tf] = completedCandles;

      // Enforce 100% strict zero-gap mathematical continuity:
      // Each candle's open MUST equal the previous candle's close!
      let runningPrevClose = completedCandles.length > 0 ? (Number(completedCandles[0].open) || currentPrice) : currentPrice;
      const cleanCandles = completedCandles.map((c: any) => {
        const open = runningPrevClose;
        const close = parseFloat((Number(c.close) || open).toFixed(decimals));
        let high = parseFloat((Number(c.high) || Math.max(open, close)).toFixed(decimals));
        let low = parseFloat((Number(c.low) || Math.min(open, close)).toFixed(decimals));

        high = Math.max(high, open, close);
        low = Math.min(low, open, close);
        runningPrevClose = close;

        const cTime = Number(c.openTime || c.time);
        return {
          time: cTime,
          open: parseFloat(open.toFixed(decimals)),
          high: parseFloat(high.toFixed(decimals)),
          low: parseFloat(low.toFixed(decimals)),
          close: parseFloat(close.toFixed(decimals)),
          volume: Number(c.volume) || 10,
          openTime: cTime,
          closeTime: cTime + tfSecs
        };
      });

      // The live active candle for bucketTime:
      // Its open price MUST strictly be the close of the last completed candle!
      const lastCompletedClose = cleanCandles.length > 0 ? cleanCandles[cleanCandles.length - 1].close : currentPrice;
      
      let liveCandle = currentCandles[asset][tf];
      if (!liveCandle || liveCandle.openTime !== bucketTime) {
        liveCandle = {
          open: lastCompletedClose,
          high: Math.max(lastCompletedClose, currentPrice),
          low: Math.min(lastCompletedClose, currentPrice),
          close: currentPrice,
          volume: 10,
          openTime: bucketTime,
          closeTime: bucketTime + tfSecs
        };
        currentCandles[asset][tf] = liveCandle;
      } else {
        // Enforce continuity with the last completed candle
        liveCandle.open = lastCompletedClose;
        liveCandle.close = currentPrice;
        liveCandle.high = Math.max(liveCandle.high || currentPrice, lastCompletedClose, currentPrice);
        liveCandle.low = Math.min(liveCandle.low || currentPrice, lastCompletedClose, currentPrice);
      }

      const activeCandlePayload = {
        time: bucketTime,
        open: parseFloat(Number(liveCandle.open).toFixed(decimals)),
        high: parseFloat(Number(liveCandle.high).toFixed(decimals)),
        low: parseFloat(Number(liveCandle.low).toFixed(decimals)),
        close: parseFloat(Number(liveCandle.close).toFixed(decimals)),
        volume: liveCandle.volume || 10
      };

      socket.emit('initial_market_data', {
        markets: pool,
        systemActive,
        history: {
          [asset]: cleanCandles
        },
        currentCandles: {
          [asset]: activeCandlePayload
        },
        activities: [],
        serverTime: Date.now()
      });

      // If userId provided and authenticated, join room and send profile update
      if (userId || socket.data.userId) {
        const uid = userId || socket.data.userId;
        socket.data.userId = uid;
        socket.join(`user_${uid}`);
        const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
        if (user) {
          socket.emit('user_profile_update', mapUserForFrontend(user));
        }
      }
    });

    socket.on('request_past_candles', async (params: { asset: string, accountType: 'real' | 'demo', timeframe: string, beforeTime: number, limit?: number }) => {
      const { asset, accountType, timeframe, beforeTime, limit = 1000 } = params;
      try {
        const pool = accountType === 'real' ? history_real : history_demo;
        const liveMarkets = accountType === 'real' ? markets_real : markets_demo;
        const currentMarketPrice = (liveMarkets[asset] && liveMarkets[asset].price) 
          ? Number(liveMarkets[asset].price) 
          : (markets[asset]?.price || 100);

        const cryptoPairsToBinance: Record<string, string> = {
          'BTC/USD': 'BTCUSDT',
          'ETH/USD': 'ETHUSDT',
          'LTC/USD': 'LTCUSDT',
          'SOL/USD': 'SOLUSDT',
          'ADA/USD': 'ADAUSDT',
          'UNI/USD': 'UNIUSDT',
          'LINK/USD': 'LINKUSDT',
          'BCH/USD': 'BCHUSDT',
          'AVAX/USD': 'AVAXUSDT',
          'DOT/USD': 'DOTUSDT',
          'POL/USD': 'POLUSDT',
          'AAVE/USD': 'AAVEUSDT',
          'SHIB/USD': 'SHIBUSDT',
          'DOGE/USD': 'DOGEUSDT',
          'XRP/USD': 'XRPUSDT',
          'CAKE/USD': 'CAKEUSDT',
          'FET/USD': 'FETUSDT',
          'ICP/USD': 'ICPUSDT',
          'KSM/USD': 'KSMUSDT',
          'LPT/USD': 'LPTUSDT',
        };

        const binanceIntervalMap: Record<string, string> = {
          '1 minute': '1m',
          '5 minutes': '5m',
          '15 minutes': '15m',
          '30 minutes': '30m',
          '1 hour': '1h',
          '12 hours': '12h',
          '1 day': '1d'
        };

        const binanceSymbol = cryptoPairsToBinance[asset];
        const binanceInterval = binanceIntervalMap[timeframe];

        if (binanceSymbol && binanceInterval) {
          try {
            const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`;
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                const decimals = getDecimalsForAsset(asset);
                const candles = data.map((item: any) => {
                  const openTime = Math.floor(item[0] / 1000);
                  const closeTime = Math.floor(item[6] / 1000);
                  return {
                    time: openTime,
                    open: parseFloat(parseFloat(item[1]).toFixed(decimals)),
                    high: parseFloat(parseFloat(item[2]).toFixed(decimals)),
                    low: parseFloat(parseFloat(item[3]).toFixed(decimals)),
                    close: parseFloat(parseFloat(item[4]).toFixed(decimals)),
                    volume: parseFloat(item[5]) || 10,
                    openTime,
                    closeTime
                  };
                }).filter((c: any) => c.openTime < beforeTime);

                // Enforce mathematical gapless continuity
                let runningPastClose = candles.length > 0 ? candles[0].open : 0;
                const resultCandles = candles.map((c: any) => {
                  const open = runningPastClose > 0 ? runningPastClose : c.open;
                  const close = c.close;
                  const high = Math.max(c.high, open, close);
                  const low = Math.min(c.low, open, close);
                  runningPastClose = close;
                  return {
                    ...c,
                    open: parseFloat(open.toFixed(decimals)),
                    high: parseFloat(high.toFixed(decimals)),
                    low: parseFloat(low.toFixed(decimals)),
                    close: parseFloat(close.toFixed(decimals))
                  };
                });

                // Cache in the pool as well so we preserve it
                if (!pool[asset]) pool[asset] = {};
                pool[asset][timeframe] = resultCandles;

                socket.emit('past_candles_response', {
                  asset,
                  timeframe,
                  candles: resultCandles
                });
                return;
              }
            }
          } catch (binanceErr) {
            console.error(`Failed to fetch and process Binance candles for ${binanceSymbol}:`, binanceErr);
          }
        }

        // Clear cached simulated/stale history if it differs significantly (>3.5%) from the live market price
        if (pool[asset] && pool[asset][timeframe] && pool[asset][timeframe].length > 0) {
          const candles = pool[asset][timeframe];
          const latestCandle = candles[candles.length - 1];
          const latestClose = latestCandle.close || latestCandle.open || 0;
          if (latestClose > 0 && currentMarketPrice > 0) {
            const pctDiff = Math.abs(latestClose - currentMarketPrice) / currentMarketPrice;
            if (pctDiff > 0.035) {
              pool[asset][timeframe] = [];
            }
          }
        }

        const pairHistory = (pool[asset] && pool[asset][timeframe]) || [];
        
        // Filter candles where openTime < beforeTime, sorted desc (newest to oldest)
        const matchedCandles = pairHistory
          .filter((c: any) => c.openTime < beforeTime)
          .sort((a: any, b: any) => b.openTime - a.openTime);

        const decimals = getDecimalsForAsset(asset);
        let formattedRows = matchedCandles.map((r: any) => {
          const open = parseFloat(r.open) || 0;
          const close = parseFloat(r.close) || 0;
          let high = parseFloat(r.high) || Math.max(open, close);
          let low = parseFloat(r.low) || Math.min(open, close);

          // Ensure mathematical bounds
          high = Math.max(high, open, close);
          low = Math.min(low, open, close);

          return {
            time: r.openTime || r.time,
            open: parseFloat(open.toFixed(decimals)),
            high: parseFloat(high.toFixed(decimals)),
            low: parseFloat(low.toFixed(decimals)),
            close: parseFloat(close.toFixed(decimals)),
            volume: parseFloat(r.volume) || 10,
            openTime: r.openTime,
            closeTime: r.closeTime
          };
        });

        let generated: any[] = [];
        // If we didn't get enough candles, generate more synthetically with organic wave dynamics
        if (formattedRows.length < limit) {
           const needed = limit - formattedRows.length;
           const tfSecs = getTimeSeconds(timeframe);
           
           // Determine the starting point for backwards generation
           const oldestRow = formattedRows[formattedRows.length - 1];
           let lastTime = oldestRow ? (oldestRow.openTime - tfSecs) : (beforeTime - (beforeTime % tfSecs) - tfSecs);
           
           let lastClose = oldestRow ? oldestRow.open : currentMarketPrice;
           if (!oldestRow && pairHistory.length > 0) {
             let closestCandle = pairHistory[0];
             let minDiff = Math.abs(pairHistory[0].openTime - beforeTime);
             for (const c of pairHistory) {
               const diff = Math.abs(c.openTime - beforeTime);
               if (diff < minDiff) {
                 minDiff = diff;
                 closestCandle = c;
               }
             }
             lastClose = closestCandle.open || closestCandle.close || lastClose;
           }

           generated = generateHistoricalCandleSeries({
             asset,
             endClose: lastClose,
             endTime: lastTime,
             count: needed,
             tfSeconds: tfSecs,
             decimals
           });
        }

        // formattedRows is sorted desc (newest to oldest), generated is sorted asc (oldest to newest)
        const combinedAsc = [...generated, ...formattedRows.reverse()];

        // Enforce zero gap-up/gap-down continuity across time-ordered historical candles
        let runningPastClose = combinedAsc.length > 0 ? combinedAsc[0].open : 0;
        const resultCandles = combinedAsc.map((c: any) => {
          const open = runningPastClose > 0 ? runningPastClose : c.open;
          const close = c.close;
          const high = Math.max(c.high, open, close);
          const low = Math.min(c.low, open, close);
          runningPastClose = close;
          return {
            ...c,
            open: parseFloat(open.toFixed(decimals)),
            high: parseFloat(high.toFixed(decimals)),
            low: parseFloat(low.toFixed(decimals)),
            close: parseFloat(close.toFixed(decimals))
          };
        });

        // Save generated/fetched past candles back into server pool so history is preserved forever
        if (!pool[asset]) pool[asset] = {};
        const existingPool = pool[asset][timeframe] || [];
        const mergedMap = new Map();
        resultCandles.forEach((c: any) => mergedMap.set(c.openTime || c.time, c));
        existingPool.forEach((c: any) => mergedMap.set(c.openTime || c.time, c));
        pool[asset][timeframe] = Array.from(mergedMap.values()).sort((a: any, b: any) => (a.openTime || a.time) - (b.openTime || b.time));

        socket.emit('past_candles_response', {
          asset,
          timeframe,
          candles: resultCandles
        });
      } catch (err) {
        console.error('Failed to fetch past candles:', err);
        socket.emit('past_candles_response', {
          asset,
          timeframe,
          candles: [],
          error: 'Failed to fetch historical candles'
        });
      }
    });

    socket.on('disconnect', () => {
      activeConnections = Math.max(0, activeConnections - 1);
      console.log('Client disconnected:', socket.id, 'Total:', activeConnections);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
