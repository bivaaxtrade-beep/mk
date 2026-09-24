import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  Trophy, Plus, Edit2, Trash2, Lock, Unlock, 
  Calendar, DollarSign, Users, Image as ImageIcon,
  Loader2, Save, X, ChevronRight, AlertCircle, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

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
}

export const AdminTournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Partial<Tournament> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch('/api/tournaments?admin=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTournaments(data.tournaments);
      }
    } catch (err) {
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (id: string) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch(`/api/admin/tournaments/${id}/toggle-lock`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTournaments(prev => prev.map(t => t.id === id ? { ...t, is_locked: data.is_locked } : t));
        toast.success(`Tournament ${data.is_locked ? 'locked' : 'unlocked'}`);
      }
    } catch (err) {
      toast.error('Failed to toggle lock');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tournament? This will also remove all participants and prizes.')) return;
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch(`/api/admin/tournaments/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTournaments(prev => prev.filter(t => t.id !== id));
        toast.success('Tournament deleted');
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament?.title || !selectedTournament?.start_time || !selectedTournament?.end_time) {
      return toast.error('Please fill required fields');
    }

    try {
      setSubmitting(true);
      const isNew = !selectedTournament.id;
      const url = isNew ? '/api/admin/tournaments' : `/api/admin/tournaments/${selectedTournament.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedTournament)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Tournament ${isNew ? 'created' : 'updated'} successfully`);
        setIsEditing(false);
        fetchTournaments();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreate = () => {
    const now = Date.now();
    setSelectedTournament({
      type: 'General',
      title: '',
      description: '',
      banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000',
      prize_pool: 100,
      entry_fee: 0,
      min_players: 1,
      max_players: 0,
      start_time: now + (24 * 60 * 60 * 1000),
      end_time: now + (48 * 60 * 60 * 1000),
      status: 'scheduled',
      is_locked: 0,
      requirements: {}
    });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFDD33]" />
        <p className="text-gray-400 font-bold animate-pulse">Loading tournaments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase italic">
            <Trophy className="text-yellow-500" />
            Tournament Management
          </h2>
          <p className="text-gray-400 text-sm font-medium">Create and manage trading competitions</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-[#FFDD33] hover:bg-[#F0C800] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-yellow-500/10 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Create New Tournament
        </button>
      </div>

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#2A2B31] w-full max-w-4xl rounded-[32px] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter italic">
                {selectedTournament?.id ? <Edit2 size={20} /> : <Plus size={20} />}
                {selectedTournament?.id ? 'Edit Tournament' : 'New Tournament'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Tournament Title *</label>
                    <input 
                      type="text" 
                      required
                      value={selectedTournament?.title || ''}
                      onChange={e => setSelectedTournament({ ...selectedTournament, title: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-yellow-500/50 transition-all font-bold outline-none"
                      placeholder="e.g. Weekend Trading Sprint"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Banner Image URL</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={selectedTournament?.banner_url || ''}
                        onChange={e => setSelectedTournament({ ...selectedTournament, banner_url: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:border-yellow-500/50 transition-all font-bold outline-none text-sm"
                      />
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Prize Pool ($)</label>
                      <input 
                        type="number" 
                        value={selectedTournament?.prize_pool || 0}
                        onChange={e => setSelectedTournament({ ...selectedTournament, prize_pool: Number(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Entry Fee ($)</label>
                      <input 
                        type="number" 
                        value={selectedTournament?.entry_fee || 0}
                        onChange={e => setSelectedTournament({ ...selectedTournament, entry_fee: Number(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
                    <textarea 
                      rows={4}
                      value={selectedTournament?.description || ''}
                      onChange={e => setSelectedTournament({ ...selectedTournament, description: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Right Column: Time & Status */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Tournament Type</label>
                    <select 
                      value={selectedTournament?.type || ''}
                      onChange={e => setSelectedTournament({ ...selectedTournament, type: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none appearance-none"
                    >
                      <option value="Daily Free">Daily Free</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Prestige">Prestige</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Start Time</label>
                    <input 
                      type="datetime-local" 
                      defaultValue={selectedTournament?.start_time ? format(new Date(selectedTournament.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={e => setSelectedTournament({ ...selectedTournament, start_time: new Date(e.target.value).getTime() })}
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">End Time</label>
                    <input 
                      type="datetime-local" 
                      defaultValue={selectedTournament?.end_time ? format(new Date(selectedTournament.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={e => setSelectedTournament({ ...selectedTournament, end_time: new Date(e.target.value).getTime() })}
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Max Players (0=unlimited)</label>
                      <input 
                        type="number" 
                        value={selectedTournament?.max_players || 0}
                        onChange={e => setSelectedTournament({ ...selectedTournament, max_players: Number(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Status</label>
                      <select 
                        value={selectedTournament?.status || 'scheduled'}
                        onChange={e => setSelectedTournament({ ...selectedTournament, status: e.target.value as any })}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none appearance-none"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="active">Active</option>
                        <option value="finished">Finished</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                    <div className="flex-1">
                       <p className="text-xs font-bold text-white mb-0.5 tracking-tight">Lock Tournament</p>
                       <p className="text-[10px] text-gray-500 font-medium">Prevent users from seeing or joining</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedTournament({ ...selectedTournament, is_locked: selectedTournament?.is_locked === 1 ? 0 : 1 })}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${selectedTournament?.is_locked === 1 ? 'bg-red-500' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${selectedTournament?.is_locked === 1 ? 'left-8' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-10 py-4 bg-[#FFDD33] hover:bg-[#F0C800] text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-yellow-500/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  {selectedTournament?.id ? 'Update Tournament' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tournament List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournaments.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#2A2B31] rounded-3xl border border-dashed border-white/10">
            <Trophy size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500 font-bold">No tournaments found. Create one to get started.</p>
          </div>
        ) : (
          tournaments.map(t => (
            <div 
              key={t.id} 
              className={`bg-[#2A2B31] rounded-[32px] overflow-hidden border transition-all duration-300 group ${t.is_locked ? 'border-red-500/30' : 'border-white/5 hover:border-white/10'}`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Left: Banner Image */}
                <div className="w-full sm:w-48 h-48 sm:h-auto relative shrink-0">
                  <img src={t.banner_url} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#2A2B31] hidden sm:block"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-lg ${
                      t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      t.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Right: Info & Actions */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                       <h4 className="text-lg font-black text-white tracking-tight uppercase italic">{t.title}</h4>
                       <div className="flex items-center gap-1">
                          {t.is_locked === 1 ? <Lock size={14} className="text-red-500" /> : <Unlock size={14} className="text-emerald-500" />}
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                       <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-yellow-500" />
                          <span className="text-xs font-bold text-white">${t.prize_pool}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Users size={14} className="text-gray-500" />
                          <span className="text-xs font-bold text-white">{t.max_players === 0 ? 'Unlimited' : t.max_players}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-500" />
                          <span className="text-[10px] font-medium text-gray-400">
                             {format(new Date(t.start_time), 'MMM d, HH:mm')}
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => { setSelectedTournament(t); setIsEditing(true); }}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleToggleLock(t.id)}
                      className={`p-2.5 rounded-xl transition-all ${t.is_locked === 1 ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                      title={t.is_locked === 1 ? 'Unlock' : 'Lock'}
                    >
                      {t.is_locked === 1 ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                    <div className="flex-1"></div>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all text-red-500/50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
