import React, { useState, useEffect } from 'react';
import { HardDrive, RefreshCw, Clock, Shield, AlertTriangle, Check, Search, Download, Trash2, History } from 'lucide-react';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';

interface BackupRecord {
  id: string;
  timestamp: number;
  filename: string;
  size: number;
  status: 'success' | 'failed';
  tables_count: number;
  created_by: string;
}

export const AdminSnapshotView: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/snapshot/history', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBackups(data);
      } else if (data && Array.isArray(data.history)) {
        setBackups(data.history);
      } else if (data && Array.isArray(data.data)) {
        setBackups(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch backup history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleManualBackup = async () => {
    if (!confirm('Start full database backup? This may take a few moments.')) return;
    setTriggering(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/snapshot/trigger', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Backup completed successfully');
        fetchBackups();
      } else {
        toast.error(data.error || 'Backup failed');
      }
    } catch (err: any) {
      toast.error('Backup failed: ' + err.message);
    } finally {
      setTriggering(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm('CRITICAL WARNING: You are about to restore the database from a backup. This operation will merge or overwrite existing data. Are you absolutely sure?')) return;
    if (!confirm('FINAL CONFIRMATION: Are you REALLY sure you want to restore? This is irreversible.')) return;
    
    setRestoring(backupId);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/snapshot/restore', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Database restoration completed');
      } else {
        toast.error(data.error || 'Restoration failed');
      }
    } catch (err: any) {
      toast.error('Restoration failed: ' + err.message);
    } finally {
      setRestoring(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1a1a24]/40 p-8 rounded-[32px] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
            <Shield className="text-yellow-500" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Enterprise Backup Center</h2>
            <p className="text-gray-400 text-sm mt-1">Disaster recovery and safe deployment management.</p>
          </div>
        </div>
        <button 
          onClick={handleManualBackup}
          disabled={triggering}
          className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-yellow-500/10"
        >
          {triggering ? <RefreshCw className="animate-spin" size={20} /> : <HardDrive size={20} />}
          Backup Now
        </button>
      </div>

      {/* DR Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a24]/40 p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-blue-400" size={20} />
            <span className="font-bold text-sm text-gray-400 uppercase tracking-widest">Auto Schedule</span>
          </div>
          <div className="text-xl font-black text-white">Daily at 03:00 AM</div>
          <div className="text-[10px] text-gray-500 mt-2">Next backup in ~{Math.round((new Date().setHours(27, 0, 0, 0) - Date.now()) / (1000 * 60 * 60))} hours</div>
        </div>
        <div className="bg-[#1a1a24]/40 p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <History className="text-purple-400" size={20} />
            <span className="font-bold text-sm text-gray-400 uppercase tracking-widest">Retention Policy</span>
          </div>
          <div className="text-xl font-black text-white">30-Day Rotation</div>
          <div className="text-[10px] text-gray-500 mt-2">Auto-deletion of local dumps older than 30 days.</div>
        </div>
        <div className="bg-[#1a1a24]/40 p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Check className="text-green-400" size={20} />
            <span className="font-bold text-sm text-gray-400 uppercase tracking-widest">Last Success</span>
          </div>
          <div className="text-xl font-black text-white">
            {backups.find(b => b.status === 'success') 
              ? new Date(backups.find(b => b.status === 'success')!.timestamp).toLocaleDateString()
              : 'Never'
            }
          </div>
          <div className="text-[10px] text-gray-500 mt-2">Verified enterprise SQL integrity.</div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-[#0a0a0f] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-black tracking-widest uppercase">Backup History</h3>
          <button onClick={fetchBackups} className="text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">File & Size</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Tables</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-16 bg-white/5 rounded-lg m-2"></td>
                  </tr>
                ))
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic">No backup history found.</td>
                </tr>
              ) : backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-sm">{new Date(backup.timestamp).toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{backup.id}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-mono text-gray-300 truncate max-w-[200px]">{backup.filename}</div>
                    <div className="text-[10px] text-yellow-500 font-bold mt-1">{formatSize(backup.size)}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold">{backup.tables_count} Tables</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      backup.status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleRestore(backup.id)}
                        disabled={restoring === backup.id || backup.status === 'failed'}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center gap-2"
                       >
                         {restoring === backup.id ? <RefreshCw className="animate-spin" size={12} /> : <RefreshCcw size={12} />}
                         Restore
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[32px] flex items-start gap-6">
         <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="text-red-500" size={24} />
         </div>
         <div className="space-y-2">
            <h4 className="font-black uppercase tracking-widest text-red-500 text-sm">Security & Safety Warning</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Database restoration is a destructive operation. All current data that conflicts with the backup will be updated or ignored based on the backup logic. 
              Always verify that the backup timestamp is the one you intend to recover. 
              <strong> Live data is never automatically deleted by our sync engine.</strong>
            </p>
         </div>
      </div>
    </div>
  );
};

// Re-using icon from AdminDashboard scope if needed
const RefreshCcw = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);
