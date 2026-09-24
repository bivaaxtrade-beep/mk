import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Loader2, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth, db, onSnapshot, doc } from '../firebase';
import { formatWithCurrency, convertToBase } from '../lib/currencies';

interface Tournament {
  id: string;
  type: string;
  title: string;
  description: string;
  banner_url: string;
  prize_pool: number;
  entry_fee: number;
  min_players: number;
  max_players: number;
  start_time: number;
  end_time: number;
  status: string;
  is_locked: number;
  requirements: any;
  created_at: number;
  participantsCount: number;
  isJoined: boolean;
}

export const Tournaments: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [userCurrency, setUserCurrency] = useState(() => {
    try {
      return localStorage.getItem('user_display_currency') || 'BDT';
    } catch (e) {
      return 'BDT';
    }
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const userSub = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.currency) {
              setUserCurrency(data.currency);
              try {
                localStorage.setItem('user_display_currency', data.currency);
              } catch (e) {}
            }
          }
        });
        return () => userSub();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const uidQuery = auth.currentUser ? `?uid=${auth.currentUser.uid}` : '';
      const res = await fetch(`/api/tournaments${uidQuery}`);
      const data = await res.json();
      if (data.success) {
        setTournaments(data.tournaments);
      } else {
        toast.error('Failed to load tournaments');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while loading tournaments');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (targetTime: number) => {
    const diff = targetTime - currentTime;
    if (diff <= 0) return '00s';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
    if (hours > 0) return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="min-h-screen bg-[#1F2128] text-white flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center px-4 py-4 bg-[#2A2D35] sticky top-0 z-20 shadow-xl border-b border-white/5">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors mr-2">
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Tournaments</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 bg-[#2A2D35] p-10 rounded-3xl border border-white/5 shadow-2xl">
            <Trophy size={64} className="mx-auto mb-6 text-yellow-500/20" />
            <p className="text-lg font-bold">No active tournaments</p>
            <p className="text-sm opacity-50">Check back later for new events.</p>
          </div>
        ) : (
          tournaments.map((t) => {
            const hasStarted = currentTime >= t.start_time;
            const isFinished = currentTime >= t.end_time;
            const timeLabel = isFinished ? 'Finished' : hasStarted ? 'Until end' : 'Until start';
            const targetTime = isFinished ? 0 : hasStarted ? t.end_time : t.start_time;
            const isLocked = t.is_locked === 1;

            return (
              <div 
                key={t.id} 
                className={`group relative bg-[#2A2D35] rounded-[32px] overflow-hidden shadow-2xl border border-white/5 transition-all duration-300 ${isLocked ? 'opacity-90 grayscale-[0.3]' : 'hover:border-yellow-500/40 hover:-translate-y-1'}`}
                onClick={() => !isLocked && navigate(`/tournaments/${t.id}`)}
              >
                {/* Image Section */}
                <div className="relative h-56 w-full overflow-hidden">
                  <img src={t.banner_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A2D35] via-[#2A2D35]/20 to-black/40"></div>
                  
                  {/* Status Overlay */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                    <div className="space-y-2">
                       {t.title && <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-2xl tracking-tighter leading-none">{t.title}</h2>}
                       <div className="inline-flex bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-white border border-white/10 shadow-xl">
                         {timeLabel}: {isFinished ? 'Closed' : formatTimeLeft(targetTime)}
                       </div>
                    </div>

                    {isLocked && (
                      <div className="bg-black/60 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-2xl text-white">
                        <Lock size={22} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {hasStarted && !isFinished && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 overflow-hidden">
                       <div 
                         className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000 ease-linear" 
                         style={{ width: `${Math.min(100, ((currentTime - t.start_time) / (t.end_time - t.start_time)) * 100)}%` }}
                       ></div>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-6 md:p-8 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Prize fund</p>
                    <div className="flex items-center gap-3">
                      <p className="text-yellow-500 font-black text-3xl tracking-tighter">
                        {formatWithCurrency(convertToBase(t.prize_pool, 'BDT'), userCurrency)}
                      </p>
                      <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg border border-yellow-500/20 font-black uppercase tracking-widest">
                        {t.status === 'active' ? 'Live Only' : t.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button 
                    disabled={isLocked}
                    className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                      isLocked 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                      : 'bg-yellow-500 hover:bg-yellow-400 text-black active:scale-95 shadow-yellow-500/20'
                    }`}
                  >
                    Read more
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
