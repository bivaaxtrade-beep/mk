import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Trophy, Users, Clock, DollarSign, ShieldCheck, Zap, Star, TrendingUp, Award, Timer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth, db, onSnapshot, doc } from '../firebase';
import { formatWithCurrency, convertToBase } from '../lib/currencies';

interface Participant {
  user_id: string;
  score: number;
  rank: number;
  display_name: string;
  email?: string;
  photo_url: string;
}

interface Prize {
  rank_from: number;
  rank_to: number;
  prize_amount: number;
  prize_type: string;
}

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
  status: 'scheduled' | 'active' | 'finished';
  is_locked: number;
  requirements: any;
  created_at: number;
  isJoined: boolean;
  participantsCount: number;
}

export const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
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
    fetchTournamentDetails();
  }, [id]);

  const fetchTournamentDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const uidQuery = auth.currentUser ? `?uid=${auth.currentUser.uid}` : '';
      const res = await fetch(`/api/tournaments/${id}${uidQuery}`);
      const data = await res.json();
      if (data.success) {
        setTournament(data.tournament);
        setLeaderboard(data.leaderboard || []);
        setPrizes(data.prizes || []);
      } else {
        toast.error('Failed to load tournament details');
        navigate('/tournaments');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!auth.currentUser) return toast.error('Please login first');
    if (!tournament) return;

    try {
      setJoining(true);
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/tournaments/${tournament.id}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Successfully joined the tournament!');
        fetchTournamentDetails();
      } else {
        toast.error(data.error || 'Failed to join');
      }
    } catch (err) {
      toast.error('Join request failed');
    } finally {
      setJoining(false);
    }
  };

  const formatTimeLeft = (targetTime: number) => {
    const diff = targetTime - currentTime;
    if (diff <= 0) return '00:00:00';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F2128] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!tournament) return null;

  const hasStarted = currentTime >= tournament.start_time;
  const isFinished = currentTime >= tournament.end_time;
  const isFull = tournament.max_players > 0 && tournament.participantsCount >= tournament.max_players;

  return (
    <div className="min-h-screen bg-[#1F2128] text-white flex flex-col font-sans pb-20">
      {/* Dynamic Banner Header */}
      <div className="relative h-[45vh] w-full shrink-0 overflow-hidden">
        <img src={tournament.banner_url} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2128] via-[#1F2128]/20 to-transparent"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Navigation */}
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => navigate('/tournaments')}
            className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-black/60 transition-all group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Floating Title Card */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
          <div className="max-w-5xl mx-auto">
             <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-[0.15em] rounded-lg">
                   {tournament.type}
                </span>
                <span className={`px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-lg`}>
                   {tournament.status.toUpperCase()}
                </span>
             </div>
             <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl mb-4">
                {tournament.title}
             </h1>
             <div className="flex flex-wrap gap-8">
                <div className="space-y-1">
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Prize Pool</p>
                   <p className="text-3xl font-black text-yellow-500 tracking-tight">
                      {formatWithCurrency(convertToBase(tournament.prize_pool, 'BDT'), userCurrency)}
                   </p>
                </div>
                <div className="space-y-1">
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Registration Fee</p>
                   <p className="text-3xl font-black text-white tracking-tight">
                      {tournament.entry_fee === 0 ? 'FREE' : formatWithCurrency(convertToBase(tournament.entry_fee, 'BDT'), userCurrency)}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto w-full px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details & Leaderboard */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#2A2D35] p-8 rounded-[40px] border border-white/5 shadow-2xl">
              <h3 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3 mb-6">
                <Star className="text-yellow-500" size={24} />
                Arena Briefing
              </h3>
              <p className="text-gray-400 leading-relaxed font-medium mb-8">
                {tournament.description || 'No detailed description provided for this arena event. Show your skills and climb the leaderboard to win massive prizes.'}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                   <Users className="text-indigo-400 mb-3" size={20} />
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Participants</p>
                   <p className="text-xl font-black text-white">{tournament.participantsCount} / {tournament.max_players || '∞'}</p>
                </div>
                <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                   <Zap className="text-emerald-400 mb-3" size={20} />
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Min. Players</p>
                   <p className="text-xl font-black text-white">{tournament.min_players}</p>
                </div>
                <div className="p-6 bg-black/20 rounded-3xl border border-white/5 col-span-2 md:col-span-1">
                   <Award className="text-yellow-400 mb-3" size={20} />
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Prize Type</p>
                   <p className="text-xl font-black text-white">Cash</p>
                </div>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="bg-[#2A2D35] p-8 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                  <TrendingUp className="text-emerald-500" size={24} />
                  Live Leaderboard
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-black uppercase tracking-widest">
                  Live
                </span>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 bg-black/20 rounded-3xl border border-dashed border-white/10">
                   <Trophy size={48} className="mx-auto mb-4 text-gray-700" />
                   <p className="text-gray-500 font-bold italic">The arena is waiting for gladiators to start the battle.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((p, i) => {
                    const rank = i + 1;
                    const prize = prizes.find(pz => rank >= pz.rank_from && rank <= pz.rank_to);
                    return (
                      <div key={p.user_id} className="flex items-center justify-between p-5 bg-black/20 rounded-3xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                         {rank <= 3 && (
                           <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                             rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-300' : 'bg-[#CD7F32]'
                           }`} />
                         )}
                         <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg italic shadow-lg ${
                              rank === 1 ? 'bg-yellow-500 text-black' : 
                              rank === 2 ? 'bg-gray-300 text-black' : 
                              rank === 3 ? 'bg-[#CD7F32] text-black' : 
                              'bg-white/5 text-gray-500'
                            }`}>
                               {rank}
                            </div>
                            <div>
                               <p className="text-sm font-black text-white uppercase italic tracking-tighter">
                                  {p.display_name || (p.email ? p.email.split('@')[0] : 'Trader')}
                               </p>
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                  Score: <span className="text-emerald-500">{p.score.toLocaleString()}</span>
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            {prize && (
                              <p className="text-lg font-black text-yellow-500 italic tracking-tighter">
                                 {formatWithCurrency(convertToBase(prize.prize_amount, 'BDT'), userCurrency)}
                              </p>
                            )}
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Pot. Winnings</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prizes Grid */}
            {prizes.length > 0 && (
              <div className="bg-[#2A2D35] p-8 rounded-[40px] border border-white/5 shadow-2xl">
                 <h3 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3 mb-8">
                    <Award className="text-yellow-500" size={24} />
                    Prize Distribution
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {prizes.sort((a,b) => a.rank_from - b.rank_from).map((p, i) => (
                     <div key={i} className="p-6 bg-black/20 rounded-3xl border border-white/5 flex flex-col items-center text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                           {p.rank_from === p.rank_to ? `Rank ${p.rank_from}` : `Ranks ${p.rank_from}-${p.rank_to}`}
                        </p>
                        <p className="text-2xl font-black text-white italic tracking-tighter">
                           {formatWithCurrency(convertToBase(p.prize_amount, 'BDT'), userCurrency)}
                        </p>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>

          {/* Right Column: Participation Card */}
          <div className="space-y-6">
            <div className="bg-[#2A2D35] p-8 rounded-[40px] border border-white/5 shadow-2xl sticky top-24">
              <div className="space-y-8">
                <div className="text-center pb-8 border-b border-white/5">
                   <div className="inline-flex p-4 bg-yellow-500/10 rounded-3xl mb-4 border border-yellow-500/10">
                      <Timer className="text-yellow-500" size={32} />
                   </div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                      {isFinished ? 'Arena Closed' : hasStarted ? 'Time Remaining' : 'Registration Ends In'}
                   </p>
                   <p className="text-4xl font-black text-white font-mono tracking-tighter italic">
                      {isFinished ? '00:00:00' : formatTimeLeft(hasStarted ? tournament.end_time : tournament.start_time)}
                   </p>
                </div>

                <div className="space-y-5">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Entry Fee</span>
                      <span className="text-lg font-black text-yellow-500 italic uppercase">
                         {tournament.entry_fee === 0 ? 'FREE' : formatWithCurrency(convertToBase(tournament.entry_fee, 'BDT'), userCurrency)}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Arena Capacity</span>
                      <span className="text-lg font-black text-white italic uppercase">
                         {tournament.max_players === 0 ? 'UNLIMITED' : tournament.max_players}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Gladiators</span>
                      <span className="text-lg font-black text-white italic uppercase">
                         {tournament.participantsCount}
                      </span>
                   </div>
                </div>

                <div className="pt-4">
                  {tournament.isJoined ? (
                    <div className="w-full py-5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/5 flex flex-col items-center gap-2">
                       <ShieldCheck size={24} />
                       Registration Confirmed
                    </div>
                  ) : isFinished ? (
                    <div className="w-full py-5 bg-gray-800 text-gray-500 rounded-3xl font-black text-[11px] uppercase tracking-widest border border-white/5 text-center">
                       Arena Battle Closed
                    </div>
                  ) : isFull ? (
                    <div className="w-full py-5 bg-gray-800 text-gray-500 rounded-3xl font-black text-[11px] uppercase tracking-widest border border-white/5 text-center">
                       Arena Capacity Reached
                    </div>
                  ) : (
                    <button 
                      onClick={handleJoin}
                      disabled={joining}
                      className="w-full py-6 bg-yellow-500 hover:bg-yellow-400 text-black rounded-3xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all active:scale-95 group"
                    >
                      {joining ? (
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                           <Trophy size={20} className="group-hover:rotate-12 transition-transform" />
                           Enter The Arena
                        </div>
                      )}
                    </button>
                  )}
                </div>

                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                   <p className="text-[9px] text-gray-500 font-bold text-center leading-relaxed">
                      By entering, you confirm you are 18+ and agree to the Arena Rules. Trading during tournaments carries risk. Fair play is strictly monitored.
                   </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
